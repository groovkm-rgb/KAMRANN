import numpy as np, wave, re, json
SR=48000; HOP=480
w=wave.open('voice.wav'); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
k=len(a)//HOP; e=np.sqrt((a[:k*HOP].reshape(k,HOP)**2).mean(1)); db=20*np.log10(e+1e-9)
sil=db<-40
# pauses: runs of silence >= .15s
P=[]; i=0
while i<k:
    if sil[i]:
        j=i
        while j<k and sil[j]: j+=1
        if (j-i)*0.01>=0.15: P.append((i*0.01,j*0.01))
        i=j
    else: i+=1
TOTAL=k*0.01; JOIN=316.358
text=open('script.txt').read().strip()
paras=[p.strip() for p in text.split('\n\n')]
sents=[]
for pi,p in enumerate(paras):
    for s in re.split(r'(?<=[.!?…])\s+',p):
        if s.strip(): sents.append((pi,s.strip()))
def weight(s): return len(re.sub(r'[^\wäöüÄÖÜß]','',s))+6*len(re.findall(r'[,–:;]',s))+4
# split at teil2's first sentence
i2=[n for n,(pi,s) in enumerate(sents) if s.startswith('In der Ferne zieht')][0]
def align(S, t0, t1):
    pz=[p for p in P if p[0]>t0+0.2 and p[1]<t1-0.2]
    # speech start/end
    W=np.array([weight(s) for _,s in S],float)
    span=(t1-t0)-0.5
    rate=span/W.sum()
    M=len(pz); N=len(S)
    # dp[n][j]: sentence n ends at pause j (n < N-1)
    INF=1e18
    cand=[(t0,t0)]+pz+[(t1,t1)]
    C=len(cand)
    cost=np.full((N+1,C),INF); back=np.zeros((N+1,C),int)
    cost[0][0]=0
    for n in range(1,N+1):
        exp=W[n-1]*rate
        last = n==N
        for j in range(1,C):
            if last and j!=C-1: continue
            if not last and j==C-1: continue
            pend=cand[j][0]
            best=INF;bj=0
            for q in range(j-1,-1,-1):
                st=cand[q][1]; d=pend-st
                if d>exp*3+3: break
                if cost[n-1][q]>=INF: continue
                cc=cost[n-1][q]+((d-exp)/(0.22*exp+0.35))**2
                if cc<best: best=cc;bj=q
            if best<INF:
                pd=cand[j][1]-cand[j][0]
                bonus=0 if last else -2.2*np.log(pd/0.15+1)*(2 if S[n-1][0]!=S[n][0] else 1)
                cost[n][j]=best+bonus; back[n][j]=bj
    # backtrack
    j=C-1; ends=[]
    for n in range(N,0,-1):
        q=back[n][j]; ends.append((cand[q][1],cand[j][0])); j=q
    return ends[::-1]
A=align(sents[:i2],0.1,JOIN-0.02)+align(sents[i2:],JOIN,TOTAL)
out=[]
for (pi,s),(st,en) in zip(sents,A):
    # words: map char fraction onto speech time excluding inner pauses
    inner=[p for p in P if p[0]>st and p[1]<en]
    segs=[]; cur=st
    for p in inner: segs.append((cur,p[0])); cur=p[1]
    segs.append((cur,en)); tot=sum(b-a for a,b in segs)
    words=s.split(); ws=np.array([len(x)+1 for x in words],float); cum=np.concatenate([[0],np.cumsum(ws)])/ws.sum()
    def at(f):
        r=f*tot
        for a_,b_ in segs:
            if r<=b_-a_: return a_+r
            r-=b_-a_
        return en
    out.append({'p':pi,'s':s,'t0':round(st,2),'t1':round(en,2),'w':[[wd,round(at(cum[i]),2)] for i,wd in enumerate(words)]})
json.dump(out,open('timing.json','w'),ensure_ascii=False,indent=0)
for o in out: print(f"{o['t0']:7.2f} {o['t1']:7.2f} p{o['p']:02d} {o['s'][:70]}")
