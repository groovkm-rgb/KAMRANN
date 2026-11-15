// 6b: an empty table, only a candle and a letter. Warm candle light in a dark log room.
import * as W from '../wlib.js';
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G };
  const floor = W.add(new THREE.PlaneGeometry(12, 12), W.mtex(W.plankCanvas('#5a3a24', 31, 10), 4, 4), 0, 0, 0, G, { cast: false }); floor.rotation.x = -Math.PI / 2;
  const logs = W.mtex(W.logCanvas('#6a4a30', 32), 1, 1); W.logWall(G, 10, 4, 0, 0, -3, 0, logs, 0.18); W.logWall(G, 8, 4, -4, 0, 0, Math.PI / 2, logs, 0.18);
  const top = W.mtex(W.plankCanvas('#7a5234', 33, 5), 1, 1), wood = W.toon({ color: '#5a3a22' });
  W.add(new THREE.BoxGeometry(2.2, 0.1, 1.3), top, 0, 0.92, 0, G); for (const [x, z] of [[-1, -0.55], [1, -0.55], [-1, 0.55], [1, 0.55]]) W.add(new THREE.BoxGeometry(0.1, 0.9, 0.1), wood, x, 0.45, z, G);
  const chair = W.group(G, 0.2, 0, 1.1, 0.2); W.add(new THREE.BoxGeometry(0.6, 0.06, 0.6), wood, 0, 0.5, 0, chair); W.add(new THREE.BoxGeometry(0.6, 0.8, 0.06), wood, 0, 0.9, 0.3, chair); for (const [x, z] of [[-0.27, -0.27], [0.27, -0.27], [-0.27, 0.27], [0.27, 0.27]]) W.add(new THREE.BoxGeometry(0.05, 0.5, 0.05), wood, x, 0.25, z, chair);
  // candle in a brass holder
  W.add(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 16), W.toon({ color: '#c8963a' }), -0.35, 0.985, -0.1, G); W.add(new THREE.CylinderGeometry(0.045, 0.045, 0.26, 12), W.toon({ color: '#f4ecd8' }), -0.35, 1.12, -0.1, G);
  // letter: envelope with red wax seal, folded paper, quill + ink
  const env = W.cvs(512, 340, (g, w, h) => { g.fillStyle = '#eee0c0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8a07a'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h * 0.6); g.lineTo(w, 0); g.stroke(); g.fillStyle = '#a8202a'; g.beginPath(); g.arc(w / 2, h * 0.6, 34, 0, 7); g.fill(); g.fillStyle = '#d04040'; g.beginPath(); g.arc(w / 2 - 6, h * 0.6 - 6, 14, 0, 7); g.fill(); });
  const em = W.add(new THREE.PlaneGeometry(0.42, 0.28), new THREE.MeshBasicMaterial({ map: W.tex(env, 1, 1, false) }), 0.25, 0.976, 0.08, G, { cast: false }); em.rotation.x = -Math.PI / 2; em.rotation.z = 0.25; em.userData.ndSkip = true;
  W.add(new THREE.CylinderGeometry(0.06, 0.07, 0.09, 12), W.toon({ color: '#1e1e2a' }), 0.7, 1.01, -0.3, G);
  const quill = W.add(new THREE.ConeGeometry(0.02, 0.4, 6), W.toon({ color: '#f4f0e8' }), 0.68, 1.15, -0.25, G); quill.rotation.z = 0.5;
  // window with moonlight + shelf
  W.add(new THREE.BoxGeometry(1.2, 1.0, 0.1), W.toon({ color: '#3a4a7a', emissive: '#22305a', emissiveIntensity: 0.8 }), 2.0, 2.2, -2.9, G, { cast: false });
  W.add(new THREE.BoxGeometry(1.6, 0.08, 0.4), wood, -2.2, 2.0, -2.75, G); for (let k = 0; k < 4; k++) W.add(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8), W.toon({ color: ['#5a7a6a', '#8a5a3a', '#6a6a8a', '#7a3a3a'][k] }), -2.8 + k * 0.4, 2.17, -2.75, G);
  return S;
};
