'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Keep the critical CSS variables and classes in sync with the active theme
  // so the background/text do not lag behind next-themes class toggles.
  useEffect(() => {
    if (!resolvedTheme) return;
    const isDark = resolvedTheme === 'dark';
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    root.style.setProperty('--body-bg', isDark ? '#0B0B0F' : '#ffffff');
    root.style.setProperty('--body-text', isDark ? '#ffffff' : '#111827');
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [resolvedTheme]);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center animate-pulse" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2.5 rounded-full bg-gray-100 dark:bg-[#13131A] text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors border border-gray-300 dark:border-gray-800/80"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
