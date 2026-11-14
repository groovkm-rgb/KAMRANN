import numpy as np, subprocess, sys
from PIL import Image, ImageDraw
SR=16000
raw=subprocess.run(["ffmpeg","-v","error","-i","voice.mp3","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout
x=np.frombuffer(raw,np.float32)
t0,t1=float(sys.argv[1]),float(sys.argv[2]); out=sys.argv[3]
hop=80; win=320
seg=x[int(t0*SR):int(t1*SR)]
n=(len(seg)-win)//hop
F=np.fft.rfftfreq(win,1/SR); hw=np.hanning(win)
lo=[];hi=[]
for i in range(n):
    X=np.abs(np.fft.rfft(seg[i*hop:i*hop+win]*hw))**2
    lo.append(10*np.log10(X[(F>80)&(F<2500)].sum()+1e-9)); hi.append(10*np.log10(X[F>3500].sum()+1e-9))
lo=np.array(lo);hi=np.array(hi)
W=2400;H=260;rows=int(np.ceil((t1-t0)/5))
img=Image.new('RGB',(W,H*rows),'white');d=ImageDraw.Draw(img)
mx=max(lo.max(),hi.max())
for r in range(rows):
    for px in range(W):
        t=r*5+px/W*5; k=int(t*SR/hop)
        if k<n:
            v=max(0,(lo[k]-mx+60)/60); d.line([(px,r*H+H-5),(px,r*H+H-5-v*(H-30))],fill=(70,70,170))
            v2=max(0,(hi[k]-mx+60)/60); d.point((px,r*H+H-5-v2*(H-30)),fill=(230,40,40)); d.point((px,r*H+H-4-v2*(H-30)),fill=(230,40,40))
    for s in range(51):
        X=int(s/50*W); c=(150,150,150) if s%10==0 else (225,225,225)
        d.line([(X,r*H),(X,r*H+H)],fill=c)
        if s%10==0: d.text((X+2,r*H+2),f'{t0+r*5+s/10:.1f}',fill='black')
img.save(out)
