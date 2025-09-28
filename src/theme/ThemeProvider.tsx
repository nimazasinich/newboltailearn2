import React, { createContext, useContext, useEffect, useState } from 'react';

type Mode = 'light' | 'dark';
type Density = 'compact' | 'comfortable';

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  density: Density;
  setDensity: (d: Density) => void;
};

const Ctx = createContext<Ctx>({
  mode: 'dark',
  setMode: () => {},
  density: 'compact',
  setDensity: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>((localStorage.getItem('mode') as Mode) || 'dark');
  const [density, setDensity] = useState<Density>((localStorage.getItem('density') as Density) || 'compact');

  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
    localStorage.setItem('mode', mode);
  }, [mode]);

  useEffect(() => {
    document.body.classList.toggle('compact', density === 'compact');
    localStorage.setItem('density', density);
  }, [density]);

  useEffect(() => {
    document.body.setAttribute('dir', 'rtl');
  }, []);

  return (
    <Ctx.Provider value={{ mode, setMode, density, setDensity }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);