// M2: grey meadow under storm clouds, a fence through the middle, two groups glaring at each other.
import * as W from '../wlib.js';
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G };
  const grass = W.mtex(W.groundCanvas('#6a7a52', ['#5a6a46', '#7a8a5a'], ['#3a4a2e', '#8a9a6a'], 31), 30, 30);
  W.terrain(G, 1200, 1200, 120, 120, (x, z) => (W.fbm(x * 0.01, z * 0.01) - 0.5) * 14 * W.sstep(40, 200, Math.hypot(x, z)), grass, (x, z) => { const n = W.fbm(x * 0.05, z * 0.05); return [0.85 + n * 0.2, 0.9 + n * 0.15, 0.9]; });
  const wood = W.mtex(W.logCanvas('#7a6a58', 8), 1, 1);
  const pts = []; for (let z = 8; z > -120; z -= 3.2) pts.push([Math.sin(z * 0.05) * 0.4, z]); W.fence(G, pts, wood, 1.25);
  S.grass = W.tufts(G, 5000, (R) => { const x = (R() - 0.5) * 60, z = 10 - R() * 70; return [x, 0, z]; }, W.grassCanvas(['#7a8a5a', '#5a6a44', '#9aa070'], 3, 50), [0.4, 1.0], 11, ['#ffffff', '#d8e0c8']);
  // far hills + lone tree
  const hm = W.toon({ color: '#4a5a4a' }); for (let i = 0; i < 9; i++) { const h = W.add(new THREE.SphereGeometry(60 + i * 8, 16, 8), hm, -260 + i * 70, -20, -320 - (i % 3) * 40, G, { cast: false }); h.scale.y = 0.35; }
  const tr = W.group(G, 14, 0, -40); W.add(new THREE.CylinderGeometry(0.25, 0.4, 4, 7), W.toon({ color: '#3a3028' }), 0, 2, 0, tr);
  for (let k = 0; k < 4; k++) W.add(new THREE.SphereGeometry(1.8 - k * 0.2, 10, 8), W.toon({ color: '#3e5236' }), (k - 1.5) * 0.9, 4.4 + (k % 2) * 0.6, 0, tr);
  // storm clouds: dark billboards low and heavy
  S.clouds = []; const R = W.rng(5);
  for (let i = 0; i < 14; i++) { const m = W.billboard(G, W.cloudCanvas(i + 20, '#5a6070', '#262a36', true), 320 + R() * 200, 150, -300 + R() * 600, 70 + R() * 90, -420 - R() * 120); m.userData.x0 = m.position.x; S.clouds.push(m); }
  // lightning bolt plane in the sky + glow
  S.bolt = W.billboard(G, W.cvs(256, 1024, (g) => { let x = 128; g.strokeStyle = 'rgba(180,200,255,0.5)'; g.lineWidth = 22; const P = [[x, 0]]; const RR = W.rng(3); for (let i = 1; i < 12; i++) { x += (RR() - 0.5) * 70; P.push([x, i * 90]); }
    g.beginPath(); P.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.stroke(); }), 40, 160, 60, 80, -400, { add: true });
  // crow
  S.crow = W.billboard(G, W.cvs(128, 64, (g) => { g.strokeStyle = '#111'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(10, 14); g.quadraticCurveTo(40, 26, 64, 34); g.quadraticCurveTo(88, 26, 118, 14); g.stroke(); }), 1.2, 0.6, 0, 0, 0, { fog: false, order: 2 });
  return S;
};
export const update = (S, Wd, f) => { const t = f / 30;
  S.clouds.forEach((m, i) => { m.position.x = m.userData.x0 + t * (4 + i % 3); });
  const fl = Wd.bolt || 0; S.bolt.visible = fl > 0.05; S.bolt.material.opacity = fl;
  const c = Wd.crow; S.crow.visible = !!c; if (c) S.crow.position.set(c[0], c[1], c[2]);
};
