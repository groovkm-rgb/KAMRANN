// Section 15 (560,4–611,8): evening and finale.
function verandaSet(c, cm, lt, o = {}) {
  const tod = o.tod || 'dusk'; skyGrad(c, tod === 'night' ? [[0, '#070b18'], [1, '#1f2a48']] : [[0, '#4a3a5a'], [.6, '#e0905a'], [1, '#f4c080']]);
  if (tod === 'night') { stars(c, 100, lt, .8, 500); layer(c, cm, .05, c => moonDisc(c, 1450, 220, 70)); } else layer(c, cm, .05, c => { bloom(c, 1500, 620, 500, '255,170,90', .6); circ(c, 1500, 640, 90); c.fillStyle = '#ffb070'; c.fill(); });
  layer(c, cm, .3, c => { ridge(c, -200, 2200, 680, 120, tod === 'night' ? '#121a2c' : '#5a3a48', 3); mapleTree(c, 1700, 760, .9, lt, { leaves: tod === 'night' ? ['#3a2030', '#4a2838'] : ['#b8442e', '#d0623a'] }); });
  layer(c, cm, .9, c => { c.fillStyle = '#2a1c12'; c.fillRect(-300, 820, 2600, 50); c.fillStyle = '#4a3424'; c.fillRect(-300, 870, 2600, 300); tileRoof(c, 960, 140, 2800, 180, { col: '#1a1416' }); stroke(c, [240, 140, 240, 830], 30, '#20150e'); stroke(c, [1680, 140, 1680, 830], 30, '#20150e'); if (o.lantern) { c.save(); c.translate(400, 300); ell(c, 0, 0, 36, 52); c.fillStyle = '#ffd89a'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2a1a0e'; c.stroke(); bloom(c, 0, 0, 220, '255,190,110', .55); c.restore(); } });
}
SH(560.40, '15 Zurück zu dir', { ang: 'wide', tr: { type: 'sakura', dur: .7 }, sfx: [[0.3, 'cicadas', -16]], amb: 'summerEvening', mus: 'koto' }, (c, lt) => { courtyardSet(c, cam(960, 560, 1.05), lt, { season: 'summer' }); grade2(c, .3, .15, .8, .3); vignette(c, .35); });
SH(562.20, '15 Sonnenuntergang', { ang: 'wide', sfx: [[0, 'cicadas', -14]], amb: 'summerEvening' }, (c, lt) => { verandaSet(c, cam(960, 560, push(lt, 2.7, 1, 1.05)), lt); vignette(c, .35); });
SH(564.90, '15 Im kleinen Haus, auf der Veranda', { ang: 'medium', sfx: [[0.4, 'fabric', -18]], amb: 'summerEvening' }, (c, lt) => { const cm = cam(960, 600, 1.2); verandaSet(c, cm, lt, { lantern: true }); layer(c, cm, 1, c => NF(c, 960, 900, .42, { seiza: true, haori: false, swords: false, expr: ex('calm', lt, 89) })); vignette(c, .35); });
SH(566.90, '15 Grillen im Gras (Makro)', { ang: 'macro', sfx: [[0, 'crickets', -8]], amb: 'crickets' }, (c, lt) => {
  skyGrad(c, [[0, '#2a2440'], [1, '#6a4a5a']]); for (let i = 0; i < 70; i++) { const x = i * 28 + rnd(i) * 20; stroke(c, [x, 1100, x + Math.sin(lt + i * .4) * 20, 600 + rnd(i) * 300], 8, '#1e2a1c'); }
  c.save(); c.translate(1000, 760); c.rotate(-.3); ell(c, 0, 0, 60, 22); c.fillStyle = '#2a2a1a'; c.fill(); stroke(c, [40, -10, 160, -70], 3, '#2a2a1a'); stroke(c, [40, -6, 150, -40], 3, '#2a2a1a'); for (const s of [-1, 1]) stroke(c, [-10, 10, -60, 50 * s], 4, '#2a2a1a'); c.restore(); fireflies(c, 200, 1700, 300, 900, lt, 16); vignette(c, .45);
});
SH(568.50, '15 Die Frau stellt eine Schale Reis hin', { ang: 'medium', sfx: [[0.6, 'bowlSet', -10]], amb: 'crickets' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.3), lt, { tod: 'dusk', andon: 1500 }); const k = ease(seg(lt, .2, 1.4));
  NF(c, 760, 1060, .42, { seiza: true, haori: false, swords: false, expr: ex('calm', lt, 90) }); PS(c, 'wife', 1200, 1060, .42, { s: -1, pose: 'bow', bow: .3 * k, expr: ex('calm', lt, 91), arms: { near: { hand: [420 * k + 100, -380] } } });
  riceBowl(c, lerp(1080, 930, k), lerp(880, 960, k), .5, { steam: lt }); vignette(c, .4);
});
SH(571.10, '15 Die Kinder schlafen schon (kleines Lächeln)', { ang: 'medium', sfx: [[0.5, 'breathSoft', -18]], amb: 'crickets' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.3), lt, { tod: 'night', andon: 1500 }); for (const [x, d] of [[700, 0], [1050, 1]]) { c.beginPath(); c.roundRect(x - 160, 920, 320, 120, 30); fo(c, '#2f3a5c', 5); c.save(); c.translate(x - 110, 960); c.rotate(-1.5); drawChild(c, { x: 0, y: 0, k: .22, expr: { eyes: 'closed', mouth: 'smile' } }); c.restore(); }
  HEADCU(c, 1500, 560, .55, { lid: .45, mouth: 'smile' }, 0, 'chonmage', { haori: false }); vignette(c, .45);
});
SH(572.90, '15 Pinsel in die Tusche tauchen', { ang: 'macro', sfx: [[0.4, 'inkDip', -8]], amb: 'crickets' }, (c, lt) => {
  fill(c, '#2a1c12'); bloom(c, 1500, 300, 700, '255,190,110', .4); inkStone(c, 960, 900, 3, { wet: true }); const k = bump(lt, .1, 2); brush(c, 900, 520 + k * 260, .15, 2.2, { wet: k > .5 }); vignette(c, .45);
});
SH(575.30, '15 Ein paar Zeilen', { ang: 'side', sfx: [[0.3, 'brush', -12], [1.1, 'brush', -12]], amb: 'crickets' }, (c, lt) => {
  roomSet(c, cam(1000, 600, 1.35), lt, { tod: 'night', andon: 1350 }); lowTable(c, 1080, 1000, 1); washiSheet(c, 900, 860, 300, 30);
  NS(c, 760, 1060, .42, { pose: 'seiza', outfit: 'nohaori', expr: ex('calm', lt, 92, { down: 1 }), arms: { near: { hand: [400 + Math.sin(lt * 2) * 30, -500] }, far: { hand: [330, -520] } }, item: { arm: 'near', ang: -.3, fn: c => brush(c, 0, 0, 0, .9, { wet: true }) } }); vignette(c, .45);
});
SH(577.00, '15 Über den Mond, über die Kirschblüten', { ang: 'wide', tr: { type: 'fade', dur: .4 }, sfx: [[0.3, 'windSoft', -18]], amb: 'night', mus: 'shaku' }, (c, lt) => { cherryNightSet(c, cam(960, 540, push(lt, 2.1, 1, 1.05)), lt); vignette(c, .35); });
SH(579.10, '15 Sie vergehen so schnell (fallende Blüten)', { ang: 'macro', sfx: [[0.5, 'windSoft', -18]], amb: 'night' }, (c, lt) => {
  skyGrad(c, [[0, '#0a1024'], [1, '#2a3050']]); bloom(c, 1400, 200, 500, '200,215,255', .35); for (let i = 0; i < 30; i++) { const ph = (lt * .08 + rnd(i)) % 1; sakuraPetal(c, 200 + rnd(i + 3) * 1500 + Math.sin(lt * .6 + i) * 80, ph * 1200 - 50, 20 + rnd(i) * 26, lt * .8 + i, rnd(i + 7)); } vignette(c, .4);
});
SH(581.80, '15 So wie das Leben eines Samurai', { ang: 'medium', sfx: [[0.3, 'breathSoft', -18]], amb: 'night' }, (c, lt) => { const cm = cam(960, 600, 1.2); verandaSet(c, cm, lt, { tod: 'night' }); layer(c, cm, 1, c => NF(c, 960, 900, .42, { seiza: true, haori: false, swords: false, expr: ex('calm', lt, 93, { look: .6 }) })); vignette(c, .4); });
SH(583.40, '15 Dann legst du dich hin', { ang: 'overhead', tr: { type: 'shoji', dur: .5 }, sfx: [[0, 'shoji', -12], [0.8, 'fabric', -14]], amb: 'night' }, (c, lt) => {
  tatamiTop(c, -200, -200, 5, 4, 560, 440, { col: '#5e6470', edge: '#15161b' }); futonTop(c, 1000, 560, 520, 900, { under: '#7c8090', cover: '#233056', pillow: '#6d6a62' }); drawSamHead(c, 1000, 250, .52, { lid: .6, mouth: 'soft' }); ambient(c, 'night'); vignette(c, .5);
});
SH(585.40, '15 Die zwei Schwerter wieder neben dem Kopf', { ang: 'medium', sfx: [[0.6, 'swordRing', -18]], amb: 'night' }, (c, lt) => {
  fill(c, '#0e111c'); shojiWall(c, -200, 40, 2400, 520, { panels: 5, rows: 4, glow: .38, glowCol: '150,175,230', frame: '#120d09', paper: '#323c58' }); tatamiPersp(c, 580, 1080, { far: '#262d42', near: '#3d4658', edge: 'rgba(8,8,12,.85)' });
  swordRack(c, 900, 860, 1.0, { gleam: seg(lt, .3, 1.9), gleam2: seg(lt, .5, 2) }); c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(70,90,150,.3)'; c.fillRect(0, 0, W, H); c.restore(); vignette(c, .55);
});
SH(587.40, '15 Das Auge schließt sich (Spiegel des Anfangs)', { ang: 'macro', sfx: [[1.4, 'breathSoft', -16]], amb: 'night' }, (c, lt) => {
  fill(c, '#0b0f1a'); const cl = ease(seg(lt, .8, 2.0)), e = cl > .95 ? { eyes: 'closed', mouth: 'flat' } : { lid: lerp(.2, 1, cl), mouth: 'flat' };
  const k = 3.6; c.save(); c.translate(1060 - 92 * k, 560 - 25 * k); c.rotate(.04); c.scale(k, k); c.translate(0, -NOAH.HEAD.y); samHeadLocal(c, e, 'chonmage'); c.restore();
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = vgrad(c, 0, 0, W, 0, [[0, 'rgba(150,170,230,1)'], [1, 'rgba(40,50,90,1)']]); c.fillRect(0, 0, W, H); c.restore(); vignette(c, .75);
});
SH(589.90, '15 Ein normaler Dienst…', { ang: 'wide', tr: { type: 'ink', dur: .4, seed: 111 }, sfx: [[0, 'ink', -10], [0.4, 'crow', -16]], amb: 'castle' }, (c, lt) => { castleSet(c, cam(1000, 620, 1.45), lt, { crows: 1 }); layer(c, cam(1000, 620, 1.45), .5, c => { NF(c, 820, 900, .18, { expr: EX.bored }); NF(c, 1180, 900, .18, { expr: EX.bored }); }); vignette(c, .35); });
SH(591.80, '15 …oder eine Schlacht', { ang: 'wide', tr: { type: 'cut', dur: .25, ang: .5 }, sfx: [[0, 'taiko', -6], [0.2, 'horagai', -14]], amb: 'battlewind' }, (c, lt) => { battleField(c, lt); vignette(c, .4); });
SH(593.00, '15 …oder der letzte Morgen', { ang: 'wide', tr: { type: 'mist', dur: .4 }, sfx: [[0.3, 'birdsDawn', -18]], amb: 'morning' }, (c, lt) => { skyGrad(c, [[0, '#3a4a70'], [.7, '#e0a080'], [1, '#f8d0a0']]); bloom(c, 960, 800, 700, '255,200,140', .55); ridge(c, -200, 2200, 820, 140, '#2a2a3a', 3); vignette(c, .35); });
SH(594.90, '15 Hättest du das gekonnt?', { ang: 'closeup', tr: { type: 'shoji', dur: .45 }, sfx: [[0, 'shoji', -12], [1.5, 'taikoSoft', -14]], amb: 'quiet' }, (c, lt) => {
  roomSet(c, cam(960, 300, 1.8), lt, { tod: 'dusk' }); const turn = ease(seg(lt, 0, .6)); HEADCU(c, 960, 560, 1.05, ex('focus', lt, 94, { look: lerp(-.8, 0, turn), lid: .2 }), lerp(-.08, 0, turn)); vignette(c, .4);
});
SH(597.60, '15 T12 Leere Kästchen (ruhig)', { ang: 'table', tr: { type: 'scroll', dur: .55 }, sfx: [[0, 'scroll', -8], [0.35, 'brush', -10], [0.5, 'brush', -14], [1.15, 'brush', -10], [1.3, 'brush', -14], [1.95, 'brush', -10], [2.1, 'brush', -14]], mus: 'shaku' }, (c, lt) => tFinale(c, lt));
SH(603.30, '15 Für die Ehre: das Wappen', { ang: 'macro', sfx: [[0.3, 'swordRing', -16]], amb: 'quiet' }, (c, lt) => { fill(c, '#1a1612'); c.save(); c.translate(960, 540); c.scale(1 + lt * .04, 1 + lt * .04); drawKamon(c, 0, 0, 300, '#e9e4d6'); c.restore(); bloom(c, 960, 540, 600, '255,230,190', .25); vignette(c, .5); });
SH(605.10, '15 Schreib es in die Kommentare', { ang: 'medium', tr: { type: 'fade', dur: .3 }, sfx: [[0.4, 'fabric', -16]], amb: 'spring' }, (c, lt) => { courtyardSet(c, cam(960, 560, 1.2), lt, { season: 'spring' }); NF(c, 960, 1500, .72, { expr: ex('focus', lt, 95), arms: { r: { a: .9 + bump(lt, .4, 1.6) * .6, b: -1.2 } } }); vignette(c, .3); });
SH(607.90, '15 Hättest du als Samurai überlebt?', { ang: 'closeup', sfx: [[0.6, 'tick', -14]], amb: 'spring' }, (c, lt) => { courtyardSet(c, cam(960, 300, 1.8), lt, { season: 'spring' }); HEADCU(c, 960, 560, 1.05, ex('focus', lt, 96, { browUp: bump(lt, .5, 2) * .6 })); vignette(c, .35); });
SH(610.30, '15 Kirschblütensturm – Trommel – Schwarz', { ang: 'wide', tr: { type: 'sakura', dur: .9 }, sfx: [[0.2, 'windGust', -10], [1.2, 'taiko', -2]], amb: 'spring' }, (c, lt) => { cherryNightSet(c, cam(960, 540, 1), lt); for (let i = 0; i < 160; i++) { const ph = (lt * .5 + rnd(i)) % 1; sakuraPetal(c, (rnd(i + 3) * 2400 + lt * 600) % 2200 - 200, ph * 1100, 14 + rnd(i) * 14, lt * 3 + i, rnd(i + 7)); } if (lt > 1.2) fill(c, '#000'); });
