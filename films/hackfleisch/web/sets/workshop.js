// M3: prison tailor workshop. Rows of sewing machines, fabric rolls, grey uniforms on racks, buzzing fluorescent tubes,
// high barred windows with cold daylight; the woman's machine at the front with a warm work lamp.
import { paint, hash, clamp } from '../fx3d.js';
export const WS = { woman: [0.15, 0, -0.55], machine: [0.0, 0.78, 0.05], table: [0.0, 0.76, 0.0], hand: [0.42, 0.8, 0.12] };
const S = {};
export function build(ctx, fx, G) {
  const { THREE, add, tbox, toon, P } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const tm = (c, rx = 1, ry = 1, color = '#ffffff') => toon({ map: P.tex(c, rx, ry), color });
  const M = {
    wall: tm(cv(512, 512, (g, w, h) => { paint.concrete(g, w, h, '#b8c0b4', 31); g.fillStyle = '#6a8a78'; g.fillRect(0, h * 0.6, w, h * 0.4); }), 3, 1), floor: tm(cv(512, 512, (g, w, h) => paint.concrete(g, w, h, '#7a7c76', 32)), 4, 4),
    ceil: toon({ color: '#8a908a' }), table: tm(cv(256, 256, (g, w, h) => paint.wood(g, w, h, [34, 26, 58], 33)), 1, 1), leg: toon({ color: '#4a5058' }),
    mach: toon({ color: '#2e3a3a' }), machL: toon({ color: '#d8d0b8' }), chrome: toon({ color: '#c8ccd0' }), tube: toon({ color: '#f4fff8', emissive: '#d8ffe8', emissiveIntensity: 1.3 }),
    grey: toon({ color: '#8a9098' }), greyD: toon({ color: '#6a7078' }), dark: toon({ color: '#20242a' }), win: toon({ color: '#d8e8f0', emissive: '#a8c0d0', emissiveIntensity: 0.9 }),
  };
  add(tbox(14, 0.1, 12, 2), M.floor, 0, -0.05, -3, G, { cast: false }); add(tbox(14, 0.1, 12, 2), M.ceil, 0, 3.65, -3, G, { cast: false });
  add(tbox(14, 3.7, 0.12, 3), M.wall, 0, 1.85, -8.5, G, { cast: false }); for (const sx of [-1, 1]) add(tbox(0.12, 3.7, 12, 3), M.wall, sx * 6.5, 1.85, -3, G, { cast: false });
  add(tbox(14, 3.7, 0.12, 3), M.wall, 0, 1.85, 3.2, G, { cast: false });
  // high barred windows in the back wall + cold daylight beams
  S.winBeams = [];
  for (const x of [-4.5, -1.5, 1.5, 4.5]) { add(tbox(1.6, 0.9, 0.1, 1), M.win, x, 3.0, -8.42, G, { cast: false }); for (let k = -3; k <= 3; k++) add(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), M.dark, x + k * 0.22, 3.0, -8.36, G);
    const b = fx.beam(G, [x, 3.0, -8.3], 9, 0.5, 1.6, '#dceeff', 0.12); b.aim(G.position.x + x + 1.5, G.position.y, G.position.z - 3.5); S.winBeams.push(b); }
  // rows of work tables with machines (background inmates sit here)
  const machine = (x, z, ry, big = false) => { const Mg = new THREE.Group(); Mg.position.set(x, 0.78, z); Mg.rotation.y = ry; G.add(Mg);
    add(tbox(0.46, 0.06, 0.2, 1), M.mach, 0, 0.03, 0, Mg); add(tbox(0.09, 0.24, 0.14, 1), M.mach, 0.17, 0.18, 0, Mg); add(tbox(0.42, 0.08, 0.13, 1), M.mach, 0.0, 0.32, 0, Mg);
    add(tbox(0.1, 0.16, 0.12, 1), M.mach, -0.17, 0.22, 0, Mg); add(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 14), M.chrome, 0.23, 0.2, 0, Mg).rotation.z = Math.PI / 2;
    add(tbox(0.3, 0.02, 0.135, 1), M.machL, 0.0, 0.34, 0, Mg); add(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 10), toon({ color: '#d8303a' }), 0.06, 0.39, 0, Mg);
    const nb = new THREE.Group(); nb.position.set(-0.17, 0.14, 0); Mg.add(nb); add(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6), M.chrome, 0, 0, 0, nb); return { Mg, nb }; };
  S.bgMachines = [];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { const x = -4.2 + k * 2.8, z = -2.6 - r * 1.9;
    add(tbox(1.6, 0.06, 0.8, 1), M.table, x, 0.75, z, G); for (const dx of [-0.7, 0.7]) for (const dz of [-0.32, 0.32]) add(tbox(0.05, 0.75, 0.05, 1), M.leg, x + dx, 0.375, z + dz, G);
    S.bgMachines.push(machine(x, z, 0)); add(tbox(0.5, 0.02, 0.4, 1), M.grey, x + 0.45, 0.79, z + 0.05, G); }
  // fabric rolls on shelves (right wall) + uniforms on racks (left)
  for (let r = 0; r < 3; r++) { add(tbox(0.6, 0.04, 4, 1), M.table, 6.1, 0.6 + r * 0.9, -4, G); for (let k = 0; k < 7; k++) { const rl = add(new THREE.CylinderGeometry(0.13, 0.13, 0.55, 14), toon({ color: ['#7a8088', '#5a6a5a', '#8a8070', '#6a7080', '#9a9a90'][(k + r) % 5] }), 6.1, 0.76 + r * 0.9, -5.6 + k * 0.5, G); rl.rotation.z = Math.PI / 2; } }
  for (let k = 0; k < 2; k++) { const rx_ = -5.8, rz = -1.5 - k * 3; add(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 6), M.chrome, rx_, 1.75, rz, G).rotation.x = Math.PI / 2; for (const dz of [-1.15, 1.15]) add(tbox(0.04, 1.75, 0.04, 1), M.chrome, rx_, 0.875, rz + dz, G);
    for (let j = 0; j < 8; j++) { const sh = add(tbox(0.06, 0.8, 0.5, 1), j % 2 ? M.grey : M.greyD, rx_, 1.3, rz - 1.0 + j * 0.28, G); sh.rotation.y = 0.15; } }
  // fluorescent tubes (rows)
  S.tubes = [];
  for (let r = 0; r < 3; r++) for (const x of [-3, 0, 3]) { const tg = new THREE.Group(); tg.position.set(x, 3.5, -1 - r * 2.6); G.add(tg); add(tbox(1.3, 0.06, 0.16, 1), M.dark, 0, 0.03, 0, tg); const t_ = add(tbox(1.2, 0.04, 0.07, 1), M.tube, 0, -0.02, 0, tg, { cast: false }); S.tubes.push({ m: t_, gl: fx.glow(tg, [0, -0.08, 0], '#e8fff0', 1.6, 0.4) }); }
  // ---- the woman's work table (front) ----
  add(tbox(1.5, 0.06, 0.85, 1), M.table, 0, 0.75, 0, G); for (const dx of [-0.68, 0.68]) for (const dz of [-0.36, 0.36]) add(tbox(0.05, 0.75, 0.05, 1), M.leg, dx, 0.375, dz, G);
  const hero = machine(WS.machine[0], WS.machine[2], 0, true); S.needle = hero.nb; S.hero = hero.Mg; hero.Mg.scale.setScalar(1.25);
  // fabric under the needle (grey uniform cloth) that feeds; thread from spool to needle
  const clothTex = ctx.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7e868e'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,44,50,.35)'; g.lineWidth = 2; for (let x = 0; x < w; x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } g.strokeStyle = '#d8303a'; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(0, 128); g.lineTo(w, 128); g.stroke(); });
  clothTex.wrapS = clothTex.wrapT = THREE.RepeatWrapping; S.clothTex = clothTex;
  const cloth = add(new THREE.PlaneGeometry(0.7, 0.5), toon({ map: clothTex, side: THREE.DoubleSide }), -0.22, 0.785, 0.06, G, { cast: false }); cloth.rotation.x = -Math.PI / 2;
  // warm work lamp clipped to the table
  const lamp = new THREE.Group(); lamp.position.set(0.95, 0.78, 0.3); G.add(lamp); add(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), M.dark, 0, 0.25, 0, lamp); const lh = add(new THREE.ConeGeometry(0.1, 0.13, 14, 1, true), toon({ color: '#2a6a5a', side: THREE.DoubleSide }), -0.12, 0.5, 0.05, lamp); lh.rotation.z = 0.7;
  S.lampGlow = fx.glow(lamp, [-0.17, 0.45, 0.06], '#ffd8a0', 0.6, 0.8); S.lampPool = fx.quad(G, [0.1, 0.785, 0.05], 0.9, 0.7, '#ffc880', 0.35, { rx: -Math.PI / 2 });
  // tape, scissors, pin cushion, thread spools on her table (detail)
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 14), toon({ color: '#d84a5a' }), 0.5, 0.81, 0.25, G);
  for (let k = 0; k < 4; k++) add(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 10), toon({ color: ['#d8303a', '#3a6ad8', '#e8c040', '#2a8a4a'][k] }), -0.6 + k * 0.07, 0.81, 0.3, G);
  const sc = add(tbox(0.16, 0.01, 0.05, 1), M.chrome, 0.35, 0.785, 0.32, G); sc.rotation.y = 0.5;
  // dust in the fluorescent light + lint
  S.dust = fx.points(G, 120, { size: 0.014, color: '#eef8f0' });
  return {
    lights: (Lp, f, Sp, W) => { const o = G.position;
      for (let k = 0; k < 2; k++) { Lp[k].position.set(o.x - 1.5 + k * 3, o.y + 3.3, o.z - 1.5); Lp[k].color.set('#dcffe8'); Lp[k].intensity = 3.2 * (0.93 + 0.07 * Math.sin(f * 1.7 + k * 2)); Lp[k].distance = 9; Lp[k].decay = 2; }
      Lp[2].position.set(o.x + 0.7, o.y + 1.3, o.z + 0.3); Lp[2].color.set('#ffc880'); Lp[2].intensity = 1.0; Lp[2].distance = 3; Lp[2].decay = 2;
      Lp[3].position.set(o.x, o.y + 3.2, o.z - 6); Lp[3].color.set('#cfe4ff'); Lp[3].intensity = 3; Lp[3].distance = 10; Lp[3].decay = 2;
    },
    update: (W, f) => { const t = f / 30;
      S.needle.position.y = 0.14 + Math.sin(f * 2.1) * 0.03; S.clothTex.offset.x = -f * 0.004;
      S.bgMachines.forEach((m, k) => { m.nb.position.y = 0.14 + Math.sin(f * 1.9 + k * 1.3) * 0.025; });
      S.tubes.forEach((tb, k) => { const fl = (f + k * 11) % 47 < 2 && k === 4 ? 0.2 : 1; tb.m.material.emissiveIntensity = 1.3 * fl; tb.gl.material.opacity = 0.4 * fl; });
      S.dust.run(f, (i, f) => [(hash(i, 1) - 0.5) * 8 + Math.sin(f * 0.02 + i) * 0.1, 0.8 + hash(i, 2) * 2.6 + Math.sin(f * 0.015 + i) * 0.1, -0.5 - hash(i, 3) * 6, 0.3 + 0.7 * Math.abs(Math.sin(f * 0.05 + i))]);
    },
  };
}
