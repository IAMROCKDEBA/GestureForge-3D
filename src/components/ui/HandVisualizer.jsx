import * as Icons from 'lucide-react';
import { GestureOverlay } from '../canvas/GestureOverlay.jsx';

export const HandVisualizer = ({ results, status }) => {
  const hand = results?.hands?.[0];
  const confidence = hand?.confidence ?? 0;
  const gesture = hand?.gesture?.replace(/_/g, ' ') ?? 'no hand';

  return (
    <section className="glass-panel" aria-label="Hand landmark visualizer">
      <div className="panel-header">
        <div className="panel-title">
          <Icons.Hand size={16} />
          <div>
            Hand Visualizer
            <small>{status?.state ?? 'idle'}</small>
          </div>
        </div>
        <span className="mini-pill active">{gesture}</span>
      </div>
      <div className="panel-body control-stack">
        {hand ? <GestureOverlay hand={hand} /> : <div className="hand-canvas" />}
        <div className="control-row">
          <label>
            Confidence
            <span>{Math.round(confidence * 100)}%</span>
          </label>
          <div className="confidence-bar" style={{ '--confidence': confidence }}>
            <span />
          </div>
        </div>
      </div>
    </section>
  );
};
