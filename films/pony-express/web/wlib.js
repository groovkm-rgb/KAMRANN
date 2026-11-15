// wlib.js: shared world helpers for the Pony Express short (terrain, painted textures, foliage, particles, props).
export let C = null; // ctx from main.js
export const init = (ctx) => { C = ctx; };
export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
export const vnoise = (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return (hash(i, j) * (1 - u) + hash(i + 1, j) * u) * (1 - v) + (hash(i, j + 1) * (1 - u) + hash(i + 1, j + 1) * u) * v; };
export const fbm = (x, y, o = 4) => { let a = 0, s = 0.5, f = 1; for (let i = 0; i < o; i++) { a += s * vnoise(x * f, y * f); s *= 0.5; f *= 2.03; } return a; };
export const lerp = (a, b, t) => a + (b - a) * t, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// ---------- canvases / textures ----------
export const cvs = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); fn(g, w, h); return c; };
export const tex = (c, rx = 1, ry = 1, rep = true) => { const T = C.THREE, t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); } t.anisotropy = 8; return t; };
export const speckle = (g, w, h, n, cols, r0, r1, seed = 1, a = 0.5) => { const R = rng(seed); for (let i = 0; i < n; i++) { g.globalAlpha = a * (0.4 + R() * 0.6); g.fillStyle = cols[Math.floor(R() * cols.length)]; const r = r0 + R() * (r1 - r0);
  g.beginPath(); g.ellipse(R() * w, R() * h, r, r * (0.5 + R() * 0.6), R() * 3, 0, 7); g.fill(); } g.globalAlpha = 1; };
/** painted ground: base colour with blotches, specks, optional cracks */
export const groundCanvas = (base, blot, spk, seed = 1, cracks = 0, size = 512) => cvs(size, size, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); speckle(g, w, h, 90, blot, 20, 70, seed, 0.35); speckle(g, w, h, 1400, spk, 1, 3.5, seed + 1, 0.6);
  if (cracks) { const R = rng(seed + 5); g.strokeStyle = 'rgba(70,30,15,0.55)'; g.lineWidth = 2; for (let i = 0; i < cracks; i++) { let x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 7; k++) { x += (R() - 0.5) * 70; y += (R() - 0.5) * 70; g.lineTo(x, y); } g.stroke(); } }
});
export const strataCanvas = (cols, seed = 3) => cvs(256, 512, (g, w, h) => { const R = rng(seed); let y = 0; let i = 0;
  while (y < h) { const bh = 10 + R() * 40; g.fillStyle = cols[i++ % cols.length]; g.fillRect(0, y, w, bh + 1); y += bh; }
  speckle(g, w, h, 300, ['#00000022', '#ffffff22'], 2, 8, seed, 0.6);
  g.strokeStyle = 'rgba(40,10,0,0.08)'; g.lineWidth = 3; for (let k = 0; k < 10; k++) { const x = R() * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (R() - 0.5) * 30, h); g.stroke(); } });
export const logCanvas = (base = '#8a5a34', seed = 2) => cvs(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const R = rng(seed);
  for (let i = 0; i < 30; i++) { g.strokeStyle = `rgba(40,20,8,${0.15 + R() * 0.25})`; g.lineWidth = 1 + R() * 2; const y = R() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (R() - 0.5) * 8, w * 0.7, y + (R() - 0.5) * 8, w, y); g.stroke(); }
  speckle(g, w, h, 80, ['#2a1408', '#c8946a'], 1, 3, seed, 0.4); });
export const plankCanvas = (base = '#a87a4e', seed = 3, n = 6) => cvs(256, 256, (g, w, h) => { const R = rng(seed);
  for (let i = 0; i < n; i++) { const c0 = C.T.shade ? base : base; g.fillStyle = base; g.globalAlpha = 1; g.fillRect(0, i * h / n, w, h / n); g.fillStyle = `rgba(${R() > 0.5 ? '255,240,220' : '40,20,10'},${R() * 0.16})`; g.fillRect(0, i * h / n, w, h / n);
    g.fillStyle = 'rgba(40,20,10,0.6)'; g.fillRect(0, i * h / n, w, 2); for (let k = 0; k < 5; k++) { g.strokeStyle = 'rgba(60,30,10,0.18)'; g.beginPath(); const y = i * h / n + R() * h / n; g.moveTo(0, y); g.lineTo(w, y + (R() - 0.5) * 6); g.stroke(); } }
  speckle(g, w, h, 60, ['#3a1e0e'], 1, 2.5, seed, 0.5); });

