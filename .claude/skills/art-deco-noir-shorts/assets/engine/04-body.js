/* =====================================================================
   04 · BODIES, HANDS & PROPS
   Units match the head rig (head ≈ 270 units tall). Bodies are flat
   cel shapes with a multiply shadow side and an edge rim light.
   ===================================================================== */
const OUTFIT = {
  boss: { suit: '#3e2658', lapel: '#2a183c', shirt: '#1c1620', tie: '#5c1626', scarf: '#e6d8b6', scarfSh: '#9c8664', pocket: '#7a1d2e', cuff: '#d8ccb4', shoe: '#0c0a0e', stripe: '#5a3c78' },
  guard: { suit: '#18151d', lapel: '#0f0d13', shirt: '#2a2630', tie: '#09080b', cuff: '#7a7480', shoe: '#08070a' },
  ltA: { suit: '#2b2b35', lapel: '#1f1f28', shirt: '#bdb4a4', tie: '#4a1420', cuff: '#bdb4a4', shoe: '#0b0a0c', pocket: '#bdb4a4' },
  ltB: { suit: '#3a2a22', lapel: '#2a1d17', shirt: '#c8bfae', tie: '#2a2a4a', cuff: '#c8bfae', shoe: '#0b0a0c' },
  ltC: { suit: '#1d1c24', lapel: '#14131a', shirt: '#3a2a3a', tie: '#7a6a2a', cuff: '#8a8090', shoe: '#0b0a0c', pocket: '#7a6a2a' },
  ltD: { suit: '#38303e', lapel: '#2a242f', shirt: '#cfc6b4', tie: '#5a1a1a', cuff: '#cfc6b4', shoe: '#0b0a0c' },
  rival: { suit: '#3c3a2a', lapel: '#2c2a1e', shirt: '#cfc6ae', tie: '#7a6420', cuff: '#cfc6ae', shoe: '#0b0a0c', stripe: '#6a6650', pocket: '#cfc6ae' },
  accountant: { suit: '#4a4036', lapel: '#3a322a', shirt: '#d6cdbb', tie: '#3a2a20', cuff: '#d6cdbb', shoe: '#0b0a0c', vest: true },
};
function clothCols(base, L, flash = 0) {
  const back = clamp(-L.dir[2]);                                     // key behind → darker body
  const lit = mixc(mixc(mixc(base, L.key, L.keyAmt * 0.45), '#08060c', back * 0.5), '#d8d0ff', flash * 0.28);
  return { lit, sh: mixc(base, '#030206', 0.55), rim: L.rim };
}
/** fill a body part: lit colour, multiply shadow on the side away from the key, rim light */
function bodyPart(ctx, path, base, L, o = {}) {
  const C = clothCols(base, L, o.flash || 0);
  ctx.fillStyle = C.lit; ctx.fill(path);
  const sx = L.dir[0] <= 0 ? 1 : -1;
  const split = (o.split ?? 0) + sx * (lerp(260, 10, Math.abs(L.dir[0])) + Math.min(0, L.dir[2]) * 320);
  ctx.save(); ctx.clip(path); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(L.mul, o.shadeA ?? 0.85);
  if (sx > 0) ctx.fillRect(split, -5000, 10000, 10000); else ctx.fillRect(split - 10000, -5000, 10000, 10000);
  ctx.restore();
  if (o.rim !== false) edgeFill(ctx, path, -L.rimDir[0] * L.rimW * (o.rimK || 2.2) * (1 + (o.flash || 0)), -L.rimDir[1] * L.rimW * (o.rimK || 2.2) * (1 + (o.flash || 0)), L.rim, clamp(L.rimA + (o.flash || 0) * 0.8) * (o.rimA ?? 1));
}
function quad(ax, ay, bx, by, w0, w1) {
  const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  return pathOf([[ax + nx * w0, ay + ny * w0], [bx + nx * w1, by + ny * w1], [bx - nx * w1, by - ny * w1], [ax - nx * w0, ay - ny * w0]]);
}
/** single-contour capsule (tapered), safe for edgeFill */
function limbPath(ax, ay, bx, by, w0, w1) {
  const dx = bx - ax, dy = by - ay, a = Math.atan2(dy, dx), p = new Path2D();
  p.moveTo(ax + Math.cos(a - PI / 2) * w0, ay + Math.sin(a - PI / 2) * w0);
  p.lineTo(bx + Math.cos(a - PI / 2) * w1, by + Math.sin(a - PI / 2) * w1);
  p.arc(bx, by, w1, a - PI / 2, a + PI / 2, false);
  p.lineTo(ax + Math.cos(a + PI / 2) * w0, ay + Math.sin(a + PI / 2) * w0);
  p.arc(ax, ay, w0, a + PI / 2, a + PI * 1.5, false);
  p.closePath();
  return p;
}
/** small Art-Deco sunburst emblem (used on seals and stamps — no lettering) */
function decoEmblem(ctx, x, y, r, col, lw) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y + r * 0.35, r * 0.32, PI, TAU); ctx.stroke();
  for (let i = 0; i <= 6; i++) { const a = PI + (i / 6) * PI; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.45, y + r * 0.35 + Math.sin(a) * r * 0.45); ctx.lineTo(x + Math.cos(a) * r * 0.9, y + r * 0.35 + Math.sin(a) * r * 0.9); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x - r * 0.8, y + r * 0.5); ctx.lineTo(x + r * 0.8, y + r * 0.5); ctx.stroke();
  ctx.restore();
}
function ik2(sx, sy, tx, ty, l1, l2, bend) {
  const dx = tx - sx, dy = ty - sy, d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
  const a = Math.atan2(dy, dx), A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const e = a + bend * A;
  return [sx + Math.cos(e) * l1, sy + Math.sin(e) * l1];
}

/* ---------- GEM & RING ---------- */
function drawGem(ctx, x, y, r, glint = 0, det = 0, light = 0.5) {
  ctx.save(); ctx.translate(x, y);
  const oct = [], tab = [];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + PI / 8; oct.push([Math.cos(a) * r, Math.sin(a) * r * 0.86]); tab.push([Math.cos(a) * r * 0.48, Math.sin(a) * r * 0.42 - r * 0.06]); }
  ctx.fillStyle = PAL.gold; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.22, r * 1.06, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#6a4a18'; ctx.beginPath(); ctx.ellipse(0, r * 0.12, r * 1.1, r * 0.95, 0, 0, TAU); ctx.fill();
  const shades = ['#ff4a5a', '#e01830', '#a00c1e', '#6a0612', '#4a040c', '#7a0816', '#c01026', '#ff3048'];
  for (let i = 0; i < 8; i++) {
    const a = oct[i], b = oct[(i + 1) % 8], c = tab[(i + 1) % 8], d = tab[i];
    ctx.fillStyle = mixc(shades[i], '#ff9aa0', light * 0.15); ctx.fill(pathOf([a, b, c, d]));
  }
  const gr = ctx.createRadialGradient(-r * 0.15, -r * 0.2, 0, 0, 0, r * 0.6);
  gr.addColorStop(0, '#ff8a90'); gr.addColorStop(0.5, '#e01a30'); gr.addColorStop(1, '#8a0a18');
  ctx.fillStyle = gr; ctx.fill(pathOf(tab));
  if (det > 0) { ctx.strokeStyle = 'rgba(255,200,200,0.25)'; ctx.lineWidth = r * 0.03; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(oct[i][0], oct[i][1]); ctx.lineTo(tab[i][0], tab[i][1]); ctx.stroke(); } }
  ctx.fillStyle = 'rgba(255,240,240,0.85)'; ctx.beginPath(); ctx.ellipse(-r * 0.28, -r * 0.3, r * 0.16, r * 0.09, -0.6, 0, TAU); ctx.fill();
  glow(ctx, 0, 0, r * 2.6, '#ff2030', 0.28 + glint * 0.4);
  if (glint > 0.02) {
    ctx.globalCompositeOperation = 'lighter';
    const s = r * (1.2 + glint * 3.2);
    ctx.fillStyle = rgba('#fff0f0', glint);
    ctx.beginPath(); ctx.moveTo(-r * 0.3 - s, -r * 0.3); ctx.lineTo(-r * 0.3, -r * 0.3 - r * 0.08); ctx.lineTo(-r * 0.3 + s, -r * 0.3); ctx.lineTo(-r * 0.3, -r * 0.3 + r * 0.08); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.3 - s * 0.8); ctx.lineTo(-r * 0.3 + r * 0.08, -r * 0.3); ctx.lineTo(-r * 0.3, -r * 0.3 + s * 0.8); ctx.lineTo(-r * 0.3 - r * 0.08, -r * 0.3); ctx.closePath(); ctx.fill();
    glow(ctx, -r * 0.3, -r * 0.3, r * 1.5 * (1 + glint), '#ffd0d8', glint * 0.8);
  }
  ctx.restore();
}

/* ---------- HAND ----------
   local: wrist at origin, fingers toward -y, back of hand facing viewer.
   side +1 = right hand (thumb at -x), -1 = left hand. */
