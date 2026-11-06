---
name: art-deco-noir-shorts
description: Produce silent vertical (9:16, 1080x1920, 24 fps) 2D animated shorts in a dark 1990s Gotham-inspired Art Deco film-noir style — angular cel-shaded characters, bold shadows, rim light, plum/burgundy/amber palette, parallax camera, rain, smoke, lightning — rendered with HTML Canvas and exported as a frame-exact MP4 with no audio and no on-screen text. The recurring star is a mafia boss (square jaw, slicked black-and-grey hair, purple pinstripe suit, cream scarf, red gem ring, optional cigar and glasses). Use this skill whenever the user asks for a short animated video, a YouTube Short / Reel / TikTok-style vertical animation, a silent story clip, "Art Deco tarzında video", "2D animasyon", "9:16 video", "sessiz video", "noir animasyon", a cartoon of a story or historical event, or another video "in the same style" as the mafia / Green Vault / well films — even if they do not say Art Deco or noir explicitly.
---

# Art-Deco noir shorts

You turn a short story into a finished, silent, vertical animated film: a self-contained HTML
animation plus an MP4. The visual system — characters, lighting, sets, FX, camera, transitions,
player, recorder — already exists in `assets/engine/`. Your job is direction: write the shots
for the story in one `scenes.js`, look at the frames, fix what looks wrong, render, deliver.

Talk to the user in their language (they often write Turkish). Keep code comments in English.

## Fixed house rules (why they matter)

- **9:16, 1080x1920, 24 fps, exact duration.** Shorts platforms crop anything else; the
  timeline is built on these numbers.
- **No audio unless the user asks for sound effects.** If they want SFX, keep the HTML silent,
  synthesize a WAV offline from the same cue timeline the picture uses, and mux it with `render_mp4.mjs --audio sfx.wav`
  (see `films/zaman-yolcusu/sfx.mjs` in the repo for a narrator-safe mix at about -22 LUFS).
- **No text in frame** (no titles, captions, signs, numbers on props,
  watermarks). The audience reads the story from images alone, and the user explicitly wants
  text-free videos. Never call `fillText`; draw marks as shapes, never letters.
- **Same look every time.** Reuse the engine's palette (plum, charcoal, burgundy, amber),
  `mkLight` lighting, rim lights, film grain and transitions. Don't introduce new styles,
  fonts, photos or bright saturated colours.
- **The boss is the default protagonist.** Unless the story clearly needs someone else, the
  main character is the mafia boss (`who: 'boss'`, `HEAD.boss`, `OUTFIT.boss`): purple pinstripe
  suit, cream scarf, red ring. Give him his cigar (`cigar: true`) in most shots and glasses
  (`glasses: 'round'` or `'shades'`) when it suits the scene. Other people are supporting cast
  (`HEAD`/`OUTFIT` presets) — at most two prominent characters per shot.
- **Deterministic.** Everything is a function of time; no `Math.random`, no real clocks. This is
  what makes seeking, the verifier and the frame-exact MP4 possible.
- **Coherent anatomy.** No missing, hidden, stretched or floating limbs; hands must hold what
  they hold. The rig now guards most of this (see `references/qa-checklist.md`), but you still
  must look at frames — every past defect was caught by looking.

## Workflow

Scripts live in `scripts/` next to this file (call them with `node <skill>/scripts/...`).
They need Node 18+, ffmpeg, and Playwright with Chromium (`npm i -D playwright && npx playwright
install chromium` if `require('playwright')` fails). Work in the user's repo or a folder they name;
otherwise create `films/<slug>/`.

1. **Shot list first.** Turn the story into 3–6 shots that tile the duration exactly (the user
   gives the length; default 15–20 s for a sample, ≤60 s for Shorts). For each shot decide:
   location, camera move (push, truck, tilt, pull-back), who is in it, the one action, and the
   lighting. Prefer cross-section and silhouette ideas that suit a tall frame (wells, towers,
   staircases, windows). Mention the plan to the user in a few lines, then proceed — don't wait
   unless something is genuinely ambiguous (e.g. two different durations in the request: pick the
   one the detailed timings support and say so).

2. **Scaffold:** `node scripts/new_film.mjs <dir> --title "…" --duration <s>` → `film.json` and a
   working two-shot `scenes.js` starring the boss. Build it once to see the baseline.

3. **Write `scenes.js`.** Read `references/api.md` (the engine API, cast, lights, sets, FX and
   proven shot recipes) before writing. Good references to borrow from — read only the parts you
   need, they are long:
   - `assets/examples/the-well.scenes.js` — compact 18 s film: digging cycle with a two-handed
     tool, cross-section shaft, water, ladder climb, seated celebration, Deco sunrise.
   - `assets/examples/mafia-boss.scenes.js` — office, conference table in one-point perspective,
     restaurant, OTS close-ups, long shadows, window and lightning, eye-light ECU.
   - `assets/examples/green-vault.scenes.js` + `assets/library/museum-dresden.js` — exterior
     architecture, museum interior, jewels, silhouettes, evidence board, courthouse, gavel.
   Put film-only helpers/props in `<dir>/sets.js` (built before `scenes.js`). To reuse the museum
   library add `"libraries": ["museum-dresden"]` to `film.json`.

4. **Anatomy sheet for any new character:** `node scripts/rig_sheet.mjs <out.png> <who> --film <dir>`
   and look at it. It shows every core pose on one image.

5. **Build and look:** `node scripts/build_film.mjs <dir>` then
   `node scripts/snap.mjs <dir> <snapdir>` (3 frames per shot, plus a contact sheet). Open the
   sheet *and* crops of faces/hands at full size. Go through `references/qa-checklist.md` and fix
   every defect, then snap again. Expect 2–4 rounds; this step is where quality comes from.

6. **Verify:** `node scripts/verify_film.mjs <dir>` must print `all checks passed`.

7. **Render:** `node scripts/render_mp4.mjs <dir> [out.mp4]` — every frame rendered headlessly,
   H.264, exact frame count, no audio stream; it prints an ffprobe summary. Run long renders in
   the background and wait for them; never commit or send a half-written MP4. Then extract a
   few frames from the MP4 itself with ffmpeg and look at them.

8. **Deliver:** send the MP4 with the available file tool (e.g. `SendUserFile`), and report
   duration, size, frame count, "no audio stream", what each shot shows, which defects you
   fixed, and anything you could not verify. If working in a git repo, commit the film folder
   (and the MP4 if reasonably small, < ~50 MB) and push when the session expects it.

## Output layout

```
<dir>/film.json        title, slug, duration, fadeOut, libraries
<dir>/scenes.js        shots + SCENES/TRANS master timeline (+ optional sets.js)
<dir>/film.html        built, self-contained player (opens in any browser, has Record button)
<dir>/<slug>.mp4       the rendered film
```

## When the user asks for changes

Edit `scenes.js`, rebuild, re-snap only the affected shots (`snap.mjs <dir> <out> 3.5 7.2`),
verify, re-render. If the user reports a rig defect (like a missing leg), fix it in the engine
(`assets/engine/04-body.js` / `03-head.js`), confirm on the rig sheet, and say that it now holds
for every character. If they say not to re-render, don't.
