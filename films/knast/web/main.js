// "Knast" short — renderer: four painted, inked sets (prison exterior/yard, cell + corridor, day street, courtroom)
// + 2D character cards + HUD (stamps / big text). Pipeline from cartoon-short-kit (colour -> normal/depth -> ink+grade -> lens).
import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { TOTAL, shotAt, camAt, dofAt, lightFor, actorsAt, worldAt, fxAt } from './story.js';

await document.fonts.load('900 100px Inter'); await document.fonts.load('900 100px "DejaVu Sans"');
const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- textures ----------
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const asphalt = (seed = 3) => { const [c, g] = cv(512, 512), r = P.rng(seed); g.fillStyle = '#5b5e66'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { g.fillStyle = hsl(220, 6, 30 + r() * 40, 0.5); g.fillRect(r() * 512, r() * 512, 2 + r() * 3, 2 + r() * 3); }
  for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(30,30,36,.5)'; g.lineWidth = 2; g.beginPath(); let x = r() * 512, y = r() * 512; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += r() * 60 - 30; y += r() * 60 - 30; g.lineTo(x, y); } g.stroke(); }
  return c; };
const gravel = (seed = 5) => { const [c, g] = cv(512, 512), r = P.rng(seed); g.fillStyle = '#8a8478'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3000; i++) { g.fillStyle = hsl(35, 8, 40 + r() * 35, 0.8); g.beginPath(); g.ellipse(r() * 512, r() * 512, 2 + r() * 4, 1.5 + r() * 3, r() * 3, 0, 7); g.fill(); }
  return c; };
const tiles = () => { const [c, g] = cv(256, 256); g.fillStyle = '#8f9693'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#5f6563'; g.lineWidth = 4;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); }
  const r = P.rng(4); for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(40,40,40,${r() * 0.15})`; g.fillRect(r() * 256, r() * 256, 6, 6); } return c; };
const cellWall = (hue = 200, sat = 10, lig = 70) => { const [c, g] = cv(512, 512), r = P.rng(hue); g.fillStyle = hsl(hue, sat, lig); g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) { g.fillStyle = hsl(hue, sat, lig - 6 - r() * 10, 0.35); g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 50, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
  g.fillStyle = hsl(hue, sat + 6, lig - 26); g.fillRect(0, 380, 512, 132); // painted dado
  g.fillStyle = hsl(hue, sat + 6, lig - 34); g.fillRect(0, 374, 512, 8);
  for (let i = 0; i < 30; i++) { g.strokeStyle = 'rgba(40,40,40,.25)'; g.lineWidth = 1.5; g.beginPath(); let x = r() * 512, y = r() * 380; g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += r() * 30 - 15; y += r() * 30; g.lineTo(x, y); } g.stroke(); }
  return c; };
const facade = (seed, base, rows = 4, cols = 3) => { const [c, g] = cv(512, 768), r = P.rng(seed); g.fillStyle = base; g.fillRect(0, 0, 512, 768);
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(0,0,0,.05)'; g.beginPath(); g.ellipse(r() * 512, r() * 768, 30 + r() * 60, 20 + r() * 40, 0, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.12)'; for (let k = 0; k < rows; k++) g.fillRect(0, 150 + k * 150, 512, 10);
  const ww = 512 / cols;
  for (let k = 0; k < rows; k++) for (let j = 0; j < cols; j++) {
    const x = j * ww + ww * 0.28, y = 40 + k * 150, w = ww * 0.44, h = 90;
    g.fillStyle = '#f4efe2'; g.fillRect(x - 8, y - 8, w + 16, h + 16);
    g.fillStyle = r() < 0.5 ? '#40536e' : '#55708f'; g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 6, y + 6, w * 0.3, h * 0.8);
    g.fillStyle = '#f4efe2'; g.fillRect(x + w / 2 - 3, y, 6, h); g.fillRect(x, y + h * 0.38, w, 6);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 10, y + h + 8, w + 20, 6);
  }
  // ground floor shop band + door
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 640, 512, 128);
  g.fillStyle = '#3b2c22'; g.fillRect(200, 650, 110, 118); g.fillStyle = '#5a4434'; g.fillRect(212, 662, 86, 106);
  g.fillStyle = '#3a4c63'; g.fillRect(30, 660, 140, 80); g.fillRect(342, 660, 140, 80);
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(40, 668, 40, 64); g.fillRect(352, 668, 40, 64);
  return c; };
const cellBlockTex = () => { const [c, g] = cv(1024, 256), r = P.rng(21); g.fillStyle = '#6f727a'; g.fillRect(0, 0, 1024, 256);
  for (let k = 0; k < 3; k++) for (let j = 0; j < 26; j++) { const x = 12 + j * 39, y = 30 + k * 72, lit = r() < 0.22;
    g.fillStyle = lit ? '#ffcf7a' : '#23262f'; g.fillRect(x, y, 18, 30); g.fillStyle = '#1a1c22'; for (let b = 1; b < 3; b++) g.fillRect(x + b * 6 - 1, y, 2, 30); }
  return c; };
const signJVA = () => { const [c, g] = cv(768, 256); g.fillStyle = '#1f3f7a'; g.beginPath(); g.roundRect(8, 8, 752, 240, 24); g.fill();
  g.strokeStyle = '#f2f4f8'; g.lineWidth = 10; g.beginPath(); g.roundRect(24, 24, 720, 208, 16); g.stroke();
  g.fillStyle = '#f7f8fb'; g.font = '900 170px Inter, "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('JVA', 384, 136); return c; };
const bookCover = () => { const [c, g] = cv(512, 720), r = P.rng(8); g.fillStyle = '#7a1e22'; g.fillRect(0, 0, 512, 720);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.12})`; g.fillRect(r() * 512, r() * 720, 3, 3); }
  g.strokeStyle = '#e2b955'; g.lineWidth = 8; g.strokeRect(26, 26, 460, 668); g.lineWidth = 3; g.strokeRect(42, 42, 428, 636);
  // small federal-style eagle emblem (no text)
  g.fillStyle = '#e2b955'; g.save(); g.translate(256, 440); g.scale(0.9, 0.9);
  g.beginPath(); g.ellipse(0, 0, 40, 60, 0, 0, 7); g.fill(); g.beginPath(); g.arc(0, -66, 22, 0, 7); g.fill();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 30, -30); for (let k = 0; k < 5; k++) { g.lineTo(s * (70 + k * 22), -50 + k * 22); g.lineTo(s * (60 + k * 18), -30 + k * 24); } g.lineTo(s * 30, 40); g.closePath(); g.fill(); }
  g.beginPath(); g.moveTo(-30, 50); g.lineTo(-50, 110); g.lineTo(-10, 70); g.lineTo(0, 115); g.lineTo(10, 70); g.lineTo(50, 110); g.lineTo(30, 50); g.fill(); g.restore();
  g.fillStyle = '#f0c95e'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = 80; g.font = `900 ${fs}px Inter, "DejaVu Sans", sans-serif`; while (g.measureText('STRAFGESETZBUCH').width > 430) { fs -= 2; g.font = `900 ${fs}px Inter, "DejaVu Sans", sans-serif`; }
  g.fillText('STRAFGESETZBUCH', 256, 170);
  g.fillRect(90, 232, 332, 5);
  return c; };
