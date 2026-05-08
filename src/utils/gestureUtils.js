import { angleBetween, vectorDistance } from './math.js';

export const FINGER_INDEXES = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20]
};

export const fingerTips = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20
};

export const fingerPips = {
  thumb: 3,
  index: 6,
  middle: 10,
  ring: 14,
  pinky: 18
};

export const palmCenter = (landmarks = []) => {
  const ids = [0, 5, 9, 13, 17];
  const center = ids.reduce(
    (acc, id) => {
      const point = landmarks[id] ?? { x: 0, y: 0, z: 0 };
      acc.x += point.x;
      acc.y += point.y;
      acc.z += point.z ?? 0;
      return acc;
    },
    { x: 0, y: 0, z: 0 }
  );
  return { x: center.x / ids.length, y: center.y / ids.length, z: center.z / ids.length };
};

export const pinchDistance = (landmarks = [], finger = 'index') =>
  vectorDistance(landmarks[4], landmarks[fingerTips[finger]]);

export const isFingerExtended = (landmarks = [], finger = 'index') => {
  if (!landmarks.length) return false;
  if (finger === 'thumb') {
    const handedness = landmarks[4].x < landmarks[17].x ? 'right' : 'left';
    return handedness === 'right' ? landmarks[4].x < landmarks[3].x : landmarks[4].x > landmarks[3].x;
  }
  return landmarks[fingerTips[finger]].y < landmarks[fingerPips[finger]].y - 0.015;
};

export const fingerCurl = (landmarks = [], finger = 'index') => {
  const [mcp, pip, dip, tip] = FINGER_INDEXES[finger];
  const a = angleBetween(landmarks[mcp], landmarks[pip], landmarks[dip]);
  const b = angleBetween(landmarks[pip], landmarks[dip], landmarks[tip]);
  return (Math.PI - a + Math.PI - b) / (Math.PI * 2);
};

export const extendedFingers = (landmarks = []) => {
  const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
  return fingers.reduce((acc, finger) => {
    acc[finger] = isFingerExtended(landmarks, finger);
    return acc;
  }, {});
};

export const palmFacingCamera = (landmarks = []) => {
  if (!landmarks.length) return false;
  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const pinkyMcp = landmarks[17];
  const ax = indexMcp.x - wrist.x;
  const ay = indexMcp.y - wrist.y;
  const bx = pinkyMcp.x - wrist.x;
  const by = pinkyMcp.y - wrist.y;
  const area = Math.abs(ax * by - ay * bx);
  return area > 0.026;
};

export const wristAngle = (landmarks = []) => {
  if (!landmarks.length) return 0;
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  return Math.atan2(middleMcp.y - wrist.y, middleMcp.x - wrist.x);
};

export const handVelocity = (previous, next, dt = 16.7) => {
  if (!previous || !next) return { x: 0, y: 0, z: 0, magnitude: 0 };
  const a = palmCenter(previous);
  const b = palmCenter(next);
  const scale = 1000 / Math.max(dt, 1);
  const velocity = {
    x: (b.x - a.x) * scale,
    y: (b.y - a.y) * scale,
    z: ((b.z ?? 0) - (a.z ?? 0)) * scale
  };
  velocity.magnitude = Math.hypot(velocity.x, velocity.y, velocity.z);
  return velocity;
};

export const twoHandDistance = (hands = []) => {
  if (hands.length < 2) return 0;
  return vectorDistance(palmCenter(hands[0].landmarks), palmCenter(hands[1].landmarks));
};
