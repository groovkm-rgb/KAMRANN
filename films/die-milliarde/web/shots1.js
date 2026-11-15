// shots1.js: 1 Der Einstieg (0:00–0:57) + 2 Tag 1 (0:57–2:13)
import { S, A, FX, fx, hold, burst, lerp, lerp3, ramp, smooth, easeOut, clamp, q, pulse, LEON, KEREM, GREY, HAHN, cu, med, fh, walkStep, bobW, leon, HEAD, pxm } from './shots_h.js';

const PH = [0, 1.5, 0]; // void phone centre
const phoneW = (st, o = {}) => ({ void: { phone: st, dust: 1, ...o } });
const BED = [-1.55, 0, -1.5];

// ======================= HOOK =======================
// 0.00–3.38 "Heute Morgen hattest du 43 Euro auf dem Konto." hard zoom into a glowing phone in the dark
S(0, 'void', { light: 'phone', cam: [{ at: 0, p: [0.3, 1.62, 3.2], l: [0, 1.5, 0], fov: 40, roll: -6 }, { at: 0.7, p: [0, 1.51, 0.62], l: [0, 1.5, 0], fov: 40, roll: 0, e: 'out' }, { u: 1, p: [0, 1.52, 0.42], l: [0, 1.52, 0], fov: 40, e: 'lin' }],
  w: (c) => phoneW({ mode: 'bank', amount: '43,00 €', clock: '06:01' }), shake: [{ at: 0.7, a: 0.012 }], dof: { p: PH, c: 6 },
  fx: (c) => [FX('g' + q(0.6 + 0.4 * Math.sin(c.t * 3), 1), fx.glowDot(q(0.55 + 0.2 * Math.sin(c.t * 3), 2), '120,170,255'), [0, 1.5, -0.08], 0.9)] });
// 3.38–5.05 "Jetzt hast du eine Milliarde." slot-machine reels, zeros popping with shakes and gold sparkles
const POPS = [3.45, 3.6, 3.75, 3.9, 4.05, 4.2, 4.35, 4.5, 4.65, 4.86];
S(3.3, 'void', { light: 'phone', cam: [{ at: 0, p: [0, 1.555, 0.3], l: [0, 1.555, 0], fov: 32 }, { u: 1, p: [0.0, 1.56, 0.26], l: [0, 1.56, 0], fov: 32, e: 'lin' }],
  w: (c) => { const k = POPS.filter((x) => c.t >= x).length; return phoneW({ mode: 'bank', reel: k, t: q(c.t, 2), gold: k >= 10 ? 1 : 0, clock: '06:01' }); },
  shake: POPS.map((x) => ({ at: x - 3.3, a: x === 4.86 ? 0.03 : 0.012 })), dof: { p: [0, 1.565, 0], c: 5 },
  fx: (c) => POPS.map((x, i) => { const k = (c.t - x) / 0.45; if (k < 0 || k > 1) return null; const px = pxm(i === 9 ? 55 : 380 - i * 37); return FX('sp' + i + q(k, 2), fx.sparkle(q(k, 2)), [px, 1.565, 0.03], i === 9 ? 0.16 : 0.08); }) });
// 5.05–6.20 pull back: Leon's shocked face in the dark, digits mirrored in his glasses
S(5.05, 'apt', { light: 'phone', lightMod: { fogNear: 4, fogFar: 14 }, tint: '#c8d8ff',
  cam: [{ at: 0, p: [-1.5, 1.6, -0.95], l: [-1.55, 1.58, -1.5], fov: 30 }, { at: 0.5, p: [-1.25, 1.55, 0.2], l: [-1.55, 1.42, -1.5], fov: 36, e: 'out' }, { u: 1, p: [-1.2, 1.52, 0.35], l: [-1.55, 1.42, -1.5], fov: 36, e: 'lin' }],
  w: () => ({ apt: { night: 1 } }), dof: fh([-1.55, -0.12, -1.5], 12),
  act: (c) => [leon(c, { home: 1, expr: 'shock', reflect: '1.000.000.043', R: { x: 345, y: 520 }, holdR: 'phone', screenCol: '#ffe27a', blink: 0 }, [-1.55, -0.12, -1.5])],
  fx: (c) => [FX('G:pg', fx.glowDot(0.8, '255,226,140'), [-1.45, 1.05, -1.25], 0.9)] });
// 6.20–9.16 "Und eigentlich gehört dir davon kein einziger Cent." quick trailer
S(6.2, 'city', { light: 'day', flash: { n: 3 }, cam: hold([-16, 0.45, -8.5], [-22, 0.6, -13], 32, { creep: 0.1 }), w: (c) => ({ city: { car1: [lerp(-25, -21, (c.t - 6.2) / 0.6), -12.5, 0.15], car2: null, spot: 0 } }), mb: () => 3, dof: { p: [-22, 0.6, -12.5], c: 6 } });
S(6.8, 'pent', { light: 'room', flash: { n: 3 }, cam: hold([-13.4, 0.95, -3.4], [-14, 0.55, -5.15], 34, { creep: 0.15 }), w: () => ({ pent: {} }), dof: { p: [-14, 0.6, -5.2], c: 9 },
  fx: (c) => [FX('ts' + q((c.t - 6.8) / 0.6, 2), fx.sparkle(q(clamp((c.t - 6.8) / 0.6), 2)), [-14, 0.75, -5.0], 0.8)] });
S(7.4, 'city', { light: 'grey', flash: { n: 3 }, cam: hold([4.7, 1.55, 6.9], [4.6, 1.5, 9.7], 38, { creep: 0.08 }), dof: fh([4.6, 0.15, 9.7], 10),
  act: (c) => [A(c, GREY, { expr: 'neutral', R: { x: 370, y: 470 }, look: 0.2 }, [4.0, 0.15, 9.7]), A(c, GREY, { expr: 'neutral', R: { x: 370, y: 470 }, look: -0.2, seed: 2 }, [5.2, 0.15, 9.8])] });
