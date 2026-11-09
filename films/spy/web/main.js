// "Der Mann, der nie existierte" — world, sets and renderer (three.js in headless Chromium).
// Every set is its own group; story.js picks the set, camera, light and the dynamic object transforms per frame.
// NO text anywhere: all textures are drawn here with lines, shapes and noise only.
import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import * as ST from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.03, 2500);
const rx = (a) => a * Math.PI / 180;

// ---------- painted textures (no letters) ----------
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const noiseFill = (g, w, h, seed, base, cols, n = 900, r0 = 1, r1 = 4) => { const r = P.rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath(); g.ellipse(r() * w, r() * h, r0 + r() * r1, r0 + r() * r1 * 0.7, r() * 3, 0, 7); g.fill(); } };
const tileTex = () => { const [c, g] = cv(512, 512); g.fillStyle = '#9fb2bf'; g.fillRect(0, 0, 512, 512); const r = P.rng(5);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const l = 88 + r() * 6; g.fillStyle = `hsl(205,22%,${l}%)`; g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x * 64 + 6, y * 64 + 6, 22, 4); } return c; };
const sandTex = (seed = 3, base = '#e3c998') => { const [c, g] = cv(512, 512); noiseFill(g, 512, 512, seed, base, ['#d8bb86', '#ecd6a8', '#cfb07a', '#f1dfb8'], 2600, 0.6, 2.2); return c; };
const leatherTex = () => { const [c, g] = cv(256, 256); noiseFill(g, 256, 256, 8, '#7e4a2a', ['#6e3e22', '#8a5634', '#5e3420'], 1400, 0.5, 2); g.strokeStyle = '#4a2a16'; g.setLineDash([6, 5]); g.lineWidth = 2; g.strokeRect(10, 10, 236, 236); return c; };
const corkTex = () => { const [c, g] = cv(256, 256); noiseFill(g, 256, 256, 12, '#b88a58', ['#a87a4a', '#c99a68', '#946a3c'], 2400, 0.5, 1.6); return c; };
const curtainTex = (col = [92, 34, 30]) => { const [c, g] = cv(512, 64); for (let x = 0; x < 512; x++) { const k = 0.62 + 0.38 * Math.pow(Math.abs(Math.sin(x / 512 * Math.PI * 10)), 0.7); g.fillStyle = `rgb(${col[0] * k | 0},${col[1] * k | 0},${col[2] * k | 0})`; g.fillRect(x, 0, 1, 64); } return c; };
const grassTex = (seed = 6, h = 95, s = 32, l = 40) => { const [c, g] = cv(512, 512); const r = P.rng(seed); g.fillStyle = `hsl(${h},${s}%,${l}%)`; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { const x = r() * 512, y = r() * 512; g.strokeStyle = `hsla(${h + r() * 16 - 8},${s + 6}%,${l - 10 + r() * 22}%,.8)`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 6 - r() * 6); g.stroke(); } return c; };
const panelTex = () => { const c = P.planks(21); return c; };
const lineSheetTex = () => { const [c, g] = cv(256, 320); g.fillStyle = '#f2eee4'; g.fillRect(0, 0, 256, 320); g.strokeStyle = '#9a968e'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); for (let x = 0; x <= 200; x += 5) g.lineTo(28 + x, 40 + i * 28 + Math.sin(x * 0.2 + i) * 2); g.stroke(); } return c; };
/** sea chart: islands, coasts, faint grid, wave hatching. enemy = olive-tinted copy. NO labels, NO numbers. */
const mapTex = (enemy = false) => {
  const [c, g] = cv(1024, 640), r = P.rng(enemy ? 77 : 77);
  const sea = enemy ? '#a9ae8c' : '#a8bfcb', sea2 = enemy ? '#979c78' : '#93adbb', land = enemy ? '#c9b98a' : '#e1d2a8', land2 = enemy ? '#b3a171' : '#cdb98a', ink = enemy ? '#4a4a32' : '#3e4c5c';
  g.fillStyle = sea; g.fillRect(0, 0, 1024, 640);
  g.strokeStyle = sea2; g.lineWidth = 2; for (let i = 0; i < 160; i++) { const x = r() * 1024, y = r() * 640; g.beginPath(); g.arc(x, y, 8, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  g.strokeStyle = 'rgba(60,70,80,.18)'; g.lineWidth = 1.5; for (let x = 64; x < 1024; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 640); g.stroke(); } for (let y = 64; y < 640; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  const blob = (cx, cy, rx, ry, seed, n = 40) => { const q = P.rng(seed), pts = []; const ph = [q() * 6, q() * 6, q() * 6]; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + 0.18 * Math.sin(a * 3 + ph[0]) + 0.1 * Math.sin(a * 5 + ph[1]) + 0.06 * Math.sin(a * 9 + ph[2]); pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return pts; };
  const fillPts = (pts, fill, stroke, lw = 4) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); };
  // coasts at the edges
  fillPts([[0, 0], [300, 0], [260, 60], [180, 90], [120, 160], [60, 190], [0, 230]], land, ink);
  fillPts([[1024, 0], [760, 0], [800, 50], [880, 70], [930, 130], [1024, 150]], land, ink);
  fillPts([[0, 640], [0, 470], [70, 500], [150, 560], [240, 600], [330, 640]], land, ink);
  fillPts([[1024, 640], [1024, 420], [950, 470], [900, 560], [820, 640]], land, ink);
  // the big island in the middle + small islands
  const big = blob(512, 330, 150, 110, 5, 60); fillPts(big, land, ink, 5);
  for (const k of [0.7, 0.45]) { g.strokeStyle = land2; g.lineWidth = 3; g.beginPath(); big.forEach(([x, y], i) => { const X = 512 + (x - 512) * k, Y = 330 + (y - 330) * k; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.stroke(); }
  [[300, 250, 30, 22], [700, 200, 26, 18], [740, 470, 34, 22], [330, 470, 22, 16], [620, 120, 18, 12], [420, 560, 20, 14]].forEach(([x, y, a, b], i) => fillPts(blob(x, y, a, b, 20 + i, 24), land, ink, 3));
  // compass rose without letters
  g.save(); g.translate(900, 300); g.fillStyle = ink; for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, -46); g.lineTo(8, 0); g.lineTo(-8, 0); g.fill(); } g.beginPath(); g.arc(0, 0, 26, 0, 7); g.strokeStyle = ink; g.lineWidth = 2; g.stroke(); g.restore();
  g.strokeStyle = 'rgba(40,30,20,.5)'; g.lineWidth = 10; g.strokeRect(5, 5, 1014, 630);
  return c;
};

