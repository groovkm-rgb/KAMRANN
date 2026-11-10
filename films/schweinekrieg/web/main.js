import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { G, P as PL, hAt, eAt, forestAt } from './places.js';
import { TOTAL, shotAt, camAt, dofAt, lightFor, actorsAt, worldAt, fxAt } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 2600);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
// painted textures for this world (no lettering anywhere)
const logsTex = (() => { const [c, g] = cv(256, 256), r = P.rng(3); for (let i = 0; i < 8; i++) { const y = i * 32, L = 36 + r() * 8;
  const gr = g.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, `hsl(28,38%,${L + 10}%)`); gr.addColorStop(0.5, `hsl(27,40%,${L}%)`); gr.addColorStop(1, `hsl(25,42%,${L - 14}%)`);
  g.fillStyle = gr; g.fillRect(0, y, 256, 32); g.strokeStyle = 'rgba(40,24,14,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, y + 31); g.lineTo(256, y + 31); g.stroke();
  for (let k = 0; k < 6; k++) { g.strokeStyle = `rgba(60,36,20,${0.25 + r() * 0.3})`; g.lineWidth = 1; g.beginPath(); const yy = y + 6 + r() * 20; g.moveTo(r() * 60, yy); g.lineTo(100 + r() * 156, yy + r() * 3 - 1.5); g.stroke(); } }
  return c; })();
const barnTex = (() => { const [c, g] = cv(256, 256), r = P.rng(5); for (let i = 0; i < 8; i++) { g.fillStyle = `hsl(6,${42 + r() * 10}%,${34 + r() * 6}%)`; g.fillRect(i * 32, 0, 32, 256); g.fillStyle = 'rgba(30,10,8,.85)'; g.fillRect(i * 32, 0, 3, 256);
  for (let k = 0; k < 5; k++) { g.strokeStyle = 'rgba(60,16,12,.35)'; g.lineWidth = 1.5; g.beginPath(); const x = i * 32 + 6 + r() * 22; g.moveTo(x, 0); g.lineTo(x + r() * 4 - 2, 256); g.stroke(); } } return c; })();
