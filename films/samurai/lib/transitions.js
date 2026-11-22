// Transition language of the film. Each: (c, A, B, k 0..1, opts, t) with A = previous shot canvas, B = new shot canvas.
const INK = '#120e0c';
// a ragged dry-brush band centred on screen-x `ex` (moving left to right), slanted by `sl`
function brushBand(c, ex, sl, wid, seed = 0) {
  c.save();
  // solid core
  c.beginPath();
  const top = -60, bot = H + 60, n = 40;
  for (let i = 0; i <= n; i++) { const y = lerp(top, bot, i / n), j = (rnd(seed + i) - .5) * 34 + Math.sin(i * .9 + seed) * 14; c.lineTo(ex + j + sl * (y - H / 2), y); }
  for (let i = n; i >= 0; i--) { const y = lerp(top, bot, i / n), j = (rnd(seed + i + 77) - .5) * 26; c.lineTo(ex - wid + j + sl * (y - H / 2), y); }
  c.closePath(); c.fillStyle = INK; c.fill();
  // dry-brush bristle streaks behind the band (trailing edge), thinning out
  for (let i = 0; i < 90; i++) {
    const y = rnd(seed + i * 3) * (H + 80) - 40, len = 120 + rnd(seed + i * 5) * 520, th = 2 + rnd(seed + i * 7) * 14;
    const x1 = ex - wid + 30 + sl * (y - H / 2), x0 = x1 - len;
    const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(18,14,12,0)'); g.addColorStop(.6, `rgba(18,14,12,${.35 + rnd(i + seed) * .5})`); g.addColorStop(1, INK);
    c.fillStyle = g; c.fillRect(x0, y, len, th);
  }
  // splatter dots at the leading edge
  for (let i = 0; i < 26; i++) { const y = rnd(seed + i * 11) * H, x = ex + 10 + rnd(seed + i * 13) * 60 + sl * (y - H / 2); circ(c, x, y, 2 + rnd(i * 17 + seed) * 9); c.fillStyle = INK; c.fill(); }
  c.restore();
}
const TRANS = {
  // 1) ink brush wipe: a thick black brush stroke crosses the screen; the new shot is behind it
  ink(c, A, B, k, o) {
    const sl = o.slant ?? -.18, wid = 760, ex = lerp(-260, W + wid + 300, ease(k));
    c.drawImage(A, 0, 0);
    c.save(); c.beginPath(); c.moveTo(-400, -100); c.lineTo(ex - wid * .55 + sl * (-100 - H / 2), -100); c.lineTo(ex - wid * .55 + sl * (H + 100 - H / 2), H + 100); c.lineTo(-400, H + 100); c.closePath(); c.clip(); c.drawImage(B, 0, 0); c.restore();
    brushBand(c, ex, sl, wid * .55, o.seed || 3);
  },
  // 2) sword cut: bright diagonal slash, the old image splits along it and slides apart
  cut(c, A, B, k, o) {
    const ang = o.ang ?? -.42, cx = W / 2, cy = H / 2, dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    const k1 = seg(k, 0, .22), k2 = easeIn(seg(k, .22, 1));
    c.drawImage(B, 0, 0);
    const half = (side) => { c.save(); c.beginPath(); const L = 3000; c.moveTo(cx - dx * L, cy - dy * L); c.lineTo(cx + dx * L, cy + dy * L); c.lineTo(cx + dx * L + nx * L * side, cy + dy * L + ny * L * side); c.lineTo(cx - dx * L + nx * L * side, cy - dy * L + ny * L * side); c.closePath(); c.clip();
      const m = k2 * 900; c.translate(dx * m * side * .55 + nx * m * side * .25, dy * m * side * .55 + ny * m * side * .25); c.drawImage(A, 0, 0); c.restore(); };
    half(1); half(-1);
    // slash line
    const a = k < .22 ? 1 : 1 - seg(k, .22, .6), L = 2400, ext = lerp(-L, L, easeOut(k1));
    c.save(); c.globalCompositeOperation = 'screen';
    c.strokeStyle = `rgba(255,250,235,${a})`; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - dx * L, cy - dy * L); c.lineTo(cx + dx * ext, cy + dy * ext); c.stroke();
    c.strokeStyle = `rgba(200,230,255,${a * .45})`; c.lineWidth = 30; c.stroke();
    c.restore();
  },
  // 3) shoji: two paper panels slide in from the sides, close, then open on the new shot
  shoji(c, A, B, k) {
    const close = k < .5, kk = close ? easeOut(seg(k, 0, .45)) : 1 - ease(seg(k, .55, 1));
    c.drawImage(close ? A : B, 0, 0);
    const pw = W / 2 * kk;
    for (const s of [-1, 1]) {
      c.save(); const x0 = s < 0 ? 0 : W - pw; c.beginPath(); c.rect(x0, 0, pw, H); c.clip();
      const ox = s < 0 ? pw - W / 2 : W - pw; c.translate(ox, 0); shojiPanel(c, 0, 0, W / 2, H, s); c.restore();
    }
    if (!close || k > .45) { c.fillStyle = `rgba(0,0,0,${.25 * bump(k, .4, .6)})`; c.fillRect(0, 0, W, H); }
  },
  // 4) cherry petal storm
  sakura(c, A, B, k, o) {
    c.drawImage(k < .5 ? A : B, 0, 0);
    const dens = bump(k, 0, 1);
    c.save(); c.fillStyle = `rgba(250,215,225,${.55 * Math.pow(dens, 3)})`; c.fillRect(0, 0, W, H); c.restore();
    const n = 520;
    for (let i = 0; i < n; i++) {
      const life = seg(k, rnd(i) * .45, .55 + rnd(i + 3) * .45); if (life <= 0 || life >= 1) continue;
      const x = lerp(-200 - rnd(i + 5) * 600, W + 300, life) + Math.sin(life * 9 + i) * 60, y = rnd(i + 7) * H + Math.sin(life * 6 + i) * 80 + lerp(-120, 160, life);
      sakuraPetal(c, x, y, 14 + rnd(i + 9) * 26, life * 14 + i, rnd(i + 11));
    }
  },
  // 5) mist / smoke wipe
  mist(c, A, B, k, o) {
    c.drawImage(k < .5 ? A : B, 0, 0);
    const d = bump(k, 0, 1), col = o.col || '226,226,222';
    for (let i = 0; i < 46; i++) {
      const x = lerp(-700, W + 700, seg(k, rnd(i) * .3, .7 + rnd(i + 1) * .3)) + (rnd(i + 2) - .5) * 400, y = rnd(i + 3) * H, r = 220 + rnd(i + 4) * 380;
      const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, .6 * d)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    c.fillStyle = rgba(col, Math.pow(d, 2.5) * .7); c.fillRect(0, 0, W, H);
  },
  // 6) scroll opening: two wooden rollers part from the centre and reveal the new shot (on paper)
  scroll(c, A, B, k) {
    c.drawImage(A, 0, 0);
    const kk = easeOut(k), half = (W / 2 + 60) * kk;
    c.save(); c.beginPath(); c.rect(W / 2 - half, 0, half * 2, H); c.clip(); c.drawImage(B, 0, 0); c.restore();
    for (const s of [-1, 1]) scrollRoller(c, W / 2 + s * half, H, k);
  },
  // 7) match cut: a hard cut with a 2-frame white flash-blend so the matching shapes register
  match(c, A, B, k) { c.drawImage(B, 0, 0); c.globalAlpha = 1 - easeOut(k); c.drawImage(A, 0, 0); c.globalAlpha = 1; },
  // 8) single drum hit, cut to black, the new shot fades up from black
  black(c, A, B, k, o) { const hold = o.hold ?? .55; if (k < hold) { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); } else { c.drawImage(B, 0, 0); c.fillStyle = `rgba(0,0,0,${1 - easeOut(seg(k, hold, 1))})`; c.fillRect(0, 0, W, H); } },
  // plain dissolve (sparingly)
  fade(c, A, B, k) { c.drawImage(A, 0, 0); c.globalAlpha = ease(k); c.drawImage(B, 0, 0); c.globalAlpha = 1; },
};
function shojiPanel(c, x, y, w, h, s) {
  c.save(); c.translate(x, y);
  const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#efe6d2'); g.addColorStop(1, '#e6dcc4'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  // paper fibres
  c.globalAlpha = .18; for (let i = 0; i < 80; i++) { stroke(c, [rnd(i) * w, rnd(i + 1) * h, rnd(i) * w + 30, rnd(i + 1) * h + 6], 1.2, '#b8a888'); } c.globalAlpha = 1;
  const fr = '#5b3d26', fw = 26;
  c.fillStyle = fr; c.fillRect(0, 0, w, fw); c.fillRect(0, h - fw * 2.2, w, fw * 2.2); c.fillRect(0, 0, fw, h); c.fillRect(w - fw, 0, fw, h);
  for (let i = 1; i < 4; i++) c.fillRect(i * w / 4 - 5, 0, 10, h);
  for (let j = 1; j < 7; j++) c.fillRect(0, j * h / 7 - 5, w, 10);
  // finger pull
  ell(c, s < 0 ? w - 60 : 60, h / 2, 16, 34); fo(c, '#3d2818');
  c.restore();
}
function sakuraPetal(c, x, y, r, rot, v) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, .55 + .45 * Math.sin(rot * 1.3));
  c.beginPath(); c.moveTo(0, -r); c.bezierCurveTo(r * .9, -r * .7, r * .7, r * .6, 0, r); c.bezierCurveTo(-r * .7, r * .6, -r * .9, -r * .7, 0, -r);
  c.fillStyle = v < .33 ? '#f6c3d0' : v < .66 ? '#f2a9bd' : '#fbd9e1'; c.fill();
  c.beginPath(); c.moveTo(0, -r); c.lineTo(-r * .18, -r * .62); c.lineTo(r * .18, -r * .62); c.closePath(); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
  c.restore();
}
function scrollRoller(c, x, H, k) {
  c.save();
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x - 40, 0, 80, H);
  const g = c.createLinearGradient(x - 34, 0, x + 34, 0); g.addColorStop(0, '#3a2414'); g.addColorStop(.45, '#8a5a32'); g.addColorStop(1, '#2a180c');
  c.fillStyle = g; c.fillRect(x - 30, -10, 60, H + 20);
  // rolled paper edge
  c.fillStyle = '#e9dcc0'; c.fillRect(x - 22, 40, 44, H - 80);
  c.fillStyle = '#c9b896'; for (let i = 0; i < 6; i++) c.fillRect(x - 22 + i * 8, 40, 2, H - 80);
  // knobs
  for (const y of [18, H - 18]) { ell(c, x, y, 40, 22); fo(c, '#2a180c', 3, '#140c06'); ell(c, x, y - 4, 28, 12); fo(c, '#b38a4a'); }
  c.restore();
}
