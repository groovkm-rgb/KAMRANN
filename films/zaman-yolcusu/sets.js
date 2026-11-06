/* =====================================================================
   ZAMAN YOLCUSU · film-only cast, props and sets.
   Built before scenes.js. Everything is a pure function of time.
   ===================================================================== */

/* ---------- cast: one face shape for both Kerems (same man, 30 years apart) ---------- */
const KEREM_LV = makeLevels(LV_BOSS, { sx: 0.93, sy: 1.02, jaw: 0.97, chin: 0.95 });
HEAD.keremOld = {
  lv: KEREM_LV, skin: '#b88a6c', hair: '#77717e', hairHi: '#b4aebc', gray: '#a8a2b0', grayAmt: 0,
  hl: HL_FULL, browCol: '#8e8896', browThick: 1.15, frown: 0.45, eyeOpen: 0.85, iris: '#6a5a4a', nose: 1.1, stubble: 0,
  mouthDown: 0.8, ear: 1, comb: false, glasses: true, beard: '#7c7682', longHair: { len: 0.95, wave: 0.45, col: '#76707c' },
};
HEAD.keremYoung = {
  lv: KEREM_LV, skin: '#c69472', hair: '#0e0b0e', hairHi: '#3e3844', gray: '#555', grayAmt: 0,
  hl: HL_FULL, browCol: '#121014', browThick: 1, frown: 0.15, eyeOpen: 1, iris: '#4a3a2a', nose: 1.1, stubble: 0,
  mouthDown: 0.45, ear: 1, comb: true,
};
HEAD.elif = {
  lv: makeLevels(LV_BOSS, { sx: 0.84, sy: 0.98, jaw: 0.8, chin: 0.7, round: 1 }), skin: '#d6aa8a', hair: '#5a2e1a', hairHi: '#9a5a34', gray: '#555', grayAmt: 0,
  hl: HL_FULL, browCol: '#4a2414', browThick: 0.55, frown: -0.3, eyeOpen: 1.05, iris: '#5a3a20', nose: 0.8, stubble: 0,
  mouthDown: -0.6, ear: 0.9, comb: false, longHair: { len: 1, wave: 1, col: '#5e301c' }, soft: true, lips: '#a83a3a',
};
OUTFIT.keremOld = { suit: '#4c1824', lapel: '#3a1019', shirt: '#2c2228', tie: '#2c2228', cuff: '#8a7a6a', shoe: '#0c0a0e', coat: true, plain: true, pants: '#1e1a22' };
OUTFIT.keremYoung = { suit: '#4a2a6c', lapel: '#3a1e56', shirt: '#e6ddcc', tie: '#e6ddcc', cuff: '#e6ddcc', shoe: '#0c0a0e', sleeve: '#cdbfa8', pants: '#1c1820' };

const ZY = { brass: '#b8843e', brassHi: '#f2cf86', brassDk: '#4a2e14', amber: '#ffb04a', red: '#ff3a24', fire: '#ff7a2a', cold: '#d6e4ff', ash: '#8e8a92' };

/* ---------- lights ---------- */
const LT = {
  lab: mkLight({ dir: [-0.7, -0.1, 0.62], key: '#ffa44a', keyAmt: 0.5, mul: '#3a1e34', rim: '#a99aee', rimDir: [0.8, -0.6], rimW: 5, rimA: 0.85 }),
  labSide: mkLight({ dir: [-0.72, -0.15, 0.6], key: '#ffa44a', keyAmt: 0.5, mul: '#3a1e34', rim: '#ffcf8a', rimDir: [-0.9, -0.4], rimW: 5, rimA: 0.9 }),
  fire: mkLight({ dir: [0.75, -0.35, 0.5], key: '#ff8a3a', keyAmt: 0.55, mul: '#3a1426', rim: '#ffb060', rimDir: [0.9, -0.4], rimW: 6, rimA: 0.95 }),
  warm: mkLight({ dir: [0.5, -0.4, 0.65], key: '#ffb060', keyAmt: 0.42, mul: '#2e1428', rim: '#c8b0ff', rimDir: [-0.8, -0.6], rimW: 5, rimA: 0.8 }),
  street: mkLight({ dir: [0.6, -0.3, 0.6], key: '#c8b0ff', keyAmt: 0.3, mul: '#24162e', rim: '#ffcf8a', rimDir: [0.9, -0.4], rimW: 5, rimA: 0.85 }),
  morning: mkLight({ dir: [0.6, -0.4, 0.6], key: '#d8d0dc', keyAmt: 0.32, mul: '#3a3440', rim: '#f0e6e0', rimDir: [0.8, -0.6], rimW: 4, rimA: 0.75 }),
};

/* ---------- small helpers ---------- */
function annulus(r0, r1) { const p = new Path2D(); p.arc(0, 0, r1, 0, TAU); p.moveTo(r0, 0); p.arc(0, 0, r0, 0, TAU, true); return p; }
/** deterministic spark burst: particles from (x,y) launched at t0, falling with gravity. dir = mean angle (rad, 0 = right) */
function sparkBurst(ctx, t, t0, x, y, o = {}) {
  const age = t - t0, life = o.life || 0.7;
  if (age < 0 || age > life * 1.6) return;
  const n = o.n || 18, k = o.k || 1, seed = o.seed || 1, spread = o.spread ?? 1.2, dir = o.dir ?? -PI / 2, g = (o.g ?? 1400) * k;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const hl = life * (0.5 + hash(seed * 31 + i) * 0.9); if (age > hl) continue;
    const a = dir + (hash(seed * 17 + i) - 0.5) * 2 * spread, v = (380 + hash(seed * 7 + i) * 900) * k;
    const px = x + Math.cos(a) * v * age, py = y + Math.sin(a) * v * age + 0.5 * g * age * age;
    const vx = Math.cos(a) * v, vy = Math.sin(a) * v + g * age, f = 1 - age / hl;
    ctx.strokeStyle = rgba(f > 0.6 ? '#fff6d8' : (o.col || '#ffb04a'), f);
    ctx.lineWidth = (1.6 + f * 2.2) * k;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - vx * 0.022, py - vy * 0.022); ctx.stroke();
  }
  glow(ctx, x, y, 90 * k, o.col || '#ffb04a', clamp(1 - age / (life * 0.4)) * 0.8);
  ctx.restore();
}
/** short electric arc between two points (seed changes 12×/s so it crackles) */
function arcZap(ctx, t, x0, y0, x1, y1, a, seed, k = 1, col) {
  if (a <= 0.02) return;
  const s = seed * 97 + Math.floor(t * 12);
  if (col) { ctx.save(); glow(ctx, (x0 + x1) / 2, (y0 + y1) / 2, Math.hypot(x1 - x0, y1 - y0) * 0.6, col, a * 0.35); ctx.restore(); }
  drawBolt(ctx, s, x0, y0, x1, y1, a, k);
}

/* =====================================================================
   THE RINGS — one design for the giant machine AND the watch dial,
   so the last shot can match-cut from the dial to the machine.
   ===================================================================== */
