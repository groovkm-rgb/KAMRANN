/* =====================================================================
   GREEN VAULT · the six scenes (40 s). Restrained historical
   reconstruction: anonymous silhouettes, no methods shown, no
   identifiable suspects.
   ===================================================================== */
const GL = {
  night: mkLight({ dir: [0.3, -0.5, 0.6], key: '#000000', keyAmt: 0.86, mul: '#000000', rim: '#9a88e0', rimDir: [1, -0.3], rimW: 5, rimA: 0.85, glint: 0 }),
  dawn: mkLight({ dir: [0.75, -0.3, 0.5], key: '#d8ccf0', keyAmt: 0.3, mul: '#2e2038', rim: '#ffcf8a', rimDir: [1, -0.3], rimW: 4, rimA: 0.8 }),
  dawnCU: mkLight({ dir: [0.72, -0.25, 0.55], key: '#e0d4f4', keyAmt: 0.34, mul: '#33223c', rim: '#ffcf8a', rimDir: [1, -0.2], rimW: 4, rimA: 0.85 }),
  office: mkLight({ dir: [-0.75, 0.1, 0.55], key: '#ffb04e', keyAmt: 0.42, mul: '#3a1e34', rim: '#a99aee', rimDir: [1, -0.4], rimW: 4, rimA: 0.75 }),
  officeBack: mkLight({ dir: [-0.6, -0.2, -0.5], key: '#ffb04e', keyAmt: 0.1, mul: '#140a14', rim: '#ffbe6a', rimDir: [-0.7, -0.7], rimW: 5, rimA: 0.85 }),
  gavel: mkLight({ dir: [-0.5, -0.6, 0.6], key: '#ffb04e', keyAmt: 0.4, mul: '#2e1a2a', rim: '#ffd890', rimDir: [-0.6, -0.8], rimW: 3, rimA: 0.7 }),
};
const STOLEN = new Set(['star', 'necklace', 'sword', 'epaulette', 'bow']);
const STILL_MISSING = new Set(['star', 'clasp']);
const BROKEN = { cx: 520, cy: 1075, r: 170, prog: 1, seed: 3 };
function beam(ctx, from, ang, len, w0, w1, a, col = '#fff2d8') {
  if (!from) return;
  setScreen(ctx);
  drawBeam(ctx, from.x, from.y, ang + PI / 2, len, w0, w1, col, a);
  glow(ctx, from.x, from.y, 50, col, a * 2.2);
}
function rainOn(ctx, t, cam, d, n, a, seed) { setCam(ctx, cam, d); drawRain(ctx, t, { x: -400, y: -300, w: 1900, h: 2600, n, len: 46, speed: 1500, slant: -0.1, width: 1.2, color: '#a898d8', alpha: a, seed }); }

/* ===================== SCENE 1 · 0–6 s · DRESDEN AT NIGHT ===================== */
function gv1(ctx, t) {
  const cam = track(t, [[0, { x: 540, y: 1030, z: 1.0 }], [6.5, { x: 556, y: 1012, z: 1.42 }, Ease.inOutSine]]);
  setCam(ctx, cam, 0.05);
  drawNightSky(ctx, -600, -600, 2300, 2500, 0, 0.8);
  // faint pre-dawn warmth low on the horizon
  const hz = ctx.createLinearGradient(0, 500, 0, 900); hz.addColorStop(0, 'rgba(160,70,50,0)'); hz.addColorStop(1, 'rgba(160,70,50,0.35)'); ctx.fillStyle = hz; ctx.fillRect(-600, 500, 2300, 400);
  setCam(ctx, cam, 0.1); drawClouds(ctx, t, -400, -200, 1900, 900, 0, 11);
  setCam(ctx, cam, 0.28); ctx.translate(0, 150); drawBaroqueSkyline(ctx, 0);
  setScreen(ctx); drawHaze(ctx, t, 0, 700, W, 500, '#5a4a6a', 0.12, 5, 3);
  setCam(ctx, cam, 0.5); ctx.translate(0, 190);
  ctx.fillStyle = '#0e0a10'; ctx.fillRect(-500, 1240, 2100, 700);
  drawPalace(ctx, t, 0);
  // mist hugging the palace base
  setScreen(ctx); drawHaze(ctx, t, 0, 1250, W, 300, '#4a3a5a', 0.16, 6, 9);
  // wet cobbled square + reflections
  setCam(ctx, cam, 1);
  ctx.drawImage(cobbleCanvas(), -310, 1440, 1700, 760);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const refl = (x, y0, len, w, col, a) => {   // soft rippling reflection on wet stone
    const N = 60;
    for (let i = 0; i < N; i++) { const f = i / N, yy = y0 + f * len, wob = Math.sin(yy * 0.05 + t * 1.8) * 5 * (0.3 + f) + snz(yy * 0.02 + t * 0.6, 3) * 6 * f, ww = w * (0.75 + 0.35 * Math.sin(yy * 0.11 + t * 2.5)); ctx.fillStyle = rgba(col, a * (1 - f) * (0.55 + 0.45 * hash(i * 13 + x))); ctx.fillRect(x - ww / 2 + wob, yy, ww, len / N + 0.6); }
    glow(ctx, x, y0 + 10, w * 1.3, col, a * 0.5, 'lighter', 0.35);
  };
  refl(560, 1450, 460, 110, '#e0a24a', 0.42);
  for (const x of [140, 350, 760, 970]) refl(x, 1455, 220, 26, '#e0a24a', 0.2);
  refl(110, 1690, 230, 60, '#ffb04a', 0.38); refl(990, 1720, 200, 60, '#ffb04a', 0.38);
  ctx.restore();
  // historic street lanterns (foreground parallax)
  setCam(ctx, cam, 1.15);
  drawStreetLantern(ctx, 110, 1790, 0.56, t); drawStreetLantern(ctx, 990, 1820, 0.56, t + 2);
  rainOn(ctx, t, cam, 1.1, 110, 0.22, 5);
  setCam(ctx, cam, 1); drawSplashes(ctx, t, -100, 1700, 1300, 30, 7, '#b8a8e0', 0.35, 1);
  setScreen(ctx); drawHaze(ctx, t, 0, 1200, W, 700, '#3a2a4a', 0.1, 5, 13);
}

