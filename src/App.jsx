import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ARCanvas } from './components/canvas/ARCanvas.jsx';
import { TopBar } from './components/ui/TopBar.jsx';
import { SceneTree } from './components/ui/SceneTree.jsx';
import { PropertyPanel } from './components/ui/PropertyPanel.jsx';
import { HandVisualizer } from './components/ui/HandVisualizer.jsx';
import { RadialMenu } from './components/ui/RadialMenu.jsx';
import { Timeline } from './components/ui/Timeline.jsx';
import { ToastStack } from './components/ui/Toast.jsx';
import { CameraControls } from './components/ui/CameraControls.jsx';
import { PerformanceHUD } from './components/ui/PerformanceHUD.jsx';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay.jsx';
import { SceneGallery } from './components/gallery/SceneGallery.jsx';
import { useCamera } from './hooks/useCamera.js';
import { useGestures } from './hooks/useGestures.js';
import { useHandTracking } from './hooks/useHandTracking.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { usePhysics } from './hooks/usePhysics.js';
import { exportGLB, exportPNG } from './utils/exportUtils.js';
import { useCameraStore } from './store/useCameraStore.js';
import { useSceneStore } from './store/useSceneStore.js';
import { useUIStore } from './store/useUIStore.js';
import { soundEngine } from './core/SoundEngine.js';

export default function App() {
  const skipIntro = new URLSearchParams(window.location.search).get('tutorial') === '0';
  const videoRef = useRef(null);
  const handVideoRef = useRef(null);
  const threeSceneRef = useRef(null);
  const [gestureResults, setGestureResults] = useState(null);
  const [metrics, setMetrics] = useState({ fps: 0, handMs: 0, renderMs: 0, objectCount: 0 });
  const camera = useCamera({ videoRef, handVideoRef });
  const cameraPermission = useCameraStore((state) => state.permission);
  const cameraHandStream = useCameraStore((state) => state.handStream);
  const sceneTreeOpen = useUIStore((state) => state.sceneTreeOpen);
  const rightPanelOpen = useUIStore((state) => state.rightPanelOpen);
  const handPanelOpen = useUIStore((state) => state.handPanelOpen);
  const developerMode = useUIStore((state) => state.developerMode);
  const theme = useUIStore((state) => state.theme);
  const fontScale = useUIStore((state) => state.fontScale);
  const soundMuted = useUIStore((state) => state.soundMuted);
  const soundVolume = useUIStore((state) => state.soundVolume);
  const visualFx = useSceneStore((state) => state.visualFx);
  const selectedIds = useSceneStore((state) => state.selectedIds);
  const objects = useSceneStore((state) => state.objects);
  usePhysics();

  const trackingVideoRef = useMemo(() => {
    if (cameraHandStream && handVideoRef.current) return handVideoRef;
    return videoRef;
  }, [cameraHandStream]);

  const handTracking = useHandTracking({
    videoRef: trackingVideoRef,
    enabled: cameraPermission === 'granted',
    onResults: (results) => {
      setGestureResults(results);
      setMetrics((current) => ({ ...current, handMs: Number((performance.now() % 16).toFixed(2)) }));
    }
  });

  useGestures({ results: gestureResults, threeSceneRef });

  const deleteSelected = useCallback(() => {
    const scene = useSceneStore.getState();
    const selected = scene.objects.find((object) => object.id === scene.selectedIds[0]);
    if (selected) {
      scene.deleteObject(selected.id);
      soundEngine.play('delete', { position: selected.position });
    }
  }, []);

  const handleExportGLB = useCallback(() => {
    if (threeSceneRef.current?.scene) exportGLB(threeSceneRef.current.scene);
  }, []);

  const handleExportPNG = useCallback(() => {
    if (threeSceneRef.current?.renderer) exportPNG(threeSceneRef.current.renderer);
  }, []);

  useKeyboardShortcuts({ onExportGLB: handleExportGLB, onDeleteSelected: deleteSelected });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.setProperty('--font-scale', fontScale);
  }, [fontScale, theme]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tutorial') === '0') {
      useUIStore.getState().setTutorialOpen(false);
    }
  }, []);

  useEffect(() => {
    soundEngine.setMuted(soundMuted);
    soundEngine.setVolume(soundVolume);
  }, [soundMuted, soundVolume]);

  useEffect(() => {
    const wakeAudio = () => {
      soundEngine.play('startup', { gain: 0.16 });
      window.removeEventListener('pointerdown', wakeAudio);
      window.removeEventListener('keydown', wakeAudio);
    };
    window.addEventListener('pointerdown', wakeAudio, { once: true });
    window.addEventListener('keydown', wakeAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', wakeAudio);
      window.removeEventListener('keydown', wakeAudio);
    };
  }, []);

  return (
    <div className={`app-shell ${visualFx.vignette ? 'with-vignette' : ''} ${skipIntro ? 'skip-intro' : ''}`}>
      <ARCanvas
        videoRef={videoRef}
        handVideoRef={handVideoRef}
        threeSceneRef={threeSceneRef}
        onMetrics={setMetrics}
        camera={camera}
      />
      <div className="letterbox letterbox-top" />
      <div className="letterbox letterbox-bottom" />
      <TopBar
        camera={camera}
        trackingStatus={handTracking.status}
        onExportGLB={handleExportGLB}
        onExportPNG={handleExportPNG}
        onSimulate={handTracking.simulate}
      />
      <main className="workspace-grid" aria-label="GestureForge 3D workspace">
        {sceneTreeOpen && (
          <aside className="left-dock">
            <SceneTree />
            <SceneGallery />
          </aside>
        )}
        <section className="stage-spacer" aria-hidden="true" />
        {rightPanelOpen && (
          <aside className="right-dock">
            {handPanelOpen && <HandVisualizer results={gestureResults} status={handTracking.status} />}
            <CameraControls camera={camera} />
            <PropertyPanel threeSceneRef={threeSceneRef} />
          </aside>
        )}
      </main>
      <RadialMenu />
      <Timeline />
      {developerMode && <PerformanceHUD metrics={{ ...metrics, objectCount: objects.length }} />}
      <ToastStack />
      <TutorialOverlay camera={camera} onSimulate={handTracking.simulate} />
      <div className="gesture-lock" style={{ '--progress': gestureResults?.hands?.[0]?.lock?.progress ?? 0 }}>
        <span>{gestureResults?.hands?.[0]?.gesture?.replace(/_/g, ' ') ?? 'standby'}</span>
      </div>
      <div className="sr-only" aria-live="polite">
        {useUIStore.getState().announce}
        {selectedIds.length ? `${selectedIds.length} object selected` : ''}
      </div>
    </div>
  );
}
