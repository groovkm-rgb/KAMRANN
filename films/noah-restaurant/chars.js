// Side characters (same ink language as Noah, clearly different: skin tone, hair, clothes) + props.
// Units like noah.js: feet at y = 0, head centre y = -1240, head radius ~250. Draw with k (≈ .5–.7).
function personHand(c, x, y, ang, skin, w) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.beginPath(); c.moveTo(-32, -4); c.quadraticCurveTo(-42, 60, -10, 82); c.quadraticCurveTo(20, 92, 34, 60); c.quadraticCurveTo(42, 20, 32, -4); c.closePath(); fs(c, skin, w);
  c.beginPath(); c.moveTo(-30, 18); c.quadraticCurveTo(-58, 40, -48, 58); c.quadraticCurveTo(-36, 62, -28, 46); fs(c, skin, w * .8);
  c.restore();
}
function armEnds(spec, side) {
  const sx = side * 150, sy = -915, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * 215, ey = sy + Math.cos(a) * 215, wx = ex + side * Math.sin(a2) * 205, wy = ey + Math.cos(a2) * 205;
  return { sx, sy, ex, ey, wx, wy, a2, hx: wx + side * Math.sin(a2) * 55, hy: wy + Math.cos(a2) * 55 };
}
// hand position of NOAH (front view, drawNoah params) in set coordinates
function noahHand(p, side) {
  const arms = Object.assign({}, NOAH.ARMS, p.arms || {}), spec = side < 0 ? arms.l : arms.r, e = armEnds(spec, side), k = p.k ?? .5, s = p.s || 1;
  let lx = e.hx, ly = e.hy + (p.bob || 0);
  if (p.lean) { const cs = Math.cos(p.lean), sn = Math.sin(p.lean); [lx, ly] = [lx * cs - ly * sn, lx * sn + ly * cs]; }
  return [(p.x || 0) + lx * k * s, (p.y || 0) + ly * k];
}
function noahHeadPos(p) { const k = p.k ?? .5; return [(p.x || 0), (p.y || 0) + (NOAH.HEAD.y + (p.bob || 0)) * k]; }

