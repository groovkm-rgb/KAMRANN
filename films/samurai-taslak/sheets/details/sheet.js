const bg = c => { fill(c, '#3a2a1c'); washi(c, 30, 30, W - 60, H - 60, { shadow: 0, seed: 2 }); };
const lab = (c, s, x, y, ax, ay, o = {}) => { brushArrow(c, x + (o.dx || 0), y - 14, ax, ay, 1, { w: 6, bend: o.bend || .2 }); brushText(c, s, x, y, o.size || 38, 1, { font: UI.fontBody, align: o.align || 'center' }); };
const E = { lid: .25, mouth: 'flat' };
defineShots([
  // (a) proportions: original rig + 4 outfits on one baseline with guide lines
  { name: 'outfits', dur: 1, draw(c) {
    bg(c);
    const k = .5, base = 990, guides = [[-1502, 'Kopf oben'], [-1215, 'Augen'], [-915, 'Schultern'], [-510, 'Saum']];
    for (const [y, n] of guides) { c.setLineDash([10, 10]); stroke(c, [60, base + y * k, 1860, base + y * k], 2, 'rgba(160,40,30,.5)'); c.setLineDash([]); }
    drawNoah(c, { x: 200, y: base, k, ink: 1.6, expr: { mouth: 'smile' } }); brushText(c, 'Original', 200, 1045, 34, 1, { align: 'center' });
    [['samurai', 'Alltag'], ['armor', 'Rüstung'], ['ronin', 'Rōnin'], ['edo', 'Edo-Beamter']].forEach(([of, n], i) => {
      const x = 560 + i * 380; drawSam(c, { x, y: base, k, ink: 1.6, outfit: of, expr: E, flag: false }); brushText(c, n, x, 1045, 34, 1, { align: 'center' }); });
    for (const [y, n] of guides) { c.font = '24px CaveatBrush'; const w = c.measureText(n).width; c.fillStyle = 'rgba(241,234,219,.9)'; c.fillRect(1876 - w - 8, base + y * k - 28, w + 12, 30); brushText(c, n, 1876, base + y * k - 6, 24, 1, { font: UI.fontBody, align: 'right', col: '#8a2a20' }); }
  } },
  // (b) katana + wakizashi labelled
  { name: 'swords', dur: 1, draw(c) {
    bg(c);
    const tw = brushText(c, 'Das Schwert', 90, 130, 64); hanko(c, 90 + tw + 50, 104, 60, 1, 'S');
    c.save(); c.translate(150, 300); c.scale(1.62, 1.62); drawSword(c, { kind: 'katana', naked: true, sheath: false }); c.restore();
    c.save(); c.translate(541, 500); c.scale(1.62, 1.62); drawSword(c, { kind: 'katana', sayaOnly: true }); c.restore();
    c.save(); c.translate(150, 760); c.scale(1.62, 1.62); drawSword(c, { kind: 'waki' }); c.restore();
    brushText(c, 'Katana (lang)', 1840, 430, 44, 1, { align: 'right', font: UI.fontNote });
    brushText(c, 'Wakizashi (kurz)', 1300, 880, 44, 1, { align: 'right', font: UI.fontNote });
    drawTsubaFace(c, 1640, 790, 140, { light: .4 }); brushText(c, 'Stichblatt von vorn', 1640, 985, 34, 1, { align: 'center', font: UI.fontBody });
    lab(c, 'Griff (Tsuka)', 250, 190, 250, 282);
    lab(c, 'Rochenhaut', 200, 430, 205, 322, { size: 34 });
    lab(c, 'Griffwicklung (Ito)', 430, 450, 400, 324, { bend: -.2 });
    lab(c, 'Stichblatt (Tsuba)', 560, 160, 527, 262);
    lab(c, 'Klingenzwinge (Habaki)', 880, 230, 560, 292, { bend: .1 });
    lab(c, 'Härtelinie (Hamon)', 1200, 190, 1110, 268, { bend: -.2 });
    lab(c, 'Klinge', 1500, 200, 1460, 262);
    lab(c, 'Scheide (Saya)', 1330, 590, 1250, 495);
    lab(c, 'Kordel (Sageo)', 960, 600, 860, 590, { bend: .2 });
  } },
  // (c) armour labelled
  { name: 'armour', dur: 1, draw(c) {
    bg(c);
    const tw = brushText(c, 'Die Rüstung', 90, 130, 64); hanko(c, 90 + tw + 50, 104, 60, 1, 'R');
    const x = 960, y = 1030, k = .4;
    drawSam(c, { x, y, k, ink: 1.5, outfit: 'armor', expr: E });
    const P = (ux, uy) => [x + ux * k, y + uy * k];
    const L = (s, tx, ty, ux, uy, al) => { const [ax, ay] = P(ux, uy); lab(c, s, tx, ty, ax, ay, { align: al, dx: al === 'right' ? -20 : al === 'left' ? 20 : 0 }); };
    L('Helm (Kabuto)', 520, 300, -200, -1450, 'right');
    L('Helmzier (Maedate)', 520, 200, -120, -1560, 'right');
    L('Nackenschutz', 500, 420, -330, -1160, 'right');
    L('Brustpanzer (Dō)', 520, 640, -60, -800, 'right');
    L('Seidenschnüre', 520, 760, -100, -690, 'right');
    L('Hüftschurz', 520, 880, -150, -470, 'right');
    L('Rückenfahne (Sashimono)', 1520, 200, 60, -1900, 'left');
    L('Schulterschutz (Sode)', 1460, 520, 230, -900, 'left');
    L('Armschutz (Kote)', 1460, 660, 240, -700, 'left');
    L('Oberschenkelschutz', 1460, 820, 160, -380, 'left');
    L('Beinschutz (Suneate)', 1460, 960, 110, -170, 'left');
  } },
]);
