// All sets for "Gefängnis zu vermieten". Every set is a THREE.Group at the world origin; only the
// active one(s) are visible (W.set, plus W.garden / W.dutch sub-groups of the prison).
// No text, letters or digits anywhere: paper = grey lines, tags = coin icon, calendar = blank boxes.
export function buildSets(K) {
  const { THREE, scene, add, box, tbox, toon, texM, P, waterU, waterNd } = K;
  const G = {};
  const mk = (name, parent = scene) => { const g = new THREE.Group(); g.visible = false; parent.add(g); G[name] = g; return g; };
  const col = (c, o = {}) => toon({ color: c, ...o });
  const basic = (c) => new THREE.MeshBasicMaterial({ color: c, fog: true });
  const cyl = (rt, rb, h, n = 16) => new THREE.CylinderGeometry(rt, rb, h, n);
  const sph = (r, a = 16, b = 12) => new THREE.SphereGeometry(r, a, b);
  const noCast = { cast: false };
  const plane = (w, h, mat, x, y, z, parent, rotX = -Math.PI / 2) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, noCast); m.rotation.x = rotX; return m; };
  const alphaMat = (canvas, rx = 1, ry = 1, color = '#ffffff') => new THREE.MeshToonMaterial({ gradientMap: undefined, map: P.tex(canvas, rx, ry), color, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, depthWrite: true });
  const R = P.rng(1234);

  // ---------- shared materials ----------
  const MAT = {
    brick: texM(P.brick(21), 1, 1), brickDark: texM(P.brick(31, 4), 1, 1, '#d8c8c0'), slate: texM(P.slate(22), 1, 1),
    grass: texM(P.grass(6), 300, 300), gravel: texM(P.dirt(7), 8, 5), dirt: texM(P.dirt(17), 1, 1, '#8a6a4a'),
    asphalt: texM(P.asphalt(23), 4, 60), plank: texM(P.planks(5), 1, 1), plankF: texM(P.planks(15), 3, 3), wood: col('#8a5a34'), woodDark: col('#5e3b22'),
    stone: texM(P.stone(4, 30, 10, 72), 1, 1), iron: col('#3b3a40'), ironL: col('#6c6f78'), door: texM(P.planks(9), 1, 1, '#c79a6a'),
    snow: texM(P.snowTex(24), 30, 30), snowW: col('#f4f7fb'), rock: col('#7d8a99'), rockD: col('#5f6c7a'),
    cabin: texM(P.boards(28), 1, 1), cabinTrim: col('#f4f1ea'), leaf: col('#4f8a3a'), leafD: col('#3e7232'), trunk: col('#6a4a32'),
    white: col('#f4f2ec'), cream: col('#efe6d2'), yellow: col('#f2c230'), glass: col('#9fc3dc'), dark: col('#2a2630'), black: col('#1e1b22'),
  };
  const glowY = basic('#ffd86a'), skyWin = basic('#bfe0ff');

  // water (own shader: colour bands + moving glints; uniforms shared with main via waterU)
  const waterMat = new THREE.ShaderMaterial({
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...waterU }, fog: true,
    vertexShader: `#include <fog_pars_vertex>
      varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `#include <fog_pars_fragment>
      uniform float t; uniform vec3 deep, shal, glint; varying vec3 vW;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      void main(){ vec2 p = vW.xz*vec2(.22,.3) + vec2(t*.08, 0.);
        float n = noise(p) * .6 + noise(p*2.3 + 7.) * .4;
        vec3 c = mix(deep, shal, .3 + .5*n);
        float streak = smoothstep(.74, .8, noise(vW.xz*vec2(.12,.6) + vec2(t*.3, 0.)));
        c = mix(c, glint, streak*.7);
        gl_FragColor = vec4(c,1.);
        #include <fog_fragment>
      }`,
  });
  const water = (w, d, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), waterMat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.userData.nd = waterNd; parent.add(m); return m; };

  // ---------- reusable props ----------
  const tree = (parent, x, z, s = 1, y = 0, m = MAT.leaf) => {
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    add(cyl(0.22 * s, 0.32 * s, 3 * s, 8), MAT.trunk, 0, 1.5 * s, 0, g);
    for (const [dx, dy, dz, r] of [[0, 3.8, 0, 2], [1.1, 3.3, 0.4, 1.4], [-1.0, 3.4, -0.3, 1.5], [0.2, 4.6, -0.5, 1.4]]) add(sph(r * s, 12, 9), m, dx * s, dy * s, dz * s, g);
    return g;
  };
  const oak = (parent, x, z, s = 1) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    add(cyl(0.45 * s, 0.75 * s, 4.4 * s, 10), MAT.trunk, 0, 2.2 * s, 0, g);
    for (const [dx, dy, dz, r] of [[0, 5.6, 0, 3.0], [2.2, 5.0, 0.8, 2.2], [-2.3, 5.1, -0.4, 2.3], [0.6, 7.0, -0.6, 2.2], [-1, 6.5, 1.4, 2], [1.6, 6.2, -1.6, 2]]) add(sph(r * s, 14, 10), MAT.leafD, dx * s, dy * s, dz * s, g);
    return g;
  };
  /** bus facing +x, length 11; returns { g, seats: [local x...] } */
  const bus = (parent, body = '#f2c230') => {
    const g = new THREE.Group(); parent.add(g);
    const bm = col(body), wm = MAT.white;
    add(box(11, 1.15, 2.5), bm, 0, 1.05, 0, g);               // lower body
    add(box(11.04, 0.28, 2.54), wm, 0, 1.25, 0, g);            // white band
    add(box(11, 0.42, 2.5), wm, 0, 2.86, 0, g);                // roof (white)
    add(box(10.6, 0.15, 2.3), bm, 0, 3.12, 0, g);              // roof cap
    for (let i = 0; i <= 7; i++) for (const z of [-1.2, 1.2]) add(box(0.22, 1.05, 0.1), bm, -5.39 + i * 1.54, 2.12, z, g);
    add(box(10.6, 1.05, 0.06), MAT.dark, 0, 2.12, -1.0, g, noCast);   // far interior wall (dark)
    add(box(10.6, 0.06, 2.2), MAT.dark, 0, 1.64, 0, g, noCast);       // window sill inside
    add(box(0.12, 1.25, 2.3), MAT.glass, 5.46, 2.1, 0, g);             // windscreen
    add(box(0.14, 1.12, 2.5), bm, -5.48, 1.68, 0, g);                  // rear
    add(box(0.1, 1.0, 2.2), MAT.dark, -5.5, 2.12, 0, g, noCast);
    for (const z of [-0.85, 0.85]) add(sph(0.16, 10, 8), basic('#fff6c4'), 5.52, 0.95, z, g, noCast);
    add(box(0.3, 0.3, 2.6), MAT.black, 5.55, 0.55, 0, g);
    add(box(0.95, 1.95, 0.05), bm, 4.6, 1.5, 1.265, g, noCast); add(box(0.75, 1.0, 0.06), col('#3d5f7a'), 4.6, 1.85, 1.28, g, noCast); add(box(0.75, 0.6, 0.06), col('#3d5f7a'), 4.6, 0.85, 1.28, g, noCast); // door (right side = +z)
    const wheels = [];
    for (const x of [-3.6, 3.4]) for (const z of [-1.2, 1.2]) { const w = add(cyl(0.52, 0.52, 0.36, 18), MAT.black, x, 0.52, z, g); w.rotation.x = Math.PI / 2; wheels.push(w); add(cyl(0.22, 0.22, 0.38, 12), MAT.ironL, x, 0.52, z, g).rotation.x = Math.PI / 2; }
    return { g, wheels };
  };
  const barredWindow = (parent, x, y, z, w = 1.0, h = 1.5, ry = 0, n = 4, lit = false) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    add(box(w + 0.3, 0.16, 0.3), MAT.stone, 0, -h / 2 - 0.08, 0.05, g);
    add(box(w, h, 0.1), lit ? glowY : MAT.dark, 0, 0, -0.02, g, noCast);
    const arch = add(new THREE.CylinderGeometry(w / 2, w / 2, 0.1, 16, 1, false, 0, Math.PI), lit ? glowY : MAT.dark, 0, h / 2, -0.02, g, noCast); arch.rotation.x = Math.PI / 2; arch.rotation.y = Math.PI / 2;
    for (let i = 1; i < n; i++) add(box(0.05, h + w * 0.4, 0.06), MAT.iron, -w / 2 + i * w / n, 0.1, 0.05, g, noCast);
    add(box(w, 0.05, 0.06), MAT.iron, 0, 0, 0.05, g, noCast);
    return g;
  };

  // =====================================================================================
  // PRISON exterior (M1) + garden (M6) + Dutch reveal (M9)
  // =====================================================================================
  const prison = mk('prison');
  add(new THREE.PlaneGeometry(4000, 4000), MAT.grass, 0, 0, 0, prison, noCast).rotation.x = -Math.PI / 2;
  const court = plane(62, 33, MAT.gravel, 0, 0.02, -17.5, prison);
  // front wall with the gatehouse
  for (const s of [-1, 1]) add(tbox(26, 6.5, 1.2, 2), MAT.brick, s * 19, 3.25, 0, prison);
  for (const s of [-1, 1]) { add(tbox(1.2, 6.5, 34, 2), MAT.brick, s * 32, 3.25, -17, prison); }
  for (let x = -31.5; x <= 31.5; x += 1.6) for (const z of [0]) if (Math.abs(x) > 6.6) add(box(0.8, 0.5, 1.3), MAT.brick, x, 6.75, z, prison); // crenellations
  for (const s of [-1, 1]) for (let z = -1; z > -34; z -= 1.6) add(box(1.3, 0.5, 0.8), MAT.brick, s * 32, 6.75, z, prison);
  const gateH = new THREE.Group(); prison.add(gateH);
  add(tbox(13, 10.5, 4, 2), MAT.brick, 0, 5.25, -0.4, gateH);
  for (let x = -6; x <= 6; x += 1.5) add(box(0.9, 0.7, 4.1), MAT.brick, x, 10.85, -0.4, gateH);
  add(tbox(13.3, 0.4, 4.3, 2), MAT.stone, 0, 9.4, -0.4, gateH);
  for (const s of [-1, 1]) barredWindow(gateH, s * 3.6, 7.6, 1.62, 1.0, 1.4);
  // gate: arch + double doors with iron straps
  const archM = add(new THREE.CylinderGeometry(2.75, 2.75, 0.5, 24, 1, false, 0, Math.PI), MAT.stone, 0, 5.6, 1.5, gateH); archM.rotation.x = Math.PI / 2; archM.rotation.y = Math.PI / 2;
  for (const s of [-1, 1]) add(box(0.55, 5.6, 0.5), MAT.stone, s * 2.75, 2.8, 1.5, gateH);
  add(new THREE.CylinderGeometry(2.3, 2.3, 0.3, 24, 1, false, 0, Math.PI), MAT.door, 0, 5.6, 1.62, gateH).rotation.set(Math.PI / 2, Math.PI / 2, 0);
  const doors = [];
  for (const s of [-1, 1]) {
    const d = new THREE.Group(); d.position.set(s * 2.3, 0, 1.62); gateH.add(d); doors.push(d);
    add(box(2.3, 5.6, 0.3), MAT.door, -s * 1.15, 2.8, 0, d);
    for (const y of [1.0, 2.8, 4.6]) add(box(2.2, 0.22, 0.36), MAT.iron, -s * 1.15, y, 0, d);
    for (const y of [1.0, 2.8, 4.6]) for (let k = 0; k < 4; k++) add(sph(0.07, 8, 6), MAT.ironL, -s * (0.3 + k * 0.55), y, 0.2, d, noCast);
    add(new THREE.TorusGeometry(0.18, 0.04, 6, 16), MAT.iron, -s * 0.35, 2.4, 0.2, d, noCast);
  }
  // corner turrets with pointy slate roofs
  for (const s of [-1, 1]) {
    add(cyl(2.1, 2.3, 9, 16), MAT.brick, s * 32, 4.5, 0, prison);
    const r = add(new THREE.ConeGeometry(2.7, 3.4, 16), MAT.slate, s * 32, 10.7, 0, prison);
    barredWindow(prison, s * 32, 7, 2.2, 0.6, 0.9, 0, 3);
  }
  // cell block at the back (visible above the wall) with barred windows on both faces
  const block = new THREE.Group(); block.position.set(0, 0, -40); prison.add(block);
  add(tbox(52, 13, 12, 2), MAT.brick, 0, 6.5, 0, block);
  { const sh = new THREE.Shape(); sh.moveTo(-6.6, 0); sh.lineTo(6.6, 0); sh.lineTo(0, 4.2); sh.closePath();
    const rf = add(new THREE.ExtrudeGeometry(sh, { depth: 53, bevelEnabled: false }), MAT.slate, 26.5, 13, 0, block); rf.rotation.y = -Math.PI / 2; }
  for (let row = 0; row < 3; row++) for (let i = 0; i < 12; i++) { const x = -22 + i * 4; barredWindow(block, x, 3 + row * 3.6, 6.02, 0.9, 1.4); }
  for (let i = 0; i < 3; i++) add(cyl(0.5, 0.5, 2.4, 10), MAT.brick, -16 + i * 16, 15.4, 0, block); // chimneys
  // road from the gate (+z) and some distant tree lines / hedges (generic flat countryside)
  add(new THREE.PlaneGeometry(7, 600), MAT.asphalt, 0, 0.03, 302, prison, noCast).rotation.x = -Math.PI / 2;
  for (let z = 30; z < 400; z += 22) for (const s of [-1, 1]) tree(prison, s * (9 + R() * 2), z + R() * 6, 1.1 + R() * 0.3);
  for (let i = 0; i < 40; i++) { const a = R() * Math.PI * 2, d = 260 + R() * 260; if (Math.abs(Math.cos(a)) < 0.1 && Math.sin(a) > 0) continue; tree(prison, Math.cos(a) * d, Math.sin(a) * d, 2 + R() * 1.5); }
  // porter's lodge left of the road (door faces +z, toward the road)
  const lodge = new THREE.Group(); lodge.position.set(-11, 0, 9); prison.add(lodge);
  add(tbox(6, 3.6, 5, 2), MAT.brick, 0, 1.8, 0, lodge);
  { const rf = add(new THREE.ConeGeometry(4.6, 2.2, 4), MAT.slate, 0, 4.7, 0, lodge); rf.rotation.y = Math.PI / 4; rf.scale.set(1.05, 1, 0.85); }
  const lodgeDoor = add(box(1.1, 2.2, 0.12), col('#3f7a5c'), 1.2, 1.1, 2.53, lodge);
  add(sph(0.07, 8, 6), col('#e2c06a'), 1.6, 1.1, 2.62, lodge, noCast);
  add(box(1.5, 0.2, 0.6), MAT.stone, 1.2, 0.1, 2.75, lodge);
  barredWindow(lodge, -1.3, 1.9, 2.53, 0.8, 0.9, 0, 3);
  // tumbleweed shadow anchor + bus parked at the gate (prison scenes)
  const pBus = bus(prison); pBus.g.visible = false;

  // ---------- garden (M6) inside the courtyard ----------
  const garden = mk('garden', prison);
  plane(60, 31, MAT.grass, 0, 0.04, -17.5, garden);
  oak(garden, -22, -12, 1.1); oak(garden, 21, -27, 1.2); oak(garden, 24, -9, 1.0); oak(garden, -6, -30, 1.15);
  const picnic = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; garden.add(g); add(tbox(2.4, 0.1, 0.9, 1), MAT.plank, 0, 0.78, 0, g); for (const s of [-1, 1]) { add(tbox(2.4, 0.08, 0.32, 1), MAT.plank, 0, 0.45, s * 0.75, g); add(box(0.1, 0.78, 1.8), MAT.wood, s * 1.0, 0.39, 0, g); } };
  picnic(-13, -24, 0.2); picnic(-9, -29, -0.1); picnic(12, -30, 0.1);
  for (const x of [6, 16]) add(cyl(0.07, 0.07, 2.6, 8), MAT.iron, x, 1.3, -18, garden);
  { const n = add(new THREE.PlaneGeometry(10, 0.9), alphaMat(P.net(24, 3, '#f7f7f2'), 8, 0.8), 11, 2.1, -18, garden, noCast); n.userData.ndSkip = true; add(box(10, 0.08, 0.05), MAT.white, 11, 2.55, -18, garden, noCast); }
  add(sph(0.22, 14, 10), col('#f6f1e2'), 8.5, 0.22, -16.2, garden);
  // chicken coop + wire run
  const coop = new THREE.Group(); coop.position.set(-12, 0, -9); garden.add(coop);
  add(tbox(2.6, 1.6, 2, 1), MAT.plank, -2.2, 1.2, -1.4, coop);
  for (const x of [-3.4, -1.0]) for (const z of [-2.3, -0.5]) add(box(0.12, 0.6, 0.12), MAT.wood, x, 0.3, z, coop);
  { const rf = add(tbox(3.0, 0.12, 2.6, 1), col('#b8442f'), -2.2, 2.15, -1.4, coop); rf.rotation.x = -0.25; }
  add(box(0.5, 0.6, 0.06), MAT.dark, -2.2, 1.0, -0.38, coop, noCast);
  { const ramp = add(tbox(0.45, 0.05, 1.2, 1), MAT.plank, -2.2, 0.42, 0.1, coop); ramp.rotation.x = 0.55; }
  const wire = alphaMat(P.hexnet(), 5, 1.4, '#c9ced4');
  for (const [x, z, w, ry] of [[0, -3, 7, 0], [-3.5, -0.2, 5.6, Math.PI / 2]]) { const m = add(new THREE.PlaneGeometry(w, 1.3), wire, x, 0.65, z, coop, noCast); m.rotation.y = ry; m.userData.ndSkip = true; }
  for (const [x, z] of [[-3.5, -3], [3.5, -3], [-3.5, 2.6], [3.5, 2.6], [0, 2.6], [0, -3]]) add(box(0.1, 1.4, 0.1), MAT.wood, x, 0.7, z, coop);
  plane(7, 5.6, MAT.dirt, 0, 0.06, -0.2, coop);
  // vegetable beds
  const beds = new THREE.Group(); beds.position.set(6, 0, -6); garden.add(beds);
  for (let b = 0; b < 3; b++) {
    const z = -b * 2.2; add(tbox(5, 0.35, 1.3, 1), MAT.plank, 0, 0.17, z, beds); plane(4.8, 1.1, col('#6b4a30'), 0, 0.36, z, beds);
    for (let i = 0; i < 6; i++) {
      const x = -2 + i * 0.8;
      if (b === 0) { const c = add(sph(0.26, 12, 9), col('#9ccf6a'), x, 0.5, z, beds); c.scale.y = 0.75; for (let k = 0; k < 3; k++) add(sph(0.16, 8, 6), col('#7fb850'), x + Math.cos(k * 2.1) * 0.2, 0.48, z + Math.sin(k * 2.1) * 0.2, beds); }
      else if (b === 1) { add(new THREE.ConeGeometry(0.07, 0.16, 8), col('#f08a2c'), x, 0.42, z, beds); for (let k = 0; k < 3; k++) { const l = add(new THREE.ConeGeometry(0.05, 0.4, 5), col('#5aa83a'), x + (k - 1) * 0.06, 0.62, z, beds); l.rotation.z = (k - 1) * 0.35; } }
      else { add(cyl(0.03, 0.03, 1.3, 6), MAT.wood, x, 0.95, z, beds); add(sph(0.3, 10, 8), col('#4f8f3a'), x, 1.05, z, beds); for (let k = 0; k < 3; k++) add(sph(0.11, 10, 8), col('#e2402f'), x + Math.cos(k * 2.2) * 0.24, 0.85 + k * 0.18, z + 0.18, beds); }
    }
  }

  // ---------- Dutch reveal (M9): tulip stripes, canals, bridges, windmills, bike paths ----------
  const dutch = mk('dutch', prison);
  const tulipCols = ['#e8344a', '#f5d02a', '#f07ab0', '#8a4fd0', '#f5f2ea', '#f28a2a'];
  const tulipMats = tulipCols.map((c, i) => texM(P.tulips(c, 40 + i), 1, 8));
  const blocks = [[-80, -160], [80, -160], [-90, 110], [100, 110], [-200, -20], [210, -30], [-150, -170], [150, -170], [-150, 120], [150, 130], [-430, -160], [430, -160], [-420, 160], [420, 160], [0, -470], [-300, -470], [300, -470], [0, 420], [-330, 430], [330, 430], [-560, -480], [560, -480]];
  blocks.forEach(([bx, bz], bi) => { const g = new THREE.Group(); g.position.set(bx, 0, bz); g.rotation.y = bi % 2 ? 0 : Math.PI / 2; dutch.add(g); for (let i = 0; i < 9; i++) plane(10, 120, tulipMats[(i + bi * 2) % 6], -54 + i * 13.5, 0.05 + bi * 0.002, 0, g); });
  const canalsX = [-290, 0, 290], canalsZ = [-320, -20 + 0, 280];
  for (const x of [-290, 290]) water(10, 1600, x, 0.08, 0, dutch);
  for (const z of [-320, 280]) water(1600, 10, 0, 0.08, z, dutch);
  water(10, 220, 52, 0.08, -150, dutch); water(10, 220, -52, 0.08, -150, dutch);
  for (const x of [-290, 290]) for (const z of [-320, 280]) { const br = add(new THREE.TorusGeometry(7, 1.2, 8, 20, Math.PI), col('#f4f1ea'), x, 0, z + 4, dutch); }
  for (const x of [-290, 290]) for (const z of [-150, 120]) { const br = add(tbox(14, 1.6, 6, 2), MAT.brick, x, 0.8, z, dutch); }
  // bike paths
  for (const x of [-280, 280]) plane(5, 1600, col('#c7b9a6'), x, 0.06, 0, dutch);
  plane(1600, 5, col('#c7b9a6'), 0, 0.06, 270, dutch); plane(5, 300, col('#c7b9a6'), 12, 0.07, 160, dutch);
  // farmhouses
  for (const [x, z] of [[-260, -40], [250, 60], [-90, 300], [120, -330], [-380, 290], [400, -300]]) { const h = new THREE.Group(); h.position.set(x, 0, z); dutch.add(h); add(tbox(10, 5, 7, 2), MAT.brick, 0, 2.5, 0, h); const rf = add(new THREE.ConeGeometry(7.5, 5, 4), col('#7b2e1c'), 0, 7.4, 0, h); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.75); }
  const mills = [];
  const windmill = (x, z, s = 1, ry = 0) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; dutch.add(g);
    add(cyl(2.3 * s, 3.6 * s, 12 * s, 8), col('#4b5f50'), 0, 6 * s, 0, g);
    add(cyl(3.9 * s, 3.9 * s, 0.4 * s, 8), MAT.wood, 0, 4 * s, 0, g);
    const cap = add(new THREE.ConeGeometry(2.9 * s, 3.4 * s, 8), col('#6a4a32'), 0, 13.6 * s, 0, g);
    add(box(0.9 * s, 1.6 * s, 0.1 * s), MAT.dark, 0, 1 * s, 3.4 * s, g, noCast);
    const hub = new THREE.Group(); hub.position.set(0, 12.6 * s, 2.8 * s); g.add(hub);
    for (let k = 0; k < 4; k++) { const arm = new THREE.Group(); arm.rotation.z = k * Math.PI / 2; hub.add(arm); add(box(0.35 * s, 10 * s, 0.25 * s), MAT.woodDark, 0, 5 * s, 0, arm); add(box(1.8 * s, 7.6 * s, 0.12 * s), MAT.white, 1.1 * s, 5.8 * s, 0.1 * s, arm); }
    add(sph(0.5 * s, 10, 8), MAT.woodDark, 0, 0, 0, hub);
    mills.push({ hub, ph: R() * 6 }); return g;
  };
  [[-60, 40, 2.2, 0.3], [70, -40, 2.0, -0.2], [-300, -260, 2.6, 0.1], [300, -230, 2.6, -0.3], [-40, -300, 2.4, 0], [200, 220, 2.4, 0.4], [-230, 230, 2.4, -0.4], [45, 175, 2.0, 0.2], [460, -40, 2.8, 0], [-470, -20, 2.8, 0], [130, -110, 2.2, 0.1], [-140, -60, 2.2, -0.1]].forEach(([x, z, s, r]) => windmill(x, z, s, r));
  for (let i = 0; i < 14; i++) tree(dutch, -300 + i * 46, 300 + (i % 2) * 6, 1.8);

  // =====================================================================================
  // OFFICE (board + hourglass, idea, rule)
  // =====================================================================================
  const office = mk('office');
  plane(9, 7, MAT.plankF, 0, 0, 0, office);
  const offWall = texM(P.wall2('#8a6f5a', '#f1e4c8'), 1, 1);
  add(new THREE.PlaneGeometry(9, 4), offWall, 0, 2, -3, office, noCast);
  { const l = add(new THREE.PlaneGeometry(7, 4), offWall, -4.5, 2, 0.5, office, noCast); l.rotation.y = Math.PI / 2; const r = add(new THREE.PlaneGeometry(7, 4), offWall, 4.5, 2, 0.5, office, noCast); r.rotation.y = -Math.PI / 2; }
  // blackboard (left of centre)
  add(box(2.9, 1.8, 0.08), MAT.wood, -1.1, 1.95, -2.96, office, noCast);
  add(new THREE.PlaneGeometry(2.7, 1.6), texM(P.chalkboard(), 1, 1), -1.1, 1.95, -2.9, office, noCast);
  add(box(2.7, 0.06, 0.14), MAT.wood, -1.1, 1.14, -2.86, office, noCast);
  add(box(0.18, 0.05, 0.05), MAT.white, -0.4, 1.19, -2.84, office, noCast);
  // window (right) showing sky
  add(box(1.5, 1.7, 0.1), MAT.white, 2.6, 2.1, -2.96, office, noCast);
  add(new THREE.PlaneGeometry(1.3, 1.5), skyWin, 2.6, 2.1, -2.9, office, noCast);
  add(box(0.06, 1.5, 0.05), MAT.white, 2.6, 2.1, -2.86, office, noCast); add(box(1.3, 0.06, 0.05), MAT.white, 2.6, 2.1, -2.86, office, noCast);
  // desk with hourglass
  const desk = new THREE.Group(); desk.position.set(1.5, 0, -1.3); office.add(desk);
  add(tbox(1.9, 0.08, 0.9, 1), MAT.plank, 0, 0.78, 0, desk);
  for (const s of [-1, 1]) add(box(0.08, 0.78, 0.86), MAT.woodDark, s * 0.9, 0.39, 0, desk);
  add(box(0.7, 0.03, 0.5), col('#f8f6ef'), -0.45, 0.83, 0.1, desk); // blank papers
  const hg = new THREE.Group(); hg.position.set(0.4, 0.82, 0.05); desk.add(hg);
  add(cyl(0.2, 0.2, 0.05, 16), MAT.wood, 0, 0.025, 0, hg); add(cyl(0.2, 0.2, 0.05, 16), MAT.wood, 0, 0.6, 0, hg);
  for (let k = 0; k < 3; k++) add(cyl(0.015, 0.015, 0.58, 6), MAT.wood, Math.cos(k * 2.1) * 0.17, 0.31, Math.sin(k * 2.1) * 0.17, hg);
  const glassM = toon({ color: '#d8eef7', transparent: true, opacity: 0.55 });
  const gTop = add(new THREE.ConeGeometry(0.15, 0.27, 16, 1, true), glassM, 0, 0.44, 0, hg, noCast); gTop.rotation.x = Math.PI;
  const gBot = add(new THREE.ConeGeometry(0.15, 0.27, 16, 1, true), glassM, 0, 0.185, 0, hg, noCast);
  const sandTop = add(new THREE.ConeGeometry(0.13, 0.2, 16), col('#e8c27a'), 0, 0.42, 0, hg, noCast); sandTop.rotation.x = Math.PI;
  const sandBot = add(new THREE.ConeGeometry(0.13, 0.12, 16), col('#e8c27a'), 0, 0.11, 0, hg, noCast);
  // plant, filing cabinet (handles only), coat rack
  add(cyl(0.22, 0.17, 0.4, 12), col('#c46a4a'), -3.7, 0.2, -2.4, office); for (let k = 0; k < 5; k++) add(sph(0.3, 10, 8), MAT.leaf, -3.7 + Math.cos(k) * 0.2, 0.75 + k * 0.12, -2.4 + Math.sin(k) * 0.2, office);
  add(box(0.7, 1.4, 0.6), col('#8b98a8'), 3.8, 0.7, -2.5, office); for (let k = 0; k < 3; k++) add(box(0.25, 0.05, 0.05), MAT.iron, 3.8, 0.35 + k * 0.42, -2.18, office, noCast);
  add(cyl(0.03, 0.03, 1.8, 6), MAT.woodDark, -3.2, 0.9, -1.0, office); add(cyl(0.25, 0.25, 0.04, 10), MAT.woodDark, -3.2, 0.02, -1.0, office);

  // =====================================================================================
  // LINEUP (figures popping)
  // =====================================================================================
  const lineup = mk('lineup');
  plane(30, 10, texM(P.concrete(26, '#a9b2bb'), 6, 2), 0, 0, 2, lineup);
  add(new THREE.PlaneGeometry(30, 5), texM(P.lineupWall(), 6, 1), 0, 2.5, -1.4, lineup, noCast);
  add(box(30, 0.2, 0.15), col('#6d7c8c'), 0, 0.1, -1.33, lineup, noCast);

  // =====================================================================================
  // ROW of prisons to the horizon (lights going out, padlocks)
  // =====================================================================================
  const row = mk('row');
  add(new THREE.PlaneGeometry(3000, 3000), MAT.grass, 0, 0, 0, row, noCast).rotation.x = -Math.PI / 2;
  const winLit = new THREE.MeshBasicMaterial({ map: P.tex(P.windowsTex(true)), transparent: true, alphaTest: 0.4, fog: true });
  const winDark = new THREE.MeshBasicMaterial({ map: P.tex(P.windowsTex(false)), transparent: true, alphaTest: 0.4, fog: true });
  const rowB = [];
  add(new THREE.PlaneGeometry(6, 900), MAT.asphalt, 0, 0.03, -440, row, noCast).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 14; i++) for (const sd of [-1, 1]) {
    const g = new THREE.Group(); g.position.set(sd * 10.5, 0, -6 - i * 17 - (sd > 0 ? 8 : 0)); g.rotation.y = -sd * Math.PI / 2; row.add(g);
    add(tbox(12, 6, 6, 2), MAT.brick, 0, 3, 0, g);
    add(tbox(12.4, 0.4, 6.4, 2), MAT.slate, 0, 6.2, 0, g);
    add(tbox(3.4, 7.6, 2, 2), MAT.brick, 0, 3.8, 1.6, g);
    for (let k = -1; k <= 1; k++) add(box(0.7, 0.5, 0.7), MAT.brick, k * 1.2, 7.85, 1.6, g);
    add(box(1.8, 2.6, 0.12), MAT.door, 0, 1.3, 2.64, g);
    const idx = i * 2 + (sd > 0 ? 1 : 0);
    for (const s2 of [-1, 1]) { const w = add(new THREE.PlaneGeometry(4, 2), winLit, s2 * 3.9, 3.7, 3.03, g, noCast); w.userData.ndSkip = true; rowB.push({ w, g, i: idx }); }
  }
  for (let i = 0; i < 40; i++) { const sd = R() < 0.5 ? -1 : 1; tree(row, sd * (22 + R() * 30), -10 - R() * 300, 1.4 + R() * 0.5); }

  // =====================================================================================
  // CORRIDOR (M2): long hall, open cells both sides, bunks, lamps, rocking chair
  // =====================================================================================
  const corr = mk('corridor');
  const cw = 1.7, ch = 3.3, cellD = 3.4, cellW = 2.6, pitch = 3.5, N = 11;
  plane(cw * 2, 50, texM(P.tiles('#cfcabe', '#a9a395', 2), 1, 14), 0, 0, -20, corr);
  const cwall = texM(P.wall2('#6f8f86', '#ece4d0'), 1, 1);
  plane(cw * 2, 50, MAT.cream, 0, ch, -20, corr, Math.PI / 2);
  add(new THREE.PlaneGeometry(cw * 2, ch), MAT.cream, 0, ch / 2, -40, corr, noCast);
  const chair = new THREE.Group();
  const lamps = [];
  for (let i = 0; i < N; i++) {
    const z0 = 2 - i * pitch;
    for (const s of [-1, 1]) {
      // wall pier between cells
      const pier = add(new THREE.PlaneGeometry(pitch - cellW, ch), cwall, s * cw, ch / 2, z0 - (pitch - cellW) / 2, corr, noCast); pier.rotation.y = -s * Math.PI / 2;
      add(new THREE.PlaneGeometry(cellW, ch - 2.4), MAT.cream, s * cw, ch - (ch - 2.4) / 2, z0 - (pitch - cellW) - cellW / 2, corr, noCast).rotation.y = -s * Math.PI / 2;
      // cell box
      const cz = z0 - (pitch - cellW) - cellW / 2, cx = s * (cw + cellD / 2);
      plane(cellD, cellW, MAT.cream, cx, 0.005, cz, corr).material = col('#bdb6a8');
      const back = add(new THREE.PlaneGeometry(cellW, ch), cwall, s * (cw + cellD), ch / 2, cz, corr, noCast); back.rotation.y = -s * Math.PI / 2;
      for (const dz of [-1, 1]) { const sw = add(new THREE.PlaneGeometry(cellD, ch), cwall, cx, ch / 2, cz + dz * cellW / 2, corr, noCast); sw.rotation.y = dz > 0 ? Math.PI : 0; }
      // bunk bed along one side wall
      const bz = cz - cellW / 2 + 0.5;
      for (const y of [0.45, 1.45]) { add(box(cellD - 0.6, 0.08, 0.85), MAT.ironL, cx + s * 0.1, y, bz, corr); add(box(cellD - 0.7, 0.16, 0.8), col('#e9e4d6'), cx + s * 0.1, y + 0.12, bz, corr); add(box(0.7, 0.14, 0.75), col(i % 2 ? '#7f8fa8' : '#9b7f68'), cx - s * 0.75, y + 0.27, bz, corr); add(box(0.45, 0.12, 0.6), MAT.white, cx + s * 1.1, y + 0.26, bz, corr); }
      for (const dx of [-1, 1]) add(box(0.06, 1.9, 0.06), MAT.ironL, cx + dx * (cellD - 0.6) / 2 + s * 0.1, 0.95, bz + 0.4, corr);
      // small barred window high on the back wall
      barredWindow(corr, s * (cw + cellD - 0.02), 2.5, cz, 0.6, 0.5, -s * Math.PI / 2, 3);
      // open barred door folded back against the corridor wall
      const door = new THREE.Group(); door.position.set(s * (cw - 0.02), 0, cz + cellW / 2); door.rotation.y = -s * (Math.PI / 2 - 0.35); corr.add(door);
      for (let k = 0; k < 7; k++) add(cyl(0.025, 0.025, 2.3, 6), MAT.iron, 0, 1.15, -k * 0.38 - 0.1, door);
      for (const y of [0.1, 1.2, 2.3]) add(box(0.06, 0.06, 2.4), MAT.iron, 0, y, -1.2, door);
      if (i === 2 && s < 0) { chair.position.set(cx + 0.4, 0, cz + 0.6); corr.add(chair); }
    }
    // ceiling lamp: every lamp hangs, only some are lit
    const lit = i % 3 === 0;
    add(cyl(0.02, 0.02, 0.5, 6), MAT.iron, 0, ch - 0.25, z0 - 1, corr, noCast);
    const sh = add(new THREE.ConeGeometry(0.32, 0.25, 14, 1, true), col('#4f5a52', { side: THREE.DoubleSide }), 0, ch - 0.55, z0 - 1, corr, noCast);
    const bulb = add(sph(0.11, 10, 8), lit ? basic('#fff3c0') : col('#9a9a90'), 0, ch - 0.68, z0 - 1, corr, noCast); lamps.push({ bulb, lit, z: z0 - 1 });
  }
  // rocking chair (wooden), rocks on its curved runners
  { add(box(0.6, 0.06, 0.55), MAT.wood, 0, 0.55, 0, chair); add(box(0.6, 0.8, 0.06), MAT.wood, 0, 0.97, -0.26, chair);
    for (const s of [-1, 1]) { add(box(0.05, 0.5, 0.05), MAT.wood, s * 0.27, 0.3, 0.22, chair); add(box(0.05, 0.5, 0.05), MAT.wood, s * 0.27, 0.3, -0.22, chair);
      const rk = add(new THREE.TorusGeometry(1.1, 0.03, 6, 24, 0.9), MAT.woodDark, s * 0.27, 1.12, 0, chair); rk.rotation.set(0, Math.PI / 2, -Math.PI / 2 - 0.45); } }

  // =====================================================================================
  // GUARD ROOM (M3)
  // =====================================================================================
  const groom = mk('guardroom');
  plane(7, 6, texM(P.tiles('#b98d62', '#9c7552', 6), 2, 2), 0, 0, 0, groom);
  const gw = texM(P.wall2('#7b8c9a', '#efe3c6'), 1, 1);
  add(new THREE.PlaneGeometry(7, 3.4), gw, 0, 1.7, -2.6, groom, noCast);
  for (const s of [-1, 1]) { const w = add(new THREE.PlaneGeometry(6, 3.4), gw, s * 3.5, 1.7, 0.4, groom, noCast); w.rotation.y = -s * Math.PI / 2; }
  const table = new THREE.Group(); table.position.set(0, 0, -0.55); groom.add(table);
  add(tbox(2.3, 0.08, 1.05, 1), MAT.plank, 0, 0.8, 0, table);
  add(box(2.2, 0.62, 0.05), MAT.woodDark, 0, 0.45, 0.5, table);
  for (const s of [-1, 1]) add(box(0.08, 0.76, 1.0), MAT.woodDark, s * 1.08, 0.38, 0, table);
  add(cyl(0.09, 0.09, 0.38, 14), col('#3f8c8a'), -0.75, 1.03, -0.05, table); add(cyl(0.07, 0.09, 0.08, 14), MAT.ironL, -0.75, 1.26, -0.05, table);
  for (const [x, c] of [[-0.35, '#f4efe6'], [0.75, '#e9c46a']]) { add(cyl(0.06, 0.055, 0.12, 12), col(c), x, 0.9, 0.18, table); add(new THREE.TorusGeometry(0.035, 0.01, 6, 10), col(c), x + 0.07, 0.9, 0.18, table, noCast); }
  for (let k = 0; k < 5; k++) { const c = add(box(0.12, 0.012, 0.17), col(k % 2 ? '#c8414a' : '#f4f1ea'), 0.1 + k * 0.025, 0.85 + k * 0.012, 0.0 + k * 0.01, table, noCast); c.rotation.y = k * 0.3; }
  // empty key rack
  add(box(1.3, 0.5, 0.05), MAT.wood, 1.7, 1.85, -2.56, groom, noCast);
  for (let k = 0; k < 6; k++) add(cyl(0.012, 0.012, 0.1, 6), MAT.ironL, 1.2 + k * 0.2, 1.8, -2.5, groom, noCast).rotation.x = Math.PI / 2;
  // window, lamp over the table, radiator
  add(box(1.3, 1.1, 0.08), MAT.white, -1.8, 2.0, -2.56, groom, noCast); add(new THREE.PlaneGeometry(1.15, 0.95), skyWin, -1.8, 2.0, -2.5, groom, noCast);
  for (let k = 0; k < 3; k++) add(box(0.04, 1.0, 0.04), MAT.iron, -2.15 + k * 0.35, 2.0, -2.47, groom, noCast);
  add(cyl(0.01, 0.01, 0.6, 6), MAT.iron, 0, 3.1, -0.55, groom, noCast);
  add(new THREE.ConeGeometry(0.4, 0.3, 16, 1, true), col('#2f6f6a', { side: THREE.DoubleSide }), 0, 2.7, -0.55, groom, noCast);
  add(sph(0.1, 10, 8), basic('#fff3c0'), 0, 2.58, -0.55, groom, noCast);
  for (let k = 0; k < 8; k++) add(box(0.06, 0.6, 0.12), MAT.white, 1.6 + k * 0.12, 0.45, -2.5, groom);

  // =====================================================================================
  // BORDER (M4): tree-lined road along x, small booth, red-white barrier
  // =====================================================================================
  const border = mk('border');
  add(new THREE.PlaneGeometry(3000, 3000), MAT.grass, 0, 0, 0, border, noCast).rotation.x = -Math.PI / 2;
  add(new THREE.PlaneGeometry(800, 7.5), texM(P.asphalt(23), 100, 1), 0, 0.03, 0, border, noCast).rotation.x = -Math.PI / 2;
  for (let x = -400; x < 400; x += 6) add(box(3, 0.02, 0.2), MAT.white, x, 0.05, 0, border, noCast);
  for (let x = -260; x < 260; x += 10) { tree(border, x + R() * 2, -9 - R() * 2, 1.2 + R() * 0.3); if (Math.abs(x - 6) > 14) tree(border, x + 4 + R() * 2, 12 + R() * 3, 1.2 + R() * 0.3); }
  const booth = new THREE.Group(); booth.position.set(-4.5, 0, -6.2); border.add(booth);
  add(box(2.4, 2.6, 2.2), MAT.white, 0, 1.3, 0, booth); add(box(2.8, 0.25, 2.6), col('#3f4a5c'), 0, 2.72, 0, booth);
  add(box(1.6, 0.9, 0.06), MAT.glass, 0, 1.75, 1.11, booth, noCast); add(box(0.06, 0.9, 0.08), MAT.white, 0, 1.75, 1.13, booth, noCast);
  add(box(2.42, 0.25, 2.22), col('#c8414a'), 0, 0.2, 0, booth);
  add(box(0.5, 1.1, 0.5), col('#c8414a'), -1.8, 0.55, 3.6, border);  // barrier post (near side of road? far side)
  const barrierPivot = new THREE.Group(); barrierPivot.position.set(-1.6, 1.0, -4.6); border.add(barrierPivot);
  add(box(0.5, 1.1, 0.5), col('#c8414a'), -1.6, 0.55, -4.6, border);
  { const arm = new THREE.Group(); barrierPivot.add(arm);
    const stripes = document.createElement('canvas'); stripes.width = 256; stripes.height = 32; const sg = stripes.getContext('2d');
    for (let k = 0; k < 8; k++) { sg.fillStyle = k % 2 ? '#f6f3ea' : '#d63a3a'; sg.fillRect(k * 32, 0, 32, 32); }
    add(box(0.16, 0.16, 9.2), new THREE.MeshToonMaterial({ map: P.tex(stripes), color: '#ffffff' }), 0, 0, 4.6, arm);
    add(box(0.5, 0.5, 0.8), MAT.dark, 0, 0, -0.4, arm); }
  const buses = [bus(border), bus(border, '#f2c230'), bus(border)];

  // =====================================================================================
  // NORTH (M5): fjord, snowy mountains, red cabins, dock + ferry, snowfall
  // =====================================================================================
  const north = mk('north');
  water(240, 1400, 0, 0, -600, north);
  { const shore = add(new THREE.PlaneGeometry(600, 300), MAT.snow, 0, 0.6, 150, north, noCast); shore.rotation.x = -Math.PI / 2; }
  add(box(600, 0.8, 4), MAT.rockD, 0, 0.2, 0, north);
  const mtn = (x, z, r, h) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = R() * 3; north.add(g); add(new THREE.ConeGeometry(r, h, 7), MAT.rockD, 0, h / 2, 0, g, noCast); add(new THREE.ConeGeometry(r * 0.5, h * 0.5, 7), MAT.snowW, 0, h * 0.75 + 0.3, 0, g, noCast); for (let k = 0; k < 3; k++) { const sp = add(new THREE.ConeGeometry(r * 0.16, h * 0.42, 5), MAT.snowW, Math.cos(k * 2.1) * r * 0.33, h * 0.52, Math.sin(k * 2.1) * r * 0.33, g, noCast); sp.rotation.z = Math.cos(k * 2.1) * -0.35; sp.rotation.x = Math.sin(k * 2.1) * 0.35; } };
  for (let i = 0; i < 8; i++) { mtn(-78 - R() * 30, -120 - i * 120, 55 + R() * 20, 90 + R() * 70); mtn(80 + R() * 30, -100 - i * 120, 55 + R() * 20, 90 + R() * 70); }
  mtn(-30, -1150, 180, 300); mtn(-170, -820, 140, 240); mtn(170, -900, 150, 260); mtn(60, -1300, 220, 340);
  // floating ice
  for (let i = 0; i < 26; i++) { const m = add(new THREE.CylinderGeometry(1 + R() * 3, 1.2 + R() * 3, 0.3, 7), MAT.snowW, (R() - 0.5) * 120, 0.1, -10 - R() * 260, north, noCast); m.rotation.y = R() * 3; }
  const cabin = (x, z, ry, s = 1) => {
    const g = new THREE.Group(); g.position.set(x, 0.6, z); g.rotation.y = ry; north.add(g);
    add(tbox(5 * s, 3 * s, 4 * s, 2), MAT.cabin, 0, 1.5 * s, 0, g);
    for (const sd of [-1, 1]) { const r = add(box(5.6 * s, 0.25, 2.7 * s), MAT.snowW, 0, 3.6 * s, sd * 1.1 * s, g); r.rotation.x = sd * 0.62; }
    add(box(0.9 * s, 1.8 * s, 0.08), MAT.cabinTrim, 1.2 * s, 0.9 * s, 2.02 * s, g); add(box(0.8 * s, 1.6 * s, 0.1), col('#2f4a5c'), 1.2 * s, 0.85 * s, 2.03 * s, g, noCast);
    add(box(1.0 * s, 0.8 * s, 0.08), MAT.cabinTrim, -1.0 * s, 1.7 * s, 2.02 * s, g); add(box(0.8 * s, 0.6 * s, 0.1), basic('#ffd98a'), -1.0 * s, 1.7 * s, 2.03 * s, g, noCast);
    return g;
  };
  cabin(-7, 14, 0.35); cabin(-13, 8, 0.6, 1.1); cabin(-3, 24, 0.15, 0.9); cabin(14, 12, -0.4, 1.0); cabin(19, 22, -0.5, 0.9); cabin(-20, 22, 0.6);
  for (let i = 0; i < 26; i++) { const x = (R() - 0.5) * 90, z = 8 + R() * 60; if (Math.abs(x) < 14) continue; const tr = tree(north, x, z, 1.1 + R() * 0.6, 0.6, col('#2f5a40')); } for (let i = 0; i < 40; i++) tree(north, (R() < 0.5 ? -1 : 1) * (28 + R() * 40), -20 - R() * 200, 1.6, 0, col('#2f5a40'));
  // dock (planks on posts) running out over the water along -z
  const dock = new THREE.Group(); dock.position.set(4, 0, 0); north.add(dock);
  add(tbox(4, 0.25, 24, 1), MAT.plank, 0, 1.1, -10, dock);
  for (let z = 1; z > -22; z -= 3) for (const s of [-1, 1]) add(cyl(0.18, 0.18, 2.4, 8), MAT.woodDark, s * 1.9, 0.2, z, dock);
  plane(4, 24, MAT.snowW, 0, 1.24, -10, dock).scale.set(1, 1, 1);
  // ferry moored along the dock (bow toward -z)
  const ferry = new THREE.Group(); ferry.position.set(11.5, 0, -14); north.add(ferry);
  { const sh = new THREE.Shape(); sh.moveTo(-4, 0); sh.lineTo(4, 0); sh.lineTo(4.6, 2.6); sh.lineTo(-4.6, 2.6); sh.closePath();
    const hull = add(new THREE.ExtrudeGeometry(sh, { depth: 26, bevelEnabled: false }), col('#2f4f57'), 0, -0.8, -13, ferry);
    add(new THREE.ConeGeometry(4.6, 6, 4, 1), col('#2f4f57'), 0, 0.5, -15.5, ferry).rotation.set(-Math.PI / 2, Math.PI / 4, 0);
    add(box(9.3, 0.3, 26.2), MAT.white, 0, 1.95, 0, ferry);
    add(tbox(7, 3.2, 10, 2), MAT.white, 0, 3.7, 3, ferry);
    for (let k = 0; k < 5; k++) for (const s of [-1, 1]) add(box(0.06, 0.9, 1.3), MAT.glass, s * 3.52, 4.2, -0.6 + k * 1.8, ferry, noCast);
    add(tbox(4, 2, 4, 2), MAT.white, 0, 6.3, 5, ferry);
    add(cyl(0.7, 0.8, 2.6, 14), col('#e0b23a'), 0, 8.2, 6, ferry); add(cyl(0.72, 0.72, 0.4, 14), MAT.black, 0, 9.4, 6, ferry);
    const ramp = add(tbox(3.2, 0.2, 3.6, 1), MAT.ironL, -5.6, 1.6, 0, ferry); ramp.rotation.z = 0.16; }
  // snowfall points (positions animated in update)
  const SN = 500, snowMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false }), SN), snowSeed = [];
  for (let i = 0; i < SN; i++) snowSeed.push([R(), R(), R()]);
  snowMesh.userData.ndSkip = true; snowMesh.frustumCulled = false; snowMesh.castShadow = false; north.add(snowMesh);
  const snowM4 = new THREE.Matrix4();

  // =====================================================================================
  // MARKET (M7): colourful canteen, shelves with goods, coin price tags
  // =====================================================================================
  const market = mk('market');
  plane(10, 7, texM(P.tiles('#f4ecd6', '#7cc4b4', 6), 2, 2), 0, 0, 0, market);
  const mw = texM(P.wall2('#f2b8a0', '#fbefc8'), 1, 1);
  add(new THREE.PlaneGeometry(10, 3.6), mw, 0, 1.8, -3, market, noCast);
  for (const s of [-1, 1]) { const w = add(new THREE.PlaneGeometry(7, 3.6), mw, s * 5, 1.8, 0.5, market, noCast); w.rotation.y = -s * Math.PI / 2; }
  // garland of round paper lanterns (pastel, no flags)
  for (let k = 0; k < 14; k++) { const x = -4.6 + k * 0.7; add(sph(0.11, 10, 8), basic(['#ffd1dc', '#c9f2e3', '#fff1a8', '#d6c9ff'][k % 4]), x, 3.1 - Math.sin(k / 13 * Math.PI) * 0.25, -2.8, market, noCast); }
  const tagTex = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 80; const g = c.getContext('2d'); g.fillStyle = '#fff8e8'; g.beginPath(); g.moveTo(8, 8); g.lineTo(100, 8); g.lineTo(122, 40); g.lineTo(100, 72); g.lineTo(8, 72); g.closePath(); g.fill(); g.lineWidth = 5; g.strokeStyle = '#241726'; g.stroke(); g.fillStyle = '#f2c440'; g.beginPath(); g.arc(52, 40, 22, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(52, 40, 13, 0, 7); g.lineWidth = 3; g.stroke(); return c; })();
  const tagM = new THREE.MeshBasicMaterial({ map: P.tex(tagTex), transparent: true, alphaTest: 0.3, fog: true });
  const shelfUnit = (x0, kinds) => {
    add(box(2.9, 2.5, 0.06), MAT.wood, x0, 1.25, -2.95, market, noCast);
    for (const s of [-1, 1]) add(box(0.08, 2.5, 0.6), MAT.woodDark, x0 + s * 1.45, 1.25, -2.65, market);
    kinds.forEach((kind, li) => {
      const y = 0.35 + li * 0.62; add(box(2.9, 0.06, 0.6), MAT.wood, x0, y, -2.65, market);
      for (let k = 0; k < 5; k++) {
        const x = x0 - 1.15 + k * 0.57, z = -2.65;
        if (kind === 'bread') { const b = add(sph(0.2, 12, 8), col('#d99a4e'), x, y + 0.14, z, market); b.scale.set(1.2, 0.7, 0.8); for (let c = -1; c <= 1; c++) add(box(0.03, 0.02, 0.18), col('#f3d29a'), x + c * 0.1, y + 0.27, z, market, noCast); }
        if (kind === 'cheese') { add(cyl(0.2, 0.2, 0.16, 18), col('#f4d35e'), x, y + 0.11, z, market); add(cyl(0.2, 0.2, 0.02, 18), col('#e0552f'), x, y + 0.2, z, market, noCast); }
        if (kind === 'fruit') for (let a = 0; a < 4; a++) add(sph(0.09, 10, 8), col(['#e2402f', '#9ccf3a', '#f5d02a', '#e2402f'][(a + k) % 4]), x + (a % 2) * 0.15 - 0.07, y + 0.1 + Math.floor(a / 2) * 0.12, z + (a % 2 ? 0.05 : -0.05), market);
        if (kind === 'cookies') { const c = add(box(0.38, 0.4, 0.14), col(['#6aa9e0', '#f07ab0', '#7cc47a', '#b48ad6', '#f2c230'][k]), x, y + 0.23, z + 0.1, market); for (let d = 0; d < 3; d++) add(cyl(0.05, 0.05, 0.02, 10), col('#c88a4a'), x - 0.1 + d * 0.1, y + 0.25, z + 0.18, market, noCast).rotation.x = Math.PI / 2; }
        if (kind === 'jars') { add(cyl(0.1, 0.1, 0.26, 12), col(['#e2402f', '#f5a623', '#7a3fb0'][k % 3]), x, y + 0.16, z, market); add(cyl(0.11, 0.11, 0.05, 12), col('#f4f1ea'), x, y + 0.31, z, market); }
        const tag = add(new THREE.PlaneGeometry(0.2, 0.125), tagM, x, y - 0.06, z + 0.31, market, noCast); tag.userData.ndSkip = true;
      }
    });
  };
  shelfUnit(-3.1, ['bread', 'cheese', 'fruit', 'cookies']); shelfUnit(0, ['cookies', 'jars', 'bread', 'fruit']); shelfUnit(3.1, ['fruit', 'bread', 'cheese', 'jars']);
  // fruit crates at the front + counter with a bell
  for (const [x, c] of [[-2.2, '#e2402f'], [-1.3, '#9ccf3a'], [-0.4, '#f5d02a']]) { add(box(0.8, 0.45, 0.6), MAT.plank, x, 0.23, 0.3, market); for (let a = 0; a < 6; a++) add(sph(0.1, 10, 8), col(c), x - 0.25 + (a % 3) * 0.25, 0.5, 0.18 + Math.floor(a / 3) * 0.24, market); }
  add(tbox(2.2, 1.0, 0.8, 1), MAT.plank, 3.5, 0.5, 0.6, market); add(box(2.3, 0.06, 0.9), col('#7cc4b4'), 3.5, 1.03, 0.6, market);
  add(sph(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), col('#e0b23a'), 3.0, 1.06, 0.6, market);

  // =====================================================================================
  // CELL (M8 interior): calendar wall, bunk, suitcase
  // =====================================================================================
  const cell = mk('cell');
  plane(6, 6, texM(P.concrete(27, '#b7b0a2'), 2, 2), 0, 0, 0, cell);
  const cellW2 = texM(P.wall2('#8aa0b0', '#efe8d8'), 1, 1);
  add(new THREE.PlaneGeometry(6, 3.2), cellW2, 0, 1.6, -2, cell, noCast);
  for (const s of [-1, 1]) { const w = add(new THREE.PlaneGeometry(5, 3.2), cellW2, s * 3, 1.6, 0.5, cell, noCast); w.rotation.y = -s * Math.PI / 2; }
  barredWindow(cell, 1.6, 2.5, -1.98, 0.8, 0.6, 0, 3);
  for (const y of [0.45]) { add(box(2.2, 0.08, 0.9), MAT.ironL, 1.3, y, -1.2, cell); add(box(2.1, 0.16, 0.85), col('#e9e4d6'), 1.3, y + 0.12, -1.2, cell); }
  for (const dx of [-1, 1]) add(box(0.06, 1.9, 0.06), MAT.ironL, 1.3 + dx * 1.05, 0.95, -0.78, cell);
  add(box(2.2, 0.08, 0.9), MAT.ironL, 1.3, 1.45, -1.2, cell); add(box(2.1, 0.16, 0.85), col('#e9e4d6'), 1.3, 1.57, -1.2, cell);
  add(box(0.9, 0.5, 0.5), MAT.wood, -2.2, 0.25, -1.6, cell);

  // single-sided planes would leave ghost outlines in the ink pass when seen from behind: make every plane double-sided
  scene.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && o.material && !o.material.isShaderMaterial) o.material.side = THREE.DoubleSide; });
  // ---------- per-frame state ----------
  const SETS = ['prison', 'office', 'lineup', 'row', 'corridor', 'guardroom', 'border', 'north', 'market', 'cell'];
  const bob = (o, v) => { if (o) o.visible = v; };
  const placeBus = (b, st) => { if (!st) { b.g.visible = false; return; } b.g.visible = true; b.g.position.set(st.x, 0, st.z); b.g.rotation.y = st.ry || 0; b.wheels.forEach((w) => { w.rotation.y = 0; }); };
  return {
    G,
    update(W, f, cam) {
      for (const s of SETS) G[s].visible = W.set === s;
      G.garden.visible = W.set === 'prison' && !!W.garden;
      G.dutch.visible = W.set === 'prison' && !!W.dutch;
      court.visible = !W.garden;
      const t = f / 30;
      // prison
      placeBus(pBus, W.set === 'prison' ? W.pBus : null);
      doors.forEach((d, i) => { d.rotation.y = (i ? -1 : 1) * (W.gateOpen || 0) * 1.4; });
      for (const m of mills) m.hub.rotation.z = -(t * 1.6 + m.ph);
      // office hourglass: shrinks in steps, sand runs
      if (W.set === 'office') { const h = W.hourglass ?? 1; hg.scale.setScalar(h); hg.visible = h > 0.02; const k = W.sand ?? 0.5; sandTop.scale.set(1 - k * 0.7, 1 - k * 0.8, 1 - k * 0.7); sandBot.scale.set(0.6 + k * 0.5, 0.4 + k * 1.2, 0.6 + k * 0.5); }
      // row of prisons: buildings with index < W.dark have dark windows
      if (W.set === 'row') for (const b of rowB) b.w.material = b.i < (W.dark ?? 0) ? winDark : winLit;
      // corridor: rocking chair + flickering lamp
      if (W.set === 'corridor') { chair.rotation.z = 0.14 * Math.sin(t * 3.2); }
      // border: barrier angle + buses
      if (W.set === 'border') { barrierPivot.rotation.x = -(W.barrier ?? 0) * 1.35; (W.buses || []).forEach((st, i) => placeBus(buses[i], st)); for (let i = (W.buses || []).length; i < buses.length; i++) buses[i].g.visible = false; }
      // north: snowfall around the camera
      if (W.set === 'north') {
        const c = cam.position;
        for (let i = 0; i < SN; i++) {
          const [a, b, d] = snowSeed[i], rr = 1.5 + b * 26;
          const x = c.x + (a - 0.5) * rr * 0.9 + Math.sin(t * 1.3 + i) * 0.3, z = c.z - 1.2 - b * 26, y = c.y + 6 - ((d * 14 + t * 1.3) % 14);
          snowM4.makeTranslation(x, y, z); snowMesh.setMatrixAt(i, snowM4);
        }
        snowMesh.instanceMatrix.needsUpdate = true;
      }
    },
  };
}
