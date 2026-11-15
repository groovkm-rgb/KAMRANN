// shots4.js: 6 Der Anruf (6:48–8:28) + 7 Das Ende (8:28–9:57)
import { S, A, FX, fx, hold, burst, lerp, lerp3, ramp, smooth, easeOut, clamp, q, pulse, LEON, KEREM, OMA, HAHN, GREY, GIRL, MOTHER, NURSE, BUSWOMAN, SKATER, KIDS, GUESTS, cu, med, fh, walkStep, bobW, leon, HEAD } from './shots_h.js';
import * as TT from './toon.js';
import { drawDanke } from './sets3.js';

const phoneW = (st) => ({ void: { phone: st } });
const HAHN_S = 1.08;
const hahn = (c, o, pos, ex = {}) => A(c, HAHN, o, pos, { s: HAHN_S, ...ex });
const kerem = (c, o, pos, ex) => A(c, KEREM, o, pos, ex);
const DESK_H = [0, -0.16, -3.55]; // von Hahn seated behind the desk
const LO = [-0.75, 0, 0.4], KO = [0.75, 0, 0.5]; // Leon / Kerem in the office
const danke = (k = 1) => (g) => { g.save(); g.translate(300, 500); g.scale(1.2, 1.2); g.translate(-210, -150); drawDanke(g, 420, 300); g.restore(); };

// ======================= DER ANRUF =======================
// 407.93–410.95 "Der Anruf. Am Montag klingelt das Handy. Unbekannte Nummer."
S(407.93, 'void', { light: 'phone', flash: { n: 5 }, cam: (c) => { const b = Math.sin(c.t * 70) * 0.004; return { p: [b, 1.5, 0.5 - ramp(c.t, 407.9, 410.9) * 0.08], l: [b * 0.5, 1.5, 0], fov: 40, roll: Math.sin(c.t * 60) * 0.8 }; },
  w: (c) => phoneW({ mode: 'call', pulse: q(Math.abs(Math.sin(c.t * 5)), 1), clock: '08:03' }), dof: { p: [0, 1.5, 0], c: 5 },
  fx: (c) => [FX('vib' + (Math.floor(c.t * 10) % 2), fx.shake(0), [0, 1.5, 0.02], 0.55)] });
// 410.95–415.59 "Herr Becker? Hier ist Ihre Bank. Es tut uns sehr leid, aber… es gab einen Fehler."
S(410.95, 'apt', { light: 'room', cam: [{ at: 0, p: [-0.4, 1.6, 2.4], l: [0.6, 1.35, -1.2], fov: 42 }, { u: 1, p: [0.1, 1.6, 1.0], l: [0.6, 1.42, -1.2], fov: 38, e: 'lin' }], w: () => ({ apt: { shaft: 1 } }), dof: fh([0.6, 0, -1.2], 9),
  act: (c) => [leon(c, { expr: 'neutral', look: 0.3, R: { x: 410, y: 290 }, holdR: 'phone', screenCol: '#7ad0ff', L: 'hip' }, [0.6, 0, -1.2])] });
// 415.59–418.02 "Leon grinst. 'Ich weiß.'"
S(415.59, 'apt', { light: 'room', cam: burst([0.85, 1.6, 0.9], [0.75, 1.58, 0.5], [0.6, 1.5, -1.2], 32, { dur: 0.3 }), w: () => ({ apt: { shaft: 1 } }), dof: fh([0.6, 0, -1.2], 13),
  act: (c) => [leon(c, { expr: 'sly', talk: c.t > 416.8 && c.t < 417.4, look: 0.3, R: { x: 410, y: 290 }, holdR: 'phone', screenCol: '#7ad0ff' }, [0.6, 0, -1.2])],
  fx: (c) => c.t > 416.3 ? [FX('sp' + q(c.t - 416.3, 1), fx.sparkle(q(clamp((c.t - 416.3) / 0.6), 2)), [0.25, 1.95, -1.1], 0.35)] : [] });
// 418.02–420.55 "Eine Stunde später klopft es an der Tür."
const KNOCK = [418.6, 418.85, 419.1];
S(418.02, 'apt', { light: 'room', cam: hold([0.4, 1.5, 0.9], [2.3, 1.3, -0.85], 44, { creep: 0.05 }), w: () => ({ apt: { shaft: 1 } }), shake: KNOCK.map((x) => ({ at: x - 418.02, a: 0.012 })), dof: { p: [2.3, 1.3, -0.85], c: 6 },
  act: (c) => [leon(c, { expr: c.t < 418.6 ? 'neutral' : 'shock', look: 1, turn: 0.5 }, [0.0, 0, -1.4])],
  fx: (c) => KNOCK.map((x, i) => (c.t > x && c.t < x + 0.35 ? FX('kn' + i + q(c.t - x, 1), fx.pop(q((c.t - x) / 0.35, 2)), [2.25, 1.45, -0.85], 0.6) : null)) });
// 420.55–424.34 "Die zwei Männer in den grauen Anzügen. Endlich ohne Zeitung."
S(420.55, 'apt', { light: 'room', cam: hold([0.3, 1.45, -0.6], [3.4, 1.55, -0.85], 46, { creep: 0.05 }), w: (c) => ({ apt: { door: easeOut(ramp(c.t, 420.6, 421.2)) } }), dof: fh([3.4, 0, -0.85], 8),
  act: (c) => [A(c, GREY, { expr: 'neutral', holdR: undefined, R: 'hang', L: 'hang' }, [3.4, 0, -1.25]), A(c, GREY, { expr: 'neutral', holdR: undefined, R: 'hang', L: 'hang', seed: 2 }, [3.45, 0, -0.35])] });
// 424.34–427.73 "Herr Becker, Sie müssen mitkommen. Unser Mandant möchte Sie sprechen."
S(424.34, 'apt', { light: 'room', lightMod: { vig: 0.45 }, cam: hold([2.3, 0.75, -0.85], [3.4, 1.7, -0.8], 50, { creep: 0.05, roll: -4 }), w: () => ({ apt: { door: 1 } }), dof: fh([3.4, 0, -0.8], 6),
  act: (c) => [A(c, GREY, { expr: 'neutral', talk: true, holdR: undefined, R: 'hang' }, [3.4, 0, -1.25]), A(c, GREY, { expr: 'neutral', talk: true, holdR: undefined, R: 'hang', seed: 2 }, [3.45, 0, -0.35])] });
// 427.73–430.00 "Ihr Mandant ist Konstantin von Hahn." up the glass tower
S(427.73, 'city', { light: 'day', lightMod: { gain: '#eef4ff' }, xf: 0.25, cam: [{ at: 0, p: [52, 2, -12], l: [70, 40, -40], fov: 50 }, { u: 1, p: [40, 110, -6], l: [70, 125, -40], fov: 46, e: 'io' }] });
// 430.00–432.96 "Einer der reichsten Männer des Landes." von Hahn at the window turns around
S(430.0, 'office', { light: 'office', cam: [{ at: 0, p: [-3.6, 1.6, -1.0], l: [0.6, 1.6, -6.0], fov: 40 }, { u: 1, p: [-2.4, 1.65, -2.6], l: [0.6, 1.65, -6.0], fov: 38, e: 'lin' }], w: () => ({ office: { noChair: 1 } }), dof: fh([0.6, 0, -6.0], 8, HAHN_S),
  act: (c) => [hahn(c, c.t < 431.1 ? { back: true } : { expr: 'determined', look: -0.3 }, [0.6, 0, -6.0])] });
// 432.96–436.80 "Die Milliarde war seine. Eigentlich sollte sie an eine Werft gehen. Für seine vierte Yacht."
S(432.96, 'office', { light: 'office', cam: [{ at: 0, p: [-6.2, 2.2, -5.6], l: [-8.88, 2.2, -2.6], fov: 44 }, { at: 2.2, p: [-6.2, 2.2, -1.4], l: [-8.88, 2.2, -2.0], fov: 44, e: 'lin' }, { at: 2.5, p: [3.9, 1.65, -5.4], l: [4.0, 1.6, -6.8], fov: 40, e: 'out' }, { u: 1, p: [3.95, 1.62, -5.6], l: [4.0, 1.6, -6.8], fov: 40, e: 'lin' }],
  dof: (c) => (c.lt < 2.4 ? { p: [-8.88, 2.2, -2.6], c: 4 } : { p: [4, 1.6, -6.8], c: 8 }) });
// 436.80–441.05 "Aber ein Bankmitarbeiter hat sich bei der Kontonummer um eine einzige Zahl vertippt."
S(436.8, 'void', { light: 'phone', lightMod: { hemi: 0.6 }, cam: [{ at: 0, p: [20.3, 1.3, 1.3], l: [20, 1.1, -0.27], fov: 40 }, { u: 1, p: [20.05, 1.2, 0.55], l: [19.95, 1.1, -0.27], fov: 36, e: 'lin' }],
  w: (c) => ({ void: { bank: c.t < 438.8 ? 1 : c.t < 440.0 ? 2 : 3 } }), dof: { p: [20, 1.1, -0.27], c: 7 }, shake: [{ at: 2.0, a: 0.012 }],
  fx: (c) => c.t > 438.8 && c.t < 439.4 ? [FX('bg' + q(c.t, 1), fx.bang(q((c.t - 438.8) / 0.6, 2)), [20.33, 1.32, -0.2], 0.12)] : [] });
// 441.05–441.90 push into the wrong digit ... 441.90–443.20 "Und diese eine Zahl war Leon."
S(441.05, 'void', { light: 'phone', lightMod: { hemi: 0.6 }, cam: [{ at: 0, p: [20.15, 1.13, 0.3], l: [20.15, 1.12, -0.27], fov: 36 }, { u: 1, p: [20.17, 1.12, -0.12], l: [20.17, 1.12, -0.27], fov: 30, e: 'in' }], w: () => ({ void: { bank: 3 } }), dof: { p: [20.17, 1.12, -0.27], c: 6 }, flashEnd: { n: 4 } });
S(441.9, 'apt', { light: 'room', flash: { n: 4 }, cam: cu([0.6, 0, -1.2], { d: 1.7, dx: 0.2, fov: 34 }), w: () => ({ apt: { shaft: 1 } }), dof: fh([0.6, 0, -1.2], 12),
  act: (c) => [leon(c, { expr: 'goofy', R: { x: 330, y: 470 }, L: 'hang' }, [0.6, 0, -1.2])],
  fx: (c) => [FX('dg', (g) => { g.font = '900 420px "DejaVu Sans Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 22; g.strokeStyle = '#1a1416'; g.strokeText('9', 300, 520); g.fillStyle = '#e0383a'; g.fillText('9', 300, 520); }, [1.15, 1.95, -1.1], 0.55)] });
// 443.20–446.23 "Von Hahns Büro ist ganz oben in einem Glasturm."
S(443.2, 'city', { light: 'day', lightMod: { gain: '#eef4ff', sat: 1.0 }, cam: [{ at: 0, p: [46, 60, 0], l: [70, 90, -40], fov: 46 }, { u: 1, p: [52, 130, -14], l: [70, 128, -40], fov: 42, e: 'io' }] });
// 446.23–447.46 "Alles weiß, alles kalt."
S(446.23, 'office', { light: 'office', cam: hold([7, 3.2, 6], [-1, 1.0, -3], 54, { creep: 0.05 }), w: () => ({ office: { folder: true } }),
  act: (c) => [hahn(c, { expr: 'determined', legs: 'sit' }, DESK_H), leon(c, { back: true }, LO), kerem(c, { back: true }, KO)] });
// 447.46–449.55 "Er sitzt hinter einem riesigen Schreibtisch und guckt Leon an,"
S(447.46, 'office', { light: 'office', cam: hold([0.0, 0.55, 3.3], [0, 1.35, -3.5], 48, { creep: 0.04 }), w: () => ({ office: { folder: true } }), dof: fh(DESK_H, 5, HAHN_S),
  act: (c) => [hahn(c, { expr: 'determined', legs: 'sit', look: 0 }, DESK_H), leon(c, { back: true }, LO), kerem(c, { back: true }, KO)] });
// 449.55–452.57 "als wäre er ein Fleck auf seinem Anzug."
S(449.55, 'office', { light: 'office', cam: cu(DESK_H, { s: HAHN_S, d: 2.0, dx: 0.2, fov: 30, creep: 0.06 }), w: () => ({ office: { folder: true } }), dof: fh(DESK_H, 13, HAHN_S),
  act: (c) => [hahn(c, { expr: 'angry', legs: 'sit', headTilt: 6, look: -0.2, mouth: 'wavy', L: c.t > 450.8 ? { x: 250, y: 400 } : 'hang' }, DESK_H)] });
// 452.57–455.90 "Wo. Ist. Mein. Geld?" four punch-ins
const WORDS = [452.57, 453.03, 454.29, 455.3];
S(452.57, 'office', { light: 'office', lightMod: { vig: 0.5, gain: '#f4f0ff' }, cam: (c) => { const i = WORDS.filter((x) => c.t >= x).length - 1, d = [2.6, 2.1, 1.7, 1.3][Math.max(0, i)], hy = DESK_H[1] + HEAD * HAHN_S; const lt = c.t - (WORDS[Math.max(0, i)] ?? 452.57); return { p: [0.05 + lt * 0.03, hy + 0.03, DESK_H[2] + d - lt * 0.12], l: [0, hy, DESK_H[2]], fov: 30, roll: [0, -2, 2, -3][Math.max(0, i)] - lt * 1.5 }; },
  w: () => ({ office: { folder: true } }), shake: WORDS.map((x) => ({ at: x - 452.57, a: 0.02 })), dof: fh(DESK_H, 13, HAHN_S),
  act: (c) => [hahn(c, { expr: 'angry', legs: 'sit', talk: WORDS.some((x) => c.t > x && c.t < x + 0.35) }, DESK_H)] });
// 455.90–456.59 "Leon schluckt."
S(455.9, 'office', { light: 'office', cam: cu(LO, { d: 1.6, dx: 0.2, fov: 32 }), dof: fh(LO, 12),
  act: (c) => [leon(c, { expr: 'scared', look: -0.4 }, LO)], fx: (c) => [FX('sw' + q((c.t - 455.9) / 0.7, 1), fx.sweat(q(clamp((c.t - 455.9) / 0.7), 2)), [-0.35, 1.9, 0.45], 0.3)] });
// 456.59–460.94 "Kerem steht neben ihm. Er ist mitgekommen. Natürlich ist er mitgekommen."
S(456.59, 'office', { light: 'office', cam: [{ at: 0, p: [-0.55, 1.6, 2.2], l: [-0.6, 1.5, 0.4], fov: 34 }, { at: 1.2, p: [0.6, 1.6, 2.3], l: [0.6, 1.5, 0.5], fov: 34, e: 'io' }, { u: 1, p: [0.55, 1.6, 2.05], l: [0.62, 1.5, 0.5], fov: 33, e: 'lin' }], dof: (c) => fh(c.lt < 0.8 ? LO : KO, 10),
  act: (c) => [leon(c, { expr: 'worried', look: 0.6 }, LO), kerem(c, { expr: c.t < 459 ? 'determined' : 'sly', look: -0.4, L: c.t > 459.2 ? 'thumb' : 'hang' }, KO)] });
// 460.94–462.98 "Ich kann's Ihnen zeigen", sagt Leon.
S(460.94, 'office', { light: 'office', cam: hold([-1.4, 1.45, 2.0], [-0.75, 1.55, 0.4], 34, { creep: 0.06 }), dof: fh(LO, 12),
  act: (c) => [leon(c, { expr: 'determined', talk: c.t < 461.9, turn: 0.3, R: c.t > 461.2 ? 'point' : 'hang' }, LO)] });
// 462.98–466.40 "Und so sitzt einer der reichsten Männer Deutschlands eine halbe Stunde später im Bus."
S(462.98, 'kiez', { light: 'day', xf: 0.3, cam: hold([14, 1.2, 12], [24, 1.8, 4.6], 46, { creep: 0.04 }), w: (c) => ({ kiez: { jzOpen: 1, bus: { x: lerp(55, 24, easeOut(ramp(c.t, 463.0, 466.2))) } } }), dof: { p: [24, 1.5, 4.6], c: 3 } });
// 466.40–468.72 "Linie 47." the sign
S(466.4, 'kiez', { light: 'day', cam: hold([26.2, 1.15, 8.6], [26.0, 0.95, 5.9], 40, { creep: 0.08 }), w: () => ({ kiez: { jzOpen: 1, bus: { x: 24 } } }), dof: { p: [26, 0.95, 5.9], c: 6 } });
// 468.72–473.10 "Zwischen einer Frau mit Einkaufswagen und einem Jungen mit Skateboard."
const trolley = (g) => { g.fillStyle = '#c84a6a'; g.fillRect(190, 420, 220, 330); g.lineWidth = 12; g.strokeStyle = '#1a1416'; g.strokeRect(190, 420, 220, 330); g.fillStyle = '#e86a8a'; for (let i = 0; i < 4; i++) g.fillRect(200, 460 + i * 70, 200, 20); g.beginPath(); g.moveTo(300, 420); g.lineTo(300, 300); g.lineTo(380, 300); g.stroke(); g.beginPath(); g.arc(230, 790, 34, 0, 7); g.arc(370, 790, 34, 0, 7); g.fillStyle = '#1a1416'; g.fill(); g.fillStyle = '#5aa040'; g.beginPath(); g.arc(260, 410, 30, 0, 7); g.fill(); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(330, 400, 26, 0, 7); g.fill(); };
const skate = (g) => { g.save(); g.translate(300, 500); g.rotate(-1.35); g.fillStyle = '#2ab0e0'; g.beginPath(); g.roundRect(-220, -40, 440, 80, 40); g.fill(); g.lineWidth = 12; g.strokeStyle = '#1a1416'; g.stroke(); g.fillStyle = '#ffd23a'; for (const x of [-140, 140]) { g.beginPath(); g.arc(x, 60, 26, 0, 7); g.fill(); g.stroke(); } g.restore(); };
const BUSP = { w: [-0.95, 0, -0.45], h: [0.05, 0, -0.3], k: [1.0, 0, -0.45] };
S(468.72, 'bus', { light: 'day', cam: [{ at: 0, p: [0.0, 1.55, 1.15], l: [0, 1.35, -0.4], fov: 56 }, { u: 1, p: [0.0, 1.5, 0.95], l: [0, 1.4, -0.4], fov: 54, e: 'lin' }], w: () => ({ bus: { speed: 0.08 } }), dof: fh(BUSP.h, 6, HAHN_S),
  act: (c) => [A(c, BUSWOMAN, { expr: 'happy', talk: c.t < 470.5, look: 0.6, L: { x: 120, y: 620 } }, BUSP.w), hahn(c, { expr: 'angry', R: { x: 470, y: 160 }, L: 'hip', mouth: 'wavy' }, BUSP.h), A(c, SKATER, { expr: 'goofy', look: -0.6, R: { x: 470, y: 600 } }, BUSP.k), leon(c, { expr: 'happy', back: true }, [-0.6, 0, 0.75], { s: 1 }), kerem(c, { back: true }, [0.75, 0, 0.75])],
  fx: (c) => [FX('trl', trolley, [-1.45, 0.45, -0.3], 0.8), FX('skt', skate, [1.55, 0.6, -0.3], 0.75)] });
// 473.10–475.35 "Er hält sich angeekelt an der Stange fest."
S(473.1, 'bus', { light: 'day', cam: cu([0.05, 0, -0.3], { s: HAHN_S, d: 1.6, dx: -0.2, fov: 32, creep: 0.05 }), w: () => ({ bus: { speed: 0.08 } }), dof: fh(BUSP.h, 12, HAHN_S),
  act: (c) => [hahn(c, { expr: 'angry', mouth: 'wavy', R: { x: 470, y: 160 }, headTilt: q(Math.sin(c.t * 1.7) * 4, 1), look: 0.5 }, BUSP.h, { roll: Math.sin(c.t * 1.7) * 0.02 })],
  fx: (c) => [FX('stk' + (Math.floor(c.t * 3) % 2), (g) => { g.lineWidth = 10; g.strokeStyle = '#6ab04a'; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(240 + i * 60, 700 - (Math.floor(c.t * 3) % 2) * 20); g.bezierCurveTo(220 + i * 60, 600, 280 + i * 60, 550, 250 + i * 60, 450); g.stroke(); } }, [0.25, 1.1, -0.2], 0.45)] });
// 475.35–480.74 "Leon zeigt ihm alles. Das Jugendzentrum, in dem jetzt dreißig Kinder Tischtennis spielen."
S(475.35, 'kiez', { light: 'day', xf: 0.3, cam: [{ at: 0, p: [-18.6, 1.6, 1.4], l: [-22, 1.2, -5.5], fov: 46 }, { u: 1, p: [-19.4, 1.5, 0.6], l: [-22, 1.3, -5.5], fov: 44, e: 'lin' }], w: () => ({ kiez: { jzOpen: 1, pingpong: 1 } }),
  act: (c) => { const out = []; [[-24.2, -5.4], [-22.4, -5.6], [-21.8, -4.1], [-20.0, -5.4]].forEach(([x, z], i) => out.push(A(c, KIDS[i], { expr: i % 2 ? 'laugh' : 'goofy', R: 'up', L: 'reach', bob: q(Math.abs(Math.sin(c.t * 7 + i)) * 0.03, 3) }, [x, 0.15, z], { s: 0.62, flip: i % 2 === 1 }))); out.push(leon(c, { expr: 'happy', R: 'point' }, [-18.3, 0.15, -3.6]), hahn(c, { expr: 'neutral', look: -0.6 }, [-17.2, 0.15, -3.9]), kerem(c, { expr: 'happy' }, [-16.2, 0.15, -3.5])); return out; },
  fx: (c) => [0, 1].map((i) => { const k = (c.t * 1.6 + i * 0.5) % 1; return FX('ball' + i + q(k, 2), (g) => { g.beginPath(); g.arc(300, 500, 120, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 24; g.strokeStyle = '#1a1416'; g.stroke(); }, [-23.6 + i * 3.2 + lerp(-0.6, 0.6, k), 1.05 + Math.sin(k * Math.PI) * 0.4, -4.9], 0.06); }) });
// 480.74–482.80 "Den Imbiss, in dem Kerems Mutter gerade Fladenbrot backt"
S(480.74, 'imbiss', { light: 'warm', xf: 0.25, cam: hold([-1.6, 1.5, -0.2], [-2.55, 1.2, -1.75], 40, { creep: 0.06 }), dof: fh([-2.3, 0, -1.4], 10),
  act: (c) => [A(c, MOTHER, { expr: 'happy', R: { x: 500, y: 560 }, holdR: 'pide', L: 'reach' }, [-2.3, 0, -1.4])],
  fx: (c) => [FX('G:ov', fx.glowDot(0.7, '255,150,70'), [-2.6, 0.9, -1.9], 1.0)] });
// 482.80–485.97 "...und von Hahn sofort einen Tee in die Hand drückt."
S(482.8, 'imbiss', { light: 'warm', cam: med([0.0, 0, 0.3], { d: 3.2, dx: 0.3, h: 1.55, ly: 1.4, fov: 40 }), dof: fh([0.0, 0, 0.3], 8),
  act: (c) => { const give = c.t > 483.6; return [A(c, MOTHER, { expr: 'laugh', R: give ? { x: 560, y: 520 } : 'hang', holdR: give && c.t < 484.4 ? 'tea' : undefined }, [-0.75, 0, 0.2]), hahn(c, { expr: c.t < 484.4 ? 'shock' : 'neutral', L: c.t > 484.4 ? { x: 120, y: 540 } : 'hang', holdL: c.t > 484.4 ? 'tea' : undefined }, [0.6, 0, 0.35])]; } });
// 485.97–488.00 "Die neue Station im Kinderkrankenhaus."
S(485.97, 'hosp', { light: 'hosp', xf: 0.25, cam: [{ at: 0, p: [4.5, 2.4, 4.6], l: [0, 1.2, -2], fov: 50 }, { u: 1, p: [3.8, 2.1, 4.0], l: [0, 1.2, -2], fov: 48, e: 'lin' }],
  act: (c) => [hahn(c, { expr: 'neutral' }, [1.4, 0, 1.4]), leon(c, { expr: 'happy' }, [2.6, 0, 1.6]), kerem(c, { expr: 'happy' }, [3.6, 0, 1.8]), A(c, NURSE, { expr: 'happy', L: 'wave' }, [-2.8, 0, -1.2]), A(c, KIDS[1], { expr: 'happy' }, [-3.6, 0, -1.6], { s: 0.6 })] });
// 488.00–492.28 "Dort kommt ein kleines Mädchen auf von Hahn zu. Mit einer Infusion am Arm."
S(488.0, 'hosp', { light: 'hosp', cam: [{ at: 0, p: [2.4, 1.0, 3.6], l: [-0.2, 0.9, 0.6], fov: 42 }, { u: 1, p: [2.0, 0.95, 3.0], l: [0.3, 0.85, 0.7], fov: 40, e: 'lin' }],
  w: (c) => ({ hosp: { iv: [lerp(-2.6, -0.1, ramp(c.t, 488.1, 491.5)) - 0.38, 0.75] } }), dof: (c) => fh([lerp(-2.6, -0.1, ramp(c.t, 488.1, 491.5)), 0, 0.8], 8, 0.6),
  act: (c) => { const k = ramp(c.t, 488.1, 491.5), w = k < 1; return [A(c, GIRL, { expr: 'happy', legs: w ? 'walk' : 'stand', step: walkStep(c.t, 1.3), L: { x: 120, y: 520 }, R: { x: 430, y: 560 }, holdR: 'drawing' }, [lerp(-2.6, -0.1, k), 0, 0.8], { s: 0.62 }), hahn(c, { expr: 'neutral', look: -0.8 }, [1.4, 0, 0.6])]; } });
// 492.28–493.56 "Sie gibt ihm ein Bild."
S(492.28, 'hosp', { light: 'hosp', cam: hold([0.7, 0.95, 2.4], [0.6, 0.95, 0.7], 38, { creep: 0.06 }), w: () => ({ hosp: { iv: [-0.48, 0.75] } }), dof: { p: [0.6, 0.95, 0.7], c: 10 },
  act: (c) => [A(c, GIRL, { expr: 'happy', R: { x: 560, y: 380 }, holdR: c.t < 493.1 ? 'drawing' : undefined, look: 1 }, [-0.1, 0, 0.8], { s: 0.62 }), hahn(c, { expr: 'neutral', look: -0.8, L: c.t > 492.9 ? { x: 60, y: 600 } : 'hang', holdL: c.t > 493.1 ? 'drawing' : undefined }, [1.4, 0, 0.6])] });
// 493.56–497.69 "Darauf: ein Mann mit Krawatte, ein großes Herz und das Wort 'Danke'." the drawing
S(493.56, 'hosp', { light: 'hosp', cam: (c) => { const x = c.t < 494.25 ? 0 : c.t < 495.49 ? lerp(-0.08, -0.09, ramp(c.t, 494.25, 495.4)) : c.t < 496.6 ? 0.1 : 0.06; const y = c.t < 496.6 ? 1.43 : 1.36; const d = (c.t < 494.25 ? 0.75 : 0.55) - (c.t - 493.56) * 0.02; const xx = x + Math.sin(c.t * 0.8) * 0.01; return { p: [xx, y + (c.t - 493.56) * 0.004, 0.8 + d], l: [xx, y, 0.8], fov: 36, roll: 0 }; }, dof: { p: [0, 1.4, 0.8], c: 10 },
  fx: (c) => [FX('dk', danke(), [0, 1.4, 0.8], 0.6)] });
// 498.32–502.93 "Die Krankenschwester hat gesagt, irgendein reicher Mann hat das hier bezahlt", sagt sie. "Bist du das?"
S(497.69, 'hosp', { light: 'hosp', cam: hold([0.5, 0.55, 2.2], [-0.1, 0.95, 0.8], 38, { creep: 0.05 }), w: () => ({ hosp: { iv: [-0.48, 0.75] } }), dof: fh([-0.1, 0, 0.8], 11, 0.62),
  act: (c) => [A(c, GIRL, { expr: c.t < 502.3 ? 'happy' : 'goofy', talk: (c.t > 498.3 && c.t < 501.3) || (c.t > 502.3 && c.t < 502.95), look: 0.9, headTilt: -8, L: { x: 120, y: 520 } }, [-0.1, 0, 0.8], { s: 0.62 })] });
// 502.93–507.69 "Von Hahn sagt nichts. Lange nichts. Er guckt nur auf das Bild." slow push
S(502.93, 'hosp', { light: 'hosp', lightMod: { vig: 0.42 }, cam: [{ at: 0, p: [1.6, 1.62, 3.2], l: [1.4, 1.62, 0.6], fov: 34 }, { u: 1, p: [1.45, 1.66, 1.75], l: [1.4, 1.62, 0.6], fov: 30, e: 'lin' }], dof: fh([1.4, 0, 0.6], 13, HAHN_S),
  act: (c) => [hahn(c, { expr: c.t < 505.5 ? 'neutral' : 'worried', mouth: c.t > 505.5 ? 'flat' : undefined, look: -0.2, headTilt: 7, L: { x: 260, y: 600 }, holdL: 'drawing', blink: c.t > 506.4 && c.t < 506.55 ? 1 : 0 }, [1.4, 0, 0.6])] });

// ======================= DAS ENDE =======================
// 507.69–509.68 "Das Ende. Zurück im Glasturm."
S(507.69, 'office', { light: 'office', lightMod: { gain: '#fff4e8', sat: 1.0 }, flash: { n: 6, col: '#ffffff' }, cam: [{ at: 0, p: [6, 3.0, 5], l: [0, 1.2, -3], fov: 50 }, { u: 1, p: [4.8, 2.6, 3.8], l: [0, 1.2, -3], fov: 48, e: 'lin' }], w: () => ({ office: {} }),
  act: (c) => [hahn(c, { expr: 'neutral', L: { x: 260, y: 600 }, holdL: 'drawing' }, [0.4, 0, -2.0]), leon(c, { expr: 'neutral' }, [-1.6, 0, 0.2]), kerem(c, { expr: 'neutral' }, [-0.5, 0, 0.6])] });
// 509.68–513.46 "Von Hahn legt das Bild von dem kleinen Mädchen auf seinen riesigen Schreibtisch."
S(509.68, 'office', { light: 'office', lightMod: { gain: '#fff4e8', sat: 1.0 }, cam: hold([1.3, 2.4, -0.1], [0.1, 1.15, -3.0], 42, { creep: 0.06 }), w: (c) => ({ office: { drawing: c.t > 512.2 } }), dof: { p: [0.1, 1.2, -3.0], c: 7 },
  act: (c) => [hahn(c, { expr: 'neutral', look: -0.3, headTilt: 10, L: c.t < 512.2 ? { x: 300, y: lerp(560, 720, ramp(c.t, 510.5, 512.2)) } : 'hang', holdL: c.t < 512.2 ? 'drawing' : undefined }, [0.2, 0, -3.5])] });
// 513.46–517.38 "Ganz vorsichtig. Als wär's das Wertvollste, was er besitzt." macro, light on the drawing
S(513.46, 'office', { light: 'office', lightMod: { gain: '#fff4e8', vig: 0.45 }, cam: hold([-0.2, 1.4, -1.75], [-0.2, 0.95, -2.2], 40, { creep: 0.15 }), w: () => ({ office: { drawing: 1 } }), dof: { p: [-0.2, 0.95, -2.2], c: 11 },
  fx: (c) => [FX('G:dg', fx.glowDot(0.45, '255,240,200'), [-0.2, 1.0, -2.15], 0.8)] });
// 517.38–521.19 "Dann nimmt er die Akte mit der Anzeige gegen Leon. Und zerreißt sie."
S(517.38, 'office', { light: 'office', cam: hold([-0.9, 1.55, -1.6], [-1.3, 1.1, -2.3], 38, { creep: 0.06 }), w: (c) => ({ office: { drawing: 1, folder: c.t < 518.6 || c.t > 519.9, tear: easeOut(ramp(c.t, 520.1, 520.6)) } }), shake: [{ at: 2.75, a: 0.015 }], dof: { p: [-1.3, 1.1, -2.3], c: 8 },
  act: (c) => c.t > 518.6 ? [hahn(c, { expr: c.t < 520.1 ? 'neutral' : 'determined', L: { x: 180, y: 520 }, R: { x: 420, y: 520 }, holdL: c.t < 520.1 ? 'binder' : undefined }, [-1.3, 0, -2.9])] : [],
  fx: (c) => c.t > 520.1 ? [0, 1, 2, 3, 4, 5].map((i) => { const k = ramp(c.t, 520.1, 521.1); return FX('pc' + i + q(k, 2), (g) => { g.save(); g.translate(300, 500); g.rotate(k * 5 + i); g.fillStyle = '#f8f6f0'; g.fillRect(-120, -80, 240, 160); g.lineWidth = 10; g.strokeStyle = '#1a1416'; g.strokeRect(-120, -80, 240, 160); g.restore(); }, [-1.3 + (i - 2.5) * 0.15 * (1 + k), 1.35 + k * 0.3 - k * k * 0.6, -2.7], 0.12); }) : [] });
// 521.19–523.74 "Wissen Sie, Herr Becker", sagt er leise.
S(521.19, 'office', { light: 'office', lightMod: { gain: '#fff4e8' }, cam: cu([-1.3, 0, -2.9], { s: HAHN_S, d: 1.9, dx: 0.3, fov: 32, creep: 0.06 }), w: () => ({ office: { drawing: 1, folder: false, noChair: 1 } }), dof: fh([-1.3, 0, -2.9], 12, HAHN_S),
  act: (c) => [hahn(c, { expr: 'neutral', talk: c.t < 522.2, look: 0.5 }, [-1.3, 0, -2.9])] });
// 523.74–528.02 "Ich hab drei Yachten. Und ich war auf keiner davon so richtig glücklich."
S(523.74, 'office', { light: 'office', lightMod: { gain: '#fff4e8' }, cam: [{ at: 0, p: [-6.0, 2.2, -0.2], l: [-8.88, 2.2, -2.2], fov: 42 }, { at: 1.4, p: [-6.0, 2.2, -1.4], l: [-8.88, 2.2, -2.6], fov: 42, e: 'lin' }, { at: 1.6, p: [-1.0, 1.75, -1.15], l: [-1.3, 1.62, -2.9], fov: 32, e: 'out' }, { u: 1, p: [-1.02, 1.73, -1.25], l: [-1.3, 1.62, -2.9], fov: 32, e: 'lin' }],
  w: () => ({ office: { drawing: 1, folder: false, noChair: 1 } }), dof: (c) => (c.lt < 1.5 ? { p: [-8.88, 2.2, -2.4], c: 4 } : fh([-1.3, 0, -2.9], 12, HAHN_S)),
  act: (c) => [hahn(c, { expr: 'worried', mouth: 'flat', talk: true, look: 0.3, headTilt: -4 }, [-1.3, 0, -2.9])] });
// 528.02–530.47 "Er guckt aus dem Fenster, runter auf die Stadt."
S(528.02, 'office', { light: 'office', lightMod: { gain: '#fff4e8' }, cam: [{ at: 0, p: [1.2, 2.1, -3.0], l: [0.3, 0.2, -12], fov: 46 }, { u: 1, p: [1.0, 2.0, -3.6], l: [0.2, -2, -14], fov: 46, e: 'lin' }], w: () => ({ office: { drawing: 1, folder: false, noChair: 1 } }), dof: { p: [0.3, 1.6, -6.0], c: 4 },
  act: (c) => [hahn(c, { back: true }, [0.3, 0, -6.1])] });
// 530.47–534.15 "Die Bank bekommt Bescheid. Die Sache ist erledigt. Aber eins noch."
S(530.47, 'office', { light: 'office', lightMod: { gain: '#fff4e8' }, cam: hold([-1.8, 1.6, -1.2], [0.3, 1.5, -6.1], 40, { creep: 0.05 }), w: () => ({ office: { drawing: 1, folder: false, noChair: 1 } }), dof: fh([0.3, 0, -6.1], 7, HAHN_S),
  act: (c) => [hahn(c, { back: true }, [0.3, 0, -6.1]), leon(c, { back: true }, [-2.1, 0, -3.0], { s: 1 })] });
// 534.15–535.40 "Er dreht sich um."
S(534.15, 'office', { light: 'office', lightMod: { gain: '#fff4e8' }, cam: hold([0.0, 1.62, -3.6], [0.3, 1.62, -6.1], 34, { creep: 0.06 }), w: () => ({ office: { drawing: 1, folder: false, noChair: 1 } }), dof: fh([0.3, 0, -6.1], 11, HAHN_S),
  act: (c) => [hahn(c, c.t < 534.6 ? { back: true } : { expr: 'neutral', turn: q(lerp(-0.7, 0, ramp(c.t, 534.6, 535.1)), 2) }, [0.3, 0, -6.1])] });
// 535.40–542.89 "Ich gründe eine Stiftung. Und ich brauch jemanden, der weiß, wo Geld wirklich gebraucht wird. Jemanden aus dem Bus, Linie 47."
S(535.4, 'office', { light: 'office', lightMod: { gain: '#fff2e4', sat: 1.05 }, cam: [{ at: 0, p: [0.6, 1.75, -4.1], l: [0.3, 1.62, -6.1], fov: 34 }, { at: 4.4, p: [0.55, 1.72, -4.4], l: [0.3, 1.62, -6.1], fov: 34, e: 'lin' }, { at: 4.7, p: [-0.4, 1.8, -2.4], l: [0.3, 1.4, -6.1], fov: 40, e: 'out' }, { u: 1, p: [-0.45, 1.78, -2.6], l: [0.3, 1.4, -6.1], fov: 40, e: 'lin' }],
  w: () => ({ office: { drawing: 1, folder: false, noChair: 1 } }), dof: fh([0.3, 0, -6.1], 10, HAHN_S),
  act: (c) => [hahn(c, { expr: c.t < 539.0 ? 'neutral' : 'happy', talk: true, R: c.t > 540.0 ? 'reach' : 'hang' }, [0.3, 0, -6.1]), c.lt > 4.5 ? leon(c, { back: true }, [-0.4, 0, -3.8]) : null, c.lt > 4.5 ? kerem(c, { back: true }, [0.9, 0, -3.6]) : null] });
// 542.89–544.64 "Leon guckt Kerem an."  544.64–545.92 "Kerem guckt Leon an."
S(542.89, 'office', { light: 'office', lightMod: { gain: '#fff4e8' }, w: () => ({ office: { drawing: 1, folder: false, noChair: 1 } }), cam: cu([-0.4, 0, -3.8], { d: -1.6, dx: 0.2, fov: 32, creep: 0.03 }), dof: fh([-0.4, 0, -3.8], 12),
  act: (c) => [leon(c, { expr: 'shock', look: -1, turn: -0.4, blink: 0 }, [-0.4, 0, -3.8])] });
S(544.64, 'office', { light: 'office', lightMod: { gain: '#fff4e8' }, w: () => ({ office: { drawing: 1, folder: false, noChair: 1 } }), cam: cu([0.9, 0, -3.6], { d: -1.6, dx: -0.2, fov: 32, creep: 0.03 }), dof: fh([0.9, 0, -3.6], 12),
  act: (c) => [kerem(c, { expr: 'shock', look: 1, turn: 0.4, blink: 0 }, [0.9, 0, -3.6])] });
// 545.92–547.63 "Darf ich meinen Kumpel mitbringen?"
S(545.92, 'office', { light: 'office', lightMod: { gain: '#fff4e8' }, w: () => ({ office: { drawing: 1, folder: false, noChair: 1 } }), cam: med([0.25, 0, -3.7], { d: -2.8, dx: 0.1, h: 1.6, ly: 1.45, fov: 38 }), dof: fh([0.25, 0, -3.7], 8),
  act: (c) => [leon(c, { expr: 'sly', talk: true, L: 'thumb', R: { x: 560, y: 380 } }, [-0.4, 0, -3.8]), kerem(c, { expr: 'goofy', L: { x: 40, y: 380 } }, [0.9, 0, -3.6])] });
// 547.63–550.41 "Ein paar Monate später. Sonntag." Kiez, golden Sunday
S(547.63, 'kiez', { light: 'golden', lightMod: { az: 120, el: 22 }, flash: { n: 8, col: '#ffffff' }, cam: [{ at: 0, p: [-30, 18, 18], l: [-45, 4, -8], fov: 46 }, { u: 1, p: [-40, 9, 10], l: [-48, 2.5, -8], fov: 44, e: 'io' }], w: () => ({ kiez: { jzOpen: 1, playFixed: 1, queue: 1 } }) });
// 550.41–553.65 "Oma Hildes Küche. Die alten Tassen mit den Blumen."
S(550.41, 'oma', { light: 'warm', xf: 0.3, cam: [{ at: 0, p: [-0.15, 1.0, 0.95], l: [-0.42, 0.85, 0.35], fov: 32 }, { u: 1, p: [0.25, 1.02, 0.85], l: [0.0, 0.86, 0.0], fov: 32, e: 'lin' }], w: () => ({ oma: { plates: 1 } }), dof: { p: [-0.3, 0.85, 0.3], c: 10 } });
// 553.65–558.41 "Leon, Kerem und Oma sitzen am Tisch und essen Döner. Ohne extra alles."
const OMA_T = [-1.0, -0.14, 0.2], LEON_T = [1.0, -0.14, 0.2], KEREM_T = [0.0, -0.14, -0.55];
const table3 = (c, o = {}) => [A(c, OMA, { expr: o.oma || 'laugh', legs: 'sit', R: { x: 430, y: 520 }, holdR: 'doner' }, OMA_T), leon(c, { expr: o.leon || 'happy', legs: 'sit', L: { x: 170, y: 520 }, holdL: 'doner', talk: !!o.leonTalk }, LEON_T), A(c, KEREM, { expr: o.kerem || 'laugh', legs: 'sit', R: o.keremR || { x: 430, y: 520 }, L: o.keremL || 'hang', holdR: o.keremR ? undefined : 'doner', holdL: undefined }, KEREM_T)];
S(553.65, 'oma', { light: 'warm', cam: [{ at: 0, p: [0.3, 1.55, 2.5], l: [0, 1.15, -0.2], fov: 44 }, { u: 1, p: [0.2, 1.5, 2.1], l: [0, 1.2, -0.2], fov: 42, e: 'lin' }], w: () => ({ oma: { plates: 1 } }), dof: fh(KEREM_T, 6), act: (c) => table3(c) });
// 558.41–559.71 "Ganz normal."
S(558.41, 'oma', { light: 'warm', cam: cu(LEON_T, { d: 1.6, dx: -0.2, fov: 32 }), w: () => ({ oma: { plates: 1 } }), dof: fh(LEON_T, 12),
  act: (c) => [leon(c, { expr: 'happy', legs: 'sit', L: { x: 260, y: 470 }, holdL: 'doner', bob: q(Math.abs(Math.sin(c.t * 9)) * 0.006, 3) }, LEON_T)] });
// 559.71–565.68 "Leon wohnt immer noch in seiner kleinen Wohnung. Die Heizung funktioniert immer noch nur, wenn man dagegen tritt."
S(559.71, 'apt', { light: 'room', xf: 0.3, cam: [{ at: 0, p: [-0.6, 1.9, 3.9], l: [0.4, 1.0, -1.2], fov: 50 }, { at: 3.4, p: [0.2, 1.6, 2.6], l: [0.6, 1.0, -1.4], fov: 46, e: 'lin' }, { at: 3.7, p: [1.6, 1.45, 1.6], l: [0.6, 1.0, -1.5], fov: 46, e: 'out' }, { u: 1, p: [1.55, 1.42, 1.45], l: [0.6, 0.95, -1.5], fov: 46, e: 'lin' }],
  w: (c) => ({ apt: { shaft: 1, radShake: c.t > 564.75 && c.t < 565.3 ? 1 : 0 } }), shake: [{ at: 5.05, a: 0.025 }],
  act: (c) => { const kick = c.t > 564.55 && c.t < 564.95; return [leon(c, { expr: c.t < 564.4 ? 'happy' : kick ? 'determined' : 'laugh', legs: kick ? 'kick' : 'stand', L: kick ? 'up' : 'hang', R: kick ? 'wave' : 'hang', turn: -0.3 }, [0.25, 0, -1.3])]; },
  fx: (c) => { const out = []; if (c.t > 564.75 && c.t < 565.35) out.push(FX('pop' + q(c.t, 1), fx.pop(q((c.t - 564.75) / 0.6, 2)), [0.9, 0.5, -1.7], 0.7)); if (c.t > 564.9) out.push(FX('puf' + q(c.t, 1), fx.puff(q(clamp((c.t - 564.9) / 0.6), 2), '255,255,255'), [1.35, 0.9, -1.85], 0.6)); return out; } });
// 565.68–568.40 "Aber im Jugendzentrum hängt jetzt ein Foto von ihm."
const leonPhoto = (g, p) => { g.fillStyle = '#c89a5a'; g.fillRect(90, 260, 420, 480); g.lineWidth = 14; g.strokeStyle = '#1a1416'; g.strokeRect(90, 260, 420, 480); g.fillStyle = '#bfe4f4'; g.fillRect(120, 290, 360, 420); g.save(); g.beginPath(); g.rect(120, 290, 360, 420); g.clip(); g.translate(130, 300); g.scale(0.56, 0.56); TT.toonChar(p, LEON.hoodie, { expr: 'laugh', L: 'up', R: 'up' }); g.restore(); };
S(565.68, 'kiez', { light: 'day', xf: 0.3, cam: hold([-19.6, 1.55, -5.4], [-19.4, 1.45, -7.6], 40, { creep: 0.08 }), w: () => ({ kiez: { jzOpen: 1 } }), dof: { p: [-19.4, 1.45, -7.6], c: 6 },
  act: (c) => [A(c, KIDS[2], { expr: 'laugh', R: 'point', look: 0.8 }, [-20.4, 0.15, -6.4], { s: 0.6 }), A(c, KIDS[0], { expr: 'goofy', L: 'up' }, [-18.5, 0.15, -6.5], { s: 0.6 })],
  fx: (c) => [FX('lp', leonPhoto, [-19.4, 1.55, -7.68], 0.8, { order: 1 })] });
// 568.40–571.27 "Und Kerems Imbiss hat eine Schlange bis um die Ecke."
S(568.4, 'kiez', { light: 'day', cam: [{ at: 0, p: [30, 4.5, 4], l: [8, 1.5, -6], fov: 44 }, { u: 1, p: [26, 3.5, 3], l: [6, 1.6, -6], fov: 44, e: 'lin' }], w: () => ({ kiez: { jzOpen: 1, queue: 1 } }),
  act: (c) => [A(c, KEREM, { expr: 'laugh', L: 'wave' }, [5.2, 0.15, -6.3]), A(c, MOTHER, { expr: 'laugh', R: 'wave' }, [3.8, 0.15, -6.5])] });
// 571.27–575.24 Oma sagt: "Und? Wie fühlt sich's an, wieder arm zu sein?"
S(571.27, 'oma', { light: 'warm', xf: 0.25, cam: cu(OMA_T, { d: 1.6, dx: 0.3, fov: 32, creep: 0.06 }), w: () => ({ oma: { plates: 1 } }), dof: fh(OMA_T, 12),
  act: (c) => [A(c, OMA, { expr: 'sly', talk: c.t > 572.2, legs: 'sit', look: 0.7, headTilt: 6 }, OMA_T)] });
// 575.24–579.23 "Leon lächelt. 'Ich war noch nie so reich, Oma.'"
S(575.24, 'oma', { light: 'warm', lightMod: { vig: 0.42 }, cam: cu(LEON_T, { d: 1.6, dx: -0.3, fov: 32, creep: 0.08 }), w: () => ({ oma: { plates: 1 } }), dof: fh(LEON_T, 12),
  act: (c) => [leon(c, { expr: 'happy', talk: c.t > 576.8 && c.t < 578.3, legs: 'sit', look: -0.7 }, LEON_T)] });
// 579.23–582.55 "In dem Moment vibriert sein Handy. Eine Nachricht von der Bank."
S(579.23, 'oma', { light: 'warm', cam: hold([0.62, 1.15, 0.35], [0.5, 0.78, -0.05], 38, { creep: 0.1 }), w: (c) => ({ oma: { plates: 1, phone: { mode: 'notify', note: c.t > 580.6, noteIn: q(easeOut(ramp(c.t, 580.6, 581.0)), 2), clock: '14:32' }, buzz: c.t < 581.2 ? 1 : 0 } }), dof: { p: [0.5, 0.78, -0.05], c: 10 },
  fx: (c) => c.t < 581.2 ? [FX('vb' + (Math.floor(c.t * 10) % 2), fx.shake(0), [0.5, 0.82, -0.05], 0.3)] : [] });
// 582.55–587.57 "Gutschrift: 1.000.000.000 Euro. Verwendungszweck: Yacht Nummer fünf."
S(582.55, 'void', { light: 'phone', lightMod: { hemi: 0.6 }, cam: [{ at: 0, p: [0, 1.48, 0.42], l: [0, 1.48, 0], fov: 40 }, { u: 1, p: [0, 1.43, 0.22], l: [0, 1.43, 0], fov: 38, e: 'lin' }], w: () => phoneW({ mode: 'notify', note: true, noteIn: 1, clock: '14:32' }), dof: { p: [0, 1.45, 0], c: 5 },
  fx: (c) => c.t > 586.0 ? [FX('n5' + q(c.t - 586, 1), fx.sparkle(q(clamp((c.t - 586) / 0.7), 2)), [0.0, 1.43, 0.02], 0.1)] : [] });
// 587.57–590.10 "Leon guckt aufs Handy. Dann guckt er Kerem an."
S(587.57, 'oma', { light: 'warm', cam: cu(LEON_T, { d: 1.6, dx: -0.2, fov: 32, creep: 0.04 }), w: () => ({ oma: { plates: 1 } }), dof: fh(LEON_T, 12),
  act: (c) => [leon(c, { expr: 'neutral', legs: 'sit', look: c.t < 588.9 ? 0.2 : -1, headTilt: c.t < 588.9 ? -10 : 0, turn: c.t < 588.9 ? 0 : -0.4, blink: 0 }, LEON_T)] });
// 590.10–595.19 "Kerem schlägt die Hände vors Gesicht. 'Nein. Nein, nein, nein.'"
S(590.1, 'oma', { light: 'warm', cam: cu(KEREM_T, { d: 1.8, dx: 0.1, fov: 32, creep: 0.05 }), w: () => ({ oma: { plates: 1 } }), dof: fh(KEREM_T, 12),
  act: (c) => { const on = c.t > 590.5; return [A(c, KEREM, { expr: on ? 'scared' : 'shock', legs: 'sit', holdR: undefined, L: on ? { x: 240, y: 290 } : 'hang', R: on ? { x: 360, y: 290 } : 'hang', headTilt: on && c.t > 592.0 ? q(Math.sin(c.t * 14) * 7, 1) : 0, talk: c.t > 592.0 }, KEREM_T)]; } });
// 595.19–597.40 "Leon grinst. 'Nur ein kleiner Test.'"
S(595.19, 'oma', { light: 'warm', lightMod: { vig: 0.48 }, cam: [{ at: 0, p: [0.75, 1.42, 1.8], l: [1.0, 1.36, 0.2], fov: 32 }, { u: 1, p: [0.88, 1.39, 1.0], l: [1.0, 1.37, 0.2], fov: 30, e: 'lin' }], w: () => ({ oma: { plates: 1 } }), dof: fh(LEON_T, 13),
  act: (c) => [leon(c, { expr: 'sly', talk: c.t > 596.3 && c.t < 597.3, legs: 'sit', look: -0.4, turn: -0.2, L: 'chin' }, LEON_T)],
  fx: (c) => c.t > 596.2 ? [FX('sp' + q(clamp((c.t - 596.2) / 0.6), 2), fx.sparkle(q(clamp((c.t - 596.2) / 0.6), 2)), [0.7, 1.75, 0.3], 0.35)] : [] });
// 597.40–end: hard cut to black
S(597.4, 'void', { light: 'phone', cam: hold([0, 1.5, 3], [0, 1.5, 0], 40), black: () => 1, w: () => ({ void: {} }) });
