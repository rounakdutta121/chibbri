# PanelVerse motion graphics reel (Remotion + Three.js)

Real **3D motion graphics** pipeline (not HTML screen capture):

- **Remotion** frame-accurate render @ 1080×1920, 30fps, 30s  
- **Three.js / React Three Fiber** — distorted metals, particles, wire grid, orbit camera, scene-cut flashes  
- **2D typography** on high-contrast white cards (readable over 3D)  
- **Audio:** voiceover + royalty-free music (see `../reel-panelverse/MUSIC_ATTRIBUTION.md`)

## Output

`../deliverables/panelverse-motion-30s.mp4`

## Render

```bash
cd panelverse-motion
npm install
npm run render:full
```

`render:full` = Remotion video + edge-tts VO + ffmpeg music mix.
