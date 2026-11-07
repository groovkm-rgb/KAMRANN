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
// 1920s cast for "Der Mann, der den Eiffelturm verkaufte" (our own designs, no real people)
// =====================================================================================
const GOLD = "#d8b04a", SILVER = "#c9ced6";
export const CAST = {
  // the con man: tall, thin, slick black hair, pencil moustache, navy three-piece, burgundy tie, white pocket square, watch chain, black fedora
  con: { build: "tall", suit: "#22305a", pants: "#1d2850", vest: "#1b2547", shirt: "#f7f2e6", tie: "#7d1f2e", pocket: "#ffffff", chain: true,
    hat: "fedora", hatCol: "#18171d", band: "#3a3540", hair: "slick", hairCol: "#120f18", stache: "pencil", stacheCol: "#120f18", skin: "#f3d3b3", shoes: "#141016" },
  prisoner: { build: "tall", suit: "stripes", pants: "stripes", shirt: null, hat: null, hair: "slick", hairCol: "#120f18", stache: "pencil", stacheCol: "#120f18", skin: "#efd0b0", shoes: "#2a2622" },
  // first victim: short, round, red cheeks, sweaty, thick moustache, too-tight brown suit, bowler, ring
  dealer: { build: "stout", suit: "#7a4b2a", pants: "#6a4024", vest: "#8c5a32", shirt: "#f2e8d2", tie: "#2f5240", hat: "bowler", hatCol: "#2b1f18", band: "#1a1310",
    hair: "none", stache: "walrus", stacheCol: "#5a3622", skin: "#f7c6a2", cheeks: true, ring: true, tight: true, shoes: "#2a1a10", nose: "round" },
  d2: { build: "skinny", suit: "#4f5b3c", pants: "#444f33", shirt: "#efe6d0", tie: "#8a6a2a", hat: "fedora", hatCol: "#5b4733", band: "#2c2219", hair: "none", skin: "#f1cfae", shoes: "#2a1a10" },
  d3: { build: "big", suit: "#3b3a46", pants: "#33323d", shirt: "#ede5d3", tie: "#6b2430", hat: "boater", hatCol: "#e2c27c", band: "#3a2a4a", hair: "none", skin: "#d9a07a", shoes: "#1a1416", jowl: true },
  d4: { build: "normal", suit: "#5e3c4c", pants: "#523443", shirt: "#f0e6d4", tie: "#2b3d5a", hat: "bowler", hatCol: "#6a6460", band: "#2c2826", hair: "none", skin: "#f3d7c0",
    whiskers: "#ece7df", brows: "#ece7df", stache: "walrus", stacheCol: "#ece7df", shoes: "#2a1a10" },
  d5: { build: "normal", suit: "#2f4b5c", pants: "#29414f", shirt: "#f0e9d8", tie: "#a0522d", hat: "fedora", hatCol: "#3c2c22", band: "#1b1410", hair: "none", skin: "#f5d3b8", glasses: true, shoes: "#1c1410" },
  // second victim: tall, skinny, sharp nose, pointed goatee, grey suit, short temper
  victim2: { build: "skinny", suit: "#7c7f87", pants: "#6c6f77", vest: "#6a6d75", shirt: "#f2efe8", tie: "#3a3a52", hat: "fedora", hatCol: "#55575e", band: "#2a2b30", hair: "none",
    skin: "#efd2b6", goatee: "#3a2c24", stache: "pencil", stacheCol: "#3a2c24", nose: "sharp", shoes: "#18161a" },
  // extra dealers for the second round (recoloured silhouettes)
  e1: { build: "big", suit: "#5a3a26", pants: "#4c3020", shirt: "#efe4cc", tie: "#284a3a", hat: "bowler", hatCol: "#1e1a18", band: "#121010", hair: "none", skin: "#e8b48c", stache: "walrus", stacheCol: "#2a1c14", shoes: "#1a1210" },
  e2: { build: "normal", suit: "#3f4f3a", pants: "#36442f", shirt: "#efe8d6", tie: "#7a2a2a", hat: "boater", hatCol: "#dcbc78", band: "#7a1f2e", hair: "none", skin: "#f3d0b0", glasses: true, shoes: "#1c1410" },
  e3: { build: "stout", suit: "#4a4458", pants: "#3e394a", shirt: "#f0e6d4", tie: "#b07a2a", hat: "fedora", hatCol: "#2e2a26", band: "#121010", hair: "none", skin: "#f6caa8", whiskers: "#6a5040", cheeks: true, shoes: "#1c1410" },
  // French gendarme: kepi, dark blue cape, moustache, whistle
  gend: { build: "normal", suit: "#1f2b55", pants: "#1a2140", cape: "#17204a", shirt: null, hat: "kepi", hatCol: "#1a2244", band: SILVER, hair: "none", stache: "handle", stacheCol: "#3a2618",
    skin: "#f2cfae", shoes: "#0f0d10", uniform: true, buttons: SILVER },
  gend2: { build: "stout", suit: "#1f2b55", pants: "#1a2140", cape: "#17204a", shirt: null, hat: "kepi", hatCol: "#1a2244", band: SILVER, hair: "none", stache: "walrus", stacheCol: "#2a1c14",
    skin: "#eebf9c", shoes: "#0f0d10", uniform: true, buttons: SILVER, cheeks: true },
  // hotel bellboy: red uniform, round pillbox hat
  bell: { build: "short", suit: "#b3262c", pants: "#8f1e24", shirt: null, hat: "pillbox", hatCol: "#b3262c", band: GOLD, hair: "none", skin: "#f6d4b4", uniform: true, buttons: GOLD, double: true, shoes: "#141016" },
  // American prison guard: grey uniform, cap, hard face
  guard: { build: "big", suit: "#6e7378", pants: "#5d6166", shirt: null, hat: "peaked", hatCol: "#5d6268", band: "#3a3e43", hair: "none", skin: "#e6b896", stache: null, uniform: true, buttons: "#c9b46a",
    belt: "#2a2a2c", badge: GOLD, shoes: "#111012", jowl: true },
  // café waiter in the background
  waiter: { build: "normal", suit: "#141418", pants: "#141418", vest: "#141418", shirt: "#f7f4ee", tie: "#141418", apron: "#f4f1ea", hat: null, hair: "slick", hairCol: "#2a2018", stache: "pencil", stacheCol: "#2a2018", skin: "#f1cfae", shoes: "#0e0c0e" },
};
const BUILD20 = {
  tall: { legs: 1.62, torso: 1.12, w: 0.39, stout: false },
  normal: { legs: 1.34, torso: 1.06, w: 0.43, stout: false },
  skinny: { legs: 1.56, torso: 1.12, w: 0.33, stout: false },
  stout: { legs: 1.0, torso: 1.0, w: 0.6, stout: true },
  big: { legs: 1.26, torso: 1.16, w: 0.6, stout: true },
  short: { legs: 1.0, torso: 0.95, w: 0.4, stout: false },
};
// expressions with per-side eyes and brows: brow [inner, outer] offsets in u (+ = down)
const F20 = {
  neutral: { eye: ["dot", "dot"], brow: [[0, -1], [0, -1]], mouth: "dash" },
  sly: { eye: ["lid", "dot"], brow: [[3, 0], [-6, -10]], mouth: "smirk" },
  smirk: { eye: ["dot", "dot"], brow: [[1, -1], [-2, -5]], mouth: "smirk" },
  grin: { eye: ["happy", "happy"], brow: [[-3, -3], [-3, -3]], mouth: "grin" },
  wink: { eye: ["dot", "happy"], brow: [[-1, -6], [2, -1]], mouth: "smirk" },
  idea: { eye: ["shock", "shock"], brow: [[-5, -8], [-5, -8]], mouth: "smirk" },
  shock: { eye: ["shock", "shock"], brow: [[-7, -6], [-7, -6]], mouth: "O" },
  stern: { eye: ["lid", "lid"], brow: [[4, -2], [4, -2]], mouth: "frown" },
  angry: { eye: ["lid", "lid"], brow: [[8, -3], [8, -3]], mouth: "teeth" },
  suspicious: { eye: ["slit", "slit"], brow: [[5, -1], [2, -5]], mouth: "frown" },
  frown: { eye: ["dot", "dot"], brow: [[5, -2], [5, -2]], mouth: "frown" },
  think: { eye: ["dot", "dot"], brow: [[3, -2], [-3, -7]], mouth: "dash" },
  sheepish: { eye: ["small", "small"], brow: [[-5, 2], [-5, 2]], mouth: "wave" },
  eager: { eye: ["dot", "dot"], brow: [[-5, -6], [-5, -6]], mouth: "smileWide" },
  happy: { eye: ["happy", "happy"], brow: [[-3, -2], [-3, -2]], mouth: "smileWide" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [[-4, -4], [-4, -4]], mouth: "laugh" },
  nervous: { eye: ["small", "small"], brow: [[-3, 2], [-3, 2]], mouth: "wave" },
  ashamed: { eye: ["squeeze", "squeeze"], brow: [[-5, 3], [-5, 3]], mouth: "wave" },
  sad: { eye: ["lid", "lid"], brow: [[-5, 3], [-5, 3]], mouth: "frown" },
  whisper: { eye: ["lid", "dot"], brow: [[3, -1], [-4, -8]], mouth: "o" },
  shh: { eye: ["lid", "lid"], brow: [[2, -2], [-4, -8]], mouth: "dash" },
  sleepy: { eye: ["dash", "dash"], brow: [[0, -1], [0, -1]], mouth: "smile" },
  smile: { eye: ["dot", "dot"], brow: [[0, -2], [0, -2]], mouth: "smile" },
  whistle: { eye: ["lid", "lid"], brow: [[4, -3], [4, -3]], mouth: "o" },
};
const face20 = (p, O, cx, cy, W, expr, facing, look, lid, brim) => {
  const u = W / 100, F = F20[expr] || F20.neutral, fx = cx + 7 * u * facing, skin = O.skin;
  if (O.cheeks || expr === "ashamed") for (const s of [-1, 1]) p.ell(fx + s * 25 * u, cy + 13 * u, 9 * u, 6 * u, expr === "ashamed" ? "#e8676a" : "#f08e86", 0);
  if (O.whiskers) for (const s of [-1, 1]) p.poly([[cx + s * 46 * u, cy - 20 * u], [cx + s * 40 * u, cy - 18 * u], [cx + s * 36 * u, cy + 8 * u], [cx + s * 28 * u, cy + 26 * u], [cx + s * 38 * u, cy + 30 * u], [cx + s * 47 * u, cy + 12 * u]], O.whiskers, 2.2 * u);
  for (const side of [-1, 1]) {
    const x = fx + side * 13 * u, idx = side < 0 ? 0 : 1;
    const kind = eyeKind(F.eye[idx], lid);
    eye(p, kind, x, cy, u, side, look, skin);
    const [dI, dO] = F.brow[idx], by = cy - (brim ? 18 : 20) * u, bc = O.brows || INK;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u + (F.brow[idx][1] + 6) * 0.5 * u, 9 * u, 3 * u, 200, 340, 4 * u, bc);
    else taper(p, [x - side * 8.5 * u, by + dI * u], [x + side * 8.5 * u, by + dO * u], 5 * u, 2.5 * u, bc);
  }
  if (O.glasses) { for (const s of [-1, 1]) p.ell(fx + s * 13 * u, cy, 12 * u, 11 * u, "rgba(220,235,255,0.18)", 2.6 * u); p.stroke([[fx - 2 * u, cy - 2 * u], [fx + 2 * u, cy - 2 * u]], 2.4 * u); }
  const mx = cx + 8 * u * facing, my = cy + 21 * u;
  if (O.nose === "round") p.ell(fx + u, cy + 9 * u, 6.5 * u, 5.5 * u, mul(skin, [0.98, 0.78, 0.74]), 2.4 * u);
  if (O.nose === "sharp") p.poly([[fx - 3 * u, cy - 2 * u], [fx + 9 * u * (facing >= 0 ? 1 : -1), cy + 12 * u], [fx - 2 * u, cy + 12 * u]], mul(skin, [0.95, 0.88, 0.86]), 2.2 * u);
  if (O.goatee) p.poly([[mx - 7 * u, my + 9 * u], [mx + 7 * u, my + 9 * u], [mx, my + 30 * u]], O.goatee, 2.2 * u);
  mouth(p, F.mouth, mx, my, u);
  const sc = O.stacheCol || INK;
  if (O.stache === "pencil") for (const s of [-1, 1]) taper(p, [mx + s * 1.5 * u, cy + 14 * u], [mx + s * 13 * u, cy + 13.5 * u], 2.6 * u, 1.2 * u, sc);
  if (O.stache === "walrus") for (const s of [-1, 1]) p.poly([[mx, cy + 10 * u], [mx + s * 16 * u, cy + 10 * u], [mx + s * 19 * u, cy + 21 * u], [mx + s * 8 * u, cy + 16 * u], [mx, cy + 15 * u]], sc, 2 * u);
  if (O.stache === "handle") for (const s of [-1, 1]) { taper(p, [mx + s * 1.5 * u, cy + 13 * u], [mx + s * 15 * u, cy + 13 * u], 5 * u, 2.4 * u, sc); p.stroke([[mx + s * 15 * u, cy + 13 * u], [mx + s * 20 * u, cy + 9 * u], [mx + s * 18 * u, cy + 5 * u]], 2.4 * u, sc); }
  if (O.sweat || expr === "nervous" || expr === "sheepish") { p.ell(cx + 40 * u * (facing || 1), cy - 24 * u, 3.2 * u, 5.5 * u, "#a9dcff", 1.8 * u); }
};
const stripeClip = (p, pts, y0, y1, w) => p.clip(pts, () => { for (let y = y0; y < y1; y += 2 * w) p.poly([[0, y], [600, y], [600, y + w], [0, y + w]], "#2a2a30", 0); });
/** hats: base line yb (just above the brows) */
const hat20 = (p, O, cx, hc, H, u, light, back = false) => {
  const HH = 2 * H.b, a = H.a, col = O.hatCol, dk = mul(col, SH_FELT), ow = 4.2 * u, yb = hc - 0.6 * H.b;
  switch (O.hat) {
    case "fedora": {
      p.ell(cx, yb, 1.3 * a, 0.075 * HH, mul(col, [0.85, 0.85, 0.9]), ow);
      const cr = [[cx - 0.8 * a, yb], [cx - 0.76 * a, yb - 0.3 * HH], [cx - 0.5 * a, yb - 0.4 * HH], [cx - 0.12 * a, yb - 0.37 * HH], [cx, yb - 0.31 * HH], [cx + 0.12 * a, yb - 0.37 * HH], [cx + 0.5 * a, yb - 0.4 * HH], [cx + 0.76 * a, yb - 0.3 * HH], [cx + 0.8 * a, yb]];
      p.gradFill(cr, col, dk, light); p.clip(cr, () => { p.poly([[cx - a, yb - 0.11 * HH], [cx + a, yb - 0.11 * HH], [cx + a, yb], [cx - a, yb]], O.band, 0); if (!back) p.stroke([[cx, yb - 0.3 * HH], [cx + 3 * u, yb - 0.14 * HH]], 2 * u, dk); });
      p.poly(cr, null, ow);
      p.ell(cx, yb, 1.3 * a, 0.075 * HH, mul(col, [0.85, 0.85, 0.9]), ow, 0, 180);
      p.stroke(ellPts(cx - 0.4 * a, yb - 0.3 * HH, 0.22 * a, 0.05 * HH, 200, 300, 0, 10), 2.6 * u, "#ffffff40");
      break;
    }
    case "bowler": {
      const dome = ellPts(cx, yb + 0.02 * HH, 0.86 * a, 0.42 * HH, 180, 360, 0, 40);
      p.shadedFill(dome, col, dk, light, a, 0.4); p.clip(dome, () => p.poly([[cx - a, yb - 0.09 * HH], [cx + a, yb - 0.09 * HH], [cx + a, yb + 0.05 * HH], [cx - a, yb + 0.05 * HH]], O.band, 0));
      p.poly(dome, null, ow);
      p.ell(cx, yb + 0.02 * HH, 1.06 * a, 0.055 * HH, mul(col, [0.85, 0.85, 0.9]), ow, 0, 180);
      p.stroke(ellPts(cx - 0.35 * a, yb - 0.24 * HH, 0.25 * a, 0.08 * HH, 200, 290, 0, 10), 3 * u, "#ffffff55");
      break;
    }
    case "boater": {
      p.ell(cx, yb, 1.22 * a, 0.07 * HH, col, ow);
      const cr = rrect(cx - 0.78 * a, yb - 0.24 * HH, cx + 0.78 * a, yb, 3 * u);
      p.gradFill(cr, col, mul(col, [0.8, 0.76, 0.7]), light); p.clip(cr, () => p.poly([[cx - a, yb - 0.12 * HH], [cx + a, yb - 0.12 * HH], [cx + a, yb], [cx - a, yb]], O.band, 0)); p.poly(cr, null, ow);
      p.ell(cx, yb - 0.24 * HH, 0.78 * a, 0.035 * HH, mul(col, [1.05, 1.03, 1]), ow);
      p.ell(cx, yb, 1.22 * a, 0.07 * HH, col, ow, 0, 180);
      break;
    }
    case "kepi": {
      const cr = [[cx - 0.74 * a, yb + 0.02 * HH], [cx - 0.82 * a, yb - 0.34 * HH], [cx + 0.82 * a, yb - 0.4 * HH], [cx + 0.74 * a, yb + 0.02 * HH]];
      p.gradFill(cr, col, dk, light); p.clip(cr, () => { p.poly([[cx - a, yb - 0.06 * HH], [cx + a, yb - 0.06 * HH], [cx + a, yb - 0.03 * HH], [cx - a, yb - 0.03 * HH]], O.band, 0); p.poly([[cx - a, yb - 0.3 * HH], [cx + a, yb - 0.36 * HH], [cx + a, yb - 0.33 * HH], [cx - a, yb - 0.27 * HH]], O.band, 0); });
      p.poly(cr, null, ow); p.ell(cx, yb - 0.37 * HH, 0.82 * a, 0.05 * HH, mul(col, [1.2, 1.2, 1.25]), ow, 0, 360, -2);
      if (!back) { p.ell(cx, yb + 0.02 * HH, 0.8 * a, 0.09 * HH, "#0e0d12", ow, 0, 180); p.dot(cx, yb - 0.18 * HH, 4 * u, O.band); }
      break;
    }
    case "pillbox": {
      const cr = rrect(cx - 0.5 * a + 8 * u, yb - 0.2 * HH, cx + 0.5 * a + 8 * u, yb - 0.02 * HH, 3 * u);
      p.gradFill(cr, col, dk, light); p.clip(cr, () => { p.poly([[0, yb - 0.08 * HH], [600, yb - 0.08 * HH], [600, yb - 0.05 * HH], [0, yb - 0.05 * HH]], O.band, 0); }); p.poly(cr, null, ow);
      p.ell(cx + 8 * u, yb - 0.2 * HH, 0.5 * a, 0.04 * HH, mul(col, [1.15, 1.1, 1.1]), ow);
      break;
    }
    case "peaked": {
      const bandP = rrect(cx - 0.8 * a, yb - 0.14 * HH, cx + 0.8 * a, yb + 0.02 * HH, 3 * u);
      const top = ellPts(cx, yb - 0.16 * HH, 1.0 * a, 0.12 * HH, 0, 360, 0, 40);
      p.gradFill(bandP, O.band, mul(O.band, SH_FELT), light); p.poly(bandP, null, ow);
      p.shadedFill(top, col, dk, light, a, 0.4); p.poly(top, null, ow);
      if (!back) { p.ell(cx, yb + 0.02 * HH, 0.82 * a, 0.1 * HH, "#141416", ow, 0, 180);
        const s = [], bx = cx, by = yb - 0.07 * HH; for (let i = 0; i < 10; i++) { const r = (i % 2 ? 5 : 11) * u, an = -Math.PI / 2 + i * Math.PI / 5; s.push([bx + Math.cos(an) * r, by + Math.sin(an) * r]); } p.poly(s, O.badge || GOLD, 1.8 * u); }
      break;
    }
  }
};
const hair20 = (p, O, cx, hc, H, u, light, back) => {
  if (O.hair !== "slick") return;
  const hb = blobPts(cx, hc - 0.02 * 2 * H.b, { ...H, a: H.a * 1.05, b: H.b * 1.06 });
  const cut = back ? hc + 0.55 * H.b : hc - 0.5 * H.b;
  const arc = hb.filter(([x, y]) => y < cut);
  if (arc.length < 3) return;
  if (!back) { // hairline dips to a slight widow's peak; sideburns
    arc.sort((a, b) => Math.atan2(a[1] - hc, a[0] - cx) - Math.atan2(b[1] - hc, b[0] - cx));
    arc.push([cx + 0.5 * H.a, cut + 0.02 * H.b], [cx, cut + 0.12 * H.b], [cx - 0.5 * H.a, cut + 0.02 * H.b]);
    for (const s of [-1, 1]) p.poly([[cx + s * 0.97 * H.a, cut - 0.05 * H.b], [cx + s * 0.88 * H.a, cut], [cx + s * 0.9 * H.a, hc + 0.05 * H.b], [cx + s * 1.0 * H.a, hc]], O.hairCol, 0);
  }
  p.shadedFill(arc, O.hairCol, mul(O.hairCol, [0.7, 0.7, 0.8]), light, H.a, 0.35); p.poly(arc, null, 4 * u);
  for (let i = -2; i <= 2; i++) p.stroke(ellPts(cx + i * 15 * u, hc - 0.35 * H.b, 0.22 * H.a, 0.6 * H.b, 235, 295, 0, 10), 1.4 * u, "#3b3550");
  p.stroke(ellPts(cx - 0.25 * H.a, hc - 0.55 * H.b, 0.32 * H.a, 0.32 * H.b, 205, 285, 0, 12), 5 * u, "#ffffff70");
};
/** tower drawing: curved legs, base arch, two platforms, mast (reads as a picture, not a glyph) */
export const towerSketch = (p, x, y, h, col = "#3a2e22", rust = true) => {
  const L = [], R_ = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12, yy = y - t * h * 0.9, ww = h * 0.3 * Math.pow(1 - t, 2.2) + h * 0.012; L.push([x - ww, yy]); R_.push([x + ww, yy]); }
  const sil = [...L, [x, y - h], ...R_.reverse()];
  p.poly(sil, col, 0);
  // base arch cut-out and platform bands
  const aw = h * 0.2, ah = h * 0.14; p.poly(ellPts(x, y, aw, ah, 180, 360, 0, 16), "#d8ccb0", 0);
  for (const [t, wk] of [[0.22, 1.25], [0.5, 1.2]]) { const yy = y - t * h * 0.9, ww = (h * 0.3 * Math.pow(1 - t, 2.2) + h * 0.012) * wk; p.poly([[x - ww, yy - h * 0.018], [x + ww, yy - h * 0.018], [x + ww, yy + h * 0.018], [x - ww, yy + h * 0.018]], col, 0); }
  // lattice hatching
  for (let i = 1; i < 10; i++) { const t = i / 11, yy = y - t * h * 0.88, ww = h * 0.3 * Math.pow(1 - t, 2.2); p.stroke([[x - ww * 0.8, yy], [x + ww * 0.8, yy - h * 0.04]], h * 0.008, "#d8ccb0"); }
  if (rust) { p.ell(x - h * 0.12, y - h * 0.12, h * 0.04, h * 0.025, "#a5562a", 0); p.ell(x + h * 0.05, y - h * 0.4, h * 0.03, h * 0.02, "#a5562a", 0); }
};
/** held props, drawn in card space (hx, hy = hand centre) */
const prop20 = (p, kind, hx, hy, u, light, k = 0) => {
  switch (kind) {
    case "paper": { // big open broadsheet held at chest: grey lines + a tower sketch, no letters
      const w = 118 * u * 0.5, h = 92 * u * 0.5, pts = [[hx - w, hy - h], [hx, hy - h + 6 * u], [hx + w, hy - h], [hx + w, hy + h], [hx, hy + h + 6 * u], [hx - w, hy + h]];
      p.gradFill(pts, "#efe6cf", "#cdbf9f", light); p.poly(pts, null, 3.6 * u);
      p.stroke([[hx, hy - h + 6 * u], [hx, hy + h + 6 * u]], 1.6 * u, "#9a8c70");
      for (let i = 0; i < 9; i++) { const y = hy - h + 14 * u + i * 9 * u; p.stroke([[hx - w + 6 * u, y], [hx - 6 * u, y + 1 * u]], 2.2 * u, i === 0 ? "#6d6455" : "#a69a82"); }
      for (let i = 0; i < 9; i++) { const y = hy - h + 50 * u + i * 4.6 * u; if (y < hy + h - 4 * u) p.stroke([[hx + 6 * u, y], [hx + w - 6 * u, y]], 1.6 * u, "#a69a82"); }
      const bx0 = hx + 6 * u, by0 = hy - h + 10 * u, bx1 = hx + w - 6 * u, by1 = hy - h + 46 * u; // picture box
      p.poly([[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], "#d8ccb0", 1.2 * u);
      towerSketch(p, (bx0 + bx1) / 2, by1 - 2 * u, (by1 - by0) * 0.9, "#4a3c2e");
      break;
    }
    case "doc": { // official paper: lines, red wax seal, signature scribble
      const w = 26 * u, h = 34 * u, pts = rrect(hx - w, hy - h, hx + w, hy + h, 2 * u);
      p.gradFill(pts, "#f4ecd6", "#d8caa6", light); p.poly(pts, null, 3 * u);
      for (let i = 0; i < 6; i++) p.stroke([[hx - w + 6 * u, hy - h + 9 * u + i * 6 * u], [hx + w - 6 * u - (i % 2) * 8 * u, hy - h + 9 * u + i * 6 * u]], 1.5 * u, "#b0a080");
      { const sg = []; for (let i = 0; i <= 40; i++) { const t = i / 40; sg.push([hx - w + 8 * u + t * 24 * u + Math.cos(t * 18) * 3 * u, hy + h - 14 * u + Math.sin(t * 18) * 4 * u - t * 3 * u]); } p.stroke(sg, 1.5 * u, "#2a2a5a"); }
      const sp = []; for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2, r = (i % 2 ? 7.5 : 9) * u; sp.push([hx + w - 12 * u + Math.cos(an) * r, hy + h - 13 * u + Math.sin(an) * r]); }
      p.poly(sp, "#b3202a", 1.8 * u); p.ell(hx + w - 12 * u, hy + h - 13 * u, 4.5 * u, 4.5 * u, "#8e1720", 0);
      break;
    }
    case "envelope": {
      const w = 24 * u, h = 15 * u, pts = rrect(hx - w, hy - h, hx + w, hy + h, 2 * u);
      p.gradFill(pts, "#e9d8ae", "#c4ad7a", light); p.poly(pts, null, 3 * u);
      p.stroke([[hx - w, hy - h], [hx, hy + 2 * u], [hx + w, hy - h]], 2 * u, "#9a8458");
      break;
    }
    case "hanky": p.poly([[hx - 9 * u, hy - 4 * u], [hx + 4 * u, hy - 12 * u], [hx + 12 * u, hy + 2 * u], [hx + 2 * u, hy + 16 * u], [hx - 6 * u, hy + 10 * u]], "#ffffff", 2.4 * u); break;
    case "suitcase": {
      const w = 36 * u, h = 26 * u, top = hy + 6 * u, pts = rrect(hx - w, top, hx + w, top + 2 * h, 5 * u);
      p.stroke([[hx - 8 * u, top], [hx - 8 * u, hy - 2 * u], [hx + 8 * u, hy - 2 * u], [hx + 8 * u, top]], 3.4 * u, "#3a2414");
      p.gradFill(pts, "#8a5a32", "#5a3a20", light); p.poly(pts, null, 3.6 * u);
      for (const s of [-1, 1]) p.poly([[hx + s * 18 * u - 3 * u, top], [hx + s * 18 * u + 3 * u, top], [hx + s * 18 * u + 3 * u, top + 2 * h], [hx + s * 18 * u - 3 * u, top + 2 * h]], "#4a2c16", 1.4 * u);
      for (const s of [-1, 1]) p.dot(hx + s * 18 * u, top + 7 * u, 2.4 * u, GOLD);
      break;
    }
    case "figurine": { // tiny brass tower souvenir
      const s = u * 0.9, b = hy - 4 * u;
      const pts = [[hx - 12 * s, b], [hx - 7 * s, b - 14 * s], [hx - 3 * s, b - 30 * s], [hx - 1 * s, b - 46 * s], [hx, b - 52 * s], [hx + 1 * s, b - 46 * s], [hx + 3 * s, b - 30 * s], [hx + 7 * s, b - 14 * s], [hx + 12 * s, b], [hx + 5 * s, b], [hx, b - 8 * s], [hx - 5 * s, b]];
      p.gradFill(pts, "#e2b65a", "#9a6c2a", light); p.poly(pts, null, 2.2 * u);
      p.stroke([[hx - 8 * s, b - 14 * s], [hx + 8 * s, b - 14 * s]], 1.6 * u); p.stroke([[hx - 4 * s, b - 30 * s], [hx + 4 * s, b - 30 * s]], 1.4 * u);
      p.stroke([[hx - 1.2 * s, b - 44 * s], [hx - 0.6 * s, b - 48 * s]], 1.4 * u, "#fff3c0");
      break;
    }
    case "money": { // fanned notes: only patterns
      for (let i = -2; i <= 2; i++) {
        const an = rad(i * 12), c = Math.cos(an), s_ = Math.sin(an), w = 26 * u, h = 12 * u, cx0 = hx + i * 5 * u, cy0 = hy - 14 * u;
        const R_ = (x, y) => [cx0 + x * c - y * s_, cy0 + x * s_ + y * c];
        p.poly([R_(-w, -h), R_(w, -h), R_(w, h), R_(-w, h)], i % 2 ? "#8fb37a" : "#a3c48c", 2.2 * u);
        p.poly([R_(-w + 4 * u, -h + 3 * u), R_(w - 4 * u, -h + 3 * u), R_(w - 4 * u, h - 3 * u), R_(-w + 4 * u, h - 3 * u)], null, 1 * u);
        const e = ellPts(0, 0, 6 * u, 6 * u, 0, 360, 0, 16).map(([x, y]) => R_(x, y)); p.poly(e, "#6e9a5c", 1 * u);
      }
      break;
    }
    case "note": { const w = 30 * u, h = 15 * u, pts = rrect(hx - w, hy - 2 * h - 6 * u, hx + w, hy - 6 * u, 2 * u); p.poly(pts, "#a3c48c", 2.4 * u); p.poly(rrect(hx - w + 4 * u, hy - 2 * h - 2 * u, hx + w - 4 * u, hy - 10 * u, 2 * u), null, 1.2 * u); p.ell(hx, hy - h - 6 * u, 8 * u, 8 * u, "#6e9a5c", 1.4 * u); for (const s_ of [-1, 1]) p.ell(hx + s_ * 19 * u, hy - h - 6 * u, 4 * u, 4 * u, "#6e9a5c", 1 * u); break; }
    case "whistle": p.poly(rrect(hx - 4 * u, hy - 5 * u, hx + 12 * u, hy + 3 * u, 3 * u), SILVER, 1.8 * u); p.ell(hx + 9 * u, hy - 1 * u, 6 * u, 6 * u, SILVER, 1.8 * u); break;
    case "glass": p.poly([[hx - 8 * u, hy - 14 * u], [hx + 8 * u, hy - 14 * u], [hx + 6 * u, hy + 6 * u], [hx - 6 * u, hy + 6 * u]], "rgba(225,235,245,0.75)", 2 * u); p.poly([[hx - 7 * u, hy - 4 * u], [hx + 7 * u, hy - 4 * u], [hx + 6 * u, hy + 5 * u], [hx - 6 * u, hy + 5 * u]], "#d9a548", 0); break;
  }
};

