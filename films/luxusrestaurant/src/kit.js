// SCENE KIT: shot list helpers shared by the scene files. Shots are pushed with ABSOLUTE start times;
// durations come from the next shot's start. Sound cues and music moods are registered here too and later
// exported (window.__cues / window.__moods) for audio/synth.py.
const FILM_END = 23603 / 30;        // = MP3 length rounded up to whole frames (786.7667 s)
const SHOTS = [], CUES = [], MOODS = [];
const at = i => ST[i] - .12;        // cut a hair before the sentence starts
function shot(t0, name, f) { SHOTS.push({ t0, name, f }); }
function cue(t, fx, db = -14, args, extra = {}) { CUES.push(Object.assign({ t: +t.toFixed(3), fx, db }, args ? { args } : {}, extra)); }
function mood(t0, t1, kind, extra = {}) { MOODS.push(Object.assign({ t0, t1, kind }, extra)); }
const NK = .25;
function noahP(t, o = {}) {
  const L = lifeAt(t, o.seed || 3), e = Object.assign({ mouth: 'smile' }, o.expr || {});
  if (!e.eyes) { e.lid = Math.max(e.lid || 0, L.lid); if (e.lid > .85) e.eyes = 'closed'; }
  return Object.assign({ k: NK, ink: 1.8, outfit: 'waiter', bob: L.bob * (o.breath ?? 1), tilt: (o.tilt || 0) + L.sway }, o, { expr: e });
}
function noahW(c, p, shadow = {}) { if (!p.sit && shadow !== false) castShadow(c, p.x, 120, Object.assign({ alpha: .3, len: 1.1, dir: 1 }, shadow)); drawNoahDressed(c, p); }
function noahWalkSide(c, t, x, o = {}) { castShadow(c, x, 110, { alpha: .28, len: 1, dir: 1 }); drawNoahSide(c, Object.assign({ x, k: NK, ink: 1.8, s: o.s || 1, walk: o.walk ?? t * 8, expr: Object.assign({ mouth: 'smile' }, o.expr || {}) }, o)); }
function P(who, t, o = {}) { return Object.assign({ who, k: NK, t, seed: o.seed || 9 }, o); }
function personW(c, p, shadow = {}) { if (!p.sit && shadow !== false) castShadow(c, p.x, 120, Object.assign({ alpha: .28, len: 1.1, dir: 1 }, shadow)); drawPerson(c, p); }
// Gegenbewegung: camera drifts one way (background parallax), the subject glides the other way in frame
function gegen(lt, T, o = {}) {
  const k = ease(clamp(lt / T)), z = o.z ?? 3.5, dir = o.dir ?? 1, sx0 = o.side === 'l' ? W * .34 : W * .66;
  const cam = { x: (o.x0 ?? 0) + dir * lerp(-1, 1, k) * (o.camDx ?? 90), y: o.y ?? -262, z: lerp(z, z * (o.zEnd ?? 1.04), k) };
  const sx = sx0 - dir * lerp(-1, 1, k) * (o.drift ?? 32);
  return { cam, x: cam.x + (sx - W / 2) / cam.z };
}
// gentle push/pull between two camera states over the shot
function camPush(lt, T, a, b, e = ease) { return CAM.mix(a, b, e(clamp(lt / T))); }
// whip-pan helper: x offset + speed-lines flag for the first `d` seconds of a shot
function whipIn(lt, d = .35, dist = 1600) { const k = clamp(lt / d); return { dx: -(1 - easeOut(k)) * dist, speed: k < 1 ? 0 : null }; }
function arm(a, b, hand) { return { a, b, hand }; }
const RELAX = { l: arm(.13, -.08), r: arm(.13, -.08) };
// hands to a world point for a standing (or seated) Noah at nx: returns arm spec
function reach(side, nx, wx, wy, o = {}) { const dy = o.sit ? (-(o.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0; const r = noahIK(side, (wx - nx) / (o.k || NK), wy / (o.k || NK) - dy - (o.bob || 0) - 50, o.up); return arm(r.a, r.b, o.hand); }
// plain item props drawn in world space at a hand
function bottle(c, x, y, s = 1, col = '#3a0e18') { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-14, 0); c.lineTo(-14, -70); c.quadraticCurveTo(-14, -84, -6, -92); c.lineTo(-6, -116); c.lineTo(6, -116); c.lineTo(6, -92); c.quadraticCurveTo(14, -84, 14, -70); c.lineTo(14, 0); c.closePath(); fs(c, col, 2); c.beginPath(); c.rect(-12, -54, 24, 30); fs(c, '#efe6d2', 1.5); c.beginPath(); c.rect(-7, -122, 14, 10); fs(c, '#c9a24a', 1.5); line(c, [-8, -66, -8, -8], 3, 'rgba(255,255,255,.35)'); c.restore(); }
function tray(c, x, y, s = 1, t = 0) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.ellipse(0, 0, 70, 12, 0, 0, Math.PI * 2); fs(c, '#c8ccd2', 2); clayRoulade(c, -24, -4, .35); platePorcelain(c, 30, -6, 26); clayBlob(c, 30, -14, 14, 8, '#e0a060', { seed: 4 }); c.restore(); }
function keys(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.arc(0, 0, 12, 0, Math.PI * 2); c.lineWidth = 4; c.strokeStyle = '#c9a24a'; c.stroke(); for (const a of [.4, 1.2]) { c.save(); c.rotate(a); c.beginPath(); c.rect(8, -4, 40, 8); fs(c, '#c8ccd2', 1.5); c.beginPath(); c.rect(38, 4, 6, 8); fs(c, '#c8ccd2', 1); c.restore(); } c.restore(); }
function folder(c, x, y, s = 1, label = 'BUSINESSPLAN') { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.rect(-60, -80, 120, 80); fs(c, '#2f6fb0', 2); for (let i = 0; i < 6; i++) line(c, [-56, -2 - i * 3, 58, -2 - i * 3], 1, '#fff'); c.beginPath(); c.rect(-44, -66, 88, 24); fs(c, '#fff', 1.5); c.font = hudFont(10); c.fillStyle = '#1f3a6a'; c.textAlign = 'center'; c.fillText(label, 0, -50); c.restore(); }
function envelope(c, x, y, s = 1, col = '#efe6d2') { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.rect(-40, -26, 80, 52); fs(c, col, 2); line(c, [-40, -26, 0, 4, 40, -26], 2, '#8a7a5a'); c.restore(); }
function mop(c, x, y, s = 1, t = 0) { c.save(); c.translate(x, y); c.scale(s, s); line(c, [0, 0, 30, -360], 8, '#8a6a4a'); c.beginPath(); c.moveTo(-60, 0); c.lineTo(60, 0); c.lineTo(50, -20); c.lineTo(-50, -20); c.closePath(); fs(c, '#4a8ad0', 2); for (let i = 0; i < 10; i++) line(c, [-50 + i * 11, 0, -54 + i * 11 + Math.sin(t * 8 + i) * 4, 22], 4, '#e8e0d0'); c.restore(); }
function calculator(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.roundRect(-30, -10, 60, 10, 3); fs(c, '#3a3a40', 1.5); c.beginPath(); c.moveTo(-30, -10); c.lineTo(-24, -22); c.lineTo(24, -22); c.lineTo(30, -10); c.closePath(); fs(c, '#4a4a52', 1.5); c.fillStyle = '#9ad0a0'; c.fillRect(-16, -20, 32, 5); c.restore(); }
function paperStack(c, x, y, n, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); for (let i = 0; i < n; i++) { c.save(); c.translate((rnd(i + 7) - .5) * 6, -i * 5); c.rotate((rnd(i) - .5) * .06); c.beginPath(); c.rect(-50, -5, 100, 5); fs(c, ['#f4f0e4', '#fff', '#e8e0c8', '#f0e8f4'][i % 4], 1.2); c.restore(); } c.restore(); }
function clockBig(c, x, y, r, hh, mm, o = {}) { // analog + digital label (screen)
  c.save(); c.translate(x, y); c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fillStyle = '#fbf6ea'; c.fill(); c.lineWidth = 6; c.strokeStyle = HUD.ink; c.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, [Math.cos(a) * r * .8, Math.sin(a) * r * .8, Math.cos(a) * r * .92, Math.sin(a) * r * .92], 4, HUD.ink); }
  const ah = ((hh % 12) + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2, am = mm / 60 * Math.PI * 2 - Math.PI / 2; line(c, [0, 0, Math.cos(ah) * r * .5, Math.sin(ah) * r * .5], 9, HUD.ink); line(c, [0, 0, Math.cos(am) * r * .78, Math.sin(am) * r * .78], 6, HUD.accent);
  circle(c, 0, 0, 8); c.fillStyle = HUD.ink; c.fill(); if (o.label !== false) hudText(c, String(Math.floor(hh)).padStart(2, '0') + ':' + String(Math.floor(mm)).padStart(2, '0'), 0, r + 58, r * .42, '#fff', 'center');
  c.restore();
}
// world-space speech/thought bubble with a hand-drawn sketch inside (no words)
function thoughtBubble(c, x, y, w, h, k, draw, t) { const kk = easeBack(clamp(k)); if (k <= 0) return; c.save(); c.translate(x, y); c.scale(kk, kk);
  for (const [dx, dy, r] of [[-w * .42, h * .62, 10], [-w * .34, h * .5, 16]]) { circle(c, dx, dy, r); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 4; c.strokeStyle = HUD.ink; c.stroke(); }
  c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 5; c.strokeStyle = HUD.ink; c.stroke(); c.save(); c.beginPath(); c.ellipse(0, 0, w / 2 - 8, h / 2 - 8, 0, 0, Math.PI * 2); c.clip(); draw(c, t); c.restore(); c.restore(); }
