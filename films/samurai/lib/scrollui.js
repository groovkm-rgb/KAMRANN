// "Old parchment and brush" overlay system. Screen space. All text German.
const UI = { paper: '#efe4c8', paperD: '#d9c9a2', ink: '#1b1512', red: '#b3261e', redL: '#d0432f', fontHead: 'Shojumaru', fontNote: 'Kaushan', fontBody: 'CaveatBrush' };
function washi(c, x, y, w, h, o = {}) {
  c.save();
  c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = o.shadow ?? 30; c.shadowOffsetY = 12;
  c.beginPath(); const j = (i, a) => (rnd(i + (o.seed || 0)) - .5) * a;
  c.moveTo(x + j(1, 6), y + j(2, 6)); for (let i = 1; i <= 12; i++) c.lineTo(x + w * i / 12, y + j(i + 3, 7));
  for (let i = 1; i <= 8; i++) c.lineTo(x + w + j(i + 20, 7), y + h * i / 8);
  for (let i = 11; i >= 0; i--) c.lineTo(x + w * i / 12, y + h + j(i + 40, 7));
  for (let i = 7; i >= 1; i--) c.lineTo(x + j(i + 60, 7), y + h * i / 8);
  c.closePath(); c.fillStyle = o.col || UI.paper; c.fill(); c.shadowColor = 'transparent';
  c.clip();
  const g = c.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * .2, x + w / 2, y + h / 2, Math.max(w, h) * .75); g.addColorStop(0, 'rgba(255,250,235,.0)'); g.addColorStop(1, 'rgba(150,115,60,.35)'); c.fillStyle = g; c.fillRect(x, y, w, h);
  // fibres
  for (let i = 0; i < (w * h) / 2600; i++) { const fx = x + rnd(i * 3 + 1) * w, fy = y + rnd(i * 3 + 2) * h, a = rnd(i * 3) * Math.PI; stroke(c, [fx, fy, fx + Math.cos(a) * 18, fy + Math.sin(a) * 18], 1, `rgba(140,110,70,${.08 + rnd(i) * .12})`); }
  c.restore();
}
function brushText(c, s, x, y, size, k = 1, o = {}) {
  if (k <= 0) return;
  c.save(); c.font = `${size}px ${o.font || UI.fontHead}`; c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic';
  const w = c.measureText(s).width, x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  if (k < 1) { c.beginPath(); const e = x0 + (w + size * .4) * k; c.moveTo(x0 - 20, y - size * 1.3); c.lineTo(e, y - size * 1.3); for (let i = 0; i <= 8; i++) c.lineTo(e + Math.sin(i * 2.1) * size * .12, y - size * 1.3 + i * size * .2); c.lineTo(x0 - 20, y + size * .5); c.closePath(); c.clip(); }
  c.fillStyle = o.col || UI.ink; c.globalAlpha = o.alpha ?? 1; c.fillText(s, x, y);
  c.restore(); return w;
}
// red seal: square with rounded corners, a letter or symbol inside, stamped with a pop
function hanko(c, x, y, size, k, ch = 'S', o = {}) {
  if (k <= 0) return; const kk = clamp(k * 3), sc = 1 + (1 - easeOut(kk)) * .8;
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -.08); c.scale(sc, sc); c.globalAlpha = kk * .92;
  c.beginPath(); c.roundRect(-size / 2, -size / 2, size, size, size * .12); c.lineWidth = size * .09; c.strokeStyle = UI.red; c.stroke();
  c.beginPath(); c.roundRect(-size / 2 + size * .1, -size / 2 + size * .1, size * .8, size * .8, size * .06); c.fillStyle = UI.red; c.fill();
  c.font = `${size * (o.chSize || .58)}px ${UI.fontHead}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = UI.paper; c.fillText(ch, 0, size * .04);
  // worn ink speckles
  c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 26; i++) { circ(c, (rnd(i + 3) - .5) * size, (rnd(i + 7) - .5) * size, 1 + rnd(i) * size * .03); c.fill(); }
  c.restore();
}
// brush stroke along a polyline, progressively drawn, tapering ends, dry edge
function brushPath(c, pts, k, o = {}) {
  if (k <= 0) return; const w = o.w || 12, col = o.col || UI.ink;
  let L = 0; const seglen = []; for (let i = 2; i < pts.length; i += 2) { const d = Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]); seglen.push(d); L += d; }
  const end = L * clamp(k); let acc = 0;
  c.save(); c.lineCap = 'round'; c.strokeStyle = col; c.fillStyle = col;
  const steps = Math.max(8, Math.ceil(end / 6)); let px = pts[0], py = pts[1];
  for (let s = 1; s <= steps; s++) {
    const d = end * s / steps; let i = 0, a2 = 0; while (i < seglen.length - 1 && a2 + seglen[i] < d) { a2 += seglen[i]; i++; }
    const u = seglen[i] ? (d - a2) / seglen[i] : 0, x = lerp(pts[i * 2], pts[i * 2 + 2], u), y = lerp(pts[i * 2 + 1], pts[i * 2 + 3], u);
    const g = d / L, taper = Math.min(1, g * 6, (1 - g) * 4 + .25) * (.8 + .2 * Math.sin(d * .05));
    c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.lineWidth = w * taper; c.globalAlpha = o.alpha ?? .92; c.stroke(); px = x; py = y;
  }
  c.restore();
}
function brushEllipse(c, x, y, rx, ry, k, o = {}) {
  const pts = [], n = 48, a0 = o.a0 ?? -2.2; for (let i = 0; i <= n * 1.12; i++) { const a = a0 + i / n * Math.PI * 2, rr = 1 + Math.sin(i * .7) * .03 + i / n * .05; pts.push(x + Math.cos(a) * rx * rr, y + Math.sin(a) * ry * rr); }
  brushPath(c, pts, k, o);
}
function brushArrow(c, x0, y0, x1, y1, k, o = {}) {
  const mx = (x0 + x1) / 2 + (o.bend || 0) * (y1 - y0) * .2, my = (y0 + y1) / 2 - (o.bend || 0) * (x1 - x0) * .2, pts = [];
  for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push((1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1); }
  brushPath(c, pts, clamp(k / .8), o);
  if (k > .8) { const a = Math.atan2(y1 - my, x1 - mx), L = (o.w || 12) * 3.2, kk = seg(k, .8, 1);
    brushPath(c, [x1 - Math.cos(a - .5) * L, y1 - Math.sin(a - .5) * L, x1, y1], kk, o); brushPath(c, [x1 - Math.cos(a + .5) * L, y1 - Math.sin(a + .5) * L, x1, y1], kk, o); }
}
function brushUnderline(c, x0, x1, y, k, o = {}) { brushPath(c, [x0, y, (x0 + x1) / 2, y + 6, x1, y - 4], k, o); }
// a hand-written note with an optional red underline (screen space). k 0..1 reveal, out: fade-out alpha
function brushNote(c, s, x, y, size, k, o = {}) {
  if (k <= 0) return; c.save(); c.globalAlpha = o.alpha ?? 1;
  if (o.paper) { c.font = `${size}px ${o.font || UI.fontNote}`; const w = c.measureText(s).width; washi(c, x - (o.align === 'center' ? w / 2 : 0) - size * .5, y - size * 1.15, w + size, size * 1.6, { shadow: 18, seed: o.seed || 0 }); }
  const w = brushText(c, s, x, y, size, k, { font: o.font || UI.fontNote, col: o.col || UI.ink, align: o.align });
  if (o.under) { const x0 = o.align === 'center' ? x - w / 2 : x; brushUnderline(c, x0 - 6, x0 + w + 10, y + size * .22, seg(k, .6, 1), { w: size * .12, col: UI.red }); }
  c.restore();
}
