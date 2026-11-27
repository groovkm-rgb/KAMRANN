// Shot list, timed to the voice (Whisper de, word timestamps). Global times in seconds.
const UNIF = (o = {}) => Object.assign({ outfit: 'uniform', cap: 1, cape: 1, sword: 1 }, o);
const TURN = (t, t0, d = .16) => { const u = seg(t, t0, t0 + d); return { u, sx: Math.max(.12, Math.abs(Math.cos(u * Math.PI))), after: u >= .5 }; };
function squashAt(c, cam, X, Z, sx, fn) { const p = gp(cam, X, Z); c.save(); c.translate(p.x, 0); c.scale(sx, 1); c.translate(-p.x, 0); fn(c); c.restore(); }
const KEYS = {
  candle: { kx: -1, ky: -.25, key: '255,190,110', keyA: .28, fill: '25,20,50', fillA: .5, rim: '150,180,255', rimA: .7, rx: 1, ry: -.25, rimW: 8 },
  candleR: { kx: 1, ky: -.25, key: '255,190,110', keyA: .25, fill: '25,20,50', fillA: .45, rim: '255,200,130', rimA: .75, rx: -1, ry: -.2, rimW: 8 },
  autumn: { kx: 1, ky: -.4, key: '255,205,140', keyA: .22, fill: '40,60,110', fillA: .3, rim: '255,225,160', rimA: .9, rx: 1, ry: -.35, rimW: 9 },
  gold: { kx: -.6, ky: -1, key: '255,215,140', keyA: .25, fill: '50,30,30', fillA: .35, rim: '255,225,170', rimA: .85, rx: .8, ry: -.5, rimW: 8 },
  night: { kx: -1, ky: -.4, key: '255,190,110', keyA: .28, fill: '20,30,70', fillA: .45, rim: '255,200,130', rimA: .8, rx: -1, ry: -.4, rimW: 8, rim2: '120,150,230', rim2A: .5 },
  cell: { kx: 1, ky: -1, key: '210,225,255', keyA: .2, fill: '20,25,45', fillA: .5, rim: '200,220,255', rimA: .8, rx: 1, ry: -.8, rimW: 8 },
  warm: { kx: -1, ky: -.3, key: '255,200,120', keyA: .3, fill: '30,30,60', fillA: .4, rim: '255,210,140', rimA: .95, rx: -1, ry: -.25, rimW: 10 },
  sunset: { kx: -1, ky: -.3, key: '255,180,100', keyA: .3, fill: '60,40,80', fillA: .35, rim: '255,200,120', rimA: .95, rx: -1, ry: -.3, rimW: 10 },
};
const sep = { tint: '150,110,60', tintA: .55, tintMode: 'color' };

// ---------------- S1: hook, mirror (0 – 1.77) ----------------
function S1(c, lt, gt) {
  const Ls = layers(), u = ease5(seg(lt, 0, 1.9)), cam = cam0({ z: lerp(0, 120, u), y: -300, x: lerp(40, 0, u), hy: 1250 - u * 30 });
  roomMirrorWorld(Ls, cam, gt, { s: 1 });
  compose(c, Ls, { bgBlur: 1.6, fgBlur: 10 });
  grade(c, { warm: '255,170,90', warmA: .4, wx: .15, wy: .7, cool: '20,20,60', coolA: .4, vigA: .7, vig: '10,6,4' });
}
function roomMirrorWorld(Ls, cam, t, o) {
  const b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, lt = o.lt ?? 0;
  roomBack(b, cam, t, { winX: 500 });
  workbench(b, cam, -1250, 1750, t, { candle: true, candleX: 300, boot: true, bootX: -200 });
  at(b, cam, 1150, 0, 1900, (c) => { chair(c, 0, 0, 1.1); c.save(); c.translate(0, -520); rr(c, -160, -60, 320, 80, 10); fs(c, APRON.a, 7); c.restore(); });
  at(b, cam, 950, 0, 1500, (c) => { parcel(c, 0, 0, 380, 260); parcel(c, 260, 0, 240, 180); parcel(c, 120, -260, 260, 160); });
  // candle light pool on the floor
  const cp = proj(cam, -950, -900, 1750); glow(b, cp.x, cp.y, 900 * cp.s, '255,170,80', .35);
  // Noah's reflection
  const X = 0, Z = 1100;
  litChars(m, (sc) => { shadowAt(sc, cam, X, Z, 520, .4, 300); drawMirrorNoah(sc, cam, X, Z, t, o); }, Object.assign({}, KEYS.candle, { cx: proj(cam, X, -600, Z).x, cy: proj(cam, X, -600, Z).y, span: 320 }));
  // dust/smoke in the candle light
  dust(m, 0, W, 300, 1700, t, { n: 40, a: .4, col: '255,210,150' });
  steam(m, cp.x, cp.y - 140 * cp.s, t, { n: 6, r: 22, rise: 400, a: .12, col: '220,200,180' });
  // mirror (close to camera) + real candle in the foreground
  mirrorFrame(f, cam, t, { Z: 520, x0: -175, x1: 175, y0: -640, y1: 200 });
  candle(f, 150, 1820, 2.4, t, 7, 220);
  glow(f, 150, 1240, 700, '255,160,70', .3);
}
function drawMirrorNoah(c, cam, X, Z, t, o) {
  const s1 = o.s === 1, lt = o.lt ?? 0;
  if (s1) {
    const br = Math.sin(t * 2.2) * 4, arms = { l: { a: .14, b: -.06 }, r: { a: .25, b: 1.45 } }, [wx, wy] = noahWrist(1, arms.r);
    noahAt(c, cam, X, Z, { arms, bob: br, expr: { mouth: 'soft', look: .15, browUp: .25, lid: .15 } }, UNIF({ cap: 0, hunch: 1, t }), (c) => capFloat(c, wx + 30, wy - 20, .5, -.5));
    return;
  }
  // S2: put on cap, straighten, salute
  const capU = eseg(lt, .05, .5), up = eseg(lt, .5, .85), sal = eseg(lt, .85, 1.12);
  const ra = capU < 1 ? { a: lerp(.25, 2.55, capU), b: lerp(1.45, .95, capU) } : { a: lerp(2.55, .13, up), b: lerp(.95, -.08, up) };
  const la = { a: lerp(.14, 1.95, sal), b: lerp(-.06, 1.78, sal), hand: sal * -.2 };
  const capOn = lt >= .5, hunch = 1 - up;
  const [wx, wy] = noahWrist(1, ra);
  const extra = capOn ? null : (c) => { const k = eseg(lt, .3, .5); capFloat(c, lerp(wx + 30, 0, k), lerp(wy - 20, NOAH.HEAD.y - 205 - 60 + 255 * 0 + 0, k) + lerp(0, -0, k), .5 + .5 * k, lerp(-.5, 0, k)); };
  noahAt(c, cam, X, Z, { arms: { l: la, r: ra }, expr: { mouth: sal > .5 ? 'flat' : 'soft', look: 0, browUp: .2 + .3 * up, lid: .1 }, s: 1 + up * .03 }, UNIF({ cap: capOn, hunch, t, mLift: up }), extra);
}

// ---------------- S2: cap + salute (1.77 – 3.65) ----------------
function S2(c, lt, gt) {
  const Ls = layers(), u = ease5(seg(lt, 0, 2)), cam = cam0({ z: lerp(180, 290, u), y: lerp(-520, -560, u), x: -20, hy: lerp(1000, 1020, u) });
  roomMirrorWorld(Ls, cam, gt, { s: 2, lt });
  // glints on buttons and epaulettes at the salute
  const g = bump(lt, .95, 1.6); if (g > 0) { const p = proj(cam, 0, -440, 1100); for (let i = 0; i < 4; i++) { const x = p.x + [-75, 75, -90, 95][i] * p.s * .5 * 2, y = p.y + [-40, 20, -250, -255][i] * p.s; glint(Ls.mid.c, x, y, 26 * g * (1 + .3 * Math.sin(gt * 9 + i)), g); } }
  compose(c, Ls, { bgBlur: 2, fgBlur: 12 });
  grade(c, { warm: '255,170,90', warmA: .4, wx: .2, wy: .6, cool: '20,20,60', coolA: .4, vigA: .7, vig: '10,6,4' });
}
function glint(c, x, y, r, a) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.fillStyle = '#fff6dc'; for (const [dx, dy] of [[1, 0], [0, 1]]) { c.beginPath(); c.moveTo(x - dx * r, y - dy * r); c.lineTo(x + dy * r * .12, y + dx * r * .12); c.lineTo(x + dx * r, y + dy * r); c.lineTo(x - dy * r * .12, y - dx * r * .12); c.fill(); } glow(c, x, y, r * 1.6, '255,240,200', .6 * a); c.restore(); }

