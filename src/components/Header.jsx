import React from 'react';
import { Moon, Sun, Settings } from 'lucide-react';
import { useApp } from './AppProvider';

export default function Header() {
  const { ui, setUi } = useApp();

  return (
    <header className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-rose-500" />
        <h1 className="text-xl font-semibold">TaskManager</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setUi((u) => ({ ...u, darkMode: !u.darkMode }))}
          className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Toggle dark mode"
        >
          {ui.darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => setUi((u) => ({ ...u, showSettings: true }))}
          className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Open settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
