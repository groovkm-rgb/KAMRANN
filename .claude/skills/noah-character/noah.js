// NOAH: the user's character, coded from the reference sheet (reference.jpg).
// Units: 1 unit = 1/4 px of the reference sheet. Origin = between the feet, y up is negative.
// Standing height 1527 units. Measured from the FRONT figure; do not "restyle" these numbers.
// Usage (world space, toon-shorts engine or any canvas):
//   drawNoah(c, { x, y, k: .5, arms, expr, tilt, bob })   full body, front view
//   drawNoahHead(c, x, y, k, expr, tilt)                 head only (x,y = head centre)
//   drawNoahHand(c, x, y, k, ang)                         loose hand (e.g. on a blanket)
const NOAH = {
  out: '#211c1a', skin: '#ffffff', shade: '#dedad6', hair: '#564c46', hairDark: '#2f2926', hairLight: '#857a73',
  eye: '#231d1b', brow: '#6c625b', shirt: '#2a2624', letters: '#ddd8cf', pants: '#5a4e48', stripe: '#8e837c',
  shoe: '#3e332e', watch: '#b39b62', tongue: '#c9585e', mouthIn: '#5a2026',
  W: 13,                 // outline width (units)
  HEAD: { y: -1240, r: 262 },
  SHOULDER: { x: 150, y: -915 }, UPPER: 215, FORE: 205, ARM_W: 68,
  HEM: -510,
  // relaxed arms (angle from straight down, +outward), as in the reference front view
  ARMS: { l: { a: .13, b: -.08 }, r: { a: .13, b: -.08 } },
};
const nLine = (c, pts, w, col) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
const nFill = (c, fill, w = NOAH.W) => { if (fill) { c.fillStyle = fill; c.fill(); } if (w) { c.lineWidth = w; c.strokeStyle = NOAH.out; c.lineJoin = 'round'; c.stroke(); } };