const foamRingTex = () => { const [c, g] = cv(512, 256); const r = P.rng(41);
  for (let i = 0; i < 900; i++) { const a = r() * Math.PI * 2, k = 0.62 + r() * 0.38, x = 256 + Math.cos(a) * 240 * k, y = 128 + Math.sin(a) * 112 * k, rr = 4 + r() * 14;
    const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  return c; };
const wakeTex = () => { const [c, g] = cv(256, 512); const r = P.rng(43);
  for (let i = 0; i < 700; i++) { const t = r(), side = r() < 0.5 ? -1 : 1, spread = 20 + t * 110, x = 128 + side * spread * (0.85 + r() * 0.3) * (r() < 0.25 ? r() : 1), y = 20 + t * 480, rr = 3 + r() * 9 * (0.4 + t);
    const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(255,255,255,${0.6 * (1 - t)})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  return c; };

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const M = {
  plank: texM(P.planks(1), 2, 2), deskWood: texM(P.planks(3), 1, 1, '#d8b088'), panel: texM(panelTex(), 3, 1, '#8a6a52'),
  stone: texM(P.stone(4), 2, 1, '#b8b0a4'), stoneDark: texM(P.stone(14), 2, 1, '#8a8478'),
  tiles: texM(tileTex(), 4, 2), tilesFloor: texM(tileTex(), 4, 4, '#c8d2da'),
  sand: texM(sandTex(), 30, 10), sandWet: toon({ color: '#b8996a' }),
  grass: texM(grassTex(), 12, 12), grassHill: texM(grassTex(9, 88, 34, 42), 10, 10), field: texM(grassTex(11, 62, 26, 46), 30, 30), dirt: texM(P.dirt(7), 2, 20),
  greenWall: texM(P.plaster(8), 2, 1, '#6f8a64'), wainscot: texM(P.planks(5), 3, 1, '#5a4030'),
  curtain: toon({ map: P.tex(curtainTex(), 1, 1), color: '#ffffff' }),
  leather: texM(leatherTex(), 1, 1), lining: toon({ color: '#5e2e1e' }), brass: toon({ color: '#d9b55a' }), cork: texM(corkTex(), 2, 1),
  wood: toon({ color: '#7a5434' }), woodDark: toon({ color: '#4e3424' }), woodLight: toon({ color: '#a87a50' }),
  hull: toon({ color: '#76808e' }), hullDark: toon({ color: '#3d444e' }), metal: toon({ color: '#b6bec8' }), metalDark: toon({ color: '#6a7078' }),
  navy: toon({ color: '#3f4c68' }), olive: toon({ color: '#55603c' }), oliveDark: toon({ color: '#3e4630' }), canvasOlive: toon({ color: '#6c7048' }),
  sheet: toon({ color: '#eef3f8' }), white: toon({ color: '#f1eee6' }), marble: toon({ color: '#f0ece4' }), black: toon({ color: '#141216' }),
  red: toon({ color: '#b8282b' }), velvet: toon({ color: '#8c1e2e' }), gold: toon({ color: '#e8c45a' }), cream: toon({ color: '#efe6cf' }),
  lampGreen: toon({ color: '#2f5a42', side: THREE.DoubleSide }), radio: toon({ color: '#5a4c38' }), dial: toon({ color: '#efe3c0' }),
  trunk: toon({ color: '#6a4a32' }), leaf: toon({ color: '#3f6b36' }), leaf2: toon({ color: '#4f7c3a' }), rock: toon({ color: '#8a8680' }),
  hillNight: toon({ color: '#1e2638' }), hillFar: toon({ color: '#7d8f6a' }), hillFar2: toon({ color: '#8f9c78' }), dune: toon({ color: '#d8bf8c' }),
  shipGrey: toon({ color: '#66748e' }), shipGreyD: toon({ color: '#4c5870' }), rail: toon({ color: '#4a4440' }),
};
M.mapOurs = toon({ map: P.tex(mapTex(false)) }); M.mapEnemy = toon({ map: P.tex(mapTex(true)) });
M.sheetTex = toon({ map: P.tex(lineSheetTex()) });
const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });
const glowMat = (color, o = 1) => new THREE.MeshBasicMaterial({ color, transparent: o < 1, opacity: o, fog: false });

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
const cyl = (r0, r1, h, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
const sph = (r, a = 16, b = 12) => new THREE.SphereGeometry(r, a, b);
const grp = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
const plane = (w, h, mat, parent, x, y, z, rotX = -Math.PI / 2, opts = {}) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false, ...opts }); m.rotation.x = rotX; return m; };
const DYN = {}; const dyn = (name, o) => { DYN[name] = o; o.userData.base = { p: o.position.clone(), r: o.rotation.clone(), s: o.scale.clone() }; return o; };

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 }, glow: { value: 0 }, gpow: { value: 18 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize, glow, gpow; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .5)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir));
      c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.7, s) + glow*pow(max(s,0.), gpow)*step(.0001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
const lamp = new THREE.PointLight('#ffd08a', 0, 9, 1.6); scene.add(lamp);
const fill = new THREE.DirectionalLight('#ffffff', 0); scene.add(fill); scene.add(fill.target); // soft fill from the camera side (night shots)
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// ---------- sea (shared by several sets) ----------
const seaU = { t: { value: 0 }, amp: { value: 0.3 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') }, glintDir: { value: new THREE.Vector2(0, -1) } };
const seaMat = new THREE.ShaderMaterial({
  uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...seaU }, fog: true,
  vertexShader: `#include <fog_pars_vertex>
    uniform float t, amp; varying vec3 vW; varying float vH;
    float wv(vec2 p){ return sin(p.x*.22 + t*1.1) + .7*sin(p.y*.29 - t*.9 + p.x*.05) + .35*sin((p.x+p.y)*.41 + t*1.6); }
    void main(){ vec4 w = modelMatrix*vec4(position,1.); float h = wv(w.xz)*amp; w.y += h; vH = h/(amp*2.05+1e-4); vW = w.xyz;
      vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform float t; uniform vec3 deep, shal, glint; uniform vec2 glintDir; varying vec3 vW; varying float vH;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
    void main(){ vec2 p = vW.xz*vec2(.16,.3) + vec2(t*.05, -t*.12);
      float n = noise(p)*.6 + noise(p*2.7 + 7.)*.4;
      vec3 c = mix(deep, shal, clamp(.25 + .45*n + .35*vH, 0., 1.));
      float streak = smoothstep(.8, .86, noise(vW.xz*vec2(1.6,.45) + vec2(t*.1, -t*.4))) * .6 * smoothstep(8., 40., length(vW.xz - cameraPosition.xz));
      float path = pow(max(0., 1. - abs(normalize(vW.xz).x*0. + (vW.x*glintDir.y - vW.z*glintDir.x))/(abs(vW.z)*.25+6.)), 2.);
      c = mix(c, glint, clamp(streak*(.35 + .9*path) + smoothstep(.6,.95,vH)*.15, 0., 1.));
      gl_FragColor = vec4(c,1.);
      #include <fog_fragment>
    }`,
});
const sea = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400, 320, 320), seaMat); sea.rotation.x = -Math.PI / 2;
sea.userData.nd = new THREE.ShaderMaterial({ uniforms: { t: seaU.t, amp: seaU.amp },
  vertexShader: `uniform float t, amp; varying float vD; float wv(vec2 p){ return sin(p.x*.22 + t*1.1) + .7*sin(p.y*.29 - t*.9 + p.x*.05) + .35*sin((p.x+p.y)*.41 + t*1.6); }
    void main(){ vec4 w = modelMatrix*vec4(position,1.); w.y += wv(w.xz)*amp; vec4 mv = viewMatrix*w; vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }` });
sea.receiveShadow = false; scene.add(sea);

// =====================================================================================
// SETS
// =====================================================================================
const SETS = {}; const set = (id) => (SETS[id] = grp(scene));

// ---------- M1: night sea + submarine ----------
{ const S = set('sea');
  const sub = dyn('sub', grp(S, 0, -0.5, 0));
  const hull = add(cyl(2.2, 2.2, 22, 32), M.hull, 0, 0, 0, sub); hull.rotation.z = Math.PI / 2;
  const bow = add(sph(2.2, 32, 16), M.hull, 11, 0, 0, sub); bow.scale.set(3.6, 1, 1);
  const stern = add(sph(2.2, 32, 16), M.hull, -11, 0, 0, sub); stern.scale.set(5.2, 0.92, 0.92);
  add(tbox(27, 0.22, 2.4, 1), M.plank, -0.5, 2.12, 0, sub).material = toon({ map: M.plank.map, color: '#7d8590' });
  for (const z of [-1.25, 1.25]) add(box(27, 0.08, 0.06), M.hullDark, -0.5, 2.26, z, sub);
  const tw = grp(sub, 1.6, 2.2, 0);
  add(tbox(5.2, 2.9, 2.0, 1), M.hull, 0, 1.45, 0, tw); add(cyl(1.0, 1.0, 2.9, 20), M.hull, 2.6, 1.45, 0, tw); add(cyl(1.0, 1.0, 2.9, 20), M.hull, -2.6, 1.45, 0, tw);
  add(box(7.2, 0.12, 2.2), M.hullDark, 0, 2.95, 0, tw);
  for (let i = 0; i < 9; i++) { add(cyl(0.035, 0.035, 0.9, 6), M.metalDark, -3.3 + i * 0.82, 3.4, 1.05, tw); add(cyl(0.035, 0.035, 0.9, 6), M.metalDark, -3.3 + i * 0.82, 3.4, -1.05, tw); }
  for (const z of [-1.05, 1.05]) { const r = add(cyl(0.04, 0.04, 6.6, 6), M.metalDark, 0, 3.85, z, tw); r.rotation.z = Math.PI / 2; }
  add(cyl(0.12, 0.12, 2.6, 10), M.metalDark, 0.4, 4.2, 0, tw); add(cyl(0.09, 0.09, 1.8, 10), M.metalDark, -0.6, 3.9, 0, tw); add(box(0.4, 0.18, 0.2), M.metalDark, 0.55, 5.45, 0, tw);
  add(cyl(0.45, 0.45, 0.22, 16), M.hullDark, -9, 2.3, 0, sub); add(cyl(0.45, 0.45, 0.22, 16), M.hullDark, 7.5, 2.3, 0, sub);
  for (let i = 0; i < 12; i++) for (const z of [-1.2, 1.2]) add(cyl(0.025, 0.025, 0.7, 5), M.metalDark, -12 + i * 2.2, 2.55, z, sub);
  for (const z of [-1.2, 1.2]) { const w = add(cyl(0.015, 0.015, 26, 4), M.metalDark, -0.5, 2.85, z, sub); w.rotation.z = Math.PI / 2; }
  const fr = add(new THREE.PlaneGeometry(40, 9), new THREE.MeshBasicMaterial({ map: P.tex(foamRingTex()), transparent: true, depthWrite: false, opacity: 0, fog: true }), -0.5, 0.12, 0, S, { cast: false });
  fr.rotation.x = -Math.PI / 2; fr.userData.ndSkip = true; DYN.foamRingMesh = fr;
  const sig = add(sph(0.16, 12, 8), glowMat('#3a3020'), 2.0, 2.3, 1.0, tw, { cast: false }); sig.userData.ndSkip = true; DYN.sigLamp = sig;
  add(cyl(0.2, 0.2, 0.25, 12), M.hullDark, 2.0, 2.3, 0.88, tw).rotation.x = Math.PI / 2;
  // the night shore with a few warm windows
  const shore = grp(S, 0, 0, 0);
  const rh = P.rng(17);
  for (let i = 0; i < 9; i++) { const h = add(sph(60 + rh() * 50, 20, 10), M.hillNight, -300 + i * 80 + rh() * 30, -30, -380 - rh() * 60, shore, { cast: false }); h.scale.y = 0.45 + rh() * 0.25; }
  for (let i = 0; i < 14; i++) { const l = add(sph(0.9 + rh() * 0.6, 8, 6), glowMat('#ffd27a'), -180 + rh() * 320, 3 + rh() * 9, -330 - rh() * 40, shore, { cast: false }); l.userData.ndSkip = true; }
  dyn('shoreLights', shore);
}

