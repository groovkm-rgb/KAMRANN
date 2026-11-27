// Mini 2.5D/3D canvas engine for the Noah school film.
// World units = metres, Y up. A pinhole camera projects boxes, quads, textured planes and 2D character billboards.
// Faces are flat/gradient shaded from one key light (warm) + ambient (cool); painter's sort by depth.
const W = 1920, H = 1080, FPS = 30;
const OUT = '#211c1a';
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeIO = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeBack = t => { const c1 = 1.70158, c3 = c1 + 1; t = clamp(t); return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const bump = (t, a, b) => Math.sin(Math.PI * seg(t, a, b));
function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function noise1(t, s = 0) { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return lerp(rnd(i + s * 97), rnd(i + 1 + s * 97), u) * 2 - 1; }
function line(c, pts, w = 3, col = OUT) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); }
function ell(c, x, y, rx, ry, a = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, a, 0, TAU); }
function fs(c, fill, w = 3, col = OUT) { if (fill) { c.fillStyle = fill; c.fill(); } if (w) { c.lineWidth = w; c.strokeStyle = col; c.lineJoin = 'round'; c.stroke(); } }
function hex2rgb(h) { if (Array.isArray(h)) return h; const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgb(a, al) { return al == null ? `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})` : `rgba(${a[0] | 0},${a[1] | 0},${a[2] | 0},${al})`; }
function mixc(a, b, t) { a = hex2rgb(a); b = hex2rgb(b); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
function shade(hex, k) { const a = hex2rgb(hex); return rgb(k < 0 ? a.map(v => v * (1 + k)) : a.map(v => v + (255 - v) * k)); }

// ---------- vectors ----------
const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)],
};

// ---------- camera ----------
// cam = { pos:[x,y,z], yaw (rad, 0 looks to +z, + turns right), pitch (+ looks up), roll, fov (vertical deg) or f, shake }
function makeCam(o) {
  const yaw = o.yaw || 0, pitch = o.pitch || 0, roll = o.roll || 0;
  const f = o.f || (H / 2) / Math.tan((o.fov || 50) * Math.PI / 360);
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const fwd = [sy * cp, sp, cy * cp], right = [cy, 0, -sy], up = V.cross(fwd, right);
  const cr = Math.cos(roll), sr = Math.sin(roll);
  const R = V.add(V.mul(right, cr), V.mul(up, sr)), U = V.add(V.mul(up, cr), V.mul(right, -sr));
  return { pos: o.pos, fwd, right: R, up: U, f, cx: W / 2 + (o.ox || 0), cy: H / 2 + (o.oy || 0), near: .05 };
}
// look-at helper: cam from position to target
function lookAt(pos, target, o = {}) {
  const d = V.sub(target, pos), yaw = Math.atan2(d[0], d[2]), pitch = Math.atan2(d[1], Math.hypot(d[0], d[2]));
  return makeCam(Object.assign({}, o, { pos, yaw, pitch }));
}
function toCam(cam, p) { const d = V.sub(p, cam.pos); return [V.dot(d, cam.right), V.dot(d, cam.up), V.dot(d, cam.fwd)]; }
function projC(cam, q) { return [cam.cx + cam.f * q[0] / q[2], cam.cy - cam.f * q[1] / q[2], q[2]]; }
function proj(cam, p) { const q = toCam(cam, p); return q[2] > cam.near ? projC(cam, q) : null; }
// clip a camera-space polygon at the near plane
function clipNear(poly, near) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], ia = a[2] > near, ib = b[2] > near;
    if (ia) out.push(a);
    if (ia !== ib) { const t = (near - a[2]) / (b[2] - a[2]); out.push(V.lerp(a, b, t)); }
  }
  return out;
}
function projPoly(cam, pts) {
  const q = clipNear(pts.map(p => toCam(cam, p)), cam.near);
  return q.length >= 3 ? q.map(p => projC(cam, p)) : null;
}
function pathPoly(c, sp) { c.beginPath(); c.moveTo(sp[0][0], sp[0][1]); for (let i = 1; i < sp.length; i++) c.lineTo(sp[i][0], sp[i][1]); c.closePath(); }

