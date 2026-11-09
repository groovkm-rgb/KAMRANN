import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { TOTAL, shotAt, camAt, dofAt, lightFor, actorsAt, worldAt, fxAt } from './story.js';

// Elevator short "Der Tür-zu-Knopf": sets M1-M8 in one scene; each set is a group switched on per shot.
// No lettering anywhere: every texture below is drawn from shapes only.
const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.02, 900);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([96, 96, 96, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });
const M = {
  marble: texM(P.marbleTiles(21), 1, 1), wall: texM(P.wallPanels(30), 1, 1), wall2: texM(P.wallPanels(31, 34, 88), 1, 1),
  steel: texM(P.brushed(22), 1, 1), steelDark: texM(P.brushed(32, 52), 1, 1), brass: texM(P.brassTex(23), 1, 1),
  mirror: texM(P.mirrorTex(), 1, 1), cabFloor: texM(P.marbleTiles(41, 3), 1, 1, '#9a8a7c'),
  ceiling: toon({ color: '#f4efe6' }), lightPanel: basic('#fffaf0'), black: toon({ color: '#2a2c31' }),
  pot: toon({ color: '#f1ece2' }), potDark: toon({ color: '#c8653f' }), leaf: toon({ color: '#3f9a4a' }), leaf2: toon({ color: '#5cb85a' }), soil: toon({ color: '#5a3d2a' }),
  glass: new THREE.MeshBasicMaterial({ color: '#cfeaf6', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }),
  street: texM(P.asphalt(25), 1, 1), concrete: texM(P.concrete(26), 1, 1),
  // blueprint
  bp: basic('#ffffff', { map: P.tex(P.blueprint(24), 5, 5), side: THREE.BackSide, fog: false }),
  bpBlue: toon({ color: '#3f7fd0' }), bpLight: toon({ color: '#a8d2ff' }), bpPale: toon({ color: '#dff0ff' }),
  bpGlass: toon({ color: '#cfeaff', transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }),
  sand: toon({ color: '#ffcf5a' }), gold: toon({ color: '#f2c14e' }), gold2: toon({ color: '#ffd978' }), copper: toon({ color: '#ef9a48' }),
  // lab
  labFloor: texM(P.labTiles(29), 1, 1), labWall: toon({ color: '#eef3f7' }), labWall2: toon({ color: '#dfe9f1' }), white: toon({ color: '#fbfbfb' }), labBlue: toon({ color: '#7fb5e6' }),
  // city
  taxi: toon({ color: '#ffc61a' }), taxiDark: toon({ color: '#26303d' }), tire: toon({ color: '#1f2126' }), chrome: toon({ color: '#d7dde3' }),
  pole: toon({ color: '#2f3a35' }), yellowBox: toon({ color: '#f2c230' }), hydrant: toon({ color: '#d6453a' }), trunk: toon({ color: '#6a4a32' }), tree: toon({ color: '#4f9a3c' }),
  stripe: basic('#f4f4f0'), yline: basic('#f2c230'), manhole: toon({ color: '#3a3c40' }), lamp: toon({ color: '#3d4448' }),
};
for (const k of ['marble', 'wall', 'wall2', 'steel', 'steelDark', 'mirror', 'cabFloor', 'street', 'concrete', 'labFloor']) M[k].map.wrapS = M[k].map.wrapT = THREE.RepeatWrapping;

// ---------- ink / normal-depth contract ----------
const INST_V = `
#ifdef USE_INSTANCING
  mat4 im = instanceMatrix;
#else
  mat4 im = mat4(1.);
#endif
`;
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ ${INST_V} vN = normalize(normalMatrix*mat3(im)*normal); vec4 mv = modelViewMatrix*im*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ ${INST_V} vUv=uv; vec4 mv = modelViewMatrix*im*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = opts.receive ?? true; parent.add(m);
  if (opts.nd === false) m.userData.ndSkip = true; return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
/** box with world-scaled UVs per face (1 tile per `t` metres) */
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};
const plane = (w, h, t = 0) => { const g = new THREE.PlaneGeometry(w, h); if (t) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / t, uv.getY(i) * h / t); } return g; };
const cyl = (r0, r1, h, n = 20) => new THREE.CylinderGeometry(r0, r1, h, n);
const sph = (r, a = 16, b = 12) => new THREE.SphereGeometry(r, a, b);

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; sky.renderOrder = -10; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 400, 900);

const SETS = {};
const mkSet = (name) => { const g = new THREE.Group(); g.name = name; scene.add(g); SETS[name] = g; return g; };

