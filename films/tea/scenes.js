/* =====================================================================
   "Tea" — 10 s. The boss, alone in his midnight office, drinks a glass
   of tea. Every function is a pure function of local time t.
   ===================================================================== */
const LT = {
  desk: mkLight({ dir: [-0.78, 0.3, 0.5], key: '#ffa84e', keyAmt: 0.46, mul: '#45253f', rim: '#a99aee', rimDir: [0.15, -1], rimW: 5, rimA: 0.85 }),
  cu: mkLight({ dir: [-0.8, 0.1, 0.55], key: '#ffa84e', keyAmt: 0.42, mul: '#3e2240', rim: '#b4a4f4', rimDir: [1, -0.3], rimW: 5, rimA: 0.85 }),
};
const BOSS = { x: 540, y: 905, s: 0.82 };       // seated boss in the office
const GLASS = { x: -40, y: 410 };               // glass base on the saucer, boss-local units
const toW = (lx, ly) => ({ x: BOSS.x + lx * BOSS.s, y: BOSS.y + ly * BOSS.s });

/* shared office: wall, rainy window, chair. Returns nothing; leaves cam at depth 1. */
function office(ctx, t, cam, fl) {
  setCam(ctx, cam, 0.9);
  const wg = ctx.createLinearGradient(0, 0, 0, 1400); wg.addColorStop(0, '#0d0911'); wg.addColorStop(1, '#1c1220');
  ctx.fillStyle = wg; ctx.fillRect(-500, -500, 2080, 2900);
  drawFrieze(ctx, -100, 40, 1280, 46, '#120c14', rgba(PAL.amb1, 0.45));
  for (const px of [-60, 170, 850, 1080]) drawPilaster(ctx, px, 90, 64, 1300, '#1a1220');
  paintOverlay(ctx, -200, -100, 1480, 1600, 0.4);
  const wp = archPath(250, 150, 580, 1100, 290);
  ctx.save(); ctx.clip(wp);
  drawCity(ctx, t, cam, { flash: fl, sky: [100, -100, 900, 1500], hz: 0.62, seed: 3,
    beams: [{ x: 300, y: 1200, a0: 0.25, amp: 0.25, sp: 0.35, ph: 0, len: 1300, w: 70, alpha: 0.07 }],
    layers: [{ sky: SKY.far, d: 0.18, x: -150, y: 170, k: 0.62, haze: '#3a1a30' }, { sky: SKY.mid, d: 0.26, x: -250, y: 100, k: 0.6, haze: '#2a1228' }, { sky: SKY.near, d: 0.36, x: -300, y: 330, k: 0.55 }],
    rain: [{ d: 0.5, x: 0, y: -200, w: 1100, h: 1700, n: 150, len: 40, speed: 1400, slant: -0.12, width: 1, color: '#9a8ac8', alpha: 0.35, seed: 11 }] });
  ctx.restore();
  setCam(ctx, cam, 0.9);
  ctx.save(); ctx.clip(wp); drawGlassRain(ctx, t, 250, 150, 580, 1100, { seed: 2, n: 22 }); ctx.restore();
  drawWindowFrame(ctx, 250, 150, 580, 1100, 290, { cols: 4, rows: 4, bar: 12, rays: 8, edgeA: 0.3 + fl * 0.7 });
  drawSconce(ctx, 104, 468, 0.72, 0.85); drawSconce(ctx, 976, 468, 0.72, 0.85);
  shaft(ctx, [[270, 600], [810, 600], [1100, 1700], [-20, 1700]], '#8a78d0', 0.05 + fl * 0.18);
  setCam(ctx, cam, 1);
  drawBossChair(ctx, 540, 560, 450, 1260, withL(LT.desk, fl));
}
/* desk + props in front of the boss (after his body, before his hands) */
function deskProps(ctx, t, L) {
  drawDeskFront(ctx, 70, 1208, 940, 760, L, { th: 56, reflect: [260, 0.55, 260] });
  drawRainShadows(ctx, t, 300, 1210, 480, 50, { n: 14, alpha: 0.16, scale: 0.6, seed: 4 });
  drawAshtray(ctx, 820, 1250, 0.62, L);
  const cOut = {}; drawRestingCigar(ctx, 790, 1244, -0.25, 140, 0.62, t, L, cOut);
  const sc = toW(GLASS.x, GLASS.y);
  drawTeaSaucer(ctx, sc.x, sc.y + 2, BOSS.s, L);
  return cOut;
}

