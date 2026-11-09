// Intro (0:00-0:15), chapter cards (transitions) and outro (4:47-5:00)
import { clamp, lerp, lerp3, ramp, sm, eo, ei, back, q, blink, cam, inFront, PER, BR, PR, SIGN } from './common.js';

const STUDIO = { a: '#7fd6e0', b: '#b59cf0' };
const brainIdle = (f) => ({ dy: 0.02 * Math.abs(Math.sin(f * 0.18)), sy: 1 + 0.025 * Math.sin(f * 0.18) });

/** chapter card: Brain hops in with a round sign showing n dots, then throws it at the camera */
export const cardShot = (id, a, b, n, desc) => {
  const D = b - a, tIn = D > 3.5 ? 0.9 : 0.45, tThrow = D - 1.15;
  const C0 = (t) => cam([[0, [0.35, 1.2, 4.9], [0.15, 1.1, 0], 30], [D, [0.15, 1.18, 4.4], [0.15, 1.1, 0], 29.5]], t, { creep: 0.01, seed: n });
  return {
    id, a, b, set: 'studio', light: 'studio', desc,
    world: () => ({ studio: STUDIO }),
    cam: (t) => { const c = C0(t); if (t > tThrow + 0.05) { const k = ramp(t, tThrow + 0.05, tThrow + 0.5); c.fov *= 1 - 0.12 * sm(k); } return c; },
    actors: (t, f, T, C) => {
      const out = [], arrive = ramp(t, 0, tIn), air = arrive < 1;
      const bx = lerp(2.8, 0, eo(arrive)), by = air ? 0.9 * Math.sin(Math.PI * arrive) : 0;
      const land = t - tIn, squash = land > 0 && land < 0.35 ? 1 - 0.14 * Math.sin(land / 0.35 * Math.PI) : 1;
      const throwing = t > tThrow - 0.35, th = ramp(t, tThrow - 0.35, tThrow);
      const wind = throwing && t < tThrow ? th : 0;
      const expr = air ? 'excited' : t < tThrow - 0.4 ? 'happy' : t < tThrow ? 'smug' : 'excited';
      const R = throwing ? 'throw' : 'up';
      const bi = brainIdle(f);
      out.push(BR(T, { expr, blink: air ? 0 : blink(f, 9), L: air ? 'up' : 'hang', R, th: q(wind, 1), legs: air ? 'jump' : 'stand', look: [0, 0] }, [bx, by + (air ? 0 : bi.dy), 0], { sy: squash * (air ? 1.05 : bi.sy), s: 1 }));
      // the sign
      const hand = [bx + 0.58, by + 1.0 + (air ? 0.05 : 0), 0.12];
      let sp = [hand[0] + 0.02, hand[1] + 0.68, 0.16], roll = 0.06 * Math.sin(t * 3), s = 0.75;
      if (throwing && t < tThrow) { sp = [sp[0] + 0.25 * wind, sp[1] + 0.1 * wind, sp[2] - 0.3 * wind]; roll = -0.5 * wind; }
      if (t >= tThrow) { const k = ramp(t, tThrow, D - 0.28), e = ei(k) * 0.6 + sm(k) * 0.4; const C2 = C; const tgt = inFront(C2, 0.42); sp = lerp3(sp, tgt, e); roll = -0.5 - 2 * Math.PI * 1.5 * eo(k); s = lerp(0.75, 0.9, k); }
      out.push(SIGN(T, n, sp, s, { roll, order: 6, fog: false }));
      return out;
    },
    dof: () => ({ focus: 6, cinf: 0 }),
  };
};