S(8.0, 'pent', { light: 'grey', flash: { n: 3 }, cam: [{ at: 0, p: [-13.5, 0.8, -3.9], l: [-13.6, 0.0, -4.2], fov: 36 }, { u: 1, p: [-13.55, 0.6, -4.0], l: [-13.6, 0.0, -4.2], fov: 36, e: 'lin' }], w: () => ({ pent: { heroEnv: 1, env: 0.5 } }), shake: [0.05], dof: { p: [-13.6, 0.05, -4.2], c: 6 } });
S(8.6, 'office', { light: 'office', lightMod: { gain: '#ffe8e8' }, flash: { n: 3 }, cam: [{ at: 0, p: [0.2, 1.6, -1.6], l: [0, 1.55, -3.6], fov: 30 }, { at: 0.2, p: [0.15, 1.58, -2.0], l: [0, 1.5, -3.6], fov: 30, e: 'out' }, { u: 1, p: [0.1, 1.57, -2.1], l: [0, 1.5, -3.6], fov: 30 }], shake: [0.1, 0.35], dof: fh([0, 0, -3.6], 12, 1.08),
  act: (c) => [A(c, HAHN, { expr: 'angry', mouth: c.t > 8.8 ? 'open' : 'frown', L: 'up', R: { x: 470, y: 480 } }, [0, 0, -3.6], { s: 1.08 })], flashEnd: { n: 5, a: 1 } });

// ======================= DAS IST LEON =======================
// 9.16–12.60 "Das ist Leon. 26 Jahre alt. Paketbote." low hero shot on the Kiez street, morning
S(9.16, 'kiez', { light: 'golden', lightMod: { az: 110 }, flash: { n: 5, a: 1 }, cam: [{ at: 0, p: [3.35, 0.7, -3.4], l: [3.0, 1.45, -5.6], fov: 44 }, { u: 1, p: [3.3, 0.72, -3.65], l: [3.0, 1.5, -5.6], fov: 43, e: 'lin' }], dof: fh([3, 0.15, -5.6], 8),
  act: (c) => { const k = c.t; return [leon(c, { expr: k < 10.0 ? 'happy' : k < 11.6 ? 'goofy' : 'smug', L: k < 10.1 ? 'wave' : 'hang', R: { x: 380, y: 560 }, holdR: 'bag', turn: 0.15 }, [3.0, 0.15, -5.6])]; },
  fx: (c) => c.t > 11.7 && c.t < 12.3 ? [FX('st' + q(c.t - 11.7, 1), fx.sparkle(q((c.t - 11.7) / 0.6, 2), '#f2c230'), [3.35, 2.55, -5.5], 0.5)] : [] });
// 12.60–15.70 "Jeden Tag schleppt er 200 Pakete durch die Stadt" parcel tower, van
S(12.6, 'kiez', { light: 'day', xf: 0.2, cam: [{ at: 0, p: [-1.5, 1.3, -1.2], l: [-3, 2.0, -5], fov: 46 }, { u: 1, p: [-5.5, 1.3, -1.2], l: [-7, 2.1, -5], fov: 46, e: 'lin' }],
  act: (c) => { const x = lerp(-1.5, -7.5, ramp(c.t, 12.6, 15.7)); return [leon(c, { expr: 'worried', legs: 'walk', step: walkStep(c.t), L: { x: 180, y: 420 }, R: { x: 420, y: 420 }, bob: bobW(c.t) }, [x, 0.15, -5.0], { flip: true })]; },
  fx: (c) => { const x = lerp(-1.5, -7.5, ramp(c.t, 12.6, 15.7)), out = []; for (let i = 0; i < 9; i++) out.push(FX('pk' + i, (g) => { g.fillStyle = '#c8965a'; g.fillRect(120 + (i % 2) * 30, 300 + 0, 360 - (i % 3) * 40, 400); g.lineWidth = 14; g.strokeStyle = '#1a1416'; g.strokeRect(120 + (i % 2) * 30, 300, 360 - (i % 3) * 40, 400); g.fillStyle = '#b07e44'; g.fillRect(140, 470, 320, 40); }, [x + Math.sin(c.t * 4 + i) * 0.03, 1.15 + i * 0.3, -4.95], 0.75)); return out; } });
// 15.70–18.05 "fünf Stockwerke hoch, ohne Aufzug" stairwell, looking up
S(15.7, 'stairs', { light: 'room', lightMod: { hemi: 0.9, vig: 0.45 }, cam: [{ at: 0, p: [2.9, 3.6, 0.7], l: [-0.6, 4.9, 0.35], fov: 50 }, { u: 1, p: [2.6, 3.8, 0.7], l: [-0.8, 5.2, 0.35], fov: 50, e: 'lin' }],
  act: (c) => { const k = ramp(c.t, 15.7, 18.05), x = lerp(0.9, -0.5, k), y = 2.9 + (1.2 - x) / 0.17 * (2.9 / 14); return [leon(c, { back: true, legs: 'walk', step: walkStep(c.t, 1.2), L: { x: 200, y: 400 }, R: { x: 400, y: 400 }, bob: bobW(c.t, 1.2), tilt: -4 }, [x, y, 0.4], { blob: false })]; },
  fx: (c) => { const k = ramp(c.t, 15.7, 18.05), x = lerp(1.0, -0.4, k), y = 2.9 + (1.2 - x) / 0.17 * (2.9 / 14); return [FX('stk', (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = '#c8965a'; g.fillRect(150 + (i % 2) * 20, 200 + i * 150, 300, 140); g.lineWidth = 12; g.strokeStyle = '#1a1416'; g.strokeRect(150 + (i % 2) * 20, 200 + i * 150, 300, 140); } }, [x + 0.05, y + 1.55, 0.25], 1.1), FX('sw' + q(c.t % 0.6, 1), fx.sweat(q((c.t % 0.6) / 0.6, 2)), [x + 0.45, y + 1.95, 0.6], 0.3)]; } });
// 18.05–20.50 "Er wohnt in einer Einzimmerwohnung" tiny flat wide
S(18.05, 'apt', { light: 'room', xf: 0.2, cam: [{ at: 0, p: [1.6, 2.1, 4.3], l: [-0.3, 1.0, -1.0], fov: 52 }, { u: 1, p: [1.3, 1.9, 3.6], l: [-0.3, 1.0, -1.0], fov: 52, e: 'lin' }], w: () => ({ apt: { shaft: 1 } }),
  act: (c) => [leon(c, { home: 1, expr: 'neutral', look: -0.4, turn: -0.2 }, [0.3, 0, -0.4])] });
