// People for the school film, drawn in Noah's style (same skull, same ink, same proportions as noah.js).
// Rig units are Noah's (standing height 1527, feet at y = 0). Never change NOAH proportions here.

// ---------- extended face (same geometry as noah.js; adds brows/mouth variants, shine, blush, sweat) ----------
function noahFace(c, e) {
  const H = NOAH.HEAD, cy = H.y, sh = e.shift || 0, sq = e.squeeze || 1;
  const eyeX = s => sh + s * 92 * sq + (s > 0 && e.far ? -6 : 0);
  for (const s of [-1, 1]) {
    const ex = eyeX(s), ey = cy + 25, ew = (e.far && Math.sign(e.far) === s ? .78 : 1) * (e.eyeScale || 1);
    if (e.eyes === 'closed') { c.beginPath(); c.moveTo(ex - 26 * ew, ey - 4); c.quadraticCurveTo(ex, ey + 20, ex + 26 * ew, ey - 4); c.lineWidth = 9; c.strokeStyle = NOAH.eye; c.lineCap = 'round'; c.stroke(); }
    else if (e.eyes === 'squint') { nLine(c, [ex - 26, ey, ex + 26, ey], 9, NOAH.eye); }
    else {
      const lid = e.lid || 0, es = e.eyeScale || 1;
      c.save(); c.beginPath(); c.rect(ex - 40 * es, ey - 40 * es + lid * 70 * es, 80 * es, 90 * es); c.clip();
      c.beginPath(); c.ellipse(ex + (e.look || 0) * 6, ey + (e.lookY || 0) * 6, 23 * ew * es, 34 * es, 0, 0, Math.PI * 2); c.fillStyle = NOAH.eye; c.fill();
      if (e.shine) { c.beginPath(); c.arc(ex + (e.look || 0) * 6 + 7 * es, ey - 12 * es, 7 * es, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.arc(ex + (e.look || 0) * 6 - 6 * es, ey + 12 * es, 3.5 * es, 0, Math.PI * 2); c.fill(); }
      c.restore();
      if (lid > .05) nLine(c, [ex - 25 * es, ey - 34 * es + lid * 68 * es, ex + 25 * es, ey - 34 * es + lid * 68 * es], 7, NOAH.eye);
    }
  }
  const bu = (e.browUp || 0) * 18, br = e.brow || 'arch';
  for (const s of [-1, 1]) {
    const bx = eyeX(s) - s * 92 * sq, k = sq;
    c.beginPath();
    if (br === 'worried') { c.moveTo(bx + s * 140 * k, cy - 22 - bu); c.quadraticCurveTo(bx + s * 95 * k, cy - 40 - bu, bx + s * 52 * k, cy - 62 - bu); }
    else if (br === 'angry') { c.moveTo(bx + s * 140 * k, cy - 50 - bu); c.quadraticCurveTo(bx + s * 95 * k, cy - 42 - bu, bx + s * 52 * k, cy - 18 - bu); }
    else { c.moveTo(bx + s * 140 * k, cy - 22 - bu); c.quadraticCurveTo(bx + s * 95 * k, cy - 46 - bu, bx + s * 52 * k, cy - 36 - bu); }
    c.lineWidth = 14; c.strokeStyle = NOAH.brow; c.lineCap = 'round'; c.stroke();
  }
  if (e.blush) for (const s of [-1, 1]) { c.beginPath(); c.ellipse(eyeX(s) + s * 22, cy + 95, 42, 20, 0, 0, Math.PI * 2); c.fillStyle = `rgba(235,110,110,${.45 * e.blush})`; c.fill(); }
  if (e.freckles) for (const s of [-1, 1]) for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(eyeX(s) + s * (i * 13 - 20), cy + 88 + (i % 2) * 12, 4.5, 0, Math.PI * 2); c.fillStyle = 'rgba(170,110,70,.75)'; c.fill(); }
  if (e.beard) noahBeard(c, cy, e);
  const my = cy + 148, m = e.mouth || 'smile', mx = sh;
  c.save(); c.translate(mx, 0);
  if (m === 'smile') { c.beginPath(); c.moveTo(-62, my - 6); c.quadraticCurveTo(0, my + 22, 64, my - 6); c.lineWidth = 9; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke(); }
  else if (m === 'soft') { c.beginPath(); c.moveTo(-30, my); c.quadraticCurveTo(0, my + 10, 30, my); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (m === 'flat') nLine(c, [-34, my + 2, 34, my + 2], 8, NOAH.out);
  else if (m === 'frown') { c.beginPath(); c.moveTo(-40, my + 12); c.quadraticCurveTo(0, my - 14, 40, my + 12); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke(); }
  else if (m === 'wobbly') { c.beginPath(); c.moveTo(-40, my + 4); for (let i = 1; i <= 8; i++) c.lineTo(-40 + i * 10, my + 4 + (i % 2 ? -7 : 7)); c.lineWidth = 7; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke(); }
  else if (m === 'grin') { c.beginPath(); c.moveTo(-70, my - 12); c.quadraticCurveTo(0, my + 70, 72, my - 12); c.quadraticCurveTo(0, my + 6, -70, my - 12); c.closePath(); c.fillStyle = NOAH.mouthIn; c.fill(); c.save(); c.clip(); c.fillStyle = '#fff'; c.fillRect(-70, my - 14, 140, 18); c.beginPath(); c.ellipse(0, my + 48, 34, 16, 0, 0, Math.PI * 2); c.fillStyle = NOAH.tongue; c.fill(); c.restore(); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (m === 'o' || m === 'yawn' || m === 'gasp') {
    const o = m === 'yawn' ? (e.open ?? 1) : m === 'gasp' ? (e.open ?? .7) : .4, rw = 26 + 12 * o, rh = 14 + 46 * o;
    c.beginPath(); c.ellipse(0, my + 6, rw, rh, 0, 0, Math.PI * 2); c.fillStyle = NOAH.mouthIn; c.fill();
    c.save(); c.clip(); c.beginPath(); c.ellipse(0, my + 6 + rh * .75, rw * .8, rh * .5, 0, 0, Math.PI * 2); c.fillStyle = NOAH.tongue; c.fill(); c.restore();
    c.beginPath(); c.ellipse(0, my + 6, rw, rh, 0, 0, Math.PI * 2); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke();
  }
  c.restore();
  if (e.sweat) { c.save(); c.translate(sh + 200, cy - 90 + (e.sweatY || 0)); c.beginPath(); c.moveTo(0, -34); c.quadraticCurveTo(22, 0, 14, 14); c.arc(0, 12, 15, 0.3, Math.PI - .3); c.quadraticCurveTo(-22, 0, 0, -34); c.fillStyle = '#bfe3ff'; c.fill(); c.lineWidth = 6; c.strokeStyle = NOAH.out; c.stroke(); c.restore(); }
  if (e._moustache) { noahMoustache(c, cy); e._moustache = false; }
}

// ---------- palette swap so noah.js limb helpers draw other people ----------
function withPal(pal, fn) { const keep = {}; for (const k in pal) { keep[k] = NOAH[k]; NOAH[k] = pal[k]; } try { fn(); } finally { Object.assign(NOAH, keep); } }

// long sleeve arm (same geometry as noahArm)
function personArm(c, side, spec, P) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  if (P.sleeve === 'long') {
    const cuffX = ex + (wx - ex) * .86, cuffY = ey + (wy - ey) * .86;
    nLine(c, [sx, sy, ex, ey, cuffX, cuffY], NOAH.ARM_W + 26 + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey, cuffX, cuffY], NOAH.ARM_W + 26, P.top);
    nLine(c, [sx, sy + 20, ex, ey + 6], 4, 'rgba(0,0,0,.18)');
    const cx2 = ex + (wx - ex) * .8, cy2 = ey + (wy - ey) * .8; nLine(c, [cx2, cy2, cuffX, cuffY], NOAH.ARM_W + 30, P.cuff || shade(P.top, -.15)); nLine(c, [cx2, cy2, cuffX, cuffY], NOAH.ARM_W + 30 + NOAH.W * 2, 'rgba(0,0,0,0)');
    c.save(); c.translate(wx, wy); noahHandLocal(c, -side * a2 + (spec.hand || 0)); c.restore();
    if (P.glove) { c.save(); c.translate(wx, wy); c.rotate(-side * a2); c.globalCompositeOperation = 'source-atop'; c.restore(); }
  } else noahArm(c, side, spec, P.watch && side > 0, true);
}
// generic torso (Noah's outline), with clothing detail
function personTorso(c, P) {
  c.beginPath(); c.moveTo(-58, -952); c.lineTo(-150, -942); c.quadraticCurveTo(-140, -820, -128, -760); c.lineTo(-122 - (P.flare || 0), NOAH.HEM + (P.long || 0)); c.lineTo(126 + (P.flare || 0), NOAH.HEM + (P.long || 0));
  c.lineTo(132, -760); c.quadraticCurveTo(144, -820, 155, -942); c.lineTo(58, -952); c.quadraticCurveTo(0, -915, -58, -952); c.closePath(); nFill(c, P.top);
  c.save(); c.clip();
  if (P.kind === 'hoodie') {
    c.beginPath(); c.moveTo(-90, -660); c.lineTo(90, -660); c.lineTo(110, NOAH.HEM + 40); c.lineTo(-110, NOAH.HEM + 40); c.closePath(); c.fillStyle = shade(P.top, -.12); c.fill(); nLine(c, [-90, -660, 90, -660], 6, 'rgba(0,0,0,.35)');
    for (const s of [-1, 1]) { nLine(c, [s * 28, -930, s * 34, -800], 6, '#f2efe8'); c.beginPath(); c.arc(s * 34, -796, 8, 0, Math.PI * 2); c.fillStyle = '#f2efe8'; c.fill(); }
    c.fillStyle = shade(P.top, -.25); c.fillRect(-150, NOAH.HEM - 30 + (P.long || 0), 300, 40);
  }
  if (P.kind === 'sweater') { for (let y = -880; y < NOAH.HEM; y += 34) nLine(c, [-150, y, 150, y], 3, 'rgba(255,255,255,.12)'); c.fillStyle = shade(P.top, -.2); c.fillRect(-150, NOAH.HEM - 34 + (P.long || 0), 300, 44); star(c, -60, -760, 34, '#fff7d6'); }
  if (P.kind === 'cardigan') {
    c.beginPath(); c.moveTo(-58, -952); c.quadraticCurveTo(-10, -800, -28, NOAH.HEM + 60); c.lineTo(28, NOAH.HEM + 60); c.quadraticCurveTo(10, -800, 58, -952); c.quadraticCurveTo(0, -915, -58, -952); c.fillStyle = P.blouse || '#f4f1ea'; c.fill();
    nLine(c, [-58, -952, -12, -820, -28, NOAH.HEM + 60], 6, OUT); nLine(c, [58, -952, 12, -820, 28, NOAH.HEM + 60], 6, OUT);
    for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-40, -800 + i * 70, 7, 0, Math.PI * 2); c.fillStyle = '#e8dfc6'; c.fill(); }
    if (P.lanyard) { nLine(c, [-40, -930, 0, -740, 40, -930], 7, P.lanyard); c.fillStyle = '#fff'; c.fillRect(-26, -748, 52, 66); c.strokeStyle = OUT; c.lineWidth = 4; c.strokeRect(-26, -748, 52, 66); c.fillStyle = '#5a8fd0'; c.fillRect(-18, -738, 36, 18); }
  }
  if (P.kind === 'overall') { c.fillStyle = shade(P.top, -.1); c.fillRect(-110, -760, 220, 300); nLine(c, [-100, -950, -80, -760], 18, shade(P.top, -.2)); nLine(c, [100, -950, 80, -760], 18, shade(P.top, -.2)); c.fillStyle = shade(P.top, .12); c.fillRect(-60, -720, 120, 80); nLine(c, [-60, -720, 60, -720], 4, OUT); }
  // fabric folds / shading for volume
  nLine(c, [-110, -640, -70, -600], 4, 'rgba(0,0,0,.18)'); nLine(c, [100, -560, 70, -530], 4, 'rgba(0,0,0,.18)');
  c.restore();
}
function star(c, x, y, r, col) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 4; c.strokeStyle = OUT; c.stroke(); }

