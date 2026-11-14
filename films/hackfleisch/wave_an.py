import numpy as np, subprocess, json, sys
from PIL import Image, ImageDraw
SR=16000
raw=subprocess.run(["ffmpeg","-v","error","-i","voice.mp3","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout
x=np.frombuffer(raw,np.float32)
hop=160  # 10ms
n=len(x)//hop
rms=np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)+1e-12) for i in range(n)])
db=20*np.log10(rms+1e-9)
np.save('work/db10ms.npy',db)
# gaps: runs below -38 dB of >= 60ms
thr=float(sys.argv[1]) if len(sys.argv)>1 else -38
low=db<thr; gaps=[]; i=0
while i<n:
    if low[i]:
        j=i
        while j<n and low[j]: j+=1
        if (j-i)>=6: gaps.append((i/100,j/100))
        i=j
    else: i+=1
print(len(gaps)); print(' '.join(f'{a:.2f}-{b:.2f}' for a,b in gaps))
# image: 5 rows of 10s
W=2000; Hh=160; img=Image.new('RGB',(W,Hh*5),'white'); d=ImageDraw.Draw(img)
for r in range(5):
    for px in range(W):
        t=r*10+px/W*10; k=int(t*100)
        if k<n:
            v=max(0,(db[k]+60)/60); d.line([(px,r*Hh+Hh-5),(px,r*Hh+Hh-5-v*(Hh-25))],fill=(60,60,160))
    for s in range(11):
        X=int(s/10*W); d.line([(X,r*Hh),(X,r*Hh+Hh)],fill=(200,200,200)); d.text((X+2,r*Hh+2),f'{r*10+s}',fill='black')
    yth=r*Hh+Hh-5-max(0,(thr+60)/60)*(Hh-25); d.line([(0,yth),(W,yth)],fill=(255,160,160))
img.save(sys.argv[2] if len(sys.argv)>2 else 'work/wave.png')