const pageTex = () => { const [c, g] = cv(256, 360); g.fillStyle = '#f6efdc'; g.fillRect(0, 0, 256, 360); g.fillStyle = 'rgba(80,60,40,.35)';
  for (let k = 0; k < 22; k++) { const w = 150 + ((k * 37) % 50); g.fillRect(40, 40 + k * 13, w, 4); } return c; }; // abstract lines, no readable text
const eagleTex = () => { const [c, g] = cv(512, 512); g.clearRect(0, 0, 512, 512); g.fillStyle = '#16131a'; g.save(); g.translate(256, 270);
  g.beginPath(); g.ellipse(0, 10, 58, 92, 0, 0, 7); g.fill(); g.beginPath(); g.arc(-8, -96, 34, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-36, -104); g.lineTo(-74, -92); g.lineTo(-40, -82); g.fill();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 40, -50); for (let k = 0; k < 6; k++) { g.lineTo(s * (110 + k * 26), -110 + k * 34); g.lineTo(s * (96 + k * 22), -78 + k * 34); } g.lineTo(s * 46, 70); g.closePath(); g.fill(); }
  g.beginPath(); g.moveTo(-50, 80); g.lineTo(-80, 170); g.lineTo(-20, 120); g.lineTo(0, 175); g.lineTo(20, 120); g.lineTo(80, 170); g.lineTo(50, 80); g.fill();
  for (const s of [-1, 1]) { g.fillRect(s * 30 - 6, 96, 12, 50); g.beginPath(); g.moveTo(s * 30 - 24, 150); g.lineTo(s * 30 + 24, 150); g.lineTo(s * 30, 168); g.fill(); }
  g.restore(); g.fillStyle = '#c92a2a'; g.beginPath(); g.moveTo(-74 + 256, -92 + 270); g.lineTo(-40 + 256, -82 + 270); g.lineTo(-44 + 256, -88 + 270); g.fill(); return c; };
const moonTex = () => { const [c, g] = cv(512, 512); const gr = g.createRadialGradient(256, 256, 60, 256, 256, 256); gr.addColorStop(0, 'rgba(220,235,255,.55)'); gr.addColorStop(0.42, 'rgba(180,205,255,.22)'); gr.addColorStop(1, 'rgba(160,190,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512); g.fillStyle = '#f6f3df'; g.beginPath(); g.arc(256, 256, 104, 0, 7); g.fill();
  const r = P.rng(7); for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(190,190,170,.55)'; g.beginPath(); g.arc(196 + r() * 120, 196 + r() * 120, 8 + r() * 20, 0, 7); g.fill(); }
  g.strokeStyle = '#241726'; g.lineWidth = 7; g.beginPath(); g.arc(256, 256, 104, 0, 7); g.stroke(); return c; };

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const M = {
  wallStone: texM(P.stone(14, 215, 8, 58, 128, 64), 1, 1), gateStone: texM(P.stone(15, 215, 5, 64, 96, 48), 1, 1),
  asphalt: texM(asphalt(), 30, 30), gravel: texM(gravel(), 30, 30), tiles: texM(tiles(), 1, 1),
  cellWall: texM(cellWall(), 1, 1), corrWall: texM(cellWall(40, 22, 72), 1, 1), plaster: texM(P.plaster(8), 1, 1),
  planks: texM(P.planks(1), 1, 1), panel: texM(P.planks(5), 1, 1, '#c98d5a'), deskWood: toon({ color: '#7a4a2a' }), deskDark: toon({ color: '#5a341e' }),
  iron: toon({ color: '#3d4148' }), ironL: toon({ color: '#6b7078' }), steelGate: toon({ color: '#3f5249' }), black: toon({ color: '#1a181c' }),
  roof: toon({ color: '#3a3d47' }), towerWood: toon({ color: '#5c5f66' }), cellBlock: texM(cellBlockTex(), 1, 1),
  mattress: toon({ color: '#6f86a6' }), pillow: toon({ color: '#e8e6dd' }), blanket: toon({ color: '#8a5a4a' }),
  curb: toon({ color: '#b7b4ab' }), walk: texM(tiles(), 1, 1, '#d8d2c4'), grass: texM(P.grass(6), 20, 20), bush: toon({ color: '#4f7f3a' }), trunk: toon({ color: '#6a4a32' }),
  white: toon({ color: '#f1f2f4' }), glass: toon({ color: '#2b3a52' }), tyre: toon({ color: '#1c1c20' }), chrome: toon({ color: '#c9ced6' }),
  polBlue: toon({ color: '#2f5fb8' }), carRed: toon({ color: '#c8322d' }), seat: toon({ color: '#3a2b26' }),
  leather: toon({ color: '#7a2a2a' }), chair: toon({ color: '#5b1f24' }), lampWarm: toon({ color: '#ffe6a8', emissive: '#ffcf6a', emissiveIntensity: 1 }),
  lampCold: toon({ color: '#eaf4ff', emissive: '#cfe6ff', emissiveIntensity: 1 }), green: toon({ color: '#2a4636' }), vase: toon({ color: '#3d7dc4' }), vaseBand: toon({ color: '#f1d27a' }),
  sky: new THREE.MeshBasicMaterial({ color: '#cfe8ff', fog: false }), brass: toon({ color: '#d9b44a' }), paper: toon({ color: '#f4efe2' }),
};
M.sign = toon({ map: P.tex(signJVA()) });
M.cover = toon({ map: P.tex(bookCover()) }); M.page = toon({ map: P.tex(pageTex()) });
M.eagle = new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(eagleTex()), transparent: true, alphaTest: 0.5 });
const tallyCanvas = cv(512, 512); const tallyTex = P.tex(tallyCanvas[0]);
M.tally = new THREE.MeshBasicMaterial({ map: tallyTex, transparent: true, depthWrite: false, color: '#c8ccd6' });
const lightRed = toon({ color: '#5a1a1a', emissive: '#ff2a2a', emissiveIntensity: 0 });
const lightBlue = [toon({ color: '#1d2f6a', emissive: '#3a7bff', emissiveIntensity: 0 }), toon({ color: '#1d2f6a', emissive: '#3a7bff', emissiveIntensity: 0 })];

