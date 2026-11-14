// scene.js: the worlds of "Der Diamantenraub". Each location is its own Group far apart from the others;
// update() shows only the set named by worldAt(f).set. All visible writing is German.
// Sets: vault (M1/M3/M5 inside/M9 final), building (M2), office (M4), alley (M5), forest (M6/M7), car (interior),
// lab + board (M8), cell (M9).
export const SETS = { vault: [0, 0, 0], building: [300, 0, 0], office: [-300, 0, 0], alley: [600, 0, 0], forest: [900, 0, 0], car: [1200, 0, 0], lab: [1500, 0, 0], board: [1800, 0, 0], cell: [2100, 0, 0] };
let S = {};
const cvs = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };

export const build = (ctx) => {
  const { THREE, P, world, add, tbox, toon, canvasTex } = ctx;
  const R = P.rng(77);
  const tx = (c, rx = 1, ry = 1) => P.tex(c, rx, ry);
  const tm = (c, rx, ry, color = '#ffffff', extra = {}) => toon({ map: tx(c, rx, ry), color, ...extra });
  const unlit = (t, extra = {}) => new THREE.MeshBasicMaterial({ map: t, ...extra });
  const glowMat = (col, k = 1) => toon({ color: col, emissive: col, emissiveIntensity: k });
  const addG = (name) => { const g = new THREE.Group(); g.position.set(...SETS[name]); world.add(g); S[name] = g; return g; };
  const plane = (w, h, mat, x, y, z, parent, ry = 0, rxx = 0, opts = { cast: false }) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, opts); m.rotation.set(rxx, ry, 0, 'YXZ'); return m; };
  const shaft = (w, h, col, a, parent) => { // additive soft light shaft (unlit, no ink)
    const t = canvasTex(64, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const gx = g.createLinearGradient(0, 0, W, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, W, H); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    m.userData.ndSkip = true; m.renderOrder = 6; parent.add(m); return m;
  };
  const cone = (r, h, col, a, parent) => { // additive light cone (headlamp / headlight), apex at origin pointing -y
    const t = canvasTex(64, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.15, `rgba(${col},${a * 0.5})`); gr.addColorStop(1, `rgba(${col},${a})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
    const geo = new THREE.ConeGeometry(r, h, 24, 1, true); geo.translate(0, -h / 2, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, opacity: 1 }));
    m.userData.ndSkip = true; m.renderOrder = 6; parent.add(m); return m;
  };
  S.shaft = shaft; S.cone = cone;
  // ---------------- textures ----------------
  const steelC = (seed, base = [150, 160, 175]) => cvs(256, 256, (g, W, H) => { const r = P.rng(seed); g.fillStyle = `rgb(${base})`; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? '255,255,255' : '40,50,60'},${0.04 + r() * 0.06})`; g.lineWidth = 1; const y = r() * H; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + r() * 4 - 2); g.stroke(); } });
  const boxesC = cvs(512, 384, (g) => { const r = P.rng(5); g.fillStyle = '#20262e'; g.fillRect(0, 0, 512, 384);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = i * 128, y = j * 96, L = 52 + r() * 8;
      g.fillStyle = `hsl(212,10%,${L}%)`; g.fillRect(x + 4, y + 4, 120, 88);
      g.fillStyle = `hsl(212,10%,${L + 12}%)`; g.fillRect(x + 4, y + 4, 120, 5); g.fillStyle = `hsl(212,12%,${L - 16}%)`; g.fillRect(x + 4, y + 86, 120, 6);
      g.fillStyle = '#d8c070'; g.fillRect(x + 46, y + 18, 36, 14); g.strokeStyle = '#7a6a3a'; g.lineWidth = 2; g.strokeRect(x + 46, y + 18, 36, 14);
      for (const kx of [x + 40, x + 88]) { g.fillStyle = '#2a2a30'; g.beginPath(); g.arc(kx, y + 56, 7, 0, 7); g.fill(); g.fillRect(kx - 2, y + 56, 4, 12); }
      g.fillStyle = '#9aa2ae'; g.fillRect(x + 104, y + 36, 8, 30); } });
  const tileC = (seed, a = '#3a404a', b = '#323842', n = 4) => cvs(256, 256, (g, W) => { const r = P.rng(seed), s = W / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); g.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.05})`; g.fillRect(i * s + 6, j * s + 6, s * 0.5, 4); } g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 3; for (let k = 0; k <= n; k++) { g.beginPath(); g.moveTo(k * s, 0); g.lineTo(k * s, W); g.moveTo(0, k * s); g.lineTo(W, k * s); g.stroke(); } });
  const brickC = (seed, hue = 12) => P.stone(seed, hue, 38, 40, 64, 30);
  const woodC = (seed, h = 26, l = 34) => cvs(256, 512, (g, W, H) => { const r = P.rng(seed); g.fillStyle = `hsl(${h},45%,${l}%)`; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 60; k++) { g.strokeStyle = `hsla(${h},45%,${l - 8 - r() * 10}%,.5)`; g.lineWidth = 1 + r() * 3; const x = r() * W; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 10, H / 3, x - 10, 2 * H / 3, x + r() * 10 - 5, H); g.stroke(); }
    for (let k = 0; k < 4; k++) { g.fillStyle = `hsla(${h},40%,${l + 10}%,.25)`; g.fillRect(k * 64, 0, 3, H); } });
  const concreteC = (seed, l = 58) => cvs(256, 256, (g, W, H) => { const r = P.rng(seed); g.fillStyle = `hsl(210,6%,${l}%)`; g.fillRect(0, 0, W, H); for (let i = 0; i < 160; i++) { g.fillStyle = `hsla(210,6%,${l - 12 + r() * 24}%,.35)`; g.beginPath(); g.ellipse(r() * W, r() * H, 3 + r() * 16, 2 + r() * 10, r() * 3, 0, 7); g.fill(); } g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2); });
  const soilC = cvs(512, 1024, (g, W, H) => { const r = P.rng(31); const bands = [['#6a8a3a', 30], ['#5a3e26', 140], ['#7a5634', 220], ['#8a6a46', 200], ['#6e5a48', 220], ['#5a4a40', 214]]; let y = 0;
    for (const [c, h] of bands) { g.fillStyle = c; g.fillRect(0, y, W, h); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,240,220'},${0.08 + r() * 0.12})`; g.beginPath(); g.ellipse(r() * W, y + r() * h, 4 + r() * 14, 3 + r() * 8, r() * 3, 0, 7); g.fill(); } y += h; }
    for (let i = 0; i < 26; i++) { g.fillStyle = `hsl(30,10%,${45 + r() * 20}%)`; g.beginPath(); g.ellipse(r() * W, 300 + r() * 700, 10 + r() * 24, 8 + r() * 16, r() * 3, 0, 7); g.fill(); g.strokeStyle = '#2a2018'; g.lineWidth = 3; g.stroke(); }
    g.strokeStyle = '#3a2a18'; g.lineWidth = 4; for (let i = 0; i < 10; i++) { let x = r() * W, yy = 30; g.beginPath(); g.moveTo(x, yy); for (let k = 0; k < 8; k++) { x += r() * 30 - 15; yy += 12 + r() * 14; g.lineTo(x, yy); } g.stroke(); } });
  const glassC = cvs(512, 512, (g, W, H) => { const r = P.rng(41); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const lit = r() < 0.12; const gr = g.createLinearGradient(0, j * 128, 0, j * 128 + 128); gr.addColorStop(0, lit ? '#ffe0a0' : '#8aaad0'); gr.addColorStop(1, lit ? '#e8b070' : '#3a5078'); g.fillStyle = gr; g.fillRect(i * 128, j * 128, 128, 128);
      if (!lit) { g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(i * 128 + 20, j * 128); g.lineTo(i * 128 + 60, j * 128); g.lineTo(i * 128 + 10, j * 128 + 128); g.lineTo(i * 128 - 20, j * 128 + 128); g.fill(); } }
    g.fillStyle = '#c8ccd4'; for (let k = 0; k <= 4; k++) { g.fillRect(k * 128 - 5, 0, 10, H); g.fillRect(0, k * 128 - 5, W, 10); } });
  const veloC = cvs(256, 256, (g) => { g.fillStyle = '#121016'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = '#1c1820'; g.beginPath(); g.arc(32 + i * 64, 32 + j * 64, 18, 0, 7); g.fill(); } });
  // ---------------- shared materials ----------------
  const M = {
    steel: tm(steelC(1), 1, 1, '#c4ccd8'), steelD: tm(steelC(2, [70, 78, 92]), 1, 1), chrome: toon({ color: '#d8dee8' }),
    floorV: tm(tileC(3), 6, 6), ceilV: tm(concreteC(4, 30), 4, 4), concrete: tm(concreteC(5), 4, 2), concreteD: tm(concreteC(6, 42), 4, 4),
    red: glowMat('#ff2a2a', 1.6), green: glowMat('#3aff7a', 1.4), amber: glowMat('#ffb030', 1.4), blueLed: glowMat('#5ab8ff', 1.6), off: toon({ color: '#3a2a2a' }),
    white: toon({ color: '#f2f4f6' }), black: toon({ color: '#16161c' }), magnet: toon({ color: '#d8282c' }), lamp: glowMat('#fff0c8', 1.6), tube: glowMat('#e8f4ff', 1.8),
    wood: tm(woodC(7), 1, 1), woodD: tm(woodC(8, 22, 22), 1, 1), woodL: tm(woodC(9, 30, 48), 1, 1), velvet: tm(veloC, 2, 2), brass: toon({ color: '#d8b04a' }),
    gem: toon({ color: '#b8dcff', emissive: '#2a70d0', emissiveIntensity: 0.4 }),
  };
  S.M = M;
  // brilliant-cut gem geometry (lathe, faceted)
  let gemGeo = new THREE.LatheGeometry([new THREE.Vector2(0, -0.6), new THREE.Vector2(1, 0), new THREE.Vector2(0.62, 0.38), new THREE.Vector2(0, 0.38)], 8).toNonIndexed(); gemGeo.computeVertexNormals();
  S.gemGeo = gemGeo;
  const gemMesh = (parent, x, y, z, s = 0.05) => { const m = add(gemGeo, M.gem, x, y, z, parent, { cast: false }); m.scale.setScalar(s); return m; };
  const gemsInst = (n, parent) => { const im = new THREE.InstancedMesh(gemGeo, M.gem, n); im.castShadow = false; im.receiveShadow = false; im.frustumCulled = false; parent.add(im); return im; };
  const dummy = new THREE.Object3D(); S.dummy = dummy;

  // ===================================================== VAULT =====================================================
  {
    const G = addG('vault');
    const W2 = 4.5, D2 = 5, HH = 3.8;
    const boxMat = (len, h) => tm(boxesC, len / 2.0, h / 1.5, '#ffffff');
    plane(9, 10, M.floorV, 0, 0, 0, G, 0, -Math.PI / 2);
    plane(9, 10, M.ceilV, 0, HH, 0, G, 0, Math.PI / 2);
    plane(10, HH, boxMat(10, HH), -W2, HH / 2, 0, G, Math.PI / 2);
    plane(10, HH, boxMat(10, HH), W2, HH / 2, 0, G, -Math.PI / 2);
    plane(9, HH, boxMat(9, HH), 0, HH / 2, -D2, G, 0);
    for (const x of [-2.2, 2.2]) for (const z of [-3, 0, 3]) add(tbox(0.25, 0.06, 1.6, 1), M.tube, x, HH - 0.04, z, G, { cast: false });
    add(tbox(2.2, 0.08, 1.1, 1), M.steel, 0, 0.92, -0.5, G); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.06, 0.92, 0.06, 1), M.steelD, sx * 1.0, 0.46, -0.5 + sz * 0.45, G);
    for (const sx of [-1, 1]) add(tbox(0.12, 0.2, 10, 1), M.steelD, sx * (W2 - 0.06), 0.1, 0, G, { cast: false });
    const recess = toon({ color: '#07080b' });
    const doors = [], NC = 10, NR = 6, cw = 0.5, ch = 0.375, z0 = -4.4, y0b = 0.55;
    plane(NC * cw, NR * ch, recess, W2 - 0.012, y0b + NR * ch / 2, z0 + NC * cw / 2, G, -Math.PI / 2);
    const doorMat = tm(steelC(12, [132, 140, 152]), 1, 1);
    for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) {
      const piv = new THREE.Group(); piv.position.set(W2 - 0.03, y0b + (j + 0.5) * ch, z0 + (i + 1) * cw - 0.01); G.add(piv);
      add(tbox(0.035, ch - 0.03, cw - 0.03, 0.5), doorMat, 0, 0, -(cw - 0.02) / 2, piv);
      add(tbox(0.03, 0.05, 0.1, 1), M.brass, -0.03, 0.08, -(cw - 0.02) / 2, piv, { cast: false });
      add(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 8), M.black, -0.03, -0.04, -(cw - 0.02) / 2 + 0.1, piv, { cast: false }).rotation.z = Math.PI / 2;
      doors.push({ piv, i, j });
    }
    S.doors = doors;
    const drawers = [];
    for (let k = 0; k < 6; k++) { const dr = new THREE.Group(); dr.position.set(-W2 + 0.02, 0.9 + (k % 3) * 0.55, -3 + Math.floor(k / 3) * 1.4 + (k % 3) * 0.2); G.add(dr);
      add(tbox(0.7, 0.3, 0.48, 0.5), M.steel, -0.35, 0, 0, dr); add(tbox(0.66, 0.04, 0.44, 1), recess, -0.35, 0.14, 0, dr, { cast: false }); add(tbox(0.04, 0.32, 0.5, 1), doorMat, 0.02, 0, 0, dr); add(tbox(0.03, 0.05, 0.14, 1), M.brass, 0.05, 0, 0, dr);
      drawers.push(dr); }
    S.drawers = drawers;
    const hook = new THREE.Group(); hook.position.set(0.3, 1.15, -D2 + 0.02); G.add(hook);
    add(tbox(0.56, 0.36, 0.8, 0.5), M.steel, 0, 0, -0.4, hook); add(tbox(0.52, 0.04, 0.76, 1), recess, 0, 0.17, -0.4, hook, { cast: false });
    add(tbox(0.6, 0.4, 0.04, 1), doorMat, 0, 0, 0.0, hook); add(tbox(0.18, 0.05, 0.05, 1), M.brass, 0, 0, 0.05, hook);
    S.hookGems = []; for (let k = 0; k < 26; k++) S.hookGems.push(gemMesh(hook, -0.22 + (k % 6) * 0.088, 0.2 + (k % 2) * 0.03, -0.1 - Math.floor(k / 6) * 0.15, 0.05));
    S.hook = hook;
    S.flyGems = gemsInst(140, G);
    const bags = [];
    for (let k = 0; k < 3; k++) { const b = new THREE.Group(); b.position.set(-0.7 + k * 0.7, 0.96, -0.5 + (k % 2) * 0.15); G.add(b);
      const body = add(new THREE.SphereGeometry(0.22, 14, 10), toon({ color: '#4a3222' }), 0, 0.18, 0, b); body.scale.set(1, 0.85, 0.85);
      add(new THREE.CylinderGeometry(0.1, 0.16, 0.12, 12, 1, true), toon({ color: '#4a3222', side: THREE.DoubleSide }), 0, 0.38, 0, b);
      const fill = []; for (let i = 0; i < 14; i++) fill.push(gemMesh(b, -0.1 + (i % 5) * 0.05, 0.38 + Math.floor(i / 5) * 0.04, -0.05 + (i % 3) * 0.05, 0.03)); b.userData.fill = fill; bags.push(b); }
    S.bags = bags;
    S.lone = gemMesh(G, 0, 0.05, 0, 0.07);
    const DR = 1.45, DY = 1.75, DZ = 5;
    const wallS = new THREE.Shape(); wallS.moveTo(-6, 0); wallS.lineTo(6, 0); wallS.lineTo(6, HH); wallS.lineTo(-6, HH); wallS.closePath();
    const hole = new THREE.Path(); hole.absarc(0, DY, DR + 0.05, 0, Math.PI * 2, true); wallS.holes.push(hole);
    const wg = new THREE.ExtrudeGeometry(wallS, { depth: 0.7, bevelEnabled: false, curveSegments: 48 });
    add(wg, tm(steelC(13, [96, 104, 118]), 0.6, 0.6), 0, 0, DZ, G, { cast: false });
    add(new THREE.TorusGeometry(DR + 0.12, 0.12, 12, 64), M.steel, 0, DY, DZ + 0.72, G, { cast: false });
    add(new THREE.TorusGeometry(DR + 0.12, 0.12, 12, 64), M.steel, 0, DY, DZ - 0.02, G, { cast: false });
    const hinge = new THREE.Group(); hinge.position.set(DR + 0.15, DY, DZ + 0.75); G.add(hinge); S.vaultHinge = hinge;
    const door = new THREE.Group(); door.position.set(-(DR + 0.15), 0, 0); hinge.add(door);
    const discMat = tm(cvs(512, 512, (g) => { const gr = g.createRadialGradient(256, 256, 20, 256, 256, 256); gr.addColorStop(0, '#c8d0dc'); gr.addColorStop(1, '#8a94a4'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(255,255,255,${0.05 + (i % 3) * 0.03})`; g.lineWidth = 1.5; g.beginPath(); g.arc(256, 256, 30 + i * 2.5, 0, 7); g.stroke(); }
      g.strokeStyle = '#5a6272'; g.lineWidth = 8; for (const r of [150, 236]) { g.beginPath(); g.arc(256, 256, r, 0, 7); g.stroke(); }
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; g.fillStyle = '#6a7282'; g.beginPath(); g.arc(256 + 212 * Math.cos(a), 256 + 212 * Math.sin(a), 9, 0, 7); g.fill(); } }), 1, 1, '#9aa2b2');
    const cyl = add(new THREE.CylinderGeometry(DR, DR, 0.62, 64), [M.steel, discMat, discMat], 0, 0, -0.38, door); cyl.rotation.x = Math.PI / 2;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const b = add(new THREE.CylinderGeometry(0.07, 0.07, 0.35, 10), M.chrome, Math.cos(a) * (DR + 0.05), Math.sin(a) * (DR + 0.05), -0.38, door); b.rotation.z = a + Math.PI / 2; }
    const wheel = new THREE.Group(); wheel.position.set(0.55, 0, 0.1); door.add(wheel); S.vaultWheel = wheel;
    add(new THREE.TorusGeometry(0.34, 0.035, 8, 32), M.chrome, 0, 0, 0.12, wheel);
    for (let k = 0; k < 3; k++) { const sp = add(tbox(0.68, 0.045, 0.045, 1), M.chrome, 0, 0, 0.12, wheel); sp.rotation.z = k * Math.PI / 3; }
    add(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 12), M.steelD, 0, 0, 0.05, wheel).rotation.x = Math.PI / 2;
    const dialTex = canvasTex(1024, 1024, (g, W) => { const c = W / 2; const gr = g.createRadialGradient(c, c, 40, c, c, c); gr.addColorStop(0, '#2a303a'); gr.addColorStop(1, '#14181e'); g.fillStyle = gr; g.beginPath(); g.arc(c, c, c, 0, 7); g.fill();
      g.strokeStyle = '#d8dee8'; g.lineWidth = 10; g.beginPath(); g.arc(c, c, c - 14, 0, 7); g.stroke();
      g.fillStyle = '#e8eef6'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 52px "DejaVu Sans", sans-serif';
      for (let i = 0; i < 100; i++) { const a = i / 100 * Math.PI * 2 - Math.PI / 2; const r0 = c - 30, r1 = c - (i % 10 ? 62 : 92); g.lineWidth = i % 10 ? 4 : 9; g.beginPath(); g.moveTo(c + r0 * Math.cos(a), c + r0 * Math.sin(a)); g.lineTo(c + r1 * Math.cos(a), c + r1 * Math.sin(a)); g.stroke();
        if (i % 10 === 0) { g.save(); g.translate(c + (c - 140) * Math.cos(a), c + (c - 140) * Math.sin(a)); g.rotate(a + Math.PI / 2); g.fillText(String(i), 0, 0); g.restore(); } }
      g.fillStyle = '#3a424e'; g.beginPath(); g.arc(c, c, 200, 0, 7); g.fill(); g.strokeStyle = '#8a94a4'; g.lineWidth = 6; for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283; g.beginPath(); g.moveTo(c + 170 * Math.cos(a), c + 170 * Math.sin(a)); g.lineTo(c + 200 * Math.cos(a), c + 200 * Math.sin(a)); g.stroke(); } });
    const dialG = new THREE.Group(); dialG.position.set(-0.45, 0.15, 0.02); door.add(dialG); S.dial = dialG;
    add(new THREE.CylinderGeometry(0.46, 0.5, 0.08, 64), M.chrome, 0, 0, 0, dialG).rotation.x = Math.PI / 2;
    add(new THREE.CircleGeometry(0.44, 64), unlit(dialTex), 0, 0, 0.045, dialG, { cast: false });
    add(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24), M.chrome, 0, 0, 0.1, dialG).rotation.x = Math.PI / 2;
    add(new THREE.ConeGeometry(0.04, 0.08, 3), M.red, -0.45, 0.65, 0.06, door).rotation.z = Math.PI;
    // ---- corridor (z 5.7..16) ----
    const C = new THREE.Group(); G.add(C);
    plane(6, 11, M.floorV, 0, 0.001, 11, C, 0, -Math.PI / 2);
    plane(6, 11, M.ceilV, 0, 3.4, 11, C, 0, Math.PI / 2);
    const cwall = tm(steelC(14, [84, 92, 106]), 2, 1);
    plane(11, 3.4, cwall, -3, 1.7, 11, C, Math.PI / 2); plane(11, 3.4, cwall, 3, 1.7, 11, C, -Math.PI / 2);
    plane(6, 3.4, cwall, 0, 1.7, 16.4, C, Math.PI);
    for (let z = 7; z < 16; z += 2) add(tbox(0.25, 0.06, 1.2, 1), M.tube, 0, 3.37, z, C, { cast: false });
    for (const sx of [-1, 1]) for (let z = 6.5; z < 16; z += 1.5) add(tbox(0.05, 3.4, 0.12, 1), M.steelD, sx * 2.97, 1.7, z, C, { cast: false });
    S.secLights = [];
    for (let k = 0; k < 10; k++) { const a = Math.PI * (0.95 - k * 0.1 * 0.9); const m = add(new THREE.SphereGeometry(0.08, 12, 8), M.off, Math.cos(a) * 2.05, DY + Math.sin(a) * 1.85, DZ + 0.74, G, { cast: false }); S.secLights.push(m); }
    const heat = new THREE.Group(); heat.position.set(-2.3, 3.0, DZ + 0.75); G.add(heat); S.heat = heat;
    add(tbox(0.5, 0.36, 0.2, 1), M.white, 0, 0, 0.1, heat); const hl = add(new THREE.SphereGeometry(0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.red, 0, 0, 0.2, heat); hl.rotation.x = Math.PI / 2;
    const radar = new THREE.Group(); radar.position.set(2.3, 2.85, DZ + 0.85); G.add(radar);
    add(new THREE.CylinderGeometry(0.06, 0.1, 0.4, 10), M.steelD, 0, -0.1, 0, radar);
    const dish = new THREE.Group(); dish.position.y = 0.15; radar.add(dish); S.radarDish = dish;
    const dm = add(new THREE.SphereGeometry(0.34, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.6), toon({ color: '#e8eef4', side: THREE.DoubleSide }), 0, 0, 0.0, dish); dm.rotation.x = -Math.PI / 2 - 0.3;
    add(new THREE.CylinderGeometry(0.015, 0.015, 0.36, 6), M.steelD, 0, 0.0, 0.18, dish).rotation.x = Math.PI / 2 - 0.3; add(new THREE.SphereGeometry(0.04, 8, 6), M.green, 0, 0.05, 0.34, dish);
    const mag = new THREE.Group(); mag.position.set(-2.35, 1.35, DZ + 0.95); G.add(mag); S.magnet = mag;
    add(new THREE.TorusGeometry(0.26, 0.11, 12, 24, Math.PI), M.magnet, 0, 0.1, 0, mag);
    for (const sx of [-1, 1]) { add(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 14), M.magnet, sx * 0.26, -0.05, 0, mag); add(new THREE.CylinderGeometry(0.112, 0.112, 0.14, 14), M.chrome, sx * 0.26, -0.27, 0, mag); }
    mag.rotation.z = Math.PI;
    add(tbox(0.3, 0.9, 0.12, 1), M.steelD, -2.35, 1.35, DZ + 0.76, G);
    for (const [x, z] of [[-2.6, 7], [2.6, 12]]) { const cam = new THREE.Group(); cam.position.set(x, 3.15, z); G.add(cam); add(tbox(0.18, 0.18, 0.4, 1), M.white, 0, 0, 0, cam); add(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12), M.black, 0, 0, 0.22, cam).rotation.x = Math.PI / 2; add(new THREE.SphereGeometry(0.025, 8, 6), M.red, 0.06, 0.06, 0.18, cam); cam.rotation.y = x < 0 ? -2.5 : 0.6; }
    const desk = new THREE.Group(); desk.position.set(1.9, 0, 10.5); G.add(desk); add(tbox(1.6, 0.9, 0.7, 1), M.woodD, 0, 0.45, 0, desk);
    for (let k = 0; k < 3; k++) { add(tbox(0.5, 0.38, 0.06, 1), M.black, -0.55 + k * 0.55, 1.15, -0.15, desk); add(tbox(0.44, 0.32, 0.02, 1), M.blueLed, -0.55 + k * 0.55, 1.15, -0.11, desk, { cast: false }); }
    S.lampLights = [0, 1, 2].map(() => { const l = new THREE.PointLight('#fff4d0', 0, 8, 1.6); G.add(l); return l; });
    S.gemLight = new THREE.PointLight('#a8dcff', 0, 4, 1.5); G.add(S.gemLight);
    S.vaultCones = [0, 1, 2].map(() => { const c = cone(0.9, 5, '255,244,210', 0.22, G); c.visible = false; return c; });
    S.doorShaft = shaft(3.2, 7, '200,225,255', 0.28, G); S.doorShaft.position.set(0, 1.5, 2.6); S.doorShaft.rotation.set(-Math.PI / 2 + 0.25, 0, 0);
  }

  // ===================================================== BUILDING (cutaway) =====================================================
  {
    const G = addG('building');
    const glass = tm(glassC, 3, 2.5, '#b8c8e8');
    add(tbox(24, 18, 14, 4), [toon({ color: '#5a6478' }), toon({ color: '#5a6478' }), toon({ color: '#3a4250' }), toon({ color: '#3a4250' }), glass, toon({ color: '#5a6478' })], 0, 9, -7, G, { cast: false });
    for (let k = 1; k < 5; k++) add(tbox(24.4, 0.25, 0.4, 1), M.concrete, 0, k * 3.6, 0.1, G, { cast: false });
    add(tbox(24.6, 0.6, 14.6, 1), M.concreteD, 0, 18.2, -7, G, { cast: false });
    add(tbox(6, 3.4, 0.3, 1), toon({ color: '#1e2a3a' }), 0, 1.7, 0.1, G, { cast: false });
    for (const x of [-1.5, 0, 1.5]) add(tbox(0.08, 3.4, 0.35, 1), M.chrome, x, 1.7, 0.15, G, { cast: false });
    add(tbox(8, 0.25, 2.6, 1), M.concrete, 0, 3.55, 1.3, G);
    for (const x of [-3.7, 3.7]) add(new THREE.CylinderGeometry(0.1, 0.1, 3.5, 10), M.chrome, x, 1.75, 2.4, G);
    const signT = canvasTex(2048, 360, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1a2234'); gr.addColorStop(1, '#0e1420'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#c8d8f0'; g.lineWidth = 12; g.strokeRect(14, 14, W - 28, H - 28);
      const dx = 200, dy = H / 2; g.fillStyle = '#bfe8ff'; g.beginPath(); g.moveTo(dx - 90, dy - 30); g.lineTo(dx - 50, dy - 80); g.lineTo(dx + 50, dy - 80); g.lineTo(dx + 90, dy - 30); g.lineTo(dx, dy + 90); g.closePath(); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.stroke();
      g.beginPath(); g.moveTo(dx - 90, dy - 30); g.lineTo(dx + 90, dy - 30); g.moveTo(dx - 30, dy - 30); g.lineTo(dx, dy + 90); g.lineTo(dx + 30, dy - 30); g.stroke();
      g.font = '800 168px Inter, "DejaVu Sans", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#f4f8ff'; g.shadowColor = 'rgba(140,200,255,.9)'; g.shadowBlur = 30; g.fillText('Diamantenzentrum', 330, H / 2 + 8); });
    add(tbox(8.6, 1.7, 0.3, 1), M.steelD, 0, 4.75, 0.35, G);
    const sp = plane(8.4, 8.4 * 360 / 2048, unlit(signT), 0, 4.75, 0.51, G); sp.userData.ndSkip = true;
    plane(80, 6, M.concrete, 0, 0.0, 5, G, 0, -Math.PI / 2);
    plane(80, 10, toon({ color: '#2a2e36' }), 0, -0.01, 13, G, 0, -Math.PI / 2);
    for (let x = -36; x < 40; x += 6) add(tbox(2.4, 0.02, 0.18, 1), toon({ color: '#e8e0c0' }), x, 0.0, 13, G, { cast: false });
    for (const x of [-9, 9]) { add(new THREE.CylinderGeometry(0.08, 0.1, 5, 8), M.steelD, x, 2.5, 7.4, G); add(tbox(0.8, 0.15, 0.3, 1), M.steelD, x - 0.3, 5, 7.4, G); add(tbox(0.5, 0.06, 0.25, 1), M.lamp, x - 0.45, 4.92, 7.4, G, { cast: false }); }
    for (const x of [-6, 6]) { add(tbox(1.4, 0.7, 1.4, 1), M.concreteD, x, 0.35, 3.2, G); const tr = add(new THREE.SphereGeometry(0.9, 12, 10), toon({ color: '#3a6a3a' }), x, 1.6, 3.2, G); tr.scale.y = 1.2; }
    for (const [x, w, h, c] of [[-24, 22, 26, '#4a5262'], [24, 22, 22, '#5a5866'], [-46, 20, 34, '#3e4656'], [46, 20, 30, '#4a4a58']]) { add(tbox(w, h, 14, 4), toon({ color: c }), x, h / 2, -8, G, { cast: false });
      for (let yy = 2; yy < h - 1; yy += 3) for (let xx = -w / 2 + 2; xx < w / 2 - 1; xx += 3) add(tbox(1.4, 1.6, 0.05, 1), (R() < 0.35 ? M.lamp : toon({ color: '#2a3448' })), x + xx, yy, -0.98, G, { cast: false }); }
    const secS = new THREE.Shape(); secS.moveTo(-30, -10); secS.lineTo(30, -10); secS.lineTo(30, 0); secS.lineTo(-30, 0); secS.closePath();
    const h2 = new THREE.Path(); h2.moveTo(-9, -8.4); h2.lineTo(9, -8.4); h2.lineTo(9, -0.5); h2.lineTo(-9, -0.5); h2.closePath(); secS.holes.push(h2);
    const secG = new THREE.ShapeGeometry(secS); { const uv = secG.attributes.uv, pos = secG.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + 30) / 12, (pos.getY(i) + 10) / 10); }
    const soilT = tx(soilC, 1, 1); soilT.wrapT = THREE.ClampToEdgeWrapping;
    add(secG, toon({ map: soilT }), 0, 0, 2, G, { cast: false });
    add(tbox(60, 0.5, 0.4, 1), toon({ color: '#3a3e46' }), 0, -0.25, 1.95, G, { cast: false });
    const room = (y0, y1, mat, back) => { add(tbox(18, 0.4, 12, 2), M.concreteD, 0, y0 - 0.2, -4, G); plane(18, y1 - y0, back, 0, (y0 + y1) / 2, -9.9, G); for (const sx of [-1, 1]) plane(12, y1 - y0, mat, sx * 9, (y0 + y1) / 2, -4, G, -sx * Math.PI / 2); };
    room(-4.1, -0.5, M.concrete, M.concrete);
    room(-8.4, -4.5, tm(steelC(15, [80, 88, 102]), 3, 1), tm(boxesC, 9, 2.6));
    for (const x of [-5, 0, 5]) add(tbox(0.6, 3.6, 0.6, 1), M.concrete, x, -2.3, -3, G);
    { const car = new THREE.Group(); car.position.set(-2.6, -4.1, -5); G.add(car); add(tbox(4, 0.8, 1.8, 1), toon({ color: '#8a2a2a' }), 0, 0.7, 0, car); add(tbox(2.2, 0.6, 1.6, 1), toon({ color: '#2a2e3a' }), -0.2, 1.4, 0, car); for (const sx of [-1.3, 1.3]) for (const sz of [-0.9, 0.9]) add(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 14), M.black, sx, 0.34, sz, car).rotation.x = Math.PI / 2; }
    for (const yy of [-0.9, -1.2]) add(new THREE.CylinderGeometry(0.12, 0.12, 18, 10), toon({ color: yy < -1 ? '#c8a048' : '#5a8ac8' }), 0, yy, -6, G).rotation.z = Math.PI / 2;
    for (const x of [-7, 7]) add(tbox(0.8, 0.06, 0.25, 1), M.tube, x, -0.75, -4, G, { cast: false });
    { const vd = add(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 48), M.steel, 2, -6.3, -9.5, G); vd.rotation.x = Math.PI / 2;
      add(new THREE.TorusGeometry(1.6, 0.12, 10, 48), M.chrome, 2, -6.3, -9.2, G); add(new THREE.TorusGeometry(0.4, 0.04, 8, 24), M.chrome, 2.6, -6.3, -9.1, G);
      for (let k = 0; k < 10; k++) { const a = Math.PI * (0.95 - k * 0.09); add(new THREE.SphereGeometry(0.07, 8, 6), M.red, 2 + Math.cos(a) * 2.0, -6.3 + Math.sin(a) * 1.85, -9.3, G, { cast: false }); }
      for (const x of [-5, 6.5]) add(tbox(0.8, 0.06, 0.25, 1), M.tube, x, -4.75, -5, G, { cast: false });
      const gl = shaft(5, 4, '140,200,255', 0.22, G); gl.position.set(2, -6.3, -8.8); }
    plane(2.2, 18, toon({ color: '#2a2e36' }), 7.5, 0.5, -0.4, G);
    for (const x of [6.4, 8.6]) add(tbox(0.1, 22, 0.1, 1), M.steelD, x, 1, -0.2, G);
    const cab = new THREE.Group(); G.add(cab); S.cab = cab; add(tbox(2, 2.6, 1.2, 1), toon({ color: '#d8c890' }), 0, 1.3, 0, cab); add(tbox(1.6, 2, 0.05, 1), M.lamp, 0, 1.3, 0.62, cab, { cast: false });
    cab.position.set(7.5, 0, -0.5);
    add(new THREE.CylinderGeometry(0.02, 0.02, 30, 6), M.black, 7.5, 6, -0.5, G);
    for (let i = 0; i < 12; i++) add(tbox(8 + R() * 10, 20 + R() * 40, 8, 4), toon({ color: '#3a3a52' }), -80 + i * 16, 15, -60 - R() * 20, G, { cast: false });
  }

  // ===================================================== OFFICE + HALLWAY =====================================================
  {
    const G = addG('office');
    const panel = tm(woodC(21, 24, 30), 3, 1), hallW = tm(P.plaster(18, 34), 3, 1, '#e8d8c0');
    plane(8, 6, tm(woodC(22, 28, 40), 8, 1), 0, 0, -1, G, 0, -Math.PI / 2);
    plane(8, 6, toon({ color: '#d8c8a8' }), 0, 3.2, -1, G, 0, Math.PI / 2);
    plane(8, 3.2, panel, 0, 1.6, -4, G); for (const sx of [-1, 1]) plane(6, 3.2, panel, sx * 4, 1.6, -1, G, -sx * Math.PI / 2);
    add(tbox(3.2, 0.02, 2.2, 1), tm(cvs(256, 256, (g) => { g.fillStyle = '#7a2a2a'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#d8a848'; g.lineWidth = 10; g.strokeRect(16, 16, 224, 224); g.strokeStyle = '#3a1a2a'; g.lineWidth = 6; g.strokeRect(40, 40, 176, 176); }), 1, 1), 0, 0.01, -1.2, G, { cast: false });
    const desk = new THREE.Group(); desk.position.set(0, 0, -2.0); G.add(desk);
    add(tbox(2.6, 0.12, 1.1, 1), M.wood, 0, 0.92, 0, desk); add(tbox(2.5, 0.84, 0.08, 1), M.woodD, 0, 0.44, 0.48, desk); for (const sx of [-1, 1]) add(tbox(0.5, 0.86, 1.0, 1), M.woodD, sx * 1.0, 0.43, 0, desk);
    for (let k = 0; k < 3; k++) { add(tbox(0.55, 0.05, 0.38, 1), M.velvet, -0.7 + k * 0.62, 1.0, 0.1, desk); for (let i = 0; i < 6; i++) gemMesh(desk, -0.88 + k * 0.62 + (i % 3) * 0.17, 1.05, 0.0 + Math.floor(i / 3) * 0.16, 0.035); }
    S.heroGem = gemMesh(desk, 0.25, 1.08, 0.32, 0.06);
    const lamp = new THREE.Group(); lamp.position.set(1.0, 0.98, -0.2); desk.add(lamp); add(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 14), M.brass, 0, 0, 0, lamp); add(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), M.brass, 0, 0.25, 0, lamp); const shd = add(new THREE.ConeGeometry(0.2, 0.2, 18, 1, true), toon({ color: '#2a6a3a', side: THREE.DoubleSide }), -0.1, 0.52, 0, lamp); shd.rotation.z = 0.5; add(new THREE.SphereGeometry(0.06, 10, 8), M.lamp, -0.12, 0.47, 0, lamp, { cast: false });
    S.deskLight = new THREE.PointLight('#ffcf8a', 3.5, 6, 1.4); S.deskLight.position.set(0.85, 1.6, -2.1); G.add(S.deskLight);
    add(tbox(0.7, 1.4, 0.15, 1), toon({ color: '#4a2a1e' }), 0, 0.9, -2.95, G); add(tbox(0.7, 0.12, 0.7, 1), toon({ color: '#4a2a1e' }), 0, 0.55, -2.65, G);
    for (const sx of [-1, 1]) { const sh = new THREE.Group(); sh.position.set(sx * 3.4, 0, -3.6); G.add(sh); add(tbox(1.2, 2.6, 0.4, 1), M.woodD, 0, 1.3, 0, sh); for (let r = 0; r < 4; r++) { add(tbox(1.1, 0.04, 0.38, 1), M.wood, 0, 0.4 + r * 0.6, 0.02, sh, { cast: false }); for (let b = 0; b < 7; b++) add(tbox(0.1, 0.36 + R() * 0.12, 0.28, 1), toon({ color: ['#8a2a2a', '#2a4a7a', '#3a6a3a', '#c8a048', '#5a3a6a'][(b + r) % 5] }), -0.45 + b * 0.14, 0.62 + r * 0.6, 0.04, sh, { cast: false }); } }
    { const sf = new THREE.Group(); sf.position.set(-2.6, 0, -3.5); G.add(sf); add(tbox(0.8, 1.0, 0.6, 1), M.steelD, 0, 0.5, 0, sf); add(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), M.chrome, 0, 0.55, 0.31, sf).rotation.x = Math.PI / 2; }
    { const pl = new THREE.Group(); pl.position.set(2.6, 0, -3.4); G.add(pl); add(new THREE.CylinderGeometry(0.22, 0.18, 0.4, 12), toon({ color: '#c86a3a' }), 0, 0.2, 0, pl); for (let k = 0; k < 7; k++) { const l = add(new THREE.SphereGeometry(0.18, 8, 6), toon({ color: '#3a8a3a' }), Math.cos(k) * 0.18, 0.6 + k * 0.08, Math.sin(k) * 0.18, pl); l.scale.set(1, 1.6, 0.5); } }
    add(tbox(1.8, 1.4, 0.05, 1), toon({ color: '#ffe6b0', emissive: '#ffd890', emissiveIntensity: 1.2 }), 1.6, 2.0, -3.98, G, { cast: false });
    for (let k = 0; k < 10; k++) add(tbox(1.8, 0.05, 0.03, 1), M.woodL, 1.6, 1.35 + k * 0.14, -3.94, G, { cast: false });
    { const sh = shaft(1.8, 4.5, '255,210,140', 0.22, G); sh.position.set(1.2, 1.3, -2.4); sh.rotation.set(-1.0, 0.1, 0.3); }
    const fw = new THREE.Shape(); fw.moveTo(-4, 0); fw.lineTo(4, 0); fw.lineTo(4, 3.2); fw.lineTo(-4, 3.2); fw.closePath(); const dh = new THREE.Path(); dh.moveTo(-0.65, 0); dh.lineTo(0.65, 0); dh.lineTo(0.65, 2.55); dh.lineTo(-0.65, 2.55); dh.closePath(); fw.holes.push(dh);
    const fwg = new THREE.ExtrudeGeometry(fw, { depth: 0.18, bevelEnabled: false }); { const uv = fwg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.35, uv.getY(i) * 0.35); }
    add(fwg, hallW, 0, 0, 1.9, G, { cast: false });
    for (const sx of [-1, 1]) add(tbox(0.1, 2.6, 0.26, 1), M.woodD, sx * 0.7, 1.3, 2.0, G); add(tbox(1.5, 0.12, 0.26, 1), M.woodD, 0, 2.62, 2.0, G);
    const dpiv = new THREE.Group(); dpiv.position.set(-0.64, 0, 2.08); G.add(dpiv); S.officeDoor = dpiv;
    add(tbox(1.27, 1.2, 0.06, 1), M.wood, 0.635, 0.6, 0, dpiv); add(tbox(1.27, 0.14, 0.06, 1), M.wood, 0.635, 2.48, 0, dpiv); for (const x of [0.04, 1.23]) add(tbox(0.08, 1.4, 0.06, 1), M.wood, x, 1.85, 0, dpiv);
    const dtex = canvasTex(1024, 1100, (g, W, H) => { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#e8eef0'); gr.addColorStop(1, '#c8d4da'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(80, 0); g.lineTo(240, 0); g.lineTo(60, H); g.lineTo(-100, H); g.fill();
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'italic bold 100px "DejaVu Serif", serif'; g.lineWidth = 10; g.strokeStyle = '#5a3a10'; g.strokeText('Diamantenhandel', W / 2, H * 0.42); g.fillStyle = '#d8a838'; g.fillText('Diamantenhandel', W / 2, H * 0.42);
      g.strokeStyle = '#c89a30'; g.lineWidth = 8; g.beginPath(); g.moveTo(140, H * 0.56); g.lineTo(W - 140, H * 0.56); g.stroke();
      const dx = W / 2, dy = H * 0.72; g.fillStyle = '#d8a838'; g.beginPath(); g.moveTo(dx - 70, dy - 20); g.lineTo(dx - 40, dy - 60); g.lineTo(dx + 40, dy - 60); g.lineTo(dx + 70, dy - 20); g.lineTo(dx, dy + 70); g.closePath(); g.fill(); g.strokeStyle = '#5a3a10'; g.lineWidth = 6; g.stroke(); });
    const dg_ = add(new THREE.PlaneGeometry(1.11, 1.19), unlit(dtex), 0.635, 1.82, 0.035, dpiv, { cast: false }); dg_.userData.ndSkip = true;
    add(new THREE.SphereGeometry(0.05, 10, 8), M.brass, 1.1, 1.05, 0.06, dpiv);
    plane(24, 4, tm(tileC(23, '#c8b898', '#b8a888', 4), 6, 1), 0, 0, 4, G, 0, -Math.PI / 2);
    plane(24, 4, toon({ color: '#e8e0d0' }), 0, 3.2, 4, G, 0, Math.PI / 2);
    plane(24, 3.2, hallW, 0, 1.6, 6, G, Math.PI);
    for (const sx of [-1, 1]) plane(4, 3.2, hallW, sx * 12, 1.6, 4, G, -sx * Math.PI / 2);
    for (const x of [-8, 8]) add(tbox(8, 3.2, 0.18, 1), hallW, x, 1.6, 1.99, G, { cast: false });
    for (const x of [-6, 6]) { add(tbox(1.27, 2.5, 0.06, 1), M.woodD, x, 1.25, 2.12, G); add(tbox(0.4, 0.12, 0.02, 1), M.brass, x, 1.9, 2.16, G, { cast: false }); }
    for (const x of [-8, -3, 3, 8]) add(tbox(0.6, 0.05, 0.6, 1), M.lamp, x, 3.17, 4, G, { cast: false });
    for (const x of [-9, 9]) { const pl = new THREE.Group(); pl.position.set(x, 0, 5.4); G.add(pl); add(new THREE.CylinderGeometry(0.25, 0.2, 0.5, 12), toon({ color: '#3a3a42' }), 0, 0.25, 0, pl); const b = add(new THREE.SphereGeometry(0.5, 10, 8), toon({ color: '#3a7a3a' }), 0, 1.0, 0, pl); b.scale.y = 1.3; }
    S.hallLight = new THREE.PointLight('#ffe0b0', 2.0, 9, 1.4); S.hallLight.position.set(0, 2.9, 4); G.add(S.hallLight);
    const key = new THREE.Group(); G.add(key); S.key = key;
    add(new THREE.TorusGeometry(0.05, 0.016, 8, 18), M.brass, 0, 0.07, 0, key); add(tbox(0.022, 0.13, 0.012, 1), M.brass, 0, -0.03, 0, key); add(tbox(0.04, 0.02, 0.012, 1), M.brass, 0.02, -0.08, 0, key); add(tbox(0.03, 0.02, 0.012, 1), M.brass, 0.015, -0.045, 0, key);
  }

  // ===================================================== ALLEY (night) =====================================================
  {
    const G = addG('alley');
    const brick = tm(brickC(31, 10), 6, 4, '#c8a0a0');
    plane(40, 30, tm(concreteC(32, 30), 10, 8), 0, 0, 0, G, 0, -Math.PI / 2);
    add(tbox(30, 14, 1, 4), brick, 0, 7, -6, G, { cast: false });
    add(tbox(1.6, 2.6, 0.12, 1), M.steelD, 0, 1.3, -5.45, G); add(tbox(0.08, 0.3, 0.06, 1), M.chrome, 0.6, 1.3, -5.36, G, { cast: false });
    add(tbox(0.5, 0.3, 0.4, 1), M.steelD, 0, 3.1, -5.3, G); add(tbox(0.4, 0.05, 0.3, 1), M.lamp, 0, 2.95, -5.2, G, { cast: false });
    { const sh = shaft(3.2, 3.2, '255,220,150', 0.2, G); sh.position.set(0, 1.5, -4.6); sh.rotation.set(-0.35, 0, 0); }
    S.alleyLight = new THREE.PointLight('#ffd8a0', 4, 9, 1.4); S.alleyLight.position.set(0, 2.8, -4.6); G.add(S.alleyLight);
    for (const x of [-8, 7]) { add(tbox(3.2, 3, 0.15, 1), toon({ color: '#5a5e66' }), x, 1.5, -5.42, G); for (let k = 0; k < 8; k++) add(tbox(3.2, 0.04, 0.05, 1), toon({ color: '#3a3e46' }), x, 0.2 + k * 0.36, -5.32, G, { cast: false }); }
    for (const x of [-3.2, 4.2]) add(new THREE.CylinderGeometry(0.1, 0.1, 14, 8), toon({ color: '#4a4e58' }), x, 7, -5.35, G);
    add(tbox(3, 0.6, 0.6, 1), toon({ color: '#5a5e68' }), -5, 5.2, -5.2, G);
    { const d = new THREE.Group(); d.position.set(-4.4, 0, -4.4); G.add(d); add(tbox(2.0, 1.3, 1.1, 1), toon({ color: '#2a5a3a' }), 0, 0.75, 0, d); add(tbox(2.1, 0.1, 1.2, 1), toon({ color: '#1e3e2a' }), 0, 1.45, 0, d); for (const sx of [-0.8, 0.8]) add(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10), M.black, sx, 0.08, 0.5, d).rotation.x = Math.PI / 2; }
    for (const [x, z] of [[4, -4.6], [4.8, -4.2], [4.3, -3.5]]) add(tbox(0.7, 0.6, 0.7, 1), M.woodD, x, 0.3, z, G);
    for (const [x, z, s] of [[-1.5, -1, 1.2], [2.2, 1.5, 0.9], [-2.8, 2.5, 1.4]]) { const p = add(new THREE.CircleGeometry(s, 24), toon({ color: '#3a4a6a', emissive: '#1a2a4a', emissiveIntensity: 0.6 }), x, 0.005, z, G, { cast: false }); p.rotation.x = -Math.PI / 2; p.scale.y = 0.6; }
    for (let i = 0; i < 18; i++) { const w = 6 + R() * 8, h = 18 + R() * 40, x = -70 + i * 8.5, z = -40 - R() * 20; add(tbox(w, h, 6, 4), toon({ color: '#1e2236' }), x, h / 2, z, G, { cast: false }); for (let k = 0; k < 10; k++) add(tbox(0.8, 1.0, 0.05, 1), M.lamp, x - w / 2 + 1 + R() * (w - 2), 2 + R() * (h - 4), z + 3.02, G, { cast: false }); }
    const moon = add(new THREE.CircleGeometry(4, 32), new THREE.MeshBasicMaterial({ color: '#f4f0dc', fog: false }), 18, 34, -70, G, { cast: false }); moon.userData.ndSkip = true;
    const mg = shaft(22, 22, '200,220,255', 0.15, G); mg.position.set(18, 34, -71);
  }

  // ===================================================== FOREST (night + morning) =====================================================
  {
    const G = addG('forest');
    plane(300, 400, tm(P.grass(51), 60, 80, '#6a8a5a'), 0, -0.02, 0, G, 0, -Math.PI / 2);
    plane(6, 400, tm(P.dirt(52), 2, 80, '#8a8478'), 0, 0.0, 0, G, 0, -Math.PI / 2);
    plane(5, 400, toon({ color: '#3a3c40' }), 0, 0.005, 0, G, 0, -Math.PI / 2);
    for (let z = -195; z < 200; z += 6) add(tbox(0.12, 0.01, 2.4, 1), toon({ color: '#d8d0b0' }), 0, 0.01, z, G, { cast: false });
    const N = 900, trunkI = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.28, 1, 6), toon({ color: '#4a3a2c' }), N), crownI = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7), toon({ color: '#2e5a3a' }), N), crown2 = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7), toon({ color: '#3e6e44' }), N);
    for (const m of [trunkI, crownI, crown2]) { m.castShadow = true; m.receiveShadow = true; }
    const d = S.dummy;
    for (let i = 0; i < N; i++) { const side = i % 2 ? 1 : -1; let x = side * (4.5 + Math.pow(R(), 1.4) * 60); const z = -190 + R() * 380, h = 8 + R() * 8, r = 1.6 + R() * 1.4; if (x > 0 && x < 9 && z > 30 && z < 50) x += 6;
      d.position.set(x, h * 0.25, z); d.scale.set(1, h * 0.5, 1); d.rotation.set(0, 0, 0); d.updateMatrix(); trunkI.setMatrixAt(i, d.matrix);
      d.position.set(x, h * 0.62, z); d.scale.set(r, h * 0.75, r); d.updateMatrix(); crownI.setMatrixAt(i, d.matrix);
      d.position.set(x, h * 0.9, z); d.scale.set(r * 0.7, h * 0.45, r * 0.7); d.updateMatrix(); crown2.setMatrixAt(i, d.matrix); }
    G.add(trunkI); G.add(crownI); G.add(crown2);
    const bushI = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), toon({ color: '#3a6a34', flatShading: true }), 500);
    for (let i = 0; i < 500; i++) { const side = i % 2 ? 1 : -1; let bx = side * (3.6 + R() * 6), bz = -190 + R() * 380; if (bx > 0 && bz > 36 && bz < 47 && bx < 6.5) bx += 4; d.position.set(bx, 0.2, bz); const s = 0.4 + R() * 0.8; d.scale.set(s * 1.3, s, s * 1.3); d.rotation.set(R(), R() * 6, 0); d.updateMatrix(); bushI.setMatrixAt(i, d.matrix); }
    bushI.castShadow = true; bushI.receiveShadow = true; G.add(bushI);
    const fernI = new THREE.InstancedMesh(new THREE.ConeGeometry(0.06, 0.6, 3), toon({ color: '#5a8a3a' }), 2500);
    for (let i = 0; i < 2500; i++) { const side = i % 2 ? 1 : -1; d.position.set(side * (3.1 + R() * 9), 0.25, -40 + R() * 90); d.scale.set(1, 0.6 + R(), 1); d.rotation.set((R() - 0.5) * 0.8, R() * 6, (R() - 0.5) * 0.8); d.updateMatrix(); fernI.setMatrixAt(i, d.matrix); }
    G.add(fernI);
    const car = new THREE.Group(); G.add(car); S.car = car;
    const paint = toon({ color: '#6a7a8a' });
    add(tbox(1.9, 0.6, 4.6, 1), paint, 0, 0.62, 0, car); add(tbox(1.7, 0.55, 2.4, 1), paint, 0, 1.18, -0.2, car);
    add(tbox(1.72, 0.45, 0.05, 1), toon({ color: '#1a2230' }), 0, 1.2, 1.02, car); add(tbox(1.72, 0.45, 0.05, 1), toon({ color: '#1a2230' }), 0, 1.2, -1.42, car);
    for (const sx of [-1, 1]) { add(tbox(0.04, 0.42, 1.0, 1), toon({ color: '#1a2230' }), sx * 0.86, 1.2, 0.4, car); const rw = add(tbox(0.04, 0.42, 0.9, 1), toon({ color: '#1a2230' }), sx * 0.86, 1.2, -0.75, car); if (sx > 0) S.carWinR = rw; }
    add(tbox(1.95, 0.18, 0.2, 1), M.chrome, 0, 0.45, 2.32, car); add(tbox(1.95, 0.18, 0.2, 1), M.chrome, 0, 0.45, -2.32, car);
    for (const sx of [-0.7, 0.7]) { add(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 14), toon({ color: '#fff8d0', emissive: '#fff4c0', emissiveIntensity: 2 }), sx, 0.7, 2.31, car, { cast: false }).rotation.x = Math.PI / 2; add(tbox(0.3, 0.12, 0.05, 1), M.red, sx, 0.75, -2.31, car, { cast: false }); }
    S.wheels = []; for (const sx of [-0.9, 0.9]) for (const sz of [-1.5, 1.5]) { const w = add(new THREE.CylinderGeometry(0.36, 0.36, 0.24, 16), M.black, sx, 0.36, sz, car); w.rotation.z = Math.PI / 2; S.wheels.push(w); add(new THREE.CylinderGeometry(0.18, 0.18, 0.26, 10), M.chrome, sx, 0.36, sz, car).rotation.z = Math.PI / 2; }
    S.headCones = [-0.7, 0.7].map((sx) => { const c = cone(2.6, 16, '255,240,200', 0.18, car); c.position.set(sx, 0.7, 2.4); c.rotation.x = -Math.PI / 2 + 0.06; return c; });
    S.carLights = [-0.7, 0.7].map((sx) => { const l = new THREE.PointLight('#fff0c8', 6, 18, 1.2); l.position.set(sx, 0.9, 4); car.add(l); return l; });
    const bag = new THREE.Group(); G.add(bag); S.bag = bag;
    const bm = toon({ color: '#1c1d24' });
    { const b = add(new THREE.SphereGeometry(0.42, 14, 10), bm, 0, 0.36, 0, bag); b.scale.set(1, 0.9, 0.85); add(new THREE.SphereGeometry(0.26, 10, 8), bm, 0.18, 0.2, 0.12, bag); add(new THREE.ConeGeometry(0.12, 0.3, 8), bm, 0, 0.82, 0, bag); add(new THREE.SphereGeometry(0.08, 8, 6), bm, 0.06, 0.95, 0, bag); add(new THREE.SphereGeometry(0.07, 8, 6), bm, -0.07, 0.95, 0.02, bag); }
    const bagOpen = new THREE.Group(); G.add(bagOpen); S.bagOpen = bagOpen;
    { const b = add(new THREE.SphereGeometry(0.5, 16, 10, 0, Math.PI * 2, 0.9, 2.24), toon({ color: '#1c1d24', side: THREE.DoubleSide }), 0, 0.42, 0, bagOpen); b.scale.set(1.2, 0.8, 1.0);
      for (let k = 0; k < 6; k++) { const f = add(new THREE.ConeGeometry(0.16, 0.4, 5), bm, Math.cos(k) * 0.5, 0.75, Math.sin(k) * 0.42, bagOpen); f.rotation.set(Math.sin(k) * 0.9, 0, -Math.cos(k) * 0.9); } }
    const envT = canvasTex(1024, 640, (g, W, H) => { g.fillStyle = '#efe6cf'; g.fillRect(0, 0, W, H); g.strokeStyle = '#c8b890'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(W / 2, H * 0.55); g.lineTo(W, 0); g.stroke();
      g.fillStyle = '#1e3a6a'; g.fillRect(40, H - 210, W - 80, 160); const dx = 120, dy = H - 130; g.fillStyle = '#bfe8ff'; g.beginPath(); g.moveTo(dx - 50, dy - 15); g.lineTo(dx - 28, dy - 45); g.lineTo(dx + 28, dy - 45); g.lineTo(dx + 50, dy - 15); g.lineTo(dx, dy + 50); g.closePath(); g.fill();
      g.font = '800 78px Inter, "DejaVu Sans", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.fillText('Diamantenzentrum', 190, H - 128); });
    S.envelopes = []; const envSide = toon({ color: '#e6dcc4' }), envMat = [envSide, envSide, unlit(envT), envSide, envSide, envSide];
    for (let k = 0; k < 3; k++) { const e = add(new THREE.BoxGeometry(0.48, 0.008, 0.3), envMat, 0, 0, 0, G, { cast: true }); S.envelopes.push(e); }
    const casT = canvasTex(1024, 360, (g, W, H) => { g.fillStyle = '#f6f2e6'; g.fillRect(0, 0, W, H); g.fillStyle = '#d83a3a'; g.fillRect(0, 0, W, 40); g.fillRect(0, H - 40, W, 40);
      g.font = 'bold 118px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1a1a2a'; g.fillText('Überwachung', W / 2, H / 2 + 6); });
    const cas = new THREE.Group(); G.add(cas); S.cassette = cas;
    add(tbox(0.42, 0.06, 0.24, 1), toon({ color: '#1a1a20' }), 0, 0.03, 0, cas);
    const lab = add(new THREE.PlaneGeometry(0.3, 0.105), unlit(casT), 0, 0.0611, -0.03, cas, { cast: false }); lab.rotation.x = -Math.PI / 2; lab.userData.ndSkip = true;
    for (const sx of [-0.09, 0.09]) add(new THREE.CylinderGeometry(0.035, 0.035, 0.005, 16), toon({ color: '#ececec' }), sx, 0.062, 0.06, cas, { cast: false });
    add(tbox(0.2, 0.004, 0.05, 1), toon({ color: '#3a2a20' }), 0, 0.062, 0.06, cas, { cast: false });
    S.forestShafts = []; for (let k = 0; k < 6; k++) { const sh = shaft(3 + R() * 3, 26, '255,240,200', 0.18, G); sh.position.set(-6 + k * 3.4, 9, 30 - k * 2.5); sh.rotation.set(0, 0.6, 0.45); S.forestShafts.push(sh); }
    S.mist = []; const mistT = canvasTex(256, 128, (g, W, H) => { const gr = g.createRadialGradient(W / 2, H / 2, 4, W / 2, H / 2, W / 2); gr.addColorStop(0, 'rgba(230,240,235,.55)'); gr.addColorStop(1, 'rgba(230,240,235,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
    for (let k = 0; k < 26; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), new THREE.MeshBasicMaterial({ map: mistT, transparent: true, depthWrite: false, fog: true })); m.position.set((R() - 0.5) * 30, 0.9 + R() * 1.2, -60 + R() * 90); m.userData.ndSkip = true; m.renderOrder = 5; G.add(m); S.mist.push(m); }
  }

  // ===================================================== CAR INTERIOR (studio rig, night) =====================================================
  {
    const G = addG('car');
    const seatM = toon({ color: '#5a4a3e' }), trim = toon({ color: '#2a2a30' });
    plane(6, 6, toon({ color: '#1e1e24' }), 0, 0, 0, G, 0, -Math.PI / 2);
    for (const x of [-0.85, 0.85]) { const s = new THREE.Group(); s.position.set(x, 0, -0.2); G.add(s); add(tbox(1.1, 0.25, 0.9, 1), seatM, 0, 0.78, 0.1, s); add(tbox(1.1, 1.3, 0.25, 1), seatM, 0, 1.4, -0.4, s); add(tbox(0.55, 0.32, 0.2, 1), seatM, 0, 2.2, -0.42, s); for (let k = 0; k < 4; k++) add(tbox(1.12, 0.03, 0.27, 1), toon({ color: '#4a3a30' }), 0, 0.95 + k * 0.28, -0.4, s, { cast: false }); }
    add(tbox(3.2, 1.0, 0.3, 1), seatM, 0, 1.2, -1.8, G);
    add(tbox(3.6, 0.1, 4, 1), toon({ color: '#3a3830' }), 0, 2.75, -0.5, G, { cast: false });
    for (const sx of [-1, 1]) { add(tbox(0.1, 1.0, 4, 1), trim, sx * 1.8, 0.5, -0.5, G, { cast: false }); add(tbox(0.12, 1.3, 0.14, 1), trim, sx * 1.8, 2.05, -0.9, G, { cast: false }); add(tbox(0.12, 0.08, 4, 1), trim, sx * 1.8, 1.05, -0.5, G, { cast: false }); add(tbox(0.12, 0.1, 4, 1), trim, sx * 1.8, 2.7, -0.5, G, { cast: false }); }
    add(tbox(3.6, 1.5, 0.1, 1), toon({ color: '#1a1a20' }), 0, 2.0, -2.6, G, { cast: false });
    add(tbox(1.2, 0.5, 0.06, 1), toon({ color: '#0a0e18' }), 0, 2.1, -2.54, G, { cast: false });
    S.passing = [];
    for (let k = 0; k < 16; k++) { const sx = k % 2 ? 1 : -1, t = add(tbox(0.25, 4, 0.25, 1), toon({ color: '#14201a' }), sx * (2.6 + (k % 4) * 0.6), 2, 0, G, { cast: false }); S.passing.push({ m: t, sx, ph: k / 16 }); }
    for (const sx of [-1, 1]) { const bg = plane(8, 3, new THREE.MeshBasicMaterial({ color: '#0e1a24', fog: false }), sx * 4.5, 1.8, -0.5, G, -sx * Math.PI / 2); bg.userData.ndSkip = true; }
    add(tbox(3.4, 0.5, 0.6, 1), trim, 0, 1.15, 1.75, G, { cast: false });
    add(tbox(0.5, 0.14, 0.04, 1), M.blueLed, 0.75, 1.42, 1.44, G, { cast: false }); add(tbox(0.3, 0.12, 0.04, 1), M.amber, -0.75, 1.42, 1.44, G, { cast: false });
    const sw = add(new THREE.TorusGeometry(0.38, 0.05, 8, 28), M.black, -0.85, 1.6, 1.25, G, { cast: false }); sw.rotation.x = -0.4;
    S.dashLight = new THREE.PointLight('#7ac8ff', 3.5, 5, 1.2); S.dashLight.position.set(0, 1.5, 1.3); G.add(S.dashLight);
    S.carSweep = new THREE.PointLight('#ffd8a0', 0, 8, 1.2); G.add(S.carSweep);
  }

  // ===================================================== LAB =====================================================
  {
    const G = addG('lab');
    const tileW = tm(tileC(61, '#e8eef2', '#dce4ea', 6), 4, 2);
    plane(10, 10, tm(tileC(62, '#c8d0d8', '#bcc6ce', 4), 6, 6), 0, 0, 0, G, 0, -Math.PI / 2);
    plane(10, 3.4, tileW, 0, 1.7, -3, G); for (const sx of [-1, 1]) plane(8, 3.4, tileW, sx * 5, 1.7, 1, G, -sx * Math.PI / 2);
    plane(10, 8, toon({ color: '#eef2f6' }), 0, 3.4, 1, G, 0, Math.PI / 2);
    for (const x of [-2, 2]) add(tbox(0.3, 0.05, 2.4, 1), M.tube, x, 3.37, 0, G, { cast: false });
    add(tbox(9, 0.9, 0.8, 1), M.white, 0, 0.45, -2.55, G); add(tbox(9.1, 0.06, 0.85, 1), toon({ color: '#2a3440' }), 0, 0.93, -2.55, G);
    { const mic = new THREE.Group(); mic.position.set(-2.8, 0.96, -2.5); G.add(mic); add(tbox(0.4, 0.06, 0.5, 1), M.white, 0, 0.03, 0, mic); add(tbox(0.08, 0.6, 0.08, 1), M.white, 0, 0.35, -0.15, mic); add(new THREE.CylinderGeometry(0.05, 0.06, 0.4, 12), M.black, 0, 0.6, 0, mic).rotation.x = 0.4; }
    for (let k = 0; k < 5; k++) add(new THREE.CylinderGeometry(0.05, 0.12, 0.3, 12), toon({ color: ['#7ad8ff', '#ff8aa8', '#a8ff8a', '#ffd87a', '#c8a8ff'][k], transparent: true, opacity: 0.85 }), -1.6 + k * 0.3, 1.11, -2.4, G);
    { const scr = canvasTex(512, 320, (g, W, H) => { g.fillStyle = '#0a1a2a'; g.fillRect(0, 0, W, H); const r = P.rng(64); for (let i = 0; i < 40; i++) { g.fillStyle = ['#ff5a5a', '#5aff8a', '#5ab8ff', '#ffd85a'][i % 4]; g.fillRect(20 + i * 12, 40 + r() * 60, 8, 200 * r()); } g.strokeStyle = '#5affd8'; g.lineWidth = 4; g.beginPath(); for (let x = 0; x < W; x += 6) g.lineTo(x, 270 + 25 * Math.sin(x * 0.05)); g.stroke(); });
      add(tbox(1.2, 0.8, 0.06, 1), M.black, 2.2, 1.55, -2.6, G); const s = add(new THREE.PlaneGeometry(1.1, 0.7), unlit(scr), 2.2, 1.55, -2.56, G, { cast: false }); s.userData.ndSkip = true; }
    add(tbox(2.0, 0.08, 1.2, 1), M.white, 0, 1.0, 0, G); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.06, 1.0, 0.06, 1), M.chrome, sx * 0.92, 0.5, sz * 0.52, G);
    add(tbox(0.9, 0.02, 0.6, 1), toon({ color: '#cfe8f4', transparent: true, opacity: 0.7 }), -0.2, 1.05, 0.05, G, { cast: false });
    const lamp = new THREE.Group(); lamp.position.set(-0.2, 2.6, 0); G.add(lamp); add(new THREE.CylinderGeometry(0.3, 0.42, 0.18, 20, 1, true), toon({ color: '#d8dee8', side: THREE.DoubleSide }), 0, 0, 0, lamp); add(new THREE.CircleGeometry(0.3, 20), M.tube, 0, -0.06, 0, lamp, { cast: false }).rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), M.chrome, 0, 0.5, 0, lamp);
    { const sh = shaft(1.0, 1.7, '220,240,255', 0.28, G); sh.position.set(-0.2, 1.8, 0.1); }
    S.labLight = new THREE.PointLight('#e8f6ff', 3, 5, 1.2); S.labLight.position.set(-0.2, 2.2, 0.3); G.add(S.labLight);
    const dna = new THREE.Group(); dna.position.set(0.4, 1.04, -0.2); G.add(dna); S.dna = dna;
    add(new THREE.CylinderGeometry(0.15, 0.18, 0.06, 16), M.chrome, 0, 0.03, 0, dna); add(new THREE.CylinderGeometry(0.012, 0.012, 1.3, 6), M.chrome, 0, 0.7, 0, dna);
    const a1 = glowMat('#5ad8ff', 1.4), a2 = glowMat('#ff6ad8', 1.4), rung = glowMat('#c8f0ff', 0.9);
    S.dnaGlowMats = [a1, a2, rung];
    for (let k = 0; k < 22; k++) { const y = 0.15 + k * 0.055, a = k * 0.5; const x1 = Math.cos(a) * 0.16, z1 = Math.sin(a) * 0.16;
      add(new THREE.SphereGeometry(0.03, 10, 8), a1, x1, y, z1, dna, { cast: false }); add(new THREE.SphereGeometry(0.03, 10, 8), a2, -x1, y, -z1, dna, { cast: false });
      if (k % 2 === 0) { const r = add(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 6), rung, 0, y, 0, dna, { cast: false }); r.rotation.set(0, -a, Math.PI / 2); } }
    S.dnaLight = new THREE.PointLight('#7ad8ff', 2, 3, 1.2); S.dnaLight.position.set(0.4, 1.7, 0.2); G.add(S.dnaLight);
  }

  // ===================================================== POLICE BOARD =====================================================
  {
    const G = addG('board');
    plane(10, 8, tm(woodC(71, 20, 26), 8, 1), 0, 0, 1, G, 0, -Math.PI / 2);
    plane(10, 3.4, tm(P.plaster(72, 210), 3, 1, '#9aa8b8'), 0, 1.7, -2, G);
    for (const sx of [-1, 1]) plane(8, 3.4, tm(P.plaster(73, 210), 3, 1, '#8a98a8'), sx * 5, 1.7, 1, G, -sx * Math.PI / 2);
    plane(10, 8, toon({ color: '#5a6270' }), 0, 3.4, 1, G, 0, Math.PI / 2);
    const BX = 0, BY = 1.65, BZ = -1.94;
    add(tbox(3.0, 1.9, 0.06, 1), M.woodD, BX, BY, BZ, G);
    const corkT = cvs(512, 512, (g, W, H) => { const r = P.rng(74); g.fillStyle = '#b8864e'; g.fillRect(0, 0, W, H); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '90,50,20' : '230,190,130'},${0.25 + r() * 0.3})`; g.fillRect(r() * W, r() * H, 2 + r() * 3, 2 + r() * 3); } });
    add(tbox(2.86, 1.76, 0.02, 1), tm(corkT, 2, 1.2), BX, BY, BZ + 0.035, G, { cast: false });
    const headT = canvasTex(1024, 220, (g, W, H) => { g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, W, H); g.font = '900 150px Inter, "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#c42a2a'; g.fillText('Beweise', W / 2, H / 2 + 8); });
    const hd = add(new THREE.PlaneGeometry(1.2, 0.26), unlit(headT), BX, BY + 0.68, BZ + 0.05, G, { cast: false }); hd.userData.ndSkip = true; hd.rotation.z = -0.02;
    const T = ctx.T;
    const photo = (fn, w = 0.42, h = 0.5, x = 0, y = 0, rot = 0) => { const t = canvasTex(420, 500, (g, W, H) => { g.fillStyle = '#f6f4ec'; g.fillRect(0, 0, W, H); g.save(); g.beginPath(); g.rect(20, 20, W - 40, H - 100); g.clip(); fn(g, W, H); g.restore(); });
      const m = add(new THREE.PlaneGeometry(w, h), unlit(t), BX + x, BY + y, BZ + 0.06, G, { cast: false }); m.rotation.z = rot; m.userData.ndSkip = true; return m; };
    const face = (spec, bg) => (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2 - 300 * 0.62, 30); g.scale(0.62, 0.62); T.toonChar(new T.Pen(g), spec, { expr: spec === T.CAST.siska ? 'worried' : 'smug', L: 'hang', R: 'hang', headlamp: false }); g.restore(); };
    const faces = [[T.CAST.kopfSuit, '#8aa0c0', -0.72, 0.28], [T.CAST.koca, '#a8b8c8', 0.18, 0.3], [T.CAST.siska, '#c8b0a0', 0.98, 0.2]];
    S.facePins = faces.map(([sp, bg, x, y], i) => { photo(face(sp, bg), 0.42, 0.5, x, y, (i - 1) * 0.04); return [BX + x, BY + y + 0.22, BZ + 0.08]; });
    photo((g, W, H) => { g.fillStyle = '#3a4a6a'; g.fillRect(0, 0, W, H); g.fillStyle = '#8ab0d8'; for (let j = 0; j < 6; j++) for (let i = 0; i < 5; i++) g.fillRect(40 + i * 70, 40 + j * 60, 50, 40); }, 0.34, 0.4, -0.05, -0.48, 0.05);
    photo((g, W, H) => { g.fillStyle = '#5a6a5a'; g.fillRect(0, 0, W, H); g.fillStyle = '#efe6cf'; g.save(); g.translate(W / 2, H / 2 - 30); g.rotate(-0.15); g.fillRect(-140, -80, 280, 170); g.restore(); }, 0.34, 0.4, 0.5, -0.5, -0.06);
    photo((g, W, H) => { g.fillStyle = '#4a4a50'; g.fillRect(0, 0, W, H); g.fillStyle = '#16161c'; g.fillRect(70, 150, 280, 120); g.fillStyle = '#f6f2e6'; g.fillRect(110, 170, 200, 60); }, 0.34, 0.4, 1.05, -0.45, 0.07);
    { const t = canvasTex(420, 500, (g, W, H) => { g.fillStyle = '#f6f4ec'; g.fillRect(0, 0, W, H); g.fillStyle = '#6a8a6a'; g.fillRect(20, 20, W - 40, H - 100); T.drawSandwich(g, W / 2, H / 2 - 40, 0.95, 1, -0.2); });
      const m = add(new THREE.PlaneGeometry(0.42, 0.5), unlit(t), 0, 0, 0, G, { cast: false }); m.userData.ndSkip = true; S.lastPhoto = m; S.lastPhotoPos = [BX - 0.88, BY - 0.42, BZ + 0.07]; }
    S.pins = []; const pinM = toon({ color: '#e82a2a' });
    for (const p of S.facePins) S.pins.push(add(new THREE.SphereGeometry(0.03, 10, 8), pinM, ...p, G, { cast: false }));
    S.lastPin = add(new THREE.SphereGeometry(0.03, 10, 8), pinM, 0, 0, 0, G, { cast: false });
    const strM = toon({ color: '#d81e2a', emissive: '#801018', emissiveIntensity: 0.6 });
    S.strings = []; const conns = [[0, 1], [1, 2], [0, 2], [3, 0], [3, 1], [3, 2]];
    const pts = [...S.facePins, [S.lastPhotoPos[0], S.lastPhotoPos[1] + 0.22, S.lastPhotoPos[2] + 0.01]];
    for (const [a, b] of conns) { const g_ = new THREE.CylinderGeometry(0.008, 0.008, 1, 6); g_.translate(0, 0.5, 0); const m = add(g_, strM, ...pts[a], G, { cast: false }); const v = new THREE.Vector3(pts[b][0] - pts[a][0], pts[b][1] - pts[a][1], pts[b][2] - pts[a][2]); m.userData.len = v.length(); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); m.scale.set(1, 0.001, 1); S.strings.push(m); }
    add(tbox(2.4, 0.08, 1.0, 1), M.woodD, -2.6, 0.95, -0.9, G); add(tbox(2.3, 0.9, 0.9, 1), M.woodD, -2.6, 0.45, -0.9, G);
    add(tbox(0.5, 0.36, 0.06, 1), M.black, -2.8, 1.25, -1.2, G); add(tbox(0.3, 0.3, 0.2, 1), toon({ color: '#d8c8a0' }), -2.0, 1.12, -0.8, G);
    for (let k = 0; k < 6; k++) { const s = shaft(4, 0.16, '255,220,170', 0.25, G); s.position.set(2.2, 2.6 - k * 0.32, -1.92); s.rotation.set(0, 0, -0.2); }
    S.boardLight = new THREE.PointLight('#ffd8a8', 2.5, 6, 1.3); S.boardLight.position.set(0, 2.8, 0); G.add(S.boardLight);
  }

  // ===================================================== CELL =====================================================
  {
    const G = addG('cell');
    const conc = tm(concreteC(81, 52), 2, 1, '#b8bcc4');
    plane(6, 6, tm(concreteC(82, 40), 3, 3), 0, 0, 0, G, 0, -Math.PI / 2);
    plane(5, 3.4, conc, 0, 1.7, -2.2, G); for (const sx of [-1, 1]) plane(6, 3.4, conc, sx * 2.5, 1.7, 0.5, G, -sx * Math.PI / 2);
    plane(5, 6, toon({ color: '#5a5e66' }), 0, 3.4, 0.5, G, 0, Math.PI / 2);
    const bunk = new THREE.Group(); bunk.position.set(-0.6, 0, -1.6); G.add(bunk);
    add(tbox(2.2, 0.08, 0.95, 1), M.steelD, 0, 0.55, 0, bunk); add(tbox(2.1, 0.14, 0.88, 1), toon({ color: '#8a8a7a' }), 0, 0.66, 0, bunk); add(tbox(0.5, 0.14, 0.6, 1), M.white, -0.8, 0.79, 0, bunk);
    add(tbox(2.2, 0.08, 0.95, 1), M.steelD, 0, 2.0, 0, bunk); add(tbox(2.1, 0.14, 0.88, 1), toon({ color: '#7a7a6a' }), 0, 2.1, 0, bunk);
    for (const sx of [-1.08, 1.08]) for (const sz of [-0.45, 0.45]) add(tbox(0.06, 2.4, 0.06, 1), M.steelD, sx, 1.2, sz, bunk);
    add(tbox(0.5, 0.45, 0.5, 1), M.steel, 1.5, 0.22, -1.8, G);
    add(tbox(0.8, 0.5, 0.05, 1), toon({ color: '#a8c0e8', emissive: '#8aa8e0', emissiveIntensity: 1.2 }), 0.6, 2.75, -2.17, G, { cast: false });
    for (let k = 0; k < 4; k++) add(tbox(0.04, 0.5, 0.06, 1), M.black, 0.36 + k * 0.16, 2.75, -2.14, G, { cast: false });
    { const sh = shaft(0.9, 3.6, '170,200,255', 0.3, G); sh.position.set(0.1, 1.6, -1.2); sh.rotation.set(-0.75, 0, 0.18); }
    { const pr = add(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshBasicMaterial({ map: canvasTex(256, 160, (g, W, H) => { g.fillStyle = 'rgba(160,190,255,.5)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; for (let k = 0; k < 4; k++) g.fillRect(40 + k * 50, 0, 12, H); }), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), -0.4, 0.74, -1.5, G, { cast: false }); pr.rotation.x = -Math.PI / 2; pr.userData.ndSkip = true; }
    S.cellLight = new THREE.PointLight('#a8c0ff', 2.2, 5, 1.3); S.cellLight.position.set(0.2, 2.4, -1.3); G.add(S.cellLight);
    const bars = new THREE.Group(); G.add(bars); S.cellBars = bars;
    for (let k = 0; k < 9; k++) add(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 8), M.steelD, -1.0 + k * 0.25, 1.6, 0, bars);
    for (const y of [0.1, 1.2, 3.1]) add(tbox(2.2, 0.06, 0.06, 1), M.steelD, 0, y, 0, bars);
    bars.position.set(0, 0, 1.6);
    for (const x of [-2.25, 2.25]) add(tbox(0.5, 3.4, 0.2, 1), conc, x, 1.7, 1.6, G);
  }
};

// ---------------------------------------------------------------------------------------------------------------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const update = (ctx, W, f) => {
  const { THREE } = ctx;
  for (const k of Object.keys(SETS)) if (S[k]) S[k].visible = k === W.set;
  const d = S.dummy;
  if (W.set === 'vault') {
    S.vaultHinge.rotation.y = (W.door ?? 0) * 1.75;
    S.vaultWheel.rotation.z = (W.wheel || 0);
    S.dial.rotation.z = W.dial || 0;
    S.radarDish.rotation.y = f * 0.12;
    S.secLights.forEach((m, i) => { m.material = i < (W.sec ?? 10) ? S.M.red : S.M.off; });
    S.doors.forEach(({ piv, i, j }) => { const ord = (i + (5 - j) * 0.35) / 12; const t = W.allOpen ? 1 : clamp(((W.domino ?? 0) - ord * 0.75) / 0.18); const e = t < 1 ? 1 - Math.pow(1 - t, 3) : 1; piv.rotation.y = e * 1.7; });
    S.drawers.forEach((dr, k) => { dr.position.x = -4.5 + 0.02 + (W.allOpen ? 0.35 + (k % 3) * 0.12 : 0); });
    S.hook.position.z = -5 + 0.02 + (W.hook || 0) * 0.62;
    S.hookGems.forEach((m, k) => { m.visible = (W.hookFill ?? 1) > k / 26; m.rotation.y = f * 0.05 + k; });
    const fl = S.flyGems, n = fl.count, gt = W.gush;
    for (let i = 0; i < n; i++) {
      let vis = false;
      if (gt !== undefined && gt >= 0) { const t0 = (i % 40) / 40 * 0.9, t = gt - t0; if (t > 0) { vis = true; const a = i * 2.39, sp = 0.9 + ((i * 37) % 10) / 10;
        const ox = 0.3, oy = 1.37, oz = -5 + 0.02 + (W.hook || 0) * 0.62 - 0.25; const vx = Math.cos(a) * 0.9 * sp, vz = 1.2 + Math.sin(a * 1.3) * 0.5, vy = 2.4 * sp;
        const y = oy + vy * t - 4.9 * t * t; d.position.set(ox + vx * t, Math.max(0.03, y), oz + vz * t); d.rotation.set(t * 9 + i, t * 7, i); d.scale.setScalar(0.034 * (0.8 + (i % 3) * 0.2)); } }
      else if (W.bagFill !== undefined) { const t0 = (i % 30) / 30, t = clamp(W.bagFill * 1.3 - t0 * 0.6, 0, 1); if (t > 0 && t < 1) { vis = true; const b = S.bags[i % 3].position; const sx = b.x + Math.cos(i) * 0.6, sz = b.z + 0.8; d.position.set(sx + (b.x - sx) * t, b.y + 0.5 + 1.0 * (1 - t) + 0.6 * Math.sin(t * Math.PI), sz + (b.z - sz) * t); d.rotation.set(t * 8 + i, i, t * 5); d.scale.setScalar(0.022); } }
      if (!vis) { d.position.set(0, -50, 0); d.rotation.set(0, 0, 0); d.scale.setScalar(0.0001); }
      d.updateMatrix(); fl.setMatrixAt(i, d.matrix);
    }
    fl.instanceMatrix.needsUpdate = true;
    S.bags.forEach((b) => { b.visible = !!W.bags; b.userData.fill.forEach((m, i) => { m.visible = (W.bagFill ?? 1) * 14 > i; m.rotation.y = f * 0.04 + i; }); });
    const L = W.lamps || [];
    S.lampLights.forEach((l, i) => { if (L[i]) { l.intensity = L[i].k ?? 5; l.position.set(...L[i].p); } else l.intensity = 0; });
    S.vaultCones.forEach((c, i) => { if (L[i] && L[i].cone !== false) { c.visible = true; c.position.set(...L[i].p); const v = new THREE.Vector3(...L[i].dir).normalize(); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), v); c.material.opacity = L[i].ca ?? 1; } else c.visible = false; });
    S.gemLight.intensity = W.gemLight || 0; if (W.gemLightP) S.gemLight.position.set(...W.gemLightP);
    S.doorShaft.visible = (W.door ?? 0) > 0.05 && W.shaftK !== 0; S.doorShaft.material.opacity = clamp((W.door ?? 0) * 1.5) * (W.shaftK ?? 1);
    S.lone.visible = !!W.lone; if (W.lone) { S.lone.position.set(...W.lone.p); S.lone.rotation.set(W.lone.r || 0, f * 0.05, W.lone.rz || 0); }
  }
  if (W.set === 'building') { S.cab.position.y = W.cabY ?? 0; }
  if (W.set === 'office') { S.officeDoor.rotation.y = (W.officeDoor || 0) * 1.6; S.key.visible = !!W.key; if (W.key) { S.key.position.set(...W.key.p); S.key.rotation.set(W.key.r || 0, W.key.ry || 0, W.key.rz || 0); S.key.scale.setScalar(W.key.s || 1); } S.heroGem.rotation.y = f * 0.04; }
  if (W.set === 'forest') {
    const cz = W.carZ ?? -999; S.car.visible = cz > -998; S.car.position.set(W.carX ?? 0.9, 0, cz); S.wheels.forEach((w) => { w.rotation.x = -cz * 2.8; });
    S.headCones.forEach((c) => { c.visible = !!W.night; }); S.carWinR.visible = !W.winOpen; S.carLights.forEach((l) => { l.intensity = W.night ? 6 : 0; });
    const B = W.bag; S.bag.visible = !!B && !B.open; S.bagOpen.visible = !!B && !!B.open;
    if (B) { const o = B.open ? S.bagOpen : S.bag; o.position.set(...B.p); o.rotation.set(B.r || 0, B.ry || 0, B.rz || 0); o.scale.setScalar(B.s || 1); }
    S.envelopes.forEach((e, k) => { const E = W.env && W.env[k]; e.visible = !!E; if (E) { e.position.set(...E.p); e.rotation.set(E.r || 0, E.ry || 0, E.rz || 0); } });
    S.cassette.visible = !!W.cas; if (W.cas) { S.cassette.position.set(...W.cas.p); S.cassette.rotation.set(W.cas.r || 0, W.cas.ry || 0, W.cas.rz || 0); }
    S.forestShafts.forEach((s) => { s.visible = !W.night; });
    S.mist.forEach((m, i) => { m.visible = !W.night; m.material.opacity = 0.22; m.position.z = ((i * 3.5 + f * 0.01) % 90 + 90) % 90 - 40; });
  }
  if (W.set === 'car') {
    S.passing.forEach((p) => { p.m.position.z = 6 - (((p.ph + f * 0.045) % 1) * 12); });
    const sw = ((f * 0.02) % 1); S.carSweep.intensity = sw < 0.25 ? Math.sin(sw / 0.25 * Math.PI) * 5 : 0; S.carSweep.position.set(-2.4, 2, 4 - sw * 16);
  }
  if (W.set === 'lab') { S.dna.rotation.y = f * 0.03; const k = W.dnaFlash || 0; S.dnaGlowMats.forEach((m, i) => { m.emissiveIntensity = (i === 2 ? 0.9 : 1.4) + k * 2.5; }); S.dnaLight.intensity = 2 + k * 6; }
  if (W.set === 'board') {
    const lp = W.lastPhoto || {}, p = S.lastPhotoPos; S.lastPhoto.position.set(p[0] + (lp.x || 0), p[1] + (lp.y || 0), p[2] + (lp.z || 0)); S.lastPhoto.rotation.set(0, 0, lp.rz ?? 0.05);
    S.lastPin.position.set(p[0] + (lp.x || 0), p[1] + (lp.y || 0) + 0.22, p[2] + 0.02 + (lp.z || 0)); S.lastPin.visible = !!W.pinIn;
    S.strings.forEach((m, i) => { const t = clamp((W.strings || 0) * 6 - i); m.scale.set(1, Math.max(0.001, t * m.userData.len), 1); m.visible = t > 0.01; });
  }
  if (W.set === 'cell') { S.cellBars.position.x = W.bars ?? 0; }
};
