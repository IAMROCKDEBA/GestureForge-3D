import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from './WelcomeScreen.jsx';
import { GestureStep } from './GestureStep.jsx';
import { useUIStore } from '../../store/useUIStore.js';
import { GESTURES } from '../../utils/constants.js';
import { soundEngine } from '../../core/SoundEngine.js';

const steps = [
  {
    title: 'Camera Permission',
    copy: 'Start the camera to turn the viewport into an AR backdrop. On mobile, GestureForge tries a back-camera scene feed plus a front-camera hand feed when the browser allows it.',
    gesture: 'camera',
    simulate: null
  },
  {
    title: 'Pinch To Create',
    copy: 'Bring thumb and index finger together. Hold for a short lock pulse, then a primitive appears where your hand is.',
    gesture: 'pinch',
    simulate: GESTURES.PINCH
  },
  {
    title: 'Open Palm Menu',
    copy: 'Hold an open palm facing the camera to reveal the radial object menu near your hand.',
    gesture: 'open palm',
    simulate: GESTURES.OPEN_PALM
  },
  {
    title: 'Shape Modes',
    copy: 'Peace sign switches to line drawing, three fingers to surfaces, four fingers to solids, and a fist locks the active object.',
    gesture: 'mode signs',
    simulate: GESTURES.PEACE
  }
];

export const TutorialOverlay = ({ camera, onSimulate }) => {
  const tutorialOpen = useUIStore((state) => state.tutorialOpen);
  const tutorialComplete = useUIStore((state) => state.tutorialComplete);
  const completeTutorial = useUIStore((state) => state.completeTutorial);
  const [index, setIndex] = useState(tutorialComplete ? 1 : 0);
  if (!tutorialOpen) return null;

  const finish = () => {
    completeTutorial();
    soundEngine.play('mode');
  };

  const runSim = (gesture) => {
    if (gesture) onSimulate?.(gesture);
    if (gesture === null) camera.start();
  };

  return (
    <div className="tutorial-shell">
      <AnimatePresence mode="wait">
        {index === 0 ? (
          <WelcomeScreen key="welcome" onBegin={() => setIndex(1)} onSkip={finish} />
        ) : (
          <GestureStep
            key={steps[index - 1].title}
            {...steps[index - 1]}
            onBack={() => setIndex(Math.max(0, index - 1))}
            onNext={() => (index >= steps.length ? finish() : setIndex(index + 1))}
            onSimulate={() => runSim(steps[index - 1].simulate)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
