import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme, ThemeMode } from '../utils/theme';

interface ThemeToggleProps {
  variant?: 'simple' | 'dropdown' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'dropdown', className = '' }) => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'simple') {
    return (
      <button
        onClick={toggleTheme}
        id="btn-theme-toggle-simple"
        title={`Tema actual: ${theme === 'system' ? 'Navegador (' + (isDark ? 'Oscuro' : 'Claro') + ')' : theme === 'dark' ? 'Oscuro' : 'Claro'}. Clic para alternar.`}
        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700' 
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
        } ${className}`}
      >
        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
      </button>
    );
  }

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs ${className}`}>
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Modo Claro"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Claro</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Modo Oscuro"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Oscuro</span>
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            theme === 'system'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Detectar automáticamente del navegador"
        >
          <Monitor className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Auto</span>
        </button>
      </div>
    );
  }

  // Default: Dropdown
  const themeLabels: Record<ThemeMode, { label: string; icon: React.ReactNode }> = {
    system: {
      label: 'Auto (Navegador)',
      icon: <Monitor className="w-3.5 h-3.5 text-emerald-500" />,
    },
    light: {
      label: 'Claro',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
    },
    dark: {
      label: 'Oscuro',
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
    },
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="btn-theme-dropdown-toggle"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
        title="Cambiar apariencia de color"
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
        <span className="hidden sm:inline">
          {theme === 'system' ? 'Auto' : theme === 'dark' ? 'Oscuro' : 'Claro'}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Tema de Interfaz
          </div>

          {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setTheme(mode);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-xl font-medium transition-colors cursor-pointer ${
                theme === mode
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {themeLabels[mode].icon}
                <span>{themeLabels[mode].label}</span>
              </div>
              {theme === mode && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#39A900]"></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
