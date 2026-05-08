import * as Icons from 'lucide-react';
import { useSceneStore } from '../../store/useSceneStore.js';
import { soundEngine } from '../../core/SoundEngine.js';

const modes = ['dynamic', 'static', 'kinematic'];

export const PhysicsPanel = ({ object, threeSceneRef }) => {
  const updateObject = useSceneStore((state) => state.updateObject);
  const updatePhysics = (patch) => updateObject(object.id, { physics: patch }, { label: 'Changed physics' });
  return (
    <div className="control-stack">
      <div className="control-row">
        <label>
          Mass
          <span>{object.physics.mass.toFixed(1)} kg</span>
        </label>
        <input type="range" min="0.1" max="20" step="0.1" value={object.physics.mass} onChange={(event) => updatePhysics({ mass: Number(event.target.value) })} />
      </div>
      <div className="control-row">
        <label>
          Restitution
          <span>{object.physics.restitution.toFixed(2)}</span>
        </label>
        <input type="range" min="0" max="1" step="0.01" value={object.physics.restitution} onChange={(event) => updatePhysics({ restitution: Number(event.target.value) })} />
      </div>
      <div className="control-row">
        <label>
          Friction
          <span>{object.physics.friction.toFixed(2)}</span>
        </label>
        <input type="range" min="0" max="1" step="0.01" value={object.physics.friction} onChange={(event) => updatePhysics({ friction: Number(event.target.value) })} />
      </div>
      <div className="segmented">
        {modes.map((mode) => (
          <button key={mode} className={`text-button ${object.physics.mode === mode ? 'active' : ''}`} onClick={() => updatePhysics({ mode })}>
            {mode}
          </button>
        ))}
      </div>
      <button
        className="text-button"
        onClick={() => {
          threeSceneRef.current?.applyExplosion(object.position, 8);
          soundEngine.play('collapse', { position: object.position });
        }}
      >
        <Icons.Bomb size={14} />
        Apply Explosion Force
      </button>
    </div>
  );
};
