'use client';

import { Languages } from 'lucide-react';
import { useUiLang } from './LanguageProvider';

/**
 * Compact AR/EN switch. Uses a segmented control so both options are always
 * visible — clearer than a single toggle for first-time users.
 */
export default function LanguageToggle({ className = '', tone = 'light' }) {
  const { lang, setLang } = useUiLang();

  const base =
    tone === 'dark'
      ? 'border-white/15 bg-white/10'
      : 'border-ink-200 bg-white';
  const activeCls = tone === 'dark' ? 'bg-white text-ink-900 shadow-sm' : 'bg-ink-900 text-white shadow-sm';
  const idleCls = tone === 'dark' ? 'text-white/70 hover:text-white' : 'text-ink-500 hover:text-ink-800';

  return (
    <div
      className={`flex items-center gap-0.5 rounded-xl border p-0.5 ${base} ${className}`}
      role="group"
      aria-label="Interface language"
    >
      <span className={`flex items-center px-1.5 ${tone === 'dark' ? 'text-white/60' : 'text-ink-400'}`}>
        <Languages size={13} />
      </span>
      {[
        { code: 'en', label: 'EN' },
        { code: 'ar', label: 'ع' },
      ].map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setLang(opt.code)}
          aria-pressed={lang === opt.code}
          data-testid={`ui-lang-${opt.code}`}
          title={opt.code === 'ar' ? 'العربية' : 'English'}
          className={`min-w-[30px] rounded-lg px-2 py-1 text-[11px] font-bold transition ${
            lang === opt.code ? activeCls : idleCls
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