// ---------------- S3: Trödler (3.65 – 5.30) ----------------
function S3(c, lt, gt) {
  const Ls = layers(), u = ease5(seg(lt, -.2, 1.9)), cam = cam0({ z: lerp(0, 90, u), y: lerp(-520, -440, u), x: lerp(-60, 60, u), hy: 1130 });
  const b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c;
  troedlerBack(b, cam, gt);
  // beam from the door window
  const d = proj(cam, 1350, -1600, 2600); beam(b, d.x, d.y, d.x - 700, H * 1.05, 200, 700, '255,220,150', .28);
  // corner props: open chest with the cap (left), barrel with the sword (right)
  at(b, cam, -480, 0, 1400, (c) => { rr(c, -330, -420, 660, 420, 20); fs(c, '#6a4428', 10); P(c, [-330, -420, 330, -420, 300, -760, -300, -760]); fs(c, '#7a5232', 10); for (const x of [-250, 250]) { rr(c, x - 20, -420, 40, 420, 4); fs(c, '#c9a45a', 5); } c.save(); c.translate(0, -470); c.scale(.62, .62); capLocal(c, 0 + 290); c.restore(); });
  at(b, cam, 640, 0, 1750, (c) => { el(c, 0, -500, 260, 70); fs(c, '#5a3a22', 8); rr(c, -260, -500, 520, 500, 30); fs(c, '#6a4628', 10); ln(c, [-260, -380, 260, -380], 12, '#3a3a3a'); ln(c, [-260, -120, 260, -120], 12, '#3a3a3a'); c.save(); c.translate(40, -480); c.rotate(.2); rr(c, -14, -520, 28, 520, 10); fs(c, '#3a3a40', 9); rr(c, -9, -620, 18, 100, 6); fs(c, '#d8c27a', 6); P(c, [-50, -520, 50, -520, 40, -505, -40, -505]); fs(c, '#d8c27a', 6); c.restore(); rr(c, -120, -760, 26, 280, 10); fs(c, '#4a2a1a', 6); el(c, -107, -770, 50, 22); fs(c, '#3a3a3a', 6); });
  // Noah lifts the jacket from the rail
  const lift = eseg(lt, .1, .9), X = 200, Z = 1150, la = { a: lerp(.6, 1.15, lift), b: lerp(1.2, .5, lift) };
  at(m, cam, -260 + cam.x, -865, 1500, (c) => troedlerSign(c, gt));
  const [wx, wy] = noahWrist(-1, la);
  litChars(m, (sc) => { shadowAt(sc, cam, X, Z, 520, .35, -200);
    noahAt(sc, cam, X, Z, { arms: { l: la, r: { a: .3, b: .7 } }, expr: { mouth: lift > .5 ? 'smile' : 'soft', browUp: .3 + .6 * lift, look: -.35 } }, { outfit: 'apron', hunch: .7, t: gt }, (c) => { c.save(); c.translate(wx - 20, wy - 10); c.scale(.85, .85); jacketHanger(c, Math.sin(gt * 3) * .04); c.restore(); });
  }, Object.assign({}, KEYS.gold, { kx: 1, ky: -.6, rx: 1, ry: -.5, cx: proj(cam, X, -600, Z).x, cy: proj(cam, X, -600, Z).y, span: 340 }));
  dust(m, 0, W, 200, 1800, gt, { n: 70, a: .55, r: 2.6, col: '255,230,180', speed: .015 });
  // foreground: hanging coat sleeve + hat stand (soft)
  at(f, cam, -560, 0, 420, (c) => { P(c, [-200, -2400, 160, -2400, 220, -500, -260, -500]); fs(c, '#3a3a30', 10); });
  at(f, cam, 520, 0, 460, (c) => { rr(c, -20, -2400, 40, 2400, 10); fs(c, '#4a2a16', 8); el(c, 0, -1500, 190, 50); fs(c, '#2a2a2a', 8); c.beginPath(); c.arc(0, -1500, 120, Math.PI, 0); fs(c, '#2a2a2a', 8); });
  compose(c, Ls, { bgBlur: 2, fgBlur: 12 });
  grade(c, { warm: '255,200,120', warmA: .4, wx: .8, wy: .3, cool: '40,30,60', coolA: .35, vigA: .6 });
}

// ---------------- S4: cobbler at the bench (5.30 – 7.90) ----------------
function S4(c, lt, gt) {
  const Ls = layers(), u = ease5(seg(lt, -.1, 2.8)), cam = cam0({ z: lerp(330, 470, u), y: lerp(-640, -600, u), x: lerp(60, 20, u), hy: lerp(860, 880, u) });
  const b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, X = 0, Z = 1300;
  roomBack(b, cam, gt, { winX: -2400 });
  // uniform hanging on a hook behind him (contrast), cap on top
  at(b, cam, 950, -2000, 2350, (c) => { c.scale(.95, .95); jacketHanger(c, Math.sin(gt) * .01); c.save(); c.translate(0, 40); c.scale(.6, .6); capLocal(c, 290); c.restore(); });
  const cp = proj(cam, -280, -500, 1050); glow(b, cp.x, cp.y, 1100 * cp.s, '255,170,80', .3);
  // hammering: three hits
  const hits = [.55, 1.05, 1.55, 2.05], ph = hits.reduce((acc, h) => acc + (lt > h - .35 ? 1 : 0), 0);
  let hk = 0; for (const h of hits) { const v = seg(lt, h - .35, h); if (v > 0 && v < 1) hk = v; }
  const swing = lt < hits[0] - .35 ? 0 : Math.sin(hk * Math.PI * .5);
  const ra = { a: lerp(.75, 2.1, 1 - swing), b: lerp(.75, 1.2, 1 - swing) }, la = { a: .45, b: 1.2 };
  const [wx, wy, a2] = noahWrist(1, ra);
  litChars(m, (sc) => {
    noahAt(sc, cam, X, Z, { arms: { l: la, r: ra }, expr: { mouth: 'flat', look: .2, lid: .35, browUp: .1 } }, { outfit: 'apron', hunch: 1, t: gt }, (c) => { c.save(); c.translate(wx, wy); c.scale(1.6, 1.6); hammerLocal(c, -a2 + Math.PI + .3); c.restore(); });
  }, Object.assign({}, KEYS.candle, { cx: proj(cam, X, -600, Z).x, cy: proj(cam, X, -600, Z).y, span: 300 }));
  workbench(m, cam, 0, 1050, gt, { candle: true, candleX: -560, boot: true, bootX: 440, done: clamp(lt / 2.2) });
  // spark / dust puff at each hit
  for (const h of hits) { const e = seg(lt, h, h + .35); if (e > 0 && e < 1) { const p = proj(cam, 220, -420, 1050); dust(m, p.x - 60, p.x + 60, p.y - 80, p.y, gt, { n: 10, a: .7 * (1 - e), r: 3, seed: h * 10 }); glow(m, p.x, p.y, 80 * (1 - e), '255,230,180', .5); } }
  dust(m, 0, W, 200, 1600, gt, { n: 30, a: .35 });
  // foreground: candle + shoe lasts on the edge (soft)
  candle(f, 930, 1900, 2.2, gt, 3, 200);
  compose(c, Ls, { bgBlur: 2.4, fgBlur: 12 });
  grade(c, { warm: '255,165,85', warmA: .45, wx: .3, wy: .55, cool: '25,20,50', coolA: .45, vigA: .7, vig: '10,6,4' });
}

// ---------------- S5: prison flashback, sepia (7.90 – 10.50) ----------------
function S5(c, lt, gt) {
  const Ls = layers(), u = ease5(seg(lt, -.1, 2.8)), cam = cam0({ z: lerp(0, 130, u), y: -520, x: lerp(-120, -40, u), hy: 1040 });
  const b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, X = 200, Z = 1100, age = eseg(lt, .2, 2.4);
  cellBack(b, cam, gt, { winX: 300, col: '#6e6a66', chain: 1 });
  // the tally wall (left, closer)
  at(b, cam, 100, 0, 1700, (c) => { stoneWall(c, -900, -2600, 800, 2600, '#77726c', 3); tally(c, Math.floor(4 + age * 46), -780, -1130, 1.25, undefined, 3); });
  bunk(b, cam, 900, 1900, .8);
  at(b, cam, 650, 0, 1650, (c) => { rr(c, -80, -200, 160, 200, 14); fs(c, '#5a5650', 7); el(c, 0, -200, 80, 16); fs(c, '#3a3632', 5); });
  // beam from the high window
  const wp = proj(cam, 560, -2500, 2200); beam(b, wp.x, wp.y, wp.x - 260, H * 1.05, 200, 620, '235,240,255', .35);
  const la = { a: lerp(1.5, 1.7, Math.sin(gt * 6) * .5 + .5), b: .4 };
  litChars(m, (sc) => { shadowAt(sc, cam, X, Z, 520, .35, -260);
    noahAt(sc, cam, X, Z, { arms: { l: la, r: { a: .13, b: -.08 } }, expr: { mouth: 'flat', look: -.6, lid: .3 } }, { outfit: 'tee', hunch: age, hairMix: age, age, mScale: age, t: gt });
  }, Object.assign({}, KEYS.cell, { cx: proj(cam, X, -600, Z).x, cy: proj(cam, X, -600, Z).y, span: 320 }));
  dust(m, 0, W, 200, 1700, gt, { n: 40, a: .45, col: '230,235,255' });
  // water drip
  const dp = proj(cam, 900, -2300, 2000), dy = ((gt * 1.2) % 1); el(m, dp.x, dp.y + dy * 900 * dp.s, 6, 10); m.fillStyle = 'rgba(220,230,255,.6)'; m.fill();
  at(f, cam, 520, 0, 480, (c) => { for (let i = 0; i < 3; i++) { rr(c, -300 + i * 260, -3200, 80, 3200, 20); fs(c, '#2a2826', 10); } });
  compose(c, Ls, { bgBlur: 2, fgBlur: 12 });
  grade(c, Object.assign({ cool: '40,50,80', coolA: .45, wx: .7, wy: .2, vigA: .75, vig: '20,16,12', lift: '200,190,170', liftA: .08 }, sep));
  // gentle film flicker-free grain-less memory edge
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = rg(c, W / 2, H / 2, H * .3, H * .7, [[0, 'rgba(255,255,255,1)'], [1, 'rgba(120,100,70,1)']]); c.fillRect(0, 0, W, H); c.restore();
}

