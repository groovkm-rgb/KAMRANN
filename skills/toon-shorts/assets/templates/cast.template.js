// The cast: one defChar per person. Every field is listed in references/api.md (section 2).
const CAST = {
  a: defChar({
    skin: 'light', eyes: 'big', blush: true, seed: 1,
    hair: { style: 'short', color: 'brown' },
    top: { style: 'tshirt', color: PAL.teal }, pants: PAL.denim,
  }),
  b: defChar({
    skin: 'brown', eyes: 'big', lashes: true, lips: '#b8344f', seed: 2,
    hair: { style: 'bun', color: 'black' },
    top: { style: 'dress', color: PAL.mustard },
  }),
};
