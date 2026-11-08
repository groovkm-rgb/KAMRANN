// Emu War — 1930s Australian wheatbelt world on the cartoon-short-kit engine (cards + ink + lens + grade).
import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { TOTAL, shotAt, camAt, dofAt, lightFor, actorsAt, worldAt, fxAt, herdAt } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 2500);
const rx = (a) => a * Math.PI / 180;

// ---------- painted textures (deterministic) ----------
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const redDirt = (seed, base = [16, 58, 44]) => {
  const [c, g] = cv(512, 512), r = P.rng(seed); g.fillStyle = hsl(...base); g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { g.fillStyle = hsl(base[0] + r() * 10 - 4, base[1] - 8 + r() * 14, base[2] - 8 + r() * 16, 0.45); g.beginPath(); g.ellipse(r() * 512, r() * 512, 6 + r() * 30, 4 + r() * 16, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 500; i++) { g.fillStyle = hsl(base[0] + 4, 30, base[2] + (r() < 0.5 ? -18 : 16), 0.8); g.beginPath(); g.arc(r() * 512, r() * 512, 0.8 + r() * 2.2, 0, 7); g.fill(); }
  return c;
};
const roadTex = (seed) => {
  const c = redDirt(seed, [20, 50, 56]), g = c.getContext('2d'), r = P.rng(seed + 5);
  for (const x of [150, 362]) { g.fillStyle = hsl(18, 45, 44, 0.55); g.fillRect(x - 26, 0, 52, 512); for (let i = 0; i < 40; i++) { g.fillStyle = hsl(18, 40, 38, .5); g.fillRect(x - 24 + r() * 48, r() * 512, 3, 14 + r() * 20); } }
  return c;
};
const wheatTex = (seed) => {
  const [c, g] = cv(512, 512), r = P.rng(seed); g.fillStyle = '#d9ab45'; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 8) { g.fillStyle = hsl(40 + r() * 6, 62, 50 + r() * 10, 0.6); g.fillRect(0, y, 512, 4); }
  for (let i = 0; i < 2600; i++) { const x = r() * 512, y = r() * 512; g.strokeStyle = r() < 0.5 ? hsl(44, 75, 66, .9) : hsl(36, 60, 40, .8); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 3 - 1.5, y - 4 - r() * 6); g.stroke(); }
  return c;
};
const scrubTex = (seed) => {
  const [c, g] = cv(512, 512), r = P.rng(seed); g.fillStyle = '#c29a5c'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 160; i++) { g.fillStyle = r() < 0.5 ? hsl(22, 50, 46, .5) : hsl(44, 40, 58, .5); g.beginPath(); g.ellipse(r() * 512, r() * 512, 10 + r() * 40, 6 + r() * 20, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 1500; i++) { const x = r() * 512, y = r() * 512; g.strokeStyle = hsl(40 + r() * 15, 40, 45 + r() * 25, .9); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 6 - 3, y - 4 - r() * 6); g.stroke(); }
  return c;
};
const corrugated = (base = 72) => { const [c, g] = cv(256, 256); for (let x = 0; x < 256; x += 8) { const gr = g.createLinearGradient(x, 0, x + 8, 0); gr.addColorStop(0, hsl(205, 6, base - 14)); gr.addColorStop(0.5, hsl(205, 8, base + 10)); gr.addColorStop(1, hsl(205, 6, base - 14)); g.fillStyle = gr; g.fillRect(x, 0, 8, 256); } g.fillStyle = 'rgba(150,80,40,.18)'; g.fillRect(0, 200, 256, 56); return c; };
const boards = (seed) => { const [c, g] = cv(256, 256), r = P.rng(seed); for (let y = 0; y < 256; y += 32) { g.fillStyle = hsl(40, 32, 80 + r() * 6); g.fillRect(0, y, 256, 32); g.fillStyle = hsl(35, 25, 55, .8); g.fillRect(0, y + 28, 256, 4); } for (let i = 0; i < 40; i++) { g.fillStyle = hsl(30, 20, 60, .3); g.fillRect(r() * 256, r() * 256, 20 + r() * 50, 2); } return c; };
const cloth = (seed, hue = 44, l = 76) => { const [c, g] = cv(256, 256), r = P.rng(seed); g.fillStyle = hsl(hue, 35, l); g.fillRect(0, 0, 256, 256); for (let i = 0; i < 256; i += 4) { g.fillStyle = hsl(hue, 30, l - 6, .35); g.fillRect(i, 0, 1, 256); g.fillRect(0, i, 256, 1); } for (let i = 0; i < 30; i++) { g.fillStyle = hsl(hue - 10, 30, l - 18, .25); g.beginPath(); g.ellipse(r() * 256, r() * 256, 8 + r() * 30, 5 + r() * 14, r() * 3, 0, 7); g.fill(); } return c; };
const bark = (seed) => { const [c, g] = cv(128, 256), r = P.rng(seed); g.fillStyle = '#e4dccd'; g.fillRect(0, 0, 128, 256); for (let i = 0; i < 40; i++) { g.fillStyle = r() < 0.5 ? 'rgba(160,150,130,.5)' : 'rgba(200,170,130,.45)'; g.beginPath(); g.ellipse(r() * 128, r() * 256, 6 + r() * 16, 12 + r() * 30, 0, 0, 7); g.fill(); } return c; };
const brassTex = (seed) => { const [c, g] = cv(256, 256), r = P.rng(seed); g.fillStyle = '#9a6a22'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 520; i++) { const x = r() * 256, y = r() * 256, a = r() * 3, L = 9 + r() * 6; g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = r() < 0.5 ? '#e9b850' : '#c99434'; g.fillRect(-L, -3.5, 2 * L, 7); g.fillStyle = '#fff0b0'; g.fillRect(-L, -3.5, 2 * L, 2); g.fillStyle = '#6a4416'; g.beginPath(); g.ellipse(L, 0, 2, 3.4, 0, 0, 7); g.fill(); g.restore(); } return c; };
const stalks = (seed) => { // one wheat tuft (alpha), 256x256
  const [c, g] = cv(256, 256), r = P.rng(seed);
  for (let i = 0; i < 16; i++) {
    const x0 = 40 + r() * 176, lean = (r() - 0.5) * 50, top = 26 + r() * 50, x1 = x0 + lean;
    g.strokeStyle = hsl(40 + r() * 6, 60, 42 + r() * 12); g.lineWidth = 3; g.beginPath(); g.moveTo(x0, 256); g.quadraticCurveTo(x0 + lean * 0.3, 140, x1, top + 34); g.stroke();
    g.save(); g.translate(x1, top + 20); g.rotate(lean / 180);
    g.fillStyle = hsl(44, 78, 56 + r() * 10); g.strokeStyle = hsl(32, 60, 30); g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 0, 6.5, 22, 0, 0, 7); g.fill(); g.stroke();
    g.strokeStyle = hsl(32, 60, 34, .9); g.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(-6, k * 7); g.lineTo(0, k * 7 + 4); g.lineTo(6, k * 7); g.stroke(); }
    g.strokeStyle = hsl(46, 70, 70, .9); g.lineWidth = 1; g.beginPath(); g.moveTo(0, -20); g.lineTo(lean * 0.1, -46); g.stroke(); g.restore();
  }
  return c;
};

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([105, 105, 105, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const M = {
  dirt: texM(redDirt(3), 700, 700), road: texM(roadTex(4), 1, 60), scrub: texM(scrubTex(5), 40, 120), wheatG: texM(wheatTex(6), 60, 120),
  corr: texM(corrugated(), 3, 1), tankC: texM(corrugated(64), 6, 1), boards: texM(boards(7), 3, 1), canvas: texM(cloth(8), 2, 2), brand: texM(cloth(9, 50, 62), 2, 2),
  plank: texM(P.planks(1), 1, 1), beam: texM(P.beam(2, [28, 34, 36]), 1, 2), bark: texM(bark(10), 1, 2), brass: texM(brassTex(11), 6, 3),
  post: toon({ color: '#6e5238' }), wire: toon({ color: '#5a5a5a' }), gum: toon({ color: '#7f9c6c' }), gum2: toon({ color: '#6a8a5e' }), gumFar: toon({ color: '#8aa48a' }),
  bush: toon({ color: '#97935e' }), bush2: toon({ color: '#7f8a58' }), dry: toon({ color: '#b39a62' }), rock: toon({ color: '#9a5634' }), rock2: toon({ color: '#b7764a' }),
  hill: toon({ color: '#c79a5c' }), hill2: toon({ color: '#b8875a' }), range: toon({ color: '#9fa2b4' }),
  steel: toon({ color: '#a8adb2' }), steelD: toon({ color: '#7d8388' }), olive: toon({ color: '#857c46' }), oliveD: toon({ color: '#5f5a34' }), tyre: toon({ color: '#2b2726' }),
  hub: toon({ color: '#b3a774' }), glass: toon({ color: '#2a3138' }), lamp: toon({ color: '#ffe9a8', emissive: '#6a5520' }), chrome: toon({ color: '#d9dcd8' }),
  gun: toon({ color: '#3d433d' }), gunL: toon({ color: '#5a625a' }), wood: toon({ color: '#8a5a32' }), drum: toon({ color: '#6b7466' }),
  sand: toon({ color: '#cdb37e' }), mud: toon({ color: '#6b4a30' }), reed: toon({ color: '#8b8a4a' }), roofRed: toon({ color: '#9c4a32' }),
  door: toon({ color: '#5e7f86' }), win: toon({ color: '#33424a' }), brick: toon({ color: '#a4553a' }), white: toon({ color: '#efe9da' }),
  casing: toon({ color: '#e0ad48' }), casingD: toon({ color: '#b5822c' }), hillSun: toon({ color: '#c98a52' }),
};
M.dirt.map.repeat.set(700, 700);

// ---------- ink / normal-depth contract ----------
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vec4 p = vec4(position,1.); vec3 nn = normal;
    #ifdef USE_INSTANCING
    p = instanceMatrix * p; nn = mat3(instanceMatrix) * nn;
    #endif
    vN = normalize(normalMatrix*nn); vec4 mv = modelViewMatrix*p; vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 p = vec4(position,1.);
    #ifdef USE_INSTANCING
    p = instanceMatrix * p;
    #endif
    vec4 mv = modelViewMatrix*p; vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
const flatNd = new THREE.ShaderMaterial({ // ground: depth only, flat up-normal (no creases from texture)
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (r0, r1, h, n = 12) => new THREE.CylinderGeometry(r0, r1, h, n);
const grp = (x = 0, y = 0, z = 0, parent = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
/** cylinder from a to b */
const rod = (a, b, r, mat, parent = scene, cast = true) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
  const m = add(cyl(r, r, L, 6), mat, 0, 0, 0, parent, { cast }); m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return m;
};

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .5)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .45*pow(max(s,0.), 18.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// =====================================================================================
// WORLD
// =====================================================================================
const world = grp();
// ground layers
const plane = (w, d, mat, x, y, z, nd = flatNd) => { const m = add(new THREE.PlaneGeometry(w, d), mat, x, y, z, world, { cast: false }); m.rotation.x = -Math.PI / 2; m.userData.nd = nd; return m; };
plane(5000, 5000, M.dirt, 0, 0, 0);
const roadMain = plane(6.4, 1000, M.road, 0, 0.012, -230); M.road.map.repeat.set(1, 150);
const scrubMat = M.scrub; plane(560, 1400, scrubMat, 340, 0.006, -150);
const trackMat = toon({ map: P.tex(roadTex(14), 1, 220) }); plane(4.6, 1400, trackMat, 200, 0.014, -150);
// wheat ground with a live mask (field shape + eaten areas)
const FX0 = -220, FX1 = 60, FZ0 = -560, FZ1 = 80;
const [maskC, maskG] = cv(512, 1024); const maskT = new THREE.CanvasTexture(maskC); maskT.minFilter = THREE.LinearFilter;
const wheatMat = toon({ map: P.tex(wheatTex(6), 60, 120), alphaMap: maskT, alphaTest: 0.5 });
plane(FX1 - FX0, FZ1 - FZ0, wheatMat, (FX0 + FX1) / 2, 0.03, (FZ0 + FZ1) / 2);
const FARM = [-36, -84];
const inField = (x, z) => x > FX0 && x < FX1 && z > FZ0 && z < FZ1 && Math.abs(x) > 3.6 && !(x > 3.4 && x < 38 && z > -10 && z < 38) && Math.hypot(x - FARM[0], z - FARM[1]) > 17 && !(z > -60 && z < -57.5 && x < -3);
let EAT = null; // { front, x0, x1, patch:[cx,cz,r] }
const rag = (x, z) => 3.2 * Math.sin(x * 0.17) + 2.1 * Math.sin(x * 0.053 + 1.3) + 1.3 * Math.sin(x * 0.41 + z * 0.02);
const eatenAt = (x, z) => {
  if (!EAT) return false;
  if (EAT.patch) { const [cx, cz, r] = EAT.patch; if (Math.hypot(x - cx, (z - cz) * 0.8) < r + rag(z, x) * 0.8) return true; }
  if (EAT.front !== undefined) { const e0 = EAT.x0 ?? -1e9, e1 = EAT.x1 ?? 1e9; if (x > e0 + rag(z, 3) && x < e1 + rag(z, 9) && z < EAT.front + rag(x, z)) return true; }
  return false;
};
let maskKey = '';
const updateMask = () => {
  const k = JSON.stringify(EAT); if (k === maskKey) return; maskKey = k;
  const img = maskG.createImageData(512, 1024), d = img.data;
  // plane v=1 (canvas row 0, flipY) is world z = FZ0; u=0 is x = FX0
  for (let j = 0; j < 1024; j++) for (let i = 0; i < 512; i++) {
    const x = FX0 + (i + 0.5) / 512 * (FX1 - FX0), z = FZ0 + (j + 0.5) / 1024 * (FZ1 - FZ0);
    const v = inField(x, z) && !eatenAt(x, z) ? 255 : 0, o = (j * 512 + i) * 4; d[o] = d[o + 1] = d[o + 2] = v; d[o + 3] = 255;
  }
  maskG.putImageData(img, 0, 0); maskT.needsUpdate = true;
};
// 3D wheat tufts (instanced, swaying, eaten ones vanish)
const MAXT = 26000;
const tuftGeo = (() => {
  const gs = []; for (let k = 0; k < 3; k++) { const g = new THREE.PlaneGeometry(1.0, 1.05); g.translate(0, 0.5, 0); g.rotateY(k * Math.PI / 3); gs.push(g); }
  const pos = [], uv = [], nor = [], idx = []; let o = 0;
  for (const g of gs) { pos.push(...g.attributes.position.array); uv.push(...g.attributes.uv.array); for (let i = 0; i < g.attributes.position.count; i++) nor.push(0, 1, 0); idx.push(...Array.from(g.index.array).map((v) => v + o)); o += g.attributes.position.count; }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); G.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); G.setIndex(idx); return G;
})();
const tuftTex = P.tex(stalks(21)); tuftTex.wrapS = tuftTex.wrapT = THREE.ClampToEdgeWrapping;
const tuftMat = toon({ map: tuftTex, alphaTest: 0.45, side: THREE.DoubleSide });
const tufts = new THREE.InstancedMesh(tuftGeo, tuftMat, MAXT); tufts.frustumCulled = false; tufts.castShadow = false; tufts.receiveShadow = true;
tufts.userData.nd = cardNd(tuftTex); scene.add(tufts);
const hash = (i, j, k = 0) => { const x = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return x - Math.floor(x); };
const tm = new THREE.Matrix4(), tq = new THREE.Quaternion(), te = new THREE.Euler(), tv = new THREE.Vector3(), ts = new THREE.Vector3();
const updateTufts = (Wd, f) => {
  let n = 0; const c = Wd.wheatC; if (!c) { tufts.count = 0; return; }
  const R = Wd.wheatR || 36, sp = Wd.wheatSp || 0.55, t = f / 30;
  const i0 = Math.floor((c[0] - R) / sp), i1 = Math.ceil((c[0] + R) / sp), j0 = Math.floor((c[1] - R) / sp), j1 = Math.ceil((c[1] + R) / sp);
  for (let i = i0; i <= i1 && n < MAXT; i++) for (let j = j0; j <= j1 && n < MAXT; j++) {
    const x = (i + hash(i, j) * 0.8) * sp, z = (j + hash(i, j, 1) * 0.8) * sp;
    if ((x - c[0]) ** 2 + (z - c[1]) ** 2 > R * R) continue;
    if (!inField(x, z) || eatenAt(x, z)) continue;
    let s = 0.8 + 0.4 * hash(i, j, 2);
    if (EAT && EAT.front !== undefined) { const d = z - (EAT.front + rag(x, z)); if (d < 2.5) s *= Math.max(0.05, d / 2.5); }
    const w = Math.sin(t * 2.1 + x * 0.21 + z * 0.13) * 0.13 + Math.sin(t * 3.3 + x * 0.5) * 0.04 + (Wd.wind || 0);
    te.set(w * 0.6, hash(i, j, 3) * 6.28, w); tq.setFromEuler(te); tv.set(x, 0, z); ts.set(s, s * (0.95 + 0.2 * hash(i, j, 4)), s);
    tm.compose(tv, tq, ts); tufts.setMatrixAt(n++, tm);
  }
  tufts.count = n; tufts.instanceMatrix.needsUpdate = true;
};

// fences: posts + 3 wires. Fall-able segments.
const fenceSegs = [];
const fenceLine = (x0, z0, x1, z1, fallable = false) => {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 3)), ang = Math.atan2(x1 - x0, z1 - z0);
  for (let i = 0; i < n; i++) {
    const cx = x0 + (x1 - x0) * (i + 0.5) / n, cz = z0 + (z1 - z0) * (i + 0.5) / n, sl = L / n;
    const g = grp(cx, 0, cz, world); g.rotation.y = ang;
    const inner = grp(0, 0, 0, g);
    add(cyl(0.07, 0.08, 1.25, 6), M.post, 0, 0.62, -sl / 2, inner);
    for (const y of [0.45, 0.75, 1.05]) add(cyl(0.012, 0.012, sl, 4), M.wire, 0, y, 0, inner, { cast: false }).rotation.x = Math.PI / 2;
    if (fallable) fenceSegs.push({ g, inner, x: cx, z: cz, seed: i });
  }
};
for (const s of [-1, 1]) { fenceLine(s * 3.8, -420, s * 3.8, s > 0 ? -12 : 70); }
fenceLine(3.8, 40, 3.8, 70);
fenceLine(-120, -58.5, -3.8, -58.5, true); fenceLine(-120, -140, -3.8, -140, true); fenceLine(-60, -58.5, -60, -140, true);
fenceLine(-20, -58.5, -20, -20, true); fenceLine(-90, -20, -3.8, -20, true);

