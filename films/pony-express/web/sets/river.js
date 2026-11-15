// 9c: shallow fast river (flowing along z) crossed along x.
import * as W from '../wlib.js';
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G };
  const grass = W.mtex(W.groundCanvas('#8aa050', ['#7a9044', '#9ab060'], ['#5a7034', '#c8c070'], 101), 40, 40);
  const h = (x, z) => -0.9 * (1 - W.sstep(6, 9, Math.abs(x))) + (W.fbm(x * 0.01, z * 0.01) - 0.5) * 40 * W.sstep(80, 260, Math.hypot(x, z)) + (W.fbm(x * 0.1, z * 0.1) - 0.5) * 0.3;
  W.terrain(G, 1200, 1200, 200, 200, h, grass, (x, z, y) => y < -0.3 ? [0.72, 0.66, 0.56] : [0.95, 0.95, 0.85]);
  const water = W.add(new THREE.PlaneGeometry(16, 600, 8, 60), ctx.waterMat, 0, -0.32, 0, G, { cast: false }); water.rotation.x = -Math.PI / 2; water.rotation.z = Math.PI / 2; water.userData.nd = ctx.waterNd; water.scale.set(1, 1, 1);
  water.rotation.set(-Math.PI / 2, 0, 0); water.scale.set(1, 1, 1);
  W.scatter(G, 140, new THREE.DodecahedronGeometry(0.45, 0), W.toon({ color: '#8a8a84' }), (R) => { const x = (R() - 0.5) * 18, z = (R() - 0.5) * 80; return [x, h(x, z) + 0.1, z, 0.3 + R() * 0.9]; }, 7);
  const reeds = W.grassCanvas(['#6a8a3a', '#8aa04a', '#5a7030'], 11, 30);
  W.tufts(G, 2500, (R) => { const x = (R() < 0.5 ? -1 : 1) * (6.5 + R() * 20), z = -40 + R() * 80; return [x, h(x, z), z]; }, reeds, [0.5, 1.2], 41, ['#ffffff', '#e0f0c0']);
  const tree = (x, z, s) => { const t = W.group(G, x, h(x, z), z); W.add(new THREE.CylinderGeometry(0.25 * s, 0.4 * s, 4 * s, 6), W.toon({ color: '#5a4434' }), 0, 2 * s, 0, t); for (let k = 0; k < 4; k++) W.add(new THREE.SphereGeometry(1.8 * s, 10, 8), W.toon({ color: k % 2 ? '#6a9a3e' : '#7aa848' }), (k - 1.5) * s, 4.4 * s + (k % 2) * 0.6 * s, (k % 2) * 0.6, t); };
  const R = W.rng(9); for (let i = 0; i < 26; i++) tree((R() < 0.5 ? -1 : 1) * (10 + R() * 30), -60 + R() * 60, 0.8 + R() * 0.8);
  for (let i = 0; i < 12; i++) { const x = -500 + i * 90, hh = 150 + R() * 120; W.add(new THREE.ConeGeometry(110, hh, 7), W.toon({ color: '#8a98c0' }), x, hh / 2 - 20, -420, G, { cast: false }); W.add(new THREE.ConeGeometry(34, hh * 0.3, 7), W.toon({ color: '#f4f6fc' }), x, hh * 0.85 - 20, -420, G, { cast: false }); }
  S.clouds = []; for (let i = 0; i < 12; i++) S.clouds.push(W.billboard(G, W.cloudCanvas(i + 160, '#ffffff', '#d8e4f0'), 220 + R() * 140, 100, -600 + R() * 1200, 120 + R() * 100, -560));
  return S;
};
