// Chapter 2 — Window view (1:10-2:02)
import { clamp, lerp, ramp, sm, eo, back, q, blink, idle, cam, PER, BR, PR } from './common.js';
import { LIGHTS } from './common.js';

const BED_L = -7.3, BED_R = 7.3, WIN_L = -5.25, WIN_R = 5.25;
const sitY = 0.28, sitZ = -1.55;
const birds = (T, t, cx, out, n = 3, z = -3.8) => { for (let i = 0; i < n; i++) { const x = cx + Math.sin(t * 0.8 + i * 2.1) * 0.7, y = 2.05 + 0.25 * Math.sin(t * 1.3 + i), tt = (t * 2.2 + i * 0.33) % 1; out.push(PR(T, 'bird', [q(tt, 1), ['#3d5a80', '#e07a5f', '#81b29a'][i % 3]], [x, y, z - i * 0.4], 0.12, { flip: Math.cos(t * 0.8 + i * 2.1) < 0 })); } };
const splitCams = (t, keysL) => { const A = cam(keysL, t, { seed: 31, drift: 0.02 }); const B = { ...A, pos: [-A.pos[0], A.pos[1], A.pos[2]], look: [-A.look[0], A.look[1], A.look[2]], roll: -A.roll }; return { split: [A, B], pos: A.pos, look: A.look, fov: A.fov }; };

