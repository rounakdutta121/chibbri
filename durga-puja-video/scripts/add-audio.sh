#!/usr/bin/env bash
# Merge your Mirzapur track (or any song) onto the rendered silent video.
# Usage: ./scripts/add-audio.sh /path/to/varoon-song.mp3
set -euo pipefail
AUDIO="${1:?Pass path to audio file}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO="$ROOT/../deliverables/durga-puja-story.mp4"
OUT="$ROOT/../deliverables/durga-puja-story-with-audio.mp4"
ffmpeg -y -i "$VIDEO" -i "$AUDIO" \
  -filter_complex "[1:a]volume=0.85,afade=t=in:st=0:d=1,afade=t=out:st=58:d=2[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$OUT"
echo "Wrote $OUT"
