// Hospital-window short: renderer. Sets: two identical hospital rooms (tree / wall), operating room, archive,
// hospital exit, healing-garden hospital, POV room. Split-screen views are rendered into scissored halves and
// inked/graded in one pass. No text anywhere: every texture is shapes only.
import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { TOTAL, viewsAt } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([96, 96, 96, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const M = {
  wall: toon({ color: '#efe3c8' }), wallLow: toon({ color: '#d9c9a6' }), ceil: toon({ color: '#f6f2ea' }),
  floor: texM(P.lino(23), 3, 3), frame: toon({ color: '#f3f1ea' }), sill: toon({ color: '#e6dfcf' }),
  metal: toon({ color: '#c3cad1' }), metalDark: toon({ color: '#8d969e' }), sheet: toon({ color: '#fbfbf8' }),
  blanket: toon({ color: '#cfe0ea' }), pillow: toon({ color: '#ffffff' }), wood: toon({ color: '#9a6b42' }), woodDark: toon({ color: '#6e4a2c' }),
  curtain: texM(P.curtain(24, [80, 22, 74]), 3, 1), door: toon({ color: '#b9a585' }),
  jug: toon({ color: '#cfe6f2', transparent: true, opacity: 0.75 }), water: toon({ color: '#9ccbe6' }), cup: toon({ color: '#f4f4f0' }),
  ivBag: toon({ color: '#e8f4fa', transparent: true, opacity: 0.85 }),
  trunk: toon({ color: '#7a5636' }), leafA: toon({ color: '#5f9e3c' }), leafB: toon({ color: '#7fb84a' }), leafC: toon({ color: '#b6c94a' }), leafD: toon({ color: '#4c8a34' }),
  grass: texM(P.grass(6), 30, 30), brick: texM(P.brick(21), 6, 6), brickWall: null,
  pipe: toon({ color: '#6c6a62' }), grille: texM(P.grille(), 1, 1),
  orTile: texM(P.tiles(22, [150, 26, 72], 8), 3, 2), orFloor: texM(P.tiles(31, [160, 10, 62], 6), 4, 4), drape: toon({ color: '#3f8f72' }),
  cabinet: texM(P.cabinet(25), 1, 1), folders: texM(P.folders(26), 1, 1), folder: toon({ color: '#a8743e' }), folder2: toon({ color: '#8f5e30' }), folder3: toon({ color: '#c08a4c' }),
  paperM: toon({ color: '#fbf8ee' }), lampGreen: toon({ color: '#2f7a4a' }), brass: toon({ color: '#c9a24a' }), archWall: toon({ color: '#b9a98c' }),
  paving: texM(P.paving(29), 8, 8), facade: toon({ color: '#f1ece2' }), glass: toon({ color: '#bfe0ee', transparent: true, opacity: 0.32 }),
  glassGrid: texM(P.glassGrid(28, 4, 1), 1, 1), roof: texM(P.grass(61), 6, 6), stoneEdge: toon({ color: '#d8d0c0' }),
  waterPool: toon({ color: '#8cc8e4' }), bench: toon({ color: '#a8743e' }), benchLeg: toon({ color: '#4d5257' }),
  flowerR: toon({ color: '#e5483c' }), flowerY: toon({ color: '#f3c83a' }), flowerP: toon({ color: '#ea84b4' }), flowerW: toon({ color: '#fbfaf2' }), soil: toon({ color: '#6e4e34' }),
  path: toon({ color: '#e2d6bc' }), homeWall: toon({ color: '#d9cbb8' }), sofa: toon({ color: '#7d6a9a' }),
  pill: toon({ color: '#ffffff' }), capB: toon({ color: '#7fb1d6' }), capR: toon({ color: '#e58b7a' }), capY: toon({ color: '#f1cf5a' }),
  black: toon({ color: '#2a2a30' }),
};
M.brickWall = (() => { const t = P.tex(P.brick(21), 5, 7); return toon({ map: t }); })();
M.monitor = new THREE.MeshBasicMaterial({ map: P.tex(P.monitorScreen()) });
M.lampGlow = new THREE.MeshBasicMaterial({ color: '#fffbe8' });
M.orLight = new THREE.MeshBasicMaterial({ color: '#ffffff' });
M.screenGlow = new THREE.MeshBasicMaterial({ color: '#ffffff' });
for (const k of ['floor']) M[k].map.repeat.set(3, 3);

// ---------- ink contract ----------
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = opts.receive ?? true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};
const cyl = (r0, r1, h, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
const sph = (r, a = 16, b = 12) => new THREE.SphereGeometry(r, a, b);
const noShadow = (m) => { m.castShadow = false; return m; };

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; sky.renderOrder = -2; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
const lamp = new THREE.PointLight('#ffd9a0', 0, 6, 1.6); scene.add(lamp);
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// ---------- sets ----------
const SETS = {};
const mkSet = (name, ox) => { const g = new THREE.Group(); g.position.set(ox, 0, 0); g.visible = false; scene.add(g); SETS[name] = g; g.userData.ox = ox; return g; };
export const OX = { roomA: 0, roomB: 100, or: 200, archive: 300, exit: 400, garden: 500, pov: 600 };

// a toon tree: trunk + foliage clusters (k = leaf amount 0..1 for the time-lapse)
const trees = [];
const tree = (parent, x, z, h = 5, seed = 1, opts = {}) => {
  const r = P.rng(seed), g = new THREE.Group(); g.position.set(x, opts.y ?? 0, z); parent.add(g);
  add(cyl(0.12 * h / 5, 0.2 * h / 5, h * 0.6, 8), M.trunk, 0, h * 0.3, 0, g);
  const br = []; for (let i = 0; i < 4; i++) { const a = i * 1.6 + r(), b = add(cyl(0.04 * h / 5, 0.07 * h / 5, h * 0.32, 6), M.trunk, Math.cos(a) * 0.25, h * 0.58, Math.sin(a) * 0.25, g); b.rotation.z = Math.cos(a) * 0.6; b.rotation.x = -Math.sin(a) * 0.6; br.push(b); }
  const fol = [], mats = opts.mats || [M.leafA, M.leafB, M.leafD, opts.gold ? M.leafC : M.leafB];
  for (let i = 0; i < 7; i++) { const a = r() * 6.28, rr = (i ? 0.35 + r() * 0.5 : 0) * h / 5, s = (0.75 + r() * 0.45) * h / 5;
    const m = add(sph(1, 14, 10), mats[i % 4], Math.cos(a) * rr * 1.6, h * (0.6 + r() * 0.28), Math.sin(a) * rr * 1.6, g); m.userData.s = s * 1.15; m.scale.setScalar(s * 1.15); m.userData.ph = r() * 6.28; fol.push(m); }
  const T_ = { g, fol, br, h }; trees.push(T_); return T_;
};
const setLeaves = (Tr, k, f = 0) => { for (const m of Tr.fol) { const s = m.userData.s * Math.max(0.001, k); m.scale.set(s * (1 + 0.02 * Math.sin(f * 0.07 + m.userData.ph)), s, s); m.visible = k > 0.02; } };
// cloud billboards
const clouds = [];
const cloudSet = (parent, cx, cz, n, seed, R = 260, y0 = 60) => { const r = P.rng(seed);
  for (let i = 0; i < n; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = -1.1 + r() * 2.2; m.position.set(cx + Math.cos(a) * R, y0 + r() * 70, cz + Math.sin(a) * R); m.scale.setScalar(70 + r() * 70);
    m.userData.ndSkip = true; m.renderOrder = -1; parent.add(m); clouds.push(m);
  } };

// ----- hospital room (identical builder for A and B) -----
const ROOM = { bedX: 1.05, bedZ0: -2.45, bedZ1: -0.4, top: 0.62, winZ: -0.55, winW: 1.6, winY0: 0.85, winY1: 2.55, wallX: 2.45 };
const rooms = {};
const buildRoom = (G, variant) => {
  const R = { variant };
  add(tbox(6, 0.1, 7.2, 2), M.floor, 0, -0.05, 0, G, { cast: false });
  add(box(6, 0.1, 7.2), M.ceil, 0, 3.25, 0, G, { cast: true, receive: false });
  add(box(5.2, 3.3, 0.12), M.wall, 0, 1.6, -2.56, G); // back
  add(box(5.2, 0.9, 0.04), M.wallLow, 0, 0.45, -2.49, G, { cast: false }); // dado
  add(box(0.12, 3.3, 7), M.wall, -2.5, 1.6, 0, G); // left
  add(box(0.04, 0.9, 7), M.wallLow, -2.43, 0.45, 0, G, { cast: false });
  // right wall with window opening
  const zw0 = ROOM.winZ - ROOM.winW / 2, zw1 = ROOM.winZ + ROOM.winW / 2, X = ROOM.wallX + 0.06;
  add(box(0.12, 3.3, zw0 + 3.5), M.wall, X, 1.6, (-3.5 + zw0) / 2, G);
  add(box(0.12, 3.3, 3.5 - zw1), M.wall, X, 1.6, (zw1 + 3.5) / 2, G);
  add(box(0.12, ROOM.winY0, ROOM.winW), M.wall, X, ROOM.winY0 / 2, ROOM.winZ, G);
  add(box(0.12, 3.3 - ROOM.winY1, ROOM.winW), M.wall, X, (ROOM.winY1 + 3.3) / 2, ROOM.winZ, G);
  add(box(0.04, 0.9, 7), M.wallLow, ROOM.wallX - 0.02, 0.45, 0, G, { cast: false });
  // window frame + sash bars + sill
  const fr = (w, h, d, x, y, z) => add(box(w, h, d), M.frame, x, y, z, G);
  fr(0.2, 0.08, ROOM.winW + 0.16, X, ROOM.winY0 - 0.02, ROOM.winZ); fr(0.2, 0.08, ROOM.winW + 0.16, X, ROOM.winY1 + 0.02, ROOM.winZ);
  fr(0.2, ROOM.winY1 - ROOM.winY0 + 0.1, 0.08, X, (ROOM.winY0 + ROOM.winY1) / 2, zw0 - 0.02); fr(0.2, ROOM.winY1 - ROOM.winY0 + 0.1, 0.08, X, (ROOM.winY0 + ROOM.winY1) / 2, zw1 + 0.02);
  fr(0.06, ROOM.winY1 - ROOM.winY0, 0.05, X, (ROOM.winY0 + ROOM.winY1) / 2, ROOM.winZ); fr(0.06, 0.05, ROOM.winW, X, ROOM.winY0 + (ROOM.winY1 - ROOM.winY0) * 0.62, ROOM.winZ);
  add(box(0.32, 0.05, ROOM.winW + 0.3), M.sill, ROOM.wallX - 0.08, ROOM.winY0 - 0.06, ROOM.winZ, G);
  // curtains on a rod
  add(cyl(0.02, 0.02, ROOM.winW + 0.7, 8), M.metalDark, ROOM.wallX - 0.12, ROOM.winY1 + 0.16, ROOM.winZ, G).rotation.x = Math.PI / 2;
  R.curt = [];
  for (const s of [-1, 1]) { const cg = new THREE.Group(); cg.position.set(ROOM.wallX - 0.13, 0, ROOM.winZ + s * (ROOM.winW / 2 + 0.36)); G.add(cg);
    const panel = add(box(0.05, ROOM.winY1 - ROOM.winY0 + 0.45, 1.24), M.curtain, 0, (ROOM.winY0 + ROOM.winY1) / 2 - 0.05, -s * 0.62, cg); R.curt.push({ cg, s }); }
  // door on the left wall (plain, small round window)
  add(box(0.06, 2.1, 0.95), M.door, -2.43, 1.05, 0.9, G); add(box(0.08, 0.06, 0.12), M.metalDark, -2.38, 1.0, 0.55, G);
  // ceiling lamp
  add(cyl(0.34, 0.34, 0.06, 24), M.lampGlow, 0.3, 3.18, -0.9, G, { cast: false });
  add(cyl(0.38, 0.38, 0.03, 24), M.metal, 0.3, 3.2, -0.9, G, { cast: false });
  // bed
  const bx = ROOM.bedX, bz = (ROOM.bedZ0 + ROOM.bedZ1) / 2, bl = ROOM.bedZ1 - ROOM.bedZ0;
  add(box(1.05, 0.08, bl), M.metalDark, bx, 0.42, bz, G);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(cyl(0.025, 0.025, 0.42, 8), M.metal, bx + sx * 0.48, 0.21, bz + sz * (bl / 2 - 0.06), G);
  add(box(1.0, 0.18, bl - 0.05), M.sheet, bx, 0.53, bz, G);
  const headb = new THREE.Group(); headb.position.set(bx, 0, ROOM.bedZ0 + 0.04); G.add(headb);
  for (const sx of [-1, 1]) add(cyl(0.03, 0.03, 1.05, 8), M.metal, sx * 0.52, 0.52, 0, headb);
  add(cyl(0.03, 0.03, 1.06, 8), M.metal, 0, 1.03, 0, headb).rotation.z = Math.PI / 2;
  for (let i = -2; i <= 2; i++) add(cyl(0.015, 0.015, 0.45, 6), M.metal, i * 0.18, 0.78, 0, headb);
  const footb = new THREE.Group(); footb.position.set(bx, 0, ROOM.bedZ1 - 0.03); G.add(footb);
  for (const sx of [-1, 1]) add(cyl(0.03, 0.03, 0.8, 8), M.metal, sx * 0.52, 0.4, 0, footb);
  add(cyl(0.03, 0.03, 1.06, 8), M.metal, 0, 0.8, 0, footb).rotation.z = Math.PI / 2;
  R.pillow = add(new THREE.CapsuleGeometry(0.16, 0.5, 6, 12), M.pillow, bx, 0.72, ROOM.bedZ0 + 0.28, G); R.pillow.rotation.z = Math.PI / 2; R.pillow.scale.set(1, 1, 0.55);
  const blk = add(new THREE.CapsuleGeometry(0.22, 0.75, 6, 14), M.blanket, bx, 0.62, ROOM.bedZ0 + 1.25, G); blk.rotation.x = Math.PI / 2; blk.scale.set(2.25, 1.6, 0.85); R.blanket = blk;
  add(box(1.02, 0.05, 1.3), M.blanket, bx, 0.64, ROOM.bedZ0 + 1.35, G);
  // nightstand + jug + cup + pills
  const ns = new THREE.Group(); ns.position.set(0.12, 0, -2.2); G.add(ns); R.ns = ns;
  add(box(0.55, 0.62, 0.45), M.wood, 0, 0.31, 0, ns); add(box(0.5, 0.02, 0.02), M.woodDark, 0, 0.45, 0.23, ns);
  add(box(0.1, 0.03, 0.03), M.brass, 0, 0.5, 0.24, ns);
  add(cyl(0.07, 0.085, 0.24, 16), M.jug, -0.12, 0.74, 0.02, ns); add(cyl(0.062, 0.075, 0.15, 16), M.water, -0.12, 0.7, 0.02, ns, { cast: false });
  add(cyl(0.045, 0.035, 0.1, 12), M.cup, 0.1, 0.67, 0.08, ns);
  R.pills = []; const caps = [M.capB, M.capR, M.capY];
  add(cyl(0.07, 0.085, 0.24, 16), M.jug, -0.12, 0.74, 0.02, ns).visible = false;
  for (let i = 0; i < 7; i++) { const pg = new THREE.Group(); pg.position.set(-0.19 + (i % 4) * 0.125 + (i > 3 ? 0.06 : 0), 0.62, 0.15 - (i > 3 ? 0.13 : 0) + (i % 2) * 0.02); ns.add(pg);
    add(cyl(0.05, 0.05, 0.13, 14), M.pill, 0, 0.065, 0, pg); add(cyl(0.054, 0.054, 0.035, 14), caps[i % 3], 0, 0.14, 0, pg); pg.visible = false; R.pills.push(pg); }
  // IV stand
  const iv = new THREE.Group(); iv.position.set(-0.45, 0, -2.25); G.add(iv);
  add(cyl(0.015, 0.015, 1.95, 8), M.metal, 0, 0.98, 0, iv); for (let i = 0; i < 5; i++) { const l = add(cyl(0.012, 0.012, 0.32, 6), M.metal, Math.cos(i * 1.26) * 0.14, 0.04, Math.sin(i * 1.26) * 0.14, iv); l.rotation.z = Math.cos(i * 1.26) * 1.4; l.rotation.x = -Math.sin(i * 1.26) * 1.4; }
  add(cyl(0.012, 0.012, 0.3, 6), M.metal, 0, 1.94, 0, iv).rotation.z = Math.PI / 2; add(new THREE.CapsuleGeometry(0.07, 0.14, 4, 10), M.ivBag, 0.12, 1.78, 0, iv);
  // chair
  const ch = new THREE.Group(); ch.position.set(-1.75, 0, -1.6); ch.rotation.y = 0.5; G.add(ch);
  add(box(0.48, 0.05, 0.46), M.wood, 0, 0.46, 0, ch); add(box(0.48, 0.5, 0.05), M.wood, 0, 0.74, -0.22, ch);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.04, 0.46, 0.04), M.woodDark, sx * 0.21, 0.23, sz * 0.2, ch);
  // heart monitor icon box on the back wall
  add(box(0.42, 0.3, 0.12), M.metalDark, -0.45, 1.75, -2.46, G); const scr = add(new THREE.PlaneGeometry(0.34, 0.21), M.monitor, -0.45, 1.75, -2.395, G, { cast: false }); scr.userData.ndSkip = true;
  // ---- outside ----
  const out = new THREE.Group(); G.add(out);
  if (variant === 'tree') {
    add(new THREE.PlaneGeometry(120, 120), M.grass, 60, -0.06, 0, out, { cast: false }).rotation.x = -Math.PI / 2;
    const r = P.rng(5); R.trees = [];
    [[5.9, -2.6, 4.2], [6.4, 1.6, 4.6], [7.8, -0.6, 5.0], [9.4, 2.2, 5.6], [10.6, -2.8, 6.2], [13.5, 0.4, 6.0], [8.0, 4.4, 5.0], [15.8, -4.4, 7.0], [6.4, -6.8, 5.6]].forEach(([x, z, h], i) => R.trees.push(tree(out, x, z, h, 10 + i, { gold: i % 2 === 0 })));
    for (let i = 0; i < 14; i++) tree(out, 20 + r() * 30, (r() - 0.5) * 50, 6 + r() * 3, 40 + i, { gold: i % 3 === 0 });
    cloudSet(out, 0, 0, 7, 3, 320, 70);
    const perch = add(cyl(0.035, 0.05, 2.6, 8), M.trunk, 3.75, 1.6, -1.1, out); perch.rotation.x = Math.PI / 2 - 0.12; perch.rotation.z = 0.25;
    // dancing leaf-shadow occluder (invisible; only casts shadows)
    const lm = P.tex(P.leafMask(27, 1.1)); lm.wrapS = lm.wrapT = THREE.RepeatWrapping;
    const occ = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, map: lm, alphaTest: 0.5, side: THREE.DoubleSide }));
    occ.position.set(3.4, 2.4, -0.1); occ.rotation.y = Math.PI / 2; occ.castShadow = true; occ.receiveShadow = false;
    occ.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: lm, alphaTest: 0.5 }); occ.userData.ndSkip = true; G.add(occ); R.occ = occ;
  } else {
    add(new THREE.PlaneGeometry(40, 40), M.paving, 10, -0.06, 0, out, { cast: false }).rotation.x = -Math.PI / 2;
    const bw = add(tbox(0.6, 16, 40, 2.4), M.brickWall, 5.4, 7.5, 0, out); R.brick = bw;
    add(cyl(0.07, 0.07, 16, 10), M.pipe, 5.0, 7.5, -1.75, out); for (let i = 0; i < 6; i++) add(cyl(0.09, 0.09, 0.06, 10), M.metalDark, 5.0, 0.6 + i * 2.2, -1.75, out);
    add(box(0.08, 0.7, 0.9), M.grille, 5.08, 2.2, 0.4, out); add(box(0.06, 0.8, 1.0), M.metalDark, 5.1, 2.2, 0.4, out);
    // moss streaks as darker patches
    add(box(0.02, 1.4, 0.9), toon({ color: '#5b6e45' }), 5.09, 0.7, -0.9, out, { cast: false }).scale.set(1, 1, 1);
    add(box(0.02, 0.9, 0.5), toon({ color: '#64744c' }), 5.09, 3.4, -1.45, out, { cast: false });
  }
  rooms[variant] = R; return R;
};
buildRoom(mkSet('roomA', OX.roomA), 'tree');
buildRoom(mkSet('roomB', OX.roomB), 'wall');