// =====================================================================================
// SET A — lobby (M1/M4) + elevator cabin (M2/M5)
// =====================================================================================
const A = mkSet('lobby');
const named = {};
{
  // lobby floor / ceiling / walls
  const fl = add(plane(14, 18, 2), M.marble, 0, 0, 8, A, { cast: false }); fl.rotation.x = -Math.PI / 2;
  const ce = add(plane(14, 18), M.ceiling, 0, 6.2, 8, A, { cast: false }); ce.rotation.x = Math.PI / 2;
  for (let i = -1; i <= 1; i++) for (let j = 0; j < 4; j++) add(box(1.6, 0.04, 1.6), M.lightPanel, i * 4, 6.18, 2.5 + j * 4, A, { cast: false });
  add(tbox(0.3, 6.2, 18, 2), M.wall2, -7.15, 3.1, 8, A, { cast: false }); // left wall
  add(tbox(0.3, 6.2, 18, 2), M.wall2, 7.15, 3.1, 8, A, { cast: false }); // right wall
  // elevator wall at z=0 (front face z=+0.12): openings hero x∈[-0.6,0.6], second x∈[-3.8,-2.6], both 2.2 high
  const wz = 0.04, wd = 0.16;
  const wallPiece = (x0, x1, y0, y1) => add(tbox(x1 - x0, y1 - y0, wd, 2), M.wall, (x0 + x1) / 2, (y0 + y1) / 2, wz, A, { cast: false });
  wallPiece(-7, -3.8, 0, 6.2); wallPiece(-2.6, -0.6, 0, 6.2); wallPiece(0.6, 7, 0, 6.2); wallPiece(-3.8, -2.6, 2.2, 6.2); wallPiece(-0.6, 0.6, 2.2, 6.2);
  // brass portals + indicators + second elevator's closed doors
  for (const cx of [0, -3.2]) {
    for (const s of [-1, 1]) add(box(0.14, 2.36, 0.08), M.brass, cx + s * 0.67, 1.18, 0.15, A);
    add(box(1.48, 0.16, 0.08), M.brass, cx, 2.28, 0.15, A);
    add(box(0.86, 0.16, 0.05), M.black, cx, 2.62, 0.14, A, { cast: false });
    const dots = []; for (let k = 0; k < 7; k++) { const m = add(sph(0.022, 10, 8), toon({ color: '#5a4a30', emissive: '#000000' }), cx - 0.33 + k * 0.11, 2.62, 0.17, A, { cast: false }); dots.push(m); }
    named[cx === 0 ? 'indA' : 'indB'] = dots;
    if (cx !== 0) for (const s of [-1, 1]) { const d = add(box(0.6, 2.2, 0.04), M.brass, cx + s * 0.3, 1.1, 0.0, A); add(box(0.012, 2.2, 0.045), M.black, cx, 1.1, 0.0, A, { cast: false }); }
  }
  // hall call plate between the elevators: two round buttons, no symbols
  add(box(0.16, 0.3, 0.03), M.brass, -1.6, 1.15, 0.135, A);
  for (const y of [1.21, 1.09]) { const b = add(cyl(0.035, 0.035, 0.02, 24), toon({ color: '#f6f1e6', emissive: '#000000' }), -1.6, y, 0.155, A); b.rotation.x = Math.PI / 2; }
  // plants
  const plant = (x, z, h = 1.6, s = 1) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); A.add(g);
    add(cyl(0.34, 0.26, 0.62, 24), M.pot, 0, 0.31, 0, g); add(cyl(0.3, 0.3, 0.04, 20), M.soil, 0, 0.6, 0, g);
    const r = P.rng(Math.round(x * 13 + z * 7));
    for (let i = 0; i < 16; i++) { const a = r() * 6.28, el = 0.4 + r() * 1.0, L = 0.5 + r() * 0.5; const lf = add(sph(1, 10, 8), i % 2 ? M.leaf : M.leaf2, Math.cos(a) * 0.18, 0.62 + h * 0.35 + r() * h * 0.45, Math.sin(a) * 0.18, g);
      lf.scale.set(0.09, L * 0.5, 0.2); lf.rotation.set(Math.cos(a) * el, -a, Math.sin(a) * el); lf.position.x += Math.cos(a) * L * 0.25; lf.position.z += Math.sin(a) * L * 0.25; }
    return g;
  };
  plant(-5.3, 1.0, 1.8, 1.15); plant(2.3, 0.9, 1.5, 1.0); plant(5.7, 13.5, 1.8, 1.2); plant(-6.2, 9, 1.6, 1.1);
  // glass facade at z=17 facing the elevators; morning sun pours through the mullions
  for (let x = -7; x <= 7.01; x += 1.75) if (Math.abs(x - 2.6) > 1.3) add(box(0.12, 6.2, 0.12), M.steelDark, x, 3.1, 17, A);
  for (const y of [0.06, 3.0, 6.14]) add(box(14, 0.12, 0.12), M.steelDark, 0, y, 17, A);
  const gl = add(plane(14, 6.2), M.glass, 0, 3.1, 17, A, { cast: false, nd: false });
  // revolving door drum
  const rev = new THREE.Group(); rev.position.set(2.6, 0, 17); A.add(rev); named.rev = rev;
  add(cyl(1.25, 1.25, 0.18, 32), M.brass, 0, 2.5, 0, rev); add(cyl(1.25, 1.25, 0.06, 32), M.steelDark, 0, 0.03, 0, rev);
  const wings = new THREE.Group(); wings.position.y = 1.25; rev.add(wings); named.wings = wings;
  for (let k = 0; k < 4; k++) { const wgl = add(plane(1.15, 2.3), M.glass, 0, 0, 0, wings, { cast: false, nd: false }); wgl.position.set(Math.cos(k * Math.PI / 2) * 0.6, 0, Math.sin(k * Math.PI / 2) * 0.6); wgl.rotation.y = -k * Math.PI / 2; const fr = add(box(0.05, 2.3, 0.05), M.brass, Math.cos(k * Math.PI / 2) * 1.18, 0, Math.sin(k * Math.PI / 2) * 1.18, wings); }
  add(cyl(0.05, 0.05, 2.3, 10), M.brass, 0, 1.25, 0, rev);
  // outside: sidewalk, street, colourful buildings across the road (no signs)
  const sw = add(plane(80, 6, 2), M.concrete, 0, -0.01, 20, A, { cast: false }); sw.rotation.x = -Math.PI / 2;
  const st = add(plane(80, 10, 4), M.street, 0, -0.02, 28, A, { cast: false }); st.rotation.x = -Math.PI / 2;
  const sw2 = add(plane(80, 20, 2), M.concrete, 0, -0.01, 43, A, { cast: false }); sw2.rotation.x = -Math.PI / 2;
  const bcol = [['#e8a25f', '#f6efe2'], ['#7fb3d5', '#ffffff'], ['#d9737a', '#f6efe2'], ['#9fcf8a', '#ffffff'], ['#f2d16b', '#ffffff']];
  for (let i = 0; i < 6; i++) { const [c0, c1] = bcol[i % 5], h = 16 + (i * 7) % 12; const tx = P.tex(P.facade(60 + i, { wall: c0, frame: c1, brick: i % 2 === 0, cols: 3, rows: 3 }), 9 / 6, h / 6); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; add(tbox(9, h, 10, 1), toon({ map: tx }), -22 + i * 9, h / 2, 39, A, { cast: false }); }
  for (const x of [-9, -2, 6, 13]) { add(cyl(0.12, 0.16, 2.6, 8), toon({ color: '#6a4a32' }), x, 1.3, 33.5, A); const c = add(sph(1.4, 14, 10), M.leaf2, x, 3.6, 33.5, A); c.scale.y = 0.9; }
  // wall clock above the elevators: hands only, no numerals
  const clk = new THREE.Group(); clk.position.set(-1.6, 4.35, 0.14); A.add(clk); named.clock = clk;
  { const face = add(cyl(0.55, 0.55, 0.06, 48), toon({ color: '#fbf7ee' }), 0, 0, 0.03, clk); face.rotation.x = Math.PI / 2;
    const rim = add(new THREE.TorusGeometry(0.56, 0.05, 10, 48), M.brass, 0, 0, 0.06, clk);
    const hh = new THREE.Group(); hh.position.z = 0.075; clk.add(hh); add(box(0.05, 0.3, 0.015), M.black, 0, 0.13, 0, hh); named.hourHand = hh;
    const mh = new THREE.Group(); mh.position.z = 0.09; clk.add(mh); add(box(0.035, 0.44, 0.015), M.black, 0, 0.2, 0, mh); named.minHand = mh;
    add(cyl(0.04, 0.04, 0.05, 16), M.brass, 0, 0, 0.1, clk).rotation.x = Math.PI / 2; }
  // abstract art (colour shapes only) + reception desk + benches
  const art = (x, z, ry, cols) => { const g = new THREE.Group(); g.position.set(x, 2.6, z); g.rotation.y = ry; A.add(g); add(box(2.2, 1.6, 0.05), toon({ color: '#fffaf0' }), 0, 0, 0, g, { cast: false }); add(cyl(0.42, 0.42, 0.04, 32), toon({ color: cols[0] }), -0.45, 0.15, 0.04, g, { cast: false }).rotation.x = Math.PI / 2; add(box(0.8, 0.5, 0.04), toon({ color: cols[1] }), 0.45, -0.25, 0.05, g, { cast: false }); add(box(0.3, 1.0, 0.04), toon({ color: cols[2] }), 0.6, 0.25, 0.06, g, { cast: false }); };
  art(-6.98, 5.5, Math.PI / 2, ['#ff8a5c', '#5fa8d3', '#ffd23f']); art(6.98, 5.5, -Math.PI / 2, ['#4caf6a', '#e0574f', '#f2c14e']); art(-6.98, 12, Math.PI / 2, ['#9b5bc4', '#ffd23f', '#5fa8d3']);
  const desk = new THREE.Group(); desk.position.set(4.6, 0, 11); A.add(desk);
  add(box(3.2, 1.1, 0.9), toon({ color: '#c99a6b' }), 0, 0.55, 0, desk); add(box(3.3, 0.08, 1.0), toon({ color: '#f1ece2' }), 0, 1.14, 0, desk); add(box(3.1, 0.2, 0.04), M.brass, 0, 0.85, 0.47, desk);
  for (const x of [-4.8, -2.4]) { add(box(1.6, 0.08, 0.55), toon({ color: '#5f7f9a' }), x, 0.46, 13.5, A); for (const s of [-1, 1]) add(box(0.08, 0.42, 0.5), M.steelDark, x + s * 0.7, 0.21, 13.5, A); }
}
// ---------- cabin ----------
const CAB = { x0: -1.1, x1: 1.1, z0: -2.3, z1: -0.2, h: 2.55 };
const cab = new THREE.Group(); A.add(cab);
{
  const cf = add(plane(2.2, 2.1, 1.4), M.cabFloor, 0, 0.005, -1.25, cab, { cast: false }); cf.rotation.x = -Math.PI / 2;
  const wallL = add(tbox(0.06, CAB.h, 2.2, 1.2), M.steel, -1.13, CAB.h / 2, -1.2, cab, { cast: false }); named.cabL = wallL;
  const wallR = add(tbox(0.06, CAB.h, 2.2, 1.2), M.steel, 1.13, CAB.h / 2, -1.2, cab, { cast: false }); named.cabR = wallR;
  const back = new THREE.Group(); cab.add(back); named.cabBack = back;
  add(tbox(2.3, CAB.h, 0.06, 1.2), M.steel, 0, CAB.h / 2, -2.33, back, { cast: false });
  add(box(1.62, 1.42, 0.02), M.mirror, 0, 1.66, -2.29, back, { cast: false }); add(box(1.7, 1.5, 0.012), M.steelDark, 0, 1.66, -2.3, back, { cast: false });
  // front inner wall (cabin side), opening x∈[-0.6,0.6]
  const fL = add(tbox(0.5, CAB.h, 0.08, 1.2), M.steel, -0.85, CAB.h / 2, -0.16, cab, { cast: false }); named.cabFL = fL;
  add(tbox(0.5, CAB.h, 0.08, 1.2), M.steel, 0.85, CAB.h / 2, -0.16, cab, { cast: false });
  add(tbox(1.2, CAB.h - 2.2, 0.08, 1.2), M.steel, 0, 2.2 + (CAB.h - 2.2) / 2, -0.16, cab, { cast: false });
  // ceiling + light panel
  add(box(2.3, 0.06, 2.3), M.steelDark, 0, CAB.h + 0.03, -1.2, cab, { cast: false, nd: false });
  named.cabLight = add(box(1.5, 0.03, 1.4), basic('#fffaf0'), 0, CAB.h - 0.01, -1.25, cab, { cast: false });
  // handrails (back + sides)
  const rail = (x0, z0, x1, z1, par = cab) => { const L = Math.hypot(x1 - x0, z1 - z0), r = add(cyl(0.022, 0.022, L, 12), M.brass, (x0 + x1) / 2, 0.92, (z0 + z1) / 2, par, { cast: false }); r.rotation.z = Math.PI / 2; r.rotation.y = -Math.atan2(z1 - z0, x1 - x0); };
  rail(-0.95, -2.2, 0.95, -2.2, back); rail(-1.04, -2.1, -1.04, -0.5); rail(1.04, -2.1, 1.04, -0.5);
  for (const [x, z] of [[-0.8, -2.25], [0.8, -2.25]]) add(box(0.03, 0.03, 0.06), M.brass, x, 0.92, z, back, { cast: false });
  for (const [x, z] of [[-1.08, -1.9], [-1.08, -0.7], [1.08, -1.9], [1.08, -0.7]]) add(box(0.03, 0.03, 0.06), M.brass, x, 0.92, z, cab, { cast: false });
  // door leaves: brass outside (+z), steel inside (-z), green sensor strip on the inner edge
  const leafMat = [M.steelDark, M.steelDark, M.steelDark, M.steelDark, M.brass, M.steel];
  named.leaves = [-1, 1].map((s) => {
    const g = new THREE.Group(); g.position.set(s * 0.3, 0, -0.08); cab.add(g);
    add(box(0.6, 2.2, 0.05), leafMat, 0, 1.1, 0, g);
    const strip = add(box(0.014, 1.9, 0.056), basic('#3cff7a'), -s * 0.296, 1.1, 0, g, { cast: false }); strip.userData.ndSkip = true; g.userData.strip = strip;
    return g;
  });
  // sensor beams across the gap (visible when doors hold for someone)
  const beams = new THREE.Group(); cab.add(beams); named.beams = beams;
  for (let k = 0; k < 7; k++) { const b = add(cyl(0.004, 0.004, 1, 6), new THREE.MeshBasicMaterial({ color: '#7dffa8', transparent: true, opacity: 0.8 }), 0, 0.2 + k * 0.28, -0.08, beams, { cast: false, nd: false }); b.rotation.z = Math.PI / 2; }
}
// briefcase set down on the cabin floor
const bcase = new THREE.Group(); cab.add(bcase); named.bcase = bcase;
{ add(box(0.46, 0.32, 0.11), toon({ color: '#8a5530' }), 0, 0.17, 0, bcase); add(box(0.47, 0.03, 0.115), toon({ color: '#5e3820' }), 0, 0.27, 0, bcase);
  const h = add(new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI), toon({ color: '#4a2d1a' }), 0, 0.33, 0, bcase); add(box(0.06, 0.04, 0.12), toon({ color: '#e8c45a' }), 0, 0.24, 0, bcase); }
