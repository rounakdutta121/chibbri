#!/usr/bin/env bash
set -euo pipefail
A=/workspace/story-reel/assets/audio
mkdir -p "$A"

# Heartbeat pulses
ffmpeg -y -f lavfi -i "sine=frequency=55:duration=0.08" -f lavfi -i "sine=frequency=55:duration=0.08" \
  -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1,apad=pad_dur=0.35,volume=2" "$A/heartbeat.wav" 2>/dev/null

# Footsteps (filtered noise bursts)
ffmpeg -y -f lavfi -i "anoisesrc=d=2.2:c=pink:a=0.35,lowpass=f=800,highpass=f=100,volume=3" "$A/footsteps.wav" 2>/dev/null

# Glass shatter
ffmpeg -y -f lavfi -i "anoisesrc=d=0.6:c=white:a=0.8,highpass=f=2000,volume=4" "$A/glass.wav" 2>/dev/null

# Whoosh sweep
ffmpeg -y -f lavfi -i "sine=frequency=200:duration=0.45,asetrate=44100*0.6,aresample=44100,volume=2" \
  -f lavfi -i "sine=frequency=800:duration=0.45,volume=1.5" \
  -filter_complex "[0:a][1:a]amix=inputs=2,dynaudnorm" "$A/whoosh.wav" 2>/dev/null

# Impact thud
ffmpeg -y -f lavfi -i "sine=frequency=80:duration=0.25,volume=5" -f lavfi -i "anoisesrc=d=0.15:c=brown:a=0.4,volume=3" \
  -filter_complex "[0:a][1:a]amix=inputs=2,lowpass=f=400" "$A/impact.wav" 2>/dev/null

curl -sL -A "Mozilla/5.0" "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" -o "$A/music.mp3"