const HAND_POSE = {
  flat: { c: [0.04, 0.03, 0.05, 0.1], th: -0.55, tl: 1 },
  rest: { c: [0.32, 0.3, 0.36, 0.42], th: -0.4, tl: 0.95 },
  fist: { c: [0.86, 0.86, 0.86, 0.86], th: -0.15, tl: 0.7 },
  two: { c: [0, 0.02, 0.86, 0.88], th: -0.2, tl: 0.75 },
  hold: { c: [0.55, 0.5, 0.68, 0.74], th: -0.3, tl: 0.85 },
  grip: { c: [0.7, 0.7, 0.72, 0.76], th: 0.25, tl: 0.9 },
  point: { c: [0, 0.86, 0.88, 0.9], th: -0.15, tl: 0.75 },
};
function mixPose(a, b, t) { return { c: a.c.map((v, i) => lerp(v, b.c[i], t)), th: lerp(a.th, b.th, t), tl: lerp(a.tl, b.tl, t) }; }
function fingerPath(x0, y0, ang, len, w, curl) {
  // tapered finger with a rounded tip; curl shortens & thickens the visible part
  const L = len * (1 - 0.66 * curl), dx = Math.sin(ang), dy = -Math.cos(ang), nx = -dy, ny = dx;
  const w0 = w / 2, w1 = (w / 2) * (0.78 + curl * 0.2);
  const ex = x0 + dx * L, ey = y0 + dy * L, p = new Path2D();
  p.moveTo(x0 + nx * w0, y0 + ny * w0);
  p.quadraticCurveTo(x0 + dx * L * 0.5 + nx * w0 * 1.04, y0 + dy * L * 0.5 + ny * w0 * 1.04, ex + nx * w1, ey + ny * w1);
  p.bezierCurveTo(ex + nx * w1 + dx * w1 * 1.25, ey + ny * w1 + dy * w1 * 1.25, ex - nx * w1 + dx * w1 * 1.25, ey - ny * w1 + dy * w1 * 1.25, ex - nx * w1, ey - ny * w1);
  p.quadraticCurveTo(x0 + dx * L * 0.5 - nx * w0 * 1.04, y0 + dy * L * 0.5 - ny * w0 * 1.04, x0 - nx * w0, y0 - ny * w0);
  p.closePath();
  return { p, ex, ey, dx, dy, nx, ny, L, w1 };
}
function drawHand(ctx, o) {
  const L = o.light, side = o.side || 1, det = o.det || 0;
  const pose = typeof o.pose === 'string' ? HAND_POSE[o.pose] : o.pose || HAND_POSE.rest;
  const base = o.skin || HEAD.boss.skin;
  const skin = mixc(mixc(mixc(base, L.key, L.keyAmt), '#06040a', clamp(-L.dir[2]) * 0.5), '#e4dcff', (o.flash || 0) * 0.3);
  const dark = mixc(skin, L.mul, 0.62), line = mixc(base, '#1a0810', 0.75);
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0); ctx.scale((o.s || 1) * side, (o.s || 1) * (o.fs || 1));
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // light direction in hand-local space → which edge is shaded
  const r = o.rot || 0, lx = L.dir[0] * side, ly = L.dir[1];
  const llx = (lx * Math.cos(-r) - ly * Math.sin(-r)), lly = (lx * Math.sin(-r) + ly * Math.cos(-r));
  const sh = [llx * 5.5, lly * 5.5];
  const fingers = [[-21, -74, 17, 66, -0.07], [-3, -78, 17.5, 72, -0.01], [15, -76, 16.5, 67, 0.05], [30, -69, 14.5, 54, 0.12]];
  const F = fingers.map(([fx, fy, fw, fl, fa], i) => Object.assign(fingerPath(fx, fy, fa, fl, fw, pose.c[i]), { fx, fy, fw, c: pose.c[i] }));
  // thumb: two segments
  const ta = pose.th, tl = 56 * pose.tl;
  const t0 = [-30, -18], t1 = [t0[0] + Math.sin(ta - 0.35) * tl * 0.5 - 6, t0[1] - Math.cos(ta - 0.35) * tl * 0.5];
  const thumbA = limbPath(t0[0], t0[1], t1[0], t1[1], 13, 11);
  const thumbB = fingerPath(t1[0], t1[1], ta, tl * 0.55, 21, 0);
  const palm = smoothPathOf([[-26, 8], [26, 8], [36, -30], [38, -66], [20, -80], [-6, -84], [-28, -80], [-38, -50], [-36, -20]], true, 0.7);
  const parts = [palm, thumbA, thumbB.p].concat(F.map(f => f.p));
  for (const p of parts) { ctx.fillStyle = skin; ctx.fill(p); }
  // shaded edges (cylindrical look per finger) + soft palm shading
  for (const p of parts) edgeFill(ctx, p, sh[0], sh[1], dark, 0.8);
  // knuckles, tendons, joints
  ctx.strokeStyle = rgba(line, 0.28); ctx.lineWidth = 1.4;
  for (const f of F) { ctx.beginPath(); ctx.moveTo(f.fx * 0.5, -10); ctx.lineTo(f.fx, f.fy + 8); ctx.stroke(); }
  for (const f of F) {
    ctx.strokeStyle = rgba(line, 0.45); ctx.lineWidth = 1.2; ctx.stroke(f.p);
    for (const k of [0.36, 0.68]) {
      if (k * f.L > f.L - 7) continue;
      const jx = f.fx + f.dx * f.L * k, jy = f.fy + f.dy * f.L * k;
      ctx.strokeStyle = rgba(line, 0.3); ctx.beginPath(); ctx.moveTo(jx - f.nx * f.fw * 0.25, jy - f.ny * f.fw * 0.25); ctx.lineTo(jx + f.nx * f.fw * 0.25, jy + f.ny * f.fw * 0.25); ctx.stroke();
    }
    ctx.fillStyle = rgba('#fff4e8', 0.12); ctx.beginPath(); ctx.ellipse(f.fx, f.fy + 2, f.fw * 0.3, f.fw * 0.18, 0, 0, TAU); ctx.fill();
    if (det > 0 && f.c < 0.5) { // nails
      const nx = f.ex - f.dx * f.w1 * 0.55, ny = f.ey - f.dy * f.w1 * 0.55;
      ctx.fillStyle = rgba(mixc(skin, '#ffffff', 0.25), 0.8); ctx.beginPath(); ctx.ellipse(nx, ny, f.w1 * 0.62, f.w1 * 0.9, Math.atan2(f.dy, f.dx) + PI / 2, 0, TAU); ctx.fill();
      ctx.strokeStyle = rgba(line, 0.4); ctx.lineWidth = 0.8; ctx.stroke();
    }
  }
  ctx.strokeStyle = rgba(line, 0.4); ctx.lineWidth = 1.2; ctx.stroke(thumbB.p);
  // ring on ring finger
  if (o.ring) {
    const f = F[2], k = 0.22, rx = f.fx + f.dx * f.L * k, ry = f.fy + f.dy * f.L * k;
    ctx.fillStyle = PAL.gold; ctx.fill(quad(rx - f.dx * 4, ry - f.dy * 4, rx + f.dx * 4, ry + f.dy * 4, f.fw * 0.56, f.fw * 0.56));
    ctx.fillStyle = rgba('#fff0c0', 0.5); ctx.fill(quad(rx - f.dx * 4, ry - f.dy * 4, rx - f.dx * 1, ry - f.dy * 1, f.fw * 0.5, f.fw * 0.5));
    ctx.save(); ctx.scale(side, 1);
    drawGem(ctx, rx * side, ry, 8.5 * (o.gemK || 1), o.glint || 0, det, L.keyAmt);
    ctx.restore();
  }
  edgeFill(ctx, palm, -L.rimDir[0] * L.rimW * 0.7 * side, -L.rimDir[1] * L.rimW * 0.7, L.rim, L.rimA * 0.45);
  ctx.restore();
}
/** sleeve from elbow to wrist with a shirt cuff */
function drawForearm(ctx, ex, ey, wx, wy, w0, w1, suit, cuff, L, flash) {
  const dx = wx - ex, dy = wy - ey, l = Math.hypot(dx, dy) || 1;
  const cx = wx - (dx / l) * 14, cy = wy - (dy / l) * 14;
  const a = Math.atan2(cy - ey, cx - ex), sl = new Path2D();
  sl.moveTo(ex + Math.cos(a - PI / 2) * w0, ey + Math.sin(a - PI / 2) * w0);
  sl.lineTo(cx + Math.cos(a - PI / 2) * w1, cy + Math.sin(a - PI / 2) * w1);
  sl.lineTo(cx + Math.cos(a + PI / 2) * w1, cy + Math.sin(a + PI / 2) * w1);
  sl.lineTo(ex + Math.cos(a + PI / 2) * w0, ey + Math.sin(a + PI / 2) * w0);
  sl.arc(ex, ey, w0, a + PI / 2, a + PI * 1.5, false); sl.closePath();
  bodyPart(ctx, sl, suit, L, { flash, rimK: 1.4 });
  const cf = quad(cx - (dx / l) * 2, cy - (dy / l) * 2, wx, wy, w1 * 0.86, w1 * 0.8);
  ctx.fillStyle = mixc(cuff, L.key, L.keyAmt * 0.4); ctx.fill(cf);
  ctx.fillStyle = PAL.gold; ctx.beginPath(); ctx.arc(lerp(cx, wx, 0.5) + (dy / l) * w1 * 0.5, lerp(cy, wy, 0.5) - (dx / l) * w1 * 0.5, 3.5, 0, TAU); ctx.fill();
}

