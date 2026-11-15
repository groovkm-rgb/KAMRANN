// M5 + M11: small relay station (log cabin, "Poststation" sign), stable with saddle pegs, trough, corral, pasture fence.
import * as W from '../wlib.js';
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G };
  const dirt = W.mtex(W.groundCanvas('#c8a070', ['#b89060', '#d8b080', '#a8a060'], ['#8a6a40', '#e8c898'], 81), 50, 50);
  const h = (x, z) => (W.fbm(x * 0.006, z * 0.006) - 0.5) * 30 * W.sstep(60, 260, Math.hypot(x, z)) + (W.fbm(x * 0.08, z * 0.08) - 0.5) * 0.3;
  W.terrain(G, 1600, 1600, 140, 140, h, dirt, (x, z) => { const n = W.fbm(x * 0.03, z * 0.03), road = Math.exp(-((z - 6) ** 2) / 8); return [0.95 + n * 0.1 + road * 0.05, 0.92 + n * 0.08, 0.82 - road * 0.05]; });
  const logs = W.mtex(W.logCanvas('#8a6040', 41), 1, 1), roof = W.mtex(W.plankCanvas('#6a5038', 42, 14), 2, 2);
  W.cabin(G, 0, 0, 0, 7, 5, 2.9, logs, roof, { doorX: 0, win: [-2.2, 2.2] });
  S.sign = W.signMesh(G, W.signCanvas('Poststation', 1024, 220, { size: 120, bg: '#5a3418' }), 3.0, 0.64, 0, 2.5, 2.76, 0, W.toon({ color: '#2a160a' }));
  // porch + posts
  const wood = W.toon({ color: '#6a4a30' }); W.add(new THREE.BoxGeometry(7.4, 0.2, 1.8), W.mtex(W.plankCanvas('#8a6440', 43, 8), 3, 1), 0, 0.1, 3.4, G);
  // "Geschlossen" plank (shown in shot 17) across the door
  S.closed = W.signMesh(G, W.signCanvas('Geschlossen', 1024, 230, { size: 112, bg: '#7a5a3a', fg: '#2a160a', ink: '#f2e6c8', stroke: 6 }), 1.55, 0.35, 0.02, 1.3, 2.8, 0, W.toon({ color: '#5a4028' }));
  S.closed.rotation.z = -0.06; S.nails = [];
  for (const sx of [-0.66, 0.66]) { const n = W.add(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8), W.toon({ color: '#2a2a2e' }), sx, 0, 0.04, S.closed, { cast: false }); n.rotation.x = Math.PI / 2; S.nails.push(n); }
  // stable (open lean-to) at x = 9 facing +z, with saddle pegs on the back wall
  const st = W.group(G, 10, 0, -0.5); S.stable = st;
  const planks = W.mtex(W.plankCanvas('#7a5a3a', 44, 10), 2, 1);
  W.add(new THREE.BoxGeometry(7, 3.4, 0.2), planks, 0, 1.7, -2.2, st); W.add(new THREE.BoxGeometry(0.2, 3.4, 4.6), planks, -3.5, 1.7, 0, st); W.add(new THREE.BoxGeometry(0.2, 3.4, 4.6), planks, 3.5, 1.7, 0, st);
  const r2 = W.add(new THREE.BoxGeometry(7.6, 0.2, 5.4), roof, 0, 3.5, 0.1, st); r2.rotation.x = -0.12;
  for (const sx of [-3.4, 0, 3.4]) W.add(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 6), wood, sx, 1.6, 2.2, st);
  const hay = W.mtex(W.cvs(128, 128, (g, w, hh) => { g.fillStyle = '#d8b860'; g.fillRect(0, 0, w, hh); for (let i = 0; i < 90; i++) { g.strokeStyle = ['#b8983e', '#f0d888', '#a8882e'][i % 3]; g.lineWidth = 2; const x = (i * 37) % w, y = (i * 53) % hh; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 16, y + 4); g.stroke(); } }), 1, 1);
  W.add(new THREE.BoxGeometry(1.2, 0.6, 0.7), hay, 2.4, 0.3, 1.2, st); W.add(new THREE.BoxGeometry(1.2, 0.6, 0.7), hay, 2.6, 0.9, 1.0, st);
  // saddles on pegs (shot 18): leather saddle shapes
  const leather = W.toon({ color: '#7a4426' }), dark = W.toon({ color: '#4a2a18' });
  for (let k = 0; k < 4; k++) { const sx = -2.4 + k * 1.6, peg = W.add(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), dark, sx, 2.1, -1.9, st); peg.rotation.x = Math.PI / 2;
    const sd = W.group(st, sx, 1.9, -1.75); const seat = W.add(new THREE.SphereGeometry(0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), leather, 0, 0, 0, sd); seat.scale.set(1, 0.6, 1.2); seat.rotation.x = Math.PI;
    W.add(new THREE.BoxGeometry(0.7, 0.55, 0.06), leather, 0, -0.3, 0.32, sd); W.add(new THREE.CylinderGeometry(0.05, 0.07, 0.18, 8), dark, 0, 0.14, 0.3, sd);
    const stir = W.add(new THREE.TorusGeometry(0.1, 0.02, 6, 12), dark, 0.25, -0.75, 0.3, sd); }
  // trough, hitching post, barrels
  W.add(new THREE.BoxGeometry(2.2, 0.6, 0.8), W.mtex(W.plankCanvas('#6a4a30', 45, 4), 1, 1), -4.8, 0.3, 3.0, G);
  const water = W.add(new THREE.PlaneGeometry(2.0, 0.6), ctx.waterMat, -4.8, 0.58, 3.0, G, { cast: false }); water.rotation.x = -Math.PI / 2; water.userData.nd = ctx.waterNd;
  W.add(new THREE.BoxGeometry(0.12, 0.12, 3.2), wood, 4.2, 1.05, 4.6, G); for (const dz of [-1.5, 1.5]) W.add(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 6), wood, 4.2, 0.55, 4.6 + dz, G);
  for (let k = 0; k < 3; k++) W.add(new THREE.CylinderGeometry(0.3, 0.3, 0.85, 10), W.toon({ color: '#8a5a30' }), -3.4 + k * 0.62, 0.42, 3.2 + (k % 2) * 0.3, G);
  // corral west of the cabin and the pasture fence along z = 11
  const fm = W.mtex(W.logCanvas('#8a6a4a', 46), 1, 1); const cp = []; for (let a = 0; a <= 12; a++) { const t = a / 12 * Math.PI * 2; cp.push([-13 + Math.cos(t) * 5, -1 + Math.sin(t) * 4]); } W.fence(G, cp, fm);
  const pf = []; for (let x = -2; x <= 40; x += 3) pf.push([x, 11]); W.fence(G, pf, fm, 1.25);
  W.tufts(G, 4200, (R) => { const x = -40 + R() * 90, z = -20 + R() * 60; if (Math.abs(z - 6) < 2.2 && x > -10) return null; if (Math.abs(x) < 5 && Math.abs(z) < 4) return null; return [x, h(x, z), z]; }, W.sageCanvas('#8a9a6a', 6), [0.3, 0.8], 21, ['#ffffff', '#e8e0c0', '#d0d8b0']);
  W.tufts(G, 3000, (R) => { const x = -10 + R() * 60, z = 11 + R() * 40; return [x, h(x, z), z]; }, W.grassCanvas(['#b8b060', '#d8c878', '#98a050']), [0.4, 0.9], 22, ['#ffffff', '#f0e8c0']);
  const mm = W.toon({ color: '#9a90b8' }), sn = W.toon({ color: '#f4f4fa' }); const R = W.rng(12);
  for (let i = 0; i < 14; i++) { const x = -700 + i * 110, z = -420 - R() * 80, hh = 140 + R() * 120; W.add(new THREE.ConeGeometry(110 + R() * 40, hh, 7), mm, x, hh / 2 - 15, z, G, { cast: false }); W.add(new THREE.ConeGeometry(34, hh * 0.3, 7), sn, x, hh * 0.85 - 15, z, G, { cast: false }); }
  for (let i = 0; i < 10; i++) { const x = 300 + R() * 300, z = -200 + R() * 400, hh = 30 + R() * 40; W.rock(G, x, z, 30 + R() * 30, hh, W.toon({ color: '#c09070' }), i + 5, { top: 0.8 }); }
  S.clouds = []; for (let i = 0; i < 14; i++) S.clouds.push(W.billboard(G, W.cloudCanvas(i + 140, '#ffffff', '#f0d8c8'), 220 + R() * 140, 100, -700 + R() * 1400, 120 + R() * 110, -600 + (R() - 0.5) * 300));
  return S;
};
export const update = (S, Wd, f) => { S.sign.visible = !Wd.noSign; S.closed.visible = Wd.closed !== undefined; if (Wd.closed !== undefined) { const k = Wd.closed; S.closed.position.z = 2.8 + (1 - k) * 0.25; S.nails.forEach((n, i) => (n.visible = Wd.nails > i)); } };
