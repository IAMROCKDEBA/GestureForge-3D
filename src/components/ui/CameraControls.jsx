import * as Icons from 'lucide-react';
import { useCameraStore } from '../../store/useCameraStore.js';

export const CameraControls = ({ camera }) => {
  const zoom = useCameraStore((state) => state.zoom);
  const brightness = useCameraStore((state) => state.brightness);
  const frozen = useCameraStore((state) => state.frozen);
  const selfieMode = useCameraStore((state) => state.selfieMode);
  const handCamActive = useCameraStore((state) => state.handCamActive);
  const setZoom = useCameraStore((state) => state.setZoom);
  const setBrightness = useCameraStore((state) => state.setBrightness);
  const setFrozen = useCameraStore((state) => state.setFrozen);
  const toggleSelfieMode = useCameraStore((state) => state.toggleSelfieMode);
  const toggleFacingMode = useCameraStore((state) => state.toggleFacingMode);

  return (
    <section className="glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Icons.Camera size={16} />
          <div>
            Camera
            <small>{handCamActive ? 'Hand cam active' : 'single feed'}</small>
          </div>
        </div>
        <button className="icon-button" onClick={camera.start} title="Restart camera">
          <Icons.RefreshCw size={15} />
        </button>
      </div>
      <div className="panel-body camera-controls">
        <div className="segmented">
          <button className="text-button" onClick={toggleFacingMode}>
            <Icons.SwitchCamera size={14} />
            Flip
          </button>
          <button className={`text-button ${selfieMode ? 'active' : ''}`} onClick={toggleSelfieMode}>
            <Icons.UserRound size={14} />
            Selfie
          </button>
          <button className={`text-button ${frozen ? 'active' : ''}`} onClick={() => setFrozen(!frozen)}>
            {frozen ? <Icons.Play size={14} /> : <Icons.Pause size={14} />}
            Freeze
          </button>
        </div>
        <div className="control-row">
          <label>
            Zoom
            <span>{zoom.toFixed(1)}x</span>
          </label>
          <input type="range" min="1" max="1.8" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
        </div>
        <div className="control-row">
          <label>
            Brightness
            <span>{Math.round(brightness * 100)}%</span>
          </label>
          <input type="range" min="0.6" max="1.45" step="0.05" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} />
        </div>
      </div>
    </section>
  );
};
