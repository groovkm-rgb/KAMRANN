#!/usr/bin/env python3
"""Contact sheet of landscape stills:  python3 sheet.py stills/x sheet.jpg [cols] [thumbW]"""
import sys, glob
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; W = int(sys.argv[3]) if len(sys.argv) > 3 else 6; tw = int(sys.argv[4]) if len(sys.argv) > 4 else 400; th = tw * 9 // 16
fs = sorted(glob.glob(d + "/f*.jpg")); ims = [Image.open(f).resize((tw, th)) for f in fs]
sh = Image.new("RGB", (tw * min(W, len(ims)), (th + 4) * ((len(ims) + W - 1) // W)), "white")
for i, im in enumerate(ims): sh.paste(im, ((i % W) * tw, (i // W) * (th + 4)))
sh.save(out, quality=88); print(out, len(ims))