// ---------- ink / normal-depth contract ----------
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
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};
const cyl = (r, h, n = 12) => new THREE.CylinderGeometry(r, r, h, n);
const plane = (w, h, mat, x, y, z, ry = 0, parent, rxx = 0) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false }); m.rotation.set(rxx, ry, 0); return m; };

// ---------- sky (gradient + stars) ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, stars: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor; uniform float stars; varying vec3 vP;
    float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      if (stars > 0.) { vec3 q = vP*220.; vec3 i = floor(q); float s = hash(i); vec3 f = fract(q)-.5; float d = length(f);
        c += stars * step(.985, s) * smoothstep(.22, .0, d) * smoothstep(.0,.25,vP.y) * vec3(.9,.95,1.); }
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);
const moon = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: P.tex(moonTex()), transparent: true, fog: false, depthWrite: false }));
moon.userData.ndSkip = true; moon.renderOrder = -1; scene.add(moon);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);
const spot = new THREE.SpotLight('#fff6d8', 0, 90, rx(7), 0.45, 0.6); scene.add(spot); scene.add(spot.target);
const pts = [0, 1, 2].map(() => { const l = new THREE.PointLight('#ffffff', 0, 30, 1.2); scene.add(l); return l; });

// =====================================================================================
// SET 1: prison exterior + yard (origin)
// =====================================================================================
const EXT = new THREE.Group(); scene.add(EXT);
{ const g = add(new THREE.PlaneGeometry(400, 200), M.asphalt, 0, 0, 100, EXT, { cast: false }); g.rotation.x = -Math.PI / 2; }
{ const g = add(new THREE.PlaneGeometry(400, 200), M.gravel, 0, 0, -100, EXT, { cast: false }); g.rotation.x = -Math.PI / 2; }
// outer wall
add(tbox(160, 6.5, 1.2, 2.2), M.wallStone, 0, 3.25, 0, EXT);
add(tbox(160, 0.3, 1.5, 2), M.ironL, 0, 6.65, 0, EXT);
// barbed wire: posts + coil along the outer edge of the top
for (let x = -60; x <= 60; x += 3) { const p = add(box(0.08, 0.9, 0.08), M.iron, x, 7.2, 0.45, EXT); p.rotation.x = 0.35; }
{ const pts_ = []; for (let i = 0; i <= 120 * 4 * 3; i++) { const t = i / 12, x = -60 + t * 0.25; pts_.push(new THREE.Vector3(x + 0.05 * Math.sin(t * 6.283), 7.25 + 0.32 * Math.sin(t * 6.283), 0.55 + 0.32 * Math.cos(t * 6.283))); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts_), pts_.length, 0.018, 4, false), M.ironL, 0, 0, 0, EXT, { cast: false }); }
// gatehouse with JVA sign
const GATE_X = 8;
add(tbox(9, 9, 2.8, 2.2), M.gateStone, GATE_X, 4.5, 0.2, EXT);
add(tbox(9.6, 0.5, 3.2, 2), M.ironL, GATE_X, 9.2, 0.2, EXT);
add(box(5.2, 5.4, 0.3), M.steelGate, GATE_X, 2.7, 1.55, EXT);
for (let i = -6; i <= 6; i++) add(box(0.08, 5.3, 0.1), M.iron, GATE_X + i * 0.4, 2.7, 1.72, EXT, { cast: false });
add(box(5.6, 0.25, 0.5), M.iron, GATE_X, 5.5, 1.6, EXT);
plane(3.6, 1.2, M.sign, GATE_X, 6.7, 1.62, 0, EXT);
add(box(0.6, 0.18, 0.4), M.iron, GATE_X, 7.65, 1.75, EXT); const gateLamp = add(box(0.4, 0.1, 0.25), M.lampCold, GATE_X, 7.54, 1.8, EXT, { cast: false });
// watchtower (inside the wall)
const TOWER = new THREE.Vector3(-10, 0, -3);
for (const [dx, dz] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) add(box(0.3, 9.2, 0.3), M.towerWood, TOWER.x + dx, 4.6, TOWER.z + dz, EXT);
add(tbox(3.4, 2.4, 3.4, 2), M.gateStone, TOWER.x, 10.3, TOWER.z, EXT);
for (const s of [-1, 1]) add(box(2.4, 0.9, 0.05), M.glass, TOWER.x, 10.5, TOWER.z + s * 1.72, EXT, { cast: false });
{ const r = add(new THREE.ConeGeometry(2.9, 1.4, 4), M.roof, TOWER.x, 12.2, TOWER.z, EXT); r.rotation.y = Math.PI / 4; }
const SEARCH = new THREE.Vector3(TOWER.x + 0.6, 11.0, TOWER.z + 1.9);
add(cyl(0.32, 0.6, 16), M.iron, SEARCH.x, SEARCH.y, SEARCH.z, EXT).rotation.x = Math.PI / 2;
const beamGeo = new THREE.CylinderGeometry(0.25, 4.2, 70, 24, 1, true); beamGeo.translate(0, -35, 0); beamGeo.rotateX(-Math.PI / 2);
const beamMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
  uniforms: { k: { value: 0.5 } },
  vertexShader: `varying float vA; varying vec3 vN; varying vec3 vV; void main(){ vA = uv.y; vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform float k; varying float vA; varying vec3 vN; varying vec3 vV; void main(){ float e = abs(dot(normalize(vN), normalize(vV))); float a = k * pow(vA, 1.6) * smoothstep(.0,.6,e); gl_FragColor = vec4(vec3(1.,.97,.85)*a, 1.); }` });
