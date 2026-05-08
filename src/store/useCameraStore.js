import { create } from 'zustand';

export const useCameraStore = create((set) => ({
  permission: 'idle',
  error: null,
  stream: null,
  handStream: null,
  visibleFacingMode: 'environment',
  handFacingMode: 'user',
  selfieMode: false,
  frozen: false,
  zoom: 1,
  brightness: 1,
  exposure: 1,
  handCamActive: false,
  setPermission: (permission) => set({ permission }),
  setError: (error) => set({ error }),
  setStream: (stream) => set({ stream }),
  setHandStream: (handStream) => set({ handStream, handCamActive: Boolean(handStream) }),
  setFacingMode: (visibleFacingMode) => set({ visibleFacingMode }),
  toggleFacingMode: () =>
    set((state) => ({
      visibleFacingMode: state.visibleFacingMode === 'environment' ? 'user' : 'environment'
    })),
  toggleSelfieMode: () => set((state) => ({ selfieMode: !state.selfieMode })),
  setFrozen: (frozen) => set({ frozen }),
  setZoom: (zoom) => set({ zoom }),
  setBrightness: (brightness) => set({ brightness }),
  setExposure: (exposure) => set({ exposure })
}));
