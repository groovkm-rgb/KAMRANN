// Sets for "Der Mann, der den Eiffelturm verkaufte". All sets sit at the origin; only the active one is visible.
// No set element carries letters or digits.
export function buildSets(C) {
  const { THREE, P, T, scene, toon, grad } = C;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const G = {}, A = {}, POINTS = {};
  const mk = (name) => { const g = new THREE.Group(); g.visible = false; scene.add(g); G[name] = g; return g; };
  const add = (geo, mat, x = 0, y = 0, z = 0, parent, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = true; parent.add(m); return m; };
  const tm = (c, rx = 1, ry = 1, color = '#ffffff') => toon({ map: P.tex(c, rx, ry), color });
  const basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color, ...o });
  // world-scaled UV box
  const tbox = (w, h, d, t = 2) => {
    const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
    return g;
  };
  const cyl = (r0, r1, h, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
  // ---- geometry batching (one mesh per material) ----
  const batch = () => {
    const list = []; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1);
    const put = (g, x, y, z, rx = 0, ry = 0, rz = 0, sc = null) => { e.set(rx, ry, rz); q.setFromEuler(e); m4.compose(V3(x, y, z), q, sc || s); g.applyMatrix4(m4); list.push(g); return g; };
    const beam = (a, b, w, d = w, t = 2) => {
      const A_ = V3(...a), B_ = V3(...b), L = A_.distanceTo(B_); if (L < 1e-4) return;
      const g = tbox(w, d, L, t), dir = B_.clone().sub(A_).normalize(), up = Math.abs(dir.y) > 0.98 ? V3(1, 0, 0) : V3(0, 1, 0);
      const mm = new THREE.Matrix4().lookAt(A_, B_, up); mm.setPosition(A_.clone().add(B_).multiplyScalar(0.5)); g.applyMatrix4(mm); list.push(g);
    };
    const mesh = (mat, parent, o = {}) => {
      if (!list.length) return null;
      const cat = (k, n) => { const arrs = list.map((g0) => { const g = g0.index ? g0.toNonIndexed() : g0; return g.attributes[k] ? g.attributes[k].array : new Float32Array(g.attributes.position.count * n); }); const o_ = new Float32Array(arrs.reduce((s_, a) => s_ + a.length, 0)); let k_ = 0; for (const a of arrs) { o_.set(a, k_); k_ += a.length; } return o_; };
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(cat('position', 3), 3)); g.setAttribute('normal', new THREE.BufferAttribute(cat('normal', 3), 3)); g.setAttribute('uv', new THREE.BufferAttribute(cat('uv', 2), 2));
      const m = new THREE.Mesh(g, mat); m.castShadow = o.cast ?? true; m.receiveShadow = true; parent.add(m); return m;
    };
    return { put, beam, mesh, list };
  };
  const rng = P.rng;

  // ---------------- shared materials ----------------
  const M = {
    cobble: tm(P.cobble(21), 1, 1), iron: tm(P.rustIron(22), 1, 1), ironHero: tm(P.rustIron(122, [22, 30, 30], 1.3), 1, 1),
    facade: tm(P.facade(23), 1, 1), facade2: tm(P.facade(123, 34), 1, 1), zinc: tm(P.zinc(24), 1, 1), chimney: toon({ color: '#b0684a' }),
    stone: tm(P.stone(41, 40, 22, 72), 1, 1), stoneDark: tm(P.stone(42, 36, 14, 52), 1, 1), grass: tm(P.grass(6), 1, 1), lawn: toon({ color: '#6f8f4a' }), tree: toon({ color: '#4f7a3a' }), treeDark: toon({ color: '#3d5f30' }), trunk: toon({ color: '#5a4030' }),
    street: tm(P.concrete(43, 62), 1, 1), black: toon({ color: '#1c1a1e' }), lampGreen: toon({ color: '#1f3a2e' }), gold: toon({ color: '#d4a744' }), brass: toon({ color: '#c9a050' }),
    white: toon({ color: '#f2ede2' }), cream: toon({ color: '#efe3c6' }), marbleChk: tm(P.checker(25), 1, 1), carpet: tm(P.carpet(26), 1, 1),
    damask: tm(P.damask(27), 1, 1), damaskGreen: tm(P.damask(127, '#3a4a32', 'rgba(230,210,150,.18)'), 1, 1), damaskNavy: tm(P.damask(227, '#1d2340', 'rgba(200,190,160,.14)'), 1, 1),
    mahog: tm(P.wood(28, 8, 52, 26), 1, 1), oak: tm(P.wood(128, 28, 45, 42), 1, 1), walnut: tm(P.wood(228, 20, 40, 22), 1, 1), velvet: tm(P.velvet(29), 2, 1), velvetGreen: tm(P.velvet(129, 150, 22), 2, 1),
    brick: tm(P.brick(30), 1, 1), concrete: tm(P.concrete(31), 1, 1), concreteDark: tm(P.concrete(131, 40), 1, 1), rock: tm(P.rock(32), 1, 1, '#c8cce0'),
    awning: tm(P.stripesTex('#efe0c0', '#7d1f2e', 10), 1, 1), wainscot: tm(P.wainscot(33), 1, 1), wainscotGreen: tm(P.wainscot(133, '#b7bfa6', '#3e4a38'), 1, 1),
    leather: toon({ color: '#5a2a1e' }), leatherBrown: toon({ color: '#6a3e22' }), glassDark: toon({ color: '#2b3442' }), plaster: tm(P.plaster(44, 38), 1, 1), plasterNight: tm(P.plaster(45, 215), 1, 1),
    planks: tm(P.planks(46), 1, 1), dirt: tm(P.dirt(47), 1, 1), books: tm(P.bookSpines(39), 1, 1), painting: tm(P.painting(40), 1, 1),
    red: toon({ color: '#9c1f28' }), loco: toon({ color: '#1f2624' }), locoRed: toon({ color: '#a8262c' }), teak: tm(P.wood(328, 22, 55, 34), 1, 1), burg: toon({ color: '#5e1a24' }),
    rust: toon({ color: '#7a4428' }), rust2: toon({ color: '#8f5a34' }), steel: toon({ color: '#6a6e74' }), green: toon({ color: '#2f5a3a' }), bars: toon({ color: '#3a3d42' }),
    fields: tm(P.fields(38), 1, 1), paper: toon({ color: '#efe6cf' }),
  };
  const glassM = new THREE.MeshToonMaterial({ gradientMap: grad, color: '#b8d4e4', transparent: true, opacity: 0.32, depthWrite: false });
  const glowM = (c) => basic(c, { fog: false });
  const ndSkip = (m) => { m.userData.ndSkip = true; m.castShadow = false; return m; };
  const docTex = P.tex(P.documentTex(35, 1, 1)); docTex.wrapS = docTex.wrapT = THREE.ClampToEdgeWrapping;
  const noteTex = P.tex(P.banknote(36)); noteTex.wrapS = noteTex.wrapT = THREE.ClampToEdgeWrapping;
  M.doc = toon({ map: docTex }); M.note = toon({ map: noteTex });
  const viewDay = P.tex(P.parisView(0)), viewNight = P.tex(P.parisView(1)); viewDay.wrapS = viewDay.wrapT = viewNight.wrapS = viewNight.wrapT = THREE.ClampToEdgeWrapping;
  M.view = basic('#ffffff', { map: viewDay }); M.viewNight = basic('#ffffff', { map: viewNight });

  // common furniture
  const tree = (g, x, y, z, s = 1, mat = M.tree) => { add(cyl(0.18 * s, 0.25 * s, 2.4 * s, 6), M.trunk, x, y + 1.2 * s, z, g); const c = add(new THREE.IcosahedronGeometry(1.6 * s, 1), mat, x, y + 3.2 * s, z, g); c.scale.set(1, 1.15, 1); return c; };
  const gasLamp = (g, x, y, z, s = 1) => {
    const L = new THREE.Group(); L.position.set(x, y, z); L.scale.setScalar(s); g.add(L);
    add(cyl(0.22, 0.3, 0.5, 10), M.lampGreen, 0, 0.25, 0, L); add(cyl(0.07, 0.11, 3.4, 10), M.lampGreen, 0, 2.1, 0, L);
    add(cyl(0.16, 0.12, 0.12, 8), M.lampGreen, 0, 3.85, 0, L); const lan = add(cyl(0.26, 0.16, 0.55, 6), glowM('#ffd27a'), 0, 4.2, 0, L); lan.userData.glow = true;
    add(new THREE.ConeGeometry(0.34, 0.3, 6), M.lampGreen, 0, 4.62, 0, L); add(new THREE.SphereGeometry(0.06, 8, 6), M.lampGreen, 0, 4.82, 0, L);
    for (const a of [0, Math.PI / 2]) { const arm = add(new THREE.TorusGeometry(0.22, 0.025, 6, 12, Math.PI), M.lampGreen, 0, 3.55, 0, L); arm.rotation.y = a; }
    return L;
  };
  const table = (g, x, y, z, w, d, h, top = M.mahog, leg = M.walnut) => { add(tbox(w, 0.07, d, 1), top, x, y + h, z, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.07, h, 0.07, 1), leg, x + sx * (w / 2 - 0.1), y + h / 2, z + sz * (d / 2 - 0.1), g); };
  const chairLeather = (g, x, y, z, ry = 0, mat = M.leather) => { const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.y = ry; g.add(c); add(tbox(0.62, 0.42, 0.6, 1), mat, 0, 0.3, 0, c); add(tbox(0.62, 0.8, 0.14, 1), mat, 0, 0.82, -0.26, c); for (const s of [-1, 1]) add(tbox(0.12, 0.3, 0.6, 1), mat, s * 0.34, 0.6, 0, c); add(cyl(0.05, 0.05, 0.62, 8), mat, 0, 1.22, -0.26, c).rotation.z = Math.PI / 2; return c; };
  const curtain = (g, x, y, z, w, h, mat, ry = 0) => { const m = add(new THREE.PlaneGeometry(w, h, 10, 2), mat, x, y, z, g, { cast: false }); m.rotation.y = ry; m.material.side = THREE.DoubleSide; const pa = m.geometry.attributes.position; for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin(pa.getX(i) / w * Math.PI * 9) * 0.06); pa.needsUpdate = true; m.geometry.computeVertexNormals(); return m; };
  const wallWithWindow = (bt, w, h, d, wx0, wx1, wy0, wy1, t = 2) => { // wall in XY plane centered x=0, base y=0, window opening
    bt.put(tbox(wx0 + w / 2, h, d, t), (-w / 2 + wx0) / 2, h / 2, 0);
    bt.put(tbox(w / 2 - wx1, h, d, t), (wx1 + w / 2) / 2, h / 2, 0);
    bt.put(tbox(wx1 - wx0, wy0, d, t), (wx0 + wx1) / 2, wy0 / 2, 0);
    bt.put(tbox(wx1 - wx0, h - wy1, d, t), (wx0 + wx1) / 2, (h + wy1) / 2, 0);
  };
  const waterMat = C.waterMat;

  // =====================================================================================
  // M1 PARIS: Trocadéro-like terrace, Seine with stone bridge + boat, rooftops, the (weathered) tower. Also the night rooftops for the escape.
  // =====================================================================================
  {
    const g = mk('paris'), GR = 6;
    add(new THREE.PlaneGeometry(3000, 3000), M.street, 0, GR - 0.02, 0, g, { cast: false }).rotation.x = -Math.PI / 2;
    // terrace block + cobbles + balustrade
    add(tbox(70, 20, 44, 6), M.stone, 0, GR + 10, 2, g);
    const cb = add(tbox(70, 0.2, 44, 3), M.cobble, 0, GR + 20.1, 2, g, { cast: false });
    const bal = batch();
    for (let x = -34; x <= 34; x += 0.55) bal.put(cyl(0.09, 0.12, 0.8, 8), x, GR + 20.6, -19.6);
    bal.put(tbox(70, 0.18, 0.45, 2), 0, GR + 21.05, -19.6); bal.put(tbox(70, 0.2, 0.5, 2), 0, GR + 20.25, -19.6);
    for (let x = -32; x <= 32; x += 8) bal.put(tbox(0.6, 1.3, 0.6, 1), x, GR + 20.75, -19.6);
    bal.mesh(M.stone, g);
    A.parisLamp = gasLamp(g, -1.9, GR + 20.2, -1.6, 1);
    gasLamp(g, 9, GR + 20.2, -6, 1); gasLamp(g, -14, GR + 20.2, -10, 1);
    // garden slope to the river
    const slope = add(tbox(80, 1, Math.hypot(70, 20), 6), M.lawn, 0, GR + 10, -55, g, { cast: false }); slope.rotation.x = -Math.atan2(20, 70);
    { const r = rng(5); for (let i = 0; i < 26; i++) { const z = -26 - r() * 62, x = (r() - 0.5) * 70, y = GR + 20 - (-(z + 20)) * 20 / 70; tree(g, x, y - 0.4, z, 1 + r() * 0.6, i % 3 ? M.tree : M.treeDark); } }
    // river + quays
    const river = add(new THREE.PlaneGeometry(3000, 44), waterMat, 0, GR - 4.6, -114, g, { cast: false }); river.rotation.x = -Math.PI / 2; river.userData.nd = C.waterNd; river.receiveShadow = false;
    add(new THREE.BoxGeometry(3000, 8, 6), M.stoneDark, 0, GR - 4, -95, g, { cast: false }); add(new THREE.BoxGeometry(3000, 8, 6), M.stoneDark, 0, GR - 4, -133, g, { cast: false });
    add(new THREE.BoxGeometry(3000, 6, 300), M.street, 0, GR - 3.1, -286, g, { cast: false });
    // stone bridge with five arches
    { const s = new THREE.Shape(); s.moveTo(-26, -6); s.lineTo(26, -6); s.lineTo(26, 3); s.lineTo(-26, 3); s.closePath();
      for (let i = 0; i < 5; i++) { const cx = -20 + i * 10, h = new THREE.Path(); h.moveTo(cx - 4, -6); h.lineTo(cx - 4, -2); h.absarc(cx, -2, 4, Math.PI, 0, true); h.lineTo(cx + 4, -6); h.closePath(); s.holes.push(h); }
      const bg = new THREE.ExtrudeGeometry(s, { depth: 16, bevelEnabled: false }); bg.translate(0, 0, -8); const br = add(bg, M.stone, 0, GR - 0.5, -114, g); br.rotation.y = Math.PI / 2;
      for (const z of [-104, -124]) for (const sx of [-1, 1]) add(tbox(1.2, 1.6, 1.2, 1), M.stone, sx * 7.8, GR + 3.3, z, g);
      add(tbox(0.4, 0.9, 52, 2), M.stone, -7.8, GR + 2.95, -114, g); add(tbox(0.4, 0.9, 52, 2), M.stone, 7.8, GR + 2.95, -114, g); }
    // boat
    { const b = new THREE.Group(); b.position.set(40, GR - 4.4, -110); g.add(b); A.boat = b;
      const hull = add(tbox(10, 1.4, 3, 2), M.walnut, 0, 0.4, 0, b); add(tbox(4, 1.4, 2.4, 1), M.cream, -1, 1.7, 0, b); add(cyl(0.18, 0.18, 1.4, 8), M.black, 0.6, 2.8, 0, b); add(tbox(10.2, 0.2, 3.2, 1), M.red, 0, 1.15, 0, b); }
    // Champ de Mars lawns and tree rows
    add(tbox(120, 0.3, 300, 6), M.lawn, 0, GR + 0.1, -290, g, { cast: false });
    { const r = rng(9); for (let z = -150; z > -430; z -= 14) for (const x of [-56, -48, 48, 56]) if (Math.abs(z + 260) > 75 || Math.abs(x) > 50) tree(g, x + r() * 2, GR, z, 1.6, M.treeDark); }
    // rooftops (merged): facades, zinc mansards, chimneys
    { const fac = batch(), fac2 = batch(), zn = batch(), ch = batch(), r = rng(17);
      const bldg = (x, z, w, d, h, lit, noRoof) => {
        (r() < 0.5 ? fac : fac2).put(tbox(w, h, d, 6.2), x, GR + h / 2, z);
        if (noRoof) return;
        const rf = new THREE.BoxGeometry(w, 4, d, 1, 1, 1), p_ = rf.attributes.position; for (let i = 0; i < p_.count; i++) if (p_.getY(i) > 0) { p_.setX(i, p_.getX(i) * 0.72); p_.setZ(i, p_.getZ(i) * 0.72); }
        rf.computeVertexNormals(); { const uv = rf.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 4, uv.getY(i)); } zn.put(rf, x, GR + h + 2, z);
        for (let k = 0; k < 2 + (r() * 3 | 0); k++) { const cx = x + (r() - 0.5) * w * 0.6, cz = z + (r() - 0.5) * d * 0.6; ch.put(tbox(0.9, 2.4, 2.4, 1), cx, GR + h + 4.6, cz); for (let j = 0; j < 3; j++) ch.put(cyl(0.18, 0.2, 0.8, 6), cx, GR + h + 6, cz - 0.7 + j * 0.7); }
      };
      const avoid = (x, z) => (Math.abs(x) < 40 && z > -95 && z < 30) || (z < -92 && z > -136) || (Math.abs(x) < 75 && z < -136 && z > -440) || (x > 30 && x < 80 && z > -75 && z < 25);
      for (let x = -700; x <= 700; x += 18) for (let z = -900; z <= 200; z += 18) { if (avoid(x, z) || r() < 0.12) continue; const w = 14 + r() * 4, d = 14 + r() * 4, h = 16 + r() * 8; bldg(x + r() * 2, z + r() * 2, w, d, h); }
      // the roof row for the night escape (flat walkable tops at ~ GR+22)
      for (let i = 0; i < 6; i++) bldg(38 + i * 7.2, -42, 7, 16, 18 + (i % 2) * 0.6);
      for (let i = 0; i < 3; i++) bldg(42 + i * 12, -8, 12, 14, 16.5, 0, i === 1);
      fac.mesh(M.facade, g); fac2.mesh(M.facade2, g); zn.mesh(M.zinc, g); ch.mesh(M.chimney, g);
      A.roofY = GR + 22; }
    // ---------------- the tower ----------------
    const TZ = -262, TY = GR, tw = batch(), tw2 = batch();
    const W_ = (y) => { const K = [[0, 62], [57, 36], [115, 21], [190, 10.5], [276, 5], [300, 1.6]]; for (let i = 0; i < K.length - 1; i++) if (y <= K[i + 1][0]) { const t = (y - K[i][0]) / (K[i + 1][0] - K[i][0]); return K[i][1] + (K[i + 1][1] - K[i][1]) * t; } return 1.6; };
    const D_ = (y) => y < 57 ? 15 - y * 0.06 : y < 115 ? 11.6 - (y - 57) * 0.06 : 0;
    const P3 = (x, y, z) => [x, TY + y, TZ + z];
    const ys = [0, 8, 16, 25, 34, 44, 57, 66, 76, 86, 96, 105, 115];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const chord = (y, ex, ez) => { const w = W_(y), d = D_(y), c = w - d / 2; return P3(sx * (c + ex * d / 2), y, sz * (c + ez * d / 2)); };
      for (let i = 0; i < ys.length - 1; i++) {
        const y0 = ys[i], y1 = ys[i + 1], th = 1.1 - y0 * 0.005;
        for (const [ex, ez] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) tw.beam(chord(y0, ex, ez), chord(y1, ex, ez), th, th, 2);
        const faces = [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]];
        for (const [a, b] of faces) { tw2.beam(chord(y0, ...a), chord(y1, ...b), 0.35, 0.35, 2); tw2.beam(chord(y0, ...b), chord(y1, ...a), 0.35, 0.35, 2); tw2.beam(chord(y1, ...a), chord(y1, ...b), 0.45, 0.45, 2); }
      }
    }
    // upper shaft
    const ys2 = []; for (let y = 115; y <= 276; y += 11.5) ys2.push(y);
    for (let i = 0; i < ys2.length - 1; i++) {
      const y0 = ys2[i], y1 = ys2[i + 1], c = (y) => W_(y);
      for (const [ex, ez] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) tw.beam(P3(ex * c(y0), y0, ez * c(y0)), P3(ex * c(y1), y1, ez * c(y1)), 0.9, 0.9, 2);
      const faces = [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]];
      for (const [a, b] of faces) { tw2.beam(P3(a[0] * c(y0), y0, a[1] * c(y0)), P3(b[0] * c(y1), y1, b[1] * c(y1)), 0.3, 0.3, 2); tw2.beam(P3(b[0] * c(y0), y0, b[1] * c(y0)), P3(a[0] * c(y1), y1, a[1] * c(y1)), 0.3, 0.3, 2); tw2.beam(P3(a[0] * c(y1), y1, a[1] * c(y1)), P3(b[0] * c(y1), y1, b[1] * c(y1)), 0.4, 0.4, 2); }
    }
    // platforms
    for (const [y, w, th] of [[57, 37.5, 4.2], [115, 22.5, 3]]) {
      for (const [ax, az, len] of [[0, 1, 1], [0, -1, 1], [1, 0, 0], [-1, 0, 0]]) { const L = 2 * w; if (len) tw.put(tbox(L, th, 3, 2), 0, TY + y, TZ + az * w); else tw.put(tbox(3, th, L, 2), TX(ax, w), TY + y, TZ); }
      for (let k = -w; k <= w; k += 1.6) for (const s of [-1, 1]) { tw2.put(tbox(0.12, 1.2, 0.12, 1), k, TY + y + th / 2 + 0.6, TZ + s * (w + 1.4)); tw2.put(tbox(0.12, 1.2, 0.12, 1), s * (w + 1.4), TY + y + th / 2 + 0.6, TZ + k); }
      for (const s of [-1, 1]) { tw2.put(tbox(2 * w + 3, 0.15, 0.15, 2), 0, TY + y + th / 2 + 1.2, TZ + s * (w + 1.4)); tw2.put(tbox(0.15, 0.15, 2 * w + 3, 2), s * (w + 1.4), TY + y + th / 2 + 1.2, TZ); }
    }
    function TX(ax, w) { return ax * w; }
    // decorative arches under the first platform
    for (let k = 0; k < 4; k++) { const ar = new THREE.TorusGeometry(31, 0.9, 6, 40, Math.PI); const a = k * Math.PI / 2; tw.put(ar, Math.sin(a) * 47, TY + 22, TZ + Math.cos(a) * 47, 0, a, 0); }
    // top: cabin, lantern, mast
    tw.put(tbox(9, 6, 9, 2), 0, TY + 279, TZ); tw.put(cyl(3, 4, 4, 12), 0, TY + 284, TZ); tw.put(cyl(0.5, 0.6, 18, 8), 0, TY + 294, TZ);
    tw.mesh(M.iron, g); tw2.mesh(M.iron, g);
    // scaffold on the near-left leg + bird nests
    { const sc = batch(); const x0 = -58, z0 = TZ + 46; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { sc.put(tbox(0.2, 24, 0.2, 1), x0 + i * 2.6, TY + 12, z0 + j * 2.6); }
      for (let y = 3; y < 24; y += 3) { sc.put(tbox(13.5, 0.18, 0.18, 1), x0 + 6.5, TY + y, z0); sc.put(tbox(13.5, 0.18, 0.18, 1), x0 + 6.5, TY + y, z0 + 7.8); sc.put(tbox(14, 0.12, 8.4, 1), x0 + 6.5, TY + y + 0.2, z0 + 3.9); }
      sc.mesh(M.oak, g); }
    // hero girder for the close-up (front face of the near-right leg, first platform level)
    { const hg = new THREE.Group(); hg.position.set(16, TY + 52.5, TZ + 44); g.add(hg); A.girder = hg;
      add(tbox(9, 0.12, 0.7, 1.2), M.ironHero, 0, 0.6, 0, hg); add(tbox(9, 0.12, 0.7, 1.2), M.ironHero, 0, -0.6, 0, hg); add(tbox(9, 1.1, 0.1, 1.2), M.ironHero, 0, 0, 0, hg);
      add(tbox(0.12, 1.3, 0.7, 1.2), M.ironHero, -2.2, 0, 0, hg); add(tbox(0.12, 1.3, 0.7, 1.2), M.ironHero, 1.8, 0, 0, hg);
      const diag = add(tbox(6, 0.5, 0.4, 1.2), M.ironHero, -0.6, -2.4, 0.1, hg); diag.rotation.z = 0.6;
      const nest = add(new THREE.SphereGeometry(0.42, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon({ color: '#7a5a3a' }), 2.9, 0.66, 0.05, hg); nest.scale.set(1, 0.5, 0.9);
      for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(0.07, 8, 6), M.cream, 2.8 + i * 0.12, 0.82, 0.05, hg);
      const bolt = new THREE.Group(); bolt.position.set(0.6, -0.68, 0.38); bolt.scale.setScalar(0.55); hg.add(bolt); A.bolt = bolt; A.bolt0 = bolt.position.clone();
      add(cyl(0.07, 0.07, 0.34, 8), M.steel, 0, 0, 0, bolt); add(cyl(0.13, 0.13, 0.1, 6), M.rust2, 0, -0.14, 0, bolt);
      for (let i = -4; i <= 4; i++) for (const y of [0.6, -0.6]) add(new THREE.SphereGeometry(0.05, 6, 4), M.rust, i * 0.9, y, 0.37, hg, { cast: false }); }
    A.TOWER = [0, TY, TZ];
    // ---- escape attic room on the near roof row (night) ----
    { const R = new THREE.Group(); R.position.set(54, GR + 16.5, -8); g.add(R); A.attic = R;
      add(tbox(5, 0.2, 5, 2), M.planks, 0, 0, 0, R); add(tbox(5, 0.2, 5, 2), M.plasterNight, 0, 3.0, 0, R, { cast: false });
      const bw = batch(); wallWithWindow(bw, 5, 3, 0.25, -0.8, 0.8, 0.9, 2.5); bw.mesh(M.plasterNight, R).position.set(0, 0, -2.5);
      add(tbox(0.25, 3, 5, 2), M.plasterNight, -2.5, 1.5, 0, R, { cast: false }); add(tbox(0.25, 3, 5, 2), M.plasterNight, 2.5, 1.5, 0, R, { cast: false });
      const door = new THREE.Group(); door.position.set(2.38, 0, 0.6); R.add(door); add(tbox(0.08, 2.1, 1.0, 1), M.oak, 0, 1.05, -0.5, door); A.atticDoor = door;
      add(tbox(1.9, 0.5, 0.9, 1), M.cream, -1.2, 0.35, 1.2, R); add(tbox(1.9, 0.12, 0.9, 1), M.burg, -1.2, 0.66, 1.2, R);
      A.curtL = curtain(R, -0.45, 1.75, -2.25, 0.9, 1.7, new THREE.MeshToonMaterial({ gradientMap: grad, color: '#e9e4f2', transparent: true, opacity: 0.85 }));
      A.curtR = curtain(R, 0.45, 1.75, -2.25, 0.9, 1.7, new THREE.MeshToonMaterial({ gradientMap: grad, color: '#e9e4f2', transparent: true, opacity: 0.85 }));
      A.curtBase = [A.curtL.geometry.attributes.position.array.slice(), A.curtR.geometry.attributes.position.array.slice()];
      const sh = add(tbox(0.06, 1.6, 0.8, 1), M.walnut, -1.2, 1.7, -2.6, R); sh.rotation.y = 0.9; const sh2 = add(tbox(0.06, 1.6, 0.8, 1), M.walnut, 1.2, 1.7, -2.6, R); sh2.rotation.y = -0.9; }
    POINTS.paris = [];
  }
  return { G, A, POINTS, M, add, tbox, batch, cyl, curtain, chairLeather, table, tree, gasLamp, glassM, glowM, basic, wallWithWindow, rng, ndSkip };
}
