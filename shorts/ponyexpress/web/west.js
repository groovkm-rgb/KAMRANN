// ===================== west.js: horses, western props and fx =====================
const TAU = Math.PI * 2;
const HORSES = {
  brown: { c: '#9a5a2c', d: '#6b3a1a', mane: '#2a1810', blaze: 1, sock: 1 },
  black: { c: '#3a3644', d: '#1e1c26', mane: '#0c0b10', blaze: 0 },
  pinto: { c: '#f3ead8', d: '#c9bca4', mane: '#7a4a26', spots: '#8a5226' },
  grey: { c: '#b9b4ae', d: '#8a857e', mane: '#4a4642', blaze: 0 },
};
const seg = (g, pts, w, col, iw = 7) => { ln(g, pts, w + iw * 2); ln(g, pts, w, col); };
const union = (g, shapes, col, iw = 8) => { for (const s of shapes) inkFill(g, s, null, iw * 2); for (const s of shapes) inkFill(g, s, col, 0); };
/** side-view horse facing right. o: coat, ph (0..1 gallop phase), gait 'gallop'|'stand', rider {spec, opts}, saddle, mochila, tack, lift, pitch, headUp, mirror */
export const horseSide = (p, o = {}) => {
  const g = p.g, H = HORSES[o.coat || 'brown'], th = (o.ph || 0) * TAU, run = (o.gait || 'gallop') === 'gallop' ? 1 : 0;
  const bob = run ? -12 - 15 * Math.sin(th + 0.6) : -(o.breath || 0) * 4, pitch = run ? 5 * Math.sin(th + 2.2) : 0;
  g.save(); g.translate(282, 721 + (bob - (o.lift || 0)) * 0.7); g.rotate(dg(pitch + (o.pitch || 0))); g.scale(0.7, 0.7);
  const U = 150, Lw = 172;
  const leg = (hx, hy, front, off, far) => {
    let a1, a2;
    if (run) { const t = th + (front ? 0 : Math.PI) + off, bend = Math.max(0, -Math.sin(t));
      if (front) { a1 = 54 * Math.cos(t) + 8; a2 = a1 - 88 * bend; } else { a1 = 47 * Math.cos(t) - 12; a2 = a1 + 24 - 30 * bend + 34 * Math.max(0, Math.sin(t)) * 0; if (Math.cos(t) > 0) a2 = a1 + 24 - 60 * bend; }
    } else { a1 = front ? 3 + (far ? -5 : 0) : -12 + (far ? 6 : 0); a2 = front ? 0 : 9; if (front && !far && o.paw) { a1 = 30 * o.paw; a2 = -60 * o.paw; } }
    const k = [hx + U * Math.sin(dg(a1)), hy + U * Math.cos(dg(a1))], f = [k[0] + Lw * Math.sin(dg(a2)), k[1] + Lw * Math.cos(dg(a2))];
    const col = far ? H.d : H.c;
    seg(g, [[hx, hy], k], 40, col); seg(g, [k, f], 25, col); dt(g, k[0], k[1], 16, col);
    if (H.sock && !far && front) ln(g, [[k[0] + (f[0] - k[0]) * 0.55, k[1] + (f[1] - k[1]) * 0.55], f], 25, '#f4efe6');
    const hd = [Math.sin(dg(a2)), Math.cos(dg(a2))]; seg(g, [[f[0] - hd[0] * 6, f[1] - hd[1] * 6], [f[0] + hd[0] * 16, f[1] + hd[1] * 16]], 30, '#1c1512', 5);
  };
  leg(128, 30, true, 0.5, true); leg(-128, 22, false, 0.45, true);
  // tail
  { const pts = [], pb = []; const N = 14;
    for (let i = 0; i <= N; i++) { const s = i / N; let x, y;
      if (run) { x = -196 - 205 * s; y = -52 - 46 * Math.sin(Math.PI * s * 0.9) + 46 * s * s + 16 * Math.sin(th * 2 - s * 5) * s; }
      else { const wv = o.wind || 0; x = -198 - 46 * Math.sin(s * 2.2) - (o.tailSw || 0) * 30 * s - wv * (90 * s + 18 * s * Math.sin((o.windPh || 0) - s * 3)); y = -52 + 250 * s * (1 - wv * 0.25); }
      const w = 10 + 38 * Math.pow(Math.sin(Math.PI * Math.min(1, s * 0.9 + 0.08)), 0.7); pts.push([x, y - w / 2]); pb.unshift([x - (run ? 0 : w / 2), y + (run ? w / 2 : 0)]); }
    inkFill(g, [...pts, ...pb], H.mane, 8); }
  leg(-120, 26, false, 0, false); leg(118, 34, true, 0, false);
  // body
  union(g, [ellP(0, 0, 172, 88), ellP(-112, -6, 98, 100), ellP(118, 2, 92, 98)], H.c, 8);
  g.save(); pth(g, [...ellP(0, 0, 172, 88)]); g.clip(); g.fillStyle = 'rgba(40,20,60,0.22)'; g.fillRect(-200, 40, 400, 80); g.restore();
  if (H.spots) { g.save(); g.beginPath(); for (const s of [ellP(0, 0, 172, 88), ellP(-112, -6, 98, 100), ellP(118, 2, 92, 98)]) { s.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); } g.clip();
    for (const [x, y, rx, ry] of [[-150, -40, 60, 52], [-40, 50, 70, 40], [90, -50, 56, 44], [170, 50, 40, 36], [-190, 60, 40, 30]]) inkFill(g, wob(x, y, rx, ry, x, 0.09, 30), H.spots, 0); g.restore(); }
  // neck + head
  const al = dg(run ? 36 + 5 * Math.sin(th + 1.2) : 60 - (o.headDown || 0) * 70), be = dg(run ? 24 + 4 * Math.sin(th + 1.2) : 48 + (o.headDown || 0) * 20);
  const Nb = [140, -34], Ne = [Nb[0] + 196 * Math.cos(al), Nb[1] - 196 * Math.sin(al)], nn = [Math.sin(al), Math.cos(al)];
  const d = [Math.cos(be), Math.sin(be)], dn = [-d[1], d[0]], Hp = (a, b) => [Ne[0] + d[0] * a + dn[0] * b, Ne[1] + d[1] * a + dn[1] * b];
  const neck = [[Nb[0] - nn[0] * 86, Nb[1] - nn[1] * 86], [Nb[0] + nn[0] * 70, Nb[1] + nn[1] * 70], [Ne[0] + nn[0] * 44, Ne[1] + nn[1] * 44], [Ne[0] - nn[0] * 40, Ne[1] - nn[1] * 40]];
  const head = [Hp(-30, -44), Hp(40, -50), Hp(150, -30), Hp(168, -6), Hp(160, 24), Hp(120, 30), Hp(50, 44), Hp(-20, 46)];
  // ears (behind head)
  inkFill(g, [Hp(-26, -40), Hp(-56, -92), Hp(-2, -48)], H.d, 7); inkFill(g, [Hp(-6, -44), Hp(-30, -100), Hp(22, -48)], H.c, 7);
  union(g, [neck, head, ellP(Ne[0] + d[0] * 6, Ne[1] + d[1] * 6 + 6, 52, 50)], H.c, 8);
  if (H.blaze) inkFill(g, [Hp(-8, -47), Hp(40, -51), Hp(150, -31), Hp(166, -8), Hp(150, -12), Hp(60, -30), Hp(0, -30)], '#f6f1e8', 0);
  if (H.spots) inkFill(g, wob(Ne[0] - 30, Ne[1] + 60, 40, 46, 3, 0.08, 24), H.spots, 0);
  inkFill(g, [Hp(-30, -44), Hp(40, -50), Hp(150, -30), Hp(168, -6)], null, 8, false);
  const ey = Hp(34, -14); inkFill(g, ellP(ey[0], ey[1], 13, 15), '#ffffff', 5); dt(g, ey[0] + 4, ey[1] + 1, 7.5);
  if (o.eye === 'wide') dt(g, ey[0] + 4, ey[1] + 1, 5); ln(g, [[ey[0] - 15, ey[1] - 17], [ey[0] + 14, ey[1] - 20 + (run ? 6 : 0)]], 6);
  const no = Hp(150, -2); dt(g, no[0], no[1], 6.5); ln(g, [Hp(128, 28), Hp(158, 16)], 5);
  if (o.tack !== false) { ln(g, [Hp(108, -36), Hp(104, 34)], 7, '#4a2a14'); ln(g, [Hp(108, -30), Hp(20, -46)], 6, '#4a2a14'); ln(g, [Hp(104, 30), Hp(10, 40)], 6, '#4a2a14'); const r = o.reinTo || [10, -150]; ln(g, [Hp(110, 30), [(Hp(110, 30)[0] + r[0]) / 2, (Hp(110, 30)[1] + r[1]) / 2 + 26], r], 6, '#4a2a14'); }
  if (o.breathPuff) { g.globalAlpha = 0.75 * o.breathPuff; for (let i = 0; i < 4; i++) { const q = Hp(190 + i * 34 + o.breathPuff * 30, 6 - i * 6); dt(g, q[0], q[1], 16 + i * 9, '#ffffff'); } g.globalAlpha = 1; }
  // mane
  for (let i = 0; i < 7; i++) { const s = i / 6.5, bx = neck[0][0] + (neck[3][0] - neck[0][0]) * s, by = neck[0][1] + (neck[3][1] - neck[0][1]) * s;
    const wv = o.wind || 0, L = (run ? 92 : 50) - i * 4, fl = run ? Math.sin(th * 2 + i * 0.9) * 16 : Math.sin((o.windPh || 0) + i * 0.8) * 10 * wv, dx = run ? -L : -L * (0.45 + wv * 0.5), dy = run ? -12 + fl : L * (0.9 - wv * 0.45) + fl;
    inkFill(g, [[bx + 16 * nn[1], by - 20], [bx + dx * 0.55, by + dy * 0.5 - 26], [bx + dx, by + dy], [bx + dx * 0.4, by + dy * 0.5 + 16], [bx + 6, by + 26]], H.mane, 7); }
  { const q = Hp(-20, -50), fl = run ? Math.sin(th * 2) * 8 : 0; inkFill(g, [[q[0] + 14, q[1] + 6], [q[0] - (run ? 50 : 6), q[1] - 26 + fl], [q[0] - (run ? 30 : -30), q[1] + 4 + fl], [q[0] + 4, q[1] + 30]], H.mane, 6); }
  // saddle + mochila
  if (o.saddle !== false) {
    inkFill(g, [[-98, -84], [64, -86], [70, -46], [-92, -44]], '#b8402e', 6);
    inkFill(g, [[-84, -96], [-62, -122], [-30, -104], [26, -104], [52, -116], [60, -84], [40, -72], [-72, -74]], '#6a3a1c', 7);
    ln(g, [[-10, -74], [-14, 96]], 9, '#3a2010'); ln(g, [[-22, 96], [-4, 96]], 8, '#8a8a92');
    if (o.mochila) { inkFill(g, [[-70, -106], [36, -104], [42, -4], [-74, -2]], '#a8682e', 7); for (const x of [-62, -12]) inkFill(g, pill(x, -56, x + 40, -10, 8), '#8a5222', 5);
      for (const x of [-42, 8]) dt(g, x, -34, 4.5, '#e2b84c'); g.save(); g.translate(-16, -80); if (o.mirror) g.scale(-1, 1); g.font = 'bold 30px Georgia, "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2a1408'; g.fillText('Post', 0, 0); g.restore(); }
  }
  if (o.rider) { const R = o.rider, lean = R.lean ?? (run ? 14 : 0), rb = run ? 6 * Math.sin(th * 2 + 1) : 0;
    toonChar(p, R.spec, { turn: 0.7, look: 0.5, legs: 'none', ...R.opts, tilt: lean + (R.opts?.tilt || 0), px: -26 + (R.dx || 0), py: 48 + rb + (R.dy || 0), ps: 0.5, mirror: o.mirror });
    const pc = R.spec.legs || '#4a3a30', bc = R.spec.boots || '#2a1c14';
    seg(g, [[-24, -70], [30, -22]], 26, pc, 6); seg(g, [[30, -22], [6, 64]], 22, bc, 6); seg(g, [[6, 64], [34, 72]], 20, bc, 6); }
  g.restore();
};
/** front-view galloping horse with rider (hook) */
export const horseFront = (p, o = {}) => {
  const g = p.g, H = HORSES[o.coat || 'brown'], th = (o.ph || 0) * TAU, bob = -14 * Math.sin(th * 2) , lift = o.lift || 0;
  g.save(); g.translate(300, 0 - lift);
  const legF = (sx, t, far) => { const up = Math.max(0, Math.sin(t)), fw = Math.cos(t); const hx = sx * (far ? 96 : 70), hy = far ? 700 : 760, ky = hy + (far ? 90 : 105) - up * 60, kx = hx + sx * 8 * up, fy = Math.min(972, ky + 112 - up * 70 + fw * 6), fx = kx - sx * up * 14;
    const col = far ? H.d : H.c; seg(g, [[hx, hy], [kx, ky]], far ? 36 : 44, col); seg(g, [[kx, ky], [fx, fy]], far ? 26 : 30, col); if (H.sock && !far) ln(g, [[kx + (fx - kx) * 0.5, ky + (fy - ky) * 0.5], [fx, fy]], 30, '#f4efe6'); seg(g, [[fx, fy - 4], [fx, fy + 14]], 36, '#1c1512', 5); };
  legF(-1, th + Math.PI + 0.5, true); legF(1, th + Math.PI + 1.0, true);
  if (o.rider) { const R = o.rider; toonChar(p, R.spec, { legs: 'none', ...R.opts, px: 0 + (R.dx || 0), py: 600 + bob * 0.6 + (R.dy || 0), ps: R.ps || 0.62 });
    for (const sx of [-1, 1]) { seg(g, [[sx * 96, 560 + bob], [sx * 150, 660 + bob]], 28, R.spec.legs || '#4a3a30', 6); seg(g, [[sx * 150, 660 + bob], [sx * 138, 760 + bob]], 24, R.spec.boots || '#2a1c14', 6); seg(g, [[sx * 138, 760 + bob], [sx * 162, 772 + bob]], 22, R.spec.boots || '#2a1c14', 6); } }
  // chest
  union(g, [ellP(0, 660 + bob, 142, 150)], H.c, 9);
  g.save(); pth(g, ellP(0, 660 + bob, 142, 150)); g.clip(); g.fillStyle = 'rgba(40,20,60,0.25)'; g.fillRect(-150, 740 + bob, 300, 100); g.restore();
  ln(g, [[-110, 640 + bob], [0, 700 + bob], [110, 640 + bob]], 12, '#4a2a14');
  legF(-1, th, false); legF(1, th + 0.55, false);
  // head
  const hy = 500 + bob * 1.3 + 10 * Math.sin(th);
  for (const sx of [-1, 1]) { const fl = Math.sin(th * 2 + sx) * 10; inkFill(g, [[sx * 70, hy - 110], [sx * 150, hy - 150 + fl], [sx * 130, hy - 90 + fl], [sx * 170, hy - 60 + fl], [sx * 120, hy - 20], [sx * 76, hy - 10]], H.mane, 7); }
  for (const sx of [-1, 1]) inkFill(g, [[sx * 44, hy - 128], [sx * 72, hy - 200], [sx * 92, hy - 122]], H.c, 8);
  const head = [[-88, hy - 120], [88, hy - 120], [96, hy - 40], [66, hy + 80], [58, hy + 128], [0, hy + 146], [-58, hy + 128], [-66, hy + 80], [-96, hy - 40]];
  union(g, [head], H.c, 9);
  if (H.blaze) inkFill(g, [[-20, hy - 122], [20, hy - 122], [30, hy + 20], [22, hy + 120], [-22, hy + 120], [-30, hy + 20]], '#f6f1e8', 0);
  inkFill(g, [[-30, hy - 130], [0, hy - 90], [30, hy - 130], [10, hy - 150], [-12, hy - 150]], H.mane, 6);
  for (const sx of [-1, 1]) { inkFill(g, ellP(sx * 62, hy - 46, 15, 18), '#ffffff', 5); dt(g, sx * 60, hy - 42, 8.5); ln(g, [[sx * 84, hy - 76], [sx * 40, hy - 64]], 7); dt(g, sx * 26, hy + 108, 8); }
  ln(g, [[-64, hy + 62], [64, hy + 62]], 8, '#4a2a14'); for (const sx of [-1, 1]) ln(g, [[sx * 64, hy + 62], [sx * 92, hy - 100]], 6, '#4a2a14');
  if (o.rider) for (const sx of [-1, 1]) ln(g, [[sx * 64, hy + 66], [sx * 120, hy + 30], [sx * 60, 420 + bob]], 6, '#4a2a14');
  g.restore();
};
// ---------- props as cards ----------
export const propMochila = (p, rot = 0) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(rot); inkFill(g, pill(-190, -120, 190, 150, 30), '#a8682e', 12);
  for (const x of [-170, 20]) inkFill(g, pill(x, 0, x + 150, 130, 20), '#8a5222', 8); for (const x of [-95, 95]) dt(g, x, 60, 12, '#e2b84c');
  g.font = 'bold 96px Georgia, "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.fillStyle = '#2a1408'; g.fillText('Post', 0, -62); g.restore(); };
