// Continental flyover: plains (east, +x) -> snowy mountains -> red desert (west, -x). Optional telegraph line along z = 0.
import * as W from '../wlib.js';
export const H = (x, z) => { const m = W.sstep(-700, -250, x) * (1 - W.sstep(250, 700, x)); // mountain band
  const ridge = Math.pow(W.fbm(x * 0.004 + 3, z * 0.004), 2) * 900 * m + W.fbm(x * 0.02, z * 0.02) * 40 * m;
  const des = (1 - W.sstep(-1200, -800, x)) * (W.fbm(x * 0.006, z * 0.006) - 0.4) * 90;
  const pl = (W.fbm(x * 0.003, z * 0.003) - 0.5) * 30; const valley = Math.exp(-((z) ** 2) / (2 * 140 * 140)); // pass along the line
  return (ridge * (1 - 0.75 * valley) + Math.max(0, des) + pl); };
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G };
  const mat = W.mtex(W.groundCanvas('#ffffff', ['#e8e8e8', '#f4f4f4'], ['#c8c8c8', '#ffffff'], 51), 60, 30);
  W.terrain(G, 5200, 2600, 330, 165, H, mat, (x, z, y) => {
    const des = 1 - W.sstep(-1100, -700, x), pl = W.sstep(500, 900, x), n = W.fbm(x * 0.01, z * 0.01);
    let c = [0.42 + n * 0.1, 0.55 + n * 0.1, 0.3]; // mountain forest/meadow
    if (y > 260) c = [0.93, 0.95, 1.0]; else if (y > 170) c = [0.55 + n * 0.1, 0.5, 0.48];
    const d = [0.86 + n * 0.1, 0.45 + n * 0.08, 0.26]; const p = [0.72 + n * 0.1, 0.68 + n * 0.08, 0.36];
    c = c.map((v, i) => v * (1 - des) + d[i] * des); c = c.map((v, i) => v * (1 - pl) + p[i] * pl);
    const riv = Math.abs(z - 160 * Math.sin(x * 0.004)) < 12 && x > 300 ? 1 : 0; if (riv) c = [0.3, 0.55, 0.75];
    return c; }, 0, 0);
  // forests as instanced cones on the mountains
  const cone = new THREE.ConeGeometry(4, 16, 6); cone.translate(0, 8, 0);
  W.scatter(G, 2500, cone, W.toon({ color: '#2e5a34' }), (R) => { const x = -600 + R() * 1300, z = (R() - 0.5) * 2000, y = H(x, z); if (y > 200 || y < 20) return null; return [x, y - 1, z, 0.8 + R() * 0.8]; }, 3, false);
  // mesas in the desert
  const rockM = W.mtex(W.strataCanvas(['#c8643a', '#d0703f', '#bc5c36', '#d87a48'], 3), 3, 1);
  const R = W.rng(4); for (let i = 0; i < 40; i++) { const x = -2400 + R() * 1500, z = (R() - 0.5) * 2200; if (Math.abs(z) < 60) continue; W.rock(G, x, z, 30 + R() * 50, 40 + R() * 70, rockM, i, { top: 0.82, led: 5, sink: 2 }); }
  // telegraph line along z = 0 (poles every 60 m) following the ground
  S.poles = W.group(G); const pm = W.toon({ color: '#5a4030' }), wm = W.toon({ color: '#2a2228' }); const tops = [];
  for (let x = -2500; x <= 2500; x += 60) { const y = H(x, 0); const p = W.pole(S.poles, x, 0, 8, pm, Math.PI / 2, false); p.position.y = y; tops.push([x, y + 7.7, 0.6]); }
  S.wire = W.wire(S.poles, tops, wm, 0.12, 1.2); S.poleTops = tops;
  S.clouds = []; for (let i = 0; i < 26; i++) { const m = W.billboard(G, W.cloudCanvas(i + 60, '#ffffff', '#f0c8b8'), 260 + R() * 200, 110, -2400 + R() * 4800, 330 + R() * 160, (R() - 0.5) * 1600, { fog: false }); S.clouds.push(m); }
  return S;
};
export const update = (S, Wd, f) => { S.poles.visible = !!Wd.poles; };
