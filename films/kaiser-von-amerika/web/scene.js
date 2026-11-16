// scene.js: "Der Kaiser von Amerika" — 1800s San Francisco.
// Sets (each its own group, only the active one is shown):
//   street : sloped golden street (M1/M6/M9) down to the bay, harbour ships, pier (M7), far shore, the bridge (M8)
//   office : rich office / empty room / candle-lit room (M2)
//   press  : newspaper printing hall (M3)
//   congress: congress hall (M4)
//   shop   : grocery shop with its display window (M5)
// All visible writing is German.
let S = {};
export const SET = { office: [200, 0, 0], press: [300, 0, 0], congress: [400, 0, 0], shop: [500, 0, 0] };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sm = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
/** street ground height: flat crest, then down the hill to the bay (water at y = -14) */
export const H = (z) => (z > -24 ? 0 : -14.6 * sm((-24 - z) / 58));
export const WATER = -14;
export const PIER = { x: 10, y: -12.6, z0: -80, z1: -122 };
export const BRIDGE = { x: -80, z: -300, deck: 8, tower: 118, top: 74 };

export const build = (ctx) => {
  const { THREE, T, P, scene, world, add, tbox, toon, texM, canvasTex, addClouds, waterMat, waterNd } = ctx;
  const rng = P.rng(7);
  const G = (parent = world, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const basic = (map, o = {}) => new THREE.MeshBasicMaterial({ map, ...o });
  const flat = (o) => { const m = add(o.geo, o.mat, o.x, o.y, o.z, o.p, { cast: o.cast ?? false }); if (o.nd === false) m.userData.ndSkip = true; return m; };
  const emis = (c, k = 1.2) => toon({ color: c, emissive: c, emissiveIntensity: k });
  const cyl = (rt, rb, h, n = 10) => new THREE.CylinderGeometry(rt, rb, h, n);
  const sph = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b);
  // depth-only material for billboards (so lens blur knows where they are, the world ink skips them)
  const bbNd = (map) => new THREE.ShaderMaterial({ uniforms: { map: { value: map } }, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }` });
  const sets = {}; for (const k of ['street', 'office', 'press', 'congress', 'shop']) { sets[k] = G(world, ...(SET[k] || [0, 0, 0])); }
  S.sets = sets;

  // ---------- painted textures ----------
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const siding = (seed) => cv(256, 256, (g, w, h) => { const r = P.rng(seed); g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { g.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.05})`; g.fillRect(0, y, w, 16); g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, y + 14, w, 2); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, y, w, 2); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(60,40,20,${r() * 0.08})`; g.fillRect(r() * w, r() * h, 2 + r() * 30, 2 + r() * 8); } });
  const brick = (seed, hue = 10) => P.stone(seed, hue, 52, 44, 64, 24);
  const cobble = P.stone(21, 32, 22, 58, 56, 40);
  const wallpaper = cv(256, 256, (g, w, h) => { g.fillStyle = '#2e5a46'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = '#3a6a52'; g.fillRect(x, 0, 14, h); }
    g.fillStyle = '#c8a44a'; for (let y = 16; y < h; y += 48) for (let x = 8; x < w; x += 32) { g.beginPath(); g.ellipse(x + ((y / 48) % 2) * 16, y, 5, 9, 0, 0, 7); g.fill(); } });
  const wallpaperPale = cv(256, 256, (g, w, h) => { g.fillStyle = '#8a9a86'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = '#94a490'; g.fillRect(x, 0, 14, h); }
    g.fillStyle = 'rgba(70,60,40,.35)'; for (let i = 0; i < 26; i++) g.fillRect((i * 97) % w, (i * 53) % h, 18, 4); });
  const rugTex = cv(512, 256, (g, w, h) => { g.fillStyle = '#8a1e26'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8a84a'; g.lineWidth = 14; g.strokeRect(18, 18, w - 36, h - 36); g.lineWidth = 4; g.strokeRect(44, 44, w - 88, h - 88);
    g.fillStyle = '#1e2a5a'; g.beginPath(); g.ellipse(w / 2, h / 2, 90, 52, 0, 0, 7); g.fill(); g.fillStyle = '#d8a84a'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.beginPath(); g.arc(w / 2 + Math.cos(a) * 130, h / 2 + Math.sin(a) * 70, 7, 0, 7); g.fill(); } });
  const M = {
    cobble: texM(cobble, 6, 40), walk: texM(P.stone(23, 30, 12, 70, 128, 128), 2, 40), plank: texM(P.planks(5), 2, 2), deck: texM(P.planks(15), 3, 12),
    darkwood: texM(P.planks(25), 2, 2, '#7a4a34'), mahog: toon({ color: '#6a2a1c' }), mahogL: toon({ color: '#8a3a26' }), leather: toon({ color: '#2e5a3a' }),
    iron: toon({ color: '#2a2a30' }), ironG: toon({ color: '#2e4a3c' }), brass: toon({ color: '#d8a83a' }), gold: toon({ color: '#f2c43a', emissive: '#5a3a00', emissiveIntensity: 0.6 }),
    white: toon({ color: '#f4efe2' }), cream: toon({ color: '#f2e2b8' }), glass: toon({ color: '#2c3a5a' }), glassLit: emis('#ffd88a', 0.9),
    lamp: emis('#ffe2a0', 1.4), red: toon({ color: '#b8302c' }), navy: toon({ color: '#24346e' }), rope: toon({ color: '#8a6a44' }),
    hill: toon({ color: '#9a9a5a' }), hill2: toon({ color: '#7e8a52' }), hill3: toon({ color: '#6a7a5a' }), sand: toon({ color: '#c8b07a' }), stoneW: texM(P.stone(31, 30, 10, 56, 96, 48), 6, 2),
    marble: texM(P.marble(10), 1, 2), paper: toon({ color: '#f4ecd6' }), sail: toon({ color: '#f2ead6' }), hull: toon({ color: '#3a2a22' }), hullR: toon({ color: '#8a2a22' }),
    bridge: toon({ color: '#c8462a' }), bridgeD: toon({ color: '#9a3420' }), green: toon({ color: '#3f7a46' }), leaf: toon({ color: '#5a9a40' }),
  };
  S.M = M;
  // painted palettes: sunny golden, wood brown, brick red, plus a few cheerful Victorian paints
  const PAINT = ['#e8b860', '#c88a4a', '#e8d8a8', '#5a9a8a', '#d86a4a', '#8ab0c8', '#e8a0a0', '#b8c870', '#a87a4a', '#f0c878'];
  const TRIM = ['#f6f0e2', '#2e4a5a', '#6a2a2a', '#f6f0e2', '#3a3a5a'];
  const sidingT = siding(3), brickT = [brick(41), brick(42, 16), brick(43, 6)];
  const matCache = {};
  const sidingM = (col) => matCache['s' + col] || (matCache['s' + col] = toon({ map: P.tex(sidingT, 2, 2), color: col }));
  const brickM = (i) => matCache['b' + i] || (matCache['b' + i] = toon({ map: P.tex(brickT[i % 3], 2, 3) }));
  const tm = (c) => matCache['t' + c] || (matCache['t' + c] = toon({ color: c }));

  // shop icon signs (no words): pretzel, boot, hat, scissors, cup, fish, key
  const iconTex = (kind, bg) => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = bg; g.beginPath(); g.ellipse(128, 128, 118, 118, 0, 0, 7); g.fill(); g.lineWidth = 12; g.strokeStyle = '#2a1a10'; g.stroke();
    g.lineWidth = 10; g.strokeStyle = '#d8a83a'; g.beginPath(); g.ellipse(128, 128, 100, 100, 0, 0, 7); g.stroke();
    g.fillStyle = '#2a1a10'; g.strokeStyle = '#2a1a10'; g.lineWidth = 16; g.lineCap = 'round';
    if (kind === 0) { g.beginPath(); g.ellipse(100, 120, 34, 40, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(156, 120, 34, 40, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(80, 170); g.lineTo(176, 170); g.stroke(); }
    if (kind === 1) { g.beginPath(); g.moveTo(96, 60); g.lineTo(140, 60); g.lineTo(140, 150); g.lineTo(196, 170); g.lineTo(196, 196); g.lineTo(96, 196); g.closePath(); g.fill(); }
    if (kind === 2) { g.fillRect(90, 70, 76, 90); g.fillRect(60, 156, 136, 18); }
    if (kind === 3) { g.beginPath(); g.arc(90, 170, 22, 0, 7); g.stroke(); g.beginPath(); g.arc(166, 170, 22, 0, 7); g.stroke(); g.beginPath(); g.moveTo(104, 152); g.lineTo(170, 64); g.moveTo(152, 152); g.lineTo(86, 64); g.stroke(); }
    if (kind === 4) { g.beginPath(); g.moveTo(80, 90); g.lineTo(160, 90); g.lineTo(150, 180); g.lineTo(90, 180); g.closePath(); g.fill(); g.beginPath(); g.arc(166, 126, 22, -1.4, 1.4); g.stroke(); }
    if (kind === 5) { g.beginPath(); g.ellipse(120, 128, 66, 34, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(180, 128); g.lineTo(214, 96); g.lineTo(214, 160); g.closePath(); g.fill(); }
    if (kind === 6) { g.beginPath(); g.arc(90, 128, 28, 0, 7); g.stroke(); g.beginPath(); g.moveTo(118, 128); g.lineTo(200, 128); g.lineTo(200, 156); g.moveTo(176, 128); g.lineTo(176, 152); g.stroke(); }
  });
  const ICONS = [['#f2d27a', 0], ['#c8e0f0', 1], ['#f0c8c8', 2], ['#e0f0c0', 3], ['#f0e0c0', 4], ['#c8e8e0', 5], ['#f2e2a8', 6]].map(([bg, k]) => basic(iconTex(k, bg)));
  const awningTex = (c1, c2) => canvasTex(512, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? c2 : c1; g.fillRect(i * w / 8, 0, w / 8, h * 0.78); g.beginPath(); g.arc((i + 0.5) * w / 8, h * 0.78, w / 16, 0, Math.PI); g.fill(); } });
  const AWN = [['#c8343a', '#f4ead6'], ['#2e6a5a', '#f4ead6'], ['#d8a83a', '#6a2a2a'], ['#3a5a9a', '#f4ead6']].map(([a, b]) => new THREE.MeshToonMaterial({ gradientMap: ctx.grad, map: awningTex(a, b), alphaTest: 0.5, side: THREE.DoubleSide }));

  // ---------- billboards: crowd people, drivers, gulls ----------
  const CW = 300, CHh = 500, texCache = {};
  const personTex = (spec, o) => { const k = JSON.stringify([spec, o]); if (texCache[k]) return texCache[k];
    const c = cv(CW, CHh, (g) => { g.scale(CW / 600, CHh / 1000); T.toonChar(new T.Pen(g), spec, o); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return (texCache[k] = t); };
  const bbGeo = new THREE.PlaneGeometry(1.35, 2.25); bbGeo.translate(0, 2.25 / 2 - 0.056, 0);
  S.bills = [];
  const person = (parent, spec, o, x, y, z, s = 0.85, extra = {}) => {
    const t = personTex(spec, o), m = new THREE.Mesh(bbGeo, new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }));
    m.userData.nd = bbNd(t); m.position.set(x, y, z); m.scale.setScalar(s); m.renderOrder = 2; m.castShadow = true;
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 });
    parent.add(m); m.userData.base = [x, y, z]; Object.assign(m.userData, extra); S.bills.push(m); return m; };
  S.person = person;
  const gullT = [0, 0.25, 0.5, 0.75].map((t) => { const c = cv(300, 500, (g) => { g.scale(0.5, 0.5); T.fxGull(new T.Pen(g), t); }); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; });
  S.gulls = []; S.gullTex = gullT;
  for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.33), new THREE.MeshBasicMaterial({ map: gullT[0], transparent: true, alphaTest: 0.3, side: THREE.DoubleSide }));
    m.userData.ndSkip = true; m.renderOrder = 3; sets.street.add(m); S.gulls.push(m); }

  // crowd presets (all invented): townsfolk mixed ages, workers, ladies, miners, sailors, children
  const TOWN = ['worker', 'lady', 'miner', 'sailor', 'gent', 'boy', 'girl', 'driver', 'grocer', 'editor'];
  S.TOWN = TOWN;

  // ================= STREET =================
  const st = sets.street;
  // ground: cobbled carriageway + raised sidewalks following the hill
  const strip = (x0, x1, z0, z1, mat, dy = 0, seg = 120) => { const geo = new THREE.PlaneGeometry(x1 - x0, z0 - z1, 1, seg); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i) + (z0 + z1) / 2; p.setY(i, H(z) + dy); } geo.computeVertexNormals();
    const m = add(geo, mat, (x0 + x1) / 2, 0, (z0 + z1) / 2, st, { cast: false }); return m; };
  strip(-5.6, 5.6, 60, -84, M.cobble);
  strip(-8.4, -5.6, 60, -84, M.walk, 0.14); strip(5.6, 8.4, 60, -84, M.walk, 0.14);
  for (const x of [-5.62, 5.62]) strip(x - 0.08, x + 0.08, 60, -84, tm('#8a8478'), 0.15);
  // cable-car rails + slot
  for (const x of [-3.15, -1.75, -2.45]) strip(x - 0.05, x + 0.05, 60, -84, x === -2.45 ? tm('#1e1c1a') : tm('#6a6a70'), 0.02);
  // under-ground fill so the hill has a body
  const fill = add(tbox(80, 30, 200, 4), tm('#7a6a52'), 0, -45.2, -20, st, { cast: false });

  // ---------- houses ----------
  const house = (side, z, w, floors, col, opts = {}) => {
    const d = 9, gy = Math.min(H(z - w / 2), H(z + w / 2)), fh = 3.3, hgt = floors * fh + 0.6;
    const g = G(st, side * (8.4 + d / 2), gy, z); g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    const wallM = opts.brick != null ? brickM(opts.brick) : sidingM(col), trim = tm(opts.trim || '#f6f0e2');
    add(tbox(w, hgt + 8, d, 2), wallM, 0, (hgt - 8) / 2, 0, g);
    const F = d / 2; // facade plane
    // cornice with brackets
    add(tbox(w + 0.5, 0.35, 0.8), trim, 0, hgt + 0.1, F + 0.1, g); add(tbox(w + 0.7, 0.18, 1.0), tm(opts.trim2 || '#5a3a2a'), 0, hgt + 0.36, F + 0.2, g);
    for (let x = -w / 2 + 0.3; x <= w / 2 - 0.2; x += 0.9) add(tbox(0.16, 0.42, 0.42), trim, x, hgt - 0.24, F + 0.2, g);
    if (opts.gable) { const gb = add(new THREE.ConeGeometry(w * 0.62, 2.4, 3), wallM, 0, hgt + 1.5, F - 0.6, g); gb.rotation.y = Math.PI; gb.scale.set(1, 1, 0.25); }
    // corner boards + floor bands
    for (const x of [-w / 2 + 0.12, w / 2 - 0.12]) add(tbox(0.24, hgt, 0.12), trim, x, hgt / 2, F + 0.04, g);
    for (let f = 1; f < floors; f++) add(tbox(w, 0.22, 0.14), trim, 0, f * fh + 0.1, F + 0.05, g);
    // ground floor: shop front
    const shop = opts.shop ?? true;
    if (shop) {
      const ww = w * 0.5; add(tbox(ww + 0.3, 2.3, 0.14), trim, -w * 0.16, 1.45, F + 0.05, g);
      add(tbox(ww, 2.0, 0.1), opts.lit ? M.glassLit : M.glass, -w * 0.16, 1.45, F + 0.1, g, { cast: false });
      for (let k = 1; k < 3; k++) add(tbox(0.06, 2.0, 0.06), trim, -w * 0.16 - ww / 2 + k * ww / 3, 1.45, F + 0.16, g);
      add(tbox(1.15, 2.5, 0.12), tm('#4a2a1a'), w * 0.3, 1.25, F + 0.05, g); add(tbox(0.7, 0.9, 0.06), M.glass, w * 0.3, 1.9, F + 0.12, g);
      add(tbox(w, 0.5, 0.18), tm(opts.band || '#2e3a4a'), 0, 2.85, F + 0.1, g);
      const aw = add(new THREE.PlaneGeometry(ww + 0.8, 1.3), AWN[(opts.awn ?? 0) % 4], -w * 0.16, 2.55, F + 0.62, g); aw.rotation.x = -0.95;
      // hanging bracket sign, perpendicular to the facade so the street sees it
      const sg = G(g, w / 2 - 0.3, 3.9, F + 0.9); add(tbox(0.06, 0.06, 1.3), M.iron, 0, 0.55, -0.3, sg);
      const disc = add(new THREE.CircleGeometry(0.42, 24), ICONS[(opts.icon ?? 0) % ICONS.length], 0, 0, 0, sg, { cast: false }); disc.rotation.y = Math.PI / 2; disc.material.side = THREE.DoubleSide; disc.userData.sign = true;
      S.signs = S.signs || []; S.signs.push(sg);
    } else { // stoop and door
      add(tbox(1.3, 2.6, 0.16), tm('#5a2a1a'), 0, 1.6, F + 0.05, g); add(tbox(1.8, 0.3, 1.0), tm('#9a9488'), 0, 0.15, F + 0.5, g); add(tbox(1.6, 0.3, 0.6), tm('#9a9488'), 0, 0.45, F + 0.3, g);
      for (const x of [-1.6, 1.6]) { add(tbox(1.0, 1.6, 0.1), trim, x, 1.7, F + 0.05, g); add(tbox(0.8, 1.4, 0.1), M.glass, x, 1.7, F + 0.08, g); }
    }
    // upper floors: windows, a bay window, balconies
    const bay = opts.bay ?? (w > 6);
    for (let f = 1; f < floors; f++) {
      const y = f * fh + 1.55, n = Math.max(2, Math.floor(w / 2.0));
      for (let k = 0; k < n; k++) {
        const x = -w / 2 + (k + 0.5) * w / n; if (bay && Math.abs(x) < w * 0.2) continue;
        add(tbox(1.0, 1.9, 0.12), trim, x, y, F + 0.06, g); add(tbox(0.78, 1.65, 0.1), rng() < 0.2 ? M.glassLit : M.glass, x, y, F + 0.1, g, { cast: false });
        add(tbox(1.2, 0.12, 0.3), trim, x, y - 1.0, F + 0.15, g); add(tbox(1.25, 0.24, 0.22), trim, x, y + 1.08, F + 0.12, g);
        add(tbox(0.06, 1.6, 0.04), trim, x, y, F + 0.17, g);
        if (rng() < 0.4) for (const s of [-1, 1]) add(tbox(0.36, 1.7, 0.06), tm(opts.shutter || '#2e5a4a'), x + s * 0.72, y, F + 0.08, g);
        if (rng() < 0.35) { add(tbox(1.0, 0.22, 0.28), tm('#6a4228'), x, y - 1.15, F + 0.3, g); for (let q = 0; q < 4; q++) add(sph(0.11, 8, 6), tm(['#e0506a', '#f4dc4a', '#e86aa0', '#f4f0e6'][q]), x - 0.36 + q * 0.24, y - 0.98, F + 0.32, g); }
      }
      if (bay) { // protruding bay window
        const bw = Math.min(2.8, w * 0.4); add(tbox(bw, fh - 0.3, 0.9), wallM, 0, f * fh + fh / 2, F + 0.45, g); add(tbox(bw + 0.2, 0.2, 1.1), trim, 0, f * fh + fh - 0.1, F + 0.5, g);
        for (const x of [-bw / 3, 0, bw / 3]) { add(tbox(bw / 3 - 0.2, 1.7, 0.1), rng() < 0.25 ? M.glassLit : M.glass, x, f * fh + 1.6, F + 0.92, g, { cast: false }); add(tbox(0.08, 1.8, 0.06), trim, x - bw / 6, f * fh + 1.6, F + 0.96, g); }
      }
      if (opts.balcony && f === 1) { const bw = w * 0.8; add(tbox(bw, 0.16, 1.1), trim, 0, fh + 0.1, F + 0.55, g); add(tbox(bw, 0.08, 0.08), trim, 0, fh + 1.1, F + 1.05, g);
        for (let x = -bw / 2; x <= bw / 2 + 0.01; x += 0.3) add(tbox(0.05, 1.0, 0.05), trim, x, fh + 0.6, F + 1.05, g);
        for (let q = 0; q < 5; q++) add(sph(0.2, 8, 6), M.leaf, -bw / 2 + 0.4 + q * bw / 5, fh + 0.35, F + 0.8, g); }
    }
    // flag pole with a waving striped flag (no text)
    if (opts.flag) { const fp = G(g, w * 0.3, floors * fh - 0.5, F + 0.1); fp.rotation.x = 0.7; add(cyl(0.04, 0.05, 3.2, 6), M.brass, 0, 1.6, 0, fp); add(sph(0.08), M.gold, 0, 3.25, 0, fp);
      const fl = flagMesh(fp, 0, 2.4, 0); S.flags.push(fl); }
    return g;
  };
  // waving flag: stars & stripes pattern (no text)
  S.flags = [];
  const flagTex = canvasTex(512, 320, (g, w, h) => { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f4f0e6' : '#c8302c'; g.fillRect(0, i * h / 13, w, h / 13 + 1); }
    g.fillStyle = '#24346e'; g.fillRect(0, 0, w * 0.42, h * 0.54); g.fillStyle = '#f4f0e6'; for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) { g.beginPath(); g.arc(18 + x * 34 + (y % 2) * 8, 18 + y * 32, 6, 0, 7); g.fill(); } });
  const flagM = new THREE.MeshToonMaterial({ gradientMap: ctx.grad, map: flagTex, side: THREE.DoubleSide });
  const flagMesh = (parent, x, y, z, w = 1.9, h = 1.15) => { const geo = new THREE.PlaneGeometry(w, h, 16, 4); geo.translate(w / 2, -h / 2, 0); const m = add(geo, flagM, x, y, z, parent); m.rotation.z = -0.7; m.userData.p0 = geo.attributes.position.array.slice(); return m; };

  // left side (x<0) and right side (x>0) rows, stepping down the hill
  const rowL = [[52, 7, 3], [44, 8, 4, { brick: 0, balcony: true }], [36, 7, 3, { gable: true }], [28, 8, 3, { flag: true }], [20, 7, 4, { brick: 2 }], [12, 8, 3, { balcony: true, gable: true }], [4, 7, 3, { flag: true }], [-4, 8, 4, { brick: 1, balcony: true }], [-12, 7, 3], [-20, 8, 3, { gable: true, flag: true }],
    [-28, 7, 3], [-36, 8, 3, { brick: 0 }], [-44, 7, 3, { gable: true }], [-52, 8, 3], [-60, 7, 3, { brick: 2 }], [-68, 8, 2]];
  const rowR = [[50, 8, 3, { gable: true }], [42, 7, 4, { balcony: true }], [34, 8, 3, { brick: 1 }], [26, 7, 3, { flag: true }], [-1, 8, 3, { balcony: true }], [-9, 7, 4, { brick: 0, flag: true }], [-17, 8, 3, { gable: true }], [-25, 7, 3], [-33, 8, 3, { brick: 2, balcony: true }],
    [-41, 7, 3], [-49, 8, 3, { gable: true }], [-57, 7, 3], [-65, 8, 2, { brick: 1 }]];
  rowL.forEach(([z, w, fl, o = {}], i) => house(-1, z, w, fl, PAINT[i % PAINT.length], { awn: i, icon: i, trim: TRIM[i % TRIM.length] === '#f6f0e2' ? '#f6f0e2' : '#f6f0e2', shutter: ['#2e5a4a', '#6a2a2a', '#2e3a6a'][i % 3], lit: i % 3 === 0, ...o }));
  rowR.forEach(([z, w, fl, o = {}], i) => house(1, z, w, fl, PAINT[(i + 4) % PAINT.length], { awn: i + 1, icon: i + 3, shutter: ['#6a2a2a', '#2e5a4a', '#2e3a6a'][i % 3], lit: i % 3 === 1, ...o }));

  // ---------- police station (right side, z 6..18), door faces -x ----------
  {
    const z = 12, w = 12, d = 9, g = G(st, 8.4 + d / 2, 0, z); g.rotation.y = -Math.PI / 2; const F = d / 2, hgt = 7.2;
    add(tbox(w, hgt + 8, d, 2), brickM(1), 0, (hgt - 8) / 2, 0, g);
    add(tbox(w + 0.6, 0.6, 0.9), M.stoneW, 0, hgt, F + 0.2, g); add(tbox(w + 0.2, 0.9, 0.3), tm('#d8d0c0'), 0, 0.45, F + 0.1, g);
    for (const x of [-w / 2 + 0.3, w / 2 - 0.3, -1.6, 1.6]) add(tbox(0.6, hgt, 0.3), tm('#cfc6b4'), x, hgt / 2, F + 0.12, g);
    // steps
    for (let k = 0; k < 3; k++) add(tbox(3.6 - k * 0.3, 0.18, 1.4 - k * 0.35), tm('#b8b0a0'), 0, 0.09 + k * 0.18, F + 0.75 - k * 0.15, g);
    // doorway with an inside (desk + single lamp) and two door leaves that open
    add(tbox(2.6, 3.2, 0.2), tm('#cfc6b4'), 0, 3.0, F + 0.2, g);
    const inside = G(g, 0, 0, F - 1.6); add(tbox(2.4, 3.2, 3), tm('#3a2a22'), 0, 1.6, -1.2, inside, { cast: false });
    add(tbox(1.4, 0.8, 0.7), M.darkwood, 0.2, 0.4, -0.6, inside); add(sph(0.16), M.lamp, 0.5, 1.0, -0.6, inside);
    add(tbox(2.1, 2.9, 0.1), tm('#1a120e'), 0, 1.45 + 0.54, F + 0.18, g, { cast: false });
    S.doors = [];
    for (const s of [-1, 1]) { const hinge = G(g, s * 1.05, 0.54, F + 0.28); const leaf = add(tbox(1.04, 2.88, 0.1), tm('#3a2418'), -s * 0.52, 1.44, 0, hinge);
      add(tbox(0.7, 0.9, 0.04), tm('#5a3a28'), -s * 0.52, 2.0, 0.06, hinge); add(tbox(0.7, 0.9, 0.04), tm('#5a3a28'), -s * 0.52, 0.85, 0.06, hinge); add(sph(0.06), M.brass, -s * 0.9, 1.4, 0.08, hinge); hinge.userData.s = s; S.doors.push(hinge); }
    // the sign "Polizei"
    const sign = canvasTex(1024, 256, (c, W2, H2) => { c.fillStyle = '#1e2a5a'; c.fillRect(0, 0, W2, H2); c.strokeStyle = '#e8c04a'; c.lineWidth = 16; c.strokeRect(14, 14, W2 - 28, H2 - 28);
      c.font = 'bold 150px Georgia, "DejaVu Serif", serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#f4d26a'; c.fillText('Polizei', W2 / 2, H2 / 2 + 8); });
    add(tbox(3.4, 0.95, 0.12), tm('#e8c04a'), 0, 4.15, F + 0.32, g); const sp = add(new THREE.PlaneGeometry(3.2, 0.8), basic(sign), 0, 4.15, F + 0.39, g, { cast: false }); sp.userData.ndSkip = true; S.policeSign = sp;
    // lamps by the door
    for (const s of [-1, 1]) { add(cyl(0.06, 0.08, 3.2, 8), M.iron, s * 2.1, 1.6, F + 0.9, g); add(tbox(0.36, 0.5, 0.36), M.lamp, s * 2.1, 3.4, F + 0.9, g); add(new THREE.ConeGeometry(0.32, 0.3, 4), M.iron, s * 2.1, 3.8, F + 0.9, g); }
    // barred windows
    for (const x of [-4, 4]) for (const y of [2.0, 5.3]) { add(tbox(1.4, 1.9, 0.12), tm('#cfc6b4'), x, y, F + 0.06, g); add(tbox(1.15, 1.65, 0.1), y < 3 ? M.glassLit : M.glass, x, y, F + 0.1, g, { cast: false }); for (let k = -1; k <= 1; k++) add(tbox(0.05, 1.6, 0.05), M.iron, x + k * 0.3, y, F + 0.18, g); }
    S.station = g;
  }

  // ---------- gas lamps along both sidewalks ----------
  S.lamps = [];
  for (let z = 48; z > -76; z -= 10) for (const x of [-6.2, 6.2]) { if (x > 0 && z > 2 && z < 22) continue; const y = H(z) + 0.14, g = G(st, x, y, z);
    add(cyl(0.08, 0.13, 3.8, 8), M.iron, 0, 1.9, 0, g); add(cyl(0.18, 0.18, 0.3, 8), M.iron, 0, 0.15, 0, g); add(tbox(0.42, 0.55, 0.42), M.lamp, 0, 4.05, 0, g);
    add(new THREE.ConeGeometry(0.4, 0.4, 4), M.iron, 0, 4.5, 0, g).rotation.y = Math.PI / 4; add(tbox(0.7, 0.05, 0.05), M.iron, 0, 3.7, 0, g); S.lamps.push(g); }
  // bunting across the street
  S.bunt = [];
  const buntCols = ['#c8302c', '#f4f0e6', '#24346e', '#e8b84a'];
  for (const z of [-14, 2, 18, 34, -34]) { const y0 = H(z) + 7.2; for (let i = 0; i <= 18; i++) { const t = i / 18, x = -8 + 16 * t, y = y0 - Math.sin(t * Math.PI) * 1.1;
      if (i < 18) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.32, 0, 0, 0.32, 0, 0, 0, -0.62, 0], 3)); geo.computeVertexNormals();
        const fl = add(geo, new THREE.MeshToonMaterial({ gradientMap: ctx.grad, color: buntCols[i % 4], side: THREE.DoubleSide }), x + 0.44, y - 0.04, z, st, { cast: false }); fl.rotation.y = Math.PI / 2 * 0.0; S.bunt.push(fl); }
    }
    const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new THREE.Vector3(-8 + 16 * t, y0 - Math.sin(t * Math.PI) * 1.1, z)); }
    S.bunt.push(add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.025, 4), M.rope, 0, 0, 0, st, { cast: false })); }
  // crates, barrels, sacks, newspaper bundles on the sidewalks (foreground clutter)
  S.clutter = [];
  const crate = (x, z, s = 0.6) => add(tbox(s, s, s, 0.6), M.plank, x, H(z) + 0.14 + s / 2, z, st);
  const barrel = (x, z) => { const m = add(cyl(0.34, 0.3, 0.9, 12), M.darkwood, x, H(z) + 0.6, z, st); add(new THREE.TorusGeometry(0.33, 0.03, 4, 16), M.iron, x, H(z) + 0.85, z, st).rotation.x = Math.PI / 2; return m; };
  for (let k = 0; k < 18; k++) { const z = 46 - k * 7 - rng() * 3, x = (k % 2 ? 1 : -1) * (7.6 + rng() * 0.5); if (x > 0 && z > 2 && z < 22) continue; if (k % 3 === 0) barrel(x, z); else crate(x, z, 0.5 + rng() * 0.3); if (k % 4 === 1) crate(x, z + 0.7, 0.45); }
  // newspaper stacks with string (props near the street corner)
  for (const [x, z] of [[-7.2, -2], [-7.0, 6.5], [7.2, -6]]) for (let k = 0; k < 3; k++) { const m = add(tbox(0.6, 0.18, 0.45), M.paper, x + (k % 2) * 0.05, H(z) + 0.23 + k * 0.18, z, st); m.rotation.y = k * 0.2; }
  // horse carriages and a cable car
  const wheel = (parent, x, y, z, r) => { const w = G(parent, x, y, z); add(new THREE.TorusGeometry(r, 0.045, 6, 20), M.iron, 0, 0, 0, w); for (let k = 0; k < 6; k++) { const s = add(tbox(0.04, r * 2, 0.04), tm('#8a5a34'), 0, 0, 0, w); s.rotation.z = k * Math.PI / 6; }
    add(cyl(0.08, 0.08, 0.14, 8), M.brass, 0, 0, 0, w).rotation.x = Math.PI / 2; w.rotation.y = Math.PI / 2; return w; };
  const horse = (parent, col = '#8a5a3a', mane = '#3a2a22') => { const h = G(parent); const hm = tm(col), mm = tm(mane);
    const body = add(new THREE.CapsuleGeometry(0.42, 1.1, 4, 10), hm, 0, 1.45, 0, h); body.rotation.x = Math.PI / 2;
    const neck = add(new THREE.CapsuleGeometry(0.22, 0.6, 4, 8), hm, 0, 2.0, 0.75, h); neck.rotation.x = 0.6;
    const head = add(tbox(0.3, 0.32, 0.7), hm, 0, 2.3, 1.15, h); head.rotation.x = 0.5; add(tbox(0.12, 0.5, 0.5), mm, 0, 2.15, 0.7, h).rotation.x = 0.6;
    for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.06, 0.18, 4), hm, s * 0.1, 2.58, 1.0, h);
    const legs = []; for (const [x, z] of [[-0.22, 0.6], [0.22, 0.6], [-0.22, -0.6], [0.22, -0.6]]) { const L = G(h, x, 1.25, z); add(cyl(0.07, 0.06, 1.2, 6), hm, 0, -0.6, 0, L); add(cyl(0.09, 0.09, 0.12, 6), M.iron, 0, -1.2, 0, L); legs.push(L); }
    const tail = add(new THREE.ConeGeometry(0.12, 0.8, 6), mm, 0, 1.3, -0.95, h); tail.rotation.x = -0.4; h.userData.legs = legs; return h; };
  const carriage = (col = '#2a3a5a', open = false) => { const c = G(st); const hr = horse(c); hr.position.z = 1.6;
    const b = G(c, 0, 0, -0.6); add(tbox(1.5, 1.3, 1.8, 1), tm(col), 0, 1.35, 0, b); add(tbox(1.6, 0.12, 1.9), M.iron, 0, 2.06, 0, b);
    if (!open) { add(tbox(1.52, 0.6, 0.8), M.glass, 0, 1.6, 0, b, { cast: false }); add(tbox(1.6, 0.1, 2.0), tm('#1a1a22'), 0, 2.14, 0, b); }
    for (const s of [-1, 1]) add(tbox(0.12, 0.12, 0.12), M.lamp, s * 0.82, 1.9, 0.92, b);
    add(tbox(1.2, 0.1, 0.6), tm('#3a2418'), 0, 1.75, 1.15, b); // driver bench
    for (const s of [-1, 1]) add(tbox(0.06, 0.06, 2.2), tm('#6a4a2a'), s * 0.42, 1.0, 1.5, c);
    c.userData.wheels = [wheel(c, -0.8, 0.55, -1.2, 0.55), wheel(c, 0.8, 0.55, -1.2, 0.55), wheel(c, -0.8, 0.42, 0.0, 0.42), wheel(c, 0.8, 0.42, 0.0, 0.42)];
    c.userData.horse = hr; return c; };
  S.carriages = [
    { g: carriage('#2a3a5a'), x: 3.7, z0: -72, z1: -14, speed: 2.4, ph: 0.15, driver: ['driver', { expr: 'happy' }] },
    { g: carriage('#6a2a2a', true), x: -3.9, z0: -14, z1: -72, speed: 2.0, ph: 0.55, driver: ['driver', { expr: 'goofy' }] },
  ];
  for (const c of S.carriages) { c.d = person(st, c.driver[0], c.driver[1], 0, 0, 0, 0.6); }
  // cable car (red/cream), riders inside
  { const g = G(st); const b = G(g, 0, 0, 0); add(tbox(2.3, 1.2, 6, 1), tm('#b8302c'), 0, 1.0, 0, b); add(tbox(2.3, 0.3, 6), tm('#f2e2b8'), 0, 1.75, 0, b);
    add(tbox(2.4, 0.15, 6.4), tm('#5a2a1a'), 0, 3.15, 0, b); add(tbox(2.0, 0.3, 5.6), tm('#b8302c'), 0, 3.35, 0, b);
    for (let k = -2; k <= 2; k++) for (const s of [-1, 1]) add(tbox(0.06, 1.2, 0.06), M.brass, s * 1.12, 2.5, k * 1.3, b);
    for (const s of [-1, 1]) add(tbox(0.2, 0.2, 0.2), M.lamp, 0, 2.4, s * 3.05, b);
    for (const z of [-2, 0.4, 2.2]) add(tbox(0.7, 0.7, 0.7), M.white, 0, 0.45, z, b, { cast: false });
    for (let k = 0; k < 4; k++) for (const s of [-1, 1]) add(cyl(0.18, 0.18, 0.1, 10), M.iron, s * 0.8, 0.2, -2 + k * 1.3, b).rotation.z = Math.PI / 2;
    S.tram = { g, x: -2.45, z0: -16, z1: -78, speed: 1.6, ph: 0.35, riders: [] };
    for (let k = 0; k < 4; k++) S.tram.riders.push(person(st, TOWN[(k * 3) % TOWN.length], { expr: ['happy', 'laugh', 'neutral', 'goofy'][k] }, 0, 0, 0, 0.62)); }
  // background walkers on the sidewalks (instanced billboards, they bob as they walk)
  S.walkers = [];
  for (let k = 0; k < 18; k++) { const sp = TOWN[k % TOWN.length], side = k % 2 ? 1 : -1;
    const m = person(st, sp, { expr: ['happy', 'neutral', 'laugh', 'smug'][k % 4], legs: 'walk', step: (k % 4) / 4, turn: side * 0.4 }, 0, 0, 0, 0.82);
    S.walkers.push({ m, x: side * (6.6 + (k % 3) * 0.45), z0: 40 - k * 6.5, v: (k % 3 ? 1 : -1) * (0.7 + (k % 5) * 0.12) }); }
  // static townsfolk standing in doorways further down the hill (depth crowd)
  for (let k = 0; k < 16; k++) { const side = k % 2 ? 1 : -1, z = -16 - k * 3.6; person(st, TOWN[(k + 3) % TOWN.length], { expr: ['happy', 'laugh', 'neutral'][k % 3], R: k % 4 ? 'hang' : 'wave' }, side * (6.8 + (k % 3) * 0.4), H(z) + 0.14, z, 0.8, { kind: 'static' }); }

  // ---------- city hills left and right, with little houses ----------
  const hillHouses = (cx, cz, R, n, seed) => { const r = P.rng(seed); const hh = add(sph(R, 24, 12), M.hill2, cx, -R * 0.62 - 10, cz, st, { cast: false }); hh.scale.y = 0.7;
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0); const inst = new THREE.InstancedMesh(geo, toon({ color: '#ffffff' }), n); const mtx = new THREE.Matrix4(), col = new THREE.Color();
    for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * 0.85, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      const dy = Math.sqrt(Math.max(0, R * R - (d) ** 2)) * 0.7 - R * 0.62 - 10; const w = 3 + r() * 3, h = 3 + r() * 5;
      mtx.compose(new THREE.Vector3(x, dy - 1, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 3, 0)), new THREE.Vector3(w, h, w)); inst.setMatrixAt(i, mtx); inst.setColorAt(i, col.set(PAINT[(r() * PAINT.length) | 0])); }
    inst.castShadow = false; inst.receiveShadow = true; st.add(inst); };
  hillHouses(-70, -40, 60, 120, 5); hillHouses(75, -30, 64, 120, 6); hillHouses(-90, 40, 70, 90, 8); hillHouses(95, 50, 70, 90, 9);

  // ---------- the bay: water, quay, pier, ships, far shore ----------
  const water = add(new THREE.PlaneGeometry(3000, 2400, 1, 1), waterMat, 0, WATER, -1300, st, { cast: false }); water.rotation.x = -Math.PI / 2; water.userData.nd = waterNd;
  add(tbox(160, 3, 4, 2), M.stoneW, 0, WATER - 0.2, -82.5, st, { cast: false }); // quay wall
  { const p = G(st, PIER.x, PIER.y, 0); const len = PIER.z0 - PIER.z1; add(tbox(4.2, 0.3, len, 1), M.deck, 0, 0, (PIER.z0 + PIER.z1) / 2, p);
    for (let z = PIER.z0; z >= PIER.z1; z -= 3) for (const x of [-2.0, 2.0]) { add(cyl(0.2, 0.2, 4, 8), M.darkwood, x, -1.8, z, p); add(cyl(0.12, 0.12, 1.1, 8), M.darkwood, x, 0.55, z, p); }
    for (const x of [-2.0, 2.0]) add(tbox(0.1, 0.1, len, 1), M.darkwood, x, 1.05, (PIER.z0 + PIER.z1) / 2, p);
    for (let k = 0; k < 4; k++) add(cyl(0.3, 0.3, 0.6, 10), M.darkwood, (k % 2 ? 1 : -1) * 1.4, 0.45, PIER.z1 + 4 + k * 6, p);
    add(new THREE.TorusGeometry(0.5, 0.12, 6, 14), M.rope, -1.5, 0.3, PIER.z1 + 9, p).rotation.x = Math.PI / 2;
    S.pier = p; }
  // ships
  S.ships = [];
  const ship = (x, z, s = 1, rot = 0) => { const g = G(st, x, WATER, z); g.rotation.y = rot; g.scale.setScalar(s);
    add(tbox(3.2, 1.8, 13, 1), M.hull, 0, 0.5, 0, g); add(tbox(3.24, 0.3, 13.1), M.hullR, 0, -0.2, 0, g); add(tbox(3.3, 0.2, 13.2), M.cream, 0, 1.45, 0, g);
    const bow = add(new THREE.ConeGeometry(1.62, 3.6, 4), M.hull, 0, 0.6, 8.2, g); bow.rotation.x = Math.PI / 2; bow.rotation.y = Math.PI / 4; bow.scale.set(1, 1, 0.6);
    add(tbox(2.0, 1.0, 3), M.cream, 0, 2.0, -3.5, g);
    for (const [mz, mh] of [[3.6, 15], [-1, 18], [-5, 13]]) { add(cyl(0.12, 0.18, mh, 6), M.darkwood, 0, 1.4 + mh / 2, mz, g);
      for (let k = 0; k < 3; k++) { const y = 1.4 + mh * (0.45 + k * 0.2), L = 5.5 - k * 1.3; const yard = add(cyl(0.06, 0.06, L, 5), M.darkwood, 0, y, mz, g); yard.rotation.z = Math.PI / 2;
        const sl = add(new THREE.CapsuleGeometry(0.2, L - 0.6, 3, 6), M.sail, 0, y - 0.18, mz, g); sl.rotation.z = Math.PI / 2; }
      for (const s of [-1, 1]) { const rp = add(cyl(0.025, 0.025, mh * 1.05, 3), M.rope, s * 1.3, 1.4 + mh / 2, mz - 1.2, g, { cast: false }); rp.rotation.z = s * 0.09; rp.rotation.x = 0.1; } }
    const bs = add(cyl(0.08, 0.08, 7, 5), M.darkwood, 0, 3, 9.8, g); bs.rotation.x = 1.2;
    S.ships.push(g); return g; };
  ship(-24, -108, 1, 0.3); ship(-46, -132, 1.1, -0.2); ship(36, -118, 1, 2.6); ship(58, -150, 1.2, 0.9); ship(-80, -170, 1.3, 1.4); ship(20, -175, 1.1, -0.6);
  // far shore: hills across the bay, two headlands where the bridge lands
  const fh_ = [[-420, -560, 140], [-200, -600, 120], [40, -620, 150], [260, -580, 130], [460, -540, 150], [-650, -480, 160], [700, -470, 150]];
  fh_.forEach(([x, z, r], i) => { const h = add(sph(r, 24, 12), i % 2 ? M.hill : M.hill3, x, WATER - r * 0.55, z, st, { cast: false }); h.scale.set(1.3, 0.75, 0.8); });
  for (const [x, z, r] of [[-370, -310, 70], [210, -300, 72]]) { const h = add(sph(r, 24, 12), M.hill2, x, WATER - r * 0.45, z, st, { cast: false }); h.scale.set(1.2, 0.8, 0.9); }
  add(new THREE.ConeGeometry(500, 180, 9), toon({ color: '#9aa8c0' }), -200, -10, -1000, st, { cast: false });
  add(new THREE.ConeGeometry(420, 150, 9), toon({ color: '#a4b0c8' }), 380, -10, -950, st, { cast: false });
  addClouds(16, 90, 700, 120);

  // ---------- the bridge (only in the present day) ----------
  { const b = G(st, BRIDGE.x, 0, BRIDGE.z); S.bridge = b; const D = BRIDGE.deck, TX = BRIDGE.tower, TOP = BRIDGE.top, AX = 255;
    // deck with lamp posts
    add(tbox(AX * 2, 1.6, 9), M.bridgeD, 0, D, 0, b); add(tbox(AX * 2, 0.8, 9.4), M.bridge, 0, D + 1.0, 0, b);
    for (let x = -AX; x <= AX; x += 3) for (const s of [-1, 1]) add(tbox(0.12, 1.2, 0.12), M.bridge, x, D + 1.9, s * 4.6, b, { cast: false });
    S.bridgeLights = []; for (let x = -AX + 8; x <= AX; x += 16) for (const s of [-1, 1]) S.bridgeLights.push(add(tbox(0.6, 0.6, 0.6), M.lamp, x, D + 5.2, s * 4.0, b, { cast: false }));
    for (const x of [-TX, TX]) { // towers: two legs with stepped tops and cross portals
      for (const s of [-1, 1]) { add(tbox(3.2, TOP - WATER, 3.2, 4), M.bridge, x, (TOP + WATER) / 2, s * 5.2, b); add(tbox(2.6, 8, 2.6), M.bridge, x, TOP + 4, s * 5.2, b); add(tbox(1.0, 1.0, 1.0), emis('#ff4a3a', 1.6), x, TOP + 8.6, s * 5.2, b, { cast: false }); }
      for (const y of [D + 14, D + 34, TOP - 6]) add(tbox(2.8, 3.2, 13), M.bridge, x, y, 0, b);
      add(tbox(8, 4, 16), M.stoneW, x, WATER + 1, 0, b, { cast: false }); }
    // main cables: catenaries between anchors and towers, with suspenders
    const cableY = (x) => { const ax = Math.abs(x); if (ax <= TX) { const t = x / TX; return D + 6 + (TOP - D - 6) * t * t; } const t = (ax - TX) / (AX - TX); return TOP + (D + 3 - TOP) * Math.pow(t, 0.8); };
    for (const s of [-1, 1]) { const pts = []; for (let x = -AX; x <= AX; x += 4) pts.push(new THREE.Vector3(x, cableY(x), s * 5.2));
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 260, 0.55, 6), M.bridge, 0, 0, 0, b, { cast: false });
      const geo = new THREE.CylinderGeometry(0.08, 0.08, 1, 3); geo.translate(0, 0.5, 0); const n = Math.floor(2 * AX / 6); const inst = new THREE.InstancedMesh(geo, M.bridge, n); const mtx = new THREE.Matrix4();
      for (let i = 0; i < n; i++) { const x = -AX + 3 + i * 6, y0 = D + 1.4, y1 = cableY(x); mtx.compose(new THREE.Vector3(x, y0, s * 5.2), new THREE.Quaternion(), new THREE.Vector3(1, Math.max(0.1, y1 - y0), 1)); inst.setMatrixAt(i, mtx); }
      b.add(inst); }
    // traffic: cars with headlights / taillights
    S.cars = []; for (let i = 0; i < 26; i++) { const c = G(b); add(tbox(4.2, 1.4, 1.9), tm(['#e8e2d0', '#3a5a9a', '#c8302c', '#2a2a30', '#e8b84a'][i % 5]), 0, D + 2.4, 0, c);
      add(tbox(0.2, 0.5, 1.6), emis(i % 2 ? '#fff4c8' : '#ff3a2a', 2), (i % 2 ? 1 : -1) * 2.15, D + 2.3, 0, c, { cast: false }); c.userData.i = i; S.cars.push(c); }
  }
  // fog bank over the water (M7): big soft sprites that part for the reveal
  const fogTex = P.tex(P.radial('235,240,248', 0.95));
  S.fogs = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: fogTex, transparent: true, depthWrite: false, fog: false, opacity: 0.9 }));
    const r = P.rng(300 + i); m.userData = { x: -260 + r() * 520, y: -10 + r() * 40, z: -170 - r() * 240, s: 70 + r() * 90, ndSkip: true }; m.renderOrder = 4; st.add(m); S.fogs.push(m); }
  // near ground-mist sprites (generic, used on the pier and in the street)
  S.mist = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: fogTex, transparent: true, depthWrite: false, fog: false, opacity: 0.5 })); m.userData.ndSkip = true; m.renderOrder = 4; st.add(m); S.mist.push(m); }

  // funeral: rows of mourners along both sidewalks (hats in hands), flowers, a black hearse
  S.mourners = G(st); S.mourners.visible = false;
  for (let k = 0; k < 120; k++) { const side = k % 2 ? 1 : -1, row = Math.floor(k / 2) % 3, z = 6 - Math.floor(k / 6) * 2.6 - row * 0.8, x = side * (2.5 + row * 0.75 + (z < -24 ? 1.2 : 0));
    const sp = TOWN[(k * 7) % TOWN.length], hatSide = (k % 4 < 2) ? -1 : 1, sx = CAST_HAS_HAT(sp);
    person(S.mourners, sp, sx ? { expr: k % 5 ? 'sad' : 'sleep', hatOff: true, hatInHand: hatSide, [hatSide < 0 ? 'L' : 'R']: 'hold', headTilt: side * 6 } : { expr: k % 5 ? 'sad' : 'sleep', L: 'belly', R: 'belly', headTilt: side * 6 }, x, H(z) + 0.14, z, 0.82 + (k % 3) * 0.04); }
  for (let k = 0; k < 60; k++) { const side = k % 2 ? 1 : -1, z = 28 - k * 1.7, x = side * (5.4 + rng() * 0.3); const fl = add(sph(0.14, 6, 5), tm(['#e8343a', '#f4f0e6', '#f4dc4a', '#e86aa0'][k % 4]), x, H(z) + 0.1, z, S.mourners, { cast: false }); add(cyl(0.02, 0.02, 0.3, 3), M.green, x, H(z) + 0.0, z, S.mourners, { cast: false }); }
  { const c = carriage('#121016'); c.visible = false; S.hearse = c; const b = c.children[1];
    for (const s of [-1, 1]) for (const z of [-0.85, 0.85]) add(cyl(0.05, 0.05, 0.8, 6), M.brass, s * 0.72, 2.5, z, b);
    add(tbox(1.6, 0.1, 1.9), tm('#121016'), 0, 2.92, 0, b); add(sph(0.2, 8, 6), tm('#121016'), 0, 2.95, 0, b);
    for (let k = 0; k < 16; k++) add(sph(0.12, 6, 5), tm(['#e8343a', '#f4f0e6', '#f4dc4a', '#e86aa0'][k % 4]), -0.6 + (k % 6) * 0.24, 2.18, -0.8 + Math.floor(k / 6) * 0.6, b, { cast: false });
    const plume = add(new THREE.ConeGeometry(0.15, 0.6, 6), tm('#121016'), 0, 2.95, 1.75, c); c.userData.horse.position.z = 1.6;
    for (const m of c.userData.horse.children) if (m.material && m.material.color) m.material = tm('#1e1a1e'); }

  // ================= OFFICE (M2) =================
  { const o = sets.office, w = 10, d = 8, h = 4.6;
    const floor = add(new THREE.PlaneGeometry(w, d), texM(P.planks(35), 3, 3, '#8a5a3a'), 0, 0, 0, o, { cast: false }); floor.rotation.x = -Math.PI / 2;
    add(tbox(w, 0.2, d), tm('#e8dcc4'), 0, h + 0.1, 0, o); // ceiling
    S.wpRich = toon({ map: P.tex(wallpaper, 3, 2) }); S.wpPale = toon({ map: P.tex(wallpaperPale, 3, 2) });
    // back wall (z=-d/2) with a big window opening: x -1.5..1.5, y 0.8..4.0
    const wall = (x, y, ww, hh) => add(tbox(ww, hh, 0.3), S.wpRich, x, y, -d / 2, o);
    S.offWalls = [wall(-3.25, h / 2, 3.5, h), wall(3.25, h / 2, 3.5, h), wall(0, 0.4, 3, 0.8), wall(0, 4.3, 3, 0.6)];
    for (const s of [-1, 1]) S.offWalls.push(add(tbox(0.3, h, d), S.wpRich, s * w / 2, h / 2, 0, o));
    S.offWalls.push(add(tbox(w, h, 0.3), S.wpRich, 0, h / 2, d / 2, o));
    // wainscot
    for (const s of [-1, 1]) add(tbox(3.4, 1.1, 0.1), M.mahogL, s * 3.25, 0.55, -d / 2 + 0.2, o);
    for (const s of [-1, 1]) add(tbox(0.1, 1.1, d), M.mahogL, s * (w / 2 - 0.2), 0.55, 0, o);
    // window frame + mullions + glass (glass does not cast shadows, so the sun pours in)
    add(tbox(3.3, 0.2, 0.5), M.white, 0, 0.8, -d / 2 + 0.1, o); add(tbox(3.3, 0.2, 0.4), M.white, 0, 4.0, -d / 2, o);
    for (const x of [-1.5, -0.5, 0.5, 1.5]) add(tbox(0.1, 3.2, 0.16), M.white, x, 2.4, -d / 2, o, { cast: x === -0.5 || x === 0.5 });
    add(tbox(3, 0.08, 0.16), M.white, 0, 2.6, -d / 2, o);
    // the city outside the window (painted silhouettes)
    for (let k = 0; k < 9; k++) add(tbox(4, 6 + (k % 4) * 3, 2), tm(['#c8a878', '#b89878', '#d8b888'][k % 3]), -16 + k * 4, (6 + (k % 4) * 3) / 2 - 4, -d / 2 - 12 - (k % 3) * 4, o, { cast: false });
    // rich set
    const rich = G(o); S.offRich = rich;
    for (const s of [-1, 1]) { for (let k = 0; k < 3; k++) add(cyl(0.18, 0.22, 3.6, 8), M.red, s * (1.85 + k * 0.22), 2.4, -d / 2 + 0.4, rich); add(tbox(1.2, 0.25, 0.3), M.gold, s * 2.1, 4.25, -d / 2 + 0.4, rich); }
    const rug = add(new THREE.PlaneGeometry(6, 3.4), toon({ map: canvasTex(512, 256, (g) => g.drawImage(rugTex, 0, 0)) }), 0, 0.01, 0.4, rich, { cast: false }); rug.rotation.x = -Math.PI / 2;
    // the desk
    const desk = G(rich, 0, 0, -0.6); add(tbox(2.8, 0.12, 1.3), M.mahogL, 0, 0.92, 0, desk); add(tbox(2.5, 0.02, 1.0), M.leather, 0, 0.99, 0, desk);
    for (const s of [-1, 1]) { add(tbox(0.8, 0.86, 1.2), M.mahog, s * 1.0, 0.43, 0, desk); for (let k = 0; k < 3; k++) { add(tbox(0.7, 0.22, 0.04), M.mahogL, s * 1.0, 0.18 + k * 0.27, 0.62, desk); add(sph(0.035), M.brass, s * 1.0, 0.18 + k * 0.27, 0.66, desk); } }
    add(cyl(0.05, 0.08, 0.3, 8), M.brass, 0.9, 1.15, -0.2, desk); add(sph(0.12), M.lamp, 0.9, 1.35, -0.2, desk);
    // gold: coin stacks, bars, a mountain of coins and money bags
    S.gold = G(rich);
    const coinT = canvasTex(256, 256, (g) => { g.fillStyle = '#d8a02a'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 70; i++) { const x = (i * 73) % 256, y = (i * 151) % 256; g.fillStyle = i % 3 ? '#f8d860' : '#fff2a0'; g.beginPath(); g.ellipse(x, y, 16, 11, 0, 0, 7); g.fill(); g.strokeStyle = '#a8701a'; g.lineWidth = 3; g.stroke(); } });
    const coinM = toon({ map: coinT, emissive: '#6a4a00', emissiveIntensity: 0.5 });
    for (const [x, z, r, hh] of [[-2.4, -2.6, 1.3, 1.4], [2.5, -2.5, 1.1, 1.1], [-3.6, -1.2, 0.8, 0.8]]) { const m = add(new THREE.ConeGeometry(r, hh, 20), coinM, x, hh / 2, z, S.gold); }
    for (let k = 0; k < 14; k++) { const x = -1.2 + (k % 7) * 0.35, z = -0.9 + Math.floor(k / 7) * 0.25, n = 3 + (k * 5) % 6; add(cyl(0.11, 0.11, n * 0.03, 14), M.gold, x, 0.98 + n * 0.015, z, S.gold); }
    for (let k = 0; k < 10; k++) { const bar = add(tbox(0.42, 0.14, 0.2), M.gold, 2.3 + (k % 3) * 0.44 - 0.4, 0.07 + Math.floor(k / 3) * 0.14, -1.2 + (k % 2) * 0.06, S.gold); bar.rotation.y = (k % 2) * 0.1; }
    for (const [x, z] of [[-2.9, 0.2], [3.0, -0.2], [-1.8, -2.9]]) { add(sph(0.38, 12, 10), toon({ color: '#c8a46a' }), x, 0.36, z, S.gold); add(cyl(0.1, 0.16, 0.2, 8), toon({ color: '#a8844a' }), x, 0.76, z, S.gold); }
    // safe, globe, bookshelf, painting, chandelier, palm
    add(tbox(1.1, 1.4, 0.9), M.ironG, 4.1, 0.7, -2.6, rich); add(cyl(0.2, 0.2, 0.06, 16), M.brass, 4.1, 0.9, -2.13, rich).rotation.x = Math.PI / 2;
    add(sph(0.38, 16, 12), toon({ color: '#5a9ac8' }), -4.1, 1.35, 0.6, rich); add(cyl(0.04, 0.12, 0.9, 8), M.brass, -4.1, 0.5, 0.6, rich);
    const shelf = G(rich, -4.75, 0, -1.6); add(tbox(0.4, 3.2, 2.4), M.mahog, 0, 1.6, 0, shelf); for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) add(tbox(0.3, 0.5 + (k % 3) * 0.08, 0.16), tm(['#8a2a2a', '#2a4a6a', '#2e5a3a', '#6a4a2a', '#c8a44a'][(k + r) % 5]), 0.08, 0.5 + r * 0.75, -1.0 + k * 0.24, shelf); shelf.rotation.y = 0;
    const paint = G(rich, 4.84, 2.6, -0.4); paint.rotation.y = -Math.PI / 2; add(tbox(2.2, 1.6, 0.12), M.gold, 0, 0, 0, paint);
    add(new THREE.PlaneGeometry(1.9, 1.3), toon({ map: canvasTex(256, 180, (g) => { const gr = g.createLinearGradient(0, 0, 0, 180); gr.addColorStop(0, '#f2b870'); gr.addColorStop(1, '#6a8ab8'); g.fillStyle = gr; g.fillRect(0, 0, 256, 180); g.fillStyle = '#4a6a3a'; g.beginPath(); g.moveTo(0, 140); g.quadraticCurveTo(80, 90, 160, 130); g.quadraticCurveTo(210, 100, 256, 120); g.lineTo(256, 180); g.lineTo(0, 180); g.fill(); g.fillStyle = '#3a2a22'; g.fillRect(120, 70, 6, 60); g.fillStyle = '#f4f0e6'; g.beginPath(); g.moveTo(126, 72); g.lineTo(160, 110); g.lineTo(126, 110); g.fill(); }) }), 0, 0, 0.07, paint);
    const ch = G(rich, 0, 3.8, 0.6); add(new THREE.TorusGeometry(0.7, 0.05, 6, 24), M.brass, 0, 0, 0, ch).rotation.x = Math.PI / 2; add(cyl(0.02, 0.02, 0.8, 4), M.brass, 0, 0.4, 0, ch);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; add(sph(0.08), M.lamp, Math.cos(a) * 0.7, 0.12, Math.sin(a) * 0.7, ch); }
    const palm = G(rich, 3.9, 0, 1.6); add(cyl(0.3, 0.22, 0.6, 10), toon({ color: '#c86a3a' }), 0, 0.3, 0, palm); for (let k = 0; k < 7; k++) { const lf = add(new THREE.ConeGeometry(0.16, 1.4, 4), M.leaf, Math.cos(k) * 0.3, 1.2, Math.sin(k) * 0.3, palm); lf.rotation.z = Math.cos(k) * 0.9; lf.rotation.x = Math.sin(k) * 0.9; }
    // the plain chair (always there) and a small candle table (night)
    const chair = G(o, 0, 0, 0.6); S.chair = chair; add(tbox(0.7, 0.08, 0.7), M.darkwood, 0, 0.55, 0, chair); add(tbox(0.7, 0.9, 0.08), M.darkwood, 0, 1.0, -0.32, chair);
    for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) add(tbox(0.06, 0.55, 0.06), M.darkwood, x, 0.27, z, chair);
    // empty-room marks: pale rectangles where the painting and the shelf hung
    S.offEmpty = G(o); add(new THREE.PlaneGeometry(2.0, 1.4), tm('#a8b4a0'), 4.82, 2.6, -0.4, S.offEmpty, { cast: false }).rotation.y = -Math.PI / 2;
    add(new THREE.PlaneGeometry(2.2, 3), tm('#a0ac98'), -4.82, 1.6, -1.6, S.offEmpty, { cast: false }).rotation.y = Math.PI / 2;
    for (let k = 0; k < 7; k++) { const pp = add(new THREE.PlaneGeometry(0.4, 0.3), M.paper, -2 + k * 0.7, 0.01, 1.4 - (k % 3) * 0.8, S.offEmpty, { cast: false }); pp.rotation.x = -Math.PI / 2; pp.rotation.z = k; }
    S.offNight = G(o, 0, 0, 1.2); const tb = S.offNight;
    add(tbox(1.5, 0.08, 0.9), M.darkwood, 0, 0.82, 0, tb); for (const [x, z] of [[-0.65, -0.35], [0.65, -0.35], [-0.65, 0.35], [0.65, 0.35]]) add(tbox(0.06, 0.82, 0.06), M.darkwood, x, 0.41, z, tb);
    add(cyl(0.06, 0.08, 0.04, 10), M.brass, 0.5, 0.88, -0.15, tb); add(cyl(0.035, 0.035, 0.22, 8), M.white, 0.5, 1.0, -0.15, tb); S.flame = add(new THREE.ConeGeometry(0.03, 0.09, 8), emis('#ffd86a', 3), 0.5, 1.16, -0.15, tb, { cast: false });
    add(cyl(0.05, 0.06, 0.08, 10), tm('#1a1a22'), -0.45, 0.9, -0.2, tb);
    // the letter "Befehl" on the table (and the seal)
    const letterT = canvasTex(512, 700, (g, W2, H2) => { g.fillStyle = '#f4ead2'; g.fillRect(0, 0, W2, H2); g.strokeStyle = '#c8a46a'; g.lineWidth = 10; g.strokeRect(16, 16, W2 - 32, H2 - 32);
      g.fillStyle = '#2a1a14'; g.font = 'bold 110px Georgia, "DejaVu Serif", serif'; g.textAlign = 'center'; g.fillText('Befehl', W2 / 2, 150); g.fillRect(90, 180, W2 - 180, 6);
      g.strokeStyle = '#3a2a24'; g.lineWidth = 6; for (let k = 0; k < 7; k++) { g.beginPath(); let x = 70; g.moveTo(x, 250 + k * 50); while (x < W2 - 80 - (k === 6 ? 160 : 0)) { x += 18; g.lineTo(x, 250 + k * 50 + Math.sin(x * 0.3 + k) * 6); } g.stroke(); } });
    S.letterT = letterT;
    S.letter = add(new THREE.PlaneGeometry(0.42, 0.57), basic(letterT, { side: THREE.DoubleSide }), -0.05, 0.87, 0.02, tb, { cast: false }); S.letter.rotation.x = -Math.PI / 2; S.letter.rotation.z = 0.08;
    S.seal = add(cyl(0.05, 0.055, 0.02, 16), toon({ color: '#b8202a' }), 0.05, 0.875, 0.2, tb, { cast: false });
  }

  // ================= PRESS (M3) =================
  { const o = sets.press, w = 14, d = 10, h = 6;
    const floor = add(new THREE.PlaneGeometry(w, d), texM(P.planks(45), 4, 3, '#7a5a42'), 0, 0, 0, o, { cast: false }); floor.rotation.x = -Math.PI / 2;
    const bm = toon({ map: P.tex(brick(51, 14), 4, 3) });
    add(tbox(w, 0.2, d), tm('#5a4a3a'), 0, h, 0, o);
    for (const s of [-1, 1]) add(tbox(0.3, h, d), bm, s * w / 2, h / 2, 0, o); add(tbox(w, h, 0.3), bm, 0, h / 2, d / 2, o);
    // back wall with two high windows (openings): x in [-4.5,-2.5] and [2.5,4.5], y 2.6..5.2
    for (const [x0, x1] of [[-7, -4.5], [-2.5, 2.5], [4.5, 7]]) add(tbox(x1 - x0, h, 0.3), bm, (x0 + x1) / 2, h / 2, -d / 2, o);
    for (const xc of [-3.5, 3.5]) { add(tbox(2, 2.6, 0.3), bm, xc, 1.3, -d / 2, o); add(tbox(2, 0.8, 0.3), bm, xc, 5.6, -d / 2, o);
      for (const x of [-0.5, 0.5]) add(tbox(0.08, 2.6, 0.12), M.iron, xc + x, 3.9, -d / 2, o); add(tbox(2, 0.08, 0.12), M.iron, xc, 3.9, -d / 2, o); }
    for (let k = 0; k < 8; k++) add(tbox(4, 10, 2), tm(['#c8a878', '#d8b888'][k % 2]), -14 + k * 4, 1, -d / 2 - 10 - (k % 3) * 3, o, { cast: false });
    // roof beams
    for (let x = -6; x <= 6; x += 2) add(tbox(0.25, 0.35, d), M.darkwood, x, h - 0.2, 0, o);
    // the press: side frames, 4 cylinders, flywheel, paper web
    const pr = G(o, 0, 0, -1.2); S.press = pr;
    for (const s of [-1, 1]) { const fr = add(tbox(0.3, 2.8, 3.2), M.ironG, s * 1.6, 1.4, 0, pr); add(tbox(0.34, 0.12, 3.24), M.brass, s * 1.6, 2.84, 0, pr); add(tbox(0.34, 0.3, 3.3), M.iron, s * 1.6, 0.15, 0, pr); }
    S.rolls = [];
    const rollT = canvasTex(256, 64, (g) => { g.fillStyle = '#2a2a30'; g.fillRect(0, 0, 256, 64); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#3a3a44' : '#22222a'; g.fillRect(i * 16, 0, 8, 64); } g.fillStyle = '#d8a83a'; g.fillRect(0, 0, 256, 6); g.fillRect(0, 58, 256, 6); });
    for (const [y, z, r] of [[2.2, -0.7, 0.5], [2.2, 0.55, 0.5], [1.2, -0.1, 0.62], [0.9, 1.25, 0.38]]) { const m = add(cyl(r, r, 3.0, 24), toon({ map: rollT }), 0, y, z, pr); m.rotation.z = Math.PI / 2; S.rolls.push(m); }
    const fw = G(pr, 2.0, 1.6, 0); S.flywheel = fw; add(new THREE.TorusGeometry(1.1, 0.1, 8, 28), M.iron, 0, 0, 0, fw).rotation.y = Math.PI / 2;
    for (let k = 0; k < 6; k++) { const sp = add(tbox(0.06, 2.2, 0.08), M.iron, 0, 0, 0, fw); sp.rotation.x = k * Math.PI / 6; } add(cyl(0.16, 0.16, 0.3, 12), M.brass, 0, 0, 0, fw).rotation.z = Math.PI / 2;
    // paper roll at the back, web strips through the cylinders
    const roll = add(cyl(0.8, 0.8, 2.6, 24), M.paper, 0, 1.0, -2.6, pr); roll.rotation.z = Math.PI / 2; S.rolls.push(roll);
    for (const [y0, z0, y1, z1] of [[1.8, -2.6, 2.7, -0.7], [2.7, -0.7, 2.7, 0.55], [1.7, 0.55, 0.6, 1.4]]) { const L = Math.hypot(y1 - y0, z1 - z0); const m = add(new THREE.PlaneGeometry(2.6, L), M.paper, 0, (y0 + y1) / 2, (z0 + z1) / 2, pr, { cast: false }); m.rotation.x = -Math.PI / 2 + Math.atan2(y1 - y0, z1 - z0); m.material = new THREE.MeshToonMaterial({ gradientMap: ctx.grad, color: '#f4ecd6', side: THREE.DoubleSide }); }
    // delivery table with the hero sheet
    add(tbox(3.0, 0.1, 1.8), M.darkwood, 0, 0.9, 2.4, pr); for (const [x, z] of [[-1.4, 1.6], [1.4, 1.6], [-1.4, 3.2], [1.4, 3.2]]) add(tbox(0.1, 0.9, 0.1), M.darkwood, x, 0.45, z, pr);
    for (let k = 0; k < 6; k++) add(tbox(0.9, 0.04, 0.7), M.paper, 1.05, 0.97 + k * 0.04, 3.0, pr);
    // newspaper texture: "Tageszeitung" / "Der Kaiser von Amerika"
    const news = (money) => canvasTex(800, 1100, (g, W2, H2) => {
      if (!money) { g.fillStyle = '#f2ead4'; g.fillRect(0, 0, W2, H2); g.fillStyle = '#1e1814'; g.textAlign = 'center';
        g.font = 'bold 104px "DejaVu Serif", Georgia, serif'; g.fillText('Tageszeitung', W2 / 2, 120); g.fillRect(40, 150, W2 - 80, 8); g.fillRect(40, 166, W2 - 80, 3);
        g.font = 'bold 92px "DejaVu Sans", Arial, sans-serif'; g.fillText('Der Kaiser', W2 / 2, 290); g.fillText('von Amerika', W2 / 2, 390);
        g.fillStyle = '#d8ccb0'; g.fillRect(60, 430, 300, 330); g.fillStyle = '#2a2420'; g.beginPath(); g.ellipse(210, 640, 90, 100, 0, 0, 7); g.fill(); g.fillStyle = '#f2ead4'; g.beginPath(); g.ellipse(210, 600, 66, 60, 0, 0, 7); g.fill();
        g.fillStyle = '#2a2420'; g.beginPath(); g.ellipse(210, 540, 110, 46, 0, Math.PI, 0); g.fill(); g.fillStyle = '#2a2420'; for (let k = 0; k < 3; k++) g.fillRect(150 + k * 8, 470 - k * 12, 6, 50);
        g.fillStyle = '#4a4440'; for (let col = 0; col < 3; col++) for (let k = 0; k < (col === 0 ? 7 : 20); k++) { const x0 = col === 0 ? 60 : 390 + (col - 1) * 180, y0 = col === 0 ? 790 + k * 38 : 440 + k * 30; g.fillRect(x0, y0, (col === 0 ? 300 : 160) - (k % 5 === 4 ? 60 : 0), 10); }
        g.strokeStyle = '#1e1814'; g.lineWidth = 3; g.strokeRect(20, 20, W2 - 40, H2 - 40);
      } else { // sheet of banknotes
        g.fillStyle = '#efe6c8'; g.fillRect(0, 0, W2, H2); for (let r = 0; r < 4; r++) drawBill(g, 30, 30 + r * 265, W2 - 60, 245); }
    });
    const drawBill = (g, x, y, w2, h2) => { g.save(); g.translate(x, y); g.fillStyle = '#cfe2b8'; g.fillRect(0, 0, w2, h2); g.strokeStyle = '#2e5a3a'; g.lineWidth = 10; g.strokeRect(8, 8, w2 - 16, h2 - 16); g.lineWidth = 3; g.strokeRect(22, 22, w2 - 44, h2 - 44);
      g.fillStyle = '#2e5a3a'; g.textAlign = 'center'; g.font = 'bold 54px "DejaVu Serif", Georgia, serif'; g.fillText('Kaiserliches Geld', w2 / 2 + 60, h2 / 2 - 6); g.font = 'bold 70px "DejaVu Serif", serif'; g.fillText('50', w2 - 80, h2 - 40); g.fillText('50', 80, 90);
      g.fillStyle = '#e8d8a0'; g.beginPath(); g.ellipse(120, h2 / 2 + 20, 62, 72, 0, 0, 7); g.fill(); g.strokeStyle = '#2e5a3a'; g.lineWidth = 5; g.stroke(); g.fillStyle = '#2e5a3a'; g.beginPath(); g.ellipse(120, h2 / 2 + 6, 62, 26, 0, Math.PI, 0); g.fill();
      g.beginPath(); g.ellipse(120, h2 / 2 + 50, 34, 32, 0, 0, Math.PI); g.fill(); g.restore(); };
    S.drawBill = drawBill;
    S.newsT = news(false); S.moneyT = news(true);
    S.billT = canvasTex(1000, 440, (g, W2, H2) => drawBill(g, 0, 0, W2, H2));
    S.hero = add(new THREE.PlaneGeometry(1.1, 1.5), basic(S.newsT, { side: THREE.DoubleSide }), 0, 1.0, 2.3, pr, { cast: false }); S.hero.rotation.x = -Math.PI / 2;
    // drying lines with hanging newspapers (they sway)
    S.hang = [];
    for (const z of [0.8, 2.6, -2.2]) { add(cyl(0.015, 0.015, w - 1, 3), M.rope, 0, 4.4, z, o, { cast: false }).rotation.z = Math.PI / 2;
      for (let k = 0; k < 9; k++) { const x = -5.6 + k * 1.4 + (z > 2 ? 0.7 : 0); if (Math.abs(x) < 2.2 && z < 3 && z > 0) continue; const pv = G(o, x, 4.4, z); const m = add(new THREE.PlaneGeometry(0.9, 1.25), basic(S.newsT, { side: THREE.DoubleSide }), 0, -0.62, 0, pv, { cast: false }); pv.userData.k = k + z; S.hang.push(pv); } }
    // type cases + ink drums + window light
    const tc = G(o, -5.5, 0, 2.5); tc.rotation.y = Math.PI / 2; add(tbox(3.2, 1.6, 0.8), M.darkwood, 0, 0.8, 0, tc); for (let r = 0; r < 5; r++) for (let k = 0; k < 8; k++) add(tbox(0.34, 0.24, 0.04), M.mahogL, -1.4 + k * 0.4, 0.3 + r * 0.28, 0.42, tc);
    add(tbox(3.2, 0.06, 0.9), tm('#4a4440'), 0, 1.63, 0, tc);
    for (const [x, z] of [[4.8, 2.8], [5.4, 2.1], [4.9, -3.6]]) { add(cyl(0.32, 0.3, 0.8, 12), M.iron, x, 0.4, z, o); add(cyl(0.3, 0.3, 0.02, 12), tm('#0a0a10'), x, 0.81, z, o); }
    for (let k = 0; k < 5; k++) { const sk = add(tbox(0.9, 0.5, 0.6), M.paper, 5.4, 0.25 + k * 0.5, -1.8 + (k % 2) * 0.05, o); }
    add(sph(0.18), M.lamp, -2, 4.6, 1.5, o); add(cyl(0.01, 0.01, 1.2, 3), M.iron, -2, 5.3, 1.5, o);
  }

  // ================= CONGRESS (M4) =================
  { const o = sets.congress, w = 18, d = 16, h = 9;
    const floor = add(new THREE.PlaneGeometry(w, d), texM(P.planks(55), 4, 4, '#9a6a4a'), 0, 0, 0, o, { cast: false }); floor.rotation.x = -Math.PI / 2;
    const wm = toon({ map: P.tex(P.plaster(61, 36), 3, 2), color: '#e8dcc0' });
    add(tbox(w, 0.3, d), tm('#d8c8a0'), 0, h, 0, o); for (const s of [-1, 1]) add(tbox(0.3, h, d), wm, s * w / 2, h / 2, 0, o); add(tbox(w, h, 0.3), wm, 0, h / 2, d / 2, o);
    // back wall with three tall arched windows
    for (const [x0, x1] of [[-9, -6.4], [-4.6, -1.0], [1.0, 4.6], [6.4, 9]]) add(tbox(x1 - x0, h, 0.3), wm, (x0 + x1) / 2, h / 2, -d / 2, o);
    for (const xc of [-5.5, 0, 5.5]) { const ww = xc === 0 ? 2.0 : 1.8; add(tbox(ww, 2.5, 0.3), wm, xc, 1.25, -d / 2, o); add(tbox(ww, 1.6, 0.3), wm, xc, h - 0.8, -d / 2, o);
      for (const x of [-ww / 4, ww / 4]) add(tbox(0.06, 4.9, 0.1), M.white, xc + x, 4.95, -d / 2, o); for (const y of [3.6, 5.2, 6.6]) add(tbox(ww, 0.06, 0.1), M.white, xc, y, -d / 2, o); }
    for (let k = 0; k < 7; k++) add(tbox(5, 12 + (k % 3) * 4, 2), tm(['#c8b898', '#b8a888'][k % 2]), -18 + k * 6, 2, -d / 2 - 14, o, { cast: false });
    // columns
    for (const x of [-7.4, -2.9, 2.9, 7.4]) for (const z of [-6.8]) { add(cyl(0.45, 0.5, h - 0.8, 16), M.marble, x, h / 2 - 0.2, z, o); add(tbox(1.3, 0.4, 1.3), M.marble, x, 0.2, z, o); add(tbox(1.3, 0.5, 1.3), M.marble, x, h - 0.65, z, o); }
    // cornice + flags (stripes, no text) + a big wreath
    add(tbox(w, 0.6, 0.8), M.marble, 0, h - 1.6, -d / 2 + 0.6, o);
    for (const x of [-1.5, 1.5]) { const fp = G(o, x, 2.6, -6.6); fp.rotation.z = x > 0 ? -0.25 : 0.25; add(cyl(0.04, 0.04, 3.6, 6), M.brass, 0, 1.8, 0, fp); const fl = flagMesh(fp, 0, 3.4, 0.02, 1.5, 0.95); fl.rotation.z = -0.1; S.flags.push(fl); }
    // the rostrum
    add(tbox(4.2, 0.5, 2.4), M.mahog, 0, 0.25, -5.6, o); add(tbox(2.4, 1.3, 0.8), M.mahogL, 0, 1.15, -5.0, o); add(tbox(2.6, 0.1, 1.0), M.mahog, 0, 1.83, -5.0, o);
    add(new THREE.CircleGeometry(0.45, 24), M.gold, 0, 1.15, -4.58, o, { cast: false });
    // tiered desks facing the rostrum: rows that rise toward the camera side
    S.cDesks = [];
    for (let r = 0; r < 4; r++) for (let k = -3; k <= 3; k++) { const z = -2.0 + r * 1.9, y = (3 - r) * 0.35, x = k * 2.2 + (r % 2) * 1.1; if (Math.abs(x) > 8) continue;
      if (y > 0) add(tbox(2.2, y, 1.9), M.darkwood, x, y / 2, z, o); add(tbox(1.8, 0.85, 0.12), M.mahogL, x, y + 0.42, z + 0.45, o); add(tbox(1.9, 0.06, 0.55), M.mahog, x, y + 0.88, z + 0.3, o);
      for (let q = 0; q < 2; q++) add(tbox(0.25, 0.02, 0.32), M.paper, x - 0.4 + q * 0.6, y + 0.92, z + 0.3, o, { cast: false }); }
    const ch = G(o, 0, h - 1.8, 1.0); add(new THREE.TorusGeometry(1.4, 0.07, 6, 32), M.brass, 0, 0, 0, ch).rotation.x = Math.PI / 2; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; add(sph(0.1), M.lamp, Math.cos(a) * 1.4, 0.15, Math.sin(a) * 1.4, ch); } add(cyl(0.02, 0.02, 1.8, 4), M.brass, 0, 0.9, 0, ch);
    // paper plane
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.35, -0.22, 0.02, -0.2, 0, -0.06, -0.2, 0, 0, 0.35, 0, -0.06, -0.2, 0.22, 0.02, -0.2], 3)); pg.computeVertexNormals();
    S.plane = add(pg, new THREE.MeshToonMaterial({ gradientMap: ctx.grad, color: '#f8f2e0', side: THREE.DoubleSide }), 0, 0, 0, o);
    S.plane.visible = false;
  }

  // ================= SHOP (M5) =================
  { const o = sets.shop, w = 8, d = 6, h = 3.8, F = d / 2; // front wall at z=+3 (camera can be outside)
    const floor = add(new THREE.PlaneGeometry(w, d), texM(P.planks(65), 3, 2, '#b88a5a'), 0, 0, 0, o, { cast: false }); floor.rotation.x = -Math.PI / 2;
    const wm = toon({ map: P.tex(sidingT, 3, 2), color: '#e8d8a8' });
    add(tbox(w, 0.2, d), tm('#e8d8b8'), 0, h, 0, o); for (const s of [-1, 1]) add(tbox(0.3, h, d), wm, s * w / 2, h / 2, 0, o); add(tbox(w, h, 0.3), wm, 0, h / 2, -d / 2, o);
    // front wall with the display window (x -3..1, y 0.7..2.9) and door (x 1.8..2.9)
    const fm = toon({ map: P.tex(sidingT, 3, 2), color: '#3f7a5a' }), gm = tm('#e8c04a');
    add(tbox(1, h, 0.3), fm, -3.5, h / 2, F, o); add(tbox(4, 0.7, 0.3), fm, -1, 0.35, F, o); add(tbox(6.6, 0.9, 0.3), fm, -0.7, 3.35, F, o); add(tbox(0.8, h, 0.3), fm, 1.4, h / 2, F, o); add(tbox(1.1, 0.9, 0.3), fm, 2.35, 3.35, F, o); add(tbox(0.3, h, 0.3), fm, 3.25, h / 2, F, o);
    add(tbox(4.1, 0.1, 0.4), gm, -1, 0.72, F + 0.05, o); add(tbox(4.1, 0.1, 0.4), gm, -1, 2.92, F + 0.05, o); for (const x of [-3, 1]) add(tbox(0.1, 2.3, 0.4), gm, x, 1.8, F + 0.05, o);
    add(tbox(0.06, 2.2, 0.12), gm, -1, 1.8, F, o);
    const glassT = canvasTex(256, 256, (g) => { g.fillStyle = 'rgba(200,230,255,0.10)'; g.fillRect(0, 0, 256, 256); g.fillStyle = 'rgba(255,255,255,0.35)'; g.save(); g.translate(128, 128); g.rotate(-0.6); g.fillRect(-160, -60, 320, 26); g.fillRect(-160, -12, 320, 10); g.restore(); });
    S.glass = add(new THREE.PlaneGeometry(4, 2.2), new THREE.MeshBasicMaterial({ map: glassT, transparent: true, depthWrite: false }), -1, 1.8, F + 0.02, o, { cast: false }); S.glass.userData.ndSkip = true;
    add(tbox(1.1, 2.6, 0.08), tm('#5a3a24'), 2.35, 1.3, F + 0.05, o); add(tbox(0.7, 1.0, 0.04), M.glass, 2.35, 1.8, F + 0.1, o);
    const aw = add(new THREE.PlaneGeometry(5.2, 1.4), AWN[0], -0.6, 3.5, F + 0.6, o); aw.rotation.x = -1.0;
    // the window sign (German)
    const signT = canvasTex(1024, 420, (g, W2, H2) => { g.fillStyle = '#f6eed8'; g.fillRect(0, 0, W2, H2); g.strokeStyle = '#2e5a3a'; g.lineWidth = 18; g.strokeRect(14, 14, W2 - 28, H2 - 28);
      g.fillStyle = '#b8302c'; g.textAlign = 'center'; g.font = 'bold 104px "DejaVu Serif", Georgia, serif'; g.fillText('Kaiserliches Geld', W2 / 2, 160);
      g.fillStyle = '#2e5a3a'; g.font = 'bold 92px "DejaVu Serif", Georgia, serif'; g.fillText('hier willkommen', W2 / 2, 300);
      g.fillStyle = '#e8b84a'; for (const x of [70, W2 - 70]) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 14 : 34; g.lineTo(x + Math.cos(a) * r, 220 + Math.sin(a) * r); } g.fill(); } });
    add(tbox(2.5, 1.06, 0.04), tm('#5a3a24'), -1.6, 1.42, F - 0.2, o); S.shopSign = add(new THREE.PlaneGeometry(2.4, 0.98), basic(signT), -1.6, 1.42, F - 0.17, o, { cast: false }); S.shopSign.userData.ndSkip = true;
    for (const x of [-2.6, -0.6]) add(cyl(0.008, 0.008, 1.2, 3), M.iron, x, 2.45, F - 0.2, o, { cast: false });
    // display: a pyramid of apples and jars in the window
    for (let k = 0; k < 10; k++) add(sph(0.08, 8, 6), tm(k % 3 ? '#c8302c' : '#e8b84a'), 0.2 + (k % 4) * 0.17, 0.82 + Math.floor(k / 4) * 0.13, F - 0.4, o);
    // outside: sidewalk + crates of apples (foreground) + gas lamp
    const sw = add(new THREE.PlaneGeometry(w + 6, 6), M.walk, 0, 0.0, F + 3, o, { cast: false }); sw.rotation.x = -Math.PI / 2;
    for (const [x, z] of [[-3.6, F + 1.0], [-2.7, F + 1.2]]) { add(tbox(0.8, 0.5, 0.6, 0.6), M.plank, x, 0.25, z, o); for (let k = 0; k < 6; k++) add(sph(0.1, 8, 6), tm(k % 2 ? '#c8302c' : '#78b84a'), x - 0.25 + (k % 3) * 0.25, 0.55, z - 0.12 + Math.floor(k / 3) * 0.24, o); }
    { const g = G(o, 3.8, 0, F + 1.4); add(cyl(0.08, 0.13, 3.8, 8), M.iron, 0, 1.9, 0, g); add(tbox(0.42, 0.55, 0.42), M.lamp, 0, 4.05, 0, g); }
    for (let k = 0; k < 6; k++) add(tbox(5, 8, 3), tm(PAINT[k]), -14 + k * 5.5, 4, F + 10, o, { cast: false });
    // inside: counter, register, jars, shelves, sacks, barrel
    const ct = G(o, 0, 0, -0.6); add(tbox(5.0, 1.0, 0.9, 1), M.plank, -0.3, 0.5, 0, ct); add(tbox(5.2, 0.08, 1.0), M.darkwood, -0.3, 1.04, 0, ct);
    const reg = G(ct, 1.4, 1.08, 0); add(tbox(0.6, 0.4, 0.5), M.brass, 0, 0.2, 0, reg); add(tbox(0.5, 0.25, 0.08), tm('#f4ecd6'), 0, 0.55, -0.15, reg);
    for (let k = 0; k < 8; k++) add(cyl(0.025, 0.025, 0.06, 6), M.white, -0.2 + (k % 4) * 0.13, 0.43, 0.08 + Math.floor(k / 4) * 0.1, reg);
    S.drawer = add(tbox(0.56, 0.12, 0.4), M.brass, 0, 0.06, 0.05, reg);
    S.jars = [];
    for (let k = 0; k < 4; k++) { const j = G(ct, -2.1 + k * 0.42, 1.08, 0.05); add(cyl(0.15, 0.16, 0.42, 14), new THREE.MeshToonMaterial({ gradientMap: ctx.grad, color: '#d8eef8', transparent: true, opacity: 0.55 }), 0, 0.21, 0, j, { cast: false });
      add(cyl(0.165, 0.165, 0.07, 14), tm('#c8873e'), 0, 0.45, 0, j); for (let q = 0; q < 7; q++) add(sph(0.045, 6, 5), tm(['#e8343a', '#f4dc4a', '#4ab06a', '#e86aa0'][(q + k) % 4]), Math.cos(q * 2.3) * 0.08, 0.06 + (q % 4) * 0.08, Math.sin(q * 2.3) * 0.08, j); S.jars.push(j); }
    for (let r = 0; r < 4; r++) { add(tbox(6.6, 0.06, 0.5), M.darkwood, 0, 0.9 + r * 0.7, -2.6, o);
      for (let k = 0; k < 15; k++) { const x = -3.1 + k * 0.44, y = 0.93 + r * 0.7; if ((k + r) % 3 === 0) { add(cyl(0.13, 0.13, 0.34, 10), new THREE.MeshToonMaterial({ gradientMap: ctx.grad, color: '#d8eef8', transparent: true, opacity: 0.6 }), x, y + 0.17, -2.55, o, { cast: false }); add(sph(0.1, 6, 5), tm(['#e8343a', '#f4dc4a', '#4ab06a'][k % 3]), x, y + 0.12, -2.55, o); }
        else add(tbox(0.3, 0.32 + (k % 2) * 0.1, 0.3), tm(['#c8302c', '#e8b84a', '#3a7a9a', '#f4ecd6', '#6a9a4a'][(k * 3 + r) % 5]), x, y + 0.18, -2.55, o); } }
    for (const [x, z] of [[-3.3, -1.6], [-2.8, -1.9], [3.2, -1.5]]) { const s_ = add(new THREE.CapsuleGeometry(0.28, 0.4, 4, 8), toon({ color: '#c8a874' }), x, 0.45, z, o); }
    add(cyl(0.34, 0.3, 0.9, 12), M.darkwood, 3.3, 0.45, 0.6, o); add(sph(0.2), M.lamp, -0.4, 3.2, -0.6, o); add(cyl(0.01, 0.01, 0.6, 3), M.iron, -0.4, 3.5, -0.6, o);
  }

  // ================= shared FX systems (instanced, deterministic) =================
  {
    // confetti
    const n = 320, geo = new THREE.PlaneGeometry(0.07, 0.045), mat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
    const im = new THREE.InstancedMesh(geo, mat, n); im.userData.ndSkip = true; im.frustumCulled = false; const col = new THREE.Color(), cc = ['#e8343a', '#f4dc4a', '#3a8ae0', '#4ab06a', '#e86aa0', '#f4f0e6', '#f2a93a'];
    for (let i = 0; i < n; i++) im.setColorAt(i, col.set(cc[i % cc.length])); scene.add(im); S.conf = im; im.visible = false;
    // flying newspaper pages
    const pg = new THREE.PlaneGeometry(0.42, 0.56), pm = new THREE.MeshToonMaterial({ gradientMap: ctx.grad, map: S.newsT, side: THREE.DoubleSide });
    const pi = new THREE.InstancedMesh(pg, pm, 24); pi.frustumCulled = false; scene.add(pi); S.pages = pi; pi.visible = false;
    // dust motes / sparkles (additive points)
    const mt = cv(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
    const N = 260, pos = new Float32Array(N * 3); const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pmat = new THREE.PointsMaterial({ map: new THREE.CanvasTexture(mt), size: 0.05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#fff0c8', sizeAttenuation: true, fog: false });
    const pts = new THREE.Points(bg, pmat); pts.userData.ndSkip = true; pts.frustumCulled = false; pts.renderOrder = 5; scene.add(pts); S.motes = pts; pts.visible = false;
    // light shafts
    const sh = cv(64, 256, (g) => { const r = g.createLinearGradient(0, 0, 0, 256); r.addColorStop(0, 'rgba(255,255,255,0.9)'); r.addColorStop(0.7, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 256);
      const e = g.createLinearGradient(0, 0, 64, 0); e.addColorStop(0, 'rgba(0,0,0,1)'); e.addColorStop(0.25, 'rgba(0,0,0,0)'); e.addColorStop(0.75, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = e; g.fillRect(0, 0, 64, 256); });
    const shT = new THREE.CanvasTexture(sh); S.shafts = [];
    const shaft = (parent, x, y, z, w, h, rx, ry = 0, col = '#ffe2a8', k = 0.3) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: shT, color: col, transparent: true, opacity: k, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.userData.ndSkip = true; m.renderOrder = 6; m.userData.k = k; parent.add(m); S.shafts.push(m); return m; };
    for (const dx of [-0.6, 0, 0.6]) shaft(sets.office, dx, 2.2, -2.6, 0.9, 4.2, -0.95, 0, '#ffe2a8', 0.22);
    for (const xc of [-3.5, 3.5]) for (const dx of [-0.4, 0.4]) shaft(sets.press, xc + dx, 2.6, -3.4, 0.9, 4.8, -0.65, 0, '#ffe6b0', 0.24);
    for (const xc of [-5.5, 0, 5.5]) for (const dx of [-0.5, 0.5]) shaft(sets.congress, xc + dx, 3.6, -5.6, 1.0, 7, -0.6, 0, '#ffeacc', 0.18);
    for (const dx of [-2.2, -1.2, -0.2]) shaft(sets.shop, dx, 1.4, 2.0, 0.9, 3.0, 0.95, 0, '#ffe2a8', 0.2);
    // the soapbox crate in the street (shot 10)
    S.crate = G(st); add(tbox(1.2, 0.62, 0.9, 0.6), M.plank, 0, 0.31, 0, S.crate); add(tbox(1.24, 0.06, 0.94), M.darkwood, 0, 0.6, 0, S.crate); for (const s_ of [-1, 1]) add(tbox(0.06, 0.62, 0.94), M.darkwood, s_ * 0.6, 0.31, 0, S.crate);
    // a movable foreground gas lamp + paper bundle (for parallax near the lens)
    S.fgLamp = G(st); add(cyl(0.08, 0.13, 3.8, 8), M.iron, 0, 1.9, 0, S.fgLamp); add(cyl(0.18, 0.18, 0.3, 8), M.iron, 0, 0.15, 0, S.fgLamp); add(tbox(0.42, 0.55, 0.42), M.lamp, 0, 4.05, 0, S.fgLamp);
    S.fgBundle = G(st); for (let k = 0; k < 4; k++) { const m = add(tbox(0.6, 0.18, 0.45), M.paper, (k % 2) * 0.05, 0.09 + k * 0.18, 0, S.fgBundle); m.rotation.y = k * 0.25; } add(tbox(0.04, 0.75, 0.47), M.rope, 0, 0.37, 0, S.fgBundle);
    // flowers for the final shots (separate from the mourners)
    S.flowers = G(st); S.flowers.visible = false;
    for (let k = 0; k < 90; k++) { const r = P.rng(900 + k); const x = (r() - 0.5) * 3.6, z = -18.6 - r() * 6; const c = ['#e8343a', '#f4f0e6', '#f4dc4a', '#e86aa0', '#f2a93a'][k % 5];
      const fs_ = 0.035 + r() * 0.03; add(sph(fs_, 6, 5), tm(c), x, H(z) + fs_, z, S.flowers, { cast: false }); add(sph(fs_ * 0.4, 5, 4), tm('#f4dc4a'), x, H(z) + fs_ * 1.9, z, S.flowers, { cast: false }); if (k % 3 === 0) add(new THREE.ConeGeometry(0.05, 0.22, 4), M.leaf, x + 0.06, H(z) + 0.05, z, S.flowers, { cast: false }).rotation.z = 1.2; }
    // seal stamp (shot 8b)
    S.stamp = G(sets.office); add(cyl(0.05, 0.06, 0.06, 16), M.brass, 0, 0.03, 0, S.stamp); add(cyl(0.025, 0.03, 0.16, 10), M.darkwood, 0, 0.14, 0, S.stamp); add(sph(0.045, 10, 8), M.darkwood, 0, 0.24, 0, S.stamp);
  }
};

const CAST_HAS_HAT = (n) => ['worker', 'lady', 'miner', 'sailor', 'gent', 'boy', 'driver', 'grocer'].includes(n);

// ---------- per frame ----------
export const update = (ctx, W, f) => {
  const { THREE } = ctx, t = f / 30, cam = W.cam || [0, 2, 10];
  for (const k in S.sets) S.sets[k].visible = (W.set || 'street') === k;
  const face = (m) => { const p = new THREE.Vector3(); m.getWorldPosition(p); const a = Math.atan2(cam[0] - p.x, cam[2] - p.z); m.rotation.y = a - (m.parent && m.parent.rotation ? m.parent.rotation.y : 0); };
  if (W.set === 'street' || !W.set) {
    // carriages + drivers, cable car + riders, walkers
    const tri = (c) => { const L = Math.abs(c.z1 - c.z0), v = ((t * c.speed / L + c.ph) % 2 + 2) % 2; return v < 1 ? [v, 1] : [2 - v, -1]; };
    for (const c of S.carriages) { const [u, sg] = tri(c), z = c.z0 + (c.z1 - c.z0) * u, dir = Math.sign(c.z1 - c.z0) * sg;
      c.g.visible = W.traffic !== false; c.g.position.set(c.x, H(z), z); c.g.rotation.y = dir > 0 ? 0 : Math.PI; const sl = (H(z + 1) - H(z - 1)) / 2; c.g.rotation.x = -Math.atan(sl) * dir;
      c.g.userData.wheels.forEach((w) => { w.rotation.x = t * c.speed * 2; }); c.g.userData.horse.userData.legs.forEach((L, i) => { L.rotation.x = Math.sin(t * 9 + i * 1.6) * 0.45; });
      c.d.visible = c.g.visible; c.d.position.set(c.x, H(z) + 0.75 + Math.abs(Math.sin(t * 9)) * 0.03, z + dir * 0.5); }
    { const c = S.tram, [u] = tri(c), z = W.tramZ ?? (c.z0 + (c.z1 - c.z0) * u);
      c.g.visible = W.traffic !== false; c.g.position.set(c.x, H(z) + 0.05, z); const sl = (H(z + 1) - H(z - 1)) / 2; c.g.rotation.x = Math.atan(sl);
      c.riders.forEach((r, i) => { r.visible = c.g.visible; r.position.set(c.x + (i % 2 ? 0.7 : -0.7), H(z) + 0.75, z - 2 + i * 1.3); }); }
    for (const w of S.walkers) { const z = w.z0 + ((t * w.v) % 12); w.m.position.set(w.x, H(z) + 0.14 + Math.abs(Math.sin(t * 6 + w.z0)) * 0.05, z); w.m.visible = W.walkers !== false; }
    // flags wave, bunting flutters, signs swing
    for (const fl of S.flags) { const p = fl.geometry.attributes.position, p0 = fl.userData.p0; for (let i = 0; i < p.count; i++) { const x = p0[i * 3]; p.setZ(i, Math.sin(x * 3.2 - t * 7) * 0.12 * x); } p.needsUpdate = true; fl.geometry.computeVertexNormals(); }
    S.bunt.forEach((b, i) => { b.visible = !W.funeral && !W.flowers; if (b.geometry.type !== 'TubeGeometry') b.rotation.x = Math.sin(t * 5 + i * 0.7) * 0.5; });
    (S.signs || []).forEach((s, i) => { s.rotation.x = Math.sin(t * 2.2 + i) * 0.12; });
    // gulls circle over the street and the bay
    S.gulls.forEach((g, i) => { const r = 14 + (i % 5) * 7, cx = (i % 3 - 1) * 14, cz = i < 9 ? -38 - (i % 4) * 14 : -120 - (i % 4) * 30, y = (i < 9 ? 15 : -7) + (i % 4) * (i < 9 ? 4 : 2.5), sp = 0.18 + (i % 3) * 0.05, a = t * sp * (i % 2 ? 1 : -1) + i * 1.7;
      g.position.set(cx + Math.cos(a) * r, y + Math.sin(t * 1.3 + i) * 1.2, cz + Math.sin(a) * r * 0.6); g.scale.set(Math.cos(a) * (i % 2 ? 1 : -1) > 0 ? 1.6 : -1.6, 1.6, 1); g.visible = W.gulls !== false;
      g.userData.ph = ((t * 3.2 + i * 0.37) % 1); face(g); });
    // police doors
    S.doors.forEach((d) => { d.rotation.y = d.userData.s * (W.door || 0) * 1.6; });
    // ships bob
    S.ships.forEach((s, i) => { s.position.y = WATER + Math.sin(t * 1.1 + i) * 0.12; s.rotation.z = Math.sin(t * 0.9 + i * 2) * 0.03; });
    // the bridge (present day) + its traffic
    S.bridge.visible = (W.bridge || 0) > 0;
    S.cars.forEach((c) => { const i = c.userData.i, dir = i % 2 ? 1 : -1; c.position.set(((t * 18 * dir + i * 41) % 520 + 520) % 520 - 260, 0, dir * 2); c.rotation.y = dir > 0 ? 0 : Math.PI; });
    // fog bank (parts on the reveal)
    const fogK = W.fog ?? 0, part = W.fogPart || 0;
    S.fogs.forEach((m, i) => { const u = m.userData; m.visible = fogK > 0.01; const dx = Math.sign(u.x || 1) * part * 260; m.position.set(u.x + dx + Math.sin(t * 0.2 + i) * 6, u.y, u.z); m.scale.set(u.s * 1.6, u.s * 0.7, 1); m.material.opacity = 0.5 * fogK * (1 - part * 0.9); face(m); });
    const mk = W.mist || 0; S.mist.forEach((m, i) => { m.visible = mk > 0.01; const c = W.mistAt || [0, 0, 0]; m.position.set(c[0] + (i - 5) * 3 + Math.sin(t * 0.3 + i) * 1.5, c[1] + 0.6 + (i % 3) * 0.5, c[2] - (i % 4) * 3); m.scale.set(9, 2.6, 1); m.material.opacity = 0.22 * mk; face(m); });
    // funeral
    S.mourners.visible = !!W.funeral; S.hearse.visible = W.hearseZ != null;
    if (W.hearseZ != null) { const z = W.hearseZ; S.hearse.position.set(0, H(z), z); S.hearse.rotation.y = Math.PI; S.hearse.userData.wheels.forEach((w) => { w.rotation.x = -z * 1.6; }); S.hearse.userData.horse.userData.legs.forEach((L, i) => { L.rotation.x = Math.sin(z * 2.2 + i * 1.6) * 0.3; }); }
    S.lamps.forEach((l) => { l.visible = true; });
  }
  if (W.set === 'office') { S.offRich.visible = W.office === 'rich'; S.gold.visible = W.office === 'rich' && (W.goldK ?? 1) > 0.02; S.gold.scale.setScalar(Math.max(0.001, W.goldK ?? 1));
    S.offEmpty.visible = W.office !== 'rich'; S.offNight.visible = W.office === 'night'; S.chair.visible = W.office !== 'night' || true;
    S.chair.position.set(0, 0, W.office === 'rich' ? -1.5 : 0.55);
    for (const m of S.offWalls) m.material = W.office === 'rich' ? S.wpRich : S.wpPale;
    S.flame.scale.set(1, 1 + Math.sin(t * 17) * 0.15, 1); S.seal.visible = (W.seal || 0) > 0.5; }
  if (W.set === 'press') { const sp = W.pressSpin ?? 1; S.rolls.forEach((r, i) => { r.rotation.x = t * sp * (i % 2 ? -3 : 3); }); S.flywheel.rotation.x = t * sp * 2.2;
    S.hang.forEach((h) => { h.rotation.x = Math.sin(t * 1.5 + h.userData.k) * 0.08; });
    S.hero.material.map = W.money ? S.moneyT : S.newsT; S.hero.material.needsUpdate = true;
    const u = W.sheet ?? 1; S.hero.position.set(0, 1.0 + (1 - u) * 0.0, 1.3 + u * 1.0); S.hero.visible = W.sheetVis !== false; }
  if (W.set === 'congress') { S.plane.visible = W.plane != null; if (W.plane != null) { const u = W.plane; S.plane.position.set(-2 + u * 7, 2.0 + Math.sin(u * 3.1) * 1.2, 2.5 - u * 7); S.plane.rotation.set(Math.sin(u * 6) * 0.2, 0.9, Math.sin(u * 8) * 0.4); }
    for (const fl of S.flags) { const p = fl.geometry.attributes.position, p0 = fl.userData.p0; for (let i = 0; i < p.count; i++) { const x = p0[i * 3]; p.setZ(i, Math.sin(x * 3.2 - t * 3) * 0.05 * x); } p.needsUpdate = true; } }
  if (W.set === 'shop') { S.drawer.position.z = 0.05 + (W.drawer || 0) * 0.3; S.jars.forEach((j, i) => { j.visible = !(W.jarTaken && i === 1); }); }

  // ---- shared fx ----
  { const c = W.conf; S.conf.visible = !!c; if (c) { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1);
      for (let i = 0; i < 320; i++) { const r = ((i * 9301 + 49297) % 233280) / 233280, r2 = ((i * 4271 + 1123) % 997) / 997, r3 = ((i * 7919) % 1009) / 1009; const age = c.age - r3 * (c.spread ?? 0.3);
        if (age < 0) { v.set(0, -999, 0); } else { const a = r * Math.PI * 2, sp = 2 + r2 * 4; v.set(c.at[0] + Math.cos(a) * sp * Math.min(age, 0.7) + Math.sin(age * 3 + i) * 0.25, c.at[1] + (3.5 + r2 * 3) * Math.min(age, 0.7) - Math.max(0, age - 0.5) * 0.9 - 0.5, c.at[2] + Math.sin(a) * sp * Math.min(age, 0.7) * 0.6);
          v.y = Math.max(v.y, c.ground ?? 0); }
        e.set(age * 7 + i, age * 5 + r * 6, age * 3); q.setFromEuler(e); sc.setScalar(c.s ?? 1.4); m.compose(v, q, sc); S.conf.setMatrixAt(i, m); } S.conf.instanceMatrix.needsUpdate = true; } }
  { const c = W.pages; S.pages.visible = !!c; if (c) { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1);
      for (let i = 0; i < 24; i++) { const u = (c.t * (0.12 + (i % 5) * 0.03) + i * 0.137) % 1; v.set(c.at[0] + (i % 6 - 2.5) * 1.6 + u * (c.wind ?? 6) - 3, c.at[1] + Math.sin(u * 6 + i) * 0.8 + (i % 4) * 0.7, c.at[2] + (Math.floor(i / 6) - 1.5) * 1.8);
        e.set(u * 9 + i, u * 6 + i * 2, u * 4); q.setFromEuler(e); sc.setScalar(c.s ?? 1); m.compose(v, q, sc); S.pages.setMatrixAt(i, m); } S.pages.instanceMatrix.needsUpdate = true; } }
  { const c = W.motes; S.motes.visible = !!c; if (c) { const p = S.motes.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const r1 = ((i * 9301 + 49297) % 233280) / 233280, r2 = ((i * 4271 + 1123) % 997) / 997, r3 = ((i * 7919) % 1009) / 1009;
        p.setXYZ(i, c.at[0] + (r1 - 0.5) * c.box[0] + Math.sin(t * 0.4 + i) * 0.15, c.at[1] + ((r2 + t * 0.03) % 1) * c.box[1], c.at[2] + (r3 - 0.5) * c.box[2]); } p.needsUpdate = true; S.motes.material.color.set(c.col || '#fff0c8'); S.motes.material.size = c.size || 0.05; S.motes.material.opacity = c.k ?? 0.9; } }
  S.shafts.forEach((m) => { m.material.opacity = m.userData.k * (W.shaftK ?? 1); });
  S.crate.visible = !!W.crate; if (W.crate) S.crate.position.set(...W.crate);
  S.fgLamp.visible = !!W.fgLamp; if (W.fgLamp) S.fgLamp.position.set(...W.fgLamp);
  S.fgBundle.visible = !!W.fgBundle; if (W.fgBundle) S.fgBundle.position.set(...W.fgBundle);
  S.flowers.visible = !!W.flowers;
  S.stamp.visible = W.stamp != null; if (W.stamp != null) S.stamp.position.set(-0.05 + 0.08, 0.875 + W.stamp, 1.2 + 0.12);
  // billboards face the camera
  for (const m of S.bills) if (m.visible !== false) face(m);
  // gull flap frames
  if (S.gulls && S.gullTex) S.gulls.forEach((g) => { g.material.map = S.gullTex[(g.userData.ph * 4) | 0]; });
};
