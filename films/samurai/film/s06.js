// Section 06 (216,3–240,9): breakfast and pay in rice.
function trayTop(c, lt, z = 1) { c.save(); c.translate(960, 540); c.scale(z, z); c.translate(-960, -540); tatamiTop(c, -200, -200, 5, 4, 560, 440, {}); c.beginPath(); c.roundRect(380, 180, 1160, 720, 20); fo(c, '#3a2616', 6); c.beginPath(); c.roundRect(410, 210, 1100, 660, 14); fo(c, '#5a3a22', 3);
  riceBowl(c, 700, 640, 1.6, { steam: lt }); misoBowl(c, 1180, 640, 1.6); pickleDish(c, 760, 380, 1.4); driedFish(c, 1200, 380, 1.4); chopsticks(c, 560, 820, -.05, 1.6); c.restore(); }
SH(216.30, '06 Frühstück von oben', { ang: 'overhead', tr: { type: 'shoji', dur: .5 }, sfx: [[0, 'shoji', -10], [0.6, 'bowlSet', -12]], amb: 'morning' }, (c, lt) => { trayTop(c, lt, push(lt, 1.9, 1, 1.06)); vignette(c, .35); });
SH(218.20, '06 Natürlich: Reis', { ang: 'macro', sfx: [[0.3, 'chopsticks', -10]], amb: 'morning' }, (c, lt) => {
  fill(c, '#4a3220'); riceBowl(c, 960, 900, 4.2, { steam: lt }); const k = ease(seg(lt, .2, 1.2)); chopsticks(c, 1500 - k * 300, 500 + k * 120, 2.8, 2.4); vignette(c, .4);
});
SH(220.10, '06 Miso und eingelegtes Gemüse', { ang: 'macro', sfx: [[0.2, 'slurp', -16]], amb: 'morning' }, (c, lt) => {
  fill(c, '#4a3220'); misoBowl(c, 700, 860, 3.2); pickleDish(c, 1350, 840, 3.0); for (let i = 0; i < 5; i++) { const ph = (lt * .5 + i / 5) % 1; circ(c, 680 + Math.sin(ph * 6 + i) * 30, 600 - ph * 300, 20 + ph * 40); c.fillStyle = `rgba(255,255,255,${.25 * (1 - ph)})`; c.fill(); } vignette(c, .4);
});
SH(222.00, '06 Noah isst', { ang: 'medium', sfx: [[0.4, 'chopsticks', -12]], amb: 'morning' }, (c, lt) => {
  roomSet(c, cam(960, 560, 1.25), lt, { tod: 'day' }); NF(c, 960, 1100, .5, { seiza: true, swords: false, haori: false, expr: ex('calm', lt, 36, { down: .8 }), arms: { l: { a: .5, b: -1.5 }, r: { a: .7, b: -1.7 } } });
  c.beginPath(); c.rect(720, 980, 480, 30); fo(c, '#3a2616', 4); riceBowl(c, 900, 985, .5); misoBowl(c, 1040, 985, .5); vignette(c, .35);
});
SH(223.80, '06 Getrockneter Fisch', { ang: 'macro', sfx: [[0.2, 'plate', -14]], amb: 'morning' }, (c, lt) => { fill(c, '#4a3220'); c.save(); c.translate(960, 600); c.rotate(-.1 + lt * .03); driedFish(c, 0, 200, 5); c.restore(); vignette(c, .4); });
SH(225.80, '06 Fleisch? Kaum.', { ang: 'overhead', sfx: [[0.4, 'brush', -10], [1.0, 'brush', -8]] }, (c, lt) => {
  trayTop(c, lt, 1.0); NOTE(c, lt, 'Fleisch', 1580, 260, .3, { size: 72, under: false }); MARK(c, lt, 'strike', [1460, 250, 1700, 210], 1.0, { w: 14 }); vignette(c, .35);
});
SH(227.90, '06 Der Reis in der Schale', { ang: 'macro', sfx: [[0.6, 'riceGrain', -14]], amb: 'morning' }, (c, lt) => { fill(c, '#3a2616'); c.save(); c.translate(960, 760); c.scale(1 + lt * .08, 1 + lt * .08); riceBowl(c, 0, 200, 4.6); c.restore(); vignette(c, .4); });
SH(229.80, '06 Match-Cut: Reissäcke im Speicher', { ang: 'wide', tr: { type: 'match', dur: .3 }, sfx: [[0.1, 'thud', -12]], amb: 'storehouse' }, (c, lt) => { storehouseSet(c, cam(960 + lt * 30, 560, 1.05), lt); vignette(c, .4); });
SH(231.10, '06 T6 Lohn in Reis', { ang: 'table', tr: { type: 'scroll', dur: .6 }, sfx: [[0, 'scroll', -8], [0.3, 'brush', -14], [0.8, 'hanko', -10], [0.7, 'brush', -14], [1.3, 'brush', -16], [1.6, 'brush', -16], [2.2, 'counter', -14]] }, (c, lt) => tLohnReis(c, lt));
SH(236.00, '06 Reicher Samurai: Berge von Reis', { ang: 'low', tr: { type: 'mist', dur: .4, col: '210,190,160' }, sfx: [[0.3, 'thud', -14]], amb: 'storehouse' }, (c, lt) => {
  storehouseSet(c, cam(960, 500, 1.15), lt, { sacks: 40 }); PF(c, 'merchant', 1500, 1200, .5, { pal: { col: '#6b2430', dark: '#4a1820', light: '#8e3a44', obi: '#c9a24a' }, expr: ex('focus', lt, 37) }); vignette(c, .4);
});
SH(239.00, '06 Armer Samurai muss rechnen', { ang: 'medium', sfx: [[0, 'soroban', -10]], amb: 'storehouse' }, (c, lt) => {
  storehouseSet(c, cam(960, 560, 1.3), lt, { sacks: 3 }); ambient(c, 'night'); andon(c, 1400, 1000, .8, lt);
  NF(c, 960, 1150, .5, { seiza: true, swords: false, haori: false, outfit: 'ronin', hair: 'chonmage', expr: ex('sad', lt, 38, { down: 1 }) }); soroban(c, 960, 1110, .6, lt * 2); vignette(c, .5);
});
