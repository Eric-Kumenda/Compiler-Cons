import React from 'react';
import { Button } from '@heroui/react';
import { Sun, Moon } from 'lucide-react';
import { useElmoStore } from '../store/elmoStore';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useElmoStore();

  return (
    <Button
      isIconOnly
      variant="secondary"
      onPress={toggleTheme}
      aria-label="Toggle theme"
      className="bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
    </Button>
  );
};
