// 3D sets for the mall (three.js r149), toon-shaded with ink outlines (inverted hulls) to sit with the 2D cast.
// Units: metres. The 2D people/zombies are composited on top at projected 3D positions (see spriteAt / kAt).
//   MALL3D.night(t, cam)  -> renders the exterior + parking lot, returns { bg, fg } canvases (fg = near cars/litter)
//   MALL3D.day(t, cam)    -> renders the bright atrium, returns { bg, fg }
//   cam: { pos: [x,y,z], look: [x,y,z], fov }
const MALL3D = (() => {
  const TH = THREE; let R = null, CAM = null;
  const INK = new TH.MeshBasicMaterial({ color: 0x07080c, side: TH.BackSide });
  function renderer() {
    if (R) return R;
    R = new TH.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    R.setPixelRatio(1); R.setSize(W, H, false); R.outputEncoding = TH.sRGBEncoding; R.shadowMap.enabled = true; R.shadowMap.type = TH.PCFShadowMap;
    CAM = new TH.PerspectiveCamera(40, W / H, .1, 2000);
    return R;
  }
  // ---------- helpers ----------
  const col = c => new TH.Color(c);
  function mat(c, o = {}) { const m = o.basic ? new TH.MeshBasicMaterial({ color: col(c) }) : (o.phong ? new TH.MeshPhongMaterial({ color: col(c), shininess: o.shin || 60, specular: col(o.spec || '#333344'), flatShading: true }) : new TH.MeshLambertMaterial({ color: col(c) })); if (o.map) m.map = o.map; if (o.em) { m.emissive = col(o.em); m.emissiveIntensity = o.emi ?? 1; } if (o.op !== undefined) { m.transparent = true; m.opacity = o.op; m.depthWrite = false; } if (o.alphaTest) { m.alphaTest = o.alphaTest; m.side = TH.DoubleSide; } return m; }
  function box(g, w, h, d, c, x, y, z, o = {}) {
    const m = new TH.Mesh(new TH.BoxGeometry(w, h, d), c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz; if (o.rx) m.rotation.x = o.rx;
    m.castShadow = !!o.cast; m.receiveShadow = o.recv ?? true; g.add(m);
    const ink = o.ink ?? .05; if (ink > 0) { const hl = new TH.Mesh(m.geometry, INK); hl.scale.set(1 + 2 * ink / w, 1 + 2 * ink / h, 1 + 2 * ink / d); m.add(hl); }
    if (o.layer) { m.layers.set(o.layer); m.children.forEach(ch => ch.layers.set(o.layer)); }
    return m;
  }
  function cyl(g, r0, r1, h, c, x, y, z, o = {}) {
    const m = new TH.Mesh(new TH.CylinderGeometry(r0, r1, h, o.seg || 14), c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); if (o.rz) m.rotation.z = o.rz; if (o.rx) m.rotation.x = o.rx; m.castShadow = !!o.cast; m.receiveShadow = true; g.add(m);
    if ((o.ink ?? .04) > 0) { const hl = new TH.Mesh(new TH.CylinderGeometry(r0 + (o.ink ?? .04), r1 + (o.ink ?? .04), h + (o.ink ?? .04) * 2, o.seg || 14), INK); m.add(hl); }
    if (o.layer) { m.layers.set(o.layer); m.children.forEach(ch => ch.layers.set(o.layer)); }
    return m;
  }
  function plane(g, w, h, m, x, y, z, o = {}) { const p = new TH.Mesh(new TH.PlaneGeometry(w, h), m); p.position.set(x, y, z); if (o.rx !== undefined) p.rotation.x = o.rx; if (o.ry) p.rotation.y = o.ry; if (o.rz) p.rotation.z = o.rz; p.receiveShadow = true; if (o.layer) p.layers.set(o.layer); g.add(p); return p; }
  function canvasTex(w, h, draw, o = {}) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); draw(c, w, h); const t = new TH.CanvasTexture(cv); t.encoding = TH.sRGBEncoding; t.anisotropy = 8; if (o.rep) { t.wrapS = t.wrapT = TH.RepeatWrapping; t.repeat.set(o.rep[0], o.rep[1]); } t.userData = { cv, c, draw }; return t; }
  function signTex(text, bg, fg, o = {}) {
    return canvasTex(o.w || 1024, o.h || 200, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = o.rim || 'rgba(0,0,0,.45)'; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12);
      c.font = `${o.weight || 700} ${o.size || h * .62}px ${o.font || 'FOswald'}`; c.textAlign = 'center'; c.textBaseline = 'middle'; if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = 24; } c.fillStyle = fg; c.fillText(text, w / 2, h / 2 + (o.dy || 4)); });
  }
  function noiseTex(base, spots, n, w = 512, h = 512, rep = [1, 1], extra) {
    return canvasTex(w, h, (c) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { c.fillStyle = spots[i % spots.length]; c.globalAlpha = .05 + rnd(i + 3) * .12; c.beginPath(); c.ellipse(rnd(i) * w, rnd(i + 99) * h, 4 + rnd(i + 7) * 40, 3 + rnd(i + 8) * 26, rnd(i) * 3, 0, Math.PI * 2); c.fill(); } c.globalAlpha = 1; if (extra) extra(c, w, h); }, { rep });
  }
  function setCam(cam) { CAM.fov = cam.fov || 40; CAM.updateProjectionMatrix(); CAM.position.set(...cam.pos); CAM.up.set(0, 1, 0); CAM.lookAt(...cam.look); CAM.updateMatrixWorld(); }
  // projection for 2D sprites: screen x,y and pixels-per-metre at that point
  const V = new TH.Vector3();
  function proj(x, y, z) { V.set(x, y, z).applyMatrix4(CAM.matrixWorldInverse); const depth = -V.z; V.set(x, y, z).project(CAM); const f = (H / 2) / Math.tan(CAM.fov * Math.PI / 360); return { x: (V.x + 1) / 2 * W, y: (1 - V.y) / 2 * H, ppm: f / Math.max(.01, depth), depth, front: depth > 0 }; }
  const snap = (layerMask) => { renderer(); return layerMask; };
  function draw(scene, mask) { const r = renderer(); CAM.layers.disableAll(); for (const l of mask) CAM.layers.enable(l); r.setClearColor(0x000000, 0); r.clear(); r.render(scene, CAM); return r.domElement; }

  // ================= NIGHT EXTERIOR =================
  let N = null;
  function carModel(g, x, z, ry, color, o = {}) {
    const c = new TH.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); const L = o.layer || 0;
    // side profile extruded across the width: hood, windscreen, roof, rear window, boot
    const prof = (pts, depth, m, z0) => { const sh = new TH.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) sh.lineTo(p[0], p[1]); const geo = new TH.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 1 }); geo.translate(0, 0, -depth / 2 + (z0 || 0)); const ms = new TH.Mesh(geo, m); ms.castShadow = true; ms.receiveShadow = true; c.add(ms); if (L) ms.layers.set(L); return ms; };
    const paint = mat(color, { phong: 1, shin: 50, spec: '#556070' });
    const body = prof([[-2.2, .32], [2.2, .32], [2.25, .72], [2.05, .86], [1.0, .95], [.45, 1.42], [-.95, 1.46], [-1.65, 1.0], [-2.22, .9]], 1.72, paint);
    const hull = new TH.Mesh(body.geometry, INK); hull.scale.set(1.025, 1.04, 1.04); body.add(hull); if (L) hull.layers.set(L);
    const glass = mat('#16243c', { phong: 1, shin: 140, spec: '#9aaadd' });
    prof([[.88, .98], [.42, 1.36], [-.9, 1.4], [-1.52, 1.0]], 1.78, glass);
    box(c, .06, .5, 1.8, color, -.25, 1.18, 0, { ink: 0, layer: L }); // B-pillar
    box(c, 4.5, .16, 1.9, '#15171c', 0, .38, 0, { ink: .02, layer: L }); // bumpers / sill
    for (const [wx, wz] of [[-1.35, .9], [1.35, .9], [-1.35, -.9], [1.35, -.9]]) { cyl(c, .38, .38, .26, '#0c0d10', wx, .38, wz, { rx: Math.PI / 2, ink: .03, layer: L }); cyl(c, .2, .2, .28, '#7a808c', wx, .38, wz, { rx: Math.PI / 2, ink: 0, layer: L }); }
    const hl = mat('#fff4d0', { basic: 1 }), tl = mat('#ff2a2a', { basic: 1 });
    for (const s of [-1, 1]) { box(c, .08, .14, .34, o.lights ? hl : mat('#9aa0a8'), 2.24, .74, s * .6, { ink: 0, layer: L }); box(c, .08, .16, .3, tl, -2.24, .82, s * .62, { ink: 0, layer: L }); }
    if (o.haz) { c.userData.haz = []; for (const [hx, hz] of [[2.22, .86], [2.22, -.86], [-2.22, .86], [-2.22, -.86]]) c.userData.haz.push(box(c, .1, .12, .16, mat('#ffa020', { basic: 1 }), hx, .64, hz, { ink: 0, layer: L })); }
    if (o.door) { const d = box(c, 1.1, .75, .06, paint, .5, .9, .95, { ink: .03, layer: L }); d.rotation.y = -.9; d.position.set(.9, .9, 1.35); }
    return c;
  }
  function cartModel(g, x, z, ry, o = {}) {
    const c = new TH.Group(); c.position.set(x, 0, z); c.rotation.y = ry; if (o.tip) { c.rotation.z = o.tip; c.position.y = .35; } g.add(c); const L = o.layer || 0;
    const wire = canvasTex(128, 128, (cc, w, h) => { cc.clearRect(0, 0, w, h); cc.strokeStyle = '#b8c2d4'; cc.lineWidth = 5; for (let i = 0; i <= 8; i++) { cc.beginPath(); cc.moveTo(i * 16, 0); cc.lineTo(i * 16, h); cc.stroke(); cc.beginPath(); cc.moveTo(0, i * 16); cc.lineTo(w, i * 16); cc.stroke(); } });
    const wm = mat('#c8d0dc', { map: wire, alphaTest: .4 });
    for (const [w, h, x0, y0, z0, ry2] of [[.9, .5, 0, .75, .28, 0], [.9, .5, 0, .75, -.28, 0], [.56, .5, .45, .75, 0, Math.PI / 2], [.56, .5, -.45, .75, 0, Math.PI / 2]]) plane(c, w, h, wm, x0, y0, z0, { ry: ry2, layer: L });
    plane(c, .9, .56, wm, 0, .5, 0, { rx: -Math.PI / 2, layer: L });
    box(c, .05, .05, .6, '#c82a30', -.55, 1.08, 0, { ink: .015, layer: L });
    for (const [wx, wz] of [[.35, .22], [.35, -.22], [-.35, .22], [-.35, -.22]]) { cyl(c, .02, .02, .45, '#a0a8b8', wx, .27, wz, { ink: 0, layer: L }); cyl(c, .07, .07, .05, '#111', wx, .07, wz, { rx: Math.PI / 2, ink: 0, layer: L }); }
    return c;
  }
  function lampPole(g, x, z, on) {
    cyl(g, .12, .16, 8, '#1a1e28', x, 4, z, { ink: .04 }); box(g, 1.6, .14, .14, '#1a1e28', x + .7, 7.95, z, { ink: .03 });
    box(g, .7, .14, .36, on ? mat('#eaf2ff', { basic: 1 }) : '#2a2e38', x + 1.4, 7.85, z, { ink: .03 });
    if (on) { const s = new TH.SpotLight(0xbcd0ff, 2.2, 26, .75, .6, 1.2); s.position.set(x + 1.4, 7.8, z); s.target.position.set(x + 2.2, 0, z + .5); g.add(s); g.add(s.target); return s; }
  }
  function buildNight() {
    const sc = new TH.Scene(); sc.fog = new TH.FogExp2(0x0a1022, .011); const g = new TH.Group(); sc.add(g);
    const hemiL = new TH.HemisphereLight(0x3a4a80, 0x0a0c14, .55); sc.add(hemiL);
    const moonL = new TH.DirectionalLight(0x8aa4ff, .55); moonL.position.set(-40, 60, 40); sc.add(moonL);
    const concrete = noiseTex('#2a3142', ['#101420', '#3a4256', '#1a1f2c'], 400, 512, 512, [6, 2], (c, w, h) => { c.strokeStyle = 'rgba(8,10,16,.55)'; c.lineWidth = 3; for (let x = 0; x <= w; x += 128) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 128) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } for (let i = 0; i < 26; i++) { const x = rnd(i + 5) * w; const gg = c.createLinearGradient(0, rnd(i) * h, 0, h); gg.addColorStop(0, 'rgba(6,8,12,.35)'); gg.addColorStop(1, 'rgba(6,8,12,0)'); c.fillStyle = gg; c.fillRect(x, rnd(i) * h * .5, 6 + rnd(i + 2) * 14, h); } });
    const wall = mat('#ffffff', { map: concrete });
    // ---- main volumes ----
    for (const s of [-1, 1]) box(g, 32, 15, 40, wall, s * 32, 7.5, -20, { ink: .12 });   // wings
    box(g, 32, 21, 39, wall, 0, 10.5, -21, { ink: .14 });                                   // tower core (front at z = -1.5)
    for (const s of [-1, 1]) box(g, 2, 21, 3.6, wall, s * 15, 10.5, .2, { ink: .1 });       // tower side piers
    box(g, 32, 6, 3.6, wall, 0, 18, .2, { ink: .1 });                                       // lintel above the glass
    plane(g, 28, 15, mat('#06080c'), 0, 7.5, -1.45);                                         // dark interior
    for (let i = -6; i <= 6; i++) if (Math.abs(i) > 1) box(g, .9, 15.2, .9, '#232a3a', i * 8, 7.6, .25, { ink: .05 }); // pilasters
    for (const y of [5.2, 10.4]) box(g, 96.4, .5, .9, '#1c2230', 0, y, .3, { ink: .05 });   // horizontal bands
    box(g, 97, .9, 41, '#161b26', 0, 15.2, -20, { ink: .08 }); box(g, 33, .9, 43, '#161b26', 0, 21.2, -19.5, { ink: .08 }); // roof caps
    // ---- glass curtain wall of the tower (dark, with barricade shelves and a green exit light behind) ----
    const glass = mat('#0e2a34', { phong: 1, shin: 140, spec: '#7aa8c8' }); glass.transparent = true; glass.opacity = .78;
    for (let i = 0; i < 6; i++) box(g, 3.6, 2.8 + rnd(i) * 1.2, .8, ['#2a2f3c', '#30283a', '#283a34'][i % 3], -9 + i * 3.7, 1.6, -.6, { ink: .04 }); // shelves pushed against the glass
    const exitTex = signTex('NOTAUSGANG', '#0c8a48', '#eafff2', { w: 512, h: 128, size: 72 }); plane(g, 2.4, .6, mat('#fff', { basic: 1, map: exitTex }), 7, 5.2, -1.4);
    plane(g, 28, 15, glass, 0, 7.5, 1.0);
    for (let i = 0; i <= 9; i++) box(g, .22, 15, .3, '#0b0e14', -14 + i * 28 / 9, 7.5, 1.1, { ink: .03 });
    for (let j = 0; j <= 4; j++) box(g, 28, .2, .3, '#0b0e14', 0, .3 + j * 3.6, 1.1, { ink: .03 });
    for (let k = 0; k < 7; k++) box(g, .04, 2 + rnd(k) * 2, .04, '#9ab0c8', -2 + rnd(k + 3) * 3, 2.6 + rnd(k + 5) * 1.5, 1.2, { ink: 0, rz: (rnd(k + 9) - .5) * 2.4 }); // a crack in the door glass
    // canopy over the doors on columns
    box(g, 22, .7, 5, '#1d2330', 0, 4.8, 3.6, { ink: .08 }); for (const x of [-10, -3.5, 3.5, 10]) cyl(g, .22, .22, 4.6, '#2a3040', x, 2.3, 5.8, { ink: .05 });
    // ---- wings: dead shop signs, dark windows, a few broken ----
    const wingSigns = [['ELEKTRO', -40], ['MODE', -28], ['SCHUHE', 28], ['SPORT', 40]];
    for (const [n, x] of wingSigns) { box(g, 8.5, 1.4, .5, '#151a24', x, 12.3, .4, { ink: .05 }); plane(g, 8.2, 1.15, mat('#fff', { map: signTex(n, '#1b2130', '#4a5266', { w: 1024, h: 180, font: 'FOswald', size: 130 }) }), x, 12.3, .66); }
    for (let i = 0; i < 8; i++) { const x = (i < 4 ? -44 : 20) + (i % 4) * 7.2 + 3.4, broken = i === 2 || i === 6; box(g, 6, 3.6, .2, broken ? '#1c2430' : glass, x, 2.4, .2, { ink: .04 }); if (broken) for (let k = 0; k < 6; k++) box(g, .05, 1.8, .05, '#6a7a90', x - 1.5 + k * .6, 2.6, .35, { ink: 0, rz: (rnd(k + i) - .5) * 1.6 }); for (let k = 0; k < 3; k++) box(g, .5 + rnd(k) * .8, .6, .5, '#1a1d26', x - 2 + k * 2, .3, .8, { ink: .03 }); }
    for (let i = 0; i < 10; i++) for (let j = 0; j < 2; j++) { if (Math.abs(i - 4.5) < 2.2) continue; box(g, 5.4, 2.2, .15, rnd(i * 3 + j) > .8 ? '#202838' : glass, -43 + i * 9.6, 7.2 + j * 3.6, .25, { ink: .03 }); }
    // rooftop clutter (seen during the crane): AC boxes, antenna, HILFE letters hidden on top
    for (let i = 0; i < 5; i++) box(g, 3, 1.6, 2.4, '#262c3a', -38 + i * 17, 16.4, -10 - rnd(i) * 10, { ink: .06 });
    cyl(g, .08, .08, 8, '#3a4252', 6, 25.5, -12, { ink: .03 });
    // ---- neon sign (canvas texture, redrawn on flicker) ----
    const sign = canvasTex(2048, 300, () => {}); N = { sign, sc, hemiL, moonL };
    box(g, 30, 3.6, .6, '#0a0c12', 0, 23.4, 1.2, { ink: .08 }); for (const x of [-10, 0, 10]) box(g, .3, 2.6, .3, '#10131c', x, 21.8, 1.2, { ink: .03 });
    plane(g, 29.4, 3.0, mat('#fff', { basic: 1, map: sign }), 0, 23.4, 1.52);
    N.neonL = new TH.PointLight(0xff3a7a, 6, 34, 1.6); N.neonL.position.set(0, 22, 7); sc.add(N.neonL);
    const em = new TH.PointLight(0x30ff90, 1.2, 14, 1.5); em.position.set(7, 4, 1); sc.add(em);
    // ---- parking lot ----
    const asph = noiseTex('#141822', ['#0a0d14', '#1e2230', '#262a36'], 900, 1024, 1024, [1, 1], (c, w, h) => {
      c.strokeStyle = 'rgba(200,205,215,.55)'; c.lineWidth = 7; for (let r = 0; r < 3; r++) for (let i = 0; i < 16; i++) { const x = 40 + i * 60, y0 = 180 + r * 300; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + 150); c.stroke(); }
      c.fillStyle = 'rgba(200,205,215,.4)'; for (let r = 0; r < 3; r++) c.fillRect(30, 330 + r * 300, 960, 6);
      for (let i = 0; i < 70; i++) { c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 2; c.beginPath(); let x = rnd(i + 40) * w, y = rnd(i + 80) * h; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rnd(i * 5 + k) - .5) * 60; y += (rnd(i * 7 + k) - .5) * 60; c.lineTo(x, y); } c.stroke(); } // cracks
      for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(rnd(i + 200) * w, rnd(i + 300) * h, 10 + rnd(i) * 40, 6 + rnd(i) * 20, 0, 0, Math.PI * 2); c.fill(); } // oil stains
    });
    asph.wrapS = asph.wrapT = TH.RepeatWrapping; asph.repeat.set(3, 2.4);
    const lotM = mat('#ffffff', { phong: 1, shin: 30, spec: '#3a4256', map: asph }); const lot = plane(g, 120, 90, lotM, 0, 0, 44, { rx: -Math.PI / 2 }); lot.receiveShadow = true;
    plane(g, 100, 4, mat('#1e2330'), 0, .02, 1.6, { rx: -Math.PI / 2 }); box(g, 100, .18, .35, '#3a4050', 0, .09, 3.6, { ink: .03 }); // sidewalk + kerb
    // puddles: glossy and tinted by the neon + hazard
    N.puddles = [];
    for (const [px, pz, rx, rz, tint] of [[-3, 13, 3.2, 1.3, '#4a1430'], [9, 22, 2.2, .9, '#2a1a30'], [-14, 25, 2.6, 1.1, '#3a2410'], [4, 36, 3.5, 1.4, '#3a1028']]) { const m = mat(tint, { phong: 1, shin: 200, spec: '#ffffff' }); const p = new TH.Mesh(new TH.CircleGeometry(1, 28), m); p.scale.set(rx, rz, 1); p.rotation.x = -Math.PI / 2; p.position.set(px, .03, pz); g.add(p); N.puddles.push(m); }
    // islands with dead shrubs, bollards, bins, trolley shelter
    for (const [ix, iz] of [[-22, 18], [22, 18], [-22, 32], [22, 32]]) { box(g, 3, .3, 8, '#2a2f38', ix, .15, iz, { ink: .03 }); for (let k = 0; k < 3; k++) { const b = new TH.Mesh(new TH.IcosahedronGeometry(.7, 0), mat('#232a1e')); b.position.set(ix + (k - 1) * .6, .8, iz - 2 + k * 2); g.add(b); } }
    for (let i = 0; i < 9; i++) cyl(g, .12, .12, .9, '#c8a030', -16 + i * 4, .45, 4.2, { ink: .03 });
    box(g, 6, .12, 2.2, '#20252f', 30, 2.6, 10, { ink: .04 }); for (const x of [27.2, 32.8]) cyl(g, .07, .07, 2.6, '#3a4050', x, 1.3, 9.1, { ink: .02 });
    for (let k = 0; k < 4; k++) cartModel(g, 28.6 + k * .55, 9.6, 0);
    box(g, .7, 1.1, .7, '#2a4a36', -9, .55, 4.6, { ink: .04 }); box(g, .7, .7, 1.1, '#2a4a36', 12, .35, 5.4, { ink: .04, rz: Math.PI / 2 }); // bins, one toppled
    // lamps
    N.lamps = [lampPole(g, -18, 12, true), lampPole(g, 16, 26, true), lampPole(g, -12, 40, false), lampPole(g, 26, 44, false)];
    // cars (bg: far rows; fg layer 1: the hazard car and near ones)
    const cars = [[-30, 13, .1, '#3a4458', { layer: 2 }], [-16, 12, -.05, '#4a3a3a', { door: 1, layer: 2 }], [16, 12, 3.14, '#2f4a3a', { layer: 2 }], [-22, 27, .2, '#5a5a62', { layer: 1 }], [18, 28, -.1, '#3a3a4a', { layer: 1 }], [30, 24, 1.5, '#6a5030', { layer: 1 }]];
    for (const [x, z, r, c, o] of cars) carModel(g, x, z, r, c, o || {});
    N.hazCar = carModel(g, 11, 30, -.4, '#24404c', { haz: 1, layer: 1 }); N.hazL = new TH.PointLight(0xff9a20, 0, 14, 1.4); N.hazL.position.set(11, 1.2, 30); sc.add(N.hazL); N.hazL.layers.enableAll(); N.neonL.layers.enableAll(); sc.traverse(o => { if (o.isLight) o.layers.enableAll(); });
    carModel(g, -12, 31, 2.6, '#3a1e1e', { layer: 1, door: 1 });
    cartModel(g, 6.5, 37.5, .6, { tip: 1.35, layer: 1 }); cartModel(g, -3, 38, -.3, { layer: 1 });
    // litter (layer 1 near camera, layer 0 further)
    const pap = [mat('#b8bcc6'), mat('#a89a80'), mat('#c8c0b0')];
    for (let i = 0; i < 140; i++) { const z = 6 + rnd(i + 1) * 46, p = plane(g, .25 + rnd(i) * .3, .3 + rnd(i + 2) * .3, pap[i % 3], -30 + rnd(i + 9) * 60, .035 + i * .0001, z, { rx: -Math.PI / 2, rz: rnd(i) * 6, layer: z > 30 ? 1 : 0 }); }
    for (let i = 0; i < 12; i++) { const b = new TH.Mesh(new TH.IcosahedronGeometry(.35, 0), mat('#0f1116')); b.scale.y = .7; b.position.set(-20 + rnd(i + 50) * 40, .22, 6 + rnd(i + 60) * 40); g.add(b); if (b.position.z > 30) b.layers.set(1); }
    N.ready = true; return N;
  }
  const NEON_TXT = 'EINKAUFSZENTRUM';
  function drawNeon(c, w, h, t) {
    c.clearRect(0, 0, w, h); c.fillStyle = '#07080d'; c.fillRect(0, 0, w, h);
    c.font = `700 ${h * .72}px FOswald`; c.textBaseline = 'middle'; let ws = [...NEON_TXT].map(ch => c.measureText(ch).width); const sp = 26, fit = (w * .94) / (ws.reduce((a, b) => a + b, 0) + sp * 14); c.save(); c.translate(w / 2, 0); c.scale(Math.min(1.6, fit), 1); c.translate(-w / 2, 0); const tw = ws.reduce((a, b) => a + b, 0) + sp * 14; let x = (w - tw) / 2, lvl = 0;
    for (let i = 0; i < NEON_TXT.length; i++) { const on = neonState(i, t); lvl += on;
      if (on > .05) { c.save(); c.shadowColor = `rgba(255,40,110,${on})`; c.shadowBlur = 40 * on; c.fillStyle = `rgba(255,${110 + 110 * on},${170 + 60 * on},1)`; c.fillText(NEON_TXT[i], x, h * .54); c.restore(); c.save(); c.shadowColor = 'rgba(255,60,120,.9)'; c.shadowBlur = 12; c.lineWidth = 5; c.strokeStyle = `rgba(255,90,150,${on})`; c.strokeText(NEON_TXT[i], x, h * .54); c.restore(); }
      else { c.fillStyle = '#1e1822'; c.fillText(NEON_TXT[i], x, h * .54); c.lineWidth = 4; c.strokeStyle = '#3a2e40'; c.strokeText(NEON_TXT[i], x, h * .54); }
      x += ws[i] + sp; }
    c.restore(); return lvl / NEON_TXT.length;
  }
  function night(t, cam, o = {}) {
    renderer(); if (!N) buildNight(); setCam(cam);
    N.sc.fog.color.setHex(o.day ? 0xc8d4e0 : 0x0a1022); N.sc.fog.density = o.day ? .006 : .011; N.hemiL.intensity = o.day ? 1.2 : .55; N.hemiL.color.setHex(o.day ? 0xdfe8ff : 0x3a4a80); N.moonL.intensity = o.day ? 1.1 : .55; N.moonL.color.setHex(o.day ? 0xfff2dc : 0x8aa4ff);
    const sg = N.sign.userData, lvl = o.day ? (drawNeon(sg.c, sg.cv.width, sg.cv.height, -99), 0) : drawNeon(sg.c, sg.cv.width, sg.cv.height, t); N.sign.needsUpdate = true; N.neonL.intensity = 6 * lvl;
    const hz = !o.day && !o.noHaz && hazOn(t); N.hazCar.userData.haz.forEach(m => m.visible = hz); N.hazL.intensity = hz ? 3.5 : 0;
    N.lamps[0].intensity = o.day ? 0 : 2.2 * (.75 + .25 * Math.sin(t * 13) * Math.sin(t * 7.3)); N.lamps[1].intensity = o.day ? 0 : 2.2;
    N.puddles.forEach((m, i) => { m.emissive = col(i === 2 ? '#ff8a20' : '#ff3a7a'); m.emissiveIntensity = i === 2 ? (hz ? .35 : 0) : .25 * lvl; });
    return { bg: copy(draw(N.sc, [0]), 'nbg'), mid: copy(draw(N.sc, [2]), 'nmid'), fg: copy(draw(N.sc, [1]), 'nfg'), lvl };
  }
  // ================= DAY ATRIUM =================
  let D = null;
  function shopFront(g, x, y, z, side, w, name, sc, disp) {
    // side: +1 = left wall (faces +x), -1 = right wall (faces -x)
    const ry = side > 0 ? Math.PI / 2 : -Math.PI / 2, gx = x;
    const sh = new TH.Group(); sh.position.set(gx, y, z); sh.rotation.y = ry; g.add(sh);
    // recessed shop: lit back wall, shelves, jambs, fascia; transparent window
    const tint = '#' + new TH.Color(sc[0]).lerp(new TH.Color('#fff6e8'), .72).getHexString();
    const bw = box(sh, w, 4.6, .3, mat(tint, { em: tint, emi: .12 }), 0, 2.3, -2.2, { ink: .03 }); LITW.push(bw.material);
    plane(sh, w, 2.2, mat('#d8c8b0'), 0, .02, -1.1, { rx: -Math.PI / 2 });
    const goods = ['#d84a3a', '#3a7ad0', '#e8b030', '#4aa860', '#a04ac0', '#f08a3a', '#2a2a30', '#f2f2f2'];
    for (let k = 0; k < 3; k++) { box(sh, w * .78, .08, .55, '#8a6a4a', 0, .9 + k * .8, -1.8, { ink: .02 }); for (let j = 0; j < 7; j++) box(sh, .36, .42, .3, goods[(j * 3 + k + name.length) % 8], -w * .34 + j * w * .113, 1.15 + k * .8, -1.8, { ink: .015 }); }
    for (const lx of [-w * .25, w * .25]) { cyl(sh, .02, .02, .8, '#3a3a3a', lx, 4.1, -1.2, { ink: 0 }); const lamp = new TH.Mesh(new TH.SphereGeometry(.18, 10, 8), mat('#fff8e0', { basic: 1 })); lamp.position.set(lx, 3.65, -1.2); sh.add(lamp); }
    for (const s2 of [-1, 1]) box(sh, .35, 4.6, 2.3, '#efe7da', s2 * (w / 2 - .17), 2.3, -1.1, { ink: .04 });
    box(sh, w, 1.4, .5, '#efe7da', 0, 3.9, -.2, { ink: .04 });
    plane(sh, w - .7, 3.1, mat('#bfe6f6', { phong: 1, shin: 150, spec: '#ffffff', op: .16 }), 0, 1.6, -.05);
    box(sh, w - .6, .12, .14, '#c8bca8', 0, .06, -.05, { ink: .02 });
    const s = box(sh, w * .82, .9, .3, sc[0], 0, 3.95, .15, { ink: .04 }); plane(sh, w * .8, .85, mat('#fff', { basic: 1, map: signTex(name, sc[0], sc[1], { w: 1024, h: 200, font: 'FOswald', size: 140 }) }), 0, 3.95, .31);
    for (let i = 0; i < 4; i++) { const px = -w / 2 + .9 + i * (w - 1.8) / 3; // window display
      if (disp === 'tv') { box(sh, 1.0, .65, .12, '#15161c', px, 1.5, -.6, { ink: .02 }); TVW.push(plane(sh, .9, .55, mat(['#5ab0ff', '#ffb05a', '#7aff9a', '#ff7ab0'][i], { basic: 1 }), px, 1.5, -.53).material); box(sh, .9, .7, .4, '#d8ccb8', px, .35, -.6, { ink: .02 }); }
      else if (disp === 'shoe') { box(sh, .8, .8, .5, '#e8e2d8', px, .4, -.6, { ink: .02 }); box(sh, .34, .18, .16, ['#d23a3a', '#222', '#f2f2f2', '#3a6ad0'][i], px, .9, -.6, { ink: .02 }); }
      else if (disp === 'toy') { const b = new TH.Mesh(new TH.SphereGeometry(.22, 14, 10), mat(['#ff6a6a', '#6ac0ff', '#ffd84a', '#9a6aff'][i])); b.position.set(px, .95, -.6); sh.add(b); box(sh, .6, .7, .5, '#e8e2d8', px, .35, -.6, { ink: .02 }); }
      else { cyl(sh, .18, .26, 1.4, ['#e85a8a', '#5a8ae8', '#e8c85a', '#5ae8a8'][i], px, .8, -.7, { ink: .02 }); const hd = new TH.Mesh(new TH.SphereGeometry(.14, 12, 8), mat('#e8e0d4')); hd.position.set(px, 1.65, -.7); sh.add(hd); } }
  }
  function buildDay() {
    const sc = new TH.Scene(); sc.fog = new TH.Fog(0xf3e6d0, 40, 120); const g = new TH.Group(); sc.add(g);
    const hemi = new TH.HemisphereLight(0xfff4e0, 0xb09a80, .75); sc.add(hemi); const LIT = [], TVS = [];
    const sun = new TH.DirectionalLight(0xfff0d0, 1.25); sun.position.set(-12, 40, 10); sun.target.position.set(0, 0, -20); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 40, bottom: -40, near: 1, far: 120 }); sun.shadow.bias = -.0008; sc.add(sun); sc.add(sun.target);
    const tile = canvasTex(512, 512, (c, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#e8dcc6' : '#d9c9ac'; c.fillRect(i * 64, j * 64, 64, 64); } c.strokeStyle = 'rgba(120,100,80,.25)'; c.lineWidth = 2; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } }, { rep: [6, 30] });
    plane(g, 24, 120, mat('#fff', { phong: 1, shin: 90, spec: '#5a5040', map: tile }), 0, 0, -40, { rx: -Math.PI / 2 });
    const wallT = noiseTex('#f2ebe0', ['#e0d6c6', '#fffaf2'], 120, 256, 256, [8, 2]);
    for (const s of [-1, 1]) {
      box(g, .5, 16, 120, mat('#fff', { map: wallT }), s * 14, 8, -40, { ink: .06 });
      box(g, 3.0, .5, 120, '#efe6d8', s * 12.6, 5.4, -40, { ink: .04 }); box(g, 3.0, .5, 120, '#efe6d8', s * 12.6, 10.4, -40, { ink: .04 }); // ceilings over the shops
      // gallery slab + glass railing for the 1st and 2nd floor
      for (const fy of [5.4, 10.4]) { box(g, 3.6, .5, 120, '#efe6d8', s * 9.4, fy, -40, { ink: .06, cast: true }); box(g, .08, 1.0, 120, mat('#bfe4f2', { op: .45 }), s * 7.65, fy + .75, -40, { ink: 0 }); box(g, .14, .1, 120, '#a89880', s * 7.65, fy + 1.28, -40, { ink: .03 }); }
    }
    const names = [['SCHUHE', ['#e05a3a', '#fff'], 'shoe'], ['MODE', ['#c04a8a', '#fff'], 'mode'], ['SPIELWAREN', ['#e8b030', '#3a2a10'], 'toy'], ['BÜCHER', ['#7a5a3a', '#fff'], 'shoe'], ['DROGERIE', ['#3a8ab0', '#fff'], 'toy'],
                   ['ELEKTRO', ['#2f7fd0', '#fff'], 'tv'], ['SPORT', ['#3aa060', '#fff'], 'mode'], ['CAFÉ', ['#a0603a', '#fff'], 'shoe'], ['HANDY', ['#6a4aa0', '#fff'], 'tv'], ['OPTIKER', ['#3a6a8a', '#fff'], 'toy']];
    for (let i = 0; i < 5; i++) { shopFront(g, -11.2, 0, 6 - i * 9, 1, 8.2, names[i][0], names[i][1], names[i][2]); shopFront(g, 11.2, 0, 6 - i * 9, -1, 8.2, names[i + 5][0], names[i + 5][1], names[i + 5][2]); }
    const up = [['MÖBEL', ['#5a4a3a', '#fff'], 'mode'], ['FOOD COURT', ['#d8402a', '#fff'], 'toy'], ['KINO', ['#2a2a3a', '#ffd84a'], 'tv'], ['BLUMEN', ['#5a9a4a', '#fff'], 'toy'], ['UHREN', ['#8a7040', '#fff'], 'shoe']];
    for (let i = 0; i < 5; i++) { shopFront(g, -11.2, 5.65, 4 - i * 9, 1, 8.2, up[i][0], up[i][1], up[i][2]); shopFront(g, 11.2, 5.65, 4 - i * 9, -1, 8.2, up[(i + 2) % 5][0], up[(i + 2) % 5][1], up[(i + 3) % 5][2]); }
    // skylight: steel arches + glass
    for (let i = 0; i < 16; i++) { const z = 10 - i * 6; const a = new TH.Mesh(new TH.TorusGeometry(11.6, .14, 6, 32, Math.PI), mat('#e8e2d8')); a.position.set(0, 15.6, z); a.scale.y = .32; a.castShadow = true; g.add(a); }
    for (const x of [-6, 0, 6]) box(g, .18, .18, 120, '#e8e2d8', x, x ? 18.6 : 19.3, -40, { ink: .02, cast: true });
    // columns, planters with trees, benches, banners
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) cyl(g, .38, .38, 15.4, '#f6f0e6', s * 7.6, 7.7, 4 - i * 12, { ink: .05, cast: true });
    for (let i = 0; i < 4; i++) { const z = -2 - i * 14; box(g, 2.2, .7, 2.2, '#b87a4a', 0, .35, z, { ink: .05, cast: true }); cyl(g, .12, .16, 2.6, '#6a4a30', 0, 2, z, { ink: .03 }); for (let k = 0; k < 4; k++) { const b = new TH.Mesh(new TH.IcosahedronGeometry(1.0 + rnd(k + i) * .3, 1), mat(k % 2 ? '#4a9a4a' : '#3a8a40')); b.position.set((rnd(k + i * 3) - .5) * 1.4, 3.2 + rnd(k) * .7, z + (rnd(k + 5) - .5) * 1.4); b.castShadow = true; g.add(b); }
      for (const s of [-1, 1]) { box(g, 2.6, .12, .7, '#8a6a4a', s * 3.6, .48, z + 4, { ink: .03 }); box(g, .1, .45, .5, '#4a4a4a', s * 3.6 - 1.1, .22, z + 4, { ink: .02 }); box(g, .1, .45, .5, '#4a4a4a', s * 3.6 + 1.1, .22, z + 4, { ink: .02 }); } }
    for (const [z, txt, c1] of [[-20, 'SALE −30 %', '#d83a3a'], [-44, 'WILLKOMMEN', '#2f7fd0']]) { box(g, 7, 1.5, .1, c1, 0, 12.4, z, { ink: .04 }); plane(g, 6.8, 1.4, mat('#fff', { basic: 1, map: signTex(txt, c1, '#ffffff', { w: 1024, h: 210, font: 'FAnton', size: 140, weight: 400 }) }), 0, 12.4, z + .06); for (const x of [-3.2, 3.2]) cyl(g, .02, .02, 5.5, '#6a5a50', x, 15.9, z, { ink: 0 }); }
    // escalators up to the 1st floor (right side)
    const esc = new TH.Group(); esc.position.set(4.8, 0, -16); g.add(esc);
    const inc = Math.atan2(5.4, 9); const ramp = box(esc, 1.3, .4, 10.6, '#cfd4da', 0, 2.75, 0, { ink: .05, cast: true }); ramp.rotation.x = inc;
    for (const s of [-1, 1]) { const side = box(esc, .1, 1.0, 10.6, mat('#bfe4f2', { op: .5 }), s * .7, 3.3, 0, { ink: 0 }); side.rotation.x = inc; const rail = box(esc, .14, .14, 10.8, '#2a2a30', s * .7, 3.85, 0, { ink: .02 }); rail.rotation.x = inc; }
    D = { sc, g, sun, hemi, LIT: LITW.splice(0), TVS: TVW.splice(0), tvCols: null }; return D;
  }
  const LITW = [], TVW = [];
  const MOODS = { day: [1.25, .75, 0xf3e6d0, .12, 0xfff4e0], dark: [.12, .32, 0x3a3e4a, 0, 0x8090b0], night: [0, .14, 0x0a0e1a, 0, 0x6070a0], dusk: [.5, .5, 0xd8a070, .06, 0xffc890] };
  const ALERT = canvasTex(256, 160, (c, w, h) => { c.fillStyle = '#b81818'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '700 40px FOswald'; c.textAlign = 'center'; c.fillText('EILMELDUNG', w / 2, h / 2 + 14); });
  function day(t, cam, o = {}) {
    renderer(); if (!D) buildDay(); setCam(cam);
    const m = MOODS[o.mood || 'day']; D.sun.intensity = m[0]; D.hemi.intensity = m[1]; D.sc.fog.color.setHex(m[2]); D.hemi.color.setHex(m[4]);
    D.LIT.forEach(mt => mt.emissiveIntensity = m[3]);
    const al = o.alert && Math.floor(t * 3) % 2 === 0; D.TVS.forEach(mt => { mt.map = o.alert ? ALERT : null; mt.color.set(o.alert ? (al ? '#ffffff' : '#ff8080') : (o.mood === 'dark' || o.mood === 'night' ? '#111318' : mt.userData.c0 || (mt.userData.c0 = '#' + mt.color.getHexString()))); mt.needsUpdate = true; });
    return { bg: copy(draw(D.sc, [0]), 'dbg') };
  }
  // keep separate 2D copies of each pass (the GL canvas is reused)
  const COPIES = {};
  function copy(src, key) { let cv = COPIES[key]; if (!cv) { cv = COPIES[key] = document.createElement('canvas'); cv.width = W; cv.height = H; } const c = cv.getContext('2d'); c.clearRect(0, 0, W, H); c.drawImage(src, 0, 0); return cv; }
  return { night, day, proj, setCam, renderer };
})();
// pixels-per-metre -> 2D rig scale k (Noah 1527 units ≈ 1.74 m)
const kAt = ppm => ppm * 1.74 / 1527;