/** 1920s character, front (or back) view. opts: expr, blink, look, facing, seed, L, R (arm poses), tilt, headTilt, bob, sit, cross,
 *  back, hatOff, hold (prop in R hand), holdL (prop in L hand), step (walk phase), run, squash, light */
export const gentFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? CAST[key] : key, B = BUILD20[O.build || "normal"];
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0, sit = false, cross = false,
    back = false, hatOff = false, hold = null, holdL = null, step = 0, run = false, squash = 0, light = rad(-120), kneel = false, hatDown = 0, holdY = 0.3 } = opts;
  const g = p.g; g.save();
  if (squash) { g.translate(300, 975); g.scale(1 + squash * 0.6, 1 - squash); g.translate(-300, -975); }
  const lid = lidOf(blink), skin = O.skin;
  const H = headBlob(seed, B.stout ? 122 : 118, back ? 0 : facing * 0.6), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const sole = 975, cx = 300, thick = thickAngle(light), ow = 5 * u;
  const seatY = sole - 0.92 * HH; // chair seat (0.46 m)
  const torsoBot = (sit ? seatY - 0.05 * HH : sole - B.legs * HH) - bob * HH, chin = torsoBot - B.torso * HH, hc = chin - H.b, hipY = torsoBot - 0.1 * HH;
  const stripes = O.suit === "stripes", suitC = stripes ? "#efece4" : O.suit, pantsC = O.pants === "stripes" ? "#efece4" : O.pants;
  const sleeve = suitC, armW = (B.stout ? 10 : 8.5) * u;
  // ---- cape behind ----
  if (O.cape) { const cp = [[cx - 0.5 * W, chin + 0.04 * HH], [cx + 0.5 * W, chin + 0.04 * HH], [cx + 0.66 * W, torsoBot + 0.55 * HH], [cx - 0.66 * W, torsoBot + 0.55 * HH]]; p.gradFill(cp, O.cape, mul(O.cape, [0.6, 0.6, 0.7]), light); p.inkRing(cp, ow * 0.8, thick); }
  // ---- legs ----
  const legW = (B.stout ? 13 : 10.5) * u, shoe = O.shoes || INK;
  const legPts = [];
  for (const side of [-1, 1]) {
    const ph = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)));
    const up = step || run ? Math.max(0, ph) * (run ? 55 : 28) * u * 0.4 : 0, fwd = run ? ph * 14 * u : 0;
    const hx = cx + side * (B.stout ? 22 : 15) * u;
    let pts, fx, fy;
    if (sit) {
      const kx = hx + side * 4 * u, ky = seatY + 0.02 * HH;
      if (cross && side > 0) { pts = [[hx, hipY], [cx - 2 * u, ky - 0.1 * HH], [cx - 20 * u, sole - 0.38 * HH]]; fx = cx - 26 * u; fy = sole - 0.36 * HH; }
      else { pts = [[hx, hipY], [kx, ky], [kx + side * 2 * u, sole - 4 * u]]; fx = kx + side * 2 * u; fy = sole - 4 * u; }
    } else if (kneel) { pts = [[hx, hipY], [hx + side * 6 * u, sole - 0.2 * HH], [hx + side * 6 * u, sole - 4 * u]]; fx = hx + side * 6 * u; fy = sole - 4 * u; }
    else { fx = cx + side * (B.stout ? 24 : 18) * u + fwd; fy = sole - 4 * u - up; pts = curve([hx, hipY], [(hx + fx) / 2, (hipY + fy) / 2 - up * 0.3], [fx, fy]); }
    legPts.push({ pts, fx, fy, side });
  }
  const drawLeg = ({ pts, fx, fy, side }) => {
    p.band(pts, pantsC, legW, 2.2 * u, "round");
    if (O.pants === "stripes") for (let k = 1; k < 7; k++) { const t = k / 7, a = pts[0], b = pts[pts.length - 1]; const y = a[1] + (b[1] - a[1]) * t, x = a[0] + (b[0] - a[0]) * t; p.stroke([[x - legW * 0.48, y], [x + legW * 0.48, y]], 3.2 * u, "#2a2a30"); }
    if (O.uniform && !O.pants?.startsWith?.("stri")) p.stroke(pts.map(([x, y]) => [x + side * legW * 0.32, y]), 1.6 * u, O.buttons === GOLD ? GOLD : "#7a3040");
    const sp = ellPts(fx + side * 5 * u, fy + 1 * u, 13 * u, 6.5 * u, 180, 360, 0, 20); sp.push([fx + side * 18 * u, fy + 4 * u], [fx - side * 8 * u, fy + 4 * u]);
    p.poly(sp, shoe, 2.6 * u); p.stroke(ellPts(fx + side * 8 * u, fy - 2 * u, 4 * u, 1.6 * u, 200, 300, 0, 6), 1.6 * u, "#ffffff55");
  };
  // crossed leg is drawn after the other one
  legPts.sort((a, b) => (cross && sit ? (a.side > 0 ? 1 : -1) : 0));
  for (const l of legPts) drawLeg(l);
  // ---- torso ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: B.w * W * (O.tight ? 1.04 : 1), b: 0.5 * (torsoBot - (chin - 0.22 * HH)), nTop: 2.4, nBot: B.stout ? 2.0 : 2.8, egg: B.stout ? 0.2 : 0.1, asym: 0.03 * facing, rot: 0, noise: 0.005, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b + (sit ? 0.06 * HH : 0.1 * HH), tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.84 * T.a, chin + 0.13 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.02 + k * u), ph = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0 : 0.5)));
    switch (pose) {
      case "hip": return { pts: [s, [X(20), s[1] + 0.32 * HH], [tcx + side * T.a * 0.9, torsoBot - 0.28 * HH]] };
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.12 * HH]], finger: true };
      case "up": return { pts: [s, [X(16), s[1] - 0.3 * HH], [X(20), s[1] - 0.78 * HH]] };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 8 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]], open: true };
      case "shh": return { pts: [s, [X(8), s[1] + 0.3 * HH], [cx + side * 3 * u, hc + 0.55 * H.b]], over: true, upFinger: true };
      case "cup": return { pts: [s, [X(14), s[1] + 0.12 * HH], [cx + side * 0.58 * H.a, hc + 0.45 * H.b]], over: true, open: true };
      case "palm": return { pts: [s, [X(10), s[1] + 0.36 * HH], [tcx + side * (T.a + 16 * u), torsoBot - 0.36 * HH]], palm: true };
      case "rub": return { pts: [s, [X(6), s[1] + 0.34 * HH], [tcx + side * 5 * u, chin + 0.46 * HH]], front: true };
      case "face": return { pts: [s, [X(6), s[1] + 0.12 * HH], [cx + side * 0.3 * H.a, hc + 0.12 * H.b]], over: true, big: true };
      case "wipe": return { pts: [s, [X(16), s[1] - 0.05 * HH], [cx + side * 0.35 * H.a, hc - 0.48 * H.b]], over: true, prop: "hanky" };
      case "hold": return { pts: [s, [X(4), s[1] + 0.3 * HH], [tcx + side * 0.5 * W, chin + holdY * HH]], front: true };
      case "holdUp": return { pts: [s, [X(10), s[1] + 0.1 * HH], [X(-4), s[1] - 0.12 * HH]], front: true };
      case "show": return { pts: [s, [X(16), s[1] + 0.05 * HH], [X(24), s[1] - 0.22 * HH]] };
      case "fistUp": return { pts: [s, [X(18), s[1] - 0.25 * HH], [X(12), s[1] - 0.7 * HH]], fist: true };
      case "bang": return { pts: [s, [X(16), s[1] + 0.12 * HH], [X(10), torsoBot - 0.06 * HH]], fist: true, front: true };
      case "tip": return { pts: [s, [X(14), s[1] - 0.18 * HH], [cx + side * 0.75 * H.a, hc - 0.66 * H.b]], over: true };
      case "pocket": return { pts: [s, [X(4), s[1] + 0.34 * HH], [tcx - side * 0.25 * T.a, chin + 0.3 * HH]], front: true };
      case "lapel": return { pts: [s, [X(4), s[1] + 0.3 * HH], [tcx + side * 0.32 * T.a, chin + 0.2 * HH]], front: true };
      case "chin": return { pts: [s, [X(8), s[1] + 0.3 * HH], [cx + side * 0.16 * H.a, hc + 0.85 * H.b]], over: true };
      case "suitcase": return { pts: [s, [X(6), s[1] + 0.45 * HH], [X(8), chin + 1.0 * HH]], prop: "suitcase" };
      case "fig": return { pts: [s, [X(6), s[1] + 0.36 * HH], [tcx + side * 0.35 * T.a, chin + 0.42 * HH]], front: true, prop: "figurine" };
      case "note": { const w = 30 * u, h = 15 * u, pts = rrect(hx - w, hy - 2 * h - 6 * u, hx + w, hy - 6 * u, 2 * u); p.poly(pts, "#a3c48c", 2.4 * u); p.poly(rrect(hx - w + 4 * u, hy - 2 * h - 2 * u, hx + w - 4 * u, hy - 10 * u, 2 * u), null, 1.2 * u); p.ell(hx, hy - h - 6 * u, 8 * u, 8 * u, "#6e9a5c", 1.4 * u); for (const s_ of [-1, 1]) p.ell(hx + s_ * 19 * u, hy - h - 6 * u, 4 * u, 4 * u, "#6e9a5c", 1 * u); break; }
    case "whistle": return { pts: [s, [X(10), s[1] + 0.2 * HH], [cx + side * 6 * u, hc + 0.62 * H.b]], over: true, prop: "whistle" };
      case "run": return { pts: [s, [X(14 + ph * 10), s[1] + 0.2 * HH], [X(10 + ph * 22), s[1] + (0.1 - ph * 0.3) * HH]], fist: true };
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "table": return { pts: [s, [X(6), s[1] + 0.3 * HH], [tcx + side * 0.62 * T.a, torsoBot - 0.12 * HH]], front: true };
      case "shrug": return { pts: [s, [X(24), s[1] + 0.18 * HH], [X(34), s[1] - 0.12 * HH]], open: true };
      case "bars": return { pts: [s, [X(10), s[1] - 0.2 * HH], [X(4), s[1] - 0.48 * HH]], fist: true };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.0 * HH]] };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  arms[0].prop = arms[0].prop || holdL; arms[1].prop = arms[1].prop || hold;
  const drawArm = (a) => {
    p.band(curve(a.pts[0], a.pts[1], a.pts[2]), sleeve, armW, 2.2 * u, "round");
    if (stripes) { const c = curve(a.pts[0], a.pts[1], a.pts[2], 6); for (let i = 1; i < 6; i += 2) p.dot(c[i][0], c[i][1], armW * 0.42, "#2a2a30"); }
    const [hx, hy] = a.pts[2], r = (a.big ? 10 : a.fist ? 7.5 : 7) * u;
    if (O.shirt && !a.big) { const d = [a.pts[2][0] - a.pts[1][0], a.pts[2][1] - a.pts[1][1]], l = Math.hypot(...d) || 1; p.dot(hx - d[0] / l * 7 * u, hy - d[1] / l * 7 * u, armW * 0.5 + u, "#ffffff"); }
    if (a.palm) { p.ell(hx, hy, 11 * u, 6 * u, skin, 2.4 * u); p.stroke([[hx - 6 * u, hy - 1 * u], [hx + 6 * u, hy - 1 * u]], 1.2 * u, mul(skin, SH_SKIN)); }
    else if (a.big) { p.ell(hx, hy, r * 1.1, r * 1.35, skin, 2.6 * u); for (let i = -1; i <= 1; i++) p.stroke([[hx + i * 5 * u, hy - r], [hx + i * 5 * u, hy - r * 0.2]], 1.4 * u); }
    else p.ell(hx, hy, r, r, skin, 2.4 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.band([[hx, hy], [hx + dx / l * 13 * u, hy + dy / l * 13 * u]], skin, 4 * u, 1.6 * u, "round"); }
    if (a.upFinger) p.band([[hx, hy], [hx, hy - 16 * u]], skin, 4.2 * u, 1.6 * u, "round");
    if (a.open) for (let i = -1; i <= 1; i++) p.band([[hx + i * 4 * u, hy - 3 * u], [hx + i * 5.5 * u, hy - 12 * u]], skin, 3.2 * u, 1.2 * u, "round");
    if (O.ring && !a.big) p.dot(hx + 4 * u, hy + 2 * u, 2.6 * u, GOLD);
    if (a.prop) prop20(p, a.prop, a.prop === "paper" ? tcx : hx, hy, u, light, opts.k || 0);
  };
  for (const a of arms) if (!a.front && !a.over) drawArm(a);
  // torso fill
  p.gradFill(tp, suitC, mul(suitC, SH_CLOTH), light);
  p.clip(tp, () => {
    if (stripes) { for (let y = chin - 0.3 * HH; y < torsoBot + 0.3 * HH; y += 9 * u) p.poly([[0, y], [600, y], [600, y + 4.5 * u], [0, y + 4.5 * u]], "#2a2a30", 0); return; }
    const vY = chin + (O.vest ? 0.62 : 0.5) * HH;
    if (back) { p.stroke([[tcx, chin + 0.15 * HH], [tcx, torsoBot + 0.2 * HH]], 1.6 * u, mul(suitC, [0.7, 0.7, 0.75])); return; }
    if (O.uniform) {
      p.poly([[tcx - 10 * u, chin - 0.05 * HH], [tcx + 10 * u, chin - 0.05 * HH], [tcx + 9 * u, chin + 0.07 * HH], [tcx - 9 * u, chin + 0.07 * HH]], mul(suitC, [0.8, 0.8, 0.8]), 1.6 * u);
      for (let i = 0; i < 4; i++) for (const s of O.double ? [-1, 1] : [0]) p.dot(tcx + s * 0.32 * T.a, chin + 0.18 * HH + i * 0.17 * HH, 3.4 * u, O.buttons || GOLD);
      if (O.belt) { p.band([[tcx - 1.5 * T.a, torsoBot - 0.18 * HH], [tcx + 1.5 * T.a, torsoBot - 0.18 * HH]], O.belt, 0.07 * HH, 1.2 * u); p.poly(rrect(tcx - 8 * u, torsoBot - 0.22 * HH, tcx + 8 * u, torsoBot - 0.14 * HH, 2 * u), "#c9b46a", 1.4 * u); }
      if (O.badge) { const bx = tcx + 0.45 * T.a, by = chin + 0.3 * HH, s_ = []; for (let i = 0; i < 10; i++) { const r = (i % 2 ? 5 : 10) * u, an = -Math.PI / 2 + i * Math.PI / 5; s_.push([bx + Math.cos(an) * r, by + Math.sin(an) * r]); } p.poly(s_, O.badge, 1.6 * u); }
      return;
    }
    // shirt V, vest, tie, lapels
    p.poly([[tcx - 0.42 * T.a, chin - 0.08 * HH], [tcx + 0.42 * T.a, chin - 0.08 * HH], [tcx, vY]], O.shirt, 1.6 * u);
    if (O.vest) { p.poly([[tcx - 0.36 * T.a, chin + 0.22 * HH], [tcx, vY - 0.02 * HH], [tcx + 0.36 * T.a, chin + 0.22 * HH], [tcx + 0.36 * T.a, torsoBot], [tcx - 0.36 * T.a, torsoBot]], O.vest, 1.6 * u);
      for (let i = 0; i < 3; i++) p.dot(tcx, vY + 0.04 * HH + i * 0.1 * HH, 2.2 * u, mul(O.vest, [1.6, 1.6, 1.6]));
      if (O.chain) { p.stroke(ellPts(tcx + 0.17 * T.a, vY + 0.1 * HH, 0.17 * T.a, 0.07 * HH, 0, 180, 0, 12), 1.8 * u, GOLD); p.dot(tcx + 0.34 * T.a, vY + 0.1 * HH, 2.6 * u, GOLD); } }
    if (O.tie) { const t0 = chin - 0.02 * HH; p.poly([[tcx - 5 * u, t0], [tcx + 5 * u, t0], [tcx + 3 * u, t0 + 0.06 * HH], [tcx + 7 * u, vY - 0.04 * HH], [tcx, vY + 0.02 * HH], [tcx - 7 * u, vY - 0.04 * HH], [tcx - 3 * u, t0 + 0.06 * HH]], O.tie, 1.6 * u); }
    if (O.apron) p.poly([[tcx - 0.8 * T.a, torsoBot - 0.24 * HH], [tcx + 0.8 * T.a, torsoBot - 0.24 * HH], [tcx + 0.9 * T.a, torsoBot + 0.4 * HH], [tcx - 0.9 * T.a, torsoBot + 0.4 * HH]], O.apron, 1.6 * u);
    const lap = mul(suitC, [0.78, 0.78, 0.84]);
    for (const s of [-1, 1]) p.poly([[tcx + s * 0.44 * T.a, chin - 0.08 * HH], [tcx + s * 0.08 * T.a, vY + 0.02 * HH], [tcx + s * 0.3 * T.a, vY - 0.12 * HH], [tcx + s * 0.6 * T.a, chin + 0.12 * HH]], lap, 1.8 * u);
    if (!O.vest) for (let i = 0; i < 2; i++) p.dot(tcx + 0.05 * T.a, vY + 0.1 * HH + i * 0.14 * HH, 2.6 * u, mul(suitC, [0.55, 0.55, 0.6]));
    if (O.pocket) p.poly([[tcx + 0.42 * T.a, chin + 0.3 * HH], [tcx + 0.48 * T.a, chin + 0.2 * HH], [tcx + 0.56 * T.a, chin + 0.26 * HH], [tcx + 0.66 * T.a, chin + 0.2 * HH], [tcx + 0.7 * T.a, chin + 0.3 * HH]], O.pocket, 1.4 * u);
    p.stroke([[tcx + 0.4 * T.a, chin + 0.3 * HH], [tcx + 0.72 * T.a, chin + 0.3 * HH]], 1.6 * u, mul(suitC, [0.6, 0.6, 0.66]));
    if (O.tight) for (const s of [-1, 1]) p.stroke([[tcx + s * 0.05 * T.a, vY + 0.1 * HH], [tcx + s * 0.35 * T.a, vY + 0.02 * HH]], 1.4 * u, mul(suitC, [0.6, 0.6, 0.66]));
  });
  p.inkRing(tp, ow, thick);
  if (O.cape) { const cc = [[tcx - 0.62 * T.a, chin + 0.02 * HH], [tcx + 0.62 * T.a, chin + 0.02 * HH], [tcx + 1.18 * T.a, chin + 0.42 * HH], [tcx - 1.18 * T.a, chin + 0.42 * HH]]; p.gradFill(cc, O.cape, mul(O.cape, [0.6, 0.6, 0.7]), light); p.poly(cc, null, ow * 0.7); }
  for (const a of arms) if (a.front) drawArm(a);
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  p.rot = p.rot || ((cpx - cx) || (cpy - chin) ? [0, cx, chin, cpx - cx, cpy - chin] : null);
  p.poly([[cx - 9 * u, chin - 0.06 * HH], [cx + 9 * u, chin - 0.06 * HH], [cx + 8 * u, chin + 0.08 * HH], [cx - 8 * u, chin + 0.08 * HH]], skin, 2 * u);
  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  if (O.jowl) p.clip(hp, () => p.ell(cx, hc + 0.85 * H.b, 0.7 * H.a, 0.3 * H.b, mul(skin, [0.93, 0.86, 0.84]), 0));
  p.inkRing(hp, ow, thick);
  const showHat = O.hat && !hatOff;
  hair20(p, O, cx, hc, H, u, light, back);
  if (!back) face20(p, O, cx, hc, W, expr, facing, look, lid, showHat);
  if (showHat) { if (hatDown) { p.rot = [p.rot ? p.rot[0] : 0, cx, hc, p.rot ? p.rot[3] || 0 : 0, (p.rot ? p.rot[4] || 0 : 0) + hatDown * 0.5 * H.b]; } hat20(p, O, cx, hc, H, u, light, back); }
  p.rot = null;
  for (const a of arms) if (a.over) { p.rot = null; drawArm(a); }
  p.rot = null;
  g.restore();
};

