/* =====================================================================
   06 · SCENES — six shots-lists, each a pure function of local time.
   World units = output pixels at camera zoom 1.
   ===================================================================== */

/* optional reference portrait (user-supplied image of the boss) */
const REF = { img: null, fx: 0.5, fy: 0.36, fh: 0.42 };
/** draw the reference image so its face centre lands at (x,y) with face height fhPx, graded to the noir palette */
function drawRefPortrait(ctx, x, y, fhPx, o = {}) {
  const img = REF.img; if (!img) return false;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const k = fhPx / (REF.fh * ih);
  const dx = x - REF.fx * iw * k, dy = y - REF.fy * ih * k, dw = iw * k, dh = ih * k;
  ctx.save();
  ctx.drawImage(img, dx, dy, dw, dh);
  // noir grade: plum multiply, amber key from one side, crushed edges
  ctx.globalCompositeOperation = 'multiply';
  const g = ctx.createLinearGradient(x - fhPx, 0, x + fhPx, 0);
  const ks = o.keySide ?? -1;
  g.addColorStop(ks < 0 ? 0 : 1, o.keyCol || '#ffc890'); g.addColorStop(0.5, '#a07ab0'); g.addColorStop(ks < 0 ? 1 : 0, '#2a1838');
  ctx.fillStyle = g; ctx.fillRect(dx, dy, dw, dh);
  ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(x, y, fhPx * 0.35, x, y + fhPx * 0.3, fhPx * 1.6);
  v.addColorStop(0, 'rgba(8,5,12,0)'); v.addColorStop(1, 'rgba(8,5,12,0.96)');
  ctx.fillStyle = v; ctx.fillRect(dx - 2000, dy - 2000, dw + 4000, dh + 4000);
  if (o.flash) withOp(ctx, 'screen', () => { ctx.fillStyle = rgba('#b8a8ff', o.flash * 0.35); ctx.fillRect(dx, dy, dw, dh); });
  ctx.restore();
  return true;
}
function useRef() { return !!REF.img; }

