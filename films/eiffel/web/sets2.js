// Remaining sets (cafe, forge room, hotel lobby + salon, corridor + study, station + train, scrapyard office, police station, press basement, island prison, cell block)
export function buildMore(C, K) {
  const GR_ = 6;
  const { THREE, P, scene, toon, grad } = C;
  const { G, A, POINTS, M, add, tbox, batch, cyl, curtain, chairLeather, table, tree, gasLamp, glassM, glowM, basic, wallWithWindow, rng, ndSkip } = K;
  const mk = (name) => { const g = new THREE.Group(); g.visible = false; scene.add(g); G[name] = g; return g; };
  const plane = (w, h, mat, parent, x, y, z, rx = 0, ry = 0) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false }); m.rotation.set(rx, ry, 0); return m; };
  const room = (g, w, d, h, wallMat, floorMat, o = {}) => { // floor, back wall (z=-d/2), left/right walls, optional ceiling
    add(tbox(w, 0.2, d, o.ft || 2), floorMat, 0, -0.1, 0, g, { cast: false });
    if (!o.noBack) add(tbox(w, h, 0.2, o.wt || 2.4), wallMat, 0, h / 2, -d / 2, g, { cast: false });
    if (!o.noLeft) add(tbox(0.2, h, d, o.wt || 2.4), wallMat, -w / 2, h / 2, 0, g, { cast: false });
    if (!o.noRight) add(tbox(0.2, h, d, o.wt || 2.4), wallMat, w / 2, h / 2, 0, g, { cast: false });
    if (o.ceil) add(tbox(w, 0.2, d, 2), o.ceil, 0, h + 0.1, 0, g, { cast: false });
  };
  const goldFrame = (g, x, y, z, w, h, inner, ry = 0) => { const f = new THREE.Group(); f.position.set(x, y, z); f.rotation.y = ry; g.add(f); for (const s of [-1, 1]) { add(tbox(w + 0.16, 0.08, 0.06, 1), M.gold, 0, s * h / 2, 0, f); add(tbox(0.08, h, 0.06, 1), M.gold, s * w / 2, 0, 0, f); } plane(w, h, inner, f, 0, 0, 0.0); return f; };
  const palm = (g, x, y, z, s = 1) => { const p_ = new THREE.Group(); p_.position.set(x, y, z); p_.scale.setScalar(s); g.add(p_); add(cyl(0.34, 0.24, 0.6, 12), toon({ color: '#2f5a4a' }), 0, 0.3, 0, p_); add(cyl(0.05, 0.07, 1.0, 6), M.trunk, 0, 1.0, 0, p_);
    for (let i = 0; i < 8; i++) { const fr = add(new THREE.ConeGeometry(0.16, 1.5, 4), M.tree, 0, 1.5, 0, p_); fr.scale.set(1, 1, 0.25); fr.rotation.set(0, i * 0.8, 1.1 + (i % 2) * 0.3); fr.position.set(Math.sin(i * 0.8) * 0.45, 1.65, Math.cos(i * 0.8) * 0.45); fr.rotation.order = 'YXZ'; } return p_; };
  const lampGlobe = (g, x, y, z, r = 0.16, col = '#ffe2a0') => { add(cyl(0.01, 0.01, 1.2, 4), M.black, x, y + 0.75, z, g); const b = add(new THREE.SphereGeometry(r, 14, 10), glowM(col), x, y, z, g, { cast: false }); b.userData.ndSkip = true; return b; };

  // =========================== M2 CAFE (morning) ===========================
  { const g = mk('cafe');
    add(tbox(40, 0.2, 30, 1.6), M.stone, 0, -0.1, 3, g, { cast: false });
    add(tbox(40, 0.2, 20, 3), M.cobble, 0, -0.12, 19, g, { cast: false });
    add(tbox(26, 18, 0.5, 6.2), M.facade, 0, 12.4, -3.3, g, { cast: false });
    // shop front
    const sf = batch(); wallWithWindow(sf, 12, 3.4, 0.3, -4.6, 4.6, 0.6, 2.9, 2); sf.mesh(M.burg, g).position.set(0, 0, -2.95);
    add(tbox(9.2, 2.3, 0.05, 2), toon({ map: P.tex(glassRefl(), 1, 1), color: '#ffffff' }), 0, 1.75, -3.0, g, { cast: false });
    for (const x of [-1.5, 1.5]) add(tbox(0.12, 2.3, 0.12, 1), M.burg, x, 1.75, -2.9, g);
    add(tbox(12, 0.35, 0.4, 1), M.gold, 0, 3.25, -2.85, g);
    // inside the window: chairs/tables silhouettes
    for (let i = 0; i < 4; i++) { add(cyl(0.3, 0.3, 0.04, 14), M.cream, -3.6 + i * 2.4, 0.74, -3.9, g); add(cyl(0.03, 0.03, 0.74, 6), M.black, -3.6 + i * 2.4, 0.37, -3.9, g); }
    add(tbox(12, 3.4, 0.1, 2), M.damask, 0, 1.7, -5.5, g, { cast: false }); add(tbox(12, 0.2, 2.6, 2), M.planks, 0, 0.05, -4.3, g, { cast: false });
    // awning
    const aw = add(new THREE.PlaneGeometry(12.4, 2.8, 1, 1), M.awning, 0, 3.15, -1.65, g); aw.rotation.x = -Math.PI / 2 + 0.42; aw.material.side = THREE.DoubleSide; aw.material.map.repeat.set(5, 1);
    { const vb = batch(); for (let i = 0; i < 31; i++) vb.put(new THREE.CircleGeometry(0.2, 10, Math.PI, Math.PI), -6.0 + i * 0.4, 2.6, -0.36); vb.mesh(toon({ color: '#7d1f2e', side: THREE.DoubleSide }), g, { cast: false }); }
    add(tbox(12.4, 0.22, 0.05, 1), M.awning, 0, 2.66, -0.38, g);
    // tables + chairs
    const ctable = (x, z) => { add(cyl(0.34, 0.34, 0.04, 20), toon({ map: P.tex(P.marble(10)), color: '#ffffff' }), x, 0.74, z, g); add(cyl(0.025, 0.035, 0.72, 8), M.black, x, 0.37, z, g); add(cyl(0.22, 0.24, 0.04, 14), M.black, x, 0.02, z, g); };
    const bchair = (x, z, ry = 0) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); add(cyl(0.21, 0.21, 0.04, 14), M.walnut, 0, 0.46, 0, c);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = add(cyl(0.015, 0.015, 0.47, 6), M.black, sx * 0.14, 0.23, sz * 0.14, c); l.rotation.set(sz * 0.12, 0, -sx * 0.12); }
      const bk = add(new THREE.TorusGeometry(0.19, 0.018, 6, 20, Math.PI * 1.4), M.black, 0, 0.75, -0.17, c); bk.rotation.z = -0.2 * Math.PI; for (const sx of [-1, 1]) add(cyl(0.015, 0.015, 0.5, 6), M.black, sx * 0.17, 0.7, -0.18, c); return c; };
    ctable(0.78, 0.25); bchair(0, -0.12); bchair(1.4, -0.2, -0.6);
    ctable(-2.2, -0.9); bchair(-2.8, -1.0, 0.8); bchair(-1.6, -1.3, -0.4);
    ctable(3.2, -1.1); bchair(2.6, -1.4, 0.5); bchair(3.8, -1.5, -0.5);
    // cup, saucer, croissant, hat on the hero table
    const T0 = [0.78, 0.762, 0.25];
    add(cyl(0.075, 0.07, 0.012, 16), M.white, T0[0] - 0.1, T0[1] + 0.006, T0[2] + 0.12, g); add(cyl(0.04, 0.032, 0.065, 14), M.white, T0[0] - 0.1, T0[1] + 0.045, T0[2] + 0.12, g);
    add(cyl(0.035, 0.035, 0.005, 14), toon({ color: '#3a2214' }), T0[0] - 0.1, T0[1] + 0.077, T0[2] + 0.12, g); const hd = add(new THREE.TorusGeometry(0.018, 0.006, 6, 10), M.white, T0[0] - 0.05, T0[1] + 0.045, T0[2] + 0.12, g); hd.rotation.y = Math.PI / 2;
    add(cyl(0.1, 0.09, 0.012, 18), M.white, T0[0] + 0.1, T0[1] + 0.006, T0[2] + 0.08, g); const cr = add(new THREE.TorusGeometry(0.05, 0.026, 8, 14, Math.PI * 1.3), toon({ color: '#d99a44' }), T0[0] + 0.1, T0[1] + 0.03, T0[2] + 0.08, g); cr.rotation.x = -Math.PI / 2; cr.scale.set(1, 1, 0.7);
    const hat = new THREE.Group(); hat.position.set(T0[0] + 0.02, T0[1], T0[2] - 0.17); hat.rotation.y = 0.5; g.add(hat); add(cyl(0.17, 0.17, 0.012, 20), M.black, 0, 0.006, 0, hat); add(cyl(0.085, 0.1, 0.1, 16), M.black, 0, 0.06, 0, hat); add(cyl(0.101, 0.101, 0.025, 16), toon({ color: '#3a3540' }), 0, 0.025, 0, hat);
    // planters + lamp post + background tree
    for (const x of [-5.6, 5.6]) { add(tbox(1.2, 0.6, 0.5, 1), M.walnut, x, 0.3, -2.4, g); add(new THREE.IcosahedronGeometry(0.45, 1), M.tree, x, 0.9, -2.4, g).scale.set(1.3, 0.8, 0.6); }
    gasLamp(g, -4.6, 0, 2.4, 0.95); tree(g, 7, 0, 2.6, 1.3);
    // 3D newspaper for the close-up (front page, folded in the middle)
    { const pg = new THREE.PlaneGeometry(1, 1.36, 16, 4), pa = pg.attributes.position; for (let i = 0; i < pa.count; i++) pa.setZ(i, -Math.abs(pa.getX(i)) * 0.12 + Math.sin(pa.getY(i) * 2) * 0.01); pg.computeVertexNormals();
      const nt = P.tex(P.newspaper(34)); nt.wrapS = nt.wrapT = THREE.ClampToEdgeWrapping; const np = add(pg, toon({ map: nt, side: THREE.DoubleSide }), 0, 1.08, 0.5, g, { cast: false }); np.scale.setScalar(0.62); np.rotation.x = -0.08; A.paper3d = np; np.visible = false; }
    POINTS.cafe = [];
  }
  function glassRefl() { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#3a4a5c'); gr.addColorStop(1, '#22262e'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    g.fillStyle = 'rgba(255,255,255,.18)'; for (const x of [60, 90, 300, 330, 420]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40, 0); g.lineTo(x - 60, 256); g.lineTo(x - 100, 256); g.fill(); } return c; }

  // =========================== M3 FORGERY DESK (night hotel room) ===========================
  { const g = mk('forge');
    add(tbox(8, 0.2, 6, 2), M.planks, 0, -0.1, 0, g, { cast: false });
    add(tbox(8, 3.2, 0.2, 2.4), M.damaskNavy, 0, 1.6, -1.0, g, { cast: false }); add(tbox(0.2, 3.2, 6, 2.4), M.damaskNavy, -2.6, 1.6, 0, g, { cast: false });
    // desk
    add(tbox(1.6, 0.06, 0.8, 1), M.mahog, 0, 0.78, 0, g); add(tbox(1.5, 0.7, 0.05, 1), M.mahog, 0, 0.42, -0.36, g);
    for (const s of [-1, 1]) add(tbox(0.42, 0.72, 0.74, 1), M.mahog, s * 0.56, 0.38, 0, g);
    add(tbox(1.3, 0.004, 0.6, 1), toon({ color: '#2f4a3a' }), 0, 0.812, 0.02, g, { cast: false });
    // banker's lamp
    { const L = new THREE.Group(); L.position.set(-0.52, 0.81, -0.18); g.add(L); add(tbox(0.22, 0.03, 0.14, 1), M.brass, 0, 0.015, 0, L); add(cyl(0.012, 0.012, 0.34, 6), M.brass, 0, 0.18, 0, L);
      const sh = add(new THREE.CylinderGeometry(0.11, 0.11, 0.34, 18, 1, true, 0, Math.PI), toon({ color: '#1f6a44', side: THREE.DoubleSide }), 0, 0.36, 0.02, L); sh.rotation.set(0, 0, Math.PI / 2);
      const gl = add(new THREE.PlaneGeometry(0.32, 0.12), glowM('#fff0c0'), 0, 0.33, 0.04, L, { cast: false }); gl.rotation.x = Math.PI / 2; ndSkip(gl); }
    // candle
    { add(cyl(0.05, 0.06, 0.02, 12), M.brass, 0.6, 0.82, -0.22, g); add(cyl(0.022, 0.022, 0.18, 10), M.cream, 0.6, 0.92, -0.22, g); const fl = add(new THREE.ConeGeometry(0.014, 0.05, 8), glowM('#ffcf5a'), 0.6, 1.04, -0.22, g, { cast: false }); ndSkip(fl); A.flame = fl; }
    // inkwell + pen, magnifier, wax stick, seal stamp on the desk, badge
    add(cyl(0.035, 0.04, 0.05, 6), M.glassDark, 0.42, 0.835, 0.12, g); add(cyl(0.026, 0.026, 0.012, 10), M.brass, 0.42, 0.865, 0.12, g);
    { const pen = add(cyl(0.004, 0.006, 0.17, 6), M.black, 0.45, 0.92, 0.1, g); pen.rotation.z = -0.4; }
    { const mg = new THREE.Group(); mg.position.set(-0.32, 0.818, 0.24); mg.rotation.y = 0.6; g.add(mg); const rim = add(new THREE.TorusGeometry(0.055, 0.008, 6, 20), M.brass, 0, 0.004, 0, mg); rim.rotation.x = Math.PI / 2; add(cyl(0.05, 0.05, 0.003, 18), glassM, 0, 0.004, 0, mg); add(cyl(0.01, 0.012, 0.11, 6), M.walnut, 0.11, 0.004, 0, mg).rotation.z = Math.PI / 2; }
    add(cyl(0.008, 0.008, 0.12, 6), M.red, 0.25, 0.82, -0.18, g).rotation.z = Math.PI / 2;
    { const bd = new THREE.Group(); bd.position.set(0.26, 0.815, 0.27); g.add(bd); add(cyl(0.025, 0.025, 0.006, 12), M.gold, 0, 0.004, 0, bd); add(tbox(0.018, 0.003, 0.04, 1), M.red, -0.01, 0.002, -0.035, bd); add(tbox(0.018, 0.003, 0.04, 1), M.red, 0.01, 0.002, -0.035, bd); }
    // documents: blank stack + the one being forged (texture redrawn when signed/sealed)
    for (let i = 0; i < 4; i++) { const d = plane(0.21, 0.297, M.paper, g, -0.18 + i * 0.004, 0.814 + i * 0.002, -0.08 - i * 0.005, -Math.PI / 2, 0.1 + i * 0.05); }
    { const c = document.createElement('canvas'); c.width = 512; c.height = 700; A.docCanvas = c; A.docTex = P.tex(c); A.docTex.wrapS = A.docTex.wrapT = THREE.ClampToEdgeWrapping;
      const d = plane(0.25, 0.34, toon({ map: A.docTex }), g, 0.08, 0.818, 0.06, -Math.PI / 2, -0.05); A.docState = ''; A.docDraw = (sign, seal) => { const k = sign.toFixed(2) + seal.toFixed(2); if (k === A.docState) return; A.docState = k; const src = P.documentTex(35, sign, seal); c.getContext('2d').drawImage(src, 0, 0); A.docTex.needsUpdate = true; }; A.docDraw(0, 0); }
    // bed corner + curtain at the side for depth
    curtain(g, -2.4, 1.6, -0.6, 1.2, 3.0, toon({ map: P.tex(P.velvet(29, 350, 20), 2, 1), side: THREE.DoubleSide }), Math.PI / 2);
    POINTS.forge = [{ pos: [-0.5, 1.05, -0.1], color: '#ffd59a', i: 2.2, d: 4.5 }, { pos: [0.6, 1.1, -0.15], color: '#ffb050', i: 1.2, d: 3 }];
  }

  // =========================== M4 HOTEL LOBBY ===========================
  { const g = mk('lobby');
    add(tbox(20, 0.2, 30, 2), M.marbleChk, 0, -0.1, -2, g, { cast: false });
    const carpetM = toon({ map: P.tex(P.carpet(26), 1, 6) }); add(new THREE.PlaneGeometry(2.2, 20), carpetM, 0, 0.012, -4, g, { cast: false }).rotation.x = -Math.PI / 2;
    // back wall with revolving door
    const bw = batch(); wallWithWindow(bw, 20, 9, 0.4, -1.7, 1.7, 0.0, 3.2, 2.4); bw.mesh(M.cream, g, { cast: false }).position.set(0, 0, -14);
    add(tbox(20, 1.6, 0.42, 2), M.wainscot, 0, 0.8, -13.98, g, { cast: false });
    add(new THREE.PlaneGeometry(8, 5), basic('#fff2d8'), 0, 2.5, -16, g, { cast: false }).userData.ndSkip = true;
    { const D = new THREE.Group(); D.position.set(0, 0, -14); g.add(D); A.revolve = new THREE.Group(); D.add(A.revolve);
      add(cyl(1.62, 1.62, 0.42, 28), M.brass, 0, 3.0, 0, D); add(cyl(1.6, 1.6, 0.05, 28), M.brass, 0, 0.02, 0, D);
      for (const [t0] of [[0.25 * Math.PI], [1.25 * Math.PI]]) { const s = add(new THREE.CylinderGeometry(1.55, 1.55, 2.8, 20, 1, true, t0 + Math.PI / 2 - 0.85 + Math.PI / 2, 1.7), glassM, 0, 1.4, 0, D, { cast: false }); s.userData.ndSkip = true; }
      add(cyl(0.06, 0.06, 2.8, 8), M.brass, 0, 1.4, 0, A.revolve);
      for (let i = 0; i < 4; i++) { const w = new THREE.Group(); w.rotation.y = i * Math.PI / 2; A.revolve.add(w); const gp = add(tbox(1.45, 2.5, 0.03, 1), glassM, 0.75, 1.35, 0, w, { cast: false }); gp.userData.ndSkip = true; add(tbox(1.45, 0.07, 0.07, 1), M.brass, 0.75, 0.1, 0, w); add(tbox(1.45, 0.07, 0.07, 1), M.brass, 0.75, 2.6, 0, w); add(tbox(0.07, 2.5, 0.07, 1), M.brass, 1.47, 1.35, 0, w); } }
    // side walls with mirrors, columns, chandelier, palms, desk
    for (const s of [-1, 1]) { add(tbox(0.3, 9, 30, 2.4), M.damask, s * 10, 4.5, -2, g, { cast: false }); add(tbox(0.32, 1.6, 30, 2), M.wainscot, s * 9.98, 0.8, -2, g, { cast: false });
      for (const z of [-10, -3]) goldFrame(g, s * 9.82, 3.6, z, 2.4, 3.2, toon({ color: '#a9b8c6' }), -s * Math.PI / 2); }
    for (const s of [-1, 1]) for (const z of [-11, -6.5, -2]) { add(cyl(0.34, 0.34, 7.4, 16), M.gold, s * 4.6, 3.7, z, g); add(tbox(0.9, 0.3, 0.9, 1), M.gold, s * 4.6, 0.15, z, g); add(tbox(0.95, 0.35, 0.95, 1), M.gold, s * 4.6, 7.3, z, g); }
    add(tbox(20, 0.4, 30, 2), M.cream, 0, 7.6, -2, g, { cast: false });
    { const ch = new THREE.Group(); ch.position.set(0, 5.6, -6); g.add(ch); A.chand = ch; add(cyl(0.02, 0.02, 2, 4), M.gold, 0, 1.0, 0, ch); add(new THREE.SphereGeometry(0.28, 14, 10), M.gold, 0, 0, 0, ch);
      const cb = batch(); for (const [r, y, n] of [[1.1, -0.2, 22], [0.75, -0.5, 16], [0.42, -0.8, 10], [0.2, -1.05, 6]]) { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; cb.put(new THREE.OctahedronGeometry(0.07, 0), Math.cos(a) * r, y, Math.sin(a) * r, 0, a, 0, new THREE.Vector3(0.7, 1.6, 0.7)); } cb.put(new THREE.TorusGeometry(r, 0.025, 6, 32), 0, y + 0.08, 0, Math.PI / 2, 0, 0); }
      const cm = cb.mesh(glowM('#fff4d8'), ch, { cast: false }); cm.userData.ndSkip = true; }
    palm(g, -7.6, 0, -12, 1.2); palm(g, 7.6, 0, -12, 1.2); palm(g, -7.6, 0, 0, 1.1); palm(g, 7.8, 0, 1.0, 1.1);
    add(tbox(3.2, 1.1, 0.9, 1), M.mahog, 6.8, 0.55, -7.5, g); add(tbox(3.3, 0.06, 1.0, 1), toon({ map: P.tex(P.marble(10)), color: '#ffffff' }), 6.8, 1.13, -7.5, g);
    // luggage on a brass cart
    { const ct = new THREE.Group(); ct.position.set(-3.2, 0, -5); g.add(ct); A.cart = ct; add(tbox(1.2, 0.05, 0.7, 1), M.brass, 0, 0.3, 0, ct); for (const s of [-1, 1]) { add(cyl(0.025, 0.025, 1.6, 6), M.brass, s * 0.58, 1.1, -0.3, ct); } add(tbox(1.2, 0.04, 0.04, 1), M.brass, 0, 1.9, -0.3, ct); for (const [x, z] of [[-0.5, 0.3], [0.5, 0.3], [-0.5, -0.3], [0.5, -0.3]]) add(cyl(0.08, 0.08, 0.04, 10), M.black, x, 0.08, z, ct).rotation.x = Math.PI / 2;
      add(tbox(0.7, 0.45, 0.35, 1), M.leatherBrown, -0.2, 0.55, 0, ct); add(tbox(0.55, 0.38, 0.3, 1), toon({ color: '#3a5a4a' }), 0.3, 0.52, 0.05, ct); add(tbox(0.5, 0.3, 0.3, 1), M.burg, -0.1, 0.92, 0, ct); }
    POINTS.lobby = [{ pos: [0, 4.8, -6], color: '#ffe6b8', i: 3, d: 14 }, { pos: [0, 3, -13], color: '#fff2d8', i: 2, d: 8 }];
  }

  // =========================== M4/M5/M10 SALON ===========================
  { const g = mk('salon');
    add(tbox(14, 0.2, 10, 1.4), M.oak, 0, -0.1, 0, g, { cast: false }); M.oak.map.rotation = 0;
    const bw = batch(); wallWithWindow(bw, 14, 4.6, 0.25, -2.4, 2.4, 0.9, 4.0, 2.4); bw.mesh(M.damask, g, { cast: false }).position.set(0, 0, -3.6);
    add(tbox(14, 1.0, 0.27, 2), M.wainscot, 0, 0.5, -3.58, g, { cast: false });
    for (const s of [-1, 1]) { add(tbox(0.2, 4.6, 10, 2.4), M.damask, s * 7, 2.3, 0, g, { cast: false }); add(tbox(0.22, 1.0, 10, 2), M.wainscot, s * 6.98, 0.5, 0, g, { cast: false }); }
    add(tbox(14, 0.2, 10, 2), M.cream, 0, 4.7, 0, g, { cast: false });
    A.salonView = plane(7, 4.2, M.view, g, 0, 2.4, -5.0); A.salonView.userData.ndSkip = true;
    add(tbox(5.0, 0.1, 0.1, 1), M.gold, 0, 4.15, -3.35, g);
    // curtains: two velvet panels that slide shut
    const cm = toon({ map: P.tex(P.velvet(29), 3, 1), side: THREE.DoubleSide });
    A.cL = curtain(g, -1.9, 2.1, -3.35, 2.6, 4.1, cm); A.cR = curtain(g, 1.9, 2.1, -3.35, 2.6, 4.1, cm.clone());
    for (const s of [-1, 1]) curtain(g, s * 3.6, 2.1, -3.38, 1.0, 4.1, cm.clone());
    // long table, chairs, props
    add(tbox(5.2, 0.08, 1.4, 1.5), M.mahog, 0, 0.78, 0, g); add(tbox(5.0, 0.2, 1.2, 1.5), M.mahog, 0, 0.66, 0, g);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(cyl(0.05, 0.04, 0.66, 8), M.mahog, sx * 2.4, 0.33, sz * 0.55, g);
    for (let i = 0; i < 5; i++) chairLeather(g, -1.9 + i * 0.95, 0, -1.25);
    chairLeather(g, -3.2, 0, 0, Math.PI / 2);
    const tb = batch(), tg = batch();
    for (let i = 0; i < 5; i++) { const x = -1.9 + i * 0.95; tg.put(cyl(0.035, 0.03, 0.09, 10), x + 0.18, 0.865, -0.3); tb.put(cyl(0.05, 0.05, 0.015, 12), x - 0.15, 0.828, -0.25); }
    tg.mesh(glassM, g, { cast: false }); tb.mesh(toon({ color: '#3a3a40' }), g);
    { const cbx = new THREE.Group(); cbx.position.set(0.2, 0.82, 0.25); g.add(cbx); add(tbox(0.3, 0.08, 0.2, 1), M.walnut, 0, 0.04, 0, cbx); const lid = add(tbox(0.3, 0.01, 0.2, 1), M.walnut, 0, 0.16, -0.12, cbx); lid.rotation.x = -1.2; for (let i = 0; i < 6; i++) add(cyl(0.012, 0.012, 0.26, 6), toon({ color: '#6a3a1e' }), 0, 0.085, -0.075 + i * 0.03, cbx).rotation.z = Math.PI / 2; }
    add(cyl(0.06, 0.08, 0.22, 12), glassM, -0.8, 0.93, 0.35, g, { cast: false }); add(cyl(0.065, 0.065, 0.12, 12), toon({ color: '#8a4a1a', transparent: true, opacity: 0.8 }), -0.8, 0.88, 0.35, g, { cast: false });
    for (let i = 0; i < 5; i++) plane(0.21, 0.29, M.doc, g, -1.9 + i * 0.95, 0.825, 0.1, -Math.PI / 2, 0.15 * (i % 2 ? 1 : -1));
    // hanging lamp over the table
    { const hl = new THREE.Group(); hl.position.set(0, 2.55, 0); g.add(hl); add(cyl(0.01, 0.01, 2.1, 4), M.black, 0, 1.05, 0, hl);
      const sh = add(new THREE.CylinderGeometry(0.25, 0.75, 0.32, 20, 1, true), toon({ color: '#1f5a3a', side: THREE.DoubleSide }), 0, 0, 0, hl); const gl = add(new THREE.CircleGeometry(0.72, 20), glowM('#fff0c0'), 0, -0.15, 0, hl, { cast: false }); gl.rotation.x = Math.PI / 2; ndSkip(gl); }
    palm(g, -6, 0, -2.6, 1.1); palm(g, 6, 0, -2.6, 1.1);
    goldFrame(g, -6.85, 2.6, 0.5, 1.6, 1.2, M.painting, Math.PI / 2); goldFrame(g, 6.85, 2.6, 0.5, 1.6, 1.2, M.painting, -Math.PI / 2);
    POINTS.salon = [{ pos: [0, 2.25, 0], color: '#ffe0a8', i: 2.4, d: 6 }];
  }

  // =========================== M6 CORRIDOR ===========================
  { const g = mk('corridor'); const Wd = 2.6;
    add(tbox(Wd, 0.2, 30, 1.4), M.oak, 0, -0.1, -10, g, { cast: false });
    add(new THREE.PlaneGeometry(1.4, 30), toon({ map: P.tex(P.carpet(126, '#2f4a3a', '#c9a050'), 1, 7) }), 0, 0.012, -10, g, { cast: false }).rotation.x = -Math.PI / 2;
    add(tbox(Wd, 0.2, 30, 2), M.cream, 0, 3.1, -10, g, { cast: false });
    // left wall solid, right wall with the hero door gap at z -3..-2
    for (const [x, z0, z1] of [[-Wd / 2, 5, -25], [Wd / 2, 5, -2.0], [Wd / 2, -3.0, -25]]) { const L = z0 - z1, zc = (z0 + z1) / 2; add(tbox(0.2, 3.0, L, 2.4), M.damaskGreen, x, 1.5, zc, g, { cast: false }); add(tbox(0.22, 1.1, L, 2), M.wainscotGreen, x, 0.55, zc, g, { cast: false }); }
    add(tbox(0.2, 0.9, 1.0, 1), M.damaskGreen, Wd / 2, 2.65, -2.5, g, { cast: false });
    // doors (closed) along both walls
    for (let i = 0; i < 6; i++) { const z = -6.5 - i * 3.6, s = i % 2 ? -1 : 1; add(tbox(0.08, 2.2, 1.0, 1), M.walnut, s * (Wd / 2 - 0.08), 1.1, z, g); add(tbox(0.1, 2.35, 1.2, 1), M.mahog, s * (Wd / 2 - 0.05), 1.17, z, g); add(new THREE.SphereGeometry(0.035, 8, 6), M.brass, s * (Wd / 2 - 0.15), 1.05, z + 0.35, g); }
    // hero door ajar (hinged at z = -2.0, swings into the room)
    { const hd = new THREE.Group(); hd.position.set(Wd / 2, 0, -2.0); g.add(hd); A.heroDoor = hd; add(tbox(0.06, 2.2, 1.0, 1), M.walnut, 0.03, 1.1, -0.5, hd); add(new THREE.SphereGeometry(0.035, 8, 6), M.brass, -0.05, 1.05, -0.85, hd);
      add(tbox(0.1, 0.12, 1.2, 1), M.mahog, Wd / 2 - 0.02, 2.27, -2.5, g); for (const z of [-1.95, -3.05]) add(tbox(0.1, 2.3, 0.1, 1), M.mahog, Wd / 2 - 0.02, 1.15, z, g);
      add(tbox(3, 3, 3, 2), toon({ color: '#2a2030', side: THREE.BackSide }), Wd / 2 + 1.5, 1.5, -2.5, g, { cast: false }); }
    // sconces
    for (let i = 0; i < 7; i++) for (const s of [-1, 1]) { const z = -0.5 - i * 3.6 + (s > 0 ? 1.8 : 0); if (s > 0 && z > -3.2 && z < -1.8) continue; add(tbox(0.04, 0.3, 0.14, 1), M.brass, s * (Wd / 2 - 0.12), 2.0, z, g); const b = add(new THREE.SphereGeometry(0.09, 10, 8), glowM('#ffd890'), s * (Wd / 2 - 0.26), 2.15, z, g, { cast: false }); ndSkip(b); }
    POINTS.corridor = [{ pos: [-1.0, 2.1, -0.5], color: '#ffcf88', i: 1.6, d: 6 }, { pos: [1.0, 2.1, -5.4], color: '#ffcf88', i: 1.4, d: 6 }, { pos: [-1.0, 2.1, -11], color: '#ffcf88', i: 1.4, d: 7 }];
  }

  // =========================== M6/M7 STUDY (private room) ===========================
  { const g = mk('study');
    add(tbox(7, 0.2, 7, 1.4), M.oak, 0, -0.1, 0, g, { cast: false });
    const bw = batch(); wallWithWindow(bw, 7, 3.4, 0.2, 1.2, 2.8, 0.9, 2.9, 2.4); bw.mesh(M.damask, g, { cast: false }).position.set(0, 0, -2.6);
    plane(2.0, 2.3, M.view, g, 2.0, 1.9, -3.3).userData.ndSkip = true;
    curtain(g, 1.0, 1.8, -2.45, 0.6, 2.4, toon({ map: P.tex(P.velvet(129, 150, 22), 2, 1), side: THREE.DoubleSide })); curtain(g, 3.0, 1.8, -2.45, 0.6, 2.4, toon({ map: P.tex(P.velvet(129, 150, 22), 2, 1), side: THREE.DoubleSide }));
    add(tbox(0.2, 3.4, 7, 2.4), M.damask, -3.5, 1.7, 0, g, { cast: false }); add(tbox(0.2, 3.4, 7, 2.4), M.damask, 3.5, 1.7, 0, g, { cast: false });
    // bookshelf
    { const bs = new THREE.Group(); bs.position.set(-1.6, 0, -2.35); g.add(bs); add(tbox(2.4, 2.6, 0.4, 1), M.walnut, 0, 1.3, 0, bs); for (let r = 0; r < 3; r++) { const sh = add(tbox(2.2, 0.75, 0.05, 1), M.books, 0, 0.5 + r * 0.8, 0.2, bs, { cast: false }); sh.material = toon({ map: P.tex(P.bookSpines(39 + r), 1, 1) }); } }
    goldFrame(g, -3.38, 1.9, 0.2, 1.2, 0.9, M.painting, Math.PI / 2);
    // desk (green leather top), chairs, lamp
    add(tbox(1.8, 0.07, 0.9, 1), M.mahog, 0, 0.78, 0, g); add(tbox(1.6, 0.005, 0.7, 1), toon({ color: '#2f5a3a' }), 0, 0.818, 0, g, { cast: false }); for (const s of [-1, 1]) add(tbox(0.45, 0.75, 0.85, 1), M.mahog, s * 0.65, 0.38, 0, g);
    chairLeather(g, -1.3, 0, -0.5, 0.5); chairLeather(g, 1.3, 0, -0.5, -0.5);
    { const L = new THREE.Group(); L.position.set(-0.65, 0.82, -0.25); g.add(L); add(tbox(0.2, 0.03, 0.12, 1), M.brass, 0, 0.015, 0, L); add(cyl(0.01, 0.01, 0.3, 6), M.brass, 0, 0.16, 0, L); const sh = add(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16, 1, true, 0, Math.PI), toon({ color: '#1f6a44', side: THREE.DoubleSide }), 0, 0.32, 0.02, L); sh.rotation.z = Math.PI / 2; }
    palm(g, 3.0, 0, -1.6, 1.0);
    // money stacks + envelope (driven by W.money / W.env)
    A.money = []; const nm = toon({ map: (() => { const t = P.tex(P.banknote(36)); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; })() });
    for (let i = 0; i < 6; i++) { const st = new THREE.Group(); g.add(st); add(tbox(0.17, 0.045, 0.085, 1), toon({ color: '#9fc08a' }), 0, 0.0225, 0, st); const top = plane(0.17, 0.085, nm, st, 0, 0.046, 0, -Math.PI / 2); add(tbox(0.04, 0.047, 0.087, 1), M.white, 0, 0.0235, 0, st); st.position.set(-0.3 + (i % 3) * 0.2, 0.82 + Math.floor(i / 3) * 0.046, 0.12 - (i % 2) * 0.02); st.rotation.y = (i * 0.37) % 0.3 - 0.15; st.visible = false; A.money.push(st); }
    { const env = new THREE.Group(); g.add(env); add(tbox(0.24, 0.025, 0.14, 1), toon({ color: '#e9d8ae' }), 0, 0.0125, 0, env); env.position.set(0.35, 0.82, 0.1); A.env = env; A.env0 = env.position.clone(); }
    POINTS.study = [{ pos: [-0.6, 1.4, 0.2], color: '#ffe0a8', i: 1.6, d: 5 }];
  }

  // =========================== M8/M10 STATION + TRAIN ===========================
  { const g = mk('station');
    add(new THREE.PlaneGeometry(3000, 3000), M.fields, 0, -0.3, 0, g, { cast: false }).rotation.x = -Math.PI / 2; M.fields.map.repeat.set(30, 30);
    add(tbox(170, 1.0, 5.5, 2), M.concrete, 0, 0.5, 5.2, g); add(tbox(170, 1.0, 4.5, 2), M.concrete, 0, 0.5, -10.5, g);
    add(tbox(1600, 0.25, 4.2, 3), M.dirt, -700, 0.0, 0, g, { cast: false }); add(tbox(170, 0.25, 4.2, 3), M.dirt, 0, 0.0, -6, g, { cast: false });
    { const rl = batch(), sl = batch(); for (const zc of [0, -6]) for (const s of [-1, 1]) rl.put(tbox(zc === 0 ? 1600 : 170, 0.14, 0.08, 4), zc === 0 ? -700 : 0, 0.3, zc + s * 0.72);
      for (let x = -1500; x < 100; x += 0.75) { sl.put(tbox(0.25, 0.1, 2.5, 1), x, 0.18, 0); if (x > -85) sl.put(tbox(0.25, 0.1, 2.5, 1), x, 0.18, -6); }
      rl.mesh(M.steel, g); sl.mesh(M.oak, g); }
    // hall: brick side walls, iron columns, arched roof ribs + glass
    add(tbox(170, 9, 0.6, 3), M.brick, 0, 4.5, 9.0, g, { cast: false }); add(tbox(170, 9, 0.6, 3), M.brick, 0, 4.5, -13.5, g, { cast: false });
    { const ir = batch(); for (let x = -80; x <= 80; x += 8) { for (const z of [7.6, -12.2]) { ir.put(cyl(0.2, 0.24, 8.4, 10), x, 4.2, z); ir.put(tbox(0.6, 0.4, 0.6, 1), x, 8.4, z); }
        ir.put(new THREE.TorusGeometry(10.5, 0.22, 6, 36, Math.PI), x, 8.5, -2.3, 0, Math.PI / 2, 0, null); }
      for (let k = 1; k < 8; k++) { const a = k / 8 * Math.PI; ir.put(tbox(170, 0.16, 0.16, 2), 0, 8.5 + Math.sin(a) * 10.5, -2.3 + Math.cos(a) * 10.5); }
      ir.mesh(M.loco, g); }
    { const gl = add(new THREE.CylinderGeometry(10.45, 10.45, 170, 24, 1, true, Math.PI / 2, Math.PI), new THREE.MeshToonMaterial({ gradientMap: grad, color: '#d8e4ea', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), 0, 8.5, -2.3, g, { cast: false }); gl.rotation.z = Math.PI / 2; gl.userData.ndSkip = true; }
    // platform furniture: benches, lamps, luggage
    for (let x = -60; x <= 60; x += 16) { const b = new THREE.Group(); b.position.set(x, 1.0, 7.4); g.add(b); add(tbox(1.8, 0.06, 0.45, 1), M.oak, 0, 0.45, 0, b); add(tbox(1.8, 0.4, 0.06, 1), M.oak, 0, 0.75, -0.2, b); for (const s of [-1, 1]) add(tbox(0.06, 0.45, 0.45, 1), M.loco, s * 0.8, 0.22, 0, b); lampGlobe(g, x + 8, 5.4, 4.5, 0.25); }
    add(tbox(0.7, 0.45, 0.35, 1), M.leatherBrown, -8, 1.23, 6.6, g); add(tbox(0.5, 0.35, 0.3, 1), M.burg, -7.3, 1.18, 6.8, g);
    // poplars + farms beyond the hall (where the train vanishes)
    for (let i = 0; i < 60; i++) { const x = -110 - i * 22 - (i % 3) * 5, z = (i % 2 ? 14 : -18) + (i % 5) * 3; const t_ = add(new THREE.IcosahedronGeometry(1.5, 1), M.treeDark, x, 5, z, g); t_.scale.set(1.0, 3.5, 1.0); }
    for (let i = 0; i < 14; i++) add(new THREE.SphereGeometry(60 + (i % 4) * 25, 16, 8), i % 2 ? M.lawn : toon({ color: '#86a060' }), -400 - i * 120, -30, (i % 2 ? 1 : -1) * (150 + (i % 3) * 60), g, { cast: false }).scale.y = 0.4;
    // ---- train (local +x is the rear; it runs toward -x) ----
    const tr = new THREE.Group(); g.add(tr); A.train = tr; A.wheels = [];
    const wheel = (x, z, r, mat, parent) => { const w = add(cyl(r, r, 0.12, 18), mat, x, r + 0.22, z, parent); w.rotation.x = Math.PI / 2; A.wheels.push([w, r]); return w; };
    // locomotive 0..12
    { const L = new THREE.Group(); tr.add(L);
      const boil = add(cyl(1.0, 1.0, 8.4, 24), M.loco, 4.6, 2.55, 0, L); boil.rotation.z = Math.PI / 2;
      add(cyl(1.08, 1.08, 1.4, 24), toon({ color: '#141618' }), 0.9, 2.55, 0, L).rotation.z = Math.PI / 2;
      add(cyl(0.95, 0.95, 0.1, 24), toon({ color: '#2a2e30' }), 0.15, 2.55, 0, L).rotation.z = Math.PI / 2;
      add(cyl(0.32, 0.42, 1.3, 14), toon({ color: '#141618' }), 1.2, 3.95, 0, L); add(cyl(0.48, 0.38, 0.25, 14), toon({ color: '#141618' }), 1.2, 4.6, 0, L);
      add(new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.brass, 4.2, 3.4, 0, L); add(new THREE.SphereGeometry(0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.loco, 6.4, 3.4, 0, L);
      for (const x of [2.6, 5.2, 7.6]) add(tbox(0.06, 0.06, 2.1, 1), M.brass, x, 2.55, 0, L).scale.set(1, 1, 1.03);
      add(tbox(3.2, 3.0, 2.9, 1), M.loco, 10.4, 2.7, 0, L); add(tbox(3.6, 0.2, 3.2, 1), toon({ color: '#141618' }), 10.4, 4.3, 0, L);
      for (const s of [-1, 1]) add(tbox(1.2, 0.9, 0.06, 1), M.glassDark, 10.0, 3.3, s * 1.46, L);
      add(tbox(12, 0.35, 2.7, 1), M.locoRed, 5.8, 1.25, 0, L);
      add(tbox(0.3, 0.6, 2.8, 1), M.locoRed, -0.3, 1.05, 0, L); for (const s of [-1, 1]) { add(cyl(0.18, 0.18, 0.5, 10), M.steel, -0.65, 1.05, s * 0.9, L).rotation.z = Math.PI / 2; add(cyl(0.26, 0.26, 0.05, 10), M.steel, -0.92, 1.05, s * 0.9, L).rotation.z = Math.PI / 2; }
      const hl = add(cyl(0.18, 0.18, 0.3, 10), glowM('#fff1c0'), -0.05, 3.55, 0, L, { cast: false }); hl.rotation.z = Math.PI / 2; ndSkip(hl);
      for (const s of [-1, 1]) { for (const x of [4.2, 6.2, 8.2]) wheel(x, s * 1.12, 0.95, M.locoRed, L); wheel(1.6, s * 1.12, 0.55, M.locoRed, L); add(tbox(4.4, 0.12, 0.08, 1), M.steel, 6.2, 1.17, s * 1.25, L); add(tbox(10, 0.5, 0.12, 1), toon({ color: '#141618' }), 5.5, 1.75, s * 1.38, L); }
      // tender 12.5..17.5
      add(tbox(5, 2.4, 2.9, 1), M.loco, 15, 2.2, 0, L); add(tbox(4.6, 0.5, 2.6, 1), toon({ color: '#1a1a1a' }), 15, 3.5, 0, L);
      for (const s of [-1, 1]) for (const x of [13.5, 16.5]) wheel(x, s * 1.12, 0.5, M.steel, L); }
    // carriages
    const carriage = (x0, inter) => { const C_ = new THREE.Group(); C_.position.x = x0; tr.add(C_); const Lc = 16, Wc = 2.9, fy = 1.3, H = 2.3;
      add(tbox(Lc, 0.2, Wc, 2), M.oak, Lc / 2, fy, 0, C_); const roof = add(cyl(1.5, 1.5, Lc, 24), toon({ color: '#3a3438' }), Lc / 2, fy + H, 0, C_); roof.rotation.z = Math.PI / 2; roof.scale.set(0.28, 1, 1);
      add(tbox(Lc, 0.14, Wc + 0.05, 1), M.burg, Lc / 2, fy + H + 0.02, 0, C_);
      for (const s of [-1, 1]) { const sw = batch(); sw.put(tbox(Lc, 0.85, 0.08, 2), Lc / 2, fy + 0.52, 0); sw.put(tbox(Lc, 0.45, 0.08, 2), Lc / 2, fy + H - 0.2, 0);
        for (let x = 0; x <= Lc; x += 2) sw.put(tbox(x === 0 || x >= Lc ? 0.3 : 0.7, 1.0, 0.08, 2), x === 0 ? 0.15 : x >= Lc ? Lc - 0.15 : x, fy + 1.45, 0);
        const m = sw.mesh(M.teak, C_); m.position.z = s * Wc / 2; add(tbox(Lc, 0.06, 0.1, 1), M.gold, Lc / 2, fy + 0.95, s * (Wc / 2 + 0.01), C_, { cast: false }); }
      for (const x of [0.05, Lc - 0.05]) add(tbox(0.1, H, Wc, 1), M.teak, x, fy + H / 2, 0, C_);
      for (const s of [-1, 1]) for (const x of [2.5, Lc - 2.5]) for (const dx of [-0.8, 0.8]) wheel(x + dx, s * 1.12, 0.45, M.steel, C_);
      add(tbox(Lc - 1, 0.5, 2.2, 1), toon({ color: '#1a1a1c' }), Lc / 2, 0.95, 0, C_);
      if (inter) { // compartment interior near x 6..9
        for (const x of [5.6, 8.9]) add(tbox(0.1, H - 0.1, Wc - 0.2, 1), M.walnut, x, fy + H / 2, 0, C_);
        for (const x of [6.0, 8.5]) { add(tbox(0.55, 0.45, Wc - 0.3, 1), M.velvet, x, fy + 0.32, 0, C_); add(tbox(0.15, 0.75, Wc - 0.3, 1), M.velvet, x + (x < 7 ? -0.25 : 0.25), fy + 0.85, 0, C_); }
        for (const x of [6.0, 8.5]) for (const z of [-0.6, 0.6]) add(cyl(0.015, 0.015, Wc - 0.4, 6), M.brass, x + (x < 7 ? -0.15 : 0.15), fy + 1.85 + (z > 0 ? 0.08 : 0), 0, C_).rotation.x = Math.PI / 2;
        const lamp = add(new THREE.SphereGeometry(0.12, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), glowM('#ffe6a8'), 7.25, fy + H - 0.05, 0, C_, { cast: false }); lamp.rotation.x = Math.PI; ndSkip(lamp);
        add(tbox(0.5, 0.25, 0.35, 1), M.leatherBrown, 8.6, fy + 2.0, -0.6, C_); }
      return C_; };
    carriage(18.5, true); carriage(35, false); carriage(51.5, false);
    POINTS.station = [];
  }

  // =========================== M9 SCRAPYARD OFFICE ===========================
  { const g = mk('scrap');
    add(new THREE.PlaneGeometry(400, 400), M.dirt, 0, 0, 0, g, { cast: false }).rotation.x = -Math.PI / 2; M.dirt.map.repeat.set(1, 1);
    // junk piles (merged)
    const jr = batch(), js = batch(), jw = batch(), r = rng(71);
    const pile = (cx, cz, n, R) => { for (let i = 0; i < n; i++) { const a = r() * 6.28, d = Math.pow(r(), 0.6) * R, y = Math.max(0.2, (1 - d / R) * R * 0.55 * r()); const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; const k = r();
        const tgt = k < 0.5 ? jr : k < 0.8 ? js : jw; if (k < 0.3) tgt.put(cyl(0.2 + r() * 0.4, 0.2 + r() * 0.4, 0.4 + r() * 1.6, 10), x, y, z, r() * 3, r() * 3, r() * 3);
        else if (k < 0.55) tgt.put(new THREE.TorusGeometry(0.4 + r() * 0.5, 0.08 + r() * 0.06, 6, 16), x, y, z, r() * 3, r() * 3, 0);
        else tgt.put(tbox(0.3 + r() * 1.4, 0.1 + r() * 0.6, 0.3 + r() * 1.0, 1), x, y, z, r() * 0.8, r() * 3, r() * 0.8); } };
    pile(-7, -6, 90, 4.2); pile(7, -9, 110, 5); pile(-12, -18, 120, 6); pile(12, -22, 90, 5); pile(-3, -26, 80, 5);
    // gears
    const gear = (x, y, z, R, rx, ry) => { jr.put(cyl(R, R, 0.18, 24), x, y, z, rx, ry, 0); const n = Math.round(R * 14); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const tb = tbox(0.16, 0.18, 0.2, 1); const m = new THREE.Matrix4().makeRotationY(a).setPosition(Math.cos(a) * (R + 0.08), 0, -Math.sin(a) * (R + 0.08)); tb.applyMatrix4(m); jr.put(tb, x, y, z, rx, ry, 0); } };
    gear(-4.6, 1.2, -4.5, 0.9, 1.2, 0.3); gear(5.2, 0.9, -6.4, 0.7, 1.0, -0.6); gear(-9.5, 2.1, -15, 1.3, 1.4, 0.2);
    for (let i = 0; i < 12; i++) js.put(new THREE.TorusGeometry(0.12, 0.03, 6, 10), 3.2 + i * 0.16, 0.2 + Math.sin(i * 0.6) * 0.15, -3.6 + i * 0.05, i % 2 ? Math.PI / 2 : 0, 0.2, 0);
    jr.mesh(M.rust, g); js.mesh(M.steel, g); jw.mesh(M.rust2, g);
    // crane
    { const cr = batch(); for (let y = 0; y < 14; y += 1.4) { for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) cr.beam([12 + sx * 0.7, y, -16 + sz * 0.7], [12 + sx * 0.7, y + 1.4, -16 + sz * 0.7], 0.12); cr.beam([11.3, y, -15.3], [12.7, y + 1.4, -15.3], 0.08); cr.beam([11.3, y, -16.7], [12.7, y + 1.4, -16.7], 0.08); }
      cr.beam([12, 14, -16], [2, 14.5, -12], 0.4); cr.beam([12, 14, -16], [16, 14, -17], 0.4); cr.put(tbox(1.6, 1.2, 1.6, 1), 15.5, 13.6, -17); cr.mesh(toon({ color: '#b07a2a' }), g);
      add(cyl(0.02, 0.02, 8, 4), M.black, 2.6, 10.5, -12.2, g); const hook = add(new THREE.TorusGeometry(0.3, 0.07, 6, 12, Math.PI * 1.4), M.steel, 2.6, 6.4, -12.2, g); A.hook = hook; }
    // office shed (front wall z=+2 with window; side wall x=-2.25 with window + shutter)
    { const O = new THREE.Group(); g.add(O); A.office = O; const pl = toon({ map: P.tex(P.planks(46), 1, 1) });
      add(tbox(4.5, 0.2, 4, 1.2), M.planks, 0, 0.1, 0, O, { cast: false });
      const fw = batch(); wallWithWindow(fw, 4.5, 2.9, 0.15, -1.7, -0.3, 1.0, 2.1, 1.4); fw.mesh(M.planks, O, { cast: false }).position.set(0, 0.2, 2.0);
      const sw = batch(); wallWithWindow(sw, 4, 2.9, 0.15, -0.7, 0.7, 1.0, 2.2, 1.4); const swm = sw.mesh(M.planks, O, { cast: false }); swm.position.set(-2.25, 0.2, 0); swm.rotation.y = Math.PI / 2;
      add(tbox(4.5, 2.9, 0.15, 1.4), M.planks, 0, 1.65, -2.0, O, { cast: false }); add(tbox(0.15, 2.9, 4, 1.4), M.planks, 2.25, 1.65, 0, O, { cast: false });
      const rf = add(tbox(5.2, 0.15, 4.8, 1.4), toon({ color: '#4a4a50' }), 0, 3.25, 0, O, { cast: false }); rf.rotation.x = 0.08;
      add(tbox(0.9, 1.9, 0.08, 1), M.walnut, 1.2, 1.15, 2.08, O); add(new THREE.SphereGeometry(0.04, 8, 6), M.brass, 0.9, 1.1, 2.14, O);
      // shutter (roll-down slats) on the side window (inside)
      const sh = new THREE.Group(); sh.position.set(-2.12, 2.4, 0); O.add(sh); A.shutter = sh; const sb = batch(); for (let i = 0; i < 12; i++) sb.put(tbox(0.04, 0.11, 1.5, 1), 0, -0.05 - i * 0.1, 0); sb.mesh(toon({ color: '#6a5a40' }), sh); add(tbox(0.12, 0.16, 1.6, 1), toon({ color: '#5a4a34' }), -2.1, 2.45, 0, O);
      // desk + messy papers + framed fake document on the back wall
      add(tbox(1.6, 0.06, 0.8, 1), M.oak, -0.9, 0.98, -0.6, O); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(tbox(0.06, 0.78, 0.06, 1), M.oak, -0.9 + sx * 0.72, 0.59, -0.6 + sz * 0.32, O);
      for (let i = 0; i < 7; i++) plane(0.21, 0.29, M.paper, O, -1.4 + i * 0.15, 1.015 + i * 0.002, -0.45 + (i % 3) * 0.08, -Math.PI / 2, i * 0.7);
      add(tbox(0.3, 0.06, 0.22, 1), toon({ color: '#3a4a2a' }), -0.4, 1.04, -0.75, O); add(cyl(0.05, 0.05, 0.1, 10), M.white, -1.5, 1.06, -0.8, O);
      goldFrame(O, -0.6, 2.3, -1.9, 0.62, 0.82, M.doc, 0); }
    POINTS.scrap = [];
  }

  // =========================== M11 POLICE STATION ===========================
  { const g = mk('police');
    room(g, 9, 8, 3.4, M.wainscotGreen, M.planks, { wt: 3.4 });
    plane(1.4, 1.6, basic('#f2e6c8'), g, -2.2, 2.0, -3.88).userData.ndSkip = true; goldFrame(g, -2.2, 2.0, -3.86, 1.4, 1.6, basic('#f6ead0'), 0).children.forEach((c) => c.material === M.gold && (c.material = M.walnut));
    // counter running front-back (x = 0.2)
    add(tbox(0.7, 1.1, 4.2, 1.2), M.oak, 0.35, 0.55, -1.2, g); add(tbox(0.85, 0.06, 4.3, 1), M.walnut, 0.35, 1.13, -1.2, g);
    for (let i = 0; i < 4; i++) add(tbox(0.02, 0.6, 0.8, 1), M.walnut, -0.02, 0.55, -2.8 + i * 1.05, g);
    add(new THREE.SphereGeometry(0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.brass, 0.35, 1.16, 0.4, g); add(tbox(0.3, 0.06, 0.22, 1), toon({ color: '#3a2a20' }), 0.35, 1.19, -0.4, g);
    // wall telephone (wooden box, two bells, crank, hanging earpiece)
    { const T_ = new THREE.Group(); T_.position.set(2.0, 1.55, -3.85); g.add(T_); add(tbox(0.36, 0.6, 0.16, 1), M.walnut, 0, 0, 0.08, T_); for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.07, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.brass, s * 0.09, 0.2, 0.17, T_).rotation.x = Math.PI / 2;
      add(new THREE.ConeGeometry(0.05, 0.14, 10), M.black, 0, -0.02, 0.24, T_).rotation.x = -Math.PI / 2; add(cyl(0.025, 0.04, 0.2, 8), M.black, 0.25, -0.05, 0.12, T_); add(tbox(0.04, 0.12, 0.03, 1), M.black, -0.22, -0.05, 0.16, T_); }
    // coat rack with kepis
    { add(cyl(0.03, 0.03, 1.9, 6), M.walnut, -3.6, 0.95, -3.4, g); add(cyl(0.25, 0.25, 0.04, 10), M.walnut, -3.6, 0.02, -3.4, g); for (const s of [-1, 1]) { add(cyl(0.09, 0.08, 0.13, 12), toon({ color: '#1a2244' }), -3.6 + s * 0.18, 1.85, -3.4, g); } }
    // notice board with blank pinned sheets
    add(tbox(1.4, 0.9, 0.05, 1), toon({ color: '#a8845a' }), 2.4, 2.1, -3.87, g); for (let i = 0; i < 4; i++) plane(0.28, 0.36, M.paper, g, 1.95 + i * 0.3, 2.1 + (i % 2) * 0.08, -3.84, 0, 0);
    // door (right wall) the gendarmes run out of
    add(tbox(0.1, 2.3, 1.1, 1), M.walnut, 4.45, 1.15, 0.5, g);
    add(tbox(0.3, 1.0, 0.6, 1), M.oak, 2.6, 0.5, -3.0, g); { const dl = new THREE.Group(); dl.position.set(0.3, 1.16, -2.6); g.add(dl); add(cyl(0.05, 0.06, 0.03, 10), M.brass, 0, 0, 0, dl); add(cyl(0.008, 0.008, 0.3, 6), M.brass, 0, 0.15, 0, dl); add(new THREE.ConeGeometry(0.1, 0.12, 12, 1, true), toon({ color: '#1f5a3a', side: THREE.DoubleSide }), 0, 0.3, 0.05, dl); }
    POINTS.police = [{ pos: [0, 2.8, -1], color: '#fff0d0', i: 1.2, d: 9 }];
  }

  // =========================== M12 PRESS BASEMENT ===========================
  { const g = mk('press');
    room(g, 8, 7, 2.8, M.brick, M.concrete, { wt: 2.2, ceil: M.concreteDark });
    { const pp = batch(); for (const z of [-2.8, -2.4]) pp.put(cyl(0.07, 0.07, 8, 8), 0, 2.55, z, 0, 0, Math.PI / 2); pp.put(cyl(0.05, 0.05, 2.6, 8), -3.6, 1.3, -3.2); pp.mesh(M.steel, g); }
    // bare bulb on a cord (swings)
    { const b = new THREE.Group(); b.position.set(-0.2, 2.7, 0); g.add(b); A.bulb = b; add(cyl(0.006, 0.006, 0.9, 4), M.black, 0, -0.45, 0, b); add(cyl(0.03, 0.03, 0.06, 8), M.steel, 0, -0.92, 0, b); const gl = add(new THREE.SphereGeometry(0.06, 12, 8), glowM('#fff1c0'), 0, -0.99, 0, b, { cast: false }); ndSkip(gl); }
    // printing press
    { const pr = new THREE.Group(); pr.position.set(0.9, 0, -1.2); g.add(pr); const ir = toon({ color: '#2c2f33' });
      add(tbox(1.8, 0.8, 1.0, 1), ir, 0, 0.4, 0, pr); for (const s of [-1, 1]) add(tbox(0.15, 1.6, 0.9, 1), ir, s * 0.85, 1.4, 0, pr); add(tbox(1.85, 0.2, 1.0, 1), ir, 0, 2.2, 0, pr);
      const pl = add(tbox(1.4, 0.15, 0.8, 1), M.steel, 0, 1.4, 0, pr); A.platen = pl; add(tbox(1.4, 0.05, 0.8, 1), M.note, 0, 0.83, 0, pr);
      const fw = new THREE.Group(); fw.position.set(1.15, 1.2, 0.0); pr.add(fw); A.fly = fw; const t = add(new THREE.TorusGeometry(0.6, 0.06, 8, 30), ir, 0, 0, 0, fw); t.rotation.y = Math.PI / 2; for (let i = 0; i < 6; i++) { const sp = add(tbox(0.04, 1.2, 0.05, 1), ir, 0, 0, 0, fw); sp.rotation.x = i * Math.PI / 6; }
      A.rollers = []; for (const z of [-0.25, 0.25]) { const r_ = add(cyl(0.09, 0.09, 1.5, 12), toon({ color: '#1a1a1a' }), 0, 2.0, z, pr); r_.rotation.z = Math.PI / 2; A.rollers.push(r_); }
      add(tbox(1.0, 0.04, 0.6, 1), M.steel, 0, 0.9, 0.85, pr).rotation.x = -0.3; for (let i = 0; i < 6; i++) add(tbox(0.36, 0.01, 0.18, 1), M.note, -0.2 + (i % 3) * 0.2, 0.95 + i * 0.012, 0.95, pr, { cast: false }); }
    // shelves with ink tins and paper reams
    { add(tbox(1.8, 0.05, 0.4, 1), M.oak, -2.6, 1.4, -3.2, g); add(tbox(1.8, 0.05, 0.4, 1), M.oak, -2.6, 0.8, -3.2, g); for (let i = 0; i < 5; i++) add(cyl(0.09, 0.09, 0.14, 10), i % 2 ? M.green : toon({ color: '#2a2a2a' }), -3.3 + i * 0.35, 1.5, -3.2, g); for (let i = 0; i < 3; i++) add(tbox(0.4, 0.15, 0.3, 1), M.paper, -3.1 + i * 0.5, 0.9, -3.2, g); }
    POINTS.press = [{ pos: [-0.2, 1.7, 0], color: '#ffd890', i: 3.2, d: 7 }];
  }

  // =========================== M13 ISLAND PRISON (night, fog) ===========================
  { const g = mk('island');
    const sea = add(new THREE.PlaneGeometry(4000, 4000), C.waterMat, 0, 0, 0, g, { cast: false }); sea.rotation.x = -Math.PI / 2; sea.userData.nd = C.waterNd; sea.receiveShadow = false;
    const rk = batch(), r = rng(81);
    for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = r() * 55, s = 8 + r() * 14; rk.put(new THREE.IcosahedronGeometry(1, 1), Math.cos(a) * d, -2 + r() * 6, Math.sin(a) * d * 0.7, r() * 3, r() * 3, 0, new THREE.Vector3(s * 1.3, s * (0.6 + r() * 0.6), s)); }
    add(new THREE.CylinderGeometry(48, 60, 16, 20), M.rock, 0, 6, 0, g); rk.mesh(M.rock, g);
    // prison blocks with window slits
    const pb = batch(), pw = batch();
    for (const [x, z, w, d, h] of [[-8, -6, 46, 13, 11], [18, 8, 16, 18, 8], [-26, 12, 12, 12, 7]]) { pb.put(tbox(w, h, d, 4), x, 14 + h / 2, z); pb.put(tbox(w + 0.6, 0.6, d + 0.6, 4), x, 14 + h + 0.3, z);
      for (let fl = 0; fl < Math.floor(h / 3); fl++) for (let k = 0; k < Math.floor(w / 2.4); k++) pw.put(tbox(0.5, 1.2, 0.1, 1), x - w / 2 + 1.4 + k * 2.4, 15.8 + fl * 3, z + d / 2 + 0.03); }
    pb.put(cyl(1.2, 1.4, 14, 12), 6, 21, -10); pb.put(tbox(4, 3, 4, 2), -30, 24, -8); pb.put(cyl(2.4, 2.4, 3, 14), -30, 27, -8);
    pb.mesh(M.concrete, g); pw.mesh(toon({ color: '#1a1c22' }), g, { cast: false });
    // lit windows (a few)
    for (let i = 0; i < 16; i++) { const w = add(tbox(0.5, 1.2, 0.05, 1), glowM('#ffcf7a'), -29 + (i * 5.3) % 44, 15.8 + (i % 3) * 3, 0.6, g, { cast: false }); ndSkip(w); }
    // lighthouse
    { const L = new THREE.Group(); L.position.set(30, 14, -4); g.add(L); add(cyl(1.6, 2.4, 16, 16), M.white, 0, 8, 0, L); add(cyl(2.2, 2.2, 0.4, 16), M.black, 0, 16.2, 0, L); const lan = add(cyl(1.2, 1.2, 1.8, 12), glowM('#fff3c8'), 0, 17.3, 0, L, { cast: false }); ndSkip(lan); add(new THREE.ConeGeometry(1.6, 1.4, 12), M.red, 0, 18.9, 0, L);
      const bm = new THREE.Group(); bm.position.set(0, 17.3, 0); L.add(bm); A.beam = bm; for (const s of [0, Math.PI]) { const cone = new THREE.Mesh(new THREE.ConeGeometry(14, 180, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#fff4c8', transparent: true, opacity: 0.09, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false })); cone.geometry.translate(0, -90, 0); cone.rotation.z = Math.PI / 2 + s; cone.rotation.order = 'YXZ'; cone.userData.ndSkip = true; bm.add(cone); } }
    // far shore lights
    for (let i = 0; i < 40; i++) { const s_ = add(new THREE.SphereGeometry(0.9, 6, 4), glowM('#ffcf7a'), -600 + i * 32 + r() * 10, 3 + r() * 6, -700 - r() * 60, g, { cast: false }); ndSkip(s_); }
    POINTS.island = [{ pos: [30, 31, -4], color: '#fff0c0', i: 6, d: 60 }];
  }

  // =========================== M13 CELL BLOCK ===========================
  { const g = mk('cells');
    add(tbox(10, 0.2, 40, 2), M.concrete, 0, -0.1, -14, g, { cast: false }); add(tbox(10, 0.2, 40, 3), M.concreteDark, 0, 4.2, -14, g, { cast: false });
    add(tbox(0.3, 4.2, 40, 3), M.concrete, 2.2, 2.1, -14, g, { cast: false }); add(tbox(0.3, 4.2, 40, 3), M.concrete, -5.6, 2.1, -14, g, { cast: false });
    { const bb = batch(), cw = batch(); for (let i = 0; i < 12; i++) { const z0 = 2 - i * 3; cw.put(tbox(3.8, 4.2, 0.25, 3), -3.7, 2.1, z0);
        for (let k = 0; k < 20; k++) bb.put(cyl(0.022, 0.022, 3.0, 6), -1.75, 1.5, z0 - 0.15 - k * 0.14); for (const y of [0.05, 1.5, 2.95]) bb.put(tbox(0.06, 0.08, 3.0, 1), -1.75, y, z0 - 1.5);
        cw.put(tbox(0.12, 0.45, 1.9, 1), -4.9, 0.45, z0 - 1.5); }
      bb.mesh(M.bars, g); cw.mesh(M.concrete, g); }
    // the hero cell (z 2..-1): cot, blanket, shelf, high barred window with moonlight
    { add(tbox(0.8, 0.05, 1.9, 1), M.steel, -4.6, 0.45, 0.5, g); add(tbox(0.78, 0.1, 1.8, 1), toon({ color: '#6a6e78' }), -4.6, 0.52, 0.5, g); add(tbox(0.5, 0.1, 0.3, 1), M.white, -4.6, 0.6, 1.25, g);
      for (const [x, z] of [[-4.95, -0.4], [-4.25, -0.4], [-4.95, 1.4], [-4.25, 1.4]]) add(cyl(0.02, 0.02, 0.45, 6), M.steel, x, 0.22, z, g);
      add(tbox(0.6, 0.04, 0.25, 1), M.oak, -5.3, 1.5, -0.2, g); add(cyl(0.05, 0.05, 0.1, 8), M.white, -5.3, 1.57, -0.3, g);
      const win = add(tbox(0.05, 0.5, 0.7, 1), glowM('#b8c8ff'), -5.42, 3.0, 0.5, g, { cast: false }); ndSkip(win); for (let k = 0; k < 4; k++) add(cyl(0.015, 0.015, 0.5, 4), M.bars, -5.4, 3.0, 0.24 + k * 0.17, g); }
    // overhead lamps along the corridor
    for (let i = 0; i < 8; i++) { const z = 0 - i * 4.5; add(cyl(0.01, 0.01, 0.6, 4), M.black, 0.3, 3.85, z, g); add(new THREE.ConeGeometry(0.3, 0.22, 14, 1, true), toon({ color: '#3a4a3a', side: THREE.DoubleSide }), 0.3, 3.5, z, g); const b = add(new THREE.SphereGeometry(0.09, 10, 8), glowM('#fff0c8'), 0.3, 3.42, z, g, { cast: false }); ndSkip(b); }
    { const pp = batch(); pp.put(cyl(0.06, 0.06, 40, 8), 2.0, 3.6, -14, Math.PI / 2, 0, 0); pp.put(cyl(0.04, 0.04, 40, 8), 2.0, 3.35, -14, Math.PI / 2, 0, 0); pp.mesh(M.steel, g); }
    POINTS.cells = [{ pos: [0.3, 3.2, 0], color: '#fff0c8', i: 1.6, d: 7 }, { pos: [0.3, 3.2, -9], color: '#fff0c8', i: 1.4, d: 8 }, { pos: [-4.6, 2.6, 0.6], color: '#9fb4ff', i: 0.9, d: 4 }];
  }

  // =========================== per-frame animation ===========================
  const facadeDay = M.facade.map, facadeDay2 = M.facade2.map;
  const facadeNight = P.tex(P.facade(23, 222, 0.35)), facadeNight2 = P.tex(P.facade(123, 222, 0.3));
  K.update = (W, f, L) => {
    const t = f / 30;
    K.POINTS.paris = W.night ? [{ pos: [54.5, GR_ + 18.6, -8.5], color: '#9fb0ff', i: 1.4, d: 7 }, { pos: [50, GR_ + 26, -38], color: '#b8c4ff', i: 2.5, d: 40 }] : [];
    if (W.set === 'paris') {
      const night = !!W.night; M.facade.map = night ? facadeNight : facadeDay; M.facade2.map = night ? facadeNight2 : facadeDay2;
      M.facade.color.set(night ? '#8a96c8' : '#ffffff'); M.facade2.color.set(night ? '#8a96c8' : '#ffffff'); M.zinc.color.set(night ? '#7a86b8' : '#ffffff'); M.chimney.color.set(night ? '#5a4a6a' : '#b0684a'); M.street.color.set(night ? '#6a74a0' : '#ffffff');
      A.boat.position.x = 40 - t * 1.2;
      const bf = W.boltFall ?? -1; A.bolt.position.copy(A.bolt0); A.bolt.rotation.set(0, 0, 0);
      if (bf > 0) { A.bolt.position.y -= 0.5 * 9.8 * bf * bf; A.bolt.position.x += bf * 0.4; A.bolt.rotation.set(bf * 9, 0, bf * 6); }
      A.atticDoor.rotation.y = W.door ?? 0;
      [A.curtL, A.curtR].forEach((c, k) => { const pa = c.geometry.attributes.position, base = A.curtBase[k], amp = W.wind ?? 0; for (let i = 0; i < pa.count; i++) { const x = base[i * 3], y = base[i * 3 + 1], low = (0.85 - y) / 1.7; pa.setZ(i, base[i * 3 + 2] + amp * low * (0.5 + 0.5 * Math.sin(f * 0.5 + x * 4 + k)) * 0.9); pa.setX(i, x + amp * low * 0.25 * Math.sin(f * 0.3 + k * 2)); } pa.needsUpdate = true; });
    }
    if (W.set === 'cafe') A.paper3d.visible = !!W.paper3d;
    if (W.set === 'forge') { const fl = 0.85 + 0.15 * Math.sin(f * 1.7) * Math.sin(f * 0.73); A.flame.scale.set(1, fl, 1); A.docDraw(W.sign ?? 0, W.seal ?? 0); K.POINTS.forge[1].i = 1.0 + 0.35 * Math.sin(f * 1.3) * Math.sin(f * 0.47); }
    if (W.set === 'lobby') { A.revolve.rotation.y = W.revolve ?? t * 0.6; A.chand.rotation.y = Math.sin(t * 0.5) * 0.05; A.cart.position.x = -3.2 + (W.cartX ?? 0); }
    if (W.set === 'salon') { const k = W.curtain ?? 0; A.cL.position.x = -1.9 + k * 1.2; A.cR.position.x = 1.9 - k * 1.2; A.cL.scale.x = A.cR.scale.x = 1 + k * 0.05; A.salonView.material = W.dusk ? K.M.viewNight : K.M.view; }
    if (W.set === 'corridor') A.heroDoor.rotation.y = W.doorAng ?? 0.6;
    if (W.set === 'study') { const n = W.money ?? 0; A.money.forEach((m, i) => { m.visible = i < n; const drop = W.moneyDrop?.[i] ?? 0; m.position.y = 0.82 + Math.floor(i / 3) * 0.046 + Math.max(0, drop) * 0.4; }); const e = W.env ?? 0; A.env.visible = e < 1; A.env.position.copy(A.env0).add(new THREE.Vector3(-e * 0.6, e * 0.7, e * 0.1)); A.env.rotation.z = e * 1.2; }
    if (W.set === 'station') { const x = W.trainX ?? 0; A.train.position.x = x; A.train.rotation.y = W.trainFlip ? Math.PI : 0; A.wheels.forEach(([w, r]) => { w.rotation.y = -x / r; }); }
    if (W.set === 'scrap') { const k = W.shutter ?? 0; A.shutter.scale.y = Math.max(0.05, k); A.hook.rotation.z = Math.sin(t * 1.3) * 0.15; }
    if (W.set === 'press') { const ph = t * 12; A.platen.position.y = 1.4 - Math.max(0, Math.sin(ph)) * 0.45; A.fly.rotation.x = ph; A.rollers.forEach((r_) => (r_.rotation.x = ph * 2)); A.bulb.rotation.z = Math.sin(t * 2.2) * 0.12; A.bulb.rotation.x = Math.sin(t * 1.7) * 0.06; K.POINTS.press[0].pos = [-0.2 + Math.sin(t * 2.2) * 0.11, 1.7, Math.sin(t * 1.7) * 0.05]; }
    if (W.set === 'island') A.beam.rotation.y = t * 1.4;
  };
}
