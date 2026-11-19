// AGENT – 30 s draft. Audio: TEIL1 0:00–0:21.45 + TEIL1 0:42.00–0:50.95 (see audio.json), times below are draft seconds.
// Shots cut on the speech (word times from the transcript).
const P2 = s => 21.45 + (s - 42.0);           // TEIL1 source time → draft time for the second audio piece
const T = { title: 0, three: 3.76, vib: 5.14, keine: 6.84, msg: 10.05, words: [10.14, 10.82, 11.02, 11.52, 12.18, 12.3], bett: 13.35, frau: 16.04, sie: 18.45, cut2: 21.45,
  autos: P2(45.46), smoking: P2(46.96), martini: P2(48.14), wahrheit: P2(49.38), end: 31.0 };
const VC = { x: 0, y: 0, z: 1 };
const S = (x, y, z) => ({ x, y, z });
const camAt = (a, b, k) => CAM.mix(a, b, ease(clamp(k, 0, 1)));
// heartbeat times (draft s) — also used by the audio mix
const BEATS = []; { let tb = 18.6, bpm = 64; while (tb < 31) { BEATS.push(+tb.toFixed(3)); bpm = Math.min(96, bpm + 2.2); tb += 60 / bpm; } }
const beatPulse = t => BEATS.reduce((a, b) => a + (t >= b ? Math.exp(-(t - b) * 9) : 0), 0);
// ---------------- sound cues ----------------
CUE('amb', 0, { name: 'bedroomRain', until: T.cut2 });
CUE('vibrate', T.vib, { dur: 1.55 }); CUE('vibrate', 7.05, { dur: 1.2 }); CUE('vibrate', 8.55, { dur: .8 });
CUE('rustle', 9.1); CUE('rustle', 13.5, { soft: 1 });
for (const b of BEATS) if (b < T.end - .3) CUE('heart', b);
CUE('amb', T.cut2, { name: 'deskRoom', until: 28.9 }); CUE('amb', 28.9, { name: 'streetRain', until: T.end });
// ---------------- shots ----------------
const TAG = { t0: 3.95, t1: 8.2, corner: 'tl', text: 'TAG 1 · 03:00 Uhr', stamp: false }; dosCardCues(TAG, 1);
const shotA = {
  name: 'A bedroom wide → clock', dur: 6.8, f(lt, Tt, t) {
    const v = lt < 2.6 ? camAt(S(-330, -640, .8), S(-180, -600, .9), lt / 2.6) : camAt(S(-180, -600, .9), S(490, -470, 2.3), (lt - 2.6) / 1.5);
    v.x += Math.sin(t * .6) * 6; v.y += Math.cos(t * .5) * 4;
    const buzz = t > T.vib && t < T.vib + 1.55 ? (Math.floor((t - T.vib) / .38) % 2 ? 0 : 3) : 0;
    return { set: bedroomSide, setOpts: { phoneGlow: t > T.vib ? clamp((t - T.vib) * 4, 0, 1) : 0, buzz, noah: withBlink(EX.alert, t, 6, 2), clock: '03:00' }, cam: v, vignette: .2,
      screen: [c => rainSheet(c, t, { amount: .25, alpha: .12 }), c => noirGrade(c, t, { vig: .6 }), c => dosTag(c, t, TAG)] };
  } };
const shotC = {
  name: 'C phone on the nightstand (top view)', dur: T.msg - 6.8, f(lt, Tt, t) {
    const v = camAt(S(0, 0, 1.25), S(0, -20, 1.45), lt / Tt), lift = seg(t, 9.35, 9.95), grab = seg(t, 8.95, 9.35);
    const buzz = (t > 7.05 && t < 8.25) || (t > 8.55 && t < 9.35) ? Math.sin(t * 95) * 5 : 0;
    return { set: (c, cam, tt) => { deskTopNight(c, cam, tt); return { base: '#100c0a' }; }, cam: v, vignette: .2,
      fx: [c => {
        c.save(); c.translate(buzz, lift * -40); c.rotate(-.08 + buzz * .004 + lift * .12); c.scale(1 + lift * .35, 1 + lift * .35);
        c.save(); c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 30 + lift * 40; c.shadowOffsetY = 14 + lift * 30; c.fillStyle = '#000'; rrect(c, -190, -380, 380, 760, 50); c.fill(); c.restore();
        phoneUI(c, -175, -365, 350, 730, { mode: 'lock', big: '03:00', date: 'Dienstag', notif: seg(t, 6.95, 7.35), t, glow: 1.4 });
        c.restore();
        // Noah's hand + pyjama sleeve reach in from the bottom right
        if (grab > 0) { const hx = lerp(700, 140, ease(grab)), hy = lerp(900, 230, ease(grab)) - lift * 40; line(c, [hx + 600, hy + 600, hx + 60, hy + 70], 150, OUT); line(c, [hx + 600, hy + 600, hx + 60, hy + 70], 132, '#8fa3bf'); for (let i = -1; i <= 1; i++) line(c, [hx + 600 + i * 40, hy + 600 - i * 40, hx + 60 + i * 40, hy + 70 - i * 40], 10, '#c9d6e6'); drawNoahHand(c, hx, hy, .75, 2.4); }
      }],
      screen: [c => rainSheet(c, t, { amount: 0 }), c => noirGrade(c, t, { vig: .65 }), c => dosTag(c, t, TAG)] };
  } };
