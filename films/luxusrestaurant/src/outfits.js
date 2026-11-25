// OUTFITS for Noah: clothes drawn as layers ON TOP of the unchanged rig (NOAH / noahHeadLocal / limbs geometry).
// drawNoahDressed(c, { x, y, k, ink, s, outfit: 'waiter'|'chef'|'suit'|'classic', arms, expr, tilt, bob, sit, seatH, hold })
// - arms use the rig geometry (NOAH.SHOULDER, UPPER, FORE); sleeves are wider cloth tubes over them.
// - the watch always stays on the rig's watch arm (side +1 = Noah's left wrist).
// - expr.mouth adds 'smirk' (half smile) and 'grim' (tight frown) on top of the rig's mouths.
// - expr.worry 0..1 tilts the brows (inner ends up) — drawn over the rig brows.
const OUTFIT = {
  waiter: { shirt: '#f6f4ef', shirtShade: '#d9d6cf', vest: '#232022', vestHi: '#3b3739', apron: '#1c1a1c', apronHi: '#343033', stitch: '#5a5458', pants: '#26232a', stripe: '#3a3640', napkin: '#ffffff', tie: '#141214' },
  chef: { jacket: '#fbfaf6', jacketShade: '#dcd9d1', button: '#2a2624', apron: '#1f1d20', apronHi: '#38343a', stitch: '#5d575c', pants: '#2f2a30', stripe: '#46404a', piping: '#2a2624' },
  suit: { cloth: '#1f2c4d', clothHi: '#33446c', clothDark: '#141c33', shirt: '#f6f4ef', tie: '#7a1e2c', tieHi: '#9a3040', pants: '#1f2c4d', stripe: '#28365a', square: '#e9e4d6' },
};
// wrist / elbow positions of an arm spec in rig units (matches noahArm)
function noahArmPts(side, spec) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  return { sx, sy, ex, ey, wx, wy, a, a2 };
}
// world position of a hand (for placing a glass etc.)
function noahHandWorld(p, side) {
  const arms = Object.assign({}, NOAH.ARMS, p.arms || {}), spec = side < 0 ? arms.l : arms.r, q = noahArmPts(side, spec), k = p.k ?? .25, s = p.s || 1;
  const dy = p.sit ? (-(p.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0;
  // hand centre ~55 units past the wrist along the forearm
  const fx = side * Math.sin(q.a2), fy = Math.cos(q.a2);
  return [p.x + (q.wx + fx * 55) * k * s, (p.y || 0) + (q.wy + fy * 55 + dy + (p.bob || 0)) * k];
}
function lerpPt(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
function noahSleeveArm(c, side, spec, o) {
  const q = noahArmPts(side, spec), W0 = NOAH.W;
  const cuffK = o.cuffK ?? .86, cw = o.width || 88;
  const cuff = lerpPt([q.ex, q.ey], [q.wx, q.wy], cuffK);
  // skin under the cuff (wrist), then the hand at the end
  nLine(c, [q.ex, q.ey, q.wx, q.wy], NOAH.ARM_W + W0 * 2, NOAH.out); nLine(c, [q.ex, q.ey, q.wx, q.wy], NOAH.ARM_W, NOAH.skin);
  // sleeve tube
  nLine(c, [q.sx, q.sy, q.ex, q.ey, cuff[0], cuff[1]], cw + W0 * 2, NOAH.out);
  nLine(c, [q.sx, q.sy, q.ex, q.ey, cuff[0], cuff[1]], cw, o.col);
  // shade along the inner side of the sleeve
  c.save(); c.globalAlpha = .55; const ux = q.ex - q.sx, uy = q.ey - q.sy, L = Math.hypot(ux, uy) || 1, nx = -uy / L * side, ny = ux / L * side;
  nLine(c, [q.sx - nx * cw * .28, q.sy - ny * cw * .28, q.ex - nx * cw * .28, q.ey - ny * cw * .28, cuff[0] - nx * cw * .22, cuff[1] - ny * cw * .22], cw * .3, o.shade); c.restore();
  // fabric folds at the elbow and along the forearm
  const fold = (pt, ang, len, w) => { c.save(); c.translate(pt[0], pt[1]); c.rotate(ang); c.beginPath(); c.moveTo(-len / 2, 0); c.quadraticCurveTo(0, w, len / 2, 0); c.lineWidth = 5; c.strokeStyle = o.fold; c.lineCap = 'round'; c.stroke(); c.restore(); };
  const ang1 = Math.atan2(q.ey - q.sy, q.ex - q.sx) + Math.PI / 2, ang2 = Math.atan2(q.wy - q.ey, q.wx - q.ex) + Math.PI / 2;
  fold(lerpPt([q.sx, q.sy], [q.ex, q.ey], .92), ang1, cw * .7, 14);
  fold(lerpPt([q.ex, q.ey], [q.wx, q.wy], .18), ang2, cw * .6, 12);
  fold(lerpPt([q.ex, q.ey], [q.wx, q.wy], .45), ang2 + .2, cw * .5, 10);
  fold(lerpPt([q.sx, q.sy], [q.ex, q.ey], .5), ang1 - .25, cw * .45, 9);
  // cuff band
  const c0 = lerpPt([q.ex, q.ey], [q.wx, q.wy], cuffK - .14);
  nLine(c, [c0[0], c0[1], cuff[0], cuff[1]], cw * .96 + W0 * 2, NOAH.out); nLine(c, [c0[0], c0[1], cuff[0], cuff[1]], cw * .96, o.cuff || o.col);
  if (o.cuffLine) { const m = lerpPt(c0, cuff, .5); c.beginPath(); c.arc(m[0], m[1], 7, 0, Math.PI * 2); c.fillStyle = o.cuffLine; c.fill(); }
  if (o.shirtCuff) { // white shirt cuff peeking out of a jacket sleeve
    const s2 = lerpPt([q.ex, q.ey], [q.wx, q.wy], Math.min(.99, cuffK + .07));
    nLine(c, [cuff[0], cuff[1], s2[0], s2[1]], NOAH.ARM_W + 12 + W0 * 2, NOAH.out); nLine(c, [cuff[0], cuff[1], s2[0], s2[1]], NOAH.ARM_W + 12, o.shirtCuff);
  }
  if (o.watch) {
    const k2 = Math.min(.97, cuffK + (o.shirtCuff ? .1 : .06)), m = lerpPt([q.ex, q.ey], [q.wx, q.wy], k2), fx = side * Math.sin(q.a2), fy = Math.cos(q.a2);
    nLine(c, [m[0] - fy * 40, m[1] + fx * 40, m[0] + fy * 40, m[1] - fx * 40], 22, NOAH.out); nLine(c, [m[0] - fy * 36, m[1] + fx * 36, m[0] + fy * 36, m[1] - fx * 36], 13, NOAH.watch);
    c.beginPath(); c.arc(m[0] + fy * 34 * side, m[1] - fx * 34 * side, 18, 0, Math.PI * 2); nFill(c, NOAH.watch, 8);
    c.beginPath(); c.arc(m[0] + fy * 34 * side - 5, m[1] - fx * 34 * side - 5, 5, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
  }
  c.save(); c.translate(q.wx, q.wy); noahHandLocal(c, -side * q.a2 + (spec.hand || 0)); c.restore();
  if (spec.item) { c.save(); c.translate(q.wx + side * Math.sin(q.a2) * 60, q.wy + Math.cos(q.a2) * 60); spec.item(c); c.restore(); }
}
// torso silhouette of the rig (same points as noahTorso), optional widen for a loose jacket
function noahTorsoPath(c, wid = 0, hem = NOAH.HEM) {
  c.beginPath(); c.moveTo(-58, -952); c.lineTo(-150 - wid, -942); c.quadraticCurveTo(-140 - wid, -820, -128 - wid * .6, -760); c.lineTo(-122 - wid * .5, hem); c.lineTo(126 + wid * .5, hem);
  c.lineTo(132 + wid * .6, -760); c.quadraticCurveTo(144 + wid, -820, 155 + wid, -942); c.lineTo(58, -952); c.quadraticCurveTo(0, -915, -58, -952); c.closePath();
}
function stitchLine(c, pts, col, w = 3.5) { c.save(); c.setLineDash([10, 9]); nLine(c, pts, w, col); c.restore(); }
function noahWaiterTorso(c) {
  const O = OUTFIT.waiter;
  noahTorsoPath(c); nFill(c, O.shirt);
  // shirt placket + collar
  c.save(); noahTorsoPath(c); c.clip(); c.fillStyle = O.shirtShade; c.fillRect(-160, -960, 40, 460); c.fillRect(118, -960, 40, 460); c.restore();
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -925); c.lineTo(s * 62, -958); c.lineTo(s * 50, -880); c.closePath(); nFill(c, O.shirt, NOAH.W * .7); }
  // vest
  const vest = (s) => { c.beginPath(); c.moveTo(s * 62, -950); c.lineTo(s * 152, -942); c.quadraticCurveTo(s * 143, -820, s * 130, -760); c.lineTo(s * 126, -560); c.lineTo(s * 70, -520); c.lineTo(s * 4, -548); c.lineTo(s * 4, -742); c.closePath(); };
  for (const s of [-1, 1]) { vest(s); nFill(c, O.vest, NOAH.W * .8); c.save(); vest(s); c.clip();
    c.fillStyle = O.vestHi; c.globalAlpha = .55; c.beginPath(); c.moveTo(s * 40, -900); c.quadraticCurveTo(s * 70, -760, s * 50, -600); c.lineTo(s * 30, -600); c.quadraticCurveTo(s * 50, -760, s * 28, -880); c.fill(); c.globalAlpha = 1;
    stitchLine(c, [s * 62, -930, s * 14, -742, s * 14, -560], '#4a4547', 3); c.restore(); }
  // welt pockets + buttons + bow tie
  for (const s of [-1, 1]) { nLine(c, [s * 50, -650, s * 108, -656], 9, NOAH.out); nLine(c, [s * 52, -650, s * 106, -656], 4, '#4b4649'); }
  nLine(c, [-60, -840, -100, -845], 7, '#4b4649');
  for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, -720 + i * 50, 9, 0, Math.PI * 2); nFill(c, '#6d6468', 4); }
  c.beginPath(); c.moveTo(0, -930); c.lineTo(-46, -952); c.lineTo(-46, -904); c.closePath(); nFill(c, O.tie, 5);
  c.beginPath(); c.moveTo(0, -930); c.lineTo(46, -952); c.lineTo(46, -904); c.closePath(); nFill(c, O.tie, 5);
  c.beginPath(); c.ellipse(0, -929, 12, 14, 0, 0, Math.PI * 2); nFill(c, '#2b282a', 4);
}
function noahWaiterApron(c, sitting) {
  const O = OUTFIT.waiter, top = NOAH.HEM - 70;
  if (!sitting) {
    const hem = -175;
    const ap = () => { c.beginPath(); c.moveTo(-132, top); c.lineTo(132, top); c.lineTo(150, hem); c.quadraticCurveTo(0, hem + 14, -150, hem); c.closePath(); };
    ap(); nFill(c, O.apron, NOAH.W * .85);
    c.save(); ap(); c.clip();
    for (const x of [-70, 10, 85]) { c.beginPath(); c.moveTo(x, top + 40); c.quadraticCurveTo(x + 10, (top + hem) / 2, x - 6, hem); c.lineWidth = 7; c.strokeStyle = O.apronHi; c.globalAlpha = .7; c.stroke(); c.globalAlpha = 1; }
    for (const x of [-30, 50]) nLine(c, [x, top + 90, x + 4, hem], 4, '#0f0e10');
    stitchLine(c, [-136, hem - 22, 0, hem - 10, 136, hem - 22], O.stitch); stitchLine(c, [-118, top + 12, -132, hem - 24], O.stitch); stitchLine(c, [118, top + 12, 134, hem - 24], O.stitch);
    c.restore();
  }
  if (sitting) { c.beginPath(); c.moveTo(-132, top + 28); c.lineTo(132, top + 28); c.lineTo(200, top + 120); c.quadraticCurveTo(0, top + 150, -200, top + 120); c.closePath(); nFill(c, O.apron, NOAH.W * .8); }
  // waist band + tie
  c.beginPath(); c.rect(-130, top - 6, 260, 36); nFill(c, O.apron, NOAH.W * .8); stitchLine(c, [-124, top + 14, 124, top + 14], O.stitch, 3);
  c.beginPath(); c.moveTo(118, top + 10); c.quadraticCurveTo(170, top + 30, 150, top + 70); c.quadraticCurveTo(130, top + 40, 118, top + 30); nFill(c, O.apron, 5);
  // folded napkin tucked into the band (Noah's right = screen left)
  c.beginPath(); c.moveTo(-118, top - 4); c.lineTo(-58, top - 10); c.lineTo(-62, top + 150); c.quadraticCurveTo(-82, top + 170, -96, top + 150); c.lineTo(-120, top + 120); c.closePath(); nFill(c, O.napkin, NOAH.W * .7);
  nLine(c, [-90, top + 4, -92, top + 140], 4, '#d3d0c8'); nLine(c, [-74, top + 4, -76, top + 150], 3, '#e2dfd8'); stitchLine(c, [-112, top + 110, -64, top + 136], '#c7c3ba', 2.5);
}
function noahChefTorso(c) {
  const O = OUTFIT.chef;
  noahTorsoPath(c, 4, NOAH.HEM + 20); nFill(c, O.jacket);
  c.save(); noahTorsoPath(c, 4, NOAH.HEM + 20); c.clip(); c.fillStyle = O.jacketShade; c.fillRect(-170, -960, 44, 500); c.fillRect(124, -960, 44, 500);
  // double-breasted overlap edge
  c.beginPath(); c.moveTo(-40, -930); c.lineTo(66, -880); c.lineTo(66, NOAH.HEM + 20); c.lineWidth = 6; c.strokeStyle = O.jacketShade; c.stroke();
  nLine(c, [66, -878, 66, NOAH.HEM + 20], 4, '#b9b5ad');
  for (const y of [-800, -700, -600]) { c.beginPath(); c.moveTo(-110, y); c.quadraticCurveTo(-40, y + 14, 30, y); c.lineWidth = 3; c.strokeStyle = 'rgba(160,155,145,.5)'; c.stroke(); }
  c.restore();
  // mandarin collar
  c.beginPath(); c.moveTo(-64, -960); c.quadraticCurveTo(0, -905, 64, -960); c.lineTo(58, -925); c.quadraticCurveTo(0, -880, -58, -925); c.closePath(); nFill(c, O.jacket, NOAH.W * .7);
  nLine(c, [-58, -930, 0, -890, 58, -930], 3, O.piping);
  // two rows of cloth buttons
  for (const x of [-34, 92]) for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x, -840 + i * 82, 13, 0, Math.PI * 2); nFill(c, O.button, 4); c.beginPath(); c.arc(x - 3, -843 + i * 82, 4, 0, Math.PI * 2); c.fillStyle = '#5a5450'; c.fill(); }
  // chest pocket with thermometer pen
  c.beginPath(); c.rect(-130, -810, 62, 10); nFill(c, O.jacketShade, 3); nLine(c, [-110, -812, -110, -870], 9, NOAH.out); nLine(c, [-110, -812, -110, -868], 5, '#9aa2ae');
  // apron (waist to knee)
  const top = NOAH.HEM - 60, hem = -300;
  const ap = () => { c.beginPath(); c.moveTo(-136, top); c.lineTo(136, top); c.lineTo(150, hem); c.quadraticCurveTo(0, hem + 12, -150, hem); c.closePath(); };
  ap(); nFill(c, O.apron, NOAH.W * .85); c.save(); ap(); c.clip();
  for (const x of [-60, 40]) { c.beginPath(); c.moveTo(x, top + 30); c.quadraticCurveTo(x + 8, (top + hem) / 2, x - 4, hem); c.lineWidth = 7; c.strokeStyle = O.apronHi; c.globalAlpha = .7; c.stroke(); c.globalAlpha = 1; }
  stitchLine(c, [-140, hem - 20, 0, hem - 8, 140, hem - 20], O.stitch); c.restore();
  c.beginPath(); c.rect(-134, top - 6, 268, 30); nFill(c, O.apron, NOAH.W * .8);
  // kitchen towel hanging from the band
  c.beginPath(); c.moveTo(70, top + 10); c.lineTo(122, top + 6); c.lineTo(126, top + 150); c.lineTo(76, top + 160); c.closePath(); nFill(c, '#e9eef2', NOAH.W * .6);
  for (const y of [top + 50, top + 64, top + 120]) nLine(c, [74, y, 124, y - 3], 4, '#5b7fa8');
}
function noahSuitTorso(c) {
  const O = OUTFIT.suit, hem = NOAH.HEM + 60, wid = 16;
  // shirt + tie visible in the V
  noahTorsoPath(c, wid, hem); nFill(c, O.cloth, NOAH.W * .9);
  c.beginPath(); c.moveTo(-58, -950); c.quadraticCurveTo(0, -915, 58, -950); c.lineTo(18, -700); c.lineTo(-18, -700); c.closePath(); nFill(c, O.shirt, NOAH.W * .6);
  c.beginPath(); c.moveTo(-14, -912); c.lineTo(14, -912); c.lineTo(20, -735); c.lineTo(0, -712); c.lineTo(-20, -735); c.closePath(); nFill(c, O.tie, 5);
  nLine(c, [-6, -880, 8, -760], 3, O.tieHi); c.beginPath(); c.moveTo(-16, -930); c.lineTo(16, -930); c.lineTo(12, -905); c.lineTo(-12, -905); c.closePath(); nFill(c, O.tie, 4);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -922); c.lineTo(s * 60, -955); c.lineTo(s * 44, -890); c.closePath(); nFill(c, O.shirt, NOAH.W * .5); }
  // lapels + notch
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 60, -952); c.lineTo(s * 96, -940); c.lineTo(s * 104, -880); c.lineTo(s * 84, -866); c.lineTo(s * 96, -840); c.lineTo(s * 22, -690); c.lineTo(s * 30, -760); c.closePath(); nFill(c, O.clothHi, NOAH.W * .7);
    stitchLine(c, [s * 84, -930, s * 90, -860, s * 36, -740], '#4a5a80', 2.5);
  }
  // fold wrinkles of the too-big jacket, buttons, pockets, pocket square
  c.save(); noahTorsoPath(c, wid, hem); c.clip(); c.fillStyle = O.clothDark; c.globalAlpha = .6; c.fillRect(-180, -960, 46, 600); c.globalAlpha = 1;
  for (const [x, y, w] of [[-90, -640, 60], [80, -620, 64], [-60, -560, 50], [60, -540, 56], [-120, -780, 40]]) { c.beginPath(); c.moveTo(x - w / 2, y); c.quadraticCurveTo(x, y + 18, x + w / 2, y - 4); c.lineWidth = 5; c.strokeStyle = O.clothDark; c.stroke(); }
  nLine(c, [0, -700, 0, hem], 5, O.clothDark); c.restore();
  for (const y of [-650, -560]) { c.beginPath(); c.arc(8, y, 11, 0, Math.PI * 2); nFill(c, '#141a2c', 4); }
  for (const s of [-1, 1]) { nLine(c, [s * 50, -520, s * 120, -526], 10, NOAH.out); nLine(c, [s * 52, -520, s * 118, -526], 5, O.clothHi); }
  nLine(c, [70, -820, 124, -826], 8, NOAH.out); c.beginPath(); c.moveTo(78, -824); c.lineTo(92, -852); c.lineTo(104, -834); c.lineTo(116, -856); c.lineTo(120, -826); c.closePath(); nFill(c, O.square, 4);
}
function noahSmirk(c, e) {
  const cy = NOAH.HEAD.y, my = cy + 148, m = e.mouth;
  if (m === 'smirk') { c.beginPath(); c.moveTo(-42, my + 4); c.quadraticCurveTo(10, my + 16, 58, my - 14); c.lineWidth = 9; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke(); nLine(c, [56, my - 14, 66, my - 24], 7, NOAH.out); }
  else if (m === 'grim') { c.beginPath(); c.moveTo(-40, my + 10); c.quadraticCurveTo(0, my - 6, 40, my + 10); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke(); }
  else if (m === 'grin') { c.beginPath(); c.moveTo(-66, my - 12); c.quadraticCurveTo(0, my + 40, 68, my - 12); c.closePath(); c.fillStyle = NOAH.mouthIn; c.fill(); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); c.save(); c.clip(); c.fillStyle = '#fff'; c.fillRect(-70, my - 16, 140, 16); c.restore(); }
  if (e.worry) { // worried brows over the rig brows (inner ends up)
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 146, cy - 22 - (e.browUp || 0) * 18); c.quadraticCurveTo(s * 100, cy - 40, s * 54, cy - 36 - e.worry * 34); c.lineWidth = 15; c.strokeStyle = NOAH.brow; c.lineCap = 'round'; c.stroke(); }
  }
  if (e.sweat) { c.save(); const y = cy - 60 + e.sweat * 80; c.beginPath(); c.moveTo(212, y - 34); c.quadraticCurveTo(236, y, 212, y + 12); c.quadraticCurveTo(188, y, 212, y - 34); c.fillStyle = '#bfe3ff'; c.fill(); c.lineWidth = 5; c.strokeStyle = NOAH.out; c.stroke(); c.restore(); }
}
function noahDressedHead(c, p) {
  const e = Object.assign({}, p.expr || {}), special = ['smirk', 'grim', 'grin'].includes(e.mouth);
  if (special) e.mouth = 'none';
  const worry = e.worry; if (worry) e.browUp = e.browUp || 0;
  c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
  noahHairBack(c); noahHeadLocal(c, e);
  if (worry) { // hide rig brows under skin-coloured strokes before drawing worried ones
    const cy = NOAH.HEAD.y, bu = (e.browUp || 0) * 18;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 140, cy - 22 - bu); c.quadraticCurveTo(s * 95, cy - 46 - bu, s * 52, cy - 36 - bu); c.lineWidth = 20; c.strokeStyle = NOAH.skin; c.lineCap = 'round'; c.stroke(); }
  }
  noahSmirk(c, Object.assign({}, p.expr || {}, { mouth: special ? p.expr.mouth : null }));
  c.restore();
}
function drawNoahDressed(c, p = {}) {
  const outfit = p.outfit || 'classic';
  if (outfit === 'classic' && !p.expr?.worry && !['smirk', 'grim', 'grin'].includes(p.expr?.mouth)) return drawNoah(c, p);
  const W0 = NOAH.W, P0 = NOAH.pants, S0 = NOAH.stripe; NOAH.W = W0 * (p.ink || 1);
  const O = OUTFIT[outfit] || {};
  if (O.pants) { NOAH.pants = O.pants; NOAH.stripe = O.stripe; }
  try {
    const k = p.k ?? .25, arms = Object.assign({}, NOAH.ARMS, p.arms || {});
    const dy = p.sit ? (-(p.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0;
    c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
    if (p.onlyArms) { c.save(); c.translate(0, dy + (p.bob || 0)); }
    else {
    if (p.sit) noahLegsSitting(c, p, false); else noahLegs(c, p);
    c.save(); c.translate(0, dy + (p.bob || 0));
    if (outfit === 'waiter') { noahWaiterTorso(c); noahWaiterApron(c, p.sit); }
    else if (outfit === 'chef') noahChefTorso(c);
    else if (outfit === 'suit') noahSuitTorso(c);
    else noahTorso(c);
    // neck
    c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-46, -1000, -46, -948], 10, NOAH.out); nLine(c, [46, -1000, 46, -948], 10, NOAH.out);
    if (outfit === 'waiter') { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -925); c.lineTo(s * 62, -958); c.lineTo(s * 50, -885); c.closePath(); nFill(c, OUTFIT.waiter.shirt, NOAH.W * .7); } c.beginPath(); c.moveTo(0, -930); c.lineTo(-46, -952); c.lineTo(-46, -904); c.closePath(); nFill(c, OUTFIT.waiter.tie, 5); c.beginPath(); c.moveTo(0, -930); c.lineTo(46, -952); c.lineTo(46, -904); c.closePath(); nFill(c, OUTFIT.waiter.tie, 5); c.beginPath(); c.ellipse(0, -929, 12, 14, 0, 0, Math.PI * 2); nFill(c, '#2b282a', 4); }
    else if (outfit === 'chef') { c.beginPath(); c.moveTo(-64, -960); c.quadraticCurveTo(0, -905, 64, -960); c.lineTo(58, -925); c.quadraticCurveTo(0, -880, -58, -925); c.closePath(); nFill(c, OUTFIT.chef.jacket, NOAH.W * .7); }
    else if (outfit === 'suit') { c.beginPath(); c.moveTo(-16, -930); c.lineTo(16, -930); c.lineTo(12, -905); c.lineTo(-12, -905); c.closePath(); nFill(c, OUTFIT.suit.tie, 4); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -922); c.lineTo(s * 60, -955); c.lineTo(s * 44, -890); c.closePath(); nFill(c, OUTFIT.suit.shirt, NOAH.W * .5); } }
    else { c.beginPath(); c.moveTo(-58, -952); c.quadraticCurveTo(0, -915, 58, -952); c.lineWidth = 10; c.strokeStyle = NOAH.out; c.stroke(); }
    }
    const armsUp = arms.l.a > 1.6 || arms.r.a > 1.6;
    const sleeve = outfit === 'waiter' ? { col: OUTFIT.waiter.shirt, shade: OUTFIT.waiter.shirtShade, fold: '#cfcac1', cuff: '#ffffff', cuffLine: '#b8b2a8', width: 84 }
      : outfit === 'chef' ? { col: OUTFIT.chef.jacket, shade: OUTFIT.chef.jacketShade, fold: '#cdc9c0', cuff: '#f1efe9', width: 90, cuffK: .78 }
      : outfit === 'suit' ? { col: OUTFIT.suit.cloth, shade: OUTFIT.suit.clothDark, fold: '#121a30', cuff: OUTFIT.suit.cloth, width: 96, cuffK: .9, shirtCuff: OUTFIT.suit.shirt } : null;
    const drawArms = () => {
      if (!sleeve) { noahArm(c, -1, arms.l, false); noahArm(c, 1, arms.r, true); return; }
      noahSleeveArm(c, -1, arms.l, Object.assign({}, sleeve, { watch: false })); noahSleeveArm(c, 1, arms.r, Object.assign({}, sleeve, { watch: true }));
    };
    if (p.onlyArms) drawArms();
    else { if (!armsUp && !p.armsLast) drawArms(); noahDressedHead(c, p); if (armsUp || p.armsLast) drawArms(); }
    c.restore(); c.restore();
  } finally { NOAH.W = W0; NOAH.pants = P0; NOAH.stripe = S0; }
}
// the band of the waiter apron sits over the vest bottom
function noahWaiterApronBand(c, sitting) {
  const O = OUTFIT.waiter, top = NOAH.HEM - 70;
  c.beginPath(); c.rect(-130, top - 6, 260, 36); nFill(c, O.apron, NOAH.W * .8); stitchLine(c, [-124, top + 14, 124, top + 14], O.stitch, 3);
  c.beginPath(); c.moveTo(-118, top - 4); c.lineTo(-58, top - 10); c.lineTo(-62, top + 150); c.quadraticCurveTo(-82, top + 170, -96, top + 150); c.lineTo(-120, top + 120); c.closePath(); nFill(c, O.napkin, NOAH.W * .7);
  nLine(c, [-90, top + 4, -92, top + 140], 4, '#d3d0c8'); nLine(c, [-74, top + 4, -76, top + 150], 3, '#e2dfd8'); stitchLine(c, [-112, top + 110, -64, top + 136], '#c7c3ba', 2.5);
  if (sitting) { // apron drapes over the knees when seated
    c.beginPath(); c.moveTo(-132, top + 28); c.lineTo(132, top + 28); c.lineTo(200, top + 120); c.quadraticCurveTo(0, top + 150, -200, top + 120); c.closePath(); nFill(c, O.apron, NOAH.W * .8);
  }
}
// "alive" helper: blink + breathing for any character seed
function lifeAt(t, seed = 1) {
  const per = 3.1 + rnd(seed) * 1.6, ph = ((t + rnd(seed + 7) * 5) % per) / per, bl = ph > .955 ? Math.sin((ph - .955) / .045 * Math.PI) : 0;
  return { lid: bl, bob: Math.sin(t * 1.7 + seed) * 7, sway: Math.sin(t * .9 + seed * 2) * .012 };
}
