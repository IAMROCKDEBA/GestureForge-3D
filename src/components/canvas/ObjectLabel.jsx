export const ObjectLabel = ({ object, screenPoint }) => {
  if (!object || !screenPoint?.visible) return null;
  return (
    <div className="object-label" style={{ left: screenPoint.x, top: screenPoint.y }}>
      <strong>{object.name}</strong>
      <span>{object.type}</span>
    </div>
  );
};
