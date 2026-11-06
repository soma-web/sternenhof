// Spiele für Kapitel 4 und 5: Zaun-Bretter (Zehner und Einer) und Startnummern sortieren.
import { S } from './state.js';
import { sfx } from './audio.js';
import { trackResult } from './math.js';
import { taskFrame, T, $, $$, rand, shuffle, wait, reward, say, praise, encourage, burstAt } from './ui.js';

const lvl = () => S.mathLevel || 2;

// ---------- Zaun-Bretter: Zehnerbündel und einzelne Bretter zählen ----------
function plank(cls = '') {
  return `<span class="brett ${cls}"></span>`;
}
function bundle() {
  return `<span class="buendel" aria-label="10 Bretter">${Array.from({ length: 10 }, () => plank()).join('')}<span class="seil"></span></span>`;
}

function boardTask() {
  const max = lvl() <= 1 ? 29 : 50;
  const min = lvl() <= 1 ? 11 : 12;
  let n;
  do { n = rand(min, max); } while (n % 10 === 0 && Math.random() < 0.7);
  const t = Math.floor(n / 10);
  const e = n % 10;
  const wrong = new Set();
  if (e > 0 && e * 10 + t <= 50 && e * 10 + t !== n) wrong.add(e * 10 + t);  // Zahlendreher
  wrong.add(n + 10 <= 59 ? n + 10 : n - 10);
  wrong.add(e === 9 ? n - 1 : n + 1);
  const opts = shuffle([n, ...shuffle([...wrong].filter((x) => x !== n && x > 0)).slice(0, 2)]);
  return { n, t, e, opts };
}

export function boardsGame({ count = 5, title = 'Zaun reparieren' } = {}, onDone) {
  const fr = taskFrame({ total: count, title, cls: 'math boards' });
  let i = 0;
  let earned = 0;

  function show() {
    fr.progress(i);
    const task = boardTask();
    let tries = 0;
    let busy = false;
    fr.area.innerHTML = `
      <p class="task-text">${T('Wie viele Bretter sind das? Ein Bündel hat *10* Bretter.')}</p>
      <div class="brett-stapel">${Array.from({ length: task.t }, bundle).join('')}<span class="einzelne">${Array.from({ length: task.e }, () => plank('einzeln')).join('')}</span></div>
      <div class="choices nums">${task.opts.map((o) => `<button class="choice num" data-n="${o}">${o}</button>`).join('')}</div>
      <div class="msg"></div>`;
    const msg = $('.msg', fr.area);
    $$('.choice', fr.area).forEach((b) => b.addEventListener('click', async () => {
      if (busy) return;
      if (+b.dataset.n === task.n) {
        busy = true;
        b.classList.add('right');
        sfx.good();
        say(msg, `${praise()} ${task.t} Zehner und ${task.e} Einer sind *${task.n}*.`, 'good');
        burstAt(b, ['🪵', '✨', '⭐'], 6);
        trackResult(tries === 0);
        const r = tries === 0 ? 2 : 1;
        earned += r;
        reward(r);
        await wait(1700);
        i++;
        if (i < count) show(); else onDone(earned);
      } else {
        tries++;
        sfx.soft();
        b.classList.add('nope');
        b.disabled = true;
        if (tries >= 2) {
          busy = true;
          $(`.choice[data-n="${task.n}"]`, fr.area).classList.add('right');
          say(msg, `Schau: ${task.t} Bündel sind ${task.t * 10}. Dazu ${task.e} einzelne. Das sind *${task.n}*.`, 'hint');
          trackResult(false);
          await wait(2800);
          i++;
          if (i < count) show(); else onDone(earned);
        } else {
          say(msg, `${encourage()} Zähl erst die Bündel: 10, 20, …`, 'hint');
          $('.brett-stapel', fr.area).classList.add('counting');
        }
      }
    }));
  }
  show();
}

// ---------- Startnummern: von der kleinsten zur größten antippen ----------
function sortTask() {
  const l = lvl();
  const size = l <= 1 ? 3 : l <= 3 ? 4 : 5;
  const max = l <= 1 ? 20 : 50;
  const nums = new Set();
  if (l >= 4) {
    // nah beieinander, damit man genau schauen muss
    const base = rand(10, max - 12);
    while (nums.size < size) nums.add(base + rand(0, 12));
  } else {
    while (nums.size < size) nums.add(rand(1, max));
  }
  return [...nums];
}

const BIB_COLORS = ['#FF8FC0', '#7FB2FF', '#FFD34D', '#5FCFAE', '#B58CFF'];

export function sortGame({ count = 5, title = 'Startnummern' } = {}, onDone) {
  const fr = taskFrame({ total: count, title, cls: 'math sorting' });
  let i = 0;
  let earned = 0;

  function show() {
    fr.progress(i);
    const nums = sortTask();
    const order = [...nums].sort((a, b) => a - b);
    let pos = 0;
    let tries = 0;
    let busy = false;
    fr.area.innerHTML = `
      <p class="task-text">${T('Die Pferde stellen sich auf. Tipp die Nummern an: von der *kleinsten* zur *größten*!')}</p>
      <div class="start-line">${order.map(() => '<span class="slot"></span>').join('')}</div>
      <div class="bibs">${nums.map((n, k) => `<button class="bib" data-n="${n}" style="--c:${BIB_COLORS[k % BIB_COLORS.length]}"><span class="bib-horse">🐴</span><span class="bib-num">${n}</span></button>`).join('')}</div>
      <div class="msg"></div>`;
    const msg = $('.msg', fr.area);
    const slots = $$('.slot', fr.area);

    async function finish() {
      busy = true;
      sfx.good();
      const first = tries === 0;
      say(msg, first ? `${praise()} Alle stehen richtig!` : 'Geschafft! Alle stehen richtig.', 'good');
      burstAt($('.start-line', fr.area), ['🏁', '✨', '⭐'], 8);
      trackResult(first);
      const r = first ? 2 : 1;
      earned += r;
      reward(r);
      await wait(1600);
      i++;
      if (i < count) show(); else onDone(earned);
    }

    $$('.bib', fr.area).forEach((b) => b.addEventListener('click', async () => {
      if (busy || b.classList.contains('placed')) return;
      const n = +b.dataset.n;
      if (n === order[pos]) {
        sfx.pop();
        b.classList.add('placed');
        slots[pos].innerHTML = `<span class="bib small" style="--c:${b.style.getPropertyValue('--c')}"><span class="bib-num">${n}</span></span>`;
        pos++;
        say(msg, '');
        $$('.bib', fr.area).forEach((x) => x.classList.remove('hint-glow'));
        if (pos === order.length) await finish();
      } else {
        tries++;
        sfx.soft();
        b.classList.add('nope');
        setTimeout(() => b.classList.remove('nope'), 500);
        if (tries >= 2) {
          $(`.bib[data-n="${order[pos]}"]`, fr.area).classList.add('hint-glow');
          say(msg, `Welche Zahl ist am kleinsten? Es ist die *${order[pos]}*.`, 'hint');
        } else {
          say(msg, `${encourage()} ${n} ist nicht die kleinste. Schau noch mal.`, 'hint');
        }
      }
    }));
  }
  show();
}
