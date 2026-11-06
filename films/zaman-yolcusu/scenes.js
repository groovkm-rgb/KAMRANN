/* =====================================================================
   ZAMAN YOLCUSU · 55 s vertical noir short (seamless loop).
   An old inventor goes back to save Elif — and his own time device
   starts the fire. The last shot match-cuts into the first.
   ===================================================================== */

/* ---------- shared street layout ---------- */
const BLD = { x: 250, y: 1440, k: 0.85, d: 0.75 };          // the apartment across the street
const LAMPS_WIDE = [-250, 1150];
const CAM_K0 = { x: 520, y: 950, z: 1.0 }, CAM_K1 = { x: 560, y: 990, z: 1.1 };
const KNEEL = { x: 345, y: 1700, s: 0.56, face: 1, kneel: 1, headTurn: 0.42, lean: 0.03, hand: { x: 150, y: -560 }, handPose: 'rest' };
const KNEEL_HEAD = { pitch: -0.42, gaze: [0.25, -0.7], eyeOpen: 1.12, frown: -0.45, mouthOpen: 0.25, glint: 0.8 };
const winWorld = (f, c, b = BLD) => { const w = aptWin(f, c); return aptToWorld(b, [w.cx, w.cy]); };

/* building states */
const ST_INTACT = { lit: (f, c) => ({ '1,1': 1, '0,0': 0.7, '2,2': 0.8, '3,0': 0.6, '4,1': 0.7, '0,2': 0.5, '3,2': 0.55 })[f + ',' + c] || 0, elif: 1 };
const ST_FIRE = { fire: (f, c) => ({ '1,1': 1, '1,0': 0.85, '1,2': 0.8, '2,1': 0.95, '2,0': 0.7, '0,1': 0.6, '3,1': 0.75, '2,2': 0.55 })[f + ',' + c] || 0, doorLamp: 0, doorLit: 0.5 };
const ST_RUIN = { char: 1 };
const fireWins = st => { const out = []; for (let f = 0; f < 5; f++) for (let c = 0; c < 3; c++) { const v = st.fire ? st.fire(f, c) : 0; if (v > 0.05) out.push([f, c, v]); } return out; };

/** the street, seen from the near pavement. o: { st, flash, bolt, red, morning, lampA:[..], smoke } */
function drawStreetWide(ctx, t, cam, o) {
  const fl = o.flash || 0, mo = o.morning || 0, st = o.st || {};
  setCam(ctx, cam, 0.08);
  if (mo) {
    const g = ctx.createLinearGradient(0, -900, 0, 1700); g.addColorStop(0, '#8e8896'); g.addColorStop(0.6, '#b4a8a8'); g.addColorStop(1, '#d0bca8');
    ctx.fillStyle = g; ctx.fillRect(-1200, -1200, 3500, 3600);
  } else {
    drawNightSky(ctx, -1200, -1200, 3500, 3400, fl, 0.7);
    if (o.bolt && fl > 0.05) drawBolt(ctx, o.bolt.seed, o.bolt.x0, o.bolt.y0, o.bolt.x1, o.bolt.y1, fl, 1.3);
    setCam(ctx, cam, 0.12); drawClouds(ctx, t, -900, -700, 2900, 1300, fl, 4);
  }
  setCam(ctx, cam, 0.3);
  if (mo) withAlpha(ctx, 0.45, () => drawSkyline(ctx, SKY.far, t, -450, 380, 1.15, 0, { rim: 0 }));
  else drawSkyline(ctx, SKY.far, t, -450, 380, 1.15, fl, { rim: 0.25 });
  if (st.fire) glow(ctx, 600, 900, 1100, '#ff6a2a', 0.25);
  setCam(ctx, cam, BLD.d);
  drawNeighbours(ctx, t, -1700, BLD.x - 30, BLD.y, 1500, 3, mo, st.fire ? 0.3 : 1);
  drawNeighbours(ctx, t, BLD.x + APT.W * BLD.k + 30, 2900, BLD.y, 1500, 9, mo, st.fire ? 0.3 : 1);
  drawApartment(ctx, t, BLD, Object.assign({ red: o.red || 0 }, st));
  // fire smoke / morning smoke
  const fw = fireWins(st);
  if (fw.length) {
    setScreen(ctx);
    for (const [f, c, v] of fw) { if (v < 0.6) continue; const p = winWorld(f, c), s = camPt(cam, p[0], p[1] - 160, BLD.d); smokeColumn(ctx, t, s[0], s[1], 0.8 * v, '#2a1a20', 0.55, f * 3 + c, 0.35); }
    setCam(ctx, cam, BLD.d);
    for (const [f, c, v] of fw) { const p = winWorld(f, c); drawEmbers(ctx, t, p[0] - 80, p[1] - 60, 160, 700, 10, f * 9 + c, v); }
  }
  if (mo) { setScreen(ctx); for (let i = 0; i < 3; i++) { const p = camPt(cam, 420 + i * 200, 900 - i * 160, BLD.d); smokeColumn(ctx, t, p[0], p[1], 1.0, '#8a8088', 0.45, 20 + i, 0.5); } setCam(ctx, cam, BLD.d); }
  // pavement + wet road with reflections
  const refl = [];
  if (!mo) {
    for (const [f, c, v] of fw) { const p = winWorld(f, c); refl.push({ x: p[0], col: '#ff7a2a', a: 0.5 * v, w: 70 }); }
    const la = o.lampA || [];
    LAMPS_WIDE.forEach((x, i) => { if ((la[i] ?? 1) > 0.05) refl.push({ x, col: '#ffb04a', a: 0.45 * (la[i] ?? 1), w: 50 }); });
    if (st.lit) { const p = winWorld(1, 1); refl.push({ x: p[0], col: '#ffc060', a: 0.35, w: 50 }); }
    if (o.red) refl.push({ x: -150, col: '#ff2a1a', a: 0.6 * o.red, w: 120 });
  }
  drawWetStreet(ctx, t, -1700, 2900, BLD.y, refl, { morning: mo });
  if (!mo) LAMPS_WIDE.forEach((x, i) => drawStreetLantern(ctx, x, BLD.y + 70, 0.78, t, (o.lampA || [])[i] ?? 1));
  else LAMPS_WIDE.forEach(x => drawStreetLantern(ctx, x, BLD.y + 70, 0.78, t, 0));
  if (mo) { drawDebris(ctx, 300, BLD.y + 40, 0.9, 3); drawDebris(ctx, 800, BLD.y + 60, 1.1, 7); }
}
/** fire-engine lights sweeping from off-screen left (screen space) */
function fireEngineLights(ctx, t, a) {
  if (a <= 0) return;
  setScreen(ctx);
  const p1 = Math.sin(t * 9) > 0 ? 1 : 0.15, p2 = Math.sin(t * 9 + PI) > 0 ? 1 : 0.15;
  withOp(ctx, 'lighter', () => { glow(ctx, -120, 1380, 900, '#ff1a10', 0.45 * a * p1); glow(ctx, -80, 1100, 700, '#ff3a1a', 0.3 * a * p2); });
}
/** red wash value for the facade (same rhythm as the lights) */
const redWash = t => (Math.sin(t * 9) > 0 ? 1 : 0.2);

