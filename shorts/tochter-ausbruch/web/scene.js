// scene.js: prison world for "Tochter-Ausbruch". Sets live far apart on x; only the active set is visible (W.set).
// All visible writing is German: Ausgang, Besuchszeit, Besuchszeit beendet, Plan, Eilmeldung.
let S = { sets: {}, tubes: [], keys: [], spin: [], shafts: [] };
export const OFF = { cor: 0, cell: 60, vis: 120, split: 180, viral: 240, sewer: 300, street: 360 };
const hsh = (n) => { const x = Math.sin(n * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
export const build = (ctx) => {
  const { THREE, T, P, world, add, tbox, toon, texM, canvasTex, waterMat } = ctx;
  const G = (name) => { const g = new THREE.Group(); g.position.x = OFF[name]; world.add(g); S.sets[name] = g; return g; };
  const R = P.rng(77);
  // ---------- shared textures / materials ----------
  const radial = canvasTex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const beam = canvasTex(256, 512, (c) => { const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 512);
    c.globalCompositeOperation = 'destination-in'; const h = c.createLinearGradient(0, 0, 256, 0); h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(0.3, 'rgba(0,0,0,1)'); h.addColorStop(0.7, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = h; c.fillRect(0, 0, 256, 512); });
  const aMat = (map, color = '#ffffff', op = 1) => new THREE.MeshBasicMaterial({ map, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const bMat = (o) => new THREE.MeshBasicMaterial(o);
  const fx = (geo, mat, x, y, z, parent, ry = 0, rx = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.userData.ndSkip = true; m.renderOrder = 3; parent.add(m); return m; };
  const plane = (w, h) => new THREE.PlaneGeometry(w, h);
  const cyl = (r, h, n = 10) => new THREE.CylinderGeometry(r, r, h, n);
  const col = (c, o = {}) => toon({ color: c, ...o });
  const flat = (w, d, mat, x, y, z, parent, cast = false) => { const m = add(plane(w, d), mat, x, y, z, parent, { cast }); m.rotation.x = -Math.PI / 2; return m; };
  const wallTex = (seed, top, band, peel = 26) => canvasTex(1024, 512, (c, w, h) => { const r = P.rng(seed); c.fillStyle = top; c.fillRect(0, 0, w, h); c.fillStyle = band; c.fillRect(0, h * 0.62, w, h * 0.38); c.fillStyle = 'rgba(20,40,30,.55)'; c.fillRect(0, h * 0.62 - 7, w, 9);
    for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(${r() > .5 ? '255,255,255' : '30,50,40'},${0.03 + r() * 0.05})`; c.beginPath(); c.ellipse(r() * w, r() * h, 20 + r() * 90, 10 + r() * 50, r() * 3, 0, 7); c.fill(); }
    for (let i = 0; i < peel; i++) { const x = r() * w, y = r() * h, n = 7 + (r() * 5 | 0), a = 14 + r() * 46; c.beginPath(); for (let k = 0; k < n; k++) { const an = k / n * 6.283, rr = a * (0.55 + r() * 0.6); c[k ? 'lineTo' : 'moveTo'](x + rr * Math.cos(an) * 1.5, y + rr * Math.sin(an)); } c.closePath(); c.fillStyle = r() > 0.4 ? '#d9d6c6' : '#a9a898'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(40,50,40,.55)'; c.stroke(); }
    for (let i = 0; i < 9; i++) { c.strokeStyle = 'rgba(30,40,34,.45)'; c.lineWidth = 2; c.beginPath(); let x = r() * w, y = r() * h * 0.5; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += r() * 30 - 15; y += 14 + r() * 26; c.lineTo(x, y); } c.stroke(); }
    for (let i = 0; i < 12; i++) { const x = r() * w; const g = c.createLinearGradient(0, h * 0.2, 0, h); g.addColorStop(0, 'rgba(60,70,40,0)'); g.addColorStop(1, 'rgba(60,70,40,.22)'); c.fillStyle = g; c.fillRect(x, h * 0.2, 8 + r() * 26, h); } });
  const rep = (t, a, b) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(a, b); return t; };
  const lino = (seed, base, seam) => canvasTex(512, 512, (c) => { const r = P.rng(seed); c.fillStyle = base; c.fillRect(0, 0, 512, 512); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${r() > .5 ? '255,255,255' : '20,40,30'},${0.04 + r() * 0.08})`; c.beginPath(); c.ellipse(r() * 512, r() * 512, 1 + r() * 5, 1 + r() * 3, r() * 3, 0, 7); c.fill(); }
    c.strokeStyle = seam; c.lineWidth = 5; c.strokeRect(0, 0, 512, 512); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; c.strokeRect(5, 5, 502, 502); for (let i = 0; i < 6; i++) { c.strokeStyle = 'rgba(30,30,30,.25)'; c.lineWidth = 1 + r() * 2; c.beginPath(); const x = r() * 512, y = r() * 512; c.moveTo(x, y); c.lineTo(x + r() * 120 - 60, y + r() * 30); c.stroke(); } });
  const MAT = {
    steel: col('#7f8e98'), steelD: col('#56626c'), dark: col('#23272c'), white: col('#e9ece6'), conc: col('#8f9a92'), concD: col('#6c7872'), pipe: col('#a9b4a6'), red: col('#c8342e'), yellow: col('#e2b838'),
    wood: col('#8a6a48'), green: col('#4f7d68'), black: col('#17181c'), gold: col('#e0b040'), rope: col('#b02a34'), plant: col('#3f8a4e'), pot: col('#a8623a'), blue: col('#3a5c96'),
    tubeOn: bMat({ color: '#f2fff0' }), warm: bMat({ color: '#ffe9b0' }), screen: bMat({ color: '#8fe0c8' }), glass: bMat({ color: '#bfe6ee', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }),
  };
  const tube = (x, y, z, parent, len = 1.5, along = 'z', bad = false) => { // fluorescent fixture + glow + floor pool
    const g = new THREE.Group(); g.position.set(x, y, z); if (along === 'x') g.rotation.y = Math.PI / 2; parent.add(g);
    add(tbox(0.32, 0.07, len + 0.2, 1), MAT.white, 0, 0, 0, g, { cast: false });
    const m = bMat({ color: '#f2fff0' }), t = add(tbox(0.09, 0.07, len, 1), m, 0, -0.06, 0, g, { cast: false }); t.userData.ndSkip = false;
    const gm = aMat(radial, '#c8ffd8', 0.55), gl = fx(plane(1.6, len + 1.6), gm, 0, -0.1, 0, g, 0, Math.PI / 2);
    const pm = aMat(radial, '#b8f0c8', 0.22), pool = fx(plane(3.2, len + 3), pm, 0, -y + 0.03, 0, g, 0, -Math.PI / 2);
    S.tubes.push({ m, gm, pm, i: S.tubes.length, bad }); return g; };
  const signTex = (txt, w, h, bg, fg, o = {}) => canvasTex(w, h, (c) => { c.fillStyle = o.frame || '#1c2420'; c.fillRect(0, 0, w, h); c.fillStyle = bg; c.beginPath(); c.roundRect(12, 12, w - 24, h - 24, 18); c.fill();
    if (o.stripe) { c.fillStyle = o.stripe; c.fillRect(12, h - 44, w - 24, 20); }
    c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; const lines = txt.split('\n'); let fs = o.fs || h * 0.5; c.font = `bold ${fs}px "DejaVu Sans", Arial, sans-serif`;
    lines.forEach((l, i) => { while (c.measureText(l).width > w - 70 && fs > 20) { fs -= 4; c.font = `bold ${fs}px "DejaVu Sans", Arial, sans-serif`; } });
    lines.forEach((l, i) => c.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * fs * 1.12 + (o.dy || 4))); });
  const sign = (txt, w, h, x, y, z, parent, ry, bg, fg, o = {}) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); add(tbox(w + 0.08, h + 0.08, 0.07, 1), MAT.dark, 0, 0, -0.04, g, { cast: false });
    const m = fx(plane(w, h), bMat({ map: signTex(txt, o.pw || 1024, Math.round((o.pw || 1024) * h / w), bg, fg, o), fog: false }), 0, 0, 0.005, g); m.renderOrder = 0; return g; };
  const clock = (x, y, z, parent, ry) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    const t = canvasTex(256, 256, (c) => { c.fillStyle = '#20242a'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.fillStyle = '#f4f2e8'; c.beginPath(); c.arc(128, 128, 108, 0, 7); c.fill(); c.fillStyle = '#20242a'; c.font = 'bold 30px "DejaVu Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let i = 1; i <= 12; i++) { const a = i / 12 * 6.283 - 1.5708; c.fillText(String(i), 128 + 84 * Math.cos(a), 130 + 84 * Math.sin(a)); } });
    add(new THREE.CircleGeometry(0.3, 28), bMat({ map: t, fog: false }), 0, 0, 0.01, g, { cast: false }).userData.ndSkip = true;
    const hh = add(tbox(0.03, 0.15, 0.01, 1), MAT.black, 0, 0.065, 0.02, g, { cast: false }), mh = add(tbox(0.02, 0.22, 0.01, 1), MAT.black, 0, 0.1, 0.025, g, { cast: false });
    const ph = new THREE.Group(), pm = new THREE.Group(); g.add(ph); g.add(pm); ph.add(hh); pm.add(mh); ph.rotation.z = -1.1; S.spin.push({ o: pm, k: -0.004, a0: 0.4 }); return g; };

  // =====================================================================================================
  // M1 + M4: corridor, lobby with guard booth, checkpoint, exit door (door at z = -12)
  // =====================================================================================================
  { const g = G('cor');
    const wt = wallTex(11, '#b7c8ba', '#5c8873'), wm = (rx_) => toon({ map: rep(wt, rx_, 1) });
    const fl = toon({ map: rep(lino(5, '#8ba392', 'rgba(40,60,50,.6)'), 16, 26) });
    flat(24, 40, fl, 2, 0, 2, g);
    flat(24, 40, col('#aebbb0'), 2, 3.3, 2, g).rotation.x = Math.PI / 2;
    const wall = (w, x, z, ry) => { const m = add(plane(w, 3.3), wm(w / 6.6), x, 1.65, z, g, { cast: false }); m.rotation.y = ry; return m; };
    wall(19, -2.4, 6.5, Math.PI / 2); wall(9, -2.4, -7.5, Math.PI / 2); wall(19, 2.4, 6.5, -Math.PI / 2); wall(3.6, 4.2, -3, Math.PI); wall(9, 6, -7.5, -Math.PI / 2);
    wall(5.1, 3.45, -12, 0); wall(1.6, -1.7, -12, 0); add(tbox(1.9, 0.8, 0.2, 2), MAT.concD, 0, 2.9, -12.05, g, { cast: false });
    // skirting + ceiling pipes + conduit
    for (const sx of [-2.36, 2.36]) add(tbox(0.06, 0.14, 19, 2), MAT.steelD, sx, 0.07, 6.5, g, { cast: false });
    for (const [sx, r_] of [[-2.1, 0.07], [-1.86, 0.045], [2.15, 0.06]]) { const p_ = add(cyl(r_, 28), MAT.pipe, sx, 3.12, 2, g, { cast: false }); p_.rotation.x = Math.PI / 2; for (let z = -10; z < 16; z += 3.1) add(tbox(r_ * 3, 0.2, 0.06, 1), MAT.steelD, sx, 3.2, z, g, { cast: false }); }
    // cell doors along the corridor
    const cdoor = (side, z, hue) => { const d = new THREE.Group(); d.position.set(side * 2.36, 0, z); d.rotation.y = -side * Math.PI / 2; g.add(d);
      add(tbox(1.25, 2.3, 0.1, 2), col(hue), 0, 1.15, 0, d, { cast: false }); add(tbox(1.05, 2.1, 0.06, 2), col('#7b8c96'), 0, 1.15, 0.04, d, { cast: false });
      add(tbox(0.36, 0.26, 0.04, 1), MAT.black, 0, 1.62, 0.08, d, { cast: false }); for (let k = -1; k <= 1; k++) add(tbox(0.025, 0.26, 0.05, 1), MAT.steelD, k * 0.09, 1.62, 0.1, d, { cast: false });
      add(tbox(0.5, 0.12, 0.05, 1), MAT.steelD, 0, 1.0, 0.08, d, { cast: false }); add(tbox(0.1, 0.2, 0.08, 1), MAT.dark, 0.42, 1.1, 0.1, d, { cast: false }); add(tbox(0.3, 0.16, 0.03, 1), MAT.white, 0, 1.95, 0.08, d, { cast: false });
      for (const [bx, by] of [[-0.45, 0.3], [0.45, 0.3], [-0.45, 2.0], [0.45, 2.0]]) add(new THREE.SphereGeometry(0.03, 6, 5), MAT.steelD, bx, by, 0.08, d, { cast: false }); };
    for (let i = 0; i < 6; i++) { cdoor(-1, -0.6 + i * 3.1, '#52626c'); cdoor(1, 0.9 + i * 3.1, '#52626c'); }
    // far end: barred gate
    add(tbox(4.8, 3.3, 0.1, 2), col('#39473f'), 0, 1.65, 16, g, { cast: false }); for (let k = -8; k <= 8; k++) add(cyl(0.03, 3.3, 6), MAT.steelD, k * 0.28, 1.65, 15.2, g, { cast: false }); add(tbox(4.8, 0.08, 0.08, 1), MAT.steelD, 0, 1.3, 15.2, g, { cast: false });
    // lamps
    for (let i = 0; i < 9; i++) tube(0, 3.22, -10.4 + i * 3.1, g, 1.5, 'z', i === 2 || i === 5); tube(4.2, 3.22, -5, g, 1.5, 'x'); tube(4.2, 3.22, -10.5, g, 1.5, 'x', true);
    // wall furniture: extinguisher, notice board, bench, plant, vending machine, clock
    add(cyl(0.09, 0.42, 10), MAT.red, -2.28, 1.15, 1.6, g); add(tbox(0.3, 0.5, 0.04, 1), MAT.white, -2.37, 1.2, 1.6, g, { cast: false });
    add(tbox(0.05, 0.9, 1.4, 1), MAT.wood, -2.36, 1.6, -5.2, g, { cast: false }); [['#e8e2c8', -0.4, 0.2], ['#c8dce8', 0.1, 0.15], ['#f0c8c8', 0.45, -0.1], ['#e8e2c8', -0.2, -0.22], ['#d0e8c8', 0.3, 0.3]].forEach(([c, dz, dy]) => add(tbox(0.02, 0.26, 0.2, 1), col(c), -2.32, 1.6 + dy, -5.2 + dz, g, { cast: false }));
    add(tbox(0.4, 0.06, 1.8, 1), MAT.wood, -2.1, 0.45, -8.4, g); for (const dz of [-0.8, 0.8]) add(tbox(0.36, 0.45, 0.06, 1), MAT.steelD, -2.1, 0.22, -8.4 + dz, g);
    add(cyl(0.2, 0.4, 10), MAT.pot, -2.0, 0.2, -10.9, g); for (let k = 0; k < 6; k++) { const l = add(new THREE.SphereGeometry(0.22, 8, 6), MAT.plant, -2.0 + Math.cos(k) * 0.16, 0.7 + (k % 3) * 0.22, -10.9 + Math.sin(k) * 0.16, g); l.scale.set(0.7, 1.3, 0.7); }
    add(tbox(0.8, 1.9, 0.7, 2), col('#3a4c8a'), 5.55, 0.95, -4.0, g); fx(plane(0.5, 1.1), bMat({ color: '#bfe8ff', fog: false }), 5.14, 1.15, -4.0, g, -Math.PI / 2); fx(plane(1.6, 2.2), aMat(radial, '#9fd0ff', 0.4), 5.1, 1.1, -4.0, g, -Math.PI / 2);
    clock(-2.38, 2.45, -9.6, g, Math.PI / 2);
    // exit door (hinged at x = -0.9) with rivets and a barred window, warm light leaking around it
    const dg_ = new THREE.Group(); dg_.position.set(-0.9, 0, -11.95); g.add(dg_); S.door = dg_;
    add(tbox(1.8, 2.5, 0.14, 2), col('#5e6e78'), 0.9, 1.25, 0, dg_); add(tbox(1.5, 0.9, 0.05, 1), col('#6f808a'), 0.9, 0.62, 0.08, dg_, { cast: false }); add(tbox(1.5, 0.9, 0.05, 1), col('#6f808a'), 0.9, 1.9, 0.08, dg_, { cast: false });
    add(tbox(0.5, 0.36, 0.04, 1), bMat({ color: '#fff0c0', fog: false }), 0.9, 1.92, 0.11, dg_, { cast: false }); for (let k = -2; k <= 2; k++) add(tbox(0.03, 0.36, 0.05, 1), MAT.steelD, 0.9 + k * 0.1, 1.92, 0.12, dg_, { cast: false });
    add(tbox(0.08, 0.34, 0.12, 1), MAT.dark, 1.62, 1.2, 0.12, dg_); for (let i = 0; i < 12; i++) add(new THREE.SphereGeometry(0.03, 6, 5), MAT.steelD, 0.14 + (i % 2) * 1.52, 0.2 + ((i / 2) | 0) * 0.42, 0.08, dg_, { cast: false });
    for (const [x, y, w, h] of [[-0.98, 1.25, 0.16, 2.66], [0.98, 1.25, 0.16, 2.66], [0, 2.58, 2.1, 0.16]]) add(tbox(w, h, 0.3, 1), MAT.steelD, x, y, -11.95, g, { cast: false });
    S.leak = []; for (const [x, y, w, h] of [[-0.9, 1.25, 0.5, 2.9], [0.9, 1.25, 0.5, 2.9], [0, 2.5, 2.6, 0.5], [0, 0.03, 2.6, 0.5]]) S.leak.push(fx(plane(w, h), aMat(radial, '#ffc860', 0.85), x, y, -11.8, g));
    S.leak.push(fx(plane(3.4, 6), aMat(radial, '#ffb850', 0.4), 0, 0.04, -10.2, g, 0, -Math.PI / 2));
    // sunlight through the opening door: floor pool + shafts
    S.sun = []; S.sun.push(fx(plane(2.6, 9), aMat(beam, '#ffd070', 0.9), 0.2, 0.05, -7.6, g, 0, -Math.PI / 2, 0)); for (let k = 0; k < 4; k++) S.sun.push(fx(plane(1.7 - k * 0.2, 7.5), aMat(beam, '#ffdc90', 0.5), 0.1 + k * 0.22, 1.25 + k * 0.1, -8.4, g, Math.PI / 2 + 0.05 * k, 0, -Math.PI / 2 + 0.16 + 0.05 * k));
    S.sun.push(fx(plane(7, 7), aMat(radial, '#ffc060', 0.7), 0.3, 1.4, -11.7, g));
    sign('Ausgang', 0.62, 0.23, -1.28, 1.74, -11.93, g, 0, '#1f8a4c', '#ffffff', { fs: 200, pw: 1024 }); fx(plane(2.0, 1.0), aMat(radial, '#60ffa0', 0.3), -1.36, 1.74, -11.85, g);
    // outside: bright parking lot
    fx(plane(60, 30), bMat({ color: '#ffe9b8', fog: false }), 0, 10, -40, g); const og = flat(40, 26, bMat({ color: '#f1d79a', fog: false }), 0, 0.0, -25.2, g); og.userData.ndSkip = true;
    [['#d8483a', -3.5, -19], ['#3f8fd0', 0.5, -21], ['#f0f0e8', 4.2, -18.5]].forEach(([c, x, z]) => { add(tbox(1.8, 0.7, 3.8, 2), bMat({ color: c, fog: false }), x, 0.65, z, g); add(tbox(1.6, 0.6, 2, 2), bMat({ color: '#bfe6ee', fog: false }), x, 1.3, z - 0.2, g); for (const [dx, dz] of [[-0.9, 1.2], [0.9, 1.2], [-0.9, -1.2], [0.9, -1.2]]) { const w = add(cyl(0.34, 0.2, 12), MAT.black, x + dx, 0.34, z + dz, g); w.rotation.z = Math.PI / 2; } });
    for (let k = 0; k < 7; k++) { add(cyl(0.2, 3, 7), bMat({ color: '#8a6a40', fog: false }), -12 + k * 4, 1.5, -30, g); add(new THREE.SphereGeometry(1.8, 10, 8), bMat({ color: k % 2 ? '#8fc860' : '#a6d870', fog: false }), -12 + k * 4, 4, -30, g); }
    // guard booth (x 3.1..6, z -10.4..-6.2), open counter towards -x
    const b = new THREE.Group(); b.position.set(3.1, 0, -8.3); g.add(b); S.booth = b;
    add(tbox(0.14, 1.05, 4.2, 2), col('#6c8a7c'), 0, 0.525, 0, b); add(tbox(0.5, 0.06, 4.3, 1), MAT.steel, 0, 1.08, 0, b);
    for (const dz of [-2.1, 0, 2.1]) add(tbox(0.12, 2.25, 0.12, 1), MAT.steelD, 0, 2.2, dz, b); add(tbox(0.2, 0.16, 4.3, 1), MAT.steelD, 0, 3.22, 0, b);
    for (const dz of [-1.05, 1.05]) { fx(plane(2.0, 1.2), MAT.glass, 0, 1.72, dz, b, Math.PI / 2); fx(plane(0.25, 1.2), bMat({ color: '#ffffff', transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }), 0.01, 1.72, dz - 0.3, b, Math.PI / 2, 0, 0.3); }
    add(tbox(0.12, 3.3, 0.12, 1), MAT.steelD, 0, 1.65, -2.1, b); add(tbox(2.9, 3.3, 0.12, 2), wm(0.5), 1.45, 1.65, 2.14, b, { cast: false }); 
    add(tbox(0.9, 0.06, 3.4, 1), MAT.wood, 0.75, 0.8, 0, b); add(tbox(0.06, 0.8, 3.4, 1), MAT.steelD, 1.15, 0.4, 0, b);
    for (const [dz, c] of [[-1.0, '#8fe0c8'], [-0.35, '#9fc8ff'], [1.1, '#8fe0c8']]) { add(tbox(0.06, 0.4, 0.55, 1), MAT.dark, 1.0, 1.14, dz, b); fx(plane(0.5, 0.34), bMat({ color: c, fog: false }), 0.96, 1.14, dz, b, -Math.PI / 2); fx(plane(1.1, 0.9), aMat(radial, c, 0.3), 0.9, 1.14, dz, b, -Math.PI / 2); add(tbox(0.2, 0.1, 0.2, 1), MAT.dark, 1.0, 0.88, dz, b); }
    add(tbox(0.05, 0.9, 1.2, 1), MAT.wood, 2.84, 1.9, 0.4, b, { cast: false }); for (let i = 0; i < 10; i++) { const k = new THREE.Group(); k.position.set(2.8, 2.2 - ((i / 5) | 0) * 0.4, -0.05 + (i % 5) * 0.22); b.add(k); add(tbox(0.02, 0.2, 0.05, 1), MAT.gold, 0, -0.1, 0, k, { cast: false }); add(new THREE.TorusGeometry(0.035, 0.012, 5, 10), MAT.steelD, 0, 0, 0, k, { cast: false }).rotation.y = Math.PI / 2; S.keys.push({ o: k, i }); }
    clock(2.85, 2.6, -1.2, b, -Math.PI / 2); add(tbox(0.4, 0.5, 0.35, 1), MAT.dark, 2.5, 1.2, -1.75, b); add(tbox(0.9, 0.9, 0.5, 1), MAT.steel, 2.5, 0.45, -1.75, b); add(cyl(0.06, 0.12, 8), MAT.white, 2.42, 1.0, -1.6, b);
    for (const dz of [-0.9, 0.9]) { add(cyl(0.24, 0.07, 12), MAT.blue, 1.8, 0.5, dz, b); add(cyl(0.04, 0.5, 6), MAT.dark, 1.8, 0.25, dz, b); add(tbox(0.06, 0.5, 0.44, 1), MAT.blue, 2.05, 0.8, dz, b); }
    // checkpoint: metal detector frame, stanchions with rope, sign stand
    for (const sx of [-0.76, 0.76]) add(tbox(0.16, 2.2, 0.5, 2), col('#c9cfc6'), sx, 1.1, -6.3, g); add(tbox(1.68, 0.18, 0.5, 1), col('#c9cfc6'), 0, 2.28, -6.3, g); S.lamp = add(tbox(0.16, 0.08, 0.02, 1), bMat({ color: '#50e070', fog: false }), 0, 2.28, -6.56, g, { cast: false }); S.lampG = fx(plane(0.9, 0.6), aMat(radial, '#50ff80', 0.6), 0, 2.28, -6.6, g);
    for (const sx of [-1.15, 1.15]) for (let k = 0; k < 4; k++) { const z = -8.6 + k * 2.1; add(cyl(0.035, 0.95, 8), MAT.steel, sx, 0.475, z, g); add(cyl(0.16, 0.04, 12), MAT.steelD, sx, 0.02, z, g); add(new THREE.SphereGeometry(0.06, 8, 6), MAT.gold, sx, 0.97, z, g);
      if (k < 3) for (let j = 0; j < 6; j++) { const t0 = j / 6, t1 = (j + 1) / 6, y0 = 0.9 - Math.sin(t0 * Math.PI) * 0.16, y1 = 0.9 - Math.sin(t1 * Math.PI) * 0.16, m = add(cyl(0.022, Math.hypot(0.35, y1 - y0), 5), MAT.rope, sx, (y0 + y1) / 2, z + (t0 + t1) / 2 * 2.1, g, { cast: false }); m.rotation.x = Math.PI / 2 - Math.atan2(y1 - y0, 0.35); } }
    const st = new THREE.Group(); st.position.set(-0.74, 0, -5.5); st.rotation.y = Math.PI; g.add(st); S.stand = st; add(cyl(0.03, 1.4, 8), MAT.steel, 0, 0.7, 0, st); add(cyl(0.2, 0.04, 12), MAT.steelD, 0, 0.02, 0, st);
    sign('Besuchszeit\nbeendet', 0.8, 0.5, 0, 1.6, 0.02, st, 0, '#f4f0e2', '#b0222a', { fs: 130, pw: 1024, stripe: '#b0222a', dy: -12 });
    add(tbox(1.1, 0.5, 0.6, 1), col('#7c8a84'), 1.9, 0.25, -11.3, g); add(tbox(0.4, 0.3, 0.4, 1), col('#a8b0aa'), 1.7, 0.65, -11.3, g);
  }
  // =====================================================================================================
  // M2: cell (bars at z = +2.4, camera looks in from the corridor)
  // =====================================================================================================
  { const g = G('cell');
    const tally = (seed, w, h) => canvasTex(w, h, (c) => { const r = P.rng(seed); const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6d7b74'); gr.addColorStop(1, '#55625c'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(${r() > .5 ? '255,255,255' : '10,20,16'},${0.03 + r() * 0.05})`; c.beginPath(); c.ellipse(r() * w, r() * h, 20 + r() * 120, 10 + r() * 60, r() * 3, 0, 7); c.fill(); }
      c.lineCap = 'round'; const sx = 52, sy = 62; c.scale(1, 1); for (let y = 16; y < h - 20; y += sy) for (let x = 12 + r() * 10; x < w - 24; x += sx) { if (r() < 0.04) continue; const a = 0.55 + r() * 0.4; c.strokeStyle = `rgba(240,240,225,${a})`; c.lineWidth = 4 + r(); const jx = r() * 4 - 2, jy = r() * 6 - 3;
        for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + jx + k * 9 + r() * 2, y + jy); c.lineTo(x + jx + k * 9 + r() * 3 - 1.5, y + jy + 40 + r() * 5); c.stroke(); } c.beginPath(); c.moveTo(x + jx - 6, y + jy + 32 + r() * 6); c.lineTo(x + jx + 35, y + jy + 6 + r() * 6); c.stroke(); } });
    const tm = toon({ map: tally(3, 2048, 1536) }), tm2 = toon({ map: tally(8, 2048, 1280) });
    flat(3.4, 9, toon({ map: rep(lino(9, '#7d8a84', 'rgba(30,40,36,.7)'), 3, 8) }), 0, 0, 2, g); flat(3.6, 9, col('#7c8a82'), 0, 3.0, 2, g).rotation.x = Math.PI / 2;
    add(plane(3.4, 3), tm, 0, 1.5, -2.4, g, { cast: false }); add(plane(4.8, 3), tm2, -1.7, 1.5, 0, g, { cast: false }).rotation.y = Math.PI / 2; add(plane(4.8, 3), tm2, 1.7, 1.5, 0, g, { cast: false }).rotation.y = -Math.PI / 2;
    // window (high, back wall) + bars + shafts
    add(tbox(1.1, 0.85, 0.1, 1), MAT.concD, -0.35, 2.3, -2.38, g, { cast: false }); fx(plane(0.92, 0.68), bMat({ color: '#e6f6ff', fog: false }), -0.35, 2.3, -2.32, g).renderOrder = 0; for (let k = -2; k <= 2; k++) add(cyl(0.022, 0.72, 6), MAT.black, -0.35 + k * 0.17, 2.3, -2.3, g, { cast: false });
    fx(plane(2.6, 1.9), aMat(radial, '#cfe8ff', 0.6), -0.35, 2.3, -2.28, g);
    for (let k = 0; k < 5; k++) S.shafts.push(fx(plane(0.13, 4.4), aMat(beam, '#d8ecff', 0.34), -0.35 + (k - 2) * 0.17 + 0.25, 1.28, -0.75, g, 0.12, -0.92, 0));
    const barsT = canvasTex(256, 256, (c) => { c.fillStyle = '#000'; c.fillRect(0, 0, 256, 256); const gr = c.createRadialGradient(128, 128, 20, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; for (let k = 0; k < 5; k++) c.fillRect(22 + k * 46, 10, 30, 236); });
    fx(plane(1.5, 1.9), aMat(barsT, '#cfe4ff', 0.5), 0.05, 0.03, 0.75, g, 0, -Math.PI / 2);
    // bunk bed (right wall)
    const bk = new THREE.Group(); bk.position.set(1.16, 0, -1.25); g.add(bk);
    for (const [dx, dz] of [[-0.5, -1.05], [0.5, -1.05], [-0.5, 1.05], [0.5, 1.05]]) add(tbox(0.07, 1.95, 0.07, 1), MAT.steelD, dx, 0.975, dz, bk);
    for (const y of [0.45, 1.45]) { add(tbox(1.0, 0.06, 2.1, 1), MAT.steelD, 0, y, 0, bk); add(tbox(0.94, 0.16, 2.02, 1), col('#c9d2d8'), 0, y + 0.11, 0, bk); for (let k = 0; k < 7; k++) add(tbox(0.95, 0.165, 0.05, 1), col('#7f93b0'), 0, y + 0.11, -0.9 + k * 0.3, bk, { cast: false }); add(tbox(0.7, 0.12, 0.42, 1), MAT.white, 0, y + 0.25, -0.76, bk); add(tbox(0.96, 0.08, 0.9, 1), col('#6f8a5a'), 0, y + 0.22, 0.5, bk); }
    for (let k = 0; k < 4; k++) add(tbox(0.05, 0.04, 0.4, 1), MAT.steelD, -0.52, 0.6 + k * 0.28, 0.85, bk); 
    const planT = canvasTex(360, 480, (c) => { c.scale(0.6, 0.6); c.translate(0, -150); T.propPlan(new T.Pen(c)); });
    S.planPaper = fx(plane(0.36, 0.48), new THREE.MeshBasicMaterial({ map: planT, transparent: true, fog: false }), 0.78, 0.69, -0.9, g, 0.3, -Math.PI / 2 + 0.25); S.planPaper.renderOrder = 0;
    // sink + mirror + shelf + stool
    add(tbox(0.5, 0.16, 0.4, 1), MAT.white, -1.42, 0.86, -1.7, g); add(cyl(0.05, 0.84, 8), MAT.steel, -1.5, 0.42, -1.7, g); add(tbox(0.04, 0.16, 0.04, 1), MAT.steel, -1.6, 1.02, -1.7, g); add(tbox(0.14, 0.04, 0.04, 1), MAT.steel, -1.54, 1.1, -1.7, g);
    add(tbox(0.04, 0.5, 0.4, 1), col('#b8d8e0'), -1.67, 1.55, -1.7, g, { cast: false }); add(tbox(0.2, 0.03, 0.6, 1), MAT.wood, -1.58, 1.95, -0.9, g); add(cyl(0.045, 0.12, 8), col('#e04848'), -1.58, 2.03, -1.05, g); add(tbox(0.06, 0.16, 0.12, 1), col('#3a5c96'), -1.6, 2.05, -0.8, g);
    add(cyl(0.19, 0.05, 12), MAT.wood, -1.15, 0.45, -0.4, g); add(cyl(0.03, 0.45, 6), MAT.steelD, -1.15, 0.22, -0.4, g);
    tube(0, 2.94, -0.3, g, 0.9, 'x', true);
    // bars (foreground)
    S.bars = new THREE.Group(); g.add(S.bars); for (let k = -8; k <= 7; k++) add(cyl(0.013, 3, 8), col('#3a4248'), k * 0.22 + 0.11, 1.5, 2.4, S.bars, { cast: false }); for (const y of [0.2, 2.75]) add(tbox(3.5, 0.06, 0.06, 1), col('#3a4248'), 0, y, 2.4, S.bars, { cast: false });
    add(plane(8, 3), toon({ map: rep(wallTex(31, '#a9b9ac', '#557c69', 8), 1, 1) }), 0, 1.5, 6.5, g, { cast: false }).rotation.y = Math.PI;
    // blanket on a line (shot 9)
    const bl = new THREE.Group(); bl.position.set(-0.55, 0, -0.9); g.add(bl); S.blanket = bl; const blT = canvasTex(512, 512, (c) => { c.fillStyle = '#6f8a5a'; c.fillRect(0, 0, 512, 512); for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(40,60,40,.35)'; c.fillRect(i * 64 + 20, 0, 18, 512); c.fillRect(0, i * 64 + 20, 512, 18); } c.fillStyle = 'rgba(255,255,255,.14)'; for (let i = 0; i < 8; i++) c.fillRect(i * 64 + 46, 0, 5, 512); });
    S.blanketM = add(new THREE.PlaneGeometry(2.25, 1.3, 12, 1), new THREE.MeshToonMaterial({ gradientMap: ctx.grad, map: blT, side: THREE.DoubleSide }), 0, 0.95, 0, bl); const rp = add(cyl(0.012, 2.35, 5), MAT.black, 0, 1.6, 0, bl, { cast: false }); rp.rotation.z = Math.PI / 2;
    for (const dx of [-0.95, -0.3, 0.35, 1.0]) add(tbox(0.04, 0.12, 0.03, 1), MAT.wood, dx, 1.58, 0.02, bl, { cast: false });
  }
  // =====================================================================================================
  // M3: visiting hall
  // =====================================================================================================
  { const g = G('vis');
    flat(16, 14, toon({ map: rep(lino(14, '#9aa693', 'rgba(50,60,50,.6)'), 11, 10) }), 0, 0, 0, g); flat(16, 14, col('#b4c0b4'), 0, 3.7, 0, g).rotation.x = Math.PI / 2;
    const wt = wallTex(21, '#c3cdb8', '#6b8f7a', 12), wm = (r_) => toon({ map: rep(wt.clone(), r_, 1) }); wt.needsUpdate = true;
    const W_ = (w, x, z, ry) => { const m_ = wm(w / 7.4); m_.map.needsUpdate = true; const m = add(plane(w, 3.7), m_, x, 1.85, z, g, { cast: false }); m.rotation.y = ry; };
    W_(16, 0, -6, 0); W_(14, -7.5, 0, Math.PI / 2); W_(14, 7.5, 0, -Math.PI / 2); W_(16, 0, 7, Math.PI);
    for (const zz of [-3.4, 0, 3.4]) { flat(15, 0.08, col('#e2c040'), 0, 0.012, zz + 1.75, g); }
    S.visSign = sign('Besuchszeit', 2.0, 0.44, -0.2, 2.9, -1.0, g, 0, '#234a7a', '#ffffff', { fs: 150 }); for (const dx of [-0.8, 0.8]) add(cyl(0.012, 0.8, 5), MAT.dark, dx, 0.6, 0, S.visSign, { cast: false }); clock(2.6, 2.95, -5.96, g, 0);
    // barred windows on the left wall with light shafts
    for (let i = 0; i < 3; i++) { const z = -3.6 + i * 3.4; add(tbox(0.1, 1.3, 1.5, 1), MAT.concD, -7.46, 2.45, z, g, { cast: false }); fx(plane(1.3, 1.1), bMat({ color: '#eaf8ff', fog: false }), -7.39, 2.45, z, g, Math.PI / 2).renderOrder = 0; for (let k = -3; k <= 3; k++) add(cyl(0.022, 1.14, 6), MAT.black, -7.36, 2.45, z + k * 0.19, g, { cast: false });
      fx(plane(3, 2.6), aMat(radial, '#d8f0ff', 0.5), -7.3, 2.45, z, g, Math.PI / 2);
      for (let k = 0; k < 3; k++) S.shafts.push(fx(plane(0.34, 6.2), aMat(beam, '#e2f2ff', 0.2), -5.3, 1.28, z + (k - 1) * 0.42, g, Math.PI / 2, 0, 1.0));
      fx(plane(2.6, 2.0), aMat(radial, '#d8ecff', 0.3), -3.5, 0.03, z, g, 0, -Math.PI / 2); }
    // tables with bolted stools
    const table = (x, z, hero) => { const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t); add(tbox(1.5, 0.05, 0.8, 1), col('#a9b6bc'), 0, 0.76, 0, t); add(tbox(1.4, 0.03, 0.7, 1), col('#c4d0d4'), 0, 0.79, 0, t, { cast: false });
      for (const [dx, dz] of [[-0.66, -0.32], [0.66, -0.32], [-0.66, 0.32], [0.66, 0.32]]) add(cyl(0.03, 0.75, 8), MAT.steelD, dx, 0.375, dz, t); add(tbox(1.32, 0.04, 0.04, 1), MAT.steelD, 0, 0.2, -0.32, t); add(tbox(1.32, 0.04, 0.04, 1), MAT.steelD, 0, 0.2, 0.32, t);
      for (const sx of [-1.08, 1.08]) { add(cyl(0.2, 0.06, 14), col('#56789a'), sx, 0.47, 0, t); add(cyl(0.045, 0.45, 8), MAT.steelD, sx, 0.225, 0, t); add(cyl(0.14, 0.03, 10), MAT.steelD, sx, 0.015, 0, t); } return t; };
    S.tables = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) S.tables.push(table(-4.4 + c * 4.4, -3.4 + r * 3.4, r === 1 && c === 1));
    for (let i = 0; i < 6; i++) tube(-5 + (i % 3) * 5, 3.62, -2.6 + ((i / 3) | 0) * 4.6, g, 1.6, 'x', i === 4);
    // back wall dressing: vending machine, water cooler, guard desk, door, camera, notice boards
    add(tbox(0.9, 2.0, 0.7, 2), col('#b03a3a'), 5.4, 1.0, -5.55, g); fx(plane(0.6, 1.1), bMat({ color: '#ffe8c0', fog: false }), 5.3, 1.25, -5.19, g); fx(plane(1.8, 2.2), aMat(radial, '#ffd090', 0.35), 5.3, 1.2, -5.15, g);
    add(cyl(0.2, 1.0, 12), MAT.white, 6.6, 0.5, -5.5, g); add(cyl(0.17, 0.4, 12), bMat({ color: '#9fd8f0', transparent: true, opacity: 0.7 }), 6.6, 1.2, -5.5, g);
    add(tbox(1.3, 2.3, 0.1, 2), col('#56666e'), -5.6, 1.15, -5.94, g, { cast: false }); add(tbox(0.4, 0.3, 0.05, 1), MAT.black, -5.6, 1.7, -5.88, g, { cast: false });
    add(tbox(1.4, 0.95, 0.06, 1), MAT.wood, 0.9, 1.75, -5.95, g, { cast: false }); [['#e8e2c8', -0.4, 0.2], ['#c8dce8', 0, 0.1], ['#f0c8c8', 0.42, 0.18], ['#d0e8c8', -0.3, -0.22], ['#e8e2c8', 0.25, -0.2]].forEach(([c, dx, dy]) => add(tbox(0.3, 0.36, 0.02, 1), col(c), 0.9 + dx, 1.75 + dy, -5.91, g, { cast: false }));
    add(tbox(0.2, 0.14, 0.3, 1), MAT.dark, 7.2, 3.4, -5.6, g); S.camLed = fx(plane(0.3, 0.3), aMat(radial, '#ff3030', 1), 7.1, 3.36, -5.4, g);
    add(tbox(1.6, 1.0, 0.7, 2), col('#6c8a7c'), 3.6, 0.5, -5.4, g); add(tbox(0.4, 0.3, 0.05, 1), MAT.dark, 3.4, 1.18, -5.4, g); fx(plane(0.36, 0.26), MAT.screen, 3.4, 1.18, -5.37, g);
    for (const x of [-7.2, 7.2]) for (let k = 0; k < 3; k++) { add(tbox(0.4, 0.06, 1.6, 1), MAT.wood, x * 0.97, 0.45, -4 + k * 3.6, g); }
  }
  // =====================================================================================================
  // split-screen studio
  // =====================================================================================================
  { const g = G('split');
    const bd = (left) => canvasTex(512, 1024, (c) => { const gr = c.createRadialGradient(256, 420, 40, 256, 500, 620); if (left) { gr.addColorStop(0, '#dff5ef'); gr.addColorStop(1, '#58b9ac'); } else { gr.addColorStop(0, '#e9efcf'); gr.addColorStop(1, '#7d9a70'); } c.fillStyle = gr; c.fillRect(0, 0, 512, 1024);
      c.globalAlpha = 0.13; c.fillStyle = left ? '#0a5a54' : '#2a4a20'; if (left) { for (let k = 0; k < 9; k++) c.fillRect(30 + k * 54, 0, 16, 1024); } else { c.beginPath(); for (let k = 0; k < 8; k++) { c.moveTo(256, 520); c.lineTo(-200 + k * 130, 1024); c.lineTo(-150 + k * 130, 1024); } c.fill(); for (let k = 0; k < 5; k++) c.fillRect(196 - k * 30, 80 + k * 70, 120 + k * 60, 14); } c.globalAlpha = 1; });
    fx(plane(6, 12), bMat({ map: bd(true), fog: false }), -3, 3, -3.2, g).renderOrder = 0; fx(plane(6, 12), bMat({ map: bd(false), fog: false }), 3, 3, -3.2, g).renderOrder = 0;
    flat(6, 10, col('#4fa79b'), -3, 0, 0, g); flat(6, 10, col('#73906a'), 3, 0, 0, g);
    S.divider = add(tbox(0.09, 7, 0.05, 1), bMat({ color: '#17131c', fog: false }), 0, 2.4, 0.9, g, { cast: false }); add(tbox(0.035, 7, 0.06, 1), bMat({ color: '#ffffff', fog: false }), 0, 2.4, 0.9, g, { cast: false });
    const dn = canvasTex(128, 128, (c) => { c.scale(1, 1); T.K2.donut(c, 64, 64, 52, '#ffffff', '#ff4f9a'); });
    S.donuts = []; for (let i = 0; i < 26; i++) { const m = fx(plane(0.34, 0.34), new THREE.MeshBasicMaterial({ map: dn, transparent: true, opacity: 0.55, fog: false, depthWrite: false }), 0, 0, 0, g); S.donuts.push({ m, x: (hsh(i) - 0.5) * 6.4, y: hsh(i + 9) * 4.2, z: -2.6 + hsh(i + 20) * 1.4, sp: 0.2 + hsh(i + 5) * 0.4, s: 0.6 + hsh(i + 3) * 1.2 }); }
    fx(plane(5, 7), aMat(radial, '#ffffff', 0.35), -1.25, 1.6, -3.0, g); fx(plane(5, 7), aMat(radial, '#ffffe0', 0.3), 1.25, 1.6, -3.0, g);
  }
  // =====================================================================================================
  // M5: viral — globe, screens, stars
  // =====================================================================================================
  { const g = G('viral');
    const gt = canvasTex(1024, 512, (c) => { const r = P.rng(5); c.fillStyle = '#2a6ad0'; c.fillRect(0, 0, 1024, 512); for (let i = 0; i < 12; i++) { c.fillStyle = 'rgba(120,190,255,.25)'; c.fillRect(0, i * 44, 1024, 3); c.fillRect(i * 88, 0, 3, 512); }
      const blob = (x, y, a, b, n = 11) => { c.beginPath(); for (let k = 0; k < n; k++) { const an = k / n * 6.283, rr = 0.7 + r() * 0.5; c[k ? 'lineTo' : 'moveTo'](x + a * rr * Math.cos(an), y + b * rr * Math.sin(an)); } c.closePath(); c.fillStyle = '#58c070'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#1a3a2a'; c.stroke(); };
      for (const [x, y, a, b] of [[160, 170, 90, 70], [230, 340, 50, 90], [520, 150, 70, 60], [540, 300, 60, 90], [720, 180, 130, 80], [860, 380, 60, 40], [380, 80, 40, 22], [940, 120, 40, 40], [60, 400, 40, 30]]) { blob(x, y, a, b); blob(x - 1024, y, a, b); blob(x + 1024, y, a, b); }
      c.fillStyle = '#f2f8ff'; c.fillRect(0, 0, 1024, 26); c.fillRect(0, 486, 1024, 26); });
    S.globe = add(new THREE.SphereGeometry(2.3, 40, 28), toon({ map: gt }), 0, 3.2, 0, g); S.globe.rotation.z = 0.3;
    fx(plane(9, 9), aMat(radial, '#4a90ff', 0.55), 0, 3.2, -1.2, g);
    for (let k = 0; k < 3; k++) { const t = fx(new THREE.TorusGeometry(2.9 + k * 0.45, 0.02, 5, 60), aMat(null, ['#ff5fa2', '#7fe0ff', '#ffe060'][k], 0.8), 0, 3.2, 0, g, 0, 1.2 + k * 0.5, k * 0.7); S.spin.push({ o: t, k: 0.02 + k * 0.012, a0: k, ax: 'z' }); }
    const sT = [canvasTex(360, 600, (c) => { c.scale(0.6, 0.6); T.propScreen(new T.Pen(c), {}); }), canvasTex(360, 600, (c) => { c.scale(0.6, 0.6); T.propScreen(new T.Pen(c), { tv: 1 }); })];
    S.screens = []; for (let i = 0; i < 14; i++) { const tv = i % 3 === 1, m = fx(plane(1.0, 1.667), new THREE.MeshBasicMaterial({ map: sT[tv ? 1 : 0], transparent: true, fog: false, side: THREE.DoubleSide, alphaTest: 0.3 }), 0, 0, 0, g); m.renderOrder = 2; S.screens.push({ m, i, tv }); }
    const stG = new THREE.InstancedMesh(plane(0.12, 0.12), aMat(radial, '#ffffff', 0.9), 260); stG.userData.ndSkip = true; const d = new THREE.Object3D(); for (let i = 0; i < 260; i++) { d.position.set((hsh(i) - 0.5) * 60, hsh(i + 400) * 34 - 6, -14 - hsh(i + 800) * 20); d.scale.setScalar(0.6 + hsh(i + 77) * 2.4); d.updateMatrix(); stG.setMatrixAt(i, d.matrix); } g.add(stG);
    flat(60, 60, col('#141a3a'), 0, -3.5, 0, g);
  }
  // =====================================================================================================
  // M6a: sewer tunnel (along z)
  // =====================================================================================================
  { const g = G('sewer');
    const bt = P.tex(P.stone(41, 70, 22, 34, 128, 64), 14, 12); const arch = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 40, 32, 1, true), new THREE.MeshToonMaterial({ gradientMap: ctx.grad, map: bt, side: THREE.BackSide }));
    arch.rotation.x = Math.PI / 2; arch.position.set(0, 0.6, -6); arch.receiveShadow = true; g.add(arch);
    const lm = toon({ map: P.tex(P.stone(43, 60, 16, 30, 128, 64), 1, 14) });
    for (const sx of [-1, 1]) { add(tbox(1.4, 0.9, 40, 2), lm, sx * 2.35, 0.2, -6, g, { cast: false }); add(tbox(0.12, 0.1, 40, 2), col('#3c4634'), sx * 1.66, 0.68, -6, g, { cast: false }); }
    const w = add(plane(3.4, 40), waterMat, 0, 0.36, -6, g, { cast: false }); w.rotation.x = -Math.PI / 2; w.userData.nd = ctx.waterNd;
    add(plane(8, 8), col('#0c120c'), 0, 2, -25.9, g, { cast: false });
    for (const [sx, y, r_] of [[-2.55, 2.2, 0.12], [2.7, 1.75, 0.09], [2.5, 2.35, 0.06]]) { const p_ = add(cyl(r_, 40), col(sx < 0 ? '#7a6a4a' : '#5c6a5a'), sx, y, -6, g, { cast: false }); p_.rotation.x = Math.PI / 2; for (let z = -24; z < 12; z += 3.4) add(new THREE.TorusGeometry(r_ + 0.03, 0.03, 5, 10), MAT.steelD, sx, y, z, g, { cast: false }); }
    S.sewerLamps = []; for (let i = 0; i < 6; i++) { const z = 6 - i * 5.2, sx = i % 2 ? -1 : 1; add(tbox(0.2, 0.26, 0.2, 1), MAT.dark, sx * 2.72, 2.55, z, g, { cast: false }); add(tbox(0.13, 0.18, 0.13, 1), MAT.warm, sx * 2.62, 2.5, z, g, { cast: false }); S.sewerLamps.push(fx(plane(4.6, 4.6), aMat(radial, '#ffc878', 0.6), sx * 2.3, 2.3, z, g, -sx * Math.PI / 2)); fx(plane(3, 3), aMat(radial, '#ffb860', 0.3), sx * 2.2, 0.68, z, g, 0, -Math.PI / 2); }
    // side inlets, grates, ladder with moonlight shaft from a manhole above
    for (let i = 0; i < 4; i++) { const z = 3 - i * 6.5, sx = i % 2 ? 1 : -1; const c = add(new THREE.CircleGeometry(0.55, 18), MAT.black, sx * 2.86, 1.5, z, g, { cast: false }); c.rotation.y = -sx * Math.PI / 2; const t = add(new THREE.TorusGeometry(0.56, 0.07, 6, 18), lm, sx * 2.84, 1.5, z, g, { cast: false }); t.rotation.y = Math.PI / 2;
      S.shafts.push(fx(plane(0.3, 1.2), aMat(beam, '#9fd8b0', 0.5), sx * 2.6, 0.95, z, g, -sx * Math.PI / 2)); }
    for (let k = 0; k < 9; k++) add(tbox(0.5, 0.04, 0.04, 1), MAT.steelD, -2.2, 0.9 + k * 0.3, -3.0, g, { cast: false }); for (const dx of [-0.25, 0.25]) add(tbox(0.04, 2.8, 0.04, 1), MAT.steelD, -2.2 + dx, 2.2, -3.0, g, { cast: false });
    for (let k = 0; k < 3; k++) S.shafts.push(fx(plane(1.3 - k * 0.3, 4.2), aMat(beam, '#bfd8ff', 0.3), -2.0 + k * 0.1, 1.9, -3.0 + k * 0.05, g, k * 1.0, 0, 0.12));
    fx(plane(2.2, 2.2), aMat(radial, '#bfd8ff', 0.4), -1.9, 0.68, -3.0, g, 0, -Math.PI / 2);
    for (let i = 0; i < 16; i++) { const m = add(new THREE.SphereGeometry(0.1 + hsh(i) * 0.14, 7, 5), col(i % 2 ? '#4c5a3a' : '#5a4a30'), (hsh(i + 3) > 0.5 ? 1 : -1) * (1.75 + hsh(i + 7) * 0.9), 0.68, 8 - i * 1.9, g); m.scale.y = 0.5; }
  }
  // =====================================================================================================
  // M6b: night street with the manhole
  // =====================================================================================================
  { const g = G('street');
    flat(60, 60, toon({ map: P.tex(P.stone(51, 230, 8, 32, 64, 64), 40, 40) }), 0, 0, 0, g);
    for (const sx of [-1, 1]) { add(tbox(5, 0.18, 60, 2), toon({ map: P.tex(P.stone(53, 40, 6, 50, 256, 128), 2, 24) }), sx * 6.5, 0.09, 0, g, { cast: false }); }
    const facade = (x, z, w, h, c, ry) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; g.add(b); add(tbox(w, h, 3, 3), col(c), 0, h / 2, -1.5, b); add(tbox(w + 0.2, 0.25, 3.2, 2), col('#2a2c3c'), 0, h + 0.12, -1.5, b);
      const nx = Math.floor(w / 1.5), ny = Math.floor((h - 2.4) / 1.6); for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const lit = hsh(x * 3 + i * 7 + j * 13 + z) > 0.62, wx = -w / 2 + 0.85 + i * (w - 1.7) / Math.max(1, nx - 1), wy = 3 + j * 1.6;
        add(tbox(0.8, 1.05, 0.06, 1), col('#e8e2d0'), wx, wy, 0.02, b, { cast: false }); fx(plane(0.64, 0.9), bMat({ color: lit ? '#ffd27a' : '#232a48', fog: false }), wx, wy, 0.06, b).renderOrder = 0; if (lit) fx(plane(1.8, 2.0), aMat(radial, '#ffc060', 0.4), wx, wy, 0.1, b); add(tbox(0.9, 0.07, 0.16, 1), col('#c8c2b0'), wx, wy - 0.56, 0.06, b, { cast: false }); }
      add(tbox(1.0, 2.0, 0.08, 1), col('#4a3428'), -w / 4, 1.0, 0.03, b, { cast: false }); add(tbox(w * 0.36, 1.5, 0.05, 1), col('#1c2238'), w / 5, 1.25, 0.03, b, { cast: false }); const aw = add(tbox(w * 0.4, 0.06, 0.9, 1), col(hsh(x + z) > 0.5 ? '#a83a3a' : '#3a7a5a'), w / 5, 2.15, 0.45, b); aw.rotation.x = 0.3; };
    const cs = ['#7a6a8a', '#8a7460', '#5c7088', '#886868', '#6a7a6a', '#94806a'];
    for (let i = 0; i < 7; i++) { facade(-9, -22 + i * 7, 6.6, 7 + hsh(i) * 5, cs[i % 6], Math.PI / 2); facade(9, -20 + i * 7, 6.6, 7 + hsh(i + 9) * 5, cs[(i + 3) % 6], -Math.PI / 2); }
    facade(0, -27, 9, 11, '#6c6480', 0); facade(-9, -27, 8, 8, '#806a6a', 0); facade(9, -27, 8, 9.5, '#5c7088', 0);
    S.lampsSt = []; for (const [x, z] of [[-4.3, -3.5], [4.3, 4], [-4.3, -13], [4.3, -9]]) { add(cyl(0.06, 4.4, 8), MAT.dark, x, 2.2, z, g); add(tbox(0.9, 0.07, 0.07, 1), MAT.dark, x - Math.sign(x) * 0.4, 4.35, z, g); add(tbox(0.3, 0.14, 0.22, 1), MAT.warm, x - Math.sign(x) * 0.8, 4.26, z, g, { cast: false });
      S.lampsSt.push(fx(plane(3.4, 3.4), aMat(radial, '#ffd890', 0.85), x - Math.sign(x) * 0.8, 4.2, z + 0.1, g)); fx(plane(5.5, 5.5), aMat(radial, '#ffc870', 0.35), x - Math.sign(x) * 0.8, 0.04, z, g, 0, -Math.PI / 2);
      const cone = fx(new THREE.CylinderGeometry(0.15, 1.9, 4.2, 16, 1, true), aMat(beam, '#ffd890', 0.16), x - Math.sign(x) * 0.8, 2.15, z, g); }
    // manhole at the origin
    add(new THREE.CircleGeometry(0.5, 26), bMat({ color: '#050608' }), 0, 0.012, 0, g, { cast: false }).rotation.x = -Math.PI / 2; const ring = add(new THREE.TorusGeometry(0.53, 0.05, 6, 26), col('#565a60'), 0, 0.03, 0, g, { cast: false }); ring.rotation.x = Math.PI / 2;
    const ct = canvasTex(256, 256, (c) => { c.fillStyle = '#5a5e66'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.strokeStyle = '#2c2e34'; c.lineWidth = 8; for (let k = 1; k <= 3; k++) { c.beginPath(); c.arc(128, 128, k * 36, 0, 7); c.stroke(); } for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + 120 * Math.cos(k * 0.785), 128 + 120 * Math.sin(k * 0.785)); c.stroke(); } });
    S.cover = new THREE.Group(); g.add(S.cover); add(cyl(0.52, 0.07, 26), col('#565a60'), 0, 0, 0, S.cover); const top = add(new THREE.CircleGeometry(0.52, 26), toon({ map: ct }), 0, 0.037, 0, S.cover, { cast: false }); top.rotation.x = -Math.PI / 2;
    S.holeGlow = fx(plane(2.4, 2.4), aMat(radial, '#9fe8a0', 0.5), 0, 0.05, 0, g, 0, -Math.PI / 2);
    // dressing: car, bins, hydrant, grate, moon
    const car = new THREE.Group(); car.position.set(-2.9, 0, -7.5); g.add(car); add(tbox(1.8, 0.7, 4, 2), col('#b8443a'), 0, 0.68, 0, car); add(tbox(1.6, 0.62, 2.1, 2), col('#2a3050'), 0, 1.32, -0.2, car); for (const [dx, dz] of [[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]]) { const w = add(cyl(0.36, 0.22, 14), MAT.black, dx, 0.36, dz, car); w.rotation.z = Math.PI / 2; } for (const dx of [-0.6, 0.6]) add(tbox(0.3, 0.16, 0.05, 1), MAT.warm, dx, 0.75, 2.02, car, { cast: false });
    for (const [x, z, c] of [[3.6, -2.2, '#3f6a4a'], [4.1, -2.5, '#5a5a66'], [-3.8, 2.4, '#3f6a4a']]) { add(cyl(0.3, 0.9, 12), col(c), x, 0.63, z, g); add(cyl(0.33, 0.06, 12), col('#2a2c30'), x, 1.1, z, g); }
    add(cyl(0.13, 0.6, 10), MAT.red, 3.9, 0.48, 2.6, g); add(new THREE.SphereGeometry(0.14, 8, 6), MAT.red, 3.9, 0.8, 2.6, g);
    add(tbox(0.9, 0.02, 0.5, 1), MAT.black, 3.2, 0.012, 0.6, g, { cast: false });
    S.moon = fx(new THREE.CircleGeometry(5, 30), bMat({ color: '#fff4d0', fog: false }), -14, 40, -90, g); fx(plane(34, 34), aMat(radial, '#ffe8b0', 0.5), -14, 40, -89, g);
    for (let i = 0; i < 10; i++) add(tbox(4 + hsh(i) * 5, 14 + hsh(i + 4) * 16, 4, 4), col('#2c3048'), -36 + i * 8, 6, -48 - hsh(i) * 10, g, { cast: false });
  }
  // dust motes: one instanced cloud, repositioned around W.motes each frame
  S.moteM = new THREE.InstancedMesh(plane(1, 1), aMat(radial, '#ffffff', 0.55), 260); S.moteM.userData.ndSkip = true; S.moteM.renderOrder = 4; S.moteM.frustumCulled = false; world.add(S.moteM); S.dummy = new THREE.Object3D();
};
export const update = (ctx, W, f) => {
  const { THREE, camera } = ctx; const t = f / 30;
  for (const k in S.sets) S.sets[k].visible = k === W.set;
  // fluorescent flicker
  const dim = W.dim ?? 1;
  for (const u of S.tubes) { let v = 1; if (u.bad) { const n = hsh(Math.floor(f / 2) * 1.3 + u.i * 17); v = n > 0.82 ? 0.25 + hsh(f + u.i) * 0.3 : n > 0.7 ? 0.75 : 1; } else v = 0.96 + 0.04 * Math.sin(f * 1.9 + u.i);
    v *= dim; u.m.color.setRGB(0.95 * v, 1.0 * v, 0.94 * v); u.gm.opacity = 0.55 * v; u.pm.opacity = 0.22 * v; }
  for (const k of S.keys) k.o.rotation.x = Math.sin(t * 2.2 + k.i * 1.3) * 0.22 * (1 + (W.keyShake || 0) * 2);
  for (const s of S.spin) s.o.rotation[s.ax || 'z'] = s.a0 + f * s.k;
  for (let i = 0; i < S.shafts.length; i++) S.shafts[i].material.opacity = S.shafts[i].userData.op0 ?? (S.shafts[i].userData.op0 = S.shafts[i].material.opacity), S.shafts[i].material.opacity = S.shafts[i].userData.op0 * (0.82 + 0.18 * Math.sin(t * 1.3 + i * 1.7));
  const d = W.door || 0; S.door.rotation.y = d * 1.25;
  S.leak.forEach((m, i) => { m.material.opacity = (i < 4 ? 0.85 : 0.4) * (0.75 + 0.25 * Math.sin(t * 2 + i)) * (1 - d * 0.5) * (W.leak ?? 1); });
  S.sun.forEach((m, i) => { m.material.opacity = [0.6, 0.22, 0.2, 0.18, 0.16, 0.5][i] * (W.sunK ?? 1) * d * (0.9 + 0.1 * Math.sin(t * 3 + i)); m.visible = d > 0.01; });
  const al = W.alarm || 0; S.lamp.material.color.set(al ? (Math.floor(f / 4) % 2 ? '#ff4030' : '#801810') : '#50e070'); S.lampG.material.color.set(al ? '#ff4030' : '#50ff80'); S.lampG.material.opacity = al ? (Math.floor(f / 4) % 2 ? 0.9 : 0.3) : 0.6;
  S.camLed.material.opacity = Math.floor(f / 15) % 2 ? 1 : 0.15;
  S.blanket.visible = !!W.blanket; if (W.blanket) { const p = S.blanketM.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, Math.sin(x * 3 + t * 9) * 0.05 * (0.65 - y) * (1 + (W.blanketKick || 0) * 2.5)); } p.needsUpdate = true; }
  S.planPaper.visible = W.planOnBed !== false; S.bars.visible = W.bars !== false; { const sd = W.stand || [-0.82, 0, -5.5]; S.stand.position.set(sd[0], 0, sd[2]); S.stand.scale.setScalar(W.standS || 1); } if (W.visSign) S.visSign.position.set(...W.visSign);
  S.donuts.forEach((o, i) => { o.m.position.set(o.x + Math.sin(t * o.sp + i) * 0.2, ((o.y + t * o.sp * 0.5) % 4.6) - 0.2, o.z); o.m.rotation.z = t * o.sp * 1.4 + i; o.m.scale.setScalar(o.s); });
  S.globe.rotation.y = t * 0.9 + 1;
  S.screens.forEach((o) => { const a = o.i / 14 * 6.283 + t * 0.5, r = 3.9 + (o.i % 3) * 0.7, y = 3.2 + Math.sin(o.i * 2.4) * 2.3 + Math.sin(t * 1.5 + o.i) * 0.15; o.m.position.set(Math.cos(a) * r, y, Math.sin(a) * r * 0.8); o.m.quaternion.copy(camera.quaternion); o.m.rotateZ(Math.sin(o.i * 1.7) * 0.25);
    const pop = Math.max(0, Math.min(1, ((W.pop ?? 99) - o.i * 0.07) * 4)); o.m.scale.setScalar((o.tv ? 1.25 : 0.95) * (pop < 1 ? pop * (1.3 - 0.3 * pop) : 1) + 0.0001); });
  S.sewerLamps.forEach((m, i) => { m.material.opacity = 0.6 * (0.85 + 0.15 * Math.sin(t * 7 + i * 2.1) * Math.sin(t * 3.1 + i)); });
  S.lampsSt.forEach((m, i) => { m.material.opacity = 0.85 * (i === 1 ? (hsh(Math.floor(f / 3) + 5) > 0.85 ? 0.5 : 1) : 1); });
  const c = W.cover ?? 0; S.cover.position.set(c * 1.05, 0.035 + Math.sin(Math.min(1, c) * Math.PI) * 0.12, c * 0.25); S.cover.rotation.z = Math.sin(Math.min(1, c) * Math.PI) * 0.25; S.cover.rotation.y = c * 0.8; S.holeGlow.material.opacity = 0.5 * Math.min(1, c);
  // motes
  const M = W.motes, mm = S.moteM, dmy = S.dummy; mm.visible = !!M;
  if (M) { mm.position.set(0, 0, 0); mm.material.color.set(M.col || '#ffffff'); mm.material.opacity = M.op ?? 0.5; const n = Math.min(260, M.n || 160), [cx, cy, cz] = M.c, [sx, sy, sz] = M.s;
    for (let i = 0; i < 260; i++) { if (i >= n) { dmy.scale.setScalar(0.0001); dmy.position.set(0, -50, 0); } else { const sp = 0.02 + hsh(i + 50) * 0.05, yy = ((hsh(i + 9) + t * sp * (M.rise ?? 1) / sy) % 1 + 1) % 1;
        dmy.position.set(cx + (hsh(i) - 0.5) * sx + Math.sin(t * 0.7 + i) * 0.08, cy + (yy - 0.5) * sy, cz + (hsh(i + 23) - 0.5) * sz + Math.cos(t * 0.5 + i * 2) * 0.08);
        dmy.quaternion.copy(camera.quaternion); dmy.scale.setScalar((M.size || 0.035) * (0.5 + hsh(i + 70) * 1.3) * (0.6 + 0.4 * Math.sin(t * 2 + i * 1.3)) * Math.sin(yy * Math.PI)); }
      dmy.updateMatrix(); mm.setMatrixAt(i, dmy.matrix); } mm.instanceMatrix.needsUpdate = true; }
};
