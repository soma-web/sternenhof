// Abenteuer-Spiele: Hufspuren (Zahlenstrahl), Eulen-Rätsel, Silben-Brücke
import { S } from './state.js';
import { sfx, speak } from './audio.js';
import { syllabify } from './syllables.js';
import { makeTask, trackResult } from './math.js';
import { WORDS, trackRead } from './reading.js';
import { taskFrame, T, $, $$, rand, pick, shuffle, wait, reward, say, praise, encourage, burstAt } from './ui.js';

// ---------- Hufspuren: auf dem Zahlenstrahl weiterlaufen ----------
function trackTask() {
  for (let i = 0; i < 30; i++) {
    const t = makeTask();
    if (!t.gap && t.b >= 2 && t.b <= 9) return t;
  }
  const plus = Math.random() < 0.5;
  const a = rand(10, 40);
  const b = rand(2, 8);
  return { a, b, op: plus ? '+' : '−', res: plus ? a + b : a - b, gap: false, answer: plus ? a + b : a - b };
}

export function tracksGame({ count = 5, title = 'Hufspuren', runner = 'Funke', pron = 'er', icon = '🐴', print = '🐾' } = {}, onDone) {
  const fr = taskFrame({ total: count, title, cls: 'tracks' });
  let i = 0;
  let earned = 0;

  function show() {
    fr.progress(i);
    const t = trackTask();
    const plus = t.op === '+';
    const lo = Math.max(0, Math.min(t.a, t.res) - 2);
    const hi = Math.max(t.a, t.res) + 2;
    const nums = [];
    for (let n = lo; n <= hi; n++) nums.push(n);
    let tries = 0;
    let busy = false;
    fr.area.innerHTML = `
      <p class="task-text">${T(`${runner} war bei *${t.a}*. Dann ist ${pron} ${t.b} Schritte ${plus ? 'weiter' : 'zurück'} gelaufen. Wo ist ${pron} jetzt?`)}</p>
      <div class="equation small-eq"><span>${t.a}</span><span class="op">${t.op}</span><span>${t.b}</span><span class="op">=</span><span class="ans-box">?</span></div>
      <div class="trail">${nums.map((n) => `<button class="hoof-tile ${n === t.a ? 'start' : ''}" data-n="${n}"><span class="hoof-print">${n === t.a ? icon : print}</span><span class="hoof-num">${n}</span></button>`).join('')}</div>
      <div class="msg"></div>`;
    const msg = $('.msg', fr.area);
    const box = $('.ans-box', fr.area);

    async function walk() {
      const dir = plus ? 1 : -1;
      for (let k = 1; k <= t.b; k++) {
        const tile = $(`.hoof-tile[data-n="${t.a + dir * k}"]`, fr.area);
        tile?.classList.add('stepped');
        sfx.tap();
        await wait(160);
      }
    }

    $$('.hoof-tile', fr.area).forEach((b) => b.addEventListener('click', async () => {
      if (busy) return;
      const n = +b.dataset.n;
      if (n === t.answer) {
        busy = true;
        box.textContent = n;
        box.classList.add('right');
        sfx.good();
        await walk();
        b.classList.add('right');
        b.querySelector('.hoof-print').textContent = icon;
        say(msg, praise(), 'good');
        burstAt(b, ['⭐', '✨', '🐾'], 6);
        const r = tries === 0 ? 2 : 1;
        earned += r;
        reward(r);
        trackResult(tries === 0);
        await wait(1300);
        i++;
        if (i < count) show(); else onDone(earned);
      } else {
        tries++;
        sfx.soft();
        b.classList.add('nope');
        if (tries >= 2) {
          busy = true;
          await walk();
          $(`.hoof-tile[data-n="${t.answer}"]`, fr.area).classList.add('right');
          box.textContent = t.answer;
          say(msg, `Schau: ${runner} ist bei ${t.answer}.`, 'hint');
          trackResult(false);
          await wait(2200);
          i++;
          if (i < count) show(); else onDone(earned);
        } else {
          say(msg, `${encourage()} Zähl die Schritte ab ${t.a}.`, 'hint');
        }
      }
    }));
  }
  show();
}

// ---------- Eulen-Rätsel ----------
const RIDDLES = [
  ['Ich bin rund und rot. Ich wachse am Baum.', 'Apfel'],
  ['Ich bin lang und orange. Pferde lieben mich.', 'Karotte'],
  ['Ich scheine am Tag. Ich bin warm und gelb.', 'Sonne'],
  ['Ich scheine in der Nacht. Manchmal bin ich ganz rund.', 'Mond'],
  ['Ich habe Stacheln. Im Winter schlafe ich.', 'Igel'],
  ['Ich sage Muh. Ich gebe Milch.', 'Kuh'],
  ['Ich bin grün. Ich quake und springe.', 'Frosch'],
  ['Ich trage mein Haus auf dem Rücken.', 'Schnecke'],
  ['Ich summe und mache Honig.', 'Biene'],
  ['Ich habe lange Ohren. Ich hoppele gern.', 'Hase'],
  ['Ich bin weiß und weich. Ich sage Mäh.', 'Schaf'],
  ['Ich schwimme im Wasser. Ich habe Flossen.', 'Fisch'],
  ['Ich bin klein und grau. Ich piepse.', 'Maus'],
  ['Ich wachse im Wald. Ich habe einen Hut.', 'Pilz'],
  ['Ich fahre auf Schienen. Ich mache tut tut.', 'Zug'],
  ['Ich bin gelb und habe Löcher. Mäuse mögen mich.', 'Käse'],
  ['Ich habe Federn und lege Eier. Ich sage gack gack.', 'Huhn'],
  ['Ich bin weiß und schwebe am Himmel.', 'Wolke'],
];

