// scene.js: builds every location of "Die Milliarde" once; update() shows only the active set (W.set).
import { init, K, crowd, grp, rngf } from './common.js';
import { textures, buildApt, updateApt, buildStairs, buildKiez, updateKiez, buildImbiss, updateImbiss } from './sets1.js';
import { buildDepot, updateDepot, buildCity, updateCity, buildPent, updatePent, buildOma, updateOma } from './sets2.js';
import { buildOffice, updateOffice, buildBus, updateBus, buildHosp, updateHosp, buildMuseum, buildVoid, updateVoid } from './sets3.js';

export const SETS = {};
export const build = (ctx) => {
  init(ctx); textures(); ctx.addClouds(16, 90, 650, 110);
  const mk = (name, fn, upd) => { const root = grp(ctx.world); const A = fn(root); A.root = root; A.upd = upd; root.visible = false; SETS[name] = A; };
  mk('apt', buildApt, updateApt); mk('stairs', buildStairs); mk('kiez', buildKiez, updateKiez); mk('imbiss', buildImbiss, updateImbiss);
  mk('depot', buildDepot, updateDepot); mk('city', buildCity, updateCity); mk('pent', buildPent, updatePent); mk('oma', buildOma, updateOma);
  mk('office', buildOffice, updateOffice); mk('bus', buildBus, updateBus); mk('hosp', buildHosp, updateHosp); mk('museum', buildMuseum); mk('void', buildVoid, updateVoid);
  // crowds (pre-rendered cards on instanced planes)
  const T = ctx.T, G = T.GUESTS, r = rngf(4);
  const party = []; for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = 1.5 + r() * 5.5; const x = Math.cos(a) * d * 1.3, z = 9 + Math.sin(a) * d * 0.55; if (Math.abs(x) < 3.7 && Math.abs(z - 9.5) < 2.4) continue; party.push([x, 0, z, 0.9 + r() * 0.15]); }
  SETS.pent.S.crowd = crowd(SETS.pent.S.crowdRoot, G.map((s, i) => ({ spec: s, opts: { expr: ['laugh', 'goofy', 'happy'][i % 3], L: 'up', R: i % 2 ? 'wave' : 'up' } })), party);
  const q = []; for (let i = 0; i < 22; i++) q.push([4.5 + 1.4 + i * 0.85, 0.15, -5.2 + (i % 2) * 0.25, 0.95]);
  SETS.kiez.S.queue = crowd(SETS.kiez.G, [...G, ...T.KIDS.slice(0, 2)].map((s, i) => ({ spec: s, opts: { expr: ['happy', 'neutral', 'goofy'][i % 3], R: i % 3 ? 'hang' : 'hip' } })), q);
  const vis = []; for (let i = 0; i < 12; i++) { const a = Math.PI * 1.05 + (i / 11) * Math.PI * 0.9, d = 2.6 + (i % 3) * 0.8; vis.push([Math.cos(a) * d * 1.3, 0, -2.6 + Math.sin(a) * d * 0.9, 0.95]); }
  SETS.museum.S.crowd = crowd(SETS.museum.G, G.map((s, i) => ({ spec: s, opts: { expr: i % 2 ? 'shock' : 'goofy', R: i % 2 ? 'chin' : 'hang' } })), vis);
  const kids = []; for (let i = 0; i < 10; i++) kids.push([-3 + (i % 5) * 1.5, 0, 1.5 + Math.floor(i / 5) * 1.6, 0.6]);
};
export const update = (ctx, W, f) => {
  const t = W.t ?? f / 30;
  for (const [name, A] of Object.entries(SETS)) { const on = name === W.set; A.root.visible = on; if (on && A.upd) A.upd(A, W, t); }
  for (const c of ctx.clouds) c.visible = !!W.clouds;
  if (SETS.kiez.S.queue) { SETS.kiez.S.queue.groups.forEach((g) => (g.visible = W.set === 'kiez' && !!(W.kiez && W.kiez.queue))); if (W.set === 'kiez' && W.kiez && W.kiez.queue) SETS.kiez.S.queue.update(t, K.camera.position, 0.03); }
  if (SETS.museum.S.crowd && W.set === 'museum') SETS.museum.S.crowd.update(t, K.camera.position, 0.02);
};