// ---------- scene / light ----------
// S = { cam, light: { dir (towards light), col, amb, ambCol, ink }, items: [] }
function scene(cam, light) { return { cam, light: Object.assign({ dir: V.norm([-.6, .7, -.4]), col: [255, 236, 200], amb: .55, ambCol: [150, 170, 215], ink: 1.4, inkA: .55 }, light), items: [] }; }
function litColor(S, base, n, extra = 0) {
  const L = S.light, d = Math.max(0, V.dot(n, L.dir)), b = hex2rgb(base);
  // shadow side: base * ambient tint (cool); lit side: towards base * warm light colour
  return [0, 1, 2].map(i => {
    const amb = L.amb * lerp(1, L.ambCol[i] / 255, .55), key = (1 - L.amb) * d * L.col[i] / 255 * 1.1;
    return clamp(b[i] / 255 * (amb + key + extra) * (L.gain || 1.08), 0, 1) * 255;
  });
}
function push(S, z, fn) { S.items.push({ z, fn }); }
function flush(S, c) { S.items.sort((a, b) => b.z - a.z); for (const it of S.items) it.fn(c); S.items = []; }
function depthOf(S, p) { return toCam(S.cam, p)[2]; }

// polygon face (world pts, colour) — shaded, thin ink
function face(S, pts, col, o = {}) {
  const n = o.n || V.norm(V.cross(V.sub(pts[1], pts[0]), V.sub(pts[2], pts[0])));
  const cen = pts.reduce((a, p) => V.add(a, V.mul(p, 1 / pts.length)), [0, 0, 0]);
  const toC = V.sub(S.cam.pos, cen); if (!o.two && V.dot(toC, n) < 0) return;
  const z = o.z ?? Math.hypot(...toC) + (o.bias || 0);
  push(S, z, c => drawFace(S, c, pts, col, n, o));
}
function drawFace(S, c, pts, col, n, o = {}) {
  const sp = projPoly(S.cam, pts); if (!sp) return;
  const lc = o.emit ? hex2rgb(col) : litColor(S, col, n, o.extra || 0);
  pathPoly(c, sp); c.fillStyle = rgb(lc, o.alpha); c.fill();
  if (o.grad) { // vertical ambient-occlusion / sheen gradient along the face
    const ys = sp.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(255,255,255,${o.grad[0]})`); g.addColorStop(1, `rgba(10,10,30,${o.grad[1]})`); c.fillStyle = g; c.fill();
  }
  if (o.gloss) { const xs = sp.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs); const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.35, `rgba(255,255,255,${o.gloss})`); g.addColorStop(.5, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fill(); }
  if (o.after) o.after(c, sp);
  const ink = o.ink ?? S.light.ink; if (ink > 0) { c.lineWidth = ink; c.strokeStyle = o.inkCol || `rgba(33,28,26,${S.light.inkA})`; c.lineJoin = 'round'; c.stroke(); }
}
// axis-aligned box (min corner x0,y0,z0 / size) with optional rotation about Y (ry) around its centre
function box(S, x, y, z, w, h, d, col, o = {}) {
  const ry = o.ry || 0, cx = x + w / 2, cz = z + d / 2, cs = Math.cos(ry), sn = Math.sin(ry);
  const P = (a, b, e) => { const dx = a - cx, dz = e - cz; return [cx + dx * cs + dz * sn, b, cz - dx * sn + dz * cs]; };
  const R = n => [n[0] * cs + n[2] * sn, n[1], -n[0] * sn + n[2] * cs];
  const v = [P(x, y, z), P(x + w, y, z), P(x + w, y, z + d), P(x, y, z + d), P(x, y + h, z), P(x + w, y + h, z), P(x + w, y + h, z + d), P(x, y + h, z + d)];
  const cols = o.cols || {};
  const fo = Object.assign({}, o); delete fo.cols;
  const bias = o.bias || 0;
  const add = (ids, n, key) => { if (o.skip && o.skip.includes(key)) return; face(S, ids.map(i => v[i]), cols[key] || col, Object.assign({}, fo, { n: R(n), z: o.z, bias, grad: key === 'top' ? null : o.grad, after: o.afters && o.afters[key] })); };
  // when a single sort depth is needed for the whole box, use o.z
  add([4, 7, 6, 5], [0, 1, 0], 'top'); add([0, 1, 2, 3], [0, -1, 0], 'bottom');
  add([0, 4, 5, 1], [0, 0, -1], 'front'); add([2, 6, 7, 3], [0, 0, 1], 'back');
  add([3, 7, 4, 0], [-1, 0, 0], 'left'); add([1, 5, 6, 2], [1, 0, 0], 'right');
}
// box drawn as one sorted unit (avoids face interleaving artefacts for small props)
function solid(S, x, y, z, w, h, d, col, o = {}) {
  const cen = [x + w / 2, y + h / 2, z + d / 2], zz = Math.hypot(...V.sub(S.cam.pos, cen)) + (o.bias || 0);
  const sub = { cam: S.cam, light: S.light, items: [] };
  box(sub, x, y, z, w, h, d, col, Object.assign({}, o, { bias: 0 }));
  const its = sub.items; its.sort((a, b) => b.z - a.z);
  push(S, zz, c => { for (const it of its) it.fn(c); if (o.post) o.post(c); });
}
// vertical cylinder (approx. polygons), e.g. bottle, extinguisher, table leg
function cylinder(S, x, y, z, r, h, col, o = {}) {
  const n = o.seg || 14, cen = [x, y + h / 2, z], zz = Math.hypot(...V.sub(S.cam.pos, cen)) + (o.bias || 0);
  push(S, zz, c => {
    const cam = S.cam, faces = [];
    for (let i = 0; i < n; i++) {
      const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, nn = [Math.cos((a0 + a1) / 2), 0, Math.sin((a0 + a1) / 2)];
      const pts = [[x + Math.cos(a0) * r, y, z + Math.sin(a0) * r], [x + Math.cos(a1) * r, y, z + Math.sin(a1) * r], [x + Math.cos(a1) * r, y + h, z + Math.sin(a1) * r], [x + Math.cos(a0) * r, y + h, z + Math.sin(a0) * r]];
      const cen2 = V.mul(V.add(pts[0], pts[2]), .5);
      if (V.dot(V.sub(cam.pos, cen2), nn) > 0) faces.push({ pts, nn, d: Math.hypot(...V.sub(cam.pos, cen2)) });
    }
    faces.sort((a, b) => b.d - a.d);
    for (const f of faces) drawFace(S, c, f.pts, col, f.nn, { ink: 0, gloss: 0 });
    // top cap
    const top = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; top.push([x + Math.cos(a) * r, y + h, z + Math.sin(a) * r]); }
    if (cam.pos[1] > y + h) drawFace(S, c, top, o.capCol || col, [0, 1, 0], { ink: 0 });
    // silhouette ink: project outline approx
    const sp = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU; const p = proj(cam, [x + Math.cos(a) * r, y + h, z + Math.sin(a) * r]); if (p) sp.push(p); }
    if (o.shine) { const p0 = proj(cam, [x, y, z]), p1 = proj(cam, [x, y + h, z]); if (p0 && p1) { const rr = cam.f * r / p0[2]; line(c, [p0[0] - rr * .45, p0[1] - 6, p1[0] - rr * .45, p1[1] + 6], Math.max(1, rr * .18), `rgba(255,255,255,${o.shine})`); } }
    if (o.post) o.post(c);
  });
}

// ---------- textures ----------
const TEX = {};
function makeTex(key, w, h, draw) { if (TEX[key]) return TEX[key]; const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); draw(c, w, h); TEX[key] = cv; return cv; }
// draw image onto a world quad (p0 top-left, p1 top-right, p2 bottom-right, p3 bottom-left) with subdivision
function texQuad(S, img, P, o = {}) {
  const cen = V.mul(V.add(V.add(P[0], P[1]), V.add(P[2], P[3])), .25);
  const n = V.norm(V.cross(V.sub(P[1], P[0]), V.sub(P[3], P[0])));
  if (!o.two && V.dot(V.sub(S.cam.pos, cen), n) > 0 === false && V.dot(V.sub(S.cam.pos, cen), V.mul(n, -1)) > 0 && o.cull !== false) {/* facing check below */ }
  const z = o.z ?? Math.hypot(...V.sub(S.cam.pos, cen)) + (o.bias || 0);
  const job = c => drawTexQuad(S, c, img, P, o, n);
  if (o.now) job(o.now); else push(S, z, job);
}
function drawTexQuad(S, c, img, P, o, n) {
  const cam = S.cam, nx = o.nx || 6, ny = o.ny || 6, iw = img.width, ih = img.height;
  const G = [];
  for (let j = 0; j <= ny; j++) { const row = []; for (let i = 0; i <= nx; i++) { const u = i / nx, v = j / ny; const top = V.lerp(P[0], P[1], u), bot = V.lerp(P[3], P[2], u); const q = toCam(cam, V.lerp(top, bot, v)); row.push(q[2] > cam.near ? projC(cam, q) : null); } G.push(row); }
  c.save(); if (o.alpha != null) c.globalAlpha = o.alpha; if (o.comp) c.globalCompositeOperation = o.comp;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = G[j][i], b = G[j][i + 1], d = G[j + 1][i], e = G[j + 1][i + 1]; if (!a || !b || !d || !e) continue;
    const u0 = i / nx * iw, u1 = (i + 1) / nx * iw, v0 = j / ny * ih, v1 = (j + 1) / ny * ih;
    triTex(c, img, a, b, d, u0, v0, u1, v0, u0, v1);
    triTex(c, img, b, e, d, u1, v0, u1, v1, u0, v1);
  }
  c.restore();
  if (o.lit !== false) { // shading overlay
    const sp = projPoly(cam, P); if (sp) { const L = S.light, dd = Math.max(0, V.dot(o.n || n, L.dir)); const k = clamp(L.amb + (1 - L.amb) * dd + (o.extra || 0)); pathPoly(c, sp); c.fillStyle = `rgba(${L.ambCol.map(v => v * .25 | 0).join(',')},${(1 - k) * .75})`; c.fill(); if (o.ink) { c.lineWidth = o.ink; c.strokeStyle = 'rgba(33,28,26,.6)'; c.stroke(); } }
  }
}
function triTex(c, img, p0, p1, p2, u0, v0, u1, v1, u2, v2) {
  // expand dst triangle slightly to hide seams
  const cx = (p0[0] + p1[0] + p2[0]) / 3, cy = (p0[1] + p1[1] + p2[1]) / 3, ex = (p, k = .9) => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * k, p[1] + dy / l * k]; };
  const a = ex(p0), b = ex(p1), d = ex(p2);
  c.save(); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.closePath(); c.clip();
  const den = u0 * (v2 - v1) - u1 * v2 + u2 * v1 + (u1 - u2) * v0; if (Math.abs(den) < 1e-6) { c.restore(); return; }
  const m11 = -(v0 * (p2[0] - p1[0]) - v1 * p2[0] + v2 * p1[0] + (v1 - v2) * p0[0]) / den;
  const m12 = (v1 * p2[1] + v0 * (p1[1] - p2[1]) - v2 * p1[1] + (v2 - v1) * p0[1]) / den;
  const m21 = (u0 * (p2[0] - p1[0]) - u1 * p2[0] + u2 * p1[0] + (u1 - u2) * p0[0]) / den;
  const m22 = -(u1 * p2[1] + u0 * (p1[1] - p2[1]) - u2 * p1[1] + (u2 - u1) * p0[1]) / den;
  const dx = (u0 * (v2 * p1[0] - v1 * p2[0]) + v0 * (u1 * p2[0] - u2 * p1[0]) + (u2 * v1 - u1 * v2) * p0[0]) / den;
  const dy = (u0 * (v2 * p1[1] - v1 * p2[1]) + v0 * (u1 * p2[1] - u2 * p1[1]) + (u2 * v1 - u1 * v2) * p0[1]) / den;
  c.transform(m11, m12, m21, m22, dx, dy); c.drawImage(img, 0, 0); c.restore();
}
// wall-aligned quad helpers: on plane z = const facing -z (wallZ), on plane x = const facing +x/-x
function quadZ(x0, y0, x1, y1, z) { return [[x0, y1, z], [x1, y1, z], [x1, y0, z], [x0, y0, z]]; } // seen from -z side (normal -z)
function quadX(z0, y0, z1, y1, x, facePlus = true) { return facePlus ? [[x, y1, z1], [x, y1, z0], [x, y0, z0], [x, y0, z1]] : [[x, y1, z0], [x, y1, z1], [x, y0, z1], [x, y0, z0]]; }

// ---------- billboards (2D characters at a 3D spot) ----------
// draw(c, scale) is called with the origin at the projected foot point; scale = px per metre
function billboard(S, p, draw, o = {}) {
  const q = toCam(S.cam, p); if (q[2] <= S.cam.near) return;
  const sp = projC(S.cam, q), sc = S.cam.f / q[2];
  push(S, Math.hypot(...V.sub(S.cam.pos, p)) + (o.bias || 0), c => { c.save(); c.translate(sp[0], sp[1]); draw(c, sc, sp); c.restore(); });
}

// ---------- screen effects ----------
const BUF = {};
function buf(name) { if (!BUF[name]) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; BUF[name] = { cv, c: cv.getContext('2d') }; } const b = BUF[name]; b.c.setTransform(1, 0, 0, 1, 0, 0); b.c.globalAlpha = 1; b.c.globalCompositeOperation = 'source-over'; b.c.filter = 'none'; b.c.clearRect(0, 0, W, H); return b; }
function glow(c, x, y, r, col = '255,220,150', a = .5, mode = 'screen') { if (r <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.35, `rgba(${col},${a * .35})`); g.addColorStop(1, `rgba(${col},0)`); c.save(); c.globalCompositeOperation = mode; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }
function vignette(c, a = .45, col = '10,8,20') { const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
function gradeScreen(c, o = {}) {
  const sx = (o.sx ?? .1) * W, sy = (o.sy ?? 0) * H, warm = o.warm || '255,190,110', cool = o.cool || '30,30,80';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  let g = c.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * 1.1); g.addColorStop(0, `rgba(${warm},${o.warmA ?? .28})`); g.addColorStop(1, `rgba(${warm},0)`);
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = g; c.fillRect(0, 0, W, H);
  g = c.createLinearGradient(sx, sy, W - sx, H - sy); g.addColorStop(0, `rgba(${cool},0)`); g.addColorStop(1, `rgba(${cool},${o.coolA ?? .25})`);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.restore();
}
function grain(c, t, a = .04) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const f = Math.floor(t * FPS); for (let i = 0; i < 260; i++) { const x = rnd(i + f * 13) * W, y = rnd(i * 3 + f * 7) * H; c.fillStyle = rnd(i + f) > .5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`; c.fillRect(x, y, 2, 2); } c.restore(); }
function letterbox(c, k = 1, h = 70) { if (k <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, h * k); c.fillRect(0, H - h * k, W, h * k); c.restore(); }
// dust motes inside a 3D box volume, catching light (screen blend)
function motes3D(S, c, b, t, o = {}) {
  const n = o.n || 80; c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const ph = (t * (o.speed || .02) + rnd(i + 11)) % 1;
    const p = [b[0] + rnd(i + 3) * b[3] + Math.sin(t * .5 + i) * .05, b[1] + (rnd(i + 5) * b[4] + ph * .4) % b[4], b[2] + rnd(i + 7) * b[5]];
    if (o.inside && !o.inside(p)) continue;
    const sp = proj(S.cam, p); if (!sp) continue; const r = clamp(S.cam.f * .006 / sp[2], .8, 7) * (.6 + rnd(i + 9));
    c.beginPath(); c.arc(sp[0], sp[1], r, 0, TAU); c.fillStyle = `rgba(${o.col || '255,240,200'},${(o.a || .7) * Math.sin(ph * Math.PI)})`; c.fill();
  }
  c.restore();
}