// ---------------- S6: street, soldiers come by (10.50 – 13.40) ----------------
const SOLD = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ i, rank: i % 2, file: Math.floor(i / 2) }));
function S6(c, lt, gt) {
  const Ls = layers(), nx = -380 + lt * 300, u = ease(seg(lt, 0, .4));
  const cam = cam0({ x: nx + 120, y: -440, z: lerp(-60, 0, ease5(seg(lt, 0, 3))), hy: 1080 });
  streetScene(c, Ls, cam, gt);
  const m = Ls.mid.c, f = Ls.fg.c;
  litChars(m, (sc) => {
    // soldiers in a column, passing behind him (left -> right)
    const sx0 = -2900 + lt * 520;
    for (const s of SOLD.slice().sort((a, b) => b.rank - a.rank)) { const Z = 2700 + s.rank * 420, X = sx0 + s.file * 560 + s.rank * 120; at(sc, cam, X, 0, Z, (c) => drawPersonSide(c, Object.assign(SOLDIER(s.i), { k: .5, walk: gt * 8.5 + s.rank * 0 }))); }
    shadowAt(sc, cam, nx, 1100, 520, .35, 300);
    noahSideAt(sc, cam, nx, 1100, { walk: gt * 7, expr: { mouth: 'flat', look: .2, browUp: 0 } }, UNIF({ t: gt }));
  }, Object.assign({}, KEYS.autumn, { cx: W / 2, cy: 1000, span: 500 }));
  leaves(f, gt, { n: 10, r: 34, seed: 3, speed: 140 });
  leaves(m, gt, { n: 22, r: 13, seed: 9, speed: 80 });
  dust(m, 0, W, 200, 1500, gt, { n: 30, a: .3, col: '255,230,180' });
  compose(c, Ls, { bgBlur: 2.2, fgBlur: 10 });
  grade(c, { warm: '255,190,110', warmA: .45, wx: .85, wy: .15, cool: '40,60,110', coolA: .35, vigA: .5 });
}

// ---------------- S7: "Halt! Ihr folgt mir!" + they obey (13.40 – 17.27) ----------------
const T_HALT = 13.78;
function S7(c, lt, gt) {
  const Ls = layers();
  const walkOff = ease(seg(gt, 15.75, 17.6)) * 0, nx0 = 520, march = Math.max(0, gt - 15.75);
  const nx = nx0 + (gt > 15.55 ? (gt - 15.55) * 300 - 30 : 0);
  const cam = cam0({ x: lerp(560, 700, ease5(seg(gt, 13.4, 15.5))) + ease5(seg(gt, 15.5, 17.6)) * 520, y: -450, z: lerp(0, 90, ease5(seg(gt, 13.4, 15.6))), hy: 1080 });
  streetScene(c, Ls, cam, gt, { carriage: true });
  const m = Ls.mid.c, f = Ls.fg.c;
  litChars(m, (sc) => {
    // soldiers: marching right until HALT, click, turn to front, one shrugs, turn right, march
    const stopX = (gt < T_HALT ? (gt - T_HALT) * 520 : 0);
    const faceFront = gt >= T_HALT + .05 && gt < 15.62, toFront = TURN(gt, T_HALT + .02, .14), toSide = TURN(gt, 15.45, .16);
    const click = bump(gt, T_HALT, T_HALT + .12);
    for (const s of SOLD.slice().sort((a, b) => b.rank - a.rank)) {
      const Z = 2500 + s.rank * 420, X = 120 + s.file * 520 + s.rank * 110 + stopX + march * 300 * (gt > 15.75 ? 1 : 0);
      const shrug = s.i === 4 ? bump(gt, 14.85, 15.4) : 0;
      if (gt < T_HALT + .02 || (gt >= 15.53)) { // side view (marching or after the turn)
        const sxv = gt < T_HALT + .1 ? (gt < T_HALT + .02 ? 1 : toFront.sx) : toSide.sx;
        const walking = gt < T_HALT || gt > 15.75;
        squashAt(sc, cam, X, Z, gt < T_HALT + .02 ? 1 : (toSide.after ? toSide.sx : 1), () => at(sc, cam, X, -click * 40, Z, (c) => drawPersonSide(c, Object.assign(SOLDIER(s.i), { k: .5, walk: walking ? gt * 8.5 : null }))));
      } else { // front view at attention
        const sxv = gt < T_HALT + .16 ? toFront.sx : (gt > 15.45 ? toSide.sx : 1);
        squashAt(sc, cam, X, Z, sxv, () => at(sc, cam, X, -click * 40, Z, (c) => drawPerson(c, Object.assign(SOLDIER(s.i), { k: .5, tilt: shrug * (s.i === 4 ? .12 : 0), expr: { look: s.i === 4 ? -shrug : 0, browUp: shrug, mouth: s.i === 4 && shrug > .3 ? 'flat' : 'smile' }, arms: s.i === 4 ? { l: { a: .12 + shrug * .5, b: shrug * 1.4 }, r: { a: .12 + shrug * .5, b: shrug * 1.4 } } : undefined }))));
      }
      if (click > 0) { const p = gp(cam, X, Z); dust(sc, p.x - 60, p.x + 60, p.y - 30, p.y + 4, gt, { n: 8, a: click * .8, r: 4, seed: s.i * 7, col: '220,200,170' }); }
    }
    shadowAt(sc, cam, nx, 1050, 520, .35, 300);
    // Noah: turns to the front, raises the hand (Halt), points right, turns and leads the way
    const t1 = TURN(gt, 13.42, .16), t2 = TURN(gt, 15.42, .16);
    if (gt < 13.42 + .08) squashAt(sc, cam, nx, 1050, t1.sx, () => noahSideAt(sc, cam, nx, 1050, { walk: null, expr: { mouth: 'flat' } }, UNIF({ t: gt })));
    else if (gt < 15.5) {
      const up = eseg(gt, 13.52, 13.74), down = eseg(gt, 14.1, 14.35), point = eseg(gt, 14.25, 14.55) * (1 - eseg(gt, 15.1, 15.4));
      const ra = { a: lerp(lerp(.13, 2.7, up), 1.62, down), b: lerp(lerp(-.08, .15, up), 0, down) };
      const r2 = down > 0 ? { a: lerp(ra.a, lerp(1.62, .13, eseg(gt, 15.1, 15.4)), 1), b: 0 } : ra;
      const smirk = eseg(gt, 14.9, 15.2);
      squashAt(sc, cam, nx, 1050, gt < 13.6 ? t1.sx : (gt > 15.42 ? t2.sx : 1), () => noahAt(sc, cam, nx, 1050, { arms: { l: { a: .13, b: -.08 }, r: down > 0 ? r2 : ra }, expr: { mouth: smirk > .5 ? 'smirk' : 'flat', look: gt < 14.2 ? .6 : (smirk > .5 ? -.3 : .8), browUp: up * (1 - down) * .5 + smirk * .5, lid: smirk * .3 } }, UNIF({ t: gt, mLift: smirk })));
    } else squashAt(sc, cam, nx, 1050, t2.sx, () => noahSideAt(sc, cam, nx, 1050, { walk: gt > 15.55 ? (gt - 15.55) * 7 : null, expr: { mouth: 'smile', lid: .3 } }, UNIF({ t: gt, mLift: 1 })));
  }, Object.assign({}, KEYS.autumn, { cx: W / 2, cy: 1000, span: 500 }));
  leaves(f, gt, { n: 9, r: 34, seed: 5, speed: 150 });
  leaves(m, gt, { n: 22, r: 13, seed: 11, speed: 80 });
  dust(m, 0, W, 200, 1500, gt, { n: 30, a: .3, col: '255,230,180' });
  compose(c, Ls, { bgBlur: 2.2, fgBlur: 10 });
  grade(c, { warm: '255,190,110', warmA: .45, wx: .85, wy: .15, cool: '40,60,110', coolA: .35, vigA: .5 });
}

// ---------------- S9: station + train (17.27 – 19.45) ----------------
function S9(c, lt, gt) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, u = ease5(seg(lt, 0, 2.3));
  const tx = 300 * lt * lt; // train starts rolling to the right
  const cam = cam0({ x: tx - 350, y: lerp(-450, -1700, u), z: lerp(-200, 0, u), hy: 980 });
  stationScene(c, Ls, cam, gt, { signZ: 4200 });
  // the train side (mid plane)
  at(m, cam, tx, 0, 1150, (c) => { trainSide(c, gt, { wheelRot: tx / 300, winFill: 'rgba(0,0,0,0)' }); });
  // compartment interior seen through the window: Noah sits bolt upright, soldiers' helmets in the next window
  const wl = proj(cam, tx - 12000 + 300 + 11 * 1000, -2100, 1150), wr = proj(cam, tx - 12000 + 1000 + 11 * 1000, -1340, 1150);
  m.save(); rr(m, wl.x, wl.y, wr.x - wl.x, wr.y - wl.y, 30 * wl.s); m.clip();
  m.fillStyle = lg(m, 0, wl.y, 0, wr.y, [[0, '#6a3a26'], [1, '#3a2014']]); m.fillRect(0, 0, W, H);
  // far window with the autumn landscape rolling by (trees + river)
  const fx = wl.x + 40 * wl.s, fy = wl.y + 60 * wl.s, fw = (wr.x - wl.x) - 80 * wl.s, fh = 360 * wl.s;
  m.save(); rr(m, fx, fy, fw, fh, 20 * wl.s); m.clip(); m.fillStyle = lg(m, 0, fy, 0, fy + fh, [[0, '#f2d6a8'], [1, '#c8b890']]); m.fillRect(fx, fy, fw, fh);
  m.fillStyle = '#6a90a8'; m.fillRect(fx, fy + fh * .7, fw, fh * .3);
  for (let i = 0; i < 9; i++) { const x = fx + ((i * 180 - gt * 900) % (fw + 400) + fw + 400) % (fw + 400) - 200; blobs(m, [[x, fy + fh * .45, 60 * wl.s, ['#d9822b', '#e8a640', '#c45a22'][i % 3]], [x + 40, fy + fh * .55, 50 * wl.s, '#b9581c']], 5); ln(m, [x, fy + fh * .5, x, fy + fh * .75], 8 * wl.s, '#4a3020'); }
  m.restore();
  litChars(m, (sc) => { noahAt(sc, cam, tx - 12000 + 650 + 11 * 1000, 1220, { sit: true, seatH: 300, arms: { l: { a: .2, b: .8 }, r: { a: .2, b: .8 } }, expr: { mouth: 'flat', look: .4, browUp: .2 } }, UNIF({ cape: 0, t: gt }), null, -1155); }, Object.assign({}, KEYS.gold, { kx: 1, ky: -.4, rx: 1, ry: -.3 }));
  m.restore();
  // next window: helmets of two soldiers
  const w2 = proj(cam, tx - 12000 + 300 + 10 * 1000, -2100, 1150), w2r = proj(cam, tx - 12000 + 1000 + 10 * 1000, -1340, 1150);
  m.save(); rr(m, w2.x, w2.y, w2r.x - w2.x, w2r.y - w2.y, 30 * w2.s); m.clip(); m.fillStyle = '#4a2a18'; m.fillRect(0, 0, W, H);
  for (let i = 0; i < 2; i++) at(m, cam, tx - 12000 + 470 + i * 330 + 10 * 1000, -1110, 1250, (c) => drawPersonSide(c, Object.assign(SOLDIER(i + 1), { k: .5, tilt: Math.sin(gt * 9 + i) * .02 })));
  m.restore();
  // steam from the loco + rail bed in the foreground
  const lp = proj(cam, tx + 4550, -3300, 1150); steam(m, lp.x, lp.y, gt, { n: 14, r: 120, rise: 900, dx: -500, a: .55 });
  steam(f, W * .2, H * 1.02, gt, { n: 10, r: 260, rise: 1200, dx: -200, a: .45, speed: .3 });
  steam(f, W * .9, H * 1.05, gt + 2, { n: 8, r: 220, rise: 1000, dx: -300, a: .35, speed: .25 });
  compose(c, Ls, { bgBlur: 2.6, fgBlur: 14 });
  grade(c, { warm: '255,200,120', warmA: .45, wx: .7, wy: .1, cool: '50,60,90', coolA: .3, vigA: .55 });
}

