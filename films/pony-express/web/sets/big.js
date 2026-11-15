// M7: the larger home station at dusk: long log house, lanterns, hay bales, corral.
import * as W from '../wlib.js';
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G };
  const dirt = W.mtex(W.groundCanvas('#9a8060', ['#8a7050', '#aa9070'], ['#6a5038', '#c0a080'], 111), 40, 40);
  const h = (x, z) => (W.fbm(x * 0.006, z * 0.006) - 0.5) * 30 * W.sstep(60, 260, Math.hypot(x, z));
  W.terrain(G, 1400, 1400, 120, 120, h, dirt);
  const logs = W.mtex(W.logCanvas('#7a5638', 51), 1, 1), roof = W.mtex(W.plankCanvas('#5a4030', 52, 14), 3, 2);
  W.cabin(G, 0, -2, 0, 13, 6, 3.2, logs, roof, { win: [-4.5, -2.2, 2.6, 4.8], winCol: '#ffd890', winGlow: '#ffb050', doorX: 0.2 });
  W.cabin(G, -13, -4, 0.25, 7, 5, 2.8, logs, roof, { win: [-1.8, 1.8], winCol: '#ffd890', winGlow: '#ff9a40' });
  // porch
  const wood = W.toon({ color: '#5a3e28' }); W.add(new THREE.BoxGeometry(13.6, 0.22, 2.2), W.mtex(W.plankCanvas('#7a5a3a', 53, 8), 4, 1), 0, 0.11, 2.2, G);
  for (const sx of [-6.4, -2, 2, 6.4]) W.add(new THREE.CylinderGeometry(0.1, 0.1, 3, 6), wood, sx, 1.5, 3.2, G);
  const pr = W.add(new THREE.BoxGeometry(13.6, 0.12, 2.4), roof, 0, 3.05, 2.2, G); pr.rotation.x = -0.1;
  // lanterns: emissive glass + glow billboards
  S.lamps = []; for (const [x, y, z] of [[-6.4, 2.4, 3.3], [2, 2.4, 3.3], [6.4, 2.4, 3.3], [5.2, 1.6, 6.5]]) { W.add(new THREE.BoxGeometry(0.22, 0.3, 0.22), W.toon({ color: '#ffe0a0', emissive: '#ffb050', emissiveIntensity: 2 }), x, y, z, G, { cast: false });
    W.add(new THREE.ConeGeometry(0.18, 0.14, 4), W.toon({ color: '#2a2228' }), x, y + 0.22, z, G); const gl = W.billboard(G, W.softCanvas(255, 190, 110), 2.4, 2.4, x, y, z + 0.05, { add: true, fog: true, order: 4 }); S.lamps.push(gl); }
  W.add(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 6), wood, 5.2, 0.8, 6.5, G);
  const hay = W.mtex(W.cvs(128, 128, (g, w, hh) => { g.fillStyle = '#d0b058'; g.fillRect(0, 0, w, hh); for (let i = 0; i < 120; i++) { g.strokeStyle = ['#b0903e', '#ecd488', '#9a7a2e'][i % 3]; g.lineWidth = 2; const x = (i * 37) % w, y = (i * 53) % hh; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 18, y + 5); g.stroke(); } g.fillStyle = '#8a6a2a'; g.fillRect(0, 40, w, 6); g.fillRect(0, 84, w, 6); }), 1, 1);
  for (const [x, y, z, r] of [[3.6, 0.35, 5.0, 0.2], [4.9, 0.35, 5.2, -0.1], [4.2, 1.05, 5.1, 0.05], [-4.5, 0.35, 5.6, 0.4]]) { const b = W.add(new THREE.BoxGeometry(1.25, 0.7, 0.75), hay, x, y, z, G); b.rotation.y = r; }
  const cp = []; for (let a = 0; a <= 14; a++) { const t = a / 14 * Math.PI * 2; cp.push([16 + Math.cos(t) * 6, -2 + Math.sin(t) * 5]); } W.fence(G, cp, W.mtex(W.logCanvas('#6a5038', 54), 1, 1));
  W.tufts(G, 3000, (R) => { const x = -40 + R() * 80, z = -10 + R() * 40; if (Math.abs(x) < 8 && z < 4) return null; return [x, h(x, z), z]; }, W.sageCanvas('#6a7a5a', 7), [0.3, 0.8], 51, ['#ffffff', '#d8d0e0']);
  const mm = W.toon({ color: '#4a3a6a' }); const R = W.rng(13); for (let i = 0; i < 12; i++) { const x = -600 + i * 110, hh = 120 + R() * 100; W.add(new THREE.ConeGeometry(100, hh, 7), mm, x, hh / 2 - 15, -400, G, { cast: false }); }
  S.clouds = []; for (let i = 0; i < 10; i++) S.clouds.push(W.billboard(G, W.cloudCanvas(i + 180, '#ffa080', '#5a3a7a'), 260 + R() * 160, 100, -600 + R() * 1200, 60 + R() * 80, -650));
  return S;
};
export const update = (S, Wd, f) => { S.lamps.forEach((l, i) => { const fl = 0.85 + 0.15 * Math.sin(f * 0.9 + i * 2) * Math.sin(f * 0.37 + i); l.scale.setScalar(fl); l.material.opacity = fl; }); };