// 20.50–23.62 "...Heizung nur funktioniert, wenn man einmal kräftig dagegen tritt." kick!
S(20.5, 'apt', { light: 'room', cam: [{ at: 0, p: [1.6, 1.45, 1.7], l: [0.6, 1.0, -1.5], fov: 46 }, { u: 1, p: [1.5, 1.4, 1.45], l: [0.6, 0.95, -1.5], fov: 46, e: 'lin' }], shake: [{ at: 2.35, a: 0.03 }], dof: { p: [0.9, 0.6, -1.85], c: 7 },
  w: (c) => ({ apt: { shaft: 1, radShake: c.t > 22.85 && c.t < 23.4 ? 1 : 0 } }),
  act: (c) => { const kick = c.t > 22.7 && c.t < 23.1; return [leon(c, { home: 1, expr: c.t < 22.6 ? 'worried' : kick ? 'determined' : 'happy', legs: kick ? 'kick' : 'stand', L: kick ? 'up' : 'hip', R: kick ? 'wave' : 'hang', turn: -0.3 }, [0.25, 0, -1.3], { flip: false })]; },
  fx: (c) => { const out = []; if (c.t > 22.85 && c.t < 23.45) out.push(FX('pop' + q(c.t, 1), fx.pop(q((c.t - 22.85) / 0.6, 2)), [0.9, 0.5, -1.7], 0.7)); if (c.t > 23.0) out.push(FX('puf' + q(c.t, 1), fx.puff(q(clamp((c.t - 23.0) / 0.6), 2), '255,255,255'), [1.35, 0.9, -1.85], 0.6)); return out; } });
// 23.62–25.85 "Die Miete ist seit zwei Wochen überfällig." red envelope slides under the door
S(23.62, 'apt', { light: 'room', cam: [{ at: 0, p: [1.6, 0.45, -0.3], l: [1.9, 0.02, -0.9], fov: 34 }, { u: 1, p: [1.68, 0.38, -0.45], l: [1.9, 0.02, -0.9], fov: 34, e: 'lin' }], dof: { p: [1.9, 0.02, -0.9], c: 9 },
  w: (c) => ({ apt: { letter: 1 } }), act: (c) => [leon(c, { home: 1, expr: 'worried', look: 0.6 }, [0.9, 0, -0.1], { s: 1 })] });
// 25.85–28.45 "Und im Kühlschrank liegt ein einsames Glas Gurken." fridge opens, light beam, one jar
S(25.85, 'apt', { light: 'room', lightMod: { hemi: 0.8 }, cam: [{ at: 0, p: [1.85, 1.15, 2.6], l: [1.85, 0.95, 0.9], fov: 40 }, { at: 1.4, p: [1.87, 1.0, 1.75], l: [1.87, 0.92, 0.9], fov: 36, e: 'io' }, { u: 1, p: [1.87, 0.98, 1.6], l: [1.87, 0.92, 0.9], fov: 36, e: 'lin' }],
  w: (c) => ({ apt: { fridge: easeOut(ramp(c.t, 26.0, 26.7)) } }), dof: { p: [1.87, 0.95, 0.88], c: 10 },
  fx: (c) => c.t > 26.4 ? [FX('G:jar', fx.glowDot(0.6, '200,240,255'), [1.87, 0.95, 0.95], 0.6)] : [] });
// 28.45–30.90 "An diesem Montag klingelt um sechs Uhr der Wecker." alarm clock rattles, Leon asleep
S(28.45, 'apt', { light: 'dawn', xf: 0.25, cam: [{ at: 0, p: [-0.45, 0.95, -1.15], l: [-0.55, 0.72, -1.72], fov: 34 }, { at: 1.3, p: [-0.5, 0.92, -1.25], l: [-0.55, 0.72, -1.72], fov: 34 }, { at: 1.6, p: [-0.75, 1.3, 0.3], l: [-1.5, 0.75, -1.4], fov: 42, e: 'out' }, { u: 1, p: [-0.78, 1.28, 0.2], l: [-1.5, 0.75, -1.4], fov: 42, e: 'lin' }],
  w: (c) => ({ apt: { night: 1, dawn: 1, clockShake: c.t > 28.6 ? 1 : 0 } }), dof: (c) => (c.lt < 1.5 ? { p: [-0.55, 0.75, -1.72], c: 10 } : fh(BED, 9)),
  act: (c) => [leon(c, { home: 1, expr: 'sleep', blink: 1 }, [-1.55, -0.85, -1.5])],
  fx: (c) => [FX('sh' + (Math.floor(c.t * 12) % 2), fx.shake(0), [-0.55, 0.75, -1.7], 0.5), c.lt > 1.5 ? FX('zz' + q(c.t % 1, 1), fx.zzz(q(c.t % 1, 1)), [-1.2, 1.2, -1.4], 0.5) : null] });
// 30.90–33.85 "Leon greift nach dem Handy und öffnet die Banking-App."
S(30.9, 'apt', { light: 'dawn', cam: hold([-0.9, 1.25, 0.6], [-1.5, 1.05, -1.5], 38, { creep: 0.08 }), w: () => ({ apt: { night: 1, dawn: 1 } }), dof: fh([-1.55, -0.5, -1.5], 10), tint: '#c8d0f0',
  act: (c) => { const k = easeOut(ramp(c.t, 30.9, 31.8)); return [leon(c, { home: 1, expr: c.t < 31.6 ? 'sleep' : 'neutral', blink: c.t < 31.6 ? 1 : undefined, R: c.t < 31.4 ? { x: 520, y: 420 } : { x: 345, y: 500 }, holdR: c.t > 31.4 ? 'phone' : undefined, screenCol: '#8ab4ff' }, [-1.55, lerp(-0.85, -0.5, k), -1.5])]; } });
