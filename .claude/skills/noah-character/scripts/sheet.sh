#!/bin/bash
# sheet.sh out.png t1 t2 ... : 3-column contact sheet of stills/t_<t>.png
cd "${FILM_DIR:-.}/stills"; out=$1; shift; args=""; fl=""; i=0
for f in "$@"; do args="$args -i t_$f.png"; fl="$fl[$i]scale=640:360,drawtext=text='$f':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.5[v$i];"; i=$((i+1)); done
lay=$(python3 -c "n=$i;print('|'.join(f'{(k%3)*640}_{(k//3)*360}' for k in range(n)))"); ins=""; for ((k=0;k<i;k++)); do ins="$ins[v$k]"; done
ffmpeg -y -v error $args -filter_complex "${fl}${ins}xstack=inputs=$i:layout=$lay:fill=black" $out
