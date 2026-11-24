// NOAH 1989 outfits on top of the unchanged rig (noah.js): head, hair, face, skeleton and limb lengths are NOT touched.
//   drawNoah89(c, { x, y, k, ink, s, arms, expr, tilt, bob, lean, outfit: '1989-ost' | '1989-home', sit, seatH, hold: { l, r } })
//   drawNoah89Side(c, { x, y, k, ink, s, walk, expr, outfit, armSwing, tilt, bob, run })
// '1989-ost': olive parka (zip, hood, bulging pockets) over a striped knit jumper (bordeaux / grey / cream),
//             stiff blue jeans, brown lace-up leather shoes, knitted scarf. Gold watch stays on his left wrist.
// '1989-home': the same without parka and scarf (jumper, jeans, shoes).
// hold.l / hold.r: fn(c) drawn in the hand's frame (origin = wrist, +y along the forearm, Noah units).
const N89 = {
  parka: '#5f6437', parkaDk: '#464a27', parkaLt: '#7b8150', parkaLine: '#34371c',
  jeans: '#4a6890', jeansDk: '#344c6c', jeansLt: '#7290b4', stitch: '#c79a55',
  shoe: '#6e4527', shoeDk: '#472b16', shoeLt: '#94643c', lace: '#e2d3ae',
  sw: ['#7d2b35', '#e7dcc2', '#8c8a85', '#e7dcc2'], swW: [58, 16, 34, 16], swDk: '#5c1c25',
  scarf: '#ad8740', scarfDk: '#7f6128', scarfLt: '#cfae68', zip: '#c8bfa0',
};
function n89Ink(p, fn) { if (p.ink && !p._inked) { const W0 = NOAH.W; NOAH.W = W0 * p.ink; try { return fn(Object.assign({}, p, { _inked: 1 })); } finally { NOAH.W = W0; } } return fn(p); }
// horizontal knit stripes + stitch texture inside the current clip
function n89Knit(c, x0, y0, x1, y1, phase = 0) {
  let y = y0 - ((phase % 124) + 124) % 124, i = 0;
  while (y < y1) { const h = N89.swW[i % 4]; c.fillStyle = N89.sw[i % 4]; c.fillRect(x0, y, x1 - x0, h + 1); y += h; i++; }
  c.strokeStyle = 'rgba(30,10,10,.16)'; c.lineWidth = 2.2;
  for (let yy = y0; yy < y1; yy += 12) { c.beginPath(); for (let xx = x0 + ((yy / 12) % 2) * 6; xx < x1; xx += 12) { c.moveTo(xx, yy); c.lineTo(xx + 4, yy + 6); c.lineTo(xx + 8, yy); } c.stroke(); }
}
function n89Legs(c, p) {
  const top = NOAH.HEM - 10;
  for (const s of [-1, 1]) {
    const lift = (p.legs && p.legs[s < 0 ? 0 : 1]) || 0;
    c.beginPath(); c.moveTo(s * 4, top); c.lineTo(s * 118, top); c.lineTo(s * 112, -95 - lift); c.lineTo(s * 12, -95 - lift); c.closePath(); nFill(c, N89.jeans);
    c.save(); c.clip();
    // denim twill, shading on the inner side, stiff folds, seams with orange stitching
    c.strokeStyle = 'rgba(20,35,60,.18)'; c.lineWidth = 2; for (let k = -500; k < 0; k += 9) { c.beginPath(); c.moveTo(s * 0, k); c.lineTo(s * 130, k - 40); c.stroke(); }
    c.fillStyle = 'rgba(20,30,55,.22)'; c.fillRect(s > 0 ? 0 : -40, top, 40, 600);
    c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(s > 0 ? 60 : -95, top, 35, 600);
    nLine(c, [s * 104, top, s * 100, -100], 3.5, N89.stitch); nLine(c, [s * 96, top, s * 92, -100], 2.5, 'rgba(25,40,70,.5)');
    for (const fy of [-300, -270, -150, -128]) { c.beginPath(); c.moveTo(s * 20, fy); c.quadraticCurveTo(s * 60, fy - 14, s * 104, fy + 4); c.lineWidth = 3; c.strokeStyle = N89.jeansDk; c.stroke(); }
    c.restore();
    // shoes: brown leather lace-ups
    c.beginPath(); c.moveTo(s * 18, -98 - lift); c.lineTo(s * 112, -98 - lift); c.quadraticCurveTo(s * 194, -66 - lift, s * 200, -18 - lift); c.quadraticCurveTo(s * 194, 6 - lift, s * 140, 4 - lift); c.lineTo(s * 26, 4 - lift); c.quadraticCurveTo(s * 8, -40 - lift, s * 18, -98 - lift); nFill(c, N89.shoe);
    c.save(); c.clip(); c.fillStyle = N89.shoeDk; c.fillRect(-260, -14 - lift, 520, 30); c.fillStyle = 'rgba(255,235,200,.28)'; ell(c, s * 120, -62 - lift, 40, 12, s * .3); c.fill(); c.restore();
    for (let i = 0; i < 3; i++) nLine(c, [s * (54 + i * 16), -86 - lift + i * 4, s * (84 + i * 16), -80 - lift + i * 4], 4, N89.lace);
    // jeans hem stacking over the shoe
    c.beginPath(); c.moveTo(s * 10, -110 - lift); c.quadraticCurveTo(s * 62, -84 - lift, s * 116, -108 - lift); c.lineTo(s * 114, -126 - lift); c.lineTo(s * 12, -126 - lift); c.closePath(); nFill(c, N89.jeansDk, NOAH.W * .6);
  }
}
const N89_TORSO = c => { c.beginPath(); c.moveTo(-58, -952); c.lineTo(-150, -942); c.quadraticCurveTo(-140, -820, -128, -760); c.lineTo(-122, NOAH.HEM); c.lineTo(126, NOAH.HEM); c.lineTo(132, -760); c.quadraticCurveTo(144, -820, 155, -942); c.lineTo(58, -952); c.quadraticCurveTo(0, -915, -58, -952); c.closePath(); };
function n89Jumper(c) {
  N89_TORSO(c); c.fillStyle = N89.sw[0]; c.fill();
  c.save(); N89_TORSO(c); c.clip(); n89Knit(c, -170, -960, 170, NOAH.HEM + 4, 8);
  c.fillStyle = 'rgba(30,10,15,.18)'; c.fillRect(70, -960, 100, 460);
  // ribbed hem
  c.fillStyle = N89.swDk; c.fillRect(-170, NOAH.HEM - 46, 340, 50); for (let x = -160; x < 170; x += 14) nLine(c, [x, NOAH.HEM - 44, x, NOAH.HEM], 3, 'rgba(0,0,0,.25)');
  c.restore(); N89_TORSO(c); nFill(c, null);
  // crew neck rib (hides the black t-shirt completely)
  c.beginPath(); c.moveTo(-66, -956); c.quadraticCurveTo(0, -905, 66, -956); c.lineTo(52, -968); c.quadraticCurveTo(0, -928, -52, -968); c.closePath(); nFill(c, N89.swDk, NOAH.W * .6);
}
function n89Parka(c, open = 1) {
  const HEMP = -430, inner = 30 + 22 * open;
  for (const s of [-1, 1]) {
    const panel = () => { c.beginPath(); c.moveTo(s * 62, -962); c.lineTo(s * 168, -950); c.quadraticCurveTo(s * 178, -820, s * 168, -700); c.lineTo(s * 166, HEMP); c.quadraticCurveTo(s * 110, HEMP + 10, s * (inner + 4), HEMP); c.lineTo(s * inner, -760); c.quadraticCurveTo(s * (inner + 6), -900, s * 62, -962); c.closePath(); };
    panel(); c.fillStyle = N89.parka; c.fill();
    c.save(); panel(); c.clip();
    // fabric shading + folds
    c.fillStyle = 'rgba(25,28,10,.22)'; c.fillRect(s > 0 ? 120 : -190, -980, 70, 600);
    c.fillStyle = 'rgba(255,255,220,.08)'; c.fillRect(s > 0 ? 50 : -100, -980, 50, 600);
    for (const [fy, fl] of [[-610, 70], [-575, 50], [-520, 60]]) { c.beginPath(); c.moveTo(s * (inner + 10), fy); c.quadraticCurveTo(s * (inner + fl * .6), fy + 18, s * (inner + fl + 30), fy - 6); c.lineWidth = 3.5; c.strokeStyle = N89.parkaDk; c.stroke(); }
    // yoke seam + shoulder epaulette
    c.beginPath(); c.moveTo(s * inner, -880); c.quadraticCurveTo(s * 110, -872, s * 175, -895); c.lineWidth = 3; c.strokeStyle = N89.parkaLine; c.stroke();
    // chest pocket with flap
    c.beginPath(); c.rect(s > 0 ? 72 : -142, -850, 70, 86); fs(c, N89.parkaLt, 3, N89.parkaLine); c.beginPath(); c.rect(s > 0 ? 68 : -146, -862, 78, 30); fs(c, N89.parka, 3, N89.parkaLine); circle(c, s * 107, -842, 6); fs(c, N89.parkaDk);
    // big bulging bellows pocket with flap
    const px = s > 0 ? 62 : -164; c.beginPath(); c.moveTo(px, -640); c.lineTo(px + 102, -640); c.quadraticCurveTo(px + 110, -540, px + 100, -470); c.lineTo(px + 2, -470); c.quadraticCurveTo(px - 8, -540, px, -640); fs(c, N89.parkaLt, 3, N89.parkaLine);
    ell(c, px + 52, -548, 34, 40); c.fillStyle = 'rgba(255,255,230,.14)'; c.fill();
    c.beginPath(); c.moveTo(px - 6, -666); c.lineTo(px + 108, -666); c.lineTo(px + 104, -624); c.lineTo(px - 2, -624); c.closePath(); fs(c, N89.parka, 3, N89.parkaLine); circle(c, px + 51, -640, 6); fs(c, N89.parkaDk);
    // drawstring channel
    nLine(c, [s * inner, -585, s * 170, -590], 3, N89.parkaLine);
    c.restore();
    panel(); nFill(c, null, NOAH.W);
    // zip tape along the opening
    c.save(); c.setLineDash([5, 6]); nLine(c, [s * (inner + 7), -930, s * (inner + 3), HEMP + 6], 5, N89.zip); c.restore();
  }
  // drawstring toggles hanging at the hem
  for (const s of [-1, 1]) { nLine(c, [s * (inner + 14), HEMP + 4, s * (inner + 20), HEMP + 50], 4, '#2a2a20'); ell(c, s * (inner + 20), HEMP + 56, 9, 12); nFill(c, '#3a3a2c', 4); }
}
function n89Hood(c) {
  // bunched hood behind the neck, visible between head and shoulders
  c.beginPath(); c.moveTo(-170, -935); c.quadraticCurveTo(-190, -1020, -110, -1050); c.lineTo(110, -1050); c.quadraticCurveTo(190, -1020, 170, -935); c.quadraticCurveTo(0, -960, -170, -935); c.closePath(); nFill(c, N89.parkaDk, NOAH.W * .8);
  nLine(c, [-130, -1000, 130, -1000], 3, N89.parkaLine);
}
function n89Scarf(c, sideView) {
  if (sideView) return;
  // wrap around the neck
  c.beginPath(); c.moveTo(-82, -1008); c.quadraticCurveTo(0, -985, 82, -1008); c.lineTo(88, -948); c.quadraticCurveTo(0, -918, -88, -948); c.closePath(); nFill(c, N89.scarf, NOAH.W * .8);
  c.save(); c.clip(); for (let x = -90; x < 95; x += 14) nLine(c, [x, -1010, x + 10, -930], 4, N89.scarfDk); nLine(c, [-90, -968, 90, -968], 6, N89.scarfLt); c.restore();
  // hanging end over the chest (with fringe)
  c.beginPath(); c.moveTo(-74, -962); c.lineTo(4, -962); c.quadraticCurveTo(-2, -820, -10, -700); c.lineTo(-82, -706); c.quadraticCurveTo(-78, -830, -74, -962); c.closePath(); nFill(c, N89.scarf, NOAH.W * .8);
  c.save(); c.clip(); for (let x = -80; x < 10; x += 13) nLine(c, [x, -962, x - 4, -700], 3.5, N89.scarfDk); c.fillStyle = N89.scarfLt; c.fillRect(-90, -780, 100, 16); c.fillRect(-90, -752, 100, 8); c.restore();
  for (let i = 0; i < 7; i++) nLine(c, [-78 + i * 11, -702, -80 + i * 11, -666 + (i % 2) * 6], 4, N89.scarfDk);
}
function n89Arm(c, side, spec, watch, parka, hold) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y;
  const a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  const sw = NOAH.ARM_W + (parka ? 26 : 14), col = parka ? N89.parka : N89.sw[0];
  const fx = (wx - ex) / NOAH.FORE, fy = (wy - ey) / NOAH.FORE, nx = -fy, ny = fx;
  // bare wrist first (the sleeve covers its round cap), sleeve ends at 84 % of the forearm
  const cx = ex + (wx - ex) * .78, cy = ey + (wy - ey) * .78;
  nLine(c, [cx, cy, wx, wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [cx, cy, wx, wy], NOAH.ARM_W, NOAH.skin);
  if (watch) { const mx = cx + (wx - cx) * .6, my = cy + (wy - cy) * .6; nLine(c, [mx - nx * 38, my - ny * 38, mx + nx * 38, my + ny * 38], 22, NOAH.out); nLine(c, [mx - nx * 34, my - ny * 34, mx + nx * 34, my + ny * 34], 12, NOAH.watch); c.beginPath(); c.arc(mx + nx * 30 * side, my + ny * 30 * side, 15, 0, Math.PI * 2); nFill(c, NOAH.watch, 7); }
  c.save(); c.translate(wx, wy); noahHandLocal(c, -side * a2 + (spec.hand || 0));
  if (hold) { c.rotate(-side * a2 + (spec.hand || 0)); c.translate(0, 70); hold(c); }
  c.restore();
  const slv = (w, cl) => { circle(c, sx, sy, w / 2); c.fillStyle = cl; c.fill(); c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(cx, cy); c.lineWidth = w; c.strokeStyle = cl; c.lineCap = 'butt'; c.lineJoin = 'round'; c.stroke(); c.lineCap = 'round'; };
  slv(sw + NOAH.W * 2, NOAH.out); slv(sw, col);
  if (parka) { nLine(c, [sx + side * 8, sy + 30, ex + side * 6, ey - 10], 5, N89.parkaLt); c.beginPath(); c.arc(ex, ey, 24, -1, 1.2); c.lineWidth = 4; c.strokeStyle = N89.parkaDk; c.stroke(); }
  else { // knit stripes around the sleeve
    const ux = (ex - sx) / NOAH.UPPER, uy = (ey - sy) / NOAH.UPPER, mx = -uy, my = ux;
    for (const k of [.38, .5]) { const px = sx + (ex - sx) * k, py = sy + (ey - sy) * k; c.lineCap = 'butt'; nLine(c, [px - mx * sw / 2, py - my * sw / 2, px + mx * sw / 2, py + my * sw / 2], k === .38 ? 14 : 8, k === .38 ? N89.sw[1] : N89.sw[2]); }
  }
  // ribbed cuff
  const k1x = ex + (wx - ex) * .68, k1y = ey + (wy - ey) * .68;
  c.lineCap = 'butt'; nLine(c, [k1x, k1y, cx, cy], sw + 4, parka ? N89.parkaDk : N89.swDk); c.lineCap = 'round';
  nLine(c, [k1x - nx * (sw / 2 + 2), k1y - ny * (sw / 2 + 2), k1x + nx * (sw / 2 + 2), k1y + ny * (sw / 2 + 2)], 4, NOAH.out);
  nLine(c, [cx - nx * (sw / 2 + 2), cy - ny * (sw / 2 + 2), cx + nx * (sw / 2 + 2), cy + ny * (sw / 2 + 2)], NOAH.W, NOAH.out);
}
function n89LegsSitting(c, p) {
  const seat = -(p.seatH ?? 250), kneeY = seat - 40;
  for (const s of [-1, 1]) {
    const kx = s * 150, fx = s * 120;
    nLine(c, [kx, kneeY, fx, -80], 116 + NOAH.W * 2, NOAH.out); nLine(c, [kx, kneeY, fx, -80], 116, N89.jeans);
    nLine(c, [kx + s * 40, kneeY + 20, fx + s * 42, -90], 3.5, N89.stitch);
    c.beginPath(); c.ellipse(kx, kneeY + 5, 76, 58, 0, 0, Math.PI * 2); nFill(c, N89.jeans);
    c.beginPath(); c.ellipse(kx - s * 8, kneeY - 6, 40, 22, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.12)'; c.fill();
    c.beginPath(); c.moveTo(fx - 70, -110); c.quadraticCurveTo(fx, -90, fx + 70, -110); c.lineTo(fx + 66, -128); c.lineTo(fx - 66, -128); c.closePath(); nFill(c, N89.jeansDk, NOAH.W * .6);
    c.beginPath(); c.ellipse(fx, -44, 84, 46, 0, 0, Math.PI * 2); nFill(c, N89.shoe);
    for (let i = 0; i < 3; i++) nLine(c, [fx - 24, -70 + i * 12, fx + 24, -70 + i * 12], 4, N89.lace);
  }
}
function drawNoah89(c, p0 = {}) {
  return n89Ink(p0, p => {
    const k = p.k ?? .25, arms = Object.assign({}, NOAH.ARMS, p.arms || {}), e = p.expr || {}, parka = (p.outfit || '1989-ost') === '1989-ost';
    const dy = p.sit ? (-(p.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0, hold = p.hold || {};
    c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k); if (p.lean) c.rotate(p.lean);
    if (p.sit) n89LegsSitting(c, p); else n89Legs(c, p);
    c.save(); c.translate(0, dy + (p.bob || 0));
    if (parka) n89Hood(c);
    n89Jumper(c);
    if (parka) n89Parka(c, p.open ?? 1);
    c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-46, -1000, -46, -952], 10, NOAH.out); nLine(c, [46, -1000, 46, -952], 10, NOAH.out);
    if (parka) n89Scarf(c);
    const armsUp = arms.l.a > 1.6 || arms.r.a > 1.6;
    const drawArms = () => { n89Arm(c, -1, arms.l, false, parka, hold.l); n89Arm(c, 1, arms.r, true, parka, hold.r); };
    if (!armsUp) drawArms();
    c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
    noahHairBack(c); noahHeadLocal(c, e); c.restore();
    if (armsUp || p.armsFront) drawArms();
    c.restore(); c.restore();
  });
}
// ---------------- side profile ----------------
function n89SideLeg(c, th, bend, far) {
  const S = NOAH_SIDE, [hx, hy] = S.HIP;
  const kx = hx + Math.sin(th) * S.THIGH, ky = hy + Math.cos(th) * S.THIGH;
  const t2 = th - bend, ax = kx + Math.sin(t2) * S.SHIN, ay = ky + Math.cos(t2) * S.SHIN;
  const col = far ? N89.jeansDk : N89.jeans, w = S.LEG_W + 6;
  nLine(c, [hx, hy, kx, ky, ax, ay], w + NOAH.W * 2, NOAH.out); nLine(c, [hx, hy, kx, ky, ax, ay], w, col);
  nLine(c, [hx + 34, hy, kx + 34, ky, ax + 30, ay - 10], 3, far ? 'rgba(199,154,85,.5)' : N89.stitch);
  c.save(); c.translate(ax, ay - 10); c.rotate(Math.max(-.35, Math.min(.35, t2 * .5)));
  c.beginPath(); c.moveTo(-62, -4); c.lineTo(-62, 74); c.lineTo(126, 76); c.quadraticCurveTo(154, 62, 138, 32); c.quadraticCurveTo(98, 4, 36, -8); c.closePath();
  nFill(c, far ? N89.shoeDk : N89.shoe, NOAH.W * .9);
  c.fillStyle = far ? '#2e1c0e' : N89.shoeDk; c.fillRect(-60, 58, 186, 16);
  if (!far) for (let i = 0; i < 3; i++) nLine(c, [30 + i * 22, 2 + i * 6, 46 + i * 22, -6 + i * 6], 4, N89.lace);
  // hem
  c.beginPath(); c.rect(-66, -36, 136, 30); nFill(c, far ? '#2a3c55' : N89.jeansDk, NOAH.W * .6);
  c.restore();
}
function n89SideArm(c, th, bend, far, parka, watch) {
  const [sx, sy] = NOAH_SIDE.SHOULDER;
  const ex = sx + Math.sin(th) * NOAH.UPPER, ey = sy + Math.cos(th) * NOAH.UPPER;
  const t2 = th + bend, wx = ex + Math.sin(t2) * NOAH.FORE, wy = ey + Math.cos(t2) * NOAH.FORE;
  const sw = NOAH.ARM_W + (parka ? 26 : 14), col = parka ? (far ? N89.parkaDk : N89.parka) : (far ? N89.swDk : N89.sw[0]);
  const cx = ex + (wx - ex) * .8, cy = ey + (wy - ey) * .8;
  const fx = (wx - ex) / NOAH.FORE, fy = (wy - ey) / NOAH.FORE, nx = -fy, ny = fx;
  nLine(c, [cx, cy, wx, wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [cx, cy, wx, wy], NOAH.ARM_W, far ? '#e8e4e0' : NOAH.skin);
  if (watch) { const mx = cx + (wx - cx) * .55, my = cy + (wy - cy) * .55; nLine(c, [mx - nx * 36, my - ny * 36, mx + nx * 36, my + ny * 36], 20, NOAH.out); nLine(c, [mx - nx * 32, my - ny * 32, mx + nx * 32, my + ny * 32], 11, NOAH.watch); }
  c.save(); c.translate(wx, wy); c.scale(.92, 1); noahHandLocal(c, -t2); c.restore();
  const slv = (w, cl) => { circle(c, sx, sy, w / 2); c.fillStyle = cl; c.fill(); c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(cx, cy); c.lineWidth = w; c.strokeStyle = cl; c.lineCap = 'butt'; c.lineJoin = 'round'; c.stroke(); c.lineCap = 'round'; };
  slv(sw + NOAH.W * 2, NOAH.out); slv(sw, col);
  if (parka && !far) { c.beginPath(); c.arc(ex, ey, 24, -.5, 1.6); c.lineWidth = 4; c.strokeStyle = N89.parkaDk; c.stroke(); }
  const k1x = ex + (wx - ex) * .7, k1y = ey + (wy - ey) * .7;
  c.lineCap = 'butt'; nLine(c, [k1x, k1y, cx, cy], sw + 2, parka ? N89.parkaDk : N89.swDk); c.lineCap = 'round';
  nLine(c, [cx - nx * (sw / 2 + 2), cy - ny * (sw / 2 + 2), cx + nx * (sw / 2 + 2), cy + ny * (sw / 2 + 2)], NOAH.W, NOAH.out);
}
function n89SideTorso(c, parka, s) {
  if (!parka) {
    c.beginPath(); c.moveTo(-62, -968); c.quadraticCurveTo(-104, -960, -112, -940); c.lineTo(-116, -515); c.lineTo(108, -515); c.lineTo(104, -930); c.quadraticCurveTo(84, -960, 42, -968); c.quadraticCurveTo(-10, -948, -62, -968); c.closePath();
    c.fillStyle = N89.sw[0]; c.fill(); c.save(); c.clip(); n89Knit(c, -130, -980, 120, -510, 8); c.fillStyle = N89.swDk; c.fillRect(-130, -560, 260, 50); c.restore(); nFill(c, null);
    return;
  }
  // hood lump at the back of the neck
  c.beginPath(); c.moveTo(-40, -950); c.quadraticCurveTo(-150, -1000, -150, -1060); c.quadraticCurveTo(-90, -1080, -10, -1010); c.closePath(); nFill(c, N89.parkaDk, NOAH.W * .8);
  const body = () => { c.beginPath(); c.moveTo(-70, -975); c.quadraticCurveTo(-124, -965, -130, -930); c.lineTo(-136, -430); c.quadraticCurveTo(-10, -420, 130, -432); c.lineTo(120, -930); c.quadraticCurveTo(100, -968, 50, -975); c.quadraticCurveTo(-10, -955, -70, -975); c.closePath(); };
  body(); c.fillStyle = N89.parka; c.fill(); c.save(); body(); c.clip();
  c.fillStyle = 'rgba(25,28,10,.22)'; c.fillRect(-140, -980, 60, 560); c.fillStyle = 'rgba(255,255,220,.08)'; c.fillRect(40, -980, 50, 560);
  // side pocket (bulging), drawstring, folds, zip at the front edge
  c.beginPath(); c.moveTo(-30, -640); c.lineTo(80, -640); c.quadraticCurveTo(96, -550, 84, -470); c.lineTo(-26, -470); c.quadraticCurveTo(-40, -550, -30, -640); fs(c, N89.parkaLt, 3, N89.parkaLine);
  c.beginPath(); c.rect(-36, -666, 122, 40); fs(c, N89.parka, 3, N89.parkaLine);
  nLine(c, [-140, -588, 130, -592], 3, N89.parkaLine);
  for (const fy of [-610, -540]) { c.beginPath(); c.moveTo(-120, fy); c.quadraticCurveTo(-60, fy + 16, 10, fy - 6); c.lineWidth = 3.5; c.strokeStyle = N89.parkaDk; c.stroke(); }
  c.save(); c.setLineDash([5, 6]); nLine(c, [112, -930, 122, -440], 5, N89.zip); c.restore();
  c.restore(); body(); nFill(c, null);
  // scarf: wrap + end hanging in front
  c.beginPath(); c.moveTo(-60, -1010); c.quadraticCurveTo(20, -990, 70, -1000); c.lineTo(86, -940); c.quadraticCurveTo(10, -925, -64, -950); c.closePath(); nFill(c, N89.scarf, NOAH.W * .8);
  c.beginPath(); c.moveTo(60, -960); c.lineTo(112, -955); c.lineTo(120, -720); c.lineTo(70, -716); c.closePath(); nFill(c, N89.scarf, NOAH.W * .8);
  c.save(); c.clip(); for (let y = -960; y < -700; y += 13) nLine(c, [50, y, 130, y - 3], 3.5, N89.scarfDk); c.restore();
  for (let i = 0; i < 4; i++) nLine(c, [74 + i * 12, -718, 74 + i * 12, -690], 4, N89.scarfDk);
}
function drawNoah89Side(c, p0 = {}) {
  return n89Ink(p0, p => {
    const k = p.k ?? .25, e = p.expr || {}, parka = (p.outfit || '1989-ost') === '1989-ost';
    const ph = p.walk, walking = ph !== null && ph !== undefined, run = p.run ? 1.6 : 1;
    const sw = walking ? Math.sin(ph) : 0, lift = walking ? Math.max(0, Math.cos(ph)) : 0, lift2 = walking ? Math.max(0, -Math.cos(ph)) : 0;
    const bob = (walking ? -Math.abs(Math.cos(ph)) * 12 * run : 0) + (p.bob || 0), aSw = (p.armSwing ?? .38) * run;
    c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k); if (p.lean) c.rotate(p.lean);
    c.save(); c.translate(0, bob);
    n89SideArm(c, walking ? aSw * sw : .05, walking ? .12 + .1 * Math.max(0, sw) + (p.run ? .9 : 0) : -.05, true, parka, (p.s || 1) > 0);
    n89SideLeg(c, walking ? -.42 * sw * run : -.03, walking ? .7 * lift2 * run : 0, true);
    n89SideLeg(c, walking ? .42 * sw * run : .03, walking ? .7 * lift * run : 0, false);
    n89SideTorso(c, parka, p.s || 1);
    c.beginPath(); c.rect(-28, -1000, 72, 50); c.fillStyle = NOAH.skin; c.fill();
    c.save(); c.translate(0, -980); c.rotate(p.tilt || 0); c.translate(0, 980); noahSideHead(c, e); c.restore();
    if (parka) { c.beginPath(); c.moveTo(-50, -1006); c.quadraticCurveTo(20, -985, 74, -998); c.lineTo(84, -950); c.quadraticCurveTo(10, -935, -54, -956); c.closePath(); nFill(c, N89.scarf, NOAH.W * .8); }
    n89SideArm(c, walking ? -aSw * sw : .02, walking ? .12 + .1 * Math.max(0, -sw) + (p.run ? .9 : 0) : -.05, false, parka, (p.s || 1) < 0);
    c.restore(); c.restore();
  });
}
