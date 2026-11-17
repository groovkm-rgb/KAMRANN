// ICE-AGE STEPPE, FOREST EDGE, NIGHT SKY, CAMP EXTERIOR (world: ground y = 0, 1 m ≈ 220, horizon HZ = -60).
// steppeSet(c, cam, t, { tod: 'morning'|'day'|'dusk'|'night', hill: worldX|null, snow: 0..1 }) ; steppeFront(c, cam, t, o) in `front` or `screen`
// forestEdge(c, cam, t, o) ; nightSky(c, t, o) (screen space) ; campSet(c, cam, t, o) (rock shelter seen from outside)
const ST = {
  morning: { sky: ['#5e7896', '#a9bdd0', '#e8d6c4'], sun: '255,225,190', far: '#8a9cb4', farSnow: '#e6eef6', hill: '#9c9a80', hill2: '#b1a57a', ground: '#b49c62', ground2: '#8f7a48', grass: ['#c9b47a', '#a8925a', '#e0cc94'], haze: '200,214,230', snow: '#eef3f8' },
  day:     { sky: ['#6f9ccc', '#a8c8e2', '#e6e8de'], sun: '255,245,220', far: '#94a8bc', farSnow: '#f2f6fa', hill: '#b4a46a', hill2: '#c6b278', ground: '#c4aa66', ground2: '#9c8448', grass: ['#d8c27e', '#b49a58', '#ecd89a'], haze: '214,224,232', snow: '#f4f6f8' },
  dusk:    { sky: ['#3a3e66', '#b06a62', '#f0aa66'], sun: '255,170,90', far: '#6a5a72', farSnow: '#e8b8a0', hill: '#7a6450', hill2: '#9a7650', ground: '#8a6a40', ground2: '#5e4628', grass: ['#c08a4a', '#8a6232', '#e0a860'], haze: '230,150,110', snow: '#f0c8b0' },
  night:   { sky: ['#060a18', '#0e1830', '#1c2a48'], sun: '170,190,230', far: '#1a2236', farSnow: '#4a5a78', hill: '#1e2430', hill2: '#262c38', ground: '#22262e', ground2: '#16181e', grass: ['#3a3e46', '#2a2e36', '#4a505a'], haze: '40,50,80', snow: '#5a6a86' },
};
const SHZ = -60;
function steppeSet(c, cam, t, o = {}) {
  const P = ST[o.tod || 'day'], B = p => layerBase(cam, SHZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, H * .75); g.addColorStop(0, P.sky[0]); g.addColorStop(.6, P.sky[1]); g.addColorStop(1, P.sky[2]); c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (o.tod === 'night') { if (!_skyReady) bakeSky(); c.drawImage(_sky, 0, -(cam.y + 400) * .05); }
  if (o.tod !== 'night') { const sx = W * (o.sunX ?? .78), sy = H * (o.sunY ?? (o.tod === 'dusk' ? .52 : o.tod === 'morning' ? .42 : .12)); bloom(c, sx, sy, 520, P.sun, .7); circle(c, sx, sy, 34); c.fillStyle = `rgba(${P.sun},.95)`; c.fill(); }
  // thin clouds
  layer(c, cam, .05, c => { for (let i = 0; i < 7; i++) { const x = -1800 + i * 620 + ((t * 6 + i * 90) % 400), y = -900 + rnd(i + 3) * 300; ell(c, x, y, 260 + rnd(i) * 200, 22 + rnd(i + 1) * 16); c.fillStyle = o.tod === 'night' ? 'rgba(60,70,100,.25)' : o.tod === 'dusk' ? 'rgba(255,190,150,.35)' : 'rgba(255,255,255,.35)'; c.fill(); } });
  // far glacier / mountains
  layer(c, cam, .12, c => { const b = B(.12);
    c.beginPath(); c.moveTo(-6000, b); for (let i = 0; i <= 60; i++) { const x = -6000 + i * 200; c.lineTo(x, b - 120 - Math.abs(Math.sin(i * .7)) * 190 - rnd(i + 11) * 90 - (i % 7 === 3 ? 140 : 0)); } c.lineTo(6000, b); c.closePath(); c.fillStyle = P.far; c.fill();
    // ice sheet with blue crevasse shading
    c.beginPath(); c.moveTo(-6000, b - 40); for (let i = 0; i <= 40; i++) { const x = -6000 + i * 300; c.lineTo(x, b - 90 - Math.sin(i * .5) * 30 - rnd(i + 31) * 20); } c.lineTo(6000, b); c.lineTo(-6000, b); c.closePath(); c.fillStyle = P.farSnow; c.fill();
    for (let i = 0; i < 40; i++) { const x = -6000 + rnd(i + 50) * 12000; line(c, [x, b - 70, x + 30, b - 20], 3, o.tod === 'night' ? 'rgba(80,100,140,.4)' : 'rgba(140,170,210,.5)'); }
  });
  haze(c, P.haze, .32);
  layer(c, cam, .3, c => { const b = B(.3); c.beginPath(); c.moveTo(-6000, b + 10); for (let i = 0; i <= 60; i++) { const x = -6000 + i * 200; c.lineTo(x, b - 40 - Math.sin(i * .35 + 1) * 50 - rnd(i + 70) * 20); } c.lineTo(6000, b + 400); c.lineTo(-6000, b + 400); c.closePath(); c.fillStyle = P.hill; c.fill();
    for (let i = 0; i < 30; i++) { ell(c, -5000 + rnd(i + 80) * 10000, b - 10 + rnd(i + 81) * 40, 60 + rnd(i) * 140, 8); c.fillStyle = P.snow; c.globalAlpha = .7 * (o.snow ?? 1); c.fill(); c.globalAlpha = 1; } });
  haze(c, P.haze, .18);
  // mid hills (the mammoth hill)
  layer(c, cam, .6, c => { const b = B(.6);
    c.beginPath(); c.moveTo(-6000, b + 10); for (let i = 0; i <= 80; i++) { const x = -6000 + i * 150; let y = b - 20 - Math.sin(i * .21) * 40; if (o.hill != null) y -= 260 * Math.exp(-(((x - o.hill * .6) / 700) ** 2)); c.lineTo(x, y); } c.lineTo(6000, b + 600); c.lineTo(-6000, b + 600); c.closePath();
    const gg = c.createLinearGradient(0, b - 300, 0, b + 100); gg.addColorStop(0, P.hill2); gg.addColorStop(1, P.ground2); c.fillStyle = gg; c.fill();
    for (let i = 0; i < 60; i++) { const x = -5000 + rnd(i + 90) * 10000; line(c, [x, b - 10, x + 4, b - 30], 3, P.grass[1]); }
    // low shrubs on the hills
    for (let i = 0; i < 26; i++) { const x = -5000 + rnd(i + 120) * 10000; ell(c, x, b - 14, 40 + rnd(i) * 30, 18); c.fillStyle = shade(P.ground2, -.25); c.fill(); }
  });
  haze(c, P.haze, .08);
  // ground
  layer(c, cam, 1, c => {
    const gg = c.createLinearGradient(0, SHZ, 0, SHZ + 900); gg.addColorStop(0, P.ground); gg.addColorStop(1, P.ground2); c.fillStyle = gg; c.fillRect(-8000, SHZ, 16000, 4000);
    for (let i = 0; i < 40; i++) { const k = rnd(i + 200), x0 = -4000 + rnd(i + 210) * 8000, y0 = SHZ + 20 + k * k * 700; c.globalAlpha = .35 * (o.snow ?? 1); c.fillStyle = P.snow; for (let j = 0; j < 4; j++) { ell(c, x0 + (rnd(i * 4 + j) - .5) * (120 + k * 300), y0 + (rnd(i * 4 + j + 1) - .5) * (6 + k * 20), 30 + k * 120 * rnd(i + j + 7), 4 + k * 14, (rnd(i + j) - .5) * .1); c.fill(); } c.globalAlpha = 1; }
    // grass tufts (waving)
    for (let i = 0; i < 520; i++) { const k = rnd(i + 300), x = -4000 + rnd(i + 310) * 8000, y = SHZ + 6 + k * k * 800, h = 10 + k * 46, sw = Math.sin(t * 1.6 + x * .004) * h * .25;
      for (let j = -1; j <= 1; j++) line(c, [x + j * 4, y, x + j * 8 + sw, y - h * (1 - Math.abs(j) * .25)], 1.5 + k * 2.5, P.grass[(i + j + 3) % 3]); }
    for (let i = 0; i < 18; i++) { const x = -3500 + rnd(i + 400) * 7000, y = SHZ + 40 + rnd(i + 401) * 500; rock(c, x, y, 14 + rnd(i) * 22, i, o.tod === 'night' ? '#3a3e48' : '#8a8478'); }
    for (let i = 0; i < 12; i++) { const x = -3500 + rnd(i + 430) * 7000, y = SHZ + 30 + rnd(i + 431) * 400; for (let j = 0; j < 7; j++) line(c, [x, y, x + (j - 3) * 14, y - 40 - rnd(j + i) * 30], 3, o.tod === 'night' ? '#2a2c30' : '#6a5a3a'); }
  });
  return { base: P.ground };
}
function steppeFront(c, cam, t, o = {}) {
  // foreground grass that sways (parallax 1.4), drawn over characters' feet
  const P = ST[o.tod || 'day'];
  layer(c, cam, 1.4, c => { const b = layerBase(cam, SHZ, 1.4) + (o.dy ?? 260);
    for (let i = 0; i < 90; i++) { const x = cam.x * 1.4 - 1600 + i * 36 + rnd(i) * 20, h = 60 + rnd(i + 5) * 110, sw = Math.sin(t * 1.8 + i * .7) * 18; line(c, [x, b, x + sw, b - h], 5, shade(P.grass[i % 3], -.35)); }
  });
}
// ---------- forest edge (late-glacial birch / pine, moss, blueberries, mushrooms, god rays) ----------
function birch(c, x, base, h, seed) {
  c.beginPath(); c.moveTo(x - 16, base); c.quadraticCurveTo(x - 12 + (rnd(seed) - .5) * 20, base - h * .5, x - 6, base - h); c.lineTo(x + 6, base - h); c.quadraticCurveTo(x + 12, base - h * .5, x + 16, base); c.closePath(); c.fillStyle = '#ece6da'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#3a3430'; c.stroke();
  for (let i = 0; i < 9; i++) { const y = base - rnd(seed + i) * h; line(c, [x - 12, y, x + 2, y + 4], 4, '#2a2622'); }
  for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + (rnd(seed + i + 20) - .5) * 2.4, r = 40 + rnd(seed + i + 40) * 100, px = x + Math.cos(a) * r * .8, py = base - h + 60 + Math.sin(a) * r * .9; ell(c, px, py, 40 + rnd(i) * 20, 26 + rnd(i + 1) * 14); c.fillStyle = ['#c9b04a', '#a8a040', '#d8c060', '#8a9a3a'][i % 4]; c.fill(); }
}
function pine(c, x, base, h, seed, col = '#2f4a38') {
  line(c, [x, base, x, base - h], 14, '#4a3626');
  for (let i = 0; i < 7; i++) { const y = base - h * .25 - i * h * .11, w = (7 - i) * h * .045 + 20; c.beginPath(); c.moveTo(x - w, y + 20); c.quadraticCurveTo(x, y - 34, x + w, y + 20); c.quadraticCurveTo(x, y + 4, x - w, y + 20); c.fillStyle = shade(col, (i % 2) * .1); c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(10,20,15,.5)'; c.stroke(); }
}
function forestEdge(c, cam, t, o = {}) {
  const B = p => layerBase(cam, SHZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H * .7); g.addColorStop(0, '#8eaac4'); g.addColorStop(1, '#e2e6e0'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  bloom(c, W * .82, H * .14, 600, '255,240,210', .7);
  layer(c, cam, .2, c => { const b = B(.2); c.beginPath(); c.moveTo(-6000, b); for (let i = 0; i <= 60; i++) c.lineTo(-6000 + i * 200, b - 100 - Math.abs(Math.sin(i * .6)) * 160); c.lineTo(6000, b); c.closePath(); c.fillStyle = '#9aaabb'; c.fill(); });
  haze(c, '215,225,232', .3);
  layer(c, cam, .45, c => { const b = B(.45); for (let i = 0; i < 40; i++) { const x = -4000 + i * 200 + rnd(i) * 80; pine(c, x, b + 10, 260 + rnd(i + 5) * 160, i, '#4a6a5a'); } c.fillStyle = '#7a8a6a'; c.fillRect(-6000, b, 12000, 600); });
  haze(c, '215,225,232', .22);
  layer(c, cam, .75, c => { const b = B(.75); c.fillStyle = '#6a7a4e'; c.fillRect(-6000, b - 10, 12000, 800);
    for (let i = 0; i < 26; i++) { const x = -3500 + i * 280 + rnd(i + 9) * 120; if (rnd(i + 3) > .45) birch(c, x, b + 10, 520 + rnd(i) * 220, i); else pine(c, x, b + 10, 600 + rnd(i) * 200, i + 40, '#2f4a38'); } });
  layer(c, cam, 1, c => {
    const gg = c.createLinearGradient(0, SHZ, 0, SHZ + 700); gg.addColorStop(0, '#6e7a48'); gg.addColorStop(1, '#4a5232'); c.fillStyle = gg; c.fillRect(-8000, SHZ, 16000, 3000);
    for (let i = 0; i < 260; i++) { const k = rnd(i + 500), x = -4000 + rnd(i + 510) * 8000, y = SHZ + 8 + k * k * 700, h = 10 + k * 30, sw = Math.sin(t * 1.5 + x * .01) * 5; line(c, [x, y, x + sw, y - h], 2 + k * 2, ['#8a9a5a', '#6a7a3e', '#a8a868'][i % 3]); }
    for (let i = 0; i < 40; i++) { const x = -3500 + rnd(i + 600) * 7000, y = SHZ + 30 + rnd(i + 601) * 600; ell(c, x, y, 30 + rnd(i) * 30, 8 + rnd(i) * 6); c.fillStyle = '#e8e8ea'; c.globalAlpha = .55; c.fill(); c.globalAlpha = 1; }
    // mossy rocks, fallen branches
    for (let i = 0; i < 10; i++) { const x = -3000 + rnd(i + 620) * 6000, y = SHZ + 80 + rnd(i + 621) * 300; rock(c, x, y, 30 + rnd(i) * 30, i + 9, '#7a7a74'); ell(c, x - 10, y - 30 - rnd(i) * 10, 30, 10); c.fillStyle = '#6a8a3a'; c.fill(); }
    for (let i = 0; i < 8; i++) { const x = -3000 + rnd(i + 640) * 6000, y = SHZ + 60 + rnd(i + 641) * 400; line(c, [x, y, x + 160, y - 20], 12, '#3a2c20'); line(c, [x, y, x + 160, y - 20], 7, '#6a5038'); line(c, [x + 60, y - 8, x + 90, y - 40], 5, '#6a5038'); }
  });
  return { base: '#6e7a48' };
}
function blueberryBush(c, x, y, s = 1, picked = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i / 13 - .5) * 2.6, L = 50 + rnd(i) * 30; line(c, [0, 0, Math.cos(a) * L, Math.sin(a) * L], 4, '#4a3a2a'); ell(c, Math.cos(a) * L, Math.sin(a) * L, 12, 7, a); c.fillStyle = '#4a7a3a'; c.fill(); }
  for (let i = 0; i < 10; i++) { if (i < picked * 10) continue; circle(c, -40 + rnd(i + 5) * 80, -60 + rnd(i + 6) * 50, 6); c.fillStyle = '#2e3a7a'; c.fill(); circle(c, -42 + rnd(i + 5) * 80, -62 + rnd(i + 6) * 50, 2); c.fillStyle = 'rgba(200,210,255,.7)'; c.fill(); }
  c.restore();
}
function mushroom(c, x, y, s = 1, red = true) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -9, -50, 18, 50, 6); c.fillStyle = '#f2ecdc'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#3a2a22'; c.stroke();
  c.beginPath(); c.ellipse(0, -50, 42, 28, 0, Math.PI, 0); c.closePath(); c.fillStyle = red ? '#d23a2a' : '#a8784a'; c.fill(); c.stroke();
  if (red) for (const [dx, dy] of [[-20, -60], [4, -70], [22, -58], [-6, -56]]) { circle(c, dx, dy, 5); c.fillStyle = '#fff6ea'; c.fill(); }
  c.restore();
}
// ---------- night sky (screen space): dense stars, bright milky way, thin moon ----------
const _sky = document.createElement('canvas'); _sky.width = 1920; _sky.height = 1080; let _skyReady = false;
function bakeSky() {
  const c = _sky.getContext('2d'), g = c.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, '#03050e'); g.addColorStop(.7, '#0b1430'); g.addColorStop(1, '#1a2848'); c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
  // milky way band (diagonal)
  c.save(); c.translate(960, 480); c.rotate(-.42);
  for (let i = 0; i < 2600; i++) { const x = (rnd(i + 1) - .5) * 2600, sp = Math.exp(-((x / 1100) ** 2)), y = (rnd(i + 2) + rnd(i + 3) + rnd(i + 4) - 1.5) * 180 * (1 + sp * .4); const r = 60 + rnd(i + 5) * 120; const gg = c.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, `rgba(${180 + rnd(i) * 60 | 0},${180 + rnd(i + 9) * 50 | 0},230,${.018 * sp})`); gg.addColorStop(1, 'rgba(180,180,230,0)'); c.fillStyle = gg; c.fillRect(x - r, y - r, r * 2, r * 2); }
  c.filter = 'blur(6px)'; for (let i = 0; i < 260; i++) { const x = (rnd(i + 70) - .5) * 2400, y = (rnd(i + 71) - .5) * 70; ell(c, x, y, 40 + rnd(i) * 90, 6 + rnd(i + 1) * 12, rnd(i + 2)); c.fillStyle = 'rgba(10,12,24,.07)'; c.fill(); }
  c.filter = 'none';
  for (let i = 0; i < 3500; i++) { const x = (rnd(i + 300) - .5) * 2600, y = (rnd(i + 301) + rnd(i + 302) - 1) * 260; c.fillStyle = `rgba(255,255,255,${.25 + rnd(i) * .5})`; c.fillRect(x, y, 1.4, 1.4); }
  c.restore();
  for (let i = 0; i < 2600; i++) { const x = rnd(i + 900) * 1920, y = rnd(i + 901) * 1080, r = rnd(i + 902) ** 6 * 2.4 + .5; circle(c, x, y, r); c.fillStyle = `rgba(${230 + rnd(i) * 25 | 0},${230 + rnd(i + 1) * 25 | 0},255,${.35 + rnd(i + 3) * .65})`; c.fill(); }
  _skyReady = true;
}
function nightSky(c, t, o = {}) {
  if (!_skyReady) bakeSky();
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = o.a ?? 1;
  const dx = o.dx || 0, dy = o.dy || 0, z = o.z || 1;
  c.translate(W / 2 + dx, H / 2 + dy); c.scale(z, z); c.drawImage(_sky, -960, -540);
  // twinkle: a few bright stars
  for (let i = 0; i < 70; i++) { const x = rnd(i + 1200) * 1920 - 960, y = rnd(i + 1201) * 1080 - 540, a = .5 + .5 * Math.sin(t * (2 + rnd(i) * 3) + i); bloom(c, x, y, 10, '220,230,255', .5 * a); circle(c, x, y, 1.6); c.fillStyle = `rgba(255,255,255,${.6 + .4 * a})`; c.fill(); }
  // thin crescent moon
  if (o.moon !== false) { const mx = 620, my = -330; bloom(c, mx, my, 180, '200,215,255', .35); c.beginPath(); c.arc(mx, my, 34, -2.1, 1.6); c.arc(mx + 16, my - 8, 32, 1.75, -2.2, true); c.closePath(); c.fillStyle = '#eef2ff'; c.fill(); }
  c.restore();
}
// ---------- camp outside the rock shelter (overhang, hides on stakes, drying meat, bone pile, firewood, skin tents) ----------
function hideOnStakes(c, x, s = 1) { c.save(); c.translate(x, 0); c.scale(s, s); line(c, [-110, 0, -100, -330], 10, '#4a3220'); line(c, [110, 0, 100, -330], 10, '#4a3220'); line(c, [-120, -320, 120, -320], 9, '#4a3220');
  c.beginPath(); c.moveTo(-90, -310); c.lineTo(90, -310); c.quadraticCurveTo(110, -190, 80, -80); c.lineTo(-80, -80); c.quadraticCurveTo(-110, -190, -90, -310); c.closePath(); const g = c.createLinearGradient(-90, 0, 90, 0); g.addColorStop(0, '#9a7650'); g.addColorStop(.5, '#d0ae80'); g.addColorStop(1, '#8a6642'); c.fillStyle = g; c.fill(); c.lineWidth = 3; c.strokeStyle = '#3a2618'; c.stroke();
  for (let i = 0; i < 5; i++) line(c, [-90 + i * 45, -310, -96 + i * 48, -322], 2, '#2a1a10'); c.restore(); }