// ---------- M2: secret planning room ----------
const mapTable = (S, mapMat, pawnMat, prefix) => {
  add(tbox(3.7, 0.09, 2.4, 1), M.deskWood, 0, 0.78, 0, S);
  for (const [x, z] of [[-1.7, -1.05], [1.7, -1.05], [-1.7, 1.05], [1.7, 1.05]]) add(box(0.12, 0.74, 0.12), M.woodDark, x, 0.37, z, S);
  add(box(3.7, 0.12, 0.06), M.woodDark, 0, 0.68, 1.18, S); add(box(3.7, 0.12, 0.06), M.woodDark, 0, 0.68, -1.18, S);
  plane(3.4, 2.12, mapMat, S, 0, 0.828, 0);
  const pawn = (x, z, mat, name) => { const g = grp(S, x, 0.826, z); add(cyl(0.045, 0.06, 0.03, 14), mat, 0, 0.015, 0, g); add(cyl(0.022, 0.034, 0.08, 12), mat, 0, 0.07, 0, g); add(sph(0.032, 12, 8), mat, 0, 0.125, 0, g); if (name) dyn(name, g); return g; };
  return pawn;
};
{ const S = set('room');
  plane(12, 12, M.plank, S, 0, 0, 0);
  add(tbox(12, 3.4, 0.4, 1.4), M.stone, 0, 1.7, -4.2, S); add(tbox(0.4, 3.4, 12, 1.4), M.stone, -4.4, 1.7, 0, S); add(tbox(0.4, 3.4, 12, 1.4), M.stone, 4.4, 1.7, 0, S);
  add(box(12, 0.3, 12), M.woodDark, 0, 3.45, 0, S, { cast: false });
  for (let i = -2; i <= 2; i++) add(box(0.25, 0.3, 12), M.wood, i * 1.8, 3.2, 0, S);
  const pawn = mapTable(S, M.mapOurs, M.navy, 'r');
  pawn(-0.9, -0.55, M.navy); pawn(-1.1, 0.5, M.navy); pawn(1.25, -0.6, M.navy); pawn(-1.3, -0.2, M.navy);
  pawn(0.95, 0.62, M.navy, 'pawnA');
  dyn('stick', add(cyl(0.012, 0.016, 1.5, 8), M.woodLight, 0, 0, 0, S)); DYN.stick.visible = false;
  // hanging lamp (pivot at the ceiling)
  const lp = dyn('lampR', grp(S, 0, 3.3, -0.4));
  add(cyl(0.012, 0.012, 0.95, 6), M.black, 0, -0.47, 0, lp, { cast: false });
  const shade = add(new THREE.ConeGeometry(0.3, 0.24, 24, 1, true), M.lampGreen, 0, -1.04, 0, lp, { cast: false });
  add(cyl(0.05, 0.05, 0.1, 10), M.black, 0, -0.93, 0, lp, { cast: false });
  const bulb = add(sph(0.07, 12, 8), glowMat('#fff3c8'), 0, -1.14, 0, lp, { cast: false }); bulb.userData.ndSkip = true; DYN.bulbR = bulb;
  // corkboard with pinned blank papers and red strings
  const bd = grp(S, 0.9, 1.85, -3.98);
  add(box(2.6, 1.5, 0.05), M.cork, 0, 0, 0, bd); add(box(2.72, 1.62, 0.03), M.woodDark, 0, 0, -0.02, bd);
  const pins = [[-1.0, 0.45], [-0.3, 0.5], [0.55, 0.38], [1.0, -0.2], [0.1, -0.35], [-0.8, -0.4]];
  pins.forEach(([x, y], i) => { const pp = plane(0.38 + (i % 2) * 0.1, 0.3 + (i % 3) * 0.06, M.sheetTex, bd, x, y, 0.035, 0); pp.rotation.z = (i - 2.5) * 0.06; add(sph(0.025, 8, 6), M.red, x, y + 0.12, 0.06, bd); });
  const strs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4]];
  for (const [a, b] of strs) { const A = new THREE.Vector3(pins[a][0], pins[a][1] + 0.12, 0.065), B = new THREE.Vector3(pins[b][0], pins[b][1] + 0.12, 0.065); const L = A.distanceTo(B); const s = add(cyl(0.006, 0.006, L, 4), M.red, (A.x + B.x) / 2, (A.y + B.y) / 2, 0.065, bd, { cast: false }); s.rotation.z = Math.atan2(B.y - A.y, B.x - A.x) - Math.PI / 2; }
  // radio set in the corner
  const rd = grp(S, -3.2, 0, -3.3); rd.rotation.y = 0.5;
  add(box(1.0, 0.8, 0.6), M.woodDark, 0, 0.4, 0, rd); const rb = add(box(0.9, 0.55, 0.45), M.radio, 0, 1.08, 0, rd);
  add(box(0.36, 0.3, 0.02), M.black, -0.18, 1.1, 0.23, rd); for (let i = 0; i < 5; i++) add(box(0.34, 0.02, 0.02), M.metalDark, -0.18, 0.98 + i * 0.055, 0.245, rd);
  for (const [x, y] of [[0.18, 1.2], [0.32, 1.2], [0.18, 1.0], [0.32, 1.0]]) { const d = add(cyl(0.045, 0.045, 0.04, 14), M.dial, x, y, 0.24, rd); d.rotation.x = Math.PI / 2; }
  add(box(0.24, 0.06, 0.02), glowMat('#ffd890'), 0.25, 1.3, 0.235, rd).userData.ndSkip = true;
  add(cyl(0.01, 0.01, 0.7, 4), M.metalDark, 0.3, 1.7, 0, rd);
  // shelf with blank binders
  const sh = grp(S, -4.15, 0, 1.2); sh.rotation.y = Math.PI / 2;
  for (const y of [0.9, 1.6, 2.3]) add(box(1.8, 0.05, 0.35), M.wood, 0, y, 0, sh);
  const rb2 = P.rng(4); for (let k = 0; k < 3; k++) for (let i = 0; i < 9; i++) add(box(0.1, 0.4 + rb2() * 0.12, 0.28), toon({ color: ['#6a4a3a', '#3f4c68', '#7a6a4a', '#5a3a30'][(i + k) % 4] }), -0.8 + i * 0.13 + rb2() * 0.02, 0.9 + k * 0.7 + 0.25, 0, sh);
  // chairs
  for (const [x, z, r] of [[-1.6, 1.6, 0.2], [1.5, 1.7, -0.3]]) { const c = grp(S, x, 0, z); c.rotation.y = r; add(box(0.5, 0.06, 0.5), M.wood, 0, 0.48, 0, c); add(box(0.5, 0.6, 0.06), M.wood, 0, 0.8, -0.22, c); for (const [a, b] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) add(box(0.05, 0.48, 0.05), M.woodDark, a, 0.24, b, c); }
}

// ---------- M3: cold storage (plain, not scary) ----------
{ const S = set('cold');
  plane(10, 10, M.tilesFloor, S, 0, 0, 0);
  add(tbox(10, 3.2, 0.3, 1.2), M.tiles, 0, 1.6, -3.4, S); add(tbox(0.3, 3.2, 10, 1.2), M.tiles, -4.2, 1.6, 0, S); add(tbox(0.3, 3.2, 10, 1.2), M.tiles, 4.2, 1.6, 0, S);
  add(box(10, 0.2, 10), M.white, 0, 3.3, 0, S, { cast: false });
  for (const x of [-1.6, 1.6]) { const pnl = add(box(1.4, 0.05, 0.5), glowMat('#eaf6ff'), x, 3.18, 0, S, { cast: false }); pnl.userData.ndSkip = true; }
  // door
  add(box(1.2, 2.3, 0.06), M.metal, 2.4, 1.15, -3.22, S); add(box(1.36, 2.42, 0.04), M.metalDark, 2.4, 1.2, -3.24, S); add(box(0.5, 0.35, 0.03), glowMat('#cfe6f4'), 2.4, 1.7, -3.18, S).userData.ndSkip = true;
  add(box(0.06, 0.25, 0.06), M.metalDark, 2.0, 1.1, -3.16, S);
  // stretcher
  const st = grp(S, 0, 0, 0);
  add(box(2.1, 0.05, 0.74), M.metal, 0, 0.8, 0, st);
  for (const [x, z] of [[-0.95, -0.32], [0.95, -0.32], [-0.95, 0.32], [0.95, 0.32]]) { add(cyl(0.025, 0.025, 0.72, 8), M.metalDark, x, 0.42, z, st); const w = add(cyl(0.06, 0.06, 0.04, 12), M.black, x, 0.06, z, st); w.rotation.x = Math.PI / 2; }
  add(box(2.0, 0.03, 0.03), M.metalDark, 0, 0.3, -0.32, st); add(box(2.0, 0.03, 0.03), M.metalDark, 0, 0.3, 0.32, st);
  add(box(0.4, 0.08, 0.6), M.white, -0.85, 0.86, 0, st);
  const sheet = dyn('sheet', grp(S, 0.25, 0, 0));
  const hump = add(cyl(0.3, 0.3, 1.45, 24), M.sheet, 0.22, 0.86, 0, sheet); hump.rotation.z = Math.PI / 2; hump.scale.set(1, 1, 0.46);
  hump.scale.set(0.55, 1, 1.15);
  add(box(1.65, 0.04, 0.8), M.sheet, 0.18, 0.84, 0, sheet);
  for (const z of [-0.4, 0.4]) { const fl = add(box(1.6, 0.22, 0.02), M.sheet, 0.18, 0.74, z, sheet); fl.rotation.x = z > 0 ? 0.15 : -0.15; }
  // cart with the folded uniform and cap waiting
  const ct = grp(S, 1.2, 0, -2.6);
  add(box(0.9, 0.04, 0.55), M.metal, 0, 0.82, 0, ct); add(box(0.9, 0.04, 0.55), M.metal, 0, 0.3, 0, ct);
  for (const [x, z] of [[-0.42, -0.25], [0.42, -0.25], [-0.42, 0.25], [0.42, 0.25]]) add(cyl(0.02, 0.02, 0.82, 6), M.metalDark, x, 0.41, z, ct);
  add(box(0.55, 0.1, 0.38), M.navy, -0.1, 0.89, 0, ct); add(box(0.5, 0.08, 0.34), toon({ color: '#c7b088' }), -0.1, 0.98, 0, ct);
  const cap = grp(ct, 0.28, 1.0, 0); add(cyl(0.16, 0.13, 0.06, 18), M.navy, 0, 0.02, 0, cap); const vz = add(cyl(0.12, 0.12, 0.012, 18, 1), M.black, 0.08, -0.01, 0, cap);
}

