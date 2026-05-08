import { useEffect, useMemo, useRef, useState } from 'react';
import { GestureEngine } from '../core/GestureEngine.js';
import { GESTURES } from '../utils/constants.js';

export const useHandTracking = ({ videoRef, enabled = true, onResults } = {}) => {
  const [status, setStatus] = useState({ state: 'idle' });
  const [results, setResults] = useState(null);
  const engineRef = useRef(null);
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  useEffect(() => {
    if (!enabled || !videoRef?.current) return undefined;
    const engine = new GestureEngine({
      onStatus: setStatus,
      onResults: (nextResults) => {
        setResults(nextResults);
        onResultsRef.current?.(nextResults);
      }
    });
    engineRef.current = engine;
    const video = videoRef.current;
    const start = () => engine.init(video);
    if (video.readyState >= 2) {
      start();
    } else {
      video.addEventListener('loadeddata', start, { once: true });
    }
    return () => {
      video.removeEventListener('loadeddata', start);
      engine.stop();
      engineRef.current = null;
    };
  }, [enabled, videoRef]);

  const api = useMemo(
    () => ({
      status,
      results,
      simulate: (gesture = GESTURES.PINCH, at) => engineRef.current?.simulate(gesture, at)
    }),
    [results, status]
  );

  return api;
};