// ----- operating room + corridor -----
const ORS = {};
{
  const G = mkSet('or', OX.or);
  // corridor (camera side, z > 0)
  add(tbox(8, 0.1, 10, 2), M.floor, 0, -0.05, 5, G, { cast: false }); add(box(8, 0.1, 10), M.ceil, 0, 3.0, 5, G);
  add(box(0.12, 3.0, 10), M.wall, -2.6, 1.5, 5, G); add(box(0.12, 3.0, 10), M.wall, 2.6, 1.5, 5, G);
  for (let i = 0; i < 3; i++) add(box(0.9, 0.04, 0.4), M.lampGlow, 0, 2.97, 2.5 + i * 2.6, G, { cast: false });
  // door wall at z=0 with double door opening (x -1.2..1.2, h 2.4)
  add(box(1.5, 3, 0.2), M.wall, -1.95, 1.5, 0, G); add(box(1.5, 3, 0.2), M.wall, 1.95, 1.5, 0, G); add(box(2.4, 0.6, 0.2), M.wall, 0, 2.7, 0, G);
  ORS.leaves = [];
  for (const s of [-1, 1]) { const hg = new THREE.Group(); hg.position.set(s * 1.2, 0, 0.1); G.add(hg);
    add(box(1.18, 2.36, 0.06), M.metal, -s * 0.59, 1.2, 0, hg); const wdw = add(cyl(0.16, 0.16, 0.07, 20), toon({ color: '#9ec7d6' }), -s * 0.59, 1.6, 0, hg); wdw.rotation.x = Math.PI / 2;
    add(box(0.9, 0.12, 0.08), M.metalDark, -s * 0.59, 0.95, 0, hg); ORS.leaves.push({ hg, s }); }
  // operating room (z < 0)
  add(tbox(8, 0.1, 8, 1.2), M.orFloor, 0, -0.05, -4, G, { cast: false }); add(box(8, 0.1, 8), toon({ color: '#dfeee6' }), 0, 3.4, -4, G);
  add(tbox(8, 3.4, 0.12, 1.4), M.orTile, 0, 1.7, -7.8, G); add(tbox(0.12, 3.4, 8, 1.4), M.orTile, -3.5, 1.7, -4, G); add(tbox(0.12, 3.4, 8, 1.4), M.orTile, 3.5, 1.7, -4, G);
  for (const s of [-1, 1]) { const d = add(box(0.06, 2.6, 2.2), M.drape, s * 2.6, 1.4, -4.2, G); d.rotation.y = s * 0.25; }
  // big round lamp
  const lg = new THREE.Group(); lg.position.set(0, 2.55, -3.6); G.add(lg); ORS.lamp = lg;
  add(cyl(0.04, 0.04, 0.9, 8), M.metal, 0, 0.45, 0, lg); const hood = add(new THREE.SphereGeometry(0.75, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), M.metal, 0, 0.05, 0, lg); hood.scale.y = 0.45;
  const disc = add(cyl(0.62, 0.62, 0.05, 28), M.orLight, 0, -0.12, 0, lg, { cast: false }); disc.userData.ndSkip = false;
  for (let i = 0; i < 6; i++) add(cyl(0.12, 0.12, 0.06, 14), toon({ color: '#fffbe6' }), Math.cos(i * 1.047) * 0.38, -0.13, Math.sin(i * 1.047) * 0.38, lg, { cast: false });
  // tray on a stand, instruments as soft blobs
  const tr = new THREE.Group(); tr.position.set(1.7, 0, -3.2); G.add(tr);
  add(cyl(0.02, 0.02, 0.95, 8), M.metal, 0, 0.47, 0, tr); add(box(0.7, 0.04, 0.45), M.metal, 0, 0.96, 0, tr); add(box(0.6, 0.02, 0.36), M.drape, 0, 0.99, 0, tr);
  for (let i = 0; i < 5; i++) { const b = add(new THREE.CapsuleGeometry(0.015, 0.16, 4, 8), M.metal, -0.22 + i * 0.11, 1.01, 0, tr); b.rotation.x = Math.PI / 2; }
  add(cyl(0.03, 0.03, 0.03, 10), M.metalDark, -1.7, 0.01, -3.2, G);
  // stretchers
  ORS.str = [];
  for (const s of [-1, 1]) { const sg = new THREE.Group(); G.add(sg);
    add(box(0.72, 0.08, 1.95), M.metal, 0, 0.78, 0, sg); add(box(0.66, 0.1, 1.85), M.sheet, 0, 0.86, 0, sg);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { add(cyl(0.025, 0.025, 0.7, 6), M.metalDark, sx * 0.3, 0.42, sz * 0.85, sg); const wh = add(cyl(0.06, 0.06, 0.04, 12), M.black, sx * 0.3, 0.06, sz * 0.85, sg); wh.rotation.z = Math.PI / 2; }
    for (const sx of [-1, 1]) add(cyl(0.015, 0.015, 1.7, 6), M.metal, sx * 0.38, 0.98, 0, sg).rotation.x = Math.PI / 2;
    ORS.str.push({ sg, s }); }
}