/** fx: glowing light bulb (idea), no glyphs */
export const fxBulb = (p, k = 1) => {
  const g = p.g; g.save(); g.globalAlpha = Math.min(1, k * 1.4);
  for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2, r0 = 150, r1 = 150 + 70 * k; p.band([[300 + Math.cos(an) * r0, 380 + Math.sin(an) * r0], [300 + Math.cos(an) * r1, 380 + Math.sin(an) * r1]], "#ffe36a", 14, 4, "round"); }
  p.ell(300, 380, 110, 120, "#fff1a0", 10); p.ell(270, 340, 40, 50, "#ffffffcc", 0);
  { const sp = []; for (let i = 0; i <= 60; i++) { const t = i / 60; sp.push([272 + t * 56, 440 + Math.sin(t * Math.PI * 8) * 10]); } p.stroke([[272, 480], [272, 440]], 5, "#c98a1a"); p.stroke([[328, 480], [328, 440]], 5, "#c98a1a"); p.stroke(sp, 5, "#c98a1a"); }
  p.poly(rrect(250, 488, 350, 560, 10), "#b9b9c0", 10); for (let y = 505; y < 556; y += 16) p.stroke([[252, y], [348, y]], 5);
  p.ell(300, 575, 22, 14, INK, 0); g.restore();
};
/** fx: four-point sparkle (eye glint / "ting") */
export const fxSpark = (p, k = 1, col = "#ffffff") => { const s = 0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, k)); const pts = []; for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, r = (i % 2 ? 40 : 230) * s; pts.push([300 + Math.cos(an) * r, 500 + Math.sin(an) * r]); } p.poly(pts, col, 14); };
/** fx: sweat drops flying */
export const fxSweat = (p, k = 0) => { for (let i = 0; i < 3; i++) { const an = -2.4 + i * 0.6, r = 120 + 200 * k; p.ell(300 + Math.cos(an) * r, 500 + Math.sin(an) * r, 26, 38, "#a9dcff", 9); } };
/** fx: steam / smoke puff (k growth 0..1) */
export const fxSteam = (p, k, col = "#f3efe8", a = 0.9) => { const g = p.g; g.save(); g.globalAlpha = a * Math.max(0, 1 - k * k); for (let i = 0; i < 7; i++) { const an = i / 7 * Math.PI * 2, r = 80 + 120 * k; p.ell(300 + Math.cos(an) * r, 520 + Math.sin(an) * r * 0.7, 110 + 50 * k, 95 + 40 * k, col, 0); } p.ell(300, 520, 170 + 90 * k, 140 + 70 * k, col, 0); g.restore(); };
/** fx: banknote flying (pattern only) */
export const fxNote20 = (p) => { p.poly(rrect(140, 420, 460, 580, 8), "#a3c48c", 12); p.poly(rrect(170, 445, 430, 555, 6), null, 5); p.ell(300, 500, 40, 40, "#6e9a5c", 5); for (const s of [-1, 1]) p.ell(300 + s * 95, 500, 16, 16, "#6e9a5c", 4); };
/** fx: pigeon */
export const fxBird = (p, k) => { const w = Math.sin(k * Math.PI * 2) * 90; p.ell(300, 500, 70, 42, "#8a8f9c", 10); p.ell(360, 470, 32, 30, "#7a7f8c", 9); p.poly([[388, 470], [410, 478], [388, 482]], "#e0a040", 5); p.poly([[280, 490], [200, 470 - w], [330, 480]], "#9ea3b0", 10); p.poly([[300, 490], [400, 460 - w * 0.8], [340, 495]], "#9ea3b0", 10); };
/** fx: bolt + falling nut */
export const fxBolt = (p) => { p.poly([[250, 470], [350, 470], [370, 500], [350, 530], [250, 530], [230, 500]], "#7a5a40", 12); p.ell(300, 500, 26, 26, "#4a3426", 8); };

