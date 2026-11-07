// Der Stall (Startseite), Hofladen, freies Üben und Elternbereich.
import { S, save, resetAll } from './state.js';
import { sfx, speak, canSpeak } from './audio.js';
import { mount, topbar, bindTopbar, T, $, $$, go, pick, burstAt, roundDone, shoeIcon, reward } from './ui.js';
import { runStory, CHAPTERS, createHorse, chapterSelect, anyStoryProgress, prog } from './story.js';
import { dressUp } from './dressup.js';
import { brushGame, saddleGame } from './care.js';
import { feedGame, jumpGame } from './math.js';
import { readingGame } from './reading.js';
import { tracksGame, riddleGame, syllableBridge } from './adventure.js';
import { boardsGame, sortGame } from './tournament.js';
import { stableHTML, enableEditing, resetStall, stableHorse } from './stable.js';
import { VERSION } from './version.js';

export const SHOP = [
  { id: 'heu', name: 'Heuballen', emoji: '🌾', price: 4 },
  { id: 'blume', name: 'Blumentopf', emoji: '🌻', price: 5 },
  { id: 'schleife', name: 'Schleife', emoji: '🎀', price: 6, note: 'für die Mähne' },
  { id: 'apfel', name: 'Apfelkorb', emoji: '🍎', price: 6 },
  { id: 'laterne', name: 'Laterne', emoji: '🏮', price: 8 },
  { id: 'schild', name: 'Namensschild', emoji: '🏷️', price: 10 },
  { id: 'lichter', name: 'Lichterkette', emoji: '✨', price: 12 },
  { id: 'katze', name: 'Stallkatze', emoji: '🐈', price: 15 },
  { id: 'hase', name: 'Hase', emoji: '🐇', price: 15 },
  { id: 'pokal', name: 'Pokal', emoji: '🏆', price: 20 },
  { id: 'regenbogen', name: 'Regenbogen', emoji: '🌈', price: 25 },
  { id: 'glocke', name: 'Glocke', emoji: '🔔', price: 6, note: 'für einen Haken' },
  { id: 'kissen', name: 'Herzkissen', emoji: '💖', price: 7, note: 'fürs Regal' },
  { id: 'halfter', name: 'Halfter', emoji: '🪢', price: 8, note: 'für einen Haken' },
  { id: 'foto', name: 'Foto', emoji: '🖼️', price: 12, note: 'ein Bild von deinem Pferd' },
];

const HORSE_TALK = [
  'Ich hab dich lieb!', 'Hast du eine Karotte?', 'Das kitzelt!', 'Wollen wir reiten?',
  'Du bist toll!', 'Ich mag Äpfel.', 'Kraul mich noch mal!', 'Wo ist Funke?', 'Hihihi!',
];

