// 3D sets for the Brain series. Every set sits at the origin; only the active set(s) are visible.
// Floors are at y = 0. No text anywhere: labels, papers and screens are only shapes, lines and icons.
export function buildSets({ THREE, P, scene, add, box, tbox, toon }) {
  const S = {};
  const grp = (name) => { const g = new THREE.Group(); g.visible = false; scene.add(g); return g; };
  const C = (col) => toon({ color: col });
  const ctex = (w, h, draw, rx = 1, ry = 1) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h, P.rng(w * 7 + h)); return P.tex(c, rx, ry); };
  const TM = (t, col = '#ffffff') => toon({ map: t, color: col });
  const flat = (m) => { m.userData.flat = true; return m; };
  const plane = (w, h, mat, x, y, z, parent, ry = 0, rxx = 0) => { const m = add(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false }); m.rotation.set(rxx, ry, 0); return m; };
  const cyl = (r0, r1, h, seg = 20) => new THREE.CylinderGeometry(r0, r1, h, seg);
  const sph = (r, a = 16, b = 12) => new THREE.SphereGeometry(r, a, b);
  const basic = (col, extra = {}) => new THREE.MeshBasicMaterial({ color: col, fog: false, ...extra });
  const lerpC = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t)));

  // ---------- shared textures ----------
  const T = {
    concrete: ctex(256, 256, (g, w, h, r) => { g.fillStyle = '#9a9ca3'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${r() < .5 ? '70,72,80' : '190,192,198'},.18)`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 10, 2 + r() * 7, 0, 0, 7); g.fill(); } }),
    cinder: ctex(512, 512, (g, w, h, r) => { g.fillStyle = '#6f727b'; g.fillRect(0, 0, w, h); for (let row = 0; row < 8; row++) for (let col = -1; col < 4; col++) { const x = col * 160 + (row % 2) * 80, y = row * 64; g.fillStyle = `hsl(225,6%,${54 + r() * 8}%)`; g.fillRect(x + 4, y + 4, 152, 56); } }),
    tiles: ctex(256, 256, (g, w, h) => { g.fillStyle = '#e9edf0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9d0d6'; g.lineWidth = 4; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }),
    lino: ctex(256, 256, (g, w, h, r) => { g.fillStyle = '#d9cfb8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(150,130,100,${.08 + r() * .1})`; g.fillRect(r() * w, r() * h, 3 + r() * 20, 2 + r() * 4); } g.strokeStyle = '#c4b89c'; g.lineWidth = 3; g.strokeRect(0, 0, w, h); }),
    wood: ctex(512, 512, (g, w, h, r) => { for (let i = 0; i < 8; i++) { g.fillStyle = `hsl(${26 + r() * 6},${42 + r() * 8}%,${30 + r() * 8}%)`; g.fillRect(i * 64, 0, 64, h); for (let k = 0; k < 10; k++) { g.strokeStyle = `rgba(30,15,8,${.2 + r() * .25})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = i * 64 + r() * 64; g.moveTo(x, 0); g.bezierCurveTo(x + 6, 170, x - 6, 340, x + r() * 6, h); g.stroke(); } g.fillStyle = 'rgba(20,10,5,.7)'; g.fillRect(i * 64, 0, 3, h); } }),
    panel: ctex(512, 512, (g, w, h, r) => { g.fillStyle = '#7a4a2a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) { const x = i * 256 + 24, y = k * 256 + 24; g.fillStyle = '#8f5a34'; g.fillRect(x, y, 208, 208); g.strokeStyle = '#5a321c'; g.lineWidth = 8; g.strokeRect(x, y, 208, 208); g.strokeStyle = '#a8703f'; g.lineWidth = 3; g.strokeRect(x + 10, y + 10, 188, 188); } }),
    brick: ctex(512, 512, (g, w, h, r) => { g.fillStyle = '#6b4a3a'; g.fillRect(0, 0, w, h); for (let row = 0; row < 16; row++) for (let col = -1; col < 5; col++) { const x = col * 128 + (row % 2) * 64, y = row * 32; g.fillStyle = `hsl(${14 + r() * 8},${38 + r() * 12}%,${34 + r() * 10}%)`; g.fillRect(x + 3, y + 3, 122, 26); } }),
    marble: ctex(512, 512, (g, w, h, r) => { for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) { g.fillStyle = (i + k) % 2 ? '#e9e3d8' : '#cfc6b8'; g.fillRect(i * 256, k * 256, 256, 256); } for (let k = 0; k < 14; k++) { g.strokeStyle = 'rgba(120,110,100,.3)'; g.lineWidth = 2; g.beginPath(); let x = r() * w, y = 0; g.moveTo(x, y); while (y < h) { x += r() * 40 - 20; y += 30 + r() * 30; g.lineTo(x, y); } g.stroke(); } }),
    steel: ctex(256, 512, (g, w, h, r) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#c4cbd2'); gr.addColorStop(0.5, '#dfe4e8'); gr.addColorStop(1, '#bcc3ca'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 120; i++) { g.strokeStyle = `rgba(${r() < .5 ? '255,255,255' : '120,130,140'},.08)`; g.lineWidth = 1; const y = r() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + r() * 2); g.stroke(); } g.fillStyle = '#9aa3ad'; g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h); }),
    glass: ctex(512, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#9ad8f2'); gr.addColorStop(0.5, '#62aedb'); gr.addColorStop(1, '#b4e4f6'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#d9e6ee'; for (let i = 0; i < 8; i++) g.fillRect(i * 64 - 2, 0, 4, h); g.fillStyle = '#f4f7f9'; for (let i = 0; i < 2; i++) g.fillRect(0, i * 256, w, 22); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 14; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(i * 120 + 10, 230); g.lineTo(i * 120 + 90, 40); g.stroke(); } }),
    windows: ctex(256, 512, (g, w, h, r) => { g.fillStyle = '#c9b49a'; g.fillRect(0, 0, w, h); for (let y = 16; y < h; y += 64) for (let x = 16; x < w; x += 64) { g.fillStyle = r() < .3 ? '#ffe9a8' : '#5d7a99'; g.fillRect(x, y, 34, 40); g.fillStyle = '#8a7a66'; g.fillRect(x - 2, y + 40, 38, 5); } }),
    asphalt: ctex(256, 256, (g, w, h, r) => { g.fillStyle = '#4a4d55'; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${r() < .5 ? '20,20,25' : '120,122,130'},.25)`; g.fillRect(r() * w, r() * h, 2, 2); } }),
    grass: ctex(256, 256, (g, w, h, r) => { g.fillStyle = '#6fb04a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 600; i++) { g.strokeStyle = `hsl(${90 + r() * 25},45%,${34 + r() * 18}%)`; g.lineWidth = 2; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 6 - r() * 6); g.stroke(); } }),
    paving: ctex(256, 256, (g, w, h, r) => { g.fillStyle = '#d8d2c4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8b0a0'; g.lineWidth = 4; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }),
    cloth: ctex(256, 256, (g, w, h, r) => { g.fillStyle = '#f2efe8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(200,190,180,.25)'; g.fillRect(i * 26, 0, 6, h); } for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${r() < .5 ? '255,0,80' : '255,120,170'},.5)`; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 9, 3 + r() * 6, 0, 0, 7); g.fill(); } }),
    sky: ctex(512, 256, (g, w, h, r) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5aa8e6'); gr.addColorStop(1, '#cfe9fb'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = '#ffffffdd'; const x = r() * w, y = 30 + r() * 120; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + k * 22, y + Math.sin(k) * 8, 26, 18, 0, 0, 7); g.fill(); } } }),
    grid: ctex(1024, 1024, (g, w, h) => { g.fillStyle = '#1c4f8f'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(200,230,255,.18)'; g.lineWidth = 2; for (let i = 0; i <= 32; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); } g.strokeStyle = 'rgba(200,230,255,.35)'; g.lineWidth = 3; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke(); } }),
  };
  T.tiles.repeat.set(8, 8); T.concrete.repeat.set(3, 3); T.lino.repeat.set(6, 6); T.marble.repeat.set(6, 6); T.asphalt.repeat.set(20, 20); T.grass.repeat.set(30, 30); T.paving.repeat.set(14, 14); T.wood.repeat.set(3, 3);
  const pinkTex = (crack) => ctex(512, 512, (g, w, h, r) => {
    g.fillStyle = '#f7a8c8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,200,225,.35)'; g.fillRect(r() * w, 0, 8 + r() * 30, h); }
    if (crack > 0) { // peeling: grey patches + crack lines
      const r2 = P.rng(99); for (let i = 0; i < 26 * crack; i++) { const x = r2() * w, y = r2() * h, s = 16 + r2() * 60 * crack; g.fillStyle = '#8f9199'; g.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, rr = s * (0.6 + r2() * 0.6); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }
      const r3 = P.rng(7); g.strokeStyle = '#3a2d36'; g.lineWidth = 3; for (let i = 0; i < 18 * crack; i++) { let x = r3() * w, y = r3() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += r3() * 50 - 25; y += r3() * 50 - 25; g.lineTo(x, y); } g.stroke(); }
      if (crack > 0.9) { g.fillStyle = 'rgba(140,142,150,.7)'; g.fillRect(0, 0, w, h); }
    }
  });
  const PINKS = [pinkTex(0), pinkTex(0.35), pinkTex(0.7), pinkTex(1)];
  const PINK_WALL = '#f7a8c8', GREY_WALL = '#8b8e97';

  // =================== STUDIO (host set: intro, chapter cards, outro) ===================
  {
    const g = grp(); const U = { a: { value: new THREE.Color('#7fd6e0') }, b: { value: new THREE.Color('#b59cf0') }, glow: { value: 0.35 } };
    const bgMat = new THREE.ShaderMaterial({ uniforms: U, fog: false, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform vec3 a, b; uniform float glow; varying vec3 vP; void main(){ float t = clamp(vP.y/14.+.35, 0., 1.); vec3 c = mix(a, b, t); float d = length(vec2(atan(vP.x, -vP.z)*3.2, vP.y-3.)); c += glow*vec3(1.,.95,.9)*exp(-d*d*.03)*.5; gl_FragColor = vec4(c,1.); }` });
    const cyc = add(new THREE.CylinderGeometry(16, 16, 30, 48, 1, true, Math.PI * 0.5, Math.PI * 1.0), bgMat, 0, 8, 0, g, { cast: false }); cyc.userData.flat = true; cyc.rotation.y = Math.PI * 0.0;
    cyc.material.side = THREE.BackSide;
    const floorU = { a: U.a, b: U.b };
    const floorMat = new THREE.ShaderMaterial({ uniforms: floorU, fog: false, vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform vec3 a, b; varying vec3 vP; void main(){ float r = length(vP.xy); vec3 c = mix(a*1.04, a*.82, smoothstep(2., 16., r)); gl_FragColor = vec4(c,1.); }` });
    const floor = add(new THREE.CircleGeometry(17, 48), floorMat, 0, 0, 0, g, { cast: false }); floor.rotation.x = -Math.PI / 2; floor.userData.flat = true;
    const stage = add(cyl(2.6, 2.75, 0.22, 48), C('#fff3d6'), 0, 0.11, 0, g); const ring = add(new THREE.TorusGeometry(2.62, 0.06, 8, 64), C('#36c2c9'), 0, 0.22, 0, g); ring.rotation.x = Math.PI / 2;
    // floating deco: bulbs, gears-like rings, spheres (no symbols)
    const deco = new THREE.Group(); g.add(deco); const r = P.rng(5), decoItems = [];
    const cols = ['#ffd24a', '#36c2c9', '#ff8aa5', '#9be37a', '#ffffff'];
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? 1 : -1, a = Math.PI * (1 + side * (0.2 + 0.22 * r())), d = 8 + r() * 4, y = 0.6 + r() * 3.2;
      const m = i % 3 === 0 ? add(new THREE.TorusGeometry(0.45 + r() * 0.3, 0.12, 10, 24), C(cols[i % 5]), 0, 0, 0, deco) : i % 3 === 1 ? add(sph(0.35 + r() * 0.4), C(cols[(i + 2) % 5]), 0, 0, 0, deco) : add(new THREE.OctahedronGeometry(0.45 + r() * 0.3), C(cols[(i + 1) % 5]), 0, 0, 0, deco);
      m.position.set(Math.sin(a) * d * -1, y, Math.cos(a) * d); m.userData.p0 = m.position.clone(); m.userData.ph = r() * 6; decoItems.push(m);
    }
    // armchair for the outro
    const chair = new THREE.Group(); g.add(chair); const cm = C('#5a7fd6'), cm2 = C('#4766b8');
    add(tbox(2.0, 0.55, 1.2), cm, 0, 0.5, 0, chair); add(tbox(2.0, 1.25, 0.35), cm, 0, 1.25, -0.48, chair);
    for (const s of [-1, 1]) add(tbox(0.36, 0.85, 1.25), cm2, s * 1.0, 0.75, 0, chair);
    add(tbox(1.35, 0.22, 0.95), C('#7aa0f0'), 0, 0.86, 0.06, chair);
    for (const s of [-1, 1]) for (const z of [-0.5, 0.5]) add(cyl(0.06, 0.04, 0.25, 8), C('#5a3b2a'), s * 0.95, 0.12, z, chair);
    chair.position.set(0, 0.22, -0.2);
    S.studio = { group: g, update: (W, f) => {
      const st = W.studio || {};
      U.a.value.set(st.a || '#7fd6e0'); U.b.value.set(st.b || '#b59cf0'); U.glow.value = st.glow ?? 0.35;
      deco.visible = (st.deco ?? 1) > 0.01; decoItems.forEach((m, i) => { m.position.copy(m.userData.p0); m.position.y += Math.sin(f * 0.04 + m.userData.ph) * 0.25; m.rotation.set(f * 0.01 + i, f * 0.013, 0); const k = st.deco ?? 1; m.scale.setScalar(Math.max(0.001, k)); });
      chair.visible = !!st.chair; stage.visible = ring.visible = st.stage !== false;
    } };
  }

  // =================== PRISON CELL ===================
  {
    const g = grp();
    const fl = add(new THREE.PlaneGeometry(6, 6), TM(T.concrete, '#b5b7bd'), 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const wallMat = TM(T.cinder), sideMat = TM(T.cinder);
    T.cinder.repeat.set(2, 2);
    const back = add(tbox(6, 3.8, 0.2, 3), wallMat, 0, 1.9, -2.6, g);
    for (const s of [-1, 1]) add(tbox(0.2, 3.8, 5.4, 3), sideMat, s * 2.9, 1.9, 0, g);
    // pink paint overlay on the back wall, grows from the left
    const pinkMat = toon({ map: PINKS[0], color: '#ffffff' });
    const pinkG = new THREE.Group(); pinkG.position.set(-2.8, 1.9, -2.48); g.add(pinkG);
    const pink = add(new THREE.PlaneGeometry(5.6, 3.8), pinkMat, 2.8, 0, 0, pinkG, { cast: false });
    pink.userData.flat = true;
    // small barred window (high, left)
    const win = new THREE.Group(); win.position.set(-1.2, 2.75, -2.44); g.add(win);
    add(new THREE.PlaneGeometry(0.9, 0.6), basic('#9fd0f0'), 0, 0, 0, win, { cast: false }).userData.flat = true;
    for (let i = -1; i <= 1; i++) add(cyl(0.025, 0.025, 0.62, 8), C('#4a4d55'), i * 0.24, 0, 0.03, win);
    for (const [w, h, x, y] of [[1.02, 0.08, 0, 0.34], [1.02, 0.08, 0, -0.34], [0.08, 0.76, -0.49, 0], [0.08, 0.76, 0.49, 0]]) add(box(w, h, 0.08), C('#5c5f68'), x, y, 0.02, win);
    // bunk bed (right)
    const bunk = new THREE.Group(); bunk.position.set(1.75, 0, -1.6); g.add(bunk); const metal = C('#7f8794');
    for (const x of [-0.5, 0.5]) for (const z of [-0.95, 0.95]) add(cyl(0.04, 0.04, 2.6, 8), metal, x, 1.3, z, bunk);
    for (const y of [0.45, 2.1]) { add(tbox(1.05, 0.08, 2.0), metal, 0, y, 0, bunk); add(tbox(0.95, 0.16, 1.9), C('#d7d3c8'), 0, y + 0.12, 0, bunk); add(tbox(0.6, 0.12, 0.35), C('#f2efe8'), 0, y + 0.26, -0.72, bunk); add(tbox(0.97, 0.06, 1.2), C('#5d7a99'), 0, y + 0.22, 0.32, bunk); }
    bunk.rotation.y = 0;
    // front bars + door
    const bars = new THREE.Group(); bars.position.set(0, 0, 2.6); g.add(bars); const barM = C('#5c5f68');
    for (let i = 0; i < 25; i++) { const x = -2.85 + i * 0.2375; if (x > -0.55 && x < 0.55) continue; add(cyl(0.03, 0.03, 3.8, 8), barM, x, 1.9, 0, bars); }
    for (const y of [0.15, 1.9, 3.7]) add(box(5.8, 0.08, 0.08), barM, 0, y, 0, bars);
    const door = new THREE.Group(); door.position.set(-0.55, 0, 2.6); g.add(door);
    for (let i = 0; i < 5; i++) add(cyl(0.03, 0.03, 3.0, 8), barM, 0.1 + i * 0.22, 1.5, 0, door);
    for (const y of [0.15, 1.5, 2.95]) add(box(1.1, 0.07, 0.07), barM, 0.55, y, 0, door);
    add(box(0.18, 0.25, 0.12), C('#3a3d44'), 0.98, 1.4, 0, door);
    // arm-wrestling table
    const table = new THREE.Group(); g.add(table); add(tbox(1.1, 0.08, 0.8), C('#8a6a48'), 0, 0.95, 0, table); for (const s of [-1, 1]) for (const z of [-0.3, 0.3]) add(cyl(0.04, 0.04, 0.92, 8), C('#5a4a3a'), s * 0.45, 0.46, z, table);
    table.position.set(0, 0, 0.2);
    // outside corridor floor
    const out = add(new THREE.PlaneGeometry(30, 12), TM(T.concrete, '#a9abb2'), 0, -0.001, 5.6, g, { cast: false }); out.rotation.x = -Math.PI / 2;
    add(tbox(30, 4.4, 0.2, 3), TM(T.cinder, '#9a9ca6'), 0, 2.2, 9.4, g); for (const s of [-1, 1]) add(tbox(12, 4.4, 0.2, 3), TM(T.cinder, '#8f929b'), s * 5.95, 2.2, 2.6, g); add(box(30, 0.2, 12), C('#6f727b'), 0, 4.0, 5.6, g, { cast: false });
    add(box(6, 0.2, 5.6), C('#7a7d86'), 0, 3.85, 0, g, { cast: false });
    S.cell = { group: g, update: (W) => {
      const c = W.cell || {};
      const p = c.paint ?? 0; pinkG.scale.x = Math.max(0.0001, p); pinkG.visible = p > 0.001;
      const ci = c.crack ?? 0; pinkMat.map = PINKS[Math.min(3, Math.floor(ci * 3.99))]; pinkMat.color.copy(lerpC('#ffffff', '#c9c9cf', Math.max(0, ci - 0.8) * 5));
      sideMat.color.copy(lerpC('#ffffff', '#ffc0d8', (c.side ?? 0) * (1 - Math.max(0, ci - 0.6) * 2.5)));
      wallMat.color.set('#ffffff');
      door.rotation.y = -(c.door ?? 0) * 1.6; table.visible = !!c.table;
    } };
  }

  // =================== PAINT BUCKET close-up ===================
  {
    const g = grp(); const U = { k: { value: 0 }, t: { value: 0 } };
    const fl = add(new THREE.PlaneGeometry(30, 30), TM(T.cloth), 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2; T.cloth.repeat.set(7, 7); add(tbox(30, 8, 0.2, 3), TM(T.cinder, '#ffd0e0'), 0, 4, -4, g);
    add(new THREE.CylinderGeometry(0.62, 0.55, 0.9, 40, 1, true), toon({ color: '#f4f5f7', side: THREE.DoubleSide }), 0, 0.45, 0, g);
    add(new THREE.CircleGeometry(0.55, 32), C('#e9ebee'), 0, 0.005, 0, g).rotation.x = -Math.PI / 2;
    const rim = add(new THREE.TorusGeometry(0.62, 0.025, 8, 48), C('#c9ced4'), 0, 0.9, 0, g); rim.rotation.x = Math.PI / 2;
    const handle = add(new THREE.TorusGeometry(0.62, 0.015, 6, 40, Math.PI), C('#7f8794'), 0, 0.88, 0, g); handle.rotation.set(0, 0.4, 0);
    const paintMat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: `varying vec2 vU; void main(){ vU = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform float k, t; varying vec2 vU; void main(){ float r = length(vU)/0.6; float a = atan(vU.y, vU.x);
        float sw = sin(a*2. + r*9. - t*6.)*.5+.5; float red = smoothstep(.15, 1., k) ; float streak = smoothstep(.55, .9, sw) * (1.-r*.4);
        vec3 white = vec3(.97,.97,.96), pink = vec3(.97,.58,.74), redc = vec3(.78,.06,.12);
        vec3 c = mix(white, pink, smoothstep(.0, 1., k*1.15 - .15)); c = mix(c, redc, streak * clamp(k*2.2,0.,1.) * (1.-smoothstep(.75,1.,k)));
        c *= 1. - .12*smoothstep(.75, 1., r); gl_FragColor = linearToOutputTexel(vec4(c,1.)); }` });
    const surf = add(new THREE.CircleGeometry(0.59, 48), paintMat, 0, 0.8, 0, g, { cast: false }); surf.rotation.x = -Math.PI / 2; surf.userData.flat = true;
    // a few rollers and trays around
    add(tbox(0.7, 0.06, 0.5), C('#9aa3ad'), 1.3, 0.03, 0.3, g); add(tbox(0.6, 0.02, 0.4), C('#f7a8c8'), 1.3, 0.065, 0.3, g);
    S.bucket = { group: g, update: (W, f) => { const b = W.bucket || {}; U.k.value = b.mix ?? 0; U.t.value = b.swirl ?? 0; } };
  }

  // =================== CELL BLOCK (montage) ===================
  {
    const g = grp(); const cells = [];
    const fl = add(new THREE.PlaneGeometry(40, 10), TM(T.concrete, '#b5b7bd'), 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(40, 4, 0.2, 3), TM(T.cinder, '#a3a6ad'), 0, 2, 4, g);
    for (let i = 0; i < 6; i++) {
      const x0 = -12 + i * 4.4, cg = new THREE.Group(); cg.position.set(x0, 0, 0); g.add(cg);
      add(tbox(4.4, 4, 0.2, 3), TM(T.cinder), 0, 2, -3, cg); add(tbox(0.2, 4, 3, 3), TM(T.cinder), -2.2, 2, -1.5, cg);
      const pm = toon({ map: PINKS[0] }); const pg = new THREE.Group(); pg.position.set(-2.1, 2, -2.88); cg.add(pg); const pl = add(new THREE.PlaneGeometry(4.2, 4), pm, 2.1, 0, 0, pg, { cast: false }); pl.userData.flat = true;
      for (let k = 0; k < 18; k++) add(cyl(0.03, 0.03, 4, 6), C('#5c5f68'), -2.1 + k * 0.245, 2, 0, cg);
      add(box(4.4, 0.08, 0.08), C('#5c5f68'), 0, 3.95, 0, cg); add(box(4.4, 0.08, 0.08), C('#5c5f68'), 0, 0.1, 0, cg);
      add(tbox(0.9, 0.5, 1.9), C('#7f8794'), 1.4, 0.25, -2, cg); add(tbox(0.85, 0.12, 1.8), C('#d7d3c8'), 1.4, 0.56, -2, cg);
      cells.push(pg);
    }
    S.block = { group: g, update: (W) => { const ps = (W.block || {}).paints || []; cells.forEach((pg, i) => { const p = ps[i] ?? 0; pg.scale.x = Math.max(0.0001, p); pg.visible = p > 0.001; }); } };
  }

  // =================== LOCKER ROOM (pink) ===================
  {
    const g = grp();
    const fl = add(new THREE.PlaneGeometry(14, 10), TM(T.tiles, '#ffe0ec'), 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    add(tbox(14, 4, 0.2), C(PINK_WALL), 0, 2, -3.2, g); for (const s of [-1, 1]) add(tbox(0.2, 4, 8), C('#f39cc0'), s * 6, 2, 0.5, g);
    const lockM = C('#f58fb8'), ventM = C('#c2557f');
    for (let i = 0; i < 10; i++) { const x = -5.0 + i * 1.1; add(tbox(1.04, 2.6, 0.6), lockM, x, 1.3, -2.8, g); for (let k = 0; k < 4; k++) add(box(0.6, 0.04, 0.02), ventM, x, 2.3 - k * 0.1, -2.49, g); add(box(0.05, 0.25, 0.04), C('#d9dde0'), x + 0.38, 1.4, -2.48, g); }
    add(tbox(8, 0.12, 0.6), C('#e3b07a'), 0, 0.5, -0.8, g); for (const x of [-3.5, 0, 3.5]) add(box(0.1, 0.5, 0.4), C('#9aa3ad'), x, 0.25, -0.8, g);
    S.locker = { group: g };
  }

  // =================== LAB (bright) ===================
  {
    const g = grp();
    const fl = add(new THREE.PlaneGeometry(16, 12), TM(T.tiles, '#ffffff'), 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const wallM = C('#eef4f8');
    // back wall with 3 big windows (openings) at z=-4
    const wy0 = 1.1, wy1 = 3.3;
    add(tbox(16, wy0, 0.2), wallM, 0, wy0 / 2, -4, g); add(tbox(16, 4.4 - wy1, 0.2), wallM, 0, (wy1 + 4.4) / 2, -4, g);
    for (const x of [-7, -3.5, 0, 3.5, 7]) add(tbox(x === -7 || x === 7 ? 2 : 1.1, wy1 - wy0, 0.2), wallM, x, (wy0 + wy1) / 2, -4, g);
    for (const x of [-5.25, -1.75, 1.75, 5.25]) { add(box(2.4, 0.08, 0.1), C('#ffffff'), x, (wy0 + wy1) / 2, -3.95, g); add(box(0.08, wy1 - wy0, 0.1), C('#ffffff'), x, (wy0 + wy1) / 2, -3.95, g); }
    const skyP = plane(40, 16, basic('#ffffff', { map: T.sky }), 0, 4, -14, g); skyP.userData.flat = true;
    for (let i = 0; i < 9; i++) { const t = add(sph(1.2 + (i % 3) * 0.4), C(i % 2 ? '#7cc25a' : '#5cae4a'), -14 + i * 3.6, 1.2 + (i % 2) * 0.6, -10 - (i % 3), g, { cast: false }); t.scale.y = 0.85; }
    const gr = add(new THREE.PlaneGeometry(40, 10), C('#8fcf6a'), 0, -0.01, -9, g, { cast: false }); gr.rotation.x = -Math.PI / 2;
    for (const s of [-1, 1]) add(tbox(0.2, 4.4, 12), wallM, s * 8, 2.2, 1.5, g);
    // counters along the back with colourful flasks
    const cnt = C('#ffffff'), top = C('#b9c4cf');
    add(tbox(14, 0.9, 0.8), cnt, 0, 0.45, -3.4, g); add(tbox(14.2, 0.06, 0.86), top, 0, 0.93, -3.4, g);
    for (let i = 0; i < 13; i++) add(box(0.9, 0.7, 0.02), C('#e3eaf0'), -6.2 + i * 1.04, 0.45, -2.99, g);
    const fcol = ['#ff6b8b', '#4fc3f7', '#ffd54f', '#81c784', '#ba68c8', '#ff8a65'];
    const r = P.rng(21);
    for (let i = 0; i < 18; i++) { const x = -6.6 + i * 0.78 + r() * 0.2, c = fcol[i % 6]; const kind = i % 3;
      if (kind === 0) { add(cyl(0.09, 0.09, 0.4, 12), toon({ color: c, transparent: true, opacity: 0.85 }), x, 1.16, -3.45, g); add(cyl(0.05, 0.05, 0.12, 8), C('#ffffff'), x, 1.42, -3.45, g); }
      else if (kind === 1) { add(new THREE.ConeGeometry(0.18, 0.32, 16), toon({ color: c }), x, 1.12, -3.45, g); add(cyl(0.045, 0.045, 0.18, 8), C('#ffffff'), x, 1.36, -3.45, g); }
      else { add(sph(0.15, 14, 10), toon({ color: c }), x, 1.11, -3.45, g); add(cyl(0.04, 0.04, 0.22, 8), C('#ffffff'), x, 1.33, -3.45, g); } }
    // wall shelf with jars (high)
    for (const x of [-7.5]) {}
    // lab tables (centre), chairs
    const tables = new THREE.Group(); g.add(tables);
    for (const x of [-2.4, 2.4]) { add(tbox(2.6, 0.08, 1.2), C('#ffffff'), x, 0.92, 0, tables); add(tbox(2.5, 0.84, 1.1), C('#dfe7ee'), x, 0.44, 0, tables); }
    const chairs = [0, 1].map(() => { const chair = new THREE.Group(); g.add(chair);
    add(tbox(0.7, 0.1, 0.7), C('#36c2c9'), 0, 0.5, 0, chair); add(tbox(0.7, 0.8, 0.1), C('#36c2c9'), 0, 0.95, -0.32, chair); add(cyl(0.05, 0.05, 0.45, 8), C('#9aa3ad'), 0, 0.25, 0, chair); add(cyl(0.3, 0.3, 0.05, 16), C('#9aa3ad'), 0, 0.03, 0, chair); return chair; });
    // machine with a dial for the electrode (no numbers)
    const mach = new THREE.Group(); g.add(mach); add(tbox(0.7, 0.55, 0.5), C('#f4f6f8'), 0, 0.28, 0, mach); add(new THREE.CircleGeometry(0.16, 24), C('#ffffff'), 0, 0.36, 0.26, mach); add(box(0.02, 0.12, 0.02), C('#d23c3c'), 0.03, 0.4, 0.27, mach).rotation.z = -0.6; for (let i = 0; i < 3; i++) add(sph(0.035, 8, 6), C(['#43a047', '#fbc02d', '#e53935'][i]), -0.2 + i * 0.1, 0.12, 0.26, mach);
    // pink test panel on an easel (chapter 1 lab)
    const easel = new THREE.Group(); g.add(easel); const panelMat = toon({ map: PINKS[0] });
    add(tbox(2.4, 1.7, 0.08), panelMat, 0, 1.75, 0, easel); for (const s of [-1, 1]) add(box(0.08, 2.7, 0.08), C('#8a6a48'), s * 1.0, 1.35, -0.12, easel).rotation.z = s * 0.06;
    S.lab = { group: g, update: (W) => { const l = W.lab || {};
      tables.visible = l.tables !== false; const cs = l.chairs || []; chairs.forEach((c, i) => { c.visible = !!cs[i]; if (cs[i]) c.position.set(...cs[i]); }); mach.visible = !!l.mach; if (l.mach) mach.position.set(...l.mach);
      easel.visible = !!l.panel; easel.position.set(...(l.panelAt || [0, 0, -1.2])); const ci = l.crack ?? 0; panelMat.map = PINKS[Math.min(3, Math.floor(ci * 3.99))]; panelMat.color.copy(lerpC('#ffffff', '#b8b8c0', Math.max(0, ci - 0.75) * 4)); } };
  }

  // =================== HOSPITAL: two identical rooms + garden + brick wall ===================
  {
    const g = grp(); const rooms = [];
    const lawn = add(new THREE.PlaneGeometry(80, 60), TM(T.grass), -10, -0.02, -32, g, { cast: false }); lawn.rotation.x = -Math.PI / 2;
    const trees = [];
    const r = P.rng(33);
    const tree = (x, z, s = 1) => { const tg = new THREE.Group(); tg.position.set(x, 0, z); g.add(tg); add(cyl(0.18 * s, 0.26 * s, 3.2 * s, 8), C('#7a5434'), 0, 1.6 * s, 0, tg); for (let k = 0; k < 4; k++) { const b = add(sph(1.3 * s * (0.8 + r() * 0.4), 14, 10), C(k % 2 ? '#5cae4a' : '#78c25a'), (r() - 0.5) * 1.6 * s, 3.4 * s + r() * 1.2 * s, (r() - 0.5) * 1.4 * s, tg); b.scale.y = 0.85; } trees.push(tg); return tg; };
    // trees outside the LEFT room (x around -6), many, fly-through path goes along -z
    for (let i = 0; i < 26; i++) { const x = -6 + (r() - 0.5) * 18, z = -5 - r() * 34; if (Math.abs(x + 6) < 1.4 && z > -26) continue; tree(x, z, 0.8 + r() * 0.6); }
    // brick wall right behind the RIGHT room
    const bw = add(tbox(14, 12, 0.4, 4), TM(T.brick), 7, 6, -4.4, g); T.brick.repeat.set(1, 1);
    const build = (cx, mirror) => {
      const rg = new THREE.Group(); rg.position.set(cx, 0, 0); g.add(rg); const m = mirror ? -1 : 1;
      const wall = C('#f3e7cc'), trim = C('#d9c7a2');
      const fl = add(new THREE.PlaneGeometry(5.4, 5.6), TM(T.lino), 0, 0, 0.2, rg, { cast: false }); fl.rotation.x = -Math.PI / 2;
      // back wall with a big window opening (x from wx-1.1 to wx+1.1, y 1.0..2.8)
      const wx = 0.75 * m, W0 = wx - 1.1, W1 = wx + 1.1;
      add(tbox(W0 + 2.7, 3.8, 0.2), wall, (-2.7 + W0) / 2, 1.9, -2.5, rg); add(tbox(2.7 - W1, 3.8, 0.2), wall, (W1 + 2.7) / 2, 1.9, -2.5, rg);
      add(tbox(2.2, 1.0, 0.2), wall, wx, 0.5, -2.5, rg); add(tbox(2.2, 1.0, 0.2), wall, wx, 3.3, -2.5, rg);
      add(box(2.4, 0.1, 0.35), trim, wx, 1.0, -2.4, rg); for (const s of [-1, 1]) add(box(0.08, 1.8, 0.24), C('#ffffff'), wx + s * 1.1, 1.9, -2.45, rg); add(box(2.2, 0.08, 0.24), C('#ffffff'), wx, 2.8, -2.45, rg); add(box(0.05, 1.8, 0.05), C('#ffffff'), wx, 1.9, -2.48, rg);
      for (const s of [-1, 1]) add(tbox(0.2, 3.8, 5.4), wall, s * 2.7, 1.9, 0.2, rg);
      add(box(5.4, 0.12, 0.05), trim, 0, 0.06, -2.38, rg);
      // bed along the back wall's other side
      const bed = new THREE.Group(); bed.position.set(-1.3 * m, 0, -1.2); rg.add(bed); const met = C('#b8c2cc');
      for (const z of [-1.1, 1.1]) { add(cyl(0.035, 0.035, z < 0 ? 1.2 : 0.8, 8), met, -0.45, z < 0 ? 0.6 : 0.4, z, bed); add(cyl(0.035, 0.035, z < 0 ? 1.2 : 0.8, 8), met, 0.45, z < 0 ? 0.6 : 0.4, z, bed); add(cyl(0.03, 0.03, 0.9, 8), met, 0, z < 0 ? 1.15 : 0.75, z, bed).rotation.z = Math.PI / 2; }
      add(tbox(0.95, 0.1, 2.2), met, 0, 0.5, 0, bed); add(tbox(0.9, 0.18, 2.1), C('#ffffff'), 0, 0.64, 0, bed); add(tbox(0.6, 0.14, 0.35), C('#ffffff'), 0, 0.8, -0.8, bed);
      const blanket = add(tbox(0.98, 0.3, 1.3), C('#9cc7e6'), 0, 0.78, 0.45, bed);
      // IV stand + nightstand
      const iv = new THREE.Group(); iv.position.set(-2.1 * m, 0, -1.8); rg.add(iv); add(cyl(0.02, 0.02, 2.1, 6), met, 0, 1.05, 0, iv); add(cyl(0.22, 0.22, 0.04, 12), met, 0, 0.02, 0, iv); add(tbox(0.22, 0.32, 0.06), toon({ color: '#d6f0ff', transparent: true, opacity: 0.85 }), 0.1, 1.85, 0, iv); add(box(0.3, 0.02, 0.02), met, 0, 2.05, 0, iv);
      const ns = new THREE.Group(); ns.position.set(-0.35 * m, 0, -2.1); rg.add(ns); add(tbox(0.55, 0.7, 0.45), C('#e3d3b4'), 0, 0.35, 0, ns); add(box(0.4, 0.03, 0.02), C('#a88a62'), 0, 0.5, 0.23, ns);
      // pill cups (counted by W.hosp.pillsR / pillsL)
      const cups = []; for (let i = 0; i < 9; i++) { const c = add(cyl(0.05, 0.04, 0.09, 10), C(i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#ffd1e3' : '#d6ecff'), -0.18 + (i % 3) * 0.17, 0.75, -0.12 + Math.floor(i / 3) * 0.12, ns); c.visible = false; cups.push(c); }
      // curtains
      const cm = toon({ color: '#9fd1b8', side: THREE.DoubleSide }); const curt = [];
      for (const s of [-1, 1]) { const cg = new THREE.Group(); cg.position.set(wx + s * 1.25, 1.9, -2.32); rg.add(cg); const c = add(tbox(1.2, 2.1, 0.05), cm, -s * 0.6, 0, 0, cg); curt.push(cg); for (let k = 0; k < 4; k++) add(box(0.03, 2.05, 0.06), C('#86bca0'), -s * (0.15 + k * 0.3), 0, 0.01, cg); }
      add(cyl(0.025, 0.025, 2.9, 8), met, wx, 2.98, -2.3, rg).rotation.z = Math.PI / 2;
      // door on the outer side wall (left room only matters)
      const doorG = new THREE.Group(); doorG.position.set(-2.6 * m, 0, 1.4 - 0.5); rg.add(doorG); add(tbox(0.08, 2.3, 1.0), C('#c9a87a'), 0, 1.15, 0.5, doorG); add(sph(0.05, 8, 6), C('#e2c27a'), 0.07 * m, 1.1, 0.88, doorG);
      const light = plane(1.0, 2.3, basic('#fff3b8'), -2.79 * m, 1.15, 1.4, rg, Math.PI / 2 * m); light.userData.flat = true;
      // sun patch on the floor (left room) / cold tint (right room)
      const patch = plane(2.2, 1.6, new THREE.MeshBasicMaterial({ color: '#fff2b0', transparent: true, opacity: 0.35, depthWrite: false }), wx - 0.4 * m, 0.012, -1.2, rg, 0, -Math.PI / 2); patch.userData.ndSkip = true;
      rooms.push({ rg, curt, cups, doorG, patch, wall, blanket });
    };
    build(-6, false); build(6, true);
    // sky disc behind brick wall gap
    S.hosp = { group: g, update: (W, f) => { const h = W.hosp || {};
      rooms.forEach((R, i) => { const o = i === 0 ? (h.curtL ?? 1) : (h.curtR ?? 1); R.curt.forEach((cg, k) => { cg.scale.x = 1 - 0.7 * o; });
        const n = i === 0 ? (h.pillsL ?? 1) : (h.pillsR ?? 1); R.cups.forEach((c, k) => c.visible = k < n);
        R.doorG.rotation.y = i === 0 ? -(h.door ?? 0) * 1.4 : 0; R.patch.visible = i === 0 && (h.curtL ?? 1) > 0.4; R.patch.material.opacity = 0.3 * (h.curtL ?? 1);
        R.wall.color.set(i === 0 ? '#f6e8c8' : (h.cold ? '#d9d6cc' : '#f3e7cc')); });
      trees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.05 + i) * 0.02; });
    } };
  }

  // =================== ARCHIVE ===================
  {
    const g = grp();
    const fl = add(new THREE.PlaneGeometry(12, 10), TM(T.wood, '#c9a27a'), 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const wall = C('#6d7f6a');
    add(tbox(12, 4.6, 0.2), wall, 0, 2.3, -3.2, g); for (const s of [-1, 1]) add(tbox(0.2, 4.6, 8), wall, s * 5, 2.3, 0.6, g);
    const cab = C('#8a9a86'), drawer = C('#9fae9a'), handle = C('#d9c08a');
    const cabinet = (x, z, ry = 0) => { const cg = new THREE.Group(); cg.position.set(x, 0, z); cg.rotation.y = ry; g.add(cg); add(tbox(1.0, 4.3, 0.7), cab, 0, 2.15, 0, cg); for (let k = 0; k < 8; k++) { add(box(0.86, 0.44, 0.04), drawer, 0, 0.35 + k * 0.5, 0.36, cg); add(box(0.24, 0.05, 0.05), handle, 0, 0.45 + k * 0.5, 0.39, cg); add(box(0.14, 0.08, 0.02), C('#f4ecd8'), 0, 0.33 + k * 0.5, 0.385, cg); } };
    for (const x of [-4.4, -3.35, -2.3, 2.3, 3.35, 4.4]) cabinet(x, -2.75);
    for (const z of [-1.4, -0.35, 0.7]) { cabinet(-4.5, z, Math.PI / 2); cabinet(4.5, z, -Math.PI / 2); }
    // window in the middle of the back wall with a tree outside (tree is a card in story)
    add(new THREE.PlaneGeometry(2.6, 2.2), basic('#bfe3f7'), 0, 2.5, -3.08, g, { cast: false }).userData.flat = true;
    for (const [w, h, x, y] of [[2.8, 0.12, 0, 3.62], [2.8, 0.12, 0, 1.38], [0.12, 2.3, -1.34, 2.5], [0.12, 2.3, 1.34, 2.5], [0.06, 2.2, 0, 2.5], [2.6, 0.06, 0, 2.5]]) add(box(w, h, 0.1), C('#efe6d0'), x, y, -3.02, g);
    // desk + lamp
    const desk = new THREE.Group(); desk.position.set(0, 0, -0.4); g.add(desk);
    add(tbox(2.4, 0.1, 1.1), C('#7a4a2a'), 0, 0.92, 0, desk); add(tbox(2.3, 0.85, 1.0), C('#6a3e22'), 0, 0.43, 0, desk);
    add(cyl(0.12, 0.14, 0.05, 16), C('#c9a24a'), 0.8, 1.0, -0.25, desk); add(cyl(0.02, 0.02, 0.35, 8), C('#c9a24a'), 0.8, 1.18, -0.25, desk);
    const shade = add(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 20, 1, false, 0, Math.PI), toon({ color: '#1f8a4c', side: THREE.DoubleSide }), 0.8, 1.38, -0.25, desk); shade.rotation.set(0, 0, Math.PI / 2); shade.rotation.order = 'ZYX';
    add(sph(0.06, 10, 8), basic('#fff6c0'), 0.8, 1.32, -0.25, desk);
    // stacks of folders on the desk
    for (let i = 0; i < 4; i++) add(tbox(0.42, 0.05, 0.32), C(i % 2 ? '#e8c26a' : '#d9b058'), -0.8, 1.0 + i * 0.05, -0.2 + (i % 2) * 0.02, desk);
    S.archive = { group: g };
  }

  // =================== MODERN HOSPITAL with courtyard ===================
  {
    const g = grp();
    const pav = add(new THREE.PlaneGeometry(80, 80), TM(T.paving), 0, -0.01, 0, g, { cast: false }); pav.rotation.x = -Math.PI / 2;
    const lawn = add(new THREE.PlaneGeometry(14, 10), TM(T.grass), 0, 0.01, 0, g, { cast: false }); lawn.rotation.x = -Math.PI / 2;
    const glass = TM(T.glass); T.glass.repeat.set(1, 1);
    const blk = (w, h, d, x, z) => { const m = add(box(w, h, d), glass, x, h / 2, z, g); const uv = m.geometry.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / 8, uv.getY(i) * dims[f][1] / 8); } add(box(w + 0.3, 0.3, d + 0.3), C('#f4f6f8'), x, h + 0.15, z, g); return m; };
    blk(30, 12, 6, 0, -12); blk(6, 12, 22, -14, 0); blk(6, 12, 22, 14, 0);
    // fountain
    add(cyl(2.2, 2.4, 0.6, 32), C('#e9e3d8'), 0, 0.3, 0, g); add(new THREE.CircleGeometry(2.0, 32), toon({ color: '#6ec6f0' }), 0, 0.58, 0, g).rotation.x = -Math.PI / 2; add(cyl(0.3, 0.4, 1.4, 16), C('#e9e3d8'), 0, 0.9, 0, g); add(cyl(0.9, 0.7, 0.2, 24), C('#e9e3d8'), 0, 1.6, 0, g);
    // benches + trees + planters
    for (const [x, z, ry] of [[-4.5, 2.5, 0.3], [4.5, 2.5, -0.3], [-5, -2.5, Math.PI - 0.2], [5, -2.5, Math.PI + 0.2]]) { const bg = new THREE.Group(); bg.position.set(x, 0, z); bg.rotation.y = ry; g.add(bg); add(tbox(2, 0.1, 0.5), C('#c98a4a'), 0, 0.48, 0, bg); add(tbox(2, 0.5, 0.08), C('#c98a4a'), 0, 0.8, -0.24, bg); for (const s of [-1, 1]) add(box(0.08, 0.48, 0.45), C('#4a4d55'), s * 0.85, 0.24, 0, bg); }
    const r = P.rng(8);
    for (const [x, z] of [[-6, 0], [6, 0], [-3, -4], [3, -4], [-8, 4], [8, 4]]) { add(cyl(0.15, 0.22, 2.4, 8), C('#7a5434'), x, 1.2, z, g); for (let k = 0; k < 3; k++) add(sph(1.1 + r() * 0.4, 14, 10), C(k % 2 ? '#5cae4a' : '#78c25a'), x + (r() - 0.5), 2.8 + r() * 0.8, z + (r() - 0.5), g); }
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; add(sph(0.35, 10, 8), C(['#ff8aa5', '#ffd24a', '#ffffff', '#ba68c8'][i % 4]), Math.cos(a) * 2.9, 0.25, Math.sin(a) * 2.9, g); }
    S.modern = { group: g };
  }

  // =================== WINE TASTING ROOM ===================
  {
    const g = grp();
    const fl = add(new THREE.PlaneGeometry(16, 12), TM(T.wood, '#8a5a3a'), 0, 0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    T.panel.repeat.set(4, 1);
    add(tbox(16, 4.6, 0.2, 4), TM(T.panel), 0, 2.3, -4, g); for (const s of [-1, 1]) add(tbox(0.2, 4.6, 12, 4), TM(T.panel), s * 8, 2.3, 1, g);
    add(box(16, 0.2, 0.3), C('#5a321c'), 0, 4.5, -3.85, g);
    // barrels: ends facing the camera, two rows
    const oak = C('#8a5a34'), band = C('#4a4d55'), end = C('#a8743f');
    const barrel = (x, y, z) => { const bg = new THREE.Group(); bg.position.set(x, y, z); g.add(bg); const b = add(new THREE.CylinderGeometry(0.5, 0.5, 1.0, 24), oak, 0, 0, 0, bg); b.rotation.x = Math.PI / 2; b.scale.set(1, 1, 1); const mid = add(new THREE.CylinderGeometry(0.56, 0.56, 0.6, 24), oak, 0, 0, 0, bg); mid.rotation.x = Math.PI / 2; for (const zz of [-0.4, -0.15, 0.15, 0.4]) { const t = add(new THREE.TorusGeometry(Math.abs(zz) > 0.3 ? 0.505 : 0.565, 0.025, 6, 32), band, 0, 0, zz, bg); } const e = add(new THREE.CircleGeometry(0.47, 24), end, 0, 0, 0.505, bg); for (let k = 1; k < 3; k++) { const rr = add(new THREE.RingGeometry(0.15 * k, 0.15 * k + 0.015, 24), C('#8a5a30'), 0, 0, 0.51, bg); } add(cyl(0.05, 0.05, 0.08, 10), C('#6a4426'), 0, -0.25, 0.53, bg).rotation.x = Math.PI / 2; };
    for (let i = 0; i < 12; i++) barrel(-6.6 + i * 1.2, 0.56, -3.35);
    for (let i = 0; i < 11; i++) barrel(-6.0 + i * 1.2, 1.6, -3.35);
    add(tbox(15, 0.12, 0.9), C('#5a321c'), 0, 0.03, -3.35, g);
    // long table with a white cloth
    const tbl = new THREE.Group(); g.add(tbl); add(tbox(6.4, 0.08, 1.3), C('#f7f4ee'), 0, 0.96, 0, tbl); add(tbox(6.4, 0.6, 1.32), C('#f2efe8'), 0, 0.66, 0.0, tbl); for (const s of [-1, 1]) for (const z of [-0.5, 0.5]) add(cyl(0.05, 0.05, 0.4, 8), C('#5a321c'), s * 3, 0.2, z, tbl);
    // candles
    const flames = [];
    for (const x of [-1.8, -0.6, 0.6, 1.8]) { add(cyl(0.05, 0.05, 0.3, 10), C('#fff3d6'), x, 1.15, -0.4, tbl); add(cyl(0.12, 0.14, 0.04, 12), C('#c9a24a'), x, 1.02, -0.4, tbl); const fm = add(new THREE.ConeGeometry(0.035, 0.12, 8), basic('#ffcf5a'), x, 1.37, -0.4, tbl, { cast: false }); fm.userData.ndSkip = true; flames.push(fm); }
    for (const [x, z] of [[-7.2, -3.2], [7.2, -3.2]]) { add(cyl(0.08, 0.1, 1.6, 10), C('#5a321c'), x, 0.8, z, g); add(cyl(0.06, 0.06, 0.4, 10), C('#fff3d6'), x, 1.8, z, g); const fm = add(new THREE.ConeGeometry(0.05, 0.16, 8), basic('#ffcf5a'), x, 2.1, z, g, { cast: false }); fm.userData.ndSkip = true; flames.push(fm); }
    // folding screen (paravan)
    const scr = new THREE.Group(); g.add(scr); scr.position.set(4.6, 0, -1.4);
    for (let i = 0; i < 3; i++) { const pg = new THREE.Group(); pg.position.set(-0.75 + i * 0.75, 0, Math.abs(i - 1) * 0.25); pg.rotation.y = (i - 1) * 0.45; scr.add(pg); add(tbox(0.72, 2.2, 0.05), C('#c9b07a'), 0, 1.25, 0, pg); add(tbox(0.6, 1.9, 0.06), C('#e6d3a3'), 0, 1.3, 0, pg); for (const s of [-1, 1]) add(box(0.04, 0.2, 0.04), C('#5a321c'), s * 0.3, 0.1, 0, pg); }
    // side table for the assistant
    const side = new THREE.Group(); g.add(side); side.position.set(4.6, 0, -2.6); add(tbox(1.4, 0.06, 0.7), C('#7a4a2a'), 0, 0.9, 0, side); for (const s of [-1, 1]) add(box(0.06, 0.88, 0.6), C('#5a321c'), s * 0.62, 0.44, 0, side);
    S.wine = { group: g, update: (W, f) => { const w = W.wine || {}; flames.forEach((m, i) => { m.scale.set(1, 1 + 0.15 * Math.sin(f * 0.5 + i * 1.7), 1); }); scr.visible = w.screen !== false; side.visible = w.screen !== false; tbl.position.set(0, -0.22, w.tableZ ?? 0); } };
  }

  // =================== LOBBY + ELEVATOR CABIN ===================
  {
    const g = grp();
    const fl = add(new THREE.PlaneGeometry(20, 14), TM(T.marble), 0, 0, 6, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
    const mw = TM(ctex(512, 512, (gg, w, h, r) => { gg.fillStyle = '#e4dccd'; gg.fillRect(0, 0, w, h); for (let k = 0; k < 18; k++) { gg.strokeStyle = 'rgba(150,135,115,.3)'; gg.lineWidth = 2; gg.beginPath(); let x = r() * w, y = 0; gg.moveTo(x, y); while (y < h) { x += r() * 40 - 20; y += 30 + r() * 30; gg.lineTo(x, y); } gg.stroke(); } gg.strokeStyle = '#c9bfae'; gg.lineWidth = 4; gg.strokeRect(0, 0, w, h); }));
    mw.map.repeat.set(4, 2);
    // front wall (z=0) with the door opening x in [-0.75,0.75], y in [0, 2.4]
    add(tbox(9.25, 4.4, 0.3), mw, -5.375, 2.2, 0, g); add(tbox(9.25, 4.4, 0.3), mw, 5.375, 2.2, 0, g); add(tbox(1.5, 2.0, 0.3), mw, 0, 3.4, 0, g);
    const steel = TM(T.steel); T.steel.repeat.set(1, 1);
    for (const s of [-1, 1]) add(tbox(0.18, 2.5, 0.38), steel, s * 0.84, 1.25, 0.02, g); add(tbox(1.86, 0.18, 0.38), steel, 0, 2.5, 0.02, g);
    // floor indicator: lit dots above the door
    const dots = []; for (let i = 0; i < 5; i++) { const d = add(sph(0.05, 10, 8), basic('#5a5e66'), -0.4 + i * 0.2, 2.78, 0.2, g, { cast: false }); d.userData.ndSkip = true; dots.push(d); }
    add(tbox(1.2, 0.22, 0.06), C('#2b2b33'), 0, 2.78, 0.16, g);
    // sliding doors
    const doorL = add(tbox(0.76, 2.4, 0.06), steel, -0.38, 1.2, 0.0, g), doorR = add(tbox(0.76, 2.4, 0.06), steel, 0.38, 1.2, 0.0, g);
    // call panel next to door (outside)
    add(tbox(0.18, 0.4, 0.04), steel, 1.25, 1.2, 0.17, g); add(sph(0.045, 10, 8), C('#ffd24a'), 1.25, 1.27, 0.2, g); add(sph(0.045, 10, 8), C('#f4f6f8'), 1.25, 1.13, 0.2, g);
    // plants + bench in the lobby
    for (const x of [-3.2, 3.2]) { add(cyl(0.35, 0.28, 0.7, 16), C('#2f3a4a'), x, 0.35, 1.0, g); for (let k = 0; k < 5; k++) { const l = add(new THREE.ConeGeometry(0.18, 1.3, 6), C('#3f8a3a'), x + Math.cos(k * 1.3) * 0.15, 1.2, 1.0 + Math.sin(k * 1.3) * 0.15, g); l.rotation.set(Math.sin(k) * 0.4, 0, Math.cos(k * 1.3) * 0.4); } }
    add(tbox(2.2, 0.12, 0.6), C('#7a4a2a'), -5.5, 0.5, 2.5, g);
    add(box(20, 0.2, 14), C('#efe8dc'), 0, 4.5, 6, g, { cast: false }); add(tbox(20, 4.6, 0.3), mw, 0, 2.3, 12.5, g); for (const sx of [-1, 1]) add(tbox(0.3, 4.6, 13), mw, sx * 9.8, 2.3, 6, g);
    for (let i = 0; i < 3; i++) add(box(1.4, 0.06, 0.6), basic('#fffbe8'), -3 + i * 3, 4.38, 3.5, g, { cast: false }).userData.ndSkip = true;
    // cabin behind the doors: z in [-2.2, 0], x in [-1.1, 1.1]
    const cab = new THREE.Group(); g.add(cab);
    const cf = add(new THREE.PlaneGeometry(2.2, 2.2), C('#4a4d55'), 0, 0.005, -1.1, cab, { cast: false }); cf.rotation.x = -Math.PI / 2;
    for (const s of [-1, 1]) add(tbox(0.08, 2.7, 2.2), steel, s * 1.12, 1.35, -1.1, cab);
    const mirror = add(tbox(2.2, 2.7, 0.08), toon({ color: '#cfe0ea' }), 0, 1.35, -2.22, cab);
    add(box(2.0, 0.02, 0.01), C('#ffffff'), 0, 2.2, -2.17, cab).rotation.z = 0.3;
    for (const s of [-1, 1]) add(cyl(0.025, 0.025, 1.9, 8), C('#e3e7eb'), s * 1.02, 0.95, -1.1, cab).rotation.x = Math.PI / 2;
    add(cyl(0.025, 0.025, 2.0, 8), C('#e3e7eb'), 0, 0.95, -2.12, cab).rotation.z = Math.PI / 2;
    add(tbox(2.3, 0.08, 2.3), C('#f4f6f8'), 0, 2.72, -1.1, cab); add(box(1.2, 0.02, 0.6), basic('#fffbe8'), 0, 2.67, -1.1, cab, { cast: false }).userData.ndSkip = true;
    S.lobby = { group: g, update: (W, f) => { const l = W.lobby || {}; const o = l.doors ?? 1; doorL.position.x = -0.38 - o * 0.74; doorR.position.x = 0.38 + o * 0.74; const lit = l.floor ?? 0; dots.forEach((d, i) => d.material.color.set(i === Math.round(lit) % 5 ? '#ffd24a' : '#5a5e66')); } };
  }

  // =================== BLUEPRINT ===================
  {
    const g = grp(); const bp = plane(40, 24, basic('#ffffff', { map: T.grid }), 0, 0, -6, g); bp.userData.flat = true; T.grid.repeat.set(3, 2);
    S.blueprint = { group: g };
  }

  // =================== NYC-LIKE INTERSECTION + city grid ===================
  {
    const g = grp();
    const road = add(new THREE.PlaneGeometry(400, 400), TM(T.asphalt), 0, 0, 0, g, { cast: false }); road.rotation.x = -Math.PI / 2;
    // city blocks: 9 m blocks, 6 m streets (block pitch 15)
    const pitch = 15, half = 4.5, side = C('#c4c0b8');
    const bmats = [TM(T.windows, '#ffffff'), TM(T.windows, '#e9c9a8'), TM(T.windows, '#c9d2e0'), TM(T.windows, '#f0dcc0')];
    T.windows.repeat.set(2, 3);
    const r = P.rng(77); const corners = [];
    for (let i = -6; i <= 6; i++) for (let j = -8; j <= 2; j++) {
      const cx = i * pitch + pitch / 2, cz = j * pitch + pitch / 2;
      add(box(9.4, 0.18, 9.4), side, cx, 0.09, cz, g, { cast: false });
      const near = Math.abs(i) <= 1 && j >= -1;
      const h = near ? 14 + r() * 16 : 10 + r() * 30;
      const b = add(box(7.4, h, 7.4), bmats[(i * 7 + j * 3 + 20) % 4], cx, h / 2 + 0.18, cz, g, { cast: Math.abs(i) <= 2 && j >= -2 });
      const uv = b.geometry.attributes.uv; for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const ii = f * 4 + k; uv.setXY(ii, uv.getX(ii) * 2, uv.getY(ii) * h / 6); }
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) corners.push([cx + sx * (half - 0.25), cz + sz * (half - 0.25), sz]);
    }
    const inst = (geo, mat, n) => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = false; m.receiveShadow = true; g.add(m); return m; };
    const poles = inst(cyl(0.06, 0.06, 2.4, 8), C('#5f6670'), corners.length), btns = inst(box(0.22, 0.3, 0.16), C('#f2c14e'), corners.length);
    const pinMat = basic('#ffd24a'); const pins = inst(sph(1, 10, 8), pinMat, corners.length); pins.userData.ndSkip = true; poles.userData.ndSkip = true; btns.userData.ndSkip = true;
    const M4 = new THREE.Matrix4();
    corners.forEach(([x, z, sz], i) => { M4.makeTranslation(x, 1.38, z); poles.setMatrixAt(i, M4); M4.makeTranslation(x, 1.25, z + 0.1 * sz); btns.setMatrixAt(i, M4); });
    let pinK = -1;
    // crosswalk stripes around the main intersection at (0,0)
    const wm = C('#f4f4f0');
    for (let k = -4; k <= 4; k++) { for (const s of [-1, 1]) { add(box(0.5, 0.02, 2.4), wm, k * 0.7, 0.01, s * 6.0, g, { cast: false }); add(box(2.4, 0.02, 0.5), wm, s * 6.0, 0.01, k * 0.7, g, { cast: false }); } }
    // yellow taxis (no text, no numbers)
    const taxis = [];
    const taxi = () => { const tg = new THREE.Group(); g.add(tg); add(tbox(1.9, 0.6, 4.2), C('#f6c12a'), 0, 0.55, 0, tg); add(tbox(1.7, 0.55, 2.2), C('#f6c12a'), 0, 1.1, -0.2, tg); add(tbox(1.72, 0.45, 2.0), C('#2f4560'), 0, 1.12, -0.2, tg); add(tbox(0.5, 0.18, 0.3), C('#fff3c4'), 0, 1.45, -0.2, tg); for (const [x, z] of [[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]]) { const w = add(cyl(0.34, 0.34, 0.25, 14), C('#22252b'), x, 0.34, z, tg); w.rotation.z = Math.PI / 2; } add(box(1.6, 0.12, 0.05), C('#ffffff'), 0, 0.6, 2.11, tg); add(tbox(1.92, 0.08, 4.22), C('#2b2b33'), 0, 0.72, 0, tg); taxis.push(tg); return tg; };
    for (let i = 0; i < 6; i++) taxi();
    // manhole
    add(cyl(0.5, 0.5, 0.03, 20), C('#3a3d44'), -2.2, 0.01, 2.2, g, { cast: false });
    S.nyc = { group: g, update: (W, f) => { const t = f / 30; const pk = (W.nyc || {}).pins ?? 0; pins.visible = pk > 0.01; if (pk !== pinK) { pinK = pk; corners.forEach(([x, z], i) => { const s_ = 2.2 * pk * (0.8 + 0.4 * ((i * 37) % 10) / 10); M4.makeScale(s_, s_, s_); M4.setPosition(x, 3 + 4 * pk, z); pins.setMatrixAt(i, M4); }); pins.instanceMatrix.needsUpdate = true; }
      const lanes = [[-1.6, 1, 0], [1.6, -1, 3.5], [-1.6, 1, 11], [1.6, -1, 15]];
      taxis.forEach((tg, i) => { if (i < 4) { const [x, d, o] = lanes[i]; const z = ((t * 6 + o * 3) % 60) - 30; tg.position.set(x, 0, d * z); tg.rotation.y = d > 0 ? 0 : Math.PI; } else { const z = ((t * 5 + i * 9) % 60) - 30; tg.position.set((i % 2 ? 1 : -1) * z, 0, i % 2 ? -1.6 : 1.6); tg.rotation.y = i % 2 ? -Math.PI / 2 : Math.PI / 2; } }); } };
  }

  return S;
}
