// M8b: the woman's small car at night: dashboard glow, steering wheel, rain on the windscreen, street lights sweeping past.
import { paint, hash } from '../fx3d.js';
export const CAR = { woman: [0, 0, 0], wheel: [0.0, 1.0, 0.45] };
const S = {};
export function build(ctx, fx, G) {
  const { THREE, add, tbox, toon, P } = ctx;
  const M = { dash: toon({ color: '#2a2c34' }), seat: toon({ color: '#5a4a5a' }), trim: toon({ color: '#3a3c46' }), wheel: toon({ color: '#1e2026' }), glass: toon({ color: '#9ab8d8', transparent: true, opacity: 0.12 }),
    gauge: toon({ color: '#ffb060', emissive: '#ff8a30', emissiveIntensity: 1.2 }), road: toon({ map: P.tex((() => { const c = document.createElement('canvas'); c.width = c.height = 512; paint.asphalt(c.getContext('2d'), 512, 512, 61); return c; })(), 6, 60) }), pole: toon({ color: '#4a4e56' }), tree: toon({ color: '#1e3424' }) };
  // car body interior (the camera sits in the passenger seat looking left at her)
  add(tbox(1.6, 0.5, 0.5, 1), M.dash, 0.2, 0.95, 0.85, G); add(tbox(1.6, 0.08, 0.6, 1), M.trim, 0.2, 1.22, 0.78, G);
  for (const [x, y] of [[-0.12, 1.1], [0.12, 1.1]]) { add(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 18), M.gauge, x, y, 0.62, G).rotation.x = Math.PI / 2; }
  S.gGlow = fx.glow(G, [0, 1.1, 0.6], '#ff9a40', 0.6, 0.5);
  const wheel = new THREE.Group(); wheel.position.set(...CAR.wheel); wheel.rotation.x = -0.45; G.add(wheel); S.wheel = wheel;
  add(new THREE.TorusGeometry(0.19, 0.025, 10, 30), M.wheel, 0, 0, 0, wheel); add(tbox(0.36, 0.04, 0.02, 1), M.wheel, 0, 0, 0, wheel); add(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 14), M.wheel, 0, 0, 0, wheel).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), M.wheel, 0, -0.08, 0.2, G).position.set(0, 0.92, 0.6);
  add(tbox(0.6, 0.12, 0.6, 1), M.seat, 0, 0.45, -0.2, G); add(tbox(0.6, 0.9, 0.12, 1), M.seat, 0, 0.9, -0.5, G); add(tbox(0.3, 0.22, 0.1, 1), M.seat, 0, 1.45, -0.52, G);
  add(tbox(0.06, 1.0, 1.8, 1), M.trim, -0.42, 0.9, 0.1, G); // door
  add(tbox(0.04, 0.5, 1.2, 1), M.glass, -0.42, 1.55, 0.1, G, { cast: false }); // side window
  add(tbox(1.8, 0.06, 1.6, 1), M.trim, 0.2, 1.9, 0.1, G); // roof
  add(tbox(0.06, 0.9, 0.08, 1), M.trim, -0.4, 1.5, 0.75, G).rotation.x = -0.5; // A-pillar
  // dangling air freshener (tree shape, no text)
  const fr = new THREE.Group(); fr.position.set(0.15, 1.82, 0.6); G.add(fr); S.fresh = fr; add(new THREE.CylinderGeometry(0.002, 0.002, 0.14, 4), M.dash, 0, -0.07, 0, fr); add(new THREE.ConeGeometry(0.04, 0.09, 3), toon({ color: '#4ac86a' }), 0, -0.19, 0, fr);
  // rain drops on the side window + windscreen
  S.drops = fx.points(G, 120, { size: 0.02, color: '#cfe4ff', tex: 'dot' });
  // outside world (scrolls past along +z): road, lamp posts, trees
  const road = add(new THREE.PlaneGeometry(9, 600), M.road, -2.5, -0.3, -100, G, { cast: false }); road.rotation.x = -Math.PI / 2;
  S.posts = []; for (let k = 0; k < 10; k++) { const P_ = new THREE.Group(); G.add(P_); add(new THREE.CylinderGeometry(0.08, 0.1, 6, 8), M.pole, 0, 3, 0, P_); add(tbox(0.6, 0.15, 0.3, 1), toon({ color: '#ffd090', emissive: '#ff9a30', emissiveIntensity: 1.4 }), 0.3, 6, 0, P_); S.posts.push({ g: P_, gl: fx.glow(P_, [0.35, 5.9, 0], '#ffa040', 3, 0.9) }); }
  S.trees = []; for (let k = 0; k < 16; k++) { const t = add(new THREE.ConeGeometry(1.2, 4, 7), M.tree, 0, 2, 0, G); S.trees.push(t); }
  return {
    lights: (Lp, f, Sp, W) => { const o = G.position;
      Lp[0].position.set(o.x + 0.1, o.y + 1.15, o.z + 0.6); Lp[0].color.set('#ff9a40'); Lp[0].intensity = 0.35; Lp[0].distance = 1.5; Lp[0].decay = 2;
      // street light sweeping across her from front to back
      const ph = (f * 0.045) % 1, z = 3 - ph * 7; Lp[1].position.set(o.x - 4.5, o.y + 4, o.z + z); Lp[1].color.set('#ffa040'); Lp[1].intensity = 22 * Math.sin(ph * Math.PI); Lp[1].distance = 9; Lp[1].decay = 1.6;
      Lp[2].position.set(o.x + 0.4, o.y + 1.6, o.z - 0.2); Lp[2].color.set('#5a70b0'); Lp[2].intensity = 0.6; Lp[2].distance = 3; Lp[2].decay = 2;
    },
    update: (W, f) => { const t = f / 30; const shake = W.car && W.car.shake || 0;
      S.wheel.rotation.z = Math.sin(f * 1.7) * 0.03 * shake + Math.sin(t * 0.8) * 0.05;
      S.fresh.rotation.z = Math.sin(t * 3.1) * 0.25; S.fresh.rotation.x = Math.sin(t * 2.3) * 0.15;
      S.posts.forEach((p, k) => { const z = ((k * 12 - f * 0.55) % 120 + 120) % 120 - 90; p.g.position.set(-5.5, -0.3, z); });
      S.trees.forEach((tr, k) => { const z = ((k * 7.3 - f * 0.55) % 117 + 117) % 117 - 90; tr.position.set(-8.5 - hash(k, 1) * 6, 1.7, z); });
      S.drops.run(f, (i, f) => { const sd = hash(i, 1), side = i < 60; const y = side ? 1.32 + ((hash(i, 2) * 0.5 - f * 0.003 * (0.5 + sd)) % 0.5 + 0.5) % 0.5 : 1.5 + hash(i, 4) * 0.3; return side ? [-0.4, y, -0.45 + hash(i, 3) * 1.1, 0.6] : [-0.3 + hash(i, 3) * 1.1, y, 0.98 - (y - 1.5) * 0.5, 0.5]; });
    },
  };
}