/* ---------- BOSS: seated, facing camera ----------
   origin = neck base. o: x,y,s, light, flash, head:{yaw,pitch,...}, handR/handL:{x,y,rot,pose}, elbowR/L, breath, cigar, t */
function drawBossSeatedFront(ctx, o) {
  const L = o.light, F = OUTFIT.boss, fl = o.flash || 0, br = (o.breath || 0) * 4;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s, o.s);
  const torso = pathOf([[-56, -16], [-118, 0 - br], [-196, 12 - br], [-234, 28 - br], [-250, 64], [-258, 150], [-262, 320], [-256, 620], [256, 620], [262, 320], [258, 150], [250, 64], [234, 28 - br], [196, 12 - br], [118, 0 - br], [56, -16]]);
  bodyPart(ctx, torso, F.suit, L, { flash: fl, rimK: 2.6 });
  // pinstripes
  ctx.save(); ctx.clip(torso); ctx.strokeStyle = rgba(F.stripe, 0.32); ctx.lineWidth = 1.2;
  for (let x = -250; x <= 250; x += 22) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x * 0.96, 620); ctx.stroke(); }
  ctx.restore();
  // arm seams (sleeve vs body)
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(L.mul, 0.6);
  for (const s of [-1, 1]) ctx.fill(pathOf([[s * 172, 70], [s * 186, 70], [s * 194, 620], [s * 176, 620]]));
  ctx.restore();
  // shirt V, collar, tie
  const C = clothCols(F.shirt, L, fl);
  fillPts(ctx, [[-46, -16], [46, -16], [20, 250], [0, 300], [-20, 250]], C.lit);
  fillPts(ctx, [[-14, -8], [14, -8], [11, 22], [-11, 22]], mixc(F.tie, L.key, L.keyAmt * 0.3));
  fillPts(ctx, [[-11, 20], [11, 20], [15, 50], [9, 280], [0, 292], [-9, 280], [-15, 50]], mixc(F.tie, L.key, L.keyAmt * 0.3));
  ctx.strokeStyle = rgba('#000', 0.35); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 26); ctx.lineTo(4, 280); ctx.stroke();
  // lapels
  for (const s of [-1, 1]) {
    const lp = pathOf([[s * 44, -16], [s * 66, -20], [s * 102, 60], [s * 158, 78], [s * 126, 112], [s * 66, 250], [s * 16, 330], [s * 20, 250]]);
    bodyPart(ctx, lp, F.lapel, L, { flash: fl, rimK: 1.2 });
    ctx.strokeStyle = rgba(lighten(F.lapel, 0.25), 0.5); ctx.lineWidth = 1.5; ctx.stroke(lp);
  }
  // pocket square
  fillPts(ctx, [[120, 152], [132, 132], [144, 148], [158, 134], [170, 156], [118, 160]], mixc(F.pocket, L.key, L.keyAmt * 0.3));
  // scarf behind neck
  const scC = mixc(mixc(F.scarf, L.key, L.keyAmt * 0.5), '#e8e0ff', fl * 0.3), scS = mixc(F.scarfSh, L.mul, 0.35);
  fillPts(ctx, [[-82, -16], [-66, -60], [0, -70], [66, -60], [82, -16], [58, -14], [0, -36], [-58, -14]], scS);
  // neck + head
  const hd = Object.assign({ x: 0, y: -170, s: 1, light: L, flash: fl, t: o.t }, o.head || {});
  drawNeck(ctx, HEAD.boss, hd, L);
  fillPts(ctx, [[-14, -8], [14, -8], [11, 22], [-11, 22]], mixc(F.tie, L.key, L.keyAmt * 0.3));
  for (const s of [-1, 1]) fillPts(ctx, [[s * 48, -20], [s * 8, -2], [s * 30, 44]], mixc(F.shirt, '#ffffff', 0.08));
  // scarf front bands
  for (const s of [-1, 1]) drawScarfBand(ctx, s, scC, scS, L, fl, o.scarfSway || 0);
  drawHead(ctx, HEAD.boss, Object.assign(hd, { cigar: o.cigar !== false, out: o.out }));
  // forearms & hands
  const hands = [['R', -1], ['L', 1]];
  for (const [k, s] of hands) {
    const h = o['hand' + k]; if (!h) continue;
    const el = o['elbow' + k] || [s * 226, 420];
    drawForearm(ctx, el[0], el[1], h.x, h.y, 50, 40, F.suit, F.cuff, L, fl);
  }
  for (const [k, s] of hands) {
    const h = o['hand' + k]; if (!h) continue;
    drawHand(ctx, { x: h.x, y: h.y, rot: h.rot ?? PI, s: h.s || 1, fs: h.fs, side: k === 'R' ? 1 : -1, pose: h.pose || 'rest', light: L, flash: fl, ring: k === 'R', glint: h.glint || 0 });
    if (k === 'R' && o.out) o.out.ring = toScreen(ctx, h.x, h.y);
  }
  ctx.restore();
}
function drawScarfBand(ctx, s, col, sh, L, fl, sway) {
  const cl = [[s * 58, -26], [s * 74, 70], [s * 84 + sway * 6, 190], [s * 82 + sway * 10, 300], [s * 80 + sway * 12, 352]];
  const Lp = [], Rp = [];
  cl.forEach((p, i) => {
    const q = cl[Math.min(i + 1, cl.length - 1)], r = cl[Math.max(i - 1, 0)];
    const dx = q[0] - r[0], dy = q[1] - r[1], l = Math.hypot(dx, dy) || 1, w = lerp(30, 26, i / 4);
    Lp.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]); Rp.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
  });
  const path = smoothPathOf(Lp.concat(Rp.reverse()), true, 0.8);
  ctx.fillStyle = col; ctx.fill(path);
  ctx.save(); ctx.clip(path); ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = rgba(L.mul, 0.55);
  const sideDark = (L.dir[0] <= 0 ? 1 : -1);
  ctx.fillRect(s * sideDark > 0 ? s * 84 : -2000, -100, s * sideDark > 0 ? 2000 : 2000 + s * 84, 600);
  ctx.strokeStyle = rgba(sh, 0.9); ctx.lineWidth = 2;
  for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(s * (58 + i * 6), -10); ctx.quadraticCurveTo(s * (74 + i * 8), 160, s * (68 + i * 10), 350); ctx.stroke(); }
  ctx.restore();
  // fringe
  const e = cl[cl.length - 1];
  ctx.strokeStyle = col; ctx.lineWidth = 2.2;
  for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(e[0] + i * 5, e[1] - 2); ctx.lineTo(e[0] + i * 5.3 + sway * 3, e[1] + 18); ctx.stroke(); }
  edgeFill(ctx, path, -L.rimDir[0] * L.rimW * 1.2, -L.rimDir[1] * L.rimW * 1.2, L.rim, L.rimA * 0.7);
}

/* ---------- STANDING, FRONT / BACK ----------
   origin = feet. o: x,y,s, who ('boss'|'guard'|...), view: 'front'|'back', turn (0 back..1 front, optional),
   arms: 'sides'|'behind'|'clasped'|'hat', head:{...}, light, flash, breath, hatSpin */
