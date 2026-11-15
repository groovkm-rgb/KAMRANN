// 9b: snowy mountain pass with pines and a blizzard.
import * as W from '../wlib.js';
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G };
  const snow = W.mtex(W.groundCanvas('#eef2fa', ['#dfe6f2', '#f8faff'], ['#c8d4e8', '#ffffff'], 91), 40, 40);
  const h = (x, z) => Math.pow(Math.abs(z) / 30, 1.6) * 6 + (W.fbm(x * 0.03, z * 0.03) - 0.5) * 3 + W.sstep(40, 140, Math.abs(z)) * 90 * W.fbm(x * 0.01, z * 0.01);
  W.terrain(G, 900, 600, 200, 140, h, snow, (x, z, y) => [0.92, 0.95, 1.0]);
  const pine = (x, z, s) => { const g = W.group(G, x, h(x, z) - 0.2, z); W.add(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 1.2 * s, 6), W.toon({ color: '#4a3428' }), 0, 0.6 * s, 0, g);
    for (let k = 0; k < 4; k++) { W.add(new THREE.ConeGeometry((1.5 - k * 0.3) * s, 1.6 * s, 8), W.toon({ color: '#2e5040' }), 0, (1.4 + k * 0.9) * s, 0, g); W.add(new THREE.ConeGeometry((1.2 - k * 0.27) * s, 0.7 * s, 8), W.toon({ color: '#f0f4fc' }), 0, (1.85 + k * 0.9) * s, 0, g); } };
  const R = W.rng(5); for (let i = 0; i < 160; i++) { const x = -120 + R() * 240, z = (R() < 0.5 ? -1 : 1) * (5 + R() * 60); pine(x, z, 0.8 + R() * 1.4); }
  W.scatter(G, 80, new THREE.DodecahedronGeometry(0.8, 0), W.toon({ color: '#6a7080' }), (R) => { const x = -80 + R() * 160, z = (R() - 0.5) * 50; if (Math.abs(z) < 3) return null; return [x, h(x, z), z, 0.4 + R()]; }, 6);
  W.tufts(G, 1500, (R) => { const x = -60 + R() * 120, z = (R() - 0.5) * 30; if (Math.abs(z) < 2) return null; return [x, h(x, z), z]; }, W.grassCanvas(['#e8eef8', '#c8d4e4', '#f8faff'], 9), [0.3, 0.6], 31, ['#ffffff']);
  for (let i = 0; i < 10; i++) { const x = -400 + i * 90, hh = 160 + R() * 90; W.add(new THREE.ConeGeometry(100, hh, 7), W.toon({ color: '#c8d4ec' }), x, hh / 2, -260, G, { cast: false }); }
  return S;
};