/* ===================== SCENE 2 · 6–13 s · THE TREASURES ===================== */
function gv2(ctx, t) { if (t < 3.7) gv2Wide(ctx, t); else gv2Macro(ctx, t); }
function gv2Wide(ctx, t) {
  const cam = track(t, [[-0.6, { x: 540, y: 1010, z: 1.0 }], [3.85, { x: 540, y: 1092, z: 1.9 }, Ease.inOutSine]]);
  drawJewelRoom(ctx, t, cam, 'lit');
  setCam(ctx, cam, 1);
  for (const sx of [330, 750]) drawCone(ctx, sx, 300, 60, 420, 1050, '#ffd48a', 0.06);
  drawVitrine(ctx, t, { tray: { lit: 1, k: cam.z > 1.35 ? 1 : 0.4 }, caseLight: 1, light: 1, sheen: 0.7, sheenShift: -t * 30 });
  drawDust(ctx, t, 260, 300, 560, 600, 50, '#ffe6b0', 0.35, 2, 1);
  setScreen(ctx); drawHaze(ctx, t, 0, 300, W, 1400, '#7a5a5a', 0.05, 5, 21);
}
function gv2Macro(ctx, t) {
  const lt = t - 3.7, p = prog(lt, 0, 3.6, Ease.inOutSine);
  const cam = { x: 540, y: 960, z: lerp(1.0, 1.18, p) };
  setCam(ctx, cam, 1);
  ctx.fillStyle = darken(VELVET, 0.3); ctx.fillRect(-500, -500, 2080, 2900);
  const S = 2.9, fy = lerp(372, 236, p);         // pan from the necklace up to the breast star
  ctx.save(); ctx.translate(540 - 320 * S, 960 - fy * S); ctx.scale(S, S);
  drawTray(ctx, t, { lit: 1, k: 1 });
  ctx.restore();
  // warm spotlight pool + glass sheen sweeping across
  setScreen(ctx);
  glow(ctx, 520, 820, 900, '#ffc070', 0.16);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const sx = lerp(-400, 1300, prog(lt, 0.4, 3.4, Ease.inOutSine));
  ctx.fillStyle = 'rgba(220,210,255,0.07)'; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + 200, 0); ctx.lineTo(sx - 300, H); ctx.lineTo(sx - 500, H); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ===================== SCENE 3 · 13–21 s · THE THEFT ===================== */