const shingleTex = (() => { const [c, g] = cv(256, 256), r = P.rng(7); for (let row = 0; row < 8; row++) for (let i = 0; i < 9; i++) { const x = i * 32 - (row % 2) * 16, y = row * 32; g.fillStyle = `hsl(25,${22 + r() * 10}%,${30 + r() * 10}%)`; g.fillRect(x, y, 31, 31); g.fillStyle = 'rgba(20,12,8,.6)'; g.fillRect(x, y + 28, 32, 4); g.fillRect(x + 30, y, 2, 32); } return c; })();
const canvasTex = (base) => { const [c, g] = cv(128, 128), r = P.rng(9); g.fillStyle = base; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.06})`; g.fillRect(r() * 128, r() * 128, 2, 2); } for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(i * 16, 0, 1, 128); } return c; };
const marbleChk = (() => { const [c, g] = cv(256, 256); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#e8dcc6' : '#8a2d2f'; g.fillRect(i * 128, j * 128, 128, 128); } const r = P.rng(4); g.strokeStyle = 'rgba(255,255,255,.18)'; for (let k = 0; k < 30; k++) { g.beginPath(); g.moveTo(r() * 256, r() * 256); g.bezierCurveTo(r() * 256, r() * 256, r() * 256, r() * 256, r() * 256, r() * 256); g.stroke(); } return c; })();
const damask = (() => { const [c, g] = cv(256, 256); g.fillStyle = '#e9d39a'; g.fillRect(0, 0, 256, 256); g.fillStyle = 'rgba(190,140,50,.35)';
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = i * 64 + 32 + (j % 2) * 32, y = j * 64 + 32; g.beginPath(); g.ellipse(x, y, 12, 20, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, y, 22, 6, 0, 0, 7); g.fill(); } return c; })();
const carpetTex = (() => { const [c, g] = cv(128, 512); g.fillStyle = '#a3202a'; g.fillRect(0, 0, 128, 512); g.fillStyle = '#e1b84c'; g.fillRect(6, 0, 8, 512); g.fillRect(114, 0, 8, 512); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < 512; y += 32) { g.beginPath(); g.moveTo(64, y); g.lineTo(80, y + 16); g.lineTo(64, y + 32); g.lineTo(48, y + 16); g.fill(); } return c; })();
const M = {
  logs: toon({ map: P.tex(logsTex, 1, 1) }), barn: toon({ map: P.tex(barnTex, 1, 1) }), shingle: toon({ map: P.tex(shingleTex, 2, 2) }),
  plank: toon({ map: P.tex(P.planks(1), 1, 1) }), stone: toon({ map: P.tex(P.stone(4), 1, 1) }), dirt: toon({ map: P.tex(P.dirt(7), 4, 4) }),
  wood: toon({ color: '#7a5434' }), woodD: toon({ color: '#5a3a24' }), door: toon({ color: '#5a3a24' }), window: toon({ color: '#2b3040' }), frame: toon({ color: '#e8e0cc' }),
  iron: toon({ color: '#3a3a40' }), bronze: toon({ color: '#9a7a3c' }), black: toon({ color: '#22222a' }), sail: toon({ color: '#efe6cf', side: THREE.DoubleSide }),
  hull: toon({ color: '#4d3c30' }), band: toon({ color: '#2f7a48' }), deck: toon({ map: P.tex(P.planks(11), 1, 1), color: '#e8d2b0' }), gold: toon({ color: '#d9ad45' }),
  tentA: toon({ map: P.tex(canvasTex('#34497e')) }), tentB: toon({ map: P.tex(canvasTex('#2f6a42')) }), tentIn: toon({ color: '#1a1a22' }),
  leaf: toon({ color: '#4f8a38' }), potato: toon({ color: '#b98a50' }), mud: toon({ color: '#6a4a2c' }), rock: toon({ color: '#8a8a86' }), rockD: toon({ color: '#6c6c6a' }),
  flagA: toon({ color: '#3a5fb0', side: THREE.DoubleSide }), flagB: toon({ color: '#2f8a4a', side: THREE.DoubleSide }), white: toon({ color: '#ffffff' }), cloud: toon({ color: '#ffffff' }),
  marble: toon({ map: P.tex(marbleChk, 8, 14) }), damask: toon({ map: P.tex(damask, 4, 2) }), carpet: toon({ map: P.tex(carpetTex, 1, 6) }), velvet: toon({ color: '#9e1e2a' }),
  cream: toon({ color: '#f1e6cc' }), ceiling: toon({ color: '#efe0b8' }), drape: toon({ color: '#8e1c26', side: THREE.DoubleSide }), glow: new THREE.MeshBasicMaterial({ color: '#fff3c0' }),
  table: toon({ color: '#6b3e22' }), cloth: toon({ color: '#2f4a3a' }),
};
M.shingle.map.repeat.set(2, 2);

// ---------- ink / normal-depth contract (instancing aware) ----------
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
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
const waterNd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
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
const cyl = (r0, r1, h, n = 12) => new THREE.CylinderGeometry(r0, r1, h, n);
const group = (x = 0, y = 0, z = 0, ry = 0, parent = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
const prism = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; };

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
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
// ISLAND WORLD
// =====================================================================================
const world = new THREE.Group(); scene.add(world);
// ---- terrain (vertex coloured, painterly) ----
const seasonU = { uSnow: { value: 0 }, uAutumn: { value: 0 }, uGold: { value: 0 } };
const terrain = (() => {
  const SX = 360, SZ = 240, NX = 300, NZ = 200;
  const geo = new THREE.PlaneGeometry(SX, SZ, NX, NZ); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color(), r = P.rng(21);
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, hAt(x, z)); }
  geo.computeVertexNormals();
  const nrm = geo.attributes.normal;
  const grassA = new THREE.Color('#6fa34a'), grassB = new THREE.Color('#5d9440'), meadow = new THREE.Color('#8fb85a'), sand = new THREE.Color('#e3cf98'), rock = new THREE.Color('#8b8a84'), rockD = new THREE.Color('#6d6c6a'), sea = new THREE.Color('#4b7f86'), forest = new THREE.Color('#3f6f34');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), up = nrm.getY(i);
    const n = Math.sin(x * 0.21 + z * 0.13) * Math.cos(z * 0.17 - x * 0.07) * 0.5 + 0.5;
    c.copy(grassA).lerp(grassB, n);
    const fo = forestAt(x, z); c.lerp(forest, Math.min(1, fo * 0.9));
    const mead = Math.exp(-((x - PL.farm[0]) ** 2 + (z - PL.farm[1]) ** 2) / 900) + Math.exp(-((x - PL.knoll[0]) ** 2 + (z - PL.knoll[1]) ** 2) / 500);
    c.lerp(meadow, Math.min(0.6, mead));
    if (y < 0.9) c.lerp(sand, Math.min(1, (0.9 - y) / 0.6));
    if (y < -0.6) c.lerp(sea, Math.min(1, (-0.6 - y) / 2.5));
    if (up < 0.82 && y > -0.5) c.lerp(n > 0.5 ? rock : rockD, Math.min(1, (0.82 - up) / 0.18));
    c.offsetHSL(0, 0, (r() - 0.5) * 0.025);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = toon({ vertexColors: true });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, seasonU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vUpW;').replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvUpW = normalize(mat3(modelMatrix)*objectNormal).y;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vUpW; uniform float uSnow, uAutumn, uGold;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float gr = smoothstep(.05,.2, diffuseColor.g - max(diffuseColor.r, diffuseColor.b));
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb*vec3(1.55,1.0,.45), uAutumn*gr);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.95,.97,1.), uSnow*smoothstep(.55,.8,vUpW));
        diffuseColor.rgb *= mix(vec3(1.), vec3(1.12,.98,.8), uGold);`);
  };
  const m = add(geo, mat, 0, 0, 0, world, { cast: true }); return m;
})();
// ---- sea with shore foam ----
const HT = 256, HB = [-180, -120, 360, 240]; // height texture over the island box
const hTex = (() => { const d = new Uint8Array(HT * HT * 4); for (let j = 0; j < HT; j++) for (let i = 0; i < HT; i++) { const x = HB[0] + (i + 0.5) / HT * HB[2], z = HB[1] + (j + 0.5) / HT * HB[3]; const h = hAt(x, z); const k = Math.max(0, Math.min(255, Math.round((h + 10) / 20 * 255))); d.set([k, k, k, 255], (j * HT + i) * 4); }
  const t = new THREE.DataTexture(d, HT, HT); t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t; })();
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') }, hmap: { value: hTex }, hb: { value: new THREE.Vector4(...HB) } };
const waterMat = new THREE.ShaderMaterial({
  uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...waterU }, fog: true,
  vertexShader: `#include <fog_pars_vertex>
    varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform float t; uniform vec3 deep, shal, glint; uniform sampler2D hmap; uniform vec4 hb; varying vec3 vW;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
    void main(){
      vec2 uv = (vW.xz - hb.xy)/hb.zw; float hh = -10.;
      if (uv.x>0. && uv.x<1. && uv.y>0. && uv.y<1.) hh = texture2D(hmap, uv).r*20.-10.;
      vec2 p = vW.xz*.09 + vec2(t*.05, -t*.08);
      float n = noise(p)*.6 + noise(p*2.3+7.)*.4;
      float sh = smoothstep(-7., -.5, hh);
      vec3 c = mix(deep, shal, .25 + .35*n + .6*sh);
      float streak = smoothstep(.8, .86, noise(vW.xz*vec2(.35,.05) + vec2(t*.05, -t*.12))) * smoothstep(.45,.7, noise(vW.xz*.02+3.));
      c = mix(c, glint, streak*.35*(1.-sh));
      float band = smoothstep(-1.5, -.9, hh) * (1.-smoothstep(-.35, .2, hh));
      float wav = .5+.5*sin(hh*9. - t*2.4 + noise(vW.xz*.3)*4.);
      c = mix(c, vec3(.96,.98,1.), band*(.45+.55*wav)*.9);
      gl_FragColor = vec4(c,1.);
      #include <fog_fragment>
    }`,
});
const water = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), waterMat); water.rotation.x = -Math.PI / 2; water.position.y = 0;
water.userData.nd = waterNd; water.receiveShadow = false; scene.add(water);
// distant islands on the horizon
{ const r = P.rng(77); const fm = toon({ color: '#5f8a6a' }), fm2 = toon({ color: '#7a9a88' });
  for (let i = 0; i < 9; i++) { const a = -0.4 + i * 0.75 + r() * 0.3, d = 520 + r() * 420; const g = group(Math.cos(a) * d, 0, Math.sin(a) * d, r() * 6, world);
    const s = 30 + r() * 60; const h = add(new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? fm : fm2, 0, -1, 0, g, { cast: false }); h.scale.set(s * (1.6 + r()), s * 0.35, s);
    const h2 = add(new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? fm2 : fm, s * 0.6, -1, s * 0.2, g, { cast: false }); h2.scale.set(s * 0.8, s * 0.45, s * 0.7); } }