// ---------- hair styles (head-local units, head centre (0, -1240), R 262) ----------
const HAIR = {
  messy: { // Jonas: spiky tufts, fringe over the forehead
    back(c, P) { },
    front(c, P, back) {
      const cy = -1240, R = 262;
      c.beginPath(); c.moveTo(-R + 4, cy + 10);
      const tufts = [[-280, cy - 120], [-236, cy - 205], [-262, cy - 260], [-170, cy - 270], [-150, cy - 330], [-70, cy - 300], [-30, cy - 360], [30, cy - 300], [100, cy - 350], [130, cy - 280], [215, cy - 300], [210, cy - 220], [285, cy - 200], [252, cy - 110], [270, cy - 40]];
      for (const p of tufts) c.lineTo(p[0], p[1]);
      c.lineTo(R - 4, cy + 10);
      if (!back) { c.lineTo(R - 30, cy - 70); c.lineTo(190, cy - 100); c.lineTo(150, cy - 70); c.lineTo(120, cy - 125); c.lineTo(70, cy - 80); c.lineTo(30, cy - 135); c.lineTo(-20, cy - 88); c.lineTo(-60, cy - 140); c.lineTo(-110, cy - 92); c.lineTo(-150, cy - 140); c.lineTo(-200, cy - 100); c.lineTo(-R + 30, cy - 70); }
      else { c.lineTo(R - 10, cy + 80); c.lineTo(-R + 10, cy + 80); }
      c.closePath(); nFill(c, P.hair, NOAH.W * .8);
      c.save(); c.clip(); for (let i = 0; i < 9; i++) { const x = -200 + i * 50; nLine(c, [x, cy - 130, x + 20, cy - 250], 5, i % 2 ? shade(P.hair, -.3) : shade(P.hair, .25)); } c.restore();
    }
  },
  long: { // Lea: long chestnut hair with straight fringe, falls past the shoulders
    back(c, P) { c.beginPath(); c.moveTo(-250, -1300); c.quadraticCurveTo(-330, -1000, -290, -760); c.lineTo(-160, -720); c.lineTo(160, -720); c.lineTo(290, -760); c.quadraticCurveTo(330, -1000, 250, -1300); c.closePath(); nFill(c, P.hair, NOAH.W * .8); c.save(); c.clip(); for (let i = 0; i < 10; i++) { const x = -280 + i * 62; nLine(c, [x, -1200, x + (x < 0 ? -12 : 12), -740], 5, shade(P.hair, i % 2 ? -.25 : .2)); } c.restore(); },
    front(c, P, back) {
      const cy = -1240, R = 262;
      c.beginPath(); c.moveTo(-R - 14, cy + 120); c.bezierCurveTo(-R - 30, cy - 170, -175, cy - 305, 0, cy - 298); c.bezierCurveTo(175, cy - 305, R + 30, cy - 170, R + 14, cy + 120);
      if (back) { c.lineTo(R + 20, cy + 420); c.lineTo(-R - 20, cy + 420); }
      else { c.lineTo(R - 40, cy + 120); c.quadraticCurveTo(R - 40, cy - 60, 200, cy - 95); c.lineTo(-200, cy - 95); c.quadraticCurveTo(-R + 40, cy - 60, -R + 40, cy + 120); }
      c.closePath(); nFill(c, P.hair, NOAH.W * .8);
      c.save(); c.clip(); for (let i = 0; i < 12; i++) { const x = -230 + i * 42; nLine(c, [x, cy - 280, x * 1.1, cy - 100], 4, shade(P.hair, i % 2 ? -.25 : .22)); } c.restore();
      if (!back) star(c, 170, cy - 175, 34, '#ffd84a');
    }
  },
  bob: { // Frau Becker: chin-length bob, side parting
    back(c, P) { },
    front(c, P, back) {
      const cy = -1240, R = 262;
      c.beginPath(); c.moveTo(-R - 30, cy + 150); c.bezierCurveTo(-R - 40, cy - 190, -170, cy - 315, 10, cy - 300); c.bezierCurveTo(190, cy - 300, R + 40, cy - 190, R + 30, cy + 150); c.lineTo(R - 30, cy + 160);
      if (back) { c.lineTo(-R + 30, cy + 160); }
      else { c.quadraticCurveTo(R - 10, cy - 40, 160, cy - 130); c.quadraticCurveTo(60, cy - 175, -60, cy - 215); c.quadraticCurveTo(-200, cy - 120, -R + 30, cy + 160); }
      c.closePath(); nFill(c, P.hair, NOAH.W * .8);
      c.save(); c.clip(); for (let i = 0; i < 9; i++) { const x = -220 + i * 55; nLine(c, [x * .4, cy - 290, x * 1.15, cy + 140], 4, shade(P.hair, i % 2 ? -.25 : .2)); } c.restore();
    }
  },
  crew: { // short hair (Krüger: greying crew cut)
    back(c, P) { },
    front(c, P, back) {
      const cy = -1240, R = 262;
      c.beginPath(); c.moveTo(-R + 2, cy - 10); c.bezierCurveTo(-R - 6, cy - 200, -160, cy - 285, 0, cy - 282); c.bezierCurveTo(160, cy - 285, R + 6, cy - 200, R - 2, cy - 10);
      if (back) c.lineTo(R - 10, cy + 90), c.lineTo(-R + 10, cy + 90); else { c.lineTo(R - 22, cy - 40); c.quadraticCurveTo(150, cy - 200, 0, cy - 190); c.quadraticCurveTo(-150, cy - 200, -R + 22, cy - 40); }
      c.closePath(); nFill(c, P.hair, NOAH.W * .8);
      c.save(); c.clip(); for (let i = 0; i < 40; i++) { const x = -230 + rnd(i) * 460, y = cy - 270 + rnd(i + 40) * 120; nLine(c, [x, y, x + 4, y + 14], 3, shade(P.hair, .3)); } c.restore();
    }
  },
};

