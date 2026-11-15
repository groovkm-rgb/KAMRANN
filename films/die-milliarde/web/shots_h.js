// shots_h.js: helpers shared by all shot files.
import { S, A, FX, fx, hold, burst, lerp, lerp3, ramp, smooth, easeOut, clamp, q, pulse } from './engine.js';
import * as TT from './toon.js';
export { S, A, FX, fx, hold, burst, lerp, lerp3, ramp, smooth, easeOut, clamp, q, pulse };
export const { LEON, KEREM, OMA, HAHN, GREY, DIETER, GIRL, MOTHER, BOSS, SALES, DJ, NURSE, BUSWOMAN, SKATER, GUESTS, KIDS } = TT;
export const HEAD = 1.52; // head centre above the soles at s = 1
/** close-up camera on a character standing at pos (soles). o: {d, fov, dx, dy, creep, s, l2, roll} */
export const cu = (pos, o = {}) => { const s = o.s ?? 1, hy = pos[1] + HEAD * s + (o.dy ?? 0); const p = [pos[0] + (o.dx ?? 0.25), hy + (o.up ?? 0.06), pos[2] + (o.d ?? 1.8)]; const l = [pos[0] + (o.lx ?? 0), hy + 0.0 + (o.ly ?? 0), pos[2]]; return hold(p, l, o.fov ?? 34, { creep: o.creep ?? 0.06, roll: o.roll, roll2: o.roll2, l2: o.l2 }); };
/** medium shot on a point (characters around it) */
export const med = (pos, o = {}) => { const p = [pos[0] + (o.dx ?? 0.4), pos[1] + (o.h ?? 1.35), pos[2] + (o.d ?? 3.6)]; const l = [pos[0] + (o.lx ?? 0), pos[1] + (o.ly ?? 1.05), pos[2]]; return hold(p, l, o.fov ?? 38, { creep: o.creep ?? 0.07, roll: o.roll, roll2: o.roll2 }); };
/** dof focused on a head */
export const fh = (pos, c = 12, s = 1) => ({ p: [pos[0], pos[1] + HEAD * s, pos[2]], c });
export const walkStep = (t, rate = 1.7) => q((t * rate) % 1, 2);
export const bobW = (t, rate = 1.7) => q(Math.abs(Math.sin(t * rate * Math.PI * 2)) * 0.012, 3);
/** Leon's outfit by story time */
export const leonAt = (t, o = {}) => { if (o.outfit) return LEON[o.outfit]; if (t < 147.9) return o.home ? LEON.courierNoCap : LEON.courier; if (t < 371.2) return o.noShades ? LEON.richNoShades : LEON.rich; return LEON.hoodie; };
/** shortcut: Leon actor */
export const leon = (c, o, pos, ex) => A(c, leonAt(c.t, o), o, pos, ex);
export const ice = (melt) => (p) => {};

/** phone screen pixel x (0..540) -> local metres for the 0.3 m void phone */
export const pxm = (px) => (px / 540 - 0.5) * 0.132;