// ---------------- S10: Rathaus exterior, tilt up (19.45 – 21.00) ----------------
function S10(c, lt, gt) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, u = ease5(seg(lt, -.15, 1.8));
  const cam = cam0({ x: 0, y: -520, z: lerp(0, 150, u), hy: lerp(980, 1430, u) });
  b.fillStyle = lg(b, 0, 0, 0, H, [[0, '#8aaccc'], [.6, '#f0d4a8'], [1, '#e8c898']]); b.fillRect(0, 0, W, H);
  at(b, cam, 0, 0, 6200, (c) => rathausFacade(c, gt));
  for (const x of [-2600, 2600]) at(b, cam, x, 0, 3800, (c) => autumnTree(c, gt, x, 1.1));
  cobbles(b, cam, -4000, 4000, 700, 6200, { col: '#a09484', size: 180 });
  for (const x of [-1700, 1700]) at(b, cam, x, 0, 3000, (c) => gasLamp(c, 0, gt));
  // townsfolk gawking at the side
  for (let i = 0; i < 4; i++) at(b, cam, (i < 2 ? -1 : 1) * (2000 + (i % 2) * 400), 0, 3400 + (i % 2) * 300, (c) => drawPerson(c, { k: .5, skin: [SKIN.peach, SKIN.tan, SKIN.rose, SKIN.light][i], hat: ['bowler', 'flat', 'sun', 'top'][i], dress: i === 2, hair: i === 2 ? 'bun' : 'short', coat: ['#3a3a4a', '#5a4a3a', '#7a4a5a', '#2a2a2a'][i], expr: { mouth: 'o', browUp: 1, wide: 1 }, coatLong: 1 }));
  for (let i = 0; i < 4; i++) beam(b, W * (.75 + i * .07), -60, W * (.2 + i * .1), H, 60, 300, '255,215,150', .1);
  litChars(m, (sc) => {
    for (const s of SOLD) { const side = s.i % 2 ? 1 : -1, j = Math.floor(s.i / 2), X = side * (700 + j * 260), Z = 4600 - j * 500; at(sc, cam, X, 0, Z, (c) => drawPerson(c, Object.assign(SOLDIER(s.i), { k: .5 }))); }
    shadowAt(sc, cam, 0, 1350, 520, .35, -300);
    noahAt(sc, cam, 0, 1350, { arms: { l: { a: .13, b: -.08 }, r: { a: .3, b: .9 } }, expr: { mouth: 'smirk', look: 0, browUp: .3, lid: .2 } }, UNIF({ t: gt, mLift: 1 }));
  }, Object.assign({}, KEYS.autumn, { kx: 1, ky: -.5, cx: W / 2, cy: 1100, span: 420 }));
  leaves(f, gt, { n: 8, r: 30, seed: 7, speed: 120 }); leaves(m, gt, { n: 16, r: 12, seed: 2, speed: 70 });
  compose(c, Ls, { bgBlur: 1.8, fgBlur: 10 });
  grade(c, { warm: '255,195,115', warmA: .45, wx: .85, wy: .1, cool: '40,60,110', coolA: .3, vigA: .5 });
}

// ---------------- S11: the mayor is "arrested" (21.00 – 22.90) ----------------
function S11(c, lt, gt) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, u = ease5(seg(lt, -.1, 2.1));
  const cam = cam0({ x: lerp(60, 160, u), y: -560, z: lerp(200, 320, u), hy: 1000 });
  townhallInterior(b, cam, gt);
  at(b, cam, 0, -3600, 2400, (c) => chandelier(c, gt));
  // clerks behind their desks, astonished
  for (let i = 0; i < 3; i++) { const X = -1400 + i * 1250, Z = 2500; at(b, cam, X, 0, Z, (c) => { drawPerson(c, { k: .5, skin: [SKIN.light, SKIN.tan, SKIN.peach][i], hair: ['parted', 'bald', 'curly'][i], hairCol: ['#3a2a22', '#6a5a4a', '#2a1a14'][i], glasses: i !== 1, mst: i === 1 ? 'mutton' : null, coat: ['#4b4a40', '#3a3a4a', '#5a4a3a'][i], shirtV: '#f0ece0', tie: '#5a2a2a', expr: { mouth: 'o', wide: 1, browUp: 1 }, arms: { l: { a: .4 + Math.sin(gt * 3 + i) * .05, b: 1.4 }, r: { a: .4, b: 1.4 } } }); rr(c, -600, -380, 1200, 380, 10); fs(c, '#5a3a20', 10); for (let k = 0; k < 4; k++) { rr(c, -400 + k * 60, -420 - k * 14, 300, 50, 4); fs(c, '#eee6d0', 4); } }); }
  // the mayor between two soldiers, gently led to the right
  const go = eseg(lt, .7, 1.9) * 500, jaw = eseg(lt, .05, .3), pen = seg(lt, .12, .55);
  litChars(m, (sc) => {
    for (const [dx, i] of [[-330, 0], [330, 1]]) at(sc, cam, 180 + dx + go, 0, 1650, (c) => drawPerson(c, Object.assign(SOLDIER(i), { k: .5, arms: dx < 0 ? { r: { a: .9, b: .4 } } : { l: { a: .9, b: .4 } }, expr: { mouth: 'flat' } })));
    at(sc, cam, 180 + go, 0, 1600, (c) => drawPerson(c, { k: .5, skin: SKIN.rose, hair: 'bald', hairCol: '#6a5646', mst: 'mutton', coat: '#1e1c22', belly: 1, sash: '#c9a23a', chain: 1, shirtV: '#f4f0e6', expr: { mouth: 'drop', open: jaw, wide: 1, browUp: 1 }, arms: { l: { a: lerp(1.2, .7, jaw), b: lerp(1.4, .3, jaw) }, r: { a: .7, b: .3 } } }));
    // the dropped pen
    const pp = proj(cam, 260 + 0 * go, lerp(-440, 0, pen * pen), 1450); if (pen < 1) { sc.save(); sc.translate(pp.x, pp.y); sc.rotate(pen * 7); rr(sc, -40 * pp.s, -5 * pp.s, 80 * pp.s, 10 * pp.s, 4); fs(sc, '#1a1a1a'); sc.restore(); }
    else { const p2 = proj(cam, 300, 0, 1500); rr(sc, p2.x - 40 * p2.s, p2.y - 8, 80 * p2.s, 10 * p2.s, 4); fs(sc, '#1a1a1a'); }
    // Noah in the foreground, profile, pointing the way
    noahSideAt(sc, cam, -180, 1150, { arms: { near: { th: lerp(.3, 1.45, eseg(lt, 0, .3)), bend: .05 } }, expr: { mouth: 'flat', look: .3 } }, UNIF({ t: gt }));
  }, Object.assign({}, KEYS.gold, { cx: W / 2, cy: 900, span: 500 }));
  // the mayor's desk (mid, in front of him at the start)
  at(m, cam, 300, 0, 1450, (c) => { c.scale(.5, .5); rr(c, -700, -800, 1400, 800, 14); fs(c, lg(c, 0, -800, 0, 0, [[0, '#7a4a28'], [1, '#4a2a16']]), 12); rr(c, -760, -840, 1520, 60, 10); fs(c, '#8a5a32', 10); el(c, -480, -870, 60, 40); fs(c, '#1a1a2a', 6); for (let k = 0; k < 3; k++) { rr(c, -100 + k * 30, -880 - k * 12, 360, 40, 4); fs(c, '#f2ead6', 4); } ln(c, [-650, -830, 650, -830], 4, 'rgba(255,230,180,.35)'); });
  dust(m, 0, W, 100, 1600, gt, { n: 50, a: .45, col: '255,230,170', speed: .01 });
  at(f, cam, 900, 0, 520, (c) => { rr(c, -120, -3400, 240, 3400, 20); fs(c, '#5a3a1e', 10); el(c, 0, -3400, 200, 80); fs(c, '#c9a040', 8); });
  compose(c, Ls, { bgBlur: 2.2, fgBlur: 12 });
  grade(c, { warm: '255,200,110', warmA: .5, wx: .2, wy: .1, cool: '40,25,20', coolA: .4, vigA: .6 });
}

