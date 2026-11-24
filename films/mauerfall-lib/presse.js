// PRESS HALL (evening press conference, brightly lit by white TV lights). Needs light.js, tex.js, folk.js, noah89.js.
//   presseHall(c, cam, t, o)  back wall (wood panels + curtain) on PH_HZ, stage with the long table at x -900..900
//   presseTable(c, t, o)      stage, table, microphones, panel members (spokesman at x 0) — world space
//   presseLight(c, cam, t, o) TV light beams, flashes, grade (in `screen`)
//   journalist(c, x, y, i, t, o) a varied journalist (side view facing the podium, or back view)
//   drawNoah89Back(c, o)      Noah from behind (for over-the-shoulder shots); same skeleton as the front view
const PH_HZ = -420;
function woodPanels(c, x0, x1, y0, y1) {
  c.fillStyle = '#7a5434'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let x = Math.floor(x0 / 260) * 260; x < x1; x += 260) { const v = rnd(x * .1); c.fillStyle = v > .5 ? '#82593a' : '#714c2e'; c.fillRect(x + 6, y0, 248, y1 - y0); for (let k = 0; k < 16; k++) line(c, [x + 10 + rnd(x + k) * 240, y0, x + 14 + rnd(x + k) * 240, y1], 1.5, 'rgba(40,24,12,.3)'); c.fillStyle = 'rgba(255,230,190,.08)'; c.fillRect(x + 6, y0, 40, y1 - y0); }
  grain(c, x0, y0, x1 - x0, y1 - y0, .3, 1.5);
}
function presseHall(c, cam, t, o = {}) {
  const HZ = PH_HZ; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2a2420'; c.fillRect(0, 0, W, H);
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 400), top = HZ - 1500;
    woodPanels(c, x0, x1, top, HZ);
    // ceiling with a grid of lights
    c.fillStyle = '#d8d4ca'; c.fillRect(x0, top - 800, x1 - x0, 800); for (let x = Math.floor(x0 / 500) * 500; x < x1; x += 500) { c.beginPath(); c.rect(x + 80, top - 60, 300, 40); fs(c, '#fffbe8', 2); bloom(c, x + 230, top - 30, 260, '255,250,230', .5); }
    c.fillStyle = '#6a4a2e'; c.fillRect(x0, top - 20, x1 - x0, 40);
    // heavy curtain behind the stage + a plain light panel
    c.beginPath(); c.rect(-1300, top + 120, 2600, HZ - top - 120); c.fillStyle = '#5a6a7a'; c.fill(); c.save(); c.clip(); for (let x = -1300; x < 1300; x += 60) { const g = c.createLinearGradient(x, 0, x + 60, 0); g.addColorStop(0, 'rgba(0,0,0,.25)'); g.addColorStop(.5, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = g; c.fillRect(x, top, 60, HZ - top); } c.restore();
    c.beginPath(); c.rect(-1300, top + 120, 2600, HZ - top - 120); fs(c, null, 3);
    c.beginPath(); c.rect(-1360, top + 80, 2720, 60); fs(c, '#4a3420', 3);
    // floor: grey-blue carpet with wear paths, cables
    c.fillStyle = '#5a5e66'; c.fillRect(x0, HZ, x1 - x0, 2400); grain(c, x0, HZ, x1 - x0, 2400, .5, 1.2); mottle(c, x0, HZ, x1 - x0, 2400, 4, { r: 180, a: .1 });
    for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(x0, HZ + 200 + k * 160); c.bezierCurveTo(-600 + k * 90, HZ + 120 + k * 200, 400 - k * 70, HZ + 300 + k * 140, x1, HZ + 160 + k * 170); c.lineWidth = 5; c.strokeStyle = '#1e1e1e'; c.stroke(); }
    const ao = c.createLinearGradient(0, HZ, 0, HZ + 120); ao.addColorStop(0, 'rgba(10,8,6,.5)'); ao.addColorStop(1, 'rgba(10,8,6,0)'); c.fillStyle = ao; c.fillRect(x0, HZ, x1 - x0, 120);
  });
}
function tvLight(c, x, y, dir = 1, on = 1) {
  // studio spotlight on a tripod, barn doors, aimed at the stage
  const h = 760; for (const d of [-90, 0, 90]) { line(c, [x, y - 300, x + d * 1.3, y], 10); line(c, [x, y - 300, x + d * 1.3, y], 5, '#3a3a3a'); }
  line(c, [x, y - 300, x, y - h], 12); line(c, [x, y - 300, x, y - h], 6, '#4a4a4a');
  c.save(); c.translate(x, y - h); c.scale(dir, 1); c.rotate(.18);
  c.beginPath(); c.rect(-70, -60, 140, 120); fs(c, '#2e2e30', 3); c.beginPath(); c.rect(60, -70, 26, 140); fs(c, on ? '#fffbe6' : '#8a8a80', 2.5);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(86, s * 70); c.lineTo(140, s * 100); c.lineTo(140, s * 70); c.lineTo(86, s * 50); c.closePath(); fs(c, '#2e2e30', 2); }
  c.restore(); if (on) bloom(c, x + dir * 90, y - h + 10, 320, '255,252,235', .85);
}
function eng(c) {
  // shoulder-mounted TV camera (drawn in the hand frame, pointing to +x)
  c.save(); c.rotate(-1.4);
  c.beginPath(); c.rect(-80, -120, 260, 110); fs(c, '#3a3a3c', 5); c.beginPath(); c.rect(170, -105, 90, 80); fs(c, '#2a2a2a', 5); circle(c, 262, -65, 34); fs(c, '#1a1a1a', 4);
  c.beginPath(); c.rect(-60, -170, 120, 50); fs(c, '#4a4a4c', 4); c.beginPath(); c.rect(-120, -110, 40, 90); fs(c, '#555', 4); circle(c, 40, -30, 14); c.fillStyle = '#d23'; c.fill(); c.restore();
}
function photoCam(c, flash) {
  c.save(); c.rotate(-1.4); c.beginPath(); c.rect(-50, -70, 120, 80); fs(c, '#2a2a2a', 5); circle(c, 80, -30, 30); fs(c, '#1a1a1a', 4); c.beginPath(); c.rect(-30, -150, 70, 80); fs(c, '#d8d8d0', 4);
  if (flash) { bloom(c, 5, -110, 600, '255,255,255', flash); bloom(c, 5, -110, 160, '255,255,255', flash); }
  c.restore();
}
function notepad(c) { c.save(); c.rotate(-.3); c.beginPath(); c.rect(-40, -10, 100, 130); fs(c, '#f4f0e2', 5); for (let k = 0; k < 5; k++) line(c, [-30, 20 + k * 20, 50, 20 + k * 20], 3, '#8aa0c0'); c.restore(); }
const JOURN = [
  { hair: 'short', hairCol: '#3a2c24', coat: '#5a4a3a', type: 'jacket', pants: '#3a3a40', glasses: true },
  { hair: 'perm', hairCol: '#7a5a3a', coat: '#8a3a4a', type: 'coat', pants: '#2a2a30', skirt: '#2a2a30' },
  { hair: 'mullet', hairCol: '#5b4636', coat: '#6a7a8a', type: 'jacket', pants: '#4a6890', moustache: true },
  { hair: 'bald', hairCol: '#6a5a4a', coat: '#4a4a52', type: 'suit', pants: '#3a3a42', tie: '#7a2a2a', glasses: true },
  { hair: 'side', hairCol: '#2a2422', coat: '#7a6a4a', type: 'coat', pants: '#3e3a36', beard: true },
  { hair: 'long', hairCol: '#a0703c', coat: '#3a5a6a', type: 'jacket', pants: '#2a2a30' },
  { hair: 'short', hairCol: '#4a3a30', hat: 'cap', hatCol: '#3a3a36', coat: '#5a5a4a', type: 'parka', pants: '#4a6890' },
];
function journalist(c, x, y, i, t, o = {}) {
  const J = Object.assign({}, JOURN[i % JOURN.length], o), kind = o.kind || ['pad', 'photo', 'eng', 'pad', 'mic', 'photo', 'pad'][i % 7];
  const fl = kind === 'photo' ? flashAt(t, i) : 0, up = o.up ?? 0;
  softShadow(c, x, y, 120, .3);
  const hold = kind === 'eng' ? eng : kind === 'photo' ? (cc => photoCam(cc, fl)) : kind === 'mic' ? (cc => { line(cc, [0, 0, 0, -260], 10, '#2a2a2a'); circle(cc, 0, -280, 34); fs(cc, '#3a3a3a', 5); }) : notepad;
  drawFolkSide(c, Object.assign({ x, y, s: o.s ?? -1, h: J.h || (.94 + (i % 4) * .03), hold, nearA: kind === 'pad' ? .7 : 1.7, nearBend: kind === 'pad' ? -1.6 : -1.7, expr: { mouth: o.mouth || (up > .5 ? 'o' : 'flat'), browUp: up, look: .3 }, tilt: o.tilt ?? (kind === 'pad' ? (.12 - up * .16) : 0) }, J));
}
// deterministic camera flashes: returns flash strength 0..1 for journalist i at time t
function flashAt(t, i) { const slot = Math.floor(t * 3 + i * 1.7), ph = t * 3 + i * 1.7 - slot; return rnd(slot * 13 + i) > .82 ? Math.max(0, 1 - ph * 5) : 0; }
function presseTable(c, t, o = {}) {
  // raised stage + long table with cloth, name boards (blank), many microphones on stalks, water glasses; panel members
  const y = PH_HZ + 140;
  c.beginPath(); c.rect(-1500, PH_HZ - 10, 3000, 150); fs(c, '#4a3a2c', 3); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(-1500, PH_HZ - 10, 3000, 12);
  // panel (behind the table)
  const panel = [[-700, { hair: 'bald', hairCol: '#8a8278', coat: '#5a5c60', type: 'suit', tie: '#3a3a5a', glasses: true }], [-300, { hair: 'side', hairCol: '#4a3a30', coat: '#4e5054', type: 'suit', tie: '#5a2a2a' }], [300, { hair: 'short', hairCol: '#6a6a66', coat: '#55575c', type: 'suit', tie: '#2a3a4a' }], [700, { hair: 'bald', hairCol: '#5a4a3a', coat: '#5a5a5e', type: 'suit', tie: '#4a2a2a', glasses: true }]];
  for (const [px, P] of panel) drawFolk(c, Object.assign({ x: px, y: PH_HZ - 10, k: .25, expr: { mouth: 'flat', look: rnd(px) - .5 } }, P));
  // spokesman (generic: grey suit, heavy black frames, side parting greying)
  const sp = o.spokes || {};
  drawFolk(c, { x: 0, y: PH_HZ - 10, k: .25, hair: 'side', hairCol: '#7a746c', coat: '#6a6c70', type: 'suit', tie: '#3a3a3a', glasses: '#141414', arms: sp.arms || { l: { a: .5, b: -1.8 }, r: { a: .5, b: -1.8 } }, holdR: sp.paper ? (cc => { cc.save(); cc.rotate(-.2); cc.beginPath(); cc.rect(-70, -20, 150, 200); fs(cc, '#f6f3ea', 5); for (let k = 0; k < 7; k++) line(cc, [-50, 20 + k * 22, 60, 20 + k * 22], 3, '#8a8a8a'); cc.restore(); }) : null, expr: Object.assign({ mouth: 'flat', look: 0 }, sp.expr || {}), tilt: sp.tilt || 0 });
  // table
  c.beginPath(); c.moveTo(-1200, y - 250); c.lineTo(1200, y - 250); c.lineTo(1240, y - 200); c.lineTo(-1240, y - 200); c.closePath(); fs(c, '#e8e4d8', 3);
  c.beginPath(); c.rect(-1240, y - 200, 2480, 230); fs(c, '#3a5a4a', 3); c.save(); c.beginPath(); c.rect(-1240, y - 200, 2480, 230); c.clip(); for (let x = -1240; x < 1240; x += 40) line(c, [x, y - 200, x + 6, y + 30], 2, 'rgba(0,0,0,.18)'); c.restore();
  // papers, glasses, carafe
  for (const px of [-700, -300, 300, 700]) { c.beginPath(); c.rect(px - 60, y - 246, 110, 20); fs(c, '#f6f3ea', 2); c.beginPath(); c.moveTo(px + 70, y - 250); c.lineTo(px + 96, y - 250); c.lineTo(px + 92, y - 300); c.lineTo(px + 74, y - 300); c.closePath(); fs(c, 'rgba(200,220,230,.7)', 2); }
  if (!sp.paper) { c.beginPath(); c.rect(-90, y - 248, 170, 22); fs(c, '#f6f3ea', 2); }
  // microphones bunch in front of the spokesman + others
  const mics = [[-40, 0], [-10, 1], [20, 2], [50, 3], [-70, 4], [80, 5], [-110, 6], [110, 7]];
  for (const [mx, k] of mics) { const top = y - 330 - (k % 3) * 30; line(c, [mx, y - 250, mx + (k - 3.5) * 6, top], 5, '#1e1e1e'); ell(c, mx + (k - 3.5) * 6, top - 16, 16, 24); fs(c, ['#2a2a2a', '#3a3a3a', '#5a5a5a', '#2a3a5a', '#5a2a2a'][k % 5], 3); }
  for (const px of [-700, -300, 300, 700]) { line(c, [px, y - 250, px - 10, y - 340], 4, '#1e1e1e'); ell(c, px - 10, y - 354, 13, 20); fs(c, '#2a2a2a', 3); }
  // cables down the table front
  for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(-80 + k * 25, y - 200); c.quadraticCurveTo(-60 + k * 30, y + 60, -200 + k * 70, y + 160); c.lineWidth = 4; c.strokeStyle = '#1a1a1a'; c.stroke(); }
}
function presseLight(c, cam, t, o = {}) {
  // white key light from the TV lamps (high-key), light beams with dust, random flashes, cool-white grade
  layerZ(c, cam, 1, c => {
    c.save(); c.globalCompositeOperation = 'screen';
    for (const [lx, ly] of [[-1900, PH_HZ - 1000], [1900, PH_HZ - 1000]]) { const g = c.createLinearGradient(lx, ly, 0, PH_HZ); g.addColorStop(0, 'rgba(255,252,235,.32)'); g.addColorStop(1, 'rgba(255,252,235,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(lx, ly - 60); c.lineTo(lx, ly + 60); c.lineTo(lx > 0 ? -400 : 400, PH_HZ + 200); c.lineTo(lx > 0 ? 300 : -300, PH_HZ - 900); c.closePath(); c.fill(); }
    c.restore();
    motes(c, cam.x - 1400, cam.x + 1400, PH_HZ - 1400, PH_HZ + 300, t, { n: 50, color: '255,250,235', alpha: .55, speed: .02 });
  });
  const f = o.flash ?? 0; if (f > 0) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(255,255,255,${f})`; c.fillRect(0, 0, W, H); c.restore(); }
  grade(c, { sx: .5, sy: 0, warm: '255,250,235', warmA: .2, cool: '30,30,50', coolA: .16 });
}
// ---------------- Noah from behind ----------------
function drawNoah89Back(c, p0 = {}) {
  return n89Ink(p0, p => {
    const k = p.k ?? .25, R = NOAH.HEAD.r, cy = NOAH.HEAD.y, arms = Object.assign({}, NOAH.ARMS, p.arms || {});
    c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k); if (p.lean) c.rotate(p.lean);
    // legs (jeans back, heels)
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 4, NOAH.HEM - 10); c.lineTo(s * 118, NOAH.HEM - 10); c.lineTo(s * 112, -95); c.lineTo(s * 12, -95); c.closePath(); nFill(c, N89.jeans); nLine(c, [s * 60, -440, s * 62, -110], 3, N89.stitch); c.beginPath(); c.moveTo(s * 18, -98); c.lineTo(s * 112, -98); c.quadraticCurveTo(s * 130, -40, s * 120, 2); c.lineTo(s * 22, 2); c.quadraticCurveTo(s * 8, -40, s * 18, -98); nFill(c, N89.shoe); }
    // arms behind the body edges
    for (const s of [-1, 1]) { const a = arms[s < 0 ? 'l' : 'r']; const sx = s * 150, ex = sx + s * Math.sin(a.a) * 215, ey = -915 + Math.cos(a.a) * 215, a2 = a.a + (a.b || 0), wx = ex + s * Math.sin(a2) * 205, wy = ey + Math.cos(a2) * 205; c.save(); c.translate(wx, wy); noahHandLocal(c, -s * a2); c.restore(); nLine(c, [sx, -915, ex, ey, wx - (wx - ex) * .2, wy - (wy - ey) * .2], 94 + NOAH.W * 2, NOAH.out); nLine(c, [sx, -915, ex, ey, wx - (wx - ex) * .2, wy - (wy - ey) * .2], 94, p.outfit === '1989-home' ? N89.sw[0] : N89.parka); }
    if (p.outfit === '1989-home') { c.beginPath(); c.moveTo(-155, -945); c.quadraticCurveTo(-150, -820, -134, -760); c.lineTo(-128, NOAH.HEM); c.lineTo(132, NOAH.HEM); c.lineTo(138, -760); c.quadraticCurveTo(150, -820, 158, -945); c.quadraticCurveTo(0, -985, -155, -945); c.closePath(); c.fillStyle = N89.sw[0]; c.fill(); c.save(); c.clip(); n89Knit(c, -170, -990, 170, NOAH.HEM, 8); c.restore(); nFill(c, null); }
    else {
    // parka back with yoke, hood, drawstring
    c.beginPath(); c.moveTo(-170, -950); c.quadraticCurveTo(-182, -820, -170, -700); c.lineTo(-166, -430); c.quadraticCurveTo(0, -420, 166, -430); c.lineTo(170, -700); c.quadraticCurveTo(182, -820, 170, -950); c.quadraticCurveTo(0, -990, -170, -950); c.closePath(); nFill(c, N89.parka);
    c.save(); c.clip(); c.fillStyle = 'rgba(25,28,10,.18)'; c.fillRect(60, -1000, 140, 600); nLine(c, [-175, -860, 175, -860], 3, N89.parkaLine); nLine(c, [0, -860, 0, -440], 3, N89.parkaLine); nLine(c, [-170, -585, 170, -585], 3, N89.parkaLine); for (const fy of [-700, -620]) { c.beginPath(); c.moveTo(-120, fy); c.quadraticCurveTo(0, fy + 20, 120, fy); c.lineWidth = 3.5; c.strokeStyle = N89.parkaDk; c.stroke(); } c.restore();
    c.beginPath(); c.moveTo(-150, -950); c.quadraticCurveTo(-200, -1080, -90, -1110); c.lineTo(90, -1110); c.quadraticCurveTo(200, -1080, 150, -950); c.quadraticCurveTo(0, -900, -150, -950); c.closePath(); nFill(c, N89.parkaDk, NOAH.W * .8);
    c.beginPath(); c.moveTo(-90, -1000); c.quadraticCurveTo(0, -980, 90, -1000); c.lineTo(80, -950); c.quadraticCurveTo(0, -935, -80, -950); c.closePath(); nFill(c, N89.scarf, NOAH.W * .7);
    }
    // head from behind: all hair, strands swept back, ends at the nape
    c.save(); c.translate(0, cy + 260); c.rotate(p.tilt || 0); c.translate(0, -(cy + 260));
    c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); nFill(c, NOAH.hair, NOAH.W);
    c.save(); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.clip(); for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * 30, cy - R); c.quadraticCurveTo(i * 44, cy, i * 36, cy + R); c.lineWidth = 5; c.strokeStyle = i % 2 ? NOAH.hairDark : NOAH.hairLight; c.stroke(); } c.restore();
    c.beginPath(); c.moveTo(-200, cy + 150); for (let i = 0; i <= 10; i++) c.lineTo(-200 + i * 40, cy + 250 + (i % 2) * 34); c.lineTo(200, cy + 150); c.closePath(); nFill(c, NOAH.hair, NOAH.W * .6);
    for (const s of [-1, 1]) { ell(c, s * (R - 6), cy + 10, 22, 46); nFill(c, NOAH.skin, NOAH.W * .7); }
    c.restore(); c.restore();
  });
}
