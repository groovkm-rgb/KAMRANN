/* =====================================================================
   THE WELL · 18 s silent short on the shared Art-Deco noir system.
   A man digs until water bursts up, climbs out and celebrates.
   ===================================================================== */
HEAD.digger = { lv: makeLevels(LV_BOSS, { sx: 1.0, jaw: 1.05 }), skin: '#b9875e', hair: '#2a1a12', hairHi: '#5a4030', gray: '#666', grayAmt: 0, hl: HL_FULL, browCol: '#2a1a12', browThick: 1.1, frown: 0.2, eyeOpen: 0.95, iris: '#4a3a2a', nose: 1.08, stubble: 0.3, mustache: true, mouthDown: 0.3, ear: 1, comb: false, hat: { type: 'cap', color: '#4a2c22' } };
OUTFIT.digger = { suit: '#5a2a26', lapel: '#4a2020', shirt: '#5a2a26', tie: '#5a2a26', cuff: '#c8b89a', shoe: '#140c08', plain: true };
const WL = {
  dusk: mkLight({ dir: [0.75, -0.15, 0.55], key: '#ffa850', keyAmt: 0.45, mul: '#3a1e34', rim: '#ffcf8a', rimDir: [1, -0.3], rimW: 5, rimA: 0.85 }),
  pit: mkLight({ dir: [0.7, 0.3, 0.6], key: '#ffb04e', keyAmt: 0.45, mul: '#2a1428', rim: '#a99aee', rimDir: [-0.3, -1], rimW: 4, rimA: 0.75 }),
  dawn: mkLight({ dir: [0.65, -0.3, 0.6], key: '#ffc070', keyAmt: 0.5, mul: '#3a2030', rim: '#ffe0a0', rimDir: [0.8, -0.6], rimW: 5, rimA: 0.85 }),
};
const SHAFT = { x0: 380, x1: 740, top: 640, spacing: 160 };

