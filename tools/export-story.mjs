// Erzeugt GESCHICHTE.md aus js/chapters.js – die Geschichte zum Lesen.
// Aufruf:  node tools/export-story.mjs
import { readFileSync, writeFileSync, mkdtempSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// chapters.js ist ein ES-Modul ohne Abhängigkeiten – als .mjs kopieren und laden
const tmp = join(mkdtempSync(join(tmpdir(), 'sternenhof-')), 'chapters.mjs');
copyFileSync(join(root, 'js', 'chapters.js'), tmp);
const { CHAPTERS } = await import(pathToFileURL(tmp).href);

const WHO = { rosi: 'Tante Rosi', eule: 'Ella, die Eule', emma: 'Emma', richterin: 'Frau Sommer (Richterin)' };
const GAMES = {
  askName: '✍️ Das Kind gibt seinen Namen ein.',
  createHorse: '🎨 Das Kind erschafft sein Pferd: Fellfarbe, Abzeichen, Name.',
  brush: '🧽 Spiel: Pferd putzen und Hufe auskratzen.',
  brushFunke: '🧽 Spiel: Funke putzen.',
  saddle: '🐴 Spiel: Satteln und Trensen (Decke → Sattel → Gurt → Trense).',
  feed: (s) => (s.theme === 'pilze' ? '🍄 Rechenspiel: Pilze zählen.' : '🥕 Rechenspiel: Füttern (Plus und Minus bis 50).'),
  jump: (s) => ({ stones: '💧 Rechenspiel: Über die Steine im Bach springen.', boat: '⛵ Rechenspiel: Bootsfahrt zu den Bojen.' }[s.theme] || `🏇 Rechenspiel: ${s.title || 'Parcours'} – über Hindernisse springen.`),
  reading: (s) => `📚 Lesespiel: ${s.title || 'Lesen'}.`,
  tracks: '🐾 Rechenspiel: Hufspuren auf dem Zahlenstrahl.',
  riddles: '🦉 Lesespiel: Ellas Rätsel.',
  bridge: '🌉 Lesespiel: Silben-Brücke bauen.',
  dress: '💎 Schmücken: Das Kind macht sein Pferd schön.',
  boards: '🪵 Rechenspiel: Bretter zählen (Zehner und Einer).',
  sortNums: '🏁 Rechenspiel: Startnummern der Größe nach ordnen.',
  spell: '✏️ Schreibspiel: Wörter mit x richtig schreiben.',
  hFill: '🔢 Hundertertafel: Zahlen nach Aufträgen eintragen (Zeile, Spalte, Einer, Zahlwörter, zwischen …).',
  hWrite: '🔢 Hundertertafel: Die Zahlen einer Zeile oder Spalte aufschreiben.',
  hHidden: (s) => (s.picture === 'einhorn' ? '🦄 Hundertertafel: Verdeckte Zahlen – darunter erscheint ein Einhorn.' : '⭐ Hundertertafel: Verdeckte Zahlen unter Sternen, Herzen und Punkten.'),
};

const fmt = (t = '') => t
  .replace(/\*([^*]+)\*/g, '**$1**')   // *Wort* = hervorgehoben
  .replaceAll('{name}', '[Name]')
  .replaceAll('{horse}', '[Pferd]');

let md = `# Sternenhof – Die Geschichte

*Automatisch erzeugt aus \`js/chapters.js\` mit \`node tools/export-story.mjs\`. Bitte nicht von Hand bearbeiten.*

[Name] steht für den Namen des Kindes, [Pferd] für den Namen seines Pferdes.
Entscheidungen sind mit 🔀 markiert; Szenen, die nur nach einer bestimmten Wahl kommen, mit ↳.
Die Spiele zwischendurch stehen kursiv in eckigen Klammern.

`;

md += '## Inhalt\n\n' + CHAPTERS.map((c) => `${c.nr}. ${c.emoji} Kapitel ${c.nr}: ${c.title}`).join('\n') + '\n\n';

for (const ch of CHAPTERS) {
  md += `---\n\n## ${ch.emoji} Kapitel ${ch.nr}: ${ch.title}\n\n`;
  const optionLabel = {};
  for (const st of ch.steps) {
    if (st.t === 'choice') st.options.forEach((o) => { optionLabel[`${st.key}=${o.v}`] = `${fmt(st.text)} → ${fmt(o.label)}`; });
  }
  // Entscheidungen aus früheren Kapiteln
  for (const c of CHAPTERS) for (const st of c.steps) if (st.t === 'choice') st.options.forEach((o) => { optionLabel[`${st.key}=${o.v}`] ??= `${fmt(st.text)} → ${fmt(o.label)}“ (Kapitel ${c.nr})`; });

  for (const st of ch.steps) {
    if (st.part) md += `\n### ${st.part.emoji} ${st.part.title}\n\n`;
    const lab = st.if ? (optionLabel[`${st.if[0]}=${st.if[1]}`] || st.if.join(' = ')) : '';
    const cond = st.if ? `↳ *Wenn gewählt: „${lab.endsWith(')') ? lab : `${lab}“`}* — ` : '';
    switch (st.t) {
      case 'scene':
        md += st.who ? `${cond}**${WHO[st.who] || st.who}:** „${fmt(st.text)}“\n\n` : `${cond}${fmt(st.text)}\n\n`;
        break;
      case 'letter':
        md += `${cond}✉️ *Auf dem Zettel steht:*\n\n> ${fmt(st.text)}\n\n`;
        break;
      case 'choice':
        md += `🔀 **Entscheidung:** ${fmt(st.text)}\n\n${st.options.map((o) => `- ${o.emoji} ${fmt(o.label)}`).join('\n')}\n\n`;
        break;
      case 'gift':
        md += `${cond}🎁 **${WHO[st.who] || 'Geschenk'}:** „${fmt(st.text)}“ *[${[st.amount ? `${st.amount} Hufeisen` : '', st.item === 'pokal' ? 'der Herz-Pokal für den Stall' : '', st.item === 'sternhufeisen' ? 'das Sternen-Hufeisen für den Stall' : '', st.style?.horn ? 'das Einhorn-Horn zum Schmücken' : ''].filter(Boolean).join(' und ')}, nur beim ersten Mal]*\n\n`;
        break;
      case 'chapterEnd':
        md += `\n**Ende von Kapitel ${ch.nr}.** ${fmt(ch.end)} *[+10 Hufeisen beim ersten Mal]*\n\n`;
        break;
      default: {
        const g = GAMES[st.t];
        const text = typeof g === 'function' ? g(st) : g || `Spiel: ${st.t}`;
        md += `${cond}*[${text}]*\n\n`;
      }
    }
  }
}

writeFileSync(join(root, 'GESCHICHTE.md'), md.replace(/\n{3,}/g, '\n\n'));
console.log('GESCHICHTE.md geschrieben:', CHAPTERS.length, 'Kapitel');
