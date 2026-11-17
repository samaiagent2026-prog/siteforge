'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Check,
  CreditCard,
  DollarSign,
  Link2,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  RefreshCw,
  Rocket,
  Save,
  Server,
  ShieldAlert,
  TriangleAlert,
} from 'lucide-react';
import { useUiLang } from '@/components/LanguageProvider';
import LanguageToggle from '@/components/LanguageToggle';

const TOKEN_KEY = 'siteforge.adminToken';

function StatCard({ icon: IconCmp, label, value, tone }) {
  return (
    <div className="surface surface-interactive p-5">
      <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <IconCmp size={19} />
      </span>
      <div className="text-2xl font-extrabold tabular-nums tracking-tight text-ink-900">{value}</div>
      <div className="mt-0.5 text-xs font-semibold text-ink-500">{label}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-500">{label}</span>
        {hint ? <span className="text-[11px] font-medium text-ink-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function SectionHeading({ icon: IconCmp, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <IconCmp size={19} />
      </span>
      <div>
        <h2 className="text-base font-extrabold tracking-tight text-ink-900">{title}</h2>
        <p className="text-xs text-ink-500">{description}</p>
      </div>
    </div>
  );
}

/** Renders text, promoting the SUPER_ADMIN_PASSWORD token to a code chip. */
function PasswordNote({ text }) {
  const parts = text.split('SUPER_ADMIN_PASSWORD');
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? (
            <code className="rounded bg-white px-1 py-0.5 text-[10px] ring-1 ring-ink-200">
              SUPER_ADMIN_PASSWORD
            </code>
          ) : null}
        </span>
      ))}
    </>
  );
}

const TABS = [
  { key: 'general', labelKey: 'admin.tabGeneral', icon: CreditCard },
  { key: 'affiliates', labelKey: 'admin.tabAffiliates', icon: Link2 },
  { key: 'gabster', labelKey: 'admin.tabGabster', icon: MessageSquare },
  { key: 'logs', labelKey: 'admin.tabLogs', icon: BarChart3 },
];

