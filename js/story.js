// Die Geschichte: Szenen, Entscheidungen, Kapitelauswahl und Ablauf.
import { S, save } from './state.js';
import { sfx, speak } from './audio.js';
import { horseSVG, myHorse, COATS, MARKINGS } from './horse.js';
import { sceneBG } from './scenes.js';
import { mount, topbar, bindTopbar, T, fill, $, $$, go, nextButton, roundDone, reward, burstAt, pick } from './ui.js';
import { brushGame, saddleGame } from './care.js';
import { feedGame, jumpGame } from './math.js';
import { readingGame } from './reading.js';
import { tracksGame, riddleGame, syllableBridge } from './adventure.js';
import { dressUp } from './dressup.js';
import { CHAPTERS } from './chapters.js';

export { CHAPTERS };

const WHO = {
  rosi: { name: 'Tante Rosi', face: '👩‍🌾' },
  eule: { name: 'Ella, die Eule', face: '🦉' },
  emma: { name: 'Emma', face: '👧' },
};

const FULL_GEAR = { pad: true, saddle: true, girth: true, bridle: true };
const FUNKE = { coat: 'fuchs', marking: 'stern', socks: true };

function showcase(kind) {
  switch (kind) {
    case 'mystery': return `<div class="showcase"><div class="silhouette">${horseSVG({ coat: 'rappe' })}</div></div>`;
    case 'horse': return `<div class="showcase">${myHorse(S, { cls: 'idle' })}</div>`;
    case 'ride': return `<div class="showcase">${myHorse(S, { gear: FULL_GEAR, cls: 'idle' })}</div>`;
    case 'luna': return `<div class="showcase duo">
        <div class="luna">${horseSVG({ coat: 'schimmel', marking: 'blesse', cls: 'idle' })}</div>
        <div class="foal">${horseSVG({ ...FUNKE, cls: 'idle' })}</div>
      </div>`;
    case 'funke': return `<div class="showcase"><div class="foal-solo">${horseSVG({ ...FUNKE, cls: 'idle' })}</div></div>`;
    case 'eule': return '<div class="showcase"><div class="owl">🦉</div></div>';
    case 'emma': return `<div class="showcase duo"><div class="person">👧</div><div class="foal">${horseSVG({ ...FUNKE, cls: 'idle' })}</div></div>`;
    case 'fest': return `<div class="showcase duo">
        <div class="luna">${myHorse(S, { cls: 'idle' })}</div>
        <div class="foal">${horseSVG({ ...FUNKE, bow: true, cls: 'idle' })}</div>
      </div>`;
    default: return '';
  }
}

function whoHTML(who) {
  return who ? `<div class="who"><span class="face">${who.face}</span><span class="who-name">${who.name}</span></div>` : '';
}

function scene(step, onNext) {
  const who = step.who ? WHO[step.who] : null;
  const scr = mount(`
    ${sceneBG(step.bg)}
    ${topbar({ home: !!S.horse.name })}
    <div class="scene-body">
      ${showcase(step.show)}
      <div class="dialog ${who ? 'has-who' : 'narrator'} ${step.shake ? 'shake-in' : ''}">
        ${whoHTML(who)}
        <p class="story-text">${T(step.text)}</p>
        <div class="dialog-actions">
          <button class="icon-btn read-btn" aria-label="Vorlesen">🔊</button>
          ${nextButton()}
        </div>
      </div>
    </div>`, `story bg-${step.bg}`);
  bindTopbar(scr);
  $('.read-btn', scr).addEventListener('click', () => speak(fill(step.text).replaceAll('*', '')));
  $('.btn-next', scr).addEventListener('click', () => { sfx.tap(); onNext(); });
  $$('.showcase svg.horse', scr).forEach((h) => h.addEventListener('click', () => { sfx.heart(); h.classList.add('happy'); burstAt(h, ['💖'], 5); }));
}

