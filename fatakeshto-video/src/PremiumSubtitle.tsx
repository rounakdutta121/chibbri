import React, {useMemo} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadSans} from '@remotion/google-fonts/Montserrat';

const {fontFamily: displayFont} = loadFont('normal', {
	weights: ['600', '700'],
	subsets: ['latin'],
});

const {fontFamily: accentFont} = loadSans('normal', {
	weights: ['500', '600'],
	subsets: ['latin'],
});

const HIGHLIGHT_WORDS = [
	'Kolkata',
	'Kali',
	'Fata',
	'Keshto',
	'Krishna',
	'Naba',
	'Jubak',
	'Kumartuli',
	'Amavasya',
	'Diwali',
	'Maa',
	'1957',
	'1992',
	'anjali',
];

const renderRichText = (text: string) => {
	const parts = text.split(/(\s+|—|–)/);
	return parts.map((part, i) => {
		const clean = part.replace(/[^a-zA-Z0-9']/g, '');
		const isHighlight = HIGHLIGHT_WORDS.some(
			(w) => clean.toLowerCase() === w.toLowerCase() || clean.includes(w),
		);
		if (part.trim() === '' || part === '—' || part === '–') {
			return <span key={i}>{part}</span>;
		}
		return (
			<span
				key={i}
				style={{
					color: isHighlight ? '#FFD56B' : '#FFF9F0',
					fontWeight: isHighlight ? 700 : 600,
					fontFamily: isHighlight ? accentFont : displayFont,
					textShadow: isHighlight
						? '0 0 18px rgba(255, 160, 40, 0.65), 0 2px 4px rgba(0,0,0,0.9)'
						: '0 2px 6px rgba(0,0,0,0.85)',
				}}
			>
				{part}
			</span>
		);
	});
};

export const PremiumSubtitle: React.FC<{
	text: string;
	subtitleKey: string;
	frameInSubtitle: number;
}> = ({text, subtitleKey, frameInSubtitle}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const enter = spring({
		frame: frameInSubtitle,
		fps,
		config: {damping: 18, stiffness: 180, mass: 0.7},
		durationInFrames: 20,
	});

	const slideY = interpolate(enter, [0, 1], [18, 0]);
	const scale = interpolate(enter, [0, 1], [0.94, 1]);
	const glowPulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.35, 0.75]);

	const shimmer = useMemo(
		() =>
			interpolate(frame % 90, [0, 45, 90], [-120, 40, 160], {
				extrapolateRight: 'clamp',
			}),
		[frame],
	);

	return (
		<div
			key={subtitleKey}
			style={{
				transform: `translateY(${slideY}px) scale(${scale})`,
				opacity: enter,
				maxWidth: 900,
				width: '100%',
				position: 'relative',
				padding: '1px',
				borderRadius: 16,
				background: `linear-gradient(135deg, rgba(255,180,60,0.95), rgba(180,40,90,0.85), rgba(255,220,120,0.9))`,
				boxShadow: `0 0 ${30 + glowPulse * 20}px rgba(255, 140, 30, 0.35), 0 16px 40px rgba(0,0,0,0.55)`,
			}}
		>
			<div
				style={{
					borderRadius: 14,
					padding: '12px 18px 14px',
					background:
						'linear-gradient(165deg, rgba(18,6,16,0.88) 0%, rgba(8,2,10,0.92) 100%)',
					backdropFilter: 'blur(8px)',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: shimmer,
						width: 120,
						height: '100%',
						background:
							'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
						transform: 'skewX(-18deg)',
						pointerEvents: 'none',
					}}
				/>
				<p
					style={{
						margin: 0,
						fontFamily: displayFont,
						fontSize: 26,
						lineHeight: 1.35,
						textAlign: 'center',
						letterSpacing: 0.25,
					}}
				>
					{renderRichText(text)}
				</p>
				<div
					style={{
						marginTop: 10,
						height: 2,
						borderRadius: 999,
						background:
							'linear-gradient(90deg, transparent, #FF9933, #FFD56B, #E91E63, transparent)',
						opacity: 0.85,
					}}
				/>
			</div>
		</div>
	);
};