function personHead(c, P, e = {}, back = false) {
  const cy = -1240, R = 262;
  const hs = HAIR[P.hairStyle] || HAIR.crew;
  c.save(); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.fillStyle = NOAH.shade; c.fill(); c.clip();
  c.beginPath(); c.arc(-4, cy - 34, R - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.restore();
  c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); nFill(c, null);
  if (!back) {
    withPal({ hair: P.hair }, () => noahFace(c, Object.assign({ freckles: P.freckles }, e)));
    if (P.glasses) { for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 92, cy + 25, 58, 52, 0, 0, Math.PI * 2); c.lineWidth = 11; c.strokeStyle = P.glasses; c.stroke(); } nLine(c, [-34, cy + 18, 34, cy + 18], 9, P.glasses); c.save(); c.globalAlpha = .25; for (const s of [-1, 1]) nLine(c, [s * 92 - 30, cy + 5, s * 92 - 10, cy - 15], 6, '#fff'); c.restore(); }
  }
  if (back) personHairBack(c, P); else hs.front(c, P, back);
}
function personHairBack(c, P) {
  const cy = -1240, R = 262, st = P.hairStyle, len = st === 'long' ? 520 : st === 'bob' ? 170 : st === 'crew' ? 40 : 90;
  c.beginPath(); c.moveTo(-R - (st === 'bob' ? 30 : 4), cy - 10);
  if (st === 'messy') { const tf = [[-280, cy - 120], [-236, cy - 205], [-262, cy - 260], [-170, cy - 270], [-150, cy - 330], [-70, cy - 300], [-30, cy - 360], [30, cy - 300], [100, cy - 350], [130, cy - 280], [215, cy - 300], [210, cy - 220], [285, cy - 200], [252, cy - 110]]; for (const p of tf) c.lineTo(p[0], p[1]); }
  else { c.bezierCurveTo(-R - 30, cy - 200, -175, cy - 305, 0, cy - 298); c.bezierCurveTo(175, cy - 305, R + 30, cy - 200, R + (st === 'bob' ? 30 : 4), cy - 10); }
  c.lineTo(R + (st === 'long' ? 20 : st === 'bob' ? 30 : 0), cy + len); 
  const n = 9; for (let i = 1; i < n; i++) { const x = R - i * 2 * R / n; c.lineTo(x, cy + len + (i % 2 ? 26 : -4) * (st === 'crew' ? 0 : 1)); }
  c.lineTo(-R - (st === 'long' ? 20 : st === 'bob' ? 30 : 0), cy + len); c.closePath(); nFill(c, P.hair, NOAH.W * .8);
  c.save(); c.clip(); for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * 22, cy - 290); c.quadraticCurveTo(i * 48, cy - 40, i * 44, cy + len + 20); c.lineWidth = 5; c.strokeStyle = shade(P.hair, i % 2 ? -.25 : .2); c.stroke(); } c.restore();
}
// full person, front or back view. P = palette/style, p = pose ({ x, y, k, arms, expr, tilt, back, sit, seatH, lean })
function drawPerson(c, P, p = {}) {
  const W0 = NOAH.W; if (p.ink) NOAH.W = W0 * p.ink;
  const k = p.k ?? .25, arms = Object.assign({}, NOAH.ARMS, p.arms || {}), e = p.expr || {}, sc = P.scale || 1;
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * sc * (p.s || 1), k * sc * (P.tall || 1)); if (p.lean) c.rotate(p.lean);
  withPal({ pants: P.pants, shoe: P.shoe, stripe: P.stripe || shade(P.pants, .15), shirt: P.top, hair: P.hair }, () => {
    if (p.sit) { if (!p.back) noahLegsSitting(c, p, false); }
    else if (P.skirt) { // legs + skirt
      for (const s of [-1, 1]) { nLine(c, [s * 60, NOAH.HEM, s * 62, -90], 90 + NOAH.W * 2, NOAH.out); nLine(c, [s * 60, NOAH.HEM, s * 62, -90], 90, P.tights || '#4a3f5a'); c.beginPath(); c.ellipse(s * 80, -40, 80, 44, 0, 0, Math.PI * 2); nFill(c, P.shoe); }
      c.beginPath(); c.moveTo(-128, NOAH.HEM - 20); c.lineTo(128, NOAH.HEM - 20); c.lineTo(175, -330); c.lineTo(-175, -330); c.closePath(); nFill(c, P.skirt);
    } else noahLegs(c, p);
    c.save(); c.translate(0, p.sit ? (-(p.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0); c.translate(0, p.bob || 0);
    if (P.hairStyle === 'long' && !p.back) HAIR.long.back(c, P);
    if (P.kind === 'hoodie') { c.beginPath(); c.ellipse(0, -945, 175, 62, 0, 0, Math.PI * 2); nFill(c, shade(P.top, -.1)); }
    const armsUp = arms.l.a > 1.6 || arms.r.a > 1.6;
    const drawArms = () => { personArm(c, -1, arms.l, P); personArm(c, 1, arms.r, P); };
    if (p.back) {
      personTorso(c, Object.assign({}, P, { kind: P.kind === 'cardigan' ? 'plain' : P.kind === 'hoodie' ? 'plain' : P.kind })); if (P.kind === 'hoodie') { c.beginPath(); c.moveTo(-120, -950); c.quadraticCurveTo(0, -760, 120, -950); c.closePath(); nFill(c, shade(P.top, -.12)); }
      if (!armsUp) drawArms();
      c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260)); personHead(c, P, e, true); c.restore();
      if (armsUp) drawArms();
    } else {
      personTorso(c, P);
      c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-46, -1000, -46, -948], 10, NOAH.out); nLine(c, [46, -1000, 46, -948], 10, NOAH.out);
      c.beginPath(); c.moveTo(-58, -952); c.quadraticCurveTo(0, -915, 58, -952); c.lineWidth = 10; c.strokeStyle = NOAH.out; c.stroke();
      if (!armsUp) drawArms();
      c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260)); personHead(c, P, e, false); c.restore();
      if (armsUp) drawArms();
      if (P.keys) { c.save(); c.translate(120, NOAH.HEM - 10); for (let i = 0; i < 5; i++) { c.save(); c.rotate(-.5 + i * .25); c.fillStyle = i % 2 ? '#c9b46a' : '#b8bcc4'; c.fillRect(-6, 10, 12, 70); c.strokeStyle = OUT; c.lineWidth = 4; c.strokeRect(-6, 10, 12, 70); c.restore(); } c.beginPath(); c.arc(0, 0, 22, 0, Math.PI * 2); c.lineWidth = 8; c.strokeStyle = '#8a8f98'; c.stroke(); c.restore(); }
    }
    c.restore();
  });
  c.restore(); NOAH.W = W0;
}

