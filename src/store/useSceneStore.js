import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HISTORY_LIMIT, MATERIAL_DEFAULTS, MODES, PHYSICS_DEFAULTS } from '../utils/constants.js';
import { uid } from '../utils/math.js';

const cloneScene = (objects) => JSON.parse(JSON.stringify(objects));

export const makeSceneObject = (type = 'cube', overrides = {}) => ({
  id: overrides.id ?? uid('obj'),
  type,
  name: overrides.name ?? `${type.replace(/_/g, ' ')} ${Math.floor(Math.random() * 90 + 10)}`,
  category: overrides.category ?? 'object',
  visible: overrides.visible ?? true,
  locked: overrides.locked ?? false,
  parentId: overrides.parentId ?? null,
  position: overrides.position ?? [0, 0.85, -1.5],
  rotation: overrides.rotation ?? [0, 0, 0],
  scale: overrides.scale ?? [1, 1, 1],
  material: {
    ...MATERIAL_DEFAULTS,
    ...(overrides.material ?? {})
  },
  physics: {
    ...PHYSICS_DEFAULTS,
    ...(overrides.physics ?? {})
  },
  geometry: {
    subdivision: 0,
    smooth: true,
    wireOverlay: false,
    extrusion: 0,
    bevel: 0,
    path: overrides.geometry?.path ?? [],
    ...(overrides.geometry ?? {})
  },
  createdAt: overrides.createdAt ?? Date.now()
});

const INITIAL_OBJECTS = [
  makeSceneObject('cube', {
    id: 'demo_cube',
    name: 'Demo Cube',
    position: [-0.75, 0.95, -1.65],
    material: { color: '#38BDF8', type: 'holographic', opacity: 0.82 }
  }),
  makeSceneObject('sphere', {
    id: 'demo_sphere',
    name: 'Gesture Orb',
    position: [0.72, 1.12, -1.95],
    scale: [0.72, 0.72, 0.72],
    material: { color: '#F472B6', type: 'glass', opacity: 0.72 }
  }),
  makeSceneObject('pillar', {
    id: 'demo_pillar',
    name: 'Anchor Pillar',
    position: [0.05, 0.5, -2.35],
    scale: [0.7, 1.0, 0.7],
    material: { color: '#A78BFA', type: 'metallic', metalness: 0.62, roughness: 0.28 }
  })
];

const pushHistory = (state, label, kind = 'edit') => {
  const history = state.history.slice(0, state.historyIndex + 1);
  history.push({
    id: uid('action'),
    label,
    kind,
    at: Date.now(),
    objects: cloneScene(state.objects)
  });
  const trimmed = history.slice(-HISTORY_LIMIT);
  return {
    history: trimmed,
    historyIndex: trimmed.length - 1
  };
};

