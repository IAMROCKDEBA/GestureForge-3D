import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export const exportGLB = (scene, filename = 'gestureforge-scene.glb') => {
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (result) => {
      const blob = result instanceof ArrayBuffer ? new Blob([result], { type: 'model/gltf-binary' }) : new Blob([JSON.stringify(result)], { type: 'application/json' });
      downloadBlob(blob, filename);
    },
    (error) => {
      console.error('GLB export failed', error);
    },
    { binary: true, onlyVisible: true }
  );
};

export const exportPNG = (renderer, filename = 'gestureforge-capture.png') => {
  const dataUrl = renderer.domElement.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const encodeSceneToUrl = (state) => {
  const packed = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  const url = new URL(window.location.href);
  url.searchParams.set('scene', packed);
  return url.toString();
};

export const decodeSceneFromUrl = () => {
  const packed = new URL(window.location.href).searchParams.get('scene');
  if (!packed) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(packed))));
  } catch (error) {
    console.warn('Scene URL could not be decoded', error);
    return null;
  }
};