const CAST = {
  jonas: { hairStyle: 'messy', hair: '#c4863f', top: '#3f8a5a', kind: 'hoodie', sleeve: 'long', pants: '#3e5a86', shoe: '#e9e4da', freckles: 1 },
  lea: { hairStyle: 'long', hair: '#7b4526', top: '#e2a93b', kind: 'sweater', sleeve: 'long', pants: '#2f3550', shoe: '#7a4fa0' },
  becker: { hairStyle: 'bob', hair: '#8b7b70', top: '#2f8a8a', kind: 'cardigan', sleeve: 'long', blouse: '#f6f2ea', pants: '#3b3a44', shoe: '#2a2420', glasses: '#b8352f', lanyard: '#d8453a', scale: 1.0, tall: 1.1 },
  krueger: { hairStyle: 'crew', hair: '#9a948c', top: '#3f5f86', kind: 'overall', sleeve: 'long', pants: '#3a5478', shoe: '#2a2420', keys: 1, scale: 1.06, tall: 1.12 },
  schroeder: { hairStyle: 'bob', hair: '#c9c2b8', top: '#7a2f45', kind: 'cardigan', sleeve: 'long', blouse: '#efe6d8', pants: '#2a2a33', shoe: '#2a2420', glasses: '#2a2420', scale: 1.0, tall: 1.1 },
  student1: { hairStyle: 'crew', hair: '#2f2620', top: '#c8463c', kind: 'plain', pants: '#2e3445', shoe: '#ddd' },
  student2: { hairStyle: 'long', hair: '#e0c07a', top: '#5a6fc0', kind: 'sweater', sleeve: 'long', pants: '#3a3340', shoe: '#c44' },
  student3: { hairStyle: 'messy', hair: '#3a2a22', top: '#8a5ab0', kind: 'hoodie', sleeve: 'long', pants: '#33363d', shoe: '#eee' },
};