// ---------- button panel (front inner wall, right of the door, facing -z) ----------
const PANEL = { x: 0.86, y: 1.22, z: -0.205 };
const panel = new THREE.Group(); panel.position.set(PANEL.x, 0, PANEL.z); cab.add(panel);
const btn = {};
{
  add(box(0.3, 0.98, 0.014), M.steelDark, 0, 1.2, -0.004, panel, { cast: false });
  add(box(0.26, 0.94, 0.006), M.steel, 0, 1.2, -0.012, panel, { cast: false });
  const button = (x, y, r = 0.027) => {
    const g = new THREE.Group(); g.position.set(x, y, -0.016); panel.add(g);
    const ring = add(new THREE.TorusGeometry(r + 0.006, 0.0045, 8, 28), toon({ color: '#c9cfd6', emissive: '#000000' }), 0, 0, -0.004, g, { cast: false });
    const cap = add(cyl(r, r, 0.014, 28), toon({ color: '#eceff2', emissive: '#000000' }), 0, 0, -0.008, g, { cast: false }); cap.rotation.x = Math.PI / 2;
    g.userData = { ring, cap }; return g;
  };
  btn.floors = []; for (let k = 0; k < 6; k++) btn.floors.push(button(0, 1.55 - k * 0.088));
  btn.open = button(-0.062, 0.98, 0.03); btn.close = button(0.062, 0.98, 0.03);
  const iconTex = { open: [P.tex(P.doorIcon('open', false)), P.tex(P.doorIcon('open', true))], close: [P.tex(P.doorIcon('close', false)), P.tex(P.doorIcon('close', true))] };
  for (const k of ['open', 'close']) { const ic = add(new THREE.CircleGeometry(0.0285, 32), new THREE.MeshBasicMaterial({ map: iconTex[k][0] }), 0, 0, -0.0156, btn[k], { cast: false }); ic.rotation.y = Math.PI; ic.userData.ndSkip = true; btn[k].userData.icon = ic; btn[k].userData.tex = iconTex[k]; }
  // key switch at the bottom: round escutcheon with a dark key-shaped hole (shape only)
  const esc = add(cyl(0.024, 0.024, 0.01, 28), M.brass, 0, 0.84, -0.017, panel, { cast: false }); esc.rotation.x = Math.PI / 2;
  btn.keyhole = new THREE.Group(); btn.keyhole.position.set(0, 0.84, -0.0235); panel.add(btn.keyhole);
  const kh1 = add(new THREE.CircleGeometry(0.0062, 16), basic('#141414'), 0, 0.004, 0, btn.keyhole, { cast: false }); kh1.rotation.y = Math.PI;
  const kh2 = add(plane(0.0045, 0.014), basic('#141414'), 0, -0.004, 0, btn.keyhole, { cast: false }); kh2.rotation.y = Math.PI;
  kh1.userData.ndSkip = kh2.userData.ndSkip = true;
  // floor indicator dots on the panel top
  btn.dots = []; for (let k = 0; k < 5; k++) btn.dots.push(add(sph(0.0085, 10, 8), toon({ color: '#5a4a30', emissive: '#000000' }), -0.072 + k * 0.036, 1.64, -0.018, panel, { cast: false }));
}

