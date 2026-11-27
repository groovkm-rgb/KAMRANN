// Title templates (all text German). Fonts from lib/fonts-titles.js: FBebas, FAnton, FVHS (VT323), FType (Special Elite), FOswald.
//   titleOpen(c, t)        — opening card bottom-left: "TAG 30" (typed) + rule + "03:00 UHR" (typewriter) + cursor
//   vhsOSD(c, t, o)        — VHS on-screen display for the rewind: ◀◀ ZURÜCKSPULEN / ❚❚ PAUSE, tape counter, big "TAG nn"
//   titleDay(c, t, t0)     — "30 TAGE ZUVOR" kicker + poster "TAG 1"
// Typing times come from TIMING (shared with the audio clicks).
function typedChars(t) {
  // returns [n0, n1]: visible chars on line 0 and line 1 (same schedule the audio uses)
  const L = TIMING.type_lines, st = TIMING.type_step, gap = TIMING.type_gap; let t0 = TIMING.type_start; const out = [];
  for (const s of L) { out.push(clamp(Math.floor((t - t0) / st) + 1, 0, s.length)); t0 += s.length * st + gap; }
  return out;
}
function spaced(c, s, x, y, sp) { c.letterSpacing = `${sp}px`; c.fillText(s, x, y); c.letterSpacing = '0px'; }
function titleOpen(c, t) {
  if (t < TIMING.type_start - .1) return;
  const [n0, n1] = typedChars(t), L = TIMING.type_lines, fade = 1 - seg(t, TIMING.shots.s2 - .4, TIMING.shots.s2 - .05);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = fade;
  const x = 128, y = 905;
  // soft dark plate for legibility (no hard box)
  const g = c.createRadialGradient(x + 220, y - 90, 20, x + 220, y - 90, 520); g.addColorStop(0, 'rgba(0,0,6,.55)'); g.addColorStop(1, 'rgba(0,0,6,0)'); c.fillStyle = g; c.fillRect(0, y - 520, 900, 700);
  // accent bar
  const bar = ez(seg(t, TIMING.type_start - .1, TIMING.type_start + .25)); c.fillStyle = '#ff7a2a'; c.fillRect(x - 36, y - 210, 9, 250 * bar);
  // line 0: TAG 30 — condensed display face
  c.font = `200px FBebas`; c.textBaseline = 'alphabetic'; c.fillStyle = 'rgba(0,0,0,.6)'; spaced(c, L[0].slice(0, n0), x + 5, y - 60 + 5, 10);
  c.fillStyle = '#f6f0e6'; spaced(c, L[0].slice(0, n0), x, y - 60, 10);
  // rule
  const r = ez(seg(t, TIMING.type_start + L[0].length * TIMING.type_step, TIMING.type_start + L[0].length * TIMING.type_step + .3)); c.fillStyle = 'rgba(246,240,230,.55)'; c.fillRect(x, y - 34, 430 * r, 3);
  // line 1: 03:00 UHR — typewriter face, warm
  c.font = `60px FType`; c.fillStyle = 'rgba(0,0,0,.6)'; spaced(c, L[1].slice(0, n1), x + 3, y + 36, 6); c.fillStyle = '#ffb36b'; spaced(c, L[1].slice(0, n1), x, y + 33, 6);
  // blinking block cursor after the last typed char
  const onL1 = n1 > 0 || n0 >= L[0].length; c.font = onL1 ? `60px FType` : `200px FBebas`; c.letterSpacing = onL1 ? '6px' : '10px';
  const w = c.measureText(onL1 ? L[1].slice(0, n1) : L[0].slice(0, n0)).width; c.letterSpacing = '0px';
  if (Math.floor(t * 2.6) % 2 === 0 || (onL1 ? n1 < L[1].length : true)) { c.fillStyle = onL1 ? '#ffb36b' : '#f6f0e6'; if (onL1) c.fillRect(x + w + 8, y - 12, 26, 48); else c.fillRect(x + w + 10, y - 210, 14, 150); }
  c.restore();
}
function chromaText(c, s, x, y, off = 4) {
  c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,40,60,.85)'; c.fillText(s, x - off, y); c.fillStyle = 'rgba(40,220,255,.85)'; c.fillText(s, x + off, y); c.restore();
  c.fillStyle = '#f4f6f2'; c.fillText(s, x, y);
}
function vhsOSD(c, t, o) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.textBaseline = 'top'; c.font = '92px FVHS';
  const jit = (rnd(Math.floor(t * 30)) - .5) * 4;
  if (o.pause) { c.fillStyle = '#f4f6f2'; c.fillRect(96, 96, 16, 58); c.fillRect(124, 96, 16, 58); chromaText(c, 'PAUSE', 170, 84, 3); }
  else if (Math.floor(t * 4) % 2 === 0) { c.fillStyle = '#f4f6f2'; for (const dx of [0, 38]) { c.beginPath(); c.moveTo(140 + dx, 96); c.lineTo(100 + dx, 125); c.lineTo(140 + dx, 154); c.closePath(); c.fill(); } chromaText(c, 'ZURÜCKSPULEN', 210, 84, 3); }
  c.textAlign = 'right'; chromaText(c, 'SP', W - 96, 84, 3);
  const secs = Math.max(0, o.clock), hh = Math.floor(secs / 3600), mm = Math.floor(secs / 60) % 60, ss = Math.floor(secs) % 60;
  c.font = '72px FVHS'; chromaText(c, `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, W - 96, 170, 3);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '300px FVHS'; chromaText(c, `TAG ${o.day}`, W / 2 + jit, H / 2 + 10, 6);
  c.textAlign = 'left'; c.textBaseline = 'bottom'; c.font = '64px FVHS'; chromaText(c, 'TAG 30  →  TAG 1', 96, H - 80, 2);
  c.restore();
}
function titleDay(c, t, t0) {
  const a = ez(seg(t, t0, t0 + .3)), k = seg(t, t0 + .1, t0 + .45), s = lerp(1.08, 1, ez(a));
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(W / 2, 400, 40, W / 2, 400, 640); g.addColorStop(0, `rgba(40,20,6,${.45 * a})`); g.addColorStop(1, 'rgba(40,20,6,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 800);
  c.translate(W / 2, 400); c.scale(s, s); c.globalAlpha = a; c.textAlign = 'center';
  // kicker with rules
  c.font = '600 44px FOswald'; c.textBaseline = 'middle'; c.letterSpacing = '12px'; const kw = c.measureText('30 TAGE ZUVOR').width; c.letterSpacing = '0px';
  c.globalAlpha = a * ez(k); c.fillStyle = 'rgba(42,20,6,.82)'; c.beginPath(); c.roundRect(-kw / 2 - 34, -232, kw + 68, 70, 35); c.fill();
  c.fillStyle = '#ffd9a0'; spaced(c, '30 TAGE ZUVOR', 6, -196, 12);
  c.globalAlpha = a; c.font = '280px FAnton'; c.textBaseline = 'middle';
  c.fillStyle = '#2a1406'; spaced(c, 'TAG 1', 14 + 8, 14, 8);
  c.lineWidth = 12; c.strokeStyle = '#2a1406'; c.lineJoin = 'round'; c.letterSpacing = '8px'; c.strokeText('TAG 1', 4, 0); c.letterSpacing = '0px';
  const fg = c.createLinearGradient(0, -130, 0, 130); fg.addColorStop(0, '#fffaf0'); fg.addColorStop(1, '#ffd9a0'); c.fillStyle = fg; spaced(c, 'TAG 1', 4, 0, 8);
  c.restore();
}
