# Noir Shorts: Canvas animation system

This repository holds two silent, vertical, 1080×1920 / 24 fps animated documentaries. Both are built on **one shared Art Deco noir animation system**: the same head rig, bodies, hands, palette, lighting, rim lights, FX, parallax camera, transitions and player. Each film is a single self-contained HTML file.

| Film | File | Length | Rendered MP4 |
|---|---|---|---|
| What Does a Mafia Boss Actually Do? | `index.html` | 55 s | `renders/what-does-a-mafia-boss-actually-do.mp4` |
| The Green Vault Heist · Dresden 2019 | `green-vault.html` | 40 s | `renders/green-vault-heist-dresden-2019.mp4` |

The sections below document the mafia film first. The Green Vault film is covered in its own section at the end.

---

# What Does a Mafia Boss Actually Do?

A 55-second vertical (9:16) animated documentary in a dark 1990s Gotham-inspired Art Deco style with 1940s film-noir lighting. It is rendered live in the browser with HTML, CSS, JavaScript and Canvas. Everything is in one self-contained file, `index.html`, with no libraries, network requests, audio or on-screen text.

| | |
|---|---|
| Duration | exactly **55.000 s** (1320 frames) |
| Frame | **1080 × 1920**, 9:16, design resolution |
| Frame rate | **24 fps** |
| Audio | **none**: no audio elements, no audio APIs, recordings contain no audio track |
| Text in frame | **none**: no titles, captions, subtitles or watermarks (`fillText` is never used) |

---

## 1. Run it

**Easiest:** double-click `index.html`. It opens in any modern browser (Chrome, Edge, Firefox or Safari) and starts playing automatically.

**Recommended:** serve the folder locally, which is needed to auto-load a reference image from `assets/`:

```bash
cd KAMRANN
python3 -m http.server 8000
# open http://localhost:8000
```

### Controls (all outside the video frame)

| Control | Action |
|---|---|
| **Play / Pause** | toggles playback (keyboard: **Space**) |
| **Replay** | restarts from 0:00 (keyboard: **R**) |
| Timeline slider | seeks to any time; the film is a pure function of time, so seeking is exact |
| Scene buttons 1–6 | jump to the start of each scene |
| **← / →** | step one frame (with **Shift**: one second) |
| **● Record video** | real-time browser recording (see §2) |
| **Save frame** | downloads the current frame as a 1080×1920 PNG |
| Resolution | Full 1080×1920 or a ½-resolution preview for slow devices |

The video always keeps its 9:16 composition and scales to the window. On phones the frame fills the screen width and the panel scrolls underneath it. If a device cannot keep up at full resolution, the **preview** switches to ½ resolution. The timeline stays in real time, so frames are dropped but never slowed down, and recording always renders at full resolution.

---

## 2. Record / export the video

### A. In the browser (MediaRecorder): one click, real time

1. Open the page and click **● Record video**.
2. Keep the tab visible for 55 seconds. The film is rendered frame by frame at 1080×1920 and 24 fps from its deterministic timeline.
3. A file downloads automatically:
   - **MP4 (H.264)** in browsers whose MediaRecorder supports it (current Chrome, Edge and Safari);
   - **WebM (VP9/VP8)** otherwise (for example in Firefox). To convert: `ffmpeg -i in.webm -c:v libx264 -crf 18 -pix_fmt yuv420p -an out.mp4`.

The recording is video only. The canvas stream has no audio track. MediaRecorder timestamps frames in real time, so smoothness depends on the machine rendering 24 fps at full resolution. If the status line reports late frames, use option B.

### B. Frame-exact MP4 (offline renderer): best quality

`tools/render-mp4.mjs` drives headless Chromium. It renders all 1320 frames exactly, one at a time, regardless of machine speed, and encodes a real MP4 with ffmpeg: H.264, yuv420p, 24 fps, 55.000 s, with **no audio stream**.

```bash
npm install                    # installs Playwright (dev dependency)
npx playwright install chromium
# ffmpeg must be on PATH (brew install ffmpeg / apt install ffmpeg / winget install ffmpeg)

npm run render                 # → renders/what-does-a-mafia-boss-actually-do.mp4
# or with options:
node tools/render-mp4.mjs out.mp4 --crf 16 --maxrate 0   # uncapped master (very large: the grain changes every frame)
node tools/render-mp4.mjs out.mp4 --png             # lossless frames into the encoder
node tools/render-mp4.mjs out.mp4 --from 44 --to 55 # render a section
node tools/render-mp4.mjs out.mp4 --ref assets/boss.png --fx 0.5 --fy 0.36 --fh 0.42
```