function drawStandingFront(ctx, o) {
  const L = o.light, who = o.who || 'boss', F = OUTFIT[who], HP = HEAD[o.headKey || who] || HEAD.ltA, fl = o.flash || 0;
  const turn = o.turn ?? (o.view === 'back' ? 0 : 1);
  const front = clamp((turn - 0.35) / 0.3), back = 1 - front;
  const wk = (o.build || 1) * (0.7 + 0.3 * Math.abs(Math.cos(turn * PI)));
  const br = (o.breath || 0) * 5;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s, o.s);
  const X = v => v * wk;
  // legs
  for (const s of [-1, 1]) {
    const leg = pathOf([[X(s * 168), -870], [X(s * 18), -870], [X(s * 34), -460], [X(s * 46), -70], [X(s * 114), -70], [X(s * 126), -460]]);
    bodyPart(ctx, leg, F.pants || F.suit, L, { flash: fl, rimK: 1.5 });
    ctx.strokeStyle = rgba(lighten(F.suit, 0.12), 0.4); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(s * 92), -860); ctx.lineTo(X(s * 80), -80); ctx.stroke();
    const shoe = smoothPathOf([[X(s * 122), -74], [X(s * 40), -74], [X(s * 34), -30], [X(s * 46), 0], [X(s * 132), 0], [X(s * 140), -34]], true, 0.7);
    ctx.fillStyle = F.shoe; ctx.fill(shoe); edgeFill(ctx, shoe, -L.rimDir[0] * 4, -L.rimDir[1] * 4, L.rim, 0.6);
  }
  // back-view arms (behind the back) are drawn after torso; side arms before torso
  const arms = o.arms || 'sides';
  const SLV = F.sleeve || F.suit;
  const sleeve = (s, pts) => bodyPart(ctx, pathOf(pts.map(([x, y]) => [X(s * x), y])), SLV, L, { flash: fl, rimK: 1.8 });
  if (arms === 'sides') for (const s of [-1, 1]) sleeve(s, [[230, -1532], [266, -1460], [272, -1250], [264, -1000], [252, -824], [196, -824], [200, -1000], [206, -1250], [212, -1400]]);
  else for (const s of [-1, 1]) sleeve(s, [[230, -1532], [266, -1460], [270, -1250], [264, -1090], [214, -1070], [212, -1250], [212, -1400]]);
  // torso
  const hem = F.coat ? -540 : -786, hw = F.coat ? 222 : 186;
  const torso = pathOf([[-60, -1592], [-130, -1574 - br], [-206, -1558 - br], [-234, -1530], [-228, -1420], [-198, -1300], [-178, -1100], [-172, -900], [-hw, hem], [hw, hem], [172, -900], [178, -1100], [198, -1300], [228, -1420], [234, -1530], [206, -1558 - br], [130, -1574 - br], [60, -1592]].map(([x, y]) => [X(x), y]));
  bodyPart(ctx, torso, F.suit, L, { flash: fl, rimK: 2.4 });
  if (F.stripe) { ctx.save(); ctx.clip(torso); ctx.strokeStyle = rgba(F.stripe, 0.3); ctx.lineWidth = 1.4; for (let x = -240; x <= 240; x += 24) { ctx.beginPath(); ctx.moveTo(X(x), -1600); ctx.lineTo(X(x * 0.82), -780); ctx.stroke(); } ctx.restore(); }
  const hd = Object.assign({ x: 0, y: -1594 - 121 * 1.12 - br * 0.5, s: 1.12, neckBot: 140, light: L, flash: fl, t: o.t }, o.head || {});
  // front details
  if (F.coat) { ctx.fillStyle = rgba('#000000', 0.35); ctx.fillRect(X(-176), -1090, X(352), 26); ctx.fillStyle = rgba(PAL.gold, 0.5); ctx.fillRect(X(-14), -1088, X(28), 22); }
  if (F.plain && front > 0.01) withAlpha(ctx, front, () => { ctx.strokeStyle = rgba('#000000', 0.5); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -1590); ctx.lineTo(0, hem); ctx.stroke(); fillPts(ctx, [[X(-70), -1600], [X(70), -1600], [X(56), -1560], [X(-56), -1560]], darken(F.suit, 0.3)); });
  if (front > 0.01 && !F.plain) withAlpha(ctx, front, () => {
    const C = clothCols(F.shirt, L, fl);
    fillPts(ctx, [[X(-46), -1590], [X(46), -1590], [X(20), -1330], [0, -1290], [X(-20), -1330]], C.lit);
    fillPts(ctx, [[X(-12), -1580], [X(12), -1580], [X(15), -1530], [X(9), -1300], [0, -1290], [X(-9), -1300], [X(-15), -1530]], mixc(F.tie, L.key, L.keyAmt * 0.3));
    for (const s of [-1, 1]) {
      const lp = pathOf([[s * 44, -1590], [s * 66, -1594], [s * 100, -1515], [s * 154, -1500], [s * 124, -1466], [s * 66, -1330], [s * 18, -1250], [s * 20, -1330]].map(([x, y]) => [X(x), y]));
      bodyPart(ctx, lp, F.lapel, L, { flash: fl, rimK: 1 });
    }
    // buttons
    ctx.fillStyle = darken(F.suit, 0.5);
    for (const [bx, by] of [[-42, -1180], [42, -1180], [-42, -1060], [42, -1060]]) { ctx.beginPath(); ctx.arc(X(bx), by, 6, 0, TAU); ctx.fill(); }
    if (F.pocket) fillPts(ctx, [[X(116), -1420], [X(128), -1440], [X(142), -1424], [X(156), -1438], [X(166), -1416], [X(114), -1412]], F.pocket);
  });
  if (back > 0.01) withAlpha(ctx, back, () => {
    ctx.strokeStyle = rgba('#000', 0.45); ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(0, -1560); ctx.lineTo(0, -900); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -900); ctx.lineTo(0, -786); ctx.stroke();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(X(s * 200), -1550); ctx.quadraticCurveTo(X(s * 170), -1450, X(s * 210), -1380); ctx.stroke(); }
    const col = pathOf([[-74, -1600], [74, -1600], [86, -1556], [0, -1540], [-86, -1556]].map(([x, y]) => [X(x), y]));
    bodyPart(ctx, col, F.lapel, L, { flash: fl, rimK: 1 });
  });
  // neck, scarf and head ordering
  if (who === 'boss') {
    const scC = mixc(mixc(F.scarf, L.key, L.keyAmt * 0.5), '#e8e0ff', fl * 0.3), scS = mixc(F.scarfSh, L.mul, 0.35);
    drawNeck(ctx, HP, hd, L);
    fillPts(ctx, [[-84, -1580], [-70, -1626], [0, -1636], [70, -1626], [84, -1580], [60, -1576], [0, -1596], [-60, -1576]].map(([x, y]) => [X(x), y]), back > 0.5 ? scC : scS);
    if (front > 0.01) withAlpha(ctx, front, () => { ctx.save(); ctx.translate(0, -1570); ctx.scale(wk, 1); for (const s of [-1, 1]) drawScarfBand(ctx, s, scC, scS, L, fl, 0); ctx.restore(); });
  } else drawNeck(ctx, HP, hd, L);
  drawHead(ctx, HP, Object.assign(hd, { out: o.out }));
  // arms in front / behind the back
  const sk = HP.skin;
  if (arms === 'behind' && back > 0.01) withAlpha(ctx, back, () => {
    for (const s of [-1, 1]) drawForearm(ctx, X(s * 240), -1086, X(s * 40), -1000, 50, 40, SLV, F.cuff, L, fl);
    drawHand(ctx, { x: X(-24), y: -998, rot: -PI / 2 + 0.25, s: 0.95, side: -1, pose: 'grip', light: L, flash: fl, skin: sk });
    drawHand(ctx, { x: X(30), y: -1004, rot: PI / 2 - 0.15, s: 0.95, side: 1, pose: 'rest', light: L, flash: fl, ring: who === 'boss', glint: o.ringGlint || 0, skin: sk });
  });
  if (arms === 'clasped') {
    for (const s of [-1, 1]) drawForearm(ctx, X(s * 238), -1090, X(s * 40), -940, 50, 40, SLV, F.cuff, L, fl);
    drawHand(ctx, { x: X(-30), y: -936, rot: 0.9, s: 0.95, side: 1, pose: 'grip', light: L, flash: fl, skin: sk });
    drawHand(ctx, { x: X(30), y: -930, rot: -0.9, s: 0.95, side: -1, pose: 'rest', light: L, flash: fl, skin: sk });
  }
  if (arms === 'sides') for (const s of [-1, 1]) drawHand(ctx, { x: X(s * 224), y: -812, rot: PI + s * 0.08, s: 0.95, side: s < 0 ? 1 : -1, pose: 'rest', light: L, flash: fl, skin: sk });
  if (arms === 'hold') {   // both forearms up, hands in front of the chest; o.prop(ctx) draws the held object between
    const hy = o.holdY ?? -1180, hx = o.holdX ?? 96;
    for (const s of [-1, 1]) drawForearm(ctx, X(s * 236), -1100, X(s * hx), hy + 20, 48, 38, SLV, F.cuff, L, fl);
    if (o.prop && !o.propFront) o.prop(ctx, { x: 0, y: hy - 40 });
    for (const s of [-1, 1]) drawHand(ctx, { x: X(s * hx), y: hy + 10, rot: -s * 0.35, s: 0.92, side: s < 0 ? -1 : 1, pose: o.propFront ? 'grip' : 'hold', light: L, flash: fl, skin: sk });
    if (o.prop && o.propFront) o.prop(ctx, { x: 0, y: hy - 40 });   // object held in front of the hands (e.g. a photo shown to camera)
    if (o.out) { o.out.handL = toScreen(ctx, X(hx), hy + 10); o.out.handR = toScreen(ctx, X(-hx), hy + 10); }
  }
  if (arms === 'hat') {
    const sp = o.hatSpin || 0;
    for (const s of [-1, 1]) drawForearm(ctx, X(s * 236), -1100, X(s * 70), -1210, 48, 38, F.suit, F.cuff, L, fl);
    // hat held at the chest, rotating nervously
    ctx.save(); ctx.translate(0, -1235); ctx.rotate(Math.sin(sp) * 0.18);
    const hb = new Path2D(); hb.ellipse(0, 0, 150, 34 + Math.cos(sp) * 10, 0, 0, TAU);
    ctx.fillStyle = mixc('#2a2426', L.key, L.keyAmt * 0.2); ctx.fill(hb);
    const hc = pathOf([[-92, 0], [-84, -84], [-30, -100], [30, -100], [84, -84], [92, 0]]);
    ctx.fillStyle = mixc('#332c2e', L.key, L.keyAmt * 0.2); ctx.fill(hc);
    ctx.fillStyle = '#1a1416'; ctx.fillRect(-92, -24, 184, 18);
    edgeFill(ctx, hc, -L.rimDir[0] * 5, -L.rimDir[1] * 5, L.rim, L.rimA);
    ctx.restore();
    for (const s of [-1, 1]) drawHand(ctx, { x: X(s * 84), y: -1212, rot: s * 1.35, s: 0.92, side: s < 0 ? -1 : 1, pose: 'grip', light: L, flash: fl, skin: sk });
  }
  ctx.restore();
}

