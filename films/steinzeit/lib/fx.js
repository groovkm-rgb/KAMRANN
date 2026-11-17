// Film-wide cinematic helpers for "Ein Tag in der Steinzeit" (16:9, toon-shorts engine + Noah rig).
// Screen space unless noted. Everything is a pure function of t (deterministic, rnd() only).

// world -> screen for a frame camera
const w2s = (cam, x, y) => [W / 2 + (x - cam.x) * cam.z, H / 2 + (y - cam.y) * cam.z];
function withWorld(c, cam, fn) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(W / 2, H / 2); c.rotate(cam.rot || 0); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); fn(c); c.restore(); }

// ---------- light map: ambient colour + additive lights, multiplied over the frame ----------
const _lm = document.createElement('canvas'); _lm.width = 1920; _lm.height = 1080; const _lmc = _lm.getContext('2d');
// lights: [{ x, y (screen), r, col: 'r,g,b', a }]
function lightMap(c, ambient, lights, extra) {
  _lmc.setTransform(1, 0, 0, 1, 0, 0); _lmc.globalCompositeOperation = 'source-over';
  _lmc.fillStyle = `rgb(${ambient})`; _lmc.fillRect(0, 0, W, H);
  _lmc.globalCompositeOperation = 'lighter';
  for (const L of lights) {
    if (!(L.a > 0)) continue;
    const g = _lmc.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    g.addColorStop(0, `rgba(${L.col},${L.a})`); g.addColorStop(.25, `rgba(${L.col},${L.a * .72})`); g.addColorStop(.6, `rgba(${L.col},${L.a * .28})`); g.addColorStop(1, `rgba(${L.col},0)`);
    _lmc.fillStyle = g; _lmc.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
  }
  if (extra) { _lmc.save(); extra(_lmc); _lmc.restore(); }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.drawImage(_lm, 0, 0); c.restore();
}

// ---------- film grain (pre-baked tiles) + vignette ----------
const _grain = [];
for (let k = 0; k < 6; k++) {
  const g = document.createElement('canvas'); g.width = 480; g.height = 270; const gc = g.getContext('2d'), im = gc.createImageData(480, 270);
  let s = 1234 + k * 977; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  gc.putImageData(im, 0, 0); _grain.push(g);
}
function grain(c, t, a = .07) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'overlay'; c.globalAlpha = a; c.imageSmoothingEnabled = true;
  const f = Math.floor(t * 30), g = _grain[f % 6], ox = (f * 137) % 480, oy = (f * 71) % 270;
  c.translate(-ox, -oy); for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) c.drawImage(g, x * 960 - 0, y * 540 - 0, 960, 540);
  c.restore();
}
function vignette2(c, a = .55, col = '8,5,12') {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .72); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
function finish(c, t, o = {}) { vignette2(c, o.vig ?? .55); grain(c, t, o.grain ?? .07); }

