import { useEffect, useRef } from 'react';
import { GESTURES, MATERIAL_TYPES, MODES } from '../utils/constants.js';
import { normalizedPointToScene } from '../utils/math.js';
import { useSceneStore } from '../store/useSceneStore.js';
import { useUIStore } from '../store/useUIStore.js';
import { soundEngine } from '../core/SoundEngine.js';

const eventForType = (type) => {
  if (type === 'wall') return 'wall';
  if (type === 'roof') return 'roof';
  if (type === 'house') return 'house';
  return 'spawn';
};

export const useGestures = ({ results, threeSceneRef }) => {
  const lastDragRef = useRef(null);

  useEffect(() => {
    if (!results?.hands?.length) return;
    const scene = useSceneStore.getState();
    const ui = useUIStore.getState();
    const primary = results.hands[0];
    const gesture = primary.gesture;
    const lock = primary.lock ?? { locked: false, progress: 0 };
    const palm = primary.palm ?? primary.landmarks?.[9] ?? { x: 0.5, y: 0.5, z: -0.1 };
    ui.setRadialMenu({
      open: gesture === GESTURES.OPEN_PALM,
      x: palm.x,
      y: palm.y
    });
    if (lock.progress > 0.2 && gesture !== GESTURES.NONE) {
      soundEngine.play('gesture', { gain: 0.02 });
    }
    if (!lock.locked) {
      if (gesture === GESTURES.PINCH && scene.selectedIds.length && primary.velocity?.magnitude < 1.8) {
        const [id] = scene.selectedIds;
        const point = normalizedPointToScene(palm, -1.5 + (palm.z ?? 0));
        scene.updateObject(id, { position: point }, { silent: true });
        lastDragRef.current = point;
      }
      return;
    }
    if (gesture === GESTURES.PINCH) {
      const point = normalizedPointToScene(palm, -1.5 + (palm.z ?? 0));
      if (scene.selectedIds.length && lastDragRef.current) {
        scene.updateSelected({ position: point }, { label: 'Moved object' });
        soundEngine.play('select', { position: point });
      } else {
        scene.addObject(scene.activeObjectType, { position: point });
        soundEngine.play(eventForType(scene.activeObjectType), { position: point });
        ui.pushToast({ type: 'success', title: 'Object spawned', message: `${scene.activeObjectType} placed at pinch point.` });
      }
      lastDragRef.current = null;
    }
    if (gesture === GESTURES.PEACE) {
      scene.setMode(MODES.LINE);
      soundEngine.play('mode');
    }
    if (gesture === GESTURES.THREE_FINGERS) {
      scene.setMode(MODES.SURFACE);
      soundEngine.play('mode');
    }
    if (gesture === GESTURES.FOUR_FINGERS) {
      scene.setMode(MODES.SOLID);
      soundEngine.play('mode');
    }
    if (gesture === GESTURES.FIST) {
      ui.pushToast({ type: 'success', title: 'Object locked', message: 'Current transform committed.' });
      soundEngine.play('select');
    }
    if (gesture === GESTURES.THUMB_DOWN) {
      scene.undo();
      soundEngine.play('undo');
    }
    if (gesture === GESTURES.THUMB_UP) {
      scene.redo();
      soundEngine.play('redo');
    }
    if (gesture === GESTURES.MIDDLE_PINCH) {
      scene.setMode(MODES.COLOR);
      soundEngine.play('color');
    }
    if (gesture === 'material_cycle') {
      const selected = scene.objects.find((object) => object.id === scene.selectedIds[0]);
      if (selected) {
        const next = MATERIAL_TYPES[(MATERIAL_TYPES.indexOf(selected.material.type) + 1) % MATERIAL_TYPES.length];
        scene.updateObject(selected.id, { material: { type: next, wireframe: next === 'wireframe' } }, { label: `Material changed to ${next}` });
        soundEngine.play('color', { position: selected.position });
      }
    }
    if (gesture === GESTURES.GRAB) {
      scene.setMode(MODES.GRAB);
    }
    if (gesture === GESTURES.POINT && primary.velocity?.x < -1.2 && scene.selectedIds[0]) {
      const selected = scene.objects.find((object) => object.id === scene.selectedIds[0]);
      scene.deleteObject(scene.selectedIds[0]);
      soundEngine.play('delete', { position: selected?.position });
    }
    if (primary.velocity?.magnitude > 2.2 && scene.selectedIds[0]) {
      const selected = scene.objects.find((object) => object.id === scene.selectedIds[0]);
      const impulse = [-primary.velocity.x * 2.2, -primary.velocity.y * 2.2, -2.4];
      threeSceneRef.current?.applyImpulse(scene.selectedIds[0], impulse);
      soundEngine.play('throw', { position: selected?.position, gain: Math.min(primary.velocity.magnitude / 5, 0.8) });
    }
    if (results.twoHandGesture && scene.selectedIds[0]) {
      const selected = scene.objects.find((object) => object.id === scene.selectedIds[0]);
      if (!selected) return;
      if (results.twoHandGesture.gesture === GESTURES.TWO_HAND_SPREAD) {
        const scale = selected.scale.map((value) => value * 1.12);
        scene.updateObject(selected.id, { scale }, { label: 'Scaled object up' });
        soundEngine.play('scaleUp', { position: selected.position });
      }
      if (results.twoHandGesture.gesture === GESTURES.TWO_HAND_PINCH) {
        const scale = selected.scale.map((value) => Math.max(value * 0.88, 0.12));
        scene.updateObject(selected.id, { scale }, { label: 'Scaled object down' });
        soundEngine.play('scaleDown', { position: selected.position });
      }
      if (results.twoHandGesture.gesture === GESTURES.TWO_HAND_TWIST) {
        scene.updateObject(selected.id, { rotation: [selected.rotation[0], selected.rotation[1], selected.rotation[2] + 0.35] }, { label: 'Twisted object' });
        soundEngine.play('rotate', { position: selected.position });
      }
    }
  }, [results, threeSceneRef]);
};
