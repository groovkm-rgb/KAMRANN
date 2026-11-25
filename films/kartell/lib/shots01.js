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
// ---------- bedroom: marble, unused bed, closed curtains with a slice of noon light ----------
function bedroomSet(c, cam, t, o = {}) {
  const HZ = -300, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#8e9096'; c.fillRect(0, 0, W, H);
  layer(c, cam, .8, c => { const b = B(.8), top = b - 3.0 * KM;
    marbleBG(c, -5000, top, 10000, b - top, '#d6d6d8', 3);
    for (let i = -6; i < 6; i++) line(c, [i * 700, top, i * 700, b], 3, 'rgba(150,150,155,.5)');
    // curtains (closed) with a gap where noon light comes through
    const cx = o.gapX ?? 600; for (let i = 0; i < 70; i++) { const x = cx - 1700 + i * 50 + (i >= 34 ? 26 : 0); c.fillStyle = i % 2 ? '#b9b3a8' : '#a9a397'; c.fillRect(x, top - 40, 52, b - top + 40); }
    c.fillStyle = '#fff6dc'; c.fillRect(cx + 0, top - 40, 26, b - top + 40); bloom(c, cx + 13, top + 400, 300, '255,240,200', .5);
    kRect(c, cx - 1750, top - 70, 3500, 30, '#6a6460', 2);
    // bed (made, untouched), nightstand + lamp + notepad
    const bx = o.bedX ?? -1500; c.beginPath(); c.roundRect(bx - 140, b - 760, 120, 760, 30); fs(c, '#8a7e72', 3); for (let k = 0; k < 6; k++) line(c, [bx - 120, b - 700 + k * 110, bx - 40, b - 700 + k * 110], 3, 'rgba(0,0,0,.2)'); kRect(c, bx - 60, b - 380, 1500, 200, '#ece8e0', 3); kRect(c, bx - 60, b - 180, 1500, 180, '#7a6e64', 3);
    for (const d of [80, 420]) { c.beginPath(); c.roundRect(bx + d, b - 470, 300, 100, 40); fs(c, '#f6f4f0', 3); }
    c.beginPath(); c.moveTo(bx + 760, b - 380); c.lineTo(bx + 1440, b - 380); c.lineTo(bx + 1440, b - 170); c.lineTo(bx + 760, b - 170); fs(c, '#dcd8ce', 2.5); line(c, [bx + 760, b - 340, bx + 1440, b - 340], 4, '#cfcac0');
    const nx = bx + 1560; kRect(c, nx, b - 300, 300, 300, '#5a5048', 3); kRect(c, nx + 20, b - 220, 260, 12, '#3a342e', 1);
    line(c, [nx + 210, b - 300, nx + 210, b - 520], 6); c.beginPath(); c.moveTo(nx + 150, b - 520); c.lineTo(nx + 270, b - 520); c.lineTo(nx + 250, b - 620); c.lineTo(nx + 170, b - 620); c.closePath(); fs(c, '#efe6d0', 2.5);
    kRect(c, nx + 30, b - 318, 130, 18, '#f8f6ee', 2); line(c, [nx + 40, b - 322, nx + 150, b - 330], 4, '#2a4ab0'); // notepad + pen
  });
  layer(c, cam, 1, c => { marbleBG(c, -9000, HZ, 18000, 2000, '#cfcfd2', 9); c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(-9000, HZ, 18000, 60);
    const cx = (o.gapX ?? 600) * 1.05; c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,240,200,.45)'; c.beginPath(); c.moveTo(cx - 10, HZ); c.lineTo(cx + 30, HZ); c.lineTo(cx + 700, 900); c.lineTo(cx + 420, 900); c.closePath(); c.fill(); c.restore(); });
  return { base: '#cfcfd2' };
}
function bedroomLight(c, cam, t) { layer(c, cam, 1, c => motes(c, cam.x + 200, cam.x + 900, cam.y - 600, cam.y + 300, t, { n: 30, alpha: .6, color: '255,240,210' })); grade(c, { sx: .7, sy: .3, warm: '255,230,190', warmA: .25, cool: '30,35,60', coolA: .35 }); }
// ---------- money counter on marble (side view, faceless notes) ----------
function moneyCounterShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); marbleBG(c, 0, 0, W, H, '#2c2c31', 5); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(0, 0, W, H);
  const z = 1 + lt * .03; c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  marbleBG(c, 0, 700, W, 380, '#e6e3de', 7); line(c, [0, 700, W, 700], 4, '#a8a4a0');
  bloom(c, 1300, 300, 900, '255,236,200', .25);
  // banded stacks of notes (no faces)
  const note = (x, y, n) => { for (let i = 0; i < n; i++) { c.beginPath(); c.rect(x, y - i * 9, 260, 9); fs(c, i % 2 ? '#a9b59a' : '#9fac90', 1, 'rgba(60,70,50,.6)'); } kRect(c, x + 100, y - n * 9 + 9, 60, n * 9, '#e8dcc0', 1.5); };
  note(180, 760, 14); note(470, 760, 10); note(250, 650, 8);
  // the counting machine
  const mx = 980, my = 760; c.beginPath(); c.moveTo(mx - 260, my); c.lineTo(mx + 300, my); c.lineTo(mx + 260, my - 330); c.lineTo(mx - 200, my - 360); c.closePath(); fs(c, '#2b2d33', 4);
  kRect(c, mx - 220, my - 420, 360, 70, '#3a3d44', 3); kRect(c, mx + 60, my - 300, 160, 70, '#101214', 3); c.fillStyle = '#5af07a'; for (let i = 0; i < 3; i++) c.fillRect(mx + 80 + i * 44, my - 268, 30, 6); bloom(c, mx + 140, my - 265, 90, '90,240,120', .35);
  for (let i = 0; i < 4; i++) { circle(c, mx - 160 + i * 50, my - 200, 14); fs(c, '#55585f', 2); }
  // notes riffling through the top
  const sp = 6 + lt * 2.5, ph = (lt * sp) % 1;
  for (let i = 0; i < 6; i++) { const k = (ph + i / 6) % 1; c.save(); c.translate(mx - 150 + k * 240, my - 420 - Math.sin(k * Math.PI) * 60); c.rotate(-.5 + k * 1.1); kRect(c, -130, -4, 260, 8, '#a9b59a', 1.2, 'rgba(60,70,50,.7)'); c.restore(); }
  for (let i = 0; i < 8; i++) { c.beginPath(); c.rect(mx + 120, my - 40 - i * 8, 240, 8); fs(c, '#9fac90', 1, 'rgba(60,70,50,.6)'); }
  // Noah's hand resting, fingers tapping (nervous)
  const tap = Math.max(0, Math.sin(lt * 14)) * 10; drawNoahHand(c, 1580, 640 - tap, 1.1, -1.4);
  kCup(c, { wx: 1720, wy: 600 }, 0, t); // untouched coffee
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
// ---------- hand squeezing the coffee cup ----------
function cupShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#dfe7ec'); g.addColorStop(1, '#a9b6bf'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(200 + i * 300, 0, 120, H); } // glass doors behind
  const sq = clamp((lt - .2) / .6), sh = Math.sin(t * 50) * 3 * sq;
  c.save(); c.translate(W / 2 + sh, H / 2 + 120); c.scale(3.2, 3.2);
  c.beginPath(); c.moveTo(-70, -110); c.lineTo(70, -110); c.lineTo(56, 60); c.quadraticCurveTo(0, 74, -56, 60); c.closePath(); nFill(c, '#f3f0ea', 7);
  nLine(c, [-64, -40, 64, -40], 14, '#22303f');
  c.beginPath(); c.ellipse(0, -110, 70, 16, 0, 0, Math.PI * 2); nFill(c, '#4a2c1c', 5);
  for (let r = 1; r <= 3; r++) { c.beginPath(); c.ellipse(0, -110, 20 * r * (1 + sq * .2), 4 * r, 0, 0, Math.PI * 2); c.lineWidth = 1.5; c.strokeStyle = `rgba(200,160,120,${.5 * sq})`; c.stroke(); }
  c.restore();
  // fingers wrapped around the cup (white Noah hand)
  c.save(); c.translate(W / 2 + sh, H / 2 + 120); for (let i = 0; i < 4; i++) { c.beginPath(); c.roundRect(-250 + sq * 8, -200 + i * 72, 300, 60, 30); nFill(c, NOAH.skin, 9); } c.beginPath(); c.roundRect(-300, -260, 140, 360, 60); nFill(c, NOAH.skin, 9);
  nLine(c, [-330, -120, -560, -60], 120 + 18, NOAH.out); nLine(c, [-330, -120, -560, -60], 120, OUTFIT.boss.coat); c.restore();
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
// ---------- door lock: hand turns the deadbolt ----------
function lockShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#3b3430'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.08)' : 'rgba(255,220,180,.05)'; c.fillRect(i * 70, 0, 34, H); } // wood grain door
  c.fillStyle = '#ece8e0'; c.fillRect(1380, 0, 540, H); line(c, [1380, 0, 1380, H], 8, '#1a1716');
  bloom(c, 1500, 300, 700, '255,240,210', .25);
  // lock plate + thumb turn
  c.beginPath(); c.roundRect(860, 300, 200, 520, 30); fs(c, '#c9b37a', 5); circle(c, 960, 430, 70); fs(c, '#d8c48a', 4);
  const a = -Math.PI / 2 + easeOut(clamp((lt - .25) / .35)) * Math.PI / 2; c.save(); c.translate(960, 430); c.rotate(a); c.beginPath(); c.roundRect(-24, -90, 48, 180, 20); fs(c, '#b89e60', 4); c.restore();
  circle(c, 960, 690, 36); fs(c, '#a88c50', 4); kRect(c, 954, 670, 12, 40, '#2a2418', 0);
  line(c, [1060, 560, 1380, 560], 40, '#a88c50'); line(c, [1100, 560, 1100 + 260 * easeOut(clamp((lt - .25) / .35)), 560], 30, '#d8c48a'); // bolt sliding
  // chain
  for (let i = 0; i < 9; i++) { ell(c, 1100 + i * 34, 220 + Math.sin(i * .6) * 30 + i * 6, 20, 12, .2); c.lineWidth = 7; c.strokeStyle = '#b8a060'; c.stroke(); }
  c.save(); c.translate(960, 430); c.rotate(a); drawNoahHand(c, 60, 40, 2.2, -2.2); c.restore();
  nLine(c, [1200, 820, 1700, 1100], 170, NOAH.out); nLine(c, [1200, 820, 1700, 1100], 150, OUTFIT.boss.coat);
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
// ---------- SIM card snapped between two fingers ----------
function simShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#26282d'; c.fillRect(0, 0, W, H); bloom(c, 960, 400, 900, '255,236,200', .3);
  const snap = clamp((lt - .55) / .12), bend = clamp(lt / .55) * .25;
  for (const s of [-1, 1]) {
    c.save(); c.translate(960 + s * snap * 60, 560 + snap * 40); c.rotate(s * (bend + snap * .5));
    c.beginPath(); c.moveTo(0, -160); c.lineTo(s * 230, -160); c.lineTo(s * 230, 160); c.lineTo(0, 160); c.closePath(); fs(c, '#f1efe8', 5);
    if (s < 0) { c.beginPath(); c.roundRect(-190, -70, 110, 140, 14); fs(c, '#d6b25a', 4); line(c, [-190, 0, -80, 0], 3, '#9a7a30'); line(c, [-135, -70, -135, 70], 3, '#9a7a30'); }
    c.restore();
    // thumbs
    c.save(); c.translate(960 + s * (260 + snap * 70), 600 + snap * 50); c.rotate(s * (bend + snap * .5)); c.beginPath(); c.roundRect(-80, -200, 160, 300, 70); nFill(c, NOAH.skin, 9); c.restore();
  }
  if (snap > 0 && snap < 1) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; line(c, [960 + Math.cos(a) * 60 * snap, 560 + Math.sin(a) * 60 * snap, 960 + Math.cos(a) * 140 * snap, 560 + Math.sin(a) * 140 * snap], 5, 'rgba(255,255,255,.7)'); }
}