function person(c, p) {
  const k = p.k ?? .5, s = p.s || 1, W0 = 13 * (p.ink || 1.8), skin = p.skin || '#e8b48a', e = p.expr || {};
  const arms = Object.assign({ l: { a: .13, b: -.08 }, r: { a: .13, b: -.08 } }, p.arms || {});
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * s, k);
  const sitDy = p.sit ? 380 : 0;
  // legs
  if (!p.sit && !p.noLegs) {
    for (const sd of [-1, 1]) {
      const lift = (p.legs && p.legs[sd < 0 ? 0 : 1]) || 0;
      if (p.dress) { /* dress covers to knee */ }
      c.beginPath(); c.moveTo(sd * 6, -520); c.lineTo(sd * 112, -520); c.lineTo(sd * 104, -95 - lift); c.lineTo(sd * 16, -95 - lift); c.closePath(); fs(c, p.dress ? skin : (p.bottom || '#2f3b52'), W0);
      c.beginPath(); c.moveTo(sd * 18, -100 - lift); c.lineTo(sd * 104, -100 - lift); c.quadraticCurveTo(sd * 180, -60 - lift, sd * 184, -14 - lift); c.lineTo(sd * 26, 0 - lift); c.closePath(); fs(c, p.shoes || '#1d1a1a', W0);
    }
  }
  c.translate(0, sitDy + (p.bob || 0));
  // long hair behind
  const hc = (p.hair && p.hair.col) || '#2a1d16', hs = (p.hair && p.hair.style) || 'short';
  if (hs === 'long') { c.beginPath(); c.moveTo(-250, -1300); c.quadraticCurveTo(-300, -950, -230, -780); c.lineTo(230, -780); c.quadraticCurveTo(300, -950, 250, -1300); c.closePath(); fs(c, hc, W0 * .8); }
  // torso
  const top = p.top || '#b8463a';
  c.beginPath(); c.moveTo(-60, -955); c.lineTo(-160, -940); c.quadraticCurveTo(-150, -800, -138, -740); c.lineTo(p.dress ? -190 : -128, p.dress ? -330 : -500); c.lineTo(p.dress ? 190 : 128, p.dress ? -330 : -500); c.lineTo(138, -740); c.quadraticCurveTo(150, -800, 160, -940); c.lineTo(60, -955); c.quadraticCurveTo(0, -915, -60, -955); c.closePath(); fs(c, top, W0);
  if (p.jacket) { // chef jacket double-breasted buttons
    line(c, [-40, -940, 60, -520], 6, shade(top, -.15)); for (let i = 0; i < 3; i++) { ell(c, -30, -880 + i * 110, 12, 12, '#d9d4c8', 4); ell(c, 60, -880 + i * 110, 12, 12, '#d9d4c8', 4); }
  }
  if (p.vest) { c.beginPath(); c.moveTo(-150, -930); c.lineTo(-40, -930); c.lineTo(0, -720); c.lineTo(40, -930); c.lineTo(150, -930); c.lineTo(135, -500); c.lineTo(-135, -500); c.closePath(); fs(c, p.vest, W0); for (let i = 0; i < 3; i++) ell(c, 0, -680 + i * 60, 9, 9, '#c9a85a', 3); }
  if (p.apron) { c.beginPath(); c.moveTo(-120, p.apronHigh ? -880 : -640); c.lineTo(120, p.apronHigh ? -880 : -640); c.lineTo(150, -260); c.lineTo(-150, -260); c.closePath(); fs(c, p.apron, W0); line(c, [-130, -640, -160, -660], 8, shade(p.apron, -.2)); if (p.apronHigh) { line(c, [-120, -880, -60, -960], 6, OUT); line(c, [120, -880, 60, -960], 6, OUT); } }
  if (p.overalls) { c.beginPath(); c.moveTo(-110, -800); c.lineTo(110, -800); c.lineTo(125, -500); c.lineTo(-125, -500); c.closePath(); fs(c, p.overalls, W0); line(c, [-100, -800, -120, -940], 16, p.overalls); line(c, [100, -800, 120, -940], 16, p.overalls); ell(c, -100, -790, 10, 10, '#d8c060', 3); ell(c, 100, -790, 10, 10, '#d8c060', 3); }
  if (p.bowtie) { c.beginPath(); c.moveTo(0, -930); c.lineTo(-50, -960); c.lineTo(-50, -900); c.closePath(); c.moveTo(0, -930); c.lineTo(50, -960); c.lineTo(50, -900); c.closePath(); fs(c, p.bowtie, 5); }
  if (p.scarf) { c.beginPath(); c.moveTo(-90, -965); c.quadraticCurveTo(0, -890, 90, -965); c.lineTo(80, -905); c.quadraticCurveTo(0, -850, -80, -905); c.closePath(); fs(c, p.scarf, W0 * .7); }
  // neck
  c.beginPath(); c.rect(-44, -1005, 88, 62); c.fillStyle = skin; c.fill(); line(c, [-44, -1005, -44, -952], 9, OUT); line(c, [44, -1005, 44, -952], 9, OUT);
  // arms
  const drawArm = (sd) => {
    const spec = sd < 0 ? arms.l : arms.r, q = armEnds(spec, sd), sleeve = p.sleeve || 'short';
    line(c, [q.sx, q.sy, q.ex, q.ey, q.wx, q.wy], 70 + W0 * 2, OUT);
    line(c, [q.sx, q.sy, q.ex, q.ey, q.wx, q.wy], 70, sleeve === 'long' ? (p.sleeveCol || top) : skin);
    if (sleeve === 'short') { line(c, [q.sx, q.sy, q.sx + (q.ex - q.sx) * .62, q.sy + (q.ey - q.sy) * .62], 104 + W0 * 2, OUT); line(c, [q.sx, q.sy, q.sx + (q.ex - q.sx) * .62, q.sy + (q.ey - q.sy) * .62], 104, p.sleeveCol || top); }
    if (sleeve === 'long') { line(c, [q.sx + (q.wx - q.ex) * 0 + q.ex * 0, q.sy, q.ex, q.ey], 96, p.sleeveCol || top); line(c, [q.wx - (q.wx - q.ex) * .12, q.wy - (q.wy - q.ey) * .12, q.wx, q.wy], 78, skin); }
    personHand(c, q.wx, q.wy, -sd * q.a2, skin, W0 * .8);
  };
  const up = arms.l.a > 1.6 || arms.r.a > 1.6;
  if (!up) { drawArm(-1); drawArm(1); }
  // head
  c.save(); c.translate(0, -980); c.rotate(p.tilt || 0); c.translate(0, 980);
  const cy = -1240, R = p.headR || 250;
  if (hs === 'bun') { c.beginPath(); c.arc(40, cy - R - 40, 95, 0, Math.PI * 2); fs(c, hc, W0 * .8); }
  if (p.hat === 'chef') { c.beginPath(); c.moveTo(-200, cy - 180); c.bezierCurveTo(-330, cy - 330, -200, cy - 520, -60, cy - 450); c.bezierCurveTo(0, cy - 600, 160, cy - 560, 150, cy - 450); c.bezierCurveTo(330, cy - 470, 300, cy - 260, 200, cy - 180); c.closePath(); fs(c, '#f7f5ef', W0); }
  c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.fillStyle = skin; c.fill();
  c.save(); c.clip(); c.beginPath(); c.arc(30, cy + 40, R, 0, Math.PI * 2); c.fillStyle = shade(skin, -.08); c.fill(); c.beginPath(); c.arc(-8, cy - 26, R - 6, 0, Math.PI * 2); c.fillStyle = skin; c.fill(); c.restore();
  c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); fs(c, null, W0);
  // ears
  if (hs !== 'long') for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * (R - 4), cy + 20, 34, 52, 0, 0, Math.PI * 2); fs(c, skin, W0 * .7); }
  // hair
  if (hs === 'short' || hs === 'bun' || hs === 'long') {
    c.beginPath(); c.moveTo(-R + 4, cy - 30); c.bezierCurveTo(-R - 10, cy - 200, -150, cy - R - 30, 0, cy - R - 26); c.bezierCurveTo(150, cy - R - 30, R + 10, cy - 200, R - 4, cy - 30);
    if (hs === 'short') { c.bezierCurveTo(R - 30, cy - 110, 150, cy - 160, 40, cy - 165); c.quadraticCurveTo(-60, cy - 120, -150, cy - 150); c.quadraticCurveTo(-R + 20, cy - 120, -R + 4, cy - 30); }
    else { c.bezierCurveTo(R - 40, cy - 170, 100, cy - 175, 0, cy - 150); c.bezierCurveTo(-100, cy - 175, -R + 40, cy - 170, -R + 4, cy - 30); }
    c.closePath(); fs(c, hc, W0 * .8);
  } else if (hs === 'curly') {
    for (let i = 0; i < 11; i++) { const a = Math.PI * (1.02 + i * .096), rr = R + 10; c.beginPath(); c.arc(Math.cos(a) * rr * .92, cy + Math.sin(a) * rr * .92 + 10, 72, 0, Math.PI * 2); fs(c, hc, W0 * .7); }
    c.beginPath(); c.arc(0, cy - 120, 170, Math.PI, 0); c.fillStyle = hc; c.fill();
  } else if (hs === 'bald') {
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * (R - 6), cy - 70); c.quadraticCurveTo(sd * (R + 18), cy + 10, sd * (R - 20), cy + 70); c.lineTo(sd * (R - 40), cy - 40); c.closePath(); fs(c, hc, W0 * .6); }
    c.save(); c.globalAlpha = .5; ell(c, -80, cy - 150, 50, 26, '#fff', 0); c.restore();
  }
  if (p.hat === 'hard') { c.beginPath(); c.moveTo(-R - 20, cy - 110); c.lineTo(R + 20, cy - 110); c.quadraticCurveTo(R - 10, cy - R - 120, 0, cy - R - 110); c.quadraticCurveTo(-R + 10, cy - R - 120, -R - 20, cy - 110); c.closePath(); fs(c, '#f2b631', W0); line(c, [-R - 40, cy - 110, R + 40, cy - 110], 26, OUT); line(c, [-R - 36, cy - 110, R + 36, cy - 110], 14, '#f2b631'); line(c, [0, cy - R - 100, 0, cy - 115], 8, '#c98d1a'); }
  if (p.hat === 'chef') { c.beginPath(); c.rect(-200, cy - 250, 400, 90); fs(c, '#f7f5ef', W0); }
  if (p.hat === 'cap') { c.beginPath(); c.moveTo(-R + 10, cy - 100); c.quadraticCurveTo(0, cy - R - 150, R - 10, cy - 100); c.closePath(); fs(c, p.capCol || '#3b5f8a', W0); c.beginPath(); c.ellipse(-R + 40, cy - 100, 150, 30, -.08, 0, Math.PI * 2); fs(c, shade(p.capCol || '#3b5f8a', -.2), W0 * .8); }
  // face
  for (const sd of [-1, 1]) {
    const ex = sd * 88 + (e.look || 0) * 8, ey = cy + 25;
    if (e.eyes === 'closed') { c.beginPath(); c.moveTo(ex - 24, ey); c.quadraticCurveTo(ex, ey + 18, ex + 24, ey); c.lineWidth = 9; c.strokeStyle = OUT; c.stroke(); }
    else { c.beginPath(); c.ellipse(ex, ey, 21, 30, 0, 0, Math.PI * 2); c.fillStyle = OUT; c.fill(); c.beginPath(); c.arc(ex - 6, ey - 10, 6, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); }
    const bu = (e.browUp || 0) * 18; line(c, [sd * 135, cy - 40 - bu + (e.frown ? sd * 0 + 10 : 0), sd * 50, cy - 46 - bu - (e.frown ? -12 : 0)], 13, shade(hc, -.1));
  }
  if (p.cheeks !== false) { c.save(); c.globalAlpha = .28; ell(c, -140, cy + 100, 42, 24, '#e86a6a', 0); ell(c, 140, cy + 100, 42, 24, '#e86a6a', 0); c.restore(); }
  if (p.glasses) for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 88, cy + 25, 56, 0, Math.PI * 2); c.lineWidth = 9; c.strokeStyle = OUT; c.stroke(); }
  if (p.moustache) { c.beginPath(); c.moveTo(-90, cy + 125); c.quadraticCurveTo(-50, cy + 85, 0, cy + 108); c.quadraticCurveTo(50, cy + 85, 90, cy + 125); c.quadraticCurveTo(40, cy + 112, 0, cy + 122); c.quadraticCurveTo(-40, cy + 112, -90, cy + 125); fs(c, hc, 5); }
  const my = cy + 150, m = e.mouth || 'smile';
  if (m === 'smile') { c.beginPath(); c.moveTo(-58, my - 8); c.quadraticCurveTo(0, my + 26, 58, my - 8); c.lineWidth = 9; c.strokeStyle = OUT; c.stroke(); }
  else if (m === 'grin') { c.beginPath(); c.moveTo(-64, my - 12); c.quadraticCurveTo(0, my + 62, 64, my - 12); c.closePath(); fs(c, '#7a2a2e', 8); }
  else if (m === 'o') ell(c, 0, my + 4, 24, 30, '#7a2a2e', 7);
  else line(c, [-30, my, 30, my], 8, OUT);
  if (p.earring) { c.beginPath(); c.arc(-R + 4, cy + 85, 14, 0, Math.PI * 2); fs(c, '#e8c35a', 4); }
  c.restore();
  if (up) { drawArm(-1); drawArm(1); }
  c.restore();
}
function personHand2(p, side) { // hand position of person()
  const arms = Object.assign({ l: { a: .13, b: -.08 }, r: { a: .13, b: -.08 } }, p.arms || {}), q = armEnds(side < 0 ? arms.l : arms.r, side), k = p.k ?? .5;
  return [(p.x || 0) + q.hx * k * (p.s || 1), (p.y || 0) + (q.hy + (p.sit ? 380 : 0) + (p.bob || 0)) * k];
}

