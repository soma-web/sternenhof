// Der Stall als Bühne: Regale, Haken, Sattelhalter. Gegenstände lassen sich frei platzieren.
// Koordinaten: 400 × 300 Einheiten. Position = Mitte unten (x, y) eines Gegenstands.
import { S, save } from './state.js';
import { sfx } from './audio.js';
import { myHorse } from './horse.js';
import { T, $, $$ } from './ui.js';

export const W = 400;
export const H = 300;

// Regalflächen und Haken zum Einrasten
const SHELVES = [
  { x1: 16, x2: 132, y: 84 },
  { x1: 16, x2: 132, y: 146 },
];
const HOOKS = [[296, 58], [322, 58], [348, 58], [374, 58]];
const RACK = { x: 352, y: 150 };
const FLOOR_Y = 222;

// ---------- Zeichnungen für Gegenstände ohne passendes Emoji ----------
const svgSattel = '<svg viewBox="0 0 70 50"><path d="M6 30 C8 10 26 10 34 22 C42 12 60 8 64 26 L60 40 Q35 46 10 40 Z" fill="#7A4A2A"/><path d="M18 26 Q35 34 52 24" stroke="#9A643C" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M33 40 L34 50" stroke="#5A3520" stroke-width="3"/></svg>';
const svgTrense = '<svg viewBox="0 0 40 70" fill="none" stroke="#6B3F22" stroke-width="4" stroke-linecap="round"><path d="M20 4 C8 10 6 26 10 44"/><path d="M20 4 C32 10 34 26 30 44"/><path d="M10 22 H30"/><circle cx="10" cy="50" r="5" stroke="#C9CED6" stroke-width="3"/><circle cx="30" cy="50" r="5" stroke="#C9CED6" stroke-width="3"/><path d="M15 50 H25" stroke="#C9CED6" stroke-width="3"/><path d="M10 55 C12 64 28 64 30 55"/></svg>';
const svgHalfter = '<svg viewBox="0 0 40 66" fill="none" stroke="#FF6FA6" stroke-width="5" stroke-linecap="round"><path d="M20 4 C7 10 6 28 9 46"/><path d="M20 4 C33 10 34 28 31 46"/><path d="M9 46 C14 56 26 56 31 46"/><path d="M9 28 H31"/><circle cx="20" cy="58" r="4" stroke="#C9CED6" stroke-width="3"/></svg>';
const svgLichter = () => {
  const cols = ['#FFE27A', '#FF8FC0', '#8FD3FF', '#B9F28C', '#FFB86B'];
  let b = '';
  for (let i = 0; i < 13; i++) {
    const x = 10 + i * 28;
    const y = 10 + Math.sin((i / 12) * Math.PI) * 14;
    b += `<circle class="bulb" style="animation-delay:${(i % 4) * 0.3}s" cx="${x}" cy="${y + 7}" r="5" fill="${cols[i % 5]}"/>`;
  }
  return `<svg viewBox="0 0 360 34"><path d="M0 8 Q180 40 360 8" stroke="#3C6B3C" stroke-width="2" fill="none"/>${b}</svg>`;
};
const frame = (inner, bg = '#BDE8FF') => `<div class="st-frame" style="background:${bg}">${inner}</div>`;

/**
 * Alle Dinge, die im Stall stehen können.
 * w = Breite in Einheiten, y/x = Startplatz, snap = wo es gern einrastet.
 */
