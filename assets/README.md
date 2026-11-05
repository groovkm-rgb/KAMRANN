# Reference image (optional)

Put the boss reference portrait here as **`boss.png`** (`boss.jpg` / `boss.jpeg` / `boss.webp` also work).

- Served over `http://` (e.g. `python3 -m http.server 8000`), `index.html` picks it up automatically.
- Opened from `file://`? Use **Reference portrait → choose file** in the side panel instead
  (auto-loading a disk file would taint the canvas and block recording).
- Calibrate with the *Face centre X / Y* and *Face height* sliders, or URL params `?fx=0.5&fy=0.36&fh=0.42`
  (fractions of the image width/height).
- Offline MP4 with the image: `node tools/render-mp4.mjs out.mp4 --ref assets/boss.png --fx 0.5 --fy 0.36 --fh 0.42`

The image is used, untouched and colour-graded, for the boss close-ups (scenes 2, 4, 5 and 6).
