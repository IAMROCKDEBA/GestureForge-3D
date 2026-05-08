import * as Icons from 'lucide-react';
import { useSceneStore } from '../../store/useSceneStore.js';

export const Timeline = () => {
  const history = useSceneStore((state) => state.history);
  const historyIndex = useSceneStore((state) => state.historyIndex);
  const restoreHistoryIndex = useSceneStore((state) => state.restoreHistoryIndex);
  return (
    <footer className="timeline" aria-label="Undo redo timeline">
      <div className="panel-title">
        <Icons.History size={16} />
        <div>
          Timeline
          <small>{history.length ? `${historyIndex + 1}/${history.length}` : 'ready'}</small>
        </div>
      </div>
      <div className="timeline-track">
        {history.length === 0 && <span className="mini-pill">Pinch or click + Add to create history</span>}
        {history.map((entry, index) => (
          <button
            key={entry.id}
            className={`history-pill ${historyIndex === index ? 'active' : ''}`}
            onClick={() => restoreHistoryIndex(index)}
            title={entry.label}
          >
            {index + 1}. {entry.kind}
          </button>
        ))}
      </div>
    </footer>
  );
};
