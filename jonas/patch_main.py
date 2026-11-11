#!/usr/bin/env python3
"""Generic-world patch for cartoon-short-kit main.js: removes the built-in Roman bridge world and helmet prop,
builds the world from the project's own web/scene.js instead. Idempotent.
Usage: python3 patch_main.py <project>/web"""
import sys, pathlib, re
web = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "web")
p = web / "main.js"; s = p.read_text()
if "// generic-world-patch" in s:
    print("main.js: already patched"); sys.exit(0)

def cut(src, start, end, new):
    i, j = src.index(start), src.index(end)
    assert i < j, start
    return src[:i] + new + src[j:]

s = s.replace("import * as P from './paint.js';\n", "import * as P from './paint.js';\nimport * as SC from './scene.js'; // generic-world-patch\n", 1)
WORLD = r'''// ---------- world: built by the story's scene.js (generic-world-patch) ----------
const world = new THREE.Group(); scene.add(world);
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };
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
    void main(){ vec2 p = vW.xz*vec2(.35,.12) + vec2(0., -t*.25);
      float n = noise(p) * .6 + noise(p*2.3 + 7.) * .4;
      vec3 c = mix(deep, shal, .35 + .4*n);
      float streak = smoothstep(.72, .78, noise(vW.xz*vec2(.8,.09) + vec2(0., -t*.6)));
      c = mix(c, glint, streak*.75);
      gl_FragColor = vec4(c,1.);
      #include <fog_fragment>
    }`,
});
// painted billboard clouds (no fog, no ink)
const clouds = [];
const addClouds = (n = 14, seed = 90, dist = 650, h0 = 120) => { const r = P.rng(seed);
  for (let i = 0; i < n; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = dist + r() * dist * 0.4; m.position.set(Math.cos(a) * d, h0 + r() * h0 * 1.3, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } };
/** canvas texture helper for painted signs, posters, book pages (German text only) */
const canvasTex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const CTX = { THREE, T, P, scene, world, add, box, tbox, toon, texM, M, grad, rx, waterMat, waterU, waterNd, clouds, addClouds, canvasTex };
SC.build(CTX);

'''
s = cut(s, "// ---------- world ----------", "// ---------- cards ----------", WORLD)
s = cut(s, "function worldState(S, f) {", "function drawActors(list, cam) {",
        "function worldState(S, f) { waterU.t.value = f / 30; if (SC.update) SC.update(CTX, S, f); }\n\n")
s = s.replace("if (a.blob !== false && a.y < DECK + 0.5) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? DECK) + 0.02, a.z);",
              "if (a.blob !== false) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? a.y) + 0.02, a.z);")
s = cut(s, "const helmetState = (h) => {", "const swapForNd = (on) => {", "")
s = s.replace("  helmetState(W_.helmet);\n", "")
# helmet materials are no longer needed
s = re.sub(r"// helmet\nconst helmetIn = .*?\nM\.helmOut = .*?\n", "", s, flags=re.S)
assert "DECK" not in s, "DECK still referenced"
p.write_text(s); print("main.js: patched (world now comes from web/scene.js)")