/* ===================== 1 · 0–4 s · KANCA — the lab ===================== */
const CAM1 = [[0, { x: 540, y: 820, z: 1.8 }], [0.5, { x: 552, y: 826, z: 1.78 }, Ease.inOutSine], [4.0, { x: 905, y: 1150, z: 2.05 }, Ease.inOutCubic]];
function holdPhotoProp(t, holdY, devHeat = 0) {
  return (c) => {
    // the time device on the LEFT wrist (screen right in a front view), drawn on the forearm
    const wx = 140, wy = holdY + 20, ex = 236, ey = -1100;
    drawTimeDevice(c, lerp(wx, ex, 0.24), lerp(wy, ey, 0.24), 30, t, { heat: devHeat, rot: Math.atan2(ey - wy, ex - wx) + PI / 2, glow: 0.7 });
    drawBurntPhoto(c, 0, holdY - 120, 300, 380, -0.04 + Math.sin(t * 1.3) * 0.01, t, { seed: 5 });
    const L = LT.lab, sk = HEAD.keremOld.skin;
    for (const sd of [-1, 1]) { const tp = limbPath(sd * 150, holdY + 10, sd * 118, holdY - 50, 13, 11); c.fillStyle = mixc(sk, L.key, L.keyAmt); c.fill(tp); edgeFill(c, tp, -sd * 3, 3, mixc(sk, L.mul, 0.6), 0.8); }
  };
}
function shot1(ctx, t) {
  const cam = track(t, CAM1);
  drawLab(ctx, t, cam, { mc: [540, 820], R: 400, ang: ringsIdle(t), energy: 0.08 });
  setCam(ctx, cam, 0.85);
  CUE.labSparks.forEach((t0, i) => { const a = [-0.5, 2.6, -2.2][i], R = 400 * 1.12; sparkBurst(ctx, t, t0, 540 + Math.cos(a) * R, 820 + Math.sin(a) * R, { seed: 11 + i, n: 22, dir: a, spread: 0.9, k: 1.1 }); });
  setCam(ctx, cam, 1);
  const holdY = -1130;
  drawStandingFront(ctx, { x: 960, y: 1900, s: 0.5, who: 'keremOld', view: 'front', arms: 'hold', propFront: true, holdY, holdX: 140, light: LT.lab, t, breath: 0.5 + 0.5 * Math.sin(t * 1.4),
    head: { pitch: 0.36, gaze: [0, 0.75], glint: 0.5, squint: 0.15, frown: 0.2 }, prop: holdPhotoProp(t, holdY) });
  setScreen(ctx); drawHaze(ctx, t, 0, 200, W, 1500, '#6a4a6a', 0.07, 6, 2);
  setCam(ctx, cam, 1); drawDust(ctx, t, 200, 400, 900, 900, 40, '#ffcf8a', 0.3, 3, 1.2);
}

/* ===================== 2a · 4–5.5 s · the photograph (insert) ===================== */
function shot2a(ctx, t) {
  setScreen(ctx);
  ctx.fillStyle = '#0c070c'; ctx.fillRect(0, 0, W, H);
  bokeh(ctx, t, 9, 31, ['#ffb04a', '#c8642a', '#8a5aa0'], 0.18, 0, 200, W, 1400, 60, 160);
  const z = lerp(1.0, 1.4, prog(t, 0, 2.2, Ease.inOutSine)), shk = Math.sin(t * 13) * 2;
  ctx.save(); ctx.translate(540 + shk, 930); ctx.scale(z, z);
  const L = LT.lab, sleeve = OUTFIT.keremOld.suit, cuff = OUTFIT.keremOld.cuff, skin = HEAD.keremOld.skin;
  // forearms rise from the bottom corners
  drawForearm(ctx, -520, 800, -260, 250, 70, 56, sleeve, cuff, L, 0);
  drawForearm(ctx, 520, 800, 260, 250, 70, 56, sleeve, cuff, L, 0);
  drawTimeDevice(ctx, 370, 470, 58, t + CUE.s2a, { rot: Math.atan2(800 - 250, 520 - 260) + PI / 2, glow: 0.7 });
  drawHand(ctx, { x: -232, y: 250, rot: 0.3, s: 1.9, side: 1, pose: 'grip', light: L, skin });
  drawHand(ctx, { x: 232, y: 250, rot: -0.3, s: 1.9, side: -1, pose: 'grip', light: L, skin });
  drawBurntPhoto(ctx, 0, -40, 560, 720, -0.035, t + 4, { seed: 5 });
  for (const sd of [-1, 1]) {   // thumbs pressing on the front of the photo
    const tp = limbPath(sd * 300, 230, sd * 222, 150, 24, 21);
    ctx.fillStyle = mixc(mixc(skin, L.key, L.keyAmt), '#06040a', 0.05); ctx.fill(tp);
    edgeFill(ctx, tp, -sd * 4, 5, mixc(skin, L.mul, 0.6), 0.8); edgeFill(ctx, tp, sd * 3, -3, L.rim, 0.5);
  }
  ctx.restore();
  drawEmbers(ctx, t, 220, 800, 640, 700, 18, 77, 0.8);
}

/* ===================== 2b · 5.5–14 s · GEÇMİŞ — the flashback ===================== */
function shot2b(ctx, t) {
  const g = t + CUE.s2b, cam = track(t, [[-0.6, CAM_K0], [8.9, CAM_K1, Ease.inOutSine]]);
  const fl = flashAt(g, [{ t: CUE.thunder, peak: 1 }]);
  drawStreetWide(ctx, t, cam, { st: ST_FIRE, flash: fl, red: redWash(t), lampA: [0.8, 0.8], bolt: { seed: 7, x0: 1100, y0: -600, x1: 900, y1: 700 } });
  // young Kerem on his knees, looking up at the burning window
  setCam(ctx, cam, 1);
  drawSideFigure(ctx, Object.assign({ who: 'keremYoung', light: withL(LT.fire, fl), flash: fl * 0.5, t, head: Object.assign({}, KNEEL_HEAD) }, KNEEL));
  fireEngineLights(ctx, t, 1);
  rainFG(ctx, t, cam, 0.4, 200, 41);
  setScreen(ctx); drawHaze(ctx, t, 0, 400, W, 1300, '#8a4a3a', 0.08, 6, 5);
  sepiaGrade(ctx, 1);
}

