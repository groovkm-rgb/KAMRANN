// OLD NOAH costume layers for "Der Hauptmann von Köpenick". The rig (noah.js) is unchanged: these wrap its
// functions and add layers (grey hair/moustache, apron, Prussian captain's uniform, cap, cape, sword).
// Set NC before drawing (use drawOld / drawOldSide which do that).
let NC = null;
const UNI = { coat: '#1c2440', coatHi: '#2c375c', coatLo: '#121830', red: '#b3302d', redLo: '#7e1f1e', silver: '#d7dbe2', silverLo: '#8f96a3', btn: '#e8d68a', btnLo: '#9c8740', patch: '#2a3456', cape: '#7b7f86', capeLo: '#5c6068', capeHi: '#9a9ea6', belt: '#17130f' };
const APRON = { a: '#8a5a36', lo: '#6a4226', hi: '#a8754a', patch1: '#6e5a40', patch2: '#9c6b3e', strap: '#5a3a22' };
const OLDHAIR = { hair: '#a19c97', hairDark: '#77726e', hairLight: '#d4d0cb', brow: '#8e8984' };

const _origFace = noahFace, _origHead = noahHeadLocal, _origTorso = noahTorso, _origArm = noahArm, _origLegs = noahLegs;
const _origSideHead = noahSideHead, _origSideTorso = noahSideTorso, _origSideArm = noahSideArm;

