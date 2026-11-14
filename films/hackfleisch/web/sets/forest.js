// M9 / M10a: foggy forest manhunt at night (helicopter + searchlight, flashlights, dogs, barricade with police car,
// wanted posters on trees) and the misty meadow at the forest edge at dawn (fallen backpack, distant blue lights).
import { paint, hash } from '../fx3d.js';
import * as CS from '../castspec.js';
export const FOR = { poster: [0.55, 1.45, -1.06], heli: [3, 16, -18], meadow: [0, 0, 40], pack: [0.3, 0.12, 44] };
const S = {};
export function build(ctx, fx, G) {
  const { THREE, add, tbox, toon, P, T } = ctx;
  const cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const M = {
    ground: toon({ map: P.tex(cv(512, 512, (g, w, h) => paint.grassDark(g, w, h, 81, '#2a3a26')), 30, 30) }), bark: toon({ map: P.tex(cv(128, 512, (g, w, h) => { g.fillStyle = '#4a3a2e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(20,14,10,${0.2 + hash(i, 1) * 0.3})`; g.fillRect(hash(i, 2) * w, 0, 2 + hash(i, 3) * 5, h); } }), 1, 3) }),
    needle: toon({ color: '#ffffff' }), metal: toon({ color: '#3a3e46' }), white: toon({ color: '#eef0f4' }), blue: toon({ color: '#2a4a9a' }), dark: toon({ color: '#16181c' }), bag: toon({ color: '#b8442e' }), bagD: toon({ color: '#843024' }),
  };
  const gnd = add(new THREE.PlaneGeometry(400, 400), M.ground, 0, 0, 0, G, { cast: false }); gnd.rotation.x = -Math.PI / 2;
  // forest: instanced trunks + conifer layers (avoid the meadow area z>30)
  const trunks = [], cones = [];
  const R = (i, k) => hash(i * 7 + k, 91);
  for (let i = 0; i < 260; i++) { const x = (R(i, 1) - 0.5) * 120, z = -4 - R(i, 2) * 80; if (Math.abs(x) < 1.4 && z > -8) continue; const h = 9 + R(i, 3) * 8;
    trunks.push({ p: [x, h / 2, z], s: [1 + R(i, 4) * 0.5, h, 1 + R(i, 4) * 0.5] }); for (let k = 0; k < 4; k++) cones.push({ p: [x, h * 0.45 + k * h * 0.15, z], s: [2.6 - k * 0.5, 3.2, 2.6 - k * 0.5], c: ['#1c3424', '#22402a', '#1a2e20', '#26442c'][k] }); }
  // near trees for the poster + foreground
  for (const [x, z] of [[0.55, -1.45], [-1.6, -3.2], [2.3, -4.5], [-0.8, -7.5], [3.8, -9]]) { trunks.push({ p: [x, 6, z], s: [1.6, 12, 1.6] }); cones.push({ p: [x, 7.5, z], s: [2.4, 3, 2.4], c: '#1e3626' }); }
  // meadow edge trees (dawn shot background)
  for (let i = 0; i < 70; i++) { const x = (R(i, 11) - 0.5) * 140, z = 70 + R(i, 12) * 20, h = 9 + R(i, 13) * 8; trunks.push({ p: [x, h / 2, z], s: [1.2, h, 1.2] }); for (let k = 0; k < 3; k++) cones.push({ p: [x, h * 0.5 + k * h * 0.17, z], s: [2.6 - k * 0.6, 3.2, 2.6 - k * 0.6], c: ['#2a3c34', '#30443a', '#263830'][k] }); }
  fx.inst(G, new THREE.CylinderGeometry(0.14, 0.2, 1, 7), M.bark, trunks);
  fx.inst(G, new THREE.ConeGeometry(1, 1, 8), M.needle, cones);
  // wanted poster on the near tree: "Gesucht" + both inmates' portraits drawn with the cast rig
  S.poster = fx.sign(G, FOR.poster, 0.55, 0.75, 440, 600, (g, w, h) => {
    g.fillStyle = '#f2ead0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2420'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#b81e24'; g.font = 'bold 92px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Gesucht', w / 2, 82);
    g.fillStyle = '#e6dcc0'; g.fillRect(30, 140, 180, 220); g.fillRect(230, 140, 180, 220);
    T.drawHead(g, CS.CHARMEUR, { expr: 'smug' }, 120, 260, 0.42); T.drawHead(g, CS.STILLE, { expr: 'determined' }, 320, 262, 0.42);
    g.strokeStyle = '#2a2420'; g.lineWidth = 4; g.strokeRect(30, 140, 180, 220); g.strokeRect(230, 140, 180, 220);
    g.fillStyle = '#5a4a3a'; for (let k = 0; k < 5; k++) g.fillRect(50, 400 + k * 34, 340 - (k % 2) * 80, 12);
  }, { fog: true, color: '#c8c4b8', rx: 0, ry: 0.15 });
  for (const [x, y] of [[-0.24, 0.34], [0.24, 0.34]]) add(new THREE.SphereGeometry(0.015, 6, 4), toon({ color: '#c83a2a' }), FOR.poster[0] + x, FOR.poster[1] + y, FOR.poster[2] + 0.03, G);
  // a second poster further back
  const p2 = fx.sign(G, [-1.55, 1.6, -2.95], 0.5, 0.68, 440, 600, (g, w, h) => { g.fillStyle = '#f2ead0'; g.fillRect(0, 0, w, h); g.fillStyle = '#b81e24'; g.font = 'bold 92px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Gesucht', w / 2, 82); T.drawHead(g, CS.CHARMEUR, { expr: 'smug' }, 120, 260, 0.42); T.drawHead(g, CS.STILLE, { expr: 'determined' }, 320, 262, 0.42); }, { fog: true, color: '#a8a8a0', ry: 0.3 });
  // barricade: police car with flashing blue lights + striped barrier (background road)
  const road = add(new THREE.PlaneGeometry(8, 200), toon({ color: '#2e3036' }), 6, 0.01, -30, G, { cast: false }); road.rotation.x = -Math.PI / 2; road.rotation.z = Math.PI / 2;
  const pc = new THREE.Group(); pc.position.set(4.5, 0, -24); pc.rotation.y = 0.4; G.add(pc); S.pc = pc;
  add(tbox(4.4, 0.8, 1.9, 1), M.white, 0, 0.7, 0, pc); add(tbox(2.4, 0.7, 1.7, 1), M.white, -0.2, 1.42, 0, pc); add(tbox(4.42, 0.3, 1.92, 1), M.blue, 0, 0.75, 0, pc);
  add(tbox(2.3, 0.55, 1.72, 1), toon({ color: '#1a2230' }), -0.2, 1.45, 0, pc, { cast: false });
  for (const [dx, dz] of [[-1.4, 0.95], [1.4, 0.95], [-1.4, -0.95], [1.4, -0.95]]) add(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 14), M.dark, dx, 0.36, dz, pc).rotation.x = Math.PI / 2;
  fx.sign(pc, [0, 0.78, 0.97], 2.2, 0.32, 640, 96, (g, w, h) => { g.fillStyle = '#2a4a9a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = 'bold 74px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('POLIZEI', w / 2, h / 2 + 3); }, { fog: true });
  add(tbox(1.2, 0.14, 0.4, 1), M.dark, -0.2, 1.84, 0, pc); S.blue = [fx.glow(pc, [-0.5, 1.95, 0], '#3a6aff', 2.4, 1), fx.glow(pc, [0.1, 1.95, 0], '#3a6aff', 2.4, 1)];
  const bar = add(tbox(4, 0.25, 0.1, 1), toon({ map: ctx.canvasTex(256, 32, (g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = (x / 32) % 2 ? '#e8e8e8' : '#d8302a'; g.fillRect(x, 0, 32, h); } }) }), 1.5, 0.9, -21, G); bar.rotation.y = 0.2;
  for (const dx of [-0.2, 3.2]) add(tbox(0.12, 0.9, 0.12, 1), M.metal, dx, 0.45, -21 + dx * 0.2, G);
  // helicopter with spinning rotor + searchlight cone
  const H = new THREE.Group(); H.position.set(...FOR.heli); G.add(H); S.heli = H;
  add(new THREE.SphereGeometry(1.2, 14, 10), toon({ color: '#2a3040' }), 0, 0, 0, H).scale.set(1.5, 1, 1); add(tbox(4.5, 0.3, 0.3, 1), toon({ color: '#2a3040' }), -2.8, 0.2, 0, H);
  const rotor = new THREE.Group(); rotor.position.set(0, 1.2, 0); H.add(rotor); S.rotor = rotor; for (let k = 0; k < 2; k++) add(tbox(8, 0.05, 0.25, 1), M.dark, 0, 0, 0, rotor).rotation.y = k * Math.PI / 2;
  S.heliBeam = fx.beam(H, [0.8, -1.0, 0], 30, 0.3, 4.5, '#eef4ff', 0.3); S.heliGlow = fx.glow(H, [0.8, -1.0, 0], '#ffffff', 3, 1); S.heliPool = fx.quad(G, [0, 0.05, -8], 9, 9, '#e8f0ff', 0.4, { rx: -Math.PI / 2 });
  S.heliBlink = fx.glow(H, [-5, 0.3, 0], '#ff2020', 0.6, 1);
  // flashlight beams of the officers (attached in update to positions from W)
  S.flash = [fx.beam(G, [0, 1.2, 0], 12, 0.05, 1.4, '#fff4d8', 0.3), fx.beam(G, [0, 1.2, 0], 12, 0.05, 1.4, '#fff4d8', 0.3)];
  // fog banks + drifting mist
  S.mist = fx.puffs(G, 26, '#7a8aa0', { fog: true });
  S.motes = fx.points(G, 120, { size: 0.03, color: '#e8f0ff' });
  // ---- dawn meadow ----
  const mg = []; for (let i = 0; i < 1800; i++) { const x = (R(i, 21) - 0.5) * 30, z = 32 + R(i, 22) * 30; mg.push({ p: [x, 0.0, z], r: [0, R(i, 23) * 3, (R(i, 24) - 0.5) * 0.4], s: [0.4, 0.5 + R(i, 25) * 0.7, 0.4], c: ['#5a7a4a', '#6a8a52', '#4a6a40', '#7a9a5a'][i % 4] }); }
  S.grass = fx.inst(G, new THREE.ConeGeometry(0.05, 0.6, 3), toon({ color: '#ffffff' }), mg, { cast: false });
  const fl = []; for (let i = 0; i < 160; i++) fl.push({ p: [(R(i, 31) - 0.5) * 14, 0.3 + R(i, 32) * 0.15, 36 + R(i, 33) * 16], s: 0.03 + R(i, 34) * 0.02, c: ['#f4f0e0', '#e8d060', '#d890c0'][i % 3] });
  fx.inst(G, new THREE.SphereGeometry(1, 6, 4), toon({ color: '#ffffff' }), fl, { cast: false });
  // fallen backpack
  const bp = new THREE.Group(); bp.position.set(...FOR.pack); bp.rotation.set(-1.25, 0.5, 0.2); G.add(bp); S.pack = bp;
  { const body = add(new THREE.CapsuleGeometry(0.17, 0.22, 6, 14), M.bag, 0, 0, 0, bp); body.scale.set(1, 1, 0.62);
    const pocket = add(new THREE.CapsuleGeometry(0.11, 0.06, 6, 12), M.bagD, 0, -0.1, 0.1, bp); pocket.scale.set(1.15, 1, 0.5);
    const flap = add(new THREE.SphereGeometry(0.17, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.bagD, 0, 0.2, 0, bp); flap.scale.set(1.02, 0.5, 0.66);
    add(new THREE.TorusGeometry(0.035, 0.012, 6, 12), M.dark, 0, 0.3, 0, bp);
    for (const dx of [-0.08, 0.08]) { const st = add(new THREE.TorusGeometry(0.18, 0.018, 6, 14, Math.PI), M.dark, dx, 0.0, -0.1, bp); st.rotation.y = Math.PI / 2; }
    add(tbox(0.2, 0.012, 0.012, 1), toon({ color: '#c8c8c8' }), 0, -0.02, 0.155, bp); }
  // grass blades in front of and around the backpack (partly covering it)
  const bg = []; for (let i = 0; i < 260; i++) { const a = R(i, 41) * Math.PI * 2, d = 0.15 + R(i, 42) * 1.4; bg.push({ p: [FOR.pack[0] + Math.cos(a) * d, 0, FOR.pack[2] + Math.sin(a) * d], r: [(R(i, 43) - 0.5) * 0.4, 0, (R(i, 44) - 0.5) * 0.4], s: [0.35, 0.35 + R(i, 45) * 0.5, 0.35], c: ['#6a8a4a', '#7a9a52', '#5a7a44'][i % 3] }); }
  fx.inst(G, new THREE.ConeGeometry(0.05, 0.6, 3), toon({ color: '#ffffff' }), bg, { cast: false });
  // distant police lights at the far meadow edge
  S.farBlue = []; for (let k = 0; k < 4; k++) S.farBlue.push(fx.glow(G, [-14 + k * 7, 1.6, 78], '#3a6aff', 3.5, 1, { fog: false }));
  S.dew = fx.points(G, 120, { size: 0.02, color: '#ffffff', tex: 'spark' });
  S.birds = fx.points(G, 6, { size: 0.35, color: '#1a1a22', normal: true, tex: 'dot' });
  return {
    lights: (Lp, f, Sp, W) => { const o = G.position, fr = W.forest || {};
      if (fr.mode === 'night') {
        const hp = S.heli.position; Lp[0].position.set(o.x + hp.x, o.y + 4, o.z + hp.z + 6); Lp[0].color.set('#e8f0ff'); Lp[0].intensity = 30; Lp[0].distance = 30; Lp[0].decay = 1.4;
        Lp[1].position.set(o.x + 4.5, o.y + 2.5, o.z - 23); Lp[1].color.set('#3a6aff'); Lp[1].intensity = 12 * (Math.sin(f * 0.9) > 0 ? 1 : 0.15); Lp[1].distance = 14; Lp[1].decay = 1.6;
        Lp[2].position.set(o.x + 0.5, o.y + 1.5, o.z + 1.5); Lp[2].color.set('#fff0d0'); Lp[2].intensity = 2.5; Lp[2].distance = 5; Lp[2].decay = 2;
        Lp[3].position.set(o.x - 1, o.y + 1.4, o.z - 5); Lp[3].color.set('#fff0d0'); Lp[3].intensity = 4; Lp[3].distance = 8; Lp[3].decay = 2;
      } else {
        Lp[0].position.set(o.x - 10, o.y + 2, o.z + 75); Lp[0].color.set('#3a6aff'); Lp[0].intensity = 18 * (0.6 + 0.4 * Math.sin(f * 0.5)); Lp[0].distance = 30; Lp[0].decay = 1.5;
      }
    },
    update: (W, f) => { const fr = W.forest || {}, t = f / 30, night = fr.mode === 'night';
      S.rotor.rotation.y = f * 0.9; S.heli.position.set(FOR.heli[0] + Math.sin(t * 0.6) * 2 + (fr.heliOff || 0), FOR.heli[1] + Math.sin(t * 1.1) * 0.3, FOR.heli[2] + (fr.heliZ || 0)); S.heli.rotation.set(0.08, 0.5 + Math.sin(t * 0.3) * 0.1, 0.05);
      const bx = Math.sin(t * 0.9) * 3, bz = -6 + Math.cos(t * 0.7) * 2; S.heliBeam.aim(G.position.x + bx, G.position.y, G.position.z + bz); S.heliPool.position.set(bx, 0.05, bz);
      S.heliBeam.visible = S.heliGlow.visible = S.heliPool.visible = night; S.heliBlink.material.opacity = (f % 20) < 3 ? 1 : 0;
      S.blue.forEach((b, k) => { b.material.opacity = Math.sin(f * 0.9 + k * Math.PI) > 0 ? 1 : 0.1; });
      S.flash.forEach((b, k) => { const fl = fr.flash && fr.flash[k]; b.visible = !!fl; if (fl) { b.position.set(fl[0], fl[1], fl[2]); b.aim(G.position.x + fl[3], G.position.y + fl[4], G.position.z + fl[5]); } });
      S.mist.run(f, (i, f) => { const zc = night ? -6 : 46, sp = night ? 0.012 : 0.006; const x = ((hash(i, 1) * 40 + f * sp * (0.5 + hash(i, 2))) % 40) - 20; return [x, 0.4 + hash(i, 3) * (night ? 3 : 1.2), zc - hash(i, 4) * (night ? 18 : 25), night ? 4 + hash(i, 5) * 3 : 6 + hash(i, 5) * 4, night ? 0.22 : 0.3]; });
      S.motes.run(f, (i, f) => (night ? [(hash(i, 1) - 0.5) * 6 + Math.sin(f * 0.02 + i) * 0.1, 0.3 + hash(i, 2) * 4, -2 - hash(i, 3) * 10, 0.4 + 0.6 * Math.abs(Math.sin(f * 0.05 + i))] : null));
      S.farBlue.forEach((b, k) => { b.visible = !night; b.material.opacity = Math.sin(f * 0.5 + k * 1.3) > 0 ? 0.9 : 0.25; });
      S.dew.run(f, (i, f) => (!night ? [FOR.pack[0] + (hash(i, 1) - 0.5) * 2.2, 0.05 + hash(i, 2) * 0.5, FOR.pack[2] + (hash(i, 3) - 0.5) * 2.5, 0.3 + 0.7 * Math.pow(Math.abs(Math.sin(f * 0.07 + i * 1.3)), 6)] : null));
      S.birds.run(f, (i, f) => (!night ? [-20 + ((f * 0.12 + i * 3) % 40), 14 + Math.sin(f * 0.1 + i) * 0.6 + i * 0.4, 70, 1] : null));
      S.pack.visible = !night;
    },
  };
}
