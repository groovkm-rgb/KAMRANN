// shots2.js: 3 Woche 1 – Der Rausch (2:13–3:36) + 4 Woche 2–4 – Der Haken (3:36–5:04)
import { S, A, FX, fx, hold, burst, lerp, lerp3, ramp, smooth, easeOut, clamp, q, pulse, LEON, KEREM, OMA, GREY, HAHN, BOSS, SALES, DJ, DIETER, GUESTS, KIDS, cu, med, fh, walkStep, bobW, leon, HEAD } from './shots_h.js';
import { iceHead } from './engine.js';

const phoneW = (st) => ({ void: { phone: st } });
const L0 = [-4.6, 0, 8.9], BOSSP = [-6, 0, 6.6];
const pentDay = { pent: {} };
const SOFA = [-2, -0.16, -3.0];

// ======================= WOCHE 1 – DER RAUSCH =======================
// 133.14–138.55 "Woche eins – Der Rausch. Am nächsten Morgen geht Leon zur Arbeit."
S(133.14, 'depot', { light: 'depot', flash: { n: 5 }, cam: [{ at: 0, p: [2, 6.5, 14], l: [4, 1.2, 4], fov: 50 }, { u: 1, p: [6, 3.0, 12], l: [5, 1.2, 6], fov: 46, e: 'io' }],
  act: (c) => { const k = ramp(c.t, 133.5, 138.5), walk = k < 1; return [leon(c, { expr: 'happy', legs: walk ? 'walk' : 'stand', step: walkStep(c.t), bob: walk ? bobW(c.t) : 0 }, [lerp(13, 4, k), 0, 7.5])]; } });
// 138.55–141.58 "Ein letztes Mal. Er stellt seinen Paketscanner auf den Tisch vom Chef und sagt:"
S(138.55, 'depot', { light: 'depot', cam: [{ at: 0, p: [-3.6, 1.7, 11.6], l: [-5.4, 1.2, 7.4], fov: 42 }, { at: 1.4, p: [-3.8, 1.65, 11.2], l: [-5.4, 1.2, 7.4], fov: 42 }, { at: 1.65, p: [-5.7, 1.25, 8.75], l: [-6, 0.95, 7.75], fov: 34, e: 'out' }, { u: 1, p: [-5.72, 1.22, 8.65], l: [-6, 0.95, 7.75], fov: 34, e: 'lin' }],
  w: (c) => ({ depot: { scannerHidden: c.t < 140.35 } }), shake: [{ at: 1.85, a: 0.03 }], dof: (c) => (c.lt < 1.6 ? fh(L0, 7) : { p: [-6, 0.95, 7.75], c: 11 }),
  act: (c) => [A(c, BOSS, { expr: 'neutral', look: 0.5 }, BOSSP), leon(c, { expr: 'determined', turn: -0.4, R: c.t < 140.3 ? { x: 470, y: 520 } : 'hang', holdR: c.t < 140.3 ? 'scanner' : undefined }, L0)],
  fx: (c) => c.t > 140.4 && c.t < 141.0 ? [FX('pp' + q(c.t, 1), fx.pop(q((c.t - 140.4) / 0.6, 2)), [-6, 1.0, 7.8], 0.5)] : [] });
// 141.58–142.82 "Ich kündige."
S(141.58, 'depot', { light: 'depot', cam: burst([-3.9, 1.6, 10.9], [-4.3, 1.58, 10.5], [-4.6, 1.52, 8.9], 30, { dur: 0.25 }), dof: fh(L0, 13),
  act: (c) => [leon(c, { expr: 'determined', talk: c.t < 142.5, turn: -0.3 }, L0)] });
// 142.82–143.90 "Der Chef lacht."
S(142.82, 'depot', { light: 'depot', cam: cu(BOSSP, { d: 2.2, dx: -0.2, fov: 32 }), dof: fh(BOSSP, 13),
  act: (c) => [A(c, BOSS, { expr: 'laugh', L: 'belly', R: 'belly', bob: q(Math.abs(Math.sin(c.t * 12)) * 0.02, 3), tilt: q(3 * Math.sin(c.t * 12), 1) }, BOSSP)],
  fx: (c) => [FX('st' + q(c.t % 0.6, 1), fx.stars(q((c.t % 0.6) / 0.6, 2)), [-6, 2.6, 6.7], 0.8)] });
// 143.90–145.18 "Leon lacht nicht."
S(143.9, 'depot', { light: 'depot', lightMod: { vig: 0.45 }, cam: cu(L0, { d: 1.5, dx: 0.1, fov: 30, creep: 0.1 }), dof: fh(L0, 13),
  act: (c) => [leon(c, { expr: 'determined', turn: -0.2, blink: 0 }, L0)] });
// 145.18–147.88 "Er dreht sich um und geht. Wie im Film." backlit walk to the bright door, boss blurred in front
S(145.18, 'depot', { light: 'depot', lightMod: { sunI: 2.8, az: 0, el: 12 }, cam: [{ at: 0, p: [-8.8, 0.7, 11.4], l: [14, 1.8, 0.5], fov: 40 }, { u: 1, p: [-8.0, 0.65, 11.0], l: [14, 1.8, 0.5], fov: 38, e: 'lin' }],
  dof: (c) => ({ p: [lerp(-4.3, 5.0, ramp(c.t, 145.4, 147.9)), 1.5, lerp(8.9, 4.0, ramp(c.t, 145.4, 147.9))], c: 7 }),
  act: (c) => { const k = ramp(c.t, 145.4, 147.9); return [leon(c, { back: true, legs: 'walk', step: walkStep(c.t, 1.1), bob: bobW(c.t, 1.1) }, [lerp(-4.3, 5.0, k), 0, lerp(8.9, 4.0, k)], { tint: '#fff2e0' }), A(c, BOSS, { expr: 'shock', blink: 0 }, [-5.8, 0, 10.6])]; },
  fx: (c) => [FX('G:door', fx.glowDot(1, '255,236,200'), [14.5, 2.4, 0.5], 9)] });
// 147.88–149.40 "Und dann geht's los." whoosh: the purple suit appears with sparkles and money rain
S(147.88, 'city', { light: 'day', flash: { n: 5 }, cam: burst([-17, 1.2, -1], [-17.6, 1.5, -4.8], [-18, 1.5, -8.6], 34, { dur: 0.35, roll0: -8 }), dof: fh([-18, 0.15, -8.6], 9), shake: [0.02],
  w: () => ({ city: { car1: [-26, -14, 0.5], car2: [-20, -13.5, 0.3], spot: 1 } }),
  act: (c) => [leon(c, { expr: 'smug', L: 'hip', R: 'thumb', turn: 0.2 }, [-18, 0.15, -8.6])],
  fx: (c) => [FX('mny' + q((c.t - 147.88) / 1.5, 2), fx.money(q((c.t - 147.88) / 1.5, 2)), [-18, 2.2, -8.3], 3), FX('spk' + q((c.t - 147.88) / 0.6, 2), fx.sparkle(q(clamp((c.t - 147.88) / 0.6), 2)), [-18, 1.6, -8.4], 1.6)] });