// Entscheidung: Das Kind wählt, wie es weitergeht.
function choice(step, onNext) {
  const who = step.who ? WHO[step.who] : null;
  const scr = mount(`
    ${sceneBG(step.bg)}
    ${topbar()}
    <div class="scene-body">
      <div class="dialog choice-dialog ${who ? 'has-who' : 'narrator'}">
        ${whoHTML(who)}
        <p class="story-text">${T(step.text)}</p>
        <div class="choice-list">${step.options.map((o) => `
          <button class="choice-opt" data-v="${o.v}"><span class="co-emoji">${o.emoji}</span><span class="co-label">${T(fill(o.label), { speak: false })}</span></button>`).join('')}
        </div>
        <div class="dialog-actions center"><button class="icon-btn read-btn" aria-label="Vorlesen">🔊</button></div>
      </div>
    </div>`, `story bg-${step.bg}`);
  bindTopbar(scr);
  $('.read-btn', scr).addEventListener('click', () => speak(`${fill(step.text)} ${step.options.map((o) => fill(o.label)).join('. Oder: ')}`));
  $$('.choice-opt', scr).forEach((b) => b.addEventListener('click', () => {
    S.choices[step.key] = b.dataset.v;
    save();
    sfx.good();
    b.classList.add('picked');
    burstAt(b, ['✨', '⭐'], 6);
    setTimeout(onNext, 500);
  }));
}

function letter(step, onNext) {
  const scr = mount(`
    ${sceneBG('abend')}
    ${topbar()}
    <div class="scene-body">
      <div class="letter pop-in">
        <p class="story-text">${T(step.text)}</p>
        <div class="letter-sign">🪶</div>
      </div>
      <div class="dialog-actions center">
        <button class="icon-btn read-btn" aria-label="Vorlesen">🔊</button>
        ${nextButton()}
      </div>
    </div>`, 'story bg-abend');
  bindTopbar(scr);
  $('.read-btn', scr).addEventListener('click', () => speak(step.text));
  $('.btn-next', scr).addEventListener('click', () => { sfx.tap(); onNext(); });
}

