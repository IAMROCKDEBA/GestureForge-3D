import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      tutorialComplete: false,
      tutorialOpen: true,
      sceneTreeOpen: true,
      rightPanelOpen: true,
      handPanelOpen: true,
      developerMode: false,
      showcaseMode: false,
      soundMuted: false,
      soundVolume: 0.72,
      reduceMotion: false,
      colorBlindMode: false,
      fontScale: 1,
      radialMenu: {
        open: false,
        x: 0.5,
        y: 0.5
      },
      toasts: [],
      announce: '',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTutorialOpen: (tutorialOpen) => set({ tutorialOpen }),
      completeTutorial: () => set({ tutorialComplete: true, tutorialOpen: false }),
      replayTutorial: () => set({ tutorialOpen: true }),
      setSceneTreeOpen: (sceneTreeOpen) => set({ sceneTreeOpen }),
      setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
      setHandPanelOpen: (handPanelOpen) => set({ handPanelOpen }),
      toggleDeveloperMode: () => set((state) => ({ developerMode: !state.developerMode })),
      toggleShowcaseMode: () => set((state) => ({ showcaseMode: !state.showcaseMode })),
      setSoundMuted: (soundMuted) => set({ soundMuted }),
      setSoundVolume: (soundVolume) => set({ soundVolume }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setColorBlindMode: (colorBlindMode) => set({ colorBlindMode }),
      setFontScale: (fontScale) => set({ fontScale }),
      setRadialMenu: (radialMenu) => set((state) => ({ radialMenu: { ...state.radialMenu, ...radialMenu } })),
      pushToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            {
              id: toast.id ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`,
              type: toast.type ?? 'info',
              title: toast.title,
              message: toast.message,
              createdAt: Date.now()
            }
          ].slice(-5),
          announce: `${toast.title}. ${toast.message ?? ''}`
        })),
      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
    }),
    {
      name: 'gestureforge-ui',
      partialize: (state) => ({
        theme: state.theme,
        tutorialComplete: state.tutorialComplete,
        soundMuted: state.soundMuted,
        soundVolume: state.soundVolume,
        reduceMotion: state.reduceMotion,
        colorBlindMode: state.colorBlindMode,
        fontScale: state.fontScale
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.tutorialComplete) state.tutorialOpen = false;
      }
    }
  )
);
