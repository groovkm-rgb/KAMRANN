// common.js: shared helpers, phone + dynamic screens, skyline, crowd instancing for "Die Milliarde".
// All visible writing is German. No real brands or logos.
export const K = {}; // filled by init(ctx)
const mcache = new Map();
export function init(ctx) {
  Object.assign(K, ctx);
  const { THREE, toon } = ctx;
  K.C = (color, extra = {}) => { const key = color + JSON.stringify(extra); if (!mcache.has(key)) mcache.set(key, toon({ color, ...(extra.transparent ? { depthWrite: false } : {}), ...extra })); return mcache.get(key); };
  K.E = (color, inten = 1.2) => K.C(color, { emissive: color, emissiveIntensity: inten });
  K.B = (color) => { const key = 'basic' + color; if (!mcache.has(key)) mcache.set(key, new THREE.MeshBasicMaterial({ color })); return mcache.get(key); };
}
export const rngf = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
/** box at x,y(bottom),z  */
export const bx = (w, h, d, mat, x, y, z, parent, o = {}) => { const m = K.add(K.tbox(w, h, d, o.t || 1.2), typeof mat === 'string' ? K.C(mat) : mat, x, y + h / 2, z, parent, { cast: o.cast ?? true }); if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz; if (o.rx) m.rotation.x = o.rx; return m; };
export const cyl = (rt, rb, h, mat, x, y, z, parent, o = {}) => { const m = K.add(new K.THREE.CylinderGeometry(rt, rb, h, o.seg || 16, 1, o.open || false), typeof mat === 'string' ? K.C(mat) : mat, x, y + h / 2, z, parent, { cast: o.cast ?? true }); if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; return m; };
export const sph = (r, mat, x, y, z, parent, o = {}) => { const m = K.add(new K.THREE.SphereGeometry(r, o.seg || 16, o.seg2 || 12), typeof mat === 'string' ? K.C(mat) : mat, x, y, z, parent, { cast: o.cast ?? true }); if (o.sc) m.scale.set(...o.sc); return m; };
export const grp = (parent, x = 0, y = 0, z = 0, ry = 0) => { const g = new K.THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
/** flat plane facing +z (rotate via o.ry / o.rx) */
export const pl = (w, h, mat, x, y, z, parent, o = {}) => { const m = K.add(new K.THREE.PlaneGeometry(w, h), typeof mat === 'string' ? K.C(mat) : mat, x, y, z, parent, { cast: o.cast ?? false }); if (o.ry !== undefined) m.rotation.y = o.ry; if (o.rx !== undefined) m.rotation.x = o.rx; if (o.rz !== undefined) m.rotation.z = o.rz; if (o.nd === false) m.userData.ndSkip = true; return m; };
export const floor = (w, d, mat, x, y, z, parent) => pl(w, d, mat, x, y, z, parent, { rx: -Math.PI / 2 });
/** unlit text/sign plane (German text) */
export const sign = (w, h, pxW, pxH, draw, x, y, z, parent, o = {}) => {
  const t = K.canvasTex(pxW, pxH, draw); const mat = new K.THREE.MeshBasicMaterial({ map: t, transparent: !!o.transparent, side: o.double ? K.THREE.DoubleSide : K.THREE.FrontSide, fog: o.fog ?? true });
  const m = pl(w, h, mat, x, y, z, parent, o); m.userData.ndSkip = o.nd === undefined ? true : !o.nd; if (o.tone) { m.material = K.toon({ map: t, transparent: !!o.transparent }); } return m;
};
export const font = (px, w = 'bold', fam = '"DejaVu Sans", sans-serif') => `${w} ${px}px ${fam}`;
export const txt = (g, s, x, y, px, col, o = {}) => { g.font = font(px, o.w || 'bold', o.fam); g.textAlign = o.al || 'center'; g.textBaseline = o.bl || 'middle'; if (o.stroke) { g.lineWidth = o.sw || px * 0.12; g.strokeStyle = o.stroke; g.lineJoin = 'round'; g.strokeText(s, x, y); } g.fillStyle = col; g.fillText(s, x, y); };
export const rr = (g, x, y, w, h, r, fill, stroke, lw = 4) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); } };
/** additive light shaft (open cone or quad) */
export const beam = (w, h, col, alpha, x, y, z, parent, o = {}) => {
  const t = K.canvasTex(64, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, `rgba(${col},${alpha})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, W, H); const gx = g.createLinearGradient(0, 0, W, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, W, H); });
  const mat = new K.THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: K.THREE.AdditiveBlending, side: K.THREE.DoubleSide, fog: false });
  const m = new K.THREE.Mesh(new K.THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.userData.ndSkip = true; m.renderOrder = 5;
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz; parent.add(m); return m;
};
/** soft radial glow sprite (additive) */
export const glow = (r, col, x, y, z, parent, a = 0.8) => {
  const t = K.canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.35, `rgba(${col},${a * 0.35})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  const s = new K.THREE.Sprite(new K.THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, blending: K.THREE.AdditiveBlending, fog: false }));
  s.scale.set(r * 2, r * 2, 1); s.position.set(x, y, z); s.userData.ndSkip = true; s.renderOrder = 6; parent.add(s); return s;
};
/** window texture for building facades */
export const facadeTex = (seed, base, lit = 0.3, cols = 6, rows = 10, night = false) => K.canvasTex(256, 512, (g, W, H) => {
  const r = rngf(seed); g.fillStyle = base; g.fillRect(0, 0, W, H);
  const cw = W / cols, ch = H / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const on = r() < lit; g.fillStyle = on ? (night ? '#ffd27a' : '#bfe0f4') : (night ? '#1c2440' : '#5a7090'); g.fillRect(i * cw + cw * 0.18, j * ch + ch * 0.2, cw * 0.64, ch * 0.6); }
});
/** instanced boxes (buildings / clutter) */
export const instBoxes = (list, mat, parent, cast = false) => {
  const { THREE } = K; const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, list.length); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  list.forEach(([x, y, z, w, h, d, ry = 0], i) => { e.set(0, ry, 0); q.setFromEuler(e); m4.compose(new THREE.Vector3(x, y + h / 2, z), q, new THREE.Vector3(w, h, d)); im.setMatrixAt(i, m4); });
  im.castShadow = cast; im.receiveShadow = true; im.frustumCulled = false; parent.add(im); return im;
};
/** a ring of city towers with facade textures */
export function skyline(parent, seed, { r0 = 60, r1 = 260, n = 90, night = false, minH = 20, maxH = 90, arc = [0, Math.PI * 2], center = [0, 0] } = {}) {
  const r = rngf(seed), G = grp(parent);
  const mats = [0, 1, 2, 3].map((k) => { const t = facadeTex(seed + k * 7, ['#8aa0b8', '#c8b8a0', '#a8b4c8', '#d0c4b4'][k], night ? 0.45 : 0.25, 6, 10, night); t.wrapS = t.wrapT = K.THREE.RepeatWrapping; return K.toon({ map: t }); });
  const lists = [[], [], [], []];
  for (let i = 0; i < n; i++) { const a = arc[0] + r() * (arc[1] - arc[0]), d = r0 + r() * (r1 - r0), h = minH + r() ** 1.6 * (maxH - minH), w = 10 + r() * 16; lists[i % 4].push([center[0] + Math.cos(a) * d, 0, center[1] + Math.sin(a) * d, w, h, w * (0.7 + r() * 0.6), r() * 3]); }
  lists.forEach((l, k) => instBoxes(l, mats[k], G));
  return G;
}

