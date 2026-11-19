// OUTFIT LAYERS for Noah: 'agent' | 'pyjama' | 'home' | 'old' (+ the rig's own 'classic' / 'caveman').
// Clothes are drawn on top of the UNCHANGED rig geometry (NOAH / NOAH_SIDE): same shoulder, elbow, wrist,
// hip and head positions; only colours, sleeves and extra garment shapes change.
//   drawNoah(c, { ..., outfit: 'agent', coat: true, hat: true })      front view
//   drawNoahSide(c, { ..., outfit: 'agent', coat: true, hat: true })  side view / walk
//   expr.bags = 1  → under-eye bags (sleepless)
// The watch stays on the same wrist as on the reference (arm 'r' in the front view).
const NX = {
  cur: null, p: null,
  OUT: {
    agent:  { pants: '#1d2640', stripe: '#28324f', shoe: '#17151a', jacket: '#1f2a45', lapel: '#18213a', shirt: '#f4f2ec', tie: '#15171d', coat: '#8b8d88', coatDark: '#6c6e6a', sleeve: '#1f2a45' },
    pyjama: { pants: '#8fa3bf', stripe: '#c9d6e6', shoe: '#4a3f4a', top: '#8fa3bf', topStripe: '#c9d6e6', piping: '#2f3f5f', sleeve: '#8fa3bf' },
    home:   { pants: NOAH.pants, stripe: NOAH.stripe, shoe: NOAH.shoe, top: '#7a5a48', rib: '#5f4436', sleeve: '#7a5a48' },
    old:    { pants: '#4a4a4e', stripe: '#56565a', shoe: '#2a2624', coat: '#77797a', coatDark: '#5c5e60', shirt: '#e8e4dc', sleeve: '#77797a', hair: ['#b9b5b0', '#8e8a86', '#dedad5'], brow: '#9a958f' },
  },
};
const _nx = { drawNoah, drawNoahSide, noahTorso, noahArm, noahSideTorso, noahSideArm, noahHeadLocal, noahSideHead, noahFace, noahLetters };
function nxWith(p, fn) {
  const o = p.outfit && NX.OUT[p.outfit];
  if (!o || p._nx) return fn(p);
  const keep = {}, set = (k, v) => { keep[k] = NOAH[k]; NOAH[k] = v; };
  set('pants', o.pants); set('stripe', o.stripe); set('shoe', o.shoe);
  if (o.hair) { set('hair', o.hair[0]); set('hairDark', o.hair[1]); set('hairLight', o.hair[2]); set('brow', o.brow); }
  const prev = [NX.cur, NX.p]; NX.cur = p.outfit; NX.p = p;
  try { return fn(Object.assign({}, p, { _nx: 1 })); } finally { Object.assign(NOAH, keep); [NX.cur, NX.p] = prev; }
}
drawNoah = function (c, p = {}) { return nxWith(p, q => _nx.drawNoah(c, q)); };
drawNoahSide = function (c, p = {}) { return nxWith(p, q => _nx.drawNoahSide(c, q)); };

