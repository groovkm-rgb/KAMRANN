// Cast for "Tea at the Café". Every look is just data: change colours / styles here.
const CAST = {
  // older gentleman: grey hair, walrus moustache, flat cap, knitted vest
  ali: defChar({
    skin: 'tan', eyes: 'dot', brows: 'thick', browColor: '#6b6466', nose: 'round', seed: 1,
    hair: { style: 'short', color: 'grey' }, facial: { style: 'walrus', color: 'grey' },
    hat: { style: 'flatcap', color: '#6b5a4a' },
    top: { style: 'vest', color: '#5a4a3e', inner: '#e9e2d0' }, pants: '#4a4a55',
  }),
  // his friend: long chestnut hair, orange sweater
  zeynep: defChar({
    skin: 'light', eyes: 'big', lashes: true, blush: true, lips: '#b8344f', seed: 2,
    hair: { style: 'long', color: 'chestnut' },
    top: { style: 'sweater', color: '#e8833a' }, pants: '#3a4a6a',
  }),
  // the çaycı (tea waiter): neat side-part, pencil moustache, white shirt, dark apron, bow tie
  waiter: defChar({
    skin: 'olive', eyes: 'big', seed: 3,
    hair: { style: 'side', color: 'black' }, facial: { style: 'thin', color: 'black' },
    top: { style: 'apron', color: '#f4f1ea', inner: '#3a3036' }, neck: { style: 'bowtie', color: PAL.maroon }, pants: '#2d2730',
  }),
};
