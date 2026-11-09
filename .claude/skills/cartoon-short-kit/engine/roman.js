FACE.snore = { eye: ["dash", "dash"], brow: [0, -1], mouth: "o" };
FACE.stubborn = { eye: ["lid", "lid"], brow: [4, -3], mouth: "frown" };
FACE.squint = { eye: ["slit", "slit"], brow: [3, -2], mouth: "dash" };

// ---------------- Roman-era cast (our own designs), built on the Pen / blob / face helpers above ----------------
const STEEL = "#aeb6bf", BRASS = "#d9a845", LEATHER = "#7a4a2a";
export const OUTFITS = {
  legion: { tunic: "#b8322f", cape: "#8f2228", skin: SKIN, helmet: true, armor: true, spear: true, shield: true },
  old: { tunic: "#9c4a3c", cape: "#6e3330", skin: "#f3d6bb", helmet: "old", armor: true, spear: true, shield: false, beard: "#f4f1ea", brows: "#f4f1ea" },
  toga: { tunic: "#f1ead8", skin: "#f5c9a0", toga: "#6b3c8f", hair: "#3b2a20", stout: true },
  civA: { tunic: "#4f7fb8", skin: "#f5c9a0", hair: "#5a3b2a" },
  civB: { tunic: "#d9a441", skin: SKIN, hair: "#2b211c", dress: "#c25a7a" },
  civC: { tunic: "#5d8a3a", skin: "#c99067", hair: "#1e1714", stout: true },
  workA: { tunic: "#8a5d3b", skin: "#f5c9a0", cap: "#c2733a", apron: "#d8c9a6" },
  workB: { tunic: "#3f6a6f", skin: "#ecd0b6", cap: "#5b4a8a", moustache: "#4a3020" },
};

/** galea: iron bowl, brass brow band, cheek guards, transverse red crest */
const galea = (p, H, cx, hc, light, thick, ow, old, u) => {
  const crest = old ? "#8d4b3f" : "#d2372f", bowl = old ? "#8f8a7e" : STEEL;
  // crest (behind the bowl top)
  const cy0 = hc - H.b * 0.98;
  const cr = ellPts(cx, cy0, 0.66 * 2 * H.a, 0.42 * 2 * H.b, 180, 360, 0, 40);
  cr.push([cx + 0.66 * 2 * H.a * 0.98, cy0 + 4 * u], [cx - 0.66 * 2 * H.a * 0.98, cy0 + 4 * u]);
  const crP = [...ellPts(cx, cy0 + 2 * u, 0.62 * 2 * H.a, 0.36 * 2 * H.b, 180, 360, 0, 40)];
  p.shadedFill(crP, crest, mul(crest, [0.7, 0.62, 0.7]), light, 0.62 * 2 * H.a, 0.3);
  p.clip(crP, () => { for (let i = -9; i <= 9; i++) p.stroke([[cx + i * 7.4 * u, cy0], [cx + i * 9.4 * u, cy0 - 0.62 * H.b * Math.cos(i / 11)]], 1.4 * u, mul(crest, [0.62, 0.55, 0.62])); });
  if (old) p.clip(crP, () => { for (let i = 0; i < 6; i++) p.ell(cx + (i - 3) * 22 * u, cy0 - 18 * u - (i % 2) * 10 * u, 9 * u, 5 * u, "#6f6a5e", 0); });
  p.inkRing(crP, ow * 0.85, thick);
  p.poly(rrect(cx - 10 * u, cy0 - 6 * u, cx + 10 * u, cy0 + 6 * u, 3 * u), BRASS, 2 * u);
  // bowl: upper head cap
  const bandY = hc - H.b * 0.42;
  const bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  p.shadedFill(bp, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => {
    p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff55");
    if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (3 + (i % 3) * 2) * u, (2 + (i % 2)) * u, "#8a4b22", 0);
  });
  p.inkRing(bp, ow * 0.9, thick);
  p.band([[cx - H.a * 1.04, bandY], [cx + H.a * 1.04, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
  for (const s of [-1, 1]) p.dot(cx + s * 0.55 * H.a, bandY, 2.2 * u, "#fff3c4");
};
const cheeks = (p, H, cx, hc, light, ow, old, u) => {
  const bowl = old ? "#8f8a7e" : STEEL;
  for (const s of [-1, 1]) {
    const x0 = cx + s * 0.78 * H.a, x1 = cx + s * 1.07 * H.a, y0 = hc - H.b * 0.42, y1 = hc + H.b * 0.48;
    const pts = [[x0, y0], [x1, y0], [x1 - s * 0.04 * H.a, y1 - 0.1 * H.b], [x0 + s * 0.06 * H.a, y1], [x0 - s * 0.05 * H.a, (y0 + y1) / 2]];
    p.shadedFill(pts, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, 0.2 * H.a, 0.3);
    p.poly(pts, null, ow * 0.8);
    p.dot((x0 + x1) / 2, (y0 + y1) / 2 - 0.05 * H.b, 2.2 * u, BRASS);
  }
};
const cobweb = (p, cx, cy, r, u) => {
  const g = p.g; g.save(); g.globalAlpha = 0.8;
  for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); p.stroke([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 1.1 * u, "#f2f2f2"); }
  for (let k = 1; k <= 4; k++) { const rr = r * k / 4.3, pts = []; for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } p.stroke(pts, 1 * u, "#f2f2f2"); }
  g.restore();
};