// eucalyptus (gum) trees
const gumTree = (x, z, h = 10, seed = 1, far = false) => {
  const g = grp(x, 0, z, world), r = P.rng(seed);
  const lean = (r() - 0.5) * 0.25;
  const t1 = rod([0, 0, 0], [lean * h * 0.4, h * 0.55, 0], 0.28 * h / 10, M.bark, g);
  const top = [lean * h * 0.4, h * 0.55, 0];
  const canM = far ? M.gumFar : (r() < 0.5 ? M.gum : M.gum2);
  for (let k = 0; k < 4; k++) {
    const a = r() * 6.28, L = h * (0.25 + r() * 0.25), e = [top[0] + Math.cos(a) * L * 0.6, top[1] + L * (0.6 + r() * 0.4), top[2] + Math.sin(a) * L * 0.6];
    rod(top, e, 0.11 * h / 10, M.bark, g);
    const c = add(new THREE.SphereGeometry(1, 10, 8), canM, e[0], e[1] + 0.3, e[2], g); c.scale.set(h * (0.16 + r() * 0.1), h * (0.08 + r() * 0.05), h * (0.16 + r() * 0.1));
  }
  const c0 = add(new THREE.SphereGeometry(1, 10, 8), canM, top[0], h * 0.9, top[2], g); c0.scale.set(h * 0.22, h * 0.12, h * 0.2);
  return g;
};
{ const r = P.rng(77);
  for (let i = 0; i < 26; i++) { const s = i % 2 ? 1 : -1; const z = -420 + r() * 480; if (s > 0 && z > -14 && z < 40) continue; if (s < 0 && z > -75 && z < 20) continue; gumTree(s * (8 + r() * 6), z, 9 + r() * 6, 100 + i); }
  for (let i = 0; i < 40; i++) { const x = -200 + r() * 250, z = -520 + r() * 420; if (Math.abs(x) < 12 || (x > -110 && x < 30 && z > -230)) continue; gumTree(x, z, 10 + r() * 8, 200 + i); }
  for (let i = 0; i < 60; i++) { const a = r() * 6.28, d = 380 + r() * 300; gumTree(Math.cos(a) * d, Math.sin(a) * d - 100, 14 + r() * 10, 300 + i, true); }
  for (const [x, z] of [[-48, -76], [-44, -95], [-24, -98], [-30, -66]]) gumTree(x, z, 13, x * 7 + z);
}
// far hills / ranges
{ const r = P.rng(88);
  for (let i = 0; i < 22; i++) { const a = r() * 6.28, d = 900 + r() * 500; const h = add(new THREE.SphereGeometry(1, 20, 10), i % 2 ? M.hill : M.hill2, Math.cos(a) * d, -20, Math.sin(a) * d, world, { cast: false }); h.scale.set(120 + r() * 160, 40 + r() * 50, 120 + r() * 160); }
  for (let i = 0; i < 10; i++) { const a = r() * 6.28, d = 1600; const h = add(new THREE.SphereGeometry(1, 16, 8), M.range, Math.cos(a) * d, -30, Math.sin(a) * d, world, { cast: false }); h.scale.set(300, 110 + r() * 60, 200); }
}

