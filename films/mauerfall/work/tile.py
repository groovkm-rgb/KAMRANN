import json, sys
from PIL import Image, ImageDraw, ImageFont
L = json.load(open(sys.argv[1] + '/list.json')); out = sys.argv[2]; per = 24; cols = 4; tw, th = 480, 270
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
for p in range(0, len(L), per):
    chunk = L[p:p + per]; rows = (len(chunk) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 22)), (20, 20, 20)); d = ImageDraw.Draw(S)
    for i, (f, lab) in enumerate(chunk):
        x, y = (i % cols) * tw, (i // cols) * (th + 22); S.paste(Image.open(f).resize((tw, th)), (x, y)); d.text((x + 4, y + th + 2), lab[:58], font=F, fill=(240, 230, 210))
    S.save(f'{out}/sheet_{p // per:02d}.jpg', quality=82)
print('ok')
