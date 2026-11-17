'use client';

import { useState } from 'react';
import { CreditCard, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useUiLang } from '@/components/LanguageProvider';

export default function ActivationModal({ settings, onClose, onPaid }) {
  const { t } = useUiLang();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const price = Number(settings.activationPrice) || 0;
  const currency = settings.currency || 'USD';

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, siteId: 'default' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      if (data.status === 'redirect' && data.url) {
        window.location.href = data.url;
        return;
      }
      onPaid({ reference: data.reference, provider: data.provider, amount: price, currency });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
      <div className="w-full max-w-md animate-scale-in overflow-hidden rounded-3xl bg-white shadow-pop">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-6 text-white">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <CreditCard size={22} />
          </div>
          <h2 className="text-xl font-extrabold">{t('activation.title')}</h2>
          <p className="mt-1 text-sm text-brand-100">{t('activation.subtitle')}</p>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-baseline justify-between rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3">
            <span className="text-sm font-semibold text-ink-600">{t('activation.fee')}</span>
            <span className="text-2xl font-extrabold tabular-nums text-ink-900">
              {price.toFixed(2)} <span className="text-sm font-bold text-ink-500">{currency}</span>
            </span>
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
              {t('activation.emailLabel')}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </label>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800">
            <ShieldCheck size={15} />
            {settings.paymentProvider === 'mock'
              ? t('activation.testModeOn')
              : t('activation.secureVia', { provider: settings.paymentProvider })}
          </div>

          {error ? (
            <div className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">{error}</div>
          ) : null}

          <button
            type="button"
            onClick={pay}
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-sm font-bold text-white shadow transition hover:from-brand-700 hover:to-brand-600 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
            {busy ? t('activation.processing') : t('activation.payAndContinue', { price: `${price.toFixed(2)} ${currency}` })}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-ink-500 transition hover:bg-ink-50"
          >
            {t('activation.maybeLater')}
          </button>
        </div>
      </div>
    </div>
  );
}
