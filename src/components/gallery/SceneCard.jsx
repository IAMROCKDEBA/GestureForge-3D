export const SceneCard = ({ preset, onClick }) => (
  <button className="scene-card" onClick={onClick} style={{ borderColor: `${preset.accent}66` }}>
    <strong>{preset.title}</strong>
    <p>{preset.subtitle}</p>
  </button>
);