`renders/what-does-a-mafia-boss-actually-do.mp4` (31 MB) was made with this script. It was first rendered as an uncapped CRF 20 master and then re-encoded in two passes at 4.5 Mbit/s so it is small enough to keep in the repository and share. It is H.264, 1080×1920, 24 fps, 1320 frames, exactly 55.000 s, with no audio stream.

---

## 3. The main character and the reference image

The boss is the same character in every scene. He is built from one reusable **head rig** and shared body, hand and costume components with fixed proportions and the specified design:

- square jaw and heavy brow, with a cold, intimidating stare;
- slicked-back black hair, grey at the temples;
- broad padded shoulders and a **dark purple** pinstripe suit;
- a **cream scarf** and a **cigar** with a glowing ember and rising smoke;
- a **red gemstone ring** on his right hand.

**About the uploaded image:** no image file reached this project. The repository and the upload folders were empty when it was built, so the drawn character above was matched to the written description. To use your reference portrait:

1. **Picker (works when you open the file by double-clicking):** in the panel, open **Reference portrait** and choose the image.
2. **Auto-load (needs a local server):** save it as `assets/boss.png` (or `.jpg`/`.webp`) and serve the folder as in §1.
3. Use the **Face centre X/Y** and **Face height** sliders (fractions of the image size) so the face sits correctly in the frame. They can also be set with URL parameters, e.g. `?fx=0.5&fy=0.36&fh=0.42`.

How the image is used: it is kept intact. It is not cut into fake rig parts. It is colour-graded to the noir palette, vignetted into darkness and moved with the camera, and rain shadows, smoke and lightning are layered over it. It replaces the drawn boss in the **close-up shots**: the end of scene 2, the boss close-up in scene 4, the stern close-up in scene 5 and the final eye close-up in scene 6. The wide and medium shots keep the matched drawn character, so the staging, posture and action still work. Click **Remove** to go back to the drawn boss.

> Note: opening the page from `file://` and auto-loading an image from disk would "taint" the canvas, and browsers then block recording. That is why auto-load runs only over `http://`; the file picker works in both cases.

---

## 4. Master timeline

| # | Time | Scene | Shots & action |
|---|---|---|---|
| 1 | **0–7 s** | Introduction: the boss | Midnight Art Deco office. Rain runs down a sunburst-arched window over the city. Two fedora-wearing bodyguards stand in the shadows with hands clasped, and wall sconces fan light up the walls. The boss sits in a tall tufted chair behind a massive fluted desk with a brass lamp. Cigar smoke rises and lightning flickers at 1.55 s. The camera starts wide and **zooms continuously toward his face** (z 1.0 → 2.55). He **lifts his head (3.3–5.5 s) and stares into the lens**, and his eyes catch the light. |
| 2 | **7–16 s** | Managing the organisation | **Wide, one-point perspective** conference room with a sunburst relief behind the boss like a halo. Four lieutenants are seated, and the camera makes a **slow horizontal truck** with real parallax as the table shears. A lieutenant **rises, steps up and places a sealed folder** in front of the boss, then sits back. **Insert (11.8 s):** the folder opens to show papers, a surveillance photo and a red emblem, and the ringed hand slides the photo. **Medium (13.2 s):** the boss looks up and gives a **small two-finger commanding gesture**, and a lieutenant nods. The camera **pushes in to a close-up** that holds until 16 s. |
| 3 | **16–25 s** | Controlling the money | **Top-down insert** of a golden lamp-lit desk with a ledger, banded cash, sealed envelopes, coins, a pen and a smoking cigar. The camera pushes to a **close-up of the red gemstone ring**, which glints as the hand **turns a page**. The shadow of a ceiling fan sweeps across. **Front shot (20.2 s):** the camera **pans up from the ledger to the boss's face** under venetian-blind light. A **nervous accountant** with glasses and a sweating brow spins his hat in the background, and the boss's eyes slide coldly toward him. |
| 4 | **25–34 s** | Managing disputes | Restaurant after closing time, with chairs upturned on the tables, rain on arched windows and a checkerboard floor. **Medium two-shot:** the boss sits upright and lit while the **rival hunches** in sickly light, and bodyguards stand behind. **Close-up of the rival:** darting eyes, sweat and a finger tugging at his collar. **Medium shot over the rival's shoulder:** the boss **calmly places his hand flat on the tablecloth**, the ring catches the light, and the rival's coffee ripples. Then a tense pause. **Low-angle close-up of the boss** with half his face in shadow and smoke drifting past. No speaking and no violence. |
| 5 | **34–44 s** | Loyalty and authority | The boss stands beside a tall window looking out. The door opens and amber hallway light spills in. A **nervous lieutenant walks in with a sealed envelope**, places it on the desk and steps back. The boss **slowly turns** toward him. Headlights sweep through the window, and the boss's **long shadow stretches across the floor and looms huge on the wall** while the lieutenant **lowers his head**. **Close-up (41.2 s):** the camera **slowly moves in** on the boss's stern face, with rain shadows sliding down it. |
| 6 | **44–55 s** | The price of power | He stands alone before an enormous Art Deco window over a vast skyline: heavy rain, searchlights and a blimp. **Lightning** strikes at 46.2 s and again at 49.85 s and lights up the towers. The camera **starts behind him and slowly dollies closer**, and he **turns his head to reveal his rim-lit profile** (48.5–50.6 s). **Extreme close-up of his eyes (51.2 s)** in a classic noir eye-light band, with rain shadows on his skin. The image **fades to complete black: the last frame (54.958 s) and 55.000 s are pure black.** |

