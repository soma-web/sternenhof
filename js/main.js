// Start des Spiels
import { S } from './state.js';
import { unlockAudio, sfx } from './audio.js';
import { horseSVG, myHorse } from './horse.js';
import { sceneBG } from './scenes.js';
import { register, go, mount, $, initWordTap, T } from './ui.js';
import { hub } from './hub.js';
import { runStory } from './story.js';

function title() {
  const hasHorse = !!S.horse.name;
  const scr = mount(`
    ${sceneBG('hof')}
    <div class="title-screen">
      <h1 class="logo">Sternen<span>hof</span></h1>
      <p class="tagline">${T('Ein Pferde-Abenteuer', { speak: false })}</p>
      <div class="title-horse">${hasHorse ? myHorse(S, { cls: 'idle' }) : horseSVG({ coat: 'fuchs', marking: 'stern', cls: 'idle' })}</div>
      <button class="btn btn-main btn-play">${hasHorse ? `Weiter mit ${S.horse.name}` : 'Spielen'} ➜</button>
    </div>`, 'title');
  $('.btn-play', scr).addEventListener('click', () => {
    unlockAudio();
    sfx.good();
    if (hasHorse) go('hub'); else runStory();
  });
}

register('title', title);
register('hub', hub);
register('story', runStory);

initWordTap();
document.addEventListener('pointerdown', unlockAudio, { once: true });
// Doppeltipp-Zoom auf iOS verhindern
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

go('title');

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
