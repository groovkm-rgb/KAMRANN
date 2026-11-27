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
  const cy = -1240, R = 262, st = P.hairStyle, len = st === 'long' ? 520 : st === 'bob' ? 170 : st === 'crew' ? 150 : 140;
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
  c.save(); c.beginPath(); c.rect(-128, -980, 250, 480); c.clip(); c.translate(36, 0); c.scale(.86, 1); if (s < 0) { c.translate(4, 0); c.scale(-1, 1); c.translate(-4, 0); } noahLetters(c, 4, -760, 1); c.restore();
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
  // adult in a padded black hooded jacket, black balaclava (no visible eyes), black gloves, dark cargo trousers, heavy boots.
  // view: 'front' | 'back' | 'side' (s = ±1, facing right/left); walk: phase; headTurn: rad. Never a face, never a weapon.
  const k = (p.k ?? .25) * 1.2, view = p.view || 'front', s = p.s || 1, wk = p.walk, walking = wk != null, sw = walking ? Math.sin(wk) : 0;
  const JK = p.jk || '#1b1c22', JK2 = '#23252d', TR = '#262932', BT = '#0f1013', GL = '#121216', O = '#060609', SEAM = 'rgba(150,160,185,.28)';
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (view === 'side' ? s : 1), k); c.translate(0, walking ? -Math.abs(Math.cos(wk)) * 14 : 0);
  const LW = 13, F = (fill, w = LW) => { c.fillStyle = fill; c.fill(); if (w) { c.lineWidth = w; c.strokeStyle = O; c.lineJoin = 'round'; c.stroke(); } };
  const boot = (x, far, side) => {
    c.beginPath();
    if (side) { c.moveTo(x - 62, -150); c.lineTo(x + 58, -150); c.quadraticCurveTo(x + 70, -80, x + 150, -60); c.quadraticCurveTo(x + 185, -40, x + 175, 0); c.lineTo(x - 78, 0); c.quadraticCurveTo(x - 82, -80, x - 62, -150); }
    else { c.moveTo(x - 70, -150); c.lineTo(x + 70, -150); c.quadraticCurveTo(x + 105, -50, x + 100, 0); c.lineTo(x - 100, 0); c.quadraticCurveTo(x - 105, -50, x - 70, -150); }
    c.closePath(); F(far ? '#0b0b0e' : BT);
    c.fillStyle = '#2a2a2e'; c.fillRect(x - (side ? 80 : 100), -24, side ? 258 : 200, 24); for (let i = 0; i < 3; i++) line(c, [x - 40, -128 + i * 26, x + 36, -122 + i * 26], 4, '#34363e');
  };
  const legF = (x, far) => { // front/back view leg, slightly tapered, with cargo pocket
    c.save(); c.translate(0, -140); c.scale(1, 1.44); c.translate(0, 140);
    c.beginPath(); c.moveTo(x - 92, -640); c.lineTo(x + 92, -640); c.quadraticCurveTo(x + 96, -380, x + 72, -140); c.lineTo(x - 72, -140); c.quadraticCurveTo(x - 96, -380, x - 92, -640); c.closePath(); F(far ? '#1e2028' : TR);
    const px = x + (x < 0 ? -40 : 40); c.beginPath(); rrect(c, px - 46, -470, 92, 120, 10); F('#2c303a', 6); line(c, [px - 42, -448, px + 42, -448], 5, SEAM);
    line(c, [x, -620, x - 4, -160], 3, SEAM); for (let i = 0; i < 3; i++) line(c, [x - 60, -250 + i * 30, x + 50, -262 + i * 30], 4, 'rgba(0,0,0,.5)');
    c.restore();
  };
  const legS = (th, bend, far) => { // side view leg with knee
    const hx = 0, hy = -840, kx = hx + Math.sin(th) * 355, ky = hy + Math.cos(th) * 355, t2 = th - bend, ax = kx + Math.sin(t2) * 355, ay = ky + Math.cos(t2) * 355;
    nLine(c, [hx, hy, kx, ky, ax, ay - 20], 160 + LW * 2, O); nLine(c, [hx, hy, kx, ky, ax, ay - 20], 160, far ? '#1e2028' : TR);
    if (!far) { c.save(); c.translate((hx + kx) / 2, (hy + ky) / 2); c.rotate(-th); c.beginPath(); rrect(c, -30, -40, 70, 100, 10); F('#2c303a', 6); c.restore(); }
    c.save(); c.translate(ax, ay + 130 - 150); boot(0, far, true); c.restore();
  };
  // ---- legs ----
  if (view === 'side') { legS(walking ? -.4 * sw : -.04, walking ? .6 * Math.max(0, -Math.cos(wk)) : 0, true); legS(walking ? .4 * sw : .04, walking ? .6 * Math.max(0, Math.cos(wk)) : 0, false); }
  else { legF(-82, false); legF(82, false); boot(-84, false); boot(84, false); }
  c.translate(0, -215); // upper body sits on the longer legs
  // ---- arms (behind body in side view: far arm) ----
  const arm = (side, a, b, far) => {
    const sx = view === 'side' ? -10 : side * 205, sy = -1060, ex = sx + side * Math.sin(a) * 270, ey = sy + Math.cos(a) * 270, a2 = a + (b || 0), wx = ex + side * Math.sin(a2) * 250, wy = ey + Math.cos(a2) * 250;
    nLine(c, [sx, sy, ex, ey, wx, wy], 150 + LW * 2, O); nLine(c, [sx, sy, ex, ey, wx, wy], 150, far ? '#14151a' : JK2);
    for (let i = 1; i < 4; i++) { const u = i / 4, qx = sx + (ex - sx) * u * 2 > ex ? ex + (wx - ex) * (u * 2 - 1) : sx + (ex - sx) * u * 2, qy = sy + (ey - sy) * u * 2 > ey ? ey + (wy - ey) * (u * 2 - 1) : sy + (ey - sy) * u * 2; }
    for (let i = 1; i <= 4; i++) { const u = i / 5, px = u < .5 ? sx + (ex - sx) * u * 2 : ex + (wx - ex) * (u * 2 - 1), py = u < .5 ? sy + (ey - sy) * u * 2 : ey + (wy - ey) * (u * 2 - 1); line(c, [px - 60, py - 8, px + 60, py + 8], 5, SEAM); }
    nLine(c, [ex + (wx - ex) * .86, ey + (wy - ey) * .86, wx, wy], 160, '#2a2c34'); // elastic cuff
    c.save(); c.translate(wx, wy); c.rotate(-side * a2); c.scale(1.45, 1.45);
    c.beginPath(); c.moveTo(-34, -6); c.quadraticCurveTo(-46, 50, -28, 92); c.quadraticCurveTo(0, 112, 26, 94); c.quadraticCurveTo(44, 50, 34, -6); c.closePath(); F(GL, 9);
    c.beginPath(); c.moveTo(-30, 20); c.quadraticCurveTo(-62, 44, -52, 66); c.quadraticCurveTo(-40, 72, -30, 52); F(GL, 8); line(c, [-8, 70, -10, 96], 4, '#2c2d33'); line(c, [10, 70, 10, 98], 4, '#2c2d33');
    c.restore();
  };
  if (view === 'side') arm(1, walking ? -.32 * sw : .06, .18, true);
  else if (view === 'back') { arm(-1, .12 + (p.armL || 0), .1); arm(1, .12 + (p.armR || 0), .1); }
  // ---- padded jacket ----
  c.beginPath();
  if (view === 'side') { c.moveTo(-150, -1110); c.quadraticCurveTo(-215, -900, -190, -560); c.lineTo(165, -560); c.quadraticCurveTo(190, -900, 120, -1110); c.quadraticCurveTo(-10, -1150, -150, -1110); }
  else { c.moveTo(-235, -1020); c.quadraticCurveTo(-250, -1110, -150, -1125); c.quadraticCurveTo(0, -1150, 150, -1125); c.quadraticCurveTo(250, -1110, 235, -1020); c.quadraticCurveTo(255, -800, 228, -560); c.quadraticCurveTo(0, -540, -228, -560); c.quadraticCurveTo(-255, -800, -235, -1020); }
  c.closePath(); F(JK);
  c.save(); c.clip();
  for (let i = 0; i < 6; i++) { const y = -1060 + i * 88; c.beginPath(); c.moveTo(-280, y); c.quadraticCurveTo(0, y + 22, 280, y); c.lineWidth = 5; c.strokeStyle = SEAM; c.stroke(); const g = c.createLinearGradient(0, y, 0, y + 88); g.addColorStop(0, 'rgba(255,255,255,.05)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = g; c.fillRect(-280, y, 560, 88); }
  if (view === 'front') {
    line(c, [0, -1130, 0, -560], 12, '#30333c'); for (let y = -1110; y < -570; y += 15) line(c, [-8, y, 8, y], 3, '#5a5f6b');
    c.beginPath(); rrect(c, -15, -1080, 30, 50, 6); F('#6a6f7a', 5);
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 40, -760); c.lineTo(sx * 190, -770); c.lineTo(sx * 200, -620); c.lineTo(sx * 45, -610); c.closePath(); F('#202229', 6); line(c, [sx * 60, -748, sx * 180, -755], 5, SEAM); }
  }
  if (view === 'side') { c.beginPath(); c.moveTo(-60, -760); c.lineTo(120, -770); c.lineTo(125, -620); c.lineTo(-55, -612); c.closePath(); F('#202229', 6); }
  if (view === 'back') line(c, [0, -1110, 0, -570], 4, SEAM);
  c.fillStyle = '#2a2c34'; c.fillRect(-280, -600, 560, 44);
  for (let i = 0; i < 10; i++) { const x = -190 + rnd(i + 3) * 380, y = -1000 + rnd(i + 9) * 380; line(c, [x, y, x + 40, y + 22], 4, 'rgba(0,0,0,.5)'); }
  c.restore();
  if (view === 'front') { arm(-1, .1 + (p.armL || 0), .08); arm(1, .1 + (p.armR || 0), .08); }
  // ---- hood + balaclava ----
  c.save(); c.translate(view === 'side' ? 15 : 0, 0); c.translate(0, -1140); c.rotate(p.headTurn || 0); c.translate(0, 1140);
  const hc = -1330;
  if (view === 'side') {
    c.beginPath(); c.moveTo(-170, -1110); c.bezierCurveTo(-300, -1300, -220, -1600, 20, -1610); c.bezierCurveTo(190, -1610, 270, -1460, 245, -1320); c.quadraticCurveTo(215, -1200, 150, -1120); c.quadraticCurveTo(0, -1080, -170, -1110); c.closePath(); F('#15161b');
    // opening: dark profile of the masked head, deep shadow
    c.beginPath(); c.moveTo(150, -1135); c.quadraticCurveTo(235, -1240, 215, -1360); c.quadraticCurveTo(190, -1470, 120, -1500); c.quadraticCurveTo(90, -1330, 110, -1150); c.closePath(); F('#08080a', 7);
    line(c, [-120, -1500, -200, -1250], 5, SEAM); line(c, [-40, -1560, -150, -1180], 5, SEAM);
  } else {
    c.beginPath(); c.moveTo(-215, -1100); c.bezierCurveTo(-320, -1280, -250, -1610, 0, -1620); c.bezierCurveTo(250, -1610, 320, -1280, 215, -1100); c.quadraticCurveTo(0, -1060, -215, -1100); c.closePath(); F('#15161b');
    if (view === 'front') {
      // hood rim (thick fabric edge) and the deep opening
      c.beginPath(); c.moveTo(-160, -1120); c.bezierCurveTo(-225, -1290, -170, -1520, 0, -1525); c.bezierCurveTo(170, -1520, 225, -1290, 160, -1120); c.quadraticCurveTo(0, -1090, -160, -1120); c.closePath(); F('#08080a', 9);
      c.save(); c.clip();
      const g = c.createRadialGradient(0, hc, 20, 0, hc, 220); g.addColorStop(0, '#111216'); g.addColorStop(1, '#040405'); c.fillStyle = g; c.fillRect(-240, -1540, 480, 440);
      for (let x = -160; x <= 160; x += 16) line(c, [x, -1520, x, -1110], 3, 'rgba(255,255,255,.025)'); // knit ribs
      c.beginPath(); rrect(c, -125, hc - 70, 250, 74, 37); c.fillStyle = '#000'; c.fill(); // eye opening = pure shadow
      c.restore();
      line(c, [-150, -1150, -205, -1320], 6, SEAM); line(c, [150, -1150, 205, -1320], 6, SEAM);
    } else { c.save(); c.clip(); for (let i = 0; i < 6; i++) line(c, [-220 + i * 88, -1600, -240 + i * 96, -1100], 5, SEAM); line(c, [0, -1620, 0, -1100], 6, 'rgba(0,0,0,.6)'); c.restore(); }
  }
  c.restore();
  if (view === 'side') arm(1, walking ? .32 * sw : -.04, .2, false);
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
