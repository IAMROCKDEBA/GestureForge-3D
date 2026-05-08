import * as Icons from 'lucide-react';
import { useUIStore } from '../../store/useUIStore.js';

export const SoundMixer = () => {
  const muted = useUIStore((state) => state.soundMuted);
  const volume = useUIStore((state) => state.soundVolume);
  const setSoundMuted = useUIStore((state) => state.setSoundMuted);
  const setSoundVolume = useUIStore((state) => state.setSoundVolume);

  return (
    <div className="control-row">
      <label>
        Sound
        <button className="icon-button" onClick={() => setSoundMuted(!muted)} title={muted ? 'Unmute' : 'Mute'}>
          {muted ? <Icons.VolumeX size={14} /> : <Icons.Volume2 size={14} />}
        </button>
      </label>
      <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setSoundVolume(Number(event.target.value))} />
    </div>
  );
};
