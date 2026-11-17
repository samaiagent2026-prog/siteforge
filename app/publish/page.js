'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, CreditCard, Rocket, Server, Sparkles } from 'lucide-react';
import ActivationModal from '@/components/publish/ActivationModal';
import HostingHub from '@/components/publish/HostingHub';
import DeployStep from '@/components/publish/DeployStep';
import GabsterWidget from '@/components/GabsterWidget';

const STEPS = [
  { key: 'activate', label: 'Activation', icon: CreditCard },
  { key: 'hosting', label: 'Hosting & domain', icon: Server },
  { key: 'deploy', label: 'Publish', icon: Rocket },
];

export default function PublishPage() {
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
            <ArrowLeft size={16} /> Back to builder
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Sparkles size={14} />
            </span>
            <span className="text-sm font-extrabold text-ink-900">
              {settings ? settings.brandName : 'SiteForge'}
            </span>
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
                    {s.label}
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
          <div className="py-24 text-center text-sm text-ink-400">Loading…</div>
        ) : step === 'activate' ? (
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-50 text-brand-700">
              <Rocket size={28} />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Publish your website
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-ink-500">
              Three short steps: activate your site, choose where to host it, then we upload everything for
              you automatically. No technical skills needed.
            </p>

            <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              {[
                ['1', 'Activate', `One-time ${price.toFixed(0)} ${currency} activation fee.`],
                ['2', 'Choose hosting', 'Big friendly buttons for popular providers.'],
                ['3', 'Go live', 'Paste 3 details and we publish it for you.'],
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
                Activation complete — reference {order.reference}. Continue to choose your hosting.
              </div>
            ) : null}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {order ? (
                <button
                  type="button"
                  onClick={() => setStep('hosting')}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-7 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:from-brand-700 hover:to-brand-600"
                >
                  Continue <Rocket size={17} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowActivation(true)}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-7 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:from-brand-700 hover:to-brand-600"
                >
                  <CreditCard size={17} /> Activate for {price.toFixed(0)} {currency}
                </button>
              )}
              <Link
                href="/builder"
                className="rounded-2xl border border-ink-200 bg-white px-6 py-3.5 text-sm font-bold text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
              >
                Keep editing
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
