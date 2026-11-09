// Chapter 3 — Dyed wine (2:05-2:57)
import { clamp, lerp, ramp, sm, eo, ei, back, q, blink, idle, cam, PER, BR, PR } from './common.js';

const WHO = ['tasterA', 'tasterB', 'tasterC', 'tasterD', 'tasterE'], XS = [-2.4, -1.2, 0, 1.2, 2.4], TZ = -1.05, TY = 0.25, TOP = 0.78;
const WHITE = '#f3e6a2', RED = '#9e1030';
const mixHex = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const ch = (s) => Math.round((A >> s & 255) * (1 - t) + (B >> s & 255) * t).toString(16).padStart(2, '0'); return `#${ch(16)}${ch(8)}${ch(0)}`; };
const glass = (T, x, z, col, lv = 0.5, s = 0.28, ex = {}) => PR(T, 'wineGlass', [col, lv, 0, '#c0171a', 1], [x, TOP + 350 * 0.00225 * s, z], s, { shadow: true, ...ex });
const bottle = (T, kind, x, z, s = 0.3, ex = {}) => PR(T, 'bottle', [kind], [x, TOP + 360 * 0.00225 * s, z], s, { shadow: true, ...ex });
const tasters = (T, f, fn) => WHO.map((w, i) => PER(T, w, { mode: 'sit', blink: blink(f, 30 + i), ...idle(f, 30 + i), ...fn(i) }, [XS[i], TY, TZ], { noBlob: true }));