/** front-facing Roman-era character. opts: expr, blink, look, facing, seed, L/R arm poses, tilt, headTilt, bob, nohelmet, light */
export const romanFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? OUTFITS[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = O.spear ? "spear" : "hang", tilt = 0, headTilt = 0,
    bob = 0, nohelmet = false, light = rad(-120), web = false, step = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(O.tunic, INK, 0.62), armCol = mix(O.tunic, INK, 0.5);
  const helmet = !!O.helmet && !nohelmet, old = O.helmet === "old";
  p.rot = null;
  // ---- cape behind everything ----
  if (O.cape) {
    const cp = [[cx - 0.48 * W, chin + 0.08 * HH], [cx + 0.48 * W, chin + 0.08 * HH], [cx + 0.62 * W, sole - 0.55 * HH], [cx + 0.2 * W, sole - 0.45 * HH], [cx - 0.2 * W, sole - 0.5 * HH], [cx - 0.62 * W, sole - 0.55 * HH]];
    p.gradFill(cp, O.cape, mul(O.cape, [0.6, 0.6, 0.7]), light); p.inkRing(cp, ow * 0.8, thick);
  }
  // ---- legs ----
  const dress = !!O.dress;
  for (const side of [-1, 1]) {
    const up = Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 30 * (step ? 1 : 0);
    const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
    const sandal = O.helmet ? LEATHER : "#5a3b2a";
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, sandal);
    if (O.helmet) for (let k = 1; k <= 3; k++) p.stroke([[fx - 4 * u, fy - k * 0.07 * HH], [fx + 4 * u, fy - k * 0.07 * HH - 2 * u]], 2 * u, LEATHER);
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * W) / 1.06 * (O.stout ? 1.12 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "spear": return { pts: [s, [X(6), s[1] + 0.42 * HH], [X(10), s[1] + 0.2 * HH]], front: false };
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], front: false, finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]], front: false };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]], front: false };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]], front: false };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * HH]], front: true };
      case "temple": return { pts: [s, [X(26), s[1] + 0.05 * HH], [cx + side * (H.a + 16 * u), hc - 0.1 * HH]], front: false, swirl: true };
      case "lift": return { pts: [s, [X(20), s[1] - 0.25 * HH], [X(4), s[1] - 0.82 * HH]], front: false };
      case "shield": return { pts: [s, [X(4), s[1] + 0.4 * HH], [tcx + side * 0.6 * T.a, torsoBot - 0.1 * HH]], front: true };
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "reach": { const lf = (opts.lift || 0) * 0.62 * HH; return { pts: [s, [X(42), s[1] - 0.12 * HH - lf * 0.6], [X(82), s[1] - 0.5 * HH - lf]], front: false }; }
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: false };
      case "thumb": return { pts: [s, [X(20), s[1] + 0.12 * HH], [X(44), s[1] - 0.12 * HH]], front: false, thumb: true };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]], front: false };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    const [hx, hy] = a.pts[2];
    p.dot(hx, hy, 5.5 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.stroke([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], 2.6 * u); }
    if (a.thumb) p.stroke([[hx, hy], [hx + Math.sign(hx - cx) * 6 * u, hy - 12 * u]], 2.6 * u);
  };
  // spear behind
  if (O.spear && R === "spear") {
    const [hx, hy] = arms[1].pts[2], s0 = [hx + 2 * u, sole - 2 * u], s1 = [hx - 3 * u, 70];
    p.band([s0, s1], old ? "#6d5236" : "#8a5a34", 4.2 * u, 1.4 * u, "round");
    const tip = [[s1[0] - 7 * u, s1[1] + 6 * u], [s1[0], s1[1] - 34 * u], [s1[0] + 7 * u, s1[1] + 6 * u], [s1[0], s1[1] + 14 * u]];
    p.poly(tip, old ? "#8b7c6a" : "#c9cfd6", 2 * u);
    if (web) cobweb(p, s1[0] - 2 * u, s1[1] + 60 * u, 70 * u, u);
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso
  if (dress) {
    const D = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light); p.inkRing(dp, ow, thick);
  }
  // skirt / pteruges below the torso
  if (!dress) {
    const sk = [[tcx - 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 1.0 * T.a, torsoBot + 0.3 * HH], [tcx - 1.0 * T.a, torsoBot + 0.3 * HH]];
    p.gradFill(sk, O.tunic, mul(O.tunic, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
    if (O.armor) for (let i = -3; i <= 3; i++) { const x = tcx + i * 0.27 * T.a, st = [[x - 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot + 0.22 * HH], [x - 9 * u, torsoBot + 0.22 * HH]]; p.poly(st, old ? "#5e4632" : LEATHER, 1.6 * u); }
  }
  p.gradFill(tp, O.tunic, mul(O.tunic, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.armor) {
      const top = chin - 0.1 * HH, bot = torsoBot - 0.25 * HH, n = 5;
      for (let i = 0; i < n; i++) {
        const y0 = top + (bot - top) * i / n, y1 = top + (bot - top) * (i + 1) / n;
        const c = old ? (i % 2 ? "#8d8679" : "#9a9384") : (i % 2 ? "#a7b0ba" : "#bcc4cc");
        p.poly([[tcx - 1.5 * T.a, y0], [tcx + 1.5 * T.a, y0 + 3 * u], [tcx + 1.5 * T.a, y1 + 3 * u], [tcx - 1.5 * T.a, y1]], c, 1.8 * u);
      }
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.2 * HH], [tcx + 1.4 * T.a, torsoBot - 0.2 * HH]], LEATHER, 0.08 * HH, 1.5 * u);
      for (let i = -2; i <= 2; i++) p.dot(tcx + i * 0.3 * T.a, torsoBot - 0.2 * HH, 2.4 * u, BRASS);
      if (old) for (let i = 0; i < 5; i++) p.ell(tcx + Math.sin(i * 1.7) * 0.7 * T.a, top + (bot - top) * ((i * 0.31) % 1), 6 * u, 3 * u, "#8a4b22", 0);
    } else {
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.24 * HH], [tcx + 1.4 * T.a, torsoBot - 0.24 * HH]], O.apron ? "#5a3b2a" : "#e2c27a", 0.05 * HH, 1.2 * u);
      if (O.toga) p.band([[tcx - 1.0 * T.a, chin - 0.1 * HH], [tcx + 1.1 * T.a, torsoBot - 0.1 * HH]], O.toga, 0.16 * HH, 1.6 * u);
      if (O.apron) p.poly([[tcx - 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.6 * T.a, torsoBot + 0.2 * HH], [tcx - 0.6 * T.a, torsoBot + 0.2 * HH]], O.apron, 1.6 * u);
      p.stroke([[tcx - 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.16 * HH], [tcx + 0.2 * T.a, chin + 0.02 * HH]], 2 * u);
    }
  });
  p.inkRing(tp, ow, thick);
  if (O.armor) for (const s of [-1, 1]) { // shoulder plates
    const sp = ellPts(tcx + s * 0.72 * T.a, chin + 0.1 * HH, 0.42 * T.a, 0.13 * HH, 180, 360, s * 8, 20);
    p.poly(sp, old ? "#9a9384" : "#c5ccd3", 1.8 * u);
  }
  if (O.moss) {/* reserved */}
  for (const a of arms) if (a.front) drawArm(a);
  // shield in front, held by the left hand
  if (O.shield && L === "shield") {
    const sx = tcx - 0.55 * T.a, sy = torsoBot + 0.05 * HH, sw = 0.36 * W, sh = 0.78 * HH;
    const sp = rrect(sx - sw, sy - sh, sx + sw, sy + sh, 8 * u);
    p.gradFill(sp, "#c0302c", "#7d1d22", light);
    p.clip(sp, () => {
      p.band([[sx - sw, sy], [sx + sw, sy]], BRASS, 6 * u, 1.2 * u);
      p.band([[sx, sy - sh], [sx, sy + sh]], BRASS, 6 * u, 1.2 * u);
      for (const s of [-1, 1]) { p.stroke([[sx + s * 12 * u, sy - 14 * u], [sx + s * 34 * u, sy - 46 * u], [sx + s * 22 * u, sy - 44 * u], [sx + s * 46 * u, sy - 74 * u]], 3.5 * u, BRASS); p.stroke([[sx + s * 12 * u, sy + 14 * u], [sx + s * 34 * u, sy + 46 * u], [sx + s * 22 * u, sy + 44 * u], [sx + s * 46 * u, sy + 74 * u]], 3.5 * u, BRASS); }
      p.stroke(ellPts(sx - sw * 0.5, sy - sh * 0.7, sw * 0.3, sh * 0.1, 200, 320, 0, 10), 3 * u, "#ffffff44");
    });
    p.ell(sx, sy, 13 * u, 13 * u, "#e6c068", 2.2 * u);
    p.inkRing(sp, ow, thick);
  }
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  if (helmet) galea(p, H, cx, hc, light, thick, ow, old, u);
  const hp = blobPts(cx, hc, H);
  if (O.hair && !helmet) { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (helmet) {
    const bandY = hc - H.b * 0.42, bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
    p.shadedFill(bp, old ? "#8f8a7e" : STEEL, mul(old ? "#8f8a7e" : STEEL, [0.62, 0.64, 0.72]), light, H.a, 0.4);
    p.clip(bp, () => { p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 5 * u, "#ffffff66");
      if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
    p.poly(bp, null, ow * 0.9);
    p.band([[cx - H.a * 1.05, bandY], [cx + H.a * 1.05, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
    p.poly(rrect(cx - 4 * u, bandY - 0.55 * H.b, cx + 4 * u, bandY - 3 * u, 2 * u), old ? "#a88a4a" : BRASS, 1.5 * u);
    cheeks(p, H, cx, hc, light, ow, old, u);
  } else if (O.cap) hatOn(p, { hat: "cap", cap: O.cap, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.hair) hatOn(p, { hat: "hair", hair: O.hair, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.helmet && nohelmet) { // bald old head with white side tufts
    for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a, hc - 0.1 * H.b, 0.22 * H.a, 0.3 * H.b, "#f4f1ea", 3 * u);
  }
  if (O.beard) {
    const bd = blobPts(cx + 6 * u * facing, hc + 0.85 * H.b, { a: 0.62 * H.a, b: 0.75 * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.02, seed: seed + 4 });
    p.shadedFill(bd, O.beard, mul(O.beard, [0.86, 0.86, 0.92]), light, 0.6 * H.a, 0.3);
    p.clip(bd, () => { for (let i = -3; i <= 3; i++) p.stroke([[cx + i * 9 * u, hc + 0.45 * H.b], [cx + i * 7 * u, hc + 1.35 * H.b]], 1.2 * u, "#c9c4bb"); });
    p.inkRing(bd, ow * 0.8, thick);
  }
  faceFront(p, cx, hc, W, expr, facing, look, lid, helmet, skin, O.beard ? O.beard : O.moustache, !!O.stout);
  if (O.brows) for (const s of [-1, 1]) p.ell(cx + 7 * u * facing + s * 14 * u, hc - 20 * u, 11 * u, 5 * u, O.brows, 2 * u);
  if (O.beard) { // re-draw the mouth over the beard for open mouths
    if (expr === "shock" || expr === "snore") p.ell(cx + 8 * u * facing, hc + 22 * u, 6 * u, 7 * u, "#5a1e28", 2 * u);
  }
  p.rot = null;
  if (arms.some((a) => a.swirl)) { // cuckoo swirl next to the temple
    const a = arms.find((x) => x.swirl), [hx, hy] = a.pts[2], ph = opts.swirl || 0, pts = [];
    for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 4 + ph, r = (4 + i * 0.7) * u; pts.push([hx + Math.cos(t) * r, hy - 40 * u + Math.sin(t) * r]); }
    p.stroke(pts, 3 * u, "#ffffff"); p.stroke(pts, 1.4 * u, INK);
  }
};

/** loose helmet prop card (lifted off the old soldier) */
export const helmetCard = (p) => {
  const H = headBlob(3, 118, 0), u = 2 * H.a / 100, hc = 560, light = rad(-120), thick = thickAngle(light), ow = 5 * u;
  galea(p, H, 300, hc, light, thick, ow, true, u);
  const bandY = hc - H.b * 0.42, bp = ellPts(300, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  // dark inside visible from below
  p.ell(300, bandY, H.a * 1.05, 0.12 * H.b, "#2a221e", 0);
  p.shadedFill(bp, "#8f8a7e", mul("#8f8a7e", [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => { for (let i = 0; i < 9; i++) p.ell(300 + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
  p.poly(bp, null, ow * 0.9);
  p.band([[300 - H.a * 1.05, bandY], [300 + H.a * 1.05, bandY]], "#a88a4a", 7 * u, 1.8 * u, "round");
  cheeks(p, H, 300, hc, light, ow, true, u);
};

/** ZZZ for the sleeping guard */
export const fxZ = (p, t) => {
  const g = p.g; g.save(); g.font = "900 120px Arial Black, Arial"; g.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const k = (t + i / 3) % 1, x = 220 + i * 70 + Math.sin(k * 6) * 20, y = 700 - k * 500, s = 0.5 + k * 0.7;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, (1 - k) * 2.5);
    g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("Z", 0, 0); g.fillStyle = "#ffffff"; g.fillText("Z", 0, 0); g.restore();
  }
  g.restore();
};
/** falling leaf */
export const fxLeaf = (p, col) => { p.poly([[300, 380], [420, 470], [300, 620], [180, 470]], col, 14); p.stroke([[300, 400], [300, 600]], 8); };
/** dust cloud puff (k 0..1 growth) */
export const fxDust = (p, k, col = "#e8dcc4") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 90 + 150 * k; p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.6, 120 + 60 * k, 100 + 50 * k, col, 12); }
  p.ell(300, 520, 170 + 110 * k, 140 + 80 * k, col, 0);
  g.restore();
};
export const fxDrip = (p) => p.ell(300, 500, 40, 64, "#9fd4ff", 10);
export const fxWood = (p, seed) => { p.poly([[200, 420], [400, 400], [420, 560], [230, 600]], "#5b3d22", 14); p.stroke([[240, 450], [380, 440]], 6, "#3a2614"); p.ell(330, 520, 26, 18, "#4d7a32", 0); };

export const headCenter = (seed = 3) => { const H = headBlob(seed, 118, 0), HH = 2 * H.b; return 975 - 1.38 * HH - 1.08 * HH - H.b; };

// =====================================================================================
// 1940s spy-story cast (invented cartoon characters; no flags, badges, insignia or letters).
// OUR SIDE = navy-grey, ENEMY = dark green-brown. Drawn on the same 600x1000 card as romanFront.
// =====================================================================================
FACE.sleep = { eye: ["none", "none"], brow: [1, 2], mouth: "smile" };
FACE.sly = { eye: ["lid", "happy"], brow: [-5, 2], mouth: "smirk" };
FACE.shh = { eye: ["lid", "lid"], brow: [-3, -1], mouth: "o" };
FACE.determined = { eye: ["lid", "lid"], brow: [5, -2], mouth: "dash" };
FACE.angry = { eye: ["lid", "lid"], brow: [7, -4], mouth: "teeth" };
FACE.pleased = { eye: ["happy", "happy"], brow: [-1, -3], mouth: "smile" };
FACE.curious = { eye: ["dot", "dot"], brow: [-6, 0], mouth: "smirk" };
FACE.blow = { eye: ["squeeze", "squeeze"], brow: [-2, -3], mouth: "o" };

const NAVY = "#3f4c68", NAVY_D = "#2f3a52", OLIVE = "#55603c", OLIVE_D = "#3e4630", GOLD = "#d9b55a";
export const SPY = {
  agent: { jacket: NAVY, pants: NAVY_D, shoes: "#231c22", skin: "#f7d6b4", hair: "#1c1820", hairStyle: "wavy", thin: true,
    coat: "#c7b088", hat: "peak", hatCol: NAVY, band: NAVY_D, buttons: "#cdb57c", epaul: NAVY_D, belt: "#5c3a24", shirt: "#ece7dc", tie: "#262d40" },
  agentShirt: { jacket: "#eeeae0", pants: NAVY_D, shoes: "#231c22", skin: "#f7d6b4", hair: "#1c1820", hairStyle: "wavy", thin: true, plain: true },
  agentJacket: { jacket: NAVY, pants: NAVY_D, shoes: "#231c22", skin: "#f7d6b4", hair: "#1c1820", hairStyle: "wavy", thin: true,
    buttons: "#cdb57c", epaul: NAVY_D, belt: "#5c3a24", shirt: "#ece7dc", tie: "#262d40" },
  plan1: { jacket: "#76695a", pants: "#655a4d", shoes: "#3a2a22", skin: "#f5d0ae", hair: "#5e4a3a", hairStyle: "slick", tall: true, glasses: true,
    moustache: "#4a3628", thinMou: true, suit: true, shirt: "#efe9dc", tie: "#8c2f2f" },
  plan2: { jacket: "#efe6cf", pants: "#4b4f5e", shoes: "#3a2a22", skin: "#f2c39c", stout: true, hairStyle: "bald", fringe: "#5a4636", brows: "#3b2a20",
    rolled: true, suspenders: "#8a3030", shirt: "#efe6cf" },
  captain: { sweater: "#d6cfbd", jacket: "#d6cfbd", pants: "#2f3a52", shoes: "#231c22", skin: "#e9bf98", beard: "#4a3a30", brows: "#4a3a30",
    hat: "captain", hatCol: "#f1eee6", band: "#1f2a44", hairStyle: "none" },
  crew: { sweater: "#3a4562", jacket: "#3a4562", pants: "#2a3246", shoes: "#1c1a20", skin: "#e8c09c", hat: "knit", hatCol: "#2a3348", hairStyle: "none" },
  fisher: { tank: "#f4f2ea", jacket: "#f4f2ea", pants: "#45607e", shoes: "#c98c5e", skin: "#c98c5e", hat: "straw", hatCol: "#e4c67c", brows: "#f0ece4",
    moustache: "#f0ece4", hairStyle: "none", rolledPants: true, barefoot: true, old: true },
  enemy: { jacket: OLIVE, pants: OLIVE_D, shoes: "#231c1a", skin: "#f1cba8", hairStyle: "slick", hair: "#3a2c22", hat: "peak", hatCol: OLIVE, band: "#3b3226",
    buttons: "#b9a56c", epaul: "#4a4230", belt: "#3a2a1e", collar: true, shirt: "#d9d2bf" },
  inspector: { jacket: OLIVE, pants: OLIVE_D, shoes: "#231c1a", skin: "#f3d2b2", hairStyle: "slick", hair: "#8a8478", tall: true, thin: true, monocle: true,
    buttons: "#b9a56c", epaul: "#4a4230", belt: "#3a2a1e", collar: true, shirt: "#d9d2bf", brows: "#6e685e" },
  general: { jacket: "#4f5838", pants: OLIVE_D, shoes: "#231c1a", skin: "#efc4a0", stout: true, hairStyle: "none", hat: "peak", hatCol: "#4f5838", band: "#2e2a20",
    cord: GOLD, buttons: GOLD, epaul: GOLD, fringe: true, belt: "#3a2a1e", collar: true, shirt: "#d9d2bf", brows: "#3a3530", moustache: "#9a958c", walrus: true, sideburns: "#9a958c", medals: true },
  agentCoat: { jacket: NAVY, pants: NAVY_D, shoes: "#231c22", skin: "#f7d6b4", hair: "#1c1820", hairStyle: "wavy", thin: true,
    coat: "#c7b088", buttons: "#cdb57c", epaul: NAVY_D, belt: "#5c3a24", shirt: "#ece7dc", tie: "#262d40" },
  sentry: { jacket: OLIVE, pants: OLIVE_D, shoes: "#231c1a", skin: "#f1cba8", hairStyle: "none", hat: "peak", hatCol: OLIVE, band: "#3b3226",
    buttons: "#b9a56c", epaul: "#4a4230", belt: "#3a2a1e", collar: true, shirt: "#d9d2bf", pack: true },
};
const NULLG = new Proxy(function () {}, { get: (t, k) => (k === "canvas" ? null : NULLG), apply: () => NULLG, set: () => true });
const skinHand = (p, x, y, r, skin, fist = false) => { p.dot(x, y, r + 2.4, INK); p.dot(x, y, r, skin); if (fist) p.arc(x - r * 0.25, y - r * 0.1, r * 0.45, r * 0.35, 200, 340, r * 0.16); };
const closedEyes = (p, cx, hc, u, facing = 0) => { for (const s of [-1, 1]) p.arc(cx + 7 * u * facing + s * 13 * u, hc - 1 * u, 8 * u, 5 * u, 20, 160, 3.8 * u); };
/** wavy lines that read as handwriting / typing but contain no letters */
export const scribble = (p, x0, y0, w, rows, gap, col = "#8f8a84", lw = 3, seed = 1) => {
  for (let r = 0; r < rows; r++) {
    const len = w * (r === rows - 1 ? 0.55 : 0.82 + 0.18 * rnd(seed, r)), pts = [];
    for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push([x0 + t * len, y0 + r * gap + Math.sin(t * 38 + r * 2 + seed) * gap * 0.07]); }
    p.stroke(pts, lw, col);
  }
};
export const signature = (p, x, y, s = 1, col = "#2b3a6a") => { const pts = []; for (let i = 0; i <= 50; i++) { const t = i / 50; pts.push([x + t * 90 * s, y + Math.sin(t * 16) * 12 * s * (1 - t * 0.5) - t * 10 * s]); } p.stroke(pts, 3 * s, col); p.stroke([[x - 6 * s, y + 16 * s], [x + 100 * s, y + 10 * s]], 2 * s, col); };
const hatShape = (p, kind, O, cx, top, w, u, light, thick, ow) => {
  // kind: peak | captain | straw | knit ; top = y of the crown top, w = half width at the band
  if (kind === "peakBack") {
    const cp = ellPts(cx, top + 0.34 * w, 1.22 * w, 0.36 * w, 0, 360, 0, 40), band = O.band || NAVY_D;
    const bandP = [[cx - w, top + 0.42 * w], [cx + w, top + 0.42 * w], [cx + 0.98 * w, top + 0.72 * w], [cx - 0.98 * w, top + 0.72 * w]];
    p.shadedFill(bandP, band, mul(band, [0.7, 0.7, 0.78]), light, w); p.poly(bandP, null, ow * 0.8);
    p.shadedFill(cp, O.hatCol, mul(O.hatCol, [0.72, 0.72, 0.8]), light, 1.2 * w, 0.35); p.inkRing(cp, ow, thick);
  } else if (kind === "peak" || kind === "captain") {
    const crownC = kind === "captain" ? O.hatCol : O.hatCol, band = O.band || NAVY_D;
    const cp = ellPts(cx, top + 0.34 * w, 1.22 * w, 0.36 * w, 0, 360, 0, 40);
    const bandP = [[cx - w, top + 0.42 * w], [cx + w, top + 0.42 * w], [cx + 0.98 * w, top + 0.72 * w], [cx - 0.98 * w, top + 0.72 * w]];
    p.shadedFill(bandP, band, mul(band, [0.7, 0.7, 0.78]), light, w); p.poly(bandP, null, ow * 0.8);
    p.shadedFill(cp, crownC, mul(crownC, [0.72, 0.72, 0.8]), light, 1.2 * w, 0.35); p.inkRing(cp, ow, thick);
    p.stroke(ellPts(cx - 0.3 * w, top + 0.26 * w, 0.5 * w, 0.12 * w, 200, 330, 0, 12), 3 * u, "#ffffff40");
    if (O.cord) p.band([[cx - 0.92 * w, top + 0.5 * w], [cx + 0.92 * w, top + 0.5 * w]], O.cord, 3 * u, 1 * u);
    if (kind === "captain") p.band([[cx - 0.92 * w, top + 0.48 * w], [cx + 0.92 * w, top + 0.48 * w]], GOLD, 2.4 * u, 0.8 * u);
    p.dot(cx, top + 0.57 * w, 4 * u, INK); p.dot(cx, top + 0.57 * w, 2.8 * u, O.buttons || "#b8b0a0");
    const vp = ellPts(cx, top + 0.72 * w, 0.92 * w, 0.2 * w, 0, 180, 0, 24);
    p.poly(vp, "#1d1a1e", ow * 0.6); p.stroke(ellPts(cx, top + 0.76 * w, 0.6 * w, 0.08 * w, 30, 150, 0, 12), 2 * u, "#ffffff30");
  } else if (kind === "straw") {
    const by = top + 0.62 * w;
    const brim = ellPts(cx, by, 1.75 * w, 0.32 * w, 0, 360, 0, 48);
    p.shadedFill(brim, O.hatCol, mul(O.hatCol, [0.78, 0.7, 0.62]), light, 1.7 * w, 0.3); p.inkRing(brim, ow * 0.8, thick);
    p.clip(brim, () => { for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; p.stroke([[cx + Math.cos(a) * 0.8 * w, by + Math.sin(a) * 0.15 * w], [cx + Math.cos(a) * 1.75 * w, by + Math.sin(a) * 0.32 * w]], 1.2 * u, "#b8964e"); } });
    const cr = [...ellPts(cx, top + 0.25 * w, 0.82 * w, 0.32 * w, 180, 360, 0, 20), [cx + 0.86 * w, by], [cx - 0.86 * w, by]];
    p.shadedFill(cr, O.hatCol, mul(O.hatCol, [0.78, 0.7, 0.62]), light, w, 0.3); p.inkRing(cr, ow * 0.8, thick);
    p.band([[cx - 0.85 * w, by - 0.12 * w], [cx + 0.85 * w, by - 0.12 * w]], "#6b4a2e", 0.12 * w, 1.2 * u);
  } else if (kind === "knit") {
    const kp = [...ellPts(cx, top + 0.62 * w, 1.04 * w, 0.66 * w, 180, 360, 0, 28)];
    p.shadedFill(kp, O.hatCol, mul(O.hatCol, [0.7, 0.7, 0.8]), light, w, 0.35); p.inkRing(kp, ow, thick);
    p.band([[cx - 1.04 * w, top + 0.6 * w], [cx + 1.04 * w, top + 0.6 * w]], shade(O.hatCol, 0.85), 0.2 * w, 1.6 * u);
    p.clip(kp, () => { for (let i = -6; i <= 6; i++) p.stroke([[cx + i * 0.16 * w, top + 0.05 * w], [cx + i * 0.17 * w, top + 0.55 * w]], 1.2 * u, shade(O.hatCol, 0.75)); });
  }
};

/** front-facing 1940s cartoon character. opts: expr, blink, look, facing, seed, L/R arm poses, tilt, headTilt, bob, step,
 *  pipe (in mouth), prop ('pipe'|'magnifier'|'doc'|'hat'|'net'|'whistle'|'pointer'), hatOff, case (briefcase chained to the belt), glow */
export const spyFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? SPY[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = "hang", tilt = 0, headTilt = 0,
    bob = 0, light = rad(-120), step = 0, hatOff = false, swing = 0, back = false } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, O.thin ? 106 : O.stout ? 122 : 116, facing);
  if (O.thin) H.b *= 1.07;
  const W = 2 * H.a, HH = 2 * H.b, u = 2.32;
  const torsoL = O.stout ? 1.1 : 1.06, legsL = O.tall ? 1.5 : O.stout ? 1.22 : 1.36, sole = 975;
  const torsoBot = sole - legsL * 222 - bob * 222, chin = torsoBot - torsoL * 222, hc = chin - H.b, hipY = torsoBot - 0.12 * 222;
  const thick = thickAngle(light), ow = 5 * u, cx = 300, Hh = 222;
  // layers: "all" (2D card), "body" (no head, no near-face hands), "face" (face features only, centred on (300,500) for the 3D head), "after" (hands near the face only)
  const LAY = opts.layer || "all", realG = p.g, mute = (on) => { p.g = on ? NULLG : realG; };
  if (LAY === "face") realG.translate(0, 500 - hc);
  mute(!(LAY === "all" || LAY === "body"));
  const sleeve = O.rolled ? O.shirt : O.tank ? skin : (O.sweater || O.jacket);
  p.rot = null;
  // ---- legs ----
  for (const side of [-1, 1]) {
    const ph = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)));
    const up = step ? Math.max(0, ph) * 26 : 0, fwd = step ? ph * 10 * u : 0;
    const hx = cx + side * 15 * u, fx = cx + side * 19 * u + fwd * 0.3, fy = sole - 6 * u - up;
    const knee = [(hx + fx) / 2 + side * 1.5 * u, (hipY + fy) / 2 - up * 0.4];
    p.line(curve([hx, hipY], knee, [fx, fy - 4 * u]), O.pants, 9.5 * u);
    if (O.rolledPants) p.band([[fx - 6 * u, fy - 16 * u], [fx + 6 * u, fy - 16 * u]], shade(O.pants, 1.15), 5 * u, 1.2 * u);
    if (O.barefoot) p.ell(fx + side * 4 * u, fy + 1 * u, 9 * u, 4.5 * u, skin, 2 * u);
    else { p.ell(fx + side * 4 * u, fy, 11 * u, 6 * u, O.shoes, 2.2 * u); p.ell(fx + side * 1 * u, fy - 2.5 * u, 4 * u, 1.6 * u, "#ffffff35", 0); }
  }
  // ---- torso frame ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * 232) / 1.06 * (O.stout ? 1.22 : O.thin ? 0.92 : 1), b: 0.5 * (torsoBot - (chin - 0.22 * Hh)), nTop: 2.3, nBot: 2.4, egg: O.stout ? 0.2 : 0.1, asym: 0.03 * facing, rot: 0, noise: 0.005, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.86 * T.a, chin + 0.13 * Hh];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.05 + k * u);
    const sw = swing * side;
    switch (pose) {
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * Hh], [X(62), s[1] - 0.1 * Hh]], finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * Hh], [X(20), s[1] - 0.72 * Hh]] };
      case "fist": return { pts: [s, [X(20), s[1] - 0.22 * Hh], [X(10), s[1] - 0.66 * Hh]], fist: true };
      case "slam": return { pts: [s, [X(24), s[1] + 0.12 * Hh], [X(30), s[1] + 0.4 * Hh]], fist: true, front: true };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * Hh], [tcx + side * T.a * 0.95, torsoBot - 0.3 * Hh]] };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * Hh], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * Hh]], front: true };
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * Hh], [tcx - side * 0.45 * T.a, s[1] + 0.32 * Hh]], front: true };
      case "rub": return { pts: [s, [X(6), s[1] + 0.4 * Hh], [tcx + side * 9 * u, chin + 0.5 * Hh]], front: true };
      case "hold": return { pts: [s, [X(16), s[1] + 0.4 * Hh], [X(18), s[1] + 0.18 * Hh]], front: true, holder: true };
      case "give": return { pts: [s, [X(26), s[1] + 0.2 * Hh], [X(54), s[1] + 0.02 * Hh]], holder: true };
      case "reach": { const lf = (opts.lift || 0) * 0.5 * Hh; return { pts: [s, [X(36), s[1] - 0.05 * Hh - lf * 0.6], [X(66), s[1] + 0.12 * Hh - lf]], holder: true }; }
      case "push": return { pts: [s, [X(30), s[1] + 0.1 * Hh], [X(58), s[1] + 0.34 * Hh]], holder: true };
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * Hh], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], after: true };
      case "shh": return { pts: [s, [X(8), s[1] + 0.32 * Hh], [cx + side * 3 * u + 8 * u * facing, hc + 26 * u]], after: true, finger: "up" };
      case "mouth": return { pts: [s, [X(8), s[1] + 0.32 * Hh], [cx + side * 6 * u + 8 * u * facing, hc + 24 * u]], after: true, holder: true };
      case "chin": return { pts: [s, [X(10), s[1] + 0.34 * Hh], [cx + side * 18 * u, hc + 44 * u]], after: true, holder: true };
      case "lens": return { pts: [s, [X(14), s[1] + 0.26 * Hh], [cx + side * 30 * u, hc + 46 * u]], after: true, holder: true };
      case "scratch": return { pts: [s, [X(24), s[1] - 0.12 * Hh], [cx + side * 0.62 * H.a, hc - 0.82 * H.b]], after: true };
      case "hatoff": return { pts: [s, [X(18), s[1] - 0.18 * Hh], [X(10), hc - 0.5 * Hh]], holder: true, after: true };
      case "net": return { pts: [s, [X(4), s[1] + 0.36 * Hh], [tcx + side * 30 * u, torsoBot + 0.02 * Hh]], front: true, holder: true };
      case "swing": return { pts: [s, [X(4) + sw * 18 * u, s[1] + 0.46 * Hh], [X(2) + sw * 34 * u, chin + 0.98 * Hh]] };
      default: return { pts: [s, [X(4), s[1] + 0.48 * Hh], [X(3), chin + 1.02 * Hh]] };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const handR = 6.2 * u;
  const drawArm = (a, side) => {
    const c = curve(a.pts[0], a.pts[1], a.pts[2]);
    if (O.rolled || O.tank) { // sleeve to the elbow, skin forearm
      const half = c.slice(0, 6), rest = c.slice(5);
      p.line(rest, skin, 6.4 * u); p.line(half, O.shirt || O.tank, 8.5 * u);
      if (O.rolled) p.band([half[half.length - 1], [half[half.length - 1][0] + 0.1, half[half.length - 1][1] + 0.1]], shade(O.shirt, 0.9), 9.5 * u, 1.2 * u, "round");
    } else p.line(c, sleeve, 7.6 * u);
    const [hx, hy] = a.pts[2];
    if (a.finger === "up") { p.line([[hx, hy], [hx, hy - 16 * u]], skin, 3 * u); }
    else if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.line([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], skin, 3 * u); }
    skinHand(p, hx, hy, a.fist ? handR * 1.25 : handR, skin, a.fist);
  };
  const propAt = (a, side) => {
    if (!a.holder || !opts.prop) return;
    const [hx, hy] = a.pts[2], pr = opts.prop;
    if (pr === "doc") { // folder of papers (no letters)
      const w = 46 * u, h = 58 * u, x0 = hx - w / 2 + side * 10 * u, y0 = hy - h * 0.7;
      p.poly([[x0, y0], [x0 + w, y0 + 3 * u], [x0 + w, y0 + h], [x0, y0 + h - 2 * u]], "#efe7d2", 2.4 * u);
      scribble(p, x0 + 6 * u, y0 + 10 * u, w - 12 * u, 5, 8 * u, "#9a948a", 2, seed);
      p.ell(x0 + w - 12 * u, y0 + h - 12 * u, 7 * u, 7 * u, "#b8352e", 1.5 * u);
      skinHand(p, hx, hy, handR, skin);
    } else if (pr === "bank") {
      p.g.save(); p.g.translate(hx + side * 10 * u, hy - 40 * u); p.g.scale(0.32, 0.32); p.g.translate(-300, -500); propBank(p); p.g.restore();
      skinHand(p, hx, hy, handR, skin);
    } else if (pr === "pointer") {
      p.band([[hx, hy], [hx + side * 90 * u, hy + 70 * u]], "#8a5a34", 3 * u, 1 * u, "round");
      skinHand(p, hx, hy, handR, skin);
    } else if (pr === "net") {
      const [ox, oy] = arms[side > 0 ? 0 : 1].pts[2];
      if (side > 0) { // draw once, between both hands
        const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([ox + (hx - ox) * t, oy + (hy - oy) * t + Math.sin(t * Math.PI) * 60 * u]); }
        const g = p.g; g.save(); g.globalAlpha = 0.9;
        for (let k = 0; k < 7; k++) p.stroke(pts.map(([x, y], i) => [x, y + k * 9 * u - Math.sin(i / 10 * Math.PI) * k * 4 * u]), 1.5 * u, "#d8cfb6");
        for (let i = 0; i <= 10; i++) p.stroke([pts[i], [pts[i][0], pts[i][1] + 54 * u - Math.sin(i / 10 * Math.PI) * 24 * u]], 1.5 * u, "#d8cfb6");
        g.restore(); for (const [x, y] of [[ox, oy], [hx, hy]]) skinHand(p, x, y, handR, skin);
        for (let i = 1; i < 10; i += 2) p.ell(pts[i][0], pts[i][1] + 2 * u, 3.4 * u, 3 * u, "#e0a040", 1.2 * u); // floats
      }
    }
  };
  for (const [i, a] of arms.entries()) if (!a.front && !a.after) { drawArm(a, i ? 1 : -1); }
  // torso / clothing
  if (O.pack && !back) { const bp = rrect(tcx - 0.9 * T.a, chin + 0.12 * Hh, tcx + 0.9 * T.a, torsoBot - 0.1 * Hh, 10 * u); p.poly(bp, "#6a5a3c", ow * 0.8); }
  p.gradFill(tp, O.jacket, mul(O.jacket, SH_CLOTH), light);
  p.clip(tp, () => {
    const top = chin - 0.1 * Hh;
    if (back) { p.stroke([[tcx, chin], [tcx, torsoBot]], 1.6 * u, mul(O.jacket, [0.6, 0.6, 0.65])); if (O.belt) p.band([[tcx - 1.2 * T.a, torsoBot - 0.2 * Hh], [tcx + 1.2 * T.a, torsoBot - 0.2 * Hh]], O.belt, 0.075 * Hh, 1.3 * u); }
    else if (O.tank) { p.ell(tcx, chin + 0.02 * Hh, 0.42 * T.a, 0.16 * Hh, skin, 0); p.stroke(ellPts(tcx, chin + 0.02 * Hh, 0.42 * T.a, 0.16 * Hh, 0, 180, 0, 16), 2 * u); }
    else if (O.sweater) { for (let i = -6; i <= 6; i++) p.stroke([[tcx + i * 0.16 * T.a, chin + 0.1 * Hh], [tcx + i * 0.17 * T.a, torsoBot]], 1.2 * u, shade(O.sweater, 0.82)); p.band([[tcx - T.a, torsoBot - 0.08 * Hh], [tcx + T.a, torsoBot - 0.08 * Hh]], shade(O.sweater, 0.9), 0.1 * Hh, 1.2 * u); }
    else if (O.rolled) {
      p.stroke([[tcx, chin], [tcx, torsoBot]], 1.6 * u, shade(O.shirt, 0.75));
      for (let i = 0; i < 4; i++) p.dot(tcx + 3 * u, chin + (0.12 + i * 0.16) * Hh, 1.8 * u, "#bdb39b");
      for (const s of [-1, 1]) p.band([[tcx + s * 0.55 * T.a, chin - 0.1 * Hh], [tcx + s * 0.45 * T.a, torsoBot]], O.suspenders, 3.6 * u, 1 * u);
      p.band([[tcx - 1.2 * T.a, torsoBot - 0.1 * Hh], [tcx + 1.2 * T.a, torsoBot - 0.1 * Hh]], O.pants, 0.12 * Hh, 1.2 * u);
    } else if (O.plain) { p.stroke([[tcx, chin + 0.05 * Hh], [tcx, torsoBot]], 1.4 * u, "#c9c3b5"); }
    else { // jacket / suit / uniform
      const vY = chin + (O.suit ? 0.42 : O.collar ? 0.18 : 0.3) * Hh;
      p.poly([[tcx - 0.36 * T.a, top], [tcx + 0.36 * T.a, top], [tcx, vY]], O.shirt || "#e8e2d6", 0);
      if (O.tie) p.poly([[tcx - 4 * u, chin + 0.02 * Hh], [tcx + 4 * u, chin + 0.02 * Hh], [tcx + 6 * u, vY - 4 * u], [tcx, vY + 4 * u], [tcx - 6 * u, vY - 4 * u]], O.tie, 1.4 * u);
      for (const s of [-1, 1]) p.stroke([[tcx + s * 0.4 * T.a, top], [tcx, vY], [tcx, torsoBot]], 2 * u, mul(O.jacket, [0.6, 0.6, 0.65]));
      if (!O.suit) {
        for (let i = 0; i < 4; i++) { const y = vY + 8 * u + i * (torsoBot - vY - 30 * u) / 3.4; p.dot(tcx + 3 * u, y, 3.2 * u, INK); p.dot(tcx + 3 * u, y, 2.3 * u, O.buttons || "#b8b0a0"); }
        for (const s of [-1, 1]) { const px = tcx + s * 0.5 * T.a, py = chin + 0.3 * Hh; p.poly(rrect(px - 13 * u, py, px + 13 * u, py + 9 * u, 2 * u), shade(O.jacket, 0.88), 1.4 * u); p.dot(px, py + 5 * u, 1.8 * u, O.buttons || "#b8b0a0"); }
        if (O.belt) { p.band([[tcx - 1.2 * T.a, torsoBot - 0.2 * Hh], [tcx + 1.2 * T.a, torsoBot - 0.2 * Hh]], O.belt, 0.075 * Hh, 1.3 * u); p.poly(rrect(tcx - 7 * u, torsoBot - 0.24 * Hh, tcx + 7 * u, torsoBot - 0.16 * Hh, 1.5 * u), "#b9a56c", 1.4 * u); }
      } else { p.dot(tcx + 3 * u, torsoBot - 0.3 * Hh, 2.6 * u, "#3a2a22"); p.poly(rrect(tcx + 0.38 * T.a, chin + 0.3 * Hh, tcx + 0.7 * T.a, chin + 0.36 * Hh, 1 * u), "#efe9dc", 1 * u); }
      if (O.medals) {
        const mx = tcx - 0.52 * T.a, my = chin + 0.3 * Hh, cols = [["#8c2f2f", "#e0c060"], ["#2f5f8c", "#d9d2bf"], ["#5d7a3a", "#c06030"]];
        cols.forEach(([a, b], i) => { const y = my + i * 7 * u; p.poly(rrect(mx - 14 * u, y, mx + 14 * u, y + 6 * u, 1 * u), a, 1.2 * u); p.stroke([[mx - 4 * u, y + 1 * u], [mx - 4 * u, y + 5 * u]], 2 * u, b); p.stroke([[mx + 5 * u, y + 1 * u], [mx + 5 * u, y + 5 * u]], 2 * u, b); });
        for (const [dx, c] of [[-8, "#e8c45a"], [8, "#cfd3d8"]]) { p.stroke([[mx + dx * u, my + 22 * u], [mx + dx * u, my + 30 * u]], 3 * u, "#8c2f2f"); p.ell(mx + dx * u, my + 35 * u, 5.5 * u, 5.5 * u, c, 1.4 * u); p.ell(mx + dx * u, my + 35 * u, 2.6 * u, 2.6 * u, shade(c, 0.8), 0); }
      }
    }
  });
  p.inkRing(tp, ow, thick);
  if (O.pack && back) { const bp = rrect(tcx - 0.78 * T.a, chin + 0.1 * Hh, tcx + 0.78 * T.a, torsoBot - 0.25 * Hh, 12 * u); p.gradFill(bp, "#6a5a3c", "#4a3e28", light); p.inkRing(bp, ow * 0.8, thick); p.poly(rrect(tcx - 0.6 * T.a, chin + 0.1 * Hh, tcx + 0.6 * T.a, chin + 0.3 * Hh, 8 * u), "#5a4c32", 2 * u); p.ell(tcx, chin + 0.03 * Hh, 0.7 * T.a, 0.07 * Hh, "#7a6a48", 2 * u); }
  if (O.epaul && !O.coat) for (const s of [-1, 1]) {
    const ex = tcx + s * 0.7 * T.a, ey = chin + 0.09 * Hh;
    p.poly(rrect(ex - 16 * u, ey - 4 * u, ex + 16 * u, ey + 5 * u, 3 * u), O.epaul, 1.6 * u);
    if (O.fringe) for (let i = -3; i <= 3; i++) p.stroke([[ex + s * 13 * u + i * 0.6 * u, ey + 4 * u], [ex + s * 16 * u + i * 1.2 * u, ey + 13 * u]], 1.8 * u, O.epaul);
    p.dot(ex - s * 10 * u, ey, 2 * u, O.buttons || "#b8b0a0");
  }
  if (O.collar && !O.coat) for (const s of [-1, 1]) p.poly([[tcx + s * 2 * u, chin - 0.02 * Hh], [tcx + s * 0.42 * T.a, chin - 0.06 * Hh], [tcx + s * 0.3 * T.a, chin + 0.1 * Hh]], shade(O.jacket, 0.82), 1.6 * u);
  if (O.sweater) { const nk = rrect(tcx - 0.42 * T.a, chin - 0.1 * Hh, tcx + 0.42 * T.a, chin + 0.08 * Hh, 8 * u); p.poly(nk, shade(O.sweater, 0.93), ow * 0.6); for (let i = -4; i <= 4; i++) p.stroke([[tcx + i * 0.09 * T.a, chin - 0.08 * Hh], [tcx + i * 0.09 * T.a, chin + 0.06 * Hh]], 1.1 * u, shade(O.sweater, 0.78)); }
  // trench coat over the uniform
  if (O.coat) {
    const hem = sole - 0.66 * Hh, sh = chin + 0.04 * Hh;
    const cp = [[tcx - 0.5 * W * 0.86, sh], [tcx + 0.5 * W * 0.86, sh], [tcx + 0.52 * W, torsoBot - 0.2 * Hh], [tcx + 0.62 * W, hem], [tcx + 0.05 * W, hem + 6 * u], [tcx - 0.62 * W, hem], [tcx - 0.52 * W, torsoBot - 0.2 * Hh]];
    p.gradFill(cp, O.coat, mul(O.coat, [0.68, 0.64, 0.66]), light);
    p.clip(cp, () => {
      p.poly([[tcx - 0.22 * W, sh - 4 * u], [tcx + 0.22 * W, sh - 4 * u], [tcx, chin + 0.36 * Hh]], O.jacket, 1.6 * u);
      p.poly([[tcx - 0.08 * W, sh - 4 * u], [tcx + 0.08 * W, sh - 4 * u], [tcx, chin + 0.2 * Hh]], O.shirt, 0);
      p.poly([[tcx - 3 * u, chin], [tcx + 3 * u, chin], [tcx + 4 * u, chin + 0.2 * Hh], [tcx - 4 * u, chin + 0.2 * Hh]], O.tie, 0);
      for (const s of [-1, 1]) p.poly([[tcx + s * 0.08 * W, sh - 6 * u], [tcx + s * 0.38 * W, sh - 2 * u], [tcx + s * 0.2 * W, chin + 0.3 * Hh], [tcx + s * 0.03 * W, chin + 0.38 * Hh]], shade(O.coat, 0.88), 2 * u);
      p.stroke([[tcx + 0.04 * W, chin + 0.38 * Hh], [tcx + 0.06 * W, hem + 6 * u]], 2 * u, mul(O.coat, [0.6, 0.56, 0.58]));
      for (let i = 0; i < 3; i++) for (const s of [-1, 1]) p.dot(tcx + s * 0.14 * W, chin + (0.46 + i * 0.16) * Hh, 3 * u, "#5e4a34");
      p.band([[tcx - 0.7 * W, torsoBot - 0.2 * Hh], [tcx + 0.7 * W, torsoBot - 0.2 * Hh]], shade(O.coat, 0.85), 0.07 * Hh, 1.4 * u);
      p.poly(rrect(tcx - 8 * u, torsoBot - 0.24 * Hh, tcx + 8 * u, torsoBot - 0.16 * Hh, 2 * u), "#6a5236", 1.4 * u);
      for (const s of [-1, 1]) p.stroke([[tcx + s * 0.3 * W, torsoBot - 0.05 * Hh], [tcx + s * 0.42 * W, hem - 4 * u]], 1.6 * u, mul(O.coat, [0.7, 0.66, 0.66]));
    });
    p.inkRing(cp, ow, thick);
    for (const s of [-1, 1]) p.poly(rrect(tcx + s * 0.38 * W - 13 * u, sh - 4 * u, tcx + s * 0.38 * W + 13 * u, sh + 5 * u, 3 * u), shade(O.coat, 0.9), 1.4 * u);
  }
  // chained briefcase at the right hip
  if (opts.case) {
    const bx = tcx + 0.62 * W, by = torsoBot + 0.2 * Hh, bw = 48 * u, bh = 36 * u;
    const lk = []; for (let i = 0; i <= 8; i++) { const t = i / 8; lk.push([tcx + 0.12 * W + (bx - tcx - 0.12 * W) * t, torsoBot - 0.2 * Hh + (by - bh / 2 - 6 * u - torsoBot + 0.2 * Hh) * t + Math.sin(t * Math.PI) * 12 * u]); }
    lk.forEach(([x, y], i) => p.ell(x, y, 3.6 * u, 2.4 * u, null, 1.6 * u, 0, 360, i % 2 ? 60 : -30));
    p.arc(bx, by - bh / 2, 9 * u, 7 * u, 180, 360, 3.4 * u, "#3a2416");
    const bp = rrect(bx - bw / 2, by - bh / 2, bx + bw / 2, by + bh / 2, 5 * u);
    p.gradFill(bp, "#8a5530", "#5a341c", light); p.inkRing(bp, ow * 0.7, thick);
    p.stroke([[bx - bw / 2 + 3 * u, by - bh / 2 + 9 * u], [bx + bw / 2 - 3 * u, by - bh / 2 + 9 * u]], 1.6 * u, "#4a2a16");
    for (const s of [-1, 1]) p.poly(rrect(bx + s * 13 * u - 4 * u, by - bh / 2 + 5 * u, bx + s * 13 * u + 4 * u, by - bh / 2 + 13 * u, 1 * u), "#d9b55a", 1.2 * u);
  }
  for (const [i, a] of arms.entries()) if (a.front && !a.after) { drawArm(a, i ? 1 : -1); propAt(a, i ? 1 : -1); }
  for (const [i, a] of arms.entries()) if (!a.front && !a.after) propAt(a, i ? 1 : -1);
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah && LAY !== "face" ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  // neck
  p.line([[cx, chin - 10 * u], [cx, chin + 6 * u]], skin, 14 * u);
  mute(LAY !== "all");
  const hp = blobPts(cx, hc, H);
  const hatKind = hatOff ? null : O.hat;
  if (O.hair && O.hairStyle === "wavy" && !hatKind) { const hb = blobPts(cx, hc - 0.04 * HH, { ...H, a: H.a * 1.06, b: H.b * 1.06 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  // ears
  for (const s of [-1, 1]) { const ex = cx + s * (H.a - 2 * u), ey = hc + 6 * u; p.ell(ex + s * 6 * u, ey, 8 * u, 12 * u, skin, 2.6 * u); p.arc(ex + s * 6 * u, ey, 3.5 * u, 6 * u, s > 0 ? -60 : 120, s > 0 ? 60 : 240, 1.8 * u); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a); p.inkRing(hp, ow, thick);
  if (O.hairStyle === "wavy" || O.hairStyle === "slick") {
    if (!hatKind) {
      hatOn(p, { hat: "hair", hair: O.hair, jacket: O.jacket }, hp, H, cx, hc, light, seed, facing, false);
      const top = hc - H.b;
      if (O.hairStyle === "wavy") { for (let i = 0; i < 3; i++) p.arc(cx - 34 * u + i * 30 * u, top + 16 * u, 13 * u, 8 * u, 200, 340, 2.2 * u, "#3a3440"); p.arc(cx + 22 * u, top + 52 * u, 10 * u, 12 * u, 250, 420, 3 * u, O.hair); }
      else p.stroke(ellPts(cx - 18 * u, top + 26 * u, 0.4 * H.a, 0.12 * H.b, 200, 320, 0, 12), 3 * u, "#ffffff40");
    } else for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a, hc - 0.18 * H.b, 0.16 * H.a, 0.3 * H.b, O.hair, 2 * u);
  }
  if (O.hairStyle === "bald") {
    p.stroke(ellPts(cx - 24 * u, hc - 0.62 * H.b, 0.28 * H.a, 0.14 * H.b, 200, 300, 0, 12), 5 * u, "#ffffff70");
    for (const s of [-1, 1]) p.ell(cx + s * 0.93 * H.a, hc - 0.05 * H.b, 0.14 * H.a, 0.28 * H.b, O.fringe, 2 * u);
  }
  mute(!(LAY === "all" || LAY === "face"));
  if (O.beard) {
    const bd = blobPts(cx + 6 * u * facing, hc + 0.72 * H.b, { a: 0.8 * H.a, b: 0.6 * H.b, nTop: 2.6, nBot: 1.7, egg: -0.3, asym: 0, rot: 0, noise: 0.02, seed: seed + 4 });
    p.shadedFill(bd, O.beard, mul(O.beard, [0.8, 0.8, 0.86]), light, 0.7 * H.a, 0.3);
    p.clip(bd, () => { for (let i = -4; i <= 4; i++) p.stroke([[cx + i * 10 * u, hc + 0.3 * H.b], [cx + i * 8 * u, hc + 1.4 * H.b]], 1.2 * u, shade(O.beard, 0.75)); });
    p.inkRing(bd, ow * 0.8, thick);
    p.ell(cx + 8 * u * facing, hc + 0.36 * H.b, 0.42 * H.a, 0.14 * H.b, skin, 0);
  }
  if (back) { /* back of the head: no face */ p.stroke(ellPts(cx, hc + 0.75 * H.b, 0.3 * H.a, 0.1 * H.b, 20, 160, 0, 10), 2 * u, mul(skin, [0.8, 0.7, 0.65])); }
  else if (expr === "sleep") { // peaceful closed eyes, soft brows, small smile (drawn here: the base face has no "closed" eye)
    const uu = W / 100; closedEyes(p, cx, hc, uu, facing);
    for (const s of [-1, 1]) taper(p, [cx + 7 * uu * facing + s * 5 * uu, hc - 19 * uu], [cx + 7 * uu * facing + s * 21 * uu, hc - 17 * uu], 4.6 * uu, 2.4 * uu);
    mouth(p, "smile", cx + 8 * uu * facing, hc + 20 * uu, uu, 0.8);
    if (O.moustache) for (const s of [-1, 1]) taper(p, [cx + s * 1.5 * uu, hc + 12.5 * uu], [cx + s * 15 * uu, hc + 15 * uu], 4.5 * uu, 1.6 * uu, O.moustache);
  } else if (!back) faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, O.thinMou || O.walrus ? null : O.moustache, !!O.stout);
  if (!back && O.walrus) { const uu = W / 100, mx = cx + 8 * uu * facing;
    const wp = [[mx, hc + 9 * uu], [mx + 16 * uu, hc + 8 * uu], [mx + 30 * uu, hc + 22 * uu], [mx + 22 * uu, hc + 26 * uu], [mx + 10 * uu, hc + 18 * uu], [mx, hc + 20 * uu], [mx - 10 * uu, hc + 18 * uu], [mx - 22 * uu, hc + 26 * uu], [mx - 30 * uu, hc + 22 * uu], [mx - 16 * uu, hc + 8 * uu]];
    p.poly(wp, O.moustache, 2.6 * uu); if (LAY !== "face") for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a, hc - 0.05 * H.b, 0.12 * H.a, 0.3 * H.b, O.sideburns, 2 * u); }
  if (!back && O.thinMou) for (const s of [-1, 1]) taper(p, [cx + 8 * W / 100 * facing + s * 1.5 * u, hc + 13 * u], [cx + 8 * W / 100 * facing + s * 13 * u, hc + 14.5 * u], 2.8 * u, 1 * u, O.moustache);
  if (!back && O.brows) { const F = FACE[expr] || FACE.neutral, [dI, dO] = F.brow, uu = W / 100;
    for (const s of [-1, 1]) taper(p, [cx + 7 * uu * facing + s * 4 * uu, hc - 21 * uu + dI * uu * 1.3], [cx + 7 * uu * facing + s * 24 * uu, hc - 21 * uu + dO * uu * 1.3], 9 * uu, 6 * uu, O.brows); }
  if (!back && O.glasses) { const uu = W / 100; for (const s of [-1, 1]) p.ell(cx + 7 * uu * facing + s * 13 * uu, hc, 11 * uu, 10 * uu, "#ffffff22", 2.6 * uu); p.stroke([[cx + 7 * uu * facing - 3 * uu, hc - 2 * uu], [cx + 7 * uu * facing + 3 * uu, hc - 2 * uu]], 2.4 * uu); }
  if (!back && O.monocle && !opts.prop?.startsWith?.("magn")) { const uu = W / 100, mx = cx + 7 * uu * facing + 13 * uu; p.ell(mx, hc, 12 * uu, 12 * uu, "#ffffff30", 2.6 * uu); p.stroke(curve([mx + 10 * uu, hc + 6 * uu], [mx + 18 * uu, hc + 40 * uu], [mx + 6 * uu, hc + 80 * uu]), 1.2 * uu, "#d9b55a"); }
  if (O.old) for (const s of [-1, 1]) p.stroke([[cx + s * 30 * u, hc + 16 * u], [cx + s * 26 * u, hc + 22 * u]], 1.4 * u, mul(skin, [0.7, 0.6, 0.55]));
  if (opts.pipe) { // pipe in the mouth corner
    const mx = cx + 8 * W / 100 * facing + 8 * u, my = hc + 21 * u;
    p.band([[mx, my], [mx + 26 * u, my + 10 * u]], "#3a2618", 3.4 * u, 1 * u, "round");
    const bw = rrect(mx + 22 * u, my - 4 * u, mx + 38 * u, my + 18 * u, 5 * u); p.poly(bw, "#6a3e22", 2 * u); p.ell(mx + 30 * u, my - 3 * u, 7 * u, 2.4 * u, "#2a1a12", 1 * u);
  }
  mute(LAY !== "all");
  if (hatKind) hatShape(p, back && hatKind === "peak" ? "peakBack" : hatKind, O, cx + 4 * u * facing, hc - H.b - 0.16 * HH, H.a * 0.98, u, light, thick, ow);
  p.rot = null;
  mute(!(LAY === "all" || LAY === "after"));
  // after-head arms (hands near the face)
  for (const [i, a] of arms.entries()) if (a.after) {
    const side = i ? 1 : -1; drawArm(a, side);
    const [hx, hy] = a.pts[2], pr = opts.prop;
    if (a.holder && pr === "pipe") { p.band([[hx - 4 * u, hy - 10 * u], [hx - side * 18 * u, hy - 24 * u]], "#3a2618", 3.4 * u, 1 * u, "round"); p.poly(rrect(hx - 6 * u, hy - 12 * u, hx + 10 * u, hy + 8 * u, 5 * u), "#6a3e22", 2 * u); skinHand(p, hx, hy, handR, skin); }
    if (a.holder && pr === "whistle") { p.poly(rrect(hx - side * 22 * u, hy - 6 * u, hx + side * 2 * u, hy + 4 * u, 3 * u), "#c9cdd2", 1.6 * u); skinHand(p, hx, hy, handR, skin); }
    if (a.holder && pr === "magnifier") {
      const ex = cx + 7 * W / 100 * facing + side * 13 * W / 100, ey = hc, r = 27 * u;
      p.band([[hx, hy], [ex + side * r * 0.5, ey + r * 0.85]], "#4a2e1c", 6 * u, 1.4 * u, "round");
      p.ell(ex, ey, r, r, "#e8f2f6", 0);
      p.ell(ex, ey, 17 * u, 15 * u, "#ffffff", 2.6 * u); p.dot(ex + look * 4 * u, ey + 2 * u, 7 * u); p.dot(ex + look * 4 * u - 2.4 * u, ey - 1 * u, 2.2 * u, "#ffffff");
      const bdi = (FACE[expr] || FACE.neutral).brow[0]; p.arc(ex, ey - 22 * u + bdi * 0.8 * u, 15 * u, 6 * u, 200, 340, 4.4 * u);
      p.ell(ex, ey, r, r, null, 5 * u); p.ell(ex, ey, r - 3 * u, r - 3 * u, null, 2 * u); p.stroke(ellPts(ex - 8 * u, ey - 8 * u, 12 * u, 10 * u, 200, 260, 0, 8), 3 * u, "#ffffffcc");
      skinHand(p, hx, hy, handR, skin);
    }
    if (a.holder && pr === "hat") { hatShape(p, O.hat, O, hx, hy - 0.2 * HH, H.a * 0.85, u, light, thick, ow); skinHand(p, hx, hy, handR, skin); }
    if (a.holder && pr === "doc") propAt(a, side);
  }
  p.g = realG;
};
/** does this pose draw anything in front of the face? (then the 3D-head actor also needs an "after" overlay card) */
const AFTER = ["cheek", "shh", "mouth", "chin", "lens", "scratch", "hatoff"];
export const hasAfter = (opts) => AFTER.includes(opts.L) || AFTER.includes(opts.R);
/** data for a real 3D head on a spyFront card (main.js draws it): face texture + placement in design px */
export const spyHead3d = (key, opts = {}, h = {}) => {
  const O = typeof key === "string" ? SPY[key] : key;
  const { seed = 3, tilt = 0, headTilt = 0, bob = 0, facing = 0, hatOff = false } = opts;
  const H = headBlob(seed, O.thin ? 106 : O.stout ? 122 : 116, facing); if (O.thin) H.b *= 1.07;
  const legsL = O.tall ? 1.5 : O.stout ? 1.22 : 1.36, torsoL = O.stout ? 1.1 : 1.06;
  const torsoBot = 975 - legsL * 222 - bob * 222, chin = torsoBot - torsoL * 222, hipY = torsoBot - 0.12 * 222;
  const [cpx, cpy] = rotAbout([300, chin], rad(tilt), [300, hipY]), ang = rad(tilt + headTilt);
  const hat = hatOff ? null : O.hat || null;
  return {
    key: "s3" + key + JSON.stringify(opts),
    draw: (p) => spyFront(p, key, { ...opts, layer: "face", tilt: 0, headTilt: 0 }),
    a: H.a, b: H.b, x: cpx + H.b * Math.sin(ang) - 300, y: cpy - H.b * Math.cos(ang), roll: ang,
    skin: O.skin ?? SKIN, hair: !hat && (O.hairStyle === "wavy" || O.hairStyle === "slick") ? O.hair : null, wavy: O.hairStyle === "wavy",
    hat, hatCol: O.hatCol, band: O.band || NAVY_D, cord: O.cord || null, button: O.buttons || "#b8b0a0", ...h,
  };
};
/** lying figure as seen from above: same drawing, eyes closed, used on flat cards */
export const sleeper = (p, key, opts = {}) => spyFront(p, key, { expr: "sleep", blink: 0, seed: 5, ...opts });

