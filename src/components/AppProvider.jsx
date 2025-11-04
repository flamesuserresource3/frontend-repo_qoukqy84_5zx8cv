import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Task: { id: string, title: string, description?: string, estimate: number, status: 'Pending'|'In Progress'|'Completed', completedSessions: number }
// Session Log: { id: string, taskId?: string, type: 'work'|'short'|'long', start: number, end: number }

const AppContext = createContext(null);

const STORAGE_KEYS = {
  tasks: 'tm_tasks',
  settings: 'tm_settings',
  sessions: 'tm_sessions',
  timer: 'tm_timer_state',
  ui: 'tm_ui_state',
};

const defaultSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
  sound: true,
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => loadLS(key, initialValue));
  useEffect(() => saveLS(key, state), [key, state]);
  return [state, setState];
}

function applyDarkClass(enabled) {
  const root = document.documentElement;
  const body = document.body;
  const appRoot = document.getElementById('root');
  [root, body, appRoot].forEach((el) => {
    if (!el) return;
    if (enabled) el.classList.add('dark');
    else el.classList.remove('dark');
  });
}

export function AppProvider({ children }) {
  // Prefer system theme if no stored preference
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultUi = { darkMode: prefersDark, showSettings: false, showEndPrompt: false };

  // Tasks and sessions
  const [tasks, setTasks] = useLocalStorageState(STORAGE_KEYS.tasks, []);
  const [sessions, setSessions] = useLocalStorageState(STORAGE_KEYS.sessions, []);
  const [settings, setSettings] = useLocalStorageState(STORAGE_KEYS.settings, defaultSettings);
  const [ui, setUi] = useLocalStorageState(STORAGE_KEYS.ui, defaultUi);

  // Timer state persisted
  const [timer, setTimer] = useLocalStorageState(STORAGE_KEYS.timer, {
    mode: 'work',
    isRunning: false,
    isPaused: false,
    endTime: null,
    remaining: 0,
    currentTaskId: null,
    cycleCount: 0,
    lastStart: null,
  });

  const tickRef = useRef(null);

  // Dark mode effect
  useEffect(() => {
    applyDarkClass(!!ui.darkMode);
  }, [ui.darkMode]);

  // Recompute remaining based on endTime
  useEffect(() => {
    if (!timer.isRunning || !timer.endTime || timer.isPaused) return;

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.round((timer.endTime - now) / 1000));
      setTimer((t) => ({ ...t, remaining: diff }));
      if (diff <= 0) {
        clearInterval(tickRef.current);
        tickRef.current = null;
        handleTimerEnd();
      }
    };

    update();
    tickRef.current = setInterval(update, 500);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.isRunning, timer.endTime, timer.isPaused]);

  // Visibility change: keep timer accurate
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        if (timer.isRunning && timer.endTime && !timer.isPaused) {
          const now = Date.now();
          const diff = Math.max(0, Math.round((timer.endTime - now) / 1000));
          setTimer((t) => ({ ...t, remaining: diff }));
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [timer.isRunning, timer.endTime, timer.isPaused, setTimer]);

  const currentTask = useMemo(() => tasks.find((t) => t.id === timer.currentTaskId) || null, [tasks, timer.currentTaskId]);

  // Audio notification using WebAudio API
  const playBeep = () => {
    if (!settings.sound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.45);
    } catch {}
  };

  // Timer control helpers
  const getModeDurationSec = (mode) => {
    if (mode === 'work') return Math.max(1, settings.workMinutes) * 60;
    if (mode === 'short') return Math.max(1, settings.shortBreakMinutes) * 60;
    return Math.max(1, settings.longBreakMinutes) * 60;
  };

  const startForTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const duration = getModeDurationSec('work');
    const endTime = Date.now() + duration * 1000;
    setTimer({ mode: 'work', isRunning: true, isPaused: false, endTime, remaining: duration, currentTaskId: taskId, cycleCount: timer.cycleCount || 0, lastStart: Date.now() });
    setTasks((prev) => prev.map((t) => (t.id === taskId && t.status === 'Pending' ? { ...t, status: 'In Progress' } : t)));
  };

  const pause = () => {
    if (!timer.isRunning || timer.isPaused) return;
    setTimer((t) => ({ ...t, isPaused: true }));
  };

  const resume = () => {
    if (!timer.isRunning || !timer.isPaused) return;
    const endTime = Date.now() + timer.remaining * 1000;
    setTimer((t) => ({ ...t, isPaused: false, endTime }));
  };

  const reset = () => {
    setTimer({ mode: 'work', isRunning: false, isPaused: false, endTime: null, remaining: 0, currentTaskId: null, cycleCount: 0, lastStart: null });
  };

  const switchMode = (nextMode) => {
    const duration = getModeDurationSec(nextMode);
    const endTime = Date.now() + duration * 1000;
    setTimer((t) => ({ ...t, mode: nextMode, isRunning: true, isPaused: false, endTime, remaining: duration, lastStart: Date.now() }));
  };

  const completeWorkSession = () => {
    const log = { id: uid(), taskId: timer.currentTaskId, type: 'work', start: timer.lastStart || Date.now(), end: Date.now() };
    setSessions((prev) => [log, ...prev]);
    if (timer.currentTaskId) {
      setTasks((prev) => prev.map((t) => (t.id === timer.currentTaskId ? { ...t, completedSessions: (t.completedSessions || 0) + 1, status: (t.completedSessions + 1) >= t.estimate ? 'Completed' : t.status } : t)));
    }
  };

  const handleTimerEnd = () => {
    playBeep();

    if (timer.mode === 'work') {
      completeWorkSession();
      const nextIsLong = ((timer.cycleCount + 1) % Math.max(1, settings.longBreakEvery)) === 0;
      setTimer((t) => ({ ...t, isRunning: false, isPaused: false }));
      setUi((u) => ({ ...u, showEndPrompt: true }));
      setUi((u) => ({ ...u, intendedNextMode: nextIsLong ? 'long' : 'short' }));
    } else {
      const nextMode = 'work';
      const resetCycle = timer.mode === 'long';
      setTimer((t) => ({ ...t, cycleCount: resetCycle ? 0 : t.cycleCount, currentTaskId: t.currentTaskId }));
      switchMode(nextMode);
    }
  };

  const confirmBreak = () => {
    const intended = ui.intendedNextMode || 'short';
    setUi((u) => ({ ...u, showEndPrompt: false, intendedNextMode: null }));
    setTimer((t) => ({ ...t, cycleCount: (t.cycleCount || 0) + 1 }));
    switchMode(intended);
  };

  const continueWork = () => {
    setUi((u) => ({ ...u, showEndPrompt: false, intendedNextMode: null }));
    switchMode('work');
  };

  // Task CRUD
  const addTask = (data) => {
    const task = { id: uid(), title: data.title.trim(), description: (data.description || '').trim(), estimate: Math.max(1, Number(data.estimate || 1)), status: 'Pending', completedSessions: 0 };
    setTasks((prev) => [task, ...prev]);
  };

  const updateTask = (id, updates) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (timer.currentTaskId === id) reset();
  };

  const value = {
    tasks,
    sessions,
    settings,
    ui,
    timer,
    currentTask,

    setSettings,
    setUi,

    // Timer controls
    startForTask,
    pause,
    resume,
    reset,
    continueWork,
    confirmBreak,

    // Tasks
    addTask,
    updateTask,
    deleteTask,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
