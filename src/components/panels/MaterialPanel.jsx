import { MATERIAL_TYPES, TEXTURE_OPTIONS } from '../../utils/constants.js';
import { useSceneStore } from '../../store/useSceneStore.js';
import { soundEngine } from '../../core/SoundEngine.js';

export const MaterialPanel = ({ object }) => {
  const updateObject = useSceneStore((state) => state.updateObject);
  const updateMaterial = (patch, label = 'Changed material') => {
    updateObject(object.id, { material: patch }, { label });
    soundEngine.play('color', { position: object.position });
  };
  return (
    <div className="control-stack">
      <div className="control-row">
        <label>
          Color
          <span>{object.material.color}</span>
        </label>
        <input type="color" value={object.material.color} onChange={(event) => updateMaterial({ color: event.target.value }, 'Changed color')} />
      </div>
      <div className="control-row">
        <span className="control-label">Material Type</span>
        <div className="segmented">
          {MATERIAL_TYPES.map((type) => (
            <button key={type} className={`text-button ${object.material.type === type ? 'active' : ''}`} onClick={() => updateMaterial({ type, wireframe: type === 'wireframe' })}>
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="control-row">
        <label>
          Roughness
          <span>{object.material.roughness.toFixed(2)}</span>
        </label>
        <input type="range" min="0" max="1" step="0.01" value={object.material.roughness} onChange={(event) => updateMaterial({ roughness: Number(event.target.value) })} />
      </div>
      <div className="control-row">
        <label>
          Metalness
          <span>{object.material.metalness.toFixed(2)}</span>
        </label>
        <input type="range" min="0" max="1" step="0.01" value={object.material.metalness} onChange={(event) => updateMaterial({ metalness: Number(event.target.value) })} />
      </div>
      <div className="control-row">
        <label>
          Opacity
          <span>{object.material.opacity.toFixed(2)}</span>
        </label>
        <input type="range" min="0.1" max="1" step="0.01" value={object.material.opacity} onChange={(event) => updateMaterial({ opacity: Number(event.target.value) })} />
      </div>
      <div className="control-row">
        <span className="control-label">Texture</span>
        <div className="segmented">
          {TEXTURE_OPTIONS.map((texture) => (
            <button key={texture} className={`text-button ${object.material.texture === texture ? 'active' : ''}`} onClick={() => updateMaterial({ texture })}>
              {texture}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