// ---------------- S12: the Stadtkasse (22.90 – 24.40) ----------------
function S12(c, lt, gt) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, u = ease5(seg(lt, -.1, 1.7));
  const cam = cam0({ x: lerp(40, 0, u), y: -420, z: lerp(0, 130, u), hy: 1130 });
  townhallInterior(b, cam, gt);
  at(b, cam, 330, 0, 1900, (c) => safeLocal(c, seg(lt, -.3, .25), gt));
  at(b, cam, -200, -3100, 1500, (c) => chandelier(c, gt));
  const sign = seg(lt, .75, 1.35), put = eseg(lt, .1, .6);
  const la = { a: lerp(1.25, .6, put), b: lerp(1.2, 1.3, put) }, ra = { a: lerp(.2, .62, sign > 0 ? 1 : 0), b: lerp(.4, 1.25, sign > 0 ? 1 : 0) };
  const [lx, ly] = noahWrist(-1, la), [rx, ry] = noahWrist(1, ra);
  litChars(m, (sc) => {
    noahAt(sc, cam, -120, 1300, { arms: { l: la, r: ra }, expr: { mouth: 'flat', look: .5, lid: .35, browUp: .1 } }, UNIF({ t: gt }), (c) => { if (put < .95) { c.save(); c.translate(lx, ly + 40); for (let k = 0; k < 3; k++) { rr(c, -70, -k * 30, 140, 50, 6); fs(c, k % 2 ? '#8ab08a' : '#a0c49a', 5); } c.restore(); } if (sign > 0) { c.save(); c.translate(rx + 10, ry + 40); c.rotate(.6); rr(c, -8, -90, 16, 110, 6); fs(c, '#1a1a1a', 4); c.restore(); } });
  }, Object.assign({}, KEYS.gold, { kx: .3, ky: -1, cx: W * .38, cy: 900, span: 380 }));
  // bag + receipt on a little table in front
  at(m, cam, 260, 0, 1080, (c) => { c.scale(.45, .45); rr(c, -560, -760, 1120, 60, 10); fs(c, '#6a4628', 9); rr(c, -520, -700, 40, 700, 6); fs(c, '#4a2e1a', 6); rr(c, 480, -700, 40, 700, 6); fs(c, '#4a2e1a', 6);
    c.beginPath(); c.moveTo(-480, -760); c.quadraticCurveTo(-520, -1100, -300, -1120); c.lineTo(-120, -1120); c.quadraticCurveTo(80, -1100, 40, -760); c.closePath(); fs(c, '#5a3a22', 9); el(c, -210, -1120, 170, 30); fs(c, '#3a2414', 7); for (let k = 0; k < Math.floor(put * 4); k++) { rr(c, -300, -1170 - k * 26, 160, 40, 6); fs(c, '#a0c49a', 4); }
    rr(c, 120, -800, 360, 260, 6); c.save(); c.translate(300, -670); c.rotate(-.05); rr(c, -180, -130, 360, 260, 6); fs(c, '#f4ecd8', 5); for (let i = 0; i < 4; i++) ln(c, [-150, -90 + i * 32, 120, -90 + i * 32], 4, 'rgba(60,50,40,.5)');
      const sl = sign; c.beginPath(); for (let i = 0; i <= 20 * sl; i++) { const x = -140 + i * 12, y = 80 + Math.sin(i * 1.3) * 16; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.lineWidth = 5; c.strokeStyle = '#1a2a6a'; c.stroke(); c.restore(); });
  const cp = proj(cam, -200, -3500, 1500); for (let i = 0; i < 3; i++) beam(m, cp.x - 100 + i * 100, cp.y, cp.x - 300 + i * 260, H, 40, 260, '255,220,150', .07);
  dust(m, 0, W, 100, 1700, gt, { n: 50, a: .5, col: '255,230,170', speed: .012 });
  at(f, cam, 760, -1500, 460, (c) => { for (let k = 0; k < 6; k++) { el(c, (k % 3) * 120, -k * 60, 90, 30); fs(c, '#e8c860', 6); } });
  compose(c, Ls, { bgBlur: 2.2, fgBlur: 12 });
  grade(c, { warm: '255,205,120', warmA: .55, wx: .35, wy: .1, cool: '40,25,20', coolA: .4, vigA: .62 });
}

// ---------------- S13: he vanishes into the fog (24.40 – 26.35) ----------------
function S13(c, lt, gt) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, u = ease5(seg(lt, -.1, 2.1));
  const cam = cam0({ x: lerp(-200, 200, u), y: -520, z: 0, hy: lerp(1060, 1100, u) });
  b.fillStyle = lg(b, 0, 0, 0, H, [[0, '#9ab0c4'], [.6, '#e8d4b8'], [1, '#c8b8a0']]); b.fillRect(0, 0, W, H);
  at(b, cam, -3600, 0, 3200, (c) => { c.save(); c.translate(3200, 0); rathausFacade(c, gt, { noSign: 1 }); c.restore(); });
  for (let i = 0; i < 6; i++) at(b, cam, 1800 + i * 300, 0, 3600 + i * 1600, (c) => facade(c, 1800, 4, { col: ['#c4a07c', '#d8c0a0', '#b8a088'][i % 3], seed: i }));
  cobbles(b, cam, -3000, 5000, 600, 12000, { col: '#9a8e80', size: 170 });
  for (let z = 2000; z < 12000; z += 2200) at(b, cam, 1300, 0, z, (c) => gasLamp(c, 0, gt));
  // Noah walks away to the right, deeper into the mist
  const w = eseg(lt, 0, 2.1), X = lerp(-200, 1100, w), Z = lerp(1300, 3000, w), fade = eseg(lt, .7, 1.95);
  litChars(m, (sc) => { sc.save(); sc.globalAlpha = 1 - fade * .95; shadowAt(sc, cam, X, Z, 520, .3, 200); noahSideAt(sc, cam, X, Z, { walk: gt * 7, expr: { mouth: 'smile', lid: .3 } }, UNIF({ t: gt })); sc.restore(); }, Object.assign({}, KEYS.autumn, { kx: 1, ky: -.5, cx: W / 2, cy: 1000, span: 400 }));
  // thick fog rolling in
  fog(m, 1200, 600, '235,228,215', .55 * (.4 + fade * .6), gt, { r: 700, n: 9, speed: 50, mode: 'source-over' });
  m.save(); m.globalAlpha = .25 + fade * .35; m.fillStyle = '#e8e0d0'; m.fillRect(0, 0, W, H); m.restore();
  leaves(f, gt, { n: 12, r: 34, seed: 13, speed: 260, fall: 10 }); leaves(m, gt, { n: 26, r: 14, seed: 17, speed: 200 });
  compose(c, Ls, { bgBlur: 3, fgBlur: 10 });
  grade(c, { warm: '255,200,130', warmA: .3, wx: .8, wy: .2, cool: '60,70,100', coolA: .35, vigA: .45 });
}

// ---------------- S14: night, the newsboy (26.35 – 27.97) ----------------
function S14(c, lt, gt) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, u = ease5(seg(lt, -.2, 1.8));
  const cam = cam0({ x: lerp(-60, 0, u), y: -700, z: lerp(0, 150, u), hy: 980 });
  nightStreet(c, Ls, cam, gt);
  for (let i = 0; i < 5; i++) at(b, cam, -1300 + i * 650, 0, 3000 + (i % 2) * 600, (c) => drawPerson(c, { k: .5, skin: [SKIN.peach, SKIN.tan, SKIN.rose, SKIN.olive, SKIN.light][i], hat: ['bowler', 'top', null, 'flat', 'bowler'][i], hair: i === 2 ? 'bun' : 'short', dress: i === 2, coat: ['#2a2a34', '#3a2a2a', '#5a3a4a', '#2a3a3a', '#3a3a3a'][i], coatLong: 1, expr: { mouth: 'o', browUp: .8 }, arms: { l: { a: .3, b: 1.3 }, r: { a: .13, b: -.06 } } }));
  const raise = eseg(lt, 0, .35);
  litChars(m, (sc) => {
    at(sc, cam, -420, 0, 1150, (c) => drawPerson(c, { k: .5, kid: 1, skin: SKIN.tan, hair: 'short', hairCol: '#7a4a2a', hat: 'flat', hatCol: '#5a4a3a', coat: '#6a4a2e', pants: '#4a4038', expr: { mouth: 'smile', browUp: .6, look: .5 }, arms: { l: { a: .15, b: .5 }, r: { a: lerp(.8, 2.0, raise), b: lerp(1.2, .8, raise) } }, hold: (c, L) => { c.save(); c.translate(L.wx + 40, L.wy - 40); rr(c, -60, -260, 120, 260, 6); fs(c, '#d8cdb0', 6); for (let k = 0; k < 6; k++) ln(c, [-50, -230 + k * 40, 50, -230 + k * 40], 4, 'rgba(40,30,20,.5)'); c.restore(); } }));
    // the raised Extrablatt
    sc.save(); sc.translate(560, lerp(1250, 1060, raise)); sc.scale(1.12, 1.12); newspaper(sc, 560, 700, gt); sc.restore();
  }, Object.assign({}, KEYS.night, { cx: W / 2, cy: 1000, span: 450 }));
  const lp = proj(cam, -1500, -1860, 1200); glow(m, lp.x, lp.y, 400, '255,190,110', .3);
  fog(f, 1700, 200, '120,130,170', .25, gt, { r: 500, n: 4, speed: 20 });
  compose(c, Ls, { bgBlur: 2.4, fgBlur: 10 });
  grade(c, { warm: '255,175,90', warmA: .45, wx: .2, wy: .3, cool: '20,30,80', coolA: .4, vigA: .6 });
}

