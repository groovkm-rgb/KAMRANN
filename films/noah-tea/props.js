// Sprite placement: SC world units per sprite pixel; sprite pixel y=200 sits on the table top.
const SC = 2.0, TABLE = { x: 0, top: -280, w: 480 };
const SPR_Y0 = TABLE.top - 222 * SC;
// head-centre x in each crop (px), so both sprites line up
const SPR_CX = { happy: 73, think: 69 };
function drawNoah(c, name, bob = 0) {
  const img = SPRITES[name];
  c.drawImage(img, -SPR_CX[name] * SC, SPR_Y0 + bob, img.width * SC, img.height * SC);
}
// world position of a point given in sprite pixels
const sprPt = (name, px, py, bob = 0) => [(px - SPR_CX[name]) * SC, SPR_Y0 + py * SC + bob];
function homeTable(c, t, glass) {
  PROPS.table(c, TABLE.x, { top: TABLE.top, w: TABLE.w, legs: 'pedestal', color: '#8a5a3a' });
  PROPS.teapot(c, TABLE.x + 175, TABLE.top + 4, { color: '#c9473a' });
  PROPS.plate(c, TABLE.x - 120, TABLE.top + 6, { simit: true });
  if (glass) PROPS.teaglass(c, TABLE.x + 50, TABLE.top + 8, { fill: glass.fill ?? .85, spoon: true });
}