export const ITEMS = {
  sattel:    { label: 'Sattel', free: true, w: 54, x: RACK.x, y: RACK.y, snap: 'rack', html: () => svgSattel },
  trense:    { label: 'Trense', free: true, w: 22, x: HOOKS[0][0], y: HOOKS[0][1] + 40, drop: 40, snap: 'hook', html: () => svgTrense },
  putzkorb:  { label: 'Putzkorb', free: true, emoji: '🧺', w: 30, x: 44, y: 146, snap: 'shelf' },
  eimer:     { label: 'Eimer', free: true, emoji: '🪣', w: 26, x: 30, y: 292, snap: 'floor' },
  heu:       { label: 'Heuballen', emoji: '🌾', w: 36, x: 372, y: 292, snap: 'floor' },
  blume:     { label: 'Blumentopf', emoji: '🌻', w: 28, x: 112, y: 84, snap: 'shelf' },
  apfel:     { label: 'Apfelkorb', emoji: '🍎', w: 24, x: 106, y: 146, snap: 'shelf' },
  laterne:   { label: 'Laterne', emoji: '🏮', w: 26, x: HOOKS[3][0], y: HOOKS[3][1] + 34, drop: 34, snap: 'hook' },
  schild:    { label: 'Namensschild', w: 74, x: 70, y: 212, snap: 'wall', html: () => `<div class="st-plate">${T(S.horse.name || 'Pferd', { syllables: false, speak: false })}</div>` },
  lichter:   { label: 'Lichterkette', w: 300, x: 200, y: 34, snap: 'wall', html: svgLichter },
  katze:     { label: 'Stallkatze', emoji: '🐈', w: 34, x: 96, y: 294, snap: 'floor' },
  hase:      { label: 'Hase', emoji: '🐇', w: 28, x: 330, y: 296, snap: 'floor' },
  pokal:     { label: 'Pokal', emoji: '🏆', w: 28, x: 40, y: 84, snap: 'shelf' },
  regenbogen:{ label: 'Regenbogen', emoji: '🌈', w: 44, x: 74, y: 44, snap: 'wall' },
  halfter:   { label: 'Halfter', w: 22, x: HOOKS[1][0], y: HOOKS[1][1] + 38, drop: 38, snap: 'hook', html: () => svgHalfter },
  glocke:    { label: 'Glocke', emoji: '🔔', w: 22, x: HOOKS[2][0], y: HOOKS[2][1] + 26, drop: 26, snap: 'hook' },
  foto:      { label: 'Foto', w: 44, x: 262, y: 118, snap: 'wall', html: () => frame(myHorse(S, { cls: '' })) },
  kissen:    { label: 'Herzkissen', emoji: '💖', w: 24, x: 76, y: 84, snap: 'shelf' },
};
const HORSE = { w: 190, x: 214, y: 294 };

const has = (id) => ITEMS[id].free || S.owned.includes(id);
export const placedItems = () => Object.keys(ITEMS).filter(has);

function posOf(id) {
  const p = S.stall?.pos?.[id];
  if (p) return p;
  const it = id === 'pferd' ? HORSE : ITEMS[id];
  return [it.x, it.y];
}

function itemHTML(id) {
  const it = ITEMS[id];
  const [x, y] = posOf(id);
  const inner = it.emoji ? `<span class="st-emoji">${it.emoji}</span>` : it.html();
  return `<div class="st-item ${it.emoji ? 'is-emoji' : ''} st-${id}" data-id="${id}" style="left:${(x / W) * 100}%;top:${(y / H) * 100}%;--w:${it.w}">${inner}</div>`;
}

function backgroundSVG() {
  let planks = '';
  for (let x = 0; x < W; x += 25) planks += `<rect x="${x}" y="0" width="25" height="${FLOOR_Y}" fill="${(x / 25) % 2 ? '#C98B57' : '#C38451'}"/><rect x="${x + 24}" y="0" width="1.4" height="${FLOOR_Y}" fill="#A86E42"/>`;
  const shelf = ({ x1, x2, y }) => `
    <rect x="${x1}" y="${y}" width="${x2 - x1}" height="7" rx="2" fill="#8E5A33"/>
    <rect x="${x1}" y="${y}" width="${x2 - x1}" height="2.5" fill="#A8703F"/>
    <path d="M${x1 + 12} ${y + 7} l0 14 l12 -14 Z M${x2 - 12} ${y + 7} l0 14 l-12 -14 Z" fill="#7A4A2A"/>`;
  const hooks = HOOKS.map(([x, y]) => `<path d="M${x} ${y - 6} v8 q0 7 6 7 q5 0 5 -5" stroke="#5E5A57" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="${x}" cy="${y - 7}" r="2.4" fill="#5E5A57"/>`).join('');
  return `<svg class="st-bg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    ${planks}
    <rect x="0" y="0" width="${W}" height="8" fill="#9C6338"/>
    <!-- Fenster -->
    <rect x="152" y="22" width="88" height="66" rx="6" fill="#8E5A33"/>
    <rect x="158" y="28" width="76" height="54" rx="4" fill="#BDE8FF"/>
    <circle cx="214" cy="44" r="9" fill="#FFE27A"/>
    <path d="M158 70 Q180 58 200 66 T234 62 V82 H158 Z" fill="#9BD67A"/>
    <rect x="193" y="28" width="5" height="54" fill="#8E5A33"/><rect x="158" y="52" width="76" height="5" fill="#8E5A33"/>
    <!-- Regale -->
    ${SHELVES.map(shelf).join('')}
    <!-- Hakenleiste -->
    <rect x="282" y="44" width="106" height="9" rx="3" fill="#8E5A33"/>
    ${hooks}
    <!-- Sattelhalter -->
    <path d="M${RACK.x - 24} ${RACK.y - 4} h48 v5 h-48 Z" fill="#7A4A2A"/><path d="M${RACK.x} ${RACK.y + 1} v14" stroke="#7A4A2A" stroke-width="5"/>
    <!-- Boden -->
    <rect x="0" y="${FLOOR_Y}" width="${W}" height="${H - FLOOR_Y}" fill="#E8C872"/>
    <rect x="0" y="${FLOOR_Y}" width="${W}" height="5" fill="#B8823F"/>
    <g stroke="#D4AE52" stroke-width="2" stroke-linecap="round">
      <path d="M20 248 l12 -5 M70 270 l14 4 M150 240 l9 -6 M250 262 l13 -4 M320 246 l11 5 M360 278 l-12 -4 M190 284 l13 3 M110 290 l10 -4"/>
    </g>
  </svg>`;
}

