/* =====================================================================
   05b · SCENE KIT — helpers shared by every film (shafts, bokeh, smoke,
   fades, busts, hands-only pass for table shots).
   ===================================================================== */
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

/** boss forearms + hands only (used where a table must sit between body and hands) */
function drawBossHandsOnly(ctx, base, hands) {
  const L = base.light, F = OUTFIT.boss;
  ctx.save(); ctx.translate(base.x, base.y); ctx.scale(base.s, base.s);
  for (const [k, s] of [['R', -1], ['L', 1]]) { const h = hands['hand' + k]; if (!h) continue; const el = hands['elbow' + k] || [s * 226, 420]; drawForearm(ctx, el[0], el[1], h.x, h.y, 50, 40, F.suit, F.cuff, L, base.flash || 0); }
  for (const [k] of [['R'], ['L']]) { const h = hands['hand' + k]; if (!h) continue; drawHand(ctx, { x: h.x, y: h.y, rot: h.rot ?? PI, s: h.s || 1, side: k === 'R' ? 1 : -1, pose: h.pose || 'rest', light: L, flash: base.flash || 0, ring: k === 'R', glint: h.glint || 0, det: h.det || 0, gemK: h.gemK }); }
  ctx.restore();
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
