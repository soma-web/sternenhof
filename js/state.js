// Spielstand – wird lokal auf dem Gerät gespeichert.
const KEY = 'sternenhof-v1';

export const defaultState = () => ({
  version: 1,
  player: { name: '' },
  horse: { name: '', coat: 'fuchs', marking: 'stern', socks: false, pad: 'blau' },
  shoes: 0,
  chapter: 1,
  step: 0,
  maxStep: 0,
  chapterDone: false,
  mathLevel: 2,
  mathStreak: 0,
  mathMiss: 0,
  settings: { syllables: true, speech: true, sound: true },
  owned: [],
  stats: { mathRight: 0, mathTotal: 0, readRight: 0, readTotal: 0 },
});

function merge(base, data) {
  for (const k of Object.keys(data || {})) {
    if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && typeof data[k] === 'object') merge(base[k], data[k]);
    else base[k] = data[k];
  }
  return base;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return merge(defaultState(), JSON.parse(raw));
  } catch (e) { /* privater Modus o. ä. */ }
  return defaultState();
}

export const S = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignorieren */ }
}

export function resetAll() {
  const fresh = defaultState();
  for (const k of Object.keys(S)) delete S[k];
  Object.assign(S, fresh);
  save();
}