// ----- archive -----
const ARC = {};
{
  const G = mkSet('archive', OX.archive);
  add(tbox(7, 0.1, 7, 2), texM(P.planks(33), 2, 2), 0, -0.05, 0, G, { cast: false }); add(box(7, 0.1, 7), M.archWall, 0, 3.6, 0, G);
  add(box(0.12, 3.7, 7), M.archWall, -3.2, 1.8, 0, G); add(box(0.12, 3.7, 7), M.archWall, 3.2, 1.8, 0, G);
  // tall cabinets along the back wall (gap for the small window at x 0.9..2.1)
  for (let i = 0; i < 7; i++) { const x = -2.9 + i * 0.86; if (x > 0.5 && x < 2.2) continue; for (let k = 0; k < 2; k++) add(tbox(0.84, 1.75, 0.62, 0), M.cabinet, x, 0.88 + k * 1.76, -2.75, G); }
  // window in the back wall: carve by placing wall pieces (frame + glass-less opening)
  const wx = 1.5, wy0 = 1.55, wy1 = 2.75, ww = 0.95;
  add(box(ww + 0.16, 0.08, 0.2), M.frame, wx, wy0 - 0.04, -3.02, G); add(box(ww + 0.16, 0.08, 0.2), M.frame, wx, wy1 + 0.04, -3.02, G);
  for (const s of [-1, 1]) add(box(0.08, wy1 - wy0, 0.2), M.frame, wx + s * ww / 2, (wy0 + wy1) / 2, -3.02, G);
  add(box(0.04, wy1 - wy0, 0.06), M.frame, wx, (wy0 + wy1) / 2, -3.0, G);
  // cut the opening: back wall replaced by 4 pieces
  add(box(7, wy0, 0.12), M.archWall, 0, wy0 / 2, -3.1, G); add(box(7, 3.7 - wy1, 0.12), M.archWall, 0, (wy1 + 3.7) / 2, -3.1, G);
  add(box(wx - ww / 2 + 3.5, wy1 - wy0, 0.12), M.archWall, (-3.5 + wx - ww / 2) / 2, (wy0 + wy1) / 2, -3.1, G);
  add(box(3.5 - wx - ww / 2, wy1 - wy0, 0.12), M.archWall, (3.5 + wx + ww / 2) / 2, (wy0 + wy1) / 2, -3.1, G);
  // shelves of folders on both side walls
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { add(box(0.4, 0.04, 5.6), M.woodDark, s * 2.95, 0.4 + k * 0.82, 0, G);
    const f = add(box(0.3, 0.7, 5.5), M.folders, s * 2.95, 0.77 + k * 0.82, 0, G, { cast: false }); f.rotation.y = 0; }
  // outside the window: sky, ground, one tree (time-lapse)
  add(new THREE.PlaneGeometry(80, 80), M.grass, 0, -0.06, -40, G, { cast: false }).rotation.x = -Math.PI / 2;
  ARC.tree = tree(G, 1.7, -5.2, 3.8, 77, { mats: ['#5f9e3c', '#7fb84a', '#4c8a34', '#b6c94a'].map((c) => toon({ color: c, emissive: c, emissiveIntensity: 0.35 })) });
  tree(G, -2.5, -12, 5.5, 78); tree(G, 5.5, -14, 6, 79);
  cloudSet(G, 0, -200, 4, 9, 200, 50);
  // desk
  const dk = new THREE.Group(); dk.position.set(0, 0, -0.55); G.add(dk); ARC.desk = dk;
  add(box(1.9, 0.07, 0.9), M.wood, 0, 0.78, 0, dk); add(box(0.5, 0.74, 0.85), M.woodDark, -0.68, 0.37, 0, dk); add(box(0.5, 0.74, 0.85), M.woodDark, 0.68, 0.37, 0, dk);
  add(box(1.86, 0.5, 0.04), M.woodDark, 0, 0.5, 0.4, dk);
  // banker lamp
  const lp = new THREE.Group(); lp.position.set(-0.68, 0.81, -0.2); dk.add(lp);
  add(cyl(0.1, 0.12, 0.04, 16), M.brass, 0, 0.02, 0, lp); add(cyl(0.015, 0.015, 0.36, 8), M.brass, 0, 0.2, 0, lp);
  const sh = add(new THREE.CylinderGeometry(0.17, 0.17, 0.32, 18, 1, true, 0, Math.PI), M.lampGreen, 0.0, 0.42, 0.04, lp); sh.rotation.z = Math.PI / 2; sh.rotation.y = Math.PI / 2;
  add(cyl(0.04, 0.04, 0.22, 10), M.lampGlow, 0, 0.36, 0.04, lp, { cast: false }).rotation.z = Math.PI / 2;
  ARC.lampPos = new THREE.Vector3(-0.68, 1.12, -0.5);
  // folder stack (static) + moving folders
  for (let i = 0; i < 6; i++) add(box(0.42, 0.05, 0.32), [M.folder, M.folder2, M.folder3][i % 3], 0.62, 0.84 + i * 0.05, 0.05 + (i % 2) * 0.02, dk).rotation.y = (i % 3 - 1) * 0.08;
  ARC.mv = [];
  for (let i = 0; i < 6; i++) { const m = add(box(0.4, 0.035, 0.3), [M.folder, M.folder2, M.folder3][i % 3], 0, 0.83, 0, dk); const pa = add(box(0.34, 0.01, 0.25), M.paperM, 0, 0.022, 0, m); ARC.mv.push(m); }
  add(box(0.36, 0.01, 0.28), M.paperM, -0.15, 0.82, 0.12, dk).rotation.y = 0.2;
}

