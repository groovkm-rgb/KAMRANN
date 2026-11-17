// scene.js — "Das Duell auf der Insel": river island, night desk, printing press, rival's parlour, river bank crowd, golden finale.
// build(ctx) once; update(ctx, W, f) every frame with worldAt(f) from story.js. All writing is German.
let S = {};
const SETS = { island: [0, 0, 0], desk: [400, 0, 0], press: [440, 0, 0], parlour: [480, 0, 0], final: [-400, 0, 0] };
export const SET = SETS;

export const build = (ctx) => {
  const { THREE, P, T, world, add, tbox, toon, texM, canvasTex, addClouds, waterMat, waterNd } = ctx;
  const R = P.rng(77);
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const grp = (name, pos = [0, 0, 0]) => { const g = new THREE.Group(); g.position.set(...pos); world.add(g); S[name] = g; return g; };
  const basic = (opts) => new THREE.MeshBasicMaterial(opts);
  const glowTex = canvasTex(128, 128, (c, w, h) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); });
  const softTex = canvasTex(256, 256, (c) => { const r = c.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, 'rgba(255,255,255,.75)'); r.addColorStop(0.5, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = r; c.fillRect(0, 0, 256, 256); });
  const rayTex = canvasTex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); const v = c.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.25, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)'); c.globalCompositeOperation = 'destination-in'; c.fillStyle = v; c.fillRect(0, 0, w, h); });
  const leafTex = canvasTex(64, 64, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(32, 4); c.quadraticCurveTo(58, 28, 32, 60); c.quadraticCurveTo(6, 28, 32, 4); c.fill(); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(32, 8); c.lineTo(32, 58); c.stroke(); c.strokeStyle = 'rgba(20,14,10,.9)'; c.lineWidth = 3; c.beginPath(); c.moveTo(32, 4); c.quadraticCurveTo(58, 28, 32, 60); c.quadraticCurveTo(6, 28, 32, 4); c.stroke(); });
  S.glowTex = glowTex;
  const ray = (parent, x, y, z, w, h, rotZ, rotY, col, op) => { const m = add(new THREE.PlaneGeometry(w, h), basic({ map: rayTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }), x, y, z, parent, { cast: false }); m.rotation.set(0, rotY, rotZ); m.userData.ndSkip = true; m.userData.op0 = op; m.receiveShadow = false; return m; };
  const glow = (parent, x, y, z, s, col, op = 0.8) => { const m = add(new THREE.PlaneGeometry(s, s), basic({ map: glowTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), x, y, z, parent, { cast: false }); m.userData.ndSkip = true; m.userData.bill = true; m.receiveShadow = false; return m; };
  S.bills = [];
  const font = (px, w = 'bold') => `${w} ${px}px Georgia, "DejaVu Serif", serif`;

  // ---------- shared materials ----------
  const sandC = (() => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = P.rng(5); g.fillStyle = '#d8c08a'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 500; i++) { g.fillStyle = `hsla(${36 + r() * 10},${30 + r() * 20}%,${58 + r() * 22}%,.55)`; g.beginPath(); g.ellipse(r() * 512, r() * 512, 2 + r() * 12, 1 + r() * 6, r() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(120,96,64,.35)'; g.beginPath(); g.arc(r() * 512, r() * 512, 1 + r() * 3, 0, 7); g.fill(); } return c; })();
  const M = {
    sand: texM(sandC, 6, 6), grass: texM(P.grass(6), 10, 10), mud: texM(P.dirt(7), 10, 10, '#9a8466'),
    trunk: toon({ color: '#5e4230' }), trunkD: toon({ color: '#4a3424' }), leaf: toon({ color: '#4f8a3c' }), leaf2: toon({ color: '#6aa046' }), leaf3: toon({ color: '#3d7234' }), leafGold: toon({ color: '#9ab040' }),
    reed: toon({ color: '#7a9a4a' }), reed2: toon({ color: '#a8a860' }), cat: toon({ color: '#6a4a2a' }),
    plank: texM(P.planks(3), 1, 2), woodD: toon({ color: '#5a3a22' }), wood: toon({ color: '#8a6038' }), boatA: toon({ color: '#7a4a2c' }), boatB: toon({ color: '#3f6a8a' }), boatIn: toon({ color: '#b0885a' }),
    iron: toon({ color: '#2a2a30' }), brass: toon({ color: '#d8a840' }), white: toon({ color: '#f2eee4' }), red: toon({ color: '#b83a30' }), black: toon({ color: '#1e1c22' }),
    hill: toon({ color: '#5a8a5a' }), hill2: toon({ color: '#7a9e6a' }), forest: toon({ color: '#3f6a44' }), forest2: toon({ color: '#557a4a' }), mount: toon({ color: '#8a9ab8' }),
    roof: texM(P.roof(9), 1, 1), plA: texM(P.plaster(8, 40), 1, 1, '#f0dcb8'), plB: texM(P.plaster(18, 20), 1, 1, '#e0b098'), plC: texM(P.plaster(28, 200), 1, 1, '#c8d8e0'),
    stone: texM(P.stone(4), 1, 1),
  };

  // ======================================================================== ISLAND (and the river around it)
  const I = grp('island', SETS.island);
  const water = add(new THREE.PlaneGeometry(1600, 1600), waterMat, 0, -0.14, 0, I, { cast: false }); water.rotation.x = -Math.PI / 2; water.userData.nd = waterNd; water.receiveShadow = false;
  const isl = add(new THREE.CylinderGeometry(9.5, 11.5, 0.6, 64), M.sand, 0, -0.3, 0, I, { cast: false }); isl.scale.z = 0.72;
  const grassD = add(new THREE.CircleGeometry(6.5, 48), M.grass, -0.8, 0.006, -2.6, I, { cast: false }); grassD.rotation.x = -Math.PI / 2; grassD.scale.set(1, 0.55, 1);
  // wet sand ring
  const wet = add(new THREE.RingGeometry(9.3, 11.0, 64), toon({ color: '#a8946a' }), 0, -0.13, 0, I, { cast: false }); wet.rotation.x = -Math.PI / 2; wet.scale.y = 0.72;
  // grass tufts (instanced)
  { const geo = new THREE.ConeGeometry(0.035, 0.2, 4); geo.translate(0, 0.1, 0); const n = 3600; const mats = [toon({ color: '#5e9a40' }), toon({ color: '#7cb04a' }), toon({ color: '#4a8236' })];
    mats.forEach((m, k) => { const im = new THREE.InstancedMesh(geo, m, n / 3 | 0); const o = new THREE.Object3D(); const r = P.rng(100 + k);
      for (let i = 0; i < im.count; i++) { let x, z; do { x = (r() * 2 - 1) * 9; z = (r() * 2 - 1) * 6.5; } while ((x * x) / 81 + (z * z) / 42 > 1 || (Math.abs(x) < 2.2 && Math.abs(z) < 1.6 && r() < 0.85));
        o.position.set(x, 0, z); o.rotation.set((r() - 0.5) * 0.5, r() * 6, (r() - 0.5) * 0.5); const s = 0.6 + r() * 1.1; o.scale.set(s, s * (0.7 + r() * 0.8), s); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
      im.castShadow = false; im.receiveShadow = true; im.userData.ndSkip = true; I.add(im); }); }
  // reeds around the shore (animated sway)
  S.reeds = [];
  { const geo = new THREE.ConeGeometry(0.025, 1.5, 4); geo.translate(0, 0.75, 0); const catGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.22, 6);
    for (const [m, n, seed] of [[M.reed, 700, 11], [M.reed2, 420, 12]]) { const im = new THREE.InstancedMesh(geo, m, n); const r = P.rng(seed), base = [];
      for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, rr = 8.6 + r() * 2.4; const cl = Math.floor(a / (Math.PI * 2) * 22); if (cl % 3 === 1 && r() < 0.8) { i--; continue; }
        base.push({ x: Math.cos(a) * rr, z: Math.sin(a) * rr * 0.72, h: 0.6 + r() * 1.0, ry: r() * 6, lean: (r() - 0.5) * 0.3, ph: r() * 6 }); }
      im.userData.base = base; im.castShadow = false; im.userData.ndSkip = true; I.add(im); S.reeds.push(im); }
    const cats = new THREE.InstancedMesh(catGeo, M.cat, 160); const r = P.rng(13), o = new THREE.Object3D();
    for (let i = 0; i < 160; i++) { const a = r() * Math.PI * 2, rr = 8.8 + r() * 2.0; o.position.set(Math.cos(a) * rr, 1.0 + r() * 0.5, Math.sin(a) * rr * 0.72); o.updateMatrix(); cats.setMatrixAt(i, o.matrix); }
    cats.userData.ndSkip = true; cats.castShadow = false; I.add(cats); }
  // trees on the island
  const tree = (parent, x, z, h = 4.5, r0 = 1.6, seed = 1, mats = [M.leaf, M.leaf2, M.leaf3]) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); parent.add(G); const r = P.rng(seed);
    add(new THREE.CylinderGeometry(0.16 * h / 4, 0.3 * h / 4, h, 8), M.trunk, 0, h / 2, 0, G);
    for (let k = 0; k < 14; k++) { const s = r0 * (0.4 + r() * 0.4); const c = add(new THREE.IcosahedronGeometry(s, 2), mats[k % mats.length], (r() - 0.5) * r0 * 1.6, h + (r() - 0.3) * r0 * 0.9, (r() - 0.5) * r0 * 1.4, G); c.scale.y = 0.8; }
    return G;
  };
  tree(I, 5.2, -4.6, 5.0, 1.6, 3); tree(I, -1.8, -6.0, 5.6, 1.7, 4); tree(I, -7.6, -1.8, 3.8, 1.3, 5); tree(I, 7.0, -4.4, 5.0, 1.6, 6); tree(I, -7.0, -5.0, 4.4, 1.4, 7);
  // bushes
  for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, rr = 5.5 + R() * 2.8; const b = add(new THREE.IcosahedronGeometry(0.45 + R() * 0.5, 1), [M.leaf, M.leaf2, M.leaf3][i % 3], Math.cos(a) * rr, 0.25, Math.sin(a) * rr * 0.65 - 0.6, I); b.scale.y = 0.7; }
  // THE DUEL TREE: trunk behind the rival, a thick branch reaching out above his head
  const DT = new THREE.Group(); DT.position.set(-4.4, 0, -2.6); I.add(DT); S.duelTree = DT;
  add(new THREE.CylinderGeometry(0.32, 0.5, 5.6, 10), M.trunk, 0, 2.8, 0, DT);
  for (let k = 0; k < 16; k++) { const c = add(new THREE.IcosahedronGeometry(0.9 + R() * 0.7, 2), [M.leaf, M.leaf2, M.leaf3][k % 3], (R() - 0.5) * 3.6, 5.6 + R() * 1.6, (R() - 0.5) * 2.6, DT); c.scale.y = 0.8; }
  const limb = (parent, a, b, r0, r1, mat = M.trunk) => { const A = V3(...a), B = V3(...b), d = B.clone().sub(A), L = d.length(); const m = add(new THREE.CylinderGeometry(r1, r0, L, 8), mat, 0, 0, 0, parent); m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); return m; };
  // world positions: base of branch (4.0, 2.9, -2.4) -> cut point (2.1, 3.15, -1.2) -> tip (0.3, 3.0, -0.5)
  const bA = [-4.2, 2.7, -2.45], bC = [0.55, 3.02, -0.3], bT = [2.4, 2.85, 0.05];
  limb(I, bA, bC, 0.2, 0.15);
  S.cutPivot = V3(...bC);
  const CUT = new THREE.Group(); CUT.position.set(...bC); I.add(CUT); S.cutBranch = CUT;
  limb(CUT, [0, 0, 0], [bT[0] - bC[0], bT[1] - bC[1], bT[2] - bC[2]], 0.15, 0.07);
  limb(CUT, [0.7, 0.03, 0.12], [1.0, 0.45, 0.4], 0.06, 0.03); limb(CUT, [1.3, -0.05, 0.2], [1.5, -0.35, 0.55], 0.05, 0.03);
  for (let k = 0; k < 9; k++) { const t = 0.3 + 0.7 * k / 8; const c = add(new THREE.IcosahedronGeometry(0.28 + R() * 0.22, 1), [M.leaf2, M.leaf, M.leafGold][k % 3], (bT[0] - bC[0]) * t + (R() - 0.5) * 0.5, (bT[1] - bC[1]) * t + 0.15 + R() * 0.25, (bT[2] - bC[2]) * t + (R() - 0.5) * 0.5, CUT); c.scale.y = 0.75; }
  // the stump face that appears after the cut (bright wood)
  S.stump = add(new THREE.CircleGeometry(0.15, 12), toon({ color: '#f0d8a0' }), bC[0] + 0.02, bC[1], bC[2], I, { cast: false }); S.stump.lookAt(bT[0] * 10, bT[1], bT[2] * 10); S.stump.visible = false;
  // the board between the duellists
  const board = add(tbox(0.42, 0.07, 3.6, 1), M.plank, 0, 0.035, 0.1, I); S.board = board;
  for (const z of [-1.6, 0, 1.6]) add(tbox(0.44, 0.02, 0.05, 1), M.woodD, 0, 0.075, z + 0.1, I, { cast: false });
  // two rowboats pulled onto the sand
  const boat = (parent, x, z, ry, mat) => { const G = new THREE.Group(); G.position.set(x, -0.05, z); G.rotation.y = ry; parent.add(G);
    const hull = add(new THREE.CylinderGeometry(0.62, 0.62, 3.0, 18, 1, true, Math.PI / 2, Math.PI), mat, 0, 0.42, 0, G); hull.rotation.z = Math.PI / 2; hull.material = mat.clone(); hull.material.side = THREE.DoubleSide;
    for (const s of [-1, 1]) { const c = add(new THREE.ConeGeometry(0.62, 0.9, 18, 1, true, Math.PI / 2, Math.PI), hull.material, s * 1.95, 0.42, 0, G); c.rotation.z = -s * Math.PI / 2; }
    add(tbox(3.0, 0.08, 1.2, 1), M.boatIn, 0, 0.2, 0, G, { cast: false });
    for (const sx of [-0.7, 0.5]) add(tbox(0.3, 0.06, 1.18, 1), M.plank, sx, 0.62, 0, G);
    add(tbox(3.9, 0.08, 0.08, 1), M.woodD, 0, 0.98, 0.6, G); add(tbox(3.9, 0.08, 0.08, 1), M.woodD, 0, 0.98, -0.6, G);
    const oar = add(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), M.wood, 0.2, 0.75, 0.2, G); oar.rotation.set(0.2, 0, 1.45); add(tbox(0.5, 0.03, 0.18, 1), M.wood, 1.45, 0.62, 0.25, G);
    return G; };
  boat(I, -6.6, 3.2, 0.5, M.boatA); boat(I, 7.0, 2.6, -0.35, M.boatB);
  // pebbles + driftwood
  for (let i = 0; i < 40; i++) { const a = R() * Math.PI * 2, rr = 7.5 + R() * 2.3; const p = add(new THREE.IcosahedronGeometry(0.08 + R() * 0.14, 0), toon({ color: ['#8a8478', '#a09888', '#6a665e'][i % 3] }), Math.cos(a) * rr, 0.02, Math.sin(a) * rr * 0.72, I); p.scale.y = 0.6; }
  { const d = add(new THREE.CylinderGeometry(0.1, 0.14, 2.2, 6), toon({ color: '#9a8a74' }), -3.0, 0.1, 4.6, I); d.rotation.set(Math.PI / 2, 0, 0.8); }
  // spectator boats on the river behind the island
  boat(I, -4.5, -12.5, 0.08, M.boatA); boat(I, 5.5, -13.5, -0.12, M.boatB);
  // the literal bean pole (shot 2b gag)
  { const G = new THREE.Group(); G.position.set(-2.35, 0, 0.0); I.add(G); S.bean = G; G.visible = false;
    add(new THREE.CylinderGeometry(0.035, 0.045, 3.0, 6), M.wood, 0, 1.5, 0, G);
    for (let k = 0; k < 26; k++) { const a = k * 0.9, y = 0.2 + k * 0.105; const l = add(new THREE.SphereGeometry(0.08, 6, 4), [M.leaf2, M.leaf][k % 2], Math.cos(a) * 0.08, y, Math.sin(a) * 0.08, G); l.scale.set(1.3, 0.6, 1); }
    for (let k = 0; k < 5; k++) add(new THREE.CylinderGeometry(0.02, 0.012, 0.22, 5), toon({ color: '#7ab040' }), 0.1 * (k % 2 ? 1 : -1), 0.6 + k * 0.45, 0.06, G); }
  // trees + bushes on the near (south) bank, behind the crowd
  for (let i = 0; i < 16; i++) tree(I, -18 + i * 2.6 + R(), 29 + R() * 5, 4 + R() * 2, 1.5 + R() * 0.6, 40 + i);
  for (let i = 0; i < 30; i++) { const b = add(new THREE.IcosahedronGeometry(0.5 + R() * 0.5, 1), [M.leaf, M.leaf2, M.leaf3][i % 3], -16 + i * 1.1, 0.3, 26.5 + R() * 1.5, I); b.scale.y = 0.7; }
  // light shafts through the island trees (sun from the back-left)
  S.islandRays = [];
  for (let i = 0; i < 7; i++) S.islandRays.push(ray(I, -6 + i * 2.6 + R(), 4.2, -6.5 + R() * 2, 0.8 + R() * 1.4, 13, -0.55 - R() * 0.15, 0.1, '#ffd890', 0.16 + R() * 0.1));

  // ---- river world: far bank, forest, town, hills, mountains; near bank with jetty
  const FB = add(tbox(900, 1.2, 60, 8), M.hill2, 0, -0.4, -68, I, { cast: false });
  { const geo = new THREE.IcosahedronGeometry(1, 1); for (const [m, n, seed, z0, z1] of [[M.forest, 300, 21, -40, -70], [M.forest2, 240, 22, -42, -90], [M.leaf3, 160, 23, -39, -50]]) {
      const im = new THREE.InstancedMesh(geo, m, n), r = P.rng(seed), o = new THREE.Object3D();
      for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 360, z = z0 + r() * (z1 - z0); if (x > 18 && x < 52 && z > -64 && z < -46) { o.scale.set(0.001, 0.001, 0.001); } else { const s = 2.2 + r() * 2.5; o.scale.set(s, s * (1.1 + r() * 0.5), s); } o.position.set(x, 1.5 + r() * 2, z); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
      im.castShadow = false; im.userData.ndSkip = true; I.add(im); } }
  for (let i = 0; i < 12; i++) { const h = add(new THREE.SphereGeometry(30 + R() * 30, 20, 10), i % 2 ? M.hill : M.hill2, (R() - 0.5) * 500, -8, -110 - R() * 80, I, { cast: false }); h.scale.y = 0.45 + R() * 0.25; }
  for (let i = 0; i < 9; i++) add(new THREE.ConeGeometry(70 + R() * 50, 90 + R() * 70, 7), M.mount, (R() - 0.5) * 900, 30, -330 - R() * 120, I, { cast: false });
  // little river town on the far bank
  const house = (p, x, z, w, d, h, rot, mat) => { const G = new THREE.Group(); G.position.set(x, 0.2, z); G.rotation.y = rot; p.add(G); add(tbox(w, h, d, 2), mat, 0, h / 2, 0, G);
    const rf = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.4, 2.2, 4), M.roof, 0, h + 1.1, 0, G); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
    for (const sx of [-0.25, 0.25]) add(tbox(0.6, 0.8, 0.06, 1), toon({ color: '#ffe0a0', emissive: '#ffb050', emissiveIntensity: 0.4 }), sx * w, h * 0.55, d / 2 + 0.03, G, { cast: false }); return G; };
  const tm = [M.plA, M.plB, M.plC];
  for (let i = 0; i < 16; i++) house(I, 22 + (i % 8) * 4.2 + R(), -48 - Math.floor(i / 8) * 6 - R() * 2, 3.2, 3, 3 + R() * 2, (R() - 0.5) * 0.4, tm[i % 3]);
  { const G = new THREE.Group(); G.position.set(38, 0.2, -60); I.add(G); add(tbox(3.4, 7, 3.4, 2), M.plA, 0, 3.5, 0, G); add(new THREE.ConeGeometry(2.6, 6, 4), toon({ color: '#3a5a6a' }), 0, 10, 0, G).rotation.y = Math.PI / 4; add(tbox(4.5, 4, 7, 2), M.plA, 0, 2, 4.5, G); }
  // jetty + near bank (south) where the crowd stands
  const NB = add(tbox(160, 1.0, 30, 6), M.mud, 0, -0.45, 36, I, { cast: false });
  const nbg = add(tbox(160, 1.0, 20, 6), M.grass, 0, -0.43, 48, I, { cast: false });
  S.jetty = new THREE.Group(); S.jetty.position.set(-4, 0, 21); I.add(S.jetty);
  for (let k = 0; k < 7; k++) add(tbox(2.2, 0.08, 0.4, 1), M.plank, 0, 0.35, -k * 0.45, S.jetty);
  for (const z of [0, -1.4, -2.8]) for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 6), M.woodD, sx * 1.05, -0.2, z, S.jetty);
  boat(I, -0.5, 19.0, 0.15, M.boatB); boat(I, 4.5, 19.3, -0.1, M.boatA);
  // near-bank reeds + fence posts + lanterns
  for (let i = 0; i < 18; i++) add(new THREE.CylinderGeometry(0.06, 0.08, 1.2, 6), M.woodD, -12 + i * 1.6, 0.45, 25.5, I);
  add(tbox(28, 0.07, 0.07, 1), M.woodD, 2, 0.95, 25.5, I);
  // steamboat on the river
  const SB = new THREE.Group(); I.add(SB); S.steamboat = SB;
  { const hullM = toon({ color: '#f2eee4' }), trim = toon({ color: '#b83a30' });
    add(tbox(12, 1.2, 3.2, 2), hullM, 0, 0.4, 0, SB); const bow = add(new THREE.ConeGeometry(1.6, 3, 4), hullM, 7.4, 0.4, 0, SB); bow.rotation.set(0, Math.PI / 4, -Math.PI / 2); bow.scale.set(1, 1, 1);
    add(tbox(12.2, 0.2, 3.3, 1), trim, 0, 1.05, 0, SB);
    add(tbox(8, 1.4, 2.6, 2), hullM, -0.5, 1.9, 0, SB); add(tbox(8.4, 0.15, 3.0, 1), trim, -0.5, 2.65, 0, SB); add(tbox(5, 1.1, 2.2, 2), hullM, -1.0, 3.3, 0, SB); add(tbox(5.3, 0.15, 2.5, 1), M.black, -1.0, 3.9, 0, SB);
    for (let k = 0; k < 7; k++) add(tbox(0.5, 0.5, 0.05, 1), toon({ color: '#3a4a6a' }), -4 + k * 1.1, 1.95, 1.32, SB, { cast: false });
    S.chimneys = [];
    for (const cx of [1.2, 2.4]) { add(new THREE.CylinderGeometry(0.28, 0.32, 5, 10), M.black, cx, 5.2, 0, SB); add(new THREE.CylinderGeometry(0.45, 0.3, 0.5, 10), M.brass, cx, 7.7, 0, SB); S.chimneys.push(cx); }
    const wheel = new THREE.Group(); wheel.position.set(-5.2, 0.9, 0); SB.add(wheel); S.paddle = wheel;
    add(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16, 1, true), trim, 0, 0, 1.7, wheel).rotation.x = Math.PI / 2;
    for (let k = 0; k < 8; k++) { const b = add(tbox(0.12, 3.0, 0.45, 1), M.woodD, 0, 0, 1.7, wheel); b.rotation.z = k * Math.PI / 8; }
    add(tbox(0.06, 1.2, 0.06, 1), M.black, -5.5, 4.5, 0, SB); const flag = add(new THREE.PlaneGeometry(1.0, 0.6), toon({ color: '#e8c048', side: THREE.DoubleSide }), -5.0, 4.85, 0, SB); S.sbFlag = flag; }

  // foreground reed clump that each island shot can park near the lens
  { const G = new THREE.Group(); I.add(G); S.fg = G; G.visible = false; const r = P.rng(88);
    for (let k = 0; k < 40; k++) { const h = 0.6 + r() * 1.3; const m = add(new THREE.ConeGeometry(0.02, h, 4), [M.reed, M.reed2, M.leaf3][k % 3], (r() - 0.5) * 0.9, h / 2, (r() - 0.5) * 0.5, G, { cast: false }); m.rotation.set((r() - 0.5) * 0.4, 0, (r() - 0.5) * 0.4); m.userData.ph = r() * 6; m.userData.ndSkip = true; }
    for (let k = 0; k < 6; k++) { const m = add(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 6), M.cat, (r() - 0.5) * 0.7, 1.0 + r() * 0.6, (r() - 0.5) * 0.4, G, { cast: false }); m.userData.ndSkip = true; } }
  // birds
  S.birds = [];
  { const wingGeo = new THREE.PlaneGeometry(0.42, 0.13); wingGeo.translate(0.21, 0, 0); const bm = toon({ color: '#2a2630', side: THREE.DoubleSide });
    for (let i = 0; i < 12; i++) { const B = new THREE.Group(); I.add(B); add(new THREE.SphereGeometry(0.08, 6, 4), bm, 0, 0, 0, B).scale.set(1.8, 1, 1);
      const L = add(wingGeo, bm, 0, 0, 0, B), Rw = add(wingGeo, bm, 0, 0, 0, B); Rw.rotation.y = Math.PI; B.userData = { L, R: Rw, seed: R() * 10, r: 1 + R() * 0.6 }; S.birds.push(B); } }

  // mist puffs (billboards, alpha) used on the island and at the bank
  S.mist = [];
  { const mm = basic({ map: softTex, color: '#e6ecf4', transparent: true, opacity: 0.0, depthWrite: false, fog: false });
    for (let i = 0; i < 22; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mm.clone()); m.userData = { ndSkip: true, seed: R(), a: R() * Math.PI * 2, rr: 2 + R() * 14, h: 0.05 + R() * 0.35, s: 3 + R() * 5, sp: 0.3 + R() * 0.6 }; m.renderOrder = 3; I.add(m); S.mist.push(m); } }

  // ======================================================================== DESK ROOM (night, candle)
  const D = grp('desk', SETS.desk);
  { const wallM = texM(P.planks(31), 3, 1, '#a07850'), floorM = texM(P.planks(32), 4, 4, '#8a6040');
    const fl = add(new THREE.PlaneGeometry(8, 8), floorM, 0, 0, 0, D, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const bw = add(tbox(8, 4.2, 0.2, 2), wallM, 0, 2.1, -2.4, D, { cast: false });
    const lw = add(tbox(0.2, 4.2, 8, 2), wallM, -3.0, 2.1, 0, D, { cast: false }); const rw = add(tbox(0.2, 4.2, 8, 2), wallM, 3.2, 2.1, 0, D, { cast: false });
    add(tbox(8, 0.2, 8, 2), toon({ color: '#3a2618' }), 0, 4.2, 0, D, { cast: false });
    for (const x of [-2, 0, 2]) add(tbox(0.22, 4.2, 0.22, 1), M.woodD, x, 2.1, -2.25, D);
    // window (moonlight) on the back wall, left
    add(tbox(1.3, 1.5, 0.06, 1), toon({ color: '#1a2a5a', emissive: '#2a4a9a', emissiveIntensity: 0.9 }), -1.6, 2.4, -2.28, D, { cast: false });
    add(tbox(1.45, 0.1, 0.12, 1), M.woodD, -1.6, 3.18, -2.25, D); add(tbox(1.45, 0.1, 0.12, 1), M.woodD, -1.6, 1.62, -2.25, D); add(tbox(0.08, 1.5, 0.12, 1), M.woodD, -1.6, 2.4, -2.24, D); add(tbox(1.4, 0.06, 0.12, 1), M.woodD, -1.6, 2.4, -2.24, D);
    add(new THREE.CircleGeometry(0.22, 20), basic({ color: '#f4f0d0', fog: false }), -1.25, 2.85, -2.27, D, { cast: false });
    S.moonRay = ray(D, -1.2, 1.4, -1.2, 1.6, 4.2, 0.55, 0.3, '#7a9aff', 0.22);
    // bookshelf on right
    add(tbox(1.6, 2.6, 0.4, 1), M.woodD, 2.2, 1.3, -2.1, D);
    for (let s = 0; s < 4; s++) { add(tbox(1.5, 0.05, 0.36, 1), M.wood, 2.2, 0.3 + s * 0.62, -2.05, D); for (let b = 0; b < 9; b++) add(tbox(0.12, 0.42 + R() * 0.12, 0.28, 1), toon({ color: ['#8a2a2a', '#2a4a7a', '#3a6a3a', '#b08a3a', '#5a2a5a'][(b + s) % 5] }), 1.55 + b * 0.15, 0.55 + s * 0.62, -2.03, D); }
    // desk
    add(tbox(2.2, 0.08, 1.0, 1), M.plank, 0, 0.88, 0, D);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.08, 0.86, 0.08, 1), M.woodD, sx * 1.0, 0.43, sz * 0.42, D);
    add(tbox(2.0, 0.22, 0.9, 1), M.woodD, 0, 0.72, 0, D);
    // candle with holder
    const CX = -0.8, CZ = -0.25;
    add(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 14), M.brass, CX, 0.94, CZ, D); add(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 10), toon({ color: '#f4ecd0' }), CX, 1.09, CZ, D);
    S.flame = add(new THREE.ConeGeometry(0.03, 0.09, 8), basic({ color: '#ffd070' }), CX, 1.27, CZ, D, { cast: false }); S.flame.userData.ndSkip = true;
    S.candleGlow = glow(D, CX, 1.27, CZ + 0.02, 1.8, '#ffb050', 0.7); S.candleGlow2 = glow(D, CX, 1.27, CZ + 0.02, 0.4, '#fff0c0', 0.9);
    const cl = new THREE.PointLight('#ffb060', 6, 6, 1.5); cl.position.set(CX, 1.35, 0.1); D.add(cl); S.candleLight = cl;
    // ink pot + quill in it
    add(new THREE.CylinderGeometry(0.07, 0.09, 0.12, 12), toon({ color: '#1a2040' }), 0.85, 0.98, -0.25, D);
    // papers + crumpled balls
    const paperTex = canvasTex(256, 340, (c, w, h) => { c.fillStyle = '#f4ead2'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(60,40,30,.55)'; for (let k = 0; k < 12; k++) c.fillRect(24, 40 + k * 22, 140 + ((k * 37) % 70), 6); });
    for (let k = 0; k < 4; k++) { const pp = add(new THREE.PlaneGeometry(0.34, 0.45), toon({ map: paperTex }), 0.1 + k * 0.1, 0.925 + k * 0.002, 0.25 - k * 0.04, D, { cast: false }); pp.rotation.set(-Math.PI / 2, 0, (R() - 0.5) * 0.6); }
    for (let k = 0; k < 7; k++) add(new THREE.IcosahedronGeometry(0.06 + R() * 0.03, 1), M.white, k > 3 ? -1.2 + R() * 0.6 : 0.2 + R() * 0.3, k > 3 ? 0.07 : 0.98, k > 3 ? 0.9 + R() * 0.4 : 0.2 + R() * 0.2, D);
    // pistol case on the desk (closed, lid hinged) — slides aside in shot 10a
    const PC = new THREE.Group(); PC.position.set(0.45, 0.92, 0.1); D.add(PC); S.pistolCase = PC;
    add(tbox(0.7, 0.14, 0.42, 1), toon({ color: '#5a2e1a' }), 0, 0.07, 0, PC);
    const lid = new THREE.Group(); lid.position.set(0, 0.14, -0.21); PC.add(lid); S.pcLid = lid;
    add(tbox(0.72, 0.06, 0.44, 1), toon({ color: '#6a3820' }), 0, 0.03, 0.21, lid); add(tbox(0.2, 0.02, 0.08, 1), M.brass, 0, 0.065, 0.3, lid);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.06, 0.15, 0.06, 1), M.brass, sx * 0.34, 0.08, sz * 0.2, PC);
    // chair
    add(tbox(2.0, 0.8, 0.05, 1), texM(P.planks(33), 2, 1, '#7a5030'), 0, 0.45, 0.46, D);
    add(tbox(0.7, 1.4, 0.06, 1), M.wood, 0, 1.0, -1.25, D);
    // wall sconce candle right above the writer's head (the "idea" light)
    add(tbox(0.3, 0.05, 0.2, 1), M.brass, 0, 2.9, -2.22, D); add(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 8), toon({ color: '#f4ecd0' }), 0, 3.02, -2.18, D);
    S.sconceFlame = add(new THREE.ConeGeometry(0.03, 0.09, 8), basic({ color: '#ffd070' }), 0, 3.17, -2.18, D, { cast: false }); S.sconceFlame.userData.ndSkip = true;
    S.sconceGlow = glow(D, 0, 3.17, -2.1, 1.4, '#ffc060', 0.5); S.sconceGlow2 = glow(D, 0, 3.17, -2.08, 0.35, '#fff4d0', 0.9);
    S.sconceLight = new THREE.PointLight('#ffc070', 2, 5, 1.5); S.sconceLight.position.set(0, 3.0, -1.8); D.add(S.sconceLight);
    // the anonymous letter being signed (dynamic texture) + a 3D quill
    S.signC = document.createElement('canvas'); S.signC.width = 600; S.signC.height = 780; S.signT = new THREE.CanvasTexture(S.signC); S.signT.colorSpace = THREE.SRGBColorSpace; S.signT.anisotropy = 8;
    S.signP = add(new THREE.PlaneGeometry(0.42, 0.546), basic({ map: S.signT }), -0.35, 0.93, 0.2, D, { cast: false }); S.signP.rotation.set(-Math.PI / 2, 0, 0.0); S.signP.userData.ndSkip = true; S.signLast = -1;
    S.quill = new THREE.Group(); D.add(S.quill);
    { const sh = add(new THREE.CylinderGeometry(0.004, 0.006, 0.36, 6), toon({ color: '#3a2a20' }), 0, 0.18, 0, S.quill, { cast: false }); const fe = new THREE.Shape(); fe.moveTo(0, 0); fe.quadraticCurveTo(0.05, 0.12, 0.012, 0.32); fe.quadraticCurveTo(-0.03, 0.15, 0, 0);
      const fm = add(new THREE.ShapeGeometry(fe), toon({ color: '#f6f2e8', side: THREE.DoubleSide }), 0, 0.12, 0, S.quill, { cast: false }); }
    S.quill.visible = false;
    // dust motes in moonbeam handled by particles
  }

  // ======================================================================== PRINTING PRESS
  const PR = grp('press', SETS.press);
  { const brick = (() => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = P.rng(9); g.fillStyle = '#5a3a30'; g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) { g.fillStyle = `hsl(${10 + r() * 12},${35 + r() * 15}%,${34 + r() * 12}%)`; g.fillRect(x * 64 + (y % 2) * 32 + 3, y * 32 + 3, 58, 26); } return c; })();
    const wM = texM(brick, 4, 2), fM = texM(P.planks(41), 4, 4, '#6a4a30');
    const fl = add(new THREE.PlaneGeometry(12, 12), fM, 0, 0, 0, PR, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(12, 5, 0.3, 4), wM, 0, 2.5, -3, PR, { cast: false }); add(tbox(0.3, 5, 12, 4), wM, -4, 2.5, 0, PR, { cast: false }); add(tbox(0.3, 5, 12, 4), wM, 4, 2.5, 0, PR, { cast: false });
    add(tbox(12, 0.2, 12, 2), toon({ color: '#2a1e18' }), 0, 5, 0, PR, { cast: false });
    // window with warm morning light
    add(tbox(1.6, 2.0, 0.06, 1), toon({ color: '#ffe0a0', emissive: '#ffc070', emissiveIntensity: 1.0 }), 2.3, 2.8, -2.84, PR, { cast: false });
    for (const y of [1.8, 3.8]) add(tbox(1.7, 0.1, 0.12, 1), M.woodD, 2.3, y, -2.8, PR); add(tbox(0.1, 2.0, 0.12, 1), M.woodD, 2.3, 2.8, -2.8, PR);
    S.pressRay = ray(PR, 1.8, 1.8, -1.6, 1.8, 5.5, -0.5, 0.2, '#ffd8a0', 0.28);
    // the press: two cast-iron side frames, platen, big flywheel, rollers, paper
    const ironM = toon({ color: '#2e3036' }), ironL = toon({ color: '#4a4e58' });
    for (const sz of [-0.55, 0.55]) { add(tbox(1.6, 2.2, 0.14, 1), ironM, 0, 1.1, sz, PR); add(tbox(1.8, 0.2, 0.2, 1), M.brass, 0, 2.25, sz, PR); }
    add(tbox(1.5, 0.12, 1.2, 1), ironL, 0, 0.95, 0, PR); // bed
    S.platen = add(tbox(1.2, 0.18, 0.95, 1), ironL, 0, 1.55, 0, PR);
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), M.brass, 0, 1.95, 0, PR);
    const FW = new THREE.Group(); FW.position.set(-1.05, 1.2, 0.75); PR.add(FW); S.flywheel = FW;
    add(new THREE.TorusGeometry(0.75, 0.07, 8, 28), ironM, 0, 0, 0, FW); for (let k = 0; k < 6; k++) { const s = add(tbox(0.05, 1.5, 0.05, 1), ironL, 0, 0, 0, FW); s.rotation.z = k * Math.PI / 6; }
    add(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12), M.brass, 0, 0, 0, FW).rotation.x = Math.PI / 2;
    S.rollers = []; for (const x of [-0.95, -0.7]) { const r = add(new THREE.CylinderGeometry(0.1, 0.1, 1.1, 14), toon({ color: '#1a1a1e' }), x, 1.1, 0, PR); r.rotation.x = Math.PI / 2; S.rollers.push(r); }
    // newspaper texture "Zeitung"
    const zt = canvasTex(600, 800, (c, w, h) => { c.fillStyle = '#f2ead6'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1416'; c.font = font(120, 'bold'); c.textAlign = 'center'; c.fillText('Zeitung', w / 2, 130);
      c.fillRect(30, 150, w - 60, 6); c.fillRect(30, 162, w - 60, 2);
      c.fillStyle = 'rgba(30,24,22,.8)'; for (let col = 0; col < 3; col++) for (let k = 0; k < 24; k++) c.fillRect(34 + col * 182, 190 + k * 24, 160 - ((k * 31 + col * 17) % 50), 8);
      c.fillStyle = '#b8b0a0'; c.fillRect(216, 260, 170, 150); });
    S.zeitungTex = zt;
    S.sheet = add(new THREE.PlaneGeometry(0.85, 1.1), toon({ map: zt, side: THREE.DoubleSide }), 0, 1.02, 0, PR, { cast: false }); S.sheet.rotation.x = -Math.PI / 2;
    // drying lines with hanging newspapers
    S.hanging = [];
    for (const [z, y] of [[-1.8, 3.4], [-0.9, 3.7]]) { add(new THREE.CylinderGeometry(0.01, 0.01, 8, 4), M.black, 0, y, z, PR).rotation.z = Math.PI / 2;
      for (let k = 0; k < 9; k++) { const pnl = add(new THREE.PlaneGeometry(0.6, 0.8), toon({ map: zt, side: THREE.DoubleSide }), -3.2 + k * 0.8, y - 0.42, z, PR, { cast: false }); pnl.userData.ph = R() * 6; S.hanging.push(pnl); } }
    // type cases, paper stacks, lamps
    add(tbox(1.6, 1.0, 0.6, 1), M.woodD, -2.6, 0.5, -2.4, PR); for (let k = 0; k < 4; k++) add(tbox(0.7, 0.3 + k * 0.02, 0.5, 1), M.white, 2.6, 0.15 + k * 0.32, 0.5 + (k % 2) * 0.05, PR);
    for (const x of [-1.6, 1.4]) { add(new THREE.CylinderGeometry(0.01, 0.01, 1, 4), M.black, x, 4.5, -0.4, PR); add(new THREE.CylinderGeometry(0.15, 0.25, 0.25, 10), M.brass, x, 3.95, -0.4, PR); glow(PR, x, 3.8, -0.38, 1.6, '#ffb050', 0.55); const l = new THREE.PointLight('#ffc070', 5, 7, 1.5); l.position.set(x, 3.7, -0.3); PR.add(l); }
  }

  // ======================================================================== RIVAL'S PARLOUR (daylight)
  const PA = grp('parlour', SETS.parlour);
  { const wp = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#7a2a34'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { c.fillStyle = '#8e3a44'; c.fillRect(x, 0, 30, h); }
      c.fillStyle = 'rgba(240,200,120,.35)'; for (let y = 30; y < h; y += 90) for (let x = 47; x < w; x += 64) { c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 8, y); c.lineTo(x, y + 12); c.lineTo(x - 8, y); c.fill(); } });
    wp.wrapS = wp.wrapT = THREE.RepeatWrapping; wp.repeat.set(3, 1.4);
    const wM = toon({ map: wp }), wain = texM(P.planks(51), 4, 1, '#5a3420'), fM = texM(P.planks(52), 4, 4, '#7a4a2a');
    const fl = add(new THREE.PlaneGeometry(10, 10), fM, 0, 0, 0, PA, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(10, 4.4, 0.2, 2), wM, 0, 2.2, -2.6, PA, { cast: false }); add(tbox(0.2, 4.4, 10, 2), wM, -3.2, 2.2, 0, PA, { cast: false }); add(tbox(0.2, 4.4, 10, 2), wM, 3.6, 2.2, 0, PA, { cast: false });
    add(tbox(10, 1.1, 0.24, 2), wain, 0, 0.55, -2.5, PA, { cast: false }); add(tbox(0.24, 1.1, 10, 2), wain, -3.1, 0.55, 0, PA, { cast: false }); add(tbox(0.24, 1.1, 10, 2), wain, 3.5, 0.55, 0, PA, { cast: false });
    add(tbox(10, 0.2, 10, 2), toon({ color: '#3a2420' }), 0, 4.4, 0, PA, { cast: false });
    // window (sunlight) on the left wall + beam
    add(tbox(0.06, 1.9, 1.5, 1), toon({ color: '#fff0c0', emissive: '#ffe0a0', emissiveIntensity: 1.1 }), -3.08, 2.4, 0.6, PA, { cast: false });
    for (const z of [-0.15, 1.35]) add(tbox(0.14, 2.0, 0.1, 1), M.woodD, -3.04, 2.4, z, PA); add(tbox(0.14, 0.1, 1.6, 1), M.woodD, -3.04, 2.4, 0.6, PA);
    for (const z of [-0.45, 1.65]) add(tbox(0.1, 2.6, 0.4, 1), toon({ color: '#2e4a3a' }), -3.0, 2.5, z, PA);
    S.parlourRay = ray(PA, -1.5, 1.7, 0.7, 2.2, 5.2, 0.85, 1.4, '#ffe0a0', 0.25);
    // medals on the back wall (gold discs with ribbons)
    for (let k = 0; k < 5; k++) { const x = -1.4 + k * 0.55; add(tbox(0.16, 0.34, 0.03, 1), toon({ color: ['#2a4a9a', '#b83a30', '#2a7a4a'][k % 3] }), x, 2.95, -2.47, PA, { cast: false }); const m = add(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 18), M.brass, x, 2.7, -2.45, PA); m.rotation.x = Math.PI / 2; glow(PA, x, 2.7, -2.4, 0.35, '#ffe080', 0.25); }
    // frame with crossed sabres painting
    add(tbox(1.3, 0.9, 0.05, 1), M.brass, 1.5, 2.9, -2.46, PA, { cast: false }); add(tbox(1.15, 0.75, 0.06, 1), toon({ color: '#3a5a3a' }), 1.5, 2.9, -2.45, PA, { cast: false });
    // TARGET in the corner (rings), holes added in update
    const TG = new THREE.Group(); TG.position.set(2.6, 1.75, -2.35); PA.add(TG); S.target = TG;
    const tt = canvasTex(512, 512, (c, w, h) => { const cols = ['#f2ead6', '#1a1416', '#f2ead6', '#1a1416', '#d83a30', '#f2c040']; for (let i = 0; i < 6; i++) { c.fillStyle = cols[i]; c.beginPath(); c.arc(256, 256, 250 - i * 42, 0, 7); c.fill(); } c.strokeStyle = '#1a1416'; c.lineWidth = 4; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(256, 256, 250 - i * 42, 0, 7); c.stroke(); } });
    add(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 32), toon({ color: '#c8a070' }), 0, 0, -0.06, TG).rotation.x = Math.PI / 2;
    add(new THREE.CircleGeometry(0.58, 40), toon({ map: tt }), 0, 0, 0.0, TG, { cast: false });
    const st = add(tbox(0.08, 1.8, 0.08, 1), M.woodD, 0, -0.9, -0.12, TG); st.rotation.z = 0;
    S.holes = []; const hr = P.rng(4); for (let k = 0; k < 9; k++) { const a = hr() * 6.28, d = hr() * 0.055; const h = add(new THREE.CircleGeometry(0.022, 10), basic({ color: '#0a0808' }), Math.cos(a) * d, Math.sin(a) * d, 0.006, TG, { cast: false }); h.visible = false; S.holes.push(h); }
    // table with letter / closed pistol case
    const TB = new THREE.Group(); TB.position.set(0.2, 0, 0.3); PA.add(TB); S.ptable = TB;
    add(new THREE.CylinderGeometry(0.75, 0.75, 0.07, 28), texM(P.planks(53), 1, 1, '#8a5030'), 0, 0.86, 0, TB); add(new THREE.CylinderGeometry(0.08, 0.12, 0.84, 10), M.woodD, 0, 0.42, 0, TB); add(new THREE.CylinderGeometry(0.4, 0.45, 0.06, 18), M.woodD, 0, 0.03, 0, TB);
    const PC2 = new THREE.Group(); PC2.position.set(-0.35, 0.9, -0.1); PC2.rotation.y = 0.3; TB.add(PC2); S.pistolCase2 = PC2;
    add(tbox(0.62, 0.14, 0.36, 1), toon({ color: '#2a1a12' }), 0, 0.07, 0, PC2); add(tbox(0.64, 0.05, 0.38, 1), toon({ color: '#3a2418' }), 0, 0.165, 0, PC2); add(tbox(0.16, 0.02, 0.06, 1), M.brass, 0, 0.2, 0.0, PC2);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.05, 0.19, 0.05, 1), M.brass, sx * 0.3, 0.095, sz * 0.17, PC2);
    // challenge letter "Forderung zum Duell"
    const lt = canvasTex(600, 760, (c, w, h) => { c.fillStyle = '#f4ead2'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b8964a'; c.lineWidth = 10; c.strokeRect(18, 18, w - 36, h - 36);
      c.fillStyle = '#2a1416'; c.textAlign = 'center'; c.font = font(64, 'bold italic'); c.fillText('Forderung', w / 2, 130); c.fillText('zum Duell', w / 2, 210);
      c.fillRect(120, 236, w - 240, 4); c.fillStyle = 'rgba(50,30,30,.6)'; for (let k = 0; k < 9; k++) c.fillRect(70, 290 + k * 34, 420 - ((k * 53) % 120), 8); });
    S.letter = add(new THREE.PlaneGeometry(0.42, 0.53), toon({ map: lt }), 0.18, 0.902, 0.12, TB, { cast: false }); S.letter.rotation.set(-Math.PI / 2, 0, -0.12);
    S.seal = add(new THREE.CylinderGeometry(0.05, 0.055, 0.015, 16), toon({ color: '#b01e22' }), 0.2, 0.91, 0.32, TB); S.seal.visible = false;
    const ST = new THREE.Group(); TB.add(ST); S.stamp = ST; add(new THREE.CylinderGeometry(0.045, 0.05, 0.06, 14), M.brass, 0, 0.03, 0, ST); add(new THREE.CylinderGeometry(0.025, 0.03, 0.22, 10), toon({ color: '#3a1a14' }), 0, 0.17, 0, ST); add(new THREE.SphereGeometry(0.05, 10, 8), toon({ color: '#3a1a14' }), 0, 0.3, 0, ST);
    // sword case (shot 10b) — long box, lid opens, two sabres glowing inside
    const SC = new THREE.Group(); SC.position.set(0.15, 0.9, 0.0); TB.add(SC); S.swordCase = SC; SC.visible = false;
    add(tbox(1.5, 0.12, 0.42, 1), toon({ color: '#3a2014' }), 0, 0.06, 0, SC); add(tbox(1.44, 0.02, 0.36, 1), toon({ color: '#8a1e2a' }), 0, 0.115, 0, SC);
    const sabMat = toon({ color: '#e0e8f2', emissive: '#a0b8d0', emissiveIntensity: 0.35 });
    for (const z of [-0.08, 0.08]) { const b = add(tbox(1.1, 0.012, 0.04, 1), sabMat, 0.12, 0.13, z, SC); add(tbox(0.06, 0.04, 0.12, 1), M.brass, -0.45, 0.135, z, SC); add(tbox(0.2, 0.03, 0.03, 1), toon({ color: '#3a2418' }), -0.58, 0.135, z, SC); }
    S.scGlow = glow(SC, 0.1, 0.2, 0.05, 0.7, '#cfe4ff', 0); S.scGlow.renderOrder = 6;
    const lid2 = new THREE.Group(); lid2.position.set(0, 0.12, -0.21); SC.add(lid2); S.scLid = lid2; add(tbox(1.52, 0.06, 0.44, 1), toon({ color: '#4a2818' }), 0, 0.03, 0.21, lid2); add(tbox(0.3, 0.02, 0.06, 1), M.brass, 0, 0.065, 0.35, lid2);
    // armchair + side cabinet + fireplace glow
    add(tbox(0.9, 0.5, 0.8, 1), toon({ color: '#9a2a30' }), -1.6, 0.25, -1.4, PA); add(tbox(0.9, 0.9, 0.18, 1), toon({ color: '#9a2a30' }), -1.6, 0.85, -1.75, PA);
    add(tbox(1.2, 1.0, 0.5, 1), M.woodD, -0.4, 0.5, -2.2, PA); add(new THREE.CylinderGeometry(0.08, 0.12, 0.4, 12), M.brass, -0.6, 1.2, -2.2, PA); add(new THREE.SphereGeometry(0.16, 12, 10), toon({ color: '#d8e8c0', emissive: '#d0e0a0', emissiveIntensity: 0.4 }), -0.6, 1.52, -2.2, PA);
  }

  // ======================================================================== FINALE (golden, flags, banknote)
  const FN = grp('final', SETS.final);
  { const fl = add(new THREE.PlaneGeometry(30, 30), texM(P.planks(61), 6, 6, '#a07040'), 0, 0, 0, FN, { cast: false }); fl.rotation.x = -Math.PI / 2;
    // radiant backdrop
    const rays = canvasTex(1024, 1024, (c, w, h) => { const g = c.createRadialGradient(512, 600, 0, 512, 600, 700); g.addColorStop(0, '#fff2c0'); g.addColorStop(0.4, '#f0b850'); g.addColorStop(1, '#a85a20'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,240,190,.28)'; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; c.beginPath(); c.moveTo(512, 600); c.lineTo(512 + Math.cos(a) * 1200, 600 + Math.sin(a) * 1200); c.lineTo(512 + Math.cos(a + 0.12) * 1200, 600 + Math.sin(a + 0.12) * 1200); c.fill(); } });
    S.backdrop = add(new THREE.PlaneGeometry(26, 26), basic({ map: rays, fog: false }), 0, 8, -8, FN, { cast: false }); S.backdrop.userData.ndSkip = true;
    // flags: tall waving banners, original design (blue field with one gold star over red/cream stripes)
    const ft = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#24407a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, 0); c.lineTo(w, h); c.lineTo(w / 2, h - 90); c.lineTo(0, h); c.closePath(); c.fill();
      c.strokeStyle = '#c43a34'; c.lineWidth = 26; c.stroke(); c.strokeStyle = '#f2e6c8'; c.lineWidth = 8; c.stroke();
      c.fillStyle = '#f4c84a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 40 : 96; c.lineTo(128 + Math.cos(a) * r, 220 + Math.sin(a) * r); } c.fill();
      c.fillStyle = '#f2e6c8'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(70 + i * 58, 380, 12, 0, 7); c.fill(); } });
    ft.premultiplyAlpha = false;
    S.flags = [];
    for (let i = 0; i < 8; i++) { const x = -7 + i * 2, z = -4.5 - (i % 2) * 1.2; add(new THREE.CylinderGeometry(0.05, 0.05, 6, 8), M.brass, x - 0.62, 3, z, FN); add(new THREE.SphereGeometry(0.12, 10, 8), M.brass, x - 0.62, 6.05, z, FN);
      const g = new THREE.PlaneGeometry(1.2, 2.4, 12, 6); const m = add(g, toon({ map: ft, side: THREE.DoubleSide, alphaTest: 0.5 }), x, 4.6, z, FN, { cast: false }); m.userData.base = g.attributes.position.array.slice(); m.userData.ph = i * 0.7; S.flags.push(m); }
    // bunting garlands
    const bm = [toon({ color: '#c43a34', side: THREE.DoubleSide }), toon({ color: '#f2e6c8', side: THREE.DoubleSide }), toon({ color: '#24407a', side: THREE.DoubleSide })]; S.bunting = [];
    for (const [y, z] of [[6.4, -3.4], [5.4, -2.6]]) for (let k = 0; k < 22; k++) { const x = -8 + k * 0.75, sag = 0.5 * Math.sin(Math.PI * ((k % 11) / 11)); const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([-0.3, 0, 0, 0.3, 0, 0, 0, -0.5, 0], 3)); tri.computeVertexNormals(); const m = add(tri, bm[k % 3], x, y - sag, z, FN, { cast: false }); m.userData.ph = k; S.bunting.push(m); }
    // podium with gold stars
    add(tbox(4, 0.5, 2.2, 1), toon({ color: '#24407a' }), 0, 0.25, -1.4, FN); add(tbox(4.2, 0.12, 2.4, 1), M.brass, 0, 0.52, -1.4, FN);
    const star = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.17 : 0.4; i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    S.stars = []; const sg = new THREE.ExtrudeGeometry(star, { depth: 0.06, bevelEnabled: false });
    for (let i = 0; i < 16; i++) { const m = add(sg, toon({ color: '#f4c84a', emissive: '#c08020', emissiveIntensity: 0.3 }), -6 + R() * 12, 1.2 + R() * 6, -3.5 + R() * 1.5, FN, { cast: false }); m.userData.ph = R() * 6; m.scale.setScalar(0.6 + R() * 0.8); S.stars.push(m); }
    for (let i = 0; i < 5; i++) ray(FN, -4 + i * 2, 5, -3, 1.2, 12, 0.25 - i * 0.12, 0, '#ffe8b0', 0.22);
    // banknote "5 Dollar" with the old tall man's portrait (drawn from the cast)
    const portrait = document.createElement('canvas'); portrait.width = 400; portrait.height = 500;
    { const g = portrait.getContext('2d'); g.fillStyle = '#e8f0dc'; g.fillRect(0, 0, 400, 500); g.save(); g.translate(200, 300); g.scale(1.25, 1.25); g.translate(-300, -150); T.lanky(new T.Pen(g), { old: 2, hat: 1, expr: 'smug', turn: 0.15 }); g.restore();
      const d = g.getImageData(0, 0, 400, 500), a = d.data; for (let i = 0; i < a.length; i += 4) { const l = (a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11) / 255; a[i] = 30 + 190 * l; a[i + 1] = 60 + 180 * l; a[i + 2] = 40 + 160 * l; } g.putImageData(d, 0, 0); }
    const nt = canvasTex(1400, 600, (c, w, h) => {
      c.fillStyle = '#cfe0c0'; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(40,90,60,.18)'; c.lineWidth = 2; for (let i = 0; i < 60; i++) { c.beginPath(); for (let x = 0; x <= w; x += 20) c.lineTo(x, 30 + i * 10 + 12 * Math.sin(x / 60 + i)); c.stroke(); }
      c.strokeStyle = '#2a6a44'; c.lineWidth = 18; c.strokeRect(18, 18, w - 36, h - 36); c.lineWidth = 5; c.strokeRect(46, 46, w - 92, h - 92);
      for (let i = 0; i < 70; i++) { const t = i / 70; c.fillStyle = '#3a7a52'; c.beginPath(); c.arc(46 + t * (w - 92), 46, 6, 0, 7); c.arc(46 + t * (w - 92), h - 46, 6, 0, 7); c.fill(); }
      c.save(); c.beginPath(); c.ellipse(w / 2, h / 2, 170, 215, 0, 0, 7); c.clip(); c.drawImage(portrait, w / 2 - 200, h / 2 - 250); c.restore();
      c.strokeStyle = '#2a6a44'; c.lineWidth = 14; c.beginPath(); c.ellipse(w / 2, h / 2, 172, 217, 0, 0, 7); c.stroke(); c.lineWidth = 4; c.beginPath(); c.ellipse(w / 2, h / 2, 190, 235, 0, 0, 7); c.stroke();
      for (const [x, y] of [[140, 140], [w - 140, 140], [140, h - 140], [w - 140, h - 140]]) { c.fillStyle = '#2a6a44'; c.beginPath(); c.arc(x, y, 80, 0, 7); c.fill(); c.fillStyle = '#e8f0dc'; c.beginPath(); c.arc(x, y, 64, 0, 7); c.fill(); c.fillStyle = '#1e5a36'; c.font = font(110, 'bold'); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('5', x, y + 6); }
      c.fillStyle = '#1e5a36'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = font(66, 'bold'); c.fillText('5 Dollar', 300, h / 2 + 4); c.fillText('5 Dollar', w - 300, h / 2 + 4);
      c.lineWidth = 3; c.strokeStyle = '#e8f0dc'; });
    const NOTE = new THREE.Group(); FN.add(NOTE); S.note = NOTE; NOTE.visible = false;
    S.noteMesh = add(new THREE.PlaneGeometry(2.8, 1.2), basic({ map: nt, side: THREE.DoubleSide, fog: false }), 0, 0, 0, NOTE, { cast: false }); S.noteMesh.userData.ndSkip = true;
    add(new THREE.PlaneGeometry(2.86, 1.26), basic({ color: '#1e4a30', side: THREE.DoubleSide, fog: false }), 0, 0, -0.005, NOTE, { cast: false }).userData.ndSkip = true;
    S.noteGlow = glow(NOTE, 0, 0, -0.2, 6, '#ffe8a0', 0.5);
    // confetti handled by particles
  }

  // ======================================================================== particles (instanced billboards)
  const mkInst = (n, mat, w = 1, h = 1) => { const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(w, h), mat, n); im.frustumCulled = false; im.userData.ndSkip = true; im.castShadow = false; im.renderOrder = 4; world.add(im); im.count = 0; return im; };
  S.pLeaf = mkInst(220, toon({ map: leafTex, alphaTest: 0.5, side: THREE.DoubleSide, color: '#ffffff' }), 1, 1);
  S.pLeaf.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(220 * 3), 3);
  S.pMote = mkInst(160, basic({ map: glowTex, color: '#fff0c8', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  S.pChip = mkInst(60, toon({ color: '#c89a60', side: THREE.DoubleSide }), 1, 0.5);
  S.pSmoke = mkInst(60, basic({ map: softTex, color: '#d8d4d0', transparent: true, depthWrite: false, opacity: 0.75 }));
  S.pConf = mkInst(200, toon({ color: '#ffffff', side: THREE.DoubleSide }), 1, 0.6);
  S.pConf.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(200 * 3), 3);
  S.pInk = mkInst(30, basic({ color: '#141830' }), 1, 1);
  addClouds(14, 90, 650, 110);
};

// ---------------------------------------------------------------------------- per-frame animation
const hash = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
export const update = (ctx, W, f) => {
  const { THREE, camera } = ctx; const t = f / 30;
  const set = W.set || 'island';
  for (const k of Object.keys(SETS)) if (S[k]) S[k].visible = k === set || (W.also || []).includes(k);
  const off = SETS[set];
  const q = camera.quaternion, o = new THREE.Object3D(), col = new THREE.Color();
  // billboards face camera
  ctx.world.traverse((m) => { if (m.userData && m.userData.bill) m.quaternion.copy(q); });
  // ---------- island life
  if (S.island.visible) {
    for (const im of S.reeds) { const b = im.userData.base; for (let i = 0; i < b.length; i++) { const r = b[i]; const sw = 0.12 * Math.sin(t * 1.6 + r.ph + r.x * 0.3) + 0.06 * Math.sin(t * 3.1 + r.ph * 2) + (W.wind || 0) * 0.15;
        o.position.set(r.x, -0.1, r.z); o.rotation.set(r.lean + sw * 0.6, r.ry, sw); o.scale.set(1, r.h, 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); } im.instanceMatrix.needsUpdate = true; }
    S.bean.visible = !!W.bean; S.fg.visible = !!W.fg; if (W.fg) { S.fg.position.set(...W.fg); S.fg.children.forEach((m) => { if (m.userData.ph !== undefined) m.rotation.z = 0.15 * Math.sin(t * 1.5 + m.userData.ph); }); }
    S.steamboat.position.set(-70 + t * 1.6, 0, -24); S.paddle.rotation.z = -t * 2.2;
    S.sbFlag.rotation.y = 0.3 * Math.sin(t * 4);
    // birds circle
    S.birds.forEach((B, i) => { const d = B.userData, a = t * 0.35 * d.r + d.seed; const flock = i < 7 ? [-4, 7.5, -10] : [10, 9, -16]; B.position.set(flock[0] + Math.cos(a) * (6 + i % 3), flock[1] + Math.sin(a * 2.1) * 0.6 + (i % 4) * 0.4, flock[2] + Math.sin(a) * 3);
      B.rotation.y = -a + Math.PI; const fl = Math.sin(t * 14 + d.seed * 5) * 0.7; d.L.rotation.x = fl; d.R.rotation.x = -fl; B.scale.setScalar(W.birdScale || 1.3); });
    if (W.birdPass) { const B = S.birds[0], p = W.birdPass; B.position.set(...p.pos); B.rotation.set(0, p.ry || 0, 0); B.scale.setScalar(p.s || 1); }
    // mist
    const mc = W.mistAt || [0, 0, 0], mo = W.mist ?? 0.35;
    S.mist.forEach((m, i) => { const u = m.userData, a = u.a + t * 0.04 * u.sp; m.position.set(mc[0] + Math.cos(a) * u.rr + t * 0.15 * u.sp, mc[1] + u.h, mc[2] + Math.sin(a) * u.rr * 0.6 - 2); m.quaternion.copy(q); m.scale.set(u.s * 1.8, u.s * 0.16, 1); m.material.opacity = mo * (0.25 + 0.3 * u.seed); });
    // rays
    for (const r of S.islandRays) r.material.opacity = r.userData.op0 * (W.rays ?? 1) * (0.8 + 0.2 * Math.sin(t * 0.8 + r.position.x));
    // branch cut
    const C = W.cut;
    if (C && f >= C.f) { const dt = (f - C.f) / 30, g = 9.8, fall = Math.min(dt, C.land ?? 0.9);
      const y = -0.5 * g * fall * fall - 0.6 * fall; const p = S.cutPivot; S.cutBranch.position.set(p.x + 1.0 * fall, Math.max(0.12, p.y + y), p.z - 0.9 * fall);
      S.cutBranch.rotation.set(0.5 * fall, -0.4 * fall, -1.2 * fall * fall); S.stump.visible = true;
      if (dt > (C.land ?? 0.9)) { S.cutBranch.position.y = 0.12; }
    } else { S.cutBranch.position.copy(S.cutPivot); S.cutBranch.rotation.set(0, 0, 0); S.stump.visible = false; }
    if (C && f >= C.f) S.cutBranch.rotation.z += 0.04 * Math.sin((f - C.f) * 0.9) * Math.exp(-(f - C.f) / 12);
  }
  // ---------- desk
  if (S.desk.visible) { const fl = 1 + 0.12 * Math.sin(t * 17) + 0.08 * Math.sin(t * 29); S.flame.scale.set(1, fl, 1); S.candleLight.intensity = 6 * fl * (W.candle ?? 1);
    S.candleGlow.material.opacity = 0.6 * fl * (W.candle ?? 1); const big = W.candle ?? 1; S.candleGlow.scale.setScalar(big); S.candleGlow2.scale.setScalar(big);
    const sc = W.sconce ?? 0.4; S.sconceGlow.material.opacity = Math.min(1, 0.5 * sc); S.sconceGlow.scale.setScalar(0.6 + sc); S.sconceGlow2.scale.setScalar(0.5 + sc * 0.5); S.sconceLight.intensity = 2 * sc; S.sconceFlame.scale.set(1 + sc * 0.3, (1 + sc * 0.6) * (1 + 0.1 * Math.sin(t * 23)), 1);
    { const pr = Math.round((W.sign ?? 1) * 90) / 90; if (pr !== S.signLast) { S.signLast = pr; const c = S.signC.getContext('2d'); c.fillStyle = '#f4ead2'; c.fillRect(0, 0, 600, 780); c.strokeStyle = 'rgba(160,130,80,.5)'; c.lineWidth = 6; c.strokeRect(14, 14, 572, 752);
        c.fillStyle = 'rgba(40,30,40,.55)'; for (let k = 0; k < 11; k++) c.fillRect(56, 70 + k * 40, 380 + ((k * 61) % 110) - (k === 10 ? 200 : 0), 9);
        c.save(); c.font = 'italic bold 118px FreeSerif, "DejaVu Serif", serif'; c.textBaseline = 'alphabetic'; const tw = c.measureText('Anonym').width; c.beginPath(); c.rect(0, 0, 90 + tw * pr, 780); c.clip(); c.fillStyle = '#18183a'; c.fillText('Anonym', 90, 650);
        c.restore(); S.signT.needsUpdate = true; S.signTw = 0; }
      if (W.quill) { const tx = 90 + 420 * (W.sign ?? 1), ty = 630 + 18 * Math.sin((W.sign ?? 0) * 40); S.quill.visible = true; S.quill.position.set(-0.35 + (tx / 600 - 0.5) * 0.42, 0.935 + (W.quillLift || 0), 0.2 + (ty / 780 - 0.5) * 0.546); S.quill.rotation.set(-0.5, 0.4, -0.45); } else S.quill.visible = false; }
    S.pcLid.rotation.x = -(W.pcLid ?? 0); S.pistolCase.position.x = 0.45 + (W.pcSlide ?? 0); S.pistolCase.rotation.y = (W.pcSlide ?? 0) * 0.5; }
  // ---------- press
  if (S.press.visible) { S.flywheel.rotation.z = -t * 3; S.platen.position.y = 1.35 + 0.2 * Math.abs(Math.cos(t * 3.2)); S.rollers.forEach((r) => { r.rotation.y = t * 6; });
    S.hanging.forEach((h) => { h.rotation.y = 0.15 * Math.sin(t * 1.4 + h.userData.ph); h.rotation.x = 0.05 * Math.sin(t * 2 + h.userData.ph); });
    S.sheet.position.x = W.sheetX ?? 0; }
  // ---------- parlour
  if (S.parlour.visible) { S.holes.forEach((h, i) => { h.visible = i < (W.holes ?? 9); });
    S.seal.visible = !!W.seal; S.stamp.position.set(0.2, 0.9 + (W.stampY ?? 0.5), 0.32); S.stamp.visible = W.stampY !== undefined;
    S.swordCase.visible = !!W.swordCase; S.scLid.rotation.x = -(W.scLid ?? 0); S.scGlow.material.opacity = W.scGlow ?? 0;
    S.pistolCase2.visible = W.pistolCase2 !== false; S.letter.visible = W.letter !== false; }
  // ---------- finale
  if (S.final.visible) { S.flags.forEach((m) => { const a = m.geometry.attributes.position, b = m.userData.base; for (let i = 0; i < a.count; i++) { const x = b[i * 3], y = b[i * 3 + 1], k = (x + 0.6) / 1.2; a.setZ(i, 0.22 * k * Math.sin(x * 3.5 - t * 5 + m.userData.ph + y * 0.6)); } a.needsUpdate = true; m.geometry.computeVertexNormals(); });
    S.bunting.forEach((m) => { m.rotation.x = 0.35 * Math.sin(t * 3 + m.userData.ph); });
    S.stars.forEach((m) => { m.rotation.y = t * 1.2 + m.userData.ph; m.position.y += 0.002 * Math.sin(t * 2 + m.userData.ph); });
    const N = W.note; S.note.visible = !!N; if (N) { S.note.position.set(...N.pos); S.note.rotation.set(N.rx || 0, N.ry || 0, N.rz || 0); S.note.scale.setScalar(N.s || 1); } }
  // ---------- particles
  const P = W.parts || {};
  // leaves: ambient drift around P.leaves = {c:[x,y,z], n, box:[w,h,d]} ; burst from P.burst = {c, f0, n}
  { const im = S.pLeaf; let n = 0; const L = P.leaves; const greens = ['#6aa046', '#9ab040', '#d8a040', '#4f8a3c', '#c8c050'];
    const put = (x, y, z, rz, rx, s, ci) => { if (n >= 220) return; o.position.set(x, y, z); o.quaternion.copy(q); o.rotateZ(rz); o.rotateX(rx); o.scale.set(s, s, s); o.updateMatrix(); im.setMatrixAt(n, o.matrix); col.set(greens[ci % greens.length]); im.setColorAt(n, col); n++; };
    if (L) for (let i = 0; i < L.n; i++) { const b = L.box || [8, 4, 6], sp = 0.25 + hash(i, 1) * 0.4, ph = hash(i, 2);
      const u = ((hash(i, 3) + t * sp * 0.12) % 1); const x = L.c[0] + (hash(i, 4) - 0.5) * b[0] + u * b[0] * 0.6 - b[0] * 0.3, y = L.c[1] + b[1] * (1 - u) - b[1] * 0.3 + 0.3 * Math.sin(t * 2 + ph * 9), z = L.c[2] + (hash(i, 5) - 0.5) * b[2];
      put(x, y, z, t * (1 + ph * 2) + ph * 9, Math.sin(t * 3 + ph * 7) * 1.1, (L.s || 0.09) * (0.7 + hash(i, 6) * 0.6), i); }
    const B = P.burst; if (B && f >= B.f0) { const dt = (f - B.f0) / 30;
      for (let i = 0; i < B.n; i++) { const a = hash(i, 7) * Math.PI * 2, v = 1.2 + hash(i, 8) * 2.6, up = 1.0 + hash(i, 9) * 2.6, drag = 1 - Math.exp(-dt * 2.2);
        const x = B.c[0] + Math.cos(a) * v * drag * 0.9 + 0.25 * Math.sin(dt * 4 + i), z = B.c[2] + Math.sin(a) * v * drag * 0.6, y = B.c[1] + up * drag * 0.8 - 0.55 * Math.max(0, dt - 0.25) * (1 + hash(i, 10));
        if (y < 0.02 + (B.floor || 0)) continue; put(x, y, z, dt * (4 + hash(i, 11) * 6) + i, Math.sin(dt * 6 + i) * 1.2, (B.s || 0.11) * (0.7 + hash(i, 12) * 0.6), i + 1); } }
    im.count = n; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
  // bark chips
  { const im = S.pChip; let n = 0; const B = P.burst; if (B && f >= B.f0 && f < B.f0 + 40) { const dt = (f - B.f0) / 30; for (let i = 0; i < 40; i++) { const a = hash(i, 20) * 6.28, v = 2 + hash(i, 21) * 3; const x = B.c[0] + Math.cos(a) * v * dt, y = B.c[1] + (2 + hash(i, 22) * 2) * dt - 4.9 * dt * dt, z = B.c[2] + Math.sin(a) * v * dt * 0.6; if (y < 0) continue;
        o.position.set(x, y, z); o.quaternion.copy(q); o.rotateZ(dt * 20 + i); o.scale.setScalar(0.06 + hash(i, 23) * 0.05); o.updateMatrix(); im.setMatrixAt(n++, o.matrix); } } im.count = n; im.instanceMatrix.needsUpdate = true; }
  // motes
  { const im = S.pMote; let n = 0; const Mo = P.motes; if (Mo) for (let i = 0; i < Mo.n; i++) { const b = Mo.box, ph = hash(i, 30);
      const x = Mo.c[0] + (hash(i, 31) - 0.5) * b[0] + 0.15 * Math.sin(t * 0.7 + ph * 9), y = Mo.c[1] + (hash(i, 32) - 0.5) * b[1] + 0.12 * Math.sin(t * 0.5 + ph * 5), z = Mo.c[2] + (hash(i, 33) - 0.5) * b[2];
      const tw = 0.55 + 0.45 * Math.sin(t * 2 + ph * 20); o.position.set(x, y, z); o.quaternion.copy(q); o.scale.setScalar((Mo.s || 0.05) * tw); o.updateMatrix(); im.setMatrixAt(n++, o.matrix); }
    im.material.color.set((Mo && Mo.col) || '#fff0c8'); im.count = n; im.instanceMatrix.needsUpdate = true; }
  // smoke from steamboat chimneys / steam
  { const im = S.pSmoke; let n = 0; const Sm = P.smoke;
    if (Sm === 'boat' && S.island.visible) { const sb = S.steamboat.position; for (const cx of S.chimneys) for (let i = 0; i < 14; i++) { const u = ((i / 14) + t * 0.18) % 1; o.position.set(sb.x + cx - u * 8, 7.9 + u * 6, sb.z + Math.sin(i + t) * 0.5); o.quaternion.copy(q); o.scale.setScalar(0.8 + u * 3.5); o.updateMatrix(); im.setMatrixAt(n++, o.matrix); } }
    im.count = n; im.instanceMatrix.needsUpdate = true; im.material.opacity = (P.smokeOp ?? 0.7); }
  // ink drops
  { const im = S.pInk; let n = 0; const K = P.ink; if (K) for (let i = 0; i < K.n; i++) { const u = ((hash(i, 40) + t * 0.6) % 1); o.position.set(K.c[0] + (hash(i, 41) - 0.5) * 0.08, K.c[1] - u * 0.25, K.c[2] + (hash(i, 42) - 0.5) * 0.04); o.quaternion.copy(q); o.scale.set(0.012, 0.018, 1); o.updateMatrix(); im.setMatrixAt(n++, o.matrix); } im.count = n; im.instanceMatrix.needsUpdate = true; }
  // confetti
  { const im = S.pConf; let n = 0; const Cf = P.confetti; const cols = ['#f4c84a', '#c43a34', '#f2e6c8', '#3a6ac8', '#5ab070'];
    if (Cf) for (let i = 0; i < Cf.n; i++) { const sp = 0.4 + hash(i, 50) * 0.5, u = (hash(i, 51) + t * sp * 0.25) % 1; o.position.set(Cf.c[0] + (hash(i, 52) - 0.5) * Cf.box[0] + 0.3 * Math.sin(t * 2 + i), Cf.c[1] + Cf.box[1] * (1 - u) - Cf.box[1] / 2, Cf.c[2] + (hash(i, 53) - 0.5) * Cf.box[2]);
      o.quaternion.copy(q); o.rotateZ(t * 4 + i); o.rotateX(t * 5 + i * 2); o.scale.setScalar(0.08); o.updateMatrix(); im.setMatrixAt(n, o.matrix); col.set(cols[i % 5]); im.setColorAt(n, col); n++; }
    im.count = n; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
};
