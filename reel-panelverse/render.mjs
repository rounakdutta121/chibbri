import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const assetsDir = path.join(root, 'assets');
const outDir = path.join(root, '..', 'deliverables');
const htmlPath = path.join(root, 'index.html');
const musicSource = path.join(assetsDir, 'music-source.mp3');
const musicBed = path.join(assetsDir, 'music-bed-30s.mp3');
const silentVideo = path.join(outDir, 'panelverse-promo-silent.mp4');
const voicePath = path.join(outDir, 'panelverse-promo-voice.mp3');
const finalVideo = path.join(outDir, 'panelverse-promo-30s.mp4');

const WIDTH = 1080;
const HEIGHT = 1920;
const REEL_SECONDS = 30;

/** SoundHelix — royalty-free example track (commercial use allowed per soundhelix.com/licensing) */
const MUSIC_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3';

const VO_TEXT = `Why choose PanelVerse? Stop juggling freelancers, templates, and disconnected tools. We build modern websites that earn trust and authority. Landing pages engineered to convert Google and Meta ad traffic. AI automations with n eight n capture leads, sync your CRM, and alert you instantly. Design, development, and smart workflows in one partner. PanelVerse. Create, convert, automate. Visit panelverse dot onrender dot com.`;

fs.mkdirSync(assetsDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.status}`);
}

function runCapture(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.status}\n${r.stderr}`);
  return r.stdout;
}

async function ensureMusic() {
  if (!fs.existsSync(musicSource) || fs.statSync(musicSource).size < 100_000) {
    console.log('Downloading royalty-free background music…');
    run('curl', ['-sL', '-A', 'Mozilla/5.0', MUSIC_URL, '-o', musicSource]);
  }
  run('ffmpeg', [
    '-y',
    '-ss',
    '12',
    '-i',
    musicSource,
    '-map',
    '0:a:0',
    '-t',
    String(REEL_SECONDS),
    '-af',
    'afade=t=in:st=0:d=1.2,afade=t=out:st=28.2:d=1.8,volume=0.42',
    musicBed,
  ]);
}

async function synthesizeVoice() {
  try {
    run('pip', ['install', '-q', 'edge-tts']);
    run('/home/ubuntu/.local/bin/edge-tts', [
      '--voice',
      'en-US-ChristopherNeural',
      '--rate',
      '+5%',
      '--text',
      VO_TEXT,
      '--write-media',
      voicePath,
    ]);
  } catch (e) {
    console.warn('Voice synthesis failed:', e.message);
    return false;
  }
  return fs.existsSync(voicePath);
}

async function renderVideo() {
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
    { timeout: 55000 },
  );
  await page.waitForTimeout(500);
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();
  const recorded = await video.path();
  fs.renameSync(recorded, silentVideo);
}

function muxFinal(hasVoice) {
  const filter = hasVoice
    ? '[1:a]volume=1.0[vo];[2:a]volume=1.0[mu];[vo][mu]amix=inputs=2:duration=first:dropout_transition=2[aout]'
    : '[1:a]volume=1.0[aout]';

  const args = [
    '-y',
    '-i',
    silentVideo,
    '-i',
    hasVoice ? voicePath : musicBed,
  ];
  if (hasVoice) args.push('-i', musicBed);
  args.push(
    '-filter_complex',
    filter,
    '-map',
    '0:v:0',
    '-map',
    '[aout]',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '18',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-movflags',
    '+faststart',
    '-t',
    String(REEL_SECONDS),
    finalVideo,
  );
  run('ffmpeg', args);
}

await ensureMusic();
const hasVoice = await synthesizeVoice();
await renderVideo();
muxFinal(hasVoice);

const dur = runCapture('ffprobe', [
  '-v',
  'quiet',
  '-show_entries',
  'format=duration',
  '-of',
  'default=noprint_wrappers=1:nokey=1',
  finalVideo,
]).trim();

console.log(`\nDone: ${finalVideo} (${dur}s)`);
