// shots.js: the 30-shot plan. Each shot: a,b (global frames), loc, light, cam(lf), dof, actors, fx, world, overlay, mb.
import { camFromKeys, M as E, blinkAt, q, lerp, lerp3, clamp, ramp } from './motion.js';
import { A, RIDER_HAT } from './acts.js';
import { PH, WIRE_Y } from './sets/prairie.js';
import { H as FH } from './sets/fly.js';
export { A };
const K = (keys, opts) => (lf) => { const c = camFromKeys(keys, lf, { creep: opts?.creep ?? 0.0012, kicks: opts?.kicks || [] }); return { ...c, pos: [...c.pos], look: [...c.look] }; };
const shake = (c, lf, at, amp = 0.03, len = 7) => { const d = lf - at; if (d >= 0 && d < len) { const s = (Math.floor(d) % 2 ? -1 : 1) * amp * (1 - d / len); c.look[1] += s * 3; c.look[0] += s * 2; c.roll = (c.roll || 0) + s * 25; } return c; };
const sm = E.smooth, eo = E.easeOut;

// ---------- S1 hook: rider gallops straight at the low camera, jumps the ditch over the lens ----------
const s1Horse = (lf) => { // horse card position (front view): gallops in from 11 m, leaps the ditch past the lens
  if (lf < 20) return [0.35 + lf * 0.02, 0, -8.2 + lf * 0.31];
  const t = Math.min(1.25, (lf - 20) / 22); return [0.75 + t * 0.55, Math.max(0, Math.sin(Math.PI * Math.min(1, t)) * 2.4), -2.0 + t * 7.0];
};
const S1 = { id: 's1', loc: 'desert', light: 'sunset', a: 0, b: 49,
  cam: (lf) => { const h = s1Horse(Math.min(lf, 44)), tj = clamp((lf - 18) / 6);
    const c = K([{ f: 0, pos: [-0.3, 0.45, 3.0], look: [0.4, 1.95, -6], fov: 27, roll: 3 }, { f: 20, pos: [-0.25, 0.42, 2.9], look: [0.6, 2.1, -2], fov: 46, roll: 2, ease: 'easeIn' },
      { f: 43, pos: [-0.2, 0.42, 2.85], look: [0.6, 2.1, -2], fov: 62, roll: -6, ease: 'smooth' }, { f: 49, pos: [0, 0.6, 2.8], look: [12, 2.5, 7], fov: 66, roll: -16, ease: 'easeIn' }], { creep: 0 })(lf);
    if (lf >= 18 && lf < 45) { const k = sm(tj) * (1 - clamp((lf - 42) / 3)); c.look = lerp3(c.look, [h[0], h[1] + 2.3, h[2]], k); }
    return shake(c, lf, 21, 0.02); },
  dof: (lf) => { const h = s1Horse(Math.min(lf, 40)); return { at: [h[0], h[1] + 2.3, h[2]], cinf: lf < 20 ? 6 : 9, near: 1 }; },
  mb: (lf) => (lf >= 26 && lf < 40 ? 4 : lf >= 43 ? 6 : 1),
  actors: (lf, T) => { const out = []; if (lf < 45) { const [x, y, z] = s1Horse(lf);
      out.push(A.horseFront(T, { phase: lf * 0.085, t: lf, mode: lf >= 20 && lf < 40 ? 'jump' : 'gallop', wind: 1.2 }, [x, y, z], 1.9, { rim: { dx: 0, dy: -14, col: '#ffcc80', a: 0.95 }, tint: '#fff0e4' })); }
    return out; },
  world: (lf) => ({ flare: 1, birds: [[-30, 28, -120, 4], [-20, 32, -140, 4], [40, 26, -150, 4]], tumble: [{ x0: -9, v: 3.2, z: -4.5, f0: 0, s: 1.2 }, { x0: 6, v: -2.0, z: -12, f0: 0, s: 0.9 }],
    dust: [{ path: (s) => { const p = s1Horse(Math.min(s, 22)); return [p[0], 0.4, p[2] - 0.6]; }, from: 0, to: 22, every: 1, per: 2, life: 40, size: [1.2, 5], alpha: 0.55, col: [1, 0.72, 0.5], colVar: 0.2, rise: 0.8, spread: 1.4, vel: [0, 0.3, -1], seed: 1 },
      { path: () => [0.8, 0.1, -1.5], from: 20, to: 24, per: 8, life: 45, size: [1.5, 6], alpha: 0.6, col: [1, 0.7, 0.48], rise: 1.2, spread: 2.4, jit: 2, seed: 2 }],
    clods: [{ path: (s) => { const p = s1Horse(Math.min(s, 22)); return [p[0], 0.2, p[2] + 0.3]; }, from: 4, to: 24, every: 1, per: 2, life: 26, size: [0.09, 0.07], alpha: 1, col: [0.42, 0.22, 0.12], colVar: 0.3, vel: [0, 4.2, 5.2], jit: 3, grav: 9, spread: 0.7, seed: 3, floor: -0.1 },
      { path: () => [0.9, 0.3, -1.2], from: 20, to: 25, per: 10, life: 18, size: [0.12, 0.1], alpha: 1, col: [0.4, 0.2, 0.1], vel: [0, 5, 9], jit: 3.5, grav: 6, spread: 0.6, seed: 4 }] }),
  overlay: (lf) => { if (lf < 27) return null; const k = Math.min(1, (lf - 27) / 4); return { key: 'dirt' + q(k, 1), draw: (g, w, h) => lensDirt(g, w, h, k, 7) }; },
};
const lensDirt = (g, w, h, k, seed) => { let s = seed; const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 7; i++) { const x = R() * w, y = 200 + R() * (h - 500), r = (22 + R() * 50) * k; g.save(); g.filter = 'blur(9px)'; g.globalAlpha = 0.6; g.fillStyle = i % 2 ? '#5a3018' : '#7a4424';
    g.beginPath(); for (let j = 0; j < 10; j++) { const a = j / 10 * 6.283, rr = r * (0.6 + R() * 0.6); j ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill();
    for (let d = 0; d < 3; d++) { g.beginPath(); g.arc(x + (R() - 0.5) * r * 3, y + (R() - 0.5) * r * 3, r * 0.18, 0, 7); g.fill(); } g.restore(); } };

// ---------- S2 side tracking at full speed, ducking under a low branch ----------
const s2x = (lf) => -11.4 + lf * 0.30;
const S2 = { id: 's2', loc: 'desert', light: 'sunsetSide', a: 50, b: 116,
  cam: (lf) => { const x = s2x(lf); let c = { pos: [x + 0.2 + Math.sin(lf * 0.07) * 0.15, 1.25 + Math.sin(lf * 0.9) * 0.02, -20.6], look: [x + 0.9, 1.75, -26], fov: 44, roll: 1.5 * Math.sin(lf * 0.05) };
    if (lf < 8) { const k = eo(lf / 8); c.pos[1] += (1 - k) * 0.6; c.fov += (1 - k) * 8; c.roll += (1 - k) * 10; }
    return shake(c, lf, 0, 0.03); },
  dof: (lf) => ({ at: [s2x(lf), 2.0, -26], cinf: 9 }),
  mb: (lf) => (lf < 6 ? 6 : 3),
  actors: (lf, T) => { const x = s2x(lf), duck = clamp(1 - Math.abs(lf - 52) / 9);
    return [A.horseSide(T, { phase: lf * 0.085, t: lf, mode: lf < 4 ? 'land' : 'gallop', wind: 1.3, rider: A.rider({ lean: 20 + 34 * duck, lift: 30 * duck, expr: duck > 0.3 ? 'scared' : 'determined', scarf: lf }) }, [x, 0, -26], 1.8, { rim: { dx: -6, dy: -12, col: '#ffc070', a: 0.9 }, tint: '#ffe8d8' })]; },
  world: (lf) => ({ flare: 0.5, birds: [[0, 30, -140, 4], [30, 28, -150, 4]], tumble: [{ x0: 14, v: -4, z: -24.2, f0: 0, s: 0.9 }],
    dust: [{ path: (s) => [s2x(s) - 0.9, 0.3, -26], from: 0, to: 66, every: 1, per: 2, life: 30, size: [0.9, 3.6], alpha: 0.5, col: [1, 0.74, 0.52], colVar: 0.2, rise: 0.7, spread: 0.9, vel: [-1.2, 0.3, 0], seed: 5 },
      { path: () => [s2x(0), 0.2, -26], from: 0, to: 2, per: 12, life: 30, size: [1, 4], alpha: 0.6, col: [1, 0.72, 0.5], rise: 1, spread: 1.5, jit: 2, seed: 6 }],
    clods: [{ path: (s) => [s2x(s) - 0.2, 0.15, -26], from: 0, to: 66, every: 1, per: 2, life: 16, size: [0.06, 0.05], alpha: 1, col: [0.45, 0.24, 0.13], colVar: 0.3, vel: [-1.5, 2.6, 0.4], jit: 1.5, grav: 9, spread: 0.6, seed: 7, floor: -0.05 },
      { path: () => [4, 2.7, -26], from: 50, to: 56, per: 4, life: 24, size: [0.08, 0.06], alpha: 1, col: [0.3, 0.2, 0.12], vel: [-2, 0.5, 0.5], jit: 1, grav: 5, seed: 8 }] }),
};


