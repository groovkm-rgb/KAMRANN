#!/bin/bash
# enc.sh <chapter> : encodes frames of a finished chapter to out/chN.mp4 (video only, 30 fps)
CH=(0 1719 3994 6498 9121 12238 15231 17934)
c=$1; a=${CH[$((c-1))]}; n=$((${CH[$c]}-a))
cd /home/user/shorts/milliarde; mkdir -p out
ffmpeg -v error -y -framerate 30 -start_number $a -i frames/f%05d.jpg -frames:v $n -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 30 out/ch$c.mp4 && ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/ch$c.mp4
