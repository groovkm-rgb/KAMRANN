// scene.js: the 3D worlds of "Bartsteuer". Seven sets, each in its own group far apart; worldAt(f).set picks the visible one.
// All visible writing is German: "Bartsteuer" (decree + gate sign), "Reich: 100" / "Arm: 1" (tax board), "Bezahlt" (token),
// "Der Bart ist eine" / "überflüssige Last" (second token). Everything deterministic (seeded rng).
export const OFF = { palace: [0, 0, 0], map: [300, 0, 0], europe: [600, 0, 0], study: [900, 0, 0], mint: [1200, 0, 0], snow: [1500, 0, 0], house: [1800, 0, 0], heaven: [2100, 0, 0] };
const SERIF = '"DejaVu Serif", "FreeSerif", serif';
let S = {};

export const build = (ctx) => {
  const { THREE, P, world, scene, add, tbox, toon, texM, canvasTex } = ctx;
  S.THREE = THREE;
  const G = {}; for (const k in OFF) { G[k] = new THREE.Group(); G[k].position.set(...OFF[k]); world.add(G[k]); }
  S.G = G;
  const rng = P.rng(777);
  const basic = (map, o = {}) => new THREE.MeshBasicMaterial({ map, ...o });
  const ns = (m) => { m.userData.ndSkip = true; return m; };
  const tx = (w, h, fn, rx = 1, ry = 1) => { const t = canvasTex(w, h, fn); if (rx !== 1 || ry !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); } return t; };
  const tm = (t, col = '#ffffff', o = {}) => toon({ map: t, color: col, ...o });
  const C = (c) => toon({ color: c });
  const glowC = (c) => toon({ color: c, emissive: c, emissiveIntensity: 1.3 });

  // ---------- sprite systems (camera-facing instanced quads, never inked) ----------
  const softTex = (fn, s = 128) => canvasTex(s, s, fn);
  const TX = {
    glow: softTex((g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); }),
    flame: softTex((g, w) => { const r = g.createRadialGradient(w / 2, w * 0.66, 2, w / 2, w * 0.62, w * 0.42); r.addColorStop(0, 'rgba(255,255,235,1)'); r.addColorStop(0.35, 'rgba(255,214,110,1)'); r.addColorStop(0.7, 'rgba(255,120,30,0.7)'); r.addColorStop(1, 'rgba(255,80,0,0)');
      g.fillStyle = r; g.beginPath(); g.moveTo(w / 2, w * 0.04); g.bezierCurveTo(w * 0.78, w * 0.4, w * 0.8, w * 0.9, w / 2, w * 0.94); g.bezierCurveTo(w * 0.2, w * 0.9, w * 0.22, w * 0.4, w / 2, w * 0.04); g.fill(); }),
    snow: softTex((g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.45, 'rgba(255,255,255,0.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); }, 64),
    flake: softTex((g, w) => { g.strokeStyle = '#ffffff'; g.lineCap = 'round'; g.lineWidth = w * 0.05; g.translate(w / 2, w / 2); for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, w * 0.42); g.moveTo(0, w * 0.22); g.lineTo(w * 0.1, w * 0.32); g.moveTo(0, w * 0.22); g.lineTo(-w * 0.1, w * 0.32); g.stroke(); } }, 256),
    spark: softTex((g, w) => { g.translate(w / 2, w / 2); const r = g.createRadialGradient(0, 0, 0, 0, 0, w * 0.18); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(-w / 2, -w / 2, w, w);
      g.fillStyle = '#ffffff'; for (let i = 0; i < 2; i++) { g.rotate(Math.PI / 2 * i); g.beginPath(); g.moveTo(-w * 0.48, 0); g.quadraticCurveTo(0, w * 0.035, w * 0.48, 0); g.quadraticCurveTo(0, -w * 0.035, -w * 0.48, 0); g.fill(); } }),
    hair: softTex((g, w) => { g.strokeStyle = '#ffffff'; g.lineWidth = w * 0.07; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.2, w * 0.8); g.bezierCurveTo(w * 0.1, w * 0.4, w * 0.7, w * 0.6, w * 0.55, w * 0.25); g.bezierCurveTo(w * 0.5, w * 0.1, w * 0.8, w * 0.1, w * 0.85, w * 0.2); g.stroke(); }, 64),
    foam: softTex((g, w) => { for (let i = 0; i < 7; i++) { const a = i * 0.9, r = w * (0.16 + (i % 3) * 0.05), x = w / 2 + Math.cos(a) * w * 0.2, y = w / 2 + Math.sin(a) * w * 0.18; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(170,190,220,0.8)'; g.lineWidth = 3; g.stroke(); } }),
    smoke: softTex((g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,0.7)'); r.addColorStop(0.6, 'rgba(255,255,255,0.25)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); }),
    cloud: canvasTex(512, 320, (g, w, h) => { const r = P.rng(5); for (let i = 0; i < 26; i++) { const x = w * (0.12 + r() * 0.76), y = h * (0.5 + (r() - 0.5) * 0.35) + Math.abs(x - w / 2) / w * h * 0.25, rr = h * (0.16 + r() * 0.16);
      const gr = g.createRadialGradient(x, y - rr * 0.3, rr * 0.1, x, y, rr); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.75, 'rgba(255,240,245,0.95)'); gr.addColorStop(1, 'rgba(255,230,240,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } }),
    heart: softTex((g, w) => { g.fillStyle = '#ff6a8a'; g.strokeStyle = '#1a1416'; g.lineWidth = w * 0.05; g.beginPath(); g.moveTo(w / 2, w * 0.82); g.bezierCurveTo(w * 0.05, w * 0.5, w * 0.15, w * 0.12, w / 2, w * 0.32); g.bezierCurveTo(w * 0.85, w * 0.12, w * 0.95, w * 0.5, w / 2, w * 0.82); g.fill(); g.stroke(); }),
  };
  S.TX = TX;
  const sprites = (tex, n, add_ = true, order = 3) => {
    const base = new THREE.PlaneGeometry(1, 1), geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index; geo.setAttribute('position', base.attributes.position); geo.setAttribute('uv', base.attributes.uv);
    const A = { iPos: new Float32Array(n * 3), iSize: new Float32Array(n), iAlpha: new Float32Array(n), iRot: new Float32Array(n), iCol: new Float32Array(n * 3).fill(1) };
    for (const [k, v] of Object.entries(A)) geo.setAttribute(k, new THREE.InstancedBufferAttribute(v, v.length / n));
    geo.instanceCount = n;
    const mat = new THREE.ShaderMaterial({ uniforms: { map: { value: tex } }, transparent: true, depthWrite: false, blending: add_ ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: `attribute vec3 iPos; attribute float iSize, iAlpha, iRot; attribute vec3 iCol; varying vec2 vUv; varying float vA; varying vec3 vC;
        void main(){ vUv=uv; vA=iAlpha; vC=iCol; vec4 mv = modelViewMatrix*vec4(iPos,1.); float c=cos(iRot), s=sin(iRot); vec2 p = mat2(c,s,-s,c)*position.xy; mv.xy += p*iSize; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vA; varying vec3 vC; void main(){ vec4 t=texture2D(map,vUv); if(t.a*vA<.003) discard; gl_FragColor=vec4(t.rgb*vC, t.a*vA); }` });
    const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.userData.ndSkip = true; m.renderOrder = order; m.castShadow = false; scene.add(m);
    let i = 0;
    const sys = { m, n, A, geo,
      reset() { i = 0; },
      put(x, y, z, s, a = 1, rot = 0, col) { if (i >= n) return; A.iPos[i * 3] = x; A.iPos[i * 3 + 1] = y; A.iPos[i * 3 + 2] = z; A.iSize[i] = s; A.iAlpha[i] = a; A.iRot[i] = rot;
        if (col) { A.iCol[i * 3] = col[0]; A.iCol[i * 3 + 1] = col[1]; A.iCol[i * 3 + 2] = col[2]; } else A.iCol[i * 3] = A.iCol[i * 3 + 1] = A.iCol[i * 3 + 2] = 1; i++; },
      done() { for (let k = i; k < n; k++) A.iAlpha[k] = 0; for (const key of Object.keys(A)) geo.attributes[key].needsUpdate = true; } };
    return sys;
  };
  S.SP = { glow: sprites(TX.glow, 900), flame: sprites(TX.flame, 700), snow: sprites(TX.snow, 1600, false, 4), flake: sprites(TX.flake, 4, false, 6), spark: sprites(TX.spark, 120), hair: sprites(TX.hair, 400, false, 4),
    foam: sprites(TX.foam, 160, false, 5), smoke: sprites(TX.smoke, 200, false, 4), cloud: sprites(TX.cloud, 260, false, 1), heart: sprites(TX.heart, 8, false, 6), dust: sprites(TX.glow, 300) };
  // light shafts: additive gradient planes
  const shaftTex = canvasTex(64, 256, (g, w, h) => { const r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, 'rgba(255,255,255,0.0)'); r.addColorStop(0.15, 'rgba(255,255,255,0.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h);
    const s = g.createLinearGradient(0, 0, w, 0); s.addColorStop(0, 'rgba(0,0,0,1)'); s.addColorStop(0.5, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = s; g.fillRect(0, 0, w, h); });
  const shaft = (parent, x, y, z, w, h, rotX, rotY, col, a) => { const m = add(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: shaftTex, color: col, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }), x, y, z, parent, { cast: false });
    m.rotation.set(rotX, rotY, 0, 'YXZ'); m.receiveShadow = false; ns(m); m.renderOrder = 4; return m; };
  S.shafts = [];

  // ---------- painted textures ----------
  const damask = (c1, c2, c3) => tx(256, 256, (g, w) => { g.fillStyle = c1; g.fillRect(0, 0, w, w); g.fillStyle = c2;
    for (const [x, y] of [[w / 2, w / 2], [0, 0], [w, 0], [0, w], [w, w]]) { g.save(); g.translate(x, y); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(30, 10, 40, 50, 0, 70); g.bezierCurveTo(-40, 50, -30, 10, 0, 0); g.fill(); } g.fillStyle = c3; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); g.fillStyle = c2; g.restore(); } }, 3, 2);
  const marbleChecker = tx(512, 512, (g, w) => { const r = P.rng(3); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#e8dcc4' : '#6a2a2e'; g.fillRect(i * w / 4, j * w / 4, w / 4, w / 4); }
    g.globalAlpha = 0.25; g.strokeStyle = '#ffffff'; for (let k = 0; k < 30; k++) { g.lineWidth = 1 + r() * 2; g.beginPath(); let x = r() * w, y = r() * w; g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (r() - 0.5) * 60; y += r() * 40; g.lineTo(x, y); } g.stroke(); } g.globalAlpha = 1; }, 8, 13);
  const carpet = tx(256, 512, (g, w, h) => { g.fillStyle = '#a8141e'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8b840'; g.fillRect(0, 0, 22, h); g.fillRect(w - 22, 0, 22, h); g.fillStyle = '#7a0a12'; g.fillRect(30, 0, 8, h); g.fillRect(w - 38, 0, 8, h);
    for (let y = 30; y < h; y += 90) { g.fillStyle = '#e8b840'; g.beginPath(); g.moveTo(w / 2, y); g.lineTo(w / 2 + 34, y + 34); g.lineTo(w / 2, y + 68); g.lineTo(w / 2 - 34, y + 34); g.fill(); g.fillStyle = '#7a0a12'; g.beginPath(); g.arc(w / 2, y + 34, 12, 0, 7); g.fill(); } }, 1, 8);
  const landscape = (seed) => canvasTex(512, 384, (g, w, h) => { const r = P.rng(seed); const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#6a9ad8'); sk.addColorStop(0.6, '#f4d8a8'); g.fillStyle = sk; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 3; k++) { g.fillStyle = ['#7a9a6a', '#5a8a4a', '#3e6a36'][k]; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 16) g.lineTo(x, h * (0.5 + k * 0.12) + Math.sin(x * 0.01 * (k + 1) + seed) * 30 + r() * 6); g.lineTo(w, h); g.fill(); }
    for (let i = 0; i < 8; i++) { const x = r() * w, y = h * 0.78 + r() * h * 0.15; g.fillStyle = '#2e4a2a'; g.beginPath(); g.arc(x, y, 14 + r() * 12, 0, 7); g.fill(); g.fillStyle = '#5a3a20'; g.fillRect(x - 2, y, 4, 16); }
    g.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 4; i++) { const x = r() * w, y = 30 + r() * 80; g.beginPath(); g.ellipse(x, y, 40, 12, 0, 0, 7); g.fill(); } });
  const winView = (seed, night) => canvasTex(256, 512, (g, w, h) => { const r = P.rng(seed); const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, night ? '#1a2a5a' : '#6a8ac8'); sk.addColorStop(1, night ? '#7a6aa0' : '#e8d8e8'); g.fillStyle = sk; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(r() * w, r() * h * 0.5, 2, 2); }
    for (let i = 0; i < 4; i++) { const x = 20 + i * 64 + r() * 20, bw = 40, by = h * (0.55 + r() * 0.1); g.fillStyle = ['#d84a4a', '#3a8ad8', '#3ab070', '#e8b840'][i]; g.beginPath(); g.moveTo(x - bw / 2, by); g.bezierCurveTo(x - bw * 0.7, by - 40, x - 4, by - 50, x, by - 80); g.bezierCurveTo(x + 4, by - 50, x + bw * 0.7, by - 40, x + bw / 2, by); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, by - 30, bw * 0.3, 8, 0, Math.PI, 0); g.fill(); g.fillStyle = '#e8e0d8'; g.fillRect(x - bw / 2, by, bw, h - by); g.fillStyle = '#ffd890'; g.fillRect(x - 6, by + 30, 12, 18); }
    g.fillStyle = '#f4f6fa'; g.beginPath(); g.moveTo(0, h * 0.85); for (let x = 0; x <= w; x += 20) g.lineTo(x, h * 0.82 + Math.sin(x * 0.05) * 6); g.lineTo(w, h); g.lineTo(0, h); g.fill(); });
  const logs = (c) => tx(256, 256, (g, w) => { const r = P.rng(9); for (let i = 0; i < 6; i++) { const y = i * w / 6, gr = g.createLinearGradient(0, y, 0, y + w / 6); gr.addColorStop(0, c[0]); gr.addColorStop(0.5, c[1]); gr.addColorStop(1, c[2]); g.fillStyle = gr; g.fillRect(0, y, w, w / 6);
    g.strokeStyle = 'rgba(40,20,10,0.35)'; g.lineWidth = 1.5; for (let k = 0; k < 5; k++) { g.beginPath(); const yy = y + 6 + r() * (w / 6 - 12); g.moveTo(0, yy); g.bezierCurveTo(w * 0.3, yy + 3, w * 0.6, yy - 3, w, yy + 1); g.stroke(); } } }, 1, 3);
  const snowTex = tx(512, 512, (g, w) => { g.fillStyle = '#eef3fa'; g.fillRect(0, 0, w, w); const r = P.rng(4); for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? 'rgba(180,200,235,0.35)' : 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(r() * w, r() * w, 6 + r() * 30, 3 + r() * 10, r() * 3, 0, 7); g.fill(); } }, 30, 30);
  const stoneWall = texM(P.stone(14, 30, 10, 58, 90, 56), 4, 2);
  const planks = texM(P.planks(3), 2, 2);
  const gold = toon({ color: '#e8b840', emissive: '#5a3a00', emissiveIntensity: 0.4 }), goldD = C('#a8781e'), wood = C('#6a3e22'), woodD = C('#3e2414'), cream = C('#f4ead6'), white = C('#ffffff');
  const MT = { gold, goldD, wood, woodD, cream, white };
  const candleM = C('#f6f0e2');
  const flames = []; // [x,y,z,size,seed] world coords of candle flames (palace & study & house)
  const candle = (parent, x, y, z, h = 0.22, r = 0.035, wo) => { add(new THREE.CylinderGeometry(r, r, h, 8), candleM, x, y + h / 2, z, parent, { cast: false }); parent.updateWorldMatrix(true, false); const v = new THREE.Vector3(x, y + h + 0.05, z); parent.localToWorld(v); flames.push([v.x, v.y, v.z, r * 3.4, rng() * 100]); };
  S.flames = flames;

  // ====================================================== M1 PALACE ======================================================
  {
    const g = G.palace, W = 8, Z0 = -14, Z1 = 12, Hh = 8.5;
    const fl = add(new THREE.PlaneGeometry(2 * W, Z1 - Z0), tm(marbleChecker), 0, 0, (Z0 + Z1) / 2, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const cp = add(new THREE.PlaneGeometry(2.6, Z1 - Z0), tm(carpet), 0, 0.01, (Z0 + Z1) / 2, g, { cast: false }); cp.rotation.x = -Math.PI / 2;
    const ceil = add(new THREE.PlaneGeometry(2 * W, Z1 - Z0), C('#7a2a22'), 0, Hh, (Z0 + Z1) / 2, g, { cast: false }); ceil.rotation.x = Math.PI / 2;
    for (let x = -W + 2; x < W; x += 4) add(tbox(0.25, 0.3, Z1 - Z0, 1), gold, x, Hh - 0.15, (Z0 + Z1) / 2, g, { cast: false });
    for (let z = Z0 + 2; z < Z1; z += 4) add(tbox(2 * W, 0.3, 0.25, 1), gold, 0, Hh - 0.15, z, g, { cast: false });
    const wallM = tm(damask('#7a1420', '#9a2a30', '#e8b840'));
    const wall = (x, z, w, rotY) => { const G2 = new THREE.Group(); G2.position.set(x, 0, z); G2.rotation.y = rotY; g.add(G2);
      add(new THREE.PlaneGeometry(w, Hh), wallM, 0, Hh / 2, 0, G2, { cast: false });
      add(tbox(w, 1.3, 0.12, 1), woodD, 0, 0.65, 0.06, G2, { cast: false }); add(tbox(w, 0.1, 0.18, 1), gold, 0, 1.32, 0.09, G2, { cast: false });
      add(tbox(w, 0.4, 0.3, 1), gold, 0, Hh - 0.5, 0.15, G2, { cast: false }); add(tbox(w, 0.12, 0.4, 1), goldD, 0, Hh - 0.8, 0.2, G2, { cast: false });
      return G2; };
    const pil = (G2, x) => { add(tbox(0.55, Hh - 1.4, 0.3, 1), C('#e8dcc0'), x, (Hh - 1.4) / 2 + 0.6, 0.15, G2); add(tbox(0.7, 0.35, 0.4, 1), gold, x, Hh - 1.05, 0.2, G2); add(tbox(0.7, 0.3, 0.4, 1), gold, x, 0.75, 0.2, G2);
      for (let k = 0; k < 3; k++) add(tbox(0.06, Hh - 2.4, 0.06, 1), goldD, x - 0.15 + k * 0.15, (Hh - 1.4) / 2 + 0.6, 0.32, G2, { cast: false });
      // sconce with 3 candles
      add(tbox(0.12, 0.5, 0.12, 1), gold, x, 3.0, 0.45, G2); add(tbox(0.7, 0.06, 0.12, 1), gold, x, 3.25, 0.55, G2);
      for (const dx of [-0.3, 0, 0.3]) candle(G2, x + dx, 3.28 + (dx === 0 ? 0.08 : 0), 0.58, 0.22, 0.035); };
    const frame = (G2, x, y, w, h, map) => { add(tbox(w + 0.36, h + 0.36, 0.12, 1), gold, x, y, 0.08, G2); add(tbox(w + 0.12, h + 0.12, 0.14, 1), goldD, x, y, 0.1, G2); const p = add(new THREE.PlaneGeometry(w, h), basic(map, { color: '#e8d8c0' }), x, y, 0.18, G2, { cast: false }); ns(p); };
    const windowA = (G2, x, map) => { add(tbox(1.9, 4.6, 0.14, 1), gold, x, 4.2, 0.07, G2); const p = add(new THREE.PlaneGeometry(1.6, 4.3), basic(map), x, 4.15, 0.16, G2, { cast: false }); ns(p);
      add(tbox(0.06, 4.3, 0.06, 1), gold, x, 4.15, 0.2, G2); for (const y of [2.8, 4.2, 5.6]) add(tbox(1.6, 0.06, 0.06, 1), gold, x, y, 0.2, G2);
      add(new THREE.CylinderGeometry(0.95, 0.95, 0.14, 24, 1, false, 0, Math.PI), gold, x, 6.5, 0.07, G2).rotation.set(Math.PI / 2, 0, Math.PI / 2);
      // curtains
      for (const s of [-1, 1]) { const c = add(tbox(0.5, 5.6, 0.25, 1), C('#5a0a14'), x + s * 1.15, 3.6, 0.3, G2); c.rotation.z = s * 0.03; add(tbox(0.56, 0.12, 0.3, 1), gold, x + s * 1.15, 2.0, 0.34, G2); } };
    // back wall (behind the tsar) and front wall (behind the nobles)
    const back = wall(0, Z0, 2 * W, 0), front = wall(0, Z1, 2 * W, Math.PI);
    for (const G2 of [back, front]) { for (const x of [-6, -2, 2, 6]) pil(G2, x); windowA(G2, -4, winView(11, true)); windowA(G2, 4, winView(12, true)); }
    // grand door on back wall
    add(tbox(2.4, 4.4, 0.2, 1), C('#5a2a14'), 0, 2.2, Z0 + 0.1, g); add(tbox(2.8, 0.4, 0.3, 1), gold, 0, 4.5, Z0 + 0.15, g); add(tbox(0.06, 4.2, 0.25, 1), gold, 0, 2.2, Z0 + 0.2, g);
    for (const s of [-1, 1]) for (const y of [1.2, 3.0]) add(tbox(0.8, 1.2, 0.06, 1), gold, s * 0.6, y, Z0 + 0.22, g, { cast: false });
    // huge painting above the front-wall centre
    frame(front, 0, 4.4, 2.6, 1.9, landscape(31));
    const left = wall(-W, (Z0 + Z1) / 2, Z1 - Z0, Math.PI / 2), right = wall(W, (Z0 + Z1) / 2, Z1 - Z0, -Math.PI / 2);
    for (const G2 of [left, right]) { for (let x = -12; x <= 12; x += 4) pil(G2, x); for (let x = -10; x <= 10; x += 4) frame(G2, x, 4.2, 2.2, 1.6, landscape(40 + x)); }
    // chandeliers
    S.chand = [];
    for (const z of [-9, -2.5, 4, 9.5]) {
      const ch = new THREE.Group(); ch.position.set(0, Hh, z); g.add(ch); S.chand.push(ch);
      add(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), goldD, 0, -0.8, 0, ch, { cast: false });
      add(new THREE.SphereGeometry(0.28, 16, 12), gold, 0, -1.9, 0, ch); add(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), gold, 0, -2.1, 0, ch);
      const drop = toon({ color: '#e8f4ff', emissive: '#a8c8ff', emissiveIntensity: 0.6 });
      for (const [R, y, n] of [[1.2, -2.6, 12], [0.75, -2.15, 8]]) {
        const tor = add(new THREE.TorusGeometry(R, 0.05, 6, 32), gold, 0, y, 0, ch); tor.rotation.x = Math.PI / 2;
        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; add(new THREE.CylinderGeometry(0.035, 0.03, 0.18, 6), candleM, Math.cos(a) * R, y + 0.12, Math.sin(a) * R, ch, { cast: false });
          add(new THREE.OctahedronGeometry(0.06), drop, Math.cos(a + 0.2) * R, y - 0.18, Math.sin(a + 0.2) * R, ch, { cast: false }).scale.y = 1.8; }
      }
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; add(new THREE.OctahedronGeometry(0.05), drop, Math.cos(a) * 0.4, -2.9 - (i % 3) * 0.1, Math.sin(a) * 0.4, ch, { cast: false }).scale.y = 2; }
      ch.userData.cand = [[1.2, -2.6 + 0.26, 12], [0.75, -2.15 + 0.26, 8]];
    }
    // banquet tables along both sides
    const fruitC = ['#d83a3a', '#f2b030', '#5ab040', '#8a3a9a', '#f2d040'];
    const table = (x, z0, z1) => { const L = z1 - z0, zc = (z0 + z1) / 2;
      add(tbox(1.6, 0.12, L, 1), wood, x, 0.85, zc, g); add(tbox(1.72, 0.5, L + 0.1, 1), cream, x, 0.68, zc, g);
      for (const s of [-1, 1]) add(tbox(0.04, 0.12, L + 0.1, 1), gold, x + s * 0.86, 0.48, zc, g, { cast: false });
      for (let z = z0 + 0.5; z < z1; z += 1.1) {
        add(new THREE.CylinderGeometry(0.2, 0.18, 0.03, 16), gold, x + 0.45, 0.93, z, g); add(new THREE.CylinderGeometry(0.2, 0.18, 0.03, 16), gold, x - 0.45, 0.93, z + 0.5, g);
        // goblets
        for (const s of [-1, 1]) { const gx = x + s * 0.62; add(new THREE.CylinderGeometry(0.06, 0.035, 0.12, 10), gold, gx, 1.05, z + 0.25, g); add(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 6), gold, gx, 0.96, z + 0.25, g); }
      }
      for (let z = z0 + 1; z < z1 - 0.5; z += 3.2) { // roast chicken on a platter
        add(new THREE.CylinderGeometry(0.42, 0.38, 0.04, 20), C('#f4f0e8'), x, 0.94, z, g);
        const b = add(new THREE.SphereGeometry(0.22, 14, 10), C('#c8762a'), x, 1.1, z, g); b.scale.set(1.3, 0.85, 1);
        for (const s of [-1, 1]) { const l = add(new THREE.SphereGeometry(0.09, 10, 8), C('#b8642a'), x + 0.22, 1.08, z + s * 0.15, g); l.scale.set(1.6, 0.8, 0.8); add(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), C('#f6eedc'), x + 0.36, 1.1, z + s * 0.16, g).rotation.z = Math.PI / 2; }
        for (let k = 0; k < 6; k++) add(new THREE.SphereGeometry(0.06, 8, 6), C(['#5ab040', '#e8d040'][k % 2]), x - 0.3 + rng() * 0.6, 0.98, z + (rng() - 0.5) * 0.7, g, { cast: false });
      }
      for (let z = z0 + 2.6; z < z1 - 0.5; z += 3.2) { // fruit pyramid + candelabra
        add(new THREE.CylinderGeometry(0.3, 0.1, 0.18, 16), gold, x, 1.0, z, g);
        for (let lv = 0; lv < 3; lv++) for (let k = 0; k < 7 - lv * 2; k++) { const a = k / (7 - lv * 2) * Math.PI * 2, rr = 0.2 - lv * 0.08; add(new THREE.SphereGeometry(0.075, 10, 8), C(fruitC[(k + lv) % 5]), x + Math.cos(a) * rr, 1.15 + lv * 0.11, z + Math.sin(a) * rr, g, { cast: false }); }
        add(new THREE.CylinderGeometry(0.04, 0.12, 0.6, 8), gold, x, 1.2, z + 1.2, g); add(tbox(0.6, 0.05, 0.05, 1), gold, x, 1.5, z + 1.2, g);
        for (const dx of [-0.28, 0, 0.28]) candle(g, x, 1.52 + (dx === 0 ? 0.08 : 0), z + 1.2 + dx, 0.24, 0.03);
      }
      // chairs
      for (let z = z0 + 0.6; z < z1; z += 1.4) for (const s of [-1, 1]) { const cx = x + s * 1.15; add(tbox(0.5, 0.08, 0.5, 1), C('#8a1a24'), cx, 0.5, z, g); add(tbox(0.08, 1.1, 0.5, 1), gold, cx + s * 0.25, 1.0, z, g); for (const d of [-0.2, 0.2]) add(tbox(0.05, 0.5, 0.05, 1), goldD, cx, 0.25, z + d, g, { cast: false }); }
    };
    table(-5.3, -12, 10); table(5.3, -12, 10);
    // standing candelabras near the action
    for (const [x, z] of [[-2.4, -1.4], [2.4, -1.4], [-3.6, 6.2], [3.6, 6.2], [-1.2, 8.5], [1.2, 8.5]]) {
      add(new THREE.CylinderGeometry(0.06, 0.2, 1.8, 10), gold, x, 0.9, z, g); add(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 12), gold, x, 0.03, z, g);
      add(tbox(0.7, 0.05, 0.05, 1), gold, x, 1.8, z, g); add(tbox(0.05, 0.05, 0.7, 1), gold, x, 1.8, z, g);
      for (const [dx, dz] of [[-0.32, 0], [0.32, 0], [0, -0.32], [0, 0.32], [0, 0]]) candle(g, x + dx, 1.82 + (dx === 0 && dz === 0 ? 0.12 : 0), z + dz, 0.26, 0.035);
    }
    // window light shafts (cool moonlight) and chandelier glow cones
    for (const [x, z, ry] of [[-4, Z0 + 0.4, 0], [4, Z0 + 0.4, 0], [-4, Z1 - 0.4, Math.PI], [4, Z1 - 0.4, Math.PI]]) S.shafts.push({ set: 'palace', m: shaft(g, x, 3.6, z + (ry ? -1.6 : 1.6), 2.0, 6.5, -0.5, ry, '#9ab8ff', 0.25) });
  }

  // ====================================================== M2a MAP TABLE (sepia flashback) ======================================================
  {
    const g = G.map;
    const mapTex = canvasTex(1024, 1536, (c, w, h) => { const r = P.rng(21);
      c.fillStyle = '#e8d2a0'; c.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${120 + r() * 60},${80 + r() * 40},30,${0.04 + r() * 0.05})`; c.beginPath(); c.arc(r() * w, r() * h, 10 + r() * 60, 0, 7); c.fill(); }
      // sea in the west and north
      c.fillStyle = '#9ab0a0'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w * 0.55, 0); for (let y = 0; y <= h * 0.42; y += 20) c.lineTo(w * 0.55 - Math.sin(y * 0.02) * 60 - y * 0.6, y); c.lineTo(0, h * 0.7); c.fill();
      c.strokeStyle = 'rgba(70,90,90,0.45)'; c.lineWidth = 3; for (let i = 0; i < 26; i++) { const x = r() * w * 0.45, y = r() * h * 0.5; c.beginPath(); c.arc(x, y, 12, Math.PI * 1.1, Math.PI * 1.9); c.arc(x + 24, y, 12, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
      c.strokeStyle = '#6a4a26'; c.lineWidth = 6; c.stroke();
      // mountains, forests, towns
      for (let i = 0; i < 26; i++) { const x = w * 0.35 + r() * w * 0.6, y = h * 0.45 + r() * h * 0.5; c.fillStyle = '#a8865a'; c.beginPath(); c.moveTo(x - 26, y); c.lineTo(x, y - 40); c.lineTo(x + 26, y); c.fill(); c.strokeStyle = '#5a3a1a'; c.lineWidth = 3; c.stroke(); }
      for (let i = 0; i < 60; i++) { const x = w * 0.5 + r() * w * 0.5, y = r() * h * 0.6; c.fillStyle = '#7a8a4a'; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); }
      for (let i = 0; i < 12; i++) { const x = w * 0.2 + r() * w * 0.75, y = h * 0.1 + r() * h * 0.85; c.fillStyle = '#8a2a1a'; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.strokeStyle = '#3a1a0a'; c.lineWidth = 3; c.stroke(); }
      // route (dashed red)
      c.setLineDash([22, 16]); c.strokeStyle = '#a8201a'; c.lineWidth = 9; c.beginPath(); c.moveTo(w * 0.86, h * 0.9); c.bezierCurveTo(w * 0.7, h * 0.7, w * 0.62, h * 0.62, w * 0.5, h * 0.52); c.bezierCurveTo(w * 0.4, h * 0.42, w * 0.25, h * 0.36, w * 0.18, h * 0.2); c.stroke(); c.setLineDash([]);
      // compass rose
      c.save(); c.translate(w * 0.8, h * 0.18); c.fillStyle = '#6a4a26'; for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(0, 0); c.lineTo(10, 20); c.lineTo(0, i % 2 ? 50 : 90); c.lineTo(-10, 20); c.fill(); } c.restore();
      c.strokeStyle = '#6a4a26'; c.lineWidth = 14; c.strokeRect(20, 20, w - 40, h - 40); c.lineWidth = 4; c.strokeRect(44, 44, w - 88, h - 88); });
    add(tbox(3.4, 0.1, 4.4, 1), toon({ map: P.tex(P.planks(5), 2, 2), color: '#8a5a34' }), 0, 0.75, 0, g);
    const mp = add(new THREE.PlaneGeometry(2.0, 3.0), toon({ map: mapTex }), 0, 0.81, 0, g, { cast: false }); mp.rotation.x = -Math.PI / 2;
    // props around: candle, quill + inkpot, brass compass, rolled maps, books
    candle(g, 0.95, 0.8, -1.25, 0.3, 0.05); add(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 14), gold, 0.95, 0.82, -1.25, g);
    add(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 12), C('#1a1a2a'), -1.2, 0.86, 0.9, g); const ql = add(tbox(0.02, 0.45, 0.07, 1), white, -1.15, 1.05, 0.88, g); ql.rotation.z = -0.4;
    add(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24), gold, 1.15, 0.83, 1.0, g); add(new THREE.CylinderGeometry(0.17, 0.17, 0.052, 24), cream, 1.15, 0.84, 1.0, g);
    for (let k = 0; k < 3; k++) { const rl = add(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 12), C('#e0c890'), -1.3 + k * 0.14, 0.88, -1.1, g); rl.rotation.x = Math.PI / 2; }
    for (let k = 0; k < 4; k++) add(tbox(0.5, 0.08, 0.36, 1), C(['#6a1a1a', '#1a3a5a', '#3a5a1a', '#5a3a1a'][k]), 1.3, 0.85 + k * 0.08, -0.2, g).rotation.y = k * 0.15;
    // the travel minis: carriage (with 2 horses) and a ship
    const car = new THREE.Group(); g.add(car); S.carriage = car;
    add(tbox(0.12, 0.08, 0.07, 1), C('#2a5a3a'), 0, 0.07, 0, car); add(tbox(0.13, 0.015, 0.08, 1), gold, 0, 0.115, 0, car);
    for (const [dx, dz] of [[-0.04, 0.04], [0.04, 0.04], [-0.04, -0.04], [0.04, -0.04]]) { const wl = add(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 12), C('#a8201a'), dx, 0.027, dz, car); wl.rotation.x = Math.PI / 2; }
    for (const dz of [-0.02, 0.02]) { add(tbox(0.06, 0.03, 0.02, 1), C('#7a4a2a'), 0.12, 0.05, dz, car); add(tbox(0.02, 0.025, 0.015, 1), C('#7a4a2a'), 0.155, 0.07, dz, car); }
    const ship = new THREE.Group(); g.add(ship); S.ship = ship;
    const hull = add(tbox(0.18, 0.05, 0.07, 1), C('#6a3a1a'), 0, 0.03, 0, ship); hull.scale.x = 1;
    add(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 6), woodD, 0, 0.13, 0, ship);
    for (const [y, s] of [[0.12, 0.1], [0.19, 0.07]]) add(tbox(0.005, s * 0.8, s * 1.1, 1), cream, 0.006, y, 0, ship);
    add(tbox(0.005, 0.03, 0.04, 1), C('#c8202a'), 0, 0.235, 0, ship);
    // background: dim study wall, bookshelf, window (blurred)
    add(tbox(8, 5, 0.2, 1), C('#5a3a24'), 0, 2.5, -3.2, g, { cast: false });
    for (let k = 0; k < 4; k++) { add(tbox(2.4, 0.06, 0.4, 1), woodD, -1.8, 1.0 + k * 0.6, -3.0, g); for (let b = 0; b < 12; b++) add(tbox(0.12, 0.4 + rng() * 0.12, 0.3, 1), C(['#6a1a1a', '#1a3a5a', '#3a5a1a', '#8a6a2a'][(b + k) % 4]), -2.9 + b * 0.18, 1.25 + k * 0.6, -3.0, g); }
    const gl = add(new THREE.PlaneGeometry(14, 10), C('#3a2418'), 0, -0.01, 0, g, { cast: false }); gl.rotation.x = -Math.PI / 2;
  }

  // ====================================================== M2b EUROPEAN STREET (sepia flashback) ======================================================
  {
    const g = G.europe;
    const cob = texM(P.stone(23, 28, 12, 62, 48, 36), 20, 20);
    const gr = add(new THREE.PlaneGeometry(60, 80), cob, 0, 0, -10, g, { cast: false }); gr.rotation.x = -Math.PI / 2;
    for (const s of [-1, 1]) add(tbox(2.2, 0.16, 70, 1), C('#d8ccb4'), s * 4.6, 0.08, -10, g, { cast: false });
    const facade = (seed, col) => canvasTex(512, 768, (c, w, h) => { const r = P.rng(seed); c.fillStyle = col; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(255,255,255,${r() * 0.06})`; c.fillRect(r() * w, r() * h, 20 + r() * 40, 4 + r() * 10); }
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, h * 0.82, w, h * 0.18); c.fillStyle = '#f4efe4'; for (const y of [h * 0.26, h * 0.52, h * 0.8]) c.fillRect(0, y, w, 10);
      for (let row = 0; row < 3; row++) for (let k = 0; k < 3; k++) { const x = w * (0.12 + k * 0.3), y = h * (0.06 + row * 0.26), ww = w * 0.16, hh = h * 0.15;
        c.fillStyle = '#f4efe4'; c.fillRect(x - 8, y - 8, ww + 16, hh + 16); c.fillStyle = '#3a4a6a'; c.fillRect(x, y, ww, hh); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x + 4, y + 4, ww * 0.35, hh - 8);
        c.strokeStyle = '#f4efe4'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + ww / 2, y); c.lineTo(x + ww / 2, y + hh); c.moveTo(x, y + hh / 2); c.lineTo(x + ww, y + hh / 2); c.stroke();
        c.fillStyle = ['#3a6a4a', '#6a3a3a', '#3a4a7a'][seed % 3]; c.fillRect(x - 26, y - 4, 18, hh + 8); c.fillRect(x + ww + 8, y - 4, 18, hh + 8); }
      c.fillStyle = '#5a3a24'; c.fillRect(w * 0.38, h * 0.84, w * 0.24, h * 0.16); });
    const cols = ['#e8c8a8', '#c8d8c0', '#e8b8b0', '#d8d0f0', '#f0e0b0', '#b8d0e0'];
    for (const s of [-1, 1]) for (let i = 0; i < 9; i++) { const z = 6 - i * 6.2, hh = 9 + (i * 7 % 4), x = s * 8.6;
      const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = -s * Math.PI / 2; g.add(b);
      add(tbox(6, hh, 3, 1), C(cols[(i + (s > 0 ? 3 : 0)) % 6]), 0, hh / 2, -1.5, b);
      ns(add(new THREE.PlaneGeometry(6, hh), toon({ map: facade(i + (s > 0 ? 10 : 0), cols[(i + (s > 0 ? 3 : 0)) % 6]) }), 0, hh / 2, 0.01, b, { cast: false })).userData.ndSkip = false;
      add(tbox(6.3, 0.3, 0.5, 1), C('#f4efe4'), 0, hh, 0.1, b); const rf = add(new THREE.CylinderGeometry(0.01, 3.4, 2.4, 4), C('#5a4a6a'), 0, hh + 1.2, -1.5, b); rf.rotation.y = Math.PI / 4; rf.scale.z = 0.55;
      // balcony
      add(tbox(2.2, 0.12, 0.7, 1), C('#f4efe4'), 0, hh * 0.52, 0.35, b); for (let k = 0; k < 9; k++) add(tbox(0.04, 0.6, 0.04, 1), C('#2a2a2a'), -1.0 + k * 0.25, hh * 0.52 + 0.36, 0.65, b, { cast: false });
      add(tbox(2.2, 0.05, 0.05, 1), C('#2a2a2a'), 0, hh * 0.52 + 0.66, 0.65, b);
      // flower boxes
      for (const fx of [-1.8, 1.8]) { add(tbox(0.8, 0.2, 0.25, 1), C('#8a5a3a'), fx, hh * 0.27 + 0.2, 0.15, b); for (let k = 0; k < 4; k++) add(new THREE.SphereGeometry(0.1, 8, 6), C(['#e04a6a', '#f2c040'][k % 2]), fx - 0.3 + k * 0.2, hh * 0.27 + 0.36, 0.2, b, { cast: false }); }
    }
    // clock tower at the end of the street
    const ct = new THREE.Group(); ct.position.set(0, 0, -50); g.add(ct);
    add(tbox(6, 22, 6, 2), C('#e0d0b0'), 0, 11, 0, ct); add(tbox(6.6, 0.5, 6.6, 1), C('#f4efe4'), 0, 16, 0, ct);
    const clk = canvasTex(256, 256, (c, w) => { c.fillStyle = '#f4efe4'; c.beginPath(); c.arc(w / 2, w / 2, w * 0.48, 0, 7); c.fill(); c.strokeStyle = '#2a2a2a'; c.lineWidth = 10; c.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.lineWidth = i % 3 ? 4 : 10; c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * w * 0.36, w / 2 + Math.sin(a) * w * 0.36); c.lineTo(w / 2 + Math.cos(a) * w * 0.44, w / 2 + Math.sin(a) * w * 0.44); c.stroke(); } });
    ns(add(new THREE.CircleGeometry(2.0, 32), basic(clk), 0, 18.5, 3.02, ct, { cast: false }));
    S.clockHand = add(tbox(0.12, 1.5, 0.05, 1), C('#2a2a2a'), 0, 18.5, 3.1, ct, { cast: false }); S.clockHand.geometry.translate(0, 0.7, 0);
    const sp = add(new THREE.ConeGeometry(4.4, 8, 4), C('#4a6a8a'), 0, 26, 0, ct); sp.rotation.y = Math.PI / 4;
    // lamp posts + potted trees
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const z = 4 - i * 8; add(new THREE.CylinderGeometry(0.06, 0.09, 3.6, 8), C('#2a2a2a'), s * 3.8, 1.8, z, g); add(tbox(0.35, 0.45, 0.35, 1), glowC('#ffe0a0'), s * 3.8, 3.75, z, g, { cast: false });
      add(tbox(0.6, 0.6, 0.6, 1), C('#8a5a3a'), s * 4.2, 0.3, z - 4, g); add(new THREE.SphereGeometry(0.7, 12, 10), C('#5a8a3a'), s * 4.2, 1.4, z - 4, g); }
    // a few parked carts + barrels for the foreground
    for (const [x, z] of [[-3.0, -6], [3.2, -14], [-3.3, -20]]) { add(new THREE.CylinderGeometry(0.35, 0.35, 0.8, 12), C('#8a5a34'), x, 0.4, z, g); add(new THREE.TorusGeometry(0.36, 0.03, 4, 16), C('#3a3a3a'), x, 0.6, z, g).rotation.x = Math.PI / 2; }
    S.euroClouds = []; for (let i = 0; i < 9; i++) S.euroClouds.push([OFF.europe[0] - 40 + i * 10, 30 + (i % 3) * 6, -80 - (i % 4) * 10, 14 + (i % 3) * 4]);
  }

  // ====================================================== M3 STUDY ======================================================
  {
    const g = G.study;
    const fl = add(new THREE.PlaneGeometry(12, 12), planks, 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const rug = add(new THREE.PlaneGeometry(4, 3), tm(carpet), 0, 0.01, 0.5, g, { cast: false }); rug.rotation.x = -Math.PI / 2; rug.rotation.z = Math.PI / 2;
    const panel = tm(damask('#1e3a2a', '#2a4a36', '#c8a040'));
    for (const [x, z, ry, w] of [[0, -3.5, 0, 10], [-4, 0, Math.PI / 2, 10], [4, 0, -Math.PI / 2, 10]]) { const W2 = new THREE.Group(); W2.position.set(x, 0, z); W2.rotation.y = ry; g.add(W2);
      add(new THREE.PlaneGeometry(w, 5), panel, 0, 2.5, 0, W2, { cast: false }); add(tbox(w, 1.1, 0.1, 1), woodD, 0, 0.55, 0.05, W2, { cast: false }); add(tbox(w, 0.25, 0.25, 1), gold, 0, 4.7, 0.1, W2, { cast: false }); }
    const ceil = add(new THREE.PlaneGeometry(10, 10), woodD, 0, 4.9, 0, g, { cast: false }); ceil.rotation.x = Math.PI / 2;
    // bookshelves right, window left, wall map behind
    for (let k = 0; k < 5; k++) { add(tbox(0.4, 0.06, 2.6, 1), wood, 3.75, 0.6 + k * 0.75, -1.6, g); for (let b = 0; b < 14; b++) add(tbox(0.3, 0.5 + rng() * 0.15, 0.13, 1), C(['#6a1a1a', '#1a3a5a', '#3a5a1a', '#8a6a2a', '#5a2a5a'][(b + k) % 5]), 3.7, 0.9 + k * 0.75, -2.8 + b * 0.18, g); }
    add(tbox(0.45, 3.8, 0.1, 1), woodD, 3.75, 1.9, -2.95, g); add(tbox(0.45, 3.8, 0.1, 1), woodD, 3.75, 1.9, -0.25, g);
    const wm = canvasTex(768, 512, (c, w, h) => { c.fillStyle = '#e4cc98'; c.fillRect(0, 0, w, h); const r = P.rng(8); c.fillStyle = '#a8b8a8'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w * 0.4, 0); c.bezierCurveTo(w * 0.3, h * 0.3, w * 0.2, h * 0.5, 0, h * 0.6); c.fill();
      c.strokeStyle = '#7a4a26'; c.lineWidth = 3; for (let i = 0; i < 30; i++) { const x = w * 0.35 + r() * w * 0.6, y = r() * h; c.beginPath(); c.moveTo(x - 12, y); c.lineTo(x, y - 18); c.lineTo(x + 12, y); c.stroke(); }
      c.setLineDash([12, 10]); c.strokeStyle = '#a8201a'; c.lineWidth = 5; c.beginPath(); c.moveTo(w * 0.9, h * 0.8); c.bezierCurveTo(w * 0.6, h * 0.5, w * 0.4, h * 0.6, w * 0.2, h * 0.3); c.stroke(); c.setLineDash([]); c.lineWidth = 10; c.strokeRect(10, 10, w - 20, h - 20); });
    add(tbox(2.6, 1.8, 0.08, 1), gold, -0.6, 2.9, -3.45, g); ns(add(new THREE.PlaneGeometry(2.4, 1.6), basic(wm, { color: '#e0d0b0' }), -0.6, 2.9, -3.4, g, { cast: false }));
    add(tbox(0.12, 2.4, 1.6, 1), gold, -3.95, 2.6, -1.2, g); ns(add(new THREE.PlaneGeometry(1.4, 2.2), basic(winView(17, true)), -3.9, 2.6, -1.2, g, { cast: false })).rotation.y = Math.PI / 2;
    add(tbox(0.1, 2.2, 0.06, 1), gold, -3.86, 2.6, -1.2, g); add(tbox(0.1, 0.06, 1.4, 1), gold, -3.86, 2.6, -1.2, g);
    S.shafts.push({ set: 'study', m: shaft(g, -3.0, 2.2, -1.2, 1.4, 4.4, 0, Math.PI / 2 + 0.6, '#8ab0ff', 0.3) });
    // desk
    const D = new THREE.Group(); D.position.set(0, 0, -1.4); g.add(D); S.desk = D;
    add(tbox(2.6, 0.12, 1.3, 1), toon({ map: P.tex(P.planks(7), 2, 1), color: '#7a4a2a' }), 0, 0.92, 0, D); add(tbox(2.4, 0.8, 1.1, 1), woodD, 0, 0.46, 0, D);
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { add(tbox(0.6, 0.2, 0.02, 1), wood, s * 0.75, 0.25 + k * 0.24, 0.56, D); add(new THREE.SphereGeometry(0.03, 8, 6), gold, s * 0.75, 0.25 + k * 0.24, 0.58, D); }
    add(tbox(1.0, 0.012, 0.7, 1), C('#e4cc98'), -0.55, 0.985, 0.1, D, { cast: false }).rotation.y = 0.2; // spread map
    add(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 12), C('#14141e'), 0.75, 1.03, -0.2, D); const q = add(tbox(0.02, 0.45, 0.08, 1), white, 0.78, 1.25, -0.2, D); q.rotation.z = -0.35; S.inkQuill = q;
    candle(D, -1.05, 0.98, -0.3, 0.32, 0.05); add(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 14), gold, -1.05, 1.0, -0.3, D);
    add(new THREE.SphereGeometry(0.16, 16, 12), C('#4a7ab0'), 1.05, 1.18, -0.35, D); add(new THREE.CylinderGeometry(0.04, 0.08, 0.14, 10), gold, 1.05, 1.0, -0.35, D); // globe
    // the decree (texture rewritten as it is written) + seal stamp
    const dc = document.createElement('canvas'); dc.width = 512; dc.height = 768; S.decreeC = dc; S.decreeT = new THREE.CanvasTexture(dc); S.decreeT.colorSpace = THREE.SRGBColorSpace; S.decreeT.anisotropy = 8;
    S.decree = add(new THREE.PlaneGeometry(0.46, 0.69), basic(S.decreeT, { color: '#f2e6cc' }), 0.15, 0.99, 0.15, D, { cast: false }); S.decree.rotation.x = -Math.PI / 2; ns(S.decree);
    const seal = new THREE.Group(); D.add(seal); S.seal = seal;
    add(new THREE.CylinderGeometry(0.075, 0.09, 0.05, 20), gold, 0, 0.025, 0, seal); add(new THREE.CylinderGeometry(0.03, 0.045, 0.2, 10), woodD, 0, 0.15, 0, seal); add(new THREE.SphereGeometry(0.06, 12, 10), woodD, 0, 0.28, 0, seal);
    S.wax = add(new THREE.CylinderGeometry(0.075, 0.08, 0.008, 20), C('#b8141e'), 0.15, 0.995, 0.38, D, { cast: false }); S.wax.visible = false;
    // drawn crown on the wax
    S.chair = add(tbox(0.9, 1.9, 0.2, 1), C('#7a1420'), 0, 0.95, -2.3, g); add(tbox(1.0, 0.25, 0.25, 1), gold, 0, 1.95, -2.3, g);
  }

  // ====================================================== M4 TAX OFFICE / MINT ======================================================
  {
    const g = G.mint;
    const fl = add(new THREE.PlaneGeometry(16, 16), planks, 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    for (const [x, z, ry] of [[0, -4, 0], [-6, 0, Math.PI / 2], [6, 0, -Math.PI / 2]]) { const w = add(new THREE.PlaneGeometry(14, 6), stoneWall, x, 3, z, g, { cast: false }); w.rotation.y = ry; }
    const ceil = add(new THREE.PlaneGeometry(14, 10), woodD, 0, 5.4, 0, g, { cast: false }); ceil.rotation.x = Math.PI / 2;
    for (let x = -5; x <= 5; x += 2) add(tbox(0.3, 0.35, 10, 1), wood, x, 5.2, 0, g);
    // the price board (German) on the back wall, centred above the desk
    const board = canvasTex(1024, 640, (c, w, h) => { c.fillStyle = '#5a3418'; c.fillRect(0, 0, w, h); const r = P.rng(3); for (let i = 0; i < 40; i++) { c.strokeStyle = 'rgba(30,15,5,0.3)'; c.lineWidth = 2; c.beginPath(); const y = r() * h; c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + 8, w * 0.6, y - 8, w, y); c.stroke(); }
      c.strokeStyle = '#e8b840'; c.lineWidth = 18; c.strokeRect(24, 24, w - 48, h - 48);
      c.font = `bold 140px ${SERIF}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.lineJoin = 'round';
      const row = (txt, num, y, col) => { c.lineWidth = 16; c.strokeStyle = '#1a0e06'; c.strokeText(txt, 90, y); c.fillStyle = col; c.fillText(txt, 90, y); c.textAlign = 'right'; c.strokeText(num, w - 90, y); c.fillStyle = '#ffe070'; c.fillText(num, w - 90, y); c.textAlign = 'left'; };
      row('Reich:', '100', h * 0.32, '#f4ead6'); row('Arm:', '1', h * 0.72, '#f4ead6');
      c.fillStyle = '#e8b840'; c.fillRect(90, h * 0.52, w - 180, 8); });
    add(tbox(2.6, 1.68, 0.12, 1), woodD, 0, 3.55, -3.92, g); S.board = ns(add(new THREE.PlaneGeometry(2.45, 1.53), basic(board), 0, 3.55, -3.84, g, { cast: false }));
    for (const s of [-1, 1]) { add(tbox(0.08, 0.6, 0.08, 1), C('#2a2a2a'), s * 2.2, 4.0, -3.7, g); add(tbox(0.3, 0.4, 0.3, 1), glowC('#ffd890'), s * 2.2, 3.6, -3.6, g, { cast: false }); }
    // desk with ledger, coin piles, sacks
    add(tbox(3.2, 0.12, 1.2, 1), toon({ map: P.tex(P.planks(11), 2, 1), color: '#8a5a34' }), 0, 0.95, -1.2, g); add(tbox(3.0, 0.9, 1.0, 1), woodD, 0, 0.45, -1.2, g);
    S.coinPiles = []; const coinM = toon({ color: '#f2c040', emissive: '#6a4a00', emissiveIntensity: 0.35 });
    for (const [x, z, n] of [[-1.15, -0.95, 9], [-0.95, -1.35, 13], [-0.75, -0.9, 6], [1.2, -1.4, 11], [0.95, -1.0, 7]]) for (let k = 0; k < n; k++) add(new THREE.CylinderGeometry(0.06, 0.06, 0.016, 16), coinM, x + (rng() - 0.5) * 0.01, 1.02 + k * 0.017, z, g, { cast: false });
    for (let k = 0; k < 30; k++) add(new THREE.CylinderGeometry(0.06, 0.06, 0.016, 16), coinM, -0.4 + rng() * 0.6, 1.016, -1.6 + rng() * 0.3, g, { cast: false }).rotation.z = (rng() - 0.5) * 0.4;
    for (const [x, z] of [[-2.2, -1.6], [2.3, -1.8], [-2.6, -2.6], [2.8, -2.8]]) { const s = add(new THREE.SphereGeometry(0.42, 14, 12), C('#c8a060'), x, 0.38, z, g); s.scale.y = 0.95; add(new THREE.CylinderGeometry(0.12, 0.2, 0.2, 10), C('#a8804a'), x, 0.8, z, g);
      for (let k = 0; k < 4; k++) add(new THREE.CylinderGeometry(0.06, 0.06, 0.016, 12), coinM, x - 0.1 + k * 0.06, 0.94, z, g, { cast: false }).rotation.x = 0.4; }
    // heavy sack that drops onto the desk (animated), single coin (animated)
    S.bigSack = new THREE.Group(); g.add(S.bigSack); const bs = add(new THREE.SphereGeometry(0.34, 16, 12), C('#b8945a'), 0, 0.3, 0, S.bigSack); bs.scale.set(1, 0.9, 1);
    add(new THREE.CylinderGeometry(0.09, 0.16, 0.18, 10), C('#8a6a3a'), 0, 0.66, 0, S.bigSack); add(new THREE.TorusGeometry(0.1, 0.02, 6, 12), C('#a8201a'), 0, 0.62, 0, S.bigSack).rotation.x = Math.PI / 2;
    for (let k = 0; k < 6; k++) add(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 12), coinM, -0.08 + (k % 3) * 0.08, 0.76 + Math.floor(k / 3) * 0.03, (k % 2) * 0.04, S.bigSack, { cast: false }).rotation.x = 0.5;
    S.oneCoin = add(new THREE.CylinderGeometry(0.06, 0.06, 0.016, 16), coinM, 0, 0, 0, g, { cast: false });
    // the coin press (screw press) on the right
    const PR = new THREE.Group(); PR.position.set(2.2, 0, -0.2); g.add(PR); S.press = PR;
    add(tbox(1.0, 0.9, 0.8, 1), woodD, 0, 0.45, 0, PR); add(tbox(1.1, 0.1, 0.9, 1), C('#5a5a62'), 0, 0.95, 0, PR);
    for (const s of [-1, 1]) add(tbox(0.16, 1.6, 0.3, 1), C('#4a4a54'), s * 0.42, 1.8, 0, PR);
    add(tbox(1.0, 0.25, 0.34, 1), C('#4a4a54'), 0, 2.6, 0, PR);
    const scr = new THREE.Group(); PR.add(scr); S.screw = scr;
    add(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 10), C('#8a8a94'), 0, 0.6, 0, scr); for (let k = 0; k < 10; k++) add(new THREE.TorusGeometry(0.07, 0.015, 4, 12), C('#6a6a74'), 0, 0.1 + k * 0.1, 0, scr).rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 14), C('#7a7a84'), 0, 0, 0, scr);
    const bar = add(tbox(1.6, 0.06, 0.06, 1), C('#3a3a42'), 0, 1.1, 0, scr); for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.11, 12, 10), C('#2a2a32'), s * 0.8, 1.1, 0, scr);
    add(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), C('#7a7a84'), 0, 1.04, 0, PR); // anvil die
    S.blank = add(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 24), coinM, 0, 1.09, 0, PR, { cast: false });
    // shelves with jars, a lantern, window with morning light
    for (let k = 0; k < 3; k++) { add(tbox(2.2, 0.06, 0.4, 1), wood, -4.2, 1.4 + k * 0.8, -3.75, g); for (let b = 0; b < 6; b++) add(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 10), C(['#6a8a6a', '#a87a4a', '#5a6a8a'][(b + k) % 3]), -5.1 + b * 0.35, 1.58 + k * 0.8, -3.75, g); }
    add(tbox(0.12, 2.0, 1.4, 1), wood, 5.95, 2.8, -1.5, g); ns(add(new THREE.PlaneGeometry(1.2, 1.8), basic(winView(19, false)), 5.9, 2.8, -1.5, g, { cast: false })).rotation.y = -Math.PI / 2;
    S.shafts.push({ set: 'mint', m: shaft(g, 3.6, 2.1, -1.2, 1.6, 5.4, 0.1, -Math.PI / 2 + 0.45, '#ffe0a0', 0.32) });
    // hero tokens (big 3D coins) for the inserts
    const CF = coinFaces(THREE, canvasTex), edgeM = toon({ color: '#d8a428', emissive: '#5a3a00', emissiveIntensity: 0.3 });
    for (const t of [CF.front, CF.back, CF.back2]) { t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; }
    const mkCoin = (fr, bk) => { const G3 = new THREE.Group(); g.add(G3); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 72), [edgeM, new THREE.MeshBasicMaterial({ map: fr }), new THREE.MeshBasicMaterial({ map: bk })]);
      m.rotation.x = Math.PI / 2; m.castShadow = true; G3.add(m); const ridge = add(new THREE.TorusGeometry(0.5, 0.02, 6, 72), edgeM, 0, 0, 0, G3, { cast: false }); G3.visible = false; return G3; };
    S.coinA = mkCoin(CF.front, CF.back); S.coinB = mkCoin(CF.front, CF.back2);
    // queue railing
    for (let z = 0.6; z < 6; z += 1.2) { add(new THREE.CylinderGeometry(0.05, 0.06, 1.0, 8), gold, -0.9, 0.5, z, g); }
    add(tbox(0.04, 0.04, 5, 1), C('#a8201a'), -0.9, 0.95, 3.0, g);
  }

  // ====================================================== M5 SNOWY STREET + CITY GATE ======================================================
  {
    const g = G.snow;
    const gr = add(new THREE.PlaneGeometry(120, 160), tm(snowTex), 0, 0, -30, g, { cast: false }); gr.rotation.x = -Math.PI / 2;
    // road ruts
    for (const s of [-0.7, 0.7]) { const r = add(new THREE.PlaneGeometry(0.35, 120), C('#c8d4e8'), s, 0.005, -30, g, { cast: false }); r.rotation.x = -Math.PI / 2; }
    const logM = tm(logs(['#7a4a26', '#9a6236', '#5a3418']), '#ffffff'), logM2 = tm(logs(['#6a3e20', '#8a5630', '#4a2a14']), '#ffffff');
    const izba = (x, z, ry, w, h, d, col) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; g.add(b);
      add(tbox(w, h, d, 1), col ? logM2 : logM, 0, h / 2, 0, b);
      const rf = add(new THREE.CylinderGeometry(0.01, Math.hypot(w, d) / 2 + 0.5, 2.6, 4), C('#6a4a3a'), 0, h + 1.3, 0, b); rf.rotation.y = Math.PI / 4; rf.scale.z = d / w;
      const sr = add(new THREE.CylinderGeometry(0.01, Math.hypot(w, d) / 2 + 0.55, 1.4, 4), C('#f4f8ff'), 0, h + 2.0, 0, b); sr.rotation.y = Math.PI / 4; sr.scale.z = d / w;
      for (const sx of [-w / 4, w / 4]) { add(tbox(0.95, 1.1, 0.1, 1), C('#f4f0e8'), sx, h * 0.55, d / 2 + 0.05, b); add(tbox(0.7, 0.85, 0.12, 1), glowC('#ffcf70'), sx, h * 0.55, d / 2 + 0.06, b, { cast: false });
        add(tbox(1.15, 0.22, 0.2, 1), C(['#3a8ad8', '#d84a4a', '#3ab070'][Math.abs(Math.round(x)) % 3]), sx, h * 0.55 + 0.68, d / 2 + 0.1, b); add(tbox(1.0, 0.12, 0.3, 1), C('#f4f8ff'), sx, h * 0.55 - 0.6, d / 2 + 0.15, b); }
      add(tbox(0.9, 1.9, 0.1, 1), C('#5a2a14'), 0, 0.95, d / 2 + 0.05, b);
      // chimney + smoke origin
      add(tbox(0.5, 1.6, 0.5, 1), C('#8a6a5a'), w * 0.25, h + 1.6, 0, b); b.updateWorldMatrix(true, false); const v = new THREE.Vector3(w * 0.25, h + 2.5, 0); b.localToWorld(v); (S.chim = S.chim || []).push([v.x, v.y, v.z]);
      return b; };
    for (let i = 0; i < 7; i++) { izba(-7.5, -6 - i * 7, Math.PI / 2, 5.5, 3.6 + (i % 2), 4.5, i % 2); izba(7.5, -2 - i * 7, -Math.PI / 2, 5.5, 3.4 + ((i + 1) % 2), 4.5, (i + 1) % 2); }
    for (let i = 0; i < 4; i++) { izba(-7.5, 6 + i * 7, Math.PI / 2, 5.5, 3.6, 4.5, i % 2); izba(7.5, 6 + i * 7, -Math.PI / 2, 5.5, 3.4, 4.5, i % 2); }
    // colourful onion domes beyond the gate (architecture only)
    const dome = (x, z, s, col, col2) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.scale.setScalar(s); g.add(b);
      add(new THREE.CylinderGeometry(2, 2, 8, 12), C('#f4ece0'), 0, 4, 0, b); add(new THREE.CylinderGeometry(1.4, 1.4, 2.5, 12), C(col2), 0, 9.2, 0, b);
      const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector2(Math.sin(t * Math.PI) * 2.2 * (1 - t * 0.55) + 0.01, t * 4.2)); }
      const d = add(new THREE.LatheGeometry(pts, 16), C(col), 0, 10.4, 0, b); for (let k = 0; k < 8; k++) { const st = add(new THREE.TorusGeometry(2.0 - k * 0.05, 0.07, 4, 24), C('#f4f8ff'), 0, 10.9 + k * 0.05, 0, b); st.rotation.x = Math.PI / 2; st.visible = k === 0; }
      add(new THREE.ConeGeometry(0.15, 1.6, 6), gold, 0, 15.2, 0, b); };
    dome(-6, -62, 1.4, '#d84a4a', '#e8b840'); dome(2, -70, 1.8, '#3a8ad8', '#f4ece0'); dome(9, -60, 1.2, '#3ab070', '#d84a4a'); dome(-14, -74, 1.5, '#e8b840', '#3a8ad8'); dome(15, -76, 1.6, '#c84ab0', '#f4ece0');
    // city gate with the German sign
    const GT = new THREE.Group(); GT.position.set(0, 0, -16); g.add(GT); S.gate = GT;
    for (const s of [-1, 1]) { add(tbox(2.0, 7, 2.0, 1), logM, s * 3.4, 3.5, 0, GT); const rf = add(new THREE.ConeGeometry(1.8, 2.4, 4), C('#3a8ad8'), s * 3.4, 8.2, 0, GT); rf.rotation.y = Math.PI / 4; add(new THREE.ConeGeometry(1.86, 0.9, 4), C('#f4f8ff'), s * 3.4, 7.5, 0, GT).rotation.y = Math.PI / 4;
      add(new THREE.ConeGeometry(0.12, 0.8, 6), gold, s * 3.4, 9.6, 0, GT); }
    add(tbox(8.8, 1.2, 1.6, 1), logM, 0, 5.6, 0, GT); add(tbox(9.2, 0.35, 1.9, 1), C('#f4f8ff'), 0, 6.35, 0, GT);
    const sign = canvasTex(1024, 300, (c, w, h) => { c.fillStyle = '#7a1a1a'; c.beginPath(); c.roundRect(8, 8, w - 16, h - 16, 30); c.fill(); c.strokeStyle = '#e8b840'; c.lineWidth = 16; c.beginPath(); c.roundRect(30, 30, w - 60, h - 60, 20); c.stroke();
      c.font = `bold 168px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 18; c.strokeStyle = '#2a0a06'; c.strokeText('Bartsteuer', w / 2, h / 2 + 8); c.fillStyle = '#ffe9a8'; c.fillText('Bartsteuer', w / 2, h / 2 + 8); });
    S.gateSign = ns(add(new THREE.PlaneGeometry(4.6, 1.35), basic(sign), 0, 4.3, 0.95, GT, { cast: false }));
    add(tbox(4.8, 1.5, 0.1, 1), woodD, 0, 4.3, 0.88, GT);
    // guard booth + striped barrier
    const bt = new THREE.Group(); bt.position.set(-3.0, 0, -12); g.add(bt);
    add(tbox(1.4, 2.4, 1.4, 1), tm(tx(64, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f4f0e8' : '#1a1a1a'; c.beginPath(); c.moveTo(0, i * 40 - 20); c.lineTo(w, i * 40 + 10); c.lineTo(w, i * 40 + 50); c.lineTo(0, i * 40 + 20); c.fill(); } })), 0, 1.2, 0, bt);
    add(new THREE.ConeGeometry(1.2, 1.0, 4), C('#a8201a'), 0, 2.9, 0, bt).rotation.y = Math.PI / 4;
    const barTex = tx(256, 32, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f4f0e8' : '#c8202a'; c.fillRect(i * w / 8, 0, w / 8, h); } });
    S.barrier = add(tbox(4.2, 0.14, 0.14, 1), tm(barTex), -0.8, 1.1, -12.4, g); add(tbox(0.25, 1.1, 0.25, 1), C('#3a3a3a'), -2.9, 0.55, -12.4, g);
    // market stalls along the street
    const stall = (x, z, col, goods) => { const b = new THREE.Group(); b.position.set(x, 0, z); g.add(b);
      add(tbox(2.2, 0.9, 0.9, 1), planks, 0, 0.45, 0, b); for (const sx of [-1.05, 1.05]) add(tbox(0.1, 2.3, 0.1, 1), woodD, sx, 1.15, -0.3, b);
      const aw = add(tbox(2.5, 0.08, 1.4, 1), tm(tx(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f4f0e8' : col; c.fillRect(i * w / 8, 0, w / 8, h); } })), 0, 2.25, 0.1, b); aw.rotation.x = 0.25;
      add(tbox(2.5, 0.16, 1.4, 1), C('#f4f8ff'), 0, 2.36, 0.08, b).rotation.x = 0.25;
      for (let k = 0; k < 7; k++) { const gm = goods === 'cab' ? C(['#7ab84a', '#9ad06a'][k % 2]) : goods === 'bread' ? C('#d8984a') : C(['#d84a3a', '#e8b840', '#3a8ad8'][k % 3]);
        const o = add(goods === 'pot' ? new THREE.CylinderGeometry(0.1, 0.13, 0.22, 10) : new THREE.SphereGeometry(0.13, 10, 8), gm, -0.8 + k * 0.27, 1.02, 0.1 + (k % 2) * 0.15, b); if (goods === 'bread') o.scale.set(1.5, 0.7, 1); }
      add(tbox(0.35, 0.4, 0.35, 1), glowC('#ffcf70'), 0.9, 1.9, 0.5, b, { cast: false }); return b; };
    stall(-4.0, -4.5, '#d84a4a', 'cab'); stall(4.2, -7, '#3a8ad8', 'bread'); stall(-4.2, -9.5, '#e8b840', 'pot'); stall(4.4, -1.0, '#3ab070', 'cab'); stall(-4.2, 2.4, '#c84ab0', 'bread');
    // lanterns on posts, snowmen, barrels, sled tracks, fir trees
    for (const [x, z] of [[-2.6, -1], [2.6, -3], [-2.6, -8], [2.6, -10], [-2.6, 4], [2.6, 5]]) { add(new THREE.CylinderGeometry(0.06, 0.08, 2.8, 8), C('#2a2a2a'), x, 1.4, z, g); add(tbox(0.32, 0.42, 0.32, 1), glowC('#ffd890'), x, 2.95, z, g, { cast: false }); (S.lamps = S.lamps || []).push([x + OFF.snow[0], 2.95, z]); }
    for (let i = 0; i < 22; i++) { const x = (i % 2 ? 1 : -1) * (11 + rng() * 10), z = -10 - rng() * 60; add(new THREE.ConeGeometry(1.4, 4, 8), C('#2a5a3a'), x, 2, z, g); add(new THREE.ConeGeometry(1.0, 1.4, 8), C('#f4f8ff'), x, 3.6, z, g); }
    const sm = (x, z) => { add(new THREE.SphereGeometry(0.45, 14, 10), white, x, 0.4, z, g); add(new THREE.SphereGeometry(0.32, 14, 10), white, x, 1.0, z, g); add(new THREE.SphereGeometry(0.22, 12, 10), white, x, 1.45, z, g); add(new THREE.ConeGeometry(0.05, 0.25, 6), C('#e8702a'), x, 1.45, z + 0.28, g).rotation.x = Math.PI / 2; };
    sm(5.2, 3.5); sm(-5.6, -13);
    for (const [x, z] of [[3.0, 1.5], [-3.2, -2.0], [3.3, -12]]) { add(new THREE.CylinderGeometry(0.35, 0.35, 0.8, 12), wood, x, 0.4, z, g); add(new THREE.CylinderGeometry(0.37, 0.37, 0.12, 12), C('#f4f8ff'), x, 0.84, z, g); }
    // snow banks
    for (let i = 0; i < 30; i++) { const b = add(new THREE.SphereGeometry(0.6 + rng() * 0.6, 12, 8), C('#f4f8ff'), (i % 2 ? 1 : -1) * (5.0 + rng() * 0.6), 0, 8 - i * 1.6, g, { cast: false }); b.scale.y = 0.4; }
  }

  // ====================================================== M6 OLD MAN'S HOUSE ======================================================
  {
    const g = G.house;
    const fl = add(new THREE.PlaneGeometry(8, 8), planks, 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const rug = add(new THREE.CircleGeometry(1.4, 32), tm(tx(256, 256, (c, w) => { for (let i = 8; i > 0; i--) { c.fillStyle = ['#a8201a', '#e8b840', '#2a5a8a', '#f4ece0'][i % 4]; c.beginPath(); c.arc(w / 2, w / 2, w / 2 * i / 8, 0, 7); c.fill(); } })), 0.6, 0.01, 0.8, g, { cast: false }); rug.rotation.x = -Math.PI / 2;
    const logM = tm(logs(['#8a5a30', '#a8723e', '#6a3e1e']));
    for (const [x, z, ry] of [[0, -2.5, 0], [-3, 0, Math.PI / 2], [3, 0, -Math.PI / 2]]) { const w = add(new THREE.PlaneGeometry(6.5, 3.6), logM, x, 1.8, z, g, { cast: false }); w.rotation.y = ry; }
    const ceil = add(new THREE.PlaneGeometry(7, 7), woodD, 0, 3.4, 0, g, { cast: false }); ceil.rotation.x = Math.PI / 2; for (let x = -2.5; x <= 2.5; x += 1.25) add(tbox(0.22, 0.25, 6, 1), woodD, x, 3.3, 0, g);
    // fireplace (left back)
    const FP = new THREE.Group(); FP.position.set(-1.9, 0, -2.2); g.add(FP);
    add(tbox(1.8, 1.4, 0.7, 1), stoneWall, 0, 0.7, 0, FP); add(tbox(0.9, 0.8, 0.72, 1), C('#1a0e0a'), 0, 0.45, 0.02, FP, { cast: false }); add(tbox(2.0, 0.15, 0.85, 1), wood, 0, 1.45, 0.05, FP); add(tbox(1.0, 2.0, 0.6, 1), stoneWall, 0, 2.5, -0.05, FP);
    for (let k = 0; k < 3; k++) add(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8), C('#5a3418'), 0, 0.15 + k * 0.05, 0.1, FP).rotation.z = Math.PI / 2 + (k - 1) * 0.3;
    for (let k = 0; k < 3; k++) add(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 10), C(['#a8783a', '#7a8aa8', '#b85a3a'][k]), -0.6 + k * 0.6, 1.62, 0.05, FP);
    S.fire = [OFF.house[0] - 1.9, 0.3, -1.95];
    // window (right back) with falling snow outside
    add(tbox(1.3, 1.4, 0.15, 1), C('#f4f0e8'), 1.3, 2.0, -2.45, g); ns(add(new THREE.PlaneGeometry(1.1, 1.2), basic(winView(25, true)), 1.3, 2.0, -2.4, g, { cast: false }));
    add(tbox(0.06, 1.2, 0.08, 1), C('#f4f0e8'), 1.3, 2.0, -2.36, g); add(tbox(1.1, 0.06, 0.08, 1), C('#f4f0e8'), 1.3, 2.0, -2.36, g); add(tbox(1.4, 0.1, 0.3, 1), C('#f4f8ff'), 1.3, 1.28, -2.35, g);
    for (const s of [-1, 1]) add(tbox(0.35, 1.5, 0.08, 1), C('#c8302a'), 1.3 + s * 0.8, 2.05, -2.35, g);
    S.houseWin = [OFF.house[0] + 1.3, 2.0, -2.3];
    // table with the carved chest, candle, teapot; chair; shelf with icons-free trinkets
    const T = new THREE.Group(); T.position.set(0.7, 0, -0.6); g.add(T); S.htable = T;
    add(tbox(1.6, 0.1, 0.9, 1), toon({ map: P.tex(P.planks(13), 1, 1), color: '#9a6a3a' }), 0, 0.78, 0, T); for (const [x, z] of [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]]) add(tbox(0.08, 0.76, 0.08, 1), wood, x, 0.38, z, T);
    add(tbox(1.5, 0.02, 0.5, 1), C('#e8dcc8'), 0, 0.84, 0, T, { cast: false });
    const chestTex = tx(256, 128, (c, w, h) => { c.fillStyle = '#8a4a22'; c.fillRect(0, 0, w, h); c.strokeStyle = '#4a2410'; c.lineWidth = 5; c.strokeRect(8, 8, w - 16, h - 16);
      for (let i = 0; i < 5; i++) { const x = 30 + i * 49; c.beginPath(); c.arc(x, h / 2, 16, 0, 7); c.stroke(); c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; c.moveTo(x, h / 2); c.lineTo(x + Math.cos(a) * 16, h / 2 + Math.sin(a) * 16); } c.stroke(); }
      c.fillStyle = '#e8b840'; c.fillRect(0, 0, 10, h); c.fillRect(w - 10, 0, 10, h); });
    const CH = new THREE.Group(); CH.position.set(0.5, 0.84, 0.0); T.add(CH); S.chest = CH;
    add(tbox(0.5, 0.26, 0.32, 1), tm(chestTex), 0, 0.13, 0, CH); add(tbox(0.46, 0.04, 0.28, 1), C('#5a2a10'), 0, 0.245, 0, CH, { cast: false });
    const lid = new THREE.Group(); lid.position.set(0, 0.26, -0.16); CH.add(lid); S.lid = lid;
    add(tbox(0.52, 0.08, 0.34, 1), tm(chestTex), 0, 0.04, 0.17, lid); add(new THREE.CylinderGeometry(0.17, 0.17, 0.52, 16, 1, false, 0, Math.PI), tm(chestTex), 0, 0.08, 0.17, lid).rotation.z = Math.PI / 2;
    add(tbox(0.08, 0.1, 0.03, 1), gold, 0, 0.0, 0.345, lid);
    S.bundleIn = add(new THREE.SphereGeometry(0.11, 12, 8), C('#efe4d0'), 0, 0.2, 0, CH); S.bundleIn.scale.set(1.5, 0.6, 1); S.bundleIn.visible = false;
    candle(T, -0.6, 0.83, -0.25, 0.22, 0.04); add(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 12), C('#a8783a'), -0.6, 0.85, -0.25, T);
    add(new THREE.SphereGeometry(0.12, 14, 10), C('#2a5a8a'), 0.55, 0.95, -0.2, T); add(new THREE.CylinderGeometry(0.02, 0.03, 0.12, 6), C('#2a5a8a'), 0.68, 0.98, -0.2, T).rotation.z = -0.8;
    add(tbox(0.5, 0.06, 0.5, 1), wood, -0.7, 0.48, 0.55, g); add(tbox(0.5, 0.8, 0.06, 1), wood, -0.7, 0.88, 0.8, g);
    for (let k = 0; k < 2; k++) { add(tbox(1.4, 0.05, 0.3, 1), wood, 2.2, 1.5 + k * 0.6, -2.3, g); for (let b = 0; b < 4; b++) add(new THREE.CylinderGeometry(0.08, 0.09, 0.22, 10), C(['#c84a3a', '#e8b840', '#3a8a6a', '#f4ece0'][(b + k) % 4]), 1.7 + b * 0.32, 1.64 + k * 0.6, -2.3, g); }
    // hanging herbs + a little rocking cradle-free corner: a basket of yarn
    for (let k = 0; k < 4; k++) { add(new THREE.ConeGeometry(0.08, 0.35, 6), C('#6a8a3a'), -2.3 + k * 0.3, 2.95, 0.6, g).rotation.x = Math.PI; }
    add(new THREE.CylinderGeometry(0.25, 0.2, 0.25, 12), C('#c8a060'), 2.2, 0.13, 0.3, g); for (let k = 0; k < 3; k++) add(new THREE.SphereGeometry(0.1, 10, 8), C(['#d84a4a', '#3a8ad8', '#e8b840'][k]), 2.1 + k * 0.1, 0.3, 0.3, g);
  }

  // ====================================================== M7 ABOVE THE CLOUDS ======================================================
  {
    const g = G.heaven;
    const cm = [C('#ffc8dc'), C('#ffb4cc'), C('#ffdca8'), C('#fff0f4')];
    const r2 = P.rng(91);
    for (let i = 0; i < 140; i++) { const x = (r2() - 0.5) * 40, z = -r2() * 50 + 6, s = 0.8 + r2() * 1.8, m = add(new THREE.SphereGeometry(s, 16, 12), cm[i % 4], x, -0.5 + r2() * 0.4 - (z < -15 ? 1 : 0), z, g, { cast: false }); m.scale.y = 0.55; }
    for (let i = 0; i < 40; i++) { const m = add(new THREE.SphereGeometry(3 + r2() * 4, 16, 12), cm[i % 4], (r2() - 0.5) * 140, -6 + r2() * 4, -40 - r2() * 80, g, { cast: false }); m.scale.y = 0.5; }
    for (let i = 0; i < 7; i++) S.shafts.push({ set: 'heaven', m: shaft(g, -10 + i * 3.5, 9, -14 - (i % 3) * 3, 2.6, 26, 0.0, 0.25 * (i % 2 ? 1 : -1), '#fff0c0', 0.28) });
    S.heavenSun = [OFF.heaven[0] + 2, 16, -40];
  }

  // all set groups start hidden; update() shows one
  for (const k in G) G[k].visible = false;
};

// ---------- per-frame world state ----------
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const flick = (f, s) => 0.82 + 0.18 * Math.sin(f * 0.9 + s * 3.1) * Math.sin(f * 0.53 + s * 1.7) + 0.06 * Math.sin(f * 2.3 + s);
export const update = (ctx, W, f) => {
  const { G, SP } = S; const set = W.set || 'palace';
  for (const k in G) G[k].visible = (k === set) || (W.also && W.also.includes(k));
  for (const sh of S.shafts) sh.m.visible = sh.set === set;
  for (const k in SP) SP[k].reset();
  const o = OFF[set];
  // candle flames (only those of the visible set): flame + glow
  const near = (p, r) => Math.abs(p[0] - o[0]) < r;
  if (set === 'palace' || set === 'study' || set === 'house' || set === 'map') {
    for (const [x, y, z, s, sd] of S.flames) { if (!near([x], 60)) continue; const k = flick(f, sd);
      SP.flame.put(x, y + s * 0.3, z, s * 2.2 * k, 1, 0.08 * Math.sin(f * 0.4 + sd));
      SP.glow.put(x, y + s * 0.2, z, s * 9 * k, 0.32 * (W.glowK ?? 1), 0, [1, 0.72, 0.38]); }
  }
  if (set === 'palace') {
    const sway = W.sway ?? 1;
    S.chand.forEach((ch, i) => { ch.rotation.z = 0.025 * sway * Math.sin(f * 0.045 + i); ch.rotation.x = 0.018 * sway * Math.sin(f * 0.037 + i * 2); ch.updateMatrixWorld(true);
      for (const [R, y, n] of ch.userData.cand) for (let j = 0; j < n; j++) { const a = j / n * Math.PI * 2, v = new S.THREE.Vector3(Math.cos(a) * R, y, Math.sin(a) * R); ch.localToWorld(v); const k = flick(f, i * 20 + j);
        SP.flame.put(v.x, v.y, v.z, 0.13 * k, 1); SP.glow.put(v.x, v.y, v.z, 0.6 * k, 0.28, 0, [1, 0.75, 0.4]); }
      const c = new S.THREE.Vector3(0, -2.3, 0); ch.localToWorld(c); SP.glow.put(c.x, c.y, c.z, 6.5, 0.16, 0, [1, 0.7, 0.35]); });
    // golden dust motes
    for (let i = 0; i < 160; i++) { const t = (f * 0.0016 + hash(i)) % 1, x = (hash(i + 1) - 0.5) * 12, z = (hash(i + 2) - 0.5) * 18, y = 0.4 + t * 6 + Math.sin(f * 0.02 + i) * 0.1;
      SP.dust.put(x + Math.sin(f * 0.013 + i) * 0.3, y, z + 1, 0.05, 0.6 * Math.sin(t * Math.PI), 0, [1, 0.85, 0.55]); }
  }
  if (set === 'map') {
    const u = W.mapT ?? 0; // route progress (0..1): carriage on land, then ship at sea
    const pts = [[0.72, 1.2], [0.4, 0.62], [0.2, 0.44], [0.0, 0.08], [-0.2, -0.1]], sea = [[-0.12, -0.15], [-0.35, -0.45], [-0.55, -0.85], [-0.62, -1.2]];
    const along = (P2, t) => { t = Math.min(0.999, Math.max(0, t)); const n = P2.length - 1, x = t * n, i = Math.floor(x), k = x - i; return [P2[i][0] + (P2[i + 1][0] - P2[i][0]) * k, P2[i][1] + (P2[i + 1][1] - P2[i][1]) * k, Math.atan2(-(P2[i + 1][1] - P2[i][1]), P2[i + 1][0] - P2[i][0])]; };
    const a = along(pts, u / 0.55), b = along(sea, (u - 0.5) / 0.5);
    S.carriage.position.set(a[0], 0.81 + Math.abs(Math.sin(f * 0.8)) * 0.004, a[1]); S.carriage.rotation.y = a[2]; S.carriage.visible = u < 0.58;
    S.ship.position.set(b[0], 0.81 + Math.sin(f * 0.3) * 0.004, b[1]); S.ship.rotation.y = b[2]; S.ship.rotation.z = Math.sin(f * 0.25) * 0.08; S.ship.visible = u > 0.48;
    for (let i = 0; i < 40; i++) { const t = (f * 0.002 + hash(i)) % 1; SP.dust.put(o[0] + (hash(i + 3) - 0.5) * 2.4, 0.9 + t * 1.2, (hash(i + 5) - 0.5) * 3, 0.02, 0.6 * Math.sin(t * Math.PI), 0, [1, 0.85, 0.6]); }
  }
  if (set === 'europe') {
    S.clockHand.rotation.z = -f * 0.01;
    for (const [x, y, z, s] of S.euroClouds) SP.cloud.put(x + f * 0.02, y, z, s, 0.9, 0, [1, 0.97, 0.9]);
    for (let i = 0; i < 60; i++) { const t = (f * 0.002 + hash(i)) % 1; SP.dust.put(o[0] + (hash(i + 3) - 0.5) * 8, 0.4 + t * 4, -2 - hash(i + 5) * 14, 0.04, 0.5 * Math.sin(t * Math.PI), 0, [1, 0.9, 0.7]); }
  }
  if (set === 'study') {
    renderDecree(W.write ?? 0, W.sealed ?? 0);
    const sp = W.seal ?? [0.6, 0.4], sd = S.seal; sd.position.set(0.15 + 0.32 * (1 - sp[0]), 0.985 + sp[1], 0.38 - 0.3 * (1 - sp[0])); S.wax.visible = (W.sealed ?? 0) > 0;
    S.decree.position.y = 0.99 + (W.bounce ?? 0);
    S.inkQuill.visible = !(W.writing);
    if (W.idea) { const [x, y, z, k] = W.idea; SP.flame.put(x, y, z, 0.32 * k * flick(f, 3), 1); SP.glow.put(x, y, z, 2.6 * k, 0.6, 0, [1, 0.85, 0.45]); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + f * 0.05; SP.spark.put(x + Math.cos(a) * 0.45 * k, y + Math.sin(a) * 0.45 * k, z, 0.12 * k, 0.8, a); } }
    for (let i = 0; i < 60; i++) { const t = (f * 0.002 + hash(i)) % 1; SP.dust.put(o[0] + (hash(i + 3) - 0.5) * 5, 0.5 + t * 3.5, -2 + hash(i + 5) * 4, 0.035, 0.55 * Math.sin(t * Math.PI), 0, [1, 0.85, 0.6]); }
  }
  if (set === 'mint') {
    const ps = W.press ?? 0; S.screw.position.y = 1.15 + 0.35 * (1 - ps); S.screw.rotation.y = (1 - ps) * 3; S.blank.scale.y = ps > 0.95 ? 0.6 : 1;
    const sk = W.sack; if (sk) { S.bigSack.visible = true; S.bigSack.position.set(o[0] + sk[0], sk[1], sk[2]); S.bigSack.scale.set(1 + sk[3], 1 - sk[3], 1 + sk[3]); S.bigSack.position.x -= o[0]; } else S.bigSack.visible = false;
    for (const [key, obj] of [['coinA', S.coinA], ['coinB', S.coinB]]) { const c = W[key]; obj.visible = !!c; if (c) { obj.position.set(c[0] - o[0], c[1], c[2]); obj.rotation.set(c[3], c[4], c[5], 'YXZ'); obj.scale.setScalar(c[6]); } }
    const oc = W.coin1; if (oc) { S.oneCoin.visible = true; S.oneCoin.position.set(oc[0], oc[1], oc[2]); S.oneCoin.rotation.x = oc[3] || 0; } else S.oneCoin.visible = false;
    for (const [x, y, z] of [[-2.2, 3.6, -3.6], [2.2, 3.6, -3.6]]) SP.glow.put(o[0] + x, y, z, 1.6 * flick(f, x), 0.4, 0, [1, 0.8, 0.45]);
    for (let i = 0; i < 90; i++) { const t = (f * 0.0018 + hash(i)) % 1; SP.dust.put(o[0] + 1.4 + hash(i + 3) * 3.5, 0.3 + t * 4, -2.4 + hash(i + 5) * 3, 0.04, 0.7 * Math.sin(t * Math.PI), 0, [1, 0.88, 0.6]); }
  }
  if (set === 'snow') {
    const wind = W.wind ?? 0.6;
    for (let i = 0; i < 1300; i++) { const t = (f * (0.004 + hash(i + 9) * 0.003) + hash(i)) % 1, x = (hash(i + 1) - 0.5) * 22 + Math.sin(f * 0.03 + i) * 0.4 + wind * t * 3, z = 8 - hash(i + 2) * 34, y = 9 * (1 - t);
      SP.snow.put(o[0] + x, y, z, 0.035 + hash(i + 4) * 0.05, 0.95, 0, [0.95, 0.97, 1]); }
    for (const [x, y, z] of S.lamps) SP.glow.put(x, y, z, 1.6 * flick(f, x), 0.45, 0, [1, 0.8, 0.45]);
    for (const [x, y, z] of S.chim) for (let k = 0; k < 6; k++) { const t = ((f * 0.01 + k / 6) % 1); SP.smoke.put(x + t * 1.5 * wind, y + t * 3, z, 0.6 + t * 1.6, 0.4 * (1 - t), 0, [0.9, 0.92, 0.98]); }
    if (W.breath) for (const [x, y, z, ph] of W.breath) for (let k = 0; k < 3; k++) { const t = ((f + ph) % 40) / 40 + k * 0.08; if (t > 1) continue; SP.smoke.put(x + t * 0.25, y + t * 0.12, z + 0.1, 0.12 + t * 0.35, 0.45 * (1 - t), 0, [1, 1, 1]); }
  }
  if (set === 'house') {
    const [fx, fy, fz] = S.fire;
    for (let i = 0; i < 14; i++) { const t = ((f * 0.05 + hash(i)) % 1); SP.flame.put(fx + (hash(i + 1) - 0.5) * 0.5, fy + t * 0.45, fz, 0.3 * (1 - t * 0.6) * flick(f, i), 1 - t * 0.5, (hash(i) - 0.5) * 0.6); }
    SP.glow.put(fx, fy + 0.2, fz + 0.2, 3.2 * flick(f, 1), 0.55, 0, [1, 0.55, 0.2]);
    for (let i = 0; i < 12; i++) { const t = ((f * 0.012 + hash(i + 40)) % 1); SP.spark.put(fx + (hash(i) - 0.5) * 0.4 + Math.sin(f * 0.1 + i) * 0.05, fy + 0.3 + t * 1.4, fz + 0.1, 0.05, 1 - t, 0, [1, 0.6, 0.2]); }
    const [wx, wy, wz] = S.houseWin; for (let i = 0; i < 70; i++) { const t = (f * 0.006 + hash(i)) % 1; SP.snow.put(wx + (hash(i + 1) - 0.5) * 1.0, wy + 0.6 - t * 1.2, wz - 0.3 - hash(i + 2) * 0.5, 0.025, 0.9); }
    const lt = W.lid ?? 0; S.lid.rotation.x = -1.9 * (1 - lt); S.bundleIn.visible = (W.inChest ?? 0) > 0;
    for (let i = 0; i < 50; i++) { const t = (f * 0.002 + hash(i)) % 1; SP.dust.put(o[0] + (hash(i + 3) - 0.5) * 4, 0.4 + t * 2.6, -1.5 + hash(i + 5) * 3, 0.03, 0.5 * Math.sin(t * Math.PI), 0, [1, 0.8, 0.5]); }
  }
  if (set === 'heaven') {
    for (let i = 0; i < 90; i++) { const x = (hash(i) - 0.5) * 60 + Math.sin(f * 0.004 + i) * 1.5, z = -6 - hash(i + 1) * 60, y = -1.2 + hash(i + 2) * 2.5; SP.cloud.put(o[0] + x, y, z, 5 + hash(i + 3) * 7, 0.95, 0, i % 2 ? [1, 0.8, 0.88] : [1, 0.9, 0.7]); }
    for (let i = 0; i < 60; i++) { const t = (f * 0.003 + hash(i)) % 1; SP.spark.put(o[0] + (hash(i + 1) - 0.5) * 10, 0.3 + t * 5, -1 - hash(i + 2) * 8, 0.08 + hash(i) * 0.08, Math.sin(t * Math.PI), 0, [1, 0.9, 0.7]); }
    SP.glow.put(...S.heavenSun, 40, 0.8, 0, [1, 0.85, 0.6]);
  }
  // shot-specific particles from story.js
  if (W.hair) for (const h of W.hair) SP.hair.put(h[0], h[1], h[2], h[3], h[4] ?? 1, h[5] ?? 0, h[6]);
  if (W.sparks) for (const h of W.sparks) SP.spark.put(h[0], h[1], h[2], h[3], h[4] ?? 1, h[5] ?? 0, h[6]);
  if (W.foam) for (const h of W.foam) SP.foam.put(h[0], h[1], h[2], h[3], h[4] ?? 1, h[5] ?? 0);
  if (W.glows) for (const h of W.glows) SP.glow.put(h[0], h[1], h[2], h[3], h[4] ?? 1, 0, h[5]);
  if (W.flake) SP.flake.put(...W.flake);
  if (W.hearts) for (const h of W.hearts) SP.heart.put(h[0], h[1], h[2], h[3], h[4] ?? 1, h[5] ?? 0);
  if (W.puffs) for (const h of W.puffs) SP.smoke.put(h[0], h[1], h[2], h[3], h[4] ?? 1, 0, h[5]);
  for (const k in SP) SP[k].done();
};

// decree canvas: parchment, title "Bartsteuer" written progressively (w 0..1), body squiggles (no fake words), wax seal
let _dk = '';
function renderDecree(w, sealed) {
  const key = Math.round(w * 40) + '_' + (sealed > 0 ? 1 : 0); if (key === _dk) return; _dk = key;
  const c = S.decreeC.getContext('2d'), W = 512, H = 768;
  c.fillStyle = '#f4e6c4'; c.fillRect(0, 0, W, H); const r = (n) => { const x = Math.sin(n * 91.7) * 43758.5; return x - Math.floor(x); };
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(160,110,50,${0.03 + r(i) * 0.05})`; c.beginPath(); c.arc(r(i + 1) * W, r(i + 2) * H, 20 + r(i + 3) * 60, 0, 7); c.fill(); }
  c.strokeStyle = '#a8783a'; c.lineWidth = 8; c.strokeRect(18, 18, W - 36, H - 36); c.lineWidth = 2; c.strokeRect(32, 32, W - 64, H - 64);
  // crown ornament
  c.fillStyle = '#c89a2a'; c.beginPath(); c.moveTo(206, 120); c.lineTo(214, 76); c.lineTo(236, 104); c.lineTo(256, 66); c.lineTo(276, 104); c.lineTo(298, 76); c.lineTo(306, 120); c.closePath(); c.fill();
  // title, revealed left to right (handwriting effect)
  c.save(); c.beginPath(); c.rect(0, 0, 30 + w * (W - 30), H); c.clip();
  c.font = `bold italic 76px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2a1408'; c.fillText('Bartsteuer', W / 2, 200); c.restore();
  if (w > 0.98) { c.strokeStyle = '#2a1408'; c.lineWidth = 3; c.beginPath(); c.moveTo(90, 250); c.bezierCurveTo(200, 262, 320, 238, 422, 250); c.stroke(); }
  // body: wavy ink lines (no readable words)
  c.strokeStyle = 'rgba(42,20,8,0.75)'; c.lineWidth = 3.2; const lines = Math.floor(Math.max(0, (w - 0.6) / 0.4) * 9);
  for (let l = 0; l < 9; l++) { if (l >= lines && w < 1) break; const y = 300 + l * 40; c.beginPath(); c.moveTo(70, y); for (let x = 70; x < (l === 8 ? 300 : 442); x += 6) c.lineTo(x, y + Math.sin(x * 0.35 + l) * 4 + Math.sin(x * 0.11 + l * 3) * 3); c.stroke(); }
  if (sealed > 0) { c.fillStyle = '#b8141e'; c.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, rr = 62 + (i % 2) * 6; c.lineTo(256 + Math.cos(a) * rr, 650 + Math.sin(a) * rr); } c.fill();
    c.fillStyle = '#7a0a10'; c.beginPath(); c.moveTo(226, 670); c.lineTo(230, 630); c.lineTo(243, 648); c.lineTo(256, 622); c.lineTo(269, 648); c.lineTo(282, 630); c.lineTo(286, 670); c.closePath(); c.fill(); }
  S.decreeT.needsUpdate = true;
}

