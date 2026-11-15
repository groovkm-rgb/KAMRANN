// scene.js: builds every location once (each in its own group) and shows only the one the current shot needs.
import * as W from './wlib.js';
import * as desert from './sets/desert.js';
import * as storm from './sets/storm.js';
import * as capital from './sets/capital.js';
import * as fly from './sets/fly.js';
import * as town from './sets/town.js';
import * as prairie from './sets/prairie.js';
import * as room from './sets/room.js';
import * as station from './sets/station.js';
import * as snow from './sets/snow.js';
import * as river from './sets/river.js';
import * as big from './sets/big.js';
import * as office from './sets/office.js';
const ALL = { desert, storm, capital, fly, town, prairie, room, station, snow, river, big, office };
const SETS = {};
const mods = {};
let soft = null, hard = null, glow = null;
export const build = (ctx) => {
  W.init(ctx);
  for (const n in ALL) {
    const m = ALL[n]; mods[n] = m;
    const root = new ctx.THREE.Group(); root.visible = false; ctx.world.add(root);
    SETS[n] = { root, S: m.build(ctx, root) };
  }
  soft = W.particles(ctx.scene, 2600, W.softCanvas(255, 255, 255));
  hard = W.particles(ctx.scene, 2600, W.softCanvas(255, 255, 255, 0.55));
  glow = W.particles(ctx.scene, 800, W.softCanvas(255, 255, 255, 0.2), true);
};
const emit = (sys, list, f, startIdx = 0) => {
  let i = startIdx;
  for (const e of list || []) {
    const every = e.every || 1, life = e.life || 30;
    const f0 = Math.max(e.from ?? 0, f - life), f1 = Math.min(f, e.to ?? f);
    for (let s = Math.ceil(f0 / every) * every; s <= f1 && i < sys.n; s += every) {
      for (let k = 0; k < (e.per || 1) && i < sys.n; k++) {
        const age = (f - s) / life; if (age < 0 || age > 1) continue;
        const R = W.rng(Math.floor(s * 7.31 + k * 131 + (e.seed || 0) * 977)); R(); const p = e.path(s);
        const sp = e.spread || 0.6, v = e.vel || [0, 0, 0], gv = e.grav || 0, tt = (f - s) / 30;
        const x = p[0] + (R() - 0.5) * sp + (v[0] + (R() - 0.5) * (e.jit || 0)) * tt, y = p[1] + (R() - 0.3) * sp * 0.4 + (v[1] + R() * (e.rise || 0)) * tt - gv * tt * tt * 0.5,
          z = p[2] + (R() - 0.5) * sp + (v[2] + (R() - 0.5) * (e.jit || 0)) * tt;
        if (e.floor !== undefined && y < e.floor) continue;
        const size = W.lerp(e.size[0], e.size[1], Math.pow(age, 0.6)) * (0.7 + R() * 0.6);
        const a = (e.alpha ?? 0.6) * (e.fadeIn ? Math.min(1, age * 6) : 1) * Math.pow(1 - age, e.fade || 1.2);
        const c = e.col || [1, 1, 1], cv = e.colVar || 0;
        sys.set(i++, x, y, z, size, a, c[0] * (1 - cv * R()), c[1] * (1 - cv * R()), c[2] * (1 - cv * R()));
      }
    }
  }
  return i;
};
const field = (sys, fl, f, cam, i0) => { // ambient field around the camera: snow, motes, rain of paper...
  let i = i0; if (!fl) return i;
  const R = W.rng(fl.seed || 5), t = f / 30, B = fl.box || [20, 12, 20];
  for (let k = 0; k < fl.n && i < sys.n; k++) {
    const bx = R() * B[0], by = R() * B[1], bz = R() * B[2], sp = 0.7 + R() * 0.6;
    const wrap = (v, b) => ((v % b) + b) % b - b / 2;
    const x = cam[0] + wrap(bx + fl.wind[0] * t * sp + Math.sin(t * 1.3 + k) * (fl.wob || 0) - cam[0], B[0]);
    const y = cam[1] + wrap(by + fl.wind[1] * t * sp - cam[1] + (fl.y0 || 0), B[1]);
    const z = cam[2] + wrap(bz + fl.wind[2] * t * sp - cam[2], B[2]);
    const c = fl.col || [1, 1, 1];
    sys.set(i++, x, Math.max(fl.floor ?? -99, y), z, fl.size * (0.5 + R()), (fl.alpha || 0.8) * (0.5 + R() * 0.5), c[0], c[1], c[2]);
  }
  return i;
};
export const update = (ctx, Wd, f) => {
  for (const n in SETS) { const on = n === Wd.loc || (Wd.also || []).includes(n); SETS[n].root.visible = on; if (on && mods[n].update) mods[n].update(SETS[n].S, Wd, f); }
  soft.clear(); hard.clear(); glow.clear();
  let i = emit(soft, Wd.dust, f); i = field(soft, Wd.mist, f, Wd.cam, i);
  let j = emit(hard, Wd.clods, f); j = field(hard, Wd.snow, f, Wd.cam, j);
  let k = emit(glow, Wd.sparks, f); k = field(glow, Wd.motes, f, Wd.cam, k);
  soft.commit(); hard.commit(); glow.commit();
};
