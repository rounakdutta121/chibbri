#!/usr/bin/env bash
# Trim Vaaroon (Mirzapur) from 0:42 to 1:42 and copy into Remotion public/.
# Place full track at assets/vaaroon-source.mp3 first, or pass path as $1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-$ROOT/assets/vaaroon-source.mp3}"
OUT="$ROOT/public/audio/vaaroon-clip.mp3"
mkdir -p "$ROOT/public/audio" "$ROOT/assets"
ffmpeg -y -ss 42 -t 60 -i "$SRC" -c:a libmp3lame -b:a 320k "$OUT"
echo "Wrote 60s clip: $OUT"
