import React from 'react';
import {Composition} from 'remotion';
import {TaraDiwaliVideo} from './TaraDiwaliVideo';

const FPS = 30;
const DURATION_SEC = 77.48;

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="TaraDiwaliReel"
			component={TaraDiwaliVideo}
			durationInFrames={Math.ceil(DURATION_SEC * FPS)}
			fps={FPS}
			width={1080}
			height={1920}
		/>
	);
};