export const CH3 = [
  { id: 'w_hall', a: 125, b: 131, set: 'wine', light: 'wine', desc: 'Şık şarap tadım salonu: ahşap paneller, mumlar, meşe fıçılar, beyaz örtülü uzun masa, kristal kadehler. Önlüklü, papyonlu, elinde yazısız defter olan beş tadımcı oturuyor',
    world: () => ({ wine: { screen: true } }),
    cam: (t) => cam([[0, [-3.4, 1.75, 4.1], [-1.6, 1.3, -1.0], 40], [6, [2.6, 1.7, 3.9], [1.0, 1.3, -1.0], 40]], t, { seed: 41 }),
    actors: (t, f, T) => [...tasters(T, f, (i) => ({ expr: i % 2 ? 'smile' : 'neutral', L: 'hold', heldL: { k: 'notebook' }, R: i === 2 && t > 3 ? 'chin' : 'hang', look: Math.sin(t * 0.8 + i) * 0.5 })), ...XS.map((x) => glass(T, x, -0.2, '#eef4f6', 0.03))] },

  { id: 'w_dye', a: 131, b: 137, set: 'wine', light: 'wine', desc: 'Paravanın arkasında asistan damlalıkla beyaz şaraba kırmızı gıda boyası damlatıyor; boya bulut gibi yayılıp şarabı kırmızıya çeviriyor',
    world: () => ({ wine: { screen: true } }),
    cam: (t) => cam([[0, [4.25, 1.38, -1.55], [4.6, 1.2, -2.6], 38], [6, [4.45, 1.3, -1.8], [4.6, 1.2, -2.6], 34]], t, { seed: 42, creep: 0.008 }),
    actors: (t, f, T) => { const out = [], drops = [1.0, 1.8, 2.6];
      const k = sm(ramp(t, 1.1, 4.0)), col = mixHex(WHITE, RED, sm(ramp(t, 2.4, 5.0)));
      out.push(PR(T, 'wineGlass', [col, 0.55, q(k * (1 - ramp(t, 4.2, 5.2)), 2), '#c0171a', 2], [4.6, 1.16, -2.6], 0.3, { shadow: true }));
      out.push(PR(T, 'dropper', [0], [4.6, 1.66 + 0.02 * Math.sin(t * 3), -2.6], 0.2));
      for (const d of drops) if (t > d && t < d + 0.32) out.push(PR(T, 'drop', [], [4.6, lerp(1.58, 1.26, ei((t - d) / 0.32)), -2.58], 0.035));
      out.push(PER(T, 'assist', { expr: t > 4 ? 'wink' : 'smile', L: 'hang', R: 'hang', blink: blink(f, 40), ...idle(f, 40) }, [5.35, 0, -3.15], { s: 0.95 }));
      return out; },
    dof: (t, C) => ({ focus: 1.05, cinf: 6 }) },

  { id: 'w_taste', a: 137, b: 144, set: 'wine', light: 'wine', desc: 'Tadımcılar kırmızı kadehi çeviriyor, kokluyor, tadıyor; kafalarının üstünde düşünce balonları: ahududu, kiraz, böğürtlen',
    world: () => ({ wine: { screen: true } }),
    cam: (t) => cam([[0, [0.2, 1.6, 2.9], [0, 1.45, -0.9], 42], [7, [-0.2, 1.62, 2.4], [0, 1.5, -0.9], 41]], t, { seed: 43, kicks: [{ t: 3.6, a: 0.01 }, { t: 4.3, a: 0.01 }, { t: 5.0, a: 0.01 }] }),
    actors: (t, f, T) => { const out = [];
      const phase = t < 2.2 ? 'swirl' : t < 3.4 ? 'sniff' : 'sip';
      out.push(...tasters(T, f, (i) => ({ expr: phase === 'swirl' ? 'neutral' : phase === 'sniff' ? 'blow' : 'smile_closed', L: 'hang', R: phase === 'swirl' ? 'hold' : 'mouth', heldR: { k: 'glass', col: RED, level: 0.5 }, tilt: phase === 'swirl' ? q(2 * Math.sin(t * 6 + i), 1) : 0 })).slice(1, 4));
      [['raspberry', -1.2, 3.6], ['cherry', 0, 4.3], ['blackberry', 1.2, 5.0]].forEach(([fr, x, tp]) => { if (t > tp) { const k = back(ramp(t, tp, tp + 0.35), 2); out.push(PR(T, 'thought', [fr, 1], [x + 0.15, 2.32 + 0.03 * Math.sin(t * 2 + x), TZ + 0.1], 0.42 * k)); } });
      return out; } },

  { id: 'w_reveal', a: 144, b: 150, set: 'wine', light: 'wine', desc: 'Kamera geri çekiliyor: iki kadeh de (biri kırmızı, biri beyaz) aynı beyaz şarap şişesinden doldurulmuş. Beyin köşede eliyle yüzünü kapatıyor',
    world: () => ({ wine: { screen: true } }),
    cam: (t) => cam([[0, [0, 1.08, 1.25], [0, 0.96, 0.05], 34], [0.8, [0, 1.1, 1.2], [0, 0.96, 0.05], 33], [3.0, [0.2, 1.95, 4.4], [0.3, 1.2, -0.4], 44, 0, 'sm'], [6, [0.3, 1.9, 4.1], [0.4, 1.2, -0.4], 43]], t, { seed: 44 }),
    actors: (t, f, T) => { const out = [];
      out.push(glass(T, -0.28, 0.1, RED, 0.5, 0.26)); out.push(glass(T, 0.28, 0.1, WHITE, 0.5, 0.26)); out.push(bottle(T, 'white', 0, 0.0, 0.26));
      out.push(...tasters(T, f, (i) => ({ expr: 'proud', L: 'hold', heldL: { k: 'notebook' }, R: 'hang' })));
      const bk = back(ramp(t, 3.0, 3.5), 1.6);
      if (t > 3.0) out.push(BR(T, { expr: 'worried', L: 'hang', R: 'facepalm', blink: 0 }, [1.75, lerp(-1.0, 0, bk), 2.15], { s: 0.72, order: 5 }));
      return out; },
    dof: (t, C) => ({ focus: t < 1.5 ? 1.15 : 4.2, cinf: t < 1.5 ? 6 : 2 }) },

  { id: 'w_bottles', a: 150, b: 156, set: 'wine', light: 'wine', desc: 'İkinci test: aynı sıradan şarap iki farklı şişeye dolduruluyor: biri altın folyolu, mum mühürlü, yazısız armalı gösterişli şişe; diğeri vidalı kapaklı sade ucuz şişe',
    world: () => ({ wine: { screen: true } }),
    cam: (t) => cam([[0, [-0.5, 1.25, 1.45], [0, 1.1, 0.0], 40], [6, [0.5, 1.2, 1.3], [0, 1.08, 0.0], 37]], t, { seed: 45, kicks: [{ t: 4.9, a: 0.03, punch: 0.06, len: 0.4 }] }),
    actors: (t, f, T) => { const out = [];
      out.push(bottle(T, 'fancy', -0.33, 0.0, 0.3)); out.push(bottle(T, 'cheap', 0.33, 0.0, 0.3));
      const onA = t < 2.4, tilt = onA ? sm(ramp(t, 0.4, 0.9)) - sm(ramp(t, 1.9, 2.3)) : sm(ramp(t, 2.7, 3.2)) - sm(ramp(t, 4.2, 4.6));
      const jx = onA ? -0.33 : 0.33; if (t < 4.7) out.push(PR(T, 'jug', [q(tilt * 0.9, 2), q(clamp(tilt * 1.4 - 0.3), 2)], [jx + 0.16, 1.6, 0.0], 0.28));
      if (t > 4.9) out.push(PR(T, 'sparkles', [q(t, 2), 7], [-0.33, 1.38, 0.05], 0.4));
      if (t > 4.85 && t < 5.4) out.push(PR(T, 'puff', [q(ramp(t, 4.85, 5.4))], [-0.33, 1.4, 0.05], 0.12));
      return out; },
    dof: () => ({ focus: 1.5, cinf: 5 }) },

  { id: 'w_fancy', a: 156, b: 163, set: 'wine', light: 'wine', desc: 'Tadımcılar gösterişli şişeden içiyor: gözler kapalı, mutluluktan uçuyorlar, parmak öpücüğü, etrafta ışıltılar',
    world: () => ({ wine: { screen: true } }),
    lightMod: (L, t) => { L.gain = '#fff4e0'; L.sat = 1.2; },
    cam: (t) => cam([[0, [0, 1.65, 3.7], [0, 1.45, -0.8], 46], [7, [0, 1.75, 3.0], [0, 1.55, -0.8], 44]], t, { seed: 46 }),
    actors: (t, f, T) => { const out = [bottle(T, 'fancy', 0, -0.1, 0.3)];
      out.push(...tasters(T, f, (i) => { const kiss = t > 2.2 && ((t * 1.3 + i * 0.4) % 2) < 0.9; return { expr: t < 1.2 ? 'smile_closed' : 'bliss', L: 'hold', heldL: { k: 'glass', col: RED, level: 0.4 }, R: kiss ? 'mouth' : t > 4 ? 'up' : 'hang', blink: 0 }; }).map((a, i) => ({ ...a, y: a.y + (t > 1.5 ? 0.12 * sm(ramp(t, 1.5, 3)) * (1 + Math.sin(t * 2 + i)) : 0) })));
      out.push(PR(T, 'sparkles', [q(t * 0.7, 2), 12], [0, 1.9, -0.7], 2.4)); out.push(PR(T, 'sparkles', [q(t * 0.9 + 0.5, 2), 8, '#ffd1e3'], [0, 1.7, -0.5], 1.8));
      return out; } },

  { id: 'w_cheap', a: 163, b: 170, set: 'wine', light: 'wine', desc: 'Aynı tadımcılar ucuz şişeden içiyor: yüzlerini buruşturuyor, kovaya tükürüyor, başparmak aşağı (vurucu an: punch-in)',
    world: () => ({ wine: { screen: true } }),
    cam: (t) => cam([[0, [0, 1.65, 3.7], [0, 1.45, -0.8], 46], [2.4, [0.2, 1.65, 3.4], [0, 1.45, -0.8], 45], [2.6, [-0.95, 1.68, 1.35], [-1.2, 1.6, -1.0], 33, 2, 'eo'], [4.2, [-0.9, 1.68, 1.3], [-1.2, 1.6, -1.0], 32, 2], [4.8, [0.4, 1.6, 3.2], [0.3, 1.4, -0.8], 44], [7, [0.5, 1.6, 3.0], [0.3, 1.4, -0.8], 43]], t, { seed: 47, kicks: [{ t: 2.6, a: 0.06 }] }),
    actors: (t, f, T) => { const out = [bottle(T, 'cheap', 0, -0.1, 0.3)];
      out.push(...tasters(T, f, (i) => ({ expr: t < 1.4 ? 'neutral' : 'yuck', L: 'hold', heldL: { k: 'glass', col: RED, level: 0.4 }, R: t > 3.0 ? 'thumbdown' : t < 1.4 ? 'hang' : 'hang', tilt: t > 1.4 && t < 2.6 ? q(3 * Math.sin(t * 25 + i), 1) : 0 })));
      out.push(PR(T, 'spittoon', [], [2.4 + 0.5, TOP + 0.12, -0.3], 0.16, { shadow: true }));
      if (t > 4.6 && t < 5.6) out.push(PR(T, 'spray', [q(ramp(t, 4.6, 5.6))], [2.6, 1.55, -0.6], 0.3));
      return out; },
    dof: (t, C) => ({ focus: t > 2.5 && t < 4.5 ? 1.95 : 4.5, cinf: 3 }) },

  { id: 'w_meta', a: 170, b: 177, set: 'wine', light: 'wine', desc: 'Metafor: tadımcının dili küçük bir bantla "kapalı", gözleri ise kocaman ve parlıyor. Beyin, kadehleri gözlük gibi gözüne takmış',
    world: () => ({ wine: { screen: false } }),
    cam: (t) => cam([[0, [0, 1.55, 3.2], [0, 1.45, 0.3], 40], [7, [0, 1.55, 2.6], [0, 1.45, 0.3], 38]], t, { seed: 48 }),
    actors: (t, f, T) => [PR(T, 'meta', [q(t, 2)], [-0.85, 1.55, 0.5], 0.62, { sy: 1 + 0.02 * Math.sin(t * 2) }), BR(T, { expr: t > 3.5 ? 'excited' : 'happy', L: 'glasses', R: 'glasses', wineGlasses: true, blink: 0 }, [0.85, TOP + 0.03 * Math.abs(Math.sin(t * 3)), 0.2], { s: 0.72, blob: true, ground: TOP }), PR(T, 'sparkles', [q(t, 2), 6], [-0.85, 1.7, 0.6], 0.9)],
    dof: () => ({ focus: 2.6, cinf: 5 }) },
];