function gv3(ctx, t) { if (t < 3.4) gv3Wide(ctx, t); else if (t < 5.6) gv3Glass(ctx, t); else gv3Empty(ctx, t); }
function gv3Wide(ctx, t) {
  const cam = { x: 540, y: lerp(1030, 1060, prog(t, 0, 3.4)), z: lerp(0.98, 1.05, prog(t, 0, 3.4, Ease.linear)) };
  drawJewelRoom(ctx, t, cam, 'night');
  setCam(ctx, cam, 1);
  drawVitrine(ctx, t, { tray: { lit: 0.5, k: 0.4 }, caseLight: 0.12, light: 0.2, sheen: 0.3 });
  // two anonymous figures — pure silhouettes with a cold rim
  const walk = prog(t, 0.2, 2.4, Ease.linear), oA = {}, oB = {};
  const ax = lerp(-160, 70, Ease.outSine(walk));
  drawSideFigure(ctx, { x: ax, y: 1720, s: 0.5, who: 'shade', face: 1, walk: walk > 0 && walk < 1 ? 0.8 : 0, phase: t * 6.5, hand: { x: 330, y: -1150 }, carry: 'torch', headTurn: 0.05, light: GL.night, t, out: oA, head: { pitch: 0.12, glint: 0 } });
  const Lb = Object.assign({}, GL.night, { rimDir: [-1, -0.3] });
  drawSideFigure(ctx, { x: 1010, y: 1745, s: 0.52, who: 'shade', face: -1, hand: { x: 280 + Math.sin(t * 1.3) * 20, y: -1080 }, carry: 'torch', headTurn: 0.08, light: Lb, t, out: oB, head: { pitch: 0.1, glint: 0 } });
  // torch beams sweep over the case
  beam(ctx, oA.torch, (oA.torchDir || 0) + Math.sin(t * 1.4) * 0.08, 700 * cam.z, 10, 150 * cam.z, 0.13);
  beam(ctx, oB.torch, (oB.torchDir || PI) + Math.sin(t * 1.1 + 1) * 0.1, 650 * cam.z, 10, 140 * cam.z, 0.11);
  setScreen(ctx); drawHaze(ctx, t, 0, 400, W, 1400, '#3a3460', 0.07, 5, 31);
}
function gv3Glass(ctx, t) {
  const lt = t - 3.4;
  const crack = prog(lt, 0.3, 0.75, Ease.outExpo);
  G.shakeX = lt > 0.3 && lt < 0.55 ? Math.sin(lt * 90) * 6 * (1 - (lt - 0.3) / 0.25) : 0;
  const cam = { x: 540, y: 960, z: lerp(1.0, 1.08, prog(lt, 0, 2.2, Ease.linear)) };
  setCam(ctx, cam, 0.9);
  ctx.fillStyle = '#060408'; ctx.fillRect(-500, -500, 2080, 2900);
  ctx.save(); ctx.translate(540 - 320 * 2.4, 1060 - 230 * 2.4); ctx.scale(2.4, 2.4);
  drawTray(ctx, t, { lit: 0.6, k: 1 });
  ctx.restore();
  ctx.fillStyle = 'rgba(6,4,10,0.55)'; ctx.fillRect(-500, -500, 2080, 2900);
  // torch light raking across the velvet
  setScreen(ctx); drawBeam(ctx, 1200, 300, -2.05, 1500, 40, 420, '#fff2d8', 0.12);
  setCam(ctx, cam, 1);
  drawBrokenGlass(ctx, t, { cx: 560, cy: 860, r: 620, prog: crack, seed: 7, fall: crack > 0.4 ? prog(lt, 0.45, 2.1, Ease.linear) : null, floor: 1700, lit: 1 });
  setScreen(ctx); drawHaze(ctx, t, 0, 0, W, H, '#3a3460', 0.06, 4, 37);
  G.shakeX = 0;
}
function gv3Empty(ctx, t) {
  const lt = t - 5.6;
  const cam = { x: 540, y: lerp(1000, 960, prog(lt, 0, 2.8)), z: lerp(1.0, 1.14, prog(lt, 0, 2.9, Ease.linear)) };
  setCam(ctx, cam, 1);
  ctx.fillStyle = '#060408'; ctx.fillRect(-500, -500, 2080, 2900);
  ctx.save(); ctx.translate(540 - 320 * 2.3, 1000 - 240 * 2.3); ctx.scale(2.3, 2.3);
  const sweep = prog(lt, 0.0, 2.4, Ease.inOutSine);
  drawTray(ctx, t, { missing: STOLEN, lit: 0.9, k: 1 });
  // shards left on the velvet
  for (let i = 0; i < 18; i++) { const x = hash(i * 3 + 1) * 640, y = hash(i * 3 + 2) * 460, s = 6 + hash(i * 5) * 16; ctx.save(); ctx.translate(x, y); ctx.rotate(hash(i) * 6); ctx.fillStyle = 'rgba(216,208,255,0.3)'; ctx.beginPath(); ctx.moveTo(-s, -s * 0.3); ctx.lineTo(s * 0.8, -s * 0.6); ctx.lineTo(s * 0.2, s * 0.8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore(); }
  ctx.restore();
  // darkness, cut only by a sweeping torch beam that moves on and leaves
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(92,80,120,1)'; ctx.fillRect(-500, -500, 2080, 2900); ctx.restore();
  setScreen(ctx);
  const bx = lerp(1300, -300, sweep), a = 0.5 * (1 - prog(lt, 2.3, 2.9));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(bx, 1000, 30, bx, 1000, 520); g.addColorStop(0, rgba('#fff0d0', a)); g.addColorStop(1, rgba('#fff0d0', 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  drawDust(ctx, t, bx - 300, 500, 600, 1000, 40, '#fff0d0', a * 2, 9, 1.2);
}

/* ===================== SCENE 4 · 21–28 s · DISCOVERY ===================== */
function gv4(ctx, t) { if (t < 2.4) gv4Enter(ctx, t); else if (t < 3.8) gv4Face(ctx, t); else if (t < 6.0) gv4Police(ctx, t); else gv4Evidence(ctx, t); }
function dawnShafts(ctx, cam, a) {
  setCam(ctx, cam, 0.9);
  shaft(ctx, [[1200, 200], [1400, 200], [700, 1800], [300, 1800]], '#d8c8ff', 0.05 * a);
  shaft(ctx, [[1300, 300], [1450, 300], [950, 1800], [700, 1800]], '#ffd8a0', 0.04 * a);
}
function gv4Enter(ctx, t) {
  const cam = { x: lerp(520, 540, prog(t, 0, 2.4)), y: 1060, z: lerp(1.05, 1.12, prog(t, 0, 2.4, Ease.linear)) };
  drawJewelRoom(ctx, t, cam, 'dawn');
  dawnShafts(ctx, cam, 1);
  setCam(ctx, cam, 1);
  drawVitrine(ctx, t, { tray: { missing: STOLEN, lit: 0.6, k: 0.4 }, caseLight: 0.3, light: 0.6, sheen: 0.5, broken: Object.assign({ fall: 3, floor: 1690, spread: 2.6 }, BROKEN) });
  const walk = prog(t, 0.0, 1.55, Ease.linear), stop = prog(t, 1.55, 1.9, Ease.outCubic), recoil = prog(t, 1.7, 2.1, Ease.outBack);
  const x = lerp(-150, 210, Ease.outSine(walk)) - recoil * 14;
  drawSideFigure(ctx, { x, y: 1750, s: 0.5, who: 'staff', face: 1, walk: (1 - stop) * (walk > 0 ? 0.85 : 0), phase: t * 6.8, lean: -0.1 * recoil, headTurn: 0.15, light: GL.dawn, t, head: { pitch: -0.05 * recoil, eyeOpen: 1 + 0.3 * recoil, frown: -0.6 * recoil, glint: 0.6 } });
  setScreen(ctx); drawHaze(ctx, t, 0, 300, W, 1400, '#8a7a9a', 0.06, 5, 41);
}
function gv4Face(ctx, t) {
  const lt = t - 2.4;
  const cam = { x: 540, y: lerp(960, 930, lt / 1.4), z: lerp(1.0, 1.1, prog(lt, 0, 1.4, Ease.linear)) };
  setCam(ctx, cam, 0.6);
  ctx.fillStyle = '#100c16'; ctx.fillRect(-900, -900, 2880, 3700);
  bokeh(ctx, t, 14, 900, ['#ffcf7a', '#c8b8ff', '#e0a24a'], 0.22, -200, 0, 1480, 1300);
  setCam(ctx, cam, 1);
  const shock = prog(lt, 0.15, 0.55, Ease.outCubic);
  drawBust(ctx, { x: 540, y: 1300, s: 2.0, who: 'staff', light: GL.dawnCU, t,
    head: { yaw: -0.32, pitch: -0.04, gaze: [-0.55, -0.1], eyeOpen: lerp(1.0, 1.42, shock), frown: lerp(0, -1.0, shock), mouthOpen: lerp(0, 1.15, prog(lt, 0.3, 0.8)), glint: 1 } });
  setScreen(ctx); drawHaze(ctx, t, 0, 0, W, H, '#8a7a9a', 0.05, 4, 43);
}
function gv4Police(ctx, t) {
  const lt = t - 3.8;
  const cam = { x: lerp(560, 530, prog(lt, 0, 2.2)), y: 1070, z: lerp(1.12, 1.2, prog(lt, 0, 2.2, Ease.linear)) };
  const flash = flashAt(lt, [{ t: 0.55, peak: 0.8 }, { t: 1.55, peak: 0.6 }]) ;
  drawJewelRoom(ctx, t, cam, 'dawn');
  dawnShafts(ctx, cam, 1);
  setCam(ctx, cam, 1);
  drawVitrine(ctx, t, { tray: { missing: STOLEN, lit: 0.6 + flash, k: 0.5 }, caseLight: 0.3 + flash, light: 0.6, sheen: 0.5, broken: Object.assign({ fall: 3, floor: 1690, spread: 2.6, lit: 1 + flash }, BROKEN) });
  const L1 = withL(GL.dawn, flash * 0.8);
  const lean = prog(lt, 0.0, 0.9, Ease.inOutSine);
  // investigator 1 leans in and points at the break (hand stops short of the glass)
  const s1 = 0.5, x1 = 175, y1 = 1750;
  drawSideFigure(ctx, { x: x1, y: y1, s: s1, who: 'det1', face: 1, bow: 0.28 * lean, hand: { x: lerp(160, 400, lean), y: lerp(-900, -1260, lean) }, handPose: 'point', headTurn: 0.12, light: L1, flash: flash * 0.4, t, head: { pitch: 0.12 * lean, glint: 0.4, frown: 0.2 } });
  // investigator 2 stands back, surveying the room
  drawStandingFront(ctx, { x: 905, y: 1770, s: 0.5, who: 'det2', arms: 'sides', light: L1, flash: flash * 0.4, t, head: { yaw: -0.5, pitch: 0.06, gaze: [-0.4, 0.1], glint: 0.6, frown: 0.2 } });
  if (flash > 0.01) { setScreen(ctx); withOp(ctx, 'lighter', () => { ctx.fillStyle = rgba('#f4f0ff', flash * 0.18); ctx.fillRect(0, 0, W, H); }); glow(ctx, 1000, 380, 260, '#ffffff', flash * 0.6); }
  setScreen(ctx); drawHaze(ctx, t, 0, 300, W, 1400, '#8a7a9a', 0.06, 5, 47);
}
function gv4Evidence(ctx, t) {
  const lt = t - 6.0;
  const cam = { x: lerp(560, 520, prog(lt, 0, 1.6)), y: 1010, z: lerp(1.0, 1.08, prog(lt, 0, 1.6, Ease.linear)) };
  setCam(ctx, cam, 1);
  // low view across the parquet toward the case base
  const fg = ctx.createLinearGradient(0, 700, 0, 1920); fg.addColorStop(0, '#120a0c'); fg.addColorStop(1, '#2a1610');
  ctx.fillStyle = '#0a070c'; ctx.fillRect(-500, -500, 2080, 1300);
  drawCheckerFloor(ctx, cam, { vx: 540, yFar: 760, yNear: 2400, xw0: 1500, xw1: 6000, rows: 10, cols: 12, ca: '#2a1610', cb: '#1a0c0a', dFar: 0.95, dNear: 1.1 });
  setCam(ctx, cam, 0.95);
  // the cabinet base, gilded, filling the top of frame
  const bg = ctx.createLinearGradient(0, 0, 0, 760); bg.addColorStop(0, '#0c0506'); bg.addColorStop(1, '#2a1410');
  ctx.fillStyle = bg; ctx.fillRect(-200, -200, 1480, 960);
  ctx.strokeStyle = rgba(PAL.gold, 0.55); ctx.lineWidth = 6; ctx.strokeRect(-100, 120, 1280, 560);
  for (const cx of [200, 540, 880]) { ctx.beginPath(); ctx.arc(cx, 400, 70, PI * 0.2, PI * 1.8); ctx.stroke(); }
  ctx.fillStyle = mixc(PAL.gold, '#000', 0.3); ctx.fillRect(-200, 740, 1480, 24);
  setScreen(ctx); shaft(ctx, [[1080, 0], [1080, 500], [200, 1920], [-200, 1920]], '#e8dcff', 0.07);
  setCam(ctx, cam, 1.02);
  // glass shards on the floor
  for (let i = 0; i < 26; i++) {
    const x = 120 + hash(i * 7) * 840, y = 900 + hash(i * 7 + 1) * 700, s = (8 + hash(i * 3) * 26) * (0.6 + (y - 900) / 1000);
    ctx.save(); ctx.translate(x, y); ctx.rotate(hash(i) * 6); ctx.scale(1, 0.45);
    ctx.fillStyle = 'rgba(216,208,255,0.25)'; ctx.beginPath(); ctx.moveTo(-s, -s * 0.3); ctx.lineTo(s * 0.8, -s * 0.6); ctx.lineTo(s * 0.2, s * 0.8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore();
    if (hash(i * 11) < 0.35) brilliantGlint(ctx, x, y, s * 0.6, t, i);
  }
  // plain evidence tents (no numbers or lettering)
  for (const [x, y, k] of [[300, 1060, 0.8], [690, 1220, 1.0], [430, 1520, 1.3]]) evidenceTent(ctx, x, y, k);
}
/** a right hand gripping a straight handle: fingers wrap across the handle (drawn after it),
    the wrist sits just off the handle and the sleeve runs away from the fingers. */
function gripHand(ctx, gx, gy, ang, flip, s, L, skin, sleeve, cuff, armLen, armBias) {
  const ux = Math.cos(ang), uy = Math.sin(ang), fx = -uy * flip, fy = ux * flip;
  const wx = gx - fx * 92 * s, wy = gy - fy * 92 * s;
  const ex = wx - fx * armLen + ux * armLen * armBias, ey = wy - fy * armLen + uy * armLen * armBias;
  drawForearm(ctx, ex, ey, wx, wy, 52 * s, 42 * s, sleeve, cuff, L, 0);
  drawHand(ctx, { x: wx, y: wy, rot: Math.atan2(fx, -fy), s, side: 1, pose: 'grip', light: L, skin });
}
function brilliantGlint(ctx, x, y, s, t, seed) {
  const tw = Math.pow(Math.max(0, Math.sin(t * 2.3 + seed * 1.7)), 10);
  if (tw < 0.05) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba('#ffffff', tw);
  ctx.beginPath(); ctx.moveTo(x - s * 2, y); ctx.lineTo(x, y - 1.2); ctx.lineTo(x + s * 2, y); ctx.lineTo(x, y + 1.2); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function evidenceTent(ctx, x, y, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(18, 6, 70, 14, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c89a2a'; ctx.fill(pathOf([[-50, 0], [50, 0], [20, -90], [-20, -90]]));
  ctx.fillStyle = '#8a6418'; ctx.fill(pathOf([[50, 0], [70, -8], [36, -94], [20, -90]]));
  ctx.fillStyle = '#1a140c'; ctx.fillRect(-30, -52, 60, 6);
  edgeFill(ctx, pathOf([[-50, 0], [50, 0], [20, -90], [-20, -90]]), 3, 3, '#ffe4a0', 0.6);
  ctx.restore();
}

/* ===================== SCENE 5 · 28–34 s · INVESTIGATION ===================== */
function gv5(ctx, t) { if (t < 2.3) gv5Board(ctx, t); else if (t < 3.7) gv5Desk(ctx, t); else if (t < 5.1) gv5Court(ctx, t); else gv5Gavel(ctx, t); }
function gv5Board(ctx, t) {
  const cam = { x: lerp(530, 560, prog(t, -0.4, 2.3)), y: 940, z: lerp(1.0, 1.08, prog(t, -0.4, 2.3, Ease.linear)) };
  setCam(ctx, cam, 0.85);
  const wg = ctx.createLinearGradient(0, 0, 0, 1800); wg.addColorStop(0, '#0e0a10'); wg.addColorStop(1, '#1c1218');
  ctx.fillStyle = wg; ctx.fillRect(-700, -700, 2480, 3000);
  drawBlinds(ctx, -400, 100, 1200, 1100, 14, 180, '#e0a860', 0.07);
  // cork board
  ctx.fillStyle = '#1a0e08'; ctx.fillRect(150, 330, 780, 760);
  const cg = ctx.createRadialGradient(420, 620, 50, 540, 700, 600); cg.addColorStop(0, '#6a4428'); cg.addColorStop(1, '#2e1a10');
  ctx.fillStyle = cg; ctx.fillRect(170, 350, 740, 720);
  paintOverlay(ctx, 170, 350, 740, 720, 0.6);
  const ph = [['palace', 330, 520, 250, 190, -0.05], ['star', 640, 500, 190, 190, 0.06], ['necklace', 780, 760, 210, 150, -0.04], ['vitrine', 360, 850, 230, 170, 0.04], ['glass', 600, 900, 170, 150, -0.08]];
  for (const [k, x, y, w, h, r] of ph) bwPhoto(ctx, x, y, w, h, r, PHOTOS[k], 1);
  ctx.strokeStyle = '#a01822'; ctx.lineWidth = 3;
  const pins = ph.map(([, x, y, , h]) => [x, y - h / 2 + 14]);
  ctx.beginPath(); for (const [a, b] of [[0, 1], [1, 2], [0, 3], [3, 4], [4, 1]]) { ctx.moveTo(pins[a][0], pins[a][1]); ctx.lineTo(pins[b][0], pins[b][1]); } ctx.stroke();
  for (const [x, y] of pins) drawPin(ctx, x, y);
  drawFanShadow(ctx, 300, 200, 900, t * 0.8, 0.22, 0.7);
  setCam(ctx, cam, 1);
  glow(ctx, 260, 1300, 700, '#ffb04a', 0.18);
  // investigator points at a photograph (figure at right, facing the board)
  const reach = prog(t, 0.3, 1.1, Ease.inOutSine);
  drawSideFigure(ctx, { x: 1000, y: 1880, s: 0.56, who: 'det2', face: -1, hand: { x: lerp(150, 310, reach), y: lerp(-900, -1380, reach) }, handPose: 'point', headTurn: 0.2, light: Object.assign({}, GL.office, { rimDir: [1, -0.3] }), t, head: { pitch: -0.08, glint: 0.6, frown: 0.3 } });
  // second investigator seen from behind (foreground)
  setCam(ctx, cam, 1.3);
  drawBust(ctx, { x: 250, y: 1840, s: 1.35, who: 'det1', view: 'back', light: GL.officeBack, t, head: { yaw: PI - 0.25, pitch: -0.08, glint: 0 } });
  setScreen(ctx); drawHaze(ctx, t, 0, 0, W, H, '#6a4a3a', 0.06, 5, 51);
}
function gv5Desk(ctx, t) {
  const lt = t - 2.3, L = mkLight({ dir: [0.4, -0.6, 0.7], key: '#ffb24e', keyAmt: 0.45, mul: '#3a1e30', rim: '#ffd890', rimDir: [0.5, -0.9], rimW: 3, rimA: 0.5 });
  const cam = { x: 540, y: 960, z: lerp(1.0, 1.06, lt / 1.4), r: 0.02 };
  setCam(ctx, cam, 1);
  const dg = ctx.createRadialGradient(560, 860, 60, 540, 960, 1200); dg.addColorStop(0, '#5a2a18'); dg.addColorStop(0.5, '#2a120c'); dg.addColorStop(1, '#070304');
  ctx.fillStyle = dg; ctx.fillRect(-500, -500, 2080, 2900);
  paintOverlay(ctx, -300, -300, 1680, 2600, 0.4);
  bwPhoto(ctx, 260, 470, 300, 230, -0.18, PHOTOS.necklace, 1);
  bwPhoto(ctx, 300, 1380, 340, 260, -0.12, PHOTOS.palace, 1);
  bwPhoto(ctx, 820, 1330, 300, 240, 0.14, PHOTOS.vitrine, 1);
  bwPhoto(ctx, 860, 520, 260, 200, 0.2, PHOTOS.sword, 1);
  const SP = (c, w, h) => PHOTOS.star(c, w, h);
  bwPhoto(ctx, 560, 920, 440, 440, 0.03, SP, 1);
  // magnifying glass gliding over the star photograph
  const m = prog(lt, 0, 1.4, Ease.inOutSine), lx = lerp(430, 590, m), ly = lerp(1060, 880, m), lr = 150;
  ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, lr, 0, TAU); ctx.clip();
  ctx.translate(lx, ly); ctx.scale(1.8, 1.8); ctx.translate(-lx, -ly);
  bwPhoto(ctx, 560, 920, 440, 440, 0.03, SP, 1);
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,240,220,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(lx, ly, lr - 18, PI * 1.1, PI * 1.45); ctx.stroke(); ctx.restore();
  ctx.lineWidth = 16; ctx.strokeStyle = '#0e0a0c'; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, TAU); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = PAL.gold; ctx.beginPath(); ctx.arc(lx, ly, lr - 6, 0, TAU); ctx.stroke();
  const ha = 0.95, hx0 = lx + Math.cos(ha) * lr, hy0 = ly + Math.sin(ha) * lr, hx1 = lx + Math.cos(ha) * (lr + 300), hy1 = ly + Math.sin(ha) * (lr + 300);
  ctx.fillStyle = '#120c0e'; ctx.fill(quad(hx0, hy0, hx1, hy1, 16, 20));
  ctx.fillStyle = PAL.gold; ctx.fill(quad(hx0, hy0, hx0 + Math.cos(ha) * 24, hy0 + Math.sin(ha) * 24, 18, 18));
  // the hand holding the handle; sleeve continues off-frame
  gripHand(ctx, lx + Math.cos(ha) * (lr + 220), ly + Math.sin(ha) * (lr + 220), ha, 1, 1.45, L, HEAD.det1.skin, OUTFIT.det1.suit, OUTFIT.det1.cuff, 520, -0.35);
  setScreen(ctx); glow(ctx, 560, 820, 700, '#ffb04a', 0.12);
}
function gv5Court(ctx, t) {
  const lt = t - 3.7, p = prog(lt, 0, 1.6, Ease.inOutSine);
  const cam = { x: 540, y: lerp(1180, 860, p), z: lerp(1.08, 1.0, p) };
  setCam(ctx, cam, 0.05);
  drawNightSky(ctx, -600, -600, 2300, 2600, 0, 0.7);
  const dawn = ctx.createLinearGradient(0, -200, 0, 900); dawn.addColorStop(0, 'rgba(255,190,110,0)'); dawn.addColorStop(1, 'rgba(255,170,100,0.18)');
  ctx.fillStyle = dawn; ctx.fillRect(-600, -200, 2300, 1100);
  setCam(ctx, cam, 0.1); drawClouds(ctx, t, -400, -300, 1900, 800, 0, 17);
  setCam(ctx, cam, 0.12); drawBeam(ctx, -200, -200, 2.4, 1600, 60, 360, '#ffd8a0', 0.08); drawBeam(ctx, 100, -300, 2.6, 1600, 50, 300, '#ffd8a0', 0.06);
  setCam(ctx, cam, 0.9);
  const stone = '#2a2230', hi = '#4a3e4a';
  // stepped Art-Deco attic with the scales of justice
  ctx.fillStyle = stone; ctx.fill(pathOf([[-200, 760], [-200, 560], [140, 560], [140, 480], [320, 480], [320, 380], [760, 380], [760, 480], [940, 480], [940, 560], [1280, 560], [1280, 760]]));
  ctx.fillStyle = rgba('#ffcf8a', 0.25); ctx.fillRect(320, 380, 440, 3); ctx.fillRect(140, 480, 180, 3); ctx.fillRect(760, 480, 180, 3);
  drawScales(ctx, 540, 520, 96, mixc('#c89a4a', '#ffe0a0', 0.3 + 0.2 * Math.sin(t * 1.5)), 9);
  glow(ctx, 540, 520, 200, '#ffcf8a', 0.25);
  ctx.fillStyle = hi; ctx.fillRect(-200, 740, 1480, 40);
  // colonnade (tapering slightly: low camera)
  ctx.fillStyle = '#120c14'; ctx.fillRect(-200, 780, 1480, 760);
  const dg = ctx.createLinearGradient(0, 1050, 0, 1540); dg.addColorStop(0, '#5a3214'); dg.addColorStop(1, '#e0a24a');
  ctx.fillStyle = dg; ctx.beginPath(); ctx.moveTo(460, 1540); ctx.lineTo(460, 1120); ctx.arc(540, 1120, 80, PI, TAU); ctx.lineTo(620, 1540); ctx.fill(); ctx.strokeStyle = '#120c14'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(540, 1180); ctx.lineTo(540, 1540); ctx.stroke(); glow(ctx, 540, 1400, 300, '#e0a24a', 0.45);
  for (let i = 0; i < 6; i++) {
    const cx = [60, 230, 400, 680, 850, 1020][i];   // wider central bay frames the lit doorway
    const top = 790, bot = 1540, wt = 56, wb = 66;
    const col = ctx.createLinearGradient(cx - wb, 0, cx + wb, 0); col.addColorStop(0, '#1a141c'); col.addColorStop(0.35, '#4a3e48'); col.addColorStop(1, '#120c14');
    ctx.fillStyle = col; ctx.fill(pathOf([[cx - wt, top], [cx + wt, top], [cx + wb, bot], [cx - wb, bot]]));
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(cx + k * wt * 0.36, top); ctx.lineTo(cx + k * wb * 0.36, bot); ctx.stroke(); }
    ctx.fillStyle = hi; ctx.fillRect(cx - wt - 12, top - 14, wt * 2 + 24, 18); ctx.fillRect(cx - wb - 14, bot - 6, wb * 2 + 28, 20);
  }
  paintOverlay(ctx, -200, 380, 1480, 1200, 0.5);
  // wet steps
  setCam(ctx, cam, 1.05);
  for (let i = 0; i < 9; i++) { const y = 1550 + i * 52 + i * i * 3; ctx.fillStyle = i % 2 ? '#1a141e' : '#221a26'; ctx.fillRect(-400, y, 1880, 56 + i * 6); ctx.fillStyle = rgba('#b8a8e0', 0.18); ctx.fillRect(-400, y, 1880, 2); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 16; i++) { ctx.fillStyle = rgba('#e0a24a', 0.18 * (1 - i / 16)); ctx.fillRect(470 + Math.sin(i * 1.7 + t * 2) * 8, 1560 + i * 26, 140, 8); } ctx.restore();
  setScreen(ctx); drawHaze(ctx, t, 0, 900, W, 900, '#6a5a7a', 0.08, 5, 57);
}
function gv5Gavel(ctx, t) {
  const lt = t - 5.1, L = GL.gavel;
  const lift = prog(lt, 0.0, 0.3, Ease.outCubic), strike = prog(lt, 0.3, 0.4, Ease.inCubic);
  const ang = 0.4 * lift * (1 - strike) + Math.sin(clamp((lt - 0.4) * 18, 0, PI)) * 0.03;   // raise = clockwise about the elbow
  const hit = lt > 0.4 ? Math.exp(-(lt - 0.4) * 6) : 0;
  G.shakeY = hit * 7 * Math.sin(lt * 70);
  const cam = { x: 560, y: 980, z: 1.0 + lt * 0.03 };
  setCam(ctx, cam, 0.7);
  ctx.fillStyle = '#0a070c'; ctx.fillRect(-900, -900, 2880, 3700);
  bokeh(ctx, t, 10, 1300, ['#ffcf7a', '#e0a24a'], 0.18, -200, -200, 1480, 1000);
  setCam(ctx, cam, 1);
  // bench top and sound block
  const tg = ctx.createLinearGradient(0, 1080, 0, 1920); tg.addColorStop(0, '#3a1a10'); tg.addColorStop(1, '#100606');
  ctx.fillStyle = tg; ctx.fillRect(-500, 1080, 2080, 900);
  ctx.fillStyle = rgba('#ffcf8a', 0.3); ctx.fillRect(-500, 1080, 2080, 3);
  glow(ctx, 560, 1110, 420, '#ffc070', 0.22 + hit * 0.3, 'lighter', 0.3);
  ctx.fillStyle = '#2a120a'; ctx.beginPath(); ctx.ellipse(560, 1135, 170, 40, 0, 0, TAU); ctx.fill();
  ctx.fillRect(390, 1090, 340, 45);
  ctx.fillStyle = '#5a2c16'; ctx.beginPath(); ctx.ellipse(560, 1090, 170, 40, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba('#ffcf8a', 0.4); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(560, 1090, 130, 30, 0, 0, TAU); ctx.stroke();
  // arm + gavel rotate together about the (off-frame) elbow
  ctx.save(); ctx.translate(1146, 346); ctx.rotate(ang); ctx.translate(-1146, -346);   // pivot = the elbow
  ctx.fillStyle = '#2a140c'; ctx.fill(quad(560, 990, 920, 990, 13, 15));
  ctx.fillStyle = PAL.gold; ctx.fillRect(600, 977, 14, 26);
  const hd = ctx.createLinearGradient(500, 0, 620, 0); hd.addColorStop(0, '#2a120a'); hd.addColorStop(0.45, '#7a3c1e'); hd.addColorStop(1, '#1a0a06');
  ctx.fillStyle = hd; ctx.beginPath(); ctx.roundRect(500, 880, 120, 200, 18); ctx.fill();
  ctx.fillStyle = PAL.gold; ctx.fillRect(500, 910, 120, 10); ctx.fillRect(500, 1040, 120, 10);
  ctx.fillStyle = '#1a0a06'; ctx.beginPath(); ctx.ellipse(560, 880, 60, 12, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(560, 1080, 60, 12, 0, 0, TAU); ctx.fill();
  gripHand(ctx, 860, 990, 0, 1, 1.35, L, '#c49a7c', '#1c1620', '#d8d0c0', 520, 0.55);
  ctx.restore();
  if (hit > 0.02) { setScreen(ctx); drawDust(ctx, t, 380, 950, 360, 160, 30, '#ffe0b0', hit * 0.8, 21, 1.5); }
  G.shakeY = 0;
}

/* ===================== SCENE 6 · 34–40 s · AFTERMATH ===================== */
function gv6(ctx, t) {
  const cam = track(t, [[-0.6, { x: 540, y: 1098, z: 3.0 }], [5.8, { x: 540, y: 1010, z: 0.98 }, Ease.inOutCubic]]);
  drawJewelRoom(ctx, t, cam, 'warm');
  setCam(ctx, cam, 1);
  for (const sx of [330, 750]) drawCone(ctx, sx, 300, 60, 420, 1050, '#ffd48a', 0.08);
  drawVitrine(ctx, t, { tray: { missing: STILL_MISSING, lit: 1.1, k: cam.z > 1.5 ? 1 : 0.45 }, caseLight: 1.3, light: 1.1, sheen: 0.6, sheenShift: t * 20 });
  // museum barrier: brass stanchions & velvet rope
  setCam(ctx, cam, 1.18);
  ctx.strokeStyle = '#5a1420'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(60, 1640); ctx.quadraticCurveTo(300, 1760, 540, 1650); ctx.quadraticCurveTo(780, 1760, 1020, 1640); ctx.stroke();
  for (const x of [60, 540, 1020]) { ctx.fillStyle = '#8a6428'; ctx.fillRect(x - 9, 1630, 18, 300); ctx.beginPath(); ctx.arc(x, 1626, 20, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd890'; ctx.fillRect(x - 4, 1640, 4, 280); }
  setCam(ctx, cam, 1);
  drawDust(ctx, t, 260, 300, 560, 700, 50, '#ffe6b0', 0.32, 4, 1);
  setScreen(ctx); drawHaze(ctx, t, 0, 300, W, 1400, '#7a5a5a', 0.05, 5, 61);
}

/* ---------- master timeline for this film ---------- */
const SCENES = [
  { id: 1, name: 'Dresden at Night', start: 0, end: 6, draw: gv1 },
  { id: 2, name: 'The Treasures', start: 6, end: 13, draw: gv2 },
  { id: 3, name: 'The Theft', start: 13, end: 21, draw: gv3 },
  { id: 4, name: 'Discovery', start: 21, end: 28, draw: gv4 },
  { id: 5, name: 'Investigation', start: 28, end: 34, draw: gv5 },
  { id: 6, name: 'Aftermath', start: 34, end: 40, draw: gv6 },
];
const TRANS = [
  { at: 6, type: 'dissolve', dur: 0.8 },
  { at: 13, type: 'dip', dur: 0.6 },
  { at: 21, type: 'dip', dur: 0.7 },
  { at: 28, type: 'dissolve', dur: 0.7 },
  { at: 34, type: 'dissolve', dur: 0.9 },
];