function oldMoustache(c, cy, lift = 0) {
  // big grey Kaiser-style moustache, ends curled up
  const my = cy + 122, up = 46 + lift * 20;
  c.beginPath(); c.moveTo(0, my - 26);
  c.bezierCurveTo(-40, my - 46, -110, my - 40, -150, my - 8);
  c.bezierCurveTo(-178, my - 24, -196, my - up - 20, -184, my - up - 46);
  c.bezierCurveTo(-176, my - up - 20, -190, my - 4, -150, my + 22);
  c.bezierCurveTo(-110, my + 34, -50, my + 22, 0, my + 6);
  c.bezierCurveTo(50, my + 22, 110, my + 34, 150, my + 22);
  c.bezierCurveTo(190, my - 4, 176, my - up - 20, 184, my - up - 46);
  c.bezierCurveTo(196, my - up - 20, 178, my - 24, 150, my - 8);
  c.bezierCurveTo(110, my - 40, 40, my - 46, 0, my - 26); c.closePath();
  c.fillStyle = NOAH.hair; c.fill(); c.lineWidth = NOAH.W * .7; c.strokeStyle = NOAH.out; c.lineJoin = 'round'; c.stroke();
  c.save(); c.clip();
  for (let i = -5; i <= 5; i++) { if (!i) continue; const x = i * 26; ln(c, [x * .4, my - 20, x, my + 12 - Math.abs(i) * 3], 4, i % 2 ? OLDHAIR.hairDark : OLDHAIR.hairLight); }
  c.restore();
}
noahFace = function (c, e) {
  if (!NC || !NC.old) return _origFace(c, e);
  const cy = NOAH.HEAD.y, ee = Object.assign({}, e);
  const custom = ee.mouth === 'smirk' || ee.mouth === 'grin';
  if (custom) ee.mouth = 'none';
  _origFace(c, ee);
  const my = cy + 148;
  if (e.mouth === 'smirk') { c.beginPath(); c.moveTo(-50, my + 4); c.quadraticCurveTo(10, my + 14, 66, my - 18); c.lineWidth = 9; c.strokeStyle = NOAH.out; c.lineCap = 'round'; c.stroke(); }
  if (e.mouth === 'grin') { c.beginPath(); c.moveTo(-70, my - 4); c.quadraticCurveTo(0, my + 52, 72, my - 4); c.quadraticCurveTo(0, my + 14, -70, my - 4); c.fillStyle = NOAH.mouthIn; c.fill(); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  // age: soft crow's feet and under-eye lines
  const age = NC.age ?? 1; c.save(); c.globalAlpha = age;
  for (const s of [-1, 1]) { ln(c, [s * 150, cy + 14, s * 172, cy + 4], 4, 'rgba(60,50,45,.55)'); ln(c, [s * 150, cy + 30, s * 174, cy + 34], 4, 'rgba(60,50,45,.55)'); c.beginPath(); c.moveTo(s * 70, cy + 70); c.quadraticCurveTo(s * 92, cy + 82, s * 116, cy + 70); c.lineWidth = 4; c.strokeStyle = 'rgba(60,50,45,.4)'; c.stroke(); }
  c.restore();
  const ms = NC.mScale ?? 1; if (ms > .02) { c.save(); c.translate(0, cy + 122); c.scale(ms, ms); c.translate(0, -(cy + 122)); oldMoustache(c, cy, NC.mLift || 0); c.restore(); }
};
function capLocal(c, cy, o = {}) {
  // Prussian officer's peaked cap (Schirmmütze) sitting on the head; head-local coords (cy = head centre)
  const y0 = cy - 205;
  // crown (wide top)
  c.beginPath(); c.moveTo(-232, y0 - 40); c.bezierCurveTo(-300, y0 - 120, -250, y0 - 190, 0, y0 - 196); c.bezierCurveTo(250, y0 - 190, 300, y0 - 120, 232, y0 - 40); c.closePath();
  fs(c, lg(c, 0, y0 - 196, 0, y0 - 40, [[0, UNI.coatHi], [1, UNI.coat]]), NOAH.W * .9);
  ln(c, [-250, y0 - 118, 250, y0 - 118], 6, UNI.red); // piping
  // red band
  c.beginPath(); c.moveTo(-236, y0 - 44); c.quadraticCurveTo(0, y0 - 70, 236, y0 - 44); c.lineTo(240, y0 + 22); c.quadraticCurveTo(0, y0 + 2, -240, y0 + 22); c.closePath(); fs(c, UNI.red, NOAH.W * .9);
  ln(c, [-200, y0 - 30, 200, y0 - 30], 4, 'rgba(255,200,190,.35)');
  // cockades
  el(c, 0, y0 - 92, 26, 22); fs(c, '#f2f2f0', 5); el(c, 0, y0 - 92, 12, 10); fs(c, '#1a1a1a'); el(c, 0, y0 - 14, 22, 18); fs(c, '#e9e5da', 5); el(c, 0, y0 - 14, 9, 8); fs(c, UNI.red);
  // visor (shiny black leather)
  c.beginPath(); c.moveTo(-210, y0 + 18); c.quadraticCurveTo(0, y0 + 2, 210, y0 + 18); c.quadraticCurveTo(150, y0 + 92, 0, y0 + 96); c.quadraticCurveTo(-150, y0 + 92, -210, y0 + 18); c.closePath();
  fs(c, lg(c, 0, y0 + 10, 0, y0 + 96, [[0, '#3a3634'], [1, '#0f0d0c']]), NOAH.W * .9);
  c.beginPath(); c.moveTo(-120, y0 + 40); c.quadraticCurveTo(0, y0 + 52, 110, y0 + 38); c.lineWidth = 8; c.strokeStyle = 'rgba(255,255,255,.35)'; c.stroke();
  // visor shadow on the forehead
  c.save(); c.globalAlpha = .18; el(c, 0, y0 + 120, 190, 34); c.fillStyle = '#000'; c.fill(); c.restore();
}
noahHeadLocal = function (c, e = {}) {
  _origHead(c, e);
  if (NC && NC.cap) capLocal(c, NOAH.HEAD.y);
};
function capWorld(c, x, y, k, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k); c.translate(0, -(NOAH.HEAD.y - 205 - 60)); capLocal(c, NOAH.HEAD.y); c.restore(); }

