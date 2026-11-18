// scene.js: five places for "Stell dir vor, du bist Arzt" (all scene text German).
// M1 clinic @ (0,0,0) · M2 hospital corridor @ x=100 · M3 maternity ward @ x=200 · M4 wash room @ x=300 · M5 river @ x=1000
let S = {};
export const LOC = { clinic: [0, 0, 0], hall: [100, 0, 0], ward: [200, 0, 0], wash: [300, 0, 0], river: [1000, 0, 0] };
export const build = (ctx) => {
  const { THREE, P, scene, add, tbox, toon, texM, canvasTex } = ctx;
  const R = P.rng(77);
  const G = {}; for (const k in LOC) { G[k] = new THREE.Group(); G[k].position.set(...LOC[k]); scene.add(G[k]); }
  S.G = G; S.bill = []; S.flames = []; S.lights = [];
  const nd = (m) => { m.userData.ndSkip = true; return m; };
  const basic = (o) => new THREE.MeshBasicMaterial(o);
  const glowTex = canvasTex(128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
  const softTex = canvasTex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,0.8)'); g.addColorStop(0.6, 'rgba(255,255,255,0.3)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const glow = (parent, x, y, z, size, col, k = 1) => { const m = nd(add(new THREE.PlaneGeometry(1, 1), basic({ map: glowTex, color: col, transparent: true, opacity: k, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), x, y, z, parent, { cast: false }));
    m.scale.setScalar(size); m.renderOrder = 8; m.userData.k = k; S.bill.push(m); return m; };
  const mist = (parent, x, y, z, w, h, col, op) => { const m = nd(add(new THREE.PlaneGeometry(1, 1), basic({ map: softTex, color: col, transparent: true, opacity: op, depthWrite: false }), x, y, z, parent, { cast: false })); m.scale.set(w, h, 1); m.renderOrder = 7; S.bill.push(m); m.userData.mist = true; return m; };
  const shaftTex = canvasTex(128, 512, (c) => { const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 512);
    const h = c.createLinearGradient(0, 0, 128, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.25, 'rgba(0,0,0,0)'); h.addColorStop(0.75, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)'); c.globalCompositeOperation = 'destination-out'; c.fillStyle = h; c.fillRect(0, 0, 128, 512); });
  const shaft = (parent, x, y, z, w, len, rotX, rotY, col, op) => { const geo = new THREE.PlaneGeometry(w, len); geo.translate(0, -len / 2, 0);
    const m = nd(add(geo, basic({ map: shaftTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), x, y, z, parent, { cast: false }));
    m.rotation.set(rotX, rotY, 0, 'YXZ'); m.renderOrder = 7; return m; };
  const sign = (parent, text, w, h, x, y, z, ry = 0, o = {}) => {
    const t = canvasTex(Math.min(2048, Math.round(512 * w / h / 2) * 2), 512, (c, W, H) => {
      c.fillStyle = o.bg || '#1c1814'; c.beginPath(); c.roundRect(6, 6, W - 12, H - 12, 40); c.fill();
      c.lineWidth = 18; c.strokeStyle = o.rim || '#c9a04a'; c.beginPath(); c.roundRect(30, 30, W - 60, H - 60, 28); c.stroke();
      let fs = 300; c.font = `bold ${fs}px "DejaVu Serif", Georgia, serif`; while (c.measureText(text).width > W - 140) { fs -= 8; c.font = `bold ${fs}px "DejaVu Serif", Georgia, serif`; }
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = o.fg || '#f0d48a'; c.fillText(text, W / 2, H / 2 + 12);
    });
    const bk = add(tbox(w + 0.04, h + 0.04, 0.04, 1), toon({ color: '#3a2a1e' }), x, y, z, parent); bk.rotation.y = ry;
    const m = nd(add(new THREE.PlaneGeometry(w, h), basic({ map: t }), x + Math.sin(ry) * 0.022, y, z + Math.cos(ry) * 0.022, parent, { cast: false })); m.rotation.y = ry; return m; };
  const flame = (parent, x, y, z, s = 1) => { const fl = add(new THREE.ConeGeometry(0.018 * s, 0.07 * s, 8), toon({ color: '#ffd27a', emissive: '#ffb040', emissiveIntensity: 2 }), x, y + 0.035 * s, z, parent, { cast: false });
    fl.userData.ndSkip = true; const gl = glow(parent, x, y + 0.04 * s, z, 0.35 * s, '#ffb35a', 0.8); S.flames.push({ fl, gl, ph: R() * 10 }); return fl; };
  const candle = (parent, x, y, z, h = 0.18, s = 1) => { add(new THREE.CylinderGeometry(0.022 * s, 0.025 * s, h, 10), toon({ color: '#f2e6c8' }), x, y + h / 2, z, parent);
    add(new THREE.CylinderGeometry(0.05 * s, 0.06 * s, 0.02, 12), toon({ color: '#b08a3a' }), x, y + 0.01, z, parent); flame(parent, x, y + h, z, s); };
  const plight = (parent, x, y, z, col, I, d = 7) => { const l = new THREE.PointLight(col, I, d, 1.6); l.position.set(x, y, z); parent.add(l); l.userData.I = I; S.lights.push(l); return l; };
  const glassM = (col, op = 0.42) => new THREE.MeshToonMaterial({ gradientMap: ctx.grad, color: col, transparent: true, opacity: op, depthWrite: false });
  const jar = (parent, x, y, z, r, h, liq, lidCol = '#8a6a44') => { const J = new THREE.Group(); J.position.set(x, y, z); parent.add(J);
    add(new THREE.CylinderGeometry(r * 0.88, r * 0.88, h * 0.72, 14), toon({ color: liq }), 0, h * 0.37, 0, J);
    const gl = add(new THREE.CylinderGeometry(r, r, h, 16), glassM('#d8eef0', 0.35), 0, h / 2, 0, J, { cast: false }); gl.renderOrder = 6;
    add(new THREE.CylinderGeometry(r * 1.04, r * 1.04, h * 0.1, 14), toon({ color: lidCol }), 0, h + h * 0.04, 0, J); return J; };
  const bottle = (parent, x, y, z, r, h, col) => { add(new THREE.CylinderGeometry(r, r * 1.05, h * 0.7, 10), toon({ color: col }), x, y + h * 0.35, z, parent);
    add(new THREE.CylinderGeometry(r * 0.35, r * 0.6, h * 0.3, 8), toon({ color: col }), x, y + h * 0.85, z, parent); add(new THREE.CylinderGeometry(r * 0.38, r * 0.38, h * 0.08, 8), toon({ color: '#c9a66a' }), x, y + h * 1.02, z, parent); };
  const book = (parent, x, y, z, w, h, d, col, ry = 0) => { const b = add(tbox(w, h, d, 1), toon({ color: col }), x, y + h / 2, z, parent); b.rotation.y = ry; return b; };
  const BOOKC = ['#7a2a2a', '#2a4a3a', '#4a3a6a', '#8a6a2a', '#3a2a22', '#6a4a2a', '#2a3a5a'];
  const instGrass = (parent, n, area, cols, h = [0.25, 0.6], seed = 5, w = 0.05) => { const r = P.rng(seed);
    const geo = new THREE.ConeGeometry(w, 1, 3); geo.translate(0, 0.5, 0);
    cols.forEach((col) => { const im = new THREE.InstancedMesh(geo, toon({ color: col }), Math.ceil(n / cols.length)); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
      for (let i = 0; i < im.count; i++) { const [x0, x1, z0, z1, yy] = area; const hh = h[0] + r() * (h[1] - h[0]); e.set((r() - 0.5) * 0.5, r() * 6, (r() - 0.5) * 0.5); q.setFromEuler(e);
        m4.compose(new THREE.Vector3(x0 + r() * (x1 - x0), yy || 0, z0 + r() * (z1 - z0)), q, new THREE.Vector3(1, hh, 1)); im.setMatrixAt(i, m4); }
      im.castShadow = false; im.receiveShadow = true; parent.add(im); }); };

  // ======================= M1 CLINIC =======================
  { const g = G.clinic;
    const plank = texM(P.planks(11), 3, 3, '#a87850');
    const wallp = texM(canvasTex(256, 256, (c) => { c.fillStyle = '#5a4a32'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#4e3f2a' : '#62523a'; c.fillRect(i * 32, 0, 16, 256); } c.fillStyle = 'rgba(200,170,110,0.18)'; for (let y = 16; y < 256; y += 64) for (let x = 8; x < 256; x += 32) { c.beginPath(); c.arc(x + 8, y, 5, 0, 7); c.fill(); } }).image, 6, 3);
    const woodD = toon({ color: '#4a2e1c' }), wood = texM(P.planks(3), 1, 1, '#8a5a34'), brass = toon({ color: '#c9a04a' }), leather = toon({ color: '#7a2a22' });
    const fl = add(new THREE.PlaneGeometry(9, 8), plank, 0, 0, -0.3, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const ceil = add(new THREE.PlaneGeometry(9, 8), toon({ color: '#2e2016' }), 0, 4.2, -0.3, g, { cast: false }); ceil.rotation.x = Math.PI / 2;
    for (let x = -4; x <= 4; x += 1.6) add(tbox(0.2, 0.25, 8, 1), woodD, x, 4.05, -0.3, g, { cast: false });
    const BW = (x0, x1, y0, y1) => add(tbox(x1 - x0, y1 - y0, 0.2, 2), wallp, (x0 + x1) / 2, (y0 + y1) / 2, -4.1, g, { cast: false });
    BW(-4.2, -1.8, 0, 4.2); BW(-0.2, 4.2, 0, 4.2); BW(-1.8, -0.2, 0, 1.3); BW(-1.8, -0.2, 3.2, 4.2);
    for (const sx of [-1, 1]) add(tbox(0.2, 4.2, 8, 2), wallp, sx * 4.25, 2.1, -0.3, g, { cast: false });
    add(tbox(8.4, 1.0, 0.06, 1), wood, 0, 0.5, -3.98, g, { cast: false }); add(tbox(8.4, 0.08, 0.1, 1), woodD, 0, 1.02, -3.96, g, { cast: false });
    for (const sx of [-1, 1]) add(tbox(0.06, 1.0, 7.6, 1), wood, sx * 4.12, 0.5, -0.3, g, { cast: false });
    // window: storm sky + rain + frame
    S.sky1 = basic({ map: canvasTex(256, 384, (c) => { const gr = c.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, '#1a2440'); gr.addColorStop(1, '#3a4a6a'); c.fillStyle = gr; c.fillRect(0, 0, 256, 384);
      c.fillStyle = 'rgba(20,24,40,0.8)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(30 + i * 30, 300 + (i % 3) * 20, 50, 30, 0, 0, 7); c.fill(); } c.fillStyle = '#121624'; for (let i = 0; i < 6; i++) c.fillRect(i * 46, 330 - (i % 3) * 30, 36, 80); }) });
    nd(add(new THREE.PlaneGeometry(2.4, 2.6), S.sky1, -1.0, 2.25, -4.6, g, { cast: false }));
    S.rainT = canvasTex(128, 256, (c) => { c.strokeStyle = 'rgba(200,220,255,0.55)'; c.lineWidth = 1.5; const r = P.rng(4); for (let i = 0; i < 70; i++) { const x = r() * 128, y = r() * 256; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y + 22); c.stroke(); } });
    S.rainT.wrapS = S.rainT.wrapT = THREE.RepeatWrapping; S.rainT.repeat.set(2, 2);
    nd(add(new THREE.PlaneGeometry(1.7, 2.0), basic({ map: S.rainT, transparent: true, depthWrite: false }), -1.0, 2.25, -4.3, g, { cast: false }));
    for (const [w, h, x, y] of [[1.8, 0.12, -1.0, 1.3], [1.8, 0.12, -1.0, 3.2], [0.12, 2.0, -1.84, 2.25], [0.12, 2.0, -0.16, 2.25], [0.07, 1.9, -1.0, 2.25], [1.6, 0.07, -1.0, 2.35]]) add(tbox(w, h, 0.14, 1), woodD, x, y, -4.0, g);
    add(tbox(1.9, 0.08, 0.3, 1), woodD, -1.0, 1.26, -3.88, g);
    S.winLight = plight(g, -1.0, 2.4, -3.2, '#9ab0ff', 0.0, 9);
    S.shaft1 = shaft(g, -1.0, 3.1, -3.9, 1.5, 4.0, -0.75, 0, '#8aa0d0', 0.12);
    // door with "Doktor" plaque
    add(tbox(1.3, 2.55, 0.1, 1), woodD, -3.1, 1.275, -3.99, g);
    add(tbox(1.1, 2.4, 0.08, 1), toon({ color: '#5a3622' }), -3.1, 1.2, -3.93, g);
    for (const y of [0.6, 1.8]) add(tbox(0.8, 0.8, 0.03, 1), toon({ color: '#4a2c1a' }), -3.1, y, -3.88, g);
    add(new THREE.SphereGeometry(0.045, 10, 8), brass, -2.68, 1.15, -3.86, g);
    sign(g, 'Doktor', 0.62, 0.2, -3.1, 1.32, -3.86, 0, { bg: '#1a1410', fg: '#f2d27a' });
    // shelves with jars, bottles, books
    for (const sx of [0.4, 2.15, 3.9]) add(tbox(0.08, 3.1, 0.4, 1), woodD, sx, 1.55, -3.8, g);
    for (const y of [0.95, 1.55, 2.15, 2.75, 3.1]) add(tbox(3.6, 0.05, 0.4, 1), wood, 2.15, y, -3.8, g);
    const LIQ = ['#b8642a', '#6a8a3a', '#9a3a2a', '#c8a040', '#4a6a8a', '#7a4a6a', '#a8b060'];
    for (const y of [0.975, 1.575, 2.175, 2.775]) { let x = 0.55; while (x < 3.75) { const k = R(); if (k < 0.45) { const r = 0.07 + R() * 0.05, h = 0.18 + R() * 0.18; jar(g, x + r, y, -3.75 + R() * 0.08, r, h, LIQ[(R() * LIQ.length) | 0]); x += r * 2 + 0.05; }
      else if (k < 0.7) { const r = 0.035 + R() * 0.02; bottle(g, x + r, y, -3.72, r, 0.2 + R() * 0.12, ['#3a5a3a', '#5a2a1a', '#2a3a5a', '#7a5a2a'][(R() * 4) | 0]); x += r * 2 + 0.04; }
      else { const n = 2 + ((R() * 4) | 0); for (let i = 0; i < n; i++) { const h = 0.22 + R() * 0.12; book(g, x + 0.035, y, -3.75, 0.06, h, 0.24, BOOKC[(R() * 7) | 0]); x += 0.065; } x += 0.04; } } }
    candle(g, 0.75, 2.2, -3.66, 0.12); candle(g, 3.5, 1.6, -3.66, 0.14);
    // left wall bookcase
    add(tbox(0.4, 2.8, 1.8, 1), woodD, -3.95, 1.4, -1.6, g);
    for (const y of [0.4, 1.0, 1.6, 2.2]) { add(tbox(0.36, 0.04, 1.7, 1), wood, -3.9, y, -1.6, g); let z = -2.4; while (z < -0.8) { const h = 0.3 + R() * 0.2; const b = add(tbox(0.26, h, 0.07, 1), toon({ color: BOOKC[(R() * 7) | 0] }), -3.85, y + h / 2 + 0.02, z, g); b.rotation.x = (R() - 0.5) * 0.1; z += 0.08; } }
    // skeleton model on a stand (cute, ivory)
    { const ivory = toon({ color: '#efe6cc' }), sk = new THREE.Group(); sk.position.set(3.25, 2.15, -3.0); g.add(sk); S.skel = sk;
      add(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 8), toon({ color: '#3a2a1e' }), 3.55, 1.1, -3.0, g); add(tbox(0.4, 0.04, 0.04, 1), toon({ color: '#3a2a1e' }), 3.4, 2.2, -3.0, g);
      add(new THREE.CylinderGeometry(0.25, 0.3, 0.05, 14), toon({ color: '#3a2a1e' }), 3.55, 0.025, -3.0, g);
      const skull = add(new THREE.SphereGeometry(0.14, 16, 12), ivory, 0, -0.18, 0, sk); skull.scale.set(1, 1.1, 0.95);
      for (const sx of [-0.05, 0.05]) add(new THREE.SphereGeometry(0.035, 8, 6), toon({ color: '#2a2018' }), sx, -0.17, 0.115, sk, { cast: false });
      add(tbox(0.13, 0.05, 0.05, 1), ivory, 0, -0.3, 0.08, sk);
      add(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8), ivory, 0, -0.66, 0, sk);
      for (let i = 0; i < 5; i++) { const rib = add(new THREE.TorusGeometry(0.14 - i * 0.012, 0.014, 6, 16, Math.PI * 1.6), ivory, 0, -0.45 - i * 0.065, 0, sk); rib.rotation.x = Math.PI / 2; rib.rotation.z = Math.PI * 0.7; }
      const pel = add(new THREE.TorusGeometry(0.11, 0.03, 6, 14), ivory, 0, -1.0, 0, sk); pel.rotation.x = Math.PI / 2 - 0.3;
      S.skArms = []; for (const sx of [-1, 1]) { const arm = new THREE.Group(); arm.position.set(sx * 0.17, -0.42, 0); sk.add(arm); add(new THREE.CylinderGeometry(0.018, 0.018, 0.55, 6), ivory, 0, -0.27, 0, arm); add(new THREE.SphereGeometry(0.04, 8, 6), ivory, 0, -0.56, 0, arm); arm.rotation.z = sx * 0.12; S.skArms.push(arm);
        const leg = new THREE.Group(); leg.position.set(sx * 0.08, -1.05, 0); sk.add(leg); add(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 6), ivory, 0, -0.42, 0, leg); add(tbox(0.06, 0.03, 0.12, 1), ivory, 0, -0.86, 0.03, leg); } }
    // patient chair (leather, buttons) facing camera
    { const C = new THREE.Group(); C.position.set(1.45, 0, -1.7); C.rotation.y = -0.3; g.add(C); S.chair = C;
      add(tbox(0.95, 0.22, 0.8, 1), leather, 0, 0.42, 0, C); add(tbox(0.95, 1.05, 0.2, 1), leather, 0, 1.0, -0.36, C);
      const top = add(new THREE.CylinderGeometry(0.475, 0.475, 0.2, 16, 1, false, 0, Math.PI), leather, 0, 1.52, -0.36, C); top.rotation.set(Math.PI / 2, 0, Math.PI / 2);
      for (const sx of [-1, 1]) { add(tbox(0.18, 0.28, 0.8, 1), leather, sx * 0.52, 0.66, 0, C); add(new THREE.CylinderGeometry(0.1, 0.1, 0.8, 10), leather, sx * 0.52, 0.82, 0, C).rotation.x = Math.PI / 2; }
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.CylinderGeometry(0.035, 0.025, 0.32, 8), woodD, sx * 0.42, 0.16, sz * 0.33, C);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) add(new THREE.SphereGeometry(0.022, 6, 5), brass, -0.3 + i * 0.3, 0.75 + j * 0.35, -0.25, C, { cast: false }); }
    // side table with tray + bottle
    add(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 18), wood, 2.45, 0.85, -1.3, g); add(new THREE.CylinderGeometry(0.04, 0.06, 0.85, 8), woodD, 2.45, 0.42, -1.3, g);
    add(new THREE.CylinderGeometry(0.22, 0.24, 0.02, 16), toon({ color: '#b8bcc8' }), 2.45, 0.88, -1.3, g);
    bottle(g, 2.6, 0.89, -1.4, 0.035, 0.22, '#3a5a3a');
    // desk with candlestick, books, mortar
    add(tbox(1.7, 0.08, 0.85, 1), wood, -2.3, 0.82, 0.0, g); for (const sx of [-0.75, 0.75]) for (const sz of [-0.35, 0.35]) add(tbox(0.08, 0.8, 0.08, 1), woodD, -2.3 + sx, 0.4, sz, g);
    for (let i = 0; i < 4; i++) book(g, -2.75, 0.86 + i * 0.07, -0.15, 0.36, 0.07, 0.26, BOOKC[i], 0.2 * i);
    add(new THREE.CylinderGeometry(0.1, 0.07, 0.12, 12), toon({ color: '#7a7a72' }), -2.0, 0.92, 0.1, g);
    for (const dx of [-0.08, 0, 0.08]) candle(g, -1.7 + dx, 0.86, -0.2, 0.16 + Math.abs(dx));
    // foreground table near the hook camera (blurred), curtain at the right
    add(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 18), woodD, -0.75, 1.05, 0.55, g); add(new THREE.CylinderGeometry(0.05, 0.08, 1.05, 8), woodD, -0.75, 0.52, 0.55, g);
    candle(g, -0.68, 1.07, 0.55, 0.22, 1.3); bottle(g, -0.9, 1.07, 0.48, 0.05, 0.3, '#5a2a1a'); bottle(g, -0.82, 1.07, 0.7, 0.04, 0.24, '#2a4a3a');
    const velvet = toon({ color: '#6a1a22' }); for (let i = 0; i < 7; i++) add(new THREE.CylinderGeometry(0.09, 0.11, 4.0, 8), velvet, 2.9 + i * 0.12, 2.1, 0.3 + (i % 2) * 0.06, g);
    // hanging oil lamp
    add(new THREE.CylinderGeometry(0.008, 0.008, 1.0, 4), toon({ color: '#222222' }), 0.3, 3.7, -1.2, g); add(new THREE.CylinderGeometry(0.12, 0.18, 0.22, 12), brass, 0.3, 3.1, -1.2, g);
    add(new THREE.SphereGeometry(0.1, 12, 8), toon({ color: '#ffe0a0', emissive: '#ffb050', emissiveIntensity: 1.5 }), 0.3, 2.95, -1.2, g); glow(g, 0.3, 2.95, -1.2, 1.4, '#ffb060', 0.7);
    plight(g, 0.3, 2.8, -1.2, '#ffb060', 2.2, 8); plight(g, -1.7, 1.2, -0.2, '#ff9a40', 1.6, 5); plight(g, -0.68, 1.4, 0.55, '#ffa848', 1.0, 3);
    S.dust1 = []; for (let i = 0; i < 26; i++) S.dust1.push(glow(g, -1.6 + R() * 2.2, 0.6 + R() * 2.4, -3.4 + R() * 2.2, 0.035 + R() * 0.03, '#c8d4ff', 0.55));
    // the hero leech jar (moves in the hook), label "Blutegel"
    { const J = new THREE.Group(); g.add(J); S.heroJar = J;
      const liq = add(new THREE.CylinderGeometry(0.135, 0.135, 0.24, 18), toon({ color: '#6a8a6a', transparent: true, opacity: 0.45, depthWrite: false }), 0, 0.12, 0, J, { cast: false }); liq.renderOrder = 3;
      const gl = add(new THREE.CylinderGeometry(0.15, 0.15, 0.34, 20), glassM('#e0f4f0', 0.22), 0, 0.17, 0, J, { cast: false }); gl.renderOrder = 9;
      add(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 18), toon({ color: '#7a5a34' }), 0, 0.36, 0, J); add(new THREE.CylinderGeometry(0.12, 0.13, 0.05, 14), toon({ color: '#9a7a4a' }), 0, 0.39, 0, J);
      const hl = nd(add(new THREE.PlaneGeometry(0.03, 0.26), basic({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false }), -0.08, 0.18, 0.152, J, { cast: false })); hl.renderOrder = 10;
      const lab = canvasTex(512, 200, (c, W, H) => { c.fillStyle = '#efe2bc'; c.fillRect(0, 0, W, H); c.strokeStyle = '#6a4a2a'; c.lineWidth = 10; c.strokeRect(14, 14, W - 28, H - 28);
        c.font = 'bold 104px "DejaVu Serif", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#3a1a10'; c.fillText('Blutegel', W / 2, H / 2 + 6); });
      const L = nd(add(new THREE.PlaneGeometry(0.22, 0.086), basic({ map: lab }), 0, 0.06, 0.153, J, { cast: false })); L.renderOrder = 11; }
    S.glowFlash = glow(g, -1.0, 2.25, -3.95, 4.0, '#c8d8ff', 0);
    { const Bo = new THREE.Group(); g.add(Bo); S.bowl = Bo; const met = toon({ color: '#c4c8d2' });
      const b = add(new THREE.CylinderGeometry(0.17, 0.12, 0.1, 20, 1, true), met, 0, 0.05, 0, Bo); b.material.side = THREE.DoubleSide; add(new THREE.CylinderGeometry(0.12, 0.12, 0.01, 18), met, 0, 0.005, 0, Bo);
      add(new THREE.TorusGeometry(0.17, 0.012, 6, 24), toon({ color: '#e8ecf4' }), 0, 0.1, 0, Bo).rotation.x = Math.PI / 2; }
    { const St = new THREE.Group(); St.position.set(2.15, 0, -1.45); g.add(St); add(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 14), wood, 0, 0.55, 0, St); for (let i = 0; i < 3; i++) { const l = add(new THREE.CylinderGeometry(0.02, 0.02, 0.56, 6), woodD, 0.13 * Math.cos(i * 2.1), 0.27, 0.13 * Math.sin(i * 2.1), St); l.rotation.z = 0.15 * Math.cos(i * 2.1); } }
  }

  // ======================= M2 CORRIDOR =======================
  { const g = G.hall;
    const stoneF = texM(P.stone(31, 30, 6, 58, 96, 96), 12, 2.5, '#d8dce4'), wallS = texM(P.plaster(41, 210), 1, 1, '#c8d0dc'), lowS = texM(P.stone(32, 210, 6, 54, 80, 48), 12, 1, '#b0b8c8'), woodD = toon({ color: '#4a3424' }), iron = toon({ color: '#2a2a30' });
    const fl = add(new THREE.PlaneGeometry(24, 5), stoneF, 5, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const NW = (x0, x1, y0, y1) => add(tbox(x1 - x0, y1 - y0, 0.3, 2), wallS, (x0 + x1) / 2 - 100, (y0 + y1) / 2, -2.65, g, { cast: false });
    const wins = [96.5, 103, 106.5, 113];
    NW(93, 99.4, 0, 3.3); NW(100.6, 117, 0, 3.3); NW(99.4, 100.6, 2.45, 3.3);
    let xs = 93; for (const w of wins) { NW(xs, w - 0.6, 3.3, 5.6); xs = w + 0.6; } NW(xs, 117, 3.3, 5.6); for (const w of wins) NW(w - 0.6, w + 0.6, 5.0, 5.6);
    for (const w of wins) { nd(add(new THREE.PlaneGeometry(1.2, 1.7), basic({ color: '#e8f0ff' }), w - 100, 4.15, -2.85, g, { cast: false })); add(tbox(0.06, 1.7, 0.1, 1), iron, w - 100, 4.15, -2.55, g); add(tbox(1.2, 0.06, 0.1, 1), iron, w - 100, 4.15, -2.55, g);
      shaft(g, w - 100, 4.6, -2.4, 1.3, 6.0, -0.62, 0.0, '#c8d8ff', 0.16); }
    const SW = (x0, x1, y0, y1) => add(tbox(x1 - x0, y1 - y0, 0.3, 2), wallS, (x0 + x1) / 2 - 100, (y0 + y1) / 2, 2.65, g, { cast: false }); SW(93, 108.65, 0, 5.6); SW(110.35, 117, 0, 5.6); SW(108.65, 110.35, 2.7, 5.6);
    for (const sx of [-1, 1]) add(tbox(0.3, 5.6, 5.6, 2), wallS, 5 + sx * 11.5, 2.8, 0, g, { cast: false });
    add(tbox(24, 1.1, 0.06, 1), lowS, 5, 0.55, -2.48, g, { cast: false }); add(tbox(24, 1.1, 0.06, 1), lowS, 5, 0.55, 2.48, g, { cast: false });
    const ce = add(new THREE.PlaneGeometry(24, 5.6), toon({ color: '#8a92a4' }), 5, 5.6, 0, g, { cast: false }); ce.rotation.x = Math.PI / 2;
    for (let x = -6; x <= 16; x += 3) { const a = add(new THREE.TorusGeometry(2.5, 0.12, 6, 20, Math.PI), toon({ color: '#9aa2b4' }), x, 3.1, 0, g, { cast: false }); a.rotation.y = Math.PI / 2; }
    // Leichenhalle door (closed, pivot at the hinge)
    for (const sx of [-1, 1]) add(tbox(0.16, 2.7, 0.22, 1), toon({ color: '#6a7080' }), sx * 0.68, 1.35, -2.42, g); add(tbox(1.52, 0.22, 0.22, 1), toon({ color: '#6a7080' }), 0, 2.56, -2.42, g);
    nd(add(new THREE.PlaneGeometry(1.2, 2.45), basic({ color: '#0e1412' }), 0, 1.225, -2.75, g, { cast: false }));
    const dp = new THREE.Group(); dp.position.set(-0.58, 0, -2.3); g.add(dp); S.morgueDoor = dp;
    add(tbox(1.16, 2.42, 0.08, 1), toon({ color: '#3e4a44' }), 0.58, 1.21, 0, dp);
    for (const y of [0.35, 1.2, 2.05]) add(tbox(1.16, 0.06, 0.1, 1), iron, 0.58, y, 0.02, dp);
    for (let i = 0; i < 4; i++) for (const y of [0.35, 2.05]) add(new THREE.SphereGeometry(0.02, 6, 4), iron, 0.15 + i * 0.28, y, 0.07, dp);
    add(tbox(0.04, 0.2, 0.06, 1), iron, 1.02, 1.05, 0.07, dp);
    sign(dp, 'Leichenhalle', 0.86, 0.2, 0.58, 1.55, 0.075, 0, { bg: '#20262a', fg: '#e8ecf0', rim: '#8a929a' });
    // Geburtsstation double door on the south wall, sign, warm light behind
    for (const sx of [-1, 1]) add(tbox(0.16, 2.8, 0.22, 1), toon({ color: '#c8b48a' }), 9.5 + sx * 0.9, 1.4, 2.42, g); add(tbox(1.96, 0.2, 0.22, 1), toon({ color: '#c8b48a' }), 9.5, 2.72, 2.42, g);
    nd(add(new THREE.PlaneGeometry(1.8, 2.8), basic({ color: '#fff2d8' }), 9.5, 1.35, 2.78, g, { cast: false }));
    S.wardDoors = []; for (const sx of [-1, 1]) { const d = new THREE.Group(); d.position.set(9.5 + sx * 0.84, 0, 2.34); g.add(d); add(tbox(0.82, 2.55, 0.07, 1), toon({ color: '#e8e0cc' }), -sx * 0.41, 1.275, 0, d);
      add(tbox(0.6, 0.9, 0.08, 1), toon({ color: '#d0c4a8' }), -sx * 0.41, 1.85, -0.01, d); add(new THREE.SphereGeometry(0.03, 8, 6), toon({ color: '#c9a04a' }), -sx * 0.74, 1.1, -0.05, d); S.wardDoors.push({ d, sx }); }
    S.wardGlow = glow(g, 9.5, 1.3, 2.5, 3.5, '#ffe0b0', 0);
    sign(g, 'Geburtsstation', 1.3, 0.26, 9.5, 2.95, 2.28, Math.PI, { bg: '#f4ead2', fg: '#2a3a5a', rim: '#4a6a8a' });
    // wash basin (lavabo) beside the door
    { const B = new THREE.Group(); B.position.set(7.8, 0, 2.2); g.add(B); const por = toon({ color: '#f4f6f8' });
      add(new THREE.CylinderGeometry(0.08, 0.12, 0.85, 10), por, 0, 0.42, 0, B); const bs = add(new THREE.SphereGeometry(0.3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), por, 0, 0.98, 0, B); bs.rotation.x = Math.PI; bs.scale.y = 0.5;
      add(new THREE.TorusGeometry(0.3, 0.03, 6, 20), por, 0, 0.98, 0, B).rotation.x = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.26, 0.26, 0.01, 16), toon({ color: '#9ad0e8' }), 0, 0.93, 0, B);
      add(new THREE.CylinderGeometry(0.07, 0.09, 0.25, 10), toon({ color: '#d8e4ec' }), 0.16, 1.1, 0.06, B);
      add(tbox(0.5, 0.6, 0.03, 1), toon({ color: '#b0c4d4' }), 0, 1.7, 0.2, B); add(tbox(0.56, 0.66, 0.02, 1), woodD, 0, 1.7, 0.215, B);
      add(tbox(0.26, 0.45, 0.04, 1), toon({ color: '#f0ece0' }), 0.45, 1.25, 0.18, B); add(new THREE.SphereGeometry(0.025, 6, 4), iron, 0.45, 1.5, 0.18, B);
      add(tbox(0.1, 0.04, 0.06, 1), toon({ color: '#e8dca0' }), -0.2, 1.02, 0.1, B); S.basinGlow = glow(B, 0, 1.05, 0, 0.9, '#bfe8ff', 0.35); }
    // benches, sconces, trolley, plants
    for (const x of [2.5, 4.4]) { add(tbox(1.6, 0.06, 0.45, 1), woodD, x, 0.48, 2.15, g); for (const sx of [-0.7, 0.7]) add(tbox(0.06, 0.48, 0.4, 1), woodD, x + sx, 0.24, 2.15, g); }
    for (const x of [-2.2, 5.6, 12.5]) { add(tbox(0.1, 0.35, 0.12, 1), iron, x, 2.5, 2.42, g); add(new THREE.SphereGeometry(0.11, 10, 8), toon({ color: '#fff0c8', emissive: '#ffcc70', emissiveIntensity: 1.3 }), x, 2.75, 2.3, g); glow(g, x, 2.75, 2.25, 1.1, '#ffc070', 0.55); plight(g, x, 2.6, 1.9, '#ffc070', 0.8, 4); }
    { const T = new THREE.Group(); T.position.set(4.6, 0, -1.9); g.add(T); add(tbox(1.8, 0.08, 0.6, 1), toon({ color: '#8a8e96' }), 0, 0.75, 0, T); add(tbox(1.7, 0.1, 0.55, 1), toon({ color: '#e8e8ec' }), 0, 0.84, 0, T);
      for (const sx of [-0.8, 0.8]) for (const sz of [-0.25, 0.25]) { add(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6), iron, sx, 0.38, sz, T); add(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10), iron, sx, 0.06, sz, T).rotation.x = Math.PI / 2; } }
    for (const x of [-4.5, 13.8]) { add(new THREE.CylinderGeometry(0.22, 0.17, 0.45, 12), toon({ color: '#a85a3a' }), x, 0.22, 2.1, g); for (let k = 0; k < 6; k++) { const l = add(new THREE.SphereGeometry(0.22, 8, 6), toon({ color: k % 2 ? '#4a7a4a' : '#5a8a50' }), x + Math.cos(k) * 0.15, 0.7 + k * 0.08, 2.1 + Math.sin(k) * 0.12, g); l.scale.y = 1.4; } }
    { const C = new THREE.Group(); g.add(C); S.fgHall = C; add(tbox(0.7, 0.05, 0.45, 1), toon({ color: '#9a9ea8' }), 0, 0.95, 0, C); add(tbox(0.7, 0.05, 0.45, 1), toon({ color: '#9a9ea8' }), 0, 0.45, 0, C);
      for (const sx of [-0.33, 0.33]) for (const sz of [-0.2, 0.2]) add(new THREE.CylinderGeometry(0.015, 0.015, 1.0, 6), iron, sx, 0.5, sz, C);
      for (let i = 0; i < 5; i++) bottle(C, -0.25 + i * 0.12, 0.98, (i % 2) * 0.1 - 0.05, 0.03, 0.18 + (i % 3) * 0.04, ['#3a5a7a', '#5a3a2a', '#e8e8f0', '#4a6a4a', '#7a6a3a'][i]);
      add(tbox(0.4, 0.06, 0.3, 1), toon({ color: '#f0ece0' }), 0, 0.5, 0, C); }
    S.morgueMist = []; for (let i = 0; i < 5; i++) S.morgueMist.push(mist(g, -0.3 + i * 0.18, 0.15, -2.2 + i * 0.05, 0.9, 0.35, '#b8d0c8', 0.0));
    S.dust2 = []; for (let i = 0; i < 30; i++) S.dust2.push(glow(g, -3 + R() * 16, 0.5 + R() * 3.5, -2.2 + R() * 3.6, 0.03 + R() * 0.03, '#e0e8ff', 0.6));
  }

  // ======================= M3 WARD =======================
  { const g = G.ward;
    const fl = add(new THREE.PlaneGeometry(9, 17), texM(P.planks(21), 4, 8, '#c8b89a'), 0, 0, -4.5, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const wallW = texM(P.plaster(51, 205), 2, 2, '#c4ccd8');
    for (const sx of [-1, 1]) add(tbox(0.3, 5.2, 17, 2), wallW, sx * 4.3, 2.6, -4.5, g, { cast: false });
    add(tbox(9, 5.2, 0.3, 2), wallW, 0, 2.6, -12.8, g, { cast: false }); add(tbox(9, 5.2, 0.3, 2), wallW, 0, 2.6, 3.8, g, { cast: false });
    const ce = add(new THREE.PlaneGeometry(9, 17), toon({ color: '#9aa4b4' }), 0, 5.2, -4.5, g, { cast: false }); ce.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) add(tbox(0.06, 1.0, 16.6, 1), toon({ color: '#8a96a8' }), sx * 4.12, 0.5, -4.5, g, { cast: false });
    S.wardShafts = [];
    for (const z of [-0.3, -2.9, -5.5, -8.1, -10.7]) for (const sx of [-1, 1]) {
      nd(add(new THREE.PlaneGeometry(1.0, 1.6), basic({ color: '#f4f6ff' }), sx * 4.13, 3.8, z, g, { cast: false })).rotation.y = -sx * Math.PI / 2;
      add(tbox(0.08, 1.7, 0.08, 1), toon({ color: '#6a7488' }), sx * 4.1, 3.8, z, g); add(tbox(0.08, 0.08, 1.1, 1), toon({ color: '#6a7488' }), sx * 4.1, 3.8, z, g);
      if (sx < 0) S.wardShafts.push(shaft(g, sx * 4.0, 4.4, z, 1.0, 6.5, -0.9, -sx * Math.PI / 2, '#ffe6b0', 0.13)); }
    S.beds = [];
    const iron = toon({ color: '#3a4250' }), sheet = toon({ color: '#f6f6f2' }), blanketCols = ['#9ab4d4', '#d4b4c4', '#b4ccb0', '#d8ccaa'];
    let bi = 0; for (const z of [1.2, -1.6, -4.4, -7.2, -10.0]) for (const sx of [-1, 1]) {
      const B = new THREE.Group(); B.position.set(sx * 2.7, 0, z); g.add(B); const hx = sx * 1.1;
      add(tbox(2.1, 0.22, 1.0, 1), sheet, 0, 0.52, 0, B); add(tbox(0.4, 0.14, 0.75, 1), toon({ color: '#ffffff' }), hx * 0.8, 0.7, 0, B);
      for (const ex of [-1.05, 1.05]) { const head = ex * sx > 0, hh = head ? 1.1 : 0.85; for (const ez of [-0.48, 0.48]) add(new THREE.CylinderGeometry(0.025, 0.025, hh, 6), iron, ex, hh / 2, ez, B);
        add(new THREE.CylinderGeometry(0.02, 0.02, 0.96, 6), iron, ex, hh, 0, B).rotation.x = Math.PI / 2; }
      add(tbox(1.35, 0.16, 1.04, 1), toon({ color: blanketCols[bi % 4] }), -hx * 0.35, 0.68, 0, B); S.beds.push({ x: sx * 2.7, z, sx }); bi++;
      if (z > -9) add(tbox(0.04, 0.9, 1.0, 1), toon({ color: '#eef0ee' }), sx * 1.35, 1.6, 0, B, { cast: false });
    }
    for (const z of [-0.2, -5.8]) { add(tbox(0.5, 0.75, 0.5, 1), toon({ color: '#8a6a4a' }), sx0(z), 0.37, z, g); add(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 10), toon({ color: '#e8e8f0' }), sx0(z), 0.85, z, g); add(new THREE.SphereGeometry(0.08, 8, 6), toon({ color: '#e05a6a' }), sx0(z), 1.0, z, g); }
    S.cradles = []; for (const z of [-3.0, -8.6]) { const C = add(new THREE.SphereGeometry(0.35, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon({ color: '#d8b888' }), 1.0, 0.55, z, g); C.rotation.x = Math.PI; C.scale.set(1.3, 0.7, 0.8); S.cradles.push(C); }
    S.dust3 = []; for (let i = 0; i < 26; i++) S.dust3.push(glow(g, -3 + R() * 6, 0.6 + R() * 3.2, -9 + R() * 10, 0.035 + R() * 0.03, '#ffe8c0', 0.6));
    plight(g, 0, 3.5, -2, '#ffe0b0', 1.0, 10); plight(g, 0, 3.5, -8, '#c8d8ff', 0.8, 10);
  }

  // ======================= M4 WASH ROOM =======================
  { const g = G.wash;
    const tile = texM(canvasTex(256, 256, (c) => { c.fillStyle = '#c8d4dc'; c.fillRect(0, 0, 256, 256); const r = P.rng(9); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = `hsl(200,${16 + r() * 8}%,${92 + r() * 5}%)`; c.fillRect(x * 64 + 3, y * 64 + 3, 58, 58); } }).image, 10, 2);
    const wall = texM(P.plaster(61, 200), 2, 2, '#d8e6f0'), woodB = toon({ color: '#6a4a30' });
    const fl = add(new THREE.PlaneGeometry(10, 8), texM(P.stone(62, 200, 8, 70, 128, 128), 4, 3, '#e8eef4'), 0.5, 0, -0.5, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(10, 4.6, 0.3, 2), wall, 0.5, 2.3, -4.15, g, { cast: false }); add(tbox(10, 1.4, 0.04, 1), tile, 0.5, 0.7, -3.98, g, { cast: false });
    for (const sx of [-1, 1]) add(tbox(0.3, 4.6, 8, 2), wall, 0.5 + sx * 5, 2.3, -0.5, g, { cast: false });
    add(tbox(0.04, 1.4, 7.6, 1), tile, -4.32, 0.7, -0.5, g, { cast: false }); add(tbox(0.04, 1.4, 7.6, 1), tile, 5.32, 0.7, -0.5, g, { cast: false });
    const ce = add(new THREE.PlaneGeometry(10, 8), toon({ color: '#c8d4e0' }), 0.5, 4.6, -0.5, g, { cast: false }); ce.rotation.x = Math.PI / 2;
    nd(add(new THREE.PlaneGeometry(1.8, 2.2), basic({ color: '#ffffff' }), -4.33, 2.6, -1.8, g, { cast: false })).rotation.y = Math.PI / 2;
    add(tbox(0.1, 2.3, 0.08, 1), woodB, -4.3, 2.6, -1.8, g); add(tbox(0.1, 0.08, 1.9, 1), woodB, -4.3, 2.6, -1.8, g);
    S.washShaft = [shaft(g, -4.2, 3.6, -1.8, 1.8, 7, -0.7, -Math.PI / 2 + 0.25, '#e0f0ff', 0.2), shaft(g, -4.2, 3.4, -1.2, 1.0, 6.5, -0.75, -Math.PI / 2 + 0.4, '#ffffff', 0.12)];
    // chalkboard: frame + board (graph canvas) + text plane that can fade
    const BX = 1.15, BY = 1.2, BZ = -3.95;
    add(tbox(2.3, 1.55, 0.06, 1), woodB, BX, BY, BZ, g); add(tbox(2.3, 0.06, 0.16, 1), woodB, BX, BY - 0.8, BZ + 0.06, g);
    S.graphC = document.createElement('canvas'); S.graphC.width = 1024; S.graphC.height = 640; S.graphT = new THREE.CanvasTexture(S.graphC); S.graphT.colorSpace = THREE.SRGBColorSpace;
    nd(add(new THREE.PlaneGeometry(2.14, 1.34), basic({ map: S.graphT }), BX, BY, BZ + 0.035, g, { cast: false }));
    const ht = canvasTex(1024, 200, (c, W, H) => { let fs = 132; c.font = `bold ${fs}px "DejaVu Serif", Georgia, serif`; while (c.measureText('Hände waschen!').width > W - 90) { fs -= 4; c.font = `bold ${fs}px "DejaVu Serif", Georgia, serif`; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(250,250,240,0.95)'; c.fillText('Hände waschen!', W / 2, H / 2 + 6);
      c.strokeStyle = 'rgba(250,250,240,0.85)'; c.lineWidth = 8; c.beginPath(); c.moveTo(150, H - 22); c.lineTo(W - 150, H - 26); c.stroke(); });
    S.handText = nd(add(new THREE.PlaneGeometry(1.9, 0.37), basic({ map: ht, transparent: true, depthWrite: false }), BX, BY + 0.43, BZ + 0.04, g, { cast: false })); S.handText.renderOrder = 4;
    S.drawGraph = (k) => { const c = S.graphC.getContext('2d'), W = 1024, H = 640; c.fillStyle = '#2a3a32'; c.fillRect(0, 0, W, H);
      const r = P.rng(3); for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.04})`; c.beginPath(); c.ellipse(r() * W, r() * H, 30 + r() * 80, 8 + r() * 20, r() * 3, 0, 7); c.fill(); }
      c.strokeStyle = 'rgba(245,245,235,0.9)'; c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(150, 290); c.lineTo(150, 590); c.lineTo(920, 590); c.stroke();
      const pts = [[170, 330], [330, 318], [450, 336], [520, 326]], end = [[600, 420], [680, 500], [780, 545], [880, 560]];
      const n = k * end.length, all = [...pts];
      for (let i = 0; i < end.length; i++) { if (i + 1 <= n) all.push(end[i]); else { const a = all[all.length - 1], b = end[i], t = n - i; if (t > 0) all.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); break; } }
      c.strokeStyle = 'rgba(255,240,180,0.95)'; c.lineWidth = 13; c.beginPath(); all.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
      const [x1, y1] = all[all.length - 1], [x0, y0] = all[all.length - 2]; const a = Math.atan2(y1 - y0, x1 - x0);
      c.beginPath(); c.moveTo(x1 + 34 * Math.cos(a), y1 + 34 * Math.sin(a)); c.lineTo(x1 + 36 * Math.cos(a + 2.3), y1 + 36 * Math.sin(a + 2.3)); c.lineTo(x1 + 36 * Math.cos(a - 2.3), y1 + 36 * Math.sin(a - 2.3)); c.closePath(); c.fillStyle = 'rgba(255,240,180,0.95)'; c.fill();
      S.graphT.needsUpdate = true; };
    S.drawGraph(0); S.graphK = 0;
    // big stone sink with tap + stream; washbowl on a stand
    add(tbox(1.7, 0.36, 0.62, 1), toon({ color: '#d8dce0' }), -2.3, 0.92, -3.6, g); add(tbox(1.5, 0.05, 0.5, 1), toon({ color: '#8ac4dc' }), -2.3, 1.08, -3.6, g);
    for (const sx of [-0.7, 0.7]) add(tbox(0.12, 0.75, 0.5, 1), toon({ color: '#c8ccd0' }), -2.3 + sx, 0.37, -3.6, g);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), toon({ color: '#c9a04a' }), -2.3, 1.45, -3.85, g); add(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), toon({ color: '#c9a04a' }), -2.3, 1.68, -3.72, g).rotation.x = Math.PI / 2;
    S.stream = add(new THREE.CylinderGeometry(0.02, 0.025, 0.5, 8), toon({ color: '#c0e8ff', transparent: true, opacity: 0.7 }), -2.3, 1.36, -3.58, g, { cast: false }); S.stream.userData.ndSkip = true;
    add(new THREE.CylinderGeometry(0.06, 0.12, 0.85, 10), woodB, -0.6, 0.42, -2.9, g); const bw = add(new THREE.SphereGeometry(0.42, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon({ color: '#e8eef4' }), -0.6, 1.02, -2.9, g); bw.rotation.x = Math.PI; bw.scale.y = 0.4;
    add(new THREE.TorusGeometry(0.42, 0.03, 6, 24), toon({ color: '#c8d4e0' }), -0.6, 1.02, -2.9, g).rotation.x = Math.PI / 2;
    S.water4 = add(new THREE.CylinderGeometry(0.39, 0.39, 0.01, 24), toon({ color: '#a8e4ff', emissive: '#6ac8ff', emissiveIntensity: 0.5 }), -0.6, 0.99, -2.9, g, { cast: false });
    glow(g, -0.6, 1.05, -2.9, 1.2, '#a0e0ff', 0.45);
    for (let i = 0; i < 3; i++) add(tbox(0.12, 0.05, 0.07, 1), toon({ color: ['#f4e8b0', '#e8f4d0', '#f0d8e8'][i] }), -1.7 + i * 0.18, 1.12, -3.4, g);
    add(tbox(1.6, 0.05, 0.35, 1), woodB, 3.6, 1.9, -3.8, g); add(tbox(1.6, 0.05, 0.35, 1), woodB, 3.6, 2.5, -3.8, g);
    for (let i = 0; i < 4; i++) add(tbox(0.3, 0.14, 0.3, 1), toon({ color: '#ffffff' }), 3.0 + i * 0.38, 1.99, -3.8, g);
    for (let i = 0; i < 5; i++) jar(g, 3.0 + i * 0.3, 2.53, -3.78, 0.08, 0.22, '#d8f0ff', '#c8c8d0');
    add(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 6), toon({ color: '#c9a04a' }), -2.6, 1.6, 1.2, g).rotation.z = Math.PI / 2;
    for (let i = 0; i < 3; i++) add(tbox(0.4, 0.9, 0.03, 1), toon({ color: ['#ffffff', '#e0ecf8', '#f4f0e8'][i] }), -3.1 + i * 0.5, 1.15, 1.2, g);
    add(new THREE.CylinderGeometry(0.22, 0.18, 0.4, 14), toon({ color: '#8a8e96' }), 3.4, 0.2, 0.9, g);
    S.bubbles = []; for (let i = 0; i < 18; i++) S.bubbles.push({ m: glow(g, -0.6, 1.1, -2.9, 0.06, '#ffffff', 0.9), ph: R() * 10, r: R() });
    plight(g, -2.5, 3, -1.5, '#e8f4ff', 1.5, 9); plight(g, 2, 3, -1, '#ffffff', 0.8, 9);
  }

  // ======================= M5 RIVER =======================
  { const g = G.river;
    const grassM = texM(P.grass(71), 20, 6, '#a8b890'), mud = texM(P.dirt(72), 10, 1, '#8a8470'), quay = texM(P.stone(73, 90, 8, 52, 90, 45), 40, 1, '#9aa092');
    const bank = add(new THREE.PlaneGeometry(200, 40), grassM, 0, 0, 20, g, { cast: false }); bank.rotation.x = -Math.PI / 2;
    const path = add(new THREE.PlaneGeometry(200, 3), mud, 0, 0.01, 1.6, g, { cast: false }); path.rotation.x = -Math.PI / 2;
    add(tbox(200, 1.4, 0.6, 2), quay, 0, -0.7, -0.3, g); add(tbox(200, 0.15, 0.7, 1), toon({ color: '#b8bcae' }), 0, 0.05, -0.3, g);
    const water = add(new THREE.PlaneGeometry(400, 160), ctx.waterMat, 0, -0.55, -80, g, { cast: false }); water.rotation.x = -Math.PI / 2; water.userData.nd = ctx.waterNd;
    const far = add(new THREE.PlaneGeometry(400, 60), toon({ color: '#6a7a62' }), 0, -0.3, -110, g, { cast: false }); far.rotation.x = -Math.PI / 2;
    const cityM = [toon({ color: '#7a8478' }), toon({ color: '#6a7470' }), toon({ color: '#8a8a7a' })];
    for (let i = 0; i < 40; i++) { const x = -90 + i * 4.6 + R() * 2, h = 6 + R() * 10, w = 3 + R() * 3, z = -92 - R() * 6; add(tbox(w, h, 4, 2), cityM[i % 3], x, h / 2, z, g, { cast: false }); const rf = add(new THREE.ConeGeometry(w * 0.75, 2.5, 4), toon({ color: '#4a5450' }), x, h + 1.2, z, g, { cast: false }); rf.rotation.y = Math.PI / 4; }
    for (const x of [-30, 25]) { add(tbox(5, 22, 5, 2), cityM[0], x, 11, -96, g, { cast: false }); add(new THREE.ConeGeometry(3.4, 12, 8), toon({ color: '#3e5a50' }), x, 28, -96, g, { cast: false }); }
    { const st = toon({ color: '#9a9a8a' }), stD = toon({ color: '#6e6e62' }); add(tbox(120, 2.2, 6, 2), st, 0, 9, -48, g, { cast: false }); add(tbox(120, 0.9, 6.4, 1), stD, 0, 10.5, -48, g, { cast: false });
      for (let x = -55; x <= 55; x += 14) add(tbox(3.2, 9, 6, 2), st, x, 4, -48, g, { cast: false });
      for (let x = -48; x <= 48; x += 14) { const a = add(new THREE.TorusGeometry(5.4, 0.9, 6, 20, Math.PI), stD, x, 3.4, -45, g, { cast: false }); a.scale.set(1, 1, 3); }
      for (let x = -58; x <= 58; x += 2.4) add(tbox(0.3, 1.1, 0.3, 1), st, x, 11.5, -45.2, g, { cast: false });
      for (let x = -42; x <= 42; x += 14) { add(new THREE.CylinderGeometry(0.12, 0.12, 3, 6), stD, x, 12.5, -45.3, g, { cast: false }); glow(g, x, 14.1, -45.2, 3.0, '#ffd890', 0.7); } }
    const pl = texM(P.planks(74), 1, 4, '#8a7458'); add(tbox(2.2, 0.12, 9, 2), pl, 5.5, -0.05, -4.5, g); for (let z = -1; z >= -9; z -= 2) for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.1, 0.12, 2.0, 8), toon({ color: '#5a4a38' }), 5.5 + sx * 1.0, -0.6, z, g);
    const boat = (x, z, ry, col, s = 1) => { const B = new THREE.Group(); B.position.set(x, -0.5, z); B.rotation.y = ry; B.scale.setScalar(s); g.add(B); const wd = toon({ color: col });
      add(tbox(3.4, 0.5, 1.2, 1), wd, 0, 0.1, 0, B); for (const sz of [-1, 1]) add(tbox(3.6, 0.14, 0.1, 1), toon({ color: '#3a2a1e' }), 0, 0.4, sz * 0.62, B);
      const bow = add(new THREE.ConeGeometry(0.6, 1.0, 4), wd, 2.15, 0.1, 0, B); bow.rotation.z = -Math.PI / 2; bow.rotation.x = Math.PI / 4; bow.scale.set(1, 1, 0.5);
      add(tbox(0.25, 0.06, 1.1, 1), toon({ color: '#6a5038' }), -0.4, 0.33, 0, B); add(tbox(0.25, 0.06, 1.1, 1), toon({ color: '#6a5038' }), 0.8, 0.33, 0, B);
      const oar = add(new THREE.CylinderGeometry(0.025, 0.025, 2.6, 6), toon({ color: '#c8a070' }), 0.2, 0.45, 0.9, B); oar.rotation.x = 1.0; oar.rotation.z = 0.2; return B; };
    S.boat = boat(0.2, -1.6, 0.05, '#6a4a32'); boat(-14, -7, 0.6, '#4a5a4a', 1); boat(12, -12, -0.3, '#5a4a3a', 1.1); boat(-28, -20, 0.2, '#4a4a3a', 1.2);
    // Notfallkoffer: wooden kit with hinged lid and contents
    { const K = new THREE.Group(); K.position.set(-1.6, 0, 1.3); K.rotation.y = 0.35; g.add(K); S.kit = K; const kw = texM(P.planks(75), 1, 1, '#a07848'), br = toon({ color: '#c9a04a' });
      add(tbox(1.0, 0.42, 0.55, 1), kw, 0, 0.21, 0, K); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.08, 0.44, 0.08, 1), br, sx * 0.48, 0.22, sz * 0.26, K);
      add(tbox(0.92, 0.04, 0.48, 1), toon({ color: '#5a1a1a' }), 0, 0.41, 0, K);
      const lab = canvasTex(1024, 256, (c, W, H) => { c.fillStyle = '#e8d8b0'; c.fillRect(0, 0, W, H); c.strokeStyle = '#7a1a1a'; c.lineWidth = 14; c.strokeRect(16, 16, W - 32, H - 32);
        c.font = 'bold 150px "DejaVu Serif", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#7a1a1a'; c.fillText('Notfallkoffer', W / 2, H / 2 + 8); });
      nd(add(new THREE.PlaneGeometry(0.82, 0.205), basic({ map: lab }), 0, 0.22, 0.28, K, { cast: false }));
      const lid = new THREE.Group(); lid.position.set(0, 0.42, -0.275); K.add(lid); S.kitLid = lid; add(tbox(1.02, 0.07, 0.56, 1), kw, 0, 0.035, 0.28, lid); add(tbox(0.25, 0.03, 0.08, 1), br, 0, 0.06, 0.5, lid);
      const bel = new THREE.Group(); bel.position.set(-0.12, 0.43, 0); K.add(bel); S.kitBellows = bel;
      for (const y of [0, 0.07]) { const pd = add(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 3), toon({ color: '#8a5a34' }), 0, y, 0, bel); pd.scale.set(1.5, 1, 0.8); pd.rotation.y = Math.PI / 2; }
      add(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12), toon({ color: '#6a3a24' }), 0, 0.035, 0, bel).scale.set(1.2, 1, 0.7); add(new THREE.CylinderGeometry(0.02, 0.035, 0.22, 8), br, 0.32, 0.035, 0, bel).rotation.z = Math.PI / 2;
      const hose = add(new THREE.TorusGeometry(0.1, 0.022, 6, 18), toon({ color: '#5a4a3a' }), 0.3, 0.44, 0.08, K); hose.rotation.x = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.07, 0.07, 0.07, 12), toon({ color: '#b0b4bc' }), 0.32, 0.46, -0.12, K);
      S.kitGlow = glow(K, 0, 0.55, 0, 1.6, '#ffe8a0', 0); }
    for (const [x, z] of [[-4.5, 2.4], [-5.3, 2.8], [3.2, 2.6]]) { add(new THREE.CylinderGeometry(0.32, 0.28, 0.85, 12), toon({ color: '#7a5a3a' }), x, 0.42, z, g); add(new THREE.TorusGeometry(0.31, 0.02, 4, 16), toon({ color: '#3a3a3a' }), x, 0.6, z, g).rotation.x = Math.PI / 2; }
    add(tbox(0.7, 0.6, 0.7, 1), texM(P.planks(76), 1, 1, '#9a7a50'), -6.2, 0.3, 1.8, g); add(new THREE.TorusGeometry(0.25, 0.06, 6, 16), toon({ color: '#c8b080' }), 1.8, 0.06, 0.6, g).rotation.x = Math.PI / 2;
    for (const x of [-9, 7, 22]) { add(new THREE.CylinderGeometry(0.07, 0.1, 3.4, 8), toon({ color: '#2a2a2e' }), x, 1.7, 0.4, g); add(tbox(0.4, 0.5, 0.4, 1), toon({ color: '#ffe8b0', emissive: '#ffcc70', emissiveIntensity: 1.2 }), x, 3.5, 0.4, g); glow(g, x, 3.5, 0.4, 2.2, '#ffd080', 0.6); }
    for (let i = 0; i < 14; i++) { const x = -40 + i * 6 + R() * 2, z = 6 + R() * 6; add(new THREE.CylinderGeometry(0.18, 0.26, 4, 7), toon({ color: '#4a3a2a' }), x, 2, z, g, { cast: false }); for (let k = 0; k < 3; k++) { const c = add(new THREE.SphereGeometry(1.6 - k * 0.3, 10, 8), toon({ color: k % 2 ? '#5a7050' : '#4a6044' }), x + (k - 1) * 0.6, 4.3 + k * 0.5, z, g, { cast: false }); c.scale.y = 0.8; } }
    instGrass(g, 900, [-12, 12, -0.25, -0.05, -0.55], ['#5a7048', '#6a8050', '#4a6040'], [0.6, 1.3], 81, 0.035);
    instGrass(g, 1500, [-14, 14, 0.2, 6, 0], ['#7a9058', '#8aa060', '#6a8450'], [0.12, 0.32], 82, 0.03);
    S.mist5 = []; for (let i = 0; i < 14; i++) S.mist5.push(mist(g, -30 + i * 4.5 + R() * 2, 0.4 + R() * 1.4, -4 - R() * 26, 16 + R() * 10, 3 + R() * 2, '#c8d4c4', 0.35));
  }
};
function sx0(z) { return z > -1 ? -0.9 : 0.9; }

export const update = (ctx, W, f) => {
  const { THREE } = ctx; const loc = W.loc || 'clinic';
  for (const k in S.G) S.G[k].visible = k === loc;
  const cp = W.cam ? W.cam.pos : [0, 0, 0], tv = new THREE.Vector3();
  for (const m of S.bill) { if (m.userData.mist) { m.getWorldPosition(tv); m.lookAt(cp[0], tv.y, cp[2]); } else m.lookAt(cp[0], cp[1], cp[2]); }
  for (const F of S.flames) { const k = 1 + 0.18 * Math.sin(f * 0.9 + F.ph) + 0.1 * Math.sin(f * 2.3 + F.ph * 2); F.fl.scale.set(1, k, 1); F.fl.rotation.z = 0.12 * Math.sin(f * 0.7 + F.ph); F.gl.material.opacity = F.gl.userData.k * (0.75 + 0.25 * k); }
  for (const L of S.lights) L.intensity = L.userData.I * (0.9 + 0.08 * Math.sin(f * 0.8 + L.position.x) + 0.04 * Math.sin(f * 2.1));
  if (loc === 'clinic') {
    S.rainT.offset.set(f * 0.004, -f * 0.06);
    const fl = W.flash || 0; S.sky1.color.setScalar(0.7 + 2.2 * fl); S.winLight.intensity = 6 * fl; S.glowFlash.material.opacity = 0.9 * fl; S.shaft1.material.opacity = 0.12 + 0.5 * fl;
    S.skel.rotation.z = 0.09 * Math.sin(f * 0.11) + (W.skelKick || 0); S.skel.rotation.y = 0.15 * Math.sin(f * 0.07); S.skArms.forEach((a, i) => { a.rotation.x = 0.25 * Math.sin(f * 0.13 + i * 1.7); });
    S.bowl.visible = !!W.bowl; if (W.bowl) S.bowl.position.set(...W.bowl);
    const J = W.jar; S.heroJar.visible = !!J; if (J) { S.heroJar.position.set(...J.pos); S.heroJar.rotation.set(J.rx || 0, J.ry || 0, J.rz || 0); S.heroJar.scale.setScalar(J.s || 1); }
    S.dust1.forEach((m, i) => { m.position.y = 0.6 + ((i * 0.37 + f * 0.0025) % 2.6); });
  }
  if (loc === 'hall') {
    if (W.fg) S.fgHall.position.set(...W.fg); S.fgHall.visible = !!W.fg;
    const mo = W.morgueOpen || 0; S.morgueDoor.rotation.y = mo; S.morgueMist.forEach((m, i) => { m.material.opacity = Math.min(1, mo * 1.5) * 0.55; m.position.x = -0.3 + i * 0.18 + 0.2 * Math.sin(f * 0.05 + i); m.position.z = -2.2 + mo * 0.6 + 0.1 * i; });
    S.wardDoors.forEach(({ d, sx }) => { d.rotation.y = -sx * (W.wardOpen || 0); }); S.wardGlow.material.opacity = (W.wardOpen || 0) * 0.8;
    S.dust2.forEach((m, i) => { m.position.y = 0.5 + ((i * 0.41 + f * 0.003) % 3.6); });
  }
  if (loc === 'ward') { S.dust3.forEach((m, i) => { m.position.y = 0.6 + ((i * 0.33 + f * 0.0025) % 3.2); }); S.wardShafts.forEach((s, i) => { s.material.opacity = W.wardWarm ? 0.26 + 0.04 * Math.sin(f * 0.05 + i) : 0.1; s.material.color.set(W.wardWarm ? '#ffd8a0' : '#c8d8ff'); }); S.cradles.forEach((c, i) => { c.rotation.z = 0.12 * Math.sin(f * 0.12 + i * 2); }); }
  if (loc === 'wash') {
    const gk = Math.round((W.graph || 0) * 40) / 40; if (gk !== S.graphK) { S.graphK = gk; S.drawGraph(gk); }
    S.handText.material.opacity = W.textFade ?? 1; S.stream.visible = !!W.tap; S.stream.scale.y = 1 + 0.05 * Math.sin(f * 1.3);
    S.water4.material.emissiveIntensity = 0.45 + 0.15 * Math.sin(f * 0.2);
    S.bubbles.forEach((b) => { const t = ((f * 0.012 + b.ph) % 1); b.m.position.set(-0.6 + 0.35 * Math.cos(b.ph * 6 + t * 3) * (0.4 + b.r * 0.6), 1.04 + t * 0.9, -2.9 + 0.3 * Math.sin(b.ph * 4 + t * 2)); b.m.scale.setScalar(0.05 + b.r * 0.06); b.m.material.opacity = Math.sin(t * Math.PI) * 0.9; });
  }
  if (loc === 'river') {
    S.boat.position.y = -0.5 + 0.04 * Math.sin(f * 0.1); S.boat.rotation.z = 0.03 * Math.sin(f * 0.08);
    S.kitLid.rotation.x = -(W.lid || 0); S.kitBellows.visible = !W.bellowsTaken; S.kitGlow.material.opacity = W.kitGlow || 0;
    S.mist5.forEach((m, i) => { m.position.x = -30 + i * 4.5 + ((f * 0.004 * (1 + (i % 3))) % 6); });
  }
};
