import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from './AppProvider';

export default function SettingsModal() {
  const { ui, setUi, settings, setSettings } = useApp();
  const [form, setForm] = useState(settings);

  const close = () => setUi((u) => ({ ...u, showSettings: false }));

  const save = () => {
    setSettings({
      workMinutes: Math.max(1, Number(form.workMinutes)),
      shortBreakMinutes: Math.max(1, Number(form.shortBreakMinutes)),
      longBreakMinutes: Math.max(1, Number(form.longBreakMinutes)),
      longBreakEvery: Math.max(1, Number(form.longBreakEvery)),
      sound: !!form.sound,
    });
    close();
  };

  if (!ui.showSettings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={close} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Work (min)" value={form.workMinutes} onChange={(v) => setForm((f) => ({ ...f, workMinutes: v }))} />
          <NumberField label="Short Break (min)" value={form.shortBreakMinutes} onChange={(v) => setForm((f) => ({ ...f, shortBreakMinutes: v }))} />
          <NumberField label="Long Break (min)" value={form.longBreakMinutes} onChange={(v) => setForm((f) => ({ ...f, longBreakMinutes: v }))} />
          <NumberField label="Long Break Every" value={form.longBreakEvery} onChange={(v) => setForm((f) => ({ ...f, longBreakEvery: v }))} />
          <div className="col-span-2 flex items-center gap-2 mt-1">
            <input id="sound" type="checkbox" className="h-4 w-4" checked={!!form.sound} onChange={(e) => setForm((f) => ({ ...f, sound: e.target.checked }))} />
            <label htmlFor="sound" className="text-sm">Sound notifications</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={close} className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
          <button onClick={save} className="px-3 py-1.5 rounded-md bg-rose-500 text-white hover:bg-rose-600">Save</button>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5"
      />
    </label>
  );
}
