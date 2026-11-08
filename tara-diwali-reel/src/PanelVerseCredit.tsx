import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Montserrat';

const {fontFamily} = loadFont('normal', {
	weights: ['500', '600'],
	subsets: ['latin'],
});

export const PanelVerseCredit: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame % 45, [0, 22, 45], [0.72, 1, 0.72], {
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				position: 'absolute',
				top: 44,
				left: 0,
				right: 0,
				display: 'flex',
				justifyContent: 'center',
				pointerEvents: 'none',
				zIndex: 40,
			}}
		>
			<p
				style={{
					margin: 0,
					padding: '6px 14px',
					borderRadius: 999,
					fontFamily,
					fontSize: 15,
					fontWeight: 500,
					letterSpacing: 0.4,
					color: `rgba(255, 245, 230, ${opacity})`,
					background: 'rgba(0,0,0,0.42)',
					border: '1px solid rgba(255, 180, 80, 0.28)',
					textAlign: 'center',
				}}
			>
				<span style={{color: 'rgba(255,255,255,0.7)'}}>Developed by </span>
				<span
					style={{
						fontWeight: 600,
						color: '#FFB84D',
						textShadow: '0 0 12px rgba(255, 140, 40, 0.45)',
					}}
				>
					PanelVerse
				</span>
			</p>
		</div>
	);
};
