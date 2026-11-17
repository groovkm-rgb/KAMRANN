// scene.js — "Der menschliche Wecker": five places, all built once, shown one at a time (W.loc).
//   M1 street (x 0)   M2 family bedroom (x 200)   M3 clock shop (x 400)   M4 factory gate (x 600)   M5 waker's room (x 800)
// All writing in the world is German. Ground is y = 0.
export const O2 = [200, 0, 0], O3 = [400, 0, 0], O4 = [600, 0, 0], O5 = [800, 0, 0];
// anchors used by story.js
export const A = {
  target: [-1.1, 4.25, -5.2],        // the upper window the waker shoots at (back row, house 0)
  targetIn: [-1.1, 3.55, -5.75],     // where the father appears behind it
  shoot: [-0.4, 0, -2.6],            // where the waker stands to shoot
  slate: [9.3, 1.25, -5.16],        // chalk board "Bitte um 4 wecken"
  knockWin: [14.9, 4.25, 5.2],       // upper window the pole man taps (front row)
  win13: [-10.3, 4.25, -5.2],        // window of shot 13 (back row)
  oldman: [-12.6, 0.14, 4.5],           // old waker on his chair (front row doorstep)
  wakerWin: [10.3, 4.25, 5.2],
  pile: [-1.0, 0.14, -4.85],        // the waker's own window (front row), curtains shut
};
let S = {};
const DAYS = { night: 0, dawn: 1, day: 2 };

