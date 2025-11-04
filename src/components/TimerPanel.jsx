import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useApp } from './AppProvider';

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function TimerPanel() {
  const { timer, currentTask, startForTask, pause, resume, reset, ui, confirmBreak, continueWork } = useApp();

  const statusLabel = timer.mode === 'work' ? 'Focus' : timer.mode === 'short' ? 'Short Break' : 'Long Break';
  const color = timer.mode === 'work' ? 'text-rose-500' : timer.mode === 'short' ? 'text-emerald-500' : 'text-sky-500';
  const ringColor = timer.mode === 'work' ? 'ring-rose-500' : timer.mode === 'short' ? 'ring-emerald-500' : 'ring-sky-500';

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold">Timer</h2>
        <p className="text-xs text-zinc-500 mt-1">{currentTask ? `Current task: ${currentTask.title}` : 'Select a task and start a Pomodoro.'}</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          key={timer.mode + String(timer.isRunning)}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
          className={`relative w-64 h-64 rounded-full ring-8 ${ringColor} flex items-center justify-center`}
        >
          <div className="text-center">
            <div className={`text-sm font-medium ${color}`}>{statusLabel}</div>
            <div className="text-6xl font-bold tabular-nums mt-1">{formatTime(timer.remaining)}</div>
            <div className="text-xs text-zinc-500 mt-2">Cycle {timer.cycleCount || 0}</div>
          </div>
        </motion.div>
        <div className="mt-6 flex items-center gap-3">
          {!timer.isRunning ? (
            <button
              onClick={() => currentTask && startForTask(currentTask.id)}
              disabled={!currentTask}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
            >
              <Play size={16} /> Start
            </button>
          ) : timer.isPaused ? (
            <button onClick={resume} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600">
              <Play size={16} /> Resume
            </button>
          ) : (
            <button onClick={pause} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600">
              <Pause size={16} /> Pause
            </button>
          )}
          <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      <AnimatePresence>
        {ui.showEndPrompt && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="mx-4 mb-4 p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">Session complete</div>
                <div className="text-xs text-zinc-500">Take a break or continue working?</div>
              </div>
              <div className="flex gap-2">
                <button onClick={confirmBreak} className="px-3 py-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600">Break</button>
                <button onClick={continueWork} className="px-3 py-1.5 rounded-md bg-rose-500 text-white hover:bg-rose-600">Continue</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
