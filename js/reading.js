// Lesen: Wort zu Bild, Bild zu Wort, Lückensätze, Wegweiser.
import { S, save } from './state.js';
import { sfx, speak } from './audio.js';
import { myHorse } from './horse.js';
import { taskFrame, T, $, $$, pick, shuffle, wait, reward, say, praise, encourage, burstAt, fill } from './ui.js';

export const WORDS = [
  ['Apfel', '🍎'], ['Karotte', '🥕'], ['Sonne', '☀️'], ['Baum', '🌳'], ['Haus', '🏠'], ['Hut', '👒'],
  ['Katze', '🐱'], ['Hund', '🐶'], ['Blume', '🌸'], ['Mond', '🌙'], ['Stern', '⭐'], ['Maus', '🐭'],
  ['Ei', '🥚'], ['Fisch', '🐟'], ['Ente', '🦆'], ['Eule', '🦉'], ['Kuh', '🐮'], ['Herz', '❤️'],
  ['Brot', '🍞'], ['Ball', '⚽'], ['Pferd', '🐴'], ['Schaf', '🐑'], ['Igel', '🦔'], ['Vogel', '🐦'],
  ['Huhn', '🐔'], ['Wolke', '☁️'], ['Auto', '🚗'], ['Buch', '📖'], ['Schuh', '👟'], ['Uhr', '⏰'],
  ['Birne', '🍐'], ['Kirsche', '🍒'], ['Rose', '🌹'], ['Frosch', '🐸'], ['Schnecke', '🐌'], ['Biene', '🐝'],
  ['Käse', '🧀'], ['Glocke', '🔔'], ['Hase', '🐰'], ['Pilz', '🍄'], ['Zug', '🚂'], ['Schiff', '🚢'],
  ['Krone', '👑'], ['Blatt', '🍃'], ['Ring', '💍'], ['Kerze', '🕯️'], ['Tasse', '☕'], ['Regen', '🌧️'],
];

const CLOZE = [
  ['Das Pferd frisst ___.', 'Heu', ['Haus', 'Hut']],
  ['Im Stall steht ein ___.', 'Pferd', ['Pilz', 'Pfeil']],
  ['Die Kuh macht ___.', 'Muh', ['Mut', 'Maus']],
  ['Funke ist ein kleines ___.', 'Fohlen', ['Fenster', 'Feder']],
  ['Der Vogel kann ___.', 'fliegen', ['fegen', 'fallen']],
  ['Ich trinke ___.', 'Wasser', ['Wolke', 'Wagen']],
  ['Die Katze sagt ___.', 'Miau', ['Mama', 'Mai']],
  ['Am Himmel ist eine ___.', 'Wolke', ['Wurst', 'Wanne']],
  ['Das Gras ist ___.', 'grün', ['Gruß', 'Grube']],
  ['{horse} hat vier ___.', 'Hufe', ['Hüte', 'Hunde']],
  ['Der Apfel ist ___.', 'rot', ['Rad', 'Rost']],
  ['Wir reiten über die ___.', 'Wiese', ['Wespe', 'Woche']],
  ['Nachts scheint der ___.', 'Mond', ['Mund', 'Mann']],
  ['Die Eule sitzt im ___.', 'Baum', ['Bauch', 'Ball']],
  ['Das Pferd trinkt ___.', 'Wasser', ['Wecker', 'Weg']],
  ['Der Sattel liegt auf dem ___.', 'Rücken', ['Rock', 'Rabe']],
  ['Ein Pony ist ___.', 'klein', ['Klee', 'Kleid']],
  ['Im Winter fällt ___.', 'Schnee', ['Schnur', 'Schal']],
  ['Ich putze das ___.', 'Fell', ['Feld', 'Fest']],
  ['Die Sonne ist ___.', 'gelb', ['Geld', 'Gans']],
];

const PLACES = ['Wald', 'Fluss', 'Wiese', 'Berg', 'Stall', 'See', 'Brücke', 'Dorf', 'Mühle', 'Hof', 'Bach', 'Weide'];

export function trackRead(firstTry) {
  S.stats.readTotal++;
  if (firstTry) S.stats.readRight++;
  save();
}

// ----- einzelne Aufgabentypen: rendern in area, rufen done(firstTry) -----

function wordToPic(area, done) {
  const [word, pic] = pick(WORDS);
  const others = shuffle(WORDS.filter((w) => w[0] !== word)).slice(0, 2);
  const opts = shuffle([[word, pic], ...others]);
  area.innerHTML = `
    <p class="task-text">${T('Lies das Wort. Tippe auf das passende Bild.')}</p>
    <div class="read-word">${T(word, { speak: false })}</div>
    <div class="choices pics">${opts.map(([w, p]) => `<button class="choice pic" data-w="${w}">${p}</button>`).join('')}</div>
    <div class="msg"></div>
    <button class="btn btn-small help-btn hidden">🔊 Vorlesen</button>`;
  runChoice(area, word, done, () => speak(word));
}