// farmhouse (weatherboard, corrugated iron roof, veranda, tank)
{ const g = grp(FARM[0], 0, FARM[1], world); g.rotation.y = Math.PI / 2 - 0.15;
  add(box(11, 3.2, 7.5), M.boards, 0, 1.6, 0, g); M.boards.map.repeat.set(4, 1.3);
  const sh = new THREE.Shape(); sh.moveTo(-3.75, 0); sh.lineTo(3.75, 0); sh.lineTo(0, 2.6); sh.closePath();
  const gable = add(new THREE.ExtrudeGeometry(sh, { depth: 11.6, bevelEnabled: false }), M.white, -5.8, 3.2, 0, g); gable.rotation.y = Math.PI / 2;
  for (const s of [-1, 1]) { const rf = add(box(12.4, 0.12, 5.4), M.corr, 0, 4.5, s * 2.15, g); rf.rotation.x = s * Math.atan2(2.6, 4.4); }
  const ver = add(box(12.4, 0.1, 2.8), M.corr, 0, 3.0, 5.0, g); ver.rotation.x = 0.18;
  for (let i = 0; i < 6; i++) add(cyl(0.08, 0.08, 2.9, 6), M.white, -5.6 + i * 2.24, 1.45, 6.2, g);
  add(box(1.1, 2.1, 0.1), M.door, 0, 1.05, 3.8, g, { cast: false });
  for (const x of [-3.5, 3.5]) { add(box(1.3, 1.2, 0.1), M.win, x, 1.8, 3.8, g, { cast: false }); add(box(1.5, 0.12, 0.14), M.white, x, 2.45, 3.82, g); }
  add(box(0.9, 2.6, 0.9), M.brick, 3.8, 5.0, -1.2, g);
  const tank = add(cyl(1.5, 1.5, 2.4, 20), M.tankC, 7.6, 2.9, 1.5, g); add(box(3.2, 1.6, 3.2), M.beam, 7.6, 0.8, 1.5, g);
  add(new THREE.ConeGeometry(1.6, 0.6, 20), M.steel, 7.6, 4.4, 1.5, g);
}
// windmill water pump
const windFan = grp();
{ const g = grp(-22, 0, -70, world), Ht = 10;
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) rod([sx * 1.3, 0, sz * 1.3], [sx * 0.25, Ht, sz * 0.25], 0.06, M.steel, g);
  for (let k = 1; k < 5; k++) { const y = k * Ht / 5, w = 1.3 - (1.05) * y / Ht; for (const [a, b] of [[[-w, y, -w], [w, y, -w]], [[w, y, -w], [w, y, w]], [[w, y, w], [-w, y, w]], [[-w, y, w], [-w, y, -w]]]) rod(a, b, 0.035, M.steelD, g); }
  add(box(0.8, 0.12, 0.8), M.steelD, 0, Ht, 0, g);
  const head = grp(0, Ht + 0.35, 0, g); head.rotation.y = 0.6;
  add(box(0.3, 0.3, 1.2), M.steelD, 0, 0, 0, head);
  const tail = add(box(0.04, 1.0, 1.6), M.steel, 0, 0.2, -1.6, head);
  head.add(windFan); windFan.position.set(0, 0, 0.75);
  add(cyl(0.18, 0.18, 0.3, 10), M.steelD, 0, 0, 0, windFan).rotation.x = Math.PI / 2;
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, bl = grp(0, 0, 0, windFan); bl.rotation.z = a; const b = add(box(0.32, 1.7, 0.03), M.steel, 0, 1.15, 0, bl); b.rotation.y = 0.45; }
  rod([1.4, 0, 1.2], [1.4, 0.8, 1.2], 0.05, M.steelD, g); const tr = add(box(3.2, 0.5, 0.9), M.steelD, 2.6, 0.45, 1.6, g);
}

