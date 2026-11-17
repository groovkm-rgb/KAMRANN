// Noah in era clothes — layers on top of the unchanged rig (same internals as drawNoah / drawNoahSide).
// era: 0 = classic (t-shirt, trousers), 1 = + fur cape from the old woman, 2 = full kit (cape, leather sleeves, leggings, fur boots).
// The "Noah" lettering on the t-shirt stays visible through the open front of the cape.
const ERA = { cape: '#b9a48a', capeD: '#8c7860', capeL: '#dccbb0', leather: '#8a6040', leatherD: '#5e3e26', boot: '#5a4232', bootFur: '#cdb898' };

function eraCapeFront(c, stage) {
  // fur cape over the shoulders, open front (x ±100 stays free)
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 70, -968); c.quadraticCurveTo(s * 190, -980, s * 205, -900);
    c.quadraticCurveTo(s * 228, -640, s * 214, stage > 1 ? -330 : -420);
    for (let i = 0; i <= 4; i++) c.lineTo(s * (214 - i * 26), (stage > 1 ? -330 : -420) + (i % 2 ? 26 : 0));
    c.lineTo(s * 104, stage > 1 ? -350 : -440); c.quadraticCurveTo(s * 96, -700, s * 104, -930); c.closePath();
    const g = c.createLinearGradient(s * 100, 0, s * 220, 0); g.addColorStop(0, ERA.capeL); g.addColorStop(1, ERA.capeD);
    c.fillStyle = g; c.fill(); c.lineWidth = NOAH.W; c.strokeStyle = NOAH.out; c.lineJoin = 'round'; c.stroke();
    c.save(); c.clip(); for (let i = 0; i < 26; i++) { const x = s * (110 + rnd(i * 3 + (s > 0 ? 1 : 0)) * 100), y = -920 + rnd(i * 7 + 2) * 560; nLine(c, [x, y, x + s * 8, y + 30], 4, i % 2 ? ERA.capeD : '#efe2cc'); } c.restore();
  }
  // fur collar behind the neck + bone toggle
  c.beginPath(); c.ellipse(0, -965, 150, 44, 0, Math.PI, 0); c.lineTo(150, -950); c.quadraticCurveTo(0, -900, -150, -950); c.closePath(); c.fillStyle = ERA.capeL; c.fill(); c.lineWidth = NOAH.W * .8; c.strokeStyle = NOAH.out; c.stroke();
  nLine(c, [-104, -900, 104, -900], 8, '#4a3626'); c.beginPath(); c.ellipse(0, -900, 34, 13, 0, 0, Math.PI * 2); c.fillStyle = '#efe4c8'; c.fill(); c.lineWidth = 5; c.strokeStyle = NOAH.out; c.stroke();
}
function eraSleeve(c, side, spec) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE * .66, wy = ey + Math.cos(a2) * NOAH.FORE * .66;
  nLine(c, [sx, sy, ex, ey, wx, wy], NOAH.ARM_W + 26 + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey, wx, wy], NOAH.ARM_W + 26, ERA.leather);
  c.beginPath(); c.arc(wx, wy, 44, 0, Math.PI * 2); c.fillStyle = ERA.bootFur; c.fill(); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke();
}
function eraLegsFront(c) {
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 4, NOAH.HEM - 10); c.lineTo(s * 120, NOAH.HEM - 10); c.lineTo(s * 112, -180); c.lineTo(s * 12, -180); c.closePath(); nFill(c, ERA.leather);
    c.save(); c.setLineDash([12, 10]); nLine(c, [s * 64, NOAH.HEM, s * 62, -190], 4, '#c9a678'); c.restore();
    c.beginPath(); c.moveTo(s * 10, -210); c.lineTo(s * 122, -210); c.quadraticCurveTo(s * 196, -70, s * 200, -16); c.quadraticCurveTo(s * 190, 4, s * 140, 2); c.lineTo(s * 26, 2); c.quadraticCurveTo(s * 4, -90, s * 10, -210); nFill(c, ERA.boot);
    c.beginPath(); c.ellipse(s * 66, -210, 72, 26, 0, 0, Math.PI * 2); nFill(c, ERA.bootFur, NOAH.W * .7);
  }
}
// front view with era clothes (same parameters as drawNoah; sitting falls back to drawNoah + cape)
function drawNoahE(c, p = {}) {
  const stage = p.era ?? 0;
  if (!stage) return drawNoah(c, p);
  if (p.ink && !p._inked) { const W0 = NOAH.W; NOAH.W = W0 * p.ink; try { return drawNoahE(c, Object.assign({}, p, { _inked: 1 })); } finally { NOAH.W = W0; } }
  const k = p.k ?? .5, arms = Object.assign({}, NOAH.ARMS, p.arms || {}), e = p.expr || {};
  const dy = p.sit ? (-(p.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0;
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
  if (p.lean) c.rotate(p.lean);
  if (p.sit) noahLegsSitting(c, p, false); else if (stage > 1) eraLegsFront(c); else noahLegs(c, p);
  c.save(); c.translate(0, dy + (p.bob || 0));
  noahTorso(c);
  c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-46, -1000, -46, -948], 10, NOAH.out); nLine(c, [46, -1000, 46, -948], 10, NOAH.out);
  const up = arms.l.a > 1.6 || arms.r.a > 1.6;
  const drawArms = () => { for (const [sd, sp, w] of [[-1, arms.l, false], [1, arms.r, true]]) { noahArm(c, sd, sp, w); if (stage > 1) { eraSleeve(c, sd, sp); if (w) noahArmWatchHand(c, sd, sp); else noahArmHand(c, sd, sp); } } };
  if (!up) { eraCapeFront(c, stage); drawArms(); }
  c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
  noahHairBack(c); noahHeadLocal(c, e); c.restore();
  if (up) { eraCapeFront(c, stage); drawArms(); }
  if (p.cut) noahCutMark(c, 1, arms.r);
  c.restore(); c.restore();
}
function armPts(side, spec) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER, wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  return { sx, sy, ex, ey, wx, wy, a2 };
}
function noahArmHand(c, side, spec) { const P = armPts(side, spec); nLine(c, [P.ex + (P.wx - P.ex) * .66, P.ey + (P.wy - P.ey) * .66, P.wx, P.wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [P.ex + (P.wx - P.ex) * .7, P.ey + (P.wy - P.ey) * .7, P.wx, P.wy], NOAH.ARM_W, NOAH.skin); c.save(); c.translate(P.wx, P.wy); noahHandLocal(c, -side * P.a2 + (spec.hand || 0)); c.restore(); }
function noahArmWatchHand(c, side, spec) {
  noahArmHand(c, side, spec); const P = armPts(side, spec), kk = .84, cx = P.ex + (P.wx - P.ex) * kk, cy = P.ey + (P.wy - P.ey) * kk, fx = side * Math.sin(P.a2), fy = Math.cos(P.a2);
  nLine(c, [cx - fy * 40, cy + fx * 40, cx + fy * 40, cy - fx * 40], 22, NOAH.out); nLine(c, [cx - fy * 36, cy + fx * 36, cx + fy * 36, cy - fx * 36], 13, NOAH.watch);
  c.beginPath(); c.arc(cx + fy * 34 * side, cy - fx * 34 * side, 18, 0, Math.PI * 2); nFill(c, NOAH.watch, 8);
  c.save(); c.translate(P.wx, P.wy); noahHandLocal(c, -side * P.a2 + (spec.hand || 0)); c.restore();
}
// the small cut on the index finger (left hand = rig's right arm). Red line, no blood.
function noahCutMark(c, side, spec) { const P = armPts(side, spec); c.save(); c.translate(P.wx, P.wy); c.rotate(-side * P.a2 + (spec.hand || 0)); nLine(c, [-12, 70, 2, 76], 6, '#c8323a'); c.restore(); }

// side view with era clothes
function drawNoahSideE(c, p = {}) {
  const stage = p.era ?? 0;
  drawNoahSide(c, p);
  if (!stage) return;
  const k = p.k ?? .5, ph = p.walk, walking = ph !== null && ph !== undefined;
  const sw = walking ? Math.sin(ph) : 0, lift = walking ? Math.max(0, Math.cos(ph)) : 0, lift2 = walking ? Math.max(0, -Math.cos(ph)) : 0;
  const bob = (walking ? -Math.abs(Math.cos(ph)) * 12 : 0) + (p.bob || 0), W0 = NOAH.W; NOAH.W = W0 * (p.ink || 1);
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k); c.translate(0, bob);
  if (stage > 1) for (const [th, bend, far] of [[walking ? -.42 * sw : -.03, walking ? .7 * lift2 : 0, 1], [walking ? .42 * sw : .03, walking ? .7 * lift : 0, 0]]) {
    const [hx, hy] = NOAH_SIDE.HIP, kx = hx + Math.sin(th) * NOAH_SIDE.THIGH, ky = hy + Math.cos(th) * NOAH_SIDE.THIGH, t2 = th - bend, ax = kx + Math.sin(t2) * NOAH_SIDE.SHIN, ay = ky + Math.cos(t2) * NOAH_SIDE.SHIN;
    nLine(c, [hx, hy, kx, ky, ax, ay - 40], NOAH_SIDE.LEG_W + NOAH.W * 2, NOAH.out); nLine(c, [hx, hy, kx, ky, ax, ay - 40], NOAH_SIDE.LEG_W, far ? ERA.leatherD : ERA.leather);
    c.save(); c.translate(ax, ay - 10); c.rotate(Math.max(-.35, Math.min(.35, t2 * .5)));
    c.beginPath(); c.moveTo(-62, -120); c.lineTo(-64, 72); c.lineTo(124, 74); c.quadraticCurveTo(152, 60, 136, 32); c.quadraticCurveTo(96, 4, 50, -10); c.lineTo(52, -120); c.closePath(); nFill(c, far ? '#45332a' : ERA.boot, NOAH.W * .9);
    c.beginPath(); c.ellipse(-5, -120, 66, 22, 0, 0, Math.PI * 2); nFill(c, ERA.bootFur, NOAH.W * .6); c.restore();
  }
  // cape seen from the side: hangs from the shoulders down the back, front edge open (lettering "N" still shows)
  c.beginPath(); c.moveTo(40, -975); c.quadraticCurveTo(-60, -995, -140, -950); c.quadraticCurveTo(-200, -700, -190 - sw * 20, stage > 1 ? -330 : -420);
  for (let i = 0; i <= 5; i++) c.lineTo(-190 + i * 40 - sw * 20, (stage > 1 ? -330 : -420) + (i % 2 ? 24 : 0));
  c.quadraticCurveTo(-20, -650, 0, -940); c.closePath();
  const g = c.createLinearGradient(-200, 0, 40, 0); g.addColorStop(0, ERA.capeD); g.addColorStop(1, ERA.capeL); c.fillStyle = g; c.fill(); c.lineWidth = NOAH.W; c.strokeStyle = NOAH.out; c.stroke();
  c.save(); c.clip(); for (let i = 0; i < 18; i++) { const x = -180 + rnd(i + 3) * 170, y = -930 + rnd(i + 9) * 560; nLine(c, [x, y, x - 8, y + 30], 4, i % 2 ? ERA.capeD : '#efe2cc'); } c.restore();
  c.beginPath(); c.ellipse(-30, -968, 110, 40, -.15, 0, Math.PI * 2); nFill(c, ERA.capeL, NOAH.W * .8);
  // near arm sleeve
  if (stage > 1) { const th = walking ? -(p.armSwing ?? .38) * sw : .02, bend = walking ? .12 + .1 * Math.max(0, -sw) : -.05, [sx, sy] = NOAH_SIDE.SHOULDER, ex = sx + Math.sin(th) * NOAH.UPPER, ey = sy + Math.cos(th) * NOAH.UPPER, t2 = th + bend, wx = ex + Math.sin(t2) * NOAH.FORE * .66, wy = ey + Math.cos(t2) * NOAH.FORE * .66;
    nLine(c, [sx, sy, ex, ey, wx, wy], NOAH.ARM_W + 26 + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey, wx, wy], NOAH.ARM_W + 26, ERA.leather); c.beginPath(); c.arc(wx, wy, 44, 0, Math.PI * 2); nFill(c, ERA.bootFur, 8); }
  c.restore(); NOAH.W = W0;
}
