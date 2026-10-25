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

type Scene = (typeof scenes)[number];

const images = (index: number) =>
	staticFile(`images/fatakeshto-${String(index).padStart(2, '0')}.jpg`);

const getActiveSubtitle = (timeSec: number) => {
	return subtitles.find((s) => timeSec >= s.start && timeSec < s.end)?.text ?? '';
};

const getActiveScene = (timeSec: number): Scene => {
	const found = scenes.find((s) => timeSec >= s.start && timeSec < s.end);
	return found ?? scenes[scenes.length - 1];
};

const SceneImage: React.FC<{
	src: string;
	frameInScene: number;
	sceneDurationFrames: number;
}> = ({src, frameInScene, sceneDurationFrames}) => {
	const zoom = interpolate(frameInScene, [0, sceneDurationFrames], [1.02, 1.1], {
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.quad),
	});
	const panX = interpolate(frameInScene, [0, sceneDurationFrames], [-0.5, 0.5], {
		extrapolateRight: 'clamp',
	});
	const panY = interpolate(frameInScene, [0, sceneDurationFrames], [1, -1.5], {
		extrapolateRight: 'clamp',
	});
	const fadeIn = interpolate(frameInScene, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
	const fadeOut = interpolate(
		frameInScene,
		[sceneDurationFrames - 12, sceneDurationFrames],
		[1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const opacity = Math.min(fadeIn, fadeOut);

	return (
		<AbsoluteFill style={{opacity}}>
			<Img
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};

export const FatakeshtoVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const timeSec = frame / fps;

	const scene = getActiveScene(timeSec);
	const sceneIndex = scenes.indexOf(scene);
	const nextScene = scenes[sceneIndex + 1];

	const sceneStartFrame = Math.round(scene.start * fps);
	const sceneEndFrame = Math.round(scene.end * fps);
	const sceneDurationFrames = Math.max(1, sceneEndFrame - sceneStartFrame);
	const frameInScene = frame - sceneStartFrame;

	const crossfade =
		nextScene && frameInScene >= sceneDurationFrames - 12
			? interpolate(
					frameInScene,
					[sceneDurationFrames - 12, sceneDurationFrames],
					[0, 1],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)
			: 0;

	const subtitle = getActiveSubtitle(timeSec);
	const subtitleOpacity = subtitle
		? interpolate(frame % 15, [0, 5, 15], [0.85, 1, 0.85], {extrapolateRight: 'clamp'})
		: 0;

	const flash = interpolate(frame % 24, [0, 3, 24], [0.08, 0, 0], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: '#0a0208'}}>
			<SceneImage
				src={images(scene.image)}
				frameInScene={frameInScene}
				sceneDurationFrames={sceneDurationFrames}
			/>
			{crossfade > 0 && nextScene && (
				<AbsoluteFill style={{opacity: crossfade}}>
					<SceneImage
						src={images(nextScene.image)}
						frameInScene={0}
						sceneDurationFrames={Math.round((nextScene.end - nextScene.start) * fps)}
					/>
				</AbsoluteFill>
			)}

			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg, rgba(120,0,40,${flash}) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.82) 100%)`,
				}}
			/>

			<AbsoluteFill
				style={{
					justifyContent: 'flex-end',
					alignItems: 'center',
					padding: '0 36px 140px',
				}}
			>
				{subtitle && (
					<div
						style={{
							opacity: subtitleOpacity,
							maxWidth: 980,
							width: '100%',
							backgroundColor: 'rgba(0,0,0,0.78)',
							border: '2px solid rgba(255,200,80,0.45)',
							borderRadius: 16,
							padding: '16px 22px',
							boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
						}}
					>
						<p
							style={{
								margin: 0,
								color: '#fff8e7',
								fontFamily: 'Georgia, "Times New Roman", serif',
								fontSize: 30,
								lineHeight: 1.4,
								textAlign: 'center',
								textShadow: '0 2px 8px rgba(0,0,0,0.8)',
							}}
						>
							{subtitle}
						</p>
					</div>
				)}
			</AbsoluteFill>

			<Audio src={staticFile('voiceover.mp3')} volume={1} />
			<Audio
				src={staticFile('bg-music.mp3')}
				volume={0.14}
				startFrom={0}
				endAt={durationInFrames}
			/>
		</AbsoluteFill>
	);
};
