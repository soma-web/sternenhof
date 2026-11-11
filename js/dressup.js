// Schmücken: Baukasten aus Form, Farbe und Muster. Erst anprobieren, dann kaufen.
import { S, save } from './state.js';
import { sfx, speak } from './audio.js';
import { myHorse, RIBBONS } from './horse.js';
import {
  PALETTE, FREE_COLORS, COLOR_PRICE, PATTERNS, METALS, MANES, TAILS, JEWELS, HATS, WRAP_FORMS,
  DEFAULT_LOOK, patternSwatch, HORNS, MANE_COLORS, GLITTER,
} from './looks.js';
import { mount, topbar, bindTopbar, T, $, $$, burstAt, shoeIcon, pick } from './ui.js';

const JEWEL_ICON = { keins: '–', band: '➖', bogen: '💧', perlband: '⚪', ykette: '💎', doppel: '〰️', sterne: '⭐' };

// ---------- Bausteine für die Reihen ----------
const formRow = (field, label, list, icons = {}) => ({
  field, label, kind: 'form',
  opts: list.map((o) => ({ v: o.v, label: o.label, price: o.price, key: `form-${field}-${o.v}`, icon: o.icon || icons[o.v] || '•' })),
});
const colorRow = (field, label, show) => ({
  field, label, kind: 'color', show,
  opts: Object.entries(PALETTE).map(([v, c]) => ({ v, label: c.label, hex: c.hex, price: FREE_COLORS.includes(v) ? 0 : COLOR_PRICE, key: `farbe-${v}` })),
});
const patternRow = (field, colorField, show) => ({
  field, label: 'Muster', kind: 'pattern', colorField, show,
  opts: Object.entries(PATTERNS).map(([v, p]) => ({ v, label: p.label, price: p.price, key: `muster-${v}` })),
});
const ribbonRow = () => ({
  field: 'ribbon', label: 'Bänder', kind: 'color',
  opts: Object.entries(RIBBONS).map(([v, hex]) => ({ v, label: v === 'weiss' ? 'Weiß' : v.charAt(0).toUpperCase() + v.slice(1), hex, price: 0 })),
});

const hasHat = (d) => d.hat === 'haube' || d.hat === 'muetze';

const TABS = [
  { key: 'mane', label: 'Mähne', icon: '💇', rows: [formRow('mane', 'Frisur', MANES), ribbonRow()] },
  { key: 'tail', label: 'Schweif', icon: '🎀', rows: [formRow('tail', 'Frisur', TAILS), ribbonRow()] },
  { key: 'jewel', label: 'Schmuck', icon: '💎', rows: [
    formRow('jewel', 'Form', JEWELS, JEWEL_ICON),
    colorRow('jewelColor', 'Steine', (d) => d.jewel !== 'keins'),
    { field: 'jewelMetal', label: 'Metall', kind: 'metal', show: (d) => d.jewel !== 'keins',
      opts: Object.entries(METALS).map(([v, m]) => ({ v, label: m.label, price: m.price, key: `metall-${v}`, hex: m.ring })) },
  ] },
  { key: 'hat', label: 'Hut', icon: '👒', rows: [
    formRow('hat', 'Hut', HATS),
    colorRow('hatColor', 'Farbe', (d) => d.hat !== 'keiner'),
    patternRow('hatPattern', 'hatColor', hasHat),
    colorRow('hatRim', 'Rand', hasHat),
  ] },
  { key: 'wraps', label: 'Gamaschen', icon: '🧦', rows: [
    formRow('wraps', 'Gamaschen', WRAP_FORMS),
    colorRow('wrapColor', 'Farbe', (d) => d.wraps === 'an'),
    patternRow('wrapPattern', 'wrapColor', (d) => d.wraps === 'an'),
  ] },
  { key: 'unicorn', label: 'Einhorn', icon: '🦄', rows: [
    formRow('horn', 'Horn', HORNS),
    colorRow('hornColor', 'Farbe', (d) => d.horn === 'horn'),
    patternRow('hornPattern', 'hornColor', (d) => d.horn === 'horn'),
    { field: 'maneColor', label: 'Mähne und Schweif', kind: 'color',
      opts: MANE_COLORS.map((o) => ({ ...o, key: `maehne-${o.v}` })) },
    formRow('glitter', 'Glitzer', GLITTER),
  ] },
  { key: 'pad', label: 'Decke', icon: '🟦', rows: [
    colorRow('padColor', 'Farbe'),
    patternRow('padPattern', 'padColor'),
    colorRow('padRim', 'Rand'),
  ] },
];

