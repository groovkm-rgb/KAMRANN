'use strict';
// ===== "Stell dir vor, du bist Fotograf" — vertical 1080x1920, 30 fps, cut on the voice-over phrase gaps =====
const TB = [0, 1.8, 3.3667, 5.1, 7.8, 9.5, 11.6, 14.2667, 15.2333, 17.0333, 19.2, 21.2667, 23.0333, 24.5667, 27.3333, 29.4333, 32.3333, 35.3, 37.9333, 39.2, 40.75, 42.4667].map(x => Math.round(x * 30) / 30);
const CH = 150, CAMX = -330;                       // chair x, studio camera x
const LS = { rim: '255,226,170', lx: .55, ly: -.12 }; // studio key light: the glass ceiling
const LD = { rim: '255,70,50', lx: .15, ly: .1, warm: '255,80,60', warmA: .2, coolA: .3 };
const LL = { rim: '255,190,120', lx: .95, ly: .3, warm: '255,190,120', warmA: .2, cool: '20,30,60', coolA: .28 };
const zpOf = (cam, p) => 1 + (cam.z - 1) * p;
const toScr = (cam, p, x, y) => { const zp = zpOf(cam, p); return [W / 2 + zp * (x - cam.x * p), H / 2 + zp * (y - cam.y * p)]; };
const fromScr = (cam, p, sx, sy) => { const zp = zpOf(cam, p); return [(sx - W / 2) / zp + cam.x * p, (sy - H / 2) / zp + cam.y * p]; };
// eased camera keys [t, x, y, z, rot] + a constant slow drift so the camera never freezes
function camK(lt, kf, drift = 1) {
  const v = keys(lt, kf.map(k => [k[0], [k[1], k[2], k[3], k[4] || 0]]));
  return { x: v[0] + Math.sin(lt * .9) * 3 * drift, y: v[1] + Math.sin(lt * .7 + 1) * 2.5 * drift, z: v[2] * (1 + lt * .012 * drift), rot: v[3] + Math.sin(lt * .6) * .004 * drift };
}
function shadowAt(c, x, b, w = 120, a = .3) { c.save(); c.translate(0, b); castShadow(c, x, w, { dir: .4, len: .7, alpha: a }); c.restore(); }
const toLocal = (o, wx, wy) => [(wx - o.x) / (o.k ?? NK) / (o.s || 1), (wy - o.y) / (o.k ?? NK)];
const up2pi = s => ({ a: s.a + Math.PI * 2, b: s.b }); // same arm, forced to draw in front of the face
// screen-space spot beam from the skylight onto (sx)
function spot(c, sx, y1, w0, w1, a, t) {
  scr(c); c.save(); c.globalCompositeOperation = 'screen';
  const g = c.createLinearGradient(0, -100, 0, y1); g.addColorStop(0, `rgba(255,236,190,${a})`); g.addColorStop(1, 'rgba(255,236,190,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(sx - w0 / 2, -100); c.lineTo(sx + w0 / 2, -100); c.lineTo(sx + w1 / 2, y1); c.lineTo(sx - w1 / 2, y1); c.closePath(); c.fill();
  for (let i = 0; i < 4; i++) { const k = i / 3 - .5, f = .6 + .4 * Math.sin(t * 1.3 + i * 2); c.fillStyle = `rgba(255,240,200,${a * .25 * f})`; c.beginPath(); c.moveTo(sx + k * w0 - 10, -100); c.lineTo(sx + k * w0 + 10, -100); c.lineTo(sx + k * w1 + 30, y1); c.lineTo(sx + k * w1 - 30, y1); c.fill(); }
  c.restore();
}
// hand-held head clamp (hook)
function clampTool(c, x, y, open, glow, t) {
  if (glow > 0) { bloom(c, x, y - 34, 170, '255,226,150', .55 * glow); for (let i = 0; i < 5; i++) { const a = t * 2.4 + i * 1.256, r = 62 + 10 * Math.sin(t * 5 + i); sparkle(c, x + Math.cos(a) * r, y - 34 + Math.sin(a) * r * .8, 7 + 4 * Math.sin(t * 9 + i), glow * (.6 + .4 * Math.sin(t * 7 + i))); } }
  ln(c, [x, y + 40, x, y - 28], 8, IRON.d); ln(c, [x - 1.5, y + 38, x - 1.5, y - 26], 2.5, IRON.l);
  c.beginPath(); c.roundRect(x - 44, y - 38, 88, 10, 3); ff(c, IRON.m, PW * .8); ln(c, [x - 40, y - 36, x + 40, y - 36], 2, IRON.l);
  for (const s of [-1, 1]) { c.save(); c.translate(x + s * 42, y - 34); c.rotate(s * open * .75); ln(c, [0, 0, 0, -26, -s * 8, -40], 7, IRON.d); ln(c, [0, 0, 0, -26, -s * 8, -40], 2.4, IRON.l); c.beginPath(); c.ellipse(-s * 10, -44, 7, 12, 0, 0, 7); ff(c, '#6b3c22', 2); c.restore(); }
  c.beginPath(); c.arc(x, y - 33, 8, 0, 7); ff(c, BRASS.l, 1.8); c.beginPath(); c.arc(x, y + 40, 7, 0, 7); ff(c, BRASS.m, 1.6);
}
// the seated customer group (stand behind, chair, gent, chair arms, clamp forks in front)
function chairGroup(g, st = {}) {
  return (c, b) => {
    shadowAt(c, CH, b, 230, .35);
    const hp = gentHeadPos(Object.assign({}, g, { y: b })), hy = hp[1] + 6;
    if (st.stand !== false) headStand(c, st.x ?? CH, b - 40, { headY: st.headY ?? hy, open: st.open ?? 0, plate: st.plate, glint: st.glint, back: true, front: false });
    armchair(c, CH, b, 'back');
    if (g.who === 'mom') drawMother(c, Object.assign({}, g, { y: b })); else if (g.who === 'draped') drawDraped(c, Object.assign({}, g, { y: b })); else if (g.who !== 'none') drawGent(c, Object.assign({}, g, { y: b }));
    armchair(c, CH, b, 'front');
    if (st.stand !== false && st.front !== false) headClampFront(c, st.x ?? CH, st.headY ?? hy, { open: st.open ?? 0 });
  };
}
const gentO = (t, o = {}) => Object.assign({ x: CH, sit: true, t, e: { lid: .35 }, mouth: 'smug' }, o);
const babyOn = (t, o = {}) => c => drawBaby(c, Object.assign({ x: 40, y: -600, k: .86, t, wig: 1 }, o));
const momO = (t, o = {}) => Object.assign({ who: 'mom', x: CH, sit: true, t, e: { lid: .2 }, baby: babyOn(t) }, o);
const drapedO = (t, o = {}) => Object.assign({ who: 'draped', x: CH, t, baby: c => drawBaby(c, { x: 0, y: -560, k: .95, t, wig: 1, giggle: .5 + .5 * Math.sin(t * 11) }) }, o);
// ---------------------------------------------------------------------------------- shots
const SHOTS = [];
const shot = (name, f) => SHOTS.push({ name, f });

// 1 — HOOK: Noah pops out from under the camera cloth, proud, pulls out the glowing head clamp
shot('1 hook', (lt, T, t) => {
  const cam = camK(lt, [[0, -400, -255, 2.55], [.95, -420, -262, 2.75], [1.8, -455, -300, 3.75]]);
  const NX = -500, jump = seg(lt, .2, .62), ny = -95 * Math.sin(jump * Math.PI), squash = 24 * bump(lt, .6, .78);
  const under = lt < .22, proud = seg(lt, .62, .8), raise = seg(lt, 1.05, 1.38);
  let arms, ex;
  if (under) { arms = { l: { a: .6, b: -.9 }, r: armIK(1, 330, -900) }; ex = { mouth: 'smile', browUp: .4 }; }
  else if (lt < .64) { const k = ease(seg(lt, .2, .4)); arms = { l: { a: lerp(.6, 2.55, k), b: .25 }, r: { a: lerp(.6, 2.55, k), b: .25 } }; ex = { mouth: 'o', browUp: 1 }; }
  else { const hip = s => armIK(s, s * 128, -575); arms = { l: hip(-1), r: hip(1) }; ex = { mouth: 'smile', browUp: .55 + .3 * proud, lid: .1 }; }
  if (lt >= 1.05) { const r0 = armIK(1, 128, -575), r1 = { a: 2.35, b: -.35 }; arms.r = raise < 1 ? { a: lerp(r0.a, r1.a, ease(raise)), b: lerp(r0.b, r1.b, ease(raise)) } : r1; if (arms.r.a < 1.6) arms.r = up2pi(arms.r); ex = { mouth: 'smile', browUp: .9, look: .7 }; }
  const no = { x: NX, arms, expr: ex, bob: squash * 4, lean: under ? .3 + Math.sin(lt * 30) * .04 : (lt < .64 ? 0 : -.03 * proud), tilt: lt > 1.05 ? .08 : 0 };
  const open = lt < 1.38 ? 1 : (Math.sin((lt - 1.38) * Math.PI / .12) > 0 ? 0 : 1);
  const clothFly = seg(lt, .22, 1.0);
  const items = [
    { z: 9, p: 1, y: 20, lit: LS, fn: (c, b) => { if (!under) bigCamera(c, CAMX, b, { t, cap: 0 }); } },
    { z: 11, p: 1, y: 0, lit: LS, fn: (c, b) => {
      shadowAt(c, NX, b, 130 * (1 - jump * .5));
      if (!under) noah(c, Object.assign({}, no, { y: b + ny }));
      if (under) { c.save(); c.beginPath(); c.rect(NX - 400, b - 150, 800, 400); c.clip(); noah(c, Object.assign({}, no, { y: b + ny })); c.restore(); }
      if (under) { bigCamera(c, CAMX, b + 20, { t, cap: 0 }); cameraCloth(c, CAMX, b + 20, { t, bulge: .6 + .4 * Math.sin(lt * 40) }); drawNoahHead(c, CAMX - 205, b - 300 + Math.sin(lt * 30) * 3, NK, { mouth: 'smile', browUp: .6, look: .8 }, -.45); }
      if (lt > .95) { const hp = noahHandPos(Object.assign({}, no, { y: b + ny }), 1, 30), gl = seg(lt, .95, 1.25); clampTool(c, hp[0] - 4, hp[1] - 10, open, gl, t); }
    } },
    { z: 12, p: 1, fn: c => { if (!under && clothFly < 1) { const k = easeOut(clothFly), cx = lerp(-470, -760, k), cy = lerp(-330, -900, k), r = k * 2.2; const pts = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, rx = 120 + 40 * Math.sin(lt * 9 + i), ry = 80 + 30 * Math.cos(lt * 7 + i * 2); pts.push([cx + Math.cos(a + r) * rx * (1 + .2 * Math.sin(a * 3 + lt * 12)), cy + Math.sin(a + r) * ry]); } flyingCloth(c, pts, t); } } },
    { z: 4, p: 1, fn: c => spot(c, toScr(cam, 1, NX, 0)[0] + 20, 1900, 260, 620, .3, t) },
    fgCurtain(cam, 105, t, 1), fgTripod(cam, 1060, t),
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: -280, carT: t, birdX: -400 }), c => { if (lt > .2 && lt < .5) { scr(c); motionLines(c, toScr(cam, 1, NX, -300)[0], toScr(cam, 1, NX, -300 + ny)[1], 260, 12, 1 - seg(lt, .2, .5)); } }], vignette: .38, shake: lt > .2 && lt < .3 ? 10 : (lt > 1.48 && lt < 1.56 ? 5 : 0) };
});
// 2 — "Vor hundertfünfzig Jahren": tilt up past the proud Noah to the glass ceiling, the sign and a passing carriage
shot('2 tilt up', (lt, T, t) => {
  const cam = camK(lt, [[0, -470, -330, 3.6], [1.57, -300, -565, 2.05]]);
  const NX = -500, hip = s => armIK(s, s * 128, -575), dn = ease(seg(lt, .5, 1.1)), rr = armIK(1, 330, -640), no = { x: NX, arms: { l: hip(-1), r: up2pi({ a: lerp(2.35, rr.a, dn), b: lerp(-.35, rr.b, dn) }) }, expr: { mouth: 'smile', browUp: .9, look: .3 }, tilt: .06 };
  const items = [
    { z: 9, p: 1, y: 20, lit: LS, fn: (c, b) => bigCamera(c, CAMX, b, { t }) },
    { z: 11, p: 1, y: 0, lit: LS, fn: (c, b) => { shadowAt(c, NX, b); const o2 = Object.assign({}, no, { y: b }); noah(c, o2); const hp = noahHandPos(o2, 1, 30); clampTool(c, hp[0] - 4, hp[1] - 10, Math.sin(lt * 9) > .7 ? 1 : .2, .8, t); } },
    fgCurtain(cam, 990, t, -1, 1.6),
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: -240, rayA: .34, carT: t - 1.2, birdX: -300 })], vignette: .35 };
});
// 3 — the vain customer struts in, plops into the chair and twirls his moustache (camera follows top → down)
shot('3 customer', (lt, T, t) => {
  const cam = camK(lt, [[0, 30, -430, 3.3], [.85, 140, -330, 3.05], [1.73, 155, -290, 3.25]]);
  const walk = seg(lt, 0, .78), sitK = seg(lt, .8, 1.0), gx = lerp(-80, CH, ease(walk));
  const twirl = seg(lt, 1.05, 1.73);
  const g = sitK < 1 ? { x: gx, t, walk: walk < 1 ? lt * 11 : null, sit: sitK > .5, bob: walk < 1 ? -Math.abs(Math.sin(lt * 11)) * 14 : 30 * bump(sitK, .5, 1), e: { lid: .35 }, mouth: 'smug', arms: { l: { a: .25 + Math.sin(lt * 11) * .25, b: -.3 }, r: { a: .25 - Math.sin(lt * 11) * .25, b: -.3 } }, tilt: walk < 1 ? Math.sin(lt * 11) * .04 : 0 }
    : gentO(t, { twirl: twirl > 0 ? .5 + .5 * Math.sin(lt * 14) : 0, arms: twirl > 0 ? { r: { tx: 214 + Math.cos(lt * 14) * 14, ty: -1175 + Math.sin(lt * 14) * 14 } } : {}, e: { lid: .45 }, tilt: -.05 });
  const items = [
    { z: 8, p: 1, y: 0, lit: LS, fn: (c, b) => sideTable(c, 340, b - 10, t) },
    { z: 10, p: 1, y: 0, lit: LS, fn: (c, b) => { if (sitK < 1) { armchair(c, CH, b, 'back'); armchair(c, CH, b, 'front'); shadowAt(c, gx, b, 150); drawGent(c, Object.assign({}, g, { y: b })); } else chairGroup(Object.assign({}, g, { who: 'gent' }), { stand: false })(c, b); } },
    fgVase(cam, 1015, t), fgCurtain(cam, 100, t, 1),
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 90 })], vignette: .35 };
});
// 4a — Noah shoves the iron stand in behind the chair; the brass plate "Kopfhalter" glints
shot('4a stand', (lt, T, t) => {
  const SX = lt < 1.35 ? lerp(-130, -45, ease(seg(lt, 0, 1.3))) : lerp(-45, CH, ease(seg(lt, 1.9, 2.55)));
  const plateY = -40 - 112;
  const cam = camK(lt, [[0, 10, -240, 2.8], [1.2, 20, -235, 2.95], [1.6, -45, plateY - 10, 5.4], [1.95, -41, plateY - 12, 5.7], [2.7, 150, -275, 3.1]]);
  const NX = SX - 92, shuffle = (lt < 1.35 || (lt > 1.9 && lt < 2.55)) ? lt * 10 : 0;
  const no = { x: NX, y: -40, arms: { l: { a: .25 + Math.sin(shuffle) * .15, b: -.3 }, r: armIK(1, (92 - 14) / NK, -700) }, legs: [Math.max(0, Math.sin(shuffle)) * 40, Math.max(0, -Math.sin(shuffle)) * 40], lean: .06, expr: { mouth: 'smile', browUp: .6 }, bob: shuffle ? -Math.abs(Math.sin(shuffle)) * 10 : 0 };
  const g = gentO(t, { e: { lid: .3, look: -1, browAng: .4 }, mouth: lt > 2.2 ? 'gulp' : 'smug' });
  const items = [
    { z: 8, p: 1, y: 0, lit: LS, fn: (c, b) => sideTable(c, 340, b - 10, t) },
    { z: 9, p: 1, y: 0, lit: LS, fn: (c, b) => { shadowAt(c, NX, b - 40); shadowAt(c, SX, b - 40, 90); headStand(c, SX, b - 40, { headY: lerp(-330, -274, seg(lt, 2.2, 2.6)), open: 1, glint: seg(lt, 1.5, 1.9), back: true, front: true }); noah(c, Object.assign({}, no, { y: b - 40 + (no.bob ? 0 : 0) })); } },
    { z: 10, p: 1, y: 0, lit: LS, fn: chairGroup(g, { stand: false }) },
    fgCurtain(cam, 985, t, -1),
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 60 })], vignette: .35, shake: lt > 2.5 && lt < 2.6 ? 4 : 0 };
});
// 4b — "Mit einer Klammer für den Kopf": the clamp snaps shut on "Kopf" (t = 8.98)
shot('4b klak', (lt, T, t) => {
  const kT = 8.98 - TB[4], snap = lt >= kT, age = lt - kT;
  const cam = camK(lt, [[0, CH + 10, -300, 5.4], [kT, CH, -292, 6.0], [1.7, CH, -290, 6.5]]);
  const open = snap ? 0 : lerp(1, .45, ease(seg(lt, .45, kT)));
  const g = gentO(t, { e: snap ? { eyes: 'wide', pupil: .6, jit: 2, t } : { lid: .3, look: .6, browAng: lt > .8 ? -.3 : .3 }, mouth: snap ? 'o' : (lt > .8 ? 'tight' : 'smug'), hatUp: snap ? 40 * Math.exp(-age * 9) * Math.abs(Math.sin(age * 20)) : 0, stacheWig: snap ? Math.exp(-age * 4) : 0, stacheUp: snap ? .6 : 0, sweat: [{ x: 150, p: seg(lt, kT + .15, kT + .7) }] });
  const items = [
    { z: 10, p: 1, y: 0, lit: LS, fn: chairGroup(g, { open }) },
    { z: 13, p: 1, fn: c => { // Noah's arm with the gold watch turns the knob
      const hy = gentHeadPos(Object.assign({}, g, { y: 0 }))[1] + 6, kx = CH + 66, turn = Math.sin(lt * 8) * .25 * (snap ? 0 : 1);
      withInk(() => { c.save(); c.translate(kx + 40, hy + 10); c.scale(NK, NK); const ex = 330, ey = 300; nLine(c, [ex, ey, 40, 0], NOAH.ARM_W + INKW * 2, NOAH.out); nLine(c, [ex, ey, 40, 0], NOAH.ARM_W, NOAH.skin);
        const fx = -290, fy = -300, L0 = Math.hypot(fx, fy), wx = 40 + (ex - 40) * .3, wy = (ey) * .3; nLine(c, [wx - fy / L0 * 40, wy + fx / L0 * 40, wx + fy / L0 * 40, wy - fx / L0 * 40], 22, NOAH.out); nLine(c, [wx - fy / L0 * 36, wy + fx / L0 * 36, wx + fy / L0 * 36, wy - fx / L0 * 36], 13, NOAH.watch);
        c.beginPath(); c.arc(wx + 30, wy - 26, 18, 0, 7); nFill(c, NOAH.watch, 8);
        c.translate(40, 0); noahHandLocal(c, 2.35 + turn); c.restore(); });
      if (snap && age < .35) { motionLines(c, CH, hy - 10, 80, 10, 1 - age / .35); sparkle(c, CH - 64, hy - 20, 14, 1 - age / .3); sparkle(c, CH + 64, hy - 20, 14, 1 - age / .3); }
    } },
    fgBellows(cam, -60, 1760, t),
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 80 })], vignette: .4, shake: snap ? 16 * Math.exp(-age * 9) : 0 };
});
// 5 — "Kein Witz. Denn ein Foto dauert.": Noah at the camera takes off the lens cap (on "Foto") and checks the wall clock
shot('5 lens cap', (lt, T, t) => {
  const cam = camK(lt, [[0, -110, -255, 2.35], [2.1, -95, -280, 2.55]]);
  const p = 1.1, pc = 1.3, capT = 10.8 - TB[5];
  const NX = atX(cam, p, 330), nb = FY(cam, 80, p), cb = FY(cam, 260, pc), CXc = atX(cam, pc, 290);
  // lens cap position (camera layer) → Noah's layer → local
  const lensS = toScr(cam, pc, CXc + 136, cb - 268), lensL = fromScr(cam, p, lensS[0], lensS[1]), loc = toLocal({ x: NX, y: nb }, lensL[0], lensL[1]);
  const reach = seg(lt, capT - .45, capT), back = seg(lt, capT + .05, capT + .45);
  const r0 = armIK(1, 128, -575), r1 = armIK(1, Math.min(loc[0], 520), loc[1]), r2 = armIK(1, 260, -760);
  const rArm = reach < 1 ? { a: lerp(r0.a, r1.a, ease(reach)), b: lerp(r0.b, r1.b, ease(reach)) } : { a: lerp(r1.a, r2.a, ease(back)), b: lerp(r1.b, r2.b, ease(back)) };
  const lookClock = seg(lt, 1.45, 1.7);
  const no = { x: NX, arms: { l: armIK(-1, -128, -575), r: rArm }, expr: lt < .75 ? { mouth: 'flat', browUp: .1, lid: .25 } : { mouth: lookClock > 0 ? 'soft' : 'smile', browUp: .5 + lookClock * .3, look: -lookClock }, tilt: -.08 * lookClock, lean: .06 * ease(reach) * (1 - ease(back)) };
  const gx = atX(cam, .85, 790);
  const g = gentO(t, { e: { eyes: 'wide', pupil: .55, jit: 1.2, t }, mouth: 'tight', sweat: [{ x: -150, p: seg(lt, .3, 1.6) }], stacheWig: .25 });
  let capPos = null;
  const items = [
    { z: 10, p: .85, y: -70, lit: LS, fn: (c, b) => { c.save(); c.translate(gx - CH, 0); chairGroup(g, {})(c, b); c.restore(); } },
    { z: 20, p, y: 80, lit: LS, fn: (c, b) => { shadowAt(c, NX, b); const o2 = Object.assign({}, no, { y: b }); noah(c, o2); const hp = noahHandPos(o2, 1, 40); capPos = toScr(cam, p, hp[0], hp[1]); } },
    { z: 21, p: pc, y: 260, lit: LS, fn: (c, b) => { const cap = lt > capT ? fromScr(cam, pc, capPos[0], capPos[1]) : null; bigCamera(c, CXc, b, { t, cap: lt > capT ? 1 : 0, capAt: cap, bulbAt: [CXc + 30, b - 120] }); if (lt > capT && lt < capT + .25) sparkle(c, CXc + 136, b - 268, 12, 1 - (lt - capT) / .25); } },
    fgCurtain(cam, 990, t, -1, 1.7),
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: -40 })], vignette: .36 };
});
// 6 — "Oft mehrere Sekunden, früher sogar Minuten.": stiff sweating face + the BELICHTUNG card
function exposureCard(c, lt) {
  const e = hudEnv(lt, .05, 2.62); if (e.k <= 0) return;
  const x = 220, y = 990, w = 560, h = 600, cx = x + w / 2;
  scr(c); c.save(); c.globalAlpha = e.a; c.translate(cx, y + h / 2); c.rotate(-.02 * (1 + (1 - e.k) * 3)); c.scale(e.s, e.s); c.translate(-cx, -(y + h / 2));
  c.save(); c.shadowColor = 'rgba(20,10,0,.45)'; c.shadowBlur = 34; c.shadowOffsetY = 16; c.fillStyle = '#fff'; rrect(c, x - 12, y - 12, w + 24, h + 24, 34); c.fill(); c.restore();
  rrect(c, x - 12, y - 12, w + 24, h + 24, 34); c.lineWidth = 5; c.strokeStyle = HUD.ink; c.stroke();
  c.fillStyle = '#fbf3e2'; rrect(c, x, y, w, h, 24); c.fill();
  c.save(); rrect(c, x, y, w, h, 24); c.clip(); c.fillStyle = '#8a4b22'; c.fillRect(x, y, w, 84); c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 12; i++) c.fillRect(x + i * 60 - 20, y, 26, 84); c.restore();
  hudIcon(c, 'clock', x + 48, y + 42, 1.4); hudText(c, 'Belichtung', x + 88, y + 56, 40, '#fff');
  // stopwatch
  const sx = cx, sy = y + 84 + 170, R = 122, minutes = lt >= 1.96;
  c.beginPath(); c.roundRect(sx - 16, sy - R - 44, 32, 30, 6); ff(c, BRASS.m, 4); c.beginPath(); c.roundRect(sx - 26, sy - R - 58, 52, 18, 7); ff(c, BRASS.l, 4);
  c.beginPath(); c.arc(sx, sy, R + 14, 0, 7); ff(c, BRASS.m, 5); c.beginPath(); c.arc(sx, sy, R, 0, 7); ff(c, '#fffaf0', 3);
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; ln(c, [sx + Math.cos(a) * (R - (i % 5 ? 10 : 22)), sy + Math.sin(a) * (R - (i % 5 ? 10 : 22)), sx + Math.cos(a) * (R - 4), sy + Math.sin(a) * (R - 4)], i % 5 ? 2 : 4, HUD.ink); }
  const spin = lt < 1.96 ? lt * lt * 9 : 1.96 * 1.96 * 9 + (lt - 1.96) * 40, ha = -Math.PI / 2 + spin * Math.PI * 2;
  c.beginPath(); c.arc(sx, sy + 42, 26, 0, 7); c.lineWidth = 2.5; c.strokeStyle = HUD.muted; c.stroke(); const ma = -Math.PI / 2 + (minutes ? (lt - 1.96) * 4 : spin / 60 * Math.PI * 2); ln(c, [sx, sy + 42, sx + Math.cos(ma) * 20, sy + 42 + Math.sin(ma) * 20], 3, HUD.accent);
  ln(c, [sx - Math.cos(ha) * 18, sy - Math.sin(ha) * 18, sx + Math.cos(ha) * (R - 16), sy + Math.sin(ha) * (R - 16)], 5, minutes ? '#c8402a' : HUD.ink); c.beginPath(); c.arc(sx, sy, 9, 0, 7); ff(c, HUD.ink, 0);
  if (lt > .1 && lt < 2.2) motionLines(c, sx, sy, R + 24, 12, .35 * (.5 + .5 * Math.sin(lt * 40)), HUD.ink);
  // counter
  let n, unit, col = HUD.ink, flip = 1;
  if (!minutes) { n = Math.floor(lerp(0, 15.99, clamp((lt - .15) / 1.72))); unit = n === 1 ? 'Sekunde' : 'Sekunden'; }
  else { n = 1 + Math.floor(clamp((lt - 2.12) / .4) * 2.99); unit = n === 1 ? 'Minute' : 'Minuten'; col = '#c8402a'; flip = Math.abs(Math.cos(clamp((lt - 1.96) / .16) * Math.PI)); if (lt < 2.04) { n = 15; unit = 'Sekunden'; col = HUD.ink; } }
  c.save(); c.translate(cx, y + h - 112); c.scale(1, Math.max(.05, flip)); hudText(c, String(n), 0, 30, 104, col, 'center'); c.restore();
  c.save(); c.translate(cx, y + h - 40); c.scale(1, Math.max(.05, flip)); hudText(c, unit, 0, 16, 48, col, 'center'); c.restore();
  c.restore();
}
shot('6 exposure', (lt, T, t) => {
  const cam = camK(lt, [[0, CH, -218, 6.0], [2.67, CH + 4, -226, 6.6]]);
  const g = gentO(t, { e: { eyes: 'wide', pupil: .5, jit: 1.5, t, lidTw: lt > 2.1 ? .12 * Math.abs(Math.sin(lt * 30)) : 0 }, mouth: 'tight', stacheWig: .55, sweat: [{ x: -150, p: seg(lt, .25, 1.5), len: 260 }, { x: 140, p: seg(lt, 1.2, 2.5), len: 220 }], blush: .4 });
  const items = [{ z: 10, p: 1, y: 0, lit: LS, fn: chairGroup(g, { open: 0 }) }, fgCurtain(cam, 105, t, 1, 1.5, 16)];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 90 }), c => exposureCard(c, lt)], vignette: .38 };
});
// 7a — sneeze (on "zuckt")
shot('7a sneeze', (lt, T, t) => {
  const sT = 14.69 - TB[7], age = lt - sT, done = lt >= sT;
  const cam = camK(lt, [[0, CH, -300, 4.1], [sT, CH, -305, 4.5], [.97, CH, -300, 4.2]]);
  const pre = seg(lt, 0, sT);
  const g = gentO(t, { e: done ? (age < .25 ? { eyes: 'shut' } : { eyes: 'wide', pupil: .7, jit: 2, t }) : { eyes: pre > .4 ? 'shut' : 'dot', lid: .5 }, mouth: done ? (age < .25 ? 'sneeze' : 'o') : 'o',
    tilt: done ? .16 * Math.exp(-age * 6) * Math.cos(age * 18) : -.1 * ease(pre), headBob: done ? 30 * Math.exp(-age * 8) : 0, hatUp: done ? 110 * Math.sin(clamp(age / .45) * Math.PI) : 0, hatRot: done ? .35 * Math.sin(clamp(age / .45) * Math.PI) : 0,
    stacheWig: done ? Math.exp(-age * 3) : .2, stacheUp: done ? .8 * Math.exp(-age * 4) : -.2 * pre, blush: .6 });
  const items = [
    { z: 10, p: 1, y: 0, lit: LS, fn: chairGroup(g, { open: done && age < .3 ? .25 * Math.abs(Math.sin(age * 40)) : 0 }) },
    { z: 13, p: 1, fn: c => { if (done && age < .45) { const hp = gentHeadPos(Object.assign({}, g, { y: 0 })); motionLines(c, hp[0], hp[1] + 30, 90, 14, 1 - age / .45); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 9 - .5) * 2.6, r = 70 + age * 420 * (.6 + rnd(i) * .6); c.beginPath(); c.arc(hp[0] + Math.cos(a) * r * .9, hp[1] + 40 + Math.sin(a) * r * .5 + 60, 3.5, 0, 7); c.fillStyle = `rgba(230,245,255,${1 - age / .45})`; c.fill(); } } } },
    fgVase(cam, 1040, t),
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 90 })], vignette: .38, shake: done ? 22 * Math.exp(-age * 7) : 2 * pre };
});
// 7b — darkroom: Noah proudly lifts the plate → only a smeared blob (M3) → facepalm
shot('7b darkroom', (lt, T, t) => {
  const NX = 0, lift = ease(seg(lt, 0, .45)), palm = seg(lt, 1.25, 1.5);
  const no0 = { x: NX, y: 0 };
  const rT = [lerp(170, 360, lift), lerp(-560, -700, lift)];
  const arms = { r: armIK(1, rT[0], rT[1]), l: palm > 0 ? (() => { const a0 = armIK(-1, -128, -600), a1 = armIK(-1, -30, -1235, 1); const s = { a: lerp(a0.a, a1.a, ease(palm)), b: lerp(a0.b, a1.b, ease(palm)) }; return palm > .3 ? up2pi(s) : s; })() : armIK(-1, -128, -600) };
  const no = Object.assign(no0, { arms, expr: palm > .5 ? { eyes: 'closed', mouth: 'flat', browUp: .2 } : (lt > .8 ? { mouth: 'o', browUp: 1 } : { mouth: 'smile', browUp: .6, lid: .1 }), tilt: palm > .5 ? .1 : 0 });
  const hp = noahHandPos(Object.assign({}, no, { y: -40 }), 1, 40), PX = hp[0] + 6, PY = hp[1] - 70;
  const cam = camK(lt, [[0, 10, -270, 2.9], [.5, 20, -280, 3.2], [.8, PX, PY, 8.6], [1.2, PX, PY, 9.0], [1.55, 10, -300, 3.5], [1.8, 6, -300, 3.6]]);
  const zoomed = cam.z > 6;
  const items = [
    { z: 10, p: 1, y: -40, lit: LD, fn: (c, b) => { noah(c, Object.assign({}, no, { y: b })); glassPlate(c, PX, PY + b + 40, 112, 150, (cc, w, h) => blurPhoto(cc, w, h, t), { rot: .02 }); } },
    { z: 12, p: 1, y: 40, lit: LD, fn: (c, b) => trayBench(c, 0, b, t) },
    { z: 50, p: 1.6, y: 120, blur: 12, fn: (c, b) => { const x = atX(cam, 1.6, 1110); for (let i = 0; i < 3; i++) { c.beginPath(); c.roundRect(x - 30 + i * 40, b - 220 - i * 30, 34, 120 + i * 20, 8); ff(c, ['#5a1410', '#2a1418', '#6e2a14'][i], 3); } } },
  ];
  return { set: 'blank', cam, screen: [c => darkroom(c, cam, t, { items, red: 1 - .7 * clamp((cam.z - 4) / 5) }), c => { if (zoomed) { scr(c); c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(120,60,40,.18)'; c.fillRect(0, 0, W, H); c.restore(); } }], vignette: .5 };
});
// 8 — "Also: nicht bewegen. Nicht blinzeln.": Noah's strict "psst" in front, the customer behind, a fly lands on his nose
shot('8 psst', (lt, T, t) => {
  const cam = camK(lt, [[0, 40, -255, 2.45], [2.17, 95, -262, 2.95]]);
  const p = 1.2, NX = atX(cam, p, 250), shh = ease(seg(lt, .12, .4));
  const chin = armIK(1, 70, -985), rest = armIK(1, 128, -575), rA = { a: lerp(rest.a, chin.a, shh), b: lerp(rest.b, chin.b, shh) };
  const no = { x: NX, arms: { l: armIK(-1, -128, -590), r: shh > .5 ? up2pi(rA) : rA }, expr: { mouth: 'flat', lid: .38, browUp: 0 }, tilt: .05, lean: -.02 };
  const landT = 18.62 - TB[9], fT = seg(lt, .9, landT), landed = lt >= landT;
  const gp = (gx, b) => gentHeadPos({ x: gx, y: b, sit: true });
  const gx = atX(cam, .9, 680);
  const g = gentO(t, { x: CH, e: { eyes: 'wide', pupil: .55, jit: 1, t, cross: landed ? .55 : 0, lidTw: landed ? .45 * Math.abs(Math.sin(lt * 26)) : (lt > 1.4 ? .15 * Math.abs(Math.sin(lt * 17)) : 0) }, mouth: 'tight', stacheWig: landed ? .8 : .3, sweat: [{ x: 150, p: seg(lt, .4, 1.7) }] });
  const items = [
    { z: 10, p: .9, y: -60, lit: LS, fn: (c, b) => { c.save(); c.translate(gx - CH, 0); chairGroup(g, {})(c, b); const hp = gp(CH, b); const nose = [hp[0], hp[1] + 19.5];
      let fx, fy; if (landed) { fx = nose[0] + 2; fy = nose[1] - 6 + Math.sin(lt * 30) * .6; } else { const k = ease(fT); fx = lerp(nose[0] + 200, nose[0] + 2, k) + Math.sin(lt * 9) * 40 * (1 - k); fy = lerp(nose[1] - 120, nose[1] - 6, k) + Math.cos(lt * 11) * 30 * (1 - k); }
      if (lt > .9) fly(c, fx, fy, t, 1.3); c.restore(); } },
    { z: 20, p, y: 260, lit: LS, fn: (c, b) => { shadowAt(c, NX, b); const o2 = Object.assign({}, no, { y: b }); noah(c, o2); if (shh > .5) { const hd = noahHeadPos(o2); fingerHand(c, hd[0] + 6, hd[1] + 50, NK, -.05); } } },
    fgCurtain(cam, 990, t, -1, 1.7),
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 40 })], vignette: .38 };
});
// 9 — "Und Lächeln? Hält so lange kaum einer durch.": a forced smile trembles and melts; tilt up — everyone on the wall is serious too
shot('9 smile melts', (lt, T, t) => {
  const cam = camK(lt, [[0, CH, -238, 5.2], [1.3, CH, -246, 5.5], [2.07, CH - 10, -640, 4.4]]);
  const grow = ease(seg(lt, .05, .45)), melt = ease(seg(lt, 1.0, 1.4));
  const g = gentO(t, { e: { eyes: melt > .5 ? 'dot' : 'wide', lid: melt > .5 ? .35 : 0, pupil: .6, jit: 1, t, browAng: melt > .5 ? .2 : -.4, browUp: .6 * (1 - melt) }, mouth: melt > .85 ? 'frown' : 'grin', smile: grow * (1 - melt), wob: lt > .45 ? .3 + seg(lt, .45, 1) * 1.2 : 0, stacheWig: .3 + .5 * seg(lt, .45, 1), stacheUp: .4 * grow * (1 - melt), sweat: [{ x: -150, p: seg(lt, .5, 1.5) }], blush: .5 });
  const items = [{ z: 10, p: 1, y: 0, lit: LS, fn: chairGroup(g, { open: 0 }) }, fgCurtain(cam, 105, t, 1, 1.5, 16)];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 90 })], vignette: .38 };
});
// 10 — the mother with her baby comes in; Noah (front) smiles and shows her to the chair
shot('10 mother enters', (lt, T, t) => {
  const cam = camK(lt, [[0, -320, -290, 2.6], [1.77, -170, -285, 2.75]]);
  const door = ease(seg(lt, 0, .35)), walk = seg(lt, .15, 1.77);
  const mp = .8, msx = lerp(395, 640, ease(walk)), MX = atX(cam, mp, msx);
  const p = 1.18, NX = atX(cam, p, 215), point = ease(seg(lt, .4, .8));
  const no = { x: NX, arms: { l: armIK(-1, -128, -590), r: { a: lerp(.13, 1.5, point), b: lerp(-.08, -.05, point) } }, expr: { mouth: 'smile', browUp: .55, look: .7, lid: .1 }, tilt: .04 };
  const items = [
    { z: 10, p: mp, y: -70, lit: LS, fn: (c, b) => { shadowAt(c, MX, b, 160); drawMother(c, { x: MX, y: b, t, walk: lt * 8, bob: -Math.abs(Math.sin(lt * 8)) * 8, e: { lid: .2, look: -.3 }, baby: babyOn(t, { x: 70, y: -560, k: .8, rattle: true }) }); } },
    { z: 11, p: 1, y: 0, lit: LS, fn: (c, b) => { armchair(c, CH, b, 'back'); armchair(c, CH, b, 'front'); } },
    { z: 20, p, y: 240, lit: LS, fn: (c, b) => { shadowAt(c, NX, b); noah(c, Object.assign({}, no, { y: b })); } },
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: -120, doorOpen: door })], vignette: .35 };
});
// 11 — "Aber Babys halten nie still.": the baby wriggles, giggles, grabs at Noah's gold watch; Noah scratches his hair
shot('11 baby', (lt, T, t) => {
  const cam = camK(lt, [[0, 70, -250, 2.85], [1.53, 90, -258, 3.1]]);
  const p = 1.14, NX = atX(cam, p, 245);
  const offer = ease(seg(lt, 0, .35)) * (1 - ease(seg(lt, .8, 1.0))), scratch = ease(seg(lt, .95, 1.2));
  // baby position on the mother's lap → Noah's layer
  const bS = toScr(cam, 1, CH + 10 * NK * 4, -150), bL = fromScr(cam, p, bS[0] - 40, bS[1]);
  const nb = FY(cam, 240, p), loc = toLocal({ x: NX, y: nb }, bL[0], bL[1]);
  const rOffer = armIK(1, Math.min(loc[0], 400), Math.max(loc[1], -1000)), rRest = armIK(1, 128, -575), rHead = up2pi(armIK(1, 120, -1470));
  let rA = { a: lerp(rRest.a, rOffer.a, offer), b: lerp(rRest.b, rOffer.b, offer) }; if (scratch > 0) rA = scratch > .4 ? { a: rHead.a, b: rHead.b + Math.sin(lt * 30) * .12 } : { a: lerp(rA.a, rHead.a - Math.PI * 2, scratch / .4), b: lerp(rA.b, rHead.b, scratch / .4) };
  const no = { x: NX, arms: { l: armIK(-1, -128, -590), r: rA }, expr: scratch > .3 ? { mouth: 'soft', browUp: 1, look: .6 } : { mouth: 'smile', browUp: .5, look: .8 }, tilt: scratch > .3 ? -.08 : .04, lean: offer * .06 };
  const grab = seg(lt, .35, .8);
  const m = momO(t, { e: { lid: .15, look: .5 }, baby: babyOn(t, { x: 40, y: -600, k: .86, wig: 1.3, reach: grab > 0 && grab < 1 ? { side: -1, a: 1.9 + Math.sin(lt * 20) * .2 } : null, rattle: true, giggle: grab > 0 ? .9 : undefined }) });
  const items = [
    { z: 10, p: 1, y: 0, lit: LS, fn: chairGroup(m, { stand: false }) },
    { z: 20, p, y: 240, lit: LS, fn: (c, b) => { shadowAt(c, NX, b); noah(c, Object.assign({}, no, { y: b })); } },
    fgVase(cam, 1045, t, 1.55),
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 60 })], vignette: .36 };
});
// 12 — "Also legst du ein Tuch über die Mutter. Komplett.": the magician's cloth swoosh
const DR_OUT = DRAPE_P.slice();
shot('12 cloth', (lt, T, t) => {
  const cam = camK(lt, [[0, 40, -300, 2.55], [1.3, 95, -290, 2.85], [2.77, 105, -285, 2.95]]);
  const p = 1.12, NX = atX(cam, p, 215), nb = FY(cam, 230, p);
  const hold = ease(seg(lt, 0, .35)), throwK = seg(lt, .5, 1.25), land = 1.25, tada = ease(seg(lt, 2.0, 2.2));
  const armsUp = { l: { a: 2.4, b: -.2 }, r: { a: 2.4, b: -.2 } }, armsFwd = { l: { a: 1.2, b: .2 }, r: { a: 1.5, b: .1 } };
  const mix = (A, B, k) => ({ l: { a: lerp(A.l.a, B.l.a, k), b: lerp(A.l.b, B.l.b, k) }, r: { a: lerp(A.r.a, B.r.a, k), b: lerp(A.r.b, B.r.b, k) } });
  let arms = lt < .5 ? mix({ l: { a: .13, b: -.08 }, r: { a: .13, b: -.08 } }, armsUp, hold) : (lt < 1.3 ? mix(armsUp, armsFwd, ease(seg(lt, .5, .9))) : mix(armsFwd, { l: { a: .13, b: -.08 }, r: { a: .13, b: -.08 } }, ease(seg(lt, 1.3, 1.6))));
  if (tada > 0) arms = mix(arms, { l: { a: 2.5, b: .2 }, r: { a: 2.5, b: .2 } }, tada);
  const no = { x: NX, arms, expr: tada > .3 ? { mouth: 'smile', browUp: .8, lid: .1 } : { mouth: lt > .5 && lt < 1.3 ? 'o' : 'smile', browUp: .7, look: .7 }, lean: lt > .5 && lt < 1.3 ? .05 : 0 };
  const covered = lt >= land;
  // cloth keyframes in screen space
  const hl = toScr(cam, p, ...noahHandPos(Object.assign({}, no, { y: nb }), -1, 20)), hr = toScr(cam, p, ...noahHandPos(Object.assign({}, no, { y: nb }), 1, 20));
  const mk = DR_OUT.map(q => toScr(cam, 1, CH + q[0] * NK, q[1] * NK));
  const K0 = [], K1 = [], n = mk.length;
  for (let i = 0; i < n; i++) { const u = i / (n - 1);
    const top = lerp2(hl, hr, u <= .5 ? u * 2 : (1 - u) * 2); const hang = 420 + Math.sin(u * 9 + lt * 6) * 40; K0.push([top[0] + Math.sin(lt * 5 + i) * 8, top[1] + (Math.abs(u - .5) > .25 ? 0 : 0) + (u > .5 ? 0 : 0) + (i > n / 2 ? 0 : 0)]);
    if (i >= n / 2) K0[i] = [lerp(hr[0], hl[0], (i - n / 2) / (n / 2)) + Math.sin(lt * 7 + i) * 14, Math.max(hl[1], hr[1]) + hang];
    const a = Math.PI + u * Math.PI * 2, mc = toScr(cam, 1, CH, -380); K1.push([mc[0] + Math.cos(a) * 430 + Math.sin(lt * 8 + i) * 18, mc[1] - 160 + Math.sin(a) * 210 + Math.cos(lt * 9 + i) * 14]);
  }
  const clothPts = lt < .5 ? K0 : (lt < .9 ? K0.map((q, i) => lerp2(q, K1[i], ease(seg(lt, .5, .9)))) : K1.map((q, i) => lerp2(q, mk[i], ease(seg(lt, .9, land)))));
  const m = momO(t, { e: { lid: .1, look: .3 }, mouth: lt > .7 ? 'o' : undefined, baby: babyOn(t, { x: 40, y: -600, k: .86, rattle: true }) });
  const items = [
    { z: 10, p: 1, y: 0, lit: LS, fn: chairGroup(covered ? drapedO(t, { x: CH }) : m, { stand: false }) },
    { z: 15, p: 1, fn: c => { if (!covered && lt > .02) { scr(c); flyingCloth(c, clothPts, t); } } },
    { z: 16, p: 1, fn: c => { const pa = lt - land; if (pa > -.05 && pa < .6) { const mc = [CH, -300]; smoke(c, mc[0], -40, land, t, { r: 40, life: .8, rise: 60, a: .5 }); for (let i = 0; i < 6; i++) sparkle(c, mc[0] + Math.cos(i) * 90 * (1 + pa), mc[1] + Math.sin(i * 1.7) * 140, 10, 1 - pa / .6); }
      const ka = lt - 2.05; if (ka > 0 && ka < .7) for (let i = 0; i < 5; i++) sparkle(c, CH - 90 + i * 45, -420 - Math.sin(i) * 30, 9 + 4 * Math.sin(t * 9 + i), 1 - ka / .7); } },
    { z: 20, p, y: 230, lit: LS, fn: (c, b) => { shadowAt(c, NX, b); noah(c, Object.assign({}, no, { y: b })); } },
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 70 })], vignette: .36 };
});
// 13a — "Sie hält das Baby fest …": slow push-in on the hidden mother
shot('13a hidden mother', (lt, T, t) => {
  const cam = camK(lt, [[0, CH, -255, 3.0], [1.2, CH, -262, 3.2], [2.1, CH, -282, 4.1]]);
  const items = [{ z: 10, p: 1, y: 0, lit: LS, fn: chairGroup(drapedO(t, { x: CH }), { stand: false }) }, fgBellows(cam, -60, 1780, t), fgVase(cam, 1045, t, 1.5)];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 90 })], vignette: .4 };
});
// 13b — "… und sieht aus wie ein Sessel. Oder wie ein Gespenst.": armchair on "Sessel" (30.24), cute ghost on "Gespenst" (31.56); flash at the end
shot('13b sessel gespenst', (lt, T, t) => {
  const sT = 30.2 - TB[15], gT = 31.5 - TB[15];
  const sess = ease(seg(lt, sT, sT + .22)) * (1 - ease(seg(lt, gT - .05, gT + .2))), gh = ease(seg(lt, gT, gT + .3));
  const cam = camK(lt, [[0, CH, -300, 4.0], [sT, CH, -298, 4.15], [sT + .2, CH, -300, 3.7], [gT, CH, -300, 3.75], [gT + .4, CH, -330, 3.85], [2.9, CH, -335, 3.95]]);
  const doily = seg(lt, sT + .25, sT + .45) * (1 - seg(lt, gT - .1, gT + .05));
  const flashT = 2.82;
  const items = [
    { z: 10, p: 1, y: 0, lit: LS, fn: chairGroup(drapedO(t, { x: CH, sessel: sess, ghost: gh }), { stand: false }) },
    { z: 12, p: 1, fn: c => {
      if (doily > 0) { const dy = lerp(-560, -352, easeOut(doily)); c.save(); c.translate(CH, dy); c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 30 : 36; c.lineTo(Math.cos(a) * r, Math.sin(a) * r * .35); } c.closePath(); ff(c, '#fbf6ea', 2.4); c.restore(); }
      if (lt > sT && lt < sT + .45) for (let i = 0; i < 4; i++) sparkle(c, CH - 80 + i * 55, -330 + Math.sin(i * 2) * 40, 10, 1 - (lt - sT) / .45);
      if (gh > .1) for (let i = 0; i < 3; i++) { const ph = (lt * .8 + i / 3) % 1; c.save(); c.globalAlpha = gh * Math.sin(ph * Math.PI) * .7; ln(c, [CH - 110 - ph * 40, -380 + i * 60, CH - 150 - ph * 70, -370 + i * 60 + Math.sin(ph * 9) * 6], 3, '#fff1dc'); ln(c, [CH + 110 + ph * 40, -380 + i * 60, CH + 150 + ph * 70, -370 + i * 60 + Math.sin(ph * 9) * 6], 3, '#fff1dc'); c.restore(); }
    } },
    { z: 30, p: 1.25, fn: c => { const k = ease(seg(lt, 2.45, 2.75)); if (k <= 0) return; const s = fromScr(cam, 1.25, lerp(-150, 210, k), lerp(-150, 330, k)); const fire = seg(lt, flashT, flashT + .05);
      withInk(() => { c.save(); c.translate(s[0], s[1]); c.scale(NK, NK); nLine(c, [-600, -500, -60, 120], NOAH.ARM_W + INKW * 2, NOAH.out); nLine(c, [-600, -500, -60, 120], NOAH.ARM_W, NOAH.skin); c.translate(-40, 140); noahHandLocal(c, -2.4); c.restore(); });
      flashLamp(c, s[0] + 8, s[1] + 30, .5, fire); } },
    fgBellows(cam, -60, 1780, t),
  ];
  return { set: 'blank', cam, screen: [c => studio(c, cam, t, { items, rayX: 90 })], vignette: .38, flash: seg(lt, flashT, 2.9) };
});
// 14 — PUF! match cut on the flash → wall of countless old photos with hidden mothers, panning down
shot('14 collage', (lt, T, t) => {
  const cam = camK(lt, [[0, -40, -1050, 1.62], [2.97, -30, 620, 1.7]]);
  const items = [
    { z: 60, p: 1.7, blur: 16, fn: c => { const L = atX(cam, 1.7, -40), R = atX(cam, 1.7, 1110), y0 = cam.y * 1.7 - 1400; curtain(c, L, y0, y0 + 3000, 220, t, 1); curtain(c, R, y0, y0 + 3000, 220, t, -1); } },
    { z: 55, p: 1, fn: c => { const s = fromScr(cam, 1, 300, 260); smoke(c, s[0], s[1] + lt * 60, 0, lt, { r: 70, life: 3.2, rise: 30, a: .5 }); } },
  ];
  return { set: 'blank', cam, screen: [c => collage(c, cam, t, { items }), c => { const f = 1 - easeOut(seg(lt, 0, .5)); if (f > 0) { scr(c); c.fillStyle = `rgba(255,252,240,${f})`; c.fillRect(0, 0, W, H); } }], vignette: .42 };
});
// living room helpers: Noah on the sofa with the album
const SOFA_Y = 0, NSIT = { x: 0, sit: true, seatH: 360 }, ALB = { w: 118, h: 150 };
const sitDy = no => (-(no.seatH ?? 250)) - (NOAH.HEM + 40) - 60;
const albumYL = no => -650 + (no.lower || 0); // album centre, local (torso) units
function sofaNoah(o, open) {
  const half = (open > .5 ? ALB.w : ALB.w / 2) / NK, y = albumYL(o) + 120;
  return Object.assign({}, NSIT, o, { arms: { l: armIK(-1, -half + 30, y), r: armIK(1, half - 30, y) } });
}
function albumAt(no, b) { return [no.x, b + (albumYL(no) + sitDy(no)) * NK]; }
function livingItems(t, no, open, o = {}) {
  return [
    { z: 9, p: 1, y: SOFA_Y, lit: LL, fn: (c, b) => { shadowAt(c, 0, b, 380, .35); sofa(c, 0, b, 'back'); } },
    { z: 10, p: 1, y: SOFA_Y, lit: LL, fn: (c, b) => { noah(c, Object.assign({}, no, { y: b })); sofa(c, 0, b, 'front');
      const [ax, ay] = albumAt(no, b); album(c, ax, ay, ALB.w, ALB.h, open, t, { rot: o.rot || 0, left: (cc, x, y, w, h) => { photoPageL(cc, x, y, w, h, o.hand); }, right: (cc, x, y, w, h) => photoPageR(cc, x, y, w, h) });
      const half = open > .5 ? ALB.w : ALB.w / 2; drawNoahHand(c, ax - half + 2, ay + 28, NK, 2.75); drawNoahHand(c, ax + half - 2, ay + 28, NK, -2.75); } },
    { z: 12, p: 1.1, y: 120, lit: LL, fn: (c, b) => { const x = 300; c.beginPath(); c.roundRect(x - 70, b - 150, 140, 14, 4); ff(c, '#c8b49a'); ln(c, [x - 60, b - 136, x - 60, b], 6, '#8a7a6a'); ln(c, [x + 60, b - 136, x + 60, b], 6, '#8a7a6a'); teaMug(c, x - 10, b - 150, t); } },
    fgItem(o.cam, 1.6, -170, 2010, 2.3, 14, c => { for (let i = 0; i < 7; i++) { const a = -2.9 + i * .38 + Math.sin(t * 1.1 + i) * .05; c.beginPath(); c.ellipse(Math.cos(a) * 150, -60 + Math.sin(a) * 160, 120, 30, a, 0, 7); ff(c, i % 2 ? '#3f6f3a' : '#4f8a48', 3); } }),
  ];
}
// album pages (page-local, centred at x,y; w,h page size)
function photoPageL(c, x, y, w, h, hand) {
  c.beginPath(); c.rect(x - w * .36, y - h * .4, w * .72, h * .8); ff(c, '#fffaf0', 1.4);
  c.save(); c.beginPath(); c.rect(x - w * .32, y - h * .36, w * .64, h * .72); c.clip(); const g = c.createLinearGradient(0, y - h * .4, 0, y + h * .4); g.addColorStop(0, '#c9ae84'); g.addColorStop(1, '#9e8058'); c.fillStyle = g; c.fillRect(x - w, y - h, w * 2, h * 2);
  hiddenMotherPhoto(c, x, y, w * .64, h * .72, 7, { hand: hand }); c.fillStyle = 'rgba(90,60,30,.12)'; c.fillRect(x - w, y - h, w * 2, h * 2); c.restore();
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.beginPath(); c.moveTo(x + sx * w * .36, y + sy * h * .4); c.lineTo(x + sx * w * .26, y + sy * h * .4); c.lineTo(x + sx * w * .36, y + sy * h * .3); c.closePath(); c.fillStyle = '#2a1e18'; c.fill(); }
}
function photoPageR(c, x, y, w, h) { photoFrame(c, x - w * .32, y - h * .42, w * .62, h * .4, { seed: 51, frame: '#efe4cc' }); photoFrame(c, x - w * .26, y + h * .04, w * .52, h * .36, { seed: 57, oval: true, frame: '#efe4cc' }); }