/* ===================== 3a · 14–20 s · YOLCULUK — the lever ===================== */
const LEVER = { P: [199, 1100], L: 300, a0: -0.29, a1: 0.71 };
function leverAngle(t) { return lerp(LEVER.a0, LEVER.a1, prog(t, 0.9, 1.35, Ease.inCubic)) + (t > 1.35 ? Math.exp(-(t - 1.35) * 9) * Math.sin((t - 1.35) * 40) * 0.03 : 0); }
function ringsSpin(t) {   // 3a: the rings accelerate violently after the clank
  const D = 4.6, u = clamp((t - 1.35) / D), ex = 30 * D * Math.pow(u, 4) / 4 + (t > 1.35 + D ? 30 * (t - 1.35 - D) : 0);
  return RING_W.map((w, i) => RING_PH[i] + w * (t + 14) + w * ex);
}
function shot3a(ctx, t) {
  const en = Math.pow(prog(t, 1.4, 5.85, Ease.linear), 1.6), cold = prog(t, 4.6, 5.95, Ease.inQuad);
  const amp = en * 16;
  G.shakeX = snz(t * 23, 3) * amp; G.shakeY = snz(t * 19, 8) * amp;
  const cam = track(t, [[-0.4, { x: 520, y: 1060, z: 1.12 }], [1.4, { x: 500, y: 1080, z: 1.22 }, Ease.inOutSine], [5.9, { x: 360, y: 880, z: 1.55 }, Ease.inQuad]]);
  drawLab(ctx, t + 14, cam, { mc: [300, 760], R: 400, ang: ringsSpin(t), energy: 0.1 + en * 0.9, cold });
  setCam(ctx, cam, 1);
  // lever on its console (in front of the machine)
  const a = leverAngle(t);
  ctx.save();
  ctx.fillStyle = '#1c1218'; ctx.fillRect(LEVER.P[0] - 120, LEVER.P[1] + 100, 240, 900);
  const [hx, hy, nx, ny] = drawLever(ctx, LEVER.P, a, LEVER.L, LT.labSide, t + 14);
  ctx.restore();
  // old Kerem, facing left, reaching for the handle and hauling it down
  const s = 0.5, KX = 640, KY = 1880;
  const reach = prog(t, 0.15, 0.85, Ease.inOutSine);
  const grip = [hx + nx * 18, hy + ny * 18], grip2 = [hx - nx * 34, hy - ny * 34];
  const toFig = p => ({ x: (KX - p[0]) / s, y: (p[1] - KY) / s });
  const rest = { x: 110, y: -860 }, restFar = { x: 60, y: -880 };
  const hNear = toFig(grip), hFar = toFig(grip2);
  const near = { x: lerp(rest.x, hNear.x, reach), y: lerp(rest.y, hNear.y, reach) }, far = { x: lerp(restFar.x, hFar.x, reach), y: lerp(restFar.y, hFar.y, reach) };
  const pull = prog(t, 0.9, 1.35, Ease.inCubic), after = prog(t, 1.35, 2.4);
  const out = keremOldSide(ctx, cam, 1, { x: KX, y: KY, s, face: -1, t, light: withL(LT.labSide, en * 0.6), flash: cold * 0.4, hand: near, handPose: reach > 0.8 ? 'grip' : 'rest', farHand: far, farPose: reach > 0.8 ? 'grip' : 'rest',
    lean: -0.06 * pull + 0.03 * reach, headTurn: lerp(0.35, 0.5, after), head: { pitch: lerp(0.05, -0.12, after), glint: 0.7 + en * 0.3, frown: lerp(0.3, -0.2, after), eyeOpen: 0.9 + en * 0.3 } },
    { heat: 0, glow: 0.6 + en * 0.6 });
  // the grip bar in front of the fingers
  ctx.fillStyle = '#2a0e12'; ctx.fill(quad(hx - nx * 60, hy - ny * 60, hx - nx * 20, hy - ny * 20, 16, 16));
  // energy reaches out of the machine toward the room
  setCam(ctx, cam, 0.85);
  if (en > 0.3) for (let i = 0; i < 3; i++) { const s0 = i * 31 + Math.floor((t + 14) * 8); const ang = hash(s0) * TAU; arcZap(ctx, t, 300 + Math.cos(ang) * 470, 760 + Math.sin(ang) * 470, 300 + Math.cos(ang) * (700 + en * 500), 760 + Math.sin(ang) * (700 + en * 400), (en - 0.3) * 1.4, s0, 0.9, '#9ab8ff'); }
  setScreen(ctx); drawHaze(ctx, t, 0, 200, W, 1500, '#6a4a6a', 0.07, 6, 2);
  if (cold > 0) withOp(ctx, 'lighter', () => { setScreen(ctx); glow(ctx, W * 0.35, H * 0.42, 1300, '#a8c0ff', cold * 0.5); });
  timeFlash(ctx, prog(t, 5.78, 5.99, Ease.inQuad));
}

/* ===================== 3b · 20–24 s · same street, same night — the building stands ===================== */
function shot3b(ctx, t) {
  const cam = track(t, [[0, CAM_K0], [1.0, CAM_K0], [4.0, { x: 560, y: 820, z: 1.3 }, Ease.inOutCubic]]);
  drawStreetWide(ctx, t, cam, { st: ST_INTACT, lampA: [1, 1] });
  // old Kerem stands where the young one knelt; time-jump sparks die away around him
  const settle = prog(t, 0.3, 1.6);
  const out = keremOldSide(ctx, cam, 1, { x: KNEEL.x, y: KNEEL.y, s: KNEEL.s, face: 1, t, light: LT.street, flash: (1 - settle) * 0.8, headTurn: 0.45,
    head: { pitch: lerp(0.1, -0.3, prog(t, 1.2, 2.6)), gaze: [0.2, -0.5], glint: 0.8, eyeOpen: 1.1, frown: -0.2 } }, { heat: 0.05, glow: 0.9 });
  setCam(ctx, cam, 1);
  if (settle < 1) for (let i = 0; i < 4; i++) { const s0 = i * 17 + Math.floor(t * 12); const y0 = KNEEL.y - 200 - hash(s0) * 700; arcZap(ctx, t, KNEEL.x - 120 + hash(s0 + 1) * 40, y0, KNEEL.x + 120 - hash(s0 + 2) * 40, y0 + (hash(s0 + 3) - 0.5) * 300, (1 - settle), s0, 0.5, '#bcd0ff'); }
  rainFG(ctx, t, cam, 0.4, 200, 42);
  setScreen(ctx); drawHaze(ctx, t, 0, 400, W, 1300, '#6a5a8a', 0.07, 6, 9);
  // white explosion: 9 full frames, then out
  const wf = CUE.whiteFrames / FPS;
  timeFlash(ctx, t < wf ? 1 : 1 - prog(t, wf, wf + 0.45, Ease.outQuad));
}

