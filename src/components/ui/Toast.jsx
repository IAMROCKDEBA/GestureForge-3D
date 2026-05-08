import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore.js';

const colors = {
  info: 'var(--accent-primary)',
  success: 'var(--accent-success)',
  warning: 'var(--accent-warm)',
  danger: 'var(--accent-danger)'
};

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4200);
    return () => clearTimeout(timer);
  }, [onDismiss, toast.id]);
  return (
    <motion.div
      className="toast"
      style={{ '--toast-color': colors[toast.type] ?? colors.info }}
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 18, scale: 0.98 }}
    >
      <strong>{toast.title}</strong>
      {toast.message && <p>{toast.message}</p>}
    </motion.div>
  );
};

export const ToastStack = () => {
  const toasts = useUIStore((state) => state.toasts);
  const dismissToast = useUIStore((state) => state.dismissToast);
  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
