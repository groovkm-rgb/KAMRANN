// Cast for "Western Duel".
const CAST = {
  kid: defChar({
    skin: 'light', eyes: 'big', blush: true, freckles: true, seed: 1,
    hair: { style: 'tufts', color: 'ginger' }, top: { style: 'shirt', color: PAL.blue }, badge: 'star',
    belt: true, holster: true, grip: '#efe6cf',
  }),
  outlaw: defChar({
    skin: 'tan', eyes: 'dot', brows: 'thick', browColor: '#3b3036', scar: true, stubble: true, seed: 2,
    hair: { style: 'combover', color: '#6b5a5e' }, facial: { style: 'horseshoe', color: '#4a3c40' },
    hat: { style: 'cowboy', color: '#5a4636', band: '#b8362e' },
    top: { style: 'coat', color: PAL.charcoal, inner: '#d9cbb0' }, neck: { style: 'bandana', color: '#c8423a' },
    belt: true, holster: true, grip: '#6b3d22',
  }),
};
