// Hintergründe für die Geschichte (einfache SVG-Landschaften).
const SKIES = {
  hof: ['#9ED9FF', '#E6F7FF'],
  wiese: ['#8FD0FF', '#EAF8FF'],
  stall: ['#E9C9A0', '#F6E4C8'],
  abend: ['#2C3E78', '#F59E7A'],
  nacht: ['#16204A', '#3B4C8F'],
};

function clouds() {
  return `<g fill="#fff" opacity=".9">
    <g class="cloud c1"><ellipse cx="120" cy="70" rx="46" ry="18"/><ellipse cx="150" cy="58" rx="30" ry="20"/><ellipse cx="96" cy="62" rx="24" ry="14"/></g>
    <g class="cloud c2"><ellipse cx="560" cy="50" rx="40" ry="15"/><ellipse cx="585" cy="40" rx="26" ry="17"/></g>
  </g>`;
}

function barn(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 60 L70 10 L140 60 Z" fill="#B23A3A"/>
    <rect x="10" y="58" width="120" height="82" fill="#D9534F"/>
    <rect x="50" y="80" width="40" height="60" fill="#FFF3E0"/>
    <path d="M50 80 L90 140 M90 80 L50 140" stroke="#D9534F" stroke-width="5"/>
    <rect x="58" y="34" width="24" height="18" rx="3" fill="#FFF3E0"/>
    <path d="M0 60 L70 10 L140 60" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
  </g>`;
}

function fence(y, color = '#FFFFFF') {
  let posts = '';
  for (let x = 10; x < 720; x += 60) posts += `<rect x="${x}" y="${y - 30}" width="8" height="40" rx="2" fill="${color}"/>`;
  return `<g opacity=".95">${posts}<rect x="0" y="${y - 24}" width="720" height="6" fill="${color}"/><rect x="0" y="${y - 10}" width="720" height="6" fill="${color}"/></g>`;
}

function flowers(y) {
  const cols = ['#FF7FAF', '#FFD34D', '#FFFFFF', '#B58CFF'];
  let s = '';
  for (let i = 0; i < 14; i++) {
    const x = 20 + i * 52 + (i % 3) * 9;
    const yy = y + (i % 4) * 9;
    s += `<g><circle cx="${x}" cy="${yy}" r="5" fill="${cols[i % 4]}"/><circle cx="${x}" cy="${yy}" r="2" fill="#F6A623"/></g>`;
  }
  return s;
}

function stallInside() {
  let planks = '';
  for (let x = 0; x < 720; x += 48) planks += `<rect x="${x}" y="0" width="48" height="400" fill="${x % 96 ? '#C98B57' : '#C08250'}"/><rect x="${x + 46}" y="0" width="2" height="400" fill="#A86E42"/>`;
  return `${planks}
    <rect x="0" y="0" width="720" height="16" fill="#9C6338"/>
    <rect x="310" y="36" width="100" height="72" rx="8" fill="#9C6338"/>
    <rect x="316" y="42" width="88" height="60" rx="5" fill="#BDE8FF"/>
    <rect x="357" y="42" width="6" height="60" fill="#9C6338"/><rect x="316" y="69" width="88" height="6" fill="#9C6338"/>
    <rect x="0" y="300" width="720" height="100" fill="#E8C872"/>
    <g stroke="#D4AE52" stroke-width="3" stroke-linecap="round">
      <path d="M40 330 l18 -8 M120 350 l22 6 M220 325 l14 -10 M480 340 l20 -6 M600 330 l16 8 M660 360 l-18 -6 M330 365 l20 4"/>
    </g>`;
}

export function sceneBG(key) {
  const [top, bottom] = SKIES[key] || SKIES.hof;
  const id = `sky-${key}`;
  let body = '';
  if (key === 'stall') body = stallInside();
  else if (key === 'abend' || key === 'nacht') {
    body = `
      <g fill="#FFF8D6">${[[80, 40], [200, 80], [340, 30], [470, 70], [600, 40], [650, 110], [140, 120]].map(([x, y]) => `<circle class="twinkle" cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>
      <circle cx="440" cy="70" r="26" fill="#FFF3C4"/><circle cx="452" cy="63" r="22" fill="${top}"/>
      <path d="M0 260 Q180 200 360 240 T720 230 V400 H0 Z" fill="#3E6B4A"/>
      ${barn(290, 150, 0.9)}
      ${fence(320, '#D8CFC4')}
      <path d="M0 310 Q360 290 720 310 V400 H0 Z" fill="#2F553A"/>`;
  } else {
    body = `
      ${clouds()}
      <circle cx="450" cy="62" r="30" fill="#FFE27A"/>
      <path d="M0 250 Q160 180 340 230 T720 210 V400 H0 Z" fill="#9BD67A"/>
      ${key === 'hof' ? barn(290, 135, 1) : `<g fill="#5FAE52"><circle cx="300" cy="215" r="34"/><circle cx="335" cy="200" r="30"/><rect x="310" y="225" width="14" height="40" fill="#8A5A3C"/></g>`}
      ${fence(310)}
      <path d="M0 300 Q360 280 720 300 V400 H0 Z" fill="#7CC45A"/>
      ${flowers(330)}`;
  }
  return `<svg class="scene-bg" viewBox="0 0 720 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
    <rect width="720" height="400" fill="url(#${id})"/>
    ${body}
  </svg>`;
}
