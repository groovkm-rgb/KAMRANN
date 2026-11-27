// Noah's bedroom, the street with the bus stop, the city bus (outside + inside). All text German.
// ---------- extra cast ----------
HAIR.bun = {
  back(c, P) { },
  front(c, P, back) {
    const cy = -1240, R = 262;
    c.beginPath(); c.arc(0, cy - 300, 95, 0, TAU); nFill(c, P.hair, NOAH.W * .8);
    c.beginPath(); c.moveTo(-R + 2, cy - 10); c.bezierCurveTo(-R - 8, cy - 200, -160, cy - 290, 0, cy - 288); c.bezierCurveTo(160, cy - 290, R + 8, cy - 200, R - 2, cy - 10);
    if (back) { c.lineTo(R - 10, cy + 100); c.lineTo(-R + 10, cy + 100); } else { c.lineTo(R - 26, cy - 60); c.quadraticCurveTo(150, cy - 180, 0, cy - 170); c.quadraticCurveTo(-150, cy - 180, -R + 26, cy - 60); }
    c.closePath(); nFill(c, P.hair, NOAH.W * .8);
    c.save(); c.clip(); for (let i = 0; i < 9; i++) { const x = -200 + i * 50; nLine(c, [x * .3, cy - 285, x, cy - 60], 4, shade(P.hair, i % 2 ? -.25 : .2)); } c.restore();
  }
};
CAST.mama = { hairStyle: 'bun', hair: '#5a3a2a', top: '#7d4f9e', kind: 'sweater', sleeve: 'long', pants: '#3c5a86', shoe: '#2a2420', scale: 1.0, tall: 1.1 };
CAST.yilmaz = { hairStyle: 'bun', hair: '#2a2220', top: '#f4f4f4', kind: 'overall', sleeve: 'long', pants: '#e8e8e8', shoe: '#ddd', scale: 1.02, tall: 1.08 };
CAST.polizistin = { hairStyle: 'bun', hair: '#c9a060', top: '#2f4f86', kind: 'plain', sleeve: 'long', pants: '#2a3550', shoe: '#1a1a1a', scale: 1.02, tall: 1.12 };
CAST.kid5a = { hairStyle: 'messy', hair: '#2a1e18', top: '#e05a4a', kind: 'hoodie', sleeve: 'long', pants: '#3e5a86', shoe: '#fff', scale: .82 };
CAST.kid5b = { hairStyle: 'long', hair: '#e8c070', top: '#5ab0d0', kind: 'sweater', sleeve: 'long', pants: '#6a4a8a', shoe: '#e05a9a', scale: .8 };