function noahHairBack(c) {
  // hair ends that peek out under the head on both sides (behind head and neck)
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 205, -1150);
    c.lineTo(s * 196, -1010); c.lineTo(s * 182, -968); c.lineTo(s * 168, -1000); c.lineTo(s * 152, -955); c.lineTo(s * 136, -995); c.lineTo(s * 118, -962);
    c.lineTo(s * 96, -1040); c.lineTo(s * 60, -1150); c.closePath(); nFill(c, NOAH.hair, NOAH.W * .6);
  }
}
function noahFace(c, e) {
  const H = NOAH.HEAD, cy = H.y;
  // eyes
  for (const s of [-1, 1]) {
    const ex = s * 92, ey = cy + 25;
    if (e.eyes === 'closed') { c.beginPath(); c.moveTo(ex - 26, ey - 4); c.quadraticCurveTo(ex, ey + 20, ex + 26, ey - 4); c.lineWidth = 9; c.strokeStyle = NOAH.eye; c.lineCap = 'round'; c.stroke(); }
    else {
      const lid = e.lid || 0;
      c.save(); c.beginPath(); c.rect(ex - 40, ey - 40 + lid * 70, 80, 90); c.clip();
      c.beginPath(); c.ellipse(ex + (e.look || 0) * 6, ey, 23, 34, 0, 0, Math.PI * 2); c.fillStyle = NOAH.eye; c.fill(); c.restore();
      if (lid > .05) nLine(c, [ex - 25, ey - 34 + lid * 68, ex + 25, ey - 34 + lid * 68], 7, NOAH.eye);
    }
  }
  // brows (thin, slightly arched)
  const bu = (e.browUp || 0) * 18;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 140, cy - 22 - bu); c.quadraticCurveTo(s * 95, cy - 46 - bu, s * 52, cy - 36 - bu); c.lineWidth = 14; c.strokeStyle = NOAH.brow; c.lineCap = 'round'; c.stroke(); }
  // mouth
  const my = cy + 148, m = e.mouth || 'smile';
  if (m === 'smile') { c.beginPath(); c.moveTo(-62, my - 6); c.quadraticCurveTo(0, my + 22, 64, my - 6); c.lineWidth = 9; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke(); }
  else if (m === 'soft') { c.beginPath(); c.moveTo(-30, my); c.quadraticCurveTo(0, my + 10, 30, my); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (m === 'flat') nLine(c, [-34, my + 2, 34, my + 2], 8, NOAH.out);
  else if (m === 'o' || m === 'yawn') {
    const o = m === 'yawn' ? (e.open ?? 1) : .4, rw = 26 + 12 * o, rh = 14 + 46 * o;
    c.beginPath(); c.ellipse(0, my + 6, rw, rh, 0, 0, Math.PI * 2); c.fillStyle = NOAH.mouthIn; c.fill();
    c.save(); c.clip(); c.beginPath(); c.ellipse(0, my + 6 + rh * .75, rw * .8, rh * .5, 0, 0, Math.PI * 2); c.fillStyle = NOAH.tongue; c.fill(); c.restore();
    c.beginPath(); c.ellipse(0, my + 6, rw, rh, 0, 0, Math.PI * 2); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke();
  }
}
function noahHeadLocal(c, e = {}) {
  const H = NOAH.HEAD, cy = H.y, R = H.r;
  // skull + chin shade
  c.save(); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.fillStyle = NOAH.shade; c.fill(); c.clip();
  c.beginPath(); c.arc(-4, cy - 34, R - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.restore();
  c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); nFill(c, null);
  // hair cap: swept-back pompadour; hairline arches high in the middle, temples come down to eye level
  const hairline = (dir) => {
    // dir 1: right side -> centre -> left side; used for both fill and the outline
    c.bezierCurveTo(R - 8, cy - 60, R - 22, cy - 140, 190, cy - 165); c.bezierCurveTo(140, cy - 192, 70, cy - 145, 0, cy - 145);
    c.bezierCurveTo(-70, cy - 145, -140, cy - 192, -190, cy - 165); c.bezierCurveTo(-R + 22, cy - 140, -R + 8, cy - 60, -R + 6, cy - 8);
  };
  c.beginPath(); c.moveTo(-R + 6, cy - 8);
  c.bezierCurveTo(-R - 16, cy - 170, -175, cy - 300, 0, cy - 290);
  c.bezierCurveTo(175, cy - 300, R + 16, cy - 170, R - 6, cy - 8);
  hairline(1); c.closePath(); nFill(c, NOAH.hair, NOAH.W * .8);
  // strands sweep from the hairline up and back towards the crown
  c.save(); c.clip();
  // strands fan outward like ( ) as they sweep back, as on the reference
  for (const i of [-4.2, -2.9, -1.6, -.5, .6, 1.7, 3, 4.3]) {
    const x0 = i * 40, y0 = cy - 145 - Math.abs(i) * 14 + i * i * 2.2, sg = Math.sign(i);
    c.beginPath(); c.moveTo(x0, y0 + 8); c.quadraticCurveTo(x0 * 1.05 + sg * 10, cy - 250, x0 * 1.5 + sg * 30, cy - 300);
    c.lineWidth = Math.abs(i) > 2 ? 5 : 4; c.strokeStyle = Math.round(Math.abs(i)) % 2 ? NOAH.hairDark : NOAH.hairLight; c.lineCap = 'round'; c.stroke();
  }
  for (const s of [-1, 1]) for (let j = 0; j < 3; j++) { c.beginPath(); c.moveTo(s * (R - 14 - j * 10), cy - 10 - j * 12); c.quadraticCurveTo(s * (R - 20 - j * 12), cy - 110, s * (R - 70 - j * 18), cy - 190); c.lineWidth = 4; c.strokeStyle = j === 1 ? NOAH.hairLight : NOAH.hairDark; c.stroke(); }
  c.restore();
  c.beginPath(); c.moveTo(R - 6, cy - 8); hairline(1); c.lineWidth = NOAH.W * .8; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke();
  noahFace(c, e);
}
function noahLetters(c, x, y, sc = 1) {
  // the hand-lettered name on the shirt, as strokes (font-free, deterministic)
  c.save(); c.translate(x, y); c.scale(sc, sc); c.translate(-92, 0);
  const st = () => { c.lineWidth = 8; c.strokeStyle = NOAH.letters; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
  c.beginPath(); c.moveTo(2, 0); c.lineTo(0, -68); c.lineTo(40, -2); c.lineTo(42, -70); st();
  c.beginPath(); c.ellipse(72, -22, 17, 22, 0, 0, Math.PI * 2); st();
  c.beginPath(); c.ellipse(116, -22, 17, 22, 0, 0, Math.PI * 2); st(); c.beginPath(); c.moveTo(134, -42); c.lineTo(134, 0); st();
  c.beginPath(); c.moveTo(152, -76); c.lineTo(152, 0); c.moveTo(152, -26); c.quadraticCurveTo(168, -52, 184, -30); c.lineTo(184, 0); st();
  c.restore();
}
function noahHandLocal(c, ang) {
  // open, relaxed cartoon hand at the origin pointing along ang (0 = down)
  c.save(); c.rotate(ang);
  c.beginPath(); c.moveTo(-34, -6); c.quadraticCurveTo(-44, 50, -26, 92); c.quadraticCurveTo(-14, 104, -6, 86); c.lineTo(-4, 100); c.quadraticCurveTo(8, 112, 16, 94);
  c.lineTo(20, 98); c.quadraticCurveTo(32, 104, 34, 84); c.quadraticCurveTo(44, 40, 34, -6); c.closePath(); nFill(c, NOAH.skin, NOAH.W * .8);
  nLine(c, [-6, 86, -8, 60], 5, NOAH.out); nLine(c, [16, 94, 14, 62], 5, NOAH.out);
  // thumb
  c.beginPath(); c.moveTo(-32, 20); c.quadraticCurveTo(-62, 44, -52, 66); c.quadraticCurveTo(-40, 72, -30, 52); nFill(c, NOAH.skin, NOAH.W * .7);
  c.restore();
}
function noahArm(c, side, spec, watch, sleeve = true) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y;
  const a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  nLine(c, [sx, sy, ex, ey, wx, wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out);
  nLine(c, [sx, sy, ex, ey, wx, wy], NOAH.ARM_W, NOAH.skin);
  // short t-shirt sleeve in the arm's frame (u = along the arm, o = outward)
  const ux = side * Math.sin(a), uy = Math.cos(a), ox = side * Math.cos(a), oy = -Math.sin(a) * 1;
  const P = (u, o) => [sx + ux * u + ox * o, sy + uy * u + oy * o * side * side];
  if (sleeve) {
  const pts = [P(-28, -48), P(-26, 18), P(150, 66), P(166, -28)];
  c.beginPath(); c.moveTo(...pts[0]); c.quadraticCurveTo(...P(-40, -10), ...pts[1]); c.quadraticCurveTo(...P(60, 52), ...pts[2]); c.lineTo(...pts[3]); c.closePath(); nFill(c, NOAH.shirt); }
  if (watch) {
    const k = .82, cx = ex + (wx - ex) * k, cy = ey + (wy - ey) * k, fx = side * Math.sin(a2), fy = Math.cos(a2);
    nLine(c, [cx - fy * 40, cy + fx * 40, cx + fy * 40, cy - fx * 40], 22, NOAH.out); nLine(c, [cx - fy * 36, cy + fx * 36, cx + fy * 36, cy - fx * 36], 13, NOAH.watch);
    c.beginPath(); c.arc(cx + fy * 34 * side, cy - fx * 34 * side, 18, 0, Math.PI * 2); nFill(c, NOAH.watch, 8);
  }
  c.save(); c.translate(wx, wy); noahHandLocal(c, -side * a2 + (spec.hand || 0)); c.restore();
}
function noahLegs(c, p) {
  const top = NOAH.HEM - 10;
  for (const s of [-1, 1]) {
    const lift = (p.legs && p.legs[s < 0 ? 0 : 1]) || 0;
    c.beginPath(); c.moveTo(s * 4, top); c.lineTo(s * 116, top); c.lineTo(s * 108, -95 - lift); c.lineTo(s * 14, -95 - lift); c.closePath(); nFill(c, NOAH.pants);
    c.save(); c.clip(); for (let i = 0; i < 4; i++) { const x = s * (30 + i * 24); nLine(c, [x, top, x * .97, -90], 3, NOAH.stripe); } c.restore();
    c.beginPath(); c.moveTo(s * 20, -98 - lift); c.lineTo(s * 108, -98 - lift); c.quadraticCurveTo(s * 190, -66 - lift, s * 196, -16 - lift); c.quadraticCurveTo(s * 190, 4 - lift, s * 140, 2 - lift); c.lineTo(s * 30, 2 - lift); c.quadraticCurveTo(s * 10, -40 - lift, s * 20, -98 - lift); nFill(c, NOAH.shoe);
  }
}
function noahTorso(c) {
  c.beginPath(); c.moveTo(-58, -952); c.lineTo(-150, -942); c.quadraticCurveTo(-140, -820, -128, -760); c.lineTo(-122, NOAH.HEM); c.lineTo(126, NOAH.HEM);
  c.lineTo(132, -760); c.quadraticCurveTo(144, -820, 155, -942); c.lineTo(58, -952); c.quadraticCurveTo(0, -915, -58, -952); c.closePath(); nFill(c, NOAH.shirt);
  noahLetters(c, 4, -760, 1);
}
// ---- outfits (body clothes only; head, hair, face never change) ----
const NOAH_FUR = { fur: '#b8773c', furDark: '#7d4a22', furLight: '#d9a066', wrap: '#8a5a32' };
function noahTunic(c) {
  // stone-age fur tunic over the left shoulder, jagged hem; right shoulder bare
  c.beginPath(); c.moveTo(-58, -952); c.lineTo(-150, -942); c.quadraticCurveTo(-140, -820, -128, -760); c.lineTo(-122, NOAH.HEM + 20); c.lineTo(126, NOAH.HEM + 20);
  c.lineTo(132, -760); c.quadraticCurveTo(144, -820, 155, -942); c.lineTo(58, -952); c.quadraticCurveTo(0, -915, -58, -952); c.closePath(); nFill(c, NOAH.skin);
  c.beginPath(); c.moveTo(-138, -800); c.quadraticCurveTo(0, -860, 70, -955); c.lineTo(165, -945); c.quadraticCurveTo(150, -820, 142, -760);
  const hem = NOAH.HEM + 70; c.lineTo(146, hem - 10);
  for (let i = 0; i <= 8; i++) { const x = 146 - i * 37; c.lineTo(x - 18, hem + (i % 2 ? 34 : 6)); }
  c.lineTo(-140, hem - 10); c.lineTo(-136, -760); c.closePath(); nFill(c, NOAH_FUR.fur);
  c.save(); c.clip();
  for (let i = 0; i < 16; i++) { const x = -120 + ((i * 53) % 260), y = -820 + ((i * 97) % 330); c.beginPath(); c.ellipse(x, y, 16 + (i % 3) * 5, 11, i, 0, Math.PI * 2); c.fillStyle = NOAH_FUR.furDark; c.fill(); }
  for (let i = 0; i < 12; i++) { const x = -110 + ((i * 71) % 250), y = -780 + ((i * 61) % 300); nLine(c, [x, y, x + 10, y + 26], 4, NOAH_FUR.furLight); }
  c.restore();
  // rope belt
  nLine(c, [-128, NOAH.HEM - 40, 132, NOAH.HEM - 46], 22, NOAH.out); nLine(c, [-128, NOAH.HEM - 40, 132, NOAH.HEM - 46], 12, '#c9a46a');
}
function noahLegsSitting(c, p, bare) {
  // front view, seated on something seatH units high: knees towards the camera, shins straight down
  const seat = -(p.seatH ?? 250), kneeY = seat - 40;
  for (const s of [-1, 1]) {
    const kx = s * 150, fx = s * 120;
    if (bare) {
      nLine(c, [kx, kneeY, fx, -70], 96 + NOAH.W * 2, NOAH.out); nLine(c, [kx, kneeY, fx, -70], 96, NOAH.skin);
      c.beginPath(); c.moveTo(s * 10, kneeY - 90); c.lineTo(s * 150, kneeY - 75); c.lineTo(s * 205, kneeY + 5); c.lineTo(s * 95, kneeY + 30); c.lineTo(s * 10, kneeY - 10); c.closePath(); nFill(c, NOAH.skin);
      c.beginPath(); c.ellipse(kx, kneeY + 5, 64, 54, 0, 0, Math.PI * 2); nFill(c, NOAH.skin);
      // fur foot wraps
      c.beginPath(); c.moveTo(fx - 62, -120); c.lineTo(fx + 62, -120); c.quadraticCurveTo(fx + 85, -20, fx + 70, 4); c.lineTo(fx - 70, 4); c.quadraticCurveTo(fx - 85, -20, fx - 62, -120); nFill(c, NOAH_FUR.wrap);
      nLine(c, [fx - 60, -85, fx + 60, -95], 7, NOAH_FUR.furDark);
    } else {
      nLine(c, [kx, kneeY, fx, -80], 110 + NOAH.W * 2, NOAH.out); nLine(c, [kx, kneeY, fx, -80], 110, NOAH.pants);
      c.beginPath(); c.ellipse(kx, kneeY + 5, 72, 56, 0, 0, Math.PI * 2); nFill(c, NOAH.pants);
      c.beginPath(); c.ellipse(fx, -40, 80, 44, 0, 0, Math.PI * 2); nFill(c, NOAH.shoe);
    }
  }
}
function drawNoah(c, p = {}) {
  if (p.outfit === 'caveman' || p.sit) return drawNoahOutfit(c, p);
  const k = p.k ?? .5, arms = Object.assign({}, NOAH.ARMS, p.arms || {}), e = p.expr || {};
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
  if (p.lean) c.rotate(p.lean);
  noahLegs(c, p);
  c.save(); c.translate(0, p.bob || 0);
  noahTorso(c);
  // neck
  c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-46, -1000, -46, -948], 10, NOAH.out); nLine(c, [46, -1000, 46, -948], 10, NOAH.out);
  c.beginPath(); c.moveTo(-58, -952); c.quadraticCurveTo(0, -915, 58, -952); c.lineWidth = 10; c.strokeStyle = NOAH.out; c.stroke();
  const armsUp = arms.l.a > 1.6 || arms.r.a > 1.6;
  const drawArms = () => { noahArm(c, -1, arms.l, false); noahArm(c, 1, arms.r, true); };
  if (!armsUp) drawArms();
  c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
  noahHairBack(c); noahHeadLocal(c, e); c.restore();
  if (armsUp) drawArms();
  c.restore(); c.restore();
}
function drawNoahHead(c, x, y, k = .5, e = {}, tilt = 0) {
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(k, k); c.translate(0, -NOAH.HEAD.y); noahHairBack(c); noahHeadLocal(c, e); c.restore();
}
function drawNoahHand(c, x, y, k = .5, ang = 0) { c.save(); c.translate(x, y); c.scale(k, k); noahHandLocal(c, ang); c.restore(); }

