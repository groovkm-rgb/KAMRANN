// SETS for the vertical restaurant short. Set coords: (0,0) = screen centre at rest; floor where Noah stands ≈ y 800.
// Each set: xxxBack(c, cam, t, o) draws background layers (p < 1), xxxFront(c, cam, t, o) the foreground (p > 1).

// ---------- small shared pieces ----------
function bricks(c, x0, y0, x1, y1, base, seed = 0, o = {}) {
  c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
  c.fillStyle = base; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  const bh = o.bh || 34, bw = o.bw || 96;
  for (let r = 0, y = y0; y < y1; r++, y += bh) for (let x = x0 - (r % 2) * bw / 2; x < x1; x += bw) {
    const v = rnd(seed + r * 131 + Math.floor(x)) - .5; c.fillStyle = shade(base, v * .22); c.fillRect(x + 3, y + 3, bw - 6, bh - 6);
  }
  c.fillStyle = 'rgba(0,0,0,.18)'; for (let r = 0, y = y0; y < y1; r++, y += bh) c.fillRect(x0, y, x1 - x0, 3);
  c.restore();
}
function sky(c, cam, stops, x0 = -2000, y0 = -3000, x1 = 2000, y1 = 1000) {
  const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach((s, i) => g.addColorStop(s[0], s[1])); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
}
function cloud(c, x, y, s, col, lit = '255,220,170', a = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a;
  const parts = [[-160, 10, 90], [-60, -30, 120], [70, -10, 110], [170, 20, 80], [0, 30, 130]];
  for (const [px, py, r] of parts) { c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); }
  for (const [px, py, r] of parts) { c.beginPath(); c.arc(px - r * .25, py - r * .3, r * .75, 0, Math.PI * 2); c.fillStyle = `rgba(${lit},.35)`; c.fill(); }
  c.restore();
}
function bird(c, x, y, t, s = 1, seed = 0) { const f = Math.sin(t * 9 + seed) * .6; c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-30, -f * 20); c.quadraticCurveTo(-14, -10, 0, 4); c.quadraticCurveTo(14, -10, 30, -f * 20); c.lineWidth = 5; c.strokeStyle = '#2b2230'; c.lineCap = 'round'; c.stroke(); c.restore(); }
function streetLampPost(c, x, y, h, on, t, o = {}) {
  line(c, [x, y, x, y - h], 22, OUT); line(c, [x, y, x, y - h], 12, o.col || '#2e3a3a');
  line(c, [x, y - h, x + 70 * (o.s || 1), y - h - 20], 12, OUT);
  c.beginPath(); c.moveTo(x + 40 * (o.s || 1), y - h - 30); c.lineTo(x + 110 * (o.s || 1), y - h - 30); c.lineTo(x + 95 * (o.s || 1), y - h + 30); c.lineTo(x + 55 * (o.s || 1), y - h + 30); c.closePath(); fs(c, on ? '#ffe6a8' : '#5a6070', 5);
  if (on) { glowAt(c, x + 75 * (o.s || 1), y - h + 10, 260, o.glow || '255,200,120', .55 * on); glowAt(c, x + 75 * (o.s || 1), y - h + 10, 60, '255,240,210', .9 * on); }
  c.beginPath(); c.rect(x - 22, y - 40, 44, 40); fs(c, '#2e3a3a', 4);
}
function bicycle(c, x, y, s = 1, col = '#2f7f8f') {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const wx of [-110, 110]) { c.beginPath(); c.arc(wx, -70, 70, 0, Math.PI * 2); c.lineWidth = 9; c.strokeStyle = OUT; c.stroke(); for (let i = 0; i < 8; i++) line(c, [wx, -70, wx + Math.cos(i * .8) * 66, -70 + Math.sin(i * .8) * 66], 2, '#555'); }
  line(c, [-110, -70, -20, -70, 50, -170, -50, -170, -110, -70], 12, col); line(c, [-20, -70, -60, -190], 12, col); line(c, [50, -170, 110, -70], 12, col); line(c, [50, -170, 40, -220, 80, -230], 8, OUT); line(c, [-80, -195, -30, -195], 14, OUT);
  c.beginPath(); c.rect(70, -170, 70, 40); fs(c, '#8a5a32', 4);
  c.restore();
}
function chalkboard(c, x, y, s = 1, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, [-150, 0, -110, -420], 18, '#6b4228'); line(c, [150, 0, 110, -420], 18, '#6b4228');
  c.beginPath(); c.rect(-130, -400, 260, 300); fs(c, '#2c3530', 6); c.lineWidth = 14; c.strokeStyle = '#7d5232'; c.strokeRect(-130, -400, 260, 300);
  txt(c, 'Heute', 0, -340, 40, 'rgba(250,250,240,.92)', 'center', { weight: 700 });
  for (let i = 0; i < 4; i++) { line(c, [-95, -290 + i * 42, -95 + 120 + rnd(i) * 50, -290 + i * 42], 5, 'rgba(240,240,230,.6)'); line(c, [70, -290 + i * 42, 100, -290 + i * 42], 5, 'rgba(255,210,120,.7)'); }
  c.beginPath(); c.arc(-80, -150, 20, 0, Math.PI * 2); c.lineWidth = 4; c.strokeStyle = 'rgba(255,140,140,.7)'; c.stroke();
  c.restore();
}
// interior seen through a window: warm restaurant (tables, lamps, plants, a few people)
function windowInterior(c, x0, y0, x1, y1, t, o = {}) {
  c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, o.night ? '#5a3020' : '#8a5030'); g.addColorStop(1, o.night ? '#2a160e' : '#4a2a18'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  // back wall paintings + shelves
  for (let i = 0; i < 3; i++) { const px = x0 + 40 + i * (x1 - x0 - 80) / 3; c.beginPath(); c.rect(px, y0 + 90, 70, 54); fs(c, ['#3d6b7a', '#a35a3a', '#6a7a3a'][i], 3); }
  for (let i = 0; i < 4; i++) { const tx = x0 + (i + .5) * (x1 - x0) / 4, ty = y1 - 120 - (i % 2) * 30; c.beginPath(); c.ellipse(tx, ty, 50, 12, 0, 0, Math.PI * 2); fs(c, '#efe6d6', 2); line(c, [tx, ty, tx, ty + 70], 6, '#2a1a10'); candle(c, tx, ty - 4, o.on ?? 1, t, .45, i); }
  for (let i = 0; i < 3; i++) { const bx = x0 + (i + .5) * (x1 - x0) / 3; edison(c, bx, y0, 60 + (i % 2) * 40, t, o.on ?? 1, i + (o.seed || 0), .7); }
  if (o.people) for (let i = 0; i < o.people; i++) { const px = x0 + 60 + i * 110, py = y1 - 110; c.fillStyle = 'rgba(40,20,15,.75)'; c.beginPath(); c.arc(px, py - 70, 26, 0, Math.PI * 2); c.fill(); c.fillRect(px - 30, py - 44, 60, 60); }
  // glass reflection
  c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(x0 + (x1 - x0) * .2, y0); c.lineTo(x0 + (x1 - x0) * .45, y0); c.lineTo(x0 + (x1 - x0) * .1, y1); c.lineTo(x0 - (x1 - x0) * .15, y1); c.fill();
  if (o.glass) { c.fillStyle = o.glass; c.fillRect(x0, y0, x1 - x0, y1 - y0); }
  c.restore();
  glowAt(c, (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * .9, '255,170,90', .22 * (o.on ?? 1));
  c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.lineWidth = 16; c.strokeStyle = o.frame || '#2b2420'; c.stroke();
  line(c, [x0, y0 + (y1 - y0) * .3, x1, y0 + (y1 - y0) * .3], 8, o.frame || '#2b2420');
}

// =================== M1: RESTAURANT FRONT ===================
// o: { night, neon (0..1), flick (letter idx flicker), banner, ribbon: 'whole'|'cut', cutT, rainA }
function m1Back(c, cam, t, o = {}) {
  const N = !!o.night;
  // sky
  layer(c, cam, .15, c => {
    if (N) sky(c, cam, [[0, '#070a1c'], [.5, '#141a3a'], [.8, '#2b2a4e'], [1, '#3b2f4e']]);
    else sky(c, cam, [[0, '#2f3f86'], [.35, '#7a6aa6'], [.6, '#f2956a'], [.78, '#ffc787'], [1, '#ffe3b0']]);
    if (!N) { glowAt(c, -620, -420, 900, '255,200,120', .7); glowAt(c, -620, -420, 200, '255,245,210', .95); for (let i = 0; i < 6; i++) cloud(c, -900 + i * 380 + Math.sin(t * .05 + i) * 30, -1500 + (i % 3) * 260, .9 + rnd(i) * .7, i % 2 ? '#e88d74' : '#d47a78', '255,215,150', .95); }
    else { for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,255,255,${.3 + .4 * rnd(i + 5)})`; c.fillRect(-1500 + rnd(i) * 3000, -2600 + rnd(i + 1) * 1800, 3, 3); } for (let i = 0; i < 5; i++) cloud(c, -1000 + i * 520, -1300 + (i % 2) * 200, 1.4, '#232647', '120,130,190', .9); }
  });
  // far skyline / neighbouring buildings
  layer(c, cam, .45, c => {
    for (let i = 0; i < 8; i++) { const x = -1600 + i * 420, h = 900 + rnd(i + 3) * 900; c.fillStyle = N ? '#1b1f38' : shade('#b0697a', (rnd(i) - .5) * .3); c.fillRect(x, -400 - h, 360, h + 1400); for (let r = 0; r < 12; r++) for (let q = 0; q < 4; q++) if (rnd(i * 50 + r * 4 + q) > (N ? .55 : .7)) { c.fillStyle = N ? 'rgba(255,200,120,.75)' : 'rgba(255,230,190,.5)'; c.fillRect(x + 30 + q * 80, -400 - h + 60 + r * 90, 40, 50); } }
    haze(c, N ? '40,45,90' : '255,190,140', N ? .25 : .32);
    if (!N) for (let i = 0; i < 7; i++) bird(c, -500 + ((t * 70 + i * 260) % 1400), -1250 + Math.sin(t + i) * 40 + i * 30, t, .8 + (i % 3) * .2, i);
  });
  // neighbour shops left & right (p .85)
  layer(c, cam, .85, c => {
    bricks(c, -1300, -1900, -640, 900, N ? '#4a3a44' : '#b86a52', 7);
    // bakery awning left
    c.beginPath(); c.moveTo(-1300, -150); c.lineTo(-660, -150); c.lineTo(-620, 10); c.lineTo(-1300, 10); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.save(); c.clip(); for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#2f7f6f' : '#f4efe2'; c.fillRect(-1300 + i * 60, -160, 60, 180); } c.restore(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke();
    windowInterior(c, -1250, 40, -700, 560, t, { night: N, seed: 9, people: 2 });
    bricks(c, 640, -1900, 1300, 900, N ? '#3e3a50' : '#c9a47a', 11);
    windowInterior(c, 700, -80, 1250, 560, t, { night: N, seed: 4, people: 1 });
  });
}
// main facade (p .95): bricks, upper windows, banner, sign, door, shop windows
function m1Facade(c, cam, t, o = {}) {
  const N = !!o.night;
  layer(c, cam, .95, c => {
    bricks(c, -660, -2000, 660, 900, N ? '#5b3a3a' : '#a8503c', 3);
    // cornice + pilasters
    c.beginPath(); c.rect(-680, -1180, 1360, 50); fs(c, N ? '#463a3a' : '#e8d6b8', 5);
    c.beginPath(); c.rect(-680, -260, 1360, 30); fs(c, N ? '#463a3a' : '#e8d6b8', 5);
    for (const px of [-660, 600]) { c.beginPath(); c.rect(px, -230, 60, 1130); fs(c, N ? '#3f3434' : '#d8c4a4', 5); }
    // upper floor windows (dim, calm area for subtitles)
    for (const wx of [-520, -110, 300]) for (const wy of [-1080, -620]) {
      c.beginPath(); c.rect(wx, wy, 220, 300); fs(c, N ? '#1d2140' : '#5f6f98', 6);
      if (N && rnd(wx + wy) > .4) { c.fillStyle = 'rgba(255,190,110,.55)'; c.fillRect(wx + 8, wy + 8, 204, 284); }
      c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(wx + 40, wy); c.lineTo(wx + 110, wy); c.lineTo(wx + 20, wy + 300); c.lineTo(wx - 40, wy + 300); c.fill();
      line(c, [wx + 110, wy, wx + 110, wy + 300], 6, '#e8dcc6'); c.beginPath(); c.rect(wx - 14, wy + 300, 248, 24); fs(c, '#e8dcc6', 4);
      // window boxes with flowers
      for (let i = 0; i < 6; i++) ell(c, wx + 20 + i * 36, wy + 292, 16, 16, ['#e8455a', '#f4c542', '#5f9e4a'][i % 3], 2);
    }
    // banner "Eröffnung" across the first floor
    if (o.banner !== false) {
      const sw = Math.sin(t * 2) * 6;
      line(c, [-560, -860, -420, -840 + sw], 4, OUT); line(c, [560, -860, 420, -840 + sw], 4, OUT);
      c.beginPath(); c.moveTo(-420, -870 + sw); c.quadraticCurveTo(0, -840 + sw * 1.5, 420, -870 + sw); c.lineTo(420, -760 + sw); c.quadraticCurveTo(0, -730 + sw * 1.5, -420, -760 + sw); c.closePath(); fs(c, N ? '#7a2630' : '#d63a3a', 6);
      c.save(); c.translate(0, -800 + sw * 1.2); txt(c, 'Eröffnung', 0, 22, 70, N ? '#e8d2a0' : '#fff4d6', 'center', { weight: 800 }); c.restore();
      for (let i = 0; i < 9; i++) { const x = -400 + i * 100; c.beginPath(); c.moveTo(x, -740 + sw); c.lineTo(x + 30, -700 + sw); c.lineTo(x + 60, -740 + sw); c.closePath(); fs(c, ['#ffd23f', '#3ec1d3', '#ff8fd0'][i % 3], 3); }
    }
    // neon sign board above the door
    c.beginPath(); rrect(c, -380, -340, 760, 112, 20); fs(c, '#1a1416', 7);
    for (const sx of [-360, 360]) { ell(c, sx, -340, 7, 7, '#888', 2); }
    const on = o.neon ?? 1;
    // per-letter flicker: draw the text in two parts if o.flick
    const s1 = 'Noahs Restaurant';
    if (o.flickA != null) {
      neonText(c, 'Noahs Restaur', -36, -284, 74, '255,80,140', on, { font: `italic 800 74px ${FONT()}` });
      neonText(c, 'a', 188, -284, 74, '255,80,140', on * o.flickA, { font: `italic 800 74px ${FONT()}`, align: 'left' });
      neonText(c, 'nt', 230, -284, 74, '255,80,140', on, { font: `italic 800 74px ${FONT()}`, align: 'left' });
    } else neonText(c, s1, 0, -284, 74, '255,80,140', on, { font: `italic 800 74px ${FONT()}` });
    if (on > .05) glowAt(c, 0, -290, 620, '255,70,140', .35 * on);
    // shop windows
    windowInterior(c, -560, -150, -230, 560, t, { night: N, seed: 1, people: N ? 0 : 1 });
    windowInterior(c, 230, -150, 560, 560, t, { night: N, seed: 2, people: N ? 0 : 1 });
    // gold lettering below windows (no words)
    for (const wx of [-560, 230]) { c.beginPath(); c.rect(wx - 10, 560, 350, 150); fs(c, N ? '#3a2626' : '#6a2a22', 6); }
    // door
    c.beginPath(); c.rect(-200, -190, 400, 900); fs(c, '#2a1d18', 8);
    windowInterior(c, -170, -160, -10, 520, t, { night: N, seed: 5, frame: '#3a2a1e' });
    windowInterior(c, 10, -160, 170, 520, t, { night: N, seed: 6, frame: '#3a2a1e' });
    c.beginPath(); c.rect(-180, 520, 360, 180); fs(c, '#4a2f22', 6); ell(c, -30, 360, 12, 12, '#e8c35a', 4); ell(c, 30, 360, 12, 12, '#e8c35a', 4);
    // step
    c.beginPath(); c.rect(-260, 700, 520, 60); fs(c, N ? '#3a3a44' : '#b9a68c', 6);
    // wall lantern
    for (const lx of [-245, 245]) { c.beginPath(); c.rect(lx - 22, -140, 44, 80); fs(c, '#2a2420', 5); c.fillStyle = 'rgba(255,215,140,.95)'; c.fillRect(lx - 14, -130, 28, 60); glowAt(c, lx, -100, 220, '255,190,110', N ? .7 : .35); }
  });
}
// sidewalk + street + props (p 1)
function m1Ground(c, cam, t, o = {}) {
  const N = !!o.night;
  layer(c, cam, 1, c => {
    const g = c.createLinearGradient(0, 740, 0, 1400); g.addColorStop(0, N ? '#25283a' : '#c9b49a'); g.addColorStop(1, N ? '#12131e' : '#8f7a66'); c.fillStyle = g; c.fillRect(-1400, 740, 2800, 900);
    for (let i = -8; i < 9; i++) line(c, [i * 160, 760, i * 220, 1400], 3, N ? 'rgba(0,0,0,.4)' : 'rgba(80,60,40,.35)');
    for (let r = 0; r < 4; r++) line(c, [-1400, 800 + r * r * 60, 1400, 800 + r * r * 60], 3, N ? 'rgba(0,0,0,.4)' : 'rgba(80,60,40,.3)');
    if (N) { // wet reflections of the neon + windows
      c.save(); c.globalCompositeOperation = 'screen'; c.filter = 'blur(8px)';
      for (const [x, col, a] of [[0, '255,80,140', .55 * (o.neon ?? 1)], [-395, '255,170,90', .4], [395, '255,170,90', .4]]) { const gg = c.createLinearGradient(0, 760, 0, 1300); gg.addColorStop(0, `rgba(${col},${a})`); gg.addColorStop(1, `rgba(${col},0)`); c.fillStyle = gg; c.fillRect(x - 170, 760, 340, 540); }
      c.restore(); splashes(c, -700, 700, 780, 1200, t, 40);
    }
    streetLampPost(c, 470, 980, 1250, N ? 1 : .0, t, { s: -1 });
    flowerPot(c, -300, 790, 1, 3, t); flowerPot(c, 300, 790, 1, 8, t);
    if (o.balloons !== false) {
      const cols = ['#ff4d5e', '#ffd23f', '#3ec1d3', '#ff8fd0', '#7ed957'];
      for (let i = 0; i < 5; i++) { balloon(c, -300, 700, cols[i], t, 1, i, 420 + (i % 3) * 110 + (i - 2) * 10); balloon(c, 300, 700, cols[(i + 2) % 5], t, 1, i + 7, 400 + ((i + 1) % 3) * 120); }
    }
    bicycle(c, 560, 900, 1.1);
  });
}
// ribbon + stanchions (p 1.0, in front of Noah)
function m1Ribbon(c, cam, t, o = {}) {
  layer(c, cam, 1.02, c => {
    for (const sx of [-470, 470]) { line(c, [sx, 980, sx, 520], 30, OUT); line(c, [sx, 980, sx, 520], 18, '#d9b24a'); ell(c, sx, 515, 26, 26, '#e8c35a', 6); c.beginPath(); c.ellipse(sx, 985, 80, 22, 0, 0, Math.PI * 2); fs(c, '#c9a040', 6); }
    const k = o.cutK ?? 0; // 0 whole, >0 cut and falling
    const rb = (x0, y0, x1, y1, sag) => { c.beginPath(); c.moveTo(x0, y0 - 18); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag - 18, x1, y1 - 18); c.lineTo(x1, y1 + 18); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag + 18, x0, y0 + 18); c.closePath(); fs(c, '#d81f2e', 5); line(c, [x0, y0 - 8, x1, y1 - 8], 3, 'rgba(255,140,140,.6)'); };
    if (k <= 0) {
      rb(-470, 525, 0, 560, 26); rb(0, 560, 470, 525, 26);
      // bow
      for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, 560); c.bezierCurveTo(sd * 90, 470, sd * 130, 620, 0, 560); fs(c, '#e8323f', 5); c.beginPath(); c.moveTo(0, 565); c.lineTo(sd * 60, 690); c.lineTo(sd * 30, 680); c.closePath(); fs(c, '#c41a28', 4); }
      ell(c, 0, 560, 22, 22, '#b01522', 5);
    } else {
      const d = easeOut(k);
      // two halves drop and swing down from the stanchions
      for (const sd of [-1, 1]) {
        const ax = sd * 470, ay = 525, L = 470, ang = (Math.PI / 2) * d + Math.sin(k * 12) * .15 * (1 - d) * sd;
        const ex = ax - sd * Math.cos(ang) * L, ey = ay + Math.sin(ang) * L;
        c.beginPath(); c.moveTo(ax, ay - 16); c.quadraticCurveTo((ax + ex) / 2 + sd * 30 * d, (ay + ey) / 2 + 20, ex, ey - 16); c.lineTo(ex - sd * 4, ey + 16); c.quadraticCurveTo((ax + ex) / 2 + sd * 30 * d, (ay + ey) / 2 + 52, ax, ay + 16); c.closePath(); fs(c, '#d81f2e', 5);
      }
    }
  });
}
function m1Light(c, cam, t, o = {}) {
  if (!o.night) {
    const [sx, sy] = toScreen(cam, .2, -620, -420);
    for (let i = 0; i < 6; i++) beam(c, sx, sy, sx + 1500 + i * 120, sy + 900 + i * 260, 30, 260 + i * 40, '255,210,150', .1, t, i);
    dust(c, 0, W, 300, 1800, t, { n: 60, color: '255,225,170', alpha: .55 });
    gradeFrame(c, { sx: .05, sy: .25, warm: '255,170,80', warmA: .45, cool: '70,30,90', coolA: .35, vig: .5 });
  } else {
    rain(c, t, { n: 220, a: .4 });
    gradeFrame(c, { sx: .5, sy: .35, warm: '255,90,150', warmA: .25, cool: '10,15,45', coolA: .6, vig: .7, tint: '40,60,140', tintA: .2 });
  }
}

// =================== M2: EMPTY HALL UNDER CONSTRUCTION ===================
function m2Back(c, cam, t, o = {}) {
  layer(c, cam, .7, c => {
    // back wall, half painted
    c.fillStyle = '#9aa0a6'; c.fillRect(-1600, -2200, 3200, 3000);
    bricks(c, -1600, -2200, 1600, 800, '#8f7a70', 21, { bh: 30, bw: 84 });
    c.fillStyle = '#d8d0c0'; c.fillRect(-1600, -2200, 1100 + (o.paint ?? 0) * 900, 3000);
    for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(216,208,192,.8)'; c.fillRect(-500 + (o.paint ?? 0) * 900 + rnd(i) * 80, -1600 + i * 160, 60 + rnd(i + 3) * 60, 120); }
    // tall windows left with cold daylight
    for (const wx of [-1150, -700]) { c.beginPath(); c.rect(wx, -1300, 300, 1000); fs(c, '#cfe0ee', 10); line(c, [wx + 150, -1300, wx + 150, -300], 10, '#5b636b'); for (let r = 1; r < 4; r++) line(c, [wx, -1300 + r * 250, wx + 300, -1300 + r * 250], 8, '#5b636b'); c.save(); c.globalAlpha = .6; c.fillStyle = '#8fa8bc'; c.fillRect(wx + 10, -1290, 280, 980); c.restore(); }
    // unfinished bar counter
    c.beginPath(); c.rect(80, 140, 760, 420); fs(c, '#b48a5c', 7); for (let i = 0; i < 9; i++) line(c, [80 + i * 95, 140, 80 + i * 95, 560], 4, '#8a6a44');
    c.beginPath(); c.rect(80, 120, 380, 30); fs(c, '#6b4a2e', 5);
    // cables hanging from ceiling
    for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-600 + i * 330, -2200); c.quadraticCurveTo(-520 + i * 330, -900 + rnd(i) * 300, -450 + i * 330, -1200); c.lineWidth = 6; c.strokeStyle = '#222'; c.stroke(); }
    // ceiling beams
    for (let i = 0; i < 6; i++) { c.beginPath(); c.rect(-1600, -1900 + i * 30, 3200, 14); c.fillStyle = 'rgba(40,40,45,.5)'; c.fill(); }
    // floor
    const g = c.createLinearGradient(0, 500, 0, 1400); g.addColorStop(0, '#7d7a76'); g.addColorStop(1, '#4a4846'); c.fillStyle = g; c.fillRect(-1600, 560, 3200, 1400);
    // window light patches on floor
    c.save(); c.globalCompositeOperation = 'screen'; for (const wx of [-1150, -700]) { c.fillStyle = 'rgba(170,200,230,.22)'; c.beginPath(); c.moveTo(wx + 700, 620); c.lineTo(wx + 1000, 620); c.lineTo(wx + 1300, 1100); c.lineTo(wx + 900, 1100); c.closePath(); c.fill(); } c.restore();
  });
  haze(c, '150,170,195', .14);
  layer(c, cam, .85, c => {
    // ladder
    const lx = 520; line(c, [lx - 120, 760, lx, -150, lx + 120, 760], 16, OUT); line(c, [lx - 120, 760, lx, -150, lx + 120, 760], 9, '#c9b06a'); for (let i = 1; i < 6; i++) line(c, [lx - 120 + i * 18, 760 - i * 150, lx - i * 3, 760 - i * 150 + 20], 7, '#c9b06a');
    // paint buckets
    for (const [bx, col] of [[300, '#e8e3d8'], [380, '#4f86c6'], [620, '#e8e3d8']]) { c.beginPath(); c.moveTo(bx - 50, 640); c.lineTo(bx + 50, 640); c.lineTo(bx + 44, 760); c.lineTo(bx - 44, 760); c.closePath(); fs(c, '#d9d9d9', 5); c.beginPath(); c.ellipse(bx, 640, 50, 14, 0, 0, Math.PI * 2); fs(c, col, 4); c.beginPath(); c.arc(bx, 640, 48, Math.PI, 0); c.lineWidth = 3; c.strokeStyle = '#555'; c.stroke(); }
    // plastic-wrapped stacked chairs left
    for (let i = 0; i < 4; i++) chair(c, -620 + (i % 2) * 30, 760 - i * 60, .85, '#6b4228');
    c.save(); c.globalAlpha = .35; c.beginPath(); c.rect(-720, 50, 220, 720); c.fillStyle = '#e8f0f6'; c.fill(); c.restore(); line(c, [-720, 300, -500, 320], 3, 'rgba(255,255,255,.7)');
    cardboard(c, -330, 780, 220, 180, 1, true); cardboard(c, -260, 600, 160, 130, 1);
    // drop cloth + cables on floor
    c.beginPath(); c.moveTo(-200, 760); c.quadraticCurveTo(100, 700, 400, 780); c.lineTo(350, 840); c.quadraticCurveTo(0, 820, -260, 850); c.closePath(); fs(c, 'rgba(230,225,210,.85)', 4);
    c.beginPath(); c.moveTo(-800, 800); c.bezierCurveTo(-300, 740, -100, 880, 600, 800); c.lineWidth = 8; c.strokeStyle = '#1f1f22'; c.stroke();
    // bare bulb
    edison(c, -40, -1500, 900 + Math.sin(t * .8) * 4, t, o.bulb ?? .8, 3, 1.1);
  });
}
function m2Front(c, cam, t, o = {}) {
  layer(c, cam, 1.3, c => {
    // foreground: sawhorse + plank, blurred
    line(c, [-700, 1300, -560, 900, -420, 1300], 30, '#8a6a44'); c.beginPath(); c.rect(-760, 880, 520, 50); fs(c, '#b48a5c', 6);
    line(c, [620, 1350, 720, 860], 40, '#4f86c6');
  }, o.fgBlur ?? 9);
}
function m2Light(c, cam, t, o = {}) {
  for (const [wx, i] of [[-1150, 0], [-700, 1]]) { const [x0, y0] = toScreen(cam, .7, wx + 150, -800); const [x1, y1] = toScreen(cam, .7, wx + 1000, 900); beam(c, x0, y0, x1, y1, 260, 700, '170,200,235', .22, t, i); }
  dust(c, 0, W, 200, 1800, t, { n: 110, color: '220,230,245', alpha: .7, speed: .02 });
  gradeFrame(c, { sx: .1, sy: .2, warm: '180,210,240', warmA: .28, cool: '30,40,70', coolA: .5, vig: .6, tint: '80,110,150', tintA: .18 });
}

// =================== M3: PROFESSIONAL KITCHEN ===================
function m3Back(c, cam, t, o = {}) {
  layer(c, cam, .7, c => {
    // tiled wall
    c.fillStyle = '#d7dde0'; c.fillRect(-1600, -2200, 3200, 3000);
    for (let y = -2200; y < 800; y += 70) for (let x = -1600; x < 1600; x += 70) { c.fillStyle = shade('#e6ecee', (rnd(x * .3 + y) - .5) * .06); c.fillRect(x + 2, y + 2, 66, 66); }
    // shelves with spice jars
    for (const sy of [-900, -650]) { c.beginPath(); c.rect(-900, sy, 900, 24); fs(c, '#9aa3ab', 5); for (let i = 0; i < 12; i++) { const jx = -870 + i * 72; c.beginPath(); rrect(c, jx, sy - 90, 52, 90, 8); fs(c, 'rgba(230,240,245,.6)', 3); c.fillStyle = ['#c0392b', '#e0a43a', '#6a8a3a', '#7a4a2a', '#d9c27a'][(i + sy) % 5 < 0 ? 0 : (i + Math.abs(sy)) % 5]; c.fillRect(jx + 6, sy - 60, 40, 56); c.beginPath(); c.rect(jx + 4, sy - 104, 44, 18); fs(c, '#333', 3); } }
    // hanging pots & pans rack
    line(c, [-200, -1300, 900, -1300], 16, '#6b737a');
    for (let i = 0; i < 6; i++) { const px = -120 + i * 180, sw = Math.sin(t * 1.4 + i) * .05; c.save(); c.translate(px, -1300); c.rotate(sw); line(c, [0, 0, 0, 80], 5, '#444'); c.beginPath(); c.arc(0, 160, 70 + (i % 3) * 15, 0, Math.PI * 2); const g = c.createRadialGradient(-20, 140, 10, 0, 160, 90); g.addColorStop(0, '#f2f5f8'); g.addColorStop(1, i % 2 ? '#b0772e' : '#7a838c'); fs(c, g, 5); line(c, [0, 80, 0, 100], 10, '#333'); c.restore(); }
    // hood
    c.beginPath(); c.moveTo(-850, -500); c.lineTo(250, -500); c.lineTo(350, -250); c.lineTo(-950, -250); c.closePath(); const hg = c.createLinearGradient(0, -500, 0, -250); hg.addColorStop(0, '#c8ced4'); hg.addColorStop(1, '#8d959d'); fs(c, hg, 6);
    // range with flames
    c.beginPath(); c.rect(-950, 180, 1250, 600); fs(c, '#8d959d', 7);
    c.beginPath(); c.rect(-950, 150, 1250, 40); fs(c, '#c8ced4', 5);
    for (let i = 0; i < 4; i++) { const fx = -800 + i * 300, on = o.fire ?? 1; c.beginPath(); c.ellipse(fx, 150, 90, 20, 0, 0, Math.PI * 2); fs(c, '#2a2a2e', 4);
      if (on > 0) for (let j = 0; j < 9; j++) { const a = j / 9 * Math.PI * 2, fl = 1 + Math.sin(t * 20 + j * 2 + i) * .3; c.beginPath(); c.moveTo(fx + Math.cos(a) * 60, 150 + Math.sin(a) * 14); c.quadraticCurveTo(fx + Math.cos(a) * 66, 130, fx + Math.cos(a) * 56, 150 - 40 * fl * on); c.quadraticCurveTo(fx + Math.cos(a) * 50, 140, fx + Math.cos(a) * 60, 150 + Math.sin(a) * 14); c.fillStyle = j % 2 ? 'rgba(80,140,255,.9)' : 'rgba(255,170,60,.9)'; c.fill(); }
      if (on > 0) glowAt(c, fx, 110, 260, '255,150,70', .5 * on);
      // pot on top
      if (i % 2 === 0) { c.beginPath(); c.rect(fx - 80, 0, 160, 130); fs(c, '#a6aeb6', 5); c.beginPath(); c.ellipse(fx, 0, 80, 16, 0, 0, Math.PI * 2); fs(c, '#c8ced4', 4); }
    }
    // oven doors
    for (let i = 0; i < 2; i++) { c.beginPath(); c.rect(-900 + i * 600, 300, 520, 380); fs(c, '#6d757d', 5); c.fillStyle = 'rgba(255,140,60,.35)'; c.fillRect(-860 + i * 600, 360, 440, 200); line(c, [-860 + i * 600, 330, -440 + i * 600, 330], 12, '#d0d5da'); }
    // big fridge right
    c.beginPath(); c.rect(500, -900, 620, 1680); fs(c, '#b9c1c8', 8); line(c, [810, -900, 810, 780], 6, '#6d757d'); line(c, [780, -500, 780, -200], 14, '#e6eaee'); line(c, [840, -500, 840, -200], 14, '#e6eaee');
    if (o.fridgeOpen) { c.fillStyle = 'rgba(220,240,255,.9)'; c.fillRect(820, -880, 290, 1640); glowAt(c, 960, -100, 700, '200,230,255', .5); }
    // floor
    const g = c.createLinearGradient(0, 780, 0, 1600); g.addColorStop(0, '#5f666c'); g.addColorStop(1, '#30353a'); c.fillStyle = g; c.fillRect(-1600, 780, 3200, 1400);
    for (let i = -10; i < 10; i++) line(c, [i * 120, 780, i * 200, 1600], 3, 'rgba(0,0,0,.25)');
  });
  layer(c, cam, .82, c => {
    // background chef working at the range
    if (o.chef !== false) person(c, { x: -420, y: 790, k: .48, skin: '#c98d62', hair: { style: 'short', col: '#1a1410' }, top: '#f4f2ea', jacket: true, hat: 'chef', bottom: '#2b2b30', apron: '#f4f2ea', moustache: true, arms: { l: { a: .5, b: -1.1 }, r: { a: .6 + Math.sin(t * 6) * .15, b: -1.2 } }, expr: { mouth: 'smile', look: -.5 } });
  });
  haze(c, '230,220,200', .08);
}
function m3Front(c, cam, t, o = {}) {
  layer(c, cam, 1.25, c => {
    // stainless steel prep counter in the foreground with cutting board + veg
    c.beginPath(); c.rect(-900, 980, 1800, 500); const g = c.createLinearGradient(0, 980, 0, 1100); g.addColorStop(0, '#e8edf1'); g.addColorStop(1, '#8d959d'); fs(c, g, 8);
    line(c, [-900, 1000, 900, 1000], 4, 'rgba(255,255,255,.9)');
    c.beginPath(); rrect(c, -500, 900, 420, 90, 10); fs(c, '#c99a62', 6);
    for (let i = 0; i < 5; i++) ell(c, -440 + i * 70, 890, 30, 26, ['#e04a3a', '#f2a23a', '#5f9e3a', '#e04a3a', '#7a3a6a'][i], 4);
    c.beginPath(); c.moveTo(200, 960); c.quadraticCurveTo(260, 820, 320, 960); fs(c, '#6aa84f', 5);
  }, o.fgBlur ?? 7);
}
function m3Light(c, cam, t, o = {}) {
  for (let i = 0; i < 3; i++) { const [x, y] = toScreen(cam, .75, -300 + i * 500, -1150); beam(c, x, y, x + (i - 1) * 100, y + 1500, 80, 600, '255,235,200', .16, t, i); glow(c, x, y, 160, '255,230,180', .6); }
  // steam
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < 30; i++) { const ph = (t * .35 + rnd(i)) % 1, [sx, sy] = toScreen(cam, .7, -800 + (i % 4) * 300 + Math.sin(ph * 6 + i) * 40, -20 - ph * 900); c.beginPath(); c.arc(sx, sy, 30 + ph * 110, 0, Math.PI * 2); c.fillStyle = `rgba(240,240,250,${.13 * Math.sin(ph * Math.PI)})`; c.fill(); }
  c.restore();
  gradeFrame(c, { sx: .4, sy: .5, warm: '255,170,90', warmA: .35, cool: '30,50,70', coolA: .45, vig: .55 });
}

// =================== M4: NOAH'S OFFICE AT NIGHT ===================
function m4Back(c, cam, t, o = {}) {
  layer(c, cam, .55, c => {
    // window with rain + city lights
    c.fillStyle = '#0b1026'; c.fillRect(-1600, -2200, 3200, 3400);
    for (let i = 0; i < 40; i++) { const x = 100 + rnd(i) * 900, y = -1400 + rnd(i + 3) * 900, r = 14 + rnd(i + 5) * 40; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = `rgba(${['255,190,110', '255,120,160', '120,200,255', '255,230,150'][i % 4]},${.25 + rnd(i) * .3})`; c.fill(); }
  }, 6);
  layer(c, cam, .8, c => {
    // wall
    c.fillStyle = o.wall || '#3a3f55'; c.fillRect(-1600, -2200, 3200, 3200);
    for (let x = -1600; x < 1600; x += 90) { c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x, -2200, 4, 3200); }
    // window frame (cut-out where the city shows: draw frame only, inner cleared with dark glass + rain)
    c.save(); c.globalCompositeOperation = 'destination-out'; c.fillRect(140, -1460, 820, 920); c.restore();
    c.beginPath(); c.rect(140, -1460, 820, 920); c.lineWidth = 26; c.strokeStyle = '#1f222e'; c.stroke(); line(c, [550, -1460, 550, -540], 16, '#1f222e'); line(c, [140, -1000, 960, -1000], 16, '#1f222e');
    c.save(); c.beginPath(); c.rect(140, -1460, 820, 920); c.clip(); for (let i = 0; i < 70; i++) { const x = 150 + rnd(i) * 800, y0 = -1460 + ((t * 120 * (0.5 + rnd(i + 2)) + rnd(i + 1) * 920) % 920); line(c, [x, y0, x + 2, y0 + 30], 3, 'rgba(180,200,255,.55)'); ell(c, x + 30, -1460 + rnd(i + 9) * 920, 5, 7, 'rgba(200,220,255,.35)', 0); } c.restore();
    c.beginPath(); c.rect(120, -540, 860, 40); fs(c, '#2a2e3c', 5);
    // wall calendar
    if (o.calendar !== false) wallCalendar(c, -560, -1300, o.calYear || 'Jahr 1', o.calTear || 0, t, o.calFlip || 0);
    // cork board with business plan
    c.beginPath(); c.rect(-820, -560, 520, 360); fs(c, '#a07850', 7);
    for (let i = 0; i < 4; i++) { c.save(); c.translate(-760 + i * 120, -500 + (i % 2) * 120); c.rotate((rnd(i) - .5) * .2); c.beginPath(); c.rect(0, 0, 110, 140); fs(c, '#f2ecdc', 3); for (let j = 0; j < 4; j++) line(c, [12, 24 + j * 26, 90, 24 + j * 26], 4, '#9a9a9a'); if (i === 1) { line(c, [12, 120, 40, 90, 70, 100, 98, 60], 5, '#3a8a4a'); } ell(c, 55, 6, 9, 9, '#d63a3a', 2); c.restore(); }
    // shelf with binders
    c.beginPath(); c.rect(-300, -180, 520, 24); fs(c, '#5a4030', 5);
    for (let i = 0; i < 8; i++) { c.beginPath(); c.rect(-290 + i * 60, -400, 52, 220); fs(c, ['#2f6fb0', '#c0392b', '#3d8a4f', '#e0a43a'][i % 4], 4); c.beginPath(); c.rect(-280 + i * 60, -360, 32, 40); fs(c, '#f2ecdc', 2); }
    // plant
    c.beginPath(); c.moveTo(860, 120); c.lineTo(980, 120); c.lineTo(960, 280); c.lineTo(880, 280); c.closePath(); fs(c, '#8a4a2a', 5);
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .35 + Math.sin(t + i) * .03; c.beginPath(); c.ellipse(920 + Math.cos(a) * 90, 120 + Math.sin(a) * 90, 70, 22, a, 0, Math.PI * 2); fs(c, '#3d6b35', 4); }
  });
}
function wallCalendar(c, x, y, year, tear, t, flip = 0) {
  c.save(); c.translate(x, y);
  c.beginPath(); c.rect(-10, -40, 540, 690); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill();
  c.beginPath(); c.rect(0, 0, 520, 640); fs(c, '#f4efe4', 7);
  c.beginPath(); c.rect(0, 0, 520, 130); fs(c, '#c0392b', 7);
  txt(c, year, 260, 92, 72, '#fff8ea');
  for (let i = 0; i < 8; i++) ell(c, 40 + i * 63, 0, 10, 16, '#888', 3);
  // page (grid) — next page under it
  const grid = (alpha) => { c.save(); c.globalAlpha = alpha; for (let r = 0; r < 5; r++) for (let q = 0; q < 7; q++) { c.beginPath(); c.rect(26 + q * 67, 170 + r * 88, 60, 80); fs(c, (r * 7 + q) % 7 > 4 ? '#f2d9d0' : '#fffdf7', 2); } c.restore(); };
  grid(1);
  if (tear > 0 && tear < 1.5) { // page flying off
    const k = clamp(tear), px = 260 + k * 900, py = 400 - k * 700 + k * k * 300, a = k * 2.2;
    c.save(); c.translate(px, py); c.rotate(a); c.scale(1 - k * .3, 1 - k * .2); c.beginPath(); c.rect(-247, -230, 494, 460); fs(c, '#fffdf7', 5); for (let r = 0; r < 5; r++) for (let q = 0; q < 7; q++) { c.beginPath(); c.rect(-230 + q * 67, -210 + r * 88, 60, 80); fs(c, '#fffdf7', 2); } c.restore();
  }
  c.restore();
}
function m4Light(c, cam, t, o = {}) {
  const fl = o.flicker ? (Math.sin(t * 50) > .6 || Math.sin(t * 13) > .9 ? .55 : 1) : 1;
  const [lx, ly] = toScreen(cam, 1.0, o.lampX ?? -300, o.lampY ?? 560);
  beam(c, lx, ly, lx + 120, ly + 900, 60, 900, '255,200,120', .28 * fl, t);
  glow(c, lx, ly, 700, '255,180,100', .45 * fl); glow(c, lx, ly, 90, '255,240,200', .9 * fl);
  const [wx, wy] = toScreen(cam, .8, 550, -1000); glow(c, wx, wy, 900, '90,120,220', .22, 'screen');
  dust(c, lx - 300, lx + 500, ly - 200, ly + 900, t, { n: 40, color: '255,220,170', alpha: .5 });
  gradeFrame(c, { sx: lx / W, sy: ly / H, warm: '255,170,80', warmA: .5 * fl, wr: .5, cool: '10,15,50', coolA: .75, vig: .75, tint: '30,40,110', tintA: .25 });
}
// desk (foreground of the office), top at y = 700
function m4Desk(c, cam, t, o = {}) {
  layer(c, cam, 1.0, c => {
    c.beginPath(); c.moveTo(-900, 700); c.lineTo(900, 700); c.lineTo(1000, 1600); c.lineTo(-1000, 1600); c.closePath(); const g = c.createLinearGradient(0, 700, 0, 1100); g.addColorStop(0, '#6b4228'); g.addColorStop(1, '#3a2214'); fs(c, g, 8);
    for (let i = 0; i < 6; i++) line(c, [-900, 740 + i * 70, 900, 740 + i * 70], 3, 'rgba(255,220,170,.08)');
    // lamp
    const lx = o.lampX ?? -300, ly = o.lampY ?? 560;
    c.beginPath(); c.ellipse(lx - 90, 760, 90, 24, 0, 0, Math.PI * 2); fs(c, '#2a4a3a', 5); line(c, [lx - 90, 760, lx - 140, 560, lx - 20, 470], 14, '#2a4a3a');
    c.beginPath(); c.moveTo(lx - 60, 430); c.lineTo(lx + 60, 470); c.lineTo(lx + 40, 580); c.lineTo(lx - 120, 520); c.closePath(); fs(c, '#2f6a4a', 6);
    // coffee cup
    c.beginPath(); c.moveTo(380, 640); c.lineTo(500, 640); c.lineTo(490, 760); c.lineTo(390, 760); c.closePath(); fs(c, '#f2ecdc', 5); c.beginPath(); c.arc(510, 690, 30, -1.3, 1.3); c.lineWidth = 10; c.strokeStyle = OUT; c.stroke(); c.beginPath(); c.ellipse(440, 640, 60, 12, 0, 0, Math.PI * 2); fs(c, '#3a2214', 4);
    // scattered papers
    for (let i = 0; i < 5; i++) { c.save(); c.translate(-560 + i * 260, 830 + (i % 2) * 60); c.rotate((rnd(i + 20) - .5) * .5); c.beginPath(); c.rect(-90, -60, 180, 120); fs(c, '#efe8d8', 3); for (let j = 0; j < 3; j++) line(c, [-70, -30 + j * 25, 50, -30 + j * 25], 4, '#aaa'); c.restore(); }
    if (o.calc !== false) calculator(c, o.calcX ?? 640, 900, .9, o.calcSmoke || 0, t, .15);
  });
}

// =================== M5: RESTAURANT AT NIGHT ===================
// o: { emptyDark: [indices of dark tables], tables: n }
function m5Back(c, cam, t, o = {}) {
  layer(c, cam, .5, c => {
    // back wall: dark wood panelling + wallpaper
    c.fillStyle = '#3a1f18'; c.fillRect(-1800, -3000, 3600, 4400);
    for (let x = -1800; x < 1800; x += 120) { c.fillStyle = 'rgba(255,190,120,.05)'; c.fillRect(x, -3000, 60, 4400); }
    // paintings
    for (let i = 0; i < 4; i++) { const px = -1100 + i * 600, py = -1400 + (i % 2) * 120; c.beginPath(); c.rect(px, py, 280, 360); fs(c, '#c9a04a', 10); c.fillStyle = ['#2f5a6a', '#6a3a2a', '#3a5a2a', '#5a2a4a'][i]; c.fillRect(px + 20, py + 20, 240, 320); c.fillStyle = 'rgba(255,220,150,.25)'; c.beginPath(); c.arc(px + 140, py + 150, 60, 0, Math.PI * 2); c.fill(); glowAt(c, px + 140, py - 30, 260, '255,200,120', .3); }
    // bar with glowing bottles
    c.beginPath(); c.rect(-1500, -600, 1300, 60); fs(c, '#5a3420', 5); c.beginPath(); c.rect(-1500, -350, 1300, 60); fs(c, '#5a3420', 5);
    for (let i = 0; i < 16; i++) { bottle(c, -1450 + i * 80, -600, .55, ['#2f5a3a', '#7a3a1a', '#c9a04a', '#3a3a6a'][i % 4]); bottle(c, -1440 + i * 80, -350, .55, ['#c9a04a', '#2f5a3a', '#6a1a2a'][i % 3]); }
    glowAt(c, -850, -500, 700, '255,170,80', .35);
    c.beginPath(); c.rect(-1600, -200, 1450, 500); fs(c, '#4a2a18', 7);
    c.beginPath(); c.rect(-1650, -230, 1550, 50); fs(c, '#7a4a2a', 6);
  }, 3);
  // background tables with guests (p .7)
  layer(c, cam, .72, c => {
    const g = c.createLinearGradient(0, 300, 0, 2000); g.addColorStop(0, '#4a2a1a'); g.addColorStop(1, '#1f120c'); c.fillStyle = g; c.fillRect(-2400, 300, 4800, 2400);
    for (let i = -12; i < 12; i++) line(c, [i * 140, 300, i * 260, 2000], 4, 'rgba(0,0,0,.25)');
    const guests = [{ skin: '#f0c8a8', hair: { style: 'long', col: '#8a4a2a' }, top: '#3a6a8a' }, { skin: '#8a5a3a', hair: { style: 'short', col: '#1a1410' }, top: '#a03a3a' }, { skin: '#e8b48a', hair: { style: 'bun', col: '#2a1a10' }, top: '#d9a03a' }, { skin: '#c99a6a', hair: { style: 'bald', col: '#3a2a20' }, top: '#2a3a5a', glasses: true }];
    for (let i = 0; i < 3; i++) {
      const tx = -900 + i * 900, ty = 380;
      person(c, Object.assign({ x: tx - 170, y: ty + 280, k: .32, sit: true, noLegs: true, arms: { l: { a: .3, b: -1.2 }, r: { a: .4 + Math.sin(t * 2 + i) * .1, b: -1.3 } }, expr: { mouth: i % 2 ? 'grin' : 'smile', look: .6 } }, guests[i % 4]));
      person(c, Object.assign({ x: tx + 170, y: ty + 280, k: .32, sit: true, noLegs: true, arms: { l: { a: .4, b: -1.2 }, r: { a: .3, b: -1.1 } }, expr: { mouth: 'smile', look: -.6 }, bob: Math.sin(t * 3 + i) * 10 }, guests[(i + 1) % 4]));
      table(c, tx, ty, 420, 1, {}); candle(c, tx, ty - 4, 1, t, .8, i); wineGlass(c, tx - 90, ty, .6, .5); wineGlass(c, tx + 90, ty, .6, .4); plate(c, tx - 120, ty + 4, .7); plate(c, tx + 120, ty + 4, .7);
    }
    // waiter walking in background
    const wx = -1400 + ((t * 180) % 2800);
    person(c, { x: wx, y: 820, k: .4, skin: '#9a6544', hair: { style: 'curly', col: '#1a1410' }, top: '#f4f2ea', sleeve: 'long', vest: '#1f1f24', bowtie: '#a02030', bottom: '#1f1f24', arms: { l: { a: .1, b: 0 }, r: { a: 1.2, b: -1.3 } }, legs: [Math.max(0, Math.sin(t * 8)) * 40, Math.max(0, -Math.sin(t * 8)) * 40], bob: -Math.abs(Math.sin(t * 8)) * 10, expr: { mouth: 'smile' } });
    tray(c, wx + 140, 820 - 1050 * .4 + 120, .6);
  });
  haze(c, '120,60,30', .12);
}
// a table in the mid plane (p .9) that can be dark & empty
function m5Table(c, cam, t, x, y, o = {}) {
  layer(c, cam, o.p ?? .9, c => {
    if (!o.empty) { /* chairs with guests drawn by caller */ }
    chair(c, x - 260, y + 330, .9, '#5a341e'); chair(c, x + 260, y + 330, .9, '#5a341e');
    table(c, x, y, o.w || 460, 1, { cloth: o.empty ? '#bdb4a8' : '#f3eee4' });
    candle(c, x, y - 4, o.empty ? 0 : 1, t, 1, x);
    if (o.smoke) smokeWisp(c, x, y - 100, t, 1.2, o.smoke, x);
    wineGlass(c, x - 120, y, .7, o.empty ? 0 : .5); wineGlass(c, x + 120, y, .7, o.empty ? 0 : .4);
    plate(c, x - 140, y + 6, .8); plate(c, x + 140, y + 6, .8);
    if (o.empty) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(40,50,90,.55)'; c.fillRect(x - 400, y - 600, 800, 1000); c.restore(); }
  }, o.blur || 0);
}
function m5Lamps(c, cam, t, o = {}) {
  layer(c, cam, .8, c => { for (let i = 0; i < 9; i++) edison(c, -1200 + i * 300, -2400, 1100 + (i % 3) * 260 + rnd(i) * 100, t, o.on ?? 1, i, 1.1); });
}
function m5Light(c, cam, t, o = {}) {
  if (o.spot) { const [x, y] = toScreen(cam, 1, o.spot[0], o.spot[1]); beam(c, x, -100, x, y + 200, 160, 700, '255,215,150', .3, t); glow(c, x, y, 520, '255,200,120', .35); }
  dust(c, 0, W, 0, 1900, t, { n: 50, color: '255,210,150', alpha: .45, speed: .015 });
  gradeFrame(c, { sx: o.sx ?? .5, sy: o.sy ?? .55, warm: '255,150,60', warmA: .4, wr: .7, cool: '15,10,40', coolA: .6, vig: .7 });
}

// =================== M6: RAINY NIGHT STREET (perspective) ===================
// pinhole: world X (right), Y (up, cm), Z (depth, cm); eye height EYE; horizon at set y HZ
const M6 = { f: 700, EYE: 200, HZ: -350 };
function pj(X, Y, Z) { return [X * M6.f / Z, M6.HZ - (Y - M6.EYE) * M6.f / Z]; }
function quad(c, a, b, cc, d, fill, w = 3) { c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.lineTo(...cc); c.lineTo(...d); c.closePath(); fs(c, fill, w); }
// shop on a side wall: side -1 left, +1 right; z0..z1 depth; o: { sign, col, on, closed, seed }
function sideShop(c, side, z0, z1, o, t) {
  const X = side * 420, H = 380;
  const p = (z, y) => pj(X, y, z);
  quad(c, p(z0, 0), p(z1, 0), p(z1, 900), p(z0, 900), o.wall || (side < 0 ? '#3a2a3a' : '#2a2e44'), 2);
  // shop window
  const lit = o.on ?? 1;
  quad(c, p(z0 + 40, 30), p(z1 - 40, 30), p(z1 - 40, 260), p(z0 + 40, 260), lit > .1 ? `rgba(255,${170 + 40 * lit},${90 + 40 * lit},${.35 + .55 * lit})` : '#141822', 3);
  if (lit > .1) { const [mx, my] = p((z0 + z1) / 2, 150); glowAt(c, mx, my, 400 * M6.f / ((z0 + z1) / 2) * .6, '255,170,90', .3 * lit); }
  // upper windows
  for (let i = 0; i < 2; i++) { const za = z0 + (z1 - z0) * (.15 + i * .45), zb = za + (z1 - z0) * .3; quad(c, p(za, 450), p(zb, 450), p(zb, 620), p(za, 620), rnd(o.seed + i) > .5 ? 'rgba(255,200,120,.7)' : '#161a2c', 2); }
  // awning
  quad(c, p(z0, 300), p(z1, 300), pj(X - side * 80, 250, z1), pj(X - side * 80, 250, z0), o.col2 || '#7a2a3a', 2);
  // perpendicular neon sign
  const zs = z0 + (z1 - z0) * .25, [sx, sy] = pj(X - side * 70, 370, zs), sc = M6.f / zs;
  c.save(); c.translate(sx, sy); c.scale(sc, sc);
  c.beginPath(); rrect(c, -95, -32, 190, 64, 10); fs(c, '#151216', 3);
  const flick = o.flick != null ? o.flick : 1;
  neonText(c, o.sign, 0, 0, 34, o.col || '120,220,255', lit * flick, { font: `italic 800 34px ${FONT()}` });
  if (lit * flick > .05) glowAt(c, 0, 0, 260, o.col || '120,220,255', .35 * lit * flick);
  c.restore();
  if (o.closed > 0) { const [gx, gy] = p((z0 + z1) / 2, 140), s2 = M6.f / ((z0 + z1) / 2); c.save(); c.translate(gx, gy); c.scale(s2 * .8, s2 * .8); c.rotate(-.05 + Math.sin(t * 3) * .04 * (1 - clamp(o.closed))); c.globalAlpha = clamp(o.closed * 2); line(c, [-60, -70, 0, -110, 60, -70], 3, '#ddd'); c.beginPath(); rrect(c, -110, -70, 220, 70, 8); fs(c, '#f2ecdc', 4); txt(c, 'Geschlossen', 0, -24, 30, '#b02a2a'); c.restore(); }
  return { reflect: [sx, sy, sc, o.col, lit * flick, pj(X, 0, zs)[1]] };
}
function m6Back(c, cam, t, o = {}) {
  const shopsL = o.shopsL || [{ sign: 'Bistro', col: '255,90,150' }, { sign: 'Pizzeria', col: '120,220,255' }, { sign: 'Café', col: '255,210,90' }, { sign: 'Grill', col: '160,255,140' }, { sign: 'Imbiss', col: '255,140,60' }];
  const shopsR = o.shopsR || [{ sign: 'Trattoria', col: '255,210,90' }, { sign: 'Bäckerei', col: '255,90,150' }, { sign: 'Bar', col: '120,220,255' }, { sign: 'Sushi', col: '255,120,90' }, { sign: 'Döner', col: '160,255,140' }];
  const refl = [];
  layer(c, cam, .6, c => {
    sky(c, cam, [[0, '#05060f'], [.6, '#141a36'], [1, '#2a2440']], -3000, -4000, 3000, 0);
    // far buildings at the end of the street
    for (let i = 0; i < 9; i++) { const x = -700 + i * 160, h = 300 + rnd(i + 2) * 500; c.fillStyle = '#161a30'; c.fillRect(x, M6.HZ - h, 150, h + 10); for (let r = 0; r < 8; r++) if (rnd(i * 9 + r) > .5) { c.fillStyle = 'rgba(255,200,120,.6)'; c.fillRect(x + 20 + (r % 2) * 60, M6.HZ - h + 30 + r * 40, 30, 20); } }
    glowAt(c, 0, M6.HZ, 700, '255,150,120', .25);
  });
  layer(c, cam, .85, c => {
    // road + sidewalks
    const road = (x0, x1, col) => quad(c, pj(x0, 0, 60), pj(x1, 0, 60), pj(x1, 0, 9000), pj(x0, 0, 9000), col, 0);
    road(-420, 420, '#1a1c26'); road(-420, -260, '#262836'); road(260, 420, '#262836');
    for (let z = 200; z < 6000; z *= 1.35) { const a = pj(-12, 0, z), b = pj(12, 0, z), d = pj(12, 0, z * 1.12), e = pj(-12, 0, z * 1.12); quad(c, a, b, d, e, 'rgba(230,220,180,.6)', 0); }
    // shops, far to near
    for (let i = shopsL.length - 1; i >= 0; i--) { const z0 = 300 + i * 520, z1 = z0 + 500; refl.push(sideShop(c, -1, z0, z1, Object.assign({ seed: i, col2: ['#7a2a3a', '#2a5a6a', '#6a5a2a'][i % 3] }, shopsL[i]), t).reflect); refl.push(sideShop(c, 1, z0 + 200, z1 + 200, Object.assign({ seed: i + 20, col2: ['#2a5a3a', '#6a2a5a', '#2a3a6a'][i % 3] }, shopsR[i]), t).reflect); }
    // street lamps
    for (let i = 0; i < 5; i++) { const z = 280 + i * 700, [x0, y0] = pj(300, 0, z), [x1, y1] = pj(300, 520, z), s = M6.f / z; line(c, [x0, y0, x1, y1], 10 * s, '#1f2430'); glowAt(c, x1 - 30 * s, y1, 220 * s, '255,190,110', .7); glowAt(c, x1 - 30 * s, y1, 30 * s, '255,240,210', 1); }
    // wet reflections on the road (mirror the signs, smeared)
    c.save(); c.globalCompositeOperation = 'screen'; c.filter = 'blur(18px)';
    for (const [sx, sy, sc, col, a, gy0] of refl) { if (a < .05) continue; const gy = 2 * gy0 - sy; const g = c.createLinearGradient(0, gy - 40 * sc, 0, gy + 300 * sc); g.addColorStop(0, `rgba(${col || '120,220,255'},${.35 * a})`); g.addColorStop(1, `rgba(${col || '120,220,255'},0)`); c.fillStyle = g; c.beginPath(); c.ellipse(sx, gy + 110 * sc, 50 * sc, 190 * sc, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
    // passing car headlights
    const cz = 4000 - ((t * 1800 + (o.carSeed || 0)) % 3800); if (cz > 120) { const [hx, hy] = pj(-150, 50, cz), s = M6.f / cz; glowAt(c, hx, hy, 160 * s + 20, '255,240,200', .9); glowAt(c, hx + 160 * s, hy, 160 * s + 20, '255,240,200', .9); c.save(); c.globalCompositeOperation = 'screen'; c.filter = 'blur(8px)'; c.fillStyle = 'rgba(255,240,200,.25)'; c.fillRect(hx - 40 * s, hy, 260 * s, 600 * s); c.restore(); }
    // pedestrians with umbrellas
    for (let i = 0; i < 3; i++) { const z = 600 + ((t * 60 + i * 900) % 2400), x = (i % 2 ? 330 : -330), [px, py] = pj(x, 0, z), s = M6.f / z; const kk = 165 * s / 1500; person(c, { x: px, y: py, k: kk, skin: ['#e8b48a', '#8a5a3a', '#f0c8a8'][i], hair: { style: ['bun', 'short', 'curly'][i], col: '#2a1a10' }, top: ['#5a6a3a', '#3a3a5a', '#7a3a2a'][i], sleeve: 'long', arms: { l: { a: .1, b: 0 }, r: { a: .6, b: -1.6 } }, legs: [Math.max(0, Math.sin(t * 7 + i)) * 40, Math.max(0, -Math.sin(t * 7 + i)) * 40], expr: { mouth: 'flat' } }); c.save(); c.translate(px + 60 * kk, py - 1620 * kk); line(c, [0, 0, 0, 260 * kk], 4, OUT); c.beginPath(); c.arc(0, 0, 420 * kk, Math.PI, 0); c.closePath(); fs(c, ['#c0392b', '#2f6fb0', '#e0a43a'][i], 2); c.restore(); }
  });
  splashesScreen(c, cam, t);
}
function splashesScreen(c, cam, t) { layer(c, cam, 1, c => splashes(c, -700, 700, 700, 1300, t, 50)); }
function m6Ground(c, cam, t, o = {}) {
  layer(c, cam, 1, c => {
    // near sidewalk where Noah stands, wet with puddle
    const g = c.createLinearGradient(0, 650, 0, 1400); g.addColorStop(0, 'rgba(30,32,46,.0)'); g.addColorStop(.25, '#1c1e2a'); g.addColorStop(1, '#0d0e16'); c.fillStyle = g; c.fillRect(-1400, 650, 2800, 900);
    c.save(); c.globalCompositeOperation = 'screen'; c.beginPath(); c.ellipse(80, 960, 420, 70, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(120,140,200,.18)'; c.fill(); c.restore();
  });
}
function m6Light(c, cam, t, o = {}) {
  rain(c, t, { n: 260, a: .45 });
  gradeFrame(c, { sx: .5, sy: .3, warm: '255,110,170', warmA: .25, cool: '5,10,40', coolA: .6, vig: .7, tint: '40,70,160', tintA: .22 });
}
