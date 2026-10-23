# Suspense story reel (60s, image-led)

Fast-paced **action/suspense** short (male protagonist) — **no narration**, English **animated subtitles** only.

## Output

`../deliverables/suspense-story-reel-60s.mp4` — 1080×1920, ~60s

## Pipeline

1. **15 AI stills** (9:16 cinematic frames)
2. **Ken Burns** motion + film grain per clip (`zoompan`)
3. **Movie transitions** (`xfade`: wipe, slide, circle, fade black, etc.)
4. **ASS subtitles** with `\move`, `\fad`, scale tags — different positions per line
5. **Audio:** SoundHelix bed + synthesized SFX (heartbeat, footsteps, glass, whoosh, impact)

## Rebuild

```bash
# Audio assets (ffmpeg)
bash generate-sfx.sh   # or run ffmpeg commands in README if on Windows

node build.mjs
```

Images live in `assets/images/`. Story copy in `story.json`.

## Music

SoundHelix Song 16 — https://www.soundhelix.com/licensing
