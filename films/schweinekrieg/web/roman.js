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

// =====================================================================================================
// ===== Pig War cast (1850s-70s). Two sides told apart by colour only: BLUE (navy) and GREEN. =========
// ===== No insignia, no badges, no emblems, no text anywhere. All characters are invented. ============
// =====================================================================================================
FACE.angry = { eye: ["lid", "lid"], brow: [7, -4], mouth: "teeth" };
FACE.smug = { eye: ["lid", "lid"], brow: [-3, -6], mouth: "smirk" };
FACE.gulp = { eye: ["small", "small"], brow: [-4, 3], mouth: "wave" };
FACE.yawn = { eye: ["dash", "dash"], brow: [-2, 3], mouth: "O" };
FACE.sheepish = { eye: ["dot", "dot"], brow: [-4, 3], mouth: "smirk" };
FACE.puzzled = { eye: ["dot", "small"], brow: [-5, 1], mouth: "wave" };
FACE.content = { eye: ["happy", "happy"], brow: [-1, -2], mouth: "smile" };
FACE.weary = { eye: ["lid", "lid"], brow: [-3, 3], mouth: "dash" };

const NAVY = "#25396f", NAVY_D = "#18274e", GRN = "#2c6340", GRN_D = "#1c4a2c", GOLD = "#e8c45a";
export const PW = {
  farmer: { skin: "#f7d2b2", shirt: "#c9463b", plaid: "#7d2620", overalls: "#5d7aa6", patches: ["#d8b25c", "#9a77b4"], pants: "#5d7aa6", boots: "#5a3b2a", hat: "straw", beard: "#d0602a", hair: "#d0602a", build: "thin" },
  owner: { skin: "#f5c6a2", shirt: "#f3eee2", vest: "#2f7040", coat: "#3d3739", pants: "#4b4542", boots: "#241c1a", hat: "tophat", band: "#2f7040", sideburns: "#6a4024", moustache: "#6a4024", build: "stout", watch: true, bow: "#1f4a2a" },
  bcap: { skin: SKIN, coat: NAVY, pants: NAVY_D, boots: INK, longhair: "#a0612c", buttons: GOLD, epaul: GOLD, sword: true, binoc: true, collar: GOLD },
  gofc: { skin: "#f3d0b0", coat: GRN, pants: GRN_D, boots: INK, hat: "kepi", hatCol: GRN_D, moustache: "#3a2a20", buttons: GOLD, epaul: GOLD, sword: true, collar: GOLD },
  gadm: { skin: "#f3d6bb", coat: "#1f5034", pants: "#1a3a28", boots: INK, hat: "bicorne", hatCol: "#17231b", sideburns: "#f4f1ea", brows: "#f4f1ea", buttons: GOLD, epaul: GOLD, build: "stout", collar: GOLD },
  kaiser: { skin: "#f5cfae", coat: "#2c2f3a", pants: "#2c2f3a", boots: INK, hat: "pickel", curl: "#4a3a2e", brows: "#4a3a2e", buttons: GOLD, epaul: GOLD, medals: true, cape: "#b8262c", build: "stout", collar: "#b8262c" },
  dipB: { skin: "#f2cfb0", coat: "#2d4c8c", shirt: "#f3eee2", pants: "#2a2a33", boots: INK, hat: "tophat", band: "#2d4c8c", bow: INK, tails: true, moustache: "#3a2a1e" },
  dipG: { skin: "#f6d6bc", coat: "#2f6b3c", shirt: "#f3eee2", pants: "#2a2a33", boots: INK, hat: "tophat", band: "#2f6b3c", bow: INK, tails: true, sideburns: "#8a8a8a", build: "stout" },
  setA: { skin: "#f5c9a0", shirt: "#4f78b0", plaid: "#2c4a78", pants: "#6a5a48", boots: "#5a3b2a", hat: "straw", beard: "#6a4a2a" },
  setB: { skin: "#ffe2c2", shirt: "#7b9fd0", dress: "#5f86c0", apron: "#efe6d2", boots: "#5a3b2a", hat: "bonnet" },
  setC: { skin: "#c99067", shirt: "#d9a441", plaid: "#9a6a20", overalls: "#3f5f8a", pants: "#3f5f8a", boots: "#5a3b2a", hat: "cap", cap: "#3a4f7a" },
};
PW.bsol = (v = 0) => ({ skin: SKINS[v % 4], coat: NAVY, pants: "#3a4766", boots: INK, hat: "kepi", hatCol: NAVY_D, belts: "#f1efe6", buttons: "#d9dde0", moustache: v % 3 === 1 ? "#4a3426" : null });
PW.gsol = (v = 0) => ({ skin: SKINS[(v + 1) % 4], coat: GRN, pants: "#2d3f33", boots: INK, hat: "kepi", hatCol: GRN_D, belts: "#f1efe6", buttons: "#d9dde0", moustache: v % 3 === 2 ? "#2a201a" : null });
PW.sailor = (v = 0) => ({ skin: SKINS[v % 4], coat: GRN, pants: "#e6e2d6", boots: INK, hat: "round", hatCol: GRN_D, sailor: "#e6e2d6", moustache: v % 4 === 3 ? "#3a2a1e" : null });

