// M1 desert at sunset (hook + side tracking) and the noon crack-flats (shot 9a), all in one group.
import * as W from '../wlib.js';
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G, tumbles: [], birds: [], branch: null };
  const sand = W.mtex(W.groundCanvas('#c8693a', ['#a84a2a', '#e08a50', '#b85a34'], ['#7a3a1e', '#f0a870', '#5a2a14'], 11, 0, 512), 40, 40);
  const sandFar = W.mtex(W.groundCanvas('#c06438', ['#a84a2a', '#d8804a'], ['#7a3a1e', '#e8a070'], 12), 120, 120);
  const crack = W.mtex(W.groundCanvas('#d89a64', ['#c88452', '#e8b07a'], ['#8a5a32', '#f4c890'], 13, 40), 14, 14);
  const rockM = W.mtex(W.strataCanvas(['#c8643a', '#d0703f', '#bc5c36', '#d87a48', '#c26038', '#cc6a3c'], 3), 2, 1);
  const rockM2 = W.mtex(W.strataCanvas(['#b85a34', '#c46a40', '#ae5232', '#c8744a'], 7), 2, 1);
  const topM = W.toon({ color: '#d47a48' }), boulder = W.mtex(W.groundCanvas('#b45a36', ['#8a3a22', '#d07a4a'], ['#5a2a14'], 21), 1, 1);
  const cactM = W.mtex(W.cvs(64, 64, (g, w, h) => { g.fillStyle = '#4e7a3a'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { g.fillStyle = '#3a5e2c'; g.fillRect(x, 0, 3, h); g.fillStyle = '#6a9a4a'; g.fillRect(x + 4, 0, 2, h); } }), 3, 1);
  const wood = W.mtex(W.logCanvas('#6a4a34', 5), 1, 2);
  // ---------- ground: big coarse dunes + fine near patch with the ditch ----------
  const ditch = (x, z) => { const d = Math.abs(z); const k = W.sstep(0.6, 1.5, d); return -0.9 * (1 - k) * W.sstep(26, 18, Math.abs(x)); };
  const dunes = (x, z) => (W.fbm(x * 0.012, z * 0.012) - 0.5) * 9 * W.sstep(60, 160, Math.hypot(x, z + 40)) + (W.fbm(x * 0.05, z * 0.05) - 0.5) * 0.8;
  W.terrain(G, 2400, 2400, 160, 160, (x, z) => dunes(x, z) - 0.05, sandFar, (x, z, y) => { const n = W.fbm(x * 0.02, z * 0.02); return [0.95 + n * 0.1, 0.8 + n * 0.12, 0.75]; });
  const nearH = (x, z) => ditch(x, z) + (W.fbm(x * 0.12, z * 0.12) - 0.5) * 0.35 * W.sstep(2, 5, Math.abs(z));
  W.terrain(G, 90, 90, 180, 180, nearH, sand, (x, z, y) => { const n = W.fbm(x * 0.3, z * 0.3); return y < -0.3 ? [0.72, 0.6, 0.55] : [0.95 + n * 0.12, 0.85 + n * 0.1, 0.8]; }, 0, -10);
  // track strip for the side-tracking shot (z = -26), long and flat
  W.terrain(G, 140, 16, 140, 16, (x, z) => (W.fbm(x * 0.15, z * 0.15) - 0.5) * 0.25, sand, (x, z) => { const n = W.fbm(x * 0.2, z * 0.4); return [0.92 + n * 0.1, 0.82 + n * 0.1, 0.78]; }, 20, -30);
  // ditch lip stones + crumbling edges
  W.scatter(G, 70, new THREE.DodecahedronGeometry(0.18, 0), boulder, (R) => { const x = (R() - 0.5) * 40; const z = (R() < 0.5 ? -1 : 1) * (0.9 + R() * 0.5); return [x, -0.05, z, 0.6 + R()]; }, 3);
  // ---------- far mesas & buttes (sunset backdrop) ----------
  const R = W.rng(9);
  for (let i = 0; i < 16; i++) { const a0 = -Math.PI / 2 + (R() - 0.5) * 2.2, a = Math.abs(a0 + 1.66) < 0.12 ? a0 + 0.3 : a0, d = 240 + R() * 380; W.rock(G, Math.cos(a) * d, Math.sin(a) * d, 25 + R() * 60, 30 + R() * 70, i % 2 ? rockM : rockM2, i, { top: 0.82, led: 5 }); }
  for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (R() - 0.5) * 2.6, d = 200 + R() * 300; W.rock(G, Math.cos(a) * d, Math.sin(a) * d, 30 + R() * 50, 30 + R() * 50, rockM2, 40 + i, { top: 0.8, led: 4 }); }
  // hoodoo spires, mid distance (thin, eroded, with a cap rock)
  for (let i = 0; i < 18; i++) { const x = (R() - 0.5) * 170, z = -55 - R() * 110; if (Math.abs(x) < 8) continue; const h = 7 + R() * 16, r = 1.4 + R() * 2.2;
    W.rock(G, x, z, r, h, i % 2 ? rockM : rockM2, 60 + i, { top: 0.55, led: 9, sink: 0.5 }); W.add(new THREE.DodecahedronGeometry(r * 0.8, 1), rockM2, x, h - 0.6, z, G).scale.set(1.2, 0.6, 1.2); }
  // eroded rock band far behind the side-tracking strip (parallax)
  for (let i = 0; i < 18; i++) { const x = -50 + i * 6.5 + R() * 3, z = -58 - R() * 14, h = 5 + R() * 10, r = 3 + R() * 3;
    W.rock(G, x, z, r, h, i % 3 ? rockM : rockM2, 90 + i, { top: 0.7, led: 6 }); }
  // boulders everywhere
  W.scatter(G, 120, new THREE.DodecahedronGeometry(0.7, 0), boulder, (R) => { const x = (R() - 0.5) * 120, z = 20 - R() * 110; if (Math.abs(z) < 2.5 && Math.abs(x) < 20) return null; if (Math.abs(z + 26) < 2.5) return null; return [x, 0, z, 0.4 + R() * 1.6]; }, 5);
  // cacti
  for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 110, z = 25 - R() * 120; if (Math.abs(z) < 3.5 && Math.abs(x) < 10) continue; if (Math.abs(z + 26) < 3.2) continue; W.cactus(G, x, z, 2.2 + R() * 3.4, cactM, i + 3); }
  W.cactus(G, -4.2, -7.5, 4.6, cactM, 91); W.cactus(G, 5.5, -11, 3.6, cactM, 92); W.cactus(G, 2.6, 4.5, 3.2, cactM, 93);
  // near-camera foreground cacti for the side track (z between camera -20.5 and track -26)
  for (let i = 0; i < 9; i++) W.cactus(G, -18 + i * 8.5 + R() * 3, -21.6 - R() * 1.4, 1.8 + R() * 1.6, cactM, 200 + i);
  // sage + dry grass tufts
  W.tufts(G, 2600, (R) => { const x = (R() - 0.5) * 70, z = 12 - R() * 70; const y = nearH(x, z); if (y < -0.2) return null; return [x, y, z]; }, W.sageCanvas('#8a8a5a', 3), [0.35, 0.9], 4, ['#ffffff', '#e8d0b0', '#c8b890']);
  W.tufts(G, 2200, (R) => { const x = (R() - 0.5) * 80, z = 8 - R() * 60; const y = nearH(x, z); if (y < -0.2) return null; return [x, y, z]; }, W.grassCanvas(['#d8a050', '#e8c070', '#b88040']), [0.3, 0.7], 6, ['#ffffff', '#ffe0b0']);
  W.tufts(G, 1400, (R) => { const x = -50 + R() * 140, z = -21 - R() * 12; if (Math.abs(z + 26) < 1.5) return null; return [x, 0, z]; }, W.grassCanvas(['#d8a050', '#e8c070', '#b88040'], 4), [0.4, 1.0], 8, ['#ffffff', '#ffe0b0']);
  // dead tree with a low branch across the track (x = 4, z = -26)
  { const T = W.group(G, 4.6, 0, -27.6, 0.3); W.add(new THREE.CylinderGeometry(0.22, 0.4, 3.2, 7), wood, 0, 1.6, 0, T);
    const b = W.add(new THREE.CylinderGeometry(0.07, 0.16, 5.2, 6), wood, -0.6, 2.75, 1.9, T); b.rotation.set(1.25, 0, 0.25); S.branch = b;
    const b2 = W.add(new THREE.CylinderGeometry(0.06, 0.12, 2.2, 6), wood, 0.5, 3.6, 0.2, T); b2.rotation.z = -0.8;
    for (let k = 0; k < 6; k++) { const tw = W.add(new THREE.CylinderGeometry(0.02, 0.04, 0.8, 4), wood, -0.4 + k * 0.1, 2.5 + (k % 2) * 0.2, 1.0 + k * 0.55, T); tw.rotation.set(0.6 * (k % 2 ? 1 : -1), 0, 0.9); } }
  // ---------- noon crack-flats (shot 9a), x 300..420 ----------
  W.terrain(G, 160, 160, 80, 80, (x, z) => (W.fbm(x * 0.03, z * 0.03) - 0.5) * 1.2, crack, null, 360, -40);
  for (let i = 0; i < 14; i++) { const x = 300 + R() * 120, z = -50 - R() * 80, h = 6 + R() * 12; W.rock(G, x, z, 2 + R() * 3, h, rockM, 400 + i, { top: 0.6, led: 7, sink: 0.5 }); }
  for (let i = 0; i < 16; i++) W.cactus(G, 300 + R() * 120, -8 - R() * 60, 2 + R() * 3, cactM, 300 + i);
  W.tufts(G, 900, (R) => [300 + R() * 120, 0, 10 - R() * 70], W.sageCanvas('#9a9a6a', 5), [0.3, 0.7], 9, ['#ffffff', '#e8d8b0']);
  // ---------- sky dressing ----------
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (R() - 0.5) * 1.8, d = 700; const m = W.billboard(G, W.cloudCanvas(i + 1, '#ffb070', '#a04a6a'), 260 + R() * 160, 110, Math.cos(a) * d, 40 + R() * 120, Math.sin(a) * d, { opacity: 0.95 }); m.userData.drift = 0.02 + R() * 0.03; m.userData.x0 = m.position.x; (S.clouds ||= []).push(m); }
  // sun flare (additive), placed along the sunset direction
  S.flare = W.billboard(G, W.softCanvas(255, 200, 120), 520, 520, 0, 40, -900, { add: true, opacity: 0.9, order: -1 });
  S.streak = W.billboard(G, W.cvs(512, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,190,120,0)'); gr.addColorStop(0.5, 'rgba(255,230,180,0.9)'); gr.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = gr; g.fillRect(0, 24, w, 16); }), 1400, 60, 0, 40, -890, { add: true, opacity: 0.6 });
  // tumbleweeds (camera-facing cards that roll)
  const twc = W.cvs(256, 256, (g) => { const RR = W.rng(41); g.translate(128, 128); for (let i = 0; i < 40; i++) { g.strokeStyle = i % 3 ? '#8a6a3a' : '#5a4224'; g.lineWidth = 2.5; g.beginPath(); g.ellipse((RR() - 0.5) * 50, (RR() - 0.5) * 50, 40 + RR() * 50, 30 + RR() * 50, RR() * 3, RR() * 6, RR() * 6 + 2); g.stroke(); } });
  for (let i = 0; i < 4; i++) { const m = W.billboard(G, twc, 1.1, 1.1, 0, 0.55, 0, { fog: true, order: 3 }); m.material.map.center.set(0.5, 0.5); m.material.depthWrite = true; m.material.alphaTest = 0.3; m.userData.ndSkip = true; S.tumbles.push(m); }
  // birds
  const bird = (fl) => W.cvs(128, 64, (g) => { g.strokeStyle = '#1a1416'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(10, 32 - fl * 22); g.quadraticCurveTo(40, 20, 64, 34); g.quadraticCurveTo(88, 20, 118, 32 - fl * 22); g.stroke(); });
  S.birdTex = [W.tex(bird(1), 1, 1, false), W.tex(bird(-0.6), 1, 1, false)];
  for (let i = 0; i < 6; i++) { const m = W.billboard(G, bird(1), 1.6, 0.8, 0, 0, 0, { fog: false, order: 2 }); S.birds[i] = m; }
  return S;
};
export const update = (S, Wd, f) => {
  const t = f / 30, cam = Wd.cam;
  // flare follows the sun direction from the camera
  if (Wd.sunDir) { const d = Wd.sunDir; S.flare.position.set(cam[0] + d[0] * 900, cam[1] + d[1] * 900, cam[2] + d[2] * 900); S.streak.position.copy(S.flare.position); S.flare.visible = S.streak.visible = !!Wd.flare; S.flare.material.opacity = Wd.flare || 0; S.streak.material.opacity = (Wd.flare || 0) * 0.7; }
  (S.clouds || []).forEach((m, i) => { m.position.x = m.userData.x0 + t * 3 * (i % 2 ? 1 : -1); });
  // tumbleweeds roll across near the action
  const tw = Wd.tumble || [];
  S.tumbles.forEach((m, i) => { const d = tw[i]; m.visible = !!d; if (!d) return; const x = d.x0 + d.v * (f - d.f0) / 30, b = Math.abs(Math.sin((f - d.f0) * 0.25)) * 0.35;
    m.position.set(x, 0.55 * d.s + b, d.z); m.scale.setScalar(d.s); m.material.map.rotation = -(x / (0.55 * d.s)); });
  // birds circling far away
  const bs = Wd.birds || [];
  S.birds.forEach((m, i) => { const b = bs[i]; m.visible = !!b; if (!b) return; const a = t * 0.3 + i * 1.3; m.position.set(b[0] + Math.cos(a) * 8, b[1] + Math.sin(a * 2) * 1.5, b[2] + Math.sin(a) * 4); m.material.map = S.birdTex[Math.floor(f / 4 + i) % 2]; m.scale.setScalar(b[3] || 1); });
};
