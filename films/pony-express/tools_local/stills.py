import re,sys,subprocess,os
s=open('web/shots.js').read()
ids=re.findall(r"id: '(\w+)', loc: '\w+', light: '\w+', a: (\d+), b: (\d+)",s)
fr=[]
for i,a,b in ids:
    a,b=int(a),int(b); fr+= [a+(b-a)//5, a+(b-a)*4//5]
fr=sorted(set(fr))
out=sys.argv[1]; half=len(fr)//2
ps=[subprocess.Popen(['node','render.mjs',out,",".join(map(str,part))]) for part in (fr[:half],fr[half:])]
[p.wait() for p in ps]
print(len(ids),'shots',len(fr),'frames')