// rocks along the shore
{ const r = P.rng(55); const geo = new THREE.DodecahedronGeometry(1, 0);
  const im = new THREE.InstancedMesh(geo, M.rock, 260); let k = 0; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < 4000 && k < 260; i++) { const x = (r() - 0.5) * 340, z = (r() - 0.5) * 220, ee = eAt(x, z); if (ee < -0.015 || ee > 0.03) continue; if (Math.hypot(x - PL.beach[0], z - PL.beach[1]) < 16) continue;
    const s = 0.8 + r() * 2.6, y = Math.max(hAt(x, z), -0.6); e.set(r() * 3, r() * 3, r() * 3); q.setFromEuler(e); m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s * (0.6 + r() * 0.5), s)); im.setMatrixAt(k++, m4); }
  im.count = k; im.castShadow = true; im.receiveShadow = true; world.add(im); }
// ---- trees (instanced): pines + round broadleaf trees that change with the seasons ----
const trees = (() => {
  const r = P.rng(44), pines = [], leafy = [];
  for (let i = 0; i < 26000 && pines.length < 1400; i++) { const x = (r() - 0.5) * 330, z = (r() - 0.5) * 210, fo = forestAt(x, z); if (r() > fo * 0.9) continue; if (hAt(x, z) < 1.2) continue; pines.push([x, z, 5 + r() * 6, r()]); }
  const nearFarm = [[-30, -20], [-28, 14], [26, -22], [30, 16], [-6, -26], [16, -28], [-36, -4], [36, 2], [-16, 24], [22, 26], [-62, 34], [-80, 0], [80, -26], [118, 10]];
  for (const [x, z] of nearFarm) for (let k = 0; k < 3; k++) leafy.push([x + (r() - 0.5) * 8, z + (r() - 0.5) * 8, 4 + r() * 2.5, r()]);
  for (let i = 0; i < 6000 && leafy.length < 260; i++) { const x = (r() - 0.5) * 300, z = (r() - 0.5) * 190, fo = forestAt(x, z); if (fo < 0.15 || fo > 0.6 || r() > 0.2) continue; if (hAt(x, z) < 1.2) continue; leafy.push([x, z, 4 + r() * 3, r()]); }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), V = (x, y, z) => new THREE.Vector3(x, y, z);
  const trunkI = new THREE.InstancedMesh(cyl(0.18, 0.28, 1, 6), toon({ color: '#5e4430' }), pines.length + leafy.length);
  const coneGeo = new THREE.ConeGeometry(1, 1, 8);
  const pineM = toon({ color: '#ffffff' }), ballM = toon({ color: '#ffffff' });
  const cone = [0, 1, 2].map(() => new THREE.InstancedMesh(coneGeo, pineM, pines.length));
  const ball = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), ballM, leafy.length * 2);
  const pineCols = [], ballCols = [];
  pines.forEach(([x, z, h, v], i) => { const y = hAt(x, z) - 0.2;
    m4.compose(V(x, y + h * 0.15, z), q, V(1, h * 0.3, 1)); trunkI.setMatrixAt(i, m4);
    for (let k = 0; k < 3; k++) { const rr = (1 - k * 0.27) * h * 0.3, yy = y + h * (0.32 + k * 0.22); m4.compose(V(x, yy, z), q, V(rr, h * 0.36, rr)); cone[k].setMatrixAt(i, m4); }
    pineCols.push(new THREE.Color().setHSL(0.3 + v * 0.05, 0.42, 0.26 + v * 0.07)); });
  leafy.forEach(([x, z, h, v], i) => { const y = hAt(x, z) - 0.2; m4.compose(V(x, y + h * 0.3, z), q, V(1.2, h * 0.6, 1.2)); trunkI.setMatrixAt(pines.length + i, m4);
    m4.compose(V(x, y + h * 0.8, z), q, V(h * 0.42, h * 0.38, h * 0.42)); ball.setMatrixAt(i * 2, m4);
    m4.compose(V(x + h * 0.18, y + h * 0.98, z - h * 0.1), q, V(h * 0.3, h * 0.27, h * 0.3)); ball.setMatrixAt(i * 2 + 1, m4);
    const c = new THREE.Color().setHSL(0.24 + v * 0.06, 0.45, 0.38 + v * 0.06); ballCols.push(c, c); });
  for (const im of [trunkI, ...cone, ball]) { im.castShadow = true; im.receiveShadow = true; world.add(im); }
  const season = (s) => { // s: {snow, autumn, bloom}
    const c = new THREE.Color(), snow = new THREE.Color('#f4f7fb'), pink = new THREE.Color('#f5a9c4'), orange = new THREE.Color('#e08a2c'), bare = new THREE.Color('#9a7a5a');
    for (let k = 0; k < 3; k++) for (let i = 0; i < pines.length; i++) { c.copy(pineCols[i]).lerp(snow, s.snow * (0.55 + k * 0.15)); cone[k].setColorAt(i, c); }
    for (let i = 0; i < ballCols.length; i++) { c.copy(ballCols[i]).lerp(pink, s.bloom).lerp(orange, s.autumn * (0.7 + 0.3 * ((i * 7) % 5) / 5)).lerp(bare, s.snow * 0.5).lerp(snow, s.snow * 0.55); ball.setColorAt(i, c); }
    for (const im of [...cone, ball]) im.instanceColor.needsUpdate = true;
  };
  season({ snow: 0, autumn: 0, bloom: 0 });
  return { season };
})();