const COMPLIMENTS = ['Wunderschön!', 'So hübsch!', 'Was für ein schönes Pferd!', 'Toll siehst du aus!', 'Wie eine Prinzessin!', 'Einfach zauberhaft!'];

const isOwned = (o) => o.price === 0 || S.owned.includes(o.key);

/** Alle Teile, die gerade anprobiert werden, aber noch nicht gekauft sind */
function lockedParts(draft) {
  const seen = new Map();
  for (const tab of TABS) {
    for (const row of tab.rows) {
      if (row.show && !row.show(draft)) continue;
      const o = row.opts.find((x) => x.v === draft[row.field]);
      if (o && !isOwned(o) && !seen.has(o.key)) seen.set(o.key, o);
    }
  }
  return [...seen.values()];
}

/** Schmücken. opts.story: in der Geschichte (mit "Fertig"-Text) */
export function dressUp(onDone, { story = false, tab: startTab = null, text = null } = {}) {
  S.horse.style = { ...DEFAULT_LOOK, ...(S.horse.style || {}) };
  const draft = { ...S.horse.style };
  let tab = startTab && TABS.some((x) => x.key === startTab) ? startTab : TABS[0].key;

  const scr = mount(`
    ${topbar({ title: 'Schmücken' })}
    <p class="instr">${T(text || (story ? 'Mach {horse} schön für das Fest!' : 'Mach {horse} ganz schön!'))}</p>
    <div class="stage dress-stage"><div class="dress-horse"></div><div class="talk"></div></div>
    <div class="buy-bar hidden"></div>
    <div class="dress-actions">
      <button class="btn btn-small photo-btn">📸 Foto</button>
      <button class="btn btn-small btn-done">Fertig ➜</button>
    </div>
    <div class="cat-tabs">${TABS.map((c) => `<button class="cat-tab" data-cat="${c.key}"><span>${c.icon}</span><span class="cat-label">${T(c.label, { speak: false })}</span></button>`).join('')}</div>
    <div class="dress-rows"></div>
    <div class="msg"></div>
`, 'dress');
  bindTopbar(scr);
  const horseBox = $('.dress-horse', scr);
  const rowsBox = $('.dress-rows', scr);
  const buyBar = $('.buy-bar', scr);
  const msg = $('.msg', scr);
  const talk = $('.talk', scr);

  const drawHorse = () => {
    horseBox.innerHTML = myHorse(S, { cls: 'big idle', style: draft, gear: tab === 'pad' ? { pad: true } : {} });
  };
  const shoesLabel = () => { const c = $('.shoe-count'); if (c) c.textContent = S.shoes; };

  function optHTML(row, o) {
    const sel = draft[row.field] === o.v;
    const own = isOwned(o);
    const price = own ? '' : `<span class="opt-price">🔒${o.price}</span>`;
    if (row.kind === 'color' || row.kind === 'metal') {
      return `<button class="chip-sw ${sel ? 'sel' : ''} ${own ? '' : 'locked'}" data-f="${row.field}" data-v="${o.v}" aria-label="${o.label}">
        <span class="sw-round" style="background:${o.hex}"></span>${row.kind === 'metal' ? `<span class="opt-mini">${o.label}</span>` : ''}${price}</button>`;
    }
    if (row.kind === 'pattern') {
      return `<button class="chip-sw ${sel ? 'sel' : ''} ${own ? '' : 'locked'}" data-f="${row.field}" data-v="${o.v}" aria-label="${o.label}">
        ${patternSwatch(o.v, draft[row.colorField])}${price}</button>`;
    }
    return `<button class="dress-opt ${sel ? 'sel' : ''} ${own ? '' : 'locked'}" data-f="${row.field}" data-v="${o.v}">
      <span class="sw-emoji">${o.icon}</span>
      <span class="opt-name">${T(o.label, { speak: false })}</span>
      ${own ? '' : `<span class="opt-price">${shoeIcon(16)}${o.price}</span>`}
    </button>`;
  }

  function drawRows() {
    $$('.cat-tab', scr).forEach((b) => b.classList.toggle('sel', b.dataset.cat === tab));
    const t = TABS.find((x) => x.key === tab);
    rowsBox.innerHTML = t.rows.filter((r) => !r.show || r.show(draft)).map((r) => `
      <div class="dress-row">
        <div class="row-label">${T(r.label, { speak: false })}</div>
        <div class="${r.kind === 'form' ? 'dress-opts' : 'chip-row'}">${r.opts.map((o) => optHTML(r, o)).join('')}</div>
      </div>`).join('');
    $$('[data-f]', rowsBox).forEach((b) => b.addEventListener('click', () => choose(b.dataset.f, b.dataset.v)));
  }

  function drawBuy() {
    const locked = lockedParts(draft);
    if (!locked.length) { buyBar.classList.add('hidden'); buyBar.innerHTML = ''; return; }
    const total = locked.reduce((n, o) => n + o.price, 0);
    const enough = S.shoes >= total;
    buyBar.classList.remove('hidden');
    buyBar.innerHTML = `
      <div class="buy-what">🔒 ${locked.map((o) => o.label).join(' + ')}</div>
      <div class="buy-btns">
        <button class="btn btn-small buy-btn ${enough ? '' : 'poor'}">Kaufen ${shoeIcon(20)} ${total}</button>
        <button class="btn btn-small undo-btn">↩ Zurück</button>
      </div>
      ${enough ? '' : `<div class="buy-hint">${T(`Dir fehlen noch ${total - S.shoes} Hufeisen. Spiel noch eine Runde!`)}</div>`}`;
    $('.buy-btn', buyBar).addEventListener('click', () => buy(locked, total));
    $('.undo-btn', buyBar).addEventListener('click', () => {
      sfx.tap();
      Object.assign(draft, S.horse.style);
      refresh();
    });
  }

  function refresh() {
    if (!lockedParts(draft).length) {
      S.horse.style = { ...draft };
      save();
    }
    drawHorse();
    drawRows();
    drawBuy();
  }

  function choose(field, v) {
    msg.innerHTML = '';
    draft[field] = v;
    const t = TABS.find((x) => x.key === tab);
    const o = t.rows.find((r) => r.field === field)?.opts.find((x) => x.v === v);
    if (o && !isOwned(o)) sfx.soft(); else sfx.pop();
    refresh();
    burstAt(horseBox, ['✨'], 4);
  }

  function buy(locked, total) {
    if (S.shoes < total) {
      sfx.soft();
      return;
    }
    S.shoes -= total;
    locked.forEach((o) => { if (!S.owned.includes(o.key)) S.owned.push(o.key); });
    S.horse.style = { ...draft };
    save();
    shoesLabel();
    sfx.win();
    msg.innerHTML = `<div class="bubble-msg good">${T(`Gekauft: ${locked.map((o) => o.label).join(' und ')}!`)}</div>`;
    refresh();
    $('svg.horse', horseBox)?.classList.add('happy');
    burstAt(horseBox, ['💖', '✨', '⭐'], 12);
  }

  $$('.cat-tab', scr).forEach((b) => b.addEventListener('click', () => {
    sfx.tap(); tab = b.dataset.cat; msg.innerHTML = ''; drawHorse(); drawRows();
  }));

  $('.photo-btn', scr).addEventListener('click', () => {
    sfx.win();
    const flash = document.createElement('div');
    flash.className = 'flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
    const line = pick(COMPLIMENTS);
    talk.innerHTML = `<div class="talk-bubble pop-in">${T(line)}</div>`;
    speak(line);
    $('svg.horse', horseBox)?.classList.add('happy');
    burstAt(horseBox, ['💖', '✨', '⭐', '🌸'], 14);
  });

  // Fertig: nur Gekauftes bleibt am Pferd (S.horse.style)
  $('.btn-done', scr).addEventListener('click', () => { sfx.tap(); onDone(); });
  refresh();
}
