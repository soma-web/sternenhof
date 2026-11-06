// Hintergründe für die Geschichte (einfache SVG-Landschaften).
const SKIES = {
  hof: ['#9ED9FF', '#E6F7FF'],
  wiese: ['#8FD0FF', '#EAF8FF'],
  stall: ['#E9C9A0', '#F6E4C8'],
  abend: ['#2C3E78', '#F59E7A'],
  nacht: ['#16204A', '#3B4C8F'],
  wald: ['#BFE6C8', '#EAF7EC'],
  fluss: ['#8FD0FF', '#E6F7FF'],
  muehle: ['#A8DCFF', '#F2FAFF'],
  fest: ['#5B4B9A', '#FFB38A'],
  sturm: ['#2B3245', '#5B6680'],
  morgen: ['#9ED9FF', '#FFF1D6'],
  turnier: ['#8FD0FF', '#EAF8FF'],
};

function tree(x, y, s = 1, dark = false) {
  const c1 = dark ? '#2F7A45' : '#3E9455';
  const c2 = dark ? '#276B3B' : '#4FA864';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-8" y="-10" width="16" height="70" rx="4" fill="#7A5134"/>
    <circle cx="0" cy="-40" r="42" fill="${c1}"/><circle cx="-26" cy="-18" r="28" fill="${c2}"/><circle cx="26" cy="-20" r="30" fill="${c2}"/>
  </g>`;
}

function pine(x, y, s = 1, col = '#2E6B44') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-6" y="0" width="12" height="30" fill="#6B4630"/>
    <path d="M0 -90 L34 -20 H-34 Z M0 -60 L40 10 H-40 Z" fill="${col}"/>
  </g>`;
}

function mill(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="0" y="40" width="110" height="90" fill="#D9CBB8"/>
    <g fill="#C4B49E"><rect x="8" y="50" width="22" height="12" rx="2"/><rect x="60" y="64" width="26" height="12" rx="2"/><rect x="20" y="96" width="24" height="12" rx="2"/><rect x="74" y="108" width="22" height="12" rx="2"/></g>
    <path d="M-10 44 L55 0 L120 44 Z" fill="#8C4A3A"/>
    <rect x="44" y="84" width="26" height="46" rx="12" fill="#6B4630"/>
    <rect x="16" y="60" width="22" height="20" rx="3" fill="#FFE9A8"/>
    <g class="wheel">
      <circle cx="130" cy="95" r="40" fill="none" stroke="#7A5134" stroke-width="8"/>
      <path d="M130 55 V135 M90 95 H170 M102 67 L158 123 M158 67 L102 123" stroke="#7A5134" stroke-width="6"/>
    </g>
  </g>`;
}

function bunting(y) {
  const cols = ['#FF7FAF', '#FFD34D', '#5FCFAE', '#7FB2FF', '#B58CFF'];
  let flags = '';
  for (let k = 0; k < 18; k++) {
    const x = 10 + k * 40;
    flags += `<path d="M${x} ${y + 6} L${x + 32} ${y + 6} L${x + 16} ${y + 34} Z" fill="${cols[k % 5]}"/>`;
  }
  return `<path d="M0 ${y} Q360 ${y + 30} 720 ${y}" stroke="#fff" stroke-width="3" fill="none"/>${flags}`;
}

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

function rain() {
  let l = '';
  for (let i = 0; i < 46; i++) {
    const x = (i * 157) % 760;
    const y = (i * 89) % 380;
    l += `<line x1="${x}" y1="${y}" x2="${x - 6}" y2="${y + 22}"/>`;
  }
  return `<g class="rain">${l}</g>`;
}

function rainbow(cx, cy, r) {
  const cols = ['#E8605A', '#F4A63C', '#F4D442', '#6CCB6E', '#5BA8F0', '#9C7FE8'];
  return `<g opacity=".85" fill="none" stroke-width="12">${cols.map((c, i) => `<path d="M${cx - r + i * 12} ${cy} A${r - i * 12} ${r - i * 12} 0 0 1 ${cx + r - i * 12} ${cy}" stroke="${c}"/>`).join('')}</g>`;
}

function stands(y) {
  const cols = ['#FF7FAF', '#FFD34D', '#7FB2FF', '#5FCFAE', '#B58CFF', '#FF9F6B'];
  let crowd = '';
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 22; k++) {
      const x = 14 + k * 33 + (r % 2) * 16;
      const yy = y + 14 + r * 22;
      crowd += `<circle cx="${x}" cy="${yy}" r="8" fill="${cols[(k + r * 2) % 6]}"/><circle cx="${x}" cy="${yy - 11}" r="6" fill="#F3C9A8"/>`;
    }
  }
  return `<rect x="0" y="${y}" width="720" height="78" fill="#C9D3E2"/>
    <rect x="0" y="${y}" width="720" height="8" fill="#9AA8BE"/>${crowd}
    <rect x="0" y="${y + 74}" width="720" height="10" fill="#FFFFFF"/>`;
}

function poleJump(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="0" y="-60" width="8" height="64" fill="#fff" stroke="#ccc"/><rect x="92" y="-60" width="8" height="64" fill="#fff" stroke="#ccc"/>
    <g>${[0, 1, 2, 3, 4].map((k) => `<rect x="${8 + k * 17}" y="-38" width="17" height="8" fill="${k % 2 ? '#fff' : '#E8453C'}"/>`).join('')}</g>
    <g>${[0, 1, 2, 3, 4].map((k) => `<rect x="${8 + k * 17}" y="-20" width="17" height="8" fill="${k % 2 ? '#E8453C' : '#fff'}"/>`).join('')}</g>
  </g>`;
}

