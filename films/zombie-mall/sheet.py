# contact sheet of the given stills (for quick review): python3 sheet.py out.png t1 t2 ...
import sys; from PIL import Image, ImageDraw
fs=sys.argv[2:]; W,H=480,270; C=4; s=Image.new('RGB',(W*C,H*((len(fs)+C-1)//C)))
for i,f in enumerate(fs):
    im=Image.open('stills/t_%s.png'%f).resize((W,H)); ImageDraw.Draw(im).text((6,4),f,fill=(255,255,0)); s.paste(im,((i%C)*W,(i//C)*H))
s.save(sys.argv[1])
