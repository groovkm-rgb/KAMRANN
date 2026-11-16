const TABLE = { x: 150, top: -280, w: 320 };
function homeTable(c, t, glass) {
  PROPS.table(c, TABLE.x, { top: TABLE.top, w: TABLE.w, legs: 'pedestal', color: '#8a5a3a' });
  PROPS.teapot(c, TABLE.x + 90, TABLE.top + 4, { color: '#c9473a' });
  PROPS.plate(c, TABLE.x - 10, TABLE.top + 6, { simit: true });
  if (glass) PROPS.teaglass(c, TABLE.x - 148, TABLE.top + 8, { fill: .85, spoon: true });
}