// ---------- Noah back view and 3/4 view (built from the front rig; head/body sizes unchanged) ----------
function drawNoahBack(c, p = {}) {
  const W0 = NOAH.W; if (p.ink) NOAH.W = W0 * p.ink;
  const k = p.k ?? .25, arms = Object.assign({}, NOAH.ARMS, p.arms || {});
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
  if (p.sit) noahLegsSitting(c, p, false); else noahLegs(c, p);
  c.save(); c.translate(0, p.sit ? (-(p.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0);
  // plain back of the black t-shirt
  c.beginPath(); c.moveTo(-58, -952); c.lineTo(-150, -942); c.quadraticCurveTo(-140, -820, -128, -760); c.lineTo(-122, NOAH.HEM); c.lineTo(126, NOAH.HEM); c.lineTo(132, -760); c.quadraticCurveTo(144, -820, 155, -942); c.lineTo(58, -952); c.closePath(); nFill(c, NOAH.shirt);
  nLine(c, [0, -900, 0, -600], 4, 'rgba(255,255,255,.06)');
  noahArm(c, 1, arms.l, false); noahArm(c, -1, arms.r, true);
  c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
  const cy = NOAH.HEAD.y, R = NOAH.HEAD.r;
  c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); nFill(c, NOAH.skin);
  // hair covers the back of the head and hangs to the neck in points
  c.beginPath(); c.moveTo(-R - 4, cy - 20); c.bezierCurveTo(-R - 14, cy - 190, -175, cy - 300, 0, cy - 292); c.bezierCurveTo(175, cy - 300, R + 14, cy - 190, R + 4, cy - 20);
  c.lineTo(205, cy + 120); c.lineTo(182, cy + 272); c.lineTo(150, cy + 230); c.lineTo(110, cy + 290); c.lineTo(66, cy + 238); c.lineTo(22, cy + 300); c.lineTo(-22, cy + 240); c.lineTo(-66, cy + 296); c.lineTo(-110, cy + 236); c.lineTo(-150, cy + 286); c.lineTo(-182, cy + 232); c.lineTo(-205, cy + 120); c.closePath(); nFill(c, NOAH.hair, NOAH.W * .8);
  c.save(); c.clip(); for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(i * 20, cy - 290); c.quadraticCurveTo(i * 46, cy - 60, i * 40, cy + 280); c.lineWidth = 5; c.strokeStyle = i % 2 ? NOAH.hairDark : NOAH.hairLight; c.stroke(); } c.restore();
  c.restore();
  c.restore(); c.restore(); NOAH.W = W0;
}
// 3/4 view: turn = +1 faces the viewer's right, -1 the left. Face features slide towards the turn, far eye narrows,
// more hair shows on the back side; torso lettering slides and narrows. Sizes measured from the sheet's 3/4 figure.
function drawNoah34(c, p = {}) {
  const W0 = NOAH.W; if (p.ink) NOAH.W = W0 * p.ink;
  const k = p.k ?? .25, s = p.turn || 1, arms = Object.assign({}, NOAH.ARMS, p.arms || {}), e = p.expr || {};
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * s, k); // mirror so the code below is written for "facing right"
  if (p.sit) noahLegsSitting(c, p, false); else noahLegs(c, p);
  c.save(); c.translate(0, p.sit ? (-(p.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0); c.translate(0, p.bob || 0);
  const far = Object.assign({}, arms.r); noahArm(c, 1, { a: far.a * .7, b: far.b, hand: far.hand }, false);
  c.beginPath(); c.moveTo(-40, -952); c.lineTo(-150, -942); c.quadraticCurveTo(-140, -820, -128, -760); c.lineTo(-122, NOAH.HEM); c.lineTo(116, NOAH.HEM); c.lineTo(122, -760); c.quadraticCurveTo(132, -820, 140, -942); c.lineTo(70, -952); c.quadraticCurveTo(15, -915, -40, -952); c.closePath(); nFill(c, NOAH.shirt);
  c.save(); c.beginPath(); c.rect(-128, -980, 250, 480); c.clip(); c.translate(36, 0); c.scale(.86, 1); noahLetters(c, 4, -760, 1); c.restore();
  c.beginPath(); c.rect(-30, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-30, -1000, -30, -948], 10, NOAH.out); nLine(c, [62, -1000, 62, -948], 10, NOAH.out);
  c.beginPath(); c.moveTo(-40, -952); c.quadraticCurveTo(15, -915, 70, -952); c.lineWidth = 10; c.strokeStyle = NOAH.out; c.stroke();
  const armsUp = arms.l.a > 1.6; if (!armsUp) noahArm(c, -1, arms.l, true);
  c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate((p.tilt || 0) * s); c.translate(0, -(NOAH.HEAD.y + 260));
  noahHead34(c, e, s);
  c.restore(); if (armsUp) noahArm(c, -1, arms.l, true);
  c.restore(); c.restore(); NOAH.W = W0;
}
function noahHead34(c, e, s) {
  const cy = NOAH.HEAD.y, R = NOAH.HEAD.r;
  // back hair ends (more on the back side)
  c.beginPath(); c.moveTo(-205, -1150); c.lineTo(-232, -1010); c.lineTo(-214, -962); c.lineTo(-192, -1004); c.lineTo(-170, -955); c.lineTo(-146, -1000); c.lineTo(-120, -962); c.lineTo(-96, -1040); c.lineTo(-60, -1150); c.closePath(); nFill(c, NOAH.hair, NOAH.W * .6);
  c.beginPath(); c.moveTo(205, -1150); c.lineTo(190, -1012); c.lineTo(172, -985); c.lineTo(150, -1050); c.closePath(); nFill(c, NOAH.hair, NOAH.W * .6);
  c.save(); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.fillStyle = NOAH.shade; c.fill(); c.clip();
  c.beginPath(); c.arc(8, cy - 34, R - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.restore();
  c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); nFill(c, null);
  const d = 52; // hairline centre slides towards the face side
  const hairline = () => { c.bezierCurveTo(R - 4, cy - 60, R - 16, cy - 140, 200, cy - 168); c.bezierCurveTo(160, cy - 190, 100 + d * .3, cy - 145, d, cy - 145); c.bezierCurveTo(-40 + d * .2, cy - 145, -120, cy - 190, -175, cy - 160); c.bezierCurveTo(-R + 10, cy - 120, -R - 4, cy - 40, -R + 4, cy + 30); };
  c.beginPath(); c.moveTo(-R + 4, cy + 30); c.bezierCurveTo(-R - 26, cy - 170, -175, cy - 300, 10, cy - 292); c.bezierCurveTo(180, cy - 300, R + 12, cy - 170, R - 3, cy - 8); hairline(); c.closePath(); nFill(c, NOAH.hair, NOAH.W * .8);
  c.save(); c.clip();
  for (const i of [-4.4, -3.2, -2, -.9, .3, 1.5, 2.8, 4]) { const x0 = i * 40 + d * .6, y0 = cy - 145 - Math.abs(i) * 12, sg = Math.sign(i - .5) || 1; c.beginPath(); c.moveTo(x0, y0 + 8); c.quadraticCurveTo(x0 * 1.05 + sg * 10, cy - 250, x0 * 1.4 + sg * 30 - 20, cy - 300); c.lineWidth = 4; c.strokeStyle = Math.round(Math.abs(i)) % 2 ? NOAH.hairDark : NOAH.hairLight; c.lineCap = 'round'; c.stroke(); }
  for (let j = 0; j < 4; j++) { c.beginPath(); c.moveTo(-(R - 10 - j * 12), cy + 20 - j * 14); c.quadraticCurveTo(-(R - 24 - j * 14), cy - 110, -(R - 80 - j * 18), cy - 195); c.lineWidth = 4; c.strokeStyle = j % 2 ? NOAH.hairLight : NOAH.hairDark; c.stroke(); }
  c.restore();
  c.beginPath(); c.moveTo(R - 3, cy - 8); hairline(); c.lineWidth = NOAH.W * .8; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke();
  noahFace(c, Object.assign({}, e, { shift: d, squeeze: .86, far: 1 }));
}

