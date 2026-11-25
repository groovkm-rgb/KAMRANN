// KARTELL film: remaining places (world sets: parallax layers, floor at y = 0, 1 m ≈ 220 units).
// Each returns { base }. Helpers from places.js / decor.js / shots01.js.
function roomShell(c, cam, HZ, wallCol, floorFn, back, o = {}) {
  const B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = shade(wallCol, -.3); c.fillRect(0, 0, W, H);
  layer(c, cam, .85, c => { const b = B(.85), top = b - (o.wallH || 2.7) * KM; c.fillStyle = wallCol; c.fillRect(-6000, top - 600, 12000, b - top + 600); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(-6000, top - 600, 12000, 600 - 30); line(c, [-6000, top - 30, 6000, top - 30], 5, shade(wallCol, -.2)); kRect(c, -6000, b - 40, 12000, 40, shade(wallCol, -.25), 1.5); back(c, b, top); });
  layer(c, cam, 1, c => floorFn(c, HZ));
}
const floorTiles = (col, lineCol) => (c, HZ) => { c.fillStyle = col; c.fillRect(-9000, HZ, 18000, 2400); for (let r = 0; r < 12; r++) line(c, [-9000, HZ + r * 60, 9000, HZ + r * 60], 2, lineCol); for (let k = -80; k < 80; k++) line(c, [k * 120, HZ, k * 120 - 300, HZ + 700], 2, lineCol); };
const floorWood = (col) => (c, HZ) => { c.fillStyle = col; c.fillRect(-9000, HZ, 18000, 2400); for (let r = 0; r < 14; r++) { line(c, [-9000, HZ + r * 44, 9000, HZ + r * 44], 2, 'rgba(0,0,0,.18)'); for (let k = -40; k < 40; k++) line(c, [k * 260 + (r % 3) * 90, HZ + r * 44, k * 260 + (r % 3) * 90, HZ + r * 44 + 44], 2, 'rgba(0,0,0,.12)'); } };
function window2(c, x, y, w, h, view, frameCol = '#e8e4dc') { kRect(c, x - 10, y - 10, w + 20, h + 20, frameCol, 2.5); c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); view(c, x, y, w, h); c.restore(); line(c, [x + w / 2, y, x + w / 2, y + h], 8, frameCol); kRect(c, x - 20, y + h, w + 40, 16, frameCol, 2); }
function viewBlocks(dusk) { return (c, x, y, w, h) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, dusk ? '#e8a070' : '#9cc4dc'); g.addColorStop(1, dusk ? '#f4d0a0' : '#dce8ee'); c.fillStyle = g; c.fillRect(x, y, w, h); for (let i = 0; i < 6; i++) { const bx = x + i * w / 5 - 20, bh = h * (.5 + rnd(i) * .4); c.fillStyle = dusk ? '#8a7080' : '#b4bcc4'; c.fillRect(bx, y + h - bh, w / 6, bh); c.fillStyle = dusk ? 'rgba(255,220,140,.8)' : 'rgba(80,100,120,.5)'; for (let r = 0; r < 8; r++) for (let q = 0; q < 3; q++) if (rnd(i * 50 + r * 3 + q) > .4) c.fillRect(bx + 6 + q * w / 20, y + h - bh + 8 + r * 22, w / 40, 10); circle(c, bx + w / 14, y + h - bh + 30, 8); c.fillStyle = '#dde'; c.fill(); } }; }
// ======================= C) Noah's small flat: bills, empty fridge =======================
function flatSet(c, cam, t, o = {}) {
  roomShell(c, cam, -240, '#c8bc9e', floorWood('#8a6a4a'), (c, b, top) => {
    for (let i = -20; i < 20; i++) { c.fillStyle = i % 2 ? 'rgba(120,100,60,.1)' : 'rgba(255,255,255,.05)'; c.fillRect(i * 90, top, 45, b - top); } // tired wallpaper stripes
    c.fillStyle = 'rgba(120,100,60,.2)'; c.beginPath(); c.ellipse(-700, top + 120, 120, 60, 0, 0, Math.PI * 2); c.fill(); // damp stain
    window2(c, 200, top + 110, 360, 300, viewBlocks(true)); for (let i = 0; i < 7; i++) line(c, [215 + i * 50, top + 100, 215 + i * 50, top + 140], 4, '#a8a090'); // net curtain rod
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(200, top + 110, 120, 300);
    kRect(c, 230, b - 220, 300, 90, '#d8d4cc', 2); for (let k = 0; k < 9; k++) line(c, [240 + k * 32, b - 215, 240 + k * 32, b - 135], 5, '#b8b4ac'); // radiator
    // old fridge, door open, nearly empty, light inside
    const fx = o.fridgeX ?? -1000; kRect(c, fx - 150, b - 560, 300, 560, '#e8e4d8', 3); kRect(c, fx - 130, b - 540, 260, 400, '#f8f4e4', 2); bloom(c, fx, b - 380, 260, '230,240,255', .5); for (let k = 0; k < 3; k++) line(c, [fx - 125, b - 440 + k * 110, fx + 125, b - 440 + k * 110], 4, '#c8c8c0');
    kRect(c, fx - 40, b - 330, 40, 60, '#f2d23a', 1.5); kRect(c, fx + 40, b - 220, 60, 30, '#e8e0d0', 1.5);
    c.beginPath(); c.moveTo(fx + 150, b - 560); c.lineTo(fx + 280, b - 520); c.lineTo(fx + 280, b - 40); c.lineTo(fx + 150, b); c.closePath(); fs(c, '#dcd8cc', 3); // open door
    kRect(c, -520, top + 140, 300, 220, '#f4f0e6', 2.5); c.fillStyle = '#7a9a6a'; c.fillRect(-500, top + 160, 260, 120); // calendar picture (no dates)
    for (let i = 0; i < 5; i++) { line(c, [-1700 + i * 60, b - 2, -1680 + i * 60, b - 60], 10, ['#3a3c40', '#8a3a32'][i % 2]); } // shoes pile
    sconce(c, -200, top + 120, .9, true);
  }, o);
  layer(c, cam, 1, c => { // kitchen table with bills, noodle cup, mug
    const tx = o.tableX ?? -300; kRect(c, tx - 260, -260, 520, 26, '#a8865a', 3); for (const d of [-230, 210]) kRect(c, tx + d, -234, 20, 234, '#7a5a3a', 2);
    for (let i = 0; i < 6; i++) { c.save(); c.translate(tx - 200 + i * 50, -262); c.rotate(-.1 + rnd(i) * .2); kRect(c, -40, -8, 80, 8, i % 2 ? '#f4f0e6' : '#e8f0f4', 1.2); c.restore(); }
    c.save(); c.translate(tx + 60, -268); c.rotate(.08); kRect(c, -60, -10, 120, 10, '#f4f0e6', 1.2); c.font = '800 13px Inter'; c.fillStyle = '#c8202a'; c.fillText('MAHNUNG', -40, -1); c.restore();
    c.beginPath(); c.moveTo(tx + 160, -330); c.lineTo(tx + 220, -330); c.lineTo(tx + 210, -262); c.lineTo(tx + 170, -262); c.closePath(); fs(c, '#f4f0e6', 2); kRect(c, tx + 160, -336, 60, 8, '#c8302a', 1.5);
    waterGlass(c, tx - 150, -262, .8);
  });
  return { base: '#8a6a4a' };
}
// ======================= C) neighbourhood parking lot (golden hour) =======================
function plattenbau(c, x, b, w, floors, seed) { const fh = 120, top = b - floors * fh; kRect(c, x, top, w, b - top, ['#c8c0b0', '#b8b4a8', '#d0c4ac'][seed % 3], 2);
  for (let f = 0; f < floors; f++) for (let i = 0; i < w / 90; i++) { const wx = x + 20 + i * 90, wy = top + 20 + f * fh; kRect(c, wx, wy, 50, 70, rnd(seed * 31 + f * 7 + i) > .7 ? '#ffd98a' : '#5a6a7a', 1); if ((i + f + seed) % 3 === 0) { kRect(c, wx - 10, wy + 60, 70, 40, '#a8a49a', 1.5); if (rnd(i + f + seed) > .5) { circle(c, wx + 50, wy + 70, 16); fs(c, '#e8e8e4', 1.5); } } }
  for (let k = 1; k < floors; k++) line(c, [x, top + k * fh, x + w, top + k * fh], 2, 'rgba(0,0,0,.12)'); }