// ---------- hats ----------
const drawHat = (p, O, H, cx, hc, light, u, ow, lift = 0, spin = 0) => {
  const W = 2 * H.a, HH = 2 * H.b, crown = hc - H.b - lift;
  const R = spin ? (pts) => rotPts(pts, spin, cx, crown) : (pts) => pts;
  const kind = O.hat;
  if (kind === "straw") {
    const by = crown + 0.1 * HH, col = "#e6c86c", dk = "#b8953e";
    const crownP = R([[cx - 0.31 * W, by], [cx - 0.29 * W, by - 0.3 * HH], [cx - 0.2 * W, by - 0.37 * HH], [cx + 0.2 * W, by - 0.37 * HH], [cx + 0.29 * W, by - 0.3 * HH], [cx + 0.31 * W, by]]);
    p.shadedFill(crownP, col, dk, light, 0.3 * W, 0.4);
    p.clip(crownP, () => { for (let i = -6; i <= 6; i++) p.stroke(R([[cx + i * 6 * u, by], [cx + i * 5.4 * u, by - 0.38 * HH]]), 1.1 * u, "#c9a64e"); });
    p.poly(crownP, null, ow);
    p.band(R([[cx - 0.305 * W, by - 0.07 * HH], [cx + 0.305 * W, by - 0.07 * HH]]), "#9a3a2a", 0.07 * HH, 1.2 * u);
    const brim = R(ellPts(cx, by, 0.78 * W, 0.1 * HH, 0, 360, 0, 48));
    p.shadedFill(brim, col, dk, light, 0.6 * W, 0.3);
    p.clip(brim, () => { for (let k = 1; k < 4; k++) p.stroke(R(ellPts(cx, by, 0.78 * W * k / 4 + 0.2 * W, 0.1 * HH * k / 4 + 0.03 * HH, 0, 180, 0, 30)), 1.1 * u, "#c9a64e"); });
    p.poly(brim, null, ow);
    // ragged straw ends
    for (let i = 0; i < 9; i++) { const a = rad(15 + i * 18), x = cx + 0.78 * W * Math.cos(a), y = by + 0.1 * HH * Math.sin(a); p.stroke(R([[x, y], [x + 4 * u * Math.cos(a), y + 6 * u]]), 1.4 * u, dk); }
  } else if (kind === "tophat") {
    const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.34 * W, col = "#2e2a36";
    const body = R([[cx - wb, yb], [cx - wt, yb - ht], [cx + wt, yb - ht], [cx + wb, yb]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wt - 4 * u, yb - 0.13 * HH], [cx + wt + 4 * u, yb - 0.13 * HH]]), O.band || "#5a2a2a", 0.14 * HH, 0.8 * u));
    p.poly(body, null, ow);
    p.poly(R(ellPts(cx, yb - ht, wt, 0.05 * HH, 0, 360, 0, 30)), "#3a3644", ow * 0.8);
    p.poly(R(ellPts(cx, yb + 1 * u, 0.47 * W, 0.055 * HH, 0, 360, 0, 40)), "#1d1b22", ow);
  } else if (kind === "kepi") {
    const yb = crown + 0.24 * HH, ht = 0.4 * HH, wb = 0.43 * W, wt = 0.36 * W, col = O.hatCol || NAVY_D, top = yb - ht;
    const body = R([[cx - wb, yb], [cx - wt, top + 0.06 * HH], [cx - wt + 4 * u, top], [cx + wt + 6 * u, top - 0.05 * HH], [cx + wt + 2 * u, top + 0.04 * HH], [cx + wb, yb]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wb - 4 * u, yb - 0.06 * HH], [cx + wb + 4 * u, yb - 0.06 * HH]]), mul(col, [0.8, 0.8, 0.85]), 0.08 * HH, 0.6 * u));
    p.poly(body, null, ow);
    p.poly(R(ellPts(cx + 2 * u, yb + 1 * u, 0.36 * W, 0.06 * HH, 0, 180, 0, 24)), "#141419", ow * 0.8);
  } else if (kind === "round") {
    const yb = crown + 0.24 * HH, col = O.hatCol || GRN_D;
    p.poly(R(rrect(cx - 0.4 * W, yb - 0.12 * HH, cx + 0.4 * W, yb + 0.02 * HH, 4 * u)), "#1a1a20", ow);
    p.poly(R(ellPts(cx, yb - 0.15 * HH, 0.5 * W, 0.09 * HH, 0, 360, 0, 36)), col, ow);
    p.stroke(R([[cx + 0.25 * W, yb + 0.0 * HH], [cx + 0.42 * W, yb + 0.16 * HH]]), 2.4 * u, "#1a1a20");
  } else if (kind === "bicorne") {
    const col = O.hatCol || "#17231b", yb = crown + 0.2 * HH;
    const pts = R([[cx - 0.98 * W, yb + 0.02 * HH], [cx - 0.7 * W, yb - 0.16 * HH], [cx - 0.35 * W, yb - 0.38 * HH], [cx, yb - 0.46 * HH], [cx + 0.35 * W, yb - 0.38 * HH], [cx + 0.7 * W, yb - 0.16 * HH], [cx + 0.98 * W, yb + 0.02 * HH], [cx + 0.6 * W, yb + 0.04 * HH], [cx, yb + 0.08 * HH], [cx - 0.6 * W, yb + 0.04 * HH]]);
    p.shadedFill(pts, col, mul(col, SH_FELT), light, 0.9 * W, 0.4);
    p.poly(pts, null, ow);
    p.stroke(R([[cx - 0.94 * W, yb + 0.0 * HH], [cx - 0.68 * W, yb - 0.13 * HH], [cx - 0.34 * W, yb - 0.34 * HH], [cx, yb - 0.42 * HH], [cx + 0.34 * W, yb - 0.34 * HH], [cx + 0.68 * W, yb - 0.13 * HH], [cx + 0.94 * W, yb + 0.0 * HH]]), 3 * u, GOLD);
  } else if (kind === "pickel") {
    const col = "#22242c", yb = crown + 0.3 * HH;
    const dome = R(ellPts(cx, yb, 0.56 * W, 0.42 * HH, 180, 360, 0, 40));
    p.shadedFill(dome, col, "#0e0f13", light, 0.5 * W, 0.4);
    p.clip(dome, () => p.stroke(R(ellPts(cx - 18 * u, yb - 0.22 * HH, 0.2 * W, 0.12 * HH, 200, 290, 0, 12)), 5 * u, "#ffffff55"));
    p.poly(dome, null, ow);
    p.band(R([[cx - 0.57 * W, yb], [cx + 0.57 * W, yb]]), GOLD, 0.05 * HH, 1.4 * u);
    p.poly(R(ellPts(cx, yb + 2 * u, 0.48 * W, 0.06 * HH, 0, 180, 0, 24)), "#111216", ow * 0.8);
    const top = yb - 0.42 * HH;
    p.poly(R(rrect(cx - 9 * u, top - 10 * u, cx + 9 * u, top + 4 * u, 3 * u)), GOLD, 2 * u);
    p.poly(R([[cx - 6 * u, top - 9 * u], [cx, top - 0.38 * HH], [cx + 6 * u, top - 9 * u]]), "#f0d27a", 2 * u);
  } else if (kind === "cap") {
    const col = O.cap, yb = crown + 0.3 * HH;
    const cp = R(ellPts(cx, yb, 0.52 * W, 0.36 * HH, 180, 360, 0, 30));
    p.shadedFill(cp, col, mul(col, SH_FELT), light, 0.5 * W, 0.4); p.poly(cp, null, ow);
    p.poly(R(ellPts(cx + 6 * u, yb, 0.36 * W, 0.06 * HH, 0, 180, 0, 24)), mul(col, [0.75, 0.75, 0.8]), ow * 0.8);
  } else if (kind === "bonnet") {
    const by = crown + 0.16 * HH;
    p.arc(cx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
    p.arc(cx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
    const cyb = hc + H.b * 0.98; p.stroke([[cx - 14 * u, cyb - 4 * u], [cx, cyb + 2 * u], [cx + 14 * u, cyb - 4 * u]], 2 * u, BONNET_BRIM);
  }
};
/** loose hat card (flying top hat etc.) */
export const hatCard = (p, key, spin = 0) => {
  const O = typeof key === "string" ? PW[key] : key, H = headBlob(3, 118, 0), u = 2 * H.a / 100;
  drawHat(p, O, H, 300, 640, rad(-120), u, 0.85 * 5 * u, 0, spin);
};

// ---------- hand props ----------
const pennant = (p, x, y0, y1, col, wv = 0, u = 2.36, dir = 1) => {
  p.band([[x, y0], [x, y1]], "#7a5434", 3.6 * u, 1.3 * u, "round");
  p.dot(x, y1 - 3 * u, 4.2 * u, "#c9a24a");
  const L = 82 * u, h = 30 * u, pts = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([x + dir * t * L, y1 + 6 * u + t * h * 0.5 + Math.sin(wv + t * 5) * 7 * u * t]); }
  for (let i = 12; i >= 0; i--) { const t = i / 12; pts.push([x + dir * t * L, y1 + 6 * u + h - t * h * 0.5 + Math.sin(wv + t * 5) * 7 * u * t]); }
  p.gradFill(pts, col, mul(col, [0.7, 0.7, 0.78]), rad(-120)); p.poly(pts, null, 2.6 * u);
};
const musket = (p, hx, hy, u, ang = 0, len = 1) => {
  // vertical old rifle, muzzle UP: stock below the hand, barrel above (never aimed)
  const c = Math.cos(ang), s = Math.sin(ang), P = (a, b) => [hx + a * c - b * s, hy + a * s + b * c];
  p.band([P(0, -170 * u * len), P(0, 0)], "#9aa2aa", 3.2 * u, 1.3 * u, "round");
  p.band([P(0, -10 * u), P(0, 110 * u * len)], "#8a5a34", 6.5 * u, 1.4 * u, "round");
  p.poly([P(-6 * u, 100 * u * len), P(8 * u, 100 * u * len), P(9 * u, 140 * u * len), P(-7 * u, 136 * u * len)], "#7a4c2a", 1.5 * u);
};
const coin = (p, x, y, u) => { p.ell(x, y, 9 * u, 6 * u, "#f2cf55", 1.8 * u); p.ell(x - 2 * u, y - 1.5 * u, 3 * u, 1.6 * u, "#fff3b8", 0); };
const cuffs = (p, x, y, u, sw = 0) => {
  const a = [x - 14 * u + sw, y + 30 * u], b = [x + 14 * u + sw, y + 34 * u];
  p.stroke([[x, y], [x + sw * 0.5, y + 14 * u], a], 1.8 * u, "#6a6e74"); p.stroke([[x + sw * 0.5, y + 14 * u], b], 1.8 * u, "#6a6e74");
  for (const q of [a, b]) { p.ell(q[0], q[1] + 10 * u, 11 * u, 11 * u, null, 6 * u); p.ell(q[0], q[1] + 10 * u, 11 * u, 11 * u, null, 0); p.arc(q[0], q[1] + 10 * u, 11 * u, 11 * u, 0, 360, 3.4 * u, "#b9c0c8"); }
};
const telescope = (p, x0, y0, x1, y1, u) => {
  const n = 3; for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n + 0.04, w = (9 - i * 1.6) * u;
    p.band([[x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0], [x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1]], i % 2 ? "#c99a3c" : "#e0b24e", w, 1.5 * u); }
  p.dot(x1, y1, 4.5 * u, "#8fc8e8");
};
const bugle = (p, x, y, s, u) => {
  p.band([[x, y], [x + s * 40 * u, y - 4 * u], [x + s * 70 * u, y - 14 * u]], "#e2b54a", 4 * u, 1.3 * u, "round");
  p.poly([[x + s * 66 * u, y - 10 * u], [x + s * 92 * u, y - 34 * u], [x + s * 100 * u, y - 18 * u], [x + s * 72 * u, y - 4 * u]], "#f0c95a", 1.8 * u);
};
const hanky = (p, x, y, u, wv) => {
  const pts = [[x, y]]; for (let i = 1; i <= 6; i++) { const t = i / 6; pts.push([x + t * 40 * u, y - 18 * u + Math.sin(wv + t * 4) * 8 * u * t]); }
  for (let i = 6; i >= 1; i--) { const t = i / 6; pts.push([x + t * 36 * u, y + 14 * u + Math.sin(wv + 1 + t * 4) * 8 * u * t]); }
  p.poly(pts, "#f8f6f0", 1.8 * u);
};
const pocketWatch = (p, x, y, u) => { p.ell(x, y, 13 * u, 13 * u, GOLD, 2 * u); p.ell(x, y, 9.5 * u, 9.5 * u, "#fbf6e8", 1.2 * u); p.stroke([[x, y], [x, y - 6 * u]], 1.4 * u); p.stroke([[x, y], [x + 4.5 * u, y + 1 * u]], 1.4 * u); p.dot(x, y - 14 * u, 2.5 * u, GOLD); };
const sealStamp = (p, x, y, u) => { p.poly(rrect(x - 12 * u, y + 2 * u, x + 12 * u, y + 14 * u, 3 * u), GOLD, 2 * u); p.band([[x, y + 2 * u], [x, y - 26 * u]], "#6a3c22", 6 * u, 1.4 * u); p.ell(x, y - 30 * u, 10 * u, 9 * u, "#7a4628", 2 * u); };