// ---- pennant flags (single colour, no symbols) ----
const flags = [];
const pennantGeo = () => { const g = new THREE.PlaneGeometry(2.4, 0.9, 12, 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + 1.2, t = x / 2.4; p.setX(i, x); p.setY(i, p.getY(i) * (1 - t * 0.92)); } g.userData.base = p.array.slice(); return g; };
const flagPole = (x, z, mat, h = 7, parent = world, s = 1, y0) => {
  const g = group(x, y0 ?? hAt(x, z), z, 0, parent); g.scale.setScalar(s);
  add(cyl(0.06, 0.08, h, 8), M.wood, 0, h / 2, 0, g); add(new THREE.SphereGeometry(0.14, 10, 8), M.gold, 0, h + 0.1, 0, g);
  const cloth = add(pennantGeo(), mat, 0.02, h - 0.55, 0, g); cloth.material = mat; flags.push(cloth); return g;
};
// ---- buildings ----
const cabin = (x, z, ry, w = 7, d = 5.5, h = 3.2, parent = world, flagMat = null) => {
  const y = hAt(x, z), g = group(x, y, z, ry, parent);
  const wall = (ww, hh, dd, px, pz, rot) => { const m = add(tbox(ww, hh, dd, 2.2), M.logs, px, hh / 2, pz, g); m.rotation.y = rot; return m; };
  wall(w, h, 0.4, 0, d / 2, 0); wall(w, h, 0.4, 0, -d / 2, 0); wall(d, h, 0.4, -w / 2, 0, Math.PI / 2); wall(d, h, 0.4, w / 2, 0, Math.PI / 2);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 6; k++) { const lg = add(cyl(0.2, 0.2, 0.8, 8), M.logs, sx * (w / 2 + 0.05), 0.3 + k * 0.54, sz * (d / 2 + 0.2), g); lg.rotation.x = Math.PI / 2; }
  const gab = add(prism(d + 0.4, 2.0, 0.4), M.logs, -w / 2, h, 0, g); gab.rotation.y = Math.PI / 2; const gab2 = add(prism(d + 0.4, 2.0, 0.4), M.logs, w / 2, h, 0, g); gab2.rotation.y = Math.PI / 2;
  for (const s of [-1, 1]) { const rf = add(tbox(w + 1.2, 0.22, d / 2 + 1.0, 2), M.shingle, 0, h + 1.0, s * (d / 4 + 0.25), g); rf.rotation.x = s * Math.atan2(2.0, d / 2 + 0.2); }
  add(tbox(0.9, 4.2, 0.9, 1.4), M.stone, w / 2 - 1.2, h + 0.8, -0.8, g);
  add(box(1.0, 2.0, 0.12), M.door, 0.9, 1.0, d / 2 + 0.22, g, { cast: false });
  for (const sx of [-1.9]) { add(box(1.2, 1.0, 0.12), M.window, sx, 1.7, d / 2 + 0.22, g, { cast: false }); add(box(1.4, 0.12, 0.16), M.frame, sx, 1.14, d / 2 + 0.24, g, { cast: false }); add(box(0.08, 1.0, 0.15), M.frame, sx, 1.7, d / 2 + 0.25, g, { cast: false }); add(box(1.2, 0.08, 0.15), M.frame, sx, 1.7, d / 2 + 0.25, g, { cast: false }); }
  // porch
  add(tbox(w, 0.18, 1.6, 1), M.plank, 0, 0.09, d / 2 + 1.0, g); for (const sx of [-w / 2 + 0.2, w / 2 - 0.2]) add(cyl(0.1, 0.1, 2.6, 8), M.wood, sx, 1.3, d / 2 + 1.7, g);
  const pr = add(tbox(w + 0.2, 0.14, 1.9, 2), M.shingle, 0, 2.55, d / 2 + 0.95, g); pr.rotation.x = 0.22;
  // wall hooks + a long rifle hanging on the porch wall (taken down in the story)
  const rifle = group(-0.9, 2.15, d / 2 + 0.26, 0, g); add(box(1.6, 0.06, 0.05), M.iron, 0.3, 0, 0, rifle); add(box(0.9, 0.14, 0.08), M.woodD, -0.75, -0.03, 0, rifle);
  g.userData.rifle = rifle;
  return g;
};
const barn = (x, z, ry, parent = world) => {
  const y = hAt(x, z), g = group(x, y, z, ry, parent), w = 8, d = 7, h = 4;
  add(tbox(w, h, d, 3), M.barn, 0, h / 2, 0, g);
  for (const s of [-1, 1]) { const gb = add(prism(d, 2.8, 0.3), M.barn, s * (w / 2 - 0.1), h, 0, g); gb.rotation.y = Math.PI / 2; const rf = add(tbox(w + 0.8, 0.22, d / 2 + 1.1, 2), M.shingle, 0, h + 1.4, s * (d / 4 + 0.3), g); rf.rotation.x = s * Math.atan2(2.8, d / 2); }
  const dr = group(0, 0, d / 2 + 0.05, 0, g); add(box(3, 3, 0.12), toon({ color: '#7a2a22' }), 0, 1.5, 0, dr);
  for (const s of [-1, 1]) { const b = add(box(4.0, 0.16, 0.08), M.frame, 0, 1.5, 0.08, dr); b.rotation.z = s * Math.atan2(3, 3); }
  add(box(3.2, 0.16, 0.08), M.frame, 0, 3.0, 0.08, dr); add(box(3.2, 0.16, 0.08), M.frame, 0, 0.05, 0.08, dr);
  add(box(1.0, 1.0, 0.1), M.window, 0, h + 1.0, d / 2 + 0.05, g, { cast: false });
  return g;
};
const fenceLine = (pts, parent = world, h = 1.15, mat = M.wood) => {
  for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.4));
    for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, z = z0 + (z1 - z0) * k / n; add(box(0.16, h, 0.16), mat, x, hAt(x, z) + h / 2, z, parent); }
    for (const yy of [0.45, 0.95]) { const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; const rail = add(box(L, 0.1, 0.08), mat, mx, hAt(mx, mz) + yy * h, mz, parent); rail.rotation.y = -Math.atan2(z1 - z0, x1 - x0); } }
};
const farm = group(0, 0, 0, 0, world);
const cabinA = cabin(PL.cabinA[0], PL.cabinA[1], 0, 7, 5.5, 3.2, farm), cabinB = cabin(PL.cabinB[0], PL.cabinB[1], 0, 7.5, 5.8, 3.3, farm);
cabinB.userData.rifle.visible = false;
barn(PL.barnA[0], PL.barnA[1], Math.PI / 2, farm); barn(PL.barnB[0], PL.barnB[1], -Math.PI / 2, farm);
fenceLine([[0, -18], [0, 16]], farm);
fenceLine([[PL.pen[0] - 3, PL.pen[1] - 3], [PL.pen[0] + 3, PL.pen[1] - 3], [PL.pen[0] + 3, PL.pen[1] + 3], [PL.pen[0] - 3, PL.pen[1] + 3], [PL.pen[0] - 3, PL.pen[1] - 3]], farm, 0.9);
{ const m = add(new THREE.CircleGeometry(2.4, 20), M.mud, PL.pen[0], hAt(PL.pen[0], PL.pen[1]) + 0.04, PL.pen[1], farm, { cast: false }); m.rotation.x = -Math.PI / 2; m.scale.y = 0.8;
  add(tbox(1.6, 0.4, 0.6, 1), M.woodD, PL.pen[0] + 1.6, hAt(PL.pen[0], PL.pen[1]) + 0.2, PL.pen[1] - 1.8, farm); }