export function hub() {
  const storyLabel = 'Geschichte';
  const scr = mount(`
    ${topbar({ home: false, title: '' })}
    <button class="icon-btn parents-btn" aria-label="Elternbereich">⚙️</button>
    <div class="stall">
      ${stableHTML()}
      <button class="icon-btn stall-full-btn" aria-label="Stall groß ansehen">⛶</button>
    </div>
    <h2 class="stall-title">${T(`Der Stall von *${S.horse.name}*`)}</h2>
    <nav class="menu">
      <button class="menu-btn story-btn" data-go="story"><span class="mi">📖</span><span>${T(storyLabel, { speak: false })}</span></button>
      <button class="menu-btn dress-btn" data-go="dress"><span class="mi">💎</span><span>${T('Schmücken', { speak: false })}</span></button>
      <button class="menu-btn" data-go="care"><span class="mi">🧽</span><span>${T('Putzen', { speak: false })}</span></button>
      <button class="menu-btn" data-go="saddle"><span class="mi">🐴</span><span>${T('Satteln', { speak: false })}</span></button>
      <button class="menu-btn" data-go="feed"><span class="mi">🥕</span><span>${T('Füttern', { speak: false })}</span></button>
      <button class="menu-btn" data-go="jump"><span class="mi">🏇</span><span>${T('Parcours', { speak: false })}</span></button>
      <button class="menu-btn" data-go="read"><span class="mi">📚</span><span>${T('Lesen', { speak: false })}</span></button>
      <button class="menu-btn" data-go="riddles"><span class="mi">🦉</span><span>${T('Rätsel', { speak: false })}</span></button>
      <button class="menu-btn" data-go="tracks"><span class="mi">🐾</span><span>${T('Hufspuren', { speak: false })}</span></button>
      <button class="menu-btn" data-go="bridge"><span class="mi">🌉</span><span>${T('Silben-Brücke', { speak: false })}</span></button>
      <button class="menu-btn" data-go="boards"><span class="mi">🪵</span><span>${T('Bretter zählen', { speak: false })}</span></button>
      <button class="menu-btn" data-go="sort"><span class="mi">🏁</span><span>${T('Zahlen ordnen', { speak: false })}</span></button>
      <button class="menu-btn" data-go="shop"><span class="mi">🛍️</span><span>${T('Laden', { speak: false })}</span></button>
      <button class="menu-btn" data-go="look"><span class="mi">🎨</span><span>${T('Aussehen', { speak: false })}</span></button>
    </nav>`, 'hub');
  bindTopbar(scr);

  const done = (e) => roundDone({ title: 'Super gemacht!', earned: e, label: 'Zum Stall', onNext: () => go('hub') });
  const actions = {
    story: () => (anyStoryProgress() ? chapterSelect() : runStory()),
    dress: () => dressUp(() => go('hub')),
    care: () => brushGame(() => go('hub')),
    saddle: () => saddleGame(() => go('hub')),
    feed: () => feedGame({ count: 5, title: 'Füttern' }, done),
    jump: () => jumpGame({ count: 5, title: 'Parcours' }, done),
    read: () => readingGame({ mode: 'mixed', count: 5, title: 'Lesen' }, done),
    riddles: () => riddleGame({ count: 5, title: 'Rätsel' }, done),
    tracks: () => tracksGame({ count: 5, title: 'Hufspuren' }, done),
    bridge: () => syllableBridge({ count: 5, title: 'Silben-Brücke' }, done),
    boards: () => boardsGame({ count: 5, title: 'Bretter zählen' }, done),
    sort: () => sortGame({ count: 5, title: 'Zahlen ordnen' }, done),
    shop: () => shop(),
    look: () => createHorse(() => go('hub'), { fromHub: true }),
  };
  $$('.menu-btn', scr).forEach((b) => b.addEventListener('click', () => { sfx.tap(); actions[b.dataset.go](); }));
  $('.parents-btn', scr).addEventListener('click', () => { sfx.tap(); parentsGate(); });

  const stage = $('.stable-stage', scr);
  $('.stall-full-btn', scr).addEventListener('click', () => { sfx.tap(); stableFull(); });
  bindHorseTalk(stage);
}

function bindHorseTalk(stage) {
  const horse = stableHorse(stage);
  const talk = $('.talk', stage);
  horse.addEventListener('click', () => {
    sfx.heart();
    horse.classList.remove('happy'); void horse.getBoundingClientRect(); horse.classList.add('happy');
    burstAt(horse, ['💖', '💕', '✨'], 7);
    const line = pick(HORSE_TALK);
    talk.innerHTML = `<div class="talk-bubble pop-in">${T(line)}</div>`;
  });

}

// ---------- Stall im Vollbild, mit Einrichten ----------
function stableFull() {
  let editing = false;
  const scr = mount(`
    <div class="stall-full">
      <div class="stall-full-inner">${stableHTML()}</div>
      <div class="stall-bar">
        <button class="btn btn-small stall-back">✕ Zurück</button>
        <button class="btn btn-small stall-edit">✏️ Einrichten</button>
        <button class="btn btn-small stall-reset hidden">↺ Wie am Anfang</button>
      </div>
      <p class="stall-hint hidden">${T('Zieh die Sachen dorthin, wo du sie haben willst!', { speak: false, syllables: false })}</p>
      <p class="turn-hint">📱↻ ${T('Dreh dein Handy für ein großes Bild!', { speak: false, syllables: false })}</p>
    </div>`, 'stall-full-screen');
  try { document.documentElement.requestFullscreen?.().catch(() => {}); } catch (e) { /* nicht überall erlaubt */ }

  const draw = () => {
    $('.stall-full-inner', scr).innerHTML = stableHTML();
    const stage = $('.stable-stage', scr);
    stage.classList.toggle('editing', editing);
    if (editing) enableEditing(stage); else bindHorseTalk(stage);
  };
  const leave = () => {
    try { if (document.fullscreenElement) document.exitFullscreen?.(); } catch (e) { /* egal */ }
    go('hub');
  };
  $('.stall-back', scr).addEventListener('click', () => { sfx.tap(); leave(); });
  $('.stall-edit', scr).addEventListener('click', (e) => {
    sfx.tap();
    editing = !editing;
    e.currentTarget.textContent = editing ? '✔ Fertig' : '✏️ Einrichten';
    e.currentTarget.classList.toggle('btn-ok', editing);
    $('.stall-reset', scr).classList.toggle('hidden', !editing);
    $('.stall-hint', scr).classList.toggle('hidden', !editing);
    draw();
  });
  $('.stall-reset', scr).addEventListener('click', () => { sfx.tap(); resetStall(); draw(); });
  draw();
}