// ---------------- S15: café laughter -> palace window (27.97 – 31.28) ----------------
function S15(c, lt, gt) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, up = ease5(seg(lt, -.2, 1.9));
  const cam = cam0({ x: lerp(-60, 60, up), y: lerp(-560, -760, up), z: lerp(0, 120, up), hy: lerp(1150, 1200, up) });
  b.fillStyle = lg(b, 0, 0, 0, H, [[0, '#080e22'], [.6, '#16213e'], [1, '#262a40']]); b.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { b.fillStyle = `rgba(255,255,255,${.3 + rnd(i) * .6})`; b.fillRect(rnd(i + 3) * W, rnd(i + 7) * H * .6, 2, 2); }
  // palace far behind (lit window with the laughing silhouette)
  at(b, cam, 600, 0, 9000, (c) => palace(c, gt));
  glow(b, W * .8, H * .1, 300, '220,230,255', .3);
  // rooftops between
  at(b, cam, 0, 0, 4200, (c) => { for (let i = 0; i < 7; i++) { const x = -4200 + i * 1400, h = 2600 + rnd(i + 5) * 900; P(c, [x - 700, 0, x - 700, -h, x, -h - 900, x + 700, -h, x + 700, 0]); fs(c, '#1a2034', 8); rr(c, x + 200, -h - 600, 140, 400, 4); fs(c, '#1a2034', 6); for (let k = 0; k < 6; k++) if (rnd(i * 7 + k) > .5) { rr(c, x - 500 + (k % 3) * 380, -h + 400 + Math.floor(k / 3) * 900, 160, 260, 6); fs(c, '#e8b060', 4); } } });
  steam(b, proj(cam, -2600, -7200, 4200).x, proj(cam, -2600, -7200, 4200).y, gt, { n: 8, r: 80, rise: 400, a: .2, col: '150,160,190' });
  // café front with laughing guests
  at(b, cam, 0, 0, 1300, (c) => { c.fillStyle = '#2e2a34'; c.fillRect(-2600, -4300, 5200, 4300); P(c, [-2700, -4300, 0, -5200, 2700, -4300]); fs(c, '#1e1a24', 10); for (let fl = 0; fl < 1; fl++) for (let i = 0; i < 4; i++) { rr(c, -2000 + i * 1100, -3900, 500, 900, 10); fs(c, rnd(fl * 4 + i) > .4 ? '#e8b060' : '#2a3450', 8); } cafeFront(c, gt); });
  litChars(m, (sc) => {
    const guests = [[-1100, 1700, SKIN.olive, null, '#3a4a3a'], [-560, 1400, SKIN.peach, 'bowler', '#3a2a2a'], [-60, 1480, SKIN.rose, null, '#7a3a4a'], [460, 1400, SKIN.tan, 'top', '#2a2a3a']];
    guests.forEach(([X, Z, skin, hat, coat], i) => { const sh = Math.sin(gt * 14 + i * 2) * .5 + .5; at(sc, cam, X, -sh * 18, Z, (c) => drawPerson(c, { k: .5, skin, hat, hair: i === 1 ? 'bun' : i === 3 ? 'curly' : 'short', hairCol: ['#4a3426', '#6a3a1a', '#2a1a14', '#3a2a1a'][i], mst: i === 0 ? 'walrus' : i === 2 ? 'thin' : null, coat, dress: i === 1, tilt: Math.sin(gt * 7 + i) * .08, expr: { mouth: 'laugh', open: .6 + sh * .4, eyes: 'laugh' }, arms: { l: { a: .5 + sh * .1, b: 1.5 }, r: { a: i % 2 ? 2.2 : .6, b: i % 2 ? .4 : 1.4 } }, hold: i % 2 ? null : (c, L) => { c.save(); c.translate(L.wx, L.wy - 40); c.rotate(-.2); rr(c, -160, -240, 320, 240, 6); fs(c, '#e9e0c8', 5); for (let k = 0; k < 5; k++) ln(c, [-130, -200 + k * 38, 130, -200 + k * 38], 4, 'rgba(40,30,20,.5)'); c.restore(); } })); });
    // round table with cups/glasses
    at(sc, cam, 0, 0, 1350, (c) => { c.scale(.6, .6); el(c, 0, -720, 1300, 110); fs(c, '#6a3a22', 10); for (let k = 0; k < 4; k++) { rr(c, -900 + k * 560, -900, 90, 180, 16); fs(c, 'rgba(240,250,255,.7)', 6); rr(c, -900 + k * 560, -840, 90, 120, 10); fs(c, '#d89a40'); } });
  }, Object.assign({}, KEYS.warm, { cx: W / 2, cy: 1100, span: 500 }));
  // window glass reflection over the guests
  const gl = proj(cam, -1900, -2150, 1300), gr = proj(cam, 1900, -450, 1300);
  m.save(); m.globalCompositeOperation = 'screen'; m.fillStyle = lg(m, gl.x, gl.y, gr.x, gr.y, [[0, 'rgba(255,255,255,0)'], [.3, 'rgba(255,240,220,.15)'], [.36, 'rgba(255,255,255,0)'], [.7, 'rgba(255,255,255,0)'], [.74, 'rgba(255,240,220,.1)'], [.8, 'rgba(255,255,255,0)']]); m.fillRect(gl.x, gl.y, gr.x - gl.x, gr.y - gl.y); m.restore();
  at(m, cam, 0, 0, 1300, (c) => { rr(c, -1900, -2150, 3800, 1700, 14); fs(c, null, 40, '#2a1a14'); ln(c, [0, -2150, 0, -450], 30, '#2a1a14'); txt(c, 'Café', 0, -2745, 210, '#f0d890', { stroke: 10, strokeCol: '#102018' }); });
  const lp = proj(cam, -2400, 0, 1700); at(m, cam, -1300, 0, 1150, (c) => gasLamp(c, 1, gt, 3));
  fog(f, H * .9, 200, '255,200,140', .15, gt, { r: 500, n: 4, speed: 15 });
  compose(c, Ls, { bgBlur: 2, fgBlur: 10 });
  grade(c, { warm: '255,180,100', warmA: .45, wx: .5, wy: .7, cool: '20,30,80', coolA: .35, vigA: .6 });
}
function palace(c, t) {
  c.fillStyle = '#2a3048'; c.fillRect(-6000, -9000, 12000, 9000); c.lineWidth = 20; c.strokeStyle = OUT; c.strokeRect(-6000, -9000, 12000, 9000);
  el(c, 0, -9000, 2600, 2400); c.save(); c.beginPath(); c.rect(-3000, -12000, 6000, 3000); c.clip(); el(c, 0, -9000, 2600, 2400); fs(c, '#3a4466', 20); c.restore(); ln(c, [0, -11400, 0, -12400], 60, '#c9a45a');
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const x = -5200 + i * 1300, y = -8200 + r * 2600; rr(c, x - 300, y, 600, 1500, 300); fs(c, r === 1 && i === 4 ? '#ffd890' : (rnd(r * 9 + i) > .6 ? '#c89850' : '#1c2238'), 14); }
  for (let i = 0; i < 12; i++) rr(c, -5800 + i * 1000, -9400, 400, 400, 0), fs(c, '#2a3048', 12);
  // the lit window: a silhouette, back turned, shoulders shaking with laughter
  const x = 0, y = -5600, sh = Math.sin(t * 16) * 30 + Math.sin(t * 9) * 12;
  glow(c, x, y + 750, 1600, '255,210,140', .6);
  c.save(); rr(c, x - 300, y, 600, 1500, 300); c.clip(); c.fillStyle = '#ffe0a0'; c.fillRect(x - 300, y, 600, 1500);
  c.fillStyle = '#1a120c'; c.beginPath(); c.moveTo(x - 280, y + 1500); c.quadraticCurveTo(x - 280, y + 1000 + sh, x - 140, y + 960 + sh); c.lineTo(x + 140, y + 960 + sh); c.quadraticCurveTo(x + 280, y + 1000 + sh, x + 280, y + 1500); c.fill();
  el(c, x, y + 820 + sh, 130, 150); c.fill(); P(c, [x - 20, y + 680 + sh, x, y + 560 + sh, x + 20, y + 680 + sh]); c.fill(); // spiked helmet silhouette
  for (const s of [-1, 1]) { el(c, x + s * 210, y + 990 + sh * 1.1, 70, 26); c.fill(); }
  c.restore();
}

