#!/bin/bash
# Full film render in 60 s chunks (resumable), then concat + audio (loudness-normalised).
#   bash render_full.sh <mp3> <workdir>
set -e; cd "$(dirname "$0")"; MP3=$1; WD=$2; mkdir -p "$WD"; END=535
for ((a=0; a<END; a+=60)); do b=$((a+60)); [ $b -gt $END ] && b=$END; f="$WD/chunk_$(printf %03d $a).mp4"
  [ -s "$f" ] || { node render.cjs --mp4 "$f.tmp.mp4" --from $a --to $b --jobs 4 | tail -1; mv "$f.tmp.mp4" "$f"; }; done
python3 audio/mix.py "$MP3" "$WD/mix.wav" $END
ffmpeg -loglevel error -y -i "$WD/mix.wav" -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 44100 "$WD/mix_n.wav"
ls "$WD"/chunk_*.mp4 | sed "s/^/file '/; s/$/'/" > "$WD/list.txt"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$WD/list.txt" -i "$WD/mix_n.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart ../../renders/30-tage-im-einkaufszentrum.mp4
ffprobe -v error -show_entries stream=codec_type,width,height,nb_frames:format=duration -of compact ../../renders/30-tage-im-einkaufszentrum.mp4