function meatRack(c, x) { line(c, [x - 120, 0, x - 120, -260], 9, '#4a3220'); line(c, [x + 120, 0, x + 120, -260], 9, '#4a3220'); line(c, [x - 130, -250, x + 130, -250], 7, '#4a3220'); for (let i = 0; i < 7; i++) { const px = x - 100 + i * 33; line(c, [px, -248, px + 3, -150 - rnd(i) * 40], 12, '#6a2a1e'); line(c, [px, -248, px + 3, -150 - rnd(i) * 40], 5, '#8a3a2a'); } }
function skinTent(c, x, s = 1) { c.save(); c.translate(x, 0); c.scale(s, s); c.beginPath(); c.moveTo(-220, 0); c.lineTo(0, -380); c.lineTo(220, 0); c.closePath(); const g = c.createLinearGradient(-220, 0, 220, 0); g.addColorStop(0, '#8a6a4a'); g.addColorStop(.5, '#b8946a'); g.addColorStop(1, '#6e5238'); c.fillStyle = g; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2e2014'; c.stroke();
  for (let i = 0; i < 4; i++) { c.save(); c.setLineDash([10, 8]); line(c, [-40 + i * 30, -300 + i * 20, -160 + i * 60, -10], 2, '#5a4028'); c.restore(); }
  c.beginPath(); c.moveTo(-50, 0); c.lineTo(0, -150); c.lineTo(50, 0); c.closePath(); c.fillStyle = '#2a1e14'; c.fill(); for (const d of [-30, 0, 30]) line(c, [d * .3, -380, d, -460], 6, '#4a3220'); c.restore(); }