// ----- hospital exit (glass doors, sunny) -----
const EXIT = {};
{
  const G = mkSet('exit', OX.exit);
  add(new THREE.PlaneGeometry(120, 120), M.grass, 0, -0.06, 0, G, { cast: false }).rotation.x = -Math.PI / 2;
  add(tbox(3.2, 0.04, 30, 2), M.paving, 0, -0.03, 14, G, { cast: false });
  add(tbox(14, 0.04, 2.5, 2), M.paving, 0, -0.03, 1.2, G, { cast: false });
  // facade
  add(box(5.5, 4.6, 0.4), M.facade, -4.25, 2.3, 0, G); add(box(5.5, 4.6, 0.4), M.facade, 4.25, 2.3, 0, G); add(box(3.0, 2.0, 0.4), M.facade, 0, 3.6, 0, G);
  add(box(14, 0.3, 1.6), M.stoneEdge, 0, 4.7, 0.4, G); // canopy
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) add(box(1.2, 1.2, 0.08), M.glassGrid, s * (2.7 + k * 1.7), 2.4, 0.22, G, { cast: false });
  // interior behind the doors (dim lobby)
  add(box(3, 2.6, 0.1), toon({ color: '#cfc4b0' }), 0, 1.3, -4, G); add(tbox(3, 0.05, 4, 2), M.floor, 0, 0, -2, G, { cast: false });
  add(box(0.1, 2.6, 4), M.wall, -1.5, 1.3, -2, G); add(box(0.1, 2.6, 4), M.wall, 1.5, 1.3, -2, G); add(box(3, 0.1, 4), M.ceil, 0, 2.6, -2, G);
  EXIT.doors = [];
  for (const s of [-1, 1]) { const d = new THREE.Group(); G.add(d); add(box(1.42, 2.5, 0.05), M.glass, 0, 1.25, 0, d, { cast: false }).userData.ndSkip = true;
    for (const yy of [0.03, 2.47]) add(box(1.42, 0.06, 0.07), M.metalDark, 0, yy, 0, d); for (const xx of [-0.68, 0.68]) add(box(0.06, 2.5, 0.07), M.metalDark, xx, 1.25, 0, d);
    EXIT.doors.push({ d, s }); }
  [[-4.2, 4.5, 5.8], [4.6, 5.5, 6.2], [-6.5, 9.5, 6.8], [6.8, 10.5, 6.4], [-3.4, 13.5, 5.4], [3.6, 15, 6.0], [-8.5, 3, 6], [9, 2.5, 6.6]].forEach(([x, z, h], i) => tree(G, x, z, h, 120 + i, { gold: i % 2 === 0 }));
  for (let i = 0; i < 6; i++) { const b = add(sph(0.6, 12, 8), M.leafB, (i % 2 ? 1 : -1) * (2.2 + (i % 3) * 0.6), 0.3, 1.0 + (i % 3) * 0.2, G); b.scale.y = 0.6; }
  cloudSet(G, 0, 200, 6, 12, 260, 60);
}

