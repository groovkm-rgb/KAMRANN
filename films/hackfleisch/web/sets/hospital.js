// M8c: hospital entrance at night: canopy, lit "Krankenhaus" monument sign at the driveway, sliding glass doors,
// wet asphalt, light rain, her small car turning in.
import { paint, hash } from '../fx3d.js';
export const HOSP = { sign: [-1.6, 1.25, 1.5], door: [0, 0, -9] };
const S = {};
export function build(ctx, fx, G) {
  const { THREE, add, tbox, toon, P } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const M = {
    facade: toon({ map: P.tex(cv(512, 512, (g, w, h) => paint.concrete(g, w, h, '#c8ccd0', 71)), 3, 2) }), asphalt: toon({ map: P.tex(cv(512, 512, (g, w, h) => paint.asphalt(g, w, h, 72)), 8, 8) }),
    winOn: toon({ color: '#fff2d0', emissive: '#e8c890', emissiveIntensity: 0.9 }), winOff: toon({ color: '#2a3448' }), glass: toon({ color: '#fff4dc', emissive: '#ffe0a8', emissiveIntensity: 1.2 }),
    canopy: toon({ color: '#e8ecf0' }), pole: toon({ color: '#8a9098' }), grass: toon({ color: '#24402c' }), kerb: toon({ color: '#9a9a98' }), dark: toon({ color: '#1c1e24' }), carR: toon({ color: '#c8403a' }),
  };
  const gnd = add(new THREE.PlaneGeometry(80, 80), M.asphalt, 0, 0, -10, G, { cast: false }); gnd.rotation.x = -Math.PI / 2;
  // building: 4 floors, lit windows
  add(tbox(30, 14, 8, 4), M.facade, 0, 7, -13.5, G);
  const wl = []; for (let r = 0; r < 4; r++) for (let k = 0; k < 12; k++) wl.push({ p: [-13.2 + k * 2.4, 4 + r * 3.0, -9.45], c: hash(r * 13 + k, 2) > 0.35 ? '#fff0c8' : '#2a3448' });
  fx.inst(G, new THREE.BoxGeometry(1.4, 1.6, 0.06), toon({ color: '#ffffff', emissive: '#5a5040', emissiveIntensity: 0.7 }), wl, { cast: false });
  // entrance: glass sliding doors + canopy + red cross-free emblem (no text other than the sign)
  S.doorL = add(tbox(1.1, 2.3, 0.06, 1), M.glass, -0.56, 1.15, -9.42, G, { cast: false }); S.doorR = add(tbox(1.1, 2.3, 0.06, 1), M.glass, 0.56, 1.15, -9.42, G, { cast: false });
  add(tbox(2.6, 0.2, 0.2, 1), M.dark, 0, 2.4, -9.4, G);
  add(tbox(7, 0.3, 4.5, 1), M.canopy, 0, 3.3, -7.3, G); for (const x of [-3.2, 3.2]) add(new THREE.CylinderGeometry(0.1, 0.1, 3.3, 10), M.pole, x, 1.65, -5.3, G);
  S.doorGlow = fx.glow(G, [0, 1.3, -9.2], '#ffe8b8', 4.5, 0.7); S.doorPool = fx.quad(G, [0, 0.02, -7.0], 6, 4.5, '#ffe0a8', 0.45, { rx: -Math.PI / 2 });
  // monument sign at the driveway (readable, mid-height)
  add(tbox(3.6, 1.3, 0.4, 1), M.dark, HOSP.sign[0], HOSP.sign[1], HOSP.sign[2] - 0.22, G); add(tbox(3.8, 0.3, 0.6, 1), M.kerb, HOSP.sign[0], 0.15, HOSP.sign[2] - 0.22, G);
  S.sign = fx.sign(G, HOSP.sign, 3.4, 1.1, 1240, 400, (g, w, h) => {
    g.fillStyle = '#f4f8fc'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a5aa8'; g.fillRect(0, 0, w, 56); g.fillRect(0, h - 56, w, 56);
    g.fillStyle = '#14305a'; g.font = 'bold 100px "DejaVu Sans", sans-serif'; const mw = g.measureText('Krankenhaus').width; const fs = Math.min(190, 100 * (w * 0.86) / mw); g.font = `bold ${fs}px "DejaVu Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Krankenhaus', w / 2, h / 2 + 6);
  }, { fog: false });
  S.signGlow = fx.glow(G, [HOSP.sign[0], HOSP.sign[1], HOSP.sign[2] + 0.2], '#d8ecff', 5, 0.35);
  // driveway kerbs, grass islands, bollards with lights, a parked ambulance-like van (no text)
  for (const [x, z, w, d] of [[-8, 2, 8, 3], [8, 2, 8, 3], [-8, -4, 4, 4], [8, -4, 4, 4]]) { add(tbox(w, 0.15, d, 1), M.kerb, x, 0.075, z, G); add(tbox(w - 0.2, 0.16, d - 0.2, 1), M.grass, x, 0.08, z, G); }
  S.bollards = []; for (const [x, z] of [[-2.8, -2], [2.8, -2], [-2.8, -5], [2.8, -5]]) { add(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 10), M.pole, x, 0.45, z, G); S.bollards.push(fx.glow(G, [x, 0.92, z], '#fff0d0', 0.6, 0.8)); }
  const van = new THREE.Group(); van.position.set(9, 0, -6.5); G.add(van); add(tbox(2.0, 2.2, 5, 1), toon({ color: '#f2f2ee' }), 0, 1.4, 0, van); add(tbox(2.02, 0.3, 5.02, 1), toon({ color: '#e8b020' }), 0, 1.0, 0, van); for (const [dz, dx] of [[1.6, 0.9], [1.6, -0.9], [-1.6, 0.9], [-1.6, -0.9]]) add(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 14), M.dark, dx, 0.38, dz, van).rotation.z = Math.PI / 2;
  S.vanLight = fx.glow(van, [0, 2.6, 2.0], '#4a8aff', 1.0, 0.5);
  // her car (small hatchback) drives in
  const car = new THREE.Group(); G.add(car); S.car = car;
  add(tbox(1.7, 0.7, 3.4, 1), M.carR, 0, 0.6, 0, car); add(tbox(1.5, 0.6, 1.8, 1), M.carR, 0, 1.2, -0.2, car); add(tbox(1.52, 0.5, 1.7, 1), toon({ color: '#1a2230' }), 0, 1.22, -0.2, car, { cast: false });
  for (const [dx, dz] of [[0.85, 1.1], [-0.85, 1.1], [0.85, -1.1], [-0.85, -1.1]]) add(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14), M.dark, dx, 0.3, dz, car).rotation.z = Math.PI / 2;
  S.head = [fx.glow(car, [0.55, 0.65, 1.72], '#fff8e0', 1.4, 1), fx.glow(car, [-0.55, 0.65, 1.72], '#fff8e0', 1.4, 1)]; S.headBeams = [fx.beam(car, [0.55, 0.65, 1.72], 9, 0.08, 1.6, '#fff4d8', 0.2), fx.beam(car, [-0.55, 0.65, 1.72], 9, 0.08, 1.6, '#fff4d8', 0.2)];
  S.tail = [fx.glow(car, [0.6, 0.75, -1.72], '#ff2020', 0.6, 0.9), fx.glow(car, [-0.6, 0.75, -1.72], '#ff2020', 0.6, 0.9)];
  // rain + puddle glints
  S.rain = fx.streaks(G, 220, '#9ab8e8'); S.puddles = []; for (let k = 0; k < 8; k++) S.puddles.push(fx.quad(G, [-6 + hash(k, 1) * 12, 0.015, -6 + hash(k, 2) * 9], 1.4 + hash(k, 3) * 1.4, 0.6 + hash(k, 4), '#ffe0b0', 0.2, { rx: -Math.PI / 2 }));
  // trees along the drive (foreground layer)
  for (const [x, z] of [[-5.5, 3.5], [5.6, 3.8], [-11, -2], [12, 0]]) { add(new THREE.CylinderGeometry(0.15, 0.2, 3, 8), toon({ color: '#3a2c24' }), x, 1.5, z, G); for (let k = 0; k < 3; k++) add(new THREE.IcosahedronGeometry(1.2 - k * 0.2, 1), toon({ color: '#1e3a26' }), x + (k - 1) * 0.4, 3.2 + k * 0.7, z, G); }
  return {
    lights: (Lp, f, Sp, W) => { const o = G.position, h = W.hosp || {};
      Lp[0].position.set(o.x, o.y + 2.6, o.z - 7.5); Lp[0].color.set('#ffe0a8'); Lp[0].intensity = 7; Lp[0].distance = 12; Lp[0].decay = 1.8;
      Lp[1].position.set(o.x + HOSP.sign[0], o.y + 1.3, o.z + HOSP.sign[2] + 1.2); Lp[1].color.set('#d8ecff'); Lp[1].intensity = 2.5; Lp[1].distance = 5; Lp[1].decay = 2;
      const c = S.car.position; Lp[2].position.set(o.x + c.x + Math.sin(S.car.rotation.y) * 3, o.y + 0.8, o.z + c.z + Math.cos(S.car.rotation.y) * 3); Lp[2].color.set('#fff4d8'); Lp[2].intensity = 9; Lp[2].distance = 9; Lp[2].decay = 1.6;
      Lp[3].position.set(o.x + 9, o.y + 2.8, o.z - 4.5); Lp[3].color.set('#4a7aff'); Lp[3].intensity = 1.2 * (0.5 + 0.5 * Math.sin(f * 0.6)); Lp[3].distance = 6; Lp[3].decay = 2;
    },
    update: (W, f) => { const h = W.hosp || {};
      const p = h.car || [0, 0, 0, 0]; S.car.position.set(p[0], 0, p[2]); S.car.rotation.y = p[3];
      const open = h.door || 0; S.doorL.position.x = -0.56 - open * 1.0; S.doorR.position.x = 0.56 + open * 1.0;
      S.headBeams.forEach((b) => b.rotation.set(Math.PI / 2 - 0.08, 0, 0));
      S.vanLight.material.opacity = 0.5 + 0.5 * Math.sin(f * 0.6);
      S.rain.run(f, (i, f) => { const ph = ((f * 0.9 + i * 3.1) % 20) / 20; return [-8 + hash(i, 1) * 16, 7 - ph * 7, -8 + hash(i, 2) * 12, 0.02, 0.35, 0.0, 0.5]; });
      S.puddles.forEach((q, k) => { q.material.opacity = 0.14 + 0.08 * Math.sin(f * 0.2 + k); });
    },
  };
}
