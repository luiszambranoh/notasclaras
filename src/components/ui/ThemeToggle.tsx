"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-5 w-5" />;
    }
    return resolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'Sistema';
    }
    return resolvedTheme === 'dark' ? 'Oscuro' : 'Claro';
  };

  return (
    <button
      onClick={handleThemeChange}
      className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={`Cambiar a tema ${getLabel().toLowerCase()}`}
    >
      {getIcon()}
    </button>
  );
}