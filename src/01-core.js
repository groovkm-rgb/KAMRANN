'use strict';
/* =====================================================================
   01 · CORE — constants, math, easing, keyframe tracks, noise, colour,
   path utilities, glow sprites and the parallax camera.
   ===================================================================== */
const W = 1080, H = 1920, FPS = 24, DURATION = 55;
const TAU = Math.PI * 2, PI = Math.PI;
let RES = 1;                         // render scale (1 => 1080x1920 output)
const G = { t: 0, frame: 0, shakeX: 0, shakeY: 0 };

/* ---------- math ---------- */
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const Ease = {
  linear: t => t,
  inSine: t => 1 - Math.cos((t * PI) / 2),
  outSine: t => Math.sin((t * PI) / 2),
  inOutSine: t => -(Math.cos(PI * t) - 1) / 2,
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) * (1 - t),
  inOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: t => t * t * t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutQuint: t => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2),
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: t => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  outBack: t => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  smooth: t => t * t * (3 - 2 * t),
  smoother: t => t * t * t * (t * (t * 6 - 15) + 10),
};
/** eased progress of t inside [a,b] */
const prog = (t, a, b, e = Ease.inOutSine) => e(inv(a, b, t));
/** 0→1→0 envelope: rises over [a,a+r], falls over [b-r,b] */
const pulse = (t, a, b, r = 0.3, e = Ease.inOutSine) => Math.min(prog(t, a, a + r, e), 1 - prog(t, b - r, b, e));

/** keyframe track: keys = [[time, value, easeIntoThisKey?], ...]; value = number | {k:number} */
function track(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  const last = keys[keys.length - 1];
  if (t >= last[0]) return last[1];
  for (let i = 1; i < keys.length; i++) {
    const k1 = keys[i];
    if (t <= k1[0]) {
      const k0 = keys[i - 1];
      const p = (k1[2] || Ease.inOutSine)((t - k0[0]) / (k1[0] - k0[0]));
      return interp(k0[1], k1[1], p);
    }
  }
  return last[1];
}
function interp(a, b, p) {
  if (typeof a === 'number') return a + (b - a) * p;
  const o = {};
  for (const k in a) o[k] = typeof a[k] === 'number' && typeof b[k] === 'number' ? a[k] + (b[k] - a[k]) * p : a[k];
  return o;
}

/* ---------- deterministic randomness ---------- */
function hash(n) {
  n = (n | 0) ^ 0x5bd1e995;
  n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
  n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
const hash2 = (a, b) => hash(Math.imul(a | 0, 73856093) ^ Math.imul((b | 0) + 7, 19349663));
function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const a = hash(i * 7919 + seed * 104729), b = hash((i + 1) * 7919 + seed * 104729);
  return a + (b - a) * (f * f * (3 - 2 * f));
}
const snz = (x, seed = 0) => noise1(x, seed) * 2 - 1;                 // signed value noise
const fbm = (x, seed = 0) => snz(x, seed) * 0.6 + snz(x * 2.13, seed + 11) * 0.28 + snz(x * 4.37, seed + 23) * 0.12;
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- colour ---------- */
const _rgb = new Map();
function hexRgb(h) {
  let v = _rgb.get(h);
  if (v) return v;
  let s = h.charAt(0) === '#' ? h.slice(1) : h;
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  v = [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  if (_rgb.size > 6000) _rgb.clear();
  _rgb.set(h, v);
  return v;
}
function rgba(h, a = 1) { const c = hexRgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3) + ')'; }
function mixc(a, b, t) {
  const A = hexRgb(a), B = hexRgb(b); t = clamp(t);
  const r = Math.round(A[0] + (B[0] - A[0]) * t), g = Math.round(A[1] + (B[1] - A[1]) * t), bl = Math.round(A[2] + (B[2] - A[2]) * t);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}
const darken = (c, t) => mixc(c, '#000000', t);
const lighten = (c, t) => mixc(c, '#ffffff', t);

