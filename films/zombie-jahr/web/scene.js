// scene.js: "Ein Jahr drinnen" — ONE fixed world, built once, same layout in every shot.
// Coordinates (metres): street runs along x at z 12.5..19.5. Hero house x -7..7, z 0..9 (front wall z = 9, faces the street).
//   Salon x -7..0 (front door x -3, sofa, TV, Billy, stove, tally wall = inner face of x = -7)
//   Kitchen x 0..7, z 4.5..9 (big street window x 2.4..5, table, fridge, counter, clock)
//   Bathroom x 0..7, z 0..4.5 (tub), back door x -3 on z = 0 -> back garden z < 0 (terrace, beds, buckets, grill, fence)
//   Front garden z 9..11: fence x -7..-0.5 (gate x -3), hedge x 0.3..7.
// Across the street: Frau Schmidt x -6..6, z 22..30 (door x 0), Nr. 12 x 9..16. Schmidt's cellar is a separate set at x = 80.
// All visible writing is German.
let S = {};
export const TALLY = { n: -1 };
export const build = (ctx) => {
  const { THREE, P, world, add, tbox, toon, texM, canvasTex, addClouds } = ctx;
  const T_ = ctx.T;
  const col = (c) => toon({ color: c });
  const M = {
    grass: texM(P.grass(6), 60, 60), asphalt: col('#5a5a66'), walk: texM(P.stone(21, 30, 6, 72, 64, 64), 30, 3),
    extH: texM(P.plaster(8, 42), 1, 1, '#f6dca4'), extS: texM(P.plaster(18, 280), 1, 1, '#c8d8f0'), ext12: texM(P.plaster(28, 120), 1, 1, '#d8eab8'),
    salon: texM(P.plaster(38, 100), 1, 1, '#d6e6c4'), kitchen: texM(P.plaster(48, 40), 1, 1, '#fbf1dc'), bath: texM(P.plaster(58, 200), 1, 1, '#bfe0ea'),
    edge: col('#e8e0d0'), floor: texM(P.planks(3), 3, 3), tile: texM(P.stone(31, 30, 8, 86, 48, 48), 4, 4), ceil: col('#f4efe4'),
    roof: texM(P.roof(9), 3, 3), roof2: texM(P.roof(19), 3, 3), frame: col('#fbf8f0'), wood: col('#8a5a34'), woodD: col('#5e3a22'), woodL: col('#c89a62'),
    sofa: col('#e07a3a'), sofaD: col('#b85a2a'), cushion: col('#f2c25a'), white: col('#f4f2ee'), steel: col('#9aa0aa'), dark: col('#2a2a32'),
    green: col('#3f8a4e'), leaf: col('#5aa040'), leaf2: col('#78b84a'), trunk: col('#6a4a32'), hill: col('#7aae4e'), hillFar: col('#9cc070'),
    mount: col('#8fa0c8'), snow: col('#f4f6fa'), hedge: col('#3c8a3a'), fence: col('#f2ead8'), red: col('#d2452e'), dirt: texM(P.dirt(7), 3, 3),
    tomato: col('#e0402a'), blue: col('#3a78c8'), yellow: col('#f2c43a'), pink: col('#f4a6c0'), water: col('#7cc4e8'), tub: col('#fbfbff'),
    lampOn: toon({ color: '#ffe6a0', emissive: '#ffcf70', emissiveIntensity: 1.3 }), lampOff: col('#d8d4c8'),
    tvOn: toon({ color: '#7ab8ff', emissive: '#5a9aff', emissiveIntensity: 0.9 }), tvOff: col('#1c1c24'),
    fireOn: toon({ color: '#ffb040', emissive: '#ff8020', emissiveIntensity: 1.6 }), metal: col('#3a3a42'),
  };
  S.M = M;
  const plane = (w, h, mat, x, y, z, rx = -Math.PI / 2, ry = 0, parent = world, cast = false) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast }); m.rotation.set(rx, ry, 0); return m; };
  // ---------- ground & street ----------
  S.grass = plane(900, 900, M.grass, 0, -0.02, 0);
  plane(140, 7, M.asphalt, 0, 0.0, 16);
  for (let x = -60; x < 60; x += 4) plane(1.8, 0.16, M.white, x, 0.01, 16);
  plane(140, 1.6, M.walk, 0, 0.03, 11.8); plane(140, 1.6, M.walk, 0, 0.03, 20.2);
  // side street (the corner) at x = 8.2 going away from the street
  plane(3.4, 40, M.asphalt, 7.6 + 0.0, 0.005, 40); // behind the Schmidt row
  // ---------- wall builder ----------
  const H = 2.8, TW = 0.2;
  const mats = (ext, int, axis) => axis === 'x' ? [M.edge, M.edge, M.edge, M.edge, ext, int] : [ext, int, M.edge, M.edge, M.edge, M.edge];
  // wall along x at z (outer side +z if outSign = 1), holes: [x0, x1, y0, y1]
  const wallX = (z, x0, x1, holes, mExt, mInt, outSign = 1, h = H, parent = world) => {
    const m = outSign > 0 ? mats(mExt, mInt, 'x') : mats(mInt, mExt, 'x');
    const seg = (a, b, y0, y1) => { if (b - a < 0.01 || y1 - y0 < 0.01) return; add(tbox(b - a, y1 - y0, TW, 1.5), m, (a + b) / 2, (y0 + y1) / 2, z, parent, { cast: false }); };
    let cx = x0; holes = [...holes].sort((a, b) => a[0] - b[0]);
    for (const [a, b, y0, y1] of holes) { seg(cx, a, 0, h); seg(a, b, 0, y0); seg(a, b, y1, h); cx = b; }
    seg(cx, x1, 0, h);
  };
  const wallZ = (x, z0, z1, holes, mExt, mInt, outSign = 1, h = H, parent = world) => {
    const m = outSign > 0 ? mats(mExt, mInt, 'z') : mats(mInt, mExt, 'z');
    const seg = (a, b, y0, y1) => { if (b - a < 0.01 || y1 - y0 < 0.01) return; add(tbox(TW, y1 - y0, b - a, 1.5), m, x, (y0 + y1) / 2, (a + b) / 2, parent, { cast: false }); };
    let cz = z0; holes = [...holes].sort((a, b) => a[0] - b[0]);
    for (const [a, b, y0, y1] of holes) { seg(cz, a, 0, h); seg(a, b, 0, y0); seg(a, b, y1, h); cz = b; }
    seg(cz, z1, 0, h);
  };
  const winFrameX = (z, x0, x1, y0, y1, out = 1) => { // white frame + cross bars on a window in an x-wall
    const d = 0.26, p = (w, h, x, y) => add(tbox(w, h, d, 1), M.frame, x, y, z, world, { cast: false });
    p(x1 - x0 + 0.16, 0.1, (x0 + x1) / 2, y0); p(x1 - x0 + 0.16, 0.1, (x0 + x1) / 2, y1); p(0.1, y1 - y0, x0, (y0 + y1) / 2); p(0.1, y1 - y0, x1, (y0 + y1) / 2);
    p(0.06, y1 - y0, (x0 + x1) / 2, (y0 + y1) / 2);
    add(tbox(x1 - x0 + 0.3, 0.06, 0.4, 1), M.frame, (x0 + x1) / 2, y0 - 0.02, z + out * 0.12, world, { cast: false }); // sill
  };
  // ---------- HERO HOUSE ----------
  const HX = [-7, 7], HZ = [0, 9];
  S.hFront = { door: [-3.6, -2.4, 0, 2.2], winS: [-6.2, -4.6, 0.9, 2.1], winK: [2.3, 5.1, 0.85, 2.25] };
  wallX(9, -7.1, 7.1, [S.hFront.door, S.hFront.winS, S.hFront.winK], M.extH, M.salon, 1);
  wallX(0, -7.1, 7.1, [[-3.6, -2.4, 0, 2.2], [4.1, 5.1, 1.5, 2.2]], M.extH, M.salon, -1);
  wallZ(-7, 0, 9, [], M.extH, M.salon, -1);
  wallZ(7, 0, 9, [[6.2, 7.6, 0.9, 2.1]], M.extH, M.kitchen, 1);
  wallZ(0, 0.1, 8.9, [[2.0, 2.9, 0, 2.15], [6.0, 7.1, 0, 2.15]], M.kitchen, M.salon, 1);
  wallX(4.5, 0.1, 6.9, [], M.kitchen, M.bath, 1);
  winFrameX(9, ...S.hFront.winS.slice(0, 2), ...S.hFront.winS.slice(2)); winFrameX(9, ...S.hFront.winK.slice(0, 2), ...S.hFront.winK.slice(2));
  winFrameX(0, 4.1, 5.1, 1.5, 2.2, -1);
  plane(14, 9, M.floor, 0, 0.01, 4.5); plane(6.8, 4.4, M.tile, 3.5, 0.015, 2.25);
  plane(14.2, 9.2, M.ceil, 0, H - 0.01, 4.5, Math.PI / 2);
  // roof (gable along x)
  const roofSide = (sgn) => { const r = add(tbox(15.2, 0.18, 5.6, 2), M.roof, 0, H + 1.25, 4.5 + sgn * 2.45, world, { cast: false }); r.rotation.x = sgn * 0.5; };
  roofSide(1); roofSide(-1);
  const gable = new THREE.Shape(); gable.moveTo(-4.8, 0); gable.lineTo(4.8, 0); gable.lineTo(0, 2.5); gable.closePath();
  for (const x of [-7.05, 7.05]) { const gm = add(new THREE.ShapeGeometry(gable), M.extH, x, H, 4.5, world, { cast: false }); gm.rotation.y = Math.PI / 2; gm.material = M.extH; const g2 = gm.clone(); g2.rotation.y = -Math.PI / 2; world.add(g2); }
  add(tbox(0.7, 1.6, 0.7, 1), M.red, 4, H + 2.6, 3, world, { cast: false }); // chimney
  // front door (hinged at x = -3.6)
  S.door = new THREE.Group(); S.door.position.set(-3.6, 0, 9.0); world.add(S.door);
  add(tbox(1.2, 2.2, 0.08, 1), col('#2e6a8a'), 0.6, 1.1, 0, S.door, { cast: false });
  add(new THREE.SphereGeometry(0.05, 8, 6), M.yellow, 1.05, 1.05, 0.08, S.door); add(new THREE.SphereGeometry(0.05, 8, 6), M.yellow, 1.05, 1.05, -0.08, S.door);
  for (const yy of [0.6, 1.6]) add(tbox(0.9, 0.5, 0.1, 1), col('#3a7a9a'), 0.6, yy, 0, S.door, { cast: false });
  // house number of the hero (German, small)
  const plate = (txt, w = 512, h = 256, bg = '#2e5a9a', fg = '#ffffff') => canvasTex(w, h, (c, W, Hh) => { c.fillStyle = bg; c.beginPath(); c.roundRect(8, 8, W - 16, Hh - 16, 40); c.fill(); c.lineWidth = 12; c.strokeStyle = '#ffffff'; c.beginPath(); c.roundRect(28, 28, W - 56, Hh - 56, 28); c.stroke();
    c.font = `bold ${Hh * 0.5}px "DejaVu Sans", Arial`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = fg; c.fillText(txt, W / 2, Hh / 2 + 6); });
  const sign = (tex, w, h, x, y, z, ry = 0) => { const m = add(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }), x, y, z, world, { cast: false }); m.rotation.y = ry; m.userData.ndSkip = true; return m; };
  sign(plate('Nr. 7'), 0.5, 0.25, -1.9, 2.0, 9.12);
  // back door
  const bd = add(tbox(1.2, 2.2, 0.08, 1), col('#6a8a3a'), -3.0, 1.1, 0.0, world, { cast: false });
  // ---------- interior props ----------
  // sofa (group, animated). local: seat faces +z
  S.sofa = new THREE.Group(); world.add(S.sofa);
  add(tbox(2.2, 0.45, 0.9, 1), M.sofa, 0, 0.32, 0, S.sofa); add(tbox(2.2, 0.75, 0.25, 1), M.sofaD, 0, 0.75, -0.36, S.sofa);
  for (const sx of [-1.15, 1.15]) add(tbox(0.25, 0.65, 0.9, 1), M.sofaD, sx, 0.45, 0, S.sofa);
  for (const sx of [-0.5, 0.5]) add(tbox(0.95, 0.14, 0.7, 1), M.cushion, sx, 0.6, 0.06, S.sofa);
  for (const sx of [-1, 1]) for (const sz of [-0.35, 0.35]) add(tbox(0.08, 0.12, 0.08, 1), M.woodD, sx, 0.06, sz, S.sofa);
  // TV + low board against the partition (faces -x)
  add(tbox(0.5, 0.5, 1.8, 1), M.wood, -0.35, 0.25, 4.2, world);
  S.tvScreen = add(tbox(0.08, 0.75, 1.3, 1), M.tvOff, -0.36, 0.95, 4.2, world); add(tbox(0.06, 0.85, 1.4, 1), M.dark, -0.3, 0.95, 4.2, world);
  // ceiling lamp
  S.lamp = add(new THREE.SphereGeometry(0.28, 16, 10), M.lampOn, -3.5, 2.45, 4.5, world, { cast: false }); add(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), M.dark, -3.5, 2.65, 4.5, world, { cast: false });
  S.lampK = add(new THREE.SphereGeometry(0.24, 16, 10), M.lampOn, 3.5, 2.5, 6.8, world, { cast: false });
  // rug
  plane(3.0, 2.2, col('#c84a4a'), -3.6, 0.02, 4.4);
  // Billy shelf against the left wall (faces +x)
  S.billy = new THREE.Group(); S.billy.position.set(-6.75, 0, 7.6); world.add(S.billy);
  add(tbox(0.3, 2.0, 0.8, 1), M.white, 0, 1.0, 0, S.billy);
  for (let k = 0; k < 5; k++) { add(tbox(0.32, 0.04, 0.78, 1), col('#e4e0d6'), 0.0, 0.1 + k * 0.45, 0, S.billy); if (k < 4) for (let b = 0; b < 5; b++) add(tbox(0.22, 0.32, 0.08, 1), col(['#c84a3a', '#3a6ac8', '#e8b030', '#4a9a5a', '#8a4ab0'][(b + k) % 5]), 0.04, 0.3 + k * 0.45, -0.28 + b * 0.13, S.billy); }
  // stove (Kaminofen) back-left with pipe
  S.stove = new THREE.Group(); S.stove.position.set(-6.2, 0, 0.9); world.add(S.stove);
  add(tbox(0.8, 1.0, 0.7, 1), M.metal, 0, 0.5, 0, S.stove); add(new THREE.CylinderGeometry(0.1, 0.1, 1.9, 10), M.metal, 0, 1.9, 0, S.stove);
  S.fire = add(tbox(0.5, 0.36, 0.06, 1), M.fireOn, 0.0, 0.48, 0.36, S.stove, { cast: false }); add(tbox(0.56, 0.44, 0.04, 1), M.dark, 0, 0.48, 0.34, S.stove);
  // wardrobe (Kleiderschrank), animated
  S.wardrobe = new THREE.Group(); world.add(S.wardrobe);
  add(tbox(1.3, 2.15, 0.6, 1), M.woodL, 0, 1.075, 0, S.wardrobe); add(tbox(0.02, 2.0, 0.62, 1), M.woodD, 0, 1.075, 0.0, S.wardrobe);
  for (const sx of [-0.1, 0.1]) add(new THREE.SphereGeometry(0.04, 6, 6), M.woodD, sx, 1.1, 0.32, S.wardrobe);
  // tally wall (inner face of x = -7, z 1.6..6.9)
  const tallyCanvas = document.createElement('canvas'); tallyCanvas.width = 2048; tallyCanvas.height = 640; S.tallyC = tallyCanvas;
  S.tallyT = new THREE.CanvasTexture(tallyCanvas); S.tallyT.colorSpace = THREE.SRGBColorSpace; S.tallyT.anisotropy = 8;
  const tw = add(new THREE.PlaneGeometry(5.3, 1.65), new THREE.MeshBasicMaterial({ map: S.tallyT, transparent: true }), -6.88, 1.55, 4.25, world, { cast: false });
  tw.rotation.y = Math.PI / 2; tw.userData.ndSkip = true; S.tallyMesh = tw;
  // newspaper on windows (inside), toggled
  const paperTex = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#efe8d6'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2a2a'; c.font = 'bold 64px "DejaVu Serif", Georgia, serif'; c.textAlign = 'center'; c.fillText('Tagesblatt', w / 2, 70);
    c.fillRect(20, 92, w - 40, 6); c.font = 'bold 38px "DejaVu Sans", Arial'; c.fillText('Wetter: sonnig', w / 2, 150);
    for (let col_ = 0; col_ < 3; col_++) for (let r = 0; r < 14; r++) c.fillRect(24 + col_ * 162, 190 + r * 22, 140 - (r * 37 % 50), 8); });
  const paperM = toon({ map: paperTex, side: THREE.DoubleSide });
  S.papers = [];
  const paperOn = (w, h, x, y, z, ry = 0) => { const m = add(new THREE.PlaneGeometry(w, h), paperM, x, y, z, world, { cast: false }); m.rotation.y = ry; S.papers.push(m); return m; };
  paperOn(1.6, 1.25, -5.4, 1.5, 8.86, Math.PI); paperOn(2.8, 1.45, 3.7, 1.55, 8.86, Math.PI); paperOn(1.0, 0.7, 4.6, 1.85, 0.14); paperOn(1.4, 1.2, 6.86, 1.5, 6.9, -Math.PI / 2);
  // kitchen: counter + fridge + coffee machine + table + chairs + clock
  add(tbox(0.65, 0.92, 3.0, 1), M.white, 6.55, 0.46, 7.2, world); add(tbox(0.7, 0.05, 3.05, 1), M.woodL, 6.55, 0.94, 7.2, world);
  add(tbox(0.3, 0.42, 0.3, 1), M.dark, 6.55, 1.17, 8.2, world); add(tbox(0.12, 0.12, 0.12, 1), M.red, 6.4, 1.1, 8.2, world);
  S.fridge = add(tbox(0.75, 1.9, 0.75, 1), col('#eef2f6'), 6.5, 0.95, 5.1, world); add(tbox(0.04, 0.5, 0.05, 1), M.steel, 6.1, 1.3, 5.4, world);
  S.table = new THREE.Group(); S.table.position.set(3.3, 0, 6.6); world.add(S.table);
  add(tbox(1.8, 0.07, 1.1, 1), M.woodL, 0, 0.8, 0, S.table); for (const sx of [-0.8, 0.8]) for (const sz of [-0.45, 0.45]) add(tbox(0.08, 0.8, 0.08, 1), M.wood, sx, 0.4, sz, S.table);
  S.chair = new THREE.Group(); S.chair.position.set(3.3, 0, 5.6); world.add(S.chair);
  add(tbox(0.5, 0.06, 0.5, 1), M.wood, 0, 0.48, 0, S.chair); add(tbox(0.5, 0.6, 0.06, 1), M.wood, 0, 0.8, -0.24, S.chair); for (const sx of [-0.2, 0.2]) for (const sz of [-0.2, 0.2]) add(tbox(0.05, 0.48, 0.05, 1), M.wood, sx, 0.24, sz, S.chair);
  // kitchen clock on the bath/kitchen wall (faces +z), hands animated
  S.clock = new THREE.Group(); S.clock.position.set(3.3, 2.05, 4.62); world.add(S.clock);
  const cf = add(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32), M.white, 0, 0, 0, S.clock, { cast: false }); cf.rotation.x = Math.PI / 2;
  const ring = add(new THREE.TorusGeometry(0.3, 0.035, 8, 32), M.red, 0, 0, 0.02, S.clock, { cast: false });
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; add(tbox(0.025, 0.06, 0.02, 1), M.dark, Math.sin(a) * 0.24, Math.cos(a) * 0.24, 0.035, S.clock, { cast: false }).rotation.z = -a; }
  S.hHour = new THREE.Group(); S.hMin = new THREE.Group(); S.hHour.position.z = S.hMin.position.z = 0.045; S.clock.add(S.hHour); S.clock.add(S.hMin);
  add(tbox(0.03, 0.15, 0.01, 1), M.dark, 0, 0.07, 0, S.hHour, { cast: false }); add(tbox(0.02, 0.22, 0.01, 1), M.dark, 0, 0.1, 0.005, S.hMin, { cast: false });
  // bathroom tub (along back wall)
  add(tbox(1.7, 0.6, 0.8, 1), M.tub, 5.6, 0.3, 0.6, world); S.tubWater = add(tbox(1.5, 0.04, 0.6, 1), M.water, 5.6, 0.2, 0.6, world, { cast: false });
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), M.steel, 6.3, 0.75, 0.3, world).rotation.x = Math.PI / 2;
  // ---------- front garden: fence (left), hedge (right), path ----------
  plane(1.2, 2.0, M.walk, -3.0, 0.035, 10.0);
  S.fence = new THREE.Group(); world.add(S.fence);
  for (let x = -7.0; x <= -0.6; x += 0.32) { if (x > -3.65 && x < -2.35) continue; add(tbox(0.12, 1.15, 0.05, 1), M.fence, x, 0.58, 11.0, S.fence); }
  for (const y of [0.35, 0.9]) { add(tbox(3.4, 0.08, 0.06, 1), M.fence, -5.3, y, 10.97, S.fence); add(tbox(1.3, 0.08, 0.06, 1), M.fence, -1.3, y, 10.97, S.fence); }
  S.gate = add(tbox(1.2, 1.0, 0.05, 1), M.fence, -3.0, 0.55, 11.0, world);
  const hedge = add(tbox(6.6, 1.05, 0.9, 1), M.hedge, 3.6, 0.52, 10.65, world); hedge.userData.hedge = true;
  for (let k = 0; k < 14; k++) add(new THREE.SphereGeometry(0.42, 10, 8), k % 2 ? M.hedge : M.green, 0.6 + k * 0.47, 1.0 + (k % 3) * 0.05, 10.65 + ((k * 7) % 3 - 1) * 0.12, world);
  // ---------- back garden ----------
  plane(14.2, 3, texM(P.planks(5), 4, 1), 0, 0.03, -1.5); // terrace
  for (let x = -9; x <= 9; x += 0.32) add(tbox(0.1, 1.2, 0.05, 1), M.fence, x, 0.6, -13, world);
  for (let z = -13; z <= 0; z += 0.32) { add(tbox(0.05, 1.2, 0.1, 1), M.fence, -9, 0.6, z, world); add(tbox(0.05, 1.2, 0.1, 1), M.fence, 9, 0.6, z, world); }
  for (const y of [0.3, 0.95]) { add(tbox(18, 0.08, 0.06, 1), M.fence, 0, y, -12.97, world); add(tbox(0.06, 0.08, 13, 1), M.fence, -8.97, y, -6.5, world); add(tbox(0.06, 0.08, 13, 1), M.fence, 8.97, y, -6.5, world); }
  for (const bz of [-6.2, -8.6]) { add(tbox(8, 0.18, 1.4, 1), M.dirt, 0, 0.09, bz, world); }
  // tomato + potato plants (scaled by garden growth)
  S.plants = []; S.tomatoes = []; S.flowers = [];
  for (let k = 0; k < 8; k++) { const G = new THREE.Group(); G.position.set(-3.5 + k, 0.18, -6.2); world.add(G); S.plants.push(G);
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 5), M.green, 0, 0.45, 0, G); add(new THREE.SphereGeometry(0.3, 10, 8), M.leaf, 0, 0.75, 0, G).scale.y = 1.3;
    for (let t = 0; t < 3; t++) { const tm = add(new THREE.SphereGeometry(0.07 + (k % 3) * 0.015, 8, 6), M.tomato, Math.sin(t * 2.1 + k) * 0.22, 0.55 + t * 0.15, 0.24, G); tm.scale.set(1, 0.8 + (t % 2) * 0.3, 1); S.tomatoes.push(tm); } }
  for (let k = 0; k < 8; k++) { const G = new THREE.Group(); G.position.set(-3.5 + k, 0.18, -8.6); world.add(G); S.plants.push(G); add(new THREE.SphereGeometry(0.32, 10, 8), M.leaf2, 0, 0.25, 0, G).scale.y = 0.7; }
  for (let k = 0; k < 26; k++) { const fl = add(new THREE.SphereGeometry(0.09, 8, 6), toon({ color: ['#f4d03a', '#f07aa8', '#ffffff', '#b07af0'][k % 4] }), -7 + (k * 0.53) % 14, 0.35 + (k % 3) * 0.08, -2.6 - ((k * 1.7) % 9.5), world); S.flowers.push(fl); }
  // rain buckets on the terrace + grill
  S.buckets = [];
  for (const [x, z, c] of [[5.6, -1.2, '#3a78c8'], [6.4, -1.9, '#e8a030'], [4.8, -2.2, '#d2452e']]) { const b = add(new THREE.CylinderGeometry(0.28, 0.22, 0.5, 14, 1, true), col(c), x, 0.25, z, world); b.material.side = THREE.DoubleSide; add(new THREE.CircleGeometry(0.22, 14), col(c), x, 0.01, z, world).rotation.x = -Math.PI / 2; const w = add(new THREE.CircleGeometry(0.25, 14), M.water, x, 0.1, z, world, { cast: false }); w.rotation.x = -Math.PI / 2; S.buckets.push(w); }
  S.grill = new THREE.Group(); S.grill.position.set(-4.6, 0, -1.4); world.add(S.grill);
  add(new THREE.SphereGeometry(0.35, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.dark, 0, 0.75, 0, S.grill); for (const a of [0, 2.1, 4.2]) { const l = add(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 5), M.dark, Math.cos(a) * 0.22, 0.38, Math.sin(a) * 0.22, S.grill); l.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); }
  add(new THREE.CylinderGeometry(0.34, 0.34, 0.02, 14), M.steel, 0, 0.76, 0, S.grill); S.grillFire = add(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 12), M.fireOn, 0, 0.74, 0, S.grill, { cast: false });
  // ---------- FRAU SCHMIDT (x -6..6, z 22..30) ----------
  wallX(22, -6, 6, [[-0.6, 0.6, 0, 2.2], [-4.6, -3.0, 0.9, 2.1], [3.0, 4.6, 0.9, 2.1]], M.extS, M.extS, -1);
  wallX(30, -6, 6, [], M.extS, M.extS, 1); wallZ(-6, 22, 30, [], M.extS, M.extS, -1); wallZ(6, 22, 30, [[25.2, 26.4, 0, 2.2]], M.extS, M.extS, 1);
  for (const x of [-3.8, 3.8]) add(tbox(1.6, 1.2, 0.05, 1), col('#1a1c2a'), x, 1.5, 21.98, world, { cast: false });
  for (const x of [-3.8, 3.8]) for (const y of [4.0]) add(tbox(1.2, 0.9, 0.05, 1), col('#1a1c2a'), x, y, 21.88, world, { cast: false });
  add(tbox(12, 2.4, 8, 2), M.extS, 0, 4.0, 26, world, { cast: false }); // upper floor block
  for (const x of [-3.8, 3.8]) add(tbox(1.3, 1.0, 0.08, 1), M.frame, x, 4.0, 21.98, world, { cast: false });
  const rS = (sgn) => { const r = add(tbox(12.8, 0.18, 5.0, 2), M.roof2, 0, 6.3, 26 + sgn * 2.2, world, { cast: false }); r.rotation.x = sgn * 0.55; }; rS(1); rS(-1);
  S.sDoor = add(tbox(1.2, 2.2, 0.08, 1), col('#8a3a4a'), 0, 1.1, 22.0, world);
  S.sBack = new THREE.Group(); S.sBack.position.set(6.0, 0, 25.2); world.add(S.sBack); add(tbox(0.08, 2.2, 1.2, 1), col('#8a3a4a'), 0, 1.1, 0.6, S.sBack, { cast: false });
  sign(plate('Nr. 8', 512, 256, '#8a3a4a'), 0.5, 0.25, 1.1, 2.0, 21.87, Math.PI);
  sign(plate('Schmidt', 768, 192, '#f2ead8', '#3a2a24'), 0.6, 0.15, -1.0, 1.25, 21.87, Math.PI);
  // mailbox
  add(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6), M.dark, 2.0, 0.5, 21.2, world); add(tbox(0.4, 0.3, 0.3, 1), col('#d8343a'), 2.0, 1.1, 21.2, world);
  // ---------- Nr. 12 (x 9..16) ----------
  wallX(22, 9, 16, [[12, 13.2, 0, 2.2], [9.8, 11.2, 0.9, 2.0], [14, 15.4, 0.9, 2.0]], M.ext12, M.ext12, -1); wallX(29, 9, 16, [], M.ext12, M.ext12, 1);
  wallZ(9, 22, 29, [], M.ext12, M.ext12, -1); wallZ(16, 22, 29, [], M.ext12, M.ext12, 1);
  for (const x of [10.5, 14.7]) add(tbox(1.4, 1.1, 0.05, 1), col('#2a3a5a'), x, 1.45, 21.98, world, { cast: false });
  const r12 = (sgn) => { const r = add(tbox(7.6, 0.18, 4.4, 2), M.roof, 12.5, H + 1.1, 25.5 + sgn * 1.9, world, { cast: false }); r.rotation.x = sgn * 0.55; }; r12(1); r12(-1);
  S.d12 = new THREE.Group(); S.d12.position.set(12, 0, 22); world.add(S.d12); add(tbox(1.2, 2.2, 0.08, 1), col('#3a6a3a'), 0.6, 1.1, 0, S.d12, { cast: false });
  S.sign12 = sign(plate('Nr. 12', 640, 256, '#2e5a9a'), 0.9, 0.36, 13.9, 2.35, 21.87, Math.PI);
  // ---------- neighbour houses for the street ----------
  const nb = (x, z, w, d, h, mat, face) => { const G = new THREE.Group(); G.position.set(x, 0, z); world.add(G); add(tbox(w, h, d, 2), mat, 0, h / 2, 0, G, { cast: false });
    const rf = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.4, 2.4, 4), M.roof, 0, h + 1.2, 0, G, { cast: false }); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
    for (const sx of [-0.25, 0.25]) for (const yy of [1.4, h - 1.3]) add(tbox(1.0, 1.1, 0.08, 1), col('#2a3a5a'), sx * w, yy, face * (d / 2 + 0.02), G, { cast: false });
    add(tbox(1.0, 2.1, 0.08, 1), col('#7a4a2a'), 0, 1.05, face * (d / 2 + 0.03), G, { cast: false }); };
  const pl = [texM(P.plaster(61, 20), 1, 1, '#f0c0a0'), texM(P.plaster(62, 200), 1, 1, '#c0d8f0'), texM(P.plaster(63, 60), 1, 1, '#f0e0a0'), texM(P.plaster(64, 300), 1, 1, '#e0c8e8')];
  [[-17, 4.5, 8, 8, 5.5, 1], [17, 4.5, 8, 8, 6, 1], [-28, 4.5, 9, 8, 5, 1], [28, 4.5, 8, 8, 5.5, 1], [-16, 26, 8, 8, 6, -1], [24, 26, 8, 8, 5.5, -1], [-27, 26, 9, 8, 6.5, -1], [35, 26, 8, 8, 5, -1]].forEach(([x, z, w, d, h, f], i) => nb(x, z, w, d, h, pl[i % 4], f));
  // street name sign at the corner (German)
  const st = canvasTex(1024, 220, (c, w, h) => { c.fillStyle = '#f4f4f0'; c.fillRect(0, 0, w, h); c.lineWidth = 16; c.strokeStyle = '#1a1a1a'; c.strokeRect(14, 14, w - 28, h - 28);
    c.font = 'bold 120px "DejaVu Sans", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1a1a1a'; c.fillText('Lindenstraße', w / 2, h / 2 + 6); });
  add(new THREE.CylinderGeometry(0.05, 0.05, 2.9, 8), M.steel, -8.4, 1.45, 11.4, world);
  for (const ry of [0, Math.PI]) sign(st, 1.5, 0.32, -8.4, 2.7, 11.4 + (ry ? -0.03 : 0.03), ry);
  // street lamps
  for (const x of [-12, 9.5, 30]) { add(new THREE.CylinderGeometry(0.06, 0.09, 4.0, 8), M.dark, x, 2.0, 11.3, world); add(tbox(0.45, 0.4, 0.45, 1), M.dark, x, 4.1, 11.3, world); }
  // ---------- trees, hills, mountains, clouds ----------
  const tree = (x, z, h = 4, r = 1.8) => { const G = new THREE.Group(); G.position.set(x, 0, z); world.add(G); add(new THREE.CylinderGeometry(0.16, 0.24, h, 7), M.trunk, 0, h / 2, 0, G);
    const crowns = []; for (let k = 0; k < 3; k++) { const c = add(new THREE.SphereGeometry(r * (1 - k * 0.18), 12, 10), k % 2 ? M.leaf2 : M.leaf, (k - 1) * r * 0.5, h + k * r * 0.35, (k % 2) * 0.4, G); c.scale.y = 0.85; crowns.push(c); } S.crowns.push(...crowns); return G; };
  S.crowns = [];
  tree(-11, -6, 4.5, 2); tree(11, -9, 4, 1.8); tree(-9.5, 10.2, 3.6, 1.4); tree(20, 9.8, 3.8, 1.6); tree(-20, 21.5, 4, 1.7); tree(7.6, 21.2, 3.4, 1.3);
  const rt = P.rng(44);
  for (let i = 0; i < 22; i++) { const a = rt() * Math.PI * 2, d = 40 + rt() * 40; tree(Math.cos(a) * d, Math.sin(a) * d * 0.7 + 8, 3.5 + rt() * 2.5, 1.5 + rt() * 1.2); }
  for (let i = 0; i < 14; i++) { const a = rt() * Math.PI * 2, d = 160 + rt() * 160; const h = add(new THREE.SphereGeometry(40 + rt() * 40, 20, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -14, Math.sin(a) * d, world, { cast: false }); h.scale.y = 0.45 + rt() * 0.3; S.hills = S.hills || []; S.hills.push(h); }
  for (let i = 0; i < 10; i++) { const a = rt() * Math.PI * 2, d = 520 + rt() * 200, hh = 140 + rt() * 120, r_ = 110 + rt() * 70; const G = new THREE.Group(); G.position.set(Math.cos(a) * d, -5, Math.sin(a) * d); world.add(G);
    add(new THREE.ConeGeometry(r_, hh, 7), M.mount, 0, hh / 2, 0, G, { cast: false }); add(new THREE.ConeGeometry(r_ * 0.32, hh * 0.32, 7), M.snow, 0, hh * 0.84, 0, G, { cast: false }); }
  addClouds(14, 90, 650, 110);
  // ---------- snow overlay (winter) ----------
  S.snow = new THREE.Group(); world.add(S.snow);
  const sn = (w, d, x, y, z, rxx = -Math.PI / 2) => plane(w, d, M.snow, x, y, z, rxx, 0, S.snow);
  sn(900, 900, 0, 0.0, -460); sn(900, 400, 0, 0.0, 225); sn(140, 1.6, 0, 0.05, 11.8); sn(140, 1.6, 0, 0.05, 20.2); sn(14.2, 13, 0, 0.04, -6.5); sn(14.2, 2, 0, 0.05, 10);
  for (const sgn of [1, -1]) { const r = add(tbox(15.3, 0.12, 5.6, 2), M.snow, 0, H + 1.33, 4.5 + sgn * 2.45, S.snow, { cast: false }); r.rotation.x = sgn * 0.5; }
  for (const sgn of [1, -1]) { const r = add(tbox(12.9, 0.12, 5.0, 2), M.snow, 0, 6.38, 26 + sgn * 2.2, S.snow, { cast: false }); r.rotation.x = sgn * 0.55; }
  add(tbox(6.6, 0.15, 0.95, 1), M.snow, 3.6, 1.12, 10.65, S.snow);
  S.snow.visible = false;
  // ---------- ice-cream van ("Eis") ----------
  S.van = new THREE.Group(); world.add(S.van);
  add(tbox(4.2, 2.1, 2.0, 1), col('#fbf4f8'), 0, 1.45, 0, S.van); add(tbox(1.4, 1.5, 1.95, 1), col('#f48ab0'), 2.7, 1.15, 0, S.van);
  add(tbox(1.3, 0.7, 2.0, 1), col('#7ab8e8'), 2.75, 1.55, 0, S.van, { cast: false });
  add(tbox(4.25, 0.3, 2.05, 1), col('#f48ab0'), 0, 0.55, 0, S.van);
  for (const [x, z] of [[-1.3, 1], [-1.3, -1], [2.5, 1], [2.5, -1]]) { const w = add(new THREE.CylinderGeometry(0.4, 0.4, 0.25, 16), M.dark, x, 0.4, z, S.van); w.rotation.x = Math.PI / 2; }
  add(tbox(2.4, 0.9, 0.06, 1), col('#2a2a32'), -0.4, 1.7, 1.02, S.van, { cast: false }); // serving hatch
  const eisT = canvasTex(1024, 384, (c, w, h) => { c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(10, 10, w - 20, h - 20, 80); c.fill(); c.lineWidth = 22; c.strokeStyle = '#f48ab0'; c.beginPath(); c.roundRect(30, 30, w - 60, h - 60, 60); c.stroke();
    c.font = 'bold 230px "DejaVu Sans", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 20; c.strokeStyle = '#7a2a4a'; c.strokeText('Eis', w / 2 + 120, h / 2 + 10); c.fillStyle = '#e83a7a'; c.fillText('Eis', w / 2 + 120, h / 2 + 10);
    c.fillStyle = '#e8b060'; c.beginPath(); c.moveTo(150, 330); c.lineTo(100, 180); c.lineTo(200, 180); c.closePath(); c.fill(); for (const [x, y, cc] of [[125, 165, '#f8c0d8'], [175, 165, '#c0f0d0'], [150, 120, '#fff0a0']]) { c.fillStyle = cc; c.beginPath(); c.arc(x, y, 40, 0, 7); c.fill(); } });
  const eb = add(new THREE.PlaneGeometry(2.6, 0.98), new THREE.MeshBasicMaterial({ map: eisT, side: THREE.DoubleSide }), -0.3, 3.05, 0, S.van, { cast: false }); eb.userData.ndSkip = true;
  add(tbox(2.7, 1.05, 0.06, 1), col('#f48ab0'), -0.3, 3.05, -0.05, S.van);
  const eisSide = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = '#fbf4f8'; c.fillRect(0, 0, w, h); c.font = 'bold 150px "DejaVu Sans", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#e83a7a'; c.fillText('Eis', w / 2, h / 2 + 6); });
  const es = add(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: eisSide }), -0.4, 0.95, 1.03, S.van, { cast: false }); es.userData.ndSkip = true;
  S.van.position.set(-60, 0, 15.2); S.van.rotation.y = Math.PI;
  // ---------- SCHMIDT'S CELLAR (separate set at x = 80) ----------
  const CX = 80, cellar = new THREE.Group(); cellar.position.set(CX, 0, 0); world.add(cellar);
  const cw = texM(P.stone(71, 30, 8, 62, 96, 48), 2, 1, '#c8c0b0');
  const cwall = (w, x, z, ry) => { const m = add(new THREE.PlaneGeometry(w, 2.6), cw, x, 1.3, z, cellar, { cast: false }); m.rotation.y = ry; };
  cwall(6, 0, -3, 0); cwall(6, -3, 0, Math.PI / 2); cwall(6, 3, 0, -Math.PI / 2);
  plane(6, 6, texM(P.stone(72, 30, 6, 50, 64, 64), 3, 3), CX, 0.01, 0); plane(6, 6, col('#6a6058'), CX, 2.6, 0, Math.PI / 2);
  const shelfTex = (seed) => canvasTex(1024, 512, (c, w, h) => { c.fillStyle = '#4a3220'; c.fillRect(0, 0, w, h); const r = P.rng(seed);
    const kinds = [['Ravioli', '#d84a2a'], ['Linsensuppe', '#7a9a3a'], ['Pfirsiche', '#f0a030'], ['Ravioli', '#d84a2a'], ['Bohnen', '#3a6ac8'], ['Mais', '#f2d23a']];
    for (let row = 0; row < 4; row++) { const y0 = row * 128; c.fillStyle = '#7a5a3a'; c.fillRect(0, y0 + 114, w, 14);
      for (let x = 4; x < w - 60; x += 64) { const [lab, cc] = kinds[(r() * kinds.length) | 0]; c.fillStyle = '#c8ccd4'; c.fillRect(x, y0 + 8, 58, 106); c.fillStyle = cc; c.fillRect(x, y0 + 26, 58, 66);
        c.fillStyle = '#fff8e8'; c.font = `bold ${lab.length > 8 ? 10 : 13}px "DejaVu Sans", Arial`; c.textAlign = 'center'; c.fillText(lab, x + 29, y0 + 62); c.strokeStyle = '#1a1416'; c.lineWidth = 3; c.strokeRect(x, y0 + 8, 58, 106); } } });
  const shelf = (x, z, ry, seed) => { const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; cellar.add(G);
    add(tbox(2.8, 2.5, 0.45, 1), M.woodD, 0, 1.25, -0.05, G); const f = add(new THREE.PlaneGeometry(2.7, 2.4), toon({ map: shelfTex(seed) }), 0, 1.25, 0.18, G, { cast: false }); return G; };
  shelf(-1.45, -2.7, 0, 81); shelf(1.45, -2.7, 0, 82); shelf(-2.7, -1.0, Math.PI / 2, 83); shelf(2.7, -1.0, -Math.PI / 2, 84); shelf(-2.7, 1.6, Math.PI / 2, 85); shelf(2.7, 1.6, -Math.PI / 2, 86);
  // toilet paper pyramid: 16 rolls (6+5+3+2)
  const tp = col('#ffffff'); let n = 0;
  for (const [row, cnt] of [[0, 6], [1, 5], [2, 3], [3, 2]]) for (let k = 0; k < cnt; k++) { const r_ = add(new THREE.CylinderGeometry(0.13, 0.13, 0.24, 14), tp, CX + 0.9 + (k - (cnt - 1) / 2) * 0.27, 0.12 + row * 0.25, -1.6, world); n++; }
  const lbl = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#e8f0ff'; c.fillRect(0, 0, w, h); c.font = 'bold 64px "DejaVu Sans", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2a4a9a'; c.fillText('Klopapier', w / 2, h / 2); });
  const lb = add(new THREE.PlaneGeometry(0.9, 0.22), new THREE.MeshBasicMaterial({ map: lbl }), CX + 0.9, 1.2, -1.52, world, { cast: false }); lb.userData.ndSkip = true;
  add(new THREE.SphereGeometry(0.16, 12, 8), M.lampOff, CX, 2.45, 0, world, { cast: false });
  S.cellarX = CX;
};