// ---------------- phone + screens ----------------
const SCR_W = 540, SCR_H = 1120;
const fmtBig = (digits) => { let s = ''; for (let i = 0; i < digits.length; i++) { const j = digits.length - i; s += digits[i]; if (j > 1 && (j - 1) % 3 === 0) s += '.'; } return s; };
/** draw a phone screen. st = {mode, ...} */
export function drawScreen(g, st, W = SCR_W, H = SCR_H) {
  const m = st.mode || 'off';
  g.clearRect(0, 0, W, H);
  if (m === 'off') { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#16161c'); gr.addColorStop(1, '#050508'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,0.06)'; g.beginPath(); g.moveTo(0, H * 0.2); g.lineTo(W, 0); g.lineTo(W, H * 0.12); g.lineTo(0, H * 0.34); g.fill(); return; }
  // status bar
  const bg = m === 'notify' || m === 'call' ? '#1a2a4a' : '#f4f6fa';
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const dark = bg !== '#f4f6fa';
  txt(g, st.clock || '06:00', 60, 40, 30, dark ? '#fff' : '#1a1a2a', { al: 'left' });
  for (let i = 0; i < 4; i++) g.fillRect(W - 120 + i * 12, 50 - i * 6, 8, 6 + i * 6);
  rr(g, W - 66, 30, 40, 20, 4, null, dark ? '#fff' : '#1a1a2a', 3); g.fillStyle = dark ? '#fff' : '#1a1a2a'; g.fillRect(W - 62, 34, 26, 12);
  if (m === 'bank') {
    // app header: generic bank, no brand
    const gr = g.createLinearGradient(0, 70, 0, 420); gr.addColorStop(0, '#1d3a8a'); gr.addColorStop(1, '#2a5ad0'); g.fillStyle = gr; g.fillRect(0, 70, W, 360);
    txt(g, 'Mein Konto', 40, 125, 34, '#ffffff', { al: 'left' });
    dCircle(g, W - 70, 125, 26, '#ffffff33');
    txt(g, 'Kontostand:', 40, 215, 32, '#c8d8ff', { al: 'left', w: 'normal' });
    // amount
    const amt = st.amount ?? '43,00 €';
    if (st.reel !== undefined) drawReels(g, st, 40, 300); else { const px = amt.length > 12 ? 42 : 76; txt(g, amt, 40, 300, px, st.gold ? '#ffe27a' : '#ffffff', { al: 'left' }); }
    if (st.gold) { const gl = g.createRadialGradient(W / 2, 300, 10, W / 2, 300, 300); gl.addColorStop(0, `rgba(255,220,120,${0.35 * st.gold})`); gl.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gl; g.fillRect(0, 70, W, 360); }
    txt(g, 'Girokonto · DE12 3456 7890 1234 5678 90', 40, 380, 20, '#c8d8ff', { al: 'left', w: 'normal' });
    // transactions
    txt(g, 'Umsätze', 40, 480, 30, '#1a1a2a', { al: 'left' });
    const tx = st.tx ? [['Gutschrift', '+1.000.000.000,00 €', 'Verwendungszweck: Yacht Nummer vier', true], ['Bäckerei', '-2,40 €'], ['Miete', '-450,00 €'], ['Supermarkt', '-12,85 €']] : [['Bäckerei', '-2,40 €'], ['Miete', '-450,00 €'], ['Supermarkt', '-12,85 €'], ['Handy', '-9,99 €']];
    let y = 530 - (st.scroll || 0) * 0;
    tx.forEach(([a, b, c, hi], i) => {
      const h = c ? 150 : 96; rr(g, 24, y, W - 48, h - 14, 18, hi ? (st.hiTx ? '#fff3c4' : '#ffffff') : '#ffffff', hi && st.hiTx ? '#e8b030' : '#e2e6ee', hi && st.hiTx ? 6 : 2);
      dCircle(g, 70, y + 42, 24, hi ? '#2ab070' : '#c8cede');
      txt(g, a, 110, y + 32, 26, '#1a1a2a', { al: 'left' }); txt(g, b, W - 44, y + (c ? 62 : 32), c ? 21 : 24, hi ? '#1a9a50' : '#c03040', { al: 'right' });
      if (c) txt(g, c, 40, y + 106, hi && st.hiTx ? 19 : 18, '#2a2a3a', { al: 'left', w: hi && st.hiTx ? 'bold' : 'normal' });
      y += h;
    });
  } else if (m === 'pay') {
    g.fillStyle = '#ffffff'; g.fillRect(0, 70, W, H);
    dCircle(g, W / 2, 440, 130 * (st.pop ?? 1), '#2ab070'); g.lineWidth = 26; g.strokeStyle = '#fff'; g.lineCap = 'round'; g.beginPath(); g.moveTo(W / 2 - 60, 440); g.lineTo(W / 2 - 15, 490); g.lineTo(W / 2 + 70, 385); g.stroke();
    txt(g, 'Zahlung erfolgreich', W / 2, 660, 40, '#1a1a2a');
    if (st.item) { txt(g, st.item, W / 2, 740, 30, '#5a5a6a', { w: 'normal' }); }
    if (st.price) txt(g, st.price, W / 2, 810, 46, '#1a1a2a');
  } else if (m === 'call') {
    txt(g, '+49 30 7781 4402', W / 2, 330, 44, '#ffffff'); txt(g, 'Mobil', W / 2, 390, 28, '#a8b8d8', { w: 'normal' });
    dCircle(g, W / 2, 560, 90, '#3a4a7a'); txt(g, '?', W / 2, 565, 90, '#ffffff');
    const p = st.pulse || 0; dCircle(g, 140, 900, 64 + 8 * p, '#e0383a'); dCircle(g, W - 140, 900, 64 + 8 * p, '#2ab070');
    txt(g, '✆', W - 140, 902, 60, '#fff'); txt(g, '✆', 140, 902, 60, '#fff');
  } else if (m === 'social') {
    g.fillStyle = '#ffffff'; g.fillRect(0, 70, W, H);
    dCircle(g, W / 2, 260, 100, '#f2c84a'); dCircle(g, W / 2, 250, 70, '#ffffff'); dCircle(g, W / 2 - 22, 240, 7, '#1a1416'); dCircle(g, W / 2 + 22, 240, 7, '#1a1416');
    g.fillStyle = '#8a5530'; g.beginPath(); g.ellipse(W / 2, 205, 72, 34, 0, Math.PI, 0); g.fill();
    // follower count
    const n = Math.floor(st.followers || 0).toLocaleString('de-DE');
    txt(g, n, W / 2, 440, 70, '#1a1a2a'); txt(g, '👤', W / 2, 520, 44, '#1a1a2a', { w: 'normal' });
    for (let i = 0; i < 9; i++) { const x = 40 + (i % 3) * 160, yy = 600 + Math.floor(i / 3) * 160; rr(g, x, yy, 140, 140, 10, ['#f6a0c0', '#a0d0f6', '#ffd27a', '#c0f0a0'][i % 4]); }
    const hearts = st.hearts || 0; for (let i = 0; i < 8; i++) { const ph = (hearts + i * 0.125) % 1; txt(g, '❤', W - 80 - 30 * Math.sin(i * 2 + ph * 6), H - 80 - ph * 600, 44, `rgba(232,48,74,${1 - ph})`, { w: 'normal' }); }
  } else if (m === 'chat') {
    g.fillStyle = '#e8eef4'; g.fillRect(0, 70, W, H); g.fillStyle = '#2a5ad0'; g.fillRect(0, 70, W, 90); txt(g, 'Kerem', W / 2, 115, 32, '#fff');
    (st.bubbles || []).forEach(([who, s], i) => { const y = 220 + i * 130, me = who === 'me'; rr(g, me ? W - 380 : 30, y, 350, 100, 24, me ? '#2a8af0' : '#ffffff'); txt(g, s, me ? W - 205 : 205, y + 50, 30, me ? '#fff' : '#1a1a2a'); });
    if (st.typing) { rr(g, 30, H - 240, 160, 80, 30, '#ffffff'); for (let i = 0; i < 3; i++) dCircle(g, 75 + i * 35, H - 200 - 8 * Math.max(0, Math.sin((st.typing * 6 - i) )), 11, '#8a90a0'); }
    if (st.photo) { rr(g, W - 400, 220, 370, 520, 24, '#2a8af0'); g.save(); g.translate(W - 385, 235); g.scale(340 / W, 490 / H); drawScreen(g, { mode: 'bank', amount: '1.000.000.043,00 €', clock: '06:02' }); g.restore(); }
  } else if (m === 'photo') { // yacht party photo
    const gr = g.createLinearGradient(0, 70, 0, H); gr.addColorStop(0, '#ff9a5a'); gr.addColorStop(0.5, '#ff5a8a'); gr.addColorStop(0.51, '#1a5a9a'); gr.addColorStop(1, '#0a2a5a'); g.fillStyle = gr; g.fillRect(0, 70, W, H);
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(40, 600); g.lineTo(500, 600); g.lineTo(440, 690); g.lineTo(90, 690); g.fill(); g.fillRect(150, 520, 240, 80); g.fillStyle = '#2a3a6a'; for (let i = 0; i < 5; i++) g.fillRect(170 + i * 44, 540, 28, 22);
    for (let i = 0; i < 40; i++) { g.fillStyle = ['#ffd23a', '#ff3a8a', '#3ad0ff', '#ffffff'][i % 4]; g.fillRect((i * 97) % W, 120 + (i * 53) % 380, 10, 18); }
    dCircle(g, 270, 470, 46, '#ffffff'); g.fillStyle = '#8a5530'; g.beginPath(); g.ellipse(270, 446, 48, 24, 0, Math.PI, 0); g.fill(); g.fillStyle = '#3a1050'; g.fillRect(236, 458, 30, 14); g.fillRect(274, 458, 30, 14);
  } else if (m === 'notify') {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a3a7a'); gr.addColorStop(1, '#7a4a9a'); g.fillStyle = gr; g.fillRect(0, 70, W, H);
    txt(g, st.clock || '14:32', W / 2, 260, 120, '#ffffff', { w: 'normal' }); txt(g, 'Sonntag', W / 2, 360, 34, '#e0e4ff', { w: 'normal' });
    if (st.note) { const y = 470 + (1 - (st.noteIn ?? 1)) * -300; rr(g, 24, y, W - 48, 260, 30, 'rgba(255,255,255,0.92)'); dCircle(g, 80, y + 60, 28, '#2a5ad0'); txt(g, 'Mein Konto', 124, y + 60, 26, '#1a1a2a', { al: 'left' });
      txt(g, 'Gutschrift:', 50, y + 112, 27, '#1a1a2a', { al: 'left' }); txt(g, '1.000.000.000 €', 50, y + 160, 27, '#1a1a2a', { al: 'left' }); txt(g, '– Yacht Nummer fünf', 50, y + 210, 27, '#1a1a2a', { al: 'left' }); }
  } else if (m === 'shop') { g.fillStyle = '#ffffff'; g.fillRect(0, 70, W, H); txt(g, st.item || '', W / 2, 180, 36, '#1a1a2a'); rr(g, 60, 240, W - 120, 420, 30, '#eef2f8'); txt(g, st.icon || '📦', W / 2, 450, 200, '#000', { w: 'normal' }); rr(g, 60, 720, W - 120, 110, 55, '#2ab070'); txt(g, st.price || '', W / 2, 775, 44, '#fff'); }
}
function dCircle(g, x, y, r, c) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = c; g.fill(); }
function drawReels(g, st, x, y) {
  const target = '1000000043', k = st.reel, n = target.length; // k locked from the right beyond '43'
  const shown = Math.min(n, 2 + Math.ceil(k) + 1); const ds = [];
  for (let i = 0; i < shown; i++) { const pos = n - shown + i, fromR = n - 1 - pos; const locked = fromR < 2 + Math.floor(k); ds.push(locked ? target[pos] : String((Math.floor(st.t * 37 + i * 7)) % 10)); }
  let s = fmtBig(ds.join('')) + ',00 €'; const px = s.length > 14 ? 42 : 62;
  g.font = font(px); g.textAlign = 'left'; g.textBaseline = 'middle';
  // draw char by char so unlocked digits get a spin blur
  let cx = x, di = 0;
  for (const ch of s) { const w = g.measureText(ch).width; const isD = /\d/.test(ch); let spin = false;
    if (isD) { const pos = n - shown + di, fromR = n - 1 - pos; spin = !(fromR < 2 + Math.floor(k)); di++; }
    if (spin) { for (let j = -2; j <= 2; j++) { g.fillStyle = `rgba(255,240,180,${0.35 - Math.abs(j) * 0.1})`; g.fillText(ch, cx, y + j * 14); } }
    else { g.fillStyle = st.gold > 0.5 ? '#ffe27a' : '#ffffff'; g.fillText(ch, cx, y); }
    cx += w; }
}