/* ===================== 4 · 24–38 s · GERİLİM — faster and faster cuts ===================== */
function shot4(ctx, t) {
  if (t < 4.0) s4Run(ctx, t);
  else if (t < 6.5) s4Device(ctx, t - 4.0, t);
  else if (t < 8.5) s4Door(ctx, t - 6.5, t);
  else if (t < 9.7) s4Bell(ctx, t - 8.5, t);
  else if (t < 11.5) s4Bursts(ctx, t - 9.7, t);
  else if (t < 12.6) s4Face(ctx, t - 11.5, t);
  else if (t < 13.3) s4Window(ctx, t - 12.6, t);
  else s4Spark(ctx, t - 13.3, t);
}
const devHeat = g => clamp((g - 24) / 12);   // amber → red over the whole sequence
function s4Run(ctx, t) {
  const g = t + CUE.s4, R = CUE.run, kx = lerp(R.x0, R.x1, t / (R.t1 - R.t0));
  const cam = { x: kx + 170, y: 1000, z: 1.05 };
  const lampA = CUE.lamps.map((x, i) => { const off = CUE.lampsOff[i]; if (g < off - 0.25) return 1; if (g > off + 0.35) return 0; return (hash(Math.floor(g * 30) + i * 7) > 0.5 ? 1 : 0.1) * (1 - prog(g, off, off + 0.35)); });
  drawStreetWide(ctx, t, cam, { st: ST_INTACT, lampA: [0, 0] });
  setCam(ctx, cam, 0.92);
  CUE.lamps.forEach((x, i) => drawStreetLantern(ctx, x, 1600, 0.82, t, lampA[i]));
  const out = keremOldSide(ctx, cam, 1, { x: kx, y: 1800, s: 0.4, face: 1, t, walk: 1, phase: R.omega * t, lean: 0.16, light: LT.street, headTurn: 0.38, head: { pitch: 0.02, glint: 0.7, frown: 0.3 } }, { heat: devHeat(g) * 0.8, glow: 0.7 + beepPulse(g) * 0.6 });
  // splashes at his feet
  setCam(ctx, cam, 1); drawSplashes(ctx, t, kx - 120, 1802, 240, 6, 9, '#c8b8ff', 0.6, 1.4);
  rainFG(ctx, t, cam, 0.42, 220, 43);
}
function s4Device(ctx, lt, t) {
  const g = t + CUE.s4, heat = devHeat(g), bp = beepPulse(g);
  setScreen(ctx);
  ctx.fillStyle = '#0a070c'; ctx.fillRect(0, 0, W, H);
  // street bokeh behind: lamps going out
  bokeh(ctx, lt, 10, 5, ['#ffb04a', '#6a5aa0', '#c8642a'], 0.22 * (1 - lt / 3), 0, 0, W, H, 80, 200);
  drawRain(ctx, t, { x: -200, y: -200, w: 1500, h: 2400, n: 120, len: 90, speed: 1900, slant: -0.12, width: 2, color: '#b8a8e0', alpha: 0.25, seed: 51 });
  const bob = Math.sin(lt * 10) * 14;
  ctx.save(); ctx.translate(0, bob);
  // the sleeve crossing the frame diagonally
  const L = LT.warm;
  drawForearm(ctx, 1400, 1800, -200, 260, 230, 200, OUTFIT.keremOld.suit, OUTFIT.keremOld.cuff, L, 0);
  drawTimeDevice(ctx, 640, 1040, 200, t, { heat, glow: 0.8 + bp * 0.8, rot: -0.85, ang: ringsIdle(g * (1 + heat * 3)), strap: 'worn' });
  ctx.restore();
  if (bp > 0) withOp(ctx, 'lighter', () => glow(ctx, 640, 1040 + bob, 700, mixc(ZY.amber, ZY.red, heat), bp * 0.35));
}
/* door set (close): wall, Deco door on the right, bell plate left of the door */
function drawDoorSet(ctx, t, o = {}) {
  ctx.fillStyle = '#1c1220'; ctx.fillRect(-400, -200, 1900, 2400);
  for (const x of [80, 1120]) drawFluted(ctx, x - 50, -200, 100, 2100, '#2a1a30', 5, 0.1);
  ctx.fillStyle = '#120a10'; ctx.fillRect(-400, 1800, 1900, 400);
  ctx.fillStyle = rgba('#b8a8e0', 0.15); ctx.fillRect(-400, 1800, 1900, 3);
  drawDecoDoor(ctx, 700, 620, 330, 1180, 0, LT.street, t);
  // canopy lamp over the door
  const la = o.lamp ?? 1;
  ctx.fillStyle = '#0e080c'; ctx.fillRect(820, 470, 90, 70);
  if (la > 0) { ctx.fillStyle = rgba('#ffd890', la); ctx.fillRect(832, 480, 66, 50); withOp(ctx, 'lighter', () => glow(ctx, 865, 520, 420, '#ffb04a', 0.45 * la)); }
  // bell plate
  ctx.fillStyle = '#5a3a1c'; ctx.fillRect(612, 1120, 56, 110); ctx.strokeStyle = ZY.brassHi; ctx.lineWidth = 3; ctx.strokeRect(612, 1120, 56, 110);
  ctx.fillStyle = ZY.brass; ctx.beginPath(); ctx.arc(640, 1175, 17, 0, TAU); ctx.fill(); ctx.fillStyle = ZY.brassHi; ctx.beginPath(); ctx.arc(636, 1170, 6, 0, TAU); ctx.fill();
}
function s4Door(ctx, lt, t) {
  const g = t + CUE.s4;
  const cam = track(lt, [[0, { x: 560, y: 1150, z: 1.0 }], [2.0, { x: 600, y: 1120, z: 1.1 }, Ease.inOutSine]]);
  setCam(ctx, cam, 1);
  drawDoorSet(ctx, g, {});
  // he slows from the run and lifts a finger to the bell
  const arrive = prog(lt, 0, 0.7, Ease.outCubic), kx = lerp(160, 360, arrive);
  const rch = prog(lt, 0.8, 1.9, Ease.inOutSine);
  const s = 0.5, ky = 1800, bell = { x: (640 - kx) / s - 30, y: (1175 - ky) / s + 10 };
  keremOldSide(ctx, cam, 1, { x: kx, y: ky, s, face: 1, t, walk: 1 - arrive, phase: 10 * lt, lean: 0.14 * (1 - arrive), light: LT.street, headTurn: 0.42,
    hand: rch > 0.01 ? { x: lerp(120, bell.x, rch), y: lerp(-880, bell.y, rch) } : null, handPose: rch > 0.5 ? 'point' : 'rest', head: { pitch: lerp(0.05, -0.05, rch), glint: 0.8, frown: 0.1 } },
    { heat: devHeat(g), glow: 0.8 + beepPulse(g) * 0.7 });
  rainFG(ctx, t, cam, 0.35, 160, 44);
}
function s4Bell(ctx, lt, t) {
  const g = t + CUE.s4, heat = devHeat(g);
  setScreen(ctx);
  ctx.save(); ctx.translate(540, 960); ctx.scale(3.2, 3.2); ctx.translate(-640, -1175);
  drawDoorSet(ctx, g, {});
  ctx.restore();
  // the hand enters from the left, the finger finds the button
  const press = prog(lt, 0.05, 0.42, Ease.outCubic), push = g > CUE.bell ? Math.min(1, (g - CUE.bell) * 12) * 6 : 0;
  const fx = lerp(-200, 470, press) + push, fy = 980;
  const L = LT.warm;
  drawForearm(ctx, fx - 820, fy + 520, fx - 250, fy + 90, 200, 160, OUTFIT.keremOld.suit, OUTFIT.keremOld.cuff, L, 0);
  drawTimeDevice(ctx, fx - 420, fy + 220, 120, t, { heat, glow: 1 + beepPulse(g), rot: Math.atan2(430, 570) + PI / 2, ang: ringsIdle(g * 4), strap: 'worn' });
  drawHand(ctx, { x: fx - 230, y: fy + 76, rot: 1.42, s: 3.6, side: -1, pose: 'point', light: L, skin: HEAD.keremOld.skin });
  // the ring-shaped shock wave from the device
  const wv = g - CUE.wave;
  if (wv > 0) { o_sy = 1; shockRing(ctx, t, fx - 420, fy + 220, 80 + wv * 2600, clamp(1.2 - wv * 0.8), 9, 2.2); withOp(ctx, 'lighter', () => glow(ctx, fx - 420, fy + 220, 900, '#bcd0ff', clamp(0.8 - wv) )); }
}
const burstEnv = (g, t0) => { const d = g - t0; return d < 0 ? 0 : d < 0.06 ? d / 0.06 : Math.exp(-(d - 0.06) * 7); };
function s4Bursts(ctx, lt, t) {
  const g = t + CUE.s4;
  let shake = 0; CUE.bursts.forEach(b => { shake = Math.max(shake, burstEnv(g, b)); });
  G.shakeX = snz(g * 30, 2) * 14 * shake; G.shakeY = snz(g * 27, 5) * 14 * shake;
  const cam = track(lt, [[0, { x: 560, y: 1150, z: 0.95 }], [1.8, { x: 560, y: 900, z: 1.0 }, Ease.inOutSine]]);
  const b = { x: 130, y: 1850, k: 1.0 };
  const st = { lit: (f, c) => (g < CUE.bursts[f] ? ST_INTACT.lit(f, c) || 0.25 : 0), burst: (f, c) => burstEnv(g, CUE.bursts[f] + c * 0.03), elif: g < CUE.bursts[1] ? 1 : 0, doorLamp: g < CUE.bursts[0] ? 1 : 0 };
  setCam(ctx, cam, 0.1); drawNightSky(ctx, -1000, -1000, 3000, 3600, 0, 0.7);
  setCam(ctx, cam, 0.3); drawSkyline(ctx, SKY.mid, t, -500, 300, 1.0, 0, { rim: 0.2 });
  setCam(ctx, cam, 1);
  drawNeighbours(ctx, t, -1200, b.x - 20, b.y, 2100, 5, 0, 1); drawNeighbours(ctx, t, b.x + 840, 2400, b.y, 2100, 6, 0, 1);
  drawApartment(ctx, t, b, st);
  drawWetStreet(ctx, t, -1200, 2400, b.y, [{ x: 540, col: '#ffffff', a: shake * 0.6, w: 300 }], {});
  // the shock ring rolls out from the door, low and wide
  const wv = g - CUE.wave; o_sy = 0.32;
  if (wv > 0) shockRing(ctx, t, b.x + 410, b.y - 120, 300 + wv * 1500, clamp(1 - wv * 0.45), 12, 1.6);
  o_sy = 1;
  // glass bursts out of the windows
  setCam(ctx, cam, 1);
  CUE.bursts.forEach((t0, f) => { for (let c = 0; c < 3; c++) { const w = aptWin(f, c); sparkBurst(ctx, g, t0 + c * 0.03, b.x + w.cx, b.y + w.cy, { seed: f * 5 + c, n: 12, dir: -PI / 2, spread: 1.4, k: 0.9, col: '#e8f0ff', life: 0.8 }); } });
  rainFG(ctx, t, cam, 0.35, 160, 45);
  setScreen(ctx); withOp(ctx, 'lighter', () => { ctx.fillStyle = rgba('#f0f4ff', shake * 0.12); ctx.fillRect(0, 0, W, H); });
}
function s4Face(ctx, lt, t) {
  const g = t + CUE.s4;
  const strobe = Math.max(hash(Math.floor(g * 14)) > 0.55 ? 0.8 : 0, burstEnv(g, CUE.bursts[4]) * 0.6);
  setScreen(ctx);
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1a1428'); bg.addColorStop(1, '#0a0810'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  bokeh(ctx, g, 6, 9, ['#ffffff', '#ffd8a0'], 0.25 * strobe, 0, 0, W, 900, 80, 220);
  const L = mkLight({ dir: [0.35, -0.75, 0.55], key: '#e8ecff', keyAmt: 0.25 + strobe * 0.35, mul: '#241a30', rim: '#e8ecff', rimDir: [0.4, -1], rimW: 6 + strobe * 6, rimA: 0.8 + strobe * 0.2 });
  G.shakeX = snz(g * 30, 4) * 8 * strobe;
  ctx.translate(G.shakeX, 0);
  drawBust(ctx, { x: 560, y: 1230, s: 2.05, who: 'keremOld', light: L, flash: strobe * 0.5, t: g, head: { yaw: 0.45, pitch: -0.32, gaze: [0.2, -0.8], eyeOpen: 1.28, frown: -0.6, mouthOpen: 0.55 + strobe * 0.2, glint: 1, detail: 1, lensGlint: strobe } });
  setScreen(ctx);
  rainFG(ctx, t, { x: 540, y: 960, z: 1 }, 0.4, 180, 46);
}
function s4Window(ctx, lt, t) {
  const g = t + CUE.s4;
  const w = aptWin(1, 1), b = { x: 540 - w.cx * 2.4, y: 960 - w.cy * 2.4 + 100, k: 2.4 };
  const pop = burstEnv(g, CUE.upperBursts[0]), pop2 = burstEnv(g, CUE.upperBursts[1]);
  G.shakeX = snz(g * 30, 7) * 12 * Math.max(pop, pop2);
  setCam(ctx, { x: 540, y: 960, z: 1 }, 1);
  ctx.fillStyle = '#1a1020'; ctx.fillRect(-200, -200, 1500, 2400);
  drawApartment(ctx, t, b, { lit: (f, c) => (f === 1 && c === 1 ? (g < CUE.upperBursts[0] ? 1 : 0) : f === 2 && c === 1 ? (g < CUE.upperBursts[1] ? 0.7 : 0) : 0), burst: (f, c) => (f === 1 && c === 1 ? pop : f === 2 && c === 1 ? pop2 : 0), elif: g < CUE.upperBursts[0] ? 1 : 0 });
  sparkBurst(ctx, g, CUE.upperBursts[0], b.x + w.cx * 2.4, b.y + w.cy * 2.4, { seed: 41, n: 26, dir: PI / 2, spread: 1.6, k: 1.6, col: '#e8f0ff' });
  rainFG(ctx, t, { x: 540, y: 960, z: 1 }, 0.35, 160, 47);
}
function s4Spark(ctx, lt, t) {
  const g = t + CUE.s4;
  setScreen(ctx); ctx.fillStyle = '#0a060a'; ctx.fillRect(0, 0, W, H);
  G.shakeX = snz(g * 33, 1) * 10; G.shakeY = snz(g * 29, 2) * 10;
  ctx.save(); ctx.translate(G.shakeX, G.shakeY);
  drawForearm(ctx, -200, 1500, 760, 860, 250, 210, OUTFIT.keremOld.suit, OUTFIT.keremOld.cuff, LT.fire, 0);
  drawTimeDevice(ctx, 520, 1020, 230, t, { heat: 1, glow: 1.5, rot: Math.atan2(640, -960) + PI / 2, ang: ringsIdle(g * 6), strap: 'worn' });
  CUE.devSparks4.forEach((t0, i) => sparkBurst(ctx, g, t0, 520 + (i - 1) * 90, 960, { seed: 61 + i, n: 30, dir: -PI / 2 - 0.4 + i * 0.4, spread: 1.1, k: 2.2, col: '#ff6a2a' }));
  ctx.restore();
}