// ---------- Noah polish (overlays only, the rig's proportions stay untouched) ----------
// Head-local eye centres for drawNoahHead / drawNoah front view (units, head origin at NOAH.HEAD).
// drawNoahHead(c, x, y, k, e, tilt) puts the head centre at (x, y).
function noahHeadPolish(c, x, y, k, e = {}, tilt = 0, o = {}) {
  const R = NOAH.HEAD.r, lx = o.lx ?? .7, ly = o.ly ?? .4; // light direction (towards the light)
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(k, k);
  // soft form shadow on the side away from the light, warm rim light on the lit edge
  c.save(); c.beginPath(); c.arc(0, 0, R - 6, 0, Math.PI * 2); c.clip();
  let g = c.createRadialGradient(lx * R * .55, ly * R * .55, R * .2, lx * R * .3, ly * R * .3, R * 1.45);
  g.addColorStop(0, 'rgba(60,40,70,0)'); g.addColorStop(.6, 'rgba(60,40,70,0)'); g.addColorStop(1, `rgba(60,40,70,${o.shadow ?? .32})`);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(-R, -R, R * 2, R * 2);
  c.globalCompositeOperation = 'screen';
  if (o.rim) { const n = Math.hypot(lx, ly) || 1, cx = lx / n * R * 1.55, cy = ly / n * R * 1.55; g = c.createRadialGradient(cx, cy, R * .55, cx, cy, R * 1.05); g.addColorStop(0, `rgba(${o.rimCol || '255,170,90'},${o.rim})`); g.addColorStop(1, `rgba(${o.rimCol || '255,170,90'},0)`); c.fillStyle = g; c.fillRect(-R, -R, R * 2, R * 2); }
  c.restore();
  // catchlights in the eyes
  if (e.eyes !== 'closed' && (o.glint ?? 1) > 0) {
    const open = 1 - (e.lid || 0);
    if (open > .25) for (const s of [-1, 1]) {
      const ex = s * 92 + (e.look || 0) * 6, ey = 25;
      const gx = o.gdx ?? 9, gy = o.gdy ?? -12;
      c.beginPath(); c.arc(ex + gx, ey + gy, 8.5 * Math.min(1, open * 1.4), 0, Math.PI * 2); c.fillStyle = `rgba(${o.glintCol || '255,250,240'},${o.glint ?? 1})`; c.fill();
      c.beginPath(); c.arc(ex - gx * .9, ey - gy, 4, 0, Math.PI * 2); c.fillStyle = `rgba(${o.glintCol || '255,250,240'},${(o.glint ?? 1) * .6})`; c.fill();
    }
  }
  c.restore();
}

// ---------- fire particles ----------
function sparks(c, x, y, t, o = {}) {
  // glowing sparks rising from (x, y) (any space), n sparks, height h
  const n = o.n || 14, h = o.h || 300, sp = o.speed || .35, sz = o.size || 3;
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ph = (t * sp + rnd(i + 3.3)) % 1, life = Math.sin(ph * Math.PI);
    const px = x + (rnd(i + 7.1) - .5) * (o.w || 80) + Math.sin(t * 2 + i * 1.7) * 18 * ph + ph * (o.drift || 20), py = y - ph * h * (.6 + rnd(i + 9.9) * .6);
    const a = life * (o.a ?? 1) * (.6 + .4 * Math.sin(t * 17 + i));
    const r = sz * (1 - ph * .6);
    const g = c.createRadialGradient(px, py, 0, px, py, r * 5); g.addColorStop(0, `rgba(255,200,110,${a * .6})`); g.addColorStop(1, 'rgba(255,120,40,0)');
    c.fillStyle = g; c.fillRect(px - r * 5, py - r * 5, r * 10, r * 10);
    c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fillStyle = `rgba(255,236,180,${a})`; c.fill();
  }
  c.restore();
}
function smokeWisp(c, x, y, t, o = {}) {
  const n = o.n || 6, h = o.h || 500, a0 = o.a ?? .18, col = o.col || '180,175,185';
  c.save();
  for (let i = 0; i < n; i++) {
    const ph = (t * (o.speed || .08) + i / n) % 1, a = a0 * Math.sin(ph * Math.PI);
    const px = x + Math.sin(ph * 5 + i * 2.1 + t * .3) * (o.sway || 60) + ph * (o.drift || 80), py = y - ph * h, r = (o.r || 40) * (.5 + ph * 1.6);
    const g = c.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = g; c.fillRect(px - r, py - r, r * 2, r * 2);
  }
  c.restore();
}

// ---------- fur textures (world space) ----------
function furPatch(c, x0, y0, x1, y1, seed, cols, o = {}) {
  // dense fur strokes in a rectangle; cols = [base, dark, light]
  c.save(); c.fillStyle = cols[0]; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  const n = o.n || 900, L = o.len || 26, lw = o.lw || 3.2, dir = o.dir ?? 1.2;
  c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd(seed + i) * (x1 - x0), y = y0 + rnd(seed + i + 4000) * (y1 - y0), a = dir + (rnd(seed + i + 8000) - .5) * .9, l = L * (.6 + rnd(seed + i + 12000) * .8);
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * .5 + 4, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    c.lineWidth = lw; c.strokeStyle = i % 3 === 0 ? cols[2] : cols[1]; c.globalAlpha = .55 + rnd(seed + i + 16000) * .45; c.stroke();
  }
  c.restore();
}

