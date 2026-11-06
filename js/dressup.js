// Schmücken: Mähne, Schweif, Stirnschmuck, Gamaschen, Blumenkranz, Bandfarbe
import { S, save } from './state.js';
import { sfx, speak } from './audio.js';
import { myHorse, RIBBONS, WRAPS, RAINBOW, DEFAULT_STYLE } from './horse.js';
import { mount, topbar, bindTopbar, T, $, $$, burstAt, shoeIcon, pick } from './ui.js';

const CATS = [
  { key: 'mane', label: 'Mähne', icon: '💇', opts: [
    { v: 'offen', label: 'Offen', price: 0 },
    { v: 'knoten', label: 'Knötchen', price: 0 },
    { v: 'zopf', label: 'Zopf', price: 5 },
    { v: 'schleifen', label: 'Schleifen', price: 6 },
  ] },
  { key: 'jewel', label: 'Schmuck', icon: '💎', opts: [
    { v: 'keins', label: 'Keiner', price: 0 },
    { v: 'blau', label: 'Blaue Steine', price: 8 },
    { v: 'perlen', label: 'Perlen', price: 8 },
    { v: 'sterne', label: 'Gold-Sterne', price: 10 },
  ] },
  { key: 'crown', label: 'Kranz', icon: '🌸', opts: [
    { v: 'keiner', label: 'Keiner', price: 0 },
    { v: 'blumen', label: 'Blumenkranz', price: 6 },
  ] },
  { key: 'tail', label: 'Schweif', icon: '🎀', opts: [
    { v: 'offen', label: 'Offen', price: 0 },
    { v: 'schleife', label: 'Schleife', price: 3 },
    { v: 'zopf', label: 'Zopf', price: 5 },
  ] },
  { key: 'wraps', label: 'Gamaschen', icon: '🧦', opts: [
    { v: 'keine', label: 'Keine', price: 0 },
    { v: 'rosa', label: 'Rosa', price: 4 },
    { v: 'blau', label: 'Blau', price: 4 },
    { v: 'lila', label: 'Lila', price: 4 },
    { v: 'mint', label: 'Mint', price: 4 },
    { v: 'rot', label: 'Rot', price: 4 },
    { v: 'regenbogen', label: 'Regenbogen', price: 8 },
  ] },
  { key: 'ribbon', label: 'Bänder', icon: '🌈', opts: Object.keys(RIBBONS).map((v) => ({ v, label: v.charAt(0).toUpperCase() + v.slice(1).replace('ss', 'ß'), price: 0 })) },
];

const COMPLIMENTS = ['Wunderschön!', 'So hübsch!', 'Was für ein schönes Pferd!', 'Toll siehst du aus!', 'Wie eine Prinzessin!', 'Einfach zauberhaft!'];

const ownedKey = (cat, v) => `style-${cat}-${v}`;
const isOwned = (cat, o) => o.price === 0 || S.owned.includes(ownedKey(cat, o.v));

function swatch(cat, o) {
  if (cat === 'wraps') {
    if (o.v === 'keine') return '<span class="sw-x">–</span>';
    if (o.v === 'regenbogen') return `<span class="sw-dot" style="background:conic-gradient(${RAINBOW.join(',')})"></span>`;
    return `<span class="sw-dot" style="background:${WRAPS[o.v]}"></span>`;
  }
  if (cat === 'ribbon') return `<span class="sw-dot" style="background:${RIBBONS[o.v]};${o.v === 'weiss' ? 'box-shadow:inset 0 0 0 2px #ddd' : ''}"></span>`;
  const icons = {
    mane: { offen: '〰️', knoten: '⚪', zopf: '🥨', schleifen: '🎀' },
    jewel: { keins: '–', blau: '💎', perlen: '🤍', sterne: '⭐' },
    crown: { keiner: '–', blumen: '🌸' },
    tail: { offen: '〰️', schleife: '🎀', zopf: '🥨' },
  };
  return `<span class="sw-emoji">${icons[cat]?.[o.v] || '•'}</span>`;
}

