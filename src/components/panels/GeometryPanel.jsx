import { useSceneStore } from '../../store/useSceneStore.js';

export const GeometryPanel = ({ object }) => {
  const updateObject = useSceneStore((state) => state.updateObject);
  const updateGeometry = (patch) => updateObject(object.id, { geometry: patch }, { label: 'Changed geometry' });
  return (
    <div className="control-stack">
      <div className="control-row">
        <label>
          Subdivide
          <span>{object.geometry.subdivision}</span>
        </label>
        <input type="range" min="0" max="4" step="1" value={object.geometry.subdivision} onChange={(event) => updateGeometry({ subdivision: Number(event.target.value) })} />
      </div>
      <div className="segmented two">
        <button className={`text-button ${object.geometry.smooth ? 'active' : ''}`} onClick={() => updateGeometry({ smooth: !object.geometry.smooth })}>
          Smooth
        </button>
        <button className={`text-button ${object.geometry.wireOverlay ? 'active' : ''}`} onClick={() => updateGeometry({ wireOverlay: !object.geometry.wireOverlay })}>
          Wire Overlay
        </button>
      </div>
      <div className="control-row">
        <label>
          Face Extrusion
          <span>{object.geometry.extrusion.toFixed(2)}</span>
        </label>
        <input type="range" min="0" max="1" step="0.01" value={object.geometry.extrusion} onChange={(event) => updateGeometry({ extrusion: Number(event.target.value) })} />
      </div>
      <div className="control-row">
        <label>
          Edge Bevel
          <span>{object.geometry.bevel.toFixed(2)}</span>
        </label>
        <input type="range" min="0" max="0.3" step="0.01" value={object.geometry.bevel} onChange={(event) => updateGeometry({ bevel: Number(event.target.value) })} />
      </div>
    </div>
  );
};
