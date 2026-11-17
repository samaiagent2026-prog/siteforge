'use client';

import { useState } from 'react';
import { Check, Globe, Plus, Trash2, X } from 'lucide-react';
import { LANGUAGES } from '@/lib/defaults';

const RTL = ['ar', 'ur', 'he', 'fa'];

export default function LanguagesModal({ site, onChange, onClose }) {
  const cfg = site.languages || { enabled: ['en'], default: 'en', custom: [] };
  const custom = cfg.custom || [];
  const all = [...LANGUAGES, ...custom];
  const [newLang, setNewLang] = useState({ code: '', label: '', dir: 'ltr' });
  const [error, setError] = useState('');

  const enabled = cfg.enabled || ['en'];

  const commit = (patch) => onChange({ languages: { ...cfg, ...patch } });

  const toggle = (code) => {
    const isOn = enabled.includes(code);
    let next = isOn ? enabled.filter((c) => c !== code) : [...enabled, code];
    if (!next.length) next = ['en'];
    const nextDefault = next.includes(cfg.default) ? cfg.default : next[0];
    commit({ enabled: next, default: nextDefault });
  };

  const addCustom = () => {
    const code = newLang.code.trim().toLowerCase();
    const label = newLang.label.trim() || newLang.code.trim();
    if (!/^[a-z]{2}(-[a-z]{2})?$/.test(code)) {
      setError('Use a short language code, e.g. pt or pt-BR.');
      return;
    }
    if (all.some((l) => l.code === code)) {
      setError('That language code already exists.');
      return;
    }
    setError('');
    const dir = newLang.dir || (RTL.includes(code.split('-')[0]) ? 'rtl' : 'ltr');
    commit({
      custom: [...custom, { code, label, dir }],
      enabled: [...enabled, code],
    });
    setNewLang({ code: '', label: '', dir: 'ltr' });
  };

  const removeCustom = (code) => {
    const nextCustom = custom.filter((c) => c.code !== code);
    let nextEnabled = enabled.filter((c) => c !== code);
    if (!nextEnabled.length) nextEnabled = ['en'];
    const nextDefault = nextEnabled.includes(cfg.default) ? cfg.default : nextEnabled[0];
    commit({ custom: nextCustom, enabled: nextEnabled, default: nextDefault });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/45 p-4" onMouseDown={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-2xl animate-scale-in overflow-hidden rounded-3xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <Globe size={20} />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-ink-900">Website languages</h2>
              <p className="text-xs text-ink-500">
                Turn on as many as you need. Arabic and other right-to-left languages switch automatically.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto scroll-thin px-5 py-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {all.map((l) => {
              const on = enabled.includes(l.code);
              const isDefault = cfg.default === l.code;
              const isCustom = custom.some((c) => c.code === l.code);
              return (
                <div
                  key={l.code}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 transition ${
                    on ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(l.code)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        on ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300 bg-white'
                      }`}
                    >
                      {on ? <Check size={12} /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink-800">{l.label}</span>
                      <span className="block text-[10px] font-medium uppercase tracking-wide text-ink-400">
                        {l.code} · {l.dir}
                      </span>
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    {on ? (
                      <button
                        type="button"
                        title="Use as default"
                        onClick={() => commit({ default: l.code })}
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase transition ${
                          isDefault
                            ? 'bg-brand-600 text-white'
                            : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:text-brand-700'
                        }`}
                      >
                        {isDefault ? 'Default' : 'Set'}
                      </button>
                    ) : null}
                    {isCustom ? (
                      <button
                        type="button"
                        title="Remove language"
                        onClick={() => removeCustom(l.code)}
                        className="rounded-md p-1 text-ink-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-ink-300 p-4">
            <h3 className="mb-2 text-sm font-bold text-ink-800">Add your own language</h3>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Code</span>
                <input
                  type="text"
                  value={newLang.code}
                  onChange={(e) => setNewLang({ ...newLang, code: e.target.value })}
                  placeholder="pt-BR"
                  className="w-24 rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Name</span>
                <input
                  type="text"
                  value={newLang.label}
                  onChange={(e) => setNewLang({ ...newLang, label: e.target.value })}
                  placeholder="Português (Brasil)"
                  className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Direction</span>
                <select
                  value={newLang.dir}
                  onChange={(e) => setNewLang({ ...newLang, dir: e.target.value })}
                  className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="ltr">Left to right</option>
                  <option value="rtl">Right to left</option>
                </select>
              </label>
              <button
                type="button"
                onClick={addCustom}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-700"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/70 px-5 py-3">
          <p className="text-[11px] text-ink-500">
            Tip: select any text element and add its translation per language in the floating toolbar.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-ink-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-ink-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
