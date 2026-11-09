// Chapter 5 — The elevator button (3:55-4:47)
import { clamp, lerp, ramp, sm, eo, ei, back, q, blink, idle, cam, PER, BR, PR } from './common.js';

const PANEL = [1.08, 1.2, -0.45], PANEL_YAW = -Math.PI / 2;
const panel = (T, lit) => PR(T, 'panel', [lit], PANEL, 0.5, { fixedYaw: PANEL_YAW, shadow: false });
const run = (t, k = 2.6) => q((t * k) % 1, 2);

export const CH5 = [
  { id: 'e_rush', a: 235, b: 241, set: 'lobby', light: 'lobby', desc: 'Mermer ofis lobisi. Elinde ağzına kadar dolu kahve olan aceleci adam, kapanmakta olan asansöre dalıyor',
    world: (t) => ({ lobby: { doors: lerp(1, 0.32, sm(ramp(t, 0.4, 2.3))) + 0.68 * sm(ramp(t, 2.7, 3.5)), floor: 0 } }),
    cam: (t) => cam([[0, [2.8, 1.6, 6.8], [-0.4, 1.25, 1.5], 44], [2.6, [1.6, 1.6, 5.8], [-0.1, 1.2, 0.2], 42], [6, [0.6, 1.55, 3.6], [0, 1.25, -0.9], 40]], t, { seed: 61, kicks: [{ t: 2.5, a: 0.04 }] }),
    actors: (t, f, T) => { const out = [], inside = t > 2.75;
      const x = inside ? lerp(0.05, 0.1, ramp(t, 2.75, 4)) : lerp(-4.2, 0.05, sm(ramp(t, 0.0, 2.75))), z = inside ? -0.85 : lerp(3.4, -0.85, ei(ramp(t, 1.4, 2.75)) * 0.4 + sm(ramp(t, 1.4, 2.75)) * 0.6);
      const sl = Math.sin(t * 9);
      out.push(PER(T, 'rush', { expr: inside ? (t > 4 ? 'relief' : 'nervous') : 'shock', L: 'hold', heldL: { k: 'cup', slosh: q(sl, 1) }, R: inside ? 'hang' : 'out', step: inside ? 0 : run(t), blink: blink(f, 60), tilt: inside ? 0 : 8, ...(inside ? idle(f, 60) : {}) }, [x, 0, z], { flip: false }));
      if (!inside) for (let i = 0; i < 3; i++) { const tt = ((t * 1.7 + i / 3) % 1); out.push(PR(T, 'drop', ['#8a5530'], [x - 0.6 - tt * 0.5, 1.3 - tt * tt * 1.1, z + 0.1], 0.03)); }
      return out; } },

  { id: 'e_press', a: 241, b: 247, set: 'lobby', light: 'lobby', desc: 'Adam "kapat" düğmesine (▶|◀ ikonlu) art arda basıyor; her basışta hızlı punch-in, gittikçe çılgınca',
    world: () => ({ lobby: { doors: 1, floor: 0 } }),
    cam: (t) => { const presses = [], times = []; let x = 1.9, d = 0.5; while (x < 5.8) { times.push(x); x += d; d = Math.max(0.12, d * 0.8); }
      if (t < 1.8) return cam([[0, [-0.8, 1.5, -2.05], [0.7, 1.15, -0.4], 62], [1.8, [-0.75, 1.5, -2.0], [0.75, 1.15, -0.4], 58]], t, { seed: 62 });
      return cam([[1.8, [0.18, 1.27, -1.1], [1.08, 1.18, -0.42], 44], [6, [0.32, 1.25, -0.95], [1.08, 1.18, -0.42], 38]], t, { seed: 63, kicks: times.map((tp, i) => ({ t: tp, a: 0.02 + i * 0.004, punch: 0.06 + i * 0.012, len: 0.16 })) }); },
    actors: (t, f, T) => { const out = [];
      let push = 0; { let x = 1.9, d = 0.5; while (x < 5.8) { const dd = t - x; if (dd >= 0 && dd < 0.12) push = Math.sin(dd / 0.12 * Math.PI); x += d; d = Math.max(0.12, d * 0.8); } }
      if (t < 1.8) { const pp = Math.max(0, Math.sin(t * 9));
        out.push(PER(T, 'rush', { expr: 'nervous', L: 'hold', heldL: { k: 'cup', slosh: q(Math.sin(t * 9), 1) }, R: 'press', blink: blink(f, 60), tilt: q(pp * 3, 1) }, [0.25 + pp * 0.04, 0, -0.85], { s: 0.86 }));
        out.push(panel(T, pp > 0.6 ? 1 : -1)); }
      else { out.push(panel(T, push > 0.3 ? 1 : -1)); out.push(PR(T, 'hand', [], [0.8 + 0.12 * push, 1.08, -0.62], 0.45, { fixedYaw: PANEL_YAW - 0.5 }));
        if (t > 4) for (let i = 0; i < 3; i++) { const tt = (t * 2 + i / 3) % 1; out.push(PR(T, 'drop', ['#8a5530'], [0.55, 1.35 - tt * 0.4, -0.7 + i * 0.05], 0.025)); } }
      return out; } },

  { id: 'e_close', a: 247, b: 253, set: 'lobby', light: 'lobby', desc: 'Kapılar yavaşça kapanıyor; adam gururla parmağının ucunu üflüyor',
    world: (t) => ({ lobby: { doors: 1 - sm(ramp(t, 0.4, 4.0)), floor: 0 } }),
    cam: (t) => cam([[0, [-0.75, 1.55, -2.05], [0.2, 1.2, 0.6], 64], [6, [-0.7, 1.5, -1.95], [0.25, 1.2, 0.4], 58]], t, { seed: 64 }),
    actors: (t, f, T) => [PER(T, 'rush', { expr: t > 4.2 ? 'blow' : t > 3.2 ? 'proud' : 'neutral', L: 'hold', heldL: { k: 'cup' }, R: t > 4.2 ? 'mouth' : t > 3.2 ? 'point' : 'hang', blink: t > 4.2 ? 1 : blink(f, 60), ...idle(f, 60) }, [0.35, 0, -0.75], { s: 0.86 })] },

  { id: 'e_blue', a: 253, b: 260, set: 'blueprint', light: 'blueprint', desc: 'Mavi teknik çizim (blueprint) kesiti: "kapat" düğmesinin kablosu kopuk, boşlukta sallanıyor; kapıyı ayrı bir kum saati ve dişliler yönetiyor',
    cam: (t) => cam([[0, [-2.6, 0.1, 1.2], [-2.5, 0, -5], 40], [3.0, [-2.2, 0.1, 0.8], [-2.2, 0, -5], 38], [4.2, [1.6, 0.3, 1.4], [2.1, 0.2, -5], 44], [7, [1.4, 0.3, 2.2], [1.6, 0.2, -5], 50]], t, { seed: 65, creep: 0.004 }),
    actors: (t, f, T) => [PR(T, 'blueprint', ['wire', q(t * 0.7, 2)], [-2.5, 0, -5], 2.2, { fixedYaw: 0, fog: false }), PR(T, 'blueprint', ['door', q(0.5 + 0.5 * Math.sin(t * 0.9), 2)], [1.4, -0.4, -5], 2.0, { fixedYaw: 0, fog: false }),
      PR(T, 'blueprint', ['gears', q(t * 0.25, 3)], [3.4, 1.3, -5], 1.5, { fixedYaw: 0, fog: false }), PR(T, 'blueprint', ['hourglass', q(t * 0.3 % 1, 2)], [4.2, -0.8, -5], 1.1, { fixedYaw: 0, fog: false })],
    dof: () => ({ focus: 6, cinf: 0 }) },

  { id: 'e_wheel', a: 260, b: 267, set: 'lobby', light: 'lobby', desc: 'Tekerlekli sandalyedeki kadın ve bastonlu yaşlı kadın gülümseyerek giriyor; kapılar sabırla açık bekliyor',
    world: () => ({ lobby: { doors: 1, floor: 0 } }),
    cam: (t) => cam([[0, [0.1, 1.55, -2.05], [0, 1.0, 2.2], 64], [7, [0.0, 1.5, -2.0], [0.1, 1.0, 1.8], 60]], t, { seed: 66 }),
    actors: (t, f, T) => { const out = [];
      out.push(PER(T, 'rush', { expr: t < 4 ? 'nervous' : 'smile', L: 'hold', heldL: { k: 'cup' }, R: 'hang', step: t < 4 ? q((t * 2) % 1) * 0.15 : 0, blink: blink(f, 60), ...idle(f, 60) }, [-0.75, 0, -1.4], { s: 0.86 }));
      const wz = lerp(3.2, -0.75, sm(ramp(t, 0.4, 3.4)));
      out.push(PER(T, 'wheel', { expr: 'grin', mode: 'sit', L: 'belly', R: t > 3.4 ? 'wave' : 'belly', wv: q(t * 6 % 6.28, 1), roll: q(-wz * 2, 1), blink: blink(f, 61) }, [0.15, 0, wz], { s: 0.86 }));
      const oz = lerp(4.6, -0.35, sm(ramp(t, 2.2, 6.2)));
      out.push(PER(T, 'old', { expr: 'smile', L: 'hang', R: 'hold', heldR: { k: 'cane' }, step: t > 2.2 && t < 6.2 ? q((t * 1.1) % 1) : 0, blink: blink(f, 62) }, [0.78, 0, oz], { s: 0.82 }));
      return out; } },

  { id: 'e_fire', a: 267, b: 273, set: 'lobby', light: 'lobby', desc: 'İtfaiyeci (kırmızı kask, arma/numara yok) anahtarı deliğe sokup çeviriyor; kapılar anında "zack" diye kapanıyor; adamın ağzı açık kalıyor (vurucu an)',
    world: (t) => ({ lobby: { doors: t < 1.75 ? 1 : 1 - eo(ramp(t, 1.75, 1.9)), floor: 0 } }),
    cam: (t) => t < 2.3 ? cam([[0, [-0.75, 1.5, -2.05], [0.7, 1.1, -0.35], 60], [2.3, [-0.7, 1.5, -2.0], [0.75, 1.1, -0.35], 58]], t, { seed: 67, kicks: [{ t: 1.8, a: 0.07 }] })
      : cam([[2.3, [-0.45, 1.62, -0.25], [-0.6, 1.55, -1.3], 42], [6, [-0.45, 1.6, -0.35], [-0.6, 1.55, -1.3], 38]], t, { seed: 68 }),
    camFlash: [[1.8, 0.35]],
    actors: (t, f, T) => { const out = [panel(T, -1)];
      out.push(PER(T, 'fire', { expr: t > 1.9 ? 'proud' : 'stern', L: 'hang', R: 'press', heldR: { k: 'key' }, blink: blink(f, 63), ...idle(f, 63) }, [0.35, 0, -0.55], { s: 0.86 }));
      out.push(PER(T, 'rush', { expr: t > 1.85 ? 'gape' : 'neutral', L: 'hold', heldL: { k: 'cup', slosh: t > 1.85 && t < 2.6 ? q(Math.sin(t * 20), 1) : 0 }, R: t > 2.4 ? 'cheek' : 'hang', blink: t > 1.85 ? 0 : blink(f, 60) }, [-0.6, 0, -1.3], { s: 0.86 }));
      return out; } },

  { id: 'e_brain', a: 273, b: 280, set: 'lobby', light: 'lobby', desc: 'Beyin elinde oyuncak araba direksiyonu, heyecanla çeviriyor (sahte kontrol metaforu); adamın kafasındaki stres bulutu dağılıyor',
    world: () => ({ lobby: { doors: 1, floor: 2 } }),
    cam: (t) => cam([[0, [0, 1.25, 0.1], [0, 0.95, -1.8], 64], [7, [0, 1.22, -0.05], [0, 0.95, -1.8], 58]], t, { seed: 69 }),
    actors: (t, f, T) => { const out = [], k = 1 - sm(ramp(t, 1.2, 5.0));
      out.push(PER(T, 'rush', { expr: t < 2.2 ? 'nervous' : t < 4 ? 'blank' : 'calm', L: 'hold', heldL: { k: 'cup' }, R: 'hang', blink: blink(f, 60), ...idle(f, 60) }, [-0.5, 0, -1.55], { s: 0.86 }));
      if (k > 0.02) out.push(PR(T, 'scribble', [q(k, 2)], [-0.5, 1.85 + 0.03 * Math.sin(t * 5), -1.5], 0.45, { alpha: q(Math.min(1, k * 1.5), 2) }));
      const wa = Math.sin(t * 4.2) * 1.1;
      out.push(BR(T, { expr: 'excited', L: 'wheel', R: 'wheel', wheel: 1, wa: q(wa, 1), blink: 0 }, [0.42, 0.02 * Math.abs(Math.sin(t * 8)), -1.65], { s: 0.72, roll: q(wa * 0.06, 2) }));
      return out; } },

  { id: 'e_nyc', a: 280, b: 287, set: 'nyc', light: 'nyc', desc: 'New York benzeri kavşak (yazısız sarı taksiler, buhar): yayalar butona basıyor; kesitte kopuk kablo; kamera geri çekiliyor ve yüzlerce butonlu direk (sarı noktalar) görünüyor',
    world: (t) => ({ nyc: { pins: sm(ramp(t, 4.6, 6.2)) } }),
    cam: (t) => { if (t < 2.4) return cam([[0, [-1.6, 1.7, 10.0], [2.6, 1.4, 3.6], 40], [2.4, [-1.0, 1.65, 9.4], [2.8, 1.4, 3.6], 38]], t, { seed: 70 });
      if (t < 4.2) return cam([[2.4, [2.85, 1.32, 4.5], [3.25, 1.24, 3.35], 30], [4.2, [2.9, 1.3, 4.35], [3.25, 1.24, 3.35], 28]], t, { seed: 71 });
      return cam([[4.2, [1.0, 1.8, 8.6], [3.0, 1.3, 3.4], 42], [7, [20, 190, 110], [0, 0, -45], 52, 0, 'sm']], t, { seed: 72, creep: 0 }); },
    actors: (t, f, T) => { const out = [], pr = Math.max(0, Math.sin(t * 10));
      out.push(PER(T, 'ped1', { expr: 'nervous', L: 'hang', R: 'press', blink: blink(f, 64), tilt: q(pr * 3, 1) }, [2.55, 0.18, 3.75], { s: 0.92 }));
      out.push(PER(T, 'ped2', { expr: 'neutral', L: 'hold', R: Math.sin(t * 7) > 0 ? 'press' : 'hang', blink: blink(f, 65), ...idle(f, 65) }, [3.65, 0.18, 4.3], { s: 0.9, flip: true }));
      out.push(PER(T, 'ped3', { expr: 'stern', L: 'cross', R: 'cross', blink: blink(f, 66), ...idle(f, 66) }, [2.4, 0.18, 4.9], { s: 0.92 }));
      out.push(PR(T, 'buttonBox', [q(sm(ramp(t, 2.7, 3.2)), 2), q(pr > 0.5 ? 1 : 0)], [3.25, 1.26, 3.34], 0.33, { fixedYaw: 0.2 }));
      out.push(PR(T, 'steam', [q(t * 0.7 % 1, 2)], [-2.2, 1.0, 2.2], 1.4, { alpha: 0.85 }));
      return out; },
    dof: () => ({ focus: 5, cinf: 0 }) },
];
