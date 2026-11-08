#!/usr/bin/env bash
# parallel stills: bash rstills.sh <outdir> "f1,f2,..." [procs]
out=$1; IFS=, read -ra A <<< "$2"; P=${3:-3}; n=${#A[@]}; rm -rf "$out"; mkdir -p "$out"
for ((k=0;k<P;k++)); do part=(); for ((i=k;i<n;i+=P)); do part+=("${A[i]}"); done; s=$(IFS=,; echo "${part[*]}"); node render.mjs "$out" "$s" > "$out/.log$k" 2>&1 & done; wait
grep -h "ERR\|done" "$out"/.log* ; python3 - "$out" <<'PY'
import glob,sys
from PIL import Image, ImageDraw
d=sys.argv[1]; fs=sorted(glob.glob(d+'/f*.jpg')); W=8
ims=[Image.open(f).resize((270,480)) for f in fs]
sh=Image.new('RGB',(270*W,480*((len(ims)+W-1)//W)),'black'); g=ImageDraw.Draw(sh)
for i,(im,f) in enumerate(zip(ims,fs)):
    x,y=(i%W)*270,(i//W)*480; sh.paste(im,(x,y)); g.rectangle([x,y,x+48,y+18],fill='black'); g.text((x+4,y+3),f[-8:-4],fill='white')
sh.save(d+'.jpg',quality=85)
PY
