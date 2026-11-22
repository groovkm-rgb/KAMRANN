// assemble: sort by t0, duration = next t0 − t0; last shot ends at the end of the voice-over
const DURATION = 611.84;
// merged shots (keeps the average shot length ≥ 2,5 s): the previous shot runs on
const SKIP = [57.30, 83.90, 87.70, 102.30, 111.90, 136.90, 147.50, 151.60, 163.70, 167.20, 186.60, 222.00, 250.00, 251.40, 255.50, 287.80, 307.00, 325.40, 332.30, 338.20, 393.90, 432.40, 488.60, 494.80, 499.80, 510.50, 527.00, 550.80, 562.20, 581.80, 593.00];
// angle tags (what the camera actually does), where a section file's default tag was too generic
const ANG = { 0: 'medium', 5.75: 'pov', 91.4: 'overhead', 107.68: 'wide', 113: 'overhead', 120.5: 'pov', 169.3: 'closeup', 172.9: 'overhead', 183: 'pov', 218.2: 'macro', 220.1: 'closeup', 240.9: 'side', 297.9: 'low', 320: 'low', 333.5: 'closeup', 370.8: 'pov', 401: 'low', 403: 'medium', 409.8: 'overhead', 461.1: 'side', 474.7: 'low', 486.9: 'overhead', 507.7: 'closeup', 514.5: 'closeup', 537.5: 'side', 556.8: 'overhead', 558.7: 'low', 568.5: 'side', 591.8: 'low' };
(() => {
  for (let i = SHOTS.length - 1; i >= 0; i--) { if (SKIP.some(t => Math.abs(t - SHOTS[i].t0) < 1e-3)) SHOTS.splice(i, 1); else if (ANG[SHOTS[i].t0] !== undefined) SHOTS[i].ang = ANG[SHOTS[i].t0]; }
  SHOTS.sort((a, b) => a.t0 - b.t0);
  const list = SHOTS.map((s, i) => Object.assign({}, s, { dur: +((i < SHOTS.length - 1 ? SHOTS[i + 1].t0 : DURATION) - s.t0).toFixed(3) }));
  defineShots(list, { duration: DURATION, post: (c, t) => grain(c, t, .05) });
  window.__film.meta = () => list.map(s => ({ t0: s.t0, dur: s.dur, name: s.name, ang: s.ang || '', tr: s.tr ? s.tr.type : '', sfx: s.sfx || [], amb: s.amb || '' }));
})();