function woodPile(c, x) { for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) { c.save(); c.translate(x - 90 + i * 60 + r * 30, -16 - r * 30); ell(c, 0, 0, 30, 16); c.fillStyle = '#6a4a30'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a1a10'; c.stroke(); ell(c, 0, 0, 16, 9); c.fillStyle = '#c8a070'; c.fill(); c.restore(); } }
function bones(c, x, n = 5) { for (let i = 0; i < n; i++) { c.save(); c.translate(x + (rnd(i + 3) - .5) * 140, -8 - rnd(i) * 8); c.rotate((rnd(i + 5) - .5) * 1.6); line(c, [-40, 0, 40, 0], 14, '#2a2218'); line(c, [-40, 0, 40, 0], 8, '#e6dcc4'); for (const e of [-1, 1]) { circle(c, e * 42, -5, 8); c.fillStyle = '#e6dcc4'; c.fill(); circle(c, e * 42, 5, 8); c.fill(); } c.restore(); } }
function campSet(c, cam, t, o = {}) {
  const tod = o.tod || 'day', P = ST[tod];
  steppeSet(c, cam, t, Object.assign({ snow: .6 }, o));
  // rock overhang on the left, with the shelter's dark mouth
  layer(c, cam, 1, c => {
    const x0 = o.rockX ?? -900;
    c.save(); c.beginPath(); c.moveTo(x0 - 2400, 40); c.lineTo(x0 - 2400, -1800);
    for (let i = 0; i <= 16; i++) { const u = i / 16, x = x0 - 2400 + u * 3300, y = -1800 + u * u * 700 + (rnd(i + 900) - .5) * 90; c.lineTo(x, y); }
    c.lineTo(x0 + 1000, -1000); c.lineTo(x0 + 960, -900); c.quadraticCurveTo(x0 + 800, -820, x0 + 620, -840); c.lineTo(x0 + 480, -760);
    for (let i = 0; i <= 8; i++) { const u = i / 8; c.lineTo(x0 + 420 - u * 520 + (rnd(i + 950) - .5) * 60, -760 + u * 800); } c.closePath(); c.clip();
    rockMass(c, x0 - 2500, x0 + 1100, -1600, 60, 41, { n: 260, cracks: 40, wet: 30, top: '#4e443c', mid: '#6e6052', bot: '#4a3e34' });
    const sg = c.createLinearGradient(x0 - 900, 0, x0 - 100, 0); sg.addColorStop(0, 'rgba(20,14,10,.75)'); sg.addColorStop(1, 'rgba(20,14,10,.1)'); c.fillStyle = sg; c.beginPath(); c.ellipse(x0 - 600, -60, 520, 480, 0, Math.PI, 0); c.fill();
    c.restore();
    for (let i = 0; i < 9; i++) { const x = x0 + 120 + i * 70; c.beginPath(); c.moveTo(x - 6, -820 + i * 4); c.lineTo(x, -760 + rnd(i) * 40); c.lineTo(x + 6, -820 + i * 4); c.closePath(); c.fillStyle = 'rgba(225,238,250,.85)'; c.fill(); }
    if (tod === 'night') { c.fillStyle = 'rgba(5,8,20,.45)'; c.fillRect(x0 - 2500, -1600, 3600, 1700); }
  });
  return { base: P.ground };
}
