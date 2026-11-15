#!/usr/bin/env python3
"""Contact sheet:  python3 sheet.py stills/x sheet.jpg [cols] [w]"""
import sys, glob
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; C = int(sys.argv[3]) if len(sys.argv) > 3 else 5; w = int(sys.argv[4]) if len(sys.argv) > 4 else 480; h = w * 9 // 16
fs = sorted(glob.glob(d + "/f*.jpg"))
sh = Image.new("RGB", (w * min(C, len(fs)), (h + 18) * ((len(fs) + C - 1) // C)), "#222")
dr = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(f).resize((w, h)); x, y = (i % C) * w, (i // C) * (h + 18); sh.paste(im, (x, y + 18))
    fr = int(f.split('/f')[-1][:5]); dr.text((x + 4, y + 3), f"f{fr}  {fr/30:.2f}s", fill="#ff0")
sh.save(out, quality=85); print(out, len(fs))
