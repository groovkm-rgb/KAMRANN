// KARTELL section 01 insert sets: garage, bedroom, money counter, eye ECU, CCTV, cup, mirror, lock, phone, SIM.
// Screen-space helpers draw full frames (1920x1080); world sets follow places.js conventions.
const S01 = {};
function marbleBG(c, x, y, w, h, base = '#e9e7e3', seed = 1) {
  c.fillStyle = base; c.fillRect(x, y, w, h);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  for (let i = 0; i < 14; i++) { c.beginPath(); let px = x + rnd(seed + i) * w, py = y; c.moveTo(px, py); for (let k = 0; k < 12; k++) { px += (rnd(seed + i * 13 + k) - .45) * 90; py += h / 12; c.lineTo(px, py); } c.lineWidth = 1 + rnd(i + seed) * 3; c.strokeStyle = `rgba(120,118,125,${.12 + rnd(i) * .15})`; c.stroke(); }
  c.restore();
}
// ---------- garage interior with three cars ----------
function garageSet(c, cam, t, o = {}) {
  const HZ = -260, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#d9dadc'; c.fillRect(0, 0, W, H);
  layer(c, cam, .6, c => { const b = B(.6), top = b - 3.2 * KM;
    c.fillStyle = '#eceae6'; c.fillRect(-8000, top, 16000, b - top); c.fillStyle = '#c9c7c2'; c.fillRect(-8000, top - 600, 16000, 600);
    for (let i = -8; i < 8; i++) { const x = i * 900; kRect(c, x, top - 30, 600, 18, '#ffffff', 1.5); bloom(c, x + 300, top - 10, 420, '235,245,255', .45); }
    // tool cabinet, wallbox charger, wall monitor with camera feeds, extinguisher, shelf, camera
    kRect(c, -1350, b - 430, 520, 430, '#b8201e', 3); for (let r = 0; r < 5; r++) { kRect(c, -1335, b - 415 + r * 82, 490, 70, '#a01a18', 1.5); kRect(c, -1130, b - 390 + r * 82, 90, 10, '#d8d8dc', 1); }
    kRect(c, -1380, b - 640, 600, 16, '#7a7e84', 2); for (let i = 0; i < 6; i++) kRect(c, -1360 + i * 95, b - 720, 70, 80, ['#2f6fb0', '#e8c23a', '#3a3c40'][i % 3], 1.5);
    kRect(c, -560, b - 420, 100, 150, '#2a2c30', 2.5); circle(c, -510, b - 360, 14); c.fillStyle = '#3fd07a'; c.fill(); line(c, [-510, b - 270, -510, b - 150, -400, b - 110], 8, '#1d1e20');
    kRect(c, 120, b - 600, 380, 220, '#18191c', 3); for (let k = 0; k < 4; k++) { c.fillStyle = ['#59646a', '#6a7266', '#5e6670', '#727a7c'][k]; c.fillRect(132 + (k % 2) * 180, b - 588 + Math.floor(k / 2) * 102, 172, 96); }
    c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(140 + 180 + ((t * 40) % 140), b - 520, 14, 8);
    kRect(c, 760, b - 240, 70, 200, '#c8201e', 2.5); kRect(c, 772, b - 276, 46, 36, '#2a2a2e', 2);
    secCam(c, 1150, b - 640, -1, t, 1);
    for (let i = 0; i < 3; i++) kRect(c, -260 + i * 130, b - 120, 110, 120, '#3a3c40', 2); // tyre stack covers
    c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(-8000, b - 40, 16000, 40);
  });
  layer(c, cam, 1, c => { const g = c.createLinearGradient(0, HZ, 0, HZ + 1200); g.addColorStop(0, '#9fa2a6'); g.addColorStop(1, '#6f7276'); c.fillStyle = g; c.fillRect(-9000, HZ, 18000, 3000);
    c.save(); c.globalCompositeOperation = 'screen'; for (let i = -8; i < 8; i++) { c.fillStyle = 'rgba(235,245,255,.18)'; c.fillRect(i * 900 + 100, HZ + 30, 420, 14); } c.restore();
    for (const x of o.stalls || []) line(c, [x, HZ, x + 60, 600], 10, 'rgba(240,240,236,.8)');
  });
  return { base: '#6f7276' };
}
// ---------- extreme close-up of an eye with the CCTV monitor reflected ----------
function eyeShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#f2f1ee'; c.fillRect(0, 0, W, H);
  const k = 7.5 + lt * .6, ex = W / 2, ey = H / 2 + 20;
  drawNoahHead(c, ex + 92 * k, ey - (25 - 1240 + 1240) * k, k, { lid: .12, look: 0 });
  // reflection inside the pupil: four camera tiles, curved
  c.save(); c.beginPath(); c.ellipse(ex, ey, 23 * k * .95, 34 * k * .95, 0, 0, Math.PI * 2); c.clip();
  c.translate(ex, ey); c.scale(1.9, 2.1); c.globalAlpha = .55;
  for (let i = 0; i < 4; i++) { c.fillStyle = ['#6f7a86', '#808a8e', '#6a7480', '#86909a'][i]; c.fillRect(-70 + (i % 2) * 72, -60 + Math.floor(i / 2) * 58, 66, 52); }
  c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(-60 + ((lt * 30) % 50), -20, 12, 6);
  c.globalAlpha = 1; c.restore();
  c.beginPath(); c.ellipse(ex - 40, ey - 60, 22, 30, -.4, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill();
  const v = c.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1100); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,10,20,.5)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}