/** a 3D phone: returns {group, setState(st)}; screen faces +z. size h metres tall */
export function makePhone(parent, h = 0.16) {
  const { THREE } = K, w = h * 0.49, G = grp(parent);
  bx(w, h, h * 0.055, '#22202a', 0, -h / 2, 0, G, { t: 0.05 });
  bx(w * 0.96, h * 0.97, h * 0.06, '#3a3844', 0, -h * 0.485, 0, G, { t: 0.05, cast: false });
  const c = document.createElement('canvas'); c.width = SCR_W; c.height = SCR_H; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, h * 0.93), new THREE.MeshBasicMaterial({ map: tex, fog: false })); scr.position.z = h * 0.031; scr.userData.ndSkip = true; G.add(scr);
  const notch = bx(w * 0.3, h * 0.025, h * 0.002, '#0a0a0e', 0, h * 0.43, h * 0.032, G, { cast: false });
  const halo = glow(h * 1.4, '150,200,255', 0, 0, -0.01, G, 0.35); halo.visible = false;
  let key = '';
  return { group: G, tex, halo, setState(st) { const k = JSON.stringify(st); if (k === key) return; key = k; drawScreen(g, st); tex.needsUpdate = true; } };
}
/** generic dynamic sign (canvas) with redraw on key change */
export function dynSign(w, h, pxW, pxH, x, y, z, parent, o = {}) {
  const { THREE } = K; const c = document.createElement('canvas'); c.width = pxW; c.height = pxH; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: !!o.transparent, fog: o.fog ?? false, side: THREE.DoubleSide }));
  m.position.set(x, y, z); if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; m.userData.ndSkip = true; parent.add(m);
  let key = ''; return { mesh: m, draw(k, fn) { if (k === key) return; key = k; g.clearRect(0, 0, pxW, pxH); fn(g, pxW, pxH); tex.needsUpdate = true; } };
}

