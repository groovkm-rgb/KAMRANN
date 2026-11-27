# contact sheet of the given stills (for quick review)
import sys; from PIL import Image
fs=sys.argv[2:]; W,H=640,360; s=Image.new('RGB',(W*3,H*((len(fs)+2)//3)))
for i,f in enumerate(fs): s.paste(Image.open('stills/t_%s.png'%f).resize((W,H)),((i%3)*W,(i//3)*H))
s.save(sys.argv[1])
