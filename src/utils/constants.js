export const GESTURES = {
  NONE: 'none',
  PINCH: 'pinch',
  OPEN_PALM: 'open_palm',
  PEACE: 'peace',
  THREE_FINGERS: 'three_fingers',
  FOUR_FINGERS: 'four_fingers',
  FIST: 'fist',
  THUMB_UP: 'thumb_up',
  THUMB_DOWN: 'thumb_down',
  POINT: 'point',
  MIDDLE_PINCH: 'middle_pinch',
  GRAB: 'grab',
  FLICK: 'flick',
  PALM_PUSH: 'palm_push',
  PALM_PULL: 'palm_pull',
  TWO_HAND_SPREAD: 'two_hand_spread',
  TWO_HAND_PINCH: 'two_hand_pinch',
  TWO_HAND_TWIST: 'two_hand_twist'
};

export const MODES = {
  CREATE: 'create',
  LINE: 'line',
  SURFACE: 'surface',
  SOLID: 'solid',
  GRAB: 'grab',
  ROTATE: 'rotate',
  SCALE: 'scale',
  COLOR: 'color',
  SHOWCASE: 'showcase'
};

export const MATERIAL_TYPES = [
  'matte',
  'metallic',
  'glass',
  'emissive',
  'toon',
  'wireframe',
  'holographic'
];

export const OBJECT_LIBRARY = [
  { type: 'cube', label: 'Cube', category: 'Primitive', icon: 'Box' },
  { type: 'sphere', label: 'Sphere', category: 'Primitive', icon: 'Circle' },
  { type: 'cylinder', label: 'Cylinder', category: 'Primitive', icon: 'Database' },
  { type: 'cone', label: 'Cone', category: 'Primitive', icon: 'Triangle' },
  { type: 'torus', label: 'Torus', category: 'Primitive', icon: 'CircleDot' },
  { type: 'plane', label: 'Plane', category: 'Primitive', icon: 'Square' },
  { type: 'pyramid', label: 'Pyramid', category: 'Primitive', icon: 'Triangle' },
  { type: 'capsule', label: 'Capsule', category: 'Primitive', icon: 'Pill' },
  { type: 'icosahedron', label: 'Gem', category: 'Primitive', icon: 'Gem' },
  { type: 'wall', label: 'Wall', category: 'Architecture', icon: 'BrickWall' },
  { type: 'door', label: 'Door Frame', category: 'Architecture', icon: 'DoorOpen' },
  { type: 'window', label: 'Window', category: 'Architecture', icon: 'PanelTop' },
  { type: 'roof', label: 'Roof', category: 'Architecture', icon: 'Home' },
  { type: 'staircase', label: 'Stairs', category: 'Architecture', icon: 'Blocks' },
  { type: 'pillar', label: 'Pillar', category: 'Architecture', icon: 'Columns3' },
  { type: 'tree', label: 'Tree', category: 'Nature', icon: 'TreePine' },
  { type: 'rock', label: 'Rock', category: 'Nature', icon: 'Mountain' },
  { type: 'mountain', label: 'Mountain', category: 'Nature', icon: 'MountainSnow' },
  { type: 'ground', label: 'Ground', category: 'Nature', icon: 'Grid3X3' },
  { type: 'house', label: 'House', category: 'Smart Object', icon: 'Home' },
  { type: 'table', label: 'Table', category: 'Smart Object', icon: 'Table2' },
  { type: 'bridge', label: 'Bridge', category: 'Smart Object', icon: 'Waypoints' },
  { type: 'tower', label: 'Tower', category: 'Smart Object', icon: 'Landmark' },
  { type: 'curve', label: 'Free Curve', category: 'Drawing', icon: 'Spline' }
];

export const TEXTURE_OPTIONS = ['none', 'brick', 'concrete', 'wood', 'marble', 'metal', 'fabric'];

export const GESTURE_DEBOUNCE_MS = 300;
export const HISTORY_LIMIT = 50;
export const AUTOSAVE_MS = 30000;

export const PHYSICS_DEFAULTS = {
  mass: 1,
  restitution: 0.42,
  friction: 0.52,
  mode: 'dynamic'
};

export const MATERIAL_DEFAULTS = {
  color: '#38BDF8',
  type: 'matte',
  roughness: 0.55,
  metalness: 0.12,
  opacity: 1,
  texture: 'none',
  emissiveIntensity: 0.2,
  wireframe: false
};

export const SCENE_PRESETS = [
  {
    id: 'empty',
    title: 'Empty',
    subtitle: 'A clean AR workspace',
    accent: '#38BDF8',
    objects: []
  },
  {
    id: 'city',
    title: 'City Block',
    subtitle: 'Architecture primitives ready to rearrange',
    accent: '#A78BFA',
    objects: ['wall', 'wall', 'pillar', 'window', 'door', 'tower']
  },
  {
    id: 'nature',
    title: 'Nature',
    subtitle: 'Low-poly terrain and organic forms',
    accent: '#34D399',
    objects: ['ground', 'tree', 'rock', 'mountain']
  },
  {
    id: 'room',
    title: 'Room Interior',
    subtitle: 'Furniture and surfaces for spatial layout',
    accent: '#F472B6',
    objects: ['plane', 'table', 'cube', 'sphere']
  },
  {
    id: 'space',
    title: 'Space Station',
    subtitle: 'Emission materials and modular shells',
    accent: '#FBBF24',
    objects: ['cylinder', 'torus', 'bridge', 'icosahedron']
  }
];

export const LANDMARK_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17]
];
