import React from 'react';
import { AppProvider } from './components/AppProvider';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import TaskList from './components/TaskList';
import TimerPanel from './components/TimerPanel';
import StatsPanel from './components/StatsPanel';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
        <Header />
        <main className="flex-1 grid grid-cols-1 md:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="border-r border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur">
            <TaskList />
          </aside>
          <section className="flex flex-col">
            <div className="flex-1">
              <TimerPanel />
            </div>
            <StatsPanel />
          </section>
        </main>
        <SettingsModal />
      </div>
    </AppProvider>
  );
}
