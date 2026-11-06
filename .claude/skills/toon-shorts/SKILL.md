---
name: toon-shorts
description: Make silent vertical (9:16, 1080x1920, 30 fps) 2D cartoon shorts in a bright flat "round-head" style (big round heads, stick limbs, thick outlines, flat colours, blurred backgrounds, punchy camera) with HTML Canvas, exported as an MP4 with no audio and no on-screen text so the user can add their own voice-over. Any story, people or place: reusable character rig (skin, hair, hats, glasses, moustaches, outfits), poses (sit, drink, walk, wave, point, aim), props (cafe table, tea glasses, teapot, phone, gun...) and sets (cafe, street, park, room, office, western town). Use whenever the user asks for a cartoon, animated short, Shorts/Reels/TikTok video in this style or describes a scene to animate, e.g. "iki kişi kafede çay içiyor", "çizgi film yap", "animasyon video", "bu tarzda video", "sessiz video, sesi ben eklerim". For the dark Art-Deco noir mafia look use art-deco-noir-shorts instead.
---

# Toon shorts

You turn a one-line scene ("two people drink tea in a café") into a finished, silent, vertical
cartoon: a self-contained HTML animation plus an MP4. The look — rig, faces, outfits, props,
sets, FX, camera, depth-of-field, player — already exists in `assets/engine/`. Your job is
direction: invent the beats, cast the characters as data, write the shots, **look at frames**,
fix, render, deliver.

Talk to the user in their language (they often write Turkish). Keep code comments in English.

## House rules (why they matter)

- **9:16, 1080x1920, 30 fps, whole-frame duration.** Shorts platforms want exactly this.
- **No audio, no text in frame.** The user adds their own voice-over/music later, and the
  story must read from images alone. Never call `fillText`; signs, screens and newspapers are
  drawn as shapes/bars. No speech bubbles with words.
- **Same look every time.** Round heads (R=118), stick limbs, 8–9 px dark outlines (`OUT`),
  flat fills + one shade band, blurred background (`blur` 6–18), sharp characters. Don't
  import photos, fonts, gradients on characters, or a different drawing style.
- **Original characters only.** Design new people from the rig's options; never copy a
  specific existing show's characters, logos or scenes.
- **Deterministic.** Everything is a function of `t`. No `Math.random` (use `rnd(i)`), no
  clocks. That is what makes seeking, the verifier and the frame-exact MP4 work.
- **Timing sells the joke.** Hold a beat before the punchline, cut on action, use a quick
  push-in / ECU for tension and a wide shot to release it. Default length 15–20 s unless the
  user gives one (≤ 60 s).

## Workflow

Scripts are in `scripts/` next to this file (`node <skill>/scripts/...`). They need Node 18+,
ffmpeg and Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`
if `require('playwright')` fails; use a preinstalled Chromium if the environment has one).
Work in the user's repo or the folder they name; otherwise `films/<slug>/`.

1. **Beat sheet first.** Expand the user's line into 5–8 shots that tile the duration: setup →
   small escalation → payoff/gag → button. For each shot: set, camera (wide / two-shot /
   close-up / ECU / OTS, and its move), who is in it, the one action, the expression. Give the
   plan to the user in a few lines and proceed — only ask if something is truly ambiguous.
   A plain scene ("they drink tea") still needs a tiny story: a sip that's too hot, a spill, a
   refill, a toast. See `assets/examples/cafe-tea/` for exactly this.

2. **Scaffold:** `node scripts/new_film.mjs <dir> --title "…"` → `film.json`, `cast.js`,
   `scenes.js` (a working two-shot film). Build it once to see the baseline.

3. **Cast as data (`cast.js`).** One `defChar({...})` per person inside `const CAST = {…}`:
   skin, hair, hat, glasses, facial hair, top style/colours, neckwear, pants. Make the people
   in one film clearly different in silhouette and colour (hat vs long hair vs bald; warm vs
   cool tops). Check them: `node scripts/cast_sheet.mjs <dir> <out>` → one image per character
   in six poses. Look at every sheet.

4. **Write `scenes.js`.** Read `references/api.md` first (rig fields, pose state, arm presets,
   items, props, sets, FX, camera helpers, frame object, recipes). Film-only helpers go in
   `props.js`. Borrow from the examples — read only what you need:
   - `assets/examples/cafe-tea/` — seated two-shot at a café table, tea glasses + steam, hot-tea
     gag, waiter walking in and pouring from a held teapot, close-ups on seated people, toast.
   - `assets/examples/western-duel/` — staring contest, sweat, ECUs, quick-draw with recoil and
     muzzle flash, slow-motion bullet with speed lines, hat shot off and landing back on, aiming
     with `aimAt`, objects flying with simple physics.

5. **Build and look:** `node scripts/build_film.mjs <dir>` then `node scripts/snap.mjs <dir> <out>`
   (3 frames per shot + `sheet.jpg`). Open the sheet, then specific frames at full size for
   faces and hands. Go through `references/qa-checklist.md`, fix, snap again. Expect 2–4
   rounds; this is where quality comes from.

6. **Verify:** `node scripts/verify_film.mjs <dir>` must print `all checks passed`.

7. **Render:** `node scripts/render_mp4.mjs <dir> [out.mp4]` (≈10 fps on a laptop-class CPU;
   run long renders in the background and wait). It prints an ffprobe line — confirm one video
   stream, no audio, right frame count. Optionally pull a frame from the MP4 with ffmpeg and look.

8. **Deliver:** send the MP4 with the file tool (e.g. `SendUserFile`), and report length,
   size, what each shot shows, what you fixed after looking, and anything you didn't verify
   (e.g. "I checked sampled frames, not every frame"). Mention they can open `film.html` in a
   browser to scrub it. Commit/push if working in a git repo and the session expects it.

## Output layout

```
<dir>/film.json   title, slug, fps (30)
<dir>/cast.js     const CAST = { name: defChar({...}), ... }
<dir>/props.js    optional film-only helpers / props
<dir>/scenes.js   defineFilm({ shots: [{ name, dur, f(lt, T, t) { return frame } }] })
<dir>/film.html   built, self-contained player (scrub bar, shot buttons, save frame)
<dir>/<slug>.mp4  rendered film
```

## Changes after delivery

Edit `cast.js` / `scenes.js`, rebuild, re-snap only the affected times
(`snap.mjs <dir> <out> 4.2 7.9`), verify, re-render. To re-time for a voice-over, change the
shots' `dur` values (they tile automatically) — ask the user for the timings if they have the
audio. If a rig problem shows up (a limb, a hat, a face part), fix it in
`assets/engine/toon.js`, confirm on a cast sheet, and say that it now holds for every film.