function shop() {
  const scr = mount(`
    ${topbar({ title: 'Hofladen' })}
    <p class="instr">${T('Kauf schöne Sachen für den Stall! Decken und Schmuck gibt es beim Schmücken.')}</p>
    <div class="shop-grid">${SHOP.map((it) => {
      const owned = S.owned.includes(it.id);
      return `<button class="shop-item ${owned ? 'owned' : ''}" data-id="${it.id}">
        <span class="shop-emoji">${it.emoji}</span>
        <span class="shop-name">${T(it.name, { speak: false })}</span>
        <span class="shop-price">${owned ? '✔' : `${shoeIcon(20)} ${it.price}`}</span>
      </button>`;
    }).join('')}
    </div>
    <div class="msg"></div>`, 'shop');
  bindTopbar(scr);
  const msg = $('.msg', scr);
  $$('.shop-item', scr).forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.id;
    const it = SHOP.find((x) => x.id === id);
    if (S.owned.includes(id)) return;
    if (S.shoes < it.price) {
      sfx.soft();
      msg.innerHTML = `<div class="bubble-msg hint">${T(`Du brauchst noch ${it.price - S.shoes} Hufeisen. Spiel noch eine Runde!`)}</div>`;
      return;
    }
    S.shoes -= it.price;
    S.owned.push(id);
    save();
    sfx.win();
    shop();
    const nb = $(`.shop-item[data-id="${id}"]`);
    if (nb) burstAt(nb, ['✨', '💖', '⭐'], 10);
  }));
}

