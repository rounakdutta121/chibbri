import React from 'react';
import {loadFont} from '@remotion/google-fonts/Montserrat';

const {fontFamily} = loadFont('normal', {
	weights: ['500', '600'],
	subsets: ['latin'],
});

export const PanelVerseCredit: React.FC = () => {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				flexShrink: 0,
			}}
		>
			<div
				style={{
					padding: '10px 22px',
					borderRadius: 999,
					background: 'linear-gradient(90deg, rgba(0,0,0,0.55), rgba(40,10,30,0.72), rgba(0,0,0,0.55))',
					border: '1px solid rgba(255, 200, 100, 0.35)',
					boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
				}}
			>
				<p
					style={{
						margin: 0,
						fontFamily,
						fontSize: 22,
						fontWeight: 500,
						letterSpacing: 0.6,
						color: 'rgba(255, 248, 235, 0.92)',
						textAlign: 'center',
					}}
				>
					<span style={{color: 'rgba(255,255,255,0.75)', fontWeight: 500}}>
						Developed By{' '}
					</span>
					<span
						style={{
							fontWeight: 600,
							background: 'linear-gradient(90deg, #FFD56B, #FF9933, #E91E63)',
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
						}}
					>
						PanelVerse
					</span>
				</p>
			</div>
		</div>
	);
};