/* ---------- shared helpers ---------- */
function shaft(ctx, pts, color, a) {
  const ys = pts.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgba(color, a)); g.addColorStop(1, rgba(color, 0));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fill(pathOf(pts)); ctx.restore();
}
function smokeFrom(ctx, t, out, o = {}) {
  if (!out || !out.ember) return;
  setScreen(ctx);
  drawSmoke(ctx, t, out.ember.x, out.ember.y, out.ember.k * (o.k || 1), o);
}
function blackFill(ctx, a) { if (a <= 0) return; setScreen(ctx); ctx.fillStyle = 'rgba(4,3,6,' + clamp(a).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
function bokeh(ctx, t, n, seed, cols, a, x0 = 0, y0 = 0, w = W, h = H, r0 = 30, r1 = 90) {
  for (let i = 0; i < n; i++) {
    const x = x0 + hash(seed + i) * w + Math.sin(t * 0.2 + i) * 6, y = y0 + hash(seed + i + 40) * h, r = lerp(r0, r1, hash(seed + i + 80));
    glow(ctx, x, y, r, cols[i % cols.length], a * (0.5 + 0.5 * hash(seed + i + 120)));
  }
}
const withL = (L, flash) => (flash > 0 ? Object.assign({}, L, { rimA: clamp(L.rimA + flash), rimW: L.rimW * (1 + flash) }) : L);

/* =====================================================================
   SCENE 1 · 0–7 s · INTRODUCTION: the boss in his midnight office
   ===================================================================== */
const S1 = {
  Lb: mkLight({ dir: [-0.78, 0.3, 0.5], key: '#ffa84e', keyAmt: 0.46, mul: '#45253f', rim: '#a99aee', rimDir: [0.15, -1], rimW: 5, rimA: 0.85 }),
  Lg: mkLight({ dir: [0.3, -0.4, 0.6], key: '#ffad55', keyAmt: 0.08, mul: '#2a1a30', rim: '#9a88e0', rimDir: [0.9, -0.5], rimW: 4, rimA: 0.75 }),
  Lg2: mkLight({ dir: [-0.3, -0.4, 0.6], key: '#ffad55', keyAmt: 0.08, mul: '#2a1a30', rim: '#9a88e0', rimDir: [-0.9, -0.5], rimW: 4, rimA: 0.75 }),
};
function scene1(ctx, t) {
  const cam = track(t, [[0, { x: 536, y: 1000, z: 1.0 }], [7.45, { x: 540, y: 770, z: 2.55 }, Ease.inOutQuad]]);
  cam.x += Math.sin(t * 0.45) * 5;
  const fl = flashAt(t, [{ t: 1.55, peak: 0.65 }, { t: 4.9, peak: 0.28 }]);
  // ---- back wall + window (depth .9)
  setCam(ctx, cam, 0.9);
  const wg = ctx.createLinearGradient(0, 0, 0, 1400); wg.addColorStop(0, '#0d0911'); wg.addColorStop(1, '#1c1220');
  ctx.fillStyle = wg; ctx.fillRect(-500, -500, 2080, 2900);
  drawFrieze(ctx, -100, 40, 1280, 46, '#120c14', rgba(PAL.amb1, 0.45));
  for (const px of [-60, 170, 850, 1080]) drawPilaster(ctx, px, 90, 64, 1300, '#1a1220');
  paintOverlay(ctx, -200, -100, 1480, 1600, 0.4);
  const wp = archPath(250, 150, 580, 1100, 290);
  ctx.save(); ctx.clip(wp);
  drawCity(ctx, t, cam, {
    flash: fl, sky: [100, -100, 900, 1500], hz: 0.62, seed: 3,
    bolt: { seed: 7, x0: 690, y0: 120, x1: 760, y1: 700 },
    beams: [{ x: 300, y: 1200, a0: 0.25, amp: 0.25, sp: 0.35, ph: 0, len: 1300, w: 70, alpha: 0.07 }, { x: 760, y: 1200, a0: -0.3, amp: 0.2, sp: 0.28, ph: 2, len: 1300, w: 60, alpha: 0.06 }],
    layers: [{ sky: SKY.far, d: 0.18, x: -150, y: 170, k: 0.62, haze: '#3a1a30' }, { sky: SKY.mid, d: 0.26, x: -250, y: 100, k: 0.6, haze: '#2a1228' }, { sky: SKY.near, d: 0.36, x: -300, y: 330, k: 0.55 }],
    rain: [{ d: 0.5, x: 0, y: -200, w: 1100, h: 1700, n: 160, len: 40, speed: 1400, slant: -0.12, width: 1, color: '#9a8ac8', alpha: 0.35, seed: 11 }],
  });
  ctx.restore();
  setCam(ctx, cam, 0.9);
  ctx.save(); ctx.clip(wp); drawGlassRain(ctx, t, 250, 150, 580, 1100, { seed: 2, n: 24 }); ctx.restore();
  drawWindowFrame(ctx, 250, 150, 580, 1100, 290, { cols: 4, rows: 4, bar: 12, rays: 8, edgeA: 0.3 + fl * 0.7 });
  drawSconce(ctx, 104, 468, 0.72, 0.85); drawSconce(ctx, 976, 468, 0.72, 0.85);
  // window light shafts into the room
  shaft(ctx, [[270, 600], [810, 600], [1100, 1700], [-20, 1700]], '#8a78d0', 0.06 + fl * 0.18);
  // ---- bodyguards (depth .95)
  setCam(ctx, cam, 0.95);
  const br = Math.sin(t * 1.6) * 0.5 + 0.5;
  drawStandingFront(ctx, { x: 150, y: 1660, s: 0.56, who: 'guard', arms: 'clasped', light: withL(S1.Lg, fl), flash: fl * 0.3, breath: br, t, head: { yaw: 0.18, pitch: 0.05, glint: 0 } });
  drawStandingFront(ctx, { x: 932, y: 1660, s: 0.56, who: 'guard', arms: 'clasped', light: withL(S1.Lg2, fl), flash: fl * 0.3, breath: 1 - br, t, head: { yaw: -0.2, pitch: 0.05, glint: 0 } });
  // ---- chair + boss (depth 1)
  setCam(ctx, cam, 1);
  drawBossChair(ctx, 540, 560, 450, 1260, withL(S1.Lb, fl));
  const lift = prog(t, 3.3, 5.5, Ease.inOutCubic);
  const out = {};
  const bossO = {
    x: 540, y: 905, s: 0.82, light: withL(S1.Lb, fl), flash: fl * 0.4, t, breath: Math.sin(t * 1.3) * 0.5 + 0.5, out,
    head: { pitch: lerp(0.42, 0, lift), yaw: Math.sin(t * 0.3) * 0.03, gaze: [0, lerp(0.9, 0, lift)], eyeOpen: lerp(0.55, 1, lift), squint: lerp(0, 0.25, prog(t, 5.4, 6.6)), glint: prog(t, 4.8, 5.8), frown: 0.1 },
  };
  drawBossSeatedFront(ctx, bossO);
  // ---- desk & props, then the hands resting on the desk
  drawDeskFront(ctx, 70, 1208, 940, 760, S1.Lb, { th: 56, reflect: [260, 0.55, 260] });
  drawRainShadows(ctx, t, 300, 1210, 480, 50, { n: 14, alpha: 0.18, scale: 0.6, seed: 4 });
  drawEnvelope(ctx, 735, 1236, 130, 30, -0.05, S1.Lb, false, 0.6);
  drawBossHandsOnly(ctx, bossO, { handR: { x: -50, y: 384, rot: PI + 0.35, fs: 0.62, pose: 'rest', glint: pulse(t, 2.2, 3.4, 0.4) * 0.8 }, handL: { x: 74, y: 390, rot: PI - 0.4, fs: 0.62, pose: 'flat' }, elbowR: [-226, 380], elbowL: [226, 380] });
  const lampP = drawDecoLamp(ctx, 232, 1250, 0.74, S1.Lb, t);
  drawWhiskey(ctx, 830, 1252, 0.75, S1.Lb, t);
  drawCandlestickPhone(ctx, 930, 1258, 0.72, S1.Lb);
  // ---- foreground drape (depth 1.3)
  setCam(ctx, cam, 1.3);
  drawCurtain(ctx, -260, -400, 300, 2800, '#3a0e18', t, 2);
  // ---- atmosphere
  smokeFrom(ctx, t, out, { k: 0.95, alpha: 0.42, height: 520, seed: 1 });
  setScreen(ctx);
  drawHaze(ctx, t, 0, 300, W, 1300, '#6a5a8a', 0.08, 6, 2);
  setCam(ctx, cam, 1);
  drawDust(ctx, t, 260, 500, 560, 800, 60, '#d8ccff', 0.35, 1, 1.2);
  glow(ctx, lampP.x, lampP.y, 520, '#ff9a40', 0.12, 'lighter');
}

/* =====================================================================
   SCENE 2 · 7–16 s · MANAGING THE ORGANIZATION
   ===================================================================== */
const S2 = {
  Lb: mkLight({ dir: [0.25, -0.75, 0.55], key: '#ffbf66', keyAmt: 0.4, mul: '#47283f', rim: '#a99aee', rimDir: [0, -1], rimW: 4.5, rimA: 0.85 }),
  Lt: mkLight({ dir: [0.2, -0.85, 0.3], key: '#ffbf66', keyAmt: 0.22, mul: '#3a2036', rim: '#e8b86a', rimDir: [0, -1], rimW: 5, rimA: 0.7 }),
  Lfg: mkLight({ dir: [0, -1, -0.2], key: '#ffbf66', keyAmt: 0.04, mul: '#1a0e1c', rim: '#e0aa60', rimDir: [0, -1], rimW: 6, rimA: 0.85 }),
};
// table geometry helpers: u = 0 (far end) → 1 (near)
const S2T = { fx0: 396, fx1: 684, fy: 1000, nx0: -330, nx1: 1410, ny: 2320, d0: 0.9, d1: 1.36 };
function s2Edge(u, side) {
  const x = side < 0 ? lerp(S2T.fx0, S2T.nx0, u) : lerp(S2T.fx1, S2T.nx1, u), y = lerp(S2T.fy, S2T.ny, u), d = lerp(S2T.d0, S2T.d1, u);
  return { x, y, d, s: 0.44 * (y - 640) / 360 };
}
function scene2(ctx, t) {
  if (t < 4.8) s2Wide(ctx, t); else if (t < 6.2) s2Insert(ctx, t); else s2Medium(ctx, t);
}
function s2Room(ctx, t, cam, fl, dWall) {
  setCam(ctx, cam, dWall);
  const wg = ctx.createLinearGradient(0, 0, 0, 1100); wg.addColorStop(0, '#0c0810'); wg.addColorStop(1, '#1e1422');
  ctx.fillStyle = wg; ctx.fillRect(-600, -600, 2280, 2400);
  // tall narrow windows with rain
  for (const wx of [70, 860]) {
    const wp = archPath(wx, 170, 150, 760, 75);
    ctx.save(); ctx.clip(wp);
    drawNightSky(ctx, wx - 100, 100, 350, 900, fl, 0.7);
    drawSkyline(ctx, SKY.mid, t, wx - 300, 300, 0.42, fl, { rim: 0.3 });
    drawRain(ctx, t, { x: wx - 20, y: 150, w: 190, h: 800, n: 40, len: 30, speed: 1300, slant: -0.1, width: 1, color: '#9a8ac8', alpha: 0.35, seed: wx });
    drawGlassRain(ctx, t, wx, 170, 150, 760, { seed: wx, n: 6, scale: 0.8 });
    ctx.restore();
    drawWindowFrame(ctx, wx, 170, 150, 760, 75, { cols: 2, rows: 5, bar: 8, rays: 4, frame: 18, edgeA: 0.25 + fl * 0.6 });
  }
  for (const px of [-40, 250, 770, 1060]) drawPilaster(ctx, px, 120, 56, 900, '#1a1220');
  drawFrieze(ctx, -300, 80, 1700, 40, '#120c14', rgba(PAL.amb1, 0.4));
  drawSunburst(ctx, 540, 560, 300, '#221626', '#c89048', 32, 0.9);
  paintOverlay(ctx, -300, -100, 1700, 1300, 0.4);
}
function s2Table(ctx, cam, L, fl) {
  setScreen(ctx);
  const A = camPt(cam, S2T.fx0, S2T.fy, S2T.d0), B = camPt(cam, S2T.fx1, S2T.fy, S2T.d0), C = camPt(cam, S2T.nx1, S2T.ny, S2T.d1), D = camPt(cam, S2T.nx0, S2T.ny, S2T.d1);
  const g = ctx.createLinearGradient(0, A[1], 0, C[1]); g.addColorStop(0, '#2a120e'); g.addColorStop(1, '#120606');
  const P = pathOf([A, B, C, D]);
  ctx.fillStyle = g; ctx.fill(P);
  // chandelier reflection streak
  ctx.save(); ctx.clip(P);
  const mx = (A[0] + B[0]) / 2, nx = (C[0] + D[0]) / 2;
  const rg = ctx.createLinearGradient(0, A[1], 0, C[1]); rg.addColorStop(0, rgba('#ffcf7a', 0.35)); rg.addColorStop(0.5, rgba('#ffcf7a', 0.08)); rg.addColorStop(1, rgba('#ffcf7a', 0));
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg;
  ctx.fill(pathOf([[mx - 30, A[1]], [mx + 30, A[1]], [nx + 260, C[1]], [nx - 260, C[1]]]));
  ctx.restore();
  // inlay border
  const ins = (p, q, f) => [lerp(p[0], q[0], f), lerp(p[1], q[1], f)];
  ctx.strokeStyle = rgba(PAL.gold, 0.35); ctx.lineWidth = 2;
  ctx.beginPath(); const a2 = ins(A, C, 0.02), b2 = ins(B, D, 0.02); ctx.moveTo(a2[0] + 14, a2[1] + 4); ctx.lineTo(b2[0] - 14, b2[1] + 4); ctx.lineTo(ins(B, C, 1)[0] - 60, C[1]); ctx.moveTo(a2[0] + 14, a2[1] + 4); ctx.lineTo(ins(A, D, 1)[0] + 60, D[1]); ctx.stroke();
  ctx.fillStyle = rgba('#e8b86a', 0.4); ctx.fillRect(A[0], A[1] - 1, B[0] - A[0], 2.5);
  return P;
}
function s2Lieutenant(ctx, cam, t, fl, k, u, side, extra = {}) {
  const e = s2Edge(u, side), sit = extra.sit ?? 1, s = e.s * (extra.sk || 1);
  setCam(ctx, cam, e.d);
  const ox = (extra.ox ?? e.x + side * 230 * s), oy = extra.oy ?? e.y + 470 * s;
  const pass = (extra.o && extra.o.pass) || 'all';
  // chair back (outer side)
  if (sit > 0.2 && pass !== 'upper') {
    const cx = ox + side * 150 * s;
    ctx.fillStyle = '#0e080a'; ctx.fillRect(cx - 30 * s, oy - 1150 * s, 60 * s, 1150 * s);
    ctx.fillStyle = '#2a0c14'; ctx.fillRect(cx - 26 * s, oy - 1130 * s, 52 * s, 760 * s);
    ctx.fillStyle = rgba('#e8b86a', 0.4); ctx.fillRect(cx - 30 * s, oy - 1150 * s, 60 * s, 4);
  }
  const Lx = withL(S2.Lt, fl);
  const hx = extra.hand ? extra.hand : { x: 270, y: -478 };
  const o = Object.assign({ x: ox, y: oy, s, who: k, face: side < 0 ? 1 : -1, sit, seatH: 330, hand: hx, headTurn: 0.25, light: Lx, flash: fl * 0.3, t, head: { pitch: 0.05, glint: 0.4 } }, extra.o || {});
  drawSideFigure(ctx, o);
}
function s2Wide(ctx, t) {
  const cam = track(t, [[-0.6, { x: 452, y: 960, z: 1.0 }], [4.8, { x: 628, y: 948, z: 1.07 }, Ease.inOutSine]]);
  const fl = flashAt(t, [{ t: 2.7, peak: 0.45 }]);
  s2Room(ctx, t, cam, fl, 0.82);
  // floor strips
  setCam(ctx, cam, 0.85); ctx.fillStyle = '#0a0608'; ctx.fillRect(-600, 980, 2280, 1400);
  // chandelier + cone
  setCam(ctx, cam, 1.0);
  drawCone(ctx, 540, 380, 200, 1100, 1300, '#ffc060', 0.07);
  // boss (body), table, then hands on the table
  setCam(ctx, cam, 0.9);
  drawBossChair(ctx, 540, 590, 300, 1100, S2.Lb);
  const pull = prog(t, 3.6, 4.3, Ease.inOutCubic), look = prog(t, 1.8, 2.4) * (1 - prog(t, 3.4, 3.9)), down = prog(t, 3.7, 4.3);
  const bossO = { x: 540, y: 832, s: 0.44, light: S2.Lb, flash: fl * 0.3, t, breath: Math.sin(t * 1.4) * 0.5 + 0.5, head: { yaw: -0.3 * look + Math.sin(t * 0.4) * 0.03, pitch: 0.35 * down, gaze: [-0.6 * look, 0.7 * down], glint: 0.8, eyeOpen: lerp(1, 0.75, down) }, cigar: true };
  const bOut = {};
  drawBossSeatedFront(ctx, Object.assign({}, bossO, { out: bOut }));
  // lieutenants (legs + chairs first, so the table top covers what is beneath it)
  const rise = prog(t, 1.5, 2.25, Ease.inOutCubic), sitBack = prog(t, 3.95, 4.6, Ease.inOutCubic);
  const step = prog(t, 2.2, 2.85, Ease.inOutSine) * (1 - prog(t, 3.35, 3.95, Ease.inOutSine));
  const reach = prog(t, 2.8, 3.15, Ease.outCubic) * (1 - prog(t, 3.2, 3.55, Ease.inOutSine));
  const e1 = s2Edge(0.1, -1);
  const ox1 = e1.x - 230 * e1.s + step * 120, oy1 = e1.y + 470 * e1.s - step * 70;
  const sit1 = 1 - rise + sitBack * rise, s1k = 1 - step * 0.08;
  const tgt = { x: (476 - ox1) / (e1.s * s1k), y: (1020 - oy1) / (e1.s * s1k) };
  const handL1 = reach > 0 ? { x: lerp(200, tgt.x, reach), y: lerp(-700, tgt.y, reach) } : (sit1 > 0.9 ? { x: 270, y: -478 } : { x: 190, y: lerp(-478, -720, 1 - sit1) });
  const crew = [
    ['ltA', 0.1, -1, { sit: sit1, ox: ox1, oy: oy1, sk: s1k, hand: handL1, o: { walk: step > 0 && step < 1 ? 0.6 : 0, phase: t * 7, carry: t < 3.15 && rise > 0.3 ? 'folder' : null, headTurn: 0.15, head: { pitch: 0.1 + reach * 0.2, glint: 0.3 } } }],
    ['ltB', 0.1, 1, { o: { headTurn: 0.2 + 0.15 * prog(t, 2.0, 2.6), head: { pitch: 0.05, glint: 0.3 } } }],
    ['ltC', 0.23, -1, { o: { headTurn: 0.05, head: { pitch: 0.08 + Math.sin(t * 0.8) * 0.02 } } }],
    ['ltD', 0.23, 1, { o: { headTurn: 0.1, head: { pitch: 0.04 } } }],
  ];
  const withPass = (x, pass) => Object.assign({}, x, { o: Object.assign({}, x.o, { pass }) });
  for (const [k, u, sd, x] of crew) s2Lieutenant(ctx, cam, t, fl, k, u, sd, withPass(x, 'legs'));
  s2Table(ctx, cam, S2.Lb, fl);
  setCam(ctx, cam, 0.9);
  drawBossHandsOnly(ctx, bossO, { handR: { x: lerp(-96, -60, pull), y: lerp(400, 384, pull), rot: PI + 0.2, pose: 'rest' }, handL: { x: lerp(96, 60, pull), y: lerp(400, 384, pull), rot: PI - 0.2, pose: 'rest' } });
  // the folder: carried, then placed, then drawn in by the boss
  if (t >= 3.15) {
    setCam(ctx, cam, 0.92);
    const fx = lerp(470, 540, pull), fy = lerp(1024, 1006, pull);
    ctx.save(); ctx.translate(fx, fy); ctx.scale(1, 0.34); ctx.rotate(lerp(0.25, 0, pull));
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-74, -48, 160, 112);
    ctx.fillStyle = '#5a1a2a'; ctx.fillRect(-80, -56, 160, 112); ctx.strokeStyle = rgba(PAL.gold, 0.8); ctx.lineWidth = 3; ctx.strokeRect(-70, -46, 140, 92);
    ctx.fillStyle = PAL.gold; ctx.fillRect(62, -56, 18, 18); ctx.fillStyle = '#b01a24'; ctx.beginPath(); ctx.arc(40, 0, 13, 0, TAU); ctx.fill();
    ctx.restore();
    glow(ctx, fx, fy, 90, '#ffcf7a', 0.25);
  }
  for (const [k, u, sd, x] of crew) s2Lieutenant(ctx, cam, t, fl, k, u, sd, withPass(x, 'upper'));
  smokeFrom(ctx, t, bOut, { k: 1, alpha: 0.35, height: 380 });
  setCam(ctx, cam, 1.0);
  drawChandelier(ctx, 540, 150, 0.62, t);
  setScreen(ctx); drawHaze(ctx, t, 0, 200, W, 1400, '#7a6050', 0.07, 6, 7);
  setCam(ctx, cam, 1.0); drawDust(ctx, t, 300, 300, 480, 900, 50, '#ffe0b0', 0.3, 3, 1.2);
}
/** boss forearms + hands only (used where a table must sit between body and hands) */
function drawBossHandsOnly(ctx, base, hands) {
  const L = base.light, F = OUTFIT.boss;
  ctx.save(); ctx.translate(base.x, base.y); ctx.scale(base.s, base.s);
  for (const [k, s] of [['R', -1], ['L', 1]]) { const h = hands['hand' + k]; if (!h) continue; const el = hands['elbow' + k] || [s * 226, 420]; drawForearm(ctx, el[0], el[1], h.x, h.y, 50, 40, F.suit, F.cuff, L, base.flash || 0); }
  for (const [k] of [['R'], ['L']]) { const h = hands['hand' + k]; if (!h) continue; drawHand(ctx, { x: h.x, y: h.y, rot: h.rot ?? PI, s: h.s || 1, side: k === 'R' ? 1 : -1, pose: h.pose || 'rest', light: L, flash: base.flash || 0, ring: k === 'R', glint: h.glint || 0, det: h.det || 0, gemK: h.gemK }); }
  ctx.restore();
}
function s2Insert(ctx, t) {
  const lt = t - 4.8;
  const cam = { x: 540 + lt * 6, y: 980 - lt * 10, z: 1.0 + lt * 0.05, r: -0.03 + lt * 0.01 };
  const L = mkLight({ dir: [-0.3, -0.6, 0.75], key: '#ffc070', keyAmt: 0.42, mul: '#4a2a40', rim: '#ffd890', rimDir: [-0.3, -1], rimW: 3, rimA: 0.5 });
  setCam(ctx, cam, 1);
  const tg = ctx.createRadialGradient(540, 900, 50, 540, 960, 1100); tg.addColorStop(0, '#4a2216'); tg.addColorStop(1, '#0a0405');
  ctx.fillStyle = tg; ctx.fillRect(-400, -400, 1880, 2800);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;
  for (let y = -400; y < 2400; y += 90) { ctx.beginPath(); ctx.moveTo(-400, y + Math.sin(y) * 10); ctx.lineTo(1500, y + 30); ctx.stroke(); }
  paintOverlay(ctx, -200, -200, 1480, 2400, 0.35);
  const open = prog(t, 4.86, 5.5, Ease.inOutCubic);
  drawFolderTop(ctx, 540, 1000, 720, 520, 0.03, open, L, t);
  // hands (boss across the table, fingers toward camera-bottom)
  const slide = prog(t, 5.55, 5.95, Ease.inOutSine);
  drawForearm(ctx, -120, 240, 170, 560, 74, 60, OUTFIT.boss.suit, OUTFIT.boss.cuff, L, 0);
  drawHand(ctx, { x: 200, y: 600 + slide * 60, rot: PI - 0.35 + slide * 0.1, s: 1.55, side: 1, pose: mixPose(HAND_POSE.rest, HAND_POSE.two, slide), light: L, ring: true, glint: pulse(t, 5.7, 6.15, 0.15) });
  drawForearm(ctx, 1240, 260, 940, 620, 74, 60, OUTFIT.boss.suit, OUTFIT.boss.cuff, L, 0);
  drawHand(ctx, { x: 900, y: 660, rot: PI + 0.5, s: 1.55, side: -1, pose: 'flat', light: L });
  setScreen(ctx);
  glow(ctx, 520, 760, 700, '#ffb050', 0.14);
}
function s2Medium(ctx, t) {
  const push = prog(t, 7.15, 9.1, Ease.inOutSine);
  const cam = { x: 540, y: lerp(990, 846, push), z: lerp(1.0, 2.3, push) };
  const fl = flashAt(t, [{ t: 8.3, peak: 0.25 }]);
  s2RoomMedium(ctx, t, cam, fl);
  const up = prog(t, 6.15, 6.65, Ease.inOutSine);
  const raise = prog(t, 6.8, 7.25, Ease.outCubic) * (1 - prog(t, 7.75, 8.25, Ease.inOutSine));
  const flick = pulse(t, 7.28, 7.6, 0.12);
  const bossO = { x: 540, y: 1000, s: 0.95, light: withL(S2.Lb, fl), flash: fl * 0.3, t, breath: Math.sin(t * 1.4) * 0.5 + 0.5, cigar: true,
    head: { pitch: lerp(0.32, -0.02, up), yaw: 0.04 * Math.sin(t * 0.5) - 0.06 * raise, gaze: [-0.1 * raise, lerp(0.8, 0, up)], eyeOpen: lerp(0.7, 1, up), squint: 0.2 + 0.25 * push, glint: lerp(0.4, 1, up), frown: 0.1 * raise } };
  const out = {};
  setCam(ctx, cam, 1);
  drawBossSeatedFront(ctx, Object.assign({ out }, bossO));
  // table edge in front
  setCam(ctx, cam, 1.05);
  const tg = ctx.createLinearGradient(0, 1370, 0, 2100); tg.addColorStop(0, '#2c120e'); tg.addColorStop(1, '#0c0404');
  ctx.fillStyle = tg; ctx.fillRect(-300, 1372, 1680, 900);
  ctx.fillStyle = rgba('#e8b86a', 0.45); ctx.fillRect(-300, 1370, 1680, 3);
  glow(ctx, 540, 1450, 380, '#ffc070', 0.22, 'lighter', 0.2);
  // folder on table
  ctx.save(); ctx.translate(540, 1440); ctx.scale(1, 0.34);
  ctx.fillStyle = '#e3d5b2'; ctx.fillRect(-150, -110, 300, 220); ctx.fillStyle = '#4c1624'; ctx.fillRect(-310, -110, 160, 220);
  ctx.restore();
  setCam(ctx, cam, 1);
  const hx = lerp(-90, -150, raise), hy = lerp(404, 210, raise);
  drawBossHandsOnly(ctx, bossO, { handR: { x: hx, y: hy, rot: lerp(PI + 0.3, -0.55 - flick * 0.65, raise), fs: lerp(0.65, 1, raise), pose: raise > 0.3 ? 'two' : 'rest', glint: raise * 0.4 }, handL: { x: 92, y: 400, rot: PI - 0.3, fs: 0.65, pose: 'flat' }, elbowR: [-230, lerp(400, 380, raise)], elbowL: [230, 400] });
  smokeFrom(ctx, t, out, { k: 1, alpha: 0.4, height: 480 });
  // foreground lieutenants' shoulders (depth 1.35)
  setCam(ctx, cam, 1.35);
  const nod = pulse(t, 7.7, 8.4, 0.25);
  drawSideFigure(ctx, { x: 60, y: 2560, s: 1.3, who: 'ltA', face: 1, sit: 1, hand: { x: 300, y: -470 }, headTurn: 0.05, light: S2.Lfg, t, head: { pitch: 0.05 } });
  drawSideFigure(ctx, { x: 1020, y: 2560, s: 1.3, who: 'ltB', face: -1, sit: 1, hand: { x: 300, y: -470 }, headTurn: 0.05, light: S2.Lfg, t, head: { pitch: 0.05 + nod * 0.3 } });
  if (useRef()) { const a = prog(t, 8.3, 8.75); if (a > 0) { setScreen(ctx); withAlpha(ctx, a, () => { ctx.fillStyle = '#07050a'; ctx.fillRect(0, 0, W, H); drawRefPortrait(ctx, 540, 860 + (1 - push) * 40, 860 * (0.9 + push * 0.12), { keySide: 1 }); }); } }
  setScreen(ctx); drawHaze(ctx, t, 0, 0, W, H, '#7a6050', 0.06, 5, 9);
}
function s2RoomMedium(ctx, t, cam, fl) {
  setCam(ctx, cam, 0.75);
  ctx.fillStyle = '#0d0910'; ctx.fillRect(-800, -800, 2700, 3600);
  drawSunburst(ctx, 540, 820, 470, '#211526', '#c89048', 36, 0.9);
  for (const px of [40, 980]) drawPilaster(ctx, px, 200, 70, 1300, '#1a1220');
  paintOverlay(ctx, -200, 0, 1480, 1800, 0.4);
  setCam(ctx, cam, 0.92);
  drawBossChair(ctx, 540, 520, 560, 1500, S2.Lb);
  setCam(ctx, cam, 1);
  glow(ctx, 540, 300, 600, '#ffc070', 0.16);
}