// ---------- M4: the "fake life" desk ----------
{ const S = set('desk');
  plane(10, 10, M.plank, S, 0, 0, 0);
  add(tbox(10, 3.2, 0.2, 1.2), M.panel, 0, 1.6, -2.4, S);
  add(tbox(2.6, 0.07, 1.3, 1.2), M.deskWood, 0, 0.74, 0, S);
  add(box(2.5, 0.66, 1.2), M.woodDark, 0, 0.36, -0.02, S);
  plane(1.3, 0.75, toon({ color: '#3d5a46' }), S, 0.05, 0.777, 0.08);
  // desk lamp
  const dl = grp(S, 1.0, 0.775, -0.42); dl.rotation.y = Math.PI + 0.3;
  add(cyl(0.14, 0.16, 0.04, 20), M.brass, 0, 0.02, 0, dl); const a1 = add(cyl(0.015, 0.015, 0.45, 8), M.brass, 0.05, 0.22, 0, dl); a1.rotation.z = -0.3;
  const a2 = add(cyl(0.015, 0.015, 0.4, 8), M.brass, 0.22, 0.48, 0, dl); a2.rotation.z = -1.1;
  const shd = add(new THREE.ConeGeometry(0.17, 0.2, 20, 1, true), M.lampGreen, 0.42, 0.5, 0.0, dl, { cast: false }); shd.rotation.z = -0.5;
  const db = add(sph(0.05, 10, 8), glowMat('#fff2c0'), 0.45, 0.44, 0, dl, { cast: false }); db.userData.ndSkip = true; DYN.bulbD = db;
  // ink pot, pen, stack of blank books, framed blank picture
  add(cyl(0.05, 0.06, 0.07, 12), M.black, 0.95, 0.81, -0.35, S); const pen = add(cyl(0.008, 0.008, 0.2, 6), M.black, 0.9, 0.79, -0.2, S); pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.4;
  for (let i = 0; i < 3; i++) add(box(0.32, 0.05, 0.24), toon({ color: ['#5a3a30', '#3f4c68', '#7a6a4a'][i] }), -1.0, 0.8 + i * 0.05, 0.3 + i * 0.01, S);
  add(box(0.7, 0.5, 0.04), M.woodDark, 0.6, 1.75, -2.28, S); add(box(0.58, 0.38, 0.02), toon({ color: '#c8b48a' }), 0.6, 1.75, -2.25, S);
  add(box(0.3, 0.35, 0.03), M.woodDark, -0.5, 1.9, -2.28, S); add(box(0.22, 0.26, 0.02), toon({ color: '#9fb2bf' }), -0.5, 1.9, -2.25, S);
  // ring box (lid hinged at the back)
  const rbx = dyn('ringBox', grp(S, 0.02, 0.775, 0.26));
  add(box(0.1, 0.05, 0.1), M.velvet, 0, 0.025, 0, rbx); add(box(0.084, 0.01, 0.084), toon({ color: '#f0e6e0' }), 0, 0.051, 0, rbx);
  const lid = dyn('ringLid', grp(rbx, 0, 0.05, -0.05)); add(box(0.102, 0.035, 0.102), M.velvet, 0, 0.0175, 0.05, lid);
  const ring = dyn('ring', grp(rbx, 0, 0.078, 0.0)); const tr = add(new THREE.TorusGeometry(0.02, 0.005, 10, 28), M.gold, 0, 0, 0, ring); tr.rotation.x = 0.25;
  add(new THREE.OctahedronGeometry(0.011), glowMat('#e8f6ff'), 0, 0.024, 0.004, ring).userData.ndSkip = false;
}

// ---------- M5: briefcase in a spotlight on black ----------
{ const S = set('case');
  plane(40, 40, toon({ color: '#08070a' }), S, 0, 0, 0);
  const pool = plane(4.2, 4.2, new THREE.MeshBasicMaterial({ map: P.tex(P.radial('255,236,200', 0.12)), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), S, 0.1, 0.004, 0.15);
  pool.userData.ndSkip = true;
  const cs = dyn('case', grp(S, 0.35, 0, 0.62)); cs.rotation.y = 0.18;
  const cw = 0.52, cd = 0.38, ch = 0.1;
  add(box(cw, 0.012, cd), M.leather, 0, 0.006, 0, cs);
  add(box(cw, ch, 0.014), M.leather, 0, ch / 2, cd / 2, cs); add(box(cw, ch, 0.014), M.leather, 0, ch / 2, -cd / 2, cs);
  add(box(0.014, ch, cd), M.leather, cw / 2, ch / 2, 0, cs); add(box(0.014, ch, cd), M.leather, -cw / 2, ch / 2, 0, cs);
  plane(cw - 0.03, cd - 0.03, M.lining, cs, 0, 0.014, 0);
  const lidC = dyn('caseLid', grp(cs, 0, ch, -cd / 2)); add(box(cw + 0.01, 0.03, cd + 0.01), M.leather, 0, 0.015, cd / 2, lidC);
  add(box(cw - 0.04, 0.006, cd - 0.04), M.lining, 0, -0.002, cd / 2, lidC);
  const hd = add(new THREE.TorusGeometry(0.06, 0.012, 8, 20, Math.PI), M.woodDark, 0, 0.06, cd / 2 + 0.03, cs); hd.rotation.x = -Math.PI / 2 * 0.0;
  for (const x of [-0.16, 0.16]) add(box(0.04, 0.03, 0.02), M.brass, x, ch - 0.01, cd / 2 + 0.01, cs);
  // chain links (placed per frame by worldState)
  const links = []; for (let i = 0; i < 18; i++) { const l = add(new THREE.TorusGeometry(0.022, 0.006, 6, 14), M.metal, 0, 0, 0, S); links.push(l); }
  DYN.links = links;
  const lock = dyn('lock', grp(S, 0, 0, 0)); add(box(0.06, 0.05, 0.025), M.brass, 0, 0.025, 0, lock); const shk = dyn('shackle', add(new THREE.TorusGeometry(0.022, 0.006, 6, 14, Math.PI), M.metal, 0, 0.05, 0, lock));
}

// ---------- M6: dawn shore with the fisherman ----------
const beachGeo = (w, d, y0, y1, z0, seg = 80) => { const g = new THREE.PlaneGeometry(w, d, seg, seg); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i) + z0, x = p.getX(i); const t = Math.min(1, Math.max(0, (z + d / 2 - z0) / d)); p.setY(i, y0 + (y1 - y0) * Math.pow(t, 0.8) + 0.12 * Math.sin(x * 0.3) * t); p.setZ(i, z); } g.computeVertexNormals(); return g; };
const bY = (z, y0, y1, z0, d) => y0 + (y1 - y0) * Math.pow(Math.min(1, Math.max(0, (z - (z0 - d / 2)) / d)), 0.8);
{ const S = set('shore');
  const beach = add(beachGeo(240, 80, -0.6, 3.0, 30), M.sand, 0, 0, 0, S, { cast: false });
  const wet = add(new THREE.PlaneGeometry(240, 2.4), toon({ color: '#c7a874', transparent: true, opacity: 0.5, depthWrite: false }), 0, 0.075, -0.4, S, { cast: false }); wet.rotation.x = -Math.PI / 2 - 0.05; wet.userData.ndSkip = true;
  const foam = dyn('foam', add(new THREE.PlaneGeometry(240, 0.5), new THREE.MeshBasicMaterial({ color: '#fbf6ea', transparent: true, opacity: 0.85 }), 0, 0.04, -1.5, S, { cast: false })); foam.rotation.x = -Math.PI / 2; foam.userData.ndSkip = true;
  // wooden fishing boat pulled up on the sand
  const bt = grp(S, -4.4, bY(0.8, -0.6, 3, 30, 80) - 0.05, 0.8); bt.rotation.y = 0.5; bt.rotation.z = 0.06;
  const hg = new THREE.BoxGeometry(3.6, 0.75, 1.4, 8, 2, 2); const hp_ = hg.attributes.position;
  for (let i = 0; i < hp_.count; i++) { const x = hp_.getX(i), y = hp_.getY(i), z = hp_.getZ(i); const bowK = Math.max(0, (x - 0.6) / 1.2); let zz = z * (1 - Math.min(1, bowK) * 0.95); if (y < 0) zz *= 0.55; hp_.setZ(i, zz); if (y < 0) hp_.setY(i, y + Math.abs(x) * 0.02); }
  hg.computeVertexNormals(); add(hg, texM(P.planks(8), 2, 1, '#c99a68'), 0, 0.38, 0, bt);
  add(box(2.6, 0.04, 1.0), M.woodDark, -0.3, 0.7, 0, bt); add(box(0.08, 0.06, 1.3), M.wood, 0.3, 0.76, 0, bt); add(box(0.08, 0.06, 1.2), M.wood, -0.8, 0.76, 0, bt);
  for (const s of [-1, 1]) { const o = add(cyl(0.025, 0.025, 2.4, 6), M.woodLight, -0.2, 0.85, s * 0.45, bt); o.rotation.z = Math.PI / 2 - 0.15; o.rotation.y = s * 0.2; }
  add(box(3.7, 0.08, 0.06), toon({ color: '#3f6a8a' }), 0, 0.72, 0.62, bt);
  const net = add(sph(0.6, 12, 8), toon({ color: '#9a8a68' }), -2.6, bY(2.2, -0.6, 3, 30, 80), 2.2, S); net.scale.set(1.4, 0.35, 1);
  const rr = P.rng(33); for (let i = 0; i < 10; i++) { const r = add(new THREE.DodecahedronGeometry(0.3 + rr() * 0.5), M.rock, 6 + rr() * 20, 0.1, -1 + rr() * 6, S); r.scale.y = 0.6; }
  for (let i = 0; i < 6; i++) { const h = add(sph(40 + rr() * 30, 20, 10), i % 2 ? M.hillFar : M.hillFar2, 80 + i * 40, -12, -150 - rr() * 80, S, { cast: false }); h.scale.y = 0.5; }
  for (let i = 0; i < 5; i++) { const h = add(sph(30 + rr() * 20, 16, 10), M.dune, -60 + i * 30, -10, 60 + rr() * 30, S, { cast: false }); h.scale.y = 0.35; }
  // posts with a drying net
  const yN = bY(5.5, -0.6, 3, 30, 80);
  for (const x of [2.8, 5.6]) add(cyl(0.06, 0.07, 1.6, 8), M.wood, x, yN + 0.8, 5.5, S);
  add(new THREE.PlaneGeometry(2.8, 1.0, 8, 4), new THREE.MeshToonMaterial({ gradientMap: grad, color: '#8a7a5a', transparent: true, opacity: 0.55, side: THREE.DoubleSide }), 4.2, yN + 1.0, 5.5, S, { cast: false });
}