// ---------- tally drawing ----------
const drawTally = (c, n) => {
  const g = c.getContext('2d'), W = c.width, H = c.height; g.clearRect(0, 0, W, H);
  const full = Math.floor(n), frac = n - full, gw = 148, gh = 100, perRow = 13;
  g.strokeStyle = '#1e1a22'; g.lineCap = 'round'; g.lineWidth = 9;
  const line = (x0, y0, x1, y1, t = 1) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t); g.stroke(); };
  const total = Math.min(365, full + (frac > 0 ? 1 : 0));
  for (let i = 0; i < total; i++) {
    const grp = Math.floor(i / 5), k = i % 5, row = Math.floor(grp / perRow), colI = grp % perRow, t = i === full ? frac : 1;
    const x = 40 + colI * gw + ((grp * 7) % 5) - 2, y = 30 + row * gh + ((grp * 3) % 4);
    const wob = ((i * 37) % 7) - 3;
    if (k < 4) line(x + k * 22 + wob * 0.6, y, x + k * 22 - wob * 0.4 + 2, y + 74, t);
    else line(x - 12, y + 62, x + 82, y + 10, t);
  }
};
export const update = (ctx, W, f) => {
  const s = S;
  // sofa: 0 = in front of TV, 1 = against the front door
  const k = W.sofa ?? 0, sm = k * k * (3 - 2 * k);
  s.sofa.position.set(-4.4 + (-2.95 + 4.4) * sm, 0, 4.2 + (8.35 - 4.2) * sm); s.sofa.rotation.y = Math.PI / 2 + (Math.PI / 2) * sm;
  // wardrobe: 0 = by the partition, 1 = in front of the back door, 2 = slid aside for the garden
  const w = W.wardrobe ?? 0, wx = w <= 1 ? -1.0 + (-3.0 + 1.0) * w : -3.0 + (-4.6 + 3.0) * (w - 1);
  s.wardrobe.position.set(wx, 0, 0.42);
  s.door.rotation.y = (W.door ?? 0) * 1.6; s.gate.visible = !W.gateOpen;
  s.sBack.rotation.y = (W.sBack ?? 0) * -1.2;
  s.d12.rotation.y = -(W.d12 ?? 0) * 1.4;
  s.papers.forEach((m) => { m.visible = !!W.paper; }); { const k = W.paperK ?? 1, m = s.papers[1]; m.scale.y = k; m.position.y = 0.825 + 1.45 * k / 2; }
  const pw = W.power ?? 1;
  s.lamp.material = s.lampK.material = pw ? s.M.lampOn : s.M.lampOff; s.tvScreen.material = W.tv ? s.M.tvOn : s.M.tvOff;
  s.fire.material = W.fire ? s.M.fireOn : s.M.dark; s.grillFire.material = W.grill ? s.M.fireOn : s.M.dark;
  s.billy.visible = W.billy ?? true; s.billy.scale.y = W.billyH ?? 1; s.table.visible = W.table ?? true; s.chair.visible = W.table ?? true;
  s.tubWater.position.y = 0.12 + 0.42 * (W.tub ?? 0); s.tubWater.visible = (W.tub ?? 0) > 0.02;
  // garden growth 0..1, tomatoes ripen at ~0.7
  const gr = W.garden ?? 0;
  s.plants.forEach((p) => { p.visible = gr > 0.02; p.scale.setScalar(Math.max(0.05, gr)); });
  s.tomatoes.forEach((t) => { t.visible = gr > 0.6; t.scale.setScalar(W.tomBig ?? 0.6); });
  s.flowers.forEach((fl) => { fl.visible = !!W.bloom; });
  s.buckets.forEach((b, i) => { b.position.y = 0.04 + 0.4 * (W.rainLvl ?? 0.2) * (1 - i * 0.15); });
  s.snow.visible = !!W.snow; s.grass.material.color.set(W.snow ? '#ffffff' : (W.dry ? '#d8d090' : '#ffffff'));
  s.crowns.forEach((c) => { c.visible = !W.snow; });
  // clock hands
  const hr = W.clock ?? 7, mn = (hr % 1) * 60;
  s.hHour.rotation.z = -(hr % 12) / 12 * Math.PI * 2; s.hMin.rotation.z = -mn / 60 * Math.PI * 2;
  s.van.position.x = W.vanX ?? -60;
  const n = Math.round((W.tally ?? 0) * 20) / 20;
  if (n !== TALLY.n) { TALLY.n = n; drawTally(s.tallyC, n); s.tallyT.needsUpdate = true; }
};