/* ---------- canvas & path helpers ---------- */
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}
function pathOf(pts, closed = true) {
  const p = new Path2D();
  if (!pts.length) return p;
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  if (closed) p.closePath();
  return p;
}
/** smooth closed/open path through points (Catmull-Rom → cubic Bézier) */
function smoothPathOf(pts, closed = true, k = 1) {
  const p = new Path2D(), n = pts.length;
  if (n < 3) return pathOf(pts, closed);
  const get = i => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  p.moveTo(pts[0][0], pts[0][1]);
  const lim = closed ? n : n - 1;
  for (let i = 0; i < lim; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    p.bezierCurveTo(p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k,
      p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k, p2[0], p2[1]);
  }
  if (closed) p.closePath();
  return p;
}
function fillPts(ctx, pts, color, smooth = false) { ctx.fillStyle = color; ctx.fill(smooth ? smoothPathOf(pts) : pathOf(pts)); }
function strokePts(ctx, pts, color, w, closed = false, smooth = false) {
  ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.stroke(smooth ? smoothPathOf(pts, closed) : pathOf(pts, closed));
}
/** convex hull, monotone chain; pts = [[x,y],...] */
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop();
  return lo.concat(up);
}
/** paints the band of `path` that lies outside the same path shifted by (dx,dy):
    used for rim lights (light-coloured) and edge shading (dark). */
function edgeFill(ctx, path, dx, dy, color, alpha = 1) {
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.clip(path);
  const p = new Path2D();
  p.rect(-1e5, -1e5, 2e5, 2e5);
  p.addPath(path, new DOMMatrix([1, 0, 0, 1, dx, dy]));
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.fill(p, 'evenodd');
  ctx.restore();
}
/** run fn with multiply-blend shading clipped to path */
function shadeIn(ctx, clipPath, fn) {
  ctx.save();
  if (clipPath) ctx.clip(clipPath);
  fn();
  ctx.restore();
}

/* ---------- glow sprites (additive light) ---------- */
const _glow = {};
function glowSprite(color) {
  let c = _glow[color];
  if (c) return c;
  c = makeCanvas(256, 256);
  const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, rgba(color, 1)); gr.addColorStop(0.18, rgba(color, 0.62)); gr.addColorStop(0.45, rgba(color, 0.2));
  gr.addColorStop(0.75, rgba(color, 0.05)); gr.addColorStop(1, rgba(color, 0));
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  return (_glow[color] = c);
}
function glow(ctx, x, y, r, color, a = 1, op = 'lighter', sy = 1) {
  if (a <= 0.003 || r <= 0) return;
  const pa = ctx.globalAlpha, po = ctx.globalCompositeOperation;
  ctx.globalAlpha = pa * clamp(a); ctx.globalCompositeOperation = op;
  ctx.drawImage(glowSprite(color), x - r, y - r * sy, r * 2, r * 2 * sy);
  ctx.globalAlpha = pa; ctx.globalCompositeOperation = po;
}
function withAlpha(ctx, a, fn) { const p = ctx.globalAlpha; ctx.globalAlpha = p * a; fn(); ctx.globalAlpha = p; }
function withOp(ctx, op, fn) { const p = ctx.globalCompositeOperation; ctx.globalCompositeOperation = op; fn(); ctx.globalCompositeOperation = p; }

/* ---------- camera ----------
   cam = {x, y, z, r}: world point (x,y) at depth 1 is placed at frame centre, zoom z.
   depth < 1 = far parallax layer, depth > 1 = foreground layer.                    */
function setCam(ctx, cam, depth = 1) {
  const z = Math.pow(cam.z || 1, depth);
  const cx = W / 2 + (cam.x - W / 2) * depth, cy = H / 2 + (cam.y - H / 2) * depth;
  const sx = G.shakeX * depth, sy = G.shakeY * depth, r = (cam.r || 0);
  if (!r) { ctx.setTransform(z * RES, 0, 0, z * RES, (W / 2 - cx * z + sx) * RES, (H / 2 - cy * z + sy) * RES); return; }
  const c = Math.cos(r) * z, s = Math.sin(r) * z;
  ctx.setTransform(c * RES, s * RES, -s * RES, c * RES, (W / 2 + sx - (c * cx - s * cy)) * RES, (H / 2 + sy - (s * cx + c * cy)) * RES);
}
/** world → screen for a point at a given depth (no rotation support needed) */
function camPt(cam, x, y, depth = 1) {
  const z = Math.pow(cam.z || 1, depth);
  const cx = W / 2 + (cam.x - W / 2) * depth, cy = H / 2 + (cam.y - H / 2) * depth;
  return [W / 2 + (x - cx) * z + G.shakeX * depth, H / 2 + (y - cy) * z + G.shakeY * depth];
}
function setScreen(ctx) { ctx.setTransform(RES, 0, 0, RES, 0, 0); }
/** current transform → screen-space position & scale of a local point */
function toScreen(ctx, x, y) {
  const m = ctx.getTransform();
  return { x: (m.a * x + m.c * y + m.e) / RES, y: (m.b * x + m.d * y + m.f) / RES, k: Math.hypot(m.a, m.b) / RES };
}
