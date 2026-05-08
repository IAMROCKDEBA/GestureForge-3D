import * as Icons from 'lucide-react';
import { useSceneStore } from '../../store/useSceneStore.js';

const axes = ['x', 'y', 'z'];

export const TransformPanel = ({ object }) => {
  const updateObject = useSceneStore((state) => state.updateObject);

  const updateArray = (key, index, value, label) => {
    const next = [...object[key]];
    next[index] = value;
    updateObject(object.id, { [key]: next }, { label, silent: false });
  };

  return (
    <div className="control-stack">
      {axes.map((axis, index) => (
        <div className="control-row" key={`pos-${axis}`}>
          <label>
            Position {axis.toUpperCase()}
            <span>{object.position[index].toFixed(2)}</span>
          </label>
          <input type="range" min="-3" max="3" step="0.01" value={object.position[index]} onChange={(event) => updateArray('position', index, Number(event.target.value), 'Moved object')} />
        </div>
      ))}
      {axes.map((axis, index) => (
        <div className="control-row" key={`rot-${axis}`}>
          <label>
            Rotation {axis.toUpperCase()}
            <span>{Math.round((object.rotation[index] * 180) / Math.PI)} deg</span>
          </label>
          <input type="range" min="-3.14" max="3.14" step="0.01" value={object.rotation[index]} onChange={(event) => updateArray('rotation', index, Number(event.target.value), 'Rotated object')} />
        </div>
      ))}
      <div className="control-row">
        <label>
          Uniform Scale
          <span>{object.scale[0].toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="0.15"
          max="3"
          step="0.01"
          value={object.scale[0]}
          onChange={(event) => {
            const value = Number(event.target.value);
            updateObject(object.id, { scale: [value, value, value] }, { label: 'Scaled object' });
          }}
        />
      </div>
      <button
        className="text-button"
        onClick={() => updateObject(object.id, { position: [0, 1, -1.7], rotation: [0, 0, 0], scale: [1, 1, 1] }, { label: 'Reset transform' })}
      >
        <Icons.RefreshCw size={14} />
        Reset Transform
      </button>
    </div>
  );
};