export const INTRO = [
  // ---- 0:00-0:05 cold-open montage: one striking image per chapter, 1 s each ----
  { id: 'm1', a: 0, b: 1, set: 'cell', light: 'cellGrey', desc: 'Montaj 1: dev rulo gri duvarı tek hamlede pembeye boyuyor',
    world: (t) => { const x = lerp(-3.2, 3.3, sm(ramp(t, 0.02, 0.92))); return { cell: { paint: clamp((x + 2.8) / 5.6), side: 0 } }; },
    cam: (t) => cam([[0, [0, 1.9, 1.7], [0, 1.9, -2.5], 47], [1, [0.15, 1.9, 1.3], [0, 1.9, -2.5], 45]], t, { seed: 1 }),
    lightMod: (L, t) => { L.sat = lerp(0.8, 1.05, ramp(t, 0.3, 1)); },
    actors: (t, f, T) => { const x = lerp(-3.2, 3.3, sm(ramp(t, 0.02, 0.92))); return [PR(T, 'rollerV', [q(t * 4 % 1)], [x, 1.9, -2.2], 2.45, { fixedYaw: 0 })]; } },
  { id: 'm2', a: 1, b: 2, set: 'hosp', light: 'hospCold', desc: 'Montaj 2: hastane penceresi, hemen karşıda tuğla duvar',
    world: () => ({ hosp: { curtL: 1, curtR: 1, cold: 1, pillsR: 5 } }),
    cam: (t) => cam([[0, [5.0, 1.75, 1.2], [5.25, 1.9, -2.6], 44], [1, [5.15, 1.82, 0.5], [5.25, 1.95, -2.6], 40]], t, { seed: 2 }),
    actors: (t, f, T) => [PER(T, 'patB', { expr: 'sad', mode: 'sit', L: 'cross', R: 'cross', blink: blink(f, 4), flip: 0 }, [7.3, 0.28, -1.5], { flip: true })] },
  { id: 'm3', a: 2, b: 3, set: 'wine', light: 'wine', desc: 'Montaj 3: beyaz şaraba damlayan kırmızı boya bulutu',
    world: () => ({ wine: { screen: true } }),
    cam: (t) => cam([[0, [4.6, 1.3, -1.55], [4.6, 1.2, -2.6], 34], [1, [4.6, 1.28, -1.7], [4.6, 1.2, -2.6], 31]], t, { seed: 3 }),
    actors: (t, f, T) => { const k = ramp(t, 0.25, 1); const out = [PR(T, 'wineGlass', ['#f3e6a2', 0.55, q(k * 0.9), '#c0171a', 2], [4.6, 1.2, -2.6], 0.32)];
      if (t < 0.3) out.push(PR(T, 'drop', [], [4.6, lerp(1.62, 1.28, ei(t / 0.3)), -2.55], 0.05)); out.push(PR(T, 'dropper', [], [4.6, 1.72, -2.6], 0.22)); return out; },
    dof: (t, C) => ({ focus: 1.05, cinf: 7 }) },
  { id: 'm4', a: 3, b: 4, set: 'lab', light: 'lab', desc: 'Montaj 4: açılan hapın içi boş, sadece ışıltı',
    world: () => ({ lab: { tables: true } }),
    cam: (t) => cam([[0, [-2.4, 1.35, 1.25], [-2.4, 1.18, 0], 36], [1, [-2.4, 1.32, 1.0], [-2.4, 1.18, 0], 33]], t, { seed: 4 }),
    actors: (t, f, T) => [PR(T, 'pillHalf', [q(eo(ramp(t, 0.15, 0.85)))], [-2.4, 1.2, 0], 0.32), PR(T, 'sparkles', [q(t, 2), 6], [-2.4, 1.25, -0.05], 0.4)],
    dof: () => ({ focus: 1.3, cinf: 7 }) },
  { id: 'm5', a: 4, b: 5, set: 'lobby', light: 'lobby', desc: 'Montaj 5: asansörde "kapat" düğmesine art arda basılıyor',
    world: () => ({ lobby: { doors: 0.6 } }),
    cam: (t) => cam([[0, [0.1, 1.25, -1.1], [1.08, 1.2, -0.45], 44], [1, [0.2, 1.25, -1.0], [1.08, 1.2, -0.45], 40]], t, { seed: 5, kicks: [0.1, 0.35, 0.55, 0.75].map((x) => ({ t: x, a: 0.03, punch: 0.08, len: 0.18 })) }),
    actors: (t, f, T) => { const ph = (t * 4.2) % 1, push = ph < 0.35 ? Math.sin(ph / 0.35 * Math.PI) : 0;
      return [PR(T, 'panel', [push > 0.3 ? 1 : -1], [1.08, 1.2, -0.45], 0.5, { fixedYaw: -Math.PI / 2 }), PR(T, 'hand', [], [0.8 + 0.12 * push, 1.08, -0.62], 0.45, { fixedYaw: -Math.PI / 2 - 0.5 })]; } },
  // ---- 0:05-0:11 the Brain arrives, knocks on its own head; a sly shadow copy appears ----
  { id: 'brain', a: 5, b: 11, set: 'studio', light: 'studio', desc: 'Beyin zıplayarak gelir, kameraya bakıp kafasına "tok tok" vurur; arkasında onu taklit eden sinsi gölge belirir',
    world: () => ({ studio: STUDIO }),
    cam: (t) => cam([[0, [0.5, 1.3, 5.6], [0.2, 0.95, 0], 32], [2.2, [0.2, 1.2, 4.6], [0, 0.9, 0], 30], [6, [-0.3, 1.25, 4.4], [-0.25, 1.05, -0.4], 32]], t, { seed: 6, kicks: [{ t: 0.85, a: 0.04 }, { t: 2.45, a: 0.02 }, { t: 2.85, a: 0.02 }] }),
    actors: (t, f, T) => {
      const out = [], arrive = ramp(t, 0, 0.85), air = arrive < 1, bx = lerp(3.2, 0, eo(arrive)), by = air ? 1.1 * Math.sin(Math.PI * arrive) : 0;
      const land = t - 0.85, sq = land > 0 && land < 0.4 ? 1 - 0.18 * Math.sin(land / 0.4 * Math.PI) : 1;
      const knock = t > 2.15 && t < 3.3, kn = knock ? (Math.abs(t - 2.45) < 0.1 || Math.abs(t - 2.85) < 0.1 ? 1 : 0) : 0;
      const glance = t > 4.4 && t < 5.4;
      const expr = air ? 'excited' : t < 2.1 ? 'happy' : knock ? 'curious' : glance ? 'worried' : t > 5.4 ? 'smug' : 'neutral';
      const bi = brainIdle(f);
      out.push(BR(T, { expr, blink: air || knock ? 0 : blink(f, 9), L: air ? 'up' : 'hang', R: knock ? 'knock' : air ? 'up' : t > 5.4 ? 'thumb' : 'hang', kn, legs: air ? 'jump' : 'stand', look: glance ? [-1, -0.2] : [0, 0] }, [bx, by + (air ? 0 : bi.dy), 0], { sy: sq * (air ? 1.05 : bi.sy), order: 3 }));
      // sly shadow twin behind, mimicking with a delay
      const sa = clamp(ramp(t, 2.9, 3.6) - ramp(t, 4.9, 5.6));
      if (sa > 0) { const td = t - 0.3, skn = td > 2.15 && td < 3.3 ? (Math.abs(td - 2.45) < 0.1 || Math.abs(td - 2.85) < 0.1 ? 1 : 0) : 0, mim = t < 4.4;
        out.push(BR(T, { shadow: true, R: mim && t < 3.9 ? 'knock' : 'hang', L: 'hang', kn: skn }, [-0.85 + 0.6 * ramp(t, 4.9, 5.6), 0, -1.6], { s: 1.35, alpha: q(sa * 0.85, 2), noBlob: true, order: 1, sy: 1 + 0.03 * Math.sin(f * 0.15) })); }
      return out;
    },
    dof: (t, C) => ({ focus: 6, cinf: 2 }) },
  cardShot('card1', 11, 15, 1, 'Beyin 1 noktalı yuvarlak tabelayı gösterir ve kameraya fırlatır (Bölüm 1 geçişi)'),
];