const RING_W = [0.22, -0.36, 0.62];          // rad/s of the three rings at idle (scene 1)
const RING_PH = [0.4, 1.3, 2.2];
const ringsIdle = t => RING_W.map((w, i) => RING_PH[i] + w * t);
/** dial gears in the last shot: still, then spin up to exactly the idle motion at the loop point (g = 55) */
function ringsDial(g) {
  const tau = g - DURATION;
  let F;
  if (tau >= -1.2) F = tau; else if (tau >= -2.4) { const u = (tau + 2.4) / 1.2; F = -1.2 - 0.6 * (1 - u * u); } else F = -1.8;
  return RING_W.map((w, i) => RING_PH[i] + w * F);
}
function drawRings(ctx, cx, cy, R, ang, o = {}) {
  const gA = o.glow ?? 0.7, hot = o.hot || 0, cold = o.cold || 0;
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = '#0b070e'; ctx.beginPath(); ctx.arc(0, 0, R * 1.02, 0, TAU); ctx.fill();
  const core = cold > 0 ? mixc('#ffb04a', '#d6e4ff', cold) : mixc('#ffb04a', '#ff3a24', hot);
  glow(ctx, 0, 0, R * 1.05, core, 0.32 * gA + 0.45 * cold);
  glow(ctx, 0, 0, R * 0.42, '#fff0c8', 0.45 * gA + 0.5 * cold);
  const brass = mixc(ZY.brass, '#ff6a3a', hot * 0.3), lit = mixc(brass, '#ffe0a0', 0.35), dk = mixc(brass, '#1a0c10', 0.6);
  const shade = (p) => {   // fixed cel lighting (does not rotate): lit top-left, hard shadow bottom-right, inner amber rim
    ctx.save(); ctx.clip(p); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba('#3a1e34', 0.85);
    ctx.rotate(-PI / 4); ctx.fillRect(-R * 2, R * 0.02, R * 4, R * 4); ctx.restore();
  };
  const hiArc = (r, w, a) => { ctx.strokeStyle = rgba('#ffe6b0', a); ctx.lineWidth = w; ctx.beginPath(); ctx.arc(0, 0, r, PI * 0.95, PI * 1.62); ctx.stroke(); };
  // ring 0: outer band with slots and bosses
  { const r0 = R * 0.84, r1 = R, p = annulus(r0, r1);
    ctx.save(); ctx.rotate(ang[0]); ctx.fillStyle = brass; ctx.fill(p);
    ctx.fillStyle = dk;
    for (let i = 0; i < 24; i++) { ctx.save(); ctx.rotate((i / 24) * TAU); ctx.fillRect(r0 + (r1 - r0) * 0.25, -R * 0.018, (r1 - r0) * 0.5, R * 0.036); ctx.restore(); }
    for (let i = 0; i < 8; i++) { const a = ((i + 0.5) / 8) * TAU; ctx.fillStyle = lit; ctx.beginPath(); ctx.arc(Math.cos(a) * (r0 + r1) / 2, Math.sin(a) * (r0 + r1) / 2, R * 0.035, 0, TAU); ctx.fill(); }
    ctx.restore(); shade(p); hiArc(r1 - R * 0.01, R * 0.012, 0.6); hiArc(r0 + R * 0.01, R * 0.008, 0.35);
    ctx.strokeStyle = rgba(core, 0.5 * gA); ctx.lineWidth = R * 0.01; ctx.beginPath(); ctx.arc(0, 0, r0, 0, TAU); ctx.stroke(); }
  // ring 1: gear with teeth on the outside, three Deco cut-outs
  { const r0 = R * 0.6, r1 = R * 0.72;
    ctx.save(); ctx.rotate(ang[1]);
    const p = new Path2D(); const N = 20;
    for (let i = 0; i < N; i++) { const a0 = (i / N) * TAU, a1 = a0 + TAU / N * 0.25, a2 = a0 + TAU / N * 0.5, a3 = a0 + TAU / N * 0.75;
      const pts = [[a0, r1], [a1, r1 + R * 0.055], [a2, r1 + R * 0.055], [a3, r1]];
      pts.forEach(([a, r], j) => (i === 0 && j === 0 ? p.moveTo : p.lineTo).call(p, Math.cos(a) * r, Math.sin(a) * r)); }
    p.closePath(); p.moveTo(r0, 0); p.arc(0, 0, r0, 0, TAU, true);
    ctx.fillStyle = mixc(brass, '#000', 0.12); ctx.fill(p, 'evenodd');
    ctx.fillStyle = '#0b070e';
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate((i / 3) * TAU); ctx.beginPath(); ctx.moveTo(r0 + R * 0.025, -R * 0.06); ctx.lineTo(r1 - R * 0.02, -R * 0.03); ctx.lineTo(r1 - R * 0.02, R * 0.03); ctx.lineTo(r0 + R * 0.025, R * 0.06); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.restore();
    ctx.save(); ctx.clip(p, 'evenodd'); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba('#3a1e34', 0.85); ctx.rotate(-PI / 4); ctx.fillRect(-R * 2, R * 0.02, R * 4, R * 4); ctx.restore();
    hiArc(r1, R * 0.01, 0.5); }
  // ring 2: inner ring with spokes and hub
  { const r0 = R * 0.38, r1 = R * 0.48;
    ctx.save(); ctx.rotate(ang[2]);
    const p = annulus(r0, r1);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; p.addPath(quad(Math.cos(a) * R * 0.12, Math.sin(a) * R * 0.12, Math.cos(a) * (r0 + 2), Math.sin(a) * (r0 + 2), R * 0.022, R * 0.03)); }
    ctx.fillStyle = brass; ctx.fill(p);
    ctx.fillStyle = dk; for (let i = 0; i < 12; i++) { const a = ((i + 0.5) / 12) * TAU; ctx.beginPath(); ctx.arc(Math.cos(a) * (r0 + r1) / 2, Math.sin(a) * (r0 + r1) / 2, R * 0.016, 0, TAU); ctx.fill(); }
    ctx.restore(); shade(p); hiArc(r1, R * 0.009, 0.5); }
  // hub lens
  { const hp = new Path2D(); hp.arc(0, 0, R * 0.14, 0, TAU);
    ctx.fillStyle = dk; ctx.fill(hp);
    const lg = ctx.createRadialGradient(-R * 0.03, -R * 0.03, 0, 0, 0, R * 0.11);
    lg.addColorStop(0, '#fff6dc'); lg.addColorStop(0.4, core); lg.addColorStop(1, mixc(core, '#2a0a10', 0.6));
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(0, 0, R * 0.105, 0, TAU); ctx.fill();
    glow(ctx, 0, 0, R * 0.3, core, 0.5 * gA + cold * 0.5); }
  ctx.restore();
}

