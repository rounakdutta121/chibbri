# Fatakeshto Kali Puja — Remotion video

## Output

Rendered file: `../deliverables/fatakeshto-kali-puja-reel.mp4` (1080×1920 portrait / Reels)

## Re-render

```bash
npm install
npm run render
```

Place `voiceover.mp3` in `public/` (from project source). Subtitle timings are in `src/subtitles.json` (aligned to Whisper segment timestamps on the voice track).

Background music: user-provided track in `public/bg-music.mp3`, trimmed to start at **0:15** in the source file.

Story frames in `public/images/` are **9:16 portrait** (720×1280), generated for Reels/Shorts.
