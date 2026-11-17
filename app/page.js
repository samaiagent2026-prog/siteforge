'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  Globe,
  Layers,
  LayoutGrid,
  MousePointerClick,
  Palette,
  Rocket,
  Server,
  Sparkles,
  Upload,
  Video,
} from 'lucide-react';
import GabsterWidget from '@/components/GabsterWidget';
import LanguageToggle from '@/components/LanguageToggle';
import { useUiLang } from '@/components/LanguageProvider';

const FEATURE_KEYS = [
  { icon: MousePointerClick, key: 'f1' },
  { icon: Palette, key: 'f2' },
  { icon: Layers, key: 'f3' },
  { icon: Video, key: 'f4' },
  { icon: LayoutGrid, key: 'f5' },
  { icon: Globe, key: 'f6' },
  { icon: Upload, key: 'f7' },
  { icon: Download, key: 'f8' },
];

const STEP_KEYS = [
  { icon: Palette, key: 's1' },
  { icon: Server, key: 's2' },
  { icon: Rocket, key: 's3' },
];

export default function HomePage() {
  const { t } = useUiLang();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => {});
  }, []);

  const brand = settings ? settings.brandName : t('common.appName');
  const fee = settings
    ? `${Number(settings.activationPrice).toFixed(0)} ${settings.currency}`
    : `50 USD`;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <Sparkles size={16} />
            </span>
            <span className="text-base font-extrabold tracking-tight text-ink-900">{brand}</span>
          </div>
          <nav className="flex items-center gap-2">
            <LanguageToggle className="me-1" />
            <Link
              href="/super-admin"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink-500 transition hover:text-brand-700 sm:block"
            >
              {t('nav.superAdmin')}
            </Link>
            <Link href="/builder" className="btn-primary px-4 py-2 text-sm">
              {t('nav.openBuilder')} <ArrowRight size={15} className="rtl:rotate-180" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-ink-950" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-brand-100 ring-1 ring-white/20">
            <Rocket size={13} /> {t('landing.badge')}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            {t('landing.heroTitle')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-brand-100 sm:text-lg">
            {t('landing.heroBody')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/builder"
              className="flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-extrabold text-brand-700 shadow-lift transition hover:-translate-y-0.5 hover:bg-brand-50"
            >
              {t('landing.startFree')} <ArrowRight size={17} className="rtl:rotate-180" />
            </Link>
            <Link
              href="/publish"
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-7 py-3.5 text-base font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20"
            >
              <Rocket size={17} /> {t('landing.publishNow')}
            </Link>
          </div>
          <p className="mt-4 text-xs font-medium text-brand-200">{t('landing.feeLine', { price: fee })}</p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('landing.featuresTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-ink-500">{t('landing.featuresBody')}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_KEYS.map((f) => (
            <div key={f.key} className="surface surface-interactive p-5">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <f.icon size={20} />
              </span>
              <h3 className="text-sm font-extrabold text-ink-900">{t(`landing.${f.key}.title`)}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{t(`landing.${f.key}.body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-ink-200 bg-ink-50 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              {t('landing.stepsTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-ink-500">{t('landing.stepsBody')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEP_KEYS.map((s, i) => (
              <div key={s.key} className="surface relative p-6">
                <span className="absolute -top-4 start-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white shadow-lift">
                  {i + 1}
                </span>
                <span className="mb-3 mt-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-white">
                  <s.icon size={20} />
                </span>
                <h3 className="text-base font-extrabold text-ink-900">{t(`landing.${s.key}.title`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{t(`landing.${s.key}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-800 px-8 py-14 text-center shadow-lift">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t('landing.ctaTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-ink-300">{t('landing.ctaBody')}</p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/builder"
              className="flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-extrabold text-ink-900 transition hover:-translate-y-0.5 hover:bg-ink-100"
            >
              {t('landing.openBuilder')} <ArrowRight size={17} className="rtl:rotate-180" />
            </Link>
            <Link
              href="/super-admin"
              className="rounded-2xl px-7 py-3.5 text-base font-bold text-ink-300 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white"
            >
              {t('landing.ownerDashboard')}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-ink-400 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {brand}. {t('landing.footerNote')}
          </span>
          <span className="flex items-center gap-4">
            <Link href="/builder" className="transition hover:text-brand-700">
              {t('nav.builder')}
            </Link>
            <Link href="/publish" className="transition hover:text-brand-700">
              {t('nav.publish')}
            </Link>
            <Link href="/super-admin" className="transition hover:text-brand-700">
              {t('nav.superAdmin')}
            </Link>
          </span>
        </div>
      </footer>

      <GabsterWidget script={settings ? settings.gabsterScript : ''} />
    </div>
  );
}