// ---------- camp (M2) ----------
const CAMP = [16, 12];
const crateGeo = box(0.9, 0.5, 0.55), crateMat = toon({ map: P.tex(P.planks(31), 1, 1) });
const crate = (x, y, z, ry = 0, parent = world) => { const c = add(crateGeo, crateMat, x, y + 0.25, z, parent); c.rotation.y = ry; for (const s of [-1, 1]) add(box(0.06, 0.52, 0.57), M.beam, s * 0.38, 0, 0, c); return c; };
const tent = (x, z, ry, s = 1) => {
  const g = grp(x, 0, z, world); g.rotation.y = ry; g.scale.setScalar(s);
  const sh = new THREE.Shape(); sh.moveTo(-1.9, 0); sh.lineTo(1.9, 0); sh.lineTo(0, 2.3); sh.closePath();
  const t = add(new THREE.ExtrudeGeometry(sh, { depth: 4.2, bevelEnabled: false }), M.canvas, 0, 0, -2.1, g);
  const door = new THREE.Shape(); door.moveTo(-0.6, 0); door.lineTo(0.6, 0); door.lineTo(0, 1.6); door.closePath();
  add(new THREE.ShapeGeometry(door), M.win, 0, 0.01, 2.13, g, { cast: false });
  rod([0, 0, 2.3], [0, 2.5, 2.3], 0.04, M.post, g); rod([0, 2.5, 2.3], [0, 0, 3.4], 0.012, M.wire, g);
  return g;
};
tent(24, 24, -0.3); tent(31, 13, -0.9, 1.1); tent(28, 31, 0.2, 0.95); tent(34, 25, -0.6);
const campCrates = [[9, 0, 4, 0.1], [10, 0, 4.6, -0.2], [9.5, 0.5, 4.3, 0.3], [11.5, 0, 3.6, 0.05], [12.4, 0, 4.4, 0.4], [11.9, 0.5, 4.0, -0.1], [19, 0, 18, 0.2], [20, 0, 18.4, 0], [19.5, 0.5, 18.2, 0.5]];
for (const [x, y, z, r] of campCrates) crate(x, y, z, r);
for (const [x, z] of [[21, 9], [22, 8.4], [21.5, 7.6]]) { add(cyl(0.3, 0.3, 0.9, 14), M.olive, x, 0.45, z); add(cyl(0.31, 0.31, 0.05, 14), M.oliveD, x, 0.7, z); }
// sandbag nests for the two camp guns
const sandbag = (x, y, z, ry, parent = world) => { const s = add(new THREE.CapsuleGeometry(0.17, 0.42, 4, 8), M.sand, x, y + 0.15, z, parent); s.rotation.set(0, ry, Math.PI / 2); s.scale.set(1, 1, 0.7); return s; };
const NESTS = [[5.6, -3.4], [11.2, -4.6]];
for (const [nx, nz] of NESTS) for (let k = -2; k <= 2; k++) { const a = k * 0.32; sandbag(nx + Math.sin(a) * 1.2, 0, nz - Math.cos(a) * 1.2, a); if (Math.abs(k) < 2) sandbag(nx + Math.sin(a) * 1.2, 0.27, nz - Math.cos(a) * 1.2, a + 0.15); }

