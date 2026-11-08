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
// ---------- Alma, der Familienhund ----------
// Weiß und schlank, dunkel gestromter Kopf mit weißer Blesse, Knickohren, ein paar Tupfen, Ringelschwanz.
const A_WHITE = '#FBF8F3';
const A_LINE = 'rgba(60,40,30,.22)';
const A_HEAD = '#4E3A30';
const A_BRINDLE = '#7A5C48';
const almaHead = (sleepy = false) => `
  <g>
    <path d="M86 19 Q84 9 90 8 Q93 10 92 19 Z" fill="#3A2B24"/>
    <ellipse cx="96" cy="26" rx="13" ry="11" fill="${A_HEAD}"/>
    <path d="M88 23 q4 -3 8 -1 M89 30 q4 -2 7 0" stroke="${A_BRINDLE}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M104 24 Q112 25 117 30 Q119 37 110 38 Q101 38 99 32 Z" fill="${A_WHITE}" stroke="${A_LINE}" stroke-width="1"/>
    <ellipse cx="116.5" cy="31" rx="3.2" ry="2.6" fill="#1E1714"/>
    <path d="M108 37 q3 1.6 6 0" stroke="#1E1714" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    ${sleepy
      ? '<path d="M99 26 q2.5 2 5 0" stroke="#1E1714" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
      : '<circle cx="101" cy="25" r="2.7" fill="#6B4426"/><circle cx="101" cy="25" r="1.5" fill="#1E1714"/><circle cx="101.8" cy="24.1" r=".7" fill="#fff"/>'}
    <path d="M92 18 Q93 7 101 7 Q107 8 106 14 Q104 18 100 22 Q98 17 92 18 Z" fill="${A_HEAD}" stroke="${A_LINE}" stroke-width=".7"/>
    <path d="M101 8 Q106 9 105.5 14" stroke="#2E221D" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".6"/>
  </g>`;

export const svgAlma = `<svg viewBox="0 0 124 80">
  <ellipse cx="62" cy="76" rx="44" ry="3.5" fill="rgba(0,0,0,.12)"/>
  <path d="M28 40 C14 38 10 24 18 20 C25 17 27 26 21 28" stroke="${A_LINE}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M28 40 C14 38 10 24 18 20 C25 17 27 26 21 28" stroke="${A_WHITE}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M32 46 L30 72 h6 L39 48 Z M73 46 L72 72 h6 L79 48 Z" fill="#ECE5DA"/>
  <path d="M27 44 Q30 31 52 31 Q72 30 82 36 Q90 42 84 52 Q72 58 52 56 Q32 56 27 44 Z" fill="${A_WHITE}" stroke="${A_LINE}" stroke-width="1"/>
  <path d="M76 40 Q86 34 90 24 L101 31 Q95 43 84 51 Z" fill="${A_WHITE}"/>
  <path d="M39 50 L38 73 h6.5 L46 52 Z M80 48 L80 73 h6.5 L86 49 Z" fill="${A_WHITE}" stroke="${A_LINE}" stroke-width=".8"/>
  <ellipse cx="35" cy="39.5" rx="6.5" ry="5" fill="#2A201C" transform="rotate(-15 35 39.5)"/>
  <g fill="#3A2C26"><circle cx="45" cy="35" r="2.2"/><circle cx="56" cy="33.5" r="1.5"/><circle cx="64" cy="35.5" r="2.6"/><circle cx="37" cy="39" r="1.3"/><circle cx="71" cy="40" r="1.2"/></g>
  <g fill="#E8E1D6"><ellipse cx="33" cy="73" rx="5" ry="2.4"/><ellipse cx="41.5" cy="74" rx="5" ry="2.4"/><ellipse cx="75" cy="73" rx="5" ry="2.4"/><ellipse cx="83.5" cy="74" rx="5" ry="2.4"/></g>
  ${almaHead()}
</svg>`;