export const propHat = (p, rot = 0, col = '#c9a56a') => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(rot); inkFill(g, ellP(0, 20, 230, 52, 0, 360, 40), col, 12); inkFill(g, [[-100, 14], [-88, -110], [-30, -124], [0, -104], [30, -124], [88, -110], [100, 14]], col, 12); inkFill(g, [[-98, -14], [98, -14], [100, 12], [-100, 12]], shadeC(col, 0.6), 6); g.restore(); };
export const propPaper = (p, rot = 0, k = 1) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(rot); g.scale(1, k); inkFill(g, [[-150, -200], [150, -210], [160, 200], [-146, 208]], '#f6eeda', 10); for (let i = 0; i < 7; i++) ln(g, [[-110, -150 + i * 50], [118 - (i % 3) * 30, -154 + i * 50]], 9, '#9a8c74'); g.restore(); };
export const propBird = (p, flap = 0, col = '#1e1a22') => { const g = p.g, a = flap * 120; g.save(); g.translate(300, 500); inkFill(g, [[-250, -a], [-120, -40 - a * 0.3], [0, 0], [120, -40 - a * 0.3], [250, -a], [130, 10 - a * 0.2], [0, 46], [-130, 10 - a * 0.2]], col, 0); g.restore(); };
export const propBirdSit = (p, tw = 0) => { const g = p.g; g.save(); g.translate(300, 620); inkFill(g, ellP(0, -90, 92, 74), '#2a2630', 10); inkFill(g, ellP(52, -160 - tw * 8, 50, 46), '#2a2630', 10); inkFill(g, [[96, -168 - tw * 8], [150, -156 - tw * 8], [98, -142 - tw * 8]], '#e0a030', 6); dt(g, 64, -170 - tw * 8, 7, '#fff');
  inkFill(g, [[-70, -110], [-190, -60 + tw * 14], [-80, -50]], '#2a2630', 10); ln(g, [[-10, -20], [-10, 20]], 8); ln(g, [[24, -20], [24, 20]], 8); g.restore(); };
