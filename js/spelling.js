// Schreib-Werkstatt: Wörter richtig schreiben. 5 Stufen, passt sich automatisch an.
// Stufe 1: fehlenden Buchstaben wählen (x oder ks?)
// Stufe 2: zwei Lücken füllen
// Stufe 3: Buchstaben in die richtige Reihenfolge legen (erster Buchstabe steht schon da)
// Stufe 4: Buchstaben legen, mit falschen Buchstaben dazwischen
// Stufe 5: ganzes Wort alleine schreiben (Tastatur, auf Groß und klein achten)
import { S, save } from './state.js';
import { sfx, speak } from './audio.js';
import { taskFrame, T, $, $$, shuffle, pick, wait, reward, say, praise, encourage, burstAt } from './ui.js';

// Wortlisten nach Thema. Weitere Themen aus der Schule können einfach dazukommen.
// w = Wort, e = Bild, s = Satz mit Lücke (___), key = die schwierige Stelle
export const SPELL_SETS = {
  x: {
    title: 'Ich spreche ks, aber schreibe x',
    key: 'x',
    distract: ['ks', 'gs', 'cks'],
    words: [
      { w: 'Taxi', e: '🚕', s: 'Das ___ fährt in die Stadt.' },
      { w: 'Nixe', e: '🧜‍♀️', s: 'Die ___ schwimmt im Meer.' },
      { w: 'Boxer', e: '🥊', s: 'Der ___ hat rote Handschuhe.' },
      { w: 'Lexikon', e: '📖', s: 'Im ___ steht viel über Pferde.' },
      { w: 'Mixer', e: '🥤', s: 'Mit dem ___ mache ich einen Saft.' },
      { w: 'Hexe', e: '🧙‍♀️', s: 'Die ___ fliegt auf dem Besen.' },
      { w: 'Box', e: '📦', s: 'In der ___ liegen Möhren.' },
      { w: 'Text', e: '📝', s: 'Ich lese einen ___ vor.' },
      { w: 'hexen', e: '🪄', s: 'Die Hexe kann ___.' },
      { w: 'mixen', e: '🍓', s: 'Wir ___ einen Erdbeer-Saft.' },
      { w: 'Axt', e: '🪓', s: 'Mit der ___ hackt man Holz.' },
      { w: 'boxen', e: '🥊', s: 'Die Kängurus ___ im Spaß.' },
    ],
  },
};

const LETTERS = 'abcdefghijklmnopqrstuvwxyzäöüß'.split('');
const SIMILAR = { a: 'eo', e: 'ai', i: 'eü', o: 'au', u: 'oü', b: 'pd', d: 'bt', t: 'dk', k: 'gt', g: 'kb', m: 'nw', n: 'mh', l: 'rn', r: 'ln', s: 'zß', h: 'nk', p: 'bq', w: 'vm', v: 'fw', f: 'vw', z: 'sc' };

const lvl = () => S.spellLevel || 1;

function track(firstTry) {
  S.stats.spellTotal = (S.stats.spellTotal || 0) + 1;
  if (firstTry) {
    S.stats.spellRight = (S.stats.spellRight || 0) + 1;
    S.spellStreak = (S.spellStreak || 0) + 1;
    S.spellMiss = 0;
    if (S.spellStreak >= 3 && lvl() < 5) { S.spellLevel = lvl() + 1; S.spellStreak = 0; }
  } else {
    S.spellStreak = 0;
    S.spellMiss = (S.spellMiss || 0) + 1;
    if (S.spellMiss >= 2 && lvl() > 1) { S.spellLevel = lvl() - 1; S.spellMiss = 0; }
  }
  save();
}

const isNoun = (w) => w[0] !== w[0].toLowerCase();

