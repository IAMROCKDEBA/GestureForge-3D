import { useEffect } from 'react';
import { MODES } from '../utils/constants.js';
import { useSceneStore } from '../store/useSceneStore.js';
import { useCameraStore } from '../store/useCameraStore.js';
import { useUIStore } from '../store/useUIStore.js';
import { soundEngine } from '../core/SoundEngine.js';

export const useKeyboardShortcuts = ({ onExportGLB, onDeleteSelected } = {}) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      const scene = useSceneStore.getState();
      const ui = useUIStore.getState();
      const camera = useCameraStore.getState();
      const key = event.key.toLowerCase();
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if ((event.ctrlKey || event.metaKey) && key === 'z') {
        event.preventDefault();
        scene.undo();
        soundEngine.play('undo');
      } else if ((event.ctrlKey || event.metaKey) && key === 'y') {
        event.preventDefault();
        scene.redo();
        soundEngine.play('redo');
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        onDeleteSelected?.();
      } else if (key === 'g') scene.setMode(MODES.GRAB);
      else if (key === 'r') scene.setMode(MODES.ROTATE);
      else if (key === 's' && !event.shiftKey) scene.setMode(MODES.SCALE);
      else if (key === 'c') scene.setMode(MODES.COLOR);
      else if (key === 'p') scene.togglePhysics();
      else if (key === 'f') camera.setFrozen(!camera.frozen);
      else if (key === 'e') onExportGLB?.();
      else if (event.shiftKey && key === 'd') ui.toggleDeveloperMode();
      else if (event.shiftKey && key === 's') ui.toggleShowcaseMode();
      else if (event.key === 'Escape') {
        scene.selectObject(null);
        ui.setRadialMenu({ open: false });
      } else if (event.code === 'Space') {
        event.preventDefault();
        ui.pushToast({ type: 'info', title: 'Tracking toggled', message: 'Hand tracking pause/resume is mapped for the demo.' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onDeleteSelected, onExportGLB]);
};
