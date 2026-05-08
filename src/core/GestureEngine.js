import { GestureClassifier } from './GestureClassifier.js';
import { GestureHistory } from './GestureHistory.js';
import { GESTURES } from '../utils/constants.js';

export class GestureEngine {
  constructor({ onResults, onStatus } = {}) {
    this.onResults = onResults;
    this.onStatus = onStatus;
    this.classifier = new GestureClassifier();
    this.history = new GestureHistory();
    this.hands = null;
    this.camera = null;
    this.running = false;
  }

  async init(videoElement) {
    if (!videoElement) return;
    try {
      const [{ Hands }, { Camera }] = await Promise.all([import('@mediapipe/hands'), import('@mediapipe/camera_utils')]);
      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.68,
        minTrackingConfidence: 0.62
      });
      this.hands.onResults((results) => this.handleResults(results));
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.running && this.hands) {
            await this.hands.send({ image: videoElement });
          }
        },
        width: 960,
        height: 540
      });
      this.running = true;
      await this.camera.start();
      this.onStatus?.({ state: 'running' });
    } catch (error) {
      console.warn('MediaPipe failed to start. Demo gestures remain available.', error);
      this.onStatus?.({ state: 'fallback', error });
    }
  }

  handleResults(results) {
    const classified = this.classifier.classify(results);
    const frame = this.history.push(classified.hands);
    const enriched = this.history.enrichClassification(classified, frame);
    enriched.synthetic = false;
    this.onResults?.(enriched);
  }

  stop() {
    this.running = false;
    this.camera?.stop?.();
    this.hands?.close?.();
  }

  simulate(gesture = GESTURES.PINCH, at = { x: 0.5, y: 0.5, z: -0.1 }) {
    const landmarks = Array.from({ length: 21 }, (_, index) => ({
      x: at.x + Math.sin(index) * 0.02,
      y: at.y + Math.cos(index) * 0.025,
      z: at.z + index * 0.001
    }));
    landmarks[4] = { x: at.x - 0.02, y: at.y, z: at.z };
    landmarks[8] = { x: at.x + (gesture === GESTURES.PINCH ? 0.015 : 0.04), y: at.y, z: at.z };
    const hand = { landmarks, handedness: 'Right', gesture, confidence: 0.95 };
    const frame = this.history.push([hand]);
    const enriched = this.history.enrichClassification({ hands: [hand], hasHands: true, primaryGesture: gesture, confidence: 0.95 }, frame);
    enriched.synthetic = true;
    this.onResults?.(enriched);
  }
}