// ---------- Aufgaben bauen ----------
// Lücken-Aufgabe: Liste von Teilen, jedes Teil ist Text oder eine Lücke {answer, options}
function gapTask(word, set, gaps) {
  const lower = word.w;
  const xi = lower.toLowerCase().indexOf(set.key);
  const parts = [];
  const gapAt = new Map();
  gapAt.set(xi, { len: set.key.length, answer: set.key, options: shuffle([set.key, set.distract[0], pick(set.distract.slice(1))]) });
  if (gaps >= 2) {
    // eine zweite Lücke an einem anderen Buchstaben (nicht der erste)
    const cand = [...lower].map((c, i) => i).filter((i) => i !== 0 && (i < xi || i >= xi + set.key.length) && /[a-zäöü]/.test(lower[i]));
    if (cand.length) {
      const i = pick(cand);
      const ch = lower[i];
      const sim = (SIMILAR[ch] || 'aeo').split('').filter((c) => c !== ch);
      gapAt.set(i, { len: 1, answer: ch, options: shuffle([ch, ...shuffle(sim).slice(0, 2)]) });
    }
  }
  for (let i = 0; i < lower.length;) {
    const g = gapAt.get(i);
    if (g) { parts.push({ gap: true, ...g }); i += g.len; } else { parts.push({ text: lower[i] }); i++; }
  }
  return parts;
}

function tileTask(word, withDistractors) {
  const letters = [...word.w];
  const given = withDistractors ? 0 : 1;
  const pool = letters.slice(given).map((c) => c);
  if (withDistractors) {
    const extra = ['k', 's', pick(['g', 'c', 'e', 'a', 'n'])];
    pool.push(...extra.slice(0, 2));
  }
  return { letters, given, pool: shuffle(pool) };
}

