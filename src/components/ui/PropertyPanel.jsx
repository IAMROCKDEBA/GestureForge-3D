import * as Icons from 'lucide-react';
import { useState } from 'react';
import { OBJECT_LIBRARY } from '../../utils/constants.js';
import { useSceneStore, useSelectedObject } from '../../store/useSceneStore.js';
import { useUIStore } from '../../store/useUIStore.js';
import { TransformPanel } from '../panels/TransformPanel.jsx';
import { MaterialPanel } from '../panels/MaterialPanel.jsx';
import { PhysicsPanel } from '../panels/PhysicsPanel.jsx';
import { GeometryPanel } from '../panels/GeometryPanel.jsx';
import { SoundMixer } from './SoundMixer.jsx';
import { soundEngine } from '../../core/SoundEngine.js';

const Icon = ({ name, ...props }) => {
  const Component = Icons[name] ?? Icons.Box;
  return <Component {...props} />;
};

const tabs = [
  ['transform', 'Transform', 'Move3D'],
  ['material', 'Material', 'Palette'],
  ['physics', 'Physics', 'Atom'],
  ['geometry', 'Geometry', 'Spline']
];

export const PropertyPanel = ({ threeSceneRef }) => {
  const [activeTab, setActiveTab] = useState('transform');
  const selected = useSelectedObject();
  const activeObjectType = useSceneStore((state) => state.activeObjectType);
  const setActiveObjectType = useSceneStore((state) => state.setActiveObjectType);
  const addObject = useSceneStore((state) => state.addObject);
  const setGridEnabled = useSceneStore((state) => state.setGridEnabled);
  const gridEnabled = useSceneStore((state) => state.gridEnabled);
  const snapToGrid = useSceneStore((state) => state.snapToGrid);
  const setSnapToGrid = useSceneStore((state) => state.setSnapToGrid);
  const visualFx = useSceneStore((state) => state.visualFx);
  const setVisualFx = useSceneStore((state) => state.setVisualFx);
  const lighting = useSceneStore((state) => state.lighting);
  const setLighting = useSceneStore((state) => state.setLighting);
  const pushToast = useUIStore((state) => state.pushToast);

  const spawn = () => {
    addObject(activeObjectType, { position: [0, 1, -1.7] });
    soundEngine.play('spawn', { position: [0, 1, -1.7] });
    pushToast({ type: 'success', title: 'Object added', message: activeObjectType });
  };

  return (
    <section className="glass-panel" aria-label="Object editing panel">
      <div className="panel-header">
        <div className="panel-title">
          <Icon name="SlidersHorizontal" size={16} />
          <div>
            {selected ? selected.name : 'Forge Controls'}
            <small>{selected ? selected.type : 'select or create an object'}</small>
          </div>
        </div>
        <button className="text-button" onClick={spawn}>
          <Icon name="Plus" size={14} />
          Add
        </button>
      </div>
      {selected && (
        <div className="property-tabs" role="tablist">
          {tabs.map(([id, label, icon]) => (
            <button key={id} className={`tab-button ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
              <Icon name={icon} size={13} />
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="panel-body control-stack">
        {selected ? (
          <>
            {activeTab === 'transform' && <TransformPanel object={selected} />}
            {activeTab === 'material' && <MaterialPanel object={selected} />}
            {activeTab === 'physics' && <PhysicsPanel object={selected} threeSceneRef={threeSceneRef} />}
            {activeTab === 'geometry' && <GeometryPanel object={selected} />}
          </>
        ) : (
          <>
            <div className="object-grid">
              {OBJECT_LIBRARY.map((item) => (
                <button
                  key={item.type}
                  className={`object-chip ${activeObjectType === item.type ? 'active' : ''}`}
                  onClick={() => setActiveObjectType(item.type)}
                >
                  <Icon name={item.icon} size={15} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <div className="control-row">
          <label>
            Ambient Light
            <span>{lighting.ambient.toFixed(2)}</span>
          </label>
          <input type="range" min="0.1" max="1.5" step="0.01" value={lighting.ambient} onChange={(event) => setLighting({ ambient: Number(event.target.value) })} />
        </div>
        <div className="control-row">
          <label>
            Time of Day
            <span>{Math.round(lighting.timeOfDay * 24)}h</span>
          </label>
          <input type="range" min="0" max="1" step="0.01" value={lighting.timeOfDay} onChange={(event) => setLighting({ timeOfDay: Number(event.target.value) })} />
        </div>
        <div className="segmented two">
          <button className={`text-button ${gridEnabled ? 'active' : ''}`} onClick={() => setGridEnabled(!gridEnabled)}>
            <Icon name="Grid3X3" size={14} />
            Grid
          </button>
          <button className={`text-button ${snapToGrid ? 'active' : ''}`} onClick={() => setSnapToGrid(!snapToGrid)}>
            <Icon name="Magnet" size={14} />
            Snap
          </button>
        </div>
        <div className="segmented two">
          <button className={`text-button ${visualFx.bloom ? 'active' : ''}`} onClick={() => setVisualFx({ bloom: !visualFx.bloom })}>
            <Icon name="Sparkles" size={14} />
            Bloom
          </button>
          <button className={`text-button ${visualFx.vignette ? 'active' : ''}`} onClick={() => setVisualFx({ vignette: !visualFx.vignette })}>
            <Icon name="Aperture" size={14} />
            Vignette
          </button>
        </div>
        <SoundMixer />
      </div>
    </section>
  );
};