// =====================================================================================
// SET B — blueprint cross-section of the panel (M3)
// =====================================================================================
const B = mkSet('blueprint');
const bpS = {};
{
  const bg = add(new THREE.BoxGeometry(40, 30, 40), M.bp, 0, 3, 0, B, { cast: false, receive: false, nd: false });
  // panel outline frame (cut-away housing)
  const fr = (w, h, x, y) => add(box(w, h, 0.03), M.bpPale, x, y, 0, B);
  fr(0.46, 0.03, 0, 2.2); fr(0.46, 0.03, 0, 1.0); fr(0.03, 1.2, -0.23, 1.6); fr(0.03, 1.2, 0.23, 1.6);
  const back = add(box(0.46, 1.2, 0.02), M.bpBlue, 0, 1.6, -0.34, B);
  for (const s of [-1, 1]) add(box(0.02, 1.2, 0.34), M.bpBlue, s * 0.23, 1.6, -0.17, B);
  const wireCols = ['#ff4d4d', '#ffd23f', '#3ccf62', '#ff9f1c', '#c86bff', '#4fd8ff', '#ff6fa8'];
  const CTRL = new THREE.Vector3(0.05, 0.62, -0.2);
  add(box(0.34, 0.2, 0.14), M.bpBlue, CTRL.x, CTRL.y, CTRL.z, B); add(box(0.12, 0.1, 0.02), M.bpPale, CTRL.x, CTRL.y, CTRL.z + 0.075, B);
  for (let k = 0; k < 6; k++) add(box(0.012, 0.03, 0.01), M.gold, CTRL.x - 0.05 + k * 0.02, CTRL.y + 0.065, CTRL.z + 0.075, B);
  const tube = (pts, col, r = 0.011) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 48, r, 8), toon({ color: col }), 0, 0, 0, B);
  const bbtn = (x, y, r = 0.035) => {
    const g = new THREE.Group(); g.position.set(x, y, 0.03); B.add(g);
    const cap = add(cyl(r, r, 0.035, 28), toon({ color: '#a8d2ff', emissive: '#000000' }), 0, 0, 0, g); cap.rotation.x = Math.PI / 2;
    add(box(0.05, 0.05, 0.05), M.bpBlue, 0, 0, -0.045, g);
    g.userData.cap = cap; return g;
  };
  bpS.floors = [];
  for (let k = 0; k < 6; k++) {
    const y = 2.05 - k * 0.12, b = bbtn(0, y); bpS.floors.push(b);
    const xo = -0.2 + k * 0.012, zo = -0.12 - k * 0.025;
    tube([[0, y, -0.06], [-0.05, y, zo], [xo, y - 0.04, zo], [xo, 0.9, zo], [CTRL.x - 0.13 + k * 0.022, CTRL.y + 0.1, CTRL.z + 0.02]], wireCols[k]);
  }
  bpS.open = bbtn(-0.075, 1.22); bpS.close = bbtn(0.075, 1.22);
  tube([[-0.075, 1.22, -0.06], [-0.09, 1.18, -0.27], [-0.11, 0.95, -0.27], [CTRL.x - 0.02, CTRL.y + 0.1, CTRL.z + 0.03]], wireCols[6]);
  // the close button's wire: cut. One end dangles from the button (pivot group), the other sticks up from the controller.
  const dang = new THREE.Group(); dang.position.set(0.075, 1.22, -0.07); B.add(dang); bpS.dangle = dang;
  const dpts = [[0, 0, 0], [0.0, -0.02, -0.05], [0.02, -0.12, -0.07], [0.03, -0.24, -0.06]];
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dpts.map((p) => new THREE.Vector3(...p))), 32, 0.011, 8), toon({ color: '#ff4d4d' }), 0, 0, 0, dang);
  const tip = add(cyl(0.012, 0.006, 0.03, 10), M.copper, 0.03, -0.265, -0.06, dang); bpS.tip = tip;
  tube([[CTRL.x + 0.12, CTRL.y + 0.1, CTRL.z + 0.03], [0.17, 0.76, -0.12], [0.16, 0.83, -0.1]], '#ff4d4d');
  add(cyl(0.012, 0.006, 0.03, 10), M.copper, 0.16, 0.855, -0.1, B);
  // ---- door mechanism: hourglass + gears + mini doors (below) ----
  const MX = 0.0, MY = -0.15;
  bpS.hg = new THREE.Group(); bpS.hg.position.set(MX + 0.28, MY + 0.05, -0.05); B.add(bpS.hg);
  const prof = []; for (let i = 0; i <= 24; i++) { const y = -0.36 + 0.72 * i / 24; prof.push(new THREE.Vector2(0.026 + 0.19 * Math.pow(Math.sin(Math.PI * Math.abs(y) / 0.38), 0.7), y)); }
  bpS.hgProf = prof;
  add(new THREE.LatheGeometry(prof, 32), M.bpGlass, 0, 0, 0, bpS.hg, { cast: false });
  for (const y of [-0.39, 0.39]) add(cyl(0.25, 0.25, 0.05, 32), M.bpLight, 0, y, 0, bpS.hg);
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3 + 0.4; add(cyl(0.012, 0.012, 0.78, 8), M.bpPale, Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22, bpS.hg); }
  bpS.sandTop = add(new THREE.BufferGeometry(), M.sand, 0, 0, 0, bpS.hg, { cast: false });
  bpS.sandBot = add(cyl(0.01, 0.18, 0.1, 28), M.sand, 0, -0.3, 0, bpS.hg, { cast: false });
  bpS.stream = add(cyl(0.006, 0.006, 1, 8), M.sand, 0, -0.15, 0, bpS.hg, { cast: false });
  const gearShape = (r, n, dt = 0.16) => { const s = new THREE.Shape(); const m = n * 4; for (let i = 0; i <= m; i++) { const a = i / m * Math.PI * 2, k = i % 4, rr = (k === 1 || k === 2) ? r : r * (1 - dt); const x = rr * Math.cos(a), y = rr * Math.sin(a); if (i) s.lineTo(x, y); else s.moveTo(x, y); } for (let h = 0; h < 4; h++) { const a = h * Math.PI / 2 + 0.6, p = new THREE.Path(); p.absarc(Math.cos(a) * r * 0.48, Math.sin(a) * r * 0.48, r * 0.17, 0, Math.PI * 2, true); s.holes.push(p); } return s; };
  const gear = (r, n, x, y, z, mat) => { const geo = new THREE.ExtrudeGeometry(gearShape(r, n), { depth: 0.04, bevelEnabled: false, curveSegments: 4 }); geo.translate(0, 0, -0.02); const m = add(geo, mat, x, y, z, B); add(cyl(r * 0.12, r * 0.12, 0.08, 16), M.bpPale, x, y, z, B).rotation.x = Math.PI / 2; return m; };
  bpS.g1 = gear(0.26, 14, MX - 0.22, MY + 0.12, -0.18, M.gold); bpS.g2 = gear(0.15, 8, MX - 0.22 + 0.385, MY - 0.2, -0.18, M.gold2); bpS.g3 = gear(0.11, 6, MX - 0.33, MY - 0.4, -0.18, M.gold2);
  // mini door model driven by the gears
  const DX = MX - 0.02, DY = MY - 0.78;
  add(box(0.58, 0.03, 0.06), M.bpPale, DX, DY + 0.25, -0.08, B); add(box(0.58, 0.03, 0.06), M.bpPale, DX, DY - 0.2, -0.08, B);
  for (const s of [-1, 1]) add(box(0.03, 0.48, 0.06), M.bpPale, DX + s * 0.29, DY + 0.025, -0.08, B);
  bpS.mini = [-1, 1].map((s) => add(box(0.13, 0.42, 0.03), M.bpLight, DX + s * 0.2, DY + 0.025, -0.06, B));
  bpS.miniX = DX; bpS.rack = add(box(0.5, 0.03, 0.03), M.gold, DX - 0.1, DY + 0.29, -0.12, B);
  add(box(0.03, 0.28, 0.03), M.bpPale, MX - 0.33, DY + 0.44, -0.12, B);
}

