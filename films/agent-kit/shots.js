// SHOT HELPERS shared by agent-teil1 / agent-teil2.
//   film(list)       list = [[start, name, f(lt, T, t)], ...], last entry [end] ; returns defineFilm shots
//   tamShot(o)       full-screen dossier: folder drops on a desk, opens, camera pushes in, page drawn by o.page(c, w, h, t), pulls out
//   camAt / S / V    camera helpers ; walkX(t, t0, x0, speed)
const S = (x, y, z) => ({ x, y, z });
const camAt = (a, b, k) => CAM.mix(a, b, ease(clamp(k, 0, 1)));
const drift = (v, t, a = 6) => Object.assign({}, v, { x: v.x + Math.sin(t * .5) * a, y: v.y + Math.cos(t * .43) * a * .6 });
function film(list) {
  const shots = [];
  for (let i = 0; i < list.length - 1; i++) { const [a, name, f] = list[i], b = list[i + 1][0]; shots.push({ name, dur: +(b - a).toFixed(4), f }); }
  return shots;
}
function tamShot(o) {
  const G0 = o.t0, land = G0 + .25, open = G0 + .55, inS = G0 + .7, inE = G0 + 1.35, outS = o.t1 - .55;
  CUE('whoosh', G0); CUE('drop', land); CUE('paper', open); CUE('whoosh', inS, { soft: 1 }); CUE('whooshOut', outS);
  for (const [at, kind, dur] of o.cues || []) CUE(kind, at, { dur });
  const PW = 1600, PH = 900;
  return function (lt, T, t) {
    const drop = clamp((t - G0) / (land - G0), 0, 1), op = ease(seg(t, open, open + .45));
    const wide = S(0, 0, .52), full = S(0, 0, 1.12);
    let v = t < inS ? wide : t < outS ? camAt(wide, full, (t - inS) / (inE - inS)) : camAt(full, S(60, 30, .58), (t - outS) / .55);
    v = Object.assign({}, v); v.x += Math.sin(t * .7) * 3;
    return { set: o.set || deskTop, cam: v, vignette: .2,
      fx: [c => { const sc = 1 + (1 - easeIn(drop)) * .5; c.save(); c.scale(sc, sc); c.rotate((1 - drop) * .06 - .01); dossierFolder(c, 0, 0, PW, PH, op, { lift: 1 + (1 - drop) * 2, page: (c, w, h) => o.page(c, w, h, t) }); c.restore(); }],
      screen: [c => lampPool(c, v, -200, -300, 2200, .3), c => noirGrade(c, t, { vig: .55, warm: .25, wx: .4, wy: .3, mult: 'rgba(190,190,215,.22)' })] };
  };
}
// common page pieces
function pageHead(c, w, t, t0, title) { c.font = hudFont(60); const fz = Math.min(60, 60 * (w - 420) / (c.measureText(title).width * 1.05)); dosType(c, title, 70, 108, fz, (t - t0) / Math.max(.4, title.length * .03)); dosStamp(c, 'VERTRAULICH', w - 230, 82, 30, .09, (t - t0 - .6) / .14); c.fillStyle = DOS.line; c.fillRect(60, 145, w - 120, 3); }
function checkMark(c, x, y, s, k, col = '#7fd08a') { if (k <= 0) return; c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = s * .16; c.beginPath(); const p = [[x - s * .4, y], [x - s * .1, y + s * .3], [x + s * .45, y - s * .4]]; const kk = clamp(k, 0, 1) * 2; c.moveTo(...p[0]); if (kk < 1) c.lineTo(lerp(p[0][0], p[1][0], kk), lerp(p[0][1], p[1][1], kk)); else { c.lineTo(...p[1]); c.lineTo(lerp(p[1][0], p[2][0], kk - 1), lerp(p[1][1], p[2][1], kk - 1)); } c.stroke(); c.restore(); }
function boxEmpty(c, x, y, s, a = 1) { c.save(); c.globalAlpha = a; c.strokeStyle = DOS.cream; c.lineWidth = s * .09; c.strokeRect(x, y - s * .8, s * .9, s * .9); c.restore(); }
// generic people helpers
const NK = .5;                         // Noah scale in rooms
const noahF = (o) => Object.assign({ k: NK, ink: 1.8 }, o);
function walkX(t, t0, x0, sp) { return x0 + (t - t0) * sp; }
// heartbeat list helper
function beatsBetween(a, b, bpm0 = 64, bpm1 = 100) { const out = []; let t = a, bpm = bpm0; while (t < b) { out.push(+t.toFixed(3)); bpm = Math.min(bpm1, bpm + 2); t += 60 / bpm; } return out; }
function pulseAt(list, t) { return list.reduce((a, b) => a + (t >= b ? Math.exp(-(t - b) * 9) : 0), 0); }
// blue/dark grades per place
const G = {
  night: (c, t) => noirGrade(c, t, { vig: .6 }),
  rain: (c, t) => noirGrade(c, t, { vig: .65 }),
  warm: (c, t) => roomLight(c, t, 'warm'),
  grey: (c, t) => roomLight(c, t, 'grey'),
  day: (c, t) => roomLight(c, t, 'day'),
  cold: (c, t) => roomLight(c, t, 'cold'),
  fog: (c, t) => noirGrade(c, t, { mult: 'rgba(170,175,195,.3)', soft: 'rgba(30,40,70,.25)', vig: .6 }),
  gold: (c, t) => noirGrade(c, t, { mult: 'rgba(240,215,180,.2)', soft: 'rgba(90,50,10,.12)', warm: .4, wx: .15, wy: .3, vig: .45, grain: .5 }),
};
