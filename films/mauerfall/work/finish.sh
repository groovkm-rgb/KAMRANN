#!/bin/bash
# wait for all 4 render parts, concat, mux -16 LUFS audio, QA -> work/final_qa.txt
cd /home/user/KAMRANN/films/mauerfall
until [ $(grep -l DONE work/parts/log*.txt 2>/dev/null | wc -l) -eq 4 ]; do sleep 10; done
printf "file 'parts/p0.mp4'\nfile 'parts/p1.mp4'\nfile 'parts/p2.mp4'\nfile 'parts/p3.mp4'\n" > work/concat.txt
ffmpeg -v error -y -f concat -safe 0 -i work/concat.txt -c copy work/video.mp4
ffmpeg -v error -y -i work/video.mp4 -i mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart mauerfall.mp4
{ date; ffprobe -v error -show_entries stream=codec_name,codec_type,width,height,nb_frames:format=duration -of compact mauerfall.mp4; ffmpeg -hide_banner -i mauerfall.mp4 -af ebur128=peak=true -vn -f null - 2>&1 | grep -E "^\s+(I|Peak):"; grep -h "DONE" work/parts/log*.txt; } > work/final_qa.txt 2>&1
mkdir -p work/final_frames; for t in 0 15 27 60 120 175 266 330 389 424 470 515 595 610 660; do ffmpeg -v error -y -ss $t -i mauerfall.mp4 -frames:v 1 -vf scale=480:270 work/final_frames/f_$t.jpg; done
echo FINISHED >> work/final_qa.txt
