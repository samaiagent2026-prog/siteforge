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

const FEATURES = [
  {
    icon: MousePointerClick,
    title: 'True drag & drop',
    body: 'Move any element anywhere on the canvas. Resize from all corners and edges with the mouse.',
  },
  {
    icon: Palette,
    title: 'Click-to-pick colours',
    body: 'A visual palette next to every element. No hex codes to remember, ever.',
  },
  {
    icon: Layers,
    title: 'Right-click actions',
    body: 'Duplicate, delete, bring forward or send backward from a sleek floating menu.',
  },
  {
    icon: Video,
    title: 'Background video',
    body: 'Drop a video onto any section for a cinematic hero, with an adjustable dark overlay.',
  },
  {
    icon: LayoutGrid,
    title: 'Product catalog',
    body: 'Add a responsive photo and price grid, then reposition it with the mouse.',
  },
  {
    icon: Globe,
    title: 'Multi-language & RTL',
    body: 'Enable unlimited languages. Arabic and other RTL scripts flip automatically.',
  },
  {
    icon: Upload,
    title: 'Drag files from your computer',
    body: 'Drop logos, photos and videos straight onto the canvas to place them instantly.',
  },
  {
    icon: Download,
    title: 'Download or publish',
    body: 'Export the finished site as a ZIP, or push it live to your host automatically.',
  },
];

const STEPS = [
  {
    icon: Palette,
    title: 'Design it',
    body: 'Drag, drop, resize and colour your pages. What you see is exactly what goes live.',
  },
  {
    icon: Server,
    title: 'Pick your host',
    body: 'Friendly one-click links to Hostinger, GoDaddy, Namecheap and Bluehost.',
  },
  {
    icon: Rocket,
    title: 'Publish in 3 fields',
    body: 'Paste your domain and FTP details. We upload everything for you in seconds.',
  },
];

export default function HomePage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
              <Sparkles size={16} />
            </span>
            <span className="text-base font-extrabold tracking-tight text-ink-900">
              {settings ? settings.brandName : 'SiteForge'}
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/super-admin"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink-500 transition hover:text-brand-700 sm:block"
            >
              Super Admin
            </Link>
            <Link
              href="/builder"
              className="flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-ink-800"
            >
              Open builder <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-ink-900" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-brand-100 ring-1 ring-white/20">
            <Rocket size={13} /> No code · No developers · Live in minutes
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            Build and publish a stunning website — entirely with your mouse
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-brand-100 sm:text-lg">
            Drag anything anywhere. Resize from every edge. Pick colours from a palette. Then publish to
            your own hosting with just three details. Built for everyone, at any age.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/builder"
              className="flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-extrabold text-brand-700 shadow-xl transition hover:bg-brand-50"
            >
              Start building free <ArrowRight size={17} />
            </Link>
            <Link
              href="/publish"
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-7 py-3.5 text-base font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20"
            >
              <Rocket size={17} /> Publish now
            </Link>
          </div>
          <p className="mt-4 text-xs font-medium text-brand-200">
            Publishing activation fee: {settings ? `${Number(settings.activationPrice).toFixed(0)} ${settings.currency}` : '50 USD'} ·
            test mode enabled
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-ink-500">
            A focused, clutter-free canvas with professional controls that appear exactly where you are
            working.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-ink-200 bg-white p-5 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
            >
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <f.icon size={20} />
              </span>
              <h3 className="text-sm font-extrabold text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-ink-200 bg-ink-50 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              From idea to live website in three steps
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-ink-500">
              No technical knowledge required. The publishing wizard walks you through it, one big button at a
              time.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-3xl border border-ink-200 bg-white p-6">
                <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white shadow-lg">
                  {i + 1}
                </span>
                <span className="mb-3 mt-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-white">
                  <s.icon size={20} />
                </span>
                <h3 className="text-base font-extrabold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-800 px-8 py-14 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to see your website?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-ink-300">
            Open the builder and start dragging. Save as you go, download the files, or publish straight to
            your host.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/builder"
              className="flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-extrabold text-ink-900 transition hover:bg-ink-100"
            >
              Open the builder <ArrowRight size={17} />
            </Link>
            <Link
              href="/super-admin"
              className="rounded-2xl px-7 py-3.5 text-base font-bold text-ink-300 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white"
            >
              Owner dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-ink-400 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {settings ? settings.brandName : 'SiteForge'}. Visual website builder
            &amp; publishing platform.
          </span>
          <span className="flex items-center gap-4">
            <Link href="/builder" className="hover:text-brand-700">
              Builder
            </Link>
            <Link href="/publish" className="hover:text-brand-700">
              Publish
            </Link>
            <Link href="/super-admin" className="hover:text-brand-700">
              Super Admin
            </Link>
          </span>
        </div>
      </footer>

      <GabsterWidget script={settings ? settings.gabsterScript : ''} />
    </div>
  );
}