// =====================================================================================
// SET C — psychology lab (M6)
// =====================================================================================
const C = mkSet('lab');
const lab = {};
{
  const fl = add(plane(12, 12, 1.2), M.labFloor, 0, 0, 0, C, { cast: false }); fl.rotation.x = -Math.PI / 2;
  add(box(12, 4.2, 0.2), M.labWall, 0, 2.1, -4.1, C, { cast: false });
  add(box(0.2, 4.2, 12), M.labWall2, -5.1, 2.1, 0, C, { cast: false }); add(box(0.2, 4.2, 12), M.labWall2, 5.1, 2.1, 0, C, { cast: false });
  add(box(12, 0.12, 0.06), M.labBlue, 0, 0.06, -3.98, C, { cast: false });
  const ce = add(plane(12, 12), M.white, 0, 4.2, 0, C, { cast: false }); ce.rotation.x = Math.PI / 2;
  for (let i = -1; i <= 1; i++) add(box(1.8, 0.04, 1.0), M.lightPanel, i * 3, 4.17, -1, C, { cast: false });
  // pedestal for the brain
  add(cyl(0.48, 0.52, 0.76, 36), M.white, 0, 0.38, -1.3, C); add(cyl(0.5, 0.5, 0.05, 36), M.labBlue, 0, 0.78, -1.3, C);
  // stress gauge on the back wall: white frame + live canvas face
  const gc = document.createElement('canvas'); gc.width = 128; gc.height = 512; lab.gaugeCanvas = gc;
  lab.gaugeTex = new THREE.CanvasTexture(gc); lab.gaugeTex.colorSpace = THREE.SRGBColorSpace;
  add(box(0.6, 1.76, 0.08), M.white, -1.0, 1.55, -3.96, C, { cast: false });
  const gp = add(plane(0.44, 1.64), new THREE.MeshBasicMaterial({ map: lab.gaugeTex }), -1.0, 1.55, -3.91, C, { cast: false }); gp.userData.ndSkip = true;
  lab.bulb = add(sph(0.17, 24, 16), toon({ color: '#ff3b30', emissive: '#661010' }), -1.0, 0.45, -3.85, C);
  for (const y of [1.5, 2.2]) { add(box(1.6, 0.05, 0.35), M.white, 1.7, y, -3.85, C); for (let k = 0; k < 4; k++) { const col = ['#ff6f61', '#4fd8ff', '#ffd23f', '#9b5bc4'][(k + (y > 2 ? 1 : 0)) % 4]; if (k % 2) add(cyl(0.07, 0.07, 0.26, 16), toon({ color: col }), 1.15 + k * 0.38, y + 0.16, -3.82, C); else { add(sph(0.12, 16, 12), toon({ color: col }), 1.15 + k * 0.38, y + 0.14, -3.82, C); add(cyl(0.03, 0.03, 0.12, 10), M.labWall2, 1.15 + k * 0.38, y + 0.29, -3.82, C); } } }
  // shelves with colourful flasks (no labels)
  for (const y of [1.3, 2.0, 2.7]) {
    add(box(0.4, 0.04, 2.6), M.white, -4.85, y, -1.6, C);
    const r = P.rng(Math.round(y * 10));
    for (let k = 0; k < 6; k++) { const col = ['#ff6f61', '#4fd8ff', '#ffd23f', '#9b5bc4', '#3ccf62'][(k + Math.round(y * 3)) % 5], z = -2.7 + k * 0.42 + r() * 0.1;
      if (k % 2) { add(cyl(0.07, 0.07, 0.24, 16), toon({ color: col }), -4.82, y + 0.14, z, C); } else { add(sph(0.11, 16, 12), toon({ color: col }), -4.82, y + 0.13, z, C); add(cyl(0.03, 0.03, 0.12, 10), M.labWall2, -4.82, y + 0.27, z, C); } }
  }
  // desk with a blank monitor, plant
  add(box(1.6, 0.06, 0.8), M.white, 3.3, 0.78, -3.3, C); for (const s of [-1, 1]) add(box(0.06, 0.78, 0.7), M.labBlue, 3.3 + s * 0.74, 0.39, -3.3, C);
  add(box(0.8, 0.5, 0.05), M.black, 3.3, 1.35, -3.55, C); add(box(0.72, 0.42, 0.01), basic('#8fd0ff'), 3.3, 1.35, -3.52, C, { cast: false }); add(box(0.08, 0.3, 0.08), M.black, 3.3, 0.95, -3.55, C);
  add(cyl(0.22, 0.18, 0.4, 20), M.potDark, 4.4, 0.2, -2.0, C); for (let i = 0; i < 9; i++) { const a = i * 0.7; const lf = add(sph(1, 10, 8), i % 2 ? M.leaf : M.leaf2, 4.4 + Math.cos(a) * 0.12, 0.7 + (i % 3) * 0.12, -2.0 + Math.sin(a) * 0.12, C); lf.scale.set(0.08, 0.3, 0.16); lf.rotation.set(Math.cos(a) * 0.7, -a, Math.sin(a) * 0.7); }
  // big soft wall panels for colour
  add(box(1.4, 1.8, 0.04), toon({ color: '#ffd9a8' }), 1.9, 2.2, -3.98, C, { cast: false }); add(box(1.0, 1.0, 0.04), toon({ color: '#bfe3c8' }), 3.6, 2.6, -3.98, C, { cast: false });
}