// ---------- materials ----------
export const toon = (o) => C.toon(o);
export const mtex = (c, rx = 1, ry = 1, color = '#ffffff', extra = {}) => C.toon({ map: tex(c, rx, ry), color, ...extra });
export const basic = (o) => new C.THREE.MeshBasicMaterial(o);
/** nd material for alpha-cutout / instanced meshes (depth only, never inked) */
export const ndAlpha = (map, inst = false) => new C.THREE.ShaderMaterial({ uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 p = vec4(position,1.);
    #ifdef USE_INSTANCING
      p = instanceMatrix * p;
    #endif
    vec4 mv = modelViewMatrix*p; vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`, side: C.THREE.DoubleSide });
/** nd material for solid instanced meshes (normal + depth so they can be inked) */
export const ndInst = () => new C.THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vec4 p = vec4(position,1.); vec3 n = normal;
    #ifdef USE_INSTANCING
      p = instanceMatrix * p; n = mat3(instanceMatrix) * n;
    #endif
    vN = normalize(normalMatrix*n); vec4 mv = modelViewMatrix*p; vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`, side: C.THREE.DoubleSide });

// ---------- geometry helpers ----------
export const add = (geo, mat, x, y, z, parent, opts) => C.add(geo, mat, x, y, z, parent, opts);
export const group = (parent, x = 0, y = 0, z = 0, ry = 0) => { const g = new C.THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
/** terrain plane (w along x, d along z) displaced by h(x,z); vertex colours from col(x,z,y) -> [r,g,b] 0..1 */
export const terrain = (parent, w, d, sx, sz, h, mat, col = null, cx = 0, cz = 0) => {
  const T = C.THREE, geo = new T.PlaneGeometry(w, d, sx, sz); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, cols = col ? new Float32Array(pos.count * 3) : null;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) + cx, z = pos.getZ(i) + cz, y = h(x, z); pos.setY(i, y); if (col) { const c = col(x, z, y); cols[i * 3] = c[0]; cols[i * 3 + 1] = c[1]; cols[i * 3 + 2] = c[2]; } }
  if (col) { geo.setAttribute('color', new T.BufferAttribute(cols, 3)); mat.vertexColors = true; }
  geo.computeVertexNormals(); const m = add(geo, mat, cx, 0, cz, parent, { cast: false }); m.receiveShadow = true; return m;
};
/** instanced crossed-plane tufts (grass, sage, snow tufts) */
export const tufts = (parent, n, place, canv, size = [0.5, 1], seed = 1, tints = ['#ffffff']) => {
  const T = C.THREE, map = tex(canv, 1, 1, false), geo = new T.PlaneGeometry(1, 1); geo.translate(0, 0.5, 0);
  const g2 = geo.clone(); g2.rotateY(Math.PI / 2); const merged = mergeGeos([geo, g2]);
  const mat = new T.MeshLambertMaterial({ map, alphaTest: 0.5, side: T.DoubleSide });
  const im = new T.InstancedMesh(merged, mat, n), R = rng(seed), m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), col = new T.Color();
  let k = 0; for (let i = 0; i < n * 3 && k < n; i++) { const p = place(R); if (!p) continue; const s = size[0] + R() * (size[1] - size[0]);
    e.set((R() - 0.5) * 0.25, R() * Math.PI, (R() - 0.5) * 0.25); q.setFromEuler(e); m4.compose(new T.Vector3(p[0], p[1], p[2]), q, new T.Vector3(s * (0.8 + R() * 0.5), s, s)); im.setMatrixAt(k, m4);
    col.set(tints[Math.floor(R() * tints.length)]); im.setColorAt(k, col); k++; }
  im.count = k; im.userData.nd = ndAlpha(map, true); im.castShadow = false; im.receiveShadow = true; parent.add(im); return im;
};
/** instanced solid meshes (rocks, pebbles) */
export const scatter = (parent, n, geo, mat, place, seed = 1, cast = true) => {
  const T = C.THREE, im = new T.InstancedMesh(geo, mat, n), R = rng(seed), m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(); let k = 0;
  for (let i = 0; i < n * 3 && k < n; i++) { const p = place(R); if (!p) continue; e.set(R() * 0.6, R() * 6.3, R() * 0.6); q.setFromEuler(e); const s = p[3] || 1; m4.compose(new T.Vector3(p[0], p[1], p[2]), q, new T.Vector3(s * (0.7 + R() * 0.6), s * (0.5 + R() * 0.5), s * (0.7 + R() * 0.6))); im.setMatrixAt(k++, m4); }
  im.count = k; im.userData.nd = ndInst(); im.castShadow = cast; im.receiveShadow = true; parent.add(im); return im;
};
export const mergeGeos = (geos) => { const T = C.THREE; let n = 0; geos.forEach((g) => { n += g.index ? g.index.count : g.attributes.position.count; });
  const pos = [], nor = [], uv = []; for (const g0 of geos) { const g = g0.index ? g0.toNonIndexed() : g0; pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); uv.push(...g.attributes.uv.array); }
  const out = new T.BufferGeometry(); out.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); out.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); return out; };

