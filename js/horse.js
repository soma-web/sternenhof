// Das Pferd als SVG – Fellfarbe, Abzeichen, Ausrüstung, Schmutz.
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

// Positionen für Schmutzflecken (im Koordinatensystem des Pferdes)
export const DIRT_SPOTS = [
  [140, 150, 15], [180, 135, 13], [222, 150, 16], [165, 190, 14], [205, 192, 13],
  [118, 172, 12], [255, 165, 12], [272, 112, 11], [250, 200, 12],
];
// Hufe: Mittelpunkte (hinten fern, hinten nah, vorne fern, vorne nah)
export const HOOVES = [[130, 255], [151, 261], [246, 255], [267, 261]];

let uidN = 0;

function leg(x, y, w, h, fill, lower, sock, idx) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${fill}"/>`;
  if (lower) s += `<rect x="${x}" y="${y + h - 36}" width="${w}" height="36" rx="${w / 2 - 2}" fill="${lower}"/>`;
  if (sock) s += `<rect x="${x}" y="${y + h - 28}" width="${w}" height="28" rx="${w / 2 - 2}" fill="#FBF8F3"/>`;
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
  const padColor = PADS[opts.pad] || PADS.blau;
  const lower = c.legs;

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
  <defs><clipPath id="clip-${uid}">
    <ellipse cx="195" cy="165" rx="100" ry="52"/>
    <path d="M240 140 C246 108 258 82 282 60 L318 76 C306 102 296 134 290 172 Z"/>
  </clipPath></defs>
  <ellipse cx="200" cy="268" rx="125" ry="9" fill="rgba(0,0,0,.12)"/>
  <!-- ferne Beine -->
  <g>
    ${leg(120, 182, 20, 72, c.shade, lower, opts.socks, 0)}
    ${leg(236, 182, 20, 72, c.shade, lower, opts.socks, 2)}
  </g>
  <!-- Schweif -->
  <g class="h-tail">
    <path d="M100 140 C62 150 52 214 72 252 C80 232 84 206 104 172 Z" fill="${c.mane}"/>
    <path d="M106 150 C84 170 80 214 92 246 C96 222 100 196 114 170 Z" fill="${c.mane}" opacity=".85"/>
  </g>
  <!-- Körper -->
  <ellipse cx="195" cy="165" rx="100" ry="52" fill="${c.body}"/>
  <ellipse cx="190" cy="196" rx="70" ry="16" fill="${c.shade}" opacity=".35"/>
  <!-- nahe Beine -->
  ${leg(140, 186, 22, 74, c.body, lower, opts.socks, 1)}
  ${leg(256, 186, 22, 74, c.body, lower, opts.socks, 3)}
  <!-- Hals -->
  <path d="M240 140 C246 108 258 82 282 60 L318 76 C306 102 296 134 290 172 Z" fill="${c.body}"/>
  ${patches}
  ${dirt}
  ${mud}
  ${g.pad ? `<path class="gear-pad" d="M158 116 H234 Q242 116 242 124 V170 Q242 178 234 178 H166 Q158 178 158 170 Z" fill="${padColor}" stroke="rgba(255,255,255,.75)" stroke-width="3"/>` : ''}
  ${g.girth ? `<rect class="gear-girth" x="207" y="134" width="14" height="82" rx="4" fill="#5A3A22"/>` : ''}
  ${g.saddle ? `<g class="gear-saddle">
      <path d="M168 120 C170 102 190 104 198 116 C208 108 226 104 232 118 L228 136 Q200 142 172 136 Z" fill="#7A4A2A"/>
      <path d="M182 117 Q200 125 218 114" stroke="#9A643C" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M196 136 L198 190" stroke="#5A3520" stroke-width="4"/>
      <path d="M190 190 h16 l-2 9 h-12 Z" fill="#B8BEC6"/>
    </g>` : ''}
  <path d="M288 54 C268 58 250 80 242 106 C236 126 232 146 236 160 L248 150 C250 128 256 104 268 84 C276 72 286 64 298 62 Z" fill="${c.mane}"/>
  <!-- Kopf (etwas größer für den niedlichen Look) -->
  <g transform="translate(300 96) scale(1.2) translate(-300 -96)">
  <g class="h-head">
    <path class="h-ear2" d="M304 66 L314 40 L322 68 Z" fill="${c.shade}"/>
    <ellipse cx="318" cy="92" rx="36" ry="25" transform="rotate(38 318 92)" fill="${c.body}"/>
    <ellipse cx="341" cy="116" rx="21" ry="18" fill="${c.muzzle}"/>
    ${marking}
    <g class="h-ear"><path d="M292 64 L296 36 L310 60 Z" fill="${c.body}"/><path d="M296 58 L298 45 L305 58 Z" fill="#F2B8A8"/></g>
    <path d="M296 60 C306 60 314 66 314 78 C306 76 300 70 296 60 Z" fill="${c.mane}"/>
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
  ${opts.bow ? `<g transform="translate(262 86) rotate(-25)"><path d="M0 0 L-14 -9 L-14 9 Z M0 0 L14 -9 L14 9 Z" fill="#FF6FA6"/><circle r="4.5" fill="#E24D8A"/></g>` : ''}
</svg>`;
}

// Kurzform mit den Daten aus dem Spielstand
export function myHorse(S, extra = {}) {
  return horseSVG({
    coat: S.horse.coat, marking: S.horse.marking, socks: S.horse.socks, pad: S.horse.pad,
    bow: S.owned.includes('schleife'), ...extra,
  });
}