function apronLocal(c) {
  // patched cobbler's leather apron over the tee; bib starts below the lettering
  c.beginPath(); c.moveTo(-108, -735); c.lineTo(108, -735); c.lineTo(118, -600); c.lineTo(150, -585); c.lineTo(162, -300); c.quadraticCurveTo(0, -278, -162, -300); c.lineTo(-150, -585); c.lineTo(-118, -600); c.closePath();
  fs(c, lg(c, -160, 0, 160, 0, [[0, APRON.lo], [.45, APRON.a], [1, APRON.lo]]), NOAH.W);
  c.save(); c.clip();
  rr(c, -120, -470, 84, 70, 6); fs(c, APRON.patch2, 4); for (let i = 0; i < 6; i++) ln(c, [-114 + i * 14, -476, -110 + i * 14, -466], 3, '#e8d7b0');
  rr(c, 40, -380, 92, 62, 6); fs(c, APRON.patch1, 4); for (let i = 0; i < 6; i++) ln(c, [46 + i * 15, -386, 50 + i * 15, -376], 3, '#e8d7b0');
  ln(c, [-150, -585, 150, -585], 4, APRON.strap);
  for (let i = 0; i < 8; i++) ln(c, [-90 + i * 26, -560 + (i % 3) * 30, -80 + i * 26, -520 + (i % 3) * 30], 3, 'rgba(255,230,190,.14)');
  rr(c, -70, -560, 140, 80, 8); fs(c, APRON.hi, 4); ln(c, [-50, -540, 50, -540], 3, APRON.lo); // pocket
  c.restore();
  ln(c, [-100, -735, -60, -950], 14, APRON.strap); ln(c, [100, -735, 60, -950], 14, APRON.strap); // neck straps
}
function capeBack(c) {
  // long grey cape hanging behind the body, seen at the sides
  const sw = Math.sin((NC.t || 0) * 1.7) * 10 * (NC.capeWind ?? 1);
  c.beginPath(); c.moveTo(-170, -965); c.quadraticCurveTo(-250, -700, -268 - sw, -230); c.quadraticCurveTo(-180, -212, -120, -240); c.lineTo(120, -240); c.quadraticCurveTo(180, -212, 268 + sw, -230); c.quadraticCurveTo(250, -700, 170, -965); c.closePath();
  fs(c, lg(c, -270, 0, 270, 0, [[0, UNI.capeLo], [.2, UNI.cape], [.8, UNI.cape], [1, UNI.capeLo]]), NOAH.W);
  for (const s of [-1, 1]) ln(c, [s * 200, -800, s * (232 + sw * .5), -260], 5, UNI.capeLo);
}
function capeCollar(c) { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 60, -965); c.quadraticCurveTo(s * 160, -985, s * 205, -905); c.quadraticCurveTo(s * 150, -880, s * 80, -905); c.closePath(); fs(c, UNI.capeHi, NOAH.W * .8); } }
function jacketLocal(c) {
  const hem = -420;
  c.beginPath(); c.moveTo(-62, -958); c.lineTo(-166, -948); c.quadraticCurveTo(-158, -820, -146, -760); c.lineTo(-158, hem); c.quadraticCurveTo(0, hem + 18, 162, hem); c.lineTo(150, -760); c.quadraticCurveTo(162, -820, 170, -948); c.lineTo(62, -958);
  c.lineTo(30, -880); c.lineTo(-30, -880); c.closePath();
  fs(c, lg(c, -170, 0, 170, 0, [[0, UNI.coatLo], [.35, UNI.coat], [.7, UNI.coatHi], [1, UNI.coatLo]]), NOAH.W);
  // black tee edge showing in the slightly open collar
  P(c, [-30, -880, 30, -880, 22, -850, -22, -850]); fs(c, NOAH.shirt, 5);
  // red stand collar
  for (const s of [-1, 1]) { P(c, [s * 62, -958, s * 30, -880, s * 46, -876, s * 86, -952]); fs(c, UNI.red, NOAH.W * .7); }
  // front edge + two rows of buttons
  ln(c, [0, -872, 0, hem + 8], 5, UNI.coatLo);
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const x = s * (44 - i * 3), y = -830 + i * 64; el(c, x, y, 13, 13); fs(c, UNI.btn, 4); el(c, x - 4, y - 4, 5, 4); c.fillStyle = '#fffbe6'; c.fill(); }
  // red piping at the hem + small patch (second-hand jacket)
  ln(c, [-156, hem - 4, 160, hem - 4], 6, UNI.red);
  rr(c, -132, -690, 58, 50, 4); fs(c, UNI.patch, 4); for (let i = 0; i < 4; i++) ln(c, [-126 + i * 15, -696, -124 + i * 15, -686], 3, '#9aa3c0');
  // belt + buckle
  rr(c, -156, -575, 314, 40, 6); fs(c, UNI.belt, 5); rr(c, -28, -580, 56, 50, 6); fs(c, UNI.silver, 5);
}
function swordFront(c) {
  // sword in its scabbard on the left hip (never drawn)
  c.save(); c.translate(-150, -560); c.rotate(.22);
  rr(c, -14, 0, 28, 500, 10); fs(c, lg(c, -14, 0, 14, 0, [[0, '#2a2a2e'], [.5, '#55555c'], [1, '#1c1c20']]), NOAH.W * .8);
  rr(c, -18, 470, 36, 46, 10); fs(c, UNI.silver, 5); rr(c, -18, 80, 36, 26, 6); fs(c, UNI.silver, 5);
  ln(c, [-4, 20, -4, 460], 4, 'rgba(255,255,255,.35)');
  rr(c, -10, -90, 20, 90, 6); fs(c, '#d8c27a', 5); P(c, [-40, -6, 40, -6, 30, 8, -30, 8]); fs(c, '#d8c27a', 5); el(c, 0, -98, 16, 14); fs(c, '#d8c27a', 5);
  c.restore();
}
noahTorso = function (c) {
  if (!NC) return _origTorso(c);
  _origTorso(c);
  if (NC.outfit === 'apron') apronLocal(c);
  if (NC.outfit === 'uniform') { jacketLocal(c); if (NC.sword) swordFront(c); }
  if (NC.cape) capeCollar(c);
};
noahLegs = function (c, p) {
  if (NC && NC.cape) capeBack(c);
  _origLegs(c, p);
  if (NC && NC.outfit === 'uniform') for (const s of [-1, 1]) ln(c, [s * 112, NOAH.HEM - 10, s * 104, -100], 9, UNI.red);
};
noahArm = function (c, side, spec, watch, sleeve = true) {
  if (!NC || NC.outfit !== 'uniform') return _origArm(c, side, spec, watch, sleeve);
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  const cf = .80, cx = ex + (wx - ex) * cf, cyy = ey + (wy - ey) * cf;
  nLine(c, [sx, sy, ex, ey, wx, wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey, wx, wy], NOAH.ARM_W, NOAH.skin);
  // long navy sleeve (a bit too long: reaches far down the forearm) with red cuff
  nLine(c, [sx, sy, ex, ey, cx, cyy], NOAH.ARM_W + 30 + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey, cx, cyy], NOAH.ARM_W + 30, UNI.coat);
  nLine(c, [ex + (cx - ex) * .8, ey + (cyy - ey) * .8, cx, cyy], NOAH.ARM_W + 30, UNI.red);
  nLine(c, [sx + 6 * side, sy + 10, ex + 6 * side, ey], 8, 'rgba(120,140,200,.25)');
  if (watch) {
    const k = .9, wcx = ex + (wx - ex) * k, wcy = ey + (wy - ey) * k, fx = side * Math.sin(a2), fy = Math.cos(a2);
    nLine(c, [wcx - fy * 40, wcy + fx * 40, wcx + fy * 40, wcy - fx * 40], 22, NOAH.out); nLine(c, [wcx - fy * 36, wcy + fx * 36, wcx + fy * 36, wcy - fx * 36], 13, NOAH.watch);
    c.beginPath(); c.arc(wcx + fy * 34 * side, wcy - fx * 34 * side, 18, 0, Math.PI * 2); nFill(c, NOAH.watch, 8);
    glow(c, wcx + fy * 34 * side - 4, wcy - fx * 34 * side - 4, 30, '255,240,190', .5);
  }
  c.save(); c.translate(wx, wy); noahHandLocal(c, -side * a2 + (spec.hand || 0)); c.restore();
  // silver epaulette on the shoulder
  c.save(); c.translate(sx + side * 10, sy - 8); c.rotate(side * (a * .3 - .15));
  el(c, 0, 0, 62, 30); fs(c, lg(c, 0, -30, 0, 30, [[0, '#f4f6fa'], [1, UNI.silverLo]]), NOAH.W * .8);
  for (let i = -3; i <= 3; i++) ln(c, [i * 15, 22, i * 16, 50], 7, UNI.silver);
  el(c, -10, -8, 22, 8); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
  c.restore();
};

