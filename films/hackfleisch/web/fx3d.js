// fx3d.js: shared 3D helpers for all sets (glows, beams, particles, sparks, steam, text planes, instancing).
// Everything here is deterministic: positions are pure functions of the frame number.
export const rngF = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
export const hash = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

let TEX = null;
export function makeFx(ctx) {
  const { THREE } = ctx;
  const ct = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  if (!TEX) TEX = {
    dot: ct(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }),
    spark: ct(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.18, 'rgba(255,255,255,.9)'); r.addColorStop(0.4, 'rgba(255,255,255,.2)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }),
    glow: ct(256, 256, (g) => { const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.12, 'rgba(255,255,255,.7)'); r.addColorStop(0.4, 'rgba(255,255,255,.18)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); }),
    smoke: ct(256, 256, (g) => { const R = rngF(9); for (let i = 0; i < 26; i++) { const x = 128 + (R() - 0.5) * 110, y = 128 + (R() - 0.5) * 110, rr = 30 + R() * 60; const r = g.createRadialGradient(x, y, 0, x, y, rr); r.addColorStop(0, 'rgba(255,255,255,.22)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); } }),
    pool: ct(256, 256, (g) => { const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(0.55, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); }),
    drop: ct(32, 64, (g) => { const r = g.createLinearGradient(0, 0, 0, 64); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(1, 'rgba(255,255,255,.9)'); g.fillStyle = r; g.fillRect(12, 0, 8, 64); }),
  };
  const skip = (o) => { o.userData.ndSkip = true; o.castShadow = false; o.receiveShadow = false; return o; };

  /** camera-facing additive glow */
  const glow = (parent, pos, color, size, op = 1, opts = {}) => {
    const m = new THREE.SpriteMaterial({ map: TEX[opts.tex || 'glow'], color, transparent: true, opacity: op, blending: opts.normal ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, depthTest: opts.depthTest ?? true, fog: opts.fog ?? false });
    const s = new THREE.Sprite(m); s.position.set(...pos); s.scale.set(size, size, 1); s.renderOrder = opts.order ?? 5; parent.add(s); return s;
  };
  /** flat additive quad (floor light pools, projected windows). rotX = -PI/2 for floors */
  const quad = (parent, pos, w, h, color, op = 1, opts = {}) => {
    const mat = new THREE.MeshBasicMaterial({ map: opts.map || TEX[opts.tex || 'pool'], color, transparent: true, opacity: op, blending: opts.normal ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, fog: opts.fog ?? false, side: THREE.DoubleSide });
    const m = skip(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)); m.position.set(...pos); if (opts.rx !== undefined) m.rotation.x = opts.rx; if (opts.ry !== undefined) m.rotation.y = opts.ry; if (opts.rz !== undefined) m.rotation.z = opts.rz;
    m.renderOrder = opts.order ?? 4; parent.add(m); return m;
  };
  /** volumetric light cone: apex at origin, opening toward local -Y. Orient the returned group with .lookAt-like helpers. */
  const beamMat = (color, op) => new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(color) }, op: { value: op }, soft: { value: 1.0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: `varying float vV; varying vec3 vN; varying vec3 vVd; void main(){ vV = uv.y; vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vVd = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 col; uniform float op, soft; varying float vV; varying vec3 vN; varying vec3 vVd;
      void main(){ float along = pow(vV, 1.6); float edge = pow(abs(dot(normalize(vN), normalize(vVd))), soft*1.4); float a = op*along*edge; gl_FragColor = vec4(col*a, a); }`,
  });
  const beam = (parent, pos, len, r0, r1, color, op = 0.5) => {
    const g = new THREE.Group(); g.position.set(...pos); parent.add(g);
    const geo = new THREE.CylinderGeometry(r0, r1, len, 32, 1, true); geo.translate(0, -len / 2, 0);
    const m = skip(new THREE.Mesh(geo, beamMat(color, op))); m.renderOrder = 6; g.add(m); g.userData.mesh = m;
    g.aim = (x, y, z) => { // point the cone's -Y axis at a world target
      const t = new THREE.Vector3(x, y, z), p = new THREE.Vector3(); g.getWorldPosition(p);
      const dir = t.sub(p).normalize(); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      const pq = new THREE.Quaternion(); if (g.parent) g.parent.getWorldQuaternion(pq); g.quaternion.copy(pq.invert().multiply(q));
    };
    g.setOp = (o) => { m.material.uniforms.op.value = o; };
    return g;
  };
  /** generic point particles. place(i, f) returns [x,y,z,bright] in the parent's space */
  const points = (parent, n, opts = {}) => {
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: opts.size || 0.05, map: TEX[opts.tex || 'dot'], vertexColors: true, transparent: true, depthWrite: false, blending: opts.normal ? THREE.NormalBlending : THREE.AdditiveBlending, fog: opts.fog ?? false, sizeAttenuation: true, opacity: opts.op ?? 1 });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = opts.order ?? 7; parent.add(pts);
    const base = new THREE.Color(opts.color || '#ffffff');
    pts.run = (f, place) => { for (let i = 0; i < n; i++) { const r = place(i, f); if (!r) { pos[i * 3 + 1] = -9999; continue; } pos[i * 3] = r[0]; pos[i * 3 + 1] = r[1]; pos[i * 3 + 2] = r[2]; const b = r[3] ?? 1, c = r[4] || base; col[i * 3] = c.r * b; col[i * 3 + 1] = c.g * b; col[i * 3 + 2] = c.b * b; } geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; };
    return pts;
  };
  /** spark streaks: line segments. place(i,f) returns [x,y,z, vx,vy,vz, bright] */
  const streaks = (parent, n, color = '#ffb040') => {
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 6), col = new Float32Array(n * 6);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const ls = new THREE.LineSegments(geo, mat); ls.frustumCulled = false; ls.renderOrder = 8; parent.add(ls);
    const c0 = new THREE.Color(color), c1 = new THREE.Color('#fff4c0');
    ls.run = (f, place) => { for (let i = 0; i < n; i++) { const r = place(i, f); const k = i * 6; if (!r) { pos.fill(0, k, k + 6); col.fill(0, k, k + 6); continue; }
      pos[k] = r[0]; pos[k + 1] = r[1]; pos[k + 2] = r[2]; pos[k + 3] = r[0] - r[3]; pos[k + 4] = r[1] - r[4]; pos[k + 5] = r[2] - r[5]; const b = r[6] ?? 1;
      col[k] = c1.r * b; col[k + 1] = c1.g * b; col[k + 2] = c1.b * b; col[k + 3] = c0.r * b * 0.4; col[k + 4] = c0.g * b * 0.4; col[k + 5] = c0.b * b * 0.4; }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; };
    return ls;
  };
  /** soft smoke / steam / mist puffs as sprites (normal blending). place(i,f) -> [x,y,z,size,opacity] */
  const puffs = (parent, n, color = '#ffffff', opts = {}) => {
    const list = []; for (let i = 0; i < n; i++) { const m = new THREE.SpriteMaterial({ map: TEX[opts.tex || 'smoke'], color, transparent: true, depthWrite: false, fog: opts.fog ?? true, blending: opts.add ? THREE.AdditiveBlending : THREE.NormalBlending }); const s = new THREE.Sprite(m); s.material.rotation = i * 1.7; s.renderOrder = opts.order ?? 6; parent.add(s); list.push(s); }
    const grp = { list, run: (f, place) => list.forEach((s, i) => { const r = place(i, f); if (!r || r[4] <= 0.003) { s.visible = false; return; } s.visible = true; s.position.set(r[0], r[1], r[2]); s.scale.set(r[3], r[3], 1); s.material.opacity = r[4]; s.material.rotation = i * 1.7 + f * 0.004 * ((i % 2) * 2 - 1); }) };
    return grp;
  };
  /** unlit text / picture plane (readable signs). draw(g,w,h) */
  const sign = (parent, pos, w, h, pxW, pxH, draw, opts = {}) => {
    const t = ctx.canvasTex(pxW, pxH, draw);
    const mat = opts.lit ? new THREE.MeshToonMaterial({ gradientMap: ctx.grad, map: t, transparent: !!opts.alpha, alphaTest: opts.alpha ? 0.3 : 0 }) : new THREE.MeshBasicMaterial({ map: t, color: opts.color || '#ffffff', transparent: !!opts.alpha, alphaTest: opts.alpha ? 0.3 : 0, fog: opts.fog ?? true, side: opts.double ? THREE.DoubleSide : THREE.FrontSide });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(...pos); if (opts.ry !== undefined) m.rotation.y = opts.ry; if (opts.rx !== undefined) m.rotation.x = opts.rx; if (opts.rz !== undefined) m.rotation.z = opts.rz;
    m.userData.ndSkip = opts.nd ? false : true; m.castShadow = false; parent.add(m); m.tex = t; return m;
  };
  /** instanced copies of one geometry: list of {p:[x,y,z], r:[rx,ry,rz], s:[sx,sy,sz] | number, c?:color} */
  const inst = (parent, geo, mat, list, opts = {}) => {
    const im = new THREE.InstancedMesh(geo, mat, list.length); const o = new THREE.Object3D();
    list.forEach((it, i) => { o.position.set(...it.p); o.rotation.set(...(it.r || [0, 0, 0])); const s = it.s ?? 1; if (typeof s === 'number') o.scale.setScalar(s); else o.scale.set(...s); o.updateMatrix(); im.setMatrixAt(i, o.matrix); if (it.c) im.setColorAt(i, new THREE.Color(it.c)); });
    im.castShadow = opts.cast ?? true; im.receiveShadow = true; if (opts.noink) im.userData.ndSkip = true; parent.add(im); return im;
  };
  return { TEX, glow, quad, beam, points, streaks, puffs, sign, inst, skip };
}