const beam = new THREE.Mesh(beamGeo, beamMat); beam.position.copy(SEARCH); beam.userData.ndSkip = true; beam.renderOrder = 3; EXT.add(beam);
// cell block inside the yard + a few roofs / lights
add(tbox(70, 12, 10, 3), M.cellBlock, -5, 6, -26, EXT).material = [M.gateStone, M.gateStone, M.roof, M.roof, M.cellBlock, M.cellBlock];
{ const cb = EXT.children[EXT.children.length - 1]; const uv = cb.geometry.attributes.uv; for (const f of [4, 5]) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) > 0 ? 1 : 0, uv.getY(i) > 0 ? 1 : 0); } }
add(tbox(30, 9, 8, 3), M.gateStone, 34, 4.5, -18, EXT);
for (const x of [-30, 30]) add(box(0.25, 7, 0.25), M.iron, x, 3.5, -8, EXT);
// outside: street lamps, bushes, distant houses with lit windows
for (const x of [-22, 2, 26]) { add(cyl(0.08, 6, 8), M.iron, x, 3, 6.5, EXT); add(box(0.9, 0.12, 0.3), M.lampWarm, x + 0.4, 6, 6.5, EXT, { cast: false }); }
{ const r = P.rng(11); for (let i = 0; i < 16; i++) { const b = add(new THREE.SphereGeometry(0.7 + r() * 0.6, 10, 8), M.bush, -40 + i * 5.3 + r() * 2, 0.4, 2.2 + r() * 0.6, EXT); b.scale.y = 0.7; } }

// =====================================================================================
// SET 2: cell + corridor (origin x=200)
// =====================================================================================
const CX = 200, CELL = new THREE.Group(); CELL.position.set(CX, 0, 0); scene.add(CELL);
const CH_ = 3.0, BACK = -3.6, CORR = 3.2;
{ const fl = add(new THREE.PlaneGeometry(30, 7), M.tiles, 0, 0, -0.2, CELL, { cast: false }); fl.rotation.x = -Math.PI / 2; fl.material = M.tiles.clone(); fl.material.map = M.tiles.map.clone(); fl.material.map.repeat.set(15, 3.5); fl.material.map.needsUpdate = true; }
add(box(30, 0.3, 7.6), M.cellWall, 0, CH_ + 0.15, -0.2, CELL); // ceiling
// back wall with a window hole (x 0.25..0.95, y 2.0..2.6)
const WIN = { x0: 0.25, x1: 0.95, y0: 1.95, y1: 2.6 };
add(tbox(30, WIN.y0, 0.4, 3), M.cellWall, 0, WIN.y0 / 2, BACK - 0.2, CELL);
add(tbox(30, CH_ - WIN.y1, 0.4, 3), M.cellWall, 0, (CH_ + WIN.y1) / 2, BACK - 0.2, CELL);
add(tbox(15 + WIN.x0, WIN.y1 - WIN.y0, 0.4, 3), M.cellWall, (WIN.x0 - 15) / 2, (WIN.y0 + WIN.y1) / 2, BACK - 0.2, CELL);
add(tbox(15 - WIN.x1, WIN.y1 - WIN.y0, 0.4, 3), M.cellWall, (15 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, BACK - 0.2, CELL);
for (let i = 1; i <= 3; i++) add(cyl(0.025, WIN.y1 - WIN.y0, 6), M.iron, WIN.x0 + i * (WIN.x1 - WIN.x0) / 4, (WIN.y0 + WIN.y1) / 2, BACK - 0.05, CELL);
add(tbox(30, CH_, 0.3, 3), M.corrWall, 0, CH_ / 2, CORR + 0.15, CELL); // corridor wall
for (const x of [-14.8, 14.8]) add(tbox(0.3, CH_, 7, 3), M.corrWall, x, CH_ / 2, -0.2, CELL);
// partitions and bar fronts
for (const x of [-10, -6, -2, 2, 6, 10]) add(tbox(0.3, CH_, 3.6, 2), M.cellWall, x, CH_ / 2, BACK / 2, CELL);
const barsFront = (x0, x1, skip) => { for (let x = x0 + 0.12; x < x1 - 0.05; x += 0.16) { if (skip && x > skip[0] && x < skip[1]) continue; add(cyl(0.028, CH_, 8), M.iron, x, CH_ / 2, 0, CELL); }
  for (const y of [0.15, 1.1, 2.85]) add(box(x1 - x0, 0.07, 0.07), M.iron, (x0 + x1) / 2, y, 0, CELL); };
for (const [a, b] of [[-14.6, -10], [-10, -6], [-6, -2], [2, 6], [6, 10], [10, 14.6]]) barsFront(a, b);
// our cell front: fixed bars x -2..0.35, door 0.35..1.55 (hinge at 1.55), fixed 1.55..2
const DOOR0 = 0.35, DOOR1 = 1.55;
for (let x = -1.88; x < DOOR0; x += 0.16) { if (Math.abs(x - 0.04) < 0.01) { add(cyl(0.028, 0.8, 8), M.iron, x, 0.4, 0, CELL); add(cyl(0.028, CH_ - 1.7, 8), M.iron, x, (CH_ + 1.7) / 2, 0, CELL); continue; } add(cyl(0.028, CH_, 8), M.iron, x, CH_ / 2, 0, CELL); }
for (let x = DOOR1 + 0.12; x < 2; x += 0.16) add(cyl(0.028, CH_, 8), M.iron, x, CH_ / 2, 0, CELL);
for (const y of [0.15, 2.85]) { add(box(2.35, 0.07, 0.07), M.iron, (-2 + DOOR0) / 2, y, 0, CELL); add(box(0.45, 0.07, 0.07), M.iron, (DOOR1 + 2) / 2, y, 0, CELL); }
const door = new THREE.Group(); door.position.set(DOOR1, 0, 0); CELL.add(door);
const doorBars = [];
for (let i = 0; i < 7; i++) doorBars.push(add(cyl(0.03, 2.6, 8), M.iron, -0.1 - i * 0.165, 1.4, 0, door));
for (const y of [0.15, 1.1, 2.65]) add(box(1.2, 0.08, 0.08), M.iron, -0.6, y, 0, door);
const lockBox = add(box(0.2, 0.28, 0.14), M.ironL, -1.08, 1.1, 0.04, door); add(cyl(0.022, 0.03, 10), M.black, -1.08, 1.08, 0.115, door).rotation.x = Math.PI / 2;
// the sawn bar piece (fixed bar left of the door)
const sawBar = add(cyl(0.028, 0.9, 8), M.iron, 0.04, 1.25, 0.0, CELL); sawBar.visible = true;
// bunk bed
const bunk = new THREE.Group(); bunk.position.set(-1.45, 0, -2.5); CELL.add(bunk);
for (const [dx, dz] of [[-0.4, -1], [0.4, -1], [-0.4, 1], [0.4, 1]]) add(box(0.07, 2.1, 0.07), M.iron, dx, 1.05, dz, bunk);
for (const y of [0.32, 1.48]) { add(box(0.85, 0.06, 2.05), M.iron, 0, y, 0, bunk); add(box(0.78, 0.14, 1.95), M.mattress, 0, y + 0.1, 0, bunk); add(box(0.6, 0.1, 0.32), M.pillow, 0, y + 0.22, -0.78, bunk); add(box(0.8, 0.05, 1.0), M.blanket, 0, y + 0.19, 0.45, bunk); }
// table, stool, toilet, wall shelf
add(box(0.7, 0.05, 0.5), M.deskWood, 1.5, 0.75, -2.9, CELL); for (const [dx, dz] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) add(box(0.04, 0.75, 0.04), M.iron, 1.5 + dx, 0.375, -2.9 + dz, CELL);
add(cyl(0.18, 0.45, 12), M.iron, 1.2, 0.225, -2.2, CELL);
add(cyl(0.2, 0.4, 14), M.white, 1.65, 0.2, -1.2, CELL);
// tally marks on the back wall
const tallyPlane = plane(1.25, 1.25, M.tally, 0.2, 1.2, BACK + 0.01, 0, CELL); tallyPlane.userData.ndSkip = true;
// corridor lamp(s)
for (const x of [-8, 0, 8]) add(box(1.2, 0.08, 0.22), M.lampCold, x, CH_ - 0.04, 1.6, CELL, { cast: false });
// hook + guard cap on the corridor wall, vase on a stand
const capProp = new THREE.Group(); capProp.position.set(5.2, 1.78, 2.65); CELL.add(capProp);
add(cyl(0.035, 1.78, 8), M.deskDark, 0, -0.89, 0, CELL.children[CELL.children.length - 1]); add(cyl(0.22, 0.04, 12), M.deskDark, 0, -1.76, 0, capProp); for (const a of [0.6, 2.2, 3.8, 5.4]) { const h = add(box(0.03, 0.03, 0.16), M.brass, Math.cos(a) * 0.06, -0.02, Math.sin(a) * 0.06, capProp); h.rotation.y = -a; }
{ const c1 = add(new THREE.CylinderGeometry(0.2, 0.15, 0.13, 20), M.green, 0, 0.12, 0, capProp); const c2 = add(new THREE.CylinderGeometry(0.155, 0.155, 0.06, 20), M.black, 0, 0.04, 0, capProp);
  const vis = add(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 20, 1, false, 0, Math.PI), M.black, 0, 0.01, 0.06, capProp); vis.scale.set(1, 1, 0.8); vis.rotation.y = Math.PI / 2; capProp.rotation.x = 0.0; }
