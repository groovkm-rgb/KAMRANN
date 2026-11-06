import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import * as G from './geo.js';
import { SHOTS, TOTAL, shotAt, camAt, dofAt, LIGHTS, lightFor, actorsAt, worldAt, fxAt } from './story.js';

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
const { CLIFF, SEABED, GAL, LAMP, QUAY, INT, STAIR_H, ROOM_R, STEP_N, STEP_DA, STEP_A_END } = G;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff', extra = {}) => toon({ map: P.tex(c, rx_, ry_), color, ...extra });
const M = {
  plank: texM(P.planks(1), 1, 1), beam: texM(P.beam(2), 1, 1), beamDark: texM(P.beam(3, [28, 36, 30]), 1, 1),
  stone: texM(P.stone(4), 1, 1), stoneW: texM(P.stone(14, 40, 8, 80), 1, 1), cobble: texM(P.stone(24, 30, 10, 58, 48, 32), 1, 1),
  grass: texM(P.grass(6), 0.08, 0.08), dirt: texM(P.dirt(7), 0.12, 0.12), plaster: texM(P.plaster(8), 1, 1), plaster2: texM(P.plaster(18, 28), 1, 1),
  roof: texM(P.roof(9), 2, 2), rock: texM(P.rock(21), 0.07, 0.07), rockDark: texM(P.rock(22, [205, 12, 34]), 0.12, 0.12),
  reef: texM(P.rock(23, [180, 14, 38]), 1, 1), sand: texM(P.sand(41), 0.06, 0.06),
  tower: texM(P.tower(), 1, 1), wreck: texM(P.wreckWood(51), 1, 1), wreck2: texM(P.wreckWood(52), 1, 1),
  leather: texM(P.leather(61), 1, 1), edge: texM(P.pageEdge(), 1, 1),
  iron: toon({ color: '#3e4a46' }), ironRed: toon({ color: '#8a2c26' }), brass: toon({ color: '#c9a04a' }),
  wood: toon({ color: '#7a5434' }), woodDark: toon({ color: '#4e3422' }), door: toon({ color: '#3d5a6e' }),
  window: toon({ color: '#2b2430' }), bush: toon({ color: '#4f7a3a' }), hill: toon({ color: '#5f8a48' }), hillFar: toon({ color: '#7a9a6a' }),
  wax: toon({ color: '#efe4c6' }), rope: toon({ color: '#a88a5a' }), sailTorn: toon({ color: '#cfc3a4', side: THREE.DoubleSide }),
  boatA: toon({ color: '#3f6f8f', side: THREE.DoubleSide }), boatB: toon({ color: '#b8452f', side: THREE.DoubleSide }), boatC: toon({ color: '#e8dcc0', side: THREE.DoubleSide }),
};
M.lens = toon({ color: '#d8c890', emissive: new THREE.Color('#ffd27a'), emissiveIntensity: 0 });
M.wall = texM(P.stone(34, 38, 10, 78, 96, 48), 1, 1, '#ffffff', { side: THREE.BackSide });
const WIN = new THREE.MeshBasicMaterial({ color: '#dfe6ea', fog: false });   // interior window light, set per preset
const dummy = new THREE.Object3D();

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
const waterNd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`, side: THREE.DoubleSide,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = opts.receive ?? true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};
const additive = (tex, color = '#ffffff') => new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
const glowTex = P.tex(P.radial('255,255,255', 1));
const billboards = []; // meshes that face the camera every frame
const glow = (parent, x, y, z, s, color) => { const m = add(new THREE.PlaneGeometry(1, 1), additive(glowTex, color), x, y, z, parent, { cast: false, receive: false }); m.scale.setScalar(s); m.userData.ndSkip = true; m.renderOrder = 8; billboards.push(m); return m; };
// cheap value noise for jittering rock
const hn = (x, y, z) => { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); };
const sn = (x, y, z) => Math.sin(x * 0.31 + Math.sin(z * 0.17) * 2.1) * Math.cos(y * 0.43 + x * 0.07) + 0.5 * Math.sin(z * 0.53 + y * 0.29);

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 }, stars: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 48, 24), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize, stars; varying vec3 vP;
    float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      if (stars > 0.) { vec3 q = floor(vP*260.); float r = h3(q); float tw = smoothstep(.9965, 1., r) * smoothstep(.02, .25, vP.y); c += vec3(.9,.92,1.) * tw * stars * 1.6; }
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
const point = new THREE.PointLight('#ffb35c', 0, 6, 1.6); scene.add(point);   // candle / lamp
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// ---------- exterior world ----------
const world = new THREE.Group(); scene.add(world);
// sea (seen from below it turns into a bright rippled ceiling)
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') }, uw: { value: new THREE.Color('#3aa0a0') } };
const waterMat = new THREE.ShaderMaterial({
  uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...waterU }, fog: true, side: THREE.DoubleSide, transparent: true, depthWrite: true,
  vertexShader: `#include <fog_pars_vertex>
    varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform float t; uniform vec3 deep, shal, glint, uw; varying vec3 vW;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
    void main(){
      if (!gl_FrontFacing) {
        float n = noise(vW.xz*.35 + vec2(t*.4, t*.2)) * .6 + noise(vW.xz*.9 - vec2(t*.3, -t*.5)) * .4;
        vec3 c = mix(uw, vec3(.86,.97,1.), .18 + .5*smoothstep(.5,.85,n));
        gl_FragColor = vec4(c, .82);
      } else {
        vec2 p = vW.xz*vec2(.16,.22) + vec2(t*.05, -t*.12);
        float n = noise(p) * .6 + noise(p*2.3 + 7.) * .4;
        vec3 c = mix(deep, shal, .2 + .55*n);
        float streak = smoothstep(.74, .8, noise(vW.xz*vec2(.45,.13) + vec2(t*.1, -t*.45)));
        c = mix(c, glint, streak*.7);
        gl_FragColor = vec4(c,1.);
      }
      #include <fog_fragment>
    }`,
});
const water = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), waterMat); water.rotation.x = -Math.PI / 2; water.position.y = 0;
water.userData.nd = waterNd; water.receiveShadow = false; water.renderOrder = 3; world.add(water);
// seabed
const seabed = add(new THREE.PlaneGeometry(3000, 3000), M.sand, 0, SEABED, 0, world, { cast: false }); seabed.rotation.x = -Math.PI / 2;
M.sand.map.repeat.set(160, 160);

// extruded rock mass from a world-space (x,z) outline, top at `top`, jittered for a craggy cliff face
const cliffMass = (outline, top, bottom, topMat, sideMat, amp = 1.6, seg = 3.5) => {
  const pts = [];
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i], b = outline[(i + 1) % outline.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / seg));
    for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: top - bottom, bevelEnabled: false, steps: Math.round((top - bottom) / 2.6), curveSegments: 1 });
  g.rotateX(-Math.PI / 2); g.translate(0, bottom, 0);
  const pa = g.attributes.position;
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
    if (Math.abs(x) > 300 || Math.abs(z) > 300) continue;
    const k = y > top - 0.01 ? 0.35 : 1;
    pa.setX(i, x + amp * k * (sn(x, y, z) + (hn(x, y, z) - 0.5) * 0.8));
    pa.setZ(i, z + amp * k * (sn(z + 3.1, y * 1.3, x) + (hn(z, y, x) - 0.5) * 0.8));
    if (y < top - 0.01 && y > bottom + 0.01) pa.setY(i, y + (hn(y, x, z) - 0.5) * 0.9);
  }
  g.computeVertexNormals();
  return add(g, [topMat, sideMat], 0, 0, 0, world, { cast: true });
};
// headland with the lighthouse at its seaward tip (0,0); open sea everywhere to +x
const HEAD = [[-420, -90], [-70, -44], [-34, -16], [-14, -11], [3, -10], [11, -4], [10, 5], [3, 11], [-12, 10], [-30, 13], [-52, 20], [-80, 23], [-420, 24]];
cliffMass(HEAD, CLIFF, SEABED, M.grass, M.rock, 1.7);
// low village shelf under the headland, its quay facing the bay
const VILL = [[-420, 21], [-82, 21], [-58, 28], [-47, 38], [-50, 48], [-66, 62], [-420, 90]];
cliffMass(VILL, QUAY, SEABED, M.cobble, M.stoneW, 0.25, 3);
M.cobble.map.repeat.set(0.35, 0.35); M.stoneW.map.repeat.set(0.3, 0.3);
// inland hills (behind the village, never toward the open sea)
{ const r = P.rng(5); for (let i = 0; i < 14; i++) { const x = -160 - r() * 360, z = -120 + r() * 300, s = 30 + r() * 50; const h = add(new THREE.SphereGeometry(s, 20, 10), i % 2 ? M.hill : M.hillFar, x, CLIFF - s * 0.55, z, world, { cast: false }); h.scale.y = 0.55; } }
// boulders at the cliff foot + reef rocks breaking the surface around the tip
const rocks = [];
const rockAt = (x, y, z, s, sharp, mat, parent = world) => {
  const g = sharp ? new THREE.ConeGeometry(1, 1, 5, 4) : new THREE.DodecahedronGeometry(1, 0);
  const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const px = pa.getX(i), py = pa.getY(i), pz = pa.getZ(i); const j = 1 + (hn(px * 3 + x, py * 3, pz * 3 + z) - 0.5) * 0.9; pa.setXYZ(i, px * j, py, pz * j); }
  g.computeVertexNormals();
  const m = add(g, mat, x, y, z, parent); m.scale.set(s[0], s[1], s[2]); m.rotation.set((hn(x, z, 1) - 0.5) * 0.7, hn(z, x, 2) * 6.28, (hn(x, 3, z) - 0.5) * 0.5); rocks.push(m); return m;
};
const foam = [];
const foamMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false });
{ const r = P.rng(77);
  // reef: a field of sharp rocks under the tip, a few breaking the surface
  for (let i = 0; i < 80; i++) {
    const a = -1.4 + r() * 2.8, d = 12 + Math.pow(r(), 0.8) * 70, x = Math.cos(a) * d, z = Math.sin(a) * d * 1.1;
    const breach = i < 16 && d < 45, h = breach ? 15 + r() * 4 : 2.5 + r() * 6, rad = 2 + r() * 3.5;
    if (x > 12 && x < 50 && Math.abs(z - 11) < 7 && h > 4) continue;  // keep the camera's dive lane clear
    rockAt(x, SEABED + h / 2 - 0.5, z, [rad, h, rad * (0.7 + r() * 0.5)], true, i % 3 ? M.reef : M.rockDark);
    if (breach) { const f = add(new THREE.RingGeometry(rad * 0.75, rad * 1.5, 20), foamMat, x, 0.04, z, world, { cast: false, receive: false }); f.rotation.x = -Math.PI / 2; f.userData.ndSkip = true; foam.push(f); }
  }
  for (let i = 0; i < 26; i++) { const a = r() * 6.28, x = Math.cos(a) * (12 + r() * 4), z = Math.sin(a) * (11 + r() * 4); if (x < -8) continue; rockAt(x, -0.5 + r() * 0.8, z, [2 + r() * 2, 1.6 + r() * 1.6, 2 + r() * 2], false, M.rockDark); }
}
M.reef.map.repeat.set(1, 3);

// ---------- lighthouse ----------
const LHG = new THREE.Group(); world.add(LHG);
const towerBody = add(new THREE.CylinderGeometry(2.05, 2.75, G.TOWER_H, 40, 1), [M.tower, M.stoneW, M.stoneW], 0, CLIFF + G.TOWER_H / 2, 0, LHG);
add(new THREE.CylinderGeometry(3.1, 3.3, 1.0, 32), M.stoneW, 0, CLIFF + 0.4, 0, LHG); // plinth
add(tbox(1.1, 2.0, 0.4, 1), M.door, 0, CLIFF + 1.9, 2.72, LHG).rotation.x = -0.04;
// gallery
add(new THREE.CylinderGeometry(2.75, 2.45, 0.32, 40), M.iron, 0, GAL - 0.12, 0, LHG);
for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; add(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 6), M.iron, Math.cos(a) * 2.62, GAL + 0.5, Math.sin(a) * 2.62, LHG); }
{ const tr = add(new THREE.TorusGeometry(2.62, 0.05, 6, 48), M.iron, 0, GAL + 1.0, 0, LHG); tr.rotation.x = Math.PI / 2; const tr2 = add(new THREE.TorusGeometry(2.62, 0.03, 6, 48), M.iron, 0, GAL + 0.55, 0, LHG); tr2.rotation.x = Math.PI / 2; }
// lantern room: low wall, slim mullions (no glass so the camera can see in), dome, vent ball
add(new THREE.CylinderGeometry(1.6, 1.6, 0.85, 24), M.ironRed, 0, GAL + 0.42, 0, LHG);
for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; add(tbox(0.07, 2.1, 0.07, 1), M.iron, Math.cos(a) * 1.58, GAL + 1.9, Math.sin(a) * 1.58, LHG); }
{ const tr = add(new THREE.TorusGeometry(1.6, 0.06, 6, 32), M.iron, 0, GAL + 2.95, 0, LHG); tr.rotation.x = Math.PI / 2; }
add(new THREE.SphereGeometry(1.8, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.ironRed, 0, GAL + 2.95, 0, LHG).scale.y = 0.62;
add(new THREE.SphereGeometry(0.28, 12, 8), M.iron, 0, GAL + 4.2, 0, LHG);
add(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), M.iron, 0, GAL + 4.6, 0, LHG);
// the lamp: pedestal + fresnel lens
add(new THREE.CylinderGeometry(0.22, 0.3, 0.95, 12), M.brass, 0, GAL + 0.47, 0, LHG);
const lens = add(new THREE.CylinderGeometry(0.5, 0.5, 1.05, 16), M.lens, LAMP[0], LAMP[1], LAMP[2], LHG);
for (let k = -2; k <= 2; k++) { const r_ = add(new THREE.TorusGeometry(0.51, 0.025, 4, 24), M.brass, LAMP[0], LAMP[1] + k * 0.21, LAMP[2], LHG); r_.rotation.x = Math.PI / 2; }
const lampGlow = glow(LHG, LAMP[0], LAMP[1], LAMP[2], 4, '#ffcf7a');
const lampGlow2 = glow(LHG, LAMP[0], LAMP[1], LAMP[2], 1.4, '#fff4d8');
// beams: two opposite volumetric cones, rotating with the lens
const BEAM_LEN = 150;
const beamMat = new THREE.ShaderMaterial({
  uniforms: { I: { value: 0 }, col: { value: new THREE.Color('#ffe9b8') } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
  vertexShader: `varying float vA; varying vec3 vN, vV; void main(){ vA = position.x; vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform float I; uniform vec3 col; varying float vA; varying vec3 vN, vV;
    void main(){ float al = clamp(vA/${BEAM_LEN.toFixed(1)}, 0., 1.); float f = abs(dot(normalize(vN), normalize(vV)));
      float a = I * pow(1.-al, 1.3) * (.15 + pow(f, 2.2)) * .5 * smoothstep(0., .02, al); gl_FragColor = vec4(col, a); }`,
});
const beamG = new THREE.Group(); beamG.position.set(...LAMP); LHG.add(beamG);
for (const s of [0, Math.PI]) {
  const g = new THREE.ConeGeometry(11, BEAM_LEN, 32, 1, true); g.translate(0, -BEAM_LEN / 2, 0); g.rotateZ(Math.PI / 2); g.translate(0.0, 0, 0);
  const m = new THREE.Mesh(g, beamMat); m.rotation.y = s; m.rotation.z = -0.035; m.userData.ndSkip = true; m.renderOrder = 9; beamG.add(m);
}
// keeper's cottage + low stone wall + path
{ const c = new THREE.Group(); c.position.set(-11, CLIFF, 3.5); c.rotation.y = 0.25; world.add(c);
  add(tbox(6, 3.2, 4.4, 2), M.plaster, 0, 1.6, 0, c);
  const rf = add(new THREE.ConeGeometry(4.3, 2.0, 4), M.roof, 0, 4.2, 0, c); rf.rotation.y = Math.PI / 4; rf.scale.set(1.0, 1, 0.75);
  add(tbox(0.7, 1.6, 0.7, 1), M.stone, 2.0, 4.6, 0.6, c);
  add(box(0.9, 1.8, 0.1), M.door, -1.2, 0.9, 2.23, c, { cast: false });
  for (const x of [0.6, 2.0]) add(box(0.7, 0.7, 0.1), M.window, x, 1.9, 2.23, c, { cast: false });
  for (let i = 0; i < 9; i++) add(tbox(2.4, 0.7, 0.6, 1), M.stone, -20 + i * 2.4 + (i % 2) * 0.2, CLIFF + 0.35, -5.6 + i * 0.25, world);
  const path = add(new THREE.PlaneGeometry(26, 1.6), M.dirt, -16, CLIFF + 0.04, 1.2, world, { cast: false }); path.rotation.x = -Math.PI / 2; path.rotation.z = 0.12;
  const rb = P.rng(8); for (let i = 0; i < 14; i++) add(new THREE.SphereGeometry(0.5 + rb() * 0.7, 8, 6), M.bush, -6 - rb() * 30, CLIFF + 0.2, -8 + rb() * 16, world).scale.y = 0.6;
}

// ---------- village (on the low shelf) ----------
const house = (x, z, w, d, h, rot, mat = M.plaster) => {
  const g = new THREE.Group(); g.position.set(x, QUAY, z); g.rotation.y = rot; world.add(g);
  add(tbox(w, h, d, 2), mat, 0, h / 2, 0, g);
  const rf = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.5, 1.8, 4), M.roof, 0, h + 0.9, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  add(box(0.9, 1.8, 0.1), M.door, 0, 0.9, d / 2 + 0.03, g, { cast: false });
  for (const s of [-1, 1]) add(box(0.6, 0.7, 0.1), M.window, s * w * 0.3, h * 0.62, d / 2 + 0.03, g, { cast: false });
  return g;
};
{ const rh = P.rng(12);
  [[-74, 30, 0.9], [-82, 40, 1.3], [-70, 60, 2.5], [-84, 56, 2.0], [-92, 30, 1.0], [-62, 30, 0.6], [-96, 48, 1.6]].forEach(([x, z, r], i) =>
    house(x, z, 4 + rh() * 3, 4 + rh() * 2.5, 3.2 + rh() * 2.4, r, i % 2 ? M.plaster : M.plaster2));
  // quay bollards + a short pier
  for (let i = 0; i < 6; i++) add(new THREE.CylinderGeometry(0.18, 0.22, 0.6, 8), M.iron, -48.6 - i * 0.6, QUAY + 0.3, 36 + i * 2.4, world);
  const pier = add(tbox(2.2, 0.3, 14, 1), M.plank, -45, QUAY - 0.2, 46, world); pier.rotation.y = -0.6;
  for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.15, 0.15, 3.4, 6), M.beamDark, -45 + Math.sin(-0.6) * (i * 3 - 6) + 1.0, -0.2, 46 + Math.cos(-0.6) * (i * 3 - 6), world);
}
const boat = (x, z, rot, mat, len = 5) => {
  const g = new THREE.Group(); g.position.set(x, 0.05, z); g.rotation.y = rot; world.add(g);
  const hull = add(new THREE.CylinderGeometry(1, 1, len, 14, 1, true, Math.PI / 2, Math.PI), mat, 0, 0.45, 0, g); hull.rotation.z = Math.PI / 2; hull.scale.set(0.75, 1, 1.1);
  add(tbox(len * 0.96, 0.08, 0.12, 1), M.woodDark, 0, 0.47, 1.08, g); add(tbox(len * 0.96, 0.08, 0.12, 1), M.woodDark, 0, 0.47, -1.08, g);
  add(new THREE.CylinderGeometry(0.05, 0.06, 4.2, 6), M.wood, 0.4, 2.4, 0, g);
  return g;
};
const boats = [boat(-40, 40, 0.5, M.boatA), boat(-38, 50, -0.2, M.boatB, 4.4), boat(-46, 28, 1.1, M.boatC, 4)];

// ---------- the wrecks (dozens, on the reef) ----------
const wreckG = new THREE.Group(); world.add(wreckG);
const wreck = (x, z, rotY, scale, seed) => {
  const r = P.rng(seed), g = new THREE.Group(), L = 14, n = 9; wreckG.add(g);
  g.position.set(x, SEABED + 0.3, z); g.rotation.set((r() - 0.5) * 0.5, rotY, (r() - 0.5) * 0.7 + (r() < 0.5 ? 0.5 : -0.4)); g.scale.setScalar(scale);
  const mat = r() < 0.5 ? M.wreck : M.wreck2;
  add(tbox(L, 0.45, 0.45, 2), mat, 0, 0.2, 0, g); // keel
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), w = 3.0 * Math.sqrt(1 - Math.pow(2 * u - 1, 2) * 0.82), broken = r();
    const arc = broken < 0.35 ? Math.PI * (0.45 + r() * 0.3) : Math.PI, start = broken < 0.35 && r() < 0.5 ? Math.PI - arc : 0;
    const rib = add(new THREE.TorusGeometry(w, 0.2, 5, 12, arc), mat, -L / 2 + 0.6 + u * (L - 1.2), w * 0.92, 0, g);
    rib.rotation.set(0, Math.PI / 2, Math.PI + start); rib.scale.set(1, 0.95, 1);
  }
  // a few strakes of planking left on one side
  for (let k = 0; k < 4; k++) { const a = Math.PI * (1.15 + k * 0.1), y = 2.75 + Math.sin(a) * 2.55, zz = Math.cos(a) * 2.75; const pl = add(tbox(L * (0.45 + r() * 0.4), 0.12, 0.55, 2), mat, (r() - 0.5) * 3, y, zz, g); pl.rotation.x = a + Math.PI / 2; }
  // stem post
  const st = add(tbox(0.4, 5, 0.4, 2), mat, L / 2 - 0.2, 2.2, 0, g); st.rotation.z = -0.35;
  // broken mast (+ yard and a rag of sail on some)
  if (r() < 0.85) {
    const mh = 5 + r() * 7, mast = add(new THREE.CylinderGeometry(0.17, 0.24, mh, 8), mat, (r() - 0.5) * 3, mh / 2, 0, g);
    mast.rotation.set((r() - 0.5) * 1.6, 0, (r() - 0.5) * 1.6);
    if (r() < 0.5) { const yd = add(new THREE.CylinderGeometry(0.1, 0.1, 5, 6), mat, mast.position.x, mh * 0.8, 0, g); yd.rotation.set(Math.PI / 2 + (r() - 0.5), 0, mast.rotation.z); }
  }
  for (let k = 0; k < 3; k++) { const b = add(new THREE.CylinderGeometry(0.35, 0.35, 0.8, 8), mat, (r() - 0.5) * 10, 0.3, (r() - 0.5) * 7, g); b.rotation.set(Math.PI / 2, r() * 3, 0); }
  return g;
};
{ const r = P.rng(2024), pts = [];
  for (let i = 0; i < 300 && pts.length < 34; i++) {
    const a = -1.3 + r() * 2.6, d = 16 + Math.pow(r(), 0.7) * 78, x = Math.cos(a) * d, z = Math.sin(a) * d * 1.15;
    if (pts.some(([px, pz]) => Math.hypot(px - x, pz - z) < 9)) continue; pts.push([x, z]);
    wreck(x, z, r() * 6.28, 0.95 + r() * 0.6, 100 + i);
  }
  // anchors and a cannon or two between the hulls
  for (let i = 0; i < 8; i++) { const x = 14 + r() * 60, z = (r() - 0.5) * 70, g = new THREE.Group(); g.position.set(x, SEABED + 0.5, z); g.rotation.set(r() * 1.4, r() * 6, 1.2); wreckG.add(g);
    add(new THREE.CylinderGeometry(0.12, 0.12, 3, 6), M.iron, 0, 0, 0, g); const t = add(new THREE.TorusGeometry(1.0, 0.12, 5, 12, Math.PI), M.iron, 0, -1.3, 0, g); t.rotation.z = Math.PI; }
}
// light shafts under water (only drawn under water)
const shaftTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); const g2 = g.createLinearGradient(0, 0, 64, 0); g.globalCompositeOperation = 'destination-in'; g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(.5, 'rgba(0,0,0,1)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = g2; g.fillRect(0, 0, 64, 256); return P.tex(c); })();
const shafts = [];
{ const r = P.rng(55); for (let i = 0; i < 16; i++) { const m = add(new THREE.PlaneGeometry(1, 1), additive(shaftTex, '#bff6ff'), 10 + r() * 60, -8, (r() - 0.5) * 60, world, { cast: false, receive: false }); m.scale.set(2 + r() * 4, 18, 1); m.rotation.z = 0.25; m.userData.ndSkip = true; m.renderOrder = 7; m.userData.ph = r() * 6.28; shafts.push(m); } }

// clouds: painted billboards far away (no fog, no ink)
const clouds = [];
const cloudMat = [];
{ const r = P.rng(90);
  for (let i = 0; i < 16; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const mt = new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }); cloudMat.push(mt);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), mt);
    const a = r() * Math.PI * 2, d = 900 + r() * 400; m.position.set(Math.cos(a) * d, 90 + r() * 200, Math.sin(a) * d); m.scale.setScalar(200 + r() * 180);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- interior set: stairwell + watch room ----------
const inner = new THREE.Group(); inner.position.set(...INT); scene.add(inner); inner.visible = false;
{
  const RH = STAIR_H + 3.1;
  const wall = add(new THREE.CylinderGeometry(ROOM_R, ROOM_R, RH, 40, 1, true), M.wall, 0, RH / 2, 0, inner, { cast: false });
  M.wall.map.repeat.set(4, 4);
  add(new THREE.CircleGeometry(ROOM_R, 32), M.stone, 0, 0.01, 0, inner, { cast: false }).rotation.x = -Math.PI / 2;
  // steps
  const stepGeo = tbox(2.15, 0.12, 0.66, 1);
  for (let i = 0; i < STEP_N; i++) {
    const a = rx(STEP_A_END - (STEP_N - 1 - i) * STEP_DA), y = (i + 1) * STAIR_H / STEP_N;
    const s = add(stepGeo, M.plank, Math.cos(a) * 1.42, y - 0.06, Math.sin(a) * 1.42, inner, { cast: false }); s.rotation.y = -a;
    const s2 = add(tbox(2.1, 0.22, 0.12, 1), M.woodDark, Math.cos(a - rx(9)) * 1.42, y - 0.2, Math.sin(a - rx(9)) * 1.42, inner, { cast: false }); s2.rotation.y = -(a - rx(9));
  }
  // rope handrail along the wall
  class Helix extends THREE.Curve { getPoint(t, out = new THREE.Vector3()) { const a = rx(STEP_A_END - (1 - t) * (STEP_N - 1) * STEP_DA); return out.set(Math.cos(a) * 2.4, 0.95 + t * STAIR_H, Math.sin(a) * 2.4); } }
  add(new THREE.TubeGeometry(new Helix(), 240, 0.035, 6, false), M.rope, 0, 0, 0, inner, { cast: false });
  // slit windows in the stairwell
  for (let k = 0; k < 7; k++) { const a = rx(40 + k * 137), y = 1.5 + k * 1.6; const w = add(new THREE.PlaneGeometry(0.34, 0.9), WIN, Math.cos(a) * 2.52, y, Math.sin(a) * 2.52, inner, { cast: false, receive: false }); w.lookAt(INT[0], INT[1] + y, INT[2]); w.userData.ndSkip = false; }
  // watch-room floor with the stair opening
  const sh = new THREE.Shape(); sh.absarc(0, 0, ROOM_R - 0.01, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); const a0 = rx(STEP_A_END - 95), a1 = rx(STEP_A_END + 8);
  hole.absarc(0, 0, 0.5, -a0, -a1, true); hole.lineTo(Math.cos(a1) * 2.48, -Math.sin(a1) * 2.48); hole.absarc(0, 0, 2.48, -a1, -a0, false); hole.closePath(); sh.holes.push(hole);
  const fl = add(new THREE.ShapeGeometry(sh, 24), M.plank, 0, STAIR_H, 0, inner, { cast: false }); fl.rotation.x = -Math.PI / 2;
  M.plank.map.repeat.set(0.8, 0.8);
  add(new THREE.CircleGeometry(ROOM_R, 32), M.woodDark, 0, RH - 0.01, 0, inner, { cast: false }).rotation.x = Math.PI / 2;
  for (let k = 0; k < 6; k++) { const b = add(tbox(ROOM_R * 2, 0.16, 0.2, 1), M.woodDark, 0, RH - 0.1, 0, inner, { cast: false }); b.rotation.y = k * Math.PI / 6; }
  // watch-room windows
  for (const d of [140, 200, 260, 320]) { const a = rx(d); const w = add(new THREE.PlaneGeometry(0.8, 1.3), WIN, Math.cos(a) * 2.53, STAIR_H + 1.75, Math.sin(a) * 2.53, inner, { cast: false, receive: false }); w.lookAt(INT[0], INT[1] + STAIR_H + 1.75, INT[2]);
    const fr = add(tbox(0.06, 1.3, 0.06, 1), M.woodDark, Math.cos(a) * 2.5, STAIR_H + 1.75, Math.sin(a) * 2.5, inner, { cast: false }); const fr2 = add(tbox(0.95, 0.06, 0.06, 1), M.woodDark, Math.cos(a) * 2.5, STAIR_H + 1.75, Math.sin(a) * 2.5, inner, { cast: false }); fr2.lookAt(INT[0], INT[1] + STAIR_H + 1.75, INT[2]); fr2.rotateY(Math.PI / 2); }
  // table, chair, shelf, hanging oil lamp, coat on a peg
  const tx = G.TABLE[0] - INT[0], ty = STAIR_H, tz = G.TABLE[2] - INT[2];
  add(tbox(1.15, 0.06, 0.78, 1), M.wood, tx, ty + 0.75, tz, inner);
  for (const [dx, dz] of [[-0.5, -0.32], [0.5, -0.32], [-0.5, 0.32], [0.5, 0.32]]) add(tbox(0.07, 0.75, 0.07, 1), M.woodDark, tx + dx, ty + 0.375, tz + dz, inner);
  const ch = new THREE.Group(); ch.position.set(tx + 0.15, ty, tz + 0.75); ch.rotation.y = 0.3; inner.add(ch);
  add(tbox(0.45, 0.05, 0.45, 1), M.wood, 0, 0.46, 0, ch); add(tbox(0.45, 0.6, 0.05, 1), M.wood, 0, 0.78, 0.2, ch);
  for (const [dx, dz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) add(tbox(0.04, 0.46, 0.04, 1), M.woodDark, dx, 0.23, dz, ch);
  { const a = rx(175); const sh_ = add(tbox(0.25, 0.05, 1.0, 1), M.woodDark, Math.cos(a) * 2.42, ty + 1.45, Math.sin(a) * 2.42 + 0.2, inner);
    for (let k = 0; k < 4; k++) add(new THREE.CylinderGeometry(0.06, 0.06, 0.18 + k * 0.03, 10), k % 2 ? M.brass : M.boatA, Math.cos(a) * 2.42, ty + 1.57 + k * 0.015, Math.sin(a) * 2.42 - 0.15 + k * 0.17, inner); }
  add(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 4), M.iron, tx + 0.3, RH - 0.4, tz, inner, { cast: false });
  add(new THREE.CylinderGeometry(0.08, 0.1, 0.22, 10), M.brass, tx + 0.3, RH - 0.8, tz, inner);
  // the candle on the table
  const cx = G.CANDLE[0] - INT[0], cz = G.CANDLE[2] - INT[2];
  add(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 14), M.brass, cx, ty + 0.79, cz, inner);
  add(new THREE.CylinderGeometry(0.028, 0.03, 0.13, 12), M.wax, cx, ty + 0.86, cz, inner);
}
const candleGlow = glow(inner, G.CANDLE[0] - INT[0], STAIR_H + 0.96, G.CANDLE[2] - INT[2], 0.9, '#ffb04a');

// ---------- the logbook ----------
const BW_ = 0.2, BD = 0.28, BT = 0.065, CV = 0.008; // page width, depth, page-block thickness, cover thickness
const pageTex = [], blankTex = P.tex(P.page(99, true));
for (let i = 0; i < 10; i++) pageTex.push(P.tex(P.page(i + 1)));
const book = new THREE.Group(); book.position.set(G.BOOK[0] - INT[0], STAIR_H + 0.78, G.BOOK[2] - INT[2]); book.rotation.y = 0.08; inner.add(book);
const pageTopL = toon({ map: pageTex[0] }), pageTopR = toon({ map: pageTex[1] });
const blockL = add(box(BW_, 1, BD), [M.edge, M.edge, pageTopL, M.edge, M.edge, M.edge], -BW_ / 2, 0, 0, book);
const blockR = add(box(BW_, 1, BD), [M.edge, M.edge, pageTopR, M.edge, M.edge, M.edge], BW_ / 2, 0, 0, book);
add(tbox(BW_ + 0.012, CV, BD + 0.016, 0.3), M.leather, BW_ / 2 + 0.003, CV / 2, 0, book);           // back cover
const pivot = new THREE.Group(); book.add(pivot);
const frontCover = add(tbox(BW_ + 0.012, CV, BD + 0.016, 0.3), M.leather, BW_ / 2 + 0.003, 0, 0, pivot);
const spine = add(new THREE.CylinderGeometry(1, 1, BD + 0.016, 16, 1, false, Math.PI, Math.PI), M.leather, 0, 0, 0, book); spine.rotation.x = Math.PI / 2;
M.leather.map.repeat.set(1, 1);
const flipGeo = new THREE.PlaneGeometry(BW_, BD, 18, 1); flipGeo.rotateX(-Math.PI / 2); flipGeo.translate(BW_ / 2, 0, 0);
const flipBase = flipGeo.attributes.position.array.slice();
const flipMat = toon({ map: pageTex[2], side: THREE.DoubleSide });
const flip = add(flipGeo, flipMat, 0, 0, 0, book); flip.visible = false;
function bookState(B) {
  if (!B) return;
  const cover = B.cover ?? 0, k = B.k ?? 0;           // cover 0 closed .. 1 open; k = fraction of pages turned
  const tl = cover > 0.5 ? Math.max(0.0015, BT * k) : 0.0015, tr = Math.max(0.0015, BT * (1 - k));
  blockR.scale.y = tr; blockR.position.y = CV + tr / 2;
  blockL.scale.y = tl; blockL.position.y = CV + tl / 2; blockL.visible = cover > 0.98;
  // front cover hinge: rotates over the spine to the left
  const th = cover * Math.PI, hy = (CV + BT + CV) / 2;
  pivot.position.set(0, hy, 0); pivot.rotation.z = th; frontCover.position.set(BW_ / 2 + 0.003, (CV + BT + CV / 2) - hy, 0);
  spine.scale.set(0.012 + 0.01 * (1 - cover), 1, (BT + 2 * CV) / 2); spine.position.set(-0.002, (BT + 2 * CV) / 2, 0); spine.visible = cover < 0.6;
  pageTopR.map = B.blankR ? blankTex : pageTex[(B.pr ?? 1) % pageTex.length]; pageTopL.map = pageTex[(B.pl ?? 0) % pageTex.length];
  // the page in flight
  flip.visible = B.flip != null;
  if (flip.visible) {
    const t = B.flip, pa = flipGeo.attributes.position, bend = 0.9 * Math.sin(t * Math.PI), yA = CV + tr, yB = CV + tl + 0.001;
    flipMat.map = pageTex[(B.pf ?? 2) % pageTex.length];
    for (let i = 0; i < pa.count; i++) {
      const u = flipBase[i * 3] / BW_, z = flipBase[i * 3 + 2];
      // integrate the bent page from the spine outwards
      let x = 0, y = 0; const N = 12;
      for (let s = 0; s < N; s++) { const uu = (s + 0.5) / N * u, ph = t * Math.PI - bend * uu * (t < 0.5 ? 1 : -0.4); x += Math.cos(ph) * u * BW_ / N; y += Math.sin(ph) * u * BW_ / N; }
      pa.setXYZ(i, x, y + yA + (yB - yA) * t + 0.0008, z);
    }
    pa.needsUpdate = true; flipGeo.computeVertexNormals();
  }
}

// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25;
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
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
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 }, fogCol: { value: new THREE.Color() },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 }, inkFar: { value: 520 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash, inkFar; uniform vec3 fogCol, lift, gain; varying vec2 vUv;
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
    return e * (1. - smoothstep(inkFar*.27, inkFar, d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, vec3(1.), max(flash, 0.));
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
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0; skyU.stars.value = L.stars || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000'); inkU.inkFar.value = L.inkFar || 520;
  waterU.deep.value.set(L.waterDeep); waterU.shal.value.set(L.waterShal); waterU.glint.value.set(L.glint); waterU.uw.value.set(L.uw || '#3aa0a0');
  for (const m of cloudMat) { m.color.set(L.cloud || '#ffffff'); m.opacity = L.cloudA ?? 1; }
  WIN.color.set(L.window || '#dfe6ea');
  foamMat.color.set(L.foam || '#ffffff');
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 120); sun.target.position.copy(focus);
  const ext = L.shadowExt || 30, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 300; sc.updateProjectionMatrix();
}

function worldState(S, f) {
  const ext = S.set !== 'int';
  world.visible = ext; inner.visible = !ext;
  waterU.t.value = f / 30;
  // lamp + beams
  const lit = S.lamp ?? 0;
  M.lens.emissiveIntensity = lit * 1.6;
  lampGlow.visible = lampGlow2.visible = lit > 0.01;
  lampGlow.material.opacity = Math.min(1, lit) * (S.glowA ?? 0.85); lampGlow2.material.opacity = Math.min(1, lit);
  lampGlow.scale.setScalar(S.glowS ?? 7);
  lampGlow.material.depthTest = !S.glowOnTop; lampGlow.renderOrder = S.glowOnTop ? 20 : 8;
  beamMat.uniforms.I.value = (S.beam ?? 0);
  beamG.rotation.y = S.beamAng ?? 0;
  // keeper's lamp-room light falls on him / candle light
  point.intensity = S.point?.i ?? 0; if (S.point) { point.position.set(...S.point.pos); point.color.set(S.point.col || '#ffb35c'); point.distance = S.point.d || 6; }
  candleGlow.visible = !!S.candle; if (S.candle) { const fl = 0.85 + 0.15 * Math.sin(f * 0.9) * Math.sin(f * 0.37 + 1); candleGlow.material.opacity = fl * S.candle; candleGlow.scale.setScalar(0.8 * fl); }
  foam.forEach((m, i) => { const k = 1 + 0.12 * Math.sin(f * 0.08 + i); m.scale.set(k, k, 1); m.material.opacity = 0.45; });
  shafts.forEach((m) => { m.visible = !!S.under; m.material.opacity = 0.16 + 0.08 * Math.sin(f * 0.05 + m.userData.ph); });
  boats.forEach((b, i) => { b.rotation.z = 0.04 * Math.sin(f * 0.07 + i * 2); b.position.y = 0.05 + 0.06 * Math.sin(f * 0.09 + i); });
  bookState(S.book);
}

function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1; c.mat.fog = a.fog !== false;
    c.mat.blending = a.add ? THREE.AdditiveBlending : THREE.NormalBlending; c.mat.depthWrite = !a.add;
    c.mesh.userData.ndSkip = !!a.add;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? a.y) + 0.02, a.z); c.blob.scale.set(0.95 * s, 0.6 * s, 1); }
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
  const S = shotAt(f), C = camAt(f), L = lightFor(S, f, C);
  applyLight(L);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.near = C.near || 0.03; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const W_ = worldAt(f, C); worldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  sky.position.copy(camera.position);
  for (const c of clouds) c.quaternion.copy(camera.quaternion);
  for (const b of billboards) b.quaternion.copy(camera.quaternion);
  // pass A: colour
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // pass B: normal + depth
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  if (window.DEBUG_ND) { const dm = new THREE.MeshBasicMaterial({ map: rtNd.texture }); const ds = fs(dm); renderer.setRenderTarget(null); renderer.render(ds, fsCam); return true; }
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0); inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
