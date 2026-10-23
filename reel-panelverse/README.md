# PanelVerse 30s promo reel

Vertical **1080×1920** motion reel (~30 seconds) with voiceover + royalty-free background music.

## Output

`../deliverables/panelverse-promo-30s.mp4`

## Text contrast rule

All marketing copy sits on **white cards** with **#0f172a** text. Decorative icons use saturated gradients in a **separate zone** above the cards so text never sits on the same color as icons.

## Music

Background: **SoundHelix Song 8** (royalty-free). Trimmed to 30s in `render.mjs`. See `MUSIC_ATTRIBUTION.md`.

## Render

```bash
cd reel-panelverse
npm install
npx playwright install chromium
npm run render
```
