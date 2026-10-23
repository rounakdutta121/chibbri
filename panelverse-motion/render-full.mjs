import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const outDir = path.join(root, '..', 'deliverables');
const silent = path.join(outDir, 'panelverse-motion-30s-silent.mp4');
const final = path.join(outDir, 'panelverse-motion-30s.mp4');
const voice = path.join(outDir, 'panelverse-promo-voice.mp3');
const music = path.join(root, '..', 'reel-panelverse', 'assets', 'music-bed-30s.mp3');

const VO =
  "Why choose PanelVerse? Stop juggling freelancers, templates, and disconnected tools. We build modern websites that earn trust and authority. Landing pages engineered to convert Google and Meta ad traffic. AI automations with n eight n capture leads, sync your CRM, and alert you instantly. Design, development, and smart workflows in one partner. PanelVerse. Create, convert, automate. Visit panelverse dot onrender dot com.";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: root, ...opts });
  if (r.status !== 0) throw new Error(`${cmd} failed`);
}

fs.mkdirSync(outDir, { recursive: true });

run('npx', ['remotion', 'render', 'src/index.ts', 'PanelVersePromo', silent, '--codec', 'h264']);

if (!fs.existsSync(voice)) {
  run('pip', ['install', '-q', 'edge-tts']);
  run('/home/ubuntu/.local/bin/edge-tts', [
    '--voice',
    'en-US-ChristopherNeural',
    '--rate',
    '+5%',
    '--text',
    VO,
    '--write-media',
    voice,
  ]);
}

if (!fs.existsSync(music)) {
  const musicSrc = path.join(root, '..', 'reel-panelverse', 'assets', 'music-source.mp3');
  if (!fs.existsSync(musicSrc)) {
    run('curl', [
      '-sL',
      '-A',
      'Mozilla/5.0',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      '-o',
      musicSrc,
    ]);
  }
  run('ffmpeg', [
    '-y',
    '-ss',
    '12',
    '-i',
    musicSrc,
    '-map',
    '0:a:0',
    '-t',
    '30',
    '-af',
    'afade=t=in:st=0:d=1.2,afade=t=out:st=28.2:d=1.8,volume=0.42',
    music,
  ]);
}

run('ffmpeg', [
  '-y',
  '-i',
  silent,
  '-i',
  voice,
  '-i',
  music,
  '-filter_complex',
  '[1:a]volume=1[vo];[2:a]volume=1[mu];[vo][mu]amix=inputs=2:duration=first:dropout_transition=2[aout]',
  '-map',
  '0:v:0',
  '-map',
  '[aout]',
  '-c:v',
  'copy',
  '-c:a',
  'aac',
  '-b:a',
  '192k',
  '-t',
  '30',
  '-movflags',
  '+faststart',
  final,
]);

console.log(`Done: ${final}`);