flagPole(PL.flagA[0], PL.flagA[1], M.flagA, 6.5, farm); flagPole(PL.flagB[0], PL.flagB[1], M.flagB, 6.5, farm);
// potato field
{ const [x0, x1, z0, z1] = PL.field, y = G + 0.02;
  const pl = add(new THREE.PlaneGeometry(x1 - x0, z1 - z0), M.dirt, (x0 + x1) / 2, hAt((x0 + x1) / 2, (z0 + z1) / 2) + 0.03, (z0 + z1) / 2, farm, { cast: false }); pl.rotation.x = -Math.PI / 2;
  const rows = []; for (let x = x0 + 0.8; x < x1 - 0.4; x += 1.25) rows.push(x);
  const leafI = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M.leaf, rows.length * 40), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); let k = 0; const r = P.rng(8);
  for (const x of rows) { const ridge = add(cyl(0.38, 0.38, z1 - z0 - 0.6, 8), M.dirt, x, hAt(x, (z0 + z1) / 2) - 0.12, (z0 + z1) / 2, farm); ridge.rotation.x = Math.PI / 2; ridge.scale.set(1, 1, 0.6);
    for (let z = z0 + 0.6; z < z1 - 0.4; z += 0.7) { if (Math.hypot(x + 7.6, z - 2.8) < 2.6 || Math.hypot(x + 6.1, z + 0.6) < 1.6) { r(); r(); r(); r(); r(); continue; } const s = 0.32 + r() * 0.12; m4.compose(new THREE.Vector3(x + (r() - 0.5) * 0.15, hAt(x, z) + 0.32, z), q.setFromEuler(new THREE.Euler(r(), r() * 3, r())), new THREE.Vector3(s, s * 0.75, s)); leafI.setMatrixAt(k++, m4); } }
  leafI.count = k; leafI.castShadow = true; farm.add(leafI);
  // dug-up holes + loose potatoes near the pig spot
  for (let i = 0; i < 7; i++) { const x = -8 + (r() - 0.5) * 3, z = 3 + (r() - 0.5) * 3; add(new THREE.SphereGeometry(0.16, 8, 6), M.potato, x, hAt(x, z) + 0.12, z, farm).scale.set(1.3, 0.9, 1); }
}
// ---- the centre knoll (flags get planted here) ----
// ---- rowboats on the landing beach ----
const rowboat = (x, z, ry, parent = world) => { const g = group(x, 0.05, z, ry, parent); const s = new THREE.Shape(); s.moveTo(-2.4, 0); s.quadraticCurveTo(-2.4, 1.0, 0, 1.0); s.quadraticCurveTo(2.0, 1.0, 2.9, 0); s.quadraticCurveTo(2.0, -1.0, 0, -1.0); s.quadraticCurveTo(-2.4, -1.0, -2.4, 0);
  const hull = add(new THREE.ExtrudeGeometry(s, { depth: 0.8, bevelEnabled: false }), toon({ color: '#6a4a30' }), 0, 0.85, 0, g); hull.rotation.x = Math.PI / 2;
  for (const xx of [-1, 0.6]) add(box(0.3, 0.08, 1.8), M.wood, xx, 0.55, 0, g); return g; };
