export const PerformanceHUD = ({ metrics }) => (
  <aside className="performance-hud" aria-label="Performance monitor">
    <span>
      <strong>{metrics.fps}</strong>FPS
    </span>
    <span>
      <strong>{metrics.handMs}</strong>Hand ms
    </span>
    <span>
      <strong>{metrics.renderMs}</strong>Render ms
    </span>
    <span>
      <strong>{metrics.objectCount}</strong>Objects
    </span>
  </aside>
);