/* =====================================================================
   SCENE 3 · 16–25 s · CONTROLLING THE MONEY
   ===================================================================== */
const S3 = {
  Ld: mkLight({ dir: [0.55, -0.7, 0.45], key: '#ffbe5a', keyAmt: 0.5, mul: '#4a2a3a', rim: '#ffd890', rimDir: [0.5, -0.9], rimW: 3, rimA: 0.55 }),
  Lb: mkLight({ dir: [-0.88, 0.22, 0.42], key: '#ffb24e', keyAmt: 0.55, mul: '#3a1e34', rim: '#7a6ab8', rimDir: [1, -0.4], rimW: 4, rimA: 0.6 }),
  La: mkLight({ dir: [-0.7, 0.1, 0.5], key: '#ffb24e', keyAmt: 0.22, mul: '#2e1a30', rim: '#8a7ac8', rimDir: [1, -0.5], rimW: 4, rimA: 0.6 }),
};
function scene3(ctx, t) { if (t < 4.2) s3Ledger(ctx, t); else s3Pan(ctx, t); }
function s3Ledger(ctx, t) {
  const ringW = { x: 708, y: 905 };
  const cam = track(t, [[-0.6, { x: 560, y: 1000, z: 1.0 }], [0.6, { x: 590, y: 960, z: 1.12 }], [2.3, { x: ringW.x, y: ringW.y + 30, z: 3.3 }, Ease.inOutCubic], [2.9, { x: ringW.x - 6, y: ringW.y + 26, z: 3.4 }], [3.6, { x: 560, y: 960, z: 1.3 }, Ease.inOutCubic], [4.3, { x: 545, y: 960, z: 1.34 }]]);
  const L = S3.Ld;
  setCam(ctx, cam, 1);
  // desk surface lit by the lamp (top-right)
  const dg = ctx.createRadialGradient(640, 780, 40, 600, 900, 1200); dg.addColorStop(0, '#5a2a18'); dg.addColorStop(0.45, '#2e140c'); dg.addColorStop(1, '#070304');
  ctx.fillStyle = dg; ctx.fillRect(-500, -500, 2080, 2900);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2;
  for (let y = -500; y < 2400; y += 70) { ctx.beginPath(); ctx.moveTo(-500, y); ctx.bezierCurveTo(200, y + 20, 700, y - 25, 1600, y + 10); ctx.stroke(); }
  paintOverlay(ctx, -300, -300, 1680, 2600, 0.4);
  // props around the ledger
  drawCash(ctx, 210, 420, 240, 120, -0.2, 7, L); drawCash(ctx, 330, 270, 240, 120, 0.15, 5, L); drawCash(ctx, 150, 640, 240, 120, 0.05, 4, L);
  drawEnvelope(ctx, 900, 380, 260, 150, 0.25, L, true); drawEnvelope(ctx, 930, 480, 260, 150, -0.1, L, false);
  ctx.fillStyle = mixc(PAL.gold, L.key, 0.3);
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(880 + hash(i) * 120, 1280 + hash(i + 9) * 100, 18, 16, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(80,50,10,0.6)'; ctx.stroke(); }
  // fountain pen
  ctx.save(); ctx.translate(860, 1480); ctx.rotate(-0.6); ctx.fillStyle = '#0c0a0c'; ctx.fillRect(-150, -9, 300, 18); ctx.fillStyle = PAL.gold; ctx.fillRect(60, -9, 10, 18); ctx.fillRect(150, -4, 30, 8); ctx.restore();
  drawAshtray(ctx, 210, 1520, 1.2, L);
  const cOut = {};
  drawRestingCigar(ctx, 160, 1505, -0.35, 190, 1.2, t, L, cOut);
  // ledger + turning page
  const turn = prog(t, 3.0, 4.0, Ease.inOutSine);
  drawLedgerTop(ctx, 540, 940, 780, 540, -0.04, turn, L);
  // hands: left steadies the book, right (ring) traces then turns the page
  drawForearm(ctx, 120, 2300, 340, 1160, 64, 50, OUTFIT.boss.suit, OUTFIT.boss.cuff, L, 0);
  drawHand(ctx, { x: 340, y: 1160, rot: 0.2, s: 1.6, side: -1, pose: 'rest', light: L, det: 1 });
  const trace = prog(t, 0.0, 2.0, Ease.inOutSine);
  const hx = turn > 0 ? lerp(760, 340, Ease.inOutSine(turn)) : ringW.x + 10, hy = turn > 0 ? 1020 - Math.sin(turn * PI) * 90 : lerp(1030, 1080, trace);
  drawForearm(ctx, 980, 2300, hx, hy, 64, 50, OUTFIT.boss.suit, OUTFIT.boss.cuff, L, 0);
  const glint = pulse(t, 1.9, 2.75, 0.25);
  drawHand(ctx, { x: hx, y: hy, rot: -0.12 + turn * 0.3, s: 1.6 * (1 + Math.sin(turn * PI) * 0.12), side: 1, pose: turn > 0 ? 'hold' : 'rest', light: L, ring: true, glint, det: 1 });
  // moving ceiling-fan shadow
  drawFanShadow(ctx, -200, 300, 1400, t * 0.9, 0.22, 0.8);
  smokeFrom(ctx, t, cOut, { k: 1, alpha: 0.35, height: 600, wind: 0.6 });
  setScreen(ctx);
  glow(ctx, 900, 200, 900, '#ffb04a', 0.12);
}
function s3Pan(ctx, t) {
  const p = prog(t, 4.3, 8.3, Ease.inOutSine);
  const cam = { x: lerp(560, 520, p), y: lerp(1290, 640, p), z: lerp(1.75, 1.55, p) - Math.sin(p * PI) * 0.25 };
  const fl = 0;
  // ---- back wall with venetian-blind light & fan shadow (depth .85)
  setCam(ctx, cam, 0.85);
  const wg = ctx.createLinearGradient(0, 0, 0, 1600); wg.addColorStop(0, '#120c12'); wg.addColorStop(1, '#22161c');
  ctx.fillStyle = wg; ctx.fillRect(-600, -600, 2280, 3200);
  drawBlinds(ctx, -300, 120, 1100, 900, 12, 160, '#e0a860', 0.09);
  drawFanShadow(ctx, 760, 300, 700, t * 0.9, 0.35, 0.7);
  for (const px of [-120, 1000]) drawPilaster(ctx, px, 60, 70, 1500, '#1c1418');
  paintOverlay(ctx, -300, -200, 1700, 2000, 0.45);
  // ---- accountant (depth .9)
  setCam(ctx, cam, 0.9);
  const fid = Math.sin(t * 2.2) * 6;
  const look = prog(t, 6.9, 7.6);
  drawStandingFront(ctx, { x: 868 + fid, y: 1540, s: 0.5, who: 'accountant', arms: 'hat', hatSpin: t * 2.6, light: S3.La, t,
    head: { yaw: -0.35 + Math.sin(t * 3.1) * 0.05, pitch: 0.08 + 0.1 * look, gaze: [Math.sin(t * 4.3) > 0.2 ? -0.7 : 0.3, 0.1], glint: 0.7, sweat: true, sweatT: (t * 0.35) % 1, lensGlint: pulse(t, 5.2, 5.9, 0.2) } });
  // ---- boss + desk (depth 1)
  setCam(ctx, cam, 1);
  drawBossChair(ctx, 500, 360, 470, 1200, S3.Lb);
  const lookUp = prog(t, 6.6, 7.6, Ease.inOutCubic);
  const out = {};
  const bossO = { x: 500, y: 742, s: 0.9, light: S3.Lb, t, breath: Math.sin(t * 1.3) * 0.5 + 0.5, cigar: false, out,
    head: { pitch: lerp(0.38, 0.02, lookUp), yaw: lerp(-0.08, 0.3, lookUp), gaze: [lerp(0, 0.85, lookUp), lerp(0.85, 0.05, lookUp)], eyeOpen: lerp(0.62, 0.95, lookUp), squint: 0.3 * lookUp, glint: lerp(0.3, 1, lookUp), frown: 0.15 * lookUp } };
  drawBossSeatedFront(ctx, bossO);
  // desk top in perspective with the ledger
  const tg = ctx.createLinearGradient(0, 1080, 0, 1420); tg.addColorStop(0, '#24100c'); tg.addColorStop(1, '#3a1a10');
  ctx.fillStyle = tg; ctx.fill(pathOf([[60, 1080], [940, 1080], [1080, 1420], [-80, 1420]]));
  ctx.save(); ctx.translate(500, 1250); ctx.scale(1, 0.42); drawLedgerTop(ctx, 0, 0, 640, 440, 0.02, 0, S3.Ld); ctx.restore();
  ctx.save(); ctx.translate(860, 1180); ctx.scale(1, 0.42); drawCash(ctx, 0, 0, 200, 100, 0.2, 5, S3.Ld); drawEnvelope(ctx, -40, 160, 200, 110, -0.2, S3.Ld, true); ctx.restore();
  drawBossHandsOnly(ctx, bossO, { handR: { x: -130, y: 560, rot: PI + 0.2, fs: 0.6, pose: 'rest', glint: pulse(t, 5.0, 5.8, 0.3) * 0.6 }, handL: { x: 130, y: 566, rot: PI - 0.25, fs: 0.6, pose: 'flat' }, elbowR: [-236, 520], elbowL: [236, 520] });
  setCam(ctx, cam, 1.04);
  drawDeskFront(ctx, -120, 1420, 1320, 900, S3.Lb, { th: 30 });
  const lp = drawDecoLamp(ctx, 140, 1150, 0.95, S3.Lb, t);
  // lamp light pool & ambient
  setScreen(ctx);
  glow(ctx, lp.x, lp.y, 700 * cam.z, '#ff9a3a', 0.16);
  setCam(ctx, cam, 1); drawDust(ctx, t, 100, 700, 600, 600, 40, '#ffd890', 0.35, 5, 1);
  setScreen(ctx); drawHaze(ctx, t, 0, 0, W, H, '#6a4a3a', 0.06, 5, 13);
}

/* =====================================================================
   SCENE 4 · 25–34 s · MANAGING DISPUTES — the restaurant after closing
   ===================================================================== */
const S4 = {
  Lb: mkLight({ dir: [0.35, -0.8, 0.45], key: '#ffbe62', keyAmt: 0.42, mul: '#45263e', rim: '#a99aee', rimDir: [-0.9, -0.5], rimW: 5, rimA: 0.9 }),
  Lr: mkLight({ dir: [-0.3, -0.5, 0.78], key: '#d8d098', keyAmt: 0.3, mul: '#3a3430', rim: '#e8c070', rimDir: [0.6, -0.8], rimW: 3, rimA: 0.55 }),
  Lg: mkLight({ dir: [0.25, -0.45, 0.65], key: '#ffbe62', keyAmt: 0.06, mul: '#2a1a2c', rim: '#a99aee', rimDir: [-0.8, -0.6], rimW: 4, rimA: 0.7 }),
  Lcu: mkLight({ dir: [0.82, -0.4, 0.4], key: '#ffb558', keyAmt: 0.5, mul: '#3e2038', rim: '#a99aee', rimDir: [-1, -0.3], rimW: 5, rimA: 0.9 }),
  Lrcu: mkLight({ dir: [-0.35, -0.6, 0.7], key: '#e8e0b0', keyAmt: 0.32, mul: '#3a3632', rim: '#c0b0ff', rimDir: [-0.7, -0.7], rimW: 3, rimA: 0.5 }),
};
function scene4(ctx, t) {
  if (t < 2.6) s4Two(ctx, t);
  else if (t < 4.4) s4Rival(ctx, t);
  else if (t < 6.8) s4Ots(ctx, t);
  else s4BossCU(ctx, t);
}
function s4Background(ctx, t, cam, fl, d = 0.75) {
  setCam(ctx, cam, d);
  const wg = ctx.createLinearGradient(0, 0, 0, 1400); wg.addColorStop(0, '#0b0710'); wg.addColorStop(1, '#1a1018');
  ctx.fillStyle = wg; ctx.fillRect(-700, -700, 2480, 3300);
  for (const wx of [-60, 400, 860]) {
    const wp = archPath(wx, 200, 280, 900, 140);
    ctx.save(); ctx.clip(wp);
    drawNightSky(ctx, wx - 100, 100, 500, 1100, fl, 0.7);
    drawSkyline(ctx, SKY.far, t, wx - 500, 560, 0.5, fl, { rim: 0.2 });
    drawRain(ctx, t, { x: wx - 20, y: 150, w: 320, h: 1000, n: 60, len: 30, speed: 1300, slant: -0.1, width: 1.2, color: '#9a8ac8', alpha: 0.35, seed: wx + 3 });
    drawGlassRain(ctx, t, wx, 200, 280, 900, { seed: wx + 7, n: 8, scale: 0.8 });
    ctx.restore();
    drawWindowFrame(ctx, wx, 200, 280, 900, 140, { cols: 3, rows: 5, bar: 8, rays: 6, frame: 20, edgeA: 0.25 + fl * 0.6 });
  }
  for (const sx of [340, 800]) drawSconce(ctx, sx, 560, 0.55, 0.8);
  drawFrieze(ctx, -400, 110, 1900, 36, '#120c14', rgba(PAL.amb1, 0.4));
  paintOverlay(ctx, -300, -100, 1700, 1500, 0.4);
}
function s4Two(ctx, t) {
  const cam = { x: lerp(548, 574, prog(t, -0.6, 2.6)), y: 1185, z: lerp(1.3, 1.42, prog(t, -0.6, 2.6, Ease.linear)) };
  const fl = flashAt(t, [{ t: 1.3, peak: 0.3 }]);
  s4Background(ctx, t, cam, fl, 0.75);
  // closed tables & palms (depth .85)
  setCam(ctx, cam, 0.85);
  drawClosedTable(ctx, 130, 1180, 0.8, '#0a0609', '#ffbe62', 0.35); drawClosedTable(ctx, 960, 1170, 0.75, '#0a0609', '#ffbe62', 0.35);
  drawPalm(ctx, 760, 1260, 0.75, '#08050a', t); drawPalm(ctx, -40, 1290, 0.85, '#08050a', t);
  drawCheckerFloor(ctx, cam, { vx: 540, yFar: 1260, yNear: 2100, xw0: 1800, xw1: 4200, rows: 9, cols: 14, ca: '#120c10', cb: '#2a2026', dFar: 0.85, dNear: 1.2 });
  // bodyguards behind the boss (depth .88)
  setCam(ctx, cam, 0.88);
  drawStandingFront(ctx, { x: 190, y: 1560, s: 0.46, who: 'guard', arms: 'clasped', light: S4.Lg, t, head: { yaw: 0.25, glint: 0 } });
  drawStandingFront(ctx, { x: 420, y: 1540, s: 0.45, who: 'guard', arms: 'clasped', light: S4.Lg, t, head: { yaw: 0.3, glint: 0 } });
  // pendant + cone
  setCam(ctx, cam, 0.95);
  drawCone(ctx, 560, 610, 260, 900, 1000, '#ffc060', 0.09);
  drawPendant(ctx, 560, 500, 0.62, t);
  // table + two seated men
  setCam(ctx, cam, 1);
  const bossF = { x: 320, y: 1700, s: 0.62, who: 'boss', face: 1, sit: 1, seatH: 330, hand: { x: 300, y: -500 }, headTurn: 0.62, lean: -0.06, light: withL(S4.Lb, fl), flash: fl * 0.3, t, cigar: false, head: { pitch: -0.04, glint: 0.9, squint: 0.2 } };
  const fidget = Math.sin(t * 5) * 0.5 + 0.5;
  const rivF = { x: 820, y: 1710, s: 0.58, who: 'rival', face: -1, sit: 1, seatH: 330, hand: { x: 270 + fidget * 10, y: -470 }, headTurn: 0.55, lean: 0.24, light: S4.Lr, t, head: { pitch: 0.22, glint: 0.6, gaze: [Math.sin(t * 3) > 0 ? -0.5 : 0.2, -0.4], sweat: true, sweatT: (t * 0.4) % 1 } };
  drawSideFigure(ctx, Object.assign({ pass: 'legs' }, bossF)); drawSideFigure(ctx, Object.assign({ pass: 'legs' }, rivF));
  s4Table(ctx, t, 0);
  drawSideFigure(ctx, Object.assign({ pass: 'upper' }, bossF)); drawSideFigure(ctx, Object.assign({ pass: 'upper' }, rivF));
  const cOut = {}; s4TableProps(ctx, t, cOut, S4.Lb, 0);
  smokeFrom(ctx, t, cOut, { k: 0.9, alpha: 0.4, height: 560 });
  setScreen(ctx); drawHaze(ctx, t, 0, 300, W, 1300, '#7a6070', 0.07, 6, 21);
  setCam(ctx, cam, 0.95); drawDust(ctx, t, 300, 700, 480, 700, 40, '#ffe0b0', 0.3, 7, 1);
}
function s4Table(ctx, t, ripple) {
  const cloth = mixc('#e2d6bc', '#ffbe62', 0.25);
  ctx.fillStyle = mixc(cloth, '#3a2a30', 0.55);
  ctx.fill(pathOf([[250, 1335], [870, 1335], [900, 1640], [220, 1640]]));
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(40,20,40,0.12)';
  for (let i = 0; i < 7; i++) ctx.fillRect(272 + i * 90, 1340, 34, 300);
  ctx.restore();
  ctx.fillStyle = cloth; ctx.beginPath(); ctx.ellipse(560, 1335, 320, 70, 0, 0, TAU); ctx.fill();
  glow(ctx, 560, 1325, 320, '#ffe0a0', 0.35, 'lighter', 0.22);
}
function s4TableProps(ctx, t, out, L, ripple) {
  drawCoffeeCup(ctx, 430, 1330, 0.55, L, 0);
  drawCoffeeCup(ctx, 700, 1325, 0.55, L, ripple);
  drawAshtray(ctx, 565, 1350, 0.55, L);
  drawRestingCigar(ctx, 540, 1342, -0.25, 120, 0.6, t, L, out);
}
function s4Rival(ctx, t) {
  const lt = t - 2.6;
  const cam = { x: 540 + Math.sin(lt * 1.7) * 6, y: 920 + Math.sin(lt * 1.3) * 4, z: 1.0 + lt * 0.04 };
  setCam(ctx, cam, 0.6);
  ctx.fillStyle = '#0a070b'; ctx.fillRect(-900, -900, 2880, 3700);
  bokeh(ctx, t, 14, 300, ['#ffb050', '#e08a40', '#8a70d0'], 0.25, -200, 0, 1480, 1200);
  setCam(ctx, cam, 1);
  const sw = (lt / 1.8);
  const gz = [Math.sin(lt * 9) > 0.3 ? -0.8 : (Math.sin(lt * 9) < -0.5 ? 0.7 : 0), -0.55];
  const gulp = pulse(lt, 0.9, 1.4, 0.2);
  drawBust(ctx, { x: 540, y: 1270 + gulp * 6, s: 2.15, who: 'rival', light: S4.Lrcu, t,
    head: { pitch: 0.22, yaw: -0.18 + Math.sin(lt * 2) * 0.03, gaze: gz, eyeOpen: 1.12, glint: 1, sweat: true, sweatT: clamp(sw), frown: -0.2, mouthOpen: gulp * 0.6 } });
  // finger tugging the collar
  const tug = Math.sin(lt * 6) * 0.5 + 0.5;
  drawForearm(ctx, 1150, 1950, 800, 1450 + tug * 10, 110, 90, OUTFIT.rival.suit, OUTFIT.rival.cuff, S4.Lrcu, 0);
  drawHand(ctx, { x: 780, y: 1430 + tug * 14, rot: -0.9 - tug * 0.1, s: 2.1, side: -1, pose: 'hold', light: S4.Lrcu, skin: HEAD.rival.skin });
  setScreen(ctx); drawHaze(ctx, t, 0, 0, W, H, '#8a8a7a', 0.05, 4, 31);
}
/** generic bust (shoulders + collar + head) for close-ups. origin = neck base */
function drawBust(ctx, o) {
  const F = OUTFIT[o.who], HP = HEAD[o.who], L = o.light, back = o.view === 'back';
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s, o.s);
  const torso = pathOf([[-60, -16], [-140, 0], [-230, 26], [-290, 90], [-310, 400], [310, 400], [290, 90], [230, 26], [140, 0], [60, -16]]);
  bodyPart(ctx, torso, F.suit, L, { flash: o.flash || 0, rimK: 2.4 });
  if (F.stripe) { ctx.save(); ctx.clip(torso); ctx.strokeStyle = rgba(F.stripe, 0.4); ctx.lineWidth = 1.5; for (let x = -300; x <= 300; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x * 1.05, 400); ctx.stroke(); } ctx.restore(); }
  const hd = Object.assign({ x: 0, y: -170, s: 1, light: L, flash: o.flash || 0, t: o.t }, o.head || {});
  if (!back) {
    fillPts(ctx, [[-48, -16], [48, -16], [24, 260], [0, 300], [-24, 260]], mixc(F.shirt, L.key, L.keyAmt * 0.4));
    fillPts(ctx, [[-13, -6], [13, -6], [16, 40], [10, 280], [-10, 280], [-16, 40]], mixc(F.tie, L.key, 0.2));
    for (const s of [-1, 1]) { const lp = pathOf([[s * 46, -16], [s * 68, -20], [s * 108, 62], [s * 164, 82], [s * 130, 116], [s * 24, 330], [s * 22, 250]]); bodyPart(ctx, lp, F.lapel, L, { rimK: 1 }); }
    drawNeck(ctx, HP, hd, L);
    fillPts(ctx, [[-14, -8], [14, -8], [11, 22], [-11, 22]], mixc(F.tie, L.key, 0.2));
    for (const s of [-1, 1]) fillPts(ctx, [[s * 52, -30], [s * 6, -2], [s * 36, 46]], mixc(F.shirt, L.key, L.keyAmt * 0.4));
  } else {
    drawNeck(ctx, HP, hd, L);
    bodyPart(ctx, pathOf([[-80, -36], [80, -36], [92, 20], [-92, 20]]), F.lapel, L, { rimK: 1 });
  }
  drawHead(ctx, HP, Object.assign(hd, { out: o.out }));
  ctx.restore();
}
function s4Ots(ctx, t) {
  const lt = t - 4.4;
  const cam = { x: 540, y: lerp(1000, 960, lt / 2.4), z: lerp(1.0, 1.08, lt / 2.4) };
  const fl = flashAt(t, [{ t: 5.9, peak: 0.25 }]);
  s4Background(ctx, t, cam, fl, 0.72);
  setCam(ctx, cam, 0.85);
  drawStandingFront(ctx, { x: 200, y: 1900, s: 0.62, who: 'guard', arms: 'clasped', light: S4.Lg, t, head: { yaw: 0.1, glint: 0 } });
  drawStandingFront(ctx, { x: 880, y: 1900, s: 0.62, who: 'guard', arms: 'clasped', light: S4.Lg, t, head: { yaw: -0.12, glint: 0 } });
  setCam(ctx, cam, 0.95); drawPendant(ctx, 540, 120, 0.75, t); drawCone(ctx, 540, 230, 300, 1300, 1400, '#ffc060', 0.08);
  setCam(ctx, cam, 1);
  const place = prog(lt, 0.55, 1.4, Ease.outCubic);
  const out = {};
  const bossO = { x: 545, y: 980, s: 0.8, light: withL(S4.Lb, fl), flash: fl * 0.3, t, breath: Math.sin(t * 1.2) * 0.5 + 0.5, cigar: false, out,
    head: { pitch: -0.08, yaw: -0.06, gaze: [0.15, 0], glint: 1, squint: 0.25 + 0.1 * place, frown: 0.1 } };
  drawBossSeatedFront(ctx, bossO);
  // tablecloth (near edge foreground)
  const cloth = mixc('#e2d6bc', '#ffbe62', 0.25);
  ctx.fillStyle = cloth; ctx.beginPath(); ctx.ellipse(540, 1560, 760, 260, 0, PI, TAU); ctx.lineTo(1400, 2200); ctx.lineTo(-300, 2200); ctx.closePath(); ctx.fill();
  glow(ctx, 540, 1460, 600, '#ffe0a0', 0.25, 'lighter', 0.4);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; const cg = ctx.createLinearGradient(0, 1300, 0, 2000); cg.addColorStop(0, 'rgba(255,255,255,0)'); cg.addColorStop(1, 'rgba(60,40,60,0.9)'); ctx.fillStyle = cg; ctx.fillRect(-300, 1300, 1700, 800); ctx.restore();
  const hy = lerp(330, 425, place), hr = lerp(PI + 0.55, PI + 0.12, place);
  drawBossHandsOnly(ctx, bossO, { handR: { x: lerp(-120, -150, place), y: hy, rot: hr, fs: lerp(0.9, 0.62, place), pose: mixPose(HAND_POSE.rest, HAND_POSE.flat, place), glint: pulse(lt, 1.35, 2.0, 0.2) }, handL: { x: 110, y: 412, rot: PI - 0.25, fs: 0.62, pose: 'rest' } });
  const ripple = clamp((lt - 1.38) / 1.2);
  drawCoffeeCup(ctx, 830, 1490, 1.0, S4.Lb, lt > 1.38 ? ripple : 0);
  drawAshtray(ctx, 290, 1470, 0.9, S4.Lb);
  const cOut = {}; drawRestingCigar(ctx, 250, 1455, -0.2, 160, 0.9, t, S4.Lb, cOut);
  smokeFrom(ctx, t, cOut, { k: 1, alpha: 0.38, height: 700 });
  // the rival seen from behind, foreground right (depth 1.35)
  setCam(ctx, cam, 1.35);
  drawBust(ctx, { x: 980, y: 1720, s: 1.9, who: 'rival', view: 'back', light: S4.Lg, t, head: { yaw: PI - 0.35, pitch: 0.18, glint: 0 } });
  setScreen(ctx); drawHaze(ctx, t, 0, 0, W, H, '#7a6070', 0.06, 5, 41);
}
function s4BossCU(ctx, t) {
  const lt = t - 6.8;
  const cam = { x: 540, y: lerp(900, 860, lt / 2.4), z: lerp(1.0, 1.14, prog(lt, 0, 2.4, Ease.linear)) };
  setCam(ctx, cam, 0.6);
  ctx.fillStyle = '#08060a'; ctx.fillRect(-900, -900, 2880, 3700);
  bokeh(ctx, t, 12, 500, ['#ffb050', '#8a70d0', '#e07040'], 0.22, -100, -100, 1300, 1400);
  setCam(ctx, cam, 1);
  const out = {};
  if (!(useRef() && drawRefPortrait(ctx, 540, 930, 900, { keySide: 1 }))) {
    drawBossSeatedFront(ctx, { x: 520, y: 1480, s: 2.3, light: S4.Lcu, t, cigar: false, out, breath: Math.sin(t * 1.2) * 0.5 + 0.5,
      head: { pitch: -0.12, yaw: 0.2, gaze: [-0.2, -0.05], glint: 1, squint: 0.2 + 0.25 * prog(lt, 1.1, 1.7), frown: 0.15, socket: 0.1 } });
  }
  // smoke from the table cigar drifting across the face
  setScreen(ctx);
  drawSmoke(ctx, t, 760, 2100, 2.4, { alpha: 0.3, height: 900, wind: -0.5, seed: 3 });
}

