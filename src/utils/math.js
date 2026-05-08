export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const lerp = (a, b, t) => a + (b - a) * t;

export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return lerp(outMin, outMax, t);
};

export const uid = (prefix = 'gf') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const vectorDistance = (a, b) => {
  if (!a || !b) return Infinity;
  const dx = (a.x ?? a[0] ?? 0) - (b.x ?? b[0] ?? 0);
  const dy = (a.y ?? a[1] ?? 0) - (b.y ?? b[1] ?? 0);
  const dz = (a.z ?? a[2] ?? 0) - (b.z ?? b[2] ?? 0);
  return Math.hypot(dx, dy, dz);
};

export const angleBetween = (a, b, c) => {
  const ab = {
    x: (a.x ?? a[0]) - (b.x ?? b[0]),
    y: (a.y ?? a[1]) - (b.y ?? b[1]),
    z: (a.z ?? a[2] ?? 0) - (b.z ?? b[2] ?? 0)
  };
  const cb = {
    x: (c.x ?? c[0]) - (b.x ?? b[0]),
    y: (c.y ?? c[1]) - (b.y ?? b[1]),
    z: (c.z ?? c[2] ?? 0) - (b.z ?? b[2] ?? 0)
  };
  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const mag = Math.hypot(ab.x, ab.y, ab.z) * Math.hypot(cb.x, cb.y, cb.z);
  return Math.acos(clamp(dot / (mag || 1), -1, 1));
};

export const smoothValue = (previous, next, alpha = 0.18) => {
  if (previous == null) return next;
  if (Array.isArray(next)) {
    return next.map((value, index) => smoothValue(previous[index], value, alpha));
  }
  return lerp(previous, next, alpha);
};

export const normalizedPointToScene = (point, depth = 0, scale = 4.2) => {
  const x = (0.5 - point.x) * scale;
  const y = (0.5 - point.y) * scale * 0.62 + 0.65;
  const z = depth || -1.5 + (point.z ?? 0) * 2;
  return [x, y, z];
};

export const screenToNdc = (x, y, rect) => ({
  x: ((x - rect.left) / rect.width) * 2 - 1,
  y: -(((y - rect.top) / rect.height) * 2 - 1)
});
