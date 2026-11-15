import pathlib,sys,json
def run(path, pairs):
    p=pathlib.Path(path); s=p.read_text(); bad=0
    for a,b in pairs:
        if a not in s: print("MISSING:",a[:70]); bad+=1; continue
        s=s.replace(a,b,1)
    p.write_text(s); print(path,"applied",len(pairs)-bad,"missing",bad)