// 149.40–151.95 "Er kauft sich einen Sportwagen. Knallgelb." hero reveal of the yellow car
S(149.4, 'city', { light: 'day', cam: [{ at: 0, p: [-20.5, 0.45, -9.6], l: [-25.6, 0.7, -14], fov: 36 }, { u: 1, p: [-21.4, 0.55, -10.4], l: [-25.8, 0.75, -14], fov: 36, e: 'lin' }], dof: { p: [-26, 0.7, -14], c: 6 },
  w: () => ({ city: { car1: [-26, -14, 0.5], car2: [-20, -13.5, 0.3], spot: 1 } }),
  fx: (c) => c.t > 150.85 ? [FX('ks' + q(c.t - 150.85, 1), fx.sparkle(q(clamp((c.t - 150.85) / 0.6), 2)), [-24.5, 1.2, -13.3], 1.6)] : [] });
// 151.95–155.19 "Der Verkäufer fragt: Wollen Sie eine Probefahrt?"
S(151.95, 'city', { light: 'day', cam: cu([-23.8, 0.15, -12.4], { d: 2.0, dx: 0.4, fov: 34 }), dof: fh([-23.8, 0.15, -12.4], 12), w: () => ({ city: { car1: [-26, -14, 0.5], car2: [-20, -13.5, 0.3], spot: 1 } }),
  act: (c) => [A(c, SALES, { expr: 'happy', talk: c.t > 153.4, L: 'point', look: 0.6 }, [-23.8, 0.15, -12.4]), leon(c, { expr: 'smug' }, [-21.9, 0.15, -11.8])] });
// 155.19–158.40 "Leon sagt: Nee. Ich nehm zwei." two fingers, then both cars
S(155.19, 'city', { light: 'day', cam: [{ at: 0, p: [-21.6, 1.75, -9.9], l: [-21.9, 1.62, -11.8], fov: 34 }, { at: 1.65, p: [-21.65, 1.72, -10.0], l: [-21.9, 1.62, -11.8], fov: 34 }, { at: 1.95, p: [-19.5, 1.2, -4.5], l: [-23, 0.9, -13], fov: 44, e: 'out' }, { u: 1, p: [-19.4, 1.25, -5.0], l: [-23, 0.9, -13], fov: 44, e: 'lin' }],
  w: () => ({ city: { car1: [-26, -14, 0.5], car2: [-20, -13.5, 0.3], spot: 1 } }), dof: (c) => (c.lt < 1.9 ? fh([-21.9, 0.15, -11.8], 12) : { p: [-23, 0.9, -13], c: 3 }),
  act: (c) => [leon(c, { expr: c.t < 156.8 ? 'smug' : 'sly', talk: c.t > 156.3 && c.t < 157.6, R: c.t > 156.8 ? 'up' : 'hip', turn: 0.2 }, [-21.9, 0.15, -11.8]), A(c, SALES, { expr: c.t > 157 ? 'shock' : 'happy' }, [-23.8, 0.15, -12.4])],
  fx: (c) => c.t > 157.15 ? [FX('2s' + q(c.t - 157.15, 1), fx.sparkle(q(clamp((c.t - 157.15) / 0.6), 2)), [-26, 1.0, -13.4], 2.2), FX('2t' + q(c.t - 157.15, 1), fx.sparkle(q(clamp((c.t - 157.25) / 0.6), 2)), [-20, 1.0, -13.0], 2.2)] : [] });
// 158.40–161.34 "Er zieht in ein Penthouse über der Stadt." drone up the tower
S(158.4, 'city', { light: 'day', xf: 0.25, cam: [{ at: 0, p: [2, 1.6, -6], l: [0, 22, -26], fov: 52 }, { u: 1, p: [22, 74, -2], l: [0, 60, -26], fov: 46, e: 'io' }], w: () => ({ city: { car1: null, car2: null } }) });
// 161.34–162.93 "Mit Pool auf dem Dach."
S(161.34, 'pent', { light: 'day', cam: [{ at: 0, p: [-3.2, 0.5, 6.2], l: [0.5, 0.6, 10.5], fov: 44 }, { u: 1, p: [-2.6, 0.55, 6.4], l: [0.5, 0.7, 10.5], fov: 44, e: 'lin' }], w: () => pentDay,
  act: (c) => [leon(c, { expr: 'laugh', L: 'up', R: 'up' }, [1.5, 0, 12.2])] });
// 162.93–166.53 "Mit einem Badezimmer, das größer ist als seine alte Wohnung."
S(162.93, 'pent', { light: 'room', lightMod: { fogFar: 120 }, cam: [{ at: 0, p: [-9.4, 3.4, 3.6], l: [-13.5, 0.8, -3.0], fov: 52 }, { u: 1, p: [-9.8, 3.0, 2.6], l: [-13.5, 0.8, -3.0], fov: 52, e: 'lin' }], w: () => pentDay,
  act: (c) => [leon(c, { expr: 'goofy', L: 'wave', R: 'wave' }, [-13.0, 0, -2.6])] });
// 166.53–169.44 "Und mit einer goldenen Toilette. Warum?"
S(166.53, 'pent', { light: 'room', cam: [{ at: 0, p: [-12.0, 1.1, -1.6], l: [-14, 0.65, -5.1], fov: 40 }, { u: 1, p: [-12.7, 0.95, -2.8], l: [-14, 0.6, -5.1], fov: 38, e: 'io' }], w: () => pentDay, dof: { p: [-14, 0.6, -5.1], c: 8 },
  act: (c) => c.t > 168.5 ? [leon(c, { expr: 'smug', L: 'thumb', turn: -0.3 }, [-13.0, 0, -4.7])] : [],
  fx: (c) => [FX('ts' + q((c.t - 166.6) % 1, 1), fx.sparkle(q((c.t - 166.6) % 1, 2)), [-14, 0.9, -4.9], 1.0)] });
// 169.44–170.71 "Weil er's kann."
S(169.44, 'pent', { light: 'room', cam: cu([-13.0, 0, -4.7], { d: 1.6, dx: -0.3, fov: 32 }), w: () => pentDay, dof: fh([-13.0, 0, -4.7], 12),
  act: (c) => [leon(c, { expr: 'sly', L: 'thumb', turn: -0.3 }, [-13.0, 0, -4.7])] });