/* ===================== 5 · 38–48 s · TERS KÖŞE — it was him ===================== */
function shot5(ctx, t) {
  if (t < 3.0) s5Room(ctx, t);
  else if (t < 6.0) s5Back(ctx, t - 3.0, t);
  else if (t < 7.6) s5Wrist(ctx, t - 6.0, t);
  else s5Fall(ctx, t - 7.6, t);
}
function s5Room(ctx, t) {
  const g = t + CUE.s5, ign = g - CUE.fwoosh, fire = clamp(ign / 1.8);
  const cam = track(t, [[0, { x: 540, y: 1000, z: 1.0 }], [3.0, { x: 620, y: 960, z: 1.16 }, Ease.inOutSine]]);
  setCam(ctx, cam, 1);
  // wallpaper: burgundy with gold chevron stripes
  ctx.fillStyle = '#2a0e18'; ctx.fillRect(-400, -400, 1900, 2800);
  for (let x = -400; x < 1500; x += 120) { ctx.fillStyle = '#3a1420'; ctx.fillRect(x, -400, 60, 2800); ctx.strokeStyle = rgba(ZY.brass, 0.18); ctx.lineWidth = 2; ctx.beginPath(); for (let y = -400; y < 2400; y += 60) { ctx.moveTo(x, y); ctx.lineTo(x + 30, y + 30); ctx.lineTo(x + 60, y); } ctx.stroke(); }
  ctx.fillStyle = '#140608'; ctx.fillRect(-400, 1640, 1900, 800); ctx.fillStyle = rgba(ZY.brass, 0.35); ctx.fillRect(-400, 1640, 1900, 4);
  // window behind the curtain (night, rain)
  ctx.fillStyle = '#0c0814'; ctx.fillRect(560, 200, 520, 1300);
  ctx.save(); ctx.beginPath(); ctx.rect(560, 200, 520, 1300); ctx.clip(); drawGlassRain(ctx, t, 560, 200, 520, 1300, { seed: 4, n: 18 }); ctx.restore();
  // socket plate (brass, two holes)
  const SX = 400, SY = 1440;
  ctx.fillStyle = '#5a3a1c'; ctx.fillRect(SX - 50, SY - 70, 100, 140); ctx.fillStyle = ZY.brass; ctx.fillRect(SX - 44, SY - 64, 88, 128);
  ctx.fillStyle = '#1a0e08'; for (const dy of [-22, 22]) { ctx.beginPath(); ctx.ellipse(SX - 14, SY + dy, 5, 9, 0, 0, TAU); ctx.ellipse(SX + 14, SY + dy, 5, 9, 0, 0, TAU); ctx.fill(); }
  // the curtain, hem near the socket; it ignites
  const sway = Math.sin(t * 1.4) * 6;
  drawSoftCurtain(ctx, t, 520, 160, 600, 1500, mixc('#c8a070', '#ff9a4a', fire * 0.5), 4);
  withOp(ctx, 'lighter', () => glow(ctx, 820, 700, 600, '#8a7ab0', 0.15));
  ctx.fillStyle = '#3a2410'; ctx.fillRect(500, 140, 640, 30);
  if (ign > 0) {
    // charred band climbing the curtain + flames along its edge
    const top = lerp(1660, 260, Ease.inQuad(fire));
    ctx.fillStyle = 'rgba(20,6,4,0.85)'; ctx.fillRect(520, top + 60, 600, 1660 - top);
    for (let i = 0; i < 6; i++) drawFlame(ctx, g, 560 + i * 100 + sway, top + 120 + (i % 2) * 60, 140, 260 + fire * 360, 71 + i, clamp(ign * 3));
    drawEmbers(ctx, g, 520, top - 200, 600, 900, 24, 13, clamp(ign * 2));
  }
  // sparks from the socket; the last one jumps to the curtain hem
  CUE.socketSparks.forEach((t0, i) => sparkBurst(ctx, g, t0, SX + 20, SY - 10, { seed: 81 + i, n: 18, dir: -0.4, spread: 0.8, k: 1.3 }));
  const jump = g - CUE.socketSparks[3]; if (jump > 0 && jump < 0.25) arcZap(ctx, t, SX + 30, SY - 10, 560, 1600, 1 - jump * 4, 5, 0.8, '#ffb04a');
  // room light: dark after the bursts, then firelight
  setScreen(ctx);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba('#2a1420', 0.35 * (1 - fire * 0.7)); ctx.fillRect(0, 0, W, H); ctx.restore();
  if (ign > 0) withOp(ctx, 'lighter', () => { glow(ctx, 800, 1300, 1300, '#ff6a2a', 0.35 * fire + 0.1 * snz(g * 8, 3)); });
  setScreen(ctx); drawHaze(ctx, t, 0, 200, W, 1500, '#6a3a2a', 0.08 * fire, 5, 6);
}
function s5Back(ctx, lt, t) {
  const g = t + CUE.s5, sp = prog(lt, 0, 3.0, Ease.linear);
  const cam = track(lt, [[0, { x: 560, y: 1000, z: 1.12 }], [3.0, { x: 520, y: 960, z: 1.02 }, Ease.inOutSine]]);
  const fire = (f, c) => { const k = f + ',' + c; if (k === '1,1') return 0.7 + sp * 0.3; if (k === '1,0' || k === '1,2') return clamp(sp * 1.4 - 0.3); if (k === '2,1') return clamp(sp * 1.4 - 0.5); return 0; };
  drawStreetWide(ctx, t, cam, { st: { fire, doorLamp: 0, doorLit: 0.2 }, lampA: [0, 0] });
  // he backs away, face toward camera, firelight on the face
  const kx = lerp(560, 330, Ease.outQuad(sp));
  const L = mkLight({ dir: [0.72, -0.25, 0.6], key: '#ff8a3a', keyAmt: 0.55 + 0.08 * snz(g * 9, 2), mul: '#3a1426', rim: '#ffb060', rimDir: [0.9, -0.4], rimW: 6, rimA: 0.95 });
  keremOldSide(ctx, cam, 1, { x: kx, y: 1880, s: 0.56, face: 1, t, walk: 0.55, phase: -5 * lt, lean: -0.08, light: L, headTurn: 0.62,
    head: { pitch: -0.25, gaze: [0.3, -0.4], eyeOpen: 1.32, frown: -0.7, mouthOpen: 0.95, glint: 1 } }, { heat: 1, glow: 1.1 });
  rainFG(ctx, t, cam, 0.38, 180, 48);
  setScreen(ctx); withOp(ctx, 'lighter', () => glow(ctx, 1000, 700, 900, '#ff6a2a', 0.18 + 0.05 * snz(g * 6, 1)));
}
function s5Wrist(ctx, lt, t) {
  const g = t + CUE.s5, real = prog(lt, 0.55, 1.1);
  setScreen(ctx);
  const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#3a1418'); bg.addColorStop(1, '#0c0608'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  bokeh(ctx, g, 8, 21, ['#ff7a2a', '#ffb04a', '#c8301a'], 0.3, 400, 0, 680, 1100, 80, 220);
  const L = mkLight({ dir: [0.65, -0.1, 0.65], key: '#ff8a3a', keyAmt: 0.55 + 0.1 * snz(g * 9, 3), mul: '#3a1426', rim: '#ffb060', rimDir: [0.9, -0.3], rimW: 6, rimA: 0.95 });
  drawBust(ctx, { x: 520, y: 980, s: 1.95, who: 'keremOld', light: L, t: g, head: { yaw: 0.35, pitch: 0.42, gaze: [0.1, 0.9], eyeOpen: lerp(0.95, 1.35, real), frown: lerp(0.2, -0.7, real), mouthOpen: lerp(0, 0.85, real), glint: 1, detail: 1 } });
  // his raised forearm across the bottom of the frame: the device still spits sparks
  drawForearm(ctx, -150, 1950, 1300, 1240, 240, 210, OUTFIT.keremOld.suit, OUTFIT.keremOld.cuff, L, 0);
  drawTimeDevice(ctx, 560, 1600, 170, t, { heat: 1, glow: 1.3, rot: Math.atan2(-710, 1450) + PI / 2, ang: ringsIdle(g * 5), strap: 'worn' });
  CUE.devSparks5.forEach((t0, i) => sparkBurst(ctx, g, t0, 560 + (i - 1) * 60, 1540, { seed: 91 + i, n: 26, dir: -PI / 2 + (i - 1) * 0.3, spread: 1.0, k: 2, col: '#ff6a2a' }));
}
function s5Fall(ctx, lt, t) {
  // slow motion: rain, flames and the fall all run at a fraction of real time
  const g = t + CUE.s5, slow = 0.32, ts = 7.6 * 1 + lt * slow;
  const cam = CAM_K1;
  drawStreetWide(ctx, ts, cam, { st: ST_FIRE, lampA: [0, 0], red: 0 });
  const fall = prog(g, CUE.collapse[0], CUE.collapse[1], Ease.inOutSine);
  const head = { pitch: lerp(0.3, KNEEL_HEAD.pitch, prog(g, CUE.collapse[0] + 0.5, CUE.collapse[1])), gaze: [0.25, lerp(0.5, KNEEL_HEAD.gaze[1], fall)], eyeOpen: KNEEL_HEAD.eyeOpen, frown: KNEEL_HEAD.frown, mouthOpen: KNEEL_HEAD.mouthOpen, glint: KNEEL_HEAD.glint };
  keremOldSide(ctx, cam, 1, Object.assign({}, KNEEL, { kneel: fall, lean: KNEEL.lean + Math.sin(fall * PI) * 0.12, t: ts, light: LT.fire, head }), { heat: 1, glow: 1 });
  rainFG(ctx, ts, cam, 0.4, 200, 41, 1700);
  setScreen(ctx); drawHaze(ctx, ts, 0, 400, W, 1300, '#8a4a3a', 0.08, 6, 5);
}

