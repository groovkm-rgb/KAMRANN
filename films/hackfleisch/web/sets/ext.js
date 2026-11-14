// M2 / M6 / M8a: night exterior. Prison among hills (walls, towers, searchlights, entrance sign),
// quiet tree-lined street outside the east wall with a manhole, and a dark country roadside further east.
import { paint, hash, clamp } from '../fx3d.js';
export const EXT = {
  gate: [0, 0, -40], sign: [8.3, 2.6, -38.6], manhole: [100, 0, -62], street: { x0: 64, x1: 215, z: -62 }, road: [255, 0, -62],
};
const S = {};
export function build(ctx, fx, G) {
  const { THREE, add, tbox, toon, P } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const tm = (c, rx = 1, ry = 1, color = '#ffffff') => toon({ map: P.tex(c, rx, ry), color });
  const M = {
    wall: tm(cv(512, 512, (g, w, h) => paint.blocks(g, w, h, [210, 5, 46], 128, 64, 21)), 1, 1), wallTop: toon({ color: '#5a5e62' }),
    ground: tm(cv(512, 512, (g, w, h) => paint.grassDark(g, w, h, 22, '#2a3e2c')), 60, 60), asphalt: tm(cv(512, 512, (g, w, h) => paint.asphalt(g, w, h, 23)), 30, 3),
    concrete: tm(cv(256, 256, (g, w, h) => paint.concrete(g, w, h, '#8a8c88', 24)), 1, 1), block: tm(cv(512, 512, (g, w, h) => paint.concrete(g, w, h, '#7a7e7a', 25)), 4, 2),
    roof: toon({ color: '#3a3e48' }), tower: tm(cv(256, 256, (g, w, h) => paint.concrete(g, w, h, '#8a8e8c', 26)), 1, 2), glassG: toon({ color: '#c8ffd8', emissive: '#7aa88a', emissiveIntensity: 0.9 }),
    hill: toon({ color: '#1e2c2c' }), hill2: toon({ color: '#283838' }), dark: toon({ color: '#1c1e22' }), metal: toon({ color: '#4a5058' }),
    trunk: toon({ color: '#3a2c24' }), crown: toon({ color: '#ffffff' }), kerb: toon({ color: '#8a8a86' }), side: toon({ color: '#5a5c5e' }), lampHead: toon({ color: '#ffd090', emissive: '#ff9a30', emissiveIntensity: 1.5 }),
    winWarm: toon({ color: '#ffc870', emissive: '#ff9a40', emissiveIntensity: 1.1 }), winDark: toon({ color: '#1c2234' }), wire: toon({ color: '#6a6e76' }), bush: toon({ color: '#ffffff' }),
  };
  // ground + hills
  const gnd = add(new THREE.PlaneGeometry(1400, 1400), M.ground, 120, 0, -100, G, { cast: false }); gnd.rotation.x = -Math.PI / 2;
  const R = (k) => hash(k, 77);
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, d = 230 + R(i) * 200; const h = add(new THREE.SphereGeometry(70 + R(i + 50) * 60, 22, 12), i % 2 ? M.hill : M.hill2, 60 + Math.cos(a) * d, -30, -90 + Math.sin(a) * d, G, { cast: false }); h.scale.y = 0.45 + R(i + 9) * 0.35; }
  // ---- prison walls (south wall z=-40 with the gate, east wall x=60) ----
  const WH = 9;
  const wallSeg = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), m = add(tbox(L, WH, 1.6, 3), M.wall, (x0 + x1) / 2, WH / 2, (z0 + z1) / 2, G); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    const cap = add(tbox(L, 0.4, 2.0, 2), M.wallTop, (x0 + x1) / 2, WH + 0.2, (z0 + z1) / 2, G); cap.rotation.y = m.rotation.y;
    // barbed wire coils along the top
    const n = Math.floor(L / 0.9), list = []; for (let k = 0; k < n; k++) { const t = (k + 0.5) / n; list.push({ p: [x0 + (x1 - x0) * t, WH + 0.75, z0 + (z1 - z0) * t], r: [0, m.rotation.y + Math.PI / 2, 0], s: 1 }); }
    fx.inst(G, new THREE.TorusGeometry(0.42, 0.025, 4, 14), M.wire, list, { cast: false });
    for (let k = 0; k < n; k += 3) { const t = (k + 0.5) / n; add(tbox(0.08, 1.2, 0.08, 1), M.metal, x0 + (x1 - x0) * t, WH + 0.6, z0 + (z1 - z0) * t, G); } };
  wallSeg(-70, -40, -4.5, -40); wallSeg(4.5, -40, 60, -40); wallSeg(60, -40, 60, -170); wallSeg(-70, -40, -70, -170); wallSeg(-70, -170, 60, -170);
  // gate house + steel gate + sign
  add(tbox(9, 11, 4, 3), M.tower, 0, 5.5, -40.5, G).position.y = 5.5;
  add(tbox(6.5, 6, 0.4, 2), toon({ map: P.tex(cv(256, 256, (g, w, h) => paint.metal(g, w, h, '#5a6068', 27)), 2, 2) }), 0, 3, -38.2, G);
  for (const x of [-4.8, 4.8]) add(tbox(1.4, 7, 1.4, 2), M.concrete, x, 3.5, -38.2, G);
  for (let k = 0; k < 6; k++) add(tbox(0.7, 0.5, 0.1, 1), M.glassG, -2.5 + k * 1.0, 9.2, -38.4, G, { cast: false });
  S.sign = fx.sign(G, EXT.sign, 4.6, 0.95, 1550, 320, (g, w, h) => {
    g.fillStyle = '#e8ece8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e5a3a'; g.fillRect(0, 0, w, 40); g.fillRect(0, h - 40, w, 40);
    g.strokeStyle = '#1a1c1e'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = '#16181a'; g.font = 'bold 100px "DejaVu Sans", sans-serif'; const mw = g.measureText('Hochsicherheitsgefängnis').width; const fs = Math.min(150, 100 * (w * 0.9) / mw); g.font = `bold ${fs}px "DejaVu Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Hochsicherheitsgefängnis', w / 2, h / 2 + 4);
  }, { fog: false, color: '#ffe2c0' });
  add(tbox(4.85, 1.15, 0.15, 1), M.metal, EXT.sign[0], EXT.sign[1], EXT.sign[2] - 0.1, G);
  for (const dx of [-2.2, 2.2]) add(tbox(0.14, 2.6, 0.14, 1), M.metal, EXT.sign[0] + dx, 1.3, EXT.sign[2] - 0.12, G);
  // sign lamp (sodium) + barrier + guard booth
  const lampAt = (x, z, h = 6.5, dirx = 0, dirz = 1) => { add(new THREE.CylinderGeometry(0.08, 0.12, h, 8), M.metal, x, h / 2, z, G); const arm = add(tbox(1.2, 0.08, 0.08, 1), M.metal, x + dirx * 0.6, h, z + dirz * 0.6, G); arm.rotation.y = Math.atan2(-dirz, dirx);
    const hx = x + dirx * 1.15, hz = z + dirz * 1.15; add(tbox(0.5, 0.18, 0.28, 1), M.dark, hx, h - 0.05, hz, G); add(tbox(0.4, 0.06, 0.2, 1), M.lampHead, hx, h - 0.16, hz, G, { cast: false });
    const gl = fx.glow(G, [hx, h - 0.25, hz], '#ffa040', 3.2, 0.85); const cone = fx.beam(G, [hx, h - 0.2, hz], h - 0.2, 0.1, 2.6, '#ff9a40', 0.12); cone.aim(G.position.x + hx, G.position.y, G.position.z + hz);
    const pool = fx.quad(G, [hx, 0.03, hz], 7, 7, '#ff9a40', 0.45, { rx: -Math.PI / 2 }); return { hx, h, hz, gl, cone, pool }; };
  S.lamps = [lampAt(10.5, -35.5, 6, -1, -0.3)];
  add(tbox(6, 0.15, 0.15, 1), toon({ color: '#e8e8e0' }), -6, 1.0, -33, G); for (let k = 0; k < 6; k++) add(tbox(0.5, 0.16, 0.17, 1), toon({ color: '#c8302a' }), -8.5 + k, 1.0, -33, G);
  add(tbox(2.2, 2.6, 2.2, 1), M.concrete, -10, 1.3, -34, G); add(tbox(1.6, 0.8, 0.1, 1), M.glassG, -10, 1.8, -32.85, G, { cast: false });
  // fence + coiled wire in the near foreground (blurred layer)
  for (let x = -30; x <= 30; x += 3) add(tbox(0.1, 3, 0.1, 1), M.metal, x, 1.5, -30, G);
  add(tbox(60, 0.05, 0.05, 1), M.wire, 0, 2.9, -30, G); add(tbox(60, 0.05, 0.05, 1), M.wire, 0, 0.5, -30, G);
  fx.inst(G, new THREE.TorusGeometry(0.4, 0.02, 4, 12), M.wire, Array.from({ length: 70 }, (_, k) => ({ p: [-30 + k * 0.86, 3.25, -30], r: [0, Math.PI / 2, 0] })), { cast: false });
  // towers with searchlights
  S.towers = [];
  const tower = (x, z) => { const T = new THREE.Group(); T.position.set(x, 0, z); G.add(T);
    add(tbox(3.2, 16, 3.2, 3), M.tower, 0, 8, 0, T); add(tbox(5, 0.4, 5, 2), M.wallTop, 0, 16.2, 0, T);
    add(tbox(4.4, 2.6, 4.4, 2), M.dark, 0, 17.7, 0, T); for (const [dx, dz, ry] of [[0, 2.21, 0], [0, -2.21, 0], [2.21, 0, Math.PI / 2], [-2.21, 0, Math.PI / 2]]) { const w_ = add(tbox(3.6, 1.3, 0.05, 1), M.glassG, dx, 17.9, dz, T, { cast: false }); w_.rotation.y = ry; }
    const rf = add(new THREE.ConeGeometry(3.6, 1.8, 4), M.roof, 0, 19.9, 0, T); rf.rotation.y = Math.PI / 4;
    for (let k = 0; k < 4; k++) add(tbox(5.2, 0.08, 0.08, 1), M.metal, 0, 16.9, (k - 1.5) * 0.0 + (k % 2 ? 2.5 : -2.5), T).rotation.y = k > 1 ? Math.PI / 2 : 0;
    const lamp = new THREE.Group(); lamp.position.set(0, 17.2, 2.6); T.add(lamp); add(new THREE.CylinderGeometry(0.4, 0.5, 0.6, 14), M.dark, 0, 0, 0, lamp).rotation.x = Math.PI / 2;
    const beam = fx.beam(G, [x, 17.2, z + 2.7], 120, 0.45, 9, '#eaf2ff', 0.55); const pool = fx.quad(G, [x, 0.06, z + 20], 16, 10, '#dfeaff', 0.35, { rx: -Math.PI / 2 });
    const gl = fx.glow(G, [x, 17.2, z + 2.9], '#f0f6ff', 4, 0.9);
    S.towers.push({ x, z, beam, pool, gl, ph: hash(x + z, 3) * 6 }); return T; };
  tower(-70, -40); tower(60, -40); tower(-26, -40); tower(28, -40); tower(60, -105); tower(60, -170); tower(-70, -170);
  // inner cell blocks with rows of dim green windows + chimney with smoke
  for (const [x, z, w, d, h] of [[-30, -90, 46, 16, 16], [22, -95, 40, 16, 14], [-10, -135, 70, 18, 18]]) {
    add(tbox(w, h, d, 4), M.block, x, h / 2, z, G); add(tbox(w + 1, 0.6, d + 1, 2), M.wallTop, x, h + 0.3, z, G);
    const wl = []; for (let r = 0; r < Math.floor(h / 3); r++) for (let k = 0; k < Math.floor(w / 2.4); k++) wl.push({ p: [x - w / 2 + 1.2 + k * 2.4, 2 + r * 3, z + d / 2 + 0.05], s: [1, 1, 1], c: hash(r * 31 + k + x, 5) > 0.75 ? '#e8ffc0' : '#3a5a48' });
    fx.inst(G, new THREE.BoxGeometry(0.6, 1.0, 0.05), toon({ color: '#ffffff', emissive: '#203828', emissiveIntensity: 0.6 }), wl, { cast: false, noink: true });
  }
  add(new THREE.CylinderGeometry(1.2, 1.6, 30, 14), M.tower, 30, 15, -140, G);
  S.smoke = fx.puffs(G, 18, '#5a6070', { fog: true });
  // ---- the town street outside the east wall ----
  const st = EXT.street, sz = st.z, sl = st.x1 - st.x0, sx = (st.x0 + st.x1) / 2;
  const road = add(new THREE.PlaneGeometry(sl, 8), M.asphalt, sx, 0.02, sz, G, { cast: false }); road.rotation.x = -Math.PI / 2;
  for (let x = st.x0 + 2; x < st.x1; x += 6) { const ln = add(new THREE.PlaneGeometry(2.6, 0.16), toon({ color: '#c8c8b8' }), x, 0.03, sz, G, { cast: false }); ln.rotation.x = -Math.PI / 2; }
  for (const s_ of [-1, 1]) { add(tbox(sl, 0.16, 0.3, 4), M.kerb, sx, 0.08, sz + s_ * 4.15, G); const sw = add(new THREE.PlaneGeometry(sl, 2.6), M.side, sx, 0.15, sz + s_ * 5.6, G, { cast: false }); sw.rotation.x = -Math.PI / 2; }
  // wooden houses
  const houseCols = ['#7a5a48', '#5a6a7a', '#8a7a5a', '#6a5a6a', '#4e6a5e', '#8a6a4e'];
  const sidingTex = (base) => P.tex(cv(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, y + 13, w, 3); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, y, w, 3); } }), 2, 2);
  const houseMats = houseCols.map((c) => toon({ map: sidingTex(c) }));
  S.houseWins = [];
  for (let i = 0; i < 16; i++) { const side = i % 2 ? 1 : -1, x = st.x0 + 12 + Math.floor(i / 2) * 17 + (side > 0 ? 6 : 0), z = sz + side * 13, w = 9 + hash(i, 1) * 3, d = 8, h = 5.5 + hash(i, 2) * 2.5;
    const H = new THREE.Group(); H.position.set(x, 0, z); H.rotation.y = side > 0 ? Math.PI : 0; G.add(H);
    add(tbox(w, h, d, 3), houseMats[i % houseMats.length], 0, h / 2, 0, H);
    const rs = new THREE.Shape(); rs.moveTo(-w / 2 - 0.5, 0); rs.lineTo(w / 2 + 0.5, 0); rs.lineTo(0, 3.2); rs.closePath();
    const rf = add(new THREE.ExtrudeGeometry(rs, { depth: d + 1, bevelEnabled: false }), M.roof, 0, h, -d / 2 - 0.5, H);
    for (let k = 0; k < 3; k++) for (let r = 0; r < 2; r++) { const lit = hash(i * 7 + k + r * 3, 4) > 0.55; const wm = add(tbox(1.1, 1.3, 0.1, 1), lit ? M.winWarm : M.winDark, -w / 2 + 1.6 + k * (w - 3.2) / 2, 1.6 + r * 2.6, d / 2 + 0.05, H, { cast: false }); if (lit) S.houseWins.push(wm); add(tbox(1.3, 0.12, 0.2, 1), toon({ color: '#e8e4dc' }), -w / 2 + 1.6 + k * (w - 3.2) / 2, 0.9 + r * 2.6, d / 2 + 0.1, H); }
    add(tbox(1.2, 2.2, 0.12, 1), toon({ color: '#3a2a20' }), w / 2 - 1.4, 1.1, d / 2 + 0.06, H);
    // picket fence in front
    for (let k = 0; k < 10; k++) add(tbox(0.1, 0.9, 0.06, 1), toon({ color: '#d8d4c8' }), -w / 2 + k * w / 9, 0.45, d / 2 + 2.4, H);
    add(tbox(w, 0.08, 0.05, 1), toon({ color: '#d8d4c8' }), 0, 0.7, d / 2 + 2.4, H);
  }
  // street trees (instanced trunks + crowns)
  const trunks = [], crowns = [];
  for (let i = 0; i < 18; i++) for (const s_ of [-1, 1]) { const x = st.x0 + 6 + i * 8.5 + (s_ > 0 ? 3 : 0), z = sz + s_ * 7.2, h = 4 + hash(i * 2 + s_, 3) * 2; trunks.push({ p: [x, h / 2, z], s: [1, h, 1] });
    for (let k = 0; k < 4; k++) crowns.push({ p: [x + (hash(i, k) - 0.5) * 2.4, h + 0.6 + k * 0.7, z + (hash(i, k + 4) - 0.5) * 2.4], s: 1.6 + hash(i, k + 8) * 0.9, c: ['#1e3a24', '#264a2a', '#2e4a26', '#1a3420'][k] }); }
  fx.inst(G, new THREE.CylinderGeometry(0.16, 0.24, 1, 7), M.trunk, trunks);
  S.crowns = fx.inst(G, new THREE.IcosahedronGeometry(1, 1), M.crown, crowns); S.crownList = crowns;
  // street lamps (sodium)
  for (let i = 0; i < 9; i++) { const x = st.x0 + 10 + i * 18, s_ = i % 2 ? 1 : -1; S.lamps.push(lampAt(x, sz + s_ * 4.8, 6.2, 0, -s_)); }
  // parked cars
  const car = (x, z, col, ry) => { const C = new THREE.Group(); C.position.set(x, 0, z); C.rotation.y = ry; G.add(C); const m = toon({ color: col });
    add(tbox(4.2, 0.8, 1.8, 2), m, 0, 0.7, 0, C); add(tbox(2.3, 0.7, 1.6, 2), m, -0.2, 1.42, 0, C); add(tbox(2.2, 0.6, 1.62, 1), toon({ color: '#1a2230' }), -0.2, 1.45, 0, C, { cast: false });
    for (const [dx, dz] of [[-1.3, 0.85], [1.3, 0.85], [-1.3, -0.85], [1.3, -0.85]]) add(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 14), M.dark, dx, 0.36, dz, C).rotation.x = Math.PI / 2;
    add(tbox(0.1, 0.18, 0.4, 1), toon({ color: '#ffe8a0' }), 2.1, 0.8, 0.6, C); add(tbox(0.1, 0.18, 0.4, 1), toon({ color: '#ffe8a0' }), 2.1, 0.8, -0.6, C); return C; };
  car(84, sz + 3.2, '#8a3a34', 0); car(122, sz - 3.2, '#3a5a7a', Math.PI); car(146, sz + 3.2, '#c8b890', 0); car(178, sz - 3.2, '#4a6a4a', Math.PI);
  // manhole (lid lifts) + hole + steam
  const MH = EXT.manhole; const hole = add(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 24), toon({ color: '#030304' }), MH[0], 0.035, MH[2], G, { cast: false });
  const lid = new THREE.Group(); lid.position.set(MH[0], 0.04, MH[2]); G.add(lid); S.lid = lid;
  add(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 28), toon({ map: ctx.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#4a4c50'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2c30'; g.lineWidth = 6; for (let r = 30; r < 128; r += 22) { g.beginPath(); g.arc(128, 128, r, 0, 7); g.stroke(); } for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(k * 0.785) * 120, 128 + Math.sin(k * 0.785) * 120); g.stroke(); } }) }), 0, 0, 0, lid);
  S.mhSteam = fx.puffs(G, 12, '#b8c4d8', { fog: true }); S.mhGlow = fx.glow(G, [MH[0], 0.1, MH[2]], '#ffb070', 1.2, 0);
  // roadside further east: lone lamp, bushes, ditch
  const RD = EXT.road; S.lamps.push(lampAt(RD[0] - 4.5, RD[2] + 4.6, 6.5, 0, -1));
  const bushes = []; for (let i = 0; i < 90; i++) { const x = RD[0] - 40 + hash(i, 1) * 60, z = RD[2] + 6.4 + hash(i, 2) * 10; if (x > 251.5 && x < 260 && z > -56 && z < -49) continue; bushes.push({ p: [x, 0.5 + hash(i, 3) * 0.4, z], s: [1.2 + hash(i, 4) * 1.4, 0.9 + hash(i, 5) * 0.8, 1.2 + hash(i, 6) * 1.2], c: ['#1e3624', '#24402a', '#2a4628', '#183020'][i % 4] }); }
  bushes.push({ p: [259.6, 0.7, -52.2], s: [0.9, 0.8, 0.9], c: '#2a4a2c' }, { p: [256.2, 0.5, -50.2], s: [1.0, 0.7, 0.8], c: '#24402a' }, { p: [252.6, 0.9, -53.6], s: [1.1, 1.0, 1.0], c: '#1e3624' });
  S.bushes = fx.inst(G, new THREE.IcosahedronGeometry(1, 1), M.bush, bushes, { cast: true });
  const road2 = add(new THREE.PlaneGeometry(140, 7), M.asphalt, RD[0] + 30, 0.02, RD[2], G, { cast: false }); road2.rotation.x = -Math.PI / 2;
  // grass tufts near the roadside camera (foreground)
  const tufts = []; for (let i = 0; i < 400; i++) { const x = RD[0] - 8 + hash(i, 11) * 16, z = RD[2] + 4 + hash(i, 12) * 8; tufts.push({ p: [x, 0.05, z], r: [0, hash(i, 13) * 3, 0], s: [1, 0.5 + hash(i, 15) * 0.5, 1], c: ['#3e6a3c', '#4a7a42', '#34583a'][i % 3] }); }
  fx.inst(G, new THREE.IcosahedronGeometry(0.25, 0), toon({ color: '#ffffff' }), tufts.filter((u) => !(u.p[0] > 250 && u.p[0] < 260 && u.p[2] > -57)), { cast: false });
  // sky: moon, stars, fast clouds
  S.moon = fx.glow(G, [-120, 160, -420], '#fff4d8', 60, 1, { tex: 'glow', fog: false }); S.moonDisc = fx.glow(G, [-120, 160, -420], '#fffbe8', 22, 1, { tex: 'spark', fog: false });
  S.stars = fx.points(G, 300, { size: 1.6, color: '#e8f0ff', fog: false });
  S.clouds = fx.puffs(G, 14, '#3a4466', { fog: false, tex: 'smoke' });
  // insects / moths around lamps, fireflies at the roadside
  S.moths = fx.points(G, 60, { size: 0.06, color: '#ffe0a0' });
  return {
    lights: (Lp, f, Sp, W) => { const e = W.ext || {}, o = G.position; const L = e.lamps || [];
      for (let k = 0; k < 4; k++) { const id = L[k]; if (id === undefined) { Lp[k].intensity = 0; continue; } const lm = S.lamps[id]; Lp[k].position.set(o.x + lm.hx, o.y + lm.h - 0.5, o.z + lm.hz); Lp[k].color.set('#ff9a40'); Lp[k].intensity = (e.lampI || 40) * (0.92 + 0.08 * Math.sin(f * 0.7 + k)); Lp[k].distance = 26; Lp[k].decay = 1.6; }
      if (e.mhLight) { Lp[3].position.set(o.x + EXT.manhole[0], o.y + 0.25, o.z + EXT.manhole[2]); Lp[3].color.set('#ffa060'); Lp[3].intensity = e.mhLight; Lp[3].distance = 4; Lp[3].decay = 2; }
    },
    update: (W, f) => { const e = W.ext || {}, t = f / 30;
      S.towers.forEach((tw, k) => { const a = Math.sin(t * 0.55 + tw.ph) * 0.9 + (e.beamBias || 0), r = 60 + Math.sin(t * 0.4 + k) * 15; const tx = tw.x + Math.sin(a) * r, tz = tw.z + Math.cos(a) * r * (tw.z < -100 ? -1 : 1) * (tw.x > 50 ? 0.4 : 1) + (tw.x > 50 ? 0 : 0);
        const ex = tw.x > 50 ? tw.x + Math.abs(Math.cos(a)) * r : tx; tw.beam.aim(G.position.x + ex, G.position.y, G.position.z + tz); tw.pool.position.set(ex, 0.06, tz); tw.pool.rotation.z = a; });
      S.smoke.run(f, (i, f) => { const life = 160, ph = ((f + i * 9) % life) / life; return [30 + ph * 12 + Math.sin(ph * 5 + i) * 2, 31 + ph * 22, -140 + ph * 4, 5 + ph * 12, 0.35 * Math.sin(ph * Math.PI)]; });
      S.stars.run(f, (i) => { const a = hash(i, 1) * Math.PI * 2, el = 0.15 + hash(i, 2) * 1.2, d = 700; return [60 + Math.cos(a) * Math.cos(el) * d, Math.sin(el) * d, -100 + Math.sin(a) * Math.cos(el) * d, 0.3 + 0.7 * Math.abs(Math.sin(f * 0.05 + i))]; });
      S.clouds.run(f, (i, f) => { const sp = 0.9 + hash(i, 3) * 0.8, x = ((hash(i, 1) * 900 + f * sp * 1.6) % 900) - 450; return [x + 60, 120 + hash(i, 2) * 90, -380 - hash(i, 4) * 120, 110 + hash(i, 5) * 90, 0.75]; });
      S.moths.run(f, (i, f) => { const lm = S.lamps[(e.lamps || [0])[i % Math.max(1, (e.lamps || [0]).length)] ?? 0]; if (!lm) return null; const a = f * 0.25 + i * 1.7; return [lm.hx + Math.sin(a) * 0.5 + Math.sin(a * 2.3) * 0.2, lm.h - 0.4 + Math.cos(a * 1.3) * 0.35, lm.hz + Math.cos(a) * 0.5, 1]; });
      S.lamps.forEach((lm, k) => { lm.gl.material.opacity = 0.8 + 0.1 * Math.sin(f * 0.7 + k); });
      // manhole lid lifts and slides
      const lift = e.lid || 0, slide = e.slide || 0; S.lid.position.set(EXT.manhole[0] - slide * 0.95, 0.04 + lift * 0.14 * (1 - slide), EXT.manhole[2] + slide * 0.2); S.lid.rotation.set(0, 0, lift * 0.32 * (1 - slide));
      S.mhGlow.material.opacity = lift * 0.5;
      S.mhSteam.run(f, (i, f) => { if (!lift) return null; const life = 50, ph = ((f + i * 7) % life) / life; return [EXT.manhole[0] + (hash(i, 1) - 0.5) * 0.6, 0.15 + ph * 1.4, EXT.manhole[2] + (hash(i, 2) - 0.5) * 0.6, 0.3 + ph * 0.8, 0.14 * Math.sin(ph * Math.PI) * lift]; });
      // trees sway (instanced crowns)
      const m4 = new ctx.THREE.Matrix4(), q_ = new ctx.THREE.Quaternion(), sc = new ctx.THREE.Vector3(), ps = new ctx.THREE.Vector3();
      if (e.sway) S.crownList.forEach((c, i) => { const s = c.s; ps.set(c.p[0] + Math.sin(t * 1.3 + i) * 0.12, c.p[1], c.p[2] + Math.cos(t * 1.1 + i) * 0.08); sc.set(s, s, s); m4.compose(ps, q_, sc); S.crowns.setMatrixAt(i, m4); });
      if (e.sway) S.crowns.instanceMatrix.needsUpdate = true;
    },
  };
}