/* ---------- the time machine (lab) ---------- */
function drawMachine(ctx, t, cx, cy, R, ang, o = {}) {
  const en = o.energy || 0, cold = o.cold || 0;
  // tall Deco housing: stepped pylons, crown, pedestal
  const hw = R * 1.42;
  for (const s of [-1, 1]) {
    const x0 = cx + s * hw - (s > 0 ? R * 0.34 : 0);
    drawFluted(ctx, x0, cy - R * 1.55, R * 0.34, R * 3.3, '#2a1a2c', 5, 0.1);
    ctx.fillStyle = '#1a1018'; ctx.fillRect(x0 - R * 0.05, cy - R * 1.62, R * 0.44, R * 0.1);
    ctx.fillStyle = rgba(ZY.brassHi, 0.35); ctx.fillRect(x0 - R * 0.05, cy - R * 1.62, R * 0.44, 3);
    // brass feed pipes into the ring
    const py = cy + R * 0.02;
    ctx.fillStyle = ZY.brassDk; ctx.fillRect(Math.min(x0 + R * 0.17, cx + s * R * 1.05), py - R * 0.07, Math.abs(x0 + R * 0.17 - (cx + s * R * 1.05)), R * 0.14);
    ctx.fillStyle = rgba(ZY.brassHi, 0.4); ctx.fillRect(Math.min(x0 + R * 0.17, cx + s * R * 1.05), py - R * 0.07, Math.abs(x0 + R * 0.17 - (cx + s * R * 1.05)), R * 0.02);
    for (const yy of [-0.9, 0.9]) { ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.arc(x0 + R * 0.17, cy + R * yy, R * 0.09, 0, TAU); ctx.fill(); ctx.fillStyle = rgba(ZY.amber, 0.5 + 0.3 * Math.sin(t * 3 + yy + s)); ctx.beginPath(); ctx.arc(x0 + R * 0.17, cy + R * yy, R * 0.035, 0, TAU); ctx.fill(); }
  }
  // crown with sunburst
  ctx.save(); ctx.beginPath(); ctx.rect(cx - hw, cy - R * 2.6, hw * 2, R * 1.05); ctx.clip();
  drawSunburst(ctx, cx, cy - R * 1.55, R * 0.95, '#2a1a2c', ZY.brass, 24, 0.7); ctx.restore();
  ctx.fillStyle = '#140c14'; ctx.fillRect(cx - hw - R * 0.1, cy - R * 1.6, hw * 2 + R * 0.2, R * 0.08);
  // stator ring (stationary) with bolts
  const st = annulus(R * 1.02, R * 1.16);
  ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = '#3a2418'; ctx.fill(st);
  ctx.fillStyle = ZY.brass; for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; ctx.beginPath(); ctx.arc(Math.cos(a) * R * 1.09, Math.sin(a) * R * 1.09, R * 0.022, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = rgba(ZY.brassHi, 0.45); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * 1.155, PI * 0.95, PI * 1.6); ctx.stroke();
  ctx.restore();
  // pedestal
  ctx.fillStyle = '#1c1218'; ctx.beginPath(); ctx.moveTo(cx - R * 0.9, cy + R * 1.8); ctx.lineTo(cx - R * 0.55, cy + R * 1.05); ctx.lineTo(cx + R * 0.55, cy + R * 1.05); ctx.lineTo(cx + R * 0.9, cy + R * 1.8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgba(ZY.brassHi, 0.25); ctx.fillRect(cx - R * 0.55, cy + R * 1.05, R * 1.1, 3);
  drawRings(ctx, cx, cy, R, ang, { glow: 0.7 + en * 0.6, cold });
  // energy: arcs between the rings and out to the stator
  if (en > 0.05) {
    ctx.save();
    const n = Math.round(2 + en * 7);
    for (let i = 0; i < n; i++) {
      const s = i * 13 + Math.floor(t * 9) * 7, a0 = hash(s) * TAU, a1 = a0 + (hash(s + 1) - 0.5) * 1.4;
      const r0 = R * (0.2 + hash(s + 2) * 0.3), r1 = R * (0.8 + hash(s + 3) * 0.4 + en * 0.3);
      arcZap(ctx, t, cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0, cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1, clamp(en * 1.2) * (0.5 + 0.5 * hash(s + 4)), s, 0.5 + en * 0.7);
    }
    ctx.restore();
  }
}

/* ---------- lab set (wall, pipes, gauges, floor, machine) ---------- */
function drawGauge(ctx, x, y, r, t, seed) {
  ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.arc(x, y, r * 1.15, 0, TAU); ctx.fill();
  ctx.fillStyle = '#d8c8a0'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 2;
  for (let i = 0; i <= 8; i++) { const a = PI * 0.8 + (i / 8) * PI * 1.4; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75); ctx.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); ctx.stroke(); }
  const a = PI * 1.1 + (0.5 + 0.5 * snz(t * 0.8, seed)) * PI * 0.9;
  ctx.strokeStyle = '#8a1a20'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); ctx.stroke();
  ctx.fillStyle = 'rgba(255,240,210,0.25)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.35, r * 0.4, r * 0.2, -0.6, 0, TAU); ctx.fill();
}
function drawValve(ctx, x, y, r, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.strokeStyle = '#7a2a26'; ctx.lineWidth = r * 0.16; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
  for (let i = 0; i < 4; i++) { ctx.rotate(PI / 4 * 2); ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke(); }
  ctx.fillStyle = ZY.brass; ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, TAU); ctx.fill();
  ctx.restore();
}
function pipeH(ctx, x0, x1, y, w) {
  ctx.fillStyle = ZY.brassDk; ctx.fillRect(x0, y - w / 2, x1 - x0, w);
  ctx.fillStyle = rgba(ZY.brassHi, 0.5); ctx.fillRect(x0, y - w / 2 + w * 0.12, x1 - x0, w * 0.14);
  ctx.fillStyle = rgba('#000', 0.4); ctx.fillRect(x0, y + w * 0.28, x1 - x0, w * 0.22);
  for (let x = x0 + 120; x < x1; x += 240) { ctx.fillStyle = '#2a1a10'; ctx.fillRect(x - w * 0.18, y - w * 0.65, w * 0.36, w * 1.3); }
}
function pipeV(ctx, x, y0, y1, w) {
  ctx.fillStyle = ZY.brassDk; ctx.fillRect(x - w / 2, y0, w, y1 - y0);
  ctx.fillStyle = rgba(ZY.brassHi, 0.5); ctx.fillRect(x - w / 2 + w * 0.15, y0, w * 0.14, y1 - y0);
  ctx.fillStyle = rgba('#000', 0.4); ctx.fillRect(x + w * 0.25, y0, w * 0.25, y1 - y0);
}
/** o: { mc:[x,y], R, ang, energy, cold, sconce } — call with the camera; uses depths 0.7 / 0.85 / 1 */
function drawLab(ctx, t, cam, o) {
  setCam(ctx, cam, 0.7);
  ctx.fillStyle = '#120b16'; ctx.fillRect(-1400, -1600, 3900, 5200);
  for (let x = -1300; x < 2400; x += 300) drawPilaster(ctx, x, -900, 70, 3400, '#1c1222');
  drawFrieze(ctx, -1400, -40, 3900, 40, '#1a1018', rgba(ZY.brass, 0.5));
  pipeH(ctx, -1400, 2500, 120, 44); pipeH(ctx, -1400, 2500, 210, 26);
  for (const x of [-700, -380, 1460, 1780]) pipeV(ctx, x, 120, 2200, 36);
  drawValve(ctx, -380, 640, 46, t * 0.1); drawValve(ctx, 1460, 760, 40, -t * 0.08);
  for (const [x, y, s] of [[-560, 520, 3], [-560, 700, 5], [1640, 560, 7], [1640, 760, 9]]) drawGauge(ctx, x, y, 44, t, s);
  for (const x of [-860, 1940]) drawSconce(ctx, x, 380, 0.8, o.sconce ?? 0.8);
  // machine
  setCam(ctx, cam, 0.85);
  const [mx, my] = o.mc, R = o.R || 400;
  glow(ctx, mx, my, R * 2.6, o.cold ? mixc('#ffb04a', '#bcd0ff', o.cold) : '#c8642a', 0.22 + (o.energy || 0) * 0.35);
  drawMachine(ctx, t, mx, my, R, o.ang, o);
  // floor
  drawCheckerFloor(ctx, cam, { vx: 540, yFar: my + R * 1.75, yNear: 2600, xw0: 3000, xw1: 5200, rows: 10, cols: 14, ca: '#1a1018', cb: '#2a1a26', dFar: 0.85, dNear: 1.25 });
  setCam(ctx, cam, 0.85);
  const fg = ctx.createLinearGradient(0, my + R * 1.75, 0, my + R * 1.75 + 500);
  fg.addColorStop(0, rgba('#ff9a4a', 0.16 + (o.energy || 0) * 0.2)); fg.addColorStop(1, rgba('#ff9a4a', 0));
  withOp(ctx, 'lighter', () => { ctx.fillStyle = fg; ctx.fillRect(mx - R * 2, my + R * 1.75, R * 4, 500); });
}

