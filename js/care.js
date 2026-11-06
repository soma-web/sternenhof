// Cozy-Momente: Putzen, Hufe auskratzen, Satteln & Trensen.
import { S } from './state.js';
import { sfx, speak } from './audio.js';
import { myHorse, DIRT_SPOTS, HOOVES } from './horse.js';
import { mount, topbar, bindTopbar, T, $, $$, burst, burstAt, say, praise, shuffle, nextButton, reward } from './ui.js';

const BRUSH = `<svg viewBox="0 0 80 60" width="80" height="60" aria-hidden="true">
  <rect x="6" y="8" width="68" height="26" rx="13" fill="#B7774A"/>
  <rect x="12" y="13" width="56" height="8" rx="4" fill="#D69A6A"/>
  <g stroke="#F3E3C3" stroke-width="4" stroke-linecap="round">
    <path d="M14 36 v14 M22 36 v16 M30 36 v14 M38 36 v16 M46 36 v14 M54 36 v16 M62 36 v14 M70 36 v12"/>
  </g></svg>`;

function svgPoint(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function svgToScreen(svg, x, y) {
  const pt = svg.createSVGPoint();
  pt.x = x; pt.y = y;
  const p = pt.matrixTransform(svg.getScreenCTM());
  return [p.x, p.y];
}

export function brushGame(onDone) {
  const dirt = DIRT_SPOTS.map(() => 1);
  const mud = [true, true, true, true];
  const scr = mount(`
    ${topbar({ title: 'Putzen' })}
    <p class="instr">${T('Bürste {horse} sauber! Wisch mit dem Finger über den Schmutz.')}</p>
    <div class="stage care-stage">${myHorse(S, { dirt, mud, cls: 'big' })}<div class="brush-cursor">${BRUSH}</div></div>
    <div class="msg"></div>
    <div class="actions"></div>`, 'care');
  bindTopbar(scr);
  const stage = $('.stage', scr);
  const svg = $('svg.horse', scr);
  const cursor = $('.brush-cursor', scr);
  const instr = $('.instr', scr);
  const msg = $('.msg', scr);
  let phase = 'brush';
  let down = false;
  let strokes = 0;

  function moveCursor(e) {
    const r = stage.getBoundingClientRect();
    cursor.style.transform = `translate(${e.clientX - r.left - 40}px, ${e.clientY - r.top - 50}px)`;
    cursor.classList.add('show');
  }

  function brushAt(e) {
    const p = svgPoint(svg, e);
    let left = 0;
    dirt.forEach((o, i) => {
      if (o <= 0) return;
      const [x, y, r] = DIRT_SPOTS[i];
      if (Math.hypot(p.x - x, p.y - y) < r + 24) {
        dirt[i] = Math.max(0, o - 0.1);
        const el = svg.querySelector(`.dirt[data-i="${i}"]`);
        if (dirt[i] <= 0) {
          el?.remove();
          sfx.pop();
          const [sx, sy] = svgToScreen(svg, x, y);
          burst(sx, sy, ['✨'], 3);
        } else el?.setAttribute('opacity', dirt[i]);
      }
      if (dirt[i] > 0) left++;
    });
    if (++strokes % 6 === 0) sfx.brush();
    if (left === 0) startHooves();
  }

  function startHooves() {
    phase = 'hooves';
    down = false;
    cursor.classList.remove('show');
    stage.classList.add('hooves');
    svg.classList.add('happy');
    sfx.good();
    burstAt(svg, ['✨', '⭐'], 10);
    instr.innerHTML = T('Das Fell glänzt! Jetzt die *Hufe*. Tippe auf jeden Huf.');
  }

  function cleanHoof(e) {
    const p = svgPoint(svg, e);
    HOOVES.forEach(([x, y], i) => {
      if (!mud[i] || Math.hypot(p.x - x, p.y - y) > 34) return;
      mud[i] = false;
      svg.querySelector(`.mud[data-mud="${i}"]`)?.remove();
      sfx.pop();
      const [sx, sy] = svgToScreen(svg, x, y);
      burst(sx, sy, ['🪨', '✨'], 4);
    });
    if (mud.every((m) => !m)) finish();
  }

  function finish() {
    phase = 'done';
    sfx.win();
    burstAt(svg, ['💖', '✨', '⭐'], 14);
    instr.innerHTML = T('{horse} ist blitzsauber!');
    say(msg, `${praise()} {horse} freut sich.`, 'good');
    reward(2);
    $('.actions', scr).innerHTML = nextButton();
    $('.btn-next', scr).addEventListener('click', () => { sfx.tap(); onDone(); });
  }

  stage.addEventListener('pointerdown', (e) => {
    if (phase === 'brush') { down = true; stage.setPointerCapture?.(e.pointerId); moveCursor(e); brushAt(e); }
    else if (phase === 'hooves') cleanHoof(e);
  });
  stage.addEventListener('pointermove', (e) => {
    if (phase !== 'brush') return;
    moveCursor(e);
    if (down) brushAt(e);
  });
  const up = () => { down = false; };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('pointerleave', () => { if (phase === 'brush') cursor.classList.remove('show'); });
}

const TACK = [
  { id: 'pad', word: 'Satteldecke', hint: 'Zuerst die *Satteldecke*. Sie schützt den Rücken.' },
  { id: 'saddle', word: 'Sattel', hint: 'Der *Sattel* kommt auf die Decke.' },
  { id: 'girth', word: 'Gurt', hint: 'Der *Gurt* hält den Sattel fest.' },
  { id: 'bridle', word: 'Trense', hint: 'Zum Schluss die *Trense* an den Kopf.' },
];

export function saddleGame(onDone) {
  const gear = {};
  let next = 0;
  let wrong = 0;
  const scr = mount(`
    ${topbar({ title: 'Satteln' })}
    <p class="instr">${T('Mach {horse} fertig zum Reiten. Was kommt *zuerst*?')}</p>
    <div class="stage saddle-stage"></div>
    <div class="msg"></div>
    <div class="cards">${shuffle(TACK).map((t) => `
      <div class="card tack" data-id="${t.id}" role="button" tabindex="0">
        <span class="card-word">${T(t.word, { speak: false })}</span>
        <button class="say-btn" data-say="${t.word}" aria-label="Vorlesen">🔊</button>
      </div>`).join('')}</div>
    <div class="actions"></div>`, 'care');
  bindTopbar(scr);
  const stage = $('.saddle-stage', scr);
  const instr = $('.instr', scr);
  const msg = $('.msg', scr);
  const draw = () => { stage.innerHTML = myHorse(S, { gear, cls: 'big' }); };
  draw();

  function attempt(id, card) {
    if (next >= TACK.length) return;
    if (id === TACK[next].id) {
      gear[id] = true;
      draw();
      card.classList.add('placed');
      sfx.good();
      next++;
      wrong = 0;
      burstAt(stage, ['✨'], 5);
      if (next < TACK.length) {
        say(msg, praise(), 'good');
        instr.innerHTML = T('Und was kommt *jetzt*?');
      } else {
        finish();
      }
    } else {
      sfx.soft();
      wrong++;
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      say(msg, wrong >= 2 ? TACK[next].hint : 'Noch nicht! Lies noch einmal genau.', 'hint');
    }
  }

  function finish() {
    $('svg.horse', stage).classList.add('happy');
    sfx.win();
    burstAt(stage, ['💖', '⭐', '✨'], 14);
    instr.innerHTML = T('Fertig! {horse} ist bereit.');
    say(msg, 'Toll gesattelt!', 'good');
    reward(2);
    $('.actions', scr).innerHTML = nextButton();
    $('.btn-next', scr).addEventListener('click', () => { sfx.tap(); onDone(); });
  }

  // Antippen oder Ziehen
  $$('.card.tack', scr).forEach((card) => {
    let start = null;
    let ghost = null;
    card.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.say-btn') || card.classList.contains('placed')) return;
      start = { x: e.clientX, y: e.clientY };
      card.setPointerCapture?.(e.pointerId);
    });
    card.addEventListener('pointermove', (e) => {
      if (!start) return;
      if (!ghost && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 12) {
        ghost = card.cloneNode(true);
        ghost.classList.add('ghost');
        document.body.appendChild(ghost);
        card.classList.add('dragging');
      }
      if (ghost) ghost.style.transform = `translate(${e.clientX - 70}px, ${e.clientY - 30}px)`;
    });
    const end = (e) => {
      if (!start) return;
      if (ghost) {
        ghost.remove(); ghost = null;
        card.classList.remove('dragging');
        const r = stage.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) attempt(card.dataset.id, card);
      } else {
        attempt(card.dataset.id, card);
      }
      start = null;
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', () => { start = null; ghost?.remove(); ghost = null; card.classList.remove('dragging'); });
  });
  $$('.say-btn', scr).forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); speak(b.dataset.say); }));
}
