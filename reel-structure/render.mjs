import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const outDir = path.join(root, '..', 'deliverables');
const htmlPath = path.join(root, 'index.html');
const silentVideo = path.join(outDir, 'structure-reel-silent.mp4');
const voicePath = path.join(outDir, 'structure-reel-voice.mp3');
const finalVideo = path.join(outDir, 'structure-reel.mp4');

const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION_MS = 19500;

fs.mkdirSync(outDir, { recursive: true });

const VO_TEXT =
  "Your content is invisible, and it's not an editing problem. It's a structure problem. If your script is weak, motion design is useless. Over editing hides the problem. Structure solves it. Want my script framework? Comment structure.";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.status}`);
}

async function synthesizeVoice() {
  try {
    run('pip', ['install', '-q', 'edge-tts']);
    run('/home/ubuntu/.local/bin/edge-tts', [
      '--voice',
      'en-US-GuyNeural',
      '--rate',
      '+8%',
      '--text',
      VO_TEXT,
      '--write-media',
      voicePath,
    ]);
  } catch {
    console.warn('edge-tts unavailable; exporting silent video only');
    return false;
  }
  return fs.existsSync(voicePath);
}

async function renderFrames() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: outDir,
      size: { width: WIDTH, height: HEIGHT },
    },
  });
  const page = await context.newPage();
  await page.goto(`file://${htmlPath}`);
  await page.waitForFunction(() => document.getElementById('ready-flag')?.dataset.ready === '1');
  await page.evaluate(() => window.startReel());
  await page.waitForFunction(
    () => document.getElementById('ready-flag')?.dataset.done === '1',
    { timeout: DURATION_MS + 5000 },
  );
  await page.waitForTimeout(400);
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();
  const recorded = await video.path();
  fs.renameSync(recorded, silentVideo);
}

async function muxAudio(hasVoice) {
  if (!hasVoice) {
    fs.copyFileSync(silentVideo, finalVideo);
    return;
  }
  run('ffmpeg', [
    '-y',
    '-i',
    silentVideo,
    '-i',
    voicePath,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-shortest',
    finalVideo,
  ]);
}

const hasVoice = await synthesizeVoice();
await renderFrames();
await muxAudio(hasVoice);
console.log(`\nDone: ${finalVideo}`);