/* ---------- SIDE FIGURE (profile; stand / walk / sit / reach / bow) ----------
   origin = ground under hips. Faces +x when face=1.
   o: x,y,s, who, face, sit(0..1), seatH, phase, walk(0..1), lean, bow(0..1),
      hand:{x,y} target for near hand (figure coords) or null, carry:'envelope'|'folder'|null,
      headTurn (0 profile .. 1 toward camera), head:{pitch,...}, light, flash */
function drawSideFigure(ctx, o) {
  const L = o.light, who = o.who || 'ltA', F = OUTFIT[who] || OUTFIT.ltA, HP = HEAD[o.headKey || who] || HEAD.ltA, fl = o.flash || 0;
  const face = o.face || 1, sit = o.sit || 0, wa = o.walk || 0, ph = o.phase || 0, kn = o.kneel || 0;
  const SL = F.sleeve || F.suit, PN = F.pants || F.suit;   // optional shirt sleeves / trousers (vest outfits)
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s * face, o.s);
  const Lf = face > 0 ? L : Object.assign({}, L, { dir: [-L.dir[0], L.dir[1], L.dir[2]], rimDir: [-L.rimDir[0], L.rimDir[1]] });
  const TH = 430, SH = 430;
  let hipH = lerp(880, o.seatH || 330, sit) - wa * 10 * Math.abs(Math.cos(ph));
  if (kn > 0) {   // kneeling: thighs near vertical, shins flat on the ground behind; the lowest joint rests on the ground
    const ta = 0.12 * kn, sa = ta - (ta + (PI / 2) * kn);
    hipH = Math.cos(ta) * TH + Math.max(0, Math.cos(sa)) * SH + lerp(20, 46, kn);
  }
  const hip = [0, -hipH];
  const legs = [];
  for (const k of [0, 1]) {
    const sgn = k ? -1 : 1;
    let ta = sit * (PI / 2) * 0.98 + wa * 0.42 * Math.sin(ph) * sgn;
    let ka = sit * (PI / 2) * 0.98 + wa * (0.12 + 0.5 * Math.max(0, Math.sin(ph + (k ? PI : 0) - 0.9)));
    if (o.climb != null) {   // ladder climbing: knees lift alternately, shins stay near vertical on the rungs
      const u = 0.5 + 0.5 * Math.sin(o.climb + (k ? PI : 0));
      ta = 0.1 + 0.8 * u; ka = ta + 0.42;
    }
    if (kn > 0) { ta = lerp(ta, 0.12, kn); ka = lerp(ka, 0.12 + PI / 2, kn); }
    // anatomy guard: when both legs would share one pose (sitting or standing still) the far leg
    // is set apart so it never hides exactly behind the near one (no "one-legged" characters)
    if (k === 1 && o.climb == null) {
      const still = 1 - clamp(wa * 3);
      ta += still * lerp(-0.16, 0.0, sit);        // standing: far foot clearly behind
      ka += still * lerp(-0.06, -0.32, sit);      // seated: far shin angled forward
    }
    const hx0 = k === 1 ? -34 : 0;
    const knee = [hip[0] + hx0 + Math.sin(ta) * TH, hip[1] + Math.cos(ta) * TH];
    const sa = ta - ka;
    const ankle = [knee[0] + Math.sin(sa) * SH, knee[1] + Math.cos(sa) * SH];
    legs.push({ knee, ankle, sa, far: k === 1, hx0 });
  }
  const drawLeg = (lg, dk) => {
    const C = dk ? mixc(PN, '#000', 0.35) : PN;
    bodyPart(ctx, limbPath(hip[0] + lg.hx0, hip[1], lg.knee[0], lg.knee[1], 84, 62), C, Lf, { flash: fl, rimK: 1.4 });
    bodyPart(ctx, limbPath(lg.knee[0], lg.knee[1], lg.ankle[0], lg.ankle[1], 62, 52), C, Lf, { flash: fl, rimK: 1.4 });
    if (kn > 0) {   // foot follows the shin as he kneels (toes point back, sole up)
      const phi = Math.atan2(Math.cos(lg.sa), Math.sin(lg.sa)), fa = phi - (PI / 2) * (1 - kn);
      ctx.save(); ctx.translate(lg.ankle[0], lg.ankle[1]); ctx.rotate(fa);
      const shk = smoothPathOf([[-40, -26], [40, -22], [104, 6], [98, 26], [-44, 26]], true, 0.6);
      ctx.fillStyle = F.shoe; ctx.fill(shk); edgeFill(ctx, shk, -Lf.rimDir[0] * 4, -Lf.rimDir[1] * 4, Lf.rim, 0.6);
      ctx.restore(); return;
    }
    const a = lg.ankle, ca = Math.cos(lg.sa * 0.3), sh = smoothPathOf([[a[0] - 40, a[1] - 26], [a[0] + 40, a[1] - 22], [a[0] + 104 * ca, a[1] + 6], [a[0] + 98, a[1] + 26], [a[0] - 44, a[1] + 26]], true, 0.6);
    ctx.fillStyle = F.shoe; ctx.fill(sh); edgeFill(ctx, sh, -Lf.rimDir[0] * 4, -Lf.rimDir[1] * 4, Lf.rim, 0.6);
  };
  const pass = o.pass || 'all';
  if (pass !== 'upper') drawLeg(legs[1], true);
  if (pass === 'legs') { drawLeg(legs[0], false); ctx.restore(); return; }
  // torso (rotated about hip)
  const lean = (o.lean || 0) + (o.bow || 0) * 0.32 + sit * 0.06;
  ctx.save(); ctx.translate(hip[0], hip[1]); ctx.rotate(lean);
  // far arm swing
  const swing = wa * 0.32 * Math.sin(ph);
  const sh0 = [6, -470];
  const farEl = [sh0[0] + Math.sin(-swing) * 280, sh0[1] + Math.cos(-swing) * 280];
  const farWr = [farEl[0] + Math.sin(-swing + 0.25) * 260, farEl[1] + Math.cos(-swing + 0.25) * 260];
  // figure coords → torso-local coords (the frame this block draws in)
  const toLocal = (q) => { const hx = q.x, hy = q.y + hipH, c = Math.cos(-lean), s = Math.sin(-lean); return [hx * c - hy * s, hx * s + hy * c]; };
  // keep hand targets within arm's reach so limbs never stretch
  const reach = (p, sx) => { const dx = p[0] - sx, dy = p[1] - sh0[1], d = Math.hypot(dx, dy), m = 530; return d > m ? [sx + dx / d * m, sh0[1] + dy / d * m] : p; };
  if (o.farHand) {   // far arm reaching a target (two-handed grips, climbing, cheering)
    const fw = reach(toLocal(o.farHand), sh0[0] - 18), fe = ik2(sh0[0] - 18, sh0[1], fw[0], fw[1], 280, 270, 1), dk = mixc(SL, '#000', 0.4);
    bodyPart(ctx, limbPath(sh0[0] - 18, sh0[1], fe[0], fe[1], 56, 50), dk, Lf, { flash: fl, rimK: 1.2 });
    drawForearm(ctx, fe[0], fe[1], fw[0], fw[1], 50, 42, dk, F.cuff, Lf, fl);
    drawHand(ctx, { x: fw[0], y: fw[1], rot: Math.atan2(fw[1] - fe[1], fw[0] - fe[0]) + PI / 2, s: 0.95, side: 1, pose: o.farPose || 'grip', light: Object.assign({}, Lf, { keyAmt: Lf.keyAmt * 0.5 }), flash: fl, skin: mixc(HP.skin, '#000', 0.3) });
  } else if (o.hand && sit > 0.5) {   // seated with the near hand placed: the far forearm rests beside it
    const fw = reach(toLocal({ x: o.hand.x - 70, y: o.hand.y + 12 }), sh0[0] - 18), fe = ik2(sh0[0] - 18, sh0[1], fw[0], fw[1], 280, 270, 1), dk = mixc(SL, '#000', 0.4);
    bodyPart(ctx, limbPath(sh0[0] - 18, sh0[1], fe[0], fe[1], 56, 50), dk, Lf, { flash: fl, rimK: 1.2 });
    drawForearm(ctx, fe[0], fe[1], fw[0], fw[1], 50, 42, dk, F.cuff, Lf, fl);
    drawHand(ctx, { x: fw[0], y: fw[1], rot: Math.atan2(fw[1] - fe[1], fw[0] - fe[0]) + PI / 2, s: 0.95, side: 1, pose: 'rest', light: Object.assign({}, Lf, { keyAmt: Lf.keyAmt * 0.5 }), flash: fl, skin: mixc(HP.skin, '#000', 0.3) });
  } else if (sit > 0.5) {   // seated, hands free: the far hand rests on the thigh
    const fw = reach(toLocal({ x: 170, y: -hipH - 40 }), sh0[0] - 18), fe = ik2(sh0[0] - 18, sh0[1], fw[0], fw[1], 280, 270, 1), dk = mixc(SL, '#000', 0.4);
    bodyPart(ctx, limbPath(sh0[0] - 18, sh0[1], fe[0], fe[1], 56, 50), dk, Lf, { flash: fl, rimK: 1.2 });
    drawForearm(ctx, fe[0], fe[1], fw[0], fw[1], 50, 42, dk, F.cuff, Lf, fl);
    drawHand(ctx, { x: fw[0], y: fw[1], rot: Math.atan2(fw[1] - fe[1], fw[0] - fe[0]) + PI / 2, s: 0.95, side: 1, pose: 'rest', light: Object.assign({}, Lf, { keyAmt: Lf.keyAmt * 0.5 }), flash: fl, skin: mixc(HP.skin, '#000', 0.3) });
  } else {   // otherwise the far arm hangs (or swings) at his side — it is never simply omitted
    const dk = mixc(SL, '#000', 0.4);
    bodyPart(ctx, limbPath(sh0[0], sh0[1], farEl[0], farEl[1], 56, 50), dk, Lf, { flash: fl, rimK: 1.2 }); drawForearm(ctx, farEl[0], farEl[1], farWr[0], farWr[1], 50, 42, dk, F.cuff, Lf, fl);
    drawHand(ctx, { x: farWr[0], y: farWr[1], rot: Math.atan2(farWr[1] - farEl[1], farWr[0] - farEl[0]) + PI / 2, s: 0.95, side: 1, pose: 'rest', light: Object.assign({}, Lf, { keyAmt: Lf.keyAmt * 0.5 }), flash: fl, skin: mixc(HP.skin, '#000', 0.3) });
  }
  const torso = smoothPathOf([[-96, 80], [-100, -200], [-92, -440], [-54, -530], [36, -540], [96, -470], [112, -300], [100, -120], [108, 80]], true, 0.5);
  bodyPart(ctx, torso, F.suit, Lf, { flash: fl, rimK: 2.2, split: 10 });
  // lapel / shirt sliver at the front
  if (!F.plain) {
    fillPts(ctx, [[46, -526], [84, -474], [96, -330], [80, -350], [56, -470]], mixc(F.shirt, Lf.key, Lf.keyAmt * 0.3));
    fillPts(ctx, [[62, -500], [86, -462], [94, -360], [88, -300], [76, -360]], mixc(F.tie, Lf.key, 0.1));
    strokePts(ctx, [[40, -520], [76, -420], [92, -260]], rgba(lighten(F.lapel, 0.25), 0.6), 3, false, true);
  }
  if (F.coat && sit < 0.5) {   // trench-coat skirt hanging over the thighs
    const sk = smoothPathOf([[-98, 40], [104, 40], [128 + swing * -40, 400], [-112 + swing * -30, 410]], true, 0.4);
    bodyPart(ctx, sk, F.suit, Lf, { flash: fl, rimK: 1.6, split: 10 });
    ctx.fillStyle = rgba('#000000', 0.35); ctx.fillRect(-98, -200, 210, 22);
  }
  if (who === 'boss') {
    const scC = mixc(mixc(OUTFIT.boss.scarf, Lf.key, Lf.keyAmt * 0.5), '#e8e0ff', fl * 0.3);
    const sc = smoothPathOf([[30, -540], [72, -520], [100, -400], [104, -250], [80, -250], [74, -400], [40, -500]], true, 0.6);
    ctx.fillStyle = scC; ctx.fill(sc);
    ctx.save(); ctx.clip(sc); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(Lf.mul, 0.5); ctx.fillRect(40, -600, 200, 400); ctx.restore();
  }
  // head
  const ht = o.headTurn ?? 0.3;
  const hd = Object.assign({ x: 22, y: -548 - 121 * 1.1, s: 1.1, neckBot: 150, yaw: PI / 2 - ht * 1.1, light: Lf, flash: fl, t: o.t }, o.head || {});
  hd.pitch = (hd.pitch || 0) + (o.bow || 0) * 0.42;
  drawNeck(ctx, HP, hd, Lf);
  fillPts(ctx, [[-46, -560], [38, -566], [60, -520], [-40, -510]], mixc(F.lapel, Lf.key, 0.1));
  drawHead(ctx, HP, Object.assign(hd, { out: o.out, cigar: o.cigar }));
  if (o.prop) o.prop(ctx, toLocal);   // held object, drawn between the body and the near arm
  // near arm
  let wr, el;
  if (o.hand) {
    const hx = o.hand.x, hy = o.hand.y + hipH;          // figure → torso-local (approx, ignoring lean)
    const c = Math.cos(-lean), s = Math.sin(-lean), [lx, ly] = reach([hx * c - (hy) * s, hx * s + (hy) * c], sh0[0]);
    el = ik2(sh0[0], sh0[1], lx, ly, 280, 270, 1);
    wr = [lx, ly];
  } else if (sit > 0.5) {   // seated, hand free: rest it on the thigh instead of hanging through the seat
    wr = reach(toLocal({ x: 230, y: -hipH - 50 }), sh0[0]); el = ik2(sh0[0], sh0[1], wr[0], wr[1], 280, 270, 1);
  } else { el = [sh0[0] + Math.sin(swing) * 280, sh0[1] + Math.cos(swing) * 280]; wr = [el[0] + Math.sin(swing + 0.3) * 260, el[1] + Math.cos(swing + 0.3) * 260]; }
  bodyPart(ctx, limbPath(sh0[0], sh0[1], el[0], el[1], 60, 52), SL, Lf, { flash: fl, rimK: 1.8 });
  drawForearm(ctx, el[0], el[1], wr[0], wr[1], 52, 42, SL, F.cuff, Lf, fl);
  const ang = Math.atan2(wr[1] - el[1], wr[0] - el[0]) + PI / 2;
  if (o.carry === 'envelope') drawEnvelope(ctx, wr[0] + 40, wr[1] - 10, 190, 110, ang - PI / 2 + 0.1, Lf, true);
  if (o.carry === 'folder') drawFolderSide(ctx, wr[0] + 30, wr[1] - 6, ang - PI / 2, Lf);
  if (o.carry === 'torch') {   // small flashlight held forward, along the forearm
    const dx = wr[0] - el[0], dy = wr[1] - el[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    const p0 = [wr[0] - ux * 10, wr[1] - uy * 10], p1 = [wr[0] + ux * 120, wr[1] + uy * 120];
    ctx.fillStyle = '#16141a'; ctx.fill(quad(p0[0], p0[1], p1[0], p1[1], 14, 18));
    ctx.fillStyle = '#fff4d8'; ctx.beginPath(); ctx.arc(p1[0], p1[1], 15, 0, TAU); ctx.fill();
    if (o.out) { o.out.torch = toScreen(ctx, p1[0], p1[1]); const q = toScreen(ctx, p1[0] + ux * 100, p1[1] + uy * 100); o.out.torchDir = Math.atan2(q.y - o.out.torch.y, q.x - o.out.torch.x); }
  }
  if (o.out) { o.out.hand = toScreen(ctx, wr[0], wr[1]); o.out.elbow = toScreen(ctx, el[0], el[1]); }
  drawHand(ctx, { x: wr[0], y: wr[1], rot: ang, s: 0.95, side: -1, pose: o.carry ? 'grip' : (o.handPose || 'rest'), light: Lf, flash: fl, skin: HP.skin, ring: who === 'boss', glint: o.ringGlint || 0 });
  ctx.restore();
  if (pass !== 'upper') drawLeg(legs[0], false);
  if (sit > 0.5) { // jacket skirt over the thighs
    const kn = legs[0].knee;
    bodyPart(ctx, pathOf([[hip[0] - 70, hip[1] - 40], [hip[0] + 120, hip[1] - 50], [lerp(hip[0], kn[0], 0.5), hip[1] + 40], [hip[0] - 60, hip[1] + 40]]), F.suit, Lf, { flash: fl, rimK: 1.4 });
  }
  ctx.restore();
}

