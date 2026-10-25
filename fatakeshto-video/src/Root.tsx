import React from 'react';
import {Composition} from 'remotion';
import {FatakeshtoVideo} from './FatakeshtoVideo';

const FPS = 30;
const DURATION_SEC = 65.15;

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="FatakeshtoVideo"
			component={FatakeshtoVideo}
			durationInFrames={Math.ceil(DURATION_SEC * FPS)}
			fps={FPS}
			width={1920}
			height={1080}
		/>
	);
};
