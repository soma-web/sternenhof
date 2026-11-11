// Das Pferd als SVG – Fellfarbe, Abzeichen, Ausrüstung, Schmuck, Schmutz.
import { DEFAULT_LOOK, METALS, colorHex, patternFill } from './looks.js';

export const COATS = {
  fuchs:    { label: 'Fuchs',    body: '#CF7A3E', shade: '#AE5F2C', mane: '#8E3F1C', muzzle: '#B8673A' },
  brauner:  { label: 'Brauner',  body: '#8E5A37', shade: '#71452A', mane: '#2B1D17', muzzle: '#5E3A26', legs: '#2B1D17' },
  rappe:    { label: 'Rappe',    body: '#3E3438', shade: '#2C2427', mane: '#1A1517', muzzle: '#54484C' },
  schimmel: { label: 'Schimmel', body: '#F3EFE8', shade: '#DCD5CA', mane: '#CFC7BB', muzzle: '#E3D9CD' },
  palomino: { label: 'Palomino', body: '#E8B95E', shade: '#CC9C44', mane: '#FFF4DA', muzzle: '#D6A24E' },
  falbe:    { label: 'Falbe',    body: '#DDBB7E', shade: '#C29E60', mane: '#4A3626', muzzle: '#A88456', legs: '#4A3626' },
  schecke:  { label: 'Schecke',  body: '#F7F2EB', shade: '#DED6CA', mane: '#5B3B25', muzzle: '#E6DCCF', patch: '#9A5E36' },
};
export const MARKINGS = { keine: 'Keine', stern: 'Stern', blesse: 'Blesse' };
export const PADS = { blau: '#5B8DEF', rosa: '#F28DB2', lila: '#A98BEB', mint: '#4FC9A4', rot: '#E8605A', gelb: '#F4C542' };

export const RIBBONS = { rosa: '#FF6FA6', blau: '#4D86F0', lila: '#9B6BE8', gelb: '#F4C21F', rot: '#E8453C', weiss: '#FFFFFF' };

// Punkte entlang der Mähne / des Schweifs
const MANE_PTS = [[285, 62], [274, 72], [265, 84], [258, 97], [252, 111], [247, 125], [244, 139], [242, 152]];
const TAIL_PTS = [[103, 150], [98, 163], [93, 176], [89, 189], [86, 202], [84, 215], [82, 228]];

function bowSVG(x, y, color, size = 1, rot = -20) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${size})">
    <path d="M0 0 L-13 -8 Q-16 0 -13 8 Z M0 0 L13 -8 Q16 0 13 8 Z" fill="${color}" stroke="rgba(0,0,0,.15)" stroke-width="1"/>
    <path d="M-2 2 L-6 12 M2 2 L6 12" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    <circle r="4" fill="${color}" stroke="rgba(0,0,0,.2)" stroke-width="1"/></g>`;
}

function flower(x, y, color, r = 3) {
  let p = '';
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    p += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${r * 0.8}" fill="${color}" stroke="rgba(0,0,0,.08)" stroke-width=".5"/>`;
  }
  return `${p}<circle cx="${x}" cy="${y}" r="${r * 0.65}" fill="#F6B826"/>`;
}

