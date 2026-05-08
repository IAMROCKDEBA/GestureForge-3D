import { GESTURES } from '../utils/constants.js';
import { clamp, vectorDistance } from '../utils/math.js';
import { extendedFingers, fingerCurl, palmFacingCamera, pinchDistance } from '../utils/gestureUtils.js';

export class GestureClassifier {
  classify(results) {
    const rawHands = results?.multiHandLandmarks ?? [];
    const handedness = results?.multiHandedness ?? [];
    const hands = rawHands.map((landmarks, index) => {
      const label = handedness[index]?.label ?? (index === 0 ? 'Right' : 'Left');
      return this.classifyHand(landmarks, label);
    });
    return {
      hands,
      hasHands: hands.length > 0,
      primaryGesture: hands[0]?.gesture ?? GESTURES.NONE,
      confidence: hands[0]?.confidence ?? 0
    };
  }

  classifyHand(landmarks, handedness = 'Right') {
    const fingers = extendedFingers(landmarks);
    const extendedCount = Object.values(fingers).filter(Boolean).length;
    const thumbIndex = pinchDistance(landmarks, 'index');
    const thumbMiddle = pinchDistance(landmarks, 'middle');
    const indexMiddle = vectorDistance(landmarks[8], landmarks[12]);
    const ringPalm = vectorDistance(landmarks[16], landmarks[0]);
    const curls = ['index', 'middle', 'ring', 'pinky'].map((finger) => fingerCurl(landmarks, finger));
    const avgCurl = curls.reduce((sum, value) => sum + value, 0) / curls.length;
    const facing = palmFacingCamera(landmarks);
    let gesture = GESTURES.NONE;
    let confidence = 0.35;
    if (thumbIndex < 0.055) {
      gesture = GESTURES.PINCH;
      confidence = clamp(1 - thumbIndex / 0.07, 0.52, 1);
    } else if (thumbMiddle < 0.06 && indexMiddle > 0.05) {
      gesture = GESTURES.MIDDLE_PINCH;
      confidence = clamp(1 - thumbMiddle / 0.08, 0.48, 1);
    } else if (facing && extendedCount >= 4) {
      gesture = GESTURES.OPEN_PALM;
      confidence = 0.92;
    } else if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
      gesture = GESTURES.PEACE;
      confidence = 0.86;
    } else if (fingers.index && fingers.middle && fingers.ring && !fingers.pinky) {
      gesture = GESTURES.THREE_FINGERS;
      confidence = 0.84;
    } else if (!fingers.thumb && fingers.index && fingers.middle && fingers.ring && fingers.pinky) {
      gesture = GESTURES.FOUR_FINGERS;
      confidence = 0.82;
    } else if (avgCurl > 0.44 && thumbIndex > 0.08) {
      gesture = GESTURES.FIST;
      confidence = clamp(avgCurl * 1.7, 0.58, 0.96);
    } else if (fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
      gesture = GESTURES.POINT;
      confidence = 0.8;
    } else if (this.isThumbUp(landmarks)) {
      gesture = GESTURES.THUMB_UP;
      confidence = 0.78;
    } else if (this.isThumbDown(landmarks)) {
      gesture = GESTURES.THUMB_DOWN;
      confidence = 0.78;
    } else if (avgCurl > 0.34) {
      gesture = GESTURES.GRAB;
      confidence = clamp(avgCurl * 1.4, 0.44, 0.86);
    }
    if (ringPalm < 0.16 && gesture === GESTURES.NONE) {
      gesture = 'material_cycle';
      confidence = 0.74;
    }
    return {
      landmarks,
      handedness,
      gesture,
      confidence,
      fingers,
      metrics: {
        thumbIndex,
        thumbMiddle,
        extendedCount,
        avgCurl,
        palmFacingCamera: facing
      }
    };
  }

  isThumbUp(landmarks) {
    const thumbTip = landmarks[4];
    const indexMcp = landmarks[5];
    const pinkyMcp = landmarks[17];
    return thumbTip.y < indexMcp.y - 0.08 && thumbTip.y < pinkyMcp.y - 0.08;
  }

  isThumbDown(landmarks) {
    const thumbTip = landmarks[4];
    const wrist = landmarks[0];
    return thumbTip.y > wrist.y + 0.1;
  }
}