const landing = group(0, 0, 0, 0, world);
rowboat(PL.beach[0] - 6, PL.beach[1] + 8, 1.2, landing); rowboat(PL.beach[0] + 5, PL.beach[1] + 9, 1.9, landing); rowboat(PL.beach[0] - 1, PL.beach[1] + 14, 1.6, landing);
// ---- cannons ----
const cannon = (x, z, ry, parent = world, y0) => {
  const g = group(x, y0 ?? hAt(x, z), z, ry, parent);
  const wheel = (s) => { const w = group(0, 0.75, s * 0.75, 0, g); const rim = add(new THREE.TorusGeometry(0.72, 0.07, 8, 24), M.woodD, 0, 0, 0, w); add(cyl(0.14, 0.14, 0.3, 10), M.iron, 0, 0, 0, w).rotation.x = Math.PI / 2;
    for (let k = 0; k < 6; k++) { const sp = add(box(0.07, 1.4, 0.06), M.wood, 0, 0, 0, w); sp.rotation.z = k * Math.PI / 6; } return w; };
  g.userData.wheels = [wheel(-1), wheel(1)];
  add(box(0.5, 0.35, 1.2), M.woodD, -0.1, 0.85, 0, g); const trail = add(box(2.4, 0.22, 0.34), M.woodD, -1.2, 0.5, 0, g); trail.rotation.z = 0.32;
  const barrel = add(cyl(0.2, 0.28, 2.6, 14), M.bronze, 0.5, 1.12, 0, g); barrel.rotation.z = Math.PI / 2 - 0.08;
  add(new THREE.SphereGeometry(0.26, 12, 8), M.bronze, -0.78, 1.15, 0, g); add(new THREE.TorusGeometry(0.22, 0.05, 6, 16), M.bronze, 1.8, 1.22, 0, g).rotation.y = Math.PI / 2;
  g.userData.muzzle = new THREE.Vector3(1.82, 1.24, 0);
  return g;
};
// ---- camps ----
const tent = (x, z, ry, mat, parent, s = 1) => { const g = group(x, hAt(x, z), z, ry, parent); g.scale.setScalar(s); add(prism(2.6, 2.1, 3.2), mat, 0, 0, 0, g); add(prism(1.0, 1.2, 0.05), M.tentIn, 0, 0, 1.62, g, { cast: false }); add(cyl(0.04, 0.04, 2.6, 6), M.wood, 0, 1.3, 1.65, g); return g; };
const stack = (x, z, parent) => { const g = group(x, hAt(x, z), z, 0, parent); for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3, rf = group(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32, 0, g); const b = add(cyl(0.03, 0.03, 1.9, 5), M.iron, 0, 0.95, 0, rf); b.rotation.set(Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18); const st = add(box(0.1, 0.6, 0.06), M.woodD, Math.cos(a) * 0.02, 0.3, Math.sin(a) * 0.02, rf); st.rotation.copy(b.rotation); } return g; };
const camp = (cx, cz, mat, flagMat, parent, seed) => {
  const r = P.rng(seed); const g = group(0, 0, 0, 0, parent);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) tent(cx - 12 + i * 5.5 + (r() - 0.5) * 0.4, cz - 8 + j * 6.2, (r() - 0.5) * 0.08, mat, g);
  for (let i = 0; i < 4; i++) stack(cx - 9 + i * 5.5, cz + 11, g);
  flagPole(cx + 12, cz + 4, flagMat, 9, g);
  // guard hut (logs)
  cabin(cx + 14, cz - 8, -0.3, 3.4, 3, 2.6, g).userData.rifle.visible = false;
  // camp fire ring
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; add(new THREE.DodecahedronGeometry(0.25, 0), M.rock, cx + 4 + Math.cos(a) * 0.8, hAt(cx + 4, cz + 4) + 0.1, cz + 4 + Math.sin(a) * 0.8, g); }
  return g;
};
const campA = camp(PL.campA[0], PL.campA[1], M.tentA, M.flagA, world, 31), campB = camp(PL.campB[0], PL.campB[1], M.tentB, M.flagB, world, 32);
// guns on the hill above the cove (pushed up in the story) + one old gun in each camp (flowers later)
const hillGuns = [0, 1, 2].map((i) => cannon(PL.hill[0] - 3.2 + i * 3.2, PL.hill[1] + 6, -Math.PI / 2 + 0.2, world));
const oldGunA = cannon(PL.campA[0] + 6, PL.campA[1] + 15, -Math.PI / 2, world);
const oldGunB = cannon(PL.campB[0] - 8, PL.campB[1] + 14, -Math.PI / 2, world);
// ---- warships (sail + steam, ports closed) ----
const ships = [];
const ship = (parent = world) => {
  const g = group(0, 0, 0, 0, parent), L = 1;
  const s = new THREE.Shape(); s.moveTo(-17, -3.6); s.quadraticCurveTo(-19.5, 0, -17, 3.6); s.lineTo(10, 3.8); s.quadraticCurveTo(19, 2.6, 23, 0); s.quadraticCurveTo(19, -2.6, 10, -3.8); s.lineTo(-17, -3.6);
  const hull = add(new THREE.ExtrudeGeometry(s, { depth: 6.6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 2 }), M.hull, 0, 4.4, 0, g); hull.rotation.x = Math.PI / 2;
  const band = add(new THREE.ExtrudeGeometry(s, { depth: 0.9, bevelEnabled: false }), M.band, 0, 3.0, 0, g); band.rotation.x = Math.PI / 2; band.scale.set(1.012, 1.03, 1);
  for (let i = 0; i < 9; i++) for (const sd of [-1, 1]) { const x = -13 + i * 3.4, zz = sd * (x > 10 ? 3.75 - (x - 10) * 0.12 : 3.95); add(box(0.9, 0.62, 0.12), toon({ color: '#1e1a16' }), x, 2.55, zz, g, { cast: false }); }
  const deck = add(new THREE.ShapeGeometry(s), M.deck, 0, 4.45, 0, g, { cast: false }); deck.rotation.x = -Math.PI / 2; deck.scale.set(0.97, 0.94, 1);
  // bulwark rail
  const rail = add(new THREE.ExtrudeGeometry(s, { depth: 0.9, bevelEnabled: false }), M.hull, 0, 5.35, 0, g); rail.rotation.x = Math.PI / 2; rail.scale.set(1.0, 1.0, 1); rail.material = toon({ color: '#5a4636', side: THREE.BackSide });
  // masts, yards, sails
  const masts = [[-9, 24], [2.5, 28], [13, 22]];
  for (const [x, h] of masts) { add(cyl(0.28, 0.4, h, 10), M.wood, x, 4.4 + h / 2, 0, g);
    for (let k = 0; k < 3; k++) { const yy = 4.4 + h * (0.42 + k * 0.2), wd = 11 - k * 2.6;
      add(cyl(0.12, 0.12, wd, 6), M.wood, x, yy, 0, g).rotation.x = Math.PI / 2;
      const sg = new THREE.PlaneGeometry(wd * 0.95, h * 0.18, 8, 4), p = sg.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (wd * 0.48), v = p.getY(i) / (h * 0.09); p.setZ(i, 0.9 * (1 - u * u) * (1 - 0.3 * v * v)); }
      sg.computeVertexNormals(); const sail = add(sg, M.sail, x + 0.35, yy - h * 0.095, 0, g); sail.rotation.y = Math.PI / 2; } }
  add(cyl(0.18, 0.3, 12, 8), M.wood, 25, 6.5, 0, g).rotation.z = -1.2;
  // funnel
  add(cyl(1.15, 1.25, 7, 16), M.black, -3.5, 7.8, 0, g); add(cyl(1.18, 1.18, 0.6, 16), toon({ color: '#c9a24a' }), -3.5, 9.6, 0, g);
  // stern windows
  for (let k = -1; k <= 1; k++) add(box(0.12, 0.7, 0.8), toon({ color: '#f2d27a' }), -19.3, 3.5, k * 1.4, g, { cast: false });
  flagPole(0, 0, M.flagB, 4, g, 1, 4.4 + 28);
  g.userData.funnelTop = new THREE.Vector3(-3.5, 11.4, 0);
  ships.push(g); return g;
};
const fleet = [ship(), ship(), ship(), ship()];
// ---- clouds: painted billboards far away ----
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 18; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false, opacity: 0.92 }));
    const a = r() * Math.PI * 2, d = 900 + r() * 500; m.position.set(Math.cos(a) * d, 150 + r() * 260, Math.sin(a) * d); m.scale.setScalar(260 + r() * 220);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }
// ---- a puffy 3D cloud for the angel pig ----
const puffCloud = group(0, 0, 0, 0, scene);
{ const r = P.rng(12); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = 2.2 + r() * 1.4, s = 1.3 + r() * 1.1; add(new THREE.IcosahedronGeometry(1, 2), M.cloud, Math.cos(a) * rr, (r() - 0.3) * 0.8, Math.sin(a) * rr * 0.7, puffCloud, { cast: false }).scale.set(s, s * 0.72, s); }
  for (let i = 0; i < 6; i++) add(new THREE.IcosahedronGeometry(1, 2), M.cloud, (r() - 0.5) * 2.4, 0.6 + r() * 0.5, (r() - 0.5) * 1.6, puffCloud, { cast: false }).scale.setScalar(1.7 + r() * 0.6); }
puffCloud.visible = false;