/* ---------- the time device: brass wrist dial (also the watch found in the ashes) ---------- */
function drawTimeDevice(ctx, x, y, r, t, o = {}) {
  const heat = o.heat || 0, ang = o.ang || ringsIdle(t), rot = o.rot || 0, gl = o.glow ?? 0.8;
  const col = mixc(ZY.amber, ZY.red, heat);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (o.strap) {   // leather band (when lying loose or worn across the wrist)
    ctx.fillStyle = o.strapCol || '#2a1610';
    ctx.fillRect(-r * 0.62, -r * (o.strap === 'loose' ? 2.6 : 1.5), r * 1.24, r * (o.strap === 'loose' ? 5.2 : 3));
    ctx.fillStyle = rgba('#000', 0.35); for (let i = -3; i <= 3; i++) if (Math.abs(i) > 1) ctx.fillRect(-r * 0.62, i * r * 0.62 - 2, r * 1.24, 3);
  }
  glow(ctx, 0, 0, r * 3.2, col, gl * (0.35 + heat * 0.35));
  // lugs and crown
  ctx.fillStyle = ZY.brassDk; for (const s of [-1, 1]) ctx.fillRect(-r * 0.5, s * r * 1.08 - (s > 0 ? 0 : r * 0.22), r, r * 0.22);
  ctx.fillStyle = ZY.brass; ctx.fillRect(r * 1.02, -r * 0.16, r * 0.24, r * 0.32);
  // case: stepped Deco bezel
  ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.arc(0, 0, r * 1.1, 0, TAU); ctx.fill();
  ctx.fillStyle = mixc(ZY.brass, '#ff7a4a', heat * 0.25); ctx.beginPath(); ctx.arc(0, 0, r * 1.04, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a1810'; for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.97, Math.sin(a) * r * 0.97, r * 0.035, 0, TAU); ctx.fill(); }
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba('#3a1e34', 0.8); ctx.beginPath(); ctx.arc(0, 0, r * 1.04, -PI / 4, PI * 0.75); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.restore();
  // the dial = the machine's rings in miniature (not rotated with the case, so the match-cut lines up)
  drawRings(ctx, x, y, r * 0.86, ang, { glow: gl, hot: heat });
  // glass glare
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(255,240,220,0.13)'; ctx.beginPath(); ctx.ellipse(-r * 0.32, -r * 0.4, r * 0.45, r * 0.2, -0.7, 0, TAU); ctx.fill();
  if (heat > 0.2) glow(ctx, 0, 0, r * 1.2, ZY.red, (heat - 0.2) * 0.6 * (0.7 + 0.3 * Math.sin(t * 20)));
  ctx.restore();
}

/* ---------- Elif: photo portrait + window silhouette ---------- */
function drawElifPortrait(ctx, w, h, L) {
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#6a5240'); g.addColorStop(1, '#2a1c16');
  ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  const s = h / 760;
  ctx.save(); ctx.translate(0, h * 0.2); ctx.scale(s, s);
  const hd = { x: 0, y: -150, s: 1, yaw: 0.22, pitch: 0.04, light: L, t: 0, gaze: [-0.2, 0], glint: 0.6, frown: -0.2 };
  drawNeck(ctx, HEAD.elif, hd, L);   // long wavy hair behind
  const dress = pathOf([[-40, -10], [-150, 10], [-250, 60], [-290, 400], [290, 400], [250, 60], [150, 10], [40, -10], [0, 60]]);
  bodyPart(ctx, dress, '#e6d6b4', L, { rimK: 1.6 });
  ctx.strokeStyle = rgba('#8a6a4a', 0.6); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -10); ctx.quadraticCurveTo(0, 90, 40, -10); ctx.stroke();
  drawHead(ctx, HEAD.elif, hd);
  ctx.restore();
}
/** photo with burnt, glowing edges. Local origin = photo centre. */
function burntEdge(w, h, seed) {
  const pts = [], n = 44;
  for (let i = 0; i < n; i++) {
    const f = i / n, per = 2 * (w + h), d = f * per;
    let x, y;
    if (d < w) { x = -w / 2 + d; y = -h / 2; } else if (d < w + h) { x = w / 2; y = -h / 2 + (d - w); } else if (d < 2 * w + h) { x = w / 2 - (d - w - h); y = h / 2; } else { x = -w / 2; y = h / 2 - (d - 2 * w - h); }
    const bite = (0.03 + 0.09 * Math.pow(hash(seed + i), 2)) * Math.min(w, h) * (i % 11 < 4 ? 2.2 : 1);   // a few deep burnt bites
    const nx = x / (w / 2), ny = y / (h / 2), m = Math.hypot(nx, ny) || 1;
    pts.push([x - (nx / m) * bite, y - (ny / m) * bite]);
  }
  return pts;
}
function drawBurntPhoto(ctx, x, y, w, h, rot, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const edge = burntEdge(w, h, o.seed || 5), p = smoothPathOf(edge, true, 0.5);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.save(); ctx.translate(w * 0.03, h * 0.04); ctx.fill(p); ctx.restore();
  ctx.fillStyle = '#e4d6b8'; ctx.fill(p);
  ctx.save(); ctx.clip(p);
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + w * 0.07, -h / 2 + h * 0.06, w * 0.86, h * 0.8); ctx.clip();
  ctx.translate(0, -h * 0.04); drawElifPortrait(ctx, w * 0.86, h * 0.8, o.portraitLight || LT.lab);
  ctx.restore();
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(-w, -h, w * 2, h * 2);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#d0a070'; ctx.fillRect(-w, -h, w * 2, h * 2);   // sepia
  ctx.globalCompositeOperation = 'source-over';
  // scorch
  edgeFill(ctx, p, w * 0.05, h * 0.04, '#3a1a0c', 0.75); edgeFill(ctx, p, -w * 0.05, -h * 0.04, '#3a1a0c', 0.75);
  edgeFill(ctx, p, w * 0.02, h * 0.015, '#0e0604', 0.9); edgeFill(ctx, p, -w * 0.02, -h * 0.015, '#0e0604', 0.9);
  if (o.light) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(o.light, 0.5); ctx.fillRect(-w, -h, w * 2, h * 2); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  // glowing ember line on the burnt edge
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = Math.max(1.2, w * 0.008);
  for (let i = 0; i < edge.length; i++) {
    const a = edge[i], b = edge[(i + 1) % edge.length], e = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
    if (hash((o.seed || 5) * 3 + i) < 0.45) continue;
    ctx.strokeStyle = rgba('#ff7a2a', 0.5 * e); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}
