/* =====================================================================
   Film scenes — a working two-shot starter. Replace with your story.
   Every function is a pure function of local time t (seconds since the
   shot started), so the film is deterministic and seekable.
   World units = output pixels at camera zoom 1 (frame is 1080 x 1920).
   ===================================================================== */

/* ---- lights: dir points TO the key light (x right, y down, z toward camera). Light the side the face turns to. */
const LT = {
  desk: mkLight({ dir: [-0.78, 0.3, 0.5], key: '#ffa84e', keyAmt: 0.46, mul: '#45253f', rim: '#a99aee', rimDir: [0.15, -1], rimW: 5, rimA: 0.85 }),
  window: mkLight({ dir: [0.62, -0.2, -0.76], key: '#b8a8ff', keyAmt: 0.45, mul: '#1a1026', rim: '#e0d6ff', rimDir: [0.9, -0.45], rimW: 7, rimA: 0.95 }),
};
const D = __DURATION__, CUT = +(D * 0.5).toFixed(2);

/* ===== SHOT 1 · the boss at his desk, slow push in ===== */
function shot1(ctx, t) {
  const cam = track(t, [[-0.6, { x: 540, y: 1000, z: 1.0 }], [CUT + 0.6, { x: 540, y: 790, z: 2.2 }, Ease.inOutQuad]]);
  setCam(ctx, cam, 0.9);                                   // back wall + window (parallax depth 0.9)
  ctx.fillStyle = '#140d18'; ctx.fillRect(-500, -500, 2080, 2900);
  for (const px of [-60, 170, 850, 1080]) drawPilaster(ctx, px, 90, 64, 1300, '#1a1220');
  const wp = archPath(250, 150, 580, 1100, 290);
  ctx.save(); ctx.clip(wp);
  drawCity(ctx, t, cam, { flash: 0, sky: [100, -100, 900, 1500], hz: 0.62, seed: 3,
    layers: [{ sky: SKY.mid, d: 0.26, x: -250, y: 100, k: 0.6, haze: '#2a1228' }, { sky: SKY.near, d: 0.36, x: -300, y: 330, k: 0.55 }],
    rain: [{ d: 0.5, x: 0, y: -200, w: 1100, h: 1700, n: 140, len: 40, speed: 1400, slant: -0.12, width: 1, color: '#9a8ac8', alpha: 0.35, seed: 11 }] });
  ctx.restore();
  setCam(ctx, cam, 0.9);
  ctx.save(); ctx.clip(wp); drawGlassRain(ctx, t, 250, 150, 580, 1100, { seed: 2, n: 20 }); ctx.restore();
  drawWindowFrame(ctx, 250, 150, 580, 1100, 290, { cols: 4, rows: 4, bar: 12, rays: 8 });
  setCam(ctx, cam, 1);                                     // the boss, the desk, then his hands ON the desk
  drawBossChair(ctx, 540, 560, 450, 1260, LT.desk);
  const out = {}, lift = prog(t, 0.6, 2.2, Ease.inOutCubic);
  const boss = { x: 540, y: 905, s: 0.82, light: LT.desk, t, breath: Math.sin(t * 1.3) * 0.5 + 0.5, out, cigar: true,
    head: { pitch: lerp(0.35, 0, lift), gaze: [0, lerp(0.8, 0, lift)], glint: lift, squint: 0.2 } };
  drawBossSeatedFront(ctx, boss);
  drawDeskFront(ctx, 70, 1208, 940, 760, LT.desk, { th: 56, reflect: [260, 0.55, 260] });
  drawBossHandsOnly(ctx, boss, { handR: { x: -50, y: 384, rot: PI + 0.35, fs: 0.62, pose: 'rest' }, handL: { x: 74, y: 390, rot: PI - 0.4, fs: 0.62, pose: 'flat' }, elbowR: [-226, 380], elbowL: [226, 380] });
  drawDecoLamp(ctx, 232, 1250, 0.74, LT.desk, t);
  smokeFrom(ctx, t, out, { k: 0.95, alpha: 0.4, height: 500 });    // cigar smoke (front views only)
  setScreen(ctx); drawHaze(ctx, t, 0, 300, W, 1300, '#6a5a8a', 0.08, 6, 2);
}

/* ===== SHOT 2 · alone at the great window; lightning; he turns to profile ===== */
function shot2(ctx, t) {
  const len = D - CUT, cam = track(t, [[-0.8, { x: 540, y: 980, z: 1.0 }], [len, { x: 556, y: 880, z: 1.8 }, Ease.inOutSine]]);
  const fl = flashAt(t, [{ t: len * 0.3, peak: 1 }]);
  setCam(ctx, cam, 0.9);
  const wp = archPath(-40, 60, 1160, 1500, 420);
  ctx.save(); ctx.clip(wp);
  drawCity(ctx, t, cam, { flash: fl, sky: [-500, -600, 2100, 2400], hz: 0.66, seed: 17, bolt: { seed: 23, x0: 820, y0: -100, x1: 900, y1: 820, k: 1.4 },
    layers: [{ sky: SKY.far, d: 0.15, x: -350, y: 480, k: 0.95, haze: '#3a1a30' }, { sky: SKY.mid, d: 0.24, x: -420, y: 420, k: 0.92 }, { sky: SKY.near, d: 0.36, x: -500, y: 560, k: 0.85 }],
    rain: [{ d: 0.5, x: -300, y: -400, w: 1700, h: 2400, n: 260, len: 60, speed: 1700, slant: -0.16, width: 1.2, color: '#a898d8', alpha: 0.4, seed: 31 }] });
  ctx.restore();
  setCam(ctx, cam, 0.9); drawWindowFrame(ctx, -40, 60, 1160, 1500, 420, { cols: 5, rows: 5, bar: 14, rays: 10, frame: 40, edgeA: 0.35 + fl * 0.8 });
  setCam(ctx, cam, 1);
  ctx.fillStyle = '#0a070c'; ctx.fillRect(-500, 1540, 2080, 900);
  glow(ctx, 600, 760, 420, '#7a5aa8', 0.22 + fl * 0.3);
  const turn = prog(t, len * 0.45, len * 0.8, Ease.inOutSine);
  drawStandingFront(ctx, { x: 540, y: 1720, s: 0.54, who: 'boss', view: 'back', arms: 'behind', light: withL(LT.window, fl), flash: fl * 0.5, t,
    head: { yaw: lerp(PI, 1.3, turn), glint: turn, squint: 0.3, cigar: true } });
  setCam(ctx, cam, 1.25); drawCurtain(ctx, -520, -600, 420, 3200, '#2a0a14', t, 3); drawCurtain(ctx, 1180, -600, 420, 3200, '#2a0a14', t, 3);
}

/* ---- master timeline: scenes must tile 0..D exactly; transitions are centred on boundaries ---- */
const SCENES = [
  { id: 1, name: 'The Office', start: 0, end: CUT, draw: shot1 },
  { id: 2, name: 'The Window', start: CUT, end: D, draw: shot2 },
];
const TRANS = [{ at: CUT, type: 'dissolve', dur: 0.8 }];
