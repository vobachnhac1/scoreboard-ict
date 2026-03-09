import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = ({ className = '', compact = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center ${compact ? 'w-10 h-10' : 'w-12 h-10'} rounded-xl transition-all duration-300 hover:scale-105 shadow-inner border border-slate-200/50 dark:border-slate-600/50 ${className}`}
      title={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
      aria-label="Toggle theme"
    >
      {/* Background with gradient */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-indigo-500/80 to-purple-600/80' 
          : 'bg-gradient-to-br from-yellow-400/80 to-orange-500/80'
      }`}></div>


      {/* Icon */}
      <div className="relative z-10 transition-transform duration-300 group-hover:rotate-12">
        {isDark ? (
          <MoonIcon className="w-6 h-6 text-white" />
        ) : (
          <SunIcon className="w-6 h-6 text-white" />
        )}
      </div>

      {/* Glow effect on hover */}
      <div className={`absolute inset-0 rounded  opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md ${
        isDark 
          ? 'bg-gradient-to-br from-indigo-400 to-purple-500' 
          : 'bg-gradient-to-br from-yellow-300 to-orange-400'
      }`}></div>
    </button>
  );
};

export default ThemeToggle;