function mahalleSet(c, cam, t, o = {}) {
  const HZ = -220, B = p => layerBase(cam, HZ, p), dusk = o.tod !== 'day';
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, dusk ? '#6a7ab0' : '#7fb6e0'); g.addColorStop(.8, dusk ? '#ffc490' : '#dceef6'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  layer(c, cam, .15, c => { const b = B(.15); for (let i = 0; i < 14; i++) plattenbau(c, -4000 + i * 600, b, 520, 8 + (i % 4) * 2, i); });
  haze(c, dusk ? '255,190,150' : '210,230,240', .3);
  layer(c, cam, .5, c => { const b = B(.5); for (let i = 0; i < 6; i++) plattenbau(c, -3000 + i * 1300, b, 1100, 5 + (i % 2), i + 3);
    for (let i = 0; i < 8; i++) { const gx = -2600 + i * 420; kRect(c, gx, b - 250, 400, 250, '#9a9890', 2); kRect(c, gx + 30, b - 220, 340, 220, '#7a7a78', 2); for (let k = 0; k < 8; k++) line(c, [gx + 30, b - 210 + k * 26, gx + 370, b - 210 + k * 26], 2, 'rgba(0,0,0,.15)');
      c.save(); c.globalAlpha = .85; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(gx + 60 + k * 90, b - 60 - rnd(i + k) * 80); c.bezierCurveTo(gx + 100 + k * 90, b - 180, gx + 140 + k * 90, b - 20, gx + 170 + k * 90, b - 120); c.lineWidth = 14; c.strokeStyle = ['#d04a8a', '#3aa0d0', '#f2c531', '#6ac06a'][(i + k) % 4]; c.stroke(); } c.restore(); }
    // kiosk with sign, lit window
    const kx = o.kioskX ?? 1400; kRect(c, kx, b - 420, 600, 420, '#d8c8a8', 3); kRect(c, kx - 20, b - 480, 640, 70, '#2f6fb0', 3); c.font = '800 54px Inter'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('KIOSK', kx + 300, b - 427);
    kRect(c, kx + 40, b - 380, 330, 220, '#ffd98a', 2.5); bloom(c, kx + 200, b - 270, 260, '255,210,130', .5); for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) kRect(c, kx + 55 + q * 52, b - 365 + r * 70, 40, 50, ['#e05a4a', '#4a8ad0', '#f2c531', '#5aa05a'][(r + q) % 4], 1);
    kRect(c, kx + 400, b - 380, 160, 380, '#5a4a3a', 2.5); kRect(c, kx + 40, b - 140, 330, 20, '#a8a090', 2);
    for (const lx of [-1800, 300, 2400]) { line(c, [lx, b, lx, b - 620], 10, '#3a4048'); kRect(c, lx - 10, b - 640, 70, 24, '#3a4048', 2); bloom(c, lx + 25, b - 610, 160, '255,220,150', dusk ? .6 : .1); }
  });
  layer(c, cam, 1, c => { c.fillStyle = '#6a6a6e'; c.fillRect(-9000, HZ, 18000, 2400); for (let k = -20; k < 20; k++) line(c, [k * 600, HZ, k * 600 + 200, 600], 6, 'rgba(240,240,230,.6)'); kSpecks(c, -4000, HZ, 8000, 700, 33, 300, 'rgba(30,30,30,.2)', 6); kStain(c, 300, 80, 200, 40, 'rgba(20,20,20,.2)', 3);
    if (o.cars !== false) { hatchback(c, o.carX ?? -900, {}); }
    kRect(c, 1700, -300, 160, 300, '#3f6a4a', 3); kRect(c, 1880, -300, 160, 300, '#5a5a62', 3); // bins
  });
  return { base: '#6a6a6e' };
}
// ======================= D) backyard market with fake branded goods =======================
function fakeShoe(c, x, y, s = 1, col = '#f4f2ee', logo = '#2a6fd6') { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-90, 0); c.lineTo(-90, -40); c.quadraticCurveTo(-70, -70, -20, -70); c.lineTo(10, -40); c.quadraticCurveTo(70, -36, 96, -10); c.lineTo(96, 0); c.closePath(); fs(c, col, 3); kRect(c, -92, -14, 190, 14, '#d8d4cc', 2); line(c, [-50, -40, -20, -24, 10, -44, 40, -26], 6, logo); c.restore(); }
function fakeBag(c, x, y, s = 1, col = '#8a5a3a') { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.arc(0, -110, 50, Math.PI, 0); c.lineWidth = 10; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 6; c.strokeStyle = shade(col, -.2); c.stroke(); c.beginPath(); c.moveTo(-90, -110); c.lineTo(90, -110); c.lineTo(110, 0); c.lineTo(-110, 0); c.closePath(); fs(c, col, 3); c.font = '800 22px Inter'; c.fillStyle = '#e8d090'; c.textAlign = 'center'; c.fillText('MERIDIAN', 0, -50); c.restore(); }
function fakeWatch(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); kRect(c, -18, -110, 36, 220, '#2a2a2e', 2); circle(c, 0, 0, 52); fs(c, '#d8c070', 4); circle(c, 0, 0, 42); fs(c, '#1e2a3a', 2); line(c, [0, 0, 0, -30], 4, '#fff'); line(c, [0, 0, 22, 10], 4, '#fff'); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; circle(c, Math.cos(a) * 34, Math.sin(a) * 34, 2.5); c.fillStyle = '#e8d090'; c.fill(); } c.restore(); }
function fakePerfume(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.roundRect(-50, -120, 100, 120, 14); c.fillStyle = 'rgba(230,200,140,.7)'; c.fill(); c.lineWidth = 4; c.strokeStyle = OUT; c.stroke(); kRect(c, -20, -150, 40, 30, '#d8c070', 3); c.font = '800 16px Inter'; c.fillStyle = '#5a3a1a'; c.textAlign = 'center'; c.fillText('VOLTA', 0, -60); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(-40, -110, 14, 100); c.restore(); }
function marketSet(c, cam, t, o = {}) {
  const HZ = -200, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#c8a080'; c.fillRect(0, 0, W, H);
  layer(c, cam, .4, c => { const b = B(.4); for (let i = 0; i < 6; i++) plattenbau(c, -3000 + i * 1100, b, 1000, 6, i + 7); });
  haze(c, '255,210,170', .25);
  layer(c, cam, .7, c => { const b = B(.7); for (let i = 0; i < 14; i++) { const x = -3500 + i * 520 + rnd(i) * 80; person(c, { who: ['worker', 'friend1', 'friend2', 'mother', 'wife'][i % 5], x, y: b, k: .18, sil: 1, top: '#4a3a48', alpha: .5 }); }
    for (let i = 0; i < 30; i++) { const x = -3500 + i * 240; line(c, [x, b - 700, x + 240, b - 690 + Math.sin(i) * 20], 2, '#3a3a3a'); circle(c, x + 120, b - 690, 10); c.fillStyle = '#ffe6a0'; c.fill(); bloom(c, x + 120, b - 690, 60, '255,220,150', .5); } });
  layer(c, cam, 1, c => { c.fillStyle = '#7a7060'; c.fillRect(-9000, HZ, 18000, 2400); kSpecks(c, -4000, HZ, 8000, 700, 19, 400, 'rgba(40,30,20,.2)', 6);
    for (let s = 0; s < 4; s++) { const sx = -2400 + s * 1300; // stall with tarp roof
      line(c, [sx - 420, 0, sx - 420, -620], 10, '#5a4a3a'); line(c, [sx + 420, 0, sx + 420, -620], 10, '#5a4a3a'); c.beginPath(); c.moveTo(sx - 480, -620); c.lineTo(sx + 480, -620); c.lineTo(sx + 440, -540); c.lineTo(sx - 440, -540); c.closePath(); fs(c, ['#2f6fb0', '#c8302a', '#3a8a4a', '#e8a030'][s], 3); for (let k = 0; k < 9; k++) line(c, [sx - 440 + k * 110, -540, sx - 420 + k * 110, -620], 2, 'rgba(255,255,255,.3)');
      kRect(c, sx - 400, -220, 800, 24, '#c8b088', 3); kRect(c, sx - 400, -196, 800, 196, '#8a7050', 2);
      if (s % 4 === 0) for (let k = 0; k < 4; k++) fakeShoe(c, sx - 280 + k * 180, -222, .9, ['#f4f2ee', '#2a2a2e', '#e8e0d0', '#c84a3a'][k]);
      if (s % 4 === 1) for (let k = 0; k < 3; k++) fakeBag(c, sx - 250 + k * 250, -222, .9, ['#8a5a3a', '#2a2a2e', '#b89060'][k]);
      if (s % 4 === 2) { kRect(c, sx - 360, -330, 720, 110, '#2a2a2e', 2); for (let k = 0; k < 6; k++) fakeWatch(c, sx - 300 + k * 120, -275, .55); }
      if (s % 4 === 3) for (let k = 0; k < 6; k++) fakePerfume(c, sx - 320 + k * 128, -222, .8);
    }
  });
  return { base: '#7a7060' };
}
// ======================= E) counterfeit workshop: dim, tired faces =======================
function sweatshopSet(c, cam, t, o = {}) {
  roomShell(c, cam, -200, '#6a6458', floorTiles('#5a544a', 'rgba(0,0,0,.25)'), (c, b, top) => {
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-6000, top, 12000, b - top); kStain(c, -400, top + 200, 300, 120, 'rgba(40,40,30,.3)', 4);
    for (let i = 0; i < 5; i++) { const wx = -2000 + i * 900; kRect(c, wx, top + 40, 300, 120, '#2a2c30', 2); c.fillStyle = 'rgba(200,210,200,.35)'; c.fillRect(wx + 10, top + 50, 280, 100); for (let k = 0; k < 6; k++) line(c, [wx + k * 50, top + 40, wx + k * 50, top + 160], 4, '#2a2c30'); }
    for (let i = 0; i < 6; i++) { const x = -2500 + i * 900; for (let k = 0; k < 4; k++) kRect(c, x + k * 60, b - 160 - k * 30, 200, 30, ['#4a5a7a', '#8a3a32', '#c8b090', '#3a3c40'][(i + k) % 4], 1.5); } // fabric piles
    for (let i = 0; i < 12; i++) { const x = -3000 + i * 520; line(c, [x, top - 600, x, top + 160], 2, '#1a1a1a'); circle(c, x, top + 170, 18); c.fillStyle = '#ffe0a0'; c.fill(); bloom(c, x, top + 200, 260, '255,210,140', .45); }
  }, o);
  layer(c, cam, 1, c => { for (let i = 0; i < 4; i++) { const x = -1500 + i * 900; kRect(c, x - 260, -230, 520, 30, '#8a7a5a', 3); kRect(c, x - 240, -200, 20, 200, '#5a4a3a', 2); kRect(c, x + 220, -200, 20, 200, '#5a4a3a', 2); person(c, { who: 'worker', x: x - 150, y: 60, k: .23, top: ['#7a7f86', '#8a6a5a', '#5a6a7a', '#7a6a7a'][i], hair: ['short', 'bun', 'grey', 'long'][i], hairCol: ['#3a2a20', '#2a2420', '#8a8a86', '#3a2a20'][i], expr: KX.tired, arms: { l: { a: .4, b: -1.2 }, r: { a: .4, b: -1.2 } } });
      c.save(); c.translate(150, 0); c.beginPath(); c.moveTo(x - 120, -230); c.lineTo(x - 120, -330); c.lineTo(x + 120, -330); c.lineTo(x + 120, -290); c.lineTo(x + 20, -290); c.lineTo(x + 20, -230); c.closePath(); fs(c, '#2a2c30', 3); line(c, [x - 90, -300, x + 100, -300], 4, '#c8302a'); kRect(c, x - 100, -246, 200, 16, '#e8e0d0', 1.5); c.restore(); bloom(c, x, -500, 300, '255,210,140', .35);
      if (i % 2) fakeShoe(c, x + 170, -230, .5, '#f4f2ee'); else fakeBag(c, x + 170, -230, .4); } });
  return { base: '#5a544a' };
}
// ======================= G) night club: neon, velvet, Noah watching the door =======================
function clubSet(c, cam, t, o = {}) {
  const HZ = -200, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#120a1a'; c.fillRect(0, 0, W, H);
  layer(c, cam, .6, c => { const b = B(.6); c.fillStyle = '#1e1028'; c.fillRect(-6000, b - 1400, 12000, 1400);
    for (let i = 0; i < 8; i++) { const x = -2800 + i * 800; c.save(); c.globalCompositeOperation = 'screen'; c.strokeStyle = ['#ff3aa0', '#3ad0ff', '#a05aff'][i % 3]; c.lineWidth = 10; c.beginPath(); c.arc(x, b - 900, 120, 0, Math.PI * 2); c.stroke(); bloom(c, x, b - 900, 300, ['255,60,160', '60,200,255', '160,90,255'][i % 3], .35); c.restore(); }
    kRect(c, -900, b - 700, 1800, 500, '#2a1a20', 3); for (let r = 0; r < 4; r++) for (let q = 0; q < 16; q++) { const bx = -860 + q * 110, by = b - 650 + r * 110; c.beginPath(); c.roundRect(bx, by, 40, 90, 10); c.fillStyle = ['#8a5aff', '#ff9a3a', '#3ad0a0', '#e8e0d0'][(r + q) % 4]; c.globalAlpha = .75; c.fill(); c.globalAlpha = 1; } bloom(c, 0, b - 450, 700, '255,150,90', .3);
    kRect(c, -1000, b - 220, 2000, 220, '#3a2026', 3); line(c, [-1000, b - 220, 1000, b - 220], 8, '#c8a060');
    const dx = o.doorX ?? 2000; kRect(c, dx - 200, b - 700, 400, 700, '#0a0a0c', 3); c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(120,160,255,.25)'; c.fillRect(dx - 200, b - 700, 400, 700); c.restore(); kRect(c, dx - 140, b - 820, 280, 70, '#1a3a1a', 2); c.font = '800 40px Inter'; c.fillStyle = '#5af07a'; c.textAlign = 'center'; c.fillText('AUSGANG', dx, b - 772);
    person(c, { who: 'guard', x: dx + 300, y: b, k: .27 });
    for (let i = 0; i < 10; i++) person(c, { who: ['friend1', 'wife', 'friend2', 'worker'][i % 4], x: -2600 + i * 360, y: b + 20, k: .2, sil: 1, top: '#2a1a3a', alpha: .7, arms: { l: { a: 1 + Math.sin(t * 4 + i) * .5, b: .3 }, r: { a: .8, b: -.4 } } });
  });
  layer(c, cam, 1, c => { c.fillStyle = '#1a1018'; c.fillRect(-9000, HZ, 18000, 2400); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${['255,60,160', '60,200,255', '160,90,255'][i % 3]},.15)`; c.beginPath(); c.ellipse(-3000 + i * 160, HZ + 80 + (i % 4) * 60, 60, 12, 0, 0, Math.PI * 2); c.fill(); }
    // velvet booth + low table with glasses
    const bx = o.boothX ?? 0; c.beginPath(); c.roundRect(bx - 500, -420, 1000, 300, 60); fs(c, '#6a1a3a', 3); for (let k = 0; k < 8; k++) line(c, [bx - 460 + k * 125, -400, bx - 460 + k * 125, -140], 4, 'rgba(0,0,0,.25)'); kRect(c, bx - 520, -140, 1040, 140, '#4a1028', 3);
  });
  return { base: '#1a1018' };
}
function clubTable(c, x) { kRect(c, x - 200, -200, 400, 20, '#c8a060', 2); line(c, [x, -180, x, 0], 12, '#2a2026'); for (let i = 0; i < 3; i++) { waterGlass(c, x - 120 + i * 100, -200, .9); } }
// ======================= H) port + customs scanner =======================
function container(c, x, y, w, h, col) { kRect(c, x, y - h, w, h, col, 2.5); for (let k = 1; k < w / 30; k++) line(c, [x + k * 30, y - h + 6, x + k * 30, y - 6], 2, 'rgba(0,0,0,.2)'); kRect(c, x, y - h, 12, h, shade(col, -.2), 1); kRect(c, x + w - 12, y - h, 12, h, shade(col, -.2), 1); }
function portSet(c, cam, t, o = {}) {
  const HZ = -200, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8ab0cc'); g.addColorStop(1, '#e4e8e4'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  layer(c, cam, .1, c => { const b = B(.1); c.fillStyle = '#5a8aa8'; c.fillRect(-6000, b - 120, 12000, 140); c.fillStyle = '#4a5a6a'; c.fillRect(-1200, b - 220, 1500, 100); for (let i = 0; i < 12; i++) container(c, -1150 + i * 120, b - 220, 110, 50, ['#c8302a', '#2f6fb0', '#e8a030', '#3a8a4a'][i % 4]); });
  haze(c, '220,230,235', .25);
  layer(c, cam, .35, c => { const b = B(.35); for (let i = 0; i < 4; i++) { const x = -3000 + i * 1800; line(c, [x, b, x, b - 1500], 30, '#c8302a'); line(c, [x + 400, b, x + 400, b - 1500], 30, '#c8302a'); line(c, [x - 600, b - 1500, x + 1100, b - 1500], 40, '#c8302a'); for (let k = 0; k < 12; k++) line(c, [x - 600 + k * 140, b - 1500, x - 530 + k * 140, b - 1460], 6, '#a02020'); line(c, [x + 200 + Math.sin(t * .3 + i) * 200, b - 1500, x + 200 + Math.sin(t * .3 + i) * 200, b - 900], 4, '#333'); container(c, x + 100 + Math.sin(t * .3 + i) * 200, b - 820, 240, 90, '#2f6fb0'); } });
  layer(c, cam, .7, c => { const b = B(.7); for (let s = 0; s < 4; s++) for (let i = 0; i < 18; i++) container(c, -4000 + i * 470, b - s * 180, 450, 180, ['#c8302a', '#2f6fb0', '#e8a030', '#3a8a4a', '#8a8a8a', '#6a3a8a'][(i * 3 + s * 5) % 6]); });
  layer(c, cam, 1, c => { c.fillStyle = '#7a7c7e'; c.fillRect(-9000, HZ, 18000, 2400); for (let k = -20; k < 20; k++) { c.fillStyle = '#e8c23a'; c.fillRect(k * 600, HZ + 120, 300, 14); } kSpecks(c, -4000, HZ, 8000, 600, 41, 260, 'rgba(30,30,30,.2)', 6);
    if (o.scanner) { const sx = o.scanX ?? 600; for (const d of [-500, 500]) kRect(c, sx + d - 40, -1100, 80, 1100, '#e8e4dc', 3); kRect(c, sx - 560, -1180, 1120, 110, '#e8e4dc', 3); c.font = '800 60px Inter'; c.fillStyle = '#2f4a3a'; c.textAlign = 'center'; c.fillText('ZOLL', sx, -1105); const on = Math.sin(t * 5) > 0; circle(c, sx - 420, -1125, 18); c.fillStyle = on ? '#ff3a3a' : '#601010'; c.fill(); if (on) bloom(c, sx - 420, -1125, 80, '255,60,60', .6);
      c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(120,255,160,${.12 + .08 * Math.sin(t * 8)})`; c.fillRect(sx - 460, -1070, 920, 1070); c.restore(); }
    if (o.truck) { const tx = o.truckX ?? 600; c.save(); c.translate(tx, 0); container(c, -700, -150, 1100, 560, '#2f6fb0'); kRect(c, 400, -620, 360, 470, '#e8e4dc', 3); kRect(c, 500, -580, 220, 160, '#5a7a8a', 2); for (const wx of [-500, -200, 600]) { circle(c, wx, -70, 75); fs(c, '#1d1d20', 3); circle(c, wx, -70, 30); fs(c, '#9a9a9a', 2); } c.restore(); }
  });
  return { base: '#7a7c7e' };
}
// ======================= H) customs evidence room (sealed, seized goods) =======================
function evidenceRoomSet(c, cam, t, o = {}) {
  roomShell(c, cam, -200, '#b8bcbe', floorTiles('#8a8e90', 'rgba(0,0,0,.18)'), (c, b, top) => {
    for (let i = 0; i < 8; i++) { const sx = -3200 + i * 820; kRect(c, sx, b - 540, 700, 540, null, 0); for (const d of [0, 680]) kRect(c, sx + d, b - 560, 20, 560, '#6a7076', 2); for (let r = 0; r < 4; r++) { const sy = b - 20 - r * 140; kRect(c, sx, sy, 700, 14, '#8a9096', 2);
      for (let q = 0; q < 4; q++) { const bx = sx + 20 + q * 168, kind = o.kind || 'cig'; if (rnd(i * 17 + r * 5 + q) < .15) continue;
        if (kind === 'cig') { kRect(c, bx, sy - 110, 150, 110, '#c9a06a', 1.5, 'rgba(60,40,20,.7)'); c.fillStyle = 'rgba(235,245,255,.35)'; c.fillRect(bx, sy - 110, 150, 110); kRect(c, bx + 90, sy - 100, 50, 36, '#f2d23a', 1); }
        else { c.beginPath(); c.roundRect(bx + 10, sy - 90, 130, 90, 14); fs(c, 'rgba(230,236,240,.85)', 1.5); kRect(c, bx + 30, sy - 60, 90, 28, '#c8302a', 1); line(c, [bx + 10, sy - 75, bx + 140, sy - 75], 3, '#c8302a'); } } } }
    for (let i = 0; i < 6; i++) { const x = -2600 + i * 1000; kRect(c, x, top + 10, 500, 20, '#f4fbff', 2); bloom(c, x + 250, top + 30, 360, '230,240,255', .4); }
  }, Object.assign({ wallH: 3.2 }, o));
  layer(c, cam, 1, c => { if (o.table !== false) { kRect(c, -500, -260, 1000, 26, '#9aa0a6', 3); for (const d of [-460, 440]) kRect(c, d, -234, 20, 234, '#6a7076', 2);
    for (let i = 0; i < 3; i++) { kRect(c, -420 + i * 300, -440, 240, 180, '#c9a06a', 2, 'rgba(60,40,20,.7)'); c.fillStyle = 'rgba(235,245,255,.35)'; c.fillRect(-420 + i * 300, -440, 240, 180); kRect(c, -330 + i * 300, -400, 120, 60, '#f4f0e6', 1.5); c.font = '700 13px Inter'; c.fillStyle = '#c8202a'; c.textAlign = 'center'; c.fillText('BEWEISMITTEL', -270 + i * 300, -365); } } });
  return { base: '#8a8e90' };
}
// ======================= I) safe houses =======================
function safehouseSet(c, cam, t, o = {}) {
  const v = o.v || 0, wall = ['#9a9488', '#7a8a8a', '#a88a74', '#6e6a74'][v % 4];
  roomShell(c, cam, -200, wall, floorWood(['#6a5a4a', '#5a5048', '#7a6a58', '#4a4440'][v % 4]), (c, b, top) => {
    kStain(c, -600 + v * 200, top + 200, 160, 70, 'rgba(40,30,20,.12)', v + 3);
    const wx = 200 - v * 150; kRect(c, wx, top + 120, 460, 360, '#1a1816', 3); for (let k = 0; k < 18; k++) { c.fillStyle = '#c8c0b0'; c.fillRect(wx + 10, top + 130 + k * 19.5, 440, 14); c.fillStyle = 'rgba(255,240,200,.9)'; c.fillRect(wx + 10, top + 144 + k * 19.5, 440, 4); }
    c.save(); c.globalCompositeOperation = 'screen'; for (let k = 0; k < 18; k++) { c.fillStyle = 'rgba(255,240,200,.12)'; c.beginPath(); c.moveTo(wx + 10, top + 144 + k * 19.5); c.lineTo(wx + 450, top + 144 + k * 19.5); c.lineTo(wx + 900, b + 300 + k * 10); c.lineTo(wx + 460, b + 300 + k * 10); c.fill(); } c.restore();
    line(c, [-1400, top, -1400, top + 200], 2, '#222'); circle(c, -1400, top + 210, 16); c.fillStyle = '#f4f0d0'; c.fill(); // bare bulb
    if (v % 2) { kRect(c, 900, b - 500, 300, 500, '#5a4a3a', 3); circle(c, 1160, b - 260, 10); c.fillStyle = '#c8a060'; c.fill(); }
  }, o);
  layer(c, cam, 1, c => { const mx = o.mattX ?? -400; c.beginPath(); c.roundRect(mx - 420, -110, 840, 110, 20); fs(c, '#d8d0c0', 3); line(c, [mx - 400, -60, mx + 400, -60], 3, 'rgba(0,0,0,.1)'); c.beginPath(); c.roundRect(mx - 380, -150, 200, 60, 20); fs(c, '#e8e0d0', 2.5);
    c.beginPath(); c.moveTo(mx + 500, 0); c.lineTo(mx + 520, -180); c.lineTo(mx + 760, -180); c.lineTo(mx + 780, 0); c.closePath(); fs(c, '#2a2a2e', 3); // packed bag
    for (const [sx, a] of [[mx + 200, .4], [mx + 260, -.6]]) { c.save(); c.translate(sx, 30); c.rotate(a); kRect(c, -24, -16, 48, 32, '#f1efe8', 2); kRect(c, -16, -10, 18, 20, '#d6b25a', 1); c.restore(); } // broken SIM pieces
  });
  return { base: '#5a5048' };
}
// ======================= hospital corridor =======================
function hospitalSet(c, cam, t, o = {}) {
  roomShell(c, cam, -200, '#d8e0dc', floorTiles('#b8c4c0', 'rgba(0,0,0,.12)'), (c, b, top) => {
    c.fillStyle = '#9ab8b0'; c.fillRect(-6000, b - 300, 12000, 260); line(c, [-6000, b - 300, 6000, b - 300], 10, '#7a9890');
    for (let i = 0; i < 5; i++) { const dx = -2600 + i * 1300; kRect(c, dx, b - 520, 260, 520, '#e8ece8', 3); kRect(c, dx + 70, b - 470, 120, 120, '#a8c8d8', 2); kRect(c, dx + 200, b - 280, 20, 50, '#8a9096', 1.5); kRect(c, dx + 40, b - 620, 180, 60, '#2f6fb0', 2); c.font = '700 22px Inter'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(['STATION', 'NOTAUFNAHME', 'INTENSIV', 'RADIOLOGIE', 'LABOR'][i], dx + 130, b - 582); }
    for (let i = 0; i < 6; i++) { const x = -3000 + i * 1000; kRect(c, x, top + 10, 400, 18, '#f4fbff', 2); bloom(c, x + 200, top + 30, 300, '230,245,255', .4); }
    kRect(c, 1500, b - 560, 260, 560, '#3a4048', 3); kRect(c, 1530, b - 520, 200, 300, '#9ab8c8', 2); for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) kRect(c, 1540 + q * 62, b - 510 + r * 72, 50, 60, ['#e05a4a', '#f2c531', '#4a8ad0'][(r + q) % 3], 1); // vending machine
    monstera(c, 1000, b, .45, 1);
  }, o);
  layer(c, cam, 1, c => { for (let i = 0; i < 5; i++) { const x = (o.chairsX ?? -700) + i * 150; kRect(c, x - 60, -200, 120, 20, '#3a8a9a', 2.5); kRect(c, x - 60, -330, 120, 130, '#3a8a9a', 2.5); line(c, [x - 50, -180, x - 50, 0], 6, '#6a7076'); line(c, [x + 50, -180, x + 50, 0], 6, '#6a7076'); } });
  return { base: '#b8c4c0' };
}
// ======================= empty child room =======================
function childRoomSet(c, cam, t, o = {}) {
  roomShell(c, cam, -200, '#e8d8c8', floorWood('#b89870'), (c, b, top) => {
    for (let i = 0; i < 20; i++) { const x = -2000 + i * 200; c.fillStyle = '#f2c531'; star(c, x + 50, top + 80 + (i % 3) * 60, 18, 5, .45); c.fill(); }
    window2(c, 300, top + 120, 420, 340, viewBlocks(false), '#f4f0e8'); c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,245,220,.18)'; c.beginPath(); c.moveTo(300, top + 460); c.lineTo(720, top + 460); c.lineTo(1100, b + 400); c.lineTo(500, b + 400); c.fill(); c.restore();
    for (let i = 0; i < 4; i++) { c.save(); c.translate(-900 + i * 170, top + 200 + (i % 2) * 40); c.rotate((i - 1.5) * .06); kRect(c, 0, 0, 140, 110, '#fbfaf4', 2); c.fillStyle = ['#e05a4a', '#4a8ad0', '#5aa05a', '#f2c531'][i]; c.beginPath(); c.arc(70, 50, 30, 0, Math.PI * 2); c.fill(); line(c, [20, 95, 120, 90], 5, '#5aa05a'); c.restore(); } // kids' drawings
    c.beginPath(); c.roundRect(-1600, b - 300, 900, 220, 20); fs(c, '#f4f0e8', 3); kRect(c, -1650, b - 420, 60, 420, '#d8b890', 2.5); kRect(c, -1620, b - 80, 960, 80, '#d8b890', 2.5); c.beginPath(); c.roundRect(-1560, b - 360, 200, 80, 30); fs(c, '#fbfaf6', 2.5);
    c.beginPath(); c.arc(-1000, b - 340, 60, 0, Math.PI * 2); fs(c, '#b8865a', 3); for (const s of [-1, 1]) { circle(c, -1000 + s * 45, b - 395, 24); fs(c, '#b8865a', 3); } circle(c, -1020, b - 350, 6); c.fillStyle = OUT; c.fill(); circle(c, -980, b - 350, 6); c.fill(); // teddy bear
    kRect(c, -300, b - 260, 400, 260, '#9ac0d8', 3); for (let k = 0; k < 4; k++) kRect(c, -280 + k * 95, b - 240, 80, 100, ['#e05a4a', '#f2c531', '#5aa05a', '#4a8ad0'][k], 1.5); // toy shelf
  }, o);
  layer(c, cam, 1, c => { rugPattern(c, -200, -60, 1200, 160, '#8ab0c8', 4); for (let i = 0; i < 5; i++) { c.save(); c.translate(-500 + i * 180, -30 - (i % 2) * 20); c.rotate(i); kRect(c, -24, -24, 48, 48, ['#e05a4a', '#f2c531', '#5aa05a', '#4a8ad0', '#a05ac0'][i], 2); c.restore(); } });
  return { base: '#b89870' };
}
// ======================= empty school corridor (missing taxes) =======================
function schoolSet(c, cam, t, o = {}) {
  roomShell(c, cam, -200, '#e4dcc4', floorTiles('#a8a090', 'rgba(0,0,0,.15)'), (c, b, top) => {
    for (let i = 0; i < 26; i++) { const x = -3000 + i * 230; kRect(c, x, b - 420, 220, 420, ['#3a6a9a', '#3a6a9a', '#4a7aaa'][i % 3], 2.5); for (let k = 0; k < 4; k++) line(c, [x + 40, b - 400 + k * 16, x + 180, b - 400 + k * 16], 3, 'rgba(0,0,0,.25)'); kRect(c, x + 180, b - 260, 14, 40, '#c8ccd2', 1); if (i % 7 === 3) { c.save(); c.translate(x + 110, b - 210); c.rotate(.25); kRect(c, -100, -190, 200, 380, '#3a6a9a', 2.5); c.restore(); } }
    kRect(c, -600, top + 60, 700, 380, '#b8865a', 3); for (let i = 0; i < 6; i++) { c.save(); c.translate(-560 + i * 110, top + 100 + (i % 2) * 120); c.rotate((i - 2.5) * .05); kRect(c, 0, 0, 90, 110, ['#fbfaf4', '#f8e8a0', '#d8e8f4'][i % 3], 1.5); c.restore(); }
    for (let i = 0; i < 6; i++) { const x = -2600 + i * 1000; kRect(c, x, top + 10, 400, 18, i === 2 ? '#8a8e90' : '#f4fbff', 2); if (i !== 2) bloom(c, x + 200, top + 30, 300, '230,240,255', .35); } // one strip broken
    kRect(c, 800, top - 40, 220, 120, '#8a8478', 1.5); c.fillStyle = 'rgba(80,70,50,.3)'; c.beginPath(); c.ellipse(910, top + 120, 80, 30, 0, 0, Math.PI * 2); c.fill(); // missing ceiling tile + damp
  }, o);
  layer(c, cam, 1, c => { c.beginPath(); c.moveTo(780, -120); c.lineTo(960, -120); c.lineTo(940, 0); c.lineTo(800, 0); c.closePath(); fs(c, '#3a6a9a', 3); for (let i = 0; i < 3; i++) { const yy = (t * 300 + i * 120) % 360; circle(c, 870, -900 + yy * 2.2, 8); c.fillStyle = 'rgba(160,200,230,.8)'; c.fill(); } }); // bucket under the leak
  return { base: '#a8a090' };
}
// ======================= villa kitchen (breakfast, kids, guard) =======================
function kitchenSet(c, cam, t, o = {}) {
  roomShell(c, cam, -220, '#ece8e0', (c, HZ) => marbleBG(c, -9000, HZ, 18000, 2400, '#d8d4cc', 31), (c, b, top) => {
    for (let i = 0; i < 6; i++) kRect(c, -2400 + i * 330, b - 900, 320, 300, '#3e4a52', 2.5); kRect(c, -2400, b - 600, 1980, 30, '#c8c0b0', 2); for (let i = 0; i < 6; i++) { kRect(c, -2400 + i * 330, b - 420, 320, 420, '#3e4a52', 2.5); kRect(c, -2300 + i * 330, b - 400, 120, 10, '#b8954a', 1); }
    line(c, [-1500, b - 590, -1500, b - 680, -1440, b - 680], 8, '#b8bcc4'); vaseFlowers(c, -900, b - 600, .8, 4); waterGlass(c, -1100, b - 600, .8);
    window2(c, 0, top + 80, 900, 560, (c, x, y, w, h) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#9cc4dc'); g.addColorStop(1, '#e8f0e8'); c.fillStyle = g; c.fillRect(x, y, w, h); c.fillStyle = '#2aa0b8'; c.fillRect(x, y + h * .7, w, h * .3); for (let i = 0; i < 4; i++) oliveTree(c, x + 100 + i * 250, y + h * .7, 300, i, 1); }, '#3a3632');
    for (const px of [-300, 1200]) { line(c, [px, top - 300, px, top + 40], 3, '#2a2418'); c.beginPath(); c.arc(px, top + 60, 50, Math.PI, 0); fs(c, '#b8954a', 2); bloom(c, px, top + 70, 150, '255,210,140', .4); }
    secCam(c, 1600, top + 60, -1, t, .9);
    if (o.guard) person(c, { who: 'guard', x: 1700, y: b, k: .25 });
  }, o);
  layer(c, cam, 1, c => { const ix = o.islandX ?? 300; kRect(c, ix - 600, -300, 1200, 40, '#f2f0ec', 3); kRect(c, ix - 580, -260, 1160, 260, '#3e4a52', 3);
    for (let i = 0; i < 3; i++) { ell(c, ix - 380 + i * 360, -306, 70, 12); fs(c, '#fbfaf6', 2); circle(c, ix - 380 + i * 360, -318, 14); fs(c, '#f2c531', 1.5); } waterGlass(c, ix - 250, -300, .8); waterGlass(c, ix + 130, -300, .8); kCup(c, { wx: ix - 560, wy: -360 }, 1, t); });
  return { base: '#d8d4cc' };
}
// ======================= exterior: warehouse front in the industrial zone =======================
function lagerFrontSet(c, cam, t, o = {}) {
  const HZ = -200, B = p => layerBase(cam, HZ, p), dusk = !!o.dusk;
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, dusk ? '#5a6a9a' : '#8ab4d4'); g.addColorStop(1, dusk ? '#f0b890' : '#e4ecee'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  layer(c, cam, .2, c => { const b = B(.2); for (let i = 0; i < 10; i++) { const x = -3000 + i * 700; kRect(c, x, b - 300 - rnd(i) * 200, 600, 500, '#9aa0a8', 1.5); line(c, [x + 500, b - 500, x + 500, b - 900], 30, '#8a9098'); } });
  haze(c, dusk ? '255,200,160' : '220,230,240', .3);
  layer(c, cam, .8, c => { const b = B(.8), top = b - 6 * KM; kRect(c, -3000, top, 6000, b - top, '#a8b0b8', 3); for (let i = -140; i < 140; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.06)'; c.fillRect(i * 22, top, 11, b - top); }
    for (let i = 0; i < 3; i++) { const dx = -1800 + i * 1300; kRect(c, dx, b - 900, 900, 900, '#7a848e', 3); for (let k = 0; k < 18; k++) line(c, [dx, b - 900 + k * 50, dx + 900, b - 900 + k * 50], 2, '#5a646e'); kRect(c, dx - 20, b - 950, 940, 50, '#3a4048', 2); }
    kRect(c, -2600, top + 140, 900, 160, '#2a2c30', 2); c.font = '800 90px Inter'; c.fillStyle = '#e8e4dc'; c.textAlign = 'center'; c.fillText('HALLE B', -2150, top + 255);
    for (const lx of [-2000, -700, 600, 1900]) { kRect(c, lx - 50, b - 1050, 100, 30, '#2a2c30', 2); bloom(c, lx, b - 1020, 160, '255,220,160', dusk ? .55 : .1); }
    secCam(c, 2400, b - 1100, -1, t, 1.3);
  });
  layer(c, cam, 1, c => { c.fillStyle = '#7a7a76'; c.fillRect(-9000, HZ, 18000, 2400); kSpecks(c, -4000, HZ, 8000, 600, 51, 300, 'rgba(30,30,30,.2)', 6); for (let k = -20; k < 20; k++) line(c, [k * 500, HZ + 140, k * 500 + 280, HZ + 140], 10, '#e8c23a');
    for (let i = 0; i < 6; i++) { kRect(c, 1800 + i * 40, -60 - i * 60, 300, 60, i % 2 ? '#c8a46e' : '#b8945e', 2); } // pallets
    if (o.van) panelVan(c, o.vanX ?? -1600, {}); });
  return { base: '#7a7a76' };
}
// ======================= J) Colombia (symbols only) =======================
function hippo(c, x, y, s = 1, t = 0) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.ellipse(0, -110, 230, 110, 0, 0, Math.PI * 2); fs(c, '#8a7a84', 4); c.beginPath(); c.ellipse(210, -140, 110, 80, .2, 0, Math.PI * 2); fs(c, '#9a8a94', 4); circle(c, 200, -200, 14); c.fillStyle = OUT; c.fill(); for (const d of [-150, -50, 80, 160]) kRect(c, d - 30, -40, 60, 50, '#7a6a74', 3); circle(c, 280, -130, 8); c.fill(); c.restore(); }
function elephant(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.ellipse(0, -300, 260, 180, 0, 0, Math.PI * 2); fs(c, '#9a9a9e', 4); c.beginPath(); c.ellipse(240, -360, 130, 120, 0, 0, Math.PI * 2); fs(c, '#a8a8ac', 4); c.beginPath(); c.moveTo(340, -340); c.quadraticCurveTo(420, -200, 360, -60); c.lineWidth = 40; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 30; c.strokeStyle = '#a8a8ac'; c.stroke(); c.beginPath(); c.ellipse(170, -360, 80, 110, .2, 0, Math.PI * 2); fs(c, '#8a8a8e', 3); for (const d of [-180, -60, 80, 180]) kRect(c, d - 40, -160, 80, 160, '#8a8a8e', 3); circle(c, 280, -390, 10); c.fillStyle = OUT; c.fill(); c.restore(); }
function giraffe(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.ellipse(0, -520, 200, 110, 0, 0, Math.PI * 2); fs(c, '#e8b860', 4); c.beginPath(); c.moveTo(120, -560); c.lineTo(260, -1040); c.lineTo(320, -1030); c.lineTo(200, -520); c.closePath(); fs(c, '#e8b860', 4); c.beginPath(); c.ellipse(300, -1060, 80, 44, -.3, 0, Math.PI * 2); fs(c, '#e8b860', 4); for (let i = 0; i < 14; i++) { c.fillStyle = '#a8682a'; c.beginPath(); c.ellipse(-150 + (i % 5) * 70, -560 + Math.floor(i / 5) * 50, 26, 18, 0, 0, Math.PI * 2); c.fill(); } for (const d of [-150, -70, 80, 150]) kRect(c, d - 16, -430, 32, 430, '#d8a850', 3); c.restore(); }
function colombiaSet(c, cam, t, o = {}) {
  const HZ = -200, B = p => layerBase(cam, HZ, p), view = o.view || 'gate';
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, view === 'roof' ? '#3a4a7a' : '#7ab0d8'); g.addColorStop(1, view === 'roof' ? '#e8906a' : '#f0e8d0'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  layer(c, cam, .1, c => { const b = B(.1); c.fillStyle = view === 'roof' ? '#4a4a6a' : '#6a9a7a'; c.beginPath(); c.moveTo(-6000, b); for (let x = -6000; x <= 6000; x += 200) c.lineTo(x, b - 500 - Math.abs(Math.sin(x * .0008)) * 600); c.lineTo(6000, b); c.fill(); });
  haze(c, view === 'roof' ? '230,150,120' : '220,235,225', .3);
  if (view === 'roof') { layer(c, cam, .5, c => { const b = B(.5); for (let i = 0; i < 40; i++) { const x = -4000 + i * 200, h = 120 + rnd(i) * 200; c.fillStyle = '#2a2230'; c.fillRect(x, b - h, 190, h); c.beginPath(); c.moveTo(x - 10, b - h); c.lineTo(x + 95, b - h - 70); c.lineTo(x + 200, b - h); c.fill(); if (rnd(i + 3) > .6) { c.fillStyle = 'rgba(255,200,120,.8)'; c.fillRect(x + 60, b - h + 40, 24, 30); } } });
    layer(c, cam, 1, c => { c.fillStyle = '#1e1824'; c.beginPath(); c.moveTo(-3000, 0); c.lineTo(-600, -380); c.lineTo(1800, 0); c.lineTo(1800, 2000); c.lineTo(-3000, 2000); c.fill(); for (let k = 0; k < 30; k++) { line(c, [-3000 + k * 160, 0 - Math.max(0, 380 - Math.abs(-600 - (-3000 + k * 160)) * .16), -2900 + k * 160, 40], 3, 'rgba(160,90,70,.4)'); } }); return { base: '#1e1824' }; }
  if (view === 'prison') { layer(c, cam, .45, c => { const b = B(.45); c.fillStyle = '#5a8a5a'; c.beginPath(); c.moveTo(-6000, b); for (let x = -6000; x <= 6000; x += 100) c.lineTo(x, b - 300 - Math.max(0, 600 - Math.abs(x)) * .5); c.lineTo(6000, b); c.fill();
      const py = b - 560; kRect(c, -700, py - 200, 1400, 200, '#e8e4dc', 3); for (let i = 0; i < 10; i++) kRect(c, -650 + i * 135, py - 160, 60, 60, '#5a6a7a', 1.5); c.fillStyle = '#3a9a4a'; c.fillRect(-500, py + 20, 1000, 260); c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(-480, py + 40, 960, 220); line(c, [0, py + 40, 0, py + 260], 6, '#fff'); c.beginPath(); c.arc(0, py + 150, 50, 0, Math.PI * 2); c.stroke(); for (const d of [-480, 480]) kRect(c, d - 6, py + 110, 12, 80, '#fff', 0);
      line(c, [-800, py + 300, 800, py + 300], 8, '#8a8a8a'); for (let k = 0; k < 16; k++) line(c, [-800 + k * 100, py + 300, -800 + k * 100, py + 250], 4, '#8a8a8a'); c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(160,220,255,.35)'; c.beginPath(); c.moveTo(500, py - 60); c.lineTo(620, py - 60); c.lineTo(640, py + 20); c.lineTo(480, py + 20); c.fill(); c.restore(); });
    layer(c, cam, 1, c => { c.fillStyle = '#4a7a4a'; c.fillRect(-9000, HZ, 18000, 2400); for (let i = 0; i < 30; i++) { c.fillStyle = '#3a6a3a'; c.beginPath(); c.ellipse(-3000 + i * 220, HZ + 40 + (i % 3) * 30, 120, 50, 0, 0, Math.PI * 2); c.fill(); } }); return { base: '#4a7a4a' }; }
  layer(c, cam, .6, c => { const b = B(.6); for (let i = 0; i < 12; i++) { c.fillStyle = '#4a7a4a'; c.beginPath(); c.ellipse(-3000 + i * 520, b - 200, 300, 220, 0, 0, Math.PI * 2); c.fill(); } for (const x of [-2500, -900, 1300, 2800]) palmTree(c, x, b, 900, x);
    if (view === 'zoo') { c.fillStyle = '#6a9aa8'; c.beginPath(); c.ellipse(-400, b + 30, 1400, 120, 0, 0, Math.PI * 2); c.fill(); elephant(c, 1500, b, .8); giraffe(c, 2300, b, .9); } });
  layer(c, cam, 1, c => { c.fillStyle = '#c8b088'; c.fillRect(-9000, HZ, 18000, 2400); kSpecks(c, -4000, HZ, 8000, 600, 61, 300, 'rgba(90,70,40,.25)', 6);
    if (view === 'gate') { for (const d of [-700, 700]) { kRect(c, d - 110, -1100, 220, 1100, '#f4f0e6', 3); kRect(c, d - 140, -1160, 280, 70, '#e8e0d0', 3); } kRect(c, -700, -1120, 1400, 120, '#f4f0e6', 3); for (let k = 0; k < 9; k++) line(c, [-590 + k * 146, -1000, -590 + k * 146, -40], 10, '#4a4a4e'); line(c, [-590, -700, 590, -700], 10, '#4a4a4e'); line(c, [-590, -380, 590, -380], 10, '#4a4a4e'); }
    if (view === 'zoo') { hippo(c, -900, 60, .9, t); hippo(c, -200, 90, .7, t); } });
  return { base: '#c8b088' };
}
// ======================= K) courtroom (from behind) + Colorado concrete prison =======================
function courtSet(c, cam, t, o = {}) {
  roomShell(c, cam, -200, '#8a6a4a', floorWood('#5a4030'), (c, b, top) => {
    for (let i = -12; i < 12; i++) line(c, [i * 250, top, i * 250, b], 6, 'rgba(0,0,0,.15)');
    kRect(c, -900, b - 520, 1800, 520, '#6a4a30', 3); kRect(c, -960, b - 560, 1920, 50, '#7a5a3a', 3); c.beginPath(); c.roundRect(-110, b - 900, 220, 380, 30); fs(c, '#2a2026', 3); // judge's bench + empty high chair
    c.beginPath(); c.arc(0, top + 120, 110, 0, Math.PI * 2); fs(c, '#c8a060', 4); c.beginPath(); c.arc(0, top + 120, 80, 0, Math.PI * 2); fs(c, '#6a4a30', 3); line(c, [-50, top + 120, 50, top + 120], 8, '#c8a060'); line(c, [0, top + 70, 0, top + 170], 8, '#c8a060'); // emblem (scales symbol)
    for (const lx of [-1400, 1400]) sconce(c, lx, top + 200, 1.2, true);
  }, Object.assign({ wallH: 4 }, o));
  layer(c, cam, 1, c => { for (let r = 0; r < 2; r++) { const y = 80 + r * 180; kRect(c, -2400, y - 260, 4800, 60, '#6a4a30', 3); for (let i = 0; i < 9; i++) if (r || i % 3) person(c, { who: ['friend1', 'mother', 'worker', 'wife'][i % 4], x: -2000 + i * 500 + r * 120, y: y - 200, k: .3, sil: 1, top: '#1e1a1e', alpha: .95 }); } });
  return { base: '#5a4030' };
}
function coloradoSet(c, cam, t, o = {}) {
  const HZ = -200, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8aa0b8'); g.addColorStop(1, '#e4e8ec'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  layer(c, cam, .08, c => { const b = B(.08); c.fillStyle = '#7a8a9a'; c.beginPath(); c.moveTo(-6000, b); for (let x = -6000; x <= 6000; x += 300) c.lineTo(x, b - 500 - Math.abs(Math.sin(x * .0011)) * 700); c.lineTo(6000, b); c.fill(); c.fillStyle = '#f4f6f8'; for (let x = -6000; x <= 6000; x += 300) { const y = b - 500 - Math.abs(Math.sin(x * .0011)) * 700; c.beginPath(); c.moveTo(x - 80, y + 80); c.lineTo(x, y); c.lineTo(x + 80, y + 80); c.fill(); } });
  haze(c, '230,236,242', .3);
  layer(c, cam, .5, c => { const b = B(.5); for (let i = 0; i < 30; i++) cypress(c, -4000 + i * 280, b, 300 + rnd(i) * 150, '#3a4a3a');
    kRect(c, -1500, b - 500, 3000, 500, '#b8b4ac', 3); for (let i = 0; i < 24; i++) kRect(c, -1440 + i * 124, b - 400, 14, 120, '#2a2c30', 1); kRect(c, -600, b - 760, 1200, 260, '#a8a49c', 3); for (let i = 0; i < 10; i++) kRect(c, -560 + i * 118, b - 700, 10, 100, '#2a2c30', 1);
    for (let k = 0; k < 2; k++) { line(c, [-2200, b + 40 + k * 60, 2200, b + 40 + k * 60], 6, '#8a8a8a'); for (let i = 0; i < 45; i++) line(c, [-2200 + i * 100, b + 40 + k * 60, -2200 + i * 100, b - 80 + k * 60], 4, '#8a8a8a'); }
    kRect(c, 1800, b - 900, 160, 900, '#a8a49c', 3); kRect(c, 1740, b - 1000, 280, 120, '#8a8680', 3); });
  layer(c, cam, 1, c => { c.fillStyle = '#c8ccd0'; c.fillRect(-9000, HZ, 18000, 2400); kSpecks(c, -4000, HZ, 8000, 600, 71, 300, 'rgba(255,255,255,.6)', 6); });
  return { base: '#c8ccd0' };
}
// ======================= L) raid at blue-grey dawn: street, hallway, stairs =======================
function raidStreetSet(c, cam, t, o = {}) {
  const HZ = -200, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5a6a86'); g.addColorStop(1, '#a8b4c4'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  layer(c, cam, .6, c => { const b = B(.6), top = b - 2.6 * KM; for (let i = 0; i < 4; i++) cypress(c, -2600 + i * 1500, top + 60, 1000, '#2e4038'); kRect(c, -4200, top, 8400, b - top + 40, '#b8b8bc', 2.5); kRect(c, -4220, top - 26, 8440, 30, '#c8c8cc', 2.5);
    const gx = -500; kRect(c, gx, top - 10, 1100, b - top + 50, '#3a3c40', 3); for (let i = 1; i < 22; i++) line(c, [gx, top - 10 + i * 30, gx + 1100, top - 10 + i * 30], 3, '#26282c'); secCam(c, gx + 1140, top - 40, 1, t, 1.1); });
  layer(c, cam, 1, c => { c.fillStyle = '#4a4e56'; c.fillRect(-9000, HZ, 18000, 2400); c.save(); c.globalCompositeOperation = 'screen'; for (let i = 0; i < 20; i++) { c.fillStyle = 'rgba(120,150,255,.06)'; c.beginPath(); c.ellipse(-3000 + i * 320, HZ + 160, 200, 30, 0, 0, Math.PI * 2); c.fill(); } c.restore();
    const n = o.n ?? 4; for (let i = 0; i < n; i++) { const x = (o.x0 ?? -2400) + i * 1300; if (i % 2) panelVan(c, x, { color: '#2a3038' }); else suv(c, x, { color: '#20242a' }); const on = Math.sin(t * 9 + i * 2) > 0; circle(c, x + (i % 2 ? 380 : 300), i % 2 ? -510 : -400, 20); c.fillStyle = on ? '#3a6aff' : '#14204a'; c.fill(); if (on) bloom(c, x + (i % 2 ? 380 : 300), i % 2 ? -510 : -400, 260, '80,120,255', .6); }
    for (let i = 0; i < (o.team ?? 5); i++) person(c, { who: 'polizei', x: (o.teamX ?? -1500) + i * 260 + Math.sin(t * 6 + i) * 6, y: 120, k: .26, sil: 1, top: '#161a20', bob: -Math.abs(Math.sin(t * 7 + i)) * 20 }); });
  return { base: '#4a4e56', tint: 'rgba(60,80,130,.12)' };
}
function hallwaySet(c, cam, t, o = {}) {
  roomShell(c, cam, -220, '#c8c4bc', (c, HZ) => marbleBG(c, -9000, HZ, 18000, 2400, '#b8b4ae', 41), (c, b, top) => {
    // broken front door on the left, light from outside, stairs on the right
    kRect(c, -1900, b - 560, 340, 560, '#d8d8e8', 2); c.save(); c.translate(-1560, b); c.rotate(-.5); kRect(c, -340, -560, 340, 560, '#3a3c40', 3); c.restore(); for (let i = 0; i < 8; i++) { c.save(); c.translate(-1500 + i * 40, b - 20); c.rotate(i); kRect(c, -12, -4, 24, 8, '#b8a888', 1); c.restore(); }
    c.save(); c.globalCompositeOperation = 'screen'; const on = Math.sin(t * 9) > 0; c.fillStyle = on ? 'rgba(90,120,255,.25)' : 'rgba(140,160,220,.12)'; c.beginPath(); c.moveTo(-1900, b - 560); c.lineTo(-1560, b - 560); c.lineTo(-600, b + 400); c.lineTo(-1900, b + 400); c.fill(); c.restore();
    framedArt(c, -800, top + 120, 360, 240, 'abstract', 9, '#b8954a'); sconce(c, -950, top + 300, 1, true); sconce(c, -270, top + 300, 1, true);
    const sx = o.stairX ?? 600; for (let i = 0; i < 12; i++) kRect(c, sx + i * 90, b - (i + 1) * 70, 600 - i * 0, 70, '#e8e4dc', 2); for (let i = 0; i < 12; i++) line(c, [sx + 40 + i * 90, b - (i + 1) * 70, sx + 40 + i * 90, b - (i + 1) * 70 - 200], 6, '#2a2c30'); line(c, [sx + 40, b - 270, sx + 40 + 11 * 90, b - 12 * 70 - 200], 10, '#2a2c30');
    if (o.kids) { const ky = b - 12 * 70, kx = sx + 11 * 90 + 120; person(c, { who: 'kid1', x: kx, y: ky, k: .25, expr: { lid: 0, browUp: .6, mouth: 'flat' } }); person(c, { who: 'kid2', x: kx + 170, y: ky, k: .25, expr: { lid: 0, browUp: .8, mouth: 'o' } }); }
    if (o.wife) person(c, { who: 'wife', x: sx - 250, y: b, k: .25, expr: { lid: .2, browUp: 1, mouth: 'o' }, arms: { l: { a: .3, b: -2.1 }, r: { a: .3, b: -2.1 } } });
  }, Object.assign({ wallH: 3.6 }, o));
  return { base: '#b8b4ae', tint: 'rgba(60,80,130,.14)' };
}
// ======================= M) German prison cell =======================
function cellSet(c, cam, t, o = {}) {
  const HZ = -200, B = p => layerBase(cam, HZ, p), sun = o.sun ?? .5;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#8a8c88'; c.fillRect(0, 0, W, H);
  layer(c, cam, .85, c => { const b = B(.85), top = b - 2.7 * KM; c.fillStyle = '#c8c6bc'; c.fillRect(-6000, top - 600, 12000, b - top + 600); c.fillStyle = '#9aa294'; c.fillRect(-6000, b - 260, 12000, 260); line(c, [-6000, b - 260, 6000, b - 260], 6, '#7a8274'); kSpecks(c, -3000, top, 6000, b - top, 7, 300, 'rgba(90,90,80,.12)', 8);
    const wx = o.winX ?? 300; kRect(c, wx - 160, top + 100, 320, 220, '#e8f0f4', 4); c.save(); c.beginPath(); c.rect(wx - 150, top + 110, 300, 200); c.clip(); const sg = c.createLinearGradient(0, top + 110, 0, top + 310); sg.addColorStop(0, '#9cc4e4'); sg.addColorStop(1, '#e8f0f4'); c.fillStyle = sg; c.fillRect(wx - 150, top + 110, 300, 200); c.fillStyle = '#8a9aa0'; c.fillRect(wx - 150, top + 260, 300, 50); c.restore();
    for (let i = 0; i < 6; i++) line(c, [wx - 150 + i * 60, top + 100, wx - 150 + i * 60, top + 320], 10, '#3a3c40'); line(c, [wx - 160, top + 210, wx + 160, top + 210], 10, '#3a3c40'); bloom(c, wx, top + 210, 360, '255,240,200', .45);
    // kids' drawing taped to the wall
    const dx = o.drawX ?? -500; c.save(); c.translate(dx, top + 250); c.rotate(-.05); kRect(c, 0, 0, 200, 150, '#fbfaf4', 2); c.fillStyle = '#e05a4a'; c.beginPath(); c.moveTo(40, 110); c.lineTo(100, 50); c.lineTo(160, 110); c.fill(); kRect(c, 60, 110, 80, 30, '#f2c531', 1); circle(c, 170, 30, 16); c.fillStyle = '#f2c531'; c.fill(); for (const fx of [70, 120]) { circle(c, fx, 125, 8); c.fillStyle = '#4a8ad0'; c.fill(); } kRect(c, 80, -8, 40, 16, 'rgba(240,230,200,.8)', 0); c.restore();
    // bunk bed, steel table, sink/toilet, door with hatch
    const bx = o.bunkX ?? -1300; for (const d of [-300, 300]) kRect(c, bx + d - 14, b - 620, 28, 620, '#5a5e62', 2); for (const y of [b - 150, b - 480]) { kRect(c, bx - 320, y - 30, 640, 30, '#5a5e62', 2); c.beginPath(); c.roundRect(bx - 310, y - 80, 620, 54, 14); fs(c, '#6a7a8a', 2); c.beginPath(); c.roundRect(bx - 300, y - 110, 160, 40, 14); fs(c, '#e8e4dc', 2); }
    if (!o.bare) {
    kRect(c, 900, b - 260, 400, 20, '#9aa0a6', 2.5); kRect(c, 1080, b - 240, 30, 240, '#7a8086', 2); kRect(c, 1500, b - 300, 160, 140, '#c8ccd0', 2.5); c.beginPath(); c.ellipse(1580, b - 80, 70, 40, 0, 0, Math.PI * 2); fs(c, '#c8ccd0', 2.5);
    kRect(c, 2000, b - 640, 400, 640, '#6a6e72', 3); kRect(c, 2120, b - 420, 160, 60, '#3a3c40', 2); for (let k = 0; k < 6; k++) circle(c, 2030, b - 600 + k * 110, 8), c.fillStyle = '#4a4e52', c.fill(); }
  });
  layer(c, cam, 1, c => { c.fillStyle = '#9a9a92'; c.fillRect(-9000, HZ, 18000, 2400); kSpecks(c, -4000, HZ, 8000, 600, 81, 300, 'rgba(60,60,50,.15)', 5);
    const sx = (o.winX ?? 300) + 200 + sun * 500; c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,240,200,.55)'; c.beginPath(); c.moveTo(sx, HZ + 60); c.lineTo(sx + 300, HZ + 60); c.lineTo(sx + 380, HZ + 260); c.lineTo(sx + 40, HZ + 260); c.closePath(); c.fill(); c.restore();
    for (let i = 1; i < 5; i++) line(c, [sx + i * 60 + i * 8, HZ + 60, sx + 40 + i * 68, HZ + 260], 8, 'rgba(60,60,60,.5)'); });
  return { base: '#9a9a92' };
}
