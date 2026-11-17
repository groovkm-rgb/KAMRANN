// ON-SCREEN INFO OVERLAYS: a card that sits in a screen corner like a pasted PNG sticker
// (white sticker border, ink outline, drop shadow, slight tilt) and pops in / out.
// Screen space, drawn from the frame's `screen` list. Needs fonts.js (wait for NOAH_FONTS_READY before defineFilm).
//   hudCard(c, t, { t0, t1, corner: 'tr'|'tl'|'br'|'bl', w, h, title, icon, color, draw(c, k, lt, w, h) })
//   inside draw(): hudText, hudCounter, hudCalc, hudTable, hudTimeline, hudIcon   (card-local coords, 0,0 = top-left of the body)
const HUD = { paper: '#fbf6ea', ink: '#211c1a', muted: '#7d7064', accent: '#e0663a', blue: '#2f6fb0', green: '#3d8a4f', line: '#e4d9c6', margin: 46 };
const hudFont = (size) => `700 ${size}px ${typeof NOAH_FONT !== 'undefined' ? NOAH_FONT : 'Inter'}, Inter, 'DejaVu Sans', sans-serif`;
// 1234567 -> "1.234.567" (Turkish/German grouping), deterministic (no locale APIs)
function fmtNum(n, dec = 0, sep = '.', dsep = ',') {
  const neg = n < 0; n = Math.abs(n); let [i, d] = n.toFixed(dec).split('.');
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, sep); return (neg ? '−' : '') + i + (d ? dsep + d : '');
}
// pop envelope: 0 → 1 with overshoot after t0, back to 0 before t1
function hudEnv(t, t0, t1) { const a = clamp((t - t0) / .45, 0, 1), b = t1 == null ? 1 : clamp((t1 - t) / .3, 0, 1); return { k: Math.min(a, b), s: a < 1 ? easeBack(a) : (b < 1 ? ease(b) : 1), a: Math.min(1, a * 3, b * 2) }; }
function hudText(c, s, x, y, size, col = HUD.ink, align = 'left') { c.font = hudFont(size); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillText(s, x, y); return c.measureText(s).width; }
function hudIcon(c, kind, x, y, s = 1, col = '#fff') {
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 3.5; c.lineCap = 'round'; c.lineJoin = 'round';
  if (kind === 'hourglass') { c.beginPath(); c.moveTo(-11, -15); c.lineTo(11, -15); c.lineTo(-11, 15); c.lineTo(11, 15); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(-6, 11); c.lineTo(6, 11); c.lineTo(0, 3); c.closePath(); c.fill(); }
  else if (kind === 'clock') { c.beginPath(); c.arc(0, 0, 14, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -9); c.moveTo(0, 0); c.lineTo(7, 4); c.stroke(); }
  else if (kind === 'people') { for (const dx of [-8, 8]) { c.beginPath(); c.arc(dx, -7, 5, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(dx, 12, 9, Math.PI, 0); c.fill(); } }
  else if (kind === 'calc') { c.strokeRect(-12, -15, 24, 30); c.fillRect(-8, -11, 16, 7); for (let i = 0; i < 2; i++) for (let k = 0; k < 3; k++) c.fillRect(-8 + k * 6, 0 + i * 6, 4, 4); }
  else if (kind === 'table') { c.strokeRect(-14, -12, 28, 24); c.beginPath(); c.moveTo(-14, -4); c.lineTo(14, -4); c.moveTo(-14, 4); c.lineTo(14, 4); c.moveTo(-2, -12); c.lineTo(-2, 12); c.stroke(); }
  c.restore();
}
// rolling counter from → to; fmt(n) formats the shown value
function hudCounter(c, from, to, k, x, y, size, o = {}) {
  const v = from + (to - from) * ease(clamp(k, 0, 1)), shown = o.fmt ? o.fmt(v) : fmtNum(Math.round(v));
  const w = hudText(c, shown, x, y, size, o.color || HUD.ink, o.align || 'left');
  if (k > 0 && k < 1) { c.save(); c.globalAlpha = .25; hudText(c, shown, x, y - size * .18 * Math.sin(k * 40), size, o.color || HUD.ink, o.align || 'left'); c.restore(); }
  return w;
}
// calculation lines typed one after another; parts: [{s, col}] or a plain string; the last line can be the result (boxed)
function hudCalc(c, lines, k, x, y, size, o = {}) {
  const n = lines.length, lh = size * 1.45;
  lines.forEach((ln, i) => {
    const kk = clamp(k * n - i, 0, 1); if (kk <= 0) return;
    const parts = typeof ln === 'string' ? [{ s: ln }] : ln, full = parts.map(p => p.s).join(''), shown = Math.floor(full.length * kk);
    let used = 0, cx = x, yy = y + i * lh; c.font = hudFont(size);
    const isRes = o.result && i === n - 1;
    if (isRes && kk >= 1) { const w = c.measureText(full).width; c.fillStyle = 'rgba(224,102,58,.14)'; c.fillRect(x - 10, yy - size * 1.05, w + 20, size * 1.4); c.fillStyle = HUD.accent; c.fillRect(x - 10, yy + size * .3, w + 20, 4); }
    for (const p of parts) { const take = Math.max(0, Math.min(p.s.length, shown - used)); if (take > 0) cx += hudText(c, p.s.slice(0, take), cx, yy, size, p.col || (isRes ? HUD.accent : HUD.ink)); used += p.s.length; }
    if (kk < 1 && Math.floor(k * 30) % 2) { c.fillStyle = HUD.ink; c.fillRect(cx + 3, yy - size * .8, 3, size * .9); }
  });
  return n * lh;
}
// table: cols [{ w, align }], rows [[cells]], header row styled; rows reveal one by one with k; hi = highlighted row index
function hudTable(c, x, y, cols, rows, k, o = {}) {
  const rh = o.rowH || 46, size = o.size || 22, n = rows.length;
  rows.forEach((r, i) => {
    const kk = i === 0 ? clamp(k * n * 1.5, 0, 1) : clamp(k * n - i + .3, 0, 1); if (kk <= 0) return;
    const yy = y + i * rh; c.save(); c.globalAlpha = kk; c.translate((1 - ease(kk)) * 30, 0);
    if (i === 0) { c.fillStyle = o.headCol || HUD.ink; rrect(c, x, yy, cols.reduce((a, b) => a + b.w, 0), rh - 6, 10); c.fill(); }
    else if (i === o.hi) { c.fillStyle = 'rgba(224,102,58,.16)'; c.fillRect(x, yy, cols.reduce((a, b) => a + b.w, 0), rh - 4); c.fillStyle = HUD.accent; c.fillRect(x, yy, 6, rh - 4); }
    else { c.fillStyle = HUD.line; c.fillRect(x, yy + rh - 4, cols.reduce((a, b) => a + b.w, 0), 2); }
    let cx = x; cols.forEach((col, j) => { const al = col.align || 'left', tx = al === 'right' ? cx + col.w - 14 : al === 'center' ? cx + col.w / 2 : cx + 14; hudText(c, String(r[j]), tx, yy + rh * .62, i === 0 ? size * .78 : size, i === 0 ? '#fff' : (i === o.hi ? HUD.accent : (j === 0 ? HUD.muted : HUD.ink)), al); cx += col.w; });
    c.restore();
  });
  return n * rh;
}
// horizontal timeline with labelled ticks and a sliding marker (value between first and last tick)
function hudTimeline(c, x, y, w, ticks, value, o = {}) {
  const v0 = ticks[0].v, v1 = ticks[ticks.length - 1].v, px = v => x + (v - v0) / (v1 - v0) * w;
  c.fillStyle = HUD.line; rrect(c, x, y - 6, w, 12, 6); c.fill();
  const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#c8a46a'); g.addColorStop(1, HUD.blue); c.fillStyle = g; rrect(c, Math.min(px(value), x + w), y - 6, Math.max(0, x + w - px(value)), 12, 6); c.fill();
  for (const tk of ticks) { c.fillStyle = HUD.ink; c.fillRect(px(tk.v) - 1.5, y - 14, 3, 28); hudText(c, tk.label, px(tk.v), y + 42, o.size || 18, HUD.muted, 'center'); }
  const mx = px(value); c.save(); c.translate(mx, y); c.fillStyle = HUD.accent; c.beginPath(); c.arc(0, 0, 15, 0, Math.PI * 2); c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); c.beginPath(); c.moveTo(-9, -24); c.lineTo(9, -24); c.lineTo(0, -12); c.closePath(); c.fill(); c.restore();
}
function hudCard(c, t, o) {
  const e = hudEnv(t, o.t0, o.t1); if (e.k <= 0) return;
  const w = o.w || 560, h = o.h || 360, m = o.margin ?? HUD.margin, head = o.title ? 70 : 0, corner = o.corner || 'tr';
  const x = corner[1] === 'r' ? W - m - w : m, y = corner[0] === 'b' ? H - m - h : m;
  const ax = corner[1] === 'r' ? x + w : x, ay = corner[0] === 'b' ? y + h : y; // pop from the corner
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = e.a;
  c.translate(ax, ay); c.rotate((o.tilt ?? -.015) * (1 + (1 - e.k) * 4)); c.scale(e.s, e.s); c.translate(-ax, -ay);
  // sticker: shadow, white border, ink outline
  c.save(); c.shadowColor = 'rgba(20,10,30,.35)'; c.shadowBlur = 30; c.shadowOffsetY = 14; c.fillStyle = '#fff'; rrect(c, x - 10, y - 10, w + 20, h + 20, 30); c.fill(); c.restore();
  rrect(c, x - 10, y - 10, w + 20, h + 20, 30); c.lineWidth = 4; c.strokeStyle = HUD.ink; c.stroke();
  c.fillStyle = HUD.paper; rrect(c, x, y, w, h, 22); c.fill();
  if (head) {
    c.save(); rrect(c, x, y, w, h, 22); c.clip(); c.fillStyle = o.color || HUD.accent; c.fillRect(x, y, w, head);
    c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 12; i++) c.fillRect(x + i * 60 - 20, y, 26, head); c.restore();
    if (o.icon) hudIcon(c, o.icon, x + 42, y + head / 2, 1.2);
    hudText(c, o.title, x + (o.icon ? 76 : 28), y + head / 2 + 11, 30, '#fff');
  }
  if (o.draw) { c.save(); c.translate(x + 28, y + head + 22); o.draw(c, e.k, t - o.t0, w - 56, h - head - 44); c.restore(); }
  c.restore();
}
// a small floating number badge (e.g. "−10.000 yıl") that pops up near a world/screen point
function hudBadge(c, t, o) {
  const e = hudEnv(t, o.t0, o.t1); if (e.k <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = e.a; c.translate(o.x, o.y - (1 - e.k) * 30); c.scale(e.s, e.s);
  c.font = hudFont(o.size || 34); const w = c.measureText(o.text).width + 44, h = (o.size || 34) * 1.6;
  c.fillStyle = '#fff'; rrect(c, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, h / 2 + 6); c.fill(); c.lineWidth = 3; c.strokeStyle = HUD.ink; c.stroke();
  c.fillStyle = o.color || HUD.accent; rrect(c, -w / 2, -h / 2, w, h, h / 2); c.fill(); hudText(c, o.text, 0, (o.size || 34) * .36, o.size || 34, '#fff', 'center');
  c.restore();
}
