// Kleine Klänge (selbst erzeugt, keine Dateien nötig) und Vorlesen.
import { S } from './state.js';

let ctx = null;
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (C) ctx = new C();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = 'sine', vol = 0.14) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function play(notes, type, vol) {
  if (!S.settings.sound) return;
  try { notes.forEach(([f, s, d]) => tone(f, s, d, type, vol)); } catch (e) { /* ignorieren */ }
}

export const sfx = {
  tap: () => play([[620, 0, 0.08]], 'sine', 0.08),
  good: () => play([[660, 0, 0.15], [880, 0.1, 0.15], [1320, 0.2, 0.3]], 'sine', 0.12),
  soft: () => play([[392, 0, 0.18], [349, 0.15, 0.25]], 'triangle', 0.1),
  pop: () => play([[900, 0, 0.06], [1200, 0.04, 0.08]], 'sine', 0.08),
  coin: () => play([[1046, 0, 0.08], [1568, 0.07, 0.2]], 'square', 0.04),
  brush: () => play([[180 + Math.random() * 60, 0, 0.05]], 'triangle', 0.03),
  win: () => play([[523, 0, 0.15], [659, 0.12, 0.15], [784, 0.24, 0.15], [1046, 0.36, 0.4]], 'sine', 0.13),
  jump: () => play([[300, 0, 0.1], [500, 0.08, 0.12], [800, 0.16, 0.15]], 'sine', 0.1),
  heart: () => play([[740, 0, 0.1], [988, 0.09, 0.18]], 'sine', 0.09),
};

// Muss einmal nach einer Berührung aufgerufen werden (iOS).
export function unlockAudio() { ac(); }

let voice = null;
function pickVoice() {
  if (voice || !('speechSynthesis' in window)) return voice;
  const vs = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('de'));
  voice = vs.find((v) => /female|anna|petra|helena|katja|hedda|google/i.test(v.name)) || vs[0] || null;
  return voice;
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { voice = null; pickVoice(); };

export function canSpeak() { return 'speechSynthesis' in window; }

export function speak(text, rate = 0.8) {
  if (!S.settings.speech || !canSpeak()) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = rate;
    u.pitch = 1.1;
    const v = pickVoice();
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { /* ignorieren */ }
}
