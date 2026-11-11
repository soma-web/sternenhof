// Mathe: Plus und Minus bis 100, passt sich automatisch an.
import { S, save } from './state.js';
import { sfx } from './audio.js';
import { myHorse } from './horse.js';
import { taskFrame, T, $, $$, rand, pick, shuffle, wait, reward, say, praise, encourage, burstAt, fill } from './ui.js';

// ---------- Aufgaben erzeugen ----------
export function makeTask(level = S.mathLevel) {
  const plus = Math.random() < 0.5;
  let a; let b;
  switch (level) {
    case 1: // bis 20
      if (plus) { a = rand(2, 10); b = rand(1, Math.min(10, 20 - a)); } else { a = rand(6, 20); b = rand(1, Math.min(10, a - 1)); }
      break;
    case 2: // glatte Zehner bis 100 oder bis 20 mit Übergang
      if (Math.random() < 0.5) {
        if (plus) { a = rand(1, 8) * 10; b = rand(1, 10 - a / 10) * 10; } else { a = rand(2, 10) * 10; b = rand(1, a / 10 - 1) * 10; }
      } else if (plus) { a = rand(5, 9); b = rand(10 - a, 9); } else { a = rand(11, 18); b = rand(a - 9, 9); }
      break;
    case 3: // Zehner + Einer ohne Übergang, bis 100
      a = rand(1, 9) * 10 + rand(1, 8);
      if (plus) { b = rand(1, 9 - (a % 10)); } else { b = rand(1, a % 10); }
      break;
    case 4: // mit Zehnerübergang
      if (plus) { do { a = rand(11, 89); } while (a % 10 < 2); b = rand(10 - (a % 10), 9); if (a + b > 100) b = 100 - a; } else { do { a = rand(12, 99); } while (a % 10 > 7); b = rand((a % 10) + 1, 9); }
      break;
    default: // zweistellig bis 100
      if (plus) { a = rand(11, 78); b = rand(10, 100 - a); } else { a = rand(25, 99); b = rand(11, a - 5); }
  }
  const op = plus ? '+' : '−';
  const res = plus ? a + b : a - b;
  // Ab Stufe 3 manchmal Platzhalter-Aufgaben: 23 + __ = 28
  const gap = level >= 3 && Math.random() < 0.25;
  return { a, b, op, res, gap, answer: gap ? b : res };
}

export function choicesFor(task) {
  const ans = task.answer;
  const set = new Set([ans]);
  const cands = shuffle([ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2]).filter((n) => n >= 0 && n <= 110);
  for (const c of cands) { if (set.size >= 3) break; set.add(c); }
  return shuffle([...set]);
}

function eqHTML(t, boxContent = '') {
  const box = `<span class="ans-box">${boxContent}</span>`;
  return t.gap
    ? `<span>${t.a}</span><span class="op">${t.op}</span>${box}<span class="op">=</span><span>${t.res}</span>`
    : `<span>${t.a}</span><span class="op">${t.op}</span><span>${t.b}</span><span class="op">=</span>${box}`;
}

// Zehnerfelder mit Karotten als Rechenhilfe
function tenFrames(t, emoji = '🥕') {
  const plus = t.op === '+';
  const total = plus ? t.a + t.b : t.a;
  const frames = Math.ceil(total / 10);
  let html = '';
  for (let f = 0; f < frames; f++) {
    // Volle Zehner, die sich nicht ändern, kompakt als Zehnerstange (bei großen Zahlen)
    const keep = plus ? t.a : t.a - t.b;
    if (total > 30 && (f + 1) * 10 <= keep) { html += `<div class="frame ten-bar"><span class="ten-bar-in">${emoji} 10</span></div>`; continue; }
    let cells = '';
    for (let k = 0; k < 10; k++) {
      const n = f * 10 + k; // 0-basiert
      let cls = 'cell';
      if (n < total) {
        if (plus && n >= t.a) cls += ' new';
        else if (!plus && n >= t.a - t.b) cls += ' gone';
        cells += `<span class="${cls}">${emoji}</span>`;
      } else cells += '<span class="cell empty"></span>';
    }
    html += `<div class="frame">${cells}</div>`;
  }
  const label = plus ? `${t.a} und ${t.b} dazu` : `${t.a}, davon ${t.b} weg`;
  return `<div class="frames">${html}</div><div class="frames-label">${label}</div>`;
}