// 170.71–174.10 "Er kauft Designerklamotten, die er nicht aussprechen kann."
S(170.71, 'pent', { light: 'day', cam: med([1.5, 0, -2.4], { d: 3.4, fov: 40 }), w: () => pentDay, dof: fh([1.5, 0, -2.4], 8),
  act: (c) => [leon(c, { expr: c.t < 172.3 ? 'goofy' : 'worried', talk: c.t > 172.3, L: { x: 170, y: 560 }, R: { x: 430, y: 560 } }, [1.5, 0, -2.4])],
  fx: (c) => { const out = []; [[-0.55, '#e03a8a'], [0.55, '#2a2a3a'], [-0.85, '#f2c540'], [0.85, '#3a6ac8']].forEach(([dx, col], i) => out.push(FX('bag' + i, (g) => { g.fillStyle = col; g.fillRect(170, 380, 260, 300); g.lineWidth = 14; g.strokeStyle = '#1a1416'; g.strokeRect(170, 380, 260, 300); g.beginPath(); g.arc(300, 380, 70, Math.PI, 0); g.stroke(); g.fillStyle = '#ffffff'; g.fillRect(230, 500, 140, 16); }, [1.5 + dx, 0.6 + (i > 1 ? 0.15 : 0), -2.3 + (i > 1 ? -0.05 : 0.05)], 0.75))); if (c.t > 172.3) out.push(FX('q' + q(c.t % 1, 1), fx.question(q(c.t % 1, 1)), [2.1, 2.3, -2.3], 0.45)); return out; } });
// 174.10–179.06 "Turnschuhe für 2.000 Euro, die er nicht anzieht, weil sie dreckig werden könnten."
S(174.1, 'pent', { light: 'day', cam: [{ at: 0, p: [5.1, 1.35, -4.0], l: [5, 1.05, -5.2], fov: 34 }, { at: 2.4, p: [5.05, 1.25, -4.25], l: [5, 1.02, -5.2], fov: 34, e: 'lin' }, { at: 2.7, p: [3.4, 1.6, -2.4], l: [4.6, 1.2, -4.9], fov: 40, e: 'out' }, { u: 1, p: [3.5, 1.58, -2.6], l: [4.6, 1.2, -4.9], fov: 40, e: 'lin' }],
  w: () => pentDay, dof: (c) => (c.lt < 2.6 ? { p: [5, 1.02, -5.2], c: 10 } : fh([4.1, 0, -4.4], 9)),
  act: (c) => c.lt > 2.5 ? [leon(c, { expr: 'worried', R: { x: 470 + 20 * Math.sin(c.t * 12), y: 560 }, holdR: 'cloth' }, [4.0, 0, -4.4])] : [],
  fx: (c) => [FX('ss' + q((c.t - 174.1) % 0.9, 1), fx.sparkle(q(((c.t - 174.1) % 0.9) / 0.9, 2)), [5, 1.15, -5.1], 0.5)] });