// farm table (farmers' scene) + a pool of loose ammo crates
const table = grp(0, 0, 0, world);
{ add(box(1.7, 0.09, 0.95), crateMat, 0, 0.82, 0, table); for (const [x, z] of [[-0.75, -0.38], [0.75, -0.38], [-0.75, 0.38], [0.75, 0.38]]) add(box(0.08, 0.8, 0.08), M.beam, x, 0.4, z, table);
  add(cyl(0.05, 0.06, 0.16, 10), M.white, 0.45, 0.94, 0.1, table); add(box(0.3, 0.02, 0.22), M.white, -0.3, 0.875, -0.05, table); }
table.visible = false;
const dynCrates = []; for (let i = 0; i < 8; i++) { const c = crate(0, 0, 0, 0); c.visible = false; dynCrates.push(c); }
// ---------- machine gun (cartoon, drum pan magazine) ----------
const makeGun = (bipod = true) => {
  const g = grp(0, 0, 0, world), body = grp(0, 0, 0, g);
  add(cyl(0.085, 0.085, 0.95, 14), M.gun, 0, 0, 0.42, body).rotation.x = Math.PI / 2;
  for (let i = 0; i < 6; i++) add(cyl(0.092, 0.092, 0.04, 14), M.gunL, 0, 0, 0.05 + i * 0.15, body).rotation.x = Math.PI / 2;
  add(cyl(0.03, 0.03, 0.3, 8), M.gun, 0, 0, 1.02, body).rotation.x = Math.PI / 2;
  const muz = add(cyl(0.07, 0.035, 0.12, 10), M.gunL, 0, 0, 1.2, body); muz.rotation.x = Math.PI / 2;
  add(box(0.15, 0.16, 0.4), M.gun, 0, 0, -0.18, body);
  const pan = add(cyl(0.29, 0.29, 0.08, 24), M.drum, 0, 0.13, -0.12, body);
  add(cyl(0.08, 0.08, 0.1, 10), M.gunL, 0, 0.14, -0.12, body);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; add(box(0.02, 0.085, 0.2), M.gunL, Math.cos(a) * 0.17, 0.13, -0.12 + Math.sin(a) * 0.17, body).rotation.y = -a; }
  const st = add(box(0.07, 0.15, 0.42), M.wood, 0, -0.05, -0.55, body); st.rotation.x = 0.12;
  add(box(0.06, 0.16, 0.07), M.wood, 0, -0.14, -0.28, body).rotation.x = -0.3;
  if (bipod) for (const s of [-1, 1]) rod([0, 0, 0.7], [s * 0.28, -0.42, 0.85], 0.022, M.gun, g);
  g.userData.body = body; g.userData.pan = pan; return g;
};
const guns = [makeGun(), makeGun()];
guns.forEach((g) => { g.visible = false; });

// ---------- 1930s army truck (no markings) ----------
const truck = grp(0, 0, 0, world), truckBody = grp(0, 0, 0, truck);
const wheels = [];
{ const b = truckBody, O = M.olive, OD = M.oliveD;
  add(box(1.5, 0.22, 5.6), OD, 0, 0.78, 0, b);
  // hood + radiator
  const hood = add(box(1.12, 0.85, 1.6), O, 0, 1.32, 2.05, b);
  add(new THREE.CylinderGeometry(0.56, 0.56, 1.6, 16, 1, false, Math.PI / 2, Math.PI), O, 0, 1.74, 2.05, b).rotation.set(Math.PI / 2, 0, 0);
  add(box(1.1, 1.15, 0.12), M.steelD, 0, 1.42, 2.9, b);
  for (let i = -4; i <= 4; i++) add(box(0.05, 0.95, 0.04), M.gun, i * 0.11, 1.42, 2.97, b);
  add(box(1.2, 0.12, 0.16), M.chrome, 0, 0.72, 3.02, b);
  for (const s of [-1, 1]) { const hl = add(cyl(0.17, 0.17, 0.22, 16), M.gun, s * 0.78, 1.55, 2.8, b); hl.rotation.x = Math.PI / 2; add(cyl(0.14, 0.14, 0.02, 16), M.lamp, s * 0.78, 1.55, 2.92, b, { cast: false }).rotation.x = Math.PI / 2; rod([s * 0.62, 1.45, 2.75], [s * 0.78, 1.5, 2.75], 0.03, M.gun, b); }
  // round fenders over front wheels + running boards
  for (const s of [-1, 1]) {
    const fd = add(new THREE.CylinderGeometry(0.66, 0.66, 0.46, 20, 1, false, 0, Math.PI), O, s * 0.95, 0.6, 2.0, b); fd.rotation.z = Math.PI / 2; fd.scale.set(1, 1, 1.25);
    add(box(0.42, 0.06, 1.7), OD, s * 0.86, 0.6, 0.55, b);
    const rf = add(new THREE.CylinderGeometry(0.66, 0.66, 0.46, 20, 1, false, 0, Math.PI), O, s * 0.95, 0.6, -1.8, b); rf.rotation.z = Math.PI / 2; rf.scale.set(1, 1, 1.2);
  }
  // open cab: back wall, roof on posts, half doors, windscreen frame
  add(box(1.6, 1.5, 0.1), O, 0, 1.6, 0.3, b);
  add(box(1.7, 0.08, 1.35), OD, 0, 2.45, 0.95, b);
  for (const [x, z] of [[-0.78, 1.6], [0.78, 1.6], [-0.78, 0.3], [0.78, 0.3]]) add(box(0.06, 1.5, 0.06), OD, x, 1.7, z, b);
  add(box(1.6, 0.06, 0.06), OD, 0, 1.75, 1.62, b); add(box(1.5, 0.55, 0.03), M.glass, 0, 2.05, 1.62, b, { cast: false }).material = new THREE.MeshToonMaterial({ gradientMap: grad, color: '#9cc0d0', transparent: true, opacity: 0.35 });
  for (const s of [-1, 1]) add(box(0.06, 0.7, 1.3), O, s * 0.8, 1.2, 0.95, b);
  add(box(1.5, 0.5, 0.9), OD, 0, 1.1, 0.75, b);
  add(cyl(0.2, 0.2, 0.04, 14), M.gun, -0.35, 1.75, 1.35, b).rotation.x = 1.1;
  // cargo bed
  add(box(1.9, 0.12, 2.9), M.wood, 0, 1.0, -1.35, b);
  for (const s of [-1, 1]) add(box(0.08, 0.5, 2.9), O, s * 0.95, 1.3, -1.35, b);
  add(box(1.9, 0.5, 0.08), O, 0, 1.3, -2.78, b);
}
const canopy = grp(0, 0, 0, truckBody);
{ const c = add(new THREE.CylinderGeometry(0.97, 0.97, 2.9, 20, 1, true, Math.PI / 2, Math.PI), M.brand, 0, 1.55, -1.35, canopy); c.rotation.x = Math.PI / 2; c.material = new THREE.MeshToonMaterial({ gradientMap: grad, map: M.brand.map, side: THREE.DoubleSide });
  for (const z of [-2.7, -1.35, 0.0]) add(new THREE.TorusGeometry(0.97, 0.03, 6, 20, Math.PI), M.oliveD, 0, 1.55, z - 0.0, canopy); }