const vaseG = new THREE.Group(); vaseG.position.set(5.2, 0, 0.85); CELL.add(vaseG);
add(cyl(0.16, 1.0, 12), M.deskWood, 0, 0.5, 0, vaseG); add(box(0.42, 0.05, 0.42), M.deskDark, 0, 1.02, 0, vaseG);
{ const prof = [[0.0, 0], [0.11, 0], [0.16, 0.08], [0.17, 0.2], [0.12, 0.33], [0.07, 0.4], [0.09, 0.46]].map(([x, y]) => new THREE.Vector2(x, y));
  add(new THREE.LatheGeometry(prof, 20), M.vase, 0, 1.045, 0, vaseG); add(new THREE.TorusGeometry(0.165, 0.012, 6, 24), M.vaseBand, 0, 1.24, 0, vaseG).rotation.x = Math.PI / 2; }
// corridor gate (meuterei) at x=-8
const cgate = new THREE.Group(); cgate.position.set(-8, 0, 0.05); CELL.add(cgate);
for (let z = 0.15; z < CORR - 0.05; z += 0.17) add(cyl(0.032, CH_ - 0.1, 8), M.iron, 0, (CH_ - 0.1) / 2, z, cgate);
for (const y of [0.2, 1.2, 2.6]) add(box(0.08, 0.08, CORR - 0.1), M.iron, 0, y, CORR / 2, cgate);
add(box(0.2, 0.3, 0.18), M.ironL, 0, 1.15, CORR - 0.4, cgate);

// =====================================================================================
// SET 3: day street (origin x=400)
// =====================================================================================
const SX = 400, STREET = new THREE.Group(); STREET.position.set(SX, 0, 0); scene.add(STREET);
{ const g = add(new THREE.PlaneGeometry(200, 8), M.asphalt, 0, 0, 0, STREET, { cast: false }); g.rotation.x = -Math.PI / 2; }
for (const z of [-4, 4]) for (let x = -60; x < 60; x += 3) add(box(1.2, 0.02, 0.12), M.white, x, 0.01, 0, STREET, { cast: false });
for (const s of [-1, 1]) { add(box(200, 0.15, 3.5), M.walk, 0, 0.075, s * 5.75, STREET); add(box(200, 0.17, 0.2), M.curb, 0, 0.085, s * 4.05, STREET); }
{ const r = P.rng(31), cols = ['#efd9a8', '#e8b8a8', '#bcd2e6', '#d9e3c0', '#f0e6d6', '#e6c48a'];
  let x = -50; let i = 0; while (x < 50) { const w = 7 + r() * 4, h = 11 + r() * 5;
    const m = toon({ map: P.tex(facade(40 + i, cols[i % cols.length], 4, 3)) });
    const b = add(box(w, h, 6), [M.plaster, M.plaster, M.roof, M.roof, m, m], x + w / 2, h / 2, -10.5, STREET);
    add(box(w + 0.3, 0.4, 6.6), M.roof, x + w / 2, h + 0.2, -10.5, STREET); x += w; i++; } }
