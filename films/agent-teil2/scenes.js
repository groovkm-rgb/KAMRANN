// AGENT – TEIL 2 (0:00–8:29,15), synced 1:1 to TEIL2.mp3. Times = audio seconds (from the transcript).
const END = 509.15;
const NOAH_AGENT = (o) => Object.assign({ k: .25, ink: 1.8, outfit: 'agent', coat: true, hat: true }, o);
const fol = (o) => Object.assign({ look: 'follower', k: .25, ink: 1.8, outfit: 'agent', coat: true, hat: true }, o);
// ======================= 06 BORING EVERYDAY LIFE =======================
function gDesk(c, x, t, o = {}) {
  c.beginPath(); c.rect(x - 330, -330, 660, 24); fs(c, '#8a8e94', 3); line(c, [x - 300, -306, x - 300, 0], 12, '#5a5e64'); c.beginPath(); c.rect(x + 120, -306, 190, 306); fs(c, '#7a7e84', 3);
  // monitor
  c.beginPath(); c.rect(x - 14, -420, 28, 90); fs(c, '#2a2e34', 2); c.beginPath(); rrect(c, x - 200, -640, 400, 240, 10); fs(c, '#1a1e24', 3);
  c.save(); c.beginPath(); c.rect(x - 186, -626, 372, 212); c.clip(); c.fillStyle = '#0e2a3a'; c.fillRect(x - 186, -626, 372, 212);
  for (let i = 0; i < 12; i++) { const yy = -620 + ((i * 18 + t * 40) % 212); c.fillStyle = 'rgba(120,220,255,.6)'; c.fillRect(x - 176, yy, 60 + rnd(i + (x | 0)) * 260, 6); } c.restore(); bloom(c, x, -520, 300, '100,200,255', .25);
  filingStack(c, x - 220, o.stack || 7, -330); filingStack(c, x + 230, (o.stack || 7) - 2, -330);
  c.beginPath(); c.rect(x + 80, -390, 50, 60); fs(c, '#e8e4dc', 2.5); c.fillStyle = '#4a3020'; c.fillRect(x + 84, -384, 42, 10);
}
function greyOffice(c, cam, t, o = {}) {
  return room(c, cam, t, { wall: o.night ? '#2a2e38' : '#8e9296', floor: o.night ? '#24262c' : '#6a6e72', floorType: 'carpet', light: o.night ? 'cold' : 'grey', wallpaper: false, lampsCeil: [-1600, -500, 600, 1700], lampOn: !o.night,
    windows: o.night ? [{ x: -2400, w: 700, h: 700, view: 'city', curtains: false }] : [{ x: -2400, w: 700, h: 700, view: 'grey', blinds: .6, curtains: false }],
    back: (c, b) => { for (let i = 0; i < 3; i++) { c.beginPath(); rrect(c, 300 + i * 520, b - 1150, 480, 290, 10); fs(c, '#1a1e24', 4); c.fillStyle = '#122030'; c.fillRect(316 + i * 520, b - 1134, 448, 258); c.strokeStyle = 'rgba(120,200,255,.5)'; c.lineWidth = 3; c.beginPath(); for (let k = 0; k < 40; k++) c.lineTo(330 + i * 520 + k * 11, b - 1000 + Math.sin(k * .7 + t + i) * 40 + rnd(k + i * 50) * 30); c.stroke(); } },
    floorFn: (c, tt) => { gDesk(c, -1300, tt, { stack: 5 }); gDesk(c, 1500, tt, { stack: 6 }); } });
}
function shotOfficeWide(lt, T, t) {
  return { set: greyOffice, cam: drift(camAt(S(0, -520, .7), S(60, -500, .82), lt / T), t, 2), vignette: .3,
    fx: [c => { gDesk(c, 100, t, { stack: 9 }); drawNoah(c, noahF({ x: 100, sit: true, seatH: 560, outfit: 'agent', expr: withBlink(EX.tired, t, 4, 1) })); c.beginPath(); c.rect(-230, -330, 660, 24); fs(c, '#8a8e94', 3); for (const [x, lk] of [[-1300, 'colleague'], [1500, 'agentF']]) silhouette(c, cc => drawPal(cc, { look: lk, x, k: .5, sit: true, seatH: 560, outfit: 'agent' }), 'rgba(40,44,52,.75)'); }],
    screen: [c => G.grey(c, t)] };
}
function shotDetails(lt, T, t) {
  // 5.9 carpet → 7.6 coffee → 8.6 computer
  if (t < 7.5) return { set: greyOffice, cam: S(-200 + lt * 120, 150, 2.4), vignette: .4, fx: [c => { for (let i = 0; i < 600; i++) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-1000 + rnd(i) * 2000, -170 + rnd(i + 3) * 500, 5, 3); } }], screen: [c => G.grey(c, t)] };
  if (t < 8.9) return { set: deskTop, setOpts: {}, cam: S(1250, -420, 1.7), vignette: .4, screen: [c => G.grey(c, t)] };
  return { set: greyOffice, cam: S(100, -520, 2.4), vignette: .4, fx: [c => gDesk(c, 100, t, { stack: 9 })], screen: [c => G.grey(c, t)] };
}
CUE('amb', 0, { name: 'office', until: 41.62 }); for (let tt = 9.0; tt < 10.9; tt += 2) CUE('keys', tt);
function shotReading(lt, T, t) {
  const flip = Math.floor((t - 10.96) / .9);
  return { set: greyOffice, cam: drift(camAt(S(100, -640, 1.6), S(100, -660, 1.85), lt / T), t, 1), vignette: .35,
    fx: [c => { drawNoah(c, noahF({ x: 100, sit: true, seatH: 560, outfit: 'agent', expr: withBlink(Object.assign({}, EX.sleepless, { look: Math.sin(t * 2.4) * .5 }), t, 4, 2), arms: { l: { a: .6, b: -1.6 }, r: { a: .6, b: -1.6 } } }));
      c.save(); c.translate(100, -420); c.fillStyle = '#efe9da'; c.fillRect(-150, -110, 300, 200); for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-130, -90 + i * 20, 200 + rnd(i + flip) * 60, 4); } c.restore(); filingStack(c, -220, 10 + flip, -330); filingStack(c, 360, 12, -330); }],
    screen: [c => G.grey(c, t)] };
}
for (let i = 0; i < 6; i++) CUE('paper', 11.0 + i * .9, { gain: .6 });
function shotMonitors(lt, T, t) {
  return { set: (c, cam, tt) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0a0e14'; c.fillRect(0, 0, W, H); return { base: '#0a0e14' }; }, cam: drift(S(0, 0, 1), t, 2), vignette: .4,
    fx: [c => {
      c.beginPath(); rrect(c, -880, -460, 1760, 920, 24); fs(c, '#141a22', 8); c.save(); c.beginPath(); c.rect(-850, -430, 1700, 860); c.clip(); c.fillStyle = '#0c1a26'; c.fillRect(-850, -430, 1700, 860);
      for (let i = -20; i < 20; i++) { c.fillStyle = 'rgba(80,160,220,.06)'; c.fillRect(i * 50, -430, 2, 860); c.fillRect(-850, i * 50, 1700, 2); }
      if (t < 20.9) { // who spoke with whom: network graph
        const N = 10, P = i => [Math.cos(i * 2.4) * 520 * (.4 + rnd(i) * .6), Math.sin(i * 2.4) * 300 * (.4 + rnd(i + 3) * .6)], k = clamp((t - 18.4) / 2.2, 0, 1);
        for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (rnd(i * 13 + j) > .7) { const [a, b] = [P(i), P(j)]; line(c, [a[0], a[1], lerp(a[0], b[0], k), lerp(a[1], b[1], k)], 3, 'rgba(120,220,255,.6)'); }
        for (let i = 0; i < N; i++) { const [x, y] = P(i); circle(c, x, y, 26); fs(c, i === 3 ? '#c8352c' : '#2f6fb0', 3); silhouette(c, cc => { circle(cc, x, y - 6, 9); cc.fill(); cc.beginPath(); cc.ellipse(x, y + 14, 14, 9, 0, Math.PI, 0); cc.fill(); }, '#e8f2ff'); }
      } else if (t < 22.5) { // which ship was where: abstract coastline (no real geography) + moving dots
        c.fillStyle = '#1e3a2e'; c.beginPath(); c.moveTo(-850, -430); for (let i = 0; i <= 20; i++) c.lineTo(-850 + i * 85, -200 + Math.sin(i * 1.3) * 80 + rnd(i) * 60); c.lineTo(850, -430); c.fill();
        for (let i = 0; i < 7; i++) { const x = -700 + i * 220 + (t - 20.9) * 60 * (i % 2 ? 1 : -1), y = 50 + rnd(i) * 250; line(c, [x - 120, y + 30, x, y], 3, 'rgba(255,220,120,.4)'); c.save(); c.translate(x, y); c.rotate(-.25); c.beginPath(); c.moveTo(-18, -8); c.lineTo(22, 0); c.lineTo(-18, 8); c.closePath(); c.fillStyle = i === 4 ? '#ff6a5a' : '#ffd36a'; c.fill(); c.restore(); }
      } else { // which company suddenly moved a lot of money: bars, one spikes
        for (let i = 0; i < 14; i++) { const h = (i === 10 ? lerp(60, 640, ease(seg(t, 23.2, 24.3))) : 60 + rnd(i) * 140); c.fillStyle = i === 10 ? '#c8352c' : '#2f6fb0'; c.fillRect(-780 + i * 110, 400 - h, 80, h); }
      }
      c.restore(); bloom(c, 0, 0, 1000, '100,180,255', .15);
    }],
    screen: [c => noirGrade(c, t, { vig: .6 })] };
}
[18.6, 20.96, 22.58].forEach(a => CUE('keys', a - .2));
const TB4 = { t0: 25.62, t1: 33.7, head: 26.9 };
const DAY = [['Berichte lesen', .46, '#8b93a6'], ['Daten vergleichen', .3, '#6a7488'], ['Besprechungen', .2, '#555e70'], ['Einsatz im Feld', .04, '#c8352c']];
function dayPage(c, w, h, t) {
  pageHead(c, w, t, TB4.head, 'EIN ARBEITSTAG');
  let x = 120; const y = 300, bw = 1360, bh = 150;
  DAY.forEach(([s, v, col], i) => { const at = 27.6 + i * .7, k = easeOut(clamp((t - at) / .55, 0, 1)); if (k <= 0) return; c.fillStyle = col; c.fillRect(x, y, bw * v * k, bh); c.strokeStyle = '#0d121e'; c.lineWidth = 3; c.strokeRect(x, y, bw * v * k, bh);
    const ly = 560 + i * 70; c.fillStyle = col; c.fillRect(120, ly - 30, 34, 34); dosType(c, s, 175, ly, 38, (t - at) / .35, { col: i === 3 ? '#ffd9d4' : DOS.cream }); x += bw * v; });
  const ak = clamp((t - 30.6) / .4, 0, 1); if (ak > 0) { const ax = 120 + bw * .98; c.save(); c.globalAlpha = ak; c.strokeStyle = DOS.red; c.fillStyle = DOS.red; c.lineWidth = 8; line(c, [ax + 20, y - 120, ax + 6, y - 14], 8, DOS.red); c.beginPath(); c.moveTo(ax + 6, y - 4); c.lineTo(ax - 14, y - 40); c.lineTo(ax + 26, y - 34); c.closePath(); c.fill(); dosType(c, 'selten', ax - 120, y - 140, 46, 1, { col: '#ff8a80', caret: false }); c.restore(); }
}
const tam4 = tamShot({ t0: TB4.t0, t1: TB4.t1, page: dayPage, cues: [[TB4.head, 'typeRun', .6], ...[0, 1, 2, 3].map(i => [27.6 + i * .7, 'typeRow', .3]), [30.6, 'stamp']] });
function shotPuzzle(lt, T, t) {
  const find = seg(t, 36.0, 37.4);
  if (t < 38.6) return { set: deskTop, cam: drift(camAt(S(0, 0, .7), S(220, -120, 1.4), lt / 4.9), t, 2), vignette: .3,
    fx: [c => { for (let i = 0; i < 260; i++) { const x = -1500 + rnd(i) * 3000, y = -800 + rnd(i + 5) * 1600; c.save(); c.translate(x, y); c.rotate(rnd(i + 9) * 6); puzzlePiece(c, 0, 0, 60, ['#8a92a0', '#6a7280', '#a8aeb8', '#5a6270'][i % 4]); c.restore(); }
      const px = lerp(500, 220, ease(find)), py = lerp(300, -120, ease(find)); puzzlePiece(c, px, py, 70, '#c8352c'); bloom(c, px, py, 200, '255,120,100', .4 * find); drawNoahHand(c, px + 60, py + 70, .8, -.6); }],
    screen: [c => lampPool(c, S(0, 0, 1), 0, 0, 2200, .3), c => G.warm(c, t)] };
  return { set: greyOffice, cam: S(100, -660, 2.3 + (t - 38.6) * .05), vignette: .4, fx: [c => drawNoah(c, noahF({ x: 100, sit: true, seatH: 560, outfit: 'agent', expr: { lid: .45, mouth: 'flat', look: -.3 } }))], screen: [c => G.grey(c, t)] };
}
function puzzlePiece(c, x, y, s, col) { c.beginPath(); c.moveTo(x - s / 2, y - s / 2); c.lineTo(x - s * .1, y - s / 2); c.arc(x, y - s / 2, s * .14, Math.PI, 0); c.lineTo(x + s / 2, y - s / 2); c.lineTo(x + s / 2, y - s * .1); c.arc(x + s / 2, y, s * .14, -Math.PI / 2, Math.PI / 2); c.lineTo(x + s / 2, y + s / 2); c.lineTo(x - s / 2, y + s / 2); c.closePath(); fs(c, col, 2.5); }
CUE('ding', 37.3);
// ======================= 07 THE MESSAGE AND THE STATION =======================
function shotDeskPhone(lt, T, t) {
  const buzz = t > 42.0 && t < 44.0 ? Math.sin(t * 95) * 5 : 0;
  return { set: deskTop, cam: drift(camAt(S(0, 0, 1.2), S(0, -30, 1.45), lt / T), t, 2), vignette: .35,
    fx: [c => { c.save(); c.translate(buzz, 0); c.rotate(-.06); phoneUI(c, -175, -365, 350, 730, t < 44.6 ? { mode: 'lock', big: '17:42', date: 'Montag', notif: seg(t, 42.0, 42.4), t, glow: 1.2 } : { mode: 'chat', words: 6, t, glow: 1.2, msg: 'Morgen. 8 Uhr. Bahnhof.', time: '17:42' }); c.restore(); filingStack(c, -700, 8, 300); }],
    screen: [c => G.grey(c, t)] };
}
CUE('vibrate', 42.0, { dur: 1.9 });
function kitchen(c, cam, t) { return room(c, cam, t, { wall: '#d8c8a8', floor: '#8a6a4a', floorType: 'tile', light: 'day', curtain: '#c8a060', windows: [{ x: -300, w: 600, h: 520, view: 'day' }], back: (c, b) => { for (let i = 0; i < 4; i++) { c.beginPath(); c.rect(-1400 + i * 320, b - 1300, 290, 300); fs(c, '#e8e0cc', 3); circle(c, -1150 + i * 320, b - 1150, 8); fs(c, '#888', 1); } }, floorFn: c => counter(c, -1000, 1300) }); }
CUE('amb', 47.98, { name: 'kitchen', until: 62.42 });
function shotKitchen(lt, T, t) {
  const kiss = bump(t, 55.6, 57.0), wx = lerp(600, 260, ease(seg(t, 54.6, 55.6)));
  return { set: kitchen, cam: drift(camAt(S(150, -460, .9), S(170, -480, 1.05), lt / T), t, 2), vignette: .25,
    fx: [c => { castShadow(c, -80, 230); drawNoah(c, noahF({ x: -80, outfit: 'agent', expr: withBlink(t < 54 ? { mouth: 'soft', look: .6 } : EX.fakeSmile, t, 3.8, 2), tilt: kiss * .12, arms: { l: { a: .15, b: -.1 }, r: { a: .35, b: -.6 } } }));
      castShadow(c, wx, 220); drawPal(c, { look: 'wife', x: wx, k: .48, ink: 1.8, outfit: 'home', tilt: -kiss * .15, expr: withBlink({ mouth: t > 57 && t < 58.4 ? 'o' : 'smile', open: .3, look: -.6, lid: kiss > .5 ? 1 : .15, eyes: kiss > .5 ? 'closed' : 'open' }, t, 3.5, 4) });
      c.save(); c.translate(-80 + 130, -420); c.beginPath(); c.rect(-50, -40, 100, 80); fs(c, '#3a2a20', 3); line(c, [-30, -40, -30, -70, 30, -70, 30, -40], 6, '#2a1a10'); c.restore(); }],
    screen: [c => G.day(c, t)] };
}
CUE('kiss', 56.2);
function shotFakeSmile2(lt, T, t) { return { set: kitchen, cam: drift(camAt(S(-80, -640, 2.1), S(-80, -650, 2.35), lt / T), t, 1), vignette: .35, fx: [c => drawNoah(c, noahF({ x: -80, outfit: 'agent', expr: withBlink(Object.assign({}, EX.fakeSmile, { look: t < 60 ? .5 : -.4 }), t, 3.5, 2) }))], screen: [c => G.day(c, t)] }; }
CUE('amb', 62.42, { name: 'station', until: 82.88 });
function shotStationWide(lt, T, t) { const x = walkX(t, 62.42, -700, 120); return { set: station, setOpts: { clock: '8:00', clockX: 300, fog: .35 }, cam: drift(camAt(S(0, -720, .52), S(100, -700, .6), lt / T), t, 3), vignette: .3, fx: [c => { castShadow(c, x, 170); drawNoahSide(c, { x, k: .38, ink: 1.8, outfit: 'agent', coat: true, walk: t * 7.5, expr: EX.alert }); }], screen: [c => G.fog(c, t)] }; }
for (let tt = 62.6; tt < 66.8; tt += .55) CUE('step', tt, { surf: 'marble' });
function shotLocker(lt, T, t) {
  const dk = seg(t, 67.4, 68.2), reach = seg(t, 69.0, 70.4);
  return { set: station, setOpts: { crowd: false, lockers: { x: 200, open: 15, doorK: dk, inside: (c, x, y) => { c.fillStyle = '#d9c7a0'; c.fillRect(x - 50 + reach * 40, y - 40, 100, 70); } }, fog: .1 }, cam: drift(camAt(S(620, -380, 1.25), S(640, -420, 1.55), lt / T), t, 2), vignette: .35,
    fx: [c => { castShadow(c, 260, 170); drawNoahSide(c, { x: 260, k: .38, ink: 1.8, outfit: 'agent', coat: true, walk: null, expr: withBlink(EX.mask, t, 5, 3) }); }], screen: [c => G.fog(c, t)] };
}
CUE('lock', 67.3); CUE('locker', 67.5); CUE('envelope', 69.6);
function shotItems(lt, T, t) {
  return { set: deskTop, cam: drift(camAt(S(0, 0, .6), S(0, -20, .68), lt / T), t, 2), vignette: .25,
    fx: [c => {
      const at = [71.6, 72.6, 73.8, 75.9], K = i => easeOut(clamp((t - at[i]) / .35, 0, 1));
      c.save(); c.translate(-1100, -150); c.rotate(-.1); c.fillStyle = '#d9c7a0'; c.fillRect(-300, -200, 600, 400); c.strokeStyle = '#6a5a3a'; c.lineWidth = 4; c.strokeRect(-300, -200, 600, 400); line(c, [-300, -200, 0, 20, 300, -200], 4, '#8a7a5a'); c.restore();
      if (K(0) > 0) { c.save(); c.translate(-450 + (1 - K(0)) * -400, 250); c.rotate(.06); c.fillStyle = '#e8e2d0'; c.fillRect(-260, -110, 520, 220); c.fillStyle = '#c8352c'; c.fillRect(-260, -110, 520, 40); hudText(c, 'Fahrkarte', -230, -76, 30, '#fff'); hudText(c, '1. Klasse · einfach', -230, 0, 32, '#222'); hudText(c, 'Abfahrt 08:14', -230, 60, 32, '#222'); c.restore(); }
      if (K(1) > 0) { c.save(); c.translate(200 + (1 - K(1)) * 400, -120); c.rotate(-.05); c.fillStyle = '#2a1a3a'; c.fillRect(-260, -340, 520, 680); hudText(c, 'REISEPASS', 0, -220, 58, '#d8c070', 'center'); circle(c, 0, -20, 90); c.lineWidth = 6; c.strokeStyle = '#d8c070'; c.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; line(c, [Math.cos(a) * 30, -20 + Math.sin(a) * 30, Math.cos(a) * 80, -20 + Math.sin(a) * 80], 4, '#d8c070'); } c.restore(); }
      if (K(2) > 0) { c.save(); c.translate(900, 120 + (1 - K(2)) * 300); c.rotate(.08); c.fillStyle = '#efe9da'; c.fillRect(-360, -230, 720, 460); c.fillStyle = '#9aa4b0'; c.fillRect(-330, -200, 240, 300); drawNoahHead(c, -210, -60, .4, { mouth: 'flat' }); hudText(c, 'Name:', -60, -140, 34, '#555'); hudText(c, 'Markus Lenz', -60, -90, 44, '#1a2234'); hudText(c, 'Geboren: ████', -60, -20, 30, '#555'); c.fillStyle = '#ccc'; c.fillRect(-330, 140, 660, 50); c.restore(); }
      if (K(3) > 0) { c.save(); c.translate(-250, -500 - (1 - K(3)) * 300); c.rotate(-.12); c.fillStyle = '#fff8b8'; c.fillRect(-200, -120, 400, 240); hudText(c, 'Lindengasse 14', -170, -30, 40, '#1a2234'); hudText(c, '15:30', -170, 40, 40, '#1a2234'); c.restore(); }
    }],
    screen: [c => lampPool(c, S(0, 0, .6), -100, 0, 2400, .35), c => G.warm(c, t)] };
}
[71.6, 72.6, 73.8, 75.9].forEach(a => CUE('paper', a));
const TAG8 = { t0: 78.3, t1: 82.6, corner: 'tl', text: 'TAG 1 · 08:00 Uhr', stamp: false }; dosCardCues(TAG8, 1);
function shotBurn(lt, T, t) {
  const k = clamp((t - 78.4) / 3.6, 0, 1);
  return { set: (c, cam, tt) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0c0c10'; c.fillRect(0, 0, W, H); return { base: '#0c0c10' }; }, cam: S(0, 0, 1), vignette: .5,
    fx: [c => {
      c.save(); c.beginPath(); c.rect(-200, -300 + k * 420, 400, 300 - k * 260); c.clip(); c.fillStyle = '#fff8b8'; c.fillRect(-200, -300, 400, 300); hudText(c, 'Lindengasse 14', -170, -200, 40, '#1a2234'); hudText(c, '15:30', -170, -130, 40, '#1a2234'); c.restore();
      const fy = -300 + k * 420; for (let i = 0; i < 9; i++) { const fx2 = -190 + i * 48, fl = 30 + 20 * Math.sin(t * 18 + i * 2); c.beginPath(); c.moveTo(fx2 - 18, fy + 6); c.quadraticCurveTo(fx2, fy - fl * 2, fx2 + 18, fy + 6); c.fillStyle = 'rgba(255,170,60,.9)'; c.fill(); } bloom(c, 0, fy, 420, '255,150,60', .7 * (1 - k * .6));
      line(c, [-200, fy + 8, 200, fy + 8], 10, '#2a1a10');
      for (let i = 0; i < 26; i++) { const ph = ((t * .5 + rnd(i)) % 1); circle(c, -200 + rnd(i + 3) * 400 + Math.sin(t + i) * 40, fy - ph * 500, 3 + rnd(i) * 4); c.fillStyle = `rgba(60,55,50,${1 - ph})`; c.fill(); }
      drawNoahHand(c, 200, -260, 1.2, 1.2); line(c, [400, -600, 240, -330], 140, OUT); line(c, [400, -600, 240, -330], 120, '#1f2a45');
    }],
    screen: [c => noirGrade(c, t, { vig: .7, warm: .3 }), c => dosTag(c, t, TAG8)] };
}
CUE('burn', 78.3);
// ======================= 08 THE FOREIGN CITY AND THE TAIL =======================
CUE('amb', 82.88, { name: 'streetRain', until: 104.7 });
function shotTrain(lt, T, t) { return { set: station, setOpts: { train: seg(t, 82.9, 86.5), crowd: true, fog: .15 }, cam: drift(camAt(S(-300, -560, .55), S(-100, -540, .62), lt / T), t, 3), vignette: .35, screen: [c => rainSheet(c, t, { amount: .9, alpha: .3 }), c => noirGrade(c, t, { vig: .65, mult: 'rgba(120,135,190,.55)' })] }; }
CUE('brake', 83.4);
function shotWetWide(lt, T, t) { return { set: rainStreet, setOpts: { lamps: [-900, 300, 1400], seed: 5 }, cam: drift(camAt(S(0, -200, .8), S(150, -150, .9), lt / T), t, 3), vignette: .25, fx: [c => rainSplashes(c, t, { x0: -1500, x1: 1500, y: 0, depth: 400, n: 90 })], screen: [c => rainSheet(c, t, { amount: 1.3, alpha: .4 }), c => G.rain(c, t)] }; }
function rainWalk(t0, x0, o = {}) {
  return (lt, T, t) => { const x = walkX(t, t0, x0, 150);
    return { set: rainStreet, setOpts: { lamps: [-700, 260, 1300], seed: o.seed || 3 }, cam: drift(S(x + (o.lead ?? 120), -330, o.z || 1.3), t, 3), vignette: .2,
      fx: [c => { castShadow(c, x, 120, { alpha: .25 }); drawNoahSide(c, NOAH_AGENT({ x, walk: t * 8, expr: withBlink(o.expr || EX.mask, t, o.blink || 4, 3) })); if (o.extra) o.extra(c, t, x); rainSplashes(c, t, { x0: x - 900, x1: x + 900, y: 0, depth: 300, n: 60 }); }],
      screen: [c => rainSheet(c, t, { amount: 1.1, alpha: .38 }), c => G.rain(c, t), ...(o.screen || []).map(f => c => f(c, t))] }; };
}
for (let tt = 93.0; tt < 104.6; tt += .5) CUE('step', tt, { surf: 'wet' });
// café: window seat, the man passes outside
CUE('amb', 104.7, { name: 'cafe', until: 115.42 });
function cafe(c, cam, t) {
  return room(c, cam, t, { wall: '#5a3a2a', floor: '#3a2a20', light: 'warm', curtain: '#6a2a2a', windows: [{ x: -900, w: 1400, h: 700, y: 1000, view: 'rain', curtains: false }], wainscot: true, lampsCeil: [900],
    back: (c, b) => { // the man passes behind the glass (only a moment)
      const mx = lerp(-1100, 700, clamp((t - 109.3) / 2.6, 0, 1)); if (t > 109.2 && t < 112) { c.save(); c.beginPath(); c.rect(-900, b - 1000, 1400, 700); c.clip(); silhouette(c, cc => drawPal(cc, fol({ x: mx, y: b - 300, k: .42, side: true, s: 1, walk: t * 8 })), 'rgba(30,34,44,.85)'); c.restore(); }
      sign(c, -200, b - 1150, 'Café', { size: 50, bg: '#3a2418', col: '#ffd9a0' }); } });
}
function shotCafe(lt, T, t) {
  const look = t > 109.4 && t < 112 ? -.9 : (t > 112 ? 0 : -.5);
  return { set: cafe, cam: drift(camAt(S(-150, -560, .95), S(-50, -580, 1.15), lt / T), t, 2), vignette: .3,
    fx: [c => { drawNoah(c, noahF({ x: 250, sit: true, seatH: 520, outfit: 'agent', expr: withBlink(Object.assign({}, EX.mask, { look }), t, 4, 5), arms: { l: { a: .35, b: -1.2 }, r: { a: .45, b: -1.5 } } }));
      c.beginPath(); c.ellipse(250, -330, 320, 40, 0, 0, Math.PI * 2); fs(c, '#6a4a34', 3); line(c, [250, -300, 250, 0], 20, '#3a2418'); c.beginPath(); c.rect(290, -400, 60, 66); fs(c, '#f0ece4', 3); FX.steam(c, 320, -410, t, { h: 90, n: 2, a: .5 }); }],
    screen: [c => G.warm(c, t)] };
}
CUE('cup', 106.4); CUE('cup', 113.8);
const MAP = { t0: 116.0, t1: 123.6, corner: 'tr', w: 470, h: 360, title: 'UMWEGE', stamp: false };
dosCardCues(MAP, 1); [117.0, 119.4, 121.6].forEach(a => CUE('typeRow', a, { dur: .25 }));
function mapDraw(c, lt, w, h) {
  c.strokeStyle = 'rgba(236,227,204,.15)'; c.lineWidth = 2; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(i * 70, 30); c.lineTo(i * 70, h - 10); c.stroke(); c.beginPath(); c.moveTo(0, 30 + i * 45); c.lineTo(w - 56, 30 + i * 45); c.stroke(); }
  const P = [[20, h - 30], [120, h - 60], [150, 120], [260, 160], [300, 70], [400, 110], [380, 240], [300, h - 40]], k = clamp((lt - .5) / 6.5, 0, 1) * (P.length - 1);
  c.strokeStyle = DOS.red; c.lineWidth = 6; c.lineCap = 'round'; c.setLineDash([14, 10]); c.beginPath(); c.moveTo(...P[0]); for (let i = 1; i <= Math.floor(k); i++) c.lineTo(...P[i]); const f = k - Math.floor(k), i0 = Math.floor(k); if (i0 < P.length - 1) c.lineTo(lerp(P[i0][0], P[i0 + 1][0], f), lerp(P[i0][1], P[i0 + 1][1], f)); c.stroke(); c.setLineDash([]);
  [[150, 120, 1, 1.0], [300, 70, 2, 3.4], [380, 240, 3, 5.6]].forEach(([x, y, n, at]) => { if (lt < at) return; circle(c, x, y, 20); fs(c, DOS.cream, 3, DOS.edge); hudText(c, String(n), x, y + 8, 22, DOS.paper, 'center'); });
  if (lt > 1.0) dosType(c, 'Umweg 1 · 2 · 3', 10, h - 4, 26, (lt - 1.0) / 2.5, { col: DOS.muted });
}
function shoeShop(c, cam, t) { return room(c, cam, t, { wall: '#c8b8a0', floor: '#8a7a6a', floorType: 'tile', light: 'warm', wallpaper: false, lampsCeil: [-400, 700], back: (c, b) => { sign(c, 0, b - 1250, 'Schuhe', { size: 56, bg: '#2a2a34' }); for (let r = 0; r < 4; r++) { line(c, [-1200, b - 1000 + r * 200, 1200, b - 1000 + r * 200], 10, '#6a5040'); for (let i = 0; i < 12; i++) { const x = -1150 + i * 200; c.beginPath(); c.moveTo(x, b - 1000 + r * 200 - 6); c.quadraticCurveTo(x + 10, b - 1060 + r * 200, x + 60, b - 1050 + r * 200); c.quadraticCurveTo(x + 120, b - 1040 + r * 200, x + 130, b - 1006 + r * 200); c.closePath(); fs(c, ['#3a2a20', '#7a4a2a', '#1a1a1e', '#8a2a2a'][(i + r) % 4], 2); } } } }); }
function shotShoes(lt, T, t) { return { set: shoeShop, cam: drift(camAt(S(-200, -520, .95), S(-120, -540, 1.1), lt / T), t, 2), vignette: .3, fx: [c => { drawNoahSide(c, { x: -500, k: NK, ink: 1.8, outfit: 'agent', coat: true, walk: null, expr: withBlink(Object.assign({}, EX.mask, { look: .3 }), t, 4, 6), tilt: -.05 }); }], screen: [c => G.warm(c, t), c => dosCard(c, t, Object.assign({ draw: mapDraw }, MAP))] }; }
CUE('amb', 115.42, { name: 'store', until: 120.56 }); CUE('amb', 120.56, { name: 'tram', until: 125.5 }); CUE('tramBell', 121.0); CUE('tramBell', 124.6);
function shotTram(lt, T, t) { const sw = Math.sin(t * 2) * .03; return { set: tramInside, cam: drift(S(0, -560, .95), t, 6), vignette: .3, fx: [c => { line(c, [40, -1450, 40, 0], 14, '#b8b8bc'); drawNoah(c, noahF({ x: -20, outfit: 'agent', coat: true, lean: sw, expr: withBlink(Object.assign({}, EX.alert, { look: Math.sin(t) * .6 }), t, 4, 8), arms: { l: { a: .1, b: -.05 }, r: { a: 1.4, b: -.9 } } })); }], screen: [c => G.rain(c, t), c => dosCard(c, t, Object.assign({ draw: mapDraw }, MAP))] }; }
CUE('amb', 125.5, { name: 'streetRain', until: 180.68 });
function shotStepOff(lt, T, t) { const x = walkX(t, 125.5, -200, 90); const look = t > 127.0 && t < 129.6; return { set: rainStreet, setOpts: { lamps: [-700, 260, 1300], seed: 7 }, cam: drift(S(x + 100, -330, 1.4), t, 3), vignette: .25, fx: [c => { drawNoahSide(c, NOAH_AGENT({ x, s: look ? -1 : 1, walk: look ? null : t * 8, expr: withBlink(EX.alert, t, 5, 3) })); rainSplashes(c, t, { x0: x - 900, x1: x + 900, n: 60 }); }], screen: [c => rainSheet(c, t, { amount: 1.0, alpha: .38 }), c => G.rain(c, t)] }; }
// the man across the street
function shotManAcross(lt, T, t) {
  const v = camAt(S(-200, -330, .85), S(460, -380, 1.6), seg(t, 131.6, 133.3));
  return { set: rainStreet, setOpts: { lamps: [-700, 260, 1300], seed: 11 }, cam: drift(v, t, 4), vignette: .3,
    fx: [c => { c.save(); c.translate(0, 0); drawPal(c, fol({ x: 520, s: -1, arms: { l: { a: .1, b: -.05 }, r: { a: .5, b: -2.6 } }, expr: { mouth: Math.sin(t * 6) > .5 ? 'o' : 'flat' } })); c.restore(); c.beginPath(); rrect(c, 548, -350, 14, 28, 3); fs(c, '#111', 2); bloom(c, 555, -336, 30, '120,160,255', .4); rainSplashes(c, t, { x0: -400, x1: 1400, n: 70 }); }],
    screen: [c => rainSheet(c, t, { amount: 1.2, alpha: .4 }), c => G.rain(c, t), c => { // telephoto: dark frame edges like a long lens
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }] };
}
function shotNoahNotices(lt, T, t) {
  const e = t < 143.0 ? Object.assign({}, EX.fear, { look: .7 }) : t < 144.2 ? { lid: .1, mouth: 'flat', look: .4 } : withBlink(Object.assign({}, EX.mask), t, 6, 2);
  return { set: rainStreet, setOpts: { lamps: [-700, 260, 1300], seed: 7 }, cam: drift(camAt(S(0, -320, 2.3), S(0, -330, 2.6), lt / T), t, 1), vignette: .35, fx: [c => drawNoah(c, NOAH_AGENT({ x: 0, expr: e }))], screen: [c => rainSheet(c, t, { amount: .9, alpha: .35 }), c => G.rain(c, t)] };
}
CUE('crack', 142.0, { gain: .6 });
const BEATS3 = beatsBetween(146.1, 166.4, 80, 120); BEATS3.forEach(b => CUE('heart', b, { gain: .8 }));
function shotCalmWalk(lt, T, t) {
  const p = pulseAt(BEATS3, t);
  return rainWalk(146.12, -600, { z: 2.0, lead: 40, blink: 7, screen: [(c, tt) => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(160,20,30,${p * .07})`; c.fillRect(0, 0, W, H); c.restore(); }] })(lt, T, t);
}
for (let tt = 146.3; tt < 161.0; tt += .5) CUE('step', tt, { surf: 'wet' });
function shotTurn(lt, T, t) { return rainWalk(154.08, 600, { seed: 13, z: 1.2, extra: (c, tt, x) => { if (tt > 155) silhouette(c, follower2(walkX(tt, 155, -500, 150)), 'rgba(12,14,22,.9)'); } })(lt, T, t); }
function follower2(x) { return cc => drawPal(cc, fol({ x, side: true, s: 1, walk: x * .05 })); }
function shotReflection(lt, T, t) {
  return { set: (c, cam, tt) => { const r = rainStreet(c, cam, tt, { seed: 15 }); return r; }, cam: drift(camAt(S(0, -360, 1.7), S(0, -380, 2.0), lt / T), t, 2), vignette: .35,
    fx: [c => {
      // the shop window: dark glass with a few goods; Noah's reflection + the man far behind (mirrored)
      c.save(); c.beginPath(); c.rect(-600, -760, 1200, 700); c.fillStyle = '#121620'; c.fill(); c.clip();
      for (let i = 0; i < 5; i++) { c.beginPath(); c.rect(-520 + i * 220, -260, 160, 200); fs(c, ['#5a3a2a', '#2a3a4a', '#3a3a3a'][i % 3], 2); }
      c.globalAlpha = .42; drawNoah(c, NOAH_AGENT({ x: -120, k: .32, expr: EX.mask })); c.globalAlpha = .38 * clamp((t - 162.8) / .6, 0, 1); silhouette(c, cc => drawPal(cc, fol({ x: 330, y: -150, k: .16, s: -1 })), '#c8ccd8'); c.restore();
      c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.moveTo(-300, -760); c.lineTo(-100, -760); c.lineTo(-400, -60); c.lineTo(-600, -60); c.fill();
      c.beginPath(); c.rect(-620, -780, 1240, 740); c.lineWidth = 24; c.strokeStyle = '#2a2a30'; c.stroke(); bloom(c, 330, -220, 140, '255,80,80', .3 * bump(t, 163.6, 165.8));
    }],
    screen: [c => rainSheet(c, t, { amount: .8, alpha: .32 }), c => G.rain(c, t)] };
}
const DEC = { t0: 168.8, t1: 179.2, corner: 'tr', w: 560, h: 230, title: 'ENTSCHEIDUNG', stamp: false }; dosCardCues(DEC, 2);
function decDraw(c, lt, w, h) { const a = clamp((lt - .6) / .3, 0, 1), b = clamp((lt - 4.6) / .3, 0, 1), blink = lt > 6 ? (Math.floor(lt * 3) % 2 ? .35 : 1) : 1; if (a > 0) { c.globalAlpha = a; c.strokeStyle = DOS.cream; c.lineWidth = 3; c.strokeRect(10, 115, 230, 80); dosType(c, 'ABBRECHEN?', 125, 167, 30, 1, { align: 'center', caret: false }); } if (b > 0) { c.globalAlpha = b * blink; c.fillStyle = DOS.red; c.fillRect(260, 115, 240, 80); dosType(c, 'WEITERGEHEN?', 380, 167, 28, 1, { align: 'center', caret: false, col: '#fff' }); } c.globalAlpha = 1; }
function shotDecision(lt, T, t) { return { set: rainStreet, setOpts: { lamps: [-700, 260, 1300], seed: 17 }, cam: drift(camAt(S(260, -330, 1.35), S(260, -350, 1.7), lt / T), t, 2), vignette: .35, fx: [c => { drawNoah(c, NOAH_AGENT({ x: 300, expr: withBlink(Object.assign({}, EX.mask, { look: Math.sin(t * .7) * .6 }), t, 6, 4) })); rainSplashes(c, t, { x0: -500, x1: 1200, n: 60 }); }], screen: [c => rainSheet(c, t, { amount: 1.1, alpha: .38 }), c => G.rain(c, t), c => dosCard(c, t, Object.assign({ draw: decDraw }, DEC))] }; }
// ======================= 09 THE DEPARTMENT STORE =======================
CUE('amb', 180.68, { name: 'store', until: 191.64 }); CUE('door', 180.9); CUE('escalator', 185.4);
const kh = (cam, draw) => (lt, T, t) => ({ set: kaufhaus, cam: drift(typeof cam === 'function' ? cam(lt, T, t) : cam, t, 3), vignette: .3, fx: [c => draw(c, t)], screen: [c => G.day(c, t)] });
const kaufWalk = (x0, sp, o = {}) => (c, t) => { const x = walkX(t, o.t0, x0, sp); drawNoahSide(c, { x, y: o.y ? o.y(x) : 0, k: NK, ink: 1.8, outfit: 'agent', coat: true, s: sp < 0 ? -1 : 1, walk: t * 9, expr: EX.alert }); };
for (let tt = 181.0; tt < 191.5; tt += .42) CUE('step', tt, { surf: 'marble', gain: .7 });
// ======================= 10 THE PARK =======================
CUE('amb', 191.64, { name: 'streetRain', until: 201.08 }); CUE('breathOut', 197.1);
function shotAlley(lt, T, t) { const look = t < 194.4 ? Math.sin(t * 2.2) : 0; return { set: alley, cam: drift(camAt(S(0, -360, 1.2), S(0, -380, 1.45), lt / T), t, 2), vignette: .35, fx: [c => { drawNoah(c, NOAH_AGENT({ x: 0, k: .33, expr: t < 196.9 ? withBlink(Object.assign({}, EX.alert, { look }), t, 6, 2) : { eyes: t < 199 ? 'closed' : 'open', lid: .35, mouth: 'soft' }, bob: t > 197 && t < 199 ? Math.sin((t - 197) * 1.6) * 10 : 0 })); }], screen: [c => rainSheet(c, t, { amount: .8, alpha: .3 }), c => G.rain(c, t)] }; }
CUE('door', 191.7); CUE('amb', 201.08, { name: 'park', until: 249.66 });
const breadThrow = (t, at) => t > at;
function informant(t, o = {}) { return Object.assign({ look: 'informant', x: 110, k: .245, ink: 1.8, outfit: 'old', sit: true, seatH: 330, expr: withBlink({ mouth: 'soft', look: -.2 }, t, 4.5, 9), arms: { l: { a: .25, b: -1.3 }, r: { a: .7, b: -1.2 } } }, o); }
function breadBag(c, x, y) { c.beginPath(); c.moveTo(x - 30, y); c.lineTo(x + 30, y); c.lineTo(x + 26, y - 60); c.lineTo(x - 26, y - 60); c.closePath(); fs(c, '#d8c8a0', 2.5); }
function parkShot(cam, draw, o = {}) { return (lt, T, t) => ({ set: park, setOpts: { mood: o.mood || 'fog' }, cam: drift(typeof cam === 'function' ? cam(lt, T, t) : cam, t, 2), vignette: .3, fx: [c => draw(c, t)], screen: [c => G[o.mood === 'autumn' ? 'gold' : 'fog'](c, t), ...(o.screen || [])] }); }
const pigeonsPark = (c, t, fly) => pigeonFlock(c, -300, 500, t, 8, { fly });
function shotParkWide(lt, T, t) { return parkShot(camAt(S(-100, -420, .75), S(0, -330, .95), lt / T), (c, t) => { drawPal(c, informant(t)); breadBag(c, 40, -110); pigeonsPark(c, t); })(lt, T, t); }
function shotParkSit(lt, T, t) {
  const x = t < 212.4 ? walkX(t, 211.28, -500, 150) : -330, sit = t >= 212.4;
  return parkShot(camAt(S(-80, -260, 1.3), S(-100, -270, 1.45), lt / T), (c, t) => { drawPal(c, informant(t)); breadBag(c, 40, -110); if (sit) drawNoah(c, NOAH_AGENT({ x: -110, hat: false, sit: true, seatH: 330, expr: withBlink(Object.assign({}, EX.mask, { look: t > 215 && t < 217 ? .8 : 0 }), t, 4.5, 3) })); else drawNoahSide(c, NOAH_AGENT({ x, hat: false, walk: t * 8 })); pigeonsPark(c, t); })(lt, T, t);
}
function shotParkTalk(lt, T, t) {
  const herTalk = t < 222.4 && t > 215.3, his = t > 222.8 && t < 226.0;
  return parkShot(camAt(S(0, -300, 1.9), S(0, -310, 2.1), lt / T), (c, t) => { drawPal(c, informant(t, { expr: { mouth: herTalk && Math.sin(t * 10) > 0 ? 'o' : 'soft', look: herTalk ? 0 : -.6, open: .2 } })); drawNoah(c, NOAH_AGENT({ x: -110, hat: false, sit: true, seatH: 330, expr: { mouth: his && Math.sin(t * 9) > 0 ? 'o' : 'flat', open: .2, look: his ? .1 : .5 } })); })(lt, T, t);
}
function shotHands(lt, T, t) { const tr = Math.sin(t * 40) * 2.5; return parkShot(S(110, -110, 5.0), (c, t) => { drawPal(c, informant(t, { arms: { l: { a: .45 + tr * .01, b: -1.5 }, r: { a: .45 - tr * .01, b: -1.5 } } })); })(lt, T, t); }
function shotSymbols(lt, T, t) {
  return parkShot(camAt(S(-200, -420, 1.25), S(-150, -480, 1.35), lt / T), (c, t) => { drawPal(c, informant(t, { expr: { mouth: Math.sin(t * 9) > .2 ? 'o' : 'soft', open: .15, look: -.3 } })); drawNoah(c, NOAH_AGENT({ x: -110, hat: false, sit: true, seatH: 330, expr: withBlink(Object.assign({}, EX.alert, { look: .3 }), t, 5, 3) }));
    // floating symbols (no text): map, clock, door
    [[233.3, -260, -720, 'map'], [234.1, -60, -800, 'clock'], [234.8, 160, -720, 'door']].forEach(([at, x, y, k]) => { const a = clamp((t - at) / .6, 0, 1); if (a <= 0) return; c.save(); c.globalAlpha = a * .85; c.translate(x, y + Math.sin(t + x) * 10); c.strokeStyle = '#e8ecf4'; c.fillStyle = 'rgba(232,236,244,.15)'; c.lineWidth = 5;
      if (k === 'map') { c.beginPath(); c.moveTo(-60, -40); c.lineTo(-20, -50); c.lineTo(20, -40); c.lineTo(60, -50); c.lineTo(60, 40); c.lineTo(20, 50); c.lineTo(-20, 40); c.lineTo(-60, 50); c.closePath(); c.fill(); c.stroke(); line(c, [-20, -50, -20, 40], 3, '#e8ecf4'); line(c, [20, -40, 20, 50], 3, '#e8ecf4'); circle(c, 30, 0, 9); c.fillStyle = '#c8352c'; c.fill(); }
      if (k === 'clock') { circle(c, 0, 0, 48); c.fill(); c.stroke(); line(c, [0, 0, 0, -32], 5, '#e8ecf4'); line(c, [0, 0, 22, 10], 5, '#e8ecf4'); }
      if (k === 'door') { c.beginPath(); c.rect(-34, -56, 68, 112); c.fill(); c.stroke(); circle(c, 20, 0, 5); c.fillStyle = '#e8ecf4'; c.fill(); }
      bloom(c, 0, 0, 100, '200,215,255', .3); c.restore(); }); }, { })(lt, T, t);
}
[233.3, 234.1, 234.8].forEach(a => CUE('ding', a, { gain: .6 }));
function shotLeaves(lt, T, t) {
  const up = t > 238.9, x = t < 240.6 ? 110 : walkX(t, 240.6, 110, 150), threw = t > 241.2;
  return parkShot(camAt(S(0, -300, 1.15), S(150, -300, 1.05), lt / T), (c, t) => {
    if (!up) drawPal(c, informant(t)); else drawPal(c, { look: 'informant', side: t > 240.6, x, k: .245, ink: 1.8, outfit: 'old', s: 1, walk: t > 240.6 ? t * 7 : null, expr: { mouth: 'soft' }, arms: threw && t < 241.8 ? { l: { a: .2, b: -.1 }, r: { a: 1.6, b: -.2 } } : undefined });
    drawNoah(c, NOAH_AGENT({ x: -110, hat: false, sit: true, seatH: 330, expr: withBlink(Object.assign({}, EX.tired, { look: .6 }), t, 4.5, 3) }));
    pigeonFlock(c, -300, 500, t, 8, { fly: 241.5 }); if (threw) for (let i = 0; i < 6; i++) { const k = clamp((t - 241.2) / .6, 0, 1); circle(c, 200 + i * 30 * k, -150 + k * 150 - Math.sin(k * Math.PI) * 80, 6); c.fillStyle = '#d8b880'; c.fill(); }
  })(lt, T, t);
}
CUE('wings', 241.5); CUE('wings', 241.9);
const WIEDER = { t0: 244.2, t1: 249.4, corner: 'tr', w: 560, h: 190, title: 'Wiedersehen', lines: [{ s: 'unwahrscheinlich', y: 160, size: 42, at: .7, col: '#ff8a80' }] }; dosCardCues(WIEDER, 1);
function shotAlone(lt, T, t) { return parkShot(camAt(S(-110, -300, 1.6), S(-110, -320, 1.4), lt / T), (c, t) => drawNoah(c, NOAH_AGENT({ x: -110, hat: false, sit: true, seatH: 330, expr: withBlink(EX.tired, t, 4, 3) })), { screen: [(c, tt) => dosCard(c, tt, WIEDER)] })(lt, T, t); }
let curT = 0;
// ======================= 11 HOTEL =======================
CUE('amb', 249.66, { name: 'hotel', until: 282.46 }); CUE('siren', 251.0);
function hotel(c, cam, t) { const r = room(c, cam, t, { wall: '#3a3448', floor: '#2a2028', floorType: 'carpet', light: 'night', curtain: '#3a2a3a', windows: [{ x: 300, w: 520, h: 600, view: 'rain' }], back: (c, b) => { const fl = rnd(Math.floor(t * 9)) > .9 ? .3 : 1; bloom(c, 560, b - 700, 700, '255,60,90', .35 * fl); c.beginPath(); c.rect(-1300, b - 1100, 220, 260); fs(c, '#4a3a2a', 4); c.fillStyle = '#6a7a6a'; c.fillRect(-1286, b - 1086, 192, 232); }, floorFn: c => { hotelBed(c, -700); c.beginPath(); c.rect(950, -330, 500, 24); fs(c, '#4a3020', 3); line(c, [990, -306, 990, 0], 12, '#3a2418'); line(c, [1410, -306, 1410, 0], 12, '#3a2418'); deskLamp(c, 1360, -330, true); } }); return r; }
function shotHotelWide(lt, T, t) { return { set: hotel, cam: drift(camAt(S(100, -520, .7), S(200, -500, .78), lt / T), t, 2), vignette: .35, fx: [c => { drawNoah(c, noahF({ x: 1150, sit: true, seatH: 520, outfit: 'agent', expr: withBlink(EX.tired, t, 4, 4), arms: { l: { a: .5, b: -1.6 }, r: { a: .5, b: -1.6 } } })); laptop(c, 1150, -330, { w: 240, screen: '#1a2a4a' }); }], screen: [c => G.night(c, t)] }; }
function shotLaptop(lt, T, t) {
  const sent = t > 258.4;
  return { set: (c, cam, tt) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0c0c12'; c.fillRect(0, 0, W, H); return { base: '#0c0c12' }; }, cam: S(0, 0, 1 + lt * .01), vignette: .5,
    fx: [c => { laptop(c, 0, 420, { w: 1300, screen: '#e6eaf0', draw: (c, w, h) => {
      c.fillStyle = '#1a2234'; c.fillRect(0, 0, w, 70); hudText(c, 'BERICHT · VERTRAULICH', 30, 48, 36, '#ece3cc');
      const n = clamp((t - 256.1) / 2.2, 0, 1); for (let i = 0; i < 9; i++) { const k = clamp(n * 9 - i, 0, 1); if (k <= 0) break; c.fillStyle = '#4a5060'; c.fillRect(40, 120 + i * 50, (w - 200) * (.6 + rnd(i) * .4) * k, 12); }
      c.fillStyle = sent ? '#2f7a4a' : '#2f5fa0'; rrect(c, w - 330, h - 110, 290, 80, 12); c.fill(); hudText(c, sent ? 'GESENDET ✓' : 'SENDEN', w - 185, h - 55, 34, '#fff', 'center');
    } }); }],
    screen: [c => noirGrade(c, t, { vig: .6, mult: 'rgba(170,180,215,.3)' })] };
}
CUE('keys', 256.1); CUE('keys', 257.4); CUE('tick', 258.4);
function shotPhoneWife(lt, T, t) {
  const off = t > 269.6;
  return { set: hotel, cam: S(1150, -420, 2.6), vignette: .5,
    fx: [c => { c.save(); c.translate(1150, -380); c.rotate(-.05); phoneUI(c, -90, -180, 180, 360, { mode: 'lock', big: '22:14', date: '', glow: off ? 0 : 1 }); if (!off) { c.save(); rrect(c, -90, -180, 180, 360, 20); c.clip(); c.fillStyle = '#c8b8a0'; c.fillRect(-90, -100, 180, 230); drawPalHead(c, 0, 10, .22, 'wife', { mouth: 'smile', lid: .2 }); c.restore(); } else { rrect(c, -90, -180, 180, 360, 20); c.fillStyle = '#050608'; c.fill(); } c.restore(); drawNoahHand(c, 1180, -200, .5, Math.PI * .95); }],
    screen: [c => G.night(c, t)] };
}
CUE('tick', 269.6);
function shotHotelSit(lt, T, t) { return { set: hotel, cam: drift(camAt(S(-600, -480, 1.2), S(-600, -500, 1.35), lt / T), t, 2), vignette: .4, fx: [c => drawNoah(c, noahF({ x: -600, sit: true, seatH: 330, outfit: 'agent', expr: withBlink(EX.tired, t, 5, 4), arms: { l: { a: .4, b: -1.4 }, r: { a: .4, b: -1.4 } }, tilt: .05 }))], screen: [c => G.night(c, t)] }; }
// ======================= 12 THE PRICE =======================
function shotWindowSil(lt, T, t) { return { set: hotel, cam: drift(camAt(S(560, -600, 1.0), S(560, -640, 1.2), lt / T), t, 2), vignette: .4, fx: [c => silhouette(c, cc => drawNoah(cc, noahF({ x: 560, outfit: 'agent' })), '#07080c', { col: 'rgba(255,90,110,.8)', off: [[4, -2]] })], screen: [c => G.night(c, t)] }; }
CUE('amb', 282.46, { name: 'party', until: 291.62 });
const famDinner = t => c => dinTable(c, 100, { w: 1900, top: -300, items: [(c, top) => { plateFood(c, -620, top); plateFood(c, -220, top); plateFood(c, 200, top); plateFood(c, 560, top); plateFood(c, 820, top); glassW(c, -420, top); glassW(c, 380, top); }] });
function famRoom2(c, cam, t) { return room(c, cam, t, { wall: '#7a5a42', floor: '#5a3a28', light: 'warm', curtain: '#8a3a3a', windows: [{ x: -1600, w: 480, h: 560, view: 'city' }], pictures: [[900, 1150, 'family'], [1150, 1100]], shelf: 1500, rug: '#7a3a3a', lampsCeil: [100] }); }
const FAM2 = (t, ne) => c => { for (const [who, x, k, out] of [['mother', -620, .48, 'old'], ['wife', -220, .47, 'home'], ['noah', 200, .5, 'home'], ['son', 560, .36, 'home'], ['daughter', 820, .33, 'home']]) { chairBack(c, x, { col: '#4a2a1a' }); const bob = who !== 'noah' ? -Math.abs(Math.sin(t * 9 + x)) * 8 : 0; if (who === 'noah') drawNoah(c, { x, k, ink: 1.8, sit: true, seatH: 560, outfit: out, expr: ne }); else drawPal(c, { look: who, x, k, ink: 1.8, sit: true, seatH: 560, outfit: out, expr: withBlink({ mouth: Math.sin(t * 4 + x) > 0 ? 'o' : 'smile', open: .5, lid: .3 }, t, 3.5, x), bob }); } };
function shotDinner(lt, T, t) { const close = t > 287.0; return { set: famRoom2, cam: drift(close ? camAt(S(200, -700, 1.9), S(200, -710, 2.1), (t - 287) / 4.6) : camAt(S(80, -470, .75), S(80, -480, .82), lt / 4.5), t, 2), vignette: .3, fx: [FAM2(t, { mouth: 'flat', lid: .3, look: -.1 }), famDinner(t)], screen: [c => G.warm(c, t)] }; }
CUE('amb', 291.62, { name: 'homeDay', until: 301.86 }); CUE('door', 291.8); CUE('lock', 292.4);
function shotHomeDoor(lt, T, t) { const x = t < 293.6 ? walkX(t, 291.62, -900, 220) : walkX(293.6, 291.62, -900, 220); return { set: room, setOpts: { wall: '#5a4a3e', floor: '#3a2a20', light: 'warm', doors: [-1100], pictures: [[300, 1100, 'family']], lampsCeil: [100] }, cam: drift(camAt(S(-400, -480, .95), S(x + 60, -640, 1.9), seg(t, 294.0, 296.6)), t, 2), vignette: .35, fx: [c => { if (t < 293.6) drawNoahSide(c, { x, k: NK, ink: 1.8, outfit: 'agent', coat: true, walk: t * 7, expr: EX.tired }); else drawNoah(c, noahF({ x, outfit: 'agent', coat: true, expr: withBlink({ lid: .45, mouth: t > 298.8 && t < 299.8 ? 'o' : 'flat', open: .1, look: -.3 }, t, 4, 1), bob: t > 299 && t < 299.6 ? 6 : 0, tilt: .04 })); }], screen: [c => G.warm(c, t)] }; }
CUE('amb', 301.86, { name: 'restaurant', until: 311.5 });
function restaurant(c, cam, t) { return room(c, cam, t, { wall: '#4a2a2a', floor: '#2a1a14', light: 'warm', wainscot: true, doors: [1400], lampsCeil: [-900, 300], pictures: [[-300, 1100], [-60, 1050]], floorFn: c => { for (const x of [-1200, 600]) { c.beginPath(); c.ellipse(x, -330, 300, 36, 0, 0, Math.PI * 2); fs(c, '#e8e0d0', 3); line(c, [x, -300, x, 0], 18, '#2a1a12'); } } }); }
function shotRestaurant(lt, T, t) {
  const pov = t > 305.6, door = seg(t, 306.6, 307.2) - seg(t, 309.4, 310);
  if (!pov) return { set: restaurant, cam: drift(camAt(S(-600, -480, 1.05), S(-700, -520, 1.25), lt / 3.7), t, 2), vignette: .35, fx: [c => { drawNoah(c, noahF({ x: -1200, sit: true, seatH: 520, outfit: 'home', expr: withBlink(Object.assign({}, EX.alert, { look: .9 }), t, 6, 2) })); drawPal(c, { look: 'wife', x: -880, k: .47, ink: 1.8, sit: true, seatH: 520, outfit: 'home', expr: withBlink({ mouth: Math.sin(t * 8) > 0 ? 'o' : 'smile', open: .3, look: -.7 }, t, 3.5, 7) }); }], screen: [c => G.warm(c, t)] };
  return { set: restaurant, cam: drift(camAt(S(900, -520, 1.5), S(1350, -520, 1.6), (t - 305.6) / 4), t, 4), vignette: .4, fx: [c => { if (door > 0) silhouette(c, cc => drawPal(cc, { look: 'colleague', side: true, x: 1400 - 300 * door, k: .48, s: -1, walk: t * 7, outfit: 'agent', coat: true }), 'rgba(30,20,20,.85)'); }], screen: [c => G.warm(c, t), c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2 - 40, H / 2); c.lineTo(W / 2 + 40, H / 2); c.moveTo(W / 2, H / 2 - 40); c.lineTo(W / 2, H / 2 + 40); c.stroke(); c.restore(); }] };
}
CUE('door', 306.7);
CUE('amb', 311.5, { name: 'cityDay', until: 321.2 });
function shotTrafficLight(lt, T, t) { return { set: city, setOpts: { tod: 'day', seed: 8 }, cam: drift(S(60, -330, 1.5), t, 2), vignette: .3, fx: [c => { trafficLight(c, 420, 'red'); drawNoah(c, NOAH_AGENT({ x: 0, coat: false, hat: false, outfit: 'home', expr: withBlink(Object.assign({}, EX.alert, { look: t < 313 ? -.8 : .8 }), t, 6, 2) })); drawPal(c, { look: 'informant', x: -170, k: .24, ink: 1.8, outfit: 'old', expr: { mouth: 'soft' } }); drawPal(c, { look: 'recruiter', x: 180, k: .25, ink: 1.8, outfit: 'agent', expr: { mouth: 'flat' } }); }], screen: [c => cityLight(c, S(60, -330, 1.5), t, { tod: 'day' }), c => G.day(c, t)] }; }
function shotNewNeighbor(lt, T, t) { const nx = walkX(t, 314.72, -900, 120); return { set: houseFront, setOpts: { noahAtWindow: true, noahExpr: withBlink(Object.assign({}, EX.alert, { look: -.7 }), t, 6, 4) }, cam: drift(camAt(S(-100, -760, .85), S(150, -900, 1.2), seg(t, 317.0, 320.0)), t, 3), vignette: .3, fx: [c => { for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(-1100 + i * 130, -230 - (i % 2) * 120, 120, 110); fs(c, '#b8925a', 3); } drawPal(c, { look: 'colleague', side: true, x: nx, y: -230, k: .46, ink: 1.8, outfit: 'home', walk: t * 7, expr: { mouth: 'soft' }, arms: { l: { a: 1.2, b: -1.4 }, r: { a: 1.2, b: -1.4 } } }); c.beginPath(); c.rect(nx + 40, -560, 160, 130); fs(c, '#b8925a', 3); }], screen: [c => G.day(c, t)] }; }
CUE('amb', 321.2, { name: 'beach', until: 325.02 });
function shotBeach(lt, T, t) { return { set: beach, cam: drift(S(-100, -330, 1.0), t, 2), vignette: .25, fx: [c => { c.beginPath(); c.rect(-650, -60, 600, 50); fs(c, '#e8584a', 2); drawPal(c, { look: 'wife', x: -350, k: .4, ink: 1.8, sit: true, seatH: 160, outfit: 'home', expr: { eyes: 'closed', mouth: 'smile' } }); drawNoah(c, { x: 60, k: .42, ink: 1.8, sit: true, seatH: 160, expr: withBlink(Object.assign({}, EX.alert, { look: Math.sin(t * 1.4) }), t, 6, 2) }); for (let i = 0; i < 3; i++) drawPal(c, { look: ['son', 'daughter', 'neighbor'][i], side: true, x: 700 + i * 300 - (t - 321) * 60, k: .3, ink: 1.8, outfit: 'home', walk: t * 7 + i, s: -1, expr: { mouth: 'smile' } }); }], screen: [c => G.day(c, t)] }; }
CUE('kidLaugh', 322.0); CUE('amb', 325.02, { name: 'bedroomRain', until: 326.92 });
function shotBedAwake(lt, T, t) { return { set: bedroomSide, setOpts: { phoneGlow: 0, noah: EX.alert, clock: '04:12' }, cam: S(250, -520, 1.6), vignette: .35, screen: [c => G.night(c, t)] }; }
CUE('amb', 326.92, { name: 'interrog', until: 344.08 });
function interrog(c, cam, t) { return room(c, cam, t, { wall: '#2a2e34', floor: '#1c1e22', floorType: 'tile', light: 'cold', wallpaper: false, lampsCeil: [0], back: (c, b) => mirrorWall(c, -1700, -600, b), floorFn: c => interrogTable(c, 0) }); }
function shotInterrog(lt, T, t) { return { set: interrog, cam: drift(camAt(S(0, -560, .8), S(0, -600, 1.3), lt / T), t, 1), vignette: .5, behind: [c => { c.beginPath(); rrect(c, -110, -520, 220, 260, 20); fs(c, '#3a3e48', 3); }], fx: [c => drawNoah(c, noahF({ x: 0, sit: true, seatH: 520, outfit: 'agent', tilt: .08, expr: withBlink(Object.assign({}, EX.tired, { look: -.2 }), t, 5, 3), arms: { l: { a: .4, b: -1.3 }, r: { a: .4, b: -1.3 } } }))], screen: [c => G.cold(c, t)] }; }
function shotUnbekannt(lt, T, t) { return { set: deskTop, cam: drift(camAt(S(0, 0, .7), S(0, 0, .85), lt / T), t, 2), vignette: .4, fx: [c => { dossierFolder(c, 0, 0, 1300, 800, 0, {}); dosStamp(c, 'UNBEKANNT', 60, 120, 120, -.18, (t - 341.6) / .16); }], screen: [c => lampPool(c, S(0, 0, .8), 0, 0, 1800, .35), c => G.cold(c, t)] }; }
CUE('stamp', 341.6, { gain: 2 }); CUE('crack', 341.6, { gain: .6 });
// DER PREIS
const TB5 = { t0: 344.08, t1: 352.22, head: 345.3 };
const PREIS = [['Ehrlichkeit zu Hause', 'Ein Ziel, größer als du'], ['Ruhigen Schlaf', 'Nervenkitzel'], ['Vertrauen in Fremde', 'Kollegen, die dich kennen'], ['Anerkennung', 'Stolz, den keiner sieht']];
function preisPage(c, w, h, t) {
  pageHead(c, w, t, TB5.head, 'DER PREIS');
  const bal = Math.sin((t - 350.0) * 4) * Math.exp(-Math.max(0, t - 350.0) * 1.2) * .06 * (t > 350 ? 1 : 0), cx = w / 2;
  c.save(); c.translate(cx, 190); c.rotate(bal);
  line(c, [-700, 0, 700, 0], 8, DOS.cream); circle(c, 0, 0, 14); c.fillStyle = DOS.red; c.fill();
  [['DU GIBST', -380, 0], ['DU BEKOMMST', 380, 1]].forEach(([title, x, col]) => { c.save(); c.translate(x, 0); c.rotate(-bal); line(c, [0, 0, 0, 40], 4, DOS.cream); dosType(c, title, 0, 100, 44, (t - TB5.head - .3) / .4, { align: 'center', col: col ? '#bfe0c8' : '#ffc8c0' }); c.fillStyle = DOS.line; c.fillRect(-330, 122, 660, 2);
    PREIS.forEach((r, i) => { const at = 346.2 + i * .9 + col * .45; dosType(c, r[col], 0, 200 + i * 105, 40, (t - at) / .4, { align: 'center' }); }); c.restore(); });
  c.restore();
}
const tam5 = tamShot({ t0: TB5.t0, t1: TB5.t1, page: preisPage, cues: [[TB5.head, 'typeRun', .5], ...[0, 1, 2, 3].flatMap(i => [[346.2 + i * .9, 'typeRow', .3], [346.65 + i * .9, 'typeRow', .3]])] });
CUE('amb', 352.22, { name: 'hall', until: 370.72 });
function shotHall(lt, T, t) { const light = 1 - seg(t, 361.0, 364.5); return { set: ceremonyHall, setOpts: { light }, cam: drift(camAt(S(0, -520, .6), S(0, -560, .78), lt / T), t, 2), vignette: .4, fx: [c => { if (light > .05) { c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(0, -200, 0, 0, -200, 700); g.addColorStop(0, `rgba(255,230,180,${.35 * light})`); g.addColorStop(1, 'rgba(255,230,180,0)'); c.fillStyle = g; c.fillRect(-900, -1000, 1800, 1200); c.restore(); } }], screen: [c => G.cold(c, t)] }; }
CUE('lock', 364.2, { gain: 1.5 });
const APPL = { t0: 366.2, t1: 370.5, corner: 'tr', w: 420, h: 180, title: 'Applaus', lines: [{ s: '0', y: 150, size: 60, at: .6, col: '#ff8a80' }] }; dosCardCues(APPL, 1);
function shotDark(lt, T, t) { return { set: ceremonyHall, setOpts: { light: .08 }, cam: S(0, -400, .9), vignette: .6, fx: [c => { c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(0, -240, 0, 0, -240, 260); g.addColorStop(0, 'rgba(200,210,255,.18)'); g.addColorStop(1, 'rgba(200,210,255,0)'); c.fillStyle = g; c.fillRect(-400, -600, 800, 700); c.restore(); }], screen: [c => G.cold(c, t), c => dosCard(c, t, APPL)] }; }
CUE('amb', 370.72, { name: 'homeDay', until: 387.64 });
function livingNight(c, cam, t) { return room(c, cam, t, { wall: '#2a2a3a', floor: '#2a1e18', light: 'night', curtain: '#3a2a3a', windows: [{ x: -1700, w: 480, h: 560, view: 'city' }], pictures: [[700, 1100, 'family']], shelf: 1300, floorFn: c => sofa(c, 300, { col: '#4a3a4a' }) }); }
function shotTV(lt, T, t) {
  if (t < 377.5) return { set: (c, cam, tt) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0a0a0e'; c.fillRect(0, 0, W, H); return { base: '#0a0a0e' }; }, cam: S(0, -300, 1.0 + lt * .01), vignette: .5, fx: [c => tv(c, 0, 0, { w: 1500, news: 'Anschlag verhindert' })], screen: [c => noirGrade(c, t, { vig: .6 })] };
  return { set: livingNight, cam: drift(camAt(S(0, -480, .85), S(250, -560, 1.15), (t - 377.5) / 10), t, 2), vignette: .45, fx: [c => { drawNoah(c, noahF({ x: 300, sit: true, seatH: 300, outfit: 'home', expr: withBlink({ mouth: 'flat', lid: .35, look: -.8 }, t, 5, 6) })); tv(c, -900, -300, { w: 520, news: 'Anschlag verhindert' }); line(c, [-1200, -300, -600, -300], 0); c.beginPath(); c.rect(-1150, -300, 500, 300); fs(c, '#2a1e18', 3); bloom(c, 300, -650, 500, '110,150,255', .25); }], screen: [c => G.night(c, t)] };
}
// ======================= 13 WHY PEOPLE DO IT + HOME =======================
CUE('amb', 387.64, { name: 'office', until: 425.92 });
function shotOfficeNightWindow(lt, T, t) { return { set: greyOffice, setOpts: { night: true }, cam: drift(camAt(S(-1900, -520, .9), S(-1800, -560, 1.1), lt / T), t, 2), vignette: .45, fx: [c => drawNoahSide(c, { x: -1700, k: NK, ink: 1.8, s: -1, outfit: 'agent', walk: null, expr: withBlink(Object.assign({}, EX.mask, { look: .2 }), t, 5, 2) })], screen: [c => G.cold(c, t)] }; }
function shotThrill(lt, T, t) { const x = walkX(t, 402.46, -600, 420); return { set: rainStreet, setOpts: { seed: 19 }, cam: S(x + 200, -330, 1.4), vignette: .3, speed: 0, fx: [c => { silhouette(c, cc => drawNoahSide(cc, NOAH_AGENT({ x, walk: t * 15, armSwing: .9 })), '#0a0c14', { col: 'rgba(255,215,150,.9)', off: [[-3, -3]] }); rainSplashes(c, t, { x0: x - 800, x1: x + 800, n: 80 }); }], screen: [c => rainSheet(c, t, { amount: 1.4, alpha: .45 }), c => G.rain(c, t)] }; }
for (let tt = 402.5; tt < 405.5; tt += .26) CUE('step', tt, { surf: 'wet' });
function shotColleagues(lt, T, t) {
  const nod = bump(t, 414.0, 415.4), x1 = Math.min(-150, walkX(t, 408.0, -1100, 160)), x2 = Math.max(250, walkX(t, 408.0, 1300, -160));
  return { set: greyOffice, setOpts: { night: true }, cam: drift(camAt(S(0, -480, .85), S(50, -560, 1.25), seg(t, 412, 416)), t, 2), vignette: .45,
    fx: [c => { drawNoahSide(c, { x: x1, k: NK, ink: 1.8, outfit: 'agent', walk: x1 < -150 ? t * 7 : null, tilt: nod * .18, expr: withBlink({ mouth: 'soft', lid: .3 }, t, 4.5, 3) }); drawPal(c, { look: 'agentF', side: true, x: x2, k: .48, ink: 1.8, s: -1, outfit: 'agent', walk: x2 > 250 ? t * 7 : null, tilt: nod * .18, expr: withBlink({ mouth: 'soft' }, t, 4, 5) }); }],
    screen: [c => G.cold(c, t)] };
}
CUE('amb', 425.92, { name: 'homeDay', until: 453.32 }); CUE('door', 426.1); CUE('kidLaugh', 429.4); CUE('kidLaugh', 430.4);
function homeWarm(c, cam, t) { return room(c, cam, t, { wall: '#8a6a4a', floor: '#6a4a30', light: 'warm', curtain: '#9a5a3a', doors: [-1300], windows: [{ x: 400, w: 480, h: 560, view: 'dusk' }], pictures: [[-500, 1100, 'family']], rug: '#8a4a3a', floorFn: c => sofa(c, 1300, { col: '#8a5a3a' }), lampsCeil: [0] }); }
function shotKidsRun(lt, T, t) {
  const kx = lerp(800, -900, ease(seg(t, 428.8, 431.0)));
  return { set: homeWarm, cam: drift(camAt(S(-700, -470, .85), S(-800, -480, .95), lt / T), t, 3), vignette: .3,
    fx: [c => { drawNoahSide(c, { x: -1150, k: NK, ink: 1.8, outfit: 'agent', coat: true, walk: null, expr: withBlink(EX.warm, t, 3.5, 2), armSwing: 0 }); drawPal(c, { look: 'son', side: true, x: kx, k: .36, ink: 1.8, s: -1, outfit: 'home', walk: t * 12, expr: { mouth: 'smile' } }); drawPal(c, { look: 'daughter', side: true, x: kx + 200, k: .33, ink: 1.8, s: -1, outfit: 'home', walk: t * 12 + 1, expr: { mouth: 'smile' } }); }],
    screen: [c => G.warm(c, t)] };
}
for (let tt = 428.9; tt < 431.0; tt += .2) CUE('step', tt, { surf: 'hard', gain: .4 });
function shotWifeAsks(lt, T, t) {
  return { set: homeWarm, cam: drift(camAt(S(-650, -560, 1.2), S(-700, -600, 1.45), lt / T), t, 2), vignette: .3,
    fx: [c => { drawNoah(c, noahF({ x: -900, outfit: 'agent', coat: true, expr: withBlink(t < 436.3 ? { mouth: 'soft', look: .6 } : EX.fakeSmile, t, 3.5, 2), arms: { l: { a: .3, b: -.5 }, r: { a: .4, b: -.7 } } })); drawPal(c, { look: 'son', x: -1050, k: .36, ink: 1.8, outfit: 'home', expr: { mouth: 'smile', lid: .6 }, arms: { l: { a: 1.4, b: -.4 }, r: { a: .3, b: -.2 } } }); drawPal(c, { look: 'wife', x: -450, k: .48, ink: 1.8, outfit: 'home', expr: withBlink({ mouth: (t > 432.2 && t < 435.9 && Math.sin(t * 10) > 0) ? 'o' : 'smile', open: .3, look: -.6 }, t, 3.5, 4) }); }],
    screen: [c => G.warm(c, t)] };
}
function shotSofa(lt, T, t) {
  const climb = seg(t, 443.6, 445.4);
  return { set: homeWarm, cam: drift(camAt(S(1300, -520, 1.0), S(1300, -560, 1.35), lt / T), t, 2), vignette: .3,
    fx: [c => { drawNoah(c, noahF({ x: 1300, sit: true, seatH: 300, outfit: 'home', expr: withBlink(t > 444 ? EX.warm : { mouth: 'smile', lid: .4 }, t, 3.5, 2), arms: { l: { a: .9, b: -1.2 }, r: { a: .9, b: -1.2 } } }));
      drawPal(c, { look: 'son', x: lerp(900, 1060, climb), y: lerp(0, -180, climb), k: .34, ink: 1.8, outfit: 'home', bob: -Math.abs(Math.sin(t * 7)) * 10, expr: { mouth: 'smile', lid: .6 } }); drawPal(c, { look: 'daughter', x: lerp(1700, 1540, climb), y: lerp(0, -200, climb), k: .31, ink: 1.8, outfit: 'home', bob: -Math.abs(Math.sin(t * 6 + 1)) * 10, expr: { mouth: 'smile', eyes: t > 446 ? 'closed' : 'open' } }); }],
    screen: [c => G.warm(c, t)] };
}
CUE('kidLaugh', 444.2); CUE('kidLaugh', 446.8); CUE('rustle', 443.6);
// ======================= 14 FINALE =======================
CUE('amb', 453.32, { name: 'park', until: END });
const YEARS = { t0: 455.6, t1: 460.0, corner: 'tl', text: '40 Jahre später', stamp: false }; dosCardCues(YEARS, 1);
function fallingLeaves(c, cam, t, n = 50, speed = 1) { layer(c, cam, 1, c => { for (let i = 0; i < n; i++) { const ph = ((t * .15 * speed + rnd(i)) % 1), x = cam.x - 1300 + rnd(i + 3) * 2600 + Math.sin(t * 2 + i) * 80, y = cam.y - 800 + ph * 1600; c.save(); c.translate(x, y); c.rotate(t * 3 + i); c.fillStyle = ['#d9902a', '#c0602a', '#e8b040'][i % 3]; c.beginPath(); c.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2); c.fill(); c.restore(); } }); }
function shotTimeLapse(lt, T, t) { const v = drift(camAt(S(0, -500, .6), S(0, -400, .75), lt / T), t, 2); return { set: park, setOpts: { mood: 'autumn' }, cam: v, vignette: .3, fx: [c => { bench(c, 0); }], screen: [c => fallingLeaves(c, v, t, 90, 6), c => G.gold(c, t), c => dosTag(c, t, YEARS)] }; }
CUE('whoosh', 453.4, { soft: 1 });
const oldNoah = (t, o = {}) => Object.assign({ x: -40, k: .25, ink: 1.8, outfit: 'old', sit: true, seatH: 330, tilt: .06, bob: 8, expr: withBlink({ mouth: 'soft', lid: .4, look: .3 }, t, 4, 2), arms: { l: { a: .3, b: -1.3 }, r: { a: .8 + Math.sin(t * 1.5) * .15, b: -1.0 } } }, o);
function shotOldBench(lt, T, t) {
  const v = drift(camAt(S(0, -320, 1.0), S(0, -300, 1.2), lt / T), t, 2);
  return { set: park, setOpts: { mood: 'autumn', bench2: 900 }, cam: v, vignette: .3, fx: [c => { drawNoah(c, oldNoah(t)); breadBag(c, 90, -110); pigeonFlock(c, -400, 500, t, 9); for (let i = 0; i < 3; i++) { const x = walkX(t, 460 + i * 3, -1300, 150 * (i % 2 ? -1 : 1)) * (i % 2 ? -1 : 1); drawPal(c, { look: ['wife', 'colleague', 'kidA'][i], side: true, x, k: i === 2 ? .18 : .25, ink: 1.8, outfit: i === 2 ? 'home' : 'old', s: i % 2 ? -1 : 1, walk: t * 8 + i, expr: { mouth: 'soft' } }); } }], screen: [c => fallingLeaves(c, v, t, 30), c => G.gold(c, t)] };
}
function shotMemories(lt, T, t) {
  const v = drift(camAt(S(-40, -330, 2.0), S(-40, -340, 2.4), lt / T), t, 1);
  return { set: park, setOpts: { mood: 'autumn', bench2: 900 }, cam: v, vignette: .35, fx: [c => drawNoah(c, oldNoah(t, { expr: withBlink({ mouth: t > 484.3 ? 'soft' : 'flat', lid: .45, look: -.2 }, t, 4.5, 2) }))],
    screen: [c => fallingLeaves(c, v, t, 20), c => { // memories drifting like ghosts: skylines, passports, names
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      [[476.0, 'sky'], [478.2, 'pass'], [480.6, 'pass2'], [483.0, 'sky2']].forEach(([at, k], i) => { const a = bump(t, at, at + 3.2); if (a <= 0) return; c.globalAlpha = a * .32; c.save(); c.translate(i % 2 ? W * .78 : W * .22, H * .35 - (t - at) * 12);
        if (k.startsWith('sky')) { c.fillStyle = '#fff3d8'; for (let j = 0; j < 9; j++) { const h = 60 + rnd(j + i * 9) * 160; c.fillRect(-260 + j * 58, 120 - h, 46, h); } }
        else { c.fillStyle = '#fff3d8'; c.fillRect(-150, -100, 300, 200); hudText(c, 'REISEPASS', 0, -50, 30, '#2a1a3a', 'center'); c.fillStyle = '#2a1a3a'; c.fillRect(-110, 0, 220, 30); }
        c.restore(); });
      c.restore(); }, c => G.gold(c, t)] };
}
const TB6 = { t0: 487.38, t1: 495.98, head: 488.6 };
const KANN = ['Ein Leben lang lügen', 'Niemandem alles erzählen', 'Allein sein', 'Ohne Applaus leben'];
function kannPage(c, w, h, t) {
  pageHead(c, w, t, TB6.head, 'KÖNNTEST DU DAS?');
  KANN.forEach((s, i) => { const at = 489.6 + i * .95; if (t < at) return; const y = 300 + i * 125; boxEmpty(c, 140, y, 70, clamp((t - at) / .2, 0, 1)); dosType(c, s, 260, y, 52, (t - at - .1) / .5); });
  if (t > 494.0 && Math.floor(t * 2.5) % 2) { c.fillStyle = DOS.cream; c.fillRect(260, 800, 6, 56); }
}
const tam6 = tamShot({ t0: TB6.t0, t1: TB6.t1, page: kannPage, cues: [[TB6.head, 'typeRun', .6], ...KANN.map((s, i) => [489.6 + i * .95, 'typeRow', .5])] });
function shotLookUp(lt, T, t) { return { set: park, setOpts: { mood: 'autumn', bench2: 900 }, cam: drift(camAt(S(-40, -330, 2.2), S(-40, -340, 2.6), lt / T), t, 1), vignette: .35, fx: [c => drawNoah(c, oldNoah(t, { tilt: lerp(.06, 0, seg(t, 496.4, 497.6)), expr: { mouth: 'flat', lid: .25, look: lerp(.3, 0, seg(t, 496.4, 497.6)) } }))], screen: [c => G.gold(c, t)] }; }
function shotFinal(lt, T, t) {
  const v = drift(camAt(S(-40, -320, 1.6), S(900, -300, 1.6), seg(t, 502.0, 505.0)), t, 1), lower = seg(t, 505.6, 507.0);
  return { set: park, setOpts: { mood: 'autumn', bench2: 900 }, cam: v, vignette: .4,
    fx: [c => { drawNoah(c, oldNoah(t, { expr: { mouth: 'flat', lid: .3, look: .1 } }));
      silhouette(c, cc => { drawPal(cc, fol({ x: 900, sit: true, seatH: 330, hat: true, arms: { l: { a: 1.0, b: -1.6 }, r: { a: 1.0, b: -1.6 } } })); cc.beginPath(); cc.rect(820, -330 + lower * 60, 160, 120); cc.fill(); }, '#0e0c12', { col: 'rgba(255,200,120,.8)', off: [[-3, -3]] });
      c.save(); c.translate(0, lower * 60); c.beginPath(); c.rect(800, -340, 200, 140); fs(c, '#d8d0c0', 3); for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(815, -320 + i * 20, 80 + (i % 2) * 70, 6); } line(c, [900, -340, 900, -200], 2, 'rgba(0,0,0,.3)'); c.restore(); }],
    screen: [c => G.gold(c, t)], fade: seg(t, 507.6, 508.9) };
}
CUE('paper', 505.7);
// ======================= SHOT LIST =======================
const SHOTS = film([
  [0, '06 grey office', shotOfficeWide], [5.9, '06 carpet / coffee / computer', shotDetails], [10.96, '06 reading reports', shotReading],
  [16.4, '06 monitors', shotMonitors], [25.62, '06 TABELLE Ein Arbeitstag', tam4], [33.7, '06 puzzle', shotPuzzle],
  [41.62, '07 the message', shotDeskPhone], [47.98, '07 kitchen, Dienstreise', shotKitchen], [58.4, '07 fake smile', shotFakeSmile2],
  [62.42, '07 station 8:00', shotStationWide], [66.86, '07 locker', shotLocker], [71.56, '07 envelope contents', shotItems], [77.94, '07 burn the note', shotBurn],
  [82.88, '08 train in the rain', shotTrain], [89.04, '08 wet streets', shotWetWide], [92.94, '08 walking to meet', rainWalk(92.94, -900)],
  [104.7, '08 café window', shotCafe], [115.42, '08 shoe shop', shotShoes], [120.56, '08 tram', shotTram], [125.5, '08 one stop early', shotStepOff],
  [131.1, '08 the man across the street', shotManAcross], [142.06, '08 notices → mask', shotNoahNotices], [146.12, '08 calm face, racing heart', shotCalmWalk],
  [154.08, '08 turn the corner', shotTurn], [161.18, '08 shop window reflection', shotReflection], [166.4, '08 decision', shotDecision],
  [180.68, '09 Kaufhaus', kh(S(0, -480, .6), kaufWalk(-2000, 300, { t0: 180.68 }))],
  [185.44, '09 escalator', kh(S(-1000, -700, 1.0), kaufWalk(-1450, 230, { t0: 185.44, y: x => -(x + 1450) * 1.12 }))],
  [187.0, '09 suits', kh(S(600, -480, 1.05), kaufWalk(100, 320, { t0: 187.0 }))],
  [188.2, '09 tills', kh(S(1300, -480, 1.05), (c, t) => { counter(c, 1500, 700); drawPal(c, { look: 'neighbor', x: 1600, y: -60, k: .45, ink: 1.8, outfit: 'home', expr: { mouth: 'soft' } }); kaufWalk(900, 320, { t0: 188.2 })(c, t); })],
  [189.46, '09 stairs down', kh((lt, T, t) => { const x = walkX(t, 189.46, -650, -260); return S(x + 100, -(x + 1450) * 1.12 - 400, 1.0); }, (c, t) => { const x = walkX(t, 189.46, -650, -260); drawNoahSide(c, { x, y: -(x + 1450) * 1.12, k: NK, ink: 1.8, outfit: 'agent', coat: true, s: -1, walk: t * 9, expr: EX.alert }); })],
  [190.6, '09 back corridor', (lt, T, t) => ({ set: room, setOpts: { wall: '#6a6e72', floor: '#4a4e52', floorType: 'tile', light: 'grey', wallpaper: false, lampsCeil: [0], back: (c, b) => door(c, 800, b, { col: '#5a5e66', sign: 'Ausgang' }) }, cam: S(500, -600, .9), vignette: .4, fx: [c => drawNoahSide(c, { x: walkX(t, 190.6, 200, 330), k: NK, ink: 1.8, outfit: 'agent', coat: true, walk: t * 9, expr: EX.alert })], screen: [c => G.grey(c, t)] })],
  [191.64, '09 back door, he is gone', shotAlley],
  [201.08, '10 foggy park, the woman', shotParkWide], [207.08, '10 the woman (closer)', parkShot(S(110, -230, 2.0), (c, t) => { drawPal(c, informant(t, { expr: withBlink({ mouth: 'soft', look: .4 }, t, 4.5, 9) })); breadBag(c, 40, -110); pigeonsPark(c, t); })],
  [211.28, '10 he sits down', shotParkSit], [217.6, '10 the weather sentence', shotParkTalk], [228.44, '10 trembling hands', shotHands],
  [231.68, '10 names, places, plans', shotSymbols], [238.7, '10 she leaves', shotLeaves], [243.72, '10 alone on the bench', shotAlone],
  [249.66, '11 cheap hotel', shotHotelWide], [255.98, '11 the report', shotLaptop], [261.54, '11 alone', shotHotelSit], [263.02, '11 her photo', shotPhoneWife],
  [271.66, '12 the other side', shotWindowSil], [282.46, '12 family dinner', shotDinner], [291.62, '12 cannot tell', shotHomeDoor],
  [301.86, '12 restaurant: facing the door', shotRestaurant], [311.5, '12 traffic light', shotTrafficLight], [314.72, '12 new neighbour', shotNewNeighbor],
  [321.2, '12 holiday', shotBeach], [325.02, '12 in bed', shotBedAwake], [326.92, '12 alone if it goes wrong', shotInterrog], [337.92, '12 UNBEKANNT', shotUnbekannt],
  [344.08, '12 TABELLE Der Preis', tam5], [352.22, '12 empty hall', shotHall], [365.98, '12 Applaus: 0', shotDark], [370.72, '12 the news', shotTV],
  [387.64, '13 something bigger', shotOfficeNightWindow], [402.46, '13 the thrill', shotThrill], [405.58, '13 colleagues', shotColleagues],
  [425.92, '13 home: kids run', shotKidsRun], [432.2, '13 how was the trip?', shotWifeAsks], [441.76, '13 sofa, just Papa', shotSofa],
  [453.32, '14 40 years later', shotTimeLapse], [460.02, '14 old Noah feeds pigeons', shotOldBench], [472.88, '14 what nobody knows', shotMemories],
  [487.38, '14 TABELLE Könntest du das?', tam6], [495.98, '14 he looks at you', shotLookUp], [501.52, '14 the next bench', shotFinal],
  [END]]);
NOAH_FONTS_READY.then(() => defineFilm({ fadeIn: .5, fadeOut: 0, shots: SHOTS }));