// ----- healing-garden hospital (glass ring around a green courtyard) -----
const GAR = {};
{
  const G = mkSet('garden', OX.garden);
  add(new THREE.PlaneGeometry(400, 400), M.grass, 0, -0.08, 0, G, { cast: false }).rotation.x = -Math.PI / 2;
  const S = 12, Hh = 9.6, D = 7;
  const block = (x, z, w, d) => { const b = new THREE.Group(); b.position.set(x, 0, z); G.add(b);
    add(tbox(w, Hh, d, Hh / 3), M.glassGrid, 0, Hh / 2, 0, b); add(box(w + 0.3, 0.35, d + 0.3), M.roof, 0, Hh + 0.15, 0, b);
    for (let k = 1; k < 3; k++) add(box(w + 0.12, 0.18, d + 0.12), M.facade, 0, k * Hh / 3, 0, b, { cast: false });
    add(box(w + 0.1, 0.6, d + 0.1), M.facade, 0, 0.3, 0, b); return b; };
  block(0, -(S + D / 2), 2 * S + 2 * D, D); block(0, S + D / 2, 2 * S + 2 * D, D); block(-(S + D / 2), 0, D, 2 * S); block(S + D / 2, 0, D, 2 * S);
  // courtyard: lawn, path ring, fountain, trees, beds, benches
  add(new THREE.CircleGeometry(S, 48), M.grass, 0, -0.04, 0, G, { cast: false }).rotation.x = -Math.PI / 2;
  const ring = add(new THREE.RingGeometry(5.0, 6.4, 64), M.path, 0, -0.02, 0, G, { cast: false }); ring.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 2; i++) { const p = add(new THREE.PlaneGeometry(1.5, 6), M.path, 0, -0.025, (i ? 1 : -1) * 9, G, { cast: false }); p.rotation.x = -Math.PI / 2; }
  // fountain
  const fo = new THREE.Group(); G.add(fo); GAR.fountain = fo;
  add(new THREE.TorusGeometry(1.9, 0.22, 10, 40), M.stoneEdge, 0, 0.32, 0, fo).rotation.x = Math.PI / 2;
  add(cyl(1.95, 1.95, 0.3, 40), M.stoneEdge, 0, 0.12, 0, fo); add(cyl(1.75, 1.75, 0.06, 40), M.waterPool, 0, 0.3, 0, fo, { cast: false });
  add(cyl(0.22, 0.32, 0.9, 16), M.stoneEdge, 0, 0.7, 0, fo); add(cyl(0.6, 0.35, 0.16, 20), M.stoneEdge, 0, 1.2, 0, fo); add(cyl(0.5, 0.5, 0.03, 20), M.waterPool, 0, 1.28, 0, fo, { cast: false });
  const r = P.rng(55);
  [[-8.0, -3.0, 6.5], [7.6, -4.4, 7.0], [-6.4, 6.6, 6.0], [8.2, 5.6, 6.6], [-3.4, -8.8, 5.6], [3.0, 8.8, 5.8], [-9.2, 2.2, 5.0], [9.6, 0.4, 5.2]].forEach(([x, z, h], i) => tree(G, x, z, h, 200 + i, { gold: i % 2 === 1 }));
  const fm = [M.flowerR, M.flowerY, M.flowerP, M.flowerW];
  for (const [bx, bz, a] of [[-3.8, 2.6, 0.5], [3.8, 2.8, -0.4], [-3.6, -2.8, -0.5], [3.6, -2.9, 0.4], [0, 3.9, 0], [0, -3.9, 0]]) {
    const bed = add(new THREE.CylinderGeometry(1, 1, 0.12, 24), M.soil, bx, 0.02, bz, G, { cast: false }); bed.scale.set(1.3, 1, 0.7); bed.rotation.y = a;
    for (let i = 0; i < 26; i++) { const t = r() * 6.28, rr = Math.sqrt(r()) * 0.9; const fl = add(sph(0.09 + r() * 0.05, 8, 6), fm[(i + (bx > 0 ? 1 : 0)) % 4], bx + Math.cos(t) * rr * 1.2, 0.18 + r() * 0.08, bz + Math.sin(t) * rr * 0.62, G, { cast: false }); }
    for (let i = 0; i < 8; i++) { const t = r() * 6.28, rr = Math.sqrt(r()) * 0.8; const lf = add(sph(0.16, 8, 6), M.leafD, bx + Math.cos(t) * rr * 1.2, 0.1, bz + Math.sin(t) * rr * 0.6, G, { cast: false }); lf.scale.y = 0.6; }
  }
  const bench = (x, z, a) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = a; G.add(b);
    for (let i = 0; i < 3; i++) add(box(1.6, 0.04, 0.12), M.bench, 0, 0.45, -0.16 + i * 0.15, b); for (let i = 0; i < 2; i++) add(box(1.6, 0.1, 0.03), M.bench, 0, 0.7 + i * 0.16, -0.26, b).rotation.x = -0.15;
    for (const sx of [-1, 1]) add(box(0.06, 0.45, 0.5), M.benchLeg, sx * 0.7, 0.22, -0.05, b); };
  bench(-5.6, -1.2, 1.3); bench(5.7, 1.4, -1.6); bench(-1.4, -6.2, 0.2); bench(1.8, 6.4, 3.0);
  GAR.spray = new THREE.Vector3(0, 1.3, 0);
  // outside the ring: a few trees
  for (let i = 0; i < 16; i++) { const a = r() * 6.28, d = 30 + r() * 30; tree(G, Math.cos(a) * d, Math.sin(a) * d, 6 + r() * 3, 300 + i); }
  cloudSet(G, 0, 0, 10, 21, 380, 70);
}