// ---------- M7: enemy headquarters (+ M8 map top view) ----------
{ const S = set('hq');
  plane(12, 12, M.plank, S, 0, 0, 0).material = toon({ map: M.plank.map, color: '#8a7a68' });
  add(tbox(12, 3.6, 0.3, 1.4), M.greenWall, 0, 1.8, -4.0, S); add(tbox(0.3, 3.6, 12, 1.4), M.greenWall, -4.6, 1.8, 0, S); add(tbox(0.3, 3.6, 12, 1.4), M.greenWall, 4.6, 1.8, 0, S);
  add(tbox(12, 1.0, 0.34, 1.4), M.wainscot, 0, 0.5, -3.96, S);
  dyn('hqCeil', add(box(12, 0.3, 12), toon({ color: '#3a3a2c' }), 0, 3.7, 0, S, { cast: false }));
  // heavy curtains: folds as half cylinders
  for (const cx0 of [-2.4, 2.6]) { for (let i = 0; i < 9; i++) { const f = add(new THREE.CylinderGeometry(0.13, 0.13, 3.3, 10, 1, true, 0, Math.PI), toon({ color: '#5a2a22', side: THREE.DoubleSide }), cx0 - 0.95 + i * 0.24, 1.75, -3.8, S); f.rotation.y = -Math.PI / 2; }
    add(box(2.6, 0.1, 0.1), M.brass, cx0, 3.45, -3.78, S); }
  add(box(1.6, 2.0, 0.05), toon({ color: '#2a3446' }), 0.1, 1.9, -3.84, S); // dim window between the curtains
  const pawn = mapTable(S, M.mapEnemy, M.olive, 'g');
  const GP = [[-0.25, -0.1], [0.12, -0.18], [0.2, 0.15], [-0.15, 0.18], [0.0, 0.0], [-0.35, 0.08], [0.32, -0.02]];
  GP.forEach(([x, z], i) => pawn(x * 1.7, z * 1.6, M.olive, 'gp' + i));
  for (let i = 0; i < 3; i++) { const t = dyn('toy' + i, grp(S, 0, 0.83, 0)); add(box(0.12, 0.05, 0.06), M.oliveDark, 0, 0.035, 0, t); add(box(0.04, 0.05, 0.055), M.olive, 0.07, 0.04, 0, t); for (const [x, z] of [[-0.04, 0.032], [0.05, 0.032], [-0.04, -0.032], [0.05, -0.032]]) { const w = add(cyl(0.012, 0.012, 0.01, 8), M.black, x, 0.012, z, t); w.rotation.x = Math.PI / 2; } }
  // side desk with typewriter and banker lamp
  const sd = grp(S, 3.1, 0, -2.6); sd.rotation.y = -0.6;
  add(box(1.4, 0.06, 0.7), M.woodDark, 0, 0.76, 0, sd); add(box(1.3, 0.7, 0.6), M.woodDark, 0, 0.38, 0, sd);
  const tw = grp(sd, -0.15, 0.79, 0.05); add(box(0.42, 0.1, 0.32), M.black, 0, 0.05, 0, tw); add(box(0.46, 0.06, 0.08), M.black, 0, 0.16, -0.1, tw);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 8; k++) add(cyl(0.012, 0.012, 0.02, 8), M.dial, -0.15 + k * 0.042 + r * 0.01, 0.11 + r * 0.012, 0.11 - r * 0.045, tw);
  const tp = plane(0.22, 0.26, M.sheetTex, tw, 0, 0.3, -0.12, -0.2);
  const bl = grp(sd, 0.4, 0.79, -0.1); add(cyl(0.06, 0.07, 0.03, 12), M.brass, 0, 0.015, 0, bl); add(cyl(0.01, 0.01, 0.3, 6), M.brass, 0, 0.16, 0, bl); const bsh = add(cyl(0.05, 0.12, 0.08, 14, 1), toon({ color: '#2f6a46' }), 0, 0.32, 0.04, bl); bsh.rotation.x = 0.5;
  add(sph(0.035, 8, 6), glowMat('#fff2c0'), 0, 0.3, 0.06, bl).userData.ndSkip = true;
  // filing cabinet
  add(box(0.7, 1.4, 0.6), toon({ color: '#5a6248' }), -3.6, 0.7, -3.2, S); for (let i = 0; i < 3; i++) add(box(0.2, 0.04, 0.04), M.brass, -3.6, 0.35 + i * 0.42, -2.88, S);
}

// ---------- M8b: the march to the wrong places ----------
{ const S = set('march');
  plane(900, 900, M.field, S, 0, 0, 0);
  plane(6, 900, M.dirt, S, 0, 0.02, 0).material = texM(P.dirt(7), 1, 90, '#d8c4a0');
  const r = P.rng(55);
  for (let i = 0; i < 40; i++) { const side = i % 2 ? 1 : -1, z = -i * 9 + 30; const t = grp(S, side * (5.5 + r() * 1.5), 0, z); add(cyl(0.12, 0.16, 1.2, 6), M.trunk, 0, 0.6, 0, t); const c = add(sph(1, 10, 10), M.leaf, 0, 3.4, 0, t); c.scale.set(0.9, 2.6, 0.9); }
  for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, d = 200 + r() * 200; const h = add(sph(50 + r() * 60, 20, 10), i % 2 ? M.hillFar : M.hillFar2, Math.cos(a) * d, -14, Math.sin(a) * d - 150, S, { cast: false }); h.scale.y = 0.45; }
  for (let i = 0; i < 4; i++) { const tk = dyn('truck' + i, grp(S, 1.0, 0, -10 - i * 12));
    add(box(1.8, 1.3, 1.8), M.olive, 0, 1.15, -2.0, tk); add(box(1.7, 0.6, 0.05), toon({ color: '#2a3446' }), 0, 1.5, -2.92, tk);
    add(box(1.9, 0.5, 3.6), M.oliveDark, 0, 0.8, 0.8, tk); const cv_ = add(cyl(0.95, 0.95, 3.6, 16, 1, false, 0, Math.PI), M.canvasOlive, 0, 1.05, 0.8, tk); cv_.rotation.x = Math.PI / 2; cv_.rotation.z = Math.PI / 2;
    for (const [x, z] of [[-0.95, -2.2], [0.95, -2.2], [-0.95, 1.6], [0.95, 1.6], [-0.95, 0.4], [0.95, 0.4]]) { const w = add(cyl(0.42, 0.42, 0.3, 16), M.black, x, 0.42, z, tk); w.rotation.z = Math.PI / 2; } }
  const tr = dyn('train', grp(S, -38, 0, -60));
  add(box(1.6, 0.2, 400), M.rail, 0, 0.1, 0, S).position.set(-38, 0.1, -150);
  const loco = grp(tr, 0, 0, 0); add(cyl(1.0, 1.0, 5, 16), M.oliveDark, 0, 1.9, -1, loco).rotation.x = Math.PI / 2; add(box(2.2, 2.6, 2.2), M.oliveDark, 0, 2.2, 2.4, loco); add(cyl(0.3, 0.4, 1.2, 10), M.black, 0, 3.3, -2.8, loco);
  for (let i = 0; i < 7; i++) add(box(2.3, 2.4, 5.6), i % 2 ? M.olive : toon({ color: '#6a5a40' }), 0, 1.9, 6.5 + i * 6.2, tr);
}

