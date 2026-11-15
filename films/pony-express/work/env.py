import numpy as np, wave, json
w=wave.open('work/v16.wav'); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768; sr=16000
X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/sr); X[(fr<250)|(fr>3500)]=0; y=np.fft.irfft(X,len(x))
hop=160; n=len(y)//hop; e=np.array([np.sqrt(np.mean(y[i*hop:i*hop+320]**2)) for i in range(n)])
db=20*np.log10(e+1e-6); ds=np.convolve(db,np.ones(5)/5,'same')
peaks=[]
for i in range(16,n-16):
    if ds[i]==ds[i-6:i+7].max() and ds[i]>-40:
        lo=min(ds[i-15:i].min(), ds[i:i+15].min())
        if ds[i]-lo>3: peaks.append(i)
segs=json.load(open('work/phrases.json'))['segments']
for j,(a,b) in enumerate(segs):
    c=[p for p in peaks if a*100<=p<b*100]
    seg=ds[int(a*100):int(b*100)]
    dips=[round((int(a*100)+i)/100,2) for i in range(6,len(seg)-6) if seg[i]==seg[i-6:i+7].min() and seg[i]<-45]
    print(f"s{j:2d} {a:6.2f}-{b:6.2f} dur{b-a:5.2f} peaks{len(c):3d} dips {dips}")
np.save('work/env.npy',ds)