/** Elif's silhouette on a lit curtain (window coords: x,y top-left, w,h) */
function drawElifSilhouette(ctx, t, x, y, w, h, a = 1) {
  const cx = x + w * 0.52 + Math.sin(t * 0.7) * w * 0.03, cy = y + h * 0.42, s = h / 300;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(40,14,10,0.78)';
  const p = new Path2D();
  // head with wavy hair falling to the shoulders, then the shoulders of a dress
  const hp = [];
  for (let i = 0; i <= 24; i++) { const u = PI + (i / 24) * PI; hp.push([cx + Math.cos(u) * 36 * s, cy + Math.sin(u) * 44 * s]); }
  p.moveTo(cx - 36 * s, cy);
  for (const q of hp) p.lineTo(q[0], q[1]);
  p.bezierCurveTo(cx + 46 * s, cy + 20 * s, cx + 38 * s, cy + 50 * s, cx + 50 * s, cy + 70 * s);
  p.bezierCurveTo(cx + 90 * s, cy + 82 * s, cx + 110 * s, cy + 100 * s, cx + 120 * s, cy + 160 * s);
  p.lineTo(cx - 120 * s, cy + 160 * s);
  p.bezierCurveTo(cx - 110 * s, cy + 100 * s, cx - 90 * s, cy + 82 * s, cx - 50 * s, cy + 70 * s);
  p.bezierCurveTo(cx - 38 * s, cy + 50 * s, cx - 52 * s, cy + 20 * s, cx - 36 * s, cy);
  ctx.filter = 'blur(' + (3 * s).toFixed(1) + 'px)'; ctx.fill(p); ctx.filter = 'none';
  ctx.restore();
}

/* ---------- fire ---------- */
function drawFlame(ctx, t, x, y, w, h, seed, a = 1) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glow(ctx, x, y - h * 0.3, Math.max(w, h) * 0.9, '#ff6a20', 0.35 * a);
  const cols = [['#c8301a', 1, 0.9], ['#ff7a2a', 0.78, 0.85], ['#ffc860', 0.5, 0.8], ['#fff0c0', 0.25, 0.7]];
  for (const [col, k, al] of cols) {
    const n = 5, pts = [[x - w / 2 * k, y]];
    for (let i = 0; i <= n; i++) {
      const f = i / n, xx = x + (f - 0.5) * w * k;
      const hh = h * k * (0.55 + 0.45 * Math.sin(f * PI)) * (0.75 + 0.35 * snz(t * 4 + i * 1.7, seed + i));
      pts.push([xx + snz(t * 3 + i, seed) * w * 0.12, y - hh]);
      if (i < n) pts.push([xx + w * k / n * 0.5, y - hh * (0.45 + 0.2 * snz(t * 5 + i, seed + 9))]);
    }
    pts.push([x + w / 2 * k, y]);
    ctx.fillStyle = rgba(col, al * a); ctx.fill(smoothPathOf(pts, true, 0.7));
  }
  ctx.restore();
}
/** heavy curtain with wide soft folds (window coords), optional burnt-away top at y = burnTop */
function drawSoftCurtain(ctx, t, x, y, w, h, base, sway = 0) {
  const n = 6, fw = w / n;
  for (let i = 0; i < n; i++) {
    const gx = x + i * fw + Math.sin(t * 0.8 + i) * sway;
    const gr = ctx.createLinearGradient(gx, 0, gx + fw, 0);
    gr.addColorStop(0, darken(base, 0.45)); gr.addColorStop(0.35, lighten(base, 0.12)); gr.addColorStop(0.65, base); gr.addColorStop(1, darken(base, 0.5));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(gx, y);
    ctx.lineTo(gx + fw + 1, y); ctx.lineTo(gx + fw + 1, y + h + Math.sin(i * 2.1) * 14); ctx.quadraticCurveTo(gx + fw / 2, y + h + 26, gx, y + h + Math.sin(i * 1.3) * 14); ctx.closePath(); ctx.fill();
  }
}
function smokeColumn(ctx, t, x, y, k, col, a, seed, wind = 0.3) {
  const sp = puffTinted(col);
  for (let i = 0; i < 14; i++) {
    const per = 6, ph = (i / 14) * per, age = ((t + ph) % per) / per;
    const px = x + (fbm(i * 1.7 + seed, 3) * 60 + wind * age * 500 + Math.sin(age * 4 + i) * 40) * k, py = y - age * 1300 * k, pr = (90 + age * 300) * k;
    ctx.globalAlpha = a * Math.sin(age * PI) * 0.7;
    ctx.drawImage(sp, px - pr, py - pr, pr * 2, pr * 2);
  }
  ctx.globalAlpha = 1;
}
function drawEmbers(ctx, t, x, y, w, h, n, seed, a = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const per = 1.6 + hash(seed + i) * 2, ph = hash(seed + i * 3) * per, age = ((t + ph) % per) / per;
    const px = x + hash(seed + i * 7) * w + Math.sin(age * 6 + i) * 30, py = y - age * h;
    ctx.fillStyle = rgba(age < 0.5 ? '#ffd080' : '#ff6a2a', (1 - age) * a);
    ctx.fillRect(px, py, 3, 3);
  }
  ctx.restore();
}

/* =====================================================================
   THE APARTMENT — Art-Deco block across the street.
   Local coords: origin bottom-left at street level, y up = negative, width 820.
   st: { lit(f,c), fire(f,c), burst(f,c), elif, char, flick, red }
   Floors 0..4 above the ground floor; Elif's window = floor 1, column 1.
   ===================================================================== */