/** close-up hand card (arm reaches down from the top of the card): item "stamp" | "pen" | "grip" */
export const handCard = (p, o = {}) => {
  const { item = null, sleeve = "#22305a", skin = "#f3d3b3", k = 0 } = o;
  if (item === "pen") {
    p.band([[470, -20], [360, 700]], sleeve, 120, 9, "butt"); p.band([[372, 620], [360, 700]], "#f7f2e6", 124, 8, "butt");
    p.band([[400, 640], [262, 975]], "#1c1a1e", 18, 5, "round"); p.poly([[262, 975], [248, 1000], [276, 984]], "#c9a050", 4);
    p.ell(345, 770, 62, 56, skin, 9); p.stroke([[300, 790], [330, 820], [362, 812]], 6); p.ell(300, 800, 22, 18, skin, 6);
    return;
  }
  if (item === "grip") { p.band([[300, 1040], [300, 640]], sleeve, 130, 9, "butt"); p.band([[300, 690], [300, 640]], "#f7f2e6", 134, 8, "butt"); p.ell(300, 580, 64, 70, skin, 9); for (let i = -1; i <= 1; i++) p.stroke([[300 + i * 26, 520], [300 + i * 26, 560]], 6); return; }
  // stamp: brass handle in the fist, seal head below touching the paper
  p.band([[300, -20], [300, 520]], sleeve, 130, 9, "butt"); p.band([[300, 470], [300, 520]], "#f7f2e6", 134, 8, "butt");
  p.poly(rrect(276, 600, 324, 860, 18), "#c9a050", 8); p.ell(300, 880, 70, 26, "#a8823a", 8); p.poly(rrect(232, 880, 368, 975, 10), "#b08a3e", 8); p.stroke([[246, 900], [354, 900]], 6, "#e2c27a");
  p.ell(300, 620, 74, 70, skin, 9); for (let i = -1; i <= 1; i++) p.stroke([[262, 610 + i * 22], [338, 610 + i * 22]], 5);
};