// 15a — today: Noah on the sofa opens the "Familienalbum"
shot('15a album', (lt, T, t) => {
  const cam = camK(lt, [[0, 0, -250, 2.75], [2.63, 0, -262, 3.25]]);
  const open = ease(seg(lt, 1.25, 1.75)) * .5 + (lt > 1.75 ? .5 : 0);
  const no = sofaNoah({ expr: open > .5 ? { mouth: 'soft', browUp: .5, lid: .35 } : { mouth: 'smile', browUp: .4, lid: .2 } }, open);
  return { set: 'blank', cam, screen: [c => livingRoom(c, cam, t, { items: livingItems(t, no, open, { cam }) })], vignette: .45 };
});
// 15b — "… schau mal genau hin.": slow zoom into an old baby photo
function photoWorld(no) { const [ax, ay] = albumAt(no, SOFA_Y); return [ax - ALB.w / 2, ay]; }
shot('15b zoom photo', (lt, T, t) => {
  const no = sofaNoah({ expr: { mouth: 'soft', browUp: .5, lid: .35 } }, 1), [px, py] = photoWorld(no);
  const cam = camK(lt, [[0, px * .6, py - 20, 4.2], [1.27, px, py - 4, 8.2]], .5);
  return { set: 'blank', cam, screen: [c => livingRoom(c, cam, t, { items: livingItems(t, no, 1, { cam }) })], vignette: .5 };
});
// 16a — "Vielleicht sitzt da noch jemand.": the hidden mother's loving hand appears at the cloth's edge
shot('16a hand', (lt, T, t) => {
  const no = sofaNoah({ expr: { mouth: 'soft', browUp: .5, lid: .35 } }, 1), [px, py] = photoWorld(no);
  const pw0 = ALB.w * .64, ph0 = ALB.h * .72, k0 = Math.min(pw0 / 720, ph0 / 1700), hx0 = px + (rnd(7) - .5) * pw0 * .1 + 64 * k0, hy0 = py + ph0 * .46 - 585 * k0;
  const cam = camK(lt, [[0, px, py - 2, 8.4], [1.55, lerp(px, hx0, .6), lerp(py, hy0, .6), 11]], .4);
  const glowK = seg(lt, .25, .7);
  const items = livingItems(t, no, 1, { hand: glowK > 0, cam });
  items.push({ z: 30, p: 1, fn: c => { const pw = ALB.w * .64, ph = ALB.h * .72, kk = Math.min(pw / 720, ph / 1700), hx = px + (rnd(7) - .5) * pw * .1 + 64 * kk, hy = py + ph * .46 - 585 * kk; if (glowK > 0) { bloom(c, hx, hy, 22, '255,235,190', .45 * glowK); sparkle(c, hx + 8, hy - 6, 3.5, glowK * (.6 + .4 * Math.sin(t * 8))); } } });
  return { set: 'blank', cam, screen: [c => livingRoom(c, cam, t, { items, flicker: 1 - .2 * bump(lt, 1.1, 1.25) })], vignette: .5 };
});
// 16b — "Unter einem Tuch.": Noah slowly lowers the album and looks at us, surprised; the lamp flickers
shot('16b ending', (lt, T, t) => {
  const lower = ease(seg(lt, .05, .9)) * 230;
  const no = sofaNoah({ lower, expr: lt > .6 ? { mouth: 'o', browUp: 1, look: 0 } : { mouth: 'soft', browUp: .7, lid: .3 } }, 1), [px, py] = photoWorld(no);
  const hd = noahHeadPos(Object.assign({}, no, { y: SOFA_Y }));
  const cam = camK(lt, [[0, px + 10, py - 60, 6.0], [.9, 0, hd[1] + 70, 3.8], [1.72, 0, hd[1] + 66, 4.05]]);
  const fl = 1 - .45 * bump(lt, .55, .68) - .55 * bump(lt, 1.0, 1.1) - .3 * bump(lt, 1.18, 1.26);
  return { set: 'blank', cam, screen: [c => livingRoom(c, cam, t, { items: livingItems(t, no, 1, { hand: true, cam }), flicker: fl })], vignette: .5 };
});

NOAH_FONTS_READY.then(() => defineFilm({ shots: SHOTS.map((s, i) => ({ name: s.name, dur: TB[i + 1] - TB[i], f: s.f })) }));