// =====================================================================================
// PALACE HALL (interior set)
// =====================================================================================
const palace = group(...PL.palace, 0, scene); palace.visible = false;
const mapCanvas = (() => { const [c] = cv(600, 1000); return c; })(); const mapTex = new THREE.CanvasTexture(mapCanvas); mapTex.colorSpace = THREE.SRGBColorSpace;
const drawMap = (seal) => { const g = mapCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); const p = new T.Pen(g); T.mapArt(p, seal); mapTex.needsUpdate = true; };
let mapSeal = -1;
{ const HW = 13, HL = 22, HH = 13, pg = palace;
  const fl = add(new THREE.PlaneGeometry(HW * 2, HL * 2), M.marble, 0, 0, 0, pg, { cast: false }); fl.rotation.x = -Math.PI / 2;
  const cp = add(new THREE.PlaneGeometry(4.2, HL * 2 - 4), M.carpet, 0, 0.02, 2, pg, { cast: false }); cp.rotation.x = -Math.PI / 2;
  for (const s of [-1, 1]) { const w = add(new THREE.PlaneGeometry(HL * 2, HH), M.damask, s * HW, HH / 2, 0, pg, { cast: false }); w.rotation.y = -s * Math.PI / 2; }
  const back = add(new THREE.PlaneGeometry(HW * 2, HH), M.damask, 0, HH / 2, -HL, pg, { cast: false });
  const front = add(new THREE.PlaneGeometry(HW * 2, HH), M.damask, 0, HH / 2, HL, pg, { cast: false }); front.rotation.y = Math.PI;
  const ce = add(new THREE.PlaneGeometry(HW * 2, HL * 2), M.ceiling, 0, HH, 0, pg, { cast: false }); ce.rotation.x = Math.PI / 2;
  // wainscot + gilded pilasters + cornice
  for (const s of [-1, 1]) { add(box(0.3, 1.4, HL * 2), M.cream, s * (HW - 0.15), 0.7, 0, pg); add(box(0.5, 0.6, HL * 2), M.gold, s * (HW - 0.25), HH - 0.3, 0, pg);
    for (let k = -3; k <= 3; k++) { add(box(0.5, HH, 0.9), M.cream, s * (HW - 0.25), HH / 2, k * 6, pg); add(box(0.6, 0.5, 1.1), M.gold, s * (HW - 0.3), HH - 1.0, k * 6, pg); add(box(0.6, 0.4, 1.1), M.gold, s * (HW - 0.3), 0.2, k * 6, pg); }
    for (let k = -2; k <= 2; k++) { const z = k * 6 + 3; add(box(0.1, 6, 3), toon({ color: '#cfe4f4' }), s * (HW - 0.06), 6.5, z, pg, { cast: false }); add(box(0.15, 6.4, 0.25), M.gold, s * (HW - 0.12), 6.5, z - 1.6, pg); add(box(0.15, 6.4, 0.25), M.gold, s * (HW - 0.12), 6.5, z + 1.6, pg);
      for (const dz of [-1.9, 1.9]) add(box(0.3, 7.5, 1.0), M.drape, s * (HW - 0.4), 6.2, z + dz, pg); } }
  add(box(HW * 2, 0.5, 0.5), M.gold, 0, HH - 0.3, -HL + 0.25, pg);
  // dais + throne
  for (let k = 0; k < 3; k++) add(box(10 - k * 2, 0.35, 6 - k * 1.2), k % 2 ? M.carpet : M.cream, 0, 0.175 + k * 0.35, -HL + 4.5 - k * 0.3, pg);
  const th = group(0, 1.05, -HL + 3.6, 0, pg); th.scale.setScalar(0.72); palace.userData.throne = th;
  add(box(2.6, 4.6, 0.5), M.gold, 0, 2.3, -0.6, th); add(box(2.1, 3.8, 0.3), M.velvet, 0, 2.5, -0.3, th); add(new THREE.SphereGeometry(0.35, 12, 8), M.gold, 0, 4.8, -0.6, th);
  add(box(2.6, 0.7, 2.0), M.gold, 0, 0.35, 0.3, th); add(box(2.2, 0.3, 1.8), M.velvet, 0, 0.82, 0.35, th);
  for (const s of [-1, 1]) { add(box(0.35, 1.1, 1.9), M.gold, s * 1.2, 1.2, 0.35, th); add(new THREE.SphereGeometry(0.22, 10, 8), M.gold, s * 1.2, 1.85, 1.2, th); }
  // big table with the (wordless) map
  const tb = group(0, 0, -HL + 7.1, 0, pg); add(box(7, 0.25, 3.6), M.table, 0, 2.0, 0, tb); add(box(7.3, 0.12, 3.9), M.gold, 0, 2.15, 0, tb);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(cyl(0.16, 0.12, 2.0, 8), M.table, sx * 3.2, 1.0, sz * 1.5, tb);
  const mp = add(new THREE.PlaneGeometry(2.6, 4.3), toon({ map: mapTex }), 0, 2.23, 0, tb, { cast: false }); mp.rotation.x = -Math.PI / 2; mp.rotation.z = Math.PI / 2;
  // inkwell + candles on the table
  add(cyl(0.18, 0.2, 0.3, 10), M.black, 2.4, 2.4, 0.9, tb); for (const x of [-2.8, 2.8]) { add(cyl(0.2, 0.25, 0.3, 10), M.gold, x, 2.4, -1.2, tb); add(cyl(0.07, 0.07, 0.6, 8), M.cream, x, 2.8, -1.2, tb); add(new THREE.SphereGeometry(0.08, 8, 6), M.glow, x, 3.15, -1.2, tb, { cast: false }); }
  // chandelier
  const ch = group(0, HH - 3.6, -2, 0, pg); palace.userData.chand = ch; add(cyl(0.05, 0.05, 3.4, 6), M.gold, 0, 1.9, 0, ch);
  for (const [r_, y_] of [[2.6, 0], [1.6, 0.9], [0.8, 1.6]]) { add(new THREE.TorusGeometry(r_, 0.08, 6, 32), M.gold, 0, y_, 0, ch).rotation.x = Math.PI / 2;
    const n = Math.round(r_ * 6); for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; add(cyl(0.05, 0.05, 0.4, 6), M.cream, Math.cos(a) * r_, y_ + 0.25, Math.sin(a) * r_, ch); add(new THREE.SphereGeometry(0.09, 8, 6), M.glow, Math.cos(a) * r_, y_ + 0.5, Math.sin(a) * r_, ch, { cast: false }); add(new THREE.ConeGeometry(0.07, 0.35, 5), toon({ color: '#e8f4ff' }), Math.cos(a) * r_, y_ - 0.3, Math.sin(a) * r_, ch).rotation.x = Math.PI; } }
  // great double door (front wall)
  const door = group(0, 0, HL - 0.05, 0, pg); palace.userData.leaves = [];
  add(box(6.4, 0.6, 0.4), M.gold, 0, 8.3, 0, door); for (const s of [-1, 1]) add(box(0.6, 8.6, 0.5), M.gold, s * 3.2, 4.3, 0, door);
  for (const s of [-1, 1]) { const hinge = group(s * 2.9, 0, 0, 0, door); const leaf = add(box(2.9, 8.0, 0.25), M.door, -s * 1.45, 4.0, 0, hinge); add(box(2.2, 3.0, 0.1), M.gold, -s * 1.45, 5.6, -0.15, hinge); add(box(2.2, 2.6, 0.1), M.gold, -s * 1.45, 2.0, -0.15, hinge); palace.userData.leaves.push([hinge, s]); }
  // bright corridor behind the door
  add(new THREE.PlaneGeometry(8, 9), new THREE.MeshBasicMaterial({ color: '#fff1cf' }), 0, 4.5, HL + 1.5, pg, { cast: false }).rotation.y = Math.PI;
}

