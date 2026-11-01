# PanelVerse — Chinnamasta Reel (Remotion)

Portrait reel synced to `public/voiceover.mp3` with **40 scene images** (`public/scenes/scene-01.jpg` … `scene-40.jpg`), English word subtitles, and **Developed by PanelVerse** on every frame.

## Commands

```bash
cd panelverse-chinnamasta-reel
python3 scripts/build-scenes-manifest.py   # map narration timing → 40 scenes
python3 scripts/build-subtitles.py         # word-level English subtitles
python3 scripts/render-cartoon-scenes.py   # regenerate cartoon scene JPEGs
npm run build                              # render out/chinnamasta-reel.mp4
```

## Scene sync

Timings come from Whisper segments in `public/voiceover.json`. **40 images** track the voiceover: one cut per narration phrase (segments 0–38), with the closing image spanning the last two segments (see `src/scenes.json`).
