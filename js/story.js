// Die Geschichte – Kapitel 1: "Ein Pferd für dich"
import { S, save } from './state.js';
import { sfx, speak } from './audio.js';
import { horseSVG, myHorse, COATS, MARKINGS } from './horse.js';
import { sceneBG } from './scenes.js';
import { mount, topbar, bindTopbar, T, fill, $, $$, go, nextButton, roundDone, reward, burstAt, pick } from './ui.js';
import { brushGame, saddleGame } from './care.js';
import { feedGame, jumpGame } from './math.js';
import { readingGame } from './reading.js';

const WHO = {
  rosi: { name: 'Tante Rosi', face: '👩‍🌾' },
  eule: { name: 'Eule', face: '🦉' },
};

const FULL_GEAR = { pad: true, saddle: true, girth: true, bridle: true };

export const CHAPTER1 = [
  { t: 'askName' },
  { t: 'scene', bg: 'hof', text: 'Hallo {name}! Es sind Ferien. Die Sonne scheint.' },
  { t: 'scene', bg: 'hof', text: 'Du fährst zum *Sternenhof*. Dort wohnt Tante Rosi.' },
  { t: 'scene', bg: 'hof', who: 'rosi', text: 'Hallo {name}! Schön, dass du da bist!' },
  { t: 'scene', bg: 'hof', who: 'rosi', text: 'Ich habe eine Überraschung für dich. Komm mit in den Stall!' },
  { t: 'scene', bg: 'stall', show: 'mystery', text: 'Im Stall steht ein Pferd. Es schaut dich an.' },
  { t: 'createHorse' },
  { t: 'scene', bg: 'stall', who: 'rosi', show: 'horse', text: '{horse} ist jetzt *dein* Pferd. Ihr werdet beste Freunde!' },
  { t: 'scene', bg: 'stall', who: 'rosi', show: 'luna', text: 'Das ist Luna. Und das ist ihr Fohlen *Funke*.' },
  { t: 'scene', bg: 'stall', who: 'rosi', show: 'luna', text: 'Funke ist klein und frech. Funke spielt so gern!' },
  { t: 'scene', bg: 'stall', who: 'rosi', show: 'horse', text: 'Oh, {horse} ist ganz staubig. Hol das Putzzeug aus der Kammer!' },
  { t: 'reading', mode: 'kammer', title: 'In der Kammer', intro: 'In der Kammer liegt viel Zeug. Lies genau!' },
  { t: 'brush' },
  { t: 'scene', bg: 'stall', show: 'horse', text: '{horse} glänzt wie neu! Aber jetzt hat {horse} Hunger.' },
  { t: 'feed' },
  { t: 'scene', bg: 'stall', who: 'rosi', show: 'horse', text: 'Satt und sauber! Wollen wir ausreiten? Dann musst du {horse} satteln.' },
  { t: 'saddle' },
  { t: 'scene', bg: 'wiese', show: 'ride', text: 'Ihr reitet los. Der Wind weht. Wie schön!' },
  { t: 'reading', mode: 'ride', title: 'Ausritt' },
  { t: 'scene', bg: 'wiese', who: 'rosi', show: 'ride', text: 'Schau, am Bach ist ein kleiner Parcours. Traust du dich?' },
  { t: 'jump' },
  { t: 'scene', bg: 'abend', show: 'horse', text: 'Am Abend seid ihr wieder im Stall. {horse} ist müde und froh.' },
  { t: 'scene', bg: 'abend', who: 'rosi', text: 'Oh nein! Die Tür von Funke ist offen!' },
  { t: 'scene', bg: 'abend', who: 'rosi', text: 'Funke ist weg!', shake: true },
  { t: 'scene', bg: 'abend', text: 'Auf dem Boden liegt ein Zettel. Darauf steht:' },
  { t: 'letter', text: 'Keine Angst! Funke ist bei mir. Kommt morgen in den Wald. Eure Freundin E.' },
  { t: 'scene', bg: 'abend', who: 'rosi', text: 'Wer ist wohl E? Das finden wir morgen heraus.' },
  { t: 'scene', bg: 'nacht', show: 'horse', text: 'Gute Nacht, {name}. Gute Nacht, {horse}.' },
  { t: 'chapterEnd' },
];

function showcase(kind) {
  switch (kind) {
    case 'mystery': return `<div class="showcase"><div class="silhouette">${horseSVG({ coat: 'rappe' })}</div></div>`;
    case 'horse': return `<div class="showcase">${myHorse(S, { cls: 'idle' })}</div>`;
    case 'ride': return `<div class="showcase">${myHorse(S, { gear: FULL_GEAR, cls: 'idle' })}</div>`;
    case 'luna': return `<div class="showcase duo">
        <div class="luna">${horseSVG({ coat: 'schimmel', marking: 'blesse', cls: 'idle' })}</div>
        <div class="foal">${horseSVG({ coat: 'fuchs', marking: 'stern', socks: true, cls: 'idle' })}</div>
      </div>`;
    default: return '';
  }
}

