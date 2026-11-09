// cartoon-short-kit engine, landscape 1920x1080 edition (multi-set, split screen, prop cards).
import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { buildSets } from './sets.js';
import { TOTAL, shotAt, camAt, dofAt, lightFor, actorsAt, worldAt, fxAt } from './story.js';

const W = 1920, H = 1080;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([96, 96, 96, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });

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
const flatNd = new THREE.ShaderMaterial({ // surfaces that keep depth but never get ink (water, glass, backdrops)
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`, side: THREE.DoubleSide,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = opts.recv ?? true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};

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
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
const fill = new THREE.PointLight('#ffffff', 0, 0, 2); scene.add(fill); // optional warm practical (lamp, candles)
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// ---------- sets ----------
const SETS = buildSets({ THREE, T, P, scene, add, box, tbox, toon, grad, flatNd });

// ---------- cards ----------
const CM = 2.25, UPM = CM / 1000; // metres per design unit (design 600x1000 -> 1.35 x 2.25 m)
const SHAPES = { tall: [600, 1000], wide: [1000, 600], sq: [800, 800], big: [1600, 900] };
const geos = {};
const geoFor = (shape, cen) => geos[shape + cen] || (geos[shape + cen] = (() => { const [dw, dh] = SHAPES[shape]; const g = new THREE.PlaneGeometry(dw * UPM, dh * UPM); if (!cen) g.translate(0, dh * UPM / 2 - 25 * UPM, 0); return g; })());
const blobTex = P.tex(P.radial('20,14,30', 0.55));
class Card {
  constructor(shape, cen = '') {
    const [dw, dh] = SHAPES[shape]; this.shape = shape; this.dw = dw; this.dh = dh;
    const k = shape === 'big' ? 1.1 : 1.6; this.k = k;
    this.c = document.createElement('canvas'); this.c.width = dw * k; this.c.height = dh * k; this.g = this.c.getContext('2d');
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(geoFor(shape, cen), this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true; this.mesh.userData.card = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.c.width, this.c.height); g.setTransform(this.k, 0, 0, this.k, 0, 0);
    const p = new T.Pen(g); fn(p, this.dw, this.dh); this.t.needsUpdate = true;
  }
}
const pools = {};
const getCard = (shape, cen, i) => { const k = shape + cen, pl = pools[k] || (pools[k] = []); return pl[i] || (pl[i] = new Card(shape, cen)); };

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 2.0 },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 },
  split: { value: 0 }, fadeCol: { value: new THREE.Color(0, 0, 0) }, fade: { value: 0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash, split, fade; uniform vec3 lift, gain, fadeCol; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    if (c.g > .99 && c.r > .49 && c.r < .51) return 0.; // flat (no-ink) surfaces
    float e = 0.; float rr = r * clamp(4./d, .7, 1.3);
    for (int i=0;i<12;i++){ float a = float(i)*1.0472 + (i>5 ? .52 : 0.); float k = i>5 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;
      if (card) ds = 1e4;
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.01, .03, (ds - d)/d));
      if (!card && abs(ds-d)/d < .05) e = max(e, smoothstep(.86, .7, dot(n, ns)) * .85);
    }
    return e * (1. - smoothstep(60., 300., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.03,.02,.04), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.6), q*vec2(1.,.6))*2.0;
    c = mix(c, vec3(1.), max(flash, 0.));
    if (split > .5) { float dx = abs(vUv.x - .5) * res.x; c = mix(c, vec3(.03,.02,.04), smoothstep(9., 7., dx)); c = mix(c, vec3(1.,.97,.92), smoothstep(5., 3.5, dx)); }
    c = mix(c, fadeCol, fade);
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
  if (scene.fog) { scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar; }
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat ?? 1.08; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
  sky.visible = L.sky_ !== false;
  if (L.fill) { fill.color.set(L.fill.col); fill.intensity = L.fill.i; fill.distance = L.fill.d || 0; fill.position.set(...L.fill.pos); } else fill.intensity = 0;
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 60); sun.target.position.copy(focus);
  const ext = L.shadowExt || 12, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
}

let cardList = [];
function prepActors(list) {
  for (const k in pools) pools[k].forEach((c) => { c.mesh.visible = c.blob.visible = false; c.used = false; });
  const cnt = {}; cardList = [];
  list.forEach((a) => {
    const shape = a.shape || 'tall', cen = a.center ? 'c' : ''; const i = cnt[shape + cen] = (cnt[shape + cen] ?? -1) + 1;
    const c = getCard(shape, cen, i); c.draw(a.key, a.draw); c.used = true; cardList.push([c, a]);
  });
}
function orientActors(cam, half) {
  for (const [c, a] of cardList) {
    const on = a.half === undefined || half === undefined || a.half === half;
    c.mesh.visible = on && (a.alpha ?? 1) > 0.001; c.blob.visible = false; if (!c.mesh.visible) continue;
    const s = a.s || 1;
    c.mesh.position.set(a.x, a.y, a.z);
    c.mesh.scale.set(s * (a.flip ? -1 : 1) * (a.sx ?? 1), s * (a.sy || 1), s);
    const yaw = a.fixedYaw ?? (Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0));
    c.mesh.rotation.order = 'YXZ'; c.mesh.rotation.set(a.rx || 0, yaw, a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1; c.mat.depthWrite = a.alpha === undefined || a.alpha > 0.98;
    c.mat.fog = a.fog !== false;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob === true || (a.blob !== false && a.ground !== undefined)) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? a.y) + 0.015, a.z); c.blob.scale.set(1.05 * s * (a.blobW || 1), 0.6 * s * (a.blobW || 1), 1); }
  }
}

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip) { o.userData.vis0 = o.visible; o.visible = false; return; }
      if (o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || (o.userData.flat ? flatNd : ndMat);
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

const setCam = (C, aspect) => {
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.aspect = aspect; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
};

window.renderFrame = (f) => {
  const S = shotAt(f), L = lightFor(S, f), C = camAt(f), Wd = worldAt(f);
  applyLight(L);
  for (const k in SETS) SETS[k].group.visible = false;
  for (const name of [].concat(Wd.set)) { const st = SETS[name]; st.group.visible = true; st.update && st.update(Wd, f); }
  const views = C.split ? [[C.split[0], 0, 0, W / 2], [C.split[1], 1, W / 2, W / 2]] : [[C, undefined, 0, W]];
  prepActors([...actorsAt(f, T), ...fxAt(f, T)]);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || (C.split ? C.split[0].look : C.look))));
  const pass = (target, nd) => {
    renderer.setRenderTarget(target); renderer.setScissorTest(false);
    if (nd) renderer.setClearColor(0x000000, 0); else renderer.setClearColor(L.bg || '#2a2630', 1);
    renderer.clear();
    for (const [Cv, half, x0, w] of views) {
      if (L.halves) applyLight({ ...L, ...L.halves[half] });
      setCam(Cv, w / H); sky.position.copy(camera.position); orientActors(camera, half);
      if (SETS._billboards) SETS._billboards(camera);
      target.viewport.set(x0, 0, w, H); target.scissor.set(x0, 0, w, H); target.scissorTest = views.length > 1;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
    }
    target.viewport.set(0, 0, W, H); target.scissor.set(0, 0, W, H); target.scissorTest = false; renderer.setRenderTarget(target);
  };
  pass(rtColor, false);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); pass(rtNd, true); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  const D = dofAt(f);
  inkU.px.value = 2.0; inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0); inkU.vig.value = L.vig ?? 0.2;
  inkU.split.value = C.split ? 1 : 0; inkU.fade.value = C.fade || 0; inkU.fadeCol.value.set(C.fadeCol || '#000000');
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = C.split ? 0 : D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