function maneSVG(st, c, ribbon) {
  const full = `<path d="M288 54 C268 58 250 80 242 106 C236 126 232 146 236 160 L248 150 C250 128 256 104 268 84 C276 72 286 64 298 62 Z" fill="${c.mane}"/>`;
  const thin = `<path d="M292 57 C274 62 258 82 250 106 C245 124 242 142 243 156 L249 150 C251 128 257 104 268 85 C276 73 286 65 298 62 Z" fill="${c.mane}"/>`;
  if (st.mane === 'knoten') {
    return thin + MANE_PTS.map(([x, y]) => `<circle cx="${x - 3}" cy="${y}" r="6.5" fill="${c.mane}" stroke="rgba(0,0,0,.18)" stroke-width="1.2"/>
      <path d="M${x - 9} ${y + 1} q6 3 12 0" stroke="${ribbon}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join('');
  }
  if (st.mane === 'zopf') {
    return thin + MANE_PTS.map(([x, y], k) => `<ellipse cx="${x - 5 + (k % 2 ? 2 : -2)}" cy="${y}" rx="8" ry="5.5" transform="rotate(${k % 2 ? 35 : -35} ${x - 5} ${y})" fill="${c.mane}" stroke="rgba(0,0,0,.2)" stroke-width="1.2"/>`).join('')
      + bowSVG(240, 158, ribbon, 0.9, -10);
  }
  if (st.mane === 'schleifen') {
    return full + [[275, 72], [258, 98], [246, 128]].map(([x, y]) => bowSVG(x - 2, y, ribbon, 0.75, -30)).join('');
  }
  return full;
}

function tailSVG(st, c, ribbon) {
  if (st.tail === 'zopf') {
    return TAIL_PTS.map(([x, y], k) => `<ellipse cx="${x + (k % 2 ? 2 : -2)}" cy="${y}" rx="9" ry="7" transform="rotate(${k % 2 ? 25 : -25} ${x} ${y})" fill="${c.mane}" stroke="rgba(0,0,0,.2)" stroke-width="1.2"/>`).join('')
      + `<path d="M82 232 C66 248 70 262 78 266 C84 258 96 248 86 232 Z" fill="${c.mane}"/>`
      + bowSVG(82, 233, ribbon, 0.8, 0);
  }
  const open = `<path d="M100 140 C62 150 52 214 72 252 C80 232 84 206 104 172 Z" fill="${c.mane}"/>
    <path d="M106 150 C84 170 80 214 92 246 C96 222 100 196 114 170 Z" fill="${c.mane}" opacity=".85"/>`;
  return st.tail === 'schleife' ? open + bowSVG(103, 150, ribbon, 1, 10) : open;
}

const STAR = 'M0 -5 L1.5 -1.5 5 -1.5 2.2 0.8 3.2 4.5 0 2.3 -3.2 4.5 -2.2 0.8 -5 -1.5 -1.5 -1.5 Z';

// Punkte auf einer quadratischen Kurve
function qpts(p0, p1, p2, ts) {
  return ts.map((t) => [
    +((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]).toFixed(1),
    +((1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]).toFixed(1),
  ]);
}

/** Stirnschmuck: Form, Steinfarbe, Metall (Koordinaten im Kopf) */
function jewelSVG(st) {
  const kind = st.jewel;
  if (!kind || kind === 'keins') return '';
  const m = METALS[st.jewelMetal] || METALS.silber;
  const col = colorHex(st.jewelColor);
  const gem = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * 0.82).toFixed(2)}" fill="${col}" stroke="${m.ring}" stroke-width="1.5"/><circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${(r * 0.32).toFixed(2)}" fill="#fff" opacity=".85"/>`;
  const star = (x, y, r) => `<path transform="translate(${x} ${y}) scale(${r})" d="${STAR}" fill="${col}" stroke="${m.dark}" stroke-width=".7"/>`;
  const line = (d, w = 1.5) => `<path d="${d}" stroke="${m.dark}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const BAND = 'M300 64 Q314 66 329 72';
  const bandPts = [[304, 64.6], [311, 66], [318, 68], [325, 70.5]];
  const chainD = 'M322 70 Q332 84 339 99';
  const chain = [[327, 78], [333, 87], [338, 95]];
  switch (kind) {
    case 'band':
      return line(BAND, 2) + bandPts.map(([x, y]) => gem(x, y, 2.8)).join('');
    case 'bogen':
      return line(BAND, 2) + bandPts.map(([x, y]) => gem(x, y, 2.5)).join('')
        + line('M324 71 L330 79', 1.3) + `<circle cx="330" cy="79" r="1.5" fill="${m.ring}"/>` + gem(332, 84, 4.2)
        + `<circle cx="324" cy="70.6" r="2.4" fill="${m.ring}" stroke="${m.dark}" stroke-width=".6"/>`;
    case 'perlband': {
      const pts = qpts([300, 64], [314, 66], [329, 72], [0.04, 0.16, 0.28, 0.4, 0.52, 0.64, 0.76, 0.88, 1]);
      return line(BAND, 1.2) + pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.1" fill="${i % 2 ? '#FFFDF8' : col}" stroke="${m.ring}" stroke-width=".7"/><circle cx="${(x - 0.6).toFixed(1)}" cy="${(y - 0.7).toFixed(1)}" r=".7" fill="#fff"/>`).join('');
    }
    case 'ykette':
      return line(BAND, 2) + bandPts.map(([x, y]) => gem(x, y, 2.8)).join('')
        + line(chainD, 1.4) + chain.map(([x, y]) => gem(x, y, 2.4)).join('')
        + `<circle cx="322" cy="69.6" r="3.6" fill="${m.ring}"/>` + gem(340, 101, 3.4);
    case 'doppel': {
      const low = qpts([303, 67], [320, 80], [333, 76], [0.2, 0.5, 0.8]);
      return line(BAND, 2) + line('M303 67 Q320 80 333 76', 1.4)
        + line(`M${low[1][0]} ${low[1][1]} l0 3.5`, 1) + gem(low[1][0], +(low[1][1] + 5).toFixed(1), 1.8)
        + [[306, 65], [317, 67.6]].map(([x, y]) => gem(x, y, 2.4)).join('')
        + `<circle cx="327" cy="71" r="2.6" fill="${m.ring}" stroke="${m.dark}" stroke-width=".6"/>`
        + low.map(([x, y]) => gem(x, y, 2)).join('');
    }
    case 'sterne':
      return line(BAND, 2) + bandPts.map(([x, y]) => star(x, y, 0.9)).join('')
        + line(chainD, 1.4) + chain.map(([x, y]) => star(x, y, 0.75)).join('') + star(340, 101, 1.15);
    default:
      return '';
  }
}

