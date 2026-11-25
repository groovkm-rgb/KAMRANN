#!/usr/bin/env bash
# Sound for the Mauerfall Short.  usage: scripts/make_audio.sh <voice.mp3> <video_silent.mp4> <out.mp4> <work_dir>
# 1) voice: high-pass, gentle compression + soft peak limiting (so the final limiter barely works -> no crackle)
# 2) procedural SFX / crowds / music under the voice (mix_audio.py)   3) -14 LUFS, true peak <= -1 dBTP, mux AAC
set -euo pipefail
VO="$1"; VID="$2"; OUT="$3"; W="$4"; mkdir -p "$W"; D="$(cd "$(dirname "$0")" && pwd)"
ffmpeg -y -v error -i "$VO" -af "highpass=f=70,aresample=192000,acompressor=threshold=0.1:ratio=2.5:attack=4:release=150:knee=6:makeup=3.6,alimiter=limit=0.79:attack=6:release=90:level=disabled,aresample=48000" -ar 48000 "$W/vo_c.wav"
python3 "$D/mix_audio.py" "$W/vo_c.wav" "$W"
ffmpeg -y -v error -i "$W/mix_raw.wav" -af "volume=1.1dB,aresample=192000,alimiter=limit=0.83:attack=5:release=80:level=disabled,aresample=48000" "$W/mix_final.wav"
ffmpeg -y -v error -i "$VID" -i "$W/mix_final.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$OUT"