const FEED_TEXT = {
  '+': [
    'Im Eimer sind {a} Karotten. Du legst {b} dazu.',
    '{horse} hat {a} Äpfel. Tante Rosi bringt noch {b}.',
    'Im Stall sind {a} Heuballen. Es kommen {b} dazu.',
  ],
  '−': [
    'Im Eimer sind {a} Karotten. {horse} frisst {b}.',
    'Auf dem Tisch liegen {a} Äpfel. Funke klaut {b}!',
    'Im Stall sind {a} Heuballen. {b} kommen auf die Weide.',
  ],
};

const GAP_TEXT = {
  '+': 'Im Eimer sind {a} Karotten. Es sollen {res} sein. Wie viele fehlen?',
  '−': 'Im Eimer waren {a} Karotten. Jetzt sind es nur noch {res}. Wie viele hat {horse} gefressen?',
};

export function trackResult(firstTry) {
  S.stats.mathTotal++;
  if (firstTry) {
    S.stats.mathRight++;
    S.mathStreak++;
    S.mathMiss = 0;
    if (S.mathStreak >= 4 && S.mathLevel < 5) { S.mathLevel++; S.mathStreak = 0; }
  } else {
    S.mathStreak = 0;
    S.mathMiss++;
    if (S.mathMiss >= 2 && S.mathLevel > 1) { S.mathLevel--; S.mathMiss = 0; }
  }
  save();
}

// ---------- Futter-Spiel: Eingabe mit Zahlentasten ----------
const THEMES = {
  pilze: {
    emoji: '🍄',
    '+': ['Im Korb sind {a} Pilze. Ihr findet noch {b}.', 'Unter dem Baum stehen {a} Pilze. Daneben wachsen {b}.'],
    '−': ['Im Korb sind {a} Pilze. {b} fallen heraus.', 'Am Weg stehen {a} Pilze. Ein Reh frisst {b}.'],
    gap: {
      '+': 'Im Korb sind {a} Pilze. Es sollen {res} sein. Wie viele fehlen?',
      '−': 'Im Korb waren {a} Pilze. Jetzt sind es nur noch {res}. Wie viele sind weg?',
    },
  },
};