// ---------- Hüte ----------
const HAUBE_CAP = 'M288 70 C289 63 296 60 303 60 C316 59 332 65 341 77 C347 86 351 96 351 104 L344 105 C341 94 335 84 327 78 C318 74 306 74 296 74 C292 74 289 72 288 70 Z';
const HAUBE_EDGE = 'M344 105 C341 94 335 84 327 78 C318 74 306 74 296 74 C292 74 289 72 288 70';

function hatParts(st, uid) {
  const out = { far: '', mid: '', near: '', top: '', defs: '' };
  const hat = st.hat;
  if (!hat || hat === 'keiner') return out;
  const rim = colorHex(st.hatRim, '#FAFAFA');
  if (hat === 'blumen') {
    const col = colorHex(st.hatColor, '#FF8FC0');
    const pts = [[287, 67], [294, 61], [302, 60], [310, 62], [318, 65], [326, 69]];
    const cols = [col, '#FFFFFF', col, '#FFE7F0', col, '#FFFFFF'];
    out.top = '<path d="M285 68 Q306 57 329 71" stroke="#5FAE52" stroke-width="3" fill="none" stroke-linecap="round"/>'
      + '<ellipse cx="290" cy="71" rx="4" ry="2" fill="#7CC46B" transform="rotate(-30 290 71)"/><ellipse cx="330" cy="73" rx="4" ry="2" fill="#7CC46B" transform="rotate(30 330 73)"/>'
      + pts.map(([x, y], k) => flower(x, y, cols[k], 3.6)).join('');
    return out;
  }
  const p = patternFill(`${uid}-hat`, st.hatPattern, st.hatColor, 6);
  out.defs = p.def;
  const stroke = 'stroke="rgba(0,0,0,.18)" stroke-width="1"';
  if (hat === 'haube') {
    out.far = `<path d="M301 70 C305 52 309 40 314 35 C318 42 322 56 326 71 Z" fill="${p.fill}" ${stroke}/>`;
    out.near = `<path d="M288 68 C290 50 293 38 296 31 C301 40 307 50 314 63 Z" fill="${p.fill}" ${stroke}/>`;
    out.top = `<path d="${HAUBE_CAP}" fill="${p.fill}" ${stroke}/>`
      + `<path d="${HAUBE_EDGE}" stroke="${rim}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    return out;
  }
  if (hat === 'muetze') {
    const ribs = [292, 299, 306, 313, 320, 327, 333].map((x) => {
      const y = 66 - 8 * (1 - ((x - 311) / 25) ** 2) + 0.5;
      return `<path d="M${x} ${y.toFixed(1)} v6" stroke="rgba(0,0,0,.14)" stroke-width="1.2"/>`;
    }).join('');
    out.mid = `<path d="M286 73 C283 57 296 45 312 45 C327 45 337 57 336 73 Q311 65 286 73 Z" fill="${p.fill}" ${stroke}/>`
      + `<path d="M286 73 Q311 65 336 73 L336 66 Q311 58 286 66 Z" fill="${rim}" ${stroke}/>`
      + ribs
      + `<circle cx="312" cy="44" r="6" fill="${rim}" ${stroke}/>`;
    return out;
  }
  return out;
}


// ---------- Einhorn: Horn, bunte Mähne, Glitzer ----------
function hornParts(st, uid) {
  if (st.horn !== 'horn') return { def: '', svg: '' };
  const p = patternFill(`${uid}-horn`, st.hornPattern, st.hornColor, 5);
  const svg = `<g class="h-horn">
    <path d="M300 61 Q306 40 317 19 Q319 17 319.5 20 Q316 42 313 60 Q306 63 300 61 Z" fill="${p.fill}" stroke="rgba(120,80,20,.45)" stroke-width="1.1"/>
    <path d="M302 54 q6 2 11 -2 M304 46 q5 2 10 -2 M307 38 q4 1.6 8 -1.6 M310 30 q3 1.2 6 -1.4 M313 23 q2 .8 4 -1" stroke="rgba(120,80,20,.4)" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M304 56 Q308 40 316 23" stroke="rgba(255,255,255,.65)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  </g>`;
  return { def: p.def, svg };
}

const MANE_HEX = { rosa: '#FF8FC0', lila: '#A27FE8', tuerkis: '#25BCD0', blau: '#4F7FE8', silber: '#DDE3EA' };
const RAINBOW_STOPS = ['#E8605A', '#F4A63C', '#F4D442', '#6CCB6E', '#5BA8F0', '#9C7FE8'];
function maneFillFor(st, c, uid) {
  if (st.maneColor === 'regenbogen') {
    const id = `${uid}-rbm`;
    return {
      fill: `url(#${id})`,
      def: `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${RAINBOW_STOPS.map((col, k) => `<stop offset="${(k / (RAINBOW_STOPS.length - 1)).toFixed(2)}" stop-color="${col}"/>`).join('')}</linearGradient>`,
    };
  }
  return { fill: MANE_HEX[st.maneColor] || c.mane, def: '' };
}

