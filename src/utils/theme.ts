import { useState, useEffect } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

export const getStoredTheme = (): ThemeMode => {
  try {
    const val = localStorage.getItem('sena_theme');
    if (val === 'light' || val === 'dark' || val === 'system') {
      return val;
    }
  } catch {
    // ignore
  }
  return 'system';
};

export const getSystemPrefersDark = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const applyThemeToDom = (mode: ThemeMode): boolean => {
  if (typeof document === 'undefined') return false;
  
  const isDark = mode === 'dark' || (mode === 'system' && getSystemPrefersDark());
  const root = document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  return isDark;
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());
  const [isDark, setIsDark] = useState<boolean>(() => {
    const current = getStoredTheme();
    return current === 'dark' || (current === 'system' && getSystemPrefersDark());
  });

  const setTheme = (newTheme: ThemeMode) => {
    try {
      localStorage.setItem('sena_theme', newTheme);
    } catch {
      // ignore
    }
    setThemeState(newTheme);
    const activeIsDark = applyThemeToDom(newTheme);
    setIsDark(activeIsDark);
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(isDark ? 'light' : 'dark');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  useEffect(() => {
    // Initial sync
    const activeIsDark = applyThemeToDom(theme);
    setIsDark(activeIsDark);

    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const currentStored = getStoredTheme();
      if (currentStored === 'system') {
        const dark = applyThemeToDom('system');
        setIsDark(dark);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [theme]);

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
};
