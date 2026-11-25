// NOAH OUTFIT 'parka' (Mauerfall film): olive parka, striped knit sweater, jeans, brown shoes.
// Only clothes are swapped; head, face, hair and every body measurement stay exactly as in noah.js.
//   drawNoahP(c, p)      = drawNoah with the parka   (p.open: 0..1 parka zipper open, default .8)
//   drawNoahSideP(c, p)  = drawNoahSide with the parka
//   noahTears(c, x, y, k, t)  tear drops under the eyes (front view, x/y = feet like drawNoah)
const PARKA = { olive: '#5f6a34', oliveDark: '#454d24', oliveLight: '#7d8a48', fur: '#b9a888', furDark: '#8c7c62',
  knit: ['#e9dfc8', '#9b2f2f', '#2f3f63'], denim: '#4b6c98', denimDark: '#3a5679', seam: '#c9a25a', shoe: '#7a4b2a' };
const _noahOrig = { torso: noahTorso, arm: noahArm, legs: noahLegs, sTorso: noahSideTorso, sArm: noahSideArm };

function parkaKnit(c, x0, x1, y0, y1) {
  // striped knit sweater between x0..x1 (already clipped by caller)
  c.fillStyle = PARKA.knit[0]; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0, i = 0; y < y1; y += 46, i++) { c.fillStyle = PARKA.knit[1 + (i % 2)]; c.fillRect(x0, y + 8, x1 - x0, 20); }
  c.globalAlpha = .25; for (let y = y0; y < y1; y += 12) for (let x = x0; x < x1; x += 14) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 7, y + 8); c.lineTo(x + 14, y); c.lineWidth = 2; c.strokeStyle = '#3a2a20'; c.stroke(); }
  c.globalAlpha = 1;
}
function parkaTorso(c) {
  const hem = NOAH.HEM + 150, open = NOAH._open ?? .8;
  // sweater (visible in the open front)
  c.save(); c.beginPath(); c.moveTo(-70, -955); c.quadraticCurveTo(0, -905, 70, -955); c.lineTo(80, hem); c.lineTo(-80, hem); c.closePath(); c.clip();
  parkaKnit(c, -90, 90, -960, hem); c.restore();
  // knit collar (crew neck rib)
  c.beginPath(); c.moveTo(-60, -955); c.quadraticCurveTo(0, -900, 60, -955); c.lineWidth = 26; c.strokeStyle = PARKA.knit[2]; c.lineCap = 'round'; c.stroke();
  c.lineWidth = NOAH.W * .6; c.strokeStyle = NOAH.out; c.beginPath(); c.moveTo(-72, -960); c.quadraticCurveTo(0, -888, 72, -960); c.stroke();
  // parka panels (left and right), front edge at +-gap
  const gap = 22 + 50 * open;
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 60, -962); c.lineTo(s * 158, -948); c.quadraticCurveTo(s * 152, -820, s * 146, -760);
    c.lineTo(s * 156, hem); c.quadraticCurveTo(s * 100, hem + 18, s * gap, hem + 6); c.quadraticCurveTo(s * (gap + 6), -760, s * (gap + 14), -930); c.closePath();
    c.fillStyle = PARKA.olive; c.fill();
    c.save(); c.clip();
    // shading on the outer side, fabric folds
    c.fillStyle = PARKA.oliveDark; c.globalAlpha = .55; c.fillRect(s > 0 ? 110 : -170, -960, 60, hem + 960 + 40); c.globalAlpha = 1;
    for (let i = 0; i < 4; i++) { const yy = -820 + i * 120; nLine(c, [s * (gap + 20), yy, s * (gap + 70), yy + 30, s * (gap + 50), yy + 70], 4, PARKA.oliveDark); }
    c.restore();
    c.lineWidth = NOAH.W; c.strokeStyle = NOAH.out; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(s * 60, -962); c.lineTo(s * 158, -948); c.quadraticCurveTo(s * 152, -820, s * 146, -760);
    c.lineTo(s * 156, hem); c.quadraticCurveTo(s * 100, hem + 18, s * gap, hem + 6); c.quadraticCurveTo(s * (gap + 6), -760, s * (gap + 14), -930); c.closePath(); c.stroke();
    // zipper tape on the front edge
    nLine(c, [s * (gap + 14), -925, s * (gap + 7), -760, s * (gap + 2), hem], 6, '#9a9a80');
    // patch pocket with flap
    const px = s * 98; c.beginPath(); c.rect(px - 40, NOAH.HEM - 20, 80, 120); c.fillStyle = PARKA.olive; c.fill(); c.lineWidth = NOAH.W * .6; c.strokeStyle = NOAH.out; c.stroke();
    c.beginPath(); c.moveTo(px - 46, NOAH.HEM - 26); c.lineTo(px + 46, NOAH.HEM - 26); c.lineTo(px + 42, NOAH.HEM + 14); c.lineTo(px - 42, NOAH.HEM + 14); c.closePath(); c.fillStyle = PARKA.oliveLight; c.fill(); c.stroke();
    circle(c, px, NOAH.HEM + 2, 6); c.fillStyle = '#3a3a2a'; c.fill();
    // chest pocket
    c.beginPath(); c.rect(s * 92 - 30, -840, 60, 70); c.lineWidth = NOAH.W * .5; c.stroke();
    // drawstring at the waist
    nLine(c, [s * (gap + 4), -640, s * (gap - 6), -560], 5, '#d8d0b8');
  }
  // fur-trimmed hood collar lying around the neck
  c.beginPath(); c.moveTo(-170, -940); c.quadraticCurveTo(-120, -1010, 0, -1000); c.quadraticCurveTo(120, -1010, 170, -940); c.quadraticCurveTo(110, -960, 70, -930); c.quadraticCurveTo(0, -985, -70, -930); c.quadraticCurveTo(-110, -960, -170, -940); c.closePath();
  c.fillStyle = PARKA.fur; c.fill(); c.lineWidth = NOAH.W * .8; c.strokeStyle = NOAH.out; c.stroke();
  for (let i = 0; i < 7; i++) { const x = -130 + i * 44, y = -968 - Math.sin(i / 6 * Math.PI) * 18; nLine(c, [x, y, x + 8, y + 14], 4, PARKA.furDark); }
}
function parkaArm(c, side, spec, watch) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y;
  const a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  const cx = ex + (wx - ex) * .86, cy = ey + (wy - ey) * .86;
  // sleeve: wide tube to just above the wrist
  nLine(c, [sx, sy, ex, ey, cx, cy], NOAH.ARM_W + 46 + NOAH.W * 2, NOAH.out);
  nLine(c, [sx, sy, ex, ey, cx, cy], NOAH.ARM_W + 46, PARKA.olive);
  nLine(c, [sx + side * 10, sy + 10, ex + side * 8, ey, cx, cy], 10, PARKA.oliveDark);
  // elbow fold
  nLine(c, [ex - 18, ey - 8, ex + 14, ey + 10], 5, PARKA.oliveDark);
  // wrist (skin) between cuff and hand
  nLine(c, [cx, cy, wx, wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [cx, cy, wx, wy], NOAH.ARM_W, NOAH.skin);
  // cuff
  const fx = side * Math.sin(a2), fy = Math.cos(a2);
  nLine(c, [cx - fy * 58, cy + fx * 58, cx + fy * 58, cy - fx * 58], 34 + NOAH.W * 2, NOAH.out); nLine(c, [cx - fy * 56, cy + fx * 56, cx + fy * 56, cy - fx * 56], 34, PARKA.oliveDark);
  if (watch) {
    const k = .93, wcx = ex + (wx - ex) * k, wcy = ey + (wy - ey) * k;
    nLine(c, [wcx - fy * 38, wcy + fx * 38, wcx + fy * 38, wcy - fx * 38], 20, NOAH.out); nLine(c, [wcx - fy * 34, wcy + fx * 34, wcx + fy * 34, wcy - fx * 34], 12, NOAH.watch);
    c.beginPath(); c.arc(wcx + fy * 32 * side, wcy - fx * 32 * side, 16, 0, Math.PI * 2); nFill(c, NOAH.watch, 7);
  }
  c.save(); c.translate(wx, wy); noahHandLocal(c, -side * a2 + (spec.hand || 0)); c.restore();
}
function parkaLegs(c, p) {
  const top = NOAH.HEM - 10;
  for (const s of [-1, 1]) {
    const lift = (p.legs && p.legs[s < 0 ? 0 : 1]) || 0;
    c.beginPath(); c.moveTo(s * 4, top); c.lineTo(s * 116, top); c.lineTo(s * 108, -95 - lift); c.lineTo(s * 14, -95 - lift); c.closePath(); nFill(c, PARKA.denim);
    c.save(); c.clip();
    nLine(c, [s * 64, top, s * 62, -90], 4, PARKA.seam);
    c.globalAlpha = .35; for (let i = 0; i < 4; i++) nLine(c, [s * 20, -300 + i * 40, s * 100, -290 + i * 40], 3, PARKA.denimDark); c.globalAlpha = 1;
    c.fillStyle = PARKA.denimDark; c.fillRect(s > 0 ? 4 : -116, -140 - lift, 112, 45); nLine(c, [s * 10, -140 - lift, s * 112, -140 - lift], 3, PARKA.seam);
    c.restore();
    c.beginPath(); c.moveTo(s * 20, -98 - lift); c.lineTo(s * 108, -98 - lift); c.quadraticCurveTo(s * 190, -66 - lift, s * 196, -16 - lift); c.quadraticCurveTo(s * 190, 4 - lift, s * 140, 2 - lift); c.lineTo(s * 30, 2 - lift); c.quadraticCurveTo(s * 10, -40 - lift, s * 20, -98 - lift); nFill(c, PARKA.shoe);
    nLine(c, [s * 30, -8 - lift, s * 186, -8 - lift], 6, '#3a2416');
    for (let i = 0; i < 3; i++) nLine(c, [s * (60 + i * 18), -88 - lift, s * (70 + i * 18), -70 - lift], 4, '#e8d8b8');
  }
}
function parkaSideTorso(c, cave, s = 1) {
  const hem = -370;
  // sweater strip at the front
  c.beginPath(); c.moveTo(40, -968); c.lineTo(104, -930); c.lineTo(112, hem); c.lineTo(60, hem); c.closePath(); c.save(); c.clip(); parkaKnit(c, 30, 120, -970, hem); c.restore();
  c.beginPath(); c.moveTo(-60, -972); c.quadraticCurveTo(-112, -962, -124, -930); c.lineTo(-136, hem); c.quadraticCurveTo(-40, hem + 16, 70, hem + 4); c.quadraticCurveTo(66, -700, 70, -940); c.quadraticCurveTo(10, -960, -60, -972); c.closePath();
  nFill(c, PARKA.olive);
  c.save(); c.clip(); c.fillStyle = PARKA.oliveDark; c.globalAlpha = .5; c.fillRect(-140, -980, 60, 700); c.globalAlpha = 1;
  nLine(c, [-60, -560, 60, -556], 5, PARKA.oliveDark); c.restore();
  nLine(c, [70, -930, 66, -700, 70, hem], 6, '#9a9a80');
  // side pocket
  c.beginPath(); c.moveTo(-60, -560); c.lineTo(40, -560); c.lineTo(36, -520); c.lineTo(-56, -520); c.closePath(); c.fillStyle = PARKA.oliveLight; c.fill(); c.lineWidth = NOAH.W * .6; c.strokeStyle = NOAH.out; c.stroke();
  // fur hood at the back of the neck
  c.beginPath(); c.moveTo(-150, -930); c.quadraticCurveTo(-170, -1030, -80, -1010); c.quadraticCurveTo(20, -1000, 60, -960); c.quadraticCurveTo(-20, -960, -60, -940); c.closePath();
  c.fillStyle = PARKA.fur; c.fill(); c.lineWidth = NOAH.W * .8; c.strokeStyle = NOAH.out; c.stroke();
}
function parkaSideArm(c, th, bend, far, cave) {
  const [sx, sy] = NOAH_SIDE.SHOULDER;
  const ex = sx + Math.sin(th) * NOAH.UPPER, ey = sy + Math.cos(th) * NOAH.UPPER;
  const t2 = th + bend, wx = ex + Math.sin(t2) * NOAH.FORE, wy = ey + Math.cos(t2) * NOAH.FORE;
  const cx = ex + (wx - ex) * .86, cy = ey + (wy - ey) * .86, col = far ? PARKA.oliveDark : PARKA.olive;
  nLine(c, [sx, sy, ex, ey, cx, cy], NOAH.ARM_W + 46 + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey, cx, cy], NOAH.ARM_W + 46, col);
  nLine(c, [cx, cy, wx, wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [cx, cy, wx, wy], NOAH.ARM_W, far ? '#e8e4e0' : NOAH.skin);
  const fx = Math.sin(t2), fy = Math.cos(t2);
  nLine(c, [cx - fy * 56, cy + fx * 56, cx + fy * 56, cy - fx * 56], 34 + NOAH.W * 2, NOAH.out); nLine(c, [cx - fy * 54, cy + fx * 54, cx + fy * 54, cy - fx * 54], 34, PARKA.oliveDark);
  c.save(); c.translate(wx, wy); c.scale(.92, 1); noahHandLocal(c, -t2); c.restore();
}
function withParka(fn, open) {
  const P0 = { pants: NOAH.pants, stripe: NOAH.stripe, shoe: NOAH.shoe };
  noahTorso = parkaTorso; noahArm = (c, side, spec, watch) => parkaArm(c, side, spec, watch); noahLegs = parkaLegs;
  noahSideTorso = parkaSideTorso; noahSideArm = parkaSideArm;
  NOAH.pants = PARKA.denim; NOAH.stripe = PARKA.denimDark; NOAH.shoe = PARKA.shoe; NOAH._open = open;
  try { return fn(); } finally {
    noahTorso = _noahOrig.torso; noahArm = _noahOrig.arm; noahLegs = _noahOrig.legs; noahSideTorso = _noahOrig.sTorso; noahSideArm = _noahOrig.sArm;
    Object.assign(NOAH, P0); NOAH._open = undefined;
  }
}
function drawNoahP(c, p) { withParka(() => drawNoah(c, Object.assign({ k: .25, ink: 1.8 }, p)), p.open); if (p.tears) noahTears(c, p); }
function drawNoahSideP(c, p) {
  // optional run lean (rotation around the feet)
  if (p.lean) { c.save(); c.translate(p.x || 0, p.y || 0); c.rotate(p.lean * (p.s || 1)); c.translate(-(p.x || 0), -(p.y || 0)); }
  withParka(() => drawNoahSide(c, Object.assign({ k: .25, ink: 1.8 }, p)));
  if (p.lean) c.restore();
}
// glistening tears on the lower lids (front view), amount 0..1
function noahTears(c, p) {
  const k = p.k ?? .25, a = p.tears, x = p.x || 0, y = (p.y || 0) + (p.bob || 0) * k;
  for (const s of [-1, 1]) {
    const ex = x + s * 92 * k, ey = y + (NOAH.HEAD.y + 62) * k, L = 70 * k * a;
    c.beginPath(); c.moveTo(ex + s * 18 * k, ey); c.quadraticCurveTo(ex + s * 30 * k, ey + L * .6, ex + s * 26 * k, ey + L);
    c.lineWidth = 9 * k; c.strokeStyle = 'rgba(150,200,240,.85)'; c.lineCap = 'round'; c.stroke();
    c.beginPath(); c.ellipse(ex + s * 26 * k, ey + L + 8 * k, 9 * k, 13 * k, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(170,215,250,.95)'; c.fill(); c.lineWidth = 3 * k; c.strokeStyle = '#3a5a80'; c.stroke();
    c.beginPath(); c.arc(ex + s * 23 * k, ey + L + 4 * k, 3 * k, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
    // wet shine line on the lower lid
    c.beginPath(); c.moveTo(ex - 24 * k, ey - 6 * k); c.quadraticCurveTo(ex, ey + 4 * k, ex + 24 * k, ey - 6 * k); c.lineWidth = 5 * k; c.strokeStyle = 'rgba(160,210,250,.9)'; c.stroke();
  }
}