const GLITTER_PTS = [[130, 140], [168, 128], [205, 136], [240, 150], [150, 178], [190, 172], [228, 188], [262, 118], [276, 92], [112, 166], [210, 160], [180, 150]];
function glitterSVG(st) {
  if (st.glitter !== 'an') return '';
  const star = (x, y, r, k) => `<path class="twinkle" style="animation-delay:${(k % 5) * 0.4}s" d="M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z" fill="${k % 3 ? '#FFFFFF' : '#FFE27A'}" opacity=".95"/>`;
  return `<g class="h-glitter">${GLITTER_PTS.map(([x, y], k) => star(x, y, k % 2 ? 4 : 6, k)).join('')}</g>`;
}

// Positionen für Schmutzflecken (im Koordinatensystem des Pferdes)
export const DIRT_SPOTS = [
  [140, 150, 15], [180, 135, 13], [222, 150, 16], [165, 190, 14], [205, 192, 13],
  [118, 172, 12], [255, 165, 12], [272, 112, 11], [250, 200, 12],
];
// Hufe: Mittelpunkte (hinten fern, hinten nah, vorne fern, vorne nah)
export const HOOVES = [[130, 255], [151, 261], [246, 255], [267, 261]];

let uidN = 0;

function leg(x, y, w, h, fill, lower, sock, idx, wrap) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${fill}"/>`;
  if (lower) s += `<rect x="${x}" y="${y + h - 36}" width="${w}" height="36" rx="${w / 2 - 2}" fill="${lower}"/>`;
  if (sock) s += `<rect x="${x}" y="${y + h - 28}" width="${w}" height="28" rx="${w / 2 - 2}" fill="#FBF8F3"/>`;
  if (wrap) {
    s += `<rect x="${x - 2}" y="${y + h - 36}" width="${w + 4}" height="30" rx="6" fill="${wrap.fill}" stroke="rgba(0,0,0,.12)" stroke-width="1"/>`;
    if (wrap.lines) s += `<path d="M${x} ${y + h - 27} h${w} M${x} ${y + h - 17} h${w}" stroke="rgba(255,255,255,.7)" stroke-width="3"/>`;
  }
  s += `<rect class="hoof" data-hoof="${idx}" x="${x - 1}" y="${y + h - 6}" width="${w + 2}" height="14" rx="4" fill="#4A3B33"/>`;
  return s;
}

/**
 * opts: coat, marking, socks, pad (Farbname), gear {pad, saddle, girth, bridle}, bow,
 *       dirt (Array mit Deckkraft je Fleck), mud (Array bool je Huf), cls
 */
