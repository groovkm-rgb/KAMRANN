import glob, sys
from PIL import Image, ImageDraw
d=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 7; per=int(sys.argv[4]) if len(sys.argv)>4 else 14
fs=sorted(glob.glob(d+'/f*.jpg'))
for n in range(0,len(fs),per):
    lst=fs[n:n+per]; w=300; h=int(w*16/9); im=Image.new('RGB',(cols*w,((len(lst)+cols-1)//cols)*h)); dr=ImageDraw.Draw(im)
    for i,f in enumerate(lst):
        x,y=(i%cols)*w,(i//cols)*h; im.paste(Image.open(f).resize((w,h)),(x,y)); dr.text((x+6,y+6),f.split('/')[-1][1:5],fill=(255,255,0))
        # safe-area guides: top band 250-650, bottom 300, right 150
        s=w/1080; dr.rectangle([x,y+250*s,x+w-1,y+650*s],outline=(0,255,255)); dr.line([x,y+h-300*s,x+w,y+h-300*s],fill=(255,0,255)); dr.line([x+w-150*s,y,x+w-150*s,y+h],fill=(255,0,255))
    im.save(f"{out}{n//per}.jpg",quality=85)