// ---------- CCTV feed: car slowing down outside the gate (b/w, no timestamp digits) ----------
const _cctv = document.createElement('canvas'); _cctv.width = W; _cctv.height = H;
function cctvShot(c, lt, t) {
  const q = _cctv.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0);
  q.fillStyle = '#9aa0a4'; q.fillRect(0, 0, W, H);
  q.fillStyle = '#c4c4c0'; q.fillRect(0, 0, W, 420); // wall across the street
  for (let i = 0; i < 9; i++) { q.fillStyle = '#7e8a78'; q.beginPath(); q.ellipse(120 + i * 220, 380, 140, 90, 0, Math.PI, 0); q.fill(); }
  q.fillStyle = '#5e6266'; q.fillRect(0, 520, W, 380); q.fillStyle = '#d8d8d2'; for (let i = 0; i < 10; i++) q.fillRect(i * 220 + 40, 700, 120, 12);
  q.fillStyle = '#b4b2ac'; q.fillRect(0, 900, W, 180);
  // the car: eases to a crawl
  const x = 2300 - 1500 * easeOut(clamp(lt / 1.5)) - lt * 40;
  q.save(); q.translate(x, 860); q.scale(.42, .42); suv(q, 0, { color: '#2a2a2e', s: -1 }); q.restore();
  c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'grayscale(1) contrast(1.25) brightness(1.05)'; c.drawImage(_cctv, 0, 0); c.filter = 'none';
  for (let y = 0; y < H; y += 4) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, y, W, 2); }
  kSpecks(c, 0, 0, W, H, Math.floor(t * 30), 500, 'rgba(255,255,255,.08)', 2);
  const v = c.createRadialGradient(W / 2, H / 2, 400, W / 2, H / 2, 1100); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  c.font = "700 40px 'Courier 10 Pitch', monospace"; c.fillStyle = '#f4f4f0'; c.textAlign = 'left'; c.fillText('LIVE · EINFAHRT', 70, 90);
  if (Math.sin(t * 6) > 0) { circle(c, 1800, 78, 14); c.fillStyle = '#e02020'; c.fill(); } c.fillText('REC', 1690, 92);
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; for (const [x0, y0, dx, dy] of [[40, 40, 1, 1], [W - 40, 40, -1, 1], [40, H - 40, 1, -1], [W - 40, H - 40, -1, -1]]) { c.beginPath(); c.moveTo(x0, y0 + dy * 60); c.lineTo(x0, y0); c.lineTo(x0 + dx * 60, y0); c.stroke(); }
}
// ---------- rear-view mirror: a car follows ----------
function mirrorShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#cfe3ef'); g.addColorStop(1, '#f2efe6'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = '#20232a'; c.fillRect(0, 0, W, 170); c.beginPath(); c.moveTo(0, 170); c.quadraticCurveTo(W / 2, 260, W, 170); c.lineTo(W, 0); c.lineTo(0, 0); c.fill();
  for (let i = 0; i < 5; i++) { c.fillStyle = '#8fa88a'; c.beginPath(); c.ellipse(200 + i * 400 - (t * 300) % 400, 760, 220, 120, 0, Math.PI, 0); c.fill(); }
  c.fillStyle = '#6d7176'; c.fillRect(0, 760, W, 320);
  const mx = 960, my = 330 + Math.sin(t * 9) * 3; line(c, [mx, 170, mx, my - 110], 26, '#1d1f24');
  c.save(); c.beginPath(); c.roundRect(mx - 420, my - 120, 840, 240, 70); c.fillStyle = '#15171b'; c.fill(); c.clip();
  c.beginPath(); c.roundRect(mx - 400, my - 104, 800, 208, 56); c.clip(); const g2 = c.createLinearGradient(0, my - 104, 0, my + 104); g2.addColorStop(0, '#b9d0dc'); g2.addColorStop(1, '#7a7e82'); c.fillStyle = g2; c.fillRect(mx - 400, my - 104, 800, 208);
  c.fillStyle = '#5c6064'; c.beginPath(); c.moveTo(mx - 400, my + 104); c.lineTo(mx - 60, my + 10); c.lineTo(mx + 60, my + 10); c.lineTo(mx + 400, my + 104); c.fill();
  const s = .17 + lt * .04; c.save(); c.translate(mx, my + 60); c.scale(s, s); kRect(c, -500, -380, 1000, 380, '#2a2c30', 6); kRect(c, -380, -640, 760, 260, '#1a1c20', 6); kRect(c, -330, -610, 660, 200, '#4a5a66', 4);
  for (const d of [-380, 380]) { ell(c, d, -230, 90, 40); fs(c, '#fff6d8', 6); bloom(c, d, -230, 260, '255,246,210', .6); } c.restore();
  c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(mx - 300, my - 104); c.lineTo(mx - 220, my - 104); c.lineTo(mx - 360, my + 104); c.lineTo(mx - 440, my + 104); c.fill();
  c.restore();
  // Noah's eyes in the bottom of the mirror frame edge
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, H - 120, W, 120); kRect(c, 0, H - 140, W, 30, '#1d1f24', 0);
}
// ---------- phone face down, vibrating on marble ----------
function phoneShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); marbleBG(c, 0, 0, W, H, '#e4e2de', 11); bloom(c, 1500, 100, 900, '255,240,210', .3);
  const vib = (Math.sin(t * 80) * 4) * (Math.sin(lt * 6) > -.2 ? 1 : 0);
  c.save(); c.translate(960 + vib, 560); c.rotate(.12 + vib * .002); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.roundRect(-190, -370, 400, 760, 60); c.fill();
  c.beginPath(); c.roundRect(-200, -380, 400, 760, 60); fs(c, '#1e2026', 6); c.beginPath(); c.roundRect(-150, -330, 150, 190, 40); fs(c, '#2c2f36', 4); for (const [x, y] of [[-110, -290], [-40, -290], [-110, -200]]) { circle(c, x, y, 26); fs(c, '#0e1014', 4); }
  c.restore();
  if (Math.sin(lt * 6) > -.2) for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(960 + s * (260 + k * 40), 560, 60 + k * 40, s > 0 ? -.5 : Math.PI - .5, s > 0 ? .5 : Math.PI + .5); c.lineWidth = 6; c.strokeStyle = `rgba(40,40,50,${.35 - k * .1})`; c.stroke(); }
  c.font = '700 54px Inter'; c.fillStyle = 'rgba(30,30,40,.0)'; c.fillText('', 0, 0);
}
// ---------- bedroom: bed seen from its foot, marble wall, closed curtains with a slice of noon light ----------
function bedroomSet(c, cam, t, o = {}) {
  const HZ = -300, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#6d6a66'; c.fillRect(0, 0, W, H);
  layer(c, cam, .8, c => { const b = B(.8), top = b - 3.2 * KM, gx = o.gapX ?? 900, bx = o.bedX ?? -500;
    c.fillStyle = '#cbc6be'; c.fillRect(-6000, top - 400, 12000, b - top + 400); // plaster
    c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(-6000, top - 400, 12000, 60); line(c, [-6000, top - 340, 6000, top - 340], 4, '#b8b2a8'); // ceiling cove
    marbleBG(c, bx - 520, top + 40, 1040, b - top - 40, '#55585e', 21); kRect(c, bx - 520, top + 40, 1040, b - top - 40, null, 3); // marble slab behind the bed
    // abstract canvas
    kRect(c, -2050, top + 260, 420, 300, '#efebe3', 3); c.fillStyle = '#9a8a76'; c.fillRect(-2010, top + 300, 160, 220); c.fillStyle = '#c8b89c'; c.fillRect(-1830, top + 380, 160, 140); line(c, [-2010, top + 470, -1690, top + 330], 6, '#4a4440');
    // wardrobe
    kRect(c, -3100, top + 40, 820, b - top - 40, '#e8e3da', 3); for (let k = 1; k < 4; k++) line(c, [-3100 + k * 205, top + 40, -3100 + k * 205, b], 3, '#c8c2b8'); for (let k = 0; k < 4; k++) kRect(c, -3010 + k * 205, top + 520, 8, 120, '#9a948a', 1);
    // smoke detector + AC vent
    circle(c, -800, top - 300, 26); fs(c, '#f4f2ee', 2); kRect(c, 1500, top - 260, 380, 60, '#e8e4dc', 2); for (let k = 0; k < 10; k++) line(c, [1510 + k * 36, top - 250, 1510 + k * 36, top - 210], 3, '#b8b2a8');
    // curtains (closed) with a gap where noon light comes through
    for (let i = 0; i < 40; i++) { const x = gx - 1000 + i * 52 + (i >= 20 ? 26 : 0); c.fillStyle = i % 2 ? '#8f8678' : '#7f776a'; c.fillRect(x, top - 300, 54, b - top + 300); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x + 40, top - 300, 14, b - top + 300); }
    c.fillStyle = '#fff6dc'; c.fillRect(gx + 40, top - 300, 26, b - top + 300); bloom(c, gx + 53, top + 300, 340, '255,240,200', .55);
    kRect(c, gx - 1040, top - 330, 2140, 30, '#3a3632', 2);
    c.save(); c.translate(bx, b); c.scale(.5, .5); c.translate(-bx, -b); // furniture drawn at 2x, real size: bed ~2,2 m wide
    // nightstands + lamps (off)
    for (const s of [-1, 1]) { const nx = bx + s * 760; kRect(c, nx - 170, b - 300, 340, 300, '#3e352e', 3); kRect(c, nx - 150, b - 200, 300, 10, '#2a2420', 1); kRect(c, nx - 20, b - 18, 40, 18, '#2a2420', 0);
      line(c, [nx, b - 300, nx, b - 520], 6); c.beginPath(); c.moveTo(nx - 80, b - 520); c.lineTo(nx + 80, b - 520); c.lineTo(nx + 60, b - 640); c.lineTo(nx - 60, b - 640); c.closePath(); fs(c, '#e9e2d2', 2.5); }
    kRect(c, bx + 640, b - 318, 120, 18, '#f8f6ee', 2); line(c, [bx + 650, b - 322, bx + 750, b - 330], 4, '#2a4ab0'); // notepad + pen on the right nightstand
    kRect(c, bx - 860, b - 324, 70, 24, '#2b2b30', 1.5); // phone charger, no phone
    // bed from its foot: tall upholstered headboard, pillows, tight duvet (never slept in), folded throw
    c.beginPath(); c.roundRect(bx - 520, b - 900, 1040, 640, 24); fs(c, '#8a8076', 3); for (let k = 1; k < 9; k++) line(c, [bx - 520 + k * 115, b - 890, bx - 520 + k * 115, b - 270], 3, 'rgba(0,0,0,.18)');
    for (let i = 0; i < 4; i++) { c.beginPath(); c.roundRect(bx - 470 + i * 235, b - 520 - (i % 3 ? 0 : 10), 220, 160, 50); fs(c, i === 1 || i === 2 ? '#f4f2ee' : '#dcd6cc', 3); }
    c.beginPath(); c.moveTo(bx - 500, b - 380); c.lineTo(bx + 500, b - 380); c.lineTo(bx + 560, b - 250); c.lineTo(bx - 560, b - 250); c.closePath(); fs(c, '#f2f0ec', 3); // duvet top, perfectly flat
    c.beginPath(); c.rect(bx - 560, b - 250, 1120, 190); fs(c, '#ebe8e2', 3); line(c, [bx - 560, b - 236, bx + 560, b - 236], 3, 'rgba(0,0,0,.08)'); // duvet front
    c.beginPath(); c.moveTo(bx - 530, b - 300); c.lineTo(bx + 530, b - 300); c.lineTo(bx + 545, b - 250); c.lineTo(bx - 545, b - 250); c.closePath(); fs(c, '#5a5f6a', 2.5); // folded throw
    kRect(c, bx - 560, b - 60, 1120, 60, '#3e352e', 3); // base
    // bench at the foot + rug
    c.fillStyle = '#9a948c'; c.fillRect(bx - 900, b - 6, 1800, 30); for (let k = 0; k < 18; k++) line(c, [bx - 880 + k * 100, b - 4, bx - 840 + k * 100, b + 22], 3, 'rgba(60,55,50,.3)');
    c.restore();
  });
  layer(c, cam, 1, c => { marbleBG(c, -9000, HZ, 18000, 2000, '#8e8a86', 9); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-9000, HZ, 18000, 60);
    const bx = (o.bedX ?? -500) * .9; c.fillStyle = 'rgba(60,56,52,.35)'; c.beginPath(); c.ellipse(bx + 200, HZ + 140, 900, 120, 0, 0, Math.PI * 2); c.fill(); // rug
    const cx = (o.gapX ?? 900) * .95; c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,240,200,.5)'; c.beginPath(); c.moveTo(cx - 10, HZ); c.lineTo(cx + 30, HZ); c.lineTo(cx + 900, 900); c.lineTo(cx + 600, 900); c.closePath(); c.fill(); c.restore(); });
  return { base: '#8e8a86' };
}
// ---------- banknote counter on a dark desk (front view, faceless notes, no hands) ----------
function bill(c, x, y, w, h, col = '#a7b497') { c.beginPath(); c.rect(x, y, w, h); fs(c, col, 1.5, 'rgba(50,60,40,.8)'); c.strokeStyle = 'rgba(60,75,50,.5)'; c.lineWidth = 2; c.strokeRect(x + 6, y + 4, w - 12, h - 8); }
function bundle(c, x, y, w = 300, n = 16) { for (let i = 0; i < n; i++) { c.beginPath(); c.rect(x, y - i * 6, w, 6); fs(c, i % 2 ? '#a7b497' : '#9caa8c', 1, 'rgba(50,60,40,.6)'); } kRect(c, x + w * .4, y - n * 6 + 6, w * .2, n * 6, '#e9dcbc', 1.5); }
function moneyCounterShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  // walnut panel wall + closed blinds with slivers of noon light
  c.fillStyle = '#3a2a20'; c.fillRect(0, 0, W, 620); for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.15)' : 'rgba(255,220,180,.04)'; c.fillRect(i * 170, 0, 160, 620); line(c, [i * 170, 0, i * 170, 620], 3, '#24190f'); }
  kRect(c, 1240, 60, 560, 440, '#1e1a16', 3); for (let k = 0; k < 22; k++) { c.fillStyle = k % 2 ? '#d8cdb8' : '#c4b8a0'; c.fillRect(1250, 70 + k * 19.5, 540, 15); c.fillStyle = 'rgba(255,246,220,.8)'; c.fillRect(1250, 85 + k * 19.5, 540, 3); }
  const z = 1 + lt * .035; c.save(); c.translate(W / 2, H * .6); c.scale(z, z); c.translate(-W / 2, -H * .6);
  // desk
  const dg = c.createLinearGradient(0, 600, 0, H); dg.addColorStop(0, '#5a4030'); dg.addColorStop(1, '#2e2018'); c.fillStyle = dg; c.fillRect(-200, 600, W + 400, 600); for (let i = 0; i < 10; i++) line(c, [-200, 640 + i * 46 + Math.sin(i) * 8, W + 200, 650 + i * 46], 2, 'rgba(0,0,0,.18)');
  line(c, [-200, 600, W + 200, 600], 6, '#24190f');
  bloom(c, 760, 560, 900, '255,214,150', .35);
  // bundles: neat pyramid on the left, one loose stack
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3 - r; k++) bundle(c, 120 + k * 230 + r * 115, 860 - r * 100, 210, 16);
  bundle(c, 1560, 880, 220, 12); kRect(c, 1580, 760, 60, 8, '#b85a3a', 0);
  // machine body
  const mx = 960, my = 880;
  c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(mx, my + 10, 380, 40, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.moveTo(mx - 330, my); c.lineTo(mx + 330, my); c.lineTo(mx + 300, my - 330); c.quadraticCurveTo(mx, my - 370, mx - 300, my - 330); c.closePath(); fs(c, '#d9dbde', 4);
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(mx - 330, my - 60, 660, 60);
  // rear hopper (slanted) with a block of notes that shrinks
  const left = 1 - clamp(lt / 2.6) * .8; c.beginPath(); c.moveTo(mx - 230, my - 340); c.lineTo(mx + 230, my - 340); c.lineTo(mx + 200, my - 470); c.lineTo(mx - 200, my - 470); c.closePath(); fs(c, '#2a2c30', 4);
  for (let i = 0; i < Math.round(18 * left); i++) bill(c, mx - 190 + i * .5, my - 380 - i * 5, 380, 7);
  // display (glowing bars, no digits) + buttons
  kRect(c, mx - 240, my - 300, 300, 90, '#0e1a14', 3); for (let i = 0; i < 6; i++) { const on = (Math.floor(lt * 8) + i) % 6 < 4; c.fillStyle = on ? '#5af07a' : '#1e3a26'; c.fillRect(mx - 220 + i * 46, my - 268, 34, 26); } bloom(c, mx - 90, my - 255, 160, '90,240,120', .3);
  for (let i = 0; i < 4; i++) { c.beginPath(); c.roundRect(mx + 100 + (i % 2) * 90, my - 300 + Math.floor(i / 2) * 48, 70, 36, 10); fs(c, ['#3a3d44', '#3a3d44', '#c8302a', '#2f6fb0'][i], 2.5); }
  // front slot with riffling blur + stacker pocket filling up
  kRect(c, mx - 230, my - 190, 460, 40, '#18191c', 3); for (let i = 0; i < 8; i++) { const k = (lt * 7 + i / 8) % 1; line(c, [mx - 220, my - 186 + k * 32, mx + 220, my - 186 + k * 32], 3, `rgba(170,185,150,${.8 - k * .6})`); }
  c.beginPath(); c.moveTo(mx - 240, my - 140); c.lineTo(mx + 240, my - 140); c.lineTo(mx + 260, my - 20); c.lineTo(mx - 260, my - 20); c.closePath(); fs(c, '#2a2c30', 3);
  for (let i = 0; i < Math.round(3 + 15 * clamp(lt / 2.6)); i++) bill(c, mx - 200, my - 32 - i * 5, 400, 7);
  c.restore();
  const v = c.createRadialGradient(W * .45, H * .6, 300, W / 2, H / 2, 1100); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,5,0,.6)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}
