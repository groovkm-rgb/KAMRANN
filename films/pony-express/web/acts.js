// acts.js: actor card builders (consistent rider design everywhere).
import { q } from './motion.js';
const R2 = (o) => JSON.stringify(o, (k, v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v));
const wrapRim = (T, rim, fn) => (p) => T.rimWrap(p, fn, rim);
export const RIDER_HAT = '#c8a070';
export const A = {
  /** rider options for a mounted rider. lean (deg), lift, expr, scarf (phase driver), extra opts */
  rider: ({ lean = 20, lift = 0, expr = 'determined', scarf = 0, spec = 'rider', opts = {}, s = 0.56, L, R, noReins, knee } = {}) => ({ specName: spec, lean, lift, s, L, R, noReins, knee,
    opts: { expr, hatBack: spec === 'rider' ? RIDER_HAT : undefined, hatBackDx: -110, hatBackY: 360, hatBackA: -12, pouch: spec === 'rider' ? {} : undefined,
      scarfTail: { ph: q(scarf * 0.13, 2), dir: -1, c: spec === 'rider' ? '#d0302c' : '#2e9a4a', len: 0.9 }, ...opts } }),
  horseSide: (T, o, pos, s = 1.8, x = {}) => { const o2 = { ...o, t: q(o.t || 0, 1), phase: q(o.phase || 0, 3) }; if (o2.rider) o2.rider = { ...o2.rider, spec: T.WEST[o2.rider.specName] };
    return { key: 'HS' + R2([o, x.rim]), draw: wrapRim(T, x.rim, (p) => T.drawHorseSide(p, o2)), x: pos[0], y: pos[1], z: pos[2], s, ...x }; },
  horseFront: (T, o, pos, s = 1.8, x = {}) => { const o2 = { ...o, t: q(o.t || 0, 1), phase: q(o.phase || 0, 3) };
    o2.rider = o.rider === false ? null : { spec: T.WEST.rider, x: 372, y: 566, s: 0.6, tilt: 5, opts: { expr: 'determined', hatBack: RIDER_HAT, hatBackDx: 150, hatBackY: 380, hatBackA: 20, pouch: {}, iris: '#2f7fd8', R: { x: 318, y: 520, b: 0.4 }, L: { x: 150, y: 560, b: 0.6 }, scarfTail: { ph: q((o.t || 0) * 0.13, 2), dir: 1, len: 0.6, up: -1 }, ...(o.riderOpts || {}) } };
    return { key: 'HF' + R2([o, x.rim]), draw: wrapRim(T, x.rim, (p) => T.drawHorseFront(p, o2)), x: pos[0], y: pos[1], z: pos[2], s, ...x }; },
  person: (T, spec, opts, pos, s = 1, x = {}) => ({ key: 'P' + R2([spec, opts, x.rim]), draw: wrapRim(T, x.rim, (p) => T.toonChar(p, typeof spec === 'string' ? T.WEST[spec] : spec, opts)), x: pos[0], y: pos[1], z: pos[2], s, ...x }),
  fx: (key, draw, pos, s, x = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...x }),
};