// ---------- tuft canvases ----------
export const grassCanvas = (cols = ['#b8a04a', '#d8c070', '#8a8a3a'], seed = 1, n = 40) => cvs(128, 128, (g, w, h) => { const R = rng(seed);
  for (let i = 0; i < n; i++) { const x = w * 0.5 + (R() - 0.5) * w * 0.7, bh = h * (0.4 + R() * 0.6), lean = (R() - 0.5) * 40; g.strokeStyle = cols[i % cols.length]; g.lineWidth = 2 + R() * 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + lean * 0.3, h - bh * 0.5, x + lean, h - bh); g.stroke(); } });
export const sageCanvas = (base = '#8a9a6a', seed = 2) => cvs(128, 128, (g, w, h) => { const R = rng(seed);
  for (let i = 0; i < 26; i++) { const x = w * 0.5 + (R() - 0.5) * w * 0.75, y = h * 0.45 + (R() - 0.3) * h * 0.5, r = 9 + R() * 14; g.fillStyle = i % 3 ? base : '#6a7a52'; g.beginPath(); g.ellipse(x, y, r, r * 0.8, 0, 0, 7); g.fill(); }
  g.strokeStyle = '#5a4a32'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2 + (R() - 0.5) * 60, h * 0.6); g.stroke(); } });