// ===================== PROPS (set units, drawn at the given size) =====================
function scissors(c, x, y, ang, open, s = 1) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  const blade = (sg) => {
    c.save(); c.rotate(sg * open * .35);
    c.beginPath(); c.moveTo(0, sg * 6); c.lineTo(330, sg * 4); c.quadraticCurveTo(350, sg * -8, 320, sg * -24); c.lineTo(0, sg * -22); c.closePath();
    const g = c.createLinearGradient(0, -30, 0, 10); g.addColorStop(0, '#f4f6fa'); g.addColorStop(.5, '#a9b2c0'); g.addColorStop(1, '#6d7686'); fs(c, g, 6);
    line(c, [30, sg * -10, 300, sg * -10], 3, 'rgba(255,255,255,.9)');
    // handle loop
    c.beginPath(); c.ellipse(-110, sg * 40, 82, 50, sg * .3, 0, Math.PI * 2); c.lineWidth = 40; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 28; c.strokeStyle = '#d4313b'; c.stroke();
    c.lineWidth = 8; c.strokeStyle = 'rgba(255,170,170,.7)'; c.beginPath(); c.ellipse(-110, sg * 40, 82, 50, sg * .3, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
    line(c, [-30, sg * 20, 0, sg * 0], 30, OUT); line(c, [-30, sg * 20, 0, sg * 0], 18, '#d4313b');
    c.restore();
  };
  blade(1); blade(-1); ell(c, 0, 0, 16, 16, '#e8c35a', 5);
  c.restore();
}
function bill(c, x, y, ang, title, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s * (o.flip ?? 1), s);
  const w = 260, h = 340;
  c.save(); c.fillStyle = 'rgba(10,10,20,.25)'; c.fillRect(-w / 2 + 10, -h / 2 + 14, w, h); c.restore();
  c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2, h / 2 - 20); for (let i = 0; i <= 8; i++) c.lineTo(w / 2 - i * w / 8, h / 2 - (i % 2 ? 0 : 20)); c.closePath(); fs(c, o.paper || '#fbf8f0', 5);
  if (o.back) { c.restore(); return; }
  txt(c, title, 0, -h / 2 + 58, title.length > 8 ? 34 : 42, '#1f1a18');
  line(c, [-w / 2 + 24, -h / 2 + 78, w / 2 - 24, -h / 2 + 78], 4, '#c0392b');
  for (let i = 0; i < 5; i++) { line(c, [-w / 2 + 26, -h / 2 + 112 + i * 34, -w / 2 + 120 + rnd(i + title.length) * 40, -h / 2 + 112 + i * 34], 7, '#b9b2a6'); line(c, [w / 2 - 80, -h / 2 + 112 + i * 34, w / 2 - 26, -h / 2 + 112 + i * 34], 7, '#b9b2a6'); }
  line(c, [-w / 2 + 24, h / 2 - 76, w / 2 - 24, h / 2 - 76], 3, '#1f1a18');
  txt(c, o.amount || '€', w / 2 - 26, h / 2 - 34, 34, '#c0392b', 'right');
  c.restore();
}
function moth(c, x, y, t, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); const f = Math.sin(t * 38);
  for (const sd of [-1, 1]) { c.save(); c.scale(sd, 1); c.rotate(-.2 + f * .5); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(40, -50, 70, -20); c.quadraticCurveTo(60, 20, 0, 6); fs(c, '#a89a86', 3); c.beginPath(); c.moveTo(4, 6); c.quadraticCurveTo(40, 30, 30, 46); c.quadraticCurveTo(10, 30, 2, 10); fs(c, '#8d7f6c', 3); c.restore(); }
  ell(c, 0, 8, 9, 26, '#6c6052', 3); line(c, [-3, -16, -18, -38], 3, OUT); line(c, [3, -16, 18, -38], 3, OUT);
  c.restore();
}
function wallet(c, x, y, open, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // back half
  c.beginPath(); rrect(c, -150, -10, 300, 170, 18); fs(c, '#6b3f26', 6);
  // inside (empty) + one lonely receipt
  c.save(); c.beginPath(); rrect(c, -132, 0, 264, 140, 12); c.fillStyle = '#3a2216'; c.fill(); c.restore();
  // front flap rotates open towards camera
  c.save(); c.translate(0, -10); c.scale(1, Math.cos(open * Math.PI * .9)); c.beginPath(); rrect(c, -150, -170 + 0, 300, 170, 18); fs(c, open > .5 ? '#4e2c1a' : '#7d4a2d', 6); if (open < .5) { line(c, [-130, -150, 130, -150], 3, '#c08a5c'); } c.restore();
  c.restore();
}
function coin(c, x, y, r = 22, spin = 0) { c.save(); c.translate(x, y); c.scale(Math.max(.15, Math.abs(Math.cos(spin))), 1); ell(c, 0, 0, r, r, '#e2b84c', 4); ell(c, 0, 0, r * .66, r * .66, '#f3d77d', 2); c.restore(); }
function banknote(c, x, y, ang, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  const w = 300, h = 160;
  c.beginPath(); rrect(c, -w / 2, -h / 2, w, h, 10); const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#7fb07a'); g.addColorStop(.5, '#a9cf8f'); g.addColorStop(1, '#6e9e6a'); fs(c, g, 5);
  c.beginPath(); rrect(c, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 6); c.lineWidth = 3; c.strokeStyle = 'rgba(40,80,40,.6)'; c.stroke();
  ell(c, -70, 0, 44, 44, 'rgba(255,255,255,.35)', 3);
  for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-70, 0, 12 + i * 6, 0, Math.PI * 2); c.lineWidth = 1.5; c.strokeStyle = 'rgba(40,80,40,.35)'; c.stroke(); }
  txt(c, '100', 70, 22, 64, '#234d23'); txt(c, '€', -70, 18, 50, '#234d23');
  c.restore();
}
function fork(c, x, y, ang, s = 1) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  c.beginPath(); rrect(c, -10, 0, 20, 170, 8); const g = c.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, '#9aa3b1'); g.addColorStop(.5, '#f3f5f8'); g.addColorStop(1, '#8a93a1'); fs(c, g, 4);
  c.beginPath(); c.moveTo(-30, 0); c.lineTo(30, 0); c.lineTo(24, -30); c.lineTo(-24, -30); c.closePath(); fs(c, g, 4);
  for (let i = 0; i < 4; i++) { c.beginPath(); rrect(c, -28 + i * 16, -110, 9, 86, 4); fs(c, g, 3); }
  c.restore();
}
function candle(c, x, y, on, t, s = 1, seed = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-26, 0); c.lineTo(-30, 18); c.lineTo(30, 18); c.lineTo(26, 0); c.closePath(); fs(c, '#c9a85a', 3); // holder
  c.beginPath(); rrect(c, -14, -80, 28, 82, 4); fs(c, '#f4ead6', 3); line(c, [0, -80, 0, -94], 3, OUT);
  if (on > 0) {
    const fl = 1 + Math.sin(t * 17 + seed) * .12 + Math.sin(t * 29 + seed * 2) * .08, sw = Math.sin(t * 9 + seed) * 4;
    c.globalAlpha = on; c.beginPath(); c.moveTo(0, -94); c.quadraticCurveTo(-13, -110, sw, -94 - 38 * fl); c.quadraticCurveTo(13, -110, 0, -94); c.fillStyle = '#ffd46a'; c.fill();
    c.beginPath(); c.ellipse(0, -104, 5, 9, 0, 0, Math.PI * 2); c.fillStyle = '#fff6d6'; c.fill();
    c.globalAlpha = 1; glowAt(c, 0, -108, 160 * fl, '255,190,100', .55 * on);
  }
  c.restore();
}
// glow in current (transformed) space
function glowAt(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.3, `rgba(${col},${a * .35})`); g.addColorStop(1, `rgba(${col},0)`); c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); }
function smokeWisp(c, x, y, t, s = 1, a = .5, seed = 0) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < 14; i++) { const ph = (t * .45 + i / 14 + rnd(seed + i) * .05) % 1, yy = y - ph * 260 * s, xx = x + Math.sin(ph * 7 + t * 1.5 + seed) * 22 * s * ph; c.beginPath(); c.arc(xx, yy, (6 + ph * 30) * s, 0, Math.PI * 2); c.fillStyle = `rgba(200,200,215,${a * (1 - ph) * .35})`; c.fill(); }
  c.restore();
}
function wineGlass(c, x, y, s = 1, wine = .5, col = '#7a1d2e') {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.ellipse(0, 0, 32, 8, 0, 0, Math.PI * 2); fs(c, 'rgba(220,235,255,.35)', 3);
  line(c, [0, 0, 0, -70], 5, 'rgba(230,240,255,.8)');
  c.beginPath(); c.moveTo(-34, -160); c.quadraticCurveTo(-40, -80, 0, -70); c.quadraticCurveTo(40, -80, 34, -160); c.closePath(); c.fillStyle = 'rgba(220,235,255,.18)'; c.fill();
  if (wine > 0) { c.save(); c.clip(); c.fillStyle = col; c.fillRect(-40, -70 - 80 * wine, 80, 80 * wine); c.restore(); }
  c.lineWidth = 3; c.strokeStyle = 'rgba(40,40,50,.8)'; c.stroke();
  line(c, [-22, -150, -26, -100], 4, 'rgba(255,255,255,.8)');
  c.restore();
}
function plate(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); ell(c, 0, 0, 90, 22, '#f6f3ec', 3); ell(c, 0, -2, 60, 14, '#ebe5d8', 2); c.restore(); }
function bottle(c, x, y, s = 1, col = '#2f5a3a') { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-26, 0); c.lineTo(-26, -150); c.quadraticCurveTo(-26, -190, -10, -205); c.lineTo(-10, -260); c.lineTo(10, -260); c.lineTo(10, -205); c.quadraticCurveTo(26, -190, 26, -150); c.lineTo(26, 0); c.closePath(); fs(c, col, 3); c.beginPath(); c.rect(-22, -120, 44, 60); fs(c, '#efe4c8', 2); line(c, [-16, -140, -16, -40], 5, 'rgba(255,255,255,.55)'); c.restore(); }
function edison(c, x, y, len, t, on = 1, seed = 0, s = 1) {
  const sw = Math.sin(t * 1.3 + seed) * .035;
  c.save(); c.translate(x, y); c.rotate(sw); line(c, [0, 0, 0, len], 3, '#1a1512');
  c.translate(0, len); c.scale(s, s);
  c.beginPath(); c.rect(-12, 0, 24, 26); fs(c, '#8a6a3a', 3);
  c.beginPath(); c.moveTo(-10, 26); c.bezierCurveTo(-40, 50, -40, 110, 0, 118); c.bezierCurveTo(40, 110, 40, 50, 10, 26); c.closePath(); c.fillStyle = on > 0 ? `rgba(255,${200 + 30 * on},${120 + 40 * on},${.55 + .4 * on})` : 'rgba(120,110,100,.5)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = 'rgba(40,30,20,.8)'; c.stroke();
  if (on > 0) { c.beginPath(); c.moveTo(-8, 40); for (let i = 0; i < 5; i++) c.lineTo(-8 + i * 4, 70 + (i % 2) * 12); c.lineWidth = 2; c.strokeStyle = '#fff4c8'; c.stroke(); glowAt(c, 0, 75, 190, '255,180,90', .6 * on); glowAt(c, 0, 75, 55, '255,240,200', .8 * on); }
  c.restore();
}
function balloon(c, x, y, col, t, s = 1, seed = 0, strLen = 300) {
  const sw = Math.sin(t * 1.6 + seed) * 12;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sw * .5, -strLen / 2, sw, -strLen); c.lineWidth = 2.5; c.strokeStyle = 'rgba(40,30,30,.8)'; c.stroke();
  c.translate(sw, -strLen - 70);
  c.beginPath(); c.ellipse(0, 0, 58, 72, 0, 0, Math.PI * 2); const g = c.createRadialGradient(-20, -26, 4, 0, 0, 80); g.addColorStop(0, shade(col, .55)); g.addColorStop(.5, col); g.addColorStop(1, shade(col, -.35)); fs(c, g, 4);
  c.beginPath(); c.moveTo(-8, 72); c.lineTo(8, 72); c.lineTo(0, 62); c.closePath(); fs(c, col, 3);
  ell(c, -22, -30, 10, 18, 'rgba(255,255,255,.7)', 0);
  c.restore();
}
function flowerPot(c, x, y, s = 1, seed = 0, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (rnd(seed + i) - .5) * 1.8, L = 90 + rnd(seed + i + 9) * 90, sw = Math.sin(t * 1.5 + i) * 4; c.beginPath(); c.moveTo(0, -90); c.quadraticCurveTo(Math.cos(a) * L * .5, -90 + Math.sin(a) * L * .5, Math.cos(a) * L + sw, -90 + Math.sin(a) * L); c.lineWidth = 7; c.strokeStyle = '#3f6b35'; c.stroke(); ell(c, Math.cos(a) * L * .6, -90 + Math.sin(a) * L * .6, 22, 10, '#4f8a3f', 2); }
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (rnd(seed + i) - .5) * 1.8, L = 90 + rnd(seed + i + 9) * 90, sw = Math.sin(t * 1.5 + i) * 4, fx = Math.cos(a) * L + sw, fy = -90 + Math.sin(a) * L, col = ['#e8455a', '#f4c542', '#f08a3c', '#d9488f'][i % 4]; for (let j = 0; j < 5; j++) ell(c, fx + Math.cos(j * 1.26) * 16, fy + Math.sin(j * 1.26) * 16, 13, 13, col, 2); ell(c, fx, fy, 8, 8, '#fff2b0', 2); }
  c.beginPath(); c.moveTo(-80, -100); c.lineTo(80, -100); c.lineTo(62, 0); c.lineTo(-62, 0); c.closePath(); fs(c, '#b8643c', 5); line(c, [-84, -100, 84, -100], 22, OUT); line(c, [-80, -100, 80, -100], 12, '#c97a4e');
  c.restore();
}
function chair(c, x, y, s = 1, col = '#6b4228') { c.save(); c.translate(x, y); c.scale(s, s); line(c, [-60, 0, -55, -220], 12, col); line(c, [60, 0, 55, -220], 12, col); line(c, [-55, -220, -50, -460], 12, col); line(c, [55, -220, 50, -460], 12, col); c.beginPath(); rrect(c, -70, -240, 140, 26, 6); fs(c, col, 4); for (let i = 0; i < 3; i++) line(c, [-50, -300 - i * 55, 50, -300 - i * 55], 10, shade(col, .1)); c.restore(); }
// table with white cloth; top centre at (x,y)
function table(c, x, y, w, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const cloth = o.cloth || '#f3eee4';
  c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(w / 2, 0); c.lineTo(w / 2 + 20, 170); for (let i = 0; i <= 10; i++) c.lineTo(w / 2 + 20 - i * (w + 40) / 10, 170 + (i % 2 ? 10 : 0)); c.lineTo(-w / 2 - 20, 170); c.closePath(); fs(c, cloth, 5);
  c.save(); c.globalAlpha = .18; for (let i = 1; i < 6; i++) line(c, [-w / 2 + i * w / 6, 10, -w / 2 - 20 + i * (w + 40) / 6, 165], 4, '#7a6a5a'); c.restore();
  c.beginPath(); c.ellipse(0, 0, w / 2, 26, 0, 0, Math.PI * 2); fs(c, shade(cloth, .3), 5);
  line(c, [-w * .3, 175, -w * .3, 330], 16, '#3b2618'); line(c, [w * .3, 175, w * .3, 330], 16, '#3b2618');
  c.restore();
}
function cardboard(c, x, y, w, h, s = 1, label = false) {
  c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.rect(-w / 2, -h, w, h); fs(c, '#c79a62', 5); c.beginPath(); c.moveTo(-w / 2, -h); c.lineTo(-w / 2 + 30, -h - 30); c.lineTo(w / 2 + 30, -h - 30); c.lineTo(w / 2, -h); c.closePath(); fs(c, '#d9b07a', 4);
  c.beginPath(); c.moveTo(w / 2, -h); c.lineTo(w / 2 + 30, -h - 30); c.lineTo(w / 2 + 30, -30); c.lineTo(w / 2, 0); c.closePath(); fs(c, '#a67c4a', 4);
  line(c, [-w / 2, -h + 40, w / 2, -h + 40], 14, '#d8c9a8'); if (label) { c.beginPath(); c.rect(-w / 4, -h / 2, w / 2, h / 4); fs(c, '#f2ead8', 2); line(c, [-w / 4 + 10, -h / 2 + 14, w / 6, -h / 2 + 14], 4, '#888'); }
  c.restore();
}
function confetti(c, ox, oy, t, n = 90, seed = 0) {
  if (t < 0) return;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rnd(seed + i) - .5) * 2.6, v = 900 + rnd(seed + i + 50) * 1300, tt = t, x = ox + Math.cos(a) * v * tt * Math.exp(-tt * 1.2) + Math.sin(tt * 3 + i) * 30 * tt, y = oy + Math.sin(a) * v * tt * Math.exp(-tt * 1.2) + 260 * tt * tt;
    const col = ['#ff4d5e', '#ffd23f', '#3ec1d3', '#7ed957', '#ff8fd0', '#ffffff', '#ffa23f'][i % 7], sp = tt * (6 + rnd(i) * 8) + i;
    c.save(); c.translate(x, y); c.rotate(sp); c.scale(1, Math.cos(sp * 1.7)); c.fillStyle = col; if (i % 3) c.fillRect(-9, -5, 18, 10); else { c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill(); } c.restore();
  }
}
function neonText(c, s, x, y, size, col, on, o = {}) {
  c.save(); c.font = `${o.weight || 800} ${size}px ${FONT()}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  if (o.font) c.font = o.font;
  // tube (off state)
  c.lineWidth = size * .13; c.strokeStyle = o.offCol || 'rgba(80,70,80,.9)'; c.lineJoin = 'round'; c.strokeText(s, x, y);
  if (on > 0.01) {
    c.globalAlpha = on; c.shadowColor = `rgb(${col})`;
    c.shadowBlur = size * .9; c.strokeStyle = `rgb(${col})`; c.lineWidth = size * .14; c.strokeText(s, x, y);
    c.shadowBlur = size * .35; c.strokeText(s, x, y);
    c.shadowBlur = 0; c.lineWidth = size * .05; c.strokeStyle = `rgba(255,255,255,.95)`; c.strokeText(s, x, y);
  }
  c.restore();
}
function calculator(c, x, y, s = 1, smoke = 0, t = 0, ang = 0) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  c.beginPath(); rrect(c, -90, -130, 180, 260, 16); fs(c, '#3a3f47', 5);
  c.beginPath(); rrect(c, -70, -110, 140, 56, 6); fs(c, '#a9c49a', 3); txt(c, smoke > .3 ? 'E' : '8888', 60, -66, 34, '#24321e', 'right');
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { c.beginPath(); rrect(c, -68 + j * 48, -36 + i * 40, 40, 32, 5); fs(c, j === 2 && i === 3 ? '#e0663a' : '#cfd3d8', 2); }
  c.restore();
  if (smoke > 0) smokeWisp(c, x, y - 130 * s, t, 1.4 * s, smoke, 7);
}
function notebook(c, x, y, ang, s = 1) { c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); c.beginPath(); rrect(c, -70, -95, 140, 190, 8); fs(c, '#f6f0de', 4); for (let i = 0; i < 6; i++) line(c, [-50, -60 + i * 26, 50, -60 + i * 26], 3, '#a9b8d0'); for (let i = 0; i < 6; i++) ell(c, -70, -80 + i * 32, 8, 8, '#888', 2); c.restore(); }
function tray(c, x, y, s = 1, t = 0) { c.save(); c.translate(x, y); c.scale(s, s); wineGlass(c, -40, -6, .7, .6); wineGlass(c, 40, -6, .7, .5, '#e8d27a'); c.beginPath(); c.ellipse(0, 0, 140, 22, 0, 0, Math.PI * 2); const g = c.createLinearGradient(-140, 0, 140, 0); g.addColorStop(0, '#9aa3b1'); g.addColorStop(.5, '#f3f5f8'); g.addColorStop(1, '#8a93a1'); fs(c, g, 4); c.restore(); }
