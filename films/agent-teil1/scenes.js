// AGENT – TEIL 1 (0:00–3:40,03), synced 1:1 to TEIL1.mp3. Times = audio seconds (from the transcript).
const END = 220.03;
// ======================= 01 INTRO =======================
const TAG1 = { t0: 3.95, t1: 8.2, corner: 'tl', text: 'TAG 1 · 03:00 Uhr', stamp: false }; dosCardCues(TAG1, 1);
CUE('amb', 0, { name: 'bedroomRain', until: 42.0 });
CUE('vibrate', 5.14, { dur: 1.55 }); CUE('vibrate', 7.05, { dur: 1.2 }); CUE('vibrate', 8.55, { dur: .8 }); CUE('rustle', 9.1); CUE('rustle', 13.5, { soft: 1 });
const BEATS1 = beatsBetween(18.6, 21.4, 64, 80); BEATS1.forEach(b => CUE('heart', b));
function shotBedWide(lt, T, t) {
  const v = lt < 2.6 ? camAt(S(-330, -640, .8), S(-180, -600, .9), lt / 2.6) : camAt(S(-180, -600, .9), S(490, -470, 2.3), (lt - 2.6) / 1.5);
  const buzz = t > 5.14 && t < 6.69 ? (Math.floor((t - 5.14) / .38) % 2 ? 0 : 3) : 0;
  return { set: bedroomSide, setOpts: { phoneGlow: t > 5.14 ? clamp((t - 5.14) * 4, 0, 1) : 0, buzz, noah: withBlink(EX.alert, t, 6, 2), clock: '03:00' }, cam: drift(v, t, 4), vignette: .2,
    screen: [c => rainSheet(c, t, { amount: .25, alpha: .12 }), c => G.night(c, t), c => dosTag(c, t, TAG1)] };
}
function shotLock(lt, T, t) {
  const v = camAt(S(0, 0, 1.25), S(0, -20, 1.45), lt / T), lift = seg(t, 9.35, 9.95), grab = seg(t, 8.95, 9.35);
  const buzz = (t > 7.05 && t < 8.25) || (t > 8.55 && t < 9.35) ? Math.sin(t * 95) * 5 : 0;
  return { set: (c, cam, tt) => { deskTopNight(c, cam, tt); return { base: '#100c0a' }; }, cam: v, vignette: .2,
    fx: [c => {
      c.save(); c.translate(buzz, lift * -40); c.rotate(-.08 + buzz * .004 + lift * .12); c.scale(1 + lift * .35, 1 + lift * .35);
      c.save(); c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 30 + lift * 40; c.shadowOffsetY = 14 + lift * 30; c.fillStyle = '#000'; rrect(c, -190, -380, 380, 760, 50); c.fill(); c.restore();
      phoneUI(c, -175, -365, 350, 730, { mode: 'lock', big: '03:00', date: 'Dienstag', notif: seg(t, 6.95, 7.35), t, glow: 1.4 }); c.restore();
      if (grab > 0) { const hx = lerp(700, 140, ease(grab)), hy = lerp(900, 230, ease(grab)) - lift * 40; line(c, [hx + 600, hy + 600, hx + 60, hy + 70], 150, OUT); line(c, [hx + 600, hy + 600, hx + 60, hy + 70], 132, '#8fa3bf'); for (let i = -1; i <= 1; i++) line(c, [hx + 600 + i * 40, hy + 600 - i * 40, hx + 60 + i * 40, hy + 70 - i * 40], 10, '#c9d6e6'); drawNoahHand(c, hx, hy, .75, 2.4); }
    }],
    screen: [c => G.night(c, t), c => dosTag(c, t, TAG1)] };
}
function shotMsg(lt, T, t) {
  const sway = Math.sin(t * 1.3) * 6;
  return { set: (c, cam, tt) => { ceilingNight(c, cam, tt); return { base: '#0c0f18' }; }, cam: S(0, 0, 1 + lt * .012), vignette: .3,
    fx: [c => { c.save(); c.translate(sway, 30 + Math.cos(t * 1.1) * 5); c.rotate(.02 + sway * .001); phoneUI(c, -250, -470, 500, 1000, { mode: 'chat', words: 6, t, glow: 1.6 });
      line(c, [120, 900, 150, 520], 170, OUT); line(c, [120, 900, 150, 520], 150, '#8fa3bf'); for (const d of [-40, 0, 40]) line(c, [120 + d, 900, 150 + d, 520], 10, '#c9d6e6'); drawNoahHand(c, 160, 470, 1.05, Math.PI * .92); c.restore(); }],
    screen: [c => noirGrade(c, t, { vig: .7 })] };
}
const bedTopShot = (a, b, glow = 1, ex) => (lt, T, t) => ({ set: bedTop, setOpts: { noahExpr: withBlink(ex ? ex(t) : EX.alert, t, 7, 5), phoneGlow: glow }, cam: drift(camAt(a, b, lt / T), t, 3), vignette: .2, screen: [c => G.night(c, t)] });
function shotFace(lt, T, t) {
  const pulse = pulseAt(BEATS1, t), v = camAt(S(-300, -700, 1.95), S(-300, -720, 2.25), lt / T); v.z += pulse * .015;
  return { set: bedTop, setOpts: { noahExpr: Object.assign({}, EX.alert, { look: lt < 1.6 ? .15 : -.55 }), phoneGlow: 1.2 }, cam: v, vignette: .3,
    screen: [c => { c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, H, 0, H * .3); g.addColorStop(0, `rgba(90,130,255,${.38 + pulse * .05})`); g.addColorStop(1, 'rgba(90,130,255,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }, c => noirGrade(c, t, { vig: .7 + pulse * .08 })] };
}
// montage: kids asleep (overhead), mother's photo, the 'Versicherung' card on the hall table
function kidsTop(c, cam, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#1a1512'; c.fillRect(0, 0, W, H);
  layer(c, cam, 1, c => {
    for (let i = -30; i < 30; i++) { c.fillStyle = i % 2 ? '#2a2420' : '#30281f'; c.fillRect(-4000, i * 70, 8000, 70); }
    c.fillStyle = '#3a3a5a'; c.beginPath(); c.ellipse(0, 200, 700, 300, 0, 0, Math.PI * 2); c.fill();
    for (const [x, look, out] of [[-480, 'son', 'pyjama'], [480, 'daughter', 'nightie']]) {
      c.beginPath(); rrect(c, x - 330, -900, 660, 1500, 30); fs(c, '#6a4a34', 4); c.beginPath(); rrect(c, x - 300, -870, 600, 1440, 26); fs(c, '#d8d4e0', 3);
      c.beginPath(); rrect(c, x - 230, -850, 460, 240, 60); fs(c, '#efeae8', 3);
      drawPal(c, { look, x, y: -60, k: .58, ink: 1.8, outfit: out, tilt: x < 0 ? -.2 : .25, expr: { eyes: 'closed', mouth: 'soft' } });
      c.beginPath(); c.moveTo(x - 300, -360); c.quadraticCurveTo(x, -400, x + 300, -360); c.lineTo(x + 300, 560); c.lineTo(x - 300, 560); c.closePath(); fs(c, x < 0 ? '#3a6a9a' : '#9a4a6a', 3);
      c.save(); c.clip(); for (let k = 0; k < 8; k++) for (let j = 0; j < 12; j++) { star(c, x - 270 + k * 80, -320 + j * 80, 14, 5, .45); c.fillStyle = 'rgba(255,240,180,.35)'; c.fill(); } c.restore();
    }
    // teddy + night light
    circle(c, -60, -700, 60); fs(c, '#a8784a', 3); circle(c, -100, -750, 24); fs(c, '#a8784a', 3); circle(c, -20, -750, 24); fs(c, '#a8784a', 3);
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgb(80,85,130)'; c.fillRect(-5000, -5000, 10000, 10000); c.restore();
    bloom(c, 0, -950, 900, '255,190,120', .35); blindStripes(c, -1600, -1500, 2600, 1900, 14, 120, 44, .08);
  });
  return { base: '#1a1512' };
}
function photoShelf(c, cam, t) {
  const r = room(c, cam, t, { wall: '#2a2a3a', floor: '#2a2018', light: 'night', back: (c, b) => {
    c.beginPath(); c.rect(-700, b - 640, 1400, 40); fs(c, '#4a3020', 3);
    // framed photo of Noah's mother, a smaller one of the kids, a clock
    c.beginPath(); c.rect(-200, b - 1060, 330, 420); fs(c, '#6a4a2a', 6); c.fillStyle = '#c8c0b0'; c.fillRect(-176, b - 1036, 282, 372); drawPalHead(c, -35, b - 880, .38, 'mother', { mouth: 'smile', lid: .3 });
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-176, b - 1036, 282, 372);
    c.beginPath(); c.rect(200, b - 900, 230, 260); fs(c, '#3a3a40', 5); c.fillStyle = '#c8c0b0'; c.fillRect(216, b - 884, 198, 228); drawPalHead(c, 270, b - 780, .17, 'son', { mouth: 'smile' }); drawPalHead(c, 360, b - 772, .15, 'daughter', { mouth: 'smile' });
    c.beginPath(); c.rect(-560, b - 820, 180, 180); fs(c, '#2a2a30', 4); seg7(c, '03:02', -540, b - 760, 40, '#ff3b2f');
  } });
  return r;
}
function hallTable(c, cam, t) {
  deskTop(c, cam, t);
  layer(c, cam, 1, c => {
    c.save(); c.translate(-80, 40); c.rotate(-.07); c.fillStyle = '#efe9da'; c.fillRect(-420, -240, 840, 480); c.strokeStyle = '#222'; c.lineWidth = 4; c.strokeRect(-420, -240, 840, 480);
    // generic umbrella logo + German text, name blacked out
    c.save(); c.translate(-280, -90); c.beginPath(); c.arc(0, 0, 70, Math.PI, 0); c.closePath(); c.fillStyle = '#2f5f9f'; c.fill(); line(c, [0, 0, 0, 70, -20, 80], 8, '#2f5f9f'); c.restore();
    hudText(c, 'Versicherung', -180, -80, 64, '#1a2234'); hudText(c, 'Kundenberatung', -180, -20, 34, '#5a6070');
    c.fillStyle = '#111'; c.fillRect(-360, 70, 330, 46); hudText(c, 'Versicherungskaufmann', -360, 170, 34, '#1a2234'); c.restore();
    c.save(); c.translate(520, 260); c.rotate(.6); line(c, [0, 0, 160, 0], 12, '#b8a060'); circle(c, -40, 0, 46); c.lineWidth = 10; c.strokeStyle = '#b8a060'; c.stroke(); c.restore();
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgb(90,95,135)'; c.fillRect(-5000, -5000, 10000, 10000); c.restore(); blindStripes(c, -2000, -1600, 3000, 1500, 12, 150, 50, .1);
  });
  return { base: '#100c0a' };
}
function deskTopNight(c, cam, t) { deskTop(c, cam, t); layer(c, cam, 1, c => { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(60,70,110,.75)'; c.fillRect(-4000, -4000, 8000, 8000); c.restore(); seg7(c, '03:00', -760, -560, 120, '#ff3b2f'); c.beginPath(); rrect(c, -800, -600, 400, 210, 16); c.lineWidth = 8; c.strokeStyle = '#151619'; c.stroke(); blindStripes(c, -2000, -1600, 3000, 1500, 12, 150, 50, .07); }); }
function ceilingNight(c, cam, t) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0d111c'; c.fillRect(0, 0, W, H); layer(c, cam, .8, c => { c.fillStyle = '#151a28'; c.fillRect(-3000, -3000, 6000, 6000); blindStripes(c, -2200, -1400, 3600, 1300, 12, 120, 40, .09); circle(c, 700, -380, 120); fs(c, '#1d2334', 4); circle(c, 700, -380, 50); fs(c, '#2a3044', 3); }); }
// ---- FILM vs. REALITÄT ----
const ROWS1 = [['Sportwagen', 'Kleinwagen'], ['Smoking', 'grauer Mantel'], ['Action', 'Berichte lesen'], ['Weltberühmt', 'Niemand kennt dich'], ['Martini', 'kalter Kaffee']];
const TB1 = { t0: 42.0, t1: 49.38, head: 43.25, rows: [43.9, 44.5, 45.1, 45.7, 46.3], strike: 48.25, spoken: [[45.96, 0], [46.96, 1], [48.14, 4]] };
function filmTable(c, w, h, t) {
  pageHead(c, w, t, TB1.head, 'FILM vs. REALITÄT');
  const cx = [90, 830], cw = 680, y0 = 205, rh = 100, kF = clamp((t - TB1.head) / .4, 0, 1), struck = clamp((t - TB1.strike) / .45, 0, 1);
  c.save(); c.globalAlpha = kF; const gF = c.createLinearGradient(cx[0], y0, cx[0] + cw, y0 + 660); gF.addColorStop(0, '#ffcf4a'); gF.addColorStop(.45, '#ff4fa0'); gF.addColorStop(1, '#3fd6ff');
  c.fillStyle = gF; c.fillRect(cx[0], y0, cw, 660); c.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 9; i++) c.fillRect(cx[0] + i * 90 - 30, y0, 34, 660);
  for (let i = 0; i < 14; i++) { const s = 6 + 5 * Math.sin(t * 6 + i); star(c, cx[0] + rnd(i + 3) * cw, y0 + rnd(i + 9) * 660, s, 4, .4); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); }
  if (struck > 0) { c.globalAlpha = kF * struck * .55; c.fillStyle = '#2a2f3a'; c.fillRect(cx[0], y0, cw, 660); }
  c.restore(); c.save(); c.globalAlpha = kF; c.fillStyle = '#2e333e'; c.fillRect(cx[1], y0, cw, 660); c.restore();
  dosType(c, 'FILM', cx[0] + 30, y0 + 64, 44, (t - TB1.head - .2) / .2, { col: '#fff' }); dosType(c, 'REALITÄT', cx[1] + 30, y0 + 64, 44, (t - TB1.head - .3) / .3, { col: DOS.cream });
  ROWS1.forEach(([f, r], i) => {
    const t0 = TB1.rows[i], y = y0 + 150 + i * rh, k = (t - t0) / .35; if (k <= 0) return;
    const sp = TB1.spoken.find(([st, ri]) => ri === i && t >= st - .05 && t < st + 1.1);
    if (sp) { c.fillStyle = 'rgba(200,53,44,.28)'; c.fillRect(cx[1], y - 52, cw, 72); c.fillStyle = DOS.red; c.fillRect(cx[1], y - 52, 10, 72); }
    dosType(c, f, cx[0] + 34, y, 46, k, { col: '#ffffff', ink: false }); dosType(c, r, cx[1] + 34, y, 46, (t - t0 - .12) / .4, { col: sp ? '#ffd9d4' : '#c9c6bd' });
    const ks = clamp((t - TB1.strike - i * .09) / .18, 0, 1); if (ks > 0) { c.save(); c.lineCap = 'round'; c.strokeStyle = DOS.red; c.lineWidth = 12; c.beginPath(); c.moveTo(cx[0] + 20, y - 12); c.lineTo(cx[0] + 20 + (cw - 40) * ks, y - 14 - 6 * ks); c.stroke(); c.restore(); }
  });
  const kd = clamp((t - TB1.strike - .5) / .25, 0, 1); if (kd > 0) { c.save(); c.lineCap = 'round'; c.strokeStyle = DOS.red; c.lineWidth = 18; c.globalAlpha = .9; c.beginPath(); c.moveTo(cx[0] + 10, y0 + 640); c.lineTo(cx[0] + 10 + (cw - 20) * kd, y0 + 640 - 620 * kd); c.stroke(); c.restore(); }
}
const tam1 = tamShot({ t0: TB1.t0, t1: TB1.t1, page: filmTable, cues: [[TB1.head, 'typeRun', .7], ...TB1.rows.map(r => [r, 'typeRow', .45]), ...[0, 1, 2, 3, 4].map(i => [TB1.strike + i * .09, 'strike'])] });
CUE('amb', 42.0, { name: 'deskRoom', until: 49.38 });
// ---- rain street: the man in the grey coat / Noah walking ----
const follower = (x, o = {}) => cc => drawPal(cc, Object.assign({ look: 'follower', x, k: .25, ink: 1.8, outfit: 'agent', coat: true, hat: true, s: -1 }, o));
const streetMan = (a, b) => (lt, T, t) => ({ set: rainStreet, setOpts: { lamps: [-700, 260, 1300] }, cam: camAt(a, b, lt / T), vignette: .2,
  fx: [c => { silhouette(c, follower(360), '#0b0e17', { col: 'rgba(255,215,150,.9)', off: [[-3, -3]] }); rainSplashes(c, t, { x0: -400, x1: 1200, y: 0, depth: 300, n: 60 }); }],
  screen: [c => rainSheet(c, t, { amount: 1.3, alpha: .4 }), c => G.rain(c, t)] });
CUE('amb', 38.6, { name: 'streetRain', until: 42.0 }); CUE('amb', 49.38, { name: 'streetRain', until: 60.6 });
function noahRainWalk(t0) {
  return (lt, T, t) => { const x = walkX(t, t0, -900, 150);
    return { set: rainStreet, setOpts: { lamps: [-700, 260, 1300] }, cam: drift(S(x + 120, -330, 1.3), t, 3), vignette: .2,
      fx: [c => { castShadow(c, x, 120, { alpha: .25 }); drawNoahSide(c, { x, k: .25, ink: 1.8, outfit: 'agent', coat: true, hat: true, walk: t * 8, expr: withBlink(EX.mask, t, 4, 3) }); rainSplashes(c, t, { x0: x - 900, x1: x + 900, y: 0, depth: 300, n: 60 }); }],
      screen: [c => rainSheet(c, t, { amount: 1.1, alpha: .38 }), c => G.rain(c, t)] }; };
}
for (let tt = 54.2; tt < 60.5; tt += .5) CUE('step', tt, { surf: 'wet' });
// ======================= 02 HOW YOU BECOME AN AGENT =======================
CUE('amb', 60.6, { name: 'cityDay', until: 68.3 });
function shotCliche(lt, T, t) {
  const nx = walkX(t, 60.6, -500, 140), stop = t > 64.6, x = stop ? walkX(64.6, 60.6, -500, 140) : nx, mx = lerp(900, x + 260, ease(seg(t, 63.0, 64.6)));
  return { set: city, setOpts: { tod: 'golden', seed: 4 }, cam: drift(S(x + 160, -300, 1.35), t, 3), vignette: .3, letterbox: .6,
    fx: [c => { castShadow(c, x, 120); drawNoahSide(c, { x, k: .25, ink: 1.8, outfit: 'home', walk: stop ? null : t * 8, expr: withBlink(stop ? Object.assign({}, EX.fear, { open: .2 }) : { mouth: 'soft' }, t, 4, 2) });
      castShadow(c, mx, 120); drawPal(c, { look: 'recruiter', side: true, x: mx, k: .25, ink: 1.8, s: -1, outfit: 'agent', walk: t < 64.6 ? t * 8 : null, expr: { mouth: 'flat' } }); }],
    screen: [c => cityLight(c, S(x + 160, -300, 1.35), t, { tod: 'golden' }), c => noirGrade(c, t, { mult: 'rgba(230,215,190,.25)', soft: 'rgba(60,40,20,.1)', vig: .5 })] };
}
CUE('amb', 68.3, { name: 'roomTone', until: 90.1 });
function shotCorridor(lt, T, t) {
  const x = walkX(t, 68.3, -1300, 260);
  return { set: room, setOpts: { wall: '#c8c4b4', floor: '#8a8a7a', floorType: 'tile', light: 'day', wallpaper: false, wainscot: true, doors: [-1800, -300, 1200, 2700], lampsCeil: [-1000, 500, 2000], back: (c, b) => { c.beginPath(); c.rect(300, b - 1000, 600, 400); fs(c, '#a88a5a', 4); for (let i = 0; i < 9; i++) { c.save(); c.translate(360 + (i % 3) * 180, b - 960 + Math.floor(i / 3) * 120); c.rotate((rnd(i) - .5) * .2); c.fillStyle = ['#fff', '#ffe36a', '#f2f0e8'][i % 3]; c.fillRect(0, 0, 130, 100); c.restore(); } sign(c, 600, b - 1080, 'Hörsaal 2', { size: 40, bg: '#3a3a44' }); } },
    cam: drift(S(x + 200, -420, .95), t, 3), vignette: .2,
    fx: [c => { castShadow(c, x, 240); drawNoahSide(c, { x, k: NK, ink: 1.8, outfit: 'home', walk: t * 7.5, expr: withBlink({ mouth: 'soft' }, t, 4, 1) }); for (let i = 0; i < 3; i++) silhouette(c, cc => drawPal(cc, { look: ['wife', 'colleague', 'neighbor'][i], side: true, x: 1600 - (t - 68.3) * 200 + i * 500, k: .48, s: -1, walk: t * 7 + i, outfit: 'home' }), 'rgba(60,58,54,.5)'); }],
    screen: [c => G.day(c, t)] };
}
function shotForm(lt, T, t) {
  return { set: deskTop, cam: drift(camAt(S(0, 0, .9), S(-60, 40, 1.05), lt / T), t, 2), vignette: .2,
    fx: [c => {
      c.save(); c.rotate(-.04); c.fillStyle = '#f2eee2'; c.fillRect(-560, -380, 1000, 760); c.strokeStyle = '#333'; c.lineWidth = 3; c.strokeRect(-560, -380, 1000, 760);
      hudText(c, 'BEWERBUNG', -500, -290, 64, '#1a2234'); c.fillStyle = '#1a2234'; c.fillRect(-500, -270, 880, 4);
      ['Name', 'Studium', 'Sprachen', 'Motivation'].forEach((l, i) => { hudText(c, l, -500, -180 + i * 120, 34, '#4a5060'); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-250, -175 + i * 120, 620, 3); });
      const k = clamp((t - 72.4) / 2.6, 0, 1); c.strokeStyle = '#1a3a9a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i < 60 * k; i++) { const x = -240 + i * 9, y = -60 + Math.sin(i * 1.7) * 14 - (i % 7 === 0 ? 10 : 0); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      const px = -240 + 540 * k; c.restore();
      c.save(); c.translate(px + 40, -110); c.rotate(.7); c.beginPath(); rrect(c, -14, -320, 28, 340, 10); fs(c, '#1a1a1e', 3); c.restore(); drawNoahHand(c, px + 120, -40, .9, -.6);
    }],
    screen: [c => lampPool(c, S(0, 0, 1), -100, -100, 1600, .35), c => G.warm(c, t)] };
}
// interview room: one ceiling lamp, mirror wall, interviewer in shadow
function interviewSet(c, cam, t) { return room(c, cam, t, { wall: '#3a3e44', floor: '#2a2c30', floorType: 'carpet', light: 'cold', lampsCeil: [0], back: (c, b) => mirrorWall(c, -1600, -500, b), floorFn: c => interrogTable(c, 0) }); }
const TEST = { t0: 81.2, t1: 87.6, corner: 'tr', w: 520, h: 300, title: 'Unbemerkt getestet', stampAt: .55 };
dosCardCues(TEST, 1); CUE('typeRow', 82.4, { dur: .2 }); CUE('typeRow', 84.0, { dur: .2 }); CUE('typeRow', 85.6, { dur: .2 });
function testCardDraw(c, lt, w, h) {
  // eye icon + three ticks
  c.save(); c.translate(80, 180); c.strokeStyle = DOS.cream; c.lineWidth = 6; c.beginPath(); c.moveTo(-50, 0); c.quadraticCurveTo(0, -46, 50, 0); c.quadraticCurveTo(0, 46, -50, 0); c.stroke(); circle(c, 0, 0, 15); c.fillStyle = DOS.cream; c.fill(); c.restore();
  ['Sprachen', 'Stress', 'Meinung'].forEach((s, i) => { const at = [1.2, 2.8, 4.4][i]; dosType(c, s, 170, 130 + i * 50, 30, (lt - at + .3) / .3); checkMark(c, 440, 120 + i * 50, 36, (lt - at) / .3); });
}
function shotInterviewWide(lt, T, t) {
  return { set: interviewSet, cam: drift(camAt(S(150, -520, .85), S(220, -540, .95), lt / T), t, 2), vignette: .4,
    behind: [c => { c.beginPath(); rrect(c, 360, -520, 220, 260, 20); fs(c, '#3a3e48', 3); }],
    fx: [c => { drawNoah(c, noahF({ x: 470, sit: true, seatH: 520, outfit: 'home', expr: withBlink(Object.assign({}, EX.mask, { look: Math.sin(t * .8) > .7 ? .7 : 0 }), t, 4.5, 3), arms: { l: { a: .3, b: -1.1 }, r: { a: .3, b: -1.1 } } }));
      silhouette(c, cc => drawPal(cc, { look: 'inspector', x: -330, k: .62, sit: true, seatH: 520, outfit: 'agent' }), '#0b0d12', { col: 'rgba(210,225,255,.6)', off: [[3, -4]] }); }],
    screen: [c => G.cold(c, t)] };
}
function shotInterviewClose(lt, T, t) {
  const look = t < 83 ? 0 : t < 84.6 ? .8 : t < 86.0 ? -.5 : t < 88 ? .2 : 0;
  return { set: interviewSet, cam: drift(camAt(S(470, -560, 1.7), S(470, -575, 1.95), lt / T), t, 2), vignette: .4,
    fx: [c => { drawNoah(c, noahF({ x: 470, sit: true, seatH: 520, outfit: 'home', expr: withBlink(Object.assign({}, EX.mask, { look }), t, 4.5, 3), arms: { l: { a: .3, b: -1.1 }, r: { a: .3, b: -1.1 } } })); }],
    screen: [c => G.cold(c, t), c => dosCard(c, t, Object.assign({ draw: testCardDraw }, TEST))] };
}
// ======================= 03 SECURITY CHECK =======================
CUE('amb', 90.1, { name: 'deskRoom', until: 97.9 }); CUE('paper', 90.5); CUE('paper', 92.0); CUE('paper', 93.6);
function shotDossierOpen(lt, T, t) {
  return { set: deskTop, cam: drift(camAt(S(0, 0, .55), S(80, 20, .72), lt / T), t, 3), vignette: .2,
    fx: [c => { dossierFolder(c, 0, 0, 1600, 900, 1, { page: (c, w, h) => {
      dosType(c, 'PERSONALAKTE', 70, 100, 56, 1, { caret: false }); dosStamp(c, 'VERTRAULICH', w - 230, 82, 30, .09, 1);
      const items = [[90.4, 'photo', 120, 180, -.05], [92.0, 'school', 560, 200, .04], [93.6, 'bank', 1050, 170, -.03]];
      for (const [at, kind, x, y, rot] of items) { const k = easeOut(clamp((t - at) / .4, 0, 1)); if (k <= 0) continue; c.save(); c.translate(x + (1 - k) * 600, y + (1 - k) * -200); c.rotate(rot + (1 - k) * .3);
        c.fillStyle = '#efe9da'; c.fillRect(0, 0, 400, 520); c.strokeStyle = '#222'; c.lineWidth = 3; c.strokeRect(0, 0, 400, 520);
        if (kind === 'photo') { c.fillStyle = '#9aa4b0'; c.fillRect(30, 30, 340, 360); drawNoahHead(c, 200, 230, .5, { mouth: 'flat' }); hudText(c, 'Foto 1', 30, 450, 30, '#333'); }
        if (kind === 'school') { c.fillStyle = '#b8b0a0'; c.fillRect(30, 30, 340, 300); for (let i = 0; i < 8; i++) drawPalHead(c, 70 + (i % 4) * 85, 110 + Math.floor(i / 4) * 120, .17, i === 5 ? 'son' : ['colleague', 'neighbor', 'wife', 'kidA'][i % 4], { mouth: 'smile' }); c.strokeStyle = DOS.red; c.lineWidth = 5; circle(c, 155, 230, 50); c.stroke(); hudText(c, 'Schulzeit', 30, 400, 30, '#333'); }
        if (kind === 'bank') { hudText(c, 'Kontoauszug', 30, 70, 36, '#1a2234'); for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(30, 110 + i * 40, 200, 5); c.fillRect(280, 110 + i * 40, 90, 5); } c.strokeStyle = DOS.red; c.lineWidth = 5; c.strokeRect(270, 260, 110, 34); }
        c.restore(); }
    } }); }],
    screen: [c => lampPool(c, S(0, 0, .6), -200, -300, 2200, .3), c => G.warm(c, t)] };
}
CUE('amb', 97.9, { name: 'roomTone', until: 111.8 });
function shotBoard(lt, T, t) { return { set: board, setOpts: { k: seg(t, 98.2, 103.3) }, cam: drift(camAt(S(-400, -760, 1.1), S(300, -720, 1.25), lt / T), t, 2), vignette: .3, screen: [c => G.grey(c, t)] }; }
function shotNeighbor(lt, T, t) {
  const look = t < 106 ? -.6 : -.2;
  return { set: houseFront, setOpts: { noahAtWindow: true, noahExpr: withBlink(Object.assign({}, EX.alert, { look }), t, 5, 4) }, cam: drift(camAt(S(150, -760, .85), S(200, -700, .95), lt / T), t, 3), vignette: .25,
    fx: [c => { drawPal(c, { look: 'inspector', x: -330, y: -230, k: .25 * 1.9, ink: 1.8, outfit: 'agent', side: true, walk: null, s: 1, expr: { mouth: Math.sin(t * 9) > 0 ? 'o' : 'flat' } }); drawPal(c, { look: 'neighbor', x: 60, y: -230, k: .24 * 1.9, ink: 1.8, outfit: 'home', side: true, walk: null, s: -1, expr: { mouth: Math.sin(t * 7 + 1) > .3 ? 'o' : 'soft' } }); }],
    screen: [c => G.day(c, t)] };
}
// ---- SICHERHEITSÜBERPRÜFUNG ----
const TB2 = { t0: 111.8, t1: 119.8, head: 113.05, rows: [113.6, 113.95, 114.3, 114.65, 115.0, 115.35, 115.7], ask: 116.2, stamp: 117.1, rep: 118.0 };
const CHECK = ['Schulden', 'Ex-Partner', 'Freunde', 'Alkohol', 'Vergangenheit', 'Telefonkontakte', 'Nachbarn'];
function secPage(c, w, h, t) {
  pageHead(c, w, t, TB2.head, 'SICHERHEITSÜBERPRÜFUNG');
  CHECK.forEach((s, i) => { const at = TB2.rows[i], col = i < 4 ? 0 : 1, row = i % 4, x = 100 + col * 720, y = 230 + row * 82; if (t < at) return; dosType(c, s, x + 70, y, 40, (t - at) / .25); boxEmpty(c, x, y, 44); checkMark(c, x + 20, y - 18, 40, (t - at - .15) / .2); });
  if (t > TB2.ask) { dosType(c, 'ERPRESSBAR?', 100, 640, 76, (t - TB2.ask) / .4, { col: DOS.cream }); }
  if (t > TB2.stamp) dosStamp(c, 'NEIN', 860, 615, 70, -.14, (t - TB2.stamp) / .14);
  if (t > TB2.rep) { c.fillStyle = DOS.line; c.fillRect(60, 730, w - 120, 2); dosType(c, 'Wiederholung: regelmäßig, ein Berufsleben lang', 100, 800, 40, (t - TB2.rep) / 1.0, { col: DOS.muted }); }
}
const tam2 = tamShot({ t0: TB2.t0, t1: TB2.t1, page: secPage, cues: [[TB2.head, 'typeRun', .8], ...TB2.rows.map(r => [r + .15, 'tick']), [TB2.ask, 'typeRun', .5], [TB2.stamp, 'stamp'], [TB2.rep, 'typeRun', 1.0]] });
CUE('amb', 111.8, { name: 'deskRoom', until: 126.7 });
function shotStacks(lt, T, t) {
  return { set: deskTop, cam: drift(camAt(S(0, 0, .6), S(0, -60, .68), lt / T), t, 2), vignette: .2,
    fx: [c => { for (let i = 0; i < 6; i++) { const at = 120.0 + i * 1.0, k = easeOut(clamp((t - at) / .3, 0, 1)); if (k <= 0) continue; c.save(); c.translate(-900 + i * 360, -40 - (i % 2) * 120 + (1 - k) * -300); c.rotate((rnd(i) - .5) * .2); c.scale(.62, .62); dossierFolder(c, 0, 0, 1000, 700, 0, { lift: 1 + (1 - k) * 2 }); c.restore(); if (t > at + .35) { c.save(); c.translate(-900 + i * 360, -40 - (i % 2) * 120); dosStamp(c, 'GEPRÜFT', 0, 60, 52, -.2 + i * .05, (t - at - .35) / .14); c.restore(); } } }],
    screen: [c => lampPool(c, S(0, 0, .6), -200, -300, 2200, .3), c => G.warm(c, t)] };
}
for (let i = 0; i < 6; i++) { CUE('drop', 120.0 + i + .3, { gain: .5 }); CUE('stamp', 120.0 + i + .35); }
// ======================= 04 TRAINING =======================
CUE('amb', 126.7, { name: 'office', until: 131.8 });
function shotEnter(lt, T, t) {
  const x = walkX(t, 126.7, -1100, 230);
  return { set: room, setOpts: { wall: '#9a9ea2', floor: '#6a6e72', floorType: 'carpet', light: 'grey', wallpaper: false, doors: [-1500, 1500], lampsCeil: [-600, 600], back: (c, b) => { c.fillStyle = '#7a7e84'; c.fillRect(-600, b - 900, 1200, 500); c.fillStyle = '#5a5e64'; for (let i = 0; i < 4; i++) c.fillRect(-560 + i * 290, b - 860, 250, 420); } },
    cam: drift(S(x + 150, -420, .95), t, 2), vignette: .3,
    fx: [c => { castShadow(c, x, 240); drawNoahSide(c, { x, k: NK, ink: 1.8, outfit: 'agent', walk: t * 7.5, expr: withBlink(EX.mask, t, 4, 7) });
      // lanyard badge (blank, no institution)
      c.save(); c.translate(x + 50 * NK * 2, -560); c.fillStyle = '#e8e8e8'; c.fillRect(-18, 0, 36, 48); c.strokeStyle = '#222'; c.lineWidth = 3; c.strokeRect(-18, 0, 36, 48); c.fillStyle = '#9aa'; c.fillRect(-12, 6, 24, 18); c.restore(); }],
    screen: [c => G.grey(c, t)] };
}
CUE('amb', 131.8, { name: 'gym', until: 139.4 });
function shotGym(lt, T, t) {
  const part = lt < 2.6 ? 0 : lt < 5.2 ? 1 : 2;
  return { set: gymSil, cam: S(0, -420, .9 + part * .05), vignette: .3,
    fx: [c => {
      if (part === 0) { for (let i = 0; i < 3; i++) { const x = ((t * 420 + i * 900) % 3200) - 1600; silhouette(c, cc => drawNoahSide(cc, { x, k: NK, walk: t * 14 + i, armSwing: .9, outfit: 'home' }), '#1a1c22'); } }
      if (part === 1) { const p = Math.sin(t * 6); silhouette(c, cc => { drawNoah(cc, { x: -250 + p * 20, k: NK, outfit: 'home', arms: { l: { a: 1.6 + p * .3, b: -2.2 }, r: { a: 1.2, b: -2.0 } } }); drawPal(cc, { look: 'colleague', x: 250 - p * 20, k: NK, outfit: 'home', arms: { l: { a: 1.2, b: -2.1 }, r: { a: 1.5 - p * .3, b: -2.0 } } }); }, '#1a1c22'); }
      if (part === 2) { const k = Math.abs(Math.sin(t * 3)); silhouette(c, cc => { drawNoah(cc, { x: 0, y: -k * 80, k: NK, outfit: 'home', arms: { l: { a: 2.5, b: .2 }, r: { a: 2.5, b: .2 } } }); }, '#1a1c22'); line(c, [-500, -900, 500, -900], 16, '#1a1c22'); }
    }],
    screen: [c => noirGrade(c, t, { mult: 'rgba(200,205,215,.2)', vig: .5 })] };
}
for (let tt = 131.9; tt < 134.3; tt += .27) CUE('step', tt, { surf: 'hard', gain: .6 }); [134.6, 135.4, 136.1, 136.9].forEach(tt => CUE('punch', tt));
// lie reading
CUE('amb', 139.4, { name: 'roomTone', until: 152.0 });
function shotLieWide(lt, T, t) {
  const tw = Math.sin(t * 13) * .08;
  return { set: interviewSet, cam: drift(camAt(S(150, -520, .9), S(260, -560, 1.05), lt / T), t, 2), vignette: .4,
    fx: [c => { drawPal(c, { look: 'colleague', x: 470, k: NK, ink: 1.8, sit: true, seatH: 520, outfit: 'home', expr: withBlink({ mouth: 'soft', look: Math.sin(t * 1.7) * .7 }, t, 2.5, 8), arms: { l: { a: .35 + tw, b: -1.2 }, r: { a: .35 - tw, b: -1.3 } } });
      silhouette(c, cc => drawNoah(cc, { x: -330, k: .62, sit: true, seatH: 520, outfit: 'agent' }), '#0b0d12', { col: 'rgba(210,225,255,.6)', off: [[3, -4]] }); }],
    screen: [c => G.cold(c, t)] };
}
function shotLieDetails(lt, T, t) {
  // 145.2–147.3 posture (leaning, crossed legs) · 147.3–149.4 eyes dart · 149.4–152 voice wave on a monitor
  if (t < 147.3) return { set: interviewSet, cam: S(470, -480, 1.45), vignette: .4, fx: [c => drawPal(c, { look: 'colleague', x: 470, k: NK, ink: 1.8, sit: true, seatH: 520, lean: -.08, outfit: 'home', expr: { mouth: 'soft' }, arms: { l: { a: .5, b: -1.6 }, r: { a: .5, b: -1.6 + Math.sin(t * 14) * .1 } } })], screen: [c => G.cold(c, t)] };
  if (t < 149.4) { const lk = t < 148.2 ? -.9 : .9; return { set: interviewSet, cam: S(470, -665, 5.2), vignette: .5, fx: [c => drawPal(c, { look: 'colleague', x: 470, k: NK, ink: 1.8, sit: true, seatH: 520, outfit: 'home', expr: { mouth: 'soft', look: lk } })], screen: [c => G.cold(c, t)] }; }
  return { set: (c, cam, tt) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0a0d12'; c.fillRect(0, 0, W, H); return { base: '#0a0d12' }; }, cam: S(0, 0, 1), vignette: .5,
    fx: [c => { c.beginPath(); rrect(c, -760, -380, 1520, 760, 30); fs(c, '#141a22', 6); c.save(); c.beginPath(); c.rect(-720, -340, 1440, 680); c.clip(); c.fillStyle = 'rgba(80,140,200,.08)'; for (let i = -10; i < 10; i++) c.fillRect(i * 80, -340, 2, 680);
      c.beginPath(); const k = clamp((t - 149.4) / 2.4, 0, 1); for (let i = 0; i < 720 * k; i++) { const x = -720 + i * 2, f = .05 + (i > 400 ? (i - 400) * .00025 : 0), a = 120 * Math.abs(Math.sin(i * .02)) * (.5 + .5 * rnd(Math.floor(i / 9))); c.lineTo(x, Math.sin(i * f * 10) * a); } c.lineWidth = 4; c.strokeStyle = '#7fd0ff'; c.stroke(); c.restore();
      const hi = clamp((t - 150.6) / .3, 0, 1); if (hi > 0) { c.strokeStyle = `rgba(200,53,44,${hi})`; c.lineWidth = 6; c.strokeRect(80, -300, 560, 600); } }],
    screen: [c => noirGrade(c, t, { vig: .6 })] };
}
// observation walk (day street) + freeze with highlighted details
CUE('amb', 152.0, { name: 'cityDay', until: 166.4 });
function kiosk(c, x) { c.beginPath(); c.rect(x - 220, -620, 440, 620); fs(c, '#3a6a4a', 3); c.beginPath(); c.rect(x - 250, -660, 500, 60); fs(c, '#2a4a3a', 3); c.fillStyle = '#e8dcc0'; c.fillRect(x - 190, -560, 380, 220); for (let i = 0; i < 8; i++) { c.fillStyle = ['#c84a3a', '#3a6aa8', '#e8c040', '#5a9a5a'][i % 4]; c.fillRect(x - 180 + i * 46, -330, 38, 54); } sign(c, x, -630, 'Kiosk', { size: 34, bg: '#2a4a3a' }); }
function obsFrame(t, freeze) {
  const tt = freeze ? Math.min(t, 157.6) : t, x = walkX(tt, 152.0, -1200, 150);
  const kx = -200, mx = 500, cx = 1200;
  return { set: city, setOpts: { tod: 'day', seed: 6 }, cam: S(freeze ? lerp(x + 200, 300, ease(seg(t, 157.6, 158.6))) : x + 200, -330, freeze ? lerp(1.3, .95, ease(seg(t, 157.6, 158.6))) : 1.3), vignette: .2,
    behind: [c => { kiosk(c, kx); drawPal(c, { look: 'follower', x: kx, y: -340, k: .2, outfit: 'home', expr: { mouth: 'flat', look: freeze ? .9 : 0 } }); car(c, cx, { color: '#5a6a7a', s: -1 }); c.save(); c.translate(cx - 330, -130); c.fillStyle = '#f2f2ea'; c.fillRect(-60, -24, 120, 48); c.strokeStyle = '#222'; c.lineWidth = 3; c.strokeRect(-60, -24, 120, 48); hudText(c, '· 47 ·', 0, 12, 30, '#222', 'center'); c.restore(); }],
    fx: [c => { castShadow(c, x, 120); drawNoahSide(c, { x, k: .25, ink: 1.8, outfit: 'home', walk: freeze ? (157.6 * 8) : tt * 8, expr: { mouth: 'flat', look: .3 } });
      drawPal(c, { look: 'neighbor', side: true, x: mx, k: .25, ink: 1.8, s: -1, outfit: 'old', walk: freeze ? 0 : tt * 8, expr: { mouth: 'soft' } }); }],
    screen: [c => cityLight(c, S(0, -330, 1), t, { tod: 'day' }), c => {
      if (!freeze) return G.day(c, t);
      // freeze: desaturate, then glow rings on the three details
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'saturation'; c.fillStyle = `rgba(128,128,128,${.85 * seg(t, 157.6, 158.0)})`; c.fillRect(0, 0, W, H); c.restore(); G.day(c, t);
      const cam = S(300, -330, .95), P = (wx, wy) => [W / 2 + (wx - cam.x) * cam.z, H / 2 + (wy - cam.y) * cam.z];
      [[kx, -420, 158.8], [mx, -250, 160.6], [cx - 330, -130, 162.2]].forEach(([wx, wy, at]) => { const k = clamp((t - at) / .35, 0, 1); if (k <= 0) return; const [sx, sy] = P(wx, wy); c.save(); c.lineWidth = 6; c.strokeStyle = `rgba(255,220,120,${k})`; c.beginPath(); c.arc(sx, sy, 110 * (1.4 - .4 * easeOut(k)), 0, Math.PI * 2); c.stroke(); bloom(c, sx, sy, 160, '255,220,120', .3 * k); c.restore(); });
      dosCard(c, t, MERK);
    }] };
}
const MERK = { t0: 162.6, t1: 166.3, corner: 'tr', w: 420, h: 190, title: 'Merken', lines: [{ s: '3 von 3 ✓', y: 160, size: 48, at: .5, col: '#9fe0a8' }] }; dosCardCues(MERK, 1);
[158.8, 160.6, 162.2].forEach(a => CUE('ding', a)); CUE('freeze', 157.6);
// AUSBILDUNG bars
const TB3 = { t0: 166.4, t1: 172.15, head: 167.65 };
const BARS = [['Ruhe bewahren', 1, 168.2], ['Menschen lesen', .82, 168.55], ['Gedächtnis', .7, 168.9], ['Beobachten', .6, 169.25], ['Selbstverteidigung', .32, 169.6]];
function barsPage(c, w, h, t) {
  pageHead(c, w, t, TB3.head, 'AUSBILDUNG – WAS ZÄHLT WIRKLICH?');
  BARS.forEach(([s, v, at], i) => { const y = 260 + i * 120, k = easeOut(clamp((t - at) / .6, 0, 1)); if (t < at) return; dosType(c, s, 90, y + 12, 40, (t - at) / .3, { col: i === 0 ? '#ffd9d4' : DOS.cream }); c.fillStyle = 'rgba(236,227,204,.12)'; c.fillRect(560, y - 30, 940, 54); c.fillStyle = i === 0 ? DOS.red : '#8b93a6'; c.fillRect(560, y - 30, 940 * v * k, 54); });
  const hk = clamp((t - 170.0) / .3, 0, 1); if (hk > 0) { c.strokeStyle = `rgba(200,53,44,${hk})`; c.lineWidth = 6; c.strokeRect(70, 210, 1460, 90); }
}
const tam3 = tamShot({ t0: TB3.t0, t1: TB3.t1, page: barsPage, cues: [[TB3.head, 'typeRun', .9], ...BARS.map(b => [b[2], 'typeRow', .3])] });
// pulse: heart races, face stays calm
const BEATS2 = beatsBetween(172.2, 186.0, 72, 140); BEATS2.forEach(b => CUE('heart', b, { gain: .8 }));
const PULS = { t0: 172.3, t1: 181.6, corner: 'tr', w: 440, h: 230, title: 'PULS' }; dosCardCues(PULS, 1);
function shotPulse(lt, T, t) {
  const p = pulseAt(BEATS2, t);
  return { set: interviewSet, cam: drift(camAt(S(470, -560, 1.75), S(470, -580, 2.1), lt / T), t, 1), vignette: .4,
    fx: [c => { drawNoah(c, noahF({ x: 470, sit: true, seatH: 520, outfit: 'agent', expr: withBlink(Object.assign({}, EX.mask), t, 4, 9), arms: { l: { a: .3, b: -1.1 }, r: { a: .3, b: -1.1 } } }));
      if (t > 173.94 && t < 176) for (const s of [-1, 1]) FX.drop(c, 470 + s * 100, -250 + ((t * 40) % 30), .6, 0, .6); }],
    screen: [c => G.cold(c, t), c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(200,40,40,${p * .06})`; c.fillRect(0, 0, W, H); c.restore(); },
      c => dosCard(c, t, Object.assign({ draw: (c, lt, w, h) => { const v = 72 + (140 - 72) * ease(clamp((t - 173.0) / 7, 0, 1)); hudCounter(c, 0, v, 1, 40, 170, 80, { fmt: n => Math.round(n) + ' ', color: v > 120 ? '#ff8a80' : DOS.cream }); hudText(c, 'Schläge/Min.', 230, 168, 26, DOS.muted); const s = 1 + p * .25; c.save(); c.translate(w - 50, 120); c.scale(s, s); heart(c, 0, 0, 26); c.fillStyle = DOS.red; c.fill(); c.restore(); } }, PULS))] };
}
function shotGlance(lt, T, t) {
  const dart = t > 183.0 && t < 183.6, red = bump(t, 183.0, 184.4);
  return { set: interviewSet, cam: S(470, -665, 4.6 + lt * .05), vignette: .5,
    fx: [c => drawNoah(c, noahF({ x: 470, sit: true, seatH: 520, outfit: 'agent', expr: Object.assign({}, dart ? EX.fear : EX.mask, { look: dart ? -.9 : 0, open: .2 }) }))],
    screen: [c => G.cold(c, t), c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H / 2, H * .2, W / 2, H / 2, H * .8); g.addColorStop(0, 'rgba(200,30,30,0)'); g.addColorStop(1, `rgba(200,30,30,${red * .5})`); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }] };
}
CUE('crack', 183.05);
// ======================= 05 TARNUNG =======================
CUE('amb', 186.0, { name: 'homeDay', until: 204.7 });
const IDC = { t0: 189.7, t1: 195.2, corner: 'tl', w: 560, h: 280, title: 'TARNIDENTITÄT', stampAt: .7, lines: [{ s: 'Name: ████', y: 160, size: 34, at: .9 }, { s: 'Beruf: Versicherungskaufmann', y: 215, size: 30, at: 1.6 }] }; dosCardCues(IDC, 2);
function shotMirror(lt, T, t) {
  const tie = Math.sin(t * 5) * .1;
  return { set: room, setOpts: { wall: '#6a5a4a', floor: '#4a3428', light: 'day', windows: [{ x: 600, w: 420, h: 560, view: 'day' }], pictures: [[-900, 1000, 'family']], back: (c, b) => { c.beginPath(); rrect(c, -420, b - 1250, 520, 900, 20); fs(c, '#3a2a1a', 6); c.fillStyle = 'rgba(190,210,230,.35)'; c.fillRect(-400, b - 1230, 480, 860); } },
    cam: drift(camAt(S(-120, -480, 1.05), S(-150, -520, 1.2), lt / T), t, 2), vignette: .25,
    fx: [c => drawNoah(c, noahF({ x: -150, outfit: 'agent', expr: withBlink(Object.assign({}, EX.mask, { look: .1 }), t, 4, 11), arms: { l: { a: .8 + tie, b: -2.5 }, r: { a: .8 - tie, b: -2.5 } } }))],
    screen: [c => G.day(c, t), c => dosCard(c, t, IDC)] };
}
function shotCoverDesk(lt, T, t) {
  return { set: deskTop, cam: drift(camAt(S(-100, 0, .6), S(100, 0, .7), lt / T), t, 2), vignette: .2,
    fx: [c => {
      const at = [194.2, 197.4, 199.0, 200.5];
      // business card, diploma, calendar, framed 'Chef' photo
      if (t > at[0]) { c.save(); c.translate(-900, -250); c.rotate(-.1); c.fillStyle = '#efe9da'; c.fillRect(-300, -170, 600, 340); c.strokeStyle = '#222'; c.lineWidth = 3; c.strokeRect(-300, -170, 600, 340); hudText(c, 'Versicherung', -260, -80, 50, '#1a2234'); c.fillStyle = '#111'; c.fillRect(-260, -30, 240, 36); hudText(c, 'Versicherungskaufmann', -260, 60, 28, '#3a4050'); c.restore(); }
      if (t > at[1]) { c.save(); c.translate(-100, -280); c.rotate(.05); c.fillStyle = '#6a4a2a'; c.fillRect(-300, -220, 600, 440); c.fillStyle = '#f2ead8'; c.fillRect(-270, -190, 540, 380); hudText(c, 'Zeugnis', 0, -100, 52, '#1a2234', 'center'); for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-200, -40 + i * 36, 400 - i * 40, 5); } c.restore(); }
      if (t > at[2]) { c.save(); c.translate(700, -200); c.rotate(-.04); c.fillStyle = '#f4f2ec'; c.fillRect(-280, -260, 560, 520); hudText(c, 'Woche', -240, -190, 40, '#b8202a'); ['Mo · Büro', 'Di · Büro', 'Mi · Kunde', 'Do · Büro', 'Fr · Akten'].forEach((s, i) => hudText(c, s, -240, -110 + i * 70, 34, '#1a2234')); c.restore(); }
      if (t > at[3]) { c.save(); c.translate(-50, 350); c.rotate(-.08); c.fillStyle = '#3a3a40'; c.fillRect(-170, -200, 340, 400); c.fillStyle = '#c8c0b0'; c.fillRect(-150, -180, 300, 300); drawPalHead(c, 0, -40, .3, 'colleague', { mouth: 'smile' }); hudText(c, 'Chef', 0, 170, 34, '#e8e4dc', 'center'); c.restore(); }
    }],
    screen: [c => lampPool(c, S(0, 0, .65), -200, -300, 2200, .3), c => G.warm(c, t)] };
}
[194.2, 197.4, 199.0, 200.5].forEach(a => CUE('paper', a));
// birthday (no text)
CUE('amb', 202.7, { name: 'party', until: 220.03 });
function famRoom(c, cam, t) { return room(c, cam, t, { wall: '#7a5a42', floor: '#5a3a28', light: 'warm', curtain: '#8a3a3a', windows: [{ x: -1600, w: 480, h: 560, view: 'dusk' }], pictures: [[900, 1150, 'family'], [1150, 1100]], shelf: 1500, rug: '#7a3a3a', back: (c, b) => { for (let i = 0; i < 9; i++) { const x = -1000 + i * 260; line(c, [x, b - 1350, x + 130, b - 1290, x + 260, b - 1350], 4, '#e8c060'); c.beginPath(); c.moveTo(x + 110, b - 1300); c.lineTo(x + 150, b - 1300); c.lineTo(x + 130, b - 1240); c.closePath(); fs(c, ['#e06a6a', '#6aa0e0', '#f2c531'][i % 3], 2); } } }); }
const FAM = (t, o = {}) => {
  const sitters = [
    ['mother', -620, .48, 'old', { mouth: 'smile', lid: .2 }], ['wife', -220, .47, 'home', { mouth: 'smile', lid: .2 }],
    ['noah', 200, .5, 'home', o.noahExpr || { mouth: 'smile' }], ['son', 560, .36, 'home', { mouth: 'smile' }], ['daughter', 820, .33, 'pyjama', { mouth: 'smile' }]];
  return c => { for (const [who, x, k, out, e] of sitters) { const bob = o.laugh && who !== 'noah' ? -Math.abs(Math.sin(t * 9 + x)) * 10 : 0; chairBack(c, x, { col: '#4a2a1a' }); const ee = withBlink(e, t, 3.5, x); if (who === 'noah') drawNoah(c, { x, k, ink: 1.8, sit: true, seatH: 560, outfit: out, expr: ee, bob }); else drawPal(c, { look: who, x, k, ink: 1.8, sit: true, seatH: 560, outfit: out, expr: Object.assign({}, ee, o.laugh && who !== 'noah' ? { mouth: 'o', open: .6 } : {}), bob }); } };
};
const famTable = t => c => dinTable(c, 100, { w: 1900, top: -300, items: [(c, top) => cake(c, 100, top, t, 5), (c, top) => { plateFood(c, -620, top); plateFood(c, -220, top); plateFood(c, 500, top); glassW(c, -420, top); glassW(c, 380, top); }] });
function shotPartyWide(lt, T, t) { return { set: famRoom, cam: drift(camAt(S(80, -460, .7), S(80, -470, .78), lt / T), t, 3), vignette: .25, fx: [FAM(t, { laugh: t > 205 && t < 207 }), famTable(t)], screen: [c => G.warm(c, t)] }; }
function shotMotherAsks(lt, T, t) { return { set: famRoom, cam: drift(S(-300, -520, 1.35), t, 2), vignette: .3, fx: [c => { chairBack(c, -620, { col: '#4a2a1a' }); drawPal(c, { look: 'mother', x: -620, k: .48, ink: 1.8, sit: true, seatH: 560, outfit: 'old', expr: withBlink({ mouth: Math.sin(t * 10) > -.2 && t < 211.6 ? 'o' : 'smile', open: .3, look: .8, browUp: .4 }, t, 3.5, 1) }); chairBack(c, 200, { col: '#4a2a1a' }); drawNoah(c, { x: 200, k: .5, ink: 1.8, sit: true, seatH: 560, outfit: 'home', expr: withBlink({ mouth: 'soft', look: -.8 }, t, 4, 2) }); }, famTable(t)], screen: [c => G.warm(c, t)] }; }
function shotFakeSmile(lt, T, t) { return { set: famRoom, cam: drift(camAt(S(200, -760, 2.2), S(200, -770, 2.45), lt / T), t, 1), vignette: .35, fx: [c => { chairBack(c, 200, { col: '#4a2a1a' }); drawNoah(c, { x: 200, k: .5, ink: 1.8, sit: true, seatH: 560, outfit: 'home', expr: withBlink(t < 213.8 ? EX.fakeSmile : Object.assign({}, EX.fakeSmile, { look: -.6 }), t, 3.5, 3) }); }, famTable(t)], screen: [c => G.warm(c, t)] }; }
function shotPartyEnd(lt, T, t) { return { set: famRoom, cam: drift(camAt(S(80, -470, .8), S(80, -460, .7), lt / T), t, 3), vignette: .3, fx: [FAM(t, { laugh: true, noahExpr: { mouth: 'flat', lid: .35, look: -.7 } }), famTable(t)], screen: [c => G.warm(c, t)], fade: seg(t, END - .45, END) }; }
// ======================= SHOT LIST =======================
const SHOTS = film([
  [0, '01 bedroom → clock', shotBedWide], [6.8, '01 lock screen', shotLock], [10.05, '01 message', shotMsg],
  [13.35, '01 overhead awake', (lt, T, t) => bedTopShot(t < 16.04 ? S(-300, -600, 1.2) : S(-295, -590, 1.12), t < 16.04 ? S(-295, -590, 1.12) : S(0, -380, .8))(t < 16.04 ? lt : t - 16.04, t < 16.04 ? 2.69 : 2.4, t)],
  [18.45, '01 face + heartbeat', shotFace],
  [21.45, '01 kids asleep', (lt, T, t) => ({ set: kidsTop, cam: drift(camAt(S(0, -200, .62), S(0, -260, .7), lt / T), t, 3), vignette: .2, screen: [c => G.night(c, t)] })],
  [23.45, '01 mother photo', (lt, T, t) => ({ set: photoShelf, cam: drift(camAt(S(-40, -820, 1.4), S(-40, -850, 1.6), lt / T), t, 2), vignette: .3, screen: [c => G.night(c, t)] })],
  [25.0, '01 Versicherung card', (lt, T, t) => ({ set: hallTable, cam: drift(camAt(S(0, 0, .95), S(-60, 0, 1.1), lt / T), t, 2), vignette: .3, screen: [c => G.night(c, t)] })],
  [27.86, '01 overhead again', bedTopShot(S(-200, -500, .95), S(-300, -650, 1.5), 1, t => Object.assign({}, EX.alert, { look: .1 }))],
  [32.6, '01 bedroom, rain', (lt, T, t) => ({ set: bedroomSide, setOpts: { phoneGlow: .5, noah: withBlink(EX.alert, t, 6, 2), clock: '03:01' }, cam: drift(camAt(S(-300, -620, 1.0), S(-850, -820, 1.5), lt / T), t, 3), vignette: .25, screen: [c => rainSheet(c, t, { amount: .25, alpha: .12 }), c => G.night(c, t)] })],
  [38.6, '01 grey coat (wide)', streetMan(S(250, -330, 1.0), S(300, -360, 1.15))],
  [42.0, '01 TABELLE Film vs. Realität', tam1],
  [49.38, '01 grey coat (close)', streetMan(S(300, -380, 1.35), S(340, -420, 1.75))],
  [54.0, '01 Noah walks in the rain', noahRainWalk(54.0)],
  [60.6, '02 cliché: the man with sunglasses', shotCliche],
  [68.3, '02 university corridor', shotCorridor], [72.1, '02 BEWERBUNG', shotForm],
  [75.6, '02 interview (wide)', shotInterviewWide], [81.0, '02 interview (close) + card', shotInterviewClose],
  [90.1, '03 Personalakte', shotDossierOpen], [97.9, '03 board', shotBoard], [103.7, '03 neighbour asked', shotNeighbor],
  [111.8, '03 TABELLE Sicherheitsüberprüfung', tam2], [119.8, '03 again and again', shotStacks],
  [126.7, '04 you are in', shotEnter], [131.8, '04 sport + self-defence', shotGym],
  [139.4, '04 reading people', shotLieWide], [145.2, '04 details', shotLieDetails],
  [152.0, '04 observation walk', (lt, T, t) => obsFrame(t, false)], [157.6, '04 freeze + details', (lt, T, t) => obsFrame(t, true)],
  [166.4, '04 TABELLE Ausbildung', tam3], [172.15, '04 pulse', shotPulse], [181.9, '04 one nervous glance', shotGlance],
  [186.0, '05 cover identity', shotMirror], [194.0, '05 cover story', shotCoverDesk],
  [202.7, '05 birthday', shotPartyWide], [208.4, '05 mother asks', shotMotherAsks], [211.9, '05 fake smile', shotFakeSmile], [216.3, '05 laughter', shotPartyEnd],
  [END]]);
NOAH_FONTS_READY.then(() => defineFilm({ fadeIn: .5, fadeOut: 0, shots: SHOTS }));
