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
// Modern cast for the elevator short (our own designs; no lettering anywhere)
// =====================================================================================
export const CAST = {
  hurry: { skin: "#f5c9a0", hair: "#6b4226", hairStyle: "messy", top: "shirt", shirt: "#a9d0f5", pants: "#27325a", shoes: "#3b2a22", tie: "#d6453a", belt: "#4a3326" },
  wheel: { skin: "#b07a55", hair: "#2b1d16", hairStyle: "curly", top: "sweater", shirt: "#f4c430", pants: "#3e5f8a", shoes: "#f1f1f1", glasses: "#d93636", seated: true },
  granny: { skin: "#f6dcc4", hair: "#f6f3ec", hairStyle: "bun", top: "cardigan", shirt: "#f5ecd8", cardigan: "#7e52b0", skirt: "#5b4a73", pants: "#d9c7b8", shoes: "#6a4430", cane: true },
  fire: { skin: "#f0c39b", top: "firecoat", shirt: "#d8c08e", pants: "#c6ad7a", shoes: "#2a2a2a", helmet: "#d63027", moustache: "#5a3a22", hairStyle: "none" },
  psych: { skin: "#eccfb4", hair: "#a3a3a3", hairStyle: "bald", top: "labcoat", shirt: "#86a9d6", coat: "#fbfbf8", tie: "#35598c", pants: "#555b66", shoes: "#2b2b2b", beard: "#b4b4b4", glasses: "#2c2c2c", round: true },
  ped: { skin: "#7a4b32", hair: "#1e1512", hairStyle: "pony", top: "hoodie", shirt: "#35a39a", pants: "#344e78", shoes: "#f4f4f4", headphones: "#ff5f7a", backpack: "#f08a3c" },
};
// crowd variants (pole field)
export const crowdOutfit = (v) => {
  const tops = ["#35a39a", "#e0574f", "#f0b429", "#5b7fd6", "#9b5bc4", "#4caf6a"], skins = ["#7a4b32", "#f5c9a0", "#c99067", "#ecd0b6"];
  const hairs = ["#1e1512", "#6b4226", "#2b211c", "#c9a15a"], styles = ["pony", "messy", "curly", "pony"];
  return { ...CAST.ped, shirt: tops[v % 6], skin: skins[v % 4], hair: hairs[(v >> 1) % 4], hairStyle: styles[v % 4], headphones: v % 3 ? null : "#ff5f7a", backpack: ["#f08a3c", "#3b6fb6", "#d6453a"][v % 3] };
};

// expressions for the modern cast, using the kit's standard eye kinds (dot / lid / small / happy / squeeze / shock)
const FX2 = {
  neutral: { eye: "lid", brow: [[0, -1], [0, -1]], mouth: "dash" },
  smile: { eye: "dot", brow: [[0, -1], [0, -1]], mouth: "smile" },
  kind: { eye: "dot", brow: [[-1, -2], [-1, -2]], mouth: "smileWide", blush: 1 },
  happy: { eye: "happy", brow: [[-2, 1], [-2, 1]], mouth: "smileWide", blush: 1 },
  grin: { eye: "dot", brow: [[-2, -3], [-2, -3]], mouth: "grin" },
  proud: { eye: "happy", brow: [[-3, -3], [-3, -3]], mouth: "grin", blush: 1 },
  sly: { eye: "lid", brow: [[2, -3], [-1, -4]], mouth: "smirk" },
  impatient: { eye: "lid", brow: [[3, -2], [3, -2]], mouth: "frown" },
  hurry: { eye: "small", brow: [[-3, 2], [-3, 2]], mouth: "wave" },
  worried: { eye: "small", brow: [[-3, 2], [-3, 2]], mouth: "wave" },
  shock: { eye: "shock", brow: [[-7, -6], [-7, -6]], mouth: "O" },
  confused: { eye: "dot", brow: [[-5, -7], [3, 1]], mouth: "wave" },
  relaxed: { eye: "happy", brow: [[-2, 1], [-2, 1]], mouth: "smile", blush: 1 },
  focus: { eye: "lid", brow: [[3, -1], [3, -1]], mouth: "smirk" },
  excited: { eye: "dot", brow: [[-4, -4], [-4, -4]], mouth: "laugh", blush: 1 },
  hopeful: { eye: "dot", brow: [[-3, 1], [-3, 1]], mouth: "smile" },
};
/** face for the modern cast — same eyes, brows and mouths as the kit's faceFront */
const faceM = (p, cx, cy, W, expr, look = 0, lookY = 0, lid = 0, O = {}) => {
  const u = W / 100, F = FX2[expr] || FX2.neutral, ex = (F.eye === "shock" ? 12 : 13) * u, ey = cy;
  if (F.blush) for (const s of [-1, 1]) p.ell(cx + s * 26 * u, cy + 9 * u, 7 * u, 4 * u, "#ff8a8a55", 0);
  for (const side of [-1, 1]) {
    const x = cx + side * ex, kind = eyeKind(F.eye, lid);
    eye(p, kind, x, ey, u, side, look, O.skin || SKIN);
    const [dI, dO] = F.brow[side < 0 ? 0 : 1], by = ey - (O.brim ? 16 : 20) * u;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u, O.browCol || INK);
    else taper(p, [x - side * 8.5 * u, by + dI * u], [x + side * 8.5 * u, by + dO * u], 5 * u, 2.5 * u, O.browCol || INK);
  }
  const mx = cx, my = cy + 20 * u;
  if (O.moustache) for (const s of [-1, 1]) taper(p, [mx + s * 1.5 * u, cy + 12.5 * u], [mx + s * 15 * u, cy + 15 * u], 4.5 * u, 1.6 * u, O.moustache);
  mouth(p, F.mouth, mx, my, u);
};

