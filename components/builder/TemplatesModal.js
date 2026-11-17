'use client';

import { useMemo, useState } from 'react';
import { Check, LayoutTemplate, Loader2, Sparkles, TriangleAlert, X } from 'lucide-react';
import { listTemplates, getTemplate } from '@/lib/templates';
import { useUiLang } from '@/components/LanguageProvider';

/**
 * Template gallery. Loading a template replaces the whole document, so we warn
 * before discarding unsaved work.
 */
export default function TemplatesModal({ open, onClose, onApply, currentName }) {
  const { t, lang } = useUiLang();
  const [category, setCategory] = useState('all');
  const [busy, setBusy] = useState(null);
  const templates = useMemo(() => listTemplates(), []);

  const categories = useMemo(() => {
    const seen = [];
    templates.forEach((tpl) => {
      if (!seen.includes(tpl.category)) seen.push(tpl.category);
    });
    return seen;
  }, [templates]);

  const visible = category === 'all' ? templates : templates.filter((tpl) => tpl.category === category);

  if (!open) return null;

  const apply = (id) => {
    setBusy(id);
    const doc = getTemplate(id);
    if (doc) onApply(doc);
    setBusy(null);
  };

  const label = (tpl) => (lang === 'ar' ? tpl.nameAr : tpl.name);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[92vh] w-full max-w-5xl animate-scale-in flex-col overflow-hidden rounded-3xl bg-white shadow-pop">
        <header className="flex items-start justify-between gap-4 border-b border-ink-200 px-5 py-4 sm:px-7">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <LayoutTemplate size={19} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-ink-900">{t('templates.title')}</h2>
              <p className="text-xs text-ink-500">{t('templates.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          >
            <X size={17} />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 bg-ink-50/60 px-5 py-3 sm:px-7">
          {['all', ...categories].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                category === key
                  ? 'bg-ink-900 text-white shadow-sm'
                  : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:text-ink-900'
              }`}
            >
              {key === 'all' ? t('templates.all') : t(`templates.cat.${key}`)}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-5 sm:p-7">
          <div className="mb-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            <TriangleAlert size={15} className="mt-0.5 shrink-0" />
            {t('templates.replaceWarning', { name: currentName || t('builder.websiteName') })}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => apply(tpl.id)}
                disabled={!!busy}
                className="group overflow-hidden rounded-2xl border border-ink-200 bg-white text-start shadow-card transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift disabled:opacity-70"
              >
                <span className="relative block h-40 w-full overflow-hidden bg-ink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tpl.preview}
                    alt={label(tpl)}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span
                    className="absolute inset-x-0 bottom-0 h-1"
                    style={{ background: tpl.accent }}
                  />
                  <span className="absolute end-3 top-3 flex h-7 items-center gap-1 rounded-full bg-white/95 px-2.5 text-[10px] font-bold uppercase tracking-wide text-ink-700 shadow-sm">
                    {t(`templates.cat.${tpl.category}`)}
                  </span>
                </span>
                <span className="block p-4">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-ink-900">{label(tpl)}</span>
                    {busy === tpl.id ? (
                      <Loader2 size={15} className="animate-spin text-brand-600" />
                    ) : (
                      <span className="flex h-6 items-center gap-1 rounded-full bg-brand-50 px-2 text-[10px] font-bold text-brand-700 opacity-0 transition group-hover:opacity-100">
                        <Sparkles size={11} /> {t('templates.use')}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-ink-500">{tpl.desc}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-1.5">
                    {['en', 'ar'].map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-600"
                      >
                        <Check size={10} /> {code === 'ar' ? 'العربية' : 'English'}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
