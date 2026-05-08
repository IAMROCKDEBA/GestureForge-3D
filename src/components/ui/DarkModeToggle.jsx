import * as Icons from 'lucide-react';
import { useUIStore } from '../../store/useUIStore.js';

export const DarkModeToggle = () => {
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const Icon = theme === 'dark' ? Icons.Moon : Icons.Sun;
  return (
    <button className="icon-button" onClick={toggleTheme} title="Toggle dark and light mode" aria-label="Toggle theme">
      <Icon size={17} />
    </button>
  );
};
