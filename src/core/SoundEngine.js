import { Howler } from 'howler';
import { clamp, mapRange } from '../utils/math.js';

// Production SFX drop-in sources:
// Pixabay royalty-free effects: https://pixabay.com/sound-effects/
// Freesound CC0 effects: https://freesound.org/search/?f=license:%22Creative+Commons+0%22
// This engine synthesizes the same event families locally so the app works offline and avoids unclear licensing.
export class SoundEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.enabled = true;
    this.volume = 0.72;
    Howler.volume(this.volume);
  }

  ensure() {
    if (this.context) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.context.destination);
  }

  setMuted(muted) {
    this.enabled = !muted;
    Howler.mute(muted);
  }

  setVolume(volume) {
    this.volume = clamp(volume, 0, 1);
    Howler.volume(this.volume);
    if (this.master) this.master.gain.value = this.volume;
  }

  play(event, options = {}) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.context) return;
    if (this.context.state === 'suspended') this.context.resume();
    const presets = {
      startup: () => this.powerOn(options),
      spawn: () => this.spawn(options),
      select: () => this.chime(660, 0.06, options),
      delete: () => this.shatter(options),
      scaleUp: () => this.sweep(150, 440, 0.28, options),
      scaleDown: () => this.sweep(360, 90, 0.22, options),
      rotate: () => this.mechanicalSpin(options),
      color: () => this.sweep(520, 880, 0.12, options),
      wall: () => this.thud(90, 0.32, options),
      roof: () => this.creak(options),
      house: () => this.buildSequence(options),
      collapse: () => this.rumble(options),
      throw: () => this.sweep(320, 760, 0.16, { ...options, gain: (options.gain ?? 0.5) + 0.2 }),
      impact: () => this.thud(70, 0.18, options),
      undo: () => this.sweep(520, 180, 0.12, options),
      redo: () => this.sweep(180, 520, 0.1, options),
      mode: () => this.chime(440, 0.08, options),
      gesture: () => this.tick(options)
    };
    (presets[event] ?? presets.gesture)();
  }

  output(position = [0, 0, -1], gain = 0.45) {
    const panner = this.context.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10;
    panner.positionX.value = position[0] ?? 0;
    panner.positionY.value = position[1] ?? 0;
    panner.positionZ.value = position[2] ?? -1;
    const volume = this.context.createGain();
    volume.gain.value = gain;
    panner.connect(volume);
    volume.connect(this.master);
    return { panner, volume };
  }

  envelope(gainNode, duration, attack = 0.01, peak = 0.42) {
    const now = this.context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  }

  oscillator({ frequency = 440, type = 'sine', duration = 0.12, gain = 0.42, position, detune = 0, endFrequency }) {
    const { panner, volume } = this.output(position, gain);
    const osc = this.context.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.detune.value = detune;
    if (endFrequency) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), this.context.currentTime + duration);
    }
    osc.connect(panner);
    this.envelope(volume, duration, 0.01, gain);
    osc.start();
    osc.stop(this.context.currentTime + duration + 0.02);
  }

  noise({ duration = 0.2, gain = 0.25, position, filter = 900 }) {
    const bufferSize = Math.floor(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const biquad = this.context.createBiquadFilter();
    biquad.type = 'bandpass';
    biquad.frequency.value = filter;
    biquad.Q.value = 1.8;
    const { panner, volume } = this.output(position, gain);
    source.connect(biquad);
    biquad.connect(panner);
    this.envelope(volume, duration, 0.005, gain);
    source.start();
  }

  spawn(options) {
    this.noise({ duration: 0.18, gain: 0.18, filter: 1200, ...options });
    this.oscillator({ frequency: 740, endFrequency: 1180, type: 'sine', duration: 0.18, gain: 0.22, ...options });
    this.oscillator({ frequency: 1480, type: 'triangle', duration: 0.08, gain: 0.12, ...options });
  }

  shatter(options) {
    this.noise({ duration: 0.38, gain: 0.32, filter: 2600, ...options });
    [920, 1300, 1770, 2240].forEach((frequency, index) => {
      this.oscillator({ frequency, type: 'triangle', duration: 0.08 + index * 0.02, gain: 0.08, detune: index * 13, ...options });
    });
  }

  sweep(start, end, duration, options = {}) {
    this.oscillator({ frequency: start, endFrequency: end, type: 'sawtooth', duration, gain: options.gain ?? 0.18, position: options.position });
  }

  chime(frequency, duration, options = {}) {
    this.oscillator({ frequency, type: 'sine', duration, gain: options.gain ?? 0.16, position: options.position });
    this.oscillator({ frequency: frequency * 1.5, type: 'triangle', duration: duration * 1.4, gain: 0.08, position: options.position });
  }

  tick(options = {}) {
    this.oscillator({ frequency: 1900, type: 'square', duration: 0.025, gain: options.gain ?? 0.035, position: options.position });
  }

  thud(frequency = 80, duration = 0.2, options = {}) {
    this.oscillator({ frequency, endFrequency: frequency * 0.45, type: 'sine', duration, gain: options.gain ?? 0.32, position: options.position });
    this.noise({ duration: duration * 0.8, gain: 0.08, filter: 180, position: options.position });
  }

  creak(options = {}) {
    this.sweep(190, 150, 0.2, options);
    setTimeout(() => this.noise({ duration: 0.12, gain: 0.08, filter: 640, position: options.position }), 60);
  }

  mechanicalSpin(options = {}) {
    [220, 330, 440].forEach((frequency, index) => {
      setTimeout(() => this.sweep(frequency, frequency * 1.35, 0.08, { ...options, gain: 0.08 }), index * 42);
    });
  }

  buildSequence(options = {}) {
    ['wall', 'wall', 'roof', 'spawn'].forEach((event, index) => setTimeout(() => this.play(event, options), index * 115));
  }

  rumble(options = {}) {
    this.thud(55, 0.46, { ...options, gain: 0.45 });
    this.noise({ duration: 0.55, gain: 0.18, filter: 120, position: options.position });
  }

  powerOn(options = {}) {
    [110, 220, 440, 880].forEach((frequency, index) => {
      setTimeout(() => this.oscillator({ frequency, type: 'sine', duration: 0.2, gain: mapRange(index, 0, 3, 0.08, 0.2), position: options.position }), index * 90);
    });
  }
}

export const soundEngine = new SoundEngine();
