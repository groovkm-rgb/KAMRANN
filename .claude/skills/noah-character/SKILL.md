---
name: noah-character
description: The user's own character NOAH (white round head, dot eyes, swept-back dark brown hair, black t-shirt with "Noah" lettering, white arms, striped brown trousers, gold watch on his left wrist, dark shoes), coded as a canvas rig measured from the user's reference sheet. Use whenever the user asks for a video, animation, short or scene with "Noah", "bu karakter", "Noah şunu yapsın" (e.g. "Noah uyumaya gitsin", "Noah çay içsin"), in any orientation. Overrides the look of other character rigs: never redraw Noah with the toon-shorts defChar rig or the noah-skill storybook Noah.
---

# Noah (the user's character)

`reference.jpg` is the user's character sheet (front, side, 3/4, expressions, pointing, walking).
`noah.js` draws Noah from numbers measured on that sheet's FRONT figure. The user has said the
head shape, hair and lines must stay as on the sheet, so:

- **Never change the proportions in `NOAH` / `noahHeadLocal`** to fit a scene. Scale with `k`.
- After any edit to `noah.js`, put the rig next to the reference and compare (draw the
  reference crop `(110,20,280,420)` scaled ×4 beside `drawNoah({k:1})`); fix differences, not the reference.
- The "Noah" lettering on the shirt is part of his design (drawn as strokes, no fonts), even in
  films whose house rules forbid on-screen text.

## API (global functions; world units, feet on y = 0, up is negative)

```js
drawNoah(c, { x, y, k: .5, s: 1, arms, expr, tilt, bob, lean })   // full body, front view; k=.5 → ~763 tall
drawNoahHead(c, x, y, k, expr, tilt)                                // head only, (x,y) = head centre (in bed, peeking)
drawNoahHand(c, x, y, k, ang)                                       // a loose hand (on a blanket, a table edge)
```
- `arms: { l: { a, b, hand }, r: {...} }` — `a` shoulder angle from straight down (+ = outward, ~2.45 = up),
  `b` elbow bend added to `a`. Default relaxed: `{ a: .13, b: -.08 }`. Watch is on `r` (viewer's right).
- `expr`: `eyes: 'open' | 'closed'`, `lid` 0..1 (sleepy), `look` −1..1, `browUp` 0..1,
  `mouth: 'smile' | 'soft' | 'flat' | 'o' | 'yawn'`, `open` 0..1 for the yawn.

## Using it in a film (toon-shorts engine)

Add the module before the film's own files in `film.json`:
```json
"modules": ["../../.claude/skills/noah-character/noah.js", "props.js", "scenes.js"]
```
Draw Noah from `behind` / `front` functions (e.g. `behind: [c => drawNoah(c, {...})]`); sets, props,
FX, camera, build/snap/verify/render all come from the toon-shorts skill. Example: `films/noah-sleep/`.

## Not covered yet

Front view only. Side / 3/4 / walking views and the sheet's angry/confused/thinking/pointing
poses are not coded yet — measure them from `reference.jpg` the same way before using them,
and say so to the user rather than improvising a different-looking Noah.
