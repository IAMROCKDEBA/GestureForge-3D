import { useEffect } from 'react';
import { useSceneStore } from '../store/useSceneStore.js';

export const usePhysics = () => {
  const physicsEnabled = useSceneStore((state) => state.physicsEnabled);
  useEffect(() => {
    document.documentElement.dataset.physics = physicsEnabled ? 'on' : 'off';
  }, [physicsEnabled]);
  return physicsEnabled;
};
