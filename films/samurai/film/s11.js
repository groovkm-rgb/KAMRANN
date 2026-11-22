// Section 11 (403,0–435,3): honour and death — only symbolic, very plain and respectful. No blood, no blade contact, no face.
SH(403.00, '11 Der dunkelste Teil: weißer Vorhang, leeres Kissen', { ang: 'wide', tr: { type: 'black', dur: .7, hold: .4 }, sfx: [[0.5, 'windSoft', -16]], amb: 'quiet', mus: 'none' }, (c, lt) => {
  courtyardSet(c, cam(960, 560, 1.05), lt, { season: 'spring' }); c.save(); c.globalAlpha = .55; fill(c, '#3a3a44'); c.restore();
  for (let i = 0; i < 5; i++) { c.beginPath(); c.rect(260 + i * 290, 180, 280, 560); fo(c, '#f1eee6', 3); } c.beginPath(); c.ellipse(960, 900, 200, 40, 0, 0, Math.PI * 2); fo(c, '#f1eee6', 3); vignette(c, .55);
});
SH(405.40, '11 Weiß gekleidete Gestalt, von hinten, fern', { ang: 'wide', sfx: [[1.0, 'bellFar', -18]], amb: 'quiet' }, (c, lt) => {
  courtyardSet(c, cam(960, 560, 1.0), lt, { season: 'spring' }); c.save(); c.globalAlpha = .5; fill(c, '#3a3a44'); c.restore();
  for (let i = 0; i < 5; i++) { c.beginPath(); c.rect(260 + i * 290, 180, 280, 560); fo(c, '#f1eee6', 3); }
  silhouette(c, c => { c.save(); c.translate(960, 880); c.scale(.32, .32); c.beginPath(); c.moveTo(-300, 0); c.quadraticCurveTo(-320, -300, -160, -620); c.lineTo(160, -620); c.quadraticCurveTo(320, -300, 300, 0); c.closePath(); c.fill(); circ(c, 0, -800, 250); c.fill(); c.restore(); }, '245,243,236', 1);
  c.beginPath(); c.rect(1080, 860, 120, 24); fo(c, '#c9b48a', 3); vignette(c, .6);
});
SH(409.80, '11 Das kurze Schwert auf dem Tablett, in Papier', { ang: 'macro', sfx: [[0.5, 'paper', -16]], amb: 'quiet' }, (c, lt) => {
  fill(c, '#1a1816'); c.save(); c.translate(960, 640); c.beginPath(); c.rect(-560, -60, 1120, 160); fo(c, '#d9c9a2', 5); c.beginPath(); c.rect(-520, 100, 1040, 40); fo(c, '#b8a47a', 4); c.restore();
  c.save(); c.translate(500, 600); c.scale(1.5, 1.5); drawSword(c, { kind: 'waki', sheath: true }); c.beginPath(); c.rect(260, -26, 120, 52); fo(c, '#f5f2ea', 3); c.restore();
  bloom(c, 1300, 300, 500, '240,230,210', .2); vignette(c, .6);
});
SH(414.60, '11 Ein einzelnes Kirschblatt fällt (ruhig)', { ang: 'macro', sfx: [[0, 'silence', -40], [3.2, 'taikoSoft', -8]], amb: 'quiet' }, (c, lt) => {
  fill(c, '#0e0d10'); const y = lerp(-60, 1100, seg(lt, 0, 3.2)); sakuraPetal(c, 960 + Math.sin(lt * 1.5) * 160, y, 46, lt * 1.3, .5); bloom(c, 960 + Math.sin(lt * 1.5) * 160, y, 200, '255,220,230', .25); if (lt > 3.2) fill(c, '#000');
});
SH(417.90, '11 Für uns heute unvorstellbar: Wolkenmeer', { ang: 'wide', tr: { type: 'fade', dur: .6 }, sfx: [[0.3, 'windHigh', -14]], amb: 'quiet' }, (c, lt) => {
  skyGrad(c, [[0, '#4a5a7a'], [.6, '#c8b8b0'], [1, '#e8d8c8']]); for (let i = 0; i < 4; i++) ridge(c, -200, 2200, 560 + i * 120, 220 - i * 30, ['#7a8aa0', '#62758e', '#4a5f78', '#384a62'][i], i * 3 + 1, { freq: 3 + i }); mistBlobs(c, -400, 2400, 760, lt, { n: 20, col: '245,240,235', a: .6, speed: 25, r: 420 }); vignette(c, .35);
});
SH(420.50, '11 Wappenfahne im Wind', { ang: 'low', sfx: [[0, 'flag', -10]], amb: 'quiet' }, (c, lt) => { skyGrad(c, [[0, '#6a8ab0'], [1, '#e0d4c4']]); nobori(c, 700, 1400, 1500, { w: 420, t: lt * 1.5, mon: (c, x, y, r) => drawKamon(c, x, y, r, SAM.indigo), lw: 5 }); vignette(c, .3); });
SH(423.50, '11 Lieber Ehre als Schande: Gestalt im Morgenlicht', { ang: 'wide', sfx: [[0.5, 'windSoft', -16]], amb: 'quiet' }, (c, lt) => {
  skyGrad(c, [[0, '#3a4060'], [.6, '#d09070'], [1, '#f0c8a0']]); bloom(c, 960, 760, 600, '255,200,140', .5); ridge(c, -200, 2200, 800, 120, '#2a2a38', 2);
  silhouette(c, c => NF(c, 960, 1000, .32, { expr: EX.calm }), '20,18,26', .95); vignette(c, .4);
});
SH(426.50, '11 Jeden Morgen an den Tod denken (Veranda)', { ang: 'medium', tr: { type: 'mist', dur: .5, col: '220,215,225' }, sfx: [[0.4, 'birdsDawn', -18]], amb: 'morning', mus: 'shaku' }, (c, lt) => {
  const cm = cam(960, 600, 1.15); skyGrad(c, [[0, '#6a7aa0'], [1, '#e0c8b8']]); layer(c, cm, .3, c => { ridge(c, -200, 2200, 640, 120, '#8a90a8', 3); haze(c, '230,225,230', .3); });
  layer(c, cm, .9, c => { c.fillStyle = '#3a2a1c'; c.fillRect(-300, 820, 2600, 60); c.fillStyle = '#5a4030'; c.fillRect(-300, 880, 2600, 300); tileRoof(c, 960, 150, 2800, 200); stroke(c, [300, 150, 300, 830], 30, '#2a1c12'); stroke(c, [1700, 150, 1700, 830], 30, '#2a1c12'); });
  layer(c, cm, 1, c => NF(c, 960, 880, .42, { seiza: true, expr: EX.closed, breathe: lt * 1.2 })); bloom(c, 1500, 500, 500, '255,210,160', .35 * seg(lt, 0, 4)); vignette(c, .35);
});
SH(430.90, '11 Nicht aus Traurigkeit', { ang: 'closeup', sfx: [[0.6, 'breathSoft', -18]], amb: 'morning' }, (c, lt) => { skyGrad(c, [[0, '#8a90b0'], [1, '#f0d8c0']]); HEADCU(c, 960, 560, 1.05, EX.closed); bloom(c, 1600, 400, 500, '255,210,160', .4); vignette(c, .35); });
SH(432.40, '11 …sondern keine Angst mehr', { ang: 'closeup', sfx: [[0.4, 'birdsDawn', -16]], amb: 'morning' }, (c, lt) => {
  skyGrad(c, [[0, '#a0b0d0'], [1, '#ffe0c0']]); const o = seg(lt, .3, 1.2); HEADCU(c, 960, 560, 1.05, o < .1 ? EX.closed : { lid: lerp(.9, .45, o), mouth: 'soft' }); bloom(c, 1600, 400, 700, '255,220,170', .5 * o); vignette(c, .3);
});
