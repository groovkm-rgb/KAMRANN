// KARTELL film "Ermittlungsakte" look: typewritten dossier pages with tables, red felt-tip marker notes,
// and the closing HINWEIS screen. All screen space (1920x1080), all text German.
const TYPE_FONT = (s) => `${s}px 'Courier 10 Pitch', 'Liberation Mono', monospace`;
const INTER = (w, s) => `${w} ${s}px Inter, 'DejaVu Sans', sans-serif`;
const MARKER_RED = '#c41e24';
// typewriter text: per-character ink variation + tiny baseline jitter; k (0..1) = share of characters typed
function typeText(c, s, x, y, size, k = 1, o = {}) {
  c.font = TYPE_FONT(size); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  const n = Math.floor(s.length * clamp(k)), seed = o.seed || 0; let cx = x;
  for (let i = 0; i < n; i++) { const ch = s[i], w = c.measureText(ch).width; c.fillStyle = `rgba(${o.col || '28,26,30'},${.78 + rnd(seed + i) * .22})`; c.fillText(ch, cx + (rnd(seed + i + 50) - .5) * 1.2, y + (rnd(seed + i + 90) - .5) * 1.6); if (o.bold) c.fillText(ch, cx + .8, y); cx += w; }
  if (k < 1 && k > 0) { c.fillStyle = 'rgba(28,26,30,.8)'; c.fillRect(cx + 2, y - size * .8, size * .55, 3); }
  c.font = TYPE_FONT(size); return c.measureText(s).width;
}
// felt-tip marker: double stroke with slight offset, skewed hand
function markerText(c, s, x, y, size, k = 1, o = {}) {
  const n = Math.ceil(s.length * clamp(k)); if (!n) return; const str = s.slice(0, n);
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -.05); c.transform(1, 0, -.18, 1, 0, 0);
  c.font = INTER(700, size); c.textAlign = o.align || 'left'; c.lineJoin = 'round';
  c.strokeStyle = o.col || MARKER_RED; c.globalAlpha = .85; c.lineWidth = size * .07; c.strokeText(str, 0, 0);
  c.fillStyle = o.col || MARKER_RED; c.globalAlpha = .9; c.fillText(str, 0, 0); c.globalAlpha = .35; c.fillText(str, 1.5, -1.2);
  c.restore();
}
// hand-drawn ellipse / underline / cross, revealed with k
function markerEllipse(c, x, y, rx, ry, k = 1, o = {}) {
  c.save(); c.strokeStyle = o.col || MARKER_RED; c.lineWidth = o.w || 7; c.lineCap = 'round'; c.globalAlpha = .85; c.beginPath();
  const a0 = -2.6, a1 = a0 + Math.PI * 2.15 * clamp(k); for (let a = a0; a <= a1; a += .05) { const r = 1 + Math.sin(a * 3 + 1) * .03 + (a - a0) * .012; const px = x + Math.cos(a) * rx * r, py = y + Math.sin(a) * ry * r; a === a0 ? c.moveTo(px, py) : c.lineTo(px, py); }
  c.stroke(); c.restore();
}
function markerLine(c, pts, k = 1, o = {}) { c.save(); c.strokeStyle = o.col || MARKER_RED; c.lineWidth = o.w || 7; c.lineCap = 'round'; c.lineJoin = 'round'; c.globalAlpha = .85; c.beginPath(); const N = pts.length / 2 - 1, kk = clamp(k) * N; c.moveTo(pts[0], pts[1]); for (let i = 1; i <= N; i++) { const f = clamp(kk - (i - 1)); if (f <= 0) break; c.lineTo(lerp(pts[i * 2 - 2], pts[i * 2], f), lerp(pts[i * 2 - 1], pts[i * 2 + 1], f)); } c.stroke(); c.restore(); }
// paper sheet with texture, punch holes, fold and a paper clip
function paperSheet(c, x, y, w, h, rot = 0, seed = 1) {
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); c.translate(-w / 2, -h / 2);
  c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.fillStyle = '#f1ebdd'; c.fillRect(0, 0, w, h); c.restore();
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(255,255,250,.5)'); g.addColorStop(1, 'rgba(180,160,120,.18)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  kSpecks(c, 0, 0, w, h, seed, 260, 'rgba(120,100,70,.12)', 2.5);
  c.fillStyle = 'rgba(150,120,80,.08)'; c.beginPath(); c.ellipse(w * .8, h * .75, 90, 60, .3, 0, Math.PI * 2); c.fill(); // coffee-ring ghost
  c.strokeStyle = 'rgba(150,120,80,.18)'; c.lineWidth = 6; c.beginPath(); c.ellipse(w * .82, h * .18, 70, 66, 0, .3, 5.6); c.stroke();
  c.fillStyle = 'rgba(0,0,0,.05)'; c.fillRect(0, h * .5 - 1, w, 2);
  for (const py of [h * .3, h * .7]) { circle(c, 36, py, 13); c.fillStyle = '#5c4a3a'; c.fill(); }
  c.restore();
}
function paperClip(c, x, y, rot = .2) { c.save(); c.translate(x, y); c.rotate(rot); c.lineWidth = 6; c.strokeStyle = '#a9adb3'; c.beginPath(); c.moveTo(0, 120); c.lineTo(0, 10); c.arc(18, 10, 18, Math.PI, 0); c.lineTo(36, 140); c.arc(18, 140, 18, 0, Math.PI); c.lineTo(0, 40); c.stroke(); c.restore(); }
// desk under the dossier: dark wood, folder, cold top light + warm lamp pool
function dossierDesk(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#3a2a20'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.12)' : 'rgba(255,220,180,.04)'; c.fillRect(0, i * 28 + Math.sin(i) * 6, W, 14); }
  c.save(); c.translate(W * .52, H * .53); c.rotate(-.035); c.fillStyle = '#c9a66a'; c.fillRect(-760, -500, 1520, 1010); c.fillStyle = '#b8955a'; c.fillRect(-760, -500, 1520, 40); c.fillRect(-150, -540, 300, 50); c.restore();
  bloom(c, W * .42, H * .4, 1100, '255,230,180', .35);
}
// a dossier table page: rows [[label, value]], hi = highlighted row index, k = typing progress
function dossierTable(c, t, o) {
  const x = o.x ?? 470, y = o.y ?? 120, w = o.w ?? 1000, h = o.h ?? 840, rot = o.rot ?? -.012, k = o.k ?? 1;
  paperSheet(c, x, y, w, h, rot, o.seed || 3);
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); c.translate(-w / 2, -h / 2);
  // header block
  typeText(c, 'ERMITTLUNGSAKTE', 90, 96, 30, clamp(k * 6), { bold: true, seed: 1 });
  c.fillStyle = 'rgba(28,26,30,.7)'; c.fillRect(90, 112, w - 180, 3);
  typeText(c, o.kicker || 'Anlage', 90, 160, 24, clamp(k * 6 - .3), { seed: 7 });
  typeText(c, o.title, 90, 230, 40, clamp(k * 5 - .6), { bold: true, seed: 11 });
  // rows with dotted leaders
  const rows = o.rows, top = 320, rh = o.rowH || 96;
  rows.forEach((r, i) => {
    const kk = clamp(k * (rows.length + 2) - 1.5 - i); if (kk <= 0) return;
    const yy = top + i * rh;
    if (i === o.hi) { c.fillStyle = 'rgba(255,220,60,.45)'; c.save(); c.translate(80, yy - 40); c.rotate(-.004); c.fillRect(0, 0, w - 160, 56); c.restore(); }
    const lw = typeText(c, r[0], 90, yy, 30, clamp(kk * 2), { seed: 20 + i * 13 });
    c.font = TYPE_FONT(30); const vw = c.measureText(r[1]).width;
    if (kk > .5) { c.fillStyle = 'rgba(28,26,30,.55)'; for (let d = 90 + lw + 18; d < w - 90 - vw - 18; d += 16) c.fillRect(d, yy - 4, 4, 4); }
    typeText(c, r[1], w - 90 - vw, yy, 30, clamp(kk * 2 - 1), { bold: true, seed: 40 + i * 7 });
    c.fillStyle = 'rgba(28,26,30,.18)'; c.fillRect(90, yy + 30, w - 180, 2);
  });
  if (o.note) typeText(c, o.note, 90, h - 70, 22, clamp(k * 3 - 2), { seed: 99, col: '70,64,60' });
  if (o.mark) o.mark(c, w, h, top, rh);
  c.restore();
}
// closing screen: HINWEIS (text only, no numbers/links)
const HINWEIS_LINES = ['Dieses Video ist eine fiktive Geschichte, die auf realen Fakten basiert.', 'Es dient ausschließlich der Aufklärung.', 'Es verherrlicht keine Kriminalität und ruft nicht zu Straftaten auf.', 'Schmuggel, Produktfälschung und Drogenhandel zerstören Leben –', 'und werden hart bestraft.'];
function hinweisScreen(c, lt) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#26282b'; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * .7); g.addColorStop(0, 'rgba(255,255,255,.05)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  kSpecks(c, 0, 0, W, H, 5, 900, 'rgba(255,255,255,.018)', 2);
  const a0 = clamp((lt - .3) / 1.0);
  c.globalAlpha = a0; c.font = INTER(700, 64); c.letterSpacing = '12px'; c.fillStyle = '#f4f3ef'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('HINWEIS', W / 2 + 6, 330); c.letterSpacing = '0px';
  c.fillStyle = 'rgba(244,243,239,.6)'; c.fillRect(W / 2 - 60, 368, 120 * a0, 3);
  HINWEIS_LINES.forEach((s, i) => { const a = clamp((lt - 1.1 - i * .75) / .9); c.globalAlpha = a; c.font = INTER(400, 40); c.fillStyle = '#eceae4'; c.fillText(s, W / 2, 470 + i * 70 + (i >= 3 ? 24 : 0) + (1 - a) * 10); });
  c.globalAlpha = 1;
}
