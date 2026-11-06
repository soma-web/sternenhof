// Gemeinsame Bausteine: Navigation, Kopfzeile, Belohnungen, Effekte.
import { S, save } from './state.js';
import { renderText } from './syllables.js';
import { sfx, speak } from './audio.js';

const routes = {};
export function register(name, fn) { routes[name] = fn; }
export function go(name, ...args) {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  routes[name](...args);
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function mount(html, cls = '') {
  const root = document.getElementById('app');
  root.innerHTML = `<div class="screen ${cls}">${html}</div>`;
  window.scrollTo(0, 0);
  return root.firstElementChild;
}

// Platzhalter {name} und {horse} ersetzen
export function fill(str) {
  return String(str)
    .replaceAll('{name}', S.player.name || 'du')
    .replaceAll('{horse}', S.horse.name || 'dein Pferd');
}
export const T = (str, opts) => renderText(fill(str), opts);

export const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function shoeIcon(size = 26) {
  return `<svg class="shoe-ico" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M8 5 C3 14 5 26 16 27 C27 26 29 14 24 5" fill="none" stroke="#F2B33D" stroke-width="6" stroke-linecap="round"/>
    <g fill="#B97B17"><circle cx="7.2" cy="13" r="1.2"/><circle cx="9" cy="20" r="1.2"/><circle cx="24.8" cy="13" r="1.2"/><circle cx="23" cy="20" r="1.2"/></g>
  </svg>`;
}

export function topbar({ home = true, title = '' } = {}) {
  return `<header class="topbar">
    ${home ? `<button class="icon-btn" data-act="home" aria-label="Zum Stall">🏠</button>` : '<span class="icon-spacer"></span>'}
    <div class="topbar-title">${title}</div>
    <div class="shoes" aria-label="Hufeisen">${shoeIcon()}<span class="shoe-count">${S.shoes}</span></div>
  </header>`;
}

export function bindTopbar(scr) {
  const h = $('[data-act="home"]', scr);
  if (h) h.addEventListener('click', () => { sfx.tap(); go('hub'); });
}

export function reward(n) {
  if (n <= 0) return;
  S.shoes += n;
  save();
  sfx.coin();
  const box = $('.shoes');
  const cnt = $('.shoe-count');
  if (cnt) cnt.textContent = S.shoes;
  if (box) {
    box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump');
    const f = document.createElement('div');
    f.className = 'plus-float';
    f.textContent = `+${n}`;
    box.appendChild(f);
    setTimeout(() => f.remove(), 1200);
  }
}

// Herzen / Sterne aufsteigen lassen
export function burst(x, y, chars = ['💖', '⭐', '✨'], count = 8) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = pick(chars);
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty('--dx', `${rand(-90, 90)}px`);
    p.style.setProperty('--dy', `${rand(-160, -60)}px`);
    p.style.animationDelay = `${i * 40}ms`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1600);
  }
}
export function burstAt(elem, chars, count) {
  const r = elem.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, chars, count);
}

// Antippen eines Wortes liest es vor (überall im Spiel)
export function initWordTap() {
  document.addEventListener('click', (e) => {
    const w = e.target.closest('.w');
    if (!w || !S.settings.speech) return;
    speak(w.dataset.w);
    w.classList.remove('said'); void w.offsetWidth; w.classList.add('said');
  });
}

// Rahmen für Aufgabenrunden: Kopfzeile, Fortschrittspunkte, Inhaltsbereich
export function taskFrame({ total, title = '', cls = '' }) {
  const scr = mount(`
    ${topbar({ title })}
    <div class="dots">${Array.from({ length: total }, () => '<span class="dot"></span>').join('')}</div>
    <div class="task-area"></div>
  `, `task ${cls}`);
  bindTopbar(scr);
  const dots = $$('.dot', scr);
  return {
    scr,
    area: $('.task-area', scr),
    progress(i) { dots.forEach((d, k) => d.classList.toggle('done', k < i)); dots.forEach((d, k) => d.classList.toggle('now', k === i)); },
  };
}

// Freundliche Rückmeldung in einer Sprechblase
export function say(target, text, kind = '') {
  target.innerHTML = text ? `<div class="bubble-msg ${kind}">${T(text)}</div>` : '';
}

const PRAISE = ['Super!', 'Toll gemacht!', 'Richtig!', 'Klasse!', 'Prima!', 'Wunderbar!', 'Genau!', 'Spitze!'];
const ENCOURAGE = ['Fast! Versuch es nochmal.', 'Hmm, schau noch mal genau.', 'Probier es noch einmal!'];
export const praise = () => pick(PRAISE);
export const encourage = () => pick(ENCOURAGE);

// Großer "Weiter"-Knopf
export function nextButton(label = 'Weiter') {
  return `<button class="btn btn-main btn-next">${label} ➜</button>`;
}

// Abschluss-Bildschirm einer Runde
export function roundDone({ title = 'Geschafft!', text = '', earned = 0, onNext, label = 'Weiter' }) {
  const scr = mount(`
    ${topbar({ home: false })}
    <div class="center-col">
      <div class="big-emoji pop-in">🏆</div>
      <h1 class="title">${T(title)}</h1>
      ${text ? `<p class="lead">${T(text)}</p>` : ''}
      ${earned ? `<div class="earned">${shoeIcon(36)} <b>+${earned}</b></div>` : ''}
      ${nextButton(label)}
    </div>`, 'done');
  sfx.win();
  setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 3, ['⭐', '✨', '💖', '🥕'], 14), 150);
  $('.btn-next', scr).addEventListener('click', () => { sfx.tap(); onNext(); });
}
