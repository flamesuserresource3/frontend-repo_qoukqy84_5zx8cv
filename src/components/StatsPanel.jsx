import React, { useMemo } from 'react';
import { useApp } from './AppProvider';

function startOfDay(ts = Date.now()) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function isSameDay(a, b) {
  return startOfDay(a) === startOfDay(b);
}

export default function StatsPanel() {
  const { sessions, tasks } = useApp();

  const { today, week } = useMemo(() => {
    const now = Date.now();
    const day0 = startOfDay(now);
    const day7 = day0 - 6 * 24 * 60 * 60 * 1000;
    const todaySessions = sessions.filter((s) => s.type === 'work' && isSameDay(s.end, now));
    const weekSessions = sessions.filter((s) => s.type === 'work' && s.end >= day7);
    const tasksCompletedToday = tasks.filter((t) => t.status === 'Completed' && todaySessions.some((s) => s.taskId === t.id)).length;
    return {
      today: { pomodoros: todaySessions.length, tasksCompleted: tasksCompletedToday },
      week: { pomodoros: weekSessions.length },
    };
  }, [sessions, tasks]);

  return (
    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
      <h3 className="font-semibold mb-2">Productivity</h3>
      <div className="grid grid-cols-3 gap-3 text-center">
        <StatCard label="Today" value={`${today.pomodoros}`} sub={`${today.tasksCompleted} tasks`} />
        <StatCard label="This Week" value={`${week.pomodoros}`} sub="pomodoros" />
        <StatCard label="Tasks Completed" value={`${tasks.filter((t) => t.status === 'Completed').length}`} sub="all time" />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-900">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{sub}</div>
    </div>
  );
}