// ---------- shared painted textures (canvas) ----------
export const paint = {
  wallpaper: (g, w, h, base = '#d8c89a', flower = '#c0606a', leaf = '#6a8a4a') => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x, 0, 10, h); }
    const R = rngF(3);
    for (let y = 0; y < h; y += 96) for (let x = 0; x < w; x += 96) { const ox = (y / 96) % 2 ? 48 : 0, cx = x + ox + 48, cy = y + 48;
      g.strokeStyle = leaf; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 20, cy + 26); g.quadraticCurveTo(cx - 4, cy, cx, cy - 4); g.stroke();
      g.fillStyle = leaf; g.beginPath(); g.ellipse(cx - 16, cy + 12, 10, 5, -0.6, 0, 7); g.fill();
      g.fillStyle = flower; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + R() * 0.2; g.beginPath(); g.ellipse(cx + Math.cos(a) * 9, cy - 4 + Math.sin(a) * 9, 8, 6, a, 0, 7); g.fill(); }
      g.fillStyle = '#f2d070'; g.beginPath(); g.arc(cx, cy - 4, 5, 0, 7); g.fill(); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(90,60,30,${0.03 + R() * 0.05})`; g.beginPath(); g.ellipse(R() * w, R() * h, 20 + R() * 60, 10 + R() * 40, 0, 0, 7); g.fill(); }
  },
  tiles: (g, w, h, a = '#e8e4da', b = '#b8c4c0', n = 8) => { const s = w / n; for (let y = 0; y < h / s; y++) for (let x = 0; x < n; x++) { g.fillStyle = (x + y) % 2 ? a : b; g.fillRect(x * s, y * s, s, s); g.strokeStyle = 'rgba(60,60,60,.35)'; g.lineWidth = 3; g.strokeRect(x * s, y * s, s, s); } },
  concrete: (g, w, h, base = '#8a8e8c', seed = 4) => { const R = rngF(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) { const v = R() < 0.5 ? 0 : 255; g.fillStyle = `rgba(${v},${v},${v},${0.02 + R() * 0.05})`; g.beginPath(); g.ellipse(R() * w, R() * h, 6 + R() * 50, 4 + R() * 30, R() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 18; i++) { g.strokeStyle = `rgba(40,40,40,${0.15 + R() * 0.2})`; g.lineWidth = 1 + R() * 2; g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (R() - 0.5) * 50; y += R() * 30; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 10; i++) { const x = R() * w; const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(30,40,30,0)'); gr.addColorStop(1, 'rgba(30,40,30,.18)'); g.fillStyle = gr; g.fillRect(x, R() * h * 0.5, 6 + R() * 14, h); } },
  blocks: (g, w, h, base = [210, 6, 50], bw = 128, bh = 64, seed = 5) => { const R = rngF(seed); g.fillStyle = '#2e3032'; g.fillRect(0, 0, w, h);
    for (let row = 0; row < h / bh; row++) for (let col = -1; col < w / bw + 1; col++) { const x = col * bw + (row % 2) * bw / 2, y = row * bh, L = base[2] - 7 + R() * 14;
      g.fillStyle = `hsl(${base[0] + R() * 8 - 4},${base[1]}%,${L}%)`; g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
      g.fillStyle = `hsla(${base[0]},${base[1]}%,${L + 8}%,.6)`; g.fillRect(x + 5, y + 4, bw - 10, 4);
      for (let k = 0; k < 8; k++) { g.fillStyle = `hsla(${base[0]},${base[1]}%,${L - 10 - R() * 10}%,.5)`; g.beginPath(); g.ellipse(x + R() * bw, y + R() * bh, 2 + R() * 6, 1 + R() * 4, 0, 0, 7); g.fill(); } }
    for (let i = 0; i < 14; i++) { const x = R() * w; const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(20,24,20,0)'); gr.addColorStop(1, 'rgba(20,24,20,.25)'); g.fillStyle = gr; g.fillRect(x, R() * h * 0.6, 4 + R() * 16, h); } },
  metal: (g, w, h, base = '#6a7076', seed = 6) => { const R = rngF(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { const v = R() < 0.5 ? 0 : 255; g.strokeStyle = `rgba(${v},${v},${v},${0.03 + R() * 0.05})`; g.lineWidth = 1; const y = R() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (R() - 0.5) * 6); g.stroke(); }
    for (let y = 0; y < h; y += h / 4) { g.fillStyle = 'rgba(20,20,24,.5)'; g.fillRect(0, y, w, 3); for (let x = 12; x < w; x += 40) { g.fillStyle = '#3a3e44'; g.beginPath(); g.arc(x, y + 10, 4, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.arc(x - 1, y + 9, 1.5, 0, 7); g.fill(); } }
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(120,70,30,${0.05 + R() * 0.12})`; g.beginPath(); g.ellipse(R() * w, R() * h, 4 + R() * 20, 3 + R() * 12, 0, 0, 7); g.fill(); } },
  wood: (g, w, h, base = [28, 40, 42], seed = 7) => { const R = rngF(seed); g.fillStyle = `hsl(${base[0]},${base[1]}%,${base[2]}%)`; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 60; k++) { g.strokeStyle = `hsla(${base[0] - 4},${base[1]}%,${base[2] - 8 - R() * 10}%,.45)`; g.lineWidth = 1 + R() * 2.5; g.beginPath(); const y = R() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + R() * 10 - 5, w * 0.6, y + R() * 10 - 5, w, y + R() * 8 - 4); g.stroke(); } },
  asphalt: (g, w, h, seed = 8) => { const R = rngF(seed); g.fillStyle = '#3a3c42'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { const v = 40 + R() * 60; g.fillStyle = `rgba(${v},${v},${v + 6},.5)`; g.fillRect(R() * w, R() * h, 2, 2); }
    for (let i = 0; i < 12; i++) { g.strokeStyle = 'rgba(20,20,24,.4)'; g.lineWidth = 2; g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (R() - 0.5) * 60; y += (R() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); } },
  grassDark: (g, w, h, seed = 9, base = '#2e4a2a') => { const R = rngF(seed); g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { const x = R() * w, y = R() * h; g.strokeStyle = `hsla(${90 + R() * 30},35%,${18 + R() * 18}%,.9)`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + R() * 4 - 2, y - 4 - R() * 6); g.stroke(); } },
};