const APT = { W: 820, G: 340, FH: 240, cols: [150, 410, 670], ww: 130, wh: 170 };
function aptWin(f, c) { const top = -APT.G - APT.FH * (f + 1) + 36; return { x: APT.cols[c] - APT.ww / 2, y: top, w: APT.ww, h: APT.wh, cx: APT.cols[c], cy: top + APT.wh / 2 }; }
function aptToWorld(b, p) { return [b.x + p[0] * b.k, b.y + p[1] * b.k]; }
function drawApartment(ctx, t, b, st) {
  const ch = st.char || 0, k = b.k;
  ctx.save(); ctx.translate(b.x, b.y); ctx.scale(k, k);
  const W = APT.W, top = -APT.G - APT.FH * 5;
  const stone = mixc('#2e1e34', '#141012', ch), stoneHi = mixc('#4a3456', '#26201e', ch), stoneDk = mixc('#1a1020', '#0a0808', ch);
  // crown (ziggurat) + mast
  const crown = pathOf([[60, top], [60, top - 120], [160, top - 120], [160, top - 220], [290, top - 220], [290, top - 330], [530, top - 330], [530, top - 220], [660, top - 220], [660, top - 120], [760, top - 120], [760, top]]);
  ctx.fillStyle = stone; ctx.fill(crown);
  if (ch < 0.5) { ctx.fillStyle = stoneDk; ctx.fillRect(400, top - 560, 20, 230); ctx.beginPath(); ctx.moveTo(380, top - 330); ctx.lineTo(410, top - 600); ctx.lineTo(440, top - 330); ctx.fill(); }
  else { ctx.fillStyle = '#0a0808'; ctx.beginPath(); ctx.moveTo(400, top - 330); ctx.lineTo(430, top - 470); ctx.lineTo(452, top - 330); ctx.fill(); }
  ctx.save(); ctx.beginPath(); ctx.rect(290, top - 330, 240, 110); ctx.clip(); drawSunburst(ctx, 410, top - 220, 120, stoneDk, mixc(ZY.brass, '#2a2420', ch), 16, 0.6); ctx.restore();
  // body
  ctx.fillStyle = stone; ctx.fillRect(0, top, W, -top);
  // vertical piers between window columns
  for (const px of [20, 280, 540, 800]) { ctx.fillStyle = stoneHi; ctx.fillRect(px - 18, top - 10, 36, -top + 10); ctx.fillStyle = rgba('#000', 0.35); ctx.fillRect(px + 8, top - 10, 10, -top + 10); }
  // floor bands
  for (let f = 0; f <= 5; f++) { const y = -APT.G - APT.FH * f; ctx.fillStyle = stoneDk; ctx.fillRect(-10, y - 14, W + 20, 18); ctx.fillStyle = rgba(ch > 0.5 ? '#3a3430' : ZY.brass, 0.35); ctx.fillRect(-10, y - 14, W + 20, 2); }
  // windows
  for (let f = 0; f < 5; f++) for (let c = 0; c < 3; c++) {
    const w = aptWin(f, c), wp = steppedPath(w.x, w.y, w.w, w.h, 12, 3);
    const lit = st.lit ? st.lit(f, c) : 0, fire = st.fire ? st.fire(f, c) : 0, burst = st.burst ? st.burst(f, c) : 0;
    ctx.fillStyle = ch > 0.5 ? '#050304' : '#0c0810'; ctx.fill(wp);
    if (lit > 0.01 && ch < 0.5) { ctx.save(); ctx.clip(wp); const g = ctx.createLinearGradient(0, w.y, 0, w.y + w.h); g.addColorStop(0, rgba('#ffd890', lit)); g.addColorStop(1, rgba('#c8742a', lit)); ctx.fillStyle = g; ctx.fillRect(w.x, w.y, w.w, w.h);
      if (f === 1 && c === 1 && st.elif > 0) drawElifSilhouette(ctx, t, w.x, w.y, w.w, w.h, st.elif);
      // curtain folds
      ctx.globalAlpha = 0.35 * lit; for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#a0602a' : '#ffe0a8'; ctx.fillRect(w.x + i * w.w / 6, w.y, w.w / 12, w.h); } ctx.globalAlpha = 1;
      ctx.restore(); withOp(ctx, 'lighter', () => glow(ctx, w.cx, w.cy, 150, '#ffb04a', 0.3 * lit)); }
    if (fire > 0.01) { ctx.save(); ctx.clip(wp); const g = ctx.createLinearGradient(0, w.y, 0, w.y + w.h); g.addColorStop(0, rgba('#fff0b0', fire)); g.addColorStop(0.5, rgba('#ff8a2a', fire)); g.addColorStop(1, rgba('#a8201a', fire)); ctx.fillStyle = g; ctx.fillRect(w.x, w.y, w.w, w.h); ctx.restore(); }
    if (burst > 0.01) withOp(ctx, 'lighter', () => { glow(ctx, w.cx, w.cy, 260, '#fff4dc', burst); glow(ctx, w.cx, w.cy, 90, '#ffffff', burst); });
    // frame + mullion
    ctx.strokeStyle = ch > 0.5 ? '#1a1412' : '#08060a'; ctx.lineWidth = 9; ctx.stroke(wp);
    if (!(ch > 0.5 && (f + c) % 2)) { ctx.fillStyle = ctx.strokeStyle; ctx.fillRect(w.cx - 3, w.y + 36, 6, w.h - 36); ctx.fillRect(w.x, w.y + w.h * 0.55, w.w, 5); }
    // sill
    ctx.fillStyle = stoneHi; ctx.fillRect(w.x - 12, w.y + w.h, w.w + 24, 12);
    if (ch > 0) { ctx.save(); ctx.globalAlpha = ch * 0.85; const sg = ctx.createLinearGradient(0, w.y - 140, 0, w.y + 20); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.9)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(w.x, w.y + 10); ctx.lineTo(w.x + 20, w.y - 150); ctx.lineTo(w.x + w.w - 10, w.y - 170); ctx.lineTo(w.x + w.w, w.y + 10); ctx.fill(); ctx.restore(); }
  }
  for (let f = 0; f < 5; f++) for (let c = 0; c < 3; c++) {
    const fire = st.fire ? st.fire(f, c) : 0; if (fire <= 0.01) continue;
    const w = aptWin(f, c);
    withOp(ctx, 'lighter', () => { glow(ctx, w.cx, w.y, 330 * fire, '#ff6a20', 0.55 * fire); glow(ctx, w.cx, w.cy, 160, '#ffb050', 0.4 * fire); });
    drawFlame(ctx, t, w.cx, w.y + w.h * 0.75, w.w * 1.25, w.h * (1.0 + fire * 1.5), f * 7 + c * 3 + 1, fire);
    drawFlame(ctx, t * 1.3, w.cx + 8, w.y + 30, w.w * 0.8, w.h * (0.6 + fire * 1.2), f * 11 + c * 5 + 2, fire * 0.9);
  }
  // ground floor: entrance with canopy and lamps
  const gy = -APT.G;
  ctx.fillStyle = stoneDk; ctx.fillRect(0, gy, W, APT.G);
  for (const px of [60, 200, 620, 760]) { ctx.fillStyle = stoneHi; ctx.fillRect(px - 14, gy, 28, APT.G); }
  ctx.fillStyle = '#0a0608'; ctx.fillRect(330, -300, 160, 300);
  const dl = st.doorLit ?? (ch > 0.5 ? 0 : 0.7);
  if (dl > 0) { ctx.fillStyle = rgba('#c8843a', dl * 0.35); ctx.fillRect(350, -280, 120, 120); }
  ctx.strokeStyle = ch > 0.5 ? '#1a1410' : '#5a3a1c'; ctx.lineWidth = 6; ctx.strokeRect(330, -300, 160, 300);
  ctx.fillStyle = stoneHi; ctx.beginPath(); ctx.moveTo(290, -320); ctx.lineTo(530, -320); ctx.lineTo(510, -350); ctx.lineTo(310, -350); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgba(ch > 0.5 ? '#2a2420' : ZY.brass, 0.6); ctx.fillRect(290, -322, 240, 3);
  ctx.save(); ctx.beginPath(); ctx.rect(330, -420, 160, 70); ctx.clip(); drawSunburst(ctx, 410, -350, 70, stoneDk, mixc(ZY.brass, '#2a2420', ch), 10, 0.6); ctx.restore();
  const lampA = st.doorLamp ?? (ch > 0.5 ? 0 : 1);
  for (const lx of [300, 520]) { ctx.fillStyle = '#100a0c'; ctx.fillRect(lx - 10, -250, 20, 50); if (lampA > 0) { ctx.fillStyle = rgba('#ffd890', lampA); ctx.fillRect(lx - 7, -244, 14, 30); withOp(ctx, 'lighter', () => glow(ctx, lx, -230, 120, '#ffb04a', 0.5 * lampA)); } }
  // bell plate
  ctx.fillStyle = '#5a3a1c'; ctx.fillRect(500, -170, 16, 28); ctx.fillStyle = ZY.brassHi; ctx.beginPath(); ctx.arc(508, -156, 4, 0, TAU); ctx.fill();
  // red emergency wash
  if (st.red > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba('#ff2a1a', st.red * 0.18); ctx.fillRect(0, top - 340, W, -top + 340); ctx.restore(); }
  // charred streaks and collapse
  if (ch > 0) { ctx.save(); ctx.globalAlpha = ch; ctx.fillStyle = '#0a0607';
    ctx.beginPath(); ctx.moveTo(560, top - 10); ctx.lineTo(620, top + 120); ctx.lineTo(700, top + 60); ctx.lineTo(760, top + 200); ctx.lineTo(830, top + 140); ctx.lineTo(830, top - 130); ctx.lineTo(560, top - 130); ctx.fill();
    ctx.restore(); }
  ctx.restore();
}
/** neighbouring facades (silhouettes with a few windows) */
function drawNeighbours(ctx, t, x0, x1, base, h, seed, ch = 0, litA = 1) {
  let x = x0, i = 0;
  while (x < x1) {
    const w = 260 + hash(seed + i) * 260, hh = h * (0.6 + hash(seed + i + 9) * 0.5);
    ctx.fillStyle = mixc(i % 2 ? '#1c1220' : '#22162a', '#141012', ch); ctx.fillRect(x, base - hh, w - 8, hh);
    ctx.fillStyle = rgba('#000', 0.3); ctx.fillRect(x + w - 30, base - hh, 22, hh);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) {
      const wx = x + 40 + c * (w - 80) / 3, wy = base - hh + 60 + r * 150; if (wy > base - 120) continue;
      const on = hash2(seed + i * 13 + c, r) < 0.25 ? 1 : 0;
      ctx.fillStyle = on && litA > 0 ? rgba('#e0a24a', 0.55 * litA) : '#0c0810'; ctx.fillRect(wx, wy, 50, 80);
    }
    x += w; i++;
  }
}
/** wet street: sidewalk + road with glossy reflections. refl: [{x, col, a, w}] (world x at this depth) */
function drawWetStreet(ctx, t, x0, x1, y0, refl, o = {}) {
  const sw = o.sidewalk ?? 150, ch = o.morning || 0;
  // sidewalk (far kerb at y0)
  const g = ctx.createLinearGradient(0, y0, 0, y0 + sw); g.addColorStop(0, mixc('#1e1622', '#3a3640', ch)); g.addColorStop(1, mixc('#140e18', '#2a2830', ch));
  ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, sw);
  ctx.strokeStyle = rgba('#000', 0.45); ctx.lineWidth = 2; for (let x = x0 - (x0 % 140); x < x1; x += 140) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x - 30, y0 + sw); ctx.stroke(); }
  ctx.fillStyle = mixc('#2a2030', '#4a4650', ch); ctx.fillRect(x0, y0 + sw, x1 - x0, 14);
  // road
  const rg = ctx.createLinearGradient(0, y0 + sw + 14, 0, y0 + 1200); rg.addColorStop(0, mixc('#0e0a12', '#2e2c34', ch)); rg.addColorStop(1, mixc('#07050a', '#1e1c22', ch));
  ctx.fillStyle = rg; ctx.fillRect(x0, y0 + sw + 14, x1 - x0, 1400);
  // reflections: many thin wobbling slices + soft glow (never ladder-like)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const r of refl || []) {
    const ww = r.w || 60;
    glow(ctx, r.x, y0 + 60, ww * 3, r.col, r.a * 0.25, 'lighter', 0.5);
    for (let i = 0; i < 28; i++) {
      const yy = y0 + 10 + i * 34 + (i % 3) * 5, f = 1 - i / 28;
      const wob = Math.sin(t * 2.2 + i * 1.3 + r.x * 0.01) * ww * 0.25 + snz(t * 1.4 + i, r.x | 0) * ww * 0.2;
      ctx.fillStyle = rgba(r.col, r.a * f * (0.35 + 0.3 * hash(i + (r.x | 0))));
      ctx.fillRect(r.x - ww * (0.3 + 0.25 * f) + wob, yy, ww * (0.6 + 0.5 * f), 3 + f * 3);
    }
  }
  ctx.restore();
}
/** sepia / burgundy flashback grade (screen space) */
function sepiaGrade(ctx, a) {
  if (a <= 0) return;
  setScreen(ctx); ctx.save();
  ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.45 * a; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.3 * a; ctx.fillStyle = '#7a3428'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5 * a; ctx.fillStyle = '#9a6a52'; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
/** cold white-blue time-jump flash (screen space) */
function timeFlash(ctx, a) {
  if (a <= 0) return;
  setScreen(ctx); ctx.save();
  ctx.fillStyle = rgba('#eef4ff', clamp(a)); ctx.fillRect(0, 0, W, H);
  if (a < 1) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, W / 2, H * 0.45, 1400, '#9ab8ff', a * 0.8); }
  ctx.restore();
}
/** ring-shaped electric shock wave */
function shockRing(ctx, t, x, y, r, a, seed, k = 1) {
  if (a <= 0.01 || r <= 1) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [w, col, al] of [[34, '#6a8aff', 0.18], [14, '#b8ccff', 0.45], [4, '#ffffff', 0.9]]) {
    ctx.strokeStyle = rgba(col, al * a); ctx.lineWidth = w * k; ctx.beginPath();
    for (let i = 0; i <= 64; i++) { const u = (i / 64) * TAU, rr = r * (1 + 0.025 * snz(i * 0.7 + t * 30, seed)); ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(u) * rr, y + Math.sin(u) * rr * (o_sy ?? 1)); }
    ctx.closePath(); ctx.stroke();
  }
  for (let i = 0; i < 6; i++) { const u = hash(seed + i + Math.floor(t * 12) * 7) * TAU; arcZap(ctx, t, x + Math.cos(u) * r * 0.92, y + Math.sin(u) * r * 0.92, x + Math.cos(u + 0.12) * r * 1.08, y + Math.sin(u + 0.12) * r * 1.08, a * 0.8, seed + i, 0.4 * k); }
  ctx.restore();
}
let o_sy = 1;   // vertical squash for shockRing (set by caller for perspective)