export const build = (ctx) => {
  const { THREE, P, scene, world, add, tbox, toon, texM, canvasTex } = ctx;
  const rng = P.rng(7);
  const L = (o) => toon(o);
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const T_ = (c, rx = 1, ry = 1) => P.tex(c, rx, ry);
  const basic = (opts) => new THREE.MeshBasicMaterial(opts);
  const skip = (m) => { m.userData.ndSkip = true; m.castShadow = false; return m; };
  S.bill = []; S.anim = [];
  const G = (x = 0, y = 0, z = 0, parent = world) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const LOC = S.loc = { 1: G(), 2: G(...O2), 3: G(...O3), 4: G(...O4), 5: G(...O5) };

  // ---------------- textures ----------------
  const brick = (seed, h0 = 8, s0 = 52, l0 = 38) => cv(512, 512, (g) => {
    const r = P.rng(seed); g.fillStyle = '#6a5a52'; g.fillRect(0, 0, 512, 512);
    const bw = 64, bh = 26;
    for (let row = 0; row < 512 / bh + 1; row++) for (let col = -1; col < 9; col++) {
      const x = col * bw + (row % 2) * bw / 2, y = row * bh, L_ = l0 - 6 + r() * 12;
      g.fillStyle = `hsl(${h0 + r() * 10 - 5},${s0}%,${L_}%)`; g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
      g.fillStyle = `hsla(${h0},${s0}%,${L_ + 10}%,.5)`; g.fillRect(x + 4, y + 3, bw - 10, 3);
      if (r() < 0.25) { g.fillStyle = `hsla(${h0},30%,${L_ - 14}%,.6)`; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); }
    }
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, 'rgba(30,20,30,.25)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,14,20,.3)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  });
  const BR = [T_(brick(3), 1 / 2.4, 1 / 2.4), T_(brick(5, 14, 46, 34), 1 / 2.4, 1 / 2.4), T_(brick(9, 4, 40, 30), 1 / 2.4, 1 / 2.4)];
  const brickM = BR.map((t) => L({ map: t }));
  const cobT = T_(P.stone(21, 230, 10, 44, 46, 38), 1, 1);
  const cobble = L({ map: cobT }); cobT.repeat.set(9, 2.6);
  const flag = L({ map: T_(P.stone(23, 30, 8, 52, 128, 128), 20, 1.2) });
  const slate = L({ map: T_(P.roof(9), 3, 3), color: '#7a7aa0' });
  const wood = (col, rep = 1) => L({ map: T_(P.planks(4), rep, rep), color: col });
  const stoneTrim = L({ color: '#b8ae9c' }), white = L({ color: '#e8e2d4' }), iron = L({ color: '#22202a' }), ironHi = L({ color: '#3a3844' });
  const brass = L({ color: '#e0a83c' }), doorCols = ['#2e4a3a', '#5a2a2e', '#2a3a5a', '#4a3a2a', '#3a2a4a'];
  const glow = (col = '255,190,110', a = 1) => T_(P.radial(col, a));
  const glowTex = glow('255,200,120', 0.95), glowBlue = glow('190,210,255', 0.8), glowWarm = glow('255,150,70', 0.9);
  const billboard = (tex, size, x, y, z, parent, opts = {}) => {
    const m = skip(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), basic({ map: tex, transparent: true, depthWrite: false, blending: opts.add === false ? THREE.NormalBlending : THREE.AdditiveBlending, fog: opts.fog ?? false, opacity: opts.op ?? 1 })));
    m.position.set(x, y, z); m.scale.set(size * (opts.sx || 1), size, 1); m.renderOrder = opts.ro ?? 3; parent.add(m); S.bill.push(m); return m;
  };
  const glassTex = (kind) => cv(128, 192, (g, w, h) => {
    if (kind === 'lit') { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffcf7a'); gr.addColorStop(1, '#ff9a48'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,240,200,.6)'; g.beginPath(); g.ellipse(w / 2, h * 0.6, 30, 40, 0, 0, 7); g.fill();
      g.fillStyle = '#c8564a'; g.beginPath(); g.moveTo(0, 0); g.lineTo(34, 0); g.quadraticCurveTo(20, h * 0.6, 26, h); g.lineTo(0, h); g.fill(); g.beginPath(); g.moveTo(w, 0); g.lineTo(w - 34, 0); g.quadraticCurveTo(w - 20, h * 0.6, w - 26, h); g.lineTo(w, h); g.fill(); }
    else if (kind === 'day') { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#9ac4e8'); gr.addColorStop(1, '#4a6a9a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(20, h); g.lineTo(60, 0); g.lineTo(80, 0); g.lineTo(40, h); g.fill(); }
    else if (kind === 'shut') { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4a868'); gr.addColorStop(1, '#e0704a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let x = 6; x < w; x += 14) { g.strokeStyle = 'rgba(150,50,40,.45)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 4, h / 2, x, h); g.stroke(); } }
    else { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2a3256'); gr.addColorStop(1, '#10142a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(170,190,255,.32)'; g.beginPath(); g.moveTo(14, h); g.lineTo(58, 0); g.lineTo(76, 0); g.lineTo(32, h); g.fill(); g.fillStyle = 'rgba(70,60,90,.9)'; g.fillRect(0, 0, 22, h); g.fillRect(w - 22, 0, 22, h); }
  });
  const GT = { dark: T_(glassTex('dark')), lit: T_(glassTex('lit')), day: T_(glassTex('day')), shut: T_(glassTex('shut')) };
  S.GT_dark = GT.dark; S.GT_lit = GT.lit; S.GT_day = GT.day; S.GT_shut = GT.shut;
  const textSign = (w, h, txt, o = {}) => canvasTex(w, h, (g) => {
    g.fillStyle = o.bg || '#1e2a24'; g.fillRect(0, 0, w, h);
    if (o.border !== false) { g.strokeStyle = o.bd || '#c8a050'; g.lineWidth = o.bw || 16; g.strokeRect(o.bw / 2 || 8, o.bw / 2 || 8, w - (o.bw || 16), h - (o.bw || 16)); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const lines = Array.isArray(txt) ? txt : [txt];
    lines.forEach((t, i) => { g.font = `${o.weight || 'bold'} ${o.size || 120}px ${o.font || 'Georgia, "DejaVu Serif", serif'}`;
      const y = h / 2 + (i - (lines.length - 1) / 2) * (o.lh || (o.size || 120) * 1.15) + 4;
      if (o.stroke) { g.lineWidth = o.sw || 12; g.strokeStyle = o.stroke; g.strokeText(t, w / 2, y); } g.fillStyle = o.fg || '#f2e6c8'; g.fillText(t, w / 2, y); });
  });
  const signMesh = (tex, w, h, x, y, z, parent, ry = 0) => { const m = skip(add(new THREE.PlaneGeometry(w, h), basic({ map: tex, fog: true }), x, y, z, parent, { cast: false })); m.rotation.y = ry; return m; };

  // ---------------- shared builders ----------------
  const windows = S.windows = {};
  /** window with stone lintel/sill, white frame with cross bars, glass (state switched in update) */
  const windowAt = (parent, x, y, z, id, w = 1.0, h = 1.4, opts = {}) => {
    const g = G(x, y, z, parent);
    const fr = new THREE.Shape(); fr.moveTo(-w / 2, -h / 2); fr.lineTo(w / 2, -h / 2); fr.lineTo(w / 2, h / 2); fr.lineTo(-w / 2, h / 2);
    const b = 0.07, m = 0.035;
    for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const hole = new THREE.Path(); const x0 = px < 0 ? -w / 2 + b : m, x1 = px < 0 ? -m : w / 2 - b, y0 = py < 0 ? -h / 2 + b : m, y1 = py < 0 ? -m : h / 2 - b; hole.moveTo(x0, y0); hole.lineTo(x1, y0); hole.lineTo(x1, y1); hole.lineTo(x0, y1); fr.holes.push(hole); }
    add(new THREE.ExtrudeGeometry(fr, { depth: 0.06, bevelEnabled: false }), white, 0, 0, -0.08, g);
    const gm = basic({ map: GT.dark, fog: true });
    const glass = skip(add(new THREE.PlaneGeometry(w - 0.02, h - 0.02), gm, 0, 0, -0.1, g, { cast: false }));
    add(tbox(w + 0.3, 0.12, 0.22, 1), stoneTrim, 0, -h / 2 - 0.06, 0.04, g);
    add(tbox(w + 0.24, 0.2, 0.08, 1), stoneTrim, 0, h / 2 + 0.1, 0.0, g);
    windows[id] = { g, glass, mat: gm, state: 'dark', open: opts.open };
    return windows[id];
  };
  /** terraced brick house; facade faces +z (local). pierce: ids of windows that open into a dark room */
  const houses = [];
  const house = (row, i, x, opts = {}) => {
    const face = row === 'b' ? 1 : -1, g = G(x, 0, -8.2 * face, LOC[1]); g.rotation.y = row === 'b' ? 0 : Math.PI;
    const W = 4.6, D = 6, H = 6.2, mir = (i % 2) ? -1 : 1, bm = brickM[(i * 7 + (row === 'b' ? 0 : 1)) % 3];
    const fs = new THREE.Shape(); fs.moveTo(-W / 2, 0); fs.lineTo(W / 2, 0); fs.lineTo(W / 2, H); fs.lineTo(-W / 2, H);
    const holes = [[-1.2 * mir, 1.1, 1.0, 2.2, 'door'], [1.05 * mir, 1.7, 1.0, 1.4, 'g'], [-1.1, 4.25, 1.0, 1.4, 'u1'], [1.1, 4.25, 1.0, 1.4, 'u2']];
    for (const [hx, hy, hw, hh] of holes) { const p = new THREE.Path(); const y0 = hy - (hh === 2.2 ? 1.1 : hh / 2); p.moveTo(hx - hw / 2, y0); p.lineTo(hx + hw / 2, y0); p.lineTo(hx + hw / 2, y0 + hh); p.lineTo(hx - hw / 2, y0 + hh); fs.holes.push(p); }
    add(new THREE.ExtrudeGeometry(fs, { depth: 0.3, bevelEnabled: false }), bm, 0, 0, 2.7, g);
    const deep = opts.pierce ? 1.2 : 2.62;
    add(tbox(W - 0.02, H, deep + 3, 2.4), bm, 0, H / 2, (deep - 3) / 2, g);
    if (opts.pierce) { // dark room behind the window: wallpaper back wall + side walls
      const wp = L({ color: '#3a3a5a' }); add(tbox(W - 0.1, 2.6, 0.05, 1), wp, 0, 4.2, deep + 0.03, g);
      for (const sx of [-1, 1]) add(tbox(0.05, 2.6, 1.6, 1), wp, sx * (W / 2 - 0.1), 4.2, deep + 0.8, g);
      add(tbox(W - 0.1, 0.05, 1.6, 1), wp, 0, 3.0, deep + 0.8, g); add(tbox(W - 0.1, 0.05, 1.6, 1), wp, 0, 5.5, deep + 0.8, g);
    }
    // door with step and knocker
    const dm = wood(doorCols[(i + (row === 'b' ? 0 : 2)) % doorCols.length], 0.5);
    add(tbox(0.96, 2.16, 0.08, 1), dm, -1.2 * mir, 1.08, 2.78, g);
    for (const yy of [0.5, 1.35]) add(tbox(0.7, 0.55, 0.03, 1), L({ color: doorCols[(i + 1) % 5] }), -1.2 * mir, yy + 0.1, 2.83, g);
    add(new THREE.TorusGeometry(0.06, 0.015, 6, 12), brass, -1.2 * mir, 1.35, 2.86, g);
    add(tbox(1.3, 0.16, 0.5, 1), stoneTrim, -1.2 * mir, 0.08, 3.2, g);
    add(tbox(1.2, 0.18, 0.3, 1), stoneTrim, -1.2 * mir, 2.32, 3.06, g);
    // windows
    const id = `${row}${i}`;
    windowAt(g, 1.05 * mir, 1.7, 2.92, id + 'g');
    windowAt(g, -1.1, 4.25, 2.92, id + 'u1');
    windowAt(g, 1.1, 4.25, 2.92, id + 'u2');
    // roof: two slopes + ridge
    for (const s of [-1, 1]) { const r = add(tbox(W + 0.12, 0.14, 3.4, 1.4), slate, 0, H + 0.85, s * 1.55 + 0.2 * 0, g); r.rotation.x = s * 0.52; }
    add(tbox(W + 0.1, 0.2, 0.2, 1), L({ color: '#3a3448' }), 0, H + 1.7, 0, g);
    add(tbox(W + 0.2, 0.14, 0.18, 1), iron, 0, H - 0.06, 3.0, g); // gutter
    // chimney on the party wall
    const cx = W / 2 * (i % 2 ? -1 : 1);
    add(tbox(0.7, 1.6, 1.0, 1.2), bm, cx, H + 1.9, 0.6, g);
    add(tbox(0.82, 0.14, 1.1, 1), stoneTrim, cx, H + 2.72, 0.6, g);
    const pots = []; for (const pz of [0.35, 0.85]) { add(new THREE.CylinderGeometry(0.09, 0.12, 0.42, 8), L({ color: '#a85a3a' }), cx, H + 2.98, pz, g); pots.push([cx, H + 3.2, pz]); }
    houses.push({ g, row, i, x, pots });
    return g;
  };

  // ======================= M1: the street =======================
  {
    const M1 = LOC[1];
    const st = add(new THREE.PlaneGeometry(130, 8.4), cobble, 0, 0, 0, M1, { cast: false }); st.rotation.x = -Math.PI / 2;
    for (const s of [-1, 1]) {
      const sw = add(tbox(130, 0.14, 1.2, 1.4), flag, 0, 0.07, s * 4.8, M1, { cast: false });
      add(tbox(130, 0.16, 0.14, 1), stoneTrim, 0, 0.08, s * 4.2, M1, { cast: false });
    }
    cobT.repeat.set(36, 2.4);
    for (let i = -7; i <= 7; i++) { const x = i * 4.6; house('b', i + 7, x, { pierce: i === 0 || i === -2 }); house('f', i + 7, x, { pierce: i === 3 || i === 2 }); }
    // far silhouettes (cheap blocks) to extend the street, and the vista walls
    for (const s of [-1, 1]) for (const sx of [-1, 1]) add(tbox(40, 7.5, 6, 2.4), brickM[2], sx * 54, 3.75, s * 8.2, M1);
    add(tbox(10, 9, 20, 2.4), brickM[1], -76, 4.5, 0, M1); add(tbox(10, 9, 20, 2.4), brickM[0], 76, 4.5, 0, M1);
    // gas lamps
    S.lamps = [];
    const lamp = (x, z) => { const g = G(x, 0, z, M1);
      add(new THREE.CylinderGeometry(0.16, 0.22, 0.5, 10), iron, 0, 0.25, 0, g); add(new THREE.CylinderGeometry(0.06, 0.08, 3.6, 8), iron, 0, 2.0, 0, g);
      add(tbox(0.7, 0.05, 0.05, 1), iron, 0, 3.5, 0, g);
      add(new THREE.ConeGeometry(0.34, 0.3, 4), iron, 0, 4.42, 0, g).rotation.y = Math.PI / 4;
      const gl = skip(add(tbox(0.36, 0.5, 0.36, 1), basic({ color: '#ffd890', fog: true }), 0, 4.06, 0, g, { cast: false }));
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(tbox(0.03, 0.52, 0.03, 1), iron, a * 0.18, 4.06, b * 0.18, g);
      add(tbox(0.42, 0.06, 0.42, 1), iron, 0, 3.8, 0, g);
      const bb = billboard(glowTex, 3.2, x, 4.06, z, M1, { fog: false });
      S.lamps.push({ g, gl, bb, x, z }); };
    [[-7.2, -3.95], [8.4, 3.95], [21.5, -3.95], [-21, 3.95], [-34, -3.95], [33, 3.95]].forEach(([x, z]) => lamp(x, z));
    // chalk board by a door (shot 11)
    { const t = canvasTex(512, 384, (g, w, h) => { g.fillStyle = '#7a5232'; g.fillRect(0, 0, w, h); g.fillStyle = '#22302a'; g.fillRect(22, 22, w - 44, h - 44);
        g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 30; i++) g.fillRect(30 + (i * 53) % 440, 30 + (i * 37) % 300, 60, 6);
        g.textAlign = 'center'; g.fillStyle = '#f4f2ea'; g.font = 'bold 84px "DejaVu Sans", Arial, sans-serif'; g.fillText('Bitte', w / 2, 128); g.fillText('um 4', w / 2, 222); g.fillText('wecken', w / 2, 316); });
      const g = G(...A.slate, M1); add(tbox(0.6, 0.46, 0.04, 1), wood('#7a5232'), 0, 0, -0.02, g); signMesh(t, 0.56, 0.42, 0, 0, 0.005, g); S.slate = g; }
    // laundry lines across the street
    S.cloth = [];
    const clothCols = ['#f4f0e6', '#d8e4f0', '#e8b8a8', '#c8d8b0', '#f0e0a8', '#b8c8e8'];
    for (const [lx, ly] of [[-4.5, 5.7], [12.5, 5.9], [-17, 5.8], [27, 5.7]]) {
      const rope = add(new THREE.CylinderGeometry(0.012, 0.012, 10.6, 4), L({ color: '#c8c0a8' }), lx, ly, 0, M1, { cast: false }); rope.rotation.x = Math.PI / 2;
      for (let k = 0; k < 6; k++) { const z = -4 + k * 1.5 + rng() * 0.4, w = 0.5 + rng() * 0.5, h = 0.6 + rng() * 0.7;
        const pv = G(lx, ly, z, M1); const kind = (k + Math.round(lx)) % 3, col = clothCols[(k * 5 + Math.round(lx)) % 6];
        const ct = T_(cv(128, 160, (g) => { g.fillStyle = col; g.strokeStyle = '#1a1416'; g.lineWidth = 5; g.beginPath();
          if (kind === 0) { g.moveTo(10, 10); g.lineTo(118, 10); g.lineTo(124, 60); g.lineTo(100, 66); g.lineTo(98, 150); g.lineTo(30, 150); g.lineTo(28, 66); g.lineTo(4, 60); }
          else if (kind === 1) { g.moveTo(14, 8); g.lineTo(114, 8); g.lineTo(118, 154); g.lineTo(76, 154); g.lineTo(64, 60); g.lineTo(52, 154); g.lineTo(10, 154); }
          else { g.moveTo(6, 8); g.lineTo(122, 8); g.lineTo(120, 150); g.quadraticCurveTo(64, 140, 8, 152); }
          g.closePath(); g.fill(); g.stroke(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 6; for (let y = 30; y < 150; y += 34) { g.beginPath(); g.moveTo(20, y); g.lineTo(108, y + 4); g.stroke(); }
          for (const x of [24, 104]) { g.fillStyle = '#d8c8a0'; g.fillRect(x - 4, 0, 8, 18); } }));
        const cm = L({ map: ct, side: THREE.DoubleSide, alphaTest: 0.5, transparent: false });
        const m = add(new THREE.PlaneGeometry(w, h), cm, 0, -h / 2, 0, pv); m.rotation.y = Math.PI / 2; S.cloth.push({ pv, ph: rng() * 6 }); }
    }
    // chimney smoke puffs
    S.smoke = [];
    const puffTex = T_(cv(128, 128, (g) => { for (let i = 0; i < 5; i++) { const x = 40 + (i * 23) % 50, y = 44 + (i * 31) % 40, r = 30 + (i % 3) * 8; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } }));
    S.puffTex = puffTex;
    houses.forEach((h, hi) => { if (hi % 2) return; const p = h.pots[0], wp = new THREE.Vector3(...p); h.g.localToWorld(wp);
      for (let k = 0; k < 4; k++) { const m = billboard(puffTex, 1, wp.x, wp.y, wp.z, M1, { add: false, fog: true, ro: 1 }); m.material = m.material.clone(); m.material.color.set('#8a88a8'); S.smoke.push({ m, base: wp.clone(), ph: k / 4 + hi * 0.13 }); } });
    // factory skyline beyond the street ends
    const fac = L({ color: '#2a2438' });
    for (const [x, z, h] of [[-110, -30, 46], [-130, 18, 54], [-150, -6, 40], [110, -26, 48], [128, 22, 42], [-95, 40, 36]]) {
      add(new THREE.CylinderGeometry(1.6, 2.4, h, 12), brickM[2], x, h / 2, z, M1, { cast: false }); add(new THREE.CylinderGeometry(1.9, 1.9, 1.2, 12), fac, x, h, z, M1, { cast: false });
      add(tbox(30, 16, 24, 4), fac, x + (x < 0 ? -10 : 10), 8, z - 12, M1, { cast: false });
      for (let k = 0; k < 5; k++) { const m = billboard(puffTex, 8, x, h + 3, z, M1, { add: false, fog: true, ro: 1 }); m.material = m.material.clone(); m.material.color.set('#6a6888'); S.smoke.push({ m, base: new THREE.Vector3(x, h + 1, z), ph: k / 5, big: true }); }
    }
    // ground fog sheets drifting along the street
    S.fog = [];
    const fogTex = T_(cv(256, 128, (g) => { for (let i = 0; i < 9; i++) { const x = 30 + i * 25, y = 64 + Math.sin(i * 2.1) * 20, r = 40 + (i % 3) * 14; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128); } }));
    for (let k = 0; k < 16; k++) { const m = billboard(fogTex, 3.5, -30 + k * 4.2, 0.9, (k % 3 - 1) * 2.6, M1, { add: false, fog: true, op: 0.55, ro: 4, sx: 2.2 }); m.material = m.material.clone(); m.material.color.set('#b8b8e0'); S.fog.push({ m, x0: -34 + k * 4.4, z: (k % 3 - 1) * 2.6, ph: rng() * 6 }); }
    // moon + stars + morning sun disc (world space, far)
    const moonTex = T_(cv(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 40, 128, 128, 128); gr.addColorStop(0, 'rgba(220,230,255,.5)'); gr.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      g.fillStyle = '#f4f0dc'; g.beginPath(); g.arc(128, 128, 54, 0, 7); g.fill(); g.fillStyle = 'rgba(190,180,160,.55)'; for (const [x, y, r] of [[110, 110, 12], [146, 140, 9], [120, 150, 7], [150, 108, 6]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }));
    S.moon = billboard(moonTex, 60, -260, 150, -170, scene, { add: false, fog: false, ro: -1 });
    const sp = []; const sr = P.rng(99); for (let i = 0; i < 700; i++) { const a = sr() * Math.PI * 2, e = 0.1 + sr() * 1.3, d = 900; sp.push(Math.cos(a) * Math.cos(e) * d, Math.sin(e) * d, Math.sin(a) * Math.cos(e) * d); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    S.stars = skip(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#f4f0ff', size: 2.2, sizeAttenuation: false, fog: false, transparent: true }))); S.stars.renderOrder = -2; scene.add(S.stars);
    // the old waker's chair on his doorstep (front row) + his pole
    { const g = G(...A.oldman, M1); const cw = wood('#6a4a2e');
      add(tbox(0.62, 0.08, 0.56, 1), cw, 0, 0.5, 0, g); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(tbox(0.06, 0.5, 0.06, 1), cw, a * 0.26, 0.25, b * 0.24, g);
      add(tbox(0.62, 0.7, 0.06, 1), cw, 0, 0.88, 0.27, g); S.chair = g; }
    // horse trough/barrels/crates as foreground clutter
    const crate = (x, z, s = 0.5) => { add(tbox(s, s, s, 0.5), wood('#8a6a42', 0.5), x, s / 2 + 0.14, z, M1); };
    crate(5.6, -4.7); crate(5.95, -4.75, 0.38); crate(-18.6, 4.7); crate(16.2, -4.7, 0.45);
    for (const [x, z] of [[2.6, -4.7], [-12.4, 4.7], [24, 4.7]]) { add(new THREE.CylinderGeometry(0.3, 0.27, 0.8, 12), wood('#7a5a36', 0.5), x, 0.54, z, M1); add(new THREE.TorusGeometry(0.3, 0.02, 4, 16), iron, x, 0.75, z, M1).rotation.x = Math.PI / 2; }
    S.houses = houses;
    { const pr = P.rng(5), pm = L({ color: '#7cc04a' }), pm2 = L({ color: '#6aa83e' }); for (let k = 0; k < 26; k++) { const a = pr() * 6.28, r = Math.sqrt(pr()) * 0.2; const m = add(new THREE.SphereGeometry(0.045, 10, 8), k % 3 ? pm : pm2, A.pile[0] + Math.cos(a) * r, A.pile[1] + 0.045 + (r < 0.08 ? 0.06 : 0) + (r < 0.04 ? 0.05 : 0), A.pile[2] + Math.sin(a) * r * 0.6, M1); m.castShadow = false; } }
  }

  // ======================= 3D props used in several shots =======================
  // the pea (green sphere), pipe for POV, knocker's bamboo pole, old man's pole
  S.pea = add(new THREE.SphereGeometry(0.06, 12, 10), L({ color: '#7cc04a' }), 0, -10, 0, world); S.pea.castShadow = false;
  S.peaGlow = billboard(T_(P.radial('200,255,160', 0.7)), 0.45, 0, -10, 0, world, { fog: false });
  const tubeM = L({ color: '#a07a48' });
  S.pipe3d = add(new THREE.CylinderGeometry(0.018, 0.022, 1, 10), tubeM, 0, -10, 0, world); S.pipe3dTip = add(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10), brass, 0, -10, 0, world);
  const bamboo = L({ color: '#c8b070' });
  S.pole = add(new THREE.CylinderGeometry(0.025, 0.035, 1, 8), bamboo, 0, -10, 0, world);
  S.pole2 = add(new THREE.CylinderGeometry(0.025, 0.035, 1, 8), bamboo, 0, -10, 0, world);
  S.lantern3d = G(0, -10, 0, world);
  { const g = S.lantern3d; add(tbox(0.16, 0.2, 0.16, 1), basic({ color: '#ffcf70' }), 0, 0.12, 0, g, { cast: false }); add(new THREE.ConeGeometry(0.13, 0.08, 4), iron, 0, 0.26, 0, g).rotation.y = Math.PI / 4; add(tbox(0.18, 0.03, 0.18, 1), iron, 0, 0.01, 0, g);
    add(new THREE.TorusGeometry(0.06, 0.008, 4, 10, Math.PI), iron, 0, 0.3, 0, g); }

  // point lights (repositioned per shot by W.pl)
  S.pl = []; for (let i = 0; i < 4; i++) { const l = new THREE.PointLight('#ffb060', 0, 12, 1.4); l.position.set(0, -50, 0); scene.add(l); S.pl.push(l); }

  // ======================= M2: family bedroom =======================
  {
    const M2 = LOC[2];
    const paper = T_(cv(256, 256, (g) => { g.fillStyle = '#7a8a6a'; g.fillRect(0, 0, 256, 256); for (let x = 0; x < 256; x += 64) { g.fillStyle = '#6a7a5c'; g.fillRect(x, 0, 22, 256); }
      for (let i = 0; i < 16; i++) { const x = 44 + (i % 4) * 64, y = 20 + Math.floor(i / 4) * 64; g.fillStyle = '#c8a070'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.fillStyle = '#9ab07a'; g.beginPath(); g.ellipse(x - 8, y + 8, 6, 3, 0.6, 0, 7); g.fill(); } }), 4, 2.4);
    const wallM = L({ map: paper }), floorM = wood('#9a7a54', 3), ceilM = L({ color: '#c8bca4' });
    const fl = add(new THREE.PlaneGeometry(5.6, 4.4), floorM, 0, 0, 0, M2, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(5.6, 2.9, 0.12, 2), wallM, 0, 1.45, -1.8, M2);
    add(tbox(0.12, 2.9, 4.4, 2), wallM, 2.6, 1.45, 0.4, M2);
    // left wall with a window hole
    const ws = new THREE.Shape(); ws.moveTo(-1.8, 0); ws.lineTo(2.6, 0); ws.lineTo(2.6, 2.9); ws.lineTo(-1.8, 2.9);
    const wh = new THREE.Path(); wh.moveTo(-0.9, 1.0); wh.lineTo(0.2, 1.0); wh.lineTo(0.2, 2.35); wh.lineTo(-0.9, 2.35); ws.holes.push(wh);
    const lw = add(new THREE.ExtrudeGeometry(ws, { depth: 0.12, bevelEnabled: false }), wallM, -2.6, 0, 0, M2); lw.rotation.y = Math.PI / 2;
    paper.repeat.set(4, 2.4);
    add(tbox(5.6, 0.1, 4.4, 2), ceilM, 0, 2.9, 0.4, M2, { cast: false });
    // skirting + picture rail
    add(tbox(5.6, 0.16, 0.04, 1), L({ color: '#5a3a24' }), 0, 0.08, -1.72, M2);
    // window frame (left wall) and the sky outside
    { const g = G(-2.62, 1.67, -0.35, M2); g.rotation.y = Math.PI / 2; windowAt(g, 0, 0, 0.0, 'm2win', 1.1, 1.35); S.m2win = windows.m2win;
      const sky = skip(add(new THREE.PlaneGeometry(6, 5), basic({ map: T_(cv(256, 256, (g2) => { const gr = g2.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#141a40'); gr.addColorStop(1, '#4a3a6a'); g2.fillStyle = gr; g2.fillRect(0, 0, 256, 256);
        g2.fillStyle = '#f4f0dc'; g2.beginPath(); g2.arc(150, 80, 20, 0, 7); g2.fill(); g2.fillStyle = '#20182c'; for (let i = 0; i < 9; i++) g2.fillRect(i * 30, 170 - (i % 3) * 18, 26, 120); g2.fillStyle = '#ffd890'; for (let i = 0; i < 6; i++) g2.fillRect(8 + i * 44, 190, 5, 7); })), fog: false }), 0, 0, -2.4, g, { cast: false }));
      S.m2sky = sky; }
    // moonlight / sunlight beam through the window
    const beamTex = T_(cv(64, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); }));
    S.m2beam = skip(add(new THREE.PlaneGeometry(1.1, 3.6), basic({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#8aa0e0', side: THREE.DoubleSide }), -1.2, 1.2, -0.35, M2, { cast: false }));
    S.m2beam.rotation.set(0, Math.PI / 2, 1.0); S.m2beam.renderOrder = 5;
    S.m2patch = skip(add(new THREE.PlaneGeometry(1.2, 1.5), basic({ map: T_(cv(128, 128, (g) => { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(14, 14, 46, 46); g.fillRect(68, 14, 46, 46); g.fillRect(14, 68, 46, 46); g.fillRect(68, 68, 46, 46); })), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#7a8ad0' }), -0.7, 0.012, -0.3, M2, { cast: false }));
    S.m2patch.rotation.x = -Math.PI / 2;
    // iron bedstead along the back wall (heads at the back), quilt mound toward camera
    const bed = G(0.5, 0, -0.55, M2);
    const bedIron = L({ color: '#3a3a4a' });
    for (const sx of [-1, 1]) { add(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 8), bedIron, sx * 0.95, 0.65, -1.05, bed); add(new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8), bedIron, sx * 0.95, 0.42, 1.05, bed);
      add(new THREE.SphereGeometry(0.06, 8, 6), brass, sx * 0.95, 1.32, -1.05, bed); add(new THREE.SphereGeometry(0.06, 8, 6), brass, sx * 0.95, 0.87, 1.05, bed); }
    for (const yy of [1.2, 0.6]) { const b = add(new THREE.CylinderGeometry(0.025, 0.025, 1.9, 6), bedIron, 0, yy, -1.05, bed); b.rotation.z = Math.PI / 2; }
    for (let k = -3; k <= 3; k++) add(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6), bedIron, k * 0.24, 0.9, -1.05, bed);
    { const b = add(new THREE.CylinderGeometry(0.025, 0.025, 1.9, 6), bedIron, 0, 0.75, 1.05, bed); b.rotation.z = Math.PI / 2; }
    add(tbox(1.9, 0.3, 2.1, 1), L({ color: '#e8e2d0' }), 0, 0.42, 0, bed);
    const quiltTex = T_(cv(256, 256, (g) => { const cols = ['#c85a4a', '#e8c070', '#7a9ac8', '#d88a6a', '#8ab07a', '#f0e0c0']; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = cols[(x + y * 2) % 6]; g.fillRect(x * 64, y * 64, 64, 64); g.strokeStyle = '#5a3a3a'; g.lineWidth = 3; g.setLineDash([6, 5]); g.strokeRect(x * 64 + 4, y * 64 + 4, 56, 56); } }), 3, 3);
    const quilt = add(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 20, 1, false, 0, Math.PI), L({ map: quiltTex }), 0, 0.56, 0.32, bed); quilt.rotation.set(Math.PI / 2, 0, Math.PI / 2); quilt.scale.set(1, 1, 0.44);
    add(tbox(1.98, 0.32, 0.06, 1), L({ map: quiltTex }), 0, 0.42, 1.05, bed);
    S.m2bed = bed;
    // kids' mattress on the floor (left), small quilt
    const km = G(0.0, 0, 1.75, M2); add(tbox(1.9, 0.16, 1.0, 1), L({ color: '#d8ccb0' }), 0, 0.08, 0, km);
    const q2 = add(new THREE.CylinderGeometry(0.3, 0.3, 1.8, 16, 1, false, 0, Math.PI), L({ map: quiltTex }), 0, 0.16, 0.2, km); q2.rotation.set(0, 0, Math.PI / 2); q2.scale.set(0.6, 1, 1);
    // nightstand with snuffed candle, chair with clothes (foreground), pegs with work clothes
    add(tbox(0.55, 0.62, 0.45, 1), wood('#6a4a2e'), 1.95, 0.31, -1.4, M2); add(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 10), L({ color: '#f4ecd8' }), 1.95, 0.71, -1.4, M2);
    add(new THREE.CylinderGeometry(0.11, 0.13, 0.03, 12), brass, 1.95, 0.635, -1.4, M2); S.candleTop = [1.95 + O2[0], 0.82, -1.4];
    const peg = (x, z, col, w = 0.6, h = 0.8) => { add(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), wood('#5a3a24'), x, 2.0, z, M2).rotation.x = Math.PI / 2; const c = add(new THREE.PlaneGeometry(w, h), L({ color: col, side: THREE.DoubleSide }), x, 2.0 - h / 2, z + 0.06, M2); return c; };
    peg(1.3, -1.72, '#3f5f8f'); peg(1.9, -1.72, '#6a5a4a', 0.5, 1.0);
    add(tbox(0.6, 0.18, 0.06, 1), L({ color: '#5a3a24' }), 0.2, 2.15, -1.72, M2); // picture frame
    add(tbox(0.5, 0.1, 0.03, 1), L({ color: '#a8b8c8' }), 0.2, 2.15, -1.69, M2);
    const ch = G(2.1, 0, 2.4, M2); const cw = wood('#6a4a2e'); add(tbox(0.5, 0.06, 0.5, 1), cw, 0, 0.48, 0, ch); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(tbox(0.05, 0.48, 0.05, 1), cw, a * 0.22, 0.24, b * 0.22, ch); add(tbox(0.5, 0.6, 0.05, 1), cw, 0, 0.8, -0.24, ch);
    add(tbox(0.56, 0.5, 0.08, 1), L({ color: '#4a5a7a' }), 0, 0.85, -0.2, ch);
    add(tbox(0.3, 0.5, 0.25, 1), L({ color: '#3a2a22' }), -1.5, 0.25, 1.2, M2); // boots
    S.m2 = M2;
  }

  // ======================= M3: clock shop window =======================
  {
    const M3 = LOC[3];
    const st = add(new THREE.PlaneGeometry(40, 20), cobble, 0, 0, 4, M3, { cast: false }); st.rotation.x = -Math.PI / 2;
    add(tbox(40, 0.14, 1.6, 1.4), flag, 0, 0.07, 0.2, M3, { cast: false });
    const fs = new THREE.Shape(); fs.moveTo(-8, 0); fs.lineTo(8, 0); fs.lineTo(8, 7); fs.lineTo(-8, 7);
    const h1 = new THREE.Path(); h1.moveTo(-1.7, 0.7); h1.lineTo(1.7, 0.7); h1.lineTo(1.7, 2.9); h1.lineTo(-1.7, 2.9); fs.holes.push(h1);
    const h2 = new THREE.Path(); h2.moveTo(2.2, 0.15); h2.lineTo(3.2, 0.15); h2.lineTo(3.2, 2.5); h2.lineTo(2.2, 2.5); fs.holes.push(h2);
    add(new THREE.ExtrudeGeometry(fs, { depth: 0.3, bevelEnabled: false }), brickM[1], 0, 0, -0.9, M3);
    // shopfront woodwork
    const sw = L({ color: '#2a4a3a' }), gold = L({ color: '#d8a840' });
    add(tbox(3.9, 0.3, 0.2, 1), sw, 0, 0.55, -0.55, M3); add(tbox(3.9, 0.22, 0.2, 1), sw, 0, 3.02, -0.55, M3);
    for (const sx of [-1, 1]) add(tbox(0.2, 2.6, 0.2, 1), sw, sx * 1.85, 1.8, -0.55, M3);
    add(tbox(1.0, 2.35, 0.08, 1), wood('#2a4a3a', 0.5), 2.7, 1.32, -0.7, M3);
    // interior: lit back room, shelves, grandfather clock
    const inner = L({ color: '#c89058' });
    add(tbox(4.4, 3.4, 0.1, 1), L({ color: '#8a5a3a' }), 0, 1.7, -3.4, M3); for (const sx of [-1, 1]) add(tbox(0.1, 3.4, 2.6, 1), inner, sx * 2.1, 1.7, -2.1, M3);
    add(tbox(4.4, 0.1, 2.6, 1), inner, 0, 3.2, -2.1, M3); add(tbox(4.4, 0.1, 2.6, 1), wood('#7a5232'), 0, 0.4, -2.1, M3);
    for (const yy of [1.5, 2.2, 2.8]) add(tbox(3.6, 0.05, 0.3, 1), wood('#6a4228'), 0, yy, -3.2, M3);
    // display steps in the window
    for (let k = 0; k < 3; k++) add(tbox(3.3, 0.18, 0.5, 1), L({ color: k % 2 ? '#7a1e2a' : '#8a2a34' }), 0, 0.8 + k * 0.28, -0.9 - k * 0.42, M3);
    // alarm clocks
    S.clockHands = [];
    const faceTex = canvasTex(256, 256, (g) => { g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.fillStyle = '#1a1416'; g.font = 'bold 40px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; g.fillText(String(i), 128 + Math.cos(a) * 94, 128 + Math.sin(a) * 94); } g.lineWidth = 8; g.strokeStyle = '#1a1416'; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 64); g.moveTo(128, 128); g.lineTo(172, 150); g.stroke(); });
    const faceM = basic({ map: faceTex, fog: true });
    const alarm = (x, y, z, s = 1, col = brass, parent = M3) => { const g = G(x, y, z, parent); g.scale.setScalar(s);
      const b = add(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 24), col, 0, 0.17, 0, g); b.rotation.x = Math.PI / 2;
      skip(add(new THREE.CircleGeometry(0.115, 24), faceM, 0, 0.17, 0.042, g));
      for (const sx of [-1, 1]) { const bell = add(new THREE.SphereGeometry(0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), col, sx * 0.09, 0.32, 0, g); bell.rotation.z = -sx * 0.5; add(tbox(0.03, 0.06, 0.03, 1), col, sx * 0.05, 0.43 - 0.13, 0, g).rotation.z = sx * 0.4; }
      add(tbox(0.02, 0.08, 0.02, 1), col, 0, 0.34, 0, g); add(new THREE.SphereGeometry(0.018, 6, 6), col, 0, 0.38, 0, g);
      for (const sx of [-1, 1]) add(new THREE.SphereGeometry(0.025, 8, 6), col, sx * 0.08, 0.04, 0, g);
      const hand = add(tbox(0.006, 0.09, 0.004, 1), L({ color: '#c8282a' }), 0, 0.17, 0.047, g); hand.geometry.translate(0, 0.045, 0); hand.position.y = 0.17; S.clockHands.push({ hand, ph: x * 3 + z }); return g; };
    const cols = [brass, L({ color: '#c8c8d0' }), L({ color: '#d84a3a' }), brass, L({ color: '#3a7ac8' })];
    [[-1.3, 0, 1.2], [-0.6, 0, 1.4], [0.15, 0, 1.6], [0.9, 0, 1.3], [1.4, 0, 1.0], [-1.0, 1, 1.5], [-0.2, 1, 1.25], [0.6, 1, 1.5], [1.25, 1, 1.1], [-0.6, 2, 1.3], [0.3, 2, 1.7], [1.0, 2, 1.2]]
      .forEach(([x, k, s], i) => alarm(x, 0.89 + k * 0.28, -0.85 - k * 0.42, s, cols[i % 5]));
    // "Teuer!" price tags, "Wecker" board in the window
    const tagTex = textSign(256, 128, 'Teuer!', { bg: '#f8f2e0', fg: '#c81e24', bd: '#c81e24', bw: 10, size: 74, font: '"DejaVu Sans", Arial, sans-serif' });
    S.tags = [];
    for (const [x, k] of [[-0.85, 0], [0.75, 0], [0.05, 1.35]]) { const t = signMesh(tagTex, 0.52, 0.26, x, 0.98 + k * 0.28, -0.6 - k * 0.42, M3); t.rotation.x = -0.25; S.tags.push(t); }
    const wTex = textSign(768, 220, 'Wecker', { bg: '#2a1a12', fg: '#f4d27a', bd: '#d8a840', bw: 14, size: 150, stroke: '#1a0e08', sw: 10 });
    signMesh(wTex, 1.5, 0.43, 0, 2.38, -1.55, M3);
    add(tbox(1.6, 0.5, 0.04, 1), wood('#3a2418'), 0, 2.38, -1.58, M3);
    // grandfather clock with pendulum (back right)
    { const g = G(1.5, 0.45, -2.9, M3); add(tbox(0.5, 2.4, 0.35, 1), wood('#5a3420'), 0, 1.2, 0, g); skip(add(new THREE.CircleGeometry(0.2, 24), faceM, 0, 2.05, 0.18, g)); add(tbox(0.3, 1.0, 0.02, 1), L({ color: '#2a1810' }), 0, 0.9, 0.18, g);
      const pd = G(0, 1.4, 0.2, g); add(tbox(0.015, 0.7, 0.01, 1), brass, 0, -0.35, 0, pd); add(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), brass, 0, -0.72, 0, pd).rotation.x = Math.PI / 2; S.pendulum = pd; }
    // glass of the window: faint reflection streaks only (transparent), window light spill on the pavement
    S.shopGlass = skip(add(new THREE.PlaneGeometry(3.4, 2.2), basic({ map: T_(cv(256, 128, (g) => { g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(30, 128); g.lineTo(90, 0); g.lineTo(120, 0); g.lineTo(60, 128); g.fill(); g.beginPath(); g.moveTo(150, 128); g.lineTo(190, 0); g.lineTo(200, 0); g.lineTo(160, 128); g.fill(); })), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 1.8, -0.62, M3, { cast: false }));
    S.shopSpill = skip(add(new THREE.PlaneGeometry(4.2, 3.0), basic({ map: T_(P.radial('255,190,110', 0.55)), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0.16, 0.9, M3, { cast: false })); S.shopSpill.rotation.x = -Math.PI / 2;
    billboard(glowWarm, 5.5, 0, 1.8, -0.4, M3, { fog: false, op: 0.35 });
    // gas lamp at the right (foreground) and a wall lamp left
    { const g = G(3.6, 0, 1.6, M3); add(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8), iron, 0, 2.1, 0, g); add(tbox(0.36, 0.5, 0.36, 1), basic({ color: '#ffd890' }), 0, 4.3, 0, g); billboard(glowTex, 3, 3.6, 4.3, 1.6, M3); }
    for (const [x, z, h] of [[-12, -4, 7], [12, -4, 7.5], [-10, 10, 7], [10, 10, 7.4]]) add(tbox(8, h, 4, 2.4), brickM[2], x, h / 2, z, M3);
    S.m3 = M3;
  }

  // ======================= M4: factory gate =======================
  {
    const M4 = LOC[4];
    const yd = add(new THREE.PlaneGeometry(80, 60), cobble, 0, 0, 0, M4, { cast: false }); yd.rotation.x = -Math.PI / 2;
    // pillars + walls
    for (const sx of [-1, 1]) {
      add(tbox(1.1, 4.6, 1.1, 2.4), brickM[0], sx * 2.75, 2.3, -2, M4); add(tbox(1.35, 0.3, 1.35, 1), stoneTrim, sx * 2.75, 4.75, -2, M4);
      add(new THREE.SphereGeometry(0.32, 12, 8), stoneTrim, sx * 2.75, 5.1, -2, M4);
      add(tbox(12, 3.6, 0.6, 2.4), brickM[0], sx * 9.3, 1.8, -2, M4); add(tbox(12, 0.18, 0.75, 1), stoneTrim, sx * 9.3, 3.69, -2, M4);
      // lamps on the pillars
      add(tbox(0.4, 0.55, 0.4, 1), basic({ color: '#ffd890' }), sx * 2.75, 5.65, -2, M4); add(new THREE.ConeGeometry(0.34, 0.3, 4), iron, sx * 2.75, 6.05, -2, M4).rotation.y = Math.PI / 4;
      billboard(glowTex, 3.4, sx * 2.75, 5.65, -2, M4);
    }
    // iron arch with the sign
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.07, 6, 30, Math.PI), iron); arch.position.set(0, 4.1, -2); M4.add(arch); arch.castShadow = true;
    add(tbox(4.6, 0.09, 0.09, 1), iron, 0, 4.1, -2, M4);
    const fTex = textSign(1024, 256, 'Fabrik', { bg: '#1c1a22', fg: '#f2e6c8', bd: '#c8a050', bw: 18, size: 170, stroke: '#0a0a0e', sw: 8 });
    add(tbox(2.7, 0.72, 0.08, 1), iron, 0, 4.6, -2.0, M4); signMesh(fTex, 2.6, 0.64, 0, 4.6, -1.95, M4);
    // warning plaque on the left pillar
    const wTex = textSign(768, 512, ['Wer zu spät', 'kommt,', 'zahlt!'], { bg: '#f2e6c8', fg: '#a8141c', bd: '#a8141c', bw: 22, size: 100, lh: 135, font: '"DejaVu Sans", Arial, sans-serif' });
    S.plaque = G(-2.75, 2.05, -1.42, M4); add(tbox(0.94, 0.64, 0.04, 1), iron, 0, 0, -0.02, S.plaque); signMesh(wTex, 0.9, 0.6, 0, 0, 0.005, S.plaque);
    for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), brass, sx * 0.36, 0.34, 0, S.plaque);
    // gate leaves (hinged at the pillars)
    S.leaves = [];
    for (const sx of [-1, 1]) { const hg = G(sx * 2.2, 0, -2, M4); const lf = G(0, 0, 0, hg);
      for (const yy of [0.25, 1.6, 3.0]) add(tbox(2.2, 0.08, 0.06, 1), iron, -sx * 1.1, yy, 0, lf);
      for (let k = 0; k < 11; k++) { const x = -sx * (0.1 + k * 0.2); add(new THREE.CylinderGeometry(0.022, 0.022, 3.1, 6), iron, x, 1.7, 0, lf); add(new THREE.ConeGeometry(0.05, 0.16, 6), ironHi, x, 3.32, 0, lf); }
      S.leaves.push({ hg, sx }); }
    // tower clock above the gatehouse behind
    { const g = G(0, 0, -9, M4); add(tbox(5, 10, 4, 2.4), brickM[1], 0, 5, 0, g); const r = add(new THREE.ConeGeometry(3.6, 2.6, 4), slate, 0, 11.3, 0, g); r.rotation.y = Math.PI / 4;
      const ct = canvasTex(512, 512, (c) => { c.fillStyle = '#fff6dc'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.lineWidth = 18; c.strokeStyle = '#1a1416'; c.stroke(); c.fillStyle = '#1a1416'; c.font = 'bold 72px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; c.fillText(String(i), 256 + Math.cos(a) * 190, 256 + Math.sin(a) * 190); } c.lineWidth = 20; c.beginPath(); c.moveTo(256, 256); c.lineTo(256, 120); c.moveTo(256, 256); c.lineTo(256, 360); c.stroke(); });
      skip(add(new THREE.CircleGeometry(1.4, 32), basic({ map: ct, fog: true }), 0, 7.6, 2.03, g)); billboard(glowTex, 4, 0, 7.6 + 0, -6.9, M4, { op: 0.4 }); }
    // factory halls with lit windows, chimneys, steam
    const winTex = T_(cv(256, 256, (g) => { g.fillStyle = '#3a2a2a'; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 2; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 3 ? '#ffb860' : '#ffd890'; g.fillRect(14 + x * 62, 30 + y * 120, 40, 80); g.fillStyle = '#5a3a2a'; g.fillRect(14 + x * 62 + 18, 30 + y * 120, 4, 80); } }), 6, 1);
    const hallM = L({ map: winTex });
    for (const [x, z, w] of [[-14, -16, 22], [14, -18, 22]]) { add(tbox(w, 9, 10, 1), [brickM[2], brickM[2], brickM[2], brickM[2], hallM, hallM], x, 4.5, z, M4); for (let k = 0; k < 4; k++) { const t = add(tbox(w / 4, 0.2, 5, 1), slate, x - w / 2 + w / 8 + k * w / 4, 10, z, M4); t.rotation.x = 0.5; } }
    S.steam = [];
    for (const [x, z, h] of [[-8, -24, 30], [6, -26, 36], [20, -22, 28]]) { add(new THREE.CylinderGeometry(0.9, 1.4, h, 12), brickM[2], x, h / 2, z, M4); add(new THREE.CylinderGeometry(1.1, 1.1, 0.8, 12), iron, x, h, z, M4);
      for (let k = 0; k < 5; k++) { const m = billboard(S.puffTex, 6, x, h + 2, z, M4, { add: false, fog: true, ro: 1 }); m.material = m.material.clone(); m.material.color.set('#7a7898'); S.steam.push({ m, base: new THREE.Vector3(x + O4[0], h + 1, z), ph: k / 5, big: true }); } }
    for (const [x, z] of [[-4.5, -3.5], [4.2, -3.2], [-6, -1]]) for (let k = 0; k < 3; k++) { const m = billboard(S.puffTex, 2.2, x, 0.6, z, M4, { add: false, fog: true, ro: 4 }); m.material = m.material.clone(); m.material.color.set('#c8c8e0'); S.steam.push({ m, base: new THREE.Vector3(x + O4[0], 0.3, z), ph: k / 3, low: true }); }
    // pipes along the wall
    for (const sx of [-1, 1]) { const pp = add(new THREE.CylinderGeometry(0.12, 0.12, 10, 10), L({ color: '#5a4a4a' }), sx * 9, 3.1, -1.55, M4); pp.rotation.z = Math.PI / 2; }
    S.m4 = M4;
  }

  // ======================= M5: the waker's own room (day) =======================
  {
    const M5 = LOC[5];
    const wallM = L({ color: '#a8907a' }), floorM = wood('#8a6a48', 3);
    const fl = add(new THREE.PlaneGeometry(5.6, 4.4), floorM, 0, 0, 0, M5, { cast: false }); fl.rotation.x = -Math.PI / 2;
    // back wall with the curtained window
    const ws = new THREE.Shape(); ws.moveTo(-2.8, 0); ws.lineTo(2.8, 0); ws.lineTo(2.8, 2.9); ws.lineTo(-2.8, 2.9);
    const wh = new THREE.Path(); wh.moveTo(-0.95, 1.05); wh.lineTo(0.35, 1.05); wh.lineTo(0.35, 2.45); wh.lineTo(-0.95, 2.45); ws.holes.push(wh);
    add(new THREE.ExtrudeGeometry(ws, { depth: 0.12, bevelEnabled: false }), wallM, 0, 0, -1.9, M5);
    add(tbox(0.12, 2.9, 4.4, 2), wallM, -2.6, 1.45, 0.3, M5); add(tbox(0.12, 2.9, 4.4, 2), wallM, 2.6, 1.45, 0.3, M5);
    add(tbox(5.6, 0.1, 4.4, 2), L({ color: '#c8b8a0' }), 0, 2.9, 0.3, M5, { cast: false });
    // sunlit curtains (two glowing panels with a bright gap), outside light
    const cTex = T_(cv(128, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffb878'); gr.addColorStop(1, '#f07848'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let x = 8; x < w; x += 18) { g.strokeStyle = 'rgba(160,50,40,.4)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 5, h / 2, x, h); g.stroke(); } }));
    S.curtains = [];
    for (const sx of [-1, 1]) { const m = skip(add(new THREE.PlaneGeometry(0.72, 1.6), basic({ map: cTex, fog: true }), -0.3 + sx * 0.37, 1.75, -1.72, M5, { cast: false })); S.curtains.push({ m, sx, x0: -0.3 + sx * 0.37 }); }
    add(new THREE.CylinderGeometry(0.02, 0.02, 1.7, 6), brass, -0.3, 2.58, -1.7, M5).rotation.z = Math.PI / 2;
    S.m5gap = skip(add(new THREE.PlaneGeometry(0.05, 1.5), basic({ color: '#fff6d8' }), -0.3, 1.75, -1.78, M5, { cast: false }));
    const beamTex = T_(cv(64, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); }));
    S.m5beam = skip(add(new THREE.PlaneGeometry(0.5, 3.4), basic({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffd8a0', side: THREE.DoubleSide }), -0.3, 1.2, -0.7, M5, { cast: false }));
    S.m5beam.rotation.set(-0.85, 0, 0); S.m5beam.renderOrder = 5;
    S.m5patch = skip(add(new THREE.PlaneGeometry(0.4, 1.8), basic({ map: T_(P.radial('255,230,170', 0.8)), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), -0.3, 0.012, 0.3, M5, { cast: false })); S.m5patch.rotation.x = -Math.PI / 2;
    billboard(glowWarm, 2.6, -0.3, 1.75, -1.6, M5, { op: 0.6 });
    // bed (left, along the back wall)
    const bed = G(-1.2, 0, -0.6, M5); const bw = wood('#6a4a2e');
    add(tbox(1.2, 0.3, 2.1, 1), L({ color: '#ece6d6' }), 0, 0.42, 0, bed); add(tbox(1.3, 1.1, 0.08, 1), bw, 0, 0.55, -1.08, bed); add(tbox(1.3, 0.7, 0.08, 1), bw, 0, 0.35, 1.08, bed);
    const quiltTex = T_(cv(256, 256, (g) => { const cols = ['#5a6a9a', '#e8d0a0', '#9a5a6a', '#7a9a7a']; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = cols[(x + y) % 4]; g.fillRect(x * 64, y * 64, 64, 64); g.strokeStyle = '#3a2a2a'; g.lineWidth = 3; g.setLineDash([6, 5]); g.strokeRect(x * 64 + 4, y * 64 + 4, 56, 56); } }), 2, 2);
    const q = add(new THREE.CylinderGeometry(0.42, 0.42, 1.25, 20, 1, false, 0, Math.PI), L({ map: quiltTex }), 0, 0.56, 0.3, bed); q.rotation.set(Math.PI / 2, 0, Math.PI / 2); q.scale.set(1, 1, 0.42);
    S.m5bed = bed;
    // nightstand with her lantern (cold), the pea pouch; blowpipe leaning; bonnet & shawl on pegs; chair
    add(tbox(0.55, 0.62, 0.45, 1), wood('#5a3a24'), 0.05, 0.31, -1.45, M5);
    { const g = G(0.0, 0.62, -1.45, M5); add(tbox(0.18, 0.22, 0.18, 1), L({ color: '#7a6a4a' }), 0, 0.13, 0, g); add(new THREE.ConeGeometry(0.14, 0.09, 4), iron, 0, 0.29, 0, g).rotation.y = Math.PI / 4; add(tbox(0.2, 0.03, 0.2, 1), iron, 0, 0.01, 0, g);
      add(new THREE.SphereGeometry(0.09, 10, 8), L({ color: '#8a5a32' }), 0.2, 0.08, 0.08, M5).position.set(0.25, 0.7, -1.38); }
    const pp = add(new THREE.CylinderGeometry(0.02, 0.024, 1.4, 10), tubeM, 0.42, 0.68, -1.5, M5); pp.rotation.set(0.0, 0, -0.32); S.m5pipeTip = [0.42 + 0.22 + O5[0], 1.34, -1.5];
    const pk = (x, col, w, h) => { add(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), wood('#5a3a24'), x, 2.0, -1.78, M5).rotation.x = Math.PI / 2; return add(new THREE.PlaneGeometry(w, h), L({ color: col, side: THREE.DoubleSide }), x, 2.0 - h / 2, -1.72, M5); };
    pk(1.2, '#a3432f', 0.8, 0.9); pk(1.9, '#5b4636', 0.45, 0.4);
    const ch = G(1.7, 0, 1.4, M5); const cw = wood('#6a4a2e'); add(tbox(0.5, 0.06, 0.5, 1), cw, 0, 0.48, 0, ch); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(tbox(0.05, 0.48, 0.05, 1), cw, a * 0.22, 0.24, b * 0.22, ch); add(tbox(0.5, 0.6, 0.05, 1), cw, 0, 0.8, -0.24, ch);
    add(tbox(0.56, 0.4, 0.4, 1), L({ color: '#3b3552' }), 0, 0.68, 0, ch); // folded dress
    add(tbox(0.34, 0.5, 0.28, 1), L({ color: '#3a2a22' }), 0.9, 0.25, 1.5, M5); add(tbox(0.34, 0.5, 0.28, 1), L({ color: '#3a2a22' }), 1.3, 0.25, 1.6, M5); // big boots
    add(tbox(0.9, 0.7, 0.08, 1), L({ color: '#5a3a24' }), 1.5, 1.7, -1.8, M5); add(tbox(0.8, 0.6, 0.03, 1), L({ color: '#c8b890' }), 1.5, 1.7, -1.76, M5);
    S.m5 = M5;
  }
};

const V = (a) => a;
export const update = (ctx, W, f) => {
  const { THREE, camera } = ctx;
  const tod = W.tod || 'night', day = DAYS[tod];
  for (const k in S.loc) S.loc[k].visible = (+k === (W.loc || 1)) || (W.loc2 && +k === W.loc2);
  for (const b of S.bill) b.quaternion.copy(camera.quaternion);
  // sky dressing
  S.moon.visible = tod === 'night' && (W.loc || 1) === 1; S.stars.visible = tod !== 'day'; S.stars.material.opacity = tod === 'night' ? 1 : 0.35;
  // windows
  const lit = W.lit || [];
  for (const id in S.windows) { const w = S.windows[id]; let st = day === 2 ? 'day' : 'dark';
    if (lit.includes(id)) st = 'lit'; if (W.shut && W.shut.includes(id)) st = 'shut'; if (W.open && W.open[id] != null) st = W.open[id] > 0 ? 'open' : st;
    w.glass.visible = st !== 'open'; if (st !== 'open' && w.state !== st) { w.mat.map = { dark: S.GT_dark, lit: S.GT_lit, day: S.GT_day, shut: S.GT_shut }[st] || w.mat.map; }
    w.state = st; }
  // lamps
  const lampOn = tod !== 'day';
  for (const l of S.lamps) { l.bb.visible = lampOn; const fl = 0.85 + 0.15 * Math.sin(f * 0.9 + l.x) * Math.sin(f * 0.37 + l.z); l.bb.scale.setScalar(3.2 * (tod === 'dawn' ? 0.5 : 1) * fl); l.gl.material.color.set(lampOn ? '#ffd890' : '#d8d0c0'); }
  // cloth sway, smoke, fog
  for (const c of S.cloth) { c.pv.rotation.z = Math.sin(f * 0.07 + c.ph) * 0.18; c.pv.rotation.x = Math.sin(f * 0.05 + c.ph * 2) * 0.08; }
  const smk = (arr, spd) => { for (const s of arr) { const t = ((f * spd) / 30 + s.ph) % 1; const big = s.big ? 1 : 0, low = s.low;
    s.m.position.set(s.base.x + t * (big ? 8 : 1.4), s.base.y + t * (low ? 1.6 : big ? 14 : 3.2), s.base.z + t * (big ? 2 : 0.3));
    const sc = low ? 1.5 + t * 2.5 : big ? 6 + t * 12 : 0.7 + t * 2.2; s.m.scale.set(sc, sc, 1); s.m.material.opacity = Math.sin(t * Math.PI) * (low ? 0.5 : 0.7) * (W.smoke === 0 ? 0 : 1); } };
  smk(S.smoke, 0.18); smk(S.steam, 0.22);
  for (const s of S.fog) { const x = s.x0 + ((f * 0.012 + s.ph) % 4) - 2; s.m.position.set(x, 0.8 + Math.sin(f * 0.02 + s.ph) * 0.15, s.z); s.m.material.opacity = (W.fog ?? 0.5) * (0.7 + 0.3 * Math.sin(f * 0.03 + s.ph)); }
  // clocks
  for (const h of S.clockHands) h.hand.rotation.z = -Math.floor(f / 6 + h.ph) * Math.PI / 30;
  S.pendulum.rotation.z = Math.sin(f / 30 * Math.PI) * 0.22;
  // gate leaves: W.gate 0 = open (swung in), 1 = shut
  for (const l of S.leaves) l.hg.rotation.y = l.sx * (1 - (W.gate ?? 0)) * 1.45 + (W.gateShake ? Math.sin(f * 2.3) * 0.02 * W.gateShake : 0);
  S.plaque.rotation.z = (W.plaqueSwing || 0) * Math.sin(f * 0.6);
  // curtains in M5 breathe; window beams
  for (const c of S.curtains) c.m.position.x = c.x0 + Math.sin(f * 0.05) * 0.01 * c.sx;
  S.m5beam.material.color.set(tod === 'dawn' ? '#ffb0a0' : '#ffe0a0'); S.m5patch.material.color.set(tod === 'dawn' ? '#ff9a90' : '#ffffff');
  S.m2beam.material.color.set(tod === 'day' ? '#ffe8b0' : '#7088d0'); S.m2patch.material.color.set(tod === 'day' ? '#ffe0a0' : '#5a6ab0');
  S.m2sky.visible = tod !== 'day'; S.m2win.glass.visible = true; S.m2win.mat.map = tod === 'day' ? S.GT_day : S.GT_dark;
  // 3D props
  const place = (m, p) => { if (!p) { m.position.y = -50; return; } m.position.set(...p); };
  place(S.pea, W.pea); S.pea.scale.setScalar(W.peaS || 1); place(S.peaGlow, W.noPeaGlow ? null : W.pea);
  const rod = (m, a, b, tip) => { if (!a) { m.position.y = -50; if (tip) tip.position.y = -50; return; } const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), d = vb.clone().sub(va);
    m.position.copy(va).addScaledVector(d, 0.5); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); if (tip) { tip.position.copy(va); tip.quaternion.copy(m.quaternion); } };
  rod(S.pipe3d, W.pipe3d && W.pipe3d[0], W.pipe3d && W.pipe3d[1], S.pipe3dTip);
  rod(S.pole, W.pole && W.pole[0], W.pole && W.pole[1]);
  rod(S.pole2, W.pole2 && W.pole2[0], W.pole2 && W.pole2[1]);
  if (W.lantern3d) { S.lantern3d.position.set(...W.lantern3d); S.lantern3d.visible = true; } else S.lantern3d.visible = false;
  // point lights
  for (let i = 0; i < 4; i++) { const l = S.pl[i], p = (W.pl || [])[i]; if (!p) { l.intensity = 0; continue; } l.position.set(...p.pos); l.color.set(p.col || '#ffb060'); l.intensity = p.i ?? 30; l.distance = p.d ?? 12; }
};
export const _S = S;
export const setGT = (GT) => {};
