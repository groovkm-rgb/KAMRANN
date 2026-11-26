// INFO CARDS (screen space, German text). Narrow vertical cards centred in the frame, between y 680 and 1580.
const CARD = { paper: '#fbf6ea', ink: '#211c1a', muted: '#7d7064', red: '#d9433a', green: '#3d8a4f', blue: '#2f6fb0', gold: '#e0a43a', line: '#e4d9c6' };
function cardEnv(lt, t0, t1) { const a = clamp((lt - t0) / .35), b = t1 == null ? 1 : clamp((t1 - lt) / .25); return { s: a < 1 ? easeBack(a) : (b < 1 ? ease(b) : 1), a: Math.min(1, a * 3, b * 2) }; }
// o: { cx, y, w, h, tilt, t0, t1, shake }; draw(c, w, h) in card-local coords (0,0 = top-left)
function card(c, lt, o, draw) {
  const e = cardEnv(lt, o.t0 ?? 0, o.t1); if (e.a <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha *= e.a;
  const sh = o.shake || 0;
  c.translate(o.cx + (rnd(Math.floor(lt * 60)) - .5) * sh, o.y + o.h / 2 + (rnd(Math.floor(lt * 60) + 3) - .5) * sh); c.rotate((o.tilt ?? -.02) + (1 - e.s) * .1); c.scale(e.s * (o.sx || 1), e.s * (o.sy || 1)); c.translate(-o.w / 2, -o.h / 2);
  // shadow
  c.save(); c.fillStyle = 'rgba(0,0,0,.45)'; c.filter = 'blur(14px)'; rrect(c, 10, 22, o.w, o.h, 34); c.fill(); c.restore();
  // sticker border + body
  rrect(c, -12, -12, o.w + 24, o.h + 24, 40); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 6; c.strokeStyle = CARD.ink; c.stroke();
  rrect(c, 0, 0, o.w, o.h, 30); c.fillStyle = o.paper || CARD.paper; c.fill();
  c.save(); rrect(c, 0, 0, o.w, o.h, 30); c.clip(); draw(c, o.w, o.h); c.restore();
  c.restore();
}
function cardTitle(c, s, w, col = CARD.red) { c.fillStyle = col; c.fillRect(0, 0, w, 96); txt(c, s, w / 2, 66, 50, '#fff'); }
// small icons
function iconStove(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); rrect(c, -26, -18, 52, 40, 6); fs(c, '#9aa3ab', 3); for (const dx of [-12, 12]) { c.beginPath(); c.arc(dx, -18, 8, Math.PI, 0); c.fillStyle = '#ff8a3a'; c.fill(); } c.restore(); }
function iconHammer(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-.6); line(c, [0, -8, 0, 28], 8, '#8a5a32'); c.beginPath(); rrect(c, -20, -24, 40, 18, 4); fs(c, '#6d757d', 3); c.restore(); }
function iconChair(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); line(c, [-12, -26, -12, 24], 6, '#8a5a32'); line(c, [-12, 4, 16, 4, 16, 24], 6, '#8a5a32'); line(c, [-12, 4, -12, 24], 6, '#8a5a32'); c.restore(); }
function iconStamp(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); rrect(c, -16, -12, 32, 24, 3); fs(c, '#f2ecdc', 3); ell(c, 4, 4, 9, 9, 'rgba(217,67,58,.85)', 2); line(c, [-10, -4, 0, -4], 3, '#999'); c.restore(); }
function shopIcon(c, x, y, s, state) { // state 1 lit, 0 dark/grey
  c.save(); c.translate(x, y); c.scale(s, s);
  const lit = clamp(state), wall = lit > .5 ? '#c96a4a' : '#7d7d84', aw = lit > .5 ? '#d9433a' : '#9a9aa2';
  c.beginPath(); c.rect(-40, -30, 80, 62); fs(c, wall, 4);
  c.beginPath(); c.moveTo(-46, -30); c.lineTo(46, -30); c.lineTo(40, -50); c.lineTo(-40, -50); c.closePath(); fs(c, aw, 4);
  c.beginPath(); c.rect(-30, -14, 30, 26); fs(c, lit > .5 ? `rgba(255,${200},${110},1)` : '#3a3d48', 3);
  c.beginPath(); c.rect(8, -14, 22, 46); fs(c, lit > .5 ? '#6a3a22' : '#4a4a52', 3);
  if (lit > .5) glowAt(c, -15, 0, 50, '255,200,110', .35 * lit);
  c.restore();
}
function stamp(c, x, y, k, text, col = '217,40,40') {
  if (k <= 0) return; const s = k < 1 ? 2.4 - 1.4 * easeOut(k) : 1, a = k < 1 ? easeOut(k) : 1;
  c.save(); c.translate(x, y); c.rotate(-.22); c.scale(s, s); c.globalAlpha = a;
  c.lineWidth = 12; c.strokeStyle = `rgb(${col})`; rrect(c, -230, -72, 460, 144, 18); c.stroke(); rrect(c, -212, -56, 424, 112, 12); c.lineWidth = 4; c.stroke();
  txt(c, text, 0, 34, 98, `rgb(${col})`, 'center', { weight: 800 });
  // ink texture holes
  c.fillStyle = 'rgba(251,246,234,.8)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc((rnd(i) - .5) * 440, (rnd(i + 3) - .5) * 130, 2 + rnd(i + 5) * 4, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
