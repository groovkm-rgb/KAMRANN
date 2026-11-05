/* =====================================================================
   05 · SETS — Art-Deco architecture, furniture and set dressing.
   ===================================================================== */

/** window glass outline: rectangle with an elliptical arch on top */
function archPath(x, y, w, h, archH) {
  const p = new Path2D();
  p.moveTo(x, y + h); p.lineTo(x, y + archH);
  if (archH > 0) p.ellipse(x + w / 2, y + archH, w / 2, archH, 0, PI, TAU); else p.lineTo(x + w, y);
  p.lineTo(x + w, y + h); p.closePath();
  return p;
}
/** stepped (ziggurat) window top */
function steppedPath(x, y, w, h, step, n) {
  const pts = [[x, y + h], [x, y + step * n]];
  for (let i = 0; i < n; i++) { const ix = (w / 2) * (i / n) * 0.55; pts.push([x + ix, y + step * (n - i)], [x + ix, y + step * (n - i - 1)]); }
  for (let i = n - 1; i >= 0; i--) { const ix = (w / 2) * (i / n) * 0.55; pts.push([x + w - ix, y + step * (n - i - 1)], [x + w - ix, y + step * (n - i)]); }
  pts.push([x + w, y + step * n], [x + w, y + h]);
  return pathOf(pts);
}
/** mullions, transoms, sunburst arch; bars are back-lit so their edges glow */
function drawWindowFrame(ctx, x, y, w, h, archH, o = {}) {
  const bar = o.bar || 10, cols = o.cols || 4, rows = o.rows || 5, col = o.color || '#0b0910', edge = o.edge || '#b9a8e6', ea = o.edgeA ?? 0.35;
  const outline = o.path || archPath(x, y, w, h, archH);
  ctx.save();
  ctx.save(); ctx.clip(outline);
  ctx.fillStyle = col;
  const bars = [];
  for (let i = 1; i < cols; i++) bars.push([x + (w * i) / cols - bar / 2, y + archH, bar, h - archH]);
  for (let j = 0; j <= rows; j++) { const yy = y + archH + ((h - archH) * j) / rows; bars.push([x, yy - bar / 2, w, bar]); }
  for (const b of bars) ctx.fillRect(b[0], b[1], b[2], b[3]);
  if (archH > 0) {
    const cx = x + w / 2, cy = y + archH, n = o.rays || 9;
    ctx.lineWidth = bar; ctx.strokeStyle = col;
    for (let i = 1; i < n; i++) { const a = PI + (i / n) * PI; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * w * 0.12, cy + Math.sin(a) * archH * 0.12); ctx.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * archH * 2); ctx.stroke(); }
    for (const k of [0.12, 0.55]) { ctx.beginPath(); ctx.ellipse(cx, cy, (w / 2) * k, archH * k, 0, PI, TAU); ctx.stroke(); }
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(cx, cy, (w / 2) * 0.12, archH * 0.12, 0, PI, TAU); ctx.fill();
  }
  // glowing bar edges
  if (ea > 0) {
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(edge, ea);
    for (const b of bars) { if (b[2] < b[3]) { ctx.fillRect(b[0] - 1.2, b[1], 1.6, b[3]); ctx.fillRect(b[0] + b[2] - 0.4, b[1], 1.6, b[3]); } else { ctx.fillRect(b[0], b[1] - 1.2, b[2], 1.6); } }
  }
  ctx.restore();
  ctx.lineWidth = o.frame || 28; ctx.strokeStyle = col; ctx.stroke(outline);
  ctx.lineWidth = 3; ctx.strokeStyle = rgba(o.trim || '#6a4a24', 0.8); ctx.stroke(outline);
  ctx.restore();
  return outline;
}
/** city seen through glass: sky, clouds, 3 skyline layers, searchlights, rain.
    Caller has already clipped. Layers are drawn with their own parallax depth. */
