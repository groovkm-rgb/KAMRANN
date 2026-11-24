// MAUERFALL – director's kit: time helpers, Noah helpers, location kits, global overlays (stamps, markers, paper cards).
const PT = i => { const k = Math.floor(i), f = i - k; if (f > 1e-6) return PH[k][0] + (PH[k][1] - PH[k][0]) * f; if (k <= 0) return 0; if (k >= PH.length) return VO_DUR; return (PH[k - 1][1] + PH[k][0]) / 2; };
const E = { // Noah's expressions (spec section 4)
  curious: { browUp: .5, look: .6, mouth: 'soft' }, curiousL: { browUp: .5, look: -.6, mouth: 'soft' },
  shock: { lid: 0, browUp: 1, mouth: 'o', open: .7 }, hope: { mouth: 'soft', browUp: .3 }, fear: { lid: .1, look: .9, mouth: 'flat' },
  resolve: { mouth: 'flat', look: 0 }, tears: { mouth: 'smile', lid: .78, browUp: .4 }, awe: { browUp: 1, mouth: 'o' }, tired: { lid: .5, mouth: 'smile' },
  smile: { mouth: 'smile' }, soft: { mouth: 'soft' }, flat: { mouth: 'flat' }, yawn: { mouth: 'yawn', open: .9, eyes: 'closed' },
};
const ease01 = (lt, T) => ease(clamp(lt / T));
const blinkOn = (t, s = 0) => ((t + s) % 3.9) > 3.78;
function ex(e, t, s) { e = Object.assign({}, e); if (e.look !== undefined && e.lookWob) e.look += Math.sin(t * 3) * .4; if (blinkOn(t, s) && e.eyes !== 'closed') e.eyes = 'closed'; return e; }
function NF(c, x, y, o = {}, t = 0) { if (!o.noShadow) softShadow(c, x, y, 130, .38); drawNoah89(c, Object.assign({ x, y, k: .25, ink: 1.8 }, o, { expr: ex(o.expr || E.soft, t, x * .01) })); if (o.tears) tears(c, x - 30 * (o.s || 1) * 0, y - 310, o.tears, t); }
function NS(c, x, y, o = {}, t = 0) { if (!o.noShadow) softShadow(c, x, y, 130, .38); drawNoah89Side(c, Object.assign({ x, y, k: .25, ink: 1.8 }, o, { expr: ex(o.expr || E.soft, t, x * .01) })); }
function NB(c, x, y, o = {}) { drawNoah89Back(c, Object.assign({ x, y, k: .25, ink: 1.8 }, o)); }
const camMove = (a, b, lt, T) => CAM.mix(a, b, ease01(lt, T));
// ---------- location kits: each returns a frame ----------
function kStreet(cam, t, o = {}) {
  const tod = o.tod || 'day';
  return { set: (c, cm, tt) => ostStreet(c, cm, tt, { tod, doorOpen: o.door || 0, houses: o.houses }), cam, vignette: .3,
    behind: [c => { if (!o.noProps) ostProps(c, t, { tod }); if (o.people) o.people(c); if (!o.noWires) ostWires(c, cam); if (o.veh) o.veh(c); }],
    screen: [c => { if (o.near) o.near(c); }, c => ostLight(c, cam, t, { tod }), c => { if (o.ui) o.ui(c); }] };
}
function kFlat(cam, t, o = {}) {
  return { set: (c, cm, tt) => ostFlat(c, cm, tt, { tod: o.tod || 'evening' }), cam, vignette: .38,
    behind: [c => { flatProps(c, t, { tvOn: o.tvOn ?? (o.tod === 'day' ? 0 : 1), tvImg: o.tvImg || ((cc, w, h, tt) => tvOst(cc, w, h, tt, {})), lamp: o.tod === 'day' ? 0 : 1 }); if (o.chairs !== false) { sessel(c, -230, -20, { col: '#6a5a3a', part: 'back', blanket: true }); sessel(c, -230, -20, { col: '#6a5a3a', part: 'front' }); } if (o.people) o.people(c); }],
    screen: [c => { if (o.near) o.near(c); }, c => flatLight(c, cam, t), c => { if (o.ui) o.ui(c); }] };
}
function kHall(cam, t, o = {}) {
  return { set: (c, cm, tt) => presseHall(c, cm, tt), cam, vignette: .22,
    behind: [c => { presseTable(c, t, { spokes: o.spokes }); hallCrowd(c, t, o); if (o.people) o.people(c); }],
    screen: [c => { if (o.near) o.near(c); }, c => presseLight(c, cam, t, { flash: o.noFlash ? 0 : flashK(t) * .22 }), c => { if (o.ui) o.ui(c); }] };
}
const FLASHES = [0.35, 0.95, 1.55, 2.3, 2.95, 4.2, 4.95, 6.3, 7.3, 7.55, 7.75, 9.5, 12.2, 14.0, 18.6, 20.0];
const flashK = t => { let f = 0; for (const ft of FLASHES) if (t >= ft && t < ft + .18) f = Math.max(f, 1 - (t - ft) / .18); return f; };
function hallCrowd(c, t, o = {}) {
  const up = o.up || 0;
  const rows = [[-1500, -160], [-1150, -120], [-800, -90], [-450, -60], [300, -150], [620, -120], [1300, -140], [1620, -110], [1950, -150], [2300, -100], [250, 90], [560, 60], [1420, 70], [1750, 40], [2100, 80], [2450, 60], [-200, 120], [-650, 140]];
  rows.forEach(([x, y], i) => journalist(c, x, y, i, t, { up: o.asker === i ? 0 : up, s: x < 0 ? 1 : -1, kind: o.asker === i ? 'mic' : undefined }));
  for (const [lx, d] of [[-1900, 1], [2600, -1]]) tvLight(c, lx, PH_HZ + 80, d, 1);
}
function kTor(cam, t, o = {}) {
  return { set: (c, cm, tt) => torSet(c, cm, tt, { night: o.night }), cam, vignette: .28,
    behind: [c => { if (o.crowd !== false) torCrowd(c, t, o.crowd || {}); if (o.people) o.people(c); }],
    screen: [c => { if (o.near) o.near(c); }, c => torLight(c, cam, t, { night: o.night }), c => { if (o.ui) o.ui(c); }] };
}
function kBorn(cam, t, o = {}) {
  const tod = o.tod || 'night';
  return { set: (c, cm, tt) => bornholmer(c, cm, tt, { tod, today: o.today }), cam, vignette: .32,
    behind: [c => { if (!o.today) bornProps(c, t, { tod, barrier: o.barrier || 0, cars: false }); if (o.people) o.people(c); if (!o.today && o.columns !== false) bornFront(c, t, {}); if (o.front) o.front(c); }],
    screen: [c => { if (o.near) o.near(c); }, c => bornLight(c, cam, t, { tod: o.today ? 'day' : tod }), c => { if (o.ui) o.ui(c); }] };
}
function kSet(setFn, cam, t, o = {}) {
  return { set: setFn, cam, vignette: o.vig ?? .3, behind: [c => { if (o.people) o.people(c); }], screen: [c => { if (o.near) o.near(c); }, c => { if (o.light) o.light(c); }, c => { if (o.ui) o.ui(c); }] };
}
function kTV(img, t, o = {}) { return { set: (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); return {}; }, cam: { x: 0, y: 0, z: 1 }, vignette: .45, screen: [c => tvFrame(c, img, t, o), c => { if (o.near) o.near(c); }, c => { if (o.ui) o.ui(c); }] }; }
// over-the-shoulder Noah (back view) in the foreground near layer
const ots = (cam, x, ground, o = {}) => c => nearLayer(c, cam, o.p || 1.3, o.sc || 1.7, ground, cc => NB(cc, x, 0, o));
// a cropped person passing in the foreground
const nearFolk = (cam, x, ground, P, o = {}) => c => nearLayer(c, cam, o.p || 1.35, o.sc || 1.6, ground, cc => drawFolkSide(cc, Object.assign({ x, y: 0, s: o.s || 1, walk: o.walk, t: o.t, expr: { mouth: 'flat' } }, P)));
// sepia / desaturate (flashback, memory)
const sepia = a => c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'saturation'; c.fillStyle = `rgba(128,128,128,${a})`; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(255,225,180,${a * .6})`; c.fillRect(0, 0, W, H); c.restore(); };
// people helpers
const GUARD = { hat: 'border', hatCol: '#6b7058', coat: '#6b7058', type: 'uniform', pants: '#5a5e4a', shoes: '#1e1c1a', hair: 'short' };
const COMMANDER = Object.assign({}, GUARD, { hair: 'side', hairCol: '#5a4a3a', coat: '#5f6450', hatCol: '#5f6450' });
const MUTTER = { hair: 'perm', hairCol: '#8a6a4a', coat: '#c9b8d8', type: 'cardigan', apron: '#d8c0c8', pants: '#5a4a5a', skirt: '#5a4a5a', glasses: false };
const NACHBAR = { hair: 'bald', hairCol: '#6a5a4a', coat: '#3a5a8a', type: 'track', pants: '#3a5a8a', slippers: '#7a4a3a', moustache: true, collar: null };
const TANTE = { hair: 'perm', hairCol: '#c8c0b4', coat: '#efe6cf', type: 'cardigan', under: '#d8c8b0', glasses: '#b8963a', skirt: '#6a5a4a', h: .93 };
const WIRT = { hair: 'bald', hairCol: '#4a3a2a', coat: '#efefe8', type: 'apron', apron: '#f4f2ea', moustache: true, h: 1.04 };
const WESTIS = [
  { hair: 'mullet', hairCol: '#7a5a3a', coat: '#2a2a2a', type: 'jacket', pants: '#4a6890' }, { hair: 'perm', hairCol: '#c89a5a', coat: '#e87ab8', type: 'jacket', pants: '#2a2a30' },
  { hair: 'short', hairCol: '#3a2c24', coat: '#3ac8c8', type: 'parka', pants: '#2a2a30' }, { hair: 'long', hairCol: '#2a2422', coat: '#f2c531', type: 'jacket', pants: '#4a6890' },
  { hair: 'side', hairCol: '#a0703c', coat: '#8a5ad8', type: 'coat', pants: '#3a3a40', moustache: true }, { hair: 'perm', hairCol: '#5b4636', coat: '#e8463a', type: 'jacket', pants: '#2a2a30' },
];
function westCrowd(c, t, o = {}) { const xs = o.xs || [-900, -600, -300, 300, 600, 900]; xs.forEach((x, i) => { const P = WESTIS[(i + (o.seed || 0)) % WESTIS.length], j = Math.max(0, Math.sin(t * 7 + i)) * (o.jump ?? 18); drawFolk(c, Object.assign({ x, y: (o.y ?? 0) - j + (i % 2) * 30, arms: o.clap ? { l: { a: .9 + Math.sin(t * 14 + i) * .25, b: -1.6 }, r: { a: .9 - Math.sin(t * 14 + i) * .25, b: -1.6 } } : { l: { a: 2.4, b: -.2 }, r: { a: i % 2 ? .3 : 2.3, b: -.3 } }, expr: { mouth: i % 2 ? 'shout' : 'smile', open: .7 } }, P)); }); }
// ---------- global overlays (time-driven, drawn on top of every shot) ----------
const STAMPS = [[15.0, 21.0, '18:53'], [239.1, 251.7, '18:53'], [290.5, 297.0, '19:30'], [339.3, 345.2, '20:15'], [418.1, 426.0, '23:30'], [533.4, 539.5, '05:00']];
const MARKS = [
  [76.4, 82.0, '5 km – unerreichbar', 220, 900, 70], [176.3, 180.2, 'Wir sind das Volk', 200, 200, 80], [178.0, 182.0, 'Keine Gewalt', 1080, 330, 80],
  [265.2, 271.7, 'Sofort?!', 1180, 250, 120], [469.6, 476.0, 'Wahnsinn!', 230, 190, 120], [572.9, 578.8, '100 DM', 1300, 230, 120],
  [595.7, 599.3, '20 Sorten Joghurt', 160, 190, 80], [597.6, 599.3, 'bei uns: 1', 1240, 880, 80],
];
const DOCS = [[89.0, 101.6, drawT1, 1], [131.0, 137.9, drawT2, 2], [272.0, 290.3, drawT3, 3], [335.8, 343.6, drawT4, 4], [553.6, 563.2, drawT5, 5], [638.6, 644.2, drawT6, 6]];
function globalOverlays(c, t) {
  for (const [a, b, s] of STAMPS) if (t > a - .1 && t < b + .4) clockStamp(c, t, { t0: a, t1: b, text: s });
  for (const [a, b, s, x, y, sz] of MARKS) if (t >= a && t < b) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const out = clamp((b - t) / .3); c.globalAlpha = out; markerWrite(c, s, clamp((t - a) / .9), x, y, sz, { underline: true, halo: true }); c.restore(); }
  for (const [a, b, fn, seed] of DOCS) if (t > a && t < b + .5) docCard(c, t, { t0: a, t1: b, draw: fn, seed, w: 1360, h: 900 });
  // newspaper clipping with the quote (no portrait)
  if (t > 124.9 && t < 131.2) { const k = clamp((t - 124.9) / .4), out = clamp((131.2 - t) / .3); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = Math.min(k, out); c.translate(W / 2, H / 2 + (1 - easeOut(k)) * 300); c.rotate(-.04); paper(c, -560, -170, 1120, 340, 9); c.font = `700 30px ${TYPE}`; c.fillStyle = '#2a2420'; c.fillText('Januar 1989', -510, -110); typeText(c, '„…in 50 und auch in 100 Jahren…“', -510, 10, 54, clamp((t - 125.3) / 2)); typeText(c, '— so der Staatschef über die Mauer', -510, 100, 32, clamp((t - 127.6) / 1.5)); c.restore(); }
}