/* ---------- digging cycle (figure coords: facing right, feet at origin) ---------- */
const DIG = [   // [phase, upper hand (far, T-grip), lower hand (near), bow]
  [0.00, [70, -1010], [250, -900], 0.15],
  [0.30, [150, -880], [320, -720], 0.45],
  [0.55, [60, -990], [270, -930], 0.25],
  [0.80, [20, -1110], [230, -1150], 0.05],
  [1.00, [70, -1010], [250, -900], 0.15],
];
function digPose(t, period = 1.5) {
  const p = ((t % period) + period) % period / period;
  let i = 0; while (i < DIG.length - 2 && p > DIG[i + 1][0]) i++;
  const a = DIG[i], b = DIG[i + 1], f = Ease.inOutSine((p - a[0]) / (b[0] - a[0]));
  const L2 = (u, v) => ({ x: lerp(u[0], v[0], f), y: lerp(u[1], v[1], f) });
  return { p, up: L2(a[1], b[1]), lo: L2(a[2], b[2]), bow: lerp(a[3], b[3], f), loaded: p > 0.42 && p < 0.72 };
}
/** shovel through both hands, drawn in the figure's torso-local frame */
function shovelProp(pose, L) {
  return (ctx, toL) => {
    const U = toL(pose.up), Lo = toL(pose.lo);
    const dx = Lo[0] - U[0], dy = Lo[1] - U[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const a = [U[0] - ux * 70, U[1] - uy * 70], n = [U[0] + ux * 780, U[1] + uy * 780], tip = [n[0] + ux * 250, n[1] + uy * 250];
    ctx.fillStyle = mixc('#6a4424', L.key, L.keyAmt * 0.4); ctx.fill(quad(a[0], a[1], n[0], n[1], 13, 13));
    ctx.fillStyle = '#2a1a10'; ctx.fill(quad(a[0] - uy * 0, a[1], a[0] + ux * 6, a[1] + uy * 6, 44, 44));
    const nx = -uy, ny = ux, blade = pathOf([[n[0] + nx * 20, n[1] + ny * 20], [n[0] + ux * 60 + nx * 74, n[1] + uy * 60 + ny * 74], [tip[0] + nx * 52, tip[1] + ny * 52], [tip[0] + ux * 40, tip[1] + uy * 40], [tip[0] - nx * 52, tip[1] - ny * 52], [n[0] + ux * 60 - nx * 74, n[1] + uy * 60 - ny * 74], [n[0] - nx * 20, n[1] - ny * 20]]);
    ctx.fillStyle = '#2c2a34'; ctx.fill(blade);
    edgeFill(ctx, blade, -L.rimDir[0] * 6, -L.rimDir[1] * 6, L.rim, 0.8);
    if (pose.loaded) { ctx.fillStyle = '#3a2016'; ctx.beginPath(); ctx.ellipse(tip[0] - ux * 110 + nx * 10, tip[1] - uy * 110 + ny * 10 - 30, 90, 46, Math.atan2(uy, ux), 0, TAU); ctx.fill(); }
  };
}
/** world position of the blade tip for a pose (for dirt clods & splashes) */
function bladeTip(pose, fx, fy, s) {
  const dx = pose.lo.x - pose.up.x, dy = pose.lo.y - pose.up.y, d = Math.hypot(dx, dy);
  return [fx + (pose.up.x + dx / d * 1030) * s, fy + (pose.up.y + dy / d * 1030) * s];
}

/* ---------- sets ---------- */
function decoSun(ctx, x, y, r, t, a = 1, rays = 22) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < rays; i++) {
    const an = PI + (i + 0.5) / rays * PI + Math.sin(t * 0.2) * 0.01, len = r * (2.6 + (i % 2) * 0.9);
    ctx.fillStyle = rgba('#ffb060', (i % 2 ? 0.05 : 0.09) * a);
    ctx.beginPath(); ctx.moveTo(x + Math.cos(an - 0.035) * r * 1.15, y + Math.sin(an - 0.035) * r * 1.15); ctx.lineTo(x + Math.cos(an) * len, y + Math.sin(an) * len); ctx.lineTo(x + Math.cos(an + 0.035) * r * 1.15, y + Math.sin(an + 0.035) * r * 1.15); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  glow(ctx, x, y, r * 2.6, '#ff9a40', 0.45 * a);
  for (const [k, c] of [[1, '#c8501e'], [0.8, '#e07a2a'], [0.6, '#f2a040'], [0.4, '#ffd27a']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r * k, PI, TAU); ctx.fill(); }
  ctx.strokeStyle = rgba('#3a1020', 0.5); ctx.lineWidth = r * 0.035;
  for (let i = 1; i < 5; i++) { const yy = y - r * i * 0.18; const hw = Math.sqrt(Math.max(0, r * r - (y - yy) * (y - yy))); ctx.beginPath(); ctx.moveTo(x - hw, yy); ctx.lineTo(x + hw, yy); ctx.stroke(); }
}
function steppedHills(ctx, y, col, seed, amp, step) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-600, 2400);
  for (let x = -600; x <= 1700; x += step) { const h = y - amp * (0.4 + 0.6 * hash(seed + x)); ctx.lineTo(x, h); ctx.lineTo(x + step, h); }
  ctx.lineTo(1700, 2400); ctx.closePath(); ctx.fill();
}
function crackedEarth(ctx, y0, y1, seed) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#3a1e1c'); g.addColorStop(1, '#170a0c');
  ctx.fillStyle = g; ctx.fillRect(-600, y0, 2300, y1 - y0);
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 2.2;
  for (let i = 0; i < 46; i++) {
    let x = -300 + hash(seed + i) * 1700, y = y0 + 20 + hash(seed + i + 50) * (y1 - y0); const sc = 0.4 + (y - y0) / (y1 - y0);
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) { x += (hash(seed + i * 9 + k) - 0.5) * 90 * sc; y += (hash(seed + i * 7 + k) - 0.3) * 24 * sc; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.fillStyle = rgba('#ffb060', 0.06); ctx.fillRect(-600, y0, 2300, 6);
}
function deadTree(ctx, x, y, k, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.strokeStyle = col; ctx.lineCap = 'round';
  const br = (len, ang, w, d, seed) => { if (d > 5) return; ctx.lineWidth = w; const ex = Math.sin(ang) * len, ey = -Math.cos(ang) * len; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke(); ctx.save(); ctx.translate(ex, ey); br(len * 0.7, ang - 0.4 - hash(seed) * 0.3, w * 0.62, d + 1, seed * 3 + 1); br(len * 0.68, ang + 0.35 + hash(seed + 1) * 0.3, w * 0.6, d + 1, seed * 3 + 2); ctx.restore(); };
  br(260, -0.05, 34, 0, 7); ctx.restore();
}
function strata(ctx, y0, y1) {
  const bands = [['#3a1e1a', 160], ['#4a2a1e', 120], ['#2e1620', 200], ['#5a3420', 90], ['#24121a', 240], ['#4a2418', 150], ['#2a1622', 220], ['#3e2a26', 400], ['#1e1018', 600]];
  let y = y0, i = 0;
  while (y < y1) {
    const [c, h] = bands[i % bands.length];
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-600, y);
    for (let x = -600; x <= 1700; x += 60) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 10 + (hash(i * 31 + x) - 0.5) * 8);
    ctx.lineTo(1700, y + h + 20); ctx.lineTo(-600, y + h + 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba('#000000', 0.25);
    for (let k = 0; k < 22; k++) { const px = -500 + hash(i * 97 + k) * 2100, py = y + 20 + hash(i * 53 + k) * (h - 20), r = 4 + hash(i * 11 + k) * 14; ctx.beginPath(); ctx.ellipse(px, py, r * 1.4, r, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = rgba('#ffcf8a', 0.06); ctx.fillRect(-600, y, 2300, 3);
    y += h; i++;
  }
}
function ladder(ctx, xL, xR, y0, y1, L) {
  const wood = mixc('#5a3a20', L.key, L.keyAmt * 0.3);
  ctx.fillStyle = wood; ctx.fillRect(xL - 9, y0, 18, y1 - y0); ctx.fillRect(xR - 9, y0, 18, y1 - y0);
  for (let y = y0 + SHAFT.spacing; y < y1; y += SHAFT.spacing) { ctx.fillStyle = darken(wood, 0.15); ctx.fillRect(xL, y - 7, xR - xL, 14); ctx.fillStyle = rgba('#ffcf8a', 0.25); ctx.fillRect(xL, y - 7, xR - xL, 2); }
}
function lantern(ctx, x, y, k, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  const f = 0.9 + 0.1 * snz(t * 6, 4);
  glow(ctx, 0, -60, 420, '#ffa84a', 0.42 * f); glow(ctx, 0, -60, 90, '#fff0c0', 0.6 * f);
  ctx.fillStyle = '#1a120c'; ctx.fillRect(-36, -12, 72, 14); ctx.fillRect(-30, -112, 60, 12);
  ctx.fillStyle = rgba('#ffd890', 0.9 * f); ctx.fill(pathOf([[-28, -100], [28, -100], [24, -12], [-24, -12]]));
  ctx.fillStyle = '#1a120c'; ctx.fillRect(-3, -100, 6, 88); ctx.beginPath(); ctx.moveTo(-34, -112); ctx.lineTo(0, -140); ctx.lineTo(34, -112); ctx.fill();
  ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -150, 14, PI, TAU); ctx.stroke();
  ctx.restore();
}
/** deterministic water droplets: a fountain from (x,y) */
function fountain(ctx, t, x, y, n, h, spread, a, seed) {
  for (let i = 0; i < n; i++) {
    const per = 0.7 + hash(seed + i) * 0.5, age = ((t + hash(seed + i + 9) * per) % per) / per;
    const vx = (hash(seed + i + 3) - 0.5) * spread, vy = h * (0.6 + hash(seed + i + 5) * 0.6);
    const px = x + vx * age, py = y - vy * age + 0.5 * 2 * vy * age * age;
    const r = 3 + hash(seed + i + 7) * 6;
    ctx.fillStyle = rgba('#c8d0ff', a * (1 - age * 0.6)); ctx.beginPath(); ctx.ellipse(px, py, r * 0.8, r * 1.2, 0, 0, TAU); ctx.fill();
    if (hash(seed + i + 11) < 0.25) glow(ctx, px, py, r * 3, '#ffffff', a * 0.4 * (1 - age));
  }
}
function waterBody(ctx, x0, x1, top, bottom, t, a = 1) {
  if (bottom <= top) return;
  const g = ctx.createLinearGradient(0, top, 0, bottom); g.addColorStop(0, rgba('#6a78c8', 0.85 * a)); g.addColorStop(1, rgba('#24204a', 0.95 * a));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, bottom);
  for (let x = x0; x <= x1; x += 12) ctx.lineTo(x, top + Math.sin(x * 0.05 + t * 6) * 5 + Math.sin(x * 0.13 - t * 4) * 3);
  ctx.lineTo(x1, bottom); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rgba('#e0e4ff', 0.7 * a); ctx.lineWidth = 3; ctx.beginPath();
  for (let x = x0; x <= x1; x += 12) ctx[x === x0 ? 'moveTo' : 'lineTo'](x, top + Math.sin(x * 0.05 + t * 6) * 5 + Math.sin(x * 0.13 - t * 4) * 3); ctx.stroke();
  for (let i = 0; i < 8; i++) { const bx = x0 + hash(i * 7) * (x1 - x0), by = bottom - ((t * 160 + hash(i) * 600) % Math.max(1, bottom - top)); ctx.strokeStyle = rgba('#e0e4ff', 0.4 * a); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 5 + hash(i + 3) * 6, 0, TAU); ctx.stroke(); }
}