export default function SuperAdminPage() {
  const { t, lang } = useUiLang();

  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [warning, setWarning] = useState('');

  const [settings, setSettings] = useState(null);
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('general');

  const loadData = useCallback(async (authToken) => {
    const headers = { Authorization: `Bearer ${authToken}` };
    const [s, o] = await Promise.all([
      fetch('/api/admin/settings', { headers }).then((r) => r.json()),
      fetch('/api/admin/overview', { headers }).then((r) => r.json()),
    ]);
    if (s && s.settings) setSettings(s.settings);
    if (o && o.stats) setOverview(o);
  }, []);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (stored) {
      setToken(stored);
      loadData(stored).catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      });
    }
  }, [loadData]);

  const login = async (e) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      window.localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setPassword('');
      if (data.usingDefaultPassword) setWarning(t('admin.warnDefault'));
      await loadData(data.token);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setSettings(null);
    setOverview(null);
  };

  const refresh = () => loadData(token).catch(() => setStatus(t('admin.refreshFailed')));

  const save = async () => {
    setBusy(true);
    setStatus('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSettings(data.settings);
      setStatus(t('admin.savedStatus'));
      window.setTimeout(() => setStatus(''), 2500);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
    }
  };

  const patch = (p) => setSettings((s) => ({ ...s, ...p }));
  const patchAffiliate = (key, p) =>
    setSettings((s) => ({ ...s, affiliates: { ...s.affiliates, [key]: { ...s.affiliates[key], ...p } } }));

  const stats = overview?.stats;

  const statCards = useMemo(
    () => [
      {
        label: t('admin.statRevenue'),
        value: stats ? `${Number(stats.revenue).toFixed(2)} ${stats.currency}` : '—',
        icon: DollarSign,
        tone: 'bg-emerald-50 text-emerald-700',
      },
      {
        label: t('admin.statPaid'),
        value: stats ? stats.paidOrders : '—',
        icon: CreditCard,
        tone: 'bg-brand-50 text-brand-700',
      },
      {
        label: t('admin.statDeploys'),
        value: stats ? `${stats.successfulDeploys} / ${stats.deploys}` : '—',
        icon: Server,
        tone: 'bg-indigo-50 text-indigo-700',
      },
      {
        label: t('admin.statSites'),
        value: stats ? stats.sites : '—',
        icon: BarChart3,
        tone: 'bg-amber-50 text-amber-700',
      },
    ],
    [stats, t]
  );

  /* ---------------- login screen ---------------- */

  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 p-4">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />

        <div className="absolute end-5 top-5 z-10">
          <LanguageToggle tone="dark" />
        </div>

        <form
          onSubmit={login}
          className="relative w-full max-w-sm animate-slide-up rounded-3xl bg-white p-7 shadow-pop"
        >
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-white">
            <Lock size={22} />
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-ink-900">{t('admin.title')}</h1>
          <p className="mt-1 text-sm text-ink-500">{t('admin.subtitle')}</p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('admin.password')}
            autoFocus
            className="field mt-5"
          />

          {authError ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
              <TriangleAlert size={14} className="mt-0.5 shrink-0" />
              {authError}
            </div>
          ) : null}

          <button type="submit" disabled={authBusy} className="btn-primary mt-4 w-full py-3">
            {authBusy ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
            {t('admin.signIn')}
          </button>

          <p className="mt-4 rounded-xl bg-ink-50 px-3 py-2.5 text-[11px] leading-snug text-ink-500">
            <PasswordNote text={t('admin.defaultPasswordNote', { pw: 'admin123' })} />
          </p>

          <Link
            href="/"
            className="mt-4 block text-center text-xs font-semibold text-ink-400 transition hover:text-brand-700"
          >
            {t('nav.backToSite')}
          </Link>
        </form>
      </div>
    );
  }

  /* ---------------- dashboard ---------------- */

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white">
              <ShieldAlert size={18} />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight text-ink-900">{t('admin.title')}</div>
              <div className="text-[11px] text-ink-400">{t('admin.panelSubtitle')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status ? (
              <span className="hidden items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
                <Check size={13} /> {status}
              </span>
            ) : null}
            <LanguageToggle />
            <button type="button" onClick={refresh} className="btn-secondary px-3 py-1.5 text-xs">
              <RefreshCw size={13} /> {t('common.refresh')}
            </button>
            <button
              type="button"
              onClick={logout}
              className="btn-secondary px-3 py-1.5 text-xs hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={13} /> {t('common.signOut')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        {warning ? (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            <TriangleAlert size={15} className="mt-0.5 shrink-0" /> {warning}
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {!settings ? (
          <div className="py-16 text-center text-sm text-ink-400">
            <Loader2 className="mx-auto mb-3 animate-spin" size={20} /> {t('admin.loadingSettings')}
          </div>
        ) : (
          <div className="surface overflow-hidden">
            {/* Tabs */}
            <div
              className="flex gap-1 overflow-x-auto border-b border-ink-200 bg-ink-50/60 px-2 pt-2 scroll-thin"
              role="tablist"
            >
              {TABS.map((item) => {
                const active = tab === item.key;
                const IconCmp = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(item.key)}
                    className={`flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-bold transition ${
                      active
                        ? 'border-b-2 border-brand-600 bg-white text-brand-700'
                        : 'border-b-2 border-transparent text-ink-500 hover:bg-white/70 hover:text-ink-800'
                    }`}
                  >
                    <IconCmp size={15} />
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {/* ---------- GENERAL / PRICING ---------- */}
              {tab === 'general' ? (
                <div className="animate-fade-in space-y-6">
                  <SectionHeading
                    icon={CreditCard}
                    title={t('admin.pricingTitle')}
                    description={t('admin.pricingDesc')}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label={t('admin.activationPrice')}>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={settings.activationPrice}
                        onChange={(e) => patch({ activationPrice: e.target.value })}
                        className="field"
                      />
                    </Field>
                    <Field label={t('common.currency')}>
                      <select
                        value={settings.currency}
                        onChange={(e) => patch({ currency: e.target.value })}
                        className="field"
                      >
                        {['USD', 'EUR', 'GBP', 'AED', 'SAR', 'EGP', 'CAD', 'AUD'].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t('admin.gateway')}>
                      <select
                        value={settings.paymentProvider}
                        onChange={(e) => patch({ paymentProvider: e.target.value })}
                        className="field"
                      >
                        <option value="mock">{t('admin.gatewayMock')}</option>
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </Field>
                  </div>

                  {settings.paymentProvider === 'stripe' ? (
                    <div className="grid gap-4 rounded-2xl bg-ink-50 p-4 sm:grid-cols-2">
                      <Field label={t('admin.stripeSecret')} hint="sk_live_…">
                        <input
                          type="password"
                          value={settings.stripeSecretKey || ''}
                          onChange={(e) => patch({ stripeSecretKey: e.target.value })}
                          placeholder="sk_live_…"
                          className="field"
                        />
                      </Field>
                      <Field label={t('admin.stripePublishable')} hint="pk_live_…">
                        <input
                          type="text"
                          value={settings.stripePublishableKey || ''}
                          onChange={(e) => patch({ stripePublishableKey: e.target.value })}
                          placeholder="pk_live_…"
                          className="field"
                        />
                      </Field>
                    </div>
                  ) : null}

                  {settings.paymentProvider === 'paypal' ? (
                    <div className="rounded-2xl bg-ink-50 p-4">
                      <Field label={t('admin.paypalClient')}>
                        <input
                          type="text"
                          value={settings.paypalClientId || ''}
                          onChange={(e) => patch({ paypalClientId: e.target.value })}
                          placeholder="AXxxxxxxxxxxxxxxxx"
                          className="field"
                        />
                      </Field>
                    </div>
                  ) : null}

                  <div className="max-w-md">
                    <Field label={t('admin.brandName')}>
                      <input
                        type="text"
                        value={settings.brandName || ''}
                        onChange={(e) => patch({ brandName: e.target.value })}
                        className="field"
                      />
                    </Field>
                  </div>
                </div>
              ) : null}

              {/* ---------- AFFILIATES ---------- */}
              {tab === 'affiliates' ? (
                <div className="animate-fade-in space-y-6">
                  <SectionHeading
                    icon={Link2}
                    title={t('admin.affiliatesTitle')}
                    description={t('admin.affiliatesDesc')}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries(settings.affiliates || {}).map(([key, provider]) => (
                      <div
                        key={key}
                        className="rounded-2xl border border-ink-200 p-4 transition hover:border-brand-200"
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-sm"
                            style={{ background: provider.accent || '#2440f0' }}
                          >
                            {(provider.name || key).slice(0, 1)}
                          </span>
                          <input
                            type="text"
                            value={provider.name || ''}
                            onChange={(e) => patchAffiliate(key, { name: e.target.value })}
                            className="min-w-0 flex-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm font-bold focus:border-brand-500 focus:outline-none"
                          />
                          <input
                            type="color"
                            value={provider.accent || '#2440f0'}
                            onChange={(e) => patchAffiliate(key, { accent: e.target.value })}
                            className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-ink-200 bg-white p-0.5"
                            aria-label={t('admin.accentColour', { key })}
                          />
                        </div>
                        <div className="space-y-3">
                          <Field label={t('admin.affiliateUrl')}>
                            <input
                              type="text"
                              value={provider.url || ''}
                              onChange={(e) => patchAffiliate(key, { url: e.target.value })}
                              className="field text-xs"
                            />
                          </Field>
                          <Field label={t('admin.affiliateNote')}>
                            <input
                              type="text"
                              value={provider.note || ''}
                              onChange={(e) => patchAffiliate(key, { note: e.target.value })}
                              className="field text-xs"
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ---------- GABSTER ---------- */}
              {tab === 'gabster' ? (
                <div className="animate-fade-in space-y-6">
                  <SectionHeading
                    icon={MessageSquare}
                    title={t('admin.gabsterTitle')}
                    description={t('admin.gabsterDesc')}
                  />
                  <textarea
                    value={settings.gabsterScript || ''}
                    onChange={(e) => patch({ gabsterScript: e.target.value })}
                    rows={12}
                    dir="ltr"
                    placeholder={'<script src="https://cdn.gabster.ai/widget.js" data-bot-id="…"></script>'}
                    className="field resize-y font-mono text-xs"
                  />
                  <p className="text-[11px] text-ink-400">{t('admin.gabsterEmpty')}</p>
                </div>
              ) : null}

              {/* ---------- LOGS ---------- */}
              {tab === 'logs' ? (
                <div className="animate-fade-in space-y-6">
                  <SectionHeading
                    icon={BarChart3}
                    title={t('admin.logsTitle')}
                    description={t('admin.logsDesc')}
                  />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                        {t('admin.activations')}
                      </h3>
                      {overview?.orders?.length ? (
                        <div className="max-h-80 overflow-auto scroll-thin rounded-2xl border border-ink-200">
                          <table className="w-full text-start text-xs">
                            <thead className="sticky top-0 bg-ink-50 text-[10px] uppercase tracking-wide text-ink-500">
                              <tr>
                                <th className="px-3 py-2 text-start">{t('common.reference')}</th>
                                <th className="px-3 py-2 text-start">{t('common.amount')}</th>
                                <th className="px-3 py-2 text-start">{t('common.status')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {overview.orders.map((o) => (
                                <tr key={o.id} className="border-t border-ink-100">
                                  <td className="px-3 py-2 font-mono text-[11px] text-ink-700">{o.reference}</td>
                                  <td className="px-3 py-2 tabular-nums text-ink-700">
                                    {Number(o.amount).toFixed(2)} {o.currency}
                                  </td>
                                  <td className="px-3 py-2">
                                    <span
                                      className={`chip ${
                                        o.status === 'paid'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-amber-100 text-amber-700'
                                      }`}
                                    >
                                      {o.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="rounded-2xl border border-dashed border-ink-200 px-4 py-8 text-center text-xs text-ink-400">
                          {t('admin.noActivations')}
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                        {t('admin.deployments')}
                      </h3>
                      {overview?.deploys?.length ? (
                        <div className="max-h-80 space-y-2 overflow-auto scroll-thin">
                          {overview.deploys.map((d) => (
                            <div key={d.id} className="rounded-2xl border border-ink-200 px-3 py-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-2 truncate text-xs font-bold text-ink-800">
                                  <Rocket
                                    size={13}
                                    className={d.status === 'success' ? 'text-emerald-600' : 'text-red-500'}
                                  />
                                  {d.domain}
                                </span>
                                <span
                                  className={`chip ${
                                    d.status === 'success'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {d.status}
                                </span>
                              </div>
                              <div className="mt-1 font-mono text-[10px] text-ink-400">
                                {d.user}@{d.host} ·{' '}
                                {new Date(d.createdAt).toLocaleString(lang === 'ar' ? 'ar' : 'en')}
                              </div>
                              {d.error ? <div className="mt-1 text-[11px] text-red-600">{d.error}</div> : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-2xl border border-dashed border-ink-200 px-4 py-8 text-center text-xs text-ink-400">
                          {t('admin.noDeployments')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="sticky bottom-4 flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={busy || !settings}
            className="btn-primary px-6 py-3 shadow-lift"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {t('admin.saveAll')}
          </button>
        </div>
      </main>
    </div>
  );
}