// ---------- public front-view draw ----------
// costume: { outfit: 'apron'|'uniform'|'tee', cap, cape, sword, hunch 0..1, t, mLift }
function drawOld(c, p, costume) {
  const save = { hair: NOAH.hair, hairDark: NOAH.hairDark, hairLight: NOAH.hairLight, brow: NOAH.brow, pants: NOAH.pants, stripe: NOAH.stripe, shoe: NOAH.shoe };
  Object.assign(NOAH, OLDHAIR);
  if (costume.hairMix !== undefined) for (const key of ['hair', 'hairDark', 'hairLight', 'brow']) NOAH[key] = mixHex(save[key], OLDHAIR[key], costume.hairMix);
  if (costume.outfit === 'uniform') Object.assign(NOAH, { pants: '#1f2742', stripe: '#2a3350', shoe: '#141112' });
  NC = Object.assign({ old: true }, costume);
  const h = costume.hunch || 0;
  try { drawNoah(c, Object.assign({ ink: 1.35, k: .5 }, p, { bob: (p.bob || 0) + h * 34, tilt: (p.tilt || 0) })); }
  finally { NC = null; Object.assign(NOAH, save); }
}

// ---------- side view with arm control, cape, sword ----------
noahSideHead = function (c, e = {}) {
  _origSideHead(c, e);
  if (!NC || !NC.old) return;
  // wrinkle + moustache (profile)
  ln(c, [250, -1205, 232, -1192], 4, 'rgba(60,50,45,.5)');
  c.beginPath(); c.moveTo(70, -1132); c.bezierCurveTo(110, -1160, 200, -1162, 236, -1132); c.bezierCurveTo(262, -1150, 268, -1186, 252, -1206);
  c.bezierCurveTo(286, -1186, 284, -1120, 236, -1102); c.bezierCurveTo(190, -1088, 110, -1096, 70, -1132); c.closePath();
  c.fillStyle = OLDHAIR.hair; c.fill(); c.lineWidth = NOAH.W * .7; c.strokeStyle = NOAH.out; c.stroke();
  for (let i = 0; i < 5; i++) ln(c, [110 + i * 26, -1140, 118 + i * 26, -1108], 4, i % 2 ? OLDHAIR.hairDark : OLDHAIR.hairLight);
  if (NC.cap) {
    c.save(); c.translate(0, -1450); c.rotate(-.04);
    c.beginPath(); c.moveTo(-250, 40); c.bezierCurveTo(-300, -40, -230, -120, 20, -126); c.bezierCurveTo(260, -124, 320, -40, 260, 40); c.closePath(); fs(c, lg(c, 0, -126, 0, 40, [[0, UNI.coatHi], [1, UNI.coat]]), NOAH.W * .9);
    ln(c, [-270, -48, 290, -48], 6, UNI.red);
    c.beginPath(); c.moveTo(-252, 36); c.lineTo(262, 36); c.lineTo(262, 100); c.lineTo(-248, 104); c.closePath(); fs(c, UNI.red, NOAH.W * .9);
    el(c, 200, 70, 18, 18); fs(c, '#e9e5da', 5);
    c.beginPath(); c.moveTo(150, 100); c.lineTo(262, 96); c.quadraticCurveTo(360, 112, 380, 150); c.quadraticCurveTo(300, 150, 150, 128); c.closePath(); fs(c, '#141010', NOAH.W * .8);
    ln(c, [220, 118, 340, 136], 6, 'rgba(255,255,255,.3)');
    c.restore();
  }
};
noahSideTorso = function (c, cave, s = 1) {
  if (!NC || !NC.old) return _origSideTorso(c, cave, s);
  _origSideTorso(c, cave, s);
  if (NC.outfit === 'apron') { P(c, [70, -760, 130, -760, 150, -300, 90, -300]); fs(c, APRON.a, NOAH.W); ln(c, [80, -760, 30, -960], 12, APRON.strap); }
  if (NC.outfit === 'uniform') {
    c.beginPath(); c.moveTo(-70, -972); c.quadraticCurveTo(-118, -962, -124, -936); c.lineTo(-132, -420); c.quadraticCurveTo(0, -404, 132, -420); c.lineTo(118, -930); c.quadraticCurveTo(96, -966, 50, -972); c.closePath();
    fs(c, lg(c, -130, 0, 130, 0, [[0, UNI.coatLo], [.6, UNI.coat], [1, UNI.coatHi]]), NOAH.W);
    P(c, [40, -975, 104, -955, 104, -905, 52, -915]); fs(c, UNI.red, NOAH.W * .7);
    P(c, [60, -930, 100, -930, 96, -905, 64, -905]); c.fillStyle = NOAH.shirt; c.fill();
    for (let i = 0; i < 6; i++) { el(c, 96, -840 + i * 64, 12, 12); fs(c, UNI.btn, 4); }
    rr(c, -132, -590, 266, 38, 6); fs(c, UNI.belt, 5);
    ln(c, [-128, -424, 130, -424], 6, UNI.red);
    if (NC.sword) { c.save(); c.translate(-20, -570); c.rotate(.95); rr(c, -13, 0, 26, 460, 10); fs(c, '#3a3a40', NOAH.W * .8); rr(c, -16, 430, 32, 40, 10); fs(c, UNI.silver, 5); rr(c, -9, -80, 18, 80, 6); fs(c, '#d8c27a', 5); c.restore(); }
  }
};
function sideArmUni(c, th, bend, far) {
  const [sx, sy] = NOAH_SIDE.SHOULDER, ex = sx + Math.sin(th) * NOAH.UPPER, ey = sy + Math.cos(th) * NOAH.UPPER, t2 = th + bend, wx = ex + Math.sin(t2) * NOAH.FORE, wy = ey + Math.cos(t2) * NOAH.FORE;
  const cx = ex + (wx - ex) * .8, cy = ey + (wy - ey) * .8, col = far ? UNI.coatLo : UNI.coat;
  nLine(c, [sx, sy, ex, ey, wx, wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey, wx, wy], NOAH.ARM_W, far ? '#e8e4e0' : NOAH.skin);
  nLine(c, [sx, sy, ex, ey, cx, cy], NOAH.ARM_W + 30 + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey, cx, cy], NOAH.ARM_W + 30, col);
  nLine(c, [ex + (cx - ex) * .8, ey + (cy - ey) * .8, cx, cy], NOAH.ARM_W + 30, far ? UNI.redLo : UNI.red);
  if (!far) { const k = .9, x = ex + (wx - ex) * k, y = ey + (wy - ey) * k; c.beginPath(); c.arc(x, y, 20, 0, TAU); nFill(c, NOAH.watch, 8); }
  c.save(); c.translate(wx, wy); c.scale(.92, 1); noahHandLocal(c, -t2); c.restore();
  if (!far) { c.save(); c.translate(sx, sy - 10); el(c, 0, 0, 58, 26); fs(c, UNI.silver, NOAH.W * .8); for (let i = -3; i <= 3; i++) ln(c, [i * 14, 20, i * 15, 44], 6, UNI.silver); c.restore(); }
}
// p: { x, y, k, s, walk, expr, tilt, bob, arms: { near:{th,bend}, far:{th,bend} } } costume as drawOld
function drawOldSide(c, p, costume) {
  const save = { hair: NOAH.hair, hairDark: NOAH.hairDark, hairLight: NOAH.hairLight, brow: NOAH.brow, pants: NOAH.pants, stripe: NOAH.stripe, shoe: NOAH.shoe };
  Object.assign(NOAH, OLDHAIR);
  const uni = costume.outfit === 'uniform';
  if (uni) Object.assign(NOAH, { pants: '#1f2742', stripe: '#2a3350', shoe: '#141112' });
  NC = Object.assign({ old: true }, costume);
  const W0 = NOAH.W; NOAH.W = W0 * (p.ink ?? 1.35);
  try {
    const k = p.k ?? .5, e = p.expr || {}, ph = p.walk, walking = ph !== null && ph !== undefined;
    const sw = walking ? Math.sin(ph) : 0, lift = walking ? Math.max(0, Math.cos(ph)) : 0, lift2 = walking ? Math.max(0, -Math.cos(ph)) : 0;
    const bob = (walking ? -Math.abs(Math.cos(ph)) * 12 : 0) + (p.bob || 0) + (costume.hunch || 0) * 30, aSw = p.armSwing ?? .3;
    const A = p.arms || {}, near = A.near || { th: walking ? -aSw * sw : .02, bend: walking ? .12 + .1 * Math.max(0, -sw) : -.05 }, far = A.far || { th: walking ? aSw * sw : .05, bend: walking ? .12 : -.05 };
    c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
    if (costume.cape) { // cape hangs behind the back, sways
      const wv = Math.sin((costume.t || 0) * 2.1) * 20 + (walking ? Math.sin(ph) * 14 : 0);
      c.beginPath(); c.moveTo(-60, -975); c.quadraticCurveTo(-220, -700, -300 - wv, -240); c.quadraticCurveTo(-150, -205, -40, -250); c.lineTo(20, -940); c.closePath();
      fs(c, lg(c, -300, 0, 0, 0, [[0, UNI.capeLo], [1, UNI.cape]]), NOAH.W); ln(c, [-110, -800, -210 - wv * .6, -280], 5, UNI.capeLo);
    }
    c.save(); c.translate(0, bob);
    if (uni) sideArmUni(c, far.th, far.bend, true); else noahSideArm(c, far.th, far.bend, true, false);
    noahSideLeg(c, walking ? -.42 * sw : -.03, walking ? .7 * lift2 : 0, true, false);
    noahSideLeg(c, walking ? .42 * sw : .03, walking ? .7 * lift : 0, false, false);
    if (uni) { for (const L of [0]) { } }
    noahSideTorso(c, false, p.s || 1);
    c.beginPath(); c.rect(-28, -1000, 72, 50); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-28, -1000, -28, -958], 9, NOAH.out); nLine(c, [44, -1000, 44, -958], 9, NOAH.out);
    if (costume.cape) { c.beginPath(); c.moveTo(-80, -985); c.quadraticCurveTo(-140, -930, -110, -860); c.lineTo(-40, -880); c.lineTo(10, -970); c.closePath(); fs(c, UNI.capeHi, NOAH.W * .8); }
    c.save(); c.translate(0, -980); c.rotate(p.tilt || 0); c.translate(0, 980); noahSideHead(c, e); c.restore();
    if (uni) sideArmUni(c, near.th, near.bend, false); else noahSideArm(c, near.th, near.bend, false, false);
    c.restore(); c.restore();
  } finally { NOAH.W = W0; NC = null; Object.assign(NOAH, save); }
}

function mixHex(a, b, t) { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); return '#' + [16, 8, 0].map(sh => Math.round(((A >> sh) & 255) * (1 - t) + ((B >> sh) & 255) * t).toString(16).padStart(2, '0')).join(''); }