// ---------- Elternbereich ----------
function parentsGate() {
  const scr = mount(`
    ${topbar({ title: 'Eltern' })}
    <div class="center-col">
      <p class="lead">Elternbereich</p>
      <p>Halte den Knopf 3 Sekunden gedrückt.</p>
      <button class="btn btn-main hold-btn"><span class="hold-fill"></span><span class="hold-label">Gedrückt halten</span></button>
    </div>`, 'parents');
  bindTopbar(scr);
  const btn = $('.hold-btn', scr);
  let timer = null;
  const start = (e) => { e.preventDefault(); btn.classList.add('holding'); timer = setTimeout(parents, 3000); };
  const stop = () => { btn.classList.remove('holding'); clearTimeout(timer); };
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', stop);
  btn.addEventListener('pointerleave', stop);
  btn.addEventListener('pointercancel', stop);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

function pct(a, b) { return b ? `${Math.round((a / b) * 100)} %` : '–'; }

function parents() {
  const st = S.stats;
  const LEVELS = ['bis 20', 'Zehner', 'ZE + E', 'Übergang', 'Zweistellig'];
  const scr = mount(`
    ${topbar({ title: 'Eltern' })}
    <div class="parents-panel">
      <section>
        <h3>Mathe-Stufe</h3>
        <p class="small">Passt sich automatisch an (4× richtig = höher, 2× daneben = leichter).</p>
        <div class="chips">${LEVELS.map((l, k) => `<button class="chip ${S.mathLevel === k + 1 ? 'sel' : ''}" data-lvl="${k + 1}">${k + 1}: ${l}</button>`).join('')}</div>
      </section>
      <section>
        <h3>Einstellungen</h3>
        <label class="toggle"><input type="checkbox" data-set="syllables" ${S.settings.syllables ? 'checked' : ''}> Silben farbig (blau/rot)</label>
        <label class="toggle"><input type="checkbox" data-set="speech" ${S.settings.speech ? 'checked' : ''}> Vorlesen beim Antippen ${canSpeak() ? '' : '(auf diesem Gerät nicht verfügbar)'}</label>
        <label class="toggle"><input type="checkbox" data-set="sound" ${S.settings.sound ? 'checked' : ''}> Töne</label>
      </section>
      <section>
        <h3>Fortschritt</h3>
        <p>Mathe: ${st.mathRight} von ${st.mathTotal} beim ersten Versuch richtig (${pct(st.mathRight, st.mathTotal)})</p>
        <p>Lesen: ${st.readRight} von ${st.readTotal} beim ersten Versuch richtig (${pct(st.readRight, st.readTotal)})</p>
        ${CHAPTERS.map((c) => `<p>Kapitel ${c.nr} „${c.title}“: ${prog(c.nr).done ? 'geschafft ⭐' : prog(c.nr).max > 0 ? 'begonnen' : 'noch nicht gespielt'}</p>`).join('')}
        <p>Entscheidungen: ${Object.entries(S.choices).map(([k, v]) => `${k} = ${v}`).join(', ') || '–'}</p>
        <p>Hufeisen: ${S.shoes}</p>
      </section>
      <section>
        <h3>Spielstand</h3>
        <button class="btn btn-small" data-act="restart">Geschichte von vorne</button>
        <button class="btn btn-small" data-act="unlock">Alle Kapitel freischalten</button>
        <button class="btn btn-small btn-danger" data-act="reset">Alles zurücksetzen</button>
        <button class="btn btn-small" data-act="test">Test: Sprachausgabe</button>
      </section>
      <section>
        <h3>Spielstand sichern</h3>
        <p class="small">Speichert Pferd, Hufeisen, Schmuck, Stall und Fortschritt als Datei auf dem Gerät. Damit kannst du den Spielstand später wiederherstellen oder auf ein anderes Gerät mitnehmen.</p>
        <button class="btn btn-small" data-act="export">💾 Spielstand herunterladen</button>
        <button class="btn btn-small" data-act="import">📂 Spielstand einlesen</button>
        <input type="file" class="import-file hidden" accept=".json,application/json">
        <p class="backup-msg small"></p>
      </section>
      <section>
        <h3>Kontakt</h3>
        <p>Fragen, Ideen oder Fehler gefunden? Schreib mir:</p>
        <p><a class="contact-link" href="#">…</a></p>
      </section>
      <section>
        <h3>App</h3>
        <p>Installierte Version: <b>${VERSION}</b></p>
        <p class="online-version small">Neueste Version im Internet: <span>wird geprüft …</span></p>
        <button class="btn btn-small" data-act="update">🔄 Neueste Version laden</button>
        <p class="small">Lädt die App frisch aus dem Internet. Der Spielstand (Pferd, Hufeisen, Fortschritt) bleibt erhalten.</p>
      </section>
    </div>`, 'parents');
  bindTopbar(scr);
  $$('[data-lvl]', scr).forEach((b) => b.addEventListener('click', () => {
    S.mathLevel = +b.dataset.lvl; S.mathStreak = 0; S.mathMiss = 0; save();
    $$('[data-lvl]', scr).forEach((x) => x.classList.toggle('sel', x === b));
  }));
  $$('[data-set]', scr).forEach((c) => c.addEventListener('change', () => { S.settings[c.dataset.set] = c.checked; save(); }));
  $('[data-act="restart"]', scr).addEventListener('click', () => { S.chapter = 1; S.step = 0; save(); go('hub'); });
  $('[data-act="unlock"]', scr).addEventListener('click', () => {
    CHAPTERS.forEach((c) => { const p = prog(c.nr); if (c.nr < CHAPTERS.length) p.done = true; p.max = Math.max(p.max, c.steps.length - 1); });
    S.chapterDone = true; save(); alert('Alle Kapitel und Abschnitte sind jetzt frei.');
  });
  $('[data-act="reset"]', scr).addEventListener('click', () => {
    if (confirm('Wirklich den ganzen Spielstand löschen? Pferd, Hufeisen und Fortschritt gehen verloren.')) { resetAll(); go('title'); }
  });
  $('[data-act="test"]', scr).addEventListener('click', () => speak('Hallo! Ich bin dein Pferd.'));
  // Kontaktadresse erst hier zusammensetzen, damit sie nicht am Stück im Quelltext steht
  const cl = $('.contact-link', scr);
  const addr = [['zlohcs', 'idna'].map((x) => [...x].reverse().join('')).reverse().join('.'), ['moc', 'liamg'].map((x) => [...x].reverse().join('')).reverse().join('.')].join(String.fromCharCode(64));
  cl.textContent = addr;
  cl.addEventListener('click', (e) => { e.preventDefault(); location.href = `mailto:${addr}?subject=Sternenhof`; });
  const bmsg = $('.backup-msg', scr);
  $('[data-act="export"]', scr).addEventListener('click', () => {
    const name = exportSave();
    bmsg.textContent = `Gespeichert als „${name}“ (meist im Ordner „Downloads“ oder „Dateien“).`;
  });
  const fileIn = $('.import-file', scr);
  $('[data-act="import"]', scr).addEventListener('click', () => fileIn.click());
  fileIn.addEventListener('change', async () => {
    const file = fileIn.files?.[0];
    fileIn.value = '';
    if (!file) return;
    const res = await readSave(file);
    if (!res.ok) { bmsg.textContent = `⚠️ ${res.error}`; return; }
    const d = res.data;
    const info = `Pferd: ${d.horse?.name || '?'}, Hufeisen: ${d.shoes ?? 0}${res.savedAt ? `, gesichert am ${new Date(res.savedAt).toLocaleDateString('de-DE')}` : ''}`;
    if (!confirm(`Diesen Spielstand einlesen?\n\n${info}\n\nDer jetzige Spielstand wird ersetzt. (Eine Sicherungskopie bleibt auf dem Gerät.)`)) return;
    try {
      localStorage.setItem('sternenhof-backup', localStorage.getItem('sternenhof-v1') || '');
      localStorage.setItem('sternenhof-v1', JSON.stringify(d));
    } catch (e) { bmsg.textContent = '⚠️ Konnte nicht speichern.'; return; }
    location.replace(location.pathname);
  });
  $('[data-act="update"]', scr).addEventListener('click', (e) => { e.currentTarget.textContent = '⏳ Lädt …'; forceUpdate(); });
  onlineVersion().then((v) => {
    const el = $('.online-version span', scr);
    if (!el) return;
    if (!v) el.textContent = 'nicht erreichbar (offline?)';
    else el.innerHTML = v === VERSION ? `<b>${v}</b> ✔ aktuell` : `<b>${v}</b> – bitte neu laden!`;
  });
}

// ---------- Spielstand als Datei ----------
function exportSave() {
  save();
  const date = new Date().toISOString().slice(0, 10);
  const who = (S.horse.name || 'pferd').toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-');
  const name = `sternenhof-${who}-${date}.json`;
  const payload = { app: 'sternenhof', version: VERSION, savedAt: new Date().toISOString(), data: S };
  const blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return name;
}

async function readSave(file) {
  if (file.size > 2_000_000) return { ok: false, error: 'Die Datei ist zu groß. Ist das wirklich ein Sternenhof-Spielstand?' };
  let obj;
  try { obj = JSON.parse(await file.text()); } catch (e) { return { ok: false, error: 'Die Datei kann nicht gelesen werden.' }; }
  const data = obj && obj.app === 'sternenhof' ? obj.data : obj;
  const valid = data && typeof data === 'object' && data.horse && typeof data.horse === 'object'
    && typeof data.shoes === 'number' && data.player && typeof data.player === 'object';
  if (!valid) return { ok: false, error: 'Das ist kein Sternenhof-Spielstand.' };
  return { ok: true, data, savedAt: obj.savedAt };
}

// Neueste Versionsnummer direkt vom Server holen (am Zwischenspeicher vorbei)
async function onlineVersion() {
  try {
    const res = await fetch(`js/version.js?t=${Date.now()}`, { cache: 'no-store' });
    const m = (await res.text()).match(/VERSION = '([^']+)'/);
    return m ? m[1] : null;
  } catch (e) { return null; }
}

// App frisch laden: Service Worker und App-Zwischenspeicher leeren, Spielstand (localStorage) bleibt.
async function forceUpdate() {
  save();
  try { localStorage.setItem('sternenhof-backup', localStorage.getItem('sternenhof-v1') || ''); } catch (e) { /* egal */ }
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) || [];
    await Promise.all(regs.map((r) => r.unregister()));
  } catch (e) { /* egal */ }
  try {
    const keys = (await caches?.keys?.()) || [];
    await Promise.all(keys.filter((k) => k.startsWith('sternenhof')).map((k) => caches.delete(k)));
  } catch (e) { /* egal */ }
  location.replace(`${location.pathname}?v=${Date.now()}`);
}