function picToWord(area, done) {
  const [word, pic] = pick(WORDS);
  const others = shuffle(WORDS.filter((w) => w[0] !== word && w[0][0] !== word[0])).slice(0, 2);
  const opts = shuffle([word, ...others.map((o) => o[0])]);
  area.innerHTML = `
    <p class="task-text">${T('Was ist das? Tippe auf das richtige Wort.')}</p>
    <div class="read-pic">${pic}</div>
    <div class="choices words">${opts.map((w) => `<button class="choice word" data-w="${w}">${T(w, { speak: false })}</button>`).join('')}</div>
    <div class="msg"></div>`;
  runChoice(area, word, done);
}

function cloze(area, done) {
  const [sentence, right, wrongs] = pick(CLOZE);
  const opts = shuffle([right, ...wrongs]);
  const s = fill(sentence);
  const [before, after] = s.split('___');
  area.innerHTML = `
    <p class="task-text">${T('Welches Wort passt in die Lücke?')}</p>
    <div class="cloze">${T(before)}<span class="gap">?</span>${T(after)}</div>
    <div class="choices words">${opts.map((w) => `<button class="choice word" data-w="${w}">${T(w, { speak: false })}</button>`).join('')}</div>
    <div class="msg"></div>`;
  runChoice(area, right, done, null, () => {
    const g = $('.gap', area);
    g.innerHTML = T(right);
    g.classList.add('filled');
    speak(s.replace('___', right));
  });
}

function signpost(area, done) {
  const opts = shuffle(PLACES).slice(0, 3);
  const target = pick(opts);
  const dirs = ['left', 'up', 'right'];
  area.innerHTML = `
    <p class="task-text">${T(`Tante Rosi ruft: Reite zum *${target}*!`)}</p>
    <div class="signpost">
      <div class="sign-pole"></div>
      ${opts.map((w, k) => `<button class="choice sign sign-${dirs[k]}" data-w="${w}">${T(w, { speak: false })}</button>`).join('')}
    </div>
    <div class="mini-horse trot">${myHorse(S, { gear: { pad: true, saddle: true, girth: true, bridle: true } })}</div>
    <div class="msg"></div>`;
  runChoice(area, target, done, null, () => { $('.mini-horse', area).classList.add('go'); });
}

// Gemeinsame Logik für Auswahl-Aufgaben
function runChoice(area, right, done, helpFn, onRight) {
  const msg = $('.msg', area);
  const help = $('.help-btn', area);
  if (help && helpFn) help.addEventListener('click', () => { sfx.tap(); helpFn(); });
  let tries = 0;
  let busy = false;
  $$('.choice', area).forEach((b) => b.addEventListener('click', async () => {
    if (busy) return;
    if (b.dataset.w === right) {
      busy = true;
      b.classList.add('right');
      sfx.good();
      say(msg, praise(), 'good');
      burstAt(b, ['⭐', '✨', '💖'], 6);
      onRight?.();
      trackRead(tries === 0);
      await wait(1500);
      done(tries === 0);
    } else {
      tries++;
      sfx.soft();
      b.classList.add('nope');
      b.disabled = true;
      help?.classList.remove('hidden');
      if (tries >= 2) {
        busy = true;
        $$('.choice', area).find((c) => c.dataset.w === right)?.classList.add('right');
        say(msg, `Richtig ist: *${right}*`, 'hint');
        speak(right);
        onRight?.();
        trackRead(false);
        await wait(2400);
        done(false);
      } else {
        say(msg, encourage(), 'hint');
      }
    }
  }));
}

const TYPES = { wordpic: wordToPic, picword: picToWord, cloze, sign: signpost };

// Mischungen je Modus
const MIXES = {
  kammer: ['wordpic', 'picword', 'wordpic', 'picword', 'wordpic'],
  ride: ['sign', 'cloze', 'sign', 'cloze', 'cloze'],
  mixed: null,
};

export function readingGame({ mode = 'mixed', count = 5, title = 'Lesen', intro = '' } = {}, onDone) {
  const seq = MIXES[mode] || Array.from({ length: count }, () => pick(['wordpic', 'picword', 'cloze', 'cloze', 'sign']));
  const fr = taskFrame({ total: seq.length, title, cls: 'reading' });
  let i = 0;
  let earned = 0;
  function show() {
    fr.progress(i);
    TYPES[seq[i]](fr.area, (first) => {
      const n = first ? 2 : 1;
      earned += n;
      reward(n);
      i++;
      if (i < seq.length) show(); else onDone(earned);
    });
    if (i === 0 && intro) {
      fr.area.insertAdjacentHTML('afterbegin', `<p class="intro-line">${T(intro)}</p>`);
    }
  }
  show();
}