/* ===== SHOT 1 · 0–3.6 · the office; the boss eyes his steaming tea and reaches for it ===== */
function shot1(ctx, t) {
  const cam = track(t, [[-0.4, { x: 540, y: 1000, z: 1.0 }], [4.0, { x: 520, y: 1010, z: 1.75 }, Ease.inOutQuad]]);
  cam.x += Math.sin(t * 0.45) * 4;
  const fl = flashAt(t, [{ t: 1.2, peak: 0.45 }]);
  const L = withL(LT.desk, fl);
  office(ctx, t, cam, fl);
  const look = prog(t, 0.4, 1.6, Ease.inOutCubic), reach = prog(t, 2.0, 3.0, Ease.inOutCubic), lift = prog(t, 3.1, 4.0, Ease.inOutCubic);
  const boss = { x: BOSS.x, y: BOSS.y, s: BOSS.s, light: L, flash: fl * 0.4, t, breath: Math.sin(t * 1.3) * 0.5 + 0.5, cigar: false,
    head: { pitch: lerp(0.05, 0.3, look), yaw: lerp(0.0, -0.08, look), gaze: [lerp(0, -0.2, look), lerp(0, 0.7, look)], glint: 0.8, squint: 0.2, frown: 0.15 } };
  drawBossSeatedFront(ctx, boss);
  const cOut = deskProps(ctx, t, L);
  // glass (lifts a little at the very end)
  const gl = { x: GLASS.x, y: GLASS.y - 70 * lift };
  const gw = toW(gl.x, gl.y);
  drawTeaGlass(ctx, gw.x, gw.y, BOSS.s, L);
  // hands: left hand flat on the desk; right hand slides over and grips the glass
  drawBossHandsOnly(ctx, boss, { handL: { x: 150, y: 352, rot: -PI * 0.6, fs: 0.8, pose: 'flat' }, elbowL: [262, 360] });
  if (reach < 0.6) {
    const k = reach / 0.6;
    drawBossHandsOnly(ctx, boss, { handR: { x: lerp(-170, -120, k), y: lerp(356, 372, k), rot: lerp(PI * 0.6, PI * 0.56, k), fs: 0.8, pose: 'rest' }, elbowR: [-262, 360] });
  } else {
    ctx.save(); ctx.translate(BOSS.x, BOSS.y); ctx.scale(BOSS.s, BOSS.s);
    const close = prog(reach, 0.6, 1);
    holdGlassHand(ctx, gl.x - 8 * (1 - close), gl.y - 62, 1, 1, L, -250, 375 - 40 * lift, { pose: mixPose(HAND_POSE.rest, HAND_POSE.grip, close), glint: 0.5 });
    ctx.restore();
  }
  const rim = teaRim(gw.x, gw.y, BOSS.s);
  teaSteam(ctx, t, rim.x, rim.y, 0.9, { seed: 5 });
  drawDecoLamp(ctx, 232, 1250, 0.74, L, t);
  smokeFrom(ctx, t, cOut, { k: 0.8, alpha: 0.35, height: 600, seed: 1 });
  setCam(ctx, cam, 1.3); drawCurtain(ctx, -260, -400, 300, 2800, '#3a0e18', t, 2);
  setScreen(ctx); drawHaze(ctx, t, 0, 300, W, 1300, '#6a5a8a', 0.08, 6, 2);
  setCam(ctx, cam, 1); glow(ctx, 232, 1000, 520, '#ff9a40', 0.1, 'lighter');
}

/* ===== SHOT 2 · 3.6–7.0 · close-up: the sip ===== */
const CU = { x: 540, y: 1480, s: 2.3 };
function shot2(ctx, t) {
  const cam = { x: 545, y: lerp(1250, 1210, prog(t, -0.3, 3.7)), z: lerp(1.25, 1.38, prog(t, -0.3, 3.7, Ease.inOutSine)) };
  setCam(ctx, cam, 0.6);
  ctx.fillStyle = '#08060a'; ctx.fillRect(-900, -900, 2880, 3700);
  bokeh(ctx, t, 12, 500, ['#ffb050', '#8a70d0', '#e07040'], 0.22, -100, -100, 1300, 1400);
  setCam(ctx, cam, 1);
  const up = prog(t, 0.0, 1.0, Ease.inOutCubic), sip = prog(t, 1.0, 1.6, Ease.inOutSine), down = prog(t, 2.4, 3.4, Ease.inOutCubic);
  const close = prog(t, 0.7, 1.1) * (1 - prog(t, 2.3, 2.6));
  drawBossSeatedFront(ctx, { x: CU.x, y: CU.y, s: CU.s, light: LT.cu, t, cigar: false, breath: Math.sin(t * 1.2) * 0.5 + 0.5,
    head: { pitch: lerp(0.12, -0.04, sip) + down * 0.06, yaw: 0.08, gaze: [-0.1, lerp(0.5, 0, up)], eyeOpen: lerp(1, 0.12, close), squint: 0.2 + 0.25 * down, glint: 1 - close, frown: lerp(0.1, -0.15, down), socket: 0.1 } });
  // glass path: rises from below to the lips, tilts for the sip, lowers again
  const lipX = 552, lipY = 1272;
  const pos = up * (1 - down);
  const tilt = lerp(0.12, 0.5, sip) * (1 - down);
  const rimX = lerp(520, lipX, pos), rimY = lerp(1760, lipY, pos);
  const k = 2.8;
  const bx = rimX - Math.sin(tilt) * 100 * k, by = rimY + Math.cos(tilt) * 100 * k;
  drawTeaGlass(ctx, bx, by, k, LT.cu, { tilt, level: lerp(0.86, 0.7, prog(t, 1.2, 2.2)) });
  // hand on the glass waist (tilts with the glass)
  const wy = -62 * k;
  const gx = bx - Math.sin(tilt) * wy, gy = by + Math.cos(tilt) * wy;
  holdGlassHand(ctx, gx, gy, k * 0.9, 1, LT.cu, gx - 600, gy + 300, { rot: tilt - 0.2, glint: 0.6 });
  if (down > 0.3 || pos < 0.6) { const r = teaRim(bx, by, k, tilt); teaSteam(ctx, t, r.x, r.y, 2.0, { alpha: 0.18 * clamp(1 - pos + down), seed: 9 }); }
  setScreen(ctx); drawHaze(ctx, t, 0, 0, W, H, '#7a6070', 0.05, 5, 41);
}

