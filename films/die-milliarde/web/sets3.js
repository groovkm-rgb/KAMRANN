// sets3.js: von Hahn's white office in the glass tower, bus 47 interior, children's hospital, museum, dark void (phone hook, bank desk).
import { K, bx, cyl, sph, grp, pl, floor, sign, txt, rr, beam, glow, rngf, instBoxes, skyline, dynSign, makePhone } from './common.js';
import { TX, tmat, rtex } from './sets1.js';
import { goldToilet } from './sets2.js';

// ---------------------------------------------------------------- OFFICE (white, cold, top of the glass tower)
export function buildOffice(root) {
  const G = grp(root), S = {};
  floor(18, 14, tmat(128, 128, (g) => { g.fillStyle = '#f6f7f9'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#e4e8ee'; g.lineWidth = 2; g.strokeRect(0, 0, 128, 128); }, 6, 5), 0, 0, 0, G);
  bx(18, 0.2, 14, '#ffffff', 0, 4.2, 0, G, { cast: false });
  bx(0.2, 4.2, 14, '#f4f6f8', -9, 0, 0, G); bx(18, 4.2, 0.2, '#f4f6f8', 0, 0, 7, G);
  // glass wall at the back (z = -7) and right (x = 9)
  for (let i = 0; i < 10; i++) bx(0.08, 4.2, 0.08, '#c8d0dc', -9 + i * 2, 0, -7, G, { cast: false });
  for (let i = 0; i < 8; i++) bx(0.08, 4.2, 0.08, '#c8d0dc', 9, 0, -7 + i * 2, G, { cast: false });
  bx(18, 4.2, 0.02, K.C('#e8f4ff', { transparent: true, opacity: 0.12 }), 0, 0, -7, G, { cast: false });
  // giant white desk
  const dk = grp(G, 0, 0, -2.5); S.desk = dk; bx(5.2, 0.12, 1.8, '#ffffff', 0, 0.82, 0, dk); bx(5.0, 0.82, 0.12, '#eef0f4', 0, 0, -0.8, dk); bx(0.12, 0.82, 1.7, '#eef0f4', -2.5, 0, 0, dk); bx(0.12, 0.82, 1.7, '#eef0f4', 2.5, 0, 0, dk);
  bx(0.9, 0.55, 0.05, '#e8ecf2', 1.4, 0.94, -0.6, dk); bx(0.86, 0.5, 0.01, K.E('#cfe2ff', 0.4), 1.4, 0.96, -0.57, dk, { cast: false }); bx(0.1, 0.12, 0.1, '#e8ecf2', 1.4, 0.82, -0.6, dk);
  S.drawing = grp(dk, -0.2, 0.946, 0.3); sign(0.42, 0.3, 420, 300, drawDanke, 0, 0, 0, S.drawing, { rx: -Math.PI / 2 });
  S.folder = grp(dk, -1.3, 0.955, 0.2); S.folderL = grp(S.folder); S.folderR = grp(S.folder);
  bx(0.22, 0.03, 0.32, '#c8b890', -0.11, 0, 0, S.folderL); bx(0.22, 0.03, 0.32, '#c8b890', 0.11, 0, 0, S.folderR); bx(0.2, 0.035, 0.28, '#f8f6f0', -0.11, 0, 0, S.folderL); bx(0.2, 0.035, 0.28, '#f8f6f0', 0.11, 0, 0, S.folderR);
  // throne-like chair
  const ch = grp(G, 0, 0, -3.9); S.chair = ch; bx(0.9, 0.12, 0.8, '#ffffff', 0, 0.5, 0, ch); bx(0.9, 1.4, 0.15, '#ffffff', 0, 0.55, -0.35, ch); cyl(0.05, 0.05, 0.5, '#c8ccd4', 0, 0, 0, ch);
  // framed yacht photos (three) on the left wall + blueprint of number four
  for (let i = 0; i < 3; i++) sign(1.4, 1.0, 420, 300, (g, W, H) => { g.fillStyle = '#e8ecf0'; g.fillRect(0, 0, W, H); const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#8ac8f0'); gr.addColorStop(0.62, '#d8f0ff'); gr.addColorStop(0.63, '#2a6ab0'); gr.addColorStop(1, '#1a4a8a'); g.fillStyle = gr; g.fillRect(16, 16, W - 32, H - 32);
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(60, 190); g.lineTo(360, 190); g.lineTo(320, 225); g.lineTo(90, 225); g.fill(); g.fillRect(140 + i * 10, 150, 150 - i * 20, 40); g.fillRect(180, 120, 70, 30); g.fillStyle = '#2a3a5a'; for (let k = 0; k < 4; k++) g.fillRect(150 + i * 10 + k * 34, 160, 22, 14); g.lineWidth = 8; g.strokeStyle = '#c8ccd4'; g.strokeRect(4, 4, W - 8, H - 8); }, -8.88, 2.2, -4 + i * 1.8, G, { ry: Math.PI / 2, tone: true });
  S.blueprint = sign(1.6, 1.1, 480, 330, (g, W, H) => { g.fillStyle = '#1a4a9a'; g.fillRect(0, 0, W, H); g.strokeStyle = '#cfe6ff'; g.lineWidth = 3; for (let x = 0; x < W; x += 30) { g.globalAlpha = 0.2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.globalAlpha = 1; g.lineWidth = 5; g.beginPath(); g.moveTo(40, 220); g.lineTo(440, 220); g.lineTo(390, 270); g.lineTo(80, 270); g.closePath(); g.stroke(); g.strokeRect(150, 170, 200, 50); g.strokeRect(200, 130, 100, 40); txt(g, 'Nr. 4', W / 2, 60, 46, '#cfe6ff'); }, 4.0, 1.6, -6.8, G);
  bx(0.06, 1.4, 0.06, '#c8ccd4', 4.0, 0, -6.75, G);
  // plant + sculpture for depth
  cyl(0.35, 0.3, 0.7, '#ffffff', -7.5, 0, -6, G); sph(0.7, '#3a7a4a', -7.5, 1.4, -6, G, { sc: [1, 1.5, 1] });
  sph(0.4, '#c8ccd4', 6.5, 1.2, -5.8, G); cyl(0.2, 0.2, 0.8, '#ffffff', 6.5, 0, -5.8, G);
  S.sky = skyline(G, 41, { r0: 60, r1: 320, n: 120, minH: 20, maxH: 110 }); S.sky.position.y = -120;
  S.coldLight = beam(6, 6, '220,235,255', 0.18, 0, 3, -5, G, { rx: -0.4 });
  return { G, S };
}
export function updateOffice(A, W, t) { const S = A.S, o = W.office || {}; S.drawing.visible = !!o.drawing; S.chair.visible = !o.noChair; const k = o.tear || 0; S.folder.visible = o.folder !== false; S.folderL.position.set(-k * 0.25, k * 0.08, 0); S.folderL.rotation.z = k * 0.6; S.folderR.position.set(k * 0.25, k * 0.12, 0); S.folderR.rotation.z = -k * 0.7; }
export function drawDanke(g, W, H) {
  g.fillStyle = '#fffdf4'; g.fillRect(0, 0, W, H); g.strokeStyle = '#e8e0c8'; g.lineWidth = 2; for (let y = 30; y < H; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // crayon man with tie
  g.lineCap = 'round'; g.lineWidth = 7; g.strokeStyle = '#2a3a8a'; g.beginPath(); g.arc(110, 95, 36, 0, 7); g.stroke(); g.fillStyle = '#2a3a8a'; g.beginPath(); g.arc(98, 90, 4, 0, 7); g.arc(122, 90, 4, 0, 7); g.fill();
  g.beginPath(); g.arc(110, 102, 14, 0.3, Math.PI - 0.3); g.stroke(); g.strokeStyle = '#8a8a9a'; g.beginPath(); g.moveTo(80, 70); g.lineTo(110, 52); g.lineTo(140, 70); g.stroke();
  g.strokeStyle = '#1a2a6a'; g.beginPath(); g.moveTo(110, 131); g.lineTo(110, 215); g.moveTo(110, 150); g.lineTo(70, 185); g.moveTo(110, 150); g.lineTo(150, 185); g.moveTo(110, 215); g.lineTo(85, 265); g.moveTo(110, 215); g.lineTo(135, 265); g.stroke();
  g.fillStyle = '#d8303a'; g.beginPath(); g.moveTo(104, 134); g.lineTo(116, 134); g.lineTo(120, 180); g.lineTo(110, 192); g.lineTo(100, 180); g.closePath(); g.fill();
  // big heart
  g.fillStyle = '#e8304a'; g.beginPath(); g.moveTo(290, 120); g.bezierCurveTo(290, 60, 380, 60, 380, 120); g.bezierCurveTo(380, 170, 300, 200, 290, 230); g.bezierCurveTo(280, 200, 200, 170, 200, 120); g.bezierCurveTo(200, 60, 290, 60, 290, 120); g.fill();
  // "Danke" in crayon
  g.save(); g.translate(290, 268); g.rotate(-0.05); txt(g, 'Danke', 0, 0, 58, '#3a8a3a', { fam: '"DejaVu Sans", sans-serif' }); g.restore();
  g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(W - 40, 40, 24, 0, 7); g.fill();
}

// ---------------------------------------------------------------- BUS interior
export function buildBus(root) {
  const G = grp(root), S = {};
  floor(12, 2.5, tmat(64, 64, (g) => { g.fillStyle = '#5a5a64'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#4a4a54'; for (let i = 0; i < 64; i += 8) g.fillRect(i, 0, 3, 64); }, 12, 3), 0, 0, 0, G);
  bx(12, 0.1, 2.6, '#e8e4dc', 0, 2.4, 0, G, { cast: false });
  // walls: window band
  for (const z of [-1.3, 1.3]) { bx(12, 0.9, 0.08, '#f2c230', 0, 0, z, G); bx(12, 0.4, 0.08, '#f2c230', 0, 2.0, z, G, { cast: false }); for (let i = 0; i < 7; i++) bx(0.12, 1.1, 0.1, '#e8e4dc', -6 + i * 2, 0.9, z, G, { cast: false }); }
  // moving city outside (scrolling painted strips)
  const stripT = rtex(1024, 256, (g, W, H) => { const r = rngf(55); g.fillStyle = '#bfe0f8'; g.fillRect(0, 0, W, H); for (let i = 0; i < 26; i++) { const x = i * 40 + r() * 20, w = 30 + r() * 50, h = 80 + r() * 160; g.fillStyle = ['#e8c8a0', '#c8d8b8', '#e8b0a0', '#b8c8e0', '#f0e0a8'][i % 5]; g.fillRect(x, H - h, w, h); g.fillStyle = '#4a5a7a'; for (let y = H - h + 12; y < H - 20; y += 26) for (let xx = x + 6; xx < x + w - 10; xx += 16) g.fillRect(xx, y, 8, 12); } g.fillStyle = '#5aa040'; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(i * 90 + 40, H - 50, 34, 0, 7); g.fill(); } }, 2, 1);
  S.strip = [-1, 1].map((s) => { const m = new K.THREE.Mesh(new K.THREE.PlaneGeometry(40, 3.2), new K.THREE.MeshBasicMaterial({ map: s < 0 ? stripT : stripT.clone(), fog: false })); m.position.set(0, 1.4, s * 3.0); m.rotation.y = s < 0 ? 0 : Math.PI; m.userData.ndSkip = true; G.add(m); return m; });
  S.strip[1].material.map.wrapS = K.THREE.RepeatWrapping; S.strip[1].material.map.repeat.set(2, 1);
  // seats
  for (let i = 0; i < 4; i++) for (const z of [-0.85, 0.85]) { const s = grp(G, -4.5 + i * 2.2, 0, z); bx(0.9, 0.45, 0.8, '#2a4a8a', 0, 0, 0, s); bx(0.9, 0.08, 0.8, tmat(32, 32, (g) => { g.fillStyle = '#3a6ac8'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#e03a5a'; g.fillRect(4, 4, 6, 6); g.fillStyle = '#ffd23a'; g.fillRect(18, 18, 6, 6); }, 3, 3), 0, 0.45, 0, s); bx(0.12, 0.7, 0.8, '#2a4a8a', -0.42, 0.5, 0, s); }
  // poles + grab bar
  S.poles = []; for (let i = 0; i < 5; i++) { S.poles.push(cyl(0.025, 0.025, 2.4, '#f2c230', -5 + i * 2.5, 0, 0.35, G, { cast: false })); }
  cyl(0.02, 0.02, 12, '#c8ccd4', 0, 2.15, 0.35, G, { rz: Math.PI / 2, cast: false });
  // stop request buttons + display
  for (let i = 0; i < 5; i++) sph(0.03, K.E('#e03a3a', 0.8), -5 + i * 2.5, 1.4, 0.35, G);
  sign(1.2, 0.3, 480, 120, (g, W, H) => { g.fillStyle = '#16161a'; g.fillRect(0, 0, W, H); txt(g, '47  Kiezplatz', W / 2, H / 2 + 4, 56, '#ffb020'); }, 0, 2.15, -1.2, G);
  S.lights = glow(3, '255,250,230', 0, 2.3, 0, G, 0.3);
  return { G, S };
}
export function updateBus(A, W, t) { const S = A.S, b = W.bus || {}; const v = b.speed ?? 0.06; S.strip.forEach((m, i) => { m.material.map.offset.x = (t * v * (i ? -1 : 1)) % 1; }); const sway = Math.sin(t * 1.7) * 0.01; A.G.rotation.z = sway * (b.sway ?? 1); }

// ---------------------------------------------------------------- HOSPITAL (children's ward)
export function buildHosp(root) {
  const G = grp(root), S = {};
  floor(14, 10, tmat(128, 128, (g) => { g.fillStyle = '#d8eef0'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#c0e0e4'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64); }, 7, 5), 0, 0, 0, G);
  const mural = tmat(512, 256, (g, W, H) => { g.fillStyle = '#fff4e0'; g.fillRect(0, 0, W, H); g.fillStyle = '#8ad06a'; g.beginPath(); g.ellipse(120, H, 200, 90, 0, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(420, H, 220, 70, 0, Math.PI, 0); g.fill(); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(400, 60, 36, 0, 7); g.fill(); g.strokeStyle = '#ffd23a'; g.lineWidth = 6; for (let k = 0; k < 10; k++) { const a = k * 0.628; g.beginPath(); g.moveTo(400 + 44 * Math.cos(a), 60 + 44 * Math.sin(a)); g.lineTo(400 + 60 * Math.cos(a), 60 + 60 * Math.sin(a)); g.stroke(); } g.fillStyle = '#ffffff'; g.beginPath(); g.arc(150, 60, 24, 0, 7); g.arc(175, 55, 30, 0, 7); g.arc(205, 62, 22, 0, 7); g.fill();
    g.fillStyle = '#f2a0c0'; g.beginPath(); g.ellipse(250, 190, 40, 26, 0, 0, 7); g.fill(); g.beginPath(); g.arc(285, 172, 18, 0, 7); g.fill(); }, 2, 1);
  bx(14, 3.2, 0.15, mural, 0, 0, -5, G); bx(0.15, 3.2, 10, '#f4f8fa', -7, 0, 0, G); bx(0.15, 3.2, 10, '#f4f8fa', 7, 0, 0, G); bx(14, 0.1, 10, '#ffffff', 0, 3.2, 0, G, { cast: false });
  sign(3.6, 0.6, 900, 150, (g, W, H) => { rr(g, 0, 0, W, H, 40, '#ffb84a'); txt(g, 'Station Sonnenschein', W / 2, H / 2 + 4, 76, '#ffffff', { stroke: '#c86a1a', sw: 8 }); }, 0, 2.75, -4.9, G);
  // beds with colourful blankets
  for (let i = 0; i < 3; i++) { const b = grp(G, -4.5 + i * 3.6, 0, -3.6); bx(1.1, 0.5, 2.0, '#e8ecf0', 0, 0, 0, b); bx(1.05, 0.12, 1.3, ['#ff8a9a', '#8ad0ff', '#ffd27a'][i], 0, 0.5, 0.3, b); bx(0.7, 0.12, 0.35, '#ffffff', 0, 0.55, -0.75, b); bx(1.15, 0.8, 0.06, '#c8d8e8', 0, 0.2, -1.02, b); sph(0.18, ['#e0384a', '#3ab0ff', '#6ad04a'][i], 0.6, 1.7, -0.8, b); cyl(0.004, 0.004, 1.0, '#ffffff', 0.6, 0.7, -0.8, b); }
  // toys, nurse station, windows with sun
  for (let i = 0; i < 6; i++) bx(0.25, 0.25, 0.25, ['#e0384a', '#ffd23a', '#3ab0ff', '#6ad04a'][i % 4], -5.5 + i * 0.3, 0, 3.6 - (i % 2) * 0.3, G);
  bx(2.4, 1.1, 0.8, '#ffb84a', 4.8, 0, 2.2, G); bx(2.5, 0.06, 0.9, '#ffffff', 4.8, 1.1, 2.2, G);
  S.beam = beam(2.2, 5, '255,240,200', 0.3, -6, 2, -1, G, { ry: Math.PI / 2, rz: 0.6 });
  bx(0.06, 1.6, 2.0, K.E('#fff6d8', 0.8), -6.92, 1.0, -1, G, { cast: false });
  // IV stand (girl walks with it)
  S.iv = grp(G, 0, 0, 0); cyl(0.02, 0.02, 1.9, '#c8ccd4', 0, 0, 0, S.iv); for (let k = 0; k < 4; k++) { const l = bx(0.4, 0.03, 0.03, '#c8ccd4', 0.15 * Math.cos(k * 1.57), 0.03, 0.15 * Math.sin(k * 1.57), S.iv); l.rotation.y = k * 1.57; }
  bx(0.14, 0.2, 0.05, K.C('#dff4ff', { transparent: true, opacity: 0.8 }), 0.08, 1.7, 0, S.iv); cyl(0.004, 0.004, 0.9, '#e8f4ff', 0.08, 0.8, 0, S.iv);
  S.lights = [glow(1.4, '255,252,240', -3, 3.1, 0, G, 0.35), glow(1.4, '255,252,240', 3, 3.1, 0, G, 0.35)];
  return { G, S };
}
export function updateHosp(A, W) { const h = W.hosp || {}; A.S.iv.visible = !!h.iv; if (h.iv) A.S.iv.position.set(h.iv[0], 0, h.iv[1]); }

// ---------------------------------------------------------------- MUSEUM
export function buildMuseum(root) {
  const G = grp(root), S = {};
  floor(20, 14, tmat(128, 128, (g) => { g.fillStyle = '#b89a78'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#a8886a'; for (let i = 0; i < 128; i += 16) g.fillRect(i, 0, 3, 128); }, 8, 6), 0, 0, 0, G);
  bx(20, 6, 0.2, '#8a2a3a', 0, 0, -7, G); bx(0.2, 6, 14, '#8a2a3a', -10, 0, 0, G); bx(0.2, 6, 14, '#8a2a3a', 10, 0, 0, G);
  for (let i = 0; i < 4; i++) { sign(2.2, 1.6, 330, 240, (g, W, H) => { g.fillStyle = '#c8a040'; g.fillRect(0, 0, W, H); g.fillStyle = ['#3a5a8a', '#8a5a3a', '#4a7a4a', '#7a3a6a'][i]; g.fillRect(20, 20, W - 40, H - 40); g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.arc(W / 2, H / 2, 50, 0, 7); g.fill(); }, -7.5 + i * 5, 3.0, -6.88, G, { tone: true }); S['pg' + i] = glow(1.6, '255,230,180', -7.5 + i * 5, 4.4, -6.5, G, 0.3); }
  const ped = grp(G, 0, 0, -2); bx(1.6, 1.0, 1.6, '#f4f2ee', 0, 0, 0, ped); bx(1.8, 0.08, 1.8, '#e8e4dc', 0, 1.0, 0, ped);
  S.toilet = goldToilet(ped); S.toilet.position.y = 1.08; S.toilet.rotation.y = 0.5;
  S.spot = beam(2.4, 6, '255,240,200', 0.45, 0, 3.6, -2, G); S.spotG = glow(1.6, '255,220,120', 0, 1.6, -1.8, G, 0.5);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; cyl(0.04, 0.06, 0.9, '#f2c540', Math.cos(a) * 1.8, 0, -2 + Math.sin(a) * 1.8, G); }
  for (let i = 0; i < 6; i++) { const a0 = i / 6 * Math.PI * 2, a1 = (i + 1) / 6 * Math.PI * 2; const x0 = Math.cos(a0) * 1.8, z0 = Math.sin(a0) * 1.8, x1 = Math.cos(a1) * 1.8, z1 = Math.sin(a1) * 1.8; const m = cyl(0.03, 0.03, Math.hypot(x1 - x0, z1 - z0), '#b8202a', (x0 + x1) / 2, 0.8, -2 + (z0 + z1) / 2, G, { rz: Math.PI / 2 }); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); m.position.y = 0.82; }
  return { G, S };
}

// ---------------------------------------------------------------- VOID (dark space: hook phone, bank desk, hands insert backdrop)
export function buildVoid(root) {
  const G = grp(root), S = {};
  floor(40, 40, K.C('#0c0c14'), 0, 0, 0, G);
  S.phone = makePhone(G, 0.3); S.phone.group.position.set(0, 1.5, 0); S.phone.halo.visible = true;
  S.dust = []; sign(14, 8, 1024, 600, (g, W, H) => { const gr = g.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.6); gr.addColorStop(0, '#1c2a4a'); gr.addColorStop(1, '#04050a'); g.fillStyle = gr; g.fillRect(0, 0, W, H); const r = rngf(8); for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H, rad = 6 + r() * 26; const b = g.createRadialGradient(x, y, 0, x, y, rad); const c = ['255,210,140', '140,180,255', '255,150,190'][i % 3]; b.addColorStop(0, `rgba(${c},${0.25 + r() * 0.3})`); b.addColorStop(1, `rgba(${c},0)`); g.fillStyle = b; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); } }, 0, 1.5, -4, G, { nd: false });
  // bank employee desk (typo) at x = 20
  const bd = grp(G, 20, 0, 0); S.bank = bd; bx(2.2, 0.06, 1.0, '#8a8a94', 0, 0.75, 0, bd); bx(0.9, 0.55, 0.05, '#2a2a30', 0, 0.85, -0.3, bd);
  S.bankScreen = dynSign(0.86, 0.5, 860, 500, 0, 1.12, -0.27, bd); bx(0.6, 0.03, 0.2, '#3a3a44', 0, 0.78, 0.1, bd); S.bankGlow = glow(1.0, '150,190,255', 0, 1.1, 0, bd, 0.4);
  for (let i = 0; i < 12; i++) bx(0.035, 0.015, 0.035, '#c8ccd4', -0.24 + (i % 6) * 0.05, 0.81, 0.06 + Math.floor(i / 6) * 0.05, bd, { cast: false });
  return { G, S };
}
export function updateVoid(A, W, t) {
  const S = A.S, v = W.void || {};
  S.phone.group.visible = !!v.phone; if (v.phone) { S.phone.setState(v.phone); if (v.phonePos) S.phone.group.position.set(...v.phonePos); if (v.phoneRot) S.phone.group.rotation.set(...v.phoneRot); }
  
  S.bank.visible = !!v.bank; if (v.bank) S.bankScreen.draw('b' + v.bank, (g, W_, H) => { g.fillStyle = '#f4f6fa'; g.fillRect(0, 0, W_, H); g.fillStyle = '#2a5ad0'; g.fillRect(0, 0, W_, 60); txt(g, 'Überweisung', 24, 32, 30, '#fff', { al: 'left' });
    txt(g, 'Empfänger:', 30, 120, 28, '#5a5a6a', { al: 'left', w: 'normal' }); txt(g, 'Werft', 220, 120, 30, '#1a1a2a', { al: 'left' });
    txt(g, 'Kontonummer:', 30, 200, 28, '#5a5a6a', { al: 'left', w: 'normal' }); const good = '4711 0815 2208', bad = '4711 0815 2209'; const s = v.bank >= 2 ? bad : good;
    g.font = 'bold 44px "DejaVu Sans Mono", monospace'; g.textAlign = 'left'; let x = 30; for (let i = 0; i < s.length; i++) { const hi = v.bank >= 2 && i === s.length - 1; g.fillStyle = hi ? '#e0383a' : '#1a1a2a'; if (hi && v.bank >= 3) { g.fillStyle = '#ffd23a'; g.fillRect(x - 4, 236, 34, 56); g.fillStyle = '#e0383a'; } g.fillText(s[i], x, 270); x += 28; }
    txt(g, 'Betrag:', 30, 360, 28, '#5a5a6a', { al: 'left', w: 'normal' }); txt(g, '1.000.000.000,00 €', 180, 360, 34, '#1a1a2a', { al: 'left' });
    rr(g, W_ - 260, H - 100, 230, 70, 14, '#2ab070'); txt(g, 'Senden', W_ - 145, H - 64, 32, '#fff'); });
}
