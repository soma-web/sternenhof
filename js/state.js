// Spielstand – wird lokal auf dem Gerät gespeichert.
const KEY = 'sternenhof-v1';

export const defaultState = () => ({
  version: 1,
  player: { name: '' },
  horse: {
    name: '', coat: 'fuchs', marking: 'stern', socks: false, pad: 'blau',
    style: { mane: 'offen', tail: 'offen', jewel: 'keins', wraps: 'keine', crown: 'keiner', ribbon: 'rosa' },
  },
  shoes: 0,
  chapter: 1,
  step: 0,
  maxStep: 0,
  chapterDone: false,
  progress: {},   // je Kapitel: { max, done }
  choices: {},    // Entscheidungen in der Geschichte
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

// Ältere Spielstände (nur Kapitel 1) übernehmen
function migrate(st) {
  if (!st.progress['1'] && (st.maxStep || st.chapterDone)) {
    st.progress['1'] = { max: Math.max(st.maxStep || 0, st.chapter === 1 ? st.step : 0), done: !!st.chapterDone };
  }
  return st;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(merge(defaultState(), JSON.parse(raw)));
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