function flagRow(y) {
  const cols = ['#FF7FAF', '#FFD34D', '#5FCFAE', '#7FB2FF', '#B58CFF'];
  return [60, 200, 340, 480, 620].map((x, k) => `<rect x="${x}" y="${y}" width="4" height="60" fill="#8A8F99"/><path d="M${x + 4} ${y} l34 10 l-34 10 Z" fill="${cols[k]}"/>`).join('');
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
  else if (key === 'wald') {
    body = `
      ${pine(200, 230, 1.2, '#3F7F55')}${pine(520, 230, 1.3, '#3F7F55')}${pine(120, 240, 1, '#4C8E62')}${pine(600, 240, 1.1, '#4C8E62')}
      <path d="M0 250 Q360 220 720 250 V400 H0 Z" fill="#6DB86A"/>
      ${tree(270, 250, 1.1, true)}${tree(450, 250, 1.2, true)}
      <path d="M330 400 Q350 320 360 260 Q370 320 400 400 Z" fill="#C9A66B"/>
      <g fill="#E8453C"><circle cx="300" cy="330" r="8"/><circle cx="430" cy="345" r="7"/></g>
      <g fill="#fff"><circle cx="297" cy="327" r="2"/><circle cx="304" cy="331" r="1.6"/><circle cx="428" cy="342" r="1.6"/></g>
      <g fill="#F2EBDD"><rect x="297" y="334" width="6" height="10"/><rect x="427" y="348" width="6" height="9"/></g>
      ${flowers(360)}`;
  } else if (key === 'fluss') {
    body = `
      ${clouds()}
      <circle cx="450" cy="62" r="30" fill="#FFE27A"/>
      <path d="M0 220 Q180 170 360 200 T720 190 V260 H0 Z" fill="#8CCB74"/>
      ${mill(420, 112, 0.6)}
      <path d="M0 250 Q360 235 720 250 V320 Q360 305 0 320 Z" fill="#5BB6F0"/>
      <g stroke="#BFE7FF" stroke-width="3" fill="none" stroke-linecap="round" class="waves">
        <path d="M60 270 q15 -8 30 0 t30 0"/><path d="M300 285 q15 -8 30 0 t30 0"/><path d="M520 268 q15 -8 30 0 t30 0"/><path d="M200 300 q15 -8 30 0 t30 0"/>
      </g>
      <path d="M0 315 Q360 300 720 315 V400 H0 Z" fill="#7CC45A"/>
      <g stroke="#4E8E3E" stroke-width="4" stroke-linecap="round"><path d="M250 330 v-28 M258 332 v-22 M470 332 v-26 M478 330 v-18"/></g>
      <g fill="#8A5A3C"><ellipse cx="254" cy="300" rx="4" ry="9"/><ellipse cx="474" cy="304" rx="4" ry="9"/></g>`;
  } else if (key === 'muehle') {
    body = `
      ${clouds()}
      <path d="M0 230 Q180 180 360 210 T720 200 V400 H0 Z" fill="#9BD67A"/>
      ${tree(170, 240, 0.9)}${tree(560, 240, 1)}
      ${mill(270, 150, 1)}
      <path d="M380 260 Q560 250 720 270 V310 Q560 290 400 300 Z" fill="#5BB6F0"/>
      <path d="M0 300 Q360 285 720 300 V400 H0 Z" fill="#7CC45A"/>
      ${flowers(335)}`;
  } else if (key === 'fest') {
    body = `
      <g fill="#FFF8D6">${[[80, 30], [200, 60], [600, 40], [660, 90]].map(([x, y]) => `<circle class="twinkle" cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>
      <path d="M0 250 Q180 200 360 230 T720 220 V400 H0 Z" fill="#6FA35E"/>
      ${barn(290, 140, 0.95)}
      ${bunting(110)}
      ${bunting(150)}
      <g>${[180, 260, 460, 540].map((x, k) => `<circle class="twinkle" cx="${x}" cy="${200 + (k % 2) * 14}" r="7" fill="#FFE27A"/>`).join('')}</g>
      <path d="M0 300 Q360 285 720 300 V400 H0 Z" fill="#5E9150"/>
      ${flowers(335)}`;
  }
  else if (key === 'sturm') {
    body = `
      <rect class="sky-flash" width="720" height="400" fill="#fff"/>
      <g fill="#4A5470"><ellipse cx="150" cy="60" rx="120" ry="40"/><ellipse cx="380" cy="45" rx="150" ry="45"/><ellipse cx="620" cy="70" rx="130" ry="42"/></g>
      <g fill="#3B4560"><ellipse cx="260" cy="90" rx="110" ry="30"/><ellipse cx="520" cy="100" rx="120" ry="30"/></g>
      <path class="bolt" d="M470 90 L445 160 L470 158 L440 230 L500 140 L474 142 L498 90 Z" fill="#FFE66B"/>
      <path d="M0 260 Q180 210 360 240 T720 230 V400 H0 Z" fill="#3D5A45"/>
      ${barn(290, 150, 0.9)}
      <rect x="340" y="208" width="40" height="30" fill="#FFE9A8" opacity=".9"/>
      ${fence(320, '#B8AFA4')}
      <path d="M0 310 Q360 290 720 310 V400 H0 Z" fill="#2F4A38"/>
      ${rain()}`;
  } else if (key === 'morgen') {
    body = `
      ${rainbow(360, 250, 230)}
      ${clouds()}
      <circle cx="560" cy="70" r="30" fill="#FFE27A"/>
      <path d="M0 250 Q160 180 340 230 T720 210 V400 H0 Z" fill="#9BD67A"/>
      ${barn(290, 135, 1)}
      ${fence(310)}
      <g fill="#7FB2E8" opacity=".8"><ellipse cx="150" cy="345" rx="40" ry="8"/><ellipse cx="560" cy="355" rx="34" ry="7"/></g>
      <path d="M0 300 Q360 280 720 300 V400 H0 Z" fill="#7CC45A" opacity=".0"/>
      ${flowers(330)}`;
  } else if (key === 'turnier') {
    body = `
      ${clouds()}
      ${flagRow(40)}
      ${stands(110)}
      <rect x="0" y="198" width="720" height="202" fill="#E7C98F"/>
      <g stroke="#D6B47A" stroke-width="3" stroke-linecap="round"><path d="M40 260 l20 -4 M160 300 l24 6 M520 280 l18 -6 M640 330 l-20 -4 M300 350 l22 4"/></g>
      ${poleJump(120, 290, 1)}${poleJump(500, 280, 0.9)}
      <rect x="0" y="198" width="720" height="6" fill="#fff"/>`;
  } else if (key === 'abend' || key === 'nacht') {
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
