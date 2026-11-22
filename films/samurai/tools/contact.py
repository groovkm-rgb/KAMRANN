import sys, glob, os
from PIL import Image, ImageDraw
files = sys.argv[2:]; out = sys.argv[1]; cols = 3; w, h = 640, 360
rows = (len(files) + cols - 1) // cols; sheet = Image.new('RGB', (cols * w, rows * (h + 24)), (20, 20, 20)); d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h)); x, y = (i % cols) * w, (i // cols) * (h + 24); sheet.paste(im, (x, y)); d.text((x + 6, y + h + 4), os.path.basename(f), fill=(230, 230, 230))
sheet.save(out, quality=88)