// ---------- shared helpers ----------
const RS = (ph = 0, extra = {}) => ({ hatBack: RIDER_HAT, hatBackDx: -130, hatBackY: 350, hatBackA: -20, pouch: {}, scarfTail: { ph: q(ph * 0.13, 2), dir: -1, len: 0.6 }, ...extra });
const idleP = (f, seed) => ({ bob: q(0.006 * Math.sin((f + seed * 11) * 0.11), 3), tilt: q(1.5 * Math.sin((f + seed * 7) * 0.05), 1), blink: blinkAt(f, seed) });
const wipe = (k, col = '255,244,230') => ({ key: 'wipe' + q(k, 2) + col, draw: (g, w, h) => { if (k <= 0) return; for (let i = 0; i < 9; i++) { const x = (i * 0.137 % 1) * w, y = h * (0.1 + (i * 0.29 % 1) * 0.8), r = w * (0.35 + 0.5 * k) * (0.7 + (i % 3) * 0.2);
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${Math.min(1, k * 1.3)})`); gr.addColorStop(0.6, `rgba(${col},${Math.min(1, k * 1.1) * 0.8})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, h); } } });
const dustTrail = (path, from, to, seed, col = [1, 0.85, 0.65], o = {}) => ({ path, from, to, every: 1, per: o.per || 2, life: o.life || 30, size: o.size || [0.8, 3.2], alpha: o.alpha ?? 0.5, col, colVar: 0.15, rise: 0.6, spread: 0.9, vel: o.vel || [0, 0.3, 0], seed });
const clodTrail = (path, from, to, seed, col = [0.45, 0.3, 0.18], vel = [-1.5, 2.6, 0.4]) => ({ path, from, to, every: 1, per: 2, life: 16, size: [0.06, 0.05], alpha: 1, col, colVar: 0.3, vel, jit: 1.5, grav: 9, spread: 0.6, seed, floor: -0.05 });
const T_ = (x, z) => PH(x, z);

