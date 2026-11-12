import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; C = int(sys.argv[3]) if len(sys.argv) > 3 else 6; sc = 0.25
fs = sorted(glob.glob(d + "/f*.jpg")); w, h = int(1080 * sc), int(1920 * sc)
sh = Image.new("RGB", (w * C, (h + 18) * ((len(fs) + C - 1) // C)), "white"); dr = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(f).resize((w, h)); x, y = (i % C) * w, (i // C) * (h + 18)
    sh.paste(im, (x, y + 18)); g = ImageDraw.Draw(sh)
    for yy in (250, 650): g.line([(x, y + 18 + yy * sc), (x + w, y + 18 + yy * sc)], fill=(255, 0, 0), width=1)
    g.line([(x, y + 18 + 1620 * sc), (x + w, y + 18 + 1620 * sc)], fill=(255, 140, 0), width=1)
    g.line([(x + 930 * sc, y + 18), (x + 930 * sc, y + 18 + h)], fill=(255, 140, 0), width=1)
    g.text((x + 4, y + 3), os.path.basename(f)[1:-4], fill="black")
sh.save(out, quality=85); print(out, len(fs))