/* ===================== 6 · 48–54.5 s · DÖNGÜ — the morning after ===================== */
function shot6(ctx, t) {
  if (t < 3.0) s6Walk(ctx, t);
  else if (t < 4.6) s6Pick(ctx, t - 3.0, t);
  else s6Dial(ctx, t - 4.6, t);
}
const WATCH_W = { x: 640, y: 1810 };
function s6Walk(ctx, t) {
  const g = t + CUE.s6, W6 = CUE.walk6, wk = prog(g, W6.t0, W6.t1, Ease.linear);
  const cam = track(t, [[0, { x: 520, y: 980, z: 1.06 }], [3.0, { x: 560, y: 1080, z: 1.18 }, Ease.inOutSine]]);
  drawStreetWide(ctx, t, cam, { st: ST_RUIN, morning: 1 });
  setCam(ctx, cam, 1);
  drawDebris(ctx, -40, 1860, 1.2, 11);
  // the watch glints in the ash
  const glint = 0.5 + 0.5 * Math.sin(t * 3);
  drawTimeDevice(ctx, WATCH_W.x, WATCH_W.y, 20, g, { heat: 0, glow: 0.6, ang: ringsDial(g), rot: 0.4, strap: 'loose' });
  withOp(ctx, 'lighter', () => glow(ctx, WATCH_W.x, WATCH_W.y, 120, '#ffb04a', 0.4 + glint * 0.4));
  const walking = g < W6.t1, kx = lerp(170, 470, Ease.outSine(clamp(wk)));
  const look = prog(g, W6.t1 - 0.3, W6.t1 + 0.6);
  drawSideFigure(ctx, { x: kx, y: 1830, s: 0.46, who: 'keremYoung', face: 1, t, walk: walking ? 1 : 0, phase: W6.omega * (g - W6.t0), light: LT.morning, headTurn: 0.35,
    head: { pitch: lerp(0.05, 0.55, look), gaze: [0.2, lerp(0, 0.9, look)], glint: 0.4, frown: 0.25 }, bow: look * 0.25 });
  setCam(ctx, cam, 1.2); drawDebris(ctx, 980, 2050, 1.6, 17);
  setCam(ctx, cam, 1); drawAsh(ctx, t, -200, -200, 1500, 2400, 70, 3, 0.7);
  setScreen(ctx); drawHaze(ctx, t, 0, 300, W, 1500, '#c8c0c4', 0.12, 6, 13);
}
function s6Pick(ctx, lt, t) {
  const g = t + CUE.s6;
  setScreen(ctx);
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#5a5258'); bg.addColorStop(1, '#2a2428'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // ash ground, charred bits
  for (let i = 0; i < 60; i++) { const x = hash(i * 3 + 1) * W, y = 700 + hash(i * 3 + 2) * 1300, r = 20 + hash(i * 3) * 80; ctx.fillStyle = i % 3 ? rgba('#1a1416', 0.6) : rgba('#8a8288', 0.35); ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.4, hash(i) * 2, 0, TAU); ctx.fill(); }
  ctx.save(); ctx.translate(780, 640); ctx.rotate(0.5); ctx.fillStyle = '#0c0808'; ctx.fillRect(-500, -30, 900, 60); ctx.restore();
  const lift = prog(g, CUE.pickup + 0.1, CUE.pickup + 0.75, Ease.inOutSine), close = prog(g, CUE.pickup - 0.25, CUE.pickup + 0.05);
  const reach = prog(lt, 0, 0.75, Ease.outCubic);
  const wx = 560, wy = lerp(1260, 700, lift);
  const L = LT.morning;
  drawTimeDevice(ctx, wx, wy, 120, g, { heat: 0, glow: 0.55, ang: ringsDial(g), rot: 0.3, strap: 'loose', strapCol: '#2a1a12' });
  if (lift < 0.05) withOp(ctx, 'lighter', () => glow(ctx, wx, wy, 300, '#ffb04a', 0.3));
  // his hand comes down from above and closes around the watch
  const hx = lerp(700, wx + 10, reach), hy = lerp(-420, wy - 190, reach);
  drawForearm(ctx, hx + 230, hy - 1500, hx, hy, 150, 128, OUTFIT.keremYoung.sleeve, OUTFIT.keremYoung.cuff, L, 0);
  drawHand(ctx, { x: hx, y: hy, rot: PI + 0.08, s: 3.0, side: 1, pose: mixPose(HAND_POSE.flat, HAND_POSE.grip, close), light: L, skin: HEAD.keremYoung.skin });
  drawAsh(ctx, t, 0, 0, W, H, 50, 9, 0.6);
}
function s6Dial(ctx, lt, t) {
  const g = t + CUE.s6;
  // where the machine's rings sit on screen in the first frame of the film
  const c0 = track(0, CAM1), ctr = camPt(c0, 540, 820, 0.85), Rend = 400 * Math.pow(c0.z, 0.85);
  const z = Math.pow(prog(lt, 0, 1.9, Ease.linear), 1.8);
  const R = lerp(150, Rend, z), cx = lerp(540, ctr[0], z), cy = lerp(1060, ctr[1], z);
  setScreen(ctx);
  ctx.fillStyle = mixc('#4a4248', '#0b070e', z); ctx.fillRect(0, 0, W, H);
  // open palm under the watch (scaled with the zoom)
  const k = R / 150, L = LT.morning;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
  ctx.globalAlpha = 1 - prog(lt, 1.3, 1.85);
  drawForearm(ctx, 120, 760, 40, 260, 120, 100, OUTFIT.keremYoung.sleeve, OUTFIT.keremYoung.cuff, L, 0);
  drawHand(ctx, { x: 30, y: 230, rot: 0.05, s: 3.2, side: 1, pose: 'rest', light: L, skin: HEAD.keremYoung.skin });
  ctx.globalAlpha = 1;
  ctx.restore();
  drawTimeDevice(ctx, cx, cy, R / 0.86, g, { heat: 0, glow: lerp(0.55, 0.75, z), ang: ringsDial(g), strap: 'worn', strapCol: '#2a1a12' });
  // the room around the dial darkens toward the lab
  setScreen(ctx); withOp(ctx, 'lighter', () => glow(ctx, cx, cy, R * 2.4, '#c8642a', 0.2 * z));
}