/** Bühne als HTML */
export function stableHTML() {
  const [hx, hy] = posOf('pferd');
  return `<div class="stable-stage">
    ${backgroundSVG()}
    ${placedItems().filter((id) => ITEMS[id].snap === 'wall' || ITEMS[id].snap === 'hook' || ITEMS[id].snap === 'rack' || ITEMS[id].snap === 'shelf').map(itemHTML).join('')}
    <div class="st-item st-horse" data-id="pferd" style="left:${(hx / W) * 100}%;top:${(hy / H) * 100}%;--w:${HORSE.w}">${myHorse(S, { cls: 'idle' })}</div>
    ${placedItems().filter((id) => ITEMS[id].snap === 'floor').map(itemHTML).join('')}
    <div class="talk"></div>
  </div>`;
}

// Einrasten auf Regal, Haken oder Sattelhalter, wenn man nah dran loslässt
function snap(id, x, y) {
  if (id === 'pferd') return [x, Math.max(FLOOR_Y + 30, y)];
  const it = ITEMS[id];
  const near = 14;
  if (it.snap === 'shelf' || it.snap === 'floor' || it.snap === 'rack') {
    for (const s of SHELVES) {
      if (x > s.x1 - 4 && x < s.x2 + 4 && Math.abs(y - s.y) < near) return [x, s.y];
    }
  }
  if (it.snap === 'rack' && Math.hypot(x - RACK.x, y - RACK.y) < 26) return [RACK.x, RACK.y];
  if (it.snap === 'hook') {
    const top = y - it.drop;
    for (const [hx, hy] of HOOKS) {
      if (Math.abs(x - hx) < 14 && Math.abs(top - hy) < 20) return [hx, hy + it.drop];
    }
  }
  return [x, y];
}

/** Macht die Gegenstände in einer Bühne verschiebbar. */
export function enableEditing(stage, { onMove } = {}) {
  let drag = null;
  const rectOf = () => stage.getBoundingClientRect();
  const toUnits = (e) => {
    const r = rectOf();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };
  $$('.st-item', stage).forEach((el) => {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const id = el.dataset.id;
      const [px, py] = toUnits(e);
      const [x, y] = posOf(id);
      drag = { el, id, dx: x - px, dy: y - py };
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
      el.classList.add('dragging');
      stage.appendChild(el); // nach vorne holen
      sfx.tap();
    });
    el.addEventListener('pointermove', (e) => {
      if (!drag || drag.el !== el) return;
      const [px, py] = toUnits(e);
      const x = Math.min(W - 6, Math.max(6, px + drag.dx));
      const y = Math.min(H, Math.max(20, py + drag.dy));
      el.style.left = `${(x / W) * 100}%`;
      el.style.top = `${(y / H) * 100}%`;
      drag.x = x; drag.y = y;
    });
    const end = () => {
      if (!drag || drag.el !== el) return;
      el.classList.remove('dragging');
      if (drag.x != null) {
        const [x, y] = snap(drag.id, drag.x, drag.y);
        el.style.left = `${(x / W) * 100}%`;
        el.style.top = `${(y / H) * 100}%`;
        S.stall.pos[drag.id] = [Math.round(x), Math.round(y)];
        save();
        sfx.pop();
        el.classList.add('placed'); setTimeout(() => el.classList.remove('placed'), 300);
        onMove?.(drag.id);
      }
      drag = null;
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  });
}

export function resetStall() {
  S.stall.pos = {};
  save();
}

export function stableHorse(stage) {
  return $('.st-horse svg', stage);
}