// 33.85–36.84 "Er will nur checken, ob er sich heute noch 'nen Kaffee leisten kann." thought bubble
S(33.85, 'apt', { light: 'dawn', cam: cu([-1.55, -0.5, -1.5], { d: 1.6, dx: 0.35, fov: 34 }), w: () => ({ apt: { night: 1, dawn: 1 } }), dof: fh([-1.55, -0.5, -1.5], 12), tint: '#c8d0f0',
  act: (c) => [leon(c, { home: 1, expr: 'neutral', look: -0.3, headTilt: -4, R: { x: 345, y: 500 }, holdR: 'phone', screenCol: '#8ab4ff' }, [-1.55, -0.5, -1.5])],
  fx: (c) => [FX('cf' + q(clamp((c.t - 34.3) / 0.6), 1), fx.coffee(q(clamp((c.t - 34.3) / 0.6), 1)), [-1.12, 1.3, -1.35], 0.5)] });
// 36.84–40.37 "Kontostand: eine Milliarde dreiundvierzig Euro." phone insert
S(36.84, 'void', { light: 'phone', cam: [{ at: 0, p: [0, 1.52, 0.5], l: [0, 1.52, 0], fov: 40 }, { at: 1.0, p: [0.0, 1.56, 0.26], l: [0, 1.56, 0], fov: 36, e: 'io' }, { u: 1, p: [0.0, 1.565, 0.22], l: [0, 1.565, 0], fov: 36, e: 'lin' }],
  w: () => phoneW({ mode: 'bank', amount: '1.000.000.043,00 €', clock: '06:02' }), dof: { p: [0, 1.56, 0], c: 5 } });
// 40.37–42.66 "Leon blinzelt. Er reibt sich die Augen."
S(40.37, 'apt', { light: 'dawn', cam: cu([-1.55, -0.5, -1.5], { d: 1.3, dx: 0.1, fov: 32, creep: 0.04 }), w: () => ({ apt: { night: 1, dawn: 1 } }), dof: fh([-1.55, -0.5, -1.5], 12), tint: '#c8d0f0',
  act: (c) => { const rub = c.t > 41.45; return [leon(c, { home: 1, expr: rub ? 'sleep' : 'shock', blink: !rub && (Math.floor(c.t * 5) % 2) ? 1 : 0, L: rub ? { x: 262, y: 280 } : 'hang', R: rub ? { x: 338, y: 280 + 10 * Math.sin(c.t * 25) } : { x: 345, y: 500 }, holdR: rub ? undefined : 'phone', screenCol: '#ffe27a' }, [-1.55, -0.5, -1.5])]; } });
// 42.66–44.70 "Er macht die App zu und wieder auf." screen off, on
S(42.66, 'void', { light: 'phone', cam: hold([0, 1.5, 0.5], [0, 1.5, 0], 40, { creep: 0.1 }), w: (c) => phoneW(c.t < 43.4 ? { mode: 'bank', amount: '1.000.000.043,00 €' } : c.t < 43.9 ? { mode: 'off' } : { mode: 'bank', amount: '1.000.000.043,00 €' }), dof: { p: PH, c: 5 },
  shake: [{ at: 1.25, a: 0.012 }] });
// 44.70–50.52 "Immer noch da. Eine Eins. Und dann neun Nullen. Plus seine 43 Euro." macro along the digits
S(44.7, 'void', { light: 'phone', cam: (c) => { const k = c.t < 48.81 ? ramp(c.t, 46.71, 48.45) : 1; const x = c.t < 45.72 ? lerp(0, -0.02, ramp(c.t, 44.7, 45.6)) : c.t < 46.71 ? pxm(70) : c.t < 48.81 ? lerp(pxm(100), pxm(308), k) : pxm(350); const z = (c.t < 45.72 ? 0.26 : 0.15) - (c.t < 45.72 ? c.lt : c.t < 48.81 ? c.t - 45.72 : c.t - 48.81) * 0.012; const xx = x + Math.sin(c.t * 0.9) * 0.002; return { p: [xx, 1.565 + (c.t - 44.7) * 0.0005, z], l: [xx, 1.565, 0], fov: 34, roll: 0 }; },
  w: (c) => phoneW({ mode: 'bank', amount: '1.000.000.043,00 €' }), dof: { p: [0, 1.565, 0], c: 4 },
  fx: (c) => { const out = []; if (c.t > 45.72 && c.t < 46.7) out.push(FX('G:one', fx.glowDot(1, '255,226,120'), [pxm(55), 1.565, 0.01], 0.05)); if (c.t > 46.71 && c.t < 48.7) [100, 129, 158, 204, 233, 262, 308].forEach((px, i) => { if (c.t > 46.8 + i * 0.22) out.push(FX('G:z' + i, fx.glowDot(0.8, '255,226,120'), [pxm(px), 1.565, 0.01], 0.03)); }); if (c.t > 48.81) out.push(FX('G:43', fx.glowDot(1, '120,255,160'), [pxm(351), 1.565, 0.01], 0.045)); return out; } });
// 50.52–53.05 "Verwendungszweck: Yacht Nummer vier."
S(50.52, 'void', { light: 'phone', cam: [{ at: 0, p: [0, 1.5, 0.32], l: [0, 1.5, 0], fov: 38 }, { at: 0.6, p: [0.0, 1.487, 0.2], l: [0.0, 1.487, 0], fov: 36, e: 'io' }, { u: 1, p: [0.0, 1.487, 0.18], l: [0, 1.487, 0], fov: 36, e: 'lin' }],
  w: (c) => phoneW({ mode: 'bank', amount: '1.000.000.043,00 €', tx: true, hiTx: c.t > 51.4 }), dof: { p: [0, 1.487, 0], c: 4 } });
