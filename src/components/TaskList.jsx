import React, { useMemo, useState } from 'react';
import { CheckCircle2, Edit, Plus, Trash2, Timer } from 'lucide-react';
import { useApp } from './AppProvider';

export default function TaskList() {
  const { tasks, addTask, updateTask, deleteTask, startForTask, timer } = useApp();
  const [form, setForm] = useState({ title: '', description: '', estimate: 1 });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', estimate: 1 });

  const totals = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const inprog = tasks.filter((t) => t.status === 'In Progress').length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    return { total, pending, inprog, completed };
  }, [tasks]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTask(form);
    setForm({ title: '', description: '', estimate: 1 });
  };

  const beginEdit = (t) => {
    setEditingId(t.id);
    setEditForm({ title: t.title, description: t.description || '', estimate: t.estimate });
  };

  const saveEdit = (id) => {
    if (!editForm.title.trim()) return;
    updateTask(id, { ...editForm });
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold">Tasks</h2>
        <p className="text-xs text-zinc-500 mt-1">Total {totals.total} · Pending {totals.pending} · In Progress {totals.inprog} · Completed {totals.completed}</p>
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Task title"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5"
            rows={2}
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">Est. Pomodoros</label>
            <input
              type="number"
              min={1}
              value={form.estimate}
              onChange={(e) => setForm((f) => ({ ...f, estimate: Number(e.target.value) }))}
              className="w-20 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5"
            />
            <button type="submit" className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-500 text-white hover:bg-rose-600">
              <Plus size={16} /> Add
            </button>
          </div>
        </form>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-zinc-500 p-4">No tasks yet. Add your first task above.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-900">
                {editingId === t.id ? (
                  <div className="flex flex-col gap-2">
                    <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5" />
                    <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5" />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-zinc-500">Est.</label>
                      <input type="number" min={1} value={editForm.estimate} onChange={(e) => setEditForm((f) => ({ ...f, estimate: Number(e.target.value) }))} className="w-20 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5" />
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => saveEdit(t.id)} className="px-3 py-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600">Save</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${t.status === 'Completed' ? 'border-emerald-500 text-emerald-600' : t.status === 'In Progress' ? 'border-amber-500 text-amber-600' : 'border-zinc-300 text-zinc-600'}`}>{t.status}</span>
                        <h3 className="font-medium">{t.title}</h3>
                      </div>
                      {t.description ? <p className="text-sm text-zinc-500 mt-1">{t.description}</p> : null}
                      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                        <ProgressBar total={t.estimate} done={t.completedSessions || 0} />
                        <span>{t.completedSessions || 0}/{t.estimate} pomodoros</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        <button onClick={() => beginEdit(t)} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Edit task"><Edit size={16} /></button>
                        <button onClick={() => deleteTask(t.id)} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Delete task"><Trash2 size={16} /></button>
                      </div>
                      <button
                        onClick={() => startForTask(t.id)}
                        disabled={timer.isRunning && timer.currentTaskId !== t.id && timer.mode === 'work'}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Timer size={16} /> Start
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ total, done }) {
  const pct = Math.min(100, Math.round((done / Math.max(1, total)) * 100));
  return (
    <div className="w-32 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
      <div className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