const shotD = {
  name: 'D the message (POV, phone in hand)', dur: T.bett - T.msg, f(lt, Tt, t) {
    const n = 6, sway = Math.sin(t * 1.3) * 6;
    return { set: (c, cam, tt) => { ceilingNight(c, cam, tt); return { base: '#0c0f18' }; }, cam: S(0, 0, 1 + lt * .012), vignette: .3,
      fx: [c => {
        c.save(); c.translate(sway, 30 + Math.cos(t * 1.1) * 5); c.rotate(.02 + sway * .001);
        phoneUI(c, -250, -470, 500, 1000, { mode: 'chat', words: n, t, glow: 1.6 });
        // hand holding the phone from below (thumb on the side), pyjama cuff
        line(c, [120, 900, 150, 520], 170, OUT); line(c, [120, 900, 150, 520], 150, '#8fa3bf'); for (const d of [-40, 0, 40]) line(c, [120 + d, 900, 150 + d, 520], 10, '#c9d6e6');
        drawNoahHand(c, 160, 470, 1.05, Math.PI * .92);
        c.restore();
      }],
      screen: [c => noirGrade(c, t, { vig: .7 })] };
  } };
const shotE = {
  name: 'E overhead: awake next to his sleeping wife', dur: T.sie - T.bett, f(lt, Tt, t) {
    const v = t < T.frau ? camAt(S(-300, -600, 1.2), S(-295, -590, 1.12), lt / (T.frau - T.bett)) : camAt(S(-295, -590, 1.12), S(0, -380, .8), (t - T.frau) / 2.0);
    const e = Object.assign({}, EX.alert, { look: t < 15.3 ? 0 : t < 16.3 ? .7 : .2 });
    return { set: bedTop, setOpts: { noahExpr: withBlink(e, t, 7, 5), phoneGlow: 1 }, cam: v, vignette: .2,
      screen: [c => noirGrade(c, t, { vig: .6 })] };
  } };
