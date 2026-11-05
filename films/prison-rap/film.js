// "Hapishanede Rap" — 40 s silent vertical 3D short (three.js). No audio, no text.
// The film is a pure function of time: renderAt(t) poses every object for time t and draws one frame.
// Story: a bored inmate taps beats in his cell; a pigeon brings a little voice recorder to the barred
// window; he dodges the searchlight, raps into it while the block bangs along, then fakes sleep
// when the guard's flashlight passes, and sneaks one last red "REC" glow.
export function createFilm(THREE, canvas) {
  const W = 1080, H = 1920, FPS = 24, DURATION = 40, BPM = 92, BEAT = 60 / BPM;

  // ---------- helpers ----------
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const sm = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
  const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const seg = (t, a, b) => ease(clamp((t - a) / (b - a)));
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const vl = (a, b, k) => a.clone().lerp(b, k);
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const beatPhase = t => (t / BEAT) % 1;
  const kick = t => Math.pow(1 - beatPhase(t), 4);            // 1 on the beat, decays

  // ---------- renderer ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.autoClear = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.04, 600);

  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .82, metalness: 0, ...o });
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  function mk(geo, mat, parent, p = [0, 0, 0], r = [0, 0, 0], s = null, sh = true) {
    const m = new THREE.Mesh(geo, mat); m.position.set(...p); m.rotation.set(...r); if (s) m.scale.set(...s);
    m.castShadow = sh; m.receiveShadow = true; parent.add(m); return m;
  }

  // ---------- procedural textures ----------
  function canvasTex(w, h, draw, repeat = [1, 1]) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(...repeat); tx.anisotropy = 4; return tx;
  }
  function grime(g, w, h, base, r, n, a, sz) {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = r() * h, s = sz * (.3 + r());
      const gr = g.createRadialGradient(x, y, 0, x, y, s); const d = r() < .5 ? 0 : 255;
      gr.addColorStop(0, `rgba(${d},${d},${d},${a * r()})`); gr.addColorStop(1, `rgba(${d},${d},${d},0)`);
      g.fillStyle = gr; g.fillRect(x - s, y - s, s * 2, s * 2);
    }
    const im = g.getImageData(0, 0, w, h), D = im.data;
    for (let i = 0; i < D.length; i += 4) { const k = (r() - .5) * 18; D[i] += k; D[i + 1] += k; D[i + 2] += k; }
    g.putImageData(im, 0, 0);
  }
  const wallTex = canvasTex(512, 512, (g, w, h) => {
    const r = rng(7); grime(g, w, h, '#7d8a7f', r, 220, .10, 60);
    // painted lower band + water streaks
    g.fillStyle = 'rgba(40,60,58,.55)'; g.fillRect(0, h * .62, w, h * .38);
    g.fillStyle = 'rgba(20,25,22,.35)'; g.fillRect(0, h * .615, w, 3);
    for (let i = 0; i < 26; i++) { const x = r() * w, l = 40 + r() * 200; const gr = g.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(50,45,30,.25)'); gr.addColorStop(1, 'rgba(50,45,30,0)'); g.fillStyle = gr; g.fillRect(x, 0, 2 + r() * 4, l); }
  }, [2, 1]);
  const floorTex = canvasTex(512, 512, (g, w, h) => {
    const r = rng(11); grime(g, w, h, '#545a5a', r, 300, .14, 50);
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
  }, [4, 3]);
  const concreteTex = canvasTex(512, 512, (g, w, h) => { const r = rng(23); grime(g, w, h, '#6f6e69', r, 260, .16, 70); }, [8, 2]);
  const facadeTex = canvasTex(512, 512, (g, w, h) => {
    const r = rng(31); grime(g, w, h, '#8a8478', r, 260, .14, 70);
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }, [4, 2]);
  const groundTex = canvasTex(512, 512, (g, w, h) => { const r = rng(41); grime(g, w, h, '#2b302c', r, 400, .2, 40); }, [30, 30]);
  const glowTex = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const fenceTex = canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(170,180,185,1)'; g.lineWidth = 3;
    for (let i = -8; i < 16; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 + 256, 256); g.stroke(); g.beginPath(); g.moveTo(i * 32 + 256, 0); g.lineTo(i * 32, 256); g.stroke(); }
  }, [40, 3]);
  glowTex.colorSpace = THREE.SRGBColorSpace;

  // volumetric-looking light beam (additive, fades along its length and at the silhouette)
  function beamMat(color, str) {
    return new THREE.ShaderMaterial({
      uniforms: { uC: { value: new THREE.Color(color) }, uS: { value: str } },
      vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uC; uniform float uS; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float d=1.-vUv.y; float e=pow(abs(dot(normalize(vN),normalize(vV))),2.); float a=uS*e*pow(1.-d,1.6)*smoothstep(0.,.04,d); gl_FragColor=vec4(uC*a,1.); }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
  }
  function coneGeo(r0, r1, L, seg = 32) { const g = new THREE.CylinderGeometry(r0, r1, L, seg, 1, true); g.translate(0, -L / 2, 0); g.rotateX(-Math.PI / 2); return g; }

  // =====================================================================
  // CHARACTERS
  // =====================================================================
  function makePerson(o) {
    const suit = M(o.suit, { roughness: .9 }), skin = M(o.skin, { roughness: .6 }), dark = M(0x15161a, { roughness: .7 });
    const white = M(0xf2efe8, { roughness: .3 }), black = M(0x050505, { roughness: .2 });
    const P = { root: new THREE.Group() };
    const hips = new THREE.Group(); hips.position.y = .95; P.root.add(hips); P.hips = hips;
    mk(new THREE.SphereGeometry(.2, 20, 14), suit, hips, [0, .02, 0], [0, 0, 0], [1, .7, .76]);
    const spine = new THREE.Group(); spine.position.y = .05; hips.add(spine); P.spine = spine;
    mk(new THREE.CapsuleGeometry(.17, .3, 6, 18), suit, spine, [0, .27, 0], [0, 0, 0], [1.3, 1, .8]);
    if (o.number) { mk(box(.12, .06, .01), white, spine, [.1, .4, .145], [0, 0, 0], null, false); }
    if (o.belt) mk(new THREE.CylinderGeometry(.205, .205, .05, 20), dark, spine, [0, .07, 0], [0, 0, 0], [1.25, 1, .8]);
    const neck = new THREE.Group(); neck.position.y = .54; spine.add(neck); P.neck = neck;
    mk(new THREE.CylinderGeometry(.055, .065, .12, 12), skin, neck, [0, .03, 0]);
    const head = new THREE.Group(); head.position.y = .08; neck.add(head); P.head = head;
    mk(new THREE.SphereGeometry(.13, 28, 20), skin, head, [0, .13, 0], [0, 0, 0], [1, 1.1, 1.03]);
    mk(new THREE.SphereGeometry(.105, 20, 14), skin, head, [0, .06, .025], [0, 0, 0], [1, .8, 1]);           // jaw
    mk(new THREE.SphereGeometry(.03, 10, 8), skin, head, [.128, .12, 0], [0, 0, 0], [.6, 1, 1]);              // ears
    mk(new THREE.SphereGeometry(.03, 10, 8), skin, head, [-.128, .12, 0], [0, 0, 0], [.6, 1, 1]);
    mk(new THREE.SphereGeometry(.024, 10, 8), skin, head, [0, .1, .135], [0, 0, 0], [1, .9, 1.1]);            // nose
    if (o.beard) mk(new THREE.SphereGeometry(.108, 20, 14, 0, Math.PI * 2, Math.PI * .5, Math.PI * .5), M(o.beard, { roughness: 1 }), head, [0, .07, .028], [0, 0, 0], [1.02, .95, 1.04]);
    P.eyes = [];
    for (const s of [1, -1]) {
      const eg = new THREE.Group(); eg.position.set(s * .048, .145, .118); head.add(eg);
      mk(new THREE.SphereGeometry(.024, 14, 10), white, eg, [0, 0, 0], [0, 0, 0], null, false);
      const pu = mk(new THREE.SphereGeometry(.0125, 10, 8), black, eg, [0, 0, .02], [0, 0, 0], null, false);
      const brow = mk(box(.055, .013, .015), M(o.hair || 0x1a1410), head, [s * .05, .185, .128], [0, 0, 0], null, false);
      P.eyes.push({ g: eg, pu, brow, s });
    }
    const mouth = new THREE.Group(); mouth.position.set(0, .055, .128); head.add(mouth); P.mouth = mouth;
    mk(new THREE.SphereGeometry(.03, 14, 8), M(0x2a0c0c, { roughness: .5 }), mouth, [0, 0, 0], [0, 0, 0], [1, .3, .35], false);
    P.mouthMesh = mouth.children[0];
    if (o.hat === 'beanie') {
      const hm = M(o.hatColor, { roughness: 1 });
      mk(new THREE.SphereGeometry(.142, 26, 14, 0, Math.PI * 2, 0, Math.PI * .5), hm, head, [0, .15, -.006], [-.12, 0, 0], [1, 1.08, 1.06]);
      mk(new THREE.TorusGeometry(.137, .02, 8, 28), hm, head, [0, .158, -.006], [Math.PI / 2 - .12, 0, 0], [1, 1.03, 1]);
    } else if (o.hat === 'cap') {
      const hm = M(o.hatColor, { roughness: .7 });
      mk(new THREE.CylinderGeometry(.14, .145, .09, 24), hm, head, [0, .25, 0]);
      mk(new THREE.CylinderGeometry(.15, .15, .02, 24), hm, head, [0, .29, 0], [0, 0, 0], [1, 1, 1.1]);
      mk(box(.2, .012, .1), M(0x0b0c10), head, [0, .21, .15], [.2, 0, 0]);
      mk(box(.03, .03, .01), M(0xd8b24a, { metalness: .8, roughness: .3 }), head, [0, .26, .146], [0, 0, 0], null, false);
    } else {
      mk(new THREE.SphereGeometry(.134, 24, 12, 0, Math.PI * 2, 0, Math.PI * .45), M(o.hair || 0x1a1410, { roughness: 1 }), head, [0, .14, -.01], [0, 0, 0], [1, 1.08, 1.05]);
    }
    P.sh = {}; P.el = {}; P.hand = {}; P.hip = {}; P.knee = {}; P.foot = {};
    for (const s of [1, -1]) {
      const k = s > 0 ? 'L' : 'R';
      const sh = new THREE.Group(); sh.position.set(s * .25, .47, 0); spine.add(sh); P.sh[k] = sh;
      mk(new THREE.SphereGeometry(.075, 14, 10), suit, sh);
      mk(new THREE.CapsuleGeometry(.063, .2, 4, 12), suit, sh, [0, -.15, 0]);
      const el = new THREE.Group(); el.position.y = -.3; sh.add(el); P.el[k] = el;
      mk(new THREE.CapsuleGeometry(.056, .1, 4, 12), suit, el, [0, -.06, 0]);
      mk(new THREE.CapsuleGeometry(.047, .12, 4, 12), o.sleeves ? suit : skin, el, [0, -.18, 0]);
      const hd = new THREE.Group(); hd.position.y = -.29; el.add(hd); P.hand[k] = hd;
      mk(new THREE.SphereGeometry(.055, 14, 10), o.gloves ? dark : skin, hd, [0, -.045, 0], [0, 0, 0], [.85, 1.1, .7]);
      mk(new THREE.CapsuleGeometry(.018, .04, 3, 8), o.gloves ? dark : skin, hd, [-s * .045, -.03, .03], [.4, 0, s * .6]);
      const hp = new THREE.Group(); hp.position.set(s * .1, -.02, 0); hips.add(hp); P.hip[k] = hp;
      mk(new THREE.CapsuleGeometry(.083, .28, 4, 12), suit, hp, [0, -.22, 0]);
      const kn = new THREE.Group(); kn.position.y = -.44; hp.add(kn); P.knee[k] = kn;
      mk(new THREE.CapsuleGeometry(.072, .3, 4, 12), suit, kn, [0, -.21, 0]);
      const ft = new THREE.Group(); ft.position.y = -.44; kn.add(ft); P.foot[k] = ft;
      mk(box(.11, .075, .25), M(o.shoe || 0xe8e6e0, { roughness: .6 }), ft, [0, -.035, .055]);
    }
    return P;
  }
  // pose: every value defaults to 0
  function pose(P, q) {
    const g = k => q[k] || 0;
    P.root.position.set(g('x'), g('y'), g('z')); P.root.rotation.set(g('rx'), g('ry'), g('rz'));
    P.hips.position.y = .95 + g('hy'); P.hips.rotation.set(g('hx'), g('hry'), g('hz'));
    P.spine.rotation.set(g('sx'), g('sy'), g('sz'));
    P.neck.rotation.set(g('nx'), g('ny'), g('nz'));
    P.head.rotation.set(g('hdx'), g('hdy'), g('hdz'));
    for (const k of ['L', 'R']) {
      const a = q['a' + k] || [0, 0, 0]; P.sh[k].rotation.set(a[0], a[1] || 0, a[2] || 0);
      P.el[k].rotation.set(q['e' + k] || 0, 0, 0);
      const h = q['w' + k] || [0, 0, 0]; P.hand[k].rotation.set(h[0], h[1] || 0, h[2] || 0);
      const l = q['l' + k] || [0, 0, 0]; P.hip[k].rotation.set(l[0], l[1] || 0, l[2] || 0);
      P.knee[k].rotation.set(q['k' + k] || 0, 0, 0);
      P.foot[k].rotation.set(q['f' + k] || 0, 0, 0);
    }
    const open = g('mouth'), smile = g('smile');
    P.mouthMesh.scale.set(1 + smile * .5 - open * .15, .3 + open * 1.6, .35);
    P.mouth.rotation.z = 0;
    const blink = q.blink === undefined ? 1 : 1 - q.blink, lid = [q.lidL ?? blink, q.lidR ?? blink];
    P.eyes.forEach((e, i) => {
      e.g.scale.set(1, Math.max(.08, i === 0 ? lid[0] : lid[1]), 1);
      e.pu.position.set(g('lookX') * .009, g('lookY') * .008, .02);
      e.brow.position.y = .185 + g('brow') * .012;
      e.brow.rotation.z = e.s * (g('browTilt') * .35);
    });
  }
  const blend = (A, B, k) => { const o = {}; for (const key of new Set([...Object.keys(A), ...Object.keys(B)])) { const a = A[key], b = B[key]; if (Array.isArray(a) || Array.isArray(b)) { const aa = a || [0, 0, 0], bb = b || [0, 0, 0]; o[key] = [0, 1, 2].map(i => lerp(aa[i] || 0, bb[i] || 0, k)); } else o[key] = lerp(a ?? (key.startsWith('lid') || key === 'blink' ? 0 : 0), b ?? 0, k); } return o; };
  const blinkAt = (t, off = 0) => { const p = (t + off) % 3.7; return p < .12 ? Math.sin(p / .12 * Math.PI) : 0; };

  function makePigeon() {
    const P = { root: new THREE.Group() };
    const grey = M(0x7b8290, { roughness: .9 }), light = M(0xa7adb8, { roughness: .9 }), neckM = M(0x3b6a5a, { roughness: .35, metalness: .4 });
    const body = new THREE.Group(); P.root.add(body); P.body = body;
    mk(new THREE.SphereGeometry(.1, 18, 14), light, body, [0, .11, 0], [0, 0, 0], [.9, .85, 1.35]);
    mk(new THREE.SphereGeometry(.07, 14, 10), neckM, body, [0, .17, .08], [0, 0, 0], [1, 1.1, 1]);
    mk(box(.09, .015, .12), grey, body, [0, .12, -.16], [.25, 0, 0]);                                          // tail
    const head = new THREE.Group(); head.position.set(0, .23, .1); body.add(head); P.head = head;
    mk(new THREE.SphereGeometry(.045, 14, 10), grey, head);
    mk(new THREE.ConeGeometry(.012, .04, 8), M(0x3a3230), head, [0, -.005, .055], [Math.PI / 2, 0, 0]);
    for (const s of [1, -1]) mk(new THREE.SphereGeometry(.009, 8, 6), M(0xff7a1a, { emissive: 0x401800 }), head, [s * .033, .012, .025], [0, 0, 0], null, false);
    P.wing = {};
    for (const s of [1, -1]) {
      const w = new THREE.Group(); w.position.set(s * .07, .15, 0); body.add(w); P.wing[s] = w;
      mk(box(.2, .012, .16), grey, w, [s * .1, 0, -.02]);
      mk(box(.12, .01, .1), M(0x2f3138), w, [s * .2, 0, -.04]);
    }
    for (const s of [1, -1]) mk(new THREE.CylinderGeometry(.006, .006, .06, 6), M(0xc0434a), body, [s * .03, .02, .01]);
    P.root.scale.setScalar(1.7);
    return P;
  }
  function makeRecorder() {
    const g = new THREE.Group();
    mk(box(.07, .15, .028), M(0x22252b, { roughness: .35, metalness: .5 }), g, [0, 0, 0]);
    mk(box(.06, .045, .03), M(0x9aa1a8, { roughness: .3, metalness: .9 }), g, [0, .06, 0]);                     // mic grille
    for (let i = 0; i < 4; i++) mk(box(.05, .004, .032), M(0x2b2e33), g, [0, .045 + i * .01, 0], [0, 0, 0], null, false);
    mk(box(.04, .03, .03), M(0x0d1418, { emissive: 0x0a2a30, emissiveIntensity: .6 }), g, [0, .01, .0], [0, 0, 0], null, false);  // screen
    mk(new THREE.CylinderGeometry(.012, .012, .03, 14), M(0x8a1820), g, [0, -.04, 0], [Math.PI / 2, 0, 0], null, false);
    const ledMat = new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0xff1a1a, emissiveIntensity: 0 });
    const led = mk(new THREE.SphereGeometry(.007, 10, 8), ledMat, g, [.022, .03, .016], [0, 0, 0], null, false);
    const ledLight = new THREE.PointLight(0xff2020, 0, 1.2, 2); ledLight.position.set(.022, .03, .06); g.add(ledLight);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff3030, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    halo.scale.setScalar(.09); halo.position.set(.022, .03, .02); g.add(halo);
    g.userData = { ledMat, ledLight, halo };
    g.scale.setScalar(1.15);
    return g;
  }
  function setRec(rec, on) { const u = rec.userData; u.ledMat.emissiveIntensity = on * 6; u.ledLight.intensity = on * 1.2; u.halo.material.opacity = on * .9; }

  // =====================================================================
  // SET 1 — CELL BLOCK INTERIOR (three cells + corridor)
  // =====================================================================
  const cell = new THREE.Group(); scene.add(cell);
  const wallM = M(0xffffff, { map: wallTex, roughness: .95 }), floorM = M(0xffffff, { map: floorTex, roughness: .75, metalness: .05 });
  const steel = M(0x8c949c, { metalness: .85, roughness: .38 }), darkSteel = M(0x3b4148, { metalness: .8, roughness: .45 });
  mk(box(16, .1, 9), floorM, cell, [0, -.05, 1.3]);
  mk(box(16, .2, 9), M(0x5e655f, { roughness: 1 }), cell, [0, 3.1, 1.3]);                                   // ceiling
  // back wall with a window hole (x ±.45, y 1.75–2.35), 0.4 thick
  const BW = { z: -2.7, d: .4 };
  mk(box(7.55, 3.2, BW.d), wallM, cell, [-4.225, 1.6, BW.z]);
  mk(box(7.55, 3.2, BW.d), wallM, cell, [4.225, 1.6, BW.z]);
  mk(box(.9, 1.75, BW.d), wallM, cell, [0, .875, BW.z]);
  mk(box(.9, .85, BW.d), wallM, cell, [0, 2.775, BW.z]);
  mk(box(1.1, .05, .5), M(0x6a6f6c), cell, [0, 1.75, BW.z - .05]);                                            // sill
  for (const x of [-.3, -.15, 0, .15, .3]) mk(new THREE.CylinderGeometry(.016, .016, .6, 8), darkSteel, cell, [x, 2.05, -2.56]);
  mk(box(.9, .03, .03), darkSteel, cell, [0, 2.05, -2.56]);
  // side walls between cells
  for (const x of [-6.3, -2.1, 2.1, 6.3]) mk(box(.2, 3.1, 5.2), wallM, cell, [x, 1.55, -.1]);
  // corridor wall + lamps
  mk(box(16, 3.1, .2), wallM, cell, [0, 1.55, 5.4]);
  mk(box(16, .3, .25), M(0x2c3330), cell, [0, .15, 5.28]);
  // bars: instanced
  const barXs = []; for (const cx of [-4.2, 0, 4.2]) for (let i = 0; i <= 24; i++) barXs.push(cx - 1.92 + i * .16);
  const bars = new THREE.InstancedMesh(new THREE.CylinderGeometry(.02, .02, 2.62, 8), darkSteel, barXs.length);
  const tmp = new THREE.Object3D();
  barXs.forEach((x, i) => { tmp.position.set(x, 1.31, 2.5); tmp.updateMatrix(); bars.setMatrixAt(i, tmp.matrix); });
  bars.castShadow = true; bars.receiveShadow = true; cell.add(bars);
  for (const cx of [-4.2, 0, 4.2]) {
    for (const y of [.12, 1.15, 2.55]) mk(box(3.95, .05, .05), darkSteel, cell, [cx, y, 2.5]);
    mk(box(4.2, .5, .25), wallM, cell, [cx, 2.85, 2.5]);                                                      // header
    mk(box(.1, .14, .08), steel, cell, [cx + 1.6, 1.15, 2.56]);                                                // lock
  }
  // furniture for each cell
  const pillows = {};
  function furnish(cx, seed) {
    const r = rng(seed);
    mk(box(2.2, .06, .8), steel, cell, [cx, .37, -2.05]);
    for (const [dx, dz] of [[-1.05, -2.4], [1.05, -2.4], [-1.05, -1.7], [1.05, -1.7]]) mk(new THREE.CylinderGeometry(.025, .025, .37, 8), steel, cell, [cx + dx, .185, dz]);
    mk(new THREE.BoxGeometry(2.1, .12, .74, 4, 1, 2), M(0xc9c5b6, { roughness: 1 }), cell, [cx, .46, -2.05]);
    mk(box(1.25, .05, .78), M(0x3c4a63 + Math.floor(r() * 3) * 0x050505, { roughness: 1 }), cell, [cx + .38, .53, -2.03]);
    pillows[cx] = mk(new THREE.SphereGeometry(.3, 18, 10), M(0xe6e2d6, { roughness: 1 }), cell, [cx - .8, .58, -2.1], [0, 0, 0], [.9, .25, .55]);
    // steel toilet + sink
    mk(box(.5, .45, .45), steel, cell, [cx + 1.65, .225, 1.4]);
    mk(new THREE.CylinderGeometry(.21, .17, .1, 18), steel, cell, [cx + 1.6, .5, 1.4]);
    mk(box(.12, .5, .5), steel, cell, [cx + 1.94, .7, 1.4]);
    mk(box(.4, .12, .35), steel, cell, [cx + 1.8, .95, .6]);
    mk(box(.02, .35, .3), M(0xcfd6dc, { metalness: 1, roughness: .1 }), cell, [cx + 1.99, 1.45, .6]);           // steel mirror
    // shelf + cup + books
    mk(box(.3, .03, .8), M(0x6b4f35), cell, [cx - 1.85, 1.35, .2]);
    mk(new THREE.CylinderGeometry(.04, .035, .1, 14), M(0xd0d0d0, { metalness: .7, roughness: .3 }), cell, [cx - 1.85, 1.415, .45]);
    for (let i = 0; i < 3; i++) mk(box(.18, .22, .05), M([0x7a2e2e, 0x2e4f7a, 0x5d6b38][i]), cell, [cx - 1.85, 1.475, -.05 - i * .06]);
    // tally marks scratched on the wall (groups of five)
    const tm = M(0x2e3530);
    for (let gI = 0; gI < 5; gI++) {
      const bx = .8 - gI * .16, by = 1.0 + (gI % 2) * .02;
      for (let k = 0; k < 4; k++) mk(box(.004, .09, .01), tm, cell, [cx - 1.995, by, bx + k * .025], [0, Math.PI / 2, 0], null, false);
      mk(box(.004, .12, .01), tm, cell, [cx - 1.995, by, bx + .037], [1.0, Math.PI / 2, 0], null, false);
    }
  }
  [-4.2, 0, 4.2].forEach((cx, i) => furnish(cx, 100 + i));
  // corridor ceiling fixtures
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffc070, emissiveIntensity: 3 });
  for (const x of [-4.2, 0, 4.2]) { mk(box(.6, .06, .2), lampMat, cell, [x, 2.97, 3.9], [0, 0, 0], null, false); mk(box(.7, .04, .3), darkSteel, cell, [x, 3.0, 3.9]); }
  // sky outside the window
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x0b1830 });
  const sky = mk(new THREE.PlaneGeometry(30, 20), skyMat, cell, [0, 4, -14], [0, 0, 0], null, false); sky.receiveShadow = false;
  const moonIn = mk(new THREE.SphereGeometry(.9, 24, 16), new THREE.MeshBasicMaterial({ color: 0xe8eeff }), cell, [1.6, 4.4, -13], [0, 0, 0], null, false);
  const moonGlowIn = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x9fb8ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .8 }));
  moonGlowIn.scale.setScalar(6); moonGlowIn.position.copy(moonIn.position); cell.add(moonGlowIn);
  // lights
  const cellHemi = new THREE.HemisphereLight(0x7d93bd, 0x2a241c, .6); cell.add(cellHemi);
  const moon = new THREE.DirectionalLight(0xa8c0ff, 3.2);
  moon.position.set(.9, 9.2, -13.5); moon.target.position.set(0, 0, .2); cell.add(moon, moon.target);
  moon.castShadow = true; Object.assign(moon.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 30 }); moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -.0008; moon.shadow.normalBias = .02;
  const corr = new THREE.SpotLight(0xffb468, 22, 14, .95, .6, 1.6);
  corr.position.set(0, 2.9, 4.1); corr.target.position.set(0, 0, .2); cell.add(corr, corr.target);
  corr.castShadow = true; corr.shadow.mapSize.set(1024, 1024); corr.shadow.bias = -.0006; corr.shadow.camera.near = .5;
  const corrSide = [-4.2, 4.2].map(x => { const l = new THREE.PointLight(0xffb468, 6, 8, 1.8); l.position.set(x, 2.7, 3.9); cell.add(l); return l; });
  const fill = new THREE.PointLight(0x6d7fa8, 1.2, 7, 2); fill.position.set(.5, 2.4, 1); cell.add(fill);
  // moonbeam through the window
  const shaftDir = moon.target.position.clone().sub(moon.position).normalize();
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(.86, .56, 1, 1, 1, 1), beamMat(0x9fb8ff, .18));
  { const g = new THREE.CylinderGeometry(.5, .5, 1, 4, 1, true); g.rotateY(Math.PI / 4); g.translate(0, -.5, 0); g.rotateX(-Math.PI / 2); g.scale(.86 / .707, .6 / .707, 3.6); shaft.geometry = g; }
  shaft.position.set(0, 2.05, -2.7); shaft.lookAt(shaft.position.clone().add(shaftDir)); cell.add(shaft);
  // searchlight sweeping through the window (scene 3)
  const sweep = new THREE.SpotLight(0xf4f8ff, 0, 40, .22, .35, 1); sweep.position.set(-6, 8, -16); cell.add(sweep, sweep.target);
  sweep.castShadow = true; sweep.shadow.mapSize.set(1024, 1024); sweep.shadow.bias = -.0006;
  // dust motes in the moonbeam
  const dustN = 260, dustBase = new Float32Array(dustN * 3), dustGeo = new THREE.BufferGeometry();
  { const r = rng(5); for (let i = 0; i < dustN; i++) { const d = r() * 3.4; const p = shaft.position.clone().add(shaftDir.clone().multiplyScalar(d)); dustBase.set([p.x + (r() - .5) * .9, p.y + (r() - .5) * .6, p.z + (r() - .5) * .3], i * 3); } }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustBase.slice(), 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xcfdcff, size: .006, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
  cell.add(dust);

  const camFill = new THREE.PointLight(0xffd9b8, 0, 6, 1.6); cell.add(camFill);
  // cast
  const hero = makePerson({ suit: 0xf26a1b, skin: 0xa06a48, hat: 'beanie', hatColor: 0x23262d, beard: 0x1b120c, number: true, shoe: 0xeeeeea });
  cell.add(hero.root);
  const nbL = makePerson({ suit: 0xe8641c, skin: 0xd9a77e, hat: 'none', hair: 0x6b4a2a, number: true });
  const nbR = makePerson({ suit: 0xf07a22, skin: 0x4e3123, hat: 'beanie', hatColor: 0x7a1e22, beard: 0x120c08, number: true });
  cell.add(nbL.root, nbR.root);
  const cupL = mk(new THREE.CylinderGeometry(.04, .035, .1, 14), M(0xd0d0d0, { metalness: .8, roughness: .25 }), nbL.hand.R, [0, -.07, .03], [Math.PI / 2, 0, 0]);
  const cupR = mk(new THREE.CylinderGeometry(.04, .035, .1, 14), M(0xd0d0d0, { metalness: .8, roughness: .25 }), nbR.hand.L, [0, -.07, .03], [Math.PI / 2, 0, 0]);
  const guard = makePerson({ suit: 0x1e2a44, skin: 0xc48f6a, hat: 'cap', hatColor: 0x161d30, belt: true, sleeves: true, shoe: 0x0a0a0a });
  cell.add(guard.root);
  const torch = new THREE.Group(); guard.hand.R.add(torch); torch.position.set(0, -.06, .05);
  mk(new THREE.CylinderGeometry(.025, .03, .2, 12), M(0x111111, { metalness: .6, roughness: .4 }), torch, [0, 0, .06], [Math.PI / 2, 0, 0]);
  const torchLens = mk(new THREE.CircleGeometry(.03, 16), new THREE.MeshBasicMaterial({ color: 0xfff6dd }), torch, [0, 0, .161], [0, 0, 0], null, false);
  const flash = new THREE.SpotLight(0xfff0d0, 0, 16, .3, .45, 1.2); flash.position.set(0, 0, .17); torch.add(flash);
  const flashTarget = new THREE.Object3D(); flashTarget.position.set(0, 0, 3); torch.add(flashTarget); flash.target = flashTarget;
  flash.castShadow = true; flash.shadow.mapSize.set(1024, 1024); flash.shadow.bias = -.0006;
  const flashBeam = new THREE.Mesh(coneGeo(.03, .9, 3.2), beamMat(0xfff0d0, .16)); flashBeam.position.set(0, 0, .17); torch.add(flashBeam);
  const pigeon = makePigeon(); cell.add(pigeon.root);
  const rec = makeRecorder(); cell.add(rec);
  // "sound" rings: pulses that leave the recorder on every beat while he raps
  const rings = [];
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(.1, .006, 8, 48), new THREE.MeshBasicMaterial({ color: 0xffa060, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); cell.add(m); rings.push(m); }

  // =====================================================================
  // SET 2 — PRISON EXTERIOR AT NIGHT (placed far away)
  // =====================================================================
  const ext = new THREE.Group(); ext.position.set(0, 0, -400); scene.add(ext);
  mk(new THREE.PlaneGeometry(500, 500), M(0xffffff, { map: groundTex, roughness: 1 }), ext, [0, 0, 0], [-Math.PI / 2, 0, 0], null, false);
  const facM = M(0xffffff, { map: facadeTex, roughness: .95 });
  mk(box(40, 14, 12), facM, ext, [0, 7, -30]);
  mk(box(41, .6, 12.6), M(0x4a4741), ext, [0, 14.2, -30]);
  // window grid on the facade (front face at z=-24)
  const winOff = new THREE.MeshStandardMaterial({ color: 0x0a0d12, roughness: .4 });
  const winDim = new THREE.MeshStandardMaterial({ color: 0x1b1308, emissive: 0xff9a40, emissiveIntensity: .35 });
  const winHot = new THREE.MeshStandardMaterial({ color: 0x2a1a08, emissive: 0xffa850, emissiveIntensity: 2.2 });
  const TARGET = V(2.0, 9.6, -23.95);
  { const r = rng(77); for (let row = 0; row < 4; row++) for (let col = 0; col < 14; col++) {
    const x = -16.25 + col * 2.5, y = 3.6 + row * 2.0;
    const hot = Math.abs(x - TARGET.x) < .1 && Math.abs(y - TARGET.y) < .1;
    const m = hot ? winHot : (r() < .25 ? winDim : winOff);
    mk(box(.9, .6, .1), m, ext, [x, y, -23.98], [0, 0, 0], null, false);
    for (const bx of [-.27, -.09, .09, .27]) mk(box(.025, .6, .04), darkSteel, ext, [x + bx, y, -23.9], [0, 0, 0], null, false);
    mk(box(1.1, .08, .2), M(0x5c5850), ext, [x, y - .34, -23.9], [0, 0, 0], null, false);
  } }
  const hotGlow = new THREE.PointLight(0xffa850, 1.2, 2, 2); hotGlow.position.set(TARGET.x, TARGET.y, -23.3); ext.add(hotGlow);
  // perimeter wall + razor wire
  mk(box(90, 6, .8), M(0xffffff, { map: concreteTex, roughness: 1 }), ext, [0, 3, -18]);
  mk(box(90, .3, 1), M(0x55534e), ext, [0, 6.1, -18]);
  const coils = new THREE.InstancedMesh(new THREE.TorusGeometry(.32, .014, 5, 16), steel, 220);
  for (let i = 0; i < 220; i++) { tmp.position.set(-44 + i * .4, 6.6, -18); tmp.rotation.set(0, Math.PI / 2 + Math.sin(i) * .25, 0); tmp.updateMatrix(); coils.setMatrixAt(i, tmp.matrix); }
  ext.add(coils);
  // guard tower
  const tower = new THREE.Group(); tower.position.set(-7, 0, -19.5); ext.add(tower);
  mk(new THREE.CylinderGeometry(1.1, 1.4, 11, 18), M(0xffffff, { map: concreteTex, roughness: 1 }), tower, [0, 5.5, 0]);
  mk(box(3.8, 2.4, 3.8), M(0x5b5a55), tower, [0, 12.2, 0]);
  mk(box(3.9, .9, 3.9), new THREE.MeshStandardMaterial({ color: 0x221a10, emissive: 0xffb060, emissiveIntensity: 1.2 }), tower, [0, 12.5, 0], [0, 0, 0], null, false);
  mk(new THREE.ConeGeometry(3.3, 1.6, 4), M(0x2a2b2e), tower, [0, 14.2, 0], [0, Math.PI / 4, 0]);
  const lampHead = mk(new THREE.CylinderGeometry(.35, .45, .6, 16), M(0x22262b, { metalness: .7, roughness: .4 }), tower, [1.4, 13.75, 1.4], [Math.PI / 2, 0, 0]);
  const search = new THREE.SpotLight(0xf6f9ff, 1600, 140, .13, .4, 1.4);
  search.position.set(-5.6, 13.75, -18.1); ext.add(search, search.target);
  search.castShadow = true; search.shadow.mapSize.set(1024, 1024); search.shadow.bias = -.0004; search.shadow.camera.far = 140;
  const searchBeam = new THREE.Mesh(coneGeo(.025, .13, 1), beamMat(0xe8f0ff, .7)); ext.add(searchBeam);
  // yard lamps along the wall
  const sodium = new THREE.MeshStandardMaterial({ color: 0x332211, emissive: 0xffa040, emissiveIntensity: 4 });
  for (const x of [-30, -6, 14, 32]) {
    mk(new THREE.CylinderGeometry(.08, .1, 7, 8), darkSteel, ext, [x, 3.5, -16.5]);
    mk(box(.5, .15, .3), sodium, ext, [x, 7, -16.3], [0, 0, 0], null, false);
    const l = new THREE.PointLight(0xffa040, 7, 12, 1.8); l.position.set(x, 6.7, -16); ext.add(l);
  }
  // chain-link fence in the foreground
  const fenceM = new THREE.MeshStandardMaterial({ map: fenceTex, transparent: true, alphaTest: .4, side: THREE.DoubleSide, metalness: .6, roughness: .5, color: 0x9aa4ab });
  fenceM.map.colorSpace = THREE.SRGBColorSpace;
  mk(new THREE.PlaneGeometry(120, 4.5), fenceM, ext, [0, 2.25, -6], [0, 0, 0], null, false);
  for (let i = -20; i <= 20; i++) mk(new THREE.CylinderGeometry(.05, .05, 4.8, 8), darkSteel, ext, [i * 3, 2.4, -6]);
  mk(new THREE.CylinderGeometry(.03, .03, 120, 6), darkSteel, ext, [0, 4.5, -6], [0, 0, Math.PI / 2]);
  // moon, stars
  const moonE = mk(new THREE.SphereGeometry(7, 32, 20), new THREE.MeshBasicMaterial({ color: 0xeef2ff }), ext, [-14, 52, -190], [0, 0, 0], null, false);
  const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x8fa8ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .9 }));
  moonGlow.scale.setScalar(70); moonGlow.position.copy(moonE.position); ext.add(moonGlow);
  { const r = rng(9), n = 1400, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const th = r() * Math.PI * 2, ph = r() * 1.3; pos.set([Math.cos(th) * Math.sin(ph) * 250, Math.cos(ph) * 250 + 10, Math.sin(th) * Math.sin(ph) * 250 - 60], i * 3); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    ext.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: .85, fog: false }))); }
  const extHemi = new THREE.HemisphereLight(0x4d66a0, 0x141612, 1.1); ext.add(extHemi);
  const extMoon = new THREE.DirectionalLight(0x9db4ff, 2.0); extMoon.position.set(-20, 45, 40); extMoon.target.position.set(0, 0, -25); ext.add(extMoon, extMoon.target);

  const fogExt = new THREE.FogExp2(0x0b1424, .007), fogCell = new THREE.FogExp2(0x101418, .03);

  // ---------- overlay: vignette + fades ----------
  const ovScene = new THREE.Scene(), ovCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const ovMat = new THREE.ShaderMaterial({
    uniforms: { uFade: { value: 0 }, uVig: { value: .55 }, uSeed: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
    fragmentShader: `uniform float uFade; uniform float uVig; uniform float uSeed; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233))+uSeed)*43758.5453); }
      void main(){ vec2 q=(vUv-.5)*vec2(.5625,1.)*1.6; float v=smoothstep(.35,1.05,length(q))*uVig; float n=(h(gl_FragCoord.xy)-.5)*.035;
        float a=clamp(max(v,uFade)+n,0.,1.); gl_FragColor=vec4(0.,0.,0.,a); }`,
    transparent: true, depthTest: false, depthWrite: false,
  });
  ovScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ovMat));

  // =====================================================================
  // ANIMATION
  // =====================================================================
  const SIT = { x: 0, z: -1.78, hy: -.4, aL: [-.25, 0, .12], aR: [-.25, 0, -.12], eL: -.9, eR: -.9, lL: [-1.55, 0, .08], lR: [-1.55, 0, -.08], kL: 1.5, kR: 1.5, sx: .25, nx: .1, hdx: .15 };
  const STAND = { aL: [.05, 0, .1], aR: [.05, 0, -.1], eL: -.15, eR: -.15 };

  function heroPose(t) {
    const b = t / BEAT, k = kick(t), ph = beatPhase(t), bl = blinkAt(t);
    // ----- scene 2: bored on the cot, tapping beats -----
    if (t < 14.7) {
      const tap = t > 7.2 ? Math.pow(Math.max(0, Math.sin(b * Math.PI * 2)), 6) : 0;
      const drum = sm(8.6, 9.2, t) * (1 - sm(11.4, 11.9, t));
      const look = sm(11.9, 12.7, t);
      const q = { ...SIT, blink: bl };
      q.hdx = lerp(.5, -.05, sm(6.2, 7.6, t)) - k * .1 * sm(7.5, 8.5, t);
      q.nx = .1 + k * .05 * sm(8, 9, t);
      q.sx = lerp(.45, .2, sm(6.2, 7.4, t));
      // right hand taps on knee, then both drum the cot frame
      q.aR = [lerp(-.25, -.05, drum), 0, lerp(-.12, -.3, drum)]; q.eR = lerp(-.9, -.6, drum) + tap * .25 * (1 - drum) + drum * k * .5;
      q.aL = [lerp(-.25, -.05, drum), 0, lerp(.12, .3, drum)]; q.eL = lerp(-.9, -.6, drum) + drum * kick(t + BEAT / 2) * .5;
      q.mouth = drum * Math.abs(Math.sin(b * Math.PI * 2)) * .4;
      q.brow = -.4 + drum * .6; q.browTilt = .3 - drum * .5; q.smile = drum * .3;
      q.lookX = 0; q.lookY = -.6 + sm(6.5, 7.5, t) * .6;
      // turns and looks up at the window
      q.sy = -look * .55; q.ny = -look * .45; q.hdy = -look * .5; q.hdx = lerp(q.hdx, -.55, look); q.nx = lerp(q.nx, -.25, look);
      q.lookY = lerp(q.lookY, 1, look); q.lookX = lerp(0, -1, look); q.brow = lerp(q.brow, 1, look); q.mouth = lerp(q.mouth, .35, look);
      // stands up on the cot (13.0–13.6)
      const up = sm(14.15, 14.7, t);
      if (up > 0) { const S = standOnCot(t); return blend(q, S, up); }
      return q;
    }
    // ----- scene 3: stands on cot, takes the recorder through the bars, ducks the searchlight -----
    if (t < 18.9) return standOnCot(t);
    // ----- gets down, presses REC -----
    if (t < 20.2) {
      const q = { x: 0, z: -1.15, ry: 0, blink: bl, ...STAND };
      q.aR = [-1.05, 0, .25]; q.eR = -1.35; q.wR = [.2, 0, 0];
      q.aL = [-.9, 0, -.15]; q.eL = -1.25;
      q.hdx = .35; q.nx = .1; q.lookY = -1; q.smile = sm(19.4, 19.9, t) * 1; q.brow = .6; q.browTilt = -.4;
      q.mouth = sm(19.5, 19.8, t) * .25;
      const jump = 1 - sm(18.9, 19.3, t); q.y = jump * .52; q.z = lerp(-2.0, -1.15, sm(18.9, 19.35, t)); q.ry = lerp(Math.PI, 0, sm(18.9, 19.35, t));
      q.hy = -Math.sin(sm(18.9, 19.5, t) * Math.PI) * .18; q.kL = q.kR = -q.hy * 3; q.lL = [-q.hy * 1.5, 0, .05]; q.lR = [-q.hy * 1.5, 0, -.05];
      return q;
    }
    // ----- scene 4: the rap -----
    if (t < 33.4) {
      const bar = Math.floor(b / 4), ib = b % 4, syl = Math.floor(b * 2);
      const q = { x: 0, z: -.7, blink: bl };
      q.ry = Math.sin(t * .7) * .25 + (bar % 2 ? .12 : -.12) * sm(0, .5, ib % 4);
      q.hy = -.06 - k * .07; q.kL = q.kR = .14 + k * .16; q.lL = [-.07 - k * .08, 0, .1]; q.lR = [-.07 - k * .08, 0, -.1];
      q.fL = q.fR = -.07 - k * .08;
      q.sx = .12 + k * .1; q.sz = Math.sin(b * Math.PI) * .06; q.nx = -.05 + k * .12; q.hdx = -.05 + k * .2; q.hdz = Math.sin(b * Math.PI) * .08;
      // recorder hand at the mouth
      q.aR = [-1.0 + k * .05, .25, .42]; q.eR = -2.15; q.wR = [.5, 0, .25];
      // free hand: chops on the beat, points, waves
      const style = bar % 3;
      if (style === 0) { q.aL = [-1.0 - k * .3, 0, -.2]; q.eL = -1.0 + k * .5; q.wL = [k * .5, 0, 0]; }
      else if (style === 1) { q.aL = [-1.7 + Math.sin(b * Math.PI) * .3, 0, -.5]; q.eL = -.3; q.wL = [-.4, 0, 0]; }
      else { q.aL = [-.6 - k * .2, .3, .7 + Math.sin(b * Math.PI * 2) * .3]; q.eL = -1.4; q.wL = [0, 0, .5]; }
      const on = hash(syl) > .25 ? 1 : .25;
      q.mouth = Math.pow(Math.abs(Math.sin(b * Math.PI * 2)), .6) * on * .9;
      q.brow = .4 + k * .5; q.browTilt = -.6; q.smile = .2; q.lookX = Math.sin(t * .9) * .3;
      // freeze when the corridor light appears (33.0)
      const fr = sm(32.9, 33.3, t);
      if (fr > 0) { const F = freeze(t); return blend(q, F, fr); }
      return q;
    }
    if (t < 34.4) return freeze(t);
    // ----- scene 5: dives onto the cot, fakes sleep -----
    const LIE = { x: .9, y: .74, z: -2.02, rz: Math.PI / 2, hy: 0, hx: 0, sx: .15, aL: [-.6, 0, -.1], eL: -1.6, aR: [-1.3, 0, .1], eR: -1.2, lL: [-.5, 0, 0], lR: [-.7, 0, 0], kL: .9, kR: 1.1, hdz: -.15, nx: .1, blink: 1 };
    if (t < 35.1) { const k2 = ease(clamp((t - 34.4) / .7)); const q = blend(freeze(34.4), LIE, k2); q.y += Math.sin(k2 * Math.PI) * .35; q.blink = k2; return q; }
    const q = { ...LIE };
    const peek = sm(37.0, 37.3, t), pull = sm(37.9, 38.6, t);
    q.lidL = 0; q.lidR = 0;
    if (t > 36.2 && t < 36.45) q.lidR = .3;                                     // twitch while the light is on him
    q.lidR = Math.max(q.lidR, peek * .8); q.lidL = peek * .05;
    q.smile = sm(37.4, 37.9, t) * 1.2; q.browTilt = peek * -.6; q.brow = peek * .3;
    q.lookX = peek * .6; q.lookY = -peek * .3;
    q.aR = [lerp(-1.3, -1.45, pull), 0, lerp(.1, .3, pull)]; q.eR = lerp(-1.2, -2.0, pull); q.wR = [0, 0, lerp(0, .6, pull)];
    return q;
  }
  function standOnCot(t) {
    const bl = blinkAt(t, .4);
    const q = { x: 0, y: .52, z: -2.05, ry: Math.PI, blink: bl, ...STAND };
    const reach = sm(14.75, 15.35, t) * (1 - sm(16.2, 16.7, t));
    q.aR = [lerp(.05, -2.3, reach), 0, lerp(-.1, .25, reach)]; q.eR = lerp(-.15, -.35, reach);
    q.hdx = lerp(-.35, -.55, reach); q.nx = -.1; q.lookY = .6; q.brow = .7; q.mouth = .2 + reach * .2;
    q.hy = reach * .04; q.fL = q.fR = reach * .5;                       // on tiptoes
    // duck from the searchlight 16.9–18.6
    const duck = sm(16.9, 17.25, t) * (1 - sm(18.3, 18.75, t));
    if (duck > 0) {
      q.hy = -duck * .48; q.lL = [-duck * 1.4, 0, .1]; q.lR = [-duck * 1.4, 0, -.1]; q.kL = q.kR = duck * 2.3; q.fL = q.fR = -duck * .8;
      q.sx = duck * .7; q.hdx = lerp(q.hdx, .2, duck); q.nx = 0;
      q.aR = [lerp(q.aR[0], .6, duck), 0, lerp(q.aR[2], -.2, duck)]; q.eR = lerp(q.eR, -.6, duck);
      q.aL = [lerp(.05, -.5, duck), 0, .2]; q.eL = -1.2; q.lookY = 0; q.lookX = Math.sin(t * 6) * duck * .8;
      q.brow = 1; q.mouth = .5 * duck; q.blink = 0;
    }
    return q;
  }
  function freeze(t) {
    const q = { x: 0, z: -.7, ry: -.35, blink: 0 };
    q.aR = [-1.0, .25, .42]; q.eR = -2.15; q.wR = [.5, 0, .25]; q.aL = [-.4, 0, -.3]; q.eL = -.8;
    q.sy = -.2; q.ny = -.35; q.hdy = -.3; q.lookX = -1; q.brow = 1.2; q.mouth = .55; q.sx = -.05; q.hy = -.03;
    return q;
  }

  function neighborPose(t, side) {
    const k = kick(t + (side > 0 ? 0 : BEAT / 2)), b = t / BEAT, on = sm(23.6, 24.3, t) * (1 - sm(32.6, 33.2, t));
    const q = { x: side * 4.2 + side * -.4, z: lerp(-.6, 2.05, sm(23, 24.3, t)), blink: blinkAt(t, side), ry: -side * .25 };
    q.hx = 0; q.hdx = -.05 + k * .25 * on; q.nx = k * .1 * on; q.sx = .05 + k * .08 * on;
    q.smile = on * .8; q.mouth = on * Math.abs(Math.sin(b * Math.PI)) * .6; q.brow = .5 * on; q.lookX = -side * .8;
    const cupArm = side > 0 ? 'L' : 'R', s = cupArm === 'L' ? 1 : -1, free = cupArm === 'L' ? 'R' : 'L';
    q['a' + cupArm] = [lerp(-.1, -1.3 + k * .25, on), 0, s * .1]; q['e' + cupArm] = lerp(-.2, -.6 - k * .6, on); q['w' + cupArm] = [-k * .6 * on, 0, 0];
    q['a' + free] = [lerp(-.1, -1.55, on), 0, -s * .2]; q['e' + free] = lerp(-.2, -.4, on);
    q.hy = -k * .05 * on; q.kL = q.kR = k * .12 * on; q.lL = [-k * .06 * on, 0, .08]; q.lR = [-k * .06 * on, 0, -.08];
    return q;
  }

  // ---------- shots ----------
  const shots = [
    { a: 0, b: 6.0, set: 'ext' },
    { a: 6.0, b: 13.2, set: 'cell' },
    { a: 13.2, b: 14.3, set: 'cell' },
    { a: 14.3, b: 16.9, set: 'cell' },
    { a: 16.9, b: 18.9, set: 'cell' },
    { a: 18.9, b: 20.4, set: 'cell' },
    { a: 20.4, b: 24.4, set: 'cell' },
    { a: 24.4, b: 28.6, set: 'cell' },
    { a: 28.6, b: 32.9, set: 'cell' },
    { a: 32.9, b: 35.4, set: 'cell' },
    { a: 35.4, b: 37.7, set: 'cell' },
    { a: 37.7, b: 40.0, set: 'cell' },
  ];
  function cam(t) {
    // returns [position, target, fov]
    if (t < 6) {
      const k = seg(t, 0, 6.2), O = ext.position;
      const p = vl(V(6, 1.8, 4), V(2.3, 9.7, -21.4), k).add(O); p.y += Math.sin(k * Math.PI) * 2.5;
      const tg = vl(V(-8, 9.5, -30), TARGET.clone().add(V(0, -.05, 0)), Math.pow(k, .9)).add(O);
      return [p, tg, lerp(58, 40, k)];
    }
    if (t < 13.2) {
      const k = seg(t, 6, 9.6), k2 = seg(t, 9.6, 13.2);
      let p = vl(V(.08, 1.5, 4.6), V(.08, 1.3, 1.0), k); p = vl(p, V(-.9, 1.25, .1), k2);
      const tg = vl(V(0, 1.1, -1.6), V(.1, 1.35, -1.9), k2);
      return [p, tg, 56];
    }
    if (t < 14.4) { const k = seg(t, 13.2, 14.4); return [vl(V(.45, 1.35, -1.0), V(.4, 1.4, -1.2), k), V(.02, 1.95, -2.75), 50]; }
    if (t < 16.9) { const k = seg(t, 14.4, 16.9); return [vl(V(1.7, 1.85, -.75), V(1.5, 1.95, -.95), k), V(-.15, 1.85, -2.35), 52]; }
    if (t < 18.9) { const k = seg(t, 16.9, 18.9); return [vl(V(-.2, 1.5, 1.9), V(-.2, 1.45, 1.7), k), V(0, 1.25, -2.0), 56]; }
    if (t < 20.4) { const k = seg(t, 18.9, 20.4); return [vl(V(.7, 1.7, .45), V(.55, 1.65, .2), k), V(-.04, 1.42, -1.05), 44]; }
    if (t < 24.4) {
      const k = seg(t, 20.4, 24.4), a = lerp(-.7, .7, k), R = lerp(2.4, 1.9, k);
      return [V(Math.sin(a) * R, 1.45 + Math.sin(k * Math.PI) * .12, -.7 + Math.cos(a) * R), V(0, 1.25, -.7), 54];
    }
    if (t < 28.6) { const k = seg(t, 24.4, 28.6), x = lerp(4.9, -3.6, k); return [V(x, 1.55, 4.75), V(x - .9, 1.35, 1.6), 54]; }
    if (t < 32.9) { const k = seg(t, 28.6, 32.9); return [vl(V(.8, .35, 1.6), V(.4, .5, .7), k), V(0, 1.45, -.8), 56]; }
    if (t < 35.4) { const k = seg(t, 32.9, 35.4); return [vl(V(-.4, 1.5, 1.9), V(-.2, 1.4, 1.6), k), vl(V(0, 1.25, -.8), V(.1, .8, -1.7), sm(34.2, 35.0, t)), 56]; }
    if (t < 37.7) { const k = seg(t, 35.4, 37.7); return [vl(V(1.75, 1.95, 2.1), V(1.6, 1.8, 1.8), k), V(-.4, .65, -1.9), 58]; }
    const k = seg(t, 37.7, 40);
    return [vl(V(-.05, 1.25, -.55), V(-.2, 1.15, -.8), k), V(-.85, .8, -2.02), 44];
  }

  function guardState(t) {
    // walks along the corridor (z=3.85) from +x to −x, pausing in front of the cell
    let x;
    if (t < 33.0) x = 9;
    else if (t < 36.2) x = lerp(7.5, .2, sm(33.0, 36.2, t));
    else if (t < 36.9) x = .2;
    else x = lerp(.2, -7, sm(36.9, 39.5, t));
    const walking = !(t >= 36.2 && t < 36.9) && t >= 33.0;
    return { x, walking };
  }

  // ---------- main render ----------
  const recHold = new THREE.Object3D();
  function renderAt(t) {
    t = clamp(t, 0, DURATION - 1e-4);
    const isExt = t < 6;
    ext.visible = isExt; cell.visible = !isExt;
    scene.fog = isExt ? fogExt : fogCell;
    scene.background = new THREE.Color(isExt ? 0x070d18 : 0x07090c);
    ovMat.uniforms.uSeed.value = Math.floor(t * FPS) * .37;

    if (isExt) {
      // searchlight sweep
      const a = Math.sin(t * .9 - .3) * 1.1, tgt = V(-4 + Math.sin(a) * 13, 0, -11.5 + Math.cos(a) * 2);
      search.target.position.copy(tgt);
      searchBeam.position.copy(search.position); searchBeam.lookAt(tgt.clone().add(ext.position)); searchBeam.scale.setScalar(search.position.distanceTo(tgt) * 1.05);
      lampHead.lookAt(tgt.clone().add(ext.position));
      lampHead.rotateX(Math.PI / 2);
      hotGlow.intensity = 1.2 + Math.sin(t * 9) * .15;
    } else {
      // ---- cell lighting by scene ----
      const sweepK = sm(17.0, 17.2, t) * (1 - sm(18.2, 18.5, t));
      sweep.intensity = sweepK * 2600;
      const sx = lerp(-6, 7, sm(17.0, 18.5, t));
      sweep.position.set(sx * 1.2, 7.5, -16); sweep.target.position.set(-sx * .4, 0, .5);
      corr.intensity = 18 + Math.sin(t * 31) * .4 + (hash(Math.floor(t * 12)) > .97 ? -6 : 0);
      moon.intensity = 3.2 * (1 - sweepK * .5);
      shaft.material.uniforms.uS.value = .16 + sweepK * .5;
      // dust drift
      const pa = dustGeo.attributes.position;
      for (let i = 0; i < dustN; i++) { const o = i * 3; pa.array[o] = dustBase[o] + Math.sin(t * .3 + i) * .05; pa.array[o + 1] = dustBase[o + 1] + Math.sin(t * .21 + i * 1.7) * .06 - ((t * .02 + i * .013) % .2); pa.array[o + 2] = dustBase[o + 2] + Math.cos(t * .25 + i * .7) * .05; }
      pa.needsUpdate = true;

      // ---- hero ----
      pose(hero, heroPose(t));

      // ---- neighbours ----
      pose(nbL, neighborPose(t, -1)); pose(nbR, neighborPose(t, 1));
      if (t < 23 || t > 33.5) { // resting on their cots outside the rap
        for (const [N, side] of [[nbL, -1], [nbR, 1]]) pose(N, { ...SIT, x: side * 4.2 + .3, z: -1.78, blink: 1, hdx: .6, sx: .5, nx: .2 });
      }

      // ---- guard ----
      const G = guardState(t), gb = t * 1.9;
      guard.root.visible = t > 32.8;
      const gw = G.walking ? 1 : 0, sw = Math.sin(gb * Math.PI) * gw;
      const look = sm(35.6, 36.2, t) * (1 - sm(36.9, 37.4, t));
      pose(guard, { x: G.x, z: 3.85, ry: -Math.PI / 2 + look * -1.2 + (1 - look) * -.35,
        hy: -Math.abs(Math.sin(gb * Math.PI)) * .03 * gw, lL: [sw * .45, 0, .05], lR: [-sw * .45, 0, -.05], kL: Math.max(0, -sw) * .7, kR: Math.max(0, sw) * .7,
        aL: [-sw * .35, 0, .1], eL: -.3, aR: [-1.35 + look * .1, look * .2 - .3, -.15], eR: -.25, wR: [lerp(.35, .7, look), 0, 0],
        hdx: .1 + look * .2, hdy: look * -.2 - .2, brow: -.3, browTilt: .5, blink: blinkAt(t, 2) });
      const fOn = sm(32.9, 33.6, t) * (1 - sm(38.8, 39.4, t));
      flash.intensity = fOn * 90; flashBeam.material.uniforms.uS.value = fOn * .18; torchLens.visible = fOn > .05;

      // ---- pigeon ----
      let pp, pr = 0, flap = 0, bob = 0, peck = 0;
      const SILL = V(.05, 1.775, -2.78);
      if (t < 12.0) pp = V(5, 6, -10);
      else if (t < 14.0) { const k = seg(t, 12.3, 14.0); pp = vl(V(-2.4, 3.6, -5.5), SILL, k); pp.y += Math.sin(k * Math.PI) * .25; flap = (1 - sm(13.7, 14.0, t)); pr = .5 * (1 - k); }
      else if (t < 33.0) { pp = SILL.clone(); bob = t > 20.4 ? kick(t) : Math.max(0, Math.sin(t * 7)) * .5; peck = sm(14.9, 15.15, t) * (1 - sm(15.4, 15.7, t)); }
      else { const k = seg(t, 33.1, 34.4); pp = vl(SILL, V(2.5, 4.5, -7), k); flap = k > 0 ? 1 : 0; pr = -.6 * k; }
      if (t > 12.0 && t < 12.3) pp = V(-2.4, 3.6, -5.5);
      // pigeon flies across the moon at ~11.9 (glimpse) before landing
      pigeon.root.position.copy(pp); pigeon.root.rotation.set(0, Math.PI + pr, 0);
      const fl = Math.sin(t * 38) * flap;
      pigeon.wing[1].rotation.z = -1.25 * (1 - flap) + fl * 1.1; pigeon.wing[-1].rotation.z = 1.25 * (1 - flap) - fl * 1.1;
      pigeon.head.rotation.x = bob * .5 + peck * .9; pigeon.head.position.z = .1 + bob * .03 + peck * .04;
      pigeon.body.rotation.x = peck * .45 + flap * -.3 + (t > 16.9 && t < 18.5 ? .5 : 0);

      // ---- recorder: carried by pigeon → pushed through bars → hero's hand → under the pillow ----
      let parent = cell, on = 0;
      if (t < 15.05) { parent = pigeon.body; rec.position.set(0, -.03, .06); rec.rotation.set(Math.PI / 2, 0, 0); }
      else if (t < 15.35) { parent = cell; const k = seg(t, 15.05, 15.35); rec.position.copy(vl(V(.05, 1.83, -2.7), V(.02, 1.86, -2.5), k)); rec.rotation.set(0, 0, k * .3); }
      else if (t < 34.95) { parent = hero.hand.R; rec.position.set(0, -.12, .05); rec.rotation.set(-1.25, .0, 0); }
      else if (t < 37.95) { parent = cell; rec.position.set(-.82, .55, -2.1); rec.rotation.set(-Math.PI / 2, 0, 0); }
      else { parent = hero.hand.R; rec.position.set(0, -.12, .05); rec.rotation.set(-1.25, 0, 0); }
      if (rec.parent !== parent) parent.add(rec);
      if (t > 19.55 && t < 34.9) on = (t < 20.4 ? 1 : (.75 + .25 * kick(t))) * (hash(Math.floor(t * 2)) > .02 ? 1 : 0);
      if (t > 38.6) on = sm(38.6, 38.75, t) * (Math.floor(t * 2.2) % 2 ? 1 : .35);
      setRec(rec, on);
      if (t > 15.35 && t < 20.4 && rec.parent === hero.hand.R) rec.rotation.set(t < 18.9 ? -1.25 : -.4, 0, 0);

      // ---- sound rings ----
      cell.updateMatrixWorld(true);
      const mic = new THREE.Vector3(); rec.getWorldPosition(mic);
      const rapOn = t > 20.4 && t < 32.9;
      rings.forEach((m, i) => {
        const bi = Math.floor(t / BEAT) - i, age = t - bi * BEAT;
        const life = 1.1, k = age / life, vis = rapOn && bi * BEAT > 20.4 && k < 1;
        m.visible = vis; if (!vis) return;
        m.position.copy(mic).add(V(0, .03, .06 + k * .25));
        m.lookAt(camera.position);
        m.scale.setScalar(.6 + k * 4.5);
        m.material.opacity = (1 - k) * (1 - k) * .55;
        m.material.color.setHex(i % 2 ? 0xff7050 : 0xffb070);
      });
    }

    // ---- camera ----
    const [p, tg, fov] = cam(t);
    camera.position.copy(p); camera.fov = fov;
    if (!isExt) { camFill.position.copy(p).add(V(.3, .4, 0)); camFill.intensity = 2.2; } camera.updateProjectionMatrix(); camera.lookAt(tg);
    // subtle handheld drift
    camera.rotation.z += Math.sin(t * 1.3) * .004; camera.rotateX(Math.sin(t * .9) * .003); camera.rotateY(Math.sin(t * 1.1 + 1) * .003);

    // ---- fades between scenes ----
    let fade = 1 - sm(0, .9, t);
    fade = Math.max(fade, sm(5.45, 6.0, t) * (1 - sm(6.0, 6.6, t)));
    fade = Math.max(fade, sm(38.9, 39.85, t));
    for (const s of shots) { if (s.a > 6.5) { const d = Math.abs(t - s.a); fade = Math.max(fade, d < .06 ? (1 - d / .06) * .35 : 0); } }
    ovMat.uniforms.uFade.value = fade;

    renderer.setRenderTarget(null); renderer.clear();
    renderer.render(scene, camera);
    renderer.render(ovScene, ovCam);
  }
  const dbg = () => { const h = new THREE.Vector3(); hero.head.getWorldPosition(h); return { cam: camera.position.toArray().map(v => +v.toFixed(2)), head: h.toArray().map(v => +v.toFixed(2)), root: hero.root.position.toArray() }; };
  const dbg2 = () => { const a = new THREE.Vector3(), d = new THREE.Vector3(); searchBeam.getWorldPosition(a); searchBeam.getWorldDirection(d); return { a: a.toArray(), d: d.toArray(), vis: searchBeam.visible, tgt: search.target.position.toArray() }; };
  return { FPS, DURATION, renderAt, W, H, dbg, dbg2 };
}