export function horseSVG(opts = {}) {
  const c = COATS[opts.coat] || COATS.fuchs;
  const uid = `h${++uidN}`;
  const g = opts.gear || {};
  const lower = c.legs;
  const st = { ...DEFAULT_LOOK, ...(opts.style || {}) };
  if (!opts.style && opts.pad) st.padColor = opts.pad;
  const ribbon = RIBBONS[st.ribbon] || RIBBONS.rosa;
  const wp = patternFill(`${uid}-wrap`, st.wrapPattern, st.wrapColor, 7);
  const wrapOf = () => (st.wraps === 'an' ? { fill: wp.fill, lines: st.wrapPattern === 'uni' } : null);
  const pp = patternFill(`${uid}-pad`, st.padPattern, st.padColor, 12);
  const padRim = colorHex(st.padRim, '#FAFAFA');
  const hat = hatParts(st, uid);
  const mf = maneFillFor(st, c, uid);
  const cm = { ...c, mane: mf.fill };
  const horn = hornParts(st, uid);
  const forelock = `<path d="M296 60 C306 60 314 66 314 78 C306 76 300 70 296 60 Z" fill="${cm.mane}"/>`;

  const patches = c.patch ? `
    <g clip-path="url(#clip-${uid})" fill="${c.patch}">
      <ellipse cx="150" cy="150" rx="42" ry="34"/>
      <ellipse cx="230" cy="190" rx="34" ry="24"/>
      <ellipse cx="275" cy="105" rx="18" ry="26"/>
      <ellipse cx="110" cy="190" rx="20" ry="18"/>
    </g>` : '';

  const marking = opts.marking === 'stern'
    ? `<path d="M328 69 l3.5 5.5 6 1.5 -6 1.8 -3.5 5.7 -3.5 -5.7 -6 -1.8 6 -1.5 Z" fill="#FFFDF8"/>`
    : opts.marking === 'blesse'
      ? `<path d="M323 69 C329 67 334 71 336 78 C340 90 346 100 353 105 L347 112 C339 104 332 94 328 84 C325 78 322 74 323 69 Z" fill="#FFFDF8"/>`
      : '';

  const dirt = (opts.dirt || []).map((o, i) => {
    if (o <= 0) return '';
    const [x, y, r] = DIRT_SPOTS[i];
    return `<g class="dirt" data-i="${i}" opacity="${o}">
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.75}" fill="#8B6B4A"/>
      <ellipse cx="${x + r * 0.7}" cy="${y - r * 0.5}" rx="${r * 0.35}" ry="${r * 0.3}" fill="#7A5B3C"/>
      <circle cx="${x - r * 0.9}" cy="${y + r * 0.5}" r="${r * 0.22}" fill="#7A5B3C"/>
    </g>`;
  }).join('');

  const mud = (opts.mud || []).map((m, i) => {
    if (!m) return '';
    const [x, y] = HOOVES[i];
    return `<g class="mud" data-mud="${i}"><ellipse cx="${x}" cy="${y}" rx="13" ry="8" fill="#6E5235"/><circle cx="${x - 4}" cy="${y - 2}" r="3" fill="#9A8C7D"/><circle cx="${x + 5}" cy="${y + 1}" r="2.4" fill="#A79A8B"/></g>`;
  }).join('');

  return `<svg class="horse ${opts.cls || ''}" viewBox="36 14 352 266" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pferd">
  <defs>${wp.def}${pp.def}${hat.defs}${mf.def}${horn.def}<clipPath id="clip-${uid}">
    <ellipse cx="195" cy="165" rx="100" ry="52"/>
    <path d="M240 140 C246 108 258 82 282 60 L318 76 C306 102 296 134 290 172 Z"/>
  </clipPath></defs>
  <ellipse cx="200" cy="268" rx="125" ry="9" fill="rgba(0,0,0,.12)"/>
  <!-- ferne Beine -->
  <g>
    ${leg(120, 182, 20, 72, c.shade, lower, opts.socks, 0, wrapOf())}
    ${leg(236, 182, 20, 72, c.shade, lower, opts.socks, 2, wrapOf())}
  </g>
  <!-- Schweif -->
  <g class="h-tail">${tailSVG(st, cm, ribbon)}</g>
  <!-- Körper -->
  <ellipse cx="195" cy="165" rx="100" ry="52" fill="${c.body}"/>
  <ellipse cx="190" cy="196" rx="70" ry="16" fill="${c.shade}" opacity=".35"/>
  <!-- nahe Beine -->
  ${leg(140, 186, 22, 74, c.body, lower, opts.socks, 1, wrapOf())}
  ${leg(256, 186, 22, 74, c.body, lower, opts.socks, 3, wrapOf())}
  <!-- Hals -->
  <path d="M240 140 C246 108 258 82 282 60 L318 76 C306 102 296 134 290 172 Z" fill="${c.body}"/>
  ${patches}
  ${dirt}
  ${mud}
  ${glitterSVG(st)}
  ${g.pad ? `<path class="gear-pad" d="M158 116 H234 Q242 116 242 124 V170 Q242 178 234 178 H166 Q158 178 158 170 Z" fill="${pp.fill}" stroke="${padRim}" stroke-width="4.5"/>` : ''}
  ${g.girth ? `<rect class="gear-girth" x="207" y="134" width="14" height="82" rx="4" fill="#5A3A22"/>` : ''}
  ${g.saddle ? `<g class="gear-saddle">
      <path d="M168 120 C170 102 190 104 198 116 C208 108 226 104 232 118 L228 136 Q200 142 172 136 Z" fill="#7A4A2A"/>
      <path d="M182 117 Q200 125 218 114" stroke="#9A643C" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M196 136 L198 190" stroke="#5A3520" stroke-width="4"/>
      <path d="M190 190 h16 l-2 9 h-12 Z" fill="#B8BEC6"/>
    </g>` : ''}
  ${maneSVG(st, cm, ribbon)}
  <!-- Kopf (etwas größer für den niedlichen Look) -->
  <g transform="translate(300 96) scale(1.2) translate(-300 -96)">
  <g class="h-head">
    <path class="h-ear2" d="M304 66 L314 40 L322 68 Z" fill="${c.shade}"/>
    ${hat.far}
    <ellipse cx="318" cy="92" rx="36" ry="25" transform="rotate(38 318 92)" fill="${c.body}"/>
    <ellipse cx="341" cy="116" rx="21" ry="18" fill="${c.muzzle}"/>
    ${marking}
    ${st.hat === 'muetze' ? forelock + hat.mid + `<path d="M304 66 L314 40 L322 68 Z" fill="${c.shade}"/>` : ''}
    <g class="h-ear"><path d="M292 64 L296 36 L310 60 Z" fill="${c.body}"/><path d="M296 58 L298 45 L305 58 Z" fill="#F2B8A8"/>${hat.near}</g>
    ${st.hat === 'muetze' ? '' : forelock}
    ${hat.top}
    ${horn.svg}
    ${jewelSVG(st)}
    <ellipse cx="332" cy="101" rx="6.5" ry="4" fill="#FF8FA3" opacity=".35"/>
    <g class="h-eye">
      <circle cx="318" cy="86" r="7.5" fill="#2A1D1A"/>
      <circle cx="320.5" cy="83" r="2.6" fill="#fff"/>
      <circle cx="316" cy="89" r="1.2" fill="#fff"/>
    </g>
    <path d="M311 80 l-4 -3 M313.5 78.5 l-2 -4" stroke="#2A1D1A" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="352" cy="114" rx="3" ry="2.2" fill="rgba(0,0,0,.45)"/>
    <path d="M340 128 Q347 132 354 127" stroke="rgba(0,0,0,.45)" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${g.bridle ? `<g class="gear-bridle" fill="none" stroke="#6B3F22" stroke-width="4.5" stroke-linecap="round">
      <path d="M300 64 C312 84 326 106 337 124"/>
      <path d="M300 64 Q314 66 329 72"/>
      <path d="M327 104 C336 97 350 98 359 106"/>
      <path d="M302 66 C300 82 304 96 312 104"/>
      <circle cx="338" cy="125" r="4.5" stroke="#C9CED6" stroke-width="3"/>
      <path d="M338 125 C320 152 286 160 250 146"/>
    </g>` : ''}
  </g>
  </g>
  ${opts.bow && st.mane !== 'schleifen' ? bowSVG(262, 86, ribbon, 1, -25) : ''}
</svg>`;
}

// Kurzform mit den Daten aus dem Spielstand
export function myHorse(S, extra = {}) {
  return horseSVG({
    coat: S.horse.coat, marking: S.horse.marking, socks: S.horse.socks, pad: S.horse.pad, style: S.horse.style,
    bow: S.owned.includes('schleife'), ...extra,
  });
}
