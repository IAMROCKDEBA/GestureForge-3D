import * as Icons from 'lucide-react';
import { OBJECT_LIBRARY } from '../../utils/constants.js';
import { useSceneStore } from '../../store/useSceneStore.js';
import { useUIStore } from '../../store/useUIStore.js';
import { soundEngine } from '../../core/SoundEngine.js';

const Icon = ({ name, ...props }) => {
  const Component = Icons[name] ?? Icons.Box;
  return <Component {...props} />;
};

export const RadialMenu = () => {
  const radial = useUIStore((state) => state.radialMenu);
  const setRadialMenu = useUIStore((state) => state.setRadialMenu);
  const activeObjectType = useSceneStore((state) => state.activeObjectType);
  const setActiveObjectType = useSceneStore((state) => state.setActiveObjectType);
  if (!radial.open) return null;
  const items = OBJECT_LIBRARY.slice(0, 12);
  return (
    <div className="radial-menu" style={{ '--x': radial.x * 100, '--y': radial.y * 100 }} role="menu" aria-label="Object type radial menu">
      <div className="radial-orbit">
        {items.map((item, index) => (
          <button
            key={item.type}
            className={`radial-item ${activeObjectType === item.type ? 'active' : ''}`}
            style={{ '--angle': `${(index / items.length) * 360}deg` }}
            onClick={() => {
              setActiveObjectType(item.type);
              setRadialMenu({ open: false });
              soundEngine.play('mode');
            }}
            title={item.label}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
