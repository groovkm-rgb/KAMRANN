// Prairie: A (x~0) empty plains, B (x~200) workers raising poles, C (x 280..430) finished line + "Telegraf" office, D (x~-300) final hill.
import * as W from '../wlib.js';
export const hill = (x, z) => 9 * Math.exp(-((x + 300) ** 2 + (z) ** 2) / (2 * 26 * 26));
export const PH = (x, z) => hill(x, z) + (W.fbm(x * 0.006, z * 0.006) - 0.5) * 26 * W.sstep(60, 260, Math.abs(z)) + (W.fbm(x * 0.05, z * 0.05) - 0.5) * 0.4;
export const POLE_H = 6.5, WIRE_Y = 6.28;
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G, V3: THREE.Vector3 };
  const grass = W.mtex(W.groundCanvas('#c8b060', ['#b8a050', '#d8c070', '#a8a050'], ['#8a7a3a', '#e8d088'], 71), 70, 70);
  W.terrain(G, 2400, 1400, 260, 140, PH, grass, (x, z, y) => { const n = W.fbm(x * 0.02, z * 0.02); return [0.95 + n * 0.12, 0.92 + n * 0.12, 0.78 + n * 0.1]; }, 0, 0);
  const tuftC = W.grassCanvas(['#c8a850', '#e0c870', '#a89040', '#b8b060'], 5, 60), tints = ['#ffffff', '#f0e0b0', '#e0e8b0'];
  const area = (x0, x1, z0, z1, n, seed, size = [0.4, 1.0]) => W.tufts(G, n, (R) => { const x = x0 + R() * (x1 - x0), z = z0 + R() * (z1 - z0); return [x, PH(x, z) - 0.05, z]; }, tuftC, size, seed, tints);
  area(-40, 50, -30, 40, 4200, 1); area(140, 270, -20, 40, 5200, 2); area(270, 440, -20, 30, 5200, 3); area(-345, -255, -40, 40, 4200, 4, [0.4, 0.9]);
  // wildflowers
  const flower = W.cvs(64, 64, (g) => { for (let i = 0; i < 6; i++) { g.fillStyle = ['#e8d040', '#f4f0ff', '#d86a9a'][i % 3]; g.beginPath(); g.arc(14 + (i * 9) % 40, 14 + (i * 17) % 30, 5, 0, 7); g.fill(); } g.strokeStyle = '#5a7a3a'; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 64); g.lineTo(32, 30); g.stroke(); });
  W.tufts(G, 1500, (R) => { const x = -40 + R() * 480, z = -20 + R() * 50; return [x, PH(x, z), z]; }, flower, [0.2, 0.4], 9, ['#ffffff']);
  // far mountains + hills ring
  const mm = W.toon({ color: '#8a9ac0' }), sn = W.toon({ color: '#f2f4fa' }), hm = W.toon({ color: '#a8a060' }); const R = W.rng(8); const FAR = W.group(G); S.far = FAR;
  for (let i = 0; i < 18; i++) { const x = -1100 + i * 130 + R() * 60, z = -700 - R() * 100, h = 180 + R() * 160; W.add(new THREE.ConeGeometry(140 + R() * 60, h, 7), mm, x, h / 2 - 20, z, FAR, { cast: false }); W.add(new THREE.ConeGeometry(40, h * 0.28, 7), sn, x, h * 0.86 - 20, z, FAR, { cast: false }); }
  for (let i = 0; i < 16; i++) { const h = W.add(new THREE.SphereGeometry(80 + R() * 60, 16, 8), hm, -900 + i * 120, -10, -320 - R() * 80, FAR, { cast: false }); h.scale.y = 0.3; }
  // lone trees and boulders for depth
  const tree = (x, z, s = 1) => { const t = W.group(G, x, PH(x, z), z); W.add(new THREE.CylinderGeometry(0.2 * s, 0.32 * s, 3 * s, 6), W.toon({ color: '#5a4030' }), 0, 1.5 * s, 0, t); for (let k = 0; k < 3; k++) W.add(new THREE.SphereGeometry(1.6 * s, 10, 8), W.toon({ color: k % 2 ? '#6a8a3a' : '#58783a' }), (k - 1) * s, 3.4 * s + (k % 2) * 0.5 * s, 0, t); };
  tree(-22, -18, 1.3); tree(30, -40, 1.6); tree(190, -30, 1.4); tree(240, -45, 1.8); tree(330, -26, 1.2); tree(410, -38, 1.5); tree(-330, -50, 1.4);
  W.scatter(G, 160, new THREE.DodecahedronGeometry(0.5, 0), W.toon({ color: '#a89a80' }), (R) => { const x = -60 + R() * 520, z = -30 + R() * 60; return [x, PH(x, z), z, 0.3 + R() * 0.9]; }, 4);
  // ---------- poles ----------
  const pm = W.mtex(W.logCanvas('#7a5a3a', 6), 1, 2), wm = W.toon({ color: '#1e1a20' });
  const line = (xs, z, wired) => { const tops1 = [], tops2 = []; for (const x of xs) { const y = PH(x, z); const p = W.pole(G, x, z, POLE_H, pm, Math.PI / 2); p.position.y = y; tops1.push([x, y + WIRE_Y, z + 0.6]); tops2.push([x, y + WIRE_Y, z - 0.6]); }
    if (wired) { W.wire(G, tops1, wm, 0.022, 0.35); W.wire(G, tops2, wm, 0.022, 0.35); } return tops1; };
  // B: built part (x 80..170) wired, then bare poles, one being raised at x = 200, stacked logs, wire spool wagon
  line([80, 110, 140, 170], 0, true);
  S.raise = W.group(G, 200, PH(200, 0), 0); W.add(new THREE.CylinderGeometry(0.11, 0.15, POLE_H, 8), pm, 0, POLE_H / 2, 0, S.raise); const ca = W.add(new THREE.BoxGeometry(0.12, 0.12, 1.5), pm, 0, POLE_H - 0.45, 0, S.raise);
  W.add(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 10), W.toon({ color: '#3a2a20' }), 200, PH(200, 0) + 0.05, 0, G); // hole rim
  for (let k = 0; k < 5; k++) { const l = W.add(new THREE.CylinderGeometry(0.13, 0.15, 6.5, 8), pm, 212 + (k % 3) * 0.3, 0.15 + Math.floor(k / 3) * 0.26, -3 + (k % 3) * 0.3 + Math.floor(k / 3) * 0.15, G); l.rotation.z = Math.PI / 2; }
  const spool = W.group(G, 186, 0, -5); W.add(new THREE.BoxGeometry(2, 0.5, 3.2), W.toon({ color: '#6a4a30' }), 0, 0.9, 0, spool); const sp = W.add(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16), W.toon({ color: '#8a6040' }), 0, 1.7, 0, spool); sp.rotation.z = Math.PI / 2;
  const coil = W.add(new THREE.CylinderGeometry(0.45, 0.45, 1.0, 16), W.toon({ color: '#3a3438' }), 0, 1.7, 0, spool); coil.rotation.z = Math.PI / 2;
  for (const [x, z] of [[-0.9, -1.2], [0.9, -1.2], [-0.9, 1.2], [0.9, 1.2]]) { const w = W.add(new THREE.TorusGeometry(0.5, 0.06, 6, 16), W.toon({ color: '#3a2a1e' }), x, 0.5, z, spool); w.rotation.y = Math.PI / 2; }
  // rope from the raised pole to the pullers
  S.rope = W.add(new THREE.CylinderGeometry(0.025, 0.025, 1, 5), W.toon({ color: '#c8b080' }), 0, 0, 0, G, { cast: false });
  // C: finished line x 280..420 -> office at x = 436
  S.lineC = line([280, 310, 340, 370, 400, 426], 0, true);
  // office exterior with "Telegraf" sign (front faces +z)
  const off = W.group(G, 440, PH(440, 0), 2); const ow = W.mtex(W.plankCanvas('#b8905a', 21, 10), 3, 2);
  W.add(new THREE.BoxGeometry(7, 3.4, 5), ow, 0, 1.7, 0, off); const rf = W.add(new THREE.BoxGeometry(7.8, 0.25, 6.2), W.toon({ color: '#5a3a28' }), 0, 3.6, 0, off); rf.rotation.x = 0.06;
  W.add(new THREE.BoxGeometry(7, 2.0, 0.2), ow, 0, 4.3, 2.4, off); // false front
  W.add(new THREE.BoxGeometry(1.1, 2.2, 0.12), W.toon({ color: '#3a5a7a' }), -1.8, 1.1, 2.56, off);
  W.add(new THREE.BoxGeometry(1.8, 1.3, 0.12), W.toon({ color: '#f0e6cc' }), 1.4, 1.7, 2.56, off); W.add(new THREE.BoxGeometry(1.5, 1.05, 0.14), W.toon({ color: '#ffe0a0', emissive: '#ffc870', emissiveIntensity: 0.9 }), 1.4, 1.7, 2.58, off);
  W.signMesh(off, W.signCanvas('Telegraf', 1024, 260, { size: 150, bg: '#2a3a5a', fg: '#f4e6b8' }), 4.6, 1.17, 0, 4.25, 2.52, 0, W.toon({ color: '#2a1a10' }));
  W.add(new THREE.BoxGeometry(7.2, 0.25, 2.2), W.mtex(W.plankCanvas('#8a6440', 22, 8), 3, 1), 0, 0.12, 3.6, off);
  W.wire(G, [[426, PH(426, 0) + WIRE_Y, 0.6], [437, PH(440, 0) + 3.2, 0.6]], wm, 0.022, 0.2);
  // D: final hill with a single pole and wire running over it
  const tD = line([-341.5, -296.5, -251.5], 0.5, true); S.tD = tD;
  S.clouds = []; for (let i = 0; i < 18; i++) { const m = W.billboard(G, W.cloudCanvas(i + 80, '#ffffff', '#e8d8c8'), 240 + R() * 160, 100, -900 + R() * 1800, 110 + R() * 120, -560 - R() * 200); m.userData.x0 = m.position.x; S.clouds.push(m); }
  // sunset clouds for the finale (purple/orange), only shown at the hill
  S.sunClouds = []; for (let i = 0; i < 10; i++) { const m = W.billboard(G, W.cloudCanvas(i + 120, '#ffa070', '#7a4a9a'), 300 + R() * 160, 110, -300 + (R() - 0.5) * 900, 30 + R() * 90, -700); m.userData.x0 = m.position.x; S.sunClouds.push(m); }
  return S;
};
export const update = (S, Wd, f) => { const t = f / 30;
  const fin = Wd.id === 's19'; S.far.visible = !fin; S.clouds.forEach((m) => { m.visible = !fin; m.position.x = m.userData.x0 + t * 2; }); S.sunClouds.forEach((m) => { m.visible = fin; m.position.x = m.userData.x0 + t * 1.5; });
  const r = Wd.raise ?? 1, ang = (1 - r) * 1.1; S.raise.rotation.x = ang; // tilts toward +z (the camera side)
  const y0 = S.raise.position.y, top = new S.V3(200, y0 + Math.cos(ang) * 5.2, Math.sin(ang) * 5.2), tgt = new S.V3(200.15, y0 + 1.75, 5.5);
  const d = tgt.clone().sub(top), L = d.length(); S.rope.position.copy(top.clone().add(tgt).multiplyScalar(0.5)); S.rope.scale.set(1, L, 1); S.rope.quaternion.setFromUnitVectors(new S.V3(0, 1, 0), d.normalize());
};