// ---------------- props for flat cards (NO letters / numbers anywhere: grey wavy lines, seals, scribbles) ----------------
const heart = (p, x, y, r, fill, ol = 2) => { const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40 * Math.PI * 2; pts.push([x + r * 16 * Math.sin(t) ** 3 / 16, y - r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16]); } p.poly(pts, fill, ol); };
const kiss = (p, x, y, s, col = "#c8283a") => {
  const up = [], lo = []; for (let i = 0; i <= 20; i++) { const t = i / 20; up.push([x + (t - 0.5) * 70 * s, y - Math.abs(Math.sin(t * Math.PI * 2)) * 10 * s - Math.sin(t * Math.PI) * 6 * s]); lo.push([x + (0.5 - t) * 70 * s, y + Math.sin(t * Math.PI) * 18 * s]); }
  const g = p.g; g.save(); g.globalAlpha = 0.85; p.poly([...up, ...lo], col, 0); p.stroke([[x - 30 * s, y + 2 * s], [x + 30 * s, y + 2 * s]], 2 * s, "#8a1a28"); g.restore();
};
const seal = (p, x, y, r, col = "#b8302c") => {
  const pts = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, rr = r * (1 + 0.08 * Math.sin(i * 2.7)); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  p.poly(pts, col, 2.5); p.ell(x, y, r * 0.66, r * 0.66, shade(col, 0.82), 2);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; p.stroke([[x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3], [x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55]], 2, shade(col, 0.6)); }
};
const paper = (p, x0, y0, x1, y1, col = "#f3eee2", rot = 0) => { const pts = [[x0, y0], [x1, y0 + 4], [x1 - 3, y1], [x0 + 2, y1 - 3]]; p.poly(rot ? rotPts(pts, rot, (x0 + x1) / 2, (y0 + y1) / 2) : pts, col, 4); };
/** love letters: pink envelopes with heart wax seals, an open letter with grey handwriting lines and a lipstick kiss */
export const propLetters = (p) => {
  p.g.save(); p.g.translate(300, 500); p.g.rotate(-0.12); p.g.translate(-300, -500);
  paper(p, 90, 300, 470, 620, "#f2c6cf"); p.stroke([[92, 302], [280, 470], [468, 304]], 4, "#c98c9a"); heart(p, 280, 470, 2.6, "#c0283a", 3);
  p.g.restore(); p.g.save(); p.g.translate(320, 560); p.g.rotate(0.1); p.g.translate(-320, -560);
  paper(p, 150, 380, 520, 760, "#fbf4ea"); scribble(p, 180, 420, 300, 8, 30, "#8a7f8e", 3.4, 4); signature(p, 330, 690, 1, "#7a3a5a");
  kiss(p, 230, 700, 0.9);
  p.g.restore(); p.g.save(); p.g.translate(240, 800); p.g.rotate(0.22); p.g.translate(-240, -800);
  paper(p, 70, 700, 380, 930, "#ecb3c0"); p.stroke([[72, 702], [225, 830], [378, 704]], 4, "#c98c9a"); heart(p, 225, 830, 2.2, "#c0283a", 3);
  p.g.restore();
};
/** two theatre ticket stubs: patterned borders, perforation, torn edge, little masks-free ornament (diamonds) */
export const propTickets = (p) => {
  const stub = (x, y, rot, col, band) => {
    p.g.save(); p.g.translate(x, y); p.g.rotate(rot);
    const pts = [[-170, -80], [130, -80]]; for (let i = 0; i <= 12; i++) pts.push([130 + (i % 2 ? 9 : 0), -80 + i * 160 / 12]); pts.push([-170, 80]);
    p.poly(pts, col, 4);
    p.poly(rrect(-150, -62, 100, 62, 8), null, 0); p.stroke(rrect(-152, -62, 102, 62, 8), 3, band);
    for (let i = 0; i < 12; i++) p.dot(-140 + i * 21.5, -50, 3.4, band), p.dot(-140 + i * 21.5, 50, 3.4, band);
    for (let i = -1; i <= 1; i++) p.poly([[-25 + i * 52, -22], [-5 + i * 52, 0], [-25 + i * 52, 22], [-45 + i * 52, 0]], band, 2);
    for (let i = 0; i < 9; i++) p.dot(115, -64 + i * 16, 3, "#00000050");
    p.g.restore();
  };
  stub(290, 420, -0.18, "#f1d27a", "#a8402e"); stub(320, 610, 0.12, "#e9b25f", "#7a2e44");
};
/** velvet-box receipt: small slip with grey lines, a round stamp and a signature */
export const propReceipt = (p) => {
  const pts = [[150, 260], [450, 266]]; for (let i = 0; i <= 14; i++) pts.push([450 - i * 300 / 14, 740 + (i % 2 ? 12 : 0)]);
  p.poly([[150, 260], [450, 266], [446, 744], [150, 740]], "#f6f3ea", 4);
  p.stroke([[170, 300], [430, 300]], 6, "#8a8784"); scribble(p, 180, 350, 240, 7, 34, "#9a968e", 3, 9);
  p.stroke([[300, 600], [430, 600]], 3, "#9a968e"); p.ell(230, 650, 46, 46, null, 4); p.ell(230, 650, 34, 34, null, 2); p.g.save(); p.g.globalAlpha = 0.6; seal(p, 230, 650, 30, "#5a6ab0"); p.g.restore();
  signature(p, 320, 660, 0.9);
};
/** stern bank reminder: heavy border, big red wax seal, thick grey lines, red underline strokes */
export const propBank = (p, s = 1) => {
  p.g.save(); p.g.translate(300, 500); p.g.scale(s, s); p.g.translate(-300, -500);
  paper(p, 110, 220, 490, 800, "#f1ede4");
  p.stroke(rrect(130, 240, 470, 780, 6), 5, "#4a4a52"); p.stroke(rrect(142, 252, 458, 768, 6), 2, "#4a4a52");
  p.stroke([[170, 300], [330, 300]], 10, "#6a6a72"); scribble(p, 170, 360, 260, 7, 34, "#8c8a86", 4, 12);
  p.stroke([[170, 610], [420, 610]], 6, "#c0303a"); p.stroke([[170, 628], [380, 628]], 4, "#c0303a");
  seal(p, 380, 700, 52, "#b0242a"); signature(p, 170, 700, 0.9, "#222");
  p.g.restore();
};
/** official document (secret plan) — grey lines, a sketch map with arrows, hatched red stamp box, seal */
export const propDoc = (p, seed = 1, glow = 0) => {
  if (glow > 0) { const g = p.g, gr = g.createRadialGradient(300, 500, 40, 300, 500, 330); gr.addColorStop(0, `rgba(255,236,170,${0.85 * glow})`); gr.addColorStop(1, "rgba(255,236,170,0)"); g.fillStyle = gr; g.fillRect(0, 0, 600, 1000); }
  paper(p, 120, 200, 480, 800, "#f4efe1");
  p.stroke([[150, 250], [300, 250]], 9, "#6c6a66");
  p.poly(rrect(340, 228, 455, 276, 5), "#f4efe1", 0); p.stroke(rrect(340, 228, 455, 276, 5), 5, "#b8302c");
  p.clip(rrect(340, 228, 455, 276, 5), () => { for (let i = 0; i < 12; i++) p.stroke([[330 + i * 14, 290], [360 + i * 14, 220]], 3, "#b8302c80"); });
  scribble(p, 150, 310, 300, 4, 30, "#8f8a84", 3.4, seed);
  p.poly(rrect(160, 450, 440, 640, 8), "#d8e4ea", 3); // sketch map: coast + island + arrows
  p.poly([[175, 470], [240, 465], [270, 520], [230, 560], [190, 600], [175, 600]], "#e8dcbc", 2.4);
  p.ell(350, 560, 50, 34, "#e8dcbc", 2.4);
  for (const [a, b] of [[[250, 600], [330, 590]], [[300, 480], [400, 510]]]) { p.stroke([a, b], 4, "#3f4c68"); const d = Math.atan2(b[1] - a[1], b[0] - a[0]); p.poly([[b[0] + Math.cos(d) * 12, b[1] + Math.sin(d) * 12], [b[0] + Math.cos(d + 2.5) * 14, b[1] + Math.sin(d + 2.5) * 14], [b[0] + Math.cos(d - 2.5) * 14, b[1] + Math.sin(d - 2.5) * 14]], "#3f4c68", 0); }
  scribble(p, 150, 680, 180, 3, 26, "#8f8a84", 3, seed + 3); seal(p, 400, 715, 44, "#b8302c"); signature(p, 160, 760, 0.8);
};
/** red brush X symbol (k = 0..1 draw-on) */
export const fxRedX = (p, k = 1) => {
  const st = (a, b, t) => { if (t <= 0) return; const e = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; taper(p, a, e, 64, 40, "#d0202c"); taper(p, a, e, 48, 28, "#e8343c"); };
  st([150, 300], [450, 720], Math.min(1, k * 2)); st([455, 310], [145, 710], Math.min(1, Math.max(0, k * 2 - 1)));
};
export const fxArrow = (p, col = "#4e6a32", k = 1) => { // thick curved campaign arrow, grows with k
  const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20 * k; pts.push([300 + Math.sin(t * 1.4) * 90, 900 - t * 700]); }
  p.line(pts, col, 46); const [x, y] = pts[pts.length - 1], [x0, y0] = pts[pts.length - 2], d = Math.atan2(y - y0, x - x0);
  p.poly([[x + Math.cos(d) * 60, y + Math.sin(d) * 60], [x + Math.cos(d + 2.2) * 60, y + Math.sin(d + 2.2) * 60], [x + Math.cos(d - 2.2) * 60, y + Math.sin(d - 2.2) * 60]], col, 10);
};
/** a gull with a real body + head so it never reads as a letter */
export const fxGull = (p, ph = 0) => {
  const w = Math.sin(ph) * 60;
  p.line([[300, 500], [210, 470 - w], [120, 500 - w * 1.4]], "#f4f4f2", 22); p.line([[300, 500], [390, 470 - w], [480, 500 - w * 1.4]], "#f4f4f2", 22);
  p.ell(300, 505, 52, 26, "#ffffff", 8); p.ell(352, 492, 22, 20, "#ffffff", 8); p.poly([[370, 492], [400, 498], [370, 502]], "#f0b030", 4); p.dot(356, 488, 4);
  p.stroke([[120, 500 - w * 1.4], [150, 494 - w * 1.2]], 10, "#3a3a40"); p.stroke([[480, 500 - w * 1.4], [450, 494 - w * 1.2]], 10, "#3a3a40");
};
export const fxFlower = (p) => {
  p.line(curve([300, 980], [280, 760], [310, 560]), "#4f7a34", 12); p.poly([[290, 800], [210, 740], [280, 760]], "#5d8a3c", 6);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; p.ell(310 + Math.cos(a) * 46, 520 + Math.sin(a) * 46, 40, 30, "#f6f3ee", 7, 0, 360, a * 57.3); }
  p.ell(310, 520, 30, 30, "#f0c040", 7);
};
/** folded navy jacket lying on the desk with its left chest pocket open */
export const propJacket = (p) => {
  const tp = [[120, 200], [480, 200], [520, 330], [500, 860], [100, 860], [80, 330]];
  p.gradFill(tp, NAVY, NAVY_D, rad(-120)); p.inkRing(tp, 11, 0.5);
  p.poly([[230, 200], [370, 200], [300, 420]], "#ece7dc", 4); p.poly([[285, 205], [315, 205], [322, 400], [300, 420], [278, 400]], "#262d40", 3);
  for (const s of [-1, 1]) p.poly([[300 + s * 70, 200], [300 + s * 190, 210], [300 + s * 120, 360], [300 + s * 15, 420]], shade(NAVY, 0.85), 5);
  for (let i = 0; i < 4; i++) { p.dot(300, 470 + i * 90, 13); p.dot(300, 470 + i * 90, 9, "#cdb57c"); }
  p.poly(rrect(130, 430, 250, 520, 8), "#1a2030", 4); p.poly([[125, 430], [255, 430], [250, 395], [130, 395]], shade(NAVY, 1.15), 4); // open pocket
  p.poly(rrect(350, 430, 470, 520, 8), shade(NAVY, 0.9), 4);
  for (const s of [-1, 1]) p.poly(rrect(300 + s * 150 - 40, 196, 300 + s * 150 + 40, 226, 8), NAVY_D, 4);
};
export const fxPipe = (p) => { p.band([[200, 520], [360, 470]], "#3a2618", 22, 6, "round"); p.poly(rrect(340, 420, 420, 560, 26), "#6a3e22", 10); p.ell(380, 425, 34, 12, "#2a1a12", 6); };
export const fxSmoke = (p, k, seed = 1) => { const g = p.g; g.save(); g.globalAlpha = 0.5 * (1 - k); for (let i = 0; i < 5; i++) p.ell(300 + Math.sin(i * 2.1 + seed) * 60 * (0.4 + k), 600 - i * 70 - k * 120, 70 + k * 90, 55 + k * 70, "#e6e2dc", 0); g.restore(); };
export const fxGlow = (p, col = "255,240,200", a = 0.8) => { const g = p.g, gr = g.createRadialGradient(300, 500, 0, 300, 500, 300); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 600, 1000); };
export const fxSpark = (p, t) => { const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - t); const r = 60 + t * 200; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + t; p.poly([[300, 500], [300 + Math.cos(a + 0.12) * r * 0.25, 500 + Math.sin(a + 0.12) * r * 0.25], [300 + Math.cos(a) * r, 500 + Math.sin(a) * r], [300 + Math.cos(a - 0.12) * r * 0.25, 500 + Math.sin(a - 0.12) * r * 0.25]], "#fffbe0", 0); } p.ell(300, 500, 30 * (1 - t) + 6, 30 * (1 - t) + 6, "#ffffff", 0); g.restore(); };
export const fxHeart = (p, a = 1) => { p.g.save(); p.g.globalAlpha = a; heart(p, 300, 500, 14, "#e04a6a", 8); p.g.restore(); };
/** soft sea spray burst (k 0..1): no ink, soft blobs + flying droplets */
export const fxSpray = (p, k, seed = 1) => { const g = p.g, rr = (i) => { const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };
  g.save(); const fade = Math.max(0, 1 - k) ** 1.2;
  for (let i = 0; i < 14; i++) { const a = -Math.PI * (0.1 + 0.8 * rr(i)), d = (80 + 260 * rr(i + 50)) * (0.3 + k), x = 300 + Math.cos(a) * d, y = 820 + Math.sin(a) * d * 1.3 + k * k * 260, r0 = 60 + 90 * rr(i + 9) * (0.5 + k);
    const gr = g.createRadialGradient(x, y, 0, x, y, r0); gr.addColorStop(0, `rgba(240,246,255,${0.55 * fade})`); gr.addColorStop(1, "rgba(240,246,255,0)"); g.fillStyle = gr; g.fillRect(x - r0, y - r0, 2 * r0, 2 * r0); }
  for (let i = 0; i < 60; i++) { const a = -Math.PI * (0.05 + 0.9 * rr(i + 99)), v = 300 + 420 * rr(i + 7), x = 300 + Math.cos(a) * v * k, y = 820 + Math.sin(a) * v * k * 1.4 + 900 * k * k, r0 = 3 + 7 * rr(i + 3);
    g.fillStyle = `rgba(250,252,255,${0.9 * fade})`; g.beginPath(); g.ellipse(x, y, r0, r0 * 1.5, 0, 0, 7); g.fill(); }
  g.restore(); };
