// scene.js — "Der Zitronensaft-Räuber": all sets of the story, each at its own offset in one world.
// Every visible word is German: Zitronensaft, Bank, Geld her!, Eilmeldung, Polizei, Zitronen-Räuber gefasst, Geheim.
export const K = [0, 0, 0];        // M1 kitchen
export const BX = [100, 0, 0];     // M2 bank exterior
export const B2 = [160, 0, 0];     // M2 second bank
export const BI = [130, 0, 60];    // M2 bank interior
export const LR = [200, 0, 0];     // M4 living room
export const PO = [250, 0, 0];     // M5 porch
export const IR = [300, 0, 0];     // M6 interrogation
export const OF = [350, 0, 0];     // M7 psychology office
export const MS = [400, 0, 0];     // mirror metaphor stage
export const CE = [450, 0, 0];     // M8 cell
export const CAMPOS = [130, 3.42, 61.34]; // bank security camera (lens) world position

const FONT = 'Inter, "DejaVu Sans", sans-serif', SERIF = '"Liberation Serif", "DejaVu Serif", serif';
let S = {}; window.__S = S;
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };

export const build = (ctx) => {
  const { THREE, P, world, add, tbox, toon, texM, canvasTex, addClouds, T } = ctx;
  const G = (pos) => { const g = new THREE.Group(); g.position.set(...pos); world.add(g); return g; };
  const basic = (tex, extra = {}) => new THREE.MeshBasicMaterial({ map: tex, ...extra });
  const plane = (w, h, mat, x, y, z, parent, ry = 0, rx_ = 0) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false }); m.rotation.set(rx_, ry, 0); return m; };
  const textPlane = (w, h, tex, x, y, z, parent, ry = 0) => { const m = plane(w, h, basic(tex), x, y, z, parent, ry); m.userData.ndSkip = true; return m; };
  const dyn = (w, h) => { const [c, g] = cv(w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g, t, key: '' }; };
  const ct = (c, rx = 1, ry = 1) => P.tex(c, rx, ry);
  const col = (c) => toon({ color: c });
  const emis = (c, k = 1.5) => toon({ color: c, emissive: c, emissiveIntensity: k });
  const cyl = (r0, r1, h, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
  const sph = (r, a = 16, b = 12) => new THREE.SphereGeometry(r, a, b);
  const NC = { cast: false };
  S.lights = {};
  const pl = (name, parent, c, I, d, x, y, z) => { const l = new THREE.PointLight(c, I, d, 1.6); l.position.set(x, y, z); parent.add(l); S.lights[name] = l; l.visible = false; return l; };

  // ---------- painted textures ----------
  const wallpaper = (() => { const [c, g] = cv(512, 512), r = P.rng(31); g.fillStyle = '#f6e3c0'; g.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x += 64) { g.fillStyle = 'rgba(232,170,120,0.25)'; g.fillRect(x + 28, 0, 8, 512); }
    for (let i = 0; i < 18; i++) { const x = (i % 6) * 86 + 30 + ((i / 6 | 0) % 2) * 43, y = (i / 6 | 0) * 170 + 60;
      g.fillStyle = '#7aa85a'; for (const a of [0.6, 2.4, 4.0]) { g.beginPath(); g.ellipse(x + Math.cos(a) * 16, y + Math.sin(a) * 16, 12, 6, a, 0, 7); g.fill(); }
      g.fillStyle = ['#e8607a', '#f0904a', '#e8b83a'][i % 3]; for (let k = 0; k < 5; k++) { const a = k * 1.256; g.beginPath(); g.arc(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 7.5, 0, 7); g.fill(); }
      g.fillStyle = '#fff3c0'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    return c; })();
  const checker = (a, b, n = 8, seed = 1) => { const [c, g] = cv(512, 512), r = P.rng(seed), s = 512 / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); g.fillStyle = `rgba(0,0,0,${r() * 0.05})`; g.fillRect(i * s, j * s, s, s); } g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); } return c; };
  const marbleChk = (() => { const m = P.marble(10), [c, g] = cv(512, 512); g.drawImage(m, 0, 0, 512, 512); g.globalAlpha = 0.55; g.fillStyle = '#5a6678'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) g.fillRect(i * 128, j * 128, 128, 128); g.globalAlpha = 1; g.strokeStyle = 'rgba(40,50,60,.5)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke(); } return c; })();
  const siding = (base) => { const [c, g] = cv(256, 256); g.fillStyle = base; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 32) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y + 26, 256, 6); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, y, 256, 4); } return c; };
  const brick = (base = '#a8503a') => { const [c, g] = cv(512, 512), r = P.rng(7); g.fillStyle = '#d8cbb8'; g.fillRect(0, 0, 512, 512); for (let y = 0; y < 512; y += 32) for (let x = -64; x < 512; x += 64) { const o = (y / 32) % 2 ? 32 : 0; g.fillStyle = `hsl(${12 + r() * 10},${40 + r() * 15}%,${36 + r() * 12}%)`; g.fillRect(x + o + 3, y + 3, 58, 26); } return c; };
  const concrete = (base = '#8f969c', seed = 5) => { const [c, g] = cv(512, 512), r = P.rng(seed); g.fillStyle = base; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${r() * 0.07})`; g.beginPath(); g.ellipse(r() * 512, r() * 512, 2 + r() * 14, 2 + r() * 9, r() * 3, 0, 7); g.fill(); } for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(60,50,40,.10)'; g.beginPath(); g.ellipse(r() * 512, r() * 512, 30 + r() * 60, 50 + r() * 120, 0, 0, 7); g.fill(); } return c; };
  const tiles = (base = '#c8c4bc') => { const [c, g] = cv(512, 512), r = P.rng(3); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = `hsl(35,8%,${70 + r() * 8}%)`; g.fillRect(i * 128, j * 128, 128, 128); } g.strokeStyle = 'rgba(60,60,60,.4)'; g.lineWidth = 4; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke(); } return c; };
  const asphalt = (() => { const [c, g] = cv(512, 512), r = P.rng(9); g.fillStyle = '#4a4c52'; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${r() * 0.12})`; g.fillRect(r() * 512, r() * 512, 2, 2); } return c; })();
  const books = (seed) => { const [c, g] = cv(512, 256), r = P.rng(seed); g.fillStyle = '#5a3a24'; g.fillRect(0, 0, 512, 256); let x = 4; while (x < 508) { const w = 12 + r() * 22, h = 150 + r() * 90; g.fillStyle = ['#b8343a', '#2a5a8a', '#3a8a4a', '#e8b84a', '#7a4a8a', '#d8d0b8', '#2a2a3a', '#c8602a'][(r() * 8) | 0]; g.fillRect(x, 256 - h, w - 2, h); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 2, 256 - h + 14, w - 6, 4); g.fillRect(x + 2, 256 - h + 24, w - 6, 3); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + w - 5, 256 - h, 3, h); x += w; } return c; };

  // =====================================================================
  // M1 KITCHEN (warm, 90s)
  // =====================================================================
  { const R = G(K), W_ = 6, D = 5.2, H = 2.75;
    const fl = plane(W_, D + 3, texM(checker('#f2e6cc', '#c8603a', 10, 4), 1, 1.58), 0, 0, 1.5, R, 0, -Math.PI / 2);
    const wp = texM(wallpaper, 3, 1.4);
    add(tbox(W_, H, 0.1), wp, 0, H / 2, -D / 2, R, NC); add(tbox(0.1, H, D + 3), texM(wallpaper, 4, 1.4), -W_ / 2, H / 2, 1.5, R, NC); add(tbox(0.1, H, D + 3), texM(wallpaper, 4, 1.4), W_ / 2, H / 2, 1.5, R, NC);
    add(tbox(W_, 0.1, D), col('#f4ecd8'), 0, H, 0, R, NC);
    for (const [x, z, w, d] of [[0, -D / 2 + 0.06, W_, 0.04], [-W_ / 2 + 0.06, 0, 0.04, D], [W_ / 2 - 0.06, 0, 0.04, D]]) add(tbox(w, 0.14, d), col('#8a5a34'), x, 0.07, z, R, NC);
    // counter + cabinets along back wall
    add(tbox(3.4, 0.86, 0.62), col('#7fb8a0'), -1.25, 0.43, -2.25, R); add(tbox(3.5, 0.06, 0.68), col('#f2ead2'), -1.25, 0.89, -2.24, R);
    for (let i = 0; i < 5; i++) { add(tbox(0.6, 0.66, 0.02), col('#93c8b2'), -2.6 + i * 0.68, 0.45, -1.93, R); add(sph(0.025), col('#e2b84c'), -2.4 + i * 0.68, 0.65, -1.91, R); }
    for (let i = 0; i < 4; i++) { add(tbox(0.66, 0.62, 0.36), col('#7fb8a0'), -2.55 + i * 0.7, 2.05, -2.38, R); add(sph(0.025), col('#e2b84c'), -2.35 + i * 0.7, 1.84, -2.19, R); }
    // stove
    add(tbox(0.78, 0.9, 0.66), col('#f6f2ea'), -2.45, 0.45, -2.2, R); add(tbox(0.6, 0.36, 0.02), col('#2a2a32'), -2.45, 0.42, -1.86, R);
    for (const [x, z] of [[-2.62, -2.32], [-2.28, -2.32], [-2.62, -2.05], [-2.28, -2.05]]) { const b = add(cyl(0.11, 0.11, 0.02, 20), col('#2a2a30'), x, 0.91, z, R); }
    add(tbox(0.78, 0.22, 0.06), col('#f6f2ea'), -2.45, 1.0, -2.5, R);
    // fridge with magnets
    const fr = add(tbox(0.86, 1.86, 0.74), col('#f4efe2'), 2.4, 0.93, -2.18, R); add(tbox(0.04, 0.5, 0.04), col('#b8b8b8'), 2.05, 1.25, -1.79, R); add(tbox(0.04, 0.3, 0.04), col('#b8b8b8'), 2.05, 0.55, -1.79, R);
    add(tbox(0.84, 0.015, 0.02), col('#c8c4b8'), 2.4, 1.32, -1.8, R);
    const mag = canvasTex(256, 512, (g, w, h) => { g.clearRect(0, 0, w, h); const r = P.rng(5);
      for (const [x, y, c, s] of [[60, 60, '#e8343a', 30], [170, 90, '#2a7ae0', 26], [90, 200, '#ffd81f', 34], [190, 260, '#3aa04a', 24], [70, 360, '#ff8a2a', 28], [180, 420, '#e8607a', 26]]) { g.fillStyle = c; g.strokeStyle = '#1a1416'; g.lineWidth = 6; g.beginPath(); g.ellipse(x, y, s, s * 0.8, 0, 0, 7); g.fill(); g.stroke(); }
      g.fillStyle = '#fffbe8'; g.strokeStyle = '#1a1416'; g.lineWidth = 5; g.fillRect(110, 150, 110, 80); g.strokeRect(110, 150, 110, 80); g.fillStyle = '#9ac8f0'; g.fillRect(122, 160, 86, 58); g.fillStyle = '#3aa04a'; g.fillRect(122, 200, 86, 18); g.fillStyle = '#ffd81f'; g.beginPath(); g.arc(150, 180, 10, 0, 7); g.fill(); });
    const mp = plane(0.8, 1.6, basic(mag, { transparent: true }), 2.4, 1.0, -1.805, R); mp.userData.ndSkip = true;
    // window + curtains
    add(tbox(1.3, 1.0, 0.06), col('#f6f0e2'), -0.9, 1.75, -2.56, R, NC);
    const sky = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6aa8e8'); gr.addColorStop(1, '#cfe6f8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#7ab85a'; g.beginPath(); g.ellipse(60, 250, 120, 60, 0, 0, 7); g.ellipse(220, 260, 110, 70, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(150, 70, 50, 18, 0, 0, 7); g.fill(); });
    textPlane(1.14, 0.84, sky, -0.9, 1.75, -2.52, R); add(tbox(1.14, 0.04, 0.05), col('#f6f0e2'), -0.9, 1.75, -2.5, R, NC); add(tbox(0.04, 0.84, 0.05), col('#f6f0e2'), -0.9, 1.75, -2.5, R, NC);
    const ging = texM((() => { const [c, g] = cv(128, 128); g.fillStyle = '#fff6d8'; g.fillRect(0, 0, 128, 128); g.fillStyle = 'rgba(240,190,40,.55)'; for (let i = 0; i < 8; i += 2) { g.fillRect(i * 16, 0, 16, 128); g.fillRect(0, i * 16, 128, 16); } return c; })(), 3, 3);
    for (const sx of [-1, 1]) add(tbox(0.36, 1.1, 0.05), ging, -0.9 + sx * 0.72, 1.7, -2.48, R, NC); add(tbox(1.9, 0.26, 0.06), ging, -0.9, 2.28, -2.48, R, NC);
    // mirror on the wall (reflection is a dynamic canvas)
    add(tbox(0.66, 0.86, 0.06), col('#b8862e'), 1.1, 1.62, -2.53, R, NC);
    S.mirrorK = dyn(330, 430); S.mirrorKMesh = textPlane(0.56, 0.76, S.mirrorK.t, 1.1, 1.62, -2.495, R);
    // pendant lamp
    add(cyl(0.008, 0.008, 0.5), col('#2a2a2a'), 0.1, 2.5, 0.0, R, NC); add(cyl(0.08, 0.3, 0.22, 24), col('#3a8a6a'), 0.1, 2.16, 0.0, R, NC); add(sph(0.08), emis('#fff4c0', 2.2), 0.1, 2.06, 0.0, R, NC);
    pl('kitchen', R, '#ffd8a0', 2.4, 9, 0.1, 1.95, 0.2);
    // table + tablecloth + chairs
    add(tbox(1.6, 0.06, 1.0), texM(checker('#ffffff', '#d83a3a', 8, 2), 1, 1), 0, 0.78, 0.2, R); for (const [x, z] of [[-0.7, -0.2], [0.7, -0.2], [-0.7, 0.6], [0.7, 0.6]]) add(tbox(0.06, 0.76, 0.06), col('#8a5a34'), x, 0.38, z, R);
    for (const x of [1.15]) { add(tbox(0.46, 0.05, 0.46), col('#d8a050'), x, 0.46, 0.2, R); add(tbox(0.05, 0.6, 0.46), col('#d8a050'), x + Math.sign(x) * 0.22, 0.76, 0.2, R); for (const dz of [-0.2, 0.2]) add(tbox(0.04, 0.46, 0.04), col('#8a5a34'), x, 0.23, 0.2 + dz, R); }
    // bowl of lemons
    add(cyl(0.2, 0.12, 0.1, 24), col('#5a8ad8'), -0.45, 0.86, 0.1, R); const lemM = col('#ffd81f');
    for (const [x, z, y] of [[-0.52, 0.06, 0.95], [-0.38, 0.12, 0.95], [-0.47, 0.18, 0.95], [-0.44, 0.1, 1.02]]) { const l = add(sph(0.065), lemM, x, y, z, R); l.scale.set(1.3, 1, 1); }
    // bottle "Zitronensaft"
    const bottle = new THREE.Group(); bottle.position.set(0.18, 0.81, 0.02); R.add(bottle); S.bottleK = bottle;
    add(cyl(0.065, 0.07, 0.24, 24), toon({ color: '#ffe866', transparent: true, opacity: 0.92 }), 0, 0.12, 0, bottle); add(cyl(0.025, 0.06, 0.08, 18), toon({ color: '#ffe866' }), 0, 0.28, 0, bottle); add(cyl(0.028, 0.028, 0.05, 18), col('#3a8a3a'), 0, 0.34, 0, bottle);
    const lab = canvasTex(1024, 256, (g, w, h) => { g.fillStyle = '#fffbe8'; g.fillRect(0, 0, w, h); g.fillStyle = '#3aa04a'; g.fillRect(0, 0, w, 18); g.fillRect(0, h - 18, w, 18);
      g.fillStyle = '#1a1416'; g.font = `900 92px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Zitronensaft', w * 0.5, h / 2 + 4);
      g.fillStyle = '#ffd81f'; g.strokeStyle = '#1a1416'; g.lineWidth = 6; g.beginPath(); g.ellipse(w * 0.06, h / 2, 30, 22, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(w * 0.94, h / 2, 30, 22, 0, 0, 7); g.fill(); g.stroke(); });
    const lb = add(new THREE.CylinderGeometry(0.072, 0.072, 0.1, 40, 1, true), basic(lab), 0, 0.12, 0, bottle, NC); lb.rotation.y = -Math.PI / 2 + 0.05; lb.userData.ndSkip = true;
    // candle
    add(cyl(0.07, 0.08, 0.02, 20), col('#c8a050'), 0.5, 0.82, 0.32, R); add(cyl(0.035, 0.035, 0.2, 16), col('#f6eedc'), 0.5, 0.93, 0.32, R); add(cyl(0.004, 0.004, 0.03, 6), col('#222'), 0.5, 1.045, 0.32, R);
    // secret-ink paper (dynamic canvas) on a pivot so it can be lifted over the candle
    S.paper = dyn(840, 600); const pp = new THREE.Group(); pp.position.set(-0.05, 0.815, 0.42); R.add(pp); S.paperPivot = pp;
    S.paperMesh = textPlane(0.42, 0.3, S.paper.t, 0, 0, 0, pp); S.paperMesh.rotation.x = -Math.PI / 2; S.paperMesh.userData.ndSkip = false;
    S.paperMesh.material.side = THREE.DoubleSide;
    // brush
    const br = new THREE.Group(); R.add(br); S.brush = br; add(cyl(0.009, 0.012, 0.26, 10), col('#c8862a'), 0, 0.13, 0, br); add(cyl(0.016, 0.004, 0.06, 10), col('#3a2a20'), 0, -0.03, 0, br);
    br.position.set(0.25, 0.86, 0.5); br.rotation.z = -1.1;
    // juice cup
    add(cyl(0.05, 0.04, 0.09, 16), toon({ color: '#fff4a0', transparent: true, opacity: 0.85 }), 0.3, 0.86, 0.38, R);
    // tripod + instant camera (head pivot tilts toward the ceiling)
    const tp = new THREE.Group(); tp.position.set(-1.35, 0, 1.35); R.add(tp); S.tripod = tp;
    for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.4, l = add(cyl(0.012, 0.012, 1.32, 8), col('#2a2a30'), Math.cos(a) * 0.17, 0.64, Math.sin(a) * 0.17, tp); l.rotation.set(Math.sin(a) * 0.24, 0, -Math.cos(a) * 0.24); }
    add(cyl(0.035, 0.035, 0.12, 10), col('#2a2a30'), 0, 1.28, 0, tp);
    const hd = new THREE.Group(); hd.position.set(0, 1.36, 0); tp.add(hd); S.camHead = hd;
    add(tbox(0.3, 0.18, 0.22), col('#f2efe8'), 0, 0.09, 0, hd); add(tbox(0.3, 0.05, 0.225), col('#e8343a'), 0, 0.13, 0, hd); add(tbox(0.3, 0.035, 0.226), col('#ffd23a'), 0, 0.1, 0, hd);
    const lens = add(cyl(0.065, 0.07, 0.07, 24), col('#2a2a30'), 0, 0.08, 0.13, hd); lens.rotation.x = Math.PI / 2; add(cyl(0.045, 0.045, 0.01, 24), toon({ color: '#3a5a8a' }), 0, 0.08, 0.166, hd).rotation.x = Math.PI / 2;
    add(tbox(0.07, 0.05, 0.02), emis('#ffffff', 0.4), 0.1, 0.15, 0.115, hd); S.flashM = add(tbox(0.06, 0.04, 0.02), emis('#ffffff', 0.2), 0.1, 0.15, 0.12, hd).material;
    add(tbox(0.16, 0.012, 0.05), col('#1a1a1a'), 0, 0.002, 0.09, hd);
    // a lemon on the counter + kitchen clutter
    for (const [x, z] of [[-0.1, -2.2], [0.05, -2.3]]) { const l = add(sph(0.065), lemM, x, 0.97, z, R); l.scale.set(1.3, 1, 1); }
    add(cyl(0.1, 0.1, 0.24, 16), col('#e8603a'), -1.7, 1.04, -2.3, R); add(tbox(0.36, 0.24, 0.26), col('#c8c8d0'), 0.5, 1.04, -2.3, R);
  }

  // =====================================================================
  // M2 BANK EXTERIOR (cool blue-grey)
  // =====================================================================
  const bankSign = (bg = '#1c2a4a', fg = '#f2c84a', fnt = `700 230px ${SERIF}`) => canvasTex(1024, 300, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 14; g.strokeRect(22, 22, w - 44, h - 44);
    g.font = fnt; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = fg; g.fillText('Bank', w / 2, h / 2 + 14); });
  const car = (parent, x, z, c, rot = 0) => { const C = new THREE.Group(); C.position.set(x, 0, z); C.rotation.y = rot; parent.add(C);
    add(tbox(4.4, 0.72, 1.8), col(c), 0, 0.62, 0, C); add(tbox(2.3, 0.62, 1.66), col(c), -0.2, 1.28, 0, C); add(tbox(2.2, 0.5, 1.68), col('#2a3448'), -0.2, 1.3, 0, C);
    add(tbox(4.46, 0.14, 1.84), col('#b8bcc4'), 0, 0.36, 0, C); for (const [wx, wz] of [[-1.4, 0.86], [1.4, 0.86], [-1.4, -0.86], [1.4, -0.86]]) { const w = add(cyl(0.34, 0.34, 0.24, 18), col('#1a1a1e'), wx, 0.34, wz, C); w.rotation.x = Math.PI / 2; }
    for (const sz of [-0.6, 0.6]) add(tbox(0.06, 0.16, 0.36), emis('#fff6d0', 0.6), 2.2, 0.72, sz, C); };
  { const R = G(BX);
    const stoneM = texM(P.stone(14, 210, 6, 74, 128, 64), 1, 1);
    add(tbox(16, 8, 1, 2), stoneM, 0, 4, -0.5, R);
    for (const x of [-5.4, -2.3, 2.3, 5.4]) { add(cyl(0.34, 0.38, 5.6, 20), col('#d8dce0'), x, 2.8 + 0.3, 0.45, R); add(tbox(0.95, 0.3, 0.95), col('#c8ccd2'), x, 0.45, 0.45, R); add(tbox(0.95, 0.3, 0.95), col('#c8ccd2'), x, 5.95, 0.45, R); }
    add(tbox(14, 0.7, 1.4), col('#cfd4da'), 0, 6.45, 0.4, R); add(tbox(14.6, 0.3, 1.7), col('#b8bec6'), 0, 6.95, 0.45, R);
    for (let i = 0; i < 3; i++) add(tbox(4.4 - i * 0.3, 0.15, 1.2 - i * 0.35), col('#bfc4ca'), 0, 0.075 + i * 0.15, 0.9 - i * 0.18, R);
    // doors
    add(tbox(2.7, 3.1, 0.2), col('#5a4a3a'), 0, 1.55 + 0.3, 0.02, R);
    S.bankDoor = []; for (const sx of [-1, 1]) { const d = new THREE.Group(); d.position.set(sx * 1.2, 0.45, 0.14); R.add(d); S.bankDoor.push(d);
      add(tbox(1.15, 2.8, 0.06), toon({ color: '#7ea4c4', transparent: true, opacity: 0.85 }), -sx * 0.58, 1.4, 0, d); add(tbox(1.15, 0.1, 0.08), col('#b8963a'), -sx * 0.58, 0.05, 0, d); add(tbox(1.15, 0.1, 0.08), col('#b8963a'), -sx * 0.58, 2.75, 0, d);
      add(tbox(0.06, 0.5, 0.08), col('#e2c050'), -sx * 1.0, 1.3, 0.06, d); }
    textPlane(4.6, 1.35, bankSign(), 0, 4.0, 0.08, R);
    for (const x of [-3.9, 3.9]) { add(tbox(1.5, 2.6, 0.1), col('#e8ecf0'), x, 2.6, 0.04, R); add(tbox(1.3, 2.4, 0.12), toon({ color: '#3a5a7a' }), x, 2.6, 0.06, R); add(tbox(0.06, 2.4, 0.14), col('#e8ecf0'), x, 2.6, 0.08, R); }
    // sidewalk, curb, street
    plane(40, 6, texM(tiles(), 10, 1.5), 0, 0.005, 3, R, 0, -Math.PI / 2); add(tbox(40, 0.16, 0.3), col('#b8b8b8'), 0, 0.08, 6.0, R);
    plane(60, 20, texM(asphalt, 6, 2), 0, -0.06, 16, R, 0, -Math.PI / 2);
    for (let i = -6; i < 7; i++) plane(1.6, 0.14, col('#f2c84a'), i * 3.4, -0.05, 10.5, R, 0, -Math.PI / 2);
    car(R, -6.0, 7.4, '#8a2838'); car(R, 5.5, 7.4, '#2a8a8a'); car(R, 12.0, 7.4, '#d8c8a0');
    // neighbours
    add(tbox(10, 11, 6, 2), texM(brick(), 2, 2), -13.2, 5.5, -2.6, R); add(tbox(10, 9, 6, 2), texM(P.plaster(44, 30), 1, 1, '#d8c4a8'), 13.2, 4.5, -2.6, R);
    for (const x of [-15, -11.5]) for (const y of [2.2, 5, 7.8]) add(tbox(1.4, 1.6, 0.1), col('#2a3a5a'), x, y, 0.42, R, NC);
    for (const x of [11, 14.5]) for (const y of [2.4, 5.4]) add(tbox(1.4, 1.6, 0.1), col('#2a3a5a'), x, y, 0.42, R, NC);
    // street furniture
    add(cyl(0.07, 0.09, 4.4, 10), col('#2a3038'), -7.8, 2.2, 5.2, R); add(tbox(0.9, 0.12, 0.3), col('#2a3038'), -7.4, 4.4, 5.2, R); add(tbox(0.4, 0.14, 0.26), emis('#f6f2e0', 0.5), -7.0, 4.3, 5.2, R);
    add(tbox(0.5, 0.9, 0.5), col('#2a4a9a'), 8.6, 0.6, 4.8, R); add(cyl(0.25, 0.25, 0.5, 16, 1, false), col('#2a4a9a'), 8.6, 1.05, 4.8, R).rotation.z = Math.PI / 2;
    add(cyl(0.12, 0.14, 0.6, 12), col('#d8343a'), -3.6, 0.3, 5.3, R); add(sph(0.13), col('#d8343a'), -3.6, 0.62, 5.3, R);
    for (const x of [-9.6, 9.8]) { add(tbox(1.2, 0.6, 1.2), col('#a8a8a8'), x, 0.3, 4.6, R); add(cyl(0.08, 0.1, 2, 8), col('#6a4a32'), x, 1.4, 4.6, R); const c = add(sph(1.1, 14, 10), col('#4a9a4a'), x, 3.0, 4.6, R); c.scale.y = 0.9; }
  }
  { const R = G(B2); // second bank: brick, green band sign
    add(tbox(14, 6, 1, 2), texM(brick(), 3, 1.6), 0, 3, -0.5, R);
    add(tbox(14, 1.3, 0.3), col('#2a6a4a'), 0, 4.5, 0.12, R); textPlane(4.2, 1.15, bankSign('#2a6a4a', '#ffffff', `900 210px ${FONT}`), 0, 4.5, 0.29, R);
    add(tbox(3.0, 3.0, 0.2), col('#c8ccd2'), 0, 1.5, 0.02, R); add(tbox(2.6, 2.8, 0.12), toon({ color: '#8ab4d4' }), 0, 1.4, 0.1, R); add(tbox(0.06, 2.8, 0.16), col('#c8ccd2'), 0, 1.4, 0.12, R);
    for (const x of [-4.5, 4.5]) { add(tbox(2.6, 2.0, 0.12), col('#3a5a7a'), x, 2.0, 0.06, R); add(tbox(2.8, 0.14, 0.4), col('#d8d8d8'), x, 0.95, 0.2, R); }
    plane(40, 6, texM(tiles(), 10, 1.5), 0, 0.005, 3, R, 0, -Math.PI / 2); add(tbox(40, 0.16, 0.3), col('#b8b8b8'), 0, 0.08, 6.0, R); plane(60, 20, texM(asphalt, 6, 2), 0, -0.06, 16, R, 0, -Math.PI / 2);
    car(R, -5, 7.4, '#3a4a8a'); car(R, 6, 7.4, '#c8a83a');
    add(tbox(10, 9, 6, 2), texM(P.plaster(45, 200), 1, 1, '#b8c8d8'), -12.2, 4.5, -2.6, R); add(tbox(10, 12, 6, 2), texM(brick(), 2, 2), 12.2, 6, -2.6, R);
  }

  // =====================================================================
  // M2 BANK INTERIOR (cool blue-grey, marble)
  // =====================================================================
  { const R = G(BI), Hh = 4.4;
    plane(16, 14, texM(marbleChk, 4, 3.5), 0, 0, -0.5, R, 0, -Math.PI / 2);
    const wallM = texM(P.plaster(50, 210), 2, 1, '#aebccc');
    add(tbox(16, Hh, 0.2), wallM, 0, Hh / 2, -7, R, NC); add(tbox(0.2, Hh, 14), wallM, -8, Hh / 2, -0.5, R, NC); add(tbox(0.2, Hh, 14), wallM, 8, Hh / 2, -0.5, R, NC);
    add(tbox(16, 1.1, 0.06), col('#5a4a3a'), 0, 0.55, -6.88, R, NC); for (const x of [-7.88, 7.88]) add(tbox(0.06, 1.1, 14), col('#5a4a3a'), x, 0.55, -0.5, R, NC);
    add(tbox(16, 0.2, 14), col('#dfe4ea'), 0, Hh, -0.5, R, NC);
    for (const x of [-4, 0, 4]) for (const z of [-4, 0, 3]) add(tbox(1.6, 0.04, 0.6), emis('#f4f8ff', 0.9), x, Hh - 0.12, z, R, NC);
    for (const x of [-5.5, 5.5]) { add(cyl(0.38, 0.42, Hh, 20), col('#e8ecf0'), x, Hh / 2, -2.4, R); }
    // teller counter with glass partitions
    add(tbox(12, 1.15, 0.9), col('#6a4a34'), 0, 0.575, -4.4, R); add(tbox(12.2, 0.08, 1.05), texM(P.marble(12), 2, 0.3), 0, 1.19, -4.4, R);
    for (let i = 0; i < 5; i++) add(tbox(1.9, 0.8, 0.04), col('#5a3e2c'), -4.8 + i * 2.4, 0.55, -3.94, R);
    add(tbox(12, 0.12, 0.12), col('#c8a650'), 0, 2.45, -4.6, R);
    for (let i = 0; i <= 5; i++) add(tbox(0.08, 1.25, 0.1), col('#c8a650'), -6 + i * 2.4, 1.82, -4.6, R);
    for (let i = 0; i < 5; i++) { const gl = add(tbox(2.3, 1.15, 0.02), toon({ color: '#c8e0f0', transparent: true, opacity: 0.25, depthWrite: false }), -4.8 + i * 2.4, 1.86, -4.6, R, NC); gl.userData.ndSkip = true; add(tbox(0.7, 0.18, 0.06), col('#c8a650'), -4.8 + i * 2.4, 1.32, -4.6, R); }
    add(tbox(12, 1.9, 0.1), wallM, 0, 3.45, -4.6, R, NC);
    // back office behind counter
    for (const x of [-4, 0, 4]) { add(tbox(1.2, 1.6, 0.4), col('#7a8a9a'), x, 0.8, -6.6, R); }
    // velvet rope queue
    const brass = col('#d8b04a'), velvet = col('#b8202e');
    const posts = [[-3.4, -1.6], [-1.6, -1.6], [0.2, -1.6], [-3.4, -0.3], [-1.6, -0.3], [0.2, -0.3]];
    for (const [x, z] of posts) { add(cyl(0.22, 0.24, 0.05, 20), brass, x, 0.025, z, R); add(cyl(0.035, 0.035, 0.95, 10), brass, x, 0.5, z, R); add(sph(0.07), brass, x, 1.0, z, R); }
    const rope = (a, b) => { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, 0.9 - Math.sin(t * Math.PI) * 0.22, a[1] + (b[1] - a[1]) * t)); } add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.035, 8), velvet, 0, 0, 0, R); };
    rope(posts[0], posts[1]); rope(posts[1], posts[2]); rope(posts[3], posts[4]); rope(posts[4], posts[5]);
    // wall art (abstract), clock w/o numbers, plants, island desk
    for (const [x, c1, c2] of [[-6.6, '#3a6aa8', '#e8b84a'], [6.6, '#3a8a6a', '#d8603a']]) { add(tbox(0.06, 1.4, 1.9), col('#c8a650'), x > 0 ? 7.86 : -7.86, 2.7, -1.0, R, NC);
      const art = canvasTex(256, 192, (g, w, h) => { g.fillStyle = '#f2ece0'; g.fillRect(0, 0, w, h); g.fillStyle = c1; g.beginPath(); g.arc(90, 100, 60, 0, 7); g.fill(); g.fillStyle = c2; g.fillRect(130, 40, 90, 110); });
      textPlane(1.7, 1.25, art, x > 0 ? 7.82 : -7.82, 2.7, -1.0, R, x > 0 ? -Math.PI / 2 : Math.PI / 2); }
    const clk = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#fffdf6'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.lineWidth = 14; g.strokeStyle = '#1a1416'; g.stroke(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.lineWidth = 8; g.beginPath(); g.moveTo(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); g.lineTo(128 + Math.cos(a) * 108, 128 + Math.sin(a) * 108); g.stroke(); } g.lineWidth = 10; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 60); g.moveTo(128, 128); g.lineTo(180, 140); g.stroke(); });
    const ck = textPlane(0.9, 0.9, clk, 0, 3.45, -4.52, R); ck.material.transparent = true;
    for (const [x, z] of [[-7.2, 2.5], [7.2, 2.5], [-7.2, -3.2]]) { add(cyl(0.3, 0.24, 0.6, 14), col('#c8a650'), x, 0.3, z, R); const pl_ = add(sph(0.6, 12, 10), col('#3a8a4a'), x, 1.15, z, R); pl_.scale.y = 1.3; }
    add(tbox(1.8, 1.05, 0.7), col('#6a4a34'), 4.4, 0.525, 1.0, R); add(tbox(1.9, 0.06, 0.8), texM(P.marble(13), 1, 0.3), 4.4, 1.07, 1.0, R);
    add(tbox(2.2, 0.45, 0.6), col('#2a3a5a'), -5.6, 0.25, 2.2, R);
    // ceiling security camera (big, grey, blinking red light), aimed at the spot under it
    const cm = new THREE.Group(); cm.position.set(CAMPOS[0] - BI[0], Hh - 0.1, CAMPOS[2] - BI[2] - 0.4); R.add(cm); S.secCam = cm;
    add(tbox(0.36, 0.08, 0.36), col('#6a6e76'), 0, 0, 0, cm); add(cyl(0.05, 0.05, 0.45, 10), col('#6a6e76'), 0, -0.25, 0, cm);
    const hs = new THREE.Group(); hs.position.set(0, -0.5, 0); cm.add(hs); hs.rotation.x = 0.62; S.secHead = hs;
    add(tbox(0.42, 0.38, 0.92), col('#8a8e96'), 0, 0, 0.15, hs); add(tbox(0.5, 0.06, 1.04), col('#6a6e76'), 0, 0.22, 0.2, hs);
    const ln_ = add(cyl(0.14, 0.15, 0.12, 24), col('#2a2a30'), 0, 0, 0.66, hs); ln_.rotation.x = Math.PI / 2; add(cyl(0.1, 0.1, 0.02, 24), toon({ color: '#1a2a4a', emissive: '#203060', emissiveIntensity: 0.6 }), 0, 0, 0.725, hs).rotation.x = Math.PI / 2;
    S.recM = emis('#ff2a1a', 2.5); add(sph(0.04, 12, 10), S.recM, 0.15, 0.12, 0.62, hs);
    pl('bank', R, '#e8f0ff', 0.8, 14, 0, 3.5, 0);
  }

  // =====================================================================
  // M4 LIVING ROOM (warm evening)
  // =====================================================================
  { const R = G(LR), Hh = 2.7;
    plane(8, 7, texM(P.planks(21), 3, 3, '#c89a6a'), 0, 0, 0, R, 0, -Math.PI / 2);
    plane(3.4, 2.2, texM((() => { const [c, g] = cv(256, 256); g.fillStyle = '#a8403a'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#e8c070'; g.lineWidth = 10; g.strokeRect(14, 14, 228, 228); g.strokeStyle = '#2a4a6a'; g.lineWidth = 6; g.strokeRect(34, 34, 188, 188); return c; })(), 1, 1), 0, 0.01, -0.6, R, 0, -Math.PI / 2);
    const pan = texM(P.planks(22), 4, 1, '#d89a5a');
    add(tbox(8, Hh, 0.1), pan, 0, Hh / 2, -3, R, NC); add(tbox(0.1, Hh, 7), pan, -4, Hh / 2, 0, R, NC); add(tbox(0.1, Hh, 7), pan, 4, Hh / 2, 0, R, NC); add(tbox(8, 0.1, 7), col('#e8d8c0'), 0, Hh, 0, R, NC);
    // window with night outside + blinds
    const night = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a2050'); gr.addColorStop(1, '#4a3a70'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#f6eebc'; g.beginPath(); g.arc(190, 60, 22, 0, 7); g.fill(); g.fillStyle = '#141830'; g.fillRect(0, 190, w, 66); g.fillStyle = '#ffd880'; for (const [x, y] of [[30, 205], [90, 215], [150, 205]]) g.fillRect(x, y, 14, 18); });
    textPlane(1.5, 1.1, night, -1.7, 1.65, -2.94, R); add(tbox(1.7, 0.08, 0.1), col('#f2ead8'), -1.7, 2.24, -2.92, R, NC); add(tbox(1.7, 0.08, 0.1), col('#f2ead8'), -1.7, 1.08, -2.92, R, NC);
    for (let i = 0; i < 6; i++) add(tbox(1.5, 0.035, 0.02), col('#f2ead8'), -1.7, 2.12 - i * 0.07, -2.9, R, NC);
    // couch
    const cou = col('#8a5a34'), cou2 = col('#7a4a2a');
    add(tbox(2.6, 0.45, 0.95), cou, 0.4, 0.3, -2.2, R); add(tbox(2.6, 0.8, 0.3), cou2, 0.4, 0.8, -2.6, R);
    for (const sx of [-1, 1]) add(tbox(0.3, 0.7, 0.95), cou2, 0.4 + sx * 1.38, 0.45, -2.2, R);
    for (const sx of [-0.6, 0.6]) { const c = add(tbox(1.15, 0.16, 0.85), col('#9a6a40'), 0.4 + sx, 0.6, -2.12, R); }
    add(tbox(0.5, 0.4, 0.16), col('#d8a040'), -0.6, 0.85, -2.4, R).rotation.z = 0.2;
    // coffee table with chips + drink
    add(tbox(1.4, 0.06, 0.7), col('#6a4024'), 0.4, 0.45, -0.9, R); for (const [x, z] of [[-0.25, -1.2], [1.05, -1.2], [-0.25, -0.6], [1.05, -0.6]]) add(tbox(0.06, 0.42, 0.06), col('#5a3420'), x, 0.21, z, R);
    add(cyl(0.22, 0.14, 0.1, 20), col('#e8e2d8'), 0.15, 0.53, -0.95, R); const chipM = col('#f2c040');
    for (let i = 0; i < 9; i++) { const c = add(new THREE.ConeGeometry(0.06, 0.012, 3), chipM, 0.15 + Math.cos(i * 2.3) * 0.11, 0.6 + (i % 3) * 0.01, -0.95 + Math.sin(i * 2.3) * 0.11, R); c.rotation.set(1.2 + i, i, 0.3); }
    add(cyl(0.05, 0.04, 0.16, 14), col('#e83a4a'), 0.75, 0.56, -0.85, R);
    // floor lamp
    add(cyl(0.02, 0.02, 1.5, 8), col('#3a2a20'), -3.2, 0.75, -2.3, R); add(cyl(0.2, 0.3, 0.35, 18), toon({ color: '#ffd890', emissive: '#ffb860', emissiveIntensity: 0.9 }), -3.2, 1.6, -2.3, R, NC);
    pl('living', R, '#ffb870', 2.0, 9, -2.6, 1.6, -1.8);
    // CRT TV on a stand, facing the couch area (screen = dynamic canvas)
    const tv = new THREE.Group(); tv.position.set(1.9, 0, -0.2); tv.rotation.y = -Math.PI / 2 + 0.45; R.add(tv); S.tv = tv;
    add(tbox(1.3, 0.6, 0.6), col('#6a4024'), 0, 0.3, 0, tv); add(tbox(0.8, 0.12, 0.4), col('#2a2a2e'), 0, 0.5, 0.12, tv);
    add(tbox(1.12, 0.88, 0.8), col('#3a3a40'), 0, 1.04, -0.05, tv); add(tbox(0.9, 0.7, 0.5), col('#34343a'), 0, 1.04, -0.5, tv);
    add(tbox(1.0, 0.76, 0.04), col('#222226'), 0, 1.04, 0.36, tv, NC);
    S.tvScr = dyn(800, 600); const sc = textPlane(0.9, 0.675, S.tvScr.t, -0.0, 1.06, 0.385, tv);
    for (const sx of [-1, 1]) { const a = add(cyl(0.008, 0.008, 0.7, 6), col('#c8c8c8'), sx * 0.18, 1.75, -0.1, tv); a.rotation.z = -sx * 0.45; }
    S.tvGlow = pl('tv', R, '#a8c8ff', 1.4, 5, 1.7, 1.1, -0.9);
    // wall picture + plant
    const pic = canvasTex(256, 200, (g, w, h) => { g.fillStyle = '#e8c890'; g.fillRect(0, 0, w, h); g.fillStyle = '#6a9ad8'; g.fillRect(14, 14, w - 28, 110); g.fillStyle = '#4a8a3a'; g.beginPath(); g.moveTo(14, 124); g.lineTo(90, 60); g.lineTo(160, 124); g.fill(); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(200, 50, 18, 0, 7); g.fill(); });
    add(tbox(1.0, 0.8, 0.05), col('#6a4024'), 1.6, 1.75, -2.95, R, NC); textPlane(0.9, 0.7, pic, 1.6, 1.75, -2.92, R);
    add(cyl(0.2, 0.16, 0.4, 14), col('#c86a3a'), -3.3, 0.2, 1.0, R); const pt = add(sph(0.45, 12, 10), col('#4a9a4a'), -3.3, 0.8, 1.0, R); pt.scale.y = 1.3;
  }

  // =====================================================================
  // M5 PORCH (night)
  // =====================================================================
  { const R = G(PO);
    const sid = texM(siding('#8ab0c8'), 1.4, 1.4);
    add(tbox(5.45, 5, 0.3, 2), sid, -3.275, 2.5, -0.15, R); add(tbox(5.45, 5, 0.3, 2), sid, 3.275, 2.5, -0.15, R); add(tbox(1.1, 2.5, 0.3, 2), sid, 0, 3.75, -0.15, R);
    add(tbox(12, 0.3, 3.2), texM(P.planks(23), 4, 1, '#b8885a'), 0, 0.15, 1.6, R);
    for (let i = 0; i < 3; i++) add(tbox(2.4, 0.1, 0.4), col('#a8784a'), 0, 0.05 + i * 0.1 - 0.1, 3.4 + (2 - i) * 0.3, R);
    add(tbox(12, 0.18, 3.4), col('#6a7a8a'), 0, 3.0, 1.55, R, NC); for (const x of [-2.5, 2.5]) add(tbox(0.18, 2.7, 0.18), col('#f2ece0'), x, 1.65, 3.0, R);
    for (let i = -5; i <= 5; i++) if (Math.abs(i) > 1) add(tbox(0.06, 0.8, 0.06), col('#f2ece0'), i * 0.5, 0.7, 3.05, R);
    add(tbox(5.4, 0.08, 0.1), col('#f2ece0'), -3.4 + 0.2, 1.1, 3.05, R); add(tbox(5.4, 0.08, 0.1), col('#f2ece0'), 3.6 - 0.2, 1.1, 3.05, R);
    // door frame + hinged door
    for (const sx of [-1, 1]) add(tbox(0.13, 2.35, 0.34), col('#f2ece0'), sx * 0.615, 1.47, -0.1, R); add(tbox(1.35, 0.15, 0.34), col('#f2ece0'), 0, 2.58, -0.1, R); add(tbox(1.1, 0.3, 1.8), col('#c89a6a'), 0, 0.15, -1.0, R, NC); for (const sx of [-1, 1]) add(tbox(0.06, 2.6, 1.8), col('#e8c890'), sx * 0.75, 1.3, -1.0, R, NC);
    pl('inside', R, '#ffc888', 1.6, 5, 0, 1.6, -1.2);
    const dr = new THREE.Group(); dr.position.set(-0.55, 0.3, 0.06); R.add(dr); S.porchDoor = dr;
    add(tbox(1.1, 2.18, 0.06), col('#b8343a'), 0.55, 1.09, 0, dr); for (const [y, h] of [[0.5, 0.6], [1.45, 0.8]]) for (const x of [0.3, 0.8]) add(tbox(0.36, h, 0.02), col('#a02a30'), x, y, 0.04, dr);
    add(sph(0.045), col('#e2c050'), 0.95, 1.05, 0.06, dr);
    // inside hallway glimpse
    add(tbox(2, 2.6, 0.1), col('#e8c890'), 0, 1.3, -1.8, R, NC);
    // porch lamp + window + doormat + plant
    add(tbox(0.22, 0.34, 0.2), col('#2a2a30'), 0.95, 2.1, 0.12, R); add(tbox(0.16, 0.24, 0.16), emis('#ffe0a0', 2.5), 0.95, 2.1, 0.14, R);
    pl('porch', R, '#ffcf88', 3.0, 7, 0.9, 2.0, 1.2);
    for (const x of [-3.2, 3.2]) { add(tbox(1.5, 1.3, 0.1), col('#f2ece0'), x, 1.8, 0.02, R); add(tbox(1.3, 1.1, 0.12), emis('#ffc870', 0.9), x, 1.8, 0.04, R); add(tbox(0.05, 1.1, 0.14), col('#f2ece0'), x, 1.8, 0.06, R); }
    add(tbox(1.0, 0.02, 0.6), col('#8a5a3a'), 0, 0.31, 0.6, R);
    add(cyl(0.22, 0.18, 0.4, 14), col('#c86a3a'), -1.4, 0.5, 0.5, R); const pt = add(sph(0.38, 12, 10), col('#3a7a3a'), -1.4, 1.0, 0.5, R); pt.scale.y = 1.2;
    plane(60, 30, texM(P.grass(66), 10, 5, '#5a7a6a'), 0, -0.02, 14, R, 0, -Math.PI / 2);
    for (const x of [-8, 8]) { add(cyl(0.2, 0.3, 4, 8), col('#4a3a2a'), x, 2, 6, R); const c = add(sph(2.2, 12, 10), col('#2a4a3a'), x, 5, 6, R); c.scale.y = 0.9; }
  }

  // =====================================================================
  // M6 INTERROGATION ROOM (grey, one lamp)
  // =====================================================================
  { const R = G(IR), Hh = 3.0;
    plane(8, 7, texM(concrete('#6a6c70', 8), 2, 2), 0, 0, 0, R, 0, -Math.PI / 2);
    const cw = texM(concrete('#8a8e94', 6), 2, 1);
    add(tbox(8, Hh, 0.1), cw, 0, Hh / 2, -2.8, R, NC); add(tbox(0.1, Hh, 7), cw, -3.5, Hh / 2, 0, R, NC); add(tbox(0.1, Hh, 7), cw, 3.5, Hh / 2, 0, R, NC); add(tbox(8, 0.1, 7), col('#5a5c60'), 0, Hh, 0, R, NC);
    add(tbox(2.6, 1.1, 0.06), col('#1a2028'), 1.2, 1.7, -2.74, R, NC); add(tbox(2.76, 0.08, 0.1), col('#4a4c50'), 1.2, 1.12, -2.72, R, NC);
    // metal table + chairs
    const met = col('#9aa0a8'); add(tbox(1.8, 0.05, 1.0), met, 0, 0.78, 0, R); for (const [x, z] of [[-0.82, -0.42], [0.82, -0.42], [-0.82, 0.42], [0.82, 0.42]]) add(cyl(0.025, 0.025, 0.78, 8), col('#6a6e76'), x, 0.39, z, R);
    for (const z of [-0.95, 0.95]) { add(tbox(0.5, 0.04, 0.5), col('#6a6e76'), 0, 0.46, z, R); add(tbox(0.5, 0.5, 0.04), col('#6a6e76'), 0, 0.72, z + Math.sign(z) * 0.24, R); for (const [dx, dz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) add(cyl(0.015, 0.015, 0.46, 6), col('#4a4e56'), dx, 0.23, z + dz, R); }
    // lamp
    add(cyl(0.008, 0.008, 1.1, 6), col('#2a2a2a'), 0, Hh - 0.55, 0, R, NC); add(cyl(0.1, 0.42, 0.3, 24, 1, true), toon({ color: '#3a4a3a', side: THREE.DoubleSide }), 0, 1.82, 0, R, NC); add(sph(0.09), emis('#fff4d0', 3), 0, 1.64, 0, R, NC);
    const cone = add(new THREE.ConeGeometry(1.25, 1.7, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe6a8', transparent: true, opacity: 0.09, depthWrite: false, side: THREE.DoubleSide }), 0, 0.9, 0, R, NC); cone.userData.ndSkip = true;
    pl('interro', R, '#ffd8a0', 3.6, 6, 0, 1.6, 0.1);
    // CCTV photos on the table (dynamic so they can slide)
    S.photoTex = dyn(400, 480); S.photos = [];
    for (let i = 0; i < 3; i++) { const m = textPlane(0.3, 0.36, S.photoTex.t, 0, 0.81 + i * 0.002, 0, R); m.rotation.set(-Math.PI / 2, 0, 0); S.photos.push(m); }
    add(cyl(0.05, 0.04, 0.1, 14), col('#f2ece0'), 0.65, 0.85, -0.25, R); add(tbox(0.3, 0.02, 0.22), col('#d8c8a0'), -0.6, 0.8, -0.25, R);
  }

  // =====================================================================
  // M7 PSYCHOLOGY OFFICE (warm)
  // =====================================================================
  { const R = G(OF), Hh = 3.0;
    plane(8, 7, texM(P.planks(31), 3, 3, '#b8784a'), 0, 0, 0, R, 0, -Math.PI / 2);
    const ow = texM(P.plaster(60, 40), 2, 1, '#e8d4b0');
    add(tbox(8, Hh, 0.1), ow, 0, Hh / 2, -2.6, R, NC); add(tbox(0.1, Hh, 7), ow, -3.6, Hh / 2, 0, R, NC); add(tbox(0.1, Hh, 7), ow, 3.6, Hh / 2, 0, R, NC); add(tbox(8, 0.1, 7), col('#f2e8d8'), 0, Hh, 0, R, NC);
    // shelves full of books
    for (const [x, w] of [[-2.6, 1.8], [2.6, 1.8]]) { add(tbox(w, 2.5, 0.4), col('#6a4024'), x, 1.25, -2.38, R); for (let s = 0; s < 4; s++) textPlane(w - 0.12, 0.5, ct(books(s * 7 + (x > 0 ? 3 : 1))), x, 0.36 + s * 0.6, -2.17, R); }
    // chalkboard with a hand-drawn curve (no words)
    add(tbox(2.1, 1.25, 0.06), col('#8a5a34'), 0, 1.7, -2.52, R, NC);
    const chalk = canvasTex(1024, 600, (g, w, h) => { g.fillStyle = '#2a4a3a'; g.fillRect(0, 0, w, h); const r = P.rng(4); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.05})`; g.beginPath(); g.ellipse(r() * w, r() * h, 60 + r() * 120, 20 + r() * 40, r(), 0, 7); g.fill(); }
      g.strokeStyle = 'rgba(245,245,235,.92)'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(110, 70); g.lineTo(110, 520); g.lineTo(940, 520); g.stroke();
      g.lineWidth = 11; g.beginPath(); g.moveTo(120, 500); g.bezierCurveTo(170, 120, 230, 60, 290, 120); g.bezierCurveTo(360, 220, 420, 420, 520, 400); g.bezierCurveTo(660, 370, 780, 240, 920, 190); g.stroke();
      g.fillStyle = '#ffd81f'; g.strokeStyle = '#f5f5eb'; g.lineWidth = 5; g.beginPath(); g.ellipse(270, 92, 26, 19, -0.3, 0, 7); g.fill(); g.stroke(); });
    S.chalkMesh = textPlane(1.95, 1.12, chalk, 0, 1.7, -2.48, R);
    // window with campus view
    const campus = canvasTex(512, 384, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a9ae8'); gr.addColorStop(1, '#d8eaf8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#6aa84a'; g.fillRect(0, 280, w, 104); g.fillStyle = '#a8503a'; g.fillRect(40, 150, 200, 140); g.fillRect(300, 170, 180, 120); g.fillStyle = '#8a3a2a'; g.beginPath(); g.moveTo(30, 150); g.lineTo(140, 90); g.lineTo(250, 150); g.fill(); g.fillRect(120, 60, 40, 60);
      g.fillStyle = '#f2ead8'; for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) g.fillRect(60 + i * 36, 180 + j * 50, 18, 28); for (let i = 0; i < 4; i++) g.fillRect(320 + i * 40, 200, 18, 28);
      g.fillStyle = '#3a7a3a'; for (const x of [20, 270, 490]) { g.beginPath(); g.arc(x, 270, 38, 0, 7); g.fill(); } g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(380, 70, 60, 20, 0, 0, 7); g.fill(); });
    add(tbox(0.06, 1.3, 1.7), col('#f2ead8'), 3.56, 1.75, 0.2, R, NC); textPlane(1.55, 1.15, campus, 3.52, 1.75, 0.2, R, -Math.PI / 2);
    // desk + mugs + newspaper
    add(tbox(2.2, 0.06, 1.0), col('#7a4a2a'), 0, 0.78, 0.2, R); add(tbox(2.1, 0.74, 0.9), col('#6a3e22'), 0, 0.38, 0.15, R);
    for (const [x, c] of [[-0.7, '#e8603a'], [0.75, '#3a7ae0']]) { add(cyl(0.055, 0.05, 0.11, 16), col(c), x, 0.865, 0.35, R); add(cyl(0.045, 0.045, 0.005, 16), col('#3a2010'), x, 0.92, 0.35, R); }
    add(cyl(0.16, 0.14, 0.03, 18), col('#3a5a3a'), 0.85, 0.8, -0.05, R); add(tbox(0.3, 0.12, 0.22), col('#8a2a3a'), -0.85, 0.87, -0.05, R);
    S.newsTex = dyn(860, 1180); S.drawNews = null;
    S.news = textPlane(0.86, 1.18, S.newsTex.t, 0, 1.4, 0.9, R); S.news.material.side = THREE.DoubleSide;
    pl('office', R, '#ffe0b0', 1.6, 9, 0, 2.6, 0.8);
  }

  // =====================================================================
  // mirror stage (metaphor): purple dark, spotlight
  // =====================================================================
  { const R = G(MS);
    plane(12, 10, col('#3a2a5a'), 0, 0, 0, R, 0, -Math.PI / 2);
    const spot = canvasTex(512, 512, (g, w, h) => { const r = g.createRadialGradient(256, 256, 0, 256, 256, 256); r.addColorStop(0, 'rgba(255,240,200,0.9)'); r.addColorStop(0.6, 'rgba(255,220,160,0.45)'); r.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
    const sp = plane(5.2, 4.2, new THREE.MeshBasicMaterial({ map: spot, transparent: true, depthWrite: false }), 0, 0.01, 0, R, 0, -Math.PI / 2); sp.userData.ndSkip = true;
    const curtain = texM((() => { const [c, g] = cv(256, 256); for (let x = 0; x < 256; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, '#4a1a3a'); gr.addColorStop(0.5, '#8a2a5a'); gr.addColorStop(1, '#4a1a3a'); g.fillStyle = gr; g.fillRect(x, 0, 32, 256); } return c; })(), 6, 1);
    add(tbox(14, 6, 0.1), curtain, 0, 3, -3, R, NC);
    // tall standing mirror, ornate gold frame
    const mr = new THREE.Group(); mr.position.set(-0.85, 0, -0.5); mr.rotation.y = 0.32; R.add(mr); S.heroMirror = mr;
    const gold = col('#e2b84c'); add(tbox(1.5, 2.6, 0.1), gold, 0, 1.55, 0, mr); add(sph(0.16), gold, 0, 2.95, 0, mr);
    for (const sx of [-0.65, 0.65]) { add(tbox(0.06, 0.32, 0.4), gold, sx, 0.16, 0, mr); }
    S.heroTex = dyn(600, 1080); textPlane(1.3, 2.36, S.heroTex.t, 0, 1.55, 0.06, mr);
    pl('stage', R, '#ffe2b0', 2.2, 8, 0.4, 3.2, 1.2);
  }

  // =====================================================================
  // M8 CELL (cool, bars)
  // =====================================================================
  { const R = G(CE), Hh = 2.8;
    plane(6, 6, texM(concrete('#7a8088', 12), 2, 2), 0, 0, 0, R, 0, -Math.PI / 2);
    const cw = texM(concrete('#9aa2aa', 13), 1.5, 1);
    add(tbox(4.4, Hh, 0.12), cw, 0, Hh / 2, -1.6, R, NC); add(tbox(0.12, Hh, 3.2), cw, -2.2, Hh / 2, 0, R, NC); add(tbox(0.12, Hh, 3.2), cw, 2.2, Hh / 2, 0, R, NC); add(tbox(4.4, 0.12, 3.2), col('#6a7078'), 0, Hh, 0, R, NC);
    // high barred window + moonbeam
    add(tbox(0.8, 0.5, 0.14), col('#1a2448'), 0.8, 2.25, -1.56, R, NC); for (let i = 0; i < 4; i++) add(cyl(0.015, 0.015, 0.5, 6), col('#2a2a30'), 0.53 + i * 0.18, 2.25, -1.5, R);
    const beam = add(new THREE.BoxGeometry(0.7, 2.6, 0.02), new THREE.MeshBasicMaterial({ color: '#c8d8ff', transparent: true, opacity: 0.1, depthWrite: false }), 0.6, 1.2, -0.9, R, NC); beam.rotation.set(0.6, 0, 0.15); beam.userData.ndSkip = true;
    // bunk
    add(tbox(1.9, 0.06, 0.8), col('#5a6068'), -1.1, 0.5, -1.1, R); add(tbox(1.85, 0.12, 0.76), col('#d8d4c8'), -1.1, 0.59, -1.1, R); add(tbox(1.2, 0.04, 0.78), col('#7a8a9a'), -0.8, 0.66, -1.1, R);
    for (const [x, z] of [[-2.0, -0.75], [-0.2, -0.75]]) add(cyl(0.025, 0.025, 0.5, 8), col('#4a4e56'), x, 0.25, z, R);
    add(tbox(0.4, 0.12, 0.3), col('#f2f0ea'), -1.85, 0.7, -1.1, R);
    add(tbox(0.42, 0.4, 0.36), col('#c8ccd2'), 1.6, 0.2, -1.2, R); add(tbox(0.4, 0.06, 0.4), col('#d8dce0'), 1.6, 0.42, -1.2, R);
    // front bars
    const bar = col('#3a3e48'); S.bars = [];
    for (let i = 0; i < 16; i++) { const b = add(cyl(0.028, 0.028, Hh, 10), bar, -2.1 + i * 0.28, Hh / 2, 1.5, R); S.bars.push(b); }
    add(tbox(4.4, 0.08, 0.08), bar, 0, 0.12, 1.5, R); add(tbox(4.4, 0.08, 0.08), bar, 0, 1.9, 1.5, R); add(tbox(4.4, 0.08, 0.08), bar, 0, Hh - 0.1, 1.5, R);
    plane(8, 6, texM(concrete('#6a7078', 15), 2, 2), 0, -0.001, 4, R, 0, -Math.PI / 2);
    pl('cell', R, '#ffd8a0', 1.6, 7, 0.4, 2.4, 3.2);
  }

  // distant world for exteriors
  const rt = P.rng(44);
  for (let i = 0; i < 12; i++) { const a = rt() * Math.PI * 2, d = 420 + rt() * 160; const h = add(new THREE.SphereGeometry(60 + rt() * 50, 16, 10), toon({ color: i % 2 ? '#7a9ab0' : '#8aa8bc' }), 130 + Math.cos(a) * d, -10, Math.sin(a) * d, world, NC); h.scale.y = 0.5; }
  addClouds(12, 77, 520, 140);
};

