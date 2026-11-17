'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, CreditCard, Rocket, Server } from 'lucide-react';
import ActivationModal from '@/components/publish/ActivationModal';
import HostingHub from '@/components/publish/HostingHub';
import DeployStep from '@/components/publish/DeployStep';
import GabsterWidget from '@/components/GabsterWidget';
import BrandMark, { useBrand } from '@/components/Brand';
import { useUiLang } from '@/components/LanguageProvider';
import LanguageToggle from '@/components/LanguageToggle';

const STEPS = [
  { key: 'activate', labelKey: 'publish.activation', icon: CreditCard },
  { key: 'hosting', labelKey: 'publish.hostingDomain', icon: Server },
  { key: 'deploy', labelKey: 'publish.publishStep', icon: Rocket },
];

export default function PublishPage() {
  const { t } = useUiLang();
  const brand = useBrand();
  const [settings, setSettings] = useState(null);
  const [step, setStep] = useState('activate');
  const [order, setOrder] = useState(null);
  const [showActivation, setShowActivation] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data.settings))
      .catch(() => setSettings(null))
      .finally(() => setReady(true));
  }, []);

  // Returning from a hosted gateway (Stripe) with a paid reference.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paid = params.get('paid');
    if (paid) {
      setOrder({ reference: paid, provider: 'stripe' });
      setStep('hosting');
      window.history.replaceState({}, '', '/publish');
    }
  }, []);

  const handlePaid = useCallback((info) => {
    setOrder(info);
    setShowActivation(false);
    setStep('hosting');
  }, []);

  const currentIndex = STEPS.findIndex((s) => s.key === step);
  const price = settings ? Number(settings.activationPrice) : 0;
  const currency = settings ? settings.currency : 'USD';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-ink-50 to-white">
      <header className="border-b border-ink-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link href="/builder" className="flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-brand-700">
            <ArrowLeft size={16} className="rtl:rotate-180" /> {t('nav.backToBuilder')}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="flex items-center gap-2">
              <BrandMark settings={brand} size={28} radius="rounded-lg" />
              <span className="text-sm font-extrabold text-ink-900">
                {brand ? brand.brandName : t('common.appName')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="mx-auto w-full max-w-5xl px-5 pt-8">
        <ol className="flex items-center justify-center gap-2 [list-style:none] sm:gap-4">
          {STEPS.map((s, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            const IconCmp = s.icon;
            return (
              <li key={s.key} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                      done
                        ? 'bg-emerald-500 text-white'
                        : active
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-200'
                        : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    {done ? <Check size={16} /> : <IconCmp size={16} />}
                  </span>
                  <span
                    className={`hidden text-sm font-bold sm:block ${
                      active ? 'text-ink-900' : done ? 'text-emerald-600' : 'text-ink-400'
                    }`}
                  >
                    {t(s.labelKey)}
                  </span>
                </div>
                {i < STEPS.length - 1 ? (
                  <span className={`h-0.5 w-8 rounded-full sm:w-14 ${done ? 'bg-emerald-400' : 'bg-ink-200'}`} />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        {!ready ? (
          <div className="py-24 text-center text-sm text-ink-400">{t('common.loading')}</div>
        ) : step === 'activate' ? (
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-50 text-brand-700">
              <Rocket size={28} />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              {t('publish.title')}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-ink-500">{t('publish.subtitle')}</p>

            <div className="mt-8 grid gap-3 text-start sm:grid-cols-3">
              {[
                ['1', t('publish.step1Title'), t('publish.step1Body', { price: `${price.toFixed(0)} ${currency}` })],
                ['2', t('publish.step2Title'), t('publish.step2Body')],
                ['3', t('publish.step3Title'), t('publish.step3Body')],
              ].map(([n, title, body]) => (
                <div key={n} className="rounded-2xl border border-ink-200 bg-white p-4">
                  <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {n}
                  </span>
                  <h3 className="text-sm font-bold text-ink-900">{title}</h3>
                  <p className="mt-1 text-xs text-ink-500">{body}</p>
                </div>
              ))}
            </div>

            {order ? (
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
                {t('publish.activationComplete', { ref: order.reference })}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {order ? (
                <button
                  type="button"
                  onClick={() => setStep('hosting')}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-7 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:from-brand-700 hover:to-brand-600"
                >
                  {t('common.continue')} <Rocket size={17} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowActivation(true)}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-7 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:from-brand-700 hover:to-brand-600"
                >
                  <CreditCard size={17} /> {t('publish.activateFor', { price: `${price.toFixed(0)} ${currency}` })}
                </button>
              )}
              <Link
                href="/builder"
                className="rounded-2xl border border-ink-200 bg-white px-6 py-3.5 text-sm font-bold text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
              >
                {t('publish.keepEditing')}
              </Link>
            </div>
          </div>
        ) : step === 'hosting' ? (
          <HostingHub
            affiliates={settings.affiliates}
            onContinue={() => setStep('deploy')}
          />
        ) : (
          <DeployStep reference={order?.reference} onBack={() => setStep('hosting')} />
        )}
      </main>

      {showActivation && settings ? (
        <ActivationModal settings={settings} onClose={() => setShowActivation(false)} onPaid={handlePaid} />
      ) : null}

      {settings ? <GabsterWidget script={settings.gabsterScript} /> : null}
    </div>
  );
}