export const CH2 = [
  { id: 'h_split', a: 70, b: 76, set: 'hosp', light: 'hosp', desc: 'Bölünmüş ekran: birebir aynı iki hastane odası (krem duvar, metal karyola, serum askısı, büyük pencere). İkiz gibi iki hasta aynı anda, ayna simetrisiyle yataklarında doğruluyor',
    world: () => ({ hosp: { curtL: 0, curtR: 0, pillsL: 1, pillsR: 1 } }),
    cam: (t) => splitCams(t, [[0, [-5.9, 1.75, 3.2], [-6.35, 1.25, -1.3], 50], [6, [-6.0, 1.7, 2.6], [-6.45, 1.25, -1.3], 48]]),
    actors: (t, f, T) => { const out = [], up = back(ramp(t, 1.1, 1.9), 1.2), rxx = lerp(-1.25, 0, up);
      const expr = t < 1.2 ? 'sleepy' : t < 2.2 ? 'shock' : t < 4.0 ? 'neutral' : 'blank', look = t > 4 ? 0.7 : 0;
      for (const [who, x, half] of [['patA', BED_L, 0], ['patB', BED_R, 1]]) out.push(PER(T, who, { expr, mode: 'sit', L: t > 2.6 && t < 3.8 ? 'cheek' : 'belly', R: 'belly', blink: t < 1.2 ? 1 : blink(f, 4), look: half ? -look : look, seed: 4 }, [x, sitY, sitZ], { half, flip: half === 1, rx: q(rxx, 2), noBlob: true }));
      return out; } },

  { id: 'h_curtain', a: 76, b: 82, set: 'hosp', light: 'hosp', desc: 'Perdeler aynı anda açılıyor. Sol pencere: yeşil ağaçlar, kuşlar, güneş, odada dans eden yaprak gölgeleri. Sağ pencere: hemen karşıda kahverengi tuğla duvar, soğuk gri ışık',
    world: (t) => { const o = sm(ramp(t, 0.5, 1.6)); return { hosp: { curtL: o, curtR: o, pillsL: 1, pillsR: 1, cold: t > 1.2 } }; },
    lightMod: (L, t) => { if (t > 1.0) { const k = sm(ramp(t, 1.0, 2.2)); L.halves = [{ ...LIGHTS.hospWarm, sunI: lerp(1.6, 1.9, k) }, { ...LIGHTS.hospCold, hemi: lerp(1.25, 1.05, k) }]; } },
    cam: (t) => splitCams(t, [[0, [-6.0, 1.7, 2.6], [-6.4, 1.3, -1.3], 48], [6, [-5.7, 1.8, 1.9], [-5.9, 1.6, -2.4], 48]]),
    actors: (t, f, T) => { const out = [], open = t > 1.4;
      out.push(PER(T, 'patA', { expr: !open ? 'neutral' : t < 3 ? 'shock' : 'bliss', mode: 'sit', L: 'belly', R: open && t > 3 ? 'wave' : 'belly', wv: q(t * 6 % 6.28, 1), look: 0.8, blink: blink(f, 4), seed: 4 }, [BED_L, sitY, sitZ], { half: 0, noBlob: true }));
      out.push(PER(T, 'patB', { expr: !open ? 'neutral' : t < 3 ? 'blank' : 'sad', mode: 'sit', L: open && t > 3 ? 'cross' : 'belly', R: open && t > 3 ? 'cross' : 'belly', look: -0.8, blink: blink(f, 4), seed: 4 }, [BED_R, sitY, sitZ], { half: 1, flip: true, noBlob: true }));
      if (open) { birds(T, t, WIN_L, out); const a = clamp(ramp(t, 1.2, 2.2)) * 0.9;
        out.push({ ...PR(T, 'leafShadow', [q(t * 0.6, 2)], [-5.7, 0.02, -1.0], 1.0, { shape: 'big', rx: -Math.PI / 2, fixedYaw: 0, alpha: q(a, 2), fog: false }), half: 0 });
        out.push({ ...PR(T, 'sunbeam', [0.35], [-5.4, 1.5, -1.6], 0.9, { shape: 'big', fixedYaw: 0.4, alpha: q(a, 2), order: 7 }), half: 0 }); }
      return out.map((a) => a.half === undefined && a.key.startsWith('bird') ? { ...a, half: 0 } : a); } },

  { id: 'h_archive', a: 82, b: 89, set: 'archive', light: 'archive', desc: 'Arşiv odası: tavana kadar dosya dolapları, toz, yeşil abajur. Gözlüklü, hardal hırkalı araştırmacı dosyalara dalıyor; penceredeki ağaç time-lapse ile çıplaktan yapraklıya dönüyor',
    cam: (t) => cam([[0, [0.4, 3.4, 4.8], [0, 2.0, -2.0], 48], [4, [0.6, 2.2, 3.4], [0, 1.6, -1.2], 44], [7, [0.5, 1.8, 2.7], [-0.1, 1.45, -0.9], 42]], t, { seed: 32 }),
    actors: (t, f, T) => { const out = [], k = sm(ramp(t, 0.8, 6.2));
      out.push(PR(T, 'tree', [q(k, 2), 3], [0.1, 2.15, -3.7], 0.62, { fixedYaw: 0, fog: false }));
      const walk = t < 2.2, x = lerp(-3.2, -0.25, sm(ramp(t, 0, 2.2)));
      const dig = t > 2.4, flip = dig && Math.floor(t * 2.5) % 2;
      out.push(PER(T, 'res', { expr: dig ? (t > 5 ? 'grin' : 'smile') : 'neutral', L: dig ? (flip ? 'up' : 'hold') : 'hang', R: dig ? 'hold' : 'hold', heldR: { k: 'folder', col: '#e8c26a' }, step: walk ? q((t * 1.6) % 1) : 0, blink: blink(f, 8), ...(walk ? {} : idle(f, 8)) }, [x, 0, -1.35]));
      for (let i = 0; i < 4; i++) { const tp = 2.6 + i * 0.9; if (t > tp && t < tp + 0.9) out.push(PR(T, 'puff', [q(ramp(t, tp, tp + 0.9)), '#d8c8a8'], [-0.3 + (i % 2 ? 0.5 : -0.4), 1.6 + i * 0.1, -1.1], 0.32)); }
      out.push(PR(T, 'sparkles', [q(t * 0.3, 2), 9, '#f4e2b0'], [0.4, 2.0, -1.4], 1.4, { alpha: 0.55 }));
      return out; },
    dof: (t, C) => ({ focus: Math.hypot(C.pos[0], C.pos[1] - 1.4, C.pos[2] + 1.3), cinf: 3 }) },

  { id: 'h_compare', a: 89, b: 95, set: 'archive', light: 'archive', desc: 'Araştırmacı iki dosyayı yan yana koyup karşılaştırıyor (ağaç ikonlu dosyada az ilaç, tuğla ikonlu dosyada çok ilaç); kaşları havaya kalkıyor (vurucu an)',
    cam: (t) => cam([[0, [0.0, 1.65, 1.9], [0, 1.3, -0.6], 42], [2.9, [0.1, 1.6, 1.55], [0, 1.3, -0.6], 40], [3.15, [0.0, 1.75, 0.55], [0, 1.72, -1.35], 30, 0, 'eo'], [6, [0.0, 1.74, 0.45], [0, 1.72, -1.35], 28]], t, { seed: 33, kicks: [{ t: 3.1, a: 0.05 }] }),
    actors: (t, f, T) => { const out = [], wow = t > 3.0;
      out.push(PER(T, 'res', { expr: wow ? 'shock' : t > 1.5 ? 'skeptic' : 'neutral', L: wow ? 'cheek' : 'chin', R: wow ? 'cheek' : 'hang', look: wow ? 0 : Math.sin(t * 2.4) * 0.7, blink: wow ? 0 : blink(f, 8), ...idle(f, 8) }, [0, 0, -1.4]));
      const slide = sm(ramp(t, 0.2, 1.2));
      out.push(PR(T, 'folder', ['tree', false], [lerp(-0.1, -0.42, slide), 1.07, 0.0], 0.42, { rx: -1.15, fixedYaw: 0, shadow: true }));
      out.push(PR(T, 'folder', ['brick', true], [lerp(0.1, 0.42, slide), 1.07, 0.0], 0.42, { rx: -1.15, fixedYaw: 0, shadow: true }));
      if (wow) out.push(PR(T, 'sparkles', [q(t, 2), 4, '#ffffff'], [0, 1.8, -1.2], 0.35));
      return out; },
    dof: (t, C) => ({ focus: t > 3.1 ? 1.9 : 1.9, cinf: 3 }) },

  { id: 'h_wall', a: 95, b: 102, set: 'hosp', light: 'hospCold', desc: 'Duvar odası: komodinde ilaç kapları birikiyor, hasta kıvrılmış ve üzgün, hemşire teselli ediyor (soğuk gri ışık)',
    world: (t) => ({ hosp: { curtL: 1, curtR: 1, pillsR: 1 + Math.floor(8 * ramp(t, 0.6, 5.4)), cold: 1 } }),
    cam: (t) => cam([[0, [5.0, 1.75, 2.6], [6.8, 1.15, -1.5], 42], [7, [5.6, 1.6, 1.4], [6.8, 1.1, -1.6], 38]], t, { seed: 34 }),
    actors: (t, f, T) => { const out = [];
      out.push(PER(T, 'patB', { expr: 'sad', mode: 'sit', L: 'cross', R: 'cross', tilt: -4, headTilt: q(-6 + 2 * Math.sin(t), 1), blink: blink(f, 4), seed: 4 }, [BED_R, sitY, sitZ], { flip: true, noBlob: true }));
      out.push(PER(T, 'nurse', { expr: 'calm', L: 'hang', R: 'out', look: 0.6, blink: blink(f, 12), ...idle(f, 12) }, [8.25, 0, -1.0], { flip: true }));
      return out; } },

  { id: 'h_tree', a: 102, b: 109, set: 'hosp', light: 'hospWarm', desc: 'Ağaç odası: hasta kuşlara bakıp gülümsüyor, çantasını topluyor, el sallayıp güneşli kapıdan çıkıyor',
    world: (t) => ({ hosp: { curtL: 1, curtR: 1, pillsL: 1, door: sm(ramp(t, 4.3, 5.0)) } }),
    cam: (t) => cam([[0, [-4.3, 1.75, 4.3], [-6.4, 1.2, -1.0], 50], [7, [-4.9, 1.7, 3.8], [-7.2, 1.2, -0.3], 48]], t, { seed: 35 }),
    actors: (t, f, T) => { const out = [];
      if (t < 1.9) out.push(PER(T, 'patA', { expr: 'bliss', mode: 'sit', L: 'belly', R: 'belly', look: 0.8, blink: blink(f, 4), seed: 4 }, [BED_L, sitY, sitZ], { noBlob: true }));
      else { const w = t > 4.6, x = lerp(-6.5, -8.45, sm(ramp(t, 4.6, 6.6))), z = lerp(-0.5, 1.4, sm(ramp(t, 4.6, 6.6)));
        out.push(PER(T, 'patA', { expr: 'grin', L: t > 3.6 && t < 4.8 ? 'wave' : 'hang', wv: q(t * 8 % 6.28, 1), R: 'hold', heldR: { k: 'bag' }, step: w ? q((t * 1.7) % 1) : 0, blink: blink(f, 4), seed: 4 }, [x, 0, z], { alpha: q(1 - ramp(t, 6.3, 6.8), 2), flip: w })); }
      if (t > 1.7 && t < 2.3) out.push(PR(T, 'puff', [q(ramp(t, 1.7, 2.3))], [-6.7, 0.8, -0.8], 0.4));
      birds(T, t, WIN_L, out);
      out.push(PR(T, 'leafShadow', [q(t * 0.6, 2)], [-5.7, 0.02, -1.0], 1.0, { shape: 'big', rx: -Math.PI / 2, fixedYaw: 0, alpha: 0.9, fog: false }));
      if (t > 4.5) out.push(PR(T, 'sparkles', [q(t, 2), 6], [-8.5, 1.4, 1.4], 0.8));
      return out; } },

  { id: 'h_fly', a: 109, b: 116, set: 'hosp', light: 'garden', desc: 'Kamera sol pencereden dışarı süzülüp ağaçların arasına uçuyor; kuşlar eşlik ediyor',
    world: () => ({ hosp: { curtL: 1, curtR: 1 } }),
    cam: (t) => cam([[0, [-5.8, 1.8, 2.0], [-5.75, 1.9, -3], 50], [1.8, [-5.75, 1.95, -1.4], [-5.75, 2.0, -5], 54], [2.8, [-5.75, 2.0, -3.6], [-5.8, 2.3, -9], 56], [4.8, [-6.0, 2.7, -12], [-5.8, 3.0, -20], 56, 3], [7, [-5.2, 3.6, -21], [-4.5, 3.8, -31], 56, -2]], t, { seed: 36, creep: 0 }),
    actors: (t, f, T, C) => { const out = []; for (let i = 0; i < 4; i++) { const tt = (t * 2.4 + i * 0.27) % 1, d = 2.2 + i * 0.5; const p = [C.pos[0] + Math.sin(i * 1.7) * 0.9, C.pos[1] + 0.3 + 0.2 * Math.sin(t * 2 + i), C.pos[2] - d]; if (t > 2.5) out.push(PR(T, 'bird', [q(tt, 1), ['#3d5a80', '#e07a5f', '#81b29a', '#f2cc8f'][i]], p, 0.13, { flip: i % 2 === 1 })); }
      for (let i = 0; i < 8; i++) { const z = -4 - i * 2.6, y = 3.4 - ((t * 0.6 + i * 0.37) % 1) * 3; out.push(PR(T, 'leaf', [['#5cae4a', '#78c25a', '#e6b13a'][i % 3]], [-5.8 + Math.sin(i * 2.3) * 1.5, y, z], 0.08, { roll: q(t * 2 + i, 1) })); }
      return out; },
    dof: () => ({ focus: 3, cinf: 0 }) },

  { id: 'h_modern', a: 116, b: 122, set: 'modern', light: 'modern', desc: 'Cam cepheli modern hastane: ortada yeşil iç avlu, fıskiye, banklar, güneşlenen hastalar',
    cam: (t) => cam([[0, [1, 15, 25], [0, 2, 0], 44], [4.2, [2.2, 4.5, 12], [0, 1.4, 0], 42], [6, [2.4, 3.6, 10.6], [0, 1.3, 0], 41]], t, { seed: 37, creep: 0.005 }),
    actors: (t, f, T) => { const out = [];
      out.push(PR(T, 'fountain', [q(t * 1.5 % 1, 2)], [0, 2.4, 0], 1.6, { fixedYaw: undefined }));
      out.push(PER(T, 'patC', { expr: 'calm', mode: 'sit', L: 'belly', R: 'belly', blink: 1, ...idle(f, 20) }, [-4.4, 0.04, 2.6]));
      out.push(PER(T, 'patD', { expr: 'bliss', mode: 'sit', L: 'belly', R: 'up', blink: blink(f, 21), ...idle(f, 21) }, [-3.7, 0.04, 2.35]));
      out.push(PER(T, 'patA', { expr: 'smile_closed', mode: 'sit', L: 'belly', R: 'belly', ...idle(f, 22), seed: 4 }, [4.4, 0.04, 2.6]));
      out.push(PER(T, 'wheel', { expr: 'grin', mode: 'sit', L: 'wave', wv: q(t * 5 % 6.28, 1), R: 'belly', blink: blink(f, 23) }, [2.0, 0, 3.6]));
      out.push(PER(T, 'nurse', { expr: 'smile', R: 'hold', heldR: { k: 'clipboard' }, step: q((t * 1.4) % 1), blink: blink(f, 12) }, [lerp(-2.4, 0.6, ramp(t, 0, 6)), 0, 4.2], {}));
      for (let i = 0; i < 3; i++) out.push(PR(T, 'bird', [q((t * 2 + i * 0.3) % 1, 1), '#3d5a80'], [-3 + i * 2 + t * 0.8, 6 + i * 0.6, -2 - i], 0.4));
      return out; } },
];
