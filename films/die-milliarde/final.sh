#!/bin/bash
# final.sh : concat chapter videos + loudness-normalised mix -> out/Die-Milliarde.mp4, then QA
cd /home/user/shorts/milliarde
ffmpeg -v error -y -i mix_raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -ac 2 mix.wav
: > out/list.txt; for c in 1 2 3 4 5 6 7; do echo "file 'ch$c.mp4'" >> out/list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i out/list.txt -c copy out/video.mp4
ffmpeg -v error -y -i out/video.mp4 -i mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -t 597.81 -movflags +faststart out/Die-Milliarde.mp4
ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -of compact out/Die-Milliarde.mp4
echo "--- QA (empty = no black/frozen spans)"; ffmpeg -i out/Die-Milliarde.mp4 -vf "freezedetect=n=0.0005:d=0.6,blackdetect=d=0.05" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || true
ffmpeg -i out/Die-Milliarde.mp4 -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
ffmpeg -v error -y -i out/Die-Milliarde.mp4 -vf "fps=1/6,scale=240:-1,tile=10x10" -frames:v 1 out/qa_sheet.jpg; ls -la out/Die-Milliarde.mp4