/** inverse clip helper: draw fn everywhere except inside pts (respects p.rot) */
const clipOut = (p, pts, fn) => {
  const g = p.g; g.save(); g.beginPath(); g.rect(-2000, -2000, 5000, 5000);
  pts.forEach((q, i) => { const [x, y] = p.P(q[0], q[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath();
  g.clip("evenodd"); fn(); g.restore();
};
const hairlineOf = (style, H, cx, hc, u, seed) => {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, x = cx - 1.35 * H.a + 2.7 * H.a * t, d = Math.abs(x - cx) / H.a;
    let y;
    if (style === "messy") y = hc - 0.6 * H.b + (i % 4 < 2 ? 0 : 1) * 7 * u * (d < 0.9 ? 1 : 0) - (i % 4 === 1 ? 5 * u : 0) + 0.45 * H.b * Math.max(0, d - 0.72) * 3;
    else if (style === "curly") y = hc - 0.5 * H.b + 0.62 * H.b * Math.min(1, Math.max(0, (d - 0.5) / 0.4)) + 4 * u * Math.abs(Math.sin(t * 24));
    else if (style === "pony") y = hc - 0.5 * H.b + 0.16 * H.b * Math.pow((x - cx - 0.35 * H.a) / H.a, 2) + 0.25 * H.b * Math.max(0, d - 0.85) * 3;
    else y = hc - 0.5 * H.b + 0.12 * H.b * Math.pow((x - cx) / H.a, 2) + 0.2 * H.b * Math.max(0, d - 0.85) * 3; // bun
    pts.push([x, y]);
  }
  return pts;
};
const hairOutline = (style, H, cx, hc, seed) => {
  const B = { ...H, a: H.a * 1.07, b: H.b * 1.07 };
  const base = blobPts(cx, hc - 0.02 * 2 * H.b, B, 96);
  if (style === "messy") return base.map(([x, y], i) => { const t = i / 96 * Math.PI * 2, up = Math.sin(t) < -0.2; const k = up ? 1 + 0.13 * Math.pow(Math.abs(Math.sin(4.5 * t + 0.6)), 8) : 1; return [cx + (x - cx) * k, hc + (y - hc) * k]; });
  if (style === "curly") return base.map(([x, y], i) => { const t = i / 96 * Math.PI * 2, k = 1.03 + 0.045 * Math.abs(Math.sin(11 * t)); return [cx + (x - cx) * k, hc + (y - hc) * k]; });
  return base;
};
/** hair: back parts (before head) */
const hairBack = (p, O, H, cx, hc, u, light, thick) => {
  const st = O.hairStyle, col = O.hair, sh = mul(col || "#000000", [0.72, 0.72, 0.8]);
  if (st === "bun") { const bp = ellPts(cx + 4 * u, hc - 1.02 * H.b, 0.42 * H.a, 0.36 * H.b, 0, 360, 0, 40); p.shadedFill(bp, col, sh, light, 0.4 * H.a); p.inkRing(bp, 4.2 * u, thick); p.arc(cx + 4 * u, hc - 1.02 * H.b, 0.25 * H.a, 0.2 * H.b, 200, 330, 1.6 * u, mul(col, [0.8, 0.8, 0.82])); }
  if (st === "pony") { const pp = [[cx + 0.7 * H.a, hc - 0.55 * H.b], [cx + 1.25 * H.a, hc - 0.2 * H.b], [cx + 1.32 * H.a, hc + 0.45 * H.b], [cx + 1.12 * H.a, hc + 1.05 * H.b], [cx + 1.0 * H.a, hc + 0.5 * H.b], [cx + 0.85 * H.a, hc - 0.1 * H.b]]; const c = curve(pp[0], pp[1], pp[2], 8).concat(curve(pp[2], [cx + 1.3 * H.a, hc + 0.85 * H.b], pp[3], 8)).concat(curve(pp[3], pp[4], pp[5], 8)); p.shadedFill(c, col, sh, light, 0.4 * H.a); p.inkRing(c, 4 * u, thick); p.dot(cx + 1.02 * H.a, hc - 0.32 * H.b, 5 * u, O.headphones || "#e04a6a"); }
  if (st === "curly") { const bp = blobPts(cx, hc + 0.1 * H.b, { ...H, a: H.a * 1.12, b: H.b * 1.02, noise: 0.02 }, 72).map(([x, y], i) => { const t = i / 72 * Math.PI * 2, k = 1 + 0.05 * Math.abs(Math.sin(11 * t)); return [cx + (x - cx) * k, hc + 0.1 * H.b + (y - hc - 0.1 * H.b) * k]; }); p.poly(bp, sh, 0); p.inkRing(bp, 4 * u, thick); }
};
/** hair cap over the head (after skin) */
const hairFront = (p, O, H, cx, hc, u, light, thick, seed) => {
  const st = O.hairStyle, col = O.hair;
  if (!col || st === "none") return;
  if (st === "bald") { // grey side tufts + two strands
    for (const s of [-1, 1]) { const tp = blobPts(cx + s * 0.93 * H.a, hc - 0.12 * H.b, { a: 0.15 * H.a, b: 0.28 * H.b, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: s * 0.25, noise: 0.05, seed: seed + s }, 40); p.shadedFill(tp, col, mul(col, [0.8, 0.8, 0.85]), light, 0.2 * H.a); p.inkRing(tp, 3.2 * u, thick); }
    p.stroke(curve([cx - 0.3 * H.a, hc - 0.92 * H.b], [cx, hc - 1.04 * H.b], [cx + 0.35 * H.a, hc - 0.9 * H.b]), 2.4 * u, mul(col, [0.75, 0.75, 0.75]));
    return;
  }
  const out = hairOutline(st, H, cx, hc, seed), line = hairlineOf(st, H, cx, hc, u, seed);
  const win = [[cx - 3 * H.a, line[0][1]], ...line, [cx + 3 * H.a, line[line.length - 1][1]], [cx + 3 * H.a, hc + 4 * H.b], [cx - 3 * H.a, hc + 4 * H.b]];
  const sh = mul(col, [0.72, 0.72, 0.8]);
  clipOut(p, win, () => {
    p.shadedFill(out, col, sh, light, H.a, 0.5);
    p.clip(out, () => { for (let i = 0; i < 7; i++) { const x = cx + (i - 3) * 0.26 * H.a; p.stroke(curve([x - 4 * u, hc - 0.98 * H.b], [x + 6 * u, hc - 0.8 * H.b], [x + 2 * u, hc - 0.5 * H.b]), 1.8 * u, mul(col, [0.8, 0.78, 0.8])); }
      p.stroke(ellPts(cx - 0.3 * H.a, hc - 0.72 * H.b, 0.32 * H.a, 0.18 * H.b, 200, 300, 0, 14), 4 * u, "#ffffff40"); });
    p.inkRing(out, 4.6 * u, thick);
  });
  p.clip(out, () => p.stroke(line, 3 * u));
  if (st === "messy") for (const [a, l] of [[-0.35, 1], [0.15, 0.8]]) p.stroke(curve([cx + a * H.a, hc - 0.68 * H.b], [cx + (a + 0.08) * H.a, hc - 0.52 * H.b], [cx + (a + 0.02) * H.a, hc - 0.46 * H.b * l]), 3.4 * u, col);
  if (st === "curly") for (let i = 0; i < 9; i++) { const a = rad(200 + i * 17.5); p.arc(cx + 0.82 * H.a * Math.cos(a), hc + 0.82 * H.b * Math.sin(a), 6 * u, 6 * u, 0, 260, 1.8 * u, sh); }
};
const helmetOn = (p, O, H, cx, hc, u, light, thick) => {
  const col = O.helmet, sh = mul(col, [0.66, 0.6, 0.66]), base = hc - 0.6 * H.b;
  const dome = ellPts(cx, base, 1.13 * H.a, 0.82 * H.b, 180, 360, 0, 40);
  const brim = ellPts(cx, base, 1.42 * H.a, 0.17 * H.b, 0, 360, 0, 48);
  p.shadedFill(brim, mul(col, [0.85, 0.8, 0.82]), sh, light, 1.4 * H.a, 0.3); p.inkRing(brim, 4.4 * u, thick);
  p.shadedFill(dome, col, sh, light, 1.1 * H.a, 0.45); p.inkRing(dome, 4.6 * u, thick);
  const ridge = [[cx - 7 * u, base - 0.04 * H.b], [cx - 5 * u, base - 0.78 * H.b], [cx, base - 0.86 * H.b], [cx + 5 * u, base - 0.78 * H.b], [cx + 7 * u, base - 0.04 * H.b]];
  p.poly(ridge, mul(col, [0.86, 0.82, 0.84]), 2.4 * u);
  p.stroke(ellPts(cx - 0.45 * H.a, base - 0.45 * H.b, 0.28 * H.a, 0.22 * H.b, 200, 280, 0, 12), 5 * u, "#ffffff80");
  p.band([[cx - 1.1 * H.a, base + 0.02 * H.b], [cx + 1.1 * H.a, base + 0.02 * H.b]], mul(col, [0.7, 0.62, 0.66]), 4 * u, 1.4 * u);
};
const glassesOn = (p, O, cx, ey, u, H) => {
  const col = O.glasses, r = O.round ? 10.5 * u : 11.2 * u, ry = O.round ? 10.5 * u : 9.2 * u;
  for (const s of [-1, 1]) {
    const x = cx + s * 13 * u;
    p.ell(x, ey, r, ry, null, (O.round ? 2.6 : 4.4) * u + 2 * u);
    p.ell(x, ey, r, ry, null, 0);
    p.stroke(ellPts(x, ey, r, ry), (O.round ? 2.2 : 3.6) * u, col);
    p.stroke([[x - 0.45 * r, ey - 0.15 * ry], [x - 0.1 * r, ey - 0.55 * ry]], 1.8 * u, "#ffffffb0");
    p.stroke([[x + s * r, ey - 2 * u], [cx + s * 0.97 * H.a, ey - 5 * u]], 2.4 * u, col);
  }
  p.arc(cx, ey - 1 * u, 3.4 * u, 3 * u, 200, 340, 2.4 * u, col);
};
const headphonesOn = (p, O, H, cx, hc, u, light, thick) => {
  const col = O.headphones, band = ellPts(cx, hc - 0.02 * H.b, 1.06 * H.a, 1.14 * H.b, 192, 348, 0, 30);
  p.band(band, "#3a3a46", 6 * u, 1.6 * u, "round");
  for (const s of [-1, 1]) { const cp = ellPts(cx + s * 1.03 * H.a, hc + 0.05 * H.b, 9.5 * u, 15 * u, 0, 360, 0, 28); p.shadedFill(cp, col, mul(col, [0.7, 0.62, 0.7]), light, 12 * u); p.inkRing(cp, 3.4 * u, thick); p.ell(cx + s * 1.03 * H.a, hc + 0.05 * H.b, 4 * u, 8 * u, mul(col, [0.75, 0.7, 0.78]), 0); }
};
const beardOn = (p, O, H, cx, hc, u, light, thick, seed) => {
  const bd = blobPts(cx, hc + 0.62 * H.b, { a: 0.78 * H.a, b: 0.55 * H.b, nTop: 2.6, nBot: 1.7, egg: -0.3, asym: 0, rot: 0, noise: 0.03, seed: seed + 4 }, 60);
  p.shadedFill(bd, O.beard, mul(O.beard, [0.82, 0.82, 0.86]), light, 0.7 * H.a, 0.3);
  p.clip(bd, () => { for (let i = -4; i <= 4; i++) p.stroke([[cx + i * 8 * u, hc + 0.35 * H.b], [cx + i * 7 * u, hc + 1.15 * H.b]], 1.2 * u, mul(O.beard, [0.75, 0.75, 0.78])); p.ell(cx, hc + 0.36 * H.b, 0.42 * H.a, 0.2 * H.b, O.skin, 0); });
  p.inkRing(bd, 3.6 * u, thick);
};

// ---------------- props ----------------
const propCup = (p, x, y, u, slosh = 0, drop = 0) => {
  const top = y - 22 * u, bot = y + 14 * u, wt = 13 * u, wb = 9.5 * u;
  const body = [[x - wt, top], [x + wt, top], [x + wb, bot], [x - wb, bot]];
  p.poly(body, "#fbf7ef", 2.6 * u);
  p.poly([[x - 12.2 * u, y - 10 * u], [x + 12.2 * u, y - 10 * u], [x + 10.8 * u, y + 2 * u], [x - 10.8 * u, y + 2 * u]], "#c48a55", 2 * u);
  p.ell(x, top, wt, 4.2 * u, "#fbf7ef", 2.4 * u);
  p.clip(ellPts(x, top, wt - 1.6 * u, 3.2 * u), () => p.ell(x + slosh * 2 * u, top + 0.4 * u - slosh * 1.2 * u, wt, 3.6 * u, "#5b3520", 0, 0, 360, slosh * 14));
  if (Math.abs(slosh) > 0.4) p.ell(x + Math.sign(slosh) * 9 * u, top - 2.4 * u, 3.4 * u, 2.6 * u, "#5b3520", 1.6 * u);
  if (drop > 0 && drop < 1) { const dy = top - 6 * u - 34 * u * Math.sin(Math.PI * drop); p.poly([[x + 2 * u, dy - 5 * u], [x + 5 * u, dy + 1 * u], [x + 2 * u, dy + 4 * u], [x - 1 * u, dy + 1 * u]], "#5b3520", 1.6 * u); }
  for (const k of [0, 1]) p.stroke(curve([x - 4 * u + k * 8 * u, top - 6 * u], [x - 8 * u + k * 8 * u, top - 14 * u], [x - 3 * u + k * 8 * u, top - 22 * u], 8), 2 * u, "#ffffff90");
};
const propCase = (p, x, y, u, swing = 0) => {
  const r = p.rot; p.rot = [rad(swing), x, y];
  p.stroke(ellPts(x, y + 6 * u, 9 * u, 7 * u, 180, 360, 0, 14), 3.6 * u, "#4a2d1a");
  const b = rrect(x - 26 * u, y + 6 * u, x + 26 * u, y + 40 * u, 4 * u);
  p.gradFill(b, "#8a5530", "#5e3820", rad(-120)); p.poly(b, null, 2.8 * u);
  p.stroke([[x - 26 * u, y + 15 * u], [x + 26 * u, y + 15 * u]], 1.8 * u, "#4a2d1a");
  p.poly(rrect(x - 4 * u, y + 12 * u, x + 4 * u, y + 19 * u, 1.5 * u), "#e8c45a", 1.4 * u);
  p.rot = r;
};
const propWatch = (p, x, y, u, ang = 0) => {
  p.stroke([[x - 6 * u * Math.sin(ang), y - 6 * u * Math.cos(ang)], [x + 6 * u * Math.sin(ang), y + 6 * u * Math.cos(ang)]], 5.6 * u, "#3a2a20");
  p.ell(x, y, 5.6 * u, 5.6 * u, "#fffdf4", 2 * u); p.ell(x, y, 5.6 * u, 5.6 * u, null, 0);
  p.stroke([[x, y], [x, y - 3.8 * u]], 1.3 * u); p.stroke([[x, y], [x + 2.8 * u, y + 0.6 * u]], 1.3 * u);
  p.stroke(ellPts(x, y, 6.6 * u, 6.6 * u), 1.4 * u, "#e0b850");
};
export const propKey = (p, x, y, u, dirX = 1, dirY = 0, turn = 0, s = 1) => {
  const l = Math.hypot(dirX, dirY) || 1, dx = dirX / l, dy = dirY / l, nx = -dy, ny = dx, k = s * u;
  const P2 = (a, b) => [x + dx * a * k + nx * b * k, y + dy * a * k + ny * b * k];
  p.line([P2(0, 0), P2(17, 0)], "#cfd6dd", 3.4 * k, true);
  p.poly([P2(10, 0), P2(10, 4 * Math.cos(turn) + 1.5), P2(13, 4 * Math.cos(turn) + 1.5), P2(13, 2.5 * Math.cos(turn)), P2(16, 2.5 * Math.cos(turn)), P2(16, 0)], "#cfd6dd", 1.4 * k);
  const bw = 7 * k, bh = 7 * k * Math.max(0.25, Math.abs(Math.cos(turn)));
  const bp = ellPts(...P2(-7, 0), bw, bh, 0, 360, Math.atan2(dy, dx) * 180 / Math.PI + 90, 24);
  p.poly(bp, "#d9e0e6", 2 * k); p.ell(...P2(-8.5, 0), 2.2 * k, 2.2 * k * Math.max(0.25, Math.abs(Math.cos(turn))), "#6d7680", 0);
};
const propClip = (p, x, y, u) => {
  p.poly(rrect(x - 25 * u, y - 66 * u, x + 25 * u, y + 2 * u, 3 * u), "#a2703f", 2.6 * u);
  p.poly(rrect(x - 21 * u, y - 60 * u, x + 21 * u, y - 3 * u, 1.5 * u), "#ffffff", 1.6 * u);
  p.poly(rrect(x - 10 * u, y - 70 * u, x + 10 * u, y - 60 * u, 2.5 * u), "#c6ccd2", 2 * u);
};
const propPen = (p, x, y, u, ang = -0.6) => { p.line([[x, y], [x + 18 * u * Math.cos(ang), y + 18 * u * Math.sin(ang)]], "#2f5fb3", 3 * u, true); };
const propCane = (p, x, y, sole, u) => {
  p.line([[x + 1 * u, y], [x + 4 * u, sole - 2 * u]], "#9a6a3c", 3.8 * u, true);
  p.line(curve([x - 9 * u, y + 4 * u], [x - 6 * u, y - 7 * u], [x + 2 * u, y - 1 * u], 8), "#9a6a3c", 3.8 * u, true);
  p.ell(x + 4 * u, sole - 2 * u, 3 * u, 1.6 * u, "#3a2a20", 0);
};
const wheelchairBack = (p, cx, u, seatY, sole, rot, frame) => {
  const R = 56 * u, wy = sole - R, rx = 0.34 * R;
  for (const s of [-1, 1]) {
    const wx = cx + s * 54 * u;
    for (let k = 0; k < 8; k++) { const a = rot + k * Math.PI / 4; p.stroke([[wx, wy], [wx + (rx - 4 * u) * Math.cos(a), wy + (R - 5 * u) * Math.sin(a)]], 1.1 * u, "#b9c2cb"); }
    p.stroke(ellPts(wx, wy, rx, R), 8.5 * u, INK); p.stroke(ellPts(wx, wy, rx, R), 5.6 * u, "#3a3f47");
    p.stroke(ellPts(wx + s * 3 * u, wy, rx - 3 * u, R - 7 * u), 2.2 * u, "#d7dee5");
    p.ell(wx, wy, 4.5 * u, 6 * u, "#d7dee5", 1.6 * u);
  }
  // low back rest + seat
  p.poly(rrect(cx - 40 * u, seatY - 56 * u, cx + 40 * u, seatY - 8 * u, 6 * u), "#2b4650", 2.4 * u);
  for (const s of [-1, 1]) p.line([[cx + s * 41 * u, seatY - 58 * u], [cx + s * 44 * u, seatY + 6 * u], [cx + s * 30 * u, sole - 30 * u]], frame, 3 * u, true);
};
const wheelchairFront = (p, cx, u, seatY, sole, frame) => {
  p.poly(rrect(cx - 34 * u, sole - 36 * u, cx + 34 * u, sole - 26 * u, 3 * u), "#3a3f47", 2 * u);
  for (const s of [-1, 1]) { p.line([[cx + s * 30 * u, sole - 30 * u], [cx + s * 34 * u, sole - 14 * u]], frame, 2.4 * u, true); p.ell(cx + s * 34 * u, sole - 8 * u, 3.2 * u, 7 * u, "#3a3f47", 2 * u); }
};

/** front-facing modern character. opts: expr, blink, look, lookY, seed, L/R arm poses, tilt, headTilt, bob, step, tap, slosh, drop, swing, reach, keyTurn, wheelRot, pen */
export const castFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? CAST[key] : key;
  const { expr = "neutral", blink = 0, look = 0, lookY = 0, seed = 3, L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0, light = rad(-120),
    step = 0, tap = 0, slosh = 0, drop = 0, swing = 0, reach = 1, keyTurn = 0, wheelRot = 0, pen = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin;
  const H = headBlob(seed, 118, 0), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const sole = 975, seated = !!O.seated;
  const torsoBot = seated ? sole - 1.02 * HH - bob * HH : sole - 1.38 * HH - bob * HH, chin = torsoBot - 1.08 * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 4.6 * u, cx = 300, ol0 = p.ol; p.ol = 2.3 * u;
  const topCol = O.top === "labcoat" ? O.coat : O.top === "cardigan" ? O.cardigan : O.shirt;
  const sleeve = topCol, pantsCol = O.pants;
  p.rot = null;
  const T = { a: (0.4 * W) / 1.06 * (O.top === "firecoat" ? 1.1 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: 0.12, asym: 0, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const frame = "#2f8f9d";
  if (seated) wheelchairBack(p, cx, u, hipY + 4 * u, sole, wheelRot, frame);
  // backpack behind
  if (O.backpack) { const bp = rrect(tcx - 1.12 * T.a, chin + 0.05 * HH, tcx + 1.12 * T.a, torsoBot - 0.05 * HH, 14 * u); p.gradFill(bp, O.backpack, mul(O.backpack, SH_CLOTH), light); p.poly(bp, null, ow * 0.8); }
  // ---- legs ----
  if (seated) {
    for (const s of [-1, 1]) {
      const h = [cx + s * 17 * u, hipY + 4 * u], k = [cx + s * 22 * u, hipY + 0.16 * HH], a = [cx + s * 22 * u, sole - 40 * u];
      p.line([h, k], pantsCol, 15 * u, true);
      p.ell(k[0], k[1], 9 * u, 8 * u, pantsCol, 2.2 * u);
    }
    wheelchairFront(p, cx, u, hipY, sole, frame);
    for (const s of [-1, 1]) {
      const k = [cx + s * 22 * u, hipY + 0.16 * HH], a = [cx + s * 22 * u, sole - 40 * u];
      p.line([k, a], pantsCol, 8.5 * u, true);
      p.ell(a[0] + s * 1 * u, a[1] + 1 * u, 8.5 * u, 6 * u, O.shoes, 2.2 * u);
    }
  } else {
    if (O.top === "cardigan") { // skirt
      const sk = [[tcx - 0.86 * T.a, torsoBot - 0.18 * HH], [tcx + 0.86 * T.a, torsoBot - 0.18 * HH], [tcx + 1.05 * T.a, torsoBot + 0.55 * HH], [tcx - 1.05 * T.a, torsoBot + 0.55 * HH]];
      for (const s of [-1, 1]) { const hx = cx + s * 14 * u; p.line([[hx, torsoBot + 0.4 * HH], [hx + s * 2 * u, sole - 6 * u]], O.pants, 5 * u, true); p.ell(hx + s * 5 * u, sole - 5 * u, 10 * u, 5.5 * u, O.shoes, 2.2 * u); }
      p.gradFill(sk, O.skirt, mul(O.skirt, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
    } else for (const side of [-1, 1]) {
      let up = step ? Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 34 : 0;
      if (tap && side > 0) up += tap * 16;
      const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 5 * u - up;
      p.line(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), pantsCol, 8 * u, true);
      p.ell(fx + side * 5 * u, fy + 1 * u, 11 * u, 6 * u, O.shoes, 2.2 * u);
    }
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const S = (side) => [tcx + side * 0.84 * T.a, chin + 0.13 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.08 + k * u);
    switch (pose) {
      case "cup": return { pts: [s, [X(9), s[1] + 0.46 * HH], [tcx + side * 0.98 * T.a, s[1] + 0.3 * HH]], front: true, prop: "cup" };
      case "case": return { pts: [s, [X(4), s[1] + 0.45 * HH], [X(3), chin + 1.0 * HH]], prop: "case" };
      case "press": { const r = reach; return { pts: [s, [X(14 + 14 * r), s[1] + 0.16 * HH - 0.1 * r * HH], [X(26 + 36 * r), s[1] + 0.06 * HH - 0.06 * HH * r]], finger: [side, -0.05] }; }
      case "pressUp": return { pts: [s, [X(16), s[1] + 0.05 * HH], [X(40), s[1] - 0.28 * HH]], finger: [side * 0.7, -0.7] };
      case "watch": return { pts: [s, [X(2), s[1] + 0.42 * HH], [tcx + side * 0.12 * T.a, s[1] + 0.12 * HH]], front: true, prop: "watch" };
      case "scratch": return { pts: [s, [X(28), s[1] - 0.18 * HH], [cx + side * 0.5 * H.a, hc - 0.9 * H.b]], over: true };
      case "gun": return { pts: [s, [X(12), s[1] + 0.3 * HH], [cx + side * 0.62 * H.a, hc + 1.12 * H.b]], over: true, finger: [-side * 0.35, -1], thumb: true, flen: 17 };
      case "keyUp": return { pts: [s, [X(22), s[1] - 0.02 * HH], [X(14), s[1] - 0.56 * HH]], prop: "keyUp" };
      case "key": return { pts: [s, [X(24), s[1] + 0.14 * HH], [X(54), s[1] + 0.02 * HH]], prop: "keyOut" };
      case "clip": return { pts: [s, [X(4), s[1] + 0.44 * HH], [tcx + side * 0.3 * T.a, s[1] + 0.48 * HH]], front: true, prop: "clip" };
      case "pen": return { pts: [s, [X(6), s[1] + 0.42 * HH], [tcx - side * 0.05 * T.a + 6 * u * Math.sin(pen * 9), s[1] + 0.3 * HH + 3 * u * Math.cos(pen * 13)]], front: true, prop: "pen", late: true };
      case "rim": return { pts: [s, [X(10), s[1] + 0.3 * HH], [cx + side * 54 * u, hipY - 6 * u]], front: true };
      case "cane": return { pts: [s, [X(8), s[1] + 0.38 * HH], [X(12), hipY + 0.02 * HH]], prop: "cane" };
      case "strap": return { pts: [s, [X(3), s[1] + 0.42 * HH], [tcx + side * 0.62 * T.a, s[1] + 0.18 * HH]], front: true };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]] };
      case "thumb": return { pts: [s, [X(20), s[1] + 0.12 * HH], [X(42), s[1] - 0.14 * HH]], thumb: true };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]] };
      case "shrug": return { pts: [s, [X(22), s[1] + 0.2 * HH], [X(40), s[1] + 0.02 * HH]], palm: true };
      default: return { pts: [s, [X(4), s[1] + 0.47 * HH], [X(3), chin + 1.02 * HH]] };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const handAt = (a) => a.pts[2];
  const drawArm = (a) => {
    p.line(curve(a.pts[0], a.pts[1], a.pts[2]), sleeve, 8.5 * u, true);
    if (O.top === "firecoat") { const m = curve(a.pts[0], a.pts[1], a.pts[2]); const q0 = m[6], q1 = m[8]; p.band([q0, q1], "#e7ef5a", 7.4 * u, 0.8 * u); p.band([lerp2(q0, q1, 0.35), lerp2(q0, q1, 0.65)], "#dfe6ea", 7.4 * u, 0); }
    const [hx, hy] = a.pts[2];
    if (a.prop === "cup") propCup(p, hx + (hx > cx ? 1 : -1) * 8 * u, hy - 2 * u, u, slosh, drop);
    if (a.prop === "case") propCase(p, hx, hy, u, swing);
    if (a.prop === "clip") propClip(p, tcx, hy + 6 * u, u);
    if (a.prop === "keyUp") propKey(p, hx + 2 * u, hy - 8 * u, u, 0.25, -1, keyTurn, 1.6);
    if (a.prop === "keyOut") propKey(p, hx + Math.sign(hx - cx) * 6 * u, hy, u, Math.sign(hx - cx), 0, keyTurn, 1.4);
    p.ell(hx, hy, 6.4 * u, 6.4 * u, skin, 2.2 * u);
    if (a.finger) { const [dx, dy] = a.finger, l = Math.hypot(dx, dy), fl = (a.flen || 13) * u; p.line([[hx, hy], [hx + dx / l * fl, hy + dy / l * fl]], skin, 4.6 * u, true); p.ell(hx, hy, 6.2 * u, 6.2 * u, skin, 0); }
    if (a.thumb) { p.line([[hx, hy], [hx + Math.sign(hx - cx) * 4 * u, hy - 12 * u]], skin, 4.4 * u, true); p.ell(hx, hy, 6.2 * u, 6.2 * u, skin, 0); }
    if (a.prop === "watch") { const [ex, ey] = a.pts[1]; propWatch(p, hx + (ex - hx) * 0.24, hy + (ey - hy) * 0.24, u, Math.atan2(ex - hx, ey - hy)); }
    if (a.prop === "pen") propPen(p, hx - 2 * u, hy + 2 * u, u, -2.2);
    if (a.prop === "cane") propCane(p, hx, hy, sole, u);
    if (a.prop === "case") p.ell(hx, hy, 6.4 * u, 6.4 * u, skin, 2.2 * u);
  };
  for (const a of arms) if (!a.front && !a.over) drawArm(a);
  // torso
  if (O.top === "labcoat") { // long coat tails behind legs region
    const tail = [[tcx - 1.05 * T.a, chin + 0.3 * HH], [tcx + 1.05 * T.a, chin + 0.3 * HH], [tcx + 1.16 * T.a, torsoBot + 0.62 * HH], [tcx - 1.16 * T.a, torsoBot + 0.62 * HH]];
    p.gradFill(tail, O.coat, mul(O.coat, [0.82, 0.84, 0.9]), light); p.poly(tail, null, ow * 0.8);
  }
  if (O.top === "firecoat") { const tail = [[tcx - 1.0 * T.a, torsoBot - 0.3 * HH], [tcx + 1.0 * T.a, torsoBot - 0.3 * HH], [tcx + 1.06 * T.a, torsoBot + 0.3 * HH], [tcx - 1.06 * T.a, torsoBot + 0.3 * HH]]; p.gradFill(tail, O.shirt, mul(O.shirt, SH_CLOTH), light); p.poly(tail, null, ow * 0.8); p.band([[tcx - 1.03 * T.a, torsoBot + 0.12 * HH], [tcx + 1.03 * T.a, torsoBot + 0.12 * HH]], "#e7ef5a", 0.07 * HH, 0.8 * u); p.band([[tcx - 1.03 * T.a, torsoBot + 0.12 * HH], [tcx + 1.03 * T.a, torsoBot + 0.12 * HH]], "#dfe6ea", 0.03 * HH, 0); }
  if (O.top === "hoodie") { const hood = ellPts(tcx, chin + 0.04 * HH, 0.78 * T.a, 0.2 * HH, 180, 360, 0, 24); p.gradFill(hood, mul(O.shirt, [0.85, 0.85, 0.9]), mul(O.shirt, SH_CLOTH), light); p.inkRing(hood, ow * 0.8, thick); }
  p.gradFill(tp, O.shirt, mul(O.shirt, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.top === "shirt" || O.top === "labcoat") {
      for (let i = 0; i < 4; i++) p.dot(tcx + 1 * u, chin + (0.28 + i * 0.2) * HH, 1.6 * u, "#ffffffcc");
      p.poly([[tcx - 9 * u, chin - 0.02 * HH], [tcx + 9 * u, chin - 0.02 * HH], [tcx + 1 * u, chin + 0.17 * HH]], skin, 0);
      if (O.belt) { p.band([[tcx - 1.4 * T.a, torsoBot - 0.2 * HH], [tcx + 1.4 * T.a, torsoBot - 0.2 * HH]], O.belt, 0.06 * HH, 1.2 * u); p.poly(rrect(tcx - 6 * u, torsoBot - 0.24 * HH, tcx + 6 * u, torsoBot - 0.16 * HH, 1.5 * u), "#d9b45a", 1.2 * u); }
      if (O.top === "shirt") p.poly(rrect(tcx - 0.62 * T.a, chin + 0.36 * HH, tcx - 0.22 * T.a, chin + 0.52 * HH, 2 * u), null, 1.6 * u);
    }
    if (O.top === "sweater") { p.band([[tcx - 1.4 * T.a, torsoBot - 0.05 * HH], [tcx + 1.4 * T.a, torsoBot - 0.05 * HH]], mul(O.shirt, [0.86, 0.82, 0.8]), 0.12 * HH, 0); for (let i = -6; i <= 6; i++) p.stroke([[tcx + i * 7 * u, torsoBot - 0.11 * HH], [tcx + i * 7 * u, torsoBot]], 1.2 * u, mul(O.shirt, [0.7, 0.66, 0.62])); }
    if (O.top === "cardigan") { for (const s of [-1, 1]) { const pnl = [[tcx + s * 0.12 * T.a, chin - 0.1 * HH], [tcx + s * 1.5 * T.a, chin - 0.1 * HH], [tcx + s * 1.5 * T.a, torsoBot + 0.1 * HH], [tcx + s * 0.22 * T.a, torsoBot + 0.1 * HH]]; p.gradFill(pnl, O.cardigan, mul(O.cardigan, SH_CLOTH), light); p.poly(pnl, null, 2 * u); } for (let i = 0; i < 4; i++) p.ell(tcx - 0.3 * T.a, chin + (0.3 + i * 0.2) * HH, 2.4 * u, 2.4 * u, "#f4e3b0", 1.2 * u); }
    if (O.top === "firecoat") { for (const y of [chin + 0.5 * HH, torsoBot - 0.18 * HH]) { p.band([[tcx - 1.5 * T.a, y], [tcx + 1.5 * T.a, y]], "#e7ef5a", 0.09 * HH, 0.8 * u); p.band([[tcx - 1.5 * T.a, y], [tcx + 1.5 * T.a, y]], "#dfe6ea", 0.035 * HH, 0); } p.stroke([[tcx + 2 * u, chin], [tcx + 2 * u, torsoBot]], 2 * u, mul(O.shirt, [0.6, 0.58, 0.55])); for (let i = 0; i < 3; i++) p.poly(rrect(tcx - 2 * u, chin + (0.3 + i * 0.28) * HH, tcx + 6 * u, chin + (0.36 + i * 0.28) * HH, 1 * u), "#6a6a6a", 1 * u); }
    if (O.top === "hoodie") { p.poly(rrect(tcx - 0.62 * T.a, torsoBot - 0.42 * HH, tcx + 0.62 * T.a, torsoBot - 0.12 * HH, 6 * u), mul(O.shirt, [0.9, 0.92, 0.95]), 1.6 * u); for (const s of [-1, 1]) p.stroke([[tcx + s * 7 * u, chin + 0.06 * HH], [tcx + s * 8 * u, chin + 0.36 * HH]], 1.8 * u, "#f4f4f4"); }
  });
  p.inkRing(tp, ow, thick);
  if (O.top === "labcoat") { for (const s of [-1, 1]) { const pnl = [[tcx + s * 0.2 * T.a, chin - 0.04 * HH], [tcx + s * 1.12 * T.a, chin + 0.02 * HH], [tcx + s * 1.1 * T.a, torsoBot + 0.02 * HH], [tcx + s * 0.34 * T.a, torsoBot + 0.02 * HH], [tcx + s * 0.34 * T.a, chin + 0.42 * HH]]; p.gradFill(pnl, O.coat, mul(O.coat, [0.82, 0.84, 0.9]), light); p.poly(pnl, null, 2.6 * u); }
    p.poly(rrect(tcx + 0.5 * T.a, chin + 0.3 * HH, tcx + 0.9 * T.a, chin + 0.42 * HH, 1.5 * u), null, 1.4 * u); p.stroke([[tcx + 0.6 * T.a, chin + 0.24 * HH], [tcx + 0.6 * T.a, chin + 0.36 * HH]], 2.2 * u, "#2f5fb3"); }
  if (O.top === "firecoat") for (const s of [-1, 1]) p.poly([[tcx + s * 4 * u, chin - 0.06 * HH], [tcx + s * 0.75 * T.a, chin - 0.1 * HH], [tcx + s * 0.6 * T.a, chin + 0.14 * HH]], mul(O.shirt, [0.92, 0.9, 0.86]), 2 * u);
  if (O.top === "shirt" || O.top === "labcoat") for (const s of [-1, 1]) p.poly([[tcx + s * 2 * u, chin - 0.02 * HH], [tcx + s * 0.55 * T.a, chin - 0.06 * HH], [tcx + s * 0.34 * T.a, chin + 0.1 * HH]], O.top === "shirt" ? mul(O.shirt, [1.06, 1.04, 1.02]) : O.shirt, 1.8 * u);
  if (O.tie) { const loose = O.top === "shirt" ? 1 : 0, kx = tcx + 6 * u * loose, ky = chin + (0.08 + 0.12 * loose) * HH, sw = swing * 0.4 + 5 * loose;
    if (loose) p.poly([[tcx - 7 * u, chin - 0.01 * HH], [tcx + 13 * u, chin - 0.01 * HH], [kx + 2 * u, ky - 3 * u]], skin, 0);
    p.poly([[kx - 5 * u, ky - 4 * u], [kx + 5 * u, ky - 4 * u], [kx + 3.5 * u, ky + 4 * u], [kx - 3.5 * u, ky + 4 * u]], O.tie, 1.8 * u);
    p.poly([[kx - 3.4 * u, ky + 4 * u], [kx + 3.4 * u, ky + 4 * u], [kx + 7 * u + sw * u, ky + 0.5 * HH], [kx + 1 * u + sw * u, ky + 0.58 * HH], [kx - 5 * u + sw * u, ky + 0.5 * HH]], O.tie, 1.8 * u);
    p.stroke([[kx - 1 * u, ky + 10 * u], [kx + 3 * u + sw * u, ky + 0.45 * HH]], 1.4 * u, mul(O.tie, [1.2, 1.15, 1.15])); }
  if (O.backpack) for (const s of [-1, 1]) p.band([[tcx + s * 0.6 * T.a, chin + 0.02 * HH], [tcx + s * 0.72 * T.a, torsoBot - 0.22 * HH]], O.backpack, 5 * u, 1.2 * u, "round");
  for (const a of arms) if (a.front && !a.late) drawArm(a);
  if (O.top === "labcoat") for (const a of arms) if (a.late) drawArm(a);
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : (cpx !== cx || cpy !== chin ? [0, cx, chin, cpx - cx, cpy - chin] : null);
  p.dot(cx, chin + 2 * u, 9 * u, mul(skin, SH_SKIN));
  hairBack(p, O, H, cx, hc, u, light, thick);
  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hairFront(p, O, H, cx, hc, u, light, thick, seed);
  if (O.beard) beardOn(p, O, H, cx, hc, u, light, thick, seed);
  faceM(p, cx, hc, W, expr, look, lookY, lid, { skin, brim: !!O.helmet, moustache: O.moustache, browCol: O.hairStyle === "bald" ? "#6d6d6d" : O.hairStyle === "bun" ? "#9a9088" : INK });
  if (O.glasses) glassesOn(p, O, cx, hc, u, H);
  if (O.headphones) headphonesOn(p, O, H, cx, hc, u, light, thick);
  if (O.helmet) helmetOn(p, O, H, cx, hc, u, light, thick);
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  for (const a of arms) if (a.over) drawArm(a);
  p.rot = null; p.ol = ol0;
};
/** world-space helper: design-space point of a held fingertip for "press" pose (for pinning cards) */
export const castHead = (seed = 3, seated = false) => { const H = headBlob(seed, 118, 0), HH = 2 * H.b; return (seated ? 975 - 1.02 * HH : 975 - 1.38 * HH) - 1.08 * HH - H.b; };

// ---------------- close-up hand card (finger on a button / key in a keyhole) ----------------
/** draws a forearm from the left edge with the fingertip at (460, 500). opts: sleeve, skin, stripe, key, keyTurn, curl */
export const handCard = (p, o = {}) => {
  const { sleeve = "#a9d0f5", skin = "#f5c9a0", stripe = false, key = false, keyTurn = 0, bend = 0, cuff = null } = o;
  const ol0 = p.ol; p.ol = 5;
  const tipX = 460, tipY = 500;
  // sleeve
  const sl = [[-40, 430], [300, 446], [306, 556], [-40, 590]];
  p.gradFill(sl, sleeve, mul(sleeve, SH_CLOTH), rad(-110)); p.poly(sl, null, 7);
  if (stripe) { p.poly([[150, 438], [196, 440], [200, 568], [154, 574]], "#e7ef5a", 4); p.poly([[166, 439], [180, 439], [184, 570], [170, 572]], "#dfe6ea", 0); }
  p.poly([[262, 442], [306, 446], [312, 558], [266, 562]], cuff || mul(sleeve, [0.92, 0.94, 0.97]), 6);
  if (!cuff) p.dot(288, 520, 6, "#ffffff");
  // palm + curled fingers
  const palm = blobPts(352, 512, { a: 56, b: 50, nTop: 2.2, nBot: 2.2, egg: 0.05, asym: 0.06, rot: 0, noise: 0.01, seed: 5 }, 48);
  p.shadedFill(palm, skin, mul(skin, SH_SKIN), rad(-120), 56); p.inkRing(palm, 7, 0);
  for (let i = 0; i < 3; i++) { const y = 528 + i * 20 - bend * 4; p.ell(398 - i * 6, y, 24, 12, skin, 5); }
  if (key) {
    // pinched key pointing right
    p.ell(400, 492, 22, 13, skin, 5);
    propKey(p, 418, 496, 3.2, 1, 0, keyTurn, 1.4);
    p.ell(392, 478, 26, 14, skin, 5); // thumb over the bow
  } else {
    p.line([[392, 494 + bend * 6], [tipX - 8, tipY]], skin, 26, true);
    p.ell(tipX - 9, tipY, 15, 13, skin, 0);
    p.stroke(ellPts(tipX - 14, tipY, 6, 7, 270, 450, 0, 10), 2.4, mul(skin, [0.85, 0.75, 0.72])); // nail hint
    p.ell(374, 470, 30, 14, skin, 5, 0, 360, -12); // thumb
  }
  p.ol = ol0;
};

// ---------------- brain character (lab) ----------------
export const brainCard = (p, o = {}) => {
  const { expr = "excited", wheel = 0, blink = 0, look = 0, bounce = 0, hands = true } = o;
  const ol0 = p.ol; p.ol = 5;
  const cx = 300, cy = 470 - bounce * 30, a = 200, b = 160, light = rad(-120), thick = thickAngle(light);
  // legs
  for (const s of [-1, 1]) { p.line([[cx + s * 50, cy + 120], [cx + s * 66, 820]], "#e88aab", 12, true); p.ell(cx + s * 74, 826, 26, 15, "#ff6f61", 5); }
  // brain
  const bp = blobPts(cx, cy, { a, b, nTop: 1.75, nBot: 2.6, egg: -0.05, asym: 0, rot: 0, noise: 0.02, seed: 9 }, 96).map(([x, y], i) => { const t = i / 96 * Math.PI * 2, k = 1 + 0.03 * Math.abs(Math.sin(9 * t)); return [cx + (x - cx) * k, cy + (y - cy) * k]; });
  p.shadedFill(bp, "#f9b3cb", "#e07fa3", light, a);
  p.clip(bp, () => {
    const fold = "#d8729a";
    for (let k = 0; k < 9; k++) { const y0 = cy - 130 + k * 26, pts = []; for (let i = 0; i <= 20; i++) { const x = cx - 210 + i * 21; pts.push([x, y0 + 12 * Math.sin(i * 1.3 + k * 2.1) + 6 * Math.sin(i * 0.5 + k)]); } p.stroke(pts, 5, fold); }
    const fis = []; for (let i = 0; i <= 12; i++) fis.push([cx + 7 * Math.sin(i * 1.4), cy - 170 + i * 10]); p.stroke(fis, 7, "#c45d86");
    p.ell(cx, cy + 62, 120, 66, "#f9b3cb", 0); // calm face area
    p.stroke(ellPts(cx - 80, cy - 90, 60, 30, 200, 300, 0, 12), 10, "#ffffff70");
  });
  p.inkRing(bp, 9, thick);
  // face
  const u = 2.6;
  faceM(p, cx, cy + 40, 260, expr, look, 0, blink, { skin: "#f9b3cb" });
  // arms + toy steering wheel
  const wx = cx, wy = cy + 190, wr = 92;
  if (hands) {
    const hA = [wx + wr * Math.cos(wheel + Math.PI * 1.2), wy + wr * Math.sin(wheel + Math.PI * 1.2)], hB = [wx + wr * Math.cos(wheel - Math.PI * 0.2), wy + wr * Math.sin(wheel - Math.PI * 0.2)];
    p.line(curve([cx - 170, cy + 60], [cx - 200, cy + 170], hA), "#e88aab", 13, true);
    p.line(curve([cx + 170, cy + 60], [cx + 200, cy + 170], hB), "#e88aab", 13, true);
    // wheel
    p.stroke(ellPts(wx, wy, wr, wr), 34, INK); p.stroke(ellPts(wx, wy, wr, wr), 22, "#e8352c");
    p.stroke(ellPts(wx - 10, wy - 10, wr - 4, wr - 4, 190, 260, 0, 10), 6, "#ffffff90");
    for (let k = 0; k < 3; k++) { const ang = wheel + Math.PI / 2 + k * Math.PI * 2 / 3; p.line([[wx, wy], [wx + (wr - 10) * Math.cos(ang), wy + (wr - 10) * Math.sin(ang)]], "#2f7fe0", 14, true); }
    p.ell(wx, wy, 30, 30, "#ffd23f", 6); p.ell(wx, wy, 14, 14, "#ff6f61", 4);
    for (const h of [hA, hB]) p.ell(h[0], h[1], 18, 18, "#f9b3cb", 5);
  }
  p.ol = ol0;
};

// ---------------- 2D fx cards ----------------
const cloudPts = (cx, cy, rx, ry, n = 9, seed = 1) => { const pts = []; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, r = 1 + 0.08 * Math.sin(i * 2.3 + seed); for (let k = 0; k <= 8; k++) { const t = a0 + (a1 - a0) * k / 8, bump = 1 + 0.16 * Math.sin(Math.PI * k / 8); pts.push([cx + rx * r * bump * Math.cos(t), cy + ry * r * bump * Math.sin(t)]); } } return pts; };
/** door-close icon: bar with two triangles pointing at it (▶|◀) */
const closeIcon = (p, x, y, s, col = "#3a3f47") => { p.poly([[x - 2.5 * s, y - 15 * s], [x + 2.5 * s, y - 15 * s], [x + 2.5 * s, y + 15 * s], [x - 2.5 * s, y + 15 * s]], col, 0); for (const d of [-1, 1]) p.poly([[x + d * 5 * s, y], [x + d * 17 * s, y - 10 * s], [x + d * 17 * s, y + 10 * s]], col, 0); };
export const fxThought = (p, t = 1) => {
  const k = Math.min(1, t), sc = k < 1 ? 0.6 + 0.4 * k + 0.12 * Math.sin(k * Math.PI) : 1;
  const g = p.g; g.save(); g.translate(300, 420); g.scale(sc, sc); g.translate(-300, -420);
  for (const [x, y, r] of [[170, 800, 22], [205, 720, 34]]) p.ell(x, y, r, r, "#ffffff", 9);
  const cp = cloudPts(300, 430, 230, 190, 10, 2); p.poly(cp, "#ffffff", 12);
  p.ell(300, 430, 112, 112, "#c3cad2", 9); p.ell(300, 430, 86, 86, "#eef1f4", 7);
  closeIcon(p, 300, 430, 2.6);
  g.restore();
};
export const fxStress = (p, k = 0) => {
  const g = p.g;
  if (k <= 0) { const cp = cloudPts(300, 420, 210, 120, 9, 5); p.poly(cp, "#8c929c", 12); p.poly(cloudPts(300, 400, 150, 70, 7, 3), "#a2a8b2", 0);
    for (let i = 0; i < 5; i++) { const x = 200 + i * 50, y = 560 + (i % 2) * 34; p.poly([[x, y - 22], [x + 11, y + 2], [x, y + 13], [x - 11, y + 2]], "#7fb8ff", 5); } return; }
  g.save(); g.globalAlpha = Math.max(0, 1 - k * 1.1);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, d = 60 + 260 * k, r = 70 * (1 - 0.5 * k); p.ell(300 + Math.cos(a) * d, 420 + Math.sin(a) * d * 0.7, r, r * 0.85, "#d4d8de", 8); }
  g.restore();
};
/** circular x-ray / blueprint lens. kind: 'hourglass' (v = sand left 0..1, t = time), 'wire' (broken, v = swing), 'ok' (connected) */
export const fxXray = (p, kind = "wire", v = 0, t = 0) => {
  const cx = 300, cy = 500, R = 250, g = p.g;
  p.ell(cx, cy, R + 18, R + 18, "#7fd3ff", 16);
  p.clip(ellPts(cx, cy, R, R, 0, 360, 0, 64), () => {
    p.ell(cx, cy, R, R, "#1b4f93", 0);
    for (let i = -6; i <= 6; i++) { p.stroke([[cx + i * 42, cy - R], [cx + i * 42, cy + R]], 2, "#ffffff2a"); p.stroke([[cx - R, cy + i * 42], [cx + R, cy + i * 42]], 2, "#ffffff2a"); }
    if (kind === "hourglass") {
      const top = cy - 170, bot = cy + 170, w = 110, neck = 12;
      const glass = [[cx - w, top], [cx + w, top], [cx + w * 0.9, top + 60], [cx + neck, cy], [cx + w * 0.9, bot - 60], [cx + w, bot], [cx - w, bot], [cx - w * 0.9, bot - 60], [cx - neck, cy], [cx - w * 0.9, top + 60]];
      const up = Math.max(0, Math.min(1, v)), sTop = cy - 18 - 120 * up, pile = 140 * (1 - up);
      p.clip(glass, () => {
        p.poly([[cx - w, sTop], [cx + w, sTop], [cx + w, cy], [cx - w, cy]], "#ffd36b", 0);
        p.poly([[cx - w, bot], [cx + w, bot], [cx + w, bot - pile * 0.45], [cx, bot - pile], [cx - w, bot - pile * 0.45]], "#ffd36b", 0);
      });
      if (up > 0.01) for (let i = 0; i < 6; i++) p.dot(cx + Math.sin(t * 20 + i) * 2, cy + 8 + ((t * 300 + i * 26) % (170 - pile * 0.8)), 5, "#ffd36b");
      p.poly(glass, "#ffffff22", 0); p.stroke([...glass, glass[0]], 7, "#e8f6ff");
      for (const y of [top - 14, bot + 14]) p.poly(rrect(cx - w - 24, y - 14, cx + w + 24, y + 14, 6), "#9fd8ff", 5);
    } else {
      const bx = cx - 40, by = cy - 40;
      p.poly(rrect(cx - 170, cy - 150, cx + 150, cy + 190, 18), "#ffffff18", 0); p.stroke([...rrect(cx - 170, cy - 150, cx + 150, cy + 190, 18)], 5, "#e8f6ff");
      p.ell(bx, by, 62, 62, "#bfe6ff", 6); p.ell(bx, by, 40, 40, "#e8f6ff", 4);
      if (kind === "ok") { p.stroke(curve([bx + 50, by + 30], [cx + 120, cy + 40], [cx + 120, cy + 260]), 16, "#3ccf62"); }
      else {
        const a = 0.35 * Math.sin(v), px = bx + 46, py = by + 46, L = 150;
        const ex = px + Math.sin(a) * L * 0.3, ey = py + L;
        p.stroke(curve([px, py], [px + 20 + Math.sin(a) * 40, py + L * 0.55], [ex + Math.sin(a) * 60, ey]), 16, INK); p.stroke(curve([px, py], [px + 20 + Math.sin(a) * 40, py + L * 0.55], [ex + Math.sin(a) * 60, ey]), 10, "#ff4d4d");
        p.ell(ex + Math.sin(a) * 60, ey + 10, 9, 14, "#f0a050", 3);
        p.stroke([[cx + 140, cy + 260], [cx + 110, cy + 120]], 16, INK); p.stroke([[cx + 140, cy + 260], [cx + 110, cy + 120]], 10, "#ff4d4d"); p.ell(cx + 108, cy + 110, 9, 14, "#f0a050", 3);
        for (const [x, y] of [[ex + Math.sin(a) * 60, ey + 30], [cx + 106, cy + 88]]) for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI * 2 + v; p.stroke([[x + 8 * Math.cos(an), y + 8 * Math.sin(an)], [x + 20 * Math.cos(an), y + 20 * Math.sin(an)]], 4, "#ffd23f"); }
      }
    }
  });
  p.ell(cx, cy, R, R, null, 10);
  p.stroke(ellPts(cx, cy, R - 30, R - 30, 200, 250, 0, 12), 10, "#ffffff55");
};
export const fxPuffSoft = (p, k = 0, col = "#ffffff") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, Math.min(1, 1.2 - k * 1.1)) * 0.9;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + k, r = 110 + 60 * k; p.ell(300 + Math.cos(a) * 70 * (1 + k), 600 - k * 120 + Math.sin(a) * 50, r, r * 0.8, col, 0); }
  p.ell(300, 600 - k * 120, 160 + 60 * k, 130 + 40 * k, col, 0);
  g.restore();
};
/** speed / motion lines */
export const fxSpeed = (p, k = 0) => { const g = p.g; g.save(); g.globalAlpha = 0.85; for (let i = 0; i < 6; i++) { const y = 300 + i * 90, x = 80 + ((i * 53 + k * 400) % 180); p.stroke([[x, y], [x + 140 + (i % 3) * 40, y]], 10, "#ffffff"); } g.restore(); };
/** small sparkle (key glint, ding) */
export const fxSpark = (p, k = 0) => { const s = Math.sin(Math.PI * Math.min(1, k)), g = p.g; if (s <= 0) return; g.save(); g.translate(300, 500); g.scale(s, s); g.rotate(k); p.poly([[0, -150], [26, -26], [150, 0], [26, 26], [0, 150], [-26, 26], [-150, 0], [-26, -26]], "#fffbe0", 10); g.restore(); };
/** bounce / impact lines around a point (door slam) */
export const fxBang = (p, k = 0) => { const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r0 = 120 + 160 * k, r1 = r0 + 90; p.stroke([[300 + Math.cos(a) * r0, 500 + Math.sin(a) * r0], [300 + Math.cos(a) * r1, 500 + Math.sin(a) * r1]], 14, "#ffffff"); } g.restore(); };
