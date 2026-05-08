import { LANDMARK_CONNECTIONS } from '../../utils/constants.js';

export const GestureOverlay = ({ hand, width = 320, height = 240 }) => {
  if (!hand?.landmarks?.length) return null;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="hand-canvas" role="img" aria-label="Detected hand landmarks">
      {LANDMARK_CONNECTIONS.map(([a, b]) => {
        const start = hand.landmarks[a];
        const end = hand.landmarks[b];
        return (
          <line
            key={`${a}-${b}`}
            x1={start.x * width}
            y1={start.y * height}
            x2={end.x * width}
            y2={end.y * height}
            stroke="rgba(167, 139, 250, 0.82)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
      {hand.landmarks.map((point, index) => (
        <circle
          key={index}
          cx={point.x * width}
          cy={point.y * height}
          r={index % 4 === 0 ? 4.5 : 3}
          fill={index % 4 === 0 ? 'var(--accent-primary)' : 'rgba(240, 248, 255, 0.76)'}
        />
      ))}
    </svg>
  );
};