Transitions are centred on the scene boundaries, so every scene still starts exactly on time: a cross-dissolve at 7 s, 25 s and 44 s, and a dip to black at 16 s and 34 s. The film fades in from black during 0–1.1 s.

---

## 5. How it is built

- **Deterministic timeline.** `renderFrame(t)` is a pure function of time. Rain, smoke, flicker, grain and lightning come from integer hashes and value noise, never `Math.random`. Playback uses `requestAnimationFrame` with a real-time clock, so pausing, seeking, replaying and the offline renderer all give identical frames for the same `t`.
- **Keyframe tracks and easing.** `track(t, keys)` interpolates numbers or objects between keys, and each key can have its own easing (sine, quad, cubic, quint, expo, back, smooth-step). `prog(t, a, b, ease)` and `pulse()` drive individual actions.
- **Parallax camera.** `setCam(ctx, cam, depth)` applies pan, zoom and roll per layer. Far layers (sky, three pre-rendered procedural Deco skylines) move less and nearer layers (desk, curtains, foreground figures) move more. Floors and the conference table are projected per vertex with their own depth, so a horizontal truck shears them correctly.
- **Characters.** One **head rig** is shared by every character. Stacked super-elliptic cross-sections give a silhouette for any yaw and pitch, and the features are placed on that surface. Everything is painted as flat 2-D cel shapes: one lit tone, one multiply shadow with a hard terminator, and rim light. Presets create the boss, rival, accountant, lieutenants and bodyguards. Bodies, hands with articulated fingers, and costumes are reusable components with fixed proportions.
- **Atmosphere.** Falling rain in several layers, rain beads and running rivulets on the glass, moving rain shadows, cigar smoke ribbons and puffs, haze, dust in light beams, searchlights, forked lightning, a blimp and flickering windows.
- **Film look.** A split-tone grade, vignette, animated grain, dust specks, occasional scratches and gate flicker.
- **Performance.** Skylines and textures are pre-rendered once. Each frame is about 8 ms of JavaScript, and the rest is rasterisation, which hardware-accelerated canvas handles easily. Slow devices fall back to a ½-resolution preview automatically.

### Project structure

```
index.html              ← mafia film (generated, self-contained)
green-vault.html        ← Green Vault film (generated, self-contained)
src/01-core.js          math, easing, keyframe tracks, noise, colour, paths, camera
src/02-fx.js            textures, rain, glass rain, smoke, lightning, skylines, post FX
src/03-head.js          the head rig + character presets + light presets
src/04-body.js          bodies (seated/standing/side), hands, ring, props
src/05-sets.js          Art-Deco windows, walls, sconces, desk, chairs, chandelier, floors
src/05b-scene-kit.js    shared scene helpers (shafts, bokeh, smoke, busts, hand passes)
src/06-scenes.js        the mafia film: six scenes + its master timeline
films/green-vault/      the Green Vault film: sets + scenes + timeline
src/07-player.js        master timeline, transitions, player UI, recorder
src/shell.html          page layout & controls (outside the video frame)
tools/build.mjs         inlines src/ into index.html
tools/render-mp4.mjs    frame-exact offline MP4 export (Playwright + ffmpeg)
tools/verify.mjs        automated checks (timeline, determinism, black ending, no text/audio)
tools/snap.mjs          dev helper: render chosen timestamps to PNG + contact sheet
assets/                 put the optional boss reference image here
renders/                pre-rendered MP4
```

### Editing

