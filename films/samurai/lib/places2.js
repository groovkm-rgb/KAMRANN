// More places (screen-space world: cam { x: 960, y: 540, z } = identity). Each set: fn(c, cam, lt, o) draws the full background.
const TOD = {
  dark: { sky: ['#0b1124', '#26324c'], glow: '120,150,220', glowA: .3, amb: 'rgba(30,40,80,.45)' },
  dawn: { sky: ['#41526f', '#b9a4a0'], glow: '210,200,230', glowA: .45, amb: 'rgba(60,70,110,.25)' },
  day: { sky: ['#8fb8dc', '#e4ecef'], glow: '255,245,220', glowA: .6, amb: null },
  dusk: { sky: ['#5b3a52', '#f0a060'], glow: '255,190,120', glowA: .6, amb: 'rgba(120,60,40,.18)' },
  night: { sky: ['#070b18', '#1a2440'], glow: '255,190,110', glowA: .55, amb: 'rgba(20,25,60,.5)' },
};
function ambient(c, tod) { const T = TOD[tod]; if (T && T.amb) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.fillStyle = T.amb.replace(/[\d.]+\)$/, '1)').replace('rgba', 'rgba'); c.globalAlpha = parseFloat(T.amb.match(/([\d.]+)\)$/)[1]) * 1.6; c.fillRect(0, 0, W, H); c.restore(); } }
function hangingScroll(c, x, y, w, h, o = {}) {
  c.fillStyle = '#4a3a2a'; c.fillRect(x - 6, y - 10, w + 12, 14); c.fillRect(x - 6, y + h, w + 12, 18);
  c.fillStyle = o.col || '#e9e0c8'; c.fillRect(x, y, w, h);
  // ink painting of a mountain and a pine (no writing)
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = 'rgba(40,35,30,.55)'; c.beginPath(); c.moveTo(x, y + h * .7); c.lineTo(x + w * .35, y + h * .3); c.lineTo(x + w * .55, y + h * .5); c.lineTo(x + w * .8, y + h * .25); c.lineTo(x + w, y + h * .6); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.fill();
  c.fillStyle = 'rgba(40,35,30,.85)'; stroke(c, [x + w * .2, y + h * .95, x + w * .25, y + h * .6], w * .04, 'rgba(40,35,30,.9)'); ell(c, x + w * .25, y + h * .58, w * .18, h * .04); c.fill();
  c.restore(); circ(c, x + w * .8, y + h * .88, w * .05); c.fillStyle = UI.red; c.fill();
}
function ikebana(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-26, 0); c.lineTo(26, 0); c.lineTo(20, -60); c.lineTo(-20, -60); c.closePath(); fo(c, '#3a4a5a', 3); stroke(c, [0, -60, -30, -170], 4, '#3a2a1a'); stroke(c, [0, -60, 40, -140], 4, '#3a2a1a'); for (const [px, py] of [[-30, -170], [40, -140], [-12, -120]]) { circ(c, px, py, 12); c.fillStyle = '#f2b8c6'; c.fill(); } c.restore(); }
// interior tatami room seen from the side (back wall = shoji), optional tokonoma, irori, table
function roomSet(c, cam, lt, o = {}) {
  const tod = o.tod || 'day', T = TOD[tod];
  fill(c, '#1a1410');
  layer(c, cam, .85, c => {
    // ceiling beams
    c.fillStyle = '#2a1d14'; c.fillRect(-600, -200, 3200, 240); for (let i = -4; i < 14; i++) { c.fillStyle = '#3a2a1c'; c.fillRect(i * 220, -200, 40, 240); }
    c.fillStyle = '#3d2a1c'; c.fillRect(-600, 30, 3200, 40);
    // shoji wall with light
    const glowA = { dark: .18, dawn: .4, day: .75, dusk: .55, night: .12 }[tod];
    shojiWall(c, o.tokonoma === false ? -400 : 520, 70, 2400, 560, { panels: 6, rows: 4, glow: glowA, glowCol: T.glow, frame: '#2a1c12', paper: tod === 'night' || tod === 'dark' ? '#27304a' : '#e8dcc0' });
    if (o.tokonoma !== false) {
      c.fillStyle = '#3b2a1c'; c.fillRect(-400, 70, 920, 560); c.fillStyle = '#2b1e14'; c.fillRect(-380, 90, 880, 520); c.fillStyle = '#5a3e28'; c.fillRect(-380, 560, 880, 50);
      hangingScroll(c, -40, 140, 200, 360); ikebana(c, 300, 560, .9);
      c.fillStyle = '#20150d'; c.fillRect(500, 60, 36, 600);
    }
    for (const px of [520, 1320, 2120]) { c.fillStyle = '#24180f'; c.fillRect(px - 18, 60, 36, 600); }
    c.fillStyle = '#2a1c12'; c.fillRect(-600, 620, 3200, 30);
  });
  layer(c, cam, 1, c => {
    tatamiPersp(c, 650, 1080, { far: tod === 'night' || tod === 'dark' ? '#2c3040' : '#8a7f55', near: tod === 'night' || tod === 'dark' ? '#3b4050' : JP.tatami });
    // light pane projected on the floor
    if (tod === 'day' || tod === 'dawn' || tod === 'dusk') { c.save(); c.globalCompositeOperation = 'screen'; for (let i = 0; i < 6; i++) { const x0 = 700 + i * 250; poly(c, [x0, 680, x0 + 210, 680, x0 + 320, 900, x0 + 110, 900]); c.fillStyle = rgba(T.glow, .14); c.fill(); } c.restore(); }
    if (o.irori) { const ix = o.irori; c.beginPath(); c.rect(ix - 170, 800, 340, 120); fo(c, '#3a2a1c', 4); c.fillStyle = '#6a6058'; c.fillRect(ix - 150, 814, 300, 92);
      for (let i = 0; i < 9; i++) { circ(c, ix - 60 + rnd(i) * 120, 850 + rnd(i + 1) * 40, 10); c.fillStyle = `rgba(255,${120 + rnd(i) * 80 | 0},40,${.6 + .4 * Math.sin(lt * 6 + i)})`; c.fill(); }
      bloom(c, ix, 840, 240, '255,150,70', .45);
      stroke(c, [ix, -200, ix, 700], 5, '#1a120c'); c.beginPath(); c.ellipse(ix, 760, 70, 58, 0, 0, Math.PI * 2); fo(c, '#222024', 4); stroke(c, [ix - 50, 712, ix + 50, 712], 5, '#444'); c.beginPath(); c.moveTo(ix + 60, 750); c.lineTo(ix + 100, 730); c.lineWidth = 10; c.strokeStyle = '#222024'; c.stroke();
      if (o.steam !== false) for (let i = 0; i < 6; i++) { const ph = (lt * .5 + i / 6) % 1; circ(c, ix + 100 + Math.sin(ph * 6 + i) * 20, 720 - ph * 220, 14 + ph * 30); c.fillStyle = `rgba(255,255,255,${.2 * (1 - ph)})`; c.fill(); }
    }
    if (o.table) lowTable(c, o.table, 900, 1.2);
    if (o.andon) andon(c, o.andon, 900, 1, lt);
  });
  ambient(c, tod);
}
function lowTable(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.rect(-230, -110, 460, 30); fo(c, '#3a2617', 4); c.beginPath(); c.rect(-210, -80, 26, 80); fo(c, '#2a1a0e', 3); c.beginPath(); c.rect(184, -80, 26, 80); fo(c, '#2a1a0e', 3); stroke(c, [-220, -106, 220, -106], 3, '#5a3e28'); c.restore(); }
function andon(c, x, y, s, lt) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.rect(-50, -230, 100, 170); c.fillStyle = '#ffd89a'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#2a1a0e'; c.stroke(); stroke(c, [-50, -145, 50, -145], 3, '#2a1a0e'); stroke(c, [-46, -60, -46, 0], 6, '#2a1a0e'); stroke(c, [46, -60, 46, 0], 6, '#2a1a0e'); bloom(c, 0, -150, 420, '255,190,110', .55 + Math.sin(lt * 9) * .03); c.restore(); }
// dōjō: dark wood floor, plaque row (blank wooden tags, no fake writing), weapon rack, open door with morning shafts
function dojoSet(c, cam, lt, o = {}) {
  fill(c, '#1c140e');
  layer(c, cam, .85, c => {
    c.fillStyle = '#3a2618'; c.fillRect(-600, -200, 3200, 900);
    for (let i = -4; i < 16; i++) { c.fillStyle = i % 2 ? '#352316' : '#3d291b'; c.fillRect(i * 180, -200, 180, 900); }
    c.fillStyle = '#24170e'; c.fillRect(-600, 140, 3200, 26);
    for (let i = 0; i < 26; i++) { const x = 60 + i * 64; c.beginPath(); c.rect(x, 180, 46, 150); fo(c, '#c9ad80', 3, '#2a1a0e'); stroke(c, [x + 23, 200, x + 23, 300], 6, 'rgba(40,25,15,.75)'); }
    // weapon rack with bokken
    c.beginPath(); c.rect(80, 420, 520, 26); fo(c, '#2a1a0e', 3); c.beginPath(); c.rect(80, 560, 520, 26); fo(c, '#2a1a0e', 3);
    for (let i = 0; i < 7; i++) { c.save(); c.translate(120 + i * 70, 640); c.rotate(-Math.PI / 2 + .02); drawBokken(c, 0, 0, .3); c.restore(); }
    // open door on the right with morning light
    c.fillStyle = '#f6e7c4'; c.fillRect(1460, 80, 360, 640); bloom(c, 1640, 400, 500, '255,235,190', .6);
    c.fillStyle = '#9fb46a'; c.fillRect(1460, 560, 360, 160); c.fillStyle = '#2a1a0e'; c.fillRect(1440, 60, 30, 680); c.fillRect(1820, 60, 30, 680);
  });
  layer(c, cam, 1, c => {
    c.fillStyle = vgrad(c, 0, 700, 0, 1080, [[0, '#4a2f1c'], [1, '#6e4a2e']]); c.fillRect(-600, 700, 3200, 500);
    for (let i = -20; i <= 20; i++) stroke(c, [960 + i * 60, 700, 960 + i * 260, 1200], 3, 'rgba(30,18,10,.6)', 'butt');
    if (o.door !== false) { sunRays(c, 1640, 300, { n: 6, len: 1600, dir: Math.PI * .75, spread: .35, alpha: .2, t: lt }); motes(c, 600, 1700, 200, 1000, lt, { n: 60 }); }
  });
}
// castle exterior: huge sloped stone base, white tiers, black roofs, gate, walls, flags, crows
function castleSet(c, cam, lt, o = {}) {
  const tod = o.tod || 'day';
  skyGrad(c, tod === 'dusk' ? [[0, '#5b3a52'], [1, '#f0a060']] : tod === 'night' ? [[0, '#070b18'], [1, '#1a2440']] : [[0, '#86b0d8'], [1, '#e2eaee']]);
  layer(c, cam, .15, c => { ridge(c, -400, 2400, 760, 220, tod === 'night' ? '#141a2c' : '#8aa0b8', 3, { freq: 4 }); haze(c, '230,235,240', tod === 'night' ? .05 : .25); });
  layer(c, cam, .5, c => {
    c.fillStyle = tod === 'night' ? '#1c2232' : '#7d8a68'; c.fillRect(-600, 900, 3200, 400);
    // outer wall
    c.fillStyle = JP.stone; c.beginPath(); c.moveTo(-600, 900); c.lineTo(-600, 820); c.lineTo(2600, 820); c.lineTo(2600, 900); c.fill();
    c.fillStyle = JP.plaster; c.fillRect(-600, 770, 3200, 52); tileRoof(c, 1000, 772, 4000, 40, { tiles: false, curl: .02 });
    castle(c, o.cx ?? 1000, 820, o.cs ?? 1.15, { lw: 3 });
    // gate
    if (o.gate !== false) { const gx = o.gx ?? 1000; c.beginPath(); c.rect(gx - 120, 700, 240, 180); fo(c, '#4a3020', 4); stroke(c, [gx, 700, gx, 880], 5, '#2a1a0e'); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { circ(c, gx - 90 + i * 60, 730 + j * 50, 6); c.fillStyle = '#b0904a'; c.fill(); } tileRoof(c, gx, 700, 380, 70); }
    for (let i = 0; i < 8; i++) nobori(c, 200 + i * 230 + (i > 3 ? 280 : 0), 870, 230, { w: 40, t: lt + i, seed: i, mon: (c, x, y, r) => drawKamon(c, x, y, r, SAM.indigo), lw: 2 });
  });
  for (let i = 0; i < (o.crows ?? 3); i++) crow(c, ((300 + i * 260 + lt * 90) % 2200) - 100, 200 + i * 40 + Math.sin(lt + i) * 20, 1.1, lt + i);
  if (tod === 'night') ambient(c, 'night');
}
// throne room: long hall, gold panels with pine, raised dais
function throneSet(c, cam, lt, o = {}) {
  fill(c, '#1b130c');
  layer(c, cam, .8, c => {
    c.fillStyle = '#c9a24a'; c.fillRect(-500, 60, 2900, 560);
    const g = c.createLinearGradient(0, 60, 0, 620); g.addColorStop(0, 'rgba(255,240,180,.5)'); g.addColorStop(1, 'rgba(120,80,20,.4)'); c.fillStyle = g; c.fillRect(-500, 60, 2900, 560);
    for (let i = 0; i < 12; i++) { c.fillStyle = 'rgba(255,235,170,.35)'; c.fillRect(-500 + i * 260, 60, 4, 560); }
    // painted pines on gold
    for (const px of [100, 900, 1700]) { pineTree(c, px, 600, 1.6, { col: '#2f5a3a', trunk: '#3a2a1a', lw: 0 }); }
    c.fillStyle = '#2a1a0e'; c.fillRect(-500, 40, 2900, 30); c.fillRect(-500, 610, 2900, 26);
    c.fillStyle = '#3a2614'; c.fillRect(-500, -300, 2900, 340); for (let i = 0; i < 20; i++) { c.fillStyle = '#4a321c'; c.fillRect(-500 + i * 150, -300, 20, 340); }
  });
  layer(c, cam, 1, c => {
    tatamiPersp(c, 636, 1080, { far: '#8a7f55', near: '#b9ab76', vx: 960 });
    // dais
    c.beginPath(); c.moveTo(560, 640); c.lineTo(1360, 640); c.lineTo(1400, 720); c.lineTo(520, 720); c.closePath(); fo(c, '#a79764', 4); stroke(c, [520, 720, 1400, 720], 12, '#2a1a0e');
    if (o.cushion !== false) { c.beginPath(); c.ellipse(960, 690, 150, 26, 0, 0, Math.PI * 2); fo(c, '#7a1f24', 3); }
  });
}
function farmhouse(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.rect(-150, -140, 300, 140); fo(c, '#6e5a40', 3); c.beginPath(); c.rect(-40, -100, 80, 100); fo(c, '#2a1d12', 3); c.beginPath(); c.moveTo(-210, -130); c.lineTo(0, -320); c.lineTo(210, -130); c.closePath(); fo(c, '#b39a62', 3); for (let i = 0; i < 12; i++) stroke(c, [-200 + i * 36, -134, 0, -316], 2, '#8a7444'); c.restore(); }
function villageSet(c, cam, lt, o = {}) {
  skyGrad(c, [[0, '#9cc0de'], [1, '#eef0e6']]);
  layer(c, cam, .1, c => { ridge(c, -400, 2400, 560, 260, '#9aaabe', 4, { freq: 3 }); haze(c, '235,240,240', .35); });
  layer(c, cam, .3, c => { ridge(c, -400, 2400, 620, 120, '#6e8a6a', 8, { freq: 6 }); for (let i = 0; i < 4; i++) farmhouse(c, 300 + i * 420, 640, .45); });
  layer(c, cam, .6, c => { paddies(c, 640, 1100, ['#b8cfdc', '#90aac0'], { sprouts: true, dike: '#5c6b3a' }); });
  if (o.road !== false) layer(c, cam, 1, c => { c.fillStyle = '#b59a6e'; c.beginPath(); c.moveTo(-600, 1080); c.lineTo(700, 820); c.lineTo(1100, 820); c.lineTo(2600, 1080); c.closePath(); c.fill(); for (let i = 0; i < 30; i++) { circ(c, 200 + rnd(i) * 1500, 860 + rnd(i + 1) * 200, 3 + rnd(i) * 4); c.fillStyle = '#8f7650'; c.fill(); } });
}
function bambooSet(c, cam, lt, o = {}) {
  fill(c, '#16261a'); skyGrad(c, [[0, '#cfe2c6'], [1, '#6f8f6a']]);
  for (let L = 0; L < 4; L++) {
    const p = .2 + L * .25; layer(c, cam, p, c => {
      if (L === 1) haze(c, '200,225,190', .25);
      for (let i = 0; i < 18; i++) { const x = -300 + i * 160 + rnd(i + L * 30) * 90, w = 18 + L * 12, sway = Math.sin(lt * .8 + i + L) * (8 + L * 6), col = ['#7c9a5e', '#5f8048', '#486a36', '#2f4a26'][L];
        c.beginPath(); c.moveTo(x - w / 2, 1200); c.quadraticCurveTo(x - w / 2 + sway * .3, 400, x - w / 2 + sway, -200); c.lineTo(x + w / 2 + sway, -200); c.quadraticCurveTo(x + w / 2 + sway * .3, 400, x + w / 2, 1200); c.closePath(); c.fillStyle = col; c.fill();
        for (let j = 0; j < 8; j++) { const y = -100 + j * 160 + rnd(i + j) * 40; stroke(c, [x - w / 2 + sway * (1 - y / 1200) * .6, y, x + w / 2 + sway * (1 - y / 1200) * .6, y], 3, 'rgba(30,50,25,.6)'); }
        if (L < 3) for (let j = 0; j < 5; j++) { c.save(); c.translate(x + sway * .8, 100 + j * 90 + rnd(i * 7 + j) * 60); c.rotate(rnd(i + j) * 2 - 1 + Math.sin(lt + j) * .1); ell(c, 40, 0, 46, 8); c.fillStyle = col; c.fill(); c.restore(); } }
    });
  }
  sunRays(c, 1300, -100, { n: 7, dir: Math.PI * .62, spread: .5, alpha: .16, t: lt });
  c.fillStyle = '#3b3422'; c.fillRect(0, 960, W, 120);
}
function gateFrame(c, x, y, s = 1) { // generic weathered wooden gate (two posts, two beams), unnamed
  c.save(); c.translate(x, y); c.scale(s, s); const col = '#4a3a2c';
  for (const sx of [-170, 170]) { c.beginPath(); c.rect(sx - 18, -420, 36, 420); fo(c, col, 4); }
  c.beginPath(); c.moveTo(-260, -440); c.quadraticCurveTo(0, -470, 260, -440); c.lineTo(250, -410); c.lineTo(-250, -410); c.closePath(); fo(c, '#2e241c', 4);
  c.beginPath(); c.rect(-210, -350, 420, 24); fo(c, col, 3); c.restore();
}
function mountainPassSet(c, cam, lt, o = {}) {
  const rain = o.rain;
  skyGrad(c, rain ? [[0, '#5d6874'], [1, '#a9b0b4']] : [[0, '#9ab8d4'], [1, '#e8ece6']]);
  layer(c, cam, .1, c => { ridge(c, -400, 2400, 520, 330, rain ? '#7a8590' : '#8ea2b8', 2, { freq: 2.5 }); c.fillStyle = 'rgba(250,252,255,.9)'; c.beginPath(); c.moveTo(900, 230); c.lineTo(1010, 300); c.lineTo(820, 300); c.fill(); haze(c, '220,228,232', .3); });
  layer(c, cam, .4, c => { ridge(c, -400, 2400, 760, 220, rain ? '#4e5a52' : '#56714e', 7, { freq: 5 }); for (let i = 0; i < 10; i++) pineTree(c, -100 + i * 230, 700 + rnd(i) * 60, .6, { col: '#2e4430', lw: 2 }); });
  layer(c, cam, .8, c => {
    // stone steps climbing to a gate
    for (let i = 0; i < 9; i++) { const y = 1080 - i * 46, w = 520 - i * 30; c.beginPath(); c.rect(960 - w / 2, y - 46, w, 46); fo(c, i % 2 ? '#8d8a84' : '#7d7a74', 3); stroke(c, [960 - w / 2, y - 44, 960 + w / 2, y - 44], 3, 'rgba(255,255,255,.2)'); }
    gateFrame(c, 960, 680, 1); stoneLantern(c, 600, 900, .9); stoneLantern(c, 1320, 900, .9);
  });
  if (rain) { c.save(); for (let i = 0; i < 260; i++) { const x = (rnd(i) * 2200 + lt * 300) % 2100 - 100, y = (rnd(i + 5) * 1200 + lt * 1400 * (.8 + rnd(i) * .4)) % 1200 - 60; stroke(c, [x, y, x - 8, y + 40], 2, 'rgba(210,220,235,.5)'); } c.restore(); }
}
function shopFront(c, x, y, w, word, col, lt, i) {
  c.save(); c.translate(x, y);
  c.beginPath(); c.rect(-w / 2, -420, w, 420); fo(c, '#5a3e28', 3); c.fillStyle = '#3a2818'; c.fillRect(-w / 2 + 14, -300, w - 28, 300);
  for (let k = 0; k < 6; k++) stroke(c, [-w / 2 + 20 + k * (w - 40) / 5, -300, -w / 2 + 20 + k * (w - 40) / 5, 0], 6, '#2a1a0e');
  tileRoof(c, 0, -420, w * 1.25, 110, { tiles: true });
  // noren curtain with a German word
  const nw = w * .7, sway = Math.sin(lt * 2 + i) * 6;
  for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-nw / 2 + k * nw / 3 + 4, -300); c.lineTo(-nw / 2 + (k + 1) * nw / 3 - 4, -300); c.lineTo(-nw / 2 + (k + 1) * nw / 3 - 4 + sway, -150); c.lineTo(-nw / 2 + k * nw / 3 + 4 + sway, -150); c.closePath(); fo(c, col, 3); }
  c.font = `${Math.min(60, nw / word.length * 1.5)}px ${UI.fontHead}`; c.textAlign = 'center'; c.fillStyle = '#f1ece0'; c.fillText(word, sway * .5, -205);
  // paper lantern
  ell(c, w / 2 - 40, -250, 30, 42); c.fillStyle = '#f4d6a0'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a1a0e'; c.stroke(); bloom(c, w / 2 - 40, -250, 90, '255,200,120', .35);
  c.restore();
}
function edoStreetSet(c, cam, lt, o = {}) {
  skyGrad(c, [[0, '#a6c3da'], [1, '#efe8d8']]);
  layer(c, cam, .3, c => { castle(c, 1500, 560, .35, { lw: 2 }); haze(c, '240,238,230', .3); });
  layer(c, cam, .8, c => {
    const words = o.words || ['Reis', 'Tee', 'Schirme', 'Sake', 'Stoffe', 'Reis'], cols = ['#26324f', '#4a5a34', '#7a1f24', '#26324f', '#5a3e28', '#4a5a34'];
    for (let i = 0; i < 6; i++) shopFront(c, -100 + i * 420, 820, 400, words[i], cols[i], lt, i);
  });
  layer(c, cam, 1, c => {
    c.fillStyle = '#c2a77a'; c.fillRect(-600, 820, 3200, 400);
    for (let i = 0; i < 14; i++) { const dir = i % 2 ? 1 : -1, x = ((i * 190 + lt * 60 * dir) % 2400 + 2400) % 2400 - 200; const who = ['peasant', 'merchant', 'wife', 'clerk'][i % 4]; if (who === 'clerk') drawPersonSide(c, { who: 'merchant', x, y: 960 + (i % 3) * 30, k: .2, s: dir, walk: lt * 8 + i, ink: 1.6, expr: { lid: .2 } }); else drawPersonSide(c, { who, x, y: 960 + (i % 3) * 30, k: .2, s: dir, walk: lt * 8 + i, ink: 1.6, expr: { lid: .2 } }); }
  });
}
function officeSet(c, cam, lt, o = {}) {
  roomSet(c, cam, lt, { tod: o.tod || 'day', tokonoma: false });
  layer(c, cam, 1, c => {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { const x = 220 + i * 470 + r * 120, y = 820 + r * 150, s = .7 + r * .25; lowTable(c, x, y, s); for (let k = 0; k < 3; k++) { c.beginPath(); c.rect(x - 140 * s + k * 12, y - 110 * s - 20 - k * 16, 120 * s, 16); fo(c, '#e9dfc6', 2); } }
  });
}
function cherryNightSet(c, cam, lt, o = {}) {
  skyGrad(c, [[0, '#060a18'], [.7, '#1b2546'], [1, '#2a3050']]); stars(c, 120, lt, .8, 600);
  layer(c, cam, .05, c => moonDisc(c, o.mx ?? 1350, o.my ?? 260, 90));
  layer(c, cam, .4, c => { ridge(c, -400, 2400, 800, 120, '#121a30', 5, { freq: 4 }); });
  layer(c, cam, .8, c => {
    c.fillStyle = '#141b2a'; c.fillRect(-600, 860, 3200, 400);
    stroke(c, [500, 900, 520, 560, 640, 380], 46, '#1a1214'); stroke(c, [520, 600, 300, 420], 24, '#1a1214'); stroke(c, [600, 420, 900, 300], 22, '#1a1214');
    for (let i = 0; i < 90; i++) { const a = rnd(i) * Math.PI * 2, r = rnd(i + 1); ell(c, 560 + Math.cos(a) * 380 * r, 400 + Math.sin(a) * 180 * r, 40, 26); c.fillStyle = i % 3 ? 'rgba(230,190,210,.85)' : 'rgba(250,220,235,.9)'; c.fill(); }
    stoneLantern(c, 1150, 900, 1.1, { lit: 1, col: '#4a4e5a', dark: '#30333c' });
  });
  for (let i = 0; i < 40; i++) { const ph = (lt * .12 + rnd(i)) % 1; sakuraPetal(c, 200 + rnd(i + 3) * 1600 + Math.sin(lt + i) * 60, ph * 1100 - 20, 9, lt * 2 + i, rnd(i + 7)); }
}
function atticSet(c, cam, lt, o = {}) {
  fill(c, '#120d09');
  layer(c, cam, .9, c => { for (let i = -2; i < 10; i++) { c.save(); c.translate(i * 260, 0); c.rotate(.5); c.fillStyle = '#2a1d14'; c.fillRect(0, -400, 40, 1600); c.restore(); } c.fillStyle = '#2a1d14'; c.fillRect(-300, 120, 2600, 40);
    // cobweb
    c.save(); c.translate(1700, 160); for (let i = 0; i < 7; i++) stroke(c, [0, 0, Math.cos(i * .25 + 1.6) * 260, Math.sin(i * .25 + 1.6) * 260], 1.5, 'rgba(220,220,220,.35)'); for (let r = 1; r < 5; r++) { c.beginPath(); for (let i = 0; i < 7; i++) { const a = i * .25 + 1.6; c.lineTo(Math.cos(a) * r * 55, Math.sin(a) * r * 55); } c.lineWidth = 1.2; c.strokeStyle = 'rgba(220,220,220,.3)'; c.stroke(); } c.restore(); });
  layer(c, cam, 1, c => { c.fillStyle = '#2e2116'; c.fillRect(-300, 820, 2600, 400); for (let i = 0; i < 12; i++) stroke(c, [-300, 840 + i * 24, 2300, 840 + i * 24], 2, 'rgba(0,0,0,.3)'); });
  sunRays(c, 300, -50, { n: 4, len: 1500, dir: Math.PI * .3, spread: .12, alpha: .3, t: lt }); motes(c, 300, 1300, 100, 900, lt, { n: 50 });
}
function courtyardSet(c, cam, lt, o = {}) {
  const season = o.season || 'snow', dark = o.dark;
  const sky = { snow: dark ? ['#0e1528', '#3a4866'] : ['#b8c4d2', '#e8ecf0'], spring: ['#9cc0de', '#f2e6ea'], summer: ['#5fa3e0', '#e9f0e2'], autumn: ['#c9a27a', '#f0d8b0'] }[season];
  skyGrad(c, [[0, sky[0]], [1, sky[1]]]);
  layer(c, cam, .5, c => {
    c.fillStyle = dark ? '#2a2f3e' : JP.plaster; c.fillRect(-600, 420, 3200, 300); tileRoof(c, 960, 424, 3600, 60, { tiles: true, curl: .02 }); c.fillStyle = dark ? '#1a1e2a' : '#8d8a84'; c.fillRect(-600, 650, 3200, 70);
    if (season === 'snow') { c.fillStyle = dark ? '#a8b4cc' : '#ffffff'; c.fillRect(-600, 360, 3200, 26); }
    const tree = { spring: ['#f6c3d0', '#fbdde4'], summer: ['#4f7a3a', '#6a9a48'], autumn: ['#c0502e', '#e08a3a'], snow: dark ? ['#5a6680', '#7a86a0'] : ['#ffffff', '#e8eef4'] }[season];
    stroke(c, [1500, 720, 1480, 420, 1560, 240], 36, '#2a1d16');
    for (let i = 0; i < 40; i++) { const a = rnd(i) * Math.PI * 2, r = rnd(i + 1); ell(c, 1520 + Math.cos(a) * 240 * r, 260 + Math.sin(a) * 130 * r, 50, 32); c.fillStyle = tree[i % 2]; c.fill(); }
  });
  layer(c, cam, 1, c => { c.fillStyle = season === 'snow' ? (dark ? '#8a96b0' : '#f4f6fa') : season === 'summer' ? '#d8c8a0' : '#c9b48a'; c.fillRect(-600, 720, 3200, 500);
    if (season !== 'snow') for (let i = 0; i < 60; i++) { circ(c, rnd(i) * 2000 - 40, 740 + rnd(i + 1) * 330, 3); c.fillStyle = 'rgba(120,100,70,.4)'; c.fill(); } });
  if (season === 'snow') for (let i = 0; i < 120; i++) { const x = (rnd(i) * 2100 + Math.sin(lt + i) * 40) % 2000, y = (rnd(i + 3) * 1100 + lt * 90 * (.6 + rnd(i))) % 1100; circ(c, x, y, 2 + rnd(i) * 3); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); }
  if (season === 'summer') { bloom(c, 300, 80, 600, '255,240,190', .6); }
  if (season === 'spring' || season === 'autumn') for (let i = 0; i < 30; i++) { const ph = (lt * .15 + rnd(i)) % 1; if (season === 'spring') sakuraPetal(c, 300 + rnd(i) * 1500, ph * 1100, 9, lt + i, rnd(i)); else { c.save(); c.translate(300 + rnd(i) * 1500 + Math.sin(lt + i) * 40, ph * 1100); c.rotate(lt + i); ell(c, 0, 0, 12, 7); c.fillStyle = '#c0502e'; c.fill(); c.restore(); } }
  if (dark) ambient(c, 'dark');
}
function storehouseSet(c, cam, lt, o = {}) {
  fill(c, '#18120c');
  layer(c, cam, .85, c => { c.fillStyle = '#3a2a1c'; c.fillRect(-500, -100, 2900, 900); for (let i = 0; i < 16; i++) { c.fillStyle = '#2e2116'; c.fillRect(-500 + i * 190, -100, 16, 900); } c.fillStyle = '#e8d8b0'; c.fillRect(1500, 120, 120, 90); sunRays(c, 1560, 160, { n: 3, len: 1200, dir: Math.PI * .72, spread: .1, alpha: .25, t: lt }); });
  layer(c, cam, 1, c => { c.fillStyle = '#4a3420'; c.fillRect(-500, 800, 2900, 400); const n = o.sacks ?? 30; for (let i = 0; i < n; i++) { const row = Math.floor(i / 8), x = 200 + (i % 8) * 190 + (row % 2) * 95, y = 860 - row * 105; if (y < 300) break; tawara(c, x, y, 1); } motes(c, 900, 1700, 200, 900, lt, { n: 30 }); });
}
function tawara(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.ellipse(0, 0, 100, 58, 0, 0, Math.PI * 2); fo(c, '#c9ad6e', 4); for (let i = -4; i <= 4; i++) stroke(c, [i * 22, -54 + Math.abs(i) * 3, i * 22, 54 - Math.abs(i) * 3], 2, '#9f8448'); for (const dx of [-60, 0, 60]) stroke(c, [dx, -58, dx, 58], 7, '#7a6234'); ell(c, 96, 0, 12, 50); fo(c, '#b3955a', 3); c.restore(); }
function drillFieldSet(c, cam, lt, o = {}) {
  skyGrad(c, [[0, '#9ab4cc'], [1, '#e6e6dc']]);
  layer(c, cam, .2, c => { ridge(c, -400, 2400, 640, 160, '#9aa6b0', 3); haze(c, '235,235,230', .3); c.fillStyle = '#c9c2b0'; c.fillRect(-400, 640, 2800, 600); });
  layer(c, cam, .7, c => { c.beginPath(); c.rect(1300, 420, 500, 240); fo(c, '#d8d0c0', 3); c.fillStyle = '#5a5248'; c.fillRect(1300, 380, 500, 50); for (let i = 0; i < 6; i++) { c.beginPath(); c.rect(1330 + i * 80, 480, 40, 60); fo(c, '#4a3a2c', 2); } });
}