// 53.05–56.16 "Leon setzt sich ganz langsam auf." slow rise; 56.16 "Alter." punch-in
S(53.05, 'apt', { light: 'dawn', lightMod: { sunI: 1.2 }, cam: [{ at: 0, p: [-0.6, 1.0, 1.2], l: [-1.55, 0.9, -1.5], fov: 40 }, { at: 3.0, p: [-0.75, 1.25, 0.6], l: [-1.55, 1.3, -1.5], fov: 38, e: 'lin' }, { at: 3.15, p: [-1.3, 1.5, -0.45], l: [-1.55, 1.42, -1.5], fov: 34, e: 'out' }, { u: 1, p: [-1.32, 1.5, -0.55], l: [-1.55, 1.42, -1.5], fov: 34, e: 'lin' }],
  w: () => ({ apt: { night: 1, dawn: 1 } }), dof: fh([-1.55, -0.1, -1.5], 11), shake: [{ at: 3.12, a: 0.02 }], tint: '#d8d8f4',
  act: (c) => { const k = smooth(ramp(c.t, 53.1, 55.6)); return [leon(c, { home: 1, expr: c.t < 56.1 ? 'goofy' : 'shock', mouth: c.t > 56.15 && c.t < 56.6 ? 'open' : undefined, R: { x: 345, y: 520 }, holdR: 'phone', screenCol: '#ffe27a', reflect: c.t > 56.1 ? '1.000.000.043' : undefined }, [-1.55, lerp(-0.6, -0.1, k), -1.5])]; } });

// ======================= TAG 1 =======================
// 57.29–61.62 "Tag eins – Der Test. Leon ruft sofort seinen besten Kumpel an." Leon by the window, phone to ear
S(56.9, 'apt', { light: 'room', flash: { n: 4 }, cam: [{ at: 0, p: [-0.6, 1.6, 2.6], l: [0.6, 1.3, -1.3], fov: 46 }, { u: 1, p: [-0.3, 1.55, 2.0], l: [0.6, 1.35, -1.3], fov: 44, e: 'lin' }], w: () => ({ apt: { shaft: 1 } }), dof: fh([0.6, 0, -1.3], 7),
  act: (c) => [leon(c, { home: 1, expr: c.t < 58.4 ? 'goofy' : 'sly', talk: c.t > 59.5, R: { x: 410, y: 290 }, holdR: 'phone', screenCol: '#7ad0ff', L: 'wave', bob: q(Math.abs(Math.sin(c.t * 9)) * 0.01, 3) }, [0.6, 0, -1.3])] });
// 61.62–64.65 "Kerem. Kennen sich seit dem Kindergarten." Kerem in the Imbiss, then the old photo
S(61.62, 'imbiss', { light: 'warm', xf: 0.2, cam: [{ at: 0, p: [0.5, 1.75, 1.2], l: [-0.3, 1.7, -1.4], fov: 38 }, { at: 0.9, p: [0.4, 1.72, 1.0], l: [-0.3, 1.68, -1.4], fov: 38, e: 'lin' }, { at: 1.25, p: [2.4, 1.9, -1.6], l: [3.0, 1.9, -2.9], fov: 34, e: 'out' }, { u: 1, p: [2.55, 1.9, -1.85], l: [3.0, 1.9, -2.9], fov: 34, e: 'lin' }],
  w: () => ({ imb: {} }), dof: (c) => (c.lt < 1.1 ? fh([-0.3, 0.32, -1.4], 10) : { p: [3, 1.9, -2.9], c: 10 }),
  act: (c) => [A(c, KEREM, { expr: 'goofy', L: { x: 190, y: 290 }, holdL: 'phone', screenCol: '#7ad0ff' }, [-0.3, 0.32, -1.4])] });
// 64.65–68.79 "Kerem arbeitet im Imbiss von seinen Eltern, zwei Straßen weiter." drone over the Kiez onto the sign
S(64.65, 'kiez', { light: 'day', xf: 0.25, cam: [{ at: 0, p: [-14, 22, 18], l: [0, 5, -8], fov: 46 }, { at: 3.0, p: [3.5, 3.4, 4.5], l: [4, 3.0, -7.6], fov: 44, e: 'io' }, { u: 1, p: [3.8, 3.1, 3.6], l: [4, 3.0, -7.6], fov: 42, e: 'lin' }],
  act: (c) => [A(c, KEREM, { expr: 'happy', L: 'wave' }, [5.5, 0.15, -6.2])], dof: { p: [4, 3.4, -7.6], c: 3 } });
// 68.79–72.31 "Kerem. Ich hab eine Milliarde Euro auf dem Konto." Leon on the phone, very excited
S(68.79, 'apt', { light: 'room', cam: cu([0.6, 0, -1.3], { d: 1.9, dx: -0.3, fov: 34 }), w: () => ({ apt: { shaft: 1 } }), dof: fh([0.6, 0, -1.3], 12),
  act: (c) => [leon(c, { home: 1, expr: c.t < 69.5 ? 'goofy' : 'laugh', talk: true, R: { x: 410, y: 290 }, holdR: 'phone', screenCol: '#7ad0ff', L: 'up', bob: q(Math.abs(Math.sin(c.t * 10)) * 0.015, 3) }, [0.6, 0, -1.3])] });
// 72.31–74.13 "Stille. Dann:" Kerem frozen, pide half way
S(72.31, 'imbiss', { light: 'warm', cam: cu([-0.3, 0.32, -1.4], { d: 1.7, dx: 0.2, fov: 34, creep: 0.02 }), dof: fh([-0.3, 0.32, -1.4], 12),
  act: (c) => [A(c, KEREM, { expr: 'neutral', blink: 0, L: { x: 190, y: 290 }, holdL: 'phone', screenCol: '#7ad0ff', R: { x: 330, y: 400 } }, [-0.3, 0.32, -1.4])],
  fx: (c) => c.t > 72.6 ? [FX('q', fx.question(q(c.t % 1, 1)), [0.25, 2.2, -1.3], 0.4)] : [] });
// 74.13–79.18 "Bruder, hast du wieder vom Gurkenglas gegessen? Das ist abgelaufen."
S(74.13, 'imbiss', { light: 'warm', cam: [{ at: 0, p: [0.6, 1.8, 1.0], l: [-0.3, 1.62, -1.4], fov: 38 }, { u: 1, p: [0.45, 1.75, 0.6], l: [-0.3, 1.64, -1.4], fov: 36, e: 'lin' }], dof: fh([-0.3, 0.32, -1.4], 11),
  act: (c) => [A(c, KEREM, { expr: c.t < 77.4 ? 'sly' : 'smug', talk: true, L: { x: 190, y: 290 }, holdL: 'phone', screenCol: '#7ad0ff', R: c.t > 77.4 ? 'point' : 'forward', headTilt: 6 }, [-0.3, 0.32, -1.4])],
  fx: (c) => c.t > 77.43 ? [FX('jar', (g) => { g.fillStyle = 'rgba(160,210,110,0.9)'; g.fillRect(200, 300, 200, 300); g.lineWidth = 12; g.strokeStyle = '#1a1416'; g.strokeRect(200, 300, 200, 300); g.fillStyle = '#e03a3a'; g.fillRect(190, 260, 220, 50); g.strokeRect(190, 260, 220, 50); g.fillStyle = '#4a7a2a'; for (let i = 0; i < 3; i++) g.fillRect(230 + i * 50, 360, 26, 200); g.strokeStyle = '#d0202a'; g.lineWidth = 18; g.beginPath(); g.moveTo(180, 280); g.lineTo(420, 640); g.moveTo(420, 280); g.lineTo(180, 640); g.stroke(); }, [0.7, 2.1, -1.2], 0.6)] : [] });
// 79.18–81.45 "Leon schickt ihm einen Screenshot." phone chat with the screenshot
S(79.18, 'void', { light: 'phone', cam: hold([0, 1.5, 0.48], [0, 1.5, 0], 40, { creep: 0.12 }), w: (c) => phoneW({ mode: 'chat', photo: c.t > 79.9, bubbles: [['me', 'GUCK!!!']] }), dof: { p: PH, c: 5 },
  fx: (c) => c.t > 79.9 && c.t < 80.5 ? [FX('snd' + q(c.t, 1), fx.speed(q((c.t - 79.9) / 0.6, 2)), [0.05, 1.55, 0.05], 0.25)] : [] });
// 81.45–84.39 "Zehn Sekunden später steht Kerem vor seiner Tür." door swings, Kerem panting
S(81.45, 'apt', { light: 'room', cam: [{ at: 0, p: [0.3, 1.55, -0.3], l: [3.0, 1.45, -0.85], fov: 44 }, { u: 1, p: [0.6, 1.52, -0.4], l: [3.0, 1.45, -0.85], fov: 42, e: 'lin' }], w: (c) => ({ apt: { door: easeOut(ramp(c.t, 82.2, 82.6)) } }), shake: [{ at: 0.8, a: 0.02 }], dof: fh([3.1, 0, -0.85], 8),
  act: (c) => [A(c, KEREM, { expr: 'scared', L: 'up', bob: q(Math.abs(Math.sin(c.t * 14)) * 0.012, 3) }, [3.1, 0, -0.85])],
  fx: (c) => c.t > 82.3 && c.t < 83.0 ? [FX('spd' + q(c.t, 1), fx.speed(q((c.t - 82.3) / 0.7, 2)), [2.4, 1.4, -0.85], 1.2), FX('pf' + q(c.t, 1), fx.puff(q((c.t - 82.3) / 0.7, 2)), [3.2, 0.3, -0.85], 0.9)] : [FX('sw' + q(c.t % 0.5, 1), fx.sweat(q((c.t % 0.5) / 0.5, 2)), [3.55, 2.0, -0.8], 0.25)] });
// 84.39–88.01 "Noch in Imbiss-Schürze. Mit 'nem Fladenbrot in der Hand." tilt down to the apron, insert pide
S(84.39, 'apt', { light: 'room', cam: [{ at: 0, p: [1.5, 1.7, -0.6], l: [3.1, 1.6, -0.85], fov: 36 }, { at: 1.6, p: [1.5, 1.35, -0.7], l: [3.1, 1.15, -0.75], fov: 38, e: 'io' }, { u: 1, p: [1.65, 1.3, -0.7], l: [3.1, 1.1, -0.72], fov: 38, e: 'lin' }],
  w: () => ({ apt: { door: 1 } }), dof: (c) => (c.lt < 1.9 ? fh([3.1, 0, -0.85], 9) : { p: [3.1, 1.0, -0.6], c: 9 }),
  act: (c) => [A(c, KEREM, { expr: 'goofy', R: { x: 460, y: 560 }, bob: q(Math.abs(Math.sin(c.t * 10)) * 0.008, 3) }, [3.1, 0, -0.85])] });
// 88.01–89.94 "Sie starren beide auf das Handy." POV from the phone
S(88.01, 'apt', { light: 'room', lightMod: { vig: 0.5 }, cam: hold([0.95, 1.05, -0.3], [0.95, 1.55, -1.3], 50, { creep: 0.05 }), w: () => ({ apt: {} }), dof: fh([0.95, 0, -1.3], 7),
  act: (c) => [leon(c, { home: 1, expr: 'shock', look: 0.3, headTilt: 8 }, [0.55, 0, -1.25], { tint: '#d8ecff' }), A(c, KEREM, { expr: 'shock', look: -0.3, headTilt: -8 }, [1.4, 0, -1.3], { tint: '#d8ecff' })],
  fx: (c) => [FX('G:pg2', fx.glowDot(0.7, '160,210,255'), [0.95, 1.05, -0.6], 1.0)] });
// 89.94–92.13 "Das ist 'n Fehler", sagt Kerem.
S(89.94, 'apt', { light: 'room', cam: cu([1.4, 0, -1.3], { d: 1.7, dx: -0.35, fov: 34 }), dof: fh([1.4, 0, -1.3], 12),
  act: (c) => [A(c, KEREM, { expr: 'worried', talk: c.t < 91.0, R: 'point', look: -0.6, turn: -0.3 }, [1.4, 0, -1.3]), leon(c, { home: 1, expr: 'goofy' }, [0.3, 0, -1.9], { alpha: 1 })] });
// 92.13–94.71 "Ein Bankfehler. Die merken das." over-shoulder
S(92.13, 'apt', { light: 'room', cam: hold([-0.4, 1.85, 0.4], [1.4, 1.55, -1.3], 40, { creep: 0.05 }), dof: fh([1.4, 0, -1.3], 9),
  act: (c) => [leon(c, { home: 1, back: true }, [0.35, 0, -0.75]), A(c, KEREM, { expr: 'scared', talk: true, L: 'up', R: 'up', turn: -0.2 }, [1.4, 0, -1.3])] });
