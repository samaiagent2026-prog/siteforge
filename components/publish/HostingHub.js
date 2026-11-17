'use client';

import { ArrowRight, ExternalLink, Mail, MousePointerClick, Server } from 'lucide-react';
import { useUiLang } from '@/components/LanguageProvider';

const ORDER = ['hostinger', 'godaddy', 'namecheap', 'bluehost'];

export default function HostingHub({ affiliates, onContinue }) {
  const { t } = useUiLang();
  const list = ORDER.filter((key) => affiliates[key]).map((key) => ({ key, ...affiliates[key] }));

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Server size={24} />
        </span>
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{t('hosting.title')}</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ink-500">{t('hosting.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((provider) => (
          <div
            key={provider.key}
            className="flex flex-col rounded-3xl border border-ink-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
          >
            <div className="mb-4 flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-extrabold text-white"
                style={{ background: provider.accent || '#2544f5' }}
              >
                {provider.name.slice(0, 1)}
              </span>
              <div>
                <h3 className="text-base font-extrabold text-ink-900">{provider.name}</h3>
                <p className="text-xs text-ink-500">{provider.note}</p>
              </div>
            </div>

            <ol className="mb-4 space-y-2 text-xs text-ink-600 [list-style:none]">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[10px] font-bold text-ink-600">
                  1
                </span>
                <span>{t('hosting.step1')}</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[10px] font-bold text-ink-600">
                  2
                </span>
                <span className="flex items-start gap-1">
                  <Mail size={13} className="mt-0.5 shrink-0 text-ink-400" />
                  {t('hosting.step2')}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[10px] font-bold text-ink-600">
                  3
                </span>
                <span>{t('hosting.step3')}</span>
              </li>
            </ol>

            <a
              href={provider.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ink-800"
            >
              {t('hosting.buyFrom', { name: provider.name })} <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-ink-300 bg-white px-6 py-5 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <MousePointerClick className="text-brand-600" size={22} />
          <p className="text-sm font-medium text-ink-600">
            {t('hosting.alreadyBought')}
          </p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:from-brand-700 hover:to-brand-600"
        >
          {t('hosting.haveDetails')} <ArrowRight size={15} className="rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
