// M1: small old kitchen at night. Light: open fridge (cold) + sodium street lamp through the window (warm).
import { paint, hash, clamp } from '../fx3d.js';
export const KIT = {
  woman: [0, 0, -0.98], table: [0, 0.78, -0.5], pack: [0.02, 0.815, -0.6], fridge: [-1.05, 0, -0.55], window: [1.05, 1.5, -1.86],
};
export function build(ctx, fx, G, L) {
  const { THREE, add, tbox, toon, P } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const tm = (c, rx = 1, ry = 1, color = '#ffffff') => toon({ map: P.tex(c, rx, ry), color });
  const M = {
    paper: tm(cv(512, 512, (g, w, h) => paint.wallpaper(g, w, h, '#cbb98a', '#b4505e', '#5e7e46')), 2.2, 1.3),
    paperS: tm(cv(512, 512, (g, w, h) => paint.wallpaper(g, w, h, '#cbb98a', '#b4505e', '#5e7e46')), 1.6, 1.3),
    floor: tm(cv(512, 512, (g, w, h) => paint.tiles(g, w, h, '#a8a294', '#5f7068', 8)), 3, 3),
    cloth: tm(cv(256, 256, (g, w, h) => { g.fillStyle = '#f4efe6'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(200,40,50,.55)'; for (let i = 0; i < 8; i++) { g.fillRect(i * 32, 0, 16, h); g.fillRect(0, i * 32, w, 16); } }), 3, 2),
    cab: toon({ color: '#9fb8a4' }), cabD: toon({ color: '#7a957f' }), top: tm(cv(256, 256, (g, w, h) => paint.wood(g, w, h, [32, 30, 66], 3)), 2, 1),
    wood: tm(cv(256, 256, (g, w, h) => paint.wood(g, w, h, [26, 44, 34], 5)), 1, 1), chrome: toon({ color: '#c8ccd2' }), dark: toon({ color: '#2a2a30' }),
    fridge: toon({ color: '#ece6d6' }), fIn: toon({ color: '#f4fbff', emissive: '#bfe0ff', emissiveIntensity: 0.55 }), glass: toon({ color: '#cfe8f0', transparent: true, opacity: 0.55 }),
    red: toon({ color: '#c8403a' }), yellow: toon({ color: '#e8c050' }), green: toon({ color: '#5a9a4a' }), white: toon({ color: '#f8f6f0' }), brown: toon({ color: '#7a4a2a' }),
    curtain: tm(cv(256, 256, (g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(190,80,90,.5)'; for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 * 16; x < w; x += 32) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); } for (let x = 0; x < w; x += 24) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, 0, 10, h); } }), 1, 1),
    meat: tm(cv(512, 512, (g, w, h) => { g.fillStyle = '#a8343e'; g.fillRect(0, 0, w, h); g.lineCap = 'round';
      for (let i = 0; i < 1500; i++) { const x = hash(i, 1) * w, y = hash(i, 2) * h, a = hash(i, 3) * 6.28, l = 6 + hash(i, 4) * 10; g.strokeStyle = ['#c8505a', '#8a2632', '#d86a72', '#b03c48', '#e8a0a0'][i % 5]; g.lineWidth = 4 + hash(i, 5) * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 1) * l, y + Math.sin(a + 1) * l, x + Math.cos(a) * l * 1.6, y + Math.sin(a) * l * 1.6); g.stroke(); }
      for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(235,246,255,${0.25 + hash(i, 6) * 0.45})`; g.beginPath(); g.ellipse(hash(i, 7) * w, hash(i, 8) * h, 1.5 + hash(i, 9) * 3, 1 + hash(i, 10) * 2, 0, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(220,236,255,.18)'; g.fillRect(0, 0, w, h); }), 1, 1),
    tray: toon({ color: '#e4ecf0' }), steel: toon({ color: '#d8e2ea', emissive: '#6a7a8a', emissiveIntensity: 0.25 }),
  };
  // room shell
  add(tbox(4.6, 0.1, 4.6, 2), M.floor, 0, -0.05, 0.1, G, { cast: false });
  { const wx = KIT.window[0], x0 = wx - 0.5, x1 = wx + 0.5; // back wall with the window hole
    add(tbox(x0 + 2.3, 2.7, 0.1, 2), M.paper, (-2.3 + x0) / 2, 1.35, -1.92, G, { cast: false });
    add(tbox(2.3 - x1, 2.7, 0.1, 2), M.paper, (x1 + 2.3) / 2, 1.35, -1.92, G, { cast: false });
    add(tbox(1.0, 1.0, 0.1, 2), M.paper, wx, 0.5, -1.92, G, { cast: false }); add(tbox(1.0, 0.7, 0.1, 2), M.paper, wx, 2.35, -1.92, G, { cast: false }); }
  add(tbox(0.1, 2.7, 4.6, 2), M.paperS, -2.3, 1.35, 0.1, G, { cast: false });
  add(tbox(0.1, 2.7, 4.6, 2), M.paperS, 2.3, 1.35, 0.1, G, { cast: false });
  add(tbox(4.6, 0.1, 4.6, 2), toon({ color: '#e8e0cc' }), 0, 2.72, 0.1, G, { cast: false });
  for (const z of [-1.86]) add(tbox(4.6, 0.14, 0.04, 1), M.wood, 0, 0.07, z, G); // skirting
  // window (opening) + frame + sill + night view behind
  const W = KIT.window; const wx = W[0];
  for (const [w, h, x, y] of [[1.0, 0.08, wx, 1.97], [1.0, 0.08, wx, 1.03], [0.08, 1.0, wx - 0.46, 1.5], [0.08, 1.0, wx + 0.46, 1.5], [0.05, 0.92, wx, 1.5], [0.92, 0.05, wx, 1.6]]) add(tbox(w, h, 0.1, 1), M.white, x, y, -1.86, G);
  add(tbox(1.2, 0.06, 0.26, 1), M.white, wx, 1.0, -1.76, G);
  const outside = fx.sign(G, [wx, 1.7, -3.2], 4.5, 3.4, 512, 400, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1230'); gr.addColorStop(0.7, '#1c2a52'); gr.addColorStop(1, '#2a2a3a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#0c0f1c'; g.beginPath(); g.moveTo(0, 300); g.lineTo(90, 230); g.lineTo(180, 300); g.lineTo(260, 300); g.lineTo(330, 210); g.lineTo(420, 300); g.lineTo(512, 260); g.lineTo(512, 400); g.lineTo(0, 400); g.fill();
    g.fillStyle = '#e8a040'; for (const [x, y] of [[60, 290], [120, 280], [360, 270], [380, 300]]) g.fillRect(x, y, 14, 18);
    g.fillStyle = '#1a1a22'; g.fillRect(250, 120, 8, 280); }, { fog: false });
  outside.renderOrder = -1;
  // curtains
  const curt = [];
  for (const sd of [-1, 1]) { const geo = new THREE.PlaneGeometry(0.42, 1.25, 6, 8); const m = add(geo, toon({ map: M.curtain.map, side: THREE.DoubleSide }), wx + sd * 0.48, 1.42, -1.78, G); m.userData.base = geo.attributes.position.array.slice(); curt.push(m); }
  add(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 6), M.chrome, wx, 2.08, -1.78, G).rotation.z = Math.PI / 2;
  // plant on the sill
  add(new THREE.CylinderGeometry(0.07, 0.05, 0.12, 10), M.red, wx + 0.3, 1.09, -1.74, G);
  for (let k = 0; k < 5; k++) { const l = add(new THREE.SphereGeometry(0.06, 8, 6), M.green, wx + 0.3 + Math.cos(k * 1.3) * 0.06, 1.2 + k * 0.03, -1.74 + Math.sin(k * 1.3) * 0.05, G); l.scale.set(1, 1.6, 0.6); }
  // counter along the back wall (left part) + upper cabinets + shelf of jars
  add(tbox(2.0, 0.86, 0.6, 1), M.cab, -0.9, 0.43, -1.6, G); add(tbox(2.08, 0.05, 0.64, 1), M.top, -0.9, 0.885, -1.58, G);
  for (let i = 0; i < 4; i++) { add(tbox(0.44, 0.7, 0.02, 1), M.cabD, -1.65 + i * 0.5, 0.42, -1.29, G); add(tbox(0.1, 0.02, 0.03, 1), M.chrome, -1.65 + i * 0.5, 0.68, -1.27, G); }
  add(tbox(1.6, 0.6, 0.34, 1), M.cab, -1.1, 2.15, -1.72, G);
  for (let i = 0; i < 3; i++) add(tbox(0.5, 0.54, 0.02, 1), M.cabD, -1.6 + i * 0.52, 2.15, -1.54, G);
  add(tbox(0.9, 0.03, 0.22, 1), M.wood, 0.0, 1.62, -1.8, G);
  [['#c84a3a', 0.13], ['#e8c050', 0.1], ['#5a8ac8', 0.12], ['#f0eadc', 0.14], ['#8a5a3a', 0.09]].forEach(([c, h], i) => { add(new THREE.CylinderGeometry(0.05, 0.05, h, 12), toon({ color: c }), -0.35 + i * 0.17, 1.635 + h / 2, -1.79, G); add(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 12), M.dark, -0.35 + i * 0.17, 1.635 + h + 0.012, -1.79, G); });
  // radio + butcher paper roll + tape on the counter
  add(tbox(0.3, 0.17, 0.14, 1), M.brown, -0.35, 0.995, -1.66, G); add(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 14), M.yellow, -0.42, 0.99, -1.585, G).rotation.x = Math.PI / 2;
  const roll = add(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 14), toon({ color: '#e8b8b0' }), -1.2, 0.98, -1.6, G); roll.rotation.z = Math.PI / 2;
  // wall clock (no digits) with moving hands
  const clock = new THREE.Group(); clock.position.set(-0.55, 2.0, -1.86); G.add(clock);
  add(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 24), M.white, 0, 0, 0.02, clock).rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(0.16, 0.018, 8, 24), M.red, 0, 0, 0.04, clock);
  for (let k = 0; k < 12; k++) add(tbox(0.012, 0.03, 0.01, 1), M.dark, Math.sin(k / 12 * 6.283) * 0.13, Math.cos(k / 12 * 6.283) * 0.13, 0.045, clock).rotation.z = -k / 12 * 6.283;
  const hand1 = new THREE.Group(), hand2 = new THREE.Group(); hand1.position.z = hand2.position.z = 0.05; clock.add(hand1); clock.add(hand2);
  add(tbox(0.012, 0.11, 0.008, 1), M.dark, 0, 0.05, 0, hand1); add(tbox(0.006, 0.13, 0.008, 1), M.red, 0, 0.06, 0, hand2);
  // hanging ceiling lamp (off), sways
  const lamp = new THREE.Group(); lamp.position.set(0.75, 2.7, -1.2); G.add(lamp);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.7, 4), M.dark, 0, -0.35, 0, lamp);
  add(new THREE.ConeGeometry(0.24, 0.2, 18, 1, true), toon({ color: '#8a6a48', side: THREE.DoubleSide }), 0, -0.78, 0, lamp);
  add(new THREE.SphereGeometry(0.05, 10, 8), toon({ color: '#f8f2e0' }), 0, -0.84, 0, lamp);
  // kitchen table with gingham oilcloth
  const T = KIT.table;
  add(tbox(1.15, 0.04, 0.78, 1), M.cloth, T[0], T[1] - 0.02, T[2], G);
  for (const sx of [-0.5, 0.5]) for (const sz of [-0.32, 0.32]) add(tbox(0.05, 0.76, 0.05, 1), M.wood, T[0] + sx, 0.38, T[2] + sz, G);
  add(new THREE.PlaneGeometry(1.15, 0.12), M.cloth, T[0], T[1] - 0.08, T[2] + 0.395, G, { cast: false });
  // butcher paper on the table + tape roll + (tools laid out for shot 6)
  const bp = add(new THREE.PlaneGeometry(0.62, 0.48), toon({ color: '#f2d8cc', side: THREE.DoubleSide }), T[0] + 0.05, T[1] + 0.003, T[2] + 0.04, G, { cast: false }); bp.rotation.x = -Math.PI / 2; bp.rotation.z = 0.12;
  const tape = add(new THREE.TorusGeometry(0.045, 0.018, 8, 18), toon({ color: '#d8c890' }), T[0] + 0.42, T[1] + 0.02, T[2] - 0.1, G); tape.rotation.x = -Math.PI / 2;
  const tools = new THREE.Group(); tools.position.set(T[0] - 0.36, T[1] + 0.006, T[2] + 0.08); G.add(tools);
  const towel = add(new THREE.PlaneGeometry(0.3, 0.36), toon({ color: '#5a7ab8', side: THREE.DoubleSide }), 0, 0, 0, tools, { cast: false }); towel.rotation.x = -Math.PI / 2; towel.rotation.z = -0.1;
  // ---- hero props: mince pack + tools (3D) ----
  const pack = new THREE.Group(); pack.position.set(...KIT.pack); G.add(pack); S.pack = pack;
  add(tbox(0.31, 0.035, 0.21, 1), M.tray, 0, 0.0175, 0, pack);
  const mince = add(new THREE.BoxGeometry(0.285, 0.05, 0.185, 4, 1, 4), M.meat, 0, 0.055, 0, pack);
  { const p = mince.geometry.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setY(i, p.getY(i) + 0.012 * (1 - Math.abs(p.getX(i)) / 0.15) * (1 - Math.abs(p.getZ(i)) / 0.1)); mince.geometry.computeVertexNormals(); }
  const label = fx.sign(pack, [0.0, 0.101, 0.02], 0.2, 0.1, 640, 320, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.fill(); g.lineWidth = 12; g.strokeStyle = '#c8202c'; g.beginPath(); g.roundRect(14, 14, w - 28, h - 28, 20); g.stroke();
    g.fillStyle = '#c8202c'; g.fillRect(14, 14, w - 28, 46); g.font = 'bold 92px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1a1416'; g.fillText('Hackfleisch', w / 2 + 22, h / 2 + 26);
    g.strokeStyle = '#3a7ad8'; g.lineWidth = 7; for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; g.beginPath(); g.moveTo(52 - Math.cos(a) * 22, 250 - Math.sin(a) * 22); g.lineTo(52 + Math.cos(a) * 22, 250 + Math.sin(a) * 22); g.stroke(); }
  }, { rx: -Math.PI / 2, fog: false });
  label.rotation.z = 0.0; S.label = label;
  const film = fx.quad(pack, [-0.05, 0.097, -0.03], 0.18, 0.1, '#ffffff', 0.14, { rx: -Math.PI / 2, tex: 'pool', rz: 0.6 });
  // tools: saw blade, chisel, drill bit (each slides into the mince)
  const blade = new THREE.Group(); pack.add(blade); S.blade = blade;
  const bt = ctx.canvasTex(512, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f8fcff'); gr.addColorStop(0.5, '#b8c4d0'); gr.addColorStop(1, '#7a8696'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#3a4250'; for (let x = 0; x < w; x += 18) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 9, h - 26); g.lineTo(x + 18, h); g.fill(); } g.fillStyle = '#20242c'; g.beginPath(); g.arc(30, 30, 9, 0, 7); g.arc(w - 30, 30, 9, 0, 7); g.fill(); });
  add(new THREE.BoxGeometry(0.34, 0.034, 0.003), toon({ map: bt, emissive: '#a0b0c0', emissiveIntensity: 0.5 }), 0, 0, 0, blade);
  add(new THREE.BoxGeometry(0.05, 0.05, 0.02), toon({ color: '#c83a30' }), 0.19, 0, 0, blade);
  S.bladeGlint = fx.glow(blade, [0.05, 0.01, 0.004], '#ffffff', 0.11, 1);
  const chisel = new THREE.Group(); pack.add(chisel); S.chisel = chisel;
  add(new THREE.BoxGeometry(0.16, 0.022, 0.008), M.steel, 0, 0, 0, chisel); add(new THREE.CylinderGeometry(0.016, 0.018, 0.12, 12), toon({ color: '#d0a040' }), -0.14, 0, 0, chisel).rotation.z = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.019, 0.019, 0.015, 12), M.dark, -0.2, 0, 0, chisel).rotation.z = Math.PI / 2;
  const drill = new THREE.Group(); pack.add(drill); S.drill = drill;
  const dgeo = new THREE.CylinderGeometry(0.007, 0.007, 0.2, 10, 20); { const p = dgeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), a = y * 90; const x = p.getX(i), z = p.getZ(i); p.setX(i, x * Math.cos(a) - z * Math.sin(a) * 1.3); p.setZ(i, x * Math.sin(a) + z * Math.cos(a)); } dgeo.computeVertexNormals(); }
  const spin = new THREE.Group(); drill.add(spin); S.drillSpin = spin;
  const dm = add(dgeo, toon({ color: '#c8d0d8', emissive: '#506070', emissiveIntensity: 0.3 }), 0, 0, 0, spin); dm.rotation.z = Math.PI / 2;
  add(new THREE.ConeGeometry(0.008, 0.02, 10), M.steel, -0.11, 0, 0, spin).rotation.z = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 12), toon({ color: '#2a2a30' }), 0.13, 0, 0, spin).rotation.z = Math.PI / 2;
  // tools lying on the towel for shot 6 (copies)
  const tb2 = add(new THREE.BoxGeometry(0.32, 0.003, 0.024), toon({ map: bt, emissive: '#8090a0', emissiveIntensity: 0.3 }), 0.02, 0.006, -0.08, tools);
  const tb3 = add(new THREE.BoxGeometry(0.32, 0.003, 0.024), toon({ map: bt, emissive: '#8090a0', emissiveIntensity: 0.3 }), 0.0, 0.01, -0.04, tools); tb3.rotation.y = 0.12;
  const ch2 = add(new THREE.BoxGeometry(0.16, 0.008, 0.022), M.steel, -0.02, 0.008, 0.04, tools); add(new THREE.CylinderGeometry(0.016, 0.018, 0.12, 12), toon({ color: '#d0a040' }), -0.15, 0.02, 0.04, tools).rotation.z = Math.PI / 2;
  const dr2 = add(dgeo.clone(), toon({ color: '#c8d0d8' }), 0.02, 0.012, 0.11, tools); dr2.rotation.z = Math.PI / 2;
  S.tools = tools;
  // extra frozen packs stacked (wrapped in butcher paper) for shot 6
  const stack = new THREE.Group(); stack.position.set(T[0] + 0.34, T[1], T[2] + 0.12); G.add(stack); S.stack = stack;
  for (let k = 0; k < 2; k++) { const b = add(tbox(0.25, 0.07, 0.18, 1), toon({ color: '#e8cbb8' }), 0, 0.035 + k * 0.072, 0, stack); b.rotation.y = k * 0.2; add(tbox(0.26, 0.072, 0.03, 1), toon({ color: '#d8d0a8' }), 0, 0.035 + k * 0.072, 0, stack).rotation.y = k * 0.2; }
  // near foreground: a jar of pickles + sugar tin at the table front (blurred)
  add(new THREE.CylinderGeometry(0.055, 0.055, 0.16, 16), toon({ color: '#9ab860', transparent: true, opacity: 0.85 }), T[0] - 0.45, T[1] + 0.08, T[2] + 0.3, G);
  add(new THREE.CylinderGeometry(0.058, 0.058, 0.03, 16), M.red, T[0] - 0.45, T[1] + 0.175, T[2] + 0.3, G);
  // ---- the fridge (open, glowing) ----
  const F = new THREE.Group(); F.position.set(...KIT.fridge); F.rotation.y = Math.PI / 2; G.add(F);
  const fw = 0.76, fh = 1.72, fd = 0.68;
  add(tbox(fw, fh, 0.04, 1), M.fridge, 0, fh / 2, -fd / 2, F);
  for (const sx of [-1, 1]) add(tbox(0.04, fh, fd, 1), M.fridge, sx * (fw / 2 - 0.02), fh / 2, 0, F);
  add(tbox(fw, 0.08, fd, 1), M.fridge, 0, fh - 0.04, 0, F); add(tbox(fw, 0.1, fd, 1), M.fridge, 0, 0.05, 0, F);
  add(tbox(fw - 0.08, fh - 0.2, 0.01, 1), M.fIn, 0, fh / 2, -fd / 2 + 0.03, F, { cast: false });
  for (const y of [0.45, 0.85, 1.25]) add(tbox(fw - 0.08, 0.012, fd - 0.08, 1), M.glass, 0, y, 0.02, F, { cast: false });
  add(tbox(fw - 0.08, 0.3, fd - 0.1, 1), toon({ color: '#d8eef4', transparent: true, opacity: 0.6 }), 0, 0.27, 0.0, F, { cast: false });
  const items = [[-0.22, 0.45, '#e8e0d0', 'jar'], [-0.05, 0.45, '#d84a3a', 'can'], [0.15, 0.45, '#f4f0e8', 'milk'], [-0.2, 0.85, '#f2c84a', 'cheese'], [0.05, 0.85, '#7ab0d8', 'bottle'], [0.22, 0.85, '#c84a6a', 'jar'], [-0.15, 1.25, '#e8e8e0', 'eggs'], [0.15, 1.25, '#8ac85a', 'jar']];
  for (const [x, y, c, k] of items) { const m = toon({ color: c });
    if (k === 'bottle') { add(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 10), m, x, y + 0.11, 0.05, F); add(new THREE.CylinderGeometry(0.012, 0.03, 0.08, 10), m, x, y + 0.26, 0.05, F); }
    else if (k === 'milk') add(tbox(0.09, 0.22, 0.07, 1), m, x, y + 0.11, 0.05, F);
    else if (k === 'cheese') { const c_ = add(new THREE.CylinderGeometry(0.08, 0.08, 0.07, 3), m, x, y + 0.035, 0.05, F); c_.rotation.y = 0.4; }
    else if (k === 'eggs') for (let e = 0; e < 4; e++) add(new THREE.SphereGeometry(0.028, 8, 6), m, x - 0.05 + e * 0.035, y + 0.03, 0.05 + (e % 2) * 0.03, F);
    else add(new THREE.CylinderGeometry(0.045, 0.045, k === 'can' ? 0.1 : 0.13, 12), m, x, y + 0.06, 0.05, F); }
  const door = new THREE.Group(); door.position.set(-fw / 2, 0, fd / 2); door.rotation.y = -1.95; F.add(door);
  add(tbox(fw, fh, 0.06, 1), M.fridge, fw / 2, fh / 2, 0.0, door);
  add(tbox(fw - 0.1, fh - 0.2, 0.01, 1), toon({ color: '#eef6f8', emissive: '#9cc8e8', emissiveIntensity: 0.5 }), fw / 2, fh / 2, -0.035, door, { cast: false });
  for (const y of [0.4, 0.8, 1.2]) { add(tbox(fw - 0.12, 0.08, 0.08, 1), toon({ color: '#dfeef2', transparent: true, opacity: 0.7 }), fw / 2, y, -0.08, door); for (let b = 0; b < 4; b++) add(new THREE.CylinderGeometry(0.028, 0.028, 0.18, 10), toon({ color: ['#3a8a4a', '#e8d8b0', '#c84a3a', '#f4f0e8'][b] }), 0.14 + b * 0.16, y + 0.12, -0.08, door); }
  add(tbox(0.03, 0.4, 0.04, 1), M.chrome, fw - 0.06, 1.0, 0.05, door);
  S.door = door;
  // fridge light: glow, floor pool, point light
  S.fGlow = fx.glow(F, [0, 1.1, 0.25], '#cfe8ff', 2.2, 0.7);
  S.fPool = fx.quad(G, [KIT.fridge[0] + 1.1, 0.005, KIT.fridge[2] + 0.1], 2.2, 2.0, '#9fd0ff', 0.3, { rx: -Math.PI / 2 });
  // window light: warm projected pane pattern on the table/back of the woman + glow of the street lamp
  S.lampGlow = fx.glow(G, [wx + 0.6, 2.4, -3.0], '#ffb050', 2.6, 0.9);
  const paneTex = ctx.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; for (const [x, y] of [[20, 20], [136, 20], [20, 136], [136, 136]]) g.fillRect(x, y, 100, 100); });
  S.pane = fx.quad(G, [0.55, 0.006, -1.0], 1.2, 1.2, '#ffa040', 0.35, { rx: -Math.PI / 2, map: paneTex, rz: 0.5 });
  // moving air: fridge mist + dust motes + moth at the window
  S.mist = fx.puffs(G, 14, '#e6f4ff', { fog: false });
  S.dust = fx.points(G, 90, { size: 0.012, color: '#dff2ff' });
  S.moth = fx.points(G, 1, { size: 0.05, color: '#ffe6b0' });
  S.frost = fx.points(pack, 40, { size: 0.008, color: '#f0faff' });
  S.parts = { curt, hand1, hand2, lamp, outside };
  return {
    lights: (Lp, f) => { // configure the shared point lights
      const flick = 0.92 + 0.08 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
      Lp[0].position.set(G.position.x + KIT.fridge[0] + 0.45, 1.15, G.position.z + KIT.fridge[2] + 0.05); Lp[0].color.set('#cfe6ff'); Lp[0].intensity = 1.6; Lp[0].distance = 5; Lp[0].decay = 2;
      Lp[1].position.set(G.position.x + wx + 0.3, 2.3, G.position.z - 2.6); Lp[1].color.set('#ff9a40'); Lp[1].intensity = 3.6 * flick; Lp[1].distance = 7; Lp[1].decay = 2;
      Lp[2].intensity = 0; Lp[3].intensity = 0;
    },
    update: (W, f) => {
      const t = f / 30;
      // curtains breathe in the draft
      for (const [k, m] of curt.entries()) { const p = m.geometry.attributes.position, b = m.userData.base; for (let i = 0; i < p.count; i++) { const y = b[i * 3 + 1]; p.setZ(i, Math.sin(t * 2.2 + y * 3 + k) * 0.025 * (0.6 - y)); } p.needsUpdate = true; }
      hand2.rotation.z = -t * 6.283 / 6; hand1.rotation.z = -1.3 - t * 0.02;
      lamp.rotation.z = Math.sin(t * 1.7) * 0.03; lamp.rotation.x = Math.sin(t * 1.3 + 1) * 0.02;
      S.lampGlow.material.opacity = 0.8 + 0.1 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
      const fx0 = KIT.fridge;
      S.mist.run(f, (i, f) => { const life = 70, ph = ((f + i * 11) % life) / life, sd = hash(i, 1); return [fx0[0] + 0.4 + ph * (0.5 + sd * 0.7), 0.1 + (1 - ph) * 0.35 + sd * 0.15, fx0[2] - 0.2 + (sd - 0.5) * 0.6 + ph * 0.3, 0.35 + ph * 0.7, 0.3 * Math.sin(ph * Math.PI)]; });
      S.dust.run(f, (i, f) => { const sd = hash(i, 3); return [fx0[0] + 0.4 + hash(i, 1) * 1.4 + Math.sin(f * 0.02 + i) * 0.05, 0.3 + ((hash(i, 2) * 1.8 + f * 0.002 * (0.5 + sd)) % 1.8), fx0[2] - 0.7 + hash(i, 4) * 1.6, 0.5 + 0.5 * Math.sin(f * 0.08 + i * 3)]; });
      S.moth.run(f, () => [wx + 0.25 + Math.sin(t * 7.3) * 0.12 + Math.sin(t * 13) * 0.04, 1.75 + Math.sin(t * 5.1) * 0.1, -2.05, 1]);
      S.frost.run(f, (i, f) => { const ph = ((f * 0.7 + i * 7) % 40) / 40; return [(hash(i, 1) - 0.5) * 0.26, 0.09 + ph * 0.08, (hash(i, 2) - 0.5) * 0.18, Math.sin(ph * Math.PI) * 0.8]; });
      // hero props per shot
      const k = W.kit || {};
      S.door.rotation.y = -1.95 + (k.doorSwing || 0);
      S.blade.visible = !!k.blade; S.chisel.visible = !!k.chisel; S.drill.visible = !!k.drill;
      // tool slides along +x into the mince from the right side (ins 0 = outside, 1 = deep inside)
      if (k.blade) { const s = k.blade; if (k.dir === 'z') { S.blade.position.set(0.02, 0.055, 0.34 - s * 0.2); S.blade.rotation.set(0, -Math.PI / 2 + 0.08, 0.06); } else { S.blade.position.set(0.33 - s * 0.2, 0.055, 0.0 + (k.bz || 0)); S.blade.rotation.set(0, k.bry || 0.15, k.brz || -0.05); }
        S.bladeGlint.position.x = -0.12 + ((f * 0.025) % 0.3); S.bladeGlint.material.opacity = 0.5 + 0.5 * Math.sin(f * 0.6); }
      if (k.chisel) { const s = k.chisel; S.chisel.position.set(-0.02, 0.06, 0.27 - s * 0.15); S.chisel.rotation.set(0, Math.PI / 2 - 0.15, -0.12); }
      if (k.drill) { const s = k.drill; S.drill.position.set(0.03, 0.065, 0.24 - s * 0.14); S.drill.rotation.set(0, Math.PI / 2 + 0.1, 0.08); S.drillSpin.rotation.x = f * 0.9; }
      S.tools.visible = !!k.tools; S.stack.visible = !!k.stack;
      S.pack.rotation.set(k.packRx || 0, k.packRy || 0, 0); S.pack.position.set(KIT.pack[0], KIT.pack[1] + (k.packUp || 0), KIT.pack[2]);
    },
  };
}
const S = {};