export const propTumble = (p, rot = 0) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(rot); for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 150 + 90 * Math.sin(i * 1.7); g.beginPath(); g.arc(Math.cos(a) * 70, Math.sin(a) * 70, r, a, a + 2.2); g.lineWidth = 9; g.strokeStyle = i % 3 ? '#8a6234' : '#c49a5a'; g.stroke(); }
  g.beginPath(); g.arc(0, 0, 250, 0, 7); g.lineWidth = 10; g.strokeStyle = '#6a4a26'; g.stroke(); g.restore(); };
export const propClod = (p, seed = 1) => { const g = p.g; inkFill(g, wob(300, 500, 200, 170, seed, 0.16, 16), seed % 2 ? '#7a4526' : '#5a3018', 22); };
export const propBolt = (p, seed = 1) => { const g = p.g; let x = 300, y = 40; const pts = [[x, y]]; let s = seed * 9301 + 7; const r = () => ((s = (s * 49297 + 233280) % 233281) / 233281);
  while (y < 960) { x += (r() - 0.5) * 150; y += 60 + r() * 70; pts.push([x, y]); } ln(g, pts, 46, 'rgba(170,200,255,0.35)'); ln(g, pts, 18, '#eaf2ff'); ln(g, [pts[3], [pts[3][0] + 120, pts[3][1] + 150], [pts[3][0] + 100, pts[3][1] + 260]], 10, '#eaf2ff'); };