/** water sheeting off the hull (k 0..1): soft translucent falling bands */
export const fxPour = (p, k, seed = 0) => { const g = p.g; g.save(); const fade = Math.max(0, 1 - k);
  for (let i = 0; i < 6; i++) { const x0 = 90 + i * 85 + Math.sin(seed * 3 + i) * 25, w = 30 + 20 * Math.sin(i * 2.3 + seed), y1 = 130 + 760 * Math.min(1, 0.35 + k);
    const gr = g.createLinearGradient(0, 130, 0, y1); gr.addColorStop(0, `rgba(235,244,255,${0.55 * fade})`); gr.addColorStop(1, `rgba(235,244,255,${0.05 * fade})`);
    g.fillStyle = gr; g.beginPath(); for (let j = 0; j <= 16; j++) { const t = j / 16; g.lineTo(x0 + Math.sin(t * 5 + i + seed) * 8 - w / 2 * (1 - t * 0.4), 130 + t * (y1 - 130)); }
    for (let j = 16; j >= 0; j--) { const t = j / 16; g.lineTo(x0 + Math.sin(t * 5 + i + seed) * 8 + w / 2 * (1 - t * 0.4), 130 + t * (y1 - 130)); } g.closePath(); g.fill();
    g.fillStyle = `rgba(255,255,255,${0.5 * fade})`; g.beginPath(); g.ellipse(x0, y1, w * 0.9, 9, 0, 0, 7); g.fill(); }
  g.restore(); };
