import sys
from PIL import Image
ts = sys.argv[2:]; cols = 3 if len(ts) > 4 else 2; Wd, Hd = (640, 360) if cols == 3 else (960, 540)
rows = (len(ts) + cols - 1) // cols; s = Image.new('RGB', (Wd * cols, Hd * rows))
for i, t in enumerate(ts): s.paste(Image.open(f'stills/t_{t}.png' if t[0].isdigit() else f'stills/{t}.png').resize((Wd, Hd)), ((i % cols) * Wd, (i // cols) * Hd))
s.save(sys.argv[1], quality=85)