/* ---------- PROPS ---------- */
function drawEnvelope(ctx, x, y, w, h, rot, L, sealed = true, k = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
  const base = mixc(mixc('#e2d3b0', L.key, L.keyAmt * 0.4), '#05030a', clamp(-L.dir[2]) * 0.4);
  const p = pathOf([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]);
  ctx.fillStyle = base; ctx.fill(p);
  ctx.strokeStyle = rgba('#5a4a30', 0.6); ctx.lineWidth = 1.5 * k;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(0, h * 0.08); ctx.lineTo(w / 2, -h / 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(-w * 0.1, -h * 0.02); ctx.moveTo(w / 2, h / 2); ctx.lineTo(w * 0.1, -h * 0.02); ctx.stroke();
  ctx.save(); ctx.clip(p); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(L.mul, 0.5); ctx.fillRect(L.dir[0] <= 0 ? w * 0.1 : -w, -h, w, h * 2); ctx.restore();
  if (sealed) {
    ctx.fillStyle = '#8a0c16'; ctx.beginPath();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU, r = (i % 2 ? 15 : 17) * k * (w / 190); ctx.lineTo(Math.cos(a) * r, h * 0.08 + Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b01a24'; ctx.beginPath(); ctx.arc(0, h * 0.08, 10 * k * (w / 190), 0, TAU); ctx.fill();
    decoEmblem(ctx, 0, h * 0.08 - 5 * k * (w / 190), 9 * k * (w / 190), 'rgba(60,0,8,0.85)', 1.3 * k * (w / 190));
  }
  edgeFill(ctx, p, -L.rimDir[0] * 2.5, -L.rimDir[1] * 2.5, L.rim, L.rimA * 0.6);
  ctx.restore();
}
function drawFolderSide(ctx, x, y, rot, L) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const p = pathOf([[-110, -12], [110, -12], [110, 12], [-110, 12]]);
  ctx.fillStyle = mixc('#4a1420', L.key, L.keyAmt * 0.3); ctx.fill(p);
  ctx.fillStyle = PAL.gold; ctx.fillRect(96, -12, 14, 24);
  edgeFill(ctx, p, -L.rimDir[0] * 3, -L.rimDir[1] * 3, L.rim, 0.7);
  ctx.restore();
}
/** top-down leather folder; open 0..1 */
function drawFolderTop(ctx, x, y, w, h, rot, open, L, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const leather = mixc('#4c1624', L.key, L.keyAmt * 0.35);
  const back = pathOf([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-w / 2 + 14, -h / 2 + 18, w, h);
  ctx.fillStyle = leather; ctx.fill(back);
  if (open > 0.01) {
    // papers inside
    const pw = w * 0.92, ph = h * 0.92;
    ctx.fillStyle = mixc('#e8dcc0', L.key, L.keyAmt * 0.4); ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    ctx.save(); ctx.translate(-pw / 2, -ph / 2);
    // typed lines (abstract, unreadable)
    ctx.fillStyle = 'rgba(40,30,30,0.55)';
    for (let i = 0; i < 18; i++) {
      const ly = 40 + i * (ph - 80) / 18, lw = (pw - 80) * (0.55 + hash(i * 3 + 1) * 0.45);
      if (i > 2 && i < 9) continue;
      for (let x0 = 40; x0 < 40 + lw; x0 += 18 + hash(i * 31 + x0) * 26) ctx.fillRect(x0, ly, 10 + hash(x0 + i) * 14, 3);
    }
    // photograph
    ctx.save(); ctx.translate(pw * 0.55, ph * 0.2); ctx.rotate(0.06);
    ctx.fillStyle = '#efe8d8'; ctx.fillRect(-6, -6, pw * 0.38 + 12, ph * 0.26 + 12);
    const pg = ctx.createLinearGradient(0, 0, 0, ph * 0.26); pg.addColorStop(0, '#6a6470'); pg.addColorStop(1, '#2a2630');
    ctx.fillStyle = pg; ctx.fillRect(0, 0, pw * 0.38, ph * 0.26);
    ctx.fillStyle = '#141018';
    ctx.fillRect(pw * 0.03, ph * 0.08, pw * 0.08, ph * 0.18); ctx.fillRect(pw * 0.25, ph * 0.03, pw * 0.1, ph * 0.23);
    ctx.beginPath(); ctx.arc(pw * 0.18, ph * 0.12, ph * 0.035, 0, TAU); ctx.fill();
    ctx.fill(pathOf([[pw * 0.14, ph * 0.26], [pw * 0.15, ph * 0.15], [pw * 0.21, ph * 0.15], [pw * 0.22, ph * 0.26]]));
    ctx.restore();
    // red ink mark (circle + sunburst emblem, no lettering)
    ctx.strokeStyle = 'rgba(150,20,30,0.75)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(pw * 0.22, ph * 0.33, 36, 0, TAU); ctx.stroke();
    decoEmblem(ctx, pw * 0.22, ph * 0.33 - 10, 26, 'rgba(150,20,30,0.75)', 3);
    ctx.restore();
  }
  // cover flap rotating open (scaleX collapse)
  const fo = Ease.inOutCubic(open);
  if (fo < 0.999) {
    ctx.save(); ctx.translate(-w / 2, 0); ctx.scale(Math.cos(fo * PI), 1);
    const flap = pathOf([[0, -h / 2], [w, -h / 2], [w, h / 2], [0, h / 2]]);
    ctx.fillStyle = fo < 0.5 ? leather : mixc(leather, '#000', 0.4); ctx.fill(flap);
    if (fo < 0.5) {
      ctx.strokeStyle = rgba(PAL.gold, 0.6); ctx.lineWidth = 3; ctx.strokeRect(18, -h / 2 + 18, w - 36, h - 36);
      ctx.fillStyle = '#8a0c16'; ctx.beginPath(); ctx.arc(w * 0.82, 0, 22, 0, TAU); ctx.fill();
      ctx.fillStyle = '#b01a24'; ctx.beginPath(); ctx.arc(w * 0.82, 0, 14, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  ctx.fillStyle = PAL.gold;
  for (const [cx, cy] of [[w / 2, -h / 2], [w / 2, h / 2]]) ctx.fill(pathOf([[cx, cy], [cx - 26 * Math.sign(cx), cy], [cx, cy - 26 * Math.sign(cy)]]));
  ctx.restore();
}
function drawAshtray(ctx, x, y, k, L) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(10, 22, 96, 26, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = mixc('#3a3448', L.key, L.keyAmt * 0.3); ctx.beginPath(); ctx.ellipse(0, 0, 90, 30, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = mixc('#1a1622', L.key, 0.05); ctx.beginPath(); ctx.ellipse(0, -2, 68, 20, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba('#d8d0ff', 0.25); ctx.beginPath(); ctx.ellipse(-30, -10, 30, 5, -0.1, 0, TAU); ctx.fill();
  for (let i = 0; i < 6; i++) { ctx.strokeStyle = rgba('#ffffff', 0.12); ctx.lineWidth = 1; ctx.beginPath(); const a = (i / 6) * PI; ctx.moveTo(Math.cos(a) * 70, Math.sin(a) * 22); ctx.lineTo(Math.cos(a) * 90, Math.sin(a) * 30); ctx.stroke(); }
  ctx.restore();
}
/** cigar resting at angle; returns ember screen position via out */
function drawRestingCigar(ctx, x, y, ang, len, k, t, L, out) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k);
  const r = 7;
  ctx.fillStyle = mixc('#4a2a18', L.key, L.keyAmt * 0.5); ctx.fillRect(0, -r, len * 0.88, r * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, len * 0.88, r);
  ctx.fillStyle = '#8a1c22'; ctx.fillRect(len * 0.12, -r, len * 0.08, r * 2);
  ctx.fillStyle = '#c8a050'; ctx.fillRect(len * 0.14, -r, len * 0.02, r * 2);
  ctx.fillStyle = '#8a837c'; ctx.fillRect(len * 0.88, -r, len * 0.1, r * 2);
  const fl = 0.7 + 0.3 * Math.sin(t * 6.1) * snz(t * 2.3, 2);
  ctx.fillStyle = '#ff5a1a'; ctx.beginPath(); ctx.ellipse(len * 0.98, 0, 3, r * 0.9, 0, 0, TAU); ctx.fill();
  glow(ctx, len, 0, 30, '#ff6a20', 0.5 * fl);
  if (out) out.ember = toScreen(ctx, len, 0);
  ctx.restore();
}
function drawWhiskey(ctx, x, y, k, L, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  const g = pathOf([[-34, -70], [34, -70], [30, 0], [-30, 0]]);
  ctx.fillStyle = rgba('#d8d0ff', 0.08); ctx.fill(g);
  ctx.fillStyle = rgba('#c87a2a', 0.75); ctx.fill(pathOf([[-32, -34], [32, -34], [30, -2], [-30, -2]]));
  glow(ctx, 0, -20, 40, '#e0902a', 0.3);
  ctx.strokeStyle = rgba('#e8e0ff', 0.4); ctx.lineWidth = 2; ctx.stroke(g);
  ctx.fillStyle = rgba('#ffffff', 0.35); ctx.fillRect(-26, -64, 5, 58);
  ctx.restore();
}
function drawCandlestickPhone(ctx, x, y, k, L) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  const c = mixc('#0e0c10', L.key, 0.08);
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.ellipse(0, 0, 48, 14, 0, 0, TAU); ctx.fill();
  ctx.fillRect(-9, -190, 18, 190);
  ctx.beginPath(); ctx.ellipse(0, -200, 26, 20, 0, 0, TAU); ctx.fill();
  ctx.fillRect(14, -150, 40, 10); ctx.fillRect(48, -175, 10, 60);
  ctx.beginPath(); ctx.ellipse(53, -110, 14, 18, 0, 0, TAU); ctx.fill();
  edgeFill(ctx, pathOf([[-9, -190], [9, -190], [9, 0], [-9, 0]]), -L.rimDir[0] * 3 - L.dir[0] * 3, -L.rimDir[1] * 3, mixc(L.key, '#ffffff', 0.3), 0.6);
  ctx.restore();
}
/** Art-Deco desk lamp: stepped base, brass stem, glowing dome shade. returns bulb pos */
function drawDecoLamp(ctx, x, y, k, L, t, glowA = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  const brass = mixc('#8a6428', '#ffd88a', 0.25), brassDk = '#3a2810';
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(10, 6, 110, 20, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = brassDk; ctx.fillRect(-90, -24, 180, 24); ctx.fillStyle = brass; ctx.fillRect(-70, -44, 140, 22); ctx.fillRect(-46, -60, 92, 18);
  ctx.fillStyle = brassDk; ctx.fillRect(-10, -260, 20, 205);
  ctx.fillStyle = brass; ctx.fillRect(-10, -260, 7, 205);
  for (const yy of [-120, -180, -230]) { ctx.fillStyle = brass; ctx.fillRect(-16, yy, 32, 8); }
  // shade (amber glass dome, stepped)
  const shade = pathOf([[-150, -250], [-120, -320], [-60, -350], [60, -350], [120, -320], [150, -250]]);
  const fl = 0.92 + 0.08 * snz(t * 5, 3);
  const sg = ctx.createLinearGradient(0, -350, 0, -250);
  sg.addColorStop(0, '#5a3010'); sg.addColorStop(0.6, '#c8781e'); sg.addColorStop(1, '#ffd27a');
  ctx.fillStyle = sg; ctx.fill(shade);
  ctx.strokeStyle = rgba('#3a1a08', 0.8); ctx.lineWidth = 3;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 40, -250); ctx.lineTo(i * 18, -350); ctx.stroke(); }
  ctx.fillStyle = brass; ctx.fillRect(-156, -254, 312, 8);
  // underside glow
  ctx.fillStyle = rgba('#fff2c8', 0.95 * glowA * fl); ctx.beginPath(); ctx.ellipse(0, -246, 142, 14, 0, 0, TAU); ctx.fill();
  glow(ctx, 0, -230, 300, '#ffb34a', 0.55 * glowA * fl);
  glow(ctx, 0, -300, 150, '#ffcc66', 0.3 * glowA * fl);
  const out = toScreen(ctx, 0, -240);
  ctx.restore();
  return out;
}
/** top-down ledger: two pages + optional turning page (turn 0..1) */
function drawLedgerTop(ctx, x, y, w, h, rot, turn, L, k = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const paper = mixc('#e3d5b2', L.key, L.keyAmt * 0.45), paperSh = mixc('#b9a67e', L.mul, 0.4);
  // cover & page stack
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-w / 2 + 16, -h / 2 + 22, w + 10, h + 8);
  ctx.fillStyle = '#3a1218'; ctx.fillRect(-w / 2 - 14, -h / 2 - 10, w + 28, h + 20);
  ctx.fillStyle = paperSh; ctx.fillRect(-w / 2 - 4, -h / 2 - 2, w + 8, h + 6);
  const page = (side, seed) => {
    const px = side < 0 ? -w / 2 : 0;
    ctx.fillStyle = paper; ctx.fillRect(px, -h / 2, w / 2, h);
    ledgerLines(ctx, px, -h / 2, w / 2, h, seed);
  };
  page(-1, 1); page(1, turn > 0.5 ? 3 : 2);
  // gutter shadow
  const gg = ctx.createLinearGradient(-30, 0, 30, 0);
  gg.addColorStop(0, 'rgba(60,30,20,0)'); gg.addColorStop(0.5, 'rgba(40,20,10,0.5)'); gg.addColorStop(1, 'rgba(60,30,20,0)');
  ctx.fillStyle = gg; ctx.fillRect(-30, -h / 2, 60, h);
  if (turn > 0 && turn < 1) {
    // turning page: right page lifts and sweeps over to the left, foreshortened in X with a curl
    const a = Ease.inOutSine(turn), sx = Math.cos(a * PI);
    const pw = (w / 2) * sx, lift = Math.sin(a * PI);
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,' + (0.35 * lift).toFixed(3) + ')';
    ctx.fillRect(Math.min(0, pw) + 20 * lift, -h / 2 + 30 * lift, Math.abs(pw), h);
    const curl = 60 * lift * Math.sign(sx || 1);
    const pp = new Path2D();
    pp.moveTo(0, -h / 2); pp.lineTo(pw, -h / 2 - 8 * lift); pp.quadraticCurveTo(pw + curl, 0, pw, h / 2 + 8 * lift); pp.lineTo(0, h / 2); pp.closePath();
    ctx.fillStyle = sx > 0 ? paper : mixc(paper, '#a8946a', 0.25); ctx.fill(pp);
    ctx.save(); ctx.clip(pp); ctx.globalAlpha = 0.6 * Math.abs(sx); ledgerLines(ctx, Math.min(0, pw), -h / 2, Math.abs(pw), h, sx > 0 ? 2 : 4); ctx.restore();
    const shg = ctx.createLinearGradient(0, 0, pw, 0); shg.addColorStop(0, 'rgba(60,30,10,0.35)'); shg.addColorStop(1, 'rgba(255,240,200,' + (0.25 * lift).toFixed(3) + ')');
    ctx.fillStyle = shg; ctx.fill(pp);
    ctx.restore();
  }
  ctx.restore();
}
function ledgerLines(ctx, x, y, w, h, seed) {
  ctx.save();
  ctx.strokeStyle = 'rgba(70,90,120,0.28)'; ctx.lineWidth = 1.2;
  for (let yy = y + 60; yy < y + h - 20; yy += 26) { ctx.beginPath(); ctx.moveTo(x + 14, yy); ctx.lineTo(x + w - 14, yy); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(150,40,40,0.45)';
  for (const f of [0.14, 0.62, 0.8]) { ctx.beginPath(); ctx.moveTo(x + w * f, y + 30); ctx.lineTo(x + w * f, y + h - 16); ctx.stroke(); }
  // handwritten-looking marks (abstract squiggles, deliberately unreadable)
  ctx.strokeStyle = 'rgba(30,24,40,0.7)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  let row = 0;
  for (let yy = y + 78; yy < y + h - 30; yy += 26, row++) {
    if (hash(seed * 100 + row) < 0.18) continue;
    const segs = [[0.17, 0.58], [0.64, 0.78], [0.82, 0.96]];
    segs.forEach(([a, b], si) => {
      const len = (b - a) * w * (si === 0 ? 0.4 + hash(seed * 7 + row) * 0.6 : 0.6 + hash(seed * 13 + row + si) * 0.4);
      const x0 = si === 0 ? x + w * a : x + w * b - len;
      ctx.beginPath(); ctx.moveTo(x0, yy - 4);
      for (let xx = 0; xx < len; xx += 5) ctx.lineTo(x0 + xx, yy - 4 - Math.abs(Math.sin((xx + row * 7 + seed) * 0.9)) * 7 * (0.5 + hash(xx + row + seed * 3) * 0.5));
      ctx.stroke();
    });
  }
  ctx.restore();
}
function drawCash(ctx, x, y, w, h, rot, n, L) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-w / 2 + 10, -h / 2 + 12, w, h);
  for (let i = n - 1; i >= 0; i--) {
    const ox = -i * 1.5, oy = -i * 2.2;
    ctx.fillStyle = mixc(i % 2 ? '#4e5a48' : '#5a6650', L.key, L.keyAmt * 0.35); ctx.fillRect(-w / 2 + ox, -h / 2 + oy, w, h);
    ctx.strokeStyle = rgba('#20281e', 0.6); ctx.lineWidth = 1; ctx.strokeRect(-w / 2 + ox + 6, -h / 2 + oy + 6, w - 12, h - 12);
  }
  ctx.fillStyle = 'rgba(30,40,30,0.5)'; ctx.beginPath(); ctx.ellipse(-n * 1.5, -n * 2.2, h * 0.28, h * 0.28, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = mixc('#d8c8a0', L.key, L.keyAmt * 0.4); ctx.fillRect(-w * 0.12 - n * 1.5, -h / 2 - n * 2.2 - 2, w * 0.24, h + 4);
  ctx.restore();
}
function drawCoffeeCup(ctx, x, y, k, L, ripple = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  const china = mixc('#e8e2d8', L.key, L.keyAmt * 0.35);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(8, 10, 90, 22, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = mixc(china, L.mul, 0.2); ctx.beginPath(); ctx.ellipse(0, 0, 86, 22, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = china; ctx.fill(pathOf([[-50, -60], [50, -60], [40, -6], [-40, -6]]));
  ctx.beginPath(); ctx.ellipse(0, -6, 40, 9, 0, 0, PI); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(L.mul, 0.5); ctx.fill(pathOf([[L.dir[0] <= 0 ? 8 : -50, -60], [L.dir[0] <= 0 ? 50 : -8, -60], [L.dir[0] <= 0 ? 40 : -8, -6], [L.dir[0] <= 0 ? 6 : -40, -6]])); ctx.restore();
  ctx.strokeStyle = china; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(58, -36, 16, 14, 0, -1.6, 1.6); ctx.stroke();
  ctx.fillStyle = '#3a2618'; ctx.beginPath(); ctx.ellipse(0, -60, 50, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a0e08'; ctx.beginPath(); ctx.ellipse(0, -58, 44, 9, 0, 0, TAU); ctx.fill();
  if (ripple > 0 && ripple < 1) {
    for (let i = 0; i < 3; i++) {
      const rp = clamp(ripple * 1.6 - i * 0.25); if (rp <= 0 || rp >= 1) continue;
      ctx.strokeStyle = rgba('#e0b080', 0.6 * (1 - rp)); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, -58, 6 + rp * 38, 1.5 + rp * 7.5, 0, 0, TAU); ctx.stroke();
    }
  }
  ctx.strokeStyle = rgba('#ffffff', 0.4); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -60, 50, 12, 0, PI * 1.1, PI * 1.6); ctx.stroke();
  ctx.restore();
}
