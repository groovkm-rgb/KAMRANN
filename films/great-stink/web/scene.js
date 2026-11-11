// scene.js: Der große Gestank (London 1858). Every location is its own group around the origin;
// update() shows only the groups named in worldAt(f).loc. Nothing in this world carries text or digits.
let S = {};
export const build = (ctx) => {
  const { THREE, P, world, add, tbox, toon, texM, canvasTex, addClouds, waterMat } = ctx;
  const G = (name) => { const g = new THREE.Group(); g.name = name; world.add(g); (S.loc = S.loc || {})[name] = g; return g; };
  const rt = P.rng(1858);
  // ---------- materials ----------
  const brickC = P.stone(31, 12, 52, 46, 64, 28), brickD = P.stone(32, 8, 40, 36, 64, 28), brickY = P.stone(33, 30, 34, 58, 64, 28);
  const M = {
    brick: texM(brickC, 1, 1), brickD: texM(brickD, 1, 1), brickY: texM(brickY, 1, 1),
    cobble: texM(P.stone(21, 32, 12, 52, 48, 40), 20, 20), sand: texM(P.stone(41, 38, 28, 70, 128, 64), 1, 1), stoneG: texM(P.stone(42, 30, 8, 62, 128, 64), 1, 1),
    roof: texM(P.roof(9), 2, 2), slate: toon({ color: '#5a5a66' }), dark: toon({ color: '#2a2630' }), win: toon({ color: '#33384e' }), winLit: toon({ color: '#ffd890', emissive: '#ffc060', emissiveIntensity: 0.6 }),
    frame: toon({ color: '#efe6d2' }), iron: toon({ color: '#2c2a30' }), ironG: toon({ color: '#3a4a3e' }), wood: texM(P.planks(3), 1, 2), woodD: toon({ color: '#5a3622' }),
    panel: texM(P.planks(5), 2, 1, '#9a6a44'), leather: toon({ color: '#3f7a4a' }), leatherD: toon({ color: '#2e5c38' }), red: toon({ color: '#a8282e' }), curtain: toon({ color: '#9a2a30', side: THREE.DoubleSide }),
    gold: toon({ color: '#e2b84c' }), lampG: toon({ color: '#ffe6a0', emissive: '#ffcf70', emissiveIntensity: 1.5 }), white: toon({ color: '#f4f4ee' }), milk: toon({ color: '#f8f8f0', emissive: '#ffffff', emissiveIntensity: 0.15 }),
    dome: toon({ color: '#b0a690' }), domeG: toon({ color: '#7a9a8a' }), ground: texM(P.dirt(7), 30, 30, '#c8a878'), grass: texM(P.grass(6), 30, 30, '#c8d890'), grassF: texM(P.grass(16), 20, 20),
    bus: toon({ color: '#d42a2a' }), taxi: toon({ color: '#1a1a20' }), glass: toon({ color: '#6a8ab0' }), asphalt: texM(P.stone(51, 230, 6, 30, 256, 256), 20, 20), walk: texM(P.stone(52, 30, 6, 66, 128, 128), 10, 10),
    tire: toon({ color: '#1a1a1c' }), led: toon({ color: '#ffffff', emissive: '#e8f4ff', emissiveIntensity: 1.6 }), boot: toon({ color: '#4a3424' }), bottle: toon({ color: '#3a6a3a' }), plank: toon({ color: '#8a6a44' }),
    metal: toon({ color: '#8a94a0' }), shine: toon({ color: '#c8d4e0', emissive: '#a0b0c0', emissiveIntensity: 0.3 }), scaffold: toon({ color: '#9a7448' }),
  };
  S.M = M;
  // house wall texture: brick + windows (4 m x 4 m tile, 2 windows)
  const houseTex = (base, seed, lit = false) => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.drawImage(base, 0, 0); const r = P.rng(seed);
    for (const x of [78, 334]) { g.fillStyle = '#efe6d2'; g.fillRect(x - 8, 120, 116, 236); g.fillStyle = lit && r() < 0.3 ? '#f2c870' : '#2e3346'; g.fillRect(x, 128, 100, 220);
      g.fillStyle = '#efe6d2'; g.fillRect(x + 46, 128, 8, 220); g.fillRect(x, 230, 100, 8); g.fillStyle = '#d8ccb0'; g.fillRect(x - 16, 356, 132, 18); }
    return toon({ map: P.tex(c, 1, 1) }); };
  const HW = [houseTex(brickC, 1), houseTex(brickD, 2), houseTex(brickY, 3)];
  const uvBox = (w, h, d, t) => tbox(w, h, d, t);

  // =====================================================================
  // M1  CITY SKYLINE (wide, from above)
  // =====================================================================
  const city = G('city');
  { const g0 = add(new THREE.PlaneGeometry(1600, 1600), M.ground, 0, -0.05, 0, city, { cast: false }); g0.rotation.x = -Math.PI / 2; }
  const riverX = (z) => 26 * Math.sin(z / 70) + 8 * Math.sin(z / 23);
  { // river ribbon
    const pos = [], idx = []; const N = 120, W2 = 22;
    for (let i = 0; i <= N; i++) { const z = 260 - i * 7, x = riverX(z); pos.push(x - W2, 0.05, z, x + W2, 0.05, z); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const rv = new THREE.Mesh(geo, waterMat); rv.userData.nd = ctx.waterNd; city.add(rv);
    // embankments
    for (let i = 0; i < N; i += 2) { const z = 260 - i * 7, x = riverX(z); for (const s of [-1, 1]) add(tbox(2, 2, 14.5, 2), M.stoneG, x + s * (W2 + 1), 0.6, z - 3.5, city, { cast: false }); }
  }
  // houses on both banks
  const chimneys = [];
  for (let i = 0; i < 230; i++) {
    const z = 220 - rt() * 560, side = rt() < 0.5 ? -1 : 1, x = riverX(z) + side * (30 + rt() * 150);
    if (Math.abs(x - riverX(z)) < 28) continue;
    const w = 8 + rt() * 10, d = 8 + rt() * 8, h = 9 + rt() * 12, mat = HW[i % 3];
    const hg = new THREE.Group(); hg.position.set(x, 0, z); hg.rotation.y = (rt() - 0.5) * 0.3; city.add(hg);
    add(tbox(w, h, d, 4), mat, 0, h / 2, 0, hg, { cast: false });
    const rf = add(new THREE.CylinderGeometry(0.01, Math.max(w, d) * 0.72, 4, 4, 1), M.roof, 0, h + 2, 0, hg, { cast: false }); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
    if (i % 2 === 0) { add(tbox(1.2, 4, 1.2, 1), M.brickD, w * 0.3, h + 2.6, 0, hg, { cast: false }); chimneys.push([x + w * 0.3, h + 4.8, z]); }
  }
  S.chimneys = chimneys;
  // domed cathedral (invented)
  { const cg = new THREE.Group(); cg.position.set(-70, 0, -120); city.add(cg);
    add(tbox(40, 18, 26, 4), M.sand, 0, 9, 0, cg); add(tbox(22, 22, 50, 4), M.sand, 0, 11, 0, cg);
    add(new THREE.CylinderGeometry(13, 13, 12, 28), M.sand, 0, 27, 0, cg);
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; add(new THREE.CylinderGeometry(0.6, 0.6, 11, 8), M.frame, Math.cos(a) * 13.6, 27, Math.sin(a) * 13.6, cg); }
    const dm = add(new THREE.SphereGeometry(12.5, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), M.domeG, 0, 33, 0, cg); dm.scale.y = 1.25;
    add(new THREE.CylinderGeometry(2.2, 2.6, 6, 12), M.sand, 0, 51, 0, cg); add(new THREE.ConeGeometry(2.4, 5, 12), M.gold, 0, 56.5, 0, cg);
    for (const s of [-1, 1]) { add(tbox(7, 26, 7, 3), M.sand, s * 14, 13, 26, cg); add(new THREE.ConeGeometry(4.5, 8, 4), M.domeG, s * 14, 30, 26, cg).rotation.y = Math.PI / 4; }
  }
  // stone bridges
  for (const bz of [60, -60, -210]) { const x = riverX(bz); const bg = new THREE.Group(); bg.position.set(x, 0, bz); city.add(bg);
    add(tbox(64, 1.6, 9, 3), M.stoneG, 0, 5, 0, bg); for (let k = -2; k <= 2; k++) add(tbox(3, 5, 9.4, 3), M.stoneG, k * 11, 2.2, 0, bg);
    for (const s of [-1, 1]) add(tbox(64, 1, 0.6, 2), M.stoneG, 0, 6.2, s * 4.2, bg); }
  addClouds(10, 77, 700, 140);

  // =====================================================================
  // M2  HOT STREET (+ pump corner for the germ pipe)
  // =====================================================================
  const street = G('street');
  { const g0 = add(new THREE.PlaneGeometry(9, 120), M.cobble, 0, 0, -30, street, { cast: false }); g0.rotation.x = -Math.PI / 2;
    for (const s of [-1, 1]) { const sw = add(tbox(1.6, 0.18, 120, 2), M.stoneG, s * 5.2, 0.09, -30, street); } }
  const rowHouse = (parent, x, z, w, h, mat, face) => { // face: +1 = front faces +x, -1 faces -x
    const hg = new THREE.Group(); hg.position.set(x, 0, z); hg.rotation.y = face > 0 ? Math.PI / 2 : -Math.PI / 2; parent.add(hg);
    add(tbox(w, h, 5, 4), mat, 0, h / 2, -2.5, hg);
    add(tbox(w + 0.1, 0.3, 0.3, 1), M.frame, 0, h - 0.2, 0.1, hg); add(tbox(w + 0.1, 0.25, 0.25, 1), M.frame, 0, 3.1, 0.05, hg);
    add(tbox(1.3, 2.4, 0.2, 1), M.woodD, -w * 0.25, 1.2, 0.05, hg); add(tbox(1.6, 0.18, 0.5, 1), M.stoneG, -w * 0.25, 0.09, 0.3, hg);
    const rf = add(tbox(w + 0.4, 0.4, 5.6, 2), M.slate, 0, h + 0.2, -2.6, hg);
    add(tbox(0.9, 2.2, 0.9, 1), M.brickD, w * 0.3, h + 1.2, -3.5, hg);
    return hg;
  };
  for (let k = 0; k < 9; k++) { const z = 8 - k * 7.2, h = 8.5 + (k * 1.7) % 3; rowHouse(street, -6, z, 7, h, HW[k % 3], 1); rowHouse(street, 6, z - 2.4, 7, h + ((k * 0.9) % 2), HW[(k + 1) % 3], -1); }
  // gas lamps
  const gasLamp = (parent, x, z, h = 3.6) => { add(new THREE.CylinderGeometry(0.07, 0.11, h, 8), M.iron, x, h / 2, z, parent); add(tbox(0.42, 0.5, 0.42, 1), M.iron, x, h + 0.25, z, parent);
    add(tbox(0.3, 0.36, 0.3, 1), M.lampG, x, h + 0.25, z, parent, { cast: false }); add(new THREE.ConeGeometry(0.34, 0.3, 4), M.iron, x, h + 0.62, z, parent).rotation.y = Math.PI / 4; add(tbox(0.6, 0.06, 0.06, 1), M.iron, x, h - 0.3, z, parent); };
  for (const [x, z] of [[-4.2, 2], [4.2, -6], [-4.2, -16], [4.2, -26], [-4.2, -36]]) gasLamp(street, x, z);
  // pump corner (germ pipe destination) + cutaway pipe channel
  const pump = new THREE.Group(); pump.position.set(-3.2, 0, -2); street.add(pump); S.pump = pump;
  add(tbox(1.6, 0.25, 1.2, 1), M.stoneG, 0, 0.12, 0, pump); add(new THREE.CylinderGeometry(0.22, 0.28, 1.8, 12), M.ironG, 0, 1.1, 0, pump);
  add(new THREE.SphereGeometry(0.28, 12, 8), M.ironG, 0, 2.05, 0, pump); const spout = add(new THREE.CylinderGeometry(0.07, 0.09, 0.6, 8), M.ironG, 0.3, 1.45, 0, pump); spout.rotation.z = Math.PI / 2.4;
  const handle = new THREE.Group(); handle.position.set(-0.1, 1.85, 0); pump.add(handle); add(tbox(0.9, 0.08, 0.08, 1), M.ironG, -0.45, 0, 0, handle); add(new THREE.SphereGeometry(0.07, 8, 6), M.ironG, -0.9, 0, 0, handle); S.pumpHandle = handle;
  add(new THREE.CylinderGeometry(0.22, 0.18, 0.36, 12, 1, true), M.wood, 0.62, 0.4, 0, pump);
  const pipe = new THREE.Group(); pipe.position.set(-3.2, 0, -2); street.add(pipe); S.pipe = pipe;
  { const L = 22; const half = add(new THREE.CylinderGeometry(0.42, 0.42, L, 20, 1, true, -Math.PI / 2, Math.PI), toon({ color: '#6a6a74', side: THREE.DoubleSide }), 0, 0.3, L / 2 + 0.6, pipe); half.rotation.x = Math.PI / 2;
    const wtr = add(new THREE.PlaneGeometry(0.76, L), toon({ color: '#6a7a3a' }), 0, 0.12, L / 2 + 0.6, pipe, { cast: false }); wtr.rotation.x = -Math.PI / 2; S.pipeWater = wtr;
    for (let k = 0; k < 6; k++) add(new THREE.TorusGeometry(0.43, 0.05, 6, 20, Math.PI), M.iron, 0, 0.3, 1 + k * 4, pipe).rotation.set(0, 0, Math.PI); }
  add(new THREE.CylinderGeometry(0.42, 0.42, 1.4, 16), toon({ color: '#5a5a62' }), -3.2, 0.3, -1.2, street).rotation.x = Math.PI / 2;
  pipe.visible = false;
  S.pumpClone = pump;
  // thermometer peg on the wall
  add(tbox(0.06, 1.5, 0.6, 1), M.woodD, -5.97, 1.65, 3.0, street);

  // =====================================================================
  // M3/M4  RIVER + PARLIAMENT (river along x; we stand on the near bank z>0)
  // =====================================================================
  const river = G('river');
  { const w = add(new THREE.PlaneGeometry(600, 46), waterMat, 0, -2.2, -2, river, { cast: false }); w.rotation.x = -Math.PI / 2; w.userData.nd = ctx.waterNd;
    // near embankment (top y=0) & promenade
    add(tbox(600, 3, 2, 2), M.stoneG, 0, -1.5, 22, river); const pr = add(new THREE.PlaneGeometry(600, 30), M.cobble, 0, 0, 36, river, { cast: false }); pr.rotation.x = -Math.PI / 2;
    for (let x = -60; x <= 60; x += 2.5) add(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), M.iron, x, 0.5, 21.6, river); add(tbox(122, 0.08, 0.08, 1), M.iron, 0, 1.0, 21.6, river);
    // far embankment
    add(tbox(600, 5, 3, 2), M.brickD, 0, -0.5, -26, river); const fq = add(new THREE.PlaneGeometry(600, 60), M.cobble, 0, 2, -57, river, { cast: false }); fq.rotation.x = -Math.PI / 2;
    // outfall pipes in the far wall
    S.pipes = [];
    for (const x of [-4, 6, 14, 26, 40]) { const pp = add(new THREE.CylinderGeometry(0.6, 0.6, 2.2, 14), M.iron, x, 0.2, -23.6, river); pp.rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.62, 0.12, 6, 16), M.iron, x, 0.2, -22.5, river); S.pipes.push([x, 0.2, -22.4]); }
    // near-wall pipes too (for close pours)
    for (const x of [-2, 9]) { const pp = add(new THREE.CylinderGeometry(0.35, 0.35, 1.4, 12), M.iron, x, -0.9, 21.4, river); pp.rotation.x = Math.PI / 2; }
    // warehouses and factory on the far quay (x > 0)
    for (let k = 0; k < 8; k++) { const x = 4 + k * 11, h = 9 + (k * 3.3) % 7; add(tbox(10, h, 10, 4), HW[k % 3], x, 2 + h / 2, -34, river); add(tbox(10.4, 0.6, 10.4, 2), M.slate, x, 2 + h + 0.3, -34, river); }
    { const fx = 30; add(tbox(16, 12, 12, 4), M.brickD, fx, 8, -46, river); for (const dx of [-4, 3]) add(new THREE.CylinderGeometry(1.0, 1.4, 22, 12), M.brick, fx + dx, 19, -48, river); S.factory = [[fx - 4, 30, -48], [fx + 3, 30, -48]]; }
    // a cart on the far quay tipping a barrel
    const cart = new THREE.Group(); cart.position.set(18, 2, -25.5); river.add(cart); S.cart = cart;
    add(tbox(2.4, 0.3, 1.4, 1), M.wood, 0, 0.9, 0, cart); for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 14), M.woodD, 0, 0.6, s * 0.75, cart).rotation.x = Math.PI / 2;
    const barrel = add(new THREE.CylinderGeometry(0.42, 0.42, 1.0, 12), M.woodD, 0.3, 1.55, 0, cart); S.barrel = barrel;
  }
  // floating junk
  S.junk = [];
  const junk = (kind, x, z, s = 2.2) => { const j = new THREE.Group(); j.position.set(x, -2.15, z); river.add(j); j.scale.setScalar(s);
    if (kind === 'boot') { add(tbox(0.36, 0.5, 0.3, 1), M.boot, 0, 0.2, 0, j); add(tbox(0.7, 0.2, 0.32, 1), M.boot, 0.17, -0.05, 0, j); }
    else if (kind === 'plank') add(tbox(2.2, 0.12, 0.4, 1), M.plank, 0, 0, 0, j).rotation.y = 0.4;
    else { const b = add(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 10), M.bottle, 0, 0.05, 0, j); b.rotation.z = Math.PI / 2.3; add(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8), M.bottle, 0.36, 0.2, 0, j).rotation.z = Math.PI / 2.3; }
    S.junk.push({ j, x, z, ph: rt() * 6 }); };
  [['boot', -1, 12], ['plank', 4, 8], ['bottle', 1.5, 15], ['boot', 7, 4], ['plank', -5, 2], ['bottle', -3, 17], ['bottle', 9, 13], ['boot', -8, 9], ['plank', 12, 16], ['bottle', -10, 5], ['plank', -14, 14], ['boot', 15, 10]].forEach(([k, x, z]) => junk(k, x, z));
  // ---- parliament (invented gothic) on the far bank, x < 0 ----
  const parl = new THREE.Group(); parl.position.set(-46, 2, -36); river.add(parl); S.parl = parl;
  const facade = canvasTex(1024, 1024, (g, w, h) => { const b = P.stone(61, 38, 30, 70, 128, 64); g.drawImage(b, 0, 0, w, h);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 3; r++) { const x = 40 + c * 250, y = 90 + r * 320; g.fillStyle = '#e8d8b0'; g.fillRect(x - 14, y - 60, 188, 300);
      g.fillStyle = '#3a3e52'; g.beginPath(); g.moveTo(x, y + 220); g.lineTo(x, y + 30); g.quadraticCurveTo(x + 4, y - 30, x + 80, y - 46); g.quadraticCurveTo(x + 156, y - 30, x + 160, y + 30); g.lineTo(x + 160, y + 220); g.fill();
      g.strokeStyle = '#e8d8b0'; g.lineWidth = 10; g.beginPath(); g.moveTo(x + 80, y - 40); g.lineTo(x + 80, y + 220); g.moveTo(x, y + 100); g.lineTo(x + 160, y + 100); g.stroke();
      g.fillStyle = '#c8b48a'; g.fillRect(x + 186, y - 80, 30, 320); } });
  const facM = toon({ map: facade }); facade.wrapS = facade.wrapT = THREE.RepeatWrapping; facade.repeat.set(4, 1);
  { const bw = 70, bh = 20, bd = 12; const body = add(new THREE.BoxGeometry(bw, bh, bd), [facM, facM, M.slate, M.sand, facM, facM], 0, bh / 2, 0, parl);
    add(tbox(bw + 1, 1, bd + 1, 2), M.sand, 0, bh + 0.5, 0, parl);
    for (let k = 0; k <= 20; k++) { const x = -bw / 2 + k * bw / 20; add(tbox(0.9, bh + 3, 0.9, 1), M.sand, x, (bh + 3) / 2, bd / 2 + 0.4, parl); add(new THREE.ConeGeometry(0.7, 3.4, 4), M.sand, x, bh + 4.6, bd / 2 + 0.4, parl).rotation.y = Math.PI / 4; }
    const rfg = add(new THREE.CylinderGeometry(0.01, bd * 0.75, 6, 4, 1), M.slate, 0, bh + 3, 0, parl); rfg.rotation.y = Math.PI / 4; rfg.scale.set(bw / bd, 1, 1);
    // central tower
    add(tbox(10, 36, 10, 4), M.sand, -10, 18, -2, parl); add(new THREE.ConeGeometry(6.4, 10, 4), M.slate, -10, 41, -2, parl).rotation.y = Math.PI / 4;
    // clock tower at the river end (+x side of the building)
    const ct = new THREE.Group(); ct.position.set(bw / 2 + 5, 0, 2); parl.add(ct); S.clockTower = ct;
    add(tbox(9, 52, 9, 4), M.sand, 0, 26, 0, ct); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(1, 56, 1, 1), M.sand, sx * 4.6, 28, sz * 4.6, ct);
    add(tbox(10.4, 12, 10.4, 4), M.sand, 0, 47, 0, ct); add(tbox(9.2, 6, 9.2, 2), M.gold, 0, 56, 0, ct); add(new THREE.ConeGeometry(6.8, 16, 4), M.slate, 0, 67, 0, ct).rotation.y = Math.PI / 4;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.ConeGeometry(0.8, 4, 4), M.gold, sx * 4.8, 61, sz * 4.8, ct);
    const face = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#c8b48a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e2b84c'; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill();
      g.fillStyle = '#f6f0e0'; g.beginPath(); g.arc(256, 256, 224, 0, 7); g.fill(); g.strokeStyle = '#2a2430'; g.lineWidth = 10; g.beginPath(); g.arc(256, 256, 224, 0, 7); g.stroke();
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; g.lineWidth = k % 3 ? 8 : 16; g.beginPath(); g.moveTo(256 + Math.cos(a) * 200, 256 + Math.sin(a) * 200); g.lineTo(256 + Math.cos(a) * 168, 256 + Math.sin(a) * 168); g.stroke(); }
      g.strokeStyle = 'rgba(80,60,40,.35)'; g.lineWidth = 3; for (let k = 0; k < 12; k++) { const a = (k + 0.5) / 12 * Math.PI * 2; g.beginPath(); g.moveTo(256 + Math.cos(a) * 160, 256 + Math.sin(a) * 160); g.lineTo(256 + Math.cos(a) * 60, 256 + Math.sin(a) * 60); g.stroke(); } });
    const faceM = new THREE.MeshBasicMaterial({ map: face }); S.hands = [];
    for (const [rx, ry] of [[0, 0], [0, Math.PI / 2]]) { const fg = new THREE.Group(); fg.rotation.y = ry; fg.position.set(0, 47, 0); ct.add(fg); const fp = add(new THREE.PlaneGeometry(8, 8), faceM, 0, 0, 5.25, fg, { cast: false }); fp.userData.ndSkip = true;
      const hh = new THREE.Group(); hh.position.set(0, 0, 5.35); fg.add(hh); const hr = new THREE.Group(); hh.add(hr); add(tbox(0.45, 2.3, 0.08, 1), M.iron, 0, 1.0, 0, hr);
      const mn = new THREE.Group(); hh.add(mn); add(tbox(0.3, 3.3, 0.08, 1), M.iron, 0, 1.5, 0.06, mn); add(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10), M.iron, 0, 0, 0.1, hh).rotation.x = Math.PI / 2; S.hands.push([hr, mn]); }
  }
  { const p2 = S.pumpClone.clone(true); p2.position.set(2.9, 0, 28.6); p2.traverse((m) => { if (m.isMesh && m.material === M.ironG) m.material = M.shine; }); river.add(p2); S.pump2 = p2; }
  // flowers / grass strip on the near promenade
  { const gs = add(new THREE.PlaneGeometry(40, 3), M.grassF, -4, 0.02, 25.5, river, { cast: false }); gs.rotation.x = -Math.PI / 2; }
  addClouds(0);

  // =====================================================================
  // M5  PARLIAMENT CHAMBER (interior). Long axis = z, aisle at x = 0
  // =====================================================================
  const hall = G('hall');
  { const L = 26, Wd = 16, Hh = 13;
    const fl = add(new THREE.PlaneGeometry(Wd, L), texM(P.planks(7), 4, 6, '#a07048'), 0, 0, 0, hall, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const cl = add(new THREE.PlaneGeometry(Wd, L), M.woodD, 0, Hh, 0, hall, { cast: false }); cl.rotation.x = Math.PI / 2;
    // paneled lower walls + upper plaster with tall windows
    for (const s of [-1, 1]) { add(tbox(0.4, 5, L, 2), M.panel, s * Wd / 2, 2.5, 0, hall); add(tbox(0.4, Hh - 5, L, 4), M.sand, s * Wd / 2, 5 + (Hh - 5) / 2, 0, hall);
      for (let k = 0; k < 5; k++) { const z = -10 + k * 5; add(tbox(0.2, 5.6, 2.2, 1), toon({ color: '#fff4d8', emissive: '#ffe8b0', emissiveIntensity: 0.7 }), s * (Wd / 2 - 0.25), 8.4, z, hall, { cast: false });
        for (const dz of [-0.8, 0.8]) add(tbox(0.15, 5.6, 0.12, 1), M.iron, s * (Wd / 2 - 0.36), 8.4, z + dz * 0.5, hall);
        // heavy curtains
        for (const dz of [-1, 1]) { const c = add(tbox(0.18, 6.2, 0.9, 1), M.curtain, s * (Wd / 2 - 0.5), 8.2, z + dz * 1.3, hall); S.curt = S.curt || []; S.curt.push(c); }
        add(tbox(0.3, 0.3, 3.6, 1), M.gold, s * (Wd / 2 - 0.5), 11.4, z, hall); } }
    add(tbox(Wd, Hh, 0.4, 4), M.panel, 0, Hh / 2, -L / 2, hall); add(tbox(Wd, Hh, 0.4, 4), M.panel, 0, Hh / 2, L / 2, hall);
    // door + buckets of chlorinated lime (white liquid) at the far end
    add(tbox(2.4, 3.8, 0.2, 1), M.woodD, 3, 1.9, -L / 2 + 0.25, hall); add(tbox(2.8, 0.3, 0.3, 1), M.gold, 3, 3.9, -L / 2 + 0.3, hall);
    S.buckets = [];
    for (const [x, z] of [[-1.2, -9.6], [-0.2, -10.3], [0.9, -9.4], [5.6, -9.8], [6.4, -8.9]]) { add(new THREE.CylinderGeometry(0.34, 0.27, 0.62, 14, 1, true), toon({ color: '#8a6a44', side: THREE.DoubleSide }), x, 0.31, z, hall);
      add(new THREE.CircleGeometry(0.32, 16), M.milk, x, 0.5, z, hall).rotation.x = -Math.PI / 2; add(new THREE.TorusGeometry(0.34, 0.03, 4, 16), M.iron, x, 0.6, z, hall).rotation.x = Math.PI / 2; S.buckets.push([x, z]); }
    // tiered green benches both sides of the aisle
    for (const s of [-1, 1]) for (let tier = 0; tier < 3; tier++) { const x = s * (2.6 + tier * 1.6), y = tier * 0.45;
      add(tbox(1.6, 0.45 + y, 16, 2), M.woodD, x, (0.45 + y) / 2, 1.5, hall); add(tbox(1.1, 0.22, 16, 2), M.leather, x - s * 0.15, 0.56 + y, 1.5, hall); add(tbox(0.2, 0.7, 16, 2), M.leatherD, x + s * 0.65, 0.9 + y, 1.5, hall); }
    // speaker's chair at the near end, table with the papers in the aisle
    add(tbox(2.2, 3.2, 1.2, 1), M.woodD, 0, 1.6, 11.5, hall); add(tbox(2.6, 0.4, 1.4, 1), M.gold, 0, 3.4, 11.5, hall);
    add(tbox(1.6, 0.9, 3.4, 1), M.woodD, 0, 0.45, 2.5, hall); add(tbox(1.8, 0.08, 3.6, 1), M.leatherD, 0, 0.92, 2.5, hall);
    // chandeliers
    for (const z of [-6, 2, 9]) { add(new THREE.CylinderGeometry(0.03, 0.03, 3, 6), M.iron, 0, Hh - 1.5, z, hall); add(new THREE.TorusGeometry(0.9, 0.06, 6, 20), M.gold, 0, Hh - 3, z, hall).rotation.x = Math.PI / 2; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; add(tbox(0.12, 0.2, 0.12, 1), M.lampG, Math.cos(a) * 0.9, Hh - 2.85, z + Math.sin(a) * 0.9, hall, { cast: false }); } }
  }

  // =====================================================================
  // M6  MICROSCOPE VIEW (a little murky water world in front of a lens)
  // =====================================================================
  const micro = G('micro');
  { const bgT = canvasTex(1024, 1024, (g, w, h) => { const r = P.rng(5); const gr = g.createRadialGradient(512, 512, 40, 512, 512, 620); gr.addColorStop(0, '#d8e6a0'); gr.addColorStop(0.6, '#a8c070'); gr.addColorStop(1, '#6a8a44'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(90,120,50,${0.2 + r() * 0.3})`; g.lineWidth = 3 + r() * 6; g.beginPath(); const x = r() * w, y = r() * h; g.ellipse(x, y, 20 + r() * 60, 12 + r() * 30, r() * 3, 0, 7); g.stroke(); }
      for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(250,255,220,${r() * 0.5})`; g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 6, 0, 7); g.fill(); } });
    const bg = add(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ map: bgT }), 0, 1.5, -2.5, micro, { cast: false }); bg.userData.ndSkip = true; }

  // =====================================================================
  // M7 / M9a  SEWER TUNNEL (along -z). arch centre at y = 1.6
  // =====================================================================
  const tun = G('tunnel'); S.tunnel = tun;
  { const R = 4, L = 160, z0 = -18; // finished vault from z0 to z0-L
    const vault = add(new THREE.CylinderGeometry(R, R, L, 36, 1, true, Math.PI / 2, Math.PI), texM(brickC, 7, 48, '#e8b8a0'), 0, 1.6, z0 - L / 2, tun); vault.rotation.x = Math.PI / 2; vault.material.side = THREE.DoubleSide;
    for (const s of [-1, 1]) add(tbox(0.6, 1.6, L + 30, 2), M.brick, s * (R + 0.3), 0.8, z0 - L / 2 + 15, tun);
    for (const s of [-1, 1]) add(tbox(2.2, 0.3, L + 30, 2), M.brickD, s * 2.75, -0.15, z0 - L / 2 + 15, tun);
    add(tbox(3.3, 0.3, L + 30, 2), M.brickD, 0, -1.25, z0 - L / 2 + 15, tun); for (const s of [-1, 1]) add(tbox(0.2, 1.1, L + 30, 2), M.brickD, s * 1.65, -0.65, z0 - L / 2 + 15, tun);
    // ribs every 6 m
    for (let z = z0; z > z0 - L; z -= 6) { const rb = add(new THREE.TorusGeometry(R - 0.05, 0.18, 6, 24, Math.PI), M.brickD, 0, 1.6, z, tun); }
    // construction zone (z0 .. z0+30): wooden centering, partial brick arch, scaffold
    S.build = new THREE.Group(); tun.add(S.build);
    for (let k = 0; k < 6; k++) { const z = z0 + 2 + k * 4.5; const rb = add(new THREE.TorusGeometry(R - 0.2, 0.12, 5, 20, Math.PI), M.scaffold, 0, 1.6, z, S.build); for (const s of [-1, 1]) add(tbox(0.18, 1.8, 0.18, 1), M.scaffold, s * (R - 0.3), 0.7, z, S.build); }
    const part = add(new THREE.CylinderGeometry(R, R, 26, 30, 1, true, Math.PI / 2, Math.PI * 0.42), texM(brickC, 3, 8, '#e8b8a0'), 0, 1.6, z0 + 13, S.build); part.rotation.x = Math.PI / 2; part.material.side = THREE.DoubleSide;
    const part2 = add(new THREE.CylinderGeometry(R, R, 26, 30, 1, true, Math.PI * 1.08, Math.PI * 0.42), texM(brickC, 3, 8, '#e8b8a0'), 0, 1.6, z0 + 13, S.build); part2.rotation.x = Math.PI / 2; part2.material.side = THREE.DoubleSide;
    // earth beyond the unfinished arch
    const earth = add(new THREE.CylinderGeometry(R + 2.5, R + 2.5, 40, 24, 1, true, Math.PI / 2, Math.PI), toon({ color: '#5a4030', side: THREE.DoubleSide }), 0, 1.6, z0 + 18, S.build); earth.rotation.x = Math.PI / 2;
    for (let k = 0; k < 3; k++) add(tbox(0.6, 0.3, 1.2, 1), M.brick, -2.6 + k * 0.1, 0.15 + k * 0.3, z0 + 8 + k * 0.2, S.build);
    // gas lamps on brackets (old) and LED strips (modern)
    S.gas = new THREE.Group(); tun.add(S.gas); S.leds = new THREE.Group(); tun.add(S.leds); S.lampPos = [];
    for (let z = z0 + 24; z > z0 - L + 10; z -= 9) for (const s of [-1, 1]) { const x = s * (R - 0.25); add(tbox(0.3, 0.42, 0.3, 1), M.lampG, x, 2.2, z - (s > 0 ? 4.5 : 0), S.gas, { cast: false }); add(tbox(0.42, 0.08, 0.42, 1), M.iron, x, 2.45, z - (s > 0 ? 4.5 : 0), S.gas); S.lampPos.push([x * 0.95, 2.2, z - (s > 0 ? 4.5 : 0)]); }
    for (let z = z0; z > z0 - L; z -= 6) for (const s of [-1, 1]) add(tbox(0.08, 0.08, 3.6, 1), M.led, s * 2.3, 1.6 + 3.2, z - 3, S.leds, { cast: false });
    S.leds.visible = false;
    // water in the channel (rises with W.water)
    const wt = add(new THREE.PlaneGeometry(3.1, L + 30), waterMat, 0, -0.9, z0 - L / 2 + 15, tun, { cast: false }); wt.rotation.x = -Math.PI / 2; wt.userData.nd = ctx.waterNd; S.tunWater = wt;
    // modern: ladder up to a manhole in the vault crown
    S.ladder = new THREE.Group(); tun.add(S.ladder); for (const s of [-1, 1]) add(tbox(0.06, 4.6, 0.06, 1), M.metal, -3.2 + s * 0.25, 2.3, -40, S.ladder); for (let k = 0; k < 10; k++) add(tbox(0.5, 0.04, 0.04, 1), M.metal, -3.2, 0.3 + k * 0.45, -40, S.ladder);
    S.ladder.visible = false;
  }

  // =====================================================================
  // M9b  MODERN STREET (road along x, manhole at origin)
  // =====================================================================
  const mod = G('modern');
  { const rd = add(new THREE.PlaneGeometry(400, 12), M.asphalt, 0, 0, 0, mod, { cast: false }); rd.rotation.x = -Math.PI / 2;
    for (let x = -200; x < 200; x += 6) { const l = add(new THREE.PlaneGeometry(3, 0.18), M.white, x, 0.01, 0, mod, { cast: false }); l.rotation.x = -Math.PI / 2; }
    for (const s of [-1, 1]) { const sw = add(tbox(400, 0.2, 5, 2), M.walk, 0, 0.1, s * 8.5, mod); }
    const mh = add(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 24), M.iron, 0, 0.02, 2.4, mod); S.manhole = mh;
    const ring = add(new THREE.TorusGeometry(0.66, 0.06, 6, 24), M.metal, 0, 0.02, 2.4, mod); ring.rotation.x = Math.PI / 2;
    const hole = add(new THREE.CircleGeometry(0.6, 24), M.dark, 1.5, 0.015, 2.4, mod, { cast: false }); hole.rotation.x = -Math.PI / 2; S.hole = hole;
    const glassT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#5a7aa8'; g.fillRect(0, 0, w, h); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 3 ? '#8ab0d8' : '#c8e0f4'; g.fillRect(x * 64 + 4, y * 64 + 4, 56, 56); } });
    glassT.wrapS = glassT.wrapT = THREE.RepeatWrapping; const gM = toon({ map: glassT });
    for (let k = 0; k < 14; k++) { const x = -60 + k * 9, s = k % 2 ? 1 : -1, h = 14 + (k * 7.3) % 26, old = k % 3 === 0;
      const b = add(new THREE.BoxGeometry(8, h, 8), old ? HW[k % 3] : gM, x, h / 2, s * 15, mod); if (!old) { b.geometry = tbox(8, h, 8, 4); b.material = gM; } }
    // red double-decker bus (no text)
    const bus = new THREE.Group(); mod.add(bus); S.bus = bus;
    add(tbox(10.5, 4.0, 2.5, 2), M.bus, 0, 2.4, 0, bus); add(tbox(10.2, 0.7, 2.56, 1), M.win, 0.1, 3.3, 0, bus); add(tbox(10.2, 0.8, 2.56, 1), M.win, 0.1, 1.8, 0, bus); add(tbox(10.6, 0.2, 2.6, 1), M.white, 0, 2.7, 0, bus);
    add(tbox(0.1, 1.4, 2.0, 1), M.win, 5.26, 2.0, 0, bus);
    for (const x of [-3.4, 3.4]) for (const z of [-1.2, 1.2]) add(new THREE.CylinderGeometry(0.55, 0.55, 0.36, 16), M.tire, x, 0.55, z, bus).rotation.x = Math.PI / 2;
    // black cab (no text, no sign)
    const taxi = new THREE.Group(); mod.add(taxi); S.taxi = taxi;
    add(tbox(4.4, 1.0, 1.9, 1), M.taxi, 0, 0.9, 0, taxi); add(tbox(2.6, 0.8, 1.8, 1), M.taxi, -0.3, 1.8, 0, taxi); add(tbox(2.5, 0.55, 1.84, 1), M.win, -0.3, 1.82, 0, taxi);
    for (const x of [-1.4, 1.4]) for (const z of [-0.9, 0.9]) add(new THREE.CylinderGeometry(0.38, 0.38, 0.26, 14), M.tire, x, 0.38, z, taxi).rotation.x = Math.PI / 2;
    add(tbox(0.06, 0.2, 1.4, 1), M.shine, 2.2, 0.8, 0, taxi);
    // trees on the walk
    for (let k = 0; k < 10; k++) { const x = -40 + k * 9; add(new THREE.CylinderGeometry(0.16, 0.22, 3, 8), toon({ color: '#6a4a32' }), x, 1.5, 9.5, mod); add(new THREE.SphereGeometry(1.8, 12, 10), toon({ color: '#5aa040' }), x, 4, 9.5, mod); }
  }
  for (const k in S.loc) S.loc[k].visible = false;
};
export const update = (ctx, W, f) => {
  const loc = W.loc || ['street'];
  for (const k in S.loc) S.loc[k].visible = loc.includes(k);
  const t = f / 30;
  // junk bobbing & drifting
  for (const o of S.junk) { o.j.position.set(o.x + Math.sin(t * 0.4 + o.ph) * 0.4 + t * 0.15, -2.15 + Math.sin(t * 2 + o.ph) * 0.06, o.z); o.j.rotation.set(Math.sin(t * 1.5 + o.ph) * 0.12, o.ph + t * 0.1, Math.cos(t * 1.3 + o.ph) * 0.1); }
  // clock hands: normal time, spinning fast while W.spin
  const spin = W.spin || 0;
  for (const [hr, mn] of S.hands) { mn.rotation.z = -(1.3 + spin * 26); hr.rotation.z = -(2.6 + spin * 2.2); }
  // cart tipping its barrel
  const tip = W.tip || 0; S.cart.rotation.z = -tip * 0.35; S.barrel.rotation.z = -tip * 1.4; S.barrel.position.x = 0.3 + tip * 0.7;
  // pump & pipe
  S.pipe.visible = !!W.pipe; S.pumpHandle.rotation.z = Math.sin(t * 9) * 0.35 * (W.pumping ? 1 : 0);
  S.pump.children.forEach((m) => { if (m.material === S.M.ironG || m.material === S.M.shine) m.material = W.cleanPump ? S.M.shine : S.M.ironG; });
  S.pumpHandle.children.forEach((m) => { m.material = W.cleanPump ? S.M.shine : S.M.ironG; });
  // tunnel: construction vs finished vs modern
  S.build.visible = !W.modern && W.building !== false; S.gas.visible = !W.modern; S.leds.visible = !!W.modern; S.ladder.visible = !!W.modern;
  S.tunWater.position.y = -1.1 + (W.water ?? 0.4) * 0.8;
  if (S.pump2) S.pump2.visible = !!W.cleanPump;
  // traffic
  S.bus.position.set(-30 + (W.busX ?? 0), 0, -2.6); S.taxi.position.set(20 - (W.taxiX ?? 0), 0, 2.8); S.taxi.rotation.y = Math.PI;
  S.manhole.position.x = W.manholeOpen ? 1.5 : 0; S.hole.position.x = 0; S.hole.visible = !!W.manholeOpen;
};