// =====================================================================================
// SET D — New-York-like crossing (M7) + endless pole field (M8)
// =====================================================================================
const D = mkSet('city');
const city = {};
{
  const ground = add(plane(600, 600, 6), M.street, 0, 0, 0, D, { cast: false }); ground.rotation.x = -Math.PI / 2;
  // corner blocks (sidewalks) — avenue along z (|x|<7), street along x (|z|<6)
  const blocks = new THREE.Group(); D.add(blocks); city.blocks = blocks;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const b = add(tbox(60, 0.16, 60, 2), M.concrete, sx * (7 + 30), 0.08, sz * (6 + 30), blocks, { cast: false }); }
  // markings
  const mark = new THREE.Group(); D.add(mark); city.mark = mark;
  for (let i = 0; i < 13; i++) { const s = add(plane(0.5, 3.2), M.stripe, -6 + i * 1.0, 0.012, 7.9, mark, { cast: false }); s.rotation.x = -Math.PI / 2; const s2 = add(plane(0.5, 3.2), M.stripe, -6 + i * 1.0, 0.012, -7.9, mark, { cast: false }); s2.rotation.x = -Math.PI / 2; }
  for (let i = 0; i < 11; i++) { const s = add(plane(3.2, 0.5), M.stripe, 8.9, 0.012, -5 + i * 1.0, mark, { cast: false }); s.rotation.x = -Math.PI / 2; const s2 = add(plane(3.2, 0.5), M.stripe, -8.9, 0.012, -5 + i * 1.0, mark, { cast: false }); s2.rotation.x = -Math.PI / 2; }
  for (const z0 of [-60, 10]) for (const dx of [-0.12, 0.12]) { const l = add(plane(0.1, 50), M.yline, dx, 0.011, z0 + 25, mark, { cast: false }); l.rotation.x = -Math.PI / 2; }
  for (let z = 12; z < 70; z += 4) for (const x of [-3.5, 3.5]) { const l = add(plane(0.12, 2), M.stripe, x, 0.011, z, mark, { cast: false }); l.rotation.x = -Math.PI / 2; const l2 = add(plane(0.12, 2), M.stripe, x, 0.011, -z, mark, { cast: false }); l2.rotation.x = -Math.PI / 2; }
  // buildings on the four corners: brownstones near the crossing, towers behind
  const bld = new THREE.Group(); D.add(bld); city.bld = bld;
  const bcols = ['#9a5a3e', '#b0694a', '#8a4f3a', '#c08a5a', '#7d4a3a', '#a86a4e'];
  const brown = (x, z, w, d, h, i, rotY) => {
    const g = new THREE.Group(); g.position.set(x, 0.16, z); g.rotation.y = rotY; bld.add(g);
    const tx = P.tex(P.facade(80 + i, { wall: bcols[i % 6], cols: 3, rows: 3 }), w / 6.2, h / 8.4); tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    add(tbox(w, h, d, 1), toon({ map: tx }), 0, h / 2, 0, g, { cast: false });
    add(box(w + 0.4, 0.45, d + 0.4), toon({ color: '#e9dcc4' }), 0, h + 0.2, 0, g, { cast: false });
    for (let k = 0; k < 4; k++) add(box(2.2, 0.22, 0.45), toon({ color: '#b48c6a' }), -w * 0.25, 0.11 + k * 0.22, d / 2 + 1.6 - k * 0.45, g);
    add(box(1.2, 2.2, 0.1), toon({ color: '#3d2a22' }), -w * 0.25, 1.9, d / 2 + 0.03, g, { cast: false });
    if (i % 3 === 0) { const wt = new THREE.Group(); wt.position.set(w * 0.2, h + 0.4, -d * 0.2); g.add(wt); for (const [a, b] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) add(cyl(0.08, 0.08, 1.6, 6), M.lamp, a, 0.8, b, wt); add(cyl(1.2, 1.2, 2.2, 16), toon({ color: '#8a6040' }), 0, 2.7, 0, wt); add(new THREE.ConeGeometry(1.3, 0.9, 16), toon({ color: '#5a4030' }), 0, 4.25, 0, wt); }
    return g;
  };
  const tower = (x, z, w, d, h, i) => { const tx = P.tex(P.towerTex(90 + i, { cols: 6, rows: 8 }), w / 9, h / 12); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; const m = add(tbox(w, h, d, 1), toon({ map: tx, color: ['#ffffff', '#f3e7d6', '#dfe9ff'][i % 3] }), x, h / 2, z, bld, { cast: false }); add(box(w * 0.6, 3, d * 0.6), toon({ color: '#cfd6de' }), x, h + 1.5, z, bld, { cast: false }); return m; };
  let bi = 0;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (let k = 0; k < 4; k++) { const w = 6.2, h = 13 + ((bi * 5) % 6); brown(sx * (11 + 3.1 + k * 6.4), sz * (10 + 5.5), w, 11, h, bi++, sz > 0 ? Math.PI : 0); }
    for (let k = 0; k < 4; k++) { const w = 6.2, h = 14 + ((bi * 7) % 5); brown(sx * (11 + 5.5), sz * (21 + 3.1 + 6.4 * k), w, 11, h, bi++, sx > 0 ? -Math.PI / 2 : Math.PI / 2); }
    for (let k = 0; k < 3; k++) tower(sx * (30 + k * 14), sz * (34 + (k % 2) * 12), 12, 12, 40 + ((k + bi) * 13) % 45, k + bi);
  }
  for (let k = 0; k < 10; k++) tower((k - 4.5) * 16, -120 - (k % 3) * 20, 14, 14, 60 + (k * 17) % 60, k);
  // street furniture
  const furn = new THREE.Group(); D.add(furn); city.furn = furn;
  const treeAt = (x, z) => { add(cyl(0.12, 0.16, 2.4, 8), M.trunk, x, 1.2 + 0.16, z, furn); const c = add(sph(1.3, 14, 10), M.tree, x, 3.4, z, furn); c.scale.y = 0.9; };
  for (const [x, z] of [[-10.2, 15], [-10.2, 24], [10.2, 14], [10.2, 26], [-10.2, -14], [10.2, -18], [-18, 8.6], [18, 8.6], [-26, 8.6]]) treeAt(x, z);
  // subway grate on the sidewalk (steam source)
  add(box(1.6, 0.02, 0.9), M.manhole, -9.6, 0.17, 16.5, furn, { cast: false });
  const hyd = (x, z) => { add(cyl(0.16, 0.18, 0.6, 14), M.hydrant, x, 0.46, z, furn); add(sph(0.16, 12, 8), M.hydrant, x, 0.78, z, furn); };
  hyd(-9.5, 9.6); hyd(8.6, -9.4);
  const lampAt = (x, z, s) => { add(cyl(0.07, 0.09, 6, 10), M.lamp, x, 3.16, z, furn); const arm = add(box(1.4, 0.08, 0.08), M.lamp, x + s * 0.7, 6.1, z, furn); add(box(0.5, 0.15, 0.25), toon({ color: '#f6f1d8' }), x + s * 1.35, 6.0, z, furn); };
  lampAt(-7.9, -7.5, 1); lampAt(7.9, 11, -1);
  // traffic signals on mast arms
  const sig = (x, z, s, rot) => { const g = new THREE.Group(); g.position.set(x, 0.16, z); g.rotation.y = rot; furn.add(g); add(cyl(0.1, 0.12, 5.8, 10), M.pole, 0, 2.9, 0, g); add(box(4.2, 0.12, 0.12), M.pole, s * 2.1, 5.6, 0, g); const h = add(box(0.36, 1.0, 0.3), M.pole, s * 3.6, 5.0, 0, g);
    [['#3a1010', 0.3], ['#3a3010', 0], ['#2ee86a', -0.3]].forEach(([c, dy]) => { const l = add(sph(0.11, 12, 8), basic(c), s * 3.6, 5.0 + dy, 0.16, g, { cast: false }); }); };
  sig(-7.7, -6.6, 1, 0); sig(7.7, 6.6, -1, 0);
  // the hero push-button pole on the south-west corner (sidewalk at x<-7, z>6)
  const POLE = new THREE.Vector3(-7.7, 0.16, 6.8); city.POLE = POLE;
  const hp = new THREE.Group(); hp.position.copy(POLE); hp.rotation.y = 2.62; D.add(hp); city.hero = hp;
  add(cyl(0.065, 0.075, 3.2, 14), M.pole, 0, 1.6, 0, hp);
  const bx = add(box(0.15, 0.24, 0.1), M.yellowBox, 0.0, 1.12, 0.1, hp); city.box = bx;
  const hb = add(cyl(0.04, 0.04, 0.03, 24), M.chrome, 0.0, 1.13, 0.16, hp); hb.rotation.x = Math.PI / 2; city.heroBtn = hb;
  add(cyl(0.05, 0.05, 0.01, 24), M.pole, 0.0, 1.13, 0.152, hp).rotation.x = Math.PI / 2;
  city.sigTex = { hand: P.tex(P.pedSignal('hand')), walk: P.tex(P.pedSignal('walk')) };
  add(box(0.5, 0.28, 0.22), M.pole, 0, 2.75, 0.14, hp);
  const sface = add(plane(0.46, 0.23), new THREE.MeshBasicMaterial({ map: city.sigTex.hand }), 0, 2.75, 0.252, hp, { cast: false }); sface.userData.ndSkip = true; city.sface = sface;
  // manhole + steam source
  add(cyl(0.45, 0.45, 0.02, 24), M.manhole, -2.5, 0.01, 3.5, D, { cast: false });
  // taxis (positions driven per frame)
  const taxi = () => {
    const g = new THREE.Group(); D.add(g);
    add(box(1.8, 0.62, 4.3), M.taxi, 0, 0.55, 0, g); add(box(1.62, 0.56, 2.2), M.taxi, 0, 1.12, -0.2, g);
    add(box(1.64, 0.4, 2.0), M.taxiDark, 0, 1.14, -0.2, g, { cast: false });
    add(box(0.5, 0.18, 0.28), toon({ color: '#fff6c8' }), 0, 1.5, -0.1, g);
    add(box(1.84, 0.2, 0.15), M.taxiDark, 0, 0.32, 2.17, g); add(box(1.84, 0.2, 0.15), M.taxiDark, 0, 0.32, -2.17, g);
    for (const s of [-1, 1]) { add(box(0.3, 0.14, 0.04), basic('#fffbe8'), s * 0.62, 0.66, 2.16, g, { cast: false }); add(box(0.3, 0.12, 0.04), basic('#ff4a3a'), s * 0.62, 0.66, -2.16, g, { cast: false }); }
    add(box(1.82, 0.05, 1.5), M.taxiDark, 0, 0.7, -0.2, g, { cast: false });
    for (const [x, z] of [[-0.9, 1.35], [0.9, 1.35], [-0.9, -1.35], [0.9, -1.35]]) { const w = add(cyl(0.34, 0.34, 0.24, 16), M.tire, x, 0.34, z, g); w.rotation.z = Math.PI / 2; }
    return g;
  };
  city.taxis = [taxi(), taxi(), taxi(), taxi()];
}
// ---------- M8: endless field of push-button poles ----------
const F8 = new THREE.Group(); D.add(F8); city.field = F8;
const FIELD = [];
{
  const r = P.rng(808);
  for (let i = -14; i <= 14; i++) for (let j = -16; j <= 10; j++) {
    const x = city.POLE.x + i * 4.6 + (j % 2) * 1.2, z = city.POLE.z + j * 5.2;
    if (i === 0 && j === 0) continue;
    FIELD.push({ x, z, v: Math.floor(r() * 4), ok: r() < 0.12, ph: r() * 10, dx: (r() - 0.5) * 0.3 });
  }
  const N = FIELD.length, mtx = new THREE.Matrix4();
  const mk = (geo, mat, cast = false) => { const m = new THREE.InstancedMesh(geo, mat, N); m.castShadow = cast; m.receiveShadow = true; F8.add(m); return m; };
  const poles = mk(cyl(0.065, 0.075, 3.2, 10), M.pole), boxes = mk(box(0.15, 0.24, 0.1), M.yellowBox), heads = mk(box(0.5, 0.28, 0.22), M.pole);
  const zebra = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); for (let i = 0; i < 8; i++) { g.fillStyle = '#f4f4f0'; g.fillRect(8 + i * 31, 0, 18, 128); } return P.tex(c); })();
  const zeb = mk(plane(3.6, 1.6), new THREE.MeshBasicMaterial({ map: zebra, transparent: true, alphaTest: 0.5 }));
  FIELD.forEach((u, k) => {
    mtx.makeTranslation(u.x, 1.76, u.z); poles.setMatrixAt(k, mtx);
    mtx.makeTranslation(u.x, 1.28, u.z + 0.1); boxes.setMatrixAt(k, mtx);
    mtx.makeTranslation(u.x, 2.91, u.z + 0.14); heads.setMatrixAt(k, mtx);
    mtx.makeRotationX(-Math.PI / 2).setPosition(u.x + 1.6, 0.02, u.z + 2.0); zeb.setMatrixAt(k, mtx);
  });
  // billboard people + x-ray badges: 4 outfit variants, broken / ok badges (instanced, rotated to the camera per frame)
  const bbGeo = new THREE.PlaneGeometry(1, 1); bbGeo.translate(0, 0.5, 0);
  const mkTex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.scale(w / 600, h / 1000); fn(new T.Pen(g)); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  city.people = [0, 1, 2, 3].map((v) => {
    const tex = mkTex(240, 400, (p) => T.castFront(p, T.crowdOutfit(v + 1), { expr: ['impatient', 'worried', 'neutral', 'hopeful'][v], R: 'press', L: v % 2 ? 'strap' : 'hang', seed: 3 + v }));
    const ids = FIELD.map((u, k) => k).filter((k) => FIELD[k].v === v);
    const m = new THREE.InstancedMesh(bbGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }), ids.length);
    m.userData.nd = cardNd(tex); m.castShadow = false; F8.add(m); return { m, ids };
  });
  city.badges = [false, true].map((ok) => {
    const tex = mkTex(256, 256 * 1000 / 600, (p) => T.fxXray(p, ok ? 'ok' : 'wire', 0.6));
    const ids = FIELD.map((u, k) => k).filter((k) => FIELD[k].ok === ok);
    const m = new THREE.InstancedMesh(bbGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }), ids.length);
    m.userData.nd = cardNd(tex); m.castShadow = false; F8.add(m); return { m, ids };
  });
}
const yawTo = (x, z, cam) => Math.atan2(cam.position.x - x, cam.position.z - z);
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3(), yAx = new THREE.Vector3(0, 1, 0);
function updateField(cam, f, press) {
  for (const { m, ids } of city.people) { ids.forEach((k, n) => { const u = FIELD[k]; const bob = press ? 0.04 * Math.max(0, Math.sin(f * 0.9 + u.ph)) : 0; tmpQ.setFromAxisAngle(yAx, yawTo(u.x - 0.75, u.z + 0.55, cam)); tmpS.set(1.6, 2.66, 1.6); tmpP.set(u.x - 0.75 + u.dx + bob, 0.16, u.z + 0.55); tmpM.compose(tmpP, tmpQ, tmpS); m.setMatrixAt(n, tmpM); }); m.instanceMatrix.needsUpdate = true; }
  for (const { m, ids } of city.badges) { ids.forEach((k, n) => { const u = FIELD[k]; tmpQ.setFromAxisAngle(yAx, yawTo(u.x, u.z, cam)); tmpS.set(1.1, 1.83, 1.1); tmpP.set(u.x + 0.6, 2.0, u.z + 0.3); tmpM.compose(tmpP, tmpQ, tmpS); m.setMatrixAt(n, tmpM); }); m.instanceMatrix.needsUpdate = true; }
}

// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25; // canvas px, card height in metres (design 600x1000 -> 2.25 m)
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.5));
class Card {
  constructor() {
    [this.c, this.g] = (() => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; return [c, c.getContext('2d')]; })();
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 }, inkCol: { value: new THREE.Color('#030204') },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 }, flashCol: { value: new THREE.Color(1, 1, 1) }, scan: { value: -1 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash, scan; uniform vec3 inkCol, lift, gain, flashCol; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(4./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;
      if (card) ds = 1e4;
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9);
    }
    return e * (1. - smoothstep(60., 260., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, inkCol, e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    if (scan > -0.5) { float dd = vUv.y - scan; c += vec3(.35,.85,1.)*(smoothstep(.03,.0,abs(dd))*1.1 + step(0.,dd)*.12*smoothstep(.25,.0,dd)); }
    c = mix(c, flashCol, flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<32;i++){ float fi = float(i); float r = sqrt((fi+.5)/32.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` }));
dofScene.children[0].material.toneMapped = false;

// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog || '#ffffff'); scene.fog.near = L.fogNear ?? 400; scene.fog.far = L.fogFar ?? 900;
  skyU.top.value.set(L.skyTop || '#7fb6ee'); skyU.hor.value.set(L.skyHor || '#d8ecff');
  inkU.sat.value = L.sat ?? 1.08; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000'); inkU.inkCol.value.set(L.ink || '#030204');
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 60); sun.target.position.copy(focus);
  const ext = L.shadowExt || 8, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
}
const setBtn = (g, lit, push = 0, col = '#ffb03a') => {
  const { ring, cap } = g.userData; ring.material.emissive.set(lit > 0 ? col : '#000000'); ring.material.emissiveIntensity = lit;
  cap.material.emissive.set(lit > 0 ? '#ffe2a0' : '#000000'); cap.material.emissiveIntensity = lit * 0.6;
  g.position.z = -0.016 + push * 0.006;
  if (g.userData.icon) g.userData.icon.material.map = g.userData.tex[lit > 0.3 ? 1 : 0];
};
function sandTop(level) {
  const prof = bpS.hgProf.filter((v) => v.y >= 0.02 && v.y <= 0.02 + 0.3 * level);
  const pts = [new THREE.Vector2(0.0, 0.02), ...prof.map((v) => new THREE.Vector2(v.x * 0.92, v.y)), new THREE.Vector2(0.0, 0.02 + 0.3 * level)];
  if (pts.length < 3) return new THREE.BufferGeometry();
  pts[pts.length - 1] = new THREE.Vector2(0.0, pts[pts.length - 2].y);
  return new THREE.LatheGeometry(pts, 28);
}
let sandKey = -1;
function worldState(S, f, cam) {
  for (const [k, g] of Object.entries(SETS)) g.visible = S.set === k;
  // ---- lobby / cabin ----
  if (S.set === 'lobby') {
    const d = S.door ?? 1; named.leaves.forEach((g, i) => { const s = i ? 1 : -1; g.position.x = s * (0.3 + 0.6 * d); g.userData.strip.material.color.set(S.sensor > 0 ? '#3cff7a' : '#2f8a52'); });
    named.beams.visible = (S.beams || 0) > 0.01 && d > 0.05; named.beams.children.forEach((b) => { b.scale.y = Math.max(0.01, 1.2 * d); b.material.opacity = 0.55 * (S.beams || 0); });
    named.wings.rotation.y = f * 0.012; named.minHand.rotation.z = -(1.1 + f * 0.0006); named.hourHand.rotation.z = -(4.35 + f * 0.00005);
    for (const [nm, list] of [['indA', named.indA], ['indB', named.indB], ['dots', btn.dots]]) list.forEach((m, k) => { const on = (S.floorDot ?? 2) === k; m.material.emissive.set(on ? '#ffae2a' : '#000000'); m.material.color.set(on ? '#ffd48a' : '#5a4a30'); });
    btn.floors.forEach((g, k) => setBtn(g, k === (S.floorLit ?? 3) ? 0.8 : 0));
    setBtn(btn.open, 0); setBtn(btn.close, S.closeLit || 0, S.closePush || 0);
    named.cabBack.visible = !S.hide?.includes('back'); named.cabL.visible = !S.hide?.includes('left'); named.cabR.visible = !S.hide?.includes('right'); named.cabFL.visible = !S.hide?.includes('frontL');
    btn.keyhole.rotation.z = S.keyTurn || 0;
    named.cabLight.material.color.set(S.alarm ? (Math.sin(f * 0.35) > 0 ? '#ff5a4a' : '#ff9a8a') : '#fffaf0');
    bcase.visible = !!S.bcase; if (S.bcase) { bcase.position.set(S.bcase[0], 0, S.bcase[1]); bcase.rotation.y = S.bcase[2] || 0; }
  }
  // ---- blueprint ----
  if (S.set === 'blueprint') {
    bpS.floors.forEach((g) => g.userData.cap.material.emissive.set('#000000'));
    const lit = S.bpClose || 0; bpS.close.userData.cap.material.emissive.set(lit > 0 ? '#fff2a0' : '#000000'); bpS.close.userData.cap.material.emissiveIntensity = lit;
    bpS.close.position.z = 0.03 - (S.bpPush || 0) * 0.012;
    bpS.dangle.rotation.set(0.25 * Math.sin(S.swing || 0) * 0.6, 0, 0.55 * Math.sin(S.swing || 0) * (S.swingAmp ?? 1));
    const lev = S.sand ?? 0.5;
    if (Math.abs(lev - sandKey) > 0.004) { sandKey = lev; bpS.sandTop.geometry.dispose(); bpS.sandTop.geometry = sandTop(lev); }
    const pile = 1 - lev; bpS.sandBot.scale.set(0.35 + 0.65 * Math.sqrt(pile), Math.max(0.05, pile) * 2.0, 0.35 + 0.65 * Math.sqrt(pile)); bpS.sandBot.position.y = -0.34 + 0.1 * Math.max(0.05, pile);
    bpS.stream.visible = lev > 0.005; bpS.stream.scale.y = 0.3 - 0.18 * pile; bpS.stream.position.y = -0.02 - 0.15 + 0.09 * pile;
    const ga = S.gear || 0; bpS.g1.rotation.z = ga; bpS.g2.rotation.z = -ga * 26 / 15 + 0.2; bpS.g3.rotation.z = -ga * 26 / 11;
    const md = S.mini ?? 1; bpS.mini.forEach((m, i) => { m.position.x = bpS.miniX + (i ? 1 : -1) * (0.07 + 0.13 * md); }); bpS.rack.position.x = bpS.miniX - 0.1 + 0.08 * (1 - md);
  }
  // ---- lab ----
  if (S.set === 'lab') {
    const lv = S.stress ?? 1;
    if (lab.gaugeKey !== Math.round(lv * 200)) { lab.gaugeKey = Math.round(lv * 200); const g = lab.gaugeCanvas.getContext('2d'); g.clearRect(0, 0, 128, 512); g.drawImage(P.stressGauge(lv), 0, 0); lab.gaugeTex.needsUpdate = true; }
    const c = new THREE.Color('#3ccf62').lerp(new THREE.Color('#ff3b30'), lv); lab.bulb.material.color.copy(c); lab.bulb.material.emissive.copy(c).multiplyScalar(0.45);
  }
  // ---- city ----
  if (S.set === 'city') {
    (S.taxis || []).forEach((t, i) => { const g = city.taxis[i]; g.visible = !!t; if (t) { g.position.set(t[0], 0, t[1]); g.rotation.y = t[2] || 0; } });
    city.taxis.forEach((g, i) => { if (!S.taxis || !S.taxis[i]) g.visible = false; });
    city.sface.material.map = city.sigTex[S.walk ? 'walk' : 'hand'];
    city.heroBtn.position.z = 0.16 - (S.btnPush || 0) * 0.012;
    const sink = S.sink || 0; city.bld.scale.y = Math.max(0.001, 1 - sink); city.bld.visible = sink < 0.999; city.furn.scale.y = Math.max(0.001, 1 - sink); city.furn.visible = sink < 0.999;
    city.blocks.visible = sink < 0.6; city.mark.visible = true;
    F8.visible = !!S.field; if (S.field) updateField(cam, f, true);
  }
}

function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.filter((a) => (a.s ?? 1) > 1e-3).forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s ?? 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    const yaw = a.fixYaw ?? Math.atan2(cam.position.x - a.x, cam.position.z - a.z);
    c.mesh.rotation.set(a.pitch || 0, yaw + (a.yaw || 0), a.roll || 0, 'YXZ');
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1; c.mat.transparent = true;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? a.y) + 0.012, a.z); c.blob.scale.set(0.9 * s * (a.blobW || 1), 0.5 * s, 1); }
  });
}

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh && !o.isLine && !o.isSprite && !o.isPoints) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip || !o.isMesh || o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

window.renderFrame = (f) => {
  const S = shotAt(f), L = lightFor(S, f), C = camAt(f);
  applyLight(L);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const W_ = worldAt(f); worldState(W_, f, camera);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  sky.position.copy(camera.position);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  if (window.DEBUG_ND) { const dm = new THREE.MeshBasicMaterial({ map: rtNd.texture }); const ds = fs(dm); renderer.setRenderTarget(null); renderer.render(ds, fsCam); return true; }
  const D = dofAt(f);
  inkU.px.value = 2.4; inkU.flash.value = C.flash || 0; inkU.flashCol.value.set(C.flashCol || '#ffffff'); inkU.vig.value = L.vig ?? 0.2; inkU.scan.value = C.scan ?? -1;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