/* ===================== loop · 54.5–55 s · the lab again (= the first frames) ===================== */
function shotLoop(ctx, t) { shot1(ctx, t - (CUE.end - CUE.loop)); }

/* ---------- master timeline ---------- */
const SCENES = [
  { id: 1, name: 'Kanca', start: 0, end: 4, draw: shot1 },
  { id: 2, name: 'Fotoğraf', start: 4, end: 5.5, draw: shot2a },
  { id: 3, name: 'Geçmiş', start: 5.5, end: 14, draw: shot2b },
  { id: 4, name: 'Yolculuk', start: 14, end: 20, draw: shot3a },
  { id: 5, name: 'Aynı Gece', start: 20, end: 24, draw: shot3b },
  { id: 6, name: 'Gerilim', start: 24, end: 38, draw: shot4 },
  { id: 7, name: 'Ters Köşe', start: 38, end: 48, draw: shot5 },
  { id: 8, name: 'Döngü', start: 48, end: 54.5, draw: shot6 },
  { id: 9, name: 'Başa Dönüş', start: 54.5, end: 55, draw: shotLoop },
];
const TRANS = [{ at: 4, type: 'dissolve', dur: 0.5 }, { at: 5.5, type: 'dissolve', dur: 1.2 }, { at: 14, type: 'dissolve', dur: 0.8 }];
