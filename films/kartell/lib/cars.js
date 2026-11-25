// KARTELL film cars (side profile, facing right, no logos). Real proportions: 1 m = KM (220) units, ground y = 0.
//   hatchback(c, x, o)  ~4,0 m old rusty hatchback      panelVan(c, x, o)  ~5,3 m white panel van
//   sportsCar(c, x, o)  ~4,5 m low luxury sports car   suv(c, x, o)       ~5,0 m black SUV
// o: { s: 1|-1 (facing), t, lights: bool, tint }
const CARS = {};
const m2 = (x, y) => [x * KM, -y * KM];
function carPath(c, pts) { // smooth closed outline through points given in metres (x from the rear, y up)
  const P = pts.map(([x, y]) => m2(x, y)); c.beginPath(); c.moveTo((P[0][0] + P[P.length - 1][0]) / 2, (P[0][1] + P[P.length - 1][1]) / 2);
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
  c.closePath();
}
function polyM(c, pts) { c.beginPath(); pts.forEach(([x, y], i) => { const [px, py] = m2(x, y); i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath(); }
function wheel(c, xm, rm, o = {}) {
  const [x, y] = m2(xm, rm), r = rm * KM, rim = r * (o.rim ?? .62);
  circle(c, x, y, r); fs(c, '#1b1b1e', 4);
  c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 3; i++) { circle(c, x, y, r - 6 - i * 6); c.stroke(); }
  circle(c, x, y, rim); fs(c, o.rimCol || '#b9bcc2', 3);
  const n = o.spokes || 5;
  if (o.hubcap) { circle(c, x, y, rim * .95); fs(c, o.hubcap, 2.5); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, [x + Math.cos(a) * rim * .3, y + Math.sin(a) * rim * .3, x + Math.cos(a) * rim * .85, y + Math.sin(a) * rim * .85], 3, 'rgba(0,0,0,.25)'); } if (o.missing) { c.fillStyle = '#4a3a30'; circle(c, x, y, rim * .7); c.fill(); for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + .4; circle(c, x + Math.cos(a) * rim * .35, y + Math.sin(a) * rim * .35, 6); c.fillStyle = '#9a8a7a'; c.fill(); } } }
  else { circle(c, x, y, rim * .92); fs(c, o.dark ? '#26272b' : '#3a3c42', 0);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + (o.rot || 0); for (const d of [-.12, .12]) line(c, [x + Math.cos(a) * rim * .25, y + Math.sin(a) * rim * .25, x + Math.cos(a + d * (o.twist ?? 1)) * rim * .93, y + Math.sin(a + d * (o.twist ?? 1)) * rim * .93], o.thin ? 7 : 11, o.rimCol || '#c4c7cc'); }
    if (o.caliper) { c.save(); c.beginPath(); c.arc(x, y, rim * .82, -2.4, -1.2); c.lineWidth = 22; c.strokeStyle = o.caliper; c.stroke(); c.restore(); }
    circle(c, x, y, rim * .22); fs(c, o.rimCol || '#c4c7cc', 2.5); circle(c, x, y, rim * .08); fs(c, '#555', 0); }
  c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(x, y, rim, -2.6, -1.6); c.lineTo(x, y); c.fill();
}
function arch(c, xm, rm, outline) { const [x, y] = m2(xm, rm); c.save(); if (outline) { outline(); c.clip(); } c.beginPath(); c.arc(x, y, rm * KM + 26, Math.PI, 0); c.lineTo(x + rm * KM + 26, y + 4); c.lineTo(x - rm * KM - 26, y + 4); c.closePath(); c.fillStyle = '#121214'; c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.beginPath(); c.arc(x, y, rm * KM + 26, Math.PI, 0); c.stroke(); c.restore(); }
function glass(c, pts, tint = '#3c4a58', o = {}) {
  polyM(c, pts); fs(c, tint, 3);
  c.save(); polyM(c, pts); c.clip();
  if (o.inside) o.inside(c);
  c.fillStyle = 'rgba(255,255,255,.22)'; const [x0] = m2(pts[0][0], 0); for (let i = 0; i < 3; i++) { const x = x0 + (i * 1.1 + .3) * KM; c.beginPath(); c.moveTo(x, -3 * KM); c.lineTo(x + 50, -3 * KM); c.lineTo(x - 260, 0); c.lineTo(x - 310, 0); c.fill(); }
  const g = c.createLinearGradient(0, m2(0, 1.8)[1], 0, m2(0, .9)[1]); g.addColorStop(0, 'rgba(200,225,240,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(-100, -3 * KM, 7 * KM, 3 * KM);
  c.restore();
}
function headrest(c, xm, ym, col = '#2a2a2e') { const [x, y] = m2(xm, ym); c.beginPath(); c.roundRect(x - 30, y - 40, 60, 60, 18); c.fillStyle = col; c.fill(); line(c, [x - 6, y + 20, x - 6, y + 40], 5, '#888'); }
function steering(c, xm, ym) { const [x, y] = m2(xm, ym); c.beginPath(); c.ellipse(x, y, 16, 60, .35, 0, Math.PI * 2); c.lineWidth = 9; c.strokeStyle = '#1a1a1c'; c.stroke(); }
function mirror(c, xm, ym, col) { const [x, y] = m2(xm, ym); c.beginPath(); c.moveTo(x - 10, y + 10); c.quadraticCurveTo(x - 30, y - 34, x + 20, y - 40); c.quadraticCurveTo(x + 52, y - 20, x + 30, y + 14); c.closePath(); fs(c, col, 3); }
function handle(c, xm, ym, col = 'rgba(0,0,0,.45)') { const [x, y] = m2(xm, ym); c.beginPath(); c.roundRect(x - 34, y - 7, 68, 14, 7); fs(c, col, 2); }
function seam(c, pts, col = 'rgba(0,0,0,.45)', w = 3) { line(c, pts.flatMap(([x, y]) => m2(x, y)), w, col); }
function carShadow(c, L) { c.save(); c.fillStyle = 'rgba(15,15,20,.42)'; c.beginPath(); c.ellipse(L * KM / 2, 6, L * KM * .55, 34, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
function bodyShade(c, outline, col) { // panel shading: lighter top, darker rocker, shoulder line highlight
  c.save(); outline(); c.clip();
  let g = c.createLinearGradient(0, -2.4 * KM, 0, 0); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(.75, 'rgba(0,0,0,.05)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
  c.fillStyle = g; c.fillRect(-200, -2.6 * KM, 6.5 * KM, 2.7 * KM); c.restore();
}

// ---------- old hatchback, ~4,0 m, rust, dents ----------
function hatchback(c, x, o = {}) {
  const col = o.color || '#8e3a30', L = 4.0;
  c.save(); c.translate(x, 0); c.scale(o.s || 1, 1); c.translate(-L * KM / 2, 0); carShadow(c, L);
  const out = [[0.02, .32], [-0.02, .62], [0.06, 1.0], [0.36, 1.40], [1.0, 1.46], [2.2, 1.44], [2.86, 1.02], [3.6, .9], [3.98, .78], [4.02, .5], [3.96, .3]];
  carPath(c, out); fs(c, col, 4); bodyShade(c, () => carPath(c, out), col);
  arch(c, .78, .3, () => carPath(c, out)); arch(c, 3.28, .3, () => carPath(c, out));
  c.save(); carPath(c, out); c.clip();
  // faded roof, rust patches + a dent
  c.fillStyle = 'rgba(255,240,220,.18)'; c.fillRect(0, -1.5 * KM, L * KM, .18 * KM);
  for (const [rx, ry, rr] of [[.55, .52, .14], [1.35, .36, .1], [3.55, .62, .09], [2.4, .34, .07]]) { const [px, py] = m2(rx, ry); kStain(c, px, py, rr * KM * 1.6, rr * KM, 'rgba(120,60,20,.75)', rx * 99); kSpecks(c, px - rr * KM, py - rr * KM * .4, rr * KM * 2, rr * KM * .8, rx * 7, 18, '#5a2a10', 4); }
  c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); const [dx, dy] = m2(2.05, .72); c.ellipse(dx, dy, 70, 26, -.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2a2a2c'; c.fillRect(0, m2(0, .48)[1], L * KM, .16 * KM); // black rubbing strip / plastic sill
  c.restore();
  glass(c, [[.34, 1.0], [.5, 1.34], [1.0, 1.39], [2.14, 1.38], [2.74, 1.0]], '#42505a', { inside: c => { headrest(c, .95, 1.2, '#3a3430'); headrest(c, 1.9, 1.2, '#3a3430'); steering(c, 2.4, 1.02); } });
  seam(c, [[1.56, 1.38], [1.56, .4]], OUT, 7); seam(c, [[.98, 1.39], [.98, 1.0]], OUT, 6); // pillars
  seam(c, [[2.7, 1.0], [2.86, .42]]); seam(c, [[.1, 1.0], [.08, .5]]);
  handle(c, 1.3, .92); handle(c, 2.45, .92); mirror(c, 2.68, 1.02, col);
  // lights, bumpers, number-plate-free
  polyM(c, [[3.82, .82], [4.0, .78], [4.0, .62], [3.84, .66]]); fs(c, '#f4eed8', 3);
  polyM(c, [[-.01, .98], [.08, .98], [.08, .72], [-.01, .72]]); fs(c, '#c8382c', 3);
  polyM(c, [[3.7, .5], [4.03, .5], [4.02, .3], [3.7, .3]]); fs(c, '#3a3a3c', 3); polyM(c, [[-.03, .5], [.3, .5], [.3, .3], [-.02, .3]]); fs(c, '#3a3a3c', 3);
  line(c, [...m2(.1, .28), ...m2(-.18, .24)], 6, '#555'); // exhaust
  wheel(c, .78, .29, { hubcap: '#a9acb2' }); wheel(c, 3.28, .29, { hubcap: '#a9acb2', missing: true });
  c.restore();
}
// ---------- white panel van, ~5,3 m ----------
function panelVan(c, x, o = {}) {
  const col = o.color || '#eeeeea', L = 5.3;
  c.save(); c.translate(x, 0); c.scale(o.s || 1, 1); c.translate(-L * KM / 2, 0); carShadow(c, L);
  const out = [[0, .38], [-.02, 1.2], [0, 2.22], [.12, 2.32], [3.9, 2.32], [4.12, 2.22], [4.72, 1.26], [5.2, 1.08], [5.32, .7], [5.26, .36]];
  carPath(c, out); fs(c, col, 4); bodyShade(c, () => carPath(c, out), col);
  arch(c, 1.0, .34, () => carPath(c, out)); arch(c, 4.3, .34, () => carPath(c, out));
  c.save(); carPath(c, out); c.clip();
  c.fillStyle = 'rgba(120,110,90,.22)'; c.fillRect(0, m2(0, .7)[1], L * KM, .4 * KM); kSpecks(c, 0, m2(0, .8)[1], L * KM, .5 * KM, 31, 140, 'rgba(110,95,70,.28)', 6); // road grime
  for (let i = 0; i < 14; i++) line(c, [...m2(.3 + i * .25, 2.2), ...m2(.3 + i * .25, 2.26)], 2, 'rgba(0,0,0,.15)'); // roof ribs
  c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(0, m2(0, 1.7)[1], 4 * KM, 8);
  c.restore();
  // sliding door seam + rail, rear door seam
  seam(c, [[2.1, 2.2], [2.1, .45]], OUT, 4); seam(c, [[3.75, 2.2], [3.75, .45]], OUT, 4); seam(c, [[2.1, 1.92], [3.6, 1.92]], 'rgba(0,0,0,.35)', 6);
  seam(c, [[.12, 2.2], [.12, .45]], 'rgba(0,0,0,.3)', 3); handle(c, 2.3, 1.2); handle(c, 3.95, 1.25);
  glass(c, [[3.86, 2.06], [4.12, 2.06], [4.62, 1.32], [3.86, 1.32]], '#3d4b56', { inside: c => { headrest(c, 3.98, 1.72, '#2a2a2e'); steering(c, 4.4, 1.38); } });
  seam(c, [[3.8, 2.12], [3.8, .45]], OUT, 5); mirror(c, 4.55, 1.38, '#2a2a2e');
  polyM(c, [[5.0, 1.12], [5.24, 1.06], [5.28, .9], [5.02, .94]]); fs(c, '#f4eed8', 3);
  polyM(c, [[-.03, 1.3], [.07, 1.3], [.07, .8], [-.03, .8]]); fs(c, '#c8382c', 3);
  polyM(c, [[4.9, .62], [5.33, .62], [5.3, .34], [4.9, .34]]); fs(c, '#3a3a3c', 3); polyM(c, [[-.04, .56], [.35, .56], [.35, .36], [-.03, .36]]); fs(c, '#3a3a3c', 3);
  wheel(c, 1.0, .34, { rimCol: '#8a8e94', spokes: 6, rim: .5, dark: true }); wheel(c, 4.3, .34, { rimCol: '#8a8e94', spokes: 6, rim: .5, dark: true });
  c.restore();
}
// ---------- luxury sports car, ~4,5 m, low ----------
function sportsCar(c, x, o = {}) {
  const col = o.color || '#5b6068', L = 4.5;
  c.save(); c.translate(x, 0); c.scale(o.s || 1, 1); c.translate(-L * KM / 2, 0); carShadow(c, L);
  const out = [[.02, .3], [-.02, .62], [.08, .86], [.6, .98], [1.35, 1.17], [2.15, 1.2], [3.0, .86], [4.0, .66], [4.48, .5], [4.52, .3], [4.38, .14], [.2, .14]];
  carPath(c, out); fs(c, col, 4); bodyShade(c, () => carPath(c, out), col);
  arch(c, .98, .35, () => carPath(c, out)); arch(c, 3.62, .35, () => carPath(c, out));
  c.save(); carPath(c, out); c.clip();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(...m2(.4, .9)); c.quadraticCurveTo(...m2(2.2, .95), ...m2(4.2, .62)); c.lineTo(...m2(4.2, .58)); c.quadraticCurveTo(...m2(2.2, .9), ...m2(.4, .85)); c.fill(); // shoulder highlight
  c.fillStyle = '#1e1f22'; c.fillRect(0, m2(0, .26)[1], L * KM, .14 * KM);
  c.restore();
  glass(c, [[1.08, .98], [1.5, 1.14], [2.1, 1.16], [2.78, .9], [2.6, .88]], '#2c343c', { inside: c => { headrest(c, 1.75, .98, '#8a3a2a'); steering(c, 2.4, .9); } });
  // side intake behind the door + door seam
  polyM(c, [[1.0, .78], [1.42, .74], [1.3, .5], [1.0, .56]]); fs(c, '#1a1a1c', 3); for (let i = 0; i < 4; i++) seam(c, [[1.04, .74 - i * .05], [1.36, .7 - i * .05]], '#3a3a3e', 3);
  seam(c, [[1.46, .98], [1.46, .3]], OUT, 3); seam(c, [[2.8, .86], [2.86, .3]], 'rgba(0,0,0,.4)', 3);
  handle(c, 1.7, .78, '#2a2c30'); mirror(c, 2.7, .92, col);
  polyM(c, [[4.05, .66], [4.42, .54], [4.4, .48], [4.02, .58]]); fs(c, '#eef4ff', 3); line(c, [...m2(4.05, .6), ...m2(4.38, .51)], 4, '#9ad0ff');
  polyM(c, [[-.02, .78], [.18, .82], [.18, .74], [-.02, .7]]); fs(c, '#d02a2a', 3);
  line(c, [...m2(.15, .26), ...m2(-.05, .26)], 10, '#888'); // exhaust tips
  wheel(c, .98, .35, { rim: .72, spokes: 10, thin: true, rimCol: '#d6d8dc', caliper: '#c8202a', twist: 2 }); wheel(c, 3.62, .35, { rim: .72, spokes: 10, thin: true, rimCol: '#d6d8dc', caliper: '#c8202a', twist: 2 });
  c.restore();
}
// ---------- black SUV, ~5,0 m ----------
function suv(c, x, o = {}) {
  const col = o.color || '#17181b', L = 5.0;
  c.save(); c.translate(x, 0); c.scale(o.s || 1, 1); c.translate(-L * KM / 2, 0); carShadow(c, L);
  const out = [[.02, .46], [0, 1.2], [.1, 1.72], [.34, 1.82], [3.1, 1.82], [3.56, 1.24], [4.82, 1.12], [5.02, .92], [5.02, .5], [4.9, .36], [.12, .36]];
  carPath(c, out); fs(c, col, 4); bodyShade(c, () => carPath(c, out), col);
  arch(c, .98, .4, () => carPath(c, out)); arch(c, 3.98, .4, () => carPath(c, out));
  c.save(); carPath(c, out); c.clip();
  c.fillStyle = 'rgba(160,180,200,.35)'; c.fillRect(0, m2(0, 1.2)[1], L * KM, 6); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(.3 * KM, m2(0, 1.0)[1], 4.4 * KM, 4);
  c.fillStyle = 'rgba(200,210,220,.15)'; c.beginPath(); c.ellipse(...m2(2.4, 1.6), 2.2 * KM, 40, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  glass(c, [[.22, 1.68], [.4, 1.76], [3.0, 1.76], [3.44, 1.26], [.2, 1.26]], '#15181c', { inside: c => { headrest(c, 1.5, 1.52, '#0e0e10'); headrest(c, 2.6, 1.52, '#0e0e10'); steering(c, 3.15, 1.32); } });
  seam(c, [[.2, 1.24], [3.46, 1.24]], '#b8bcc4', 6); seam(c, [[.2, 1.76], [3.04, 1.76]], '#b8bcc4', 4); // chrome trim
  seam(c, [[1.0, 1.76], [1.0, .45]], OUT, 6); seam(c, [[2.12, 1.76], [2.12, .45]], OUT, 6); seam(c, [[3.4, 1.26], [3.45, .45]], 'rgba(255,255,255,.2)', 3);
  handle(c, 1.75, 1.12, '#b8bcc4'); handle(c, 2.9, 1.12, '#b8bcc4'); mirror(c, 3.44, 1.3, col);
  polyM(c, [[1.05, .52], [3.4, .52], [3.4, .44], [1.05, .44]]); fs(c, '#2a2c30', 2); // running board
  polyM(c, [[4.72, 1.08], [5.0, .98], [5.02, .86], [4.72, .92]]); fs(c, '#eef4ff', 3); line(c, [...m2(4.6, .86), ...m2(5.0, .84)], 4, '#d8e8ff');
  polyM(c, [[-.01, 1.4], [.1, 1.42], [.1, 1.12], [0, 1.1]]); fs(c, '#b8222a', 3);
  wheel(c, .98, .4, { rim: .66, spokes: 6, rimCol: '#5a5e66', dark: true }); wheel(c, 3.98, .4, { rim: .66, spokes: 6, rimCol: '#5a5e66', dark: true });
  c.restore();
}
