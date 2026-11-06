/* =====================================================================
   Film-only props for "Tea": a Turkish tulip tea glass on a Deco saucer.
   Glass origin = centre of its base; height ~100 units at k = 1.
   ===================================================================== */
// tulip profile (right half), from base up to the rim: [x, y]
const TULIP = [[22, 0], [27, -8], [31, -26], [28, -44], [21, -60], [20, -66], [24, -82], [32, -100]];
function tulipPath(k = 1) {
  const pts = TULIP.map(([x, y]) => [x * k, y * k]);
  const all = pts.concat(pts.slice().reverse().map(([x, y]) => [-x, y]));
  return smoothPathOf(all, true, 0.55);
}
function tulipHalfW(y) { // half width at height y (y <= 0)
  for (let i = 1; i < TULIP.length; i++) {
    const [x0, y0] = TULIP[i - 1], [x1, y1] = TULIP[i];
    if (y <= y0 && y >= y1) return lerp(x0, x1, (y0 - y) / (y0 - y1));
  }
  return TULIP[TULIP.length - 1][0];
}
/** saucer: centre (x,y), k scale */
function drawTeaSaucer(ctx, x, y, k, L) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(10, 8, 64, 15, 0, 0, TAU); ctx.fill();
  const china = mixc('#e6ded2', L.key, L.keyAmt * 0.4);
  ctx.fillStyle = mixc(china, L.mul, 0.35); ctx.beginPath(); ctx.ellipse(0, 2, 60, 14, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = china; ctx.beginPath(); ctx.ellipse(0, -1, 58, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = mixc(china, L.mul, 0.18); ctx.beginPath(); ctx.ellipse(0, -1, 36, 7, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba(PAL.gold || '#c8a050', 0.85); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(0, -1, 52, 10.5, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}
/** tulip tea glass. o: { tilt (rad, + leans right), level (0..1 fill), t } */
function drawTeaGlass(ctx, x, y, k, L, o = {}) {
  const tilt = o.tilt || 0, level = o.level ?? 0.86;
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(k, k);
  const gp = tulipPath(1);
  // glass body: faint tint so the wall reads
  ctx.fillStyle = rgba('#d8cce8', 0.12); ctx.fill(gp);
  // tea: clipped to the glass, surface stays level in world space
  const ly = -100 * level;
  ctx.save(); ctx.clip(gp);
  ctx.save(); ctx.translate(0, ly); ctx.rotate(-tilt);
  const tg = ctx.createLinearGradient(-40, 0, 40, 0);
  const lit = L.dir[0] < 0;
  tg.addColorStop(0, lit ? '#d0662a' : '#5a1a0c'); tg.addColorStop(0.5, '#9a3414'); tg.addColorStop(1, lit ? '#5a1a0c' : '#d0662a');
  ctx.fillStyle = tg; ctx.fillRect(-120, 0, 240, 200);
  ctx.fillStyle = '#c0582a'; ctx.beginPath(); ctx.ellipse(0, 0, tulipHalfW(ly) - 1, 4.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba('#ffd090', 0.5); ctx.beginPath(); ctx.ellipse(lit ? -6 : 6, -0.5, (tulipHalfW(ly) - 1) * 0.55, 1.8, 0, 0, TAU); ctx.fill();
  ctx.restore();
  // inner glow from the key side
  withOp(ctx, 'lighter', () => { const g = ctx.createRadialGradient(lit ? -14 : 14, -30, 2, 0, -30, 40); g.addColorStop(0, rgba('#ff9a40', 0.35)); g.addColorStop(1, rgba('#ff9a40', 0)); ctx.fillStyle = g; ctx.fillRect(-40, -100, 80, 100); });
  ctx.restore();
  // walls + rim
  ctx.strokeStyle = rgba('#efe6ff', 0.55); ctx.lineWidth = 2.2; ctx.stroke(gp);
  ctx.fillStyle = rgba('#efe6ff', 0.10); ctx.beginPath(); ctx.ellipse(0, -100, 32, 5.5, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba('#ffffff', 0.7); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -100, 32, 5.5, 0, 0, TAU); ctx.stroke();
  // vertical highlights
  const hs = lit ? -1 : 1;
  ctx.strokeStyle = rgba('#ffffff', 0.55); ctx.lineWidth = 3.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(hs * 24, -88); ctx.quadraticCurveTo(hs * 17, -66, hs * 23, -52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hs * 26, -40); ctx.quadraticCurveTo(hs * 29, -26, hs * 24, -12); ctx.stroke();
  ctx.strokeStyle = rgba(L.rim, 0.5); ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-hs * 28, -92); ctx.quadraticCurveTo(-hs * 18, -66, -hs * 28, -36); ctx.stroke();
  // thick base
  ctx.fillStyle = rgba('#efe6ff', 0.28); ctx.beginPath(); ctx.ellipse(0, -2, 22, 4, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
/** world point of the glass rim centre (for steam) */
function teaRim(x, y, k, tilt = 0) { return { x: x + Math.sin(tilt) * 100 * k, y: y - Math.cos(tilt) * 100 * k }; }
/** steam curling up from the glass */
function teaSteam(ctx, t, x, y, k, o = {}) {
  drawSmoke(ctx, t, x, y, k, Object.assign({ color: '#ece4f4', alpha: 0.22, height: 260, ribbons: 2, wind: 0.15, seed: 5 }, o));
}
/** a hand gripping the glass waist with fingers across the front.
    gx,gy = world point on the waist; dir = +1 fingers point right (hand comes from the left). */
function holdGlassHand(ctx, gx, gy, s, dir, L, ex, ey, o = {}) {
  const wx = gx - dir * 70 * s, wy = gy + 10 * s;
  drawForearm(ctx, ex, ey, wx, wy, 54 * s, 44 * s, OUTFIT.boss.suit, OUTFIT.boss.cuff, L, o.flash || 0);
  drawHand(ctx, { x: wx, y: wy, rot: dir * (PI / 2) + (o.rot || 0), s, side: dir > 0 ? 1 : -1, pose: o.pose || 'grip', light: L, ring: true, glint: o.glint || 0, flash: o.flash || 0 });
}
