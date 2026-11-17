import sys,glob,os
from PIL import Image, ImageDraw
fs=sorted(glob.glob('stills/t_*.png'),key=lambda p:float(os.path.basename(p)[2:-4]))
n=16
for k in range(0,len(fs),n):
    S=Image.new('RGB',(4*480,4*270))
    for i,f in enumerate(fs[k:k+n]):
        im=Image.open(f).resize((480,270)); d=ImageDraw.Draw(im); d.rectangle([0,0,90,22],fill=(0,0,0)); d.text((4,4),os.path.basename(f)[2:-4],fill=(255,255,0)); S.paste(im,((i%4)*480,(i//4)*270))
    S.save(f'stills/sheet_{k//n:02d}.jpg',quality=85)
print(len(fs))