// ---------- cards ----------
const CM = 2.25; // design 600x1000 -> 2.25 m
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
class Card {
  constructor(res = 1) {
    this.res = res; const CW = Math.round(1200 * res), CH = Math.round(2000 * res); this.CW = CW; this.CH = CH;
    [this.c, this.g] = cv(CW, CH);
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
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.CW, this.CH); g.setTransform(this.CW / 600, 0, 0, this.CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
  }
}
const pools = {}; const getCard = (res, i) => { const k = String(res), pl = pools[k] || (pools[k] = []); return pl[i] || (pl[i] = new Card(res)); };

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
    return e * (1. - smoothstep(140., 620., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, flashCol, max(flash, 0.));
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
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
  waterU.deep.value.set(L.waterDeep); waterU.shal.value.set(L.waterShal); waterU.glint.value.set(L.glint);
  for (const c of clouds) c.material.color.set(L.cloud || '#ffffff');
  M.cloud.color.set(L.cloud || '#ffffff');
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 160); sun.target.position.copy(focus);
  const ext = L.shadowExt || 30, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 400; sc.updateProjectionMatrix();
}
let seasonKey = '';
function worldState(S, f) {
  const inPalace = !!S.palace;
  world.visible = water.visible = !inPalace; palace.visible = inPalace; for (const c of clouds) c.visible = !inPalace;
  // flags wave
  for (const fl of flags) { const pa = fl.geometry.attributes.position, base = fl.geometry.userData.base;
    for (let i = 0; i < pa.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; pa.setZ(i, Math.sin(f * 0.22 - x * 2.6 + y * 0.8) * 0.16 * x); }
    pa.needsUpdate = true; fl.geometry.computeVertexNormals(); }
  waterU.t.value = f / 30;
  // seasons
  const se = S.season || { snow: 0, autumn: 0, bloom: 0 }; const sk = [se.snow, se.autumn, se.bloom].map((v) => v.toFixed(2)).join();
  if (sk !== seasonKey) { seasonKey = sk; trees.season(se); }
  seasonU.uSnow.value = se.snow; seasonU.uAutumn.value = se.autumn; seasonU.uGold.value = S.gold || 0;
  // farmer's rifle on the wall
  cabinA.userData.rifle.visible = !S.rifleTaken;
  // fleet
  const fp = S.fleet || [];
  fleet.forEach((sh, i) => { const p = fp[i]; sh.visible = !!p; if (!p) return; sh.position.set(p[0], 0.25 * Math.sin(f * 0.05 + i) - 0.4, p[2]); sh.rotation.set(0.012 * Math.sin(f * 0.07 + i * 2), p[3] ?? 0, 0.015 * Math.sin(f * 0.06 + i)); });
  // guns on the hill: roll up the slope
  const gp = S.guns ?? 1; hillGuns.forEach((g, i) => { const k = Math.min(1, Math.max(0, gp * 1.3 - i * 0.15)); const x = PL.hill[0] - 3.2 + i * 3.2, z0 = PL.hill[1] + 22, z1 = PL.hill[1] + 6, z = z0 + (z1 - z0) * k;
    g.position.set(x, hAt(x, z), z); for (const w of g.userData.wheels) w.rotation.z = -z * 1.3; g.visible = gp > -1; });
  landing.visible = S.landing !== false;
  puffCloud.visible = !!S.cloud; if (S.cloud) { puffCloud.position.set(...S.cloud); puffCloud.rotation.y = f * 0.002; puffCloud.scale.setScalar(0.62); }
  // palace bits
  if (inPalace) { const op = S.doorOpen ?? 1; for (const [hg, s] of palace.userData.leaves) hg.rotation.y = s * op * 1.6;
    const seal = S.seal ?? 0; if (Math.abs(seal - mapSeal) > 0.01) { mapSeal = seal; drawMap(seal); }
    palace.userData.chand.rotation.y = f * 0.004; }
}

function drawActors(list, cam) {
  for (const k in pools) for (const c of pools[k]) c.mesh.visible = c.blob.visible = false;
  const idx = {};
  list.forEach((a) => {
    const res = a.res || 1, i = (idx[res] = (idx[res] ?? -1) + 1), c = getCard(res, i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    if (a.face) c.mesh.quaternion.copy(cam.quaternion), c.mesh.rotateZ(a.roll || 0); // full billboard (sky sprites)
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1;
    const fog = a.fog !== false; if (c.mat.fog !== fog) { c.mat.fog = fog; c.mat.needsUpdate = true; }
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? a.y) + 0.03, a.z); c.blob.scale.set(0.95 * s * (a.blobW || 1), 0.6 * s, 1); }
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
  const S = worldAt(f), L = lightFor(shotAt(f), f); let C = camAt(f);
  if (location.hash.startsWith('#cam=')) C = { ...C, ...JSON.parse(decodeURIComponent(location.hash.slice(5))) };
  applyLight(L);
  const base = S.palace ? PL.palace : [0, 0, 0];
  camera.position.set(C.pos[0] + base[0], C.pos[1] + base[1], C.pos[2] + base[2]); camera.up.set(0, 1, 0); camera.lookAt(C.look[0] + base[0], C.look[1] + base[1], C.look[2] + base[2]); camera.rotateZ(rx(C.roll || 0));
  const off = C.off || [75, -175]; camera.setViewOffset(W, H, off[0], off[1], W, H);
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  worldState(S, f);
  const fc = C.shadowAt || C.look; placeSun(L, new THREE.Vector3(fc[0] + base[0], fc[1] + base[1], fc[2] + base[2]));
  const acts = [...actorsAt(f, T), ...fxAt(f, T)].map((a) => base[1] ? { ...a, x: a.x + base[0], y: a.y + base[1], z: a.z + base[2], ground: a.ground !== undefined ? a.ground + base[1] : undefined } : a);
  drawActors(acts, camera);
  sky.position.copy(camera.position);
  for (const c of clouds) c.quaternion.copy(camera.quaternion);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  if (window.DEBUG_ND) { const dm = new THREE.MeshBasicMaterial({ map: rtNd.texture }); const ds = fs(dm); renderer.setRenderTarget(null); renderer.render(ds, fsCam); return true; }
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0); inkU.flashCol.value.set(C.flashCol || '#ffffff'); inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
drawMap(0);
window.TOTAL = TOTAL;
window.ready = true;