// ---------- particles ----------
export const softCanvas = (r = 255, gg = 255, b = 255, hard = 0.0) => cvs(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(hard, `rgba(${r},${gg},${b},${hard ? 1 : 0.8})`); gr.addColorStop(0.55, `rgba(${r},${gg},${b},0.35)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
/** point-sprite system. set(i, x,y,z, size_m, alpha, r,g,b) then commit(n). */
export const particles = (parent, n, canv, additive = false) => {
  const T = C.THREE, geo = new T.BufferGeometry();
  const pos = new Float32Array(n * 3), size = new Float32Array(n), alpha = new Float32Array(n), col = new Float32Array(n * 3).fill(1);
  geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('size', new T.BufferAttribute(size, 1)); geo.setAttribute('alpha', new T.BufferAttribute(alpha, 1)); geo.setAttribute('col', new T.BufferAttribute(col, 3));
  const mat = new T.ShaderMaterial({ uniforms: { map: { value: tex(canv, 1, 1, false) }, scale: { value: 1000 } }, transparent: true, depthWrite: false, blending: additive ? T.AdditiveBlending : T.NormalBlending,
    vertexShader: `attribute float size; attribute float alpha; attribute vec3 col; uniform float scale; varying float vA; varying vec3 vC;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*mv; gl_PointSize = min(size*scale/max(-mv.z,.05), 1000.); vA = alpha; vC = col; if (alpha <= 0.001) gl_PointSize = 0.; }`,
    fragmentShader: `uniform sampler2D map; varying float vA; varying vec3 vC; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC*t.rgb, t.a*vA); }` });
  const pts = new T.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 6; parent.add(pts);
  return { pts, n, set(i, x, y, z, s, a, r = 1, g = 1, b = 1) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; size[i] = s; alpha[i] = a; col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b; },
    clear() { alpha.fill(0); }, commit() { geo.attributes.position.needsUpdate = geo.attributes.size.needsUpdate = geo.attributes.alpha.needsUpdate = geo.attributes.col.needsUpdate = true;
      const cam = C.camera; mat.uniforms.scale.value = 1920 / (2 * Math.tan(cam.fov * Math.PI / 360)); } };
};
/** camera-facing plane with a canvas (clouds, flares, signs that must face camera) */
export const billboard = (parent, canv, w, h, x, y, z, o = {}) => { const T = C.THREE, m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex(canv, 1, 1, false), transparent: true, depthWrite: false, fog: o.fog ?? false, blending: o.add ? T.AdditiveBlending : T.NormalBlending, opacity: o.opacity ?? 1, color: o.color || '#ffffff' }));
  m.position.set(x, y, z); m.userData.ndSkip = true; m.renderOrder = o.order ?? -1; parent.add(m); if (o.face !== false) C.clouds.push(m); return m; };
/** painted cloud canvas tinted */
export const cloudCanvas = (seed, top = '#ffffff', bot = '#d8c8e0', dark = false) => cvs(512, 256, (g, w, h) => { const R = rng(seed);
  const gr = g.createLinearGradient(0, 40, 0, 230); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr;
  for (let i = 0; i < 9; i++) { const x = 80 + R() * 350, y = 110 + R() * 70, r = 40 + R() * 60; g.beginPath(); g.ellipse(x, y, r * 1.3, r, 0, 0, 7); g.fill(); }
  g.beginPath(); g.ellipse(256, 190, 220, 40, 0, 0, 7); g.fill(); if (dark) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(20,20,30,0.25)'; g.fillRect(0, 170, w, 90); } });

// ---------- props ----------
/** telegraph pole: returns {g, top:[x,y,z] insulator points} */
export const pole = (parent, x, z, h = 6.5, mat, ry = 0, ins = true) => {
  const T = C.THREE, g = group(parent, x, 0, z, ry);
  add(new T.CylinderGeometry(0.11, 0.15, h, 8), mat, 0, h / 2, 0, g);
  add(new T.BoxGeometry(1.5, 0.12, 0.12), mat, 0, h - 0.45, 0, g);
  if (ins) for (const sx of [-0.6, 0.6]) add(new T.CylinderGeometry(0.05, 0.06, 0.16, 8), C.toon({ color: '#5ab0a0' }), sx, h - 0.3, 0, g, { cast: false });
  return g;
};
/** catenary wire between points as a thin tube */
export const wire = (parent, pts, mat, r = 0.018, sag = 0.35) => { const T = C.THREE, path = [];
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; for (let k = 0; k < 10; k++) { const t = k / 10; path.push(new T.Vector3(lerp(a[0], b[0], t), lerp(a[1], b[1], t) - sag * 4 * t * (1 - t), lerp(a[2], b[2], t))); } }
  path.push(new T.Vector3(...pts[pts.length - 1])); const curve = new T.CatmullRomCurve3(path);
  const m = add(new T.TubeGeometry(curve, path.length * 2, r, 5, false), mat, 0, 0, 0, parent, { cast: false }); m.userData.curve = curve; return m; };
/** log-cabin wall builder: horizontal logs */
export const logWall = (parent, w, h, x, y, z, ry, mat, r = 0.16) => { const T = C.THREE, g = group(parent, x, y, z, ry);
  for (let yy = r; yy < h; yy += r * 1.9) { const m = add(new T.CylinderGeometry(r, r, w + 0.5, 10), mat, 0, yy, 0, g); m.rotation.z = Math.PI / 2; } return g; };
/** painted wooden sign texture (German text) */
export const signCanvas = (text, w = 1024, h = 300, o = {}) => cvs(w, h, (g) => {
  g.fillStyle = o.bg || '#6a4224'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 26); g.fill();
  const R = rng(o.seed || 4); for (let i = 0; i < 12; i++) { g.strokeStyle = `rgba(30,14,6,${0.2 + R() * 0.25})`; g.lineWidth = 2; const y = 20 + R() * (h - 40); g.beginPath(); g.moveTo(20, y); g.lineTo(w - 20, y + (R() - 0.5) * 6); g.stroke(); }
  g.strokeStyle = 'rgba(20,10,4,0.7)'; g.lineWidth = 6; g.beginPath(); g.roundRect(26, 26, w - 52, h - 52, 18); g.stroke();
  g.font = `${o.weight || 'bold'} ${o.size || 150}px ${o.font || '"Rye","Georgia","DejaVu Serif",serif'}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = o.stroke ?? 14; g.strokeStyle = o.ink || '#2a140a'; g.strokeText(text, w / 2, h / 2 + 8); g.fillStyle = o.fg || '#f4e2b0'; g.fillText(text, w / 2, h / 2 + 8);
  for (const [nx, ny] of [[44, 44], [w - 44, 44], [44, h - 44], [w - 44, h - 44]]) { g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(nx, ny, 9, 0, 7); g.fill(); }
});
export const signMesh = (parent, canv, w, h, x, y, z, ry = 0, backMat = null) => { const T = C.THREE, g = group(parent, x, y, z, ry);
  if (backMat) add(new T.BoxGeometry(w + 0.08, h + 0.08, 0.08), backMat, 0, 0, -0.05, g);
  const m = add(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex(canv, 1, 1, false) }), 0, 0, 0.005, g, { cast: false }); m.userData.ndSkip = true; return g; };