function S15b(c, lt, gt) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, u = ease5(seg(lt, -.3, 1.9));
  const cam = cam0({ x: lerp(-200, 0, u), y: lerp(-1300, -1900, u), z: lerp(0, 600, u), hy: 1000 });
  b.fillStyle = lg(b, 0, 0, 0, H, [[0, '#060b1e'], [.6, '#141e3c'], [1, '#22284a']]); b.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) { b.fillStyle = `rgba(255,255,255,${(.3 + rnd(i) * .6) * (.7 + .3 * Math.sin(gt * 2 + i))})`; b.fillRect(rnd(i + 3) * W, rnd(i + 7) * H * .5, 2.5, 2.5); }
  el(b, W * .82, H * .2, 70, 70); b.fillStyle = '#eef2ff'; b.fill(); glow(b, W * .82, H * .2, 380, '200,215,255', .45);
  at(b, cam, 0, 0, 6800, (c) => palace2(c, gt));
  for (const X of [-2600, 2600]) at(b, cam, X, 0, 4200, (c) => { rr(c, -30, -2400, 60, 2400, 8); fs(c, '#1a1e24', 6); glow(c, 0, -2500, 400, '255,190,110', .6); el(c, 0, -2500, 70, 90); fs(c, '#ffd890', 6); });
  fog(b, 1400, 300, '120,130,180', .25, gt, { r: 600, n: 6, speed: 12 });
  // dark rooftops + chimneys in the foreground, smoke
  at(m, cam, 0, 0, 2600, (c) => { for (let i = 0; i < 6; i++) { const x = -3000 + i * 1200, h = 400 + rnd(i + 2) * 300; c.fillStyle = '#0c1020'; P(c, [x - 640, 200, x - 640, -h, x, -h - 500, x + 640, -h, x + 640, 200]); c.fill(); rr(c, x + 250, -h - 400, 130, 330, 4); c.fill(); if (i % 2) { rr(c, x - 200, -h + 150, 140, 180, 6); fs(c, '#e8b060'); } } });
  for (let i = 0; i < 2; i++) { const p = proj(cam, -1550 + i * 2400, -1600, 2600); steam(m, p.x, p.y, gt, { n: 7, r: 60, rise: 380, dx: 120, a: .22, col: '140,150,190' }); }
  for (let i = 0; i < 3; i++) { const x = ((i * 390 + gt * 70) % (W + 200)) - 100, y = 1450 + i * 30; m.beginPath(); m.moveTo(x - 14, y); m.quadraticCurveTo(x - 6, y - 10 * Math.abs(Math.sin(gt * 8 + i)), x, y); m.quadraticCurveTo(x + 6, y - 10 * Math.abs(Math.sin(gt * 8 + i)), x + 14, y); m.lineWidth = 3; m.strokeStyle = '#05060c'; m.stroke(); }
  compose(c, Ls, { bgBlur: 1.2, fgBlur: 8 });
  grade(c, { warm: '255,190,110', warmA: .4, wx: .5, wy: .5, cool: '10,20,70', coolA: .4, vigA: .65 });
}
// ---------------- S16/S17: cell, then the pardon (31.28 – 35.74) ----------------
function cellShot(c, lt, gt, o) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c;
  const cam = o.cam;
  cellBack(b, cam, gt, { winX: 300, col: '#5a5e66', sky: '#9ab0d0' });
  at(b, cam, -1500, 0, 1700, (c) => { stoneWall(c, -900, -2600, 900, 2600, '#62666e', 9); tally(c, 28, -820, -2250, .9, 'rgba(20,20,30,.55)'); });
  const door = o.door ?? 0;
  // cell door on the left wall (iron, "Gefängnis" plate), opening inwards
  at(b, cam, -430, 0, 2100, (c) => {
    rr(c, -560, -2300, 1120, 2300, 0); fs(c, '#1a1a20');
    if (door > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lg(c, 0, -2300, 0, 0, [[0, `rgba(255,210,140,${.9 * door})`], [1, `rgba(255,180,100,${.7 * door})`]]); c.fillRect(-560, -2300, 1120, 2300); c.restore(); }
    const ow = 1 - ease(door) * .78; c.save(); c.translate(-560, 0);
    P(c, [0, -2300, 1120 * ow, -2300 - 160 * (1 - ow), 1120 * ow, 160 * (1 - ow), 0, 0]); fs(c, lg(c, 0, 0, 1120, 0, [[0, '#3a3c44'], [1, '#4a4c56']]), 12);
    for (let i = 0; i < 6; i++) { el(c, 80 * ow, -2100 + i * 400, 22 * ow + 4, 22); fs(c, '#6a6c74', 5); el(c, 1040 * ow, -2100 + i * 400, 22 * ow + 4, 22); fs(c, '#6a6c74', 5); }
    rr(c, 300 * ow, -1900, 520 * ow, 200, 6); fs(c, '#1a1a20', 6); for (let i = 1; i < 5; i++) ln(c, [300 * ow + i * 104 * ow, -1900, 300 * ow + i * 104 * ow, -1700], 10, '#5a5c64');
    rr(c, 160 * ow, -1120, 800 * ow, 230, 10); fs(c, '#c8c0a8', 8); c.save(); c.scale(ow, 1); txt(c, 'Gefängnis', 560, -1005, 130, '#2a2420'); c.restore();
    c.restore();
  });
  bunk(b, cam, 330, 1500, .65);
  // light: single cold shaft, then warm light pouring from the door
  const wp = proj(cam, 560, -2500, 2200); beam(b, wp.x, wp.y, wp.x - 300, H * 1.05, 200, 600, '200,215,255', .32 * (1 - door * .5));
  if (door > 0) { const d0 = proj(cam, -430, -1200, 2100); beam(m, d0.x, d0.y, d0.x + 900, H * 1.1, 500, 1500, '255,200,120', .45 * ease(door)); glow(m, d0.x, d0.y, 900, '255,190,110', .45 * door); }
  o.chars(m, Ls);
  dust(m, 0, W, 200, 1700, gt, { n: 40, a: .4 + door * .3, col: door > .3 ? '255,220,160' : '220,230,255' });
  const dp = proj(cam, 900, -2300, 2000), dy = ((gt * 1.1) % 1); el(m, dp.x, dp.y + dy * 1000 * dp.s, 6, 10); m.fillStyle = 'rgba(220,230,255,.6)'; m.fill();
  at(f, cam, 650, 0, 480, (c) => { rr(c, -60, -3200, 120, 3200, 20); fs(c, '#22242a', 10); rr(c, 260, -3200, 120, 3200, 20); fs(c, '#22242a', 10); });
  compose(c, Ls, { bgBlur: 2, fgBlur: 12 });
  grade(c, { warm: door > 0 ? '255,190,110' : '200,220,255', warmA: .2 + door * .35, wx: .1, wy: .55, cool: '20,30,60', coolA: .5 - door * .2, vigA: .7 - door * .15 });
}
function S16(c, lt, gt) {
  const u = ease5(seg(lt, -.1, 1.8));
  cellShot(c, lt, gt, { cam: cam0({ x: lerp(40, 0, u), y: -520, z: lerp(0, 160, u), hy: 1060 }), door: 0, chars: (m) => {
    const strok = Math.sin(gt * 4) * .5 + .5;
    litChars(m, (sc) => noahAt(sc, cam0({ x: lerp(40, 0, u), y: -520, z: lerp(0, 160, u), hy: 1060 }), 250, 1350, { sit: true, seatH: 440, arms: { l: { a: .35, b: .9 }, r: { a: .55 + strok * .05, b: 2.55 } }, expr: { mouth: 'flat', look: -.3, lid: .45 } }, { outfit: 'tee', t: gt }, null), Object.assign({}, KEYS.cell, { cx: 600, cy: 1000, span: 300 }));
  } });
}
function S17(c, lt, gt) {
  const u = ease5(seg(lt, -.1, 3)), cam = cam0({ x: lerp(-40, -120, u), y: -560, z: lerp(-250, -100, u), hy: 1060 });
  const door = eseg(lt, .05, .8), rise = eseg(lt, 1.05, 1.5), walk = eseg(lt, .35, 1.2), hold = eseg(lt, 1.0, 1.35);
  cellShot(c, lt, gt, { cam, door, chars: (m) => {
    litChars(m, (sc) => {
      // guard enters with the sealed pardon
      at(sc, cam, lerp(-1050, -560, walk), 0, 1650, (c) => drawPerson(c, { k: .5, skin: SKIN.tan, hair: 'short', hairCol: '#5a4a3a', hat: 'guard', mst: 'mutton', mstCol: '#6a5a4a', coat: '#3a4a3a', buttons: '#c9a04a', collar: '#2a3a2a', expr: { mouth: 'smile', look: .6 }, arms: { l: { a: .13, b: -.06 }, r: { a: lerp(.2, 1.3, hold), b: lerp(.2, .2, hold) } } }));
      if (rise < .5) noahAt(sc, cam, 250, 1350, { sit: true, seatH: 440, arms: { l: { a: .35, b: .9 }, r: { a: .35, b: .9 } }, expr: { mouth: 'soft', look: -.6, browUp: door * .8 } }, { outfit: 'tee', t: gt });
      else noahAt(sc, cam, 250, 1350, { bob: (1 - rise) * 60, arms: { l: { a: .25, b: .1 }, r: { a: .25, b: .1 } }, expr: { mouth: 'smile', look: -.5, browUp: .6 } }, { outfit: 'tee', t: gt });
    }, Object.assign({}, KEYS.warm, { cx: 500, cy: 1000, span: 400 }));
    // the pardon document (readable), handed over
    const dp = proj(cam, lerp(-850, -260, walk) + hold * 40, lerp(-760, -880, hold), 1600);
    m.save(); m.translate(dp.x, dp.y); m.scale(dp.s, dp.s); m.rotate(-.06 + Math.sin(gt * 2) * .01);
    rr(m, -260, -330, 520, 660, 8); fs(m, lg(m, 0, -330, 0, 330, [[0, '#f6eed6'], [1, '#e2d4b0']]), 8);
    txt(m, 'Begnadigung', 0, -230, 74, '#2a2018'); ln(m, [-200, -170, 200, -170], 4, '#2a2018');
    for (let i = 0; i < 6; i++) ln(m, [-210, -110 + i * 44, 210 - (i === 5 ? 120 : 0), -110 + i * 44], 5, 'rgba(60,50,40,.55)');
    el(m, 140, 230, 72, 72); fs(m, '#a8201c', 6); el(m, 140, 230, 44, 44); fs(m, null, 5, '#7a1410'); ln(m, [110, 290, 80, 380], 18, '#c03030'); ln(m, [170, 290, 200, 380], 18, '#c03030');
    m.restore();
  } });
}