/* =====================================================================
   SCENE 5 · 34–44 s · LOYALTY AND AUTHORITY
   ===================================================================== */
const S5 = {
  Lb: mkLight({ dir: [-0.8, -0.2, -0.45], key: '#b8a8ff', keyAmt: 0.22, mul: '#1c1228', rim: '#c4b6ff', rimDir: [-1, -0.2], rimW: 5, rimA: 0.95 }),
  Ll: mkLight({ dir: [0.7, -0.2, 0.4], key: '#ffb860', keyAmt: 0.3, mul: '#2e1a2a', rim: '#ffcf80', rimDir: [1, -0.3], rimW: 4, rimA: 0.75 }),
  Lcu: mkLight({ dir: [-0.85, -0.25, 0.45], key: '#a898ec', keyAmt: 0.38, mul: '#2e1c3c', rim: '#ffbe6a', rimDir: [1, -0.25], rimW: 5, rimA: 0.85 }),
};
// simple silhouette of the standing boss (for the long cast shadow)
function bossShadowPath() {
  return pathOf([[-110, 0], [-60, -860], [-180, -900], [-240, -1500], [-120, -1580], [-60, -1600], [-70, -1700], [-60, -1820], [0, -1880], [60, -1820], [70, -1700], [60, -1600], [120, -1580], [240, -1500], [180, -900], [60, -860], [110, 0]]);
}
function scene5(ctx, t) { if (t < 7.2) s5Wide(ctx, t); else s5Close(ctx, t); }
function s5Wide(ctx, t) {
  const cam = track(t, [[-0.6, { x: 560, y: 1000, z: 1.0 }], [7.4, { x: 560, y: 900, z: 1.18 }, Ease.inOutSine]]);
  const fl = flashAt(t, [{ t: 0.8, peak: 0.35 }]);
  const sweep = prog(t, 5.2, 7.0, Ease.inOutSine), sweepA = Math.sin(sweep * PI);
  // ---- room (depth .9)
  setCam(ctx, cam, 0.9);
  const wg = ctx.createLinearGradient(0, 0, 0, 1600); wg.addColorStop(0, '#0b0710'); wg.addColorStop(1, '#1c121a');
  ctx.fillStyle = wg; ctx.fillRect(-600, -600, 2280, 3300);
  // wood panelling right side
  ctx.fillStyle = '#1e0e0e'; ctx.fillRect(500, 300, 900, 1250);
  for (let i = 0; i < 5; i++) { ctx.strokeStyle = rgba(PAL.gold, 0.18); ctx.lineWidth = 3; ctx.strokeRect(520 + i * 150, 360, 120, 520); ctx.strokeRect(520 + i * 150, 920, 120, 560); }
  drawFrieze(ctx, -300, 60, 1700, 40, '#120c14', rgba(PAL.amb1, 0.4));
  const wp = archPath(40, 150, 400, 1350, 200);
  ctx.save(); ctx.clip(wp);
  drawCity(ctx, t, cam, { flash: fl + sweepA * 0.15, sky: [-200, -100, 900, 1800], hz: 0.65, seed: 9,
    layers: [{ sky: SKY.mid, d: 0.25, x: -500, y: 560, k: 0.62, haze: '#2a1228' }, { sky: SKY.near, d: 0.35, x: -700, y: 700, k: 0.55 }],
    rain: [{ d: 0.5, x: -100, y: -200, w: 800, h: 1800, n: 120, len: 40, speed: 1400, slant: -0.12, width: 1, color: '#9a8ac8', alpha: 0.35, seed: 21 }] });
  ctx.restore();
  setCam(ctx, cam, 0.9);
  ctx.save(); ctx.clip(wp); drawGlassRain(ctx, t, 40, 150, 400, 1350, { seed: 5, n: 18 }); ctx.restore();
  drawWindowFrame(ctx, 40, 150, 400, 1350, 200, { cols: 3, rows: 6, bar: 11, rays: 6, edgeA: 0.35 + fl * 0.6 });
  // door (right)
  const open = prog(t, 0.3, 1.3, Ease.inOutCubic);
  drawDecoDoor(ctx, 850, 520, 200, 1000, open, S5.Ll, t);
  // headlight sweep across the back wall (window-shaped patch)
  if (sweepA > 0.01) {
    const sx = lerp(300, 1200, sweep);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { ctx.fillStyle = rgba('#fff0d0', 0.14 * sweepA); ctx.fill(pathOf([[sx + i * 110 - 160, 380 + j * 260], [sx + i * 110 - 60, 390 + j * 260], [sx + i * 110 - 50, 620 + j * 260], [sx + i * 110 - 150, 610 + j * 260]])); }
    ctx.restore();
    // the boss's silhouette thrown huge across the wall by the passing headlights
    ctx.save(); ctx.translate(lerp(1060, 560, sweep), 1520); ctx.scale(0.62, 0.66); ctx.transform(1, 0, -0.18, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba('#0a0610', 0.8 * sweepA); ctx.fill(bossShadowPath()); ctx.restore();
  }
  // floor (depth .9 → 1.15)
  drawPlankFloor(ctx, cam, { vx: 540, yFar: 1500, yNear: 2300, xw0: 2400, xw1: 5200, n: 30, base: '#1e100c', dFar: 0.9, dNear: 1.15 });
  setCam(ctx, cam, 1);
  // window light thrown across the floor (mullion pattern) + door wedge
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const wl = 0.1 + fl * 0.12 + sweepA * 0.32;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const x0 = 60 + i * 132, y0 = 1508 + j * 62, x1 = x0 + 118, y1 = y0 + 54, sk = 1.05 + sweep * 0.5;
    ctx.fillStyle = rgba('#a898f0', wl * (1 - j * 0.18));
    ctx.fill(pathOf([[x0 + (y0 - 1500) * sk, y0], [x1 + (y0 - 1500) * sk, y0], [x1 + (y1 - 1500) * sk, y1], [x0 + (y1 - 1500) * sk, y1]]));
  }
  if (open > 0) { const g = ctx.createLinearGradient(1000, 1520, 500, 1800); g.addColorStop(0, rgba('#ffc070', 0.45 * open)); g.addColorStop(1, rgba('#ffc070', 0)); ctx.fillStyle = g; ctx.fill(pathOf([[850, 1520], [1050, 1520], [1100, 1950], [300, 1950]])); }
  ctx.restore();
  // boss turning
  const turnP = prog(t, 4.6, 6.6, Ease.inOutSine);
  const hy = lerp(-2.3, 0.75, turnP), by = lerp(-2.0, 0.55, prog(t, 4.75, 6.75, Ease.inOutSine));
  const bossX = 470, bossY = 1640, bs = 0.52;
  // long shadow on the floor
  const Dx = lerp(0.2, 0.56, sweep), Dy = lerp(0.045, 0.03, sweep);
  ctx.save(); ctx.translate(bossX, bossY); ctx.scale(bs, bs); ctx.transform(0.95, 0.04, -Dx, -Dy, 0, 0);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(8,4,12,' + (0.7 + sweepA * 0.25).toFixed(3) + ')'; ctx.fill(bossShadowPath());
  ctx.restore();
  // lieutenant: enters, walks, places envelope, steps back, bows
  const enter = prog(t, 1.0, 3.4, Ease.linear), back = prog(t, 4.4, 4.9, Ease.inOutSine), bow = prog(t, 6.0, 6.9, Ease.inOutSine);
  const reach = prog(t, 3.45, 3.95, Ease.outCubic) * (1 - prog(t, 4.0, 4.4, Ease.inOutSine));
  const lx = lerp(1000, 790, Ease.outSine(enter)) + back * 50, ls = 0.47;
  const walking = enter > 0 && enter < 1 ? 1 : back > 0 && back < 1 ? 0.5 : 0;
  const deskTop = { x: 700, y: 1300 };
  const hand = reach > 0 ? { x: lerp(200, (deskTop.x - lx) / -ls, reach), y: lerp(-900, (deskTop.y - 1640) / ls, reach) } : null;
  const Llt = withL(S5.Ll, sweepA * 0.6);
  // desk (depth 1)
  ctx.fillStyle = '#1a0a08'; ctx.fillRect(560, 1300, 280, 300); ctx.fillStyle = '#2e140e'; ctx.fillRect(540, 1282, 320, 22); ctx.fillStyle = rgba(PAL.gold, 0.5); ctx.fillRect(540, 1302, 320, 4);
  drawFluted(ctx, 560, 1306, 280, 290, '#1e0c0a', 7, 0.06);
  if (t >= 3.95) drawEnvelope(ctx, deskTop.x, deskTop.y - 10, 120, 26, -0.06, S5.Ll, false, 0.5);
  if (t > 0.9) drawSideFigure(ctx, { x: lx, y: 1640, s: ls, who: 'ltD', face: -1, walk: walking, phase: t * 7.5, bow, hand, carry: t < 3.95 ? 'envelope' : null, headTurn: 0.12, light: Llt, flash: sweepA * 0.4, t, head: { pitch: 0.06, glint: 0.4 } });
  // darken lieutenant under the boss's shadow
  if (sweep > 0.5) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba('#1a1024', 0.55 * prog(t, 6.0, 6.8)); ctx.fillRect(lx - 260, 700, 520, 960); ctx.restore(); }
  const bOut = {};
  drawStandingFront(ctx, { x: bossX, y: bossY, s: bs, who: 'boss', arms: 'behind', turn: clamp((Math.cos(by) + 1) / 2), light: withL(S5.Lb, fl + sweepA * 0.3), flash: fl * 0.3, t, out: bOut,
    head: { yaw: hy, pitch: 0.02, glint: turnP, squint: 0.3, cigar: true } });
  // foreground: leather armchair silhouette (depth 1.3)
  setCam(ctx, cam, 1.3);
  ctx.fillStyle = '#060406'; ctx.beginPath(); ctx.moveTo(-200, 2400); ctx.lineTo(-200, 1500); ctx.quadraticCurveTo(-60, 1420, 120, 1520); ctx.lineTo(160, 2400); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgba('#a99aee', 0.25); ctx.fillRect(-60, 1450, 160, 3);
  setScreen(ctx); drawHaze(ctx, t, 0, 200, W, 1500, '#6a5a8a', 0.07, 6, 51);
  setCam(ctx, cam, 0.95); drawDust(ctx, t, 60, 400, 500, 1100, 50, '#d8ccff', 0.3, 9, 1);
}
function s5Close(ctx, t) {
  const lt = t - 7.2;
  const cam = { x: lerp(540, 556, lt / 2.8), y: lerp(1000, 880, prog(lt, 0, 2.8)), z: lerp(1.0, 1.32, prog(lt, 0, 2.9, Ease.inOutSine)) };
  // window behind (left) with rain + bokeh
  setCam(ctx, cam, 0.6);
  ctx.fillStyle = '#0a070d'; ctx.fillRect(-900, -900, 2880, 3700);
  ctx.save(); ctx.beginPath(); ctx.rect(-500, -200, 900, 2400); ctx.clip();
  drawNightSky(ctx, -500, -200, 900, 2400, 0, 0.6);
  bokeh(ctx, t, 16, 700, ['#f2c46d', '#e0a24a', '#b48ad0'], 0.4, -500, 300, 900, 1500, 40, 110);
  drawGlassRain(ctx, t, -500, -200, 900, 2400, { seed: 8, n: 26, scale: 1.4 });
  ctx.restore();
  ctx.fillStyle = '#08060a'; ctx.fillRect(390, -200, 40, 2400);
  setCam(ctx, cam, 1);
  if (!(useRef() && drawRefPortrait(ctx, 540, 900, 880, { keySide: -1, keyCol: '#c8b8ff' }))) {
    drawBossSeatedFront(ctx, { x: 540, y: 1390, s: 2.15, light: S5.Lcu, t, cigar: true, breath: Math.sin(t * 1.1) * 0.5 + 0.5,
      head: { yaw: 0.42, pitch: 0.04, gaze: [0.55, 0.15], glint: 1, squint: 0.3 + 0.15 * prog(lt, 1.6, 2.4), frown: 0.15, socket: 0.05 } });
  }
  // rain-on-glass shadows sliding down his face
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; drawRainShadows(ctx, t, 150, 300, 700, 1300, { n: 34, alpha: 0.35, scale: 1.4, seed: 17, color: '#2a1838' }); ctx.restore();
  // the bowed lieutenant, foreground right (depth 1.35)
  setCam(ctx, cam, 1.35);
  drawBust(ctx, { x: 905, y: 1880, s: 1.55, who: 'ltD', view: 'front', light: mkLight({ dir: [0.5, -0.6, -0.4], key: '#ffb860', keyAmt: 0.05, mul: '#140a14', rim: '#ffbe6a', rimDir: [1, -0.4], rimW: 5, rimA: 0.8 }), t, head: { yaw: -0.9, pitch: 0.5, glint: 0 } });
  setScreen(ctx); drawHaze(ctx, t, 0, 0, W, H, '#6a5a8a', 0.06, 4, 61);
}

