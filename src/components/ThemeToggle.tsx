import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
      >
        <span className="sr-only">Toggle theme</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        <Sun className={`absolute left-1 h-3 w-3 text-yellow-500 transition-opacity ${
          theme === 'dark' ? 'opacity-0' : 'opacity-100'
        }`} />
        <Moon className={`absolute right-1 h-3 w-3 text-blue-500 transition-opacity ${
          theme === 'dark' ? 'opacity-100' : 'opacity-0'
        }`} />
      </button>
    </div>
  );
};

export default ThemeToggle;