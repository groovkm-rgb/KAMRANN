// scene.js — "Das 7-Minuten-Theater": Tokyo platform, white/green express train, countdown kiosk,
// train interior (100 seats), dollhouse cutaway, theatre curtains, lecture hall.
// All visible writing is German: "Gleis 20 – Tokio", "Abfahrt", "Das 7-Minuten-Wunder". Digits only on the counter.
let S = {};
export const TRAIN_Z = -1.85;            // track centre line (platform edge at z = 0, platform top y = 0)
export const KIOSK = { x: -14, z: 5.6, rot: Math.PI / 2 }; // countdown kiosk on platform (front faces +x)
export const INT0 = [1000, 0, 0], CUT0 = [2000, 0, 0], HALL0 = [3000, 0, 0];
const CAR_L = 25, NOSE_L = 11, CAR1_L = 15, GAP = 0.5;

// ---------- seven-segment countdown ----------
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
const digit = (c, d, x, y, w, h, col, dim) => {
  const t = w * 0.2, P = {
    a: [[x + t * 0.6, y], [x + w - t * 0.6, y], [x + w - t * 1.4, y + t], [x + t * 1.4, y + t]],
    d: [[x + t * 1.4, y + h - t], [x + w - t * 1.4, y + h - t], [x + w - t * 0.6, y + h], [x + t * 0.6, y + h]],
    g: [[x + t * 0.8, y + h / 2], [x + t * 1.4, y + h / 2 - t / 2], [x + w - t * 1.4, y + h / 2 - t / 2], [x + w - t * 0.8, y + h / 2], [x + w - t * 1.4, y + h / 2 + t / 2], [x + t * 1.4, y + h / 2 + t / 2]],
    f: [[x, y + t * 0.6], [x + t, y + t * 1.4], [x + t, y + h / 2 - t * 0.7], [x, y + h / 2 - t * 0.2]],
    b: [[x + w, y + t * 0.6], [x + w - t, y + t * 1.4], [x + w - t, y + h / 2 - t * 0.7], [x + w, y + h / 2 - t * 0.2]],
    e: [[x, y + h / 2 + t * 0.2], [x + t, y + h / 2 + t * 0.7], [x + t, y + h - t * 1.4], [x, y + h - t * 0.6]],
    c: [[x + w, y + h / 2 + t * 0.2], [x + w - t, y + h / 2 + t * 0.7], [x + w - t, y + h - t * 1.4], [x + w, y + h - t * 0.6]],
  };
  for (const k of 'abcdefg') { const on = SEG[d].includes(k); c.fillStyle = on ? col : dim; c.shadowBlur = on ? 26 : 0; c.shadowColor = col;
    c.beginPath(); P[k].forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.fill(); }
  c.shadowBlur = 0;
};
export const counterCol = (sec) => sec > 180 ? '#f2f5ff' : sec > 30 ? '#ffd23a' : '#ff3b2f';
const drawCounter = (c, w, h, sec) => {
  const col = counterCol(sec), dim = 'rgba(255,255,255,0.05)';
  c.fillStyle = '#0d0f14'; c.fillRect(0, 0, w, h);
  c.strokeStyle = '#2a2e38'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14);
  for (let y = 24; y < h - 20; y += 9) { c.fillStyle = 'rgba(255,255,255,0.025)'; c.fillRect(20, y, w - 40, 2); }
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60), dw = w * 0.2, dh = h * 0.72, y = (h - dh) / 2;
  digit(c, m, w * 0.1, y, dw, dh, col, dim);
  c.fillStyle = col; c.shadowBlur = 24; c.shadowColor = col;
  for (const yy of [0.36, 0.64]) { c.beginPath(); c.arc(w * 0.385, y + dh * yy, dw * 0.09, 0, 7); c.fill(); }
  c.shadowBlur = 0;
  digit(c, Math.floor(s / 10), w * 0.46, y, dw, dh, col, dim); digit(c, s % 10, w * 0.71, y, dw, dh, col, dim);
};

export const build = (ctx) => {
  const { THREE, P, world, add, tbox, toon, texM, canvasTex, addClouds } = ctx;
  const basic = (o) => new THREE.MeshBasicMaterial(o);
  const plane = (w, h, mat, x, y, z, parent, ry = 0, rx = 0) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false }); m.rotation.set(rx, ry, 0); return m; };
  const SANS = '"DejaVu Sans", "Liberation Sans", Arial, sans-serif';
  const M = {
    white: toon({ color: '#f4f5f2' }), grey: toon({ color: '#c9ced4' }), greyD: toon({ color: '#6c727c' }), dark: toon({ color: '#2a2d34' }),
    steel: toon({ color: '#9aa3ae' }), steelD: toon({ color: '#5d6672' }), conc: toon({ color: '#b8b6b0' }), concD: toon({ color: '#8e8b86' }),
    rail: toon({ color: '#7a7672' }), green: toon({ color: '#1f9e5a' }),
    light: toon({ color: '#ffffff', emissive: '#fff6e0', emissiveIntensity: 1.2 }), black: basic({ color: '#06070a' }),
    seat: toon({ color: '#2f63bd' }), seatD: toon({ color: '#244e98' }), cover: toon({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.15 }),
    cream: toon({ color: '#efebe2' }), tray: toon({ color: '#b9bec6' }), woodD: toon({ color: '#6e4528' }), woodL: toon({ color: '#b07a48' }),
  };
  // ================= PLATFORM SET =================
  const PL = new THREE.Group(); world.add(PL); S.PL = PL;
  const floorTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = P.rng(5);
    g.fillStyle = '#d9dcdf'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '120,124,130'},${0.08 + r() * 0.08})`; g.fillRect(r() * 512, r() * 512, 2, 2); }
    g.strokeStyle = 'rgba(140,146,152,0.55)'; g.lineWidth = 3; for (let k = 0; k <= 4; k++) { g.beginPath(); g.moveTo(k * 128, 0); g.lineTo(k * 128, 512); g.stroke(); g.beginPath(); g.moveTo(0, k * 128); g.lineTo(512, k * 128); g.stroke(); }
    return c; })();
  const floorM = texM(floorTex, 30, 5);
  const platform = (z0, z1, edgeZ, dir) => {
    add(tbox(58, 1.25, z1 - z0, 2), M.conc, -16, -0.625, (z0 + z1) / 2, PL);
    const top = plane(58, z1 - z0, floorM, -16, 0.002, (z0 + z1) / 2, PL, 0, -Math.PI / 2); top.receiveShadow = true;
    plane(58, 0.12, M.white, -16, 0.006, edgeZ + dir * 0.08, PL, 0, -Math.PI / 2);
    const ty = canvasTex(1024, 64, (c, w, h) => { c.fillStyle = '#f2c81e'; c.fillRect(0, 0, w, h); c.fillStyle = '#d9ab0e'; for (let x = 8; x < w; x += 22) for (let y = 10; y < h; y += 22) { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); } });
    ty.wrapS = THREE.RepeatWrapping; ty.repeat.set(18, 1);
    plane(58, 0.32, toon({ map: ty }), -16, 0.007, edgeZ + dir * 0.85, PL, 0, -Math.PI / 2);
    add(tbox(58, 0.1, 0.4, 1), M.concD, -16, -0.1, edgeZ - dir * 0.1, PL);
  };
  platform(0, 9, 0, 1); platform(-17, -8.2, -8.2, -1);
  S.floorM = floorM;
  const qTex = canvasTex(256, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#ffffff'; c.lineWidth = 12; c.strokeRect(10, 10, w - 20, h - 20);
    c.fillStyle = '#1f9e5a'; for (const y of [120, 250, 380]) { c.beginPath(); c.moveTo(40, y + 60); c.lineTo(w / 2, y); c.lineTo(w - 40, y + 60); c.lineTo(w - 40, y + 90); c.lineTo(w / 2, y + 30); c.lineTo(40, y + 90); c.closePath(); c.fill(); } });
  const qM = new THREE.MeshToonMaterial({ gradientMap: ctx.grad, map: qTex, transparent: true, alphaTest: 0.3 });
  for (const dx of [-12.3, -24.7, -27.8, -37]) for (const sz of [-1, 1]) plane(0.7, 1.6, qM, dx + sz * 0.75, 0.008, 2.15, PL, Math.PI, -Math.PI / 2);
  for (const tz of [TRAIN_Z, -6.3]) {
    plane(80, 3.6, M.concD, -10, -1.3, tz, PL, 0, -Math.PI / 2);
    for (const s of [-0.72, 0.72]) add(tbox(80, 0.16, 0.08, 1), M.rail, -10, -1.18, tz + s, PL);
    for (let x = -48; x < 30; x += 1.2) add(tbox(0.3, 0.06, 2.3, 1), M.conc, x, -1.26, tz, PL, { cast: false });
  }
  plane(80, 1.6, M.concD, -10, -1.32, -3.95, PL, 0, -Math.PI / 2);
  const roofY = 6.4;
  for (let x = -38; x <= 8; x += 10) { add(tbox(0.36, roofY, 0.36, 1), M.steel, x, roofY / 2, 4.6, PL); add(tbox(0.36, roofY, 0.36, 1), M.steel, x, roofY / 2, -12.6, PL); }
  add(tbox(56, 0.28, 30, 4), M.grey, -15, roofY + 0.5, -4, PL, { cast: false });
  for (let x = -40; x <= 12; x += 10) add(tbox(0.22, 0.45, 30, 1), M.steel, x, roofY + 0.18, -4, PL, { cast: false });
  for (const z of [-10.5, 4.5]) add(tbox(56, 0.12, 0.3, 1), M.light, -15, roofY + 0.0, z, PL, { cast: false });
  for (const z of [-17, 9.5]) add(tbox(56, 0.6, 0.3, 1), M.white, -15, roofY + 0.4, z, PL, { cast: false });
  add(tbox(58, 1.1, 0.12, 1), M.steelD, -16, 0.55, 9.05, PL); add(tbox(58, 1.1, 0.12, 1), M.steelD, -16, 0.55, -17.05, PL);
  // tunnel portal at x = -42 with an arched opening on our track
  const sh = new THREE.Shape(); sh.moveTo(-40, -2); sh.lineTo(40, -2); sh.lineTo(40, 11); sh.lineTo(-40, 11); sh.lineTo(-40, -2);
  const hz = -TRAIN_Z, hole = new THREE.Path(); hole.moveTo(hz - 2.6, -1.3); hole.lineTo(hz + 2.6, -1.3); hole.lineTo(hz + 2.6, 2.6); hole.absarc(hz, 2.6, 2.6, 0, Math.PI, false); hole.lineTo(hz - 2.6, -1.3); sh.holes.push(hole);
  const portal = add(new THREE.ExtrudeGeometry(sh, { depth: 1.6, bevelEnabled: false }), toon({ color: '#bdbab3' }), -42.8, 0, 0, PL);
  portal.rotation.y = Math.PI / 2;
  add(tbox(30, 9, 6.2, 2), M.black, -58.5, 1.5, TRAIN_Z, PL, { cast: false });
  // signs
  const gleis = canvasTex(1400, 300, (c, w, h) => {
    c.fillStyle = '#1b2a3a'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f9e5a'; c.fillRect(0, h - 34, w, 34);
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(150, h / 2 - 14, 104, 0, 7); c.fill();
    c.fillStyle = '#1b2a3a'; c.font = `bold 120px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('20', 150, h / 2 - 8);
    c.fillStyle = '#ffffff'; c.textAlign = 'left'; c.font = `bold 130px ${SANS}`; c.fillText('Gleis 20 – Tokio', 290, h / 2 - 8);
  });
  const signBoard = (x, y, z, ry) => { const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = ry; PL.add(G);
    add(tbox(3.6, 0.82, 0.12, 1), M.dark, 0, 0, 0, G);
    for (const s of [-1, 1]) { const m = plane(3.5, 0.75, basic({ map: gleis }), 0, 0, s * 0.065, G, s < 0 ? Math.PI : 0); m.userData.ndSkip = true; }
    for (const s of [-1, 1]) add(tbox(0.05, roofY - y, 0.05, 1), M.steelD, s * 1.4, (roofY - y) / 2 + 0.4, 0, G);
    return G; };
  signBoard(-30, 2.45, 3.2, Math.PI / 2); signBoard(-21, 2.45, 7.4, 0);
  // countdown kiosk
  const cnt = document.createElement('canvas'); cnt.width = 1024; cnt.height = 440; S.cntC = cnt; S.cntT = new THREE.CanvasTexture(cnt); S.cntT.colorSpace = THREE.SRGBColorSpace; S.cntT.anisotropy = 8;
  drawCounter(cnt.getContext('2d'), 1024, 440, 420); S.cntSec = 420;
  S.cntM = basic({ map: S.cntT, toneMapped: false });
  const abf = canvasTex(600, 150, (c, w, h) => { c.fillStyle = '#1f9e5a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.strokeRect(10, 10, w - 20, h - 20);
    c.fillStyle = '#ffffff'; c.font = `bold 92px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Abfahrt', w / 2, h / 2 + 4); });
  const kiosk = (parent, x, z, ry, sc = 1) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; G.scale.setScalar(sc); parent.add(G);
    add(tbox(0.55, 1.5, 0.4, 1), M.steelD, 0, 0.75, 0, G); add(tbox(1.4, 0.08, 0.9, 1), M.steelD, 0, 0.04, 0, G);
    add(tbox(3.4, 1.62, 0.5, 1), M.dark, 0, 2.2, 0, G);
    for (const s of [-1, 1]) { const m = plane(3.12, 1.34, S.cntM, 0, 2.2, s * 0.26, G, s < 0 ? Math.PI : 0); m.renderOrder = 3; }
    for (const s of [-1, 1]) { add(tbox(1.3, 0.34, 0.06, 1), M.white, 0, 1.18, s * 0.23, G); const m = plane(1.24, 0.31, basic({ map: abf }), 0, 1.18, s * 0.27, G, s < 0 ? Math.PI : 0); m.userData.ndSkip = true; }
    return G; };
  S.kioskPL = kiosk(PL, KIOSK.x, KIOSK.z, KIOSK.rot);
  for (const x of [-30, -2]) { add(tbox(2.0, 0.08, 0.5, 1), M.steel, x, 0.45, 7.6, PL); add(tbox(2.0, 0.5, 0.06, 1), M.steel, x, 0.75, 7.85, PL); for (const s of [-0.8, 0.8]) add(tbox(0.06, 0.45, 0.45, 1), M.steelD, x + s, 0.22, 7.6, PL); }
  // skyline
  const r = P.rng(77), winC = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#e8edf2'; g.fillRect(0, 0, 256, 512);
    for (let y = 12; y < 512; y += 28) for (let x = 12; x < 256; x += 30) { g.fillStyle = (x * 7 + y * 3) % 11 < 3 ? '#a9c4dc' : '#7d9cbb'; g.fillRect(x, y, 20, 18); } return c; })();
  const tower = (parent, x, z, w, d, h) => { const cols = ['#ffffff', '#e4ecf4', '#d2dde8', '#f4f2ee', '#c8d6e6']; return add(tbox(w, h, d, 1), texM(winC, w / 8, h / 16, cols[(r() * 5) | 0]), x, h / 2 - 2, z, parent, { cast: false }); };
  for (let i = 0; i < 46; i++) { const side = i % 2 ? 1 : -1, x = -120 + r() * 220, z = side > 0 ? 30 + r() * 90 : -40 - r() * 90; tower(PL, x, z, 8 + r() * 14, 8 + r() * 14, 20 + r() * 80); }
  for (let i = 0; i < 18; i++) tower(PL, 30 + r() * 120, -60 + r() * 120, 10 + r() * 14, 10 + r() * 14, 25 + r() * 90);
  plane(1400, 1400, toon({ color: '#9aa0a6' }), 0, -2.2, 0, PL, 0, -Math.PI / 2);
  addClouds(14, 90, 650, 110);

  // ================= TRAIN (loft geometry) =================
  const E = (s, k) => Math.sign(s) * Math.pow(Math.abs(s), k);
  const NP = 64;
  const loft = (stations) => {
    const pos = [], uv = [], idx = [];
    stations.forEach((st) => { for (let i = 0; i <= NP; i++) { const ph = (i / NP) * Math.PI * 2, k = 2 / st.e;
      const z = (st.w / 2) * E(Math.sin(ph), k), y = st.yc - (st.h / 2) * E(Math.cos(ph), k);
      pos.push(st.x, y, z); uv.push(st.u, ph <= Math.PI ? ph / Math.PI : (2 * Math.PI - ph) / Math.PI); } });
    for (let si = 0; si < stations.length - 1; si++) for (let i = 0; i < NP; i++) { const a = si * (NP + 1) + i, b = a + NP + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  const BW = 3.4, BH = 3.6, BYC = 0.8;
  const vOfY = (y) => { const q = (y - BYC) / (BH / 2), c = -E(q, 2.5); return Math.acos(Math.max(-1, Math.min(1, c))) / Math.PI; };
  const bands = (c, w, h, vy) => {
    c.fillStyle = '#f6f7f5'; c.fillRect(0, 0, w, h);
    const band = (v0, v1, col) => { c.fillStyle = col; c.fillRect(0, vy(v1), w, vy(v0) - vy(v1)); };
    band(0, vOfY(-0.62), '#3a3f46'); band(vOfY(-0.62), vOfY(-0.2), '#cfd5db');
    band(vOfY(0.22), vOfY(0.42), '#1f9e5a'); band(vOfY(0.48), vOfY(0.53), '#1f9e5a');
  };
  const bodyTex = canvasTex(2048, 512, (c, w, h) => { const vy = (v) => (1 - v) * h; bands(c, w, h, vy);
    const ux = (x) => x / CAR_L * w;
    for (let x = 3.0; x < CAR_L - 3.0; x += 1.04) { c.fillStyle = '#26324a'; c.beginPath(); c.roundRect(ux(x), vy(vOfY(1.62)), ux(0.72), vy(vOfY(0.98)) - vy(vOfY(1.62)), 10); c.fill(); c.fillStyle = 'rgba(160,200,235,.35)'; c.fillRect(ux(x) + 6, vy(vOfY(1.6)) + 4, ux(0.25), 8); }
    for (const dx of [1.3, CAR_L - 1.3]) { c.fillStyle = '#1c2230'; c.fillRect(ux(dx - 0.55), vy(vOfY(1.98)), ux(1.1), vy(vOfY(0.0)) - vy(vOfY(1.98))); c.fillStyle = '#e8d8a8'; c.fillRect(ux(dx - 0.45), vy(vOfY(1.92)), ux(0.9), 10); }
  });
  const noseTex = canvasTex(1024, 512, (c, w, h) => { const vy = (v) => (1 - v) * h; bands(c, w, h, vy);
    c.fillStyle = '#1e2a40'; c.beginPath(); c.moveTo(w * 0.36, vy(0.995)); c.lineTo(w * 0.6, vy(0.995)); c.lineTo(w * 0.66, vy(0.8)); c.lineTo(w * 0.42, vy(0.72)); c.closePath(); c.fill();
    c.fillStyle = 'rgba(170,210,240,.45)'; c.fillRect(w * 0.44, vy(0.94), w * 0.08, 6);
    c.fillStyle = '#1f9e5a'; c.beginPath(); c.moveTo(0, vy(vOfY(0.22))); c.lineTo(w * 0.97, vy(0.5)); c.lineTo(w * 0.97, vy(0.46)); c.lineTo(0, vy(vOfY(0.42))); c.fill();
  });
  const bodyM = toon({ map: bodyTex }), noseM = toon({ map: noseTex });
  const noseGeo = (() => { const st = []; const N = 36;
    for (let k = 0; k <= N; k++) { const t = k / N, x = t * NOSE_L;
      const wf = Math.sqrt(Math.max(0.0004, 1 - Math.pow(t, 2.4))) * (1 - 0.1 * t);
      const bot = -1.0 + 0.82 * Math.pow(t, 2.2), bump = 0.28 * Math.exp(-Math.pow((t - 0.42) / 0.12, 2));
      const top = 2.6 - 2.78 * Math.pow(t, 1.15) + bump * (1 - t);
      const hh = Math.max(0.03, top - bot) * (t > 0.9 ? Math.sqrt(Math.max(0.01, (1 - t) / 0.1)) : 1); st.push({ x, w: BW * wf, h: hh, yc: (top + bot) / 2, e: 5 - 2.4 * t, u: t }); }
    return loft(st); })();
  const bodyGeo = (L) => loft([{ x: -L, w: BW, h: BH, yc: BYC, e: 5, u: L / CAR_L }, { x: 0, w: BW, h: BH, yc: BYC, e: 5, u: 0 }]);
  const doorTex = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#f6f7f5'; c.fillRect(0, 0, w, h); const vy = (y) => (1 - y / 1.98) * h;
    c.fillStyle = '#1f9e5a'; c.fillRect(0, vy(0.42), w, vy(0.22) - vy(0.42)); c.fillRect(0, vy(0.53), w, vy(0.48) - vy(0.53));
    c.fillStyle = '#26324a'; c.beginPath(); c.roundRect(60, vy(1.7), w - 120, vy(1.1) - vy(1.7), 12); c.fill();
    c.strokeStyle = '#9aa0a8'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); });
  const doorM = toon({ map: doorTex });
  const TR = new THREE.Group(); PL.add(TR); S.TR = TR; S.doors = []; S.hl = [];
  TR.position.z = TRAIN_Z;
  add(noseGeo, noseM, -NOSE_L, 0, 0, TR);
  let x0 = -NOSE_L;
  const car = (L) => { add(bodyGeo(L), bodyM, x0, 0, 0, TR);
    add(tbox(L, 0.5, 2.6, 1), M.dark, x0 - L / 2, -1.1, 0, TR);
    for (const dx of [1.3, L - 1.3]) for (const s of [-1, 1]) { const d = add(tbox(0.56, 1.98, 0.04, 1), doorM, x0 - dx + s * 0.28, 0.99, BW / 2 + 0.012, TR); d.userData.base = x0 - dx + s * 0.28; d.userData.s = s; S.doors.push(d); }
    x0 -= L; add(tbox(GAP + 0.1, BH * 0.86, BW * 0.86, 1), M.dark, x0 - GAP / 2, BYC, 0, TR); x0 -= GAP; };
  car(CAR1_L); for (let i = 0; i < 3; i++) car(CAR_L);
  for (const s of [-1, 1]) { const h = add(new THREE.SphereGeometry(0.13, 12, 8), toon({ color: '#fffbe0', emissive: '#fff2b0', emissiveIntensity: 2 }), -1.1, -0.2, s * 0.36, TR, { cast: false }); h.scale.set(0.6, 0.7, 1.6); S.hl.push(h); }
  S.noseGeo = noseGeo;

  // ================= INTERIOR SET =================
  const IN = new THREE.Group(); IN.position.set(...INT0); world.add(IN); S.IN = IN;
  const carpet = canvasTex(256, 256, (c, w, h) => { const rr = P.rng(9); c.fillStyle = '#5a6a8a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(${rr() < 0.5 ? '30,40,70' : '150,170,200'},.25)`; c.fillRect(rr() * w, rr() * h, 2, 2); } });
  carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping; carpet.repeat.set(12, 2);
  plane(22, 3.5, toon({ map: carpet }), 0, 0.001, 0, IN, 0, -Math.PI / 2);
  plane(22, 0.5, toon({ color: '#8f9bb0' }), 0, 0.004, 0.0, IN, 0, -Math.PI / 2);
  S.rows = []; S.rowX = []; S.covers = [];
  const seatBench = (n, zc, row, k) => {
    const G = new THREE.Group(); G.position.set(0, 0, zc); row.add(G); G.userData.bench = true;
    const W = n * 0.46;
    add(tbox(0.42, 0.36, W - 0.2, 1), M.steelD, 0, 0.18, 0, G);
    add(tbox(0.52, 0.14, W, 1), M.seat, 0, 0.44, 0, G);
    for (let i = 0; i < n; i++) { const z = -W / 2 + 0.23 + i * 0.46;
      const bk = add(tbox(0.12, 0.78, 0.42, 1), M.seat, 0.28, 0.86, z, G); bk.rotation.z = -0.14;
      add(tbox(0.03, 0.34, 0.3, 1), M.tray, 0.355, 0.86, z, G).rotation.z = -0.14;
      const cv = add(tbox(0.15, 0.22, 0.37, 1), M.cover, 0.25, 1.17, z, G); cv.rotation.z = -0.14; S.covers.push({ m: cv, k, zc: zc + z });
    }
    for (let i = 0; i <= n; i++) add(tbox(0.42, 0.06, 0.06, 1), M.seatD, 0.02, 0.62, -W / 2 + i * 0.46, G);
  };
  for (let k = 0; k < 20; k++) { const x = -9.88 + k * 1.04, row = new THREE.Group(); row.position.set(x, 0, 0); IN.add(row);
    seatBench(3, -1.0, row, k); seatBench(2, 0.92, row, k); S.rows.push(row); S.rowX.push(x); }
  for (const s of [-1, 1]) { const z = s * 1.75;
    add(tbox(22, 0.85, 0.1, 2), M.cream, 0, 0.425, z, IN); add(tbox(22, 0.6, 0.1, 2), M.cream, 0, 1.95, z, IN);
    for (let k = 0; k <= 20; k++) add(tbox(0.34, 0.85, 0.1, 1), M.cream, -10.4 + k * 1.04, 1.225, z, IN);
    add(tbox(22, 0.05, 0.12, 1), M.steelD, 0, 0.86, z - s * 0.05, IN);
    add(tbox(21.6, 0.04, 0.46, 1), M.steel, 0, 2.0, z - s * 0.3, IN); add(tbox(21.6, 0.06, 0.04, 1), M.steelD, 0, 2.03, z - s * 0.53, IN);
    const pn = add(tbox(22, 0.06, 1.3, 1), M.cream, 0, 2.42, s * 1.12, IN); pn.rotation.x = s * 0.32;
  }
  add(tbox(22, 0.06, 0.9, 1), M.cream, 0, 2.58, 0, IN); add(tbox(21, 0.04, 0.22, 1), M.light, 0, 2.54, 0, IN, { cast: false });
  for (const s of [-1, 1]) { const x = s * 10.95; add(tbox(0.12, 2.7, 3.6, 1), M.cream, x, 1.35, 0, IN);
    add(tbox(0.14, 2.0, 0.9, 1), M.steel, x - s * 0.02, 1.0, 0.0, IN); add(tbox(0.16, 0.5, 0.5, 1), toon({ color: '#3a4a66' }), x - s * 0.03, 1.35, 0.0, IN);
    add(tbox(0.16, 0.5, 1.2, 1), M.dark, x - s * 0.05, 2.25, 0.0, IN); const d = plane(1.1, 0.46, S.cntM, x - s * 0.135, 2.25, 0.0, IN, -s * Math.PI / 2); d.renderOrder = 3; }
  plane(60, 14, floorM, 0, -0.02, 9, IN, 0, -Math.PI / 2);
  plane(60, 0.3, toon({ color: '#f2c81e' }), 0, -0.01, 2.6, IN, 0, -Math.PI / 2);
  kiosk(IN, 0.2, 5.8, Math.PI).position.y = -0.75; kiosk(IN, -7.5, 5.8, Math.PI).position.y = -0.75;
  for (let x = -25; x <= 25; x += 10) add(tbox(0.36, 7, 0.36, 1), M.steel, x, 2.5, 8.5, IN);
  add(tbox(60, 0.3, 14, 1), M.grey, 0, 6.5, 9, IN, { cast: false });
  for (let i = 0; i < 10; i++) tower(IN, -50 + i * 11, 40 + (i % 3) * 14, 9, 9, 30 + (i * 37) % 50);
  plane(60, 10, M.conc, 0, 2, -6, IN);

  // ================= CUTAWAY (dollhouse) SET =================
  const CU = new THREE.Group(); CU.position.set(...CUT0); world.add(CU); S.CU = CU; S.cutRows = [];
  plane(200, 200, toon({ color: '#e6ebf0' }), 0, -1.4, 0, CU, 0, -Math.PI / 2);
  plane(200, 60, toon({ color: '#dfe6ee' }), 0, 20, -12, CU);
  const CL = 5.4;
  for (let i = 0; i < 6; i++) { const cx = -15 + i * (CL + 0.35);
    add(tbox(CL, 0.3, 3.0, 1), M.white, cx, -0.15, 0, CU); add(tbox(CL, 0.6, 2.6, 1), M.dark, cx, -0.75, 0, CU);
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.42, 0.42, 2.7, 16), M.greyD, cx + s * 1.6, -1.0, 0, CU).rotation.x = Math.PI / 2;
    add(tbox(CL, 0.12, 0.06, 1), M.green, cx, -0.12, 1.5, CU);
    add(tbox(CL, 2.5, 0.18, 1), M.white, cx, 1.25, -1.45, CU);
    for (let k = 0; k < 4; k++) add(tbox(0.8, 0.6, 0.04, 1), toon({ color: '#9cc8ec', emissive: '#bfe0ff', emissiveIntensity: 0.3 }), cx - 1.95 + k * 1.3, 1.35, -1.34, CU);
    add(tbox(CL, 0.1, 0.03, 1), M.green, cx, 0.65, -1.35, CU);
    add(tbox(CL, 0.28, 3.0, 1), M.white, cx, 2.62, 0, CU); add(tbox(CL, 0.1, 0.06, 1), M.green, cx, 2.5, 1.5, CU);
    for (const s of [-1, 1]) add(tbox(0.16, 2.9, 3.0, 1), M.white, cx + s * (CL / 2 - 0.08), 1.25, 0, CU);
    const d = plane(0.9, 0.38, S.cntM, cx + 1.5, 2.15, -1.33, CU); d.renderOrder = 3;
    for (let k = 0; k < 4; k++) { const row = new THREE.Group(); row.position.set(cx - 1.9 + k * 1.05, 0, -0.35); CU.add(row);
      add(tbox(0.45, 0.12, 1.5, 1), M.seat, 0, 0.42, 0, row); const b = add(tbox(0.1, 0.7, 1.5, 1), M.seat, 0.24, 0.8, 0, row); b.rotation.z = -0.14;
      add(tbox(0.13, 0.2, 1.4, 1), M.cover, 0.22, 1.12, 0, row).rotation.z = -0.14; add(tbox(0.3, 0.36, 1.0, 1), M.steelD, 0, 0.18, 0, row); S.cutRows.push(row); }
  }
  const nz = add(noseGeo, noseM, -15 + 5 * (CL + 0.35) + CL / 2, 0.2, 0, CU); nz.scale.set(0.6, 0.9, 0.9);
  const tl = add(noseGeo, noseM, -15 - CL / 2, 0.2, 0, CU); tl.scale.set(-0.6, 0.9, 0.9);

  // ================= THEATRE (curtains + spotlights, placed in update) =================
  const TH = new THREE.Group(); world.add(TH); S.TH = TH; TH.visible = false;
  const velvet = canvasTex(512, 1024, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0);
    for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, i % 2 ? '#7e0e1a' : '#c8202e'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const v = c.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,.35)'); v.addColorStop(0.3, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
    c.fillStyle = '#e8b84a'; c.fillRect(0, h - 28, w, 28); });
  const curM = new THREE.MeshBasicMaterial({ map: velvet, side: THREE.DoubleSide });
  S.curL = plane(4.2, 8, curM, 0, 0, 0, TH); S.curR = plane(4.2, 8, curM, 0, 0, 0, TH);
  const val = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#a81624'; c.fillRect(0, 0, w, h * 0.62); for (let i = 0; i < 8; i++) { c.beginPath(); c.arc((i + 0.5) * w / 8, h * 0.6, w / 16, 0, Math.PI); c.fill(); }
    c.fillStyle = '#e8b84a'; c.fillRect(0, h * 0.5, w, 16); for (let i = 0; i < 8; i++) { c.beginPath(); c.arc((i + 0.5) * w / 8, h * 0.6, w / 16, 0.15, Math.PI - 0.15); c.lineWidth = 12; c.strokeStyle = '#e8b84a'; c.stroke(); } });
  S.val = plane(9, 2.2, new THREE.MeshBasicMaterial({ map: val, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }), 0, 0, 0, TH);
  const coneM = new THREE.MeshBasicMaterial({ color: '#fff3c8', transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  S.cones = []; for (let i = 0; i < 4; i++) { const cg = new THREE.ConeGeometry(1.1, 7, 24, 1, true); cg.translate(0, -3.5, 0); const m = new THREE.Mesh(cg, coneM.clone()); m.userData.ndSkip = true; m.renderOrder = 4; world.add(m); m.visible = false; S.cones.push(m); }

  // ================= LECTURE HALL SET =================
  const HA = new THREE.Group(); HA.position.set(...HALL0); world.add(HA); S.HA = HA;
  const panel = texM(P.planks(12), 3, 1, '#d8a878');
  plane(30, 30, texM(P.planks(11), 6, 6, '#c89868'), 0, 0, 0, HA, 0, -Math.PI / 2);
  add(tbox(16, 7.5, 0.3, 3), panel, 0, 3.5, -6.3, HA); for (const s of [-1, 1]) add(tbox(0.3, 9, 18, 3), panel, s * 7.2, 3.5, 2, HA);
  add(tbox(16, 0.3, 18, 3), M.cream, 0, 7.2, 2, HA, { cast: false });
  for (let k = 0; k < 3; k++) for (const s of [-1, 1]) add(tbox(0.4, 0.12, 2.2, 1), M.light, s * 2.5, 7.0, -3 + k * 4, HA, { cast: false });
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) add(tbox(0.1, 2.4, 1.6, 1), toon({ color: '#cfe6f6', emissive: '#e0f2ff', emissiveIntensity: 0.5 }), s * 7.0, 3.8, -2.5 + k * 3.6, HA, { cast: false });
  const board = canvasTex(2048, 720, (c, w, h) => {
    c.fillStyle = '#20402e'; c.fillRect(0, 0, w, h);
    const rr = P.rng(3); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(255,255,255,${0.02 + rr() * 0.04})`; c.fillRect(rr() * w, rr() * h, 3 + rr() * 30, 2); }
    const chalk = (fn, lw = 9, col = 'rgba(245,245,235,.92)') => { c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); fn(); c.stroke(); };
    c.fillStyle = 'rgba(245,245,235,.95)'; c.font = `bold italic 128px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('Das 7-Minuten-Wunder', w / 2, 120); chalk(() => { c.moveTo(w * 0.17, 205); c.quadraticCurveTo(w / 2, 225, w * 0.83, 200); }, 7);
    const ty = 450; chalk(() => { c.moveTo(250, ty + 90); c.lineTo(1250, ty + 90); c.quadraticCurveTo(1550, ty + 90, 1690, ty + 60); c.quadraticCurveTo(1520, ty - 40, 1250, ty - 60); c.lineTo(250, ty - 60); c.closePath(); }, 10);
    chalk(() => { c.moveTo(250, ty + 30); c.lineTo(1300, ty + 30); c.quadraticCurveTo(1500, ty + 40, 1640, ty + 58); }, 8, 'rgba(120,220,150,.95)');
    for (let x = 300; x < 1180; x += 90) chalk(() => { c.rect(x, ty - 35, 55, 40); }, 6);
    chalk(() => { c.moveTo(1380, ty - 40); c.lineTo(1470, ty - 22); c.lineTo(1430, ty - 2); c.lineTo(1360, ty - 10); c.closePath(); }, 6);
    for (const x of [330, 520, 1000, 1190]) chalk(() => { c.arc(x, ty + 100, 26, 0, 7); }, 6);
    c.font = `bold italic 84px ${SANS}`; c.fillText('1,5 + 0,5 + 4 + 1 = 7', w / 2, 650);
    chalk(() => { c.arc(1840, 450, 110, 0, 7); c.moveTo(1840, 450); c.lineTo(1840, 370); c.moveTo(1840, 450); c.lineTo(1900, 480); }, 8);
  });
  add(tbox(8.4, 3.1, 0.12, 1), M.woodD, 0, 2.15, -6.1, HA);
  plane(8.0, 2.8, basic({ map: board }), 0, 2.15, -6.03, HA);
  add(tbox(8.0, 0.08, 0.2, 1), M.woodD, 0, 0.72, -5.98, HA);
  add(tbox(2.0, 1.05, 0.8, 1), M.woodL, 2.8, 0.52, -4.6, HA);
  for (let k = 0; k < 4; k++) { const z = -1.6 + k * 1.5, y = k * 0.38;
    if (k) add(tbox(13, y, 1.5, 2), M.woodD, 0, y / 2, z + 0.2, HA);
    add(tbox(12, 0.08, 0.5, 1), M.woodL, 0, y + 0.82, z - 0.45, HA); add(tbox(12, 0.78, 0.06, 1), M.woodD, 0, y + 0.4, z - 0.68, HA);
    add(tbox(12, 0.08, 0.45, 1), M.woodL, 0, y + 0.45, z + 0.15, HA); }
};

export const update = (ctx, W, f) => {
  const set = W.set || 'plat';
  S.PL.visible = set === 'plat'; S.IN.visible = set === 'int'; S.CU.visible = set === 'cut'; S.HA.visible = set === 'hall';
  const sec = Math.max(0, Math.ceil(W.sec ?? 420));
  if (sec !== S.cntSec) { S.cntSec = sec; drawCounter(S.cntC.getContext('2d'), 1024, 440, sec); S.cntT.needsUpdate = true; }
  S.kioskPL.visible = W.kiosk !== false;
  S.TR.position.x = W.tx ?? 0;
  const dOpen = W.doors ?? 0; for (const d of S.doors) d.position.x = d.userData.base + d.userData.s * dOpen * 0.56;
  for (const h of S.hl) h.material.emissiveIntensity = W.hl ?? 2;
  if (set === 'int') S.rows.forEach((r, k) => { const a = Math.PI * (W.seat ? W.seat(k) : (W.seatsDone ? 1 : 0)); for (const b of r.children) b.rotation.y = a; });
  if (set === 'int') for (const c of S.covers) { const t = W.cover ? W.cover(c.k, c.zc) : 1; c.m.scale.set(t, Math.max(0.01, t), t); }
  if (set === 'cut') S.cutRows.forEach((r, k) => { r.rotation.y = W.cutSeat ? Math.PI * W.cutSeat(k) : 0; });
  const th = W.theatre; S.TH.visible = !!th; S.cones.forEach((c) => (c.visible = false));
  if (th) {
    S.TH.position.set(...th.pos); S.TH.lookAt(...th.look);
    const o = th.open, half = 2.1;
    S.curL.position.set(half + 0.15 + o * 3.4, 1.2, th.d); S.curR.position.set(-half - 0.15 - o * 3.4, 1.2, th.d);
    S.val.position.set(0, th.vy ?? 4.0, th.d - 0.05); S.curL.visible = S.curR.visible = S.val.visible = !th.noCurtain;
    (th.spots || []).forEach((p, i) => { const c = S.cones[i]; c.visible = true; c.position.set(p[0], p[1] + 7, p[2]); c.material.opacity = 0.16 * (th.spotK ?? 1); });
  }
};
