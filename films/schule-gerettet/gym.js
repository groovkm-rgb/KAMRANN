// TURNHALLE (gym interior) + Technikraum + the floor plan card. All text German.
// gym: x 0..16 (window wall x = 0: high windows), z 0..28; the steel entrance door in the wall z = 0 at x 6.5..8.7;
// Technikraum: glass box above the entrance at y 3.4..5.6, x 9.5..13.5, z 0..2.2, reached by a steel stair; back doors at z = 28.
const GYM = { w: 16, d: 28, h: 7.5, door: [6.5, 8.7], tech: { x0: 9.5, x1: 13.5, z1: 2.2, y0: 3.4, y1: 5.6 } };
const GYM_LIGHT = { dir: V.norm([.75, .55, .3]), col: [255, 236, 196], amb: .55, ambCol: [150, 160, 205], ink: 1.2, inkA: .5 };
function texGymFloor() { return makeTex('gymfloor', 1024, 2048, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#d9a56a'); g.addColorStop(1, '#cf9a5e'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 64; i++) { c.fillStyle = `rgba(${120 + rnd(i) * 40 | 0},70,30,${.06 + rnd(i + 2) * .08})`; c.fillRect(i * 16, 0, 15, h); line(c, [i * 16, 0, i * 16, h], 1, 'rgba(90,50,20,.25)'); for (let k = 0; k < 6; k++) line(c, [i * 16, rnd(i * 7 + k) * h, i * 16 + 16, rnd(i * 7 + k) * h], 1, 'rgba(90,50,20,.3)'); }
  const sx = w / 16, sz = h / 28, L = (pts, col, lw = 6) => line(c, pts, lw, col);
  L([1 * sx, 1 * sz, 15 * sx, 1 * sz, 15 * sx, 27 * sz, 1 * sx, 27 * sz, 1 * sx, 1 * sz], 'rgba(245,245,240,.9)'); L([1 * sx, 14 * sz, 15 * sx, 14 * sz], 'rgba(245,245,240,.9)');
  c.beginPath(); c.arc(8 * sx, 14 * sz, 1.8 * sx, 0, TAU); c.lineWidth = 6; c.strokeStyle = 'rgba(245,245,240,.9)'; c.stroke();
  for (const z of [1, 27]) { c.beginPath(); c.arc(8 * sx, z * sz, 6 * sx, z === 1 ? 0 : Math.PI, z === 1 ? Math.PI : TAU); c.lineWidth = 6; c.strokeStyle = 'rgba(230,80,60,.85)'; c.stroke(); }
  L([3 * sx, 2 * sz, 3 * sx, 26 * sz], 'rgba(60,120,200,.8)', 5); L([13 * sx, 2 * sz, 13 * sx, 26 * sz], 'rgba(60,120,200,.8)', 5);
  for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(0, rnd(i) * h, w, 30); }
}); }
function gymFrame(c, t, cam, o = {}) {
  const G = GYM, S = scene(cam, Object.assign({}, GYM_LIGHT, o.light || {}));
  const fc = (P, col, n, oo = {}) => drawFace(S, c, P, col, n, Object.assign({ ink: 0 }, oo));
  texQuad(S, texGymFloor(), [[0, 0, G.d], [G.w, 0, G.d], [G.w, 0, 0], [0, 0, 0]], { now: c, nx: 6, ny: 12, n: [0, 1, 0], extra: .1 });
  fc([[0, G.h, 0], [G.w, G.h, 0], [G.w, G.h, G.d], [0, G.h, G.d]], '#e8e4da', [0, -1, 0], { extra: .1 });
  // walls: lower padded/painted band, upper brick-ish
  for (const [P, n] of [[[[0, 0, 0], [0, G.h, 0], [0, G.h, G.d], [0, 0, G.d]], [1, 0, 0]], [[[G.w, 0, G.d], [G.w, G.h, G.d], [G.w, G.h, 0], [G.w, 0, 0]], [-1, 0, 0]], [[[G.w, 0, 0], [G.w, G.h, 0], [0, G.h, 0], [0, 0, 0]], [0, 0, 1]], [[[0, 0, G.d], [0, G.h, G.d], [G.w, G.h, G.d], [G.w, 0, G.d]], [0, 0, -1]]])
    fc(P, '#e9dfcc', n, { grad: [.05, .2] });
  for (const [P, n] of [[[[0.01, 0, 0], [0.01, 2.2, 0], [0.01, 2.2, G.d], [0.01, 0, G.d]], [1, 0, 0]], [[[G.w - .01, 0, G.d], [G.w - .01, 2.2, G.d], [G.w - .01, 2.2, 0], [G.w - .01, 0, 0]], [-1, 0, 0]], [[[0, 0, G.d - .01], [0, 2.2, G.d - .01], [G.w, 2.2, G.d - .01], [G.w, 0, G.d - .01]], [0, 0, -1]], [[[G.w, 0, .01], [G.w, 2.2, .01], [0, 2.2, .01], [0, 0, .01]], [0, 0, 1]]])
    fc(P, '#3f78b8', n, { grad: [.08, .2] });
  // high windows on x = 0 (bright), with sun beams falling across the floor
  const wins = []; for (let i = 0; i < 6; i++) wins.push([2 + i * 4.3, 3.2 + i * 4.3]);
  for (const [z0, z1] of wins) { const sp = projPoly(cam, [[.02, 6.8, z0], [.02, 6.8, z1], [.02, 5.0, z1], [.02, 5.0, z0]]); if (sp) { pathPoly(c, sp); c.fillStyle = '#f4f8ff'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#8a929c'; c.stroke(); const m = proj(cam, [.02, 5.9, (z0 + z1) / 2]); if (m) glow(c, m[0], m[1], cam.f * 1.3 / m[2], '255,245,220', .5); } }
  if (o.beams !== false) gymBeams(S, c, t, wins, o.beamA ?? 1);
  // back doors (z = G.d) chained + bolted, sign
  for (const x of [3, 11]) { fc([[x, 2.3, G.d - .02], [x + 2, 2.3, G.d - .02], [x + 2, 0, G.d - .02], [x, 0, G.d - .02]].reverse().map((p, i, a) => a[(i + 2) % 4]), '#7d8590', [0, 0, -1], { ink: 1.5 });
    const a = proj(cam, [x + .2, 1.1, G.d - .05]), b = proj(cam, [x + 1.8, 1.1, G.d - .05]); if (a && b) { line(c, [a[0], a[1], b[0], b[1]], Math.max(3, cam.f * .04 / a[2]), '#c9ced6'); const m = proj(cam, [x + 1, 1.05, G.d - .06]); if (m) { const r = Math.max(6, cam.f * .1 / m[2]); c.fillStyle = '#d9b84a'; rrect(c, m[0] - r * .6, m[1] - r * .2, r * 1.2, r, r * .2); c.fill(); c.lineWidth = 2; c.strokeStyle = OUT; c.stroke(); c.beginPath(); c.arc(m[0], m[1] - r * .2, r * .4, Math.PI, 0); c.lineWidth = Math.max(2, r * .18); c.strokeStyle = '#9aa0a8'; c.stroke(); } } }
  texQuad(S, makeTex('verriegelt', 600, 160, (cc, w, h) => { cc.fillStyle = '#d02a22'; cc.fillRect(0, 0, w, h); txt(cc, 'Notausgang verriegelt', w / 2, 70, 44, '#fff', 'center'); txt(cc, 'seit dem Einbruch', w / 2, 128, 34, '#ffd8d0', 'center'); }), [[6.2, 2.9, G.d - .02], [9.8, 2.9, G.d - .02], [9.8, 2.3, G.d - .02], [6.2, 2.3, G.d - .02]], { now: c, nx: 1, ny: 1, two: true, lit: false });
  // basketball hoops at both ends
  for (const z of [.4, G.d - .4]) { const d = z < 1 ? 1 : -1; solid(S, 7.1, 3.0, z, 1.8, 1.1, .05, '#f4f4f4', { bias: .5 }); solid(S, 7.9, 0, z - d * .0, .06, 3.0, .06, '#555', { bias: .6 }); push(S, depthOf(S, [8, 3.05, z + d * .3]), cc => { const p = proj(cam, [8, 3.05, z + d * .35]); if (!p) return; const r = cam.f * .23 / p[2]; cc.beginPath(); cc.ellipse(p[0], p[1], r, r * .3, 0, 0, TAU); cc.lineWidth = Math.max(2, r * .08); cc.strokeStyle = '#e0502a'; cc.stroke(); for (let i = 0; i < 7; i++) line(cc, [p[0] - r + i * r / 3, p[1], p[0] - r * .6 + i * r / 5, p[1] + r * 1.1], 1.5, 'rgba(255,255,255,.8)'); }); }
  // wall bars (Sprossenwand) along x = G.w
  for (let k = 0; k < 4; k++) { const z0 = 6 + k * 1.1; solid(S, G.w - .18, 0, z0, .12, 3.0, .06, '#c99a62'); solid(S, G.w - .18, 0, z0 + .95, .12, 3.0, .06, '#c99a62'); for (let i = 0; i < 12; i++) solid(S, G.w - .14, .2 + i * .24, z0, .04, .04, .95, '#d6a870', { ink: .4 }); }
  // mats stack (Turnmatten) in the dark corner next to the entrance, ball cart, benches
  matsStack(S, 4.3, .5); ballCart(S, 3.0, 2.6, t); for (const z of [9, 18]) solid(S, 1.0, 0, z, .35, .45, 3.0, '#c99a62', { cols: { top: '#d8aa70' } });
  // entrance (steel door) with the outside light; Technikraum above
  const D = G.door, open = o.door ?? 1;
  fc([[D[1], 2.6, .02], [D[0], 2.6, .02], [D[0], 0, .02], [D[1], 0, .02]], open > .05 ? '#fff6e0' : '#6f7882', [0, 0, 1], { emit: open > .05, ink: 1.5 });
  if (open > .05) { const p = proj(cam, [(D[0] + D[1]) / 2, 1.3, 0]); if (p) glow(c, p[0], p[1], cam.f * 2.5 / p[2], '255,240,210', .45 * open); }
  const ang = open * 1.4; face(S, [[D[0], 2.6, .03], [D[0] + Math.cos(ang) * 2.2, 2.6, -Math.sin(ang) * 2.2 + .03], [D[0] + Math.cos(ang) * 2.2, 0, -Math.sin(ang) * 2.2 + .03], [D[0], 0, .03]], '#8e98a4', { two: true, gloss: .2, bias: -.2, n: [0, 0, 1] });
  techRoom(S, c, t, o);
  if (o.cast) o.cast(S, t);
  flush(S, c);
  if (o.beams !== false) motes3D(S, c, [.5, .3, 1, 10, 6, 26], t, { n: 220, a: .6 * (o.beamA ?? 1), speed: .015 });
  return S;
}
function gymBeams(S, c, t, wins, a) {
  const D = V.mul(S.light.dir, -1), hit = p => { const k = -p[1] / D[1]; return [p[0] + D[0] * k, .004, p[2] + D[2] * k]; };
  c.save(); c.globalCompositeOperation = 'screen';
  for (const [z0, z1] of wins) {
    const top = [[0, 6.8, z0], [0, 6.8, z1]], bot = [[0, 5.0, z1], [0, 5.0, z0]];
    const sp = projPoly(S.cam, [top[0], top[1], bot[0], bot[1]].map(hit)); if (sp) { pathPoly(c, sp); c.fillStyle = `rgba(255,222,160,${.42 * a})`; c.fill(); }
    for (const v of [projPoly(S.cam, [top[0], top[1], hit(top[1]), hit(top[0])]), projPoly(S.cam, [bot[1], bot[0], hit(bot[0]), hit(bot[1])])]) if (v) { pathPoly(c, v); const g = c.createLinearGradient(v[0][0], v[0][1], v[2][0], v[2][1]); g.addColorStop(0, `rgba(255,232,180,${.2 * a})`); g.addColorStop(1, `rgba(255,232,180,${.04 * a})`); c.fillStyle = g; c.fill(); }
  }
  c.restore();
}
function matsStack(S, x, z) { for (let i = 0; i < 6; i++) solid(S, x - .1 + (i % 2) * .05, i * .2, z, 2.0, .2, 1.1, i % 2 ? '#3a5a9a' : '#2f4f86', { cols: { top: '#4a6ab0' }, bias: -.01 * i, ink: 1 }); }
function ballCart(S, x, z, t) { solid(S, x, .2, z, 1.0, .05, .6, '#8a9099'); for (const [dx, dz] of [[0, 0], [.95, 0], [0, .55], [.95, .55]]) solid(S, x + dx, 0, z + dz, .05, .9, .05, '#8a9099', { ink: .5 }); for (let i = 0; i < 6; i++) ball3D(S, [x + .2 + (i % 3) * .3, .4 + Math.floor(i / 3) * .25, z + .15 + (i % 2) * .3]); }
function techRoom(S, c, t, o) {
  const T = GYM.tech;
  solid(S, T.x0 - .2, T.y0 - .15, 0, T.x1 - T.x0 + .4, .15, T.z1 + .2, '#8a9099', { bias: .2 });
  // glass front (z = T.z1), frame, mixer + mic visible inside, red ON light
  const sp = projPoly(S.cam, [[T.x0, T.y1, T.z1], [T.x1, T.y1, T.z1], [T.x1, T.y0, T.z1], [T.x0, T.y0, T.z1]]);
  push(S, depthOf(S, [(T.x0 + T.x1) / 2, (T.y0 + T.y1) / 2, T.z1]) - .1, cc => { if (!sp) return; pathPoly(cc, sp); cc.fillStyle = 'rgba(60,80,100,.55)'; cc.fill(); cc.lineWidth = 4; cc.strokeStyle = '#5f6670'; cc.stroke(); const m = proj(S.cam, [T.x0 + .5, T.y1 - .2, T.z1]), n = proj(S.cam, [T.x0 + 1.6, T.y0 + .2, T.z1]); if (m && n) line(cc, [m[0], m[1], n[0], n[1]], 3, 'rgba(255,255,255,.35)'); if (o.onAir) { const p = proj(S.cam, [T.x0 + 2, T.y0 + 1.3, T.z1 - .3]); if (p) glow(cc, p[0], p[1], S.cam.f * .6 / p[2], '255,40,30', .9); } });
  solid(S, T.x0 + .6, T.y0, .3, 2.6, .9, .7, '#3a3f4a', { bias: .3 });
  // steel stairs up to it along the wall z = 0
  for (let i = 0; i < 14; i++) solid(S, T.x1 + .1 + i * .17, T.y0 - (i + 1) * (T.y0 / 14), .05, .3, .05, 1.0, '#7d8590', { ink: .5 });
  texQuad(S, makeTex('techsign', 500, 120, (cc, w, h) => { cc.fillStyle = '#2a2e36'; cc.fillRect(0, 0, w, h); txt(cc, 'Technikraum', w / 2, 82, 60, '#fff', 'center'); }), [[T.x1 - .8, T.y1 + .5, T.z1 + .01], [T.x0 + .8, T.y1 + .5, T.z1 + .01], [T.x0 + .8, T.y1 + .1, T.z1 + .01], [T.x1 - .8, T.y1 + .1, T.z1 + .01]], { nx: 1, ny: 1, two: true, lit: false, bias: -.3 });
}
// Technikraum interior close set (screen space with depth layers): old mixer, mic with red ON lamp, window to the hall
function techRoomInterior(c, t, o = {}) {
  const sh = shake(t, o.shake || 0);
  c.save(); c.translate(sh[0], sh[1]);
  let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4a4e58'); g.addColorStop(1, '#2a2d34'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // window into the hall with light beams
  c.save(); rrect(c, 120, 80, 1100, 460, 10); c.clip(); g = c.createLinearGradient(0, 80, 0, 540); g.addColorStop(0, '#e9dfcc'); g.addColorStop(1, '#d9a56a'); c.fillStyle = g; c.fillRect(120, 80, 1100, 460);
  c.globalCompositeOperation = 'screen'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(120 + i * 230, 80); c.lineTo(220 + i * 230, 80); c.lineTo(420 + i * 230, 540); c.lineTo(300 + i * 230, 540); c.closePath(); c.fillStyle = 'rgba(255,230,170,.35)'; c.fill(); } c.restore();
  rrect(c, 120, 80, 1100, 460, 10); c.lineWidth = 18; c.strokeStyle = '#6a707a'; c.stroke(); line(c, [670, 80, 670, 540], 12, '#6a707a');
  // desk + old mixing desk with faders and knobs
  c.fillStyle = '#5a4a3a'; c.fillRect(0, 640, W, H - 640); c.fillStyle = '#6e5a46'; c.fillRect(0, 620, W, 30);
  c.save(); c.translate(260, 560); c.transform(1, 0, -.25, 1, 0, 0); rrect(c, 0, 0, 1100, 260, 16); c.fillStyle = '#3a3f4a'; c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke();
  for (let i = 0; i < 12; i++) { const x = 60 + i * 85; for (let k = 0; k < 3; k++) { circle(c, x, 40 + k * 40, 13); fs(c, ['#d8453a', '#f2c230', '#9aa0a8'][k], 3); } line(c, [x, 150, x, 240], 6, '#1a1c20'); rrect(c, x - 16, 170 + Math.sin(i * 1.7 + (o.faders ? t * 2 : 0)) * 30, 32, 20, 4); c.fillStyle = '#e8e8e8'; c.fill(); }
  c.restore();
  // VU meters
  for (let i = 0; i < 2; i++) { rrect(c, 1380 + i * 170, 560, 150, 100, 10); c.fillStyle = '#f2e6b8'; c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke(); const lv = o.level ? .3 + Math.abs(Math.sin(t * 9 + i)) * .6 : .1; line(c, [1455 + i * 170, 645, 1455 + i * 170 + Math.cos(Math.PI * (1 - lv)) * 70, 645 - Math.sin(Math.PI * (1 - lv)) * 70], 4, '#d02a22'); }
  // the microphone on a stand + red ON lamp
  const mx = o.micX || 1520, my = 330;
  line(c, [mx, 640, mx, my + 120], 16, '#1f2228'); c.save(); c.translate(mx, my); c.rotate(-.25); rrect(c, -55, -110, 110, 220, 55); const mg = c.createLinearGradient(-55, 0, 55, 0); mg.addColorStop(0, '#8a8f98'); mg.addColorStop(.4, '#d8dce2'); mg.addColorStop(1, '#5a5f68'); c.fillStyle = mg; c.fill(); c.lineWidth = 7; c.strokeStyle = OUT; c.stroke(); for (let i = 0; i < 9; i++) line(c, [-48, -90 + i * 20, 48, -90 + i * 20], 3, 'rgba(20,20,20,.45)'); c.restore();
  rrect(c, 1700, 120, 160, 90, 14); c.fillStyle = '#2a2224'; c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke(); txt(c, 'ON AIR', 1780, 180, 38, o.onAir ? '#ff4a3a' : '#5a3a3a', 'center'); if (o.onAir) glow(c, 1780, 165, 220, '255,40,30', .7);
  circle(c, 1350, 610, 18); c.fillStyle = o.onAir ? '#ff3a2a' : '#5a2a2a'; c.fill(); if (o.onAir) glow(c, 1350, 610, 90, '255,40,30', .9);
  c.restore();
}

// ======================= FLOOR PLAN (paper plan, hand-drawn notes) =======================
// o: { path: 0..1 (Noah's dashed route), red: 0..1 (attacker dot route), falle: bool, locks: bool, alle: bool, rooms: 'closed', notes: [...] }
function floorPlan(c, t, t0, o = {}) {
  const a = clamp((t - t0) / .6); if (a <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  // the sheet unfolds (scaleY) on a dark desk
  c.fillStyle = 'rgba(20,18,30,.75)'; c.fillRect(0, 0, W, H);
  const pw = 1640, ph = 900, px = (W - pw) / 2, py = (H - ph) / 2 + 10, k = easeOut(a);
  c.translate(W / 2, H / 2); c.rotate(-.012); c.scale(.92 + .08 * k, k); c.translate(-W / 2, -H / 2);
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.fillStyle = '#f3ead6'; c.fillRect(px, py, pw, ph); c.shadowColor = 'transparent';
  for (let i = 0; i < 2; i++) line(c, [px + pw / 3 * (i + 1), py, px + pw / 3 * (i + 1), py + ph], 2, 'rgba(120,100,70,.18)'); line(c, [px, py + ph / 2, px + pw, py + ph / 2], 2, 'rgba(120,100,70,.18)');
  for (let x = px + 40; x < px + pw; x += 40) line(c, [x, py, x, py + ph], 1, 'rgba(60,110,170,.12)'); for (let y = py + 40; y < py + ph; y += 40) line(c, [px, y, px + pw, y], 1, 'rgba(60,110,170,.12)');
  txt(c, 'Lindenhof-Schule · Lageplan', px + 40, py + 60, 40, '#2a3f6a');
  const ink = '#2a3f6a', P = (x, y) => [px + x, py + y], wall = (pts, lw = 6) => line(c, pts.flatMap(([x, y]) => P(x, y)), lw, ink);
  const lab = (s, x, y, sz = 26, col = ink) => txt(c, s, px + x, py + y, sz, col, 'center');
  // main building (top) with rooms
  wall([[120, 110], [1180, 110], [1180, 330], [120, 330], [120, 110]]);
  wall([[300, 110], [300, 330]], 4); wall([[520, 110], [520, 330]], 4); wall([[880, 110], [880, 330]], 4); wall([[120, 220], [300, 220]], 3);
  lab('Raum 204', 210, 175, 28); lab('(2. Stock)', 210, 205, 20); lab('Treppenhaus', 410, 230); lab('Erdgeschoss –', 700, 205); lab('Klasse 5', 700, 240); lab('Schulleitung', 1030, 230);
  c.fillStyle = 'rgba(42,63,106,.12)'; c.fillRect(px + 302, py + 112, 216, 216); for (let i = 0; i < 6; i++) line(c, [px + 310, py + 300 - i * 32, px + 510, py + 300 - i * 32], 2, 'rgba(42,63,106,.5)');
  // main entrance + fire escape
  wall([[640, 330], [640, 360], [760, 360], [760, 330]], 4); lab('Haupteingang', 700, 395, 22);
  for (let i = 0; i < 6; i++) line(c, [px + 130 + i * 16, py + 335 + i * 14, px + 150 + i * 16, py + 335 + i * 14], 3, ink); lab('Feuertreppe', 165, 450, 22);
  // yard
  lab('Hof', 640, 560, 40, 'rgba(42,63,106,.5)'); c.setLineDash([6, 8]); wall([[90, 420], [1000, 420], [1000, 860], [90, 860], [90, 420]], 2); c.setLineDash([]);
  for (let i = 0; i < 6; i++) { circle(c, px + 330 + i * 26, py + 470, 9); c.lineWidth = 2; c.strokeStyle = ink; c.stroke(); } lab('Fahrräder', 400, 510, 20);
  // gym (right)
  const gx0 = 1080, gy0 = 470, gx1 = 1560, gy1 = 850;
  if (o.falle) { c.fillStyle = `rgba(208,42,34,${.12 + .08 * Math.sin(t * 6)})`; c.fillRect(px + gx0, py + gy0, gx1 - gx0, gy1 - gy0); }
  wall([[gx0, gy0], [gx1, gy0], [gx1, gy1], [gx0, gy1], [gx0, gy0]], 7); lab('Turnhalle', 1320, 690, 38);
  wall([[1110, gy0], [1110, 560], [1280, 560], [1280, gy0]], 3); lab('Technikraum', 1195, 525, 20); circle(c, px + 1250, py + 500, 8); c.fillStyle = '#d02a22'; c.fill();
  // steel door (left side of the gym, facing the yard) + back doors with lock icons
  line(c, [px + gx0, py + 640, px + gx0, py + 720], 12, '#7d8590'); lab('Stahltür', 1020, 690, 22);
  const lock = (x, y, red) => { c.save(); c.translate(px + x, py + y); c.fillStyle = red ? '#d02a22' : '#d9b84a'; rrect(c, -16, -6, 32, 26, 5); c.fill(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke(); c.beginPath(); c.arc(0, -6, 10, Math.PI, 0); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke(); c.restore(); };
  if (o.locks) { lock(1360, gy1 + 2, true); lock(1480, gy1 + 2, true); lab('verriegelt', 1420, gy1 + 44, 22, '#d02a22'); }
  if (o.lockFront) lock(gx0 - 2, 680, false);
  // Noah's route (dashed, animated) from Raum 204 down the fire escape, behind the bikes, to the gym
  const route = [[210, 300], [160, 340], [150, 430], [250, 470], [500, 480], [800, 520], [990, 640], [1075, 680]];
  if (o.path > 0) dashedPath(c, route.map(([x, y]) => P(x, y)), o.path, '#2f8a4a', 'Noah');
  // attacker route (red dot): ground floor -> yard -> gym
  const rroute = [[700, 250], [700, 340], [760, 420], [900, 560], [1060, 690], [1200, 700], [1330, 660]];
  if (o.red > 0) { const pt = alongPath(rroute.map(([x, y]) => P(x, y)), o.red); circle(c, pt[0], pt[1], 16 + Math.sin(t * 10) * 3); c.fillStyle = '#d02a22'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); glow(c, pt[0], pt[1], 60, '255,40,30', .6); }
  if (o.redSearch) { const pt = P(700 + Math.sin(t * 2.2) * 120, 220 + Math.cos(t * 1.7) * 60); circle(c, pt[0], pt[1], 16); c.fillStyle = '#d02a22'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); glow(c, pt[0], pt[1], 60, '255,40,30', .6); txt(c, '?', pt[0] + 22, pt[1] - 18, 34, '#d02a22'); }
  // hand-drawn notes / circles / arrows
  for (const n of o.notes || []) { const b = clamp((t - n.t) / .4); if (b <= 0) continue; c.save(); c.globalAlpha = b;
    if (n.circle) { c.beginPath(); for (let i = 0; i <= 40 * b; i++) { const an = i / 40 * TAU * 1.08, r = n.r * (1 + Math.sin(i * .7) * .03); c.lineTo(px + n.circle[0] + Math.cos(an) * r * 1.3, py + n.circle[1] + Math.sin(an) * r); } c.lineWidth = 6; c.strokeStyle = n.col || '#d02a22'; c.stroke(); }
    if (n.arrow) { const [x0, y0, x1, y1] = n.arrow, xm = (x0 + x1) / 2, ym = Math.min(y0, y1) - 60; c.beginPath(); c.moveTo(px + x0, py + y0); c.quadraticCurveTo(px + xm, py + ym, px + lerp(x0, x1, b), py + lerp(y0, y1, b)); c.lineWidth = 6; c.strokeStyle = n.col || '#d02a22'; c.stroke(); if (b >= 1) { const ang = Math.atan2(y1 - ym, x1 - xm); c.beginPath(); c.moveTo(px + x1, py + y1); c.lineTo(px + x1 - Math.cos(ang - .4) * 26, py + y1 - Math.sin(ang - .4) * 26); c.lineTo(px + x1 - Math.cos(ang + .4) * 26, py + y1 - Math.sin(ang + .4) * 26); c.closePath(); c.fillStyle = n.col || '#d02a22'; c.fill(); } }
    if (n.text) { c.translate(px + n.x, py + n.y); c.rotate(n.rot || -.04); c.font = FONT(n.size || 40); c.fillStyle = n.col || '#d02a22'; c.textAlign = 'center'; c.transform(1, 0, -.15, 1, 0, 0); c.fillText(n.text, 0, 0); }
    c.restore(); }
  if (o.speaker) { for (const [x, y] of [[210, 160], [410, 160], [700, 160], [1030, 160]]) { for (let i = 0; i < 3; i++) { const ph = (t * 1.5 + i / 3) % 1; c.beginPath(); c.arc(px + x, py + y, 10 + ph * 50, 0, TAU); c.lineWidth = 3; c.strokeStyle = `rgba(208,42,34,${1 - ph})`; c.stroke(); } } }
  if (o.closed) for (const [x, y] of [[210, 250], [700, 280], [1030, 280]]) { c.save(); c.translate(px + x, py + y); c.fillStyle = '#2f8a4a'; rrect(c, -60, -18, 120, 36, 8); c.fill(); txt(c, 'bleibt zu', 0, 9, 22, '#fff', 'center'); c.restore(); }
  c.restore();
}
function alongPath(pts, u) { let L = 0; const segs = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); L += d; } let r = clamp(u) * L; for (let i = 0; i < segs.length; i++) { if (r <= segs[i]) { const f = r / segs[i]; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; } r -= segs[i]; } return pts[pts.length - 1]; }
function dashedPath(c, pts, u, col, label) {
  let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  c.save(); c.setLineDash([18, 14]); c.lineDashOffset = 0; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); let r = clamp(u) * L;
  for (let i = 1; i < pts.length && r > 0; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); const f = Math.min(1, r / d); c.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); r -= d; }
  c.lineWidth = 7; c.strokeStyle = col; c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
  const e = alongPath(pts, u); circle(c, e[0], e[1], 14); c.fillStyle = col; c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); if (label) txt(c, label, e[0], e[1] - 24, 26, col, 'center');
  c.restore();
}