/** Schmücken. opts.story: in der Geschichte (mit "Fertig"-Text) */
export function dressUp(onDone, { story = false } = {}) {
  S.horse.style = { ...DEFAULT_STYLE, ...(S.horse.style || {}) };
  let cat = CATS[0].key;

  const scr = mount(`
    ${topbar({ title: 'Schmücken' })}
    <p class="instr">${T(story ? 'Mach {horse} schön für das Fest!' : 'Mach {horse} ganz schön!')}</p>
    <div class="stage dress-stage"><div class="dress-horse"></div><div class="talk"></div></div>
    <div class="dress-actions">
      <button class="btn btn-small photo-btn">📸 Foto</button>
      <button class="btn btn-small btn-done">Fertig ➜</button>
    </div>
    <div class="cat-tabs">${CATS.map((c) => `<button class="cat-tab" data-cat="${c.key}"><span>${c.icon}</span><span class="cat-label">${T(c.label, { speak: false })}</span></button>`).join('')}</div>
    <div class="dress-opts"></div>
    <div class="msg"></div>
`, 'dress');
  bindTopbar(scr);
  const horseBox = $('.dress-horse', scr);
  const optsBox = $('.dress-opts', scr);
  const msg = $('.msg', scr);
  const talk = $('.talk', scr);

  const drawHorse = () => { horseBox.innerHTML = myHorse(S, { cls: 'big idle' }); };
  const shoesLabel = () => { const c = $('.shoe-count'); if (c) c.textContent = S.shoes; };

  function drawOpts() {
    $$('.cat-tab', scr).forEach((b) => b.classList.toggle('sel', b.dataset.cat === cat));
    const c = CATS.find((x) => x.key === cat);
    optsBox.innerHTML = c.opts.map((o) => {
      const own = isOwned(cat, o);
      const sel = S.horse.style[cat] === o.v;
      return `<button class="dress-opt ${sel ? 'sel' : ''} ${own ? '' : 'locked'}" data-v="${o.v}">
        ${swatch(cat, o)}
        <span class="opt-name">${T(o.label, { speak: false })}</span>
        ${own ? '' : `<span class="opt-price">${shoeIcon(18)}${o.price}</span>`}
      </button>`;
    }).join('');
    $$('.dress-opt', optsBox).forEach((b) => b.addEventListener('click', () => choose(c, b)));
  }

  function choose(c, b) {
    const o = c.opts.find((x) => x.v === b.dataset.v);
    if (!isOwned(c.key, o)) {
      if (S.shoes < o.price) {
        sfx.soft();
        msg.innerHTML = `<div class="bubble-msg hint">${T(`Dafür brauchst du ${o.price} Hufeisen. Du hast ${S.shoes}.`)}</div>`;
        return;
      }
      S.shoes -= o.price;
      S.owned.push(ownedKey(c.key, o.v));
      shoesLabel();
      sfx.coin();
      msg.innerHTML = `<div class="bubble-msg good">${T(`Gekauft: ${o.label}!`)}</div>`;
    } else {
      msg.innerHTML = '';
      sfx.pop();
    }
    S.horse.style[c.key] = o.v;
    save();
    drawHorse();
    drawOpts();
    burstAt(horseBox, ['✨'], 4);
  }

  $$('.cat-tab', scr).forEach((b) => b.addEventListener('click', () => { sfx.tap(); cat = b.dataset.cat; msg.innerHTML = ''; drawOpts(); }));

  $('.photo-btn', scr).addEventListener('click', () => {
    sfx.win();
    const flash = document.createElement('div');
    flash.className = 'flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
    const line = pick(COMPLIMENTS);
    talk.innerHTML = `<div class="talk-bubble pop-in">${T(line)}</div>`;
    speak(line);
    $('svg.horse', horseBox)?.classList.add('happy');
    burstAt(horseBox, ['💖', '✨', '⭐', '🌸'], 14);
  });

  $('.btn-done', scr).addEventListener('click', () => { sfx.tap(); onDone(); });
  drawHorse();
  drawOpts();
}