export const useSceneStore = create(
  persist(
    (set, get) => ({
      sceneName: 'Neural Atrium',
      mode: MODES.CREATE,
      activeObjectType: 'cube',
      objects: INITIAL_OBJECTS,
      selectedIds: ['demo_cube'],
      history: [
        {
          id: 'initial_scene',
          label: 'Initial scene',
          kind: 'load',
          at: Date.now(),
          objects: cloneScene(INITIAL_OBJECTS)
        }
      ],
      historyIndex: 0,
      physicsEnabled: true,
      gridEnabled: true,
      snapToGrid: false,
      snapToSurface: false,
      visualFx: {
        bloom: true,
        ssao: true,
        chromatic: false,
        vignette: true
      },
      lighting: {
        ambient: 0.72,
        sun: 0.92,
        timeOfDay: 0.38
      },
      addObject: (type, overrides = {}) =>
        set((state) => {
          const object = makeSceneObject(type, overrides);
          return {
            objects: [...state.objects, object],
            selectedIds: [object.id],
            ...pushHistory({ ...state, objects: [...state.objects, object] }, `Created ${object.name}`, 'create')
          };
        }),
      addObjects: (objects, label = 'Added objects') =>
        set((state) => {
          const nextObjects = [...state.objects, ...objects.map((object) => makeSceneObject(object.type, object))];
          return {
            objects: nextObjects,
            selectedIds: objects.length ? [nextObjects[nextObjects.length - 1].id] : state.selectedIds,
            ...pushHistory({ ...state, objects: nextObjects }, label, 'create')
          };
        }),
      updateObject: (id, patch, options = {}) =>
        set((state) => {
          const nextObjects = state.objects.map((object) =>
            object.id === id
              ? {
                  ...object,
                  ...patch,
                  material: patch.material ? { ...object.material, ...patch.material } : object.material,
                  physics: patch.physics ? { ...object.physics, ...patch.physics } : object.physics,
                  geometry: patch.geometry ? { ...object.geometry, ...patch.geometry } : object.geometry
                }
              : object
          );
          return {
            objects: nextObjects,
            ...(options.silent ? {} : pushHistory({ ...state, objects: nextObjects }, options.label ?? 'Edited object', 'edit'))
          };
        }),
      updateSelected: (patch, options = {}) => {
        const [id] = get().selectedIds;
        if (id) get().updateObject(id, patch, options);
      },
      deleteObject: (id) =>
        set((state) => {
          const object = state.objects.find((item) => item.id === id);
          const nextObjects = state.objects.filter((item) => item.id !== id && item.parentId !== id);
          return {
            objects: nextObjects,
            selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
            ...pushHistory({ ...state, objects: nextObjects }, `Deleted ${object?.name ?? 'object'}`, 'delete')
          };
        }),
      selectObject: (id, multi = false) =>
        set((state) => ({
          selectedIds: id == null ? [] : multi ? [...new Set([...state.selectedIds, id])] : [id]
        })),
      renameObject: (id, name) =>
        set((state) => ({
          objects: state.objects.map((object) => (object.id === id ? { ...object, name } : object))
        })),
      toggleObjectVisibility: (id) =>
        set((state) => ({
          objects: state.objects.map((object) => (object.id === id ? { ...object, visible: !object.visible } : object))
        })),
      toggleObjectLock: (id) =>
        set((state) => ({
          objects: state.objects.map((object) => (object.id === id ? { ...object, locked: !object.locked } : object))
        })),
      setMode: (mode) => set({ mode }),
      setActiveObjectType: (activeObjectType) => set({ activeObjectType }),
      setPhysicsEnabled: (physicsEnabled) => set({ physicsEnabled }),
      togglePhysics: () => set((state) => ({ physicsEnabled: !state.physicsEnabled })),
      setGridEnabled: (gridEnabled) => set({ gridEnabled }),
      setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
      setSnapToSurface: (snapToSurface) => set({ snapToSurface }),
      setLighting: (patch) => set((state) => ({ lighting: { ...state.lighting, ...patch } })),
      setVisualFx: (patch) => set((state) => ({ visualFx: { ...state.visualFx, ...patch } })),
      loadScene: (objects, sceneName = 'Imported Scene') =>
        set((state) => {
          const nextObjects = objects.map((object) => makeSceneObject(object.type, object));
          return {
            sceneName,
            objects: nextObjects,
            selectedIds: [],
            ...pushHistory({ ...state, objects: nextObjects }, `Loaded ${sceneName}`, 'load')
          };
        }),
      undo: () =>
        set((state) => {
          if (state.historyIndex <= 0) return state;
          const historyIndex = state.historyIndex - 1;
          return {
            historyIndex,
            objects: cloneScene(state.history[historyIndex].objects),
            selectedIds: []
          };
        }),
      redo: () =>
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state;
          const historyIndex = state.historyIndex + 1;
          return {
            historyIndex,
            objects: cloneScene(state.history[historyIndex].objects),
            selectedIds: []
          };
        }),
      restoreHistoryIndex: (historyIndex) =>
        set((state) => {
          const target = state.history[historyIndex];
          if (!target) return state;
          return {
            historyIndex,
            objects: cloneScene(target.objects),
            selectedIds: []
          };
        })
    }),
    {
      name: 'gestureforge-scene',
      partialize: (state) => ({
        sceneName: state.sceneName,
        objects: state.objects,
        activeObjectType: state.activeObjectType,
        visualFx: state.visualFx,
        lighting: state.lighting,
        physicsEnabled: state.physicsEnabled,
        gridEnabled: state.gridEnabled
      })
    }
  )
);

export const useSelectedObject = () =>
  useSceneStore((state) => state.objects.find((object) => object.id === state.selectedIds[0]) ?? null);
