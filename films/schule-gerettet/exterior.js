// School exterior: 3-storey building (facade z = 0, facing -z), yard (z < 0), gym (right), fire escape, bikes, goal, fence, skyline.
const EXT = { x0: -22, x1: 22, h: 11.2, floorH: 3.5, gym: { x0: 12, x1: 30, z0: -40, z1: -24, h: 7.5 } };
const TOD = {
  morning: { sky: ['#7fb6e6', '#cfe3ef', '#f6dfb6'], sun: [.25, .12], sunCol: '255,240,200', light: { dir: V.norm([-.55, .5, -.65]), col: [255, 232, 190], amb: .66, ambCol: [175, 190, 225], ink: 1.2, inkA: .45 } },
  alarm: { sky: ['#5f7fa8', '#a9b8c9', '#d8cdb8'], sun: [.2, .1], sunCol: '255,235,200', light: { dir: V.norm([-.55, .5, -.65]), col: [235, 225, 210], amb: .6, ambCol: [140, 155, 200], ink: 1.2, inkA: .5 } },
  police: { sky: ['#4f6c94', '#9aaabd', '#cdc6b6'], sun: [.2, .1], sunCol: '230,230,230', light: { dir: V.norm([-.4, .6, -.6]), col: [220, 220, 230], amb: .58, ambCol: [130, 145, 195], ink: 1.2, inkA: .5 } },
  bright: { sky: ['#69aef0', '#bfe0f6', '#fff1cc'], sun: [.75, .1], sunCol: '255,250,215', light: { dir: V.norm([.5, .6, -.6]), col: [255, 244, 215], amb: .72, ambCol: [185, 200, 235], ink: 1.2, inkA: .45 } },
  summer: { sky: ['#4aa2f0', '#a8d8fa', '#fff4c8'], sun: [.7, .08], sunCol: '255,250,220', light: { dir: V.norm([.4, .75, -.5]), col: [255, 246, 220], amb: .7, ambCol: [180, 200, 235], ink: 1.2, inkA: .45 } },
};
function skyAndCity(c, cam, tod, t) {
  const P = TOD[tod] || TOD.morning;
  // horizon: project a far point straight ahead at eye height
  const fwdH = V.norm([cam.fwd[0], 0, cam.fwd[2]]), hp = proj(cam, V.add(cam.pos, V.mul(fwdH, 4000))); const hy = hp ? hp[1] : H / 2;
  const g = c.createLinearGradient(0, hy - 900, 0, hy); g.addColorStop(0, P.sky[0]); g.addColorStop(.7, P.sky[1]); g.addColorStop(1, P.sky[2]); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const yaw = Math.atan2(cam.fwd[0], cam.fwd[2]);
  // sun + soft clouds
  const sx = W * P.sun[0] - yaw * 900, sy = hy - 520; glow(c, sx, sy, 520, P.sunCol, .8); circle(c, sx, sy, 50); c.fillStyle = `rgba(${P.sunCol},.95)`; c.fill();
  for (let i = 0; i < 7; i++) { const x = ((rnd(i) * 3000 - yaw * 700 + t * 6) % 3000 + 3000) % 3000 - 500, y = hy - 650 + rnd(i + 3) * 300; c.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(x + k * 60, y - Math.sin(k) * 20, 90, 40, 0, 0, TAU); c.fill(); } }
  // two skyline layers with haze
  for (const [p, col, hmax, seed] of [[.25, 'rgba(150,165,195,.75)', 260, 1], [.45, 'rgba(120,135,170,.85)', 190, 2]]) {
    const off = -yaw * 1400 * p;
    for (let i = -4; i < 40; i++) { const bw = 60 + rnd(i * 7 + seed) * 90, x = ((i * 95 + off) % 3800 + 3800) % 3800 - 600, bh = 60 + rnd(i * 3 + seed) * hmax; c.fillStyle = col; c.fillRect(x, hy - bh, bw, bh + 4); if (rnd(i + seed * 9) > .75) { c.fillRect(x + bw * .4, hy - bh - 40, 8, 40); } }
    c.fillStyle = 'rgba(220,225,235,.18)'; c.fillRect(0, hy - 400, W, 404);
  }
  return hy;
}
function texFacade(floor, alarm) { return makeTex('facade' + floor, 2200, 350, (c, w, h) => {
  c.fillStyle = '#e8d6b8'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1200; i++) { c.fillStyle = `rgba(120,90,60,${rnd(i) * .06})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 4, 4); }
  c.fillStyle = '#c4986a'; c.fillRect(0, h - 26, w, 26); // floor band
  for (let i = 0; i < 11; i++) {
    const x = 40 + i * 198, y = 70, ww = 150, hh = 190;
    c.fillStyle = '#f4efe6'; c.fillRect(x - 10, y - 10, ww + 20, hh + 24);
    const g = c.createLinearGradient(x, y, x + ww, y + hh); g.addColorStop(0, '#a9cbe6'); g.addColorStop(.45, '#e8f2fa'); g.addColorStop(.5, '#7e9fbf'); g.addColorStop(1, '#5d7a99'); c.fillStyle = g; c.fillRect(x, y, ww, hh);
    c.fillStyle = 'rgba(40,50,70,.35)'; c.fillRect(x + 6, y + hh * .55, ww - 12, hh * .45 - 4);
    line(c, [x + ww / 2, y, x + ww / 2, y + hh], 8, '#f4efe6'); line(c, [x, y + 70, x + ww, y + 70], 6, '#f4efe6');
    c.fillStyle = '#d8cbb4'; c.fillRect(x - 14, y + hh + 8, ww + 28, 12);
    if (floor === 2 && i === 2) { c.fillStyle = '#d02a22'; c.font = FONT(26); c.fillText('204', x + ww / 2 - 22, y - 16); }
  }
}); }
function schoolBuilding(S, c, t, o = {}) {
  const E = EXT, fh = E.floorH;
  // facade floors (textured) on plane z = 0, normal -z
  for (let f = 0; f < 3; f++) texQuad(S, texFacade(f), [[E.x0, (f + 1) * fh, 0], [E.x1, (f + 1) * fh, 0], [E.x1, f * fh, 0], [E.x0, f * fh, 0]], { nx: 8, ny: 1, n: [0, 0, -1], bias: 3 });
  // side walls, roof slab, roof edge
  face(S, [[E.x0, 0, 14], [E.x0, E.h, 14], [E.x0, E.h, 0], [E.x0, 0, 0]], '#dcc7a6', { n: [-1, 0, 0], bias: 3, grad: [.05, .15] });
  face(S, [[E.x1, 0, 0], [E.x1, E.h, 0], [E.x1, E.h, 14], [E.x1, 0, 14]], '#dcc7a6', { n: [1, 0, 0], bias: 3, grad: [.05, .15] });
  solid(S, E.x0 - .3, E.h - .6, -.35, E.x1 - E.x0 + .6, .7, 14.7, '#8a5a42', { bias: 2.5 });
  // clock tower block in the middle with a clock face
  solid(S, -2.6, E.h, -.2, 5.2, 2.6, 3, '#e2cfae', { bias: 2 });
  solid(S, -2.9, E.h + 2.6, -.5, 5.8, .4, 3.6, '#8a5a42', { bias: 1.9 });
  const tm = o.clock || [10, 17, 0];
  texQuad(S, texClock('ext', ...tm), [[-1.0, E.h + 2.2, -.22], [1.0, E.h + 2.2, -.22], [1.0, E.h + .2, -.22], [-1.0, E.h + .2, -.22]], { nx: 1, ny: 1, n: [0, 0, -1], lit: false, bias: 1.8 });
  // entrance: canopy, glass doors, steps, school sign
  solid(S, -3.2, 3.0, -2.2, 6.4, .25, 2.4, '#6c7380', { bias: 1 }); for (const x of [-3, 2.8]) solid(S, x, 0, -2.1, .18, 3.0, .18, '#6c7380', { bias: 1 });
  texQuad(S, makeTex('entr', 600, 420, (cc, w, h) => { cc.fillStyle = '#5b7896'; cc.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const g = cc.createLinearGradient(i * 150, 0, i * 150 + 150, h); g.addColorStop(0, '#cfe2f1'); g.addColorStop(.5, '#7f9fbf'); g.addColorStop(1, '#41566e'); cc.fillStyle = g; cc.fillRect(i * 150 + 8, 8, 134, h - 8); line(cc, [i * 150 + 110, h * .55, i * 150 + 110, h * .7], 8, '#c9ced6'); } }), [[-2.4, 2.8, -.05], [2.4, 2.8, -.05], [2.4, 0, -.05], [-2.4, 0, -.05]], { nx: 2, ny: 1, n: [0, 0, -1], bias: .9 });
  for (let i = 0; i < 3; i++) solid(S, -3.5 - i * .15, i * .0, -1 - i * .4, 7 + i * .3, .18 * (3 - i), .4, '#bdb6aa', { bias: .5 });
  texQuad(S, makeTex('schild', 1400, 220, (cc, w, h) => { cc.fillStyle = '#1f4f7a'; cc.fillRect(0, 0, w, h); cc.strokeStyle = '#fff'; cc.lineWidth = 8; cc.strokeRect(12, 12, w - 24, h - 24); txt(cc, 'Lindenhof-Schule', w / 2, 120, 92, '#fff', 'center'); txt(cc, 'Gesamtschule der Stadt', w / 2, 185, 44, '#cfe0ef', 'center'); }), [[-3.1, 4.2, -.06], [3.1, 4.2, -.06], [3.1, 3.3, -.06], [-3.1, 3.3, -.06]], { nx: 2, ny: 1, n: [0, 0, -1], bias: .8 });
  // red alarm beacon on the facade
  if (o.alarm) { const bp = proj(S.cam, [4, 9.4, -.2]); solid(S, 3.8, 9.2, -.3, .4, .4, .3, '#d0281e', { emit: true, post: cc => { const p = proj(S.cam, [4, 9.4, -.4]); if (p) { const pulse = Math.pow(Math.max(0, Math.sin((t * 1.6) % 1 * Math.PI)), 2); glow(cc, p[0], p[1], S.cam.f * 3.5 / p[2], '255,40,30', .95 * pulse); } } }); }
  fireEscape(S, -15.2, o);
}
// metal fire escape on the facade: landings at each floor, zig-zag stairs down to the yard; Room 204's back door on the top landing
function fireEscape(S, x, o = {}) {
  const fh = EXT.floorH, M = '#6f7680', Md = '#4f555e';
  for (let f = 1; f <= 2; f++) {
    const y = f * fh;
    solid(S, x - 1.6, y - .08, -1.4, 3.2, .08, 1.4, M, { bias: .3 });
    // railings
    for (let i = 0; i <= 8; i++) solid(S, x - 1.6 + i * .4, y, -1.4, .04, 1.0, .04, Md, { ink: .5, bias: .2 });
    solid(S, x - 1.6, y + 1.0, -1.42, 3.2, .05, .05, Md, { bias: .2 });
    // stair flight down from this landing to the one below (alternating direction)
    const dir = f % 2 ? 1 : -1, y0 = y, y1 = y - fh, n = 14;
    for (let k = 0; k < n; k++) { const u = k / n, sx = x + dir * (1.6 + u * 3.2), sy = lerp(y0, y1, u); solid(S, sx - .02, sy - .05, -1.3, dir * .26 || .26, .05, 1.0, M, { bias: .1, ink: .6 }); }
    // stringers
    const a = [x + dir * 1.6, y0, -1.32], b = [x + dir * 4.8, y1, -1.32];
    push(S, depthOf(S, V.lerp(a, b, .5)) - .2, cc => { for (const dz of [0, -1.0]) { const p = proj(S.cam, [a[0], a[1], a[2] + dz + .0]), q = proj(S.cam, [b[0], b[1], b[2] + dz]); const p2 = proj(S.cam, [a[0], a[1] + 1, a[2] + dz]), q2 = proj(S.cam, [b[0], b[1] + 1, b[2] + dz]); if (p && q) line(cc, [p[0], p[1], q[0], q[1]], Math.max(2, S.cam.f * .05 / p[2]), Md); if (p2 && q2) line(cc, [p2[0], p2[1], q2[0], q2[1]], Math.max(1.5, S.cam.f * .03 / p2[2]), Md); } });
    solid(S, x - .5, y, -.05, 1.0, 2.1, .05, '#9aa3ad', { bias: .4 }); // steel door
  }
  solid(S, x + 4.8, 0, -1.4, .9, .06, 1.2, M, { bias: .2 });
}
function texAsphalt() { return makeTex('asphalt', 1024, 1024, (c, w, h) => { c.fillStyle = '#9e9a93'; c.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { c.fillStyle = rnd(i) > .5 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 3, 3); } for (let i = 0; i < 6; i++) line(c, [rnd(i) * w, rnd(i + 3) * h, rnd(i + 6) * w, rnd(i + 9) * h], 2, 'rgba(60,55,50,.25)'); }); }
function yard(S, c, t, o = {}) {
  // ground: asphalt yard + grass beyond, court markings
  texQuad(S, texAsphalt(), [[-40, 0, 0], [40, 0, 0], [40, 0, -45], [-40, 0, -45]], { now: c, nx: 10, ny: 10, n: [0, 1, 0] });
  drawFace(S, c, [[-120, -.01, -45], [120, -.01, -45], [120, -.01, -200], [-120, -.01, -200]], '#8bb05a', [0, 1, 0], { ink: 0 });
  drawFace(S, c, [[-120, -.01, 30], [-40, -.01, 30], [-40, -.01, -45], [-120, -.01, -45]], '#8bb05a', [0, 1, 0], { ink: 0 });
  drawFace(S, c, [[40, -.01, 30], [120, -.01, 30], [120, -.01, -45], [40, -.01, -45]], '#8bb05a', [0, 1, 0], { ink: 0 });
  const mark = (pts, w = .1) => { const sp = projPoly(S.cam, pts); if (sp) { pathPoly(c, sp); c.fillStyle = 'rgba(245,242,230,.9)'; c.fill(); } };
  mark([[-12, .005, -12], [-11.9, .005, -12], [-11.9, .005, -30], [-12, .005, -30]]); mark([[8, .005, -12], [8.1, .005, -12], [8.1, .005, -30], [8, .005, -30]]);
  mark([[-12, .005, -12], [8.1, .005, -12], [8.1, .005, -12.1], [-12, .005, -12.1]]); mark([[-12, .005, -30], [8.1, .005, -30], [8.1, .005, -30.1], [-12, .005, -30.1]]); mark([[-12, .005, -21], [8.1, .005, -21], [8.1, .005, -21.1], [-12, .005, -21.1]]);
  { const pts = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU; pts.push([-2 + Math.cos(a) * 2.2, .006, -21 + Math.sin(a) * 2.2]); } const sp = projPoly(S.cam, pts); if (sp) { pathPoly(c, sp); c.lineWidth = 3; c.strokeStyle = 'rgba(245,242,230,.85)'; c.stroke(); } }
  // football goal at the far end + ball
  goal3D(S, -2, -30.2); if (o.ball !== false) ball3D(S, o.ballPos || [-1.2, .11, -27.8]);
  // bike racks with bikes (left of the entrance)
  for (let i = 0; i < 8; i++) { const x = -12 + i * .8; solid(S, x, 0, -3.2, .05, .6, .05, '#8a9099', { ink: .5 }); bike3D(S, x + .02, -3.7, i); }
  solid(S, -12.1, .55, -3.25, 6.5, .05, .1, '#8a9099');
  // benches, bins, dumpsters, trees, lamp posts
  for (const x of [8, 11]) bench3D(S, x, -6);
  for (const [x, z, col] of [[19, -3, '#3f6f4a'], [20.6, -3, '#5a6370'], [22.2, -3, '#3a5a8a']]) solid(S, x, 0, z, 1.4, 1.3, 1.1, col, { cols: { top: shade(col, -.2) } });
  for (const [x, z, s] of [[-28, -8, 1.2], [-26, -22, 1.1], [-30, -36, 1.3], [-20, -42, 1], [6, -43, 1.1], [30, -12, 1.2], [36, -30, 1.15], [-36, -16, 1]]) tree3D(S, x, z, s, t);
  fence3D(S);
}
function goal3D(S, x, z) { const W2 = 2.5, h = 2.1, col = '#f4f4f4'; solid(S, x - W2, 0, z, .1, h, .1, col); solid(S, x + W2, 0, z, .1, h, .1, col); solid(S, x - W2, h, z, W2 * 2 + .1, .1, .1, col);
  texQuad(S, makeTex('net', 400, 200, (c, w, h2) => { c.clearRect(0, 0, w, h2); for (let i = 0; i <= 40; i++) line(c, [i * 10, 0, i * 10, h2], 1.5, 'rgba(255,255,255,.7)'); for (let j = 0; j <= 20; j++) line(c, [0, j * 10, w, j * 10], 1.5, 'rgba(255,255,255,.7)'); }), [[x - W2, h, z - 1], [x + W2, h, z - 1], [x + W2, 0, z - 1.4], [x - W2, 0, z - 1.4]], { nx: 2, ny: 1, lit: false, two: true, bias: .5 }); }
function ball3D(S, p) { push(S, depthOf(S, p) - .1, c => { const sp = proj(S.cam, p); if (!sp) return; const r = S.cam.f * .11 / sp[2]; const g = c.createRadialGradient(sp[0] - r * .35, sp[1] - r * .35, r * .1, sp[0], sp[1], r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#a9a9a9'); circle(c, sp[0], sp[1], r); c.fillStyle = g; c.fill(); c.lineWidth = Math.max(1, r * .1); c.strokeStyle = OUT; c.stroke(); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; circle(c, sp[0] + Math.cos(a) * r * .55, sp[1] + Math.sin(a) * r * .55, r * .2); c.fillStyle = '#222'; c.fill(); } circle(c, sp[0], sp[1], r * .22); c.fill(); const sh = proj(S.cam, [p[0] + .1, 0, p[2] + .08]); if (sh) { c.globalAlpha = .3; c.beginPath(); c.ellipse(sh[0], sh[1], r * 1.1, r * .3, 0, 0, TAU); c.fillStyle = '#000'; c.fill(); c.globalAlpha = 1; } }); }
function bike3D(S, x, z, i) {
  const p = [x, 0, z]; push(S, depthOf(S, p), c => { const a = proj(S.cam, [x, .33, z - .5]), b = proj(S.cam, [x, .33, z + .5]); if (!a || !b) return; const r = Math.abs(S.cam.f * .33 / a[2]), r2 = Math.abs(S.cam.f * .33 / b[2]), col = ['#d24a3a', '#3a7ad2', '#3aa05a', '#e0b030', '#8a5ab0'][i % 5];
    for (const [q, rr] of [[a, r], [b, r2]]) { c.beginPath(); c.ellipse(q[0], q[1], rr * .35, rr, 0, 0, TAU); c.lineWidth = Math.max(1.5, rr * .12); c.strokeStyle = '#222'; c.stroke(); }
    const s = proj(S.cam, [x, .8, z - .1]), hnd = proj(S.cam, [x, .95, z - .45]); if (s && hnd) { line(c, [a[0], a[1], s[0], s[1], b[0], b[1]], Math.max(2, r * .12), col); line(c, [s[0], s[1], hnd[0], hnd[1], a[0], a[1]], Math.max(2, r * .1), col); line(c, [hnd[0] - r * .25, hnd[1], hnd[0] + r * .25, hnd[1]], Math.max(2, r * .08), '#222'); c.beginPath(); c.ellipse(s[0], s[1] - 3, r * .18, r * .07, 0, 0, TAU); c.fillStyle = '#222'; c.fill(); } }); }
function bench3D(S, x, z) { solid(S, x, .42, z, 2, .06, .45, '#b07a48'); solid(S, x, .55, z + .45, 2, .35, .06, '#b07a48'); for (const dx of [.1, 1.85]) solid(S, x + dx, 0, z + .05, .06, .42, .4, '#555'); }
function tree3D(S, x, z, s, t) {
  cylinder(S, x, 0, z, .22 * s, 3 * s, '#6a4a30', { seg: 8 });
  const top = [x, 3.8 * s, z]; push(S, depthOf(S, top) - .5, c => { const sp = proj(S.cam, top); if (!sp) return; const r = S.cam.f * 1.9 * s / sp[2], L = S.light.dir;
    const blobs = []; for (let k = 0; k < 9; k++) blobs.push([sp[0] + (rnd(k + x) - .5) * r * 1.3, sp[1] + (rnd(k + z) - .5) * r * 1.0 + Math.sin(t * 1.2 + k) * r * .01, r * (.45 + rnd(k * 3 + x) * .3)]);
    for (const b of blobs) { circle(c, b[0], b[1], b[2] + 2); c.fillStyle = 'rgba(30,50,25,.6)'; c.fill(); }
    for (const b of blobs) { circle(c, b[0], b[1], b[2]); const g = c.createRadialGradient(b[0] - L[0] * b[2] * .5, b[1] - b[2] * .5, b[2] * .1, b[0], b[1], b[2]); g.addColorStop(0, '#8cc463'); g.addColorStop(1, '#4b8240'); c.fillStyle = g; c.fill(); }
  });
}
function fence3D(S) {
  for (let x = -40; x <= 40; x += 2.5) solid(S, x, 0, -45, .06, 1.6, .06, '#4a5a4a', { ink: .4 });
  texQuad(S, makeTex('fence', 512, 128, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = -20; i < 60; i++) { line(c, [i * 12, 0, i * 12 + 60, h], 1.5, 'rgba(70,90,70,.8)'); line(c, [i * 12, h, i * 12 + 60, 0], 1.5, 'rgba(70,90,70,.8)'); } }), [[-40, 1.6, -45], [-1.8, 1.6, -45], [-1.8, 0, -45], [-40, 0, -45]], { nx: 4, ny: 1, lit: false, two: true, bias: .3 });
  texQuad(S, TEX.fence, [[1.8, 1.6, -45], [40, 1.6, -45], [40, 0, -45], [1.8, 0, -45]], { nx: 4, ny: 1, lit: false, two: true, bias: .3 });
  // gate (open) at the yard entrance
  solid(S, -1.8, 0, -45.1, .12, 2.0, .12, '#4a5a4a'); solid(S, 1.8, 0, -45.1, .12, 2.0, .12, '#4a5a4a');
  texQuad(S, makeTex('gatesign', 600, 160, (c, w, h) => { c.fillStyle = '#1f4f7a'; c.fillRect(0, 0, w, h); txt(c, 'Lindenhof-Schule', w / 2, 102, 60, '#fff', 'center'); }), [[-1.8, 2.5, -45.1], [1.9, 2.5, -45.1], [1.9, 2.0, -45.1], [-1.8, 2.0, -45.1]], { nx: 1, ny: 1, bias: .2 });
  texQuad(S, TEX.gatesign, [[1.9, 2.5, -45.08], [-1.8, 2.5, -45.08], [-1.8, 2.0, -45.08], [1.9, 2.0, -45.08]], { nx: 1, ny: 1, bias: .2 });
}
function gymBuilding(S, c, t, o = {}) {
  const G = EXT.gym;
  // brick box, flat roof, high windows, the steel door facing the yard (x = G.x0 side)
  const brick = makeTex('brick', 512, 512, (cc, w, h) => { cc.fillStyle = '#b46a4a'; cc.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 32; x < w; x += 64) { cc.fillStyle = `rgba(${150 + rnd(x + y) * 40 | 0},${80 + rnd(x * y) * 30 | 0},60,.6)`; cc.fillRect(x + 2, y + 2, 60, 28); } });
  texQuad(S, brick, [[G.x0, G.h, G.z1], [G.x0, G.h, G.z0], [G.x0, 0, G.z0], [G.x0, 0, G.z1]], { nx: 4, ny: 2, n: [-1, 0, 0], bias: 2 });
  texQuad(S, brick, [[G.x1, G.h, G.z1], [G.x0, G.h, G.z1], [G.x0, 0, G.z1], [G.x1, 0, G.z1]], { nx: 4, ny: 2, n: [0, 0, 1], bias: 2 });
  texQuad(S, brick, [[G.x0, G.h, G.z0], [G.x1, G.h, G.z0], [G.x1, 0, G.z0], [G.x0, 0, G.z0]], { nx: 4, ny: 2, n: [0, 0, -1], bias: 2 });
  solid(S, G.x0 - .3, G.h, G.z0 - .3, G.x1 - G.x0 + .6, .5, G.z1 - G.z0 + .6, '#7a4a36', { bias: 1.8 });
  for (let i = 0; i < 6; i++) { const z = G.z0 + 1.5 + i * 2.4; texQuad(S, makeTex('gymwin', 200, 120, (cc, w, h) => { const g = cc.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#d8ecf8'); g.addColorStop(1, '#6f90b0'); cc.fillStyle = g; cc.fillRect(0, 0, w, h); cc.strokeStyle = '#eee'; cc.lineWidth = 10; cc.strokeRect(0, 0, w, h); line(cc, [w / 2, 0, w / 2, h], 6, '#eee'); }), [[G.x0 - .02, 6.6, z + 1.8], [G.x0 - .02, 6.6, z], [G.x0 - .02, 5.2, z], [G.x0 - .02, 5.2, z + 1.8]], { nx: 1, ny: 1, n: [-1, 0, 0], bias: 1.5, lit: false }); }
  texQuad(S, makeTex('gymsign', 700, 160, (cc, w, h) => { cc.fillStyle = '#f4efe6'; cc.fillRect(0, 0, w, h); txt(cc, 'Turnhalle', w / 2, 112, 96, '#7a3424', 'center'); }), [[G.x0 - .03, 4.6, G.z0 + 9.2], [G.x0 - .03, 4.6, G.z0 + 6], [G.x0 - .03, 3.9, G.z0 + 6], [G.x0 - .03, 3.9, G.z0 + 9.2]], { nx: 1, ny: 1, n: [-1, 0, 0], bias: 1.4 });
  // steel double door (open angle o.door 0..1), fire extinguisher box beside it
  const dz = G.z0 + 6.4, dw = 2.2, open = o.door ?? 1;
  solid(S, G.x0 - .1, 0, dz - .1, .1, 2.6, .1, '#5f6670'); solid(S, G.x0 - .1, 0, dz + dw, .1, 2.6, .1, '#5f6670'); solid(S, G.x0 - .1, 2.5, dz - .1, .1, .12, dw + .2, '#5f6670');
  face(S, [[G.x0 - .01, 2.5, dz + dw], [G.x0 - .01, 2.5, dz], [G.x0 - .01, 0, dz], [G.x0 - .01, 0, dz + dw]], '#2a2620', { n: [-1, 0, 0], bias: 1.2, emit: true });
  const ang = open * 1.35, fx = G.x0 - Math.sin(ang) * dw, fz = dz + Math.cos(ang) * dw;
  face(S, [[fx, 2.5, fz], [G.x0 - .02, 2.5, dz], [G.x0 - .02, 0, dz], [fx, 0, fz]], '#8e98a4', { two: true, gloss: .2, bias: .8, n: V.norm([-Math.cos(ang), 0, -Math.sin(ang)]) });
  solid(S, G.x0 - .25, 1.0, dz - .9, .2, .6, .45, '#d0281e', { bias: .6 });
}
// outdoor frame helper
function exteriorFrame(c, t, cam, o = {}) {
  const tod = o.tod || 'morning', S = scene(cam, Object.assign({}, TOD[tod].light, o.light || {}));
  skyAndCity(c, cam, tod, t);
  yard(S, c, t, o); schoolBuilding(S, c, t, o); gymBuilding(S, c, t, o);
  if (o.cast) o.cast(S, t);
  flush(S, c);
  return S;
}