// ---------------- crowds: pre-rendered character atlas on instanced planes ----------------
export function crowd(parent, specs, positions, o = {}) {
  const { THREE, T } = K; const n = specs.length, cw = 300, ch = 500;
  const c = document.createElement('canvas'); c.width = cw * n; c.height = ch; const g = c.getContext('2d');
  specs.forEach((s, i) => { g.save(); g.translate(i * cw, 0); g.scale(cw / 600, ch / 1000); const p = new T.Pen(g); T.toonChar(p, s.spec, s.opts || {}); g.restore(); });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(1.35, 2.25); geo.translate(0, 2.25 / 2 - 0.056, 0);
  const groups = [];
  for (let i = 0; i < n; i++) {
    const t2 = tex.clone(); t2.repeat.set(1 / n, 1); t2.offset.set(i / n, 0); t2.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: t2, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, color: o.tint || '#ffffff' });
    const pts = positions.filter((_, k) => k % n === i);
    const im = new THREE.InstancedMesh(geo, mat, Math.max(1, pts.length)); im.userData.ndSkip = true; im.userData.pts = pts; im.castShadow = false; im.frustumCulled = false;
    parent.add(im); groups.push(im);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const update = (t, camPos, amp = 0.06) => { groups.forEach((im, gi) => { im.userData.pts.forEach(([x, y, z, s = 1], k) => {
    const bob = Math.abs(Math.sin(t * (6 + (k % 3)) + k * 1.7 + gi)) * amp; const yaw = camPos ? Math.atan2(camPos.x - (parent.position.x + x), camPos.z - (parent.position.z + z)) : 0;
    e.set(0, yaw, 0); q.setFromEuler(e); v.set(x, y + bob, z); sc.set(s * ((k + gi) % 2 ? -1 : 1), s, s); m4.compose(v, q, sc); im.setMatrixAt(k, m4); }); im.instanceMatrix.needsUpdate = true; }); };
  update(0, null); return { groups, update };
}