// ---------- soft fx ----------
export const fxSoft = (p, col = '235,205,165', a = 1, r0 = 0.15) => { const g = p.g, r = g.createRadialGradient(300, 500, 0, 300, 500, 295); r.addColorStop(0, `rgba(${col},${a})`); r.addColorStop(r0, `rgba(${col},${a * 0.92})`); r.addColorStop(0.62, `rgba(${col},${a * 0.45})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.save(); g.translate(300, 500); g.scale(1, 1); g.translate(-300, -500); g.fillRect(0, 200, 600, 600); g.restore(); };
/** puffy cartoon dust cloud: several overlapping lobes */
export const fxDustCloud = (p, seed = 1, col = '226,186,140', a = 1) => { const g = p.g; for (let i = 0; i < 7; i++) { const an = i * 2.4 + seed, d = i ? 120 : 0, x = 300 + Math.cos(an) * d * 1.2, y = 520 + Math.sin(an) * d * 0.7, R = 150 - i * 8; const r = g.createRadialGradient(x, y - 20, 0, x, y, R); r.addColorStop(0, `rgba(${col},${a})`); r.addColorStop(0.7, `rgba(${col},${a * 0.8})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(x - R, y - R, 2 * R, 2 * R); } };
export const fxFlakes = (p, seed = 1, n = 40, R = 9, col = '255,255,255', streak = 0) => { const g = p.g; let s = seed * 7919 + 13; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) { const x = r() * 600, y = r() * 1000, q = R * (0.5 + r()); if (streak) { g.strokeStyle = `rgba(${col},${0.5 + 0.5 * r()})`; g.lineWidth = q; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + streak, y + streak * 0.35); g.stroke(); } else dt(g, x, y, q, `rgba(${col},${0.55 + 0.45 * r()})`); } };
export const fxSplashW = (p, t = 0.5, seed = 1) => { const g = p.g, k = Math.sin(Math.min(1, t) * Math.PI); for (let i = 0; i < 11; i++) { const a = dg(200 + i * 14 + (seed * 37 + i * 13) % 9), d = 120 + 330 * t * (0.6 + 0.4 * ((i * 7 + seed) % 5) / 4), x = 300 + Math.cos(a) * d, y = 820 + Math.sin(a) * d * 1.5 + 420 * t * t, r = (30 - 14 * t) * (0.7 + (i % 3) * 0.3);
    inkFill(g, ellP(x, y, r, r * 1.3), i % 2 ? '#dff4ff' : '#9fd8f2', 7); }
  inkFill(g, [[40, 880], ...Array.from({ length: 9 }, (_, i) => [70 + i * 58, 880 - (i % 2 ? 150 : 70) * k * (0.7 + 0.3 * Math.sin(i * 1.9 + seed))]), [560, 880]], '#c8ecfb', 9); };