// 94.71–96.39 "Fass das bloß nicht an." finger wag, punch-in
S(94.71, 'apt', { light: 'room', cam: burst([1.0, 1.6, 0.4], [1.25, 1.58, -0.2], [1.4, 1.48, -1.3], 30, { dur: 0.25 }), dof: fh([1.4, 0, -1.3], 13),
  act: (c) => [A(c, KEREM, { expr: 'angry', talk: true, R: { x: 470, y: 230 + 20 * Math.sin(c.t * 20) }, turn: -0.2 }, [1.4, 0, -1.3])] });
// 96.39–98.49 "Nur ein kleiner Test", sagt Leon. sly grin
S(96.39, 'apt', { light: 'room', cam: burst([0.9, 1.55, 0.6], [0.75, 1.55, 0.25], [0.45, 1.42, -1.25], 32, { dur: 0.3 }), dof: fh([0.45, 0, -1.25], 13),
  act: (c) => [leon(c, { home: 1, expr: 'sly', talk: c.t < 97.3, look: 0.6, turn: 0.25, L: 'chin' }, [0.45, 0, -1.25])],
  fx: (c) => c.t > 97.4 ? [FX('spk' + q(c.t - 97.4, 1), fx.sparkle(q(clamp((c.t - 97.4) / 0.5), 2)), [0.15, 1.9, -1.2], 0.35)] : [] });
// 98.49–100.99 "Zehn Minuten später stehen sie im Imbiss." Imbiss wide, both enter
S(98.49, 'imbiss', { light: 'warm', xf: 0.25, cam: [{ at: 0, p: [3.4, 2.4, 2.8], l: [0, 1.2, -1], fov: 52 }, { u: 1, p: [2.8, 2.2, 2.4], l: [0, 1.2, -1], fov: 50, e: 'lin' }], w: () => ({ imb: {} }),
  act: (c) => { const k = easeOut(ramp(c.t, 98.6, 100.3)), walk = c.t < 100.3; return [leon(c, { expr: 'sly', legs: walk ? 'walk' : 'stand', step: walkStep(c.t), turn: -0.3 }, [lerp(3.2, 0.9, k), 0, 0.7], { flip: true }), A(c, KEREM, { expr: 'worried', legs: walk ? 'walk' : 'stand', step: walkStep(c.t + 0.3), turn: -0.3 }, [lerp(4.2, 1.9, k), 0, 1.1], { flip: true })]; } });
// 100.99–106.66 "Leon bestellt einen Döner. Mit extra Fleisch. Extra Käse. Extra alles." build-up döner
S(100.99, 'imbiss', { light: 'warm', cam: [{ at: 0, p: [1.8, 1.85, 0.8], l: [1.35, 1.2, -0.35], fov: 38 }, { at: 1.6, p: [1.6, 1.6, 0.35], l: [1.35, 1.25, -0.35], fov: 36, e: 'io' }, { at: 4.5, p: [1.75, 1.75, 0.75], l: [1.35, 1.35, -0.35], fov: 40, e: 'lin' }, { u: 1, p: [1.8, 1.8, 0.85], l: [1.35, 1.4, -0.35], fov: 42, e: 'lin' }],
  w: (c) => ({ imb: { doner: c.t < 102.0 ? 0.2 : c.t < 103.1 ? 0.45 : c.t < 104.3 ? 0.6 : c.t < 105.5 ? 0.8 : 1.0, donerBig: easeOut(ramp(c.t, 105.5, 106.2)) } }), dof: { p: [1.35, 1.25, -0.35], c: 9 },
  shake: [{ at: 1.7, a: 0.01 }, { at: 3.3, a: 0.012 }, { at: 4.55, a: 0.02 }],
  fx: (c) => [102.7, 104.3, 105.55].map((x, i) => (c.t > x && c.t < x + 0.5 ? FX('sp' + i + q(c.t - x, 1), fx.sparkle(q((c.t - x) / 0.5, 2)), [1.35, 1.4 + i * 0.1, -0.25], 0.5 + i * 0.2) : null)) });
// 106.66–108.25 "Er hält die Karte ans Gerät." card to terminal
S(106.66, 'imbiss', { light: 'warm', cam: hold([2.3, 1.45, 0.3], [2.05, 1.12, -0.3], 36, { creep: 0.15 }), w: () => ({ imb: { doner: 1, donerBig: 1 } }), dof: { p: [2.05, 1.15, -0.3], c: 10 },
  fx: (c) => { const k = easeOut(ramp(c.t, 106.7, 107.7)); return [FX('card', (g) => { g.save(); g.translate(300, 500); g.rotate(-0.2); g.fillStyle = '#3a6ac8'; g.beginPath(); g.roundRect(-230, -145, 460, 290, 30); g.fill(); g.lineWidth = 14; g.strokeStyle = '#1a1416'; g.stroke(); g.fillStyle = '#e8c048'; g.fillRect(-170, -60, 90, 70); g.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) g.fillRect(-170 + i * 90, 60, 70, 18); g.restore(); }, [lerp(2.5, 2.07, k), lerp(1.45, 1.27, k), lerp(0.1, -0.25, k)], 0.16)]; } });
// 108.25–110.64 "Piep. Zahlung erfolgreich."
S(108.25, 'imbiss', { light: 'warm', cam: [{ at: 0, p: [2.05, 1.36, 0.0], l: [2.05, 1.175, -0.41], fov: 30 }, { u: 1, p: [2.05, 1.33, -0.07], l: [2.05, 1.175, -0.41], fov: 30, e: 'lin' }], w: (c) => ({ imb: { doner: 1, donerBig: 1, pay: c.t > 108.3 ? 1 : 0 } }), shake: [{ at: 0.05, a: 0.012 }], dof: { p: [2.05, 1.175, -0.41], c: 8 },
  fx: (c) => c.t > 108.3 && c.t < 109.0 ? [FX('chk' + q(c.t, 1), fx.sparkle(q((c.t - 108.3) / 0.7, 2), '#9affb0'), [2.05, 1.2, -0.35], 0.3)] : [] });