export function askName(onNext) {
  const scr = mount(`
    ${sceneBG('hof')}
    <div class="scene-body ask">
      <div class="big-emoji pop-in">🐴</div>
      <div class="dialog narrator">
        <p class="story-text">${T('Wie heißt du?')}</p>
        <input class="name-input" maxlength="14" autocomplete="off" autocapitalize="words" value="${S.player.name || ''}" placeholder="Dein Name">
        <div class="dialog-actions">${nextButton('Los geht\'s')}</div>
      </div>
    </div>`, 'story');
  const inp = $('.name-input', scr);
  const btn = $('.btn-next', scr);
  const upd = () => { btn.disabled = !inp.value.trim(); };
  upd();
  inp.addEventListener('input', upd);
  const submit = () => {
    const v = inp.value.trim();
    if (!v) return;
    S.player.name = v.charAt(0).toUpperCase() + v.slice(1);
    save();
    sfx.good();
    onNext();
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  btn.addEventListener('click', submit);
}

const NAME_IDEAS = ['Sternchen', 'Blitz', 'Lotte', 'Keks', 'Fee', 'Kakao', 'Wolke', 'Toffee', 'Bella', 'Max', 'Lilly', 'Mondschein', 'Karamell', 'Flocke', 'Paula', 'Sunny'];

export function createHorse(onNext, { fromHub = false } = {}) {
  const h = S.horse;
  const scr = mount(`
    ${topbar({ home: fromHub, title: 'Dein Pferd' })}
    <p class="instr">${T('Wie sieht dein Pferd aus?')}</p>
    <div class="stage create-stage"></div>
    <div class="create-panel">
      <div class="opt-label">${T('Fell')}</div>
      <div class="swatches">${Object.entries(COATS).map(([k, c]) => `
        <button class="swatch ${k === h.coat ? 'sel' : ''}" data-coat="${k}" style="--b:${c.body};--m:${c.mane};${c.patch ? `--p:${c.patch}` : ''}" aria-label="${c.label}">
          <span class="sw-dot ${c.patch ? 'patchy' : ''}"></span><span class="sw-name">${c.label}</span>
        </button>`).join('')}</div>
      <div class="opt-label">${T('Abzeichen')}</div>
      <div class="chips">
        ${Object.entries(MARKINGS).map(([k, l]) => `<button class="chip ${k === h.marking ? 'sel' : ''}" data-mark="${k}">${l}</button>`).join('')}
        <button class="chip ${h.socks ? 'sel' : ''}" data-socks="1">Söckchen</button>
      </div>
      <div class="opt-label">${T('Name')}</div>
      <div class="name-row">
        <input class="name-input" maxlength="14" autocomplete="off" value="${h.name || ''}" placeholder="Name für dein Pferd">
        <button class="icon-btn dice" aria-label="Name würfeln">🎲</button>
      </div>
      ${nextButton('Fertig')}
    </div>`, 'create');
  bindTopbar(scr);
  const stage = $('.create-stage', scr);
  const inp = $('.name-input', scr);
  const btn = $('.btn-next', scr);
  const draw = () => { stage.innerHTML = myHorse(S, { cls: 'big idle' }); };
  const upd = () => { btn.disabled = !inp.value.trim(); };
  draw(); upd();

  $$('.swatch', scr).forEach((b) => b.addEventListener('click', () => {
    h.coat = b.dataset.coat; sfx.tap();
    $$('.swatch', scr).forEach((x) => x.classList.toggle('sel', x === b)); draw();
  }));
  $$('[data-mark]', scr).forEach((b) => b.addEventListener('click', () => {
    h.marking = b.dataset.mark; sfx.tap();
    $$('[data-mark]', scr).forEach((x) => x.classList.toggle('sel', x === b)); draw();
  }));
  $('[data-socks]', scr).addEventListener('click', (e) => {
    h.socks = !h.socks; sfx.tap(); e.currentTarget.classList.toggle('sel', h.socks); draw();
  });
  $('.dice', scr).addEventListener('click', () => {
    sfx.pop();
    let n; do { n = pick(NAME_IDEAS); } while (n === inp.value);
    inp.value = n; upd();
  });
  inp.addEventListener('input', upd);
  btn.addEventListener('click', () => {
    const v = inp.value.trim();
    if (!v) return;
    h.name = v.charAt(0).toUpperCase() + v.slice(1);
    save();
    sfx.win();
    burstAt(stage, ['💖', '⭐', '✨'], 14);
    setTimeout(onNext, 700);
  });
}

// ---------- Fortschritt ----------
export function prog(nr) {
  if (!S.progress[nr]) S.progress[nr] = { max: 0, done: false };
  return S.progress[nr];
}
export const chapterUnlocked = (nr) => nr === 1 || prog(nr - 1).done;
export const anyStoryProgress = () => prog(1).max > 1 || prog(1).done || S.chapter > 1;
const currentChapter = () => CHAPTERS.find((c) => c.nr === S.chapter) || CHAPTERS[0];

function chapterEnd(onNext) {
  const ch = currentChapter();
  const p = prog(ch.nr);
  const first = !p.done;
  p.done = true;
  if (ch.nr === 1) S.chapterDone = true;
  save();
  if (first) reward(10);
  roundDone({
    title: `Kapitel ${ch.nr} geschafft!`,
    text: first ? `Du bekommst 10 Hufeisen extra. ${ch.end}` : ch.end,
    earned: first ? 10 : 0,
    label: 'Weiter',
    onNext,
  });
}

// ---------- Kapitelauswahl ----------
export function chapterSelect() {
  const c = currentChapter();
  const fresh = S.step === 0 && chapterUnlocked(c.nr) && !prog(c.nr).done && prog(c.nr).max === 0;
  const cont = S.step > 0
    ? `Weiterlesen: Kapitel ${c.nr}`
    : fresh ? `Los geht's: Kapitel ${c.nr}` : '';
  const scr = mount(`
    ${topbar({ title: 'Geschichte' })}
    ${cont ? `<button class="btn btn-main continue-btn">${cont} ➜</button>` : ''}
    ${CHAPTERS.map((ch) => {
      const open = chapterUnlocked(ch.nr);
      const p = prog(ch.nr);
      const parts = ch.steps.map((st, idx) => ({ ...st.part, idx })).filter((x) => x.title);
      const reached = (x, k) => p.done || k === 0 || p.max >= x.idx;
      return `
      <section class="chapter ${open ? '' : 'locked'}">
        <h2 class="chapter-title"><span class="ch-emoji">${ch.emoji}</span> ${T(`Kapitel ${ch.nr}: ${ch.title}`)} ${p.done ? '<span class="ch-done">⭐</span>' : ''}</h2>
        ${open ? `
        <div class="parts">${parts.map((x, k) => `
          <button class="part ${reached(x, k) ? '' : 'locked'}" data-ch="${ch.nr}" data-step="${x.idx}" ${reached(x, k) ? '' : 'disabled'}>
            <span class="part-emoji">${reached(x, k) ? x.emoji : '🔒'}</span>
            <span class="part-nr">${k + 1}</span>
            <span class="part-title">${T(x.title, { speak: false })}</span>
          </button>`).join('')}</div>`
        : `<p class="soon">🔒 ${T(`Schaffe erst Kapitel ${ch.nr - 1}!`)}</p>`}
      </section>`;
    }).join('')}
    <p class="soon">${T('Neue Abenteuer kommen bald!')}</p>`, 'chapters');
  bindTopbar(scr);
  $('.continue-btn', scr)?.addEventListener('click', () => { sfx.tap(); runStory(); });
  $$('.part:not(.locked)', scr).forEach((b) => b.addEventListener('click', () => {
    sfx.tap();
    S.chapter = +b.dataset.ch;
    S.step = +b.dataset.step;
    save();
    runStory();
  }));
}

// ---------- Ablauf ----------
const fits = (st) => !st.if || S.choices[st.if[0]] === st.if[1];

export function runStory() {
  const ch = currentChapter();
  const steps = ch.steps;
  while (S.step < steps.length && !fits(steps[S.step])) S.step++;
  if (S.step >= steps.length) S.step = 0;
  const p = prog(ch.nr);
  if (S.step > p.max) p.max = S.step;
  if (ch.nr === 1) S.maxStep = p.max;
  save();
  const step = steps[S.step];
  const next = () => { S.step++; save(); runStory(); };
  const afterGame = (earned, text) => roundDone({ title: 'Super gemacht!', text, earned, onNext: next });

  switch (step.t) {
    case 'askName': return askName(next);
    case 'createHorse': return createHorse(next);
    case 'scene': return scene(step, next);
    case 'choice': return choice(step, next);
    case 'letter': return letter(step, next);
    case 'brush': return brushGame(next);
    case 'brushFunke': return brushGame(next, { horse: FUNKE, name: 'Funke' });
    case 'saddle': return saddleGame(next);
    case 'dress': return dressUp(next, { story: true });
    case 'feed': return feedGame({ count: 5, title: step.title || 'Füttern', theme: step.theme }, (e) => afterGame(e, step.theme ? 'Gut gezählt!' : '{horse} ist jetzt satt.'));
    case 'jump': return jumpGame({ count: 5, title: step.title || 'Parcours', theme: step.theme || 'hurdles', gear: step.theme !== 'boat' }, (e) => afterGame(e, step.theme === 'boat' ? 'Ihr seid gut angekommen!' : 'Was für ein toller Sprung!'));
    case 'reading': return readingGame({ mode: step.mode, title: step.title, intro: step.intro }, (e) => afterGame(e, 'Du hast toll gelesen!'));
    case 'tracks': return tracksGame({ count: 5 }, (e) => afterGame(e, 'Ihr habt die Spur gefunden!'));
    case 'riddles': return riddleGame({ count: 5 }, (e) => afterGame(e, 'Ella staunt: Ihr seid so schlau!'));
    case 'bridge': return syllableBridge({ count: 5 }, (e) => afterGame(e, 'Die Brücke ist fertig!'));
    case 'chapterEnd': return chapterEnd(() => {
      S.step = 0;
      const nextCh = CHAPTERS.find((c) => c.nr === ch.nr + 1);
      if (nextCh) S.chapter = nextCh.nr;
      save();
      chapterSelect();
    });
    default: return next();
  }
}