for (const x of [-18, -6, 6, 18]) { add(cyl(0.12, 3.2, 8), M.trunk, x, 1.6, -5.4, STREET); const c = add(new THREE.SphereGeometry(1.4, 12, 10), M.bush, x, 3.8, -5.4, STREET); c.scale.set(1, 0.9, 1); }
const makeCar = (kind) => {
  const g = new THREE.Group(); const body = kind === 'police' ? M.white : M.carRed;
  add(box(4.4, 0.7, 1.85), body, 0, 0.7, 0, g);
  add(box(4.5, 0.18, 1.9), M.black, 0, 0.42, 0, g);
  for (const [x, z] of [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]]) { const w = add(cyl(0.36, 0.26, 16), M.tyre, x, 0.36, z, g); w.rotation.x = Math.PI / 2; const h = add(cyl(0.18, 0.28, 12), M.chrome, x, 0.36, z, g); h.rotation.x = Math.PI / 2; }
  for (const s of [-1, 1]) { add(box(0.06, 0.16, 0.4), M.lampWarm, 2.21, 0.82, s * 0.6, g, { cast: false }); add(box(0.06, 0.14, 0.36), lightRed, -2.21, 0.82, s * 0.62, g, { cast: false }); }
  if (kind === 'police') {
    add(box(4.42, 0.2, 1.87), M.polBlue, 0, 0.78, 0, g);
    add(box(2.3, 0.62, 1.7), M.glass, -0.2, 1.36, 0, g); add(box(2.4, 0.08, 1.76), M.white, -0.2, 1.7, 0, g);
    add(box(0.5, 0.1, 1.2), M.black, -0.2, 1.78, 0, g); for (let i = 0; i < 2; i++) add(box(0.4, 0.14, 0.45), lightBlue[i], -0.2, 1.86, (i ? 1 : -1) * 0.32, g, { cast: false });
  } else {
    add(box(0.06, 0.45, 1.6), M.glass, 0.75, 1.27, 0, g).rotation.z = 0.35; add(box(0.1, 0.06, 1.7), M.chrome, 0.68, 1.5, 0, g);
    add(box(2.1, 0.06, 1.6), M.seat, -0.4, 0.98, 0, g); add(box(0.2, 0.6, 1.5), M.seat, -0.9, 1.25, 0, g); add(box(0.2, 0.5, 1.5), M.seat, -1.6, 1.2, 0, g);
    const wheel = add(new THREE.TorusGeometry(0.18, 0.03, 6, 16), M.black, 0.35, 1.25, -0.4, g); wheel.rotation.y = Math.PI / 2; wheel.rotation.x = 0.4;
  }
  STREET.add(g); return g; };
const policeCar = makeCar('police'), getaway = makeCar('getaway');

