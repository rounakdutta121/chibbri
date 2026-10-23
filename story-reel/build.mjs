import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'story.json'), 'utf8'));
const imgDir = path.join(root, 'assets', 'images');
const audioDir = path.join(root, 'assets', 'audio');
const tmpDir = path.join(root, '.tmp');
const outVideo = path.join(root, '..', 'deliverables', 'suspense-story-reel-60s.mp4');

const { width, height, fps, sceneDuration, transitionDuration, scenes, sfx } = cfg;
const transitions = [
  'fade',
  'wipeleft',
  'wiperight',
  'slideup',
  'slidedown',
  'circlecrop',
  'rectcrop',
  'distance',
  'fadeblack',
  'fadewhite',
  'hrwind',
  'hlwind',
  'dissolve',
  'pixelize',
  'squeezev',
];

const motions = [
  "z='min(1.15,zoom+0.0018)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'",
  "z='min(1.25,zoom+0.0022)':x='iw/2-(iw/zoom/2)+on*1.2':y='ih/2-(ih/zoom/2)'",
  "z='if(lte(zoom,1.0),1.25,max(1.0,zoom-0.0018))':x='iw/2-(iw/zoom/2)-on*1.0':y='ih/2-(ih/zoom/2)'",
  "z='min(1.2,zoom+0.0015)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)+on*0.8'",
  "z='min(1.3,zoom+0.0025)':x='iw/2-(iw/zoom/2)-on*1.5':y='ih/2-(ih/zoom/2)+on*0.5'",
];

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${cmd} failed`);
}

fs.mkdirSync(tmpDir, { recursive: true });

const frames = Math.ceil(sceneDuration * fps);
const clips = [];

scenes.forEach((scene, i) => {
  const input = path.join(imgDir, scene.image);
  const clip = path.join(tmpDir, `clip_${String(i).padStart(2, '0')}.mp4`);
  const motion = motions[i % motions.length];
  const vf = [
    `scale=${width}:${height}:force_original_aspect_ratio=increase`,
    `crop=${width}:${height}`,
    `zoompan=${motion}:d=${frames}:s=${width}x${height}:fps=${fps}`,
    `eq=contrast=1.08:saturation=1.12`,
    `noise=alls=8:allf=t+u`,
  ].join(',');
  run('ffmpeg', ['-y', '-loop', '1', '-i', input, '-vf', vf, '-t', String(sceneDuration), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', clip]);
  clips.push(clip);
});

// Build xfade chain
let offset = sceneDuration - transitionDuration;
let filter = `[0:v]fps=${fps}[v0]`;
for (let i = 1; i < clips.length; i++) {
  filter += `;[${i}:v]fps=${fps}[v${i}]`;
}
let last = 'v0';
for (let i = 1; i < clips.length; i++) {
  const out = i === clips.length - 1 ? 'vout' : `x${i}`;
  const tr = transitions[(i - 1) % transitions.length];
  filter += `;[${last}][v${i}]xfade=transition=${tr}:duration=${transitionDuration}:offset=${offset.toFixed(3)}[${out}]`;
  last = out;
  offset += sceneDuration - transitionDuration;
}

const silentVideo = path.join(tmpDir, 'silent.mp4');
const ffArgs = ['-y'];
clips.forEach((c) => {
  ffArgs.push('-i', c);
});
ffArgs.push('-filter_complex', filter, '-map', '[vout]', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', silentVideo);
run('ffmpeg', ffArgs);

// ASS subtitles with motion
const assPath = path.join(tmpDir, 'subs.ass');
const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Main,Arial Black,56,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,4,2,2,40,40,180,1
Style: Alt,Arial Black,48,&H00E6F3FF,&H000000FF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,3,2,8,40,40,220,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

const moves = [
  '{\\fad(120,120)\\move(540,1650,540,1520,0,400)}',
  '{\\fad(100,100)\\move(120,900,120,820,0,350)\\fscx110\\fscy110}',
  '{\\fad(100,100)\\move(960,1100,880,1100,0,300)}',
  '{\\fad(150,150)\\move(540,400,540,480,0,350)}',
  '{\\fad(80,80)\\fscx120\\fscy120\\t(0,300,\\fscx100\\fscy100)}',
  '{\\fad(120,120)\\move(540,1700,540,1580,0,450)}',
];

let events = '';
const step = sceneDuration - transitionDuration;
scenes.forEach((scene, i) => {
  const start = i * step;
  const end = start + sceneDuration - 0.2;
  const style = i % 2 === 0 ? 'Main' : 'Alt';
  const tag = moves[i % moves.length];
  const text = scene.subtitle.replace(/\n/g, '\\N');
  events += `Dialogue: 0,${toAss(start)},${toAss(end)},${style},,0,0,0,,${tag}${text}\n`;
});

fs.writeFileSync(assPath, header + events);

const withSubs = path.join(tmpDir, 'with-subs.mp4');
run('ffmpeg', [
  '-y',
  '-i',
  silentVideo,
  '-vf',
  `ass=${assPath.replace(/:/g, '\\:')}`,
  '-c:v',
  'libx264',
  '-crf',
  '18',
  '-pix_fmt',
  'yuv420p',
  withSubs,
]);

// Audio mix
const music = path.join(audioDir, 'music.mp3');
let filterAudio = `[1:a]atrim=0:60,asetpts=PTS-STARTPTS,volume=0.38[m]`;
let inputs = ['-i', withSubs, '-i', music];
let mixInputs = '[m]';
let idx = 2;
sfx.forEach((s) => {
  const p = path.join(audioDir, s.file);
  if (!fs.existsSync(p)) return;
  inputs.push('-i', p);
  filterAudio += `;[${idx}:a]adelay=${Math.round(s.start * 1000)}|${Math.round(s.start * 1000)},volume=${s.volume}[s${idx}]`;
  mixInputs += `[s${idx}]`;
  idx++;
});
filterAudio += `;${mixInputs}amix=inputs=${idx - 1}:duration=first:dropout_transition=2,afade=t=in:st=0:d=1.5,afade=t=out:st=57.5:d=2.5[aout]`;

run('ffmpeg', [
  '-y',
  ...inputs,
  '-filter_complex',
  filterAudio,
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
  '60',
  '-movflags',
  '+faststart',
  outVideo,
]);

console.log(`\nDone: ${outVideo}`);

function toAss(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const cs = Math.floor((s - Math.floor(s)) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(Math.floor(s)).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}
