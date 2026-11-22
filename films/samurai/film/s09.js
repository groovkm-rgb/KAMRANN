// Section 09 (320,0–354,7): the night before the battle.
SH(320.00, '09 Eines Tages ist es soweit', { ang: 'wide', tr: { type: 'mist', dur: .5 }, sfx: [[0.3, 'bellFar', -16], [1.5, 'crow', -18]], amb: 'castle' }, (c, lt) => { castleSet(c, cam(960 + lt * 15, 560, 1.1), lt, { tod: 'dusk' }); vignette(c, .4); });
SH(323.30, '09 Bote galoppiert, Fackeln', { ang: 'wide', tr: { type: 'cut', dur: .3, ang: -.5 }, sfx: [[0, 'gallop', -6], [1.4, 'whinny', -10]], amb: 'night' }, (c, lt) => {
  castleSet(c, cam(960, 600, 1.2), lt, { tod: 'night', crows: 0 }); for (const x of [700, 1300]) { stroke(c, [x, 900, x, 760], 10, '#3a2a1a'); flames(c, x, 760, 50, 70, lt, x); }
  drawHorse(c, -200 + lt * 700, 1060, 1.0, { t: lt, gallop: true, col: '#3a2a20', rider: c => { c.save(); c.beginPath(); c.rect(-400, -1500, 800, 1180); c.clip(); c.translate(-20, -150); NS(c, 0, 0, .3, { expr: EX.alert, outfit: 'nohaori' }); c.restore(); } }); vignette(c, .45);
});
SH(325.40, '09 Der Feind marschiert (Karte)', { ang: 'table', sfx: [[0.2, 'brush', -10], [0.6, 'marching', -16]] }, (c, lt) => {
  parchmentBG(c, 21); brushText(c, 'Feind', 1400, 300, 64, seg(lt, 0, .4), { col: '#2f4a2c' }); for (let i = 0; i < 3; i++) brushArrow(c, 1700, 400 + i * 150, 900 - lt * 100, 500 + i * 100, seg(lt, .2 + i * .1, 1 + i * .1), { w: 16, col: '#2f4a2c' });
  c.save(); c.translate(500, 560); c.scale(.4, .4); castle(c, 0, 0, 1); c.restore(); c.restore(); vignette(c, .35);
});
SH(326.70, '09 Morgen wird gekämpft', { ang: 'closeup', sfx: [[0.2, 'taiko', -10]], amb: 'night' }, (c, lt) => { castleSet(c, cam(960, 300, 2.0), lt, { tod: 'night', crows: 0 }); HEADCU(c, 960, 620, 1.35, ex('tense', lt, 55)); flames(c, 1700, 900, 80, 120, lt); vignette(c, .5); });
SH(328.30, '09 Kaum schlafen', { ang: 'medium', sfx: [[0.4, 'crickets', -18], [1.6, 'fabric', -16]], amb: 'night' }, (c, lt) => {
  roomSet(c, cam(960, 560, 1.2), lt, { tod: 'night', andon: 1400 }); NF(c, 900, 1060, .45, { seiza: true, outfit: 'custom', custom: { col: '#8a92a6', dark: '#6c7488', light: '#a0a8bb', hak: '#8a92a6', hakD: '#6c7488' }, expr: ex('tense', lt, 56, { look: Math.sin(lt) * .5 }) }); vignette(c, .5);
});
SH(330.80, '09 Schwertpflege: Ölpapier', { ang: 'macro', sfx: [[0.2, 'oilCloth', -8]], amb: 'night' }, (c, lt) => {
  fill(c, '#1a120c'); bloom(c, 1500, 300, 700, '255,190,110', .4); c.save(); c.translate(160, 600); c.scale(2.3, 2.3); drawSword(c, { kind: 'katana', naked: true, sheath: false, gleam: seg(lt, .1, 1.4) }); c.restore();
  const x = lerp(700, 1500, seg(lt, 0, 1.4)); c.save(); c.translate(x, 590); c.beginPath(); c.rect(-90, -50, 180, 100); fo(c, '#efe6d0', 4); c.restore(); c.save(); c.translate(x, 540); c.scale(2.2, 2.2); samFist(c, 0, 0, 0); c.restore(); vignette(c, .5);
});
SH(332.30, '09 Rüstungskiste öffnen', { ang: 'medium', sfx: [[0.3, 'chestLid', -10]], amb: 'night' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.3), lt, { tod: 'night', andon: 1500 }); woodChest(c, 900, 1000, .9, ease(seg(lt, .1, 1)) * .8); vignette(c, .5);
});
SH(333.50, '09 Viele kleine Platten (Makro)', { ang: 'macro', sfx: [[0.3, 'armor', -10]], amb: 'night' }, (c, lt) => {
  fill(c, '#100c0a'); c.save(); c.translate(960 - lt * 60, 540); c.scale(3.2, 3.2); c.translate(0, 760); armorBody(c, {}); c.restore(); bloom(c, 1500, 200, 600, '255,190,110', .3); vignette(c, .5);
});
SH(335.60, '09 Seidenschnüre (Makro)', { ang: 'macro', sfx: [[0.3, 'lace', -8], [1.4, 'lace', -10]], amb: 'night' }, (c, lt) => {
  fill(c, '#14100c'); for (let r = 0; r < 6; r++) { c.fillStyle = r % 2 ? '#1c1814' : '#221d18'; c.fillRect(0, 60 + r * 160, W, 150); for (let x = -40; x < W + 40; x += 46) { stroke(c, [x + lt * 20, 70 + r * 160, x + lt * 20, 200 + r * 160], 26, SAM.lace); stroke(c, [x - 6 + lt * 20, 80 + r * 160, x - 6 + lt * 20, 190 + r * 160], 4, 'rgba(255,200,200,.35)'); } stroke(c, [0, 208 + r * 160, W, 208 + r * 160], 8, SAM.goldL); } vignette(c, .45);
});
SH(338.20, '09 Schwer', { ang: 'medium', sfx: [[0.2, 'thud', -8], [0.4, 'grunt', -16]], amb: 'night' }, (c, lt) => { roomSet(c, cam(960, 500, 1.4), lt, { tod: 'night', andon: 1500 }); NF(c, 960, 1300, .6, { outfit: 'armor', flag: false, hair: 'chonmage', expr: ex('tense', lt, 57), bob: Math.sin(lt * 20) * 4 * (1 - lt) }); vignette(c, .45); });
SH(339.20, '09 Schulterschutz anlegen', { ang: 'closeup', sfx: [[0.3, 'armor', -10], [1.2, 'lace', -10]], amb: 'night' }, (c, lt) => { roomSet(c, cam(960, 400, 1.6), lt, { tod: 'night', andon: 1500 }); NF(c, 960, 1700, .9, { outfit: 'armor', flag: false, hair: 'chonmage', expr: ex('focus', lt, 58), sway: Math.sin(lt * 3) }); vignette(c, .45); });
SH(341.00, '09 Der Helfer zieht die Schnüre', { ang: 'medium', sfx: [[0.2, 'lace', -6], [1.0, 'lace', -6]], amb: 'night' }, (c, lt) => {
  roomSet(c, cam(960, 560, 1.25), lt, { tod: 'night', andon: 1600 }); NF(c, 850, 1060, .45, { outfit: 'armor', flag: false, hair: 'chonmage', expr: ex('tense', lt, 59) });
  const p = Math.sin(lt * 5); PS(c, 'helper', 1180, 1060, .45, { s: -1, expr: EX.focus, arms: { near: { hand: [260 + p * 40, -720], fist: true }, far: { hand: [240 + p * 40, -700], fist: true } } }); vignette(c, .45);
});
SH(343.00, '09 T5 Die Rüstung', { ang: 'table', tr: { type: 'scroll', dur: .55 }, sfx: [[0, 'scroll', -8], [0.2, 'brush', -12], [0.7, 'hanko', -10], [0.5, 'brush', -16], [0.8, 'brush', -16], [1.1, 'brush', -16], [1.4, 'brush', -16], [1.7, 'brush', -16], [2.0, 'brush', -16], [2.3, 'brush', -16]] }, (c, lt) => tRuestung(c, lt));
SH(347.40, '09 Abschiedsgedicht bei Laternenlicht (ruhig)', { ang: 'medium', tr: { type: 'fade', dur: .4 }, sfx: [[0.6, 'brush', -14], [2.4, 'brush', -14]], amb: 'night', mus: 'koto' }, (c, lt) => {
  roomSet(c, cam(1000, 600, 1.35), lt, { tod: 'night', andon: 1350 }); lowTable(c, 1080, 1000, 1); washiSheet(c, 900, 860, 300, 30);
  NS(c, 760, 1060, .42, { pose: 'seiza', outfit: 'armor', flag: false, hair: 'chonmage', expr: ex('calm', lt, 60, { down: 1 }), arms: { near: { hand: [400 + Math.sin(lt * 2) * 30, -500 + Math.sin(lt * 40) * 4] }, far: { hand: [330, -520] } }, item: { arm: 'near', ang: -.3, fn: c => brush(c, 0, 0, 0, .9, { wet: true }) } }); vignette(c, .5);
});
SH(352.10, '09 Gefaltet in ein Kästchen', { ang: 'macro', sfx: [[0.3, 'paper', -10], [1.4, 'lidClose', -8], [2.2, 'taiko', -4]] }, (c, lt) => {
  fill(c, '#1a120c'); bloom(c, 1400, 300, 700, '255,190,110', .4); const f = ease(seg(lt, 0, 1)); c.save(); c.translate(960, 600); c.scale(1 - f * .5, 1); washiSheet(c, -300, -200, 600, 400); brushMarks(c, -100, -170, 1, .9, 31); c.restore();
  c.save(); c.translate(960, 900); c.beginPath(); c.rect(-260, -150, 520, 150); fo(c, '#3a2616', 6); c.save(); c.translate(-260, -150); c.rotate(-(1 - ease(seg(lt, 1.1, 1.5))) * 1.4); c.beginPath(); c.rect(0, -30, 520, 30); fo(c, '#4a3020', 6); c.restore(); c.restore();
  if (lt > 2.2) fill(c, '#000'); vignette(c, .5);
});
