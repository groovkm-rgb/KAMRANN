import sys,glob,os
from PIL import Image,ImageDraw
files=sys.argv[2:]; out=sys.argv[1]
cols=6; w=270; h=480
rows=(len(files)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*(h+24)),(30,30,30)); d=ImageDraw.Draw(S)
for i,f in enumerate(files):
  im=Image.open(f).resize((w,h)); x=(i%cols)*w; y=(i//cols)*(h+24); S.paste(im,(x,y+24)); d.text((x+6,y+5),os.path.basename(f),fill=(255,255,0))
S.save(out,quality=88)
