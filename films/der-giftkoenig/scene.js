// scene.js — "Der Giftkönig": nine places, each its own group spread along x, toggled per shot.
// Ancient Black Sea kingdom (Hellenic + Persian mix): marble, gold, purple and navy fabrics, phosphor-green poison,
// candle orange at night. All visible writing is German: "Gift" (+ skull), "Gegengift", "Mithridatismus".
export const OX = { hall: 0, feast: 400, corr: 800, bal: 1200, void: 1600, lab: 2000, ban: 2400, tent: 2800, mus: 3200 };
let S = {};
export const getS = () => S;

export const build = (ctx) => {
  const { THREE, P, world, add, tbox, toon, texM, canvasTex, waterMat, waterNd } = ctx;
  const R = P.rng(7);
  const G = {}; for (const k in OX) { G[k] = new THREE.Group(); G[k].position.x = OX[k]; world.add(G[k]); } S.G = G;
  const basic = (o) => new THREE.MeshBasicMaterial(o);
  const glowTex = (rgb) => canvasTex(256, 256, (c) => { const r = c.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, `rgba(${rgb},1)`); r.addColorStop(0.35, `rgba(${rgb},.45)`); r.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = r; c.fillRect(0, 0, 256, 256); });
  const GT = { warm: glowTex('255,200,120'), green: glowTex('110,255,130'), moon: glowTex('190,210,255'), white: glowTex('255,250,235'), amber: glowTex('255,190,80'), red: glowTex('255,120,70') };
  S.bills = [];
  const glow = (tex, s, x, y, z, parent, op = 1) => { const m = add(new THREE.PlaneGeometry(s, s), basic({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: op, fog: false }), x, y, z, parent, { cast: false }); m.userData.ndSkip = true; m.renderOrder = 4; S.bills.push(m); return m; };
  const shaftTex = canvasTex(128, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); const g2 = c.createLinearGradient(0, 0, w, 0); g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(0.25, 'rgba(0,0,0,0)'); g2.addColorStop(0.75, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)'); c.globalCompositeOperation = 'destination-out'; c.fillStyle = g2; c.fillRect(0, 0, w, h); });
  const shaft = (w, len, col, op, x, y, z, rx, ry, rz, parent) => { const geo = new THREE.PlaneGeometry(w, len); geo.translate(0, -len / 2, 0); const m = add(geo, basic({ map: shaftTex, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }), x, y, z, parent, { cast: false });
    m.rotation.set(rx, ry, rz); m.userData.ndSkip = true; m.renderOrder = 3; return m; };
  const label = (w, h, fn, x, y, z, parent, ry = 0) => { const k = Math.min(4000, 1400 / Math.max(w, h)); const t = canvasTex(Math.round(w * k), Math.round(h * k), fn); const m = add(new THREE.PlaneGeometry(w, h), basic({ map: t, transparent: true, fog: false }), x, y, z, parent, { cast: false }); m.rotation.y = ry; m.userData.ndSkip = true; return m; };
  const skull = (c, x, y, s, col = '#1a1416') => { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round';
    c.lineWidth = 12; c.beginPath(); c.moveTo(-40, 30); c.lineTo(40, 70); c.moveTo(40, 30); c.lineTo(-40, 70); c.stroke();
    c.beginPath(); c.arc(0, 0, 34, Math.PI * 0.82, Math.PI * 2.18); c.lineTo(18, 40); c.lineTo(-18, 40); c.closePath(); c.fill();
    c.fillStyle = '#f4ead2'; c.beginPath(); c.arc(-13, 2, 9, 0, 7); c.arc(13, 2, 9, 0, 7); c.fill(); c.beginPath(); c.moveTo(0, 14); c.lineTo(-5, 23); c.lineTo(5, 23); c.fill(); c.restore(); };
  const serif = (px) => `bold ${px}px Georgia, "DejaVu Serif", serif`;

  const MT = {
    marble: texM(P.marble(10), 1, 1), marbleF: texM(P.marble(31), 8, 14), marbleW: texM(P.marble(12), 3, 2), gold: toon({ color: '#e8b843' }), goldD: toon({ color: '#b8862e' }),
    purple: toon({ color: '#6a2a8a', side: THREE.DoubleSide }), purpleD: toon({ color: '#4a1a66', side: THREE.DoubleSide }),
    wood: texM(P.planks(3), 1, 2, '#a07048'), woodD: toon({ color: '#5a3a24' }), stone: texM(P.stone(4, 30, 10, 52), 3, 3), stoneD: texM(P.stone(14, 30, 8, 40), 4, 3),
    iron: toon({ color: '#3a3836' }), copper: toon({ color: '#c06a34' }), copperD: toon({ color: '#8a4422' }), silver: toon({ color: '#d4d8e0' }), red: toon({ color: '#b8282b', side: THREE.DoubleSide }),
    green: toon({ color: '#4dff6a', emissive: '#2ae04a', emissiveIntensity: 0.9 }), flame: toon({ color: '#fff0b0', emissive: '#ffb040', emissiveIntensity: 1.6 }), wax: toon({ color: '#f4ead2', emissive: '#5a4020', emissiveIntensity: 0.5 }), dark: toon({ color: '#1a1622' }),
  };
  S.MT = MT;
  const goblet = (parent, x, y, z, k = 1, liquid = MT.green, metal = MT.gold) => { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(k); parent.add(g);
    add(new THREE.CylinderGeometry(0.07, 0.08, 0.012, 16), metal, 0, 0.006, 0, g); add(new THREE.CylinderGeometry(0.012, 0.016, 0.1, 8), metal, 0, 0.06, 0, g);
    add(new THREE.SphereGeometry(0.022, 10, 8), metal, 0, 0.1, 0, g); const cup = add(new THREE.CylinderGeometry(0.075, 0.03, 0.1, 18, 1, true), metal, 0, 0.16, 0, g); cup.material = metal.clone(); cup.material.side = THREE.DoubleSide;
    if (liquid) add(new THREE.CylinderGeometry(0.07, 0.07, 0.006, 18), liquid, 0, 0.2, 0, g, { cast: false });
    const ring = add(new THREE.TorusGeometry(0.075, 0.008, 6, 20), metal, 0, 0.21, 0, g); ring.rotation.x = Math.PI / 2; return g; };
  const candle = (parent, x, y, z, h = 0.3) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    add(new THREE.CylinderGeometry(0.09, 0.11, 0.03, 14), MT.goldD, 0, 0.015, 0, g); add(new THREE.CylinderGeometry(0.035, 0.038, h, 12), MT.wax, 0, h / 2 + 0.03, 0, g);
    add(new THREE.CylinderGeometry(0.003, 0.003, 0.03, 4), MT.dark, 0, h + 0.045, 0, g); const fl = add(new THREE.SphereGeometry(0.018, 8, 6), MT.flame, 0, h + 0.075, 0, g, { cast: false }); fl.scale.y = 2.2; g.userData.fl = fl; g.userData.top = h + 0.07; return g; };
  const lamp = (parent, x, y, z, chain = 2) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    for (let i = 0; i < 10; i++) { const l = add(new THREE.TorusGeometry(0.04, 0.008, 4, 8), MT.goldD, 0, -i * chain / 10, 0, g, { cast: false }); l.rotation.y = i * 1.57; }
    const b = add(new THREE.SphereGeometry(0.28, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon({ color: '#e8b843', side: THREE.DoubleSide }), 0, -chain - 0.05, 0, g);
    add(new THREE.TorusGeometry(0.28, 0.025, 6, 20), MT.goldD, 0, -chain - 0.05, 0, g).rotation.x = Math.PI / 2;
    const fl = add(new THREE.SphereGeometry(0.05, 8, 6), MT.flame, 0, -chain + 0.04, 0, g, { cast: false }); fl.scale.y = 2;
    g.userData.glow = glow(GT.warm, 1.6, 0, -chain + 0.08, 0, g, 0.9); return g; };
  S.curtains = [];
  const curtain = (parent, x, z, w, h, mat, ry = 0, y0 = 0) => { const geo = new THREE.PlaneGeometry(w, h, 24, 6); const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 7) * 0.09); geo.computeVertexNormals();
    const m = add(geo, mat, x, y0 + h / 2, z, parent); m.rotation.y = ry; m.userData.base = geo.attributes.position.array.slice(); m.userData.h = h; m.userData.grp = parent; S.curtains.push(m); return m; };
  const flute = toon({ color: '#d8ccb8' });
  const column = (parent, x, z, h = 7, r = 0.42) => { const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    add(tbox(r * 2.6, 0.3, r * 2.6, 1), MT.marble, 0, 0.15, 0, g); add(new THREE.CylinderGeometry(r * 1.1, r * 1.15, 0.22, 18), MT.marble, 0, 0.41, 0, g);
    add(new THREE.CylinderGeometry(r * 0.92, r, h - 1.1, 20), MT.marble, 0, 0.52 + (h - 1.1) / 2, 0, g);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; add(new THREE.CylinderGeometry(0.03, 0.03, h - 1.2, 4), flute, Math.cos(a) * r * 0.93, 0.52 + (h - 1.1) / 2, Math.sin(a) * r * 0.93, g, { cast: false }); }
    add(new THREE.CylinderGeometry(r * 1.25, r * 0.95, 0.35, 18), MT.gold, 0, h - 0.4, 0, g); add(tbox(r * 2.8, 0.25, r * 2.8, 1), MT.marble, 0, h - 0.1, 0, g);
    for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.16, 0.06, 6, 14), MT.gold, s * r * 1.1, h - 0.45, 0, g);
    return g; };

  // =====================================================================================
  // M1 / M8 — THRONE HALL
  {
    const g = G.hall;
    const fl = add(new THREE.PlaneGeometry(16, 36), MT.marbleF, 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const run = canvasTex(256, 1024, (c, w, h) => { c.fillStyle = '#1e2a5a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8b843'; c.lineWidth = 14; c.strokeRect(14, -10, w - 28, h + 20);
      for (let y = 60; y < h; y += 120) { c.fillStyle = '#e8b843'; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? 14 : 36; c.lineTo(w / 2 + r * Math.cos(a), y + r * Math.sin(a)); } c.fill(); } });
    const rn = add(new THREE.PlaneGeometry(2.6, 28), toon({ map: run }), 0, 0.012, -1, g, { cast: false }); rn.rotation.x = -Math.PI / 2;
    for (let z = -12; z <= 12; z += 4) for (const x of [-4.6, 4.6]) column(g, x, z);
    add(tbox(0.5, 9, 34, 3), MT.marbleW, -7.6, 4.5, 0, g, { cast: false });
    for (let z = -13; z <= 13; z += 4) curtain(g, -7.2, z, 3.2, 6.6, z % 8 === 0 ? MT.purpleD : MT.purple, Math.PI / 2, 0.2);
    const frieze = canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#2a2a6a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8b843'; for (let x = 0; x < w; x += 64) { c.beginPath(); c.moveTo(x, h * 0.8); c.lineTo(x + 32, h * 0.2); c.lineTo(x + 64, h * 0.8); c.fill(); } c.fillRect(0, 0, w, 10); c.fillRect(0, h - 10, w, 10); });
    frieze.wrapS = THREE.RepeatWrapping; frieze.repeat.set(8, 1);
    for (const [x, ry] of [[-7.3, Math.PI / 2], [7.25, -Math.PI / 2]]) { const fz = add(new THREE.PlaneGeometry(34, 0.8), toon({ map: frieze }), x, 7.6, 0, g, { cast: false }); fz.rotation.y = ry; }
    // right wall with three big arched windows to the Black Sea
    const wallShape = new THREE.Shape(); wallShape.moveTo(-17, 0); wallShape.lineTo(17, 0); wallShape.lineTo(17, 9); wallShape.lineTo(-17, 9); wallShape.lineTo(-17, 0);
    for (const zc of [-8, 0, 8]) { const h = new THREE.Path(); h.moveTo(-zc - 1.6, 1.0); h.lineTo(-zc + 1.6, 1.0); h.lineTo(-zc + 1.6, 4.8); h.absarc(-zc, 4.8, 1.6, 0, Math.PI, false); h.lineTo(-zc - 1.6, 1.0); wallShape.holes.push(h); }
    const wg = new THREE.ExtrudeGeometry(wallShape, { depth: 0.6, bevelEnabled: false }); const ww = add(wg, MT.marbleW, 7.3, 0, 0, g, { cast: false }); ww.rotation.y = Math.PI / 2;
    S.hallPools = []; S.hallShafts = [];
    for (const zc of [-8, 0, 8]) {
      const fr = add(new THREE.TorusGeometry(1.62, 0.07, 6, 24, Math.PI), MT.gold, 7.25, 4.8, zc, g, { cast: false }); fr.rotation.y = Math.PI / 2;
      for (const s of [-1, 1]) add(tbox(0.14, 3.8, 0.14, 1), MT.gold, 7.25, 2.9, zc + s * 1.62, g, { cast: false });
      add(tbox(0.9, 0.18, 3.6, 1), MT.marble, 7.0, 0.95, zc, g, { cast: false });
      const pool = add(new THREE.PlaneGeometry(3.0, 5.2), basic({ map: GT.white, color: '#ffe8c0', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), 3.6, 0.03, zc, g, { cast: false });
      pool.rotation.x = -Math.PI / 2; pool.userData.ndSkip = true; S.hallPools.push(pool);
      S.hallShafts.push(shaft(3.0, 9, '#fff0d0', 0.16, 7.2, 5.6, zc, 0, 0, -0.85, g));
    }
    const sea = add(new THREE.PlaneGeometry(900, 900), waterMat, 300, -10, 0, g, { cast: false }); sea.rotation.x = -Math.PI / 2; sea.userData.nd = waterNd;
    for (let i = 0; i < 6; i++) { const h = add(new THREE.SphereGeometry(40 + R() * 30, 16, 8), toon({ color: i % 2 ? '#6a8aa8' : '#7a98b4' }), 220 + R() * 120, -16, -200 + i * 80, g, { cast: false }); h.scale.y = 0.35; }
    const ceil = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#1a2250'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c8962e'; c.lineWidth = 16; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 128, 0); c.lineTo(i * 128, h); c.moveTo(0, i * 128); c.lineTo(w, i * 128); c.stroke(); }
      c.fillStyle = '#f0c850'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, r = k % 2 ? 9 : 22; c.lineTo(64 + i * 128 + r * Math.cos(a), 64 + j * 128 + r * Math.sin(a)); } c.fill(); } });
    ceil.wrapS = ceil.wrapT = THREE.RepeatWrapping; ceil.repeat.set(4, 9);
    const ce = add(new THREE.PlaneGeometry(16, 36), toon({ map: ceil, side: THREE.DoubleSide }), 0, 8.8, 0, g, { cast: false }); ce.rotation.x = Math.PI / 2; ce.castShadow = false;
    S.hallLamps = []; for (let z = -10; z <= 10; z += 5) for (const x of [-2.4, 2.4]) S.hallLamps.push(lamp(g, x, 8.8, z, 2.6));
    // the DOORS (z = -15)
    const doorTex = canvasTex(512, 1280, (c, w, h) => { c.fillStyle = '#6a3a1e'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 40) { c.fillStyle = `rgba(0,0,0,${0.08 + 0.08 * ((x / 40) % 2)})`; c.fillRect(x, 0, 20, h); }
      c.strokeStyle = '#e8b843'; c.lineWidth = 22; c.strokeRect(30, 30, w - 60, h - 60); c.lineWidth = 12; c.strokeRect(80, 120, w - 160, 460); c.strokeRect(80, 680, w - 160, 480);
      c.fillStyle = '#e8b843'; for (let y = 60; y < h; y += 70) for (const x of [55, w - 55]) { c.beginPath(); c.arc(x, y, 10, 0, 7); c.fill(); }
      c.save(); c.translate(w / 2, 350); c.beginPath(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, r = k % 2 ? 50 : 120; c.lineTo(r * Math.cos(a), r * Math.sin(a)); } c.fill(); c.fillStyle = '#6a2a8a'; c.beginPath(); c.arc(0, 0, 40, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#e8b843'; c.beginPath(); c.arc(w / 2, 920, 70, 0, 7); c.fill(); c.fillStyle = '#6a3a1e'; c.beginPath(); c.arc(w / 2, 920, 45, 0, 7); c.fill(); });
    const dm = toon({ map: doorTex }), de = toon({ color: '#5a3a24' });
    S.doors = [-1, 1].map((s) => { const piv = new THREE.Group(); piv.position.set(s * 2.6, 0, -15); g.add(piv);
      add(tbox(2.6, 6.6, 0.28, 2), [de, de, de, de, dm, dm], -s * 1.3, 3.3, 0, piv);
      add(new THREE.TorusGeometry(0.22, 0.045, 8, 20), MT.gold, -s * 2.2, 3.0, 0.2, piv); return piv; });
    add(tbox(0.7, 7.4, 0.9, 1), MT.marble, -2.95, 3.7, -15, g); add(tbox(0.7, 7.4, 0.9, 1), MT.marble, 2.95, 3.7, -15, g); add(tbox(6.6, 0.8, 1.0, 1), MT.gold, 0, 7.4, -15, g);
    for (let i = -3; i <= 3; i++) add(tbox(0.5, 0.5, 0.6, 1), MT.gold, i * 0.9, 8.05, -15, g);
    for (const s of [-1, 1]) add(tbox(4.4, 9, 0.6, 3), MT.marbleW, s * 5.4, 4.5, -15.1, g, { cast: false });
    add(tbox(6, 1.4, 0.6, 3), MT.marbleW, 0, 8.4, -15.1, g, { cast: false });
    const yard = canvasTex(1024, 700, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ab4f0'); gr.addColorStop(0.55, '#fff2d8'); gr.addColorStop(1, '#ffe0a8'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      const sg = x.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, 300); sg.addColorStop(0, 'rgba(255,255,240,1)'); sg.addColorStop(1, 'rgba(255,255,240,0)'); x.fillStyle = sg; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(214,180,120,0.75)'; x.fillRect(0, h * 0.62, w, h * 0.38); x.fillStyle = 'rgba(200,160,100,0.55)';
      for (let i = 0; i < 9; i++) { const cx = 40 + i * 120; x.fillRect(cx, h * 0.3, 34, h * 0.34); x.fillRect(cx - 12, h * 0.28, 58, 16); } x.fillRect(0, h * 0.24, w, 30);
      x.fillStyle = 'rgba(120,40,140,0.6)'; for (const cx of [150, 870]) { x.fillRect(cx, h * 0.3, 60, 150); x.beginPath(); x.moveTo(cx, h * 0.3 + 150); x.lineTo(cx + 30, h * 0.3 + 190); x.lineTo(cx + 60, h * 0.3 + 150); x.fill(); } });
    const out = add(new THREE.PlaneGeometry(30, 20), basic({ map: yard, fog: false }), 0, 6, -24, g, { cast: false }); out.userData.ndSkip = true;
    const outFloor = add(new THREE.PlaneGeometry(16, 10), toon({ color: '#f4e4c4' }), 0, 0.005, -20, g, { cast: false }); outFloor.rotation.x = -Math.PI / 2;
    S.doorShaft = shaft(5.0, 16, '#fff2d0', 0.0, 0, 6.8, -15.3, -1.15, 0, 0, g);
    S.doorGlow = glow(GT.white, 10, 0, 3.3, -15.8, g, 0);
    // dais + throne (z = +12)
    for (let k = 0; k < 3; k++) add(tbox(7 - k * 1.4, 0.3, 5 - k * 1.0, 1), k % 2 ? MT.marble : toon({ color: '#ece2cf' }), 0, 0.15 + k * 0.3, 13 - k * 0.3, g);
    const th = new THREE.Group(); th.position.set(0, 0.9, 13.4); g.add(th); S.throne = th;
    add(tbox(1.9, 0.6, 1.3, 1), MT.gold, 0, 0.3, 0, th); add(tbox(1.7, 0.18, 1.1, 1), toon({ color: '#6a2a8a' }), 0, 0.66, -0.05, th);
    add(tbox(1.9, 2.6, 0.25, 1), MT.gold, 0, 1.6, 0.55, th); add(tbox(1.5, 2.0, 0.1, 1), toon({ color: '#6a2a8a' }), 0, 1.55, 0.42, th);
    const sunD = add(new THREE.CircleGeometry(0.45, 24), MT.gold, 0, 2.55, 0.36, th, { cast: false }); sunD.rotation.y = Math.PI;
    for (const s of [-1, 1]) { add(tbox(0.25, 0.9, 1.3, 1), MT.goldD, s * 0.95, 0.85, 0, th); add(new THREE.SphereGeometry(0.17, 12, 10), MT.gold, s * 0.95, 1.35, -0.55, th); add(new THREE.ConeGeometry(0.1, 0.4, 8), MT.gold, s * 0.95, 3.05, 0.55, th); }
    const bn = canvasTex(256, 640, (c, w, h) => { c.fillStyle = '#5a1e7a'; c.fillRect(0, 0, w, h - 60); c.beginPath(); c.moveTo(0, h - 60); c.lineTo(w / 2, h); c.lineTo(w, h - 60); c.fill();
      c.fillStyle = '#e8b843'; c.save(); c.translate(w / 2, 260); c.beginPath(); for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12, r = k % 2 ? 50 : 100; c.lineTo(r * Math.cos(a), r * Math.sin(a)); } c.fill(); c.fillStyle = '#5a1e7a'; c.beginPath(); c.arc(0, 0, 36, 0, 7); c.fill(); c.restore();
      c.fillRect(0, 0, w, 16); c.fillRect(14, 0, 10, h - 60); c.fillRect(w - 24, 0, 10, h - 60); });
    for (const x of [-2.8, 2.8, 0]) { const b = add(new THREE.PlaneGeometry(x === 0 ? 2.4 : 1.6, x === 0 ? 6 : 4.4), toon({ map: bn, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5 }), x, x === 0 ? 5.6 : 4.6, 15.6, g, { cast: false }); b.rotation.y = Math.PI; }
    add(tbox(16, 9, 0.5, 3), MT.marbleW, 0, 4.5, 16.2, g, { cast: false });
    const cr = new THREE.Group(); cr.position.set(0, 1.62, 13.3); g.add(cr); S.hallCrown = cr;
    add(new THREE.CylinderGeometry(0.2, 0.2, 0.09, 24, 1, true), toon({ color: '#f0c43a', side: THREE.DoubleSide }), 0, 0.045, 0, cr);
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; add(new THREE.ConeGeometry(0.035, 0.12, 6), MT.gold, Math.cos(a) * 0.2, 0.15, Math.sin(a) * 0.2, cr); add(new THREE.SphereGeometry(0.018, 8, 6), toon({ color: '#3ad06a' }), Math.cos(a) * 0.21, 0.05, Math.sin(a) * 0.21, cr); }
    S.crownGlow = glow(GT.moon, 1.2, 0, 1.75, 13.2, g, 0.5);
    // council table (shot 5)
    const tb = new THREE.Group(); tb.position.set(-3.0, 0, 3.0); g.add(tb); S.council = tb;
    add(tbox(2.6, 0.16, 1.3, 1), MT.marble, 0, 1.0, 0, tb); for (const s of [-1, 1]) add(tbox(0.3, 0.92, 1.0, 1), MT.marble, s * 1.0, 0.46, 0, tb);
    S.councilProps = [add(tbox(1.0, 0.02, 0.7, 1), toon({ color: '#e8d8b0' }), 0.2, 1.09, 0.1, tb)];
    S.councilProps.push(goblet(tb, -0.8, 1.08, 0.2, 1.2, toon({ color: '#8a1a3a' })), goblet(tb, 0.9, 1.08, -0.2, 1.2, toon({ color: '#8a1a3a' })));
    S.councilLamp = lamp(g, -3.0, 8.8, 3.0, 5.6);
    // ending candle (M8) in the foreground
    const cst = new THREE.Group(); cst.position.set(-0.9, 0, 9.2); g.add(cst); S.endCandleG = cst;
    add(new THREE.CylinderGeometry(0.04, 0.06, 1.2, 10), MT.goldD, 0, 0.6, 0, cst); add(new THREE.CylinderGeometry(0.25, 0.3, 0.06, 16), MT.goldD, 0, 0.03, 0, cst);
    S.endCandle = candle(cst, 0, 1.2, 0, 0.32); S.endGlow = glow(GT.warm, 1.6, -0.9, 1.62, 9.2, g, 0.8);
  }

  // =====================================================================================
  // M2 — FLASHBACK FEAST (sepia grade)
  {
    const g = G.feast;
    const fl = add(new THREE.PlaneGeometry(30, 30), MT.marbleF, 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(30, 8, 0.5, 3), MT.marbleW, 0, 4, -7, g, { cast: false }); add(tbox(0.5, 8, 30, 3), MT.marbleW, -5, 4, 0, g, { cast: false });
    for (let z = -6; z <= 6; z += 3) curtain(g, -4.7, z, 2.6, 6, MT.purple, Math.PI / 2, 0.3);
    for (const x of [-3, 3]) column(g, x, -6.2, 7, 0.38);
    add(tbox(1.8, 0.12, 9, 2), MT.wood, 0, 0.9, 0, g); for (const z of [-4, 0, 4]) for (const s of [-1, 1]) add(tbox(0.14, 0.84, 0.14, 1), MT.woodD, s * 0.75, 0.42, z, g);
    add(tbox(0.9, 0.02, 9.2, 1), MT.purple, 0, 0.97, 0, g, { cast: false });
    const fruitM = [toon({ color: '#d8343a' }), toon({ color: '#e8a030' }), toon({ color: '#7ab040' }), toon({ color: '#6a2a8a' })];
    for (let z = -3; z <= 4; z += 1.6) { add(new THREE.CylinderGeometry(0.28, 0.18, 0.08, 18), MT.gold, 0.1, 1.0, z, g);
      for (let k = 0; k < 6; k++) add(new THREE.SphereGeometry(0.07 + R() * 0.03, 10, 8), fruitM[k % 4], 0.1 + Math.cos(k) * 0.14, 1.08 + (k % 2) * 0.06, z + Math.sin(k) * 0.14, g);
      const jug = add(new THREE.SphereGeometry(0.14, 12, 10), toon({ color: '#c0703a' }), -0.5, 1.12, z + 0.5, g); jug.scale.y = 1.4; add(new THREE.CylinderGeometry(0.05, 0.07, 0.15, 10), toon({ color: '#c0703a' }), -0.5, 1.36, z + 0.5, g);
      goblet(g, 0.55, 0.96, z + 0.3, 1.1, toon({ color: '#8a1a3a' })); }
    add(tbox(1.3, 0.12, 1.0, 1), MT.gold, 0, 0.6, -5.0, g); add(tbox(1.3, 2.4, 0.15, 1), MT.gold, 0, 1.8, -5.5, g); add(tbox(1.1, 1.8, 0.05, 1), MT.purple, 0, 1.75, -5.42, g);
    S.fbGoblet = goblet(g, 0.55, 0.96, -4.0, 1.4, toon({ color: '#3a1a10' }));
    const cr = new THREE.Group(); g.add(cr); S.fbCrown = cr; const ci = new THREE.Group(); cr.add(ci); S.fbCrownI = ci;
    add(new THREE.CylinderGeometry(0.26, 0.26, 0.14, 26, 1, true), toon({ color: '#f0c43a', side: THREE.DoubleSide }), 0, 0, 0, ci);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; add(new THREE.ConeGeometry(0.05, 0.16, 6), MT.gold, Math.cos(a) * 0.26, 0.15, Math.sin(a) * 0.26, ci); add(new THREE.SphereGeometry(0.03, 8, 6), toon({ color: k % 2 ? '#e0383a' : '#3a7be0' }), Math.cos(a) * 0.27, 0.0, Math.sin(a) * 0.27, ci); }
    lamp(g, 0, 7.8, -2, 3.6); lamp(g, 0, 7.8, 2.5, 3.6);
  }

  // =====================================================================================
  // M3 — SHADOWY CORRIDOR
  {
    const g = G.corr;
    const fl = add(new THREE.PlaneGeometry(8, 30), texM(P.stone(24, 34, 10, 40, 128, 128), 4, 15), 0, 0, -6, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    for (const s of [-1, 1]) add(tbox(0.5, 6, 30, 3), MT.stoneD, s * 2.8, 3, -6, g, { cast: false });
    const ce = add(new THREE.PlaneGeometry(8, 30), MT.dark, 0, 6, -6, g, { cast: false }); ce.rotation.x = Math.PI / 2;
    for (let z = 2; z >= -16; z -= 4) { for (const s of [-1, 1]) add(tbox(0.6, 6, 0.6, 1), MT.stone, s * 2.4, 3, z, g); add(new THREE.TorusGeometry(2.1, 0.3, 6, 18, Math.PI), MT.stone, 0, 3.9, z, g); }
    S.torches = []; for (let z = 0; z >= -16; z -= 4) for (const s of [-1, 1]) { const t = new THREE.Group(); t.position.set(s * 2.45, 2.6, z - 2); g.add(t);
      add(new THREE.CylinderGeometry(0.05, 0.03, 0.6, 6), MT.woodD, 0, 0, 0, t).rotation.z = s * 0.4; add(new THREE.CylinderGeometry(0.1, 0.07, 0.16, 8), MT.iron, -s * 0.1, 0.3, 0, t);
      const fl2 = add(new THREE.SphereGeometry(0.1, 8, 6), MT.flame, -s * 0.1, 0.45, 0, t, { cast: false }); fl2.scale.y = 1.8; t.userData.glow = glow(GT.warm, 2.4, -s * 0.12, 0.5, 0, t, 0.9); S.torches.push(t); }
    curtain(g, -1.7, -8.5, 2.6, 5.6, MT.purpleD, 0); curtain(g, 1.75, -8.5, 2.5, 5.6, MT.purpleD, 0);
    // movable foreground pillar (draped) the young king hides behind
    const cp = new THREE.Group(); g.add(cp); S.corrPillar = cp; add(tbox(0.7, 6, 0.7, 1), MT.stone, 0, 3, 0, cp); curtain(cp, 0.38, 0.3, 0.9, 5.2, MT.purpleD, Math.PI / 2, 0.3);
    add(new THREE.PlaneGeometry(6, 6), toon({ color: '#3a2418' }), 0, 3, -10.5, g, { cast: false });
    S.corrBehindGlow = glow(GT.warm, 3.4, 0.1, 1.8, -9.4, g, 0.9);
    add(tbox(1.2, 6, 1.2, 1), MT.stone, -1.9, 3, 1.0, g);
    for (const z of [-3, -7]) { const u = add(new THREE.SphereGeometry(0.35, 12, 10), toon({ color: '#8a4a2a' }), 2.0, 0.45, z, g); u.scale.y = 1.3; }
  }

  // =====================================================================================
  // M4 — SUNRISE BALCONY over the sea
  {
    const g = G.bal;
    const fl = add(new THREE.PlaneGeometry(14, 10), MT.marbleF, 0, 0, 1, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const sea = add(new THREE.PlaneGeometry(1600, 1600), waterMat, 0, -14, -400, g, { cast: false }); sea.rotation.x = -Math.PI / 2; sea.userData.nd = waterNd;
    add(tbox(14, 0.2, 0.6, 1), MT.marble, 0, 1.1, -3.2, g); add(tbox(14, 0.25, 0.7, 1), MT.marble, 0, 0.12, -3.2, g);
    for (let x = -6.6; x <= 6.6; x += 0.45) add(new THREE.CylinderGeometry(0.1, 0.14, 0.85, 10), MT.marble, x, 0.6, -3.2, g);
    for (const x of [-4.5, 4.5]) column(g, x, -3.0, 6.5, 0.35);
    add(tbox(12, 0.6, 1.4, 1), MT.marble, 0, 6.6, -3.0, g);
    const aw = add(new THREE.PlaneGeometry(10, 3, 10, 4), MT.purple, 0, 6.3, -1.5, g, { cast: false }); aw.rotation.x = -Math.PI / 2 + 0.25;
    for (const x of [-3.2, 3.4]) { add(new THREE.CylinderGeometry(0.35, 0.25, 0.7, 12), toon({ color: '#b0603a' }), x, 0.35, -2.4, g); for (let k = 0; k < 7; k++) add(new THREE.SphereGeometry(0.28, 8, 6), toon({ color: k % 2 ? '#4a8a3a' : '#5aa040' }), x + Math.cos(k) * 0.25, 0.95 + (k % 3) * 0.2, -2.4 + Math.sin(k) * 0.2, g); }
    for (let i = 0; i < 7; i++) { const h = add(new THREE.SphereGeometry(60 + R() * 50, 16, 8), toon({ color: i % 2 ? '#5a4a6a' : '#6a5a7a' }), -500 + i * 170, -18, -620 - R() * 100, g, { cast: false }); h.scale.y = 0.3; }
    const tb = new THREE.Group(); tb.position.set(0, 0, -1.0); g.add(tb); S.balTable = tb;
    add(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 24), MT.marble, 0, 0.92, 0, tb); add(new THREE.CylinderGeometry(0.08, 0.14, 0.9, 12), MT.marble, 0, 0.45, 0, tb);
    add(new THREE.CylinderGeometry(0.57, 0.6, 0.04, 24), MT.purple, 0, 0.96, 0, tb, { cast: false });
    const vial = new THREE.Group(); vial.position.set(-0.28, 0.98, 0.05); tb.add(vial);
    add(new THREE.CylinderGeometry(0.035, 0.04, 0.12, 12), MT.green, 0, 0.06, 0, vial); add(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 8), MT.woodD, 0, 0.14, 0, vial);
    glow(GT.green, 0.35, -0.28, 1.06, 0.05, tb, 0.6);
    const dr = new THREE.Group(); tb.add(dr); S.dropper = dr;
    add(new THREE.CylinderGeometry(0.008, 0.012, 0.16, 8), toon({ color: '#dcecf4', transparent: true, opacity: 0.85 }), 0, -0.08, 0, dr); add(new THREE.SphereGeometry(0.025, 10, 8), MT.dark, 0, 0.02, 0, dr).scale.y = 1.5;
    S.vessels = [];
    { const v = new THREE.Group(); v.position.set(0.05, 0.98, 0.12); tb.add(v); add(new THREE.CylinderGeometry(0.035, 0.025, 0.05, 14, 1, true), toon({ color: '#d4d8e0', side: THREE.DoubleSide }), 0, 0.025, 0, v); add(new THREE.CylinderGeometry(0.025, 0.025, 0.004, 12), MT.silver, 0, 0.002, 0, v); S.vessels.push(v);
      add(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 14), MT.green, 0, 0.04, 0, v, { cast: false }); }
    S.vessels.push(goblet(tb, 0.25, 0.98, -0.1, 0.9, MT.green, MT.silver));
    S.vessels.push(goblet(tb, 0.05, 0.98, 0.0, 2.2, MT.green, MT.gold));
    S.vesselGlow = [glow(GT.green, 0.3, 0.05, 1.05, 0.12, tb, 0.5), glow(GT.green, 0.6, 0.25, 1.17, -0.1, tb, 0.6), glow(GT.green, 1.4, 0.05, 1.45, 0.0, tb, 0.7)];
    S.balSun = glow(GT.warm, 260, 0, 40, -700, g, 1.0); S.balMoon = glow(GT.moon, 80, 120, 90, -700, g, 0);
    const moon = add(new THREE.CircleGeometry(14, 24), basic({ color: '#f4f2e6', fog: false }), 120, 90, -705, g, { cast: false }); moon.userData.ndSkip = true; S.moonDisc = moon;
    S.gulls = []; for (let i = 0; i < 6; i++) { const gl = new THREE.Group(); gl.position.set(-30 + i * 12, 14 + (i % 3) * 4, -60 - i * 8); g.add(gl);
      for (const s of [-1, 1]) { const w = add(tbox(1.6, 0.12, 0.3, 1), toon({ color: '#f4f4f4' }), s * 0.75, 0, 0, gl, { cast: false }); w.rotation.z = s * 0.35; } S.gulls.push(gl); }
  }

  // =====================================================================================
  // VOID — stylised "inner view"
  {
    const g = G.void, rr = P.rng(5);
    const bg = canvasTex(512, 1024, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h * 0.5, 10, w / 2, h * 0.5, h * 0.7); gr.addColorStop(0, '#2a3a7a'); gr.addColorStop(0.6, '#141a3c'); gr.addColorStop(1, '#070a18'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + rr() * 0.5})`; c.fillRect(rr() * w, rr() * h, 2, 2); } });
    const b = add(new THREE.PlaneGeometry(14, 24), basic({ map: bg, fog: false }), 0, 4, -4, g, { cast: false }); b.userData.ndSkip = true;
    const fl = add(new THREE.CircleGeometry(3, 40), basic({ map: GT.moon, transparent: true, opacity: 0.5, fog: false, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0.01, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2; fl.userData.ndSkip = true;
    for (let i = 0; i < 3; i++) { const r = add(new THREE.TorusGeometry(1.4 + i * 0.5, 0.012, 4, 64), basic({ color: '#e8c050', fog: false, transparent: true, opacity: 0.6 - i * 0.15 }), 0, 0.02, 0, g, { cast: false }); r.rotation.x = Math.PI / 2; r.userData.ndSkip = true; }
  }

  // =====================================================================================
  // M5 — POISON WORKSHOP
  {
    const g = G.lab;
    const fl = add(new THREE.PlaneGeometry(12, 12), texM(P.stone(34, 30, 12, 46, 96, 96), 5, 5), 0, 0, -1, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(12, 6, 0.5, 2), MT.stone, 0, 3, -4.4, g, { cast: false }); for (const s of [-1, 1]) add(tbox(0.5, 6, 10, 2), MT.stone, s * 4.6, 3, -0.5, g, { cast: false });
    const ce = add(new THREE.PlaneGeometry(12, 12), MT.woodD, 0, 5, -1, g, { cast: false }); ce.rotation.x = Math.PI / 2;
    for (let x = -4; x <= 4; x += 2) add(tbox(0.25, 0.3, 10, 1), MT.woodD, x, 4.8, -0.5, g, { cast: false });
    const shelfRows = [];
    for (let r = 0; r < 4; r++) { add(tbox(8.4, 0.08, 0.5, 1), MT.wood, 0, 0.8 + r * 0.95, -3.95, g); shelfRows.push([0, 0.84 + r * 0.95, -3.95, 8.2, 'z']); add(tbox(0.5, 0.08, 6, 1), MT.wood, -4.1, 0.8 + r * 0.95, -0.8, g); shelfRows.push([-4.1, 0.84 + r * 0.95, -0.8, 5.8, 'x']); }
    for (const x of [-4.1, -1.4, 1.4, 4.1]) add(tbox(0.1, 3.9, 0.5, 1), MT.woodD, x, 1.95, -3.95, g);
    const bottleCols = ['#3a8ad0', '#d0403a', '#e8a030', '#8a4ad0', '#4dff6a', '#3ac0a0', '#c8c8c0', '#e85aa0'];
    const bGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.24, 8); bGeo.translate(0, 0.12, 0); const nGeo = new THREE.CylinderGeometry(0.022, 0.03, 0.08, 6); nGeo.translate(0, 0.28, 0);
    const insts = []; for (const [x0, y0, z0, len, ax] of shelfRows) for (let t = -len / 2 + 0.1; t < len / 2; t += 0.17 + R() * 0.06) { const sc = 0.6 + R() * 0.9; insts.push([ax === 'z' ? x0 + t : x0 + (R() - 0.5) * 0.2, y0, ax === 'z' ? z0 + (R() - 0.5) * 0.2 : z0 + t, sc, (R() * bottleCols.length) | 0]); }
    const bm = new THREE.InstancedMesh(bGeo, toon({ color: '#ffffff' }), insts.length), nm = new THREE.InstancedMesh(nGeo, MT.woodD, insts.length); const m4 = new THREE.Matrix4(), col = new THREE.Color();
    insts.forEach(([x, y, z, sc, ci], i) => { m4.makeScale(sc, sc * (0.8 + (i % 3) * 0.2), sc); m4.setPosition(x, y, z); bm.setMatrixAt(i, m4); nm.setMatrixAt(i, m4); bm.setColorAt(i, col.set(bottleCols[ci])); });
    bm.castShadow = true; bm.receiveShadow = true; g.add(bm); g.add(nm);
    const giftLbl = (c, w, h) => { c.fillStyle = '#f4ead2'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1a1416'; c.lineWidth = w * 0.03; c.strokeRect(w * 0.03, w * 0.03, w * 0.94, h - w * 0.06);
      c.fillStyle = '#1a1416'; c.font = serif(Math.round(h * 0.3)); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Gift', w / 2, h * 0.27); skull(c, w / 2, h * 0.58, h / 280); };
    S.giftBottles = [];
    for (const [x, y, z, k, ry] of [[-0.9, 1.75, -3.72, 1.0, 0], [-0.3, 1.75, -3.72, 1.2, 0], [0.45, 1.75, -3.72, 1.0, 0], [1.05, 1.75, -3.72, 1.1, 0], [-2.6, 2.7, -3.72, 1.0, 0], [2.5, 2.7, -3.72, 1.0, 0], [-3.85, 1.75, -2.0, 1.1, Math.PI / 2], [-3.85, 1.75, 0.3, 1.0, Math.PI / 2]]) {
      const b = new THREE.Group(); b.position.set(x, y, z); b.scale.setScalar(k); b.rotation.y = ry; g.add(b);
      add(new THREE.CylinderGeometry(0.13, 0.15, 0.38, 14), toon({ color: '#3ae060', emissive: '#1a8a2a', emissiveIntensity: 0.6 }), 0, 0.19, 0, b); add(new THREE.CylinderGeometry(0.05, 0.07, 0.12, 10), MT.green, 0, 0.44, 0, b); add(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 10), MT.woodD, 0, 0.53, 0, b);
      label(0.2, 0.24, giftLbl, 0, 0.2, 0.152, b); glow(GT.green, 0.8, 0, 0.25, 0.05, b, 0.35); S.giftBottles.push(b); }
    const ca = new THREE.Group(); ca.position.set(0, 0, -1.2); g.add(ca); S.cauldron = ca;
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; add(new THREE.SphereGeometry(0.2, 8, 6), MT.stone, Math.cos(a) * 0.95, 0.12, Math.sin(a) * 0.95, ca); }
    add(new THREE.SphereGeometry(0.85, 26, 16, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.7), toon({ color: '#c06a34', side: THREE.DoubleSide }), 0, 1.0, 0, ca);
    add(new THREE.TorusGeometry(0.69, 0.06, 8, 30), MT.copperD, 0, 1.5, 0, ca).rotation.x = Math.PI / 2;
    const brew = add(new THREE.CircleGeometry(0.66, 30), toon({ color: '#ffb840', emissive: '#e08a20', emissiveIntensity: 0.7 }), 0, 1.4, 0, ca, { cast: false }); brew.rotation.x = -Math.PI / 2; S.brew = brew;
    for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.14, 0.03, 6, 12), MT.iron, s * 0.86, 1.35, 0, ca).rotation.y = Math.PI / 2;
    S.bubbles = []; const bbm = toon({ color: '#ffd070', emissive: '#e0a030', emissiveIntensity: 0.6 }); for (let i = 0; i < 9; i++) S.bubbles.push(add(new THREE.SphereGeometry(0.06, 8, 6), bbm, 0, 1.42, 0, ca, { cast: false }));
    S.ladle = new THREE.Group(); ca.add(S.ladle); add(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8), MT.woodD, 0, 0.45, 0, S.ladle); add(new THREE.SphereGeometry(0.1, 10, 8), MT.copperD, 0, -0.1, 0, S.ladle);
    S.fire = glow(GT.amber, 2.6, 0, 0.35, -0.3, g, 0.9); S.brewGlow = glow(GT.amber, 2.6, 0, 1.7, -1.2, g, 0.7);
    for (let i = 0; i < 14; i++) { const x = -3.6 + i * 0.55, z = -2.5 + (i % 3) * 0.9; add(new THREE.CylinderGeometry(0.006, 0.006, 0.5, 4), MT.dark, x, 4.55, z, g, { cast: false });
      const bunch = add(new THREE.ConeGeometry(0.12, 0.45, 7), toon({ color: ['#7a8a3a', '#9a7a3a', '#5a7a3a'][i % 3] }), x, 4.1, z, g); bunch.rotation.x = Math.PI; }
    const wt = new THREE.Group(); wt.position.set(2.4, 0, -1.6); g.add(wt); S.workTable = wt;
    add(tbox(2.2, 0.12, 1.1, 1), MT.wood, 0, 0.95, 0, wt); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.1, 0.9, 0.1, 1), MT.woodD, sx * 0.95, 0.45, sz * 0.45, wt);
    add(new THREE.CylinderGeometry(0.16, 0.11, 0.18, 14, 1, true), toon({ color: '#8a8478', side: THREE.DoubleSide }), -0.75, 1.1, 0.15, wt); const pestle = add(new THREE.CylinderGeometry(0.03, 0.045, 0.32, 8), toon({ color: '#9a9488' }), -0.72, 1.22, 0.15, wt); pestle.rotation.z = 0.4; S.pestle = pestle;
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), MT.goldD, 0.75, 1.26, -0.25, wt); S.scaleBar = add(tbox(0.6, 0.02, 0.02, 1), MT.goldD, 0.75, 1.5, -0.25, wt);
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.1, 0.08, 0.02, 12), MT.gold, 0.75 + s * 0.28, 1.35, -0.25, wt);
    const jar = new THREE.Group(); jar.position.set(0.05, 1.01, 0.18); wt.add(jar); S.antiJar = jar;
    add(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 22), toon({ color: '#e8a838', emissive: '#a0601a', emissiveIntensity: 0.35 }), 0, 0.21, 0, jar); add(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 22), MT.woodD, 0, 0.45, 0, jar);
    add(new THREE.CylinderGeometry(0.17, 0.2, 0.05, 22), toon({ color: '#c8b088' }), 0, 0.5, 0, jar);
    label(0.38, 0.15, (c, w, h) => { c.fillStyle = '#f4ead2'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6a3a1e'; c.lineWidth = h * 0.06; c.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08); c.fillStyle = '#3a1a10'; c.font = serif(Math.round(h * 0.38)); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Gegengift', w / 2, h * 0.54); }, 0, 0.22, 0.205, jar);
    glow(GT.amber, 0.9, 0.05, 1.25, 0.25, wt, 0.4);
    S.honey = new THREE.Group(); ca.add(S.honey); { add(new THREE.CylinderGeometry(0.12, 0.14, 0.24, 14), toon({ color: '#e8a830', emissive: '#a06010', emissiveIntensity: 0.3 }), 0, 0, 0, S.honey); add(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 14), toon({ color: '#c8b088' }), 0, 0.13, 0, S.honey);
      const dripG = new THREE.CylinderGeometry(0.018, 0.012, 1, 6); dripG.translate(0, -0.5, 0); S.honeyDrip = add(dripG, toon({ color: '#ffc040', emissive: '#c08010', emissiveIntensity: 0.5 }), 0.12, 0.08, 0, S.honey, { cast: false }); }
    S.ingr = []; const iM = [toon({ color: '#8a4a22' }), toon({ color: '#c8a050' }), toon({ color: '#6a8a3a' }), toon({ color: '#d8582a' }), toon({ color: '#7a5a3a' }), toon({ color: '#e8d080' })];
    for (let i = 0; i < 12; i++) { const k = i % 6, gg = new THREE.Group(); gg.scale.setScalar(1.6); ca.add(gg);
      if (k === 0) add(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), iM[0], 0, 0, 0, gg).rotation.z = 1.2;
      else if (k === 1) { add(new THREE.CylinderGeometry(0.04, 0.015, 0.34, 7), iM[4], 0, 0, 0, gg).rotation.z = 0.6; add(new THREE.CylinderGeometry(0.01, 0.005, 0.15, 4), iM[4], 0.08, -0.12, 0, gg).rotation.z = -0.7; }
      else if (k === 2) { for (let j = 0; j < 4; j++) add(new THREE.ConeGeometry(0.05, 0.22, 5), iM[2], (j - 1.5) * 0.04, 0, 0, gg).rotation.z = (j - 1.5) * 0.25; }
      else if (k === 3) { for (let j = 0; j < 5; j++) add(new THREE.SphereGeometry(0.03, 6, 5), iM[3], Math.cos(j) * 0.05, Math.sin(j * 2) * 0.03, Math.sin(j) * 0.05, gg); }
      else if (k === 4) add(new THREE.SphereGeometry(0.06, 8, 6), iM[5], 0, 0, 0, gg).scale.set(1.4, 0.7, 1);
      else add(new THREE.ConeGeometry(0.06, 0.12, 5), iM[1], 0, 0, 0, gg);
      S.ingr.push(gg); }
    S.labLamp = glow(GT.warm, 2.0, -3.2, 3.2, -3.4, g, 0.6); candle(g, -3.0, 1.79, -3.6, 0.2); candle(g, 3.1, 0.99, -1.2, 0.25);
  }

  // =====================================================================================
  // M6 — BANQUET HALL
  {
    const g = G.ban;
    const fl = add(new THREE.PlaneGeometry(20, 20), texM(P.marble(41), 6, 6, '#f0e2c8'), 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(20, 7, 0.5, 3), texM(P.plaster(28, 20), 3, 2, '#c8584a'), 0, 3.5, -5, g, { cast: false }); for (const s of [-1, 1]) add(tbox(0.5, 7, 20, 3), texM(P.plaster(29, 20), 3, 2, '#b8483a'), s * 6, 3.5, 0, g, { cast: false });
    const fr = canvasTex(1024, 160, (c, w, h) => { c.fillStyle = '#1e2a5a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8c050'; c.lineWidth = 8; for (let x = 0; x < w; x += 80) { c.beginPath(); c.arc(x + 40, h / 2, 26, Math.PI, Math.PI * 2.6); c.stroke(); } });
    add(new THREE.PlaneGeometry(20, 0.8), toon({ map: fr }), 0, 4.2, -4.74, g, { cast: false });
    for (const x of [-4, 0, 4]) curtain(g, x, -4.6, 2.2, 5, x === 0 ? MT.purpleD : MT.purple, 0, 0.6);
    const couch = (x, z, ry) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
      add(tbox(2.2, 0.45, 0.9, 1), MT.woodD, 0, 0.3, 0, c); add(tbox(2.1, 0.18, 0.85, 1), toon({ color: '#6a2a8a' }), 0, 0.6, 0, c); add(tbox(0.3, 0.5, 0.85, 1), toon({ color: '#5a1e7a' }), -1.0, 0.8, 0, c);
      for (let k = 0; k < 3; k++) add(new THREE.SphereGeometry(0.2, 10, 8), toon({ color: ['#e8b843', '#c8584a', '#3a8ad0'][k] }), -0.6 + k * 0.6, 0.78, -0.25, c).scale.set(1.3, 0.7, 1); return c; };
    couch(-2.6, -1.6, 0.35); couch(2.6, -1.6, -0.35); couch(-3.4, 1.4, 1.3); couch(3.4, 1.4, -1.3); couch(0, -2.6, 0);
    const dishM = toon({ color: '#9ae890', emissive: '#3ac04a', emissiveIntensity: 0.55 });
    for (const [x, z] of [[-1.6, -0.6], [1.6, -0.6], [-2.2, 1.6], [2.2, 1.6], [0, -1.5]]) { const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t);
      add(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 20), MT.wood, 0, 0.5, 0, t); for (let k = 0; k < 3; k++) add(new THREE.CylinderGeometry(0.04, 0.04, 0.48, 6), MT.woodD, Math.cos(k * 2.1) * 0.45, 0.24, Math.sin(k * 2.1) * 0.45, t);
      add(new THREE.CylinderGeometry(0.3, 0.2, 0.05, 18), MT.gold, 0, 0.55, 0, t);
      for (let k = 0; k < 5; k++) add(new THREE.SphereGeometry(0.08, 8, 6), k % 2 ? dishM : toon({ color: '#c8763a' }), Math.cos(k * 1.3) * 0.14, 0.62, Math.sin(k * 1.3) * 0.14, t).scale.y = 0.7;
      add(new THREE.SphereGeometry(0.12, 10, 8), toon({ color: '#6a2a8a' }), 0.3, 0.6, 0.25, t); goblet(t, -0.35, 0.53, 0.2, 1.1, toon({ color: '#8a1a3a' }));
      glow(GT.green, 0.9, 0, 0.7, 0, t, 0.35); }
    S.banLamps = []; for (const [x, z] of [[-4.6, -3.6], [4.6, -3.6], [-5.2, 3], [5.2, 3]]) { add(new THREE.CylinderGeometry(0.04, 0.08, 1.8, 8), MT.goldD, x, 0.9, z, g); const l = new THREE.Group(); l.position.set(x, 1.85, z); g.add(l);
      add(new THREE.SphereGeometry(0.15, 10, 8), MT.gold, 0, 0, 0, l).scale.set(1.6, 0.6, 1); add(new THREE.SphereGeometry(0.05, 8, 6), MT.flame, 0.18, 0.1, 0, l, { cast: false }).scale.y = 2; l.userData.glow = glow(GT.warm, 2.2, 0.18, 0.15, 0, l, 0.85); S.banLamps.push(l); }
    for (const z of [-1, 2]) S.banLamps.push(lamp(g, 0, 7, z, 3.4));
  }

  // =====================================================================================
  // M7 — WAR TENT at night
  {
    const g = G.tent;
    const fl = add(new THREE.PlaneGeometry(400, 400), texM(P.dirt(17), 60, 60, '#6a5a48'), 0, 0, -100, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(new THREE.CircleGeometry(2.6, 32), toon({ color: '#6a2a3a' }), 0, 0.01, 0, g, { cast: false }).rotation.x = -Math.PI / 2;
    // open toward -z: leave a gap of ~0.2*2PI centred on -z
    const tg = new THREE.CylinderGeometry(1.0, 3.6, 3.4, 12, 1, true, Math.PI + 0.35, Math.PI * 2 - 0.7); const tent = add(tg, toon({ color: '#c8b48a', side: THREE.DoubleSide }), 0, 1.7, 0, g, { cast: false });
    add(new THREE.ConeGeometry(1.05, 1.2, 12, 1, true), toon({ color: '#b8a47a', side: THREE.DoubleSide }), 0, 4.0, 0, g, { cast: false });
    add(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 8), MT.woodD, 0, 2.3, 0.3, g);
    for (const s of [-1, 1]) { const f = add(new THREE.PlaneGeometry(1.0, 3.2, 6, 4), toon({ color: '#b8a070', side: THREE.DoubleSide }), s * 1.0, 1.6, -3.0, g, { cast: false }); f.rotation.y = s * 0.9; }
    const mt = new THREE.Group(); mt.position.set(0, 0, 0.6); g.add(mt); S.mapTable = mt;
    add(tbox(1.8, 0.1, 1.1, 1), MT.wood, 0, 0.85, 0, mt); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.08, 0.8, 0.08, 1), MT.woodD, sx * 0.8, 0.4, sz * 0.45, mt);
    const rm = P.rng(3);
    const mapT = canvasTex(1024, 640, (c, w, h) => { c.fillStyle = '#e8d8b0'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8b488'; for (let i = 0; i < 40; i++) c.fillRect(rm() * w, rm() * h, 30, 2);
      c.fillStyle = '#8ab0c8'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w * 0.7, 0); c.bezierCurveTo(w * 0.6, h * 0.2, w * 0.4, h * 0.3, w * 0.3, h * 0.25); c.bezierCurveTo(w * 0.15, h * 0.2, w * 0.1, h * 0.4, 0, h * 0.45); c.fill();
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 5; c.stroke(); c.setLineDash([16, 12]); c.strokeStyle = '#8a2a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(w * 0.85, h * 0.9); c.bezierCurveTo(w * 0.7, h * 0.7, w * 0.6, h * 0.6, w * 0.45, h * 0.55); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#6a4a2a'; for (const [x, y] of [[0.3, 0.6], [0.55, 0.75], [0.7, 0.4]]) { c.beginPath(); c.moveTo(w * x, h * y - 20); c.lineTo(w * x + 18, h * y + 10); c.lineTo(w * x - 18, h * y + 10); c.fill(); }
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 14; c.strokeRect(0, 0, w, h); });
    add(new THREE.PlaneGeometry(1.6, 1.0), toon({ map: mapT }), 0, 0.905, 0, mt, { cast: false }).rotation.x = -Math.PI / 2;
    const pawn = (x, z, col, down, rot) => { const p = new THREE.Group(); p.position.set(x, 0.905, z); mt.add(p); const m = toon({ color: col }); add(new THREE.CylinderGeometry(0.035, 0.045, 0.02, 10), m, 0, 0.01, 0, p); add(new THREE.CylinderGeometry(0.018, 0.03, 0.09, 8), m, 0, 0.06, 0, p); add(new THREE.SphereGeometry(0.026, 8, 6), m, 0, 0.12, 0, p);
      if (down) { p.rotation.set(0, rot, Math.PI / 2); p.position.y += 0.035; } return p; };
    for (let i = 0; i < 7; i++) pawn(-0.55 + i * 0.12, 0.2 + (i % 2) * 0.1, '#7a3aa0', i !== 3, i * 0.9);
    for (let i = 0; i < 9; i++) pawn(-0.4 + (i % 5) * 0.14, -0.25 - ((i / 5) | 0) * 0.12, '#c8282a', false, 0);
    S.tentCandle = candle(mt, 0.62, 0.9, -0.3, 0.22); S.tentGlow = glow(GT.warm, 0.9, 0.62, 1.2, 0.3, g, 0.7);
    add(new THREE.CylinderGeometry(0.28, 0.25, 0.5, 12), MT.woodD, 1.2, 0.25, 1.4, g); add(tbox(0.9, 0.5, 0.5, 1), MT.wood, -1.6, 0.25, 1.8, g);
    S.campFires = []; const rt = P.rng(77); const fireM = toon({ color: '#ffb040', emissive: '#ff7020', emissiveIntensity: 1.2 }), tentM = toon({ color: '#3a2a2a' });
    for (let i = 0; i < 60; i++) { const x = (rt() - 0.5) * 160, z = -40 - rt() * 120; S.campFires.push(glow(GT.red, 3 + rt() * 3, x, 0.8, z, g, 0.9)); add(new THREE.SphereGeometry(0.4, 6, 5), fireM, x, 0.3, z, g, { cast: false }); }
    for (let i = 0; i < 40; i++) { const x = (rt() - 0.5) * 170, z = -45 - rt() * 120; add(new THREE.ConeGeometry(1.6, 2.4, 6), tentM, x, 1.2, z, g, { cast: false }); }
    S.banners = []; for (let i = 0; i < 12; i++) { const x = -60 + i * 11 + rt() * 4, z = -38 - rt() * 30; add(new THREE.CylinderGeometry(0.08, 0.08, 7, 6), MT.dark, x, 3.5, z, g, { cast: false });
      const b = add(new THREE.PlaneGeometry(2.2, 1.4, 8, 2), MT.red, x + 1.1, 6.2, z, g, { cast: false }); b.userData.base = b.geometry.attributes.position.array.slice(); S.banners.push(b); }
    for (let i = 0; i < 8; i++) { const h = add(new THREE.SphereGeometry(60 + rt() * 40, 14, 8), toon({ color: '#1a2038' }), -200 + i * 60, -20, -260, g, { cast: false }); h.scale.y = 0.35; }
  }

  // =====================================================================================
  // M9 — MODERN MUSEUM + LIBRARY
  {
    const g = G.mus;
    const fl = add(new THREE.PlaneGeometry(24, 24), texM(P.planks(51), 8, 8, '#c89a6a'), 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(24, 6, 0.5, 3), toon({ color: '#3a4a6a' }), 0, 3, -5, g, { cast: false }); for (const s of [-1, 1]) add(tbox(0.5, 6, 24, 3), toon({ color: '#34445e' }), s * 7, 3, 0, g, { cast: false });
    add(new THREE.PlaneGeometry(24, 24), toon({ color: '#202634' }), 0, 6, 0, g, { cast: false }).rotation.x = Math.PI / 2;
    for (const [x, c1, c2] of [[-4.2, '#c8584a', '#e8c050'], [4.4, '#3a8ad0', '#f4ead2']]) { add(tbox(2.0, 1.4, 0.08, 1), MT.gold, x, 3, -4.7, g); const pic = canvasTex(256, 180, (c, w, h) => { c.fillStyle = c1; c.fillRect(0, 0, w, h); c.fillStyle = c2; c.beginPath(); c.arc(w * 0.6, h * 0.45, 50, 0, 7); c.fill(); c.fillStyle = '#2a2430'; c.fillRect(0, h * 0.7, w, h * 0.3); }); add(new THREE.PlaneGeometry(1.8, 1.2), toon({ map: pic }), x, 3, -4.65, g, { cast: false }); }
    // other vitrines in the background (vases, helmet-free)
    for (const [x, z] of [[-4.5, -2.5], [4.6, -2.8], [-5.2, 1.5]]) { add(tbox(0.9, 1.0, 0.9, 1), toon({ color: '#f0ece4' }), x, 0.5, z, g); const v = add(new THREE.SphereGeometry(0.22, 12, 10), toon({ color: '#c0703a' }), x, 1.25, z, g); v.scale.y = 1.4; add(tbox(0.88, 0.7, 0.88, 1), new THREE.MeshBasicMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.1, depthWrite: false }), x, 1.35, z, g, { cast: false }).userData.ndSkip = true; }
    S.musSpots = []; for (const x of [-3, 0, 3]) { add(new THREE.CylinderGeometry(0.1, 0.16, 0.3, 10), MT.dark, x, 5.8, -1, g); S.musSpots.push(shaft(1.4, 5.5, '#fff4e0', 0.12, x, 5.7, -1, 0.0, 0, 0, g)); }
    const vt = new THREE.Group(); vt.position.set(0, 0, -1.2); g.add(vt); S.vitrine = vt;
    add(tbox(1.4, 1.0, 1.0, 1), toon({ color: '#f0ece4' }), 0, 0.5, 0, vt); add(tbox(1.3, 0.05, 0.9, 1), toon({ color: '#1e2a5a' }), 0, 1.03, 0, vt);
    const glass = add(tbox(1.36, 0.9, 0.96, 1), new THREE.MeshBasicMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.12, depthWrite: false }), 0, 1.5, 0, vt, { cast: false }); glass.userData.ndSkip = true;
    for (const [x, z] of [[-0.68, -0.48], [0.68, -0.48], [-0.68, 0.48], [0.68, 0.48]]) add(tbox(0.03, 0.9, 0.03, 1), MT.silver, x, 1.5, z, vt, { cast: false });
    const streak = add(new THREE.PlaneGeometry(0.12, 0.9), basic({ color: '#ffffff', transparent: true, opacity: 0.22, depthWrite: false }), -0.2, 1.5, 0.49, vt, { cast: false }); streak.rotation.z = 0.5; streak.userData.ndSkip = true;
    const coinT = canvasTex(512, 512, (c) => { c.fillStyle = '#d8a838'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.strokeStyle = '#9a7020'; c.lineWidth = 14; c.beginPath(); c.arc(256, 256, 226, 0, 7); c.stroke();
      c.fillStyle = '#b8862a'; for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; c.beginPath(); c.arc(256 + 205 * Math.cos(a), 256 + 205 * Math.sin(a), 6, 0, 7); c.fill(); }
      c.save(); c.translate(256, 256); c.rotate(-Math.PI / 2); c.translate(-256, -256);
      c.fillStyle = '#a8761e'; c.strokeStyle = '#6a4a10'; c.lineWidth = 7;
      c.beginPath(); c.arc(250, 235, 92, 0, 7); c.fill(); c.stroke();                       // skull
      c.beginPath(); c.moveTo(332, 220); c.lineTo(372, 268); c.lineTo(338, 276); c.lineTo(342, 300); c.lineTo(330, 318); c.lineTo(282, 330); c.lineTo(230, 320); c.closePath(); c.fill(); c.stroke(); // nose, lips, chin
      c.fillRect(215, 300, 70, 110); c.strokeRect(215, 300, 70, 110);                        // neck
      c.fillStyle = '#7a5214'; c.beginPath(); c.arc(235, 220, 86, Math.PI * 0.5, Math.PI * 1.55); c.fill();   // wavy hair at the back
      for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(170, 170 + k * 28, 16, 0, 7); c.fill(); }
      c.fillStyle = '#f4d070'; c.fillRect(165, 150, 175, 16); for (const x of [190, 235, 280, 320]) { c.beginPath(); c.moveTo(x - 10, 152); c.lineTo(x, 122); c.lineTo(x + 10, 152); c.fill(); }   // circlet
      c.fillStyle = '#4a2a08'; c.beginPath(); c.ellipse(312, 222, 10, 6, 0, 0, 7); c.fill(); c.lineWidth = 5; c.beginPath(); c.moveTo(295, 205); c.lineTo(330, 200); c.stroke(); // eye + brow
      c.beginPath(); c.moveTo(300, 302); c.lineTo(326, 300); c.stroke(); c.restore();
      });
    const coin = add(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 32), [toon({ color: '#b8862a' }), toon({ map: coinT }), toon({ map: coinT })], -0.28, 1.25, 0.05, vt); coin.rotation.x = Math.PI / 2 - 0.25; S.coin = coin;
    add(tbox(0.2, 0.18, 0.04, 1), toon({ color: '#2a3a7a' }), -0.28, 1.12, -0.04, vt).rotation.x = -0.3;
    S.musGoblet = goblet(vt, 0.3, 1.055, 0, 2.6, null, MT.gold);
    glow(GT.warm, 1.4, 0, 1.55, 0.1, vt, 0.35);
    for (const x of [-1.3, 1.3]) { add(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), MT.silver, x, 0.45, 0.4, g); add(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 14), MT.silver, x, 0.02, 0.4, g); }
    const rope = add(new THREE.TorusGeometry(1.3, 0.025, 6, 30, Math.PI), toon({ color: '#8a1a2a' }), 0, 0.9, 0.4, g); rope.rotation.z = Math.PI;
    const lib = new THREE.Group(); lib.position.set(4.0, 0, 2.0); g.add(lib); S.lib = lib;
    for (const [x, z, ry] of [[1.6, -1.6, -Math.PI / 2], [0, -2.6, 0]]) { const sh = new THREE.Group(); sh.position.set(x, 0, z); sh.rotation.y = ry; lib.add(sh);
      add(tbox(2.6, 3.6, 0.4, 1), MT.woodD, 0, 1.8, -0.1, sh); const bc = ['#8a2a3a', '#2a4a8a', '#3a6a3a', '#a07030', '#5a2a6a', '#c8b088'];
      for (let r = 0; r < 5; r++) { let x0 = -1.2; while (x0 < 1.15) { const w = 0.06 + R() * 0.06, h = 0.42 + R() * 0.2; add(tbox(w, h, 0.28, 1), toon({ color: bc[(R() * bc.length) | 0] }), x0 + w / 2, 0.15 + r * 0.7 + h / 2, 0.05, sh, { cast: false }); x0 += w + 0.01; } } }
    add(tbox(2.0, 0.08, 1.1, 1), MT.wood, 0, 0.82, 0, lib); for (const sx of [-1, 1]) add(tbox(0.08, 0.8, 1.0, 1), MT.woodD, sx * 0.92, 0.4, 0, lib);
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), MT.goldD, -0.75, 1.06, -0.3, lib); add(new THREE.CylinderGeometry(0.1, 0.18, 0.12, 14, 1, true), toon({ color: '#2a6a4a', side: THREE.DoubleSide }), -0.68, 1.28, -0.3, lib).rotation.z = -0.4;
    S.deskLamp = glow(GT.warm, 1.6, -0.6, 1.1, -0.2, lib, 0.7);
    const bk = new THREE.Group(); bk.position.set(0.1, 0.86, 0.05); lib.add(bk); S.book = bk;
    add(tbox(0.95, 0.08, 0.66, 1), toon({ color: '#6a1e2a' }), 0, 0.04, 0, bk);
    const pageL = canvasTex(600, 820, (c, w, h) => { c.fillStyle = '#f6eed8'; c.fillRect(0, 0, w, h); c.fillStyle = '#b8a888'; for (let y = 90; y < 300; y += 34) c.fillRect(50, y, w - 100 - (y % 3) * 30, 9); for (let y = 640; y < h - 50; y += 34) c.fillRect(50, y, w - 120, 9);
      c.strokeStyle = '#3a2a1a'; c.lineWidth = 6; c.beginPath(); c.moveTo(w / 2 - 70, 370); c.lineTo(w / 2 + 70, 370); c.lineTo(w / 2 + 40, 460); c.lineTo(w / 2 + 10, 480); c.lineTo(w / 2 + 10, 540); c.lineTo(w / 2 + 50, 560); c.lineTo(w / 2 - 50, 560); c.lineTo(w / 2 - 10, 540); c.lineTo(w / 2 - 10, 480); c.lineTo(w / 2 - 40, 460); c.closePath(); c.stroke();
      for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(w / 2 - 50 + k * 15, 380); c.lineTo(w / 2 - 35 + k * 10, 455); c.stroke(); } c.strokeRect(w / 2 - 140, 340, 280, 250); });
    const pageR = canvasTex(600, 820, (c, w, h) => { c.fillStyle = '#f6eed8'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a1a10'; c.font = serif(56); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Mithridatismus', w / 2, 120);
      c.fillStyle = '#8a2a2a'; c.fillRect(w / 2 - 160, 170, 320, 6); c.fillStyle = '#b8a888'; for (let y = 230; y < h - 60; y += 34) c.fillRect(50, y, w - 100 - (y % 4) * 20, 9); });
    for (const [s, t] of [[-1, pageL], [1, pageR]]) { const geo = new THREE.PlaneGeometry(0.44, 0.6, 12, 1); const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const u = (pos.getX(i) + 0.22) / 0.44; pos.setZ(i, Math.sin((s < 0 ? u : 1 - u) * Math.PI * 0.5) * 0.03); } geo.computeVertexNormals();
      const pg = add(geo, basic({ map: t, fog: false }), s * 0.225, 0.085, 0, bk, { cast: false }); pg.rotation.x = -Math.PI / 2; pg.userData.ndSkip = true; }
    const tpG = new THREE.PlaneGeometry(0.44, 0.6); tpG.translate(0.22, 0, 0); S.turnPage = add(tpG, basic({ color: '#efe6cc', side: THREE.DoubleSide, fog: false }), 0, 0.12, 0, bk, { cast: false }); S.turnPage.rotation.x = -Math.PI / 2; S.turnPage.userData.ndSkip = true;
    S.antCup = goblet(lib, 0.72, 0.86, 0.1, 0.9, toon({ color: '#4dff6a', emissive: '#2ae04a', emissiveIntensity: 0.5 }), toon({ color: '#9a7a4a' })); S.antGlow = glow(GT.green, 0.5, 0.72, 1.05, 0.1, lib, 0.45);
    add(tbox(0.25, 0.04, 0.32, 1), toon({ color: '#2a4a8a' }), -0.6, 0.86, 0.25, lib); add(tbox(0.22, 0.04, 0.3, 1), toon({ color: '#a07030' }), -0.58, 0.9, 0.24, lib);
  }
};

const setVis = (k) => { for (const n in S.G) S.G[n].visible = n === k; };
export const update = (ctx, W, f) => {
  setVis(W.loc);
  const t = f / 30;
  if (W.cam) for (const b of S.bills) b.lookAt(W.cam[0], W.cam[1], W.cam[2]);
  const wind = W.wind || 0;
  for (const c of S.curtains) { if (!S.G[W.loc] || c.userData.grp !== S.G[W.loc]) continue; const p = c.geometry.attributes.position, b = c.userData.base, H = c.userData.h;
    for (let i = 0; i < p.count; i++) { const x = b[i * 3], y = b[i * 3 + 1]; const hang = (H / 2 - y) / H; p.setZ(i, b[i * 3 + 2] + Math.sin(x * 3 + t * (2 + wind * 5) + y) * (0.03 + wind * 0.4) * hang); }
    p.needsUpdate = true; }
  if (W.loc === 'hall') {
    const a = W.doorOpen ?? 1; S.doors.forEach((d, i) => { d.rotation.y = (i ? 1 : -1) * a * 1.75; });
    S.doorShaft.material.opacity = W.doorLight ?? 0; S.doorGlow.material.opacity = (W.doorLight ?? 0) * 1.2;
    const night = !!W.night; S.hallCrown.visible = night; S.crownGlow.visible = night; S.endCandleG.visible = night; S.endGlow.visible = night && (W.flame ?? 1) > 0.02; S.endGlow.material.opacity = 0.8 * (W.flame ?? 1);
    for (const p of S.hallPools) { p.material.opacity = night ? 0.28 : 0.35; p.material.color.set(night ? '#9ab4ff' : '#ffe8c0'); }
    for (const s of S.hallShafts) { s.material.opacity = night ? 0.22 : 0.16; s.material.color.set(night ? '#a8c0ff' : '#fff0d0'); }
    for (const l of S.hallLamps) { l.visible = !night; l.rotation.z = Math.sin(t * 1.3 + l.position.z) * 0.02 + (W.lampShake || 0) * Math.sin(f * 1.7 + l.position.x) * 0.12; l.userData.glow.material.opacity = 0.75 + 0.15 * Math.sin(f * 0.9 + l.position.z); }
    S.councilLamp.visible = !night; S.councilLamp.rotation.z = (W.lampShake || 0) * Math.sin(f * 1.9) * 0.16; S.councilLamp.rotation.x = (W.lampShake || 0) * Math.cos(f * 1.4) * 0.1;
    S.councilProps.forEach((p, i) => { p.position.y = (i === 0 ? 1.09 : 1.08) + (W.tableJump || 0) * (0.05 + i * 0.02); p.rotation.z = (W.tableJump || 0) * (i - 1) * 0.15; });
    const c = S.endCandle, k = W.flame ?? 1; c.userData.fl.visible = k > 0.02; c.userData.fl.scale.set(Math.max(0.01, k), 2.2 * k * (0.9 + 0.15 * Math.sin(f * 1.1)), Math.max(0.01, k));
  }
  if (W.loc === 'feast') {
    const gb = W.gob || { p: [0.55, 0.96, -4.0], r: 0 }; S.fbGoblet.position.set(...gb.p); S.fbGoblet.rotation.set(gb.rx || 0, 0, gb.r || 0);
    const cr = W.crown || { p: [3, 0.26, 3], roll: 0, tilt: 0 }; S.fbCrown.position.set(...cr.p); S.fbCrown.rotation.set(0, cr.yaw || 0, 0); S.fbCrownI.rotation.set(Math.PI / 2 - (cr.tilt || 0), 0, 0); S.fbCrownI.rotateY(cr.roll || 0);
  }
  if (W.loc === 'corr' && W.pillar) S.corrPillar.position.set(W.pillar[0], 0, W.pillar[1]);
  if (W.loc === 'corr') for (const tc of S.torches) tc.userData.glow.material.opacity = 0.7 + 0.25 * Math.sin(f * 0.8 + tc.position.z * 3) * Math.sin(f * 0.37 + tc.position.x);
  if (W.loc === 'bal') {
    const d = W.dropper; S.dropper.visible = !!d; if (d) S.dropper.position.set(...d);
    const v = W.vessel ?? 0; S.vessels.forEach((x, i) => { x.visible = W.allVessels || i === v; S.vesselGlow[i].visible = x.visible; });
    S.balSun.visible = !W.moon; S.balMoon.material.opacity = W.moon ? 0.8 : 0; S.moonDisc.visible = !!W.moon;
    if (W.sunPos) S.balSun.position.set(...W.sunPos);
    S.gulls.forEach((gl, i) => { gl.visible = !W.moon; gl.position.x = -40 + ((t * 3 + i * 14) % 80); gl.children.forEach((w, j) => { w.rotation.z = (j ? 1 : -1) * (0.2 + 0.4 * Math.sin(t * 6 + i)); }); });
  }
  if (W.loc === 'lab') {
    S.bubbles.forEach((b, i) => { const ph = (t * 0.9 + i * 0.37) % 1; const a = i * 2.4; b.position.set(Math.cos(a) * 0.45 * ((i % 3) / 3 + 0.3), 1.42 + ph * 0.05, Math.sin(a) * 0.4 * ((i % 3) / 3 + 0.3)); b.scale.setScalar(0.4 + ph * 1.2); b.visible = ph < 0.9; });
    S.brew.rotation.z = t * 0.5; const st = W.stir ?? t * 2.2; S.ladle.position.set(Math.cos(st) * 0.25, 1.3, Math.sin(st) * 0.22); S.ladle.rotation.set(-0.5 + Math.sin(st) * 0.15, 0, Math.cos(st) * 0.2);
    S.fire.material.opacity = 0.75 + 0.2 * Math.sin(f * 0.9) * Math.sin(f * 0.31); S.brewGlow.material.opacity = 0.6 + 0.15 * Math.sin(f * 0.5);
    S.pestle.rotation.z = 0.4 + Math.sin(t * 5) * 0.15; S.scaleBar.rotation.z = Math.sin(t * 1.5) * 0.06;
    const ing = W.ingr || []; S.ingr.forEach((o, i) => { const s = ing[i]; o.visible = !!s; if (s) { o.position.set(...s.p); o.rotation.set(s.r, s.r * 0.7, s.r * 0.4); } });
    const h = W.honey; S.honey.visible = !!h; if (h) { S.honey.position.set(...h.p); S.honey.rotation.z = h.tilt; S.honeyDrip.scale.y = Math.max(0.01, h.drip); S.honeyDrip.rotation.z = -h.tilt; }
  }
  if (W.loc === 'ban') for (const l of S.banLamps) if (l.userData.glow) l.userData.glow.material.opacity = 0.75 + 0.15 * Math.sin(f * 0.7 + l.position.x);
  if (W.loc === 'tent') {
    const k = W.flame ?? 1, fl = S.tentCandle.userData.fl; fl.scale.set(k, 2.2 * k * (0.85 + 0.25 * Math.sin(f * 1.3) * Math.sin(f * 0.47)), k); fl.position.x = 0.006 * Math.sin(f * 0.9) * (W.flicker || 1);
    S.tentGlow.material.opacity = (0.8 + 0.18 * (W.flicker || 1) * Math.sin(f * 1.1) * Math.sin(f * 0.43)) * k;
    S.campFires.forEach((c, i) => { c.material.opacity = 0.7 + 0.3 * Math.sin(f * 0.6 + i); });
    S.banners.forEach((b, i) => { const p = b.geometry.attributes.position, base = b.userData.base; for (let j = 0; j < p.count; j++) { const x = base[j * 3]; p.setZ(j, Math.sin(x * 2.4 - t * 4 + i) * 0.18 * (x + 1.1) / 2.2); } p.needsUpdate = true; });
  }
  if (W.loc === 'mus') { const tp = W.pageTurn ?? 1; S.turnPage.rotation.y = -Math.PI * (1 - tp) * 0.999; S.turnPage.visible = tp < 0.999; S.antGlow.material.opacity = 0.35 + 0.15 * Math.sin(t * 2); }
};
