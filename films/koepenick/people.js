// Supporting cast in the same ink language as Noah, but clearly different: peach/tan skin, small round nose,
// own hair/moustache shapes and period clothes. Units like Noah (feet at 0, up negative), draw at k ≈ .5.
const SKIN = { peach: '#f6d3b6', tan: '#e2b08a', rose: '#f2c2a8', olive: '#d9b48c', light: '#f9e1cc' };
function pFill(c, f, w = 12) { if (f) { c.fillStyle = f; c.fill(); } if (w) { c.lineWidth = w; c.strokeStyle = OUT; c.lineJoin = 'round'; c.stroke(); } }
function pLine(c, pts, w, col) { ln(c, pts, w + 24, OUT); ln(c, pts, w, col); }
function pickelhaube(c, cy, R) {
  c.beginPath(); c.moveTo(-R * .95, cy - R * .35); c.bezierCurveTo(-R * 1.05, cy - R * 1.25, R * 1.05, cy - R * 1.25, R * .95, cy - R * .35); c.closePath(); pFill(c, lg(c, -R, 0, R, 0, [[0, '#0c0b0b'], [.4, '#2a2624'], [1, '#0c0b0b']]));
  c.beginPath(); c.moveTo(-R * 1.08, cy - R * .32); c.quadraticCurveTo(0, cy - R * .52, R * 1.08, cy - R * .32); c.lineTo(R * .9, cy - R * .18); c.quadraticCurveTo(0, cy - R * .36, -R * .9, cy - R * .18); c.closePath(); pFill(c, '#151312', 10);
  P(c, [-R * .28, cy - R * .62, 0, cy - R * 1.02, R * .28, cy - R * .62, 0, cy - R * .42]); pFill(c, '#d8b45a', 8);
  P(c, [-22, cy - R * 1.08, 0, cy - R * 1.55, 22, cy - R * 1.08]); pFill(c, '#d8b45a', 8); el(c, 0, cy - R * 1.08, 40, 16); pFill(c, '#c49d45', 8);
  el(c, -R * .3, cy - R * .9, 30, 14, -.5); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
}
function hatLocal(c, kind, cy, R, col) {
  if (kind === 'pickel') return pickelhaube(c, cy, R);
  if (kind === 'flat') { c.beginPath(); c.moveTo(-R * 1.02, cy - R * .4); c.quadraticCurveTo(-R * .9, cy - R * 1.1, R * .2, cy - R * 1.02); c.quadraticCurveTo(R * 1.1, cy - R * .9, R * 1.05, cy - R * .4); c.closePath(); pFill(c, col || '#6b5b4a'); c.beginPath(); c.moveTo(-R * .2, cy - R * .42); c.quadraticCurveTo(R * .6, cy - R * .5, R * 1.25, cy - R * .25); c.quadraticCurveTo(R * .6, cy - R * .2, -R * .2, cy - R * .3); pFill(c, '#4a3e33', 9); return; }
  if (kind === 'top') { rr(c, -R * .62, cy - R * 1.75, R * 1.24, R * 1.2, 20); pFill(c, col || '#1b1a1d'); ln(c, [-R * .62, cy - R * .78, R * .62, cy - R * .78], 22, '#5a2a2a'); el(c, 0, cy - R * .58, R * 1.05, R * .14); pFill(c, col || '#1b1a1d'); return; }
  if (kind === 'bowler') { c.beginPath(); c.arc(0, cy - R * .62, R * .72, Math.PI, 0); pFill(c, col || '#2a2422'); el(c, 0, cy - R * .6, R * 1.05, R * .14); pFill(c, col || '#2a2422'); return; }
  if (kind === 'guard') { rr(c, -R * .85, cy - R * 1.15, R * 1.7, R * .7, 18); pFill(c, col || '#2d3a2e'); ln(c, [-R * .85, cy - R * .62, R * .85, cy - R * .62], 18, '#c9a04a'); c.beginPath(); c.moveTo(-R * .8, cy - R * .48); c.quadraticCurveTo(0, cy - R * .2, R * .8, cy - R * .48); c.lineWidth = 26; c.strokeStyle = '#111'; c.stroke(); return; }
  if (kind === 'sun') { el(c, 0, cy - R * .78, R * 1.3, R * .22); pFill(c, col || '#e9d9a6'); c.beginPath(); c.arc(0, cy - R * .78, R * .62, Math.PI, 0); pFill(c, col || '#e9d9a6'); ln(c, [-R * .6, cy - R * .86, R * .6, cy - R * .86], 18, '#c0553e'); return; }
  if (kind === 'beanie') { c.beginPath(); c.arc(0, cy - R * .35, R * .98, Math.PI * 1.05, -Math.PI * .05); pFill(c, col || '#3d7f8c'); rr(c, -R, cy - R * .5, R * 2, R * .3, 12); pFill(c, col || '#3d7f8c'); }
}
function hairLocal(c, kind, cy, R, col) {
  if (!kind || kind === 'none') return;
  if (kind === 'bald') { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * .98, cy - R * .25); c.quadraticCurveTo(s * R * 1.12, cy + R * .1, s * R * .9, cy + R * .3); c.quadraticCurveTo(s * R * .8, cy, s * R * .78, cy - R * .4); c.closePath(); pFill(c, col, 9); } el(c, -R * .35, cy - R * .62, R * .3, R * .14, -.4); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill(); return; }
  if (kind === 'short') { c.beginPath(); c.moveTo(-R * .98, cy - R * .1); c.bezierCurveTo(-R * 1.1, cy - R * 1.2, R * 1.1, cy - R * 1.2, R * .98, cy - R * .1); c.quadraticCurveTo(R * .7, cy - R * .62, 0, cy - R * .6); c.quadraticCurveTo(-R * .7, cy - R * .62, -R * .98, cy - R * .1); pFill(c, col, 10); return; }
  if (kind === 'parted') { c.beginPath(); c.moveTo(-R * .98, cy); c.bezierCurveTo(-R * 1.1, cy - R * 1.2, R * 1.1, cy - R * 1.2, R * .98, cy); c.quadraticCurveTo(R * .5, cy - R * .7, -R * .25, cy - R * .62); c.quadraticCurveTo(-R * .7, cy - R * .5, -R * .98, cy); pFill(c, col, 10); ln(c, [-R * .25, cy - R * .62, -R * .2, cy - R * 1], 6, 'rgba(0,0,0,.4)'); return; }
  if (kind === 'curly') { for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI; c.beginPath(); c.arc(Math.cos(a) * R * .9, cy + Math.sin(a) * R * .9, R * .28, 0, TAU); pFill(c, col, 8); } return; }
  if (kind === 'bun') { c.beginPath(); c.arc(0, cy - R * 1.1, R * .32, 0, TAU); pFill(c, col, 9); hairLocal(c, 'parted', cy, R, col); return; }
  if (kind === 'long') { c.beginPath(); c.moveTo(-R * 1.02, cy + R * .9); c.bezierCurveTo(-R * 1.3, cy - R * 1.3, R * 1.3, cy - R * 1.3, R * 1.02, cy + R * .9); c.lineTo(R * .7, cy + R * .2); c.quadraticCurveTo(R * .6, cy - R * .6, 0, cy - R * .62); c.quadraticCurveTo(-R * .6, cy - R * .6, -R * .7, cy + R * .2); c.closePath(); pFill(c, col, 10); }
}
function mstLocal(c, kind, cy, R, col) {
  const my = cy + R * .46;
  if (kind === 'walrus') { c.beginPath(); c.moveTo(-R * .62, my + R * .2); c.quadraticCurveTo(-R * .5, my - R * .22, 0, my - R * .14); c.quadraticCurveTo(R * .5, my - R * .22, R * .62, my + R * .2); c.quadraticCurveTo(R * .3, my + R * .02, 0, my + R * .06); c.quadraticCurveTo(-R * .3, my + R * .02, -R * .62, my + R * .2); pFill(c, col, 8); }
  if (kind === 'thin') { c.beginPath(); c.moveTo(-R * .4, my - R * .02); c.quadraticCurveTo(0, my - R * .18, R * .4, my - R * .02); c.quadraticCurveTo(0, my - R * .06, -R * .4, my - R * .02); pFill(c, col, 6); }
  if (kind === 'brush') { rr(c, -R * .3, my - R * .16, R * .6, R * .16, 10); pFill(c, col, 7); }
  if (kind === 'mutton') { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * .95, cy - R * .1); c.quadraticCurveTo(s * R * 1.0, cy + R * .6, s * R * .4, my + R * .1); c.quadraticCurveTo(s * R * .55, cy + R * .3, s * R * .78, cy - R * .2); pFill(c, col, 8); } mstLocal(c, 'walrus', cy, R, col); }
}
// head-local (cy = head centre)
function personHead(c, o, cy, R, side) {
  const e = o.expr || {}, skin = o.skin || SKIN.peach;
  if (o.hair === 'long' || o.hair === 'bun') hairLocal(c, o.hair, cy, R, o.hairCol || '#5a3b28');
  c.save(); c.beginPath(); c.arc(0, cy, R, 0, TAU); c.fillStyle = shadeHex(skin, -.08); c.fill(); c.clip(); c.beginPath(); c.arc(-6, cy - 26, R - 6, 0, TAU); c.fillStyle = skin; c.fill(); c.restore();
  c.beginPath(); c.arc(0, cy, R, 0, TAU); pFill(c, null, 12);
  if (o.hair !== 'long' && o.hair !== 'bun') hairLocal(c, o.hair, cy, R, o.hairCol || '#4a3426');
  if (o.hair === 'long' || o.hair === 'bun') { c.beginPath(); c.moveTo(-R * .9, cy - R * .3); c.quadraticCurveTo(0, cy - R * 1.05, R * .9, cy - R * .3); c.quadraticCurveTo(0, cy - R * .62, -R * .9, cy - R * .3); pFill(c, o.hairCol || '#5a3b28', 9); }
  const ox = side ? R * .38 : 0, sp = side ? .55 : 1, eyeY = cy + R * .05;
  // eyes
  for (const s of [-1, 1]) {
    const ex = ox + s * R * .34 * sp;
    if (e.eyes === 'closed' || e.eyes === 'laugh') { c.beginPath(); c.moveTo(ex - 20, eyeY + (e.eyes === 'laugh' ? 6 : 0)); c.quadraticCurveTo(ex, eyeY + (e.eyes === 'laugh' ? -18 : 16), ex + 20, eyeY + (e.eyes === 'laugh' ? 6 : 0)); c.lineWidth = 8; c.strokeStyle = OUT; c.lineCap = 'round'; c.stroke(); }
    else { const big = e.wide ? 1.35 : 1; el(c, ex + (e.look || 0) * 6, eyeY, 16 * big, 24 * big); c.fillStyle = OUT; c.fill(); if (e.wide) { el(c, ex, eyeY, 30, 38); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke(); } }
    const bu = (e.browUp || 0) * 22 - (e.frown || 0) * 10;
    c.beginPath(); c.moveTo(ex - 30, eyeY - 48 - bu + (e.frown ? s * 10 : 0)); c.quadraticCurveTo(ex, eyeY - 64 - bu, ex + 30, eyeY - 48 - bu - (e.frown ? s * 10 : 0)); c.lineWidth = 11; c.strokeStyle = o.browCol || shadeHex(o.hairCol || '#4a3426', -.1); c.stroke();
  }
  if (o.glasses) for (const s of [-1, 1]) { el(c, ox + s * R * .34 * sp, eyeY, 40, 36); c.lineWidth = 6; c.strokeStyle = '#3a3030'; c.stroke(); }
  // cheeks + nose (Noah has none: helps tell them apart)
  for (const s of [-1, 1]) { el(c, ox + s * R * .55 * sp, cy + R * .32, 30, 18); c.fillStyle = 'rgba(230,110,100,.28)'; c.fill(); }
  el(c, ox + (side ? R * .22 : 0), cy + R * .27, 26, 22); pFill(c, shadeHex(skin, -.06), 7);
  // mouth
  const my = cy + R * .58, m = e.mouth || 'smile', mx = ox;
  if (m === 'smile') { c.beginPath(); c.moveTo(mx - 40, my - 4); c.quadraticCurveTo(mx, my + 18, mx + 40, my - 4); c.lineWidth = 8; c.strokeStyle = OUT; c.stroke(); }
  else if (m === 'flat') ln(c, [mx - 26, my, mx + 26, my], 8, OUT);
  else if (m === 'o' || m === 'drop') { const d = m === 'drop' ? (e.open ?? 1) : .5; el(c, mx, my + 10 + d * 20, 22 + d * 6, 14 + d * 50); pFill(c, '#5a2026', 7); }
  else if (m === 'laugh') { const o2 = e.open ?? 1; c.beginPath(); c.moveTo(mx - 52, my - 8); c.quadraticCurveTo(mx, my + 30 + 40 * o2, mx + 52, my - 8); c.closePath(); pFill(c, '#5a2026', 7); c.save(); c.clip(); el(c, mx, my + 30 + 30 * o2, 30, 22); c.fillStyle = '#c9585e'; c.fill(); c.restore(); }
  if (o.mst) mstLocal(c, o.mst, cy, R, o.mstCol || o.hairCol || '#4a3426');
  if (o.hat) hatLocal(c, o.hat, cy, R, o.hatCol);
}
// limb with sleeve
function pArm(c, sx, sy, a, b, side, sleeve, skin, o = {}) {
  const U = 205, F = 195, ex = sx + side * Math.sin(a) * U, ey = sy + Math.cos(a) * U, a2 = a + b, wx = ex + side * Math.sin(a2) * F, wy = ey + Math.cos(a2) * F;
  const k = o.cuff ?? .86, cx = ex + (wx - ex) * k, cy = ey + (wy - ey) * k;
  pLine(c, [sx, sy, ex, ey, wx, wy], 60, skin); pLine(c, [sx, sy, ex, ey, cx, cy], 92, sleeve);
  if (o.cuffCol) ln(c, [ex + (cx - ex) * .82, ey + (cy - ey) * .82, cx, cy], 92, o.cuffCol);
  c.save(); c.translate(wx, wy); c.rotate(-side * a2); el(c, 0, 34, 36, 44); pFill(c, skin, 10); c.restore();
  return { wx, wy };
}
// FRONT VIEW person. o: { x, y, k, skin, hair, hairCol, hat, mst, coat, coat2, pants, shoe, belly, kid, arms:{l,r}, expr, straps, pack, sash, apron, collar, tie, coatLong, tilt, bob, dress }
function drawPerson(c, o) {
  const k = o.k ?? .5, sc = o.kid ? .78 : 1, R = (o.kid ? 250 : 228), skin = o.skin || SKIN.peach, belly = o.belly || 0;
  const arms = Object.assign({ l: { a: .12, b: -.06 }, r: { a: .12, b: -.06 } }, o.arms || {});
  c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k); if (o.kid) c.scale(sc, sc);
  if (o.lean) c.rotate(o.lean);
  // legs + shoes
  if (!o.dress) for (const s of [-1, 1]) { const L = o.step != null ? Math.max(0, Math.sin(o.step + (s < 0 ? 0 : Math.PI))) * 80 : 0;
    P(c, [s * 10, -520, s * (112 + belly * 20), -520, s * 104, -90 - L, s * 18, -90 - L]); pFill(c, o.pants || '#3d3a3e');
    c.save(); c.translate(0, -L); c.beginPath(); c.moveTo(s * 14, -96); c.lineTo(s * 106, -96); c.quadraticCurveTo(s * 186, -64, s * 190, -14); c.quadraticCurveTo(s * 180, 4, s * 130, 2); c.lineTo(s * 24, 2); c.closePath(); pFill(c, o.shoe || '#221c1a'); c.restore(); }
  else { for (const s of [-1, 1]) { pLine(c, [s * 50, -300, s * 52, -90], 60, skin); c.beginPath(); c.moveTo(s * 20, -90); c.lineTo(s * 90, -90); c.quadraticCurveTo(s * 150, -50, s * 140, 2); c.lineTo(s * 20, 2); c.closePath(); pFill(c, o.shoe || '#5a2a2a'); } }
  c.save(); c.translate(0, (o.bob || 0) - (o.step != null ? Math.abs(Math.sin(o.step)) * 14 : 0));
  if (o.pack) { rr(c, -190, -950, 380, 360, 30); pFill(c, '#6a4a2e'); }
  // torso / coat
  const hem = o.dress ? -280 : o.coatLong ? -300 : -470, wB = 150 + belly * 90;
  c.beginPath(); c.moveTo(-64, -950); c.lineTo(-160, -940); c.quadraticCurveTo(-170 - belly * 40, -760, -wB, -620); c.quadraticCurveTo(-wB - belly * 30, -520, -(140 + belly * 60) - (o.dress ? 60 : 0), hem); c.lineTo((140 + belly * 60) + (o.dress ? 60 : 0), hem); c.quadraticCurveTo(wB + belly * 30, -520, wB, -620); c.quadraticCurveTo(170 + belly * 40, -760, 160, -940); c.lineTo(64, -950); c.closePath();
  pFill(c, lg(c, -wB, 0, wB, 0, [[0, shadeHex(o.coat || '#4a4a52', -.25)], [.5, o.coat || '#4a4a52'], [1, shadeHex(o.coat || '#4a4a52', -.3)]]));
  if (o.shirtV) { P(c, [-50, -948, 50, -948, 0, -800]); pFill(c, o.shirtV, 8); if (o.tie) { P(c, [-14, -930, 14, -930, 22, -820, 0, -790, -22, -820]); pFill(c, o.tie, 6); } }
  if (o.collar) { for (const s of [-1, 1]) { P(c, [s * 64, -952, s * 30, -900, s * 48, -896, s * 90, -948]); pFill(c, o.collar, 9); } }
  if (o.buttons) for (let i = 0; i < 5; i++) { el(c, 0, -860 + i * 80, 12, 12); pFill(c, o.buttons, 5); }
  if (o.straps) { ln(c, [-140, -930, 120, -560], 26, '#e8e2d4'); ln(c, [140, -930, -120, -560], 26, '#e8e2d4'); rr(c, -150, -590, 300, 34, 6); pFill(c, '#e8e2d4', 6); el(c, 0, -573, 26, 22); pFill(c, '#c9a64a', 5); }
  if (o.sash) { ln(c, [-150, -900, 150 + belly * 40, -560], 46, o.sash); ln(c, [-150, -900, 150 + belly * 40, -560], 10, '#f4e3a0'); }
  if (o.apron) { rr(c, -130, -720, 260, 420, 20); pFill(c, o.apron); }
  if (o.chain) { c.beginPath(); c.moveTo(-90, -640); c.quadraticCurveTo(0, -580, 90, -640); c.lineWidth = 7; c.strokeStyle = '#e6c860'; c.stroke(); }
  if (o.vest) { P(c, [-70, -940, 70, -940, 110, -560, -110, -560]); pFill(c, o.vest, 9); for (let i = 0; i < 4; i++) { el(c, 0, -860 + i * 80, 10, 10); pFill(c, '#e6c860', 4); } }
  if (o.camera) { rr(c, -70, -720, 140, 92, 16); pFill(c, '#2a2a30', 9); el(c, 10, -674, 34, 34); pFill(c, '#5a6a80', 7); ln(c, [-110, -930, -60, -720], 6, '#222'); ln(c, [110, -930, 60, -720], 6, '#222'); }
  // neck
  rr(c, -40, -1010, 80, 70, 10); pFill(c, skin, 0);
  const drawArms = () => {
    const L = pArm(c, -150, -905, arms.l.a, arms.l.b, -1, o.sleeve || o.coat || '#4a4a52', skin, { cuffCol: o.cuffCol }); const Rr = pArm(c, 150, -905, arms.r.a, arms.r.b, 1, o.sleeve || o.coat || '#4a4a52', skin, { cuffCol: o.cuffCol });
    if (o.hold) o.hold(c, L, Rr);
  };
  const up = arms.l.a > 1.6 || arms.r.a > 1.6;
  if (!up) drawArms();
  c.save(); c.translate(0, -1000); c.rotate(o.tilt || 0); c.translate(0, 1000);
  personHead(c, o, -1215 + (o.kid ? 40 : 0), R, false);
  c.restore();
  if (up) drawArms();
  if (o.epaulette) for (const s of [-1, 1]) { el(c, s * 150, -935, 56, 24); pFill(c, o.epaulette, 8); }
  c.restore(); c.restore();
}
// SIDE VIEW person (walking/standing), facing +x (s: -1 to face left)
function drawPersonSide(c, o) {
  const k = o.k ?? .5, R = o.kid ? 250 : 228, skin = o.skin || SKIN.peach, ph = o.walk, walking = ph !== null && ph !== undefined;
  const sw = walking ? Math.sin(ph) : 0, lift = walking ? Math.max(0, Math.cos(ph)) : 0, lift2 = walking ? Math.max(0, -Math.cos(ph)) : 0, bob = (walking ? -Math.abs(Math.cos(ph)) * 12 : 0) + (o.bob || 0);
  c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k); if (o.kid) c.scale(.78, .78);
  c.save(); c.translate(0, bob);
  const leg = (th, bend, far) => { const hx = 0, hy = -520, kx = hx + Math.sin(th) * 215, ky = hy + Math.cos(th) * 215, t2 = th - bend, ax = kx + Math.sin(t2) * 215, ay = ky + Math.cos(t2) * 215;
    const col = far ? shadeHex(o.pants || '#3d3a3e', -.2) : (o.pants || '#3d3a3e'); pLine(c, [hx, hy, kx, ky, ax, ay], 104, col);
    if (o.boots) pLine(c, [kx + (ax - kx) * .35, ky + (ay - ky) * .35, ax, ay], 108, '#191515');
    c.save(); c.translate(ax, ay - 10); c.rotate(clamp(t2 * .5, -.35, .35)); c.beginPath(); c.moveTo(-56, -4); c.lineTo(-58, 70); c.lineTo(120, 72); c.quadraticCurveTo(146, 60, 130, 32); c.quadraticCurveTo(92, 4, 34, -6); c.closePath(); pFill(c, far ? '#120e0e' : (o.shoe || '#221c1a'), 11); c.restore(); };
  const arm = (th, bend, far) => { const sx = -30, sy = -905, ex = sx + Math.sin(th) * 205, ey = sy + Math.cos(th) * 205, t2 = th + bend, wx = ex + Math.sin(t2) * 195, wy = ey + Math.cos(t2) * 195;
    const cx = ex + (wx - ex) * .86, cy = ey + (wy - ey) * .86; pLine(c, [sx, sy, ex, ey, wx, wy], 58, skin); pLine(c, [sx, sy, ex, ey, cx, cy], 90, far ? shadeHex(o.coat || '#4a4a52', -.25) : (o.coat || '#4a4a52'));
    if (o.cuffCol) ln(c, [ex + (cx - ex) * .8, ey + (cy - ey) * .8, cx, cy], 90, o.cuffCol);
    c.save(); c.translate(wx, wy); c.rotate(-t2); el(c, 6, 30, 34, 42); pFill(c, skin, 10); c.restore(); };
  const A = o.arms || {};
  arm(A.far ? A.far.th : (walking ? .3 * sw : .05), A.far ? A.far.bend : .1, true);
  leg(walking ? -.42 * sw : -.03, walking ? .7 * lift2 : 0, true);
  leg(walking ? .42 * sw : .03, walking ? .7 * lift : 0, false);
  if (o.pack) { rr(c, -230, -960, 150, 330, 24); pFill(c, '#6a4a2e'); rr(c, -250, -1010, 190, 60, 20); pFill(c, '#8a6a46', 10); ln(c, [-220, -900, -100, -900], 8, '#3a2a1a'); }
  const belly = o.belly || 0, hem = o.coatLong ? -300 : -460;
  c.beginPath(); c.moveTo(-70, -965); c.quadraticCurveTo(-118, -955, -122, -930); c.lineTo(-128, hem); c.lineTo(128 + belly * 120, hem); c.quadraticCurveTo(150 + belly * 160, -650, 112 + belly * 40, -880); c.quadraticCurveTo(90, -962, 46, -965); c.closePath();
  pFill(c, lg(c, -130, 0, 130, 0, [[0, shadeHex(o.coat || '#4a4a52', -.28)], [1, o.coat || '#4a4a52']]));
  if (o.collar) { P(c, [30, -968, 100, -950, 100, -900, 40, -905]); pFill(c, o.collar, 9); }
  if (o.buttons) for (let i = 0; i < 5; i++) { el(c, 104, -850 + i * 76, 11, 11); pFill(c, o.buttons, 5); }
  if (o.straps) { ln(c, [-110, -930, 110, -570], 24, '#e8e2d4'); rr(c, -128, -600, 258, 32, 6); pFill(c, '#e8e2d4', 6); }
  rr(c, -24, -1010, 70, 60, 8); pFill(c, skin, 0);
  c.save(); c.translate(0, -980); c.rotate(o.tilt || 0); c.translate(0, 980); personHead(c, o, -1215, R, true); c.restore();
  arm(A.near ? A.near.th : (walking ? -.3 * sw : .02), A.near ? A.near.bend : .1, false);
  if (o.epaulette) { el(c, -30, -935, 52, 22); pFill(c, o.epaulette, 8); }
  c.restore(); c.restore();
}
// presets
const SOLDIER = (i, extra = {}) => Object.assign({ skin: [SKIN.peach, SKIN.tan, SKIN.rose, SKIN.olive][i % 4], hair: 'short', hairCol: ['#6b4a2e', '#2e2420', '#b07a3a', '#4a3a30'][i % 4], hat: 'pickel', mst: ['brush', 'thin', null, 'walrus'][i % 4], mstCol: ['#6b4a2e', '#2e2420', '#b07a3a', '#4a3a30'][i % 4], coat: '#33528f', collar: '#b3302d', cuffCol: '#b3302d', buttons: '#e8d68a', pants: '#2a2d38', shoe: '#191515', boots: 1, pack: 1, straps: 1 }, extra);
