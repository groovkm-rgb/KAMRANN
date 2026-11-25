// ===== CLAY LOOK: renders any path as plasticine (soft inner shading, fingerprint texture, cast shadow) =====
// Works on top of the unchanged Noah rig: nFill / nLine are swapped for clay versions; proportions untouched.
const W = 1920, H = 1080;
const CLAY = { z: 1, pat: null, on: true };
window.CLAY_ON = true;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shadeCol(hex, k) { return shadeHex(hex, k); }

// tileable plasticine texture: mottling, speckles, fingerprints, tool smears (neutral grey = no change in overlay)
function makeClayTex() {
  const N = 512, cv = document.createElement('canvas'); cv.width = cv.height = N; const x = cv.getContext('2d'), R = rng(11);
  x.fillStyle = '#808080'; x.fillRect(0, 0, N, N);
  const wrap = f => { for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) { x.save(); x.translate(dx, dy); f(); x.restore(); } };
  for (let i = 0; i < 160; i++) { const px = R() * N, py = R() * N, r = 10 + R() * 34, v = R() < .5 ? 0 : 255, a = .03 + R() * .05; wrap(() => { x.beginPath(); x.arc(px, py, r, 0, 7); x.fillStyle = `rgba(${v},${v},${v},${a})`; x.fill(); }); }
  for (let i = 0; i < 6000; i++) { const px = R() * N, py = R() * N, v = R() < .55 ? 0 : 255; x.fillStyle = `rgba(${v},${v},${v},${.08 + R() * .2})`; x.beginPath(); x.arc(px, py, .5 + R() * 1.2, 0, 7); x.fill(); }
  for (let f = 0; f < 8; f++) {
    const cx = R() * N, cy = R() * N, rot = R() * 6, sx = .7 + R() * .4;
    wrap(() => { x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(sx, 1);
      for (let j = 0; j < 10; j++) { const rr = 5 + j * 4, s0 = R() * 6, sw = 1.6 + R() * 3.4;
        x.beginPath(); x.arc(0, 0, rr, s0, s0 + sw); x.lineWidth = 1.4; x.strokeStyle = 'rgba(0,0,0,.13)'; x.stroke();
        x.beginPath(); x.arc(.8, .8, rr, s0, s0 + sw); x.lineWidth = 1; x.strokeStyle = 'rgba(255,255,255,.1)'; x.stroke(); }
      x.restore(); });
  }
  for (let i = 0; i < 50; i++) { const px = R() * N, py = R() * N, L = 10 + R() * 40, an = R() * 6; wrap(() => { x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(an) * L * .5 + 6, py + Math.sin(an) * L * .5, px + Math.cos(an) * L, py + Math.sin(an) * L); x.lineWidth = 1.2; x.strokeStyle = R() < .5 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.12)'; x.stroke(); }); }
  return cv;
}

