// M4 / M8: dusty Western street running along z (east = +z). Print shop interior at x = 200.
import * as W from '../wlib.js';
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G };
  const dirt = W.mtex(W.groundCanvas('#c89a68', ['#b88a58', '#d8aa78'], ['#8a6040', '#e8c090'], 61), 30, 30);
  W.terrain(G, 1400, 1400, 100, 100, (x, z) => (W.fbm(x * 0.008, z * 0.008) - 0.5) * 30 * W.sstep(80, 300, Math.hypot(x, z)), dirt, (x, z) => { const n = W.fbm(x * 0.06, z * 0.3); return [0.95 + n * 0.1, 0.9 + n * 0.1, 0.85]; });
  const cols = ['#b87a4a', '#8a9aa8', '#c8a26a', '#9a5a4a', '#a8b07a', '#d8c09a', '#7a8a9a', '#b8906a'];
  for (let i = 0; i < 9; i++) { const z = 34 - i * 9.5; W.falseFront(G, -11, z, Math.PI / 2, 8, 9, 6.5 + (i % 3) * 1.2, cols[i % 8], i + 1); W.falseFront(G, 11, z - 3, -Math.PI / 2, 8, 9, 6 + ((i + 1) % 3) * 1.3, cols[(i + 3) % 8], i + 20, { door: i === 3 ? '#2a4a7a' : undefined }); }
  // post office emblem (envelope) on the right side, building i = 3 (z ~ 2.5)
  const env = W.cvs(256, 160, (g) => { g.fillStyle = '#f4ead2'; g.fillRect(10, 10, 236, 140); g.strokeStyle = '#3a2a1a'; g.lineWidth = 8; g.strokeRect(10, 10, 236, 140); g.beginPath(); g.moveTo(10, 10); g.lineTo(128, 90); g.lineTo(246, 10); g.stroke(); g.fillStyle = '#b8282b'; g.beginPath(); g.arc(128, 92, 16, 0, 7); g.fill(); });
  W.signMesh(G, env, 1.6, 1.0, 10.8, 5.2, -0.5, -Math.PI / 2, W.toon({ color: '#6a4224' }));
  // props: hitching rails, barrels, wagon, troughs, lamp posts
  const wood = W.toon({ color: '#6a4a30' }), dark = W.toon({ color: '#3a2a1e' });
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) { const z = 30 - i * 14; W.add(new THREE.BoxGeometry(0.1, 0.1, 3), wood, sx * 7.6, 1.0, z, G); for (const dz of [-1.4, 1.4]) W.add(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 6), wood, sx * 7.6, 0.55, z + dz, G); }
  for (let i = 0; i < 14; i++) { const z = 36 - i * 6.3, sx = i % 2 ? 1 : -1; W.add(new THREE.CylinderGeometry(0.32, 0.32, 0.85, 10), W.toon({ color: '#8a5a30' }), sx * (7.2 + (i % 3) * 0.3), 0.42, z, G); }
  const wagon = W.group(G, -5.5, 0, -20, 0.3); W.add(new THREE.BoxGeometry(1.8, 0.6, 3.6), wood, 0, 1.1, 0, wagon); for (const [x, z] of [[-1, -1.2], [1, -1.2], [-1, 1.2], [1, 1.2]]) { const w = W.add(new THREE.TorusGeometry(0.55, 0.06, 6, 16), dark, x, 0.6, z, wagon); w.rotation.y = Math.PI / 2; }
  const cover = W.add(new THREE.CylinderGeometry(1.0, 1.0, 3.2, 12, 1, true, 0, Math.PI), W.toon({ color: '#efe6d2', side: THREE.DoubleSide }), 0, 1.4, 0, wagon); cover.rotation.x = Math.PI / 2; cover.rotation.z = -Math.PI / 2; cover.rotation.y = 0;
  // water tower + windmill at the west end
  const wt = W.group(G, 16, 0, -48); for (const [x, z] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) W.add(new THREE.CylinderGeometry(0.15, 0.15, 9, 6), wood, x, 4.5, z, wt);
  W.add(new THREE.CylinderGeometry(2.6, 2.6, 3.5, 16), W.mtex(W.plankCanvas('#8a6040', 9, 12), 4, 1), 0, 10.6, 0, wt); W.add(new THREE.ConeGeometry(2.9, 1.6, 16), dark, 0, 13.2, 0, wt);
  const wm = W.group(G, -17, 0, -44); W.add(new THREE.CylinderGeometry(0.2, 0.6, 12, 4), wood, 0, 6, 0, wm); S.wheel = W.group(wm, 0, 12, 0.8);
  for (let k = 0; k < 12; k++) { const b = W.add(new THREE.BoxGeometry(0.35, 2.4, 0.05), W.toon({ color: '#d8d0c0' }), 0, 0, 0, S.wheel); b.rotation.z = k / 12 * Math.PI * 2; b.geometry.translate(0, 1.3, 0); }
  // far hills + mountains (west, -z) and plains (east, +z)
  const hm = W.toon({ color: '#c89a70' }); for (let i = 0; i < 12; i++) { const h = W.add(new THREE.SphereGeometry(70 + (i % 4) * 20, 16, 8), hm, -400 + i * 75, -15, -380 - (i % 3) * 60, G, { cast: false }); h.scale.y = 0.4; }
  const mm = W.toon({ color: '#9a8ab0' }); for (let i = 0; i < 8; i++) W.add(new THREE.ConeGeometry(120, 160 + (i % 3) * 40, 7), mm, -500 + i * 140, 60, -650, G, { cast: false });
  W.tufts(G, 1800, (R) => { const x = (R() - 0.5) * 60, z = 50 - R() * 110; if (Math.abs(x) < 7.5) return null; return [x, 0, z]; }, W.grassCanvas(['#b89a5a', '#d8b878', '#9a8048'], 7), [0.3, 0.7], 12, ['#ffffff', '#e8d0a8']);
  // bunting across the street (victory)
  const bunt = W.cvs(512, 64, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = ['#e8c048', '#c83a3a', '#3a6ab0', '#f2ead8'][i % 4]; g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 + 32, 0); g.lineTo(i * 32 + 16, 50); g.fill(); } });
  S.bunting = []; for (let k = 0; k < 3; k++) { const m = W.add(new THREE.PlaneGeometry(20, 1.1), new THREE.MeshBasicMaterial({ map: W.tex(bunt, 1, 1, false), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }), 0, 6.4, 18 - k * 16, G, { cast: false }); m.userData.ndSkip = true; m.rotation.y = 0; S.bunting.push(m); }
  // crowds: waiting group (east-facing) and victory lines on both sides
  const vW = [{ spec: 'townA', opts: { expr: 'worried', look: 0 } }, { spec: 'lady', opts: { expr: 'worried' } }, { spec: 'miner', opts: { expr: 'neutral' } }, { spec: 'townB', opts: { expr: 'worried' } }, { spec: 'lady2', opts: { expr: 'neutral' } }];
  const vV = [{ spec: 'townA', opts: { expr: 'laugh', L: 'up', R: 'wave' } }, { spec: 'lady', opts: { expr: 'happy', L: 'wave', R: 'up' } }, { spec: 'miner', opts: { expr: 'laugh', L: 'up', R: 'up' } }, { spec: 'townB', opts: { expr: 'goofy', L: 'wave', R: 'hip' } }, { spec: 'lady2', opts: { expr: 'laugh', L: 'up', R: 'wave' } }, { spec: 'newsboy', opts: { expr: 'laugh', L: 'up', R: 'up' } }];
  const R = W.rng(3), sw = [], sv = [];
  for (let i = 0; i < 40; i++) sw.push([-6 + R() * 13, -2 - R() * 14, 0.95 + R() * 0.1, i]);
  for (let i = 0; i < 170; i++) { const side = i % 2 ? 1 : -1; sv.push([side * (5 + R() * 2.6), 30 - R() * 70, 0.95 + R() * 0.12, i]); }
  S.wait = W.crowd(G, vW, sw, [0, 0, 40]); S.vic = W.crowd(G, vV, sv, [0, 0, 0]);
  // ---------- print shop interior at x = 200 ----------
  const P = W.group(G, 200, 0, 0); S.press = P;
  const floor = W.add(new THREE.PlaneGeometry(14, 14), W.mtex(W.plankCanvas('#6a4a30', 4, 10), 4, 4), 0, 0.01, 0, P, { cast: false }); floor.rotation.x = -Math.PI / 2;
  const wallM = W.mtex(W.plankCanvas('#8a6a4a', 5, 12), 3, 2);
  W.add(new THREE.BoxGeometry(14, 6, 0.2), wallM, 0, 3, -5, P); W.add(new THREE.BoxGeometry(0.2, 6, 14), wallM, -6, 3, 0, P); W.add(new THREE.BoxGeometry(0.2, 6, 14), wallM, 6, 3, 0, P);
  // window in the back wall with a light beam
  W.add(new THREE.BoxGeometry(2.4, 2.0, 0.25), W.toon({ color: '#fff4d8', emissive: '#ffe8b0', emissiveIntensity: 1.5 }), 2.5, 3.6, -4.95, P, { cast: false });
  const beam = W.add(new THREE.PlaneGeometry(2.6, 9), new THREE.MeshBasicMaterial({ map: W.tex(W.cvs(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,230,170,0.5)'); gr.addColorStop(1, 'rgba(255,230,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), 1, 1, false), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 2.0, 2.4, -1.5, P, { cast: false });
  beam.rotation.set(-0.95, 0.15, 0); beam.userData.ndSkip = true;
  // the press: iron frame, platen, big flywheel, roller, paper feed table
  const iron = W.toon({ color: '#2e3036' }), brass = W.toon({ color: '#c89a3a' }), paperM = W.toon({ color: '#f2ead6' });
  W.add(new THREE.BoxGeometry(2.4, 0.4, 1.6), iron, 0, 0.2, 0, P); for (const sx of [-1, 1]) W.add(new THREE.BoxGeometry(0.3, 2.6, 0.3), iron, sx * 1.0, 1.5, 0, P);
  W.add(new THREE.BoxGeometry(2.3, 0.35, 1.4), iron, 0, 2.9, 0, P); S.platen = W.add(new THREE.BoxGeometry(1.9, 0.18, 1.2), brass, 0, 1.9, 0, P);
  W.add(new THREE.BoxGeometry(1.9, 0.25, 1.2), iron, 0, 1.05, 0, P);
  S.fly = W.group(P, 1.5, 1.8, 0); const fw = W.add(new THREE.TorusGeometry(0.9, 0.09, 8, 24), iron, 0, 0, 0, S.fly); fw.rotation.y = Math.PI / 2; for (let k = 0; k < 4; k++) { const sp = W.add(new THREE.BoxGeometry(0.06, 1.8, 0.06), iron, 0, 0, 0, S.fly); sp.rotation.x = k * Math.PI / 4; }
  S.roll = W.add(new THREE.CylinderGeometry(0.22, 0.22, 1.5, 16), W.toon({ color: '#1a1a1e' }), -0.2, 2.35, 0, P); S.roll.rotation.x = Math.PI / 2;
  const hl = W.cvs(512, 720, (g, w, h) => { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1416'; g.font = 'bold 44px "Rye","Georgia",serif'; g.textAlign = 'center';
    g.fillRect(20, 20, w - 40, 6); g.fillText('Die Rede', w / 2, 92); g.fillText('des Präsidenten', w / 2, 146); g.fillRect(20, 168, w - 40, 4);
    for (let r = 0; r < 18; r++) for (const cx of [30, 270]) { g.fillStyle = 'rgba(40,30,30,0.55)'; g.fillRect(cx, 200 + r * 27, 210 * (0.7 + 0.3 * ((r * 7) % 5) / 5), 9); } });
  S.paperTex = W.tex(hl, 1, 1, false);
  const stack = W.add(new THREE.BoxGeometry(1.0, 0.5, 1.35), paperM, -2.6, 0.95, 0.4, P); W.add(new THREE.BoxGeometry(1.4, 0.9, 1.6), W.toon({ color: '#6a4a30' }), -2.6, 0.45, 0.4, P);
  const blank = W.tex(W.cvs(256, 360, (g, w, h) => { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1416'; g.fillRect(14, 16, w - 28, 26); g.fillRect(14, 50, w - 60, 16); for (let r = 0; r < 12; r++) for (const cx of [14, 134]) { g.fillStyle = 'rgba(40,30,30,0.5)'; g.fillRect(cx, 90 + r * 21, 106, 7); } }), 1, 1, false);
  S.sheets = []; for (let i = 0; i < 9; i++) { const m = W.add(new THREE.PlaneGeometry(0.75, 1.05), new THREE.MeshBasicMaterial({ map: blank, side: THREE.DoubleSide }), 0, 2, 0, P, { cast: true }); m.userData.ndSkip = true; S.sheets.push(m); }
  for (let k = 0; k < 4; k++) { const sh = W.add(new THREE.PlaneGeometry(0.75, 1.05), new THREE.MeshBasicMaterial({ map: blank }), -1.6 + k * 0.05, 1.12 + k * 0.004, 1.2, P, { cast: false }); sh.rotation.x = -Math.PI / 2; sh.rotation.z = 0.1 * k; sh.userData.ndSkip = true; }
  W.add(new THREE.BoxGeometry(2, 1.0, 1.4), W.toon({ color: '#5a3e28' }), -1.6, 0.5, 1.2, P);
  // hanging lamp, type cases on the wall
  for (let k = 0; k < 3; k++) W.add(new THREE.BoxGeometry(1.4, 0.9, 0.4), W.mtex(W.plankCanvas('#5a3a24', 9 + k, 6), 1, 1), -4 + k * 1.6, 2.2, -4.7, P);
  return S;
};
export const update = (S, Wd, f) => { const t = f / 30; S.wheel.rotation.z = t * 1.5; S.bunting.forEach((b, i) => { b.position.y = 6.4 + Math.sin(t * 2 + i) * 0.05; b.rotation.x = Math.sin(t * 2.4 + i) * 0.1; });
  S.wait.ims.forEach((m) => (m.visible = !!Wd.wait)); S.vic.ims.forEach((m) => (m.visible = !!Wd.vic)); S.bunting.forEach((b) => (b.visible = !!Wd.vic));
  if (Wd.wait) S.wait.update(f, 0.02, 0.1); if (Wd.vic) S.vic.update(f, 0.06, 0.5, Wd.jump || 0);
  // press: platen thumps, flywheel turns, sheets shoot out toward the camera
  const pt = Wd.pressT ?? -1; S.platen.position.y = 1.9 - Math.max(0, Math.sin(f * 0.8)) * 0.6; S.fly.rotation.x = f * 0.25; S.roll.rotation.y = f * 0.4;
  S.sheets.forEach((m, i) => { const ph = ((f * 0.05 + i / S.sheets.length) % 1); const on = pt >= 0; m.visible = on && ph > 0.05;
    m.position.set(0.2 + ph * 3.2 + Math.sin(i * 2.1) * 0.6, 2.0 + Math.sin(ph * Math.PI) * 1.6 - ph * 0.4, 0.3 + ph * 4.5 + Math.cos(i) * 0.4); m.rotation.set(-0.6 + ph * 1.2 + i * 0.3, Math.sin(ph * 6 + i) * 0.8, ph * 2 + i); });
};