// ---------- Noah lying in bed (head on the pillow + blanket) ----------
function noahInBed(S, headPos, o = {}) {
  // body under the blanket: a soft mound from the shoulders to the feet (bed runs along -z from the pillow)
  const cam = S.cam, len = 1.45, mound = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12; mound.push([headPos[0], .7 + .14 * Math.sin(Math.min(1, u * 1.6) * Math.PI * .5) * (1 - u * .4) + (u > .85 ? .05 : 0), headPos[2] - .3 - u * len]); }
  push(S, depthOf(S, headPos) + .25, c => {
    const sp = mound.map(p => proj(cam, p)).filter(Boolean); if (sp.length < 2) return;
    const w = cam.f * .5 / sp[Math.floor(sp.length / 2)][2];
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    const path = () => { c.beginPath(); c.moveTo(sp[0][0], sp[0][1]); for (let i = 1; i < sp.length; i++) c.lineTo(sp[i][0], sp[i][1]); };
    path(); c.lineWidth = w + 6; c.strokeStyle = OUT; c.stroke(); path(); c.lineWidth = w; c.strokeStyle = '#4a7fc4'; c.stroke();
    path(); c.lineWidth = w * .35; c.strokeStyle = 'rgba(255,255,255,.18)'; c.stroke(); // soft highlight along the top
    for (let i = 2; i < sp.length - 1; i += 3) line(c, [sp[i][0] - w * .3, sp[i][1] - w * .15, sp[i][0] + w * .3, sp[i][1] + w * .15], 2, 'rgba(20,40,80,.35)'); // folds
    c.restore();
  });
  // head: its top points to the headboard (+z) in screen space, face towards the camera
  billboard(S, headPos, (c, sc, sp) => {
    const k = sc * KID_H / RIG_H, up = proj(cam, [headPos[0], headPos[1], headPos[2] + .3]);
    const ang = up ? Math.atan2(up[0] - sp[0], -(up[1] - sp[1])) : 0;
    drawLit(c, cc => drawNoahHead(cc, 0, 0, k, o.expr || { eyes: 'closed', mouth: 'soft' }, ang + (o.tilt || 0)), { light: o.light || [1, -.3], bounds: [sp[0] - k * 700, sp[1] - k * 700, sp[0] + k * 700, sp[1] + k * 700], rimA: .35, rim: '255,200,150', rimInset: 13 * 1.8 * k, rimW: 4 });
  }, { bias: .1 });
}
// ---------- BEDROOM: x 0..4.2, z 0..4.6, h 2.6. Bed along x = 0 (head at z 4.4), window in the wall x = 4.2, door in the wall z = 0 ----------
const ROOMB = { w: 4.2, d: 4.6, h: 2.6 };
function texWallpaper() { return makeTex('wallp', 512, 512, (c, w, h) => { c.fillStyle = '#c9d9e6'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { const x = rnd(i) * w, y = rnd(i + 2) * h, r = 6 + rnd(i + 4) * 6; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); } }); }
function texPosterGame() { return makeTex('pgame', 500, 700, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a1f5a'); g.addColorStop(1, '#d0466a'); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { c.fillStyle = '#fff'; c.fillRect(rnd(i) * w, rnd(i + 1) * h * .5, 3, 3); } c.beginPath(); c.arc(w / 2, 380, 120, 0, TAU); c.fillStyle = '#ffb84a'; c.fill(); txt(c, 'GALAXIE', w / 2, 120, 76, '#fff', 'center'); txt(c, 'RAKETEN', w / 2, 600, 56, '#ffe08a', 'center'); }); }
function texPosterBall() { return makeTex('pball', 500, 700, (c, w, h) => { c.fillStyle = '#2f8a4a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#2f8a4a' : '#3a9a56'; c.fillRect(0, i * 90, w, 90); } c.beginPath(); c.arc(w / 2, 360, 120, 0, TAU); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#222'; c.stroke(); txt(c, 'FC Lindenhof', w / 2, 110, 54, '#fff', 'center'); }); }
function bedroomFrame(c, t, cam, o = {}) {
  const R = ROOMB, tod = o.tod || 'dawn';
  const L = tod === 'night' ? { dir: V.norm([-.8, .5, -.2]), col: [150, 170, 230], amb: .42, ambCol: [70, 85, 140], ink: 1.2, inkA: .5 } : { dir: V.norm([-.85, .35, -.3]), col: [255, 200, 150], amb: .6, ambCol: [150, 160, 210], ink: 1.2, inkA: .5 };
  const S = scene(cam, Object.assign(L, o.light || {}));
  // shell
  drawFace(S, c, [[0, 0, R.d], [R.w, 0, R.d], [R.w, 0, 0], [0, 0, 0]], '#b98a5e', [0, 1, 0], { ink: 0, after: (cc, sp) => { cc.save(); cc.clip(); for (let i = 0; i < 14; i++) { const a = proj(cam, [i * .3, 0, 0]), b = proj(cam, [i * .3, 0, R.d]); if (a && b) line(cc, [a[0], a[1], b[0], b[1]], 1.5, 'rgba(80,50,30,.35)'); } cc.restore(); } });
  drawFace(S, c, [[0, R.h, 0], [R.w, R.h, 0], [R.w, R.h, R.d], [0, R.h, R.d]], '#f2efe8', [0, -1, 0], { ink: 0, extra: .1 });
  for (const [P, n] of [[[[0, 0, R.d], [0, R.h, R.d], [R.w, R.h, R.d], [R.w, 0, R.d]], [0, 0, -1]], [[[R.w, 0, 0], [R.w, R.h, 0], [0, R.h, 0], [0, 0, 0]], [0, 0, 1]], [[[0, 0, 0], [0, R.h, 0], [0, R.h, R.d], [0, 0, R.d]], [1, 0, 0]], [[[R.w, 0, R.d], [R.w, R.h, R.d], [R.w, R.h, 0], [R.w, 0, 0]], [-1, 0, 0]]])
    texQuad(S, texWallpaper(), [P[1], P[2], P[3], P[0]], { now: c, nx: 3, ny: 2, n });
  // window (x = R.w) with sky + curtains
  const wz0 = 1.4, wz1 = 3.0, wy0 = .9, wy1 = 2.2;
  texQuad(S, makeTex('skywin_' + tod, 400, 300, (cc, w, h) => { const g = cc.createLinearGradient(0, 0, 0, h); if (tod === 'night') { g.addColorStop(0, '#0d1430'); g.addColorStop(1, '#2a3560'); } else { g.addColorStop(0, '#6f8fc8'); g.addColorStop(.6, '#f4b98a'); g.addColorStop(1, '#ffd9a0'); } cc.fillStyle = g; cc.fillRect(0, 0, w, h); for (let i = 0; i < 10; i++) { cc.fillStyle = tod === 'night' ? '#1a2240' : '#7d6a8a'; const bh = 40 + rnd(i) * 90; cc.fillRect(i * 42, h - bh, 36, bh); if (tod === 'night') for (let k = 0; k < 4; k++) if (rnd(i * 5 + k) > .5) { cc.fillStyle = '#ffd98a'; cc.fillRect(i * 42 + 6 + (k % 2) * 14, h - bh + 10 + k * 16, 8, 8); } } if (tod === 'night') { cc.beginPath(); cc.arc(320, 60, 26, 0, TAU); cc.fillStyle = '#f4f1d8'; cc.fill(); } }), [[R.w - .01, wy1, wz1], [R.w - .01, wy1, wz0], [R.w - .01, wy0, wz0], [R.w - .01, wy0, wz1]], { now: c, nx: 1, ny: 1, lit: false, two: true });
  // window frame + cross + curtains
  for (const P of [[[R.w - .02, wy1 + .06, wz0 - .06], [R.w - .02, wy1 + .06, wz1 + .06]], [[R.w - .02, wy0 - .06, wz0 - .06], [R.w - .02, wy0 - .06, wz1 + .06]], [[R.w - .02, wy0, (wz0 + wz1) / 2], [R.w - .02, wy1, (wz0 + wz1) / 2]], [[R.w - .02, (wy0 + wy1) / 2, wz0], [R.w - .02, (wy0 + wy1) / 2, wz1]]]) { const a = proj(cam, P[0]), b = proj(cam, P[1]); if (a && b) line(c, [a[0], a[1], b[0], b[1]], Math.max(3, cam.f * .05 / a[2]), '#f4f1ea'); }
  for (const [z0, z1] of [[wz0 - .45, wz0 + .1], [wz1 - .1, wz1 + .45]]) { const sp = projPoly(cam, [[R.w - .05, wy1 + .25, z0], [R.w - .05, wy1 + .25, z1], [R.w - .05, .6, z1], [R.w - .05, .6, z0]]); if (sp) { pathPoly(c, sp); c.fillStyle = tod === 'night' ? '#3a3f6a' : '#e07a5a'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(0,0,0,.4)'; c.stroke(); } }
  { const p = proj(cam, [R.w, 1.55, 2.2]); if (p) glow(c, p[0], p[1], cam.f * 1.6 / p[2], tod === 'night' ? '120,150,255' : '255,200,140', tod === 'night' ? .25 : .5); }
  // light patch on the floor/bed from the window (dawn)
  if (tod !== 'night') { const D = V.mul(S.light.dir, -1); const hit = p => { const k = -p[1] / D[1]; return [p[0] + D[0] * k, .003, p[2] + D[2] * k]; }; const sp = projPoly(cam, [[R.w, wy1, wz0], [R.w, wy1, wz1], [R.w, wy0, wz1], [R.w, wy0, wz0]].map(hit)); if (sp) { c.save(); c.globalCompositeOperation = 'screen'; pathPoly(c, sp); c.fillStyle = 'rgba(255,190,130,.3)'; c.fill(); c.restore(); } }
  // posters + shelf
  texQuad(S, texPosterGame(), [[.01, 2.1, .7], [.01, 2.1, 1.4], [.01, 1.1, 1.4], [.01, 1.1, .7]], { now: c, nx: 1, ny: 1, n: [1, 0, 0], two: true });
  texQuad(S, texPosterBall(), [[1.0, 2.1, R.d - .01], [1.7, 2.1, R.d - .01], [1.7, 1.1, R.d - .01], [1.0, 1.1, R.d - .01]], { now: c, nx: 1, ny: 1, n: [0, 0, -1] });
  // bed with blanket + pillow, nightstand with alarm clock, desk, chair, wardrobe, rug, door
  if (!o.noBed) { solid(S, .05, 0, 1.6, 1.05, .35, 2.25, '#8a5a3a'); solid(S, .05, .35, 1.6, 1.05, .18, 2.2, '#f4f1ea'); solid(S, .05, 0, 3.85, 1.05, .9, .1, '#8a5a3a'); }
  solid(S, .08, 0, 4.0, .55, .55, .5, '#c99a68'); solid(S, .12, .25, 4.05, .45, .05, .4, '#a0744c');
  alarmClock3D(S, [.36, .55, 4.22], t, o);
  solid(S, 2.6, .74, 3.9, 1.4, .05, .65, '#e8e2d6'); for (const [x, z] of [[2.62, 3.92], [3.95, 3.92], [2.62, 4.5], [3.95, 4.5]]) solid(S, x, 0, z, .04, .74, .04, '#666');
  solid(S, 2.85, .79, 4.15, .5, .32, .03, '#2a2e36', { bias: -.05 }); solid(S, 3.5, .79, 4.05, .3, .12, .22, '#e05a4a', { bias: -.05 });
  solid(S, 3.0, .45, 3.3, .45, .05, .45, '#d24a3a'); solid(S, 3.0, .45, 3.3, .45, .5, .05, '#d24a3a', { bias: .05 });
  solid(S, 3.3, 0, .1, .85, 2.0, .55, '#e6dccb', { post: cc => { const a = proj(cam, [3.72, .4, .66]), b = proj(cam, [3.72, 1.8, .66]); if (a && b) line(cc, [a[0], a[1], b[0], b[1]], 1.5, 'rgba(0,0,0,.4)'); } });
  { const sp = projPoly(cam, [[1.5, .004, 1.2], [3.0, .004, 1.2], [3.0, .004, 2.8], [1.5, .004, 2.8]]); if (sp) { pathPoly(c, sp); c.fillStyle = '#d88a4a'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(0,0,0,.3)'; c.stroke(); } }
  // backpack + clothes on the floor
  solid(S, 2.2, 0, 3.7, .32, .4, .2, '#2f6fb0', { cols: { top: '#244f80' } }); solid(S, 1.7, 0, 1.7, .5, .06, .4, '#3a3a3a', { bias: -.02 });
  // door in the wall z = 0 (opens inward by o.door 0..1), hallway light behind it
  const dx0 = 1.2, dx1 = 2.1, dh = 2.05, ang = (o.door || 0) * 1.55;
  drawFace(S, c, [[dx1, dh, .01], [dx0, dh, .01], [dx0, 0, .01], [dx1, 0, .01]], o.door ? '#ffe3b0' : '#a07a58', [0, 0, 1], { emit: !!o.door, ink: 1 });
  if (o.door) { const g = proj(cam, [1.65, 1.2, 0]); if (g) glow(c, g[0], g[1], cam.f * 1.6 / g[2], '255,220,160', .5); }
  face(S, [[dx0 + Math.cos(ang) * .9, dh, Math.sin(ang) * .9 + .02], [dx0, dh, .02], [dx0, 0, .02], [dx0 + Math.cos(ang) * .9, 0, Math.sin(ang) * .9 + .02]], '#c79a6e', { two: true, n: V.norm([Math.sin(ang), 0, -Math.cos(ang) * -1]), bias: -.2 });
  if (o.cast) o.cast(S, t);
  flush(S, c);
  return S;
}
function alarmClock3D(S, p, t, o) {
  const ring = o.ringing ? Math.sin(t * 60) * .012 : 0, x = p[0] + ring, y = p[1], z = p[2];
  solid(S, x - .12, y, z - .06, .24, .14, .12, '#d8453a', { bias: -.1 });
  texQuad(S, makeTex('lcd' + (o.clockText || '06:45'), 240, 110, (cc, w, h) => { cc.fillStyle = '#141414'; cc.fillRect(0, 0, w, h); cc.font = FONT(78); cc.fillStyle = '#ff4a3a'; cc.textAlign = 'center'; cc.shadowColor = '#ff2a1a'; cc.shadowBlur = 14; cc.fillText(o.clockText || '06:45', w / 2, 84); }), [[x - .1, y + .12, z - .061], [x + .1, y + .12, z - .061], [x + .1, y + .025, z - .061], [x - .1, y + .025, z - .061]], { nx: 1, ny: 1, lit: false, bias: -.12 });
  solid(S, x - .05, y + .14, z - .03, .1, .025, .06, '#f2c230', { bias: -.13 }); // snooze button
}
// ---------- STREET: houses (z = 12 facades), road, sidewalk (z 0..3), bus stop at x = 4 ----------
function texHouses() { return makeTex('houses', 2400, 600, (c, w, h) => {
  const cols = ['#e7c9a0', '#cfd8c6', '#e8b8a8', '#d6d0e8', '#f0e0b0', '#c8dde8'];
  for (let i = 0; i < 8; i++) { const x = i * 300; c.fillStyle = cols[i % 6]; c.fillRect(x, 80, 300, h - 80); c.fillStyle = shade(cols[(i + 3) % 6], -.4); c.beginPath(); c.moveTo(x - 10, 90); c.lineTo(x + 150, 0); c.lineTo(x + 310, 90); c.fill();
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { if (r === 2 && k === 1) continue; c.fillStyle = '#f4f1e8'; c.fillRect(x + 30 + k * 90, 140 + r * 140, 60, 80); const g = c.createLinearGradient(0, 140 + r * 140, 0, 220 + r * 140); g.addColorStop(0, '#9ec2e0'); g.addColorStop(1, '#5a7a9a'); c.fillStyle = g; c.fillRect(x + 36, 146 + r * 140, 48, 68); c.fillRect(x + 36 + k * 90 - 0, 146 + r * 140, 0, 0); c.fillStyle = g; c.fillRect(x + 36 + k * 90, 146 + r * 140, 48, 68); if (rnd(i * 9 + r * 3 + k) > .5) { c.fillStyle = '#e06a5a'; c.fillRect(x + 30 + k * 90, 218 + r * 140, 60, 10); } }
    c.fillStyle = '#7a5038'; c.fillRect(x + 125, h - 120, 50, 120); }
}); }
function streetFrame(c, t, cam, o = {}) {
  const S = scene(cam, Object.assign({}, TOD.morning.light, { dir: V.norm([.5, .45, -.6]) }));
  skyAndCity(c, cam, 'morning', t);
  texQuad(S, texHouses(), [[-30, 9, 14], [30, 9, 14], [30, 0, 14], [-30, 0, 14]], { now: c, nx: 8, ny: 1, n: [0, 0, -1] });
  drawFace(S, c, [[-60, 0, 14], [60, 0, 14], [60, 0, 3], [-60, 0, 3]], '#5f6266', [0, 1, 0], { ink: 0 });
  for (let x = -60; x < 60; x += 3) { const sp = projPoly(cam, [[x, .003, 8.45], [x + 1.6, .003, 8.45], [x + 1.6, .003, 8.55], [x, .003, 8.55]]); if (sp) { pathPoly(c, sp); c.fillStyle = '#f4f1e6'; c.fill(); } }
  drawFace(S, c, [[-60, .12, 3], [60, .12, 3], [60, .12, -6], [-60, .12, -6]], '#c4bfb4', [0, 1, 0], { ink: 0, after: (cc) => { for (let x = -30; x < 30; x += 1.2) { const a = proj(cam, [x, .121, 3]), b = proj(cam, [x, .121, -6]); if (a && b) line(cc, [a[0], a[1], b[0], b[1]], 1, 'rgba(0,0,0,.15)'); } } });
  solid(S, -60, 0, 2.9, 120, .12, .15, '#a9a49a', { bias: 5 });
  for (const x of [-14, -4, 9, 19]) tree3D(S, x, -1.5, .9, t);
  // bus stop: pole with H sign, shelter
  solid(S, 4, .12, 1.8, .07, 2.6, .07, '#8a9099');
  texQuad(S, makeTex('hst', 300, 300, (cc, w, h) => { cc.fillStyle = '#f2c230'; cc.beginPath(); cc.arc(w / 2, h / 2, w / 2 - 6, 0, TAU); cc.fill(); cc.fillStyle = '#2a7a3a'; cc.beginPath(); cc.arc(w / 2, h / 2, w / 2 - 24, 0, TAU); cc.fill(); txt(cc, 'H', w / 2, 200, 170, '#f2c230', 'center'); }), [[3.7, 3.1, 1.79], [4.37, 3.1, 1.79], [4.37, 2.45, 1.79], [3.7, 2.45, 1.79]], { nx: 1, ny: 1, two: true, lit: false });
  texQuad(S, makeTex('hstname', 500, 120, (cc, w, h) => { cc.fillStyle = '#fff'; cc.fillRect(0, 0, w, h); txt(cc, 'Lindenstraße', w / 2, 80, 56, '#2a2a33', 'center'); }), [[3.6, 2.4, 1.79], [4.5, 2.4, 1.79], [4.5, 2.2, 1.79], [3.6, 2.2, 1.79]], { nx: 1, ny: 1, two: true });
  solid(S, 5.2, .12, -1.2, 3.2, .08, 1.4, '#8a9099'); solid(S, 5.2, 2.4, -1.2, 3.2, .06, 1.4, '#7a8590');
  texQuad(S, makeTex('glass', 64, 64, (cc, w, h) => { cc.fillStyle = 'rgba(200,225,240,.45)'; cc.fillRect(0, 0, w, h); }), [[5.2, 2.4, -1.18], [8.4, 2.4, -1.18], [8.4, .2, -1.18], [5.2, .2, -1.18]], { nx: 1, ny: 1, two: true, lit: false });
  if (o.bus != null) bus3D(S, o.bus, 6.2, t);
  if (o.cast) o.cast(S, t);
  flush(S, c);
  return S;
}
function texBusSide() { return makeTex('busside', 1200, 300, (c, w, h) => {
  c.fillStyle = '#f2c230'; c.fillRect(0, 0, w, h); c.fillStyle = '#e0a820'; c.fillRect(0, h - 70, w, 70);
  for (let i = 0; i < 6; i++) { const g = c.createLinearGradient(0, 30, 0, 170); g.addColorStop(0, '#cfe6f4'); g.addColorStop(1, '#5a7a9a'); c.fillStyle = g; c.fillRect(40 + i * 190, 30, 160, 140); c.strokeStyle = '#333'; c.lineWidth = 6; c.strokeRect(40 + i * 190, 30, 160, 140); }
  txt(c, '7  Lindenhof-Schule', w / 2, h - 22, 40, '#2a2a33', 'center');
}); }
function bus3D(S, x, z, t) {
  const L = 11, Hh = 3.0, D = 2.5, x0 = x - L / 2;
  texQuad(S, texBusSide(), [[x0, Hh, z], [x0 + L, Hh, z], [x0 + L, .45, z], [x0, .45, z]], { nx: 4, ny: 1, n: [0, 0, -1], bias: -1 });
  solid(S, x0, .45, z, L, Hh - .45, D, '#f2c230', { skip: ['front'], bias: 0, cols: { top: '#d8d8d8', right: '#e9b828' } });
  texQuad(S, makeTex('busfront', 300, 300, (c, w, h) => { c.fillStyle = '#f2c230'; c.fillRect(0, 0, w, h); const g = c.createLinearGradient(0, 0, 0, 160); g.addColorStop(0, '#cfe6f4'); g.addColorStop(1, '#4a6a8a'); c.fillStyle = g; c.fillRect(20, 40, 260, 140); c.fillStyle = '#111'; c.fillRect(30, 6, 240, 30); c.font = FONT(24); c.fillStyle = '#ffa53a'; c.fillText('7 Lindenhof-Schule', 40, 30); c.fillStyle = '#fff'; c.beginPath(); c.arc(50, 240, 18, 0, TAU); c.arc(250, 240, 18, 0, TAU); c.fill(); }), [[x0 + L, Hh, z], [x0 + L, Hh, z + D], [x0 + L, .45, z + D], [x0 + L, .45, z]], { nx: 1, ny: 1, n: [1, 0, 0], bias: -1.2 });
  for (const wx of [x0 + 2, x0 + L - 2]) cylinder(S, wx, .45, z - .02, .45, .02, '#1a1a1a', { seg: 12 }) ;
  for (const wx of [x0 + 2, x0 + L - 2]) push(S, depthOf(S, [wx, .45, z]) - .5, c => { const p = proj(S.cam, [wx, .45, z - .03]); if (p) { const r = S.cam.f * .45 / p[2]; circle(c, p[0], p[1], r); c.fillStyle = '#1a1a1a'; c.fill(); circle(c, p[0], p[1], r * .5); c.fillStyle = '#9aa0a8'; c.fill(); } });
}
// ---------- BUS INTERIOR: x 0..2.5 (window x = 0 and x = 2.5), z 0..10, floor y 0, ceiling 2.2 ----------
function busInteriorFrame(c, t, cam, o = {}) {
  const S = scene(cam, Object.assign({}, { dir: V.norm([-.8, .5, .2]), col: [255, 232, 190], amb: .62, ambCol: [170, 180, 220], ink: 1.2, inkA: .5 }, o.light || {}));
  const fc = (P, col, n, oo = {}) => drawFace(S, c, P, col, n, Object.assign({ ink: 0 }, oo));
  fc([[0, 0, 10], [2.5, 0, 10], [2.5, 0, 0], [0, 0, 0]], '#5d6066', [0, 1, 0]);
  fc([[0, 2.2, 0], [2.5, 2.2, 0], [2.5, 2.2, 10], [0, 2.2, 10]], '#e9e6e0', [0, -1, 0], { extra: .15 });
  // window bands with the city passing by (scrolling)
  const scroll = (t * .35) % 1;
  const city = makeTex('buscity', 2000, 500, (cc, w, h) => { const g = cc.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9fcbef'); g.addColorStop(1, '#f6e2b8'); cc.fillStyle = g; cc.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { const bw = 50 + rnd(i) * 80, bh = 120 + rnd(i + 3) * 260; cc.fillStyle = ['#d6b08a', '#c4ccd6', '#e0c0b0', '#b8c8a8'][i % 4]; cc.fillRect(i * 50, h - bh, bw, bh); for (let r = 0; r < bh / 40 - 1; r++) { cc.fillStyle = 'rgba(80,110,150,.6)'; cc.fillRect(i * 50 + 8, h - bh + 12 + r * 40, 14, 18); } } for (let i = 0; i < 12; i++) { cc.beginPath(); cc.arc(i * 170 + 40, h - 60, 50, 0, TAU); cc.fillStyle = '#5f9a46'; cc.fill(); } });
  for (const [x, n, sgn] of [[0, [1, 0, 0], 1], [2.5, [-1, 0, 0], -1]]) {
    for (let k = 0; k < 4; k++) {
      const z0 = .6 + k * 2.3, z1 = z0 + 2.0, P = sgn > 0 ? [[x + .01, 1.95, z1], [x + .01, 1.95, z0], [x + .01, 1.0, z0], [x + .01, 1.0, z1]] : [[x - .01, 1.95, z0], [x - .01, 1.95, z1], [x - .01, 1.0, z1], [x - .01, 1.0, z0]];
      const u0 = ((k * .23 + scroll) % 1), img = TEX['bcw' + k + x] || (TEX['bcw' + k + x] = Object.assign(document.createElement('canvas'), { width: 500, height: 250 })), ic = img.getContext('2d');
      ic.drawImage(city, -u0 * 2000 * sgn, 0, 2000, 250); ic.drawImage(city, -u0 * 2000 * sgn + 2000 * sgn, 0, 2000, 250);
      drawTexQuad(S, c, img, P, { nx: 1, ny: 1, lit: false }, n);
    }
    fc(sgn > 0 ? [[x + .005, 1.0, 10], [x + .005, 1.0, 0], [x + .005, 0, 0], [x + .005, 0, 10]] : [[x - .005, 1.0, 0], [x - .005, 1.0, 10], [x - .005, 0, 10], [x - .005, 0, 0]], '#c9c4bb', n);
    fc(sgn > 0 ? [[x + .005, 2.2, 10], [x + .005, 2.2, 0], [x + .005, 1.95, 0], [x + .005, 1.95, 10]] : [[x - .005, 2.2, 0], [x - .005, 2.2, 10], [x - .005, 1.95, 10], [x - .005, 1.95, 0]], '#d9d4cb', n);
  }
  // seats (blue with pattern), yellow poles, stop buttons, display
  for (let r = 0; r < 5; r++) for (const sx of [.15, 1.55]) { const z = 1 + r * 1.8; solid(S, sx, .45, z, .8, .12, .5, '#2f5a9a', { cols: { top: '#3a6ab0' } }); solid(S, sx, .45, z + .45, .8, .75, .1, '#2f5a9a', { cols: { front: '#3a6ab0' }, post: cc => { const p = proj(S.cam, [sx + .4, .95, z + .44]); if (p) { const rr = S.cam.f * .06 / p[2]; for (let i = 0; i < 5; i++) { cc.fillStyle = ['#f2c230', '#e05a4a', '#5ab0d0'][i % 3]; cc.fillRect(p[0] - rr * 2 + i * rr, p[1] - rr * .3, rr * .4, rr * .4); } } } }); solid(S, sx + .05, 0, z + .1, .7, .45, .35, '#3a3d44'); }
  for (let r = 0; r < 4; r++) { solid(S, 1.22, 0, 1.9 + r * 1.8, .05, 2.2, .05, '#f2c230', { ink: .6 }); solid(S, 1.215, 1.4, 1.83 + r * 1.8, .06, .07, .05, '#d0281e'); }
  solid(S, .2, 2.05, 0, 2.1, .05, 10, '#f2c230', { ink: .5 });
  texQuad(S, makeTex('busdisp', 800, 120, (cc, w, h) => { cc.fillStyle = '#111'; cc.fillRect(0, 0, w, h); cc.font = FONT(56); cc.fillStyle = '#ffa53a'; cc.textAlign = 'center'; cc.fillText('Nächster Halt: Lindenhof-Schule', w / 2, 82); }), [[.5, 2.15, 9.9], [2.0, 2.15, 9.9], [2.0, 1.92, 9.9], [.5, 1.92, 9.9]], { nx: 1, ny: 1, lit: false, two: true, bias: -.5 });
  drawFace(S, c, [[0, 2.2, 10], [2.5, 2.2, 10], [2.5, 0, 10], [0, 0, 10]].reverse(), '#d9d4cb', [0, 0, -1], { ink: 0 });
  if (o.cast) o.cast(S, t);
  flush(S, c);
  // window light glow
  c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(255,230,180,.18)'); g.addColorStop(.5, 'rgba(255,230,180,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  return S;
}

// ---------- the bed seen from the side, drawn as one illustration (sorted with the room) ----------
// Noah lies on his back under the blanket, head on the pillow (head end = +z). o.arm: 0..1 reach towards the alarm clock
const BED = { x: .58, z0: 1.6, z1: 3.85, top: .53 };
function bedSide(S, o = {}) {
  const cam = S.cam;
  push(S, depthOf(S, [BED.x, .6, (BED.z0 + BED.z1) / 2]), c => {
    const p0 = proj(cam, [BED.x, BED.top, BED.z0]), p1 = proj(cam, [BED.x, BED.top, BED.z1]); if (!p0 || !p1) return;
    const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), s = L / (BED.z1 - BED.z0), ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
    c.save(); c.translate(p0[0], p0[1]); c.rotate(ang); c.scale(s, s); // local metres: +x towards the head, -y up
    const lw = 3 / s, ink = (w) => { c.lineWidth = w / s; c.strokeStyle = OUT; c.lineJoin = 'round'; c.stroke(); };
    // frame + mattress + headboard
    c.beginPath(); rrect(c, -.05, 0, 2.35, .36, .04); c.fillStyle = '#8a5a3a'; c.fill(); ink(3);
    c.beginPath(); rrect(c, 2.2, -.55, .12, .92, .04); c.fillStyle = '#7a4e30'; c.fill(); ink(3);
    c.beginPath(); rrect(c, 0, -.02, 2.2, .14, .05); c.fillStyle = '#f2eee6'; c.fill(); ink(2.5);
    for (const x of [.05, 2.15]) { c.fillStyle = '#6a4228'; c.fillRect(x - .03, .36, .07, .17); }
    // pillow
    c.beginPath(); c.ellipse(1.92, -.1, .3, .1, 0, 0, TAU); c.fillStyle = '#ffffff'; c.fill(); ink(2.5); line(c, [1.72, -.12, 2.1, -.13], 1.5 / s, 'rgba(0,0,0,.12)');
    // Noah: side rig lying on his back (feet at x .15, head at the pillow)
    const k = KID_H / RIG_H * .98;
    c.save(); c.translate(.6, -.17); c.rotate(Math.PI / 2);
    drawNoahSide(c, { x: 0, y: 0, k, s: -1, ink: 1.8, expr: o.expr || { eyes: 'closed', mouth: 'soft' } });
    c.restore();
    // blanket over the body up to the chest (soft mound, folds)
    c.beginPath(); c.moveTo(-.04, .1); c.quadraticCurveTo(-.02, -.12, .25, -.14); c.bezierCurveTo(.6, -.16, .9, -.2, 1.35, -.29); c.quadraticCurveTo(1.55, -.3, 1.62, -.22); c.lineTo(1.66, -.02); c.lineTo(1.68, .12); c.lineTo(-.04, .12); c.closePath();
    c.fillStyle = '#3f6fb0'; c.fill(); ink(3.5);
    c.save(); c.clip(); for (let i = 0; i < 6; i++) { const x = .2 + i * .25; c.beginPath(); c.moveTo(x, -.2); c.quadraticCurveTo(x + .05, -.05, x - .02, .1); c.lineWidth = 2 / s; c.strokeStyle = 'rgba(20,40,90,.45)'; c.stroke(); } c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, -.32, 1.7, .08); for (let i = 0; i < 10; i++) { c.beginPath(); c.arc(.15 + i * .16, -.02 + (i % 2) * .05, .025, 0, TAU); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); } c.restore();
    c.beginPath(); c.moveTo(1.6, -.3); c.quadraticCurveTo(1.7, -.12, 1.62, .1); c.lineTo(1.7, .1); c.quadraticCurveTo(1.78, -.12, 1.68, -.31); c.closePath(); c.fillStyle = '#e8eef8'; c.fill(); ink(2); // turned-down edge
    c.restore();
  });
  // arm reaching out from under the blanket towards the alarm clock (drawn in front of the nightstand)
  if (o.arm != null) push(S, depthOf(S, [.36, .7, 4.0]) - .3, c => {
    const sh = proj(cam, [BED.x + .05, BED.top + .3, BED.z0 + 1.62]), tgt = proj(cam, [.36, .72, 4.18]), rest = proj(cam, [BED.x + .15, BED.top + .3, BED.z0 + 1.3]);
    if (!sh || !tgt || !rest) return;
    const u = easeIO(o.arm), hx = lerp(rest[0], tgt[0], u), hy = lerp(rest[1], tgt[1], u) - Math.sin(u * Math.PI) * 30;
    const s = Math.hypot(tgt[0] - sh[0], tgt[1] - sh[1]), k = cam.f * KID_H / RIG_H / sh[2];
    const ex = (sh[0] + hx) / 2 + (hy - sh[1]) * .18, ey = (sh[1] + hy) / 2 - Math.abs(hx - sh[0]) * .18;
    const w = NOAH.ARM_W * k, wo = w + NOAH.W * 1.8 * 2 * k;
    line(c, [sh[0], sh[1], ex, ey, hx, hy], wo, NOAH.out); line(c, [sh[0], sh[1], ex, ey, hx, hy], w, NOAH.skin);
    line(c, [sh[0], sh[1], lerp(sh[0], ex, .45), lerp(sh[1], ey, .45)], wo, NOAH.out); line(c, [sh[0], sh[1], lerp(sh[0], ex, .45), lerp(sh[1], ey, .45)], w * 1.5, NOAH.shirt);
    const a = Math.atan2(hy - ey, hx - ex); c.save(); c.translate(hx, hy); c.scale(k, k); noahHandLocal(c, -a + Math.PI / 2); c.restore();
  });
}
