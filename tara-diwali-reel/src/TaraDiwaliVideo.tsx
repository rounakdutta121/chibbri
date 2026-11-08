import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Img,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	Easing,
} from 'remotion';
import subtitles from './subtitles.json';
import scenes from './scenes.json';
import {PremiumSubtitle} from './PremiumSubtitle';
import {PanelVerseCredit} from './PanelVerseCredit';

type Scene = (typeof scenes)[number];

const images = (index: number) =>
	staticFile(`images/tara-${String(index).padStart(2, '0')}.jpg`);

const getActiveScene = (timeSec: number): Scene => {
	const found = scenes.find((s) => timeSec >= s.start && timeSec < s.end);
	return found ?? scenes[scenes.length - 1];
};

const SceneImage: React.FC<{
	src: string;
	frameInScene: number;
	sceneDurationFrames: number;
	transition: string;
	isIncoming?: boolean;
}> = ({src, frameInScene, sceneDurationFrames, transition, isIncoming}) => {
	const t = sceneDurationFrames;
	const enterFrames = Math.min(8, Math.floor(t / 3));

	let opacity = 1;
	let slideX = 0;
	let slideY = 0;
	let scale = 1;
	let rot = 0;
	let flash = 0;

	if (transition === 'cut') {
		opacity = isIncoming
			? interpolate(frameInScene, [0, 3], [0, 1], {extrapolateRight: 'clamp'})
			: 1;
		scale = interpolate(frameInScene, [0, t], [1.06, 1.14], {extrapolateRight: 'clamp'});
	} else if (transition === 'slide') {
		const p = isIncoming
			? interpolate(frameInScene, [0, enterFrames], [100, 0], {
					extrapolateRight: 'clamp',
					easing: Easing.out(Easing.cubic),
				})
			: interpolate(frameInScene, [t - enterFrames, t], [0, -18], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
		slideX = isIncoming ? p : p;
		scale = 1.08;
	} else if (transition === 'wipe') {
		const p = interpolate(frameInScene, [0, enterFrames], [0, 1], {
			extrapolateRight: 'clamp',
		});
		slideY = isIncoming ? interpolate(p, [0, 1], [28, 0]) : 0;
		opacity = isIncoming ? p : 1;
		scale = interpolate(frameInScene, [0, t], [1.12, 1.22], {extrapolateRight: 'clamp'});
	} else if (transition === 'zoom') {
		scale = interpolate(frameInScene, [0, t], [1.25, 1.02], {
			extrapolateRight: 'clamp',
			easing: Easing.out(Easing.exp),
		});
		opacity = interpolate(frameInScene, [0, 5], [0, 1], {extrapolateRight: 'clamp'});
	} else if (transition === 'flash') {
		flash = interpolate(frameInScene, [0, 4, 8], [0.85, 0.15, 0], {
			extrapolateRight: 'clamp',
		});
		scale = interpolate(frameInScene, [0, t], [1.1, 1.18], {extrapolateRight: 'clamp'});
		rot = interpolate(frameInScene, [0, t], [-1.2, 1.2], {extrapolateRight: 'clamp'});
	}

	const fadeOut = interpolate(
		frameInScene,
		[t - 6, t],
		[1, isIncoming ? 1 : 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	opacity = Math.min(opacity, fadeOut);

	return (
		<AbsoluteFill style={{opacity}}>
			<Img
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${scale}) translate(${slideX}%, ${slideY}%) rotate(${rot}deg)`,
					filter: transition === 'flash' ? `brightness(${1.1 + flash * 0.5})` : undefined,
				}}
			/>
			{flash > 0.05 && (
				<AbsoluteFill
					style={{
						background: `rgba(255,200,120,${flash * 0.55})`,
						mixBlendMode: 'screen',
					}}
				/>
			)}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(circle at center, transparent 42%, rgba(40,0,60,0.35) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};

export const TaraDiwaliVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const timeSec = frame / fps;

	const scene = getActiveScene(timeSec);
	const sceneIndex = scenes.indexOf(scene);
	const prevScene = sceneIndex > 0 ? scenes[sceneIndex - 1] : null;
	const nextScene = scenes[sceneIndex + 1];

	const sceneStartFrame = Math.round(scene.start * fps);
	const sceneEndFrame = Math.round(scene.end * fps);
	const sceneDurationFrames = Math.max(1, sceneEndFrame - sceneStartFrame);
	const frameInScene = frame - sceneStartFrame;

	const handoff =
		nextScene && frameInScene >= sceneDurationFrames - 7
			? interpolate(
					frameInScene,
					[sceneDurationFrames - 7, sceneDurationFrames],
					[0, 1],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)
			: 0;

	const activeSubtitle = subtitles.find((s) => timeSec >= s.start && timeSec < s.end);
	const subtitle = activeSubtitle?.text ?? '';
	const subtitleKey = activeSubtitle ? `${activeSubtitle.start}-${activeSubtitle.text}` : 'none';

	const beat = interpolate(frame % 18, [0, 9, 18], [0, 0.14, 0], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: '#1a0520'}}>
			{prevScene && frameInScene < 4 && (
				<AbsoluteFill style={{opacity: 1 - frameInScene / 4}}>
					<SceneImage
						src={images(prevScene.image)}
						frameInScene={sceneDurationFrames - (4 - frameInScene)}
						sceneDurationFrames={sceneDurationFrames}
						transition={prevScene.transition ?? 'cut'}
					/>
				</AbsoluteFill>
			)}

			<SceneImage
				src={images(scene.image)}
				frameInScene={frameInScene}
				sceneDurationFrames={sceneDurationFrames}
				transition={scene.transition ?? 'cut'}
			/>

			{handoff > 0 && nextScene && (
				<AbsoluteFill style={{opacity: handoff}}>
					<SceneImage
						src={images(nextScene.image)}
						frameInScene={0}
						sceneDurationFrames={Math.round((nextScene.end - nextScene.start) * fps)}
						transition={nextScene.transition ?? 'cut'}
						isIncoming
					/>
				</AbsoluteFill>
			)}

			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg, rgba(255,120,40,${beat}) 0%, transparent 18%, transparent 48%, rgba(0,0,0,0.72) 88%, rgba(0,0,0,0.85) 100%)`,
				}}
			/>

			<PanelVerseCredit />

			<AbsoluteFill
				style={{
					justifyContent: 'flex-end',
					alignItems: 'center',
					padding: '0 24px 220px',
					zIndex: 30,
				}}
			>
				{subtitle && activeSubtitle && (
					<PremiumSubtitle
						key={subtitleKey}
						text={subtitle}
						subtitleKey={subtitleKey}
						frameInSubtitle={frame - Math.round(activeSubtitle.start * fps)}
					/>
				)}
			</AbsoluteFill>

			<Audio src={staticFile('voiceover.mp3')} volume={1} />
			<Audio
				src={staticFile('bg-music.mp3')}
				volume={0.16}
				startFrom={Math.round(15 * fps)}
				endAt={durationInFrames}
			/>
		</AbsoluteFill>
	);
};
