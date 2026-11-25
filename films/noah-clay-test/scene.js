// ===== Scene: clay Noah on the sofa at dusk, playing a game on his phone (5 s, stop-motion on twos) =====
const FPS = 30, DURATION = 5, STEP = 1 / 15;
const cv = document.getElementById('film'), c = cv.getContext('2d');
clayCtx(c);
const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
const seg = (t, a, b) => ease((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const bump = (t, a, b) => { const k = (t - a) / (b - a); return k <= 0 || k >= 1 ? 0 : Math.sin(k * Math.PI); };
let JIT = 0; // stop-motion "boil": tiny per-step offset per object
const jit = (id, amp = .9) => { const R = rng(JIT * 977 + id * 131); return [(R() - .5) * amp / CLAY.z, (R() - .5) * amp / CLAY.z]; };
function rr(x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function el(x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function boil(id, f, amp) { const [dx, dy] = jit(id, amp); c.save(); c.translate(dx, dy); f(); c.restore(); }

// ---------- room ----------
function wall(t) {
  // smeared plasticine wall: big flat slab + hand-smoothed patches + a darker dado band
  rr(-1400, -1100, 2800, 1080, 0); clay(c, '#7d9f97', { flat: 1, cast: 0, tex: .75, edge: 0 });
  const R = rng(5);
  for (let i = 0; i < 70; i++) { const x = -1300 + R() * 2600, y = -1050 + R() * 980; el(x, y, 40 + R() * 90, 14 + R() * 26, (R() - .5) * .6); clay(c, R() < .5 ? '#86a8a0' : '#74968e', { flat: 1, cast: 0, tex: .6, edge: 0 }); }
  rr(-1400, -300, 2800, 270, 0); clay(c, '#6a8a83', { flat: 1, cast: .4, tex: .7, edge: 0 });
  for (let x = -1380; x < 1400; x += 90) { c.save(); clayGroove(c, [x, -290, x, -40], 4); c.restore(); }
  rr(-1400, -318, 2800, 26, 10); clay(c, '#e8dcc6', { depth: .6 });
  rr(-1400, -60, 2800, 40, 8); clay(c, '#e3d5bd', { depth: .7 });
}
function floor() {
  rr(-1400, -30, 2800, 400, 0); clay(c, '#9a6a44', { flat: 1, cast: 0, tex: .8, edge: 0 });
  for (let i = 0; i < 6; i++) { const y = -20 + i * i * 9 + i * 22; clayGroove(c, [-1400, y, 1400, y], 3); }
  const R = rng(9); for (let i = 0; i < 40; i++) { const y = -20 + R() * 300, x = -1300 + R() * 2600; clayGroove(c, [x, y, x, y + 18 + R() * 20], 2); }
  // coiled clay rug: concentric rolled rings
  const cols = ['#c8573f', '#e9b44c', '#f1e3c8', '#3f7f86', '#c8573f', '#e9b44c', '#f1e3c8'];
  for (let i = 0; i < cols.length; i++) { const k = 1 - i * .13; el(-20, 40, 560 * k, 78 * k); clay(c, cols[i], { depth: .55, cast: i ? .4 : .8 }); }
}
function windowView(t) {
  const x0 = 400, y0 = -590, w = 300, h = 360;
  rr(x0 - 26, y0 - 26, w + 52, h + 52, 18); clay(c, '#efe4cf');
  // dusk sky: banded clay strips
  const sky = ['#4b3f78', '#6b4f8c', '#a05a86', '#d9786e', '#f0a65e'];
  c.save(); rr(x0, y0, w, h, 6); c.clip();
  sky.forEach((col, i) => { rr(x0 - 20, y0 + i * 64 - 10, w + 40, 90, 30); clay(c, col, { flat: 1, cast: 0, tex: .5, edge: 0 }); });
  el(x0 + 220, y0 + 80, 30, 30); clay(c, '#f7efd8', { depth: .5, cast: 0 });
  el(x0 + 232, y0 + 72, 26, 26); clay(c, '#6b4f8c', { flat: 1, cast: 0, edge: 0 }); // crescent
  // distant clay houses with warm windows
  const R = rng(3);
  for (let i = 0; i < 6; i++) { const bx = x0 - 10 + i * 56, bh = 90 + R() * 110; rr(bx, y0 + h - bh, 58, bh + 20, 6); clay(c, i % 2 ? '#3d3557' : '#46395f', { depth: .5 });
    for (let j = 0; j < 3; j++) if (R() < .6) { rr(bx + 12 + (j % 2) * 20, y0 + h - bh + 18 + j * 28, 12, 14, 3); clay(c, '#ffd27a', { flat: 1, cast: 0, edge: 0 }); } }
  // tree outside
  el(x0 + 50, y0 + 190, 70, 60); clay(c, '#2f4a45', { depth: .6 }); el(x0 + 95, y0 + 225, 55, 48); clay(c, '#34524b', { depth: .6 });
  c.restore();
  // muntins (rolled sticks)
  clayTube(c, [x0 + w / 2, y0, x0 + w / 2, y0 + h], 16, '#efe4cf'); clayTube(c, [x0, y0 + h * .45, x0 + w, y0 + h * .45], 16, '#efe4cf');
  rr(x0 - 40, y0 + h + 14, w + 80, 26, 10); clay(c, '#efe4cf'); // sill
  // curtains: vertical rolled folds
  for (const [cx, s] of [[x0 - 60, -1], [x0 + w + 60, 1]]) for (let i = 0; i < 4; i++) { const fx = cx + s * (i * 26) - s * 30; clayTube(c, [fx, y0 - 70, fx + s * 6, y0 + h + 40 - i * 10, fx + s * (14 + i * 6), y0 + h + 120], 34, i % 2 ? '#b84a3c' : '#c95a48'); }
  clayTube(c, [x0 - 140, y0 - 72, x0 + w + 140, y0 - 72], 18, '#9a7a52');
}
function picture() {
  const x0 = -330, y0 = -560, w = 230, h = 150;
  rr(x0 - 18, y0 - 18, w + 36, h + 36, 10); clay(c, '#a8743f');
  c.save(); rr(x0, y0, w, h, 4); c.clip();
  rr(x0, y0, w, h, 0); clay(c, '#f3d9a6', { flat: 1, cast: 0, edge: 0 });
  el(x0 + 160, y0 + 55, 26, 26); clay(c, '#f08a4b', { depth: .5 });
  el(x0 + 50, y0 + 165, 150, 70); clay(c, '#7aa86a', { depth: .6 }); el(x0 + 190, y0 + 175, 130, 72); clay(c, '#5d8f58', { depth: .6 });
  c.restore();
}
function lamp(t) {
  const x = -600;
  el(x, -8, 70, 18); clay(c, '#3a3330');
  clayTube(c, [x, -10, x, -500], 16, '#c9a050');
  c.beginPath(); c.moveTo(x - 70, -500); c.lineTo(x + 70, -500); c.lineTo(x + 105, -380); c.quadraticCurveTo(x, -362, x - 105, -380); c.closePath(); clay(c, '#f6dca0', { depth: 1.1 });
  for (let i = -2; i <= 2; i++) clayGroove(c, [x + i * 26, -498, x + i * 38, -378], 3);
}
function lampGlow(t) {
  const x = -600, fl = 1 + Math.sin(JIT * 1.7) * .02;
  c.save(); c.globalCompositeOperation = 'screen';
  let g = c.createRadialGradient(x, -400, 10, x, -400, 520 * fl); g.addColorStop(0, 'rgba(255,214,140,.55)'); g.addColorStop(.35, 'rgba(255,170,90,.18)'); g.addColorStop(1, 'rgba(255,150,80,0)');
  c.fillStyle = g; c.fillRect(-1300, -1100, 1600, 1400);
  g = c.createRadialGradient(x, -360, 5, x, -300, 260); g.addColorStop(0, 'rgba(255,230,170,.45)'); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(x - 300, -600, 600, 600);
  c.restore();
}
function sideTable(t) {
  const x = -430;
  for (const lx of [x - 60, x + 60]) clayTube(c, [lx, -150, lx + (lx < x ? -6 : 6), -4], 14, '#7a4e2e');
  rr(x - 85, -175, 170, 30, 12); clay(c, '#9b6638');
  // books
  rr(x - 70, -205, 110, 30, 6); clay(c, '#3f7f86'); rr(x - 62, -230, 96, 26, 6); clay(c, '#e3a73f');
  // mug + steam
  rr(x + 40, -232, 44, 58, 10); clay(c, '#e9e1d4'); clayTube(c, [x + 84, -220, x + 98, -210, x + 98, -194, x + 84, -186], 9, '#e9e1d4', { cast: .5 });
  el(x + 62, -230, 20, 6); clay(c, '#5a3420', { flat: 1, cast: 0 });
  c.save(); c.globalAlpha = .18;
  for (let i = 0; i < 2; i++) { const ph = t * 2 + i * 2.1; const pts = []; for (let j = 0; j <= 6; j++) pts.push(x + 56 + i * 12 + Math.sin(ph + j * .9) * 8, -240 - j * 16); clayTube(c, pts, 6, '#ffffff', { cast: 0 }); }
  c.restore();
}
function plant(t) {
  const x = 560;
  const leaves = [[-.9, 170], [-.45, 230], [-.1, 260], [.3, 220], [.75, 175], [-1.3, 120], [1.15, 130]];
  leaves.forEach(([a, L], i) => {
    const sway = Math.sin(t * 1.3 + i) * .03, an = a + sway, bx = x, by = -110, tx = bx + Math.sin(an) * L, ty = by - Math.cos(an) * L;
    clayTube(c, [bx, by, (bx + tx) / 2 + Math.sin(an) * 10, (by + ty) / 2 + 10, tx, ty], 8, '#4b7a3c', { cast: .5 });
    el(tx, ty, 44, 26, an - Math.PI / 2); clay(c, i % 2 ? '#5f9a49' : '#6cab55');
    c.save(); c.translate(tx, ty); c.rotate(an - Math.PI / 2); clayGroove(c, [-38, 0, 38, 0], 3); c.restore();
  });
  c.beginPath(); c.moveTo(x - 75, -120); c.lineTo(x + 75, -120); c.lineTo(x + 55, 4); c.lineTo(x - 55, 4); c.closePath(); clay(c, '#c96b3e');
  rr(x - 84, -132, 168, 28, 10); clay(c, '#d97c4c');
}
function sofaBack() {
  const S = '#d9a441';
  rr(-345, -250, 650, 200, 50); clay(c, shadeCol(S, -.08));
  rr(-325, -262, 300, 185, 46); clay(c, S); clayGroove(c, [-175, -230, -175, -110], 3);
  rr(-30, -262, 300, 185, 46); clay(c, S); clayGroove(c, [120, -230, 120, -110], 3);
  // coral cushion with a button
  c.save(); c.translate(-250, -150); c.rotate(-.12); rr(-70, -60, 140, 120, 40); clay(c, '#e0715a'); el(0, 0, 9, 9); clay(c, '#b54f3c', { depth: .4 }); c.restore();
}
function sofaFront(t, squash) {
  const S = '#d9a441';
  for (const lx of [-345, 285]) { rr(lx, -10, 22, 18, 5); clay(c, '#6b4428', { depth: .5 }); }
  rr(-380, -70, 750, 66, 26); clay(c, shadeCol(S, -.12));
  // seat cushions (left one squashes when Noah bounces)
  rr(-315, -100 + squash, 295, 56 - squash, 22); clay(c, shadeCol(S, .05));
  rr(-20, -100, 295, 56, 22); clay(c, shadeCol(S, .05));
  // rolled arms
  for (const ax of [-395, 300]) { rr(ax, -175, 95, 172, 40); clay(c, shadeCol(S, -.03)); el(ax + 47, -172, 52, 30); clay(c, S); clayGroove(c, [ax + 47 - 28, -172, ax + 47 + 28, -172], 3); }
}
function cat(t, wake) {
  // orange clay cat curled on the right seat cushion; lifts its head when Noah cheers
  const x = 150, y = -100;
  const tw = Math.sin(t * 3) * .5 + wake * .6;
  clayTube(c, [x + 70, y - 20, x + 105, y - 30 - tw * 20, x + 110 - tw * 15, y - 70 - tw * 25], 20, '#e08a3c');
  el(x, y - 38, 88, 46); clay(c, '#e8923f');
  for (let i = -2; i <= 2; i++) clayGroove(c, [x + i * 24 - 8, y - 78, x + i * 24 + 4, y - 50], 4);
  const hx = x - 70 - wake * 6, hy = y - 52 - wake * 34;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(hx + s * 14, hy - 26); c.lineTo(hx + s * 34, hy - 56); c.lineTo(hx + s * 40, hy - 14); c.closePath(); clay(c, '#e08a3c', { depth: .5 }); }
  el(hx, hy, 42, 36); clay(c, '#ee9a48');
  el(hx, hy + 14, 16, 10); clay(c, '#f6dcc0', { depth: .4, cast: 0 });
  if (wake > .5) { for (const s of [-1, 1]) { el(hx + s * 15, hy - 4, 6, 8); c.fillStyle = '#2a1f1a'; c.fill(); el(hx + s * 15 - 2, hy - 7, 2, 3); c.fillStyle = '#fff'; c.fill(); } }
  else for (const s of [-1, 1]) clayGroove(c, [hx + s * 22, hy - 4, hx + s * 15, hy, hx + s * 8, hy - 4], 3);
  el(hx, hy + 8, 4, 3); c.fillStyle = '#b5523e'; c.fill();
}
function coffeeTable(t) {
  rr(-760, 165, 960, 120, 30); clay(c, '#6e4426', { depth: 1.3 });
  rr(-760, 150, 960, 40, 18); clay(c, '#8b5a32', { depth: 1.2 });
  // bowl of clay popcorn
  const bx = -520; el(bx, 150, 110, 30); clay(c, '#3f7f86');
  const R = rng(21); for (let i = 0; i < 16; i++) { el(bx - 85 + R() * 170, 120 + R() * 30 - Math.sin((i / 16) * Math.PI) * 30, 16 + R() * 6, 14 + R() * 5, R() * 3); clay(c, R() < .2 ? '#f2c96a' : '#fbf1da', { depth: .6 }); }
  c.beginPath(); c.moveTo(bx - 115, 140); c.quadraticCurveTo(bx, 230, bx + 115, 140); c.closePath(); clay(c, '#3f7f86', { depth: 1.1 });
  // juice glass
  rr(80, 70, 56, 90, 12); clay(c, '#f2a33a', { depth: .8 }); rr(86, 64, 44, 18, 8); clay(c, '#f9c76a', { depth: .5, cast: 0 });
}

// ---------- Noah with phone ----------
const NK = .25, SEAT = 300, NX = -150;
function ik(side, tx, ty) {
  const S = NOAH.SHOULDER, U = NOAH.UPPER, F = NOAH.FORE;
  const du = side * tx - S.x, dy = ty - S.y, d = Math.min(Math.hypot(du, dy), U + F - 2);
  const th = Math.atan2(du, dy), al = Math.acos((U * U + d * d - F * F) / (2 * U * d)), a = th + al;
  const eu = S.x + Math.sin(a) * U, ey = S.y + Math.cos(a) * U, a2 = Math.atan2(side * tx - eu, ty - ey);
  return { a, b: a2 - a };
}
function phoneAndFingers(cx, cy, t, tap, rot) {
  c.save(); c.translate(cx, cy); c.rotate(rot);
  // phone back (red clay case, camera bump), screen light leaking over the top edge
  rr(-125, -66, 250, 132, 26); clay(c, '#d8453b', { depth: 1.1 });
  rr(-110, -54, 220, 108, 20); clay(c, '#e85a4c', { depth: .5, cast: 0 });
  rr(52, -46, 50, 50, 14); clay(c, '#2d2826', { depth: .6 }); el(66, -32, 10, 10); clay(c, '#17202c', { depth: .3 }); el(88, -32, 10, 10); clay(c, '#17202c', { depth: .3 }); el(66, -12, 6, 6); clay(c, '#ffe9a6', { depth: .2, cast: 0 });
  // fingers wrapped round the back: four rolled sausages per hand, tapping
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const wig = Math.sin(t * 22 + i * 1.7 + s) * tap * 6, fy = -42 + i * 29, L = 62 - Math.abs(i - 1.3) * 10 + wig;
      const x0 = s * 142, x1 = s * (142 - L);
      clayTube(c, [x0, fy, (x0 + x1) / 2, fy - 4, x1, fy + 1], 32, NOAH.skin, { cast: 1 });
      clayGroove(c, [s * (142 - L * .45), fy - 11, s * (142 - L * .45) - s * 3, fy + 11], 3); // knuckle crease
      c.save(); c.globalAlpha = .5; el(x1 + s * 8, fy - 2, 7, 9); clay(c, '#fbf3ee', { depth: .2, cast: 0, edge: 0, flat: 1 }); c.restore(); // nail
    }
    // thumbs peek over the top edge, pressing up and down
    const th = Math.max(0, Math.sin(t * 18 + (s > 0 ? 1.6 : 0))) * tap * 10;
    clayTube(c, [s * 120, -40, s * 88, -70 + th * .4, s * 60, -76 + th], 26, NOAH.skin);
  }
  c.restore();
}
function noahScene(t) {
  const lean = seg(t, 1.3, 1.8) * (1 - seg(t, 2.55, 2.75)), cheer = seg(t, 2.55, 2.85) * (1 - seg(t, 3.5, 4.1)), relax = seg(t, 3.6, 4.3);
  const bounce = bump(t, 2.6, 3.0) * 26 + bump(t, 3.0, 3.25) * 10;
  const bob = -bounce + lean * 22 + Math.sin(t * 2.2) * 4;
  // phone position (Noah-local units, before the seated shift)
  let px = 0, py = lerp(-700, -735, lean) - cheer * 120, rot = Math.sin(t * 9) * .03 * lean + cheer * Math.sin(t * 14) * .06;
  const dy = -SEAT - (NOAH.HEM + 40) - 60;
  const arms = { l: ik(-1, px - 105, py + 10), r: ik(1, px + 105, py + 10) };
  arms.l.hand = .3; arms.r.hand = -.3;
  const expr = cheer > .5 ? { mouth: 'yawn', open: .7, browUp: 1, lid: 0 }
    : lean > .4 ? { mouth: 'o', browUp: .7, lid: .25 }
    : relax > .5 ? { mouth: 'smile', browUp: .2, lid: .3 }
    : { mouth: 'soft', lid: .38, browUp: .1 };
  const blink = (t > 0.9 && t < 1.0) || (t > 4.4 && t < 4.5);
  if (blink && cheer < .5) expr.eyes = 'closed';
  const tilt = Math.sin(t * 1.6) * .03 - cheer * .02;
  // body
  const [jx, jy] = jit(1, .8);
  c.save(); c.translate(jx, jy);
  drawNoah(c, { x: NX, y: 0, k: NK, ink: 1, sit: true, seatH: SEAT, arms, expr, tilt, bob });
  // phone + fingers in Noah's frame
  c.save(); c.translate(NX, 0); c.scale(NK, NK); c.translate(0, dy + bob);
  phoneAndFingers(px, py, t, lerp(.5, 1, lean) * (1 - cheer * .7), rot);
  c.restore();
  // screen light on his face (game colours flicker)
  const hue = ['255,90,160', '90,200,255', '140,255,140', '255,210,90'][Math.floor(t * 6) % 4];
  const fx = NX, fy = (NOAH.HEAD.y + dy + bob) * NK + 30;
  c.save(); c.globalCompositeOperation = 'screen';
  const g = c.createRadialGradient(fx, fy + 40, 5, fx, fy, 120); g.addColorStop(0, `rgba(${hue},.22)`); g.addColorStop(1, `rgba(${hue},0)`);
  c.fillStyle = g; c.fillRect(fx - 160, fy - 140, 320, 280); c.restore();
  c.restore();
  return { cheer, bounce };
}

// ---------- frame ----------
function renderAt(t) {
  const step = Math.floor(t / STEP + 1e-6); JIT = step; const tq = step * STEP; // stop-motion: hold each pose for 2 frames
  const z = lerp(1.68, 1.84, ease(tq / DURATION)), cx = lerp(-40, -85, ease(tq / DURATION)), cy = -215;
  CLAY.z = z / 1.6;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2a2420'; c.fillRect(0, 0, W, H);
  c.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
  wall(tq); floor(); windowView(tq); picture(); lamp(tq); sideTable(tq); plant(tq);
  sofaBack();
  const cheer = seg(tq, 2.55, 2.85) * (1 - seg(tq, 3.5, 4.1)), bounce = bump(tq, 2.6, 3.0) * 26;
  sofaFront(tq, bounce * .5);
  const wake = seg(tq, 2.75, 3.0) * (1 - seg(tq, 4.2, 4.6));
  boil(2, () => cat(tq, wake), .7);
  noahScene(tq);
  lampGlow(tq);
    // cool window light from the right + warm/cool grade + vignette (screen space)
  c.setTransform(1, 0, 0, 1, 0, 0);
  let g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(255,170,90,.10)'); g.addColorStop(.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(90,110,200,.16)');
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'multiply';
  g = c.createRadialGradient(W * .48, H * .48, H * .35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(70,50,60,1)');
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
}
window.__film = { FPS, DURATION, renderAt };
renderAt(0);