const shotF = {
  name: 'F close-up: phone light on his face, heartbeat', dur: T.cut2 - T.sie, f(lt, Tt, t) {
    const pulse = beatPulse(t), v = camAt(S(-300, -700, 1.95), S(-300, -720, 2.25), lt / Tt); v.z += pulse * .015;
    const e = Object.assign({}, EX.alert, { look: lt < 1.6 ? .15 : -.55 });
    return { set: bedTop, setOpts: { noahExpr: e, phoneGlow: 1.2 }, cam: v, vignette: .3,
      screen: [c => { c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, H, 0, H * .3); g.addColorStop(0, `rgba(90,130,255,${.38 + pulse * .05})`); g.addColorStop(1, 'rgba(90,130,255,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); },
        c => noirGrade(c, t, { vig: .7 + pulse * .08 })] };
  } };
// ---------- G: the dossier lands on the desk and opens into the full-screen table ----------
const PAGE = { w: 1600, h: 900 };
const ROWS = [['Sportwagen', 'Kleinwagen'], ['Smoking', 'grauer Mantel'], ['Action', 'Berichte lesen'], ['Weltberühmt', 'Niemand kennt dich'], ['Martini', 'kalter Kaffee']];
const G0 = T.cut2, TB = { land: G0 + .22, open: G0 + .55, inStart: G0 + .7, inEnd: G0 + 1.35, head: G0 + 1.25, rows: [23.4, 24.15, 24.9, 25.6, 26.3], strike: 27.75, outStart: 28.35, cut: 28.9 };
const SPOKEN = [[T.autos, 0], [T.smoking, 1], [T.martini, 4]];
CUE('whoosh', G0); CUE('drop', TB.land); CUE('paper', TB.open); CUE('whoosh', TB.inStart, { soft: 1 });
CUE('typeRun', TB.head, { dur: .7 }); TB.rows.forEach(r => CUE('typeRow', r, { dur: .45 })); for (let i = 0; i < 5; i++) CUE('strike', TB.strike + i * .09); CUE('whooshOut', TB.outStart);
function filmTable(c, w, h, t) {
  const lt = t;
  dosType(c, 'FILM vs. REALITÄT', 70, 108, 64, (lt - TB.head) / .7);
  dosStamp(c, 'VERTRAULICH', w - 230, 82, 30, .09, (lt - (TB.head + .5)) / .14);
  c.fillStyle = DOS.line; c.fillRect(60, 145, w - 120, 3);
  const cx = [90, 830], cw = 680, y0 = 205, rh = 122;
  // FILM column: glossy, fake, over-saturated
  const kF = clamp((lt - TB.head) / .4, 0, 1), struck = clamp((lt - TB.strike) / .45, 0, 1);
  c.save(); c.globalAlpha = kF; const gF = c.createLinearGradient(cx[0], y0, cx[0] + cw, y0 + 660); gF.addColorStop(0, '#ffcf4a'); gF.addColorStop(.45, '#ff4fa0'); gF.addColorStop(1, '#3fd6ff');
  c.fillStyle = gF; c.fillRect(cx[0], y0, cw, 660); c.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 9; i++) c.fillRect(cx[0] + i * 90 - 30, y0, 34, 660);
  for (let i = 0; i < 14; i++) { const sx = cx[0] + rnd(i + 3) * cw, sy = y0 + rnd(i + 9) * 660, s = 6 + 5 * Math.sin(t * 6 + i); star(c, sx, sy, s, 4, .4); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); }
  if (struck > 0) { c.globalAlpha = kF * struck * .55; c.fillStyle = '#2a2f3a'; c.fillRect(cx[0], y0, cw, 660); }
  c.restore();
  c.save(); c.globalAlpha = clamp((lt - TB.head) / .4, 0, 1); c.fillStyle = '#2e333e'; c.fillRect(cx[1], y0, cw, 660); c.restore();
  dosType(c, 'FILM', cx[0] + 30, y0 + 64, 44, (lt - TB.head - .2) / .2, { col: '#fff' }); dosType(c, 'REALITÄT', cx[1] + 30, y0 + 64, 44, (lt - TB.head - .3) / .3, { col: DOS.cream });
  ROWS.forEach(([f, r], i) => {
    const t0 = TB.rows[i], y = y0 + 150 + i * rh * .82, k = (lt - t0) / .35; if (k <= 0) return;
    const spoken = SPOKEN.find(([st, ri]) => ri === i && lt >= st - .05 && lt < st + 1.1);
    if (spoken) { c.fillStyle = 'rgba(200,53,44,.28)'; c.fillRect(cx[1], y - 52, cw, 72); c.fillStyle = DOS.red; c.fillRect(cx[1], y - 52, 10, 72); }
    c.save(); c.shadowColor = 'rgba(120,0,80,.6)'; c.shadowOffsetY = 4; dosType(c, f, cx[0] + 34, y, 46, k, { col: '#ffffff', ink: false }); c.restore();
    dosType(c, r, cx[1] + 34, y, 46, (lt - t0 - .12) / .4, { col: spoken ? '#ffd9d4' : '#c9c6bd' });
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(cx[0], y + 30, cw * 2 + 60, 2);
    // red strike through the FILM entry
    const ks = clamp((lt - TB.strike - i * .09) / .18, 0, 1);
    if (ks > 0) { c.save(); c.lineCap = 'round'; c.strokeStyle = DOS.red; c.lineWidth = 12; c.beginPath(); c.moveTo(cx[0] + 20, y - 14 + 4); c.lineTo(cx[0] + 20 + (cw - 40) * ks, y - 16 - 6 * ks); c.stroke(); c.restore(); }
  });
  // one big diagonal stroke over the whole FILM column
  const kd = clamp((lt - TB.strike - .5) / .25, 0, 1);
  if (kd > 0) { c.save(); c.lineCap = 'round'; c.strokeStyle = DOS.red; c.lineWidth = 18; c.globalAlpha = .9; c.beginPath(); c.moveTo(cx[0] + 10, y0 + 640); c.lineTo(cx[0] + 10 + (cw - 20) * kd, y0 + 640 - 620 * kd); c.stroke(); c.restore(); }
}
const shotG = {
  name: 'G dossier → FILM vs. REALITÄT', dur: TB.cut - G0, f(lt, Tt, t) {
    const drop = clamp((t - G0) / (TB.land - G0), 0, 1), open = ease(seg(t, TB.open, TB.open + .45));
    const wide = S(0, 0, .52), full = S(0, 0, 1.12);
    let v = t < TB.inStart ? wide : t < TB.outStart ? camAt(wide, full, (t - TB.inStart) / (TB.inEnd - TB.inStart)) : camAt(full, S(60, 30, .58), (t - TB.outStart) / .5);
    v = Object.assign({}, v); v.x += Math.sin(t * .7) * 3;
    return { set: deskTop, cam: v, vignette: .2,
      fx: [c => { const sc = 1 + (1 - easeIn(drop)) * .5; c.save(); c.scale(sc, sc); c.rotate((1 - drop) * .06 - .01); dossierFolder(c, 0, 0, PAGE.w, PAGE.h, open, { lift: 1 + (1 - drop) * 2, page: (c, w, h) => filmTable(c, w, h, t) }); c.restore(); }],
      screen: [c => lampPool(c, v, -200, -300, 2200, .3), c => noirGrade(c, t, { vig: .55, warm: .25, wx: .4, wy: .3, mult: 'rgba(190,190,215,.22)' })] };
  } };