Edit files in `src/` (or `films/<film>/`), then run `npm run build` (or `node tools/build.mjs`) to regenerate both HTML files. `npm run verify` runs the automated checks for the mafia film. For the Green Vault film, run `node tools/verify.mjs --html green-vault.html --duration 40 --bounds 0,6,13,21,28,34,40`.

---

# The Green Vault Heist · Dresden 2019

`green-vault.html`, **40 seconds**. This is a restrained historical reconstruction of the November 2019 theft from the Jewel Room of the Historic Green Vault (Grünes Gewölbe) in Dresden's Royal Palace. It uses the same visual system as the mafia film and adds new sets, props and a few cast presets built on the same rig. It has no audio, music, narration, subtitles or on-screen text.

The brief's scene timings run from 0 to 40 s with a fade to black at exactly 40 s, so the film is 40 s. The length is a single setting in `tools/build.mjs`.

| # | Time | Scene | Shots |
|---|---|---|---|
| 1 | 0–6 s | Dresden at night | Pre-dawn. A slow push toward the palace façade, with its Renaissance gables, amber windows and the Hausmannsturm clock tower with its baroque helmet. The square's wet cobblestones ripple with reflections, historic street lanterns stand in the foreground, and there is light drizzle, mist and a distant baroque skyline. |
| 2 | 6–13 s | The treasures | The baroque mirror room with gilded frames and consoles. The camera dollies from a wide shot into the lit display case, then a macro shot pans across the diamond garnitures (necklace, breast star, epaulette, sword, bow, clasp and buttons) as the jewels sparkle and light sweeps across the glass. |
| 3 | 13–21 s | The theft | The room in darkness. Two **anonymous silhouettes** sweep torch beams over the case. In close-up, the front glass cracks and shards fall onto the velvet. Then the empty velvet imprints where jewels were, picked out by a passing torch beam before darkness returns. No tools or methods are shown. |
| 4 | 21–28 s | Discovery | Morning light. A museum staff member walks in and stops short. In close-up he is shocked, with wide eyes and an open mouth. Two investigators then inspect the shattered case while forensic photo flashes go off. Insert: shards on the parquet with plain, unnumbered evidence markers. |
| 5 | 28–34 s | Investigation | A noir office: photos of the palace and the stolen pieces are pinned to a board and linked with red string while an investigator points. Insert: a magnifying glass passes over a photo of the breast star. Then a symbolic courthouse exterior with a scales-of-justice relief, followed by a gavel strike to signal the convictions. No suspects are depicted. |
| 6 | 34–40 s | Aftermath | The recovered jewellery is displayed under warm light, and some spaces stay empty as velvet imprints of items still missing. The camera pulls back to reveal the gallery behind a velvet rope. The image fades to complete black: the last frame (39.958 s) and 40.000 s are pure black. |

Transitions use the same system as the mafia film: dissolves at 6, 28 and 34 s, and dips to black at 13 and 21 s.

```bash
node tools/build.mjs green-vault
node tools/render-mp4.mjs renders/green-vault-heist-dresden-2019.mp4 --html green-vault.html
```

The film-specific code is in `films/green-vault/sets.js` (palace, skyline, cobbles, lanterns, Jewel Room, display case, jewellery, broken glass, board photos, scales) and `films/green-vault/scenes.js` (shots and timeline).

---

## Character anatomy rules (all films)

The shared rig enforces these rules automatically, so characters never lose or stretch a limb:

- **Both legs are always visible.** When a side-view character sits or stands still, the far leg is set apart from the near one: sitting, the far shin angles forward; standing, the far foot sits behind. It can never hide exactly behind the near leg, so there are no one-legged characters.
- **Both arms are always drawn.** If a shot only directs the near hand, the far arm still appears. It rests on the table or thigh when seated, and hangs at the side when standing.
- **Hands stay within arm's reach.** Every hand target is clamped to arm length, so arms never stretch.
- **Hands grip their props.** Shovels, gavels and magnifiers are held with the fingers wrapped across the handle.

Before rendering a new film, run the anatomy sheet. It draws a character in every core pose on one image:

```bash
node tools/rig-sheet.mjs rig.png boss     # or any cast key: digger, det1, staff, ltA ...
```

---

## Skill: `art-deco-noir-shorts`

`skills/art-deco-noir-shorts/` packages this whole system as a reusable Claude skill, and
`dist/art-deco-noir-shorts.skill` is the installable package. Give it a story and it produces a new
silent 9:16 short in the same style, starring the mafia boss by default. It has its own copy of the
engine, so it works without this repository. After changing `src/`, run `tools/sync-skill.sh` to copy
the engine into the skill again, then repackage it.
