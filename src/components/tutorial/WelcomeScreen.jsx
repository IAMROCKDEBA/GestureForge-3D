import { motion } from 'framer-motion';

export const WelcomeScreen = ({ onBegin, onSkip }) => (
  <motion.div className="tutorial-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
    <h2>GestureForge 3D</h2>
    <p>
      A browser-native AR creation studio where camera tracking, spatial gestures, physics, sound, and Three.js objects converge into one live workspace.
    </p>
    <div className="gesture-demo" aria-hidden="true">
      <svg viewBox="0 0 720 180" width="100%" height="100%">
        <defs>
          <linearGradient id="introLine" x1="0" x2="1">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#A78BFA" />
            <stop offset="1" stopColor="#F472B6" />
          </linearGradient>
        </defs>
        <path d="M84 126 C166 18 280 166 364 68 S528 24 636 124" fill="none" stroke="url(#introLine)" strokeWidth="5" strokeLinecap="round" />
        {[84, 180, 278, 364, 472, 636].map((x, index) => (
          <circle key={x} cx={x} cy={index % 2 ? 62 : 124} r="10" fill={index % 2 ? '#A78BFA' : '#38BDF8'} />
        ))}
      </svg>
    </div>
    <div className="segmented two">
      <button className="text-button active" onClick={onBegin}>
        Begin
      </button>
      <button className="text-button" onClick={onSkip}>
        Skip
      </button>
    </div>
  </motion.div>
);
