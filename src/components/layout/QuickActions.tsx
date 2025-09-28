import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export default function QuickActions() {
  const { mode, setMode, density, setDensity } = useTheme();

  return (
    <div className="toolbar">
      <button className="btn" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
        {mode === 'dark' ? 'Light' : 'Dark'}
      </button>
      <button className="btn" onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}>
        {density}
      </button>
    </div>
  );
}