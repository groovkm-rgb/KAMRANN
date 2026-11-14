// shots.js: per-shot direction (camera keys, cast, lights, world state, fx). Coordinates are local to the shot's set.
import * as CS from './castspec.js';
import { KIT } from './sets/kitchen.js';
import { CEL } from './sets/cells.js';
import { EXT } from './sets/ext.js';
import { WS } from './sets/workshop.js';
import { FOR } from './sets/forest.js';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const eout = (t) => 1 - (1 - clamp(t)) ** 3;
const ramp = (f, a, b) => clamp((f - a) / (b - a));
export const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
export const blinkAt = (f, seed) => { const per = 52 + (seed * 17) % 31, ph = (f + seed * 13) % per; return ph < 2 ? 0.6 : ph < 4 ? 1 : 0; };
export const idle = (f, seed, k = 1) => ({ bob: q(0.005 * k * Math.sin((f + seed * 11) * 0.11), 4), tilt: q(0.9 * k * Math.sin((f + seed * 7) * 0.05), 2), headTilt: q(1.3 * k * Math.sin((f + seed * 5) * 0.037 + 1), 2) });
/** character card. L = baked light {shade, rims} */
export const mkA = (T) => (spec, o, pos, ex = {}, L = null) => ({
  key: JSON.stringify([spec.seed, spec.body, o, L]), draw: (p) => (L ? T.litChar(p, spec, o, L) : T.toonChar(p, spec, o)),
  x: pos[0], y: pos[1], z: pos[2], s: ex.s ?? 0.9, ...ex,
});

// ---------- light presets ----------
const BASE = { waterDeep: '#203040', waterShal: '#304050', glint: '#ffffff', sunDisc: '#000000', sunSize: 0 };
export const LIGHTS = {
  kitNight: { ...BASE, az: 165, el: 18, sky: '#28345c', ground: '#100c14', hemi: 0.16, sun: '#9cc0ff', sunI: 0.4, fog: '#0a0e1c', fogNear: 2.5, fogFar: 9,
    skyTop: '#0a1028', skyHor: '#1a2444', sat: 1.2, gain: '#dcdcf0', lift: '#020308', vig: 0.55, shadowExt: 3, ink: 1.6 },
  macro: { ...BASE, az: 160, el: 30, sky: '#28345c', ground: '#100c14', hemi: 0.3, sun: '#b4d0ff', sunI: 0.7, fog: '#0a0e1c', fogNear: 2, fogFar: 9,
    skyTop: '#0a1028', skyHor: '#1a2444', sat: 1.15, gain: '#fff4ea', lift: '#03050b', vig: 0.36, shadowExt: 0.8, ink: 2 },
  cellDay: { ...BASE, az: 95, el: 62, sky: '#a8c8b4', ground: '#343a36', hemi: 0.5, sun: '#e0ffea', sunI: 0.75, fog: '#26302c', fogNear: 6, fogFar: 22,
    skyTop: '#101818', skyHor: '#203028', sat: 1.04, gain: '#eefff4', lift: '#030806', vig: 0.4, shadowExt: 5, ink: 1.6 },
  cellNight: { ...BASE, az: 80, el: 38, sky: '#2a3a6a', ground: '#0a0a12', hemi: 0.2, sun: '#8aa8ff', sunI: 0.3, fog: '#070b16', fogNear: 3, fogFar: 13,
    skyTop: '#060a18', skyHor: '#101830', sat: 1.15, gain: '#d4d8ee', lift: '#020308', vig: 0.52, shadowExt: 4, ink: 1.6 },
  cellMorning: { ...BASE, az: -90, el: 32, sky: '#b8c8dc', ground: '#3a3228', hemi: 0.42, sun: '#ffd4a0', sunI: 1.1, fog: '#2e3030', fogNear: 4, fogFar: 16,
    skyTop: '#203040', skyHor: '#506070', sat: 1.08, gain: '#fff4e8', lift: '#040506', vig: 0.38, shadowExt: 4, ink: 1.6 },
  alarm: { ...BASE, az: 90, el: 55, sky: '#6a1a14', ground: '#100404', hemi: 0.22, sun: '#ff5040', sunI: 0.3, fog: '#160505', fogNear: 2, fogFar: 9,
    skyTop: '#100202', skyHor: '#200404', sat: 1.12, gain: '#ffe4e0', lift: '#040000', vig: 0.5, shadowExt: 3, ink: 1.8 },
  extNight: { ...BASE, az: 210, el: 30, sky: '#4a5a98', ground: '#10121a', hemi: 0.65, sun: '#9ab4ff', sunI: 0.8, fog: '#141e3e', fogNear: 30, fogFar: 360,
    skyTop: '#040818', skyHor: '#1a2a50', sat: 1.15, gain: '#e4e8ff', lift: '#02040a', vig: 0.42, shadowExt: 30, ink: 1.3 },
  wsDay: { ...BASE, az: 100, el: 65, sky: '#b4ccc0', ground: '#3a403a', hemi: 0.6, sun: '#e4fff0', sunI: 0.8, fog: '#2c3634', fogNear: 6, fogFar: 26,
    skyTop: '#101818', skyHor: '#203028', sat: 1.06, gain: '#f2fff6', lift: '#030806', vig: 0.38, shadowExt: 4, ink: 1.6 },
  cpDay: { ...BASE, az: 180, el: 40, sky: '#c0d4dc', ground: '#3a3e40', hemi: 0.6, sun: '#d8ecff', sunI: 0.9, fog: '#303a3e', fogNear: 6, fogFar: 22,
    skyTop: '#101818', skyHor: '#203028', sat: 1.05, gain: '#f4fbff', lift: '#030608', vig: 0.38, shadowExt: 4, ink: 1.6 },
  ugDark: { ...BASE, az: 90, el: 60, sky: '#2a3440', ground: '#0a0a0c', hemi: 0.18, sun: '#8a9ab0', sunI: 0.2, fog: '#06080a', fogNear: 2, fogFar: 12,
    skyTop: '#020304', skyHor: '#04060a', sat: 1.12, gain: '#e8ecf4', lift: '#020203', vig: 0.55, shadowExt: 3, ink: 1.6 },
  carNight: { ...BASE, az: 180, el: 20, sky: '#2a3460', ground: '#0a0a10', hemi: 0.25, sun: '#7a90c8', sunI: 0.3, fog: '#0a1022', fogNear: 4, fogFar: 60,
    skyTop: '#040818', skyHor: '#101a36', sat: 1.15, gain: '#e8e4f4', lift: '#020308', vig: 0.5, shadowExt: 2, ink: 1.5 },
  hospNight: { ...BASE, az: 220, el: 35, sky: '#3a4a7a', ground: '#0c0e14', hemi: 0.45, sun: '#9ab0e8', sunI: 0.5, fog: '#141c34', fogNear: 15, fogFar: 90,
    skyTop: '#040818', skyHor: '#1a2648', sat: 1.12, gain: '#eef0ff', lift: '#02040a', vig: 0.42, shadowExt: 14, ink: 1.4 },
  forestNight: { ...BASE, az: 140, el: 50, sky: '#2a3450', ground: '#0a0c10', hemi: 0.4, sun: '#8aa0d0', sunI: 0.4, fog: '#1a2236', fogNear: 5, fogFar: 55,
    skyTop: '#06081a', skyHor: '#1a2440', sat: 1.1, gain: '#e8ecff', lift: '#020408', vig: 0.48, shadowExt: 10, ink: 1.4 },
  dawn: { ...BASE, az: 90, el: 6, sky: '#a8acc8', ground: '#3a3a30', hemi: 0.75, sun: '#ffb888', sunI: 1.1, fog: '#9a8898', fogNear: 14, fogFar: 150,
    skyTop: '#4a5a8a', skyHor: '#f4b090', sunDisc: '#ffd8b0', sunSize: 0.025, sat: 1.02, gain: '#fff4f0', lift: '#08060a', vig: 0.32, shadowExt: 6, ink: 1.2 },
  placeholder: { ...BASE, az: 120, el: 40, sky: '#8090b0', ground: '#404040', hemi: 1, sun: '#ffffff', sunI: 1.5, fog: '#202838', fogNear: 30, fogFar: 300,
    skyTop: '#101828', skyHor: '#2a3450', sat: 1.1, vig: 0.3, shadowExt: 10, ink: 1.5 },
};

// baked light looks for the cast
const NIGHTL = (rim = '#ff9a40', dir = [0.2, 1], k = 0.5) => ({ shade: `rgba(10,16,48,${k})`, rims: [{ c: rim, dir, w: 38, a: 0.95 }] });
const DAYL = { shade: 'rgba(30,60,40,0.12)', rims: [{ c: '#e4fff0', dir: [0.2, -1], w: 28, a: 0.55 }] };
const MORNL = { shade: 'rgba(60,40,30,0.1)', rims: [{ c: '#ffdca8', dir: [-0.5, -1], w: 34, a: 0.8 }] };
const ALARML = { shade: 'rgba(110,10,10,0.32)', rims: [{ c: '#ff4a30', dir: [1, -0.4], w: 36, a: 0.9 }] };
const EXTL = (k = 0.45) => ({ shade: `rgba(10,20,60,${k})`, rims: [{ c: '#ffa040', dir: [0.8, -0.6], w: 36, a: 0.9 }] });
const WSL = { shade: 'rgba(30,60,50,0.1)', rims: [{ c: '#ffd8a0', dir: [1, -0.4], w: 32, a: 0.8 }] };
const CPL = { shade: 'rgba(30,50,60,0.08)', rims: [{ c: '#dceeff', dir: [-1, -0.3], w: 32, a: 0.75 }] };
const UGL = { shade: 'rgba(10,16,30,0.5)', rims: [{ c: '#ffb060', dir: [0, -1], w: 34, a: 0.85 }, { c: '#8af0ff', dir: [-0.8, 0.4], w: 26, a: 0.6 }] };
const FORL = { shade: 'rgba(14,24,50,0.45)', rims: [{ c: '#dfe8ff', dir: [0.3, -1], w: 34, a: 0.85 }] };
const KITL = { shade: 'rgba(18,26,70,0.3)', rims: [{ c: '#d8eeff', dir: [-1, -0.2], w: 30, a: 0.75 }, { c: '#ffa040', dir: [1, -0.45], w: 40, a: 0.95 }] };

export const SH = {
  _default: { light: 'placeholder', K: [{ f: 0, pos: [0, 1.6, 6], look: [0, 1.2, 0], fov: 40 }, { f: 90, pos: [0, 1.6, 5.5], look: [0, 1.2, 0], fov: 40 }] },

  // 1. HOOK — kitchen, open fridge, she pushes a saw blade into frozen mince, freezes, stares at us. Whip pan out.
  hook: {
    light: 'kitNight', hand: 0.003,
    K: [
      { f: 0, pos: [0.5, 1.28, 1.25], look: [0.02, 1.11, -0.9], fov: 40, roll: -2 },
      { f: 24, pos: [0.45, 1.27, 1.1], look: [0.02, 1.12, -0.9], fov: 39, roll: -2.5, e: 'lin' },
      { f: 28, pos: [0.4, 1.26, 0.98], look: [0.0, 1.15, -0.92], fov: 35, roll: -4.5, e: 'out' },
      { f: 46, pos: [0.39, 1.26, 0.95], look: [0.0, 1.16, -0.92], fov: 34, roll: -5, e: 'lin' },
      { f: 53, pos: [0.39, 1.26, 0.95], look: [3.4, 1.0, -0.2], fov: 37, roll: 10, e: 'in' },
    ],
    kicks: [{ f: 25, a: 0.012, n: 6 }],
    mb: (lf) => (lf >= 46 ? 6 : 1),
    dof: (lf) => ({ at: [0, 1.25, -0.9], cinf: 12 }),
    world: (lf) => ({ kit: { blade: lf < 24 ? 0.12 + 0.22 * eout(lf / 9) + 0.18 * eout((lf - 12) / 8) : 0.52, bz: 0.0, bry: 0.12, brz: -0.04, packRx: 0.5, packUp: 0.05 } }),
    actors: (lf, T, f) => {
      const A = mkA(T), caught = lf >= 24;
      const breath = caught ? 0 : q(0.012 * Math.abs(Math.sin(lf * 0.48)), 4);
      const tremble = caught ? q(((Math.floor(lf) % 2) ? -0.5 : 0.5) * (lf < 40 ? 1 : 0.5), 2) : 0;
      const o = caught
        ? { expr: 'panic', turn: q(lerp(0.35, -0.04, eout((lf - 24) / 3)), 2), look: q(lf > 36 && lf < 42 ? -0.35 : 0, 2), sweat: 3, tilt: tremble, headTilt: -3, bob: 0,
            L: { x: 170, y: 515 }, R: { x: 500, y: 512 } }
        : { expr: 'determined', turn: 0.35, look: 0.5, sweat: 2, blink: blinkAt(f, 3), bob: breath, tilt: q(Math.sin(lf * 0.48) * 0.8, 2), headTilt: 4,
            L: { x: 170, y: 515 }, R: { x: q(540 - 22 * eout(lf / 9) - 18 * eout((lf - 12) / 8), 1), y: 512 } };
      return [A(CS.WOMAN, o, KIT.woman, { s: 0.8 }, KITL)];
    },
  },


  // 1b. whip-pan landing: dark cell, glowing goggles, sparks spraying onto his face
  sparks: {
    light: 'cellNight', hand: 0.006,
    K: [
      { f: 0, pos: [-0.38, 0.66, -2.88], look: [-2.4, 1.0, -1.4], fov: 46, roll: -9 },
      { f: 6, pos: [-0.36, 0.66, -2.88], look: [-0.05, 1.0, -1.95], fov: 44, roll: -4, e: 'out' },
      { f: 17, pos: [-0.33, 0.67, -2.84], look: [-0.05, 1.02, -1.95], fov: 41, roll: -3, e: 'lin' },
    ],
    kicks: [{ f: 7, a: 0.01 }, { f: 12, a: 0.008 }], mb: (lf) => (lf < 6 ? 6 : 1),
    flash: (lf) => (lf >= 15 ? clamp((lf - 15) / 3) * 0.95 : 0),
    dof: () => ({ at: [-0.05, 0.95, -1.95], cinf: 12 }),
    world: (lf) => ({ cells: { mode: 'night', sparks: [{ p: [-0.22, 0.52, -2.92], dir: 0.4 }], sparkI: 5, sparkX: -0.28, goggleI: 1.2, goggleX: -0.1, dust: 0.3, dustAt: [-0.2, 0.9, -2.3] } }),
    actors: (lf, T, f) => { const A = mkA(T); const saw = Math.sin(lf * 1.3) * 26;
      return [A(CS.STILLE, { expr: 'determined', goggles: 'down', gogLit: 1, legs: 'crouch', L: { x: q(150 + saw, 0), y: 640 }, R: { x: q(210 + saw, 0), y: 660 }, holdR: 'saw', bob: q(0.006 * Math.sin(lf * 1.3), 4), tilt: -4 }, [-0.05, -0.12, -1.95], { s: 0.8 }, NIGHTL('#ffa040', [-0.5, 1], 0.55))]; },
  },

  // 3. "Zwei verurteilte Mörder." — both behind the bars, Charmeur's slow grin
  moerder: {
    light: 'cellDay',
    K: [{ f: 0, pos: [-0.9, 1.25, 2.55], look: [-1.25, 1.08, -0.4], fov: 38, roll: 2 }, { f: 38, pos: [-1.4, 1.22, 2.2], look: [-1.25, 1.1, -0.4], fov: 35, roll: -1, e: 'lin' }],
    dof: () => ({ at: [-1.25, 1.25, -0.45], cinf: 11 }),
    world: (lf) => ({ cells: { mode: 'day', flicker: true, dust: 0.45, dustAt: [-1.2, 1.8, 0.8] } }),
    actors: (lf, T, f) => { const A = mkA(T);
      return [
        A(CS.CHARMEUR, { expr: lf < 14 ? 'smug' : 'sly', look: 0, turn: 0.15, blink: blinkAt(f, 2), ...idle(f, 2), L: 'hip', R: { x: 420, y: 470 } }, [-1.62, 0, -0.42], { s: 0.8 }, DAYL),
        A(CS.STILLE, { expr: 'determined', look: -0.1, turn: -0.15, blink: blinkAt(f, 8), ...idle(f, 8), L: { x: 180, y: 470 }, R: 'hang' }, [-0.88, 0, -0.42], { s: 0.8 }, DAYL),
      ]; },
  },

  // 9. "Ein Wärter bringt das Paket direkt zu den beiden." — corridor walk, hand-off through the bars
  guard: {
    light: 'cellDay',
    cam: (lf) => { const t = smooth(lf / 52), gx = lerp(2.6, -0.45, t), k = clamp((lf - 52) / 22);
      return { pos: [lerp(gx + 0.55, -0.05, smooth(k)), 1.1, 2.62 - 0.12 * k], look: [lerp(gx - 0.35, -1.0, smooth(k)), 1.05, lerp(0.25, -0.05, k)], fov: lerp(46, 41, k), roll: lerp(-2, 1.5, k) }; },
    dof: (lf) => ({ at: [lerp(1.8, -0.5, smooth(lf / 52)), 1.25, 0.55], cinf: 9 }),
    world: (lf) => ({ cells: { mode: 'day', dust: 0.4, dustAt: [0, 1.8, 1.2] } }),
    actors: (lf, T, f) => { const A = mkA(T), t = smooth(lf / 52), gx = lerp(2.6, -0.45, t), walking = lf < 50, give = smooth((lf - 52) / 10);
      return [
        A(CS.GUARD, { expr: 'bored', turn: -0.35, look: -0.6, blink: blinkAt(f, 11), legs: walking ? 'walk' : 'stand', step: q((lf % 20) / 20), bob: walking ? q(Math.abs(Math.sin(lf / 20 * Math.PI * 2)) * 0.012, 3) : 0,
          L: { x: q(lerp(240, 120, give), 0), y: q(lerp(560, 470, give), 0) }, holdL: 'package', R: { x: 420, y: 520 }, holdR: 'mug' }, [gx, 0, 0.55], { s: 0.84 }, DAYL),
        A(CS.CHARMEUR, { expr: lf > 52 ? 'sly' : 'smug', turn: 0.3, look: 0.6, blink: blinkAt(f, 2), ...idle(f, 2), L: 'hip', R: { x: q(lerp(380, 520, give), 0), y: 470 } }, [-1.62, 0, -0.42], { s: 0.8 }, DAYL),
        A(CS.STILLE, { expr: 'alert', turn: 0.2, look: 0.7, blink: blinkAt(f, 8), ...idle(f, 8) }, [-0.85, 0, -0.55], { s: 0.8 }, DAYL),
      ]; },
  },

  // 10. night sawing, moon races (weeks pass), flashlight sweep -> they fake sleep
  sawing: {
    light: 'cellNight',
    K: [{ f: 0, pos: [-0.85, 1.05, -0.25], look: [0.05, 1.45, -3.0], fov: 50, roll: 2 }, { f: 30, pos: [-0.8, 1.02, -0.45], look: [0.05, 1.4, -3.0], fov: 48, roll: 2, e: 'lin' }, { f: 36, pos: [-0.75, 1.1, -0.5], look: [-0.05, 0.85, -2.5], fov: 44, roll: -2, e: 'out' }, { f: 88, pos: [-0.65, 1.08, -0.75], look: [-0.05, 0.85, -2.5], fov: 41, roll: -3, e: 'lin' }],
    kicks: [{ f: 34, a: 0.008 }],
    dof: (lf) => ({ at: [-0.12, 0.9, -2.5], cinf: 10 }),
    world: (lf) => { const sawingOn = lf < 34 || lf > 80, beam = lf >= 28 && lf < 76, bt = clamp((lf - 28) / 48);
      return { cells: { mode: 'night', moonPh: lf < 34 ? ((lf * 0.06) % 1) : 0.62, sparks: sawingOn ? [{ p: [-0.15, 0.55, -2.92], dir: 0.2 }, { p: [-2.65, 0.55, -2.92], dir: -0.2 }] : null, sparkI: sawingOn ? 3.5 : 0, sparkX: -0.15, sparkI2: sawingOn ? 2.5 : 0,
        goggleI: lf < 34 || lf > 80 ? 0.9 : 0, goggleX: -0.12, dust: 0.25, dustAt: [0, 1.4, -1.8],
        flash: beam ? { from: [lerp(2.0, -1.6, bt), 1.5, 1.6], to: [lerp(1.2, -0.6, bt), lerp(0.9, 0.7, bt), lerp(-2.0, -2.7, bt)], i: 40 * Math.sin(bt * Math.PI), pool: 0.35 * Math.sin(bt * Math.PI), beam: 0.16 * Math.sin(bt * Math.PI) } : null } }; },
    actors: (lf, T, f) => { const A = mkA(T), L = NIGHTL('#ffa040', [-0.3, 1], 0.5), saw = Math.sin(lf * 1.2) * 24;
      if (lf < 34 || lf >= 82) return [A(CS.STILLE, { expr: lf < 30 ? 'focus' : 'smug', goggles: 'down', gogLit: 1, legs: 'crouch', L: { x: q(170 + saw, 0), y: 640 }, R: { x: q(230 + saw, 0), y: 660 }, holdR: 'saw', bob: q(0.006 * Math.sin(lf * 1.2), 4) }, [-0.1, -0.12, -2.45], { s: 0.8 }, L)];
      if (lf < 38) return [A(CS.STILLE, { expr: 'alert', goggles: 'up', look: 0.8, legs: 'crouch', L: 'hang', R: 'hang', tilt: q(((Math.floor(lf) % 2) ? -1 : 1) * 1.2, 1) }, [-0.1, -0.12, -2.45], { s: 0.8 }, L)];
      const nod = smooth((lf - 38) / 5);
      return [A(CS.STILLE, { expr: lf < 74 ? 'sleep' : 'smug', goggles: 'up', legs: 'crouch', L: 'hang', R: 'hang', blink: 0, headTilt: q(14 * nod, 1), tilt: q(-6 * nod, 1), bob: q(-0.02 * nod + 0.004 * Math.sin(lf * 0.15), 4) }, [-0.1, -0.12, -2.45], { s: 0.8 }, L)]; },
  },

  // 14. morning: young guard pulls the blanket — a dummy made of clothes
  dolls: {
    light: 'cellMorning',
    K: [{ f: 0, pos: [-1.0, 1.32, -1.3], look: [0.65, 0.92, -1.85], fov: 44, roll: 3 }, { f: 18, pos: [-0.9, 1.3, -1.35], look: [0.65, 0.95, -1.88], fov: 41, roll: 2, e: 'out' }, { f: 63, pos: [-0.75, 1.28, -1.42], look: [0.68, 0.98, -1.9], fov: 37, roll: 4, e: 'lin' }],
    kicks: [{ f: 16, a: 0.008 }],
    dof: () => ({ at: [0.75, 1.0, -1.9], cinf: 10 }),
    world: (lf) => ({ cells: { mode: 'day', morning: true, morningX: 0, dolls: true, holes: true, blanketPull: smooth((lf - 3) / 12), dust: 0.8, dustAt: [0.4, 1.4, -2.0] } }),
    actors: (lf, T, f) => { const A = mkA(T), pull = smooth((lf - 3) / 12);
      return [A(CS.GUARD2, { expr: lf < 14 ? 'neutral' : 'jawdrop', turn: 0.3, look: lf < 14 ? 0.6 : 0.2, blink: lf < 14 ? blinkAt(f, 13) : 0, L: { x: q(lerp(200, 470, pull), 0), y: q(lerp(640, 380, pull), 0) }, R: { x: q(lerp(240, 510, pull), 0), y: q(lerp(650, 400, pull), 0) },
        tilt: lf > 14 ? q(-3 - 2 * Math.sin(lf * 0.3), 1) : 0, bob: lf > 14 ? 0 : q(0.005 * Math.sin(lf * 0.2), 4) }, [1.0, 0, -1.95], { s: 0.82 }, MORNL)]; },
  },

  // 15. the note on the sawn steam pipe, red alarm beacons start
  note: {
    light: 'alarm',
    K: [{ f: 0, pos: [-1.7, 1.0, -3.1], look: [-0.25, 0.715, -3.5], fov: 41, roll: -4 }, { f: 75, pos: [-1.35, 0.94, -3.12], look: [-0.25, 0.7, -3.5], fov: 38, roll: -2, e: 'lin' }],
    dof: () => ({ at: [-0.5, 0.72, -3.48], cinf: 9 }),
    world: (lf) => ({ cells: { mode: 'alarm', holes: true, steam: 1, noteFlutter: 0.6, dust: 0.6, dustAt: [-0.6, 1.4, -3.6], corr: 0 } }),
  },

  // 20a. "Und die Frau mit dem Hackfleisch?" — cell C, the door slides shut
  cellA: {
    light: 'cellDay',
    K: [{ f: 0, pos: [2.15, 1.15, 1.5], look: [1.95, 0.98, -1.6], fov: 36, roll: -2 }, { f: 53, pos: [2.1, 1.12, 1.15], look: [1.95, 0.98, -1.65], fov: 33, roll: -3, e: 'lin' }],
    kicks: [{ f: 19, a: 0.012 }],
    dof: () => ({ at: [1.98, 1.0, -1.7], cinf: 10 }),
    world: (lf) => ({ cells: { mode: 'day', morning: true, morningX: 2.5, doorC: 1 - smooth((lf - 6) / 13), noBlanketC: true, dust: 0.5, dustAt: [2.2, 1.6, -1.2], cellLamp: 0 } }),
    actors: (lf, T, f) => { const A = mkA(T); return [A(CS.WOMAN_JAIL, { expr: lf < 19 ? 'worried' : 'scared', look: lf < 19 ? -0.6 : 0, turn: -0.2, legs: 'sit', blink: blinkAt(f, 5), ...idle(f, 5, 0.6), L: 'belly', R: 'belly', tilt: lf > 19 && lf < 24 ? 2 : 0 }, [1.98, 0.13, -1.75], { s: 0.8, blob: false }, MORNL)]; },
  },

  // 20b. "Musste danach selbst ins Gefängnis." — tray with one burger patty, deep sigh
  final: {
    light: 'cellDay',
    K: [{ f: 0, pos: [2.45, 1.5, 1.05], look: [2.06, 0.92, -1.45], fov: 42, roll: -2 }, { f: 82, pos: [2.42, 1.45, 0.8], look: [2.06, 0.93, -1.48], fov: 38, roll: -3, e: 'lin' }],
    kicks: [{ f: 8, a: 0.006 }],
    dof: () => ({ at: [2.1, 0.95, -1.4], cinf: 10 }),
    world: (lf) => ({ cells: { mode: 'day', morning: true, morningX: 2.5, doorC: 0, noBlanketC: true, tray: { x: lerp(-0.6, 0, eout((lf - 2) / 7)), y: Math.max(0, 0.06 * Math.sin(clamp((lf - 2) / 7) * Math.PI)) }, dust: 0.5, dustAt: [2.6, 1.5, -1.2] } }),
    actors: (lf, T, f) => { const A = mkA(T), sigh = smooth((lf - 56) / 14);
      const o = lf < 22 ? { expr: 'worried', look: 0.4, blink: blinkAt(f, 5) } : lf < 56 ? { expr: 'glum', look: 0.3, blink: blinkAt(f, 5) } : { expr: 'sigh' };
      return [A(CS.WOMAN_JAIL, { ...o, turn: -0.2, legs: 'sit', L: 'belly', R: 'belly', bob: q(-0.012 * sigh + 0.004 * Math.sin(lf * 0.12), 4), headTilt: q(-6 * sigh, 1), tilt: q(2 * sigh, 1) }, [1.98, 0.13, -1.75], { s: 0.8, blob: false }, MORNL)]; },
  },


  // 2. "Ein Hochsicherheitsgefängnis." — the sign, then crane up over the fence: walls, towers, searchlights
  prison: {
    light: 'extNight', hand: 0.01,
    K: [{ f: 0, pos: [8.3, 2.2, -27.0], look: [8.3, 2.45, -38.6], fov: 43, roll: -2 }, { f: 13, pos: [8.3, 2.25, -27.6], look: [8.3, 2.5, -38.6], fov: 42, roll: -2, e: 'lin' },
      { f: 35, pos: [24, 20, -13], look: [-32, 5, -58], fov: 52, roll: 4, e: 'out' }],
    mb: (lf) => (lf > 13 && lf < 24 ? 4 : 1), dof: (lf) => (lf < 14 ? { at: [8.3, 2.6, -38.6], cinf: 9 } : { at: [0, 8, -60], cinf: 0 }),
    lightMod: (lf) => (lf > 12 ? { sunI: 1.4, hemi: 0.95, sky: '#6a7ab8', fogFar: 420, gain: '#f0f2ff' } : {}),
    world: (lf) => ({ ext: { lamps: [0], lampI: 12, sway: false } }),
  },
  // 12. "Und eines Nachts klettern sie aus einem Gullydeckel." — the lid lifts, two pairs of eyes
  gully: {
    light: 'extNight', hand: 0.003,
    K: [{ f: 0, pos: [101.85, 0.16, -62.05], look: [92, 1.75, -62.4], fov: 40, roll: 2 }, { f: 79, pos: [101.55, 0.15, -62.05], look: [92, 1.6, -62.4], fov: 36, roll: 3, e: 'lin' }],
    dof: () => ({ at: [100, 0.2, -62], cinf: 11 }),
    world: (lf) => ({ ext: { lamps: [2, 3, 1], lid: smooth((lf - 8) / 18) * 0.8 + smooth((lf - 56) / 10) * 0.2, slide: smooth((lf - 58) / 18), mhLight: 0.8 * smooth((lf - 8) / 18), sway: true } }),
    actors: (lf, T, f) => { const open = smooth((lf - 14) / 10); if (open <= 0) return [];
      const lk = lf < 36 ? -0.8 : lf < 50 ? 0.8 : 0;
      return [{ key: 'eyes' + lk + (blinkAt(f, 2) > 0.5 ? 'b' : ''), draw: (p) => T.eyesCard(p, { look: lk, blink: blinkAt(f, 2) > 0.5, blinkWho: 0, bg: true }), x: 100.4, y: -0.27 + 0.1 * open, z: -62.0, s: 0.3, blob: false, shadow: false, order: 3 }]; },
  },
  // 13. "Mitten auf einer Straße – außerhalb des Gefängnisses." — wide: quiet street, wall behind, two shapes slip away
  street: {
    light: 'extNight', hand: 0.006,
    K: [{ f: 0, pos: [126, 14, -61], look: [88, 1.0, -61], fov: 46, roll: -3 }, { f: 78, pos: [122, 11.5, -61], look: [88, 2.0, -61], fov: 44, roll: -2, e: 'lin' }],
    dof: () => ({ at: [100, 0.5, -60], cinf: 3 }),
    world: (lf) => ({ ext: { lamps: [2, 3, 4], lid: 0.2, slide: 1, sway: true } }),
    actors: (lf, T, f) => { const A = mkA(T), L = EXTL(0.6);
      const k = smooth(lf / 78), w1 = [lerp(100.3, 103.5, k), 0, lerp(-61.6, -55.2, k)], w2 = [lerp(99.4, 102.2, smooth((lf - 6) / 72)), 0, lerp(-62.3, -55.8, smooth((lf - 6) / 72))];
      return [A(CS.CHARMEUR, { expr: 'sly', turn: 0.5, look: 0.8, legs: 'walk', step: q((lf % 16) / 16), bob: q(Math.abs(Math.sin(lf / 16 * Math.PI * 2)) * 0.012, 3), tilt: 8 }, w1, { s: 0.8 }, L),
        A(CS.STILLE, { expr: 'determined', goggles: 'up', turn: 0.5, look: 0.8, legs: 'walk', step: q(((lf + 8) % 16) / 16), bob: q(Math.abs(Math.sin((lf + 8) / 16 * Math.PI * 2)) * 0.012, 3), tilt: 8 }, w2, { s: 0.8 }, L)]; },
  },
  // 16. "Draußen sollte die Frau mit dem Fluchtauto warten." — crouched in the bushes, empty road
  wait: {
    light: 'extNight', hand: 0.004,
    K: [{ f: 0, pos: [258.2, 1.35, -50.4], look: [250, 0.9, -60.5], fov: 42, roll: -2 }, { f: 59, pos: [257.8, 1.3, -50.9], look: [250, 0.9, -60.5], fov: 39, roll: -3, e: 'lin' }],
    dof: () => ({ at: [254.7, 1.0, -54.8], cinf: 10 }),
    world: (lf) => ({ ext: { lamps: [10], sway: true, beamBias: 0.6 } }),
    actors: (lf, T, f) => { const A = mkA(T), L = { shade: 'rgba(10,20,60,0.5)', rims: [{ c: '#ffa040', dir: [-0.4, -0.9], w: 36, a: 0.9 }] };
      const lk = lf < 22 ? -0.9 : lf < 40 ? -0.6 : -0.95;
      return [A(CS.CHARMEUR, { expr: lf < 30 ? 'determined' : 'angry', turn: 0.4, look: -lk, legs: 'crouch', blink: blinkAt(f, 2), ...idle(f, 2), L: 'hip', R: 'chin' }, [255.2, -0.12, -54.6], { s: 0.8 }, L),
        A(CS.STILLE, { expr: 'glum', goggles: 'up', turn: 0.4, look: -lk, legs: 'crouch', blink: blinkAt(f, 8), ...idle(f, 8), L: 'hang', R: 'hang' }, [254.1, -0.15, -54.9], { s: 0.76 }, L)]; },
  },


  // 4. "Und eine Mitarbeiterin aus der Gefängnisschneiderei," — needle macro, pull back to her and the workshop
  ws: {
    light: 'wsDay',
    K: [{ f: 0, pos: [0.3, 1.4, 1.55], look: [0.05, 1.04, -0.6], fov: 40, roll: -3 }, { f: 84, pos: [0.75, 1.72, 2.85], look: [0.0, 1.0, -0.9], fov: 46, roll: 2.5, e: 'io' }],
    dof: (lf) => ({ at: [0.15, 1.15, -0.55], cinf: 11 }),
    world: () => ({}),
    actors: (lf, T, f) => { const A = mkA(T), out = [];
      out.push(A(CS.WOMAN, { expr: lf < 60 ? 'neutral' : 'happy', look: 0.2, blink: blinkAt(f, 3), legs: 'sit', ...idle(f, 3, 0.7), L: { x: q(200 + Math.sin(lf * 0.4) * 10, 0), y: 560 }, R: { x: q(380 + Math.sin(lf * 0.4 + 1) * 10, 0), y: 565 } }, [0.15, 0.08, -0.55], { s: 0.8, blob: false }, WSL));
      [[-4.2, -3.15], [-1.4, -3.15], [1.4, -3.15], [4.2, -3.15], [-2.8, -5.05], [2.8, -5.05]].forEach(([x, z], k) => out.push(A(CS.WORKERS[k % 3], { expr: ['neutral', 'bored', 'glum'][k % 3], legs: 'sit', look: 0.3, blink: blinkAt(f, 20 + k), bob: q(0.004 * Math.sin(f * 0.3 + k), 4), L: { x: 220, y: 560 }, R: { x: 380, y: 560 } }, [x, 0.08, z], { s: 0.78, blob: false }, WSL)));
      return out; },
  },
  // 5. "die sich von einem der beiden um den Finger wickeln lässt." — the drawing, the blush, thread around her finger
  charm: {
    light: 'wsDay',
    K: [{ f: 0, pos: [-0.25, 1.38, 1.85], look: [-0.25, 1.12, -0.4], fov: 40, roll: -2 }, { f: 38, pos: [-0.12, 1.3, 1.5], look: [-0.15, 1.1, -0.4], fov: 37, roll: -2, e: 'lin' },
      { f: 52, pos: [0.38, 1.08, 0.98], look: [0.42, 0.93, 0.2], fov: 36, roll: 4, e: 'out' }, { f: 75, pos: [0.4, 1.04, 0.86], look: [0.42, 0.93, 0.2], fov: 33, roll: 5, e: 'lin' }],
    dof: (lf) => (lf < 42 ? { at: [-0.3, 1.2, -0.45], cinf: 10 } : { at: [0.42, 0.95, 0.22], cinf: 14 }),
    world: () => ({}),
    actors: (lf, T, f) => { const A = mkA(T), give = smooth(lf / 12), bl = smooth((lf - 10) / 12);
      return [
        A(CS.CHARMEUR, { expr: 'charm', turn: 0.45, look: 0.6, blink: blinkAt(f, 2), ...idle(f, 2), tilt: 6, L: 'hip', R: { x: q(lerp(420, 520, give), 0), y: 450 }, holdR: 'drawing' }, [-0.78, 0, -0.25], { s: 0.8 }, WSL),
        A(CS.WOMAN, { expr: lf < 10 ? 'neutral' : 'shy', blush: q(bl, 2), turn: -0.35, look: -0.6, legs: 'sit', blink: lf < 10 ? blinkAt(f, 3) : 0, ...idle(f, 3, 0.6), L: 'chin', R: { x: 500, y: 620 } }, [0.15, 0.08, -0.55], { s: 0.8, blob: false }, WSL),
        { key: 'hand' + q(ramp(lf, 18, 70), 2), draw: (p) => T.lit(p, (qq) => T.handThread(qq, ramp(lf, 18, 70)), WSL), x: 0.42, y: 0.765, z: 0.22, s: 0.2, blob: false, shadow: false, order: 3 },
      ]; },
  },
  // 8. "Versteckt in gefrorenem Hackfleisch." — through the detector with the cooler bag; it beeps, the guard waves her on
  check: {
    light: 'cpDay',
    cam: (lf) => { const x = lerp(-2.2, 1.0, smooth(lf / 50)); return { pos: [lerp(2.4, 2.0, lf / 51), 1.5, lerp(3.7, 3.35, lf / 51)], look: [x + 0.75, 1.12, -0.1], fov: lerp(46, 42, lf / 51), roll: -2.5 }; },
    dof: (lf) => ({ at: [lerp(-1.6, 0.8, smooth(lf / 50)), 1.2, 0], cinf: 9 }),
    world: (lf) => ({ cp: { alarm: lf > 16 && lf < 42 && (Math.floor(lf / 4) % 2 === 0) } }),
    actors: (lf, T, f) => { const A = mkA(T), x = lerp(-2.2, 1.0, smooth(lf / 50)), walking = lf < 48, wave = Math.sin(lf * 0.5);
      return [
        A(CS.WOMAN, { expr: lf > 16 && lf < 42 ? 'scared' : 'worried', sweat: 2, turn: 0.5, look: 0.8, legs: walking ? 'walk' : 'stand', step: q((lf % 18) / 18), bob: walking ? q(Math.abs(Math.sin(lf / 18 * Math.PI * 2)) * 0.012, 3) : 0, L: 'hang', R: { x: 420, y: 470 }, holdR: 'cooler' }, [x, 0, 0], { s: 0.8 }, CPL),
        A(CS.GUARD, { expr: 'bored', turn: -0.3, look: 0.7, blink: blinkAt(f, 11), ...idle(f, 11), L: lf > 18 ? { x: q(90 + wave * 40, 0), y: q(240 + wave * 30, 0) } : 'hang', R: { x: 420, y: 520 }, holdR: 'mug' }, [1.7, 0, 1.95], { s: 0.84 }, CPL),
      ]; },
  },
  // 11a-c. "Kriechen durch Gänge, | durch ein riesiges Rohr, | unter der Mauer durch."
  gaenge: {
    light: 'ugDark', hand: 0.006,
    K: [{ f: 0, pos: [0.4, 0.5, 0.6], look: [-0.05, 0.6, -4], fov: 46, roll: 4 }, { f: 35, pos: [0.36, 0.48, 0.3], look: [-0.05, 0.62, -4], fov: 43, roll: 5, e: 'lin' }],
    kicks: [{ f: 1, a: 0.008 }], dof: (lf) => ({ at: [0, 0.6, lerp(-3.6, -2.0, lf / 35)], cinf: 10 }),
    world: (lf) => ({ ug: { zone: 'A', lamp: [0, 0.7, lerp(-3.2, -1.7, lf / 35)] } }),
    actors: (lf, T, f) => { const A = mkA(T), k = lf / 35, cr = Math.sin(lf * 0.6);
      return [A(CS.STILLE, { expr: 'determined', goggles: 'down', gogLit: 1, legs: 'crouch', tilt: q(-14 + cr * 3, 1), L: { x: q(160 + cr * 30, 0), y: 700 }, R: { x: q(440 - cr * 30, 0), y: 700 }, bob: q(0.01 * Math.abs(cr), 3) }, [0.0, -0.35, lerp(-3.6, -2.0, k)], { s: 0.8 }, UGL),
        A(CS.CHARMEUR, { expr: 'determined', legs: 'crouch', tilt: q(-14 - cr * 3, 1), L: { x: q(160 - cr * 30, 0), y: 700 }, R: { x: q(440 + cr * 30, 0), y: 700 }, bob: q(0.01 * Math.abs(cr), 3) }, [0.15, -0.35, lerp(-6.2, -4.4, k)], { s: 0.8 }, UGL)]; },
  },
  rohr: {
    light: 'ugDark', hand: 0.006,
    K: [{ f: 0, pos: [30.05, 0.75, 1.2], look: [30, 0.85, -6], fov: 48, roll: -6 }, { f: 40, pos: [30.0, 0.72, 0.7], look: [30, 0.85, -6], fov: 45, roll: -3, e: 'lin' }],
    kicks: [{ f: 1, a: 0.008 }], dof: (lf) => ({ at: [30, 0.6, lerp(-4.2, -1.8, lf / 40)], cinf: 9 }),
    world: (lf) => ({ ug: { zone: 'B', lamp: [0, 0.75, lerp(-3.8, -1.5, lf / 40)] } }),
    actors: (lf, T, f) => { const A = mkA(T), k = lf / 40, cr = Math.sin(lf * 0.6);
      return [A(CS.STILLE, { expr: 'determined', goggles: 'down', gogLit: 1, legs: 'crouch', tilt: q(-14 + cr * 3, 1), L: { x: q(160 + cr * 30, 0), y: 700 }, R: { x: q(440 - cr * 30, 0), y: 700 }, bob: q(0.01 * Math.abs(cr), 3) }, [30.0, -0.2, lerp(-4.2, -1.8, k)], { s: 0.75 }, UGL),
        A(CS.CHARMEUR, { expr: 'worried', legs: 'crouch', tilt: q(-14 - cr * 3, 1), L: { x: q(160 - cr * 30, 0), y: 700 }, R: { x: q(440 + cr * 30, 0), y: 700 }, bob: q(0.01 * Math.abs(cr), 3) }, [30.1, -0.2, lerp(-6.8, -4.4, k)], { s: 0.75 }, UGL)]; },
  },
  mauer: {
    light: 'ugDark', hand: 0.006,
    K: [{ f: 0, pos: [60.6, 0.55, 0.35], look: [54, 0.75, -0.1], fov: 46, roll: 5 }, { f: 36, pos: [60.2, 0.52, 0.3], look: [54, 0.75, -0.1], fov: 43, roll: 3, e: 'lin' }],
    kicks: [{ f: 1, a: 0.008 }], dof: (lf) => ({ at: [60 + lerp(-4.6, -2.6, lf / 36), 0.6, 0], cinf: 9 }),
    world: (lf) => ({ ug: { zone: 'C', lamp: [lerp(-4.3, -2.3, lf / 36), 0.7, 0] } }),
    actors: (lf, T, f) => { const A = mkA(T), k = lf / 36, cr = Math.sin(lf * 0.6);
      return [A(CS.STILLE, { expr: 'determined', goggles: 'down', gogLit: 1, legs: 'crouch', tilt: q(-14 + cr * 3, 1), L: { x: q(160 + cr * 30, 0), y: 700 }, R: { x: q(440 - cr * 30, 0), y: 700 }, bob: q(0.01 * Math.abs(cr), 3) }, [60 + lerp(-4.6, -2.6, k), -0.35, 0.05], { s: 0.75 }, UGL),
        A(CS.CHARMEUR, { expr: 'sly', legs: 'crouch', tilt: q(-14 - cr * 3, 1), L: { x: q(160 - cr * 30, 0), y: 700 }, R: { x: q(440 + cr * 30, 0), y: 700 }, bob: q(0.01 * Math.abs(cr), 3) }, [60 + lerp(-7.2, -5.0, k), -0.35, -0.1], { s: 0.75 }, UGL)]; },
  },
  // 17. "Aber sie kriegt Panik." — in her car: trembling hands, fast breath, glasses fogging up
  panic: {
    light: 'carNight', hand: 0.012,
    K: [{ f: 0, pos: [1.3, 1.25, 0.3], look: [0.0, 1.02, -0.05], fov: 46, roll: -4 }, { f: 41, pos: [1.12, 1.22, 0.26], look: [0.0, 1.04, -0.05], fov: 42, roll: -6, e: 'lin' }],
    kicks: [{ f: 2, a: 0.008 }, { f: 22, a: 0.006 }], dof: () => ({ at: [0.0, 1.15, -0.15], cinf: 10 }),
    world: () => ({ car: { shake: 1 } }),
    actors: (lf, T, f) => { const A = mkA(T), tr = (Math.floor(lf) % 2 ? -1 : 1);
      return [A(CS.WOMAN, { expr: 'panic', sweat: 3, glasses: { c: '#4a2618', fog: q(clamp(lf / 34) * 0.85, 2) }, turn: 0.25, look: tr * 0.3, legs: 'sit', bob: q(0.012 * Math.abs(Math.sin(lf * 0.9)), 3), tilt: q(tr * 1.4, 1), headTilt: q(tr * 1.5, 1),
        L: { x: q(110 + tr * 6, 0), y: 470 }, R: { x: q(170 - tr * 6, 0), y: 500 } }, [0.0, 0.05, -0.15], { s: 0.72, blob: false }, { shade: 'rgba(14,20,60,0.35)', rims: [{ c: '#ffa040', dir: [-1, -0.3], w: 36, a: 0.9 }, { c: '#ff9a40', dir: [0, 1], w: 22, a: 0.5 }] })]; },
  },
  // 18. "Und fährt stattdessen … ins Krankenhaus." — the car turns in under the lit "Krankenhaus" sign
  hosp: {
    light: 'hospNight', hand: 0.005,
    K: [{ f: 0, pos: [0.6, 1.35, 11.2], look: [-1.25, 1.4, -2], fov: 47, roll: -2 }, { f: 83, pos: [0.2, 1.3, 10.2], look: [-1.3, 1.4, -2], fov: 45, roll: -3, e: 'lin' }],
    dof: () => ({ at: [-1.6, 1.25, 1.5], cinf: 6 }), mb: (lf) => (lf < 40 ? 3 : 1),
    world: (lf) => { const u = smooth(lf / 80), a = [12, 0, 4.2], b = [3.5, 0, 2.5], c = [0.6, 0, -4.2];
      const bz = (k) => (1 - u) * (1 - u) * a[k] + 2 * (1 - u) * u * b[k] + u * u * c[k]; const ang = lerp(-Math.PI / 2, -Math.PI + 0.05, smooth((lf - 12) / 55));
      return { hosp: { car: [bz(0), 0, bz(2), ang], door: smooth((lf - 60) / 14) } }; },
  },
  // 19. "Drei Wochen Großfahndung." — wanted poster, then the whole manhunt: helicopter beam, flashlights, dog, barricade
  hunt: {
    light: 'forestNight', hand: 0.008,
    K: [{ f: 0, pos: [0.5, 1.6, 1.15], look: [0.55, 1.62, -1.2], fov: 44, roll: -3 }, { f: 13, pos: [0.5, 1.6, 0.9], look: [0.55, 1.63, -1.2], fov: 42, roll: -3, e: 'lin' },
      { f: 37, pos: [-1.1, 2.4, 3.6], look: [2.4, 3.2, -12], fov: 54, roll: 4, e: 'out' }],
    mb: (lf) => (lf > 13 && lf < 26 ? 4 : 1), dof: (lf) => (lf < 14 ? { at: [0.55, 1.45, -1.2], cinf: 12 } : { at: [0.8, 1.2, -5.5], cinf: 4 }),
    world: (lf) => ({ forest: { mode: 'night', flash: [[1.45, 1.25, -5.2, 0.5, 0, -8], [-1.05, 1.25, -6.6, 0.2, 0, -10]] } }),
    actors: (lf, T, f) => { const A = mkA(T);
      return [A(CS.POLICE, { expr: 'determined', turn: -0.3, look: -0.5, legs: 'walk', step: q((lf % 18) / 18), R: { x: 470, y: 500 }, holdR: 'flashlight', L: 'hang' }, [1.5, 0, -5.4], { s: 0.8 }, FORL),
        A(CS.POLICE2, { expr: 'alert', turn: 0.3, look: 0.5, legs: 'walk', step: q(((lf + 9) % 18) / 18), R: { x: 470, y: 500 }, holdR: 'flashlight', L: { x: 120, y: 520 } }, [-1.0, 0, -6.8], { s: 0.8 }, FORL),
        { key: 'dog' + q((lf % 12) / 12), draw: (p) => T.lit(p, (qq) => T.dogChar(qq, { step: (lf % 12) / 12, sniff: true, tongue: true }), FORL), x: 0.5, y: 0, z: -4.6, s: 0.45, flip: true }]; },
  },
  // 20a. "Dann ist die Flucht vorbei." — dawn meadow, mist, far blue lights, helicopter leaving
  dawn: {
    light: 'dawn', hand: 0.003,
    K: [{ f: 0, pos: [1.5, 1.1, 33.5], look: [-1, 2.6, 72], fov: 44, roll: -1 }, { f: 42, pos: [0.9, 1.08, 34.3], look: [-1, 2.6, 72], fov: 42, roll: -1.5, e: 'lin' }],
    dof: () => ({ at: [0, 1, 50], cinf: 3 }),
    world: () => ({ forest: { mode: 'dawn', heliZ: 105, heliOff: -18 } }),
  },
  // 20b. "Einer der beiden überlebt sie nicht." — respectful: a fallen backpack in the dewy grass
  pack: {
    light: 'dawn', hand: 0.002,
    K: [{ f: 0, pos: [1.25, 0.6, 42.3], look: [0.3, 0.18, 44.0], fov: 36, roll: 0 }, { f: 52, pos: [1.1, 0.55, 42.6], look: [0.3, 0.18, 44.0], fov: 33, roll: 0, e: 'lin' }],
    dof: () => ({ at: [0.3, 0.15, 44.0], cinf: 13 }),
    lightMod: () => ({ sunI: 1.6, hemi: 0.95, el: 12 }),
    world: () => ({ forest: { mode: 'dawn', heliZ: 105, heliOff: -18 } }),
  },

  // 7. "Sie schmuggelt Werkzeug rein:" — high angle over the table: tools, wrapped packs, nervous glances.
  kit2: {
    light: 'kitNight',
    K: [
      { f: 0, pos: [0.6, 1.9, 0.75], look: [0.0, 0.95, -0.7], fov: 40, roll: -3 },
      { f: 43, pos: [0.5, 1.75, 0.55], look: [0.0, 0.97, -0.72], fov: 37, roll: -4, e: 'lin' },
    ],
    dof: () => ({ at: [-0.1, 0.9, -0.55], cinf: 11 }),
    world: (lf) => ({ kit: { tools: true, stack: true, blade: 0 } }),
    actors: (lf, T, f) => {
      const A = mkA(T), lk = lf < 14 ? -0.7 : lf < 28 ? 0.7 : -0.2;
      return [A(CS.WOMAN, { expr: 'worried', turn: q(lk * 0.25, 2), look: lk, sweat: 2, blink: blinkAt(f, 3), ...idle(f, 3, 1.4), L: { x: 210, y: 600 }, R: { x: 400, y: 590 } }, KIT.woman, { s: 0.8 }, KITL)];
    },
  },

  // 8a-c. macro inserts: saw blade / chisel / drill bit into the frozen mince (one cut per word)
  saw: {
    light: 'macro', hand: 0.0015,
    K: [{ f: 0, pos: [0.08, 1.16, -0.12], look: [0.04, 0.95, -0.66], fov: 44, roll: -7 }, { f: 22, pos: [0.07, 1.14, -0.17], look: [0.04, 0.955, -0.66], fov: 41, roll: -9, e: 'lin' }],
    kicks: [{ f: 5, a: 0.006 }], dof: () => ({ at: [0.14, 0.87, -0.6], cinf: 15 }),
    world: (lf) => ({ kit: { blade: 0.85 * eout(lf / 6), dir: 'z' } }),
  },
  chisel: {
    light: 'macro', hand: 0.0015,
    K: [{ f: 0, pos: [-0.06, 1.06, -0.14], look: [0.02, 0.93, -0.66], fov: 44, roll: 7 }, { f: 15, pos: [-0.05, 1.05, -0.19], look: [0.02, 0.935, -0.66], fov: 41, roll: 8, e: 'lin' }],
    kicks: [{ f: 4, a: 0.006 }], dof: () => ({ at: [0.12, 0.87, -0.6], cinf: 15 }),
    world: (lf) => ({ kit: { chisel: 0.85 * eout(lf / 5) } }),
  },
  drill: {
    light: 'macro', hand: 0.0015,
    K: [{ f: 0, pos: [0.06, 1.3, -0.3], look: [0.05, 0.85, -0.72], fov: 40, roll: -3 }, { f: 20, pos: [0.06, 1.25, -0.34], look: [0.05, 0.855, -0.72], fov: 37, roll: -5, e: 'lin' }],
    kicks: [{ f: 5, a: 0.006 }], dof: () => ({ at: [0.06, 0.87, -0.6], cinf: 15 }),
    world: (lf) => ({ kit: { drill: 0.85 * eout(lf / 7) } }),
  },
};