// ---------- M9: the real landing at dawn ----------
{ const S = set('beach');
  add(beachGeo(400, 120, -0.9, 3.0, 50), M.sand, 0, 0, 0, S, { cast: false });
  const BY = (z) => bY(z, -0.9, 3.0, 50, 120);
  const foam = dyn('foamB', add(new THREE.PlaneGeometry(400, 0.6), new THREE.MeshBasicMaterial({ color: '#fbf6ea', transparent: true, opacity: 0.8 }), 0, 0.04, 8.6, S, { cast: false })); foam.rotation.x = -Math.PI / 2; foam.userData.ndSkip = true;
  const r = P.rng(71);
  for (let i = 0; i < 14; i++) { const d = add(sph(6 + r() * 6, 16, 10), M.dune, -60 + i * 9 + r() * 4, BY(30) - 2.2, 26 + r() * 14, S, { cast: false }); d.scale.y = 0.35; }
  for (let i = 0; i < 60; i++) { const gz = 14 + r() * 16; const g = add(new THREE.ConeGeometry(0.12, 0.6, 5), M.leaf2, -40 + r() * 80, BY(gz) + 0.25, gz, S); g.rotation.z = (r() - 0.5) * 0.5; }
  for (let i = 0; i < 8; i++) { const h = add(sph(40 + r() * 40, 20, 10), M.hillFar, -150 + i * 45, -10, 120 + r() * 60, S, { cast: false }); h.scale.y = 0.5; }
  // wooden watchtower
  const wt = grp(S, 7.5, BY(21), 21);
  for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) add(cyl(0.07, 0.09, 4.2, 6), M.wood, x, 2.1, z, wt);
  add(box(2.1, 0.12, 2.1), M.wood, 0, 4.0, 0, wt); for (const z of [-1, 1]) add(box(2.1, 0.5, 0.06), M.wood, 0, 4.35, z, wt); for (const x of [-1, 1]) add(box(0.06, 0.5, 2.1), M.wood, x, 4.35, 0, wt);
  const rf = add(new THREE.ConeGeometry(1.7, 0.8, 4), M.woodDark, 0, 5.4, 0, wt); rf.rotation.y = Math.PI / 4;
  for (let i = 0; i < 5; i++) add(sph(0.35, 8, 6), toon({ color: '#b8a070' }), -4.5 + i * 0.6, BY(17) + 0.1, 17, S).scale.y = 0.6;
  // the fleet: many navy-grey landing craft (no markings)
  const fleet = dyn('fleet', grp(S, 0, 0, 0));
  const craft = (x, z, s = 1) => { const c = grp(fleet, x, 0, z); c.scale.setScalar(s);
    add(box(3.4, 0.9, 7.2), M.shipGreyD, 0, 0.2, -0.1, c);                                  // hull
    for (const sx of [-1, 1]) add(box(0.22, 1.1, 6.6), M.shipGrey, sx * 1.6, 0.95, -0.3, c);  // high sides of the well deck
    add(box(3.0, 0.1, 6.0), M.black, 0, 0.62, -0.2, c);                                      // dark open well
    const ramp = add(box(3.4, 1.7, 0.25), M.shipGrey, 0, 0.95, 3.5, c); ramp.rotation.x = -0.18;
    add(box(3.4, 1.4, 1.4), M.shipGrey, 0, 1.25, -3.3, c); add(box(1.4, 0.9, 1.0), M.shipGreyD, 0, 2.3, -3.3, c);
    add(cyl(0.05, 0.05, 1.8, 6), M.metalDark, 0, 3.4, -3.4, c);
    const wk = add(new THREE.PlaneGeometry(6, 16), new THREE.MeshBasicMaterial({ map: P.tex(wakeTex()), transparent: true, depthWrite: false, fog: true }), 0, 0.14, -11.5, c, { cast: false });
    wk.rotation.x = -Math.PI / 2; wk.rotation.z = Math.PI; wk.userData.ndSkip = true;
    const bw = add(new THREE.PlaneGeometry(4.6, 3), new THREE.MeshBasicMaterial({ map: P.tex(foamRingTex()), transparent: true, depthWrite: false, opacity: 0.9, fog: true }), 0, 0.15, 3.6, c, { cast: false });
    bw.rotation.x = -Math.PI / 2; bw.userData.ndSkip = true; return c; };
  const rr = P.rng(19);
  for (let row = 0; row < 7; row++) for (let i = 0; i < 11; i++) { const cx_ = -55 + i * 11 + (row % 2) * 5.5; if (Math.abs(cx_ - 1) < 4) continue; craft(cx_ + rr() * 2, -40 - row * 26 - rr() * 6, 1 + row * 0.05); }
  for (let i = 0; i < 7; i++) { const s = grp(fleet, (i % 2 ? 1 : -1) * (75 + i * 18), 0, -120 - i * 30); add(box(9, 4, 60), M.shipGreyD, 0, 2, 0, s); add(box(6, 8, 10), M.shipGreyD, 0, 7, -6, s); add(box(3, 6, 4), M.shipGreyD, 0, 12, -6, s); add(cyl(0.6, 0.6, 9, 8), M.shipGreyD, 0, 9, 10, s); }
  for (let i = 0; i < 3; i++) { const tk = dyn('btruck' + i, grp(S, -10 + i * 0.4, BY(60 + i * 9), 60 + i * 9)); add(box(1.6, 1.4, 4.4), M.oliveDark, 0, 0.9, 0, tk); add(cyl(0.85, 0.85, 3, 12, 1, false, 0, Math.PI), M.canvasOlive, 0, 1.4, 0.4, tk).rotation.set(Math.PI / 2, 0, Math.PI / 2); }
  for (let k = 0; k < 12; k++) { const z = 34 + k * 8; const rd = plane(5, 8.2, M.dirt, S, -10, BY(z) + 0.03, z); rd.rotation.x = -Math.PI / 2 - Math.atan2(BY(z + 4) - BY(z - 4), 8); }
}

// ---------- M10: the silent hero's hill at sunset ----------
{ const S = set('hill');
  const hill = add(sph(40, 48, 24), M.grassHill, 0, -12.2, 0, S, { cast: false }); hill.scale.y = 0.3;
  const tree = grp(S, 2.9, -0.1, -2.2);
  const tk = add(cyl(0.18, 0.32, 4.2, 10), M.trunk, 0, 2.1, 0, tree); tk.rotation.z = -0.1;
  const br = add(cyl(0.08, 0.14, 2.0, 8), M.trunk, -0.6, 3.2, 0, tree); br.rotation.z = 0.8;
  [[0, 4.8, 0, 1.9], [-1.4, 4.2, 0.3, 1.5], [1.2, 4.3, -0.2, 1.4], [-0.4, 5.6, -0.4, 1.4], [0.6, 4.0, 1.0, 1.2], [-1.0, 3.6, -0.9, 1.1]].forEach(([x, y, z, r], i) => add(sph(r, 14, 10), i % 2 ? M.leaf : M.leaf2, x, y, z, tree));
  const gs = grp(S, 0, -0.02, 0);
  add(box(0.86, 0.14, 0.44), M.marble, 0, 0.07, 0, gs);
  add(box(0.56, 0.62, 0.14), M.marble, 0, 0.45, 0, gs); const top = add(cyl(0.28, 0.28, 0.14, 24, 1, false, -Math.PI / 2, Math.PI), M.marble, 0, 0.76, 0, gs); top.rotation.x = Math.PI / 2;
  const r = P.rng(81);
  for (let i = 0; i < 28; i++) { const a = r() * Math.PI * 2, d = 1.2 + r() * 9; const g = add(new THREE.ConeGeometry(0.05, 0.22, 4), M.leaf2, Math.cos(a) * d, 0.05 - d * d * 0.012, Math.sin(a) * d, S); g.rotation.z = (r() - 0.5) * 0.6; }
  for (let i = 0; i < 6; i++) { const h = add(sph(60 + r() * 60, 20, 10), M.hillFar, -300 + i * 120, -40, 260 + r() * 80, S, { cast: false }); h.scale.y = 0.4; }
}

// capture the rest pose of every dynamic object (after all set-up transforms)
for (const k in DYN) { const o = DYN[k]; if (o && o.isObject3D) o.userData.base = { p: o.position.clone(), r: o.rotation.clone(), s: o.scale.clone(), v: o.visible }; }

// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const flatGeo = new THREE.PlaneGeometry(CM * 0.6, CM);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
class Card {
  constructor() {
    this.c = document.createElement('canvas'); this.c.width = CW; this.c.height = CH; this.g = this.c.getContext('2d', { willReadFrequently: true }); // inflation reads the alpha back
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn, inflate, centred) {
    const k2 = key + (inflate ? '|i' + (centred ? 'c' : 's') : '');
    if (k2 === this.key) return false; this.key = k2;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
    if (this.igeo) { this.igeo.dispose(); this.igeo = null; }
    if (inflate) this.igeo = inflateGeo(this.c, centred, inflate.d ?? 0.11, inflate.cap ?? 5);
    return true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- 3D round heads (head3d, extended: ears, hair caps, 3D hats) ----------
const FPX = 1024, HPX = CM / 1000;
const headGrad = (() => { const d = new Uint8Array([170, 170, 170, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
// heads are unlit like the body cards: a painted toon matcap (light top-left, soft shadow crescent bottom-right, warm rim)
const matcapTex = (() => { const [c, g] = cv(256, 256); g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
  g.save(); g.beginPath(); g.arc(128, 128, 127, 0, 7); g.clip();
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#c9c0c8'; g.beginPath(); g.arc(128, 128, 128, 0, 7); g.arc(100, 100, 132, 0, 7, true); g.fill('evenodd');
  const gr = g.createRadialGradient(128, 128, 96, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(120,100,110,.45)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(82, 70, 26, 14, -0.6, 0, 7); g.fill(); g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const htoon = (o) => { const { gradientMap, emissive, ...r } = o; return new THREE.MeshMatcapMaterial({ matcap: matcapTex, ...r }); };
const headGeo = new THREE.SphereGeometry(1, 48, 32);
const faceGeo = (() => { const g = new THREE.SphereGeometry(1, 48, 32, 0, Math.PI), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 + p.getX(i) / 2.4, 0.5 + p.getY(i) / 2.4);
  return g; })();
const hairGeo = new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.44);
const earGeo = new THREE.SphereGeometry(1, 16, 12);
class Head3D {
  constructor() {
    [this.c, this.g] = cv(FPX, FPX);
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.grp = new THREE.Group(); this.grp.rotation.order = 'YXZ'; scene.add(this.grp);
    this.skinM = htoon({ color: '#ffffff' }); this.hairM = htoon({ color: '#3b2a20', side: THREE.DoubleSide });
    this.hatM = htoon({ color: '#ffffff' }); this.bandM = htoon({ color: '#333333', side: THREE.DoubleSide }); this.visorM = htoon({ color: '#1d1a1e' }); this.cordM = htoon({ color: '#d9b55a' });
    this.skin = add(headGeo, this.skinM, 0, 0, 0, this.grp);
    this.face = add(faceGeo, new THREE.MeshMatcapMaterial({ matcap: matcapTex, map: this.t, transparent: true, alphaTest: 0.35, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), 0, 0, 0, this.grp, { cast: false });
    this.face.scale.setScalar(1.004); this.face.userData.ndSkip = true;
    this.ears = [-1, 1].map((s) => { const e = add(earGeo, this.skinM, s * 0.97, 0.02, -0.05, this.grp); e.scale.set(0.16, 0.26, 0.12); return e; });
    this.hair = add(hairGeo, this.hairM, 0, 0, 0, this.grp); this.hair.scale.setScalar(1.06);
    // hats (unit-sphere space; the group is scaled to the head size)
    this.hats = {};
    { const h = new THREE.Group(); this.grp.add(h);
      add(cyl(1.18, 1.0, 0.32, 32), this.hatM, 0, 1.0, -0.06, h);
      const bandG = new THREE.CylinderGeometry(1.0, 0.86, 0.3, 32, 1, true); add(bandG, this.bandM, 0, 0.72, -0.04, h);   // snug cone band, open below
      add(new THREE.CircleGeometry(0.86, 32).rotateX(Math.PI / 2), this.bandM, 0, 0.575, -0.04, h);                   // dark inside, hidden by the head
      const v = add(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 24, 1, false, -Math.PI / 2, Math.PI), this.visorM, 0, 0.6, 0.42, h); v.rotation.x = 0.3;
      h.cord = add(new THREE.TorusGeometry(1.04, 0.035, 6, 40), this.cordM, 0, 0.8, -0.04, h); h.cord.rotation.x = Math.PI / 2;
      h.btn = add(sph(0.08, 10, 8), this.cordM, 0, 0.74, 1.02, h); h.rotation.x = -0.12; this.hats.peak = h; }
    { const h = new THREE.Group(); this.grp.add(h);
      add(cyl(1.85, 1.85, 0.05, 40), this.hatM, 0, 0.6, 0, h); add(cyl(0.86, 0.95, 0.52, 32), this.hatM, 0, 0.88, 0, h); add(cyl(0.97, 0.97, 0.14, 32), this.bandM, 0, 0.7, 0, h);
      h.rotation.x = -0.1; this.hats.straw = h; }
    { const h = new THREE.Group(); this.grp.add(h); const k = add(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), this.hatM, 0, 0.12, 0, h); k.scale.set(1.08, 1.0, 1.08);
      add(new THREE.TorusGeometry(1.03, 0.12, 8, 32), this.bandM, 0, 0.16, 0, h).rotation.x = Math.PI / 2; h.rotation.x = -0.15; this.hats.knit = h; }
    this.key = ''; this.grp.visible = false;
  }
  draw(key, fn, a, b) {
    if (key === this.key) return; this.key = key;
    const g = this.g, sx = FPX / (2.4 * a), sy = FPX / (2.4 * b);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, FPX, FPX);
    g.setTransform(sx, 0, 0, sy, -(300 - 1.2 * a) * sx, -(500 - 1.2 * b) * sy);
    fn(new T.Pen(g)); this.t.needsUpdate = true;
  }
}
const heads = []; const getHead = (i) => heads[i] || (heads[i] = new Head3D());
const tintC = new THREE.Color(), tmpC = new THREE.Color();
const setCol = (mat, col, tint, k = 1) => { mat.color.set(col).multiply(tint).multiplyScalar(k); };
const placeHead = (hd, a, cardYaw, s) => {
  const h = a.head3d, fl = a.flip ? -1 : 1;
  hd.draw(h.key, h.draw, h.a, h.b);
  const lx = h.x * HPX * s * fl, ly = (CM * 0.975 - h.y * HPX) * s;
  hd.grp.position.set(a.x + Math.cos(cardYaw) * lx, a.y + ly, a.z - Math.sin(cardYaw) * lx);
  hd.grp.rotation.set(h.pitch || 0, h.fixed ?? cardYaw + (h.yaw || 0), -(h.roll || 0) * fl);
  hd.grp.scale.set(h.a * HPX * s, h.b * HPX * s, h.a * HPX * s * (h.depth ?? 0.92));
  tintC.set(a.tint || '#ffffff');
  setCol(hd.skinM, h.skin, tintC, 1.0); hd.face.material.color.copy(tintC);
  hd.hair.visible = !!h.hair; if (h.hair) setCol(hd.hairM, h.hair, tintC); hd.hair.rotation.x = -0.32; hd.hair.scale.set(h.wavy ? 1.09 : 1.06, h.wavy ? 1.1 : 1.05, h.wavy ? 1.09 : 1.06);
  const hk = h.hat === 'captain' ? 'peak' : h.hat;
  for (const k in hd.hats) hd.hats[k].visible = k === hk;
  if (hk) { setCol(hd.hatM, h.hatCol || '#888888', tintC); setCol(hd.bandM, h.hat === 'straw' ? '#6b4a2e' : h.hat === 'knit' ? h.hatCol : h.band, tintC, h.hat === 'knit' ? 0.85 : 1); setCol(hd.visorM, '#1d1a1e', tintC); setCol(hd.cordM, h.hat === 'captain' ? '#d9b55a' : (h.cord || h.button), tintC);
    if (hd.hats.peak.cord) hd.hats.peak.cord.visible = h.hat === 'captain' || !!h.cord; }
  hd.grp.visible = a.alpha !== 0;
};

// ---------- inflated card bodies: the card silhouette becomes a rounded shell with thickness ----------
const GX = 48, GY = 80;
const inflateGeo = (canvasEl, centred, maxD = 0.11, cap = 5) => {
  const g = canvasEl.getContext('2d'), W_ = canvasEl.width, H_ = canvasEl.height, img = g.getImageData(0, 0, W_, H_).data;
  const inside = new Float32Array(GX * GY);
  for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { let n = 0; for (const [dx, dy] of [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7], [0.5, 0.5]]) { const x = ((i + dx) / GX * W_) | 0, y = ((j + dy) / GY * H_) | 0; if (img[(y * W_ + x) * 4 + 3] > 128) n++; } inside[j * GX + i] = n >= 2 ? 1 : 0; }
  const d = new Float32Array(GX * GY); const BIG = 1e3;
  for (let k = 0; k < d.length; k++) d[k] = inside[k] ? BIG : 0;
  const at = (i, j) => (i < 0 || j < 0 || i >= GX || j >= GY ? 0 : d[j * GX + i]);
  for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) if (d[j * GX + i]) d[j * GX + i] = Math.min(d[j * GX + i], at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + 1.414, at(i + 1, j - 1) + 1.414);
  for (let j = GY - 1; j >= 0; j--) for (let i = GX - 1; i >= 0; i--) if (d[j * GX + i]) d[j * GX + i] = Math.min(d[j * GX + i], at(i + 1, j) + 1, at(i, j + 1) + 1, at(i + 1, j + 1) + 1.414, at(i - 1, j + 1) + 1.414);
  const vd = (i, j) => { let s = 0, n = 0; for (const [a, b] of [[i - 1, j - 1], [i, j - 1], [i - 1, j], [i, j]]) { s += a < 0 || b < 0 || a >= GX || b >= GY ? 0 : Math.max(0, d[b * GX + a] - 0.5); n++; } const v = s / n; return maxD * Math.sqrt(Math.min(v, cap) / cap); };
  const pos = [], uv = [], idx = [], wv = CM * 0.6, oy = centred ? -CM / 2 : -CM * 0.025;
  for (const side of [1, -1]) {
    const base = pos.length / 3;
    for (let j = 0; j <= GY; j++) for (let i = 0; i <= GX; i++) { const u_ = i / GX, v_ = 1 - j / GY; pos.push(-wv / 2 + u_ * wv, oy + v_ * CM, side * vd(i, j)); uv.push(u_, v_); }
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { const a_ = base + j * (GX + 1) + i, b_ = a_ + 1, c_ = a_ + GX + 1, e_ = c_ + 1; if (side > 0) idx.push(a_, c_, b_, b_, c_, e_); else idx.push(a_, b_, c_, b_, e_, c_); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
};

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtA = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }), rtB = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 },
  sat: { value: 1.0 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 }, fade: { value: 0 },
  tone: { value: 0.15 }, grain: { value: 0.04 }, seed: { value: 0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash, fade, tone, grain, seed; uniform vec3 lift, gain; varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
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
    vec3 sep = vec3(l*1.07+.02, l*.98+.01, l*.82); c = mix(c, sep, tone);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    vec2 gp = vUv*res/1.9 + vec2(seed*13.7, seed*7.3); vec2 gi = floor(gp), gf = fract(gp); gf = gf*gf*(3.-2.*gf);
    float gn = mix(mix(hash(gi), hash(gi+vec2(1.,0.)), gf.x), mix(hash(gi+vec2(0.,1.)), hash(gi+vec2(1.,1.)), gf.x), gf.y);
    c += (gn - .5) * grain * (.3 + .7*smoothstep(.04, .45, l));   // soft fine grain, weaker in the shadows
    c = mix(c, vec3(1.), flash); c = mix(c, vec3(0.), fade);
    gl_FragColor = vec4(max(c, 0.),1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofMat = new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
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
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` });
const dofScene = fs(dofMat); dofMat.toneMapped = false;
const mixU = { a: { value: rtA.texture }, b: { value: rtB.texture }, k: { value: 0 } };
const mixScene = fs(new THREE.ShaderMaterial({ uniforms: mixU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D a, b; uniform float k; varying vec2 vUv; void main(){ gl_FragColor = linearToOutputTexel(vec4(mix(texture2D(a,vUv).rgb, texture2D(b,vUv).rgb, k), 1.)); }` }));

// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0; skyU.glow.value = L.sunGlow ?? 0.35; skyU.gpow.value = L.glowPow ?? 18;
  inkU.sat.value = L.sat ?? 1; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000'); inkU.tone.value = L.tone ?? 0.15; inkU.grain.value = L.grain ?? 0.018;
  if (L.waterDeep) { seaU.deep.value.set(L.waterDeep); seaU.shal.value.set(L.waterShal); seaU.glint.value.set(L.glint); }
  fill.intensity = L.fillI || 0; if (L.fillCol) fill.color.set(L.fillCol);
  lamp.intensity = L.lampI || 0; if (L.lampCol) lamp.color.set(L.lampCol); lamp.distance = L.lampDist || 9;
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV); seaU.glintDir.value.set(tmpV.x, tmpV.z).normalize();
  sun.position.copy(focus).addScaledVector(tmpV, 60); sun.target.position.copy(focus);
  if (L.fillI) { const fa = rx(L.fillAz ?? 135), fe = rx(L.fillEl ?? 20); fill.position.copy(focus).add(scratch.set(Math.cos(fe) * Math.cos(fa), Math.sin(fe), Math.cos(fe) * Math.sin(fa)).multiplyScalar(50)); fill.target.position.copy(focus); }
  const ext = L.shadowExt || 10, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
}
const scratch = new THREE.Vector3();
function worldState(Wd, f) {
  for (const k in SETS) SETS[k].visible = k === Wd.set;
  sea.visible = !!Wd.sea; if (Wd.sea) { sea.position.y = Wd.sea.y || 0; seaU.amp.value = Wd.sea.amp ?? 0.3; }
  seaU.t.value = f / 30;
  // reset + apply dynamic transforms
  for (const k in DYN) { const o = DYN[k]; if (!o || !o.userData || !o.userData.base) continue; const b = o.userData.base; o.position.copy(b.p); o.rotation.copy(b.r); o.scale.copy(b.s); o.visible = b.v; }
  for (const [k, v] of Object.entries(Wd.dyn || {})) { const o = DYN[k]; if (!o) continue;
    if (v.p) o.position.set(...v.p); if (v.dp) o.position.add(scratch.set(...v.dp)); if (v.r) o.rotation.set(...v.r); if (v.s !== undefined) (Array.isArray(v.s) ? o.scale.set(...v.s) : o.scale.setScalar(v.s)); if (v.v !== undefined) o.visible = v.v; }
  // lamp follows the bulb of the hanging/desk lamp
  if (Wd.lampAt) { const b = DYN[Wd.lampAt]; b.updateWorldMatrix(true, false); b.getWorldPosition(lamp.position); if (Wd.lampOffset) lamp.position.add(scratch.set(...Wd.lampOffset)); }
  if (Wd.bulbOn !== undefined) { for (const n of ['bulbR', 'bulbD']) if (DYN[n]) DYN[n].material.color.set(Wd.bulbOn ? '#fff3c8' : '#5a5040'); }
  if (DYN.foamRingMesh) { DYN.foamRingMesh.material.opacity = Wd.foamRing || 0; DYN.foamRingMesh.visible = !!Wd.foamRing; }
  if (DYN.sigLamp) DYN.sigLamp.material.color.set(Wd.sig ? '#ffe9a8' : '#3a3020');
  // pointer stick between two points
  if (Wd.stick) { const st = DYN.stick, A = new THREE.Vector3(...Wd.stick.a), B = new THREE.Vector3(...Wd.stick.b), d = B.clone().sub(A), L = d.length();
    st.visible = true; st.position.copy(A).addScaledVector(d, 0.5); st.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); st.scale.set(1, L / 1.5, 1); }
  // chain links along a sagging curve
  if (Wd.chain) { const { a, b, sag = 0.06, n = 18 } = Wd.chain; DYN.links.forEach((l, i) => { const t = i / (DYN.links.length - 1), on = i < n; l.visible = on && Wd.set === 'case';
      l.position.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + 0.012 + Math.sin(t * Math.PI) * sag * 0.2, a[2] + (b[2] - a[2]) * t - Math.sin(t * Math.PI) * sag);
      l.rotation.set(Math.PI / 2 * (i % 2), Math.atan2(b[0] - a[0], b[2] - a[2]), 0); }); }
}

