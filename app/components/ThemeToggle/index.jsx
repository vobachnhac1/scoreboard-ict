import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 ${className}`}
      title={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
      aria-label="Toggle theme"
    >
      {/* Background with gradient */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/50' 
          : 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/50'
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
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md ${
        isDark 
          ? 'bg-gradient-to-br from-indigo-400 to-purple-500' 
          : 'bg-gradient-to-br from-yellow-300 to-orange-400'
      }`}></div>
    </button>
  );
};

export default ThemeToggle;