// ---------- Spiel ----------
export function spellGame({ count = 5, title = 'Schreib-Werkstatt', set = 'x' } = {}, onDone) {
  const data = SPELL_SETS[set];
  const fr = taskFrame({ total: count, title, cls: 'spelling' });
  const list = shuffle(data.words).slice(0, count);
  let i = 0;
  let earned = 0;

  async function next(first, gained) {
    track(first);
    if (gained > 0) { earned += gained; reward(gained); }
    await wait(first ? 1500 : 1900);
    i++;
    if (i < count) show(); else onDone(earned);
  }

  function header(word) {
    const sentence = T(word.s.replace('___', '…'), { speak: false }).replace('…', '<span class="spell-blank">___</span>');
    return `
      <div class="spell-card">
        <div class="spell-pic">${word.e}</div>
        <div class="spell-side">
          <p class="spell-sentence">${sentence}</p>
          <button class="btn btn-small hear-btn">🔊 Wort anhören</button>
        </div>
      </div>`;
  }

  function show() {
    fr.progress(i);
    const word = list[i];
    const level = lvl();
    const sayWord = () => speak(word.w);
    if (level <= 2) gapRound(word, level, sayWord);
    else if (level <= 4) tileRound(word, level === 4, sayWord);
    else typeRound(word, sayWord);
  }

  // ----- Stufe 1–2: Lücken -----
  function gapRound(word, level, sayWord) {
    const parts = gapTask(word, data, level);
    let tries = 0;
    let busy = false;
    fr.area.innerHTML = `
      <p class="task-text">${T(level === 1 ? 'Welcher Buchstabe fehlt?' : 'Füll die Lücken!')}</p>
      ${header(word)}
      <div class="spell-word">${parts.map((p, k) => (p.gap ? `<span class="gap" data-k="${k}">?</span>` : `<span class="lt">${p.text}</span>`)).join('')}</div>
      <div class="choices spell-opts"></div>
      <div class="msg"></div>`;
    const msg = $('.msg', fr.area);
    const optsBox = $('.spell-opts', fr.area);
    $('.hear-btn', fr.area).addEventListener('click', () => { sfx.tap(); sayWord(); });
    const gaps = parts.map((p, k) => ({ ...p, k })).filter((p) => p.gap);
    let g = 0;

    function drawOpts() {
      $$('.gap', fr.area).forEach((el) => el.classList.toggle('now', +el.dataset.k === gaps[g]?.k));
      optsBox.innerHTML = gaps[g].options.map((o) => `<button class="choice word spell-opt" data-o="${o}">${o}</button>`).join('');
      $$('.spell-opt', optsBox).forEach((b) => b.addEventListener('click', () => pickOpt(b)));
    }
    async function pickOpt(b) {
      if (busy) return;
      const cur = gaps[g];
      if (b.dataset.o === cur.answer) {
        sfx.pop();
        const el = $(`.gap[data-k="${cur.k}"]`, fr.area);
        el.textContent = cur.answer;
        el.classList.add('filled');
        g++;
        if (g < gaps.length) { drawOpts(); return; }
        busy = true;
        optsBox.innerHTML = '';
        sfx.good();
        say(msg, `${praise()} *${word.w}*`, 'good');
        burstAt($('.spell-word', fr.area), ['✏️', '⭐', '✨'], 8);
        sayWord();
        await next(tries === 0, tries === 0 ? 2 : 1);
      } else {
        tries++;
        sfx.soft();
        b.classList.add('nope');
        b.disabled = true;
        if (cur.answer === data.key) say(msg, `${encourage()} Man hört *ks*, aber man schreibt …?`, 'hint');
        else say(msg, `${encourage()} Hör genau hin!`, 'hint');
        sayWord();
      }
    }
    drawOpts();
  }

  // ----- Stufe 3–4: Buchstaben legen -----
  function tileRound(word, hard, sayWord) {
    const t = tileTask(word, hard);
    let pos = t.given;
    let tries = 0;
    let busy = false;
    fr.area.innerHTML = `
      <p class="task-text">${T(hard ? 'Leg das Wort! Achtung: Es sind auch falsche Buchstaben dabei.' : 'Leg die Buchstaben in die richtige Reihenfolge!')}</p>
      ${header(word)}
      <div class="spell-word slots">${t.letters.map((c, k) => `<span class="slot-l ${k < t.given ? 'filled' : ''}" data-k="${k}">${k < t.given ? c : ''}</span>`).join('')}</div>
      <div class="tiles">${t.pool.map((c, k) => `<button class="tile" data-c="${c}" data-k="${k}">${c}</button>`).join('')}</div>
      <div class="msg"></div>`;
    const msg = $('.msg', fr.area);
    $('.hear-btn', fr.area).addEventListener('click', () => { sfx.tap(); sayWord(); });
    $$('.slot-l', fr.area)[pos]?.classList.add('now');
    $$('.tile', fr.area).forEach((b) => b.addEventListener('click', async () => {
      if (busy || b.classList.contains('used')) return;
      const want = t.letters[pos];
      if (b.dataset.c === want) {
        sfx.pop();
        b.classList.add('used');
        const slot = $(`.slot-l[data-k="${pos}"]`, fr.area);
        slot.textContent = want;
        slot.classList.remove('now');
        slot.classList.add('filled');
        pos++;
        $$('.tile', fr.area).forEach((x) => x.classList.remove('hint-glow'));
        say(msg, '');
        if (pos < t.letters.length) { $(`.slot-l[data-k="${pos}"]`, fr.area).classList.add('now'); return; }
        busy = true;
        sfx.good();
        say(msg, `${praise()} *${word.w}*`, 'good');
        burstAt($('.spell-word', fr.area), ['✏️', '⭐', '✨'], 8);
        sayWord();
        await next(tries === 0, tries === 0 ? 2 : 1);
      } else {
        tries++;
        sfx.soft();
        b.classList.add('nope');
        setTimeout(() => b.classList.remove('nope'), 450);
        if (tries >= 2) {
          const right = $$('.tile', fr.area).find((x) => !x.classList.contains('used') && x.dataset.c === want);
          right?.classList.add('hint-glow');
          say(msg, 'Schau, dieser Buchstabe kommt jetzt.', 'hint');
        } else {
          say(msg, `${encourage()} Sprich das Wort langsam mit.`, 'hint');
          sayWord();
        }
      }
    }));
  }

  // ----- Stufe 5: ganz alleine schreiben -----
  function typeRound(word, sayWord) {
    let typed = '';
    let shift = isNoun(word.w); // Nomen: der erste Buchstabe startet groß, als kleine Hilfe
    let tries = 0;
    let busy = false;
    fr.area.innerHTML = `
      <p class="task-text">${T('Schreib das Wort ganz alleine!')}</p>
      ${header(word)}
      <div class="spell-word typed"><span class="typed-text"></span><span class="caret"></span></div>
      <div class="kbd">
        ${LETTERS.map((c) => `<button class="key" data-c="${c}">${c}</button>`).join('')}
        <button class="key wide shift">⇧ Groß</button>
        <button class="key wide back">⌫</button>
        <button class="key wide ok">✓ Fertig</button>
      </div>
      <div class="msg"></div>`;
    const msg = $('.msg', fr.area);
    const out = $('.typed-text', fr.area);
    const shiftBtn = $('.shift', fr.area);
    $('.hear-btn', fr.area).addEventListener('click', () => { sfx.tap(); sayWord(); });
    const draw = () => {
      out.textContent = typed;
      shiftBtn.classList.toggle('on', shift);
      $$('.key[data-c]', fr.area).forEach((k) => { k.textContent = shift ? k.dataset.c.toUpperCase() : k.dataset.c; });
    };
    $$('.key[data-c]', fr.area).forEach((k) => k.addEventListener('click', () => {
      if (busy || typed.length >= 14) return;
      sfx.tap();
      typed += shift ? k.dataset.c.toUpperCase() : k.dataset.c;
      shift = false;
      out.parentElement.classList.remove('wrong');
      draw();
    }));
    shiftBtn.addEventListener('click', () => { sfx.tap(); shift = !shift; draw(); });
    $('.back', fr.area).addEventListener('click', () => { if (busy) return; sfx.tap(); typed = typed.slice(0, -1); draw(); });
    $('.ok', fr.area).addEventListener('click', async () => {
      if (busy || !typed) return;
      if (typed === word.w) {
        busy = true;
        sfx.good();
        out.parentElement.classList.add('right');
        say(msg, `${praise()} Ganz alleine richtig geschrieben!`, 'good');
        burstAt(out, ['✏️', '⭐', '🏆', '✨'], 10);
        sayWord();
        await next(tries === 0, tries === 0 ? 3 : 1);
        return;
      }
      tries++;
      sfx.soft();
      out.parentElement.classList.add('wrong');
      if (typed.toLowerCase() === word.w.toLowerCase()) {
        say(msg, isNoun(word.w) ? 'Fast! Das ist ein Nomen. Nomen schreibt man *groß*.' : 'Fast! Das ist ein Tuwort. Das schreibt man *klein*.', 'hint');
      } else if (tries >= 2) {
        busy = true;
        // Lösung zeigen: richtige Buchstaben grün, falsche rot
        let j = 0;
        out.innerHTML = [...word.w].map((c) => {
          const f = typed.indexOf(c, j);
          const ok = f >= 0;
          if (ok) j = f + 1;
          return `<span class="${ok ? 'ok-l' : 'bad-l'}">${c}</span>`;
        }).join('');
        say(msg, `So schreibt man es: *${word.w}*`, 'hint');
        sayWord();
        await next(false, 0);
        return;
      } else {
        const okUntil = [...typed].findIndex((c, k) => c !== word.w[k]);
        say(msg, okUntil > 0 ? `Der Anfang *${word.w.slice(0, okUntil)}* stimmt schon! Schau noch mal genau.` : `${encourage()} Hör noch mal genau hin.`, 'hint');
        sayWord();
      }
    });
    draw();
  }

  show();
}
