#!/usr/bin/env python3
"""Contact sheet of stills:  python3 sheet.py stills/x sheet.jpg [cols]"""
import sys, glob
from PIL import Image
d, out = sys.argv[1], sys.argv[2]; W = int(sys.argv[3]) if len(sys.argv) > 3 else 7
fs = sorted(glob.glob(d + "/f*.jpg")); ims = [Image.open(f).resize((384, 216)) for f in fs]
sh = Image.new("RGB", (384 * min(W, len(ims)), 216 * ((len(ims) + W - 1) // W)))
for i, im in enumerate(ims): sh.paste(im, ((i % W) * 384, (i // W) * 216))
sh.save(out, quality=88); print(out, len(ims))
