// scene.js: the worlds of "Die schnellsten Reiter der Welt" (Pony-Express short).
// Ten sets, all built around the origin; update() shows the one named by worldAt(f).set.
// All visible writing is German: Poststation, Post, Die Rede des Präsidenten, Telegraf, Geschlossen.
let S = { sets: {}, people: [], anim: [] };
export const build = (ctx) => {
  const { THREE, T, P, world, add, tbox, toon, texM, canvasTex, addClouds, waterMat, waterNd } = ctx;
  const rad = (a) => a * Math.PI / 180;
  // ---------- helpers ----------
  const ndInst = new THREE.ShaderMaterial({ side: THREE.DoubleSide,
    vertexShader: `varying vec3 vN; varying float vD; void main(){
      #ifdef USE_INSTANCING
      mat4 im = instanceMatrix;
      #else
      mat4 im = mat4(1.);
      #endif
      vN = normalize(normalMatrix*mat3(im)*normal); vec4 mv = modelViewMatrix*im*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }` });
  const cardNd = (map) => new THREE.ShaderMaterial({ uniforms: { map: { value: map } }, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }` });
  const setG = (name) => { const G = new THREE.Group(); G.visible = false; world.add(G); S.sets[name] = G; return G; };
  const sub = (G, x = 0, y = 0, z = 0, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; G.add(g); return g; };
  const col = (c, o = {}) => toon({ color: c, ...o });
  const glow = (c, i = 1.5) => toon({ color: c, emissive: c, emissiveIntensity: i });
  const basic = (c) => new THREE.MeshBasicMaterial({ color: c });
  const cyl = (r0, r1, h, n = 10) => new THREE.CylinderGeometry(r0, r1, h, n);
  const sph = (r, a = 12, b = 9) => new THREE.SphereGeometry(r, a, b);
  const rock = (r) => new THREE.DodecahedronGeometry(r, 0);
  /** blotchy painted ground canvas */
  const gnd = (seed, base, cols, n = 260) => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = P.rng(seed); g.fillStyle = base; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < n; i++) { g.globalAlpha = 0.10 + r() * 0.22; g.fillStyle = cols[(r() * cols.length) | 0]; const x = r() * 512, y = r() * 512, a = 6 + r() * 46, b = 4 + r() * 20;
      for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) { g.beginPath(); g.ellipse(x + dx, y + dy, a, b, r() * 3, 0, 7); g.fill(); } }
    g.globalAlpha = 1; return c; };
  const strata = (seed, cols) => { const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d'), r = P.rng(seed); let y = 0;
    while (y < 512) { const h = 14 + r() * 60; g.fillStyle = cols[(r() * cols.length) | 0]; g.fillRect(0, y, 256, h + 1); y += h; }
    for (let i = 0; i < 60; i++) { g.globalAlpha = 0.18; g.fillStyle = '#3a1410'; g.fillRect(r() * 256, r() * 512, 2 + r() * 5, 30 + r() * 120); } g.globalAlpha = 1; return c; };
  const ground = (G, mat, y = 0, size = 2600) => { const m = add(new THREE.PlaneGeometry(size, size), mat, 0, y, 0, G, { cast: false }); m.rotation.x = -Math.PI / 2; return m; };
  const patch = (G, mat, x, z, w, d, y = 0.012, ry = 0) => { const m = add(new THREE.PlaneGeometry(w, d), mat, x, y, z, G, { cast: false }); m.rotation.x = -Math.PI / 2; m.rotation.z = ry; m.userData.ndSkip = true; return m; };
  const inst = (G, geo, mat, list, o = {}) => { const m = new THREE.InstancedMesh(geo, mat, list.length), d = new THREE.Object3D();
    list.forEach((a, i) => { d.position.set(a[0], a[1], a[2]); d.scale.set(a[3] ?? 1, a[4] ?? a[3] ?? 1, a[5] ?? a[3] ?? 1); d.rotation.set(a[7] || 0, a[6] || 0, a[8] || 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); });
    m.castShadow = !!o.cast; m.receiveShadow = true; if (o.nd) m.userData.nd = ndInst; else m.userData.ndSkip = true; m.frustumCulled = false; G.add(m); return m; };
  const bladeGeo = new THREE.ConeGeometry(0.07, 1, 3); bladeGeo.translate(0, 0.5, 0);
  /** grass / scrub tufts as instanced blades */
  const tufts = (G, seed, n, [x0, x1, z0, z1], cols, h = 0.5, ok = () => true, y = 0) => { const r = P.rng(seed), lists = cols.map(() => []);
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), k = (r() * cols.length) | 0, s = 0.45 + r() * 0.6; if (!ok(x, z)) continue;
      for (let j = 0; j < 3; j++) lists[k].push([x + (r() - 0.5) * 0.25, y, z + (r() - 0.5) * 0.25, s * 0.95, h * s * (0.6 + r() * 0.8), s * 1.6, r() * 6, (r() - 0.5) * 0.7, (r() - 0.5) * 0.7]); }
    cols.forEach((c, k) => inst(G, bladeGeo, col(c), lists[k])); };
  const bushGeo = sph(1, 8, 6);
  const bushes = (G, seed, n, [x0, x1, z0, z1], cols, s0 = 0.5, ok = () => true, y = 0) => { const r = P.rng(seed), lists = cols.map(() => []);
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), k = (r() * cols.length) | 0, s = s0 * (0.6 + r() * 0.9); if (!ok(x, z)) continue; lists[k].push([x, y + s * 0.3, z, s * 1.3, s * 0.75, s * 1.1, r() * 6]); }
    cols.forEach((c, k) => inst(G, bushGeo, col(c), lists[k], { cast: true, nd: true })); };
  const rocks = (G, seed, n, [x0, x1, z0, z1], c, s0 = 0.4, ok = () => true, y = 0) => { const r = P.rng(seed), l = [];
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), s = s0 * (0.4 + r() * 1.4); if (!ok(x, z)) continue; l.push([x, y + s * 0.25, z, s * 1.3, s * 0.7, s, r() * 6, r(), r()]); }
    inst(G, rock(1), col(c), l, { cast: true, nd: true }); };
  /** ring of far hills / mountains */
  const ring = (G, seed, n, d0, d1, fn) => { const r = P.rng(seed); for (let i = 0; i < n; i++) { const a = (i + r() * 0.8) / n * Math.PI * 2, d = d0 + r() * (d1 - d0); fn(Math.cos(a) * d, Math.sin(a) * d, r, i); } };
  const hillM = (G, x, z, r_, sy, m) => { const h = add(sph(r_, 20, 10), m, x, -r_ * sy * 0.35, z, G, { cast: false }); h.scale.y = sy; return h; };
  const peak = (G, x, z, r_, hh, m, snowM) => { const g = sub(G, x, -4, z); add(new THREE.ConeGeometry(r_, hh, 7), m, 0, hh / 2, 0, g, { cast: false }); if (snowM) add(new THREE.ConeGeometry(r_ * 0.34, hh * 0.34, 7), snowM, 0, hh * 0.835, 0, g, { cast: false }); return g; };
  /** hand-painted western lettering (German) */
  const paint = (c, text, w, h, o = {}) => { const size = o.size || h * 0.6; c.font = `bold ${size}px "DejaVu Serif", Georgia, serif`; c.textBaseline = 'middle'; c.textAlign = 'left';
    const widths = [...text].map((ch) => c.measureText(ch).width + (o.track || 4)), tot = widths.reduce((a, b) => a + b, 0), r = P.rng(o.seed || 5); let x = (w - tot) / 2 + (o.dx || 0);
    [...text].forEach((ch, i) => { const dy = (r() - 0.5) * size * 0.06, rot = (r() - 0.5) * 0.05; c.save(); c.translate(x + widths[i] / 2, h / 2 + dy + (o.dy || 0)); c.rotate(rot); c.textAlign = 'center';
      c.lineJoin = 'round'; c.lineWidth = size * 0.16; c.strokeStyle = o.stroke || '#2a1408'; c.strokeText(ch, size * 0.04, size * 0.05); c.strokeText(ch, 0, 0); c.fillStyle = o.fill || '#f4e2b0'; c.fillText(ch, 0, 0); c.restore(); x += widths[i]; }); };
  const board = (c, w, h, base = '#7a4a26', edge = '#4a2a14') => { c.fillStyle = base; c.fillRect(0, 0, w, h); const r = P.rng(w + h); for (let i = 0; i < 60; i++) { c.globalAlpha = 0.18; c.fillStyle = i % 2 ? '#3a2010' : '#b07a46'; c.fillRect(0, r() * h, w, 1 + r() * 3); } c.globalAlpha = 1; c.lineWidth = h * 0.07; c.strokeStyle = edge; c.strokeRect(h * 0.035, h * 0.035, w - h * 0.07, h - h * 0.07); for (const [x, y] of [[h * 0.16, h * 0.16], [w - h * 0.16, h * 0.16], [h * 0.16, h * 0.84], [w - h * 0.16, h * 0.84]]) { c.fillStyle = '#2a2a30'; c.beginPath(); c.arc(x, y, h * 0.035, 0, 7); c.fill(); } };
  const signPlane = (G, tex, w, h, x, y, z, ry = 0) => { const m = add(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }), x, y, z, G, { cast: false }); m.rotation.y = ry; m.userData.ndSkip = true; return m; };
  /** static character plane (crowds). Faces +z unless ry given. */
  const pCache = new Map(), pGeo = new THREE.PlaneGeometry(1.35, 2.25); pGeo.translate(0, 2.25 / 2 - 2.25 * 0.025, 0);
  const person = (G, spec, opts, x, z, s = 1, ry = 0, amp = 0.05, y = 0) => { const key = JSON.stringify([spec, opts]); let m = pCache.get(key);
    if (!m) { const c = document.createElement('canvas'); c.width = 420; c.height = 700; const g = c.getContext('2d'); g.scale(0.7, 0.7); T.toonChar(new T.Pen(g), spec, opts); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      m = { mat: new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }), nd: cardNd(t), dm: new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 }) }; pCache.set(key, m); }
    const mesh = new THREE.Mesh(pGeo, m.mat); mesh.userData.nd = m.nd; mesh.customDepthMaterial = m.dm; mesh.castShadow = true; mesh.position.set(x, y, z); mesh.scale.setScalar(s); mesh.rotation.y = ry; G.add(mesh);
    S.people.push({ mesh, y0: y, ph: x * 1.7 + z * 2.3, amp }); return mesh; };
  // shared materials
  const plankT = (c, rx_ = 1, ry_ = 1) => texM(P.planks(3), rx_, ry_, c), beamT = (c = '#ffffff', rx_ = 1, ry_ = 2) => texM(P.beam(2), rx_, ry_, c);
  const M = { wood: col('#7a5434'), woodD: col('#55381f'), woodL: col('#a9814f'), iron: col('#2c2a30'), brass: col('#d9a84a'), white: col('#f3efe6'), hay: col('#e3bd55'), hayD: col('#b98f38'),
    log: beamT('#c9a070', 1, 1), logD: beamT('#8a6844', 1, 1), plankA: plankT('#d9b98c'), plankB: plankT('#a9c4c0'), plankC: plankT('#c96a4a'), plankD: plankT('#e3cf8f'), plankE: plankT('#9a8a7a'), plankF: plankT('#8a5a3a'),
    roof: plankT('#6a4a3a', 2, 1), roofD: plankT('#4a3830', 2, 1), stone: texM(P.stone(4), 1, 1), glassWarm: glow('#ffcf7a', 1.2), glassDay: col('#5a7896'), paper: col('#f4ecd6'), leather: col('#6a3a1c'), red: col('#b8402e') };
  const tree = (G, x, z, h = 4, r_ = 1.8, m1 = col('#5aa040'), m2 = col('#78b84a')) => { const g = sub(G, x, 0, z); add(cyl(0.16, 0.26, h, 7), col('#6a4a32'), 0, h / 2, 0, g); for (let k = 0; k < 3; k++) { const c = add(sph(r_ * (1 - k * 0.18), 12, 10), k % 2 ? m2 : m1, (k - 1) * r_ * 0.5, h + k * r_ * 0.35, (k % 2) * 0.4, g); c.scale.y = 0.85; } return g; };
  const pine = (G, x, z, h = 6, snow = null, m = col('#2f6a4a')) => { const g = sub(G, x, 0, z); add(cyl(0.12, 0.2, h * 0.3, 6), col('#5a3c28'), 0, h * 0.15, 0, g);
    for (let k = 0; k < 4; k++) { const r_ = h * 0.3 * (1 - k * 0.2), y = h * (0.28 + k * 0.2); add(new THREE.ConeGeometry(r_, h * 0.34, 8), m, 0, y, 0, g); if (snow) add(new THREE.ConeGeometry(r_ * 0.8, h * 0.2, 8), snow, 0, y + h * 0.085, 0, g, { cast: false }); } return g; };
  const fence = (G, x0, z0, x1, z1, m = M.woodL, hgt = 1.15, step = 2.4) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / step)), a = Math.atan2(z1 - z0, x1 - x0);
    for (let i = 0; i <= n; i++) { const t = i / n; add(tbox(0.16, hgt + 0.2, 0.16, 1), m, x0 + (x1 - x0) * t, (hgt + 0.2) / 2, z0 + (z1 - z0) * t, G).rotation.y = (i % 3) * 0.2; }
    for (const y of [hgt * 0.5, hgt]) { const r = add(tbox(L + 0.3, 0.11, 0.08, 1), m, (x0 + x1) / 2, y, (z0 + z1) / 2, G); r.rotation.y = -a; r.rotation.z = (y > 0.8 ? 0.004 : -0.006); } };
  const barrel = (G, x, z, s = 1) => { const g = sub(G, x, 0, z); add(cyl(0.34 * s, 0.3 * s, 0.9 * s, 12), M.wood, 0, 0.45 * s, 0, g); for (const y of [0.18, 0.72]) add(cyl(0.355 * s, 0.355 * s, 0.06 * s, 12), M.iron, 0, y * s, 0, g); return g; };
  const crate = (G, x, z, s = 0.7, ry = 0.3) => { const c = add(tbox(s, s, s, 1), M.plankA, x, s / 2, z, G); c.rotation.y = ry; return c; };
  const bale = (G, x, y, z, ry = 0) => { const g = sub(G, x, y, z, ry); add(tbox(1.5, 0.75, 0.85, 1), M.hay, 0, 0.375, 0, g); for (const dx of [-0.4, 0.4]) add(tbox(0.05, 0.78, 0.88, 1), M.hayD, dx, 0.375, 0, g); return g; };
  const lantern = (G, x, y, z) => { const g = sub(G, x, y, z); add(tbox(0.3, 0.06, 0.3, 1), M.iron, 0, 0.36, 0, g); add(tbox(0.3, 0.06, 0.3, 1), M.iron, 0, 0, 0, g); const l = add(tbox(0.22, 0.3, 0.22, 1), glow('#ffd070', 1.6), 0, 0.18, 0, g, { cast: false }); add(cyl(0.02, 0.02, 0.2, 5), M.iron, 0, 0.48, 0, g); S.anim.push({ lamp: l }); return g; };
  const saddle = (G, x, y, z, ry = 0) => { const g = sub(G, x, y, z, ry); const s = add(sph(0.3, 12, 8), M.leather, 0, 0.1, 0, g); s.scale.set(1.25, 0.5, 0.8); for (const sz of [-1, 1]) { const f = add(tbox(0.42, 0.5, 0.05, 1), col('#7a4826'), 0, -0.12, sz * 0.22, g); f.rotation.x = sz * 0.25; } add(cyl(0.05, 0.07, 0.2, 6), M.leather, 0.3, 0.26, 0, g); add(tbox(0.7, 0.05, 0.6, 1), M.red, 0, -0.02, 0, g); return g; };
  const logWall = (G, w, h, x, y, z, ry = 0, m = M.log) => { const g = sub(G, x, y, z, ry), n = Math.round(h / 0.34); for (let i = 0; i < n; i++) { const l = add(cyl(0.18, 0.18, w + (i % 2 ? 0.5 : 0.2), 8), i % 3 ? m : M.logD, 0, 0.17 + i * 0.34, 0, g); l.rotation.z = Math.PI / 2; } return g; };

  // =====================================================================
  // 1. DESERT (hook, side chase, "Nur Reiter", heat, flight)
  // =====================================================================
  { const G = setG('desert'), r = P.rng(11);
    ground(G, texM(gnd(3, '#c9683c', ['#e08a52', '#a84e2c', '#f0a060', '#8a3c22'], 320), 300, 300));
    const rockM = texM(strata(5, ['#c4552e', '#d9703c', '#a8442a', '#e88a4a', '#b84a2a']), 2, 1), rockD = texM(strata(6, ['#a8442a', '#8a3622', '#c4552e']), 2, 1), capM = col('#e08a52'), talus = col('#b85a36');
    const mesa = (x, z, w, h, k = 1) => { const g = sub(G, x, 0, z, r() * 3); add(cyl(w * 0.72, w * 1.05, h * 0.36, 9), talus, 0, h * 0.18, 0, g, { cast: false }); add(cyl(w * 0.55, w * 0.62, h * 0.64, 8), k ? rockM : rockD, 0, h * 0.68, 0, g, { cast: false }); add(cyl(w * 0.5, w * 0.56, h * 0.05, 8), capM, 0, h * 1.02, 0, g, { cast: false });
      if (w > 14) add(cyl(w * 0.16, w * 0.2, h * 0.5, 6), rockD, w * 0.9, h * 0.25 + h * 0.2, w * 0.2, g, { cast: false }); };
    [[-70, -120, 26, 46], [40, -150, 34, 60], [-150, -220, 50, 80], [150, -210, 44, 72], [-20, -260, 30, 90], [250, -330, 70, 100], [-290, -330, 60, 110], [95, -95, 12, 30], [-120, -80, 10, 34], [190, -120, 16, 44], [320, -160, 30, 62], [60, -320, 40, 70], [-200, -120, 18, 40],
     [430, -260, 50, 90], [-60, -420, 80, 120], [140, -480, 90, 130], [10, -60, 5, 18], [70, -48, 4, 14], [128, -62, 6, 20], [-38, -52, 4.5, 16]].forEach(([x, z, w, h], i) => mesa(x, z, w, h, i % 3));
    for (let i = 0; i < 9; i++) mesa(-420 + i * 110 + r() * 40, 180 + r() * 200, 30 + r() * 30, 50 + r() * 50, i % 2);
    ring(G, 13, 16, 720, 900, (x, z, rr) => peak(G, x, z, 150 + rr() * 90, 150 + rr() * 140, col('#9a5a6a')));
    // ditch across the hook run (z 5.4..7.6)
    patch(G, basic('#7a3018'), 0, 6.5, 90, 1.5, 0.014); patch(G, basic('#3a140c'), 0, 6.5, 90, 0.8, 0.018); patch(G, col('#e9a468'), 0, 5.62, 90, 0.26, 0.02); patch(G, col('#e9a468'), 0, 7.36, 90, 0.22, 0.02);
    rocks(G, 21, 46, [-30, 30, 5.3, 5.6], '#b85a36', 0.2); rocks(G, 22, 40, [-30, 30, 7.4, 7.7], '#a84e2c', 0.2);
    // saguaro cacti
    const cM = col('#4f8a4a'), cD = col('#3d7040');
    const cactus = (x, z, h = 3) => { const g = sub(G, x, 0, z, r() * 6); add(cyl(0.26, 0.3, h, 8), cM, 0, h / 2, 0, g); add(sph(0.26, 8, 6), cM, 0, h, 0, g);
      for (const [s, y, l] of [[1, 0.45, 0.9], [-1, 0.6, 0.6]]) { const a = add(cyl(0.15, 0.15, 0.6, 6), cD, s * 0.42, h * y, 0, g); a.rotation.z = Math.PI / 2; add(cyl(0.15, 0.16, l, 6), cD, s * 0.7, h * y + l / 2, 0, g); add(sph(0.15, 6, 5), cD, s * 0.7, h * y + l, 0, g); } };
    const okD = (x, z) => !(Math.abs(z) < 2.2) && !(Math.abs(x) < 3.5 && z > -40) && !(z > 4.6 && z < 8.4);
    for (let i = 0; i < 46; i++) { const x = -60 + r() * 190, z = -34 + r() * 30, h = 2 + r() * 2.4; if (okD(x, z)) cactus(x, z, h); }
    [[5.2, 3.4, 2.6], [51, 4.4, 2.8], [66, 3.5, 3.2], [79, 4.3, 2.5], [-5.5, 2.8, 2.9], [-9, -7, 3.6], [8, -11, 3.2], [-4.6, -3, 2.2], [4.8, -1.5, 2.6]].forEach(([x, z, h]) => cactus(x, z, h));
    // dead tree with a low branch across the trail (shot 2)
    { const g = sub(G, 34, 0, -2.4), m = col('#5a4030'); add(cyl(0.16, 0.3, 4.6, 7), m, 0, 2.3, 0, g).rotation.z = 0.06; const b = add(cyl(0.07, 0.15, 5.4, 6), m, 0.1, 3.1, 2.3, g); b.rotation.x = Math.PI / 2 - 0.05; const b2 = add(cyl(0.05, 0.1, 2.4, 6), m, -0.7, 4.2, -0.2, g); b2.rotation.z = 0.9;
      for (const [z, l, a] of [[2.6, 1.3, 0.7], [3.6, 0.9, -0.8], [1.4, 0.8, 0.4]]) { const t = add(cyl(0.03, 0.05, l, 5), m, 0.1 + a * 0.3, 3.3 + l * 0.3, z, g); t.rotation.z = a; } }
    bushes(G, 31, 520, [-70, 140, -60, 14], ['#8a8a52', '#9a9a5a', '#6a7a48', '#a8804a'], 0.42, (x, z) => okD(x, z) || Math.abs(x) > 4 && Math.abs(z) > 1.6 && !(z > 4.6 && z < 8.4));
    rocks(G, 32, 240, [-70, 140, -60, 14], '#b85a36', 0.3, okD);
    tufts(G, 33, 1500, [-60, 130, -30, 12], ['#c9a45a', '#a8904a', '#d9b870'], 0.35, okD);
  }
  // =====================================================================
  // 2. STORM MEADOW (America before the war)
  // =====================================================================
  { const G = setG('storm'), r = P.rng(41);
    ground(G, texM(gnd(8, '#5f7458', ['#4e6248', '#6f8462', '#55694c', '#7a8a6a']), 300, 300));
    fence(G, 0, -46, 0, 7.4, col('#8a7a66'), 1.25, 2.6);
    tufts(G, 42, 2600, [-22, 22, -40, 13], ['#6f8a5a', '#55704a', '#8a9a6a'], 0.55, (x) => Math.abs(x) > 0.5);
    ring(G, 43, 14, 150, 300, (x, z, rr, i) => hillM(G, x, z, 50 + rr() * 50, 0.4 + rr() * 0.2, col(i % 2 ? '#4a5f4a' : '#566a55')));
    ring(G, 44, 12, 560, 760, (x, z, rr) => peak(G, x, z, 120 + rr() * 80, 110 + rr() * 110, col('#4a5566')));
    for (let i = 0; i < 16; i++) { const x = (r() < 0.5 ? -1 : 1) * (14 + r() * 40), z = -70 + r() * 60; tree(G, x, z, 4 + r() * 3, 1.6 + r(), col('#3f5a40'), col('#4f6a48')); }
    // barn far left, farmhouse far right (no symbols)
    { const g = sub(G, -24, 0, -44, 0.3); add(tbox(9, 5, 7, 2), plankT('#7a4038'), 0, 2.5, 0, g); const rf = add(new THREE.ConeGeometry(6.6, 3, 4), M.roofD, 0, 6.5, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(1.1, 1, 0.9); }
    { const g = sub(G, 26, 0, -50, -0.3); add(tbox(7, 4, 6, 2), plankT('#b8b0a0'), 0, 2, 0, g); const rf = add(new THREE.ConeGeometry(5.4, 2.4, 4), M.roofD, 0, 5.2, 0, g); rf.rotation.y = Math.PI / 4; add(tbox(0.8, 2.2, 0.8, 1), M.stone, 2, 5.4, 0, g); }
    const blue = (i) => ({ body: i % 2 ? '#2f4f8f' : '#3a5fa8', detail: ['buttons', 'belt'], hair: ['#3a2a22', '#6a4024', '#2a2228'][i % 3], hairStyle: i % 2 ? 'sides' : 'short', mous: i % 3 === 0 ? '#3a2a22' : null, hat: { type: i % 3 ? 'kepi' : 'wide', color: i % 3 ? '#27407a' : '#30404f' }, legs: '#3a4a6a' });
    const grey = (i) => ({ body: i % 2 ? '#8a8f96' : '#a3a8ac', detail: ['buttons', 'belt'], hair: ['#6a4024', '#3a2a22', '#8a5a2e'][i % 3], hairStyle: i % 2 ? 'short' : 'sides', mous: i % 3 === 1 ? '#6a4024' : null, goatee: i % 3 === 2 ? '#3a2a22' : null, hat: { type: i % 3 ? 'kepi' : 'wide', color: i % 3 ? '#6f757c' : '#5a544a' }, legs: '#6a6f76' });
    const ex = ['angry', 'determined', 'angry', 'smug', 'determined'];
    [[-2.2, 2.2], [-3.6, 0.4], [-2.6, -1.8], [-4.6, -3.4], [-3.0, -5.6], [-5.6, -1.0], [-5.0, 2.6], [-6.6, -5.4], [-4.0, -8.4], [-7.4, 0.8], [-6.0, -10.5], [-3.2, -12]].forEach(([x, z], i) =>
      person(G, blue(i), { expr: ex[i % 5], turn: 0.75, look: 0.8, L: i % 3 ? 'hip' : 'cross', R: i % 2 ? 'hang' : 'hip' }, x, z, 1 + (i % 3) * 0.04, 0.35, 0.012));
    [[2.2, 2.0], [3.7, 0.2], [2.7, -2.0], [4.7, -3.6], [3.1, -5.8], [5.7, -1.2], [5.1, 2.4], [6.7, -5.6], [4.1, -8.6], [7.5, 0.6], [6.1, -10.7], [3.3, -12.2]].forEach(([x, z], i) =>
      person(G, grey(i), { expr: ex[(i + 2) % 5], turn: -0.75, look: -0.8, L: i % 2 ? 'hang' : 'hip', R: i % 3 ? 'hip' : 'cross' }, x, z, 1 + (i % 3) * 0.04, -0.35, 0.012));
    // foreground post + bush (blurred)
    add(tbox(0.22, 1.7, 0.22, 1), col('#6a5a4a'), -2.1, 0.85, 10.4, G); bushes(G, 45, 10, [-3.5, -1.6, 9.5, 11.5], ['#55704a', '#6f8a5a'], 0.6);
  }
  // =====================================================================
  // 3. CAPITOL (the speech)
  // =====================================================================
  { const G = setG('capitol'), r = P.rng(51), W_ = col('#f1ece0'), W2 = col('#dcd6c8'), marb = texM(P.marble(10), 1, 1);
    ground(G, texM(gnd(9, '#6f9a58', ['#5f8a4a', '#86ad66', '#7aa35c']), 300, 300));
    patch(G, texM(P.stone(21, 36, 10, 74, 64, 48), 14, 30), 0, -10, 34, 70, 0.012).userData.ndSkip = true;
    const B = sub(G, 0, 0, -44);
    add(tbox(64, 2.2, 18, 3), W2, 0, 1.1, 0, B); add(tbox(60, 11, 15, 3), W_, 0, 7.7, -0.5, B);
    for (let i = 0; i < 7; i++) add(tbox(24 - i * 0.0, 0.33, 1.2, 2), W2, 0, 0.16 + i * 0.32, 9.6 + 4 - i * 0.62, B, { cast: false });
    for (let i = 0; i < 8; i++) { const x = -10.5 + i * 3; add(cyl(0.62, 0.72, 9.2, 14), marb, x, 6.8, 8.6, B); add(tbox(1.7, 0.4, 1.7, 1), W2, x, 2.4, 8.6, B); add(tbox(1.6, 0.4, 1.6, 1), W2, x, 11.6, 8.6, B); }
    add(tbox(25, 1.3, 3.4, 2), W_, 0, 12.45, 8.2, B);
    { const sh = new THREE.Shape(); sh.moveTo(-13, 0); sh.lineTo(13, 0); sh.lineTo(0, 4.2); sh.closePath(); add(new THREE.ExtrudeGeometry(sh, { depth: 3.2, bevelEnabled: false }), W_, 0, 13.1, 6.6, B); }
    for (const s of [-1, 1]) { for (let i = 0; i < 6; i++) { add(tbox(1.3, 2.6, 0.2, 1), col('#55606e'), s * (16 + i * 2.6), 9.2, 7.05, B, { cast: false }); add(tbox(1.3, 2.4, 0.2, 1), col('#55606e'), s * (16 + i * 2.6), 5.2, 7.05, B, { cast: false }); add(tbox(0.5, 9.5, 0.4, 1), W2, s * (14.7 + i * 2.6), 7.6, 7.15, B, { cast: false }); }
      add(tbox(30.5, 1, 15.6, 3), W2, s * 22, 13.7, -0.5, B); }
    // drum + unfinished dome inside scaffolding
    const D = sub(B, 0, 13.2, -1);
    add(cyl(9, 9.4, 5, 24), W_, 0, 2.5, 0, D); for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; add(cyl(0.3, 0.34, 5.4, 8), marb, Math.cos(a) * 9.6, 7.9, Math.sin(a) * 9.6, D); }
    add(cyl(8.4, 8.4, 5.6, 24), W2, 0, 7.8, 0, D, { cast: false }); add(cyl(10.2, 10.2, 0.6, 24), W_, 0, 10.9, 0, D);
    add(new THREE.CylinderGeometry(6.2, 8.6, 5.5, 22, 1, true), col('#cfd4d8', { side: THREE.DoubleSide }), 0, 13.9, 0, D);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, rb = add(tbox(0.28, 9.5, 0.28, 1), col('#6a707a'), Math.cos(a) * 4.2, 20.6, Math.sin(a) * 4.2, D); rb.rotation.y = -a; rb.rotation.z = 0.5; rb.rotation.order = 'YXZ'; }
    const scM = col('#b08a5a'), scD = col('#8a6844');
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; add(tbox(0.22, 26, 0.22, 1), i % 2 ? scM : scD, Math.cos(a) * 11.6, 13, Math.sin(a) * 11.6, D); if (i % 2 === 0) { const b = add(tbox(0.14, 9, 0.14, 1), scD, Math.cos(a + 0.22) * 11.7, 12 + (i % 4) * 3, Math.sin(a + 0.22) * 11.7, D); b.rotation.y = -a; b.rotation.x = 0.7; } }
    for (const y of [6, 11.5, 17, 22.5, 26]) { const t = add(new THREE.TorusGeometry(11.6, 0.13, 5, 28), scM, 0, y, 0, D); t.rotation.x = Math.PI / 2; const pl = add(new THREE.CylinderGeometry(12.2, 12.2, 0.12, 28, 1, true), scD, 0, y + 0.1, 0, D, { cast: false }); pl.scale.y = 3; }
    { const c = sub(D, 0, 26, 0, 0.5); add(tbox(0.4, 7, 0.4, 1), scD, 0, 3.5, 0, c); const bm = add(tbox(11, 0.34, 0.34, 1), scD, 3.4, 6.6, 0, c); bm.rotation.z = 0.16; add(tbox(0.05, 5.5, 0.05, 1), M.iron, 8.4, 4.6, 0, c, { cast: false }); add(tbox(0.9, 0.7, 0.9, 1), W2, 8.4, 1.6, 0, c); const st = add(tbox(0.08, 7.6, 0.08, 1), M.iron, -2.4, 3.4, 0, c, { cast: false }); st.rotation.z = -0.66; }
    // speaker's platform on the steps
    const Pd = sub(G, 0, 0, -30.5); S.podium = Pd;
    add(tbox(8, 2.6, 4, 2), M.plankD, 0, 1.3, 0, Pd); for (const s of [-1, 1]) for (const z of [-1.8, 1.8]) add(tbox(0.2, 4.2, 0.2, 1), M.white, s * 3.8, 4.7, z, Pd);
    add(tbox(8.6, 0.22, 4.6, 2), col('#b8402e'), 0, 6.9, 0, Pd); add(tbox(0.9, 1.1, 0.6, 1), M.woodD, 0, 3.15, 1.5, Pd); for (let i = -3; i <= 3; i++) add(tbox(0.1, 1, 0.1, 1), M.white, i * 1.2, 3.1, 1.95, Pd); add(tbox(8, 0.1, 0.12, 1), M.white, 0, 3.6, 1.95, Pd);
    // crowd (back views), trees, lamps
    const hats = ['top', 'bowler', 'wide', 'flatcap', 'bonnet', 'top', 'bowler'], cols_ = ['#3a3a48', '#5a4636', '#2f4a5a', '#6a3a3a', '#4a5a3a', '#7a6a5a', '#8a4a6a', '#35455f'];
    for (let i = 0; i < 64; i++) { const row = (i / 9) | 0, x = -12.5 + (i % 9) * 3.1 + (row % 2) * 1.5 + (r() - 0.5), z = -24 + row * 2.9 + (r() - 0.5) * 0.8, ht = hats[(i * 3 + row) % 7], woman = ht === 'bonnet';
      person(G, { body: cols_[(i * 5 + row) % 8], robe: woman, detail: woman ? [{ t: 'scarf', c: '#e8dcc8' }] : ['collar'], hair: ['#3a2a22', '#6a4024', '#8a5a2e', '#9a9aa4'][i % 4], hairStyle: woman ? 'bun' : 'short', hat: { type: ht, color: woman ? ['#e8dcc8', '#c8a0b0', '#a8c0d0'][i % 3] : ['#2a2430', '#4a3a2e', '#3a3a3a'][i % 3] } },
        { back: true, L: i % 7 === 0 ? 'up' : 'hang', R: i % 5 === 0 ? 'wave' : 'hang', holdR: i % 5 === 0 ? 'hat' : null }, x, z, 0.96 + (i % 4) * 0.04, 0, i % 5 === 0 ? 0.06 : 0.015); }
    for (const s of [-1, 1]) { for (let i = 0; i < 7; i++) tree(G, s * (20 + (i % 2) * 5), -4 - i * 6, 4.5 + r() * 2, 2.2 + r()); for (let i = 0; i < 3; i++) { const g = sub(G, s * 15.5, 0, -6 - i * 9); add(cyl(0.07, 0.1, 3.6, 8), M.iron, 0, 1.8, 0, g); add(sph(0.26, 10, 8), col('#f4f0e0'), 0, 3.75, 0, g, { cast: false }); } }
    tufts(G, 52, 1200, [-40, 40, -30, 12], ['#6f9a50', '#86ad66'], 0.3, (x) => Math.abs(x) > 17.5);
    ring(G, 53, 12, 190, 320, (x, z, rr, i) => { if (z < 0 && Math.abs(x) < 120) return; hillM(G, x, z, 60 + rr() * 50, 0.4, col(i % 2 ? '#7aa860' : '#8ab870')); });
    for (let i = 0; i < 12; i++) { const s = i % 2 ? 1 : -1, x = s * (42 + r() * 40), z = -30 - r() * 40, h = 5 + r() * 5; const g = sub(G, x, 0, z); add(tbox(7 + r() * 4, h, 6, 2), i % 3 ? col('#c9b8a0') : col('#b88a72'), 0, h / 2, 0, g); add(tbox(8 + r() * 3, 0.5, 6.6, 2), M.roofD, 0, h + 0.25, 0, g); }
    // foreground: lamp post and leafy branch near the camera
    { const g = sub(G, -3.2, 0, 3.4); add(cyl(0.09, 0.13, 4.4, 8), M.iron, 0, 2.2, 0, g); add(sph(0.3, 10, 8), col('#f4f0e0'), 0, 4.6, 0, g, { cast: false }); }
  }
  // =====================================================================
  // 4. TOWN (California: waiting, arrival, cheering)
  // =====================================================================
  { const G = setG('town'), r = P.rng(61);
    ground(G, texM(gnd(12, '#d2ad7a', ['#c29a66', '#e2c08e', '#b88c5c', '#e8cc9c']), 300, 300));
    const fronts = [M.plankA, M.plankB, M.plankC, M.plankD, M.plankE, M.plankF];
    const wb = (side, z, w, h, k) => { const g = sub(G, side * 9.2, 0, z, side > 0 ? -Math.PI / 2 : Math.PI / 2), m = fronts[k % 6]; // local +z faces the street
      add(tbox(w, h, 8, 2), fronts[(k + 3) % 6], 0, h / 2, -4.2, g); add(tbox(w + 0.2, h + 1.7, 0.3, 2), m, 0, (h + 1.7) / 2, 0, g); add(tbox(w + 0.5, 0.3, 0.5, 2), M.woodD, 0, h + 1.75, 0, g);
      add(tbox(w, 0.25, 2.4, 2), M.plankE, 0, 0.13, 1.2, g); const pr = add(tbox(w + 0.3, 0.14, 2.7, 2), M.roof, 0, 3.1, 1.3, g); pr.rotation.x = 0.16; for (let i = 0; i <= 2; i++) add(tbox(0.16, 2.9, 0.16, 1), M.woodD, -w / 2 + 0.2 + i * (w - 0.4) / 2, 1.55, 2.3, g);
      add(tbox(1.1, 2.1, 0.12, 1), M.woodD, 0, 1.3, 0.17, g, { cast: false }); for (const s of [-1, 1]) { add(tbox(1.15, 1.25, 0.1, 1), M.white, s * w * 0.3, 1.75, 0.17, g, { cast: false }); add(tbox(0.95, 1.05, 0.12, 1), M.glassDay, s * w * 0.3, 1.75, 0.19, g, { cast: false }); if (h > 4.5) { add(tbox(1.05, 1.15, 0.1, 1), M.white, s * w * 0.3, h + 0.1, 0.17, g, { cast: false }); add(tbox(0.85, 0.95, 0.12, 1), M.glassDay, s * w * 0.3, h + 0.1, 0.19, g, { cast: false }); } }
      return g; };
    let k = 0; for (const side of [-1, 1]) { let z = -52; while (z < 78) { const w = 6.5 + r() * 3, h = 3.8 + r() * 2.6; wb(side, z + w / 2, w, h, k++); z += w + 0.5 + r(); } }
    // church with bell tower at the end of the street
    { const g = sub(G, 0, 0, -66); add(tbox(11, 7, 14, 2), plankT('#f0e8d8'), 0, 3.5, 0, g); const rf = add(new THREE.ConeGeometry(9.2, 4, 4), M.roofD, 0, 9, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(0.9, 1, 1.1);
      add(tbox(3.4, 13, 3.4, 2), plankT('#f0e8d8'), 0, 6.5, 7.4, g); for (const s of [-1, 1]) for (const z of [-1, 1]) add(tbox(0.3, 2.6, 0.3, 1), M.white, s * 1.4, 14.3, 7.4 + z * 1.4, g); const sp = add(new THREE.ConeGeometry(2.8, 4.6, 4), M.roofD, 0, 17.9, 7.4, g); sp.rotation.y = Math.PI / 4;
      const bell = add(new THREE.CylinderGeometry(0.35, 0.9, 1.2, 12), M.brass, 0, 14.3, 7.4, g); S.bell = bell; add(tbox(1.4, 2.6, 0.2, 1), M.woodD, 0, 1.4, 9.15, g, { cast: false }); }
    // street dressing
    for (const [x, z] of [[-6.4, -6], [6.5, -12], [-6.6, 8], [6.4, 4], [-6.5, 22], [6.6, 30], [6.3, -24], [-6.4, -30]]) barrel(G, x, z, 0.9 + r() * 0.3);
    for (const [x, z] of [[-6.2, -3.4], [6.1, -8.5], [6.3, 12], [-6.3, 14], [-6.0, -18], [6.2, 18.5]]) crate(G, x, z, 0.6 + r() * 0.3, r());
    for (const [x, z] of [[-5.6, 0], [5.6, -16], [-5.6, -24], [5.6, 24], [-5.6, 34]]) { const g = sub(G, x, 0, z); for (const s of [-1, 1]) add(tbox(0.14, 1.1, 0.14, 1), M.woodD, 0, 0.55, s * 1.2, g); add(tbox(0.12, 0.12, 2.8, 1), M.woodD, 0, 1.05, 0, g); }
    { const g = sub(G, 5.3, 0, -4); add(tbox(0.8, 0.5, 2.4, 1), M.wood, 0, 0.3, 0, g); add(tbox(0.6, 0.06, 2.2, 1), col('#4a8ab0'), 0, 0.53, 0, g, { cast: false }); }
    for (const [x, z] of [[-5.9, -10], [5.9, 6], [-5.9, 28], [5.9, -30]]) { const g = sub(G, x, 0, z); add(cyl(0.07, 0.1, 3.4, 8), M.woodD, 0, 1.7, 0, g); lantern(g, 0, 3.4, 0); }
    // wagon
    { const g = sub(G, -5.2, 0, -14, 0.2); add(tbox(1.6, 0.7, 3, 1), M.plankF, 0, 1.1, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = add(new THREE.TorusGeometry(0.55, 0.07, 6, 16), M.woodD, sx * 0.9, 0.6, sz * 1.0, g); w.rotation.y = Math.PI / 2; for (let i = 0; i < 4; i++) { const sp = add(tbox(0.05, 1.1, 0.05, 1), M.woodD, sx * 0.9, 0.6, sz * 1.0, g); sp.rotation.x = i * Math.PI / 4; } } }
    // static crowd: waiting vs cheering variants (face +z)
    const TW = sub(G), TC = sub(G); S.townWait = TW; S.townCheer = TC;
    const folk = (i) => { const t = i % 6; return t === 0 ? { body: '#b8683a', detail: ['straps', 'belt'], hair: '#3a2a22', hairStyle: 'sides', beard: i % 12 ? null : '#6a4a32', mous: '#3a2a22', hat: { type: 'wide', color: '#6a5238', band: '#3a2a1c' }, legs: '#4a4a5a' }
      : t === 1 ? { body: ['#c85a7a', '#5a8ab8', '#d8a848'][i % 3], robe: true, detail: [{ t: 'scarf', c: '#f4ead8' }, { t: 'trim', c: '#f4ead8' }], hair: '#8a5a2e', hairStyle: 'bun', hat: { type: 'bonnet', color: '#f0e4cc', band: '#c85a7a' } }
      : t === 2 ? { body: '#4a6a8a', detail: ['vest', 'buttons'], hair: '#2a2228', hairStyle: 'short', mous: '#2a2228', mousStyle: 'handle', hat: { type: 'bowler', color: '#2e2a30' }, legs: '#3a3a44' }
      : t === 3 ? { body: '#8a9a5a', detail: ['straps', 'pocket'], hair: '#b08a52', hairStyle: 'mop', hat: { type: 'flatcap', color: '#6a6a5a' }, legs: '#5a4a3a' }
      : t === 4 ? { body: ['#8a6ab0', '#3f8a7a'][i % 2], robe: true, detail: [{ t: 'scarf', c: '#e8d0e0' }], hair: '#3a2a22', hairStyle: 'bun' }
      : { body: '#d8483a', detail: ['belt', 'collar'], hair: '#6a4024', hairStyle: 'sides', goatee: '#6a4024', hat: { type: 'wide', color: '#c9a56a', band: '#7a4a26' }, legs: '#4a3a30' }; };
    const spots = []; for (let i = 0; i < 34; i++) { const row = (i / 7) | 0, x = -5.6 + (i % 7) * 1.85 + (row % 2) * 0.9 + (r() - 0.5) * 0.5, z = -4.2 - row * 1.9 + (r() - 0.5) * 0.5; if (Math.abs(x) < 1.6 && z > -6) continue; spots.push([x, z, i]); }
    const wex = ['worried', 'neutral', 'worried', 'shock', 'neutral'], cex = ['laugh', 'happy', 'goofy', 'laugh', 'happy'];
    for (const [x, z, i] of spots) { const t = x > 0 ? -0.3 : 0.3;
      person(TW, folk(i), { expr: wex[i % 5], turn: t, look: t * 0.5, L: i % 4 === 0 ? 'chin' : 'hang', R: i % 5 === 1 ? 'hip' : 'hang' }, x, z, 0.96 + (i % 3) * 0.05, 0, 0.012);
      person(TC, folk(i), { expr: cex[i % 5], turn: t * 0.5, L: i % 3 ? 'up' : 'wave', R: i % 2 ? 'up' : 'wave', holdR: i % 4 === 1 ? 'hat' : null }, x, z, 0.96 + (i % 3) * 0.05, 0, 0.16); }
    ring(G, 63, 16, 200, 330, (x, z, rr, i) => hillM(G, x, z, 60 + rr() * 60, 0.45 + rr() * 0.25, col(i % 2 ? '#c9a45a' : '#b8944e')));
    ring(G, 64, 14, 560, 760, (x, z, rr) => peak(G, x, z, 130 + rr() * 80, 140 + rr() * 120, col('#8f9cc0'), col('#f4f6fa')));
    for (let i = 0; i < 20; i++) { const s = i % 2 ? 1 : -1; tree(G, s * (22 + r() * 30), -60 + r() * 130, 4 + r() * 3, 1.8 + r(), col('#7a9a48'), col('#94b05a')); }
  }
  // =====================================================================
  // 5. STATION (relay: day, dusk "big", closed)
  // =====================================================================
  { const G = setG('station'), r = P.rng(71);
    ground(G, texM(gnd(14, '#a8a45a', ['#94944c', '#bcb468', '#8a8a44', '#c8be78']), 300, 300));
    patch(G, texM(gnd(15, '#c9a070', ['#b88c5c', '#d8b484', '#a87c50']), 3, 3), 2, -1, 34, 13, 0.012); patch(G, texM(gnd(16, '#c9a070', ['#b88c5c', '#d8b484']), 30, 1), 0, 2.4, 600, 4.6, 0.014);
    const C = sub(G, 0, 0, -6);
    logWall(C, 7, 3.1, 0, 0, 2.5); logWall(C, 7, 3.1, 0, 0, -2.5); logWall(C, 5, 3.1, -3.5, 0, 0, Math.PI / 2); logWall(C, 5, 3.1, 3.5, 0, 0, Math.PI / 2);
    add(tbox(6.6, 3, 4.6, 2), col('#3a2a20'), 0, 1.5, 0, C, { cast: false });
    for (const s of [-1, 1]) { const rf = add(tbox(8.2, 0.16, 3.6, 1.2), M.roof, 0, 3.95, s * 1.5, C); rf.rotation.x = s * 0.5; } add(tbox(8.3, 0.2, 0.3, 1), M.woodD, 0, 4.82, 0, C);
    { const sh = new THREE.Shape(); sh.moveTo(-2.6, 0); sh.lineTo(2.6, 0); sh.lineTo(0, 1.55); sh.closePath(); for (const x of [-3.55, 3.45]) { const gb = add(new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false }), M.plankF, x, 3.2, 0, C); gb.rotation.y = Math.PI / 2; } }
    add(tbox(1.2, 5.6, 1.2, 1.2), M.stone, -3.0, 2.8, -0.6, C); S.chimney = [-3.0, 5.8, -6.6];
    const door = add(tbox(1.25, 2.2, 0.12, 1), M.plankF, 1.1, 1.1, 2.72, C, { cast: false }); add(tbox(1.5, 0.16, 0.2, 1), M.woodD, 1.1, 2.28, 2.74, C); for (const s of [-1, 1]) add(tbox(0.14, 2.3, 0.2, 1), M.woodD, 1.1 + s * 0.7, 1.15, 2.74, C); add(sph(0.06, 6, 5), M.iron, 0.62, 1.1, 2.82, C);
    add(tbox(1.3, 1.1, 0.14, 1), M.woodD, -1.5, 1.75, 2.72, C, { cast: false }); const win = add(tbox(1.05, 0.85, 0.16, 1), M.glassDay, -1.5, 1.75, 2.74, C, { cast: false }); S.stWin = [win]; add(tbox(0.06, 0.85, 0.18, 1), M.woodD, -1.5, 1.75, 2.75, C, { cast: false }); add(tbox(1.05, 0.06, 0.18, 1), M.woodD, -1.5, 1.75, 2.75, C, { cast: false });
    // porch + hanging sign "Poststation"
    for (const x of [-3.3, 3.3]) add(tbox(0.2, 3, 0.2, 1), M.woodD, x, 1.5, 4.4, C); const pr = add(tbox(7.6, 0.14, 2.2, 1.2), M.roof, 0, 3.12, 3.6, C); pr.rotation.x = 0.14; add(tbox(7.2, 0.18, 0.18, 1), M.woodD, 0, 2.95, 4.4, C);
    const sg = canvasTex(1400, 300, (c, w, h) => { board(c, w, h, '#8a5a30'); paint(c, 'Poststation', w, h, { size: 176, fill: '#f6e6b4', stroke: '#2a1408', seed: 9, track: 8 }); });
    add(tbox(3.7, 0.86, 0.1, 1), M.woodD, 0.3, 3.62, 4.42, C); signPlane(C, sg, 3.6, 0.77, 0.3, 3.62, 4.48); for (const s of [-1, 1]) add(tbox(0.05, 0.4, 0.05, 1), M.iron, 0.3 + s * 1.5, 3.2, 4.42, C);
    lantern(C, 2.6, 2.3, 4.5); add(tbox(0.04, 0.5, 0.04, 1), M.iron, 2.6, 2.9, 4.5, C);
    // "Geschlossen" board nailed across the door
    const cl = sub(C, 1.1, 1.45, 2.86); S.closed = cl; const cg = canvasTex(1100, 300, (c, w, h) => { board(c, w, h, '#b89468', '#6a4a2a'); paint(c, 'Geschlossen', w, h, { size: 150, fill: '#8a1c14', stroke: '#f1e2c0', seed: 4, track: 6 }); });
    add(tbox(2.3, 0.63, 0.07, 1), M.woodL, 0, 0, 0, cl); signPlane(cl, cg, 2.26, 0.6, 0, 0, 0.045); cl.rotation.z = -0.07;
    // stable lean-to with saddle rail
    const St = sub(G, 8.6, 0, -6.4);
    add(tbox(6.4, 2.9, 0.16, 2), M.plankF, 0, 1.45, -2, St); for (const x of [-3.2, 3.2]) add(tbox(0.16, 2.9, 4, 2), M.plankF, x, 1.45, 0, St); for (const x of [-3.1, 0, 3.1]) add(tbox(0.2, 2.7, 0.2, 1), M.woodD, x, 1.35, 2, St);
    const sr = add(tbox(7, 0.14, 4.8, 1.2), M.roof, 0, 3.05, 0.1, St); sr.rotation.x = 0.13; add(tbox(6.2, 0.1, 0.1, 1), M.woodD, 0, 1.25, -1.5, St); for (const x of [-2, -0.2, 1.6]) saddle(St, x, 1.42, -1.5, 0.2 * x);
    for (const [x, y] of [[-2.4, 2.2], [-1.2, 2.3], [0.6, 2.2], [2.2, 2.25]]) { const t = add(new THREE.TorusGeometry(0.22, 0.03, 5, 12), M.leather, x, y, -1.88, St); t.scale.y = 1.4; }
    bale(St, 2.2, 0, 0.4, 0.2); bale(St, 2.3, 0.75, 0.3, -0.1); add(tbox(6, 0.05, 3.6, 2), M.hay, 0, 0.04, 0, St, { cast: false });
    // trough, bales, barrel, lantern post, wheel
    { const g = sub(G, -5.2, 0, -2.6, 0.15); add(tbox(2.4, 0.55, 0.9, 1), M.wood, 0, 0.42, 0, g); add(tbox(2.2, 0.05, 0.7, 1), col('#4a8ab0'), 0, 0.68, 0, g, { cast: false }); for (const s of [-1, 1]) add(tbox(0.16, 0.5, 0.9, 1), M.woodD, s * 0.9, 0.2, 0, g); }
    S.baleAt = [-3.2, 0, 0.2]; bale(G, -3.2, 0, 0.2, 0.25); bale(G, -4.4, 0, -0.5, -0.4); bale(G, -3.7, 0.75, -0.2, 0.1);
    barrel(G, 4.4, -2.9); crate(G, 5.0, -2.2, 0.6, 0.5); { const g = sub(G, 3.4, 0, -0.9); add(cyl(0.08, 0.11, 3.1, 8), M.woodD, 0, 1.55, 0, g); add(tbox(0.7, 0.08, 0.08, 1), M.woodD, 0.3, 3.0, 0, g); lantern(g, 0.6, 2.5, 0); }
    { const w = add(new THREE.TorusGeometry(0.6, 0.07, 6, 18), M.woodD, -6.9, 0.62, -3.7, G); w.rotation.x = 0.25; for (let i = 0; i < 4; i++) { const sp = add(tbox(0.05, 1.2, 0.05, 1), M.woodD, -6.9, 0.62, -3.7, G); sp.rotation.z = i * Math.PI / 4; sp.rotation.x = 0.25; } }
    // corral fence + pasture
    fence(G, 5.2, -0.6, 30, -0.6); fence(G, 30, -0.6, 30, -22); fence(G, 12, -8.6, 12, -22); fence(G, -8, 0.4, -22, 0.4);
    // M7: the bigger home station (dusk)
    const Bg = sub(G, -11.5, 0, -8.5, 0.12); S.big = Bg;
    logWall(Bg, 9, 5.8, 0, 0, 3); logWall(Bg, 6, 5.8, -4.5, 0, 0, Math.PI / 2); logWall(Bg, 6, 5.8, 4.5, 0, 0, Math.PI / 2); add(tbox(8.6, 5.7, 5.6, 2), col('#3a2a20'), 0, 2.85, 0, Bg, { cast: false });
    for (const s of [-1, 1]) { const rf = add(tbox(10.4, 0.18, 4.4, 1.2), M.roofD, 0, 6.9, s * 1.8, Bg); rf.rotation.x = s * 0.55; } add(tbox(1.3, 2.3, 0.14, 1), M.plankF, 0, 1.15, 3.22, Bg, { cast: false });
    S.bigWin = []; for (const [x, y] of [[-2.8, 1.8], [2.8, 1.8], [-2.8, 4.4], [0, 4.4], [2.8, 4.4]]) { add(tbox(1.25, 1.15, 0.14, 1), M.woodD, x, y, 3.22, Bg, { cast: false }); S.bigWin.push(add(tbox(1, 0.9, 0.16, 1), M.glassWarm, x, y, 3.25, Bg, { cast: false })); }
    lantern(Bg, 1.3, 2.6, 3.5); lantern(Bg, -1.3, 2.6, 3.5);
    for (let i = 0; i < 14; i++) { const x = -40 + r() * 90, z = -18 - r() * 40; if (Math.abs(x - 3) < 14 && z > -16) continue; tree(G, x, z, 4 + r() * 3, 1.8 + r(), col('#6a9a48'), col('#86b05a')); }
    const okS = (x, z) => !(x > -9 && x < 19 && z > -9 && z < 5.2) && !(Math.abs(z - 2.4) < 2.6);
    tufts(G, 72, 3400, [-34, 44, -30, 12], ['#b8b060', '#94944c', '#d0c478'], 0.5, okS); bushes(G, 73, 40, [-34, 44, -30, -10], ['#7a9a4a', '#94a85a'], 0.7, okS); rocks(G, 74, 30, [-30, 40, -24, 10], '#9a8a7a', 0.25, okS);
    bushes(G, 75, 8, [-7, -4, 6.2, 7.6], ['#7a9a4a', '#94a85a'], 0.55); add(tbox(0.2, 1.5, 0.2, 1), M.woodD, 6.4, 0.75, 6.6, G);
    ring(G, 76, 16, 170, 300, (x, z, rr, i) => hillM(G, x, z, 55 + rr() * 55, 0.42 + rr() * 0.25, col(i % 2 ? '#a8a45a' : '#94a050')));
    ring(G, 77, 14, 560, 760, (x, z, rr) => peak(G, x, z, 130 + rr() * 80, 130 + rr() * 120, col('#8f9cc0'), col('#f4f6fa')));
  }
  // =====================================================================
  // 6. SNOW PASS
  // =====================================================================
  { const G = setG('snow'), r = P.rng(81), sn = col('#eef4fb'), snB = col('#cfe0f2');
    ground(G, texM(gnd(18, '#e8f0fa', ['#d2e2f4', '#f8fbff', '#c2d6ee']), 300, 300));
    for (let i = 0; i < 60; i++) { const x = -40 + r() * 140, z = -40 + r() * 52; if (Math.abs(z) < 2.4) continue; const d = add(sph(1.5 + r() * 2.5, 12, 8), i % 2 ? sn : snB, x, -0.5, z, G, { cast: false }); d.scale.y = 0.35; }
    for (let i = 0; i < 70; i++) { const x = -40 + r() * 150, z = -8 - r() * 50; pine(G, x, z, 5 + r() * 5, sn); }
    for (const [x, z, h] of [[16, -4.4, 6], [38, -5, 7], [58, -4.2, 5.6], [78, -5, 6.4]]) pine(G, x, z, h, sn);
    const rk = col('#6a7a94'), rk2 = col('#8090aa');
    for (let i = 0; i < 26; i++) { const x = -60 + i * 9 + r() * 5, z = -34 - r() * 26, s = 8 + r() * 12; const m = add(rock(s), i % 2 ? rk : rk2, x, s * 0.4, z, G, { cast: false }); m.rotation.set(r(), r() * 3, r()); m.scale.y = 1.3 + r(); add(rock(s * 0.6), sn, x, s * (1.25 + r() * 0.3), z, G, { cast: false }).scale.y = 0.35; }
    rocks(G, 82, 50, [-30, 100, -14, 9], '#6a7a94', 0.5, (x, z) => Math.abs(z) > 2.6);
    ring(G, 83, 18, 180, 420, (x, z, rr) => peak(G, x, z, 90 + rr() * 70, 150 + rr() * 150, col('#7a8cae'), sn));
  }
  // =====================================================================
  // 7. RIVER CROSSING
  // =====================================================================
  { const G = setG('river'), r = P.rng(91), gm = texM(gnd(20, '#7aa050', ['#6a9044', '#8ab45c', '#9a9a5a']), 150, 150), sand = col('#d8c08a');
    for (const s of [-1, 1]) { const g = add(new THREE.PlaneGeometry(1300, 2600), gm, s * (650 + 15), 0, 0, G, { cast: false }); g.rotation.x = -Math.PI / 2; const b = add(tbox(5, 1.2, 2600, 4), sand, s * 15.5, -0.62, 0, G, { cast: false }); b.rotation.z = s * 0.2; }
    const w = add(new THREE.PlaneGeometry(40, 2600), waterMat, 0, -0.12, 0, G, { cast: false }); w.rotation.x = -Math.PI / 2; w.userData.nd = waterNd; w.receiveShadow = false;
    add(tbox(44, 0.4, 2600, 4), col('#5a7a6a'), 0, -0.85, 0, G, { cast: false });
    for (let i = 0; i < 40; i++) { const x = -12 + r() * 24, z = -30 + r() * 40; if (Math.abs(z) < 1.8) continue; const s = 0.3 + r() * 0.8; add(rock(s), col(i % 2 ? '#8a8a8e' : '#a09a94'), x, -0.1, z, G).scale.y = 0.6; }
    rocks(G, 92, 120, [-20, 20, -40, 14], '#b8b0a0', 0.3, (x, z) => Math.abs(x) > 12.6 && Math.abs(z) > 2);
    const reed = []; for (let i = 0; i < 700; i++) { const s = r() < 0.5 ? -1 : 1, x = s * (12.4 + r() * 2.6), z = -40 + r() * 54; if (Math.abs(z) < 2.2) continue; reed.push([x, -0.2, z, 1, 1.4 + r() * 1.6, 1, r() * 6, (r() - 0.5) * 0.3, (r() - 0.5) * 0.3]); } inst(G, bladeGeo, col('#5a8a3a'), reed);
    for (let i = 0; i < 50; i++) { const s = i % 2 ? 1 : -1, x = s * (20 + r() * 50), z = -70 + r() * 80; (i % 3 ? tree : pine)(G, x, z, 4 + r() * 4, i % 3 ? 2 + r() : null); }
    tufts(G, 93, 2200, [-44, 44, -30, 12], ['#7aa050', '#94b860', '#5a8a3a'], 0.5, (x, z) => Math.abs(x) > 17 && Math.abs(z) > 2);
    ring(G, 94, 16, 170, 300, (x, z, rr, i) => hillM(G, x, z, 60 + rr() * 50, 0.5 + rr() * 0.3, col(i % 2 ? '#5a8a4a' : '#6a9a55')));
    ring(G, 95, 14, 520, 720, (x, z, rr) => peak(G, x, z, 130 + rr() * 80, 150 + rr() * 130, col('#8f9cc0'), col('#f4f6fa')));
    pine(G, -9, 6.2, 5); bushes(G, 96, 8, [16, 19, 4.5, 6.5], ['#5a8a3a', '#7aa050'], 0.7);
  }
  // =====================================================================
  // 8. PRAIRIE with the telegraph line (and the telegraph office)
  // =====================================================================
  { const G = setG('prairie'), r = P.rng(101);
    ground(G, texM(gnd(22, '#b4ac58', ['#a09a48', '#c8c06c', '#94944a', '#d4c878']), 300, 300));
    patch(G, texM(gnd(23, '#c2a472', ['#b08c5c', '#d0b484']), 60, 1), 200, 1.6, 1200, 3.6, 0.014);
    const PZ = -4, PH = 6.4, STEP = 16, N = 34; S.poleX = (i) => -40 + i * STEP; S.PZ = PZ; S.PH = PH; S.poles = []; S.wires = [];
    const poleM = col('#7a5a3c'), insM = col('#bfe0d8'), wireM = basic('#1c1a20');
    const mkPole = (parent) => { const g = new THREE.Group(); parent.add(g); add(cyl(0.11, 0.16, PH + 0.5, 8), poleM, 0, (PH + 0.5) / 2, 0, g); add(tbox(1.5, 0.14, 0.14, 1), poleM, 0, PH - 0.1, 0, g); for (const s of [-1, 1]) { add(cyl(0.06, 0.08, 0.2, 6), insM, s * 0.55, PH + 0.08, 0, g); const br = add(tbox(0.06, 0.8, 0.06, 1), poleM, s * 0.3, PH - 0.45, 0, g); br.rotation.z = s * 0.7; } return g; };
    for (let i = 0; i < N; i++) { const g = mkPole(G); g.position.set(S.poleX(i), 0, PZ); g.rotation.y = Math.PI / 2 + (r() - 0.5) * 0.1; S.poles.push(g);
      if (i < N - 1) { const wg = sub(G); for (let k = 0; k < 6; k++) { const t0 = k / 6, t1 = (k + 1) / 6, y0 = PH + 0.2 - Math.sin(t0 * Math.PI) * 0.55, y1 = PH + 0.2 - Math.sin(t1 * Math.PI) * 0.55, L = Math.hypot(STEP / 6, y1 - y0); const w = add(tbox(L + 0.02, 0.035, 0.035, 1), wireM, S.poleX(i) + (t0 + t1) / 2 * STEP, (y0 + y1) / 2, PZ + 0.55, wg, { cast: false }); w.rotation.z = Math.atan2(y1 - y0, STEP / 6); w.userData.ndSkip = true; } S.wires.push(wg); } }
    S.wireY = (x) => { const t = (((x + 40) % STEP) + STEP) % STEP / STEP; return PH + 0.2 - Math.sin(t * Math.PI) * 0.55; };
    S.raise = mkPole(G); S.raise.rotation.order = 'YZX';
    // work gear: spool cart, pole stack, ladder, crates
    const Gr = sub(G); S.gear = Gr;
    { const g = sub(Gr, -3, 0, -6.2, 0.3); add(tbox(1.6, 0.25, 2.6, 1), M.plankF, 0, 0.75, 0, g); for (const sx of [-1, 1]) { const w = add(new THREE.TorusGeometry(0.62, 0.08, 6, 16), M.woodD, sx * 0.95, 0.66, 0, g); w.rotation.y = Math.PI / 2; } const sp = add(cyl(0.6, 0.6, 0.9, 16), col('#3a3a44'), 0, 1.55, 0, g); sp.rotation.z = Math.PI / 2; for (const s of [-1, 1]) { const d = add(cyl(0.85, 0.85, 0.08, 16), M.woodL, s * 0.5, 1.55, 0, g); d.rotation.z = Math.PI / 2; } }
    for (let i = 0; i < 5; i++) { const l = add(cyl(0.13, 0.15, 6, 8), poleM, 5 + (i % 3) * 0.1, 0.15 + ((i / 3) | 0) * 0.27, -6.6 + (i % 3) * 0.32, Gr); l.rotation.z = Math.PI / 2; }
    crate(Gr, 2.2, -5.4, 0.6, 0.4); crate(Gr, 2.9, -5.9, 0.5, 1.0); barrel(Gr, -5.6, -5.2, 0.8);
    // telegraph office (x = -52)
    const Of = sub(G, -52, 0, -5.5); S.office = Of;
    add(tbox(6, 3.4, 5, 2), M.plankD, 0, 1.7, 0, Of); add(tbox(6.3, 5.2, 0.3, 2), M.plankA, 0, 2.6, 2.6, Of); add(tbox(6.6, 0.3, 0.5, 1), M.woodD, 0, 5.3, 2.6, Of);
    const tg = canvasTex(1100, 320, (c, w, h) => { board(c, w, h, '#2f4f5a', '#e2c070'); paint(c, 'Telegraf', w, h, { size: 190, fill: '#f6e3a8', stroke: '#1c1410', seed: 6, track: 10 }); });
    add(tbox(3.9, 1.16, 0.1, 1), M.woodD, 0, 4.25, 2.78, Of); signPlane(Of, tg, 3.8, 1.1, 0, 4.25, 2.84);
    add(tbox(1.2, 2.2, 0.12, 1), M.plankF, -1.4, 1.1, 2.78, Of, { cast: false }); add(tbox(1.7, 1.3, 0.1, 1), M.white, 1.3, 1.75, 2.78, Of, { cast: false }); add(tbox(1.5, 1.1, 0.12, 1), glow('#ffd88a', 0.9), 1.3, 1.75, 2.8, Of, { cast: false });
    add(tbox(6.4, 0.14, 2.2, 1.2), M.roof, 0, 2.95, 3.7, Of).rotation.x = 0.14; for (const x of [-2.9, 2.9]) add(tbox(0.16, 2.8, 0.16, 1), M.woodD, x, 1.4, 4.6, Of); add(tbox(6, 0.2, 2.2, 2), M.plankE, 0, 0.1, 3.7, Of);
    add(cyl(0.08, 0.1, 2.4, 6), poleM, 2.6, 6.2, 2.4, Of); add(cyl(0.07, 0.09, 0.22, 6), insM, 2.6, 7.45, 2.4, Of); S.officeTop = [-52 + 2.6, 7.5, -5.5 + 2.4];
    { const a = [S.officeTop[0], S.officeTop[1], S.officeTop[2]], b = [S.poleX(0), PH + 0.2, PZ + 0.55], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const w = add(tbox(L, 0.035, 0.035, 1), wireM, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, G, { cast: false }); w.lookAt(b[0], b[1], b[2]); w.rotateY(Math.PI / 2); w.userData.ndSkip = true; S.officeWire = w; }
    barrel(Of, 3.6, 3.4); crate(Of, -3.6, 3.2, 0.7);
    const okP = (x, z) => Math.abs(z - 1.6) > 1.7 && !(x < -44 && x > -60 && z < 0 && z > -9);
    tufts(G, 102, 6000, [-70, 420, -30, 12], ['#b8b060', '#d0c478', '#94944c', '#c8a850'], 0.6, okP); bushes(G, 103, 160, [-70, 420, -60, -9], ['#8a9a4a', '#a8a85a', '#7a8a44'], 0.6);
    for (let i = 0; i < 70; i++) { const x = -70 + r() * 480, z = 4.4 + r() * 2.4; add(sph(0.3 + r() * 0.25, 7, 5), col(i % 2 ? '#8a9a4a' : '#a8a85a'), x, 0.15, z, G).scale.y = 0.7; }
    { const g = sub(G, 204.5, 0, -6, 0.4), m = col('#6a5040'); add(cyl(0.14, 0.26, 4.2, 7), m, 0, 2.1, 0, g).rotation.z = -0.08; for (const [y, l, a] of [[3.4, 2.2, 0.9], [2.8, 1.6, -1.0], [4.0, 1.2, -0.5]]) { const b = add(cyl(0.04, 0.09, l, 5), m, Math.sin(a) * l * -0.45, y + Math.cos(a) * l * 0.4, 0, g); b.rotation.z = a; }
      const w = add(new THREE.TorusGeometry(0.62, 0.07, 6, 18), M.woodD, -2.2, 0.55, 1.2, g); w.rotation.x = 0.5; for (let i = 0; i < 4; i++) { const sp = add(tbox(0.05, 1.2, 0.05, 1), M.woodD, -2.2, 0.55, 1.2, g); sp.rotation.z = i * Math.PI / 4; sp.rotation.x = 0.5; } }
    rocks(G, 104, 80, [-70, 420, -30, 10], '#9a8a7a', 0.25, okP);
    for (let i = 0; i < 26; i++) { const x = -90 + r() * 560, z = -40 - r() * 80; tree(G, x, z, 4 + r() * 3, 2 + r(), col('#7a9a48'), col('#94b05a')); }
    ring(G, 105, 22, 220, 380, (x, z, rr, i) => hillM(G, x + 170, z, 60 + rr() * 70, 0.4 + rr() * 0.25, col(i % 2 ? '#a8a45a' : '#94a050')));
    ring(G, 106, 18, 640, 820, (x, z, rr) => peak(G, x + 170, z, 140 + rr() * 90, 150 + rr() * 150, col('#8f9cc0'), col('#f4f6fa')));
  }
  // =====================================================================
  // 9. ROOM (empty desk with candle + letter / telegraph office desk / print shop)
  // =====================================================================
  { const G = setG('room');
    const fl = add(tbox(12, 0.2, 9, 1.6), plankT('#8a6a48'), 0, -0.1, 0, G); const bw = add(tbox(12, 5, 0.2, 1.6), plankT('#a88660'), 0, 2.5, -2.6, G); for (const s of [-1, 1]) add(tbox(0.2, 5, 9, 1.6), plankT('#96785a'), s * 5.2, 2.5, 0, G); add(tbox(12, 0.2, 9, 2), M.plankF, 0, 4.6, 0, G, { cast: false });
    for (let i = -2; i <= 2; i++) add(tbox(0.22, 0.3, 9, 1), M.woodD, i * 2.4, 4.35, 0, G);
    // window with light shaft
    add(tbox(2.1, 2.3, 0.1, 1), M.woodD, -2.6, 2.6, -2.48, G, { cast: false }); const pane = add(new THREE.PlaneGeometry(1.8, 2), basic('#cfe6ff'), -2.6, 2.6, -2.41, G, { cast: false }); pane.userData.ndSkip = true; S.pane = pane;
    add(tbox(0.08, 2, 0.1, 1), M.woodD, -2.6, 2.6, -2.4, G, { cast: false }); add(tbox(1.8, 0.08, 0.1, 1), M.woodD, -2.6, 2.6, -2.4, G, { cast: false });
    const rayT = canvasTex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,236,190,0.75)'); g.addColorStop(1, 'rgba(255,236,190,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const ray = add(new THREE.PlaneGeometry(1.9, 6), new THREE.MeshBasicMaterial({ map: rayT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), -1.2, 1.5, -0.9, G, { cast: false }); ray.rotation.set(-0.5, 0.35, -0.75); ray.userData.ndSkip = true; S.ray = ray;
    const spot = add(new THREE.PlaneGeometry(2.4, 2.2), new THREE.MeshBasicMaterial({ color: '#ffe2a0', transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }), 0.4, 0.012, 0.9, G, { cast: false }); spot.rotation.x = -Math.PI / 2; spot.rotation.z = 0.4; spot.userData.ndSkip = true; S.spot = spot;
    // desk
    const Dk = sub(G); S.desk = Dk; add(tbox(2.8, 0.1, 1.3, 1), plankT('#7a5232'), 0, 0.98, 0, Dk); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.12, 0.95, 0.12, 1), M.woodD, sx * 1.25, 0.475, sz * 0.52, Dk); add(tbox(2.6, 0.3, 0.06, 1), M.woodD, 0, 0.8, 0.6, Dk);
    // shelf + clock (no numerals) on the back wall
    add(tbox(2.6, 0.08, 0.4, 1), M.woodD, 2.4, 3.0, -2.35, G); for (let i = 0; i < 6; i++) add(tbox(0.16 + (i % 3) * 0.05, 0.5 + (i % 2) * 0.12, 0.3, 1), col(['#8a2f3a', '#3a5a8a', '#4a7a4a', '#c8a048'][i % 4]), 1.5 + i * 0.3, 3.3, -2.35, G);
    { const g = sub(G, 0.9, 3.2, -2.46); add(cyl(0.42, 0.42, 0.1, 20), M.woodD, 0, 0, 0, g).rotation.x = Math.PI / 2; add(cyl(0.34, 0.34, 0.12, 20), M.paper, 0, 0, 0.01, g, { cast: false }).rotation.x = Math.PI / 2; const h1 = add(tbox(0.03, 0.26, 0.02, 1), M.iron, 0, 0.1, 0.09, g, { cast: false }), h2 = add(tbox(0.03, 0.18, 0.02, 1), M.iron, 0.07, 0.03, 0.09, g, { cast: false }); h2.rotation.z = -1.1; }
    // variant A: candle + letter
    const A = sub(G); S.rmTable = A;
    add(cyl(0.16, 0.2, 0.05, 12), M.brass, -0.55, 1.055, -0.1, A); add(cyl(0.05, 0.055, 0.34, 8), col('#f4ead0'), -0.55, 1.25, -0.1, A); const fl2 = add(new THREE.ConeGeometry(0.045, 0.16, 8), glow('#ffb040', 2.2), -0.55, 1.52, -0.1, A, { cast: false }); S.flame = fl2; S.flameAt = [-0.55, 1.5, -0.1];
    const let_ = canvasTex(400, 560, (c, w, h) => { c.fillStyle = '#f4ecd6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6a5a4a'; c.lineWidth = 5; c.lineCap = 'round'; for (let i = 0; i < 9; i++) { c.beginPath(); for (let x = 50; x < (i === 8 ? 220 : 350); x += 8) c.lineTo(x, 80 + i * 46 + Math.sin(x * 0.19 + i * 2) * 5 + Math.sin(x * 0.07) * 3); c.stroke(); } c.fillStyle = '#b8282b'; c.beginPath(); c.arc(310, 480, 26, 0, 7); c.fill(); });
    const lt = add(new THREE.PlaneGeometry(0.55, 0.77), new THREE.MeshToonMaterial({ map: let_, gradientMap: ctx.grad }), 0.25, 1.036, 0.1, A, { cast: false }); lt.rotation.x = -Math.PI / 2; lt.rotation.z = 0.25;
    add(cyl(0.06, 0.07, 0.1, 8), M.iron, 0.85, 1.08, -0.25, A); const ql = add(tbox(0.02, 0.5, 0.06, 1), M.white, 0.9, 1.3, -0.25, A); ql.rotation.z = -0.5;
    // variant B: telegraph desk
    const Bv = sub(G); S.rmOffice = Bv;
    add(tbox(0.7, 0.05, 0.36, 1), M.woodD, 0, 1.055, 0.25, Bv); const lev = sub(Bv, 0.05, 1.16, 0.25); S.keyLever = lev; add(tbox(0.56, 0.035, 0.07, 1), M.brass, -0.05, 0, 0, lev); add(cyl(0.07, 0.07, 0.035, 12), col('#1c1a20'), -0.3, 0.035, 0, lev);
    for (const x of [-0.1, 0.2]) add(tbox(0.05, 0.1, 0.16, 1), M.brass, x, 1.11, 0.25, Bv); add(cyl(0.03, 0.03, 0.06, 8), M.brass, -0.25, 1.1, 0.25, Bv); S.keyAt = [-0.25, 1.14, 0.25];
    { const g = sub(Bv, 0.85, 1.03, -0.1); add(tbox(0.5, 0.05, 0.32, 1), M.woodD, 0, 0.025, 0, g); for (const s of [-1, 1]) add(cyl(0.085, 0.085, 0.22, 10), col('#8a2a22'), s * 0.11, 0.16, 0, g); add(tbox(0.34, 0.04, 0.06, 1), M.brass, 0, 0.3, 0, g); }
    { const g = sub(Bv, -0.95, 1.03, -0.2); add(cyl(0.16, 0.16, 0.34, 12), col('#7ab8c8', { transparent: true, opacity: 0.8 }), 0, 0.17, 0, g); add(cyl(0.17, 0.17, 0.04, 12), M.iron, 0, 0.36, 0, g); for (const s of [-1, 1]) add(cyl(0.02, 0.02, 0.12, 6), M.brass, s * 0.07, 0.44, 0, g); }
    { const w = add(tbox(0.025, 2.2, 0.025, 1), basic('#1c1a20'), -0.95, 2.6, -0.2, Bv, { cast: false }); w.userData.ndSkip = true; const w2 = add(tbox(0.7, 0.02, 0.02, 1), basic('#1c1a20'), -0.6, 1.1, 0.0, Bv, { cast: false }); w2.rotation.y = -0.6; w2.userData.ndSkip = true; }
    add(tbox(0.5, 0.012, 0.36, 1), M.paper, 0.75, 1.04, 0.36, Bv, { cast: false }).rotation.y = 0.2; { const g = sub(Bv, -1.15, 1.03, 0.35); add(cyl(0.11, 0.14, 0.05, 10), M.brass, 0, 0.025, 0, g); add(cyl(0.03, 0.03, 0.3, 6), M.brass, 0, 0.2, 0, g); add(new THREE.ConeGeometry(0.2, 0.2, 12, 1, true), col('#3a8a5a', { side: THREE.DoubleSide }), 0, 0.42, 0, g); add(sph(0.06, 8, 6), glow('#ffe0a0', 2), 0, 0.36, 0, g, { cast: false }); S.lampAt = [-1.15, 1.42, 0.35]; }
    // variant C: print shop (hand press, stacks, flying newspapers)
    const Cv = sub(G); S.rmPress = Cv;
    const news = canvasTex(900, 1200, (c, w, h) => { c.fillStyle = '#f2ead4'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2420'; c.fillRect(40, 36, w - 80, 10); c.fillRect(40, 330, w - 80, 8);
      c.font = 'bold 150px "DejaVu Serif", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Die Rede', w / 2, 128); c.font = 'bold 88px "DejaVu Serif", Georgia, serif'; c.fillText('des Präsidenten', w / 2, 262);
      for (let col_ = 0; col_ < 3; col_++) for (let i = 0; i < 26; i++) { c.fillStyle = i % 9 === 0 ? '#2a2420' : '#8a8274'; c.fillRect(50 + col_ * 275, 380 + i * 30, (i % 9 === 8 ? 150 : 250), i % 9 === 0 ? 14 : 8); } });
    const newsM = new THREE.MeshBasicMaterial({ map: news, side: THREE.DoubleSide }); S.newsM = newsM;
    const newsB = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(450, 600, (c, w, h) => { c.fillStyle = '#f2ead4'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2420'; c.fillRect(20, 18, w - 40, 6); c.fillRect(20, 60, w - 40, 26); c.fillRect(20, 100, w - 40, 5);
      for (let k = 0; k < 3; k++) for (let i = 0; i < 30; i++) { c.fillStyle = i % 9 === 0 ? '#2a2420' : '#8a8274'; c.fillRect(25 + k * 137, 122 + i * 15, i % 9 === 8 ? 75 : 125, i % 9 === 0 ? 7 : 4); } }) });
    { const g = sub(Cv, -1.9, 0, -1.0, 0.25); add(tbox(2.2, 0.9, 1.4, 1), M.woodD, 0, 0.45, 0, g); add(tbox(2.3, 0.12, 1.5, 1), M.iron, 0, 0.96, 0, g); for (const s of [-1, 1]) add(tbox(0.22, 2.6, 0.3, 1), M.iron, s * 0.95, 2.2, -0.3, g); add(tbox(2.3, 0.3, 0.4, 1), M.iron, 0, 3.45, -0.3, g); add(cyl(0.09, 0.09, 1.3, 10), M.brass, 0, 2.8, -0.3, g);
      const pl = add(tbox(1.5, 0.16, 1.0, 1), M.iron, 0, 1.6, -0.2, g); S.platen = pl; const hd = add(tbox(1.5, 0.08, 0.08, 1), M.woodL, 0.6, 2.7, -0.3, g); S.pressBar = hd; add(sph(0.2, 10, 8), M.brass, 0, 3.75, -0.3, g);
      const np = add(new THREE.PlaneGeometry(0.9, 1.2), newsM, 0, 1.03, 0.0, g, { cast: false }); np.rotation.x = -Math.PI / 2; np.userData.ndSkip = true; }
    for (let i = 0; i < 16; i++) { const p_ = add(tbox(0.92, 0.03, 1.22, 1), M.paper, 1.75 + (i % 3 - 1) * 0.02, 0.985 + i * 0.03 - 0.98 + 0.5, 0.2 + (i % 2) * 0.02, Cv); p_.rotation.y = (i % 5 - 2) * 0.03; }
    add(tbox(1.3, 0.5, 1.5, 1), M.plankF, 1.75, 0.25, 0.2, Cv);
    const top = add(new THREE.PlaneGeometry(0.9, 1.2), newsM, 1.75, 1.005, 0.2, Cv, { cast: false }); top.rotation.x = -Math.PI / 2; top.userData.ndSkip = true;
    S.fly = []; for (let i = 0; i < 9; i++) { const m = add(new THREE.PlaneGeometry(0.9, 1.2), newsB, 0, 0, 0, Cv, { cast: false }); m.userData.ndSkip = true; S.fly.push(m); }
    S.hero = add(new THREE.PlaneGeometry(0.9, 1.2), newsM, 0, 0, 0, Cv, { cast: false }); S.hero.userData.ndSkip = true;
    for (let i = 0; i < 5; i++) { const l = add(tbox(0.03, 0.6, 0.03, 1), M.iron, -4 + i * 2, 4.05, -1.6, Cv, { cast: false }); const sh = add(new THREE.PlaneGeometry(0.9, 1.2), newsB, -4 + i * 2, 3.15, -1.6, Cv, { cast: false }); sh.userData.ndSkip = true; sh.rotation.y = (i % 2 ? 0.2 : -0.15); } add(tbox(10, 0.03, 0.03, 1), M.iron, 0, 3.78, -1.6, Cv, { cast: false });
    barrel(Cv, 3.6, -1.6); crate(Cv, -3.9, 0.4, 0.8, 0.2);
  }
  // =====================================================================
  // 10. FINAL HILL at sunset
  // =====================================================================
  { const G = setG('hill'), r = P.rng(121);
    ground(G, texM(gnd(30, '#6a5a4a', ['#5a4a40', '#7a6a50', '#8a7050']), 300, 300), -6);
    const hm = col('#6a5c44'); const h = add(sph(40, 40, 20), hm, 0, -34, 0, G, { cast: false }); h.scale.set(1.5, 1, 1.1); S.hillTop = 6;
    hillM(G, -70, -60, 50, 0.5, col('#5a4a44')); hillM(G, 90, -90, 70, 0.45, col('#55444a')); hillM(G, 60, 40, 50, 0.3, col('#5f5040'));
    const poleM = col('#3a2c24'), wireM = basic('#141018'); S.hillPoles = [];
    const pp = [[-26, 2.2, 0.2], [-7.5, 5.3, -1.2], [11, 5.0, -2.4], [29, 1.9, -3.8], [48, -3, -5.4]];
    pp.forEach(([x, y, z]) => { const g = sub(G, x, y, z); add(cyl(0.11, 0.16, 7, 8), poleM, 0, 3.4, 0, g); add(tbox(0.14, 0.14, 1.5, 1), poleM, 0, 6.5, 0, g); for (const s of [-1, 1]) add(cyl(0.06, 0.08, 0.2, 6), col('#8ab0a8'), 0, 6.66, s * 0.55, g); });
    S.hillWire = (t) => { const i = Math.min(pp.length - 2, Math.floor(t)), u = t - i, a = pp[i], b = pp[i + 1]; return [a[0] + (b[0] - a[0]) * u, a[1] + 6.8 + (b[1] - a[1]) * u - Math.sin(u * Math.PI) * 0.7, a[2] + 0.55 + (b[2] - a[2]) * u]; };
    for (let i = 0; i < pp.length - 1; i++) for (let k = 0; k < 8; k++) { const a = S.hillWire(i + k / 8), b = S.hillWire(i + (k + 1) / 8), L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const w = add(tbox(L + 0.02, 0.04, 0.04, 1), wireM, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, G, { cast: false }); w.lookAt(b[0], b[1], b[2]); w.rotateY(Math.PI / 2); w.userData.ndSkip = true; }
    const gl = []; for (let i = 0; i < 5200; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 38, x = Math.cos(a) * d * 1.5, z = Math.sin(a) * d * 1.1, y = -34 + Math.sqrt(Math.max(0, 1600 - (x / 1.5) ** 2 - (z / 1.1) ** 2)); if (y < -2) continue; gl.push([x, y - 0.05, z, 1.1, 0.3 + r() * 0.5, 1.1, r() * 6, (r() - 0.5) * 0.6, (r() - 0.5) * 0.6]); }
    inst(G, bladeGeo, col('#7a6a48'), gl.filter((_, i) => i % 2)); inst(G, bladeGeo, col('#5f5238'), gl.filter((_, i) => !(i % 2)));
    for (let i = 0; i < 16; i++) { const x = -150 + i * 45 + r() * 30, z = -260 - r() * 240, w = 26 + r() * 40, hh = 40 + r() * 60; const g = sub(G, x, -6, z); add(cyl(w * 0.72, w * 1.05, hh * 0.36, 9), col('#4a3040'), 0, hh * 0.18, 0, g, { cast: false }); add(cyl(w * 0.55, w * 0.62, hh * 0.64, 8), col('#55344a'), 0, hh * 0.68, 0, g, { cast: false }); }
    ring(G, 123, 16, 700, 900, (x, z, rr) => peak(G, x, z, 150 + rr() * 90, 120 + rr() * 120, col('#5a3a5a')));
    for (const [x, z, hh] of [[-16, -6, 2.6], [20, 8, 3.2], [-30, 10, 2.2]]) { const yy = -34 + Math.sqrt(Math.max(0, 1600 - (x / 1.5) ** 2 - (z / 1.1) ** 2)); const g = sub(G, x, yy - 0.2, z); add(cyl(0.24, 0.28, hh, 8), col('#2f4a36'), 0, hh / 2, 0, g); add(sph(0.24, 8, 6), col('#2f4a36'), 0, hh, 0, g); const a = add(cyl(0.13, 0.13, 0.9, 6), col('#2f4a36'), 0.55, hh * 0.6 + 0.3, 0, g); }
  }
  addClouds(22, 90, 620, 90);
  S.cloudBase = ctx.clouds.map((c) => c.position.clone());
};

export const update = (ctx, W, f) => {
  const { THREE } = ctx;
  for (const k in S.sets) S.sets[k].visible = k === W.set;
  // clouds: drift, tint, hide
  ctx.clouds.forEach((c, i) => { c.visible = W.cloud !== 0; c.material.color.set(W.cloud || '#ffffff'); const b = S.cloudBase[i]; c.position.set(b.x + f * 0.05 * (1 + (i % 3) * 0.4), b.y * (W.cloudY || 1), b.z); c.material.opacity = W.cloudA ?? 1; });
  // crowds bob
  const cheer = W.cheer ? 1 : 0;
  for (const p of S.people) p.mesh.position.y = p.y0 + Math.abs(Math.sin(f * (p.amp > 0.1 ? 0.42 : 0.12) + p.ph)) * p.amp;
  S.townWait.visible = !cheer && W.crowd !== 0; S.townCheer.visible = !!cheer && W.crowd !== 0;
  if (S.bell) S.bell.rotation.x = cheer ? Math.sin(f * 0.5) * 0.5 : 0;
  // lamps flicker
  for (const a of S.anim) if (a.lamp) a.lamp.material.emissiveIntensity = (W.dusk ? 2.2 : 0.5) * (0.9 + 0.1 * Math.sin(f * 0.9 + a.lamp.id));
  // station
  S.big.visible = !!W.big; S.closed.visible = !!W.closed;
  if (W.closed) { const k = Math.min(1, W.closed); S.closed.position.set(1.1, 1.45 + (1 - k) * 0.5, 2.86 + (1 - k) * 0.5); S.closed.rotation.z = -0.07 - (1 - k) * 0.5; S.closed.scale.setScalar(0.88); }
  for (const w of S.stWin) w.material = W.dusk ? S.bigWin[0].material : w.userData.day || (w.userData.day = w.material);
  // prairie
  const np = W.poles ?? 99; S.poles.forEach((p, i) => { p.visible = i < np; }); S.wires.forEach((w, i) => { w.visible = i < (W.wires ?? np) - 1; });
  S.office.visible = !!W.office; S.officeWire.visible = !!W.office; S.gear.visible = !!W.gear; if (W.gear) S.gear.position.x = W.gear;
  S.raise.visible = !!W.raise; if (W.raise) { S.raise.position.set(W.raise.x, 0, S.PZ); S.raise.rotation.set(0, Math.PI / 2, 0); S.raise.rotateX(-(1 - W.raise.k) * 1.15); }
  // room
  const rm = W.room; S.rmTable.visible = rm === 'table'; S.rmOffice.visible = rm === 'office'; S.rmPress.visible = rm === 'press'; S.desk.visible = rm !== 'press';
  S.pane.material.color.set(rm === 'table' ? '#27375f' : '#d6ebff'); S.ray.visible = S.spot.visible = rm !== 'table';
  if (rm === 'table') { S.flame.scale.set(1 + 0.15 * Math.sin(f * 1.3), 1 + 0.25 * Math.sin(f * 0.9 + 1), 1); S.flame.position.x = -0.55 + 0.008 * Math.sin(f * 0.7); }
  if (rm === 'office') S.keyLever.rotation.z = (W.key || 0) * 0.12;
  if (rm === 'press') { const k = W.press || 0; S.platen.position.y = 1.6 - k * 0.52; S.pressBar.rotation.y = -k * 1.1;
    S.fly.forEach((m, i) => { const t = ((f * 0.022 + i * 0.137) % 1), a = i * 2.1; m.visible = (W.fly || 0) > i / 9; m.position.set(-1.9 + t * (3.2 + (i % 3) * 0.8) + Math.sin(a) * 0.4, 1.3 + Math.sin(t * Math.PI) * (1.5 + (i % 4) * 0.35) + (i % 3) * 0.2, 0.2 + Math.cos(a) * 0.9 + t * 0.8); m.rotation.set(-0.6 + Math.sin(f * 0.13 + a) * 0.5, Math.sin(f * 0.1 + a * 2) * 0.7, Math.sin(f * 0.17 + a) * 0.5); m.scale.setScalar(0.75); });
    const h = W.hero; S.hero.visible = !!h; if (h) { S.hero.position.set(...h.pos); S.hero.rotation.set(h.rx || 0, h.ry || 0, h.rz || 0); S.hero.scale.setScalar(h.s || 1); } }
};
export const info = () => S;
