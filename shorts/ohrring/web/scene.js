// scene.js: worlds for "Der goldene Ohrring" (all sets share the origin; update() shows one per shot).
// Sets: tav (harbour tavern "Zum Alten Anker", inside + street front), sea (ship + ocean, calm / storm / ice),
// beach (dawn beach, hill chapel, gravestone), gun (gun deck), arch (archive), gal (portrait gallery), ring (earring prop).
// Every visible word is German: "Zum Alten Anker", "Rum & Bier", book spines, "Hamburg", "Unbekannter Seemann".
let S = {};
const SERIF = '"DejaVu Serif", Georgia, serif';
export const build = (ctx) => {
  const { THREE, P, world, add, tbox, toon, texM, canvasTex, T } = ctx;
  const basic = (map, o = {}) => new THREE.MeshBasicMaterial({ map, ...o });
  const grp = (name) => { const g = new THREE.Group(); g.visible = false; world.add(g); S[name] = g; return g; };
  const noInk = (m) => { m.userData.ndSkip = true; return m; };
  const M = {
    plank: texM(P.planks(1), 1, 1), plankD: texM(P.planks(5), 1, 1, '#a07858'), beam: texM(P.beam(2, [24, 40, 30]), 1, 1),
    wall: texM(P.plaster(8, 34), 1, 1, '#a88a6c'), stone: texM(P.stone(4, 30, 12, 48), 1, 1), cobble: texM(P.stone(21, 30, 10, 40, 64, 48), 6, 6),
    wood: toon({ color: '#7a5434' }), woodD: toon({ color: '#4e331f' }), woodL: toon({ color: '#a8784a' }), iron: toon({ color: '#2c2a30' }), brass: toon({ color: '#c8a050' }),
    gold: toon({ color: '#f2c040', emissive: '#6a4a08', emissiveIntensity: 0.5 }), rope: toon({ color: '#c8a46a' }), sail: toon({ color: '#f2e8d0', side: THREE.DoubleSide }),
    foam: toon({ color: '#fff8ec' }), cream: toon({ color: '#f4ead2' }), red: toon({ color: '#a8322c' }), green: toon({ color: '#2e6a3c' }),
    candle: toon({ color: '#f6eed8', emissive: '#ffcf80', emissiveIntensity: 0.25 }), flame: new THREE.MeshBasicMaterial({ color: '#ffd27a' }),
    glass: toon({ color: '#ffe6a0', emissive: '#ffbf60', emissiveIntensity: 1.2 }), white: toon({ color: '#f6f2ea' }), sand: texM(P.dirt(7), 30, 30, '#f0d8a8'),
    grass: texM(P.grass(6), 10, 10), rock: toon({ color: '#4a4c52' }), snow: toon({ color: '#f4f6fa' }), roof: texM(P.roof(9), 2, 2),
    hull: texM(P.planks(3), 2, 1, '#8a5a34'), hullD: toon({ color: '#2a1e18' }), pewter: toon({ color: '#c4ccd4' }),
  };
  S.M = M;
  const cyl = (r0, r1, h, seg = 12) => new THREE.CylinderGeometry(r0, r1, h, seg);
  const rope = (parent, a, b, r = 0.025, mat = M.rope) => { const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), L = va.distanceTo(vb);
    const m = add(cyl(r, r, L, 5), mat, 0, 0, 0, parent, { cast: false }); m.position.copy(va).add(vb).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize()); return m; };
  const signTex = (w, h, text, o = {}) => canvasTex(w, h, (c, W, H) => {
    c.fillStyle = o.bg || '#6a4224'; c.beginPath(); c.roundRect(6, 6, W - 12, H - 12, o.rad ?? 26); c.fill();
    if (o.grain !== false) for (let i = 0; i < 26; i++) { c.strokeStyle = `rgba(40,20,8,${0.15 + (i % 3) * 0.06})`; c.lineWidth = 2 + (i % 4); c.beginPath(); const y = 14 + i * (H - 28) / 26; c.moveTo(14, y); c.bezierCurveTo(W * 0.3, y + 6, W * 0.6, y - 6, W - 14, y + 2); c.stroke(); }
    c.lineWidth = o.border || 12; c.strokeStyle = o.bc || '#e2b84c'; c.beginPath(); c.roundRect(24, 24, W - 48, H - 48, (o.rad ?? 26) - 8); c.stroke();
    if (o.draw) o.draw(c, W, H);
    c.font = `bold ${o.size || 110}px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = o.ol || 14; c.strokeStyle = o.olc || '#1e0e06'; c.strokeText(text, W / 2, o.ty || H / 2 + 6); c.fillStyle = o.fg || '#f4d27a'; c.fillText(text, W / 2, o.ty || H / 2 + 6);
  });

  // =============== TAVERN ===============
  const TV = grp('tav');
  { const R = P.rng(3);
    const floor = add(new THREE.PlaneGeometry(14, 14), texM(P.planks(11), 3, 3, '#9a7050'), 0, 0, 0, TV, { cast: false }); floor.rotation.x = -Math.PI / 2;
    // back wall with a window opening (window centre x=-2.3, y 1.35..2.45)
    const wz = -3.6;
    add(tbox(4.0, 3.7, 0.3, 1.5), M.wall, -5.3, 1.85, wz, TV); add(tbox(6.5, 3.7, 0.3, 1.5), M.wall, 1.95, 1.85, wz, TV);
    add(tbox(1.3, 1.35, 0.3, 1.5), M.wall, -2.65, 0.675, wz, TV); add(tbox(1.3, 1.25, 0.3, 1.5), M.wall, -2.65, 3.075, wz, TV);
    add(tbox(1.5, 0.12, 0.42, 1), M.woodD, -2.65, 1.33, wz + 0.05, TV); add(tbox(0.08, 1.1, 0.34, 1), M.woodD, -2.65, 1.9, wz, TV); add(tbox(1.3, 0.08, 0.34, 1), M.woodD, -2.65, 1.9, wz, TV);
    // dado (wood panels) on the lower wall
    add(tbox(14, 1.0, 0.06, 1.5), M.plankD, 0, 0.5, wz + 0.18, TV);
    // side walls
    add(tbox(0.3, 3.7, 9, 1.5), M.wall, -6.2, 1.85, -0.3, TV); add(tbox(0.3, 3.7, 9, 1.5), M.wall, 6.2, 1.85, -0.3, TV);
    // ceiling + heavy beams
    add(tbox(13, 0.2, 9, 2), M.plankD, 0, 3.75, -0.3, TV);
    for (let x = -5; x <= 5; x += 2.2) add(tbox(0.42, 0.44, 9, 1.5), M.beam, x, 3.45, -0.3, TV);
    add(tbox(13, 0.4, 0.4, 1.5), M.beam, 0, 3.4, -1.6, TV);
    // posts
    for (const x of [-3.6, 3.6]) add(tbox(0.4, 3.5, 0.4, 1.5), M.beam, x, 1.75, -2.9, TV);
    // hanging ropes, a fishing net and the ship lantern
    for (const [x, z, L] of [[-1.6, -2.2, 1.0], [1.8, -2.5, 0.8], [-4.2, -1.4, 1.2], [4.4, -1.2, 0.9]]) { rope(TV, [x, 3.25, z], [x + 0.1, 3.25 - L, z + 0.05], 0.03); add(new THREE.TorusGeometry(0.12, 0.03, 6, 12), M.rope, x + 0.1, 3.25 - L - 0.1, z + 0.05, TV); }
    const netT = canvasTex(512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#c8a46a'; c.lineWidth = 5; for (let i = -8; i < 16; i++) { c.beginPath(); c.moveTo(i * 40, 0); c.lineTo(i * 40 + 300, h); c.stroke(); c.beginPath(); c.moveTo(i * 40 + 300, 0); c.lineTo(i * 40, h); c.stroke(); }
      for (let i = 0; i < 5; i++) { c.fillStyle = '#e0b040'; c.beginPath(); c.arc(60 + i * 100, 470 + (i % 2) * 20, 18, 0, 7); c.fill(); } });
    const net = add(new THREE.PlaneGeometry(3.4, 1.4, 12, 4), new THREE.MeshToonMaterial({ gradientMap: ctx.grad, map: netT, alphaTest: 0.4, side: THREE.DoubleSide }), 2.6, 3.0, -3.3, TV, { cast: false });
    { const pa = net.geometry.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i); pa.setY(i, y - 0.35 * Math.cos(x / 1.7 * Math.PI / 2) * (0.7 - y / 1.4)); pa.setZ(i, 0.12 * Math.sin(x * 2)); } }
    net.userData.ndSkip = true;
    const lan = new THREE.Group(); lan.position.set(-0.9, 3.25, -1.5); TV.add(lan); S.lantern = lan;
    rope(lan, [0, 0, 0], [0, -0.45, 0], 0.02, M.iron); add(tbox(0.36, 0.5, 0.36, 1), M.glass, 0, -0.75, 0, lan); add(new THREE.ConeGeometry(0.3, 0.22, 4), M.iron, 0, -0.42, 0, lan).rotation.y = Math.PI / 4;
    add(tbox(0.42, 0.05, 0.42, 1), M.iron, 0, -1.02, 0, lan); for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) add(tbox(0.04, 0.55, 0.04, 1), M.iron, dx, -0.75, dz, lan);
    // ship's wheel on the wall
    const wh = new THREE.Group(); wh.position.set(1.75, 2.3, wz + 0.25); TV.add(wh); S.wheel = wh;
    add(new THREE.TorusGeometry(0.62, 0.06, 8, 32), M.wood, 0, 0, 0, wh); add(new THREE.TorusGeometry(0.2, 0.07, 8, 20), M.wood, 0, 0, 0, wh); add(cyl(0.1, 0.1, 0.16, 12), M.brass, 0, 0, 0, wh).rotation.x = Math.PI / 2;
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, sp = add(cyl(0.035, 0.045, 1.6, 6), M.wood, 0, 0, 0, wh); sp.rotation.z = a; add(new THREE.SphereGeometry(0.06, 8, 6), M.wood, Math.cos(a + Math.PI / 2) * 0.8, Math.sin(a + Math.PI / 2) * 0.8, 0, wh); }
    // anchor decorations
    const anchor = (x, y, z, s, parent = TV, mat = M.iron) => { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
      add(cyl(0.05, 0.05, 1.0, 8), mat, 0, 0, 0, g); add(new THREE.TorusGeometry(0.1, 0.035, 6, 14), mat, 0, 0.58, 0, g); add(cyl(0.04, 0.04, 0.55, 8), mat, 0, 0.32, 0, g).rotation.z = Math.PI / 2;
      const arc = add(new THREE.TorusGeometry(0.42, 0.05, 6, 20, Math.PI), mat, 0, -0.08, 0, g); arc.rotation.z = Math.PI; for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.09, 0.2, 4), mat, s * 0.42, -0.04, 0, g).rotation.z = s * 0.6; return g; };
    anchor(-4.6, 2.2, wz + 0.22, 0.9); anchor(4.6, 2.0, wz + 0.22, 0.7, TV, M.brass);
    // "Rum & Bier" small wooden sign on the back wall
    const rb = signTex(512, 220, 'Rum & Bier', { size: 92, bg: '#5a3820', rad: 18, border: 8, ty: 118 });
    add(tbox(1.12, 0.5, 0.06, 1), M.woodD, 3.35, 1.62, wz + 0.2, TV); noInk(add(new THREE.PlaneGeometry(1.06, 0.455), basic(rb), 3.35, 1.62, wz + 0.235, TV, { cast: false }));
    // shelf with bottles behind the counter (right)
    add(tbox(2.6, 0.08, 0.4, 1), M.woodD, -4.2, 1.45, wz + 0.35, TV); add(tbox(2.6, 0.08, 0.4, 1), M.woodD, -4.2, 2.05, wz + 0.35, TV);
    for (let i = 0; i < 9; i++) { const x = -5.3 + i * 0.27, y = i % 2 ? 1.49 : 2.09; add(cyl(0.07, 0.08, 0.34, 8), toon({ color: ['#3a6a3a', '#7a3a24', '#2a3a5a', '#8a6a2a'][i % 4] }), x, y + 0.17, wz + 0.35, TV); add(cyl(0.025, 0.03, 0.12, 6), M.woodL, x, y + 0.4, wz + 0.35, TV); }
    // barrels
    for (const [x, z] of [[-5.2, -2.6], [-4.4, -2.9], [5.2, -2.7]]) { const b = add(cyl(0.42, 0.42, 1.0, 16), M.wood, x, 0.5, z, TV); add(new THREE.TorusGeometry(0.43, 0.03, 6, 20), M.iron, x, 0.2, z, TV).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.43, 0.03, 6, 20), M.iron, x, 0.8, z, TV).rotation.x = Math.PI / 2; }
    // round table + candles + mugs
    add(cyl(1.15, 1.15, 0.1, 28), M.wood, 0, 1.0, -0.5, TV); add(cyl(0.12, 0.18, 1.0, 10), M.woodD, 0, 0.5, -0.5, TV); add(cyl(0.6, 0.6, 0.06, 16), M.woodD, 0, 0.03, -0.5, TV);
    S.candles = [];
    for (const [x, z, h] of [[-0.35, -0.2, 0.28], [0.45, -0.75, 0.2], [-0.62, -0.75, 0.16]]) { add(cyl(0.05, 0.055, h, 10), M.candle, x, 1.05 + h / 2, z, TV); add(cyl(0.11, 0.12, 0.03, 12), M.brass, x, 1.065, z, TV); const fl = add(new THREE.SphereGeometry(0.035, 8, 6), M.flame, x, 1.05 + h + 0.05, z, TV, { cast: false }); fl.scale.y = 1.8; fl.userData.ndSkip = true; S.candles.push([x, 1.05 + h + 0.06, z]); }
    for (const [x, z] of [[0.62, -0.1], [-0.82, -0.3], [-0.45, 0.35]]) { add(cyl(0.11, 0.1, 0.26, 12), M.wood, x, 1.18, z, TV); add(cyl(0.115, 0.115, 0.06, 12), M.foam, x, 1.33, z, TV); }
    // side tables in the background
    for (const [x, z] of [[-3.4, -2.0], [3.6, -1.6]]) { add(tbox(1.4, 0.08, 0.9, 1), M.wood, x, 0.95, z, TV); add(tbox(0.1, 0.95, 0.1, 1), M.woodD, x - 0.6, 0.47, z, TV); add(tbox(0.1, 0.95, 0.1, 1), M.woodD, x + 0.6, 0.47, z, TV); add(cyl(0.05, 0.05, 0.2, 8), M.candle, x, 1.09, z, TV); }
    // warm candle light
    for (const [x, y, z, i] of [[0, 1.6, -0.4, 6], [-0.9, 2.4, -1.5, 5], [-3.4, 1.4, -2.0, 3], [3.6, 1.4, -1.6, 3]]) { const L = new THREE.PointLight('#ffb060', i, 7, 1.6); L.position.set(x, y, z); TV.add(L); }
    // outside the window: night harbour with ship masts and a moon
    const harb = add(new THREE.PlaneGeometry(200, 120), ctx.waterMat, 0, -0.3, -70, TV, { cast: false }); harb.rotation.x = -Math.PI / 2; harb.userData.nd = ctx.waterNd;
    const quay = add(tbox(40, 0.8, 4, 2), M.stone, 0, -0.1, -8, TV);
    for (const [x, z, h] of [[-7, -18, 9], [-2.5, -22, 11], [3, -16, 8], [8, -25, 12], [-12, -24, 10]]) { const sh = new THREE.Group(); sh.position.set(x, 0, z); TV.add(sh); add(tbox(6, 1.4, 2, 2), M.hullD, 0, 0.4, 0, sh); add(cyl(0.12, 0.15, h, 6), M.woodD, -1, h / 2, 0, sh); add(cyl(0.1, 0.12, h * 0.8, 6), M.woodD, 1.5, h * 0.4, 0, sh); add(cyl(0.06, 0.06, 4, 6), M.woodD, -1, h * 0.75, 0, sh).rotation.z = Math.PI / 2; rope(sh, [-1, h, 0], [3, 0.8, 0], 0.03, M.woodD); }
    const moonT = canvasTex(256, 256, (c) => { const gr = c.createRadialGradient(128, 128, 30, 128, 128, 128); gr.addColorStop(0, 'rgba(255,248,220,1)'); gr.addColorStop(0.35, 'rgba(255,240,200,0.9)'); gr.addColorStop(0.42, 'rgba(255,240,200,0.25)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gr; c.fillRect(0, 0, 256, 256); });
    noInk(add(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: moonT, transparent: true, fog: false, depthWrite: false }), -14, 22, -80, TV, { cast: false }));
    // ---- street front (z = +3.4): door opening, window, swinging sign "Zum Alten Anker"
    const fz = 3.4;
    add(tbox(5.0, 4.4, 0.35, 1.5), texM(P.stone(14, 28, 14, 50, 96, 48), 1, 1), -3.6, 2.2, fz, TV); add(tbox(5.0, 4.4, 0.35, 1.5), texM(P.stone(14, 28, 14, 50, 96, 48), 1, 1), 3.6, 2.2, fz, TV);
    add(tbox(2.2, 1.8, 0.35, 1.5), texM(P.stone(14, 28, 14, 50, 96, 48), 1, 1), 0, 3.5, fz, TV);
    add(tbox(0.16, 2.6, 0.45, 1), M.woodD, -1.12, 1.3, fz, TV); add(tbox(0.16, 2.6, 0.45, 1), M.woodD, 1.12, 1.3, fz, TV); add(tbox(2.4, 0.18, 0.45, 1), M.woodD, 0, 2.62, fz, TV);
    const door = add(tbox(1.0, 2.5, 0.08, 1), M.plankD, -1.55, 1.25, fz + 0.75, TV); door.rotation.y = -1.25;
    for (const x of [-3.0, 3.0]) { add(tbox(1.4, 1.2, 0.4, 1), M.woodD, x, 1.9, fz + 0.02, TV); add(tbox(1.2, 1.0, 0.42, 1), toon({ color: '#ffcf80', emissive: '#ff9f40', emissiveIntensity: 0.9 }), x, 1.9, fz + 0.02, TV); add(tbox(0.06, 1.0, 0.44, 1), M.woodD, x, 1.9, fz, TV); }
    const street = add(new THREE.PlaneGeometry(40, 20), M.cobble, 0, 0.005, fz + 10, TV, { cast: false }); street.rotation.x = -Math.PI / 2;
    // the sign on a bracket with two chains; S.sign swings
    add(tbox(0.12, 0.12, 1.7, 1), M.iron, 0, 3.15, fz + 0.85, TV); add(tbox(0.08, 0.6, 0.08, 1), M.iron, 0, 2.95, fz + 0.4, TV);
    const sg = new THREE.Group(); sg.position.set(0, 3.08, fz + 1.55); TV.add(sg); S.sign = sg;
    const zt = signTex(1024, 512, 'Zum Alten Anker', { size: 108, ty: 380, bg: '#6a4224', draw: (c, W, H) => {
      c.save(); c.translate(W / 2, 150); c.strokeStyle = '#1e0e06'; c.lineWidth = 30; c.lineCap = 'round';
      const A = (col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(0, -80); c.lineTo(0, 90); c.stroke(); c.beginPath(); c.arc(0, -96, 20, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-60, -40); c.lineTo(60, -40); c.stroke(); c.beginPath(); c.arc(0, 20, 90, 0.25, Math.PI - 0.25); c.stroke(); };
      A('#1e0e06', 34); A('#f4d27a', 18); c.restore(); } });
    for (const x of [-0.75, 0.75]) for (let k = 0; k < 4; k++) add(new THREE.TorusGeometry(0.045, 0.014, 5, 10), M.iron, x, -0.06 - k * 0.075, 0, sg).rotation.y = (k % 2) * Math.PI / 2;
    add(tbox(1.9, 0.98, 0.08, 1), M.woodD, 0, -0.82, 0, sg);
    for (const s of [1, -1]) noInk(add(new THREE.PlaneGeometry(1.84, 0.92), basic(zt), 0, -0.82, s * 0.045, sg, { cast: false })).rotation.y = s > 0 ? 0 : Math.PI;
    const LL = new THREE.PointLight('#ffb060', 6, 8, 1.6); LL.position.set(0, 2.2, fz + 1.8); TV.add(LL);
    add(cyl(0.05, 0.05, 0.5, 6), M.iron, 1.5, 2.9, fz + 0.4, TV).rotation.x = Math.PI / 2; add(tbox(0.3, 0.42, 0.3, 1), M.glass, 1.5, 2.62, fz + 0.62, TV);
  }

  // =============== SEA + SHIP ===============
  const SE = grp('sea');
  { const N = 120, size = 260;
    const og = new THREE.PlaneGeometry(size, size, N, N); og.rotateX(-Math.PI / 2);
    S.oceanBase = og.attributes.position.array.slice();
    const foamT = canvasTex(1024, 1024, (c, w, h) => { c.fillStyle = '#808080'; c.fillRect(0, 0, w, h); const r = P.rng(77);
      for (let i = 0; i < 260; i++) { const x = r() * w, y = r() * h, L = 40 + r() * 160; c.strokeStyle = `rgba(255,255,255,${0.35 + r() * 0.5})`; c.lineWidth = 3 + r() * 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + L / 2, y - 10 - r() * 14, x + L, y); c.stroke(); }
      for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(20,30,30,${0.2 + r() * 0.2})`; c.fillRect(r() * w, r() * h, 30 + r() * 80, 3 + r() * 5); } });
    foamT.wrapS = foamT.wrapT = THREE.RepeatWrapping; foamT.repeat.set(10, 10);
    S.oceanMat = toon({ color: '#2e5a5a', map: foamT });
    S.ocean = add(og, S.oceanMat, 0, 0, 0, SE, { cast: false }); S.ocean.receiveShadow = false;
    S.calm = add(new THREE.PlaneGeometry(1600, 1600), ctx.waterMat, 0, 0.05, 0, SE, { cast: false }); S.calm.rotation.x = -Math.PI / 2; S.calm.userData.nd = ctx.waterNd;
    // equator: a thin shining golden line on the sea
    const eqT = canvasTex(64, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,220,120,0)'); gr.addColorStop(0.5, 'rgba(255,240,170,1)'); gr.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    S.eq = noInk(add(new THREE.PlaneGeometry(7, 1600), new THREE.MeshBasicMaterial({ map: eqT, transparent: true, depthWrite: false, fog: false }), 24, 0.12, 0, SE, { cast: false })); S.eq.rotation.x = -Math.PI / 2;
    // ship: bow +x, deck at y = 2
    const SH = new THREE.Group(); SE.add(SH); S.ship = SH;
    const hs = new THREE.Shape(); hs.moveTo(-11, -3); hs.lineTo(6, -3.2); hs.quadraticCurveTo(11, -2.6, 14, 0); hs.quadraticCurveTo(11, 2.6, 6, 3.2); hs.lineTo(-11, 3); hs.lineTo(-11.6, 0); hs.closePath();
    const hg = new THREE.ExtrudeGeometry(hs, { depth: 3.4, bevelEnabled: false, curveSegments: 10 }); hg.rotateX(Math.PI / 2); hg.translate(0, 2.0, 0);
    { const pa = hg.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i), k = Math.min(1, Math.max(0, (y + 1.4) / 3.4)); pa.setZ(i, pa.getZ(i) * (0.5 + 0.5 * k)); pa.setX(i, pa.getX(i) * (0.9 + 0.1 * k)); } hg.computeVertexNormals(); }
    add(hg, [M.plank, M.hull], 0, 0, 0, SH);
    // deck boards on top + bulwark rails
    const dk = add(new THREE.ShapeGeometry(hs), M.plank, 0, 2.02, 0, SH, { cast: false }); dk.rotation.x = -Math.PI / 2;
    S.deckY = 2.02;
    const railPts = []; for (let i = 0; i <= 40; i++) { const p = hs.getPoint(i / 40); railPts.push(p); }
    for (let i = 0; i < railPts.length - 1; i++) { const a = railPts[i], b = railPts[i + 1]; if (Math.hypot(b.x - a.x, b.y - a.y) < 0.05) continue; rope(SH, [a.x, 2.85, a.y], [b.x, 2.85, b.y], 0.09, M.woodD); if (i % 2 === 0) add(tbox(0.12, 0.85, 0.12, 1), M.woodD, a.x, 2.45, a.y, SH); }
    // hull stripe + gun ports
    for (const s of [-1, 1]) { for (let k = 0; k < 6; k++) add(tbox(0.7, 0.55, 0.1, 1), M.hullD, -8 + k * 2.8, 1.1, s * 3.42, SH); add(tbox(19, 0.18, 0.08, 1), toon({ color: '#d8b060' }), -2, 1.6, s * 3.45, SH); }
    // masts, yards, sails, crow's nest
    S.sails = [];
    const mast = (x, h, nest) => { add(cyl(0.2, 0.28, h, 10), M.wood, x, 2 + h / 2, 0, SH);
      for (const [y, w] of [[h * 0.42, 9], [h * 0.68, 7.2], [h * 0.9, 5.2]]) {
        add(cyl(0.1, 0.1, w, 8), M.wood, x, 2 + y, 0, SH).rotation.x = Math.PI / 2;
        const sg_ = new THREE.PlaneGeometry(w * 0.92, h * 0.22, 8, 4); const sl = add(sg_, M.sail, x + 0.25, 2 + y - h * 0.115, 0, SH); sl.rotation.y = Math.PI / 2; sl.userData.base = sg_.attributes.position.array.slice(); S.sails.push(sl);
      }
      if (nest) { const ny = 2 + h * 0.94; add(cyl(0.95, 0.85, 0.8, 16), M.wood, x, ny, 0, SH); add(new THREE.TorusGeometry(0.95, 0.06, 6, 20), M.woodD, x, ny + 0.4, 0, SH).rotation.x = Math.PI / 2; S.nestY = ny + 0.4; S.nestX = x; }
      for (const s of [-1, 1]) for (const k of [0.4, 0.75]) rope(SH, [x, 2 + h * k, 0], [x - 1.2, 2.85, s * 3.1], 0.025);
    };
    mast(-6.5, 13, false); mast(0, 16, true); mast(6, 12, false);
    add(cyl(0.14, 0.2, 9, 8), M.wood, 15, 4.2, 0, SH).rotation.z = 1.2; rope(SH, [19.5, 5.9, 0], [6, 14, 0], 0.03); rope(SH, [-11.5, 3, 0], [-6.5, 15, 0], 0.03);
    // stern cabin + flag
    add(tbox(4, 1.6, 5.4, 1.5), M.plankD, -9, 2.8, 0, SH); add(tbox(4.4, 0.16, 5.8, 1), M.woodD, -9, 3.65, 0, SH);
    const flagT = canvasTex(128, 96, (c) => { c.fillStyle = '#c8322c'; c.fillRect(0, 0, 128, 96); c.fillStyle = '#f6f0e0'; c.fillRect(0, 36, 128, 24); });
    const flag = add(new THREE.PlaneGeometry(1.6, 1.1, 6, 3), toon({ map: flagT, side: THREE.DoubleSide }), -6.5 + 0.85, 2 + 13.4, 0, SH); S.flag = flag; S.flagBase = flag.geometry.attributes.position.array.slice();
    // deck clutter: barrels, coiled rope, a cannon on deck
    for (const [x, z] of [[-4, 2.2], [-3.3, 2.5], [3.5, -2.3]]) add(cyl(0.38, 0.38, 0.9, 14), M.wood, x, 2.47, z, SH);
    add(new THREE.TorusGeometry(0.4, 0.12, 6, 18), M.rope, 2.2, 2.1, 2.2, SH).rotation.x = Math.PI / 2;
    // Cape Horn: dark jagged rocks + snow caps, far
    const RK = new THREE.Group(); SE.add(RK); S.rocks = RK; const rr = P.rng(19);
    for (let i = 0; i < 14; i++) { const x = 40 + rr() * 90, z = -60 - rr() * 90, h = 14 + rr() * 34, r = 6 + rr() * 9; const c = add(new THREE.ConeGeometry(r, h, 5), M.rock, x, h / 2 - 3, z, RK); c.rotation.y = rr() * 3; c.scale.x = 0.6 + rr() * 0.5;
      const sc = add(new THREE.ConeGeometry(r * 0.35, h * 0.3, 5), M.snow, x, h * 0.85 - 3, z, RK); sc.rotation.y = c.rotation.y; sc.scale.x = c.scale.x; }
    for (let i = 0; i < 6; i++) { const x = -60 + rr() * 50, z = -90 - rr() * 60, h = 30 + rr() * 30; add(new THREE.ConeGeometry(12 + rr() * 10, h, 5), M.rock, x, h / 2 - 3, z, RK).scale.x = 0.7; }
    // distant islands for the calm sea
    const IS = new THREE.Group(); SE.add(IS); S.isl = IS;
    for (const [x, z, r] of [[-120, -260, 40], [180, -320, 55]]) { const h = add(new THREE.SphereGeometry(r, 20, 10), toon({ color: '#6a9a5a' }), x, -r * 0.7, z, IS, { cast: false }); h.scale.y = 0.6; }
  }

  // =============== BEACH ===============
  const BE = grp('beach');
  { const sand = add(new THREE.PlaneGeometry(220, 220), M.sand, 0, 0, 30, BE, { cast: false }); sand.rotation.x = -Math.PI / 2;
    const sea = add(new THREE.PlaneGeometry(1200, 600), ctx.waterMat, 0, -0.02, -300, BE, { cast: false }); sea.rotation.x = -Math.PI / 2; sea.userData.nd = ctx.waterNd;
    // wet sand band + foam line
    S.foam = [];
    const wet = add(new THREE.PlaneGeometry(220, 3.2), toon({ color: '#c8aa78' }), 0, 0.01, -2.4, BE, { cast: false }); wet.rotation.x = -Math.PI / 2;
    for (let k = 0; k < 2; k++) { const fm = add(new THREE.PlaneGeometry(220, 0.35, 60, 1), M.foam, 0, 0.02, -3.6 - k * 0.8, BE, { cast: false }); fm.rotation.x = -Math.PI / 2; fm.userData.base = fm.geometry.attributes.position.array.slice(); S.foam.push(fm); }
    const shellM = [toon({ color: '#f6d6c8' }), toon({ color: '#fff4e4' }), toon({ color: '#e8b8a0' })], rs = P.rng(7);
    for (let i = 0; i < 40; i++) { const x = (rs() - 0.5) * 30, z = -1.5 + rs() * 14; if (Math.hypot(x, z - 0.2) < 1.2) continue; const s = add(new THREE.SphereGeometry(0.09 + rs() * 0.08, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), shellM[i % 3], x, 0, z, BE, { cast: false }); s.scale.set(1, 0.5, 1.3); s.rotation.y = rs() * 3; }
    for (let i = 0; i < 18; i++) { const x = (rs() - 0.5) * 40, z = 2 + rs() * 20; add(new THREE.SphereGeometry(0.3 + rs() * 0.5, 8, 6), M.rock, x, 0, z, BE).scale.y = 0.5; }
    // dunes + hill with the chapel (right/back)
    for (const [x, z, r, sy] of [[16, -6, 12, 0.5], [24, 4, 14, 0.45], [-22, 8, 12, 0.35], [-30, -2, 16, 0.3]]) { const d = add(new THREE.SphereGeometry(r, 24, 12), toon({ color: '#e8cf98' }), x, -r * 0.62, z, BE, { cast: false }); d.scale.y = sy; }
    const hill = add(new THREE.SphereGeometry(14, 32, 14), M.grass, 15, -8.6, -4, BE, { cast: false }); hill.scale.set(1, 0.85, 0.8);
    const CH = new THREE.Group(); CH.position.set(13.8, 2.45, -8.2); CH.rotation.y = -0.2; BE.add(CH); S.chapelPos = [15.5, 3.15, -6.5];
    add(tbox(4.2, 3.0, 3.0, 2), M.white, 0, 1.5, 0, CH); const rf = add(new THREE.ConeGeometry(3.4, 1.8, 4), M.roof, 0, 3.9, 0, CH); rf.rotation.y = Math.PI / 4; rf.scale.set(1.0, 1, 0.72);
    add(tbox(1.3, 2.2, 1.3, 1), M.white, 2.4, 3.1, 0, CH); const tr = add(new THREE.ConeGeometry(1.05, 1.5, 4), M.roof, 2.4, 4.95, 0, CH); tr.rotation.y = Math.PI / 4;
    add(tbox(0.5, 0.6, 0.06, 1), M.iron, 2.4, 3.4, 0.68, CH); S.bell = add(new THREE.ConeGeometry(0.22, 0.32, 10), M.brass, 2.4, 3.35, 0.5, CH);
    add(tbox(0.08, 0.7, 0.08, 1), M.iron, 2.4, 6.05, 0, CH); add(tbox(0.4, 0.08, 0.08, 1), M.iron, 2.4, 6.15, 0, CH);
    add(tbox(1.0, 1.7, 0.1, 1), M.woodD, -0.6, 0.85, 1.52, CH); add(tbox(0.7, 0.9, 0.1, 1), toon({ color: '#5a7ab0' }), 1.0, 1.9, 1.52, CH);
    // gravestone with flowers in front of the chapel
    const GS = new THREE.Group(); GS.position.set(12.2, 2.95, -2.6); GS.rotation.y = -0.35; BE.add(GS); S.gravePos = [12.2, 2.95, -2.6];
    const gst = toon({ color: '#d8d2c6' }); add(tbox(0.8, 0.85, 0.18, 1), gst, 0, 0.425, 0, GS); add(cyl(0.4, 0.4, 0.18, 18, 1), gst, 0, 0.85, 0, GS).rotation.x = Math.PI / 2; add(tbox(0.06, 0.34, 0.02, 1), toon({ color: '#9a9284' }), 0, 0.72, 0.1, GS); add(tbox(0.22, 0.06, 0.02, 1), toon({ color: '#9a9284' }), 0, 0.8, 0.1, GS);
    const mound = add(new THREE.SphereGeometry(0.6, 14, 8), toon({ color: '#7aaa5c' }), 0, -0.25, 0.7, GS); mound.scale.set(0.9, 0.4, 1.2);
    const fl = [toon({ color: '#e0506a' }), toon({ color: '#f6f0e0' }), toon({ color: '#f2d040' }), toon({ color: '#8ab0e8' })];
    for (let i = 0; i < 14; i++) { const a = i * 2.39, r = 0.15 + (i % 5) * 0.09; add(new THREE.SphereGeometry(0.07, 8, 6), fl[i % 4], Math.cos(a) * r * 0.9, 0.12 + (i % 3) * 0.03, 0.55 + Math.sin(a) * r, GS); }
    S.newFlowers = new THREE.Group(); GS.add(S.newFlowers);
    for (let i = 0; i < 6; i++) { const x = -0.25 + i * 0.1; rope(S.newFlowers, [x, 0, 0.32], [x + 0.02, 0.35, 0.3], 0.012, M.green); add(new THREE.SphereGeometry(0.06, 8, 6), fl[i % 4], x + 0.02, 0.38, 0.3, S.newFlowers); }
    // bushes and a few palms-free coastal shrubs
    for (const [x, z] of [[9, -1], [10.5, 0.5], [19, -3], [7.5, -5]]) add(new THREE.SphereGeometry(0.8, 10, 8), toon({ color: '#5a8a3c' }), x, 0.6 + Math.max(0, 3 - Math.hypot(x - 15, z + 4) * 0.4), z, BE).scale.y = 0.7;
  }

  // =============== EARRING (prop, used on the beach and in the tavern) ===============
  { const RG = new THREE.Group(); world.add(RG); RG.visible = false; S.ring = RG;
    const engr = canvasTex(2048, 256, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#c99a2e'); gr.addColorStop(0.5, '#f6d266'); gr.addColorStop(1, '#b8862a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) { c.strokeStyle = `rgba(255,250,220,${0.08 + (i % 5) * 0.03})`; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 20 + i * 3.6); c.lineTo(w, 22 + i * 3.6); c.stroke(); }
      // engraving: hand-written "Hamburg" and a little ship
      c.save(); c.translate(w * 0.5, h * 0.55); c.font = `italic bold 128px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 6; c.strokeStyle = 'rgba(255,246,200,0.8)'; c.strokeText('Hamburg', 2, 3); c.fillStyle = '#5a3a0c'; c.fillText('Hamburg', 0, 0);
      c.restore();
      c.save(); c.translate(w * 0.5 + 420, h * 0.56); c.strokeStyle = '#5a3a0c'; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(-80, 20); c.lineTo(80, 20); c.lineTo(58, 52); c.lineTo(-58, 52); c.closePath(); c.stroke();
      for (const x of [-30, 20]) { c.beginPath(); c.moveTo(x, 20); c.lineTo(x, -70); c.stroke(); c.beginPath(); c.moveTo(x - 2, -64); c.quadraticCurveTo(x + 40, -40, x - 2, 6); c.stroke(); }
      c.beginPath(); c.moveTo(-110, 72); c.quadraticCurveTo(-80, 60, -50, 72); c.quadraticCurveTo(-20, 84, 10, 72); c.quadraticCurveTo(40, 60, 70, 72); c.quadraticCurveTo(100, 84, 120, 72); c.stroke();
      c.restore();
      c.save(); c.translate(w * 0.5 - 420, h * 0.56); c.strokeStyle = '#5a3a0c'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 40, 0, 7); c.stroke(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; c.beginPath(); c.moveTo(Math.cos(a) * 44, Math.sin(a) * 44); c.lineTo(Math.cos(a) * 62, Math.sin(a) * 62); c.stroke(); } c.restore();
    });
    engr.wrapS = THREE.RepeatWrapping; engr.repeat.set(-3, 1); engr.offset.set(0, 0);
    const R = 1.0, Hh = 0.5;
    add(new THREE.CylinderGeometry(R + 0.12, R + 0.12, Hh, 64, 1, true), toon({ color: '#f2c040', emissive: '#7a5410', emissiveIntensity: 0.45 }), 0, 0, 0, RG);
    const inner = add(new THREE.CylinderGeometry(R, R, Hh, 96, 1, true), new THREE.MeshToonMaterial({ gradientMap: ctx.grad, map: engr, side: THREE.BackSide, emissive: '#5a3a08', emissiveIntensity: 0.35 }), 0, 0, 0, RG);
    for (const y of [-Hh / 2, Hh / 2]) add(new THREE.TorusGeometry(R + 0.06, 0.08, 10, 64), M.gold, 0, y, 0, RG).rotation.x = Math.PI / 2;
    S.ringInner = inner; S.ringEngr = inner.material; S.ringPlain = toon({ color: '#e8b838', side: THREE.BackSide, emissive: '#5a3a08', emissiveIntensity: 0.35 });
  }

  // =============== GUN DECK ===============
  const GD = grp('gun');
  { const fl = add(new THREE.PlaneGeometry(10, 26), texM(P.planks(4), 2, 5, '#9a7050'), 0, 0, -6, GD, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(10, 0.2, 26, 2), M.plankD, 0, 3.05, -6, GD);
    for (let z = 4; z > -18; z -= 1.8) add(tbox(10, 0.3, 0.32, 1.5), M.beam, 0, 2.85, z, GD);
    S.cannons = [];
    for (const s of [-1, 1]) {
      // side wall (hull) with gun ports
      for (let k = 0; k < 6; k++) { const z = 2 - k * 3.2; add(tbox(0.3, 1.3, 2.0, 1.5), M.hull, s * 4.4, 0.65, z - 0.6, GD); add(tbox(0.3, 0.9, 3.2, 1.5), M.hull, s * 4.4, 2.5, z, GD);
        const port = add(tbox(0.12, 0.8, 1.1, 1), toon({ color: '#cfe0f0', emissive: '#a0b8d0', emissiveIntensity: 0.9 }), s * 4.56, 1.65, z + 0.5, GD);
        add(tbox(0.3, 0.8, 0.12, 1), M.woodD, s * 4.4, 1.65, z + 1.1, GD);
        const C = new THREE.Group(); C.position.set(s * 3.2, 0, z + 0.5); C.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; GD.add(C);
        add(tbox(0.9, 0.5, 1.6, 1), M.woodD, 0, 0.45, 0, C); for (const dx of [-0.48, 0.48]) for (const dz of [-0.55, 0.55]) add(cyl(0.22, 0.22, 0.1, 12), M.woodD, dx, 0.22, dz, C).rotation.z = Math.PI / 2;
        const barrel = add(cyl(0.2, 0.3, 2.2, 14), M.iron, 0, 0.95, -0.55, C); barrel.rotation.x = Math.PI / 2; add(new THREE.SphereGeometry(0.3, 12, 8), M.iron, 0, 0.95, 0.55, C);
        add(new THREE.TorusGeometry(0.22, 0.05, 6, 14), M.iron, 0, 0.95, -1.62, C);
        S.cannons.push({ g: C, s, z: z + 0.5, x0: s * 3.2 });
      }
    }
    // shot balls, buckets, rammer, lanterns
    for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.14, 10, 8), M.iron, 1.9 + (i % 3) * 0.3, 0.14 + (i > 2 ? 0.24 : 0), -0.7 + (i > 2 ? 0.15 : 0), GD);
    add(cyl(0.3, 0.26, 0.5, 12), M.wood, -1.9, 0.25, -0.3, GD); add(cyl(0.03, 0.03, 2.6, 6), M.wood, -2.2, 1.3, -1.2, GD).rotation.z = 0.25;
    for (const z of [0, -6, -12]) { add(tbox(0.3, 0.42, 0.3, 1), M.glass, 0, 2.4, z, GD); const L = new THREE.PointLight('#ffb060', 3, 6, 1.6); L.position.set(0, 2.2, z); GD.add(L); }
  }

  // =============== ARCHIVE ===============
  const AR = grp('arch');
  { const fl = add(new THREE.PlaneGeometry(14, 14), texM(P.planks(12), 3, 3, '#8a6448'), 0, 0, 0, AR, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(14, 6, 0.3, 2), M.wall, 0, 3, -3.4, AR); add(tbox(0.3, 6, 10, 2), M.wall, -6, 3, 0, AR); add(tbox(0.3, 6, 10, 2), M.wall, 6, 3, 0, AR);
    const leather = ['#7a2a24', '#2a4a34', '#2c3a5a', '#6a4a24', '#4a2a3a', '#8a5a2a', '#3a3a3a'];
    const rb = P.rng(31);
    // shelves to the ceiling
    for (let sx = -5; sx <= 3.5; sx += 2.6) {
      add(tbox(0.1, 5.6, 0.6, 1), M.woodD, sx - 1.25, 2.8, -2.9, AR); add(tbox(0.1, 5.6, 0.6, 1), M.woodD, sx + 1.25, 2.8, -2.9, AR);
      for (let y = 0.25; y < 5.6; y += 0.9) { add(tbox(2.5, 0.07, 0.6, 1), M.woodD, sx, y, -2.9, AR);
        let x = sx - 1.15; while (x < sx + 1.1) { const w = 0.07 + rb() * 0.09, h = 0.5 + rb() * 0.28; if (rb() < 0.07) { x += 0.15; continue; }
          add(tbox(w, h, 0.42, 1), toon({ color: leather[(rb() * leather.length) | 0] }), x + w / 2, y + 0.035 + h / 2, -2.85, AR); x += w + 0.01; } }
    }
    // dusty leather tomes lying on a low shelf/table, spines with German titles (horizontal, readable)
    const titles = ['Logbuch', 'Seefahrt', 'Häfen der Welt', 'Aberglaube'], cols = ['#6a2a22', '#26442e', '#2a3656', '#5a3a1e'];
    S.tomes = new THREE.Group(); S.tomes.position.set(0.5, 1.07, 0.15); S.tomes.rotation.y = -0.12; AR.add(S.tomes);
    titles.forEach((t, i) => { const h = 0.15, w = 0.62 - i * 0.02, y = i * (h + 0.005) + h / 2;
      const spine = canvasTex(1024, 160, (c, W, H) => { c.fillStyle = cols[i]; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(255,255,255,0.06)'; for (let k = 0; k < 40; k++) c.fillRect((k * 97) % W, (k * 37) % H, 30, 3);
        c.strokeStyle = '#d8b060'; c.lineWidth = 6; for (const x of [40, W - 40]) { c.beginPath(); c.moveTo(x, 10); c.lineTo(x, H - 10); c.stroke(); }
        c.font = `bold ${t.length > 10 ? 74 : 88}px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 8; c.strokeStyle = '#1a0c06'; c.strokeText(t, W / 2, H / 2 + 4); c.fillStyle = '#f0d07a'; c.fillText(t, W / 2, H / 2 + 4); });
      const b = new THREE.Group(); b.position.set((i % 2 ? 0.03 : -0.02), y, 0); b.rotation.y = (i - 1.5) * 0.04; S.tomes.add(b);
      add(tbox(w, h, 0.5, 1), toon({ color: cols[i] }), 0, 0, 0, b); add(tbox(w - 0.04, h - 0.04, 0.48, 1), M.cream, 0, 0, -0.02, b);
      noInk(add(new THREE.PlaneGeometry(w * 0.98, h * 0.96), basic(spine), 0, 0, 0.252, b, { cast: false })); });
    // big desk, open book, green banker's lamp
    add(tbox(3.4, 0.12, 1.5, 1), M.wood, 0, 1.0, -0.5, AR); for (const [x, z] of [[-1.55, -1.1], [1.55, -1.1], [-1.55, 0.1], [1.55, 0.1]]) add(tbox(0.14, 1.0, 0.14, 1), M.woodD, x, 0.5, z, AR);
    const page = canvasTex(512, 640, (c, W, H) => { c.fillStyle = '#efe2c0'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(80,70,60,0.55)'; c.lineWidth = 6; for (let y = 60; y < H - 40; y += 34) { c.beginPath(); c.moveTo(40, y); c.lineTo(W - 40 - (y * 7 % 90), y); c.stroke(); } });
    const pm = toon({ map: page });
    const BK = new THREE.Group(); BK.position.set(-0.3, 1.07, -0.3); AR.add(BK); S.book = BK;
    add(tbox(1.25, 0.06, 0.82, 1), toon({ color: '#5a2a1e' }), 0, 0, 0, BK);
    for (const s of [-1, 1]) { const p = add(new THREE.PlaneGeometry(0.58, 0.76), pm, s * 0.3, 0.045, 0, BK, { cast: false }); p.rotation.x = -Math.PI / 2; p.rotation.y = -s * 0.08; }
    const turn = new THREE.Group(); turn.position.set(0, 0.05, 0); BK.add(turn); S.turnPage = turn; const tp = add(new THREE.PlaneGeometry(0.58, 0.76), toon({ map: page, side: THREE.DoubleSide }), 0.29, 0, 0, turn, { cast: false }); tp.rotation.x = -Math.PI / 2;
    const lamp = new THREE.Group(); lamp.position.set(-1.05, 1.06, -0.9); AR.add(lamp);
    add(cyl(0.18, 0.2, 0.06, 14), M.brass, 0, 0, 0, lamp); add(cyl(0.03, 0.03, 0.55, 8), M.brass, 0, 0.3, 0, lamp);
    const shade = add(new THREE.CylinderGeometry(0.1, 0.32, 0.22, 18, 1, true), toon({ color: '#2a8a4a', emissive: '#145a2a', emissiveIntensity: 0.5, side: THREE.DoubleSide }), 0.08, 0.6, 0, lamp); shade.rotation.z = -0.25;
    add(new THREE.SphereGeometry(0.08, 10, 8), toon({ color: '#fff4c0', emissive: '#ffe080', emissiveIntensity: 1.5 }), 0.1, 0.52, 0, lamp);
    const LL = new THREE.PointLight('#ffe6a0', 5, 6, 1.4); LL.position.set(-1.0, 1.5, -0.6); AR.add(LL);
    const LL2 = new THREE.PointLight('#ffcf90', 2.5, 9, 1.5); LL2.position.set(2.5, 3.5, 1.5); AR.add(LL2);
    // ladder
    for (const x of [3.9, 4.5]) { const r_ = add(tbox(0.08, 5.4, 0.08, 1), M.wood, x, 2.6, -2.35, AR); r_.rotation.x = -0.1; }
    for (let y = 0.4; y < 5; y += 0.45) add(tbox(0.62, 0.05, 0.06, 1), M.wood, 4.2, y, -2.35 + y * 0.1, AR);
  }

  // =============== PORTRAIT GALLERY ===============
  const GA = grp('gal');
  { add(tbox(30, 5, 0.3, 2), texM(P.planks(15), 1, 1, '#8a5a3a'), 6, 2.5, -0.3, GA); const fl = add(new THREE.PlaneGeometry(34, 8), texM(P.planks(16), 6, 2, '#6a4a32'), 6, 0, 3, GA, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(30, 0.12, 0.12, 1), M.woodD, 6, 0.85, -0.12, GA); add(tbox(30, 0.16, 0.16, 1), M.woodD, 6, 3.4, -0.12, GA);
    const sitters = [
      { body: '#2c3a66', detail: ['knit'], beardBig: '#5a3a24', hat: { type: 'beanie', color: '#3a5a8a' } },
      { body: '#7a2a2a', detail: ['buttons', 'collar'], hair: '#2a2228', hairStyle: 'mop', mous: '#2a2228', mousStyle: 'handle', hat: { type: 'bowler', color: '#2a2438' } },
      { body: '#3a5a4a', detail: ['hstripes'], hair: '#c8622a', hairStyle: 'side', goatee: '#c8622a' },
      { body: '#4a3a5a', detail: ['scarf'], hair: '#d8d8dc', hairStyle: 'sides', beardBig: '#e8e6e0', hat: { type: 'top', color: '#2a2438' } },
      { body: '#6a4a24', detail: ['vest'], hair: '#3a2a22', hairStyle: 'short', mous: '#3a2a22', hat: { type: 'flatcap', color: '#4a4a5a', stripes: '#8a8aa0' } },
      { body: '#2a4a6a', detail: ['knit'], hair: '#8a5a2e', hairStyle: 'mop', beardBig: '#8a5a2e', beardLen: 1.1 },
    ];
    const exprs = ['smug', 'neutral', 'happy', 'sly', 'smug', 'neutral'];
    sitters.forEach((sp, i) => {
      const x = i * 1.6, painting = canvasTex(600, 760, (c, W, H) => {
        const bg = c.createRadialGradient(W / 2, H * 0.4, 40, W / 2, H / 2, W * 0.8); bg.addColorStop(0, ['#6a5a3a', '#4a3a2a', '#5a4a30'][i % 3]); bg.addColorStop(1, '#1e140c'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
        T.portrait(c, sp, { expr: exprs[i], earR: i % 2 ? 1 : true, earL: i === 3 ? 1 : 0, turn: [0.15, -0.2, 0.25, 0, -0.15, 0.2][i], twinkle: true }, W, H);
        c.globalCompositeOperation = 'overlay'; const r = P.rng(50 + i); for (let k = 0; k < 900; k++) { c.strokeStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 220 : 0},${r() > 0.5 ? 160 : 0},0.08)`; c.lineWidth = 3 + r() * 4; const x0 = r() * W, y0 = r() * H; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + 14 + r() * 20, y0 + (r() - 0.5) * 10); c.stroke(); }
        c.globalCompositeOperation = 'source-over'; });
      add(tbox(1.42, 1.72, 0.1, 1), M.gold, x, 2.2, -0.08, GA); add(tbox(1.22, 1.52, 0.12, 1), toon({ color: '#b8862a' }), x, 2.2, -0.06, GA);
      noInk(add(new THREE.PlaneGeometry(1.12, 1.42), basic(painting), x, 2.2, 0.005, GA, { cast: false }));
      const plq = canvasTex(1024, 220, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#e8c470'); gr.addColorStop(0.5, '#c89a40'); gr.addColorStop(1, '#a87a2a'); c.fillStyle = gr; c.beginPath(); c.roundRect(4, 4, W - 8, H - 8, 22); c.fill();
        c.strokeStyle = '#6a4a14'; c.lineWidth = 8; c.beginPath(); c.roundRect(20, 20, W - 40, H - 40, 14); c.stroke(); for (const x of [46, W - 46]) { c.fillStyle = '#6a4a14'; c.beginPath(); c.arc(x, H / 2, 10, 0, 7); c.fill(); }
        c.font = `bold 70px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2e1c06'; c.fillText('Unbekannter Seemann', W / 2, H / 2 + 6); });
      add(tbox(0.98, 0.23, 0.04, 1), M.brass, x, 1.17, -0.1, GA); noInk(add(new THREE.PlaneGeometry(0.94, 0.2), basic(plq), x, 1.17, -0.075, GA, { cast: false }));
      add(tbox(0.5, 0.06, 0.18, 1), M.brass, x, 3.12, 0.02, GA);
      const L = new THREE.PointLight('#ffd8a0', 2.2, 3.2, 1.6); L.position.set(x, 3.0, 0.6); GA.add(L);
    });
  }
};

// ------------------------------------------------------------------ per-frame
export const update = (ctx, W, f) => {
  for (const k of ['tav', 'sea', 'beach', 'gun', 'arch', 'gal']) S[k].visible = W.set === k;
  const t = f / 30;
  if (W.set === 'tav') {
    S.sign.rotation.x = Math.sin(t * 2.1) * 0.12 + Math.sin(t * 3.7) * 0.04;
    S.lantern.rotation.z = Math.sin(t * 1.3) * 0.06; S.lantern.rotation.x = Math.sin(t * 0.9) * 0.04;
  }
  if (W.set === 'sea') {
    const st = W.storm || 0, amp = 0.15 + st * 1.6, pa = S.ocean.geometry.attributes.position, b = S.oceanBase;
    S.ocean.visible = st > 0.05; S.calm.visible = st <= 0.05;
    for (let i = 0; i < pa.count; i++) { const x = b[i * 3], z = b[i * 3 + 2];
      const h = Math.sin(x * 0.09 + t * 1.3) * 1.0 + Math.sin(z * 0.13 - t * 1.1 + x * 0.05) * 0.7 + Math.sin((x + z) * 0.31 + t * 2.4) * 0.28 + Math.sin(x * 0.7 - z * 0.4 + t * 3.1) * 0.08;
      const d = Math.hypot(x, z), calmNear = Math.min(1, Math.max(0.35, (d - 6) / 18)); pa.setY(i, h * amp * calmNear); }
    pa.needsUpdate = true; S.ocean.geometry.computeVertexNormals();
    S.oceanMat.color.set(W.seaCol || '#2e5a5a');
    S.ship.rotation.x = Math.sin(t * 0.9) * (0.015 + st * 0.07) + (W.heel || 0); S.ship.rotation.z = Math.sin(t * 0.7 + 1) * (0.008 + st * 0.03); S.ship.position.y = Math.sin(t * 1.1) * (0.05 + st * 0.4) + (W.shipY || 0);
    S.ship.rotation.y = W.shipYaw || 0;
    S.eq.visible = !!W.equator; S.rocks.visible = !!W.rocks; S.isl.visible = !W.rocks && st < 0.3;
    for (const sl of S.sails) { const pa2 = sl.geometry.attributes.position, b2 = sl.userData.base; const bil = 0.5 + st * 0.6 + Math.sin(t * 2 + sl.position.y) * 0.08 * (1 + st * 3);
      for (let i = 0; i < pa2.count; i++) { const x = b2[i * 3], y = b2[i * 3 + 1]; pa2.setZ(i, bil * (1 - (x / 4.6) ** 2) * (0.6 + 0.4 * (1 - Math.abs(y) / 2))); } pa2.needsUpdate = true; }
    const fp = S.flag.geometry.attributes.position, fb = S.flagBase; for (let i = 0; i < fp.count; i++) { const x = fb[i * 3]; fp.setZ(i, Math.sin(x * 3 - t * (6 + st * 8)) * 0.12 * (x + 0.8)); } fp.needsUpdate = true;
  }
  if (W.set === 'beach') {
    for (const [k, fm] of S.foam.entries()) { const pa = fm.geometry.attributes.position, b = fm.userData.base; const adv = Math.sin(t * 0.8 + k * 1.6) * 0.5; for (let i = 0; i < pa.count; i++) pa.setY(i, b[i * 3 + 1] + adv + Math.sin(b[i * 3] * 0.6 + t + k) * 0.15); pa.needsUpdate = true; }
    S.newFlowers.visible = (W.flowers ?? 1) > 0.5;
    S.bell.rotation.z = Math.sin(t * 3) * 0.25 * (W.bell || 0);
  }
  if (W.set === 'gun') for (const c of S.cannons) { const r = c.s > 0 && Math.abs(c.z - (W.fireZ ?? 99)) < 0.2 ? (W.recoil || 0) : 0; c.g.position.x = c.x0 - c.s * r * 0.9; }
  if (W.set === 'arch') { S.turnPage.rotation.z = (W.page || 0) * Math.PI; }
  // earring prop
  S.ring.visible = !!W.ring; if (W.ring) { const r = W.ring; S.ringInner.material = r.plain ? S.ringPlain : S.ringEngr; S.ring.position.set(...r.p); S.ring.rotation.set(r.rx || 0, r.ry || 0, r.rz || 0); S.ring.scale.setScalar(r.s || 0.1); }
};
export const scene = S;