// ---------- the attacker: never a clear face, no weapon. Mostly silhouette with cool rim light ----------
// view: 'front' | 'back' | 'side' (s = ±1); rim: 0..1 rim light strength; dark: 0..1 crush to silhouette
function drawAttacker(c, p = {}) {
  const k = (p.k ?? .25) * 1.18, view = p.view || 'front', s = p.s || 1, wk = p.walk, walking = wk != null;
  const J = '#16171c', J2 = '#22242b', J3 = '#2c2f38', SEAM = 'rgba(120,130,150,.35)', O = '#07070a';
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (view === 'side' ? s : 1), k);
  const lw = 12, fl = (fill) => { c.fillStyle = fill; c.fill(); c.lineWidth = lw; c.strokeStyle = O; c.lineJoin = 'round'; c.stroke(); };
  const sw = walking ? Math.sin(wk) : 0;
  // legs: cargo trousers + heavy boots
  const leg = (dx, th, far) => {
    c.save(); c.translate(dx, -560); c.rotate(th);
    c.beginPath(); c.moveTo(-70, 0); c.lineTo(70, 0); c.lineTo(62, 470); c.lineTo(-62, 470); c.closePath(); fl(far ? '#1d2027' : '#262a33');
    c.beginPath(); c.rect(view === 'side' ? 0 : (dx < 0 ? -74 : 20), 150, 56, 90); fl('#2e323c'); nLine(c, [view === 'side' ? 6 : (dx < 0 ? -70 : 24), 168, view === 'side' ? 50 : (dx < 0 ? -22 : 72), 168], 4, SEAM);
    nLine(c, [0, 20, 0, 460], 3, SEAM); for (let i = 0; i < 4; i++) nLine(c, [-50, 300 + i * 28, 40, 290 + i * 28], 3, 'rgba(0,0,0,.4)');
    c.beginPath(); if (view === 'side') { c.moveTo(-72, 440); c.lineTo(-74, 560); c.lineTo(150, 562); c.quadraticCurveTo(170, 520, 120, 480); c.lineTo(66, 440); } else { c.moveTo(-80, 440); c.lineTo(80, 440); c.lineTo(92, 560); c.lineTo(-92, 560); } c.closePath(); fl('#101114');
    c.fillStyle = '#2b2b2b'; c.fillRect(-90, 540, view === 'side' ? 250 : 182, 22); for (let i = 0; i < 4; i++) nLine(c, [-50 + i * 30, 460, -30 + i * 30, 470], 4, '#3a3d46');
    c.restore();
  };
  if (view === 'side') { leg(0, walking ? -.35 * sw : -.05, true); leg(0, walking ? .35 * sw : .05, false); }
  else { leg(-75, 0, false); leg(75, 0, false); }
  // padded hooded jacket
  c.beginPath();
  if (view === 'side') { c.moveTo(-150, -1060); c.quadraticCurveTo(-200, -800, -170, -470); c.lineTo(150, -470); c.quadraticCurveTo(170, -800, 120, -1060); c.closePath(); }
  else { c.moveTo(-200, -1070); c.quadraticCurveTo(-245, -800, -215, -450); c.lineTo(215, -450); c.quadraticCurveTo(245, -800, 200, -1070); c.quadraticCurveTo(0, -1110, -200, -1070); c.closePath(); }
  fl(J);
  c.save(); c.clip();
  for (let i = 0; i < 6; i++) { const y = -1000 + i * 92; c.beginPath(); c.moveTo(-260, y); c.quadraticCurveTo(0, y + 26, 260, y); c.lineWidth = 5; c.strokeStyle = SEAM; c.stroke(); c.beginPath(); c.moveTo(-260, y + 40); c.quadraticCurveTo(0, y + 66, 260, y + 40); c.lineWidth = 16; c.strokeStyle = 'rgba(255,255,255,.035)'; c.stroke(); }
  if (view === 'front') { nLine(c, [0, -1080, 0, -450], 9, '#3b3f4a'); for (let y = -1060; y < -460; y += 16) nLine(c, [-7, y, 7, y], 3, '#555a66'); c.beginPath(); c.rect(-14, -1010, 28, 46); fl('#5a5f6a'); for (const sx of [-1, 1]) { c.beginPath(); c.rect(sx * 60 - 50 + (sx > 0 ? 0 : 0), -640, 100, 120); fl(J2); nLine(c, [sx * 60 - 46, -630, sx * 60 + 46, -630], 4, SEAM); } }
  if (view === 'back') { nLine(c, [0, -1060, 0, -470], 4, SEAM); }
  c.fillStyle = J3; c.fillRect(-260, -500, 520, 50); // elastic hem
  for (let i = 0; i < 8; i++) nLine(c, [-200 + rnd(i) * 400, -900 + rnd(i + 9) * 380, -170 + rnd(i) * 400, -860 + rnd(i + 9) * 380], 4, 'rgba(0,0,0,.45)');
  c.restore();
  // arms in thick sleeves, gloves
  const arm = (side, a, far) => {
    c.save(); c.translate(view === 'side' ? -10 : side * 190, -1010); c.rotate(-side * a);
    c.beginPath(); c.moveTo(-62, 0); c.quadraticCurveTo(-82, 260, -60, 470); c.lineTo(60, 470); c.quadraticCurveTo(74, 240, 62, 0); c.closePath(); fl(far ? '#121318' : J2);
    for (let i = 0; i < 4; i++) nLine(c, [-55, 120 + i * 90, 55, 128 + i * 90], 4, SEAM);
    c.fillStyle = J3; c.fillRect(-62, 440, 124, 34);
    c.beginPath(); c.ellipse(0, 540, 58, 74, 0, 0, Math.PI * 2); fl('#0c0c0f'); nLine(c, [-30, 500, -34, 590], 4, '#2a2c33'); nLine(c, [0, 500, 0, 600], 4, '#2a2c33'); nLine(c, [30, 500, 32, 590], 4, '#2a2c33');
    c.restore();
  };
  if (view === 'side') arm(1, walking ? -.3 * sw : .05, true);
  else { arm(-1, .06 + (p.armL || 0), false); arm(1, .06 + (p.armR || 0), false); }
  // hood + balaclava (no face: eye band is a deep shadow slit, no eyes drawn)
  c.save(); c.translate(view === 'side' ? 10 : 0, 0); c.rotate(p.headTurn || 0);
  c.beginPath(); c.moveTo(-235, -1050); c.bezierCurveTo(-300, -1300, -190, -1560, 0, -1570); c.bezierCurveTo(190, -1560, 300, -1300, 235, -1050); c.quadraticCurveTo(0, -1000, -235, -1050); c.closePath(); fl('#131419');
  if (view !== 'back') {
    c.beginPath(); c.moveTo(-170, -1080); c.bezierCurveTo(-210, -1280, -140, -1460, 0, -1465); c.bezierCurveTo(140, -1460, 210, -1280, 170, -1080); c.quadraticCurveTo(0, -1040, -170, -1080); c.closePath(); c.fillStyle = '#060608'; c.fill();
    if (view === 'side') { c.save(); c.beginPath(); c.ellipse(120, -1280, 120, 190, 0, 0, Math.PI * 2); c.fillStyle = '#0d0e12'; c.fill(); c.restore(); }
    // knit texture of the balaclava + the eye slit as a darker band (never eyes)
    c.save(); c.beginPath(); c.moveTo(-150, -1090); c.bezierCurveTo(-185, -1270, -120, -1420, 0, -1425); c.bezierCurveTo(120, -1420, 185, -1270, 150, -1090); c.closePath(); c.fillStyle = '#101115'; c.fill(); c.clip();
    for (let x = -150; x <= 150; x += 18) nLine(c, [x, -1430, x, -1080], 3, 'rgba(255,255,255,.035)');
    c.beginPath(); rrect(c, -120, -1330, 240, 70, 35); c.fillStyle = '#020203'; c.fill(); c.restore();
  } else { c.save(); c.clip(); for (let i = 0; i < 5; i++) nLine(c, [-200 + i * 100, -1540, -230 + i * 115, -1060], 4, SEAM); c.restore(); }
  c.restore();
  if (view === 'side') arm(1, walking ? .3 * sw : -.05, false);
  c.restore();
}