// =====================================================================================
// SET 4: courtroom (origin x=600)
// =====================================================================================
const KX = 600, COURT = new THREE.Group(); COURT.position.set(KX, 0, 0); scene.add(COURT);
const KB = -5.2;
{ const fl = add(new THREE.PlaneGeometry(14, 14), M.planks, 0, 0, 0, COURT, { cast: false }); fl.rotation.x = -Math.PI / 2; fl.material = M.planks.clone(); fl.material.map = M.planks.map.clone(); fl.material.map.repeat.set(3, 3); fl.material.map.needsUpdate = true; }
add(box(14, 0.2, 14), M.plaster, 0, 6.6, 0, COURT);
add(tbox(14, 6.5, 0.3, 3), M.plaster, 0, 3.25, KB - 0.15, COURT);
add(tbox(14, 2.4, 0.1, 1.2), M.panel, 0, 1.2, KB + 0.05, COURT);
add(tbox(0.3, 6.5, 14, 3), M.plaster, 7, 3.25, 0, COURT);
// left wall with a window (z -1.2..1.2, y 1.3..4.4)
const KW = { z0: -1.2, z1: 1.2, y0: 1.3, y1: 4.4 };
add(tbox(0.3, KW.y0, 14, 3), M.plaster, -7, KW.y0 / 2, 0, COURT); add(tbox(0.3, 6.5 - KW.y1, 14, 3), M.plaster, -7, (6.5 + KW.y1) / 2, 0, COURT);
add(tbox(0.3, KW.y1 - KW.y0, 7 + KW.z0, 3), M.plaster, -7, (KW.y0 + KW.y1) / 2, (KW.z0 - 7) / 2, COURT); add(tbox(0.3, KW.y1 - KW.y0, 7 - KW.z1, 3), M.plaster, -7, (KW.y0 + KW.y1) / 2, (7 + KW.z1) / 2, COURT);
add(tbox(0.12, 2.4, 14, 1.2), M.panel, -6.84, 1.2, 0, COURT).visible = true;
add(box(0.6, 0.1, 2.7), M.deskWood, -6.75, KW.y0, 0, COURT); // sill
for (const z of [-0.4, 0.4]) add(box(0.08, KW.y1 - KW.y0, 0.08), M.deskDark, -7.05, (KW.y0 + KW.y1) / 2, z, COURT);
add(box(0.08, 0.08, 2.4), M.deskDark, -7.05, 3.2, 0, COURT);
// outside the window: bright sky + far trees
plane(40, 30, M.sky, -16, 4, 0, Math.PI / 2, COURT).userData.ndSkip = true;
for (let i = 0; i < 5; i++) { const t = add(new THREE.SphereGeometry(1.8, 10, 8), M.bush, -11, 1.5 + (i % 2), -4 + i * 2, COURT, { cast: false }); }
// bench (Richtertisch)
add(box(7, 0.45, 3), M.deskDark, 0, 0.225, KB + 1.5, COURT);
add(tbox(6.4, 1.05, 0.3, 1.2), M.panel, 0, 0.45 + 0.525, KB + 2.85, COURT);
add(box(6.6, 0.1, 1.1), M.deskWood, 0, 1.55, KB + 2.5, COURT); add(box(6.4, 0.35, 1.6), M.deskDark, 0, 0.62, KB + 1.6, COURT);
for (const x of [-3, 3]) add(box(0.3, 1.1, 0.35), M.deskDark, x, 1.0, KB + 2.95, COURT);
const chairB = add(box(1.0, 2.2, 0.25), M.chair, 0, 1.55, KB + 0.6, COURT);
plane(2.6, 2.6, M.eagle, 0, 4.4, KB + 0.02, 0, COURT);
// defendant table + prosecution table
for (const x of [-2.4, 3.4]) { add(box(2.2, 0.08, 1.0), M.deskWood, x, 0.85, 1.4, COURT); add(box(2.2, 0.75, 0.06), M.deskDark, x, 0.45, 1.88, COURT); for (const s of [-1, 1]) add(box(0.08, 0.85, 0.9), M.deskDark, x + s * 1.05, 0.42, 1.4, COURT); }
// birdcage on the window sill
const cage = new THREE.Group(); cage.position.set(-6.65, KW.y0 + 0.05, 0.5); COURT.add(cage);
add(cyl(0.22, 0.04, 16), M.brass, 0, 0.02, 0, cage); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; if (i === 3 || i === 4) continue; add(cyl(0.008, 0.5, 4), M.brass, Math.cos(a) * 0.2, 0.27, Math.sin(a) * 0.2, cage, { cast: false }); }
add(new THREE.SphereGeometry(0.21, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.brass, 0, 0.5, 0, cage); add(new THREE.TorusGeometry(0.05, 0.01, 6, 12), M.brass, 0, 0.74, 0, cage);
// book on the bench
const book = new THREE.Group(); book.position.set(0.9, 1.6, KB + 2.45); book.rotation.y = 0; COURT.add(book);
add(box(0.5, 0.03, 0.7), M.cover, 0, 0.015, 0, book);
const pages = add(box(0.47, 0.09, 0.67), M.paper, 0.0, 0.075, 0, book);
const coverPivot = new THREE.Group(); coverPivot.position.set(-0.25, 0.135, 0); book.add(coverPivot);
const coverMesh = add(box(0.5, 0.025, 0.7), [M.leather, M.leather, M.cover, M.page, M.leather, M.leather], 0.25, 0, 0, coverPivot);
{ const uv = coverMesh.geometry.attributes.uv; }
add(box(0.03, 0.15, 0.7), M.leather, -0.25, 0.075, 0, book);
const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: P.tex(P.radial('255,226,140', 0.9)), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
glow.userData.ndSkip = true; glow.renderOrder = 4; COURT.add(glow);

const SETS = { ext: EXT, cell: CELL, street: STREET, court: COURT };

// ---------- cards ----------
const CW = 1200, CHp = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
class Card {
  constructor() {
    [this.c, this.g] = cv(CW, CHp);
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
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CHp); g.setTransform(CW / 600, 0, 0, CHp / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- HUD (stamps, big text) ----------
const [hudC, hudG] = cv(W, H); const hudTex = new THREE.CanvasTexture(hudC); hudTex.colorSpace = THREE.SRGBColorSpace;
const hudScene = new THREE.Scene(); const hudMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: hudTex, transparent: true, depthTest: false, depthWrite: false })); hudScene.add(hudMesh);
const FONT = (px) => `900 ${px}px Inter, "DejaVu Sans", sans-serif`;
const SAFE_CX = 465, SAFE_CY = 820; // centre of the area that stays clear of the Shorts UI (bottom 300 px, right 150 px)
function drawStamp(g, text, t, rot = -0.14, cx = SAFE_CX, cy = SAFE_CY) {
  if (t < 0) return;
  const a = t < 0.16 ? (t / 0.16) * 0.85 : t > 0.92 ? Math.max(0, 1 - (t - 0.92) / 0.08) * 0.95 : 0.95;
  let px = 150; g.font = FONT(px); while (g.measureText(text).width > 740 && px > 40) { px -= 2; g.font = FONT(px); }
  const tw = g.measureText(text).width, bw = tw + px * 0.7, bh = px * 1.45;
  const k0 = Math.min(1.45, 1000 / bw), k = t < 0.16 ? k0 - (k0 - 1) * (t / 0.16) ** 2 : 1 + 0.06 * Math.exp(-(t - 0.16) * 18) * Math.sin((t - 0.16) * 60);
  g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(k, k); g.globalAlpha = a;
  const red = '#d81f26';
  g.strokeStyle = red; g.lineWidth = px * 0.11; g.beginPath(); g.roundRect(-bw / 2, -bh / 2, bw, bh, px * 0.16); g.stroke();
  g.lineWidth = px * 0.035; g.beginPath(); g.roundRect(-bw / 2 + px * 0.13, -bh / 2 + px * 0.13, bw - px * 0.26, bh - px * 0.26, px * 0.1); g.stroke();
  g.fillStyle = red; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, px * 0.04);
  // worn ink: knock out speckles (deterministic)
  g.globalCompositeOperation = 'destination-out'; const r = P.rng(text.length * 7 + 3);
  for (let i = 0; i < 160; i++) { g.globalAlpha = 0.35 + r() * 0.5; g.beginPath(); g.ellipse((r() - 0.5) * bw, (r() - 0.5) * bh, 2 + r() * 7, 1 + r() * 4, r() * 3, 0, 7); g.fill(); }
  g.restore(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
}
function drawBigText(g, text, t, cx = SAFE_CX, cy = 560) {
  if (t < 0) return;
  const k = t < 0.2 ? 0.3 + 0.82 * Math.sin((t / 0.2) * Math.PI / 2) : 1.0 + 0.12 * Math.exp(-(t - 0.2) * 9) * Math.cos((t - 0.2) * 30);
  const a = t > 0.9 ? Math.max(0, 1 - (t - 0.9) / 0.1) : 1;
  let px = 260; g.font = FONT(px); while (g.measureText(text).width > 640) { px -= 4; g.font = FONT(px); }
  g.save(); g.translate(cx, cy); g.rotate(-0.06); g.scale(k, k); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillText(text, 10, 16);
  g.lineWidth = px * 0.16; g.strokeStyle = '#241726'; g.strokeText(text, 0, 0);
  const gr = g.createLinearGradient(0, -px / 2, 0, px / 2); gr.addColorStop(0, '#fff6a8'); gr.addColorStop(0.55, '#ffd23a'); gr.addColorStop(1, '#ff9e1f');
  g.fillStyle = gr; g.fillText(text, 0, 0);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.save(); g.beginPath(); g.rect(-600, -px * 0.5, 1200, px * 0.22); g.clip(); g.fillText(text, 0, 0); g.restore();
  g.restore(); g.globalAlpha = 1;
}
let hudKey = '';
function drawHud(list, shake) {
  const key = JSON.stringify(list) + shake.join(',');
  if (key === hudKey) return list.length > 0; hudKey = key;
  hudG.setTransform(1, 0, 0, 1, 0, 0); hudG.clearRect(0, 0, W, H);
  if (!list.length) { hudTex.needsUpdate = true; return false; }
  hudG.setTransform(1, 0, 0, 1, shake[0], shake[1]);
  for (const h of list) { if (h.type === 'stamp') drawStamp(hudG, h.text, h.t, h.rot); if (h.type === 'big') drawBigText(hudG, h.text, h.t); }
  hudTex.needsUpdate = true; return true;
}

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 }, flashCol: { value: new THREE.Color(1, 1, 1) } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 lift, gain, flashCol; varying vec2 vUv;
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
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
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
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.stars.value = L.stars || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  sun.position.copy(focus).addScaledVector(tmpV, 80); sun.target.position.copy(focus);
  const ext = L.shadowExt || 30, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 200; sc.updateProjectionMatrix();
}
let tallyKey = '';
function worldState(S, f) {
  for (const [k, g] of Object.entries(SETS)) g.visible = S.set === k;
  // moon
  moon.visible = !!S.moon;
  if (S.moon) { tmpV.set(...S.moon.dir).normalize(); moon.position.copy(camera.position).addScaledVector(tmpV, 900); moon.quaternion.copy(camera.quaternion); moon.scale.setScalar(S.moon.size || 120); }
  // searchlight
  beam.visible = !!S.search; spot.intensity = 0;
  if (S.search) { const tg = new THREE.Vector3(...S.search.target); beam.lookAt(tg); beamMat.uniforms.k.value = S.search.k ?? 0.35;
    spot.position.copy(SEARCH); spot.target.position.copy(tg); spot.intensity = S.search.i ?? 900; spot.distance = 0; spot.decay = 1.2; spot.angle = rx(6.5); }
  gateLamp.visible = true;
  // point lights: [{pos, col, i, d}]
  pts.forEach((l, i) => { const p = (S.points || [])[i]; if (!p) { l.intensity = 0; return; } l.position.set(...p.pos); l.color.set(p.col); l.intensity = p.i; l.distance = p.d || 30; });
  // cell door, bars, tally
  door.rotation.y = S.door || 0;
  { const sb = S.sawBar || {}; sawBar.visible = sb.gone !== true; sawBar.position.set(0.04 + (sb.dx || 0), 1.25 - (sb.dy || 0), (sb.dz || 0)); sawBar.rotation.z = sb.rz || 0; }
  const tk = JSON.stringify(S.tally || [24, 0, 1]);
  if (tk !== tallyKey) { tallyKey = tk; const [n, e, k] = S.tally || [24, 0, 1]; const g = tallyCanvas[1]; g.clearRect(0, 0, 512, 512); T.tallyMarks(g, n, e, k); tallyTex.needsUpdate = true; }
  cgate.rotation.y = S.gate || 0; cgate.position.x = -8 + (S.gateShake || 0);
  capProp.visible = S.capProp !== false;
  // cars
  policeCar.visible = !!S.police; if (S.police) { policeCar.position.set(S.police.x, 0, S.police.z); policeCar.rotation.y = S.police.ry || 0; policeCar.position.y = S.police.bounce || 0; }
  getaway.visible = !!S.getaway; if (S.getaway) { getaway.position.set(S.getaway.x, S.getaway.bounce || 0, S.getaway.z); getaway.rotation.y = S.getaway.ry || 0; }
  lightBlue.forEach((m, i) => { m.emissiveIntensity = S.blue ? (Math.sin(f * 1.3 + i * Math.PI) > 0 ? 2.2 : 0.1) : 0; });
  lightRed.emissiveIntensity = S.brake ? 1.5 : 0.2;
  // book
  coverPivot.rotation.z = (S.bookOpen || 0) * Math.PI * 0.97;
  glow.visible = (S.glow || 0) > 0.01; if (glow.visible) { glow.position.set(0.9, 1.75, KB + 2.45); glow.quaternion.copy(camera.quaternion); glow.scale.setScalar(1.6 * S.glow); glow.material.opacity = S.glow; }
}
function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    const gy = a.ground ?? 0;
    if (a.blob !== false && a.y - gy < 1.2) { c.blob.visible = true; const k = Math.max(0.3, 1 - (a.y - gy) * 0.5); c.blob.position.set(a.x, gy + 0.02, a.z); c.blob.scale.set(0.95 * s * k, 0.6 * s * k, 1); c.blob.material.opacity = k; }
  });
}
const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip) { o.userData.vis0 = o.visible; o.visible = false; return; }
      if (o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
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
  const W_ = worldAt(f); worldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  sky.position.copy(camera.position);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = C.flash || 0; inkU.flashCol.value.set(C.flashCol || '#ffffff'); inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  if (drawHud(W_.hud || [], W_.shake || [0, 0])) { renderer.autoClear = false; renderer.render(hudScene, fsCam); renderer.autoClear = true; }
  return true;
};
window.TOTAL = TOTAL;
document.fonts.load(FONT(100)).then(() => document.fonts.ready).then(() => { window.ready = true; });