/** saguaro cactus */
export const cactus = (parent, x, z, h, mat, seed = 1, y = 0) => { const T = C.THREE, g = group(parent, x, y, z, seed), R = rng(seed);
  add(new T.CapsuleGeometry(0.22 * h / 4, h - 0.5, 4, 10), mat, 0, h / 2, 0, g);
  const arms = 1 + Math.floor(R() * 2); for (let i = 0; i < arms; i++) { const s = i % 2 ? 1 : -1, ay = h * (0.4 + R() * 0.2), ah = h * (0.25 + R() * 0.2);
    const a1 = add(new T.CapsuleGeometry(0.15 * h / 4, 0.5, 4, 8), mat, s * 0.45, ay, 0, g); a1.rotation.z = Math.PI / 2;
    add(new T.CapsuleGeometry(0.15 * h / 4, ah, 4, 8), mat, s * 0.75, ay + ah / 2, 0, g); } return g; };
/** butte / mesa: tapered cylinder with flat top */
export const mesa = (parent, x, z, r, h, mat, topMat, seg = 9, seed = 1) => { const T = C.THREE, geo = new T.CylinderGeometry(r * 0.82, r, h, seg, 4); const pos = geo.attributes.position, R = rng(seed);
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); if (Math.abs(y) < h / 2 - 0.01) { const k = 1 + (R() - 0.5) * 0.12; pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k); } }
  geo.computeVertexNormals(); const m = add(geo, mat, x, h / 2 - 1, z, parent); m.castShadow = false;
  const t = add(new T.CylinderGeometry(r * 0.84, r * 0.82, 0.6, seg), topMat, x, h - 1 + 0.3, z, parent); t.castShadow = false; return m; };

/** eroded rock pillar / mesa: organic radius noise + strata ledges; flat top optional */
export const rock = (parent, x, z, r, h, mat, seed = 1, o = {}) => { const T = C.THREE, seg = o.seg || 14, hs = o.hs || 10;
  const geo = new T.CylinderGeometry(r * (o.top ?? 0.75), r, h, seg, hs, false); const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i), a = Math.atan2(pz, px), yy = (py + h / 2) / h;
    let k = 1 + (fbm(Math.cos(a) * 1.5 + seed, Math.sin(a) * 1.5 + yy * 2.5) - 0.5) * 0.55 + Math.sin(yy * (o.led || 7) * Math.PI) * 0.05;
    if (Math.abs(py) > h / 2 - 0.01 && py > 0) k *= 0.97; pos.setX(i, px * k); pos.setZ(i, pz * k); if (py > h / 2 - 0.01) pos.setY(i, py + (fbm(px * 0.1 + seed, pz * 0.1) - 0.5) * h * 0.05); }
  geo.computeVertexNormals(); const m = add(geo, mat, x, h / 2 - (o.sink ?? 1), z, parent); m.castShadow = o.cast ?? false; m.rotation.y = seed; return m; };

