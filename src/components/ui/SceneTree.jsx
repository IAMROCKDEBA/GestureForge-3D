import * as Icons from 'lucide-react';
import { useSceneStore } from '../../store/useSceneStore.js';

const Icon = ({ name, ...props }) => {
  const Component = Icons[name] ?? Icons.Box;
  return <Component {...props} />;
};

export const SceneTree = () => {
  const objects = useSceneStore((state) => state.objects);
  const selectedIds = useSceneStore((state) => state.selectedIds);
  const selectObject = useSceneStore((state) => state.selectObject);
  const renameObject = useSceneStore((state) => state.renameObject);
  const toggleObjectVisibility = useSceneStore((state) => state.toggleObjectVisibility);
  const toggleObjectLock = useSceneStore((state) => state.toggleObjectLock);

  return (
    <section className="glass-panel" aria-label="Scene object hierarchy">
      <div className="panel-header">
        <div className="panel-title">
          <Icon name="ListTree" size={16} />
          <div>
            Scene Tree
            <small>{objects.length} objects</small>
          </div>
        </div>
      </div>
      <div className="panel-body scene-list">
        {objects.map((object) => (
          <div key={object.id} className={`scene-row ${selectedIds.includes(object.id) ? 'selected' : ''}`} onClick={() => selectObject(object.id)}>
            <span className="object-dot" style={{ '--dot': object.material.color }} />
            <input value={object.name} onChange={(event) => renameObject(object.id, event.target.value)} aria-label={`Rename ${object.name}`} />
            <button
              className="icon-button"
              onClick={(event) => {
                event.stopPropagation();
                toggleObjectVisibility(object.id);
              }}
              title={object.visible ? 'Hide object' : 'Show object'}
            >
              <Icon name={object.visible ? 'Eye' : 'EyeOff'} size={14} />
            </button>
            <button
              className="icon-button"
              onClick={(event) => {
                event.stopPropagation();
                toggleObjectLock(object.id);
              }}
              title={object.locked ? 'Unlock object' : 'Lock object'}
            >
              <Icon name={object.locked ? 'Lock' : 'Unlock'} size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
