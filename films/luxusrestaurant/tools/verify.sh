#!/bin/bash
# verify.sh film.mp4 : duration, streams, speech loudness unchanged, one still per section
F=$1; D=/home/user/KAMRANN/films/luxusrestaurant; A=/root/.claude/uploads/0420e09d-5920-5f0d-9453-b9b0af4c5901/e65d7a71-RESTORAN_PLAN.mp3
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels,nb_frames:format=duration -of compact "$F"
ffprobe -v error -show_entries format=duration -sexagesimal -of csv=p=0 "$F"
echo "speech MP3:"; ffmpeg -hide_banner -i $A -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
echo "film (L+R)/2:"; ffmpeg -hide_banner -i "$F" -af "pan=mono|c0=0.5*c0+0.5*c1,ebur128" -f null - 2>&1 | grep -E "^\s+I:" | tail -1
echo "bed only:"; ffmpeg -hide_banner -i $D/audio/full_mix_bed.wav -af "pan=mono|c0=0.5*c0+0.5*c1,ebur128" -f null - 2>&1 | grep -E "^\s+I:" | tail -1