/* ===================== SHOT 1 · 0–5.5 s · the dry field ===================== */
function wl1(ctx, t) {
  const cam = track(t, [[0, { x: 520, y: 1100, z: 1.0 }], [6, { x: 560, y: 1180, z: 1.18 }, Ease.inOutSine]]);
  setCam(ctx, cam, 0.05);
  const sky = ctx.createLinearGradient(0, -600, 0, 1100); sky.addColorStop(0, '#120a1c'); sky.addColorStop(0.5, '#3a1838'); sky.addColorStop(0.85, '#7a2a30'); sky.addColorStop(1, '#c0562a');
  ctx.fillStyle = sky; ctx.fillRect(-700, -700, 2500, 1900);
  decoSun(ctx, 760, 1010, 230, t);
  setCam(ctx, cam, 0.2); steppedHills(ctx, 1000, '#2a1226', 3, 120, 80);
  setCam(ctx, cam, 0.35); steppedHills(ctx, 1040, '#1c0c1a', 9, 90, 140); deadTree(ctx, 120, 1050, 1.1, '#120810');
  setCam(ctx, cam, 1);
  crackedEarth(ctx, 1050, 2300, 21);
  // the pit and its spoil heap
  const pd = prog(t, 0, 5.5, Ease.linear), hx = 560, hy = 1560, hrx = 300, hry = 78;
  ctx.fillStyle = '#0c0406'; ctx.beginPath(); ctx.ellipse(hx, hy, hrx, hry, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a120e'; ctx.beginPath(); ctx.ellipse(hx, hy + 6, hrx - 24, hry - 18, 0, PI, TAU); ctx.fill();
  ctx.fillStyle = '#160a0a'; ctx.beginPath(); ctx.ellipse(hx, hy + 14, hrx - 40, hry - 30, 0, PI, TAU); ctx.fill();
  const heapH = 90 + pd * 70;
  ctx.fillStyle = '#4a2a1c'; ctx.beginPath(); ctx.moveTo(860, 1600); ctx.quadraticCurveTo(980, 1600 - heapH * 2.1, 1140, 1600); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgba('#ffb060', 0.18); ctx.beginPath(); ctx.moveTo(900, 1580); ctx.quadraticCurveTo(980, 1600 - heapH * 2.0, 1020, 1560); ctx.lineTo(1010, 1570); ctx.quadraticCurveTo(980, 1610 - heapH * 1.8, 910, 1585); ctx.fill();
  // the digger, standing thigh-deep in the pit
  const pose = digPose(t), fx = 470, fy = 1790, s = 0.44, o1 = {};
  drawSideFigure(ctx, { x: fx, y: fy, s, who: 'boss', face: 1, bow: pose.bow, hand: pose.lo, handPose: 'grip', farHand: pose.up, prop: shovelProp(pose, WL.dusk), headTurn: 0.55, light: WL.dusk, t, cigar: true, out: o1, head: { cigarSide: -1, pitch: 0.12, glint: 0.6, frown: 0.3 } });
  // the near half of the ground (in front of the hole) hides his legs
  ctx.save(); ctx.beginPath(); ctx.moveTo(-600, hy); ctx.lineTo(hx - hrx, hy); ctx.ellipse(hx, hy, hrx, hry, 0, PI, 0, true); ctx.lineTo(1700, hy); ctx.lineTo(1700, 2400); ctx.lineTo(-600, 2400); ctx.closePath(); ctx.clip();
  crackedEarth(ctx, hy - 10, 2400, 33);
  ctx.restore();
  ctx.strokeStyle = rgba('#ffb060', 0.25); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(hx, hy, hrx, hry, 0, 0.05, PI - 0.05); ctx.stroke();
  ctx.fillStyle = '#4a2a1c'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(hx - hrx + 40 + i * 66, hy + hry - 4 + Math.sin(i) * 6, 26, 12, 0, 0, TAU); ctx.fill(); }
  // flying dirt clods
  if (pose.p > 0.62) {
    const f = (pose.p - 0.62) / 0.38, src = bladeTip(digPose(t - (pose.p - 0.66) * 1.5), fx, fy, s);
    src[1] = Math.min(src[1], hy - 40);
    for (let i = 0; i < 7; i++) {
      const ff = clamp(f * (1.1 + hash(i) * 0.4)), x = lerp(src[0], 990 + (hash(i + 3) - 0.5) * 120, ff), y = lerp(src[1], 1520, ff) - Math.sin(ff * PI) * (160 + hash(i + 5) * 80);
      if (ff < 1) { ctx.fillStyle = '#3a2016'; ctx.beginPath(); ctx.ellipse(x, y, 10 + hash(i) * 10, 8 + hash(i + 1) * 8, i, 0, TAU); ctx.fill(); }
    }
  }
  setScreen(ctx); drawHaze(ctx, t, 0, 900, W, 900, '#7a3a3a', 0.07, 5, 3);
  setCam(ctx, cam, 1); drawDust(ctx, t, 300, 1300, 700, 400, 40, '#ffcf8a', 0.35, 4, 1.4);
}