/* =====================================================================
   SCENE 6 · 44–55 s · THE PRICE OF POWER
   ===================================================================== */
const S6 = {
  Lb: mkLight({ dir: [0.62, -0.2, -0.76], key: '#b8a8ff', keyAmt: 0.45, mul: '#1a1026', rim: '#e0d6ff', rimDir: [0.9, -0.45], rimW: 7, rimA: 0.95 }),
  Lecu: mkLight({ dir: [-0.5, -0.3, 0.8], key: '#b0a2f0', keyAmt: 0.42, mul: '#2a1a3a', rim: '#d8ccff', rimDir: [-1, -0.2], rimW: 3, rimA: 0.6, glint: 1 }),
};
const S6_STRIKES = [{ t: 2.2, peak: 1 }, { t: 5.85, peak: 0.85 }, { t: 8.6, peak: 0.5 }];
function scene6(ctx, t) { if (t < 7.2) s6Window(ctx, t); else s6Eyes(ctx, t); }
function s6Window(ctx, t) {
  const cam = track(t, [[-0.8, { x: 540, y: 980, z: 1.0 }], [7.3, { x: 556, y: 880, z: 2.1 }, Ease.inOutSine]]);
  const fl = flashAt(t, S6_STRIKES);
  G.shakeX = fl * 2; G.shakeY = fl * 1.5;
  const wx = -40, wy = 60, ww = 1160, wh = 1500, arch = 420;
  setCam(ctx, cam, 0.9);
  const wp = archPath(wx, wy, ww, wh, arch);
  ctx.save(); ctx.clip(wp);
  drawCity(ctx, t, cam, {
    flash: fl, sky: [-500, -600, 2100, 2400], hz: 0.66, seed: 17,
    bolt: t < 4.5 ? { seed: 23, x0: 820, y0: -100, x1: 900, y1: 820, k: 1.4 } : { seed: 41, x0: 160, y0: -100, x1: 260, y1: 760, k: 1.2 },
    beams: [{ x: 120, y: 1400, a0: 0.35, amp: 0.3, sp: 0.3, ph: 0, len: 1700, w: 90, alpha: 0.08 }, { x: 900, y: 1400, a0: -0.25, amp: 0.25, sp: 0.24, ph: 1.7, len: 1700, w: 80, alpha: 0.07 }, { x: 560, y: 1400, a0: 0.05, amp: 0.35, sp: 0.2, ph: 3, len: 1600, w: 70, alpha: 0.05 }],
    blimp: { x: 120, y: 330, k: 0.55, v: 9 },
    layers: [{ sky: SKY.far, d: 0.15, x: -350, y: 480, k: 0.95, haze: '#3a1a30', fk: 0.8 }, { sky: SKY.mid, d: 0.24, x: -420, y: 420, k: 0.92, haze: '#2a1228' }, { sky: SKY.near, d: 0.36, x: -500, y: 560, k: 0.85, haze: '#140a18' }],
    rain: [{ d: 0.5, x: -300, y: -400, w: 1700, h: 2400, n: 320, len: 60, speed: 1700, slant: -0.16, width: 1.2, color: '#a898d8', alpha: 0.4, seed: 31 },
      { d: 0.8, x: -200, y: -300, w: 1500, h: 2300, n: 120, len: 90, speed: 2300, slant: -0.18, width: 2, color: '#c8bcff', alpha: 0.3, seed: 37 }],
  });
  ctx.restore();
  setCam(ctx, cam, 0.9);
  ctx.save(); ctx.clip(wp); drawGlassRain(ctx, t, wx, wy, ww, wh, { seed: 9, n: 40, alpha: 1 }); ctx.restore();
  drawWindowFrame(ctx, wx, wy, ww, wh, arch, { cols: 5, rows: 5, bar: 14, rays: 10, frame: 40, edgeA: 0.35 + fl * 0.8 });
  // floor with reflections
  setCam(ctx, cam, 1);
  const fg = ctx.createLinearGradient(0, 1540, 0, 2100); fg.addColorStop(0, '#120c18'); fg.addColorStop(1, '#050306');
  ctx.fillStyle = fg; ctx.fillRect(-500, 1540, 2080, 900);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) { const x = wx + (ww * (i + 0.5)) / 5; const g = ctx.createLinearGradient(0, 1545, 0, 2000); g.addColorStop(0, rgba('#8a78d0', 0.2 + fl * 0.4)); g.addColorStop(1, rgba('#8a78d0', 0)); ctx.fillStyle = g; ctx.fillRect(x - 90, 1545, 180, 460); }
  ctx.restore();
  // boss from behind
  const turn = prog(t, 4.5, 6.6, Ease.inOutSine);
  const L = withL(S6.Lb, fl);
  // city-glow bloom behind the head separates the silhouette
  glow(ctx, 600, 760, 420, '#7a5aa8', 0.22 + fl * 0.3);
  // reflection on the polished floor
  ctx.save(); ctx.translate(540, 1720); ctx.scale(0.54, -0.25); ctx.globalAlpha = 0.25; ctx.fillStyle = '#06040a'; ctx.fill(bossShadowPath()); ctx.restore();
  const out = {};
  drawStandingFront(ctx, { x: 540, y: 1720, s: 0.54, who: 'boss', view: 'back', arms: 'behind', light: L, flash: fl * 0.5, t, out, ringGlint: fl * 0.8 + pulse(t, 3.2, 4.0, 0.3) * 0.5,
    head: { yaw: lerp(PI, 1.3, turn), pitch: -0.03, glint: turn, squint: 0.3, cigar: true, gaze: [0.4, 0] } });
  smokeFrom(ctx, t, out, { k: 1, alpha: 0.3, height: 420, wind: -0.3 });
  // heavy drapes (depth 1.25)
  setCam(ctx, cam, 1.25);
  drawCurtain(ctx, -520, -600, 420, 3200, '#2a0a14', t, 3); drawCurtain(ctx, 1180, -600, 420, 3200, '#2a0a14', t, 3);
  // flash wash
  if (fl > 0.01) { setScreen(ctx); withOp(ctx, 'lighter', () => { ctx.fillStyle = rgba('#8a7ad8', fl * 0.12); ctx.fillRect(0, 0, W, H); }); }
  setScreen(ctx); drawHaze(ctx, t, 0, 200, W, 1600, '#6a5a9a', 0.06, 6, 71);
  G.shakeX = 0; G.shakeY = 0;
}
function s6Eyes(ctx, t) {
  const lt = t - 7.2;
  const fl = flashAt(t, S6_STRIKES);
  const cam = { x: 540, y: 960, z: lerp(1.0, 1.12, prog(lt, 0, 3.8, Ease.linear)) };
  setCam(ctx, cam, 1);
  ctx.fillStyle = '#060408'; ctx.fillRect(-900, -900, 2880, 3700);
  const dark = mkLight({ dir: [-0.6, -0.4, 0.7], key: '#16101f', keyAmt: 0.84, mul: '#0a0610', rim: '#5a4a98', rimDir: [-1, -0.2], rimW: 3, rimA: 0.4 });
  const lit = withL(S6.Lecu, fl * 0.6);
  const hp = { x: 540, y: 1010, s: 10.4, yaw: 0.08 + Math.sin(lt * 0.3) * 0.01, pitch: 0.02, t, detail: 1, glint: 1, squint: 0.16 + 0.12 * prog(lt, 1.8, 2.8), eyeOpen: 1.18, frown: 0.12, gaze: [-0.06, 0.02], cigar: true };
  if (!(useRef() && drawRefPortrait(ctx, 540, 1180, 1700, { keySide: -1, keyCol: '#c8b8ff', flash: fl }))) {
    // the classic noir "eye-light": face in darkness, a hard band of light across the eyes
    drawHead(ctx, HEAD.boss, Object.assign({}, hp, { light: dark, flash: fl * 0.3, glint: 0.3 }));
    const by = 1010 - 24 * 10.4, bh = 330 + fl * 120;
    // soft-edged band: a wider, fainter pass under a crisp core pass
    for (const [hh, al] of [[bh + 90, 0.45], [bh, 1]]) {
      ctx.save();
      const band = new Path2D(); band.rect(-400, by - hh * 0.52, 1880, hh);
      ctx.clip(band); ctx.globalAlpha = al;
      drawHead(ctx, HEAD.boss, Object.assign({}, hp, { light: lit, flash: fl * 0.5 }));
      ctx.restore();
    }
  }
  // rain-shadow streaks + lightning reflections
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  drawRainShadows(ctx, t, -100, -100, 1300, 2200, { n: 40, alpha: 0.32, scale: 2.4, seed: 29, color: '#1a1028' });
  ctx.restore();
  if (fl > 0.01) { setScreen(ctx); withOp(ctx, 'lighter', () => { ctx.fillStyle = rgba('#a898ff', fl * 0.12); ctx.fillRect(0, 0, W, H); }); }
}
