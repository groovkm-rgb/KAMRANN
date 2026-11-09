// Chapter 1 — Pink cell (0:15-1:07)
import { clamp, lerp, lerp3, ramp, sm, eo, ei, back, q, blink, idle, cam, PER, BR, PR } from './common.js';

const head = (y, s, big) => y + (big ? 1.53 : 1.5) * s; // head-centre height of a standing card
const walkStep = (t, k = 1.7) => q((t * k) % 1, 2);

export const CH1 = [
  { id: 'c1_roll', a: 15, b: 21, set: 'cell', light: 'cellGrey', desc: 'Gri, kasvetli hücre (ranza, parmaklıklı küçük pencere). Dev boya rulosu tek hamlede duvarı sakız pembesine boyuyor',
    world: (t) => { const x = lerp(-3.3, 3.4, sm(ramp(t, 1.6, 3.6))); return { cell: { paint: clamp((x + 2.8) / 5.6), side: sm(ramp(t, 3.6, 4.8)) } }; },
    lightMod: (L, t) => { const k = sm(ramp(t, 3.0, 4.8)); L.sat = lerp(0.75, 1.1, k); L.gain = k > 0.5 ? '#fff4f8' : '#e6ecf4'; L.hemi = lerp(1.15, 1.3, k); },
    cam: (t) => cam([[0, [0.2, 1.7, 2.4], [0, 1.8, -2.5], 52], [1.6, [0.1, 1.72, 2.1], [0, 1.8, -2.5], 52], [3.8, [-0.3, 1.7, 1.9], [0, 1.85, -2.5], 50], [6, [-0.6, 1.6, 1.5], [0.2, 1.7, -2.5], 47]], t, { seed: 11, kicks: [{ t: 3.6, a: 0.03 }] }),
    actors: (t, f, T) => { const x = lerp(-3.3, 3.4, sm(ramp(t, 1.6, 3.6))); const out = [];
      if (t > 1.3 && t < 4.0) out.push(PR(T, 'rollerV', [q((t * 3) % 1)], [x, 1.9, -2.2], 2.45, { fixedYaw: 0 }));
      if (t > 3.7) out.push(PR(T, 'sparkles', [q(t, 2), 9], [0, 2.0, -2.2], 1.6, { alpha: q(clamp(1 - ramp(t, 4.6, 5.6)), 2) }));
      return out; } },

  { id: 'c1_bucket', a: 21, b: 27, set: 'bucket', light: 'bucket', desc: 'Yakın plan: beyaz boya kovasına küçük kutudan kırmızı boya dökülüyor, karıştırma çubuğuyla girdap gibi pembeye dönüyor',
    world: (t) => ({ bucket: { mix: lerp(0, 0.28, ramp(t, 0.8, 2.6)) + 0.72 * sm(ramp(t, 3.0, 5.6)), swirl: t * 1.3 } }),
    cam: (t) => cam([[0, [0.95, 1.85, 1.45], [0, 0.72, 0], 40], [6, [-0.55, 1.95, 1.35], [0, 0.75, 0], 35]], t, { seed: 12, kicks: [{ t: 5.4, a: 0, punch: 0.08, len: 0.5 }] }),
    actors: (t, f, T) => { const out = [], pour = clamp(ramp(t, 0.2, 1.3) - ramp(t, 2.6, 3.0));
      if (t < 3.1) out.push(PR(T, 'can', [q(pour)], [0.16, 1.16 + 0.08 * (1 - pour), 0.1], 0.36));
      if (t > 2.9) { const a = (t - 2.9) * 5.5, r = 0.24 * sm(ramp(t, 2.9, 3.3)); out.push(PR(T, 'stick', [], [Math.cos(a) * r, 1.02 + 0.03 * Math.sin(a * 2), Math.sin(a) * r], 0.36, { roll: q(0.2 * Math.cos(a), 2) })); }
      return out; },
    dof: (t, C) => ({ focus: Math.hypot(C.pos[0], C.pos[1] - 0.75, C.pos[2]), cinf: 6 }) },

  { id: 'c1_enter', a: 27, b: 34, set: 'cell', light: 'cellPink', desc: 'Gardiyan, iri ve sinirli mahkumu pembe hücreye getiriyor; kollarında çapa ve yıldız dövmeleri, kulaklarından buhar',
    world: (t) => ({ cell: { paint: 1, side: 1, door: sm(ramp(t, 0.3, 1.3)) } }),
    cam: (t) => cam([[0, [3.2, 1.65, 6.6], [1.2, 1.35, 2.0], 44], [3.6, [1.6, 1.65, 6.2], [0.2, 1.4, 1.5], 44], [5.0, [1.0, 1.7, 5.6], [0.0, 1.5, 0.6], 40], [5.4, [0.3, 1.75, 2.3], [0.0, 1.8, 0.6], 34, 0, 'eo'], [7, [0.25, 1.75, 2.15], [0.0, 1.8, 0.6], 33]], t, { seed: 13, kicks: [{ t: 5.4, a: 0.05 }] }),
    actors: (t, f, T) => { const out = [];
      // prisoner: walks along the corridor, then in through the door
      let px = lerp(4.6, 0.05, sm(ramp(t, 0.4, 3.0))), pz = lerp(3.9, 0.6, sm(ramp(t, 3.0, 4.6)));
      const walking = (t > 0.4 && t < 3.0) || (t > 3.0 && t < 4.6), ps = 1.12;
      const steam = t > 1.0, angryArm = t > 4.6;
      out.push(PER(T, 'prisoner', { expr: 'angry', L: angryArm ? 'fist' : 'pace', R: 'pace', sw: q(t * 6, 1), step: walking ? walkStep(t) : 0, blink: blink(f, 2), ...(walking ? {} : idle(f, 2)) }, [px, 0, pz], { s: ps, flip: t < 3.0 }));
      if (steam) for (const sd of [-1, 1]) out.push(PR(T, 'steam', [q(((t * 1.4) + (sd > 0 ? 0.5 : 0)) % 1)], [px + sd * 0.36, head(0, ps, 1) + 0.2, pz + 0.05], 0.3));
      // guard leads him in, stops at the door
      const gx = lerp(3.4, 1.05, sm(ramp(t, 0.0, 2.6))), gw = t < 2.6;
      out.push(PER(T, 'guard', { expr: t < 3.4 ? 'stern' : 'neutral', L: t > 2.8 ? 'point' : 'hang', R: 'hang', step: gw ? walkStep(t) : 0, blink: blink(f, 3), ...(gw ? {} : idle(f, 3)) }, [gx, 0, 3.55], { flip: t > 2.6 }));
      return out; } },

  { id: 'c1_calm', a: 34, b: 41, set: 'cell', light: 'cellPink', desc: 'Dışarıda gardiyan rakamsız kronometreye bakıyor; içeride mahkumun üstündeki kırmızı öfke bulutu küçülüyor, oturuyor, gözlerini kırpıştırıp sakinleşiyor',
    world: () => ({ cell: { paint: 1, side: 1, door: 0 } }),
    cam: (t) => cam([[0, [-0.4, 1.7, 6.0], [0.6, 1.35, -0.4], 38], [4.0, [0.0, 1.6, 5.2], [1.2, 1.25, -0.5], 36], [4.3, [0.6, 1.55, 4.4], [1.5, 1.3, -0.5], 27, 0, 'eo'], [7, [0.65, 1.5, 4.2], [1.55, 1.3, -0.5], 26]], t, { seed: 14 }),
    actors: (t, f, T) => { const out = [], k = lerp(1, 0.12, sm(ramp(t, 1.0, 4.4)));
      const expr = t < 1.8 ? 'angry' : t < 3.4 ? 'stern' : t < 4.2 ? 'blank' : 'calm';
      const flutter = t > 3.4 && t < 4.3 ? ((Math.floor(t * 9) % 2) ? 1 : 0) : blink(f, 2);
      out.push(PER(T, 'prisoner', { expr, mode: 'sit', L: t < 2.5 ? 'cross' : 'belly', R: t < 2.5 ? 'cross' : 'belly', blink: flutter, ...idle(f, 2) }, [1.7, 0.12, -0.45], { s: 1.12 }));
      out.push(PR(T, 'cloud', ['#e53935', 1, k > 0.5, 2], [1.7, 2.35 - (1 - k) * 0.25, -0.4], 0.62 * k + 0.08));
      if (t > 2.4 && t < 3.4) out.push(PR(T, 'puff', [q(ramp(t, 2.4, 3.4))], [1.7, 2.3, -0.3], 0.5));
      out.push(PER(T, 'guard', { expr: 'neutral', R: 'hold', heldR: { k: 'stopwatch', t: q((t * 0.5) % 1, 2) }, look: 0.4, blink: blink(f, 3), ...idle(f, 3) }, [-0.95, 0, 4.5], { flip: false }));
      return out; },
    dof: (t, C) => ({ focus: Math.hypot(C.pos[0] - 1.7, C.pos[1] - 1.3, C.pos[2] + 0.45), cinf: 5 }) },

  { id: 'c1_arm', a: 41, b: 47, set: 'cell', light: 'cellPink', desc: 'Mahkum çok zayıf bir gardiyanla bilek güreşi yapıyor ve anında kaybediyor; şaşkın yüz (vurucu an: hızlı punch-in)',
    world: () => ({ cell: { paint: 1, side: 1, table: true } }),
    cam: (t) => cam([[0, [0.3, 1.5, 2.45], [0, 1.25, 0.2], 50], [1.95, [0.0, 1.5, 2.3], [0, 1.25, 0.2], 48], [2.25, [-0.42, 1.52, 1.85], [-0.62, 1.45, 0.0], 27, -3, 'eo'], [6, [-0.45, 1.52, 1.7], [-0.62, 1.45, 0.0], 25, -3]], t, { seed: 15, kicks: [{ t: 2.0, a: 0.07 }] }),
    actors: (t, f, T) => { const out = [], strain = t < 1.95;
      const th = strain ? 108 + 4 * Math.sin(t * 22) + 4 * ramp(t, 0, 1.9) : lerp(112, 172, eo(ramp(t, 1.95, 2.05)));
      out.push(PER(T, 'prisoner', { expr: strain ? 'angry' : 'gape', mode: 'sit', L: 'belly', R: 'hold', blink: 0, tilt: strain ? q(2 * Math.sin(t * 20), 1) : 0 }, [-0.66, 0.06, -0.05], { s: 1.1 }));
      out.push(PER(T, 'thin', { expr: strain ? 'blank' : t < 3 ? 'smile' : 'proud', mode: 'sit', L: 'hold', R: t > 3.2 ? 'thumb' : 'hang', blink: blink(f, 4) }, [0.66, 0.06, -0.05], { s: 1.0 }));
      out.push(PR(T, 'armwrestle', [q(th, 0)], [0, 0.99, 0.52], 0.7, { fixedYaw: 0, order: 4 }));
      if (t > 2.0 && t < 2.6) out.push(PR(T, 'puff', [q(ramp(t, 2.0, 2.6))], [-0.35, 1.0, 0.55], 0.35));
      if (t > 2.4) out.push(PR(T, 'sparkles', [q(t, 2), 5, '#ffffff'], [-0.66, 1.75, 0.0], 0.5, { alpha: 0.9 }));
      return out; },
    dof: (t, C) => ({ focus: Math.hypot(C.pos[0] + 0.6, C.pos[1] - 1.4, C.pos[2]), cinf: t > 2.2 ? 6 : 2 }) },

  { id: 'c1_montA', a: 47, b: 50, set: 'block', light: 'cellPink', desc: 'Montaj: başka hapishanelerde koridor boyunca hücreler tek tek pembeye boyanıyor',
    world: (t) => ({ block: { paints: [0, 1, 2, 3, 4, 5].map((i) => sm(ramp(t, -0.5 + i * 0.5, 0.3 + i * 0.5))) } }),
    cam: (t) => cam([[0, [-9.5, 1.8, 3.4], [-7.5, 1.9, -2.0], 50], [3, [0.0, 1.8, 3.3], [2.0, 1.9, -2.0], 50]], t, { seed: 16, creep: 0.005 }),
    actors: (t, f, T) => { const out = []; for (let i = 0; i < 6; i++) { const p = sm(ramp(t, -0.5 + i * 0.5, 0.3 + i * 0.5)); if (p > 0.02 && p < 0.98) out.push(PR(T, 'rollerV', [q((t * 3) % 1)], [-12 + i * 4.4 - 2.1 + 4.2 * p, 2.0, -2.6], 2.25, { fixedYaw: 0 })); } return out; } },

  { id: 'c1_montB', a: 50, b: 53, set: 'locker', light: 'cellPink', desc: 'Montaj: pembe spor soyunma odası; iri sporcular bankta uykulu, başları düşüyor',
    cam: (t) => cam([[0, [-1.8, 1.45, 4.4], [-0.3, 1.15, -0.8], 42], [3, [1.4, 1.4, 3.9], [0.4, 1.15, -0.8], 40]], t, { seed: 17 }),
    actors: (t, f, T) => { const out = [];
      [['jock1', -1.7], ['jock2', 0], ['jock3', 1.7]].forEach(([w, x], i) => { const nod = Math.max(0, Math.sin(t * 1.4 + i * 1.7)); out.push(PER(T, w, { expr: i === 1 && t > 1.2 && t < 2.4 ? 'whistle' : 'sleepy', mode: 'sit', L: 'belly', R: 'belly', headTilt: q(nod * (i % 2 ? -12 : 12), 0), blink: 0, bob: q(0.01 * nod, 3) }, [x, 0.04, -0.5], { s: 1.12 }));
        if (i !== 1) { const k = 0.5 + 0.5 * Math.sin(t * 2.2 + i); out.push(PR(T, 'bubble', [q(k, 1)], [x + 0.16, 1.55, -0.35], 0.18)); } });
      return out; } },

  { id: 'c1_twist', a: 53, b: 60, set: 'cell', light: 'cellPink', desc: 'Ters köşe: mahkum hücrede fazla kalıyor; rakamsız duvar saati hızla dönüyor, volta atmaya başlıyor, öfke bulutu geri geliyor',
    world: () => ({ cell: { paint: 1, side: 1 } }),
    lightMod: (L, t) => { const k = ramp(t, 3, 7); L.gain = k > 0.5 ? '#ffe8e8' : L.gain; L.sat = lerp(1.1, 1.25, k); L.vig = lerp(0.18, 0.32, k); },
    cam: (t) => cam([[0, [-1.6, 2.15, -0.7], [-1.9, 2.25, -2.5], 38], [1.3, [-1.5, 2.1, -0.4], [-1.9, 2.25, -2.5], 36], [2.8, [0.4, 1.7, 2.4], [0, 1.4, -1.0], 50], [5.9, [0.3, 1.65, 2.1], [0, 1.45, -0.9], 46], [6.2, [0.2, 1.75, 1.2], [0.0, 1.75, -0.6], 34, 2, 'eo'], [7, [0.2, 1.75, 1.1], [0.0, 1.75, -0.6], 33, 2]], t, { seed: 18, kicks: [{ t: 6.0, a: 0.06 }] }),
    actors: (t, f, T) => { const out = [];
      out.push(PR(T, 'clock', [q(t * 3, 2)], [-1.9, 2.25, -2.44], 0.5, { fixedYaw: 0 }));
      const pace = t > 1.5, ph = (t - 1.5) * 1.25, x = pace ? 1.15 * Math.sin(ph) : 0, dir = Math.cos(ph) > 0;
      const k = sm(ramp(t, 2.6, 6.2)), expr = t < 3 ? 'neutral' : t < 4.6 ? 'stern' : 'angry';
      out.push(PER(T, 'prisoner', { expr, L: t > 5.5 ? 'fist' : 'pace', R: 'pace', sw: q(t * 5, 1), step: pace ? walkStep(t, 1.4) : 0, blink: blink(f, 2) }, [x, 0, -0.6], { s: 1.12, flip: !dir }));
      if (k > 0.02) out.push(PR(T, 'cloud', ['#e53935', 1, k > 0.6, 3], [x, 2.4 + 0.1 * Math.sin(t * 3), -0.55], 0.1 + 0.6 * k));
      if (t > 5.4) for (const sd of [-1, 1]) out.push(PR(T, 'steam', [q(((t * 1.6) + (sd > 0 ? 0.5 : 0)) % 1)], [x + sd * 0.36, 1.92, -0.5], 0.3));
      return out; },
    dof: (t, C) => ({ focus: t < 1.6 ? 2.0 : 3.2, cinf: t < 1.6 ? 6 : 2 }) },

  { id: 'c1_lab', a: 60, b: 67, set: 'lab', light: 'lab', desc: 'Laboratuvarda bilim insanları deneyi tekrarlıyor ve omuz silkiyor; pembe boya çatlayıp grileşiyor; Beyin köşeden kafasını uzatıp omuz silkiyor',
    world: (t) => ({ lab: { tables: false, panel: true, panelAt: [0, 0, -1.4], crack: sm(ramp(t, 1.5, 5.0)) } }),
    cam: (t) => cam([[0, [-0.4, 1.75, 6.0], [0, 1.6, -1.0], 40], [7, [0.4, 1.7, 5.2], [0.2, 1.55, -1.0], 38]], t, { seed: 19, kicks: [{ t: 1.8, a: 0.015 }, { t: 2.6, a: 0.015 }, { t: 3.3, a: 0.015 }, { t: 4.2, a: 0.02 }] }),
    actors: (t, f, T) => { const out = [], shrug = t > 3.6 && t < 5.2;
      out.push(PER(T, 'sci1', { expr: shrug ? 'shrug' : t > 2.4 ? 'nervous' : 'neutral', L: shrug ? 'shrug' : 'hold', R: shrug ? 'shrug' : 'hang', heldL: shrug ? null : { k: 'clipboard' }, look: t > 3.0 && t < 3.6 ? 0.8 : 0.3, blink: blink(f, 5), ...idle(f, 5) }, [-1.75, 0, -0.1]));
      out.push(PER(T, 'sci2', { expr: shrug ? 'shrug' : t > 2.4 ? 'shock' : 'neutral', L: shrug ? 'shrug' : 'hang', R: shrug ? 'shrug' : 'chin', look: t > 3.0 && t < 3.6 ? -0.8 : -0.3, blink: blink(f, 6), ...idle(f, 6) }, [1.75, 0, -0.1]));
      out.push(PER(T, 'sci3', { expr: t > 4 ? 'shrug' : 'neutral', L: 'hold', heldL: { k: 'notebook' }, R: t > 4.2 ? 'shrug' : 'hang', blink: blink(f, 7), ...idle(f, 7) }, [-3.2, 0, -1.2], { s: 0.95 }));
      // the Brain pokes its head in from the right edge and shrugs
      const bk = sm(ramp(t, 4.4, 5.0)), shr = t > 5.3;
      if (bk > 0) out.push(BR(T, { expr: shr ? 'shrug' : 'curious', L: shr ? 'shrug' : 'hang', R: shr ? 'shrug' : 'hang', blink: blink(f, 9) }, [lerp(3.6, 2.3, bk), 0, 0.9], { s: 0.8, roll: q(lerp(0.35, 0.08, bk), 2) }));
      return out; } },
];