// Full body with an outfit and/or seated. outfit: 'classic' (default) | 'caveman'. sit: true, seatH (units, default 250).
function drawNoahOutfit(c, p) {
  const k = p.k ?? .5, arms = Object.assign({}, NOAH.ARMS, p.arms || {}), e = p.expr || {};
  const cave = p.outfit === 'caveman', dy = p.sit ? (-(p.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0;
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
  if (p.sit) noahLegsSitting(c, p, cave);
  c.save(); c.translate(0, dy + (p.bob || 0));
  if (!p.sit) { if (cave) { for (const s of [-1, 1]) { nLine(c, [s * 60, NOAH.HEM, s * 62, -90], 96 + NOAH.W * 2, NOAH.out); nLine(c, [s * 60, NOAH.HEM, s * 62, -90], 96, NOAH.skin); } } else noahLegs(c, p); }
  if (cave) noahTunic(c); else noahTorso(c);
  c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-46, -1000, -46, -948], 10, NOAH.out); nLine(c, [46, -1000, 46, -948], 10, NOAH.out);
  if (!cave) { c.beginPath(); c.moveTo(-58, -952); c.quadraticCurveTo(0, -915, 58, -952); c.lineWidth = 10; c.strokeStyle = NOAH.out; c.stroke(); }
  const armsUp = arms.l.a > 1.6 || arms.r.a > 1.6;
  const drawArms = () => { noahArm(c, -1, arms.l, false, !cave); noahArm(c, 1, arms.r, !cave, !cave); };
  if (!armsUp) drawArms();
  c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
  noahHairBack(c); noahHeadLocal(c, e); c.restore();
  if (armsUp) drawArms();
  c.restore(); c.restore();
}