/** giant lever on its console: pivot P, angle a (0 = pointing right), length L */
function drawLever(ctx, P, a, L, light, t) {
  // console
  ctx.fillStyle = '#1c1218'; ctx.beginPath(); ctx.moveTo(P[0] - 120, P[1] + 640); ctx.lineTo(P[0] - 90, P[1] - 60); ctx.lineTo(P[0] + 90, P[1] - 60); ctx.lineTo(P[0] + 120, P[1] + 640); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgba(ZY.brassHi, 0.3); ctx.fillRect(P[0] - 90, P[1] - 60, 180, 3);
  for (let i = 0; i < 3; i++) { const on = Math.sin(t * 4 + i * 2) > 0; ctx.fillStyle = on ? '#ffb04a' : '#3a2010'; ctx.beginPath(); ctx.arc(P[0] - 50 + i * 50, P[1] + 60, 10, 0, TAU); ctx.fill(); if (on) glow(ctx, P[0] - 50 + i * 50, P[1] + 60, 30, '#ffb04a', 0.6); }
  // quadrant guide
  ctx.strokeStyle = ZY.brassDk; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(P[0], P[1], L * 0.55, -0.45, 0.85); ctx.stroke();
  // bar + handle
  const ex = P[0] + Math.cos(a) * L, ey = P[1] + Math.sin(a) * L;
  ctx.fillStyle = mixc(ZY.brass, '#000', 0.15); ctx.fill(quad(P[0], P[1], ex, ey, 18, 12));
  ctx.fillStyle = rgba(ZY.brassHi, 0.5); ctx.fill(quad(P[0], P[1] - 8, ex, ey - 5, 4, 3));
  const nx = -Math.sin(a), ny = Math.cos(a);
  ctx.fillStyle = '#2a0e12'; ctx.fill(quad(ex - nx * 60, ey - ny * 60, ex + nx * 60, ey + ny * 60, 16, 16));
  ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.arc(P[0], P[1], 40, 0, TAU); ctx.fill();
  ctx.fillStyle = ZY.brass; ctx.beginPath(); ctx.arc(P[0], P[1], 18, 0, TAU); ctx.fill();
  return [ex, ey, nx, ny];
}
/** charred debris pile & beams (morning ruin) */
function drawDebris(ctx, x, y, k, seed) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = '#141012'; ctx.beginPath(); ctx.moveTo(-260, 0); ctx.quadraticCurveTo(-120, -110, 0, -90); ctx.quadraticCurveTo(140, -70, 270, 0); ctx.fill();
  for (let i = 0; i < 5; i++) {
    const a = (hash(seed + i) - 0.5) * 1.6, len = 180 + hash(seed + i + 5) * 220, bx = (hash(seed + i + 9) - 0.5) * 300;
    ctx.save(); ctx.translate(bx, -40); ctx.rotate(a); ctx.fillStyle = '#0c0808'; ctx.fillRect(-len / 2, -14, len, 28);
    ctx.fillStyle = rgba('#3a3034', 0.7); ctx.fillRect(-len / 2, -14, len, 5);
    for (let j = 0; j < 4; j++) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-len / 2 + j * len / 4 + 10, -14, 4, 28); }
    ctx.restore();
  }
  ctx.restore();
}
function drawAsh(ctx, t, x, y, w, h, n, seed, a = 1, col = '#cfc8cc') {
  ctx.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const sp = 40 + hash(seed + i) * 60, px = x + ((hash(seed + i * 3) * w + Math.sin(t * 0.8 + i) * 40 + t * 12) % w), py = y + ((hash(seed + i * 7) * h + t * sp) % h);
    ctx.globalAlpha = a * (0.3 + 0.5 * hash(seed + i * 11));
    ctx.save(); ctx.translate(px, py); ctx.rotate(t * (1 + hash(i)) + i); ctx.fillRect(-3, -1.5, 6, 3); ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/* ---------- character wrappers ---------- */
/** old Kerem, side view, with the time device on his near wrist (drawn in screen space) */
function keremOldSide(ctx, cam, depth, o, dev = {}) {
  const out = o.out || {};
  setCam(ctx, cam, depth);
  drawSideFigure(ctx, Object.assign({ who: 'keremOld', t: 0, out }, o));
  if (out.hand && out.elbow && dev.show !== false) {
    const p = [lerp(out.hand.x, out.elbow.x, 0.2), lerp(out.hand.y, out.elbow.y, 0.2)];
    setScreen(ctx);
    drawTimeDevice(ctx, p[0], p[1], 30 * out.hand.k * (dev.k || 1), o.t || 0, { heat: dev.heat || 0, glow: dev.glow ?? 0.8, ang: dev.ang, rot: Math.atan2(out.elbow.y - out.hand.y, out.elbow.x - out.hand.x) });
    if (dev.spark) for (const sp of dev.spark) sparkBurst(ctx, o.t || 0, sp.t0, p[0], p[1], { n: sp.n || 14, k: out.hand.k * 2.2, seed: sp.seed || 3, col: '#ff8a3a' });
    out.device = { x: p[0], y: p[1], k: out.hand.k };
    setCam(ctx, cam, depth);
  }
  return out;
}
/** foreground rain (screen-aligned, depth 1.3) */
function rainFG(ctx, t, cam, a = 0.35, n = 160, seed = 41, speed = 1700) {
  setCam(ctx, cam, 1.3);
  drawRain(ctx, t, { x: -600, y: -400, w: 2300, h: 2900, n, len: 70, speed, slant: -0.12, width: 1.6, color: '#b8a8e0', alpha: a, seed });
}