function screenPos(cam, x, y) { return toScreen(cam, 1, x, y); }
// a "memory" frame look: warm edges + film grain lines
function memoryLook(c, t) { const g = c.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .85); g.addColorStop(0, 'rgba(255,220,170,0)'); g.addColorStop(1, 'rgba(110,70,30,.55)'); c.fillStyle = g; c.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) { const x = (rnd(Math.floor(t * 12) + i * 13) * W); c.fillStyle = 'rgba(255,240,210,.08)'; c.fillRect(x, 0, 2, H); } }
function buildShots() { SHOTS.sort((a, b) => a.t0 - b.t0); return SHOTS.map((s, i) => ({ name: s.name, dur: +(((i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : FILM_END) - s.t0)).toFixed(4), f: s.f })); }
function drawPersonHand(p, side) { return noahHandWorld(Object.assign({}, p, { bob: p.bob ?? 0 }), side); }
// low desk that fits seated characters (top at the dining-table height), with monitor, papers, pen holder
function bankDesk(c, x, o = {}) {
  const w = o.w || 520, top = -128, t = o.t || 0; c.save(); c.translate(x, 0);
  c.beginPath(); c.ellipse(0, 2, w * .55, 14, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(20,20,30,.25)'; c.fill();
  c.beginPath(); c.moveTo(-w / 2 + 10, top - 20); c.lineTo(w / 2 - 10, top - 20); c.lineTo(w / 2, top); c.lineTo(-w / 2, top); c.closePath(); fs(c, '#c9a070', 2.5);
  c.beginPath(); c.rect(-w / 2, top, w, -top); fs(c, '#a87a50', 3); c.beginPath(); c.rect(-w / 2 + 16, top + 16, w - 32, -top - 30); fs(c, '#b8885a', 2); line(c, [-w / 2 + 30, top + 40, w / 2 - 30, top + 40], 2, 'rgba(60,30,10,.3)');
  const mx = o.monitorX ?? 110; c.beginPath(); c.rect(mx - 8, top - 70, 16, 50); fs(c, '#2a2e36', 1.5); c.beginPath(); c.roundRect(mx - 90, top - 190, 180, 120, 6); fs(c, '#1f2228', 2.5); c.fillStyle = o.screen || '#2d6fb0'; c.fillRect(mx - 80, top - 180, 160, 100); for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#8fd0ff' : '#ffd36a'; c.fillRect(mx - 70 + i * 30, top - 92 - (20 + rnd(i) * 50), 20, 20 + rnd(i) * 50); }
  c.beginPath(); c.rect(mx - 70, top - 30, 140, 8); fs(c, '#d8dce2', 1.5);
  for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(-w / 2 + 30 + i * 3, top - 26 - i * 5, 110, 5); fs(c, '#fff', 1.2); }
  c.beginPath(); c.rect(-40, top - 50, 30, 36); fs(c, '#4a4a52', 1.5); line(c, [-30, top - 50, -36, top - 80], 3, '#c0392b'); line(c, [-20, top - 50, -14, top - 76], 3, '#2f6fb0');
  c.beginPath(); c.rect(w / 2 - 70, top - 64, 40, 50); fs(c, '#e05a4a', 1.8); c.restore();
}
// open handwritten notebook (screen or world units); o.page: 'omaL'/'omaR' generic, 'p14' the roulade page
function openBook(c, x, y, w, h, t, o = {}) {
  c.save(); c.translate(x, y);
  c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; c.shadowOffsetY = 20; c.fillStyle = '#6a2a20'; rrect(c, -w / 2 - 20, -h / 2 - 16, w + 40, h + 32, 14); c.fill(); c.restore();
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, -h / 2); c.quadraticCurveTo(s * w * .25, -h / 2 - 14, s * w / 2, -h / 2 + 4); c.lineTo(s * w / 2, h / 2 - 4); c.quadraticCurveTo(s * w * .25, h / 2 + 8, 0, h / 2); c.closePath(); c.fillStyle = '#f1e4c2'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#8a6a3a'; c.stroke();
    c.save(); c.clip(); for (let i = 0; i < 18; i++) line(c, [s * 30, -h / 2 + 70 + i * (h - 110) / 18, s * (w / 2 - 20), -h / 2 + 70 + i * (h - 110) / 18], 1.2, 'rgba(90,120,170,.25)');
      const g = c.createLinearGradient(0, 0, s * 120, 0); g.addColorStop(0, 'rgba(90,60,20,.35)'); g.addColorStop(1, 'rgba(90,60,20,0)'); c.fillStyle = g; c.fillRect(s > 0 ? 0 : -120, -h / 2, 120, h);
      for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(s * (60 + rnd(i + (s > 0 ? 5 : 0)) * (w / 2 - 100)), -h / 2 + rnd(i + 9) * h, 6 + rnd(i) * 26, 0, Math.PI * 2); c.fillStyle = 'rgba(150,110,50,.08)'; c.fill(); } c.restore(); }
  const ink = '#24305e', k = o.write ?? 1;
  const hand = (s, x0, y0, size, kk, col = ink) => { const n = Math.floor(s.length * clamp(kk)); if (n <= 0) return; c.save(); c.translate(x0, y0); c.transform(1, 0, -.22, 1, 0, 0); c.font = `700 ${size}px ${NOAH_FONT}, Inter, sans-serif`; c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.globalAlpha = .9; c.fillText(s.slice(0, n), 0, 0); c.restore(); };
  const pages = o.page === 'p14' ? [['Rinderrouladen', ['4 Scheiben Rind, dünn', 'Senf, Speck, Zwiebeln', 'Gewürzgurken', 'Rotkohl mit Apfel', 'Klöße (halb und halb)']], ['Omas Soße', ['anbraten, ablöschen', 'mit Rotwein', 'langsam schmoren:', '3 Stunden!', 'nicht abkürzen.']]]
    : [['Kartoffelsalat', ['1 kg Kartoffeln', 'Brühe, Essig, Öl', 'Zwiebeln, Gurken', 'warm anmachen!']], ['Apfelkuchen', ['500 g Mehl, 250 g Butter', '6 Äpfel, Zimt', 'Streusel obendrauf', '45 Min. bei 180°']]];
  const scale = w / 1300;
  pages.forEach(([title, lines], pi) => { const sx = pi ? 60 * scale * 1.1 : -w / 2 + 70 * scale; hand(title, sx, -h / 2 + 110 * scale, 54 * scale, k * 2 - pi * .3, pi ? '#8a2a20' : ink); line(c, [sx, -h / 2 + 128 * scale, sx + 360 * scale, -h / 2 + 124 * scale], 3 * scale, 'rgba(36,48,94,.6)');
    lines.forEach((l, i) => hand(l, sx + 10 * scale, -h / 2 + (210 + i * 82) * scale, 38 * scale, k * (lines.length + 2) - i - 1 - pi * 2, ink)); });
  if (o.page === 'p14') { hand('14', w / 2 - 110 * scale, h / 2 - 50 * scale, 40 * scale, 1, '#8a6a3a'); c.save(); c.translate(w * .32, h * .25); clayRoulade(c, 0, 0, 1.2 * scale * 1.6); c.restore(); }
  else { hand('7', w / 2 - 100 * scale, h / 2 - 50 * scale, 40 * scale, 1, '#8a6a3a'); }
  c.beginPath(); c.moveTo(w * .015, -h / 2); c.lineTo(w * .02, h / 2 + 60 * scale); c.lineTo(w * .035, h / 2 + 40 * scale); c.lineTo(w * .05, h / 2 + 64 * scale); c.lineTo(w * .045, -h / 2); c.closePath(); c.fillStyle = '#c9a24a'; c.fill();
  c.restore();
}

const S3WALK = (t, o) => [{ who: PEOPLE.guest(3), x: -6 + (t % 30) * 1.2, z: -2.5, p: Object.assign({ expr: { mouth: 'smile' } }, walkLegs(t, 7)) }, { who: PEOPLE.guest(14), x: 26 - (t % 30) * 1.1, z: -1.7, p: walkLegs(t + 1, 7) }, { who: PEOPLE.guest(22), x: -14 + (t % 40) * .9, z: -3.0, p: walkLegs(t + 2, 6) }];
const fullGuests = (t, talk = true) => (c, tx, i) => { for (const dx of [-90, 90]) drawPerson(c, P(PEOPLE.guest((Math.abs(Math.round(tx / 37)) * 5 + (dx > 0 ? 3 : 0)) % 41), t, { x: tx + dx, sit: true, seatH: 250, seed: i * 3 + dx, expr: talk ? (talkMouth(t + i + dx, 0, 999) || { mouth: 'smile' }) : { mouth: 'smile' }, arms: { l: arm(.4, -1.1), r: Math.sin(i + dx) > .5 ? arm(1.1, -1.7) : arm(.4, -1.1) } })); };