/** crowd of character cards: variants [{spec, opts}], spots [[x,z,s?],...]; faces `face` point. returns {update(f)} for bobbing */
export const crowd = (parent, variants, spots, face, o = {}) => {
  const T = C.THREE, n = variants.length, ims = [], data = [];
  const maps = variants.map((v) => { const c = cvs(300, 500, (g) => { g.scale(0.5, 0.5); C.T.toonChar({ g }, typeof v.spec === 'string' ? C.T.WEST[v.spec] : v.spec, v.opts || {}); }); return tex(c, 1, 1, false); });
  const geo = new T.PlaneGeometry(1.35, 2.25); geo.translate(0, 2.25 / 2 - 0.05, 0);
  const per = variants.map(() => []); spots.forEach((s, i) => per[(s[3] ?? i) % n].push(s));
  per.forEach((list, k) => { if (!list.length) return; const mat = new T.MeshBasicMaterial({ map: maps[k], alphaTest: 0.5, side: T.DoubleSide, color: o.tint || '#ffffff', fog: true });
    const im = new T.InstancedMesh(geo, mat, list.length); im.userData.nd = ndAlpha(maps[k], true); im.castShadow = o.cast ?? true; im.receiveShadow = false; parent.add(im); ims.push(im); data.push(list); });
  const m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), v = new T.Vector3(), sc = new T.Vector3();
  const update = (f, amp = 0.04, speed = 0.3, jump = 0) => { ims.forEach((im, k) => { data[k].forEach((s, i) => { const ph = s[0] * 1.7 + s[1] * 2.3;
      const b = Math.abs(Math.sin(f * speed + ph)) * amp + (jump ? Math.max(0, Math.sin(f * 0.35 + ph)) * jump : 0);
      e.set(0, Math.atan2(face[0] - s[0], face[2] - s[1]), Math.sin(f * 0.11 + ph) * 0.04); q.setFromEuler(e); const ss = s[2] || 1;
      m4.compose(v.set(s[0], b, s[1]), q, sc.set(ss, ss, ss)); im.setMatrixAt(i, m4); }); im.instanceMatrix.needsUpdate = true; }); };
  update(0); return { update, ims };
};
/** western false-front building facing +z (local), width w, depth d, height h; returns group */
export const falseFront = (parent, x, z, ry, w, d, h, col, seed = 1, o = {}) => { const T = C.THREE, g = group(parent, x, 0, z, ry), R = rng(seed);
  const wall = mtex(plankCanvas(col, seed, 10), w / 2, h / 2), trim = toon({ color: o.trim || '#efe4cc' }), dark = toon({ color: '#2a2230' }), wood = toon({ color: '#6a4a32' });
  add(new T.BoxGeometry(w, h * 0.8, d), wall, 0, h * 0.4, -d / 2, g);
  add(new T.BoxGeometry(w, h, 0.18), wall, 0, h / 2, 0.02, g); // the tall false front
  add(new T.BoxGeometry(w + 0.2, 0.22, 0.3), trim, 0, h, 0.05, g); add(new T.BoxGeometry(w + 0.1, 0.14, 0.24), trim, 0, h * 0.62, 0.08, g);
  // door + windows
  add(new T.BoxGeometry(1.1, 2.2, 0.1), toon({ color: o.door || '#5a3a24' }), 0, 1.1 + 0.3, 0.12, g);
  for (const sx of [-1, 1]) { add(new T.BoxGeometry(1.25, 1.5, 0.1), trim, sx * w * 0.3, 1.9, 0.12, g); add(new T.BoxGeometry(1.0, 1.25, 0.12), dark, sx * w * 0.3, 1.9, 0.14, g);
    add(new T.BoxGeometry(1.25, 1.2, 0.1), trim, sx * w * 0.3, h * 0.72 + 0.4, 0.12, g); add(new T.BoxGeometry(1.0, 0.95, 0.12), dark, sx * w * 0.3, h * 0.72 + 0.4, 0.14, g); }
  // porch roof + posts + boardwalk
  if (o.porch !== false) { const pr = add(new T.BoxGeometry(w, 0.12, 2.2), wood, 0, 3.2, 1.1, g); pr.rotation.x = -0.12;
    for (const sx of [-w / 2 + 0.2, w / 2 - 0.2, 0]) add(new T.CylinderGeometry(0.08, 0.08, 3.2, 6), wood, sx, 1.6, 2.1, g);
    add(new T.BoxGeometry(w, 0.3, 2.4), mtex(plankCanvas('#8a6440', seed + 3, 8), w / 2, 1), 0, 0.15, 1.1, g); }
  // awning stripes or barrels on the boardwalk
  if (R() > 0.5) for (let k = 0; k < 2; k++) add(new T.CylinderGeometry(0.3, 0.3, 0.8, 10), toon({ color: '#8a5a30' }), -w / 2 + 0.6 + k * 0.65, 0.7, 1.7, g);
  return g;
};
/** simple fence along points (posts + 2 rails) */
export const fence = (parent, pts, mat, h = 1.2) => { const T = C.THREE; for (let i = 0; i < pts.length; i++) { const [x, z] = pts[i]; add(new T.CylinderGeometry(0.07, 0.09, h + 0.2, 6), mat, x, h / 2, z, parent);
  if (i) { const [x0, z0] = pts[i - 1], L = Math.hypot(x - x0, z - z0); for (const yy of [h * 0.45, h * 0.88]) { const r = add(new T.BoxGeometry(L, 0.09, 0.06), mat, (x + x0) / 2, yy, (z + z0) / 2, parent); r.rotation.y = -Math.atan2(z - z0, x - x0); } } } };