function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  heads.forEach((h) => { h.grp.visible = false; });
  let hi = 0;
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw, a.inflate, !!a.flat);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    let s = a.s || 1;
    if (a.towardCam) { // slide the card toward the camera along the view rays and shrink it: same picture on screen, but in front of the 3D head
      const d0 = cam.position.distanceTo(scratch.set(a.x, a.y + 1.5 * s, a.z)), k = Math.max(0.2, (d0 - a.towardCam) / d0);
      c.mesh.position.set(a.x, a.y, a.z).sub(cam.position).multiplyScalar(k).add(cam.position); s *= k; }
    c.mesh.geometry = c.igeo || (a.flat ? flatGeo : cardGeo);
    if (a.flat) { c.mesh.rotation.order = 'YXZ'; c.mesh.rotation.set(-Math.PI / 2 + (a.tiltX || 0), a.spin || 0, a.roll || 0); c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s); }
    else { c.mesh.rotation.order = 'XYZ'; c.mesh.scale.set(s * (a.flip ? -1 : 1), s * (a.sy || 1), s); c.mesh.rotation.set(0, a.fixedYaw ?? (Math.atan2(cam.position.x - c.mesh.position.x, cam.position.z - c.mesh.position.z) + (a.yaw || 0)), a.roll || 0); }
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1; c.mat.transparent = true;
    c.mat.blending = a.add ? THREE.AdditiveBlending : THREE.NormalBlending; c.mat.depthWrite = !a.add; c.mat.fog = a.fog !== false;
    c.mesh.userData.ndSkip = !!a.add || !!a.noInk;
    c.mesh.castShadow = a.shadow !== false && !a.add;
    c.mesh.renderOrder = a.order || 2;
    if (a.head3d) placeHead(getHead(hi++), a, c.mesh.rotation.y, s);
    if (a.blob !== false && !a.flat && a.ground !== undefined) { c.blob.visible = true; c.blob.position.set(a.x, a.ground + 0.012, a.z); c.blob.scale.set(0.95 * s, 0.6 * s, 1); }
  });
}

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

function renderInto(f, target) {
  const S = ST.shotAt(f), L = ST.lightFor(S, f), C = ST.camAt(f);
  applyLight(L);
  camera.position.set(...C.pos);
  const billboardFrom = { position: camera.position.clone() };
  const ORB = parseFloat(((typeof location !== 'undefined' && location.hash.match(/orbit=(-?\d+)/)) || [])[1] || 0); // debug: look from the side while the cast keeps facing the shot camera
  if (ORB) { const L0 = new THREE.Vector3(...C.look), d = camera.position.clone().sub(L0); d.applyAxisAngle(new THREE.Vector3(0, 1, 0), rx(ORB)); camera.position.copy(L0).add(d); }
  camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const Wd = ST.worldAt(f); worldState(Wd, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...ST.actorsAt(f, T), ...ST.fxAt(f, T)], ORB ? billboardFrom : camera);
  sky.position.copy(camera.position);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  const D = ST.dofAt(f);
  inkU.px.value = 2.4; inkU.flash.value = C.flash || 0; inkU.fade.value = C.fade || 0; inkU.vig.value = L.vig ?? 0.24; inkU.seed.value = (f * 7.31) % 97;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(target); renderer.render(dofScene, fsCam);
}

window.renderFrame = (f) => {
  const X = (ST.XFADE || []).find((x) => f >= x.a && f <= x.b);
  if (!X) { ST.setForce(null); renderInto(f, null); return true; }
  ST.setForce(X.from); renderInto(f, rtA); ST.setForce(X.to); renderInto(f, rtB); ST.setForce(null);
  mixU.k.value = (f - X.a + 0.5) / (X.b - X.a + 1);
  renderer.setRenderTarget(null); renderer.render(mixScene, fsCam);
  return true;
};
window.TOTAL = ST.TOTAL;
window.ready = true;