// ---------- front torso variants ----------
function nxTorsoPath(c, hem, flare = 0) {
  c.beginPath(); c.moveTo(-58, -952); c.lineTo(-150, -942); c.quadraticCurveTo(-140, -820, -128, -760); c.lineTo(-122 - flare, hem); c.lineTo(126 + flare, hem);
  c.lineTo(132, -760); c.quadraticCurveTo(144, -820, 155, -942); c.lineTo(58, -952); c.quadraticCurveTo(0, -915, -58, -952); c.closePath();
}
function nxSuit(c, o, coat) {
  // white shirt + tie first, then the jacket with an open V and lapels
  nxTorsoPath(c, NOAH.HEM + 30, 6); nFill(c, o.jacket);
  c.beginPath(); c.moveTo(-54, -950); c.quadraticCurveTo(0, -925, 54, -950); c.lineTo(8, -690); c.lineTo(-8, -690); c.closePath(); nFill(c, o.shirt, NOAH.W * .7);
  // collar points
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 50, -952); c.lineTo(s * 10, -918); c.lineTo(s * 36, -884); c.closePath(); nFill(c, o.shirt, NOAH.W * .5); }
  // thin tie: knot + blade
  c.beginPath(); c.moveTo(-14, -930); c.lineTo(14, -930); c.lineTo(10, -900); c.lineTo(-10, -900); c.closePath(); nFill(c, o.tie, NOAH.W * .5);
  c.beginPath(); c.moveTo(-10, -900); c.lineTo(10, -900); c.lineTo(17, -735); c.lineTo(0, -712); c.lineTo(-17, -735); c.closePath(); nFill(c, o.tie, NOAH.W * .5);
  // lapels (notched)
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 54, -952); c.lineTo(s * 108, -936); c.lineTo(s * 98, -872); c.lineTo(s * 124, -850); c.lineTo(s * 12, -688); c.lineTo(s * 8, -690); c.closePath(); nFill(c, o.lapel, NOAH.W * .6);
  }
  // buttons, centre line, pockets, pocket square
  nLine(c, [0, -688, 0, NOAH.HEM + 30], 5, '#0e1322');
  for (const y of [-640, -575]) { c.beginPath(); c.arc(-14, y, 9, 0, Math.PI * 2); nFill(c, '#0e1322', 3); }
  for (const s of [-1, 1]) nLine(c, [s * 50, -585, s * 112, -588], 6, '#121a2e');
  nLine(c, [-118, -800, -72, -803], 6, '#121a2e'); c.beginPath(); c.moveTo(-112, -803); c.lineTo(-104, -822); c.lineTo(-92, -808); c.lineTo(-80, -820); c.lineTo(-76, -803); c.closePath(); nFill(c, o.shirt, 3);
  // soft cloth shading on the jacket sides
  c.save(); nxTorsoPath(c, NOAH.HEM + 30, 6); c.clip(); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(70, -960, 120, 500); c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(-140, -960, 50, 500); c.restore();
  if (coat) nxCoatFront(c, o, -250);
}
function nxCoatFront(c, o, hem) {
  // open trench coat: two front panels, popped collar, belt with loose ends
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 50, -955); c.lineTo(s * 158, -946); c.quadraticCurveTo(s * 150, -820, s * 142, -760); c.lineTo(s * 186, hem); c.lineTo(s * 44, hem);
    c.lineTo(s * 40, -560); c.quadraticCurveTo(s * 70, -700, s * 128, -836); c.lineTo(s * 98, -872); c.lineTo(s * 110, -930); c.closePath(); nFill(c, o.coat);
    c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,.13)'; c.fillRect(s > 0 ? 100 : -200, -960, 100, 800); nLine(c, [s * 120, -520, s * 150, hem], 4, o.coatDark); nLine(c, [s * 70, -520, s * 76, hem], 3, o.coatDark); c.restore();
    // wide lapel
    c.beginPath(); c.moveTo(s * 64, -956); c.lineTo(s * 150, -938); c.lineTo(s * 132, -836); c.lineTo(s * 160, -806); c.lineTo(s * 52, -600); c.lineTo(s * 40, -604); c.quadraticCurveTo(s * 70, -720, s * 128, -836); c.lineTo(s * 98, -872); c.lineTo(s * 110, -930); c.closePath(); nFill(c, o.coatDark, NOAH.W * .6);
    // popped collar behind the neck
    c.beginPath(); c.moveTo(s * 52, -950); c.lineTo(s * 70, -1030); c.lineTo(s * 150, -990); c.lineTo(s * 150, -940); c.closePath(); nFill(c, o.coatDark, NOAH.W * .6);
    // belt piece + buckle loop, epaulette
    c.beginPath(); c.rect(s > 0 ? 42 : -176, -585, 134, 34); nFill(c, o.coatDark, NOAH.W * .6);
    c.beginPath(); c.rect(s > 0 ? 96 : -150, -950, 56, 22); nFill(c, o.coatDark, NOAH.W * .5);
    // buttons (double-breasted rows on the open panels)
    for (const y of [-760, -680]) { c.beginPath(); c.arc(s * 92, y, 9, 0, Math.PI * 2); nFill(c, '#3a3632', 3); }
  }
  // loose belt ends hanging
  nLine(c, [-60, -568, -78, -470], 26, NOAH.out); nLine(c, [-60, -568, -78, -470], 16, o.coatDark);
}
function nxPyjamaTorso(c, o) {
  nxTorsoPath(c, NOAH.HEM + 10); nFill(c, o.top);
  c.save(); nxTorsoPath(c, NOAH.HEM + 10); c.clip(); for (let x = -160; x < 170; x += 34) nLine(c, [x, -960, x + 4, -480], 10, o.topStripe); c.restore();
  nxTorsoPath(c, NOAH.HEM + 10); nFill(c, null);
  // collar with piping + button placket
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 58, -952); c.lineTo(s * 4, -905); c.lineTo(s * 52, -860); c.lineTo(s * 110, -930); c.closePath(); nFill(c, o.top, NOAH.W * .6); nLine(c, [s * 58, -950, s * 6, -905, s * 52, -862], 6, o.piping); }
  nLine(c, [8, -900, 8, NOAH.HEM + 10], 5, o.piping); for (const y of [-840, -760, -680, -600]) { c.beginPath(); c.arc(-6, y, 8, 0, Math.PI * 2); nFill(c, '#f2efe6', 3); }
  c.beginPath(); c.rect(-112, -790, 70, 70); nFill(c, null, NOAH.W * .5); nLine(c, [-112, -790, -42, -790], 6, o.piping);
}
function nxSweater(c, o) {
  nxTorsoPath(c, NOAH.HEM + 20); nFill(c, o.top);
  c.save(); nxTorsoPath(c, NOAH.HEM + 20); c.clip();
  for (let x = -150; x < 160; x += 46) { for (let y = -900; y < -520; y += 34) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10, y + 16); c.lineTo(x + 20, y); c.lineWidth = 3.5; c.strokeStyle = 'rgba(0,0,0,.16)'; c.stroke(); } }
  c.fillStyle = o.rib; c.fillRect(-160, NOAH.HEM - 40, 330, 70); for (let x = -150; x < 160; x += 14) nLine(c, [x, NOAH.HEM - 40, x, NOAH.HEM + 20], 3, 'rgba(0,0,0,.2)');
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(80, -960, 100, 500); c.restore();
  nxTorsoPath(c, NOAH.HEM + 20); nFill(c, null);
  // ribbed crew neck
  c.beginPath(); c.moveTo(-66, -955); c.quadraticCurveTo(0, -895, 66, -955); c.lineTo(58, -948); c.quadraticCurveTo(0, -912, -58, -948); c.closePath(); nFill(c, o.rib, NOAH.W * .6);
}
function nxOldCoat(c, o) {
  // plain grey wool coat, buttoned, collar, scarf-less
  nxTorsoPath(c, -260, 54); nFill(c, o.coat);
  c.save(); nxTorsoPath(c, -260, 54); c.clip(); c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(70, -960, 150, 760); nLine(c, [-10, -880, -20, -260], 5, o.coatDark); c.restore();
  c.beginPath(); c.moveTo(-54, -950); c.quadraticCurveTo(0, -925, 54, -950); c.lineTo(0, -860); c.closePath(); nFill(c, o.shirt, NOAH.W * .6);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 56, -954); c.lineTo(s * 130, -940); c.lineTo(s * 110, -860); c.lineTo(s * 4, -850); c.closePath(); nFill(c, o.coatDark, NOAH.W * .6); }
  for (const y of [-780, -680, -580, -480]) { c.beginPath(); c.arc(-24, y, 10, 0, Math.PI * 2); nFill(c, '#2e2b28', 3); }
  for (const s of [-1, 1]) nLine(c, [s * 50, -500, s * 130, -505], 6, o.coatDark);
}
noahTorso = function (c) {
  const o = NX.OUT[NX.cur];
  if (NX.cur === 'agent') return nxSuit(c, o, NX.p.coat);
  if (NX.cur === 'pyjama') return nxPyjamaTorso(c, o);
  if (NX.cur === 'home') return nxSweater(c, o);
  if (NX.cur === 'old') return nxOldCoat(c, o);
  return _nx.noahTorso(c);
};
// ---------- long sleeves (same joints as noahArm) ----------
noahArm = function (c, side, spec, watch, sleeve = true) {
  const o = NX.OUT[NX.cur];
  if (!o || !sleeve) return _nx.noahArm(c, side, spec, watch, sleeve);
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  const coat = (NX.cur === 'agent' && NX.p.coat) || NX.cur === 'old', col = coat ? o.coat : o.sleeve, wdt = NOAH.ARM_W + (coat ? 44 : 30);
  const P = k => [ex + (wx - ex) * k, ey + (wy - ey) * k], end = P(.84), cuff = P(.93);
  // bare wrist under the cuff, then sleeve
  nLine(c, [...end, wx, wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [...end, wx, wy], NOAH.ARM_W, NOAH.skin);
  if (NX.cur === 'agent' && !coat) { nLine(c, [...P(.7), ...cuff], NOAH.ARM_W + 14 + NOAH.W * 2, NOAH.out); nLine(c, [...P(.7), ...cuff], NOAH.ARM_W + 14, o.shirt); }
  nLine(c, [sx, sy, ex, ey, ...end], wdt + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey, ...end], wdt, col);
  if (NX.cur === 'pyjama') { c.save(); c.globalAlpha = .9; nLine(c, [sx, sy, ex, ey, ...end], 8, o.topStripe); c.restore(); }
  if (coat) { const q = P(.72); nLine(c, [q[0] - 40, q[1] - 6, q[0] + 40, q[1] + 6], 14, o.coatDark); }
  // elbow crease
  nLine(c, [ex - side * 18, ey - 6, ex + side * 10, ey + 10], 4, 'rgba(0,0,0,.35)');
  if (watch && !NX.pal) {
    const [cx, cy] = P(.95), fx = side * Math.sin(a2), fy = Math.cos(a2);
    nLine(c, [cx - fy * 40, cy + fx * 40, cx + fy * 40, cy - fx * 40], 22, NOAH.out); nLine(c, [cx - fy * 36, cy + fx * 36, cx + fy * 36, cy - fx * 36], 13, NOAH.watch);
    c.beginPath(); c.arc(cx + fy * 34 * side, cy - fx * 34 * side, 18, 0, Math.PI * 2); nFill(c, NOAH.watch, 8);
  }
  c.save(); c.translate(wx, wy); noahHandLocal(c, -side * a2 + (spec.hand || 0)); c.restore();
};
// ---------- side view ----------
noahSideTorso = function (c, cave, s = 1) {
  const o = NX.OUT[NX.cur]; if (!o || cave) return _nx.noahSideTorso(c, cave, s);
  const body = () => { c.beginPath(); c.moveTo(-60, -968); c.quadraticCurveTo(-100, -960, -110, -940); c.lineTo(-116, -500); c.lineTo(108, -500); c.lineTo(104, -930); c.quadraticCurveTo(84, -960, 40, -968); c.quadraticCurveTo(-10, -948, -60, -968); c.closePath(); };
  if (NX.cur === 'agent') {
    body(); nFill(c, o.jacket);
    c.beginPath(); c.moveTo(40, -966); c.lineTo(104, -930); c.lineTo(102, -760); c.lineTo(70, -820); c.closePath(); nFill(c, o.shirt, NOAH.W * .6);
    nLine(c, [96, -930, 98, -770], 12, o.tie); c.beginPath(); c.moveTo(40, -966); c.lineTo(80, -880); c.lineTo(100, -750); c.lineTo(70, -820); c.closePath(); nFill(c, o.lapel, NOAH.W * .5);
    nLine(c, [-20, -600, 60, -602], 6, '#121a2e'); c.beginPath(); c.arc(96, -640, 8, 0, Math.PI * 2); nFill(c, '#0e1322', 3);
    if (NX.p.coat) {
      const sw = NX.p.walk != null ? Math.sin(NX.p.walk) * 14 : 0;
      c.beginPath(); c.moveTo(-70, -985); c.quadraticCurveTo(-118, -970, -126, -940); c.lineTo(-150 - sw, -250); c.lineTo(150 + sw, -250); c.lineTo(118, -930); c.quadraticCurveTo(94, -975, 44, -985); c.quadraticCurveTo(-10, -965, -70, -985); c.closePath(); nFill(c, o.coat);
      c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-160, -1000, 70, 760); nLine(c, [20, -540, 10 - sw * .5, -250], 4, o.coatDark); nLine(c, [-80, -540, -100 - sw, -250], 4, o.coatDark); c.restore();
      c.beginPath(); c.moveTo(-40, -975); c.lineTo(-90, -1050); c.lineTo(60, -1040); c.lineTo(80, -960); c.closePath(); nFill(c, o.coatDark, NOAH.W * .6);
      c.beginPath(); c.moveTo(40, -980); c.lineTo(118, -930); c.lineTo(122, -800); c.lineTo(90, -840); c.closePath(); nFill(c, o.coatDark, NOAH.W * .5);
      c.beginPath(); c.rect(-140, -590, 280, 36); nFill(c, o.coatDark, NOAH.W * .6); c.beginPath(); c.rect(60, -596, 34, 48); nFill(c, '#3a3632', 4);
      nLine(c, [80, -560, 96 + sw, -470], 24, NOAH.out); nLine(c, [80, -560, 96 + sw, -470], 14, o.coatDark);
    }
  } else if (NX.cur === 'old') {
    c.beginPath(); c.moveTo(-70, -985); c.quadraticCurveTo(-118, -970, -126, -940); c.lineTo(-140, -260); c.lineTo(140, -260); c.lineTo(118, -930); c.quadraticCurveTo(94, -975, 44, -985); c.quadraticCurveTo(-10, -965, -70, -985); c.closePath(); nFill(c, o.coat);
    c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-150, -1000, 70, 760); c.restore();
    for (const y of [-780, -680, -580, -480]) { c.beginPath(); c.arc(100, y, 9, 0, Math.PI * 2); nFill(c, '#2e2b28', 3); }
    c.beginPath(); c.moveTo(-40, -975); c.lineTo(-70, -1030); c.lineTo(60, -1030); c.lineTo(80, -960); c.closePath(); nFill(c, o.coatDark, NOAH.W * .6);
  } else {
    body(); nFill(c, NX.cur === 'pyjama' ? o.top : o.top);
    if (NX.cur === 'pyjama') { c.save(); body(); c.clip(); for (let x = -120; x < 120; x += 34) nLine(c, [x, -970, x, -490], 10, o.topStripe); c.restore(); body(); nFill(c, null); }
    if (NX.cur === 'home') { c.fillStyle = o.rib; c.fillRect(-114, -560, 220, 60); body(); nFill(c, null); }
  }
};
noahSideArm = function (c, th, bend, far, cave) {
  const o = NX.OUT[NX.cur]; if (!o || cave) return _nx.noahSideArm(c, th, bend, far, cave);
  const [sx, sy] = NOAH_SIDE.SHOULDER;
  const ex = sx + Math.sin(th) * NOAH.UPPER, ey = sy + Math.cos(th) * NOAH.UPPER, t2 = th + bend, wx = ex + Math.sin(t2) * NOAH.FORE, wy = ey + Math.cos(t2) * NOAH.FORE;
  const coat = (NX.cur === 'agent' && NX.p.coat) || NX.cur === 'old', col0 = coat ? o.coat : o.sleeve, col = far ? shadeHex(col0, -.22) : col0, wdt = NOAH.ARM_W + (coat ? 44 : 30);
  const end = [ex + (wx - ex) * .86, ey + (wy - ey) * .86];
  nLine(c, [...end, wx, wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [...end, wx, wy], NOAH.ARM_W, far ? '#e8e4e0' : NOAH.skin);
  nLine(c, [sx, sy, ex, ey, ...end], wdt + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey, ...end], wdt, col);
  if (NX.cur === 'agent' && !coat) { const q = [ex + (wx - ex) * .88, ey + (wy - ey) * .88]; nLine(c, [...end, ...q], NOAH.ARM_W + 10, o.shirt); }
  c.save(); c.translate(wx, wy); c.scale(.92, 1); noahHandLocal(c, -t2); c.restore();
};
// ---------- hat (fedora) + face extras ----------
function nxHatFront(c, cy) {
  const col = '#2f3136', band = '#16171a';
  c.beginPath(); c.ellipse(0, cy - 205, 320, 46, 0, 0, Math.PI * 2); nFill(c, col);
  c.beginPath(); c.moveTo(-205, cy - 215); c.bezierCurveTo(-215, cy - 330, -185, cy - 410, -60, cy - 415); c.quadraticCurveTo(0, cy - 385, 60, cy - 415); c.bezierCurveTo(185, cy - 410, 215, cy - 330, 205, cy - 215); c.closePath(); nFill(c, col);
  c.beginPath(); c.moveTo(-208, cy - 255); c.lineTo(208, cy - 255); c.lineTo(205, cy - 215); c.lineTo(-205, cy - 215); c.closePath(); nFill(c, band, NOAH.W * .5);
  c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.ellipse(-90, cy - 330, 40, 70, .2, 0, Math.PI * 2); c.fill();
}
function nxHatSide(c) {
  const col = '#2f3136', band = '#16171a';
  c.save(); c.translate(-10, -1440); c.rotate(-.04);
  c.beginPath(); c.ellipse(20, 0, 330, 40, 0, 0, Math.PI * 2); nFill(c, col);
  c.beginPath(); c.moveTo(-210, -10); c.bezierCurveTo(-220, -140, -170, -205, -40, -205); c.quadraticCurveTo(30, -180, 90, -205); c.bezierCurveTo(200, -200, 225, -120, 220, -10); c.closePath(); nFill(c, col);
  c.beginPath(); c.rect(-214, -58, 436, 46); nFill(c, band, NOAH.W * .5);
  c.restore();
}
noahHeadLocal = function (c, e = {}) { _nx.noahHeadLocal(c, e); if (NX.p && NX.p.hat) nxHatFront(c, NOAH.HEAD.y); };
noahSideHead = function (c, e = {}) { _nx.noahSideHead(c, e); if (NX.p && NX.p.hat) nxHatSide(c); };
noahFace = function (c, e) {
  _nx.noahFace(c, e);
  if (e.bags) { const cy = NOAH.HEAD.y; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 92 - 30, cy + 66); c.quadraticCurveTo(s * 92, cy + 86 + 6 * e.bags, s * 92 + 30, cy + 66); c.lineWidth = 6; c.strokeStyle = `rgba(110,90,110,${.55 * e.bags})`; c.lineCap = 'round'; c.stroke(); } }
};
