// shots3.js: 5 Der Wendepunkt – Oma und der Kiez (5:04–6:48)
import { S, A, FX, fx, hold, burst, lerp, lerp3, ramp, smooth, easeOut, clamp, q, pulse, LEON, KEREM, OMA, MOTHER, NURSE, GUESTS, KIDS, cu, med, fh, walkStep, bobW, leon, HEAD } from './shots_h.js';
import { handsDraw, sproutDraw, easeIn } from './engine.js';

const phoneW = (st) => ({ void: { phone: st } });
const OMAP = [-0.9, 0, -0.6], LEONK = [0.5, 0, -0.5];
const gold = { az: 115, el: 16 };

// 304.03–307.30 "Der Wendepunkt – Oma und der Kiez." drone over the old neighbourhood, golden morning
S(304.03, 'kiez', { light: 'golden', lightMod: gold, flash: { n: 6, col: '#ffe8c0' }, cam: [{ at: 0, p: [-60, 26, 24], l: [-40, 3, -8], fov: 48 }, { u: 1, p: [-46, 12, 16], l: [-44, 2, -7], fov: 46, e: 'io' }] });
// 307.30–311.82 "Am nächsten Morgen fährt Leon zu Oma Hilde. In den alten Kiez, wo er aufgewachsen ist." the yellow car rolls in
S(307.3, 'kiez', { light: 'golden', lightMod: gold, cam: [{ at: 0, p: [-38, 0.9, 6.5], l: [-44, 0.8, 0], fov: 42 }, { u: 1, p: [-41, 1.0, 6.5], l: [-48, 1.0, -2], fov: 42, e: 'lin' }],
  w: (c) => ({ kiez: { car: [lerp(-25, -46.5, easeOut(ramp(c.t, 307.3, 310.6))), -1.6, 0] } }), dof: (c) => ({ p: [lerp(-25, -46.5, easeOut(ramp(c.t, 307.3, 310.6))), 0.8, -1.6], c: 4 }),
  act: (c) => c.t > 310.8 ? [leon(c, { expr: 'happy', L: 'wave' }, [-46.0, 0.15, -3.7])] : [] });
// 311.82–315.23 "Er bringt eine Torte mit. Fünfstöckig. Mit Blattgold." cake reveal (tilt up)
S(311.82, 'oma', { light: 'warm', xf: 0.25, cam: [{ at: 0, p: [-0.2, 0.95, 1.1], l: [-0.2, 0.85, -0.0], fov: 38 }, { u: 1, p: [-0.2, 1.55, 1.3], l: [-0.2, 1.45, -0.0], fov: 40, e: 'io' }], w: () => ({ oma: { cake: 1, cups: false } }), dof: { p: [-0.2, 1.2, 0.1], c: 7 },
  fx: (c) => [1.05, 1.6, 2.1, 2.6, 3.0].map((x, i) => (c.lt > x && c.lt < x + 0.6 ? FX('ck' + i + q(c.lt - x, 1), fx.sparkle(q((c.lt - x) / 0.6, 2)), [-0.2 + (i % 2 ? 0.15 : -0.15), 0.9 + i * 0.15, 0.25], 0.35) : null)) });
// 315.23–318.69 "Und einen Blumenstrauß, der kaum durch die Tür passt." squeezing through Oma's door
S(315.23, 'kiez', { light: 'golden', lightMod: gold, cam: hold([-46.3, 1.5, -2.2], [-48, 1.3, -7.0], 42, { creep: 0.06 }), dof: fh([-48, 0.15, -6.9], 8),
  act: (c) => [leon(c, { expr: 'worried', L: 'up', R: 'up', bob: q(Math.abs(Math.sin(c.t * 7)) * 0.02, 3) }, [-48, 0.15, -6.9])],
  fx: (c) => [FX('bq', (g) => { const r = (s) => { let x = Math.sin(s * 91.7) * 1e4; return x - Math.floor(x); }; for (let i = 0; i < 70; i++) { const a = r(i) * Math.PI * 2, d = 240 * Math.sqrt(r(i + 50)); g.beginPath(); g.arc(300 + d * Math.cos(a) * 1.15, 470 + d * Math.sin(a) * 0.9, 34 + 12 * r(i + 9), 0, 7); g.fillStyle = ['#e0385a', '#f6a0c0', '#ffd23a', '#ffffff', '#c05ad8', '#5aa040'][i % 6]; g.fill(); g.lineWidth = 6; g.strokeStyle = '#1a1416'; g.stroke(); } }, [-48 + Math.sin(c.t * 7) * 0.05, 1.5, -6.6], 2.0)] });
// 318.69–320.25 "Oma guckt die Torte an."  320.25–321.86 "Dann guckt sie Leon an."
S(318.69, 'oma', { light: 'warm', cam: cu(OMAP, { d: 1.7, dx: -0.3, fov: 32 }), w: () => ({ oma: { cake: 1, bouquet: 1 } }), dof: fh(OMAP, 12),
  act: (c) => [A(c, OMA, { expr: c.t < 320.25 ? 'shock' : 'neutral', look: c.t < 320.25 ? 0.5 : 1, headTilt: c.t < 320.25 ? 8 : 0, turn: c.t < 320.25 ? 0.2 : 0.4 }, OMAP)] });
// 321.86–324.56 "Und dann umarmt sie ihn einfach. Lange."
S(321.86, 'oma', { light: 'warm', lightMod: { vig: 0.42 }, cam: [{ at: 0, p: [0.3, 1.6, 2.6], l: [-0.1, 1.4, -0.55], fov: 38 }, { u: 1, p: [0.1, 1.55, 1.7], l: [-0.1, 1.42, -0.55], fov: 34, e: 'lin' }], w: () => ({ oma: { cake: 1, bouquet: 1 } }), dof: fh([-0.1, 0, -0.55], 10),
  act: (c) => { const k = easeOut(ramp(c.t, 321.9, 322.5)); return [leon(c, { expr: k < 1 ? 'worried' : 'happy', blink: k >= 1 ? 1 : undefined, L: 'hang', R: k >= 1 ? { x: 120, y: 520 } : 'hang', noShades: 1 }, [lerp(0.5, 0.15, k), 0, -0.6]), A(c, OMA, { expr: k < 1 ? 'happy' : 'happy', blink: k >= 1 ? 1 : undefined, L: k > 0.3 ? { x: 80, y: 500 } : 'hang', R: k > 0.3 ? { x: 560, y: 480 } : 'hang' }, [lerp(-0.9, -0.35, k), 0, -0.45], { order: 3 })]; },
  fx: (c) => c.t > 322.6 ? [0, 1].map((i) => { const k = ((c.t - 322.6) * 0.6 + i * 0.5) % 1; return FX('h' + i + q(k, 1), fx.heart(q(k, 1)), [-0.1 + (i ? 0.35 : -0.35), 2.2 + k * 0.4, -0.4], 0.3); }) : [] });
// 324.56–328.71 "Die Torte hätt's nicht gebraucht, Junge. Du hättest nur kommen müssen."
S(324.56, 'oma', { light: 'warm', cam: cu([-0.9, 0, -0.5], { d: 1.6, dx: -0.25, fov: 32, creep: 0.06 }), w: () => ({ oma: { cake: 1, bouquet: 1 } }), dof: fh([-0.9, 0, -0.5], 12),
  act: (c) => [A(c, OMA, { expr: 'happy', talk: true, look: 0.6, headTilt: 5, L: c.t > 326.8 ? { x: 440, y: 470 } : 'hang' }, [-0.9, 0, -0.5])] });
// 328.71–332.07 "Sie trinken Kaffee aus den alten Tassen mit den Blumen drauf."
S(328.71, 'oma', { light: 'warm', xf: 0.25, cam: [{ at: 0, p: [-0.3, 1.05, 0.95], l: [-0.42, 0.85, 0.35], fov: 32 }, { at: 1.8, p: [-0.35, 1.0, 0.85], l: [-0.44, 0.85, 0.35], fov: 32, e: 'lin' }, { at: 2.1, p: [0.3, 1.55, 2.4], l: [0, 1.05, 0.2], fov: 42, e: 'out' }, { u: 1, p: [0.25, 1.5, 2.2], l: [0, 1.05, 0.2], fov: 42, e: 'lin' }],
  w: () => ({ oma: { bouquet: 1 } }), dof: (c) => (c.lt < 2 ? { p: [-0.45, 0.85, 0.35], c: 10 } : fh([0, -0.14, 0.2], 7)),
  act: (c) => [A(c, OMA, { expr: 'happy', legs: 'sit', R: { x: 420, y: 520 }, holdR: 'mug' }, [-1.0, -0.14, 0.2]), leon(c, { expr: 'happy', legs: 'sit', noShades: 1, L: { x: 180, y: 520 }, holdL: 'mug' }, [1.0, -0.14, 0.2])],
  fx: (c) => [0, 1, 2].map((i) => FX('stm' + i + q((c.t * 0.5 + i / 3) % 1, 1), (g) => { const k = (c.t * 0.5 + i / 3) % 1; g.globalAlpha = Math.sin(k * Math.PI) * 0.8; g.lineWidth = 16; g.strokeStyle = '#ffffff'; g.lineCap = 'round'; g.beginPath(); g.moveTo(300, 800 - k * 300); g.bezierCurveTo(250, 700 - k * 300, 350, 600 - k * 300, 300, 500 - k * 300); g.stroke(); }, [-0.45 + (i - 1) * 0.02, 1.0, 0.35], 0.2)) });
// 332.07–334.21 "Und danach gehen sie zusammen spazieren." tracking walk
S(332.07, 'kiez', { light: 'golden', lightMod: gold, xf: 0.3, cam: (c) => { const x = lerp(-40, -35, ramp(c.t, 332.07, 334.21)); return { p: [x + 0.5, 1.4, 0.5], l: [x, 1.2, -5.4], fov: 40, roll: 0 }; }, dof: (c) => fh([lerp(-40, -35, ramp(c.t, 332.07, 334.21)), 0.15, -5.4], 8),
  act: (c) => { const x = lerp(-40, -35, ramp(c.t, 332.07, 334.21)); return [A(c, OMA, { expr: 'happy', legs: 'walk', step: walkStep(c.t, 1.2), look: 0.7, R: { x: 520, y: 600 } }, [x - 0.55, 0.15, -5.5]), leon(c, { expr: 'happy', noShades: 1, legs: 'walk', step: walkStep(c.t + 0.4, 1.2), look: -0.7, L: { x: 80, y: 600 } }, [x + 0.55, 0.15, -5.3])]; } });
// 334.21–336.40 "Durch die Straßen, in denen Leon als Kind Fußball gespielt hat." the old football
S(334.21, 'kiez', { light: 'golden', lightMod: gold, cam: hold([-29.6, 0.35, -2.6], [-30, 0.25, -3.4], 34, { creep: 0.1 }), dof: { p: [-30, 0.25, -3.4], c: 10 },
  act: (c) => [A(c, KIDS[0], { expr: 'laugh', legs: 'walk', step: walkStep(c.t, 2), L: 'up' }, [-31.5, 0.15, -6.0], { s: 0.6, alpha: 0.5, tint: '#fff0d0' })] });
// 336.40–339.12 "Und jetzt sieht er Sachen, die er früher nie gesehen hat." realisation
S(336.4, 'kiez', { light: 'golden', lightMod: gold, cam: cu([-30, 0.15, -5.4], { d: 1.8, dx: -0.35, fov: 32 }), dof: fh([-30, 0.15, -5.4], 12),
  act: (c) => [leon(c, { expr: c.t < 337.6 ? 'neutral' : 'worried', noShades: 1, look: Math.sin(c.t * 1.5) * 0.8, turn: -0.2 }, [-30, 0.15, -5.4])] });
// 339.12–344.47 "Das Jugendzentrum, in dem er jeden Nachmittag war, hat ein Schild an der Tür:"
S(339.12, 'kiez', { light: 'golden', lightMod: gold, cam: [{ at: 0, p: [-17, 1.6, 2], l: [-22, 1.6, -7.8], fov: 44 }, { u: 1, p: [-20.2, 1.55, -3.2], l: [-21.9, 1.45, -7.8], fov: 40, e: 'lin' }], w: () => ({ kiez: {} }), dof: { p: [-22, 1.5, -7.8], c: 4 },
  act: (c) => [leon(c, { back: true }, [-20.4, 0.15, -4.8]), A(c, OMA, { back: true }, [-19.4, 0.15, -4.6])] });
// 344.47–346.60 "Wegen Geldmangel geschlossen."
S(344.47, 'kiez', { light: 'golden', lightMod: gold, cam: hold([-21.75, 1.45, -6.65], [-21.8, 1.4, -7.68], 40, { creep: 0.15 }), dof: { p: [-21.8, 1.4, -7.68], c: 6 }, shake: [{ at: 0.05, a: 0.01 }] });
// 346.60–348.28 "Der Spielplatz ist kaputt."
S(346.6, 'kiez', { light: 'golden', lightMod: gold, cam: hold([-36.6, 1.0, 17.5], [-39.2, 0.8, 12.7], 40, { creep: 0.1 }), w: () => ({ kiez: {} }), dof: { p: [-39.3, 0.6, 12.75], c: 6 },
  fx: (c) => [FX('crk' + (Math.floor(c.t * 6) % 2), (g, p) => { g.save(); g.translate(0, 200); g.restore(); }, [-39.3, 0.6, 12.75], 0.2)] });
// 348.28–349.84 "Die alte Bäckerei steht leer."
S(348.28, 'kiez', { light: 'golden', lightMod: gold, cam: hold([18.5, 1.7, 0.5], [16, 1.9, -7.8], 42, { creep: 0.06 }), w: () => ({ kiez: {} }) });
// 349.84–352.66 "Und am Imbiss von Kerems Eltern hängt ein Zettel:"
S(349.84, 'kiez', { light: 'golden', lightMod: gold, cam: [{ at: 0, p: [6, 1.7, -1], l: [4, 2.2, -7.8], fov: 44 }, { u: 1, p: [4.8, 1.65, -4.4], l: [4.3, 1.65, -7.66], fov: 40, e: 'io' }], w: () => ({ kiez: { note: 1 } }), dof: { p: [4.4, 1.6, -7.66], c: 4 } });
// 352.66–356.35 "Miete erhöht. Wir schließen Ende des Monats."
S(352.66, 'kiez', { light: 'golden', lightMod: gold, cam: hold([4.42, 1.62, -6.75], [4.4, 1.6, -7.66], 40, { creep: 0.1 }), w: () => ({ kiez: { note: 1 } }), dof: { p: [4.4, 1.6, -7.66], c: 6 } });
// 356.35–360.44 "Leon bleibt stehen. Kerem hat nie was gesagt. Kein Wort." Kerem smiling at work through the glass
S(356.35, 'kiez', { light: 'golden', lightMod: gold, cam: hold([-1.2, 1.75, -2.6], [2.4, 1.4, -7.8], 38, { creep: 0.05 }), w: () => ({ kiez: { note: 1 } }), dof: fh([2.6, 0.0, -7.82], 9),
  act: (c) => [leon(c, { back: true }, [-0.4, 0.15, -4.6]), A(c, KEREM, { expr: 'happy', L: 'wave', look: 0.5 }, [2.6, 0.0, -7.82], { s: 0.92, tint: '#fff0dc' }), A(c, GUESTS[2], { expr: 'happy' }, [1.6, 0.0, -7.84], { s: 0.92, tint: '#fff0dc' })] });
// 360.44–362.19 "Oma nimmt seine Hand."
S(360.44, 'kiez', { light: 'golden', lightMod: gold, cam: med([2.0, 0.15, -5.4], { d: 2.9, dx: -0.4, h: 1.2, ly: 0.95, fov: 38 }), w: () => ({ kiez: { note: 1 } }), dof: fh([2.0, 0.15, -5.4], 8),
  act: (c) => [leon(c, { expr: 'worried', noShades: 1, L: { x: 120, y: 620 } }, [2.45, 0.15, -5.35]), A(c, OMA, { expr: 'happy', R: { x: 470, y: 620 }, look: 0.6 }, [1.55, 0.15, -5.45])] });
// 362.19–365.24 "Weißt du, Leon, Geld ist wie Wasser."
S(362.19, 'kiez', { light: 'golden', lightMod: gold, cam: cu([1.55, 0.15, -5.45], { d: 1.6, dx: -0.3, fov: 32, creep: 0.06 }), w: () => ({ kiez: { note: 1 } }), dof: fh([1.55, 0.15, -5.45], 12),
  act: (c) => [A(c, OMA, { expr: 'happy', talk: true, look: 0.6, L: c.t > 363.5 ? { x: 220, y: 330 } : 'hang' }, [1.55, 0.15, -5.45])] });
// 365.24–368.37 "Wenn du's festhältst, läuft's dir durch die Finger." water through clenched hands
S(365.24, 'kiez', { light: 'golden', lightMod: { ...gold, vig: 0.4 }, xf: 0.2, cam: hold([1.9, 1.35, -3.2], [1.9, 1.15, -4.5], 40, { creep: 0.06 }), w: () => ({ kiez: { note: 1 } }), dof: { p: [1.9, 1.2, -4.5], c: 12 },
  fx: (c) => [FX('hands' + q(clamp(1 - (c.t - 365.4) / 2.8), 2), handsDraw(0, 'cup', q(clamp(1 - (c.t - 365.4) / 2.8), 2)), [1.9, 1.15, -4.5], 1.5), FX('wat' + q(c.t % 1, 2), fx.water(q(c.t % 1, 2)), [1.9, 0.75, -4.48], 1.1)] });
// 368.37–371.23 "Aber wenn du's teilst, wächst was." open hands, a sprout grows
S(368.37, 'kiez', { light: 'golden', lightMod: { ...gold, vig: 0.4 }, cam: hold([1.9, 1.15, -3.2], [1.9, 0.95, -4.5], 40, { creep: 0.06 }), w: () => ({ kiez: { note: 1 } }), dof: { p: [1.9, 1.0, -4.5], c: 12 },
  fx: (c) => [FX('hands2', handsDraw(0, 'open', 0.4), [1.9, 1.55, -4.5], 1.3), FX('spr' + q(easeOut(ramp(c.t, 368.6, 370.6)), 2), sproutDraw(q(easeOut(ramp(c.t, 368.6, 370.6)), 2)), [1.9, 0.55, -4.45], 1.2), c.t > 370.2 ? FX('ss' + q(c.t - 370.2, 1), fx.sparkle(q(clamp((c.t - 370.2) / 0.8), 2)), [1.9, 0.9, -4.4], 0.9) : null] });
// 371.23–374.96 "In dieser Nacht schläft Leon nicht. Er sitzt mit dem Laptop auf dem Boden." (hoodie from here on)
const LAP = [-0.4, -0.5, -1.0];
S(371.23, 'pent', { light: 'sad', lightMod: { sat: 1.0, gain: '#d8e0ff' }, xf: 0.4, cam: [{ at: 0, p: [3.5, 2.6, 3.0], l: [-0.4, 0.4, -0.8], fov: 50 }, { u: 1, p: [1.4, 1.4, 1.6], l: [-0.4, 0.6, -0.9], fov: 42, e: 'io' }], w: () => ({ pent: { night: 1, empty: 1, laptop: 1, laptopStep: 0 } }), dof: fh(LAP, 7),
  act: (c) => [leon(c, { expr: 'determined', legs: 'sit', L: { x: 260, y: 640 }, R: { x: 340, y: 640 } }, LAP, { tint: '#b8c8f0' })] });
// 374.96–376.25 "Und er fängt an." typing, screen
S(374.96, 'pent', { light: 'sad', lightMod: { sat: 1.0 }, cam: hold([-0.32, 0.42, -0.1], [-0.4, 0.13, -0.58], 40, { creep: 0.15 }), w: (c) => ({ pent: { night: 1, empty: 1, laptop: 1, laptopStep: q(ramp(c.t, 375.2, 376.25) * 0.9, 2) } }), dof: { p: [-0.4, 0.13, -0.58], c: 9 } });
// 376.25–380.58 "Das Jugendzentrum: renoviert und für zwanzig Jahre bezahlt." scaffold -> open, kids run in
S(376.25, 'kiez', { light: 'day', lightMod: { az: 140 }, flash: { n: 4 }, cam: [{ at: 0, p: [-18.5, 1.8, 1.0], l: [-22, 2.0, -7.8], fov: 46 }, { u: 1, p: [-19.5, 1.7, -0.5], l: [-22, 2.0, -7.8], fov: 44, e: 'lin' }],
  w: (c) => ({ kiez: { jzOpen: c.t > 378.0, scaffold: c.t < 378.0 } }), flashEnd: undefined, shake: [{ at: 1.75, a: 0.015 }],
  act: (c) => c.t > 378.3 ? KIDS.map((k, i) => A(c, k, { expr: 'laugh', legs: 'walk', step: walkStep(c.t + i * 0.3, 2.2), L: 'up' }, [lerp(-17 + i * 0.9, -21.6 + i * 0.3, ramp(c.t, 378.3 + i * 0.2, 380.4)), 0.15, -5.6 + (i % 2) * 0.5], { s: 0.62, flip: true })) : [],
  fx: (c) => c.t > 377.9 && c.t < 378.8 ? [FX('jz' + q(c.t - 377.9, 1), fx.sparkle(q((c.t - 377.9) / 0.9, 2)), [-22, 2.2, -7.4], 4.5)] : [] });
// 380.58–385.13 "Das Haus, in dem der Imbiss ist: gekauft. Miete: halbiert." the note flies away
S(380.58, 'kiez', { light: 'day', cam: [{ at: 0, p: [5.2, 1.8, -2.4], l: [4.2, 1.8, -7.6], fov: 42 }, { u: 1, p: [5.0, 1.75, -3.0], l: [4.2, 1.9, -7.6], fov: 42, e: 'lin' }], w: (c) => ({ kiez: { note: 1, noteFly: c.t > 382.6 ? q(easeOut(ramp(c.t, 382.6, 384.2)), 3) : 0 } }), dof: fh([5.4, 0.15, -6.3], 6),
  act: (c) => [A(c, KEREM, { expr: c.t < 383.5 ? 'neutral' : 'shock', blink: c.t > 383.5 ? 0 : undefined, L: c.t > 383.5 ? 'up' : 'hang' }, [5.6, 0.15, -6.4]), A(c, MOTHER, { expr: c.t < 383.5 ? 'happy' : 'laugh', R: c.t > 383.7 ? 'up' : 'hang', holdR: undefined }, [6.6, 0.15, -6.7])],
  fx: (c) => c.t > 383.6 && c.t < 384.4 ? [FX('kb' + q(c.t, 1), fx.bang(q((c.t - 383.6) / 0.8, 2)), [5.2, 2.6, -6.2], 0.45)] : [] });
// 385.13–388.07 "Das Kinderkrankenhaus kriegt eine neue Station."
S(385.13, 'hosp', { light: 'hosp', xf: 0.3, cam: [{ at: 0, p: [4.5, 2.8, 4.2], l: [0, 1.2, -3], fov: 52 }, { u: 1, p: [3.2, 2.2, 3.4], l: [0, 1.4, -3], fov: 50, e: 'lin' }],
  act: (c) => [A(c, NURSE, { expr: 'laugh', L: 'up', R: 'wave' }, [2.0, 0, -0.6]), A(c, KIDS[1], { expr: 'laugh', L: 'up' }, [-1.2, 0, 0.0], { s: 0.62 }), A(c, KIDS[3], { expr: 'goofy', R: 'up' }, [0.4, 0, 0.4], { s: 0.62 })],
  fx: (c) => [FX('cnf' + q((c.t - 385.13) / 3, 2), fx.confetti(q((c.t - 385.13) / 3, 2), 4), [0.5, 2.0, 0.0], 4)] });
// 388.07–391.08 "In jedem Briefkasten der Straße liegt ein Umschlag:"
S(388.07, 'kiez', { light: 'day', cam: [{ at: 0, p: [31.2, 1.55, -4.6], l: [29.5, 1.5, -7.6], fov: 40 }, { u: 1, p: [30.6, 1.5, -5.2], l: [29.5, 1.5, -7.6], fov: 40, e: 'lin' }], w: (c) => ({ kiez: { env: easeOut(ramp(c.t, 388.2, 390.8)) } }), dof: { p: [29.5, 1.5, -7.6], c: 6 } });
// 391.08–394.62 "Ihre Miete ist für ein Jahr bezahlt." Ohne Absender.
S(391.08, 'kiez', { light: 'day', cam: hold([29.5, 1.5, -5.6], [29.5, 1.45, -6.9], 40, { creep: 0.08 }), w: () => ({ kiez: { env: 1 } }), dof: { p: [29.5, 1.45, -6.9], c: 10 },
  fx: (c) => [FX('letter', (g) => { g.save(); g.translate(300, 500); g.rotate(-0.04); g.fillStyle = '#fffdf4'; g.fillRect(-270, -190, 540, 380); g.lineWidth = 10; g.strokeStyle = '#1a1416'; g.strokeRect(-270, -190, 540, 380); g.strokeStyle = '#d8d0c0'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-230, -120 + i * 52); g.lineTo(230, -120 + i * 52); g.stroke(); }
    g.fillStyle = '#1a2a5a'; g.font = 'bold 44px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Ihre Miete ist für', 0, -40); g.fillText('ein Jahr bezahlt.', 0, 30);
    g.fillStyle = '#e8304a'; g.beginPath(); g.moveTo(0, 125); g.bezierCurveTo(0, 95, 40, 95, 40, 125); g.bezierCurveTo(40, 150, 0, 165, 0, 175); g.bezierCurveTo(0, 165, -40, 150, -40, 125); g.bezierCurveTo(-40, 95, 0, 95, 0, 125); g.fill(); g.restore(); }, [29.5, 1.45 + Math.sin(c.t * 2) * 0.01, -6.9], 0.75)] });
// 394.62–397.72 "Der Sportwagen? Verkauft." onto the transporter
S(394.62, 'city', { light: 'day', flash: { n: 3 }, cam: hold([-6, 1.6, 12], [3, 1.6, 3], 44, { creep: 0.04 }), w: (c) => { const x = lerp(-2, 22, easeIn(ramp(c.t, 395.6, 397.7))); return { city: { truck: x, car1: [x - 1.5, 3, 0, 1.2], car2: null } }; } });
// 397.72–398.69 "Das Penthouse? Verkauft." door closes on the empty penthouse
S(397.72, 'pent', { light: 'day', flash: { n: 3 }, cam: hold([-5, 2.4, 2.8], [6, 1.2, -1.6], 48, { creep: 0.03 }), w: (c) => ({ pent: { empty: 1, door: 1 - easeOut(ramp(c.t, 397.9, 398.5)) } }),
  act: (c) => c.t < 398.2 ? [leon(c, { back: true }, [8.6, 0, -1.3])] : [] });
// 398.69–401.34 "Die goldene Toilette? Steht jetzt im Museum."
S(398.69, 'museum', { light: 'museum', flash: { n: 3 }, cam: [{ at: 0, p: [0.5, 1.5, 4.2], l: [0, 1.4, -2], fov: 40 }, { u: 1, p: [0.3, 1.6, 3.2], l: [0, 1.5, -2], fov: 38, e: 'lin' }], dof: { p: [0, 1.4, -2], c: 5 },
  fx: (c) => [FX('ms' + q((c.t - 398.7) % 1, 1), fx.sparkle(q((c.t - 398.7) % 1, 2)), [0, 1.6, -1.8], 1.0)] });
// 401.34–404.39 "Am Ende der Woche guckt Leon auf sein Konto. 43 Euro."
S(401.34, 'void', { light: 'phone', cam: [{ at: 0, p: [0, 1.5, 0.5], l: [0, 1.5, 0], fov: 40 }, { at: 1.8, p: [0, 1.5, 0.48], l: [0, 1.5, 0], fov: 40 }, { at: 2.1, p: [0, 1.56, 0.26], l: [0, 1.56, 0], fov: 36, e: 'out' }, { u: 1, p: [0, 1.56, 0.24], l: [0, 1.56, 0], fov: 36, e: 'lin' }],
  w: () => phoneW({ mode: 'bank', amount: '43,00 €', clock: '09:12' }), dof: { p: [0, 1.55, 0], c: 5 } });
// 404.39–407.93 "Und zum ersten Mal seit einem Monat lächelt er wieder richtig." back in the little flat, morning sun
S(404.39, 'apt', { light: 'room', lightMod: { sun: '#ffe0b0', sunI: 1.8, gain: '#fff2e0' }, xf: 0.35, cam: cu([0.9, 0, -1.2], { d: 1.9, dx: -0.4, fov: 34, creep: 0.1 }), w: () => ({ apt: { shaft: 1 } }), dof: fh([0.9, 0, -1.2], 12),
  act: (c) => [leon(c, { expr: c.t < 405.6 ? 'neutral' : 'happy', look: -0.3, R: { x: 345, y: 520 }, holdR: 'phone', screenCol: '#7ad0ff' }, [0.9, 0, -1.2])],
  fx: (c) => c.t > 405.8 ? [FX('sm' + q(clamp((c.t - 405.8) / 0.7), 2), fx.sparkle(q(clamp((c.t - 405.8) / 0.7), 2), '#fff6c8'), [0.7, 1.8, -1.1], 0.6)] : [] });