export const svgAlmaKorb = (() => {
  let weave = '';
  for (let x = 18; x <= 104; x += 7) weave += `<path d="M${x} ${62 + Math.abs(x - 61) * -0.12 + 6} q2 6 0 11" stroke="#7E4E26" stroke-width="1.3" fill="none" opacity=".55"/>`;
  return `<svg viewBox="0 0 124 80">
  <ellipse cx="62" cy="76" rx="58" ry="4" fill="rgba(0,0,0,.12)"/>
  <ellipse cx="62" cy="52" rx="57" ry="20" fill="#9A6634"/>
  <ellipse cx="62" cy="48" rx="50" ry="15" fill="#BFC8D2"/>
  <path d="M26 46 Q40 28 66 31 Q96 31 107 46 Q90 54 62 54 Q38 54 26 46 Z" fill="#1FA9C8"/>
  <path d="M36 40 l58 2 M30 45 l74 2 M42 35 l44 0" stroke="#E9FBFF" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>
  <ellipse cx="74" cy="41" rx="27" ry="12" fill="${A_WHITE}" stroke="${A_LINE}" stroke-width="1"/>
  <ellipse cx="96" cy="40" rx="6" ry="4.6" fill="#2A201C" transform="rotate(25 96 40)"/>
  <g fill="#3A2C26"><circle cx="72" cy="32.5" r="1.8"/><circle cx="84" cy="35" r="1.3"/><circle cx="90" cy="39" r="1.1"/></g>
  <path d="M98 45 C94 53 72 55 54 51" stroke="${A_LINE}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M98 45 C94 53 72 55 54 51" stroke="${A_WHITE}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <g transform="translate(-60 16)">${almaHead(true)}</g>
  <path d="M7 55 Q62 86 117 55 L115 63 Q62 92 9 63 Z" fill="#A87140"/>
  <path d="M7 55 Q62 86 117 55" stroke="#8A5A2C" stroke-width="5" fill="none" stroke-linecap="round"/>
  ${weave}
</svg>`;
})();


export const svgSternHufeisen = `<svg viewBox="0 0 60 64">
  <defs><linearGradient id="goldgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE68A"/><stop offset=".55" stop-color="#F2B33D"/><stop offset="1" stop-color="#C98A1B"/></linearGradient></defs>
  <path d="M12 8 C2 26 6 54 30 56 C54 54 58 26 48 8" fill="none" stroke="#9A6A12" stroke-width="13" stroke-linecap="round"/>
  <path d="M12 8 C2 26 6 54 30 56 C54 54 58 26 48 8" fill="none" stroke="url(#goldgrad)" stroke-width="10" stroke-linecap="round"/>
  <g fill="#9A6A12"><circle cx="9.5" cy="22" r="1.6"/><circle cx="11" cy="36" r="1.6"/><circle cx="50.5" cy="22" r="1.6"/><circle cx="49" cy="36" r="1.6"/></g>
  <path transform="translate(30 30) scale(2.3)" d="M0 -5 L1.5 -1.5 5 -1.5 2.2 0.8 3.2 4.5 0 2.3 -3.2 4.5 -2.2 0.8 -5 -1.5 -1.5 -1.5 Z" fill="url(#goldgrad)" stroke="#9A6A12" stroke-width=".5"/>
  <circle cx="24" cy="14" r="1.6" fill="#fff" opacity=".9"/><circle cx="44" cy="44" r="1.2" fill="#fff" opacity=".8"/>
</svg>`;

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
  alma:      { label: 'Alma', w: 84, x: 96, y: 297, snap: 'floor', html: () => svgAlma },
  sternhufeisen: { label: 'Sternen-Hufeisen', w: 30, x: 268, y: 70, snap: 'wall', html: () => svgSternHufeisen },
  almakorb:  { label: 'Alma im Körbchen', w: 104, x: 322, y: 299, snap: 'floor', html: () => svgAlmaKorb },
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
