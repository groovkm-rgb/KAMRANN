// Chapter 4 — Expensive placebo (3:00-3:52)
import { clamp, lerp, ramp, sm, eo, ei, back, q, blink, idle, cam, PER, BR, PR } from './common.js';
import { LIGHTS } from './common.js';

const TOP = 0.96;
const splitCams = (t, keysL) => { const A = cam(keysL, t, { seed: 51, drift: 0.02 }); const B = { ...A, pos: [-A.pos[0], A.pos[1], A.pos[2]], look: [-A.look[0], A.look[1], A.look[2]], roll: -A.roll }; return { split: [A, B], pos: A.pos, look: A.look, fov: A.fov }; };
const zapFace = (t, t0) => t > t0 && t < t0 + 0.9;

export const CH4 = [
  { id: 'p_zap', a: 180, b: 186, set: 'lab', light: 'lab', desc: 'Aydınlık, sevimli laboratuvar. Gönüllü sandalyede, bileğinde küçük elektrot bandı; minik çizgi film kıvılcımı ve komik "ay!" yüzü (vurucu an)',
    world: () => ({ lab: { tables: true, chairs: [[0, 0, 0.6]], mach: [0.95, 0, 0.45] } }),
    cam: (t) => cam([[0, [0.3, 1.5, 3.6], [0, 1.15, 0.4], 40], [2.15, [0.1, 1.45, 3.2], [0, 1.15, 0.5], 38], [2.35, [0.1, 1.45, 2.4], [0.05, 1.3, 0.6], 33, 0, 'eo'], [4.0, [0.1, 1.45, 2.35], [0.05, 1.3, 0.6], 32], [6, [0.2, 1.45, 3.0], [0, 1.15, 0.5], 36]], t, { seed: 52, kicks: [{ t: 2.2, a: 0.06 }] }),
    actors: (t, f, T, C) => { const out = [], z = zapFace(t, 2.2);
      out.push(PER(T, 'vol', { expr: z ? 'ouch' : t > 3.1 ? 'relief' : t > 1.2 ? 'nervous' : 'neutral', mode: 'sit', L: 'belly', R: 'hang', blink: z ? 0 : blink(f, 50), ...(z ? {} : idle(f, 50)) }, [0, 0.1 + (z ? 0.16 * Math.sin(ramp(t, 2.2, 2.6) * Math.PI) : 0), 0.68], { noBlob: true }));
      out.push(PER(T, 'sci1', { expr: t > 2.3 && t < 3.2 ? 'shock' : 'smile', L: 'hold', heldL: { k: 'clipboard' }, R: t > 1.6 && t < 2.3 ? 'press' : 'hang', blink: blink(f, 5), ...idle(f, 5) }, [-1.15, 0, 0.3]));
      if (t > 2.15 && t < 2.75) out.push(PR(T, 'spark', [q(ramp(t, 2.15, 2.75))], [0.36, 0.72, 0.85], 0.25));
      return out; },
    camFlash: [[2.2, 0.25]] },

  { id: 'p_pills', a: 186, b: 192, set: 'lab', light: 'lab', desc: 'Araştırmacı birebir aynı beyaz hapları dağıtıyor. Yanında iki broşür: parlak şık olanın üstünde altın para destesi ikonu (pahalı); sade olanın üstünde kırmızı indirim etiketi ikonu ve tek madeni para (ucuz). Yazı yok',
    world: () => ({ lab: { tables: true } }),
    cam: (t) => cam([[0, [-2.0, 1.55, 1.9], [-2.4, 1.15, -0.2], 42], [6, [-2.6, 1.5, 1.6], [-2.4, 1.15, -0.2], 39]], t, { seed: 53 }),
    actors: (t, f, T) => { const out = [];
      out.push(PER(T, 'sci1', { expr: t > 4 ? 'wink' : 'smile', L: 'hold', heldL: { k: 'pill' }, R: 'reach', blink: blink(f, 5), ...idle(f, 5) }, [-2.45, 0, -0.95]));
      out.push(PR(T, 'brochure', ['rich'], [-3.25, TOP + 0.24, -0.15], 0.38, { shadow: true, roll: 0.06 }));
      out.push(PR(T, 'brochure', ['cheap'], [-1.55, TOP + 0.24, -0.15], 0.38, { shadow: true, roll: -0.06 }));
      for (let i = 0; i < 6; i++) { const tp = 0.4 + i * 0.7, k = sm(ramp(t, tp, tp + 0.45)); if (t > tp) out.push(PR(T, 'pillHalf', [0], [-2.9 + i * 0.2, TOP + 0.04 + 0.12 * Math.sin(k * Math.PI), lerp(-0.45, 0.35, k)], 0.08, { shadow: true })); }
      return out; },
    dof: () => ({ focus: 2.1, cinf: 3 }) },

  { id: 'p_split', a: 192, b: 199, set: 'lab', light: 'lab', desc: 'Bölünmüş görüntü: solda A grubu parlak broşürü okuyup etkileniyor; sağda B grubu indirimli broşüre şüpheyle kaşını kaldırarak bakıyor',
    world: () => ({ lab: { tables: true } }),
    lightMod: (L) => { L.halves = [{ gain: '#fff2d6', sat: 1.18 }, { gain: '#e9eef4', sat: 0.88 }]; },
    cam: (t) => splitCams(t, [[0, [-2.4, 1.55, 2.4], [-2.4, 1.2, -0.7], 48], [7, [-2.4, 1.55, 1.8], [-2.4, 1.25, -0.7], 46]]),
    actors: (t, f, T) => { const out = [];
      const a = t < 2 ? 'neutral' : t < 4.5 ? 'shock' : 'bliss', b = t < 2 ? 'neutral' : 'skeptic';
      out.push(PER(T, 'volA', { expr: a, mode: 'sit', L: 'hold', heldL: { k: 'brochure', kind: 'rich' }, R: t > 4.5 ? 'thumb' : 'hang', blink: blink(f, 52), ...idle(f, 52) }, [-2.85, 0.36, -0.95], { half: 0, noBlob: true }));
      out.push(PER(T, 'volA2', { expr: a === 'shock' ? 'grin' : a, mode: 'sit', L: 'hang', R: 'hold', heldR: { k: 'brochure', kind: 'rich' }, look: -0.4, blink: blink(f, 53), ...idle(f, 53) }, [-1.95, 0.36, -0.95], { half: 0, noBlob: true }));
      out.push(PER(T, 'volB', { expr: b, mode: 'sit', L: 'hold', heldL: { k: 'brochure', kind: 'cheap' }, R: t > 3 ? 'chin' : 'hang', blink: blink(f, 54), ...idle(f, 54) }, [1.95, 0.36, -0.95], { half: 1, noBlob: true }));
      out.push(PER(T, 'volB2', { expr: t > 3.5 ? 'stern' : b, mode: 'sit', L: 'cross', R: 'cross', look: -0.4, blink: blink(f, 55), ...idle(f, 55) }, [2.85, 0.36, -0.95], { half: 1, noBlob: true }));
      if (t > 4.5) out.push({ ...PR(T, 'sparkles', [q(t, 2), 6], [-2.4, 1.9, -0.8], 0.9), half: 0 });
      return out; } },

  { id: 'p_wait', a: 199, b: 205, set: 'lab', light: 'lab', desc: 'Bekleme: kum saati akıyor, gönüllüler hapları yutuyor',
    world: () => ({ lab: { tables: true } }),
    cam: (t) => cam([[0, [-0.6, 1.4, 3.0], [-0.3, 1.25, 0.0], 40], [6, [0.1, 1.45, 2.8], [0.2, 1.3, -0.6], 40]], t, { seed: 54 }),
    actors: (t, f, T) => { const out = [PR(T, 'hourglass', [q(ramp(t, 0, 6), 2)], [-0.95, 1.25, 1.45], 0.32, { shadow: true })];
      ['volA', 'volA2', 'volB', 'volB2'].forEach((w, i) => { const tp = 2.2 + i * 0.6, sw = t > tp && t < tp + 0.7, done = t > tp + 0.7;
        out.push(PER(T, w, { expr: sw ? 'blow' : done ? 'smile_closed' : 'neutral', L: 'hang', R: sw ? 'mouth' : 'hold', heldR: done ? null : { k: 'pill' }, blink: blink(f, 56 + i), ...idle(f, 56 + i) }, [-0.6 + i * 0.75, 0, -1.6])); });
      return out; },
    dof: (t, C) => { const k = sm(ramp(t, 2.0, 2.8)); return { focus: lerp(1.6, 4.4, k), cinf: 6 }; } },

  { id: 'p_zap2', a: 205, b: 212, set: 'lab', light: 'lab', desc: 'İkinci kıvılcım turu: A grubu gönüllüsü gülümsüyor, neredeyse hissetmiyor; B grubu gönüllüsü hâlâ yüzünü buruşturuyor',
    world: () => ({ lab: { tables: true, chairs: [[-0.85, 0, 0.6], [0.85, 0, 0.6]] } }),
    lightMod: (L) => { L.gain = '#fffaf2'; },
    cam: (t) => cam([[0, [0, 1.45, 3.5], [0, 1.15, 0.5], 42], [1.65, [0, 1.45, 3.3], [0, 1.15, 0.5], 41], [1.85, [0.75, 1.4, 2.4], [0.85, 1.28, 0.6], 34, 0, 'eo'], [3.2, [0.75, 1.4, 2.35], [0.85, 1.28, 0.6], 33], [4.2, [0, 1.45, 3.2], [0, 1.15, 0.5], 41], [7, [0, 1.45, 3.0], [0, 1.15, 0.5], 40]], t, { seed: 55, kicks: [{ t: 1.7, a: 0.05 }] }),
    actors: (t, f, T) => { const out = [], z = zapFace(t, 1.6);
      out.push(PER(T, 'volA', { expr: z ? 'smile' : t > 4.2 ? 'grin' : 'smile', mode: 'sit', L: 'belly', R: t > 4.2 ? 'thumb' : 'hang', blink: blink(f, 52), ...idle(f, 52) }, [-0.85, 0.1, 0.68], { noBlob: true }));
      out.push(PER(T, 'volB', { expr: z || (t > 2.5 && t < 4.2) ? 'ouch' : t > 4.2 ? 'pained' : 'nervous', mode: 'sit', L: 'belly', R: 'hang', blink: z ? 0 : blink(f, 54) }, [0.85, 0.1 + (z ? 0.15 * Math.sin(ramp(t, 1.6, 2.0) * Math.PI) : 0), 0.68], { noBlob: true }));
      if (t > 1.55 && t < 2.15) { const k = q(ramp(t, 1.55, 2.15)); out.push(PR(T, 'spark', [k], [-0.49, 0.72, 0.85], 0.12)); out.push(PR(T, 'spark', [k], [1.21, 0.72, 0.85], 0.25)); }
      return out; },
    camFlash: [[1.6, 0.2]] },

  { id: 'p_result', a: 212, b: 219, set: 'lab', light: 'lab', desc: 'Sonuç görseli: iki sıra gülen yüz ikonu; A grubunun (altın para) sırası belirgin şekilde daha uzun, B grubunun (indirim etiketi) sırası kısa. Rakam yok',
    world: () => ({ lab: { tables: false } }),
    cam: (t) => cam([[0, [0.4, 1.7, 3.8], [0, 1.9, -3.2], 46], [7, [0.0, 1.85, 1.6], [0, 1.95, -3.2], 44]], t, { seed: 56 }),
    actors: (t, f, T) => { const k = ramp(t, 0.5, 5.0); return [
      PR(T, 'smileChart', [9, 4, q(k, 2)], [0, 1.95, -3.25], 0.95, { shape: 'big', fixedYaw: 0, shadow: true }),
      PER(T, 'sci1', { expr: t > 4.5 ? 'proud' : 'smile', L: 'hang', R: 'point', blink: blink(f, 5), ...idle(f, 5) }, [-2.35, 0, -2.3], { flip: true }),
    ]; } },

  { id: 'p_twist', a: 219, b: 225, set: 'lab', light: 'lab', desc: 'Ters köşe: hap ikiye kırılıyor, içinden sadece ışıltılı şeker tozu çıkıyor; araştırmacı göz kırpıyor ("ta-da")',
    world: () => ({ lab: { tables: true } }),
    cam: (t) => cam([[0, [0, 1.35, 2.5], [0, 1.25, 0.5], 36], [1.0, [0, 1.35, 2.35], [0, 1.25, 0.5], 35], [1.25, [0, 1.3, 1.9], [0, 1.22, 0.6], 31, 0, 'eo'], [6, [0.1, 1.32, 1.75], [0, 1.25, 0.5], 30]], t, { seed: 57, kicks: [{ t: 1.1, a: 0.04 }] }),
    actors: (t, f, T) => [PR(T, 'pillHalf', [q(eo(ramp(t, 1.0, 2.0)), 2)], [0, 1.25, 0.75], 0.42), PER(T, 'sci1', { expr: t > 3.4 && t < 4.6 ? 'wink' : 'smile', L: 'hang', R: t > 3.4 ? 'thumb' : 'hang', blink: blink(f, 5), ...idle(f, 5) }, [0.75, 0, -0.9]), ...(t > 1.1 ? [PR(T, 'sparkles', [q(t, 2), 8], [-0.1, 1.05, 0.85], 0.32)] : [])],
    dof: (t) => ({ focus: t < 3.2 ? 1.2 : 2.7, cinf: 5 }) },

  { id: 'p_brain', a: 225, b: 232, set: 'lab', light: 'lab', desc: 'Beyin elinde dev bir fiyat etiketi tutuyor; etiketi pahalı yüzüne çevirdikçe yanındaki ağrı göstergesi kırmızıdan yeşile iniyor (rakamsız)',
    world: () => ({ lab: { tables: true } }),
    cam: (t) => cam([[0, [0.25, 1.3, 4.6], [0.25, 1.1, 0.5], 40], [7, [0.3, 1.28, 4.0], [0.25, 1.1, 0.5], 38]], t, { seed: 58 }),
    actors: (t, f, T) => { const out = [];
      // tag flips at 1.2 s, 3.0 s and 4.8 s; expensive side = gold coin stack
      const flips = [1.2, 3.0, 4.8]; let ang = 0; flips.forEach((x) => { ang += Math.PI * sm(ramp(t, x, x + 0.45)); });
      const side = Math.cos(ang) > 0 ? -1 : 1, sx = Math.max(0.06, Math.abs(Math.cos(ang)));
      const exp = side > 0, v = lerp(0.9, 0.12, sm(ramp(t, 1.5, 6.0))) * (exp ? 1 : 1) + (exp ? 0 : 0.15 * (1 - ramp(t, 5, 6)));
      out.push(BR(T, { expr: exp ? (t > 4 ? 'smug' : 'wow') : 'curious', L: 'hang', R: 'hold', blink: blink(f, 9) }, [-0.55, 0, 0.6], { s: 0.95 }));
      out.push(PR(T, 'priceTag', [side], [0.05, 1.42, 0.65], 0.5, { sx, roll: 0.08 * Math.sin(t * 2) }));
      out.push(PR(T, 'gauge', [q(clamp(v), 2)], [1.05, 1.1, 0.6], 0.42, { shadow: true }));
      return out; } },
];
