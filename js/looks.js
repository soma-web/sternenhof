// Schmück-Baukasten: Farben, Muster, Formen und Preise.
// Farben und Muster werden einmal freigeschaltet und gelten dann für alle Teile.

export const PALETTE = {
  rosa:    { label: 'Rosa',    hex: '#FF8FC0' },
  rot:     { label: 'Rot',     hex: '#E8605A' },
  gelb:    { label: 'Gelb',    hex: '#F4C542' },
  mint:    { label: 'Mint',    hex: '#4FC9A4' },
  tuerkis: { label: 'Türkis',  hex: '#25BCD0' },
  blau:    { label: 'Blau',    hex: '#4F7FE8' },
  lila:    { label: 'Lila',    hex: '#A27FE8' },
  weiss:   { label: 'Weiß',    hex: '#FAFAFA' },
  schwarz: { label: 'Schwarz', hex: '#2E2A2E' },
};
export const FREE_COLORS = ['rosa', 'blau', 'weiss'];
export const COLOR_PRICE = 6;

export const PATTERNS = {
  uni:        { label: 'Einfarbig',  price: 0 },
  streifen:   { label: 'Streifen',   price: 12 },
  punkte:     { label: 'Punkte',     price: 12 },
  rauten:     { label: 'Rauten',     price: 15 },
  sterne:     { label: 'Sterne',     price: 18 },
  herzen:     { label: 'Herzen',     price: 18 },
  glitzer:    { label: 'Glitzer',    price: 20 },
  regenbogen: { label: 'Regenbogen', price: 20 },
};

export const METALS = {
  silber: { label: 'Silber', price: 0, ring: '#CBD1D9', dark: '#8E97A4' },
  gold:   { label: 'Gold',   price: 10, ring: '#E5B640', dark: '#B5841A' },
};

export const MANES = [
  { v: 'offen', label: 'Offen', price: 0, icon: '〰️' },
  { v: 'knoten', label: 'Knötchen', price: 0, icon: '⚪' },
  { v: 'zopf', label: 'Zopf', price: 12, icon: '🥨' },
  { v: 'schleifen', label: 'Schleifen', price: 15, icon: '🎀' },
];
export const TAILS = [
  { v: 'offen', label: 'Offen', price: 0, icon: '〰️' },
  { v: 'schleife', label: 'Schleife', price: 8, icon: '🎀' },
  { v: 'zopf', label: 'Zopf', price: 12, icon: '🥨' },
];
export const JEWELS = [
  { v: 'keins', label: 'Keiner', price: 0 },
  { v: 'band', label: 'Stirnband', price: 15 },
  { v: 'bogen', label: 'Anhänger', price: 20 },
  { v: 'perlband', label: 'Perlenband', price: 25 },
  { v: 'ykette', label: 'Nasenkette', price: 25 },
  { v: 'doppel', label: 'Doppelbogen', price: 30 },
  { v: 'sterne', label: 'Sterne', price: 35 },
];
export const HATS = [
  { v: 'keiner', label: 'Keiner', price: 0, icon: '–' },
  { v: 'blumen', label: 'Blumenkranz', price: 20, icon: '🌸' },
  { v: 'muetze', label: 'Mütze', price: 25, icon: '🧶' },
  { v: 'haube', label: 'Ohrenhaube', price: 30, icon: '🎧' },
];
export const WRAP_FORMS = [
  { v: 'keine', label: 'Keine', price: 0, icon: '–' },
  { v: 'an', label: 'Gamaschen', price: 0, icon: '🧦' },
];

export const RAINBOW5 = ['#E8605A', '#F4C542', '#4FC9A4', '#4F7FE8', '#A27FE8'];

export const DEFAULT_LOOK = {
  mane: 'offen', tail: 'offen', ribbon: 'rosa',
  jewel: 'keins', jewelColor: 'blau', jewelMetal: 'silber',
  hat: 'keiner', hatColor: 'rosa', hatPattern: 'uni', hatRim: 'weiss',
  wraps: 'keine', wrapColor: 'rosa', wrapPattern: 'uni',
  padColor: 'blau', padPattern: 'uni', padRim: 'weiss',
};

export const colorHex = (name, fallback = '#4F7FE8') => PALETTE[name]?.hex || fallback;
const accentFor = (name) => (name === 'weiss' || name === 'gelb' ? '#FF6FA6' : '#FFFFFF');

const STAR = 'M0 -5 L1.5 -1.5 5 -1.5 2.2 0.8 3.2 4.5 0 2.3 -3.2 4.5 -2.2 0.8 -5 -1.5 -1.5 -1.5 Z';
const HEART = 'M0 3.2 C-6.5 -1 -3.4 -6.4 0 -2.6 C3.4 -6.4 6.5 -1 0 3.2 Z';

/**
 * Liefert { def, fill } für ein Muster. def kommt in <defs>, fill ist die Füllung.
 * s = Kachelgröße in SVG-Einheiten.
 */
