// HAND-DRAWN overlays (screen space): strokes that draw themselves, a balance scale, arrows, circles, cross-outs,
// plus big info panels (cost table), the KONTOSTAND card body and the title stamp. All on-screen text German.
const INK = { chalk: '#fff3da', marker: '#211c1a', red: '#d0302a', blue: '#2f6fb0', gold: '#e8b84a' };
// polyline drawn up to fraction k of its length, slight hand jitter that "boils" 8x per second
function handStroke(c, pts, k, o = {}) {
  if (k <= 0) return; const t = o.t || 0, boil = Math.floor(t * 8), j = o.jitter ?? 1.6, seed = o.seed || 0;
  const P = []; for (let i = 0; i < pts.length; i += 2) P.push([pts[i] + (rnd(seed + i * 3.1 + boil * 7.7) - .5) * j * 2, pts[i + 1] + (rnd(seed + i * 5.3 + boil * 3.3) - .5) * j * 2]);
  let L = 0; const seg = []; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(d); L += d; }
  let rem = L * clamp(k); c.beginPath(); c.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length && rem > 0; i++) { const d = seg[i - 1]; if (rem >= d) c.lineTo(P[i][0], P[i][1]); else { const q = rem / d; c.lineTo(P[i - 1][0] + (P[i][0] - P[i - 1][0]) * q, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * q); } rem -= d; }
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (o.shadow !== false) { c.save(); c.lineWidth = (o.w || 6) + 6; c.strokeStyle = o.shadowCol || 'rgba(20,12,10,.55)'; c.stroke(); c.restore(); }
  c.lineWidth = o.w || 6; c.strokeStyle = o.col || INK.chalk; c.stroke();
}
function arcPts(cx, cy, rx, ry, a0, a1, n = 28) { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); } return p; }
function handCircle(c, cx, cy, rx, ry, k, o = {}) { handStroke(c, arcPts(cx, cy, rx, ry, -2.2, -2.2 + Math.PI * 2.15, 40), k, Object.assign({ col: INK.red, w: 6 }, o)); }
function handArrow(c, x0, y0, x1, y1, k, o = {}) {
  const mx = (x0 + x1) / 2 + (o.bend || 0) * (y1 - y0) * .2, my = (y0 + y1) / 2 - (o.bend || 0) * (x1 - x0) * .2, pts = [];
  for (let i = 0; i <= 16; i++) { const q = i / 16; pts.push((1 - q) * (1 - q) * x0 + 2 * (1 - q) * q * mx + q * q * x1, (1 - q) * (1 - q) * y0 + 2 * (1 - q) * q * my + q * q * y1); }
  handStroke(c, pts, clamp(k / .8), o);
  if (k > .8) { const a = Math.atan2(y1 - my, x1 - mx), s = o.head || 26, kk = clamp((k - .8) / .2); handStroke(c, [x1 - Math.cos(a - .5) * s, y1 - Math.sin(a - .5) * s, x1, y1, x1 - Math.cos(a + .5) * s, y1 - Math.sin(a + .5) * s], kk, o); }
}
function handCross(c, x0, y0, x1, y1, k, o = {}) { handStroke(c, [x0, y0 + 4, (x0 + x1) / 2, (y0 + y1) / 2 - 3, x1, y1 - 2], k, Object.assign({ col: INK.red, w: 7 }, o)); }
function handText(c, s, x, y, size, col, k = 1, o = {}) {
  // text that "writes" itself letter by letter, with a slight slant
  const n = Math.floor(s.length * clamp(k)); if (n <= 0) return; c.save(); c.translate(x, y); c.transform(1, 0, -.12, 1, 0, 0); c.rotate(o.rot || -.02);
  c.font = hudFont(size); c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  if (o.outline !== false) { c.lineWidth = size * .22; c.strokeStyle = o.outlineCol || 'rgba(20,12,10,.75)'; c.strokeText(s.slice(0, n), 0, 0); }
  c.fillStyle = col; c.fillText(s.slice(0, n), 0, 0); c.restore();
}
// money stack (bills) drawn by hand
function handMoney(c, x, y, k, t, o = {}) {
  for (let i = 0; i < 5; i++) { const kk = clamp(k * 5 - i), yy = y - i * 16; handStroke(c, [x - 70, yy, x + 70, yy, x + 74, yy - 14, x - 66, yy - 14, x - 70, yy], kk, { t, seed: 40 + i, col: '#a8e0a0', w: 5 }); }
  if (k > .7) { const yy = y - 4 * 16 - 7; handStroke(c, arcPts(x, yy, 18, 6, 0, Math.PI * 2, 16), (k - .7) / .3, { t, seed: 55, col: '#a8e0a0', w: 4 }); }
}
function handBook(c, x, y, k, t) {
  handStroke(c, [x - 62, y, x + 62, y, x + 62, y - 40, x - 62, y - 40, x - 62, y], k, { t, seed: 70, col: '#ffb08a', w: 5 });
  handStroke(c, [x - 46, y - 40, x - 46, y], clamp(k * 1.4 - .3), { t, seed: 71, col: '#ffb08a', w: 4 });
  handStroke(c, [x - 26, y - 26, x + 40, y - 26], clamp(k * 2 - 1), { t, seed: 72, col: '#ffb08a', w: 3 });
}
// balance scale: k = drawing progress, tilt = beam angle (+ = right side down)
function handScale(c, cx, cy, s, k, tilt, t, o = {}) {
  c.save(); c.translate(cx, cy); c.scale(s, s);
  const st = { t, col: INK.chalk, w: 6 };
  handStroke(c, [-110, 0, 110, 0], seg(k, 0, .08), Object.assign({ seed: 1 }, st));
  handStroke(c, [-60, 0, 0, -40, 60, 0], seg(k, .05, .14), Object.assign({ seed: 2 }, st));
  handStroke(c, [0, -40, 0, -300], seg(k, .12, .24), Object.assign({ seed: 3 }, st));
  handStroke(c, arcPts(0, -312, 14, 14, 0, Math.PI * 2, 14), seg(k, .22, .27), Object.assign({ seed: 4 }, st));
  const L = 230, ca = Math.cos(tilt), sa = Math.sin(tilt), ends = [[-L * ca, -312 - L * sa], [L * ca, -312 + L * sa]];
  handStroke(c, [ends[0][0], ends[0][1], ends[1][0], ends[1][1]], seg(k, .26, .38), Object.assign({ seed: 5 }, st));
  ends.forEach(([ex, ey], i) => {
    const kk = seg(k, .38 + i * .08, .5 + i * .08), py = ey + 170;
    handStroke(c, [ex, ey, ex - 80, py], kk, Object.assign({ seed: 10 + i, w: 4 }, st)); handStroke(c, [ex, ey, ex + 80, py], kk, Object.assign({ seed: 12 + i, w: 4 }, st));
    handStroke(c, arcPts(ex, py, 92, 34, 0, Math.PI, 18), seg(k, .44 + i * .08, .58 + i * .08), Object.assign({ seed: 14 + i }, st));
    handStroke(c, [ex - 92, py, ex + 92, py], seg(k, .44 + i * .08, .58 + i * .08), Object.assign({ seed: 16 + i }, st));
    if (i === 0) { handMoney(c, ex, py - 6, seg(k, .62, .82), t); if (k > .8) { handStroke(c, [ex - 70, py - 100, ex - 110, py - 150], seg(k, .8, .86), { t, seed: 30, w: 3 }); c.save(); c.translate(ex - 150, py - 178); c.rotate(-.12 - tilt * .3); const kk2 = seg(k, .82, 1); if (kk2 > 0) { c.globalAlpha = kk2; c.fillStyle = INK.chalk; rrect(c, -98, -32, 196, 64, 12); c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(20,12,10,.8)'; c.stroke(); hudText(c, '220.000 €', 0, 15, 38, '#1f3a1f', 'center'); } c.restore(); } }
    else handBook(c, ex, py - 6, seg(k, .7, .92), t);
  });
  c.restore();
}
// dark translucent sheet behind hand drawings for readability
function inkVeil(c, x, y, w, h, a = .35) { c.save(); const g = c.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) * .7); g.addColorStop(0, `rgba(10,8,14,${a})`); g.addColorStop(1, 'rgba(10,8,14,0)'); c.fillStyle = g; c.fillRect(x - w * .2, y - h * .2, w * 1.4, h * 1.4); c.restore(); }
// a list/table panel with dotted leaders, running SUMME counter; rows: [[label, value]], times: per-row reveal times
function costPanel(c, t, o) {
  const rows = o.rows, x = o.x, y = o.y, w = o.w, rh = o.rowH || 70, head = 86, h = head + rows.length * rh + 150;
  const e = hudEnv(t, o.t0, o.t1); if (e.k <= 0) return;
  c.save(); c.globalAlpha = e.a; c.translate(x + w / 2, y + h / 2); c.rotate(-.012 * (1 + (1 - e.k) * 4)); c.scale(e.s, e.s); c.translate(-(x + w / 2), -(y + h / 2));
  c.save(); c.shadowColor = 'rgba(10,5,20,.45)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = '#fff'; rrect(c, x - 12, y - 12, w + 24, h + 24, 30); c.fill(); c.restore();
  rrect(c, x - 12, y - 12, w + 24, h + 24, 30); c.lineWidth = 4; c.strokeStyle = HUD.ink; c.stroke();
  c.fillStyle = HUD.paper; rrect(c, x, y, w, h, 22); c.fill();
  // paper ruling
  c.save(); rrect(c, x, y, w, h, 22); c.clip(); for (let i = 0; i < 20; i++) line(c, [x, y + head + 20 + i * 34, x + w, y + head + 20 + i * 34], 1, 'rgba(47,111,176,.08)');
  c.fillStyle = o.color || HUD.accent; c.fillRect(x, y, w, head); c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 16; i++) c.fillRect(x + i * 70 - 20, y, 30, head); c.restore();
  hudIcon(c, o.icon || 'table', x + 50, y + head / 2, 1.4); hudText(c, o.title, x + 92, y + head / 2 + 14, 40, '#fff');
  let sum = 0, target = 0;
  rows.forEach((r, i) => {
    const tr = o.times[i], kk = clamp((t - tr) / .35); if (kk <= 0) return; const yy = y + head + 30 + i * rh;
    target += r[1]; sum += r[1] * ease(clamp((t - tr) / .6));
    c.save(); c.globalAlpha = kk; c.translate((1 - easeOut(kk)) * -40, 0);
    hudText(c, r[0], x + 36, yy + 40, 34, HUD.ink); const vw = hudText(c, fmtNum(r[1]) + ' €', x + w - 36, yy + 40, 36, HUD.ink, 'right');
    c.font = hudFont(34); const lw = c.measureText(r[0]).width; c.fillStyle = HUD.muted; for (let d = x + 36 + lw + 18; d < x + w - 36 - vw - 14; d += 16) c.fillRect(d, yy + 36, 5, 5);
    c.restore();
  });
  // underline + SUMME
  const sy = y + head + 30 + rows.length * rh + 18, ku = clamp((t - o.tSum) / .5);
  if (ku > 0) {
    handStroke(c, [x + w * .45, sy, x + w - 30, sy - 2], ku, { t, col: HUD.ink, w: 4, shadow: false, seed: 81 }); handStroke(c, [x + w * .45, sy + 10, x + w - 30, sy + 8], ku, { t, col: HUD.ink, w: 4, shadow: false, seed: 82 });
    hudText(c, 'SUMME', x + 36, sy + 78, 44, HUD.accent);
    const shown = t < o.tSum + .9 ? sum : target, sw = hudText(c, fmtNum(Math.round(shown / 100) * 100) + ' €', x + w - 36, sy + 80, 54, HUD.accent, 'right');
    if (t > o.tCircle) handCircle(c, x + w - 36 - sw / 2, sy + 62, sw / 2 + 34, 46, clamp((t - o.tCircle) / .5), { t, w: 6, shadow: false, seed: 83 });
  } else if (sum > 0) { hudText(c, 'SUMME', x + 36, sy + 78, 44, 'rgba(224,102,58,.35)'); hudText(c, fmtNum(Math.round(sum / 100) * 100) + ' €', x + w - 36, sy + 80, 54, 'rgba(224,102,58,.6)', 'right'); }
  c.restore();
}
// stamped title (rough red ink), slams in at t0
function titleStamp(c, t, t0, lines, o = {}) {
  const lt = t - t0; if (lt < 0) return; const k = clamp(lt / .14), sc = lerp(2.3, 1, easeIn(k)), a = clamp(lt / .06);
  const cx = o.x ?? W / 2, cy = o.y ?? H / 2, size = o.size || 86, col = o.col || '#c9252c';
  c.save(); c.globalAlpha = a; c.translate(cx, cy); c.rotate(o.rot ?? -.045); c.scale(sc, sc);
  c.font = hudFont(size); const wMax = Math.max(...lines.map(s => c.measureText(s).width)), bw = wMax + 110, bh = lines.length * size * 1.18 + 80;
  // paper patch behind the stamp so it reads on any picture
  if (o.paper !== false) { c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.fillStyle = 'rgba(250,244,230,.94)'; rrect(c, -bw / 2 - 26, -bh / 2 - 26, bw + 52, bh + 52, 10); c.fill(); c.restore(); }
  c.lineWidth = 9; c.strokeStyle = col; rrect(c, -bw / 2, -bh / 2, bw, bh, 14); c.stroke(); c.lineWidth = 3.5; rrect(c, -bw / 2 + 14, -bh / 2 + 14, bw - 28, bh - 28, 8); c.stroke();
  c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; lines.forEach((s, i) => c.fillText(s, 0, (i - (lines.length - 1) / 2) * size * 1.18 + 4));
  // ink texture: knock out specks
  c.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 520; i++) { const px = (rnd(i + 900) - .5) * (bw + 20), py = (rnd(i + 1900) - .5) * (bh + 20), r = .8 + rnd(i + 2900) * 3.2; c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fillStyle = `rgba(0,0,0,${.35 + rnd(i) * .5})`; c.fill(); }
  c.restore();
  // dust burst on impact
  if (lt > .12 && lt < .9) { const q = (lt - .12) / .78; c.save(); for (let i = 0; i < 26; i++) { const a2 = rnd(i + 77) * Math.PI * 2, r = 380 + q * 420 * (.5 + rnd(i + 78)); c.beginPath(); c.arc(cx + Math.cos(a2) * r * 1.3, cy + Math.sin(a2) * r * .55, 6 + rnd(i) * 10 * (1 - q), 0, Math.PI * 2); c.fillStyle = `rgba(240,225,200,${.5 * (1 - q)})`; c.fill(); } c.restore(); }
}
function screenDim(c, a, col = '10,8,16') { if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(${col},${a})`; c.fillRect(0, 0, W, H); c.restore(); }
// simple 2-link IK for Noah's arms in rig units: shoulder side, target (rig coords) -> { a, b } (elbow down)
function noahIK(side, tx, ty, elbowUp = false) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, L1 = NOAH.UPPER, L2 = NOAH.FORE;
  let dx = (tx - sx) * side, dy = ty - sy; let d = Math.hypot(dx, dy); const dm = L1 + L2 - 1; if (d > dm) { dx *= dm / d; dy *= dm / d; d = dm; }
  const base = Math.atan2(dx, dy), A = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a = elbowUp ? base + A : base - A, ex = Math.sin(a) * L1, ey = Math.cos(a) * L1, a2 = Math.atan2(dx - ex, dy - ey);
  return { a, b: a2 - a };
}