export const TRANSITIONS = [
  cardShot('card2', 67, 70, 2, 'Geçiş: Beyin 2 noktalı tabelayı gösterip fırlatır'),
  cardShot('card3', 122, 125, 3, 'Geçiş: Beyin 3 noktalı tabelayı gösterip fırlatır'),
  cardShot('card4', 177, 180, 4, 'Geçiş: Beyin 4 noktalı tabelayı gösterip fırlatır'),
  cardShot('card5', 232, 235, 5, 'Geçiş: Beyin 5 noktalı tabelayı gösterip fırlatır'),
];

export const OUTRO = [
  { id: 'o_chair', a: 287, b: 293, set: 'studio', light: 'studio', desc: 'Kapanış: Beyin koltuğa yayılmış, etrafında beş bölümün objeleri; kameraya bakıp kaşını kaldırır',
    world: () => ({ studio: { ...STUDIO, chair: true } }),
    cam: (t) => cam([[0, [0, 1.6, 7.2], [0, 1.0, 0], 34], [6, [0.2, 1.45, 6.0], [0, 1.05, 0], 31]], t, { seed: 21 }),
    actors: (t, f, T) => { const out = [], brow = t > 2.6 ? -14 * sm(ramp(t, 2.6, 3.0)) : 0, plop = ramp(t, 0, 0.35);
      out.push(BR(T, { expr: t > 2.6 ? 'smug' : 'closed', legs: 'sit', L: 'rest', R: 'rest', blink: t > 2.6 ? blink(f, 9) : 0, browR: q(brow, 0) }, [0, 1.0 + 0.25 * (1 - eo(plop)), 0.28], { sy: 1 - 0.08 * Math.sin(Math.PI * plop), noBlob: true, order: 3 }));
      const items = [['paintBucket', [], [-2.5, 0.55, 0.2], 0.55], ['pottedTree', [], [-1.65, 0.62, 0.9], 0.6], ['wineGlass', ['#b0122a', 0.5, 0, '#c0171a', 1], [1.6, 0.5, 0.9], 0.45], ['pillHalf', [0], [2.5, 0.45, 0.35], 0.3], ['button', [q(Math.sin(t * 3) > 0.6 ? 1 : 0)], [2.0, 1.55, -0.6], 0.32]];
      items.forEach(([n, args, p, s], i) => { const bob = 0.03 * Math.sin(t * 2 + i); out.push(PR(T, n, args, [p[0], p[1] + bob, p[2]], s, { shadow: true })); });
      return out; },
    dof: () => ({ focus: 7, cinf: 0 }) },
  { id: 'o_wave', a: 293, b: 300, set: 'studio', light: 'studio', desc: 'Kapanış: Beyin el sallar, arka plan sade tek renkli yumuşak gradyana döner (sol ve sağ boş: bitiş ekranı alanı)',
    world: (t) => { const k = sm(ramp(t, 0.2, 2.5)); return { studio: { a: lerp3c('#7fd6e0', '#a9c9ec', k), b: lerp3c('#b59cf0', '#c9d8f2', k), deco: 1 - k, stage: false, glow: 0.35 * (1 - k) } }; },
    cam: (t) => cam([[0, [0, 1.2, 5.2], [0, 1.0, 0], 30], [7, [0, 1.18, 4.7], [0, 1.0, 0], 29]], t, { seed: 22, drift: 0.02 }),
    actors: (t, f, T) => { const wv = t * 7; const bi = brainIdle(f); return [BR(T, { expr: t < 5.6 ? 'happy' : 'closed', R: 'wave', wv: q(wv % (Math.PI * 2), 1), blink: blink(f, 9) }, [0, bi.dy, 0], { sy: bi.sy })]; },
    dof: () => ({ focus: 6, cinf: 0 }) },
];
function lerp3c(a, b, t) { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const ch = (s) => Math.round((A >> s & 255) * (1 - t) + (B >> s & 255) * t).toString(16).padStart(2, '0'); return `#${ch(16)}${ch(8)}${ch(0)}`; }
