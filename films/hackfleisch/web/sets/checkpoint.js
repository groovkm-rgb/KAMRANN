// Checkpoint at the prison entrance: walk-through metal detector (blinks), x-ray belt, guard booth with window,
// fluorescent tubes, glass doors with cold morning light, yellow floor marks.
import { paint, hash } from '../fx3d.js';
export const CP = { gate: [0, 0, 0], booth: [1.6, 0, 0.9], guard: [1.75, 0, 1.2] };
const S = {};
export function build(ctx, fx, G) {
  const { THREE, add, tbox, toon, P } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const tm = (c, rx = 1, ry = 1) => toon({ map: P.tex(c, rx, ry) });
  const M = {
    floor: tm(cv(512, 512, (g, w, h) => paint.tiles(g, w, h, '#a8aca6', '#8a908a', 6)), 4, 4), wall: tm(cv(512, 512, (g, w, h) => { paint.concrete(g, w, h, '#c8ccc4', 41); g.fillStyle = '#5a7a6a'; g.fillRect(0, h * 0.62, w, h * 0.38); }), 2, 1),
    ceil: toon({ color: '#9aa09a' }), frame: toon({ color: '#d8dcd8' }), dark: toon({ color: '#24282e' }), booth: toon({ color: '#6a7a7a' }), glass: toon({ color: '#b8d8e0', transparent: true, opacity: 0.35 }),
    belt: toon({ color: '#2a2c30' }), xray: toon({ color: '#c8ccc4' }), yellow: toon({ color: '#e8c030' }), tube: toon({ color: '#f4fff8', emissive: '#d8ffe8', emissiveIntensity: 1.3 }), door: toon({ color: '#cfe8ff', emissive: '#9ab8d8', emissiveIntensity: 0.9 }),
  };
  add(tbox(10, 0.1, 10, 2), M.floor, 0, -0.05, 0, G, { cast: false }); add(tbox(10, 0.1, 10, 2), M.ceil, 0, 3.1, 0, G, { cast: false });
  add(tbox(10, 3.2, 0.12, 3), M.wall, 0, 1.6, -2.4, G, { cast: false }); for (const sx of [-1, 1]) add(tbox(0.12, 3.2, 10, 3), M.wall, sx * 4.2, 1.6, 0, G, { cast: false });
  // glass doors at the left end (cold daylight)
  add(tbox(0.1, 2.4, 2.2, 1), M.door, -4.12, 1.2, 0.4, G, { cast: false }); for (const z of [-0.7, 0.4, 1.5]) add(tbox(0.14, 2.5, 0.08, 1), M.dark, -4.08, 1.25, z, G);
  S.doorBeam = fx.beam(G, [-4.0, 2.3, 0.4], 6, 0.8, 2.2, '#d8ecff', 0.14); S.doorBeam.aim(G.position.x + 0, G.position.y, G.position.z + 0.6);
  S.doorPool = fx.quad(G, [-2.2, 0.01, 0.5], 3.4, 2.2, '#cfe4ff', 0.3, { rx: -Math.PI / 2 });
  // metal detector gate
  const gate = new THREE.Group(); gate.position.set(...CP.gate); gate.rotation.y = Math.PI / 2; G.add(gate);
  for (const sx of [-0.48, 0.48]) add(tbox(0.16, 2.2, 0.5, 1), M.frame, sx, 1.1, 0, gate); add(tbox(1.12, 0.18, 0.5, 1), M.frame, 0, 2.29, 0, gate);
  for (const sx of [-0.48, 0.48]) for (let k = 0; k < 6; k++) add(tbox(0.02, 0.08, 0.3, 1), M.dark, sx * 0.84, 0.4 + k * 0.28, 0, gate);
  S.gLight = add(tbox(0.3, 0.06, 0.08, 1), toon({ color: '#ff3020', emissive: '#ff2010', emissiveIntensity: 1 }), 0, 2.4, 0.22, gate); S.gGlow = fx.glow(gate, [0, 2.42, 0.3], '#ff3020', 0.9, 0);
  S.gLight2 = add(tbox(0.3, 0.06, 0.08, 1), toon({ color: '#30ff60', emissive: '#10c040', emissiveIntensity: 0.4 }), 0, 2.4, -0.22, gate);
  // yellow floor marks + x-ray belt + trays
  for (const z of [-0.45, 0.45]) { const m = add(new THREE.PlaneGeometry(3.6, 0.08), M.yellow, -1.5, 0.006, z, G, { cast: false }); m.rotation.x = -Math.PI / 2; }
  add(tbox(2.2, 0.75, 0.7, 1), M.xray, -1.6, 0.375, -1.3, G); add(tbox(2.4, 0.04, 0.6, 1), M.belt, -1.6, 0.77, -1.3, G); add(tbox(0.8, 0.7, 0.75, 1), M.xray, -1.6, 1.12, -1.3, G);
  for (let k = 0; k < 6; k++) add(tbox(0.02, 0.45, 0.6, 1), M.dark, -1.98 + k * 0.03, 1.0, -1.3, G);
  for (let k = 0; k < 3; k++) add(tbox(0.42, 0.06, 0.32, 1), toon({ color: '#8a9aa8' }), -3.0 + k * 0.05, 0.8 + k * 0.06, -1.3, G);
  // guard booth (window + counter) in the foreground right
  const B = new THREE.Group(); B.position.set(...CP.booth); G.add(B);
  add(tbox(1.6, 1.0, 0.1, 1), M.booth, 0, 0.5, -0.5, B); add(tbox(1.7, 0.05, 0.5, 1), toon({ color: '#c8b890' }), 0, 1.02, -0.4, B);
  add(tbox(1.6, 1.4, 0.04, 1), M.glass, 0, 1.75, -0.55, B, { cast: false }); add(tbox(1.7, 0.08, 0.12, 1), M.dark, 0, 2.48, -0.55, B); for (const sx of [-0.8, 0.8]) add(tbox(0.08, 2.5, 0.12, 1), M.dark, sx, 1.25, -0.55, B);
  add(tbox(0.4, 0.3, 0.25, 1), M.dark, 0.45, 1.2, -0.3, B); S.screen = add(tbox(0.36, 0.24, 0.01, 1), toon({ color: '#90c0ff', emissive: '#4a80c0', emissiveIntensity: 1 }), 0.45, 1.2, -0.17, B, { cast: false });
  // coffee mug on the counter + steam (foreground)
  add(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 14), toon({ color: '#e8d6a0' }), -0.45, 1.1, -0.35, B);
  S.steam = fx.puffs(G, 8, '#f0f4f4', { fog: true }); S.mugAt = [CP.booth[0] - 0.45, 1.18, CP.booth[2] - 0.35];
  // fluorescent tubes
  S.tubes = []; for (const x of [-2.5, 0, 2.5]) { const tg = new THREE.Group(); tg.position.set(x, 3.0, 0.2); G.add(tg); add(tbox(1.3, 0.06, 0.16, 1), M.dark, 0, 0.03, 0, tg); const t_ = add(tbox(1.2, 0.04, 0.07, 1), M.tube, 0, -0.02, 0, tg, { cast: false }); S.tubes.push({ m: t_, gl: fx.glow(tg, [0, -0.08, 0], '#e8fff0', 1.5, 0.4) }); }
  S.dust = fx.points(G, 80, { size: 0.014, color: '#eef6ff' });
  return {
    lights: (Lp, f, Sp, W) => { const o = G.position, c = W.cp || {};
      for (let k = 0; k < 2; k++) { Lp[k].position.set(o.x - 1.2 + k * 2.4, o.y + 2.8, o.z + 0.2); Lp[k].color.set('#dcffe8'); Lp[k].intensity = 2.8; Lp[k].distance = 8; Lp[k].decay = 2; }
      Lp[2].position.set(o.x - 3.6, o.y + 1.8, o.z + 0.4); Lp[2].color.set('#cfe4ff'); Lp[2].intensity = 3.5; Lp[2].distance = 6; Lp[2].decay = 2;
      Lp[3].position.set(o.x, o.y + 2.3, o.z + 0.4); Lp[3].color.set('#ff3020'); Lp[3].intensity = c.alarm ? 1.6 : 0; Lp[3].distance = 3; Lp[3].decay = 2;
    },
    update: (W, f) => { const c = W.cp || {};
      S.gLight.material.emissiveIntensity = c.alarm ? 1.6 : 0.15; S.gGlow.material.opacity = c.alarm ? 0.8 : 0;
      S.steam.run(f, (i, f) => { const life = 50, ph = ((f + i * 6) % life) / life; return [S.mugAt[0] + Math.sin(ph * 6 + i) * 0.03, S.mugAt[1] + ph * 0.45, S.mugAt[2], 0.08 + ph * 0.14, 0.35 * Math.sin(ph * Math.PI)]; });
      S.dust.run(f, (i, f) => [-3.5 + hash(i, 1) * 3.5 + Math.sin(f * 0.02 + i) * 0.05, 0.4 + hash(i, 2) * 2.2, -0.6 + hash(i, 3) * 2.2, 0.3 + 0.7 * Math.abs(Math.sin(f * 0.05 + i))]);
      S.screen.material.emissiveIntensity = 0.8 + 0.2 * Math.sin(f * 0.9);
    },
  };
}
