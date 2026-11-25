// KARTELL other characters in Noah's drawing style (white round head, dot eyes) but clearly different people
// (hair, caps, beards, clothes, size). No real-person likeness. Also: Noah seated and Noah from behind.
//   person(c, { x, y, k, s, hair, hairCol, beard, top, pants, shoe, sleeve, style, label, expr, arms, sil, child, hold, holdFront })
//   hair: 'short' | 'cap' | 'bun' | 'long' | 'bald' | 'grey' | 'helmet' | 'kid' | 'slick'
//   style: 'tee' | 'suit' | 'hoodie' | 'uniform' | 'vest' | 'dress' | 'apron' | 'coat'
const PEOPLE = {
  kumpel:   { hair: 'cap', hairCol: '#3a2a20', capCol: '#2f4858', beard: 1, top: '#6a7a5a', pants: '#3e4a5a', shoe: '#2a2420', style: 'hoodie' },
  rival:    { hair: 'slick', hairCol: '#2a2420', top: '#e8e2d4', pants: '#e0d9c8', shoe: '#8a6a4a', style: 'suit', shirt: '#2f4858' },
  worker:   { hair: 'short', hairCol: '#4a3a30', top: '#7a7f86', pants: '#3e4a5a', shoe: '#2a2420', style: 'tee' },
  mother:   { hair: 'bun', hairCol: '#8a8a86', top: '#7a5a6a', pants: '#3e3a40', shoe: '#2a2420', style: 'coat' },
  wife:     { hair: 'long', hairCol: '#5a3a26', top: '#c8b8a8', pants: '#3a3a44', shoe: '#2a2420', style: 'dress' },
  kid1:     { hair: 'kid', hairCol: '#5a4030', top: '#d8a040', pants: '#3e5878', shoe: '#e8e4dc', style: 'tee', child: 1 },
  kid2:     { hair: 'long', hairCol: '#6a4a30', top: '#c86a7a', pants: '#3e3a50', shoe: '#e8e4dc', style: 'tee', child: 1 },
  guard:    { hair: 'bald', top: '#16171a', pants: '#16171a', shoe: '#0e0e10', style: 'suit', shirt: '#16171a', sil: 1 },
  zoll:     { hair: 'short', hairCol: '#4a3a30', top: '#2f4a3a', pants: '#2a3a30', shoe: '#1a1a1c', style: 'uniform', label: 'ZOLL' },
  polizei:  { hair: 'helmet', top: '#20262e', pants: '#20262e', shoe: '#101214', style: 'vest', label: 'POLIZEI' },
  friend1:  { hair: 'short', hairCol: '#2a2420', top: '#3e5a7a', pants: '#2a2a30', shoe: '#e8e4dc', style: 'tee' },
  friend2:  { hair: 'grey', hairCol: '#c8b070', top: '#8a3a32', pants: '#2a2a30', shoe: '#e8e4dc', style: 'hoodie' },
  supplier: { hair: 'bald', top: '#121214', pants: '#121214', shoe: '#0a0a0a', style: 'coat', sil: 1 },
};
function pHair(c, p, back) {
  const cy = NOAH.HEAD.y, R = NOAH.HEAD.r, col = p.hairCol || '#3a2a20', h = p.hair || 'short';
  if (back) { // behind the head
    if (h === 'long') { c.beginPath(); c.moveTo(-R - 20, cy - 60); c.lineTo(-R - 40, cy + 330); c.lineTo(R + 40, cy + 330); c.lineTo(R + 20, cy - 60); c.closePath(); nFill(c, col, NOAH.W * .8); }
    if (h === 'bun') { c.beginPath(); c.arc(0, cy - R - 40, 90, 0, Math.PI * 2); nFill(c, col, NOAH.W * .8); }
    return;
  }
  if (h === 'bald') { c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(-80, cy - 170, 60, 26, -.4, 0, Math.PI * 2); c.fill(); return; }
  if (h === 'helmet') { c.beginPath(); c.arc(0, cy - 20, R + 30, Math.PI * 1.02, Math.PI * 1.98); c.lineTo(R + 34, cy + 30); c.lineTo(-R - 34, cy + 30); c.closePath(); nFill(c, '#1c2128'); c.beginPath(); c.rect(-R + 10, cy - 70, 2 * R - 20, 60); nFill(c, 'rgba(120,150,170,.55)', NOAH.W * .7); line(c, [-R * .6, cy - 200, R * .6, cy - 200], 10, '#2c333c'); return; }
  const cap = (dy, thick) => { c.beginPath(); c.moveTo(-R + 4, cy + dy); c.bezierCurveTo(-R - 16, cy - 200, -150, cy - 300 - thick, 0, cy - 296 - thick); c.bezierCurveTo(150, cy - 300 - thick, R + 16, cy - 200, R - 4, cy + dy); c.bezierCurveTo(R - 40, cy - 120, 140, cy - 170, 0, cy - 165); c.bezierCurveTo(-140, cy - 170, -R + 40, cy - 120, -R + 4, cy + dy); c.closePath(); };
  if (h === 'cap') { c.beginPath(); c.arc(0, cy - 40, R + 6, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); nFill(c, p.capCol || '#2f4858'); c.beginPath(); c.ellipse(60, cy - 70, 230, 40, -.05, 0, Math.PI * 2); nFill(c, shade(p.capCol || '#2f4858', -.2)); circle(c, 0, cy - R - 30, 14); nFill(c, p.capCol || '#2f4858', 6); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * (R - 6), cy - 60); c.lineTo(s * (R + 4), cy + 30); c.lineTo(s * (R - 40), cy - 20); c.closePath(); nFill(c, col, NOAH.W * .6); } return; }
  if (h === 'kid') { cap(-60, -10); nFill(c, col, NOAH.W * .8); for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 50 - 25, cy - 165); c.lineTo(i * 50, cy - 110); c.lineTo(i * 50 + 25, cy - 165); c.closePath(); nFill(c, col, NOAH.W * .5); } return; }
  if (h === 'long' || h === 'bun') { cap(-10, 10); nFill(c, col, NOAH.W * .8); line(c, [-40, cy - 290, -10, cy - 170], 5, shade(col, -.3)); return; }
  if (h === 'slick') { cap(-40, 20); nFill(c, col, NOAH.W * .8); for (let i = -3; i <= 3; i++) line(c, [i * 45, cy - 175, i * 60, cy - 300], 4, shade(col, .25)); return; }
  cap(-50, h === 'grey' ? 0 : -6); nFill(c, h === 'grey' ? (p.hairCol || '#9a9690') : col, NOAH.W * .8);
}
function pTorso(c, p) {
  const st = p.style || 'tee', top = p.top || '#6a7a8a';
  SHOULDER_PATH(c, st === 'coat' || st === 'dress' ? -330 : -490, st === 'vest' ? 18 : 4); nFill(c, top);
  if (st === 'dress') { c.beginPath(); c.moveTo(-124, -500); c.lineTo(124, -500); c.lineTo(170, -260); c.lineTo(-170, -260); c.closePath(); nFill(c, top); }
  if (st === 'suit') { for (const s of [-1, 1]) { kPoly(c, [s * 10, -930, s * 60, -955, s * 70, -880, s * 20, -700]); nFill(c, p.shirt || '#dde7f1', NOAH.W * .6); kPoly(c, [s * 40, -950, s * 96, -946, s * 90, -870, s * 50, -840, s * 70, -820, s * 22, -690]); nFill(c, shade(top, -.12), NOAH.W * .6); } }
  if (st === 'hoodie') { nLine(c, [-26, -935, -30, -820], 5, '#e9e6df'); nLine(c, [26, -935, 30, -830], 5, '#e9e6df'); c.beginPath(); c.rect(-90, -660, 180, 110); nFill(c, shade(top, -.1), NOAH.W * .6); }
  if (st === 'tee') { c.beginPath(); c.moveTo(-58, -952); c.quadraticCurveTo(0, -915, 58, -952); c.lineWidth = 14; c.strokeStyle = shade(top, -.25); c.stroke(); }
  if (st === 'apron') { c.beginPath(); c.rect(-100, -820, 200, 360); nFill(c, '#c8bca8', NOAH.W * .6); }
  if (st === 'coat') { line(c, [0, -940, 0, -340], 6, shade(top, -.3)); for (let i = 0; i < 3; i++) circle(c, 20, -820 + i * 120, 10), c.fillStyle = shade(top, -.4), c.fill(); }
  if (st === 'uniform' || st === 'vest') {
    if (st === 'vest') { kPoly(c, [-150, -940, 150, -940, 160, -520, -160, -520]); nFill(c, '#2a3038'); for (const yy of [-860, -700]) { c.beginPath(); c.rect(-140, yy, 90, 70); nFill(c, '#1e232a', NOAH.W * .5); c.beginPath(); c.rect(50, yy, 90, 70); nFill(c, '#1e232a', NOAH.W * .5); } }
    if (p.label) { c.beginPath(); c.rect(-120, st === 'vest' ? -640 : -800, 240, 64); nFill(c, st === 'vest' ? '#e8e4dc' : '#f2d23a', NOAH.W * .5); c.font = `800 ${p.label.length > 5 ? 42 : 50}px Inter`; c.fillStyle = '#1a1c20'; c.textAlign = 'center'; c.fillText(p.label, 0, st === 'vest' ? -592 : -752); }
    if (st === 'uniform') { line(c, [-150, -900, 150, -900], 10, '#f2d23a'); circle(c, -80, -860, 16); c.fillStyle = '#f2d23a'; c.fill(); }
  }
}
function pLegs(c, p) {
  const top = NOAH.HEM - 10;
  for (const s of [-1, 1]) {
    kPoly(c, [s * 4, top, s * 116, top, s * 108, -95, s * 14, -95]); nFill(c, p.pants || '#3e4a5a');
    c.beginPath(); c.moveTo(s * 20, -98); c.lineTo(s * 108, -98); c.quadraticCurveTo(s * 190, -66, s * 196, -16); c.quadraticCurveTo(s * 190, 4, s * 140, 2); c.lineTo(s * 30, 2); c.quadraticCurveTo(s * 10, -40, s * 20, -98); nFill(c, p.shoe || '#2a2420');
  }
}
function person(c, p0 = {}) {
  const p = Object.assign({}, PEOPLE[p0.who] || {}, p0);
  if (p.ink && !p._inked) { const W0 = NOAH.W; NOAH.W = W0 * p.ink; try { return person(c, Object.assign({}, p, { _inked: 1 })); } finally { NOAH.W = W0; } }
  const k = (p.k ?? .25) * (p.child ? .66 : 1), e = Object.assign({}, p.expr || {}), arms = Object.assign({}, NOAH.ARMS, p.arms || {});
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k); if (p.sil) c.globalAlpha = p.alpha ?? .92;
  if (p.sil) { const d = p.top || '#141518'; Object.assign(p, { pants: d, shoe: d, hairCol: d, capCol: d, shirt: d, top: d }); }
  c.translate(0, p.bob || 0);
  pHair(c, p, true); pLegs(c, p);
  c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = p.sil ? p.top : NOAH.skin; c.fill();
  pTorso(c, p);
  const sl = Object.assign({}, OUTFIT.haft, { sleeve: p.sleeve || p.top || '#6a7a8a', topDark: shade(p.top || '#6a7a8a', -.2) });
  const gl = kSleeve(c, -1, arms.l, sl, 'aufstieg'), gr = kSleeve(c, 1, arms.r, sl, 'aufstieg');
  if (p.hold) p.hold(c, gl, gr);
  for (const g of [gl, gr]) { c.save(); c.translate(g.wx, g.wy); if (p.sil) { circle(c, 0, 40, 40); c.fillStyle = p.top; c.fill(); } else noahHandLocal(c, -(g.sx > 0 ? 1 : -1) * g.a2); c.restore(); }
  if (p.holdFront) p.holdFront(c, gl, gr);
  c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
  const H0 = NOAH.HEAD; c.save(); c.beginPath(); c.arc(0, H0.y, H0.r, 0, Math.PI * 2); c.fillStyle = p.sil ? p.top : NOAH.shade; c.fill(); c.clip();
  if (!p.sil) { c.beginPath(); c.arc(-4, H0.y - 34, H0.r - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); } c.restore();
  c.beginPath(); c.arc(0, H0.y, H0.r, 0, Math.PI * 2); nFill(c, null);
  if (!p.sil) { if (p.beard) e.beard = 1; const hc = NOAH.hair; NOAH.hair = p.hairCol || hc; noahFace(c, e); NOAH.hair = hc; }
  pHair(c, p, false);
  c.restore(); c.restore();
}
// Noah seated (front view) on a bench/bunk seatH units high, in an outfit (rig proportions untouched)
function drawNoahSit(c, p = {}) {
  if (p.ink && !p._inked) { const W0 = NOAH.W; NOAH.W = W0 * p.ink; try { return drawNoahSit(c, Object.assign({}, p, { _inked: 1 })); } finally { NOAH.W = W0; } }
  const o = OUTFIT[p.outfit || 'haft'], k = p.k ?? .25, seat = -(p.seatH ?? 250), kneeY = seat - 40, dy = seat - (NOAH.HEM + 40) - 60;
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
  for (const s of [-1, 1]) { const kx = s * 150, fx = s * 120; nLine(c, [kx, kneeY, fx, -80], 110 + NOAH.W * 2, NOAH.out); nLine(c, [kx, kneeY, fx, -80], 110, o.pants); c.beginPath(); c.ellipse(kx, kneeY + 5, 72, 56, 0, 0, Math.PI * 2); nFill(c, o.pants); c.beginPath(); c.ellipse(fx, -40, 80, 44, 0, 0, Math.PI * 2); nFill(c, p.outfit === 'haft' ? o.sock : o.shoe); if (p.outfit === 'haft') { c.beginPath(); c.ellipse(fx, -30, 84, 30, 0, 0, Math.PI); nFill(c, o.shoe); } }
  c.restore();
  drawNoahK(c, Object.assign({}, p, { y: (p.y || 0) + dy * k, _noLegs: 1 }));
}
// Noah from behind (back of the head = hair), standing
function drawNoahBack(c, p = {}) {
  if (p.ink && !p._inked) { const W0 = NOAH.W; NOAH.W = W0 * p.ink; try { return drawNoahBack(c, Object.assign({}, p, { _inked: 1 })); } finally { NOAH.W = W0; } }
  const o = OUTFIT[p.outfit || 'haft'], k = p.k ?? .25, arms = Object.assign({}, NOAH.ARMS, p.arms || {});
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
  kLegs(c, o, p.outfit || 'haft'); SHOULDER_PATH(c, -470, 6); nFill(c, o.top); c.beginPath(); c.rect(-140, -510, 290, 40); nFill(c, o.topDark || shade(o.top, -.15), 6);
  for (const s of [-1, 1]) { const g = kArmGeo(s, s < 0 ? arms.l : arms.r); nLine(c, [g.sx, g.sy, g.ex, g.ey, g.wx, g.wy], NOAH.ARM_W + 14 + NOAH.W * 2, NOAH.out); nLine(c, [g.sx, g.sy, g.ex, g.ey, g.wx, g.wy], NOAH.ARM_W + 14, o.sleeve); c.save(); c.translate(g.wx, g.wy); noahHandLocal(c, -s * g.a2); c.restore(); }
  c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill();
  const H0 = NOAH.HEAD; c.beginPath(); c.arc(0, H0.y, H0.r, 0, Math.PI * 2); nFill(c, NOAH.shade);
  c.beginPath(); c.moveTo(-H0.r - 4, H0.y + 20); c.bezierCurveTo(-H0.r - 20, H0.y - 200, -170, H0.y - 300, 0, H0.y - 292); c.bezierCurveTo(170, H0.y - 300, H0.r + 20, H0.y - 200, H0.r + 4, H0.y + 20);
  c.lineTo(190, H0.y + 230); c.lineTo(150, H0.y + 300); c.lineTo(110, H0.y + 250); c.lineTo(60, H0.y + 310); c.lineTo(0, H0.y + 260); c.lineTo(-60, H0.y + 310); c.lineTo(-110, H0.y + 250); c.lineTo(-150, H0.y + 300); c.lineTo(-190, H0.y + 230); c.closePath(); nFill(c, NOAH.hair, NOAH.W * .8);
  for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(i * 30, H0.y - 280); c.quadraticCurveTo(i * 50, H0.y - 60, i * 42, H0.y + 260); c.lineWidth = 4; c.strokeStyle = i % 2 ? NOAH.hairDark : NOAH.hairLight; c.stroke(); }
  c.restore();
}
