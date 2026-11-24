// ON-SCREEN GRAPHICS for the Mauerfall film (all text German).
//   clockStamp(c, t, { t0, t1, text, corner })  1980s TV-style digital clock box in a screen corner (no channel logo)
//   markerWrite(c, text, k, x, y, size, o)      red felt-tip handwriting, revealed by k 0..1 (any space: world or screen)
//   markerCircle(c, x, y, rx, ry, k)            red hand-drawn ellipse, k 0..1
//   tvOff(c, k)                                 old TV switching off: picture squeezes to a line, then a dot (k 0..1)
//   tears(c, x, y, k, t)                        joy tears running from Noah's eyes (head-local world coords of eye centre)
const RED = '#d8262a';
function clockStamp(c, t, o) {
  const a = clamp((t - o.t0) / .25), b = o.t1 == null ? 1 : clamp((o.t1 - t) / .25), k = Math.min(a, b); if (k <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = k;
  const x = o.corner === 'tl' ? 70 : W - 70 - 300, y = 60, w = 300, h = 120;
  c.translate(x + w / 2, y + h / 2); c.scale(1, a < 1 ? easeBack(a) : 1); c.translate(-(x + w / 2), -(y + h / 2));
  // bevelled box, scanlines, glowing segment digits
  let g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#1d2a5a'); g.addColorStop(1, '#0c1230'); c.fillStyle = g; rrect(c, x, y, w, h, 10); c.fill();
  c.lineWidth = 4; c.strokeStyle = '#7f9be0'; c.stroke(); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.35)'; rrect(c, x + 6, y + 6, w - 12, h - 12, 6); c.stroke();
  c.fillStyle = '#e8463a'; c.fillRect(x, y + h - 14, w, 6);
  c.font = "700 76px 'DejaVu Sans Mono', monospace"; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = 'rgba(255,220,120,.9)'; c.shadowBlur = 18; c.fillStyle = '#ffd860'; c.fillText(o.text, x + w / 2, y + h / 2 - 4); c.shadowBlur = 0;
  for (let yy = y + 2; yy < y + h; yy += 4) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x, yy, w, 1.5); }
  c.restore();
}
function markerWrite(c, text, k, x, y, size, o = {}) {
  if (k <= 0) return;
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -.06);
  c.font = `700 italic ${size}px 'DejaVu Sans', sans-serif`; c.textAlign = 'left'; c.textBaseline = 'middle';
  const w = c.measureText(text).width;
  c.beginPath(); c.rect(-size * .2, -size, (w + size * .4) * clamp(k), size * 2); c.clip();
  c.lineJoin = 'round'; c.lineCap = 'round';
  if (o.halo) { c.lineWidth = size * .3; c.strokeStyle = 'rgba(250,248,240,.92)'; c.strokeText(text, 0, 0); }
  c.lineWidth = size * .09; c.strokeStyle = o.col || RED; c.strokeText(text, 0, 0);
  c.fillStyle = o.col || RED; c.fillText(text, 0, 0);
  c.globalAlpha = .35; c.lineWidth = size * .03; c.strokeStyle = '#7a0a0a'; c.strokeText(text, 1.5, 1.5);
  c.restore();
  if (o.underline && k > .9) { const u = clamp((k - .9) * 10); c.save(); c.translate(x, y); c.rotate(o.rot ?? -.06); c.beginPath(); c.moveTo(-10, size * .62); c.quadraticCurveTo(w * .5 * u, size * .75, w * u + 20, size * .55); c.lineWidth = size * .08; c.strokeStyle = o.col || RED; c.lineCap = 'round'; c.stroke(); c.restore(); }
}
function markerCircle(c, x, y, rx, ry, k, lw = 12) {
  if (k <= 0) return; c.save(); c.beginPath(); const n = 60, e = clamp(k) * 1.08;
  for (let i = 0; i <= n * e; i++) { const a = -1.9 + i / n * Math.PI * 2, r = 1 + Math.sin(i * .4) * .03; c.lineTo(x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r); }
  c.lineWidth = lw; c.strokeStyle = RED; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); c.restore();
}
function tvOff(c, k) {
  if (k <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const sy = Math.max(.003, 1 - ease(clamp(k / .55))), sx = k < .55 ? 1 : Math.max(.004, 1 - ease(clamp((k - .55) / .35)));
  const img = c.getImageData(0, 0, W, H); const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.getContext('2d').putImageData(img, 0, 0);
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  c.globalAlpha = 1; c.drawImage(cv, W / 2 - W * sx / 2, H / 2 - H * sy / 2, W * sx, H * sy);
  c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(230,240,255,${clamp(k * 1.6) * .9})`; c.fillRect(W / 2 - W * sx / 2, H / 2 - Math.max(3, H * sy) / 2, W * sx, Math.max(3, H * sy));
  if (k > .8) bloom(c, W / 2, H / 2, 120 * (1 - (k - .8) * 4), '220,235,255', 1);
  c.restore();
}
function tears(c, x, y, k, t) {
  // two glistening tear tracks under the eyes (world units at k .25 scale; x,y = head centre)
  if (k <= 0) return;
  for (const s of [-1, 1]) { const ex = x + s * 23, ey = y + 12; const L = 30 * k + Math.sin(t * 3 + s) * 3; c.save(); c.globalAlpha = .9; line(c, [ex, ey, ex + s * 2, ey + L], 4, 'rgba(150,200,240,.85)'); ell(c, ex + s * 2, ey + L + 4, 4, 6); c.fillStyle = 'rgba(170,215,250,.95)'; c.fill(); c.fillStyle = '#fff'; circle(c, ex + s * 2 - 1, ey + L + 2, 1.5); c.fill(); c.restore(); }
}