// ---------------- S18: today, the bronze statue at sunset (35.74 – 40.62) ----------------
function sunsetPlaza(c, Ls, cam, t) {
  const b = Ls.bg.c;
  b.fillStyle = lg(b, 0, 0, 0, H, [[0, '#3a4a7a'], [.35, '#c86a5a'], [.6, '#f0a860'], [1, '#f6d090']]); b.fillRect(0, 0, W, H);
  const sp = proj(cam, -9000, -2500, 30000); glow(b, sp.x, sp.y, 900, '255,200,120', .7); el(b, sp.x, sp.y, 120, 120); b.fillStyle = '#fff0c0'; b.fill();
  at(b, cam, 0, 0, 7000, (c) => rathausFacade(c, t, { lit: 1, brick: '#a0482e', noSign: 1 }));
  at(b, cam, -3600, 0, 5200, (c) => autumnTree(c, t, 3, 1.2)); at(b, cam, 3600, 0, 5200, (c) => autumnTree(c, t, 9, 1.2));
  cobbles(b, cam, -5000, 5000, 600, 7000, { col: '#b0927a', size: 200 });
  for (let i = 0; i < 4; i++) beam(b, sp.x, sp.y, W * (.3 + i * .2), H, 40, 500, '255,190,110', .1);
  // birds over the roofs
  for (let i = 0; i < 5; i++) { const x = ((i * 260 + t * 90) % (W + 200)) - 100, y = 300 + i * 40 + Math.sin(t * 2 + i) * 20; b.beginPath(); b.moveTo(x - 18, y); b.quadraticCurveTo(x - 8, y - 12 * Math.abs(Math.sin(t * 9 + i)), x, y); b.quadraticCurveTo(x + 8, y - 12 * Math.abs(Math.sin(t * 9 + i)), x + 18, y); b.lineWidth = 3; b.strokeStyle = '#2a1a2a'; b.stroke(); }
}
function statueSprite(c, cam, X, Z, t, glintA) {
  const S = off('ST'), sc = S.c;
  noahAt(sc, cam, X, Z, { arms: { l: { a: .25, b: .6 }, r: { a: .13, b: -.08 } }, expr: { mouth: 'smirk', look: .15, lid: .1 } }, UNIF({ cape: 1, capeWind: 0, t: 0, mLift: 1 }), null, -880);
  const MK = off('ST_mask'); MK.c.drawImage(S.cv, 0, 0);
  sc.save(); sc.globalCompositeOperation = 'multiply'; sc.fillStyle = '#c08048'; sc.fillRect(0, 0, W, H); sc.restore();
  // keep it readable: lift the shadows a little, then a warm sunset sheen from the left
  sc.save(); sc.globalCompositeOperation = 'source-atop';
  sc.fillStyle = 'rgba(110,64,30,.35)'; sc.globalCompositeOperation = 'screen'; sc.fillRect(0, 0, W, H);
  sc.globalCompositeOperation = 'source-atop'; const hp = proj(cam, X, -1500, Z); sc.fillStyle = lg(sc, hp.x - 400, 0, hp.x + 300, 0, [[0, 'rgba(255,220,150,.55)'], [.45, 'rgba(255,200,120,.12)'], [1, 'rgba(40,20,10,.25)']]); sc.fillRect(0, 0, W, H);
  // patina in the creases
  sc.fillStyle = 'rgba(70,120,100,.12)'; sc.fillRect(0, 0, W, H);
  sc.restore(); sc.save(); sc.globalCompositeOperation = 'destination-in'; sc.drawImage(MK.cv, 0, 0); sc.restore();
  c.drawImage(S.cv, 0, 0);
  // specular streaks on the bronze
  const p = proj(cam, X, -880, Z);
  if (glintA > 0) { const e = proj(cam, X + 46, -880 - 1265 * .5, Z); glint(c, e.x, e.y, 70 * glintA, glintA); }
}
function pedestal(c, cam, X, Z, plaque) {
  at(c, cam, X, 0, Z, (c) => {
    rr(c, -620, -300, 1240, 300, 10); fs(c, '#8a8478', 10); rr(c, -520, -880, 1040, 600, 8); fs(c, lg(c, -520, 0, 520, 0, [[0, '#a8a090'], [.5, '#c8bea8'], [1, '#8a8274']]), 10);
    rr(c, -600, -960, 1200, 90, 8); fs(c, '#9a9282', 10);
    // bronze plaque
    rr(c, -440, -800, 880, 420, 16); fs(c, lg(c, 0, -800, 0, -380, [[0, '#d0a060'], [.5, '#a87838'], [1, '#7a5426']]), 10);
    rr(c, -410, -770, 820, 360, 10); fs(c, null, 5, '#5a3a18');
    txt(c, 'Der Hauptmann', 0, -650, 104, '#3a240e'); txt(c, 'von Köpenick', 0, -515, 104, '#3a240e');
    if (plaque) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lg(c, -440 + plaque * 1300, 0, -240 + plaque * 1300, 0, [[0, 'rgba(255,230,170,0)'], [.5, 'rgba(255,230,170,.35)'], [1, 'rgba(255,230,170,0)']]); rr(c, -440, -800, 880, 420, 16); c.fill(); c.restore(); }
  });
}
function tourists(c, cam, t, set) {
  const T = [[-1000, 2700, SKIN.tan, null, '#e8c84a', 'curly', 0], [1020, 2750, SKIN.light, null, '#7a5aa0', 'long', 1], [-820, 2300, SKIN.olive, 'sun', '#e07a5a', 'bun', 1], [840, 2350, SKIN.peach, 'beanie', '#3d7f8c', 'short', 0]];
  T.forEach(([X, Z, skin, hat, coat, hair, dress], i) => at(c, cam, X, 0, Z, (c) => drawPerson(c, { k: .5, skin, hat, hair, hairCol: ['#2a1a14', '#7a5a3a', '#1a1210', '#c8a050'][i], coat, dress, pants: '#3a4a6a', shoe: '#e8e8e8', expr: { mouth: 'smile', look: X < 0 ? .6 : -.6 }, camera: i === 0, arms: { l: { a: 2.0 + Math.sin(t + i) * .03, b: .9 }, r: { a: 2.0, b: .9 } },
    hold: (c, L, R) => { const x = (L.wx + R.wx) / 2, y = (L.wy + R.wy) / 2 - 60; rr(c, x - 70, y - 120, 140, 230, 18); fs(c, '#1a1a20', 8); rr(c, x - 54, y - 100, 108, 190, 10); fs(c, '#9ad0ff'); glow(c, x, y, 160, '160,210,255', .3); } })));
}
function S18a(c, lt, gt) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, u = ease5(seg(lt, -.2, 2.7));
  const cam = cam0({ x: lerp(-160, 0, u), y: -1000, z: lerp(900, 1050, u), hy: lerp(1120, 1100, u) });
  sunsetPlaza(c, Ls, cam, gt);
  pedestal(m, cam, 0, 2400, 0);
  statueSprite(m, cam, 0, 2400, gt, 0);
  tourists(m, cam, gt, 0);
  for (let i = 0; i < 4; i++) { const x = ((i * 300 + gt * 40) % 1400) - 200; at(m, cam, -900 + i * 520, 0, 1500, (c) => bird(c, 0, -20, { t: gt + i, sc: 2, color: '#8a8e9e' })); }
  dust(m, 0, W, 300, 1600, gt, { n: 40, a: .5, col: '255,210,150' });
  leaves(f, gt, { n: 6, r: 34, seed: 21, speed: 90 });
  compose(c, Ls, { bgBlur: 2, fgBlur: 10 });
  grade(c, { warm: '255,170,90', warmA: .5, wx: .05, wy: .5, cool: '60,40,90', coolA: .35, vigA: .5 });
}
function S18b(c, lt, gt) {
  const Ls = layers(), b = Ls.bg.c, m = Ls.mid.c, f = Ls.fg.c, u = ease5(seg(lt, -.1, 1.05));
  const cam = cam0({ x: 0, y: lerp(-1250, -1000, u), z: lerp(1100, 595, u), hy: 1150 });
  sunsetPlaza(c, Ls, cam, gt);
  pedestal(m, cam, 0, 2400, seg(lt, 1.1, 2.0));
  statueSprite(m, cam, 0, 2400, gt, bump(lt, 1.75, 2.25));
  dust(m, 0, W, 300, 1600, gt, { n: 40, a: .55, col: '255,210,150' });
  leaves(f, gt, { n: 5, r: 34, seed: 23, speed: 90 });
  compose(c, Ls, { bgBlur: 2.4, fgBlur: 10 });
  grade(c, { warm: '255,170,90', warmA: .5, wx: .05, wy: .4, cool: '60,40,90', coolA: .3, vigA: .45 });
}

// ---------------- timeline ----------------
const CUTS = [0, 1.77, 3.65, 5.30, 7.90, 10.50, 13.40, 17.27, 19.45, 21.00, 22.90, 24.40, 26.35, 27.97, 29.55, 31.28, 32.90, 35.74, 38.22, 40.62];
const FNS = [S1, S2, S3, S4, S5, S6, S7, S9, S10, S11, S12, S13, S14, S15, S15b, S16, S17, S18a, S18b];
const TRS = ['dis', 'dis', 'dis', 'dip', 'dip', 'dis', 'dis', 'dis', 'dis', 'dis', 'dis', 'dip', 'dis', 'dis', 'dis', 'dis', 'dis', 'dis'];
defineFilm({
  duration: 40.62,
  shots: FNS.map((fn, i) => ({ t0: CUTS[i], t1: CUTS[i + 1], draw: fn })),
  tr: TRS.map(t => t === 'dip' ? { type: 'dip', d: .6 } : { type: 'dis', d: .3 }),
});