export function riddleGame({ count = 5, title = 'Rätsel der Eule' } = {}, onDone) {
  const fr = taskFrame({ total: count, title, cls: 'reading riddles' });
  const list = shuffle(RIDDLES).slice(0, count);
  let i = 0;
  let earned = 0;

  function show() {
    fr.progress(i);
    const [text, answer] = list[i];
    const right = WORDS.find((w) => w[0] === answer);
    const others = shuffle(WORDS.filter((w) => w[0] !== answer)).slice(0, 2);
    const opts = shuffle([right, ...others]);
    let tries = 0;
    let busy = false;
    fr.area.innerHTML = `
      <div class="riddle">
        <div class="riddle-owl">🦉</div>
        <p class="riddle-text">${T(text)}</p>
        <p class="riddle-q">${T('Was bin ich?')}</p>
      </div>
      <div class="choices pics">${opts.map(([w, p]) => `<button class="choice pic" data-w="${w}">${p}</button>`).join('')}</div>
      <div class="msg"></div>
      <button class="btn btn-small help-btn hidden">🔊 Vorlesen</button>`;
    const msg = $('.msg', fr.area);
    const help = $('.help-btn', fr.area);
    help.addEventListener('click', () => { sfx.tap(); speak(text); });
    $$('.choice', fr.area).forEach((b) => b.addEventListener('click', async () => {
      if (busy) return;
      if (b.dataset.w === answer) {
        busy = true;
        b.classList.add('right');
        sfx.good();
        say(msg, `${praise()} Es ist: *${answer}*`, 'good');
        burstAt(b, ['⭐', '✨', '🦉'], 6);
        trackRead(tries === 0);
        const r = tries === 0 ? 2 : 1;
        earned += r;
        reward(r);
        await wait(1500);
        i++;
        if (i < count) show(); else onDone(earned);
      } else {
        tries++;
        sfx.soft();
        b.classList.add('nope');
        b.disabled = true;
        help.classList.remove('hidden');
        if (tries >= 2) {
          busy = true;
          $(`.choice[data-w="${answer}"]`, fr.area).classList.add('right');
          say(msg, `Es ist: *${answer}*`, 'hint');
          trackRead(false);
          await wait(2200);
          i++;
          if (i < count) show(); else onDone(earned);
        } else {
          say(msg, 'Huhu! Lies noch einmal genau.', 'hint');
        }
      }
    }));
  }
  show();
}

// ---------- Silben-Brücke: Wort aus Silben-Steinen bauen ----------
export function syllableBridge({ count = 5, title = 'Silben-Brücke' } = {}, onDone) {
  const fr = taskFrame({ total: count, title, cls: 'reading bridge' });
  const pool = shuffle(WORDS.filter(([w]) => syllabify(w).length >= 2)).slice(0, count);
  let i = 0;
  let earned = 0;

  function show() {
    fr.progress(i);
    const [word, pic] = pool[i];
    const syl = syllabify(word);
    const extra = pick(['ma', 'lo', 'ti', 'ber', 'su', 'ken', 'ra'].filter((x) => !syl.some((s) => s.toLowerCase() === x)));
    const stones = shuffle([...syl.map((s, k) => ({ s, k })), { s: extra, k: -1 }]);
    let next = 0;
    let mistakes = 0;
    fr.area.innerHTML = `
      <p class="task-text">${T('Bau die Brücke! Tippe die Silben in der richtigen Reihenfolge.')}</p>
      <div class="bridge-pic">${pic}</div>
      <div class="bridge">${syl.map(() => '<span class="plank"></span>').join('')}</div>
      <div class="water">〰️〰️〰️〰️〰️〰️</div>
      <div class="stones">${stones.map((st, k) => `<button class="stone" data-k="${st.k}" data-i="${k}">${st.s.toLowerCase()}</button>`).join('')}</div>
      <div class="msg"></div>`;
    const msg = $('.msg', fr.area);
    const planks = $$('.plank', fr.area);

    $$('.stone', fr.area).forEach((b) => b.addEventListener('click', async () => {
      if (b.disabled) return;
      const k = +b.dataset.k;
      if (k === next) {
        planks[next].innerHTML = `<span class="syl ${next % 2 ? 'syl-b' : 'syl-a'}">${next === 0 ? syl[0] : syl[next].toLowerCase()}</span>`;
        planks[next].classList.add('laid');
        b.disabled = true;
        b.classList.add('used');
        sfx.pop();
        next++;
        if (next === syl.length) {
          sfx.good();
          speak(word);
          say(msg, `${praise()} *${word}*`, 'good');
          burstAt($('.bridge', fr.area), ['✨', '⭐'], 8);
          trackRead(mistakes === 0);
          const r = mistakes === 0 ? 2 : 1;
          earned += r;
          reward(r);
          await wait(1700);
          i++;
          if (i < count) show(); else onDone(earned);
        }
      } else {
        mistakes++;
        sfx.soft();
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        say(msg, mistakes >= 2 ? `Das Wort ist *${word}*. Welche Silbe kommt jetzt?` : 'Hmm, passt das? Sprich das Wort langsam.', 'hint');
        if (mistakes >= 2) speak(word);
      }
    }));
  }
  show();
}
