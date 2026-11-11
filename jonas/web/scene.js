// scene.js — all locations of "Der Letzte" (each designed once, reused everywhere).
// Sets live far apart and are toggled by W.set:  shop(+street) @0 · lab @500 · home @1000 · void @1500 · space @2000
import * as C from './chars.js';
let S = {};
export const OFF = { shop: 0, lab: 500, home: 1000, void: 1500, space: 2000 };
const FONT = '"DejaVu Sans", sans-serif';
export const build = (ctx) => {
  const { THREE, P, T, world, add, tbox, toon, texM, canvasTex } = ctx;
  S.ctx = ctx; S.sprites = []; S.dyn = []; TT = T;
  const G = {}; for (const k in OFF) { G[k] = new THREE.Group(); G[k].position.x = OFF[k]; world.add(G[k]); } S.G = G;
  const nd = (m) => { m.userData.nd = ctx.cardNd(m.material.map); return m; };
  const flat = (tex, w, h, x, y, z, parent, ry = 0, opts = {}) => { const m = add(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: !!opts.transparent, alphaTest: opts.transparent ? 0.3 : 0, side: THREE.DoubleSide, fog: opts.fog ?? true }), x, y, z, parent, { cast: false }); m.rotation.y = ry; nd(m); return m; };
  const dynTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; const o = { c, g: c.getContext('2d'), t, key: null, draw }; o.set = (key, ...a) => { if (key === o.key) return; o.key = key; draw(o.g, w, h, key, ...a); t.needsUpdate = true; }; return o; };
  const col = (c, o = {}) => toon({ color: c, ...o });
  const glowM = (c, k = 1.4) => toon({ color: c, emissive: c, emissiveIntensity: k });
  const cyl = (rt, rb, h, n = 16) => new THREE.CylinderGeometry(rt, rb, h, n);
  const sph = (r, a = 16, b = 12) => new THREE.SphereGeometry(r, a, b);
  /** character sprite (pre-drawn toon card; no redraw) */
  const spriteTex = (list, w = 300, h = 500) => canvasTex(w * list.length, h, (g) => { list.forEach(([spec, o], i) => { g.save(); g.translate(i * w, 0); g.scale(w / 600, h / 1000); T.toonChar(new T.Pen(g), spec, o); g.restore(); }); });
  const sprite = (tex, n, x, y, z, parent, s = 0.82, tag = '') => {
    const m = add(new THREE.PlaneGeometry(1.35 * n * s, 2.25 * s), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }), x, y + 2.25 * s / 2 - 0.05 * s, z, parent, { cast: false });
    m.userData.nd = ctx.cardNd(tex); m.userData.tag = tag; m.userData.base = m.position.clone(); S.sprites.push(m); return m;
  };
  S.sprite = sprite; S.spriteTex = spriteTex;
  const M = {
    tile: texM(canvasTex(256, 256, (g, w) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#e9e2d2' : '#c9b89c'; g.fillRect(i * 64, j * 64, 64, 64); } g.strokeStyle = '#9a8a72'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); } }).image, 6, 6),
    wallTile: texM(canvasTex(256, 256, (g) => { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#c8c2b4'; g.lineWidth = 3; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 256); g.moveTo(0, i * 32); g.lineTo(256, i * 32); g.stroke(); } }).image, 8, 3),
    redWall: col('#c8463a'), steel: col('#a8b0ba'), steelD: col('#6c747e'), dark: col('#2a2a32'), black: col('#18181e'), wood: texM(P.planks(3), 1, 2), woodD: col('#6e4528'),
    plasterW: texM(P.plaster(8, 40), 3, 2, '#fbf6ea'), asphalt: texM(canvasTex(256, 256, (g) => { g.fillStyle = '#4a4a52'; g.fillRect(0, 0, 256, 256); const r = P.rng(3); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},255,0.06)`; g.fillRect(r() * 256, r() * 256, 2, 2); } }).image, 40, 40),
    side: texM(P.stone(21, 30, 6, 72, 64, 64), 30, 30), glass: new THREE.MeshToonMaterial({ gradientMap: ctx.grad, color: '#9fd0ea', transparent: true, opacity: 0.28 }),
    cold: col('#cfe4f2'), frost: col('#eef8ff'), meat: texM(canvasTex(128, 256, (g) => { for (let y = 0; y < 256; y += 8) { g.fillStyle = y % 16 ? '#a8582e' : '#c87a3e'; g.fillRect(0, y, 128, 8); } const r = P.rng(5); for (let i = 0; i < 300; i++) { g.fillStyle = r() > 0.5 ? '#7a3a1e' : '#e0a060'; g.fillRect(r() * 128, r() * 256, 4, 3); } }).image, 1, 1),
    heat: glowM('#ff8a3a', 1.2), lamp: glowM('#fff6dc', 1.6), white: col('#f8f8f6'), tire: col('#1e1e22'),
  };
  S.M = M;
  ctx.addClouds(14, 90, 650, 110);
  // ======================================================================= SHOP + STREET
  { const g = G.shop;
    const floor = add(new THREE.PlaneGeometry(10, 8), M.tile, 0, 0.01, 0, g, { cast: false }); floor.rotation.x = -Math.PI / 2;
    // walls (no shadow casting: the sun is our key light inside)
    const wall = (w, h, x, y, z, ry, m = M.wallTile) => { const o = add(tbox(w, h, 0.2, 2), m, x, y, z, g, { cast: false }); o.rotation.y = ry; return o; };
    wall(3.3, 3.2, 3.35, 1.6, -4); wall(1.4, 3.2, -4.3, 1.6, -4); wall(1.6, 1.0, -2.8, 2.7, -4); wall(3.7, 3.2, -0.15, 1.6, -4); // back wall w/ cold room opening x[-3.6,-2.0]
    wall(8, 3.2, -5, 1.6, 0, Math.PI / 2, M.redWall); wall(8, 3.2, 5, 1.6, 0, Math.PI / 2, M.redWall);
    const ceil = add(new THREE.PlaneGeometry(10.4, 8.4), col('#efe9dc'), 0, 3.2, 0, g, { cast: false }); ceil.rotation.x = Math.PI / 2;
    for (const x of [-2.5, 1, 3.5]) add(tbox(1.6, 0.08, 0.25, 1), M.lamp, x, 3.12, 0, g, { cast: false });
    // storefront z=4: glass + frames + door
    add(tbox(10.2, 0.6, 0.25, 1), M.redWall, 0, 0.3, 4, g, { cast: false }); add(tbox(10.2, 0.5, 0.25, 1), M.redWall, 0, 2.95, 4, g, { cast: false });
    for (const x of [-5, -2, 1.9, 3.3, 5]) add(tbox(0.14, 2.4, 0.2, 1), M.steelD, x, 1.8, 4, g, { cast: false });
    for (const [x0, x1] of [[-5, -2], [-2, 1.9], [3.3, 5]]) { const gl = add(new THREE.PlaneGeometry(x1 - x0, 2.1), M.glass, (x0 + x1) / 2, 1.65, 4.02, g, { cast: false }); gl.userData.ndSkip = true; }
    // window lettering (German, readable from the street)
    const wl = canvasTex(1024, 256, (c, w, h) => { c.font = `bold 120px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffd23a'; c.strokeStyle = '#8a1a14'; c.lineWidth = 10; c.strokeText('Döner · Dürüm', w / 2, h / 2); c.fillText('Döner · Dürüm', w / 2, h / 2); });
    flat(wl, 2.6, 0.65, -0.05, 2.35, 4.06, g, 0, { transparent: true });
    // shop door (glass), opening: x[1.9,3.3]
    S.shopDoor = new THREE.Group(); S.shopDoor.position.set(1.95, 0, 4); g.add(S.shopDoor);
    add(tbox(1.3, 2.3, 0.08, 1), M.glass, 0.65, 1.15, 0, S.shopDoor, { cast: false }).userData.ndSkip = true; add(tbox(1.3, 0.12, 0.1, 1), M.steelD, 0.65, 2.3, 0, S.shopDoor); add(tbox(0.1, 2.3, 0.1, 1), M.steelD, 0, 1.15, 0, S.shopDoor); add(tbox(0.1, 2.3, 0.1, 1), M.steelD, 1.3, 1.15, 0, S.shopDoor);
    // facade above and around
    add(tbox(14.4, 6, 0.4, 2), texM(P.plaster(18, 20), 3, 2, '#e8c8a0'), 0, 6.2, 4.2, g, { cast: false });
    for (const sx of [-1, 1]) add(tbox(2.2, 3.2, 0.4, 2), texM(P.plaster(18, 20), 1, 1, '#e8c8a0'), sx * 6.1, 1.6, 4.2, g, { cast: false });
    const signT = canvasTex(1600, 320, (c, w, h) => { c.fillStyle = '#c8202a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23a'; c.fillRect(0, 0, w, 22); c.fillRect(0, h - 22, w, 22);
      c.font = `bold 200px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 16; c.strokeStyle = '#5a0a0a'; c.strokeText('Alis Döner', w / 2, h / 2 + 10); c.fillStyle = '#fff6dc'; c.fillText('Alis Döner', w / 2, h / 2 + 10); });
    add(tbox(7.4, 1.5, 0.3, 1), M.dark, 0, 3.85, 4.42, g); flat(signT, 7.2, 1.38, 0, 3.85, 4.6, g);
    S.signGlow = add(tbox(7.6, 0.06, 0.06, 1), glowM('#ffd23a', 1.5), 0, 3.05, 4.6, g, { cast: false });
    // menu board on the back wall
    const menu = canvasTex(1400, 420, (c, w, h) => { c.fillStyle = '#1e1a1c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffd23a'; c.lineWidth = 12; c.strokeRect(8, 8, w - 16, h - 16);
      c.fillStyle = '#ffd23a'; c.font = `bold 64px ${FONT}`; c.textAlign = 'center'; c.fillText('Speisekarte', w / 2, 82);
      const items = [['Döner', '5,50 €'], ['Dürüm', '6,50 €'], ['Lahmacun', '4,00 €'], ['Pommes', '3,00 €'], ['Ayran', '1,50 €'], ['Cola', '2,00 €']];
      c.font = `bold 52px ${FONT}`; items.forEach(([a, b], i) => { const x = i < 3 ? 80 : 760, y = 170 + (i % 3) * 82; c.textAlign = 'left'; c.fillStyle = '#ffffff'; c.fillText(a, x, y); c.textAlign = 'right'; c.fillStyle = '#ff9a3a'; c.fillText(b, x + 560, y); }); });
    flat(menu, 3.6, 1.08, 2.0, 2.45, -3.88, g);
    // counter with glass display
    add(tbox(4.6, 0.9, 0.85, 1), M.wood, 1.25, 0.45, -0.6, g); add(tbox(4.8, 0.08, 1.0, 1), M.steel, 1.25, 0.94, -0.6, g);
    const disp = add(tbox(3.2, 0.36, 0.6, 1), M.glass, 1.0, 1.16, -0.55, g); disp.userData.ndSkip = true;
    [['#4ab040', 0], ['#e04a3a', 1], ['#f0e0b0', 2], ['#8a4ab0', 3], ['#f0c030', 4]].forEach(([c_, i]) => { const b = add(cyl(0.2, 0.16, 0.12), col(c_), -0.2 + i * 0.55, 1.04, -0.55, g); });
    // stools at the counter (customer side)
    S.stools = []; for (const x of [0.4, 1.6, 2.8]) { add(cyl(0.05, 0.08, 0.75, 8), M.steelD, x, 0.38, 0.25, g); S.stools.push(add(cyl(0.25, 0.25, 0.08, 16), col('#c8202a'), x, 0.78, 0.25, g)); }
    // tables
    for (const x of [-3.6, -1.4]) { add(tbox(1.0, 0.06, 0.8, 1), M.woodD, x, 0.76, 2.6, g); add(cyl(0.05, 0.05, 0.74, 8), M.steelD, x, 0.38, 2.6, g); for (const dz of [-0.7, 0.7]) { add(cyl(0.2, 0.2, 0.06, 12), col('#e0a030'), x, 0.48, 2.6 + dz, g); add(cyl(0.04, 0.04, 0.46, 6), M.steelD, x, 0.24, 2.6 + dz, g); } }
    // döner spit + heater
    S.spit = new THREE.Group(); S.spit.position.set(0.0, 0, -2.75); g.add(S.spit);
    add(cyl(0.025, 0.025, 1.6, 6), M.steel, 0, 1.45, 0, S.spit); const cone = add(cyl(0.36, 0.22, 0.95, 18), M.meat, 0, 1.45, 0, S.spit); S.spitCone = cone;
    add(tbox(0.7, 0.04, 0.7, 1), M.steel, 0, 0.92, 0, S.spit); add(tbox(0.7, 0.06, 0.7, 1), M.steel, 0, 2.06, 0, S.spit);
    add(tbox(0.9, 1.2, 0.12, 1), M.steelD, 0, 1.45, -0.55, S.spit); add(tbox(0.7, 0.95, 0.04, 1), M.heat, 0, 1.45, -0.48, S.spit, { cast: false });
    add(tbox(1.6, 0.92, 0.7, 1), M.steel, 0.2, 0.46, -2.85, g); // grill cabinet
    // Ali's apron + glasses on the floor (Tag 1)
    S.aliStuff = new THREE.Group(); g.add(S.aliStuff); S.aliStuff.position.set(1.4, 0.02, -1.75);
    const apT = canvasTex(400, 400, (c) => { c.fillStyle = '#fbfbf6'; c.beginPath(); c.moveTo(80, 30); c.lineTo(320, 50); c.lineTo(370, 330); c.quadraticCurveTo(200, 390, 40, 340); c.closePath(); c.fill(); c.strokeStyle = '#1a1416'; c.lineWidth = 10; c.stroke(); c.strokeStyle = '#c8c8d0'; c.lineWidth = 6; c.beginPath(); c.moveTo(100, 200); c.quadraticCurveTo(200, 230, 330, 190); c.stroke(); c.beginPath(); c.moveTo(80, 30); c.quadraticCurveTo(10, -10, 30, 90); c.stroke(); });
    const ap = flat(apT, 0.9, 0.9, 0, 0.005, 0, S.aliStuff, 0, { transparent: true }); ap.rotation.x = -Math.PI / 2; ap.rotation.z = 0.4;
    for (const dx of [-0.07, 0.07]) { const r = add(new THREE.TorusGeometry(0.055, 0.012, 6, 16), M.black, 0.6 + dx, 0.02, 0.15, S.aliStuff); r.rotation.x = -Math.PI / 2; }
    add(tbox(0.06, 0.015, 0.015, 1), M.black, 0.6, 0.02, 0.15, S.aliStuff);
    // cold room: x[-4.4,-1.2] z[-8,-4]
    const cr = (w, h, d, x, y, z) => add(tbox(w, h, d, 1), M.cold, x, y, z, g, { cast: false });
    cr(0.2, 3.2, 4, -4.5, 1.6, -6); cr(0.2, 3.2, 4, -1.1, 1.6, -6); cr(3.6, 3.2, 0.2, -2.8, 1.6, -8.05); const crf = add(new THREE.PlaneGeometry(3.4, 4), M.frost, -2.8, 0.02, -6, g, { cast: false }); crf.rotation.x = -Math.PI / 2;
    const crc = add(new THREE.PlaneGeometry(3.4, 4), M.cold, -2.8, 3.2, -6, g, { cast: false }); crc.rotation.x = Math.PI / 2;
    add(tbox(3.2, 0.06, 0.06, 1), glowM('#bfe6ff', 1.2), -2.8, 3.12, -6, g, { cast: false });
    // hanging spits on a rail + stacked boxes
    add(tbox(0.06, 0.06, 3.6, 1), M.steelD, -4.0, 2.7, -6, g); add(tbox(0.06, 0.06, 3.6, 1), M.steelD, -1.6, 2.7, -6, g);
    for (const x of [-4.0, -1.6]) for (let k = 0; k < 4; k++) { add(cyl(0.012, 0.012, 0.5, 4), M.steel, x, 2.45, -7.4 + k * 0.85, g); add(cyl(0.3, 0.2, 0.9, 14), M.meat, x, 1.75, -7.4 + k * 0.85, g); }
    for (let k = 0; k < 3; k++) add(tbox(0.6, 0.4, 0.5, 1), col('#e8dcc0'), -2.0 - k * 0.15, 0.2 + k * 0.4, -7.6, g);
    add(tbox(0.8, 0.45, 0.5, 1), col('#e8dcc0'), -2.95, 0.225, -7.55, g);
    // frost crystals
    { const r = P.rng(9); for (let i = 0; i < 40; i++) { const s_ = add(sph(0.03 + r() * 0.04, 6, 4), M.frost, -4.38 + (i % 2) * 3.16, 0.3 + r() * 2.8, -7.8 + r() * 3.6, g, { cast: false }); } }
    // the steel door (hinge at x=-3.6, z=-4.0)
    S.door = new THREE.Group(); S.door.position.set(-3.6, 0, -3.9); g.add(S.door);
    add(tbox(1.6, 2.2, 0.28, 1), M.steel, 0.8, 1.1, 0, S.door); add(tbox(1.4, 2.0, 0.04, 1), col('#b8c0ca'), 0.8, 1.1, 0.16, S.door);
    for (const y of [0.4, 1.8]) add(tbox(0.3, 0.14, 0.1, 1), M.steelD, 0.12, y, 0.18, S.door);
    add(tbox(0.12, 0.6, 0.12, 1), M.dark, 1.42, 1.1, 0.26, S.door); add(tbox(0.3, 0.08, 0.12, 1), M.dark, 1.32, 1.42, 0.26, S.door);
    add(tbox(0.12, 2.3, 0.4, 1), M.steelD, -3.6 - 0.02 + 0, 1.15, -4.0, g); add(tbox(0.12, 2.3, 0.4, 1), M.steelD, -2.0, 1.15, -4.0, g); add(tbox(1.72, 0.12, 0.4, 1), M.steelD, -2.8, 2.26, -4.0, g);
    const kr = canvasTex(700, 180, (c, w, h) => { c.fillStyle = '#d8dee6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#3a4250'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10); c.fillStyle = '#1e5aa8'; c.font = `bold 100px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Kühlraum', w / 2, h / 2 + 4); });
    flat(kr, 1.2, 0.31, -2.8, 2.5, -3.88, g);
    // "Hier schläft ein Held" sign (finale)
    const held = canvasTex(1100, 240, (c, w, h) => { c.fillStyle = '#6a3a1e'; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 30); c.fill(); c.strokeStyle = '#ffd23a'; c.lineWidth = 10; c.beginPath(); c.roundRect(22, 22, w - 44, h - 44, 20); c.stroke(); c.fillStyle = '#fff2c8'; c.font = `bold 92px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Hier schläft ein Held', w / 2, h / 2 + 4); });
    S.heroSign = flat(held, 1.9, 0.42, -2.8, 2.95, -3.86, g);
    // hook with coiled steel rope
    S.hook = new THREE.Group(); S.hook.position.set(-1.45, 1.7, -3.86); g.add(S.hook); add(tbox(0.08, 0.2, 0.1, 1), M.dark, 0, 0.25, 0, S.hook);
    S.coil = add(new THREE.TorusGeometry(0.22, 0.05, 8, 24), M.steel, 0, 0, 0.05, S.hook);
    // wall clock (digital) above the counter
    S.clock = dynTex(400, 160, (c, w, h, txt) => { c.fillStyle = '#121216'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff3a2a'; c.font = `bold 120px "DejaVu Sans Mono", monospace`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 6); });
    S.clock.set('2:58'); add(tbox(0.78, 0.34, 0.08, 1), M.dark, -0.7, 2.6, -3.9, g); flat(S.clock.t, 0.7, 0.28, -0.7, 2.6, -3.85, g);
    S.clockC = dynTex(400, 160, S.clock.draw); S.clockC.set('3:14'); add(tbox(0.6, 0.27, 0.08, 1), M.dark, -2.8, 2.9, -7.94, g); flat(S.clockC.t, 0.54, 0.22, -2.8, 2.9, -7.89, g); // clock inside the cold room
    // TV over the counter
    S.tv = dynTex(960, 540, (c, w, h, k) => drawTV(c, w, h, k)); S.tv.set('off');
    const tvG = new THREE.Group(); tvG.position.set(4.0, 2.45, -2.6); tvG.rotation.y = -0.75; g.add(tvG);
    add(tbox(1.32, 0.78, 0.1, 1), M.black, 0, 0, 0, tvG); flat(S.tv.t, 1.22, 0.69, 0, 0, 0.06, tvG); add(tbox(0.08, 0.5, 0.08, 1), M.dark, 0, 0.5, -0.1, tvG);
    // ===== street outside (z>4)
    const road = add(new THREE.PlaneGeometry(400, 9), M.asphalt, 0, 0.0, 11.5, g, { cast: false }); road.rotation.x = -Math.PI / 2;
    const road2 = add(new THREE.PlaneGeometry(9, 300), M.asphalt, 18, -0.005, 0, g, { cast: false }); road2.rotation.x = -Math.PI / 2;
    const lane = canvasTex(512, 32, (c, w, h) => { c.fillStyle = '#f2f0e6'; for (let x = 0; x < w; x += 128) c.fillRect(x, 8, 72, 16); });
    const ln_ = add(new THREE.PlaneGeometry(400, 0.18), new THREE.MeshBasicMaterial({ map: (() => { const t = lane.clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(100, 1); t.needsUpdate = true; return t; })(), transparent: true, alphaTest: 0.3 }), 0, 0.01, 11.5, g, { cast: false }); ln_.rotation.x = -Math.PI / 2; ln_.userData.ndSkip = true;
    // zebra crossing
    for (let k = 0; k < 8; k++) { const z_ = add(new THREE.PlaneGeometry(0.5, 3.4), M.white, 13.4, 0.012, 8.2 + k * 1.05, g, { cast: false }); z_.rotation.x = -Math.PI / 2; z_.rotation.z = Math.PI / 2; }
    const sw = (w, d, x, z) => add(tbox(w, 0.16, d, 2), M.side, x, 0.08, z, g, { cast: false });
    sw(400, 3, 0, 5.5); sw(400, 3, 0, 17.5);
    // buildings
    const rb = P.rng(77), facC = ['#e8c8a0', '#c8d8e8', '#e8b8a8', '#d8e0c0', '#f0e0c8', '#b8c8d8', '#e0c0d0'];
    const winT = canvasTex(256, 256, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#3a4a6a'; c.fillRect(60, 50, 136, 150); c.fillStyle = '#6a8ab8'; c.fillRect(70, 60, 56, 130); c.strokeStyle = '#f6f0e2'; c.lineWidth = 10; c.strokeRect(60, 50, 136, 150); c.beginPath(); c.moveTo(128, 50); c.lineTo(128, 200); c.stroke(); });
    const bld = (x, z, w, d, h, ry, ci) => { const B = new THREE.Group(); B.position.set(x, 0, z); B.rotation.y = ry; g.add(B);
      const t = winT.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(Math.round(w / 2.4), Math.round(h / 3)); t.needsUpdate = true;
      add(tbox(w, h, d, 2), toon({ map: t, color: facC[ci % facC.length] }), 0, h / 2, 0, B, { cast: false }); add(tbox(w + 0.4, 0.5, d + 0.4, 1), col('#7a6a60'), 0, h + 0.25, 0, B, { cast: false }); return B; };
    for (const [x, w] of [[-12, 9.6], [-22.5, 11], [-34, 11.5], [9.4, 4.2], [27, 9.5], [38, 11], [50, 12]]) bld(x, -2, w, 12, 10 + rb() * 8, 0, Math.floor(rb() * 7));
    for (let x = -40; x <= 60; x += 12) { if (Math.abs(x - 18) < 8) continue; bld(x, 26, 11.6, 14, 11 + rb() * 9, 0, Math.floor(rb() * 7)); }
    for (let z = -40; z < -10; z += 12) for (const x of [8, 28]) bld(x, z, 10, 11, 9 + rb() * 8, 0, Math.floor(rb() * 7));
    // street lamps
    S.lamps = []; for (let x = -30; x <= 40; x += 10) for (const z of [6.6, 16.4]) { add(cyl(0.06, 0.09, 5, 8), M.dark, x, 2.5, z, g); const l = add(tbox(0.6, 0.18, 0.3, 1), glowM('#fff0c0', 1.0), x, 5, z + (z < 10 ? 0.25 : -0.25), g); S.lamps.push(l); }
    // trees in pots
    for (const x of [-8, 7.5, 12]) { add(cyl(0.12, 0.16, 2.2, 8), col('#6a4a32'), x, 1.1, 6.8, g); const c = add(sph(1.1), col('#5aa040'), x, 2.8, 6.8, g); c.scale.y = 0.9; }
    // cars (doors open) + bus on the sidewalk
    const carCols = ['#d8343a', '#3a7ad8', '#f0c030', '#e8e8ec', '#3aa060', '#1e1e26', '#e87a2a'];
    const car = (x, z, ry, ci, open = true) => { const C_ = new THREE.Group(); C_.position.set(x, 0, z); C_.rotation.y = ry; g.add(C_); const m = col(carCols[ci % carCols.length]);
      add(tbox(3.9, 0.7, 1.75, 1), m, 0, 0.62, 0, C_); add(tbox(2.1, 0.08, 1.6, 1), m, -0.2, 1.6, 0, C_); for (const [px, pz] of [[-1.2, 0.76], [0.8, 0.76], [-1.2, -0.76], [0.8, -0.76]]) add(tbox(0.08, 0.62, 0.08, 1), m, px, 1.28, pz, C_);
      const gl_ = add(tbox(2.0, 0.6, 1.56, 1), M.glass, -0.2, 1.28, 0, C_, { cast: false }); gl_.userData.ndSkip = true;
      for (const sz of [-0.4, 0.4]) { add(tbox(0.5, 0.18, 0.5, 1), col('#3a3a44'), 0.1, 1.0, sz, C_); add(tbox(0.14, 0.6, 0.5, 1), col('#3a3a44'), -0.2, 1.3, sz, C_); }
      const sw_ = add(new THREE.TorusGeometry(0.16, 0.03, 6, 16), M.dark, 0.55, 1.25, 0.4, C_); sw_.rotation.y = Math.PI / 2;
      for (const [wx, wz] of [[-1.25, 0.85], [1.25, 0.85], [-1.25, -0.85], [1.25, -0.85]]) { const w = add(cyl(0.34, 0.34, 0.24, 14), M.tire, wx, 0.34, wz, C_); w.rotation.x = Math.PI / 2; }
      for (const sx of [-1.95, 1.95]) add(tbox(0.06, 0.16, 0.4, 1), glowM(sx > 0 ? '#fff6c8' : '#ff3a2a', 0.7), sx, 0.75, 0.6, C_); 
      if (open) { const d = new THREE.Group(); d.position.set(0.5, 0, 0.88); d.rotation.y = -1.0; C_.add(d); add(tbox(1.1, 0.95, 0.08, 1), m, -0.55, 0.85, 0, d); add(tbox(1.0, 0.45, 0.09, 1), col('#8ab8d8'), -0.55, 1.4, 0, d, { cast: false }); }
      return C_; };
    S.cars = [car(15.5, 9.5, 0.5, 0), car(20.5, 12.8, -1.2, 1), car(17.8, 4.6 + 6, 2.4, 2), car(22, 8.5, 1.9, 3), car(-6.5, 9.8, 0.05, 4), car(-14, 13, 3.1, 5), car(24, 13.6, -0.15, 6), car(30, 10, 0.1, 1, false), car(-24, 9.6, 0.2, 2)];
    S.bus = new THREE.Group(); S.bus.position.set(-3.0, 0.16, 16.4); S.bus.rotation.y = 0.32; g.add(S.bus);
    add(tbox(8.4, 2.6, 2.5, 2), col('#f0c030'), -0.8, 1.6, 0, S.bus); add(tbox(1.6, 0.9, 2.5, 1), col('#f0c030'), 4.2, 0.75, 0, S.bus); add(tbox(1.6, 0.2, 2.5, 1), col('#f0c030'), 4.2, 2.8, 0, S.bus); add(tbox(1.6, 1.7, 0.1, 1), col('#f0c030'), 4.2, 1.9, -1.2, S.bus); add(tbox(0.4, 0.5, 0.5, 1), col('#3a3a44'), 3.9, 1.45, -0.6, S.bus); add(tbox(7.6, 0.9, 2.56, 1), col('#3a5a7a'), -1.0, 2.0, 0, S.bus, { cast: false }); for (const sz of [-1.26, 1.26]) { const sg = add(tbox(1.5, 0.9, 0.04, 1), M.glass, 4.2, 2.0, sz, S.bus, { cast: false }); sg.userData.ndSkip = true; } const ws_ = add(tbox(0.1, 1.6, 2.2, 1), M.glass, 5.02, 1.9, 0, S.bus, { cast: false }); ws_.userData.ndSkip = true;
    for (const wx of [-3.4, 3.4]) for (const wz of [-1.2, 1.2]) { const w = add(cyl(0.5, 0.5, 0.3, 14), M.tire, wx, 0.5, wz, S.bus); w.rotation.x = Math.PI / 2; }
    S.busDriverSeat = new THREE.Vector3(4.2, 0.4, -0.6);
    // helicopter
    S.heli = new THREE.Group(); g.add(S.heli); S.heli.visible = false;
    { const h = S.heli, hc = col('#2e4a3a'); const body = add(sph(1.3, 20, 14), hc, 0, 1.4, 0, h); body.scale.set(1.6, 1, 1); const wnd = add(sph(1.0, 16, 10), col('#9fd0ea'), 1.3, 1.6, 0, h); wnd.scale.set(0.8, 0.75, 0.9);
      add(tbox(5, 0.35, 0.35, 1), hc, -3.6, 1.7, 0, h); add(tbox(0.2, 1.2, 0.6, 1), hc, -6, 2.1, 0, h); add(tbox(0.3, 0.3, 0.2, 1), M.dark, 0, 2.55, 0, h);
      for (const z of [-0.9, 0.9]) { add(tbox(3.6, 0.1, 0.1, 1), M.dark, 0, 0.05, z, h); for (const x of [-0.8, 0.8]) add(tbox(0.08, 0.5, 0.08, 1), M.dark, x, 0.3, z * 0.9, h); }
      S.rotor = new THREE.Group(); S.rotor.position.set(0, 2.7, 0); h.add(S.rotor); for (let k = 0; k < 4; k++) { const b = add(tbox(7, 0.04, 0.32, 1), M.black, 0, 0, 0, S.rotor); b.rotation.y = k * Math.PI / 4 * 2 / 2 + k * Math.PI / 4; }
      S.tailRotor = add(tbox(0.06, 1.4, 0.18, 1), M.black, -6, 2.1, 0.35, h); }
    // tanks + camera tripods + barrier (Tag 100)
    S.tanks = new THREE.Group(); g.add(S.tanks);
    for (const [x, z, ry] of [[-9, 12, 0.15], [11, 12.6, -0.2], [-21, 11.2, 0.05]]) { const t_ = new THREE.Group(); t_.position.set(x, 0, z); t_.rotation.y = ry; S.tanks.add(t_); const tc = col('#5a6a3a');
      add(tbox(6, 1.1, 3.2, 1), tc, 0, 0.95, 0, t_); for (const sz of [-1.45, 1.45]) add(tbox(6.2, 0.9, 0.6, 1), M.dark, 0, 0.5, sz, t_); const tur = add(tbox(2.6, 0.8, 2.2, 1), tc, -0.3, 1.9, 0, t_); const bar = add(cyl(0.12, 0.12, 3.6, 8), tc, 2.6, 1.95, 0, t_); bar.rotation.z = Math.PI / 2 + 0.06; }
    for (const [x, z] of [[-3.5, 7.6], [4.5, 7.8], [8.5, 8.4], [-7, 8.2]]) { const tp = new THREE.Group(); tp.position.set(x, 0, z); S.tanks.add(tp); for (let k = 0; k < 3; k++) { const l = add(cyl(0.025, 0.025, 1.6, 4), M.dark, Math.cos(k * 2.1) * 0.3, 0.75, Math.sin(k * 2.1) * 0.3, tp); l.rotation.set(Math.sin(k * 2.1) * 0.35, 0, -Math.cos(k * 2.1) * 0.35); } add(tbox(0.7, 0.42, 0.36, 1), M.dark, 0, 1.65, 0, tp).rotation.y = Math.PI / 2 + (x > 0 ? 0.4 : -0.4); add(tbox(0.3, 0.3, 0.3, 1), glowM('#ff3a2a', 1), 0, 1.92, 0, tp); }
    for (let x = -12; x <= 14; x += 2.2) { add(tbox(2.0, 0.12, 0.08, 1), col('#e8e8ec'), x, 0.9, 7.2, S.tanks); add(tbox(2.0, 0.12, 0.08, 1), col('#d8343a'), x, 0.7, 7.2, S.tanks); add(tbox(0.08, 1.0, 0.08, 1), M.dark, x - 1, 0.5, 7.2, S.tanks); }
    // big screen on the far building + posters + merch stand + toy box
    S.bigScreen = new THREE.Group(); S.bigScreen.position.set(6, 6, 18.9); S.bigScreen.rotation.y = Math.PI; g.add(S.bigScreen);
    S.faceTex = canvasTex(1280, 720, (c, w, h) => drawFaceAd(c, w, h, T, 'screen')); add(tbox(10.4, 6, 0.3, 1), M.black, 0, 0, 0.12, S.bigScreen); flat(S.faceTex, 10, 5.6, 0, 0, 0.3, S.bigScreen);
    const posterT = canvasTex(600, 840, (c, w, h) => drawFaceAd(c, w, h, T, 'poster'));
    S.posters = new THREE.Group(); g.add(S.posters); for (const x of [-9.2, -10.9, 8.2]) flat(posterT, 1.4, 1.96, x, 1.9, 4.43, S.posters);
    S.merch = new THREE.Group(); S.merch.position.set(-12, 0, 7.2); g.add(S.merch);
    add(tbox(3.2, 1.0, 1.0, 1), M.wood, 0, 0.5, 0, S.merch); for (const sx of [-1.5, 1.5]) add(cyl(0.05, 0.05, 2.6, 6), M.dark, sx, 1.3, -0.4, S.merch); add(tbox(3.3, 0.05, 0.05, 1), M.dark, 0, 2.4, -0.4, S.merch);
    const teeT = (c_) => canvasTex(400, 400, (c, w, h) => { c.fillStyle = c_; c.strokeStyle = '#1a1416'; c.lineWidth = 10; c.beginPath(); c.moveTo(120, 40); c.lineTo(160, 60); c.lineTo(240, 60); c.lineTo(280, 40); c.lineTo(380, 110); c.lineTo(330, 170); c.lineTo(300, 150); c.lineTo(300, 380); c.lineTo(100, 380); c.lineTo(100, 150); c.lineTo(70, 170); c.lineTo(20, 110); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = c_ === '#1e1e26' ? '#ffd23a' : '#1a1416'; c.font = `bold 44px ${FONT}`; c.textAlign = 'center'; c.fillText('Der', 200, 200); c.font = `bold 58px ${FONT}`; c.fillText('Letzte', 200, 262); });
    S.teeTex = teeT('#ffffff'); [['#ffffff', -1.0], ['#1e1e26', 0], ['#d8303a', 1.0]].forEach(([c_, x]) => flat(teeT(c_), 0.95, 0.95, x, 1.85, -0.38, S.merch, 0, { transparent: true }));
    S.toy = new THREE.Group(); S.toy.position.set(-16.6, 0, 6.7); S.toy.rotation.y = 0.35; g.add(S.toy); add(tbox(1.6, 1.0, 0.9, 1), col('#e8e0d0'), 0, 0.5, 0, S.toy);
    for (const sx of [-0.9, 0.9]) { add(cyl(0.02, 0.02, 1.2, 4), M.dark, sx, 2.6, 0, S.toy); const l = add(sph(0.22, 12, 8), glowM('#e8303a', 0.8), sx, 2.0, 0, S.toy); l.scale.y = 1.3; }
    S.toyTex = [1, 2].map((v) => canvasTex(500, 720, (c, w, h) => drawToyBox(c, w, h, T, v)));
    S.toyBox = flat(S.toyTex[0], 0.8, 1.15, 0, 1.58, 0.1, S.toy);
    // medal stage (finale)
    S.stage = new THREE.Group(); S.stage.position.set(0, 0, 9.5); g.add(S.stage); add(tbox(6, 0.5, 3, 1), col('#2a3a6a'), 0, 0.25, 0, S.stage); add(tbox(0.8, 1.2, 0.5, 1), M.woodD, 1.6, 1.1, 0.6, S.stage);
    for (const [x, c_] of [[-2.6, ['#1a1a1a', '#d8202a', '#f0c020']], [2.6, ['#1a1a1a', '#d8202a', '#f0c020']]]) { add(cyl(0.04, 0.04, 3.5, 6), M.steel, x, 1.75, -1.2, S.stage); c_.forEach((cc, i) => add(tbox(0.04, 0.3, 1.0, 1), col(cc), x + 0.05, 3.2 - i * 0.3, -0.7, S.stage)); }
  }
  // ======================================================================= LAB (Berlin, underground)
  { const g = G.lab;
    const fl = add(new THREE.PlaneGeometry(24, 16), texM(canvasTex(256, 256, (c) => { c.fillStyle = '#e4e8ec'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#c4ccd4'; c.lineWidth = 4; for (let i = 0; i <= 2; i++) { c.beginPath(); c.moveTo(i * 128, 0); c.lineTo(i * 128, 256); c.moveTo(0, i * 128); c.lineTo(256, i * 128); c.stroke(); } }).image, 12, 8), 0, 0.01, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const wm = col('#f6f7f8'); const wall = (w, h, x, z, ry) => { const o = add(tbox(w, h, 0.2, 2), wm, x, h / 2, z, g, { cast: false }); o.rotation.y = ry; return o; };
    wall(24, 4.2, 0, -8, 0); wall(16, 4.2, -12, 0, Math.PI / 2); wall(16, 4.2, 12, 0, Math.PI / 2); wall(24, 4.2, 0, 8, 0);
    const ce = add(new THREE.PlaneGeometry(24, 16), col('#ffffff'), 0, 4.2, 0, g, { cast: false }); ce.rotation.x = Math.PI / 2;
    for (let x = -9; x <= 9; x += 4.5) for (const z of [-4, 0, 4]) add(tbox(2.2, 0.06, 0.8, 1), glowM('#ffffff', 1.8), x, 4.15, z, g, { cast: false });
    // a stripe + German wall label
    add(tbox(23.8, 0.3, 0.05, 1), col('#3a8ad8'), 0, 1.2, -7.88, g, { cast: false });
    const lbl = canvasTex(900, 200, (c, w, h) => { c.fillStyle = '#3a8ad8'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.font = `bold 84px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Labor B – Ebene −4', w / 2, h / 2 + 4); });
    flat(lbl, 2.6, 0.58, -8.2, 3.3, -7.86, g);
    // exam bed + scanner ring
    add(tbox(2.2, 0.15, 0.9, 1), col('#d8e6f0'), -5, 0.85, -3, g); add(tbox(0.3, 0.8, 0.3, 1), M.steelD, -5, 0.4, -3, g); add(tbox(0.7, 0.12, 0.8, 1), M.white, -5.9, 0.98, -3, g);
    S.ring = add(new THREE.TorusGeometry(1.1, 0.28, 14, 36), col('#e8eef4'), -4.4, 1.0, -3, g); S.ring.rotation.y = Math.PI / 2;
    S.ringGlow = add(new THREE.TorusGeometry(1.1, 0.06, 8, 36), glowM('#5ac8ff', 1.4), -4.4 + 0.29, 1.0, -3, g, { cast: false }); S.ringGlow.rotation.y = Math.PI / 2;
    // lab tables with tubes + microscope
    const tubeC = ['#e03a3a', '#3ab04a', '#3a8ad8', '#e8b030', '#c03ad8'];
    for (const [x, z] of [[3, -6.6]]) { add(tbox(3.6, 0.1, 1.2, 1), M.white, x, 0.95, z, g); add(tbox(3.4, 0.9, 1.0, 1), col('#d8dee6'), x, 0.45, z, g); for (let k = 0; k < 6; k++) { add(cyl(0.05, 0.05, 0.3, 8), toon({ color: tubeC[k % 5], transparent: true, opacity: 0.85 }), x - 1.2 + k * 0.22, 1.15, z + 0.2, g); }
      add(tbox(0.2, 0.5, 0.2, 1), M.dark, x + 1.1, 1.25, z, g); add(cyl(0.06, 0.08, 0.4, 8), M.dark, x + 1.1, 1.55, z + 0.12, g).rotation.x = 0.5; }
    // blood draw chair + stand
    add(tbox(1, 0.5, 1, 1), col('#3a8ad8'), 0.5, 0.25 + 0.25, -2.8, g); add(tbox(1, 1, 0.2, 1), col('#3a8ad8'), 0.5, 1.0, -3.3, g); add(tbox(0.2, 0.1, 0.9, 1), col('#3a8ad8'), 1.1, 0.85, -2.8, g);
    add(cyl(0.03, 0.03, 1.9, 6), M.steel, 1.5, 0.95, -3.2, g); const bag = add(tbox(0.25, 0.35, 0.06, 1), toon({ color: '#d8202a', transparent: true, opacity: 0.85 }), 1.5, 1.8, -3.2, g);
    // monitors on the back wall
    S.mon = []; for (let i = 0; i < 4; i++) { const m = dynTex(640, 400, (c, w, h, k) => drawMonitor(c, w, h, k, T)); m.set(['dna', 'blut', 'face', 'scan'][i]); add(tbox(2.3, 1.45, 0.12, 1), M.black, -1.5 + i * 2.6, 2.7, -7.85, g); flat(m.t, 2.16, 1.35, -1.5 + i * 2.6, 2.7, -7.78, g); S.mon.push(m); }
    // big wall display (CCTV) for Tag 99, in Jonas' room wall below
    // Jonas' room: right part, wall x=6 separates (door at z=3)
    const rw = (w, x, z, ry) => { const o = add(tbox(w, 4.2, 0.2, 2), col('#eef0f4'), x, 2.1, z, g, { cast: false }); o.rotation.y = ry; };
    rw(5.0, 6, 5.5, Math.PI / 2); rw(3.4, 6, -1.7 + 0.0, Math.PI / 2); add(tbox(0.2, 1.6, 1.6, 1), col('#eef0f4'), 6, 3.4, 2.2, g, { cast: false });
    S.labDoor = new THREE.Group(); S.labDoor.position.set(6, 0, 1.4); g.add(S.labDoor); add(tbox(0.12, 2.6, 1.6, 1), col('#bcc6d2'), 0, 1.3, 0.8, S.labDoor); add(tbox(0.16, 0.1, 0.3, 1), M.dark, -0.1, 1.1, 1.4, S.labDoor);
    // bed, desk in Jonas' room (x 6..12)
    add(tbox(2.2, 0.45, 1.2, 1), col('#c8d0dc'), 10.5, 0.3, 6.6, g); add(tbox(2.0, 0.16, 1.1, 1), col('#ffffff'), 10.5, 0.6, 6.6, g); add(tbox(0.6, 0.16, 0.9, 1), col('#a8c8e8'), 11.2, 0.75, 6.6, g);
    add(tbox(1.6, 0.08, 0.8, 1), M.woodD, 9, 0.8, -6.9, g); add(tbox(1.5, 0.75, 0.05, 1), M.steelD, 9, 0.4, -6.6, g);
    // window (Fenster) on the far wall of Jonas' room, showing the city (painted)
    S.cityTex = dynTex(1400, 800, (c, w, h, k, t) => drawCity(c, w, h, k, t));
    S.cityTex.set('day:0', 0);
    add(tbox(4.4, 2.6, 0.2, 1), M.white, 11.88, 2.2, 1.0, g, { cast: false }).rotation.y = Math.PI / 2;
    const win = flat(S.cityTex.t, 4.0, 2.25, 11.76, 2.2, 1.0, g, -Math.PI / 2);
    for (const dz of [-1.0, 1.0, 0]) add(tbox(0.08, dz === 0 ? 2.3 : 2.3, 0.08, 1), M.white, 11.72, 2.2, 1.0 + dz * 2.02 * (dz === 0 ? 0 : 1), g, { cast: false });
    add(tbox(0.08, 0.08, 4.1, 1), M.white, 11.72, 2.2, 1.0, g, { cast: false });
    // CCTV monitor on Jonas' room wall (x≈9, z=-7.9)
    S.cctv = dynTex(960, 540, (c, w, h, k, t, mode) => mode && mode !== 'cam' ? drawBoard(c, w, h, mode, t, T) : drawCCTV(c, w, h, t)); S.cctv.set('0', 0);
    add(tbox(2.7, 1.6, 0.12, 1), M.black, 9.0, 2.5, -7.85, g); flat(S.cctv.t, 2.56, 1.44, 9.0, 2.5, -7.78, g);
    // WC door with sign
    add(tbox(1.2, 2.3, 0.1, 1), col('#c8d4e0'), -10, 1.15, 7.88, g); const wc = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#1e3a6a'; c.font = `bold 90px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WC', w / 2, h / 2 + 4); });
    flat(wc, 0.5, 0.25, -10, 2.0, 7.82, g, Math.PI);
    // phone on the desk (for chat close-ups)
    S.phoneL = new THREE.Group(); S.phoneL.position.set(9.2, 0.86, -6.9); g.add(S.phoneL);
  }
  // ======================================================================= HOME (parents' living room)
  { const g = G.home;
    const fl = add(new THREE.PlaneGeometry(9, 8), texM(P.planks(5), 4, 4, '#d8a878'), 0, 0.01, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const rug = add(new THREE.PlaneGeometry(3.4, 2.4), texM(canvasTex(256, 192, (c, w, h) => { c.fillStyle = '#a83a32'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8c070'; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28); c.strokeRect(40, 40, w - 80, h - 80); c.fillStyle = '#e8c070'; c.beginPath(); c.arc(w / 2, h / 2, 26, 0, 7); c.fill(); }).image, 1, 1), 0, 0.02, -0.4, g, { cast: false }); rug.rotation.x = -Math.PI / 2;
    const wp = texM(canvasTex(256, 256, (c) => { c.fillStyle = '#e8d8b0'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#d8c090'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 0, 12, 256); c.fillStyle = '#c8a870'; for (let y = 16; y < 256; y += 64) for (let x = 6; x < 256; x += 64) { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); } }).image, 6, 2);
    const wall = (w, x, z, ry) => { const o = add(tbox(w, 2.8, 0.2, 2), wp, x, 1.4, z, g, { cast: false }); o.rotation.y = ry; };
    wall(9, 0, -4, 0); wall(8, -4.5, 0, Math.PI / 2); wall(9, 0, 4, 0); wall(3.3, 4.5, -2.35, Math.PI / 2); wall(3.3, 4.5, 2.35, Math.PI / 2); add(tbox(0.2, 0.5, 1.4, 1), wp, 4.5, 2.55, 0, g, { cast: false });
    const ce = add(new THREE.PlaneGeometry(9, 8), col('#f4ecd8'), 0, 2.8, 0, g, { cast: false }); ce.rotation.x = Math.PI / 2;
    add(tbox(9, 0.12, 0.06, 1), M.woodD, 0, 0.06, -3.88, g, { cast: false });
    // Papa's brown armchair
    S.chair = new THREE.Group(); S.chair.position.set(0, 0, -2.4); g.add(S.chair); const br = texM(canvasTex(128, 128, (c) => { c.fillStyle = '#7a4a2a'; c.fillRect(0, 0, 128, 128); const r = P.rng(4); for (let i = 0; i < 200; i++) { c.fillStyle = r() > 0.5 ? 'rgba(255,220,180,0.08)' : 'rgba(0,0,0,0.08)'; c.fillRect(r() * 128, r() * 128, 3, 3); } }).image, 1, 1);
    add(tbox(1.3, 0.5, 1.1, 1), br, 0, 0.35, 0, S.chair); add(tbox(1.3, 1.1, 0.3, 1), br, 0, 0.95, -0.45, S.chair); for (const sx of [-0.6, 0.6]) add(tbox(0.25, 0.75, 1.1, 1), br, sx, 0.55, 0, S.chair); add(tbox(1.0, 0.16, 0.85, 1), col('#8a5a34'), 0, 0.66, 0.08, S.chair);
    for (const [x, z] of [[-0.55, -0.45], [0.55, -0.45], [-0.55, 0.45], [0.55, 0.45]]) add(cyl(0.04, 0.03, 0.12, 6), M.woodD, x, 0.06, z, S.chair);
    // side table with lamp, reading glasses, remote
    add(cyl(0.32, 0.32, 0.05, 18), M.woodD, 1.1, 0.62, -2.4, g); add(cyl(0.04, 0.04, 0.6, 6), M.woodD, 1.1, 0.31, -2.4, g);
    add(cyl(0.05, 0.08, 0.45, 8), col('#c8a060'), 1.2, 0.87, -2.55, g); S.lampShade = add(cyl(0.16, 0.24, 0.3, 14), glowM('#ffe0a0', 1.1), 1.2, 1.2, -2.55, g);
    S.glasses = new THREE.Group(); S.glasses.position.set(1.0, 0.66, -2.3); g.add(S.glasses); for (const dx of [-0.06, 0.06]) { const r = add(new THREE.TorusGeometry(0.05, 0.01, 6, 16), M.black, dx, 0.0, 0, S.glasses); r.rotation.x = -Math.PI / 2 + 0.2; } add(tbox(0.04, 0.01, 0.01, 1), M.black, 0, 0.0, 0, S.glasses);
    add(tbox(0.06, 0.03, 0.2, 1), M.dark, 1.17, 0.66, -2.22, g).rotation.y = 0.4; add(tbox(0.02, 0.01, 0.02, 1), glowM('#e03a3a', 1), 1.15, 0.68, -2.27, g);
    // TV cabinet, shelves, window, pictures
    add(tbox(2, 0.6, 0.5, 1), M.woodD, 0, 0.3, 3.6, g); add(tbox(1.5, 0.9, 0.08, 1), M.black, 0, 1.1, 3.6, g);
    add(tbox(0.4, 2.0, 1.4, 1), M.woodD, -4.2, 1.0, -2.6, g); for (let k = 0; k < 4; k++) for (let b = 0; b < 5; b++) add(tbox(0.25, 0.32, 0.08, 1), col(['#c8402a', '#3a6ab0', '#e8b030', '#4a9a5a'][(k + b) % 4]), -4.05, 0.42 + k * 0.45, -3.1 + b * 0.22, g);
    const wnd = canvasTex(256, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0e1838'); gr.addColorStop(1, '#2a3a6a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#f8f0c8'; c.beginPath(); c.arc(180, 60, 24, 0, 7); c.fill(); c.fillStyle = '#fff'; for (let i = 0; i < 30; i++) c.fillRect((i * 97) % 256, (i * 53) % 150, 2, 2); });
    flat(wnd, 1.6, 1.3, -4.38, 1.6, 0.8, g, Math.PI / 2); add(tbox(0.12, 1.4, 1.7, 1), M.white, -4.4, 1.6, 0.8, g, { cast: false });
    const pic = (x, y, z, ry, seed) => { const t = canvasTex(200, 160, (c) => { c.fillStyle = '#c8e0f0'; c.fillRect(0, 0, 200, 160); c.fillStyle = '#5aa040'; c.fillRect(0, 100, 200, 60); c.fillStyle = '#f0c030'; c.beginPath(); c.arc(40 + seed * 30, 40, 18, 0, 7); c.fill(); }); add(tbox(0.62, 0.52, 0.05, 1), col('#c8a060'), x, y, z, g).rotation.y = ry; flat(t, 0.52, 0.42, x + Math.sin(ry) * 0.03, y, z + Math.cos(ry) * 0.03, g, ry); };
    pic(-1.6, 1.9, -3.88, 0, 1); pic(-0.7, 2.0, -3.88, 0, 2); pic(1.9, 1.85, -3.88, 0, 3);
    // kitchen corner (left wall, z 1.2..3.8): counter, stove, fridge
    add(tbox(0.7, 0.92, 2.6, 1), col('#e8e0d0'), -4.05, 0.46, 2.5, g); add(tbox(0.74, 0.06, 2.64, 1), col('#7a8a9a'), -4.05, 0.95, 2.5, g);
    for (const z of [2.1, 2.6]) add(cyl(0.12, 0.12, 0.02, 14), M.dark, -4.0, 0.99, z, g); const pot = add(cyl(0.16, 0.14, 0.2, 14), col('#c84a3a'), -4.0, 1.08, 2.1, g);
    add(tbox(0.8, 1.9, 0.8, 1), col('#f4f4f2'), -4.0, 0.95, 0.75 + 0.0, g); add(tbox(0.04, 0.5, 0.04, 1), M.steelD, -3.58, 1.2, 0.5, g);
    // front door (x=4.5, z∈[-0.7,0.7]) + outside porch
    S.homeDoor = new THREE.Group(); S.homeDoor.position.set(4.5, 0, -0.7); g.add(S.homeDoor); add(tbox(0.1, 2.3, 1.4, 1), col('#7a3a2a'), 0, 1.15, 0.7, S.homeDoor); add(sph(0.06), col('#e0b040'), -0.1, 1.1, 1.2, S.homeDoor);
    const pf = add(new THREE.PlaneGeometry(10, 10), M.side, 9.5, 0.0, 0, g, { cast: false }); pf.rotation.x = -Math.PI / 2;
    add(cyl(0.05, 0.07, 3, 8), M.dark, 8, 1.5, 2.5, g); add(tbox(0.4, 0.2, 0.4, 1), glowM('#fff0c0', 1.2), 8, 3, 2.5, g);
    for (const z of [-3, 3]) add(tbox(0.2, 2.8, 2.6, 1), texM(P.plaster(18, 20), 1, 1, '#e0c8a8'), 4.62, 1.4, z * 0.78, g, { cast: false });
  }
  // ======================================================================= VOID (white endless room)
  { const g = G.void;
    const fl = add(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshBasicMaterial({ color: '#f4f6f8' }), 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2; fl.userData.ndSkip = true;
    // lone cold-room door frame (appears at the end)
    S.vDoor = new THREE.Group(); S.vDoor.position.set(0, 0, 0); g.add(S.vDoor);
    add(tbox(0.14, 2.35, 0.42, 1), M.steelD, -0.8, 1.17, 0, S.vDoor); add(tbox(0.14, 2.35, 0.42, 1), M.steelD, 0.8, 1.17, 0, S.vDoor); add(tbox(1.74, 0.14, 0.42, 1), M.steelD, 0, 2.3, 0, S.vDoor);
    S.vDoorLeaf = new THREE.Group(); S.vDoorLeaf.position.set(-0.75, 0, 0.1); S.vDoor.add(S.vDoorLeaf); add(tbox(1.5, 2.2, 0.26, 1), M.steel, 0.75, 1.1, 0, S.vDoorLeaf); add(tbox(0.12, 0.6, 0.12, 1), M.dark, 1.35, 1.1, 0.18, S.vDoorLeaf);
    S.vDoorLight = add(new THREE.PlaneGeometry(1.46, 2.16), new THREE.MeshBasicMaterial({ color: '#fff4c8' }), 0, 1.1, 0.0, S.vDoor, { cast: false }); S.vDoorLight.userData.ndSkip = true;
    // the rope (tube rebuilt per shot from W.rope points)
    S.ropeMat = col('#c0c8d4'); S.rope = null; S.ropeKey = '';
    // crowds of lost men: sprites with 4 men each (drawn once)
    const groups = []; for (let k = 0; k < 8; k++) groups.push(spriteTex([0, 1, 2, 3].map((i) => { const n = k * 4 + i; const sp = n % 9 === 0 ? C.BUSDRIVER : n % 11 === 0 ? C.OPA : n % 13 === 0 ? C.ROBE : C.man(n); return [sp, { expr: ['worried', 'shock', 'neutral', 'scared', 'sad'][n % 5], turn: ((n % 5) - 2) * 0.3, look: ((n % 3) - 1) * 0.7, L: n % 4 === 0 ? 'chin' : 'hang', R: n % 3 === 0 ? 'up' : 'hang' }]; }), 300, 500));
    S.voidTex = groups; const r = P.rng(1234);
    S.voidCrowd = new THREE.Group(); g.add(S.voidCrowd);
    for (let i = 0; i < 220; i++) { const a = (r() - 0.5) * 2.4, d = 14 + Math.pow(r(), 0.7) * 120; const x = Math.sin(a) * d, z = -Math.cos(a) * d - 6; sprite(groups[i % 8], 4, x, 0, z, S.voidCrowd, 0.82 + r() * 0.1, 'void'); }
    // the queue along the rope (men holding the rope), placed in update along W.rope
    S.queue = []; for (let i = 0; i < 40; i++) S.queue.push(sprite(groups[(i * 3) % 8], 4, 0, 0, 0, g, 0.82, 'queue'));
  }
  // ======================================================================= SPACE (earth for the intro + green light)
  { const g = G.space;
    const r = P.rng(55); const stars = new THREE.BufferGeometry(); const pts = []; for (let i = 0; i < 1500; i++) { const a = r() * 6.283, b = Math.acos(2 * r() - 1), d = 500; pts.push(Math.sin(b) * Math.cos(a) * d, Math.cos(b) * d, Math.sin(b) * Math.sin(a) * d); }
    stars.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); const st = new THREE.Points(stars, new THREE.PointsMaterial({ color: '#ffffff', size: 1.8, sizeAttenuation: false, fog: false })); st.userData.ndSkip = true; g.add(st);
    const earthT = canvasTex(1024, 512, (c, w, h) => { c.fillStyle = '#2a6ac8'; c.fillRect(0, 0, w, h); const rr = P.rng(8); c.fillStyle = '#4aa84a';
      for (let i = 0; i < 26; i++) { const cx = rr() * w, cy = h * 0.2 + rr() * h * 0.6; c.beginPath(); for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283, R = 30 + rr() * 70; c.lineTo(cx + Math.cos(a) * R * 1.4, cy + Math.sin(a) * R); } c.fill(); }
      c.fillStyle = '#d8c070'; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(rr() * w, h * 0.35 + rr() * h * 0.3, 20 + rr() * 30, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.ellipse(rr() * w, rr() * h, 40 + rr() * 60, 8 + rr() * 10, 0, 0, 7); c.fill(); } });
    S.earth = add(new THREE.SphereGeometry(10, 48, 32), toon({ map: earthT }), 0, -6, -20, g, { cast: false });
    S.atmo = add(new THREE.SphereGeometry(10.5, 48, 32), new THREE.MeshBasicMaterial({ color: '#8ad0ff', transparent: true, opacity: 0.18, side: THREE.BackSide, fog: false }), 0, -6, -20, g, { cast: false }); S.atmo.userData.ndSkip = true;
    S.green = add(new THREE.SphereGeometry(10.9, 48, 32), new THREE.MeshBasicMaterial({ color: '#4dff7a', transparent: true, opacity: 0, fog: false, depthWrite: false }), 0, -6, -20, g, { cast: false }); S.green.userData.ndSkip = true;
    // tiny men standing on the planet's rim (each its own sprite so they can vanish one by one)
    S.tiny = []; for (let i = 0; i < 25; i++) { const a = (i - 12) * 0.075; const tex = spriteTex([[C.man(i * 7 + 3), { expr: 'neutral', turn: ((i % 5) - 2) * 0.2 }]], 300, 500); const m = sprite(tex, 1, Math.sin(a) * 10.05, 0, 0, g, 0.36, 'tiny'); m.position.set(Math.sin(a) * 10.0, -6 + Math.cos(a) * 10.0 + 0.36, -20); m.rotation.z = -a; m.userData.base = m.position.clone(); m.userData.a = a; S.tiny.push(m); }
  }
  // hero phone (close-ups)
  { S.phone = new THREE.Group(); world.add(S.phone); S.phone.visible = false; add(tbox(0.36, 0.72, 0.04, 1), S.M.black, 0, 0, 0, S.phone); S.phoneScr = dynTex(600, 1200, (c, w, h, k) => drawPhone(c, w, h, k));
    S.phoneScr.set('news0'); flat(S.phoneScr.t, 0.32, 0.64, 0, 0, 0.022, S.phone); }
  // generic crowd sprite banks for the street (women with phones / candles / mixed hugging)
  { const g = G.shop, r = P.rng(4321);
    const mk = (kind, n) => { const list = []; for (let k = 0; k < n; k++) list.push(spriteTex([0, 1, 2].map((i) => { const j = k * 3 + i; if (kind === 'phones') return [C.woman(j), { expr: ['shock', 'worried', 'awe'][j % 3], turn: ((j % 5) - 2) * 0.25, R: { x: 470, y: 330 }, holdR: 'phone' }];
      if (kind === 'candles') return [C.woman(j + 5), { expr: ['sad', 'neutral', 'worried', 'smile'][j % 4], turn: ((j % 5) - 2) * 0.25, R: { x: 380, y: 540 }, holdR: 'candle', blink: j % 7 === 0 ? 1 : 0 }];
      if (kind === 'cry') return [C.woman(j + 11), { expr: ['cry', 'worried', 'yell', 'sob'][j % 4], turn: ((j % 5) - 2) * 0.3, R: j % 2 ? { x: 480, y: 330 } : 'hang', holdR: j % 2 ? 'phone' : null, L: j % 3 ? 'hang' : 'chin' }];
      return [j % 2 ? C.man(j) : C.woman(j + 20), { expr: ['laugh', 'happy', 'goofy', 'cry'][j % 4], turn: ((j % 5) - 2) * 0.25, L: 'up', R: j % 3 ? 'up' : 'wave' }]; }), 300, 500)); return list; };
    S.crowdTex = { phones: mk('phones', 5), candles: mk('candles', 6), cry: mk('cry', 4), cheer: mk('cheer', 6) };
    S.crowd = {}; for (const kind of ['phones', 'candles', 'cheer']) { const G2 = new THREE.Group(); g.add(G2); S.crowd[kind] = G2;
      const n = kind === 'phones' ? 30 : 70; for (let i = 0; i < n; i++) { let x, z; if (kind === 'phones') { const a = r() * 6.283, d = 4 + r() * 9; x = 1.0 + Math.cos(a) * d * 1.3; z = 11.5 + Math.sin(a) * d * 0.55; } else { x = -16 + r() * 34; z = 8.6 + r() * 9; if (Math.abs(x - 0.5) < 1.6 && z < 9.6) continue; }
        sprite(S.crowdTex[kind][i % S.crowdTex[kind].length], 3, x, 0, z, G2, 0.78 + r() * 0.08, kind); } }
  }
};
// ---------------------------------------------------------------- canvas drawers (German text only)
const drawTV = (c, w, h, k) => {
  c.fillStyle = '#0a0a10'; c.fillRect(0, 0, w, h); if (k === 'off') { c.fillStyle = '#1a1e26'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(40, 30, 200, 480); return; }
  if (k === 'fussball') { c.fillStyle = '#3a9a4a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.strokeRect(40, 40, w - 80, h - 80); c.beginPath(); c.moveTo(w / 2, 40); c.lineTo(w / 2, h - 40); c.stroke(); c.beginPath(); c.arc(w / 2, h / 2, 80, 0, 7); c.stroke();
    for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? '#e03a3a' : '#3a6ae0'; c.beginPath(); c.arc(120 + (i * 83) % 700, 120 + (i * 61) % 300, 14, 0, 7); c.fill(); } c.fillStyle = '#fff'; c.beginPath(); c.arc(w * 0.55, h * 0.45, 9, 0, 7); c.fill(); c.fillStyle = '#121216'; c.fillRect(30, 30, 260, 56); c.fillStyle = '#fff'; c.font = 'bold 40px "DejaVu Sans"'; c.fillText('2 : 1', 110, 72); return; }
  if (k === 'jonas') { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a3a6a'); gr.addColorStop(1, '#121a30'); c.fillStyle = gr; c.fillRect(0, 0, w, h); head(c, TT, C.JONAS, { expr: 'shock' }, w * 0.24, -20, 0.62);
    c.fillStyle = '#d8202a'; c.fillRect(0, h - 150, w, 70); c.fillStyle = '#fff'; c.font = 'bold 46px "DejaVu Sans"'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('EILMELDUNG', 24, h - 115); c.fillStyle = '#fff'; c.fillRect(0, h - 80, w, 80); c.fillStyle = '#121216'; c.font = 'bold 34px "DejaVu Sans"'; c.fillText('Der letzte Mann der Welt: Jonas (27), Dönerladen', 20, h - 40, w - 40); c.fillStyle = '#d8202a'; c.font = 'bold 30px "DejaVu Sans"'; c.textAlign = 'right'; c.fillText('LIVE', w - 24, 44); return; }
  const kang = k === 'kanguru';
  const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, kang ? '#e8a050' : '#2a3a6a'); gr.addColorStop(1, kang ? '#a85a2a' : '#121a30'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  if (kang) { c.fillStyle = '#4dff7a'; c.globalAlpha = 0.35; c.beginPath(); c.arc(w * 0.62, h * 0.38, 160, 0, 7); c.fill(); c.globalAlpha = 1;
    // kangaroo silhouette + question mark
    c.fillStyle = '#5a2a14'; c.beginPath(); c.ellipse(w * 0.62, h * 0.5, 70, 95, 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(w * 0.66, h * 0.28, 32, 26, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(w * 0.55, h * 0.62); c.quadraticCurveTo(w * 0.4, h * 0.7, w * 0.38, h * 0.6); c.lineTo(w * 0.4, h * 0.64); c.fill();
    c.fillRect(w * 0.6, h * 0.6, 18, 70); c.fillRect(w * 0.66, h * 0.6, 18, 70); c.beginPath(); c.moveTo(w * 0.65, h * 0.22); c.lineTo(w * 0.64, h * 0.12); c.lineTo(w * 0.67, h * 0.2); c.fill();
    c.fillStyle = '#ffffff'; c.font = 'bold 120px "DejaVu Sans"'; c.fillText('?', w * 0.78, h * 0.42); }
  else { c.fillStyle = '#c8d8ff'; c.globalAlpha = 0.2; for (let i = 0; i < 8; i++) c.fillRect(60 + i * 110, 120 + (i % 3) * 20, 80, 200); c.globalAlpha = 1;
    c.fillStyle = '#e8eef8'; c.beginPath(); c.arc(w * 0.3, h * 0.42, 90, 0, 7); c.fill(); c.fillStyle = '#3a4a7a'; c.fillRect(w * 0.3 - 110, h * 0.42 + 80, 220, 140); }
  c.fillStyle = '#d8202a'; c.fillRect(0, h - 150, w, 70); c.fillStyle = '#ffffff'; c.font = 'bold 46px "DejaVu Sans"'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('EILMELDUNG', 24, h - 115);
  c.fillStyle = '#ffffff'; c.fillRect(0, h - 80, w, 80); c.fillStyle = '#121216'; c.font = 'bold 34px "DejaVu Sans"';
  const tx = kang ? ['Grünes Licht über Australien –', 'alle Kängurus verschwunden'] : ['Alle Männer weltweit', 'spurlos verschwunden'];
  c.fillText(tx[0] + ' ' + tx[1], 20, h - 40, w - 40);
  c.fillStyle = '#d8202a'; c.font = 'bold 30px "DejaVu Sans"'; c.textAlign = 'right'; c.fillText('LIVE', w - 24, 44);
};
let TT = null;
const head = (c, T, spec, o, x, y, s) => { c.save(); c.translate(x, y); c.scale(s, s); T.toonChar(new T.Pen(c), spec, o); c.restore(); };
const drawFaceAd = (c, w, h, T, kind) => {
  if (kind === 'screen') { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1e2a5a'); gr.addColorStop(1, '#5a1e4a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    head(c, T, C.JONAS, { expr: 'goofy' }, w * 0.08, -60, 0.95); c.fillStyle = '#ffd23a'; c.font = 'bold 150px "DejaVu Sans"'; c.textAlign = 'center'; c.fillText('DER', w * 0.72, h * 0.42); c.fillText('LETZTE', w * 0.72, h * 0.66);
    c.fillStyle = '#ffffff'; c.font = 'bold 44px "DejaVu Sans"'; c.fillText('Live aus dem Labor', w * 0.72, h * 0.82); return; }
  c.fillStyle = '#ffd23a'; c.fillRect(0, 0, w, h); c.fillStyle = '#d8202a'; c.fillRect(0, h * 0.72, w, h * 0.28); head(c, T, C.JONAS, { expr: 'smug' }, 30, 40, 0.9);
  c.fillStyle = '#ffffff'; c.font = 'bold 110px "DejaVu Sans"'; c.textAlign = 'center'; c.fillText('DER LETZTE', w / 2, h * 0.88, w - 40); c.strokeStyle = '#1a1416'; c.lineWidth = 14; c.strokeRect(0, 0, w, h);
};
const drawToyBox = (c, w, h, T, v) => {
  c.fillStyle = v === 1 ? '#d8202a' : '#1e5aa8'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23a'; c.fillRect(0, 0, w, 120); c.fillStyle = '#1a1416'; c.font = 'bold 74px "DejaVu Sans"'; c.textAlign = 'center'; c.fillText('Der Letzte', w / 2, 88);
  c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(40, 150, w - 80, h - 300); head(c, T, v === 1 ? C.JONAS : C.JONAS_ROPE, { expr: 'determined', R: 'up', holdR: v === 1 ? 'knife' : 'ropeH', L: v === 1 ? 'hip' : 'reach' }, 70, 150, 0.6);
  c.fillStyle = '#ffffff'; c.font = 'bold 44px "DejaVu Sans"'; c.fillText('Actionfigur', w / 2, h - 90); c.font = 'bold 38px "DejaVu Sans"'; c.fillText(v === 1 ? 'mit Dönermesser' : 'mit Stahlseil', w / 2, h - 40);
};
const drawMonitor = (c, w, h, k, T) => {
  c.fillStyle = '#0c1a2a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a8ad8'; c.lineWidth = 2; for (let x = 0; x < w; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  c.fillStyle = '#7ad0ff'; c.font = 'bold 34px "DejaVu Sans"'; c.textAlign = 'left';
  if (k === 'dna') { c.fillText('DNA-Analyse', 20, 44); for (let i = 0; i < 40; i++) { const y = 80 + i * 7.5, x = Math.sin(i * 0.4) * 120; c.fillStyle = '#5affb0'; c.beginPath(); c.arc(w / 2 + x, y, 7, 0, 7); c.fill(); c.fillStyle = '#ff5a9a'; c.beginPath(); c.arc(w / 2 - x, y, 7, 0, 7); c.fill(); } }
  if (k === 'blut') { c.fillText('Blutwerte', 20, 44); c.strokeStyle = '#ff4a4a'; c.lineWidth = 6; c.beginPath(); for (let x = 0; x < w; x += 8) { const y = 230 + (x % 120 < 20 ? -90 * Math.sin((x % 120) / 20 * Math.PI) : 0); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.fillStyle = '#ffffff'; c.fillText('Probe 47 von 300', 20, h - 30); }
  if (k === 'face') { c.fillText('Objekt: Jonas', 20, 44); head(c, T, C.JONAS, { expr: 'neutral' }, w / 2 - 170, 40, 0.56); c.strokeStyle = '#5affb0'; c.lineWidth = 4; c.strokeRect(w / 2 - 110, 80, 220, 200); }
  if (k === 'scan') { c.fillText('Ganzkörperscan', 20, 44); c.strokeStyle = '#7ad0ff'; c.lineWidth = 5; c.beginPath(); c.arc(w / 2, 120, 50, 0, 7); c.stroke(); c.strokeRect(w / 2 - 60, 175, 120, 140); c.fillStyle = '#ffd23a'; c.fillText('Analyse läuft …', 20, h - 30); }
};
const drawCity = (c, w, h, k, t) => {
  const night = k.startsWith('night'); const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, night ? '#0e1838' : '#5aa0e8'); gr.addColorStop(1, night ? '#2a3a6a' : '#cfe6f8'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  const r = (s) => ((Math.sin(s * 91.7) * 43758.5) % 1 + 1) % 1;
  for (let i = 0; i < 16; i++) { const bw = 70 + r(i) * 90, bh = 200 + r(i + 9) * 380, x = i * 92 - 20; c.fillStyle = night ? '#1e2440' : ['#d8c8b0', '#b8c8d8', '#e0b8a8', '#c8d0b0'][i % 4]; c.fillRect(x, h - 120 - bh, bw, bh);
    c.fillStyle = night ? '#ffe08a' : '#4a6a9a'; for (let yy = h - 100 - bh; yy < h - 140; yy += 46) for (let xx = x + 10; xx < x + bw - 20; xx += 30) if (!night || r(xx * yy) > 0.6) c.fillRect(xx, yy, 16, 24); }
  // crane (Baustelle)
  c.strokeStyle = '#f0b020'; c.lineWidth = 12; c.beginPath(); c.moveTo(1100, h - 120); c.lineTo(1100, 120); c.lineTo(820, 120); c.moveTo(1100, 120); c.lineTo(1260, 120); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(900 + Math.sin(t * 0.05) * 30, 120); c.lineTo(900 + Math.sin(t * 0.05) * 30, 300); c.stroke(); c.fillStyle = '#8a5a3a'; c.fillRect(870 + Math.sin(t * 0.05) * 30, 300, 60, 30);
  c.fillStyle = '#5a5a62'; c.fillRect(0, h - 120, w, 120); c.fillStyle = '#ffffff'; for (let x = 0; x < w; x += 120) c.fillRect(x, h - 64, 60, 8);
  // bus driving
  const bx = ((t * 6) % (w + 400)) - 300; c.fillStyle = '#f0c030'; c.fillRect(bx, h - 160, 260, 90); c.fillStyle = '#3a5a7a'; c.fillRect(bx + 14, h - 150, 230, 34); c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(bx + 50, h - 68, 18, 0, 7); c.arc(bx + 210, h - 68, 18, 0, 7); c.fill();
};
const drawCCTV = (c, w, h, t) => {
  c.fillStyle = '#1a1e1c'; c.fillRect(0, 0, w, h);
  // station platform in grainy green-grey
  c.fillStyle = '#2e3632'; c.fillRect(0, h * 0.62, w, h * 0.38); c.fillStyle = '#3a4440'; for (let i = 0; i < 6; i++) c.fillRect(80 + i * 160, 60, 30, h * 0.56);
  c.strokeStyle = '#4a5450'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, h * 0.62); c.lineTo(w, h * 0.62); c.stroke(); c.fillStyle = '#c8d0c8'; c.fillRect(380, 40, 220, 50); c.fillStyle = '#1a1e1c'; c.font = 'bold 34px "DejaVu Sans"'; c.textAlign = 'center'; c.fillText('Gleis 3', 490, 76);
  // ghosts: pale shapes like through frosted glass, only in a short window
  const k = Math.max(0, 1 - Math.abs(t - 0.5) * 5);
  if (k > 0) { c.save(); c.filter = 'blur(6px)'; c.globalAlpha = 0.55 * k; c.fillStyle = '#e8f0ec'; for (let i = 0; i < 46; i++) { const x = ((i * 137) % w) + Math.sin(t * 20 + i) * 20, y = h * 0.5 + ((i * 53) % 120), s = 0.6 + ((i * 31) % 10) / 20; c.beginPath(); c.arc(x, y - 60 * s, 18 * s, 0, 7); c.fill(); c.fillRect(x - 16 * s, y - 42 * s, 32 * s, 70 * s); } c.restore(); }
  const r = (s) => ((Math.sin(s * 91.7) * 43758.5) % 1 + 1) % 1; c.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 600; i++) c.fillRect(r(i + t * 99) * w, r(i * 3 + t * 77) * h, 3, 3);
  c.fillStyle = '#ffffff'; c.font = 'bold 30px "DejaVu Sans Mono", monospace'; c.textAlign = 'left'; c.fillText('KAMERA 07 – HAUPTBAHNHOF', 20, h - 24); c.textAlign = 'right'; c.fillText('02:47:' + String(13 + Math.floor(t * 10)).padStart(2, '0'), w - 20, 40);
  c.fillStyle = '#e03a3a'; c.beginPath(); c.arc(w - 300, 30, 10, 0, 7); c.fill();
};
const drawBoard = (c, w, h, mode, t, T) => {
  c.fillStyle = '#f4f6f8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1a1416'; c.fillStyle = '#1a1416'; c.lineWidth = 6; c.lineJoin = c.lineCap = 'round'; c.font = 'bold 40px "DejaVu Sans"'; c.textAlign = 'center';
  if (mode === 'cal') { c.fillText('Grünes Licht – alle 100 Tage', w / 2, 60); c.beginPath(); c.moveTo(60, 260); c.lineTo(w - 60, 260); c.stroke();
    [['Tag 1', 100], ['Tag 100', w - 160]].forEach(([s, x], i) => { c.fillStyle = '#3ad86a'; c.beginPath(); c.arc(x, 260, 34, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#1a1416'; c.fillText(s, x, 340); c.font = 'bold 34px "DejaVu Sans"'; c.fillText('3:14', x, 390); c.font = 'bold 40px "DejaVu Sans"'; });
    const k = Math.min(1, t * 2); c.strokeStyle = '#e03a3a'; c.lineWidth = 10; c.beginPath(); c.ellipse(w - 160, 330, 120, 110, 0, -1.6, -1.6 + 6.3 * k); c.stroke(); if (t > 0.5) { c.fillStyle = '#e03a3a'; c.fillText('morgen!', w - 160, 470); } return; }
  // plan sketches (stick drawings)
  const door = (x) => { c.fillStyle = '#a8b0ba'; c.fillRect(x, 150, 120, 220); c.strokeRect(x, 150, 120, 220); c.fillStyle = '#1a1416'; c.font = 'bold 28px "DejaVu Sans"'; c.fillText('Kühlraum', x + 60, 130); };
  const stick = (x, y) => { c.beginPath(); c.arc(x, y - 110, 30, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x, y - 80); c.lineTo(x, y - 20); c.moveTo(x, y - 20); c.lineTo(x - 26, y + 30); c.moveTo(x, y - 20); c.lineTo(x + 26, y + 30); c.moveTo(x - 34, y - 60); c.lineTo(x + 34, y - 60); c.stroke(); };
  c.font = 'bold 44px "DejaVu Sans"'; c.fillText('Der Plan', w / 2, 56);
  if (mode === 'plan1') { door(120); stick(180, 340); c.strokeStyle = '#e03a3a'; c.lineWidth = 14; c.beginPath(); c.moveTo(90, 140); c.lineTo(270, 390); c.moveTo(270, 140); c.lineTo(90, 390); c.stroke(); }
  if (mode === 'plan2' || mode === 'plan3') { door(80); const gx = 520; const gr = c.createRadialGradient(gx + 150, 260, 10, gx + 150, 260, 220); gr.addColorStop(0, 'rgba(60,230,110,0.9)'); gr.addColorStop(1, 'rgba(60,230,110,0)'); c.fillStyle = gr; c.fillRect(gx - 80, 40, 460, 460);
    const px = 260 + Math.min(1, t * 1.5) * 300; c.strokeStyle = '#1a1416'; stick(px, 380);
    if (mode === 'plan3') { c.strokeStyle = '#8a94a4'; c.lineWidth = 8; c.beginPath(); c.moveTo(200, 270); c.bezierCurveTo(260, 420, px - 120, 420, px, 320); c.stroke(); c.fillStyle = '#1a1416'; c.font = 'bold 34px "DejaVu Sans"'; c.fillText('Stahlseil', (200 + px) / 2, 470); } }
};
export const drawPhone = (c, w, h, k) => {
  c.fillStyle = '#f4f6fa'; c.fillRect(0, 0, w, h);
  if (k.startsWith('call:')) { const g2 = c.createLinearGradient(0, 0, 0, h); g2.addColorStop(0, '#2a3a5a'); g2.addColorStop(1, '#0e1424'); c.fillStyle = g2; c.fillRect(0, 0, w, h); c.fillStyle = '#c8d0e0'; c.beginPath(); c.arc(w / 2, 360, 120, 0, 7); c.fill();
    c.fillStyle = '#ffffff'; c.font = 'bold 40px "DejaVu Sans"'; c.textAlign = 'center'; c.fillText('Eingehender Anruf', w / 2, 140); const nm = k.slice(5).split('|'); c.font = 'bold 54px "DejaVu Sans"'; nm.forEach((s, i) => c.fillText(s, w / 2, 590 + i * 66, w - 40));
    c.fillStyle = '#3ac85a'; c.beginPath(); c.arc(w * 0.72, h - 200, 70, 0, 7); c.fill(); c.fillStyle = '#e03a3a'; c.beginPath(); c.arc(w * 0.28, h - 200, 70, 0, 7); c.fill(); return; }
  if (k === 'theory') { c.fillStyle = '#1e1e26'; c.fillRect(0, 0, w, 140); c.fillStyle = '#fff'; c.font = 'bold 50px "DejaVu Sans"'; c.textAlign = 'left'; c.fillText('Wahrheit.net', 30, 92);
    c.fillStyle = '#d8202a'; c.font = 'bold 60px "DejaVu Sans"'; c.fillText('THEORIE:', 30, 230); c.fillStyle = '#121216'; c.font = 'bold 50px "DejaVu Sans"'; ['Er war es selbst!', 'Mit einem', 'Dönergrill!'].forEach((s, i) => c.fillText(s, 30, 310 + i * 64));
    c.fillStyle = '#8a8a92'; c.fillRect(150, 560, 300, 360); c.fillStyle = '#ff8a3a'; c.fillRect(190, 600, 220, 280); c.fillStyle = '#a8582e'; c.beginPath(); c.moveTo(300, 600); c.lineTo(350, 640); c.lineTo(330, 860); c.lineTo(270, 860); c.lineTo(250, 640); c.fill();
    c.strokeStyle = '#3ae86a'; c.lineWidth = 14; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(300, 600); c.lineTo(80 + i * 110, 440); c.stroke(); } c.fillStyle = '#d8202a'; c.font = 'bold 120px "DejaVu Sans"'; c.fillText('?!', 440, 720); c.fillStyle = '#5a5a66'; c.font = '36px "DejaVu Sans"'; c.fillText('12.483 Kommentare', 30, 1080); return; }
  if (k.startsWith('news')) { const i = +k.slice(4) || 0; const apps = [['Nachrichten', '#d8202a'], ['TV 24', '#1e5aa8'], ['Radio Eins', '#f08a20'], ['Weltblick', '#2a8a4a']][i % 4];
    c.fillStyle = apps[1]; c.fillRect(0, 0, w, 150); c.fillStyle = '#fff'; c.font = 'bold 60px "DejaVu Sans"'; c.textAlign = 'left'; c.fillText(apps[0], 30, 100);
    c.fillStyle = '#d8202a'; c.fillRect(30, 190, 290, 56); c.fillStyle = '#fff'; c.font = 'bold 38px "DejaVu Sans"'; c.fillText('EILMELDUNG', 44, 232);
    c.fillStyle = '#121216'; c.font = 'bold 64px "DejaVu Sans"'; ['Alle Männer', 'weltweit', 'spurlos', 'verschwunden'].forEach((s, j) => c.fillText(s, 30, 330 + j * 78));
    c.fillStyle = '#c8ccd4'; c.fillRect(30, 680, w - 60, 260); c.fillStyle = '#8a90a0'; for (let j = 0; j < 4; j++) c.fillRect(30, 980 + j * 50, w - 60 - j * 80, 22); return; }
  if (k.startsWith('chat')) { const n = +k.slice(4) || 3; c.fillStyle = '#2a8a6a'; c.fillRect(0, 0, w, 150); c.fillStyle = '#fff'; c.font = 'bold 58px "DejaVu Sans"'; c.textAlign = 'left'; c.fillText('Murat', 130, 96); c.beginPath(); c.arc(70, 76, 40, 0, 7); c.fillStyle = '#e0402e'; c.fill();
    const msgs = ['Alter, wo bist du?', 'Melde dich!', 'Fußball heute?', 'Du schuldest mir 20 €', 'Bitte antworte.', 'Ich vermiss dich, Bruder.'];
    for (let j = 0; j < Math.min(n, msgs.length); j++) { const y = 200 + j * 160; c.fillStyle = '#d8f8c8'; c.beginPath(); c.roundRect(w - 640, y, 610, 120, 26); c.fill(); c.fillStyle = '#121216'; c.font = 'bold 42px "DejaVu Sans"'; c.fillText(msgs[j], w - 610, y + 62, 520);
      c.strokeStyle = '#9aa0a8'; c.lineWidth = 7; c.beginPath(); c.moveTo(w - 110, y + 92); c.lineTo(w - 94, y + 106); c.lineTo(w - 66, y + 78); c.stroke(); c.fillStyle = '#9aa0a8'; c.font = '28px "DejaVu Sans"'; c.fillText('22:4' + j, w - 250, y + 106); }
    return; }
};
export const update = (ctx, W, f) => {
  const { THREE, camera } = ctx; const set = W.set || 'shop';
  for (const k in S.G) S.G[k].visible = k === set;
  for (const cl of ctx.clouds) cl.visible = !!W.clouds;
  // shop
  S.door.rotation.y = W.door || 0; S.shopDoor.rotation.y = -(W.shopDoor || 0);
  S.spit.rotation.y = f * 0.02; S.aliStuff.visible = !!W.aliStuff; S.heroSign.visible = !!W.heroSign; S.coil.visible = !!W.coil;
  if (W.clock) S.clock.set(W.clock); if (W.tv) S.tv.set(W.tv);
  S.heli.visible = !!W.heli; if (W.heli) { S.heli.position.set(...W.heli.pos); S.heli.rotation.y = W.heli.ry || 0; S.heli.rotation.z = W.heli.rz || 0; S.rotor.rotation.y = f * 0.9; S.tailRotor.rotation.x = f * 1.3; }
  S.tanks.visible = !!W.tanks; S.bigScreen.visible = !!W.bigScreen; S.posters.visible = !!W.posters; S.merch.visible = !!W.merch; S.toy.visible = !!W.toy; S.stage.visible = !!W.stage;
  if (W.toy) S.toyBox.material.map = S.toyTex[W.toy - 1];
  S.phone.visible = !!W.phone; if (W.phone) { const p = W.phone; S.phone.position.set(p.pos[0] + OFF[p.set || set], p.pos[1], p.pos[2]); S.phone.rotation.set(...(p.rot || [0, 0, 0])); S.phone.scale.setScalar(p.s || 1); S.phoneScr.set(p.k); }
  S.cars.forEach((c) => c.visible = W.cars !== false); S.bus.visible = W.bus !== false; if (W.busPos) { S.bus.position.set(...W.busPos); S.bus.rotation.y = W.busRy ?? 0; } else { S.bus.position.set(-3.0, 0.16, 16.4); S.bus.rotation.y = 0.32; }
  for (const k in S.crowd) S.crowd[k].visible = W.crowd === k || (Array.isArray(W.crowd) && W.crowd.includes(k));
  S.signGlow.visible = W.night !== false;
  // lab
  S.labDoor.rotation.y = W.labDoor || 0; if (W.city) S.cityTex.set(W.city + ':' + Math.floor(f / 2), f); if (W.cctv !== undefined) S.cctv.set((W.cctvMode || 'cam') + W.cctv.toFixed(3), W.cctv, W.cctvMode || 'cam');
  S.ringGlow.material.emissiveIntensity = 1 + Math.sin(f * 0.3) * 0.6;
  // void
  S.vDoor.visible = !!W.vDoor; if (W.vDoor) { S.vDoor.position.set(...W.vDoor.pos); S.vDoor.rotation.y = W.vDoor.ry || 0; S.vDoorLeaf.rotation.y = W.vDoor.open || 0; S.vDoorLight.visible = (W.vDoor.open || 0) > 0.05; }
  S.voidCrowd.visible = !!W.voidCrowd;
  const rk = W.rope ? JSON.stringify(W.rope) : ''; if (rk !== S.ropeKey) { S.ropeKey = rk; if (S.rope) { S.rope.parent.remove(S.rope); S.rope.geometry.dispose(); S.rope = null; }
    if (W.rope) { const pts = W.rope.pts.map((p) => new THREE.Vector3(...p)); const cur = new THREE.CatmullRomCurve3(pts); S.rope = ctx.add(new THREE.TubeGeometry(cur, Math.max(20, pts.length * 12), W.rope.r || 0.035, 6, false), S.ropeMat, 0, 0, 0, S.G[W.rope.set || set], { cast: false }); } }
  const qn = W.queue || 0; S.queue.forEach((m, i) => { m.visible = i < qn && !!W.queuePath; if (m.visible) { const p = W.queuePath(i); m.position.set(p[0] - OFF.void, p[1] + m.userData.base.y, p[2]); } });
  // space
  if (S.green) S.green.material.opacity = W.green || 0; S.tiny.forEach((m, i) => { const v = W.tiny ? W.tiny(i) : 1; m.visible = v > 0.01; m.scale.setScalar(Math.max(0.01, v)); });
  // billboard all visible sprites toward the camera, with a tiny idle bob
  const cp = camera.position, wp = new THREE.Vector3();
  for (const m of S.sprites) { if (!m.visible || !m.parent.visible) continue; if (m.userData.tag === 'tiny') { m.rotation.y = 0; continue; } m.getWorldPosition(wp); m.rotation.y = Math.atan2(cp.x - wp.x, cp.z - wp.z);
    if (m.userData.tag !== 'queue') { const b = m.userData.base; const ph = (b.x * 3.1 + b.z * 1.7); const amp = W.crowdBob ?? 0.02; m.position.y = b.y + Math.abs(Math.sin(f * 0.12 + ph)) * amp; } }
};
export const ropeSet = () => S;