/** 1850s-70s character, front view. opts: expr blink look facing seed L R tilt headTilt bob step sit blush steam prop propL hatOff beard wv flagCol */
export const fig = (p, key, opts = {}) => {
  const O = typeof key === "string" ? PW[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0, light = rad(-120), step = 0,
    sit = false, blush = 0, steam = 0, prop = null, propL = null, hatOff = false, beard = 0, wv = 0, flagCol = "#3a5fb0", stampY = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const thin = O.build === "thin", stout = O.build === "stout";
  const legsL = thin ? 1.62 : stout ? 1.3 : 1.4, torsoL = thin ? 1.14 : 1.1, sole = 975;
  const torsoBot = (sit ? sole - 0.8 * HH : sole - legsL * HH) - bob * HH;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const coat = O.coat ?? O.shirt, legCol = O.pants ?? mix(coat, INK, 0.5), armCol = O.plaid && !O.coat ? O.shirt : coat;
  p.rot = null;
  // cape
  if (O.cape) { const cp = [[cx - 0.5 * W, chin + 0.06 * HH], [cx + 0.5 * W, chin + 0.06 * HH], [cx + 0.72 * W, sole - 0.2 * HH], [cx + 0.25 * W, sole - 0.1 * HH], [cx - 0.25 * W, sole - 0.12 * HH], [cx - 0.72 * W, sole - 0.2 * HH]];
    p.gradFill(cp, O.cape, mul(O.cape, [0.55, 0.5, 0.6]), light); p.inkRing(cp, ow * 0.8, thick); }
  // legs
  if (O.dress) {
    const D = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.3 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    for (const side of [-1, 1]) p.stroke([[cx + side * 14 * u, sole - 0.5 * HH], [cx + side * 18 * u, sole - 4 * u]], 5.8 * u, "#3b3f52");
    for (const side of [-1, 1]) footStroke(p, [cx + side * 15 * u, sole - 4 * u], [cx + side * 30 * u, sole - 3.5 * u], 7.5 * u, O.boots);
    const dp = blobPts(cx, sole - 0.3 * HH - D.b, D); p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light); p.inkRing(dp, ow, thick);
    if (O.apron) { const ap = [[cx - 0.42 * W, chin + 0.5 * HH], [cx + 0.42 * W, chin + 0.5 * HH], [cx + 0.5 * W, sole - 0.45 * HH], [cx - 0.5 * W, sole - 0.45 * HH]]; p.poly(ap, O.apron, 2 * u); }
  } else for (const side of [-1, 1]) {
    if (sit) {
      const hip = [cx + side * 16 * u, hipY + 0.06 * HH], knee = [cx + side * 40 * u, hipY + 0.2 * HH], foot = [cx + side * 42 * u, sole - 4 * u];
      p.stroke([hip, knee], 9 * u, legCol); p.stroke(curve(knee, [knee[0] + side * 3 * u, (knee[1] + foot[1]) / 2], foot), 6 * u, legCol);
      footStroke(p, [foot[0] - side * 3 * u, foot[1]], [foot[0] + side * 13 * u, foot[1] + 0.5 * u], 8 * u, O.boots ?? INK);
    } else {
      const up = Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 30 * (step ? 1 : 0);
      const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), (O.overalls ? 6.6 : 5.8) * u, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u], 8 * u, O.boots ?? INK);
    }
  }
  // upper body
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * W) / 1.06 * (stout ? 1.18 : thin ? 0.84 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: stout ? 0.2 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]] };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(wv)), s[1] - 0.62 * HH]] };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]] };
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "reach": return { pts: [s, [X(30), s[1] - 0.05 * HH], [X(62), s[1] - 0.22 * HH]] };
      case "grab": return { pts: [s, [X(26), s[1] - 0.25 * HH], [X(38), s[1] - 0.62 * HH]] };
      case "palm": return { pts: [s, [X(14), s[1] + 0.3 * HH], [X(34), s[1] + 0.22 * HH]], palm: true };
      case "hold": return { pts: [s, [X(12), s[1] + 0.3 * HH], [X(16), s[1] + 0.02 * HH]] };
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], over: true };
      case "face": return { pts: [s, [X(6), s[1] - 0.05 * HH], [cx + side * 0.12 * H.a, hc - 0.05 * H.b]], over: true, big: true };
      case "eye": return { pts: [s, [X(10), s[1] - 0.05 * HH], [cx + side * 0.62 * H.a, hc - 0.05 * H.b]], over: true };
      case "mouth": return { pts: [s, [X(8), s[1] + 0.05 * HH], [cx + side * 0.18 * H.a, hc + 0.42 * H.b]], over: true };
      case "twirl": return { pts: [s, [X(14), s[1] + 0.0 * HH], [cx + side * 0.62 * H.a, hc + 0.3 * H.b]], over: true };
      case "push": return { pts: [s, [X(20), s[1] + 0.2 * HH], [X(44), s[1] + 0.12 * HH]] };
      case "stamp": return { pts: [s, [X(10), s[1] + 0.1 * HH], [tcx + side * 0.2 * T.a, s[1] + (0.32 + stampY) * HH]], front: true };
      case "plant": return { pts: [s, [X(12), s[1] - 0.1 * HH], [X(14), s[1] - 0.42 * HH]] };
      case "flag": return { pts: [s, [X(8), s[1] + 0.25 * HH], [X(12), s[1] + 0.12 * HH]] };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * HH]], front: true };
      case "rifle": return { pts: [s, [X(6), s[1] + 0.42 * HH], [X(10), s[1] + 0.2 * HH]] };
      case "port": return { pts: [s, [X(4), s[1] + 0.35 * HH], [tcx + side * 0.1 * T.a, s[1] + 0.28 * HH]], front: true };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]] };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const hands = { L: arms[0].pts[2], R: arms[1].pts[2] };
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, mix(armCol, INK, O.plaid && !O.coat ? 0.15 : 0.35));
    const [hx, hy] = a.pts[2]; p.dot(hx, hy, (a.big ? 8 : 5.5) * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.stroke([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], 2.6 * u); }
  };
  // props behind the body
  const propAt = (which, kind) => {
    if (!kind) return; const [hx, hy] = hands[which], sd = which === "L" ? -1 : 1;
    if (kind === "rifle") musket(p, hx, hy, u);
    if (kind === "rifleUp") musket(p, hx, hy - 60 * u, u, sd * 0.25);
    if (kind === "flag") pennant(p, hx, sole - (opts.flagDepth ?? 0) * HH, hy - 1.05 * HH, flagCol, wv, u, sd);
    if (kind === "sword") {}
  };
  if (O.sword) { p.band([[cx - 0.8 * T.a, torsoBot - 0.1 * HH], [cx - 1.15 * T.a, sole - 0.25 * HH]], "#2a2a2e", 5 * u, 1.3 * u, "round"); p.dot(cx - 0.8 * T.a, torsoBot - 0.12 * HH, 4 * u, GOLD); }
  if (prop === "rifle" || prop === "flag" || prop === "rifleUp") propAt("R", prop); if (propL === "flag" || propL === "rifle") propAt("L", propL);
  for (const a of arms) if (!a.front && !a.over) drawArm(a);
  if (O.tails) for (const s of [-1, 1]) { const tl = [[tcx + s * 0.2 * T.a, torsoBot - 0.2 * HH], [tcx + s * 0.95 * T.a, torsoBot - 0.25 * HH], [tcx + s * 0.75 * T.a, torsoBot + 0.75 * HH], [tcx + s * 0.35 * T.a, torsoBot + 0.6 * HH]]; p.gradFill(tl, coat, mul(coat, SH_CLOTH), light); p.poly(tl, null, ow * 0.8); }
  // torso
  if (!O.dress) {
    p.gradFill(tp, coat, mul(coat, SH_CLOTH), light);
    p.clip(tp, () => {
      const top = chin - 0.1 * HH;
      if (O.plaid) {
        p.gradFill(tp, O.shirt, mul(O.shirt, SH_CLOTH), light);
        for (let i = -6; i <= 6; i++) { p.stroke([[tcx + i * 14 * u, top], [tcx + i * 14 * u, torsoBot + 10 * u]], 4.5 * u, O.plaid + "99"); p.stroke([[tcx - 2 * T.a, top + 20 * u + i * 14 * u], [tcx + 2 * T.a, top + 20 * u + i * 14 * u]], 4.5 * u, O.plaid + "88"); }
        for (let i = -6; i <= 6; i++) p.stroke([[tcx + i * 14 * u + 7 * u, top], [tcx + i * 14 * u + 7 * u, torsoBot + 10 * u]], 1 * u, "#ffffff55");
      }
      if (O.overalls) {
        const bib = [[tcx - 0.52 * T.a, chin + 0.32 * HH], [tcx + 0.52 * T.a, chin + 0.32 * HH], [tcx + 0.6 * T.a, torsoBot - 0.3 * HH], [tcx + 1.4 * T.a, torsoBot - 0.3 * HH], [tcx + 1.4 * T.a, torsoBot + 0.2 * HH], [tcx - 1.4 * T.a, torsoBot + 0.2 * HH], [tcx - 1.4 * T.a, torsoBot - 0.3 * HH], [tcx - 0.6 * T.a, torsoBot - 0.3 * HH]];
        p.gradFill(bib, O.overalls, mul(O.overalls, SH_CLOTH), light); p.poly(bib, null, 2 * u);
        for (const s of [-1, 1]) { p.band([[tcx + s * 0.42 * T.a, chin + 0.34 * HH], [tcx + s * 0.62 * T.a, chin - 0.05 * HH]], O.overalls, 7 * u, 1.4 * u); p.dot(tcx + s * 0.4 * T.a, chin + 0.37 * HH, 3 * u, "#d9dde0"); }
        if (O.patches) { const [a, b] = O.patches;
          const sq = (x, y, w, h, c, r) => { const q = rotPts([[x - w, y - h], [x + w, y - h], [x + w, y + h], [x - w, y + h]], r, x, y); p.poly(q, c, 1.6 * u); p.clip(q, () => { const qq = rotPts([[x - w + 3 * u, y - h + 3 * u], [x + w - 3 * u, y - h + 3 * u], [x + w - 3 * u, y + h - 3 * u], [x - w + 3 * u, y + h - 3 * u]], r, x, y); qq.push(qq[0]); p.g.setLineDash([3 * u, 3 * u]); p.stroke(qq, 1.1 * u, "#3a2a20"); p.g.setLineDash([]); }); };
          sq(tcx - 0.2 * T.a, chin + 0.62 * HH, 11 * u, 9 * u, a, 0.15); sq(tcx + 0.85 * T.a, torsoBot - 0.05 * HH, 10 * u, 12 * u, b, -0.2); }
      }
      if (O.vest) {
        p.poly([[tcx - 0.28 * T.a, top], [tcx, chin + 0.42 * HH], [tcx + 0.28 * T.a, top]], O.shirt, 1.5 * u);
        const vl = [[tcx - 0.62 * T.a, top], [tcx - 0.08 * T.a, chin + 0.44 * HH], [tcx + 0.08 * T.a, chin + 0.44 * HH], [tcx + 0.62 * T.a, top], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH], [tcx, torsoBot + 0.02 * HH], [tcx - 0.75 * T.a, torsoBot - 0.1 * HH]];
        p.gradFill(vl, O.vest, mul(O.vest, SH_CLOTH), light); p.poly(vl, null, 1.8 * u);
        for (let k = 0; k < 4; k++) p.dot(tcx, chin + (0.52 + k * 0.17) * HH, 2.6 * u, GOLD);
        if (O.watch) p.stroke(curve([tcx, chin + 0.69 * HH], [tcx + 0.4 * T.a, chin + 0.86 * HH], [tcx + 0.62 * T.a, chin + 0.72 * HH]), 1.6 * u, GOLD);
      }
      if (O.tails) { p.poly([[tcx - 0.34 * T.a, top], [tcx, torsoBot - 0.1 * HH], [tcx + 0.34 * T.a, top]], O.shirt, 1.5 * u); for (const s of [-1, 1]) p.poly([[tcx + s * 0.34 * T.a, top], [tcx + s * 0.05 * T.a, chin + 0.62 * HH], [tcx + s * 0.55 * T.a, chin + 0.3 * HH]], mul(coat, [0.8, 0.8, 0.85]), 1.4 * u); }
      if (O.buttons && !O.vest && !O.tails) {
        for (let k = 0; k < 5; k++) p.dot(tcx + 2 * u * facing, chin + (0.18 + k * 0.17) * HH, 2.6 * u, O.buttons);
        if (O.belts) for (const s of [-1, 1]) p.band([[tcx - s * 0.95 * T.a, chin + 0.02 * HH], [tcx + s * 0.95 * T.a, torsoBot - 0.2 * HH]], O.belts, 5 * u, 0.9 * u);
        p.band([[tcx - 1.4 * T.a, torsoBot - 0.2 * HH], [tcx + 1.4 * T.a, torsoBot - 0.2 * HH]], "#2a2220", 0.07 * HH, 1.2 * u);
        p.poly(rrect(tcx - 7 * u, torsoBot - 0.24 * HH, tcx + 7 * u, torsoBot - 0.16 * HH, 1.5 * u), "#c9ccd2", 1.2 * u);
        if (O.medals) { const cols = [["#b8262c", GOLD], ["#2a6ab0", "#d9dde0"], ["#e6b23a", GOLD], ["#2c8a5a", "#d9dde0"]]; cols.forEach(([rb, md], k) => { const x = tcx - 0.62 * T.a + k * 11 * u, y = chin + 0.3 * HH; p.poly([[x - 4 * u, y - 10 * u], [x + 4 * u, y - 10 * u], [x + 4 * u, y + 2 * u], [x - 4 * u, y + 2 * u]], rb, 1 * u); p.ell(x, y + 8 * u, 5.5 * u, 5.5 * u, md, 1.2 * u); }); }
      }
      if (O.sailor) { p.poly([[tcx - 0.9 * T.a, top], [tcx + 0.9 * T.a, top], [tcx + 0.85 * T.a, chin + 0.28 * HH], [tcx, chin + 0.42 * HH], [tcx - 0.85 * T.a, chin + 0.28 * HH]], O.sailor, 1.6 * u); p.poly([[tcx - 10 * u, chin + 0.36 * HH], [tcx + 10 * u, chin + 0.36 * HH], [tcx, chin + 0.56 * HH]], "#1a1a20", 1.2 * u); }
      if (!O.overalls && !O.vest && !O.buttons && !O.sailor && !O.tails) p.stroke([[tcx - 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.16 * HH], [tcx + 0.2 * T.a, chin + 0.02 * HH]], 2 * u);
      if (O.collar) p.band([[tcx - 0.5 * T.a, chin + 0.01 * HH], [tcx + 0.5 * T.a, chin + 0.01 * HH]], O.collar, 0.07 * HH, 1 * u);
    });
    p.inkRing(tp, ow, thick);
    if (O.bow) { const by = chin + 0.06 * HH; p.poly([[tcx - 13 * u, by - 6 * u], [tcx, by], [tcx - 13 * u, by + 6 * u]], O.bow, 1.4 * u); p.poly([[tcx + 13 * u, by - 6 * u], [tcx, by], [tcx + 13 * u, by + 6 * u]], O.bow, 1.4 * u); p.dot(tcx, by, 3 * u, O.bow); }
    if (O.binoc) { p.stroke(curve([tcx - 0.5 * T.a, chin + 0.02 * HH], [tcx, chin + 0.5 * HH], [tcx + 0.5 * T.a, chin + 0.02 * HH]), 1.4 * u, "#3a2a20"); for (const s of [-1, 1]) p.poly(rrect(tcx + s * 8 * u - 6 * u, chin + 0.42 * HH, tcx + s * 8 * u + 6 * u, chin + 0.58 * HH, 2.5 * u), "#2a2a30", 1.4 * u); }
    if (O.epaul) for (const s of [-1, 1]) { const ex = tcx + s * 0.78 * T.a, ey = chin + 0.08 * HH; p.ell(ex, ey, 0.34 * T.a, 0.07 * HH, O.epaul, 1.6 * u); for (let k = -3; k <= 3; k++) p.stroke([[ex + k * 0.09 * T.a, ey + 0.05 * HH], [ex + k * 0.1 * T.a, ey + 0.13 * HH]], 1.8 * u, O.epaul); }
  } else if (O.shirt) { // dress top
    const top = [[tcx - 0.8 * T.a, chin + 0.05 * HH], [tcx + 0.8 * T.a, chin + 0.05 * HH], [tcx + 0.7 * T.a, chin + 0.5 * HH], [tcx - 0.7 * T.a, chin + 0.5 * HH]];
    p.gradFill(top, O.shirt, mul(O.shirt, SH_CLOTH), light); p.inkRing(top, ow * 0.8, thick);
  }
  for (const a of arms) if (a.front && !a.over) drawArm(a);
  // hand props in front
  const fp = (which, kind) => {
    if (!kind) return; const [hx, hy] = hands[which], sd = which === "L" ? -1 : 1;
    if (kind === "coins") { coin(p, hx - 6 * u, hy - 4 * u, u); coin(p, hx + 6 * u, hy - 7 * u, u); coin(p, hx, hy - 12 * u, u); }
    if (kind === "cuffs") cuffs(p, hx, hy, u, Math.sin(wv) * 6 * u);
    if (kind === "tele") telescope(p, hx, hy, hx + sd * 150 * u, hy - 20 * u, u);
    if (kind === "teleDown") telescope(p, hx, hy - 30 * u, hx + sd * 10 * u, hy + 60 * u, u);
    if (kind === "hanky") hanky(p, hx, hy, u, wv);
    if (kind === "bugle") bugle(p, hx, hy, sd, u);
    if (kind === "watch") pocketWatch(p, hx, hy - 14 * u, u);
    if (kind === "seal") sealStamp(p, hx, hy, u);
    if (kind === "port") musket(p, hx, hy, u, -sd * 0.55, 0.9);
  };
  if (prop && prop !== "rifle" && prop !== "flag" && prop !== "rifleUp" && !arms[1].over) fp("R", prop); if (propL && propL !== "rifle" && propL !== "flag" && !arms[0].over) fp("L", propL);
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  if (O.hat === "bonnet") hatBehind(p, { hat: "bonnet" }, H, cx, hc, light, thick, ow, false);
  if (O.longhair) { const lh = blobPts(cx, hc + 0.3 * H.b, { ...H, a: H.a * 1.16, b: H.b * 1.22, egg: 0.1, asym: 0, noise: 0.02, seed: seed + 2 }); p.shadedFill(lh, O.longhair, mul(O.longhair, SH_FELT), light, H.a); p.inkRing(lh, ow * 0.85, thick); }
  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  if (blush > 0) p.clip(hp, () => { const g = p.g, [x0, y0] = p.P(cx, hc + H.b), [x1, y1] = p.P(cx, hc - H.b * (0.2 + 1.4 * Math.min(1, blush)));
    const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(225,40,40,${(0.75 * Math.min(1, blush)).toFixed(3)})`); gr.addColorStop(1, "rgba(225,40,40,0)"); p.path(hp, true); g.fillStyle = gr; g.fill(); });
  p.inkRing(hp, ow, thick);
  if (O.sideburns) for (const s of [-1, 1]) { const sb = blobPts(cx + s * 0.8 * H.a, hc + 0.32 * H.b, { a: 0.26 * H.a, b: 0.52 * H.b, nTop: 2, nBot: 1.8, egg: -0.2, asym: 0, rot: rad(-s * 12), noise: 0.05, seed: seed + 5 + s }); p.shadedFill(sb, O.sideburns, mul(O.sideburns, [0.85, 0.85, 0.9]), light, 0.25 * H.a, 0.3); p.inkRing(sb, ow * 0.7, thick); }
  const bd = O.beard || (beard > 0.05 ? (opts.beardCol || "#6a4a2a") : null);
  if (bd) {
    const k = O.beard ? 1 : beard;
    const bb = blobPts(cx + 4 * u * facing, hc + (0.72 + 0.3 * k) * H.b, { a: (0.55 + 0.3 * k) * H.a, b: (0.25 + 0.45 * k) * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.05, seed: seed + 4 });
    p.shadedFill(bb, bd, mul(bd, [0.82, 0.8, 0.85]), light, 0.6 * H.a, 0.3);
    p.clip(bb, () => { for (let i = -4; i <= 4; i++) p.stroke([[cx + i * 9 * u, hc + 0.45 * H.b], [cx + i * 8 * u, hc + 1.5 * H.b]], 1.3 * u, mul(bd, [0.7, 0.7, 0.75])); });
    p.inkRing(bb, ow * 0.8, thick);
  }
  if (O.hat === "straw" && O.hair && !hatOff) for (const s of [-1, 1]) p.ell(cx + s * 0.92 * H.a, hc - 0.25 * H.b, 0.16 * H.a, 0.28 * H.b, O.hair, 2.5 * u);
  if (O.longhair) hatOn(p, { hat: "hair", hair: O.longhair, jacket: coat }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.hair && (hatOff || !O.hat)) hatOn(p, { hat: "hair", hair: O.hair, jacket: coat }, hp, H, cx, hc, light, seed, facing, false);
  else if (hatOff && O.hat === "tophat") hatOn(p, { hat: "hair", hair: O.sideburns || "#5a3b2a", jacket: coat }, hp, H, cx, hc, light, seed, facing, false);
  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, O.curl ? null : (bd || O.moustache || O.moustacheW), stout);
  if (O.brows) for (const s of [-1, 1]) p.ell(cx + 7 * u * facing + s * 14 * u, hc - 20 * u, 11 * u, 5 * u, O.brows, 2 * u);
  if (bd && (expr === "shock" || expr === "yawn")) p.ell(cx + 8 * u * facing, hc + 22 * u, 6 * u, 7 * u, "#5a1e28", 2 * u);
  if (O.curl) { // big curled moustache
    const my = hc + 13 * u, mx = cx + 8 * u * facing;
    for (const s of [-1, 1]) {
      const pts = [[mx + s * 2 * u, my], [mx + s * 20 * u, my + 6 * u], [mx + s * 40 * u, my + 5 * u], [mx + s * 54 * u, my - 4 * u], [mx + s * 58 * u, my - 16 * u], [mx + s * 52 * u, my - 22 * u], [mx + s * 46 * u, my - 16 * u]];
      p.stroke(pts.slice(0, 4), 17 * u, INK); p.stroke(pts.slice(3), 9 * u, INK); p.stroke(pts.slice(0, 4), 12 * u, O.curl); p.stroke(pts.slice(3), 5 * u, O.curl);
      p.stroke([[mx + s * 8 * u, my + 1 * u], [mx + s * 34 * u, my + 3 * u]], 1.6 * u, mul(O.curl, [1.5, 1.5, 1.5]));
    }
  }
  if (blush > 0.55 && steam > 0) for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const t = (steam + k * 0.5) % 1, r = (10 + 16 * t) * u;
    p.ell(cx + s * (0.75 * H.a + 30 * u * t), hc - 0.9 * H.b - 60 * u * t, r, r * 0.8, `rgba(255,255,255,${(0.95 * (1 - t)).toFixed(2)})`, 3.5 * u * (1 - t * 0.6)); }
  if (!hatOff) drawHat(p, O, H, cx, hc, light, u, 0.85 * ow);
  p.rot = null;
  for (const a of arms) if (a.over) drawArm(a);
  if (arms[1].over) fp("R", prop); if (arms[0].over) fp("L", propL);
};

// ---------- the pig ----------
const PINK = "#f6a9bb", PINK_D = "#d9788f", PINK_L = "#ffd3dd", SNOUT = "#f58aa3";
const pigEye = (p, x, y, r, wink, blink, look = 0) => {
  if (wink || blink >= 1) { p.arc(x, y + 2, r * 0.9, r * 0.6, 200, 340, 6); return; }
  p.ell(x, y, r * 0.85, r, "#ffffff", 6);
  p.ell(x + look * r * 0.25, y + r * 0.15, r * 0.52, r * 0.62, INK, 0);
  p.ell(x + look * r * 0.25 - r * 0.2, y - r * 0.15, r * 0.2, r * 0.22, "#ffffff", 0);
  p.dot(x + look * r * 0.25 + r * 0.2, y + r * 0.4, r * 0.08, "#ffffff");
  if (blink > 0) p.ell(x, y - r * 0.5, r * 0.88, r * 0.5, PINK, 4);
};
const halo = (p, x, y, s = 1) => {
  const g = p.g; g.save(); g.globalAlpha = 0.35; p.ell(x, y, 110 * s, 34 * s, "#fff4b0", 0); g.restore();
  p.ell(x, y, 80 * s, 22 * s, null, 22 * s); p.ell(x, y, 80 * s, 22 * s, null, 0);
  p.arc(x, y, 80 * s, 22 * s, 0, 360, 13 * s, "#f6cd3c"); p.arc(x - 6 * s, y - 4 * s, 60 * s, 14 * s, 200, 300, 4 * s, "#fff6c4");
};
const wing = (p, x, y, s, flap) => {
  const a = rad(-20 - 25 * Math.sin(flap)) * s, pts = [];
  const P = (dx, dy) => [x + s * (dx * Math.cos(a) - dy * Math.sin(a)) * -1 * -1, y + (dx * Math.sin(a) + dy * Math.cos(a))];
  const raw = [[0, 0], [60, -70], [130, -100], [175, -95], [160, -60], [178, -50], [150, -20], [165, -5], [125, 15], [130, 30], [80, 30], [40, 25]];
  for (const [dx, dy] of raw) { const X = dx * s, Y = dy; pts.push([x + X * Math.cos(a) - Y * Math.sin(a), y + X * Math.sin(a) + Y * Math.cos(a)]); }
  p.gradFill(pts, "#ffffff", "#dfe6f2", rad(-120)); p.poly(pts, null, 8);
  for (let k = 0; k < 3; k++) { const X = (70 + k * 32) * s, Y = -30 + k * 6; p.stroke([[x + X * Math.cos(a) - Y * Math.sin(a), y + X * Math.sin(a) + Y * Math.cos(a)], [x + (X + 30 * s) * Math.cos(a) - (Y + 30) * Math.sin(a), y + (X + 30 * s) * Math.sin(a) + (Y + 30) * Math.cos(a)]], 4, "#c9d2e2"); }
};
/** pig, side view facing right with the face turned 3/4 to camera. o: dig(0..1) step chew blink wink look happy angel flap mud */
export const pigSide = (p, o = {}) => {
  const { dig = 0, step = 0, blink = 0, wink = false, look = 0.3, happy = false, angel = false, flap = 0, mud = 0, bounce = 0 } = o;
  const cx = 280, cy = 760 - bounce * 30, L = rad(-120), th = thickAngle(L);
  if (angel) wing(p, cx - 10, cy - 90, -1, flap + 0.6);
  // legs
  const legs = [[170, 0], [225, 0.5], [345, 0.25], [400, 0.75]];
  for (const [x, ph] of legs) { const up = step ? Math.max(0, Math.sin(Math.PI * 2 * (step + ph))) * 22 : 0, k = x > 300 ? 1 : 0.92;
    p.poly(rrect(x - 22, cy + 60, x + 22, 955 - up, 14), x === 225 || x === 400 ? PINK_D : PINK, 9); p.poly(rrect(x - 22, 932 - up, x + 22, 962 - up, 10), "#5a3a40", 8); }
  // tail
  { const tl = [[cx - 170, cy - 30]]; for (let i = 0; i <= 28; i++) { const a = Math.PI * 0.1 - i / 28 * Math.PI * 3.2, r = 30 - i * 0.8; tl.push([cx - 215 + Math.cos(a) * r, cy - 45 + Math.sin(a) * r]); }
    p.stroke(tl, 21, INK); p.stroke(tl, 10, PINK); }
  // body
  const body = blobPts(cx, cy, { a: 185, b: 128, nTop: 2.2, nBot: 2.4, egg: 0.08, asym: 0.04, rot: 0, noise: 0.01, seed: 4 });
  p.shadedFill(body, PINK, PINK_D, L, 180, 0.4);
  p.clip(body, () => { p.ell(cx + 10, cy + 95, 150, 50, PINK_L, 0); for (const [x, y, a, b, r] of [[cx - 70, cy - 85, 46, 30, -10], [cx + 30, cy - 105, 38, 24, 8], [cx - 120, cy - 20, 30, 34, 0]]) p.ell(x, y, a, b, "#2b2228", 0, 0, 360, r);
    if (mud) for (let i = 0; i < 6; i++) p.ell(cx - 100 + i * 45, cy + 60 + (i % 2) * 20, 22, 14, "#7a5a3a", 0); });
  p.inkRing(body, 11, th);
  if (angel) wing(p, cx + 10, cy - 100, 1, flap);
  // head (rotates down to dig)
  const hx = 455, hy = 690, ang = rad(dig * 38);
  p.rot = ang ? [ang, 390, 730] : null;
  for (const s of [-1, 1]) { const ex = hx + s * 55 - 10, ey = hy - 85; p.poly([[ex - 34, ey + 28], [ex + s * 10, ey - 50], [ex + 34, ey + 20]], PINK, 9); p.poly([[ex - 18, ey + 18], [ex + s * 6, ey - 26], [ex + 18, ey + 14]], PINK_D, 0); }
  const head = blobPts(hx, hy, { a: 108, b: 98, nTop: 2.1, nBot: 2.3, egg: 0.06, asym: 0.05, rot: 0, noise: 0.008, seed: 9 });
  p.shadedFill(head, PINK, PINK_D, L, 100, 0.4); p.inkRing(head, 10, th);
  p.ell(hx - 62, hy + 30, 22, 13, "#ff8fa8aa", 0); p.ell(hx + 68, hy + 34, 18, 11, "#ff8fa8aa", 0);
  pigEye(p, hx - 34, hy - 18, 26, wink, blink, look); pigEye(p, hx + 38, hy - 18, 26, false, blink, look);
  for (const s of [-1, 1]) p.stroke([[hx + s * 36 - 14, hy - 56], [hx + s * 36 + 14, hy - 60]], 6);
  p.ell(hx + 4, hy + 38, 46, 32, SNOUT, 9); p.ell(hx - 10, hy + 38, 8, 12, "#7a2a3a", 0); p.ell(hx + 18, hy + 38, 8, 12, "#7a2a3a", 0);
  if (mud) p.ell(hx + 4, hy + 60, 30, 10, "#6a4a2a", 0);
  p.arc(hx + 4, hy + 62, 26, happy ? 18 : 10, 20, 160, 7);
  p.rot = null;
  if (angel) halo(p, hx - 10, hy - 150, 0.9);
};
/** pig, front view sitting/floating. o: blink wink look angel flap potato chew legs('dangle'|'sit') */
export const pigFront = (p, o = {}) => {
  const { blink = 0, wink = false, look = 0, angel = false, flap = 0, potato = false, chew = 0, legs = "dangle", happy = true, tilt = 0, bite = 0 } = o;
  const cx = 300, L = rad(-120), th = thickAngle(L);
  p.rot = tilt ? [rad(tilt), 300, 700] : null;
  if (angel) { wing(p, cx - 110, 560, -1, flap); wing(p, cx + 110, 560, 1, flap); }
  // hind legs + tail
  for (const s of [-1, 1]) { const lx = cx + s * 80, ly = legs === "sit" ? 880 : 900; p.poly(rrect(lx - 30, ly - 80, lx + 30, ly + 30, 18), PINK, 9); p.poly(rrect(lx - 30, ly + 10, lx + 30, ly + 40, 12), "#5a3a40", 8); }
  p.stroke([[cx + 140, 760], [cx + 175, 740], [cx + 185, 770], [cx + 165, 785], [cx + 160, 760], [cx + 190, 730]], 18, INK); p.stroke([[cx + 140, 760], [cx + 175, 740], [cx + 185, 770], [cx + 165, 785], [cx + 160, 760], [cx + 190, 730]], 8, PINK);
  const body = blobPts(cx, 730, { a: 160, b: 170, nTop: 2.4, nBot: 2.2, egg: 0.22, asym: 0, rot: 0, noise: 0.008, seed: 5 });
  p.shadedFill(body, PINK, PINK_D, L, 160, 0.4);
  p.clip(body, () => { p.ell(cx, 780, 105, 120, PINK_L, 0); p.ell(cx - 128, 680, 34, 46, "#2b2228", 0); p.ell(cx + 132, 760, 28, 38, "#2b2228", 0); });
  p.inkRing(body, 11, th);
  // head
  for (const s of [-1, 1]) { const ex = cx + s * 92, ey = 405; p.poly([[ex - 40, ey + 40], [ex + s * 26, ey - 60], [ex + 40, ey + 34]], PINK, 9); p.poly([[ex - 20, ey + 26], [ex + s * 14, ey - 30], [ex + 22, ey + 22]], PINK_D, 0); }
  const head = blobPts(cx, 500, { a: 140, b: 122, nTop: 2.1, nBot: 2.4, egg: 0.08, asym: 0, rot: 0, noise: 0.008, seed: 8 });
  p.shadedFill(head, PINK, PINK_D, L, 130, 0.4); p.inkRing(head, 11, th);
  p.ell(cx - 92, 545, 26, 15, "#ff8fa8aa", 0); p.ell(cx + 92, 545, 26, 15, "#ff8fa8aa", 0);
  pigEye(p, cx - 50, 470, 30, wink, blink, look); pigEye(p, cx + 50, 470, 30, false, blink, look);
  for (const s of [-1, 1]) p.stroke([[cx + s * 50 - 16, 422], [cx + s * 50 + 16, 418 - s * 2]], 6);
  const sy = 540 + chew * 4; p.ell(cx, sy, 52, 36, SNOUT, 9); p.ell(cx - 16, sy, 9, 13, "#7a2a3a", 0); p.ell(cx + 16, sy, 9, 13, "#7a2a3a", 0);
  if (chew > 0) p.ell(cx, 598, 20, 8 + chew * 6, "#7a2a3a", 6); else p.arc(cx, 590, 34, happy ? 20 : 10, 20, 160, 7);
  // front trotters (hold a potato)
  if (potato) {
    const px = cx, py = 650 - 40 * Math.max(0, bite);
    for (const s of [-1, 1]) p.stroke(curve([cx + s * 120, 640], [cx + s * 95, 700], [px + s * 38, py + 10]), 30, INK);
    for (const s of [-1, 1]) p.stroke(curve([cx + s * 120, 640], [cx + s * 95, 700], [px + s * 38, py + 10]), 18, PINK);
    const pp = blobPts(px, py - 10, { a: 48, b: 34, nTop: 2, nBot: 2, egg: 0.1, asym: 0, rot: rad(-12), noise: 0.05, seed: 3 });
    p.shadedFill(pp, "#c99a5a", "#8a6232", L, 45, 0.4); p.inkRing(pp, 7, th);
    if (bite > 0.5 || o.bitten) p.ell(px + 34, py - 24, 16, 14, "#f2e2a8", 5);
    for (const [dx, dy] of [[-18, -18], [10, 2], [-4, -2]]) p.dot(px + dx, py - 10 + dy, 3, "#6a4a22");
    for (const s of [-1, 1]) p.ell(px + s * 38, py + 10, 20, 16, "#5a3a40", 7);
  } else for (const s of [-1, 1]) { p.poly(rrect(cx + s * 112 - 24, 640, cx + s * 112 + 24, 760, 16), PINK, 9); p.poly(rrect(cx + s * 112 - 24, 735, cx + s * 112 + 24, 765, 10), "#5a3a40", 7); }
  if (angel) halo(p, cx, 330, 1.05);
  p.rot = null;
};

// ---------- effects (no letters, no numbers) ----------
export const fxGull = (p, ph) => {
  const w = Math.sin(ph * Math.PI * 2), cx = 300, cy = 500;
  for (const s of [-1, 1]) { const pts = [[cx + s * 18, cy], [cx + s * 90, cy - 40 - w * 60], [cx + s * 170, cy - 20 - w * 110]]; p.stroke(pts, 34, INK); p.stroke(pts, 20, "#f8f8f6"); p.stroke([pts[1], pts[2]], 10, "#3a3a40"); }
  p.ell(cx, cy + 6, 40, 26, "#f8f8f6", 9); p.poly([[cx + 36, cy + 2], [cx + 66, cy + 10], [cx + 36, cy + 14]], "#f2b23a", 5);
};
export const fxBird = (p, ph, col = "#3a3440") => {
  const w = Math.sin(ph * Math.PI * 2), cx = 300, cy = 500;
  for (const s of [-1, 1]) p.stroke([[cx, cy], [cx + s * 70, cy - 30 - w * 50], [cx + s * 130, cy - 10 - w * 90]], 22, col);
  p.ell(cx, cy + 4, 26, 18, col, 0);
};
export const fxPotato = (p, rot = 0) => { const pp = blobPts(300, 500, { a: 120, b: 84, nTop: 2, nBot: 2, egg: 0.1, asym: 0, rot, noise: 0.06, seed: 3 }); p.shadedFill(pp, "#c99a5a", "#8a6232", rad(-120), 110, 0.4); p.inkRing(pp, 14, 0); for (const [dx, dy] of [[-40, -20], [30, 10], [-6, 30], [50, -30]]) p.dot(300 + dx, 500 + dy, 7, "#6a4a22"); };
export const fxClod = (p, k = 0) => { for (let i = 0; i < 5; i++) p.ell(300 + Math.cos(i * 1.3 + k) * 70, 500 + Math.sin(i * 2.1) * 50, 46 - i * 5, 38 - i * 4, i % 2 ? "#7a5634" : "#5e4128", 8); };
export const fxSmoke = (p, k, col = "#eef0f2") => { // big cartoon smoke cloud (no letters)
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, Math.min(1, 1.6 - k * 1.4));
  const r0 = 70 + 160 * Math.min(1, k * 1.6);
  const blobs = [[0, 0, 1], [-0.9, 0.3, 0.7], [0.9, 0.25, 0.75], [-0.45, -0.6, 0.75], [0.5, -0.55, 0.7], [0, -1.0, 0.6]];
  for (const [dx, dy, s] of blobs) p.ell(300 + dx * r0, 560 + dy * r0 * 0.8 - k * 60, r0 * s, r0 * s * 0.85, col, 12);
  for (const [dx, dy, s] of blobs) p.ell(300 + dx * r0, 560 + dy * r0 * 0.8 - k * 60, r0 * s - 6, r0 * s * 0.85 - 6, col, 0);
  g.restore();
};
export const fxSun = (p) => { for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; p.poly([[300 + Math.cos(a - 0.12) * 120, 500 + Math.sin(a - 0.12) * 120], [300 + Math.cos(a) * 200, 500 + Math.sin(a) * 200], [300 + Math.cos(a + 0.12) * 120, 500 + Math.sin(a + 0.12) * 120]], "#ffd24a", 8); } p.ell(300, 500, 120, 120, "#ffe066", 12); };
export const fxMoon = (p) => { p.clip([[0, 0], [600, 0], [600, 1000], [0, 1000]], () => {}); const pts = []; for (let i = 0; i <= 40; i++) { const a = rad(-120 + 240 * i / 40); pts.push([300 + Math.cos(a) * 130, 500 + Math.sin(a) * 130]); } for (let i = 40; i >= 0; i--) { const a = rad(-100 + 200 * i / 40); pts.push([360 + Math.cos(a) * 112, 500 + Math.sin(a) * 118]); } p.poly(pts, "#f4f0d0", 10); };
export const fxSnow = (p) => { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; p.stroke([[300, 500], [300 + Math.cos(a) * 120, 500 + Math.sin(a) * 120]], 16, "#ffffff"); } p.dot(300, 500, 26, "#ffffff"); };
export const fxPetal = (p, col = "#f7b6c8") => { p.ell(300, 500, 110, 70, col, 12, 0, 360, 30); p.stroke([[230, 460], [360, 540]], 6, mul(col, [0.85, 0.7, 0.75])); };
export const fxFlowers = (p, k = 1) => { // a bouquet growing out of a cannon muzzle
  const cols = ["#f05a7a", "#ffd24a", "#ffffff", "#b07ae0", "#ff8a3a"];
  for (let i = 0; i < 7; i++) { const a = rad(-150 + i * 20), L = (120 + (i % 3) * 50) * k, x1 = 300 + Math.cos(a) * L, y1 = 760 + Math.sin(a) * L;
    p.stroke(curve([300, 760], [300 + Math.cos(a) * L * 0.4, 760 + Math.sin(a) * L * 0.6], [x1, y1]), 9, "#3f8a3a");
    if (k > 0.3) { const r = 30 * Math.min(1, (k - 0.3) / 0.5); for (let j = 0; j < 5; j++) { const b = j * Math.PI * 2 / 5; p.ell(x1 + Math.cos(b) * r * 0.8, y1 + Math.sin(b) * r * 0.8, r * 0.6, r * 0.6, cols[i % 5], 6); } p.dot(x1, y1, r * 0.4, "#f2c23a"); } }
  for (const s of [-1, 1]) p.ell(300 + s * 40, 700, 34, 16, "#4f9a44", 6, 0, 360, s * 30);
};
/** thought bubble; inside: 'pig' or 'nations' (blue + green pennants clashing) */
export const fxThought = (p, what, k = 1, flap = 0) => {
  const g = p.g; g.save();
  for (const [x, y, r] of [[150, 900, 18], [185, 840, 28]]) p.ell(x, y, r * k, r * k, "#ffffff", 7);
  const blobs = [[300, 470, 210, 170], [160, 450, 90, 90], [440, 450, 95, 95], [220, 330, 100, 90], [380, 330, 105, 95], [300, 300, 110, 90], [220, 610, 95, 80], [380, 610, 95, 80]];
  for (const [x, y, a, b] of blobs) p.ell(300 + (x - 300) * k, 470 + (y - 470) * k, a * k, b * k, "#ffffff", 10);
  for (const [x, y, a, b] of blobs) p.ell(300 + (x - 300) * k, 470 + (y - 470) * k, a * k - 8, b * k - 8, "#ffffff", 0);
  if (k > 0.85) {
    g.translate(300, 470); g.scale(0.42, 0.42); g.translate(-300, -620);
    if (what === "pig") pigFront(p, { wink: false, look: 0, happy: true, legs: "sit" });
    else { pennant(p, 120, 1000, 260, "#3a5fb0", flap, 2.6, 1); pennant(p, 480, 1000, 260, "#2f8a4a", flap + 1, 2.6, -1); fxBurst(p, 0.4, "#ffb23a", 10, 50, 170); }
  }
  g.restore();
};
/** map texture for the palace table: coastlines only (no lettering) */
export const mapArt = (p, seal = 0) => {
  const g = p.g; g.fillStyle = "#efe2bf"; g.fillRect(0, 0, 600, 1000);
  g.fillStyle = "#cfe0dc"; g.fillRect(30, 30, 540, 940);
  const isl = (cx, cy, rx, ry, seed) => { const pts = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, r = 1 + 0.12 * Math.sin(a * 3 + seed) + 0.07 * Math.sin(a * 7 + seed * 2); pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } p.poly(pts, "#d9c58f", 4); };
  isl(300, 500, 170, 110, 1); isl(110, 200, 60, 40, 2); isl(500, 820, 70, 45, 3); isl(480, 160, 50, 70, 4);
  g.strokeStyle = "#9fbab4"; g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.ellipse(300, 500, 170 + i * 28, 110 + i * 24, 0, 0, 7); g.stroke(); }
  p.stroke([[200, 470], [300, 520], [400, 480]], 4, "#9a7a4a");
  p.ell(300, 500, 0, 0, null, 0);
  g.strokeStyle = "#8a6a3a"; g.lineWidth = 6; g.strokeRect(30, 30, 540, 940);
  if (seal > 0) { const s = Math.min(1, seal); p.ell(330, 600, 60 * s, 55 * s, "#b8262c", 6); p.ell(330, 600, 38 * s, 34 * s, "#d23a3a", 3); p.ell(318, 588, 12 * s, 8 * s, "#f07a7a", 0); }
};