// ---------- close-up: Noah's face lit by the monitor wall, feeds reflected in his pupils ----------
function faceShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#1c1f26'; c.fillRect(0, 0, W, H);
  // monitor wall on the right
  for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) { const x = 1420 + k * 260, y = 120 + r * 250; kRect(c, x, y, 240, 220, '#0b0c0f', 4); c.fillStyle = ['#6f7a86', '#808a8e', '#6a7480', '#86909a', '#757f88', '#7c8690'][r * 2 + k]; c.fillRect(x + 12, y + 12, 216, 196); for (let q = 0; q < 6; q++) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x + 12, y + 12 + q * 33, 216, 14); } }
  c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(1440 + ((lt * 60) % 180), 300, 22, 12);
  bloom(c, 1600, 520, 900, '170,200,255', .35);
  const k = 1.0 + lt * .06, hx = 760, hy = 520;
  drawNoahK(c, { x: hx, y: hy - NOAH.HEAD.y * k, k, ink: 1.4, outfit: 'boss', expr: { lid: .1, look: .7, browUp: .3, mouth: 'flat' } });
  for (const s of [-1, 1]) { const ex = hx + (s * 92 + .7 * 6) * k, ey = hy + 25 * k; c.save(); c.beginPath(); c.ellipse(ex, ey, 21 * k, 31 * k, 0, 0, Math.PI * 2); c.clip(); c.globalAlpha = .75;
    for (let q = 0; q < 6; q++) { c.fillStyle = '#9aa6b4'; c.fillRect(ex - 2 * k + (q % 2) * 9 * k, ey - 16 * k + Math.floor(q / 2) * 9 * k, 8 * k, 7.5 * k); } c.restore();
    c.beginPath(); c.arc(ex - 8 * k, ey - 14 * k, 5 * k, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); }
  c.save(); c.globalCompositeOperation = 'soft-light'; const g = c.createLinearGradient(hx - 300, 0, hx + 400, 0); g.addColorStop(0, 'rgba(0,0,30,.5)'); g.addColorStop(1, 'rgba(150,190,255,.6)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
// ---------- coffee cup trembling on its saucer (no hands) ----------
function cupShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#dfe7ec'); g.addColorStop(1, '#a9b6bf'); c.fillStyle = g; c.fillRect(0, 0, W, 640);
  for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(150 + i * 320, 0, 130, 640); line(c, [150 + i * 320, 0, 150 + i * 320, 640], 6, '#4a4440'); }
  marbleBG(c, 0, 640, W, 440, '#ece9e4', 17); line(c, [0, 640, W, 640], 4, '#a8a4a0');
  const sh = Math.sin(t * 55) * 2.5 * clamp(lt / .3);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(960, 880, 330, 50, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(960, 860, 320, 60, 0, 0, Math.PI * 2); fs(c, '#f6f4f0', 6); c.beginPath(); c.ellipse(960, 852, 170, 30, 0, 0, Math.PI * 2); fs(c, '#e4e0d8', 3);
  c.save(); c.translate(960 + sh, 850); c.rotate(sh * .004);
  c.beginPath(); c.moveTo(-170, -380); c.lineTo(170, -380); c.lineTo(140, -20); c.quadraticCurveTo(0, 10, -140, -20); c.closePath(); fs(c, '#f3f0ea', 7);
  c.beginPath(); c.arc(200, -230, 80, -1.2, 1.2); c.lineWidth = 34; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 20; c.strokeStyle = '#f3f0ea'; c.stroke();
  line(c, [-160, -250, 160, -250], 26, '#22303f');
  c.beginPath(); c.ellipse(0, -380, 170, 38, 0, 0, Math.PI * 2); fs(c, '#f3f0ea', 6); c.beginPath(); c.ellipse(0, -378, 150, 30, 0, 0, Math.PI * 2); fs(c, '#4a2c1c', 0);
  for (let r = 1; r <= 4; r++) { const rr = ((lt * 2.5 + r / 4) % 1); c.beginPath(); c.ellipse(0, -378, 150 * rr, 30 * rr, 0, 0, Math.PI * 2); c.lineWidth = 3; c.strokeStyle = `rgba(210,170,130,${.7 * (1 - rr)})`; c.stroke(); }
  c.restore();
  bloom(c, 600, 200, 900, '255,250,235', .3);
}
// ---------- smart lock on a heavy door: bolt slides, LED goes red (no hands) ----------
function lockShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2f2a27'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.08)' : 'rgba(255,220,180,.05)'; c.fillRect(i * 70, 0, 34, H); }
  c.fillStyle = '#ece8e0'; c.fillRect(1380, 0, 540, H); line(c, [1380, 0, 1380, H], 8, '#1a1716'); bloom(c, 1600, 300, 700, '255,240,210', .25);
  const k = easeOut(clamp((lt - .25) / .3)), red = lt > .5;
  c.beginPath(); c.roundRect(760, 200, 360, 680, 40); fs(c, '#1d1f24', 5); c.beginPath(); c.roundRect(790, 230, 300, 300, 24); fs(c, '#121317', 3);
  for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) { circle(c, 860 + q * 80, 290 + r * 60, 18); fs(c, '#2a2d33', 2); }
  circle(c, 940, 650, 90); fs(c, '#2a2d33', 4); c.beginPath(); c.arc(940, 650, 70, 0, Math.PI * 2); c.lineWidth = 10; c.strokeStyle = red ? '#ff3030' : '#3fd07a'; c.stroke(); bloom(c, 940, 650, 220, red ? '255,60,60' : '80,240,120', .5);
  c.font = '700 34px Inter'; c.textAlign = 'center'; c.fillStyle = red ? '#ff6a6a' : '#7af0a0'; c.fillText(red ? 'VERRIEGELT' : 'OFFEN', 940, 820);
  kRect(c, 1120, 520, 260, 60, '#8a8c90', 3); kRect(c, 1120 + 20, 530, 120 + 220 * k, 40, '#c8cacd', 2); // bolt
  for (let i = 0; i < 9; i++) { ell(c, 1140 + i * 30, 160 + Math.sin(i * .6) * 20 + i * 4, 18, 11, .2); c.lineWidth = 7; c.strokeStyle = '#a8aaae'; c.stroke(); }
}
// ---------- SIM card: tray ejected, card cracks in two on the marble (no hands) ----------
function simShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); marbleBG(c, 0, 0, W, H, '#2e2f34', 23); bloom(c, 900, 300, 900, '255,236,200', .3);
  c.save(); c.translate(1320, 600); c.rotate(-.1); c.beginPath(); c.roundRect(-220, -420, 440, 860, 60); fs(c, '#16181c', 6); c.beginPath(); c.roundRect(-200, -400, 400, 820, 50); fs(c, '#0c0d10', 2); c.restore();
  c.save(); c.translate(1080, 520); c.rotate(-.1); kRect(c, -260, -24, 260, 48, '#a8aaae', 3); circle(c, -30, 0, 10); fs(c, '#6a6c70', 2); c.restore(); // ejected tray
  const snap = clamp((lt - .55) / .15), bend = clamp(lt / .55);
  for (const s of [-1, 1]) {
    c.save(); c.translate(640 + s * snap * 70, 620 + snap * 20 * s); c.rotate(s * snap * .35 + (1 - snap) * bend * .02 * s);
    c.beginPath(); if (s < 0) { c.moveTo(-210, -150); c.lineTo(0, -150); c.lineTo(-14, -40); c.lineTo(12, 30); c.lineTo(0, 150); c.lineTo(-170, 150); c.lineTo(-210, 110); } else { c.moveTo(0, -150); c.lineTo(210, -150); c.lineTo(210, 150); c.lineTo(0, 150); c.lineTo(12, 30); c.lineTo(-14, -40); } c.closePath(); fs(c, '#f1efe8', 5);
    if (s < 0) { c.beginPath(); c.roundRect(-170, -70, 120, 140, 14); fs(c, '#d6b25a', 4); line(c, [-170, 0, -50, 0], 3, '#9a7a30'); line(c, [-110, -70, -110, 70], 3, '#9a7a30'); }
    c.restore();
  }
  if (snap > 0 && snap < 1) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; line(c, [640 + Math.cos(a) * 80 * snap, 620 + Math.sin(a) * 80 * snap, 640 + Math.cos(a) * 170 * snap, 620 + Math.sin(a) * 170 * snap], 5, 'rgba(255,255,255,.7)'); }
}
function bedroomLight(c, cam, t) { layer(c, cam, 1, c => motes(c, cam.x + 300, cam.x + 1100, cam.y - 600, cam.y + 300, t, { n: 34, alpha: .7, color: '255,240,210' })); grade(c, { sx: .8, sy: .4, warm: '255,230,190', warmA: .3, cool: '20,25,50', coolA: .45 }); }
