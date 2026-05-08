import * as Icons from 'lucide-react';
import { GESTURES, MODES } from '../../utils/constants.js';
import { useSceneStore } from '../../store/useSceneStore.js';
import { useUIStore } from '../../store/useUIStore.js';
import { DarkModeToggle } from './DarkModeToggle.jsx';
import { soundEngine } from '../../core/SoundEngine.js';

const Icon = ({ name, ...props }) => {
  const Component = Icons[name] ?? Icons.Box;
  return <Component {...props} />;
};

const modeItems = [
  [MODES.CREATE, 'Create', 'Sparkles'],
  [MODES.LINE, 'Line', 'Spline'],
  [MODES.SURFACE, 'Surface', 'Layers'],
  [MODES.SOLID, 'Solid', 'Box'],
  [MODES.GRAB, 'Grab', 'Hand'],
  [MODES.ROTATE, 'Rotate', 'RotateCw'],
  [MODES.SCALE, 'Scale', 'Scale3D']
];

export const TopBar = ({ camera, trackingStatus, onExportGLB, onExportPNG, onSimulate }) => {
  const mode = useSceneStore((state) => state.mode);
  const setMode = useSceneStore((state) => state.setMode);
  const sceneName = useSceneStore((state) => state.sceneName);
  const physicsEnabled = useSceneStore((state) => state.physicsEnabled);
  const togglePhysics = useSceneStore((state) => state.togglePhysics);
  const replayTutorial = useUIStore((state) => state.replayTutorial);
  const setSceneTreeOpen = useUIStore((state) => state.setSceneTreeOpen);
  const sceneTreeOpen = useUIStore((state) => state.sceneTreeOpen);
  const setRightPanelOpen = useUIStore((state) => state.setRightPanelOpen);
  const rightPanelOpen = useUIStore((state) => state.rightPanelOpen);
  const trackingOn = trackingStatus?.state === 'running';

  const handleMode = (nextMode) => {
    setMode(nextMode);
    soundEngine.play('mode');
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="ScanLine" size={18} />
        </div>
        <div>
          <h1>GestureForge 3D</h1>
          <span>{sceneName}</span>
        </div>
      </div>
      <nav className="mode-strip" aria-label="Creation modes">
        {modeItems.map(([id, label, icon]) => (
          <button key={id} className={`mode-pill ${mode === id ? 'active' : ''}`} onClick={() => handleMode(id)} title={label}>
            <Icon name={icon} size={14} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="top-actions">
        <span className="mini-pill optional-action" title={trackingOn ? 'Hands detected' : 'Waiting for hand tracking'}>
          <span className={`status-dot ${trackingOn ? 'on' : ''}`} />
          {trackingOn ? 'Hands' : 'Camera'}
        </span>
        <button className="icon-button" onClick={() => setSceneTreeOpen(!sceneTreeOpen)} title="Toggle scene tree">
          <Icon name="PanelLeft" size={17} />
        </button>
        <button className="icon-button" onClick={() => setRightPanelOpen(!rightPanelOpen)} title="Toggle editor panels">
          <Icon name="PanelRight" size={17} />
        </button>
        <button className="icon-button" onClick={camera.start} title="Start camera">
          <Icon name="Camera" size={17} />
        </button>
        <button className={`icon-button ${physicsEnabled ? 'active' : ''}`} onClick={togglePhysics} title="Toggle physics">
          <Icon name="Atom" size={17} />
        </button>
        <button className="icon-button optional-action" onClick={() => onSimulate?.(GESTURES.PINCH)} title="Simulate pinch">
          <Icon name="MousePointerClick" size={17} />
        </button>
        <button className="icon-button optional-action" onClick={onExportPNG} title="Export PNG">
          <Icon name="ImageDown" size={17} />
        </button>
        <button className="icon-button" onClick={onExportGLB} title="Export GLB">
          <Icon name="Download" size={17} />
        </button>
        <button className="icon-button" onClick={replayTutorial} title="Replay tutorial">
          <Icon name="CircleHelp" size={17} />
        </button>
        <DarkModeToggle />
      </div>
    </header>
  );
};