function scene(step, onNext) {
  const who = step.who ? WHO[step.who] : null;
  const scr = mount(`
    ${sceneBG(step.bg)}
    ${topbar({ home: !!S.horse.name })}
    <div class="scene-body">
      ${showcase(step.show)}
      <div class="dialog ${who ? 'has-who' : 'narrator'} ${step.shake ? 'shake-in' : ''}">
        ${who ? `<div class="who"><span class="face">${who.face}</span><span class="who-name">${who.name}</span></div>` : ''}
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
  const h = $('.showcase svg.horse', scr);
  if (h) h.addEventListener('click', () => { sfx.heart(); h.classList.add('happy'); burstAt(h, ['💖'], 5); });
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

function chapterEnd(onNext) {
  const first = !S.chapterDone;
  S.chapterDone = true;
  save();
  if (first) reward(10);
  roundDone({
    title: 'Kapitel 1 geschafft!',
    text: first ? 'Du bekommst 10 Hufeisen extra. Morgen geht die Suche nach Funke weiter!' : 'Morgen geht die Suche nach Funke weiter!',
    earned: first ? 10 : 0,
    label: 'Zum Stall',
    onNext,
  });
}

// ---------- Kapitelauswahl ----------
export const CHAPTERS = [
  {
    nr: 1, title: 'Ein Pferd für dich', emoji: '🐴',
    parts: [
      { title: 'Ankunft auf dem Hof', emoji: '🏡', step: 1 },
      { title: 'Putzen', emoji: '🧽', step: 10 },
      { title: 'Füttern und Satteln', emoji: '🥕', step: 13 },
      { title: 'Ausritt', emoji: '🌼', step: 17 },
      { title: 'Parcours', emoji: '🏇', step: 19 },
      { title: 'Funke ist weg!', emoji: '🌙', step: 21 },
    ],
  },
  { nr: 2, title: 'Im Wald', emoji: '🌲', locked: true },
];

export function chapterSelect() {
  const reached = (p) => S.chapterDone || S.maxStep >= p.step;
  const cont = S.step > 0 && S.step < CHAPTER1.length;
  const scr = mount(`
    ${topbar({ title: 'Geschichte' })}
    ${cont ? `<button class="btn btn-main continue-btn">Weiterlesen ➜</button>` : ''}
    ${CHAPTERS.map((ch) => `
      <section class="chapter ${ch.locked ? 'locked' : ''}">
        <h2 class="chapter-title"><span class="ch-emoji">${ch.emoji}</span> ${T(`Kapitel ${ch.nr}: ${ch.title}`)}</h2>
        ${ch.locked ? `<p class="soon">${T('Kommt bald!')} 🔒</p>` : `
        <div class="parts">${ch.parts.map((p, k) => `
          <button class="part ${reached(p) ? '' : 'locked'}" data-step="${p.step}" ${reached(p) ? '' : 'disabled'}>
            <span class="part-emoji">${reached(p) ? p.emoji : '🔒'}</span>
            <span class="part-nr">${k + 1}</span>
            <span class="part-title">${T(p.title, { speak: false })}</span>
          </button>`).join('')}</div>`}
      </section>`).join('')}`, 'chapters');
  bindTopbar(scr);
  $('.continue-btn', scr)?.addEventListener('click', () => { sfx.tap(); runStory(); });
  $$('.part:not(.locked)', scr).forEach((b) => b.addEventListener('click', () => {
    sfx.tap();
    S.step = +b.dataset.step;
    save();
    runStory();
  }));
}

// ---------- Ablauf ----------
export function runStory() {
  const steps = CHAPTER1;
  if (S.step >= steps.length) S.step = 0;
  if (S.step > (S.maxStep || 0)) { S.maxStep = S.step; save(); }
  const step = steps[S.step];
  const next = () => { S.step++; save(); runStory(); };
  const afterGame = (earned, text) => roundDone({ title: 'Super gemacht!', text, earned, onNext: next });

  switch (step.t) {
    case 'askName': return askName(next);
    case 'createHorse': return createHorse(next);
    case 'scene': return scene(step, next);
    case 'letter': return letter(step, next);
    case 'brush': return brushGame(next);
    case 'saddle': return saddleGame(next);
    case 'feed': return feedGame({ count: 5, title: 'Füttern' }, (e) => afterGame(e, '{horse} ist jetzt satt.'));
    case 'jump': return jumpGame({ count: 5, title: 'Parcours' }, (e) => afterGame(e, 'Was für ein toller Ritt!'));
    case 'reading': return readingGame({ mode: step.mode, title: step.title, intro: step.intro }, (e) => afterGame(e, 'Du hast toll gelesen!'));
    case 'chapterEnd': return chapterEnd(() => { S.step = 0; save(); go('hub'); });
    default: return next();
  }
}