// ---------- H: rainy street, the man in the grey coat ----------
const shotH = {
  name: 'H rain street, grey coat', dur: T.end - TB.cut, f(lt, Tt, t) {
    const v = camAt(S(250, -330, 1.2), S(300, -360, 1.38), lt / Tt);
    return { set: rainStreet, setOpts: { lamps: [-700, 260, 1300] }, cam: v, vignette: .2,
      fx: [c => {
        silhouette(c, cc => drawPal(cc, { look: 'follower', x: 360, k: .25, ink: 1.8, outfit: 'agent', coat: true, hat: true, s: -1, arms: { l: { a: .1, b: -.05 }, r: { a: .1, b: -.05 } } }), '#0b0e17', { col: 'rgba(255,215,150,.9)', off: [[-3, -3]] });
        c.save(); c.globalAlpha = .25; c.translate(0, 8); c.scale(1, -.6); silhouette(c, cc => drawPal(cc, { look: 'follower', x: 360, k: .25, outfit: 'agent', coat: true, hat: true, s: -1 }), '#05070c'); c.restore();
        rainSplashes(c, t, { x0: -400, x1: 1200, y: 0, depth: 300, n: 60 });
      }],
      screen: [c => rainSheet(c, t, { amount: 1.3, alpha: .4 }), c => noirGrade(c, t, { vig: .65 })], fade: seg(t, T.end - .7, T.end) };
  } };
// small sets used above
function deskTopNight(c, cam, t) { deskTop(c, cam, t); layer(c, cam, 1, c => { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(60,70,110,.75)'; c.fillRect(-4000, -4000, 8000, 8000); c.restore(); seg7(c, '03:00', -760, -560, 120, '#ff3b2f'); c.beginPath(); rrect(c, -800, -600, 400, 210, 16); c.lineWidth = 8; c.strokeStyle = '#151619'; c.stroke(); blindStripes(c, -2000, -1600, 3000, 1500, 12, 150, 50, .07); }); }
function ceilingNight(c, cam, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0d111c'; c.fillRect(0, 0, W, H);
  layer(c, cam, .8, c => { c.fillStyle = '#151a28'; c.fillRect(-3000, -3000, 6000, 6000); for (let i = -10; i < 10; i++) line(c, [-3000, i * 300, 3000, i * 300 + 40], 3, 'rgba(255,255,255,.03)'); blindStripes(c, -2200, -1400, 3600, 1300, 12, 120, 40, .09); circle(c, 700, -380, 120); fs(c, '#1d2334', 4); circle(c, 700, -380, 50); fs(c, '#2a3044', 3); });
}
NOAH_FONTS_READY.then(() => defineFilm({ fadeIn: .5, fadeOut: 0, shots: [shotA, shotC, shotD, shotE, shotF, shotG, shotH] }));
