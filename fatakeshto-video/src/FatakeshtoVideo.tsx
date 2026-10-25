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

const IMAGE_COUNT = 18;
const images = Array.from({length: IMAGE_COUNT}, (_, i) =>
	staticFile(`images/fatakeshto-${String(i + 1).padStart(2, '0')}.jpg`),
);

const getActiveSubtitle = (timeSec: number) => {
	return subtitles.find((s) => timeSec >= s.start && timeSec < s.end)?.text ?? '';
};

const SceneImage: React.FC<{src: string; frameInScene: number; sceneDuration: number}> = ({
	src,
	frameInScene,
	sceneDuration,
}) => {
	const zoom = interpolate(frameInScene, [0, sceneDuration], [1.05, 1.18], {
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.quad),
	});
	const panX = interpolate(frameInScene, [0, sceneDuration], [-2, 2], {
		extrapolateRight: 'clamp',
	});
	const panY = interpolate(frameInScene, [0, sceneDuration], [1, -1], {
		extrapolateRight: 'clamp',
	});
	const fadeIn = interpolate(frameInScene, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
	const fadeOut = interpolate(
		frameInScene,
		[sceneDuration - 10, sceneDuration],
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

	const sceneDuration = Math.floor(durationInFrames / IMAGE_COUNT);
	const sceneIndex = Math.min(IMAGE_COUNT - 1, Math.floor(frame / sceneDuration));
	const frameInScene = frame - sceneIndex * sceneDuration;
	const nextIndex = Math.min(IMAGE_COUNT - 1, sceneIndex + 1);
	const crossfade = interpolate(frameInScene, [sceneDuration - 12, sceneDuration], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const subtitle = getActiveSubtitle(timeSec);
	const subtitleOpacity = subtitle
		? interpolate(
				frame % 15,
				[0, 5, 15],
				[0.85, 1, 0.85],
				{extrapolateRight: 'clamp'},
			)
		: 0;

	const flash = interpolate(frame % 24, [0, 3, 24], [0.08, 0, 0], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: '#0a0208'}}>
			<SceneImage
				src={images[sceneIndex]}
				frameInScene={frameInScene}
				sceneDuration={sceneDuration}
			/>
			{crossfade > 0 && (
				<AbsoluteFill style={{opacity: crossfade}}>
					<SceneImage
						src={images[nextIndex]}
						frameInScene={0}
						sceneDuration={sceneDuration}
					/>
				</AbsoluteFill>
			)}

			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg, rgba(120,0,40,${flash}) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.75) 100%)`,
				}}
			/>

			<AbsoluteFill
				style={{
					justifyContent: 'flex-end',
					alignItems: 'center',
					padding: '0 48px 72px',
				}}
			>
				{subtitle && (
					<div
						style={{
							opacity: subtitleOpacity,
							maxWidth: 1200,
							backgroundColor: 'rgba(0,0,0,0.72)',
							border: '2px solid rgba(255,200,80,0.45)',
							borderRadius: 12,
							padding: '18px 28px',
							boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
						}}
					>
						<p
							style={{
								margin: 0,
								color: '#fff8e7',
								fontFamily: 'Georgia, "Times New Roman", serif',
								fontSize: 34,
								lineHeight: 1.35,
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
			<Audio src={staticFile('bg-music.mp3')} volume={0.14} startFrom={0} endAt={durationInFrames} />
		</AbsoluteFill>
	);
};