// ---------- 3D look for 2D characters: render to a buffer, add form shading, rim light and AO, then composite ----------
// fn(c) draws the character with the current transform. o: { light: [dx, dy] screen dir towards key light, rim: rgb, rimA, shadeA, warm }
function drawLit(c, fn, o = {}) {
  const B = buf('ch'), M = c.getTransform();
  B.c.setTransform(M); fn(B.c); B.c.setTransform(1, 0, 0, 1, 0, 0);
  const L = o.light || [-1, -.4], ll = Math.hypot(L[0], L[1]), lx = L[0] / ll, ly = L[1] / ll;
  const bb = o.bounds; // screen-space bounds [x0, y0, x1, y1] to limit gradient work
  const x0 = bb ? bb[0] : 0, y0 = bb ? bb[1] : 0, x1 = bb ? bb[2] : W, y1 = bb ? bb[3] : H, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = (x1 - x0) / 2, hh = (y1 - y0) / 2;
  const R = Math.hypot(hw, hh);
  // form shade: darker away from the light
  B.c.globalCompositeOperation = 'source-atop';
  let g = B.c.createLinearGradient(cx + lx * R, cy + ly * R, cx - lx * R, cy - ly * R);
  g.addColorStop(0, `rgba(${o.warm || '255,230,190'},${o.warmA ?? .1})`); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(${o.shadeCol || '20,25,60'},${o.shadeA ?? .32})`);
  B.c.fillStyle = g; B.c.fillRect(x0, y0, x1 - x0, y1 - y0);
  // ground AO near the feet
  if (o.feetY != null) { g = B.c.createLinearGradient(0, o.feetY - hh * .35, 0, o.feetY); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,10,25,.35)'); B.c.fillStyle = g; B.c.fillRect(x0, o.feetY - hh * .4, x1 - x0, hh * .4 + 4); }
  // rim light: silhouette minus itself shifted away from the light
  const rw = o.rimW ?? Math.max(3, hw * .035), ins = o.rimInset ?? 0;
  if ((o.rimA ?? .85) > 0) {
    const Rb = buf('rim');
    Rb.c.drawImage(B.cv, -lx * ins, -ly * ins); Rb.c.globalCompositeOperation = 'destination-out'; Rb.c.drawImage(B.cv, -lx * (ins + rw), -ly * (ins + rw));
    Rb.c.globalCompositeOperation = 'destination-in'; Rb.c.drawImage(B.cv, 0, 0);
    Rb.c.globalCompositeOperation = 'source-in'; Rb.c.fillStyle = `rgba(${o.rim || '255,225,170'},${o.rimA ?? .85})`; Rb.c.fillRect(0, 0, W, H);
    B.c.globalCompositeOperation = o.rimMode || 'screen'; B.c.drawImage(Rb.cv, 0, 0);
    B.c.globalCompositeOperation = 'source-over';
  }
  if (o.tint) { B.c.globalCompositeOperation = 'source-atop'; B.c.fillStyle = o.tint; B.c.fillRect(x0, y0, x1 - x0, y1 - y0); }
  B.c.globalCompositeOperation = 'source-over';
  if (!o.defer) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); if (o.alpha != null) c.globalAlpha = o.alpha; c.drawImage(B.cv, 0, 0); c.restore(); }
  return B;
}
// projected soft cast shadow of the last drawLit buffer onto a floor line (screen space): footY, direction dx (skew), squash
function castFromBuf(c, B, footY, o = {}) {
  const S2 = buf('sh'); S2.c.drawImage(B.cv, 0, 0); S2.c.globalCompositeOperation = 'source-in'; S2.c.fillStyle = `rgba(${o.col || '15,18,40'},1)`; S2.c.fillRect(0, 0, W, H);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = o.alpha ?? .3; c.filter = `blur(${o.blur ?? 6}px)`;
  const k = o.squash ?? .22, sh = o.skew ?? .9; // y' = foot - (foot - y) * k ; x' = x + sh * (foot - y) * k
  c.setTransform(1, 0, -sh * k, k, sh * k * footY, footY * (1 - k)); c.drawImage(S2.cv, 0, 0);
  c.restore();
  // contact shadow
  if (o.cx != null) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(o.cx, footY, 0, o.cx, footY, o.cw); g.addColorStop(0, 'rgba(10,10,25,.45)'); g.addColorStop(1, 'rgba(10,10,25,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(o.cx, footY, o.cw, o.cw * .22, 0, 0, TAU); c.fill(); c.restore(); }
}