// 110.64–112.31 "Leon guckt Kerem an."  112.31–113.84 "Kerem guckt Leon an."
S(110.64, 'imbiss', { light: 'warm', cam: cu([0.9, 0, 0.7], { d: 1.6, dx: -0.25, fov: 32, creep: 0.03 }), dof: fh([0.9, 0, 0.7], 12),
  act: (c) => [leon(c, { expr: 'neutral', look: 1, turn: 0.4, blink: 0 }, [0.9, 0, 0.7])] });
S(112.31, 'imbiss', { light: 'warm', cam: cu([1.9, 0, 1.1], { d: 1.6, dx: 0.25, fov: 32, creep: 0.03 }), dof: fh([1.9, 0, 1.1], 12),
  act: (c) => [A(c, KEREM, { expr: 'neutral', look: -1, turn: -0.4, blink: 0 }, [1.9, 0, 1.1])] });
// 113.84–116.77 "Okay", sagt Leon. "Noch ein kleiner Test." two-shot, Leon grins, Kerem despairs
S(113.84, 'imbiss', { light: 'warm', cam: med([1.4, 0, 0.9], { d: 3.0, dx: 0.2, h: 1.45, ly: 1.35, fov: 40 }), dof: fh([1.4, 0, 0.9], 8),
  act: (c) => [leon(c, { expr: c.t < 115.3 ? 'smug' : 'sly', talk: true, L: 'thumb', turn: 0.3 }, [0.9, 0, 0.7]), A(c, KEREM, { expr: 'worried', L: { x: 250, y: 300 }, turn: -0.3 }, [1.9, 0, 1.1])] });
// 116.77–122.90 shopping montage: each "Piep" a new box drops into the flat
const PIEPS = [118.47, 120.29, 122.19];
S(116.77, 'void', { light: 'phone', lightMod: { hemi: 0.6 }, cam: hold([0, 1.5, 0.48], [0, 1.5, 0], 40, { creep: 0.1 }),
  w: (c) => phoneW({ mode: c.t < 118.47 ? 'shop' : 'pay', item: 'Kaffeemaschine', icon: '', price: '249,00 €', pop: q(easeOut(ramp(c.t, 118.47, 118.7)), 2) }), dof: { p: PH, c: 5 }, shake: [{ at: 1.7, a: 0.012 }] });
S(118.6, 'apt', { light: 'room', cam: hold([1.2, 1.6, 3.6], [0.2, 0.8, -0.2], 50, { creep: 0.08 }), w: (c) => ({ apt: { drops: [ramp(c.t, 118.6, 119.1) * 2, c.t > 120.29 ? ramp(c.t, 120.29, 120.8) * 2 : 0, c.t > 122.19 ? ramp(c.t, 122.19, 122.7) * 2 : 0] } }),
  shake: [{ at: 0.35, a: 0.02 }, { at: 120.29 - 118.6 + 0.3, a: 0.025 }, { at: 122.19 - 118.6 + 0.3, a: 0.03 }],
  act: (c) => [leon(c, { home: 1, expr: c.t < 120 ? 'goofy' : 'laugh', R: { x: 345, y: 500 }, holdR: 'phone', screenCol: '#7ad0ff', L: c.t > 121 ? 'up' : 'hang', bob: q(Math.abs(Math.sin(c.t * 8)) * 0.01, 3) }, [0.6, 0, 0.9])],
  fx: (c) => [[118.6, -0.2, 0.3], [120.29, 0.35, 0.9], [122.19, -0.7, 1.5]].map(([x, px, pz], i) => (c.t > x + 0.28 && c.t < x + 0.9 ? FX('d' + i + q(c.t - x, 1), fx.puff(q((c.t - x - 0.28) / 0.62, 2)), [px, 0.3, pz + 0.3], 1.0) : null)) });
// 122.90–128.26 "Und am Abend sitzt Leon ... zwischen Kartons, die bis zur Decke gestapelt sind." build-up + pull back
S(122.9, 'apt', { light: 'room', lightMod: { sky: '#ffc890', sun: '#ffb070', az: 200, el: 20, gain: '#fff0dc' }, xf: 0.3, cam: [{ at: 0, p: [-0.25, 1.05, 1.1], l: [-0.55, 0.85, -0.05], fov: 40 }, { u: 1, p: [0.6, 2.3, 4.6], l: [-0.3, 1.2, -0.6], fov: 56, e: 'io' }],
  w: (c) => ({ apt: { stack: easeOut(ramp(c.t, 122.9, 127.8)), drops: [2, 2, 2], lamp: 1 } }),
  act: (c) => [leon(c, { home: 1, expr: 'happy', legs: 'sit', R: { x: 345, y: 500 }, holdR: 'phone', screenCol: '#7ad0ff' }, [-0.55, -0.16, -0.05])] });
// 128.26–133.14 "Und denkt: Wenn die Bank es bis jetzt nicht gemerkt hat… merkt sie's vielleicht nie."
S(128.26, 'apt', { light: 'room', lightMod: { sky: '#ffc890', sun: '#ffb070', az: 200, el: 20, gain: '#fff0dc', vig: 0.45 }, cam: cu([-0.55, -0.16, -0.05], { d: 1.5, dx: 0.3, fov: 34, creep: 0.08 }), w: () => ({ apt: { stack: 1, drops: [2, 2, 2], lamp: 1 } }), dof: fh([-0.55, -0.16, -0.05], 12),
  act: (c) => [leon(c, { home: 1, expr: c.t < 131.4 ? 'neutral' : 'sly', look: c.t < 130 ? 0.5 : -0.3, legs: 'sit', L: 'chin', R: { x: 345, y: 520 }, holdR: 'phone', screenCol: '#7ad0ff' }, [-0.55, -0.16, -0.05])],
  fx: (c) => c.t > 131.6 ? [FX('sp9' + q(c.t - 131.6, 1), fx.sparkle(q(clamp((c.t - 131.6) / 0.6), 2)), [-0.25, 1.75, 0.0], 0.35)] : [] });
