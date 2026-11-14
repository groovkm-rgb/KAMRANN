// M5: the labyrinth under the prison. Three zones: (A) narrow pipe passage with an iron ladder, (B) inside the giant
// steam pipe, (C) dirt tunnel under the wall's foundation blocks with a grate letting in a searchlight.
import { paint, hash } from '../fx3d.js';
export const UG = { A: [0, 0, 0], B: [30, 0, 0], C: [60, 0, 0] };
const S = {};
export function build(ctx, fx, G) {
  const { THREE, add, tbox, toon, P } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const tm = (c, rx = 1, ry = 1, color = '#ffffff') => toon({ map: P.tex(c, rx, ry), color });
  const M = {
    conc: tm(cv(512, 512, (g, w, h) => paint.concrete(g, w, h, '#5a605c', 51)), 2, 1), floor: tm(cv(512, 512, (g, w, h) => paint.concrete(g, w, h, '#3a3e3c', 52)), 2, 4),
    pipeR: tm(cv(256, 256, (g, w, h) => paint.metal(g, w, h, '#7a4a34', 53)), 6, 1), pipeG: tm(cv(256, 256, (g, w, h) => paint.metal(g, w, h, '#4a6a5a', 54)), 6, 1), pipeY: tm(cv(256, 256, (g, w, h) => paint.metal(g, w, h, '#8a7a3a', 55)), 6, 1),
    iron: toon({ color: '#3a3e44' }), rust: toon({ color: '#6a3a24' }), pipeIn: tm(cv(512, 256, (g, w, h) => { paint.metal(g, w, h, '#6a5a44', 56); for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x, 0, 10, h); } }), 1, 8),
    dirt: tm(cv(512, 512, (g, w, h) => { g.fillStyle = '#4a3a2a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `hsla(${25 + hash(i, 1) * 15},30%,${16 + hash(i, 2) * 18}%,.8)`; g.beginPath(); g.ellipse(hash(i, 3) * w, hash(i, 4) * h, 2 + hash(i, 5) * 8, 2 + hash(i, 6) * 5, 0, 0, 7); g.fill(); } }), 2, 2),
    stone: tm(cv(512, 512, (g, w, h) => paint.blocks(g, w, h, [30, 8, 40], 170, 90, 57)), 1, 1), root: toon({ color: '#5a4030' }), dark: toon({ color: '#101214' }),
  };
  // ---- zone A: narrow passage + ladder (runs along -z away from camera) ----
  const A = new THREE.Group(); A.position.set(...UG.A); G.add(A);
  add(tbox(2.4, 0.1, 14, 2), M.floor, 0, -0.05, -5, A, { cast: false }); add(tbox(2.4, 0.1, 14, 2), M.conc, 0, 2.6, -5, A, { cast: false });
  for (const sx of [-1, 1]) add(tbox(0.12, 2.7, 14, 3), M.conc, sx * 1.1, 1.3, -5, A, { cast: false });
  add(tbox(2.4, 2.7, 0.12, 2), M.conc, 0, 1.3, -12, A, { cast: false });
  for (const [x, y, r, m] of [[-0.85, 2.2, 0.12, M.pipeR], [-0.88, 1.75, 0.08, M.pipeG], [0.85, 2.3, 0.1, M.pipeY], [0.9, 0.5, 0.14, M.pipeG], [-0.9, 0.3, 0.07, M.pipeY]]) { const pp = add(new THREE.CylinderGeometry(r, r, 14, 12), m, x, y, -5, A); pp.rotation.x = Math.PI / 2;
    for (let z = 1; z > -12; z -= 2.2) { const cl = add(new THREE.TorusGeometry(r + 0.02, 0.015, 6, 14), M.iron, x, y, z, A); } }
  // iron ladder coming down from a hatch in the ceiling (near camera)
  const LZ = -1.6; for (const sx of [-0.22, 0.22]) add(tbox(0.04, 2.7, 0.04, 1), M.iron, sx, 1.3, LZ, A); for (let k = 0; k < 9; k++) add(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 6), M.iron, 0, 0.2 + k * 0.28, LZ, A).rotation.z = Math.PI / 2;
  add(tbox(0.8, 0.06, 0.8, 1), M.dark, 0, 2.58, LZ, A);
  S.bulbA = fx.glow(A, [0.6, 2.3, -7], '#ffc070', 0.8, 0.8); add(new THREE.SphereGeometry(0.05, 8, 6), toon({ color: '#ffe0a0', emissive: '#ffb050', emissiveIntensity: 1.4 }), 0.6, 2.35, -7, A);
  S.steamA = fx.puffs(A, 14, '#d8e0e4', { fog: true }); S.dripsA = fx.points(A, 40, { size: 0.02, color: '#bfe0ff', tex: 'drop' });
  // ---- zone B: inside the giant pipe (axis along -z) ----
  const B = new THREE.Group(); B.position.set(...UG.B); G.add(B);
  const pr = 0.95; const pg = new THREE.CylinderGeometry(pr, pr, 24, 32, 1, true); const pm = add(pg, toon({ map: M.pipeIn.map, side: THREE.BackSide }), 0, pr, -8, B, { cast: false }); pm.rotation.x = Math.PI / 2;
  for (let z = 2; z > -20; z -= 1.6) { const ring = add(new THREE.TorusGeometry(pr - 0.02, 0.04, 6, 32), M.rust, 0, pr, z, B); }
  add(tbox(0.5, 0.02, 24, 2), toon({ color: '#2a2420' }), 0, 0.06, -8, B, { cast: false });
  S.waterB = fx.quad(B, [0, 0.075, -6], 0.45, 14, '#8ab8d8', 0.25, { rx: -Math.PI / 2, tex: 'pool' });
  S.steamB = fx.puffs(B, 12, '#c8d0d4', { fog: true }); S.dripsB = fx.points(B, 30, { size: 0.02, color: '#bfe0ff', tex: 'drop' });
  // ---- zone C: dirt tunnel under the wall foundation (runs along -x) ----
  const C = new THREE.Group(); C.position.set(...UG.C); G.add(C);
  add(tbox(16, 0.1, 2.4, 2), M.dirt, -4, -0.05, 0, C, { cast: false }); for (const sz of [-1, 1]) add(tbox(16, 1.6, 0.2, 2), M.dirt, -4, 0.8, sz * 1.0, C, { cast: false });
  // foundation blocks overhead (massive)
  for (let k = 0; k < 6; k++) add(tbox(1.6, 0.9, 2.6, 1.6), M.stone, -9 + k * 1.65, 1.45 + (k % 2) * 0.05, 0, C);
  add(tbox(16, 0.3, 2.6, 2), M.dirt, -4, 2.05, 0, C, { cast: false });
  // props: wooden supports, roots hanging
  for (const x of [-1.5, -5.5]) { for (const sz of [-0.85, 0.85]) add(tbox(0.12, 1.1, 0.12, 1), toon({ color: '#6a4a2a' }), x, 0.55, sz, C); add(tbox(0.14, 0.12, 1.9, 1), toon({ color: '#6a4a2a' }), x, 1.04, 0, C); }
  S.roots = []; for (let k = 0; k < 14; k++) { const r = add(new THREE.CylinderGeometry(0.008, 0.02, 0.4 + hash(k, 1) * 0.5, 5), M.root, -8 + hash(k, 2) * 9, 0.85, (hash(k, 3) - 0.5) * 1.6, C); r.userData.base = r.position.clone(); S.roots.push(r); }
  // grate above with the searchlight leaking down
  add(tbox(0.6, 0.06, 0.6, 1), M.dark, -3.2, 1.0, 0.0, C); S.grateBeam = fx.beam(C, [-3.2, 1.0, 0], 1.4, 0.25, 0.6, '#e8f0ff', 0.0); S.grateBeam.aim(G.position.x + UG.C[0] - 3.3, G.position.y, G.position.z + 0.1);
  S.grateGlow = fx.glow(C, [-3.2, 1.02, 0], '#e8f0ff', 0.8, 0); S.dustC = fx.points(C, 60, { size: 0.012, color: '#f0e8d8' });
  return {
    lights: (Lp, f, Sp, W) => { const o = G.position, u = W.ug || {}; const z = u.zone || 'A', Z = UG[z];
      // goggle lamp follows Stille
      Lp[0].position.set(o.x + Z[0] + (u.lamp ? u.lamp[0] : 0), o.y + (u.lamp ? u.lamp[1] : 1), o.z + Z[2] + (u.lamp ? u.lamp[2] : 0)); Lp[0].color.set('#a0f4ff'); Lp[0].intensity = 2.6; Lp[0].distance = 6; Lp[0].decay = 2;
      Lp[1].position.set(o.x + Z[0] + 0.6, o.y + 2.2, o.z + Z[2] - 7); Lp[1].color.set('#ffb060'); Lp[1].intensity = z === 'A' ? 2.0 : 0; Lp[1].distance = 7; Lp[1].decay = 2;
      Lp[2].position.set(o.x + UG.C[0] - 3.2, o.y + 0.8, o.z + UG.C[2]); Lp[2].color.set('#dfeaff'); Lp[2].intensity = z === 'C' ? 2.2 * (0.5 + 0.5 * Math.max(0, Math.sin(f * 0.25))) : 0; Lp[2].distance = 4; Lp[2].decay = 2;
      Lp[3].position.set(o.x + Z[0], o.y + 1, o.z + Z[2] - 10); Lp[3].color.set('#ff8a40'); Lp[3].intensity = z === 'B' ? 1.6 : 0; Lp[3].distance = 12; Lp[3].decay = 1.5;
    },
    update: (W, f) => { const u = W.ug || {};
      S.steamA.run(f, (i, f) => { const life = 70, ph = ((f + i * 9) % life) / life; return [(hash(i, 1) - 0.5) * 1.6, 0.2 + ph * 2.2, -2 - hash(i, 2) * 8, 0.4 + ph * 0.9, 0.22 * Math.sin(ph * Math.PI)]; });
      S.dripsA.run(f, (i, f) => { const ph = ((f + i * 13) % 26) / 26; return [(hash(i, 1) - 0.5) * 1.8, 2.5 - ph * 2.5, -1 - hash(i, 2) * 9, 0.8]; });
      S.steamB.run(f, (i, f) => { const life = 80, ph = ((f + i * 11) % life) / life; return [(hash(i, 1) - 0.5) * 0.9, 0.3 + ph * 1.2, -1 - hash(i, 2) * 12 + ph, 0.5 + ph * 0.8, 0.2 * Math.sin(ph * Math.PI)]; });
      S.dripsB.run(f, (i, f) => { const ph = ((f + i * 11) % 22) / 22; return [(hash(i, 1) - 0.5) * 1.0, 1.85 - ph * 1.8, -1 - hash(i, 2) * 10, 0.8]; });
      S.roots.forEach((r, k) => { r.rotation.z = Math.sin(f * 0.08 + k) * 0.08; });
      const gb = 0.5 + 0.5 * Math.max(0, Math.sin(f * 0.25)); S.grateBeam.setOp(0.35 * gb); S.grateGlow.material.opacity = 0.8 * gb;
      S.dustC.run(f, (i, f) => [-3.2 + (hash(i, 1) - 0.5) * 0.6, 0.1 + hash(i, 2) * 0.9 + Math.sin(f * 0.02 + i) * 0.05, (hash(i, 3) - 0.5) * 0.6, gb]);
    },
  };
}