// ---------- dynamic canvas painters ----------
const hashKey = (o) => JSON.stringify(o);
const drawCharInto = (T, g, spec, opts, x, y, k, gray = false) => {
  if (!gray) { g.save(); g.translate(x, y); g.scale(k, k); T.toonChar({ g }, spec, opts); g.restore(); return; }
  const W = g.canvas.width, H = g.canvas.height, [c2, g2] = cv(W, H); const m = g.getTransform(); g2.setTransform(m); g2.translate(x, y); g2.scale(k, k); T.toonChar({ g: g2 }, spec, opts);
  const id = g2.getImageData(0, 0, W, H), d = id.data; for (let i = 0; i < d.length; i += 4) { const l = Math.min(255, Math.max(0, (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] - 128) * 1.15 + 128)); d[i] = d[i + 1] = d[i + 2] = l; } g2.putImageData(id, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c2, 0, 0); g.restore(); };
const cctvOverlay = (g, w, h, f, dot = true) => { const r = (n) => { let s = (n * 9301 + 49297) % 233280; return s / 233280; };
  g.save(); g.globalAlpha = 0.18; for (let y = 0; y < h; y += 4) { g.fillStyle = '#000'; g.fillRect(0, y, w, 2); } g.globalAlpha = 1;
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${r(i + f * 31) * 0.18})`; g.fillRect(r(i * 3 + f) * w, r(i * 7 + f * 3) * h, 2, 2); }
  const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  if (dot && (f % 30) < 18) { g.fillStyle = '#ff2a1a'; g.beginPath(); g.arc(w * 0.09, h * 0.1, Math.min(w, h) * 0.035, 0, 7); g.fill(); }
  g.restore(); };
export const paintCctv = (T, g, w, h, f, opts = {}) => { // grayscale security-camera view of the grinning man (used on TV, photos)
  g.save(); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#b8b8b8'); gr.addColorStop(1, '#787878'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a7a7a'; for (let i = 0; i < 6; i++) g.fillRect(i * w / 6 + 4, h * 0.82, w / 6 - 8, h * 0.18); g.restore();
  const k = (opts.k || 1) * h / 620; drawCharInto(T, g, T.LEMONMAN, { expr: opts.expr || 'sly', R: opts.wave ? 'wave' : 'hang', L: 'hang', wet: 0.7, look: 0 }, w / 2 - 300 * k, h * (opts.y ?? 0.1) - 120 * k, k, true);
  cctvOverlay(g, w, h, f, opts.dot !== false); };
export const update = (ctx, W, f) => {
  const { T } = ctx;
  for (const [k, l] of Object.entries(S.lights)) l.visible = !!(W.lights && W.lights.includes(k));
  if (S.recM) S.recM.emissiveIntensity = (f % 24) < 14 ? 3 : 0.05;
  if (W.secTilt !== undefined) S.secHead.rotation.x = W.secTilt;
  // bank doors
  const bd = W.bankDoor || 0; S.bankDoor[0].rotation.y = -bd * 1.3; S.bankDoor[1].rotation.y = bd * 1.3;
  // porch door
  S.porchDoor.rotation.y = (W.porchDoor || 0) * 1.6;
  // tripod head tilt + flash
  S.camHead.rotation.set(-(W.camTilt ?? 0), W.camYaw ?? 0.45, 0, 'YXZ'); S.flashM.emissiveIntensity = W.camFlash ? 6 : 0.2;
  // paper pivot (lift over candle)
  const pu = W.paperLift || 0; S.paperPivot.position.set(-0.05 + pu * 0.55, 0.815 + pu * 0.5, 0.42 - pu * 0.2); S.paperPivot.rotation.set(pu * 1.28, 0, 0);
  // brush
  if (W.brush) { S.brush.visible = true; S.brush.position.set(...W.brush.p); S.brush.rotation.set(W.brush.rx || 0, 0, W.brush.rz ?? -0.5); } else S.brush.visible = false;
  // secret paper canvas
  { const P_ = W.paperS || { write: 0, wet: 0, reveal: 0 }; const key = hashKey(P_);
    if (S.paper.key !== key) { S.paper.key = key; const { g, c } = S.paper, w = c.width, h = c.height;
      g.fillStyle = '#fbf3dc'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(160,130,90,.25)'; g.lineWidth = 3; g.strokeRect(10, 10, w - 20, h - 20);
      const word = 'Geheim'; g.font = `italic 900 190px ${'"DejaVu Serif", serif'}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const tw = g.measureText(word).width, x0 = w / 2 - tw / 2;
      if (P_.write > 0 && P_.wet > 0) { g.save(); g.beginPath(); g.rect(0, 0, x0 + tw * P_.write, h); g.clip(); g.globalAlpha = P_.wet; g.fillStyle = 'rgba(232,206,120,0.55)'; g.fillText(word, w / 2, h / 2 + 10); g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 3; g.strokeText(word, w / 2 - 3, h / 2 + 6); g.restore(); }
      if (P_.reveal > 0) { const [tc, tg] = cv(w, h); tg.font = g.font; tg.textAlign = 'center'; tg.textBaseline = 'middle';
        const sc = tg.createRadialGradient(w / 2, h * 0.9, 10, w / 2, h * 0.9, 120 + P_.reveal * 520); sc.addColorStop(0, 'rgba(150,80,20,0.45)'); sc.addColorStop(1, 'rgba(150,80,20,0)'); g.fillStyle = sc; g.fillRect(0, 0, w, h);
        tg.fillStyle = '#6a3a12'; tg.fillText(word, w / 2, h / 2 + 10); tg.globalCompositeOperation = 'destination-in';
        const m = tg.createRadialGradient(w / 2, h * 0.9, 0, w / 2, h * 0.9, 60 + P_.reveal * 560); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(0.75, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)'); tg.fillStyle = m; tg.fillRect(0, 0, w, h);
        g.drawImage(tc, 0, 0); }
      S.paper.t.needsUpdate = true; } }
  // kitchen mirror reflection
  { const M_ = W.mirrorK || { expr: 'neutral' }; const key = hashKey(M_);
    if (S.mirrorK.key !== key) { S.mirrorK.key = key; const { g, c } = S.mirrorK, w = c.width, h = c.height;
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f2e2c4'); gr.addColorStop(1, '#d8c0a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      if (!M_.empty) drawCharInto(T, g, T.LEMONMAN, { expr: M_.expr, turn: M_.turn || 0, look: M_.look || 0, wet: M_.wet || 0 }, w / 2 - 300 * 0.95, 30 - 70, 0.95);
      const sh = g.createLinearGradient(0, 0, w, h); sh.addColorStop(0, 'rgba(255,255,255,0.0)'); sh.addColorStop(0.35, 'rgba(255,255,255,0.32)'); sh.addColorStop(0.42, 'rgba(255,255,255,0.0)'); sh.addColorStop(0.6, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.66, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(0, 0, w, h);
      S.mirrorK.t.needsUpdate = true; } }
  // TV screen
  { const V = W.tv || { mode: 'off' }; const key = hashKey({ ...V, ff: V.mode === 'off' ? 0 : f });
    if (S.tvScr.key !== key) { S.tvScr.key = key; const { g, c } = S.tvScr, w = c.width, h = c.height;
      if (V.mode === 'off') { g.fillStyle = '#1e2422'; g.fillRect(0, 0, w, h); }
      else if (V.mode === 'news') {
        const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1a3a7a'); gr.addColorStop(1, '#0a1a40'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(120,170,255,0.25)'; g.lineWidth = 3; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(160, 420, 60 + i * 50, -1.2, 0.2); g.stroke(); }
        drawCharInto(T, g, T.ANCHOR, { expr: 'stern', blink: (f % 70) < 3 ? 1 : 0, L: 'hang', R: 'hang' }, 20, 80, 0.62);
        g.fillStyle = '#3a4a6a'; g.fillRect(0, 430, w, 30); // desk
        // CCTV inset
        const iw = 380, ih = 290, ix = 390, iy = 60; g.save(); g.translate(ix, iy); g.beginPath(); g.rect(0, 0, iw, ih); g.clip(); paintCctv(T, g, iw, ih, f, { k: 1.25 * (V.zoom || 1), y: 0.12 }); g.restore();
        g.strokeStyle = '#f2f2f2'; g.lineWidth = 8; g.strokeRect(ix, iy, iw, ih);
        // lower third: "Eilmeldung"
        g.fillStyle = '#d8141e'; g.fillRect(0, 468, w, 82); g.fillStyle = '#ffffff'; g.font = `900 64px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Eilmeldung', 34, 511);
        g.fillStyle = '#0a1840'; g.fillRect(0, 550, w, 50); g.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 9; i++) g.fillRect(((i * 120 - f * 9) % (w + 120) + w + 120) % (w + 120) - 120, 570, 80, 10);
      } else if (V.mode === 'face') {
        paintCctv(T, g, w, 468, f, { k: 1.25 * (V.zoom || 1), y: 0.04 });
        g.fillStyle = '#d8141e'; g.fillRect(0, 468, w, 82); g.fillStyle = '#ffffff'; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Eilmeldung', w / 2, 511);
        g.fillStyle = '#0a1840'; g.fillRect(0, 550, w, 50);
      }
      if (V.mode !== 'off') { g.globalAlpha = 0.12; for (let y = 0; y < h; y += 4) { g.fillStyle = '#000'; g.fillRect(0, y, w, 2); } g.globalAlpha = 1; }
      const gl = g.createLinearGradient(0, 0, w, h); gl.addColorStop(0, 'rgba(255,255,255,0.16)'); gl.addColorStop(0.3, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
      const vg = g.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, w * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
      S.tvScr.t.needsUpdate = true; } }
  // interrogation photos
  if (S.photoTex.key === '') { S.photoTex.key = 'x'; const { g, c } = S.photoTex; g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, c.width, c.height); g.save(); g.translate(20, 20); g.beginPath(); g.rect(0, 0, 360, 380); g.clip(); paintCctv(T, g, 360, 380, 5, { k: 1.4, y: 0.05 }); g.restore(); S.photoTex.t.needsUpdate = true; }
  const PH = W.photos || [[0, 0, 0], [0.3, 0.1, 0.2], [-0.3, 0.05, -0.2]];
  S.photos.forEach((m, i) => { const p = PH[i] || PH[0]; m.position.x = p[0]; m.position.z = p[1]; m.rotation.z = p[2]; m.visible = !W.noPhotos; });
  // newspaper
  if (S.newsTex.key === '') { S.newsTex.key = 'x'; const { g, c } = S.newsTex, w = c.width, h = c.height;
    g.fillStyle = '#f2ecdc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1a1416'; g.lineWidth = 6; g.beginPath(); g.moveTo(30, 40); g.lineTo(w - 30, 40); g.moveTo(30, 54); g.lineTo(w - 30, 54); g.stroke();
    g.fillStyle = '#1a1416'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 108px ${'"Liberation Serif", "DejaVu Serif", serif'}`; g.fillText('Zitronen-Räuber', w / 2, 140); g.fillText('gefasst', w / 2, 255);
    g.lineWidth = 4; g.beginPath(); g.moveTo(30, 320); g.lineTo(w - 30, 320); g.stroke();
    g.save(); g.translate(60, 350); g.beginPath(); g.rect(0, 0, 440, 470); g.clip(); paintCctv(T, g, 440, 470, 3, { k: 1.4, y: 0.06, dot: false }); g.restore(); g.strokeRect(60, 350, 440, 470);
    g.fillStyle = 'rgba(40,40,40,0.55)'; for (let i = 0; i < 16; i++) g.fillRect(530, 360 + i * 28, 270 - (i % 5 === 4 ? 90 : 0), 10); for (let i = 0; i < 11; i++) for (const x of [60, 450]) g.fillRect(x, 850 + i * 28, 350 - (i % 4 === 3 ? 120 : 0), 10);
    S.newsTex.t.needsUpdate = true; }
  if (W.news) { S.news.visible = true; S.news.position.set(...W.news.p); S.news.rotation.set(W.news.rx || 0, W.news.ry || 0, W.news.rz || 0); } else S.news.visible = false;
  // hero mirror
  { const Hh = W.hero || { t: 0 }; const key = hashKey({ t: Math.round(Hh.t * 30) });
    if (S.heroTex.key !== key) { S.heroTex.key = key; const { g, c } = S.heroTex, w = c.width, h = c.height;
      const gr = g.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h * 0.4, h * 0.7); gr.addColorStop(0, '#fff6c8'); gr.addColorStop(0.4, '#ffb84a'); gr.addColorStop(1, '#c8402a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.save(); g.translate(w / 2, h * 0.4); g.rotate(Hh.t * 0.6); g.fillStyle = 'rgba(255,255,255,0.22)'; for (let i = 0; i < 14; i++) { g.rotate(Math.PI / 7); g.beginPath(); g.moveTo(0, 0); g.lineTo(-60, -900); g.lineTo(60, -900); g.fill(); } g.restore();
      drawCharInto(T, g, T.HERO, { expr: 'hero', L: 'hip', R: 'up', headTilt: -4 }, w / 2 - 300 * 0.98, 70, 0.98);
      for (let i = 0; i < 7; i++) { const a = i * 0.9 + Hh.t * 3, x = w / 2 + Math.cos(a) * 230, y = h * 0.45 + Math.sin(a * 1.3) * 380, s = 14 + 10 * Math.sin(Hh.t * 8 + i); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x, y - s * 2); g.lineTo(x + s * 0.4, y - s * 0.4); g.lineTo(x + s * 2, y); g.lineTo(x + s * 0.4, y + s * 0.4); g.lineTo(x, y + s * 2); g.lineTo(x - s * 0.4, y + s * 0.4); g.lineTo(x - s * 2, y); g.lineTo(x - s * 0.4, y - s * 0.4); g.fill(); }
      const sh = g.createLinearGradient(0, 0, w, h); sh.addColorStop(0.3, 'rgba(255,255,255,0)'); sh.addColorStop(0.38, 'rgba(255,255,255,0.3)'); sh.addColorStop(0.44, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(0, 0, w, h);
      S.heroTex.t.needsUpdate = true; } }
};
