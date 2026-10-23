import { Composition } from 'remotion';
import { PanelVersePromo } from './PanelVersePromo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PanelVersePromo"
        component={PanelVersePromo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
