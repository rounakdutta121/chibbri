# Structure reel (motion-style)

Vertical Instagram-style reel (~18s, 1080×1920) inspired by blueprint + kinetic typography edu-marketing.

## Output

- `../deliverables/structure-reel.mp4` — final export with voiceover
- `../deliverables/structure-reel-silent.mp4` — video only (Playwright capture)

## Re-render

```bash
cd reel-structure
npm install
npx playwright install chromium
npm run render
```

Requires `edge-tts` on PATH (or `/home/ubuntu/.local/bin/edge-tts`) for narration.

## Edit copy

- Animation + layout: `index.html` (GSAP timeline)
- Voiceover script: `render.mjs` (`VO_TEXT`)
