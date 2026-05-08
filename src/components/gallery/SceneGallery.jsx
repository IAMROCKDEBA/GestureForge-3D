import * as Icons from 'lucide-react';
import { SCENE_PRESETS } from '../../utils/constants.js';
import { makeSceneObject, useSceneStore } from '../../store/useSceneStore.js';
import { SceneCard } from './SceneCard.jsx';
import { soundEngine } from '../../core/SoundEngine.js';

export const SceneGallery = () => {
  const loadScene = useSceneStore((state) => state.loadScene);
  const loadPreset = (preset) => {
    const objects = preset.objects.map((type, index) =>
      makeSceneObject(type, {
        position: [(index % 3) * 0.8 - 0.8, 0.75 + Math.floor(index / 3) * 0.32, -1.5 - index * 0.12],
        material: { color: preset.accent }
      })
    );
    loadScene(objects, preset.title);
    soundEngine.play('mode');
  };
  return (
    <section className="glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Icons.LayoutGrid size={16} />
          <div>
            Presets
            <small>starter scenes</small>
          </div>
        </div>
      </div>
      <div className="panel-body gallery-grid">
        {SCENE_PRESETS.map((preset) => (
          <SceneCard key={preset.id} preset={preset} onClick={() => loadPreset(preset)} />
        ))}
      </div>
    </section>
  );
};