/* ===================== SHOT 2 · 5.5–13.5 s · the well shaft (cross-section) ===================== */
function wl2(ctx, t) {
  const B = SHAFT.top + lerp(860, 1300, prog(t, 0, 4.2, Ease.linear));   // the bottom deepens as he digs
  const water = t >= 4.2, wRise = prog(t, 4.25, 8.4, Ease.outQuad);
  const climbP = prog(t, 5.3, 7.9, Ease.inOutSine);
  const fyClimb = lerp(B, SHAFT.top + 10, climbP);
  const fy = t < 5.3 ? B : fyClimb;
  const camY = t < 5.3 ? lerp(SHAFT.top + 300, B - 380, prog(t, 0, 1.8, Ease.inOutSine)) : fy - 420;
  const cam = { x: 560, y: camY, z: 1.0 };
  // sky & surface
  setCam(ctx, cam, 0.3);
  const sky = ctx.createLinearGradient(0, -400, 0, SHAFT.top); sky.addColorStop(0, '#0e0816'); sky.addColorStop(1, '#5a2030');
  ctx.fillStyle = sky; ctx.fillRect(-700, -900, 2500, SHAFT.top + 2400);
  steppedHills(ctx, SHAFT.top - 20, '#2a1226', 3, 90, 90);
  setCam(ctx, cam, 1);
  strata(ctx, SHAFT.top, B + 1400);
  ctx.fillStyle = '#2a120e'; ctx.fillRect(-600, SHAFT.top - 26, 2300, 30);
  ctx.fillStyle = rgba('#ffb060', 0.3); ctx.fillRect(-600, SHAFT.top - 26, 2300, 3);
  // the shaft
  const sg = ctx.createLinearGradient(SHAFT.x0, 0, SHAFT.x1, 0); sg.addColorStop(0, '#0a0508'); sg.addColorStop(0.5, '#1c0e12'); sg.addColorStop(1, '#0c0608');
  ctx.fillStyle = sg; ctx.fillRect(SHAFT.x0, SHAFT.top, SHAFT.x1 - SHAFT.x0, B - SHAFT.top);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3;
  for (let y = SHAFT.top + 40; y < B; y += 70) for (let k = 0; k < 3; k++) { const x = SHAFT.x0 + 40 + hash(y + k) * 280; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8, y + 50); ctx.stroke(); }
  for (const x of [SHAFT.x0, SHAFT.x1]) { ctx.fillStyle = rgba('#ffcf8a', 0.12); ctx.fillRect(x - 3, SHAFT.top, 6, B - SHAFT.top); }
  ladder(ctx, 650, 714, SHAFT.top - 560, B, WL.pit);   // the ladder stands well above the rim, so hands always find a rung
  // lantern on the floor lights the pit
  lantern(ctx, 600, B, 0.9, t);
  // dropped shovel after the strike
  if (water && t > 4.5) { ctx.save(); ctx.translate(460, B); ctx.scale(0.5, 0.5); ctx.rotate(-0.05); ctx.fillStyle = '#6a4424'; ctx.fillRect(-500, -30, 700, 22); ctx.fillStyle = '#2c2a34'; ctx.beginPath(); ctx.ellipse(270, -20, 110, 40, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  // the man (the boss)
  const s = 0.5, o2 = {};
  if (t < 4.3) {
    const pose = digPose(t, 1.2);
    drawSideFigure(ctx, { x: 470, y: fy, s, who: 'boss', face: 1, bow: pose.bow, hand: pose.lo, handPose: 'grip', farHand: pose.up, prop: shovelProp(pose, WL.pit), headTurn: 0.55, light: WL.pit, t, cigar: true, out: o2, head: { cigarSide: -1, pitch: 0.14, glint: 0.7, frown: 0.35 } });
  } else if (t < 5.3) {
    // the strike: surprise, then both fists up in joy
    const joy = prog(t, 4.45, 4.85, Ease.outBack), pump = Math.sin((t - 4.85) * 14) * 50 * prog(t, 4.85, 5.0);
    drawSideFigure(ctx, { x: 470, y: fy, s, who: 'boss', face: 1, lean: -0.08 * joy, hand: { x: lerp(250, 150, joy), y: lerp(-900, -1820, joy) + pump * 0.5 }, handPose: 'fist', farHand: { x: lerp(70, 30, joy), y: lerp(-1000, -1840, joy) - pump * 0.5 }, farPose: 'fist', headTurn: 0.55, light: WL.pit, t,
      head: { pitch: lerp(0.3, -0.35, joy), glint: 1, eyeOpen: 1.2, frown: -0.5, mouthOpen: 1.1 * joy } });
  } else {
    // climbing the ladder: hands snap rung to rung, knees lift alternately
    const ph = (fy - B) / (SHAFT.spacing * 2) * TAU, rung = y => SHAFT.top + SHAFT.spacing * Math.ceil((y - SHAFT.top) / SHAFT.spacing);
    const grab = (off) => { const tgt = fy - 620 - off; const r1 = rung(tgt), fr = (r1 - tgt) / SHAFT.spacing; return fr > 0.7 ? lerp(r1 + SHAFT.spacing, r1, Ease.inOutSine((fr - 0.7) / 0.3)) : r1; };
    const nh = { x: (676 - 520) / s, y: (grab(0) - fy) / s }, fh = { x: (664 - 520) / s, y: (grab(SHAFT.spacing) - fy) / s };
    drawSideFigure(ctx, { x: 520, y: fy, s, who: 'boss', face: 1, climb: -ph, hand: nh, handPose: 'grip', farHand: fh, farPose: 'grip', headTurn: 0.45, light: WL.pit, t, cigar: true, out: o2, head: { cigarSide: -1, pitch: -0.3, glint: 1, frown: -0.3 } });
  }
  // the water: a burst, then it fills the well beneath him
  if (water) {
    const wt = t - 4.2, burst = Math.exp(-wt * 1.3);
    const wTop = B - 40 - wRise * 900;
    waterBody(ctx, SHAFT.x0, SHAFT.x1, wTop, B + 4, t, 1);
    fountain(ctx, t, 600, B - 10 - wRise * 900, 70, 900 * burst + 260, 500, 0.85, 3);
    glow(ctx, 600, wTop, 300, '#9aa8ff', 0.25 + burst * 0.4);
  }
  setScreen(ctx); drawHaze(ctx, t, 0, 0, W, H, '#5a3a3a', 0.05, 4, 7);
  if (t > 4.15 && t < 4.4) { setScreen(ctx); withOp(ctx, 'lighter', () => { ctx.fillStyle = rgba('#c8d0ff', (1 - (t - 4.15) / 0.25) * 0.25); ctx.fillRect(0, 0, W, H); }); }
}

/* ===================== SHOT 3 · 13.5–18 s · joy at sunrise ===================== */
function wl3(ctx, t) {
  const cam = track(t, [[-0.6, { x: 560, y: 1160, z: 1.0 }], [4.8, { x: 540, y: 1280, z: 1.16 }, Ease.inOutSine]]);
  setCam(ctx, cam, 0.05);
  const sky = ctx.createLinearGradient(0, -600, 0, 1150); sky.addColorStop(0, '#2a1438'); sky.addColorStop(0.5, '#7a3048'); sky.addColorStop(0.85, '#e07a3a'); sky.addColorStop(1, '#ffc070');
  ctx.fillStyle = sky; ctx.fillRect(-700, -700, 2500, 1950);
  decoSun(ctx, 540, 1150 - t * 6, 300, t, 1.2, 26);
  setCam(ctx, cam, 0.2); steppedHills(ctx, 1150, '#4a1e30', 13, 110, 90);
  setCam(ctx, cam, 0.35); steppedHills(ctx, 1190, '#2a1020', 17, 70, 160);
  setCam(ctx, cam, 1);
  const gg = ctx.createLinearGradient(0, 1200, 0, 2300); gg.addColorStop(0, '#5a2a22'); gg.addColorStop(1, '#1e0c0c');
  ctx.fillStyle = gg; ctx.fillRect(-600, 1200, 2300, 1100);
  ctx.fillStyle = rgba('#ffc070', 0.25); ctx.fillRect(-600, 1200, 2300, 4);
  // spreading puddle
  const pud = prog(t, -0.5, 4.5, Ease.outSine);
  ctx.fillStyle = rgba('#7a80c8', 0.55); ctx.beginPath(); ctx.ellipse(760, 1650, 220 + pud * 260, 40 + pud * 40, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba('#ffd090', 0.35); ctx.beginPath(); ctx.ellipse(720, 1640, 120 + pud * 120, 8, 0, 0, TAU); ctx.fill();
  // the stone well with windlass, overflowing
  const wx = 760, wy = 1560;
  ctx.fillStyle = '#2a1a16'; ctx.fillRect(wx - 230, 1100, 22, wy - 1100); ctx.fillRect(wx + 208, 1100, 22, wy - 1100);
  ctx.fillStyle = '#3a2418'; ctx.fill(pathOf([[wx - 270, 1110], [wx, 1000], [wx + 270, 1110], [wx + 250, 1124], [wx - 250, 1124]]));
  ctx.fillStyle = '#5a3a20'; ctx.fillRect(wx - 220, 1230, 440, 18); ctx.strokeStyle = '#c8a070'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + 40, 1248); ctx.lineTo(wx + 40, 1400); ctx.stroke();
  ctx.fillStyle = '#4a3020'; ctx.fillRect(wx + 18, 1400, 44, 40);
  const st = ctx.createLinearGradient(wx - 200, 0, wx + 200, 0); st.addColorStop(0, '#2a2028'); st.addColorStop(0.4, '#5a4a52'); st.addColorStop(1, '#1e161c');
  ctx.fillStyle = st; ctx.fillRect(wx - 200, wy - 170, 400, 170); ctx.beginPath(); ctx.ellipse(wx, wy, 200, 46, 0, 0, PI); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3;
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { const x = wx - 200 + k * 70 + (r % 2) * 35, y = wy - 170 + r * 42; ctx.strokeRect(x, y, 70, 42); }
  ctx.fillStyle = '#6a5a62'; ctx.beginPath(); ctx.ellipse(wx, wy - 170, 210, 50, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#6a78c8'; ctx.beginPath(); ctx.ellipse(wx, wy - 170, 180, 36, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba('#e8ecff', 0.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(wx, wy - 170, 150 + Math.sin(t * 5) * 10, 28, 0, 0, TAU); ctx.stroke();
  // overflow streams down the stones
  for (let i = 0; i < 7; i++) { const x = wx - 170 + i * 56 + Math.sin(t * 3 + i) * 4; const g2 = ctx.createLinearGradient(0, wy - 170, 0, wy + 30); g2.addColorStop(0, rgba('#a8b4ff', 0.75)); g2.addColorStop(1, rgba('#a8b4ff', 0.1)); ctx.fillStyle = g2; ctx.fillRect(x, wy - 170, 10 + (i % 3) * 4, 200); }
  fountain(ctx, t, wx, wy - 180, 60, 420, 360, 0.85, 17);
  glow(ctx, wx, wy - 200, 300, '#c8d0ff', 0.25);
  // wooden chair + the celebrating man
  const cx = 330, s = 0.6, fy = 1740, seatY = fy - 330 * s;
  ctx.fillStyle = '#3a2214';
  ctx.fillRect(cx - 120, seatY - 8, 230, 22); ctx.fillRect(cx - 115, seatY, 16, 330 * s + 8); ctx.fillRect(cx + 88, seatY, 16, 330 * s + 8);
  ctx.fillRect(cx - 130, seatY - 330, 18, 340); ctx.fillRect(cx - 130, seatY - 330, 18, 18);
  for (const y of [seatY - 300, seatY - 220, seatY - 140]) ctx.fillRect(cx - 132, y, 20, 20);
  ctx.fillStyle = rgba('#ffc070', 0.35); ctx.fillRect(cx - 120, seatY - 8, 230, 3); ctx.fillRect(cx - 114, seatY - 330, 3, 330);
  const pump = Math.sin(t * 9) * 55, joy = prog(t, -0.4, 0.4, Ease.outCubic);
  drawSideFigure(ctx, { x: cx, y: fy, s, who: 'boss', face: 1, sit: 1, seatH: 330, lean: -0.12, hand: { x: lerp(260, 330, joy), y: lerp(-560, -1260, joy) + pump * 0.6 }, handPose: 'fist', farHand: { x: lerp(120, -150, joy), y: lerp(-560, -1290, joy) - pump * 0.6 }, farPose: 'fist', headTurn: 0.7, light: WL.dawn, t,
    head: { pitch: -0.28 + Math.sin(t * 9) * 0.04, glint: 1, squint: 0.4, frown: -0.5, mouthOpen: 1.15, glasses: 'shades' } });
  // droplets catching the sun
  setCam(ctx, cam, 1.05); drawDust(ctx, t, 300, 900, 700, 700, 50, '#ffe6b0', 0.5, 6, 2);
  setScreen(ctx); drawHaze(ctx, t, 0, 800, W, 900, '#c86a3a', 0.06, 5, 11);
}

const SCENES = [
  { id: 1, name: 'The Dig', start: 0, end: 5.5, draw: wl1 },
  { id: 2, name: 'Water', start: 5.5, end: 13.5, draw: wl2 },
  { id: 3, name: 'Joy', start: 13.5, end: 18, draw: wl3 },
];
const TRANS = [
  { at: 5.5, type: 'dissolve', dur: 0.8 },
  { at: 13.5, type: 'dissolve', dur: 0.9 },
];