// record the path being built so the clay fill can re-use it as a Path2D (clip / inner shadow) without losing it
function clayCtx(c) {
  let rec = new Path2D(), recT = c.getTransform(), fresh = true;
  const bp = c.beginPath.bind(c);
  c.beginPath = function () { rec = new Path2D(); fresh = true; return bp(); };
  for (const m of ['moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'arc', 'ellipse', 'rect', 'closePath', 'arcTo', 'roundRect']) {
    const o = c[m].bind(c);
    c[m] = function (...a) { if (fresh) { recT = c.getTransform(); fresh = false; } rec[m](...a); return o(...a); };
  }
  c._clayPath = () => [rec, recT];
  CLAY.pat = c.createPattern(makeClayTex(), 'repeat');
}
const pxScale = T => Math.sqrt(Math.abs(T.a * T.d - T.b * T.c));
function texFill(c, p, T, a = .55, sc = 1) {
  const s = pxScale(T); CLAY.pat.setTransform(new DOMMatrix([sc / s, 0, 0, sc / s, 0, 0]));
  c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = a; c.fillStyle = CLAY.pat; c.fill(p); c.restore();
}
// sculpt the current path as clay. o: { flat, cast (0..), depth, tex, edge, gloss }
function clay(c, col, o = {}) {
  const [p, T] = c._clayPath(), D = (o.depth ?? 1) * CLAY.z;
  c.save(); c.setTransform(T);
  // soft cast shadow on whatever is behind (key light from the upper left)
  const cast = o.cast ?? 1;
  if (cast) { c.shadowColor = `rgba(25,12,6,${.32 * cast})`; c.shadowBlur = 18 * D; c.shadowOffsetX = 7 * D; c.shadowOffsetY = 10 * D; }
  c.fillStyle = col; c.fill(p); c.shadowColor = 'transparent';
  c.save(); c.clip(p);
  texFill(c, p, T, o.tex ?? .6);
  if (!o.flat) {
    const big = new Path2D(); big.addPath(p); big.rect(-1e6, -1e6, 2e6, 2e6);
    // bottom-right core shadow, top-left highlight, overall soft rounding
    c.shadowColor = 'rgba(30,14,6,.5)'; c.shadowBlur = 16 * D; c.shadowOffsetX = -8 * D; c.shadowOffsetY = -10 * D; c.fillStyle = '#000'; c.fill(big, 'evenodd');
    c.shadowColor = 'rgba(255,248,236,.55)'; c.shadowBlur = 12 * D; c.shadowOffsetX = 6 * D; c.shadowOffsetY = 7 * D; c.fill(big, 'evenodd');
    c.shadowColor = 'rgba(20,10,5,.25)'; c.shadowBlur = 5 * D; c.shadowOffsetX = 0; c.shadowOffsetY = 0; c.fill(big, 'evenodd');
  }
  c.restore();
  if (o.edge ?? 1) { c.lineWidth = 1.6 / pxScale(T) * CLAY.z; c.strokeStyle = shadeCol(col.startsWith('#') ? col : '#888888', -.45); c.globalAlpha = .45; c.lineJoin = 'round'; c.stroke(p); }
  c.restore();
}
// clay "sausage": a rounded tube along points (arms, legs, fingers, rolled clay)
function clayTube(c, pts, w, col, o = {}) {
  const p = new Path2D(); p.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) p.lineTo(pts[i], pts[i + 1]);
  const T = c.getTransform(), s = pxScale(T), wp = w * s, D = CLAY.z;
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const off = (dx, dy) => c.setTransform(new DOMMatrix([1, 0, 0, 1, dx, dy]).multiply(T));
  if (o.cast ?? 1) { c.shadowColor = 'rgba(25,12,6,.3)'; c.shadowBlur = 16 * D; c.shadowOffsetX = 6 * D; c.shadowOffsetY = 9 * D; }
  c.lineWidth = w; c.strokeStyle = shadeCol(col, -.3); c.stroke(p); c.shadowColor = 'transparent';
  c.filter = `blur(${Math.max(.5, wp * .07)}px)`;
  off(-wp * .07, -wp * .08); c.lineWidth = w * .78; c.strokeStyle = col; c.stroke(p);
  c.filter = `blur(${Math.max(.6, wp * .1)}px)`;
  off(-wp * .17, -wp * .2); c.lineWidth = w * .26; c.strokeStyle = shadeCol(col, .5); c.globalAlpha = .75; c.stroke(p);
  c.filter = 'none'; c.globalAlpha = 1; c.setTransform(T);
  CLAY.pat.setTransform(new DOMMatrix([1 / s, 0, 0, 1 / s, 0, 0]));
  c.globalCompositeOperation = 'overlay'; c.globalAlpha = .5; c.strokeStyle = CLAY.pat; c.lineWidth = w; c.stroke(p);
  c.restore();
}
// a pressed-in groove (creases between fingers, seams, sculpting-tool lines)
function clayGroove(c, pts, w) {
  const p = new Path2D(); p.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) p.lineTo(pts[i], pts[i + 1]);
  const T = c.getTransform(), s = pxScale(T);
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  c.lineWidth = Math.max(w * .7, 1.4 / s); c.strokeStyle = 'rgba(55,28,16,.45)'; c.filter = 'blur(.6px)'; c.stroke(p);
  c.setTransform(new DOMMatrix([1, 0, 0, 1, 1.2, 1.4]).multiply(T)); c.lineWidth = Math.max(w * .45, 1 / s); c.strokeStyle = 'rgba(255,245,230,.35)'; c.stroke(p);
  c.restore();
}
// swap the rig primitives for clay versions
nFill = (c, fill, w) => { if (fill) clay(c, fill, {}); };
nLine = (c, pts, w, col) => {
  const s = pxScale(c.getTransform());
  if (col === NOAH.out) { if (w > 30) return; clayGroove(c, pts, w); return; }
  if (w * s > 7) clayTube(c, pts, w, col); else { c.save(); c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.filter = 'blur(.4px)'; c.stroke(); c.restore(); }
};
// warmer plasticine palette for Noah (same parts, same proportions)
Object.assign(NOAH, { skin: '#f4eee6', shade: '#e2d9cf', hair: '#5e4c40', hairDark: '#3a2c25', hairLight: '#8a776a', shirt: '#2e2a29', letters: '#efe6d6', pants: '#6a5a50', stripe: '#9a8b80', shoe: '#433630', watch: '#d1ad55', out: '#2a1f1a' });
