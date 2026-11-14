// scene.js: builds every set once; per frame shows only the active set and lets it drive the shared light pool.
import { makeFx } from './fx3d.js';
import { O } from './layout.js';
import * as kit from './sets/kitchen.js';
import * as cells from './sets/cells.js';
import * as ext from './sets/ext.js';
import * as ws from './sets/workshop.js';
import * as cp from './sets/checkpoint.js';
import * as ug from './sets/under.js';
import * as car from './sets/car.js';
import * as hosp from './sets/hospital.js';
import * as forest from './sets/forest.js';
const MODS = { kit, cells, ext, ws, cp, ug, car, hosp, forest };
export const SETS = {};
const Lp = [], Sp = [];
export const build = (ctx) => {
  const { THREE } = ctx; const fx = makeFx(ctx);
  for (let i = 0; i < 4; i++) { const l = new THREE.PointLight('#ffffff', 0, 10, 2); ctx.scene.add(l); Lp.push(l); }
  for (let i = 0; i < 2; i++) { const s = new THREE.SpotLight('#ffffff', 0, 40, 0.35, 0.6, 1.2); ctx.scene.add(s); ctx.scene.add(s.target); Sp.push(s); }
  for (const [name, mod] of Object.entries(MODS)) {
    const G = new THREE.Group(); G.position.set(...O[name]); ctx.world.add(G);
    SETS[name] = { G, ...mod.build(ctx, fx, G) };
  }
};
export const update = (ctx, W, f) => {
  for (const [k, s] of Object.entries(SETS)) s.G.visible = k === W.set;
  Lp.forEach((l) => { l.intensity = 0; }); Sp.forEach((l) => { l.intensity = 0; });
  const s = SETS[W.set]; if (!s) return;
  if (s.lights) s.lights(Lp, f, Sp, W);
  if (s.update) s.update(W, f, ctx);
};