export const fxRay = (p, col = '255,214,150', a = 0.5) => { const g = p.g, r = g.createLinearGradient(300, 0, 300, 1000); r.addColorStop(0, `rgba(${col},${a})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.beginPath(); g.moveTo(240, 0); g.lineTo(360, 0); g.lineTo(600, 1000); g.lineTo(0, 1000); g.fill(); };
export const fxPulse = (p, k = 1, len = 0) => { const g = p.g; g.save(); g.translate(300, 500); const r = g.createRadialGradient(0, 0, 0, 0, 0, 290); r.addColorStop(0, `rgba(255,255,255,${k})`); r.addColorStop(0.12, `rgba(170,225,255,${0.95 * k})`); r.addColorStop(0.4, `rgba(60,150,255,${0.5 * k})`); r.addColorStop(1, 'rgba(40,110,255,0)'); g.fillStyle = r; g.fillRect(-300, -300, 600, 600);
  g.strokeStyle = `rgba(235,248,255,${k})`; g.lineWidth = 9; g.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = i * 1.05 + len; g.beginPath(); g.moveTo(Math.cos(a) * 50, Math.sin(a) * 50); g.lineTo(Math.cos(a + 0.2) * 130, Math.sin(a + 0.2) * 130); g.lineTo(Math.cos(a - 0.1) * 200, Math.sin(a - 0.1) * 200); g.stroke(); } g.restore(); };
export const fxSpark = (p, t = 0, col = '#fff3b0') => { const g = p.g; for (let i = 0; i < 9; i++) { const a = i * 0.7, r0 = 60 + 180 * t, r1 = r0 + 90 * (1 - t); ln(g, [[300 + Math.cos(a) * r0, 500 + Math.sin(a) * r0], [300 + Math.cos(a) * r1, 500 + Math.sin(a) * r1]], 16 * (1 - t) + 3, col); } };
export const fxSmoke = (p, seed = 1, a = 0.7) => fxDustCloud(p, seed, '120,112,118', a);
