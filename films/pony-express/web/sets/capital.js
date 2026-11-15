// M3: white colonnade with a dome in scaffolding, crowd below, a tall dark speaker seen only from behind.
import * as W from '../wlib.js';
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G };
  const marble = W.mtex(W.groundCanvas('#eee8dc', ['#e0d8ca', '#f6f2ea'], ['#c8c0b0'], 41), 4, 4), white = W.toon({ color: '#f2eee6' }), steps = W.toon({ color: '#ddd6c8' });
  const lawn = W.mtex(W.groundCanvas('#7a9a52', ['#6a8a46', '#8aaa5a'], ['#4a6a34'], 42), 40, 40);
  W.terrain(G, 900, 900, 30, 30, () => 0, lawn); 
  const plaza = W.add(new THREE.PlaneGeometry(80, 50), W.mtex(W.groundCanvas('#cbbca4', ['#bcae96'], ['#9a8a74'], 43), 20, 12), 0, 0.02, 18, G, { cast: false }); plaza.rotation.x = -Math.PI / 2;
  // building: body, steps, colonnade (front faces +z at z=0)
  W.add(new THREE.BoxGeometry(70, 16, 26), marble, 0, 8, -13, G);
  for (let k = 0; k < 8; k++) W.add(new THREE.BoxGeometry(30 - k * 0.2, 0.32, 1.0), steps, 0, 0.16 + k * 0.32, 8 - k * 1.0, G);
  W.add(new THREE.BoxGeometry(32, 2.6, 8), marble, 0, 2.6 + 1.3, -0.5, G); // portico floor
  for (let i = 0; i < 9; i++) { const x = -13 + i * 3.25; const c = W.add(new THREE.CylinderGeometry(0.55, 0.62, 11, 16), white, x, 3.9 + 5.5, 2.6, G); W.add(new THREE.BoxGeometry(1.5, 0.5, 1.5), white, x, 15.2, 2.6, G); W.add(new THREE.BoxGeometry(1.5, 0.5, 1.5), white, x, 4.1, 2.6, G); }
  W.add(new THREE.BoxGeometry(31, 2, 2.4), marble, 0, 16.4, 2.6, G);
  const ped = new THREE.Shape(); ped.moveTo(-15.5, 0); ped.lineTo(0, 4.5); ped.lineTo(15.5, 0); ped.lineTo(-15.5, 0); const pg = new THREE.ExtrudeGeometry(ped, { depth: 2.2, bevelEnabled: false }); W.add(pg, marble, 0, 17.4, 1.5, G);
  // dome drum + unfinished dome + scaffolding + crane
  W.add(new THREE.CylinderGeometry(11, 11.5, 8, 32), marble, 0, 20, -12, G);
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; W.add(new THREE.CylinderGeometry(0.3, 0.3, 7, 8), white, Math.cos(a) * 11.7, 20, -12 + Math.sin(a) * 11.7, G); }
  W.add(new THREE.SphereGeometry(10.5, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.32), W.toon({ color: '#c8c4bc' }), 0, 24, -12, G);
  const scaf = W.toon({ color: '#8a6a44' });
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; for (let k = 0; k < 2; k++) W.add(new THREE.BoxGeometry(0.16, 14, 0.16), scaf, Math.cos(a) * (8 + k * 3.2), 31, -12 + Math.sin(a) * (8 + k * 3.2), G); }
  for (let y = 25; y < 39; y += 2.2) { const r = W.add(new THREE.TorusGeometry(9.6, 0.1, 4, 40), scaf, 0, y, -12, G); r.rotation.x = Math.PI / 2; const r2 = W.add(new THREE.TorusGeometry(11.2, 0.1, 4, 40), scaf, 0, y + 1, -12, G); r2.rotation.x = Math.PI / 2; }
  const crane = W.group(G, 6, 38, -12); W.add(new THREE.BoxGeometry(0.4, 10, 0.4), scaf, 0, 5, 0, crane); const jib = W.add(new THREE.BoxGeometry(14, 0.35, 0.35), scaf, 4, 10, 0, crane); S.crane = crane;
  // podium on the steps and flags-free bunting
  W.add(new THREE.BoxGeometry(1.4, 1.3, 0.9), W.toon({ color: '#6a4a32' }), 0, 2.6 + 0.65 + 2.6, 5.6, G);
  const bunt = W.cvs(512, 64, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = ['#e8e2d4', '#b8303a', '#2e4a8a'][i % 3]; g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 + 32, 0); g.lineTo(i * 32 + 16, 50); g.fill(); } });
  const bm = new THREE.MeshBasicMaterial({ map: W.tex(bunt, 1, 1, false), transparent: true, side: THREE.DoubleSide, alphaTest: 0.4 }); const b = W.add(new THREE.PlaneGeometry(30, 1.2), bm, 0, 14.2, 3.4, G, { cast: false }); b.userData.ndSkip = true;
  // crowd on the plaza facing the podium
  const vars = [{ spec: 'townA', opts: { expr: 'neutral' } }, { spec: 'crier', opts: { expr: 'worried' } }, { spec: 'lady', opts: { expr: 'neutral' } }, { spec: 'miner', opts: { expr: 'neutral' } }, { spec: 'townB', opts: { expr: 'worried' } }, { spec: 'lady2', opts: { expr: 'neutral' } }];
  const spots = []; const R = W.rng(7); for (let i = 0; i < 260; i++) { const x = (R() - 0.5) * 46, z = 12 + R() * 30; spots.push([x, z, 0.95 + R() * 0.15, i]); }
  S.crowd = W.crowd(G, vars, spots, [0, 0, 5], { cast: false });
  // trees and far city
  for (let i = 0; i < 16; i++) { const x = (i < 8 ? -1 : 1) * (30 + (i % 8) * 6), z = 10 + (i % 4) * 8; const t = W.group(G, x, 0, z); W.add(new THREE.CylinderGeometry(0.3, 0.4, 4, 6), W.toon({ color: '#5a4030' }), 0, 2, 0, t); W.add(new THREE.SphereGeometry(3, 10, 8), W.toon({ color: '#4e7a3a' }), 0, 5.5, 0, t); }
  ctx.addClouds && 0; S.clouds = []; const R2 = W.rng(11); for (let i = 0; i < 10; i++) { const m = W.billboard(G, W.cloudCanvas(i + 50, '#ffffff', '#c8d4e8'), 200 + R2() * 120, 90, (R2() - 0.5) * 900, 120 + R2() * 120, -500 + (R2() - 0.5) * 600); S.clouds.push(m); }
  return S;
};
export const update = (S, Wd, f) => { S.crowd.update(f, 0.03, 0.12); S.crane.rotation.y = Math.sin(f * 0.01) * 0.3; };