function drawCity(ctx, t, cam, o) {
  const fl = o.flash || 0;
  setCam(ctx, cam, o.dSky ?? 0.05);
  drawNightSky(ctx, o.sky[0], o.sky[1], o.sky[2], o.sky[3], fl, o.hz ?? 0.72);
  if (o.bolt && fl > 0.05) { setCam(ctx, cam, 0.08); drawBolt(ctx, o.bolt.seed, o.bolt.x0, o.bolt.y0, o.bolt.x1, o.bolt.y1, fl, o.bolt.k || 1); }
  setCam(ctx, cam, o.dCloud ?? 0.08); drawClouds(ctx, t, o.sky[0], o.sky[1], o.sky[2], o.sky[3] * 0.55, fl, o.seed || 0);
  if (o.beams) { setCam(ctx, cam, 0.12); for (const b of o.beams) drawBeam(ctx, b.x, b.y, b.a0 + Math.sin(t * b.sp + b.ph) * b.amp, b.len, 6, b.w, '#d8ccff', b.alpha); }
  if (o.blimp) { setCam(ctx, cam, 0.14); drawBlimp(ctx, o.blimp.x + t * o.blimp.v, o.blimp.y, o.blimp.k, t, fl); }
  for (const Ly of o.layers) {
    setCam(ctx, cam, Ly.d);
    drawSkyline(ctx, Ly.sky, t, Ly.x, Ly.y, Ly.k, fl * (Ly.fk ?? 1), { rim: Ly.rim ?? 0.25 });
    if (Ly.haze) { const gr = ctx.createLinearGradient(0, Ly.y + Ly.sky.h * Ly.k * 0.4, 0, Ly.y + Ly.sky.h * Ly.k); gr.addColorStop(0, rgba(Ly.haze, 0)); gr.addColorStop(1, rgba(Ly.haze, 0.55)); ctx.fillStyle = gr; ctx.fillRect(Ly.x, Ly.y, Ly.sky.w * Ly.k, Ly.sky.h * Ly.k); }
  }
  if (o.rain) for (const r of o.rain) { setCam(ctx, cam, r.d); drawRain(ctx, t, r); }
}
function drawBlimp(ctx, x, y, k, t, fl) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  const col = mixc('#120c18', '#5a4a7a', fl * 0.6);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(0, 0, 160, 44, 0, 0, TAU); ctx.fill();
  ctx.fill(pathOf([[-150, -6], [-200, -50], [-190, 0], [-200, 46], [-150, 8]]));
  ctx.fillRect(-30, 38, 60, 16);
  ctx.fillStyle = rgba('#b48ad0', 0.35 + fl * 0.5); ctx.fillRect(-150, -42, 300, 3);
  // cabin lights
  for (let i = 0; i < 5; i++) { ctx.fillStyle = '#f2c46d'; ctx.fillRect(-24 + i * 11, 42, 5, 6); }
  if (Math.sin(t * 3.1) > 0.4) glow(ctx, 160, 0, 20, '#ff3030', 1);
  if (Math.sin(t * 3.1 + 2) > 0.6) glow(ctx, -190, -48, 14, '#ffffff', 0.8);
  ctx.restore();
}
/** vertical fluted panel (gradient stripes) */
function drawFluted(ctx, x, y, w, h, base, n, hi = 0.1) {
  const fw = w / n;
  for (let i = 0; i < n; i++) {
    const gx = x + i * fw, gr = ctx.createLinearGradient(gx, 0, gx + fw, 0);
    gr.addColorStop(0, darken(base, 0.45)); gr.addColorStop(0.4, lighten(base, hi)); gr.addColorStop(1, darken(base, 0.55));
    ctx.fillStyle = gr; ctx.fillRect(gx, y, fw + 0.5, h);
  }
}
/** Art-Deco fan sconce with upward wall-wash */
function drawSconce(ctx, x, y, k, a = 1, col = '#ffcf7a') {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const gr = ctx.createRadialGradient(0, 0, 10, 0, -60, 460);
  gr.addColorStop(0, rgba(col, 0.42 * a)); gr.addColorStop(0.35, rgba('#e0a24a', 0.16 * a)); gr.addColorStop(1, rgba('#e0a24a', 0));
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 460, PI + 0.3, TAU - 0.3); ctx.closePath(); ctx.fill();
  const g2 = ctx.createRadialGradient(0, 10, 0, 0, 10, 200); g2.addColorStop(0, rgba('#e0a24a', 0.12 * a)); g2.addColorStop(1, rgba('#e0a24a', 0));
  ctx.fillStyle = g2; ctx.fillRect(-200, -190, 400, 400);
  ctx.restore();
  const gl = ctx.createLinearGradient(0, -70, 0, 0); gl.addColorStop(0, '#fff1c8'); gl.addColorStop(1, '#d8963c');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.arc(0, 0, 70, PI, TAU); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#6a4418'; ctx.lineWidth = 3;
  for (let i = 1; i < 7; i++) { const an = PI + (i / 7) * PI; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * 70, Math.sin(an) * 70); ctx.stroke(); }
  ctx.fillStyle = '#5a3a14'; ctx.fillRect(-78, -4, 156, 10); ctx.fillRect(-26, 6, 52, 18); ctx.fillRect(-12, 24, 24, 14);
  ctx.restore();
}
/** Deco pilaster: fluted column with stepped capital */
function drawPilaster(ctx, x, y, w, h, base, L) {
  drawFluted(ctx, x, y + 40, w, h - 40, base, 5, 0.12);
  ctx.fillStyle = darken(base, 0.3); ctx.fillRect(x - 10, y, w + 20, 18); ctx.fillRect(x - 5, y + 18, w + 10, 14);
  ctx.fillStyle = rgba(PAL.amb1, 0.35); ctx.fillRect(x - 10, y, w + 20, 2.5);
}
/** chevron/zig-zag frieze band */
function drawFrieze(ctx, x, y, w, h, base, hi) {
  ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = hi; ctx.lineWidth = 2.5; ctx.beginPath();
  const step = h * 1.2;
  for (let xx = x; xx <= x + w; xx += step) { ctx.moveTo(xx, y + h * 0.8); ctx.lineTo(xx + step / 2, y + h * 0.2); ctx.lineTo(xx + step, y + h * 0.8); }
  ctx.stroke();
  ctx.fillStyle = hi; ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y + h - 2, w, 2);
}
/** radiating sunburst relief (power halo behind the boss) */
function drawSunburst(ctx, x, y, r, base, hi, rays = 28, a = 1) {
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * TAU, a1 = ((i + 1) / rays) * TAU;
    ctx.fillStyle = i % 2 ? darken(base, 0.25) : mixc(base, hi, 0.18 * a);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0, a1); ctx.closePath(); ctx.fill();
  }
  for (const k of [0.32, 0.6, 0.86]) { ctx.strokeStyle = rgba(hi, 0.4 * a); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, r * k, 0, TAU); ctx.stroke(); }
  ctx.strokeStyle = rgba(hi, 0.6 * a); ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
  ctx.restore();
}
/** massive Deco desk, front view. top = y of the desk top's back edge, th = top depth */
function drawDeskFront(ctx, x, y, w, h, L, o = {}) {
  const th = o.th || 54, wood = o.wood || '#2c1410';
  // top surface (polished, reflects the lamp)
  const tg = ctx.createLinearGradient(0, y, 0, y + th);
  tg.addColorStop(0, mixc(wood, '#000', 0.3)); tg.addColorStop(1, mixc(wood, L.key, 0.18));
  ctx.fillStyle = tg; ctx.fillRect(x, y, w, th);
  if (o.reflect) { glow(ctx, o.reflect[0], y + th * 0.55, o.reflect[2] || 200, '#ffb34a', o.reflect[1] ?? 0.35, 'lighter', 0.12); }
  ctx.fillStyle = mixc(PAL.gold, L.key, 0.2); ctx.fillRect(x - 6, y + th - 4, w + 12, 7);
  // front panel
  const fy = y + th + 3;
  const fg = ctx.createLinearGradient(0, fy, 0, fy + h);
  fg.addColorStop(0, mixc(wood, '#000', 0.15)); fg.addColorStop(1, mixc(wood, '#000', 0.7));
  ctx.fillStyle = fg; ctx.fillRect(x, fy, w, h);
  // side fluted columns
  const cw = Math.min(150, w * 0.14);
  drawFluted(ctx, x, fy, cw, h, mixc(wood, '#000', 0.2), 6, 0.08);
  drawFluted(ctx, x + w - cw, fy, cw, h, mixc(wood, '#000', 0.2), 6, 0.08);
  // central stepped panel with inlay sunburst
  const px = x + cw + 40, pw = w - cw * 2 - 80, py = fy + 50;
  ctx.strokeStyle = rgba(PAL.gold, 0.45); ctx.lineWidth = 3;
  ctx.strokeRect(px, py, pw, h - 80);
  ctx.strokeRect(px + 18, py + 18, pw - 36, h - 116);
  const cx = x + w / 2, cy = py + 30;
  ctx.save(); ctx.beginPath(); ctx.rect(px + 18, py + 18, pw - 36, h); ctx.clip();
  ctx.strokeStyle = rgba(PAL.gold, 0.3); ctx.lineWidth = 2;
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * PI; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * pw, cy + Math.sin(a) * pw); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = mixc(PAL.gold, L.key, 0.2); ctx.beginPath(); ctx.arc(cx, cy, 14, 0, PI); ctx.fill();
  // top rim highlight
  ctx.fillStyle = rgba(L.rim, 0.3); ctx.fillRect(x, y, w, 2);
}
/** tall tufted leather chair back (front view) */
function drawBossChair(ctx, cx, top, w, bot, L) {
  const p = new Path2D();
  p.moveTo(cx - w / 2, bot); p.lineTo(cx - w / 2, top + 90); p.lineTo(cx - w / 2 + 40, top + 40); p.lineTo(cx - w * 0.22, top + 40); p.lineTo(cx - w * 0.22, top); p.lineTo(cx + w * 0.22, top); p.lineTo(cx + w * 0.22, top + 40); p.lineTo(cx + w / 2 - 40, top + 40); p.lineTo(cx + w / 2, top + 90); p.lineTo(cx + w / 2, bot); p.closePath();
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, '#2a0a12'); g.addColorStop(0.35, mixc('#5a1626', L.key, 0.08)); g.addColorStop(1, '#14050a');
  ctx.fillStyle = g; ctx.fill(p);
  ctx.save(); ctx.clip(p);
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 4;
  for (let i = 1; i < 6; i++) { const xx = cx - w / 2 + (w * i) / 6; ctx.beginPath(); ctx.moveTo(xx, top + 50); ctx.lineTo(xx, bot); ctx.stroke(); }
  ctx.fillStyle = rgba('#ffffff', 0.05);
  for (let i = 0; i < 6; i++) ctx.fillRect(cx - w / 2 + (w * i) / 6 + 8, top + 60, 8, bot - top);
  ctx.restore();
  ctx.fillStyle = rgba(PAL.gold, 0.7);
  for (let yy = top + 100; yy < bot; yy += 26) { ctx.beginPath(); ctx.arc(cx - w / 2 + 10, yy, 3.4, 0, TAU); ctx.arc(cx + w / 2 - 10, yy, 3.4, 0, TAU); ctx.fill(); }
  edgeFill(ctx, p, -L.rimDir[0] * 6, -L.rimDir[1] * 6, L.rim, L.rimA * 0.7);
}
/** tiered Deco chandelier */
function drawChandelier(ctx, x, y, k, t, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = '#1a120a'; ctx.fillRect(-4, -900, 8, 900);
  const fl = 0.95 + 0.05 * snz(t * 4, 7);
  glow(ctx, 0, 60, 520, '#ffb84a', 0.4 * a * fl);
  const tiers = [[0, 210, 50], [56, 160, 46], [108, 108, 42], [156, 56, 36]];
  for (const [ty, w, hh] of tiers) {
    const g = ctx.createLinearGradient(0, ty, 0, ty + hh);
    g.addColorStop(0, rgba('#fff2cc', 0.95 * a)); g.addColorStop(1, rgba('#d8902c', 0.9 * a));
    ctx.fillStyle = g; ctx.fill(pathOf([[-w, ty], [w, ty], [w * 0.82, ty + hh], [-w * 0.82, ty + hh]]));
    ctx.fillStyle = '#6a4418'; ctx.fillRect(-w - 6, ty - 4, w * 2 + 12, 8);
    ctx.strokeStyle = 'rgba(120,70,20,0.6)'; ctx.lineWidth = 2;
    for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * w / 4.5, ty + 4); ctx.lineTo(i * w / 5.5, ty + hh); ctx.stroke(); }
  }
  ctx.fillStyle = '#6a4418'; ctx.beginPath(); ctx.moveTo(-20, 192); ctx.lineTo(20, 192); ctx.lineTo(0, 240); ctx.closePath(); ctx.fill();
  glow(ctx, 0, 100, 260, '#ffe0a0', 0.5 * a * fl);
  ctx.restore();
}
/** domed pendant lamp (restaurant) */
function drawPendant(ctx, x, y, k, t, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = '#120c08'; ctx.fillRect(-3, -900, 6, 900);
  const g = ctx.createLinearGradient(0, -10, 0, 110);
  g.addColorStop(0, '#3a2410'); g.addColorStop(0.5, '#a8682a'); g.addColorStop(1, '#ffd890');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-150, 110); ctx.bezierCurveTo(-140, 20, -60, -10, 0, -10); ctx.bezierCurveTo(60, -10, 140, 20, 150, 110); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,20,5,0.7)'; ctx.lineWidth = 3;
  for (const yy of [30, 60, 88]) { ctx.beginPath(); ctx.moveTo(-150, yy + 14); ctx.quadraticCurveTo(0, yy - 6, 150, yy + 14); ctx.stroke(); }
  ctx.fillStyle = '#6a4418'; ctx.fillRect(-156, 106, 312, 10); ctx.fillRect(-14, -24, 28, 18);
  ctx.fillStyle = rgba('#fff4d0', a); ctx.beginPath(); ctx.ellipse(0, 116, 140, 16, 0, 0, TAU); ctx.fill();
  glow(ctx, 0, 140, 340, '#ffc060', 0.55 * a);
  ctx.restore();
}
/** heavy velvet curtain with vertical folds */
function drawCurtain(ctx, x, y, w, h, base, t, sway = 0) {
  const n = Math.max(3, Math.round(w / 55)), fw = w / n;
  for (let i = 0; i < n; i++) {
    const gx = x + i * fw + Math.sin(t * 0.6 + i) * sway;
    const gr = ctx.createLinearGradient(gx, 0, gx + fw, 0);
    gr.addColorStop(0, darken(base, 0.65)); gr.addColorStop(0.45, lighten(base, 0.05)); gr.addColorStop(1, darken(base, 0.75));
    ctx.fillStyle = gr; ctx.fillRect(gx, y, fw + 1, h);
  }
}
/** venetian-blind light: diagonal bands on a wall */
function drawBlinds(ctx, x, y, w, h, n, skew, color, a) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(color, a);
  const step = h / n;
  for (let i = 0; i < n; i++) {
    const yy = y + i * step;
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy + skew); ctx.lineTo(x + w, yy + skew + step * 0.55); ctx.lineTo(x, yy + step * 0.55); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
/** rotating ceiling-fan shadow (multiply) */
function drawFanShadow(ctx, cx, cy, r, ang, a, sy = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, sy); ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = rgba('#140a18', a);
  for (let i = 0; i < 4; i++) {
    ctx.save(); ctx.rotate(ang + (i * PI) / 2);
    ctx.beginPath(); ctx.ellipse(r * 0.55, 0, r * 0.46, r * 0.09, 0.08, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(0, 0, r * 0.08, 0, TAU); ctx.fill();
  ctx.restore();
}
/** checkered marble floor in one-point perspective (screen space; per-row parallax depth) */
function drawCheckerFloor(ctx, cam, o) {
  const { vx, yFar, yNear, xw0, xw1, rows, cols, ca, cb, dFar, dNear } = o;
  setScreen(ctx);
  const rowY = i => { const f = i / rows, p = f * f * 0.65 + f * 0.35; return lerp(yFar, yNear, p); };
  for (let i = 0; i < rows; i++) {
    const y0 = rowY(i), y1 = rowY(i + 1), f0 = (y0 - yFar) / (yNear - yFar), f1 = (y1 - yFar) / (yNear - yFar);
    const w0 = lerp(xw0, xw1, f0), w1 = lerp(xw0, xw1, f1), d0 = lerp(dFar, dNear, f0), d1 = lerp(dFar, dNear, f1);
    for (let j = 0; j < cols; j++) {
      const u0 = j / cols - 0.5, u1 = (j + 1) / cols - 0.5;
      const a = camPt(cam, vx + u0 * w0, y0, d0), b = camPt(cam, vx + u1 * w0, y0, d0), c = camPt(cam, vx + u1 * w1, y1, d1), d = camPt(cam, vx + u0 * w1, y1, d1);
      ctx.fillStyle = (i + j) % 2 ? ca : cb;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
    }
  }
}
/** polished plank floor in perspective (screen space) */
function drawPlankFloor(ctx, cam, o) {
  const { vx, yFar, yNear, xw0, xw1, n, base, dFar, dNear } = o;
  setScreen(ctx);
  const A = camPt(cam, vx - xw0 / 2, yFar, dFar), B = camPt(cam, vx + xw0 / 2, yFar, dFar), C = camPt(cam, vx + xw1 / 2, yNear, dNear), D = camPt(cam, vx - xw1 / 2, yNear, dNear);
  const g = ctx.createLinearGradient(0, A[1], 0, C[1]); g.addColorStop(0, darken(base, 0.4)); g.addColorStop(1, base);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.lineTo(D[0], D[1]); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5;
  for (let i = 0; i <= n; i++) { const f = i / n; ctx.beginPath(); ctx.moveTo(lerp(A[0], B[0], f), A[1]); ctx.lineTo(lerp(D[0], C[0], f), C[1]); ctx.stroke(); }
}
/** upturned chairs on a table (restaurant after closing) – silhouette */
function drawClosedTable(ctx, x, y, k, col, rim, ra) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = col;
  ctx.fillRect(-160, -10, 320, 16); ctx.fillRect(-12, 6, 24, 220); ctx.fillRect(-90, 216, 180, 12);
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(s * 70, -10);
    ctx.fillRect(-60, -18, 120, 14);                   // seat upside down
    ctx.fillRect(-56 * 1, -150, 8, 140); ctx.fillRect(48, -150, 8, 140);   // legs up
    ctx.fillRect(s * 52 - 4, -4, 8, 120); ctx.fillRect(s * 52 - 4, 100, s * -100, 8); // back hanging down
    ctx.restore();
  }
  ctx.fillStyle = rgba(rim, ra); ctx.fillRect(-160, -10, 320, 2);
  ctx.restore();
}
function drawPalm(ctx, x, y, k, col, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = col;
  ctx.fill(pathOf([[-60, 0], [60, 0], [44, -110], [-44, -110]]));
  for (let i = 0; i < 9; i++) {
    const a = -PI / 2 + (i - 4) * 0.33 + Math.sin(t * 0.5 + i) * 0.02, len = 300 + (i % 3) * 60;
    ctx.save(); ctx.translate(0, -110); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.quadraticCurveTo(len * 0.5, -40 - (i % 2) * 20, len, 30); ctx.quadraticCurveTo(len * 0.5, 10, 0, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function drawBarShelves(ctx, x, y, w, h, t, L) {
  ctx.fillStyle = '#0f0a0c'; ctx.fillRect(x, y, w, h);
  for (let r = 0; r < 4; r++) {
    const sy = y + 40 + r * (h - 60) / 4;
    ctx.fillStyle = '#2a1a10'; ctx.fillRect(x, sy + 90, w, 8);
    for (let i = 0; i < Math.floor(w / 34); i++) {
      const bx = x + 12 + i * 34, bh = 60 + hash(r * 50 + i) * 30, hue = hash(r * 77 + i);
      const c = hue < 0.33 ? '#2a3a1a' : hue < 0.66 ? '#4a2410' : '#2a2030';
      ctx.fillStyle = c; ctx.fillRect(bx, sy + 90 - bh, 20, bh); ctx.fillRect(bx + 7, sy + 90 - bh - 22, 6, 22);
      ctx.fillStyle = rgba('#ffd890', 0.25 + 0.15 * Math.sin(t * 0.7 + i + r)); ctx.fillRect(bx + 3, sy + 90 - bh + 6, 3, bh - 14);
    }
  }
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
}
/** a door with stepped Deco frame. open 0..1 (swings inward, reveals hallway light) */
function drawDecoDoor(ctx, x, y, w, h, open, L, t) {
  // hallway light behind
  const hg = ctx.createLinearGradient(x, y, x + w, y + h);
  hg.addColorStop(0, '#ffd890'); hg.addColorStop(1, '#c87a30');
  ctx.fillStyle = mixc('#0a0608', '#000', 0); ctx.fillRect(x, y, w, h);
  if (open > 0) { ctx.save(); ctx.globalAlpha = clamp(open * 1.5); ctx.fillStyle = hg; ctx.fillRect(x, y, w, h); ctx.restore(); }
  // door leaf hinged on the left edge, foreshortening as it opens
  const lw = w * Math.cos(open * PI * 0.46);
  const leaf = pathOf([[x, y], [x + lw, y + open * 30], [x + lw, y + h - open * 10], [x, y + h]]);
  ctx.fillStyle = mixc('#2a1410', '#000', open * 0.4); ctx.fill(leaf);
  ctx.save(); ctx.clip(leaf);
  ctx.fillStyle = rgba('#d8c8a0', 0.18 + open * 0.2); ctx.fillRect(x + lw * 0.2, y + h * 0.12, lw * 0.6, h * 0.34); // frosted glass (blank)
  ctx.strokeStyle = rgba(PAL.gold, 0.35); ctx.lineWidth = 3; ctx.strokeRect(x + lw * 0.12, y + h * 0.56, lw * 0.76, h * 0.36);
  ctx.restore();
  ctx.fillStyle = PAL.gold; ctx.beginPath(); ctx.arc(x + lw * 0.86, y + h * 0.52, 7, 0, TAU); ctx.fill();
  // frame
  ctx.strokeStyle = '#120a08'; ctx.lineWidth = 30; ctx.strokeRect(x - 15, y - 15, w + 30, h + 15);
  ctx.fillStyle = '#120a08'; ctx.fillRect(x - 50, y - 60, w + 100, 40); ctx.fillRect(x - 30, y - 90, w + 60, 32);
  ctx.fillStyle = rgba(PAL.amb1, 0.4); ctx.fillRect(x - 50, y - 60, w + 100, 3);
}
