import { GESTURE_DEBOUNCE_MS, GESTURES } from '../utils/constants.js';
import { handVelocity, palmCenter, twoHandDistance, wristAngle } from '../utils/gestureUtils.js';

export class GestureHistory {
  constructor() {
    this.frames = [];
    this.gestureState = new Map();
    this.lastConfirmed = new Map();
    this.maxFrames = 18;
  }

  push(hands) {
    const now = performance.now();
    const previous = this.frames.at(-1);
    const enrichedHands = hands.map((hand, index) => {
      const previousHand = previous?.hands[index]?.landmarks;
      return {
        ...hand,
        palm: palmCenter(hand.landmarks),
        wristAngle: wristAngle(hand.landmarks),
        velocity: handVelocity(previousHand, hand.landmarks, previous ? now - previous.at : 16.7)
      };
    });
    const frame = { at: now, hands: enrichedHands, twoHandDistance: twoHandDistance(enrichedHands) };
    this.frames.push(frame);
    this.frames = this.frames.slice(-this.maxFrames);
    return frame;
  }

  confirm(key, gesture, confidence) {
    const now = performance.now();
    const stateKey = `${key}:${gesture}`;
    const existing = this.gestureState.get(stateKey);
    if (!existing) {
      this.gestureState.set(stateKey, { startedAt: now, confidence });
      return { locked: false, progress: 0 };
    }
    existing.confidence = Math.max(existing.confidence * 0.72 + confidence * 0.28, confidence);
    const progress = Math.min((now - existing.startedAt) / GESTURE_DEBOUNCE_MS, 1);
    const last = this.lastConfirmed.get(stateKey) ?? 0;
    const locked = progress >= 1 && now - last > GESTURE_DEBOUNCE_MS;
    if (locked) this.lastConfirmed.set(stateKey, now);
    return { locked, progress, confidence: existing.confidence };
  }

  clearExcept(activeKeys) {
    [...this.gestureState.keys()].forEach((key) => {
      if (!activeKeys.has(key)) this.gestureState.delete(key);
    });
  }

  enrichClassification(classification, frame) {
    const active = new Set();
    const hands = classification.hands.map((hand, index) => {
      const key = `${hand.handedness ?? index}`;
      const gesture = hand.gesture ?? GESTURES.NONE;
      active.add(`${key}:${gesture}`);
      const lock = gesture === GESTURES.NONE ? { locked: false, progress: 0 } : this.confirm(key, gesture, hand.confidence ?? 0.5);
      return {
        ...hand,
        ...frame.hands[index],
        lock
      };
    });
    this.clearExcept(active);
    const twoHandGesture = this.detectTwoHandGesture(frame, classification);
    return {
      ...classification,
      hands,
      twoHandGesture
    };
  }

  detectTwoHandGesture(frame, classification) {
    if (frame.hands.length < 2 || this.frames.length < 6) return null;
    const first = this.frames[0];
    const currentDistance = frame.twoHandDistance;
    const previousDistance = first.twoHandDistance;
    const distanceDelta = currentDistance - previousDistance;
    const wristDelta = Math.abs(frame.hands[0].wristAngle - first.hands[0].wristAngle) + Math.abs(frame.hands[1].wristAngle - first.hands[1].wristAngle);
    const bothPinched = classification.hands.every((hand) => hand.gesture === GESTURES.PINCH);
    if (bothPinched && distanceDelta > 0.08) return { gesture: GESTURES.TWO_HAND_SPREAD, confidence: Math.min(distanceDelta * 5, 1) };
    if (bothPinched && distanceDelta < -0.08) return { gesture: GESTURES.TWO_HAND_PINCH, confidence: Math.min(Math.abs(distanceDelta) * 5, 1) };
    if (bothPinched && wristDelta > 0.65) return { gesture: GESTURES.TWO_HAND_TWIST, confidence: Math.min(wristDelta / 1.6, 1) };
    return null;
  }
}
