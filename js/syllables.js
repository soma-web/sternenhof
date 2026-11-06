// Silbentrennung (vereinfachte deutsche Regeln) und Darstellung mit Silbenfarben.
import { S } from './state.js';

// Wörter, bei denen die Regeln nicht passen.
const EXC = {
  ferien: 'Fe-ri-en', familie: 'Fa-mi-li-e', hufkratzer: 'Huf-krat-zer', sternenhof: 'Ster-nen-hof',
  satteldecke: 'Sat-tel-de-cke', putzzeug: 'Putz-zeug', abend: 'A-bend', oben: 'o-ben',
  ihr: 'ihr', ihre: 'ih-re', ihrem: 'ih-rem', ihrer: 'ih-rer', ihren: 'ih-ren',
  bauernhof: 'Bau-ern-hof', heraus: 'he-raus', herein: 'he-rein', heute: 'heu-te',
  traust: 'traust', parcours: 'Par-cours', freundin: 'Freun-din', freunde: 'Freun-de',
  ausreiten: 'aus-rei-ten', losreiten: 'los-rei-ten', schaut: 'schaut', zuerst: 'zu-erst',
  sattelkammer: 'Sat-tel-kam-mer', kammer: 'Kam-mer', fohlen: 'Foh-len', überraschung: 'Ü-ber-ra-schung',
  pferdeleckerli: 'Pfer-de-le-cker-li', leckerli: 'Le-cker-li', lichterkette: 'Lich-ter-ket-te',
  blumentopf: 'Blu-men-topf', heuballen: 'Heu-bal-len', namensschild: 'Na-mens-schild',
  stallkatze: 'Stall-kat-ze', schaukelpferd: 'Schau-kel-pferd', regenbogen: 'Re-gen-bo-gen',
};
const VG = ['äu', 'au', 'eu', 'ei', 'ai', 'ie', 'aa', 'ee', 'oo'];
const CG = ['sch', 'ch', 'ck', 'ph', 'qu'];
const ONSETS = new Set(['bl', 'br', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kr', 'pl', 'pr', 'tr', 'schl', 'schm', 'schn', 'schr', 'schw', 'pfl', 'pfr']);
const isV = (c) => 'aeiouäöüy'.includes(c);

export function syllabify(word) {
  const lw = word.toLowerCase();
  if (EXC[lw]) {
    let i = 0;
    return EXC[lw].split('-').map((p) => { const s = word.slice(i, i + p.length); i += p.length; return s; });
  }
  const units = [];
  let i = 0;
  while (i < lw.length) {
    const v = isV(lw[i]);
    const m = (v ? VG : CG).find((g) => lw.startsWith(g, i)) || lw[i];
    units.push({ s: m, v, i });
    i += m.length;
  }
  const vIdx = units.map((u, k) => (u.v ? k : -1)).filter((k) => k >= 0);
  if (vIdx.length < 2) return [word];
  const cuts = [];
  for (let k = 0; k < vIdx.length - 1; k++) {
    const a = vIdx[k];
    const b = vIdx[k + 1];
    const n = b - a - 1;
    let cut;
    if (n === 0) cut = b;
    else if (n === 1) cut = a + 1;
    else {
      cut = b - 1;
      for (let len = Math.min(3, n); len >= 2; len--) {
        const on = units.slice(b - len, b).map((u) => u.s).join('');
        if (ONSETS.has(on)) { cut = b - len; break; }
      }
    }
    cuts.push(units[cut].i);
  }
  const parts = [];
  let last = 0;
  for (const c of cuts) { parts.push(word.slice(last, c)); last = c; }
  parts.push(word.slice(last));
  return parts.filter(Boolean);
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Text -> HTML mit antippbaren Wörtern und (optional) Silbenfarben.
// *Wort* wird hervorgehoben. opts.speak=false macht Wörter nicht antippbar.
export function renderText(str, opts = {}) {
  const syll = opts.syllables ?? S.settings.syllables;
  const tappable = opts.speak !== false;
  let n = 0;
  const parts = String(str).split('*');
  return parts.map((seg, idx) => {
    const html = seg.replace(/([A-Za-zÄÖÜäöüß]+)|([^A-Za-zÄÖÜäöüß]+)/g, (m, word, other) => {
      if (other) return esc(other);
      const inner = syll
        ? syllabify(word).map((s) => `<span class="syl ${n++ % 2 ? 'syl-b' : 'syl-a'}">${esc(s)}</span>`).join('')
        : esc(word);
      return tappable ? `<span class="w" data-w="${esc(word)}">${inner}</span>` : `<span class="w-static">${inner}</span>`;
    });
    return idx % 2 ? `<strong class="em">${html}</strong>` : html;
  }).join('');
}