// ---------- STONE SLAB CARD TEMPLATE (all on-screen text uses this) ----------
const CARD = { cream: '#F2E6D0', ochre: '#C8552B', amber: '#E8A33D', bg: '42,33,27', bgA: .8 };
function slabPath(c, w, h, seed) {
  // irregular chipped-stone outline around (0,0)-(w,h)
  const pts = [], step = 46;
  const jit = (i, s) => (rnd(seed + i * 3.7 + s) - .5) * 14;
  for (let x = 0; x < w; x += step) pts.push([x + jit(x, 1), jit(x, 2)]);
  for (let y = 0; y < h; y += step) pts.push([w + jit(y, 3), y + jit(y, 4)]);
  for (let x = w; x > 0; x -= step) pts.push([x + jit(x, 5), h + jit(x, 6)]);
  for (let y = h; y > 0; y -= step) pts.push([jit(y, 7), y + jit(y, 8)]);
  c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath();
}
function cardEnvelope(t, t0, t1) {
  // 0..1 in, 1 hold, out; returns { k, y, s, a }
  const kin = seg(t, t0, t0 + .45), kout = seg(t, t1 - .4, t1);
  if (t < t0 || t > t1) return null;
  const s = kin < 1 ? .86 + .14 * easeBack(kin) : 1;
  return { kin, kout, a: clamp(kin * 3) * (1 - kout), y: (1 - easeOut(kin)) * -40 + easeIn(kout) * 30, s };
}
function cardTitle(c, s, x, y, size, o = {}) {
  // carved / brushed headline: dark offset shadow, emboss, top-to-bottom gradient, thin dark contour
  c.save(); c.font = `${size}px ${F_TITLE}`; if (o.maxW) { const mw = c.measureText(s).width; if (mw > o.maxW) { size *= o.maxW / mw; c.font = `${size}px ${F_TITLE}`; } } c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic';
  const top = o.top || CARD.cream, bot = o.bot || '#d9c3a0';
  c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText(s, x + size * .04, y + size * .06);
  c.lineJoin = 'round'; c.lineWidth = Math.max(3, size * .06); c.strokeStyle = '#1a120d'; c.strokeText(s, x, y);
  const g = c.createLinearGradient(0, y - size * .8, 0, y + size * .1); g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillText(s, x, y);
  c.globalAlpha = .35; c.fillStyle = '#fff6e0'; c.save(); c.beginPath(); c.rect(x - 4000, y - size, 8000, size * .32); c.clip(); c.fillText(s, x - 1, y - 1); c.restore();
  c.restore();
  return c.measureText ? (c.font = `${size}px ${F_TITLE}`, c.measureText(s).width) : 0;
}
function cardBody(c, s, x, y, size, col = CARD.cream, align = 'left') {
  c.save(); c.font = `${size}px ${F_BODY}`; c.textAlign = align; c.fillStyle = 'rgba(0,0,0,.6)'; c.fillText(s, x + 2, y + 3); c.fillStyle = col; c.fillText(s, x, y); c.restore();
}
function ochreRule(c, x, y, w, seed = 1) {
  // hand-painted ochre divider
  c.save(); c.lineCap = 'round';
  for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x, y + k * 2); for (let i = 1; i <= 12; i++) c.lineTo(x + w * i / 12, y + k * 2 + (rnd(seed + i + k * 20) - .5) * 5); c.lineWidth = 6 - k * 1.5; c.strokeStyle = k ? 'rgba(232,163,61,.6)' : CARD.ochre; c.stroke(); }
  c.restore();
}
function iconHand(c, x, y, s, col = CARD.ochre) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  c.beginPath(); c.ellipse(0, 6, 16, 19, 0, 0, Math.PI * 2); c.fill();
  [[-16, -14, -.5], [-7, -24, -.15], [4, -26, .05], [14, -20, .3], [-24, 4, -1.1]].forEach(([fx, fy, a]) => { c.beginPath(); c.ellipse(fx, fy, 5, 13, a, 0, Math.PI * 2); c.fill(); });
  c.restore();
}
function iconPoint(c, x, y, s, col = CARD.amber) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, -22); c.lineTo(10, 4); c.lineTo(5, 20); c.lineTo(-5, 20); c.lineTo(-10, 4); c.closePath(); c.fillStyle = col; c.fill(); c.restore(); }
// stoneCard(c, t, { t0, t1, x, y, w, h, seed, draw(c, k, lt, w, h) })   x,y = top-left on screen (keep ≥ 80 px from the edges)
function stoneCard(c, t, o) {
  const E = cardEnvelope(t, o.t0, o.t1); if (!E) return;
  const { w, h } = o, seed = o.seed || 3, lt = t - o.t0;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = E.a;
  c.translate(o.x + w / 2, o.y + h / 2 + E.y); c.scale(E.s, E.s); c.rotate(o.rot ?? -.008); c.translate(-w / 2, -h / 2);
  // drop shadow
  c.save(); c.translate(10, 14); slabPath(c, w, h, seed); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill(); c.restore();
  // slab body + pores + inner shadow + warm edge light
  slabPath(c, w, h, seed); c.fillStyle = `rgba(${CARD.bg},${CARD.bgA})`; c.fill();
  c.save(); slabPath(c, w, h, seed); c.clip();
  for (let i = 0; i < 260; i++) { const px = rnd(seed + i) * w, py = rnd(seed + i + 300) * h, r = 1 + rnd(seed + i + 600) * 3.5; c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fillStyle = i % 3 ? 'rgba(0,0,0,.22)' : 'rgba(255,230,190,.07)'; c.fill(); }
  for (let i = 0; i < 7; i++) { const py = rnd(seed + i + 900) * h; c.beginPath(); c.moveTo(0, py); c.bezierCurveTo(w * .3, py + 12, w * .6, py - 10, w, py + 6); c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,225,180,.06)'; c.stroke(); }
  let g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(255,150,70,${.16 + .03 * Math.sin(t * 7)})`); g.addColorStop(.25, 'rgba(255,150,70,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.lineWidth = 26; c.strokeStyle = 'rgba(0,0,0,.28)'; slabPath(c, w, h, seed); c.stroke();
  c.restore();
  // charcoal frame (slightly wobbly double line) + warm top edge
  c.save(); c.translate(14, 14); slabPath(c, w - 28, h - 28, seed + 11); c.lineWidth = 2.2; c.strokeStyle = 'rgba(20,12,8,.85)'; c.stroke(); c.restore();
  c.save(); slabPath(c, w, h, seed); c.lineWidth = 2.5; c.strokeStyle = 'rgba(232,163,61,.45)'; c.stroke(); c.restore();
  // corner ornaments
  iconHand(c, w - 40, 44, .8, 'rgba(200,85,43,.85)'); iconPoint(c, 34, h - 34, .8, 'rgba(232,163,61,.7)');
  // content
  c.save(); o.draw(c, E.kin, lt, w, h); c.restore();
  c.restore();
  // dust / spark puff on landing
  if (E.kin > 0 && E.kin < 1) {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 22; i++) { const a = rnd(seed + i + 40) * Math.PI * 2, d = E.kin * (60 + rnd(seed + i + 70) * 120), px = o.x + w / 2 + Math.cos(a) * (w / 2 + d * .4), py = o.y + h + Math.sin(a) * 30 - d * .3; c.beginPath(); c.arc(px, py, 2 + rnd(seed + i) * 2.5, 0, Math.PI * 2); c.fillStyle = `rgba(255,${180 + rnd(i) * 60 | 0},120,${(1 - E.kin) * .8})`; c.fill(); }
    c.restore();
  }
}
// German number formatting: 15.000 / 3,5 ; years < 10.000 without dot
function deNum(n, dec = 0) { const s = Math.abs(n).toFixed(dec).split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (n < 0 ? '–' : '') + s.join(','); }
function deYear(y) { const a = Math.abs(Math.round(y)); const s = a >= 10000 ? deNum(a) : String(a); return y > 0 ? s : s + ' v. Chr.'; }
// counter value with ease-out, plus a flash when it lands
function countK(lt, t0, d = 1.4) { return easeOut(seg(lt, t0, t0 + d)); }
function landFlash(c, x, y, r, lt, tLand) { const a = bump(lt, tLand, tLand + .5); if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,210,130,${.5 * a})`); g.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }
