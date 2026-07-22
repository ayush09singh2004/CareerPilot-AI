import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle — sun/moon button that switches light ↔ dark
 * Can be placed in any header/navbar.
 */
const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0
        bg-gray-100 dark:bg-slate-700
        text-gray-500 dark:text-yellow-300
        hover:bg-gray-200 dark:hover:bg-slate-600
        transition-colors duration-200 ${className}`}
    >
      {/* Sun — shown in dark mode */}
      <span
        style={{ transition: 'opacity 0.25s ease, transform 0.25s ease' }}
        className={isDark ? 'opacity-100 rotate-0 scale-100 absolute' : 'opacity-0 rotate-90 scale-50 absolute'}
      >
        <Sun size={17} strokeWidth={2} />
      </span>

      {/* Moon — shown in light mode */}
      <span
        style={{ transition: 'opacity 0.25s ease, transform 0.25s ease' }}
        className={!isDark ? 'opacity-100 rotate-0 scale-100 absolute' : 'opacity-0 -rotate-90 scale-50 absolute'}
      >
        <Moon size={17} strokeWidth={2} />
      </span>
    </button>
  );
};

export default ThemeToggle;
