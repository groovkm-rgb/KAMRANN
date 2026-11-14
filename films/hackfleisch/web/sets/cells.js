// M4 / M7: three barred cells side by side (A Charmeur, B Stille, C later the woman), corridor in front,
// steel back wall, maintenance passage behind it with pipes and the giant steam pipe (cut hole + note).
import { paint, hash, clamp } from '../fx3d.js';
import * as CS from '../castspec.js';
export const CEL = { A: -2.5, B: 0, C: 2.5, back: -3.0, pass: -3.75, pipe: [0, 0.55, -3.98] };
const S = {};
export function build(ctx, fx, G) {
  const { THREE, add, tbox, toon, P, T } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const tm = (c, rx = 1, ry = 1, color = '#ffffff') => toon({ map: P.tex(c, rx, ry), color });
  const wallTex = cv(512, 512, (g, w, h) => { paint.concrete(g, w, h, '#c4c8bc', 11); g.fillStyle = '#56735e'; g.fillRect(0, h * 0.55, w, h * 0.45); g.fillStyle = '#3e5646'; g.fillRect(0, h * 0.55, w, 10); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(30,40,30,${0.05 + hash(i, 1) * 0.1})`; g.beginPath(); g.ellipse(hash(i, 2) * w, h * 0.55 + hash(i, 3) * h * 0.45, 8 + hash(i, 4) * 30, 4 + hash(i, 5) * 10, 0, 0, 7); g.fill(); } });
  const M = {
    wall: tm(wallTex, 1, 1), wallW: tm(wallTex, 2, 1),
    floor: tm(cv(512, 512, (g, w, h) => paint.concrete(g, w, h, '#6a6e6c', 12)), 3, 3),
    steel: tm(cv(512, 512, (g, w, h) => paint.metal(g, w, h, '#7a8288', 13)), 2, 1.5),
    bar: toon({ color: '#3c434c' }), barL: toon({ color: '#58606a' }), ceil: toon({ color: '#9aa098' }),
    bunk: toon({ color: '#4a5a6a' }), matt: toon({ color: '#b8b4a0' }), blanket: tm(cv(256, 256, (g, w, h) => { g.fillStyle = '#6a6e8a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(40,40,70,.4)'; for (let y = 0; y < h; y += 28) g.fillRect(0, y, w, 8); }), 2, 2),
    pillow: toon({ color: '#e8e6dc' }), sink: toon({ color: '#c8d0d4' }), pipe: tm(cv(256, 256, (g, w, h) => paint.metal(g, w, h, '#8a7a5a', 14)), 4, 1), pipeG: toon({ color: '#5a6a5e' }), pipeR: toon({ color: '#8a3a30' }),
    tube: toon({ color: '#f4fff8', emissive: '#d8ffe8', emissiveIntensity: 1.2 }), dark: toon({ color: '#22262c' }), wood: toon({ color: '#7a5a3a' }),
  };
  const W = 7.6, D = CEL.back;
  // corridor + cells floor, ceiling, front corridor wall
  add(tbox(W + 2, 0.1, 7.2, 2), M.floor, 0, -0.05, -0.8, G, { cast: false });
  add(tbox(W + 2, 0.1, 7.2, 2), M.ceil, 0, 3.05, -0.8, G, { cast: false });
  add(tbox(W + 2, 3.1, 0.12, 3), M.wallW, 0, 1.55, 2.9, G, { cast: false });
  for (const sx of [-1, 1]) add(tbox(0.12, 3.1, 7.2, 3), M.wall, sx * (W / 2 + 0.8), 1.55, -0.8, G, { cast: false });
  // steel back wall (with holes later) — built as panels so cut holes can be shown
  const backPanels = [];
  for (const cx of [CEL.A, CEL.B, CEL.C]) {
    const pg = new THREE.Group(); pg.position.set(cx, 0, D); G.add(pg); backPanels.push(pg);
    add(tbox(2.5, 3.0, 0.08, 2), M.steel, 0, 1.5, 0, pg);
    for (let k = -1; k <= 1; k++) add(tbox(0.06, 3.0, 0.03, 1), M.dark, k * 0.8, 1.5, 0.05, pg);
  }
  // partitions: A|B bars, B|C concrete
  const barGeo = new THREE.CylinderGeometry(0.017, 0.017, 3.0, 8);
  const barList = [];
  for (let x = -W / 2 + 0.08; x <= W / 2; x += 0.17) barList.push({ p: [x, 1.5, 0] });
  for (let z = -0.08; z > D; z -= 0.19) barList.push({ p: [-1.25, 1.5, z] });
  S.barsFront = fx.inst(G, barGeo, M.bar, barList.filter((b) => b.p[2] === 0 && !(b.p[0] > CEL.C - 1.0 && b.p[0] < CEL.C - 0.15)));
  fx.inst(G, barGeo, M.bar, barList.filter((b) => b.p[2] !== 0));
  for (const y of [0.08, 0.72, 1.95, 2.96]) { add(tbox(W, 0.05, 0.05, 1), M.barL, 0, y, 0, G); add(tbox(0.06, 0.06, -D, 1), M.barL, -1.25, y, D / 2, G); }
  add(tbox(0.16, 3.0, -D, 2), M.wall, 1.25, 1.5, D / 2, G);
  add(tbox(0.16, 3.0, -D, 2), M.wall, -3.75, 1.5, D / 2, G); add(tbox(0.16, 3.0, -D, 2), M.wall, 3.75, 1.5, D / 2, G);
  // sliding door of cell C (moves in the final)
  const doorC = new THREE.Group(); G.add(doorC); S.doorC = doorC;
  const dl = []; for (let x = 0; x < 0.85; x += 0.17) dl.push({ p: [x, 1.5, 0.06] });
  fx.inst(doorC, barGeo, M.bar, dl); for (const y of [0.1, 0.72, 1.95, 2.9]) add(tbox(0.9, 0.06, 0.06, 1), M.barL, 0.42, y, 0.06, doorC);
  add(tbox(0.1, 0.18, 0.08, 1), M.dark, 0.85, 0.82, 0.06, doorC);
  // ---- cell furniture (each cell): bunk, blanket, pillow, sink, shelf, small barred window, drawings ----
  S.blankets = {}; S.windows = {}; S.dolls = {};
  const drawTex = (seed, kind) => ctx.canvasTex(256, 200, (g, w, h) => { g.fillStyle = '#f6f0de'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a4a56'; g.lineWidth = 5; g.lineCap = 'round';
    if (kind === 'dog') { g.beginPath(); g.ellipse(110, 120, 50, 32, 0, 0, 7); g.stroke(); g.beginPath(); g.arc(170, 88, 28, 0, 7); g.stroke(); g.beginPath(); g.moveTo(160, 64); g.lineTo(156, 36); g.lineTo(174, 60); g.moveTo(182, 62); g.lineTo(192, 36); g.lineTo(194, 64); g.stroke(); for (const lx of [80, 100, 125, 140]) { g.beginPath(); g.moveTo(lx, 148); g.lineTo(lx, 176); g.stroke(); } g.beginPath(); g.moveTo(62, 110); g.lineTo(36, 84); g.stroke(); g.fillStyle = '#4a4a56'; g.beginPath(); g.arc(178, 84, 4, 0, 7); g.arc(196, 96, 5, 0, 7); g.fill(); }
    else if (kind === 'sun') { g.beginPath(); g.arc(128, 100, 40, 0, 7); g.stroke(); for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28; g.beginPath(); g.moveTo(128 + Math.cos(a) * 52, 100 + Math.sin(a) * 52); g.lineTo(128 + Math.cos(a) * 74, 100 + Math.sin(a) * 74); g.stroke(); } }
    else { g.beginPath(); g.moveTo(30, 170); g.lineTo(90, 70); g.lineTo(140, 140); g.lineTo(180, 90); g.lineTo(230, 170); g.stroke(); g.beginPath(); g.arc(200, 50, 18, 0, 7); g.stroke(); } });
  for (const [name, cx, side] of [['A', CEL.A, -1], ['B', CEL.B, 1], ['C', CEL.C, -1]]) {
    const bx = cx + side * (name === 'B' ? 0.5 : 0.75);
    add(tbox(0.9, 0.08, 2.0, 1), M.bunk, bx, 0.45, D + 1.15, G); for (const dz of [-0.95, 0.95]) for (const dx of [-0.42, 0.42]) add(tbox(0.06, 0.45, 0.06, 1), M.bunk, bx + dx, 0.225, D + 1.15 + dz, G);
    add(tbox(0.84, 0.14, 1.94, 1), M.matt, bx, 0.56, D + 1.15, G);
    add(tbox(0.6, 0.12, 0.38, 1), M.pillow, bx, 0.68, D + 0.4, G);
    const bl = new THREE.Group(); bl.position.set(bx, 0.64, D + 1.35); G.add(bl); S.blankets[name] = bl;
    const bgeo = new THREE.BoxGeometry(0.92, 0.06, 1.5, 6, 1, 8); { const p = bgeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) + 0.03 * Math.sin(z * 9) * Math.cos(x * 5) + (Math.abs(x) > 0.44 ? -0.08 : 0)); } bgeo.computeVertexNormals(); }
    add(bgeo, M.blanket, 0, 0, 0, bl);
    // sink + toilet on the other side
    const sx = cx - side * 0.8;
    add(tbox(0.42, 0.12, 0.34, 1), M.sink, sx, 0.85, D + 0.25, G); add(tbox(0.12, 0.7, 0.12, 1), M.sink, sx, 0.45, D + 0.2, G);
    add(new THREE.CylinderGeometry(0.2, 0.17, 0.42, 14), M.sink, sx, 0.21, D + 0.9, G);
    add(tbox(0.7, 0.04, 0.24, 1), M.wood, sx, 1.7, D + 0.14, G);
    for (let k = 0; k < 3; k++) add(tbox(0.12, 0.18, 0.14, 1), toon({ color: ['#c8b080', '#7aa0c8', '#d0d0c8'][k] }), sx - 0.22 + k * 0.22, 1.81, D + 0.14, G);
    // drawings on the steel wall
    [['dog', -0.35, 1.55], ['sun', 0.25, 1.75], ['hill', 0.0, 1.25]].forEach(([k, dx, y], i) => { const m = fx.sign(G, [cx + dx * side - side * 0.05, y, D + 0.06], 0.32, 0.25, 256, 200, (g, w, h) => {}, { fog: true, color: '#c8c8c0' }); m.material.map = drawTex(i, k); m.rotation.z = (hash(i + cx, 1) - 0.5) * 0.2; });
    // small high window in the back wall with bars + sky behind
    const wg = new THREE.Group(); wg.position.set(cx, 2.45, D); G.add(wg); S.windows[name] = wg;
    add(tbox(0.7, 0.42, 0.1, 1), M.dark, 0, 0, 0.0, wg);
    const sky = fx.sign(wg, [0, 0, 0.055], 0.62, 0.36, 128, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0c1636'); gr.addColorStop(1, '#22305a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, { fog: false });
    S.windows[name].sky = sky;
    for (let k = -2; k <= 2; k++) add(new THREE.CylinderGeometry(0.014, 0.014, 0.42, 6), M.bar, k * 0.12, 0, 0.09, wg);
  }
  // moon in cell B window (phase redrawn per frame in the sawing shot)
  const moonC = document.createElement('canvas'); moonC.width = moonC.height = 128; const moonT = new THREE.CanvasTexture(moonC); moonT.colorSpace = THREE.SRGBColorSpace;
  S.moonDraw = (ph) => { const g = moonC.getContext('2d'); g.clearRect(0, 0, 128, 128); const r = g.createRadialGradient(64, 64, 20, 64, 64, 64); r.addColorStop(0, 'rgba(255,250,220,.5)'); r.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(64, 64, 26, 0, 7); g.fill(); g.fillStyle = '#18224a'; const off = (ph * 2 - 1) * 56; g.beginPath(); g.arc(64 + off, 64, 27, 0, 7); g.fill(); moonT.needsUpdate = true; };
  S.moonDraw(0.3);
  const moon = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: moonT, transparent: true, fog: false })); moon.position.set(0.12, 0.02, 0.06); moon.userData.ndSkip = true; S.windows.B.add(moon); S.moon = moon;
  // dummy "sleepers" (hoodie + clothes) under the blankets
  for (const name of ['A', 'B']) { const bl = S.blankets[name]; const d = new THREE.Group(); d.position.copy(bl.position); d.position.y = 0.66; G.add(d); S.dolls[name] = d;
    const hood = add(new THREE.SphereGeometry(0.2, 14, 10), toon({ color: '#9aa0ae' }), 0, 0.12, -0.58, d); hood.scale.set(1, 0.9, 1.1);
    const face = add(new THREE.SphereGeometry(0.12, 10, 8), toon({ color: '#1e2026' }), 0, 0.2, -0.5, d); face.scale.set(1, 0.6, 1);
    const body = add(new THREE.CapsuleGeometry(0.17, 0.75, 6, 10), toon({ color: '#6a7f9a' }), 0, 0.06, 0.05, d); body.rotation.x = Math.PI / 2; body.scale.set(1.1, 1, 0.75);
    add(new THREE.CapsuleGeometry(0.07, 0.5, 4, 8), toon({ color: '#8a8a7a' }), 0.13, 0.05, 0.62, d).rotation.x = Math.PI / 2;
    add(new THREE.CapsuleGeometry(0.07, 0.5, 4, 8), toon({ color: '#8a8a7a' }), -0.13, 0.05, 0.62, d).rotation.x = Math.PI / 2;
    add(tbox(0.2, 0.04, 0.12, 1), toon({ color: '#c8c0b0' }), 0.22, 0.12, -0.2, d); }
  // cut holes in the steel wall of A and B (visible after the escape) + saw line during sawing
  S.holes = {}; for (const [name, cx, side] of [['A', CEL.A, -1], ['B', CEL.B, 1]]) { const hx = cx - side * 0.15; const h = new THREE.Group(); h.position.set(hx, 0.42, D + 0.05); G.add(h); S.holes[name] = h;
    add(tbox(0.62, 0.62, 0.02, 1), toon({ color: '#07080a' }), 0, 0, 0, h, { cast: false }); for (const [w_, hh, x, y] of [[0.68, 0.04, 0, 0.31], [0.68, 0.04, 0, -0.31], [0.04, 0.66, 0.32, 0], [0.04, 0.66, -0.32, 0]]) add(tbox(w_, hh, 0.03, 1), toon({ color: '#c8a070' }), x, y, 0.01, h); }
  // corridor: fluorescent tubes + guard desk + extinguisher
  S.tubes = [];
  for (const x of [-3.0, 0.0, 3.0]) { const tg = new THREE.Group(); tg.position.set(x, 2.95, 1.4); G.add(tg); add(tbox(1.25, 0.06, 0.14, 1), M.dark, 0, 0.03, 0, tg); const t_ = add(tbox(1.15, 0.04, 0.06, 1), M.tube, 0, -0.02, 0, tg, { cast: false }); S.tubes.push({ g: tg, m: t_, glow: fx.glow(tg, [0, -0.08, 0], '#e8fff0', 1.4, 0.45) }); }
  // corridor clutter: radiator pipes along the front wall, a mop bucket, a hanging lamp cage
  for (const y of [0.25, 0.4]) add(new THREE.CylinderGeometry(0.035, 0.035, 8.6, 8), M.pipeG, 0, y, 2.78, G).rotation.z = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.16, 0.13, 0.3, 14), toon({ color: '#c8a030' }), -3.2, 0.15, 2.4, G);
  add(tbox(1.0, 0.75, 0.55, 1), M.wood, 4.2, 0.375, 2.3, G); add(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 12), toon({ color: '#c8302a' }), -4.35, 0.6, 2.7, G);
  // ---- maintenance passage behind the back wall ----
  add(tbox(W + 2, 3.1, 0.12, 3), M.wall, 0, 1.55, D - 1.55, G, { cast: false });
  for (const [y, r, m, z] of [[2.6, 0.08, M.pipeG, -3.3], [2.35, 0.06, M.pipeR, -3.25], [2.75, 0.05, M.pipe, -4.35], [1.6, 0.07, M.pipeG, -4.38]]) { const pp = add(new THREE.CylinderGeometry(r, r, W + 2, 12), m, 0, y, z, G); pp.rotation.z = Math.PI / 2; }
  const big = add(new THREE.CylinderGeometry(0.48, 0.48, W + 2, 28, 1, false), M.pipe, CEL.pipe[0], CEL.pipe[1], CEL.pipe[2], G); big.rotation.z = Math.PI / 2;
  for (let x = -4; x <= 4; x += 1.4) { const ring = add(new THREE.TorusGeometry(0.49, 0.035, 8, 28), M.dark, x, CEL.pipe[1], CEL.pipe[2], G); ring.rotation.y = Math.PI / 2; }
  // the sawn hole in the giant pipe (opening faces +z toward the cells) + the note
  const ph = new THREE.Group(); ph.position.set(0.55, CEL.pipe[1] + 0.02, CEL.pipe[2] + 0.47); G.add(ph); S.pipeHole = ph;
  const holeShape = new THREE.Shape(); for (let i = 0; i <= 18; i++) { const a = i / 18 * Math.PI * 2, r = 0.27 + (i % 2 ? 0.025 : -0.015); i ? holeShape.lineTo(Math.cos(a) * r * 1.05, Math.sin(a) * r) : holeShape.moveTo(Math.cos(a) * r * 1.05, Math.sin(a) * r); }
  add(new THREE.ShapeGeometry(holeShape), toon({ color: '#050506' }), 0, 0, 0.012, ph, { cast: false });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.02, 6, 24), toon({ color: '#d8b080' })); rim.scale.set(1.05, 1, 1); rim.position.z = 0.015; ph.add(rim);
  S.note = fx.sign(G, [-0.5, CEL.pipe[1] + 0.16, CEL.pipe[2] + 0.5], 0.32, 0.32, 512, 512, (g, w, h) => {
    g.fillStyle = '#ffe866'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, 0, w, 60); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, h - 40, w, 40);
    g.fillStyle = '#1a2a6a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 68px "DejaVu Sans", sans-serif'; g.fillText('Einen', w / 2, 120); g.fillText('schönen', w / 2, 196); g.fillText('Tag noch!', w / 2, 272);
    g.strokeStyle = '#1a2a6a'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.arc(w / 2, 400, 62, 0, 7); g.stroke(); g.fillStyle = '#1a2a6a'; g.beginPath(); g.arc(w / 2 - 22, 384, 9, 0, 7); g.arc(w / 2 + 22, 384, 9, 0, 7); g.fill(); g.beginPath(); g.arc(w / 2, 404, 34, 0.25, Math.PI - 0.25); g.stroke();
  }, { fog: false, double: true });
  S.note.rotation.x = -0.25; S.note.geometry = new THREE.PlaneGeometry(0.32, 0.32, 6, 6); S.noteBase = S.note.geometry.attributes.position.array.slice();
  // alarm beacons in the passage and the corridor
  S.beacons = [];
  for (const p of [[-1.6, 2.85, -3.4], [2.2, 2.85, -3.4], [0.0, 2.85, 2.7]]) { const bg = new THREE.Group(); bg.position.set(...p); G.add(bg); add(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 14), M.dark, 0, 0.1, 0, bg);
    const dome = add(new THREE.SphereGeometry(0.1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon({ color: '#ff3020', emissive: '#ff2010', emissiveIntensity: 1.2 }), 0, -0.02, 0, bg); dome.rotation.x = Math.PI;
    const rot = new THREE.Group(); bg.add(rot); const b1 = fx.beam(rot, [0, -0.05, 0], 5, 0.04, 1.3, '#ff2a1a', 0.0); const b2 = fx.beam(rot, [0, -0.05, 0], 5, 0.04, 1.3, '#ff2a1a', 0.0);
    S.beacons.push({ bg, rot, b1, b2, glow: fx.glow(bg, [0, -0.05, 0], '#ff3020', 0.8, 0.0) }); }
  // passage lights: a caged bulb
  const bulb = new THREE.Group(); bulb.position.set(-0.8, 2.5, -3.4); G.add(bulb); add(new THREE.SphereGeometry(0.07, 10, 8), toon({ color: '#fff0c0', emissive: '#ffc860', emissiveIntensity: 1.4 }), 0, 0, 0, bulb); S.bulbGlow = fx.glow(bulb, [0, 0, 0], '#ffc070', 1.0, 0.6);
  // particles: corridor dust, steam from the pipe hole, sparks for sawing, morning sunbeam dust
  S.dust = fx.points(G, 120, { size: 0.016, color: '#e8f4e8' });
  S.steam = fx.puffs(G, 16, '#e8eef0', { fog: true });
  S.sparks = fx.streaks(G, 70, '#ff9a30');
  S.sparkPts = fx.points(G, 70, { size: 0.05, tex: 'spark', color: '#ffc060' });
  S.cutGlow = [fx.glow(G, [0, 0, 0], '#ff9a40', 0.9, 0), fx.glow(G, [0, 0, 0], '#ff9a40', 0.7, 0)];
  // sunbeam (morning) through the cell B window
  S.sunbeam = fx.beam(G, [CEL.B, 2.45, D + 0.05], 3.8, 0.25, 0.75, '#ffe8c0', 0.0);
  S.sunPool = fx.quad(G, [CEL.B + 0.5, 0.01, D + 2.2], 1.3, 0.9, '#ffe0b0', 0.0, { rx: -Math.PI / 2 });
  // flashlight sweep (night) pool
  S.flashPool = fx.quad(G, [0, 1.0, D + 0.07], 1.4, 1.1, '#fff4d8', 0.0, {});
  S.flashBeam = fx.beam(G, [1.5, 1.5, 2.2], 6, 0.03, 0.6, '#fff4d8', 0.0);
  // tray with a burger patty (final)
  const tray = new THREE.Group(); G.add(tray); S.tray = tray;
  add(tbox(0.42, 0.025, 0.3, 1), toon({ color: '#a8b0b8' }), 0, 0.0125, 0, tray); add(new THREE.CylinderGeometry(0.11, 0.1, 0.02, 20), toon({ color: '#f4f2ec' }), -0.04, 0.035, 0, tray);
  const patty = add(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 20), toon({ color: '#6a3a24' }), -0.04, 0.06, 0, tray);
  for (let k = 0; k < 7; k++) add(new THREE.SphereGeometry(0.012, 6, 4), toon({ color: '#3a1e12' }), -0.04 + Math.cos(k) * 0.045, 0.075, Math.sin(k * 1.7) * 0.045, tray);
  add(tbox(0.02, 0.006, 0.16, 1), toon({ color: '#d8dce0' }), 0.13, 0.03, 0, tray);
  S.patty = patty; S.trayGlow = fx.glow(tray, [-0.04, 0.12, 0], '#ffe8c0', 0.25, 0.0);
  S.table = add(tbox(0.62, 0.05, 0.44, 1), M.wood, 2.4, 0.62, -1.0, G); add(tbox(0.05, 0.6, 0.05, 1), M.wood, 2.4, 0.3, -1.0, G);
  return {
    lights: (Lp, f, Sp, W) => {
      const c = W.cells || {}; const o = G.position;
      const fl = (k) => 0.9 + 0.1 * Math.sin(f * 1.3 + k) * Math.sin(f * 0.71 + k * 2) - (c.flicker && ((f + k * 7) % 23 < 2) ? 0.6 : 0);
      if (c.mode === 'night') {
        Lp[0].position.set(o.x + 0, o.y + 2.7, o.z + 1.4); Lp[0].color.set('#9fb8ff'); Lp[0].intensity = 0.8; Lp[0].distance = 9; Lp[0].decay = 2;
        Lp[1].position.set(o.x + (c.sparkX ?? 0), o.y + 0.5, o.z + CEL.back + 0.4); Lp[1].color.set('#ff8a30'); Lp[1].intensity = (c.sparkI ?? 0) * (0.7 + 0.3 * hash(Math.floor(f), 3)); Lp[1].distance = 5; Lp[1].decay = 2;
        Lp[2].position.set(o.x + (c.sparkX2 ?? -2.6), o.y + 0.5, o.z + CEL.back + 0.4); Lp[2].color.set('#ff8a30'); Lp[2].intensity = (c.sparkI2 ?? 0) * (0.7 + 0.3 * hash(Math.floor(f), 5)); Lp[2].distance = 4; Lp[2].decay = 2;
        Lp[3].position.set(o.x + (c.goggleX ?? 0), o.y + 0.9, o.z + CEL.back + 0.8); Lp[3].color.set('#80f0ff'); Lp[3].intensity = c.goggleI ?? 0; Lp[3].distance = 3; Lp[3].decay = 2;
        if (c.flash) { Sp[0].position.set(o.x + c.flash.from[0], o.y + c.flash.from[1], o.z + c.flash.from[2]); Sp[0].target.position.set(o.x + c.flash.to[0], o.y + c.flash.to[1], o.z + c.flash.to[2]); Sp[0].color.set('#fff2d0'); Sp[0].intensity = c.flash.i; Sp[0].distance = 12; Sp[0].angle = 0.32; Sp[0].penumbra = 0.6; Sp[0].decay = 1.5; }
      } else if (c.mode === 'alarm') {
        const a = f * 0.22; Lp[0].position.set(o.x - 1.6 + Math.cos(a) * 1.5, o.y + 2.2, o.z - 3.4 + Math.sin(a) * 0.4); Lp[0].color.set('#ff2a1a'); Lp[0].intensity = 3.5 * (0.5 + 0.5 * Math.max(0, Math.sin(a * 2))); Lp[0].distance = 7; Lp[0].decay = 1.6;
        Lp[1].position.set(o.x + 2.2 + Math.cos(a + 2) * 1.5, o.y + 2.2, o.z - 3.4); Lp[1].color.set('#ff2a1a'); Lp[1].intensity = 3.5 * (0.5 + 0.5 * Math.max(0, Math.sin(a * 2 + 2))); Lp[1].distance = 7; Lp[1].decay = 1.6;
        Lp[2].position.set(o.x - 0.8, o.y + 2.4, o.z - 3.4); Lp[2].color.set('#ffc070'); Lp[2].intensity = 1.0; Lp[2].distance = 5; Lp[2].decay = 2;
        Lp[3].position.set(o.x + 0, o.y + 2.6, o.z + 1.4); Lp[3].color.set('#d8ffe8'); Lp[3].intensity = c.corr ?? 0.8; Lp[3].distance = 8; Lp[3].decay = 2;
      } else { // day / fluorescent corridor
        for (let k = 0; k < 3; k++) { Lp[k].position.set(o.x - 3 + k * 3, o.y + 2.8, o.z + 1.4); Lp[k].color.set('#dcffe6'); Lp[k].intensity = 2.6 * fl(k); Lp[k].distance = 7; Lp[k].decay = 2; }
        if (c.morning) { Lp[3].position.set(o.x + (c.morningX ?? 0), o.y + 2.4, o.z + CEL.back + 0.6); Lp[3].color.set('#ffd8a0'); Lp[3].intensity = 2.2; Lp[3].distance = 6; Lp[3].decay = 2; }
        else { Lp[3].position.set(o.x + (c.cellLampX ?? 2.5), o.y + 2.6, o.z - 1.5); Lp[3].color.set('#c8e0ff'); Lp[3].intensity = c.cellLamp ?? 0; Lp[3].distance = 5; Lp[3].decay = 2; }
      }
    },
    update: (W, f) => {
      const c = W.cells || {}, t = f / 30;
      const night = c.mode === 'night', alarm = c.mode === 'alarm';
      S.tubes.forEach((tb, k) => { const on = !night; tb.m.visible = true; tb.m.material.emissiveIntensity = on ? 1.2 * (c.flicker && ((f + k * 7) % 23 < 2) ? 0.2 : 1) : 0.05; tb.glow.material.opacity = on ? 0.45 : 0.0; });
      for (const n of ['A', 'B', 'C']) { S.windows[n].sky.material.color.set(c.morning ? '#ffd8b0' : night ? '#ffffff' : '#9ab0d0'); }
      S.moon.visible = night; if (night && c.moonPh !== undefined) S.moonDraw(c.moonPh);
      // blankets / dolls / holes
      S.dolls.A.visible = S.dolls.B.visible = !!c.dolls;
      const bp = c.blanketPull || 0; S.blankets.B.position.set(CEL.B + 0.5 + bp * 0.2, 0.64 + Math.sin(bp * Math.PI) * 0.6 + bp * 0.35, CEL.back + 1.35 + bp * 0.9); S.blankets.B.rotation.set(-bp * 0.9, 0, -bp * 0.5);
      S.blankets.A.visible = true; S.blankets.B.visible = c.blankets !== false; S.blankets.C.visible = !c.noBlanketC;
      S.holes.A.visible = !!c.holes; S.holes.B.visible = !!c.holes;
      S.doorC.position.set(CEL.C - 1.0 + (c.doorC ?? 0) * 0.85, 0, 0);
      // alarm beacons
      S.beacons.forEach((b, k) => { b.rot.rotation.y = f * 0.22 + k * 2; b.b1.setOp(alarm ? 0.22 : 0); b.b2.setOp(alarm ? 0.22 : 0); b.glow.material.opacity = alarm ? 0.6 + 0.4 * Math.sin(f * 0.44 + k) : 0; b.b1.rotation.set(0, 0, Math.PI / 2 - 0.25); b.b2.rotation.set(0, 0, -Math.PI / 2 + 0.25); });
      // note flutters in the draft
      { const p = S.note.geometry.attributes.position, b = S.noteBase; for (let i = 0; i < p.count; i++) { const y = b[i * 3 + 1], x = b[i * 3]; p.setZ(i, (0.16 - y) * 0.12 * (0.5 + 0.5 * Math.sin(t * 7 + x * 6)) * (c.noteFlutter ?? 0.4)); } p.needsUpdate = true; }
      // steam from the pipe hole
      const pc = CEL.pipe; S.steam.run(f, (i, f) => { if (!c.steam) return null; const life = 60, ph = ((f + i * 9) % life) / life, sd = hash(i, 2); return [0.55 + (sd - 0.5) * 0.3 + ph * 0.4, pc[1] + 0.1 + ph * 1.6, pc[2] + 0.55 + ph * 0.5, 0.3 + ph * 0.9, 0.25 * Math.sin(ph * Math.PI) * (c.steam)]; });
      // dust in the air (beams)
      S.dust.run(f, (i, f) => { const bx = c.dustAt ? c.dustAt[0] : 0, by = c.dustAt ? c.dustAt[1] : 1.6, bz = c.dustAt ? c.dustAt[2] : 0.8; return [bx + (hash(i, 1) - 0.5) * 2.6 + Math.sin(f * 0.02 + i) * 0.06, by + (hash(i, 2) - 0.5) * 2.2 + Math.sin(f * 0.013 + i * 2) * 0.08, bz + (hash(i, 3) - 0.5) * 2.4, (c.dust ?? 0.5) * (0.4 + 0.6 * Math.abs(Math.sin(f * 0.05 + i)))]; });
      // sparks from the saw cut point(s)
      const sp = c.sparks; const cut = (i, f) => { if (!sp) return null; const src = sp.length > 1 && i % 3 === 2 ? sp[1] : sp[0]; if (!src) return null; const life = 9, ph = ((f * 1.0 + i * 3.7) % life) / life; if (src.on === false) return null;
        const a = hash(i, 1) * Math.PI - Math.PI / 2 + (src.dir || 0), sp_ = 1.4 + hash(i, 2) * 1.6, vx = Math.sin(a) * sp_ * 0.6, vy = (0.6 + hash(i, 3)) * sp_ * 0.7, vz = (0.6 + hash(i, 4) * 0.8) * sp_;
        const tt = ph * 0.45; return [src.p[0] + vx * tt, src.p[1] + vy * tt - 4.9 * tt * tt, src.p[2] + vz * tt, vx * 0.05, (vy - 9.8 * tt) * 0.05, vz * 0.05, (1 - ph) * 1.4]; };
      S.sparks.run(f, cut); S.sparkPts.run(f, (i, f) => { const r = cut(i, f); return r ? [r[0], r[1], r[2], r[6]] : null; });
      S.cutGlow.forEach((gl, k) => { const src = sp && sp[k]; gl.material.opacity = src ? 0.7 + 0.3 * hash(Math.floor(f), k + 7) : 0; if (src) gl.position.set(src.p[0], src.p[1], src.p[2] + 0.04); });
      // morning sunbeam
      S.sunbeam.setOp(c.morning ? 0.32 : 0); S.sunbeam.aim(G.position.x + CEL.B + 0.6, G.position.y, G.position.z + CEL.back + 2.4); S.sunPool.material.opacity = c.morning ? 0.35 : 0;
      // flashlight from the corridor
      const fl = c.flash; S.flashPool.material.opacity = fl ? fl.pool : 0; S.flashBeam.setOp(fl ? fl.beam : 0);
      if (fl) { S.flashPool.position.set(fl.to[0], fl.to[1], CEL.back + 0.07); S.flashBeam.position.set(...fl.from); S.flashBeam.aim(G.position.x + fl.to[0], G.position.y + fl.to[1], G.position.z + fl.to[2]); }
      // tray for the final
      S.tray.visible = !!c.tray; if (c.tray) S.tray.position.set(2.4 + (c.tray.x ?? 0), 0.645 + (c.tray.y ?? 0), -1.0 + (c.tray.z ?? 0));
      S.trayGlow.material.opacity = c.tray ? 0.35 : 0;
    },
  };
}
