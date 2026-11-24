// MAUERFALL LIB: material textures and helpers (world space, deterministic).
// Scale: 1 m = 220 world units (MM). Noah at k .25 = 382 units = 1.74 m.
const MM = 220;
const TEX = {};
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function mixHex(a, b, k) { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const f = s => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k); return '#' + [f(16), f(8), f(0)].map(v => v.toString(16).padStart(2, '0')).join(''); }
function dk(hex, k) { return mixHex(hex, '#000000', k); }
function lt(hex, k) { return mixHex(hex, '#ffffff', k); }
function clipRect(c, x, y, w, h, fn) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); fn(); c.restore(); }
// visible x range of a parallax layer p (layer coordinates), with margin
function visX(cam, p, m = 200) { const z = 1 + (cam.z - 1) * p, hw = W / 2 / z; return [cam.x * p - hw - m, cam.x * p + hw + m]; }
function visY(cam, p, m = 200) { const z = 1 + (cam.z - 1) * p, hh = H / 2 / z; return [cam.y * p - hh - m, cam.y * p + hh + m]; }
// irregular low-alpha patches (dirt, damp, repairs): soft radial blobs, no hard edges
function mottle(c, x, y, w, h, seed, o = {}) {
  // patches sit on a WORLD grid (not relative to the visible area), so they stay put when the camera moves
  const n = o.n ?? Math.ceil(w * h / 26000), r0 = o.r ?? 60, dark = o.dark || '#2a2420', light = o.light || '#ffffff', a = o.a ?? .07;
  const cell = Math.max(8, Math.sqrt(w * h / Math.max(1, n)));
  for (let i = Math.floor(x / cell); i * cell < x + w; i++) for (let j = Math.floor(y / cell); j * cell < y + h; j++) {
    const q = seed + i * 7.31 + j * 13.17, px = (i + rnd(q * 3.17)) * cell, py = (j + rnd(q * 5.31)) * cell;
    if (px < x - r0 || px > x + w + r0 || py < y - r0 || py > y + h + r0) continue;
    const r = r0 * (.5 + rnd(q * 7.7) * 1.4), sq = .45 + rnd(q * 4.1) * .6;
    const col = rnd(q * 1.9) > .42 ? dark : light, aa = a * (.5 + rnd(q * 2.3) * .9);
    const g = c.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, rgba(col, aa)); g.addColorStop(.6, rgba(col, aa * .5)); g.addColorStop(1, rgba(col, 0));
    c.save(); c.translate(px, py); c.scale(1, sq); c.translate(-px, -py); c.fillStyle = g; c.fillRect(px - r, py - r, 2 * r, 2 * r); c.restore();
  }
}
// fine plaster / stone grain as a repeating pattern (made once, deterministic)
let _grain = null;
function grain(c, x, y, w, h, a = .5, sc = 1) {
  if (!_grain) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d');
    for (let i = 0; i < 2600; i++) { const v = rnd(i * 1.37 + 5); g.fillStyle = v > .5 ? `rgba(255,255,255,${.1 + rnd(i) * .2})` : `rgba(0,0,0,${.08 + rnd(i + 3) * .2})`; g.fillRect(Math.floor(rnd(i * 2.1) * 256), Math.floor(rnd(i * 3.3) * 256), 1 + Math.floor(rnd(i * 4.4) * 3), 1 + Math.floor(rnd(i * 5.5) * 2)); }
    for (let i = 0; i < 60; i++) { g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1; g.beginPath(); const px = rnd(i * 7.1) * 256, py = rnd(i * 8.2) * 256; g.moveTo(px, py); g.lineTo(px + (rnd(i) - .5) * 20, py + (rnd(i + 1) - .5) * 12); g.stroke(); }
    _grain = c.createPattern(cv, 'repeat');
  }
  // pattern anchored at the world origin -> the grain moves with the world, not with the screen
  c.save(); c.globalAlpha = a; c.beginPath(); c.rect(x, y, w, h); c.clip(); c.scale(sc, sc); c.fillStyle = _grain; c.fillRect(x / sc, y / sc, w / sc, h / sc); c.restore();
}
// rain / damp streaks running down from a ledge
function streaks(c, x, y, w, len, seed, o = {}) {
  const n = o.n ?? Math.max(2, Math.round(w / 26)), col = o.col || '#1e1a16', a = o.a ?? .16;
  for (let i = 0; i < n; i++) {
    const sx = x + rnd(seed + i * 9.3) * w, sw = 5 + rnd(seed + i * 3.3) * 16, sl = len * (.35 + rnd(seed + i * 6.1) * .8);
    const g = c.createLinearGradient(0, y, 0, y + sl); g.addColorStop(0, rgba(col, a * (.6 + rnd(seed + i) * .6))); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g; c.beginPath(); c.moveTo(sx - sw / 2, y); c.lineTo(sx + sw / 2, y); c.lineTo(sx + sw * .2, y + sl); c.lineTo(sx - sw * .2, y + sl); c.closePath(); c.fill();
  }
}
// soot / grime: darker towards top and bottom of a wall
function soot(c, x, y, w, h, o = {}) {
  const col = o.col || '#1a1612';
  let g = c.createLinearGradient(0, y, 0, y + h * .45); g.addColorStop(0, rgba(col, o.top ?? .32)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x, y, w, h * .45);
  g = c.createLinearGradient(0, y + h, 0, y + h * .8); g.addColorStop(0, rgba(col, o.bottom ?? .28)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x, y + h * .8, w, h * .2);
}
// hairline cracks
function cracks(c, x, y, w, h, seed, n = 4, o = {}) {
  c.save(); c.strokeStyle = o.col || 'rgba(35,28,24,.55)'; c.lineWidth = o.lw || 1.6; c.lineCap = 'round'; c.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    let px = x + rnd(seed + i * 4.4) * w, py = y + rnd(seed + i * 8.8) * h; const steps = 4 + Math.floor(rnd(seed + i * 2.2) * 6), dir = rnd(seed + i * 1.1) * Math.PI * 2;
    c.beginPath(); c.moveTo(px, py);
    for (let s = 0; s < steps; s++) { const a = dir + (rnd(seed + i * 13 + s) - .5) * 1.6, L = 10 + rnd(seed + i * 17 + s) * 26; px += Math.cos(a) * L; py += Math.sin(a) * L; c.lineTo(px, py); if (rnd(seed + i * 19 + s) > .8) { c.moveTo(px, py); c.lineTo(px + Math.cos(a + 1) * L * .6, py + Math.sin(a + 1) * L * .6); c.moveTo(px, py); } }
    c.stroke();
  }
  c.restore();
}
// brick courses (exposed brick, fire walls, chimneys); 1 brick = 24 x 7 cm with mortar
function brickFill(c, x, y, w, h, seed, o = {}) {
  const bw = o.bw ?? 55, bh = o.bh ?? 17, base = o.base || '#8a4a36', mortar = o.mortar || '#9a8f80';
  c.fillStyle = mortar; c.fillRect(x, y, w, h);
  const rows = Math.ceil(h / bh) + 1, cols = Math.ceil(w / bw) + 2;
  for (let r = 0; r < rows; r++) for (let k = -1; k < cols; k++) {
    const v = rnd(seed + r * 131 + k * 7.3), bx = x + k * bw - (r % 2) * bw / 2, by = y + r * bh;
    c.fillStyle = v > .82 ? dk(base, .25) : v > .6 ? lt(base, .12) : v < .12 ? mixHex(base, '#5a5048', .4) : base;
    c.fillRect(bx + 2, by + 2, bw - 4, bh - 3);
  }
  if (o.soot) { c.fillStyle = `rgba(20,16,14,${o.soot})`; c.fillRect(x, y, w, h); }
}
// patch where the plaster has fallen off: rough blob showing brick, light broken rim, shadow on top edge
function spall(c, cx, cy, r, seed, o = {}) {
  const pts = []; const n = 11;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = r * (.55 + rnd(seed + i * 3.7) * .6) * (i % 2 ? .82 : 1); pts.push([cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr * .8]); }
  const path = () => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); };
  c.save(); path(); c.clip(); brickFill(c, cx - r * 1.4, cy - r, r * 2.8, r * 2, seed, { base: o.brick || '#8d5540', mortar: '#8f857a', bw: 44, bh: 14 });
  c.fillStyle = 'rgba(30,22,18,.18)'; c.fillRect(cx - r * 1.4, cy - r, r * 2.8, r * 2); c.restore();
  path(); c.lineWidth = 5; c.strokeStyle = o.rim || 'rgba(235,228,214,.55)'; c.stroke();
  c.save(); c.translate(1.5, 3); path(); c.lineWidth = 2.2; c.strokeStyle = 'rgba(30,24,20,.6)'; c.stroke(); c.restore();
}
// war damage: clusters of bullet / shrapnel pocks
function bulletHoles(c, x, y, w, h, seed, n = 18) {
  for (let i = 0; i < n; i++) {
    const px = x + rnd(seed + i * 2.9) * w, py = y + rnd(seed + i * 6.7) * h, r = 3 + rnd(seed + i * 4.3) * 7;
    c.fillStyle = 'rgba(225,215,198,.5)'; ell(c, px, py, r * 1.9, r * 1.6, rnd(seed + i)); c.fill();
    c.fillStyle = 'rgba(40,32,26,.75)'; ell(c, px + .5, py + .8, r, r * .85, rnd(seed + i * 3)); c.fill();
    c.fillStyle = 'rgba(15,10,8,.6)'; ell(c, px + 1, py + 1.4, r * .45, r * .4); c.fill();
  }
}
// plaster wall: base + soft mottle + grain + soot + rising damp; caller adds streaks / spalls / holes
function plasterWall(c, x, y, w, h, base, seed, o = {}) {
  c.fillStyle = base; c.fillRect(x, y, w, h);
  clipRect(c, x, y, w, h, () => {
    mottle(c, x, y, w, h, seed, { r: 140, a: o.mottle ?? .12 });
    mottle(c, x, y, w, h, seed + 50, { r: 45, a: .08, n: Math.ceil(w * h / 30000) });
    grain(c, x, y, w, h, .55, 1.6);
    if (o.soot !== 0) soot(c, x, y, w, h, { top: o.sootTop ?? .3, bottom: o.sootBottom ?? .25 });
    // rising damp: dark irregular band at the foot
    c.fillStyle = 'rgba(40,32,24,.16)'; c.beginPath(); c.moveTo(x, y + h); for (let k = 0; k <= w; k += 60) c.lineTo(x + k, y + h - 160 - rnd(seed + k) * 90); c.lineTo(x + w, y + h); c.closePath(); c.fill();
  });
}
// rusticated ground floor (horizontal grooves)
function rustication(c, x, y, w, h, base, seed, step = 66) {
  for (let yy = y + step; yy < y + h; yy += step) { c.fillStyle = rgba(dk(base, .5), .55); c.fillRect(x, yy - 3, w, 5); c.fillStyle = rgba(lt(base, .5), .35); c.fillRect(x, yy + 2, w, 2); }
}
// dirty glass pane with sky reflection + highlight; dark = interior darkness amount
function glassPane(c, x, y, w, h, o = {}) {
  const sky = o.sky || ['#b9c1c4', '#5f6a70'], g = c.createLinearGradient(x, y, x + w * .3, y + h);
  g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]); c.fillStyle = g; c.fillRect(x, y, w, h);
  if (o.lit) { c.fillStyle = o.lit; c.fillRect(x, y, w, h); }
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = `rgba(255,255,255,${o.hi ?? .22})`; c.beginPath(); c.moveTo(x + w * .15, y); c.lineTo(x + w * .45, y); c.lineTo(x + w * .05, y + h); c.lineTo(x - w * .25, y + h); c.fill();
  c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(x + w * .6, y); c.lineTo(x + w * .7, y); c.lineTo(x + w * .45, y + h); c.lineTo(x + w * .35, y + h); c.fill();
  c.fillStyle = 'rgba(60,55,45,.12)'; c.fillRect(x, y + h * .75, w, h * .25); // grime at the bottom
  if (o.crack) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + w * .2, y + h * .1); c.lineTo(x + w * .45, y + h * .4); c.lineTo(x + w * .4, y + h * .7); c.moveTo(x + w * .45, y + h * .4); c.lineTo(x + w * .8, y + h * .5); c.stroke(); }
  c.restore();
}
// generic sign letters (German); font: condensed sans, like painted / metal shop letters
function signText(c, s, x, y, size, col, o = {}) {
  c.save(); c.font = `${o.weight || 700} ${size}px ${o.font || "'DejaVu Sans Condensed', 'DejaVu Sans', sans-serif"}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  if (o.spacing) c.letterSpacing = o.spacing + 'px';
  if (o.shadow) { c.fillStyle = o.shadow; c.fillText(s, x + size * .05, y + size * .06); }
  c.fillStyle = col; c.fillText(s, x, y); const w = c.measureText(s).width; c.restore(); return w;
}
// oblique ground bands: rows of stones between y0..y1 (rows grow towards the viewer)
function cobbles(c, x0, x1, y0, y1, seed, o = {}) {
  const base = o.base || '#4c4844', gap = o.gap || '#2c2926', h0 = o.h0 ?? 16, h1 = o.h1 ?? 30, ratio = o.ratio ?? 1.25, var_ = o.var ?? .14;
  c.fillStyle = gap; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  let y = y0, r = 0;
  while (y < y1) {
    const k = (y - y0) / Math.max(1, y1 - y0), rh = h0 + (h1 - h0) * k, sw = rh * ratio * (o.wide || 1.6);
    // stones on a world grid: column index i is fixed in the world, so they stay put when the camera pans
    const off = rnd(seed + r * 3.3) * sw;
    for (let i = Math.floor((x0 - off) / sw) - 1; i * sw + off < x1; i++) {
      const x = i * sw + off, v = rnd(seed + r * 977 + i * 13.1), w = sw * (.86 + rnd(seed + r * 31 + i * 7) * .14);
      c.fillStyle = v > .9 ? dk(base, .22) : v > .72 ? lt(base, var_) : v < .1 ? mixHex(base, '#6a5a4a', .35) : v < .25 ? dk(base, .1) : base;
      rrect(c, x + 2, y + 1.5, w - 4, rh - 3, Math.min(rh * .4, 8)); c.fill();
      if (o.wet !== false) { c.fillStyle = `rgba(230,236,240,${(o.sheen ?? .16) * (.4 + rnd(seed + r * 5 + i) * .8)})`; rrect(c, x + 5, y + 2.5, (w - 10) * .7, Math.max(1.5, rh * .18), 2); c.fill(); }
    }
    y += rh; r++;
  }
}
// large granite slabs (sidewalk middle strip)
function slabs(c, x0, x1, y0, y1, seed, o = {}) {
  const base = o.base || '#9b958c', sw = o.w ?? 230;
  c.fillStyle = o.gap || '#5f5a54'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  const start = Math.floor(x0 / sw) - 1;
  for (let i = start; i * sw < x1; i++) {
    const x = i * sw + (o.off || 0), v = rnd(seed + i * 3.1), w = sw - 6;
    c.fillStyle = v > .8 ? dk(base, .1) : v < .2 ? lt(base, .08) : base; c.fillRect(x + 3, y0 + 3, w, y1 - y0 - 6);
    c.save(); c.beginPath(); c.rect(x + 3, y0 + 3, w, y1 - y0 - 6); c.clip();
    mottle(c, x, y0, sw, y1 - y0, seed + i * 17, { r: 22, a: .1, n: 7 });
    for (let s = 0; s < 26; s++) { c.fillStyle = rnd(seed + i * 41 + s) > .5 ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.14)'; c.fillRect(x + rnd(seed + i * 53 + s) * sw, y0 + rnd(seed + i * 59 + s) * (y1 - y0), 3, 2); }
    if (rnd(seed + i * 7.7) > .72) cracks(c, x, y0, sw, y1 - y0, seed + i * 3, 1, { lw: 1.4 });
    c.restore();
  }
}
// puddle with sky reflection (oblique ellipse) + optional reflected light
function puddle(c, x, y, rx, ry, seed, o = {}) {
  c.save(); c.beginPath();
  for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 2, rr = 1 + (rnd(seed + i) - .5) * .35; c.lineTo(x + Math.cos(a) * rx * rr, y + Math.sin(a) * ry * rr); }
  c.closePath(); const g = c.createLinearGradient(0, y - ry, 0, y + ry); g.addColorStop(0, o.top || 'rgba(206,214,216,.75)'); g.addColorStop(1, o.bot || 'rgba(120,130,135,.7)');
  c.fillStyle = g; c.fill(); c.clip();
  if (o.refl) o.refl(c);
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(x + (rnd(seed + 9 + k) - .5) * rx, y, rx * .25 * (k + 1) * .5, ry * .2 * (k + 1) * .5, 0, 0, Math.PI * 2); c.stroke(); }
  c.restore();
}
// fallen leaves / litter on the ground
function leaves(c, x0, x1, y0, y1, seed, n = 30, o = {}) {
  // world-anchored: leaves live in 400-unit world cells (same density as before)
  const cols = o.cols || ['#a86b2a', '#8a5a26', '#c08a3a', '#6e4a28', '#b39048'], C = 400, per = Math.max(1, Math.round(n * C / Math.max(1, x1 - x0)));
  for (let ci = Math.floor(x0 / C); ci * C < x1; ci++) for (let k = 0; k < per; k++) {
    const i = ci * 37 + k, x = ci * C + rnd(seed + i * 2.1) * C, y = y0 + rnd(seed + i * 3.9) * (y1 - y0), s = (o.s || 1) * (7 + rnd(seed + i * 5.3) * 7);
    c.save(); c.translate(x, y); c.rotate(rnd(seed + i) * 6); c.scale(1, .5);
    c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * .9, s, 0); c.quadraticCurveTo(0, s * .9, -s, 0); c.fillStyle = cols[Math.abs(i) % cols.length]; c.fill();
    c.strokeStyle = 'rgba(40,25,10,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-s, 0); c.lineTo(s, 0); c.stroke(); c.restore();
  }
}
function litter(c, x0, x1, y0, y1, seed, every = 400) { for (let ci = Math.floor(x0 / every); ci * every < x1; ci++) cigButt(c, ci * every + rnd(seed + ci) * every, y0 + rnd(seed + ci * 3) * (y1 - y0), rnd(seed + ci * 5) * 6); }
function cigButt(c, x, y, r = 0) { c.save(); c.translate(x, y); c.rotate(r); c.fillStyle = '#efe9dc'; c.fillRect(-9, -2.5, 12, 5); c.fillStyle = '#c98a3e'; c.fillRect(3, -2.5, 6, 5); c.fillStyle = '#555'; c.fillRect(-10, -2, 2, 4); c.restore(); }
// soft contact shadow (overcast light)
function softShadow(c, x, y, w, a = .3) { const g = c.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, `rgba(20,18,22,${a})`); g.addColorStop(1, 'rgba(20,18,22,0)'); c.save(); c.translate(x, y); c.scale(1, .18); c.translate(-x, -y); c.fillStyle = g; c.fillRect(x - w, y - w, w * 2, w * 2); c.restore(); }
// two-stroke exhaust: blue-grey puffs drifting back and up (t in seconds)
function exhaust(c, x, y, t, o = {}) {
  const dir = o.dir ?? -1, n = o.n ?? 9;
  for (let i = 0; i < n; i++) {
    const ph = ((t * (o.rate ?? .7) + i / n) % 1), r = 10 + ph * (o.size ?? 70);
    const px = x + dir * ph * (o.len ?? 240) + Math.sin(t * 2 + i) * 6, py = y - ph * ph * (o.rise ?? 90);
    c.fillStyle = `rgba(${o.col || '150,165,190'},${(o.a ?? .32) * (1 - ph) * Math.min(1, ph * 6)})`; circle(c, px, py, r); c.fill();
  }
}
// pigeon (grey, iridescent neck), feet at (x, y); s = 1 faces right
function taube(c, x, y, t = 0, s = 1, sc = 1.3) {
  const b = Math.abs(Math.sin(t * 5 + x)) * 5, peck = Math.max(0, Math.sin(t * 2.3 + x * .1)) > .85 ? 14 : 0;
  c.save(); c.translate(x, y); c.scale(s * sc, sc);
  line(c, [-4, -10, -6, 0], 3, '#c86a4a'); line(c, [8, -10, 9, 0], 3, '#c86a4a');
  ell(c, -2, -30 - b, 32, 21, -.08); fs(c, '#8c909c', 3);
  c.beginPath(); c.moveTo(-28, -36 - b); c.lineTo(-52, -26 - b); c.lineTo(-26, -22 - b); c.closePath(); fs(c, '#5e6270', 2);
  ell(c, -8, -34 - b, 22, 11, -.1); fs(c, '#a2a8b8', 2); line(c, [-22, -30 - b, 4, -26 - b], 2, '#4a4e5a'); line(c, [-18, -24 - b, 6, -22 - b], 2, '#4a4e5a');
  ell(c, 20, -42 - b + peck * .5, 12, 14); c.fillStyle = '#6a8a7a'; c.fill();
  circle(c, 26, -54 - b + peck, 12); fs(c, '#6e7282', 3); c.beginPath(); c.moveTo(36, -54 - b + peck); c.lineTo(47, -50 - b + peck); c.lineTo(36, -48 - b + peck); fs(c, '#3a3a3a', 1.5);
  circle(c, 29, -57 - b + peck, 2.6); c.fillStyle = '#d86a2a'; c.fill();
  c.restore();
}
// ZOOM-LENS parallax: every layer scales with cam.z (true proportions at any zoom); only the pan is scaled by p.
// Use for all scale-critical sets. Ground line of a layer that should meet world line HZ on screen: baseZ(cam, HZ, p).
function layerZ(c, cam, p, fn) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(W / 2, H / 2); c.rotate(cam.rot || 0); c.scale(cam.z, cam.z); c.translate(-cam.x * p, -cam.y * p); fn(c); c.restore(); }
function baseZ(cam, HZ, p) { return HZ - cam.y * (1 - p); }
function visXZ(cam, p, m = 200) { const hw = W / 2 / cam.z; return [cam.x * p - hw - m, cam.x * p + hw + m]; }
// natural bare tree: recursive, irregular branches and twigs (world units, foot at x,y)
function bareTree(c, x, y, o = {}) {
  const s = o.seed || x, t = o.t || 0, h = o.h || 900, bark = o.bark || '#4a423a', leafP = o.leaves ?? .35;
  // every branch has a fixed id; all randomness comes from (seed, id) so the shape never changes between frames.
  // Only a slow, small sway (wind) moves the tips.
  const br = (x0, y0, a, len, w, d, id) => {
    const q = s * .37 + id * 7.13, bend = (rnd(q) - .5) * .5, sway = Math.sin(t * .9 + id * .7) * .012 * (6 - d);
    const aa = a + sway, mx = x0 + Math.cos(aa + bend * .5) * len * .5, my = y0 + Math.sin(aa + bend * .5) * len * .5;
    const x1 = x0 + Math.cos(aa + bend) * len, y1 = y0 + Math.sin(aa + bend) * len;
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(mx, my, x1, y1); c.lineCap = 'round'; c.lineWidth = w + (d > 2 ? 3 : 1.5); c.strokeStyle = OUT; c.stroke(); c.lineWidth = w; c.strokeStyle = bark; c.stroke();
    if (d > 0) {
      const nb = d > 3 ? 2 : 2 + (rnd(q + 1.1) > .5 ? 1 : 0);
      for (let i = 0; i < nb; i++) { const sp = (i - (nb - 1) / 2) * (.55 + rnd(q + i * 3.3) * .35) + (rnd(q + i * 1.7) - .5) * .3; br(x1, y1, aa + sp, len * (.62 + rnd(q + i * 5.1) * .22), w * .66, d - 1, id * 4 + i + 1); }
    } else {
      for (let k = 0; k < 3; k++) { const ta = aa + (rnd(q + k * 2.9) - .5) * 1.4; line(c, [x1, y1, x1 + Math.cos(ta) * 40, y1 + Math.sin(ta) * 40], 2.5, bark); }
      if (rnd(q + 9.9) < leafP) { c.save(); c.translate(x1, y1); c.rotate(rnd(q + 4.4) * 6); ell(c, 0, 0, 16, 10); c.fillStyle = ['#b8862e', '#9a6a26', '#c8a048', '#8a5a2a'][Math.floor(rnd(q + 6.6) * 4)]; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(40,25,10,.6)'; c.stroke(); c.restore(); }
    }
  };
  const tw = o.trunk || 56;
  c.beginPath(); c.moveTo(x - tw / 2 - 6, y); c.quadraticCurveTo(x - tw / 2, y - h * .5, x - tw * .35, y - h); c.lineTo(x + tw * .35, y - h); c.quadraticCurveTo(x + tw / 2, y - h * .5, x + tw / 2 + 6, y); c.closePath(); fs(c, bark, 3);
  c.save(); c.clip(); for (let k = 0; k < 40; k++) { const by = y - rnd(s + k * 3) * h; line(c, [x - tw / 2 + rnd(s + k) * tw, by, x - tw / 2 + rnd(s + k) * tw + 4, by - 30 - rnd(k) * 60], 2.5, rnd(k + s) > .5 ? 'rgba(20,16,12,.45)' : 'rgba(200,190,170,.25)'); } c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(x, y - h, tw, h); c.restore();
  br(x, y - h, -Math.PI / 2 - .55, h * .45, tw * .55, 5, 1); br(x, y - h, -Math.PI / 2 + .5, h * .48, tw * .55, 5, 2); br(x, y - h * .92, -Math.PI / 2 + .05, h * .5, tw * .5, 5, 3);
  if (o.low !== false) br(x, y - h * .75, -Math.PI / 2 - 1.1, h * .3, tw * .32, 3, 4);
}
// NEAR LAYER: objects close to the camera — pan factor p (> 1 moves faster) and drawn sc times bigger.
// Their ground line (y = 0 inside fn) sits on screen where world line groundY is. Good for cropped foreground occluders.
function nearLayer(c, cam, p, sc, groundY, fn) { layerZ(c, cam, p, c => { const bx = cam.x * p, by = baseZ(cam, groundY, p); c.translate(bx, by); c.scale(sc, sc); c.translate(-bx, 0); fn(c); }); }

// run fn over fixed world chunks [a, b) of width C that cover x0..x1 (keeps scattered detail anchored to the world)
function perChunk(x0, x1, C, fn) { for (let ci = Math.floor(x0 / C); ci * C < x1; ci++) fn(ci * C, (ci + 1) * C, ci); }
