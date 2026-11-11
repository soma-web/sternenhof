// Hundertertafel – drei Spiele im Stil der Arbeitsblätter:
// 1) Zahlen eintragen (Zeile, Spalte, Einer, Zahlwörter, zwischen …)
// 2) Zahlen aufschreiben (welche Zahlen stehen in der 5. Spalte?)
// 3) Verdeckte Zahlen (Sticker auf der Tafel, darunter ein Bild – z. B. ein Einhorn)
// Am Rand stehen als Hilfe 1–10 (Spalten) und 0–90 (Zeilen).
import { S } from './state.js';
import { sfx } from './audio.js';
import { trackResult } from './math.js';
import { taskFrame, T, $, $$, rand, pick, shuffle, wait, reward, say, praise, encourage, burstAt } from './ui.js';

const lvl = () => S.mathLevel || 2;
const typeMode = () => lvl() >= 4; // ab Stufe 4: Zahlen selbst eintippen

// ---------- Zahlwörter ----------
const ONES = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const TEENS = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
export function zahlwort(n) {
  if (n === 100) return 'hundert';
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const t = Math.floor(n / 10);
  const e = n % 10;
  if (!e) return TENS[t];
  return `${e === 1 ? 'ein' : ONES[e]}und${TENS[t]}`;
}

// ---------- Die Tafel ----------
const rowOf = (n) => Math.floor((n - 1) / 10);   // 0–9
const colOf = (n) => ((n - 1) % 10) + 1;          // 1–10

/** cells: Map n -> { text, cls } */
function gridHTML(cells, { labels = true } = {}) {
  let h = `<div class="htafel ${labels ? 'with-labels' : ''}">`;
  if (labels) {
    h += '<span class="hl corner"></span>';
    for (let c = 1; c <= 10; c++) h += `<span class="hl top">${c}</span>`;
  }
  for (let r = 0; r < 10; r++) {
    if (labels) h += `<span class="hl left">${r * 10}</span>`;
    for (let c = 1; c <= 10; c++) {
      const n = r * 10 + c;
      const cell = cells.get(n) || {};
      h += `<button class="hc ${cell.cls || ''}" data-n="${n}">${cell.text ?? ''}</button>`;
    }
  }
  return `${h}</div>`;
}