const bedGun = makeGun(false); truckBody.add(bedGun); bedGun.position.set(0, 2.3, -1.6); rod([0, 1.05, -1.6], [0, 2.22, -1.6], 0.06, M.gun, truckBody);
const bedPost = truckBody.children[truckBody.children.length - 1];
for (const [x, z] of [[-0.95, 2.0], [0.95, 2.0], [-0.95, -1.8], [0.95, -1.8]]) {
  const w = grp(x, 0.58, z, truck); const t = add(new THREE.TorusGeometry(0.44, 0.15, 10, 24), M.tyre, 0, 0, 0, w); t.rotation.y = Math.PI / 2;
  add(cyl(0.34, 0.34, 0.12, 18), M.oliveD, 0, 0, 0, w).rotation.z = Math.PI / 2;
  const hb = add(cyl(0.13, 0.13, 0.26, 12), M.hub, 0, 0, 0, w); hb.rotation.z = Math.PI / 2;
  for (let i = 0; i < 5; i++) { const sp = add(box(0.16, 0.62, 0.09), M.hub, 0, 0, 0, w); sp.rotation.x = i * Math.PI / 5; }
  wheels.push(w);
}
truck.visible = false;

// ---------- pond (M3) ----------
const POND = [120, -60];
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#6e5136') }, shal: { value: new THREE.Color('#a07d55') }, glint: { value: new THREE.Color('#e8d6b6') } };
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
    void main(){ vec2 q = vW.xz - vec2(${POND[0]}., ${POND[1]}.); float r = length(q);
      float n = noise(q*.35 + vec2(t*.2, 0.)) * .6 + noise(q*1.1 - t*.3) * .4;
      vec3 c = mix(deep, shal, .3 + .5*n + .3*smoothstep(6.,9.,r));
      float ring = smoothstep(.85,.97, sin(r*2.2 - t*2.4)*.5+.5) * (1.-smoothstep(3.,8.,r));
      c = mix(c, glint, ring*.12);
      gl_FragColor = vec4(c,1.);
      #include <fog_fragment>
    }`,
});
{ const w = add(new THREE.CircleGeometry(9, 48), waterMat, POND[0], 0.05, POND[1], world, { cast: false }); w.rotation.x = -Math.PI / 2; w.scale.set(1.2, 1, 1); w.userData.nd = flatNd;
  const rim = add(new THREE.RingGeometry(8.6, 12.5, 48), M.mud, POND[0], 0.04, POND[1], world, { cast: false }); rim.rotation.x = -Math.PI / 2; rim.scale.set(1.2, 1, 1); rim.userData.nd = flatNd;
  const r = P.rng(55);
  for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = 10 + r() * 2; add(new THREE.ConeGeometry(0.05, 0.8 + r() * 0.7, 4), M.reed, POND[0] + Math.cos(a) * d * 1.2, 0.4, POND[1] + Math.sin(a) * d, world); }
}
const bushClump = (x, z, s = 1, seed = 1, dry = false) => {
  const g = grp(x, 0, z, world), r = P.rng(seed);
  for (let k = 0; k < 6; k++) { const m = add(new THREE.IcosahedronGeometry(1, 1), dry ? (k % 2 ? M.dry : M.bush) : (k % 2 ? M.bush : M.bush2), (r() - 0.5) * 1.8 * s, 0.5 * s + r() * 0.5 * s, (r() - 0.5) * 1.2 * s, g); m.scale.set(s * (0.7 + r() * 0.5), s * (0.55 + r() * 0.4), s * (0.6 + r() * 0.4)); }
  for (let k = 0; k < 8; k++) { const a = r() * 6.28; rod([0, 0.3 * s, 0], [Math.cos(a) * 1.4 * s, (1.2 + r() * 0.8) * s, Math.sin(a) * 0.9 * s], 0.02 * s, M.post, g); }
  return g;
};
{ const r = P.rng(66);
  for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = 15 + r() * 50; const x = POND[0] + Math.cos(a) * d, z = POND[1] + Math.sin(a) * d; if (Math.hypot(x - (POND[0] - 1), z - (POND[1] + 15)) < 16 || (z < POND[1] - 6 && Math.abs(x - POND[0]) < 55)) continue; bushClump(x, z, 0.7 + r() * 0.8, 400 + i, r() < 0.5); }
  for (let i = 0; i < 12; i++) { const a = r() * 6.28, d = 25 + r() * 60, x = POND[0] + Math.cos(a) * d, z = POND[1] + Math.sin(a) * d - 20; if (Math.hypot(x - (POND[0] - 1), z - (POND[1] + 15)) < 18) continue; gumTree(x, z, 9 + r() * 7, 500 + i); }
}
const AMBUSH = [POND[0] - 1, POND[1] + 15];
{ const g = grp(AMBUSH[0], 0, AMBUSH[1], world), r = P.rng(909); // the ambush hedge: a low dense wall, soldiers crouch behind (+z)
  for (let k = 0; k < 9; k++) { const x = -2.2 + k * 0.55 + (r() - 0.5) * 0.2, m = add(new THREE.IcosahedronGeometry(1, 1), k % 3 ? M.bush : M.bush2, x, 0.72 + r() * 0.12, -0.35 - r() * 0.35, g); m.scale.set(0.62 + r() * 0.15, 0.85 + r() * 0.12, 0.6); }
  for (let k = 0; k < 14; k++) { const a = r() * 3.14; rod([-2 + r() * 4, 0.9, -0.5], [-2.4 + r() * 4.8, 1.75 + r() * 0.5, -0.4 - r() * 0.5], 0.02, M.post, g); } }

// ---------- rough track (M4) ----------
{ const r = P.rng(123);
  for (let i = 0; i < 90; i++) { const z = 260 - i * 10 - r() * 6, x = 200 + (r() - 0.5) * 3.2; const ph = add(new THREE.CircleGeometry(0.5 + r() * 0.5, 14), M.mud, x, 0.02, z, world, { cast: false }); ph.rotation.x = -Math.PI / 2; ph.scale.set(1.4, 1, 1); ph.userData.nd = flatNd; }
  for (let i = 0; i < 160; i++) { const s = r() < 0.5 ? -1 : 1, z = 280 - r() * 900, x = 200 + s * (3 + r() * 30); const k = r(); if (k < 0.45) { const rk = add(new THREE.DodecahedronGeometry(0.3 + r() * 0.6, 0), r() < 0.5 ? M.rock : M.rock2, x, 0.1, z, world); rk.scale.y = 0.6; rk.rotation.y = r() * 3; } else if (k < 0.85) bushClump(x, z, 0.5 + r() * 0.7, 700 + i, r() < 0.6); else gumTree(x + s * 8, z, 8 + r() * 6, 800 + i); }
}

// ---------- shell casing mountain (M5) ----------
const PILE = [27, 3];
const PR = 4.6, PH = 4.0; const pileCone = add(new THREE.ConeGeometry(PR, PH, 48, 4), M.brass, PILE[0], PH / 2, PILE[1], world); M.brass.map.repeat.set(8, 3);
const casGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.2, 7); casGeo.rotateZ(Math.PI / 2);
const NCAS = 4600, casings = new THREE.InstancedMesh(casGeo, M.casing, NCAS); casings.castShadow = false; casings.receiveShadow = true; casings.userData.nd = ndMat; world.add(casings);
const casBase = [];
{ const r = P.rng(321);
  for (let i = 0; i < NCAS; i++) {
    let x, y, z; if (i < 3900) { const a = r() * 6.28, h = Math.pow(r(), 0.8) * (PH - 0.05), rr = PR * (1 - h / PH) + 0.02; x = PILE[0] + Math.cos(a) * rr; z = PILE[1] + Math.sin(a) * rr; y = h + 0.03; }
    else { const a = r() * 6.28, d = PR - 0.1 + r() * 2.8; x = PILE[0] + Math.cos(a) * d; z = PILE[1] + Math.sin(a) * d; y = 0.05; }
    casBase.push([x, y, z, r() * 6.28, r() * 6.28]);
  }
}
const updateCasings = (t) => {
  for (let i = 0; i < NCAS; i++) {
    let [x, y, z, a, b] = casBase[i];
    if (t !== null && i % 9 === 0 && i < 3900) { // a stream of casings slides down the pile, endlessly
      const k = ((t * 0.55 + (i / 9) * 0.137) % 1), ang = Math.atan2(z - PILE[1], x - PILE[0]), h = (PH - 0.05) * (1 - k), rr = PR * (1 - h / PH) + 0.06;
      x = PILE[0] + Math.cos(ang) * rr; z = PILE[1] + Math.sin(ang) * rr; y = h + 0.05; a += t * 9 * (1 + (i % 3)); b += t * 5;
    }
    te.set(b, a, 0.4 * Math.sin(a)); tq.setFromEuler(te); tv.set(x, y, z); ts.set(1, 1, 1); tm.compose(tv, tq, ts); casings.setMatrixAt(i, tm);
  }
  casings.instanceMatrix.needsUpdate = true;
};
updateCasings(null);

// ---------- sunset hill (M7) ----------
const HILL = [40, 360];
{ const h = add(new THREE.SphereGeometry(80, 48, 24), M.hillSun, HILL[0], -66, HILL[1], world, { cast: false }); h.scale.set(1.6, 1, 1);
  const r = P.rng(444); for (let i = 0; i < 8; i++) { const sd = i % 2 ? 1 : -1, x = HILL[0] + sd * (55 + r() * 50), z = HILL[1] + 10 + r() * 40; gumTree(x, z, 12 + r() * 8, 900 + i); } }

// clouds: painted billboards, low in the sky (top band stays clean)
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.1); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false, opacity: 0.92 }));
    const a = r() * Math.PI * 2, d = 1300 + r() * 300; m.position.set(Math.cos(a) * d, 70 + r() * 110, Math.sin(a) * d); m.scale.setScalar(220 + r() * 160);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// =====================================================================================
// HERD: hundreds of emus as instanced billboards from a painted atlas
// =====================================================================================
const CW = 1200, CH = 2000, CM = 2.25;
const atlasC = document.createElement('canvas'); atlasC.width = T.ATLAS.cols * T.ATLAS.cw; atlasC.height = T.ATLAS.rows * T.ATLAS.ch;
T.emuAtlas(atlasC.getContext('2d'));
const atlasT = new THREE.CanvasTexture(atlasC); atlasT.colorSpace = THREE.SRGBColorSpace; atlasT.anisotropy = 4; atlasT.generateMipmaps = true; atlasT.minFilter = THREE.LinearMipmapLinearFilter;
const MAXH = 2400;
const hGeo = new THREE.InstancedBufferGeometry(); { const pg = new THREE.PlaneGeometry(CM * 0.6, CM); pg.translate(0, CM / 2 - CM * 0.025, 0); hGeo.index = pg.index; hGeo.attributes.position = pg.attributes.position; hGeo.attributes.uv = pg.attributes.uv; }
const iPos = new THREE.InstancedBufferAttribute(new Float32Array(MAXH * 3), 3), iSc = new THREE.InstancedBufferAttribute(new Float32Array(MAXH), 1), iFr = new THREE.InstancedBufferAttribute(new Float32Array(MAXH), 1), iFl = new THREE.InstancedBufferAttribute(new Float32Array(MAXH), 1), iSh = new THREE.InstancedBufferAttribute(new Float32Array(MAXH), 1);
for (const a of [iPos, iSc, iFr, iFl, iSh]) a.setUsage(THREE.DynamicDrawUsage);
hGeo.setAttribute('iPos', iPos); hGeo.setAttribute('iSc', iSc); hGeo.setAttribute('iFr', iFr); hGeo.setAttribute('iFl', iFl); hGeo.setAttribute('iSh', iSh);
const herdV = `attribute vec3 iPos; attribute float iSc, iFr, iFl, iSh; uniform float uUp; uniform vec2 grid; varying vec2 vUv; varying float vSh; varying float vD;
  vec3 wp(){ vec3 toC = cameraPosition - iPos; vec3 rC = normalize(vec3(toC.z, 0., -toC.x)); vec3 uC = vec3(0.,1.,0.);
    vec3 rS = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]); vec3 uS = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec3 r = normalize(mix(rS, rC, uUp)), u = normalize(mix(uS, uC, uUp));
    return iPos + r * position.x * iSc * iFl + u * position.y * iSc; }
  void setUv(){ float col = mod(iFr, grid.x), row = floor(iFr / grid.x); vUv = vec2((col + uv.x) / grid.x, 1. - (row + 1. - uv.y) / grid.y); vSh = iSh; }`;
const herdU = { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), map: { value: atlasT }, uUp: { value: 1 }, grid: { value: new THREE.Vector2(T.ATLAS.cols, T.ATLAS.rows) }, tint: { value: new THREE.Color('#ffffff') } };
const herdMat = new THREE.ShaderMaterial({
  uniforms: herdU, fog: true, transparent: false, alphaToCoverage: true, side: THREE.DoubleSide,
  vertexShader: `#include <fog_pars_vertex>
    ${herdV}
    void main(){ setUv(); vec4 mvPosition = viewMatrix * vec4(wp(), 1.); gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform sampler2D map; uniform vec3 tint; varying vec2 vUv; varying float vSh;
    void main(){ vec4 c = texture2D(map, vUv); if (c.a < .12) discard; gl_FragColor = vec4(c.rgb * tint * vSh, c.a);
    #include <fog_fragment>
    }`,
});
const herdNd = new THREE.ShaderMaterial({ uniforms: herdU, side: THREE.DoubleSide,
  vertexShader: `${herdV} void main(){ setUv(); vec4 mv = viewMatrix * vec4(wp(), 1.); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if (texture2D(map, vUv).a < .5) discard; gl_FragColor = vec4(0.,0.,0.,vD); }` });
const herd = new THREE.Mesh(hGeo, herdMat); herd.frustumCulled = false; herd.userData.nd = herdNd; herd.renderOrder = 2; scene.add(herd);
// ground blobs under the herd
const bGeo = new THREE.InstancedBufferGeometry(); { const pg = new THREE.PlaneGeometry(1.2, 0.75); pg.rotateX(-Math.PI / 2); bGeo.index = pg.index; bGeo.attributes.position = pg.attributes.position; bGeo.attributes.uv = pg.attributes.uv; }
bGeo.setAttribute('iPos', iPos); bGeo.setAttribute('iSc', iSc);
const blobTex = P.tex(P.radial('40,20,10', 0.5));
const herdBlob = new THREE.Mesh(bGeo, new THREE.ShaderMaterial({ uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), map: { value: blobTex } }, fog: true, transparent: true, depthWrite: false,
  vertexShader: `#include <fog_pars_vertex>
    attribute vec3 iPos; attribute float iSc; varying vec2 vUv; varying float vA; void main(){ vUv = uv; vA = clamp(1. - iPos.y * 0.8, 0., 1.); vec4 mvPosition = viewMatrix * vec4(vec3(iPos.x, 0.04, iPos.z) + position * iSc * (1. + iPos.y * .3), 1.); gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform sampler2D map; varying vec2 vUv; varying float vA; void main(){ vec4 c = texture2D(map, vUv); gl_FragColor = vec4(c.rgb, c.a * vA);
    #include <fog_fragment>
    }` }));
herdBlob.frustumCulled = false; herdBlob.userData.ndSkip = true; herdBlob.renderOrder = 1; scene.add(herdBlob);
const updateHerd = (hd) => {
  const L = hd ? hd.list : []; const n = Math.min(MAXH, L.length);
  for (let i = 0; i < n; i++) { const e = L[i]; iPos.array[i * 3] = e[0]; iPos.array[i * 3 + 1] = e[1]; iPos.array[i * 3 + 2] = e[2]; iSc.array[i] = e[3]; iFr.array[i] = e[4]; iFl.array[i] = e[5]; iSh.array[i] = e[6] ?? 1; }
  hGeo.instanceCount = n; bGeo.instanceCount = hd && hd.blobs === false ? 0 : n;
  for (const a of [iPos, iSc, iFr, iFl, iSh]) a.needsUpdate = true;
  herdU.uUp.value = hd ? (hd.upright ?? 1) : 1; herdU.tint.value.set(hd && hd.tint || '#ffffff');
  herd.visible = n > 0; herdBlob.visible = n > 0;
};

// =====================================================================================
// CARDS
// =====================================================================================
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const cblobTex = P.tex(P.radial('30,14,10', 0.6));
class Card {
  constructor() {
    [this.c, this.g] = (() => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; return [c, c.getContext('2d')]; })();
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cblobTex, transparent: true, depthWrite: false, fog: true }));
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
// cache: reuse a card whose key matches (avoids redrawing when lists reorder)
const drawActors = (list, cam) => {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; c.used = false; });
  const pending = [];
  list.forEach((a) => { const c = cards.find((c) => !c.used && c.key === a.key); if (c) { c.used = true; place(c, a, cam); } else pending.push(a); });
  let k = 0;
  for (const a of pending) { while (cards[k] && cards[k].used) k++; const c = getCard(k); c.used = true; c.draw(a.key, a.draw); place(c, a, cam); }
};
const place = (c, a, cam) => {
  c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
  const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1) * (a.sx || 1), s * (a.sy || 1), s);
  if (a.face === 'cam') { c.mesh.quaternion.copy(cam.quaternion); if (a.roll) c.mesh.rotateZ(a.roll); }
  else c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
  c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1; c.mat.transparent = true;
  c.mesh.castShadow = a.shadow !== false; c.mesh.renderOrder = a.order || 2;
  if (a.blob !== false && a.y < 0.6) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? 0) + 0.03, a.z); c.blob.scale.set(0.95 * s * (a.bw || 1), 0.6 * s * (a.bw || 1), 1); }
};

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 }, fogCol: { value: new THREE.Color() },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 }, flashCol: { value: new THREE.Color(1, 1, 1) } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 fogCol, lift, gain, flashCol; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;
      if (card) ds = 1e4;
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9);
    }
    return e * (1. - smoothstep(140., 520., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, flashCol, flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 3000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<48;i++){ float fi = float(i); float r = sqrt((fi+.5)/48.); float a = fi*2.39996;
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
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
  for (const c of clouds) c.material.color.set(L.cloud || '#ffffff');
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  const lel = rx(L.lightEl ?? L.el); const lv = new THREE.Vector3(Math.cos(lel) * Math.cos(az), Math.sin(lel), Math.cos(lel) * Math.sin(az));
  sun.position.copy(focus).addScaledVector(lv, 120); sun.target.position.copy(focus);
  const ext = L.shadowExt || 30, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 300; sc.updateProjectionMatrix();
}
const gunState = (g, s) => {
  g.visible = !!s; if (!s) return;
  g.position.set(s.x, s.y ?? 0.42, s.z); g.rotation.set(s.pitch || 0, s.ry || 0, s.roll || 0);
  const b = g.userData.body; b.position.set(0, (s.jit || 0) * 0.5, -(s.recoil || 0)); b.rotation.set(s.kick || 0, 0, s.jit || 0);
};
function worldState(S, f) {
  EAT = S.eat || null; updateMask(); updateTufts(S, f);
  // fences fall when the eating front passes (or forced)
  for (const seg of fenceSegs) {
    let k = 0;
    if (S.fenceFall !== undefined) { const d = S.fenceFall + rag(seg.x, seg.z) - seg.z; k = Math.min(1, Math.max(0, d / 3)); }
    if (S.fenceDown && S.fenceDown(seg.x, seg.z)) k = 1;
    const e = 1 - Math.pow(1 - k, 2), dir = hash(seg.seed, 3) < 0.5 ? 1 : -1;
    seg.inner.rotation.set(e * 0.12 * dir, 0, e * 1.45 * (S.fenceDir || 1));
  }
  windFan.rotation.z = -f * 0.09;
  // truck
  const t = S.truck; truck.visible = !!t;
  if (t) {
    truck.position.set(t.x, t.y || 0, t.z); truck.rotation.set(0, t.ry || 0, 0);
    truckBody.position.y = t.bounce || 0; truckBody.rotation.set(t.pitch || 0, 0, t.roll || 0);
    for (const w of wheels) { w.rotation.x = (t.wheel || 0); w.position.y = 0.58 + (t.wheelHop || 0) * (w.position.z > 0 ? 1 : 0.6); }
    canopy.visible = !!t.canopy; bedGun.visible = !!t.gun; bedPost.visible = !!t.gun;
    if (t.gun) gunState(bedGun, { x: 0, y: 2.3, z: -1.6, ry: t.gunYaw || 0, pitch: t.gunPitch || 0, recoil: t.recoil, jit: t.gunJit });
  }
  guns.forEach((g, i) => gunState(g, S.guns && S.guns[i]));
  table.visible = !!S.table; if (S.table) { table.position.set(S.table[0], S.table[1] || 0, S.table[2]); table.rotation.y = S.table[3] || 0; table.position.y += S.tableJump || 0; }
  dynCrates.forEach((c, i) => { const d = S.crates && S.crates[i]; c.visible = !!d; if (d) { c.position.set(d[0], d[1] + 0.25, d[2]); c.rotation.set(d[4] || 0, d[3] || 0, d[5] || 0); } });
  updateCasings(S.pileFlow ?? null);
  waterU.t.value = f / 30;
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

window.renderFrame = (f) => {
  const S = shotAt(f), L = lightFor(S, f), C = camAt(f);
  applyLight(L);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const Wd = worldAt(f); worldState(Wd, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  updateHerd(herdAt(f));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  sky.position.copy(camera.position);
  for (const c of clouds) c.quaternion.copy(camera.quaternion);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = C.flash || 0; inkU.flashCol.value.set(C.flashCol || '#ffffff'); inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL; window.__dbg = { herd, hGeo, renderer, scene };
window.ready = true;
