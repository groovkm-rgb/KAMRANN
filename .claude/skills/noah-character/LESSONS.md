# Lessons from user feedback (read BEFORE every film, extend AFTER every feedback)

Each entry: the mistake the user found → the rule that prevents it. When the user reports a new problem, fix it and
add an entry here in the same turn (and commit). Never delete entries.

## Camera, framing, space

1. **Scenes "too far away"** (Mauerfall, first set test) → Default to medium/close shots (cam z ≥ 1.2). Noah's head
   should be at least ~1/4 of the frame height in story shots. Use foreground occluders (`nearLayer`) and
   over-the-shoulder framing instead of wide establishing shots. Use at most one wide shot per location.
2. **Ground details stuck to the screen while the camera/Noah moves** (pavement stones did not move) → Every
   procedural detail (cobbles, leaves, litter, grain, mottle, puddles, grass, graffiti) must be anchored to WORLD
   coordinates: iterate fixed world cells (`perChunk(x0,x1,C,fn)`, `Math.floor(x/cell)`), seed from the cell index,
   and never from screen position or `visX` bounds. Test with a 2-frame pan: the details must shift with the ground.
3. **Engine layer formula enlarged far layers** at low zoom (facades ~30% too big) → Use the zoom-lens parallax
   `layerZ/baseZ/visXZ` (films/mauerfall-lib/tex.js), not a dolly-like scale.
4. **Real-world scale**: 1 m ≈ 220 units. Check doors, cars, tram, chairs and Noah against this before rendering.

## Motion

5. **Noah walked backwards on the stairs** → The facing sign `s` must match the direction of travel
   (x decreasing ⇒ s:-1). For every walk/run shot, check the first and last frame: do the feet lead in the direction he
   moves? Going down/up must also match the stair slope.
6. **Tree branches twitched too fast** → Sway must be slow (≈0.9 rad/s, amplitude ≈0.012 rad, decreasing toward the
   trunk). The random shape must come from a stable per-branch id, never from `Math.random()` or from frame time.
   Nothing in the background may flicker between frames.

## Story, intro, timing

7. **Boring/dark first seconds** → The first 5 seconds must hook: Noah in frame 1, a close-up, an event (flash, sound
   hit, eyes snap up), then a fast push-in or whip-pan reveal. Never open dark, empty, or on an object alone.
8. **Sound didn't match the scenes** → With a voice-over, align the script to the MP3 first (silence detection plus
   syllable DP, `cartoon-short-kit tools/timing.py`). Cut shots on the phrase boundaries, and fire each SFX on
   the phrase/action it illustrates.

## Sound

9. **"Bad sound, weird noise in the background"** → No noise beds (wind, crowd hiss, room tone). Use short, clean,
   synthesized sounds only, following the proven `cartoon-short-kit/example/*/audio.py` method. Music stays ≥ 26 dB under the
   voice and is mostly absent. Final mix: -16 LUFS, peak ≤ -1 dBFS. Claude cannot listen, so verify numerically and tell
   the user.

## Text and drawing bugs

10. **"undefined" painted on the wall** (graffiti word index went negative for negative world chunks) → Any
    array index derived from a world cell/seed must wrap: `arr[((i % n) + n) % n]`. Before delivering, grep the
    rendered stills for this. Better: keep any string drawing behind a helper that refuses `undefined`.
11. **Mirrored text** (tram destination drawn inside an `s:-1` scale) → Draw text after undoing the flip.
12. **On-screen text** is German with correct ä ö ü ß and German number format. Don't subtitle the narration unless asked.

## Workflow

13. The user wants speed. When they say "hızlı bitir / yazı yazma", answer in 1–2 lines and keep working.
14. If the user says to go straight to the full video, skip draft approvals. Re-render only the parts that changed
    if possible. Run 4 parallel parts (see films/mauerfall/work/render_part.cjs and finish.sh).
15. Before delivering, check a contact sheet (one frame per shot) for: Noah facing/walking direction, text bugs,
    off-frame characters, and empty/dark frames.

## Reusable code from earlier films

- `films/mauerfall-lib/`:
  - `tex.js`: world-anchored textures, zoom-lens parallax, `nearLayer`, `bareTree`.
  - `noah89.js`: Noah in 1989 clothes, front and side views.
  - `folk.js`: generic people.
  - `vehicles.js`: 3/4 extruded cars and tram.
  - Sets: `ost.js`, `flat.js`, `presse.js`, `bridge.js`, `tor.js`, `sets2.js`.
  - `ui.js`, `docs.js`: overlays.
- `films/mauerfall/kit.js`: location kits, expressions, camera helpers, `PT()` phrase timing.
- `films/mauerfall/audio.py`: cue-based SFX/music mix.
- `films/mauerfall-thumb/thumb.js`: YouTube thumbnail made from a film set plus big outlined title text.
