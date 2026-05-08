import { useEffect, useRef } from 'react';
import { ThreeScene } from '../../core/ThreeScene.js';
import { useSceneStore } from '../../store/useSceneStore.js';
import { useCameraStore } from '../../store/useCameraStore.js';

export const ARCanvas = ({ videoRef, handVideoRef, threeSceneRef, onMetrics, camera }) => {
  const canvasRef = useRef(null);
  const objects = useSceneStore((state) => state.objects);
  const selectedIds = useSceneStore((state) => state.selectedIds);
  const physicsEnabled = useSceneStore((state) => state.physicsEnabled);
  const gridEnabled = useSceneStore((state) => state.gridEnabled);
  const visualFx = useSceneStore((state) => state.visualFx);
  const lighting = useSceneStore((state) => state.lighting);
  const selectObject = useSceneStore((state) => state.selectObject);
  const permission = useCameraStore((state) => state.permission);
  const frozen = useCameraStore((state) => state.frozen);
  const zoom = useCameraStore((state) => state.zoom);
  const brightness = useCameraStore((state) => state.brightness);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const scene = new ThreeScene(canvasRef.current, {
      onSelect: selectObject,
      onMetrics
    });
    threeSceneRef.current = scene;
    return () => {
      scene.destroy();
      threeSceneRef.current = null;
    };
  }, [onMetrics, selectObject, threeSceneRef]);

  useEffect(() => {
    threeSceneRef.current?.sync({
      objects,
      selectedIds,
      physicsEnabled,
      gridEnabled,
      visualFx,
      lighting
    });
  }, [gridEnabled, lighting, objects, physicsEnabled, selectedIds, threeSceneRef, visualFx]);

  return (
    <section
      className="ar-stage"
      style={{
        '--camera-zoom': zoom,
        '--camera-brightness': brightness
      }}
    >
      <video ref={videoRef} className={`camera-video ${frozen ? 'frozen' : ''}`} aria-label="Live camera AR background" />
      <video ref={handVideoRef} className="hand-video-hidden" aria-hidden="true" />
      {permission !== 'granted' && (
        <div className="camera-fallback">
          <div>
            <strong>GestureForge</strong>
            <span>Camera permission enables the live AR backdrop and hand tracking.</span>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="ar-canvas" aria-label="Three dimensional AR scene" />
    </section>
  );
};