// ----- POV room -----
const POV = {};
{
  const G = mkSet('pov', OX.pov);
  add(tbox(6, 0.1, 6, 2), texM(P.planks(41), 2, 2), 0, -0.05, 0, G, { cast: false }); add(box(6, 0.1, 6), M.ceil, 0, 2.8, 0, G);
  const wy0 = 0.9, wy1 = 2.4, ww = 1.5, wz = -2.2;
  add(box(6, wy0, 0.12), M.homeWall, 0, wy0 / 2, wz, G); add(box(6, 2.8 - wy1, 0.12), M.homeWall, 0, (wy1 + 2.8) / 2, wz, G);
  add(box(3 - ww / 2, wy1 - wy0, 0.12), M.homeWall, -(3 + ww / 2) / 2, (wy0 + wy1) / 2, wz, G); add(box(3 - ww / 2, wy1 - wy0, 0.12), M.homeWall, (3 + ww / 2) / 2, (wy0 + wy1) / 2, wz, G);
  add(box(ww + 0.16, 0.08, 0.2), M.frame, 0, wy0 - 0.03, wz, G); add(box(ww + 0.16, 0.08, 0.2), M.frame, 0, wy1 + 0.03, wz, G);
  for (const s of [-1, 1]) add(box(0.08, wy1 - wy0, 0.2), M.frame, s * ww / 2, (wy0 + wy1) / 2, wz, G);
  add(box(0.05, wy1 - wy0, 0.06), M.frame, 0, (wy0 + wy1) / 2, wz, G);
  add(box(ww + 0.4, 0.05, 0.3), M.sill, 0, wy0 - 0.06, wz + 0.1, G);
  add(box(0.12, 2.8, 6), M.homeWall, -3, 1.4, 0, G); add(box(0.12, 2.8, 6), M.homeWall, 3, 1.4, 0, G);
  for (const s of [-1, 1]) add(box(0.6, 1.9, 0.05), texM(P.curtain(42, [24, 40, 70]), 2, 1), s * (ww / 2 + 0.35), 1.55, wz + 0.12, G);
  // sofa edge in the foreground
  add(new THREE.CapsuleGeometry(0.25, 1.4, 6, 12), M.sofa, -0.9, 0.45, 1.0, G).rotation.z = Math.PI / 2;
  // outside: half tree, half brick wall
  const tg = tree(G, -1.4, -5.2, 5.4, 91, { gold: true }); tree(G, -2.8, -8, 6.0, 92);
  add(tbox(0.4, 12, 8, 2.4), M.brickWall, 3.2, 6, -6.0, G).rotation.y = Math.PI / 2 - 0.25;
  add(new THREE.PlaneGeometry(60, 60), M.grass, 0, -0.1, -30, G, { cast: false }).rotation.x = -Math.PI / 2;
  cloudSet(G, 0, -300, 5, 31, 200, 60);
}

// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.5));
class Card {
  constructor() {
    const c = document.createElement('canvas'); c.width = CW; c.height = CH; this.c = c; this.g = c.getContext('2d');
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.rotation.order = 'YXZ'; this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    fn(new T.Pen(g)); this.t.needsUpdate = true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());
function drawActors(list, cam, base, ox) {
  list.forEach((a, j) => {
    const c = getCard(base + j); c.draw(a.key, a.draw);
    const x = a.x + ox; c.mesh.visible = true; c.mesh.position.set(x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(a.pitch || 0, Math.atan2(cam.position.x - x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1; c.mat.depthWrite = a.depthWrite ?? true;
    c.mesh.castShadow = a.shadow !== false; c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false && a.ground !== undefined) { c.blob.visible = true; c.blob.position.set(x, a.ground + 0.012, a.z); c.blob.scale.set(0.9 * s, 0.55 * s, 1); }
  });
}
const hideCards = () => cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const C3 = () => ({ value: new THREE.Color() });
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 2.4 },
  sat: { value: 1 }, lift: C3(), gain: C3(), sat2: { value: 1 }, lift2: C3(), gain2: C3(), fade2: { value: 0 }, vig: { value: 0.22 }, flash: { value: 0 },
  splitY: { value: -1 }, divider: { value: 0 }, flashCol: C3() };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, sat2, vig, flash, splitY, divider, fade2; uniform vec3 lift, gain, lift2, gain2, flashCol; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(4./d, .6, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec2 q = uv+o;
      if (splitY > 0. && (q.y - splitY)*(uv.y - splitY) < 0.) continue;
      vec4 s = texture2D(nd, q);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue; if (card) ds = 1e4;
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.01, .03, (ds - d)/d));
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.86, .7, dot(n, ns)) * .85);
    }
    return e * (1. - smoothstep(60., 300., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    bool low = splitY > 0. && vUv.y < splitY;
    float S = low ? sat2 : sat; vec3 G = low ? gain2 : gain; vec3 Lf = low ? lift2 : lift;
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, S); c = c*G + Lf;
    if (low) { float l2 = dot(c, vec3(.299,.587,.114)); c = mix(c, vec3(l2)*.85 + vec3(.04,.05,.07), fade2); }
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    if (splitY > 0. && divider > 0.) { float dpx = abs(vUv.y - splitY) * res.y; c = mix(c, vec3(1.), (1. - smoothstep(divider - 1., divider + .5, dpx))); }
    c = mix(c, flashCol, flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, focus2: { value: 5 }, cinf2: { value: 0 }, near: { value: 1 }, splitY: { value: -1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, focus2, cinf2, near, splitY; varying vec2 vUv;
  float FO; float CI;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - FO/d; return k > 0. ? CI*k : min(-k*CI*near, CI*1.4); }
  void main(){
    bool low = splitY > 0. && vUv.y < splitY; FO = low ? focus2 : focus; CI = low ? cinf2 : cinf;
    float c0 = coc(vUv);
    if (CI < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<48;i++){ float fi = float(i); float r = sqrt((fi+.5)/48.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; vec2 q = vUv+o; if (splitY > 0. && (q.y - splitY)*(vUv.y - splitY) < 0.) q.y = splitY + (low ? -1. : 1.)/res.y;
      float cs = coc(q); float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, q).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` }));
dofScene.children[0].material.toneMapped = false;

// ---------- per-view state ----------
const tmpV = new THREE.Vector3();
function applyLight(L, ox) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI; sun.castShadow = L.shadow !== false;
  scene.fog.color.set(L.fog || '#ffffff'); scene.fog.near = L.fogNear ?? 60; scene.fog.far = L.fogFar ?? 600;
  skyU.top.value.set(L.skyTop || '#6aa6e8'); skyU.hor.value.set(L.skyHor || '#d6eaf7'); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  if (L.lamp) { lamp.visible = true; lamp.color.set(L.lamp.color); lamp.intensity = L.lamp.i; lamp.distance = L.lamp.d || 6; lamp.position.set(L.lamp.pos[0] + ox, L.lamp.pos[1], L.lamp.pos[2]); }
  else { lamp.visible = false; lamp.intensity = 0; }
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 60); sun.target.position.copy(focus);
  const ext = L.shadowExt || 8, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
}
function worldState(view, f) {
  const Wd = view.world || {};
  const R = view.set === 'roomA' ? rooms.tree : view.set === 'roomB' ? rooms.wall : null;
  if (R) {
    const open = Wd.curtain ?? 0; // 0 closed .. 1 open
    for (const { cg, s } of R.curt) { const panel = cg.children[0]; panel.scale.z = 1 - 0.7 * open; panel.position.z = -s * 0.62 * (1 - 0.7 * open); cg.position.z = ROOM.winZ + s * (ROOM.winW / 2 + 0.36) - s * 0.0 + s * 0.05 * open; }
    const np = Wd.pills ?? 0; R.pills.forEach((pg, i) => { const k = Math.max(0, Math.min(1, np - i)); pg.visible = k > 0.01; const sc = k < 1 ? 0.4 + 0.6 * k + 0.25 * Math.sin(k * Math.PI) : 1; pg.scale.setScalar(sc); });
    if (R.occ) { R.occ.position.z = -0.1 + 0.12 * Math.sin(f * 0.045) + 0.05 * Math.sin(f * 0.13); R.occ.position.y = 2.4 + 0.06 * Math.sin(f * 0.07 + 1); R.occ.rotation.x = 0.05 * Math.sin(f * 0.05); }
    if (R.trees) R.trees.forEach((t_, i) => { t_.g.rotation.z = 0.02 * Math.sin(f * 0.05 + i); t_.g.rotation.x = 0.015 * Math.sin(f * 0.04 + i * 2); setLeaves(t_, 1, f); });
    R.blanket.visible = Wd.blanket !== false; R.pillow.scale.set(1, 1 + (Wd.fluff || 0) * 0.18, 0.55 * (1 - (Wd.fluff || 0) * 0.1));
  }
  if (view.set === 'or') {
    const op = Wd.doors ?? 1; for (const { hg, s } of ORS.leaves) hg.rotation.y = -s * op * 1.45;
    ORS.str.forEach(({ sg, s }, i) => { const p = (Wd.str || [])[i] || [s * 0.8, 0, -3]; sg.position.set(p[0], p[1], p[2]); });
  }
  if (view.set === 'archive') {
    setLeaves(ARC.tree, Wd.leaves ?? 1, f); ARC.tree.br.forEach((b) => (b.visible = true));
    const mv = Wd.folders || []; ARC.mv.forEach((m, i) => { const q = mv[i] || [0.3, 0, 0.1, 0]; m.position.set(q[0], 0.83 + q[1], q[2]); m.rotation.y = q[3]; });
  }
  if (view.set === 'exit') { const op = Wd.doors ?? 0; for (const { d, s } of EXIT.doors) d.position.set(s * (0.72 + op * 1.3), 0, 0.05); }
  if (view.set === 'garden' || view.set === 'exit' || view.set === 'pov') trees.forEach((t_, i) => { if (t_.g.parent === SETS[view.set]) { t_.g.rotation.z = 0.02 * Math.sin(f * 0.05 + i); setLeaves(t_, 1, f); } });
}
const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip || o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else { o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; } }
  });
};
const setRect = (rt, y0, y1) => { const yy = Math.round(H * (1 - y1)), hh = Math.round(H * (y1 - y0)); rt.viewport.set(0, yy, W, hh); rt.scissor.set(0, yy, W, hh); rt.scissorTest = true; };

window.renderFrame = (f) => {
  const views = viewsAt(f, T);
  let first = true;
  views.forEach((v, vi) => {
    for (const k in SETS) SETS[k].visible = k === v.set;
    const ox = OX[v.set], L = v.light, C = v.cam;
    applyLight(L, ox);
    const y0 = v.y0 ?? 0, y1 = v.y1 ?? 1;
    camera.aspect = W / (H * (y1 - y0));
    camera.position.set(C.pos[0] + ox, C.pos[1], C.pos[2]); camera.up.set(0, 1, 0); camera.lookAt(C.look[0] + ox, C.look[1], C.look[2]); camera.rotateZ(rx(C.roll || 0));
    camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    worldState(v, f);
    const fc = C.shadowAt || C.look; placeSun(L, new THREE.Vector3(fc[0] + ox, fc[1], fc[2]));
    hideCards(); drawActors(v.actors || [], camera, vi * 40, ox);
    sky.position.copy(camera.position); for (const c of clouds) c.quaternion.copy(camera.quaternion);
    // colour
    setRect(rtColor, y0, y1); renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
    // normal + depth
    const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false;
    swapForNd(true); setRect(rtNd, y0, y1); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
    scene.fog = fog; renderer.shadowMap.enabled = sm;
    first = false;
  });
  rtColor.scissorTest = rtNd.scissorTest = false; rtColor.viewport.set(0, 0, W, H); rtNd.viewport.set(0, 0, W, H);
  // ink + grade (top view = views[0], bottom = views[1])
  const A = views[0], B = views[1] || views[0], LA = A.light, LB = B.light;
  inkU.sat.value = LA.sat ?? 1; inkU.gain.value.set(LA.gain || '#ffffff'); inkU.lift.value.set(LA.lift || '#000000');
  inkU.sat2.value = LB.sat ?? 1; inkU.gain2.value.set(LB.gain || '#ffffff'); inkU.lift2.value.set(LB.lift || '#000000');
  inkU.fade2.value = B.fade || 0; inkU.splitY.value = views.length > 1 ? 1 - (views[1].y0 ?? 0.5) : -1; inkU.divider.value = views.length > 1 ? 3.5 : 0;
  inkU.vig.value = LA.vig ?? 0.22; inkU.flash.value = A.flash || 0; inkU.flashCol.value.set(A.flashCol || '#ffffff');
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = A.dof?.focus ?? 5; dofU.cinf.value = A.dof?.cinf ?? 0; dofU.focus2.value = B.dof?.focus ?? 5; dofU.cinf2.value = B.dof?.cinf ?? 0; dofU.near.value = A.dof?.near ?? 1; dofU.splitY.value = inkU.splitY.value;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