/* ===== SHOT 3 · 7.0–10 · glass back on the saucer; he leans back, content ===== */
function shot3(ctx, t) {
  const cam = track(t, [[-0.4, { x: 530, y: 960, z: 1.7 }], [3.2, { x: 540, y: 990, z: 1.35 }, Ease.inOutSine]]);
  const fl = flashAt(t, [{ t: 1.7, peak: 0.35 }]);
  const L = withL(LT.desk, fl);
  office(ctx, t, cam, fl);
  const set = prog(t, -0.3, 0.7, Ease.inOutCubic), rel = prog(t, 0.8, 1.5, Ease.inOutCubic), relax = prog(t, 0.6, 2.0, Ease.inOutSine);
  const boss = { x: BOSS.x, y: BOSS.y + relax * 6, s: BOSS.s, light: L, flash: fl * 0.4, t, breath: Math.sin(t * 1.0) * 0.5 + 0.5, cigar: false,
    head: { pitch: lerp(0.1, -0.12, relax), yaw: lerp(-0.05, 0.06, relax), gaze: [0, lerp(0.4, -0.1, relax)], eyeOpen: lerp(0.9, 0.35, relax), squint: lerp(0.2, 0.35, relax), glint: 0.9, frown: lerp(0.1, -0.25, relax) } };
  drawBossSeatedFront(ctx, boss);
  const cOut = deskProps(ctx, t, L);
  const gl = { x: GLASS.x, y: GLASS.y - 70 * (1 - set) };
  const gw = toW(gl.x, gl.y);
  drawTeaGlass(ctx, gw.x, gw.y, BOSS.s, L, { level: 0.55 });
  drawBossHandsOnly(ctx, boss, { handL: { x: 150, y: 352, rot: -PI * 0.6, fs: 0.8, pose: 'flat' }, elbowL: [262, 360] });
  if (rel < 0.4) {
    ctx.save(); ctx.translate(BOSS.x, BOSS.y); ctx.scale(BOSS.s, BOSS.s);
    holdGlassHand(ctx, gl.x - 8 * (rel / 0.4), gl.y - 62, 1, 1, L, -250, 375 - 40 * (1 - set), { pose: mixPose(HAND_POSE.grip, HAND_POSE.rest, rel / 0.4), glint: 0.5 });
    ctx.restore();
  } else {
    const k = (rel - 0.4) / 0.6;
    drawBossHandsOnly(ctx, boss, { handR: { x: lerp(-120, -170, k), y: lerp(372, 356, k), rot: lerp(PI * 0.56, PI * 0.6, k), fs: 0.8, pose: 'rest', glint: pulse(t, 1.8, 2.6, 0.3) * 0.8 }, elbowR: [-262, 360] });
  }
  const rim = teaRim(gw.x, gw.y, BOSS.s);
  teaSteam(ctx, t, rim.x, rim.y, 0.9, { alpha: 0.18, seed: 13 });
  drawDecoLamp(ctx, 232, 1250, 0.74, L, t);
  smokeFrom(ctx, t, cOut, { k: 0.8, alpha: 0.35, height: 600, seed: 3 });
  setCam(ctx, cam, 1.3); drawCurtain(ctx, -260, -400, 300, 2800, '#3a0e18', t, 2);
  setScreen(ctx); drawHaze(ctx, t, 0, 300, W, 1300, '#6a5a8a', 0.08, 6, 2);
  setCam(ctx, cam, 1); glow(ctx, 232, 1000, 520, '#ff9a40', 0.1, 'lighter');
}

/* ---- master timeline ---- */
const SCENES = [
  { id: 1, name: 'The Tea', start: 0, end: 3.6, draw: shot1 },
  { id: 2, name: 'The Sip', start: 3.6, end: 7.0, draw: shot2 },
  { id: 3, name: 'Content', start: 7.0, end: 10, draw: shot3 },
];
const TRANS = [{ at: 3.6, type: 'dissolve', dur: 0.5 }, { at: 7.0, type: 'dissolve', dur: 0.5 }];