// ---------- S3 storm: two groups across a fence ----------
const S3 = { id: 's3', loc: 'storm', light: 'storm', a: 117, b: 173,
  cam: K([{ f: 0, pos: [0.35, 1.75, 9.0], look: [0, 1.35, -3], fov: 44, roll: 4 }, { f: 56, pos: [0.3, 1.65, 7.0], look: [0, 1.35, -3], fov: 41, roll: 5, ease: 'lin' }]),
  lightAt: (lf, b) => { const fl = lf >= 24 && lf < 30 ? (lf % 2 ? 0.4 : 1) * (1 - (lf - 24) / 6) : 0; return { sunI: b.sunI + fl * 3, hemi: b.hemi + fl * 1.2 }; },
  dof: (lf) => ({ at: [0, 1.6, -1.5], cinf: 8 }),
  actors: (lf, T, f) => { const out = []; const blue = [[-0.75, -0.6], [-1.45, -1.9], [-0.95, -3.3], [-1.6, -4.6]], grey = [[0.75, -0.4], [1.45, -1.7], [0.95, -3.1], [1.6, -4.4]];
    blue.forEach(([x, z], i) => out.push(A.person(T, 'blueM', { expr: i % 2 ? 'angry' : 'determined', turn: 0.6, look: 0.8, L: i % 2 ? 'cross' : 'hip', R: i % 2 ? 'cross' : 'hang', ...idleP(f, i + 1) }, [x, 0, z], 1, { tint: '#d8deec' })));
    grey.forEach(([x, z], i) => out.push(A.person(T, 'greyM', { expr: i % 2 ? 'determined' : 'angry', turn: 0.6, look: 0.8, L: i % 2 ? 'hip' : 'cross', R: 'cross', ...idleP(f, i + 7) }, [x, 0, z], 1, { flip: true, tint: '#d8deec' })));
    return out; },
  world: (lf) => ({ bolt: lf >= 24 && lf < 31 ? (lf % 2 ? 0.5 : 1) : 0, crow: [-6 + lf * 0.22, 7 + Math.sin(lf * 0.3) * 0.4, -14], mist: { n: 40, box: [30, 6, 30], wind: [2, 0, 0], size: 4, alpha: 0.12, col: [0.7, 0.75, 0.8], seed: 3 } }),
  overlay: (lf) => (lf >= 24 && lf < 28 ? { key: 'fl' + lf, draw: (g, w, h) => { g.fillStyle = `rgba(220,230,255,${0.35 * (1 - (lf - 24) / 4)})`; g.fillRect(0, 0, w, h); } } : null),
};
// ---------- S4 capitol: crane from the scaffolded dome down behind the speaker ----------
const S4 = { id: 's4', loc: 'capital', light: 'capital', a: 174, b: 225,
  cam: K([{ f: 0, pos: [10, 34, 34], look: [0, 31, -12], fov: 44, roll: -3 }, { f: 22, pos: [3.0, 11, 4], look: [0, 6, 16], fov: 46, roll: 0, ease: 'smooth', path: [[8, 24, 20]] }, { f: 51, pos: [0.25, 6.9, 2.0], look: [-0.1, 6.2, 22], fov: 44, roll: 1, ease: 'easeOut' }]),
  mb: (lf) => (lf >= 6 && lf < 18 ? 3 : 1),
  dof: (lf) => ({ at: lf < 18 ? [0, 30, -12] : [0, 6.6, 4.9], cinf: lf < 18 ? 2 : 8 }),
  actors: (lf, T, f) => [{ key: 'spk' + q(Math.sin(f * 0.15), 1), draw: (p) => T.drawBackFigure(p, { arm: 0.6 + 0.4 * Math.sin(f * 0.15) }), x: 0, y: 5.2, z: 4.9, s: 1.05, tint: '#ffffff' }],
  fx: (lf, T, f) => { const out = []; for (let i = 0; i < 6; i++) { const t = ((lf + i * 9) % 40) / 30; out.push(A.fx('pp' + i + q(t, 1), (p) => T.fxPaperSheet(p, t * 3 + i, Math.sin(t * 9 + i)), [Math.sin(i * 1.7) * 1.2 + t * 0.4, 6.2 + t * 1.4 + Math.sin(t * 5 + i) * 0.3, 5.6 + t * 3.0 + i * 0.2], 0.32)); } return out; },
  world: () => ({ motes: { n: 30, box: [8, 4, 8], wind: [0.3, 0.1, 0.5], size: 0.06, alpha: 0.6, col: [1, 0.95, 0.8], seed: 2 } }),
};
// ---------- S5a continental flyover east -> west ----------
const fx5 = (lf) => 900 - lf * 24;
const S5a = { id: 's5a', loc: 'fly', light: 'fly', a: 226, b: 279,
  cam: (lf) => { const x = fx5(lf), y = Math.max(FH(x, 0), FH(x - 150, 0), FH(x - 300, 0)) + 120 - clamp((lf - 40) / 13) * 60; return { pos: [x, y, 40 + Math.sin(lf * 0.05) * 10], look: [x - 600, y - 120 - clamp((lf - 40) / 13) * 80, -20], fov: 54, roll: -6 + lf * 0.12 }; },
  mb: () => 3,
  dof: () => ({ focus: 300, cinf: 0 }),
  world: () => ({ poles: false, mist: { n: 60, box: [500, 140, 500], wind: [0, 0, 0], size: 70, alpha: 0.18, col: [1, 0.96, 0.9], seed: 9 } }),
  overlay: (lf) => (lf > 44 ? wipe((lf - 44) / 9) : null),
};
// ---------- S5b town: the cloud clears, down to the waiting people ----------
const S5b = { id: 's5b', loc: 'town', light: 'town', a: 280, b: 325,
  cam: K([{ f: 0, pos: [2.5, 15, 24], look: [0, 1.5, 0], fov: 44, roll: 3 }, { f: 30, pos: [0.6, 1.9, 7.2], look: [0, 1.75, -1], fov: 40, roll: 0, ease: 'easeOut' }, { f: 45, pos: [0.5, 1.85, 6.4], look: [0, 1.75, -1], fov: 39, ease: 'lin' }]),
  dof: (lf) => ({ at: [0, 1.8, 2.2], cinf: lf < 20 ? 2 : 10 }),
  actors: (lf, T, f) => [
    A.person(T, 'townA', { expr: 'worried', R: { x: 330, y: 250, b: 0.3 }, L: { x: 270, y: 250, b: 0.3 }, holdR: 'binoc', ...idleP(f, 3), blink: 0 }, [0, 0, 2.2], 1.02),
    A.person(T, 'lady', { expr: 'worried', turn: 0.3, L: 'chin', R: 'belly', ...idleP(f, 5) }, [-1.4, 0, 1.4], 0.98),
    A.person(T, 'newsboy', { expr: 'goofy', turn: -0.3, L: 'point', R: 'hang', ...idleP(f, 8) }, [1.3, 0, 1.0], 0.82),
    A.person(T, 'miner', { expr: 'neutral', turn: 0.2, L: 'hip', R: 'chin', ...idleP(f, 9) }, [2.4, 0, -0.6], 1.0)],
  world: () => ({ wait: true, dust: [{ path: () => [0, 0.2, 3], from: 0, to: 45, every: 3, per: 1, life: 60, size: [1.5, 3], alpha: 0.12, col: [1, 0.9, 0.75], rise: 0.3, spread: 8, vel: [1, 0, 0], seed: 11 }] }),
  overlay: (lf) => (lf < 10 ? wipe(1 - lf / 10) : null),
};
// ---------- S6a "Es gibt keine Bahn": empty prairie ----------
const S6a = { id: 's6a', loc: 'prairie', light: 'prairie', a: 326, b: 361,
  cam: K([{ f: 0, pos: [-6, 1.1, 14], look: [-12, 1.6, -40], fov: 40, roll: 0 }, { f: 35, pos: [-4.5, 1.15, 13.5], look: [12, 1.7, -40], fov: 39, ease: 'smooth' }]),
  dof: () => ({ focus: 30, cinf: 5 }),
  world: () => ({ motes: { n: 40, box: [24, 5, 24], wind: [1.2, 0.15, 0], wob: 0.3, size: 0.05, alpha: 0.8, col: [1, 0.98, 0.9], seed: 4 } }),
  fx: (lf, T) => [A.fx('tw' + q(lf, 0), (p) => T.fxTumble(p, lf * 0.3), [-9.5 + lf * 0.16, T_(-9.5 + lf * 0.16, 8) + 0.05, 8], 0.45, { order: 3, blob: true, shadow: true })],
};
// ---------- S6b "Kein Telefon": a table with only a candle and a letter ----------
const S6b = { id: 's6b', loc: 'room', light: 'room', a: 362, b: 393,
  cam: K([{ f: 0, pos: [0.75, 1.7, 1.45], look: [-0.05, 1.02, -0.05], fov: 40, roll: -3 }, { f: 31, pos: [0.5, 1.48, 0.98], look: [-0.05, 1.03, -0.05], fov: 38, ease: 'lin' }]),
  dof: () => ({ at: [0, 1.05, 0], cinf: 12 }),
  fx: (lf, T, f) => [A.fx('fl' + q(f % 40, 0), (p) => T.fxFlame(p, f * 0.4), [-0.35, 1.19, -0.1], 0.16, { order: 6 }), A.fx('gl' + q(Math.sin(f * 0.7), 1), (p) => T.fxSoft(p, '255,190,110', 0.45 + 0.06 * Math.sin(f * 0.7), 300), [-0.35, 0.05, -0.45], 1.0, { order: 4 })],
  world: () => ({ motes: { n: 40, box: [2, 1.5, 2], wind: [0.05, 0.1, 0], wob: 0.1, size: 0.012, alpha: 0.7, col: [1, 0.8, 0.5], seed: 6, y0: 1 } }),
};
// ---------- S6c "Nur Reiter": the rider bursts into frame ----------
const s6x = (lf) => -9 + lf * 0.42;
const S6c = { id: 's6c', loc: 'prairie', light: 'prairie', a: 394, b: 429,
  cam: (lf) => { const c = K([{ f: 0, pos: [0, 0.55, 7.5], look: [-1.5, 1.7, 0], fov: 46, roll: -3 }, { f: 35, pos: [0.4, 0.6, 7.2], look: [2.5, 1.8, 0], fov: 44, roll: 2, ease: 'smooth' }], { creep: 0 })(lf); return shake(c, lf, 10, 0.02); },
  mb: (lf) => (lf < 26 ? 3 : 1),
  dof: (lf) => ({ at: [s6x(lf), 2, 2.4], cinf: 9 }),
  actors: (lf, T) => [A.horseSide(T, { phase: lf * 0.09, t: lf, wind: 1.3, rider: A.rider({ lean: 24, expr: 'determined', scarf: lf }) }, [s6x(lf), T_(s6x(lf), 2.4), 2.4], 1.8, { rim: { dx: 8, dy: -10, col: '#fff0c0', a: 0.8 } })],
  world: () => ({ dust: [dustTrail((s) => [s6x(s) - 0.9, T_(s6x(s), 2.4) + 0.3, 2.4], 0, 35, 21, [1, 0.88, 0.66])], clods: [clodTrail((s) => [s6x(s) - 0.2, T_(s6x(s), 2.4) + 0.15, 2.4], 0, 35, 22)] }),
};
// ---------- S7a the relay station (drone down) / S7b keeper with the fresh horse ----------
const KEEPER = (f, o = {}) => ({ expr: 'neutral', ...idleP(f, 13), ...o });
const S7a = { id: 's7a', loc: 'station', light: 'station', a: 430, b: 493,
  cam: K([{ f: 0, pos: [-8, 13, 24], look: [1.2, 1.4, 3], fov: 42, roll: -2 }, { f: 40, pos: [1.6, 2.0, 12.6], look: [1.3, 2.0, 2], fov: 42, roll: 0, ease: 'easeOut' }, { f: 63, pos: [1.6, 1.95, 11.8], look: [1.3, 2.0, 2], fov: 41, ease: 'lin' }]),
  dof: (lf) => ({ at: [1, 1.6, 5.2], cinf: lf < 30 ? 1 : 5 }),
  actors: (lf, T, f) => [A.horseSide(T, { kind: 'black', mode: 'stand', t: f, wind: 0.4, mochila: false, headDown: 4 * Math.sin(f * 0.05) }, [2.0, 0, 4.4], 1.8),
    A.person(T, 'keeper', KEEPER(f, { turn: -0.4, look: -0.8, L: { x: 520, y: 560, b: 0.5 }, R: 'hip', expr: 'neutral' }), [0.8, 0, 5.6], 1)],
  world: () => ({ motes: { n: 30, box: [16, 5, 16], wind: [0.6, 0.1, 0], size: 0.05, alpha: 0.7, col: [1, 0.95, 0.8], seed: 7 } }),
};
const s7rx = (lf) => -60 + lf * 0.55;
const S7b = { id: 's7b', loc: 'station', light: 'station', a: 494, b: 537,
  cam: K([{ f: 0, pos: [8.1, 1.75, 7.95], look: [-21.5, 1.35, 2.2], fov: 40, roll: 2 }, { f: 43, pos: [7.7, 1.7, 7.85], look: [-21.5, 1.3, 2.2], fov: 38, ease: 'lin' }]),
  dof: (lf) => (lf < 16 ? { at: [5.0, 1.8, 7.0], cinf: 10 } : { at: [s7rx(lf), 1.5, 6], cinf: 10 }),
  actors: (lf, T, f) => [A.person(T, 'keeper', KEEPER(f, { turn: -0.7, look: -1, R: { x: 250, y: 200, b: 0.4 }, L: { x: 120, y: 560, b: 0.5 }, expr: lf > 14 ? 'happy' : 'neutral' }), [5.0, 0, 7.0], 1, { flip: true }),
    A.horseSide(T, { phase: lf * 0.085, t: lf, wind: 1.2, rider: A.rider({ lean: 22, scarf: lf }) }, [s7rx(lf), 0, 5.9], 1.8)],
  world: () => ({ dust: [dustTrail((s) => [s7rx(s) - 1, 0.6, 5.9], 0, 43, 31, [1, 0.86, 0.66], { size: [2, 6], life: 45, alpha: 0.55 })] }),
};
// ---------- S8a jump off + throw the mochila / S8b jump back on ----------
const s8hx = (lf) => (lf < 12 ? -10 + 8.2 * eo(lf / 12) : -1.8);
const BAG = (T) => (p) => { const g = p.g; T.rimWrap(p, (pp) => { const gg = pp.g; gg.save(); gg.translate(300, 600); gg.rotate(-0.2);
  for (const [x, y, w, h, c] of [[-200, -90, 400, 180, '#7a4426'], [-170, -40, 90, 110, '#9a5a32'], [80, -40, 90, 110, '#9a5a32']]) { gg.beginPath(); gg.rect(x, y, w, h); gg.fillStyle = c; gg.fill(); gg.lineWidth = 9; gg.strokeStyle = '#1a1416'; gg.stroke(); }
  gg.font = '64px "Rye","Georgia",serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.lineWidth = 8; gg.strokeStyle = '#2a160c'; gg.strokeText('Post', 0, -40); gg.fillStyle = '#f4e2b0'; gg.fillText('Post', 0, -40); gg.restore(); }, null); };
const bagPos = (lf) => { const t = clamp((lf - 30) / 18); const a = [-0.6, 1.5, 6.4], b = [2.0, 1.65, 4.9]; return [lerp(a[0], b[0], t), lerp(a[1], b[1], t) + Math.sin(Math.PI * t) * 1.6, lerp(a[2], b[2], t)]; };
const S8a = { id: 's8a', loc: 'station', light: 'station', a: 538, b: 608,
  cam: (lf) => { const c = K([{ f: 0, pos: [-4.2, 1.55, 13.2], look: [-4.5, 1.6, 5.5], fov: 42, roll: -2 }, { f: 14, pos: [-1.2, 1.5, 12.8], look: [-1.4, 1.5, 5.5], fov: 41, ease: 'easeOut' },
      { f: 28, pos: [-0.5, 1.5, 12.6], look: [-0.7, 1.5, 5.5], fov: 41, ease: 'lin' }, { f: 37, pos: [-0.3, 1.5, 12.5], look: [-0.5, 1.5, 5.5], fov: 41, ease: 'lin' }, { f: 50, pos: [1.9, 1.6, 12.5], look: [1.6, 1.6, 5.0], fov: 41, ease: 'smooth' }, { f: 70, pos: [2.1, 1.55, 12.0], look: [1.9, 1.55, 5.0], fov: 40, ease: 'lin' }], { creep: 0 })(lf);
    shake(c, lf, 20, 0.02); return shake(c, lf, 48, 0.025); },
  mb: (lf) => (lf < 8 || (lf >= 28 && lf < 46) ? 3 : 1),
  dof: (lf) => ({ at: lf < 30 ? [s8hx(lf), 1.6, 6] : bagPos(lf), cinf: 8 }),
  actors: (lf, T, f) => { const out = [], hx = s8hx(lf);
    out.push(A.horseSide(T, { phase: lf < 12 ? lf * 0.08 : 0, t: f, mode: lf < 12 ? 'gallop' : 'stand', wind: lf < 12 ? 1 : 0.4, mochila: lf < 30, hexpr: lf > 14 ? 'tired' : 'det',
      rider: lf < 10 ? A.rider({ lean: 10, scarf: f }) : null }, [hx, 0, 5.4], 1.8));
    if (lf >= 10) { const jt = clamp((lf - 10) / 10), x = lerp(hx - 0.2, -0.6, jt), y = Math.sin(Math.PI * jt) * 0.9, throwing = lf >= 24 && lf < 40;
      out.push(A.person(T, 'rider', { ...RS(f), expr: throwing ? 'determined' : 'happy', legs: jt < 1 ? 'crouch' : 'stand', turn: 0.5, look: 1, tilt: throwing ? 8 : 0,
        L: lf < 30 ? { x: 330, y: 420, b: 0.4 } : 'reach', R: lf < 30 ? { x: 270, y: 410, b: 0.4 } : 'point', pouch: undefined }, [x, y, 6.3], 1)); }
    out.push(A.horseSide(T, { kind: 'black', mode: 'stand', t: f, wind: 0.4, mochila: lf >= 48 }, [2.0, 0, 4.8], 1.8));
    out.push(A.person(T, 'keeper', KEEPER(f, { turn: -0.6, look: -1, expr: lf > 46 ? 'laugh' : 'shock', L: { x: 470, y: 520, b: 0.5 }, R: lf > 46 ? 'wave' : 'hip' }), [3.2, 0, 3.6], 1, { flip: true }));
    if (lf >= 26 && lf < 48) out.push(A.fx('bag' + q(lf, 0), BAG(T), bagPos(lf), 0.5, { order: 4, roll: (lf - 26) * 0.18 }));
    return out; },
  world: () => ({ dust: [dustTrail((s) => [s8hx(s) - 1, 0.4, 5.4], 0, 14, 41, [1, 0.88, 0.68], { size: [1.5, 4], life: 40 }), { path: () => [-0.6, 0.1, 6.3], from: 20, to: 21, per: 10, life: 30, size: [0.4, 1.6], alpha: 0.5, col: [1, 0.88, 0.7], rise: 0.4, spread: 0.8, jit: 1, seed: 42 },
    { path: () => [2, 1.7, 4.9], from: 47, to: 48, per: 10, life: 24, size: [0.3, 1.2], alpha: 0.6, col: [1, 0.9, 0.75], rise: 0.6, spread: 0.6, jit: 1.5, seed: 43 }] }),
};
const s8bx = (lf) => (lf < 8 ? 2.0 : 2.0 + Math.pow(lf - 8, 1.5) * 0.055);
const S8b = { id: 's8b', loc: 'station', light: 'station', a: 609, b: 642,
  cam: (lf) => { const c = K([{ f: 0, pos: [1.6, 0.75, 10.4], look: [2.0, 1.9, 4.8], fov: 46, roll: 4 }, { f: 33, pos: [4.2, 0.85, 10.6], look: [6.0, 1.8, 4.8], fov: 46, roll: -2, ease: 'smooth' }], { creep: 0 })(lf); return shake(c, lf, 7, 0.03); },
  mb: (lf) => (lf < 8 ? 3 : 2),
  dof: (lf) => ({ at: [s8bx(lf), 2, 4.8], cinf: 9 }),
  actors: (lf, T, f) => { const out = [];
    if (lf < 7) { const t = lf / 7; out.push(A.person(T, 'rider', { ...RS(f), expr: 'determined', legs: 'crouch', turn: 0.5, L: 'up', R: 'forward', tilt: 12 }, [lerp(0.7, 2.0, t), Math.sin(Math.PI * t * 0.8) * 1.4, 5.4], 1)); }
    out.push(A.horseSide(T, { kind: 'black', phase: lf < 8 ? 0 : (lf - 8) * 0.09, mode: lf < 8 ? 'stand' : 'gallop', t: f, wind: lf < 8 ? 0.4 : 1.2, rider: lf >= 7 ? A.rider({ lean: 26, scarf: f, expr: 'happy' }) : null }, [s8bx(lf), 0, 4.8], 1.8));
    out.push(A.person(T, 'keeper', KEEPER(f, { expr: 'laugh', turn: -0.3, L: 'hip', R: 'wave', holdR: 'hat', ...idleP(f, 13), bob: q(Math.abs(Math.sin(f * 0.4)) * 0.02, 3) }), [3.3, 0, 3.4], 1, { flip: true }));
    return out; },
  world: () => ({ dust: [dustTrail((s) => [s8bx(s) - 1, 0.4, 4.8], 8, 33, 44, [1, 0.88, 0.66], { size: [1.2, 4] })], clods: [clodTrail((s) => [s8bx(s) - 0.3, 0.15, 4.8], 8, 33, 45)] }),
};
// ---------- S9 three terrains ----------
const s9ax = (lf) => 340 + lf * 0.7;
const S9a = { id: 's9a', loc: 'desert', light: 'noon', a: 643, b: 660,
  cam: (lf) => ({ pos: [s9ax(lf) - 2.5, 0.7, 4.0], look: [s9ax(lf) + 0.5, 1.7, -2], fov: 46, roll: -3 + lf * 0.2 }), mb: () => 3,
  dof: (lf) => ({ at: [s9ax(lf), 2, -2], cinf: 7 }),
  actors: (lf, T) => [A.horseSide(T, { phase: lf * 0.09, t: lf, wind: 1.2, rider: A.rider({ lean: 22, scarf: lf, opts: { sweat: true } }) }, [s9ax(lf), 0, -2], 1.8, { rim: { dx: 0, dy: -10, col: '#fff6d0', a: 0.7 } })],
  world: () => ({ flare: 0, dust: [dustTrail((s) => [s9ax(s) - 1, 0.4, -2], 0, 18, 51, [1, 0.82, 0.6], { size: [1.5, 4.5], alpha: 0.6 })], clods: [clodTrail((s) => [s9ax(s), 0.15, -2], 0, 18, 52, [0.6, 0.42, 0.26])] }),
};
const s9bx = (lf) => -6 + lf * 0.6;
const S9b = { id: 's9b', loc: 'snow', light: 'snow', a: 661, b: 676,
  cam: (lf) => ({ pos: [s9bx(lf) + 2.2, 1.3, 5.0], look: [s9bx(lf) - 0.2, 1.8, 0], fov: 48, roll: 4 }), mb: () => 3,
  dof: (lf) => ({ at: [s9bx(lf), 2, 0], cinf: 8 }),
  actors: (lf, T) => [A.horseSide(T, { phase: lf * 0.09, t: lf, wind: 1.4, hexpr: 'det', rider: A.rider({ lean: 28, scarf: lf, expr: 'scared' }) }, [s9bx(lf), 0, 0], 1.8, { tint: '#e4ecff', rim: { dx: 8, dy: -8, col: '#ffffff', a: 0.7 } })],
  fx: (lf, T) => [A.fx('br' + lf, (p) => T.fxBreath(p, (lf % 8) / 8), [s9bx(lf) + 1.4 + (lf % 8) * 0.05, 2.2, 0.2], 0.7)],
  world: () => ({ snow: { n: 1400, box: [14, 8, 14], wind: [-9, -3, 1], wob: 0.2, size: 0.05, alpha: 0.9, col: [1, 1, 1], seed: 5 }, mist: { n: 50, box: [30, 8, 30], wind: [-6, 0, 0], size: 5, alpha: 0.2, col: [0.9, 0.95, 1], seed: 6 },
    dust: [dustTrail((s) => [s9bx(s) - 1, 0.3, 0], 0, 16, 61, [0.95, 0.97, 1], { size: [1, 3], alpha: 0.6 })] }),
};
const s9cx = (lf) => -5 + lf * 0.42;
const S9c = { id: 's9c', loc: 'river', light: 'river', a: 677, b: 703,
  cam: (lf) => ({ pos: [s9cx(lf) - 1.0, 0.35, 5.2], look: [s9cx(lf) + 0.6, 1.6, 0], fov: 46, roll: -2 }), mb: (lf) => (lf < 5 ? 3 : 1),
  dof: (lf) => ({ at: [s9cx(lf), 1.8, 0], cinf: 8 }),
  actors: (lf, T) => [A.horseSide(T, { phase: lf * 0.085, t: lf, wind: 1.1, rider: A.rider({ lean: 18, scarf: lf, expr: 'goofy' }) }, [s9cx(lf), -0.75, 0], 1.8)],
  world: () => ({ clods: [{ path: (s) => [s9cx(s), -0.2, 0.2], from: 0, to: 26, every: 1, per: 5, life: 16, size: [0.12, 0.08], alpha: 0.95, col: [0.85, 0.95, 1], vel: [0, 3.8, 1.2], jit: 2.4, grav: 9, spread: 1.2, seed: 71, floor: -0.4 }],
    dust: [{ path: (s) => [s9cx(s), -0.1, 0.3], from: 0, to: 26, every: 1, per: 2, life: 14, size: [0.6, 2.0], alpha: 0.55, col: [0.95, 1, 1], rise: 1.2, spread: 1, jit: 1, seed: 72 }] }),
};
// ---------- S10 hand-over at the home station, collapse on the hay ----------
const s10x = (lf) => (lf < 18 ? -0.9 : -0.9 + Math.pow(lf - 18, 1.5) * 0.13);
const S10 = { id: 's10', loc: 'big', light: 'dusk', a: 704, b: 782,
  cam: K([{ f: 0, pos: [-1.8, 1.6, 12.4], look: [-1.8, 1.5, 6], fov: 40, roll: 0 }, { f: 16, pos: [-1.75, 1.6, 12.2], look: [-1.75, 1.5, 6], fov: 40, ease: 'lin' }, { f: 32, pos: [-0.4, 1.6, 12], look: [0.8, 1.5, 6], fov: 42, ease: 'smooth' },
    { f: 46, pos: [-4.2, 1.45, 10.4], look: [-4.1, 1.15, 5.8], fov: 40, ease: 'easeOut' }, { f: 78, pos: [-4.2, 1.35, 9.6], look: [-4.1, 1.1, 5.8], fov: 38, ease: 'lin' }]),
  mb: (lf) => (lf >= 32 && lf < 44 ? 4 : 1),
  dof: (lf) => ({ at: lf < 30 ? [-1.8, 1.6, 6.2] : lf < 40 ? [s10x(lf), 1.6, 5.6] : [-4.1, 1, 5.9], cinf: 9 }),
  actors: (lf, T, f) => { const out = [], fall = clamp((lf - 50) / 9);
    out.push(A.horseSide(T, { kind: 'spot', phase: lf < 18 ? 0 : (lf - 18) * 0.09, mode: lf < 18 ? 'stand' : 'gallop', t: f, wind: lf < 18 ? 0.5 : 1.2, mochila: lf >= 14, rider: A.rider({ spec: 'rider2', lean: lf < 18 ? 6 : 24, scarf: f, expr: 'determined' }) }, [s10x(lf), 0, 5.6], 1.8, { rim: { dx: -10, dy: -6, col: '#ff9a70', a: 0.8 } }));
    out.push(A.person(T, 'rider', { ...RS(f), expr: lf < 46 ? 'happy' : lf < 60 ? 'laugh' : 'sleep', turn: lf < 40 ? 0.6 : 0, look: 1, legs: fall > 0.6 ? 'sit' : 'stand', L: lf < 16 ? { x: 470, y: 420, b: 0.4 } : lf < 46 ? 'wave' : 'hang', R: lf < 16 ? { x: 450, y: 440, b: 0.4 } : 'hang', tilt: -fall * 24, ...(lf > 46 ? {} : idleP(f, 21)) },
      [lerp(-2.6, -4.1, fall), lerp(0, 0.45, fall), lerp(6.6, 6.0, fall)], 1, { rim: { dx: -10, dy: -6, col: '#ff9a70', a: 0.8 } }));
    if (lf < 14) out.push(A.fx('bag10', BAG(T), [lerp(-2.2, -1.2, lf / 14), 1.6, 6.3], 0.45, { order: 4 }));
    return out; },
  world: () => ({ dust: [dustTrail((s) => [s10x(s) - 1, 0.4, 5.6], 18, 50, 81, [0.9, 0.8, 0.8]), { path: () => [-4.2, 0.6, 5.8], from: 58, to: 59, per: 12, life: 30, size: [0.3, 1.2], alpha: 0.7, col: [1, 0.9, 0.6], rise: 0.6, spread: 0.8, jit: 1.6, seed: 82 }],
    motes: { n: 30, box: [10, 4, 10], wind: [0.1, 0.2, 0], wob: 0.3, size: 0.04, alpha: 0.9, col: [1, 0.8, 0.4], seed: 83 } }),
};
// ---------- S11a arrival in town / S11b printing press / S12 Rekord ----------
const s11z = (lf) => -6 + lf * 0.34;
const S11a = { id: 's11a', loc: 'town', light: 'victory', a: 783, b: 839,
  cam: K([{ f: 0, pos: [0.6, 0.55, 16], look: [0, 2.4, -6], fov: 40, roll: -4 }, { f: 56, pos: [0.4, 0.6, 15.2], look: [0, 2.5, 0], fov: 46, roll: -1, ease: 'smooth' }]),
  mb: (lf) => (lf > 40 ? 2 : 1),
  dof: (lf) => ({ at: [0.2, 2.3, s11z(lf)], cinf: 6 }),
  actors: (lf, T) => [A.horseFront(T, { phase: lf * 0.085, t: lf, wind: 1, riderOpts: { expr: 'sly' } }, [0.2, 0, s11z(lf)], 1.8, { rim: { dx: 6, dy: -10, col: '#ffd890', a: 0.8 } })],
  fx: (lf, T) => { const out = []; for (let i = 0; i < 7; i++) { const t0 = (i * 7) % 30, t = (lf - t0) / 30; if (t < 0 || t > 1.2) continue; const x = (i % 2 ? 1 : -1) * (3.5 + (i % 3)), z = 6 - i * 3.2;
    out.push(A.fx('hat' + i + q(t, 2), (p) => T.fxHatFly(p, t * 6 + i, ['#a8865a', '#5a4030', '#7a6048'][i % 3]), [x - (i % 2 ? 1 : -1) * t * 1.5, 2 + Math.sin(Math.PI * Math.min(1, t)) * 4, z], 0.5, { order: 4 })); } return out; },
  world: () => ({ vic: true, jump: 0.25, dust: [dustTrail((s) => [0.2, 0.4, s11z(s) - 1], 0, 56, 91, [1, 0.88, 0.68], { size: [1.4, 4], vel: [0, 0.3, -0.8] })] }),
};
const S11b = { id: 's11b', loc: 'town', light: 'press', a: 840, b: 881,
  cam: K([{ f: 0, pos: [202.4, 2.6, 4.2], look: [200.2, 2.0, 0], fov: 42, roll: -4 }, { f: 41, pos: [201.6, 2.25, 3.0], look: [200.6, 2.0, 0.6], fov: 40, roll: 2, ease: 'smooth' }]),
  dof: (lf) => ({ at: lf < 22 ? [200, 2, 0] : [201.3, 2.0, 2.0], cinf: 10 }),
  fx: (lf, T, f) => { if (lf < 16) return []; const C = S11b.cam(lf), t = eo((lf - 16) / 14); const fw = [C.look[0] - C.pos[0], C.look[1] - C.pos[1], C.look[2] - C.pos[2]], L = Math.hypot(...fw), d = lerp(2.4, 1.3, t);
    return [A.fx('news' + q(t, 2), (p) => T.fxNews(p, lerp(0.9, -0.04, t), lerp(1, 0.1, t)), [C.pos[0] + fw[0] / L * d, C.pos[1] + fw[1] / L * d - lerp(0.2, 0.7, t), C.pos[2] + fw[2] / L * d], 0.42, { order: 7 })]; },
  world: () => ({ pressT: 1, motes: { n: 50, box: [5, 3, 5], wind: [0.1, 0.2, 0], size: 0.03, alpha: 0.8, col: [1, 0.9, 0.7], seed: 9, y0: 2 } }),
};
const S12 = { id: 's12', loc: 'town', light: 'victory', a: 882, b: 909,
  cam: K([{ f: 0, pos: [1.6, 1.0, 9.5], look: [0.3, 2.6, 2.5], fov: 44, roll: 3 }, { f: 27, pos: [1.3, 0.95, 8.3], look: [0.3, 2.7, 2.5], fov: 42, roll: 4, ease: 'lin' }]),
  dof: () => ({ at: [0.3, 2.6, 2.5], cinf: 9 }),
  actors: (lf, T, f) => [A.horseSide(T, { mode: 'stand', t: f, wind: 0.6, rider: A.rider({ lean: -4, expr: 'sly', scarf: f, R: { x: 380, y: 60, b: 0.4 }, opts: { holdR: 'hat', hatBack: undefined } }) }, [0.3, 0, 2.5], 1.8, { rim: { dx: -8, dy: -10, col: '#ffd890', a: 0.85 } }),
    A.person(T, 'crier', { expr: 'laugh', turn: 0.5, L: { x: 470, y: 330, b: 0.3 }, R: { x: 120, y: 400, b: 0.4 }, holdL: 'megaphone', holdR: 'news', ...idleP(f, 31) }, [-0.35, 0, 4.2], 0.78, { flip: true })],
  fx: (lf, T) => { const out = []; for (let i = 0; i < 9; i++) { const t = (lf + i * 3) / 26; const x = -4 + i * 1.0, z = -1 - (i % 3) * 1.5;
    out.push(A.fx('hh' + i + q(t, 2), (p) => T.fxHatFly(p, t * 7 + i, ['#a8865a', '#5a4030', '#7a6048', '#3a2e2a'][i % 4]), [x, 1.8 + Math.sin(Math.PI * Math.min(1, t)) * 4.5, z], 0.55, { order: 4 })); } return out; },
  world: () => ({ vic: true, jump: 0.35 }),
};
// ---------- S13a rider across the prairie / S13b workers raising poles ----------
const s13x = (lf) => 150 + lf * 0.32;
const S13a = { id: 's13a', loc: 'prairie', light: 'prairie', a: 910, b: 980,
  cam: (lf) => ({ pos: [s13x(lf) + 0.3, T_(s13x(lf), 16) + 1.3, 16.5], look: [s13x(lf) + 1.2, T_(s13x(lf), 10) + 2.2, 0], fov: 44, roll: 1.5 * Math.sin(lf * 0.06) }), mb: () => 2,
  dof: (lf) => ({ at: [s13x(lf), 2, 10], cinf: 7 }),
  actors: (lf, T) => [A.horseSide(T, { phase: lf * 0.085, t: lf, wind: 1.2, rider: A.rider({ lean: 20, scarf: lf, expr: 'determined' }) }, [s13x(lf), T_(s13x(lf), 10), 10], 1.8)],
  world: () => ({ raise: 0.4, dust: [dustTrail((s) => [s13x(s) - 1, T_(s13x(s), 10) + 0.3, 10], 0, 70, 101, [1, 0.9, 0.7])], clods: [clodTrail((s) => [s13x(s) - 0.2, T_(s13x(s), 10) + 0.1, 10], 0, 70, 102)] }),
};
const s13rx = (lf) => 192 + lf * 0.22;
const S13b = { id: 's13b', loc: 'prairie', light: 'prairie', a: 981, b: 1054,
  cam: K([{ f: 0, pos: [200.7, 1.45, 12.6], look: [200.0, 3.0, 1.0], fov: 46, roll: -2 }, { f: 73, pos: [200.9, 1.5, 11.6], look: [200.1, 3.4, 1.0], fov: 44, roll: 1, ease: 'lin' }]),
  dof: () => ({ at: [200.4, 2, 5.5], cinf: 6 }),
  actors: (lf, T, f) => { const pull = Math.sin(f * 0.25) * 6, y = (x, z) => T_(x, z);
    return [A.person(T, 'worker', { expr: 'determined', sweat: true, L: { x: 230, y: 160 + pull, b: 0.3 }, R: { x: 300, y: 120 + pull, b: 0.3 }, tilt: 8 }, [200.15, y(200.15, 5.5), 5.5], 1),
      A.person(T, 'worker2', { expr: 'angry', sweat: true, L: { x: 260, y: 190 - pull, b: 0.3 }, R: { x: 340, y: 150 - pull, b: 0.3 }, tilt: 10 }, [201.2, y(201.2, 7.3), 7.3], 1),
      A.person(T, 'worker', { expr: 'shock', sweat: true, turn: 0.4, holdR: 'hammer', R: lf % 16 < 8 ? 'up' : 'forward', L: 'hip', ...idleP(f, 41) }, [201.55, y(201.55, 1.6), 1.6], 1, { flip: true }),
      A.horseSide(T, { phase: lf * 0.085, t: lf, wind: 1.1, rider: A.rider({ lean: 12, scarf: lf, expr: 'goofy', opts: { look: -0.8, turn: 0.2 } }) }, [s13rx(lf), y(s13rx(lf), -6), -6], 1.8)]; },
  world: (lf) => ({ raise: 0.35 + 0.65 * sm(lf / 73), dust: [dustTrail((s) => [s13rx(s) - 1, T_(s13rx(s), -6) + 0.3, -6], 0, 73, 111, [1, 0.9, 0.7])] }),
};
// ---------- S14 "Für einen Draht": follow the wire to the horizon ----------
const S14 = { id: 's14', loc: 'prairie', light: 'prairie', a: 1055, b: 1098,
  cam: K([{ f: 0, pos: [170.9, T_(170, 0) + WIRE_Y + 0.22, 1.25], look: [169.9, T_(170, 0) + WIRE_Y, 0.6], fov: 34, roll: -5 }, { f: 10, pos: [170.85, T_(170, 0) + WIRE_Y + 0.22, 1.2], look: [169.9, T_(170, 0) + WIRE_Y, 0.6], fov: 33, roll: -5, ease: 'lin' }, { f: 43, pos: [150, T_(150, 0) + WIRE_Y + 0.3, 2.0], look: [80, T_(80, 0) + WIRE_Y - 0.6, 0.6], fov: 42, roll: 0, ease: 'smooth' }]),
  dof: (lf) => ({ at: lf < 14 ? [170, T_(170, 0) + WIRE_Y, 0.6] : [130, 6, 0.6], cinf: lf < 14 ? 12 : 4 }),
  world: () => ({ raise: 1, motes: { n: 30, box: [14, 5, 14], wind: [-1, 0.1, 0], wob: 0.2, size: 0.04, alpha: 0.8, col: [1, 0.98, 0.9], seed: 12 } }),
};
// ---------- S15a the finished line to the office / S15b the key ----------
const S15a = { id: 's15a', loc: 'prairie', light: 'office', a: 1099, b: 1163,
  cam: K([{ f: 0, pos: [318, T_(318, 0) + 6.8, 3.0], look: [360, T_(360, 0) + 6, 0.6], fov: 44, roll: 3 }, { f: 46, pos: [431, T_(431, 0) + 2.2, 15], look: [440, T_(440, 0) + 3.7, 2], fov: 42, ease: 'smooth', path: [[390, 8, 8]] }, { f: 64, pos: [432, T_(432, 0) + 1.9, 13.6], look: [440, T_(440, 0) + 3.7, 2], fov: 40, ease: 'lin' }]),
  mb: (lf) => (lf >= 8 && lf < 34 ? 3 : 1),
  dof: (lf) => ({ at: lf < 30 ? [360, 6, 0] : [440, T_(440, 0) + 3, 4.5], cinf: lf < 30 ? 3 : 6 }),
  actors: (lf, T, f) => [A.person(T, 'newsboy', { expr: 'goofy', turn: -0.3, L: 'point', R: 'hang', ...idleP(f, 51) }, [436.2, T_(436, 7), 7.0], 0.85)],
  world: () => ({ raise: 1, motes: { n: 30, box: [16, 5, 16], wind: [0.5, 0.1, 0], size: 0.05, alpha: 0.7, col: [1, 0.95, 0.8], seed: 13 } }),
};
const WC = [[0.1, 1.06, 0.65], [0.5, 0.99, 0], [0.8, 1.0, -2.3], [1.0, 2.0, -2.38], [1.3, 2.8, -2.4], [1.6, 2.9, -3.2]];
const alongWC = (t) => { const n = WC.length - 1, x = clamp(t) * n, i = Math.min(n - 1, Math.floor(x)), k = x - i; return lerp3(WC[i], WC[i + 1], k); };
const S15b = { id: 's15b', loc: 'office', light: 'officeIn', a: 1164, b: 1196,
  cam: (lf) => { const c = K([{ f: 0, pos: [0.3, 1.42, 1.75], look: [0.13, 1.22, -0.2], fov: 40, roll: -3 }, { f: 18, pos: [0.28, 1.38, 1.5], look: [0.13, 1.2, -0.2], fov: 38, ease: 'lin' }, { f: 32, pos: [0.4, 1.6, 2.0], look: [1.2, 2.4, -2.4], fov: 46, roll: 4, ease: 'easeOut' }], { creep: 0 })(lf); [4, 10, 16].forEach((k) => shake(c, lf, k, 0.008, 4)); return c; },
  mb: (lf) => (lf >= 19 && lf < 28 ? 4 : 1),
  dof: (lf) => ({ at: lf < 18 ? [0.14, 1.3, 0] : alongWC((lf - 18) / 12), cinf: 10 }),
  actors: (lf, T, f) => [A.person(T, 'operator', { expr: lf < 16 ? 'determined' : 'shock', glasses: true, legs: 'sit', turn: 0.1, look: 0.2, L: { x: 380, y: 640, b: 0.4 }, R: 'belly', ...idleP(f, 61) }, [0.15, 0, -0.75], 0.95)],
  fx: (lf, T) => { const out = []; for (const k of [4, 10, 16]) if (lf >= k && lf < k + 3) out.push(A.fx('sp' + k + lf, (p) => T.fxPulse(p, lf / 30, 0.8), [0.12, 1.0, 0.66], 0.08, { order: 7 }));
    if (lf >= 18 && lf < 31) { const pp = alongWC((lf - 18) / 12); out.push(A.fx('pu' + lf, (p) => T.fxPulse(p, lf / 30, 1), [pp[0], pp[1] - 0.2, pp[2]], 0.2, { order: 7 })); } return out; },
  world: (lf) => ({ press: [4, 10, 16].some((k) => lf >= k && lf < k + 3) ? 1 : 0, sparks: lf >= 18 ? [{ path: (s) => alongWC((s - 18) / 12), from: 18, to: 31, every: 1, per: 6, life: 10, size: [0.05, 0.01], alpha: 1, col: [0.5, 0.8, 1], jit: 0.5, spread: 0.05, seed: 121 }] : [],
    motes: { n: 40, box: [3, 2, 3], wind: [0.05, 0.08, 0], size: 0.012, alpha: 0.8, col: [1, 0.9, 0.7], seed: 14, y0: 1 } }),
};
// ---------- S16a the pulse races across the continent / S16b it overtakes the rider ----------
const pxA = (lf) => 1400 - lf * 46, wireYF = (x) => FH(x, 0) + 7.4;
const S16a = { id: 's16a', loc: 'fly', light: 'pulse', a: 1197, b: 1254,
  cam: (lf) => { const x = pxA(lf); return { pos: [x + 38, wireYF(x + 38) + 9 + Math.sin(lf * 0.1) * 3, 22], look: [x - 40, wireYF(x - 40) - 2, 0], fov: 56, roll: -8 + Math.sin(lf * 0.08) * 6 }; }, mb: () => 3,
  dof: () => ({ focus: 40, cinf: 0 }),
  fx: (lf, T) => { const x = pxA(lf); return [A.fx('pa' + (lf % 6), (p) => T.fxPulse(p, lf / 30, 1), [x, wireYF(x) - 1.6, 0.6], 4.2, { order: 7 })]; },
  world: () => ({ poles: true, sparks: [{ path: (s) => { const x = pxA(s); return [x, wireYF(x), 0.6]; }, from: 0, to: 57, every: 1, per: 8, life: 14, size: [2.2, 0.4], alpha: 1, col: [0.45, 0.75, 1], jit: 2, spread: 0.8, seed: 131 }],
    mist: { n: 50, box: [400, 120, 400], wind: [0, 0, 0], size: 50, alpha: 0.12, col: [1, 0.9, 0.95], seed: 15 } }),
};
const s16rx = (lf) => 290 + lf * 0.33, pxB = (lf) => 250 + (lf - 14) * 9;
const S16b = { id: 's16b', loc: 'prairie', light: 'overtake', a: 1255, b: 1303,
  cam: (lf) => { const x = s16rx(lf); const up = sm(clamp((lf - 18) / 12)); return { pos: [x - 0.6, T_(x, 10) + 1.0, 10.5], look: [x + 0.8, T_(x, 4) + 2.2 + up * 3.2, 1.5], fov: 48 + up * 4, roll: 2 - up * 5 }; },
  mb: (lf) => (lf >= 16 && lf < 26 ? 5 : 2),
  dof: (lf) => ({ at: [s16rx(lf), 2.5, 4], cinf: 7 }),
  actors: (lf, T) => { const shock = lf >= 20; return [A.horseSide(T, { phase: lf * 0.085, t: lf, wind: 1.2, hexpr: shock ? 'wide' : 'det', rider: A.rider({ lean: shock ? 4 : 20, scarf: lf, expr: shock ? 'shock' : 'determined', opts: shock ? { look: 0.4, headTilt: -14 } : {} }) }, [s16rx(lf), T_(s16rx(lf), 4), 4], 1.8)]; },
  fx: (lf, T) => { if (lf < 14 || lf > 30) return []; const x = pxB(lf); return [A.fx('pb' + lf, (p) => T.fxPulse(p, lf / 30, 1), [x, T_(x, 0) + WIRE_Y - 0.9, 0.6], 1.2, { order: 7 })]; },
  world: () => ({ raise: 1, dust: [dustTrail((s) => [s16rx(s) - 1, T_(s16rx(s), 4) + 0.3, 4], 0, 48, 141, [1, 0.85, 0.7])],
    sparks: [{ path: (s) => { const x = pxB(s); return [x, T_(x, 0) + WIRE_Y, 0.6]; }, from: 14, to: 30, every: 1, per: 10, life: 12, size: [0.25, 0.05], alpha: 1, col: [0.5, 0.8, 1], jit: 0.6, spread: 0.2, seed: 142 }] }),
  overlay: (lf) => (lf >= 20 && lf < 24 ? { key: 'bf' + lf, draw: (g, w, h) => { g.fillStyle = `rgba(190,225,255,${0.45 * (1 - (lf - 20) / 4)})`; g.fillRect(0, 0, w, h); } } : null),
};
// ---------- S17 "Geschlossen" is nailed on / S18 empty saddles, horses set free ----------
const S17 = { id: 's17', loc: 'station', light: 'closing', a: 1304, b: 1350,
  cam: (lf) => { const c = K([{ f: 0, pos: [0.15, 1.35, 7.0], look: [0.05, 1.32, 2.7], fov: 44, roll: -3 }, { f: 46, pos: [0.12, 1.33, 6.5], look: [0.05, 1.3, 2.7], fov: 43, roll: -4, ease: 'lin' }], { creep: 0 })(lf); [8, 22, 36].forEach((k) => shake(c, lf, k, 0.012, 6)); return c; },
  dof: () => ({ at: [0, 1.28, 2.75], cinf: 7 }),
  actors: (lf, T, f) => { const hit = [8, 22, 36].some((k) => lf >= k - 3 && lf < k); return [A.person(T, 'keeper', { expr: 'worried', turn: 0.6, look: 1, holdR: 'hammer', R: hit ? 'forward' : 'up', L: 'hang', ...idleP(f, 71) }, [0.92, 0.2, 3.4], 1, { flip: true })]; },
  world: (lf) => ({ noSign: true, closed: clamp(lf / 6), nails: lf >= 36 ? 2 : lf >= 22 ? 1 : 0,
    dust: [8, 22, 36].map((k, i) => ({ path: () => [i % 2 ? -0.66 : 0.66, 1.3, 2.85], from: k, to: k + 1, per: 6, life: 18, size: [0.08, 0.4], alpha: 0.5, col: [0.9, 0.8, 0.65], rise: 0.3, spread: 0.1, jit: 0.8, seed: 150 + i })) }),
};
const S18 = { id: 's18', loc: 'station', light: 'closing', a: 1351, b: 1394,
  cam: K([{ f: 0, pos: [10.2, 1.8, 0.6], look: [10.6, 1.65, -2.3], fov: 38, roll: 0 }, { f: 12, pos: [10.3, 1.8, 0.9], look: [10.8, 1.6, -2.3], fov: 38, ease: 'lin' }, { f: 28, pos: [11.4, 1.7, 4.0], look: [14.5, 1.4, 14], fov: 42, ease: 'smooth' }, { f: 43, pos: [11.5, 1.65, 4.6], look: [14.5, 1.4, 14], fov: 41, ease: 'lin' }]),
  mb: (lf) => (lf >= 13 && lf < 27 ? 4 : 1),
  dof: (lf) => ({ at: lf < 14 ? [10.8, 1.7, -2.2] : [13.6, 1.5, 11], cinf: 9 }),
  actors: (lf, T, f) => { if (lf < 14) return []; const out = [A.person(T, 'rider', { ...RS(f), expr: 'worried', legs: 'sit', turn: 0.6, look: 1, L: 'hang', R: 'hang', ...idleP(f, 81) }, [13.4, 0.55, 11.1], 1)];
    [['bay', 15, 22], ['black', 19, 27], ['spot', 12, 31]].forEach(([k, x0, z], i) => out.push(A.horseSide(T, { kind: k, phase: f * 0.07 + i * 0.3, mode: 'trot', t: f, wind: 0.8, saddle: false }, [x0 + (f - 1351) * 0.12, 0, z], 1.8)));
    return out; },
  world: () => ({ noSign: true, motes: { n: 40, box: [8, 4, 8], wind: [0.15, 0.1, 0], wob: 0.2, size: 0.03, alpha: 0.8, col: [1, 0.9, 0.7], seed: 18, y0: 1 } }),
};
// ---------- S19 finale: silhouette on the hill, wire, one bird; slow pull back ----------
const HX = -300, HTOP = PH(-300, 0);
const S19 = { id: 's19', loc: 'prairie', light: 'final', a: 1395, b: 1548,
  cam: K([{ f: 0, pos: [HX + 0.6, HTOP + 1.6, 7.5], look: [HX - 0.6, HTOP + 2.2, -2], fov: 34, roll: 0 }, { f: 153, pos: [HX + 3.2, HTOP + 2.6, 24], look: [HX + 0.6, HTOP + 3.2, -4], fov: 38, ease: 'smooth' }], { creep: 0 }),
  dof: (lf) => ({ at: [HX, HTOP + 2, 0], cinf: 4 }),
  actors: (lf, T, f) => { const sil = { dx: 0, dy: -12, col: '#ffb070', a: 1, sil: '#2a1a34', silA: 0.85 };
    return [A.horseSide(T, { mode: 'stand', t: f, wind: 0.6, headDown: 6 + 3 * Math.sin(f * 0.03) }, [HX - 1.6, PH(HX - 1.6, -0.6), -0.6], 1.8, { rim: sil }),
      A.person(T, 'rider', { ...RS(f * 0.4), expr: 'worried', turn: -0.2, look: -0.5, L: 'hang', R: { x: 120, y: 520, b: 0.4 }, ...idleP(f, 91) }, [HX + 0.4, PH(HX + 0.4, 0.2), 0.2], 1, { rim: sil }),
      A.fx('bird' + (Math.floor(f / 20) % 3), (p) => T.fxPerch(p, (Math.floor(f / 20) % 3) - 1, '#1e1426'), [HX + 4.6, PH(HX + 3.5, 0.5) + WIRE_Y - 0.1, 1.1], 0.22, { order: 6 })]; },
  world: () => ({ raise: 1, motes: { n: 60, box: [20, 6, 20], wind: [0.8, 0.15, 0], wob: 0.3, size: 0.05, alpha: 0.85, col: [1, 0.8, 0.6], seed: 19 } }),
};

export const SH = [S1, S2, S3, S4, S5a, S5b, S6a, S6b, S6c, S7a, S7b, S8a, S8b, S9a, S9b, S9c, S10, S11a, S11b, S12, S13a, S13b, S14, S15a, S15b, S16a, S16b, S17, S18, S19];
