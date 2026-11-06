#!/usr/bin/env python3
"""Contact sheet:  python3 tools/sheet.py <dir> <out.jpg> [cols]  (labels = frame numbers)"""
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; W = int(sys.argv[3]) if len(sys.argv) > 3 else 6
fs = sorted(glob.glob(d + "/f*.png")); tw, th = 270, 480
sh = Image.new("RGB", (tw * min(W, len(fs)), (th + 22) * ((len(fs) + W - 1) // W)), "white")
dr = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    x, y = (i % W) * tw, (i // W) * (th + 22)
    sh.paste(Image.open(f).convert("RGB").resize((tw, th)), (x, y + 22)); dr.text((x + 4, y + 5), os.path.basename(f), fill="black")
sh.save(out, quality=88); print(out, len(fs))