/** log cabin (local front = +z) */
export const cabin = (parent, x, z, ry, w, d, h, logMat, roofMat, o = {}) => { const T = C.THREE, g = group(parent, x, 0, z, ry);
  logWall(g, w, h, 0, 0, d / 2, 0, logMat, o.r || 0.17); logWall(g, w, h, 0, 0, -d / 2, 0, logMat, o.r || 0.17); logWall(g, d, h, -w / 2, 0, 0, Math.PI / 2, logMat, o.r || 0.17); logWall(g, d, h, w / 2, 0, 0, Math.PI / 2, logMat, o.r || 0.17);
  const roof = new T.Shape(); roof.moveTo(-w / 2 - 0.5, 0); roof.lineTo(0, h * 0.55); roof.lineTo(w / 2 + 0.5, 0); roof.lineTo(-w / 2 - 0.5, 0);
  const rg = new T.ExtrudeGeometry(roof, { depth: d + 1, bevelEnabled: false }); rg.translate(0, h, -(d + 1) / 2); add(rg, roofMat, 0, 0, 0, g);
  add(new T.BoxGeometry(1.1, 2.1, 0.12), toon({ color: o.door || '#4a2e1a' }), o.doorX || 0, 1.05, d / 2 + 0.2, g);
  for (const sx of o.win || [-w * 0.3, w * 0.3]) { add(new T.BoxGeometry(0.9, 0.8, 0.12), toon({ color: '#d8c8a0' }), sx, 1.6, d / 2 + 0.2, g); add(new T.BoxGeometry(0.7, 0.62, 0.14), toon({ color: o.winCol || '#2a2430', emissive: o.winGlow || '#000000', emissiveIntensity: o.winGlow ? 1.2 : 0 }), sx, 1.6, d / 2 + 0.22, g); }
  add(new T.BoxGeometry(0.6, 1.6, 0.6), toon({ color: '#7a6a5a' }), w * 0.3, h + h * 0.4, -d * 0.2, g); // chimney
  return g;
};