// coin face textures (shared by story.js through the scene; used as 3D coin meshes)
export const coinFaces = (THREE, canvasTex) => {
  const rim = (c, w) => { const gr = c.createRadialGradient(w * 0.4, w * 0.35, w * 0.05, w / 2, w / 2, w / 2); gr.addColorStop(0, '#fff2a8'); gr.addColorStop(0.6, '#f2c040'); gr.addColorStop(1, '#b8861a'); c.fillStyle = gr; c.beginPath(); c.arc(w / 2, w / 2, w / 2, 0, 7); c.fill();
    c.strokeStyle = '#8a5a0a'; c.lineWidth = w * 0.02; c.beginPath(); c.arc(w / 2, w / 2, w * 0.46, 0, 7); c.stroke(); c.beginPath(); c.arc(w / 2, w / 2, w * 0.36, 0, 7); c.stroke();
    c.fillStyle = '#a8761a'; for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; c.beginPath(); c.arc(w / 2 + Math.cos(a) * w * 0.48, w / 2 + Math.sin(a) * w * 0.48, w * 0.008, 0, 7); c.fill(); } };
  const crown = (c, x, y, s) => { c.fillStyle = '#9a6a10'; c.beginPath(); c.moveTo(x - 60 * s, y + 30 * s); c.lineTo(x - 66 * s, y - 30 * s); c.lineTo(x - 34 * s, y); c.lineTo(x, y - 46 * s); c.lineTo(x + 34 * s, y); c.lineTo(x + 66 * s, y - 30 * s); c.lineTo(x + 60 * s, y + 30 * s); c.closePath(); c.fill();
    c.fillStyle = '#fff2a8'; for (const dx of [-66, 0, 66]) { c.beginPath(); c.arc(x + dx * s, y - (dx ? 34 : 50) * s, 8 * s, 0, 7); c.fill(); } };
  const ornament = (c, w) => { c.strokeStyle = '#9a6a10'; c.lineWidth = w * 0.012; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.ellipse(w / 2 + Math.cos(a) * w * 0.41, w / 2 + Math.sin(a) * w * 0.41, w * 0.03, w * 0.012, a, 0, 7); c.stroke(); } };
  const front = canvasTex(1024, 1024, (c, w) => { rim(c, w);
    // "Bezahlt" across the top inside the ring + a bearded chin in the middle
    c.font = `bold ${w * 0.13}px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#6a3a00'; c.fillText('Bezahlt', w / 2, w * 0.3);
    c.save(); c.translate(w / 2, w * 0.6); const s = w / 1024; c.fillStyle = '#b8861a'; c.strokeStyle = '#6a3a00'; c.lineWidth = 10 * s;
    c.beginPath(); c.moveTo(-120 * s, -60 * s); c.lineTo(-130 * s, 20 * s); c.lineTo(-90 * s, 110 * s); c.lineTo(-40 * s, 170 * s); c.lineTo(0, 200 * s); c.lineTo(40 * s, 170 * s); c.lineTo(90 * s, 110 * s); c.lineTo(130 * s, 20 * s); c.lineTo(120 * s, -60 * s); c.lineTo(60 * s, -20 * s); c.lineTo(-60 * s, -20 * s); c.closePath(); c.fill(); c.stroke();
    for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 28 * s, 0); c.quadraticCurveTo(k * 30 * s, 90 * s, k * 14 * s, 170 * s); c.stroke(); }
    c.fillStyle = '#d8a428'; c.beginPath(); c.moveTo(0, -40 * s); c.bezierCurveTo(60 * s, -70 * s, 120 * s, -40 * s, 140 * s, -10 * s); c.bezierCurveTo(100 * s, -20 * s, 50 * s, -10 * s, 0, -16 * s); c.bezierCurveTo(-50 * s, -10 * s, -100 * s, -20 * s, -140 * s, -10 * s); c.bezierCurveTo(-120 * s, -40 * s, -60 * s, -70 * s, 0, -40 * s); c.fill(); c.stroke();
    c.restore(); });
  const back = canvasTex(1024, 1024, (c, w) => { rim(c, w); ornament(c, w); crown(c, w / 2, w / 2, 2.2); });
  const back2 = canvasTex(1024, 1024, (c, w) => { rim(c, w); crown(c, w / 2, w / 2, 1.5);
    c.font = `bold ${w * 0.095}px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5a2a00';
    const arc = (txt, rad, top) => { const chars = [...txt], ang = chars.map((ch) => c.measureText(ch).width / rad), tot = ang.reduce((a, b) => a + b, 0); let a = top ? -Math.PI / 2 - tot / 2 : Math.PI / 2 + tot / 2;
      for (let i = 0; i < chars.length; i++) { const da = ang[i]; a += top ? da / 2 : -da / 2; c.save(); c.translate(w / 2 + Math.cos(a) * rad, w / 2 + Math.sin(a) * rad); c.rotate(top ? a + Math.PI / 2 : a - Math.PI / 2); c.fillText(chars[i], 0, 0); c.restore(); a += top ? da / 2 : -da / 2; } };
    arc('Der Bart ist eine', w * 0.405, true); arc('überflüssige Last', w * 0.405, false); });
  return { front, back, back2 };
};
