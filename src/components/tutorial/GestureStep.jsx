import { motion } from 'framer-motion';

export const GestureStep = ({ title, copy, gesture, onNext, onBack, onSimulate }) => (
  <motion.div className="tutorial-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
    <h2>{title}</h2>
    <p>{copy}</p>
    <div className="gesture-demo">
      <svg viewBox="0 0 720 180" width="100%" height="100%" role="img" aria-label={`${gesture} gesture guide`}>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M274 134 C278 104 286 74 300 42 C310 24 335 31 330 54 L316 112" stroke="#38BDF8" strokeWidth="16" />
          <path d="M334 126 C344 92 356 58 370 30 C382 8 410 20 402 46 L374 124" stroke="#A78BFA" strokeWidth="16" />
          <path d="M398 130 C408 92 420 62 438 42 C454 24 478 42 466 62 L430 130" stroke="#F472B6" strokeWidth="16" />
          <path d="M292 136 C342 162 406 164 466 136 C480 130 494 142 486 156 C468 188 296 188 274 156 C266 144 278 130 292 136Z" fill="rgba(56,189,248,.12)" stroke="#EAF7FF" strokeWidth="8" />
          <circle cx="326" cy="108" r="26" stroke="#34D399" strokeWidth="5" strokeDasharray="8 8" />
          <circle cx="366" cy="110" r="26" stroke="#34D399" strokeWidth="5" strokeDasharray="8 8" />
        </g>
      </svg>
    </div>
    <div className="segmented">
      <button className="text-button" onClick={onBack}>
        Back
      </button>
      <button className="text-button active" onClick={() => onSimulate?.()}>
        Try Demo
      </button>
      <button className="text-button" onClick={onNext}>
        Next
      </button>
    </div>
  </motion.div>
);
