// Spielstand – wird lokal auf dem Gerät gespeichert.
import { DEFAULT_LOOK, migrateLook } from './looks.js';

const KEY = 'sternenhof-v1';

export const defaultState = () => ({
  version: 1,
  player: { name: '' },
  horse: {
    name: '', coat: 'fuchs', marking: 'stern', socks: false, pad: 'blau',
    style: { ...DEFAULT_LOOK, v: 2 },
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
  spellLevel: 1,  // Schreib-Werkstatt, 1–5
  spellStreak: 0,
  spellMiss: 0,
  settings: { syllables: true, speech: true, sound: true },
  owned: [],
  stall: { pos: {} }, // Platz der Dinge im Stall
  stats: { mathRight: 0, mathTotal: 0, readRight: 0, readTotal: 0, spellRight: 0, spellTotal: 0 },
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
    if (raw) {
      const data = JSON.parse(raw);
      if (data.horse) migrateLook(data);
      return migrate(merge(defaultState(), data));
    }
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
