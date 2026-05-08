import { useCallback, useEffect, useRef } from 'react';
import { useCameraStore } from '../store/useCameraStore.js';

const stopStream = (stream) => {
  stream?.getTracks?.().forEach((track) => track.stop());
};

export const useCamera = ({ videoRef, handVideoRef } = {}) => {
  const permission = useCameraStore((state) => state.permission);
  const error = useCameraStore((state) => state.error);
  const stream = useCameraStore((state) => state.stream);
  const handStream = useCameraStore((state) => state.handStream);
  const visibleFacingMode = useCameraStore((state) => state.visibleFacingMode);
  const handFacingMode = useCameraStore((state) => state.handFacingMode);
  const selfieMode = useCameraStore((state) => state.selfieMode);
  const frozen = useCameraStore((state) => state.frozen);
  const zoom = useCameraStore((state) => state.zoom);
  const brightness = useCameraStore((state) => state.brightness);
  const exposure = useCameraStore((state) => state.exposure);
  const handCamActive = useCameraStore((state) => state.handCamActive);
  const setPermission = useCameraStore((state) => state.setPermission);
  const setError = useCameraStore((state) => state.setError);
  const setStream = useCameraStore((state) => state.setStream);
  const setHandStream = useCameraStore((state) => state.setHandStream);
  const startingRef = useRef(false);

  const attachStream = useCallback(async (video, stream) => {
    if (!video || !stream) return;
    video.srcObject = stream;
    video.playsInline = true;
    video.muted = true;
    try {
      await video.play();
    } catch (error) {
      console.warn('Video playback is waiting for user interaction', error);
    }
  }, []);

  const start = useCallback(async () => {
    if (startingRef.current) return;
    const current = useCameraStore.getState();
    startingRef.current = true;
    setPermission('requesting');
    setError(null);
    try {
      stopStream(current.stream);
      const constraints = {
        video: {
          facingMode: current.selfieMode ? 'user' : current.visibleFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60, min: 24 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(stream);
      setPermission('granted');
      await attachStream(videoRef?.current, stream);

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile && !current.selfieMode && handVideoRef?.current) {
        try {
          stopStream(current.handStream);
          const handStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 30 }
            },
            audio: false
          });
          setHandStream(handStream);
          await attachStream(handVideoRef.current, handStream);
        } catch (error) {
          console.info('Dual-camera tracking unavailable; using visible feed for hands.', error);
          setHandStream(null);
        }
      }
    } catch (error) {
      setPermission('denied');
      setError(error?.message ?? 'Camera permission was denied.');
    } finally {
      startingRef.current = false;
    }
  }, [attachStream, handVideoRef, setError, setHandStream, setPermission, setStream, videoRef]);

  const stop = useCallback(() => {
    const current = useCameraStore.getState();
    stopStream(current.stream);
    stopStream(current.handStream);
    setStream(null);
    setHandStream(null);
    setPermission('idle');
  }, [setHandStream, setPermission, setStream]);

  useEffect(() => () => stop(), [stop]);

  return {
    permission,
    error,
    stream,
    handStream,
    visibleFacingMode,
    handFacingMode,
    selfieMode,
    frozen,
    zoom,
    brightness,
    exposure,
    handCamActive,
    start,
    stop
  };
};