// 179.06–181.40 "Eine Uhr, die mehr kostet als ein Haus." watch macro
S(179.06, 'pent', { light: 'day', cam: hold([2.3, 1.75, -1.5], [1.8, 1.6, -2.4], 30, { creep: 0.08 }), w: () => pentDay, dof: { p: [1.95, 1.65, -2.35], c: 12 },
  act: (c) => [leon(c, { expr: 'smug', L: 'hang', R: { x: 400, y: 260 } }, [1.5, 0, -2.4])],
  fx: (c) => [FX('watch', (g) => { g.fillStyle = '#f2c540'; g.fillRect(250, 300, 100, 400); g.lineWidth = 12; g.strokeStyle = '#1a1416'; g.strokeRect(250, 300, 100, 400); g.beginPath(); g.arc(300, 500, 120, 0, 7); g.fillStyle = '#f2c540'; g.fill(); g.stroke(); g.beginPath(); g.arc(300, 500, 90, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.stroke(); for (let i = 0; i < 12; i++) { const a = i * 0.5236; g.fillStyle = '#5ad0ff'; g.beginPath(); g.arc(300 + 104 * Math.cos(a), 500 + 104 * Math.sin(a), 9, 0, 7); g.fill(); } g.lineWidth = 9; g.beginPath(); g.moveTo(300, 500); g.lineTo(300, 435); g.moveTo(300, 500); g.lineTo(345, 515); g.stroke(); }, [1.92, 1.6, -2.3], 0.22),
    FX('ws' + q((c.t - 179.06) % 0.8, 1), fx.sparkle(q(((c.t - 179.06) % 0.8) / 0.8, 2)), [1.97, 1.65, -2.28], 0.25)] });
// 181.40–183.91 "Am Freitag schmeißt er eine Party." night roof wide, fireworks
const party = (o = {}) => ({ pent: { party: 1, night: 1, ice: 0, ...o } });
const fw = (c, list) => list.map(([t0, x, y, z, col, m], i) => (c.t > t0 && c.t < t0 + 1.1 ? FX('G:fw' + i + q(c.t - t0, 1), fx.firework(q((c.t - t0) / 1.1, 2), col), [x, y, z], m) : null));
const FW = [[181.6, -12, 14, 40, '#ffd23a', 9], [182.2, 10, 17, 44, '#ff3a8a', 10], [182.9, 0, 20, 50, '#3ad0ff', 12], [183.6, -6, 16, 45, '#6ad04a', 9], [184.2, 8, 13, 38, '#ffd23a', 8], [185.9, -4, 15, 40, '#ff3a8a', 10], [186.3, 6, 18, 46, '#ffd23a', 11], [186.6, 0, 13, 38, '#3ad0ff', 9]];
S(181.4, 'pent', { light: 'party', flash: { n: 4 }, cam: [{ at: 0, p: [0, 4.2, -1.0], l: [0, 2.5, 14], fov: 56 }, { u: 1, p: [0, 3.6, 0.5], l: [0, 2.8, 14], fov: 56, e: 'lin' }], w: () => party(),
  act: (c) => [leon(c, { expr: 'laugh', L: 'up', R: 'up', bob: q(Math.abs(Math.sin(c.t * 8)) * 0.03, 3) }, [0.4, 0, 6.6])], fx: (c) => fw(c, FW) });
// 183.91–185.12 "Auf dem Dach." orbit, skyline
S(183.91, 'pent', { light: 'party', cam: [{ at: 0, p: [10, 6, 2], l: [0, 1, 9], fov: 50 }, { u: 1, p: [11, 5.5, 8], l: [0, 1, 9], fov: 50, e: 'lin' }], w: () => party(), fx: (c) => fw(c, FW),
  act: (c) => [leon(c, { expr: 'laugh', L: 'up', R: 'up', bob: q(Math.abs(Math.sin(c.t * 8)) * 0.03, 3) }, [0.4, 0, 6.6])] });
// 185.12–188.58 DJ / fireworks / ice block shaped like his head
S(185.12, 'pent', { light: 'party', cam: cu([5, 0, 12.9], { d: 2.4, dx: -0.4, fov: 34 }), w: () => party(), dof: fh([5, 0, 12.9], 11),
  act: (c) => [A(c, DJ, { expr: 'sly', L: { x: 200, y: 560 + 20 * Math.sin(c.t * 16) }, R: { x: 430, y: 300 }, bob: q(Math.abs(Math.sin(c.t * 8)) * 0.02, 3) }, [5, 0, 12.9])],
  fx: (c) => [FX('nt' + q(c.t % 0.8, 1), fx.note(q((c.t % 0.8) / 0.8, 2)), [4.4, 2.3, 12.6], 0.5), FX('nt2' + q((c.t + 0.4) % 0.8, 1), fx.note(q(((c.t + 0.4) % 0.8) / 0.8, 2), '#3ad0ff'), [5.6, 2.5, 12.6], 0.5)] });
S(185.85, 'pent', { light: 'party', cam: hold([0, 0.6, 4], [0, 9, 30], 60, { creep: 0.02 }), w: () => party(), fx: (c) => fw(c, FW) });
S(186.9, 'pent', { light: 'party', cam: [{ at: 0, p: [-3.5, 2.2, 9.8], l: [-4.5, 1.6, 12.3], fov: 34 }, { u: 1, p: [-3.8, 1.9, 10.6], l: [-4.5, 1.6, 12.3], fov: 32, e: 'lin' }], w: () => party(), dof: { p: [-4.5, 1.6, 12.3], c: 10 },
  fx: (c) => [FX('ice', iceHead(0), [-4.5, 1.76, 12.3], 1.1, { order: 3 }), FX('is' + q((c.t - 186.9) % 1, 1), fx.sparkle(q((c.t - 186.9) % 1, 2), '#cfeeff'), [-4.5, 1.8, 12.1], 1.0)] });
// 188.58–193.34 "Hunderte Leute kommen. Leon kennt keinen davon. Aber alle kennen plötzlich ihn."
S(188.58, 'pent', { light: 'party', cam: [{ at: 0, p: [0.8, 3.0, 1.5], l: [0.4, 1.0, 9], fov: 52 }, { at: 1.3, p: [0.6, 2.4, 2.5], l: [0.4, 1.2, 8], fov: 48, e: 'lin' }, { at: 1.55, p: [0.75, 1.7, 4.8], l: [0.4, 1.5, 6.6], fov: 34, e: 'out' }, { at: 2.45, p: [0.72, 1.7, 4.9], l: [0.4, 1.5, 6.6], fov: 34 }, { at: 2.75, p: [-1.5, 2.6, 2.2], l: [0.4, 1.3, 7.2], fov: 48, e: 'out' }, { u: 1, p: [-1.2, 2.4, 2.8], l: [0.4, 1.3, 7.2], fov: 46, e: 'lin' }], w: () => party(),
  act: (c) => { const out = [leon(c, { expr: c.t < 189.8 ? 'laugh' : c.t < 191.1 ? 'worried' : 'goofy', L: c.t < 189.8 ? 'up' : 'hang', R: c.t < 189.8 ? 'up' : 'hang', look: Math.sin(c.t * 2) * 0.8, bob: c.t < 189.8 ? q(Math.abs(Math.sin(c.t * 8)) * 0.03, 3) : 0 }, [0.4, 0, 6.6])];
    if (c.t > 191.1) GUESTS.forEach((g, i) => out.push(A(c, g, { expr: i % 2 ? 'laugh' : 'goofy', R: 'point', L: i % 3 ? 'wave' : 'up', look: (i % 2 ? -1 : 1) * 0.6 }, [-2.4 + i * 0.95 + (i > 2 ? 0.9 : 0), 0, 5.2 + (i % 2) * 0.4], { s: 0.95 }))); return out; } });
// 193.34–196.38 "Leon, Bruder!" "Leon, du Legende!"
S(193.34, 'pent', { light: 'party', cam: burst([-1.2, 1.6, 7.6], [-1.45, 1.58, 7.2], [-1.6, 1.5, 5.2], 30, { dur: 0.25 }), w: () => party(), dof: fh([-1.6, 0, 5.2], 12),
  act: (c) => [A(c, GUESTS[0], { expr: 'laugh', talk: true, L: 'up', R: 'point' }, [-1.6, 0, 5.2])] });
S(194.85, 'pent', { light: 'party', cam: burst([2.0, 1.6, 7.7], [1.8, 1.58, 7.3], [1.6, 1.5, 5.4], 30, { dur: 0.25 }), w: () => party(), dof: fh([1.6, 0, 5.4], 12),
  act: (c) => [A(c, GUESTS[1], { expr: 'goofy', talk: true, L: 'thumb', R: 'up' }, [1.6, 0, 5.4])] });
// 196.38–198.50 "Leon, können wir ein Selfie machen?" selfie flash
S(196.38, 'pent', { light: 'party', cam: hold([0.9, 1.65, 9.2], [0.9, 1.5, 6.9], 38, { creep: 0.06 }), w: () => party(), dof: fh([0.9, 0, 6.9], 10),
  act: (c) => [A(c, GUESTS[3], { expr: 'goofy', talk: c.t < 197.5, R: { x: 500, y: 170 }, holdR: 'phone', screenCol: '#ffffff' }, [1.5, 0, 6.9]), leon(c, { expr: c.t > 197.8 ? 'sly' : 'smug', L: c.t > 197.6 ? 'up' : 'hang', turn: 0.2 }, [0.35, 0, 6.7])],
  black: () => 0, flashEnd: { n: 3, a: 0.8 } });
// 198.50–204.69 "Im Internet nennen sie ihn ... Er hat in einer Woche mehr Follower als die meisten in zehn Jahren."
S(198.5, 'void', { light: 'phone', flash: { n: 4, a: 0.8 }, cam: [{ at: 0, p: [0, 1.5, 0.5], l: [0, 1.5, 0], fov: 40 }, { u: 1, p: [0, 1.53, 0.36], l: [0, 1.53, 0], fov: 40, e: 'lin' }],
  w: (c) => phoneW({ mode: 'social', followers: Math.floor(1240 * Math.pow(1.0 + ramp(c.t, 198.6, 204.4) * 2000, 1)), hearts: q(c.t * 0.7, 2) }), dof: { p: [0, 1.5, 0], c: 5 },
  fx: (c) => [0, 1, 2, 3].map((i) => { const k = ((c.t * 0.8 + i * 0.25) % 1); return FX('h' + i + q(k, 1), fx.heart(q(k, 1)), [-0.12 + i * 0.08, 1.4 + k * 0.2, 0.05], 0.06); }) });
// 204.69–207.76 "Nur einer ist nicht auf der Party. Kerem." the Imbiss at night, Kerem alone
const imbNight = { hemi: 0.75, gain: '#d8dcff', vig: 0.48, sky: '#4a5a9a', sunI: 0.9 };
S(204.69, 'imbiss', { light: 'warm', lightMod: imbNight, xf: 0.3, cam: [{ at: 0, p: [3.2, 2.0, 2.8], l: [-0.3, 1.3, -1.4], fov: 44 }, { u: 1, p: [2.4, 1.85, 2.0], l: [-0.3, 1.4, -1.4], fov: 42, e: 'lin' }], tint: '#e8e4f8',
  act: (c) => [A(c, KEREM, { expr: 'neutral', look: -0.5, L: { x: 230 + 30 * Math.sin(c.t * 5), y: 640 }, R: 'hang', holdR: undefined }, [-0.3, 0.32, -1.4])] });
// 207.76–210.57 "Er hat geschrieben: Sorry, muss im Imbiss helfen."
S(207.76, 'imbiss', { light: 'warm', lightMod: imbNight, cam: cu([-0.3, 0.32, -1.4], { d: 1.7, dx: 0.3, fov: 34 }), dof: fh([-0.3, 0.32, -1.4], 12), tint: '#e8e4f8',
  act: (c) => [A(c, KEREM, { expr: 'worried', look: 0.4, headTilt: -6, R: { x: 345, y: 500 }, holdR: 'phone', screenCol: '#7ad0ff' }, [-0.3, 0.32, -1.4])] });
// 210.57–212.93 "Leon zuckt mit den Schultern."
S(210.57, 'pent', { light: 'party', cam: cu([0.4, 0, 6.6], { d: 2.2, dx: 0.3, fov: 34 }), w: () => party(), dof: fh([0.4, 0, 6.6], 11),
  act: (c) => { const sh = c.t > 211.2 && c.t < 212.4; return [leon(c, { expr: sh ? 'smug' : 'neutral', L: sh ? { x: 130, y: 320 } : { x: 300, y: 500 }, R: sh ? { x: 470, y: 320 } : { x: 345, y: 500 }, holdR: sh ? undefined : 'phone', bob: sh ? 0.02 : 0 }, [0.4, 0, 6.6])]; } });
// 212.93–214.39 "Und springt in den Pool."  214.39–216.59 "In Klamotten. Für 5.000 Euro." splash
S(212.93, 'pent', { light: 'party', cam: [{ at: 0, p: [-4.5, 1.2, 5.6], l: [0.4, 1.8, 8.4], fov: 46 }, { u: 1, p: [-4.3, 1.0, 5.9], l: [0.5, 0.8, 8.8], fov: 44, e: 'lin' }], w: () => party(), mb: (c) => (c.t > 213.3 && c.t < 214.3 ? 3 : 1),
  act: (c) => { const k = ramp(c.t, 213.25, 214.25); if (k >= 1) return []; const y = k <= 0 ? 0 : 3.2 * k - 3.0 * k * k * 1.7 + 0; return [leon(c, { expr: k > 0 ? 'laugh' : 'sly', L: 'up', R: 'up', legs: k > 0 ? 'crouch' : 'stand' }, [0.5, Math.max(-1.6, y), lerp(6.6, 8.9, k)], { roll: -k * 0.4 })]; },
  fx: (c) => c.t > 214.15 ? [FX('spl' + q(c.t - 214.15, 1), fx.splash(q(clamp((c.t - 214.15) / 0.8), 2)), [0.5, 0.75, 8.9], 2.0)] : [] });
S(214.39, 'pent', { light: 'party', cam: [{ at: 0, p: [1.6, 0.45, 6.6], l: [0.5, 0.5, 8.9], fov: 36 }, { u: 1, p: [1.5, 0.42, 7.0], l: [0.5, 0.45, 8.9], fov: 36, e: 'lin' }], w: () => party(), dof: { p: [0.5, 0.4, 8.9], c: 9 },
  act: (c) => { const k = easeOut(ramp(c.t, 214.6, 215.6)); return [leon(c, { expr: 'laugh', L: 'up', R: 'wave', blink: 0 }, [0.5, lerp(-1.6, -0.75, k), 8.9], { blob: false })]; },
  fx: (c) => [FX('spl2' + q(clamp((c.t - 214.39) / 1.2), 2), fx.splash(q(clamp(0.35 + (c.t - 214.39) / 1.6), 2)), [0.5, 0.7, 9.0], 1.6), c.t > 215.4 ? FX('mn' + q((c.t - 215.4) / 1.2, 2), fx.money(q((c.t - 215.4) / 1.2, 2), 3), [0.5, 1.4, 8.6], 1.8) : null] });

// ======================= WOCHE 2–4 – DER HAKEN =======================
// 216.59–220.24 "Woche zwei bis vier – Der Haken. Aber mit dem Geld kommen auch die Probleme." grey morning after
S(216.59, 'pent', { light: 'grey', flash: { n: 5, col: '#c8ccd8' }, cam: [{ at: 0, p: [3, 2.6, 2.5], l: [-2, 0.6, -3], fov: 48 }, { u: 1, p: [2.2, 2.2, 1.6], l: [-2, 0.7, -3], fov: 46, e: 'lin' }], w: () => ({ pent: {} }),
  act: (c) => [leon(c, { expr: c.t < 218.3 ? 'sleep' : 'worried', legs: 'sit', L: c.t < 218.3 ? 'chin' : 'hang', blink: c.t < 218.3 ? 1 : undefined }, SOFA)],
  fx: (c) => [FX('cf' + 0, fx.confetti(0.3, 2), [-0.5, 0.4, -1.0], 2.5), c.t > 219.2 ? FX('ex' + q(c.t - 219.2, 1), fx.bang(q(clamp((c.t - 219.2) / 0.5), 2)), [-1.4, 2.2, -2.9], 0.5) : null] });
// 220.24–222.34 "Zuerst die Briefe. Von der Bank." letters fly in through the door
S(220.24, 'pent', { light: 'grey', cam: hold([4.6, 1.4, -0.4], [8, 1.1, -1.3], 44, { creep: 0.06 }), w: () => ({ pent: {} }),
  fx: (c) => [0, 1, 2, 3, 4, 5].map((i) => { const t0 = 220.35 + i * 0.25, k = ramp(c.t, t0, t0 + 0.8); if (k <= 0) return null; return FX('ev' + i + q(k, 2), (g) => { g.save(); g.translate(300, 500); g.rotate(k * 6 + i); g.fillStyle = '#f4ead2'; g.fillRect(-200, -130, 400, 260); g.lineWidth = 12; g.strokeStyle = '#1a1416'; g.strokeRect(-200, -130, 400, 260); g.beginPath(); g.moveTo(-200, -130); g.lineTo(0, 10); g.lineTo(200, -130); g.stroke(); g.fillStyle = '#d0202a'; g.fillRect(-120, 40, 160, 50); g.restore(); }, [lerp(7.9, 5.2 - i * 0.2, k), 1.1 - k * k * 1.0 + Math.sin(i) * 0.1, -1.3 + Math.sin(i * 2) * 0.4], 0.35); }) });
// 222.34–225.03 "Dicke Umschläge mit rotem Stempel: DRINGEND." stamp slam
S(222.34, 'pent', { light: 'grey', cam: [{ at: 0, p: [-13.45, 0.85, -3.75], l: [-13.6, 0.0, -4.2], fov: 38 }, { u: 1, p: [-13.5, 0.62, -3.95], l: [-13.6, 0.0, -4.2], fov: 38, e: 'lin' }], w: () => ({ pent: { heroEnv: 1 } }), dof: { p: [-13.6, 0.05, -4.2], c: 6 }, shake: [{ at: 1.74, a: 0.03 }],
  fx: (c) => c.t > 224.08 && c.t < 224.7 ? [FX('stp' + q(c.t, 1), fx.pop(q((c.t - 224.08) / 0.6, 2)), [-13.55, 0.1, -4.15], 0.4)] : [] });
// 225.03–229.23 "Leon macht keinen davon auf. Er stapelt sie neben der goldenen Toilette." tower grows
S(225.03, 'pent', { light: 'grey', cam: [{ at: 0, p: [-12.2, 1.4, -1.6], l: [-14.4, 1.0, -5.0], fov: 42 }, { u: 1, p: [-11.6, 1.8, -0.6], l: [-14.4, 1.3, -5.0], fov: 44, e: 'lin' }], w: (c) => ({ pent: { env: lerp(0.15, 0.95, easeOut(ramp(c.t, 225.1, 229.0))) } }), dof: { p: [-14.4, 1.0, -5.0], c: 6 },
  act: (c) => [leon(c, { expr: 'smug', R: { x: 140 + 40 * Math.sin(c.t * 6), y: 360 }, holdR: (Math.floor(c.t * 3) % 2) ? 'envelope' : undefined, turn: -0.4 }, [-13.3, 0, -4.4], { flip: true })] });
// 229.23–234.68 "Dann die Verwandten. Plötzlich hat Leon Cousins, von denen er noch nie gehört hat." cousins at the door
const DOORCAM = hold([4.2, 1.55, -1.3], [9.0, 1.35, -1.3], 46, { creep: 0.06 });
S(229.23, 'pent', { light: 'grey', cam: DOORCAM, w: (c) => ({ pent: { door: easeOut(ramp(c.t, 229.4, 229.9)) } }), dof: fh([9, 0, -1.3], 7),
  act: (c) => { const out = [leon(c, { back: true }, [5.0, 0, -0.4], { s: 1 })]; const list = [GUESTS[0], GUESTS[2], GUESTS[5], KIDS[0], GUESTS[4], KIDS[1]]; list.forEach((g, i) => { const k = ramp(c.t, 229.6 + i * 0.35, 230.0 + i * 0.35); if (k > 0) out.push(A(c, g, { expr: i % 2 ? 'goofy' : 'laugh', L: 'wave', R: i % 2 ? 'up' : 'hang' }, [9.2 + (i % 3) * 0.4, 0, -1.9 + i * 0.25], { s: g.headScale > 1 ? 0.65 : 0.95, alpha: 1 })); }); return out; } });
// 234.68–238.40 "Ein Onkel Dieter aus Bielefeld steht vor der Tür, mit Koffer:"
S(234.68, 'pent', { light: 'grey', cam: [{ at: 0, p: [6.0, 1.3, -0.6], l: [8.9, 1.25, -1.3], fov: 40 }, { u: 1, p: [6.4, 1.32, -0.75], l: [8.9, 1.3, -1.3], fov: 40, e: 'lin' }], w: () => ({ pent: { door: 1 } }), dof: fh([8.9, 0, -1.3], 9),
  act: (c) => [A(c, DIETER, { expr: 'goofy', L: 'wave', R: 'hang', holdR: 'suitcase' }, [8.9, 0, -1.3])] });
// 238.40–242.13 "Leon, mein Junge! Ich hab dich als Baby auf dem Arm gehabt!" bear hug
S(238.4, 'pent', { light: 'grey', cam: med([7.0, 0, -1.2], { d: 2.8, dx: -0.6, h: 1.55, ly: 1.4, fov: 38 }), w: () => ({ pent: { door: 1 } }), dof: fh([7.0, 0, -1.2], 9),
  act: (c) => { const hug = c.t > 239.7; return [leon(c, { expr: hug ? 'scared' : 'worried', L: 'hang', R: 'hang', bob: hug ? q(Math.abs(Math.sin(c.t * 10)) * 0.02, 3) : 0 }, [6.6, 0, -1.25]), A(c, DIETER, { expr: hug ? 'laugh' : 'goofy', talk: true, L: hug ? { x: 40, y: 480 } : 'wave', R: hug ? { x: 130, y: 560 } : 'up' }, [hug ? 7.15 : 7.6, 0, -1.0])]; },
  fx: (c) => c.t > 239.7 ? [FX('ht' + q(c.t % 0.6, 1), fx.heart(q((c.t % 0.6) / 0.6, 2)), [7.4, 2.5, -1.0], 0.35)] : [] });
// 242.13–244.26 "Leon hat ihn noch nie im Leben gesehen."
S(242.13, 'pent', { light: 'grey', cam: cu([6.6, 0, -1.25], { d: 1.5, dx: 0.3, fov: 32 }), w: () => ({ pent: { door: 1 } }), dof: fh([6.6, 0, -1.25], 12),
  act: (c) => [leon(c, { expr: 'worried', look: 1, turn: 0.4, noShades: 1 }, [6.6, 0, -1.25])], fx: (c) => [FX('q2' + q(c.t % 1, 1), fx.question(q(c.t % 1, 1)), [6.2, 2.3, -1.2], 0.35)] });
// 244.26–246.94 "Dann die neuen Freunde. Jeder will was."
S(244.26, 'pent', { light: 'grey', cam: [{ at: 0, p: [-2, 1.9, 1.8], l: [-2, 1.0, -3], fov: 46 }, { u: 1, p: [-2, 1.7, 1.0], l: [-2, 1.0, -3], fov: 44, e: 'lin' }], w: () => ({ pent: {} }),
  act: (c) => [leon(c, { expr: 'worried', legs: 'sit' }, SOFA), A(c, GUESTS[5], { expr: 'sly', R: 'point', talk: true }, [-3.6, 0, -2.4]), A(c, GUESTS[3], { expr: 'goofy', L: 'reach' }, [-0.4, 0, -2.4]), A(c, GUESTS[4], { expr: 'sly', L: 'hip' }, [-2.9, 0, -1.6], { s: 1.02 }), A(c, GUESTS[1], { expr: 'goofy', R: 'reach' }, [-1.0, 0, -1.5])] });
// 246.94–250.38 "Leon, ich hab 'ne Geschäftsidee, ich brauch nur 50.000."
S(246.94, 'pent', { light: 'grey', cam: cu([-3.6, 0, -2.4], { d: 1.9, dx: 0.4, fov: 34 }), w: () => ({ pent: {} }), dof: fh([-3.6, 0, -2.4], 12),
  act: (c) => [A(c, GUESTS[5], { expr: 'sly', talk: true, R: { x: 470, y: 500 }, holdR: 'plan', L: c.t > 248.9 ? 'up' : 'hip' }, [-3.6, 0, -2.4])] });
// 250.38–253.83 "Leon, leihst du mir deinen Sportwagen?"
S(250.38, 'pent', { light: 'grey', cam: med([-0.7, 0, -2.7], { d: 2.8, dx: 0.2, h: 1.35, ly: 1.2, fov: 38 }), w: () => ({ pent: {} }), dof: fh([-0.4, 0, -2.4], 9),
  act: (c) => [leon(c, { expr: 'neutral', legs: 'sit', R: c.t > 252.4 ? { x: 520, y: 500 } : 'hang', holdR: c.t > 252.4 && c.t < 253.2 ? 'keys' : undefined }, [-1.5, -0.16, -3.0]), A(c, GUESTS[3], { expr: c.t > 253.2 ? 'goofy' : 'sly', talk: c.t < 252.4, L: c.t > 253.2 ? { x: 80, y: 500 } : 'reach', holdL: c.t > 253.2 ? 'keys' : undefined }, [-0.2, 0, -2.4])] });
// 253.83–255.60 "Der Sportwagen kommt nie zurück."
S(253.83, 'city', { light: 'grey', cam: (c) => { const x = lerp(-10, 30, ramp(c.t, 253.9, 255.6) ** 1.6); return { p: [-10, 1.3, 13.5], l: [-10 + (x + 10) * 0.6, 0.9, -3], fov: 42, roll: 0 }; }, w: (c) => ({ city: { car1: null, car2: [lerp(-10, 30, ramp(c.t, 253.9, 255.6) ** 1.6), -3.2, 0], truck: 0 } }), mb: () => 2,
  act: (c) => [leon(c, { back: true, R: 'wave' }, [-9.2, 0.15, 9.8])], dof: { p: [10, 1, -3], c: 3 } });
// 255.60–259.94 "Und dann sind da diese zwei Männer. Graue Anzüge. Sonnenbrillen."
S(255.6, 'city', { light: 'grey', cam: [{ at: 0, p: [4.7, 1.0, 15.5], l: [2.5, 14, -26], fov: 46 }, { at: 3.0, p: [4.7, 1.1, 14.5], l: [2.6, 16, -26], fov: 46, e: 'lin' }, { at: 3.15, p: [4.65, 1.62, 7.6], l: [4.6, 1.55, 9.75], fov: 34, e: 'out' }, { u: 1, p: [4.65, 1.62, 7.75], l: [4.6, 1.55, 9.75], fov: 34, e: 'lin' }],
  dof: (c) => (c.lt < 3.1 ? fh([4.6, 0.15, 9.7], 4) : fh([4.6, 0.15, 9.75], 11)),
  act: (c) => c.lt < 3.1 ? [A(c, GREY, { back: true, headTilt: -10 }, [4.0, 0.15, 9.7]), A(c, GREY, { back: true, headTilt: -10, seed: 2 }, [5.2, 0.15, 9.8])] : [A(c, GREY, { expr: 'neutral', R: { x: 370, y: 470 } }, [4.0, 0.15, 9.7]), A(c, GREY, { expr: 'neutral', R: { x: 370, y: 470 }, seed: 2 }, [5.2, 0.15, 9.8])],
  fx: (c) => c.t > 258.7 && c.t < 259.4 ? [FX('gl1' + q(c.t, 1), fx.sparkle(q((c.t - 258.7) / 0.7, 2), '#ffffff'), [3.85, 1.65, 9.6], 0.25), FX('gl2' + q(c.t, 1), fx.sparkle(q((c.t - 258.8) / 0.7, 2), '#ffffff'), [5.05, 1.65, 9.7], 0.25)] : [] });
// 259.94–262.40 "Sie stehen jeden Tag gegenüber vom Penthouse und gucken hoch." POV from the penthouse
S(259.94, 'city', { light: 'grey', cam: hold([0.5, 58, -16.5], [4.6, 0.8, 9.7], 9, { creep: 0.02 }),
  act: (c) => [A(c, GREY, { expr: 'neutral', headTilt: 0 }, [4.0, 0.15, 9.7]), A(c, GREY, { expr: 'neutral', seed: 2 }, [5.2, 0.15, 9.8])], dof: { p: [4.6, 0.5, 9.7], c: 3 } });
// 262.40–263.90 "Wenn Leon zurückguckt," Leon at the glass, peeking
S(262.4, 'pent', { light: 'grey', cam: cu([2.5, 0, 3.0], { d: 1.8, dx: 0.3, fov: 34 }), w: () => ({ pent: {} }), dof: fh([2.5, 0, 3.0], 11),
  act: (c) => [leon(c, { expr: 'determined', look: 0.4, noShades: 1, L: 'chin' }, [2.5, 0, 3.0])] });
// 263.90–267.72 "tun sie so, als würden sie Zeitung lesen." newspapers snap up
S(263.9, 'city', { light: 'grey', cam: hold([4.65, 1.62, 7.45], [4.6, 1.55, 9.75], 36, { creep: 0.04 }), dof: fh([4.6, 0.15, 9.75], 11), shake: [{ at: 0.12, a: 0.015 }],
  act: (c) => { const up = c.t > 264.0; return [A(c, GREY, { expr: up ? 'neutral' : 'shock', R: up ? { x: 330, y: 330 } : { x: 370, y: 470 } }, [4.0, 0.15, 9.7]), A(c, GREY, { expr: up ? 'neutral' : 'shock', R: up ? { x: 330, y: 330 } : { x: 370, y: 470 }, seed: 2 }, [5.2, 0.15, 9.8])]; },
  fx: (c) => c.t > 264.6 ? [FX('wh', (g) => { g.font = '900 90px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.fillStyle = '#1a1416'; g.fillText('♪', 300 + 20 * Math.sin(c.t * 6), 500); }, [4.6, 2.35, 9.7], 0.3)] : [] });
// 267.72–271.72 "Eines Abends kommt Kerem endlich vorbei. Er guckt sich um."
const dusk = { az: 250, el: 10, sun: '#ff9a6a', sky: '#ffb090', skyTop: '#3a3a7a', skyHor: '#ff9a7a', gain: '#ffe8dc', tint: '#ffeee4', sat: 1.05 };
S(267.72, 'pent', { light: 'golden', lightMod: dusk, xf: 0.3, cam: hold([3.6, 1.6, 0.6], [7.4, 1.4, -1.3], 42, { creep: 0.06 }), w: (c) => ({ pent: { door: 1 - easeOut(ramp(c.t, 269.5, 270.2)) * 0.6 } }), dof: fh([7.2, 0, -1.3], 9),
  act: (c) => { const k = easeOut(ramp(c.t, 267.8, 269.4)); return [A(c, KEREM, { expr: c.t < 270.4 ? 'neutral' : 'worried', look: c.t > 270.4 ? Math.sin(c.t * 2.5) : 0, legs: k < 1 ? 'walk' : 'stand', step: walkStep(c.t) }, [lerp(9.4, 7.2, k), 0, -1.3])]; } });
// 271.72–276.66 "Den Pool. Die goldene Toilette. Den Eisblock mit Leons Kopf, der langsam schmilzt."
S(271.72, 'pent', { light: 'golden', lightMod: dusk, cam: hold([-2.5, 1.4, 6.2], [0.5, 0.2, 9.5], 40, { creep: 0.08 }), w: () => ({ pent: {} }) });
S(272.69, 'pent', { light: 'room', lightMod: { gain: '#ffe8dc', vig: 0.42 }, cam: hold([-12.4, 1.3, -2.2], [-14.2, 0.8, -5.0], 40, { creep: 0.1 }), w: () => ({ pent: { env: 0.95 } }), dof: { p: [-14.2, 0.8, -5.0], c: 7 } });
S(274.13, 'pent', { light: 'golden', lightMod: dusk, cam: [{ at: 0, p: [-3.6, 2.0, 10.4], l: [-4.5, 1.6, 12.3], fov: 34 }, { u: 1, p: [-3.9, 1.8, 11.0], l: [-4.5, 1.5, 12.3], fov: 32, e: 'lin' }], w: () => ({ pent: { ice: 1 } }), dof: { p: [-4.5, 1.6, 12.3], c: 10 },
  fx: (c) => [FX('icem' + q(ramp(c.t, 274.1, 276.6) * 0.6 + 0.35, 2), iceHead(q(ramp(c.t, 274.1, 276.6) * 0.6 + 0.35, 2)), [-4.5, 1.76, 12.3], 1.1, { order: 3 }), FX('dr' + q(c.t % 1, 1), fx.drops(q(c.t % 1, 1)), [-4.5, 1.2, 12.2], 0.6)] });
// 276.66–281.30 "Bruder", sagt er leise. "Wann warst du das letzte Mal bei deiner Oma?"
S(276.66, 'pent', { light: 'golden', lightMod: dusk, cam: cu([5.2, 0, -1.6], { d: 1.8, dx: -0.3, fov: 32, creep: 0.08 }), w: () => ({ pent: {} }), dof: fh([5.2, 0, -1.6], 12),
  act: (c) => [A(c, KEREM, { expr: c.t < 279.4 ? 'worried' : 'neutral', talk: (c.t > 276.7 && c.t < 277.6) || c.t > 279.4, look: -0.4, headTilt: -5 }, [5.2, 0, -1.6])] });
// 281.30–284.67 "Leon will was sagen. Aber ihm fällt nix ein."
S(281.3, 'pent', { light: 'golden', lightMod: dusk, cam: cu([3.6, 0, -1.4], { d: 1.7, dx: 0.3, fov: 32, creep: 0.05 }), w: () => ({ pent: {} }), dof: fh([3.6, 0, -1.4], 12),
  act: (c) => [leon(c, { expr: 'worried', noShades: 1, mouth: c.t > 282.1 && c.t < 283.4 ? 'o' : 'flat', look: 0.4, L: c.t > 282.3 && c.t < 283.5 ? 'reach' : 'hang' }, [3.6, 0, -1.4])],
  fx: (c) => c.t > 283.5 ? [FX('...', (g) => { g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(300, 500, 220, 130, 0, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#1a1416'; g.stroke(); for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(220 + i * 80, 500, 20, 0, 7); g.fillStyle = '#1a1416'; g.fill(); } }, [3.15, 2.25, -1.3], 0.4)] : [] });
// 284.67–288.39 "Letzten Sonntag war Omas Geburtstag. Er hat ihn vergessen." Oma waiting alone with a candle
S(284.67, 'oma', { light: 'warm', lightMod: { hemi: 0.7, sunI: 0.8, gain: '#d8dcff', sat: 0.85, vig: 0.5 }, xf: 0.35, cam: [{ at: 0, p: [0.6, 1.3, 2.2], l: [-0.6, 1.0, 0.1], fov: 40 }, { u: 1, p: [0.3, 1.2, 1.6], l: [-0.6, 1.0, 0.1], fov: 38, e: 'lin' }], tint: '#e0e0f0',
  w: () => ({ oma: { smallCake: 1 } }), dof: fh([-1.0, -0.14, 0.2], 9),
  act: (c) => [A(c, OMA, { expr: 'worried', legs: 'sit', look: 0.7, L: 'belly', R: 'belly' }, [-1.0, -0.14, 0.2])] });
// 288.39–290.40 "Er war auf 'ner Yacht-Party."
S(288.39, 'void', { light: 'phone', cam: hold([0, 1.5, 0.48], [0, 1.5, 0], 40, { creep: 0.08 }), w: () => phoneW({ mode: 'photo' }), dof: { p: [0, 1.5, 0], c: 5 } });
// 290.40–293.20 "Du bist nicht mehr du", sagt Kerem. Und geht.
S(290.4, 'pent', { light: 'golden', lightMod: { ...dusk, el: 4, sunI: 1.6 }, cam: hold([2.0, 1.55, 1.2], [6.5, 1.4, -1.3], 42, { creep: 0.04 }), w: (c) => ({ pent: { door: c.t > 292.9 ? 0 : 1 } }), dof: fh([5.6, 0, -1.4], 8),
  act: (c) => { const k = ramp(c.t, 292.0, 292.85); const out = [leon(c, { back: true }, [2.9, 0, -0.5])]; if (k < 1) out.push(A(c, KEREM, k > 0 ? { back: true, legs: 'walk', step: walkStep(c.t) } : { expr: 'neutral', talk: c.t < 291.8 }, [lerp(5.6, 8.6, k), 0, -1.35])); return out; } });
// 293.20–297.79 "In dieser Nacht sitzt Leon allein in seinem riesigen Penthouse. Tausend Follower schreiben ihm."
S(293.2, 'pent', { light: 'sad', xf: 0.4, cam: [{ at: 0, p: [4.5, 2.6, 2.8], l: [-2, 0.7, -3], fov: 50 }, { u: 1, p: [3.6, 2.3, 2.0], l: [-2, 0.8, -3], fov: 48, e: 'lin' }], w: () => ({ pent: { night: 1, empty: 1 } }),
  act: (c) => [leon(c, { expr: 'worried', noShades: 1, legs: 'sit', R: { x: 345, y: 500 }, holdR: 'phone', screenCol: '#7ad0ff' }, SOFA, { tint: '#9aa8d8' })],
  fx: (c) => [0, 1, 2, 3, 4].map((i) => { const k = ((c.t * 0.7 + i * 0.2) % 1); return FX('h' + i + q(k, 1), fx.heart(q(k, 1)), [-2 + Math.sin(i * 3) * 0.4, 1.3 + k * 0.6, -2.8], 0.18); }) });
// 297.79–303.51 "Aber keiner fragt, wie's ihm geht. Er hat eine Milliarde. Und hat sich noch nie so arm gefühlt."
S(297.79, 'pent', { light: 'sad', cam: [{ at: 0, p: [-1.0, 1.55, 0.2], l: [-2, 1.3, -3.0], fov: 38 }, { u: 1, p: [-1.65, 1.42, -1.6], l: [-2, 1.34, -3.0], fov: 32, e: 'lin' }], w: () => ({ pent: { night: 1, empty: 1 } }), dof: fh(SOFA, 12),
  act: (c) => [leon(c, { expr: 'worried', noShades: 1, legs: 'sit', look: 0.2, headTilt: -6, R: { x: 345, y: 520 }, holdR: 'phone', screenCol: '#7ad0ff' }, SOFA, { tint: '#9aa8d8' })],
  fx: (c) => [FX('G:ph', fx.glowDot(0.6, '120,170,255'), [-1.85, 0.95, -2.85], 0.6), c.t > 301.9 ? FX('dr' + q(c.t % 1, 1), fx.drops(q((c.t % 1.4) / 1.4, 2)), [-1.85, 1.35, -2.9], 0.18) : null] });