export function feedGame({ count = 5, title = 'Füttern', theme = null } = {}, onDone) {
  const th = THEMES[theme];
  const emoji = th ? th.emoji : '🥕';
  const fr = taskFrame({ total: count, title, cls: 'math feed' });
  let i = 0;
  let earned = 0;

  function show() {
    fr.progress(i);
    const t = makeTask();
    const text = (t.gap ? (th ? th.gap : GAP_TEXT)[t.op] : pick((th || FEED_TEXT)[t.op])).replace('{a}', t.a).replace('{b}', t.b).replace('{res}', t.res);
    let input = '';
    let tries = 0;
    let busy = false;
    fr.area.innerHTML = `
      <div class="feed-top">
        <div class="mini-horse">${myHorse(S)}</div>
        <p class="task-text">${T(text)}</p>
      </div>
      <div class="equation">${eqHTML(t)}</div>
      <div class="hint-area"></div>
      <div class="msg"></div>
      <div class="numpad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="key" data-k="${n}">${n}</button>`).join('')}
        <button class="key key-del" data-k="del" aria-label="Löschen">⌫</button>
        <button class="key" data-k="0">0</button>
        <button class="key key-ok" data-k="ok" aria-label="Fertig">✔</button>
      </div>
      <button class="btn btn-small help-btn">💡 Hilfe</button>`;
    const box = $('.ans-box', fr.area);
    const msg = $('.msg', fr.area);
    const hint = $('.hint-area', fr.area);
    const helpBtn = $('.help-btn', fr.area);
    const showHint = () => {
      hint.innerHTML = `${tenFrames(t, emoji)}<button class="hint-close" aria-label="Hilfe schließen">✕</button>`;
      hint.classList.add('open');
      helpBtn.textContent = '✕ Hilfe zu';
      $('.hint-close', hint).addEventListener('click', () => { sfx.tap(); hideHint(); });
    };
    const hideHint = () => { hint.classList.remove('open'); hint.innerHTML = ''; helpBtn.textContent = '💡 Hilfe'; };
    helpBtn.addEventListener('click', () => { sfx.tap(); if (hint.classList.contains('open')) hideHint(); else showHint(); });

    async function check() {
      if (!input || busy) return;
      const val = parseInt(input, 10);
      if (val === t.answer) {
        busy = true;
        box.classList.add('right');
        sfx.good();
        say(msg, praise(), 'good');
        const horse = $('.mini-horse svg', fr.area);
        horse?.classList.add('happy');
        burstAt(box, [emoji, '✨', '💖'], 6);
        const n = tries === 0 ? 2 : 1;
        earned += n;
        reward(n);
        trackResult(tries === 0);
        await wait(1300);
        i++;
        if (i < count) show(); else onDone(earned);
      } else {
        tries++;
        sfx.soft();
        box.classList.remove('wrong'); void box.offsetWidth; box.classList.add('wrong');
        showHint();
        if (tries >= 2) {
          busy = true;
          box.textContent = t.answer;
          box.classList.add('solution');
          say(msg, `Das Ergebnis ist ${t.answer}. Beim nächsten Mal klappt es!`, 'hint');
          trackResult(false);
          await wait(2600);
          i++;
          if (i < count) show(); else onDone(earned);
        } else {
          say(msg, `${encourage()} Die Karotten helfen dir.`, 'hint');
          input = '';
          setTimeout(() => { if (!busy) box.textContent = ''; }, 500);
        }
      }
    }

    $$('.key', fr.area).forEach((k) => k.addEventListener('click', () => {
      if (busy) return;
      sfx.tap();
      const v = k.dataset.k;
      if (v === 'del') input = input.slice(0, -1);
      else if (v === 'ok') return check();
      else if (input.length < 3) input += v;
      box.textContent = input;
      box.classList.remove('wrong');
    }));
  }
  show();
}

// ---------- Springparcours: richtige Stange antippen ----------
const JUMP_TEXT = {
  hurdles: 'Spring über die Stange mit der richtigen Zahl!',
  stones: 'Spring auf den Stein mit der richtigen Zahl!',
  boat: 'Rudere zur Boje mit der richtigen Zahl!',
};

export function jumpGame({ count = 5, title = 'Parcours', gear = true, theme = 'hurdles' } = {}, onDone) {
  const fr = taskFrame({ total: count, title, cls: `math jump theme-${theme}` });
  let i = 0;
  let earned = 0;
  const colors = ['#FF6B6B', '#4D96FF', '#FFC93C'];

  function show() {
    fr.progress(i);
    const t = makeTask();
    const opts = choicesFor(t);
    let tries = 0;
    let busy = false;
    fr.area.innerHTML = `
      <p class="task-text">${T(JUMP_TEXT[theme])}</p>
      <div class="equation">${eqHTML(t, '?')}</div>
      <div class="arena">
        <div class="runner">${myHorse(S, { gear: gear ? { pad: true, saddle: true, girth: true, bridle: true } : {} })}${theme === 'boat' ? '<div class="hull"></div>' : ''}</div>
        <div class="hurdles">${opts.map((n, k) => `
          <button class="hurdle" data-n="${n}" style="--c:${colors[k]}">
            <span class="board">${n}</span>
            <span class="poles"><span class="post"></span><span class="pole"></span><span class="pole p2"></span><span class="post"></span></span>
          </button>`).join('')}</div>
      </div>
      <div class="msg"></div>`;
    const msg = $('.msg', fr.area);
    const runner = $('.runner', fr.area);
    const box = $('.ans-box', fr.area);

    async function finishTask(right) {
      busy = true;
      runner.classList.add('jumping');
      sfx.jump();
      await wait(1100);
      i++;
      if (i < count) show(); else onDone(earned);
    }

    $$('.hurdle', fr.area).forEach((h) => h.addEventListener('click', async () => {
      if (busy) return;
      const n = parseInt(h.dataset.n, 10);
      if (n === t.answer) {
        h.classList.add('right');
        box.textContent = n;
        box.classList.add('right');
        sfx.good();
        say(msg, praise(), 'good');
        burstAt(h, ['⭐', '✨'], 6);
        const r = tries === 0 ? 2 : 1;
        earned += r;
        reward(r);
        trackResult(tries === 0);
        await wait(500);
        finishTask(true);
      } else {
        tries++;
        sfx.soft();
        h.classList.add('nope');
        h.disabled = true;
        runner.classList.remove('refuse'); void runner.offsetWidth; runner.classList.add('refuse');
        if (tries >= 2) {
          const right = $(`.hurdle[data-n="${t.answer}"]`, fr.area);
          right.classList.add('right');
          box.textContent = t.answer;
          say(msg, `Hoppla! Richtig ist ${t.answer}.`, 'hint');
          trackResult(false);
          await wait(1600);
          finishTask(false);
        } else {
          say(msg, fill('Hoppla, {horse} bleibt stehen. Versuch eine andere Stange!'), 'hint');
        }
      }
    }));
  }
  show();
}
