// FOLK: generic people in Noah's drawing language (white round heads, dot eyes, thick ink). No real persons.
//   drawFolk(c, o)      front view       drawFolkSide(c, o)   side view (o.s = 1 faces right), o.walk = phase | null
// o: { x, y, k = .25, h = 1 (height), ink = 1.8, hair: 'short'|'perm'|'bald'|'long'|'bun'|'mullet'|'side', hairCol,
//      hat: null|'bobble'|'cap'|'fur'|'border'|'scarf', hatCol, coat: colour, coatLen: 'short'|'long', type: 'coat'|'parka'|'jacket'|'cardigan'|'track'|'uniform'|'suit'|'apron',
//      pants, shoes, skirt, glasses, moustache, beard, expr, arms, bag: null|'net'|'bag', pyjama, slippers, collar }
const FOLK_HAIR = ['#3a2c24', '#5b4636', '#7a5a3a', '#2a2422', '#8a7a6a', '#b9b2a6', '#a0703c', '#4a3a30'];
function folkInk(o) { return NOAH.W * (o.ink ?? 1.8); }
function folkHairBack(c, o, cy, R) {
  const col = o.hairCol || FOLK_HAIR[0];
  if (o.hair === 'long' || o.hair === 'mullet') {
    c.beginPath(); c.moveTo(-R + 10, cy - 40); c.quadraticCurveTo(-R - 30, cy + 200, -R + 40, cy + (o.hair === 'long' ? 330 : 280)); c.lineTo(R - 40, cy + (o.hair === 'long' ? 330 : 280)); c.quadraticCurveTo(R + 30, cy + 200, R - 10, cy - 40); c.closePath(); nFill(c, col, NOAH.W * .7);
  }
  if (o.hair === 'perm') blobsPerm(c, cy, R, col, true);
}
function blobsPerm(c, cy, R, col, back) {
  const pts = back ? [[-R - 10, cy + 40, 80], [R + 10, cy + 40, 80], [-R + 10, cy + 150, 70], [R - 10, cy + 150, 70]] : [[-R + 20, cy - 150, 95], [-120, cy - 245, 100], [0, cy - 275, 105], [120, cy - 245, 100], [R - 20, cy - 150, 95], [-R - 15, cy - 40, 80], [R + 15, cy - 40, 80]];
  for (const [x, y, r] of pts) { circle(c, x, y, r + NOAH.W * .7); c.fillStyle = NOAH.out; c.fill(); }
  for (const [x, y, r] of pts) { circle(c, x, y, r); c.fillStyle = col; c.fill(); }
  c.strokeStyle = shade(col, .25); c.lineWidth = 5; for (const [x, y, r] of pts) { c.beginPath(); c.arc(x - r * .2, y - r * .1, r * .45, 3.6, 5.6); c.stroke(); }
}
function folkHead(c, o) {
  const cy = -1240, R = 262, col = o.hairCol || FOLK_HAIR[0], e = o.expr || {};
  folkHairBack(c, o, cy, R);
  c.save(); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.fillStyle = NOAH.shade; c.fill(); c.clip(); c.beginPath(); c.arc(-4, cy - 34, R - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.restore();
  c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); nFill(c, null);
  const hs = o.hair || 'short';
  if (hs === 'perm') blobsPerm(c, cy, R, col, false);
  else if (hs === 'bald') { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * (R - 2), cy - 90); c.quadraticCurveTo(s * (R + 18), cy - 10, s * (R - 10), cy + 50); c.lineTo(s * (R - 50), cy + 20); c.quadraticCurveTo(s * (R - 40), cy - 50, s * (R - 60), cy - 90); c.closePath(); nFill(c, col, NOAH.W * .6); } }
  else if (!o.hat || o.hat === 'cap' || o.hat === 'border') {
    const top = hs === 'bun' ? cy - 270 : cy - 285, fringe = hs === 'side' ? 1 : 0;
    c.beginPath(); c.moveTo(-R + 6, cy - 10); c.bezierCurveTo(-R - 14, cy - 170, -170, top - 10, 0, top); c.bezierCurveTo(170, top - 10, R + 14, cy - 170, R - 6, cy - 10);
    if (fringe) { c.bezierCurveTo(R - 20, cy - 120, 120, cy - 170, -40, cy - 150); c.bezierCurveTo(-150, cy - 140, -R + 20, cy - 120, -R + 6, cy - 10); }
    else { c.bezierCurveTo(R - 22, cy - 130, 160, cy - 165, 0, cy - 160); c.bezierCurveTo(-160, cy - 165, -R + 22, cy - 130, -R + 6, cy - 10); }
    c.closePath(); nFill(c, col, NOAH.W * .8);
    c.save(); c.clip(); for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 50, cy - 160); c.quadraticCurveTo(i * 58, cy - 240, i * 70, top); c.lineWidth = 4; c.strokeStyle = shade(col, i % 2 ? .2 : -.25); c.stroke(); } c.restore();
    if (hs === 'bun') { circle(c, 0, cy - 300, 70); nFill(c, col, NOAH.W * .7); }
  }
  // face
  for (const s of [-1, 1]) {
    const ex = s * 92, ey = cy + 25;
    if (e.eyes === 'closed') { c.beginPath(); c.moveTo(ex - 24, ey - 4); c.quadraticCurveTo(ex, ey + 18, ex + 24, ey - 4); c.lineWidth = 9; c.strokeStyle = NOAH.eye; c.stroke(); }
    else { const lid = e.lid || 0; c.save(); c.beginPath(); c.rect(ex - 40, ey - 40 + lid * 70, 80, 90); c.clip(); c.beginPath(); c.ellipse(ex + (e.look || 0) * 6, ey, 22, 32, 0, 0, Math.PI * 2); c.fillStyle = NOAH.eye; c.fill(); c.restore(); }
  }
  const bu = (e.browUp || 0) * 18, frown = e.frown || 0;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 138, cy - 24 - bu - frown * 10); c.quadraticCurveTo(s * 95, cy - 44 - bu, s * 52, cy - 34 - bu + frown * 22); c.lineWidth = 13; c.strokeStyle = o.browCol || shade(col, .15); c.lineCap = 'round'; c.stroke(); }
  if (o.glasses) { for (const s of [-1, 1]) { rrect(c, s * 92 - 52, cy - 15, 104, 80, 22); c.lineWidth = 9; c.strokeStyle = o.glasses === true ? '#2a2420' : o.glasses; c.stroke(); } nLine(c, [-40, cy + 10, 40, cy + 10], 7, '#2a2420'); }
  if (o.beard) { c.beginPath(); c.moveTo(-200, cy + 60); c.quadraticCurveTo(-180, cy + 250, 0, cy + 262); c.quadraticCurveTo(180, cy + 250, 200, cy + 60); c.quadraticCurveTo(100, cy + 130, 0, cy + 120); c.quadraticCurveTo(-100, cy + 130, -200, cy + 60); nFill(c, col, NOAH.W * .6); }
  if (o.moustache || o.beard) { c.beginPath(); c.moveTo(-80, cy + 150); c.quadraticCurveTo(-60, cy + 100, 0, cy + 112); c.quadraticCurveTo(60, cy + 100, 80, cy + 150); c.quadraticCurveTo(0, cy + 125, -80, cy + 150); nFill(c, col, 6); }
  const my = cy + 160, m = e.mouth || 'soft';
  if (m === 'smile') { c.beginPath(); c.moveTo(-56, my - 6); c.quadraticCurveTo(0, my + 22, 58, my - 6); c.lineWidth = 9; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (m === 'flat') nLine(c, [-32, my + 2, 32, my + 2], 8, NOAH.out);
  else if (m === 'frown') { c.beginPath(); c.moveTo(-40, my + 10); c.quadraticCurveTo(0, my - 14, 40, my + 10); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (m === 'o' || m === 'shout') { const op = m === 'shout' ? (e.open ?? .9) : .4; c.beginPath(); c.ellipse(0, my + 6, 24 + 14 * op, 12 + 46 * op, 0, 0, Math.PI * 2); c.fillStyle = NOAH.mouthIn; c.fill(); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  else { c.beginPath(); c.moveTo(-28, my); c.quadraticCurveTo(0, my + 10, 28, my); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  folkHat(c, o, cy, R);
}
function folkHat(c, o, cy, R) {
  const col = o.hatCol || '#7a2a2a';
  if (o.hat === 'bobble') { c.beginPath(); c.moveTo(-R + 4, cy - 70); c.bezierCurveTo(-R, cy - 330, R, cy - 330, R - 4, cy - 70); c.closePath(); nFill(c, col); c.save(); c.clip(); for (let x = -R; x < R; x += 24) nLine(c, [x, cy - 330, x, cy - 70], 5, shade(col, -.25)); c.restore(); rrect(c, -R - 6, cy - 120, 2 * R + 12, 70, 20); nFill(c, shade(col, -.15)); circle(c, 0, cy - 330, 52); nFill(c, o.bobCol || '#ece4d2'); }
  else if (o.hat === 'cap') { c.beginPath(); c.moveTo(-R + 6, cy - 110); c.bezierCurveTo(-R, cy - 300, R, cy - 300, R - 6, cy - 110); c.closePath(); nFill(c, col); c.beginPath(); c.moveTo(-R + 30, cy - 110); c.quadraticCurveTo(0, cy - 60, R - 30, cy - 110); c.lineTo(R - 10, cy - 125); c.quadraticCurveTo(0, cy - 105, -R + 10, cy - 125); c.closePath(); nFill(c, shade(col, -.2)); }
  else if (o.hat === 'fur') { c.beginPath(); c.rect(-R - 8, cy - 330, 2 * R + 16, 230); nFill(c, col); c.save(); c.clip(); for (let i = 0; i < 40; i++) { circle(c, -R + rnd(i) * 2 * R, cy - 330 + rnd(i + 5) * 230, 14); c.fillStyle = shade(col, rnd(i + 9) > .5 ? .15 : -.15); c.fill(); } c.restore(); }
  else if (o.hat === 'border') { // border guard cap: grey-green crown, dark band, black peak
    c.beginPath(); c.moveTo(-R + 10, cy - 130); c.lineTo(-R - 30, cy - 270); c.quadraticCurveTo(0, cy - 330, R + 30, cy - 270); c.lineTo(R - 10, cy - 130); c.closePath(); nFill(c, col);
    rrect(c, -R + 6, cy - 170, 2 * R - 12, 55, 10); nFill(c, '#3a3d30'); circle(c, 0, cy - 220, 22); nFill(c, '#c9b56a', 5);
    c.beginPath(); c.moveTo(-R + 30, cy - 118); c.quadraticCurveTo(0, cy - 60, R - 30, cy - 118); c.lineTo(R - 40, cy - 128); c.quadraticCurveTo(0, cy - 95, -R + 40, cy - 128); c.closePath(); nFill(c, '#1e1c1a');
  }
  else if (o.hat === 'scarf') { c.beginPath(); c.moveTo(-R - 10, cy + 40); c.bezierCurveTo(-R - 30, cy - 330, R + 30, cy - 330, R + 10, cy + 40); c.quadraticCurveTo(R - 30, cy - 160, 0, cy - 170); c.quadraticCurveTo(-R + 30, cy - 160, -R - 10, cy + 40); nFill(c, col); c.save(); c.clip(); for (let i = 0; i < 12; i++) { circle(c, -R + rnd(i + 3) * 2 * R, cy - 300 + rnd(i + 8) * 300, 12); c.fillStyle = o.hatDot || 'rgba(255,255,255,.6)'; c.fill(); } c.restore(); }
}
function folkTorsoPath(c, len) { c.beginPath(); c.moveTo(-58, -955); c.lineTo(-160, -944); c.quadraticCurveTo(-158, -820, -146, -740); c.lineTo(-150 - (len > 0 ? 18 : 0), NOAH.HEM - len); c.lineTo(152 + (len > 0 ? 18 : 0), NOAH.HEM - len); c.lineTo(148, -740); c.quadraticCurveTo(160, -820, 162, -944); c.lineTo(58, -955); c.quadraticCurveTo(0, -915, -58, -955); c.closePath(); }
function folkBody(c, o) {
  const type = o.type || 'coat', col = o.coat || '#6a5a4a', len = o.coatLen === 'long' ? 330 : type === 'jacket' || type === 'track' || type === 'cardigan' || type === 'suit' ? 0 : 90;
  // legs
  const pants = o.pyjama ? '#8fa6c8' : (o.pants || '#3e3a40');
  for (const s of [-1, 1]) {
    if (o.skirt) { nLine(c, [s * 60, NOAH.HEM, s * 62, -90], 70 + NOAH.W * 2, NOAH.out); nLine(c, [s * 60, NOAH.HEM, s * 62, -90], 70, o.tights || '#8a7a70'); }
    else { c.beginPath(); c.moveTo(s * 4, NOAH.HEM - 10); c.lineTo(s * 116, NOAH.HEM - 10); c.lineTo(s * 108, -95); c.lineTo(s * 14, -95); c.closePath(); nFill(c, pants); if (o.pyjama) { c.save(); c.clip(); for (let x = -120; x < 120; x += 26) nLine(c, [x, -600, x, -90], 6, '#e8eef8'); c.restore(); } if (type === 'track') nLine(c, [s * 104, NOAH.HEM, s * 100, -100], 10, '#e8e4dc'); }
    if (o.slippers) { c.beginPath(); c.ellipse(s * 95, -30, 92, 34, 0, 0, Math.PI * 2); nFill(c, o.slippers === true ? '#8a3a3a' : o.slippers); c.beginPath(); c.ellipse(s * 95, -50, 60, 24, 0, Math.PI, 0); nFill(c, shade(o.slippers === true ? '#8a3a3a' : o.slippers, -.2)); }
    else { c.beginPath(); c.moveTo(s * 20, -98); c.lineTo(s * 108, -98); c.quadraticCurveTo(s * 190, -66, s * 196, -16); c.quadraticCurveTo(s * 190, 4, s * 140, 2); c.lineTo(s * 30, 2); c.quadraticCurveTo(s * 10, -40, s * 20, -98); nFill(c, o.shoes || '#2e2622'); }
  }
  if (o.skirt) { c.beginPath(); c.moveTo(-130, NOAH.HEM - 20); c.lineTo(130, NOAH.HEM - 20); c.lineTo(160, -300); c.lineTo(-160, -300); c.closePath(); nFill(c, o.skirt); }
  // under-layer at the neck / opening
  folkTorsoPath(c, len); c.fillStyle = col; c.fill();
  c.save(); folkTorsoPath(c, len); c.clip();
  c.fillStyle = 'rgba(20,15,10,.18)'; c.fillRect(80, -1000, 120, 1000);
  if (type === 'coat' || type === 'parka' || type === 'uniform' || type === 'suit') {
    c.fillStyle = o.under || (o.pyjama ? '#8fa6c8' : '#d8d0c0'); c.beginPath(); c.moveTo(-50, -955); c.lineTo(50, -955); c.lineTo(0, -820); c.closePath(); c.fill();
    if (o.tie) { c.beginPath(); c.moveTo(-14, -930); c.lineTo(14, -930); c.lineTo(20, -760); c.lineTo(0, -730); c.lineTo(-20, -760); c.closePath(); nFill(c, o.tie, 4); }
    nLine(c, [0, -820, 0, NOAH.HEM - len], 4, shade(col, -.35));
    for (let i = 0; i < 4; i++) { circle(c, 18, -790 + i * 90, 10); nFill(c, shade(col, -.4), 3); }
    // lapels
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 50, -955); c.lineTo(s * 4, -820); c.lineTo(s * 70, -860); c.lineTo(s * 110, -950); c.closePath(); nFill(c, shade(col, -.12), 4); }
    if (type === 'uniform') { nLine(c, [-160, -600, 160, -600], 30, '#3a3226'); c.beginPath(); c.rect(-30, -615, 60, 32); nFill(c, '#b9a35a', 4); for (const s of [-1, 1]) { c.beginPath(); c.rect(s * 95 - 40, -760, 80, 60); nFill(c, shade(col, -.1), 4); } }
    for (const s of [-1, 1]) { c.beginPath(); c.rect(s * 95 - 38, -560, 76, 10); c.fillStyle = shade(col, -.35); c.fill(); }
  } else if (type === 'cardigan') {
    c.fillStyle = o.under || '#e4dccb'; c.fillRect(-40, -960, 80, 500); for (let i = 0; i < 5; i++) { circle(c, -48, -900 + i * 80, 9); nFill(c, '#e8dcc0', 3); }
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 3; for (let y = -940; y < -500; y += 14) { c.beginPath(); c.moveTo(-170, y); c.lineTo(170, y); c.stroke(); }
  } else if (type === 'track') { nLine(c, [0, -950, 0, NOAH.HEM], 5, '#cfc8bc'); for (const s of [-1, 1]) nLine(c, [s * 150, -940, s * 136, NOAH.HEM], 12, '#e8e4dc'); }
  else if (type === 'apron') { c.fillStyle = o.apron || '#c9d3dc'; c.beginPath(); c.moveTo(-110, -880); c.lineTo(110, -880); c.lineTo(130, NOAH.HEM - len); c.lineTo(-130, NOAH.HEM - len); c.closePath(); c.fill(); for (let i = 0; i < 30; i++) { circle(c, -110 + rnd(i) * 220, -860 + rnd(i + 3) * 380, 8); c.fillStyle = 'rgba(200,60,80,.45)'; c.fill(); } }
  else if (type === 'jacket') { nLine(c, [0, -950, 0, NOAH.HEM], 5, shade(col, -.35)); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 40, -955); c.lineTo(s * 130, -950); c.lineTo(s * 120, -850); c.closePath(); nFill(c, shade(col, -.15), 4); } c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-150, -760, 300, 10); }
  c.restore(); folkTorsoPath(c, len); nFill(c, null);
  if (o.collar) { c.beginPath(); c.moveTo(-90, -1000); c.quadraticCurveTo(0, -960, 90, -1000); c.lineTo(100, -940); c.quadraticCurveTo(0, -910, -100, -940); c.closePath(); nFill(c, o.collar, NOAH.W * .7); }
}
function folkArm(c, side, spec, col, hold) {
  const S = NOAH.SHOULDER, sx = side * (S.x + 6), sy = S.y;
  const a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  const sw = NOAH.ARM_W + 22;
  c.save(); c.translate(wx, wy); noahHandLocal(c, -side * a2 + (spec.hand || 0)); if (hold) { c.rotate(-side * a2 + (spec.hand || 0)); c.translate(0, 70); hold(c); } c.restore();
  const cx = ex + (wx - ex) * .86, cy = ey + (wy - ey) * .86;
  const slv = (w, cl) => { circle(c, sx, sy, w / 2); c.fillStyle = cl; c.fill(); c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(cx, cy); c.lineWidth = w; c.strokeStyle = cl; c.lineCap = 'butt'; c.lineJoin = 'round'; c.stroke(); c.lineCap = 'round'; };
  slv(sw + NOAH.W * 2, NOAH.out); slv(sw, col);
}
function netBag(c) {
  // DDR string shopping bag with bread and a bottle
  nLine(c, [-20, 0, -40, 60], 5, '#3a3a3a'); nLine(c, [20, 0, 40, 60], 5, '#3a3a3a');
  c.beginPath(); c.ellipse(0, 140, 70, 90, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(0,0,0,.04)'; c.fill();
  c.beginPath(); c.ellipse(-12, 150, 30, 60, .3, 0, Math.PI * 2); nFill(c, '#c99a5a', 5); c.beginPath(); c.rect(18, 90, 28, 110); nFill(c, '#5a7a4a', 5);
  c.save(); c.beginPath(); c.ellipse(0, 140, 72, 92, 0, 0, Math.PI * 2); c.clip(); c.strokeStyle = '#3a3a3a'; c.lineWidth = 3; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * 22 - 60, 40); c.lineTo(i * 22 + 60, 240); c.moveTo(i * 22 + 60, 40); c.lineTo(i * 22 - 60, 240); c.stroke(); } c.restore();
}
function drawFolk(c, o = {}) {
  const W0 = NOAH.W; NOAH.W = W0 * (o.ink ?? 1.8);
  try {
    const k = (o.k ?? .25) * (o.h ?? 1), arms = Object.assign({ l: { a: .12, b: -.06 }, r: { a: .12, b: -.06 } }, o.arms || {}), col = o.coat || '#6a5a4a';
    c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k);
    c.save(); c.translate(0, o.bob || 0);
    folkBody(c, o);
    c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill();
    const up = arms.l.a > 1.6 || arms.r.a > 1.6;
    const da = () => { folkArm(c, -1, arms.l, col, o.bag === 'net' ? netBag : o.holdL); folkArm(c, 1, arms.r, col, o.holdR); };
    if (!up) da();
    c.save(); c.translate(0, -980); c.rotate(o.tilt || 0); c.translate(0, 980); folkHead(c, o); c.restore();
    if (up) da();
    c.restore(); c.restore();
  } finally { NOAH.W = W0; }
}
// ---- side view ----
function folkSideHead(c, o) {
  const cx = -10, cy = -1240, R = 255, col = o.hairCol || FOLK_HAIR[0], e = o.expr || {}, hs = o.hair || 'short';
  if (hs === 'long' || hs === 'mullet') { c.beginPath(); c.moveTo(-40, -1300); c.lineTo(-250, -1250); c.lineTo(-240, hs === 'long' ? -900 : -960); c.lineTo(-90, hs === 'long' ? -900 : -960); c.closePath(); nFill(c, col, NOAH.W * .7); }
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fillStyle = NOAH.shade; c.fill(); c.clip(); c.beginPath(); c.arc(cx - 4, cy - 34, R - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.restore();
  c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); nFill(c, null);
  if (hs === 'perm') { const pts = [[-200, -1380, 100], [-60, -1460, 105], [80, -1450, 90], [-250, -1230, 90], [-210, -1090, 80]]; for (const [x, y, r] of pts) { circle(c, x, y, r + NOAH.W * .7); c.fillStyle = NOAH.out; c.fill(); } for (const [x, y, r] of pts) { circle(c, x, y, r); c.fillStyle = col; c.fill(); } }
  else if (hs === 'bald') { c.beginPath(); c.moveTo(-250, -1290); c.quadraticCurveTo(-270, -1150, -200, -1060); c.lineTo(-100, -1120); c.quadraticCurveTo(-160, -1200, -150, -1290); c.closePath(); nFill(c, col, NOAH.W * .6); }
  else if (!o.hat || o.hat === 'cap' || o.hat === 'border') { c.beginPath(); c.moveTo(150, -1400); c.bezierCurveTo(100, -1530, -180, -1520, -250, -1380); c.bezierCurveTo(-285, -1260, -260, -1120, -220, -1060); c.lineTo(-120, -1110); c.bezierCurveTo(-90, -1200, -40, -1300, 40, -1340); c.quadraticCurveTo(100, -1370, 150, -1400); c.closePath(); nFill(c, col, NOAH.W * .8); if (hs === 'bun') { circle(c, -230, -1350, 70); nFill(c, col, NOAH.W * .7); } }
  for (const [ex, sc] of [[122, .95], [214, .78]]) { const ey = -1212; if (e.eyes === 'closed') { c.beginPath(); c.moveTo(ex - 20, ey - 4); c.quadraticCurveTo(ex, ey + 16, ex + 20, ey - 4); c.lineWidth = 9; c.strokeStyle = NOAH.eye; c.stroke(); } else { c.beginPath(); c.ellipse(ex + (e.look || 0) * 5, ey, 20 * sc, 30, 0, 0, Math.PI * 2); c.fillStyle = NOAH.eye; c.fill(); } }
  const bu = (e.browUp || 0) * 16; c.beginPath(); c.moveTo(88, -1272 - bu); c.quadraticCurveTo(122, -1290 - bu, 155, -1276 - bu); c.lineWidth = 13; c.strokeStyle = shade(col, .15); c.stroke();
  if (o.glasses) { rrect(c, 70, -1250, 105, 78, 20); c.lineWidth = 9; c.strokeStyle = '#2a2420'; c.stroke(); nLine(c, [70, -1220, -40, -1230], 7, '#2a2420'); }
  if (o.moustache || o.beard) { c.beginPath(); c.moveTo(110, -1120); c.quadraticCurveTo(160, -1145, 215, -1120); c.quadraticCurveTo(160, -1110, 110, -1120); nFill(c, col, 6); }
  if (o.beard) { c.beginPath(); c.moveTo(-60, -1100); c.quadraticCurveTo(0, -980, 150, -1000); c.quadraticCurveTo(220, -1030, 220, -1090); c.quadraticCurveTo(120, -1060, 40, -1100); c.closePath(); nFill(c, col, NOAH.W * .6); }
  const m = e.mouth || 'soft';
  if (m === 'smile') { c.beginPath(); c.moveTo(100, -1098); c.quadraticCurveTo(145, -1080, 185, -1100); c.lineWidth = 9; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (m === 'o' || m === 'shout') { const op = m === 'shout' ? (e.open ?? .9) : .4; c.beginPath(); c.ellipse(150, -1090, 16 + 8 * op, 10 + 36 * op, 0, 0, Math.PI * 2); c.fillStyle = NOAH.mouthIn; c.fill(); c.lineWidth = 7; c.strokeStyle = NOAH.out; c.stroke(); }
  else nLine(c, [112, -1094, 165, -1094], 8, NOAH.out);
  // hats (side)
  const hc = o.hatCol || '#7a2a2a';
  if (o.hat === 'bobble') { c.beginPath(); c.moveTo(-262, -1260); c.bezierCurveTo(-260, -1560, 200, -1560, 230, -1300); c.closePath(); nFill(c, hc); c.beginPath(); c.moveTo(-270, -1300); c.lineTo(235, -1330); c.lineTo(245, -1270); c.lineTo(-268, -1240); c.closePath(); nFill(c, shade(hc, -.15)); circle(c, -40, -1530, 50); nFill(c, o.bobCol || '#ece4d2'); }
  else if (o.hat === 'cap') { c.beginPath(); c.moveTo(-250, -1300); c.bezierCurveTo(-240, -1520, 180, -1520, 210, -1340); c.lineTo(330, -1320); c.lineTo(300, -1290); c.lineTo(-250, -1270); c.closePath(); nFill(c, hc); }
  else if (o.hat === 'fur') { c.beginPath(); c.rect(-270, -1560, 500, 240); nFill(c, hc); }
  else if (o.hat === 'border') { c.beginPath(); c.moveTo(-230, -1350); c.lineTo(-280, -1500); c.quadraticCurveTo(0, -1560, 250, -1500); c.lineTo(200, -1350); c.closePath(); nFill(c, hc); c.beginPath(); c.rect(-232, -1400, 434, 56); nFill(c, '#3a3d30'); c.beginPath(); c.moveTo(190, -1350); c.quadraticCurveTo(300, -1350, 340, -1310); c.lineTo(190, -1320); c.closePath(); nFill(c, '#1e1c1a'); }
  else if (o.hat === 'scarf') { c.beginPath(); c.moveTo(60, -1440); c.bezierCurveTo(-40, -1530, -230, -1490, -265, -1330); c.bezierCurveTo(-290, -1180, -240, -1040, -150, -990); c.lineTo(-60, -1010); c.bezierCurveTo(-110, -1100, -60, -1300, 60, -1440); c.closePath(); nFill(c, hc); c.beginPath(); c.moveTo(-150, -990); c.lineTo(-210, -930); c.lineTo(-120, -950); c.closePath(); nFill(c, hc); }
}
function drawFolkSide(c, o = {}) {
  const W0 = NOAH.W; NOAH.W = W0 * (o.ink ?? 1.8);
  try {
    const k = (o.k ?? .25) * (o.h ?? 1), col = o.coat || '#6a5a4a', ph = o.walk, walking = ph != null, run = o.run ? 1.6 : 1;
    const sw = walking ? Math.sin(ph) : 0, lift = walking ? Math.max(0, Math.cos(ph)) : 0, lift2 = walking ? Math.max(0, -Math.cos(ph)) : 0;
    const bob = (walking ? -Math.abs(Math.cos(ph)) * 12 * run : 0) + (o.bob || 0), len = o.coatLen === 'long' ? 330 : (o.type === 'jacket' || o.type === 'track' || o.type === 'cardigan' || o.type === 'suit') ? 0 : 90;
    const pants = o.pyjama ? '#8fa6c8' : (o.pants || '#3e3a40'), shoe = o.slippers ? (o.slippers === true ? '#8a3a3a' : o.slippers) : (o.shoes || '#2e2622');
    c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k); if (o.lean) c.rotate(o.lean);
    c.save(); c.translate(0, bob);
    const leg = (th, bend, far) => {
      const [hx, hy] = NOAH_SIDE.HIP, kx = hx + Math.sin(th) * 215, ky = hy + Math.cos(th) * 215, t2 = th - bend, ax = kx + Math.sin(t2) * 215, ay = ky + Math.cos(t2) * 215;
      const lc = o.skirt ? (o.tights || '#8a7a70') : pants;
      nLine(c, [hx, hy, kx, ky, ax, ay], (o.skirt ? 80 : 118) + NOAH.W * 2, NOAH.out); nLine(c, [hx, hy, kx, ky, ax, ay], o.skirt ? 80 : 118, far ? shade(lc, -.2) : lc);
      if (o.pyjama) nLine(c, [hx + 20, hy, kx + 20, ky, ax + 20, ay], 6, '#e8eef8');
      c.save(); c.translate(ax, ay - 10); c.rotate(Math.max(-.35, Math.min(.35, t2 * .5)));
      c.beginPath(); c.moveTo(-58, -4); c.lineTo(-60, 72); c.lineTo(o.slippers ? 140 : 122, 74); c.quadraticCurveTo(150, 62, 134, 34); c.quadraticCurveTo(95, 6, 36, -6); c.closePath(); nFill(c, far ? shade(shoe, -.2) : shoe, NOAH.W * .9);
      c.restore();
    };
    const arm = (th, bend, far, hold) => {
      const [sx, sy] = NOAH_SIDE.SHOULDER, ex = sx + Math.sin(th) * NOAH.UPPER, ey = sy + Math.cos(th) * NOAH.UPPER, t2 = th + bend, wx = ex + Math.sin(t2) * NOAH.FORE, wy = ey + Math.cos(t2) * NOAH.FORE;
      c.save(); c.translate(wx, wy); c.scale(.92, 1); noahHandLocal(c, -t2); if (hold) { c.rotate(-t2); c.translate(0, 70); hold(c); } c.restore();
      const cx = ex + (wx - ex) * .86, cy = ey + (wy - ey) * .86, sw = NOAH.ARM_W + 22, cl = far ? shade(col, -.18) : col;
      const slv = (w, cc) => { circle(c, sx, sy, w / 2); c.fillStyle = cc; c.fill(); c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(cx, cy); c.lineWidth = w; c.strokeStyle = cc; c.lineCap = 'butt'; c.lineJoin = 'round'; c.stroke(); c.lineCap = 'round'; };
      slv(sw + NOAH.W * 2, NOAH.out); slv(sw, cl);
    };
    const aSw = (o.armSwing ?? .38) * run, armsUp = o.armsUp;
    if (!armsUp) arm(walking ? aSw * sw : .05, walking ? .12 + (o.run ? .9 : 0) : (o.farBend ?? -.05), true);
    leg(walking ? -.42 * sw * run : -.03, walking ? .7 * lift2 * run : 0, true);
    leg(walking ? .42 * sw * run : .03, walking ? .7 * lift * run : 0, false);
    if (o.skirt) { c.beginPath(); c.moveTo(-110, -540); c.lineTo(100, -540); c.lineTo(140, -300); c.lineTo(-130, -300); c.closePath(); nFill(c, o.skirt); }
    const body = () => { c.beginPath(); c.moveTo(-70, -975); c.quadraticCurveTo(-124, -965, -128, -930); c.lineTo(-132 - (len > 100 ? 20 : 0), NOAH.HEM - len); c.quadraticCurveTo(-10, NOAH.HEM - len + 10, 126 + (len > 100 ? 20 : 0), NOAH.HEM - len); c.lineTo(118, -930); c.quadraticCurveTo(100, -968, 50, -975); c.quadraticCurveTo(-10, -955, -70, -975); c.closePath(); };
    body(); c.fillStyle = col; c.fill(); c.save(); body(); c.clip(); c.fillStyle = 'rgba(20,15,10,.18)'; c.fillRect(-140, -1000, 60, 1000);
    if (o.type === 'apron') { c.fillStyle = o.apron || '#c9d3dc'; c.fillRect(40, -880, 100, 600); }
    if (o.type === 'uniform') { c.fillStyle = '#3a3226'; c.fillRect(-150, -615, 300, 30); }
    if (o.type === 'track') nLine(c, [-20, -950, -40, NOAH.HEM], 12, '#e8e4dc');
    c.restore(); body(); nFill(c, null);
    c.beginPath(); c.rect(-28, -1000, 72, 50); c.fillStyle = NOAH.skin; c.fill();
    if (o.collar) { c.beginPath(); c.moveTo(-80, -1010); c.quadraticCurveTo(20, -985, 90, -1000); c.lineTo(96, -950); c.quadraticCurveTo(10, -930, -84, -955); c.closePath(); nFill(c, o.collar, NOAH.W * .8); }
    c.save(); c.translate(0, -980); c.rotate(o.tilt || 0); c.translate(0, 980); folkSideHead(c, o); c.restore();
    if (armsUp) { arm(2.6 + Math.sin((o.t || 0) * 8) * .15, -.2, true); arm(2.4 + Math.sin((o.t || 0) * 8 + 1) * .15, -.3, false); }
    else arm(walking ? -aSw * sw : (o.nearA ?? .02), walking ? .12 + (o.run ? .9 : 0) : (o.nearBend ?? -.05), false, o.bag === 'net' ? netBag : o.hold);
    c.restore(); c.restore();
  } finally { NOAH.W = W0; }
}