export function patternFill(id, pattern, colorName, s = 10) {
  const base = colorHex(colorName);
  if (!pattern || pattern === 'uni') return { def: '', fill: base };
  const a = accentFor(colorName);
  const h = s / 2;
  let inner = `<rect width="${s}" height="${s}" fill="${base}"/>`;
  let w = s; let ht = s;
  switch (pattern) {
    case 'streifen':
      inner += `<rect width="${s}" height="${(s * 0.38).toFixed(2)}" fill="${a}" opacity=".9"/>`;
      break;
    case 'punkte':
      inner += `<circle cx="${s * 0.25}" cy="${s * 0.25}" r="${(s * 0.15).toFixed(2)}" fill="${a}"/><circle cx="${s * 0.75}" cy="${s * 0.75}" r="${(s * 0.15).toFixed(2)}" fill="${a}"/>`;
      break;
    case 'rauten':
      inner += `<path d="M${h} ${s * 0.08} L${s * 0.9} ${h} L${h} ${s * 0.92} L${s * 0.1} ${h} Z" fill="${a}" opacity=".9"/>`;
      break;
    case 'sterne':
      inner += `<path transform="translate(${h} ${h}) scale(${(s * 0.075).toFixed(3)})" d="${STAR}" fill="${a}"/>`;
      break;
    case 'herzen':
      inner += `<path transform="translate(${h} ${s * 0.55}) scale(${(s * 0.065).toFixed(3)})" d="${HEART}" fill="${a}"/>`;
      break;
    case 'glitzer': {
      const g = a === '#FFFFFF' ? '#FFFFFF' : '#FFFFFF';
      inner += [[0.2, 0.3, 0.1], [0.7, 0.15, 0.06], [0.55, 0.62, 0.12], [0.15, 0.82, 0.06], [0.86, 0.86, 0.08], [0.4, 0.95, 0.04]]
        .map(([x, y, r]) => `<circle cx="${(x * s).toFixed(2)}" cy="${(y * s).toFixed(2)}" r="${(r * s).toFixed(2)}" fill="${g}" stroke="${colorName === 'weiss' ? '#C9CED6' : 'none'}" stroke-width=".4"/>`).join('');
      break;
    }
    case 'regenbogen': {
      const b = s * 0.4;
      ht = b * RAINBOW5.length;
      inner = RAINBOW5.map((c, i) => `<rect y="${(i * b).toFixed(2)}" width="${w}" height="${(b + 0.05).toFixed(2)}" fill="${c}"/>`).join('');
      break;
    }
    default:
      return { def: '', fill: base };
  }
  return {
    def: `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${ht.toFixed ? +ht.toFixed(2) : ht}">${inner}</pattern>`,
    fill: `url(#${id})`,
  };
}

let swN = 0;
/** Kleines Vorschau-Quadrat für ein Muster */
export function patternSwatch(pattern, colorName) {
  const id = `sw${++swN}`;
  const { def, fill } = patternFill(id, pattern, colorName, 17);
  return `<svg class="pat-sw" viewBox="0 0 36 36" aria-hidden="true"><defs>${def}</defs><rect x="1" y="1" width="34" height="34" rx="9" fill="${fill}" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/></svg>`;
}

// ---------- Spielstand-Umzug von der alten Schmück-Version ----------
const OLD_JEWEL = { blau: ['ykette', 'blau', 'gold'], perlen: ['ykette', 'weiss', 'gold'], sterne: ['sterne', 'gelb', 'gold'] };

export function migrateLook(st) {
  const h = st.horse;
  const old = h.style || {};
  if (old.v === 2) return;
  const owned = new Set(st.owned || []);
  const add = (k) => owned.add(k);
  for (const k of [...owned]) {
    let m = k.match(/^style-(mane|tail)-(\w+)$/);
    if (m) { add(`form-${m[1]}-${m[2]}`); owned.delete(k); continue; }
    m = k.match(/^style-jewel-(\w+)$/);
    if (m && OLD_JEWEL[m[1]]) { const [f, c, me] = OLD_JEWEL[m[1]]; add(`form-jewel-${f}`); add(`farbe-${c}`); add(`metall-${me}`); owned.delete(k); continue; }
    if (k === 'style-crown-blumen') { add('form-hat-blumen'); owned.delete(k); continue; }
    m = k.match(/^style-wraps-(\w+)$/);
    if (m) { add(m[1] === 'regenbogen' ? 'muster-regenbogen' : `farbe-${m[1]}`); owned.delete(k); continue; }
    m = k.match(/^pad-(\w+)$/);
    if (m) { add(`farbe-${m[1]}`); owned.delete(k); }
  }
  const look = { ...DEFAULT_LOOK, mane: old.mane || 'offen', tail: old.tail || 'offen', ribbon: old.ribbon || 'rosa' };
  if (OLD_JEWEL[old.jewel]) [look.jewel, look.jewelColor, look.jewelMetal] = OLD_JEWEL[old.jewel];
  if (old.crown === 'blumen') look.hat = 'blumen';
  if (old.wraps && old.wraps !== 'keine') {
    look.wraps = 'an';
    if (old.wraps === 'regenbogen') look.wrapPattern = 'regenbogen'; else look.wrapColor = old.wraps;
  }
  if (h.pad && PALETTE[h.pad]) look.padColor = h.pad;
  look.v = 2;
  h.style = look;
  st.owned = [...owned];
}
