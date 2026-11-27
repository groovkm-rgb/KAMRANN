// ZOMBIES for NOAH BLACK, built on people.js geometry (pGeo, pLimb, pHand, hair*). Jet-black skin like everyone.
// They read as zombies through: milky glowing eyes without pupils, dark sockets, slack crooked open mouth,
// head dropped to one side, hunched back, one arm reaching forward and one hanging, torn / crooked clothes
// (jacket off one shoulder, missing sleeve, ragged hems, one shoe missing), and a broken, uneven shamble.
//   drawZombieSide(c, Z, { x, y, k, s, walk, t, dim })    side profile shamble (walk = phase)
//   drawZombieFront(c, Z, { x, y, k, t, dim, press })     front view; press: 0..1 hands up flat on glass
//   ZOMBIES: array of all-different zombies;  makeZombie({...})
// dim 0..1 darkens every colour toward the night (backlit silhouettes); eyes keep glowing.
const ZNIGHT = [11, 13, 20];
function zMix(hex, dim) { if (!dim) return hex; const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = (v, w) => Math.round(v + (w - v) * dim); return `rgb(${f(r, ZNIGHT[0])},${f(g, ZNIGHT[1])},${f(b, ZNIGHT[2])})`; }
function makeZombie(o) {
  return Object.assign(makePerson({}), { hunch: .32, droop: .3, reach: 'near', limp: .5, sleeve: null, jacketOff: false, shoeless: 'far', rag: 1, mouthO: .6, eyeL: 1, eyeR: .8, seed: 1, stain: '#4a4038' }, o);
}
// ---------- face ----------
function zEye(c, x, y, rx, ry, glow) {
  c.beginPath(); c.ellipse(x, y, rx * 1.5, ry * 1.35, 0, 0, Math.PI * 2); c.fillStyle = '#070605'; c.fill(); // sunken socket
  c.save(); c.globalCompositeOperation = 'screen';
  const g = c.createRadialGradient(x, y, 0, x, y, rx * 4.2); g.addColorStop(0, `rgba(215,235,225,${.55 * glow})`); g.addColorStop(1, 'rgba(215,235,225,0)');
  c.fillStyle = g; c.fillRect(x - rx * 4.2, y - rx * 4.2, rx * 8.4, rx * 8.4); c.restore();
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = '#e6eee6'; c.fill();
  c.beginPath(); c.ellipse(x - rx * .25, y - ry * .3, rx * .35, ry * .3, 0, 0, Math.PI * 2); c.fillStyle = '#fbfffb'; c.fill();
}
function zMouth(c, x, y, w, h, seed) {
  // slack, crooked open mouth (no teeth detail, no gore)
  c.beginPath(); c.moveTo(x - w, y - h * .1);
  c.quadraticCurveTo(x - w * .4, y - h * .45, x + w * .2, y - h * .25); c.quadraticCurveTo(x + w * .8, y - h * .3, x + w * 1.05, y + h * .15);
  c.quadraticCurveTo(x + w * .5, y + h * (1 + rnd(seed) * .2), x - w * .1, y + h * .85); c.quadraticCurveTo(x - w * .8, y + h * .7, x - w, y - h * .1); c.closePath();
  c.fillStyle = '#120708'; c.fill(); c.lineWidth = 7; c.strokeStyle = '#6f6862'; c.stroke();
}
function zHeadFront(c, Z, g, dim, glow) {
  const { R, hcy } = g;
  hairBack(c, Z, g);
  c.save(); c.beginPath(); c.arc(0, hcy, R, 0, Math.PI * 2); c.fillStyle = zMix(PPL.shade, dim); c.fill(); c.clip();
  c.beginPath(); c.arc(-4, hcy - R * .13, R - 4, 0, Math.PI * 2); c.fillStyle = zMix(PPL.skin, dim); c.fill(); c.restore();
  c.beginPath(); c.arc(0, hcy, R, 0, Math.PI * 2); pF(c, null);
  const H0 = Z.hairCol; Z.hairCol = zMix(H0, dim); hairFront(c, Z, g); Z.hairCol = H0;
  zEye(c, -R * .34, hcy + R * .12, R * .085 * Z.eyeL, R * .1 * Z.eyeL, glow);
  zEye(c, R * .34, hcy + R * .17, R * .085 * Z.eyeR, R * .065 * Z.eyeR, glow);
  // heavy low brows, uneven
  pL(c, [-R * .52, hcy - R * .02, -R * .2, hcy - R * .07], 11, '#4a433e'); pL(c, [R * .18, hcy - R * .02, R * .5, hcy + R * .04], 11, '#4a433e');
  if (Z.beard) { const B = Z.beardCol; Z.beardCol = zMix(B || Z.hairCol, dim * .5); pBeardFront(c, Z, g); Z.beardCol = B; }
  zMouth(c, R * .06, hcy + R * .55, R * .27, R * .15 * (.6 + Z.mouthO), Z.seed);
  if (Z.glasses) { c.save(); c.lineWidth = 8; c.strokeStyle = '#8a8070'; c.translate(0, hcy + R * .14); c.rotate(.12); for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * .34, 0, R * .2, 0, Math.PI * 2); c.stroke(); } pL(c, [R * .28, -R * .16, R * .5, R * .12], 5, '#cfd6d8'); c.restore(); } // cracked lens
}
function zHeadSide(c, Z, g, hx, dim, glow) {
  const { R, hcy } = g;
  const H0 = Z.hairCol; Z.hairCol = zMix(H0, dim);
  hairSide(c, Z, g, hx, false);
  c.save(); c.beginPath(); c.arc(hx, hcy, R, 0, Math.PI * 2); c.fillStyle = zMix(PPL.shade, dim); c.fill(); c.clip(); c.beginPath(); c.arc(hx + 6, hcy - R * .13, R - 4, 0, Math.PI * 2); c.fillStyle = zMix(PPL.skin, dim); c.fill(); c.restore();
  c.beginPath(); c.arc(hx, hcy, R, 0, Math.PI * 2); pF(c, null);
  c.beginPath(); c.ellipse(hx - R * .12, hcy + R * .18, R * .12, R * .17, 0, 0, Math.PI * 2); pF(c, zMix(PPL.skin, dim), PPL.W * .6);
  hairSide(c, Z, g, hx, true); Z.hairCol = H0;
  zEye(c, hx + R * .56, hcy + R * .1, R * .085 * Z.eyeL, R * .1, glow);
  pL(c, [hx + R * .38, hcy - R * .06, hx + R * .72, hcy - R * .02], 10, '#4a433e');
  if (Z.beard) { const col = zMix(Z.beardCol || Z.hairCol, dim * .5); c.beginPath(); c.moveTo(hx - R * .05, hcy + R * .2); c.quadraticCurveTo(hx + R * .05, hcy + R * 1.1, hx + R * .62, hcy + R * .95); c.quadraticCurveTo(hx + R * .9, hcy + R * .7, hx + R * .9, hcy + R * .6); c.quadraticCurveTo(hx + R * .5, hcy + R * .55, hx + R * .35, hcy + R * .3); c.closePath(); pF(c, col, PPL.W * .6); }
  // jaw hangs open
  c.beginPath(); c.moveTo(hx + R * .55, hcy + R * .46); c.quadraticCurveTo(hx + R * .9, hcy + R * .42, hx + R * .98, hcy + R * .5); c.lineTo(hx + R * .86, hcy + R * (.62 + .3 * Z.mouthO)); c.quadraticCurveTo(hx + R * .66, hcy + R * (.7 + .25 * Z.mouthO), hx + R * .55, hcy + R * .58); c.closePath();
  c.fillStyle = '#120708'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#6f6862'; c.stroke();
}
// ---------- clothes helpers ----------
function zRagHem(c, x0, x1, y, depth, seed) { // jagged bottom edge from x1 back to x0
  const n = 9; for (let i = 0; i <= n; i++) { const x = x1 + (x0 - x1) * i / n; c.lineTo(x, y + (i % 2 ? depth * (.4 + rnd(seed + i) * .8) : -depth * .2)); }
}
function zStains(c, x0, y0, x1, y1, col, seed, n = 5) { c.save(); c.clip(); c.fillStyle = col; c.globalAlpha = .55; for (let i = 0; i < n; i++) { c.beginPath(); c.ellipse(x0 + rnd(seed + i * 3) * (x1 - x0), y0 + rnd(seed + i * 5) * (y1 - y0), 30 + rnd(seed + i) * 50, 18 + rnd(seed + i + 1) * 30, rnd(i) * 3, 0, Math.PI * 2); c.fill(); } c.restore(); c.stroke(); }
function zFoot(c, x, y, sz, bare, shoe, dim, far) {
  if (bare) { c.beginPath(); c.ellipse(x + 30 * sz, y + 6, 70 * sz, 30 * sz, .08, 0, Math.PI * 2); pF(c, zMix(far ? PPL.far : PPL.skin, dim)); for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x + (70 + i * 14) * sz, y + 4 - i * 2, 9 * sz, 0, Math.PI * 2); pF(c, zMix(PPL.skin, dim), PPL.W * .4); } }
  else { c.beginPath(); c.ellipse(x + 34 * sz, y + 8, 80 * sz, 40 * sz, 0, 0, Math.PI * 2); pF(c, zMix(shadeHex(shoe, far ? -.2 : 0), dim)); }
}
// ---------- side profile shamble ----------
function zLegSide(c, Z, g, ph, far, dim, drag) {
  const L = (-g.hipY - 40 * g.sz) / 2, sw = Math.sin(ph), th = sw * .3 + (drag ? -.06 : 0), kb = Math.max(0, Math.sin(ph - 1.3)) * (drag ? .25 : .65);
  const hx = 0, hy = g.hipY, kx = hx + Math.sin(th) * L, ky = hy + Math.cos(th) * L, ax = kx + Math.sin(th - kb) * L, ay = Math.min(-40 * g.sz, ky + Math.cos(th - kb) * L);
  const b = Z.bottom, bare = b !== 'pants' && b !== 'jeans', col = bare ? (far ? PPL.far : PPL.skin) : shadeHex(Z.botCol, far ? -.2 : 0);
  pLimb(c, [hx, hy, kx, ky, ax, ay], g.lw * .92, zMix(col, dim));
  if (b === 'shorts' || b === 'skirt') pLimb(c, [hx, hy, hx + (kx - hx) * .6, hy + (ky - hy) * .6], g.lw + 14, zMix(shadeHex(Z.botCol, far ? -.2 : 0), dim));
  if (!bare && rnd(Z.seed + (far ? 7 : 3)) > .5) { const tx = kx + (ax - kx) * .7, ty = ky + (ay - ky) * .7; c.beginPath(); c.moveTo(tx - g.lw * .5, ty); for (let i = 0; i <= 4; i++) c.lineTo(tx - g.lw * .5 + i * g.lw * .25, ty + (i % 2 ? 28 : 0)); c.lineTo(tx + g.lw * .5, ty - 10); c.fillStyle = zMix(PPL.skin, dim); c.fill(); } // ripped trouser leg
  zFoot(c, ax, ay, g.sz, Z.shoeless === (far ? 'far' : 'near'), Z.shoe, dim, far);
}
function zArmSide(c, Z, g, a, b, far, dim, bare) {
  const sx = 0, sy = g.shY + 26, ex = sx + Math.sin(a) * g.up, ey = sy + Math.cos(a) * g.up, wx = ex + Math.sin(a + b) * g.fo, wy = ey + Math.cos(a + b) * g.fo;
  const sl = bare ? 'none' : (SLEEVE[Z.top] || 'short'), col = zMix(shadeHex(Z.topCol, far ? -.2 : 0), dim), sk = zMix(far ? PPL.far : PPL.skin, dim);
  pLimb(c, [sx, sy, ex, ey, wx, wy], g.aw, sl === 'long' ? col : sk);
  if (sl === 'short' || bare) { // sleeve stub, torn edge
    const m = bare ? .3 : .5; pLimb(c, [sx, sy, sx + (ex - sx) * m, sy + (ey - sy) * m], g.aw + 22, col);
    if (bare) { const px = sx + (ex - sx) * m, py = sy + (ey - sy) * m; for (let i = 0; i < 3; i++) pL(c, [px - 20 + i * 20, py, px - 14 + i * 22, py + 26 + (i % 2) * 14], 10, col); }
  }
  pHand(c, wx, wy, -(a + b), g.sz);
  return [wx, wy];
}
function drawZombieSide(c, Z, o = {}) {
  const g = pGeo(Z), k = o.k ?? .25, dim = o.dim ?? 0, glow = o.glow ?? 1, W0 = PPL.W; PPL.W = 13 * (o.ink ?? 1.8);
  const t = o.t || 0, raw = o.walk ?? 0, ph = raw + Z.limp * .55 * Math.sin(raw), sd = Z.seed;
  const lurch = Math.sin(ph * .5 + sd) * .06 + Math.sin(ph) * .04, hunch = Z.hunch + lurch;
  const bob = -Math.abs(Math.cos(ph)) * 10 * g.sz + Math.max(0, Math.sin(ph)) * Z.limp * 22 * g.sz;
  const { shY, hipY, sw, hw, sz, tl } = g, d = Math.max(sw, hw) * .78, top = Z.top, col = Z.topCol;
  c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k); c.translate(0, bob);
  const reachNear = Z.reach === 'near', aR = 1.25 + Math.sin(ph - 1.2) * .1, aH = .12 + Math.sin(ph - 1.9) * .14;
  const trunk = fn => { c.save(); c.translate(0, hipY); c.rotate(hunch); c.translate(0, -hipY); fn(); c.restore(); };
  trunk(() => zArmSide(c, Z, g, reachNear ? aH : aR, reachNear ? .1 : .22, true, dim, Z.sleeve === 'far'));
  zLegSide(c, Z, g, ph + Math.PI, true, dim, Z.limp > .5);
  zLegSide(c, Z, g, ph, false, dim, false);
  trunk(() => {
    const hem = top === 'coat' || top === 'dress' ? hipY * .42 : hipY + 6;
    c.beginPath(); c.moveTo(-d * .75, shY - 14); c.quadraticCurveTo(-d * 1.1, (shY + hipY) / 2, -d * .85, hipY);
    if (top === 'dress' || top === 'coat') { c.lineTo(-d * 1.15, hem); zRagHem(c, -d * 1.15, d * 1.2, hem, 60 * Z.rag, sd); c.lineTo(d * .9, hipY); }
    else { c.lineTo(-d * .85, hem); zRagHem(c, -d * .85, d * .9, hem, 36 * Z.rag, sd); }
    c.quadraticCurveTo(d * 1.05, shY + tl * .3, d * .7, shY - 14); c.quadraticCurveTo(0, shY - 40, -d * .75, shY - 14); c.closePath();
    c.fillStyle = zMix(col, dim); c.fill(); c.lineWidth = PPL.W; c.strokeStyle = PPL.out; c.stroke();
    zStains(c, -d, shY, d, hem, zMix(Z.stain, dim), sd);
    if (Z.pattern === 'stripes') { c.save(); c.clip(); c.fillStyle = zMix(Z.patCol || '#d8d0c4', dim); for (let y = shY + 20; y < hem; y += 70) c.fillRect(-d * 1.3, y, d * 2.6, 22); c.restore(); }
    if (Z.jacketOff) { // jacket slipped off the near shoulder: hangs from the back, collar at the elbow
      c.beginPath(); c.moveTo(-d * .9, shY + 30); c.quadraticCurveTo(-d * 1.25, (shY + hipY) / 2, -d * 1.0, hipY * .8); zRagHem(c, -d * 1.0, d * .2, hipY * .8, 40, sd + 3); c.quadraticCurveTo(d * .1, shY + tl * .55, -d * .2, shY + tl * .35); c.closePath();
      pF(c, zMix(Z.jacketCol || '#4a4f5a', dim));
    }
    if (Z.bottom === 'skirt') { c.beginPath(); c.moveTo(-d * .88, hipY - 30); c.lineTo(-d * 1.2, hipY * .5); zRagHem(c, -d * 1.2, d * 1.25, hipY * .5, 40, sd + 5); c.lineTo(d * .92, hipY - 30); c.closePath(); pF(c, zMix(Z.botCol, dim)); }
    // head drops forward and to the side, swings late (delayed by the shamble)
    const hd = .12 + Math.abs(Z.droop) * .55 + Math.sin(ph - .9) * .1 + Math.sin(t * 1.3 + sd) * .04;
    c.save(); c.translate(0, shY - 10); c.rotate(hd); c.translate(0, -(shY - 10));
    c.beginPath(); c.roundRect(-30 * sz, g.hcy + g.R * .6, 74 * sz, shY - (g.hcy + g.R * .6) + 16, 10); pF(c, zMix(PPL.skin, dim), PPL.W * .7);
    zHeadSide(c, Z, g, g.R * .2, dim, glow); c.restore();
    zArmSide(c, Z, g, reachNear ? aR : aH, reachNear ? .22 : .1, false, dim, Z.sleeve === 'near');
    if (Z.jacketOff) { const a = reachNear ? aR : aH, ex = Math.sin(a) * g.up, ey = shY + 26 + Math.cos(a) * g.up; c.beginPath(); c.moveTo(-40, shY + 40); c.quadraticCurveTo(ex * .5 - 30, ey - 20, ex - 10, ey + 50); c.lineTo(ex + 40, ey + 20); c.quadraticCurveTo(ex * .5 + 40, ey - 60, 50, shY + 30); c.closePath(); pF(c, zMix(Z.jacketCol || '#4a4f5a', dim)); }
  });
  c.restore(); PPL.W = W0;
}
// ---------- front view (pressing on glass / standing) ----------
function drawZombieFront(c, Z, o = {}) {
  const g = pGeo(Z), k = o.k ?? .25, dim = o.dim ?? 0, glow = o.glow ?? 1, W0 = PPL.W; PPL.W = 13 * (o.ink ?? 1.8);
  const t = o.t || 0, sd = Z.seed, press = o.press ?? 0, { shY, hipY, sw, hw, sz, tl, R, hcy } = g;
  const sway = Math.sin(t * (1.1 + rnd(sd) * .6) + sd * 2) * .05;
  c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k);
  // legs (one bent, uneven stance)
  for (const s of [-1, 1]) {
    const lx = s * hw * .5, bare = Z.bottom !== 'pants' && Z.bottom !== 'jeans', kn = s > 0 ? 30 : -10;
    pLimb(c, [lx, hipY - 10, lx + kn, hipY * .5, lx + s * 10, -80], g.lw, zMix(bare ? PPL.skin : Z.botCol, dim));
    if (Z.shoeless === (s < 0 ? 'far' : 'near')) { c.beginPath(); c.ellipse(lx + s * 18 * sz, -30 * sz, g.lw * .7, 34 * sz, 0, 0, Math.PI * 2); pF(c, zMix(PPL.skin, dim)); }
    else { c.beginPath(); c.ellipse(lx + s * 22 * sz, -38 * sz, g.lw * .78, 46 * sz, 0, 0, Math.PI * 2); pF(c, zMix(Z.shoe, dim)); }
  }
  c.save(); c.translate(0, hipY); c.rotate(sway); c.translate(0, -hipY);
  c.translate(0, Z.hunch * 60);
  // torso with ragged hem, one shoulder lower
  const hem = Z.top === 'coat' || Z.top === 'dress' ? hipY * .45 : hipY + 6, tilt = Z.droop > 0 ? 1 : -1;
  c.beginPath(); c.rect(-40 * sz, hcy + R * .6, 80 * sz, shY - (hcy + R * .6)); pF(c, zMix(PPL.skin, dim), 0);
  c.beginPath(); c.moveTo(-50 * sz, shY - 30); c.quadraticCurveTo(-sw * .8, shY - 32 + tilt * 20, -sw, shY - 6 + tilt * 30);
  c.quadraticCurveTo(-sw * .92, (shY + hem) / 2, -hw * 1.02, hem); zRagHem(c, -hw * 1.02, hw * 1.02, hem, 40 * Z.rag, sd); c.quadraticCurveTo(sw * .92, (shY + hem) / 2, sw, shY - 6 - tilt * 30);
  c.quadraticCurveTo(sw * .8, shY - 32 - tilt * 20, 50 * sz, shY - 30); c.quadraticCurveTo(0, shY + 6, -50 * sz, shY - 30); c.closePath();
  c.fillStyle = zMix(Z.topCol, dim); c.fill(); c.lineWidth = PPL.W; c.strokeStyle = PPL.out; c.stroke();
  zStains(c, -sw, shY, sw, hem, zMix(Z.stain, dim), sd);
  if (Z.pattern === 'stripes') { c.save(); c.clip(); c.fillStyle = zMix(Z.patCol || '#d8d0c4', dim); for (let y = shY + 20; y < hem; y += 70) c.fillRect(-sw * 1.2, y, sw * 2.4, 22); c.restore(); }
  if (Z.jacketOff) { c.beginPath(); c.moveTo(-sw * 1.02, shY + 60); c.quadraticCurveTo(-sw * 1.2, (shY + hipY) / 2, -hw * 1.15, hipY * .7); zRagHem(c, -hw * 1.15, -hw * .2, hipY * .7, 30, sd + 2); c.lineTo(-sw * .2, shY + 40); c.closePath(); pF(c, zMix(Z.jacketCol || '#4a4f5a', dim)); }
  // arms: press = both hands up, palms on the glass; else one reaching, one hanging
  const arms = press ? [[-1, 1.7 + Math.sin(t * 1.7 + sd) * .07, 1.0], [1, 1.55 + Math.sin(t * 1.4 + sd + 1) * .08, 1.15]] : [[-1, .1 + Math.sin(t + sd) * .08, .05], [1, 1.35 + Math.sin(t * 1.2 + sd) * .1, .2]];
  const drawArm = ([side, a, b]) => {
    const bare = Z.sleeve === (side < 0 ? 'far' : 'near'), sx = side * (sw - g.aw * .38), sy = shY + 18 + (side === tilt ? -30 : 30) * -1;
    const ex = sx + side * Math.sin(a) * g.up, ey = sy + Math.cos(a) * g.up, wx = ex + side * Math.sin(a + b) * g.fo, wy = ey + Math.cos(a + b) * g.fo;
    const sl = bare ? 'none' : (SLEEVE[Z.top] || 'short'), col = zMix(Z.topCol, dim), sk = zMix(PPL.skin, dim);
    pLimb(c, [sx, sy, ex, ey, wx, wy], g.aw, sl === 'long' ? col : sk);
    if (sl !== 'long') pLimb(c, [sx, sy, sx + (ex - sx) * (bare ? .25 : .45), sy + (ey - sy) * (bare ? .25 : .45)], g.aw + 22, col);
    // flat palm, fingers spread (against the glass)
    c.save(); c.translate(wx, wy); c.rotate(-side * (a + b)); c.scale(sz * 1.35, sz * 1.35);
    for (let i = 0; i < 4; i++) { const fa = -.55 + i * .36; pLimb(c, [Math.sin(fa) * 26, 40 + Math.cos(fa) * 26, Math.sin(fa) * 92, 40 + Math.cos(fa) * 100], 18, sk); }
    c.beginPath(); c.ellipse(0, 40, 44, 50, 0, 0, Math.PI * 2); c.fillStyle = sk; c.fill(); c.lineWidth = PPL.W * .5; c.strokeStyle = PPL.out; c.stroke();
    pLimb(c, [-30 * side, 30, -70 * side, 10], 16, sk);
    c.restore();
  };
  if (!press) arms.forEach(drawArm);
  c.save(); c.translate(0, shY - 20); c.rotate(Z.droop * 1.1 + Math.sin(t * 1.3 + sd) * .05); c.translate(0, -(shY - 20)); zHeadFront(c, Z, g, dim, glow); c.restore();
  if (press) arms.forEach(drawArm);
  c.restore(); c.restore(); PPL.W = W0;
}
// ---------- the horde: all different ----------
const ZOMBIES = [
  makeZombie({ seed: 1, T: 1600, bw: 1.15, hair: 'buzz', top: 'shirt', topCol: '#7d8a96', jacketOff: true, jacketCol: '#3d4452', bottom: 'pants', botCol: '#3b3a42', shoe: '#2a2420', shoeless: 'far', hunch: .38, droop: .34, reach: 'near', limp: .7 }),
  makeZombie({ seed: 2, T: 1500, bw: .88, hips: 1.18, hair: 'long', hairCol: '#1a1412', top: 'dress', topCol: '#7a4a5e', bottom: 'skirt', botCol: '#7a4a5e', shoe: '#4a2a30', shoeless: 'near', hunch: .26, droop: -.38, reach: 'far', limp: .4, sleeve: 'near', eyeR: 1.05 }),
  makeZombie({ seed: 3, T: 1440, bw: 1.05, hair: 'grey', hairCol: '#a8a29a', beard: 'short', beardCol: '#b8b2aa', glasses: true, top: 'sweater', topCol: '#5e6a4a', bottom: 'pants', botCol: '#4a463c', shoe: '#2e2620', shoeless: null, hunch: .46, droop: .42, reach: 'near', limp: .9, eyeL: .8 }),
  makeZombie({ seed: 4, T: 1650, bw: .95, hair: 'fade', top: 'hoodie', topCol: '#4f6378', bottom: 'jeans', botCol: '#31405a', shoe: '#d8d4cc', shoeless: 'far', hunch: .3, droop: -.3, reach: 'far', limp: .3, sleeve: 'near' }),
  makeZombie({ seed: 5, T: 1520, bw: .9, hips: 1.15, hair: 'braids', hairCol: '#1d1513', top: 'jacket', topCol: '#6a5a8a', bottom: 'pants', botCol: '#2c2c36', shoe: '#3a2a2a', shoeless: 'near', hunch: .34, droop: .28, reach: 'near', limp: .55, earrings: 1 }),
  makeZombie({ seed: 6, T: 1580, bw: 1.32, hair: 'bald', top: 'tshirt', topCol: '#8a6a4a', bottom: 'jeans', botCol: '#3a4660', shoe: '#3a3028', shoeless: null, hunch: .4, droop: -.25, reach: 'far', limp: .6, sleeve: 'far', mouthO: .9 }),
  makeZombie({ seed: 7, T: 1460, bw: 1.1, hips: 1.25, hair: 'headwrap', hatCol: '#6a4a3a', top: 'coat', topCol: '#5a5040', bottom: 'pants', botCol: '#3a3430', shoe: '#2a2220', shoeless: 'far', hunch: .5, droop: .36, reach: 'near', limp: .8, eyeR: .7 }),
  makeZombie({ seed: 8, T: 1150, head: .88, bw: .82, legs: .34, hair: 'afro', hairCol: '#1a1210', top: 'tshirt', topCol: '#5a7a6a', pattern: 'stripes', patCol: '#a8a296', bottom: 'shorts', botCol: '#3a3d48', shoe: '#8a3a30', shoeless: 'near', hunch: .24, droop: -.32, reach: 'far', limp: .35 }),
  makeZombie({ seed: 9, T: 1620, bw: 1.0, hair: 'locs', hairCol: '#2a1d16', top: 'jacket', topCol: '#3d4a3a', bottom: 'jeans', botCol: '#2a3040', shoe: '#1e1a18', shoeless: null, hunch: .36, droop: .4, reach: 'near', limp: .45, sleeve: 'near', jacketOff: true, jacketCol: '#3d4a3a' }),
  makeZombie({ seed: 10, T: 1490, bw: .86, hips: 1.12, hair: 'bun', hairCol: '#1a1210', top: 'shirt', topCol: '#9a9488', bottom: 'skirt', botCol: '#3a3040', shoe: '#2a2020', shoeless: 'far', hunch: .3, droop: -.42, reach: 'near', limp: .65, eyeL: 1.1 }),
  makeZombie({ seed: 11, T: 1560, bw: 1.2, hair: 'cap', hatCol: '#4a5a7a', beard: 'full', beardCol: '#1f1815', top: 'hoodie', topCol: '#6a4040', bottom: 'pants', botCol: '#2e3038', shoe: '#3a3a3a', shoeless: 'near', hunch: .42, droop: .3, reach: 'far', limp: .5 }),
  makeZombie({ seed: 12, T: 1400, bw: .95, hips: 1.2, hair: 'grey', hairCol: '#b4aea6', glasses: true, top: 'coat', topCol: '#4a5a6a', bottom: 'pants', botCol: '#2a2a30', shoe: '#2a2420', shoeless: null, hunch: .55, droop: -.35, reach: 'near', limp: .85 }),
  makeZombie({ seed: 13, T: 1680, bw: .92, hair: 'beanie', hatCol: '#3a3a44', top: 'coat', topCol: '#3a3430', bottom: 'jeans', botCol: '#283044', shoe: '#1e1a18', shoeless: 'far', hunch: .28, droop: .45, reach: 'far', limp: .25, sleeve: 'far' }),
  makeZombie({ seed: 14, T: 1510, bw: 1.0, hips: 1.15, hair: 'puffs', hairCol: '#1d1412', top: 'tank', topCol: '#6a6a3a', bottom: 'jeans', botCol: '#3a4660', shoe: '#c8c0b0', shoeless: 'near', hunch: .33, droop: .33, reach: 'near', limp: .6 }),
  makeZombie({ seed: 15, T: 1050, head: .9, bw: .8, legs: .33, hair: 'buzz', top: 'hoodie', topCol: '#5a4a6a', bottom: 'pants', botCol: '#3a3a40', shoe: '#5a5a60', shoeless: null, hunch: .22, droop: .4, reach: 'far', limp: .4 }),
  makeZombie({ seed: 16, T: 1600, bw: 1.08, hair: 'fade', beard: 'goatee', top: 'shirt', topCol: '#6a7a8a', top2: '#d0ccc4', bottom: 'pants', botCol: '#22283a', shoe: '#1a1412', shoeless: 'near', hunch: .37, droop: -.28, reach: 'near', limp: .75, jacketOff: true, jacketCol: '#2c3448' }),
];