function numpadHTML() {
  return `<div class="hpad">
    <div class="hpad-display"><span class="hpad-val"></span><span class="caret"></span></div>
    <div class="hpad-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button class="hk" data-k="${d}">${d}</button>`).join('')}
      <button class="hk del" data-k="del">⌫</button><button class="hk" data-k="0">0</button><button class="hk ok" data-k="ok">✓</button></div>
  </div>`;
}

/** Ziffernfeld verbinden. onEnter(wert) gibt true zurück, wenn richtig. */
function bindNumpad(root, onEnter) {
  let input = '';
  const val = $('.hpad-val', root);
  const show = () => { val.textContent = input; };
  $$('.hk', root).forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.k;
    if (k === 'del') { input = input.slice(0, -1); sfx.tap(); }
    else if (k === 'ok') { if (input) { onEnter(+input); input = ''; } }
    else if (input.length < 3) { input += k; sfx.tap(); }
    show();
  }));
  return { clear() { input = ''; show(); } };
}

// ---------- Aufträge (Aufgabe 1 a–f) ----------
function makeOrders() {
  const range = (a, b, step = 1) => { const out = []; for (let n = a; n <= b; n += step) out.push(n); return out; };
  const pool = [];
  const z = rand(1, 10);
  pool.push({ text: `Trage alle Zahlen in der *${z}. Zeile* ein.`, nums: range((z - 1) * 10 + 1, z * 10) });
  const e = rand(1, 9);
  pool.push(Math.random() < 0.3
    ? { text: 'Trage alle *Zehnerzahlen* ein.', nums: range(10, 100, 10) }
    : { text: `Trage alle Zahlen ein, die *${e} Einer* haben.`, nums: range(e, 90 + e, 10) });
  const s = rand(1, 10);
  pool.push({ text: `Trage alle Zahlen in der *${s}. Spalte* ein.`, nums: range(s, 90 + s, 10) });
  const words = shuffle(range(11, 99)).slice(0, 3);
  pool.push({ text: `Trage ein: *${words.map(zahlwort).join(', ')}*`, nums: words, words: true });
  const a = rand(1, 8) * 10;
  pool.push({ text: `Trage alle Zahlen *zwischen ${a} und ${a + 10}* ein.`, nums: range(a + 1, a + 9) });
  return pool;
}

/** Spiel 1: Zahlen in die Hundertertafel eintragen. Die Tafel füllt sich über alle Aufträge. */
export function hundredFill({ count = 5, title = 'Hundertertafel' } = {}, onDone) {
  const fr = taskFrame({ total: count, title, cls: 'hundred' });
  const orders = makeOrders().slice(0, count);
  const filled = new Set([1]);
  let i = 0;
  let earned = 0;

  async function finish(order, errors) {
    const first = errors === 0;
    trackResult(first);
    const r = first ? 2 : 1;
    earned += r;
    reward(r);
    sfx.good();
    say($('.msg', fr.area), first ? `${praise()} Alles richtig eingetragen!` : 'Geschafft! Alles eingetragen.', 'good');
    burstAt($('.htafel', fr.area), ['⭐', '✨', '🦄'], 10);
    await wait(1500);
    i++;
    if (i < count) show(); else onDone(earned);
  }

  function cellsMap(extra = new Map()) {
    const m = new Map();
    filled.forEach((n) => m.set(n, { text: n, cls: n === 1 ? 'given' : 'done' }));
    extra.forEach((v, k) => m.set(k, v));
    return m;
  }

  function show() {
    fr.progress(i);
    const order = orders[i];
    const todo = order.nums.filter((n) => !filled.has(n));
    if (!todo.length) { order.nums.forEach((n) => filled.add(n)); finish(order, 0); return; }
    if (typeMode()) typeRound(order, todo); else tapRound(order, todo);
  }

  // Leichter: das richtige Kästchen antippen
  function tapRound(order, todo) {
    let errors = 0;
    const left = new Set(todo);
    fr.area.innerHTML = `
      <p class="task-text">${T(order.text)}</p>
      <p class="small-hint">${T('Tipp die richtigen Kästchen an!', { speak: false })} <span class="left-count">${left.size}</span></p>
      ${gridHTML(cellsMap())}
      <div class="msg"></div>`;
    const msg = $('.msg', fr.area);
    $$('.hc', fr.area).forEach((b) => b.addEventListener('click', async () => {
      const n = +b.dataset.n;
      if (!left.size || filled.has(n)) return;
      if (left.has(n)) {
        left.delete(n);
        filled.add(n);
        b.textContent = n;
        b.className = 'hc done pop';
        sfx.pop();
        $('.left-count', fr.area).textContent = left.size;
        $$('.hc.hint-glow', fr.area).forEach((x) => x.classList.remove('hint-glow'));
        say(msg, '');
        if (!left.size) await finish(order, errors);
      } else {
        errors++;
        sfx.soft();
        b.textContent = n;
        b.classList.add('nope');
        setTimeout(() => { if (!filled.has(n)) { b.textContent = ''; b.classList.remove('nope'); } }, 900);
        say(msg, `Das ist die *${n}*. ${encourage()} Schau auf die Zahlen am Rand.`, 'hint');
        if (errors >= 3) $(`.hc[data-n="${[...left][0]}"]`, fr.area)?.classList.add('hint-glow');
      }
    }));
  }

  // Schwerer: ein Kästchen leuchtet, die Zahl selbst eintippen (höchstens 4, den Rest füllt die Tafel)
  function typeRound(order, todo) {
    let errors = 0;
    let tries = 0;
    const ask = shuffle(todo).slice(0, Math.min(4, todo.length)).sort((a, b) => a - b);
    let k = 0;
    fr.area.innerHTML = `
      <p class="task-text">${T(order.text)}</p>
      <p class="small-hint">${T('Welche Zahl gehört in das leuchtende Kästchen?', { speak: false })}</p>
      ${gridHTML(cellsMap())}
      <div class="msg"></div>
      ${numpadHTML()}`;
    const msg = $('.msg', fr.area);
    const mark = () => {
      $$('.hc.ask', fr.area).forEach((x) => x.classList.remove('ask'));
      $(`.hc[data-n="${ask[k]}"]`, fr.area)?.classList.add('ask');
    };
    mark();
    const pad = bindNumpad(fr.area, async (v) => {
      const want = ask[k];
      const cell = $(`.hc[data-n="${want}"]`, fr.area);
      if (v === want) {
        sfx.pop();
        filled.add(want);
        cell.textContent = want;
        cell.className = 'hc done pop';
        say(msg, '');
        tries = 0;
        k++;
        if (k < ask.length) { mark(); return; }
        // Rest automatisch eintragen
        for (const n of order.nums) {
          if (filled.has(n)) continue;
          filled.add(n);
          const c = $(`.hc[data-n="${n}"]`, fr.area);
          c.textContent = n;
          c.className = 'hc done auto';
          await wait(70);
        }
        await finish(order, errors);
      } else {
        errors++;
        tries++;
        sfx.soft();
        cell.classList.add('nope');
        setTimeout(() => cell.classList.remove('nope'), 450);
        const r = rowOf(want) * 10;
        const c = colOf(want);
        if (tries >= 2) {
          say(msg, `Schau: Zeile ${r}, Spalte ${c}. ${r} + ${c} = *${want}*.`, 'hint');
          filled.add(want);
          cell.textContent = want;
          cell.className = 'hc done';
          tries = 0;
          k++;
          if (k < ask.length) mark(); else {
            for (const n of order.nums) { filled.add(n); const x = $(`.hc[data-n="${n}"]`, fr.area); x.textContent = n; x.className = 'hc done auto'; }
            await wait(1200);
            await finish(order, errors);
          }
        } else {
          say(msg, `${encourage()} Am Rand links steht *${r}*, oben steht *${c}*.`, 'hint');
        }
      }
      pad.clear();
    });
  }

  show();
}

// ---------- Spiel 2: Zahlen einer Zeile / Spalte aufschreiben (Aufgabe 1 g) ----------
export function hundredWrite({ count = 4, title = 'Zeilen und Spalten' } = {}, onDone) {
  const fr = taskFrame({ total: count, title, cls: 'hundred' });
  const kinds = shuffle([
    { kind: 'Zeile', k: rand(1, 10) }, { kind: 'Spalte', k: rand(1, 10) },
    { kind: 'Zeile', k: rand(1, 10) }, { kind: 'Spalte', k: rand(1, 10) },
  ]).slice(0, count);
  let i = 0;
  let earned = 0;

  function show() {
    fr.progress(i);
    const { kind, k } = kinds[i];
    const nums = [];
    for (let j = 0; j < 10; j++) nums.push(kind === 'Zeile' ? (k - 1) * 10 + j + 1 : k + j * 10);
    const gapsN = lvl() <= 2 ? 2 : lvl() <= 4 ? 3 : 5;
    const gaps = shuffle(nums.slice(1)).slice(0, gapsN).sort((a, b) => a - b);
    let g = 0;
    let errors = 0;
    let tries = 0;
    // kleine Tafel zur Orientierung: die Zeile/Spalte ist markiert, aber leer
    const cells = new Map([[1, { text: 1, cls: 'given' }]]);
    nums.forEach((n) => cells.set(n, { text: gaps.includes(n) ? '' : n, cls: gaps.includes(n) ? 'mark' : 'mark done' }));
    fr.area.innerHTML = `
      <p class="task-text">${T(`Schreibe die Zahlen der *${k}. ${kind}* auf.`)}</p>
      <div class="hrow">${nums.map((n) => (gaps.includes(n) ? `<span class="hgap" data-n="${n}">?</span>` : `<span class="hnum">${n}</span>`)).join('')}</div>
      ${gridHTML(cells)}
      <div class="msg"></div>
      ${numpadHTML()}`;
    const msg = $('.msg', fr.area);
    const mark = () => { $$('.hgap', fr.area).forEach((x) => x.classList.toggle('now', +x.dataset.n === gaps[g])); };
    mark();
    const fillGap = (n) => {
      const el = $(`.hgap[data-n="${n}"]`, fr.area);
      el.textContent = n; el.classList.add('filled'); el.classList.remove('now');
      const c = $(`.hc[data-n="${n}"]`, fr.area); c.textContent = n; c.classList.add('done', 'pop');
    };
    const pad = bindNumpad(fr.area, async (v) => {
      const want = gaps[g];
      if (v === want) {
        sfx.pop(); fillGap(want); say(msg, ''); tries = 0; g++;
      } else {
        errors++; tries++; sfx.soft();
        if (tries >= 2) { fillGap(want); say(msg, `Es ist die *${want}*. ${kind === 'Zeile' ? 'In einer Zeile kommt immer 1 dazu.' : 'In einer Spalte kommen immer 10 dazu.'}`, 'hint'); tries = 0; g++; }
        else say(msg, kind === 'Zeile' ? `${encourage()} In einer Zeile zählt man immer *1* weiter.` : `${encourage()} In einer Spalte springt man immer *10* weiter.`, 'hint');
      }
      pad.clear();
      if (g < gaps.length) { mark(); return; }
      const first = errors === 0;
      trackResult(first);
      const r = first ? 2 : 1;
      earned += r; reward(r); sfx.good();
      say(msg, first ? `${praise()} Die ${k}. ${kind} ist komplett!` : `Geschafft! Die ${k}. ${kind} ist komplett.`, 'good');
      await wait(1600);
      i++;
      if (i < count) show(); else onDone(earned);
    });
  }
  show();
}

// ---------- Spiel 3: Verdeckte Zahlen (Aufgabe 2) ----------
// Bild „Einhorn“ wie auf dem Arbeitsblatt: Körper lila, Horn gold, Mähne rosa, Auge.
const EINHORN_BODY = [16, 25, 33, 34, 36, 42, 43, 44, 45, 46, 47, 51, 52, 53, 54, 55, 56, 57, 61, 62, 65, 66, 67, 68, 75, 76, 77, 78, 85, 86, 87, 88, 89, 95, 96, 97, 98, 99];
export const PICTURES = {
  einhorn: {
    body: EINHORN_BODY,
    kinds: [
      { key: 'horn', label: 'Horn', icon: '<span class="stk sq" style="background:#F2C14E"></span>', nums: [2, 13, 24], color: '#F2C14E' },
      { key: 'auge', label: 'Auge', icon: '<span class="stk eye">●</span>', nums: [35], color: '#E2D8F6', mark: '👁️' },
      { key: 'maehne', label: 'Mähne', icon: '<span class="stk sq" style="background:#F48FB1"></span>', nums: [26, 27, 37, 38, 48, 58, 59, 69, 79, 80, 90], color: '#F48FB1' },
    ],
  },
  sterne: {
    body: [],
    kinds: [
      { key: 'stern', label: 'Sterne', icon: '<span class="stk">⭐</span>', nums: [4, 6, 15, 24, 26] },
      { key: 'herz', label: 'Herzen', icon: '<span class="stk">💗</span>', nums: [63, 64, 73, 74] },
      { key: 'punkt', label: 'Punkte', icon: '<span class="stk">🟣</span>', nums: [81, 83, 85, 87, 89] },
    ],
  },
};
function randomPicture() {
  const icons = shuffle([['Sonnen', '🌞'], ['Herzen', '💗'], ['Sterne', '⭐'], ['Blumen', '🌸'], ['Kleeblätter', '🍀']]).slice(0, 3);
  const used = new Set([1, 100]);
  const kinds = icons.map(([label, emoji], k) => {
    const nums = [];
    const start = rand(2, 95);
    const step = pick([1, 10, 11, 9, 2]);
    for (let j = 0; nums.length < 4 && j < 12; j++) {
      const n = start + j * step;
      if (n < 2 || n > 99 || used.has(n)) continue;
      if (step === 1 && colOf(n) < colOf(start)) break;
      used.add(n); nums.push(n);
    }
    while (nums.length < 3) { const n = rand(2, 99); if (!used.has(n)) { used.add(n); nums.push(n); } }
    return { key: `k${k}`, label, icon: `<span class="stk">${emoji}</span>`, nums };
  });
  return { body: [], kinds };
}

export function hundredHidden({ picture = 'zufall', title = 'Verdeckte Zahlen', ask = 8 } = {}, onDone) {
  const pic = PICTURES[picture] || randomPicture();
  const all = pic.kinds.flatMap((k) => k.nums.map((n) => ({ n, kind: k })));
  // Diese Sticker muss das Kind lösen, den Rest deckt die Tafel am Ende selbst auf
  const must = new Set();
  pic.kinds.forEach((k) => { if (k.nums.length <= 3) k.nums.forEach((n) => must.add(n)); });
  shuffle(all).forEach(({ n }) => { if (must.size < Math.min(ask, all.length)) must.add(n); });
  const total = must.size;
  const fr = taskFrame({ total, title, cls: 'hundred hidden-game' });
  const found = new Set();
  const prefill = lvl() <= 2;
  let errors = 0;
  let tries = 0;
  let earned = 0;
  let current = null;

  const cells = new Map();
  cells.set(1, { text: 1, cls: 'given' });
  cells.set(100, { text: 100, cls: 'given' });
  if (prefill) for (let c = 2; c <= 10; c++) cells.set(c, { text: c, cls: 'given soft' });
  pic.body.forEach((n) => cells.set(n, { text: '', cls: 'body' }));
  all.forEach(({ n, kind }) => cells.set(n, { text: kind.icon, cls: `sticker ${must.has(n) ? 'must' : ''} k-${kind.key}` }));

  fr.area.innerHTML = `
    <p class="task-text">${T('Schreibe die verdeckten Zahlen auf. Tipp einen Sticker an!')}</p>
    ${gridHTML(cells)}
    <div class="hlegend">${pic.kinds.map((k) => `<div class="hleg" data-k="${k.key}"><span class="hleg-icon">${k.icon}</span><span class="hleg-label">${k.label}</span><span class="hleg-nums"></span></div>`).join('')}</div>
    <div class="msg"></div>
    <div class="hpad-wrap hidden">${numpadHTML()}</div>`;
  const msg = $('.msg', fr.area);
  const padWrap = $('.hpad-wrap', fr.area);
  fr.progress(0);

  const listFound = (kind) => {
    const el = $(`.hleg[data-k="${kind.key}"] .hleg-nums`, fr.area);
    el.textContent = kind.nums.filter((n) => found.has(n)).sort((a, b) => a - b).join(', ');
  };
  const reveal = (n, kind, auto = false) => {
    found.add(n);
    const c = $(`.hc[data-n="${n}"]`, fr.area);
    c.className = `hc revealed ${auto ? 'auto' : 'pop'} k-${kind.key}`;
    if (kind.color) c.style.background = kind.color;
    c.innerHTML = `<span class="rev-n">${n}</span>`;
    listFound(kind);
  };

  const select = (n) => {
    const item = all.find((x) => x.n === n);
    if (!item || found.has(n) || !must.has(n)) return;
    current = item;
    tries = 0;
    $$('.hc.ask', fr.area).forEach((x) => x.classList.remove('ask'));
    $(`.hc[data-n="${n}"]`, fr.area).classList.add('ask');
    padWrap.classList.remove('hidden');
    say(msg, `Welche Zahl ist unter diesem Sticker?`, '');
    sfx.tap();
  };
  $$('.hc.sticker.must', fr.area).forEach((b) => b.addEventListener('click', () => select(+b.dataset.n)));

  const pad = bindNumpad(fr.area, async (v) => {
    if (!current) { say(msg, 'Tipp zuerst einen Sticker an!', 'hint'); return; }
    const { n, kind } = current;
    if (v === n) {
      sfx.pop();
      reveal(n, kind);
      if (tries === 0) { earned += 1; reward(1); }
      trackResult(tries === 0);
      say(msg, `${praise()} Unter dem Sticker ist die *${n}*.`, 'good');
      current = null;
      padWrap.classList.add('hidden');
      const doneN = [...must].filter((x) => found.has(x)).length;
      fr.progress(doneN);
      if (doneN === total) {
        // Rest aufdecken und Bild zeigen
        for (const { n: m, kind: k } of all) { if (!found.has(m)) { reveal(m, k, true); await wait(90); } }
        $('.htafel', fr.area).classList.add('complete');
        sfx.win();
        earned += 3; reward(3);
        say(msg, picture === 'einhorn' ? 'Schau mal! Die Kästchen ergeben ein *Einhorn*! 🦄' : `${praise()} Alle Sticker sind aufgedeckt!`, 'good');
        burstAt($('.htafel', fr.area), ['🦄', '✨', '⭐', '💖'], 16);
        await wait(2600);
        onDone(earned);
      }
    } else {
      errors++; tries++; sfx.soft();
      const r = rowOf(n) * 10;
      const c = colOf(n);
      if (tries >= 2) {
        reveal(n, kind);
        trackResult(false);
        say(msg, `Schau: Zeile ${r}, Spalte ${c}. Das ist die *${n}*.`, 'hint');
        current = null;
        padWrap.classList.add('hidden');
        const doneN = [...must].filter((x) => found.has(x)).length;
        fr.progress(doneN);
        if (doneN === total) {
          for (const { n: m, kind: k } of all) { if (!found.has(m)) { reveal(m, k, true); await wait(90); } }
          $('.htafel', fr.area).classList.add('complete');
          await wait(2200);
          onDone(earned);
        }
      } else {
        say(msg, `${encourage()} Am Rand links steht *${r}*, oben steht *${c}*. Wie viel ist das zusammen?`, 'hint');
      }
    }
    pad.clear();
  });
}

/** Für das freie Üben: eines der drei Spiele */
export function hundredMixed(onDone) {
  const g = pick(['fill', 'write', 'hidden']);
  if (g === 'fill') return hundredFill({ count: 5 }, onDone);
  if (g === 'write') return hundredWrite({ count: 4 }, onDone);
  return hundredHidden({ picture: pick(['einhorn', 'sterne', 'zufall', 'zufall']) }, onDone);
}
