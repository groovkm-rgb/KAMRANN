#!/usr/bin/env python3
"""Contact sheet with safe-area guides: python3 tools_dev/sheetg.py stills/x out.jpg [cols]
red = Shorts UI (bottom 300 px, right 150 px), blue = top text band (y 250-650)."""
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; W = int(sys.argv[3]) if len(sys.argv) > 3 else 7
fs = sorted(glob.glob(d + "/f*.jpg")); ims = []
for f in fs:
    im = Image.open(f).convert("RGB"); dr = ImageDraw.Draw(im)
    dr.line([(0, 1620), (1080, 1620)], fill=(255, 40, 40), width=5); dr.line([(930, 0), (930, 1920)], fill=(255, 40, 40), width=5)
    dr.rectangle([4, 250, 1076, 650], outline=(40, 120, 255), width=5)
    dr.text((20, 1840), os.path.basename(f)[1:5], fill=(255, 255, 0))
    ims.append(im.resize((270, 480)))
sh = Image.new("RGB", (270 * min(W, len(ims)), 480 * ((len(ims) + W - 1) // W)))
for i, im in enumerate(ims): sh.paste(im, ((i % W) * 270, (i // W) * 480))
sh.save(out, quality=88); print(out, len(ims))
