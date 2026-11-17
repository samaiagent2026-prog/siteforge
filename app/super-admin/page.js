'use client';

import { useCallback, useEffect, useState } from 'react';
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
} from 'lucide-react';

const TOKEN_KEY = 'siteforge.adminToken';

function Card({ title, description, icon: IconCmp, children }) {
  return (
    <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <IconCmp size={19} />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-ink-900">{title}</h2>
          <p className="text-xs text-ink-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-500">{label}</span>
        {hint ? <span className="text-[11px] text-ink-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none';

export default function SuperAdminPage() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [warning, setWarning] = useState('');

  const [settings, setSettings] = useState(null);
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

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
      if (data.usingDefaultPassword) {
        setWarning('You are using the default admin password. Set SUPER_ADMIN_PASSWORD in your environment.');
      }
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

  const refresh = () => loadData(token).catch(() => setStatus('Could not refresh'));

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
      setStatus('Saved successfully');
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

  /* ---------------- login screen ---------------- */

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ink-900 to-ink-800 p-4">
        <form onSubmit={login} className="w-full max-w-sm animate-scale-in rounded-3xl bg-white p-7 shadow-2xl">
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-white">
            <Lock size={22} />
          </span>
          <h1 className="text-xl font-extrabold text-ink-900">Super Admin</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to manage pricing, affiliates and sales.</p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className={`${inputClass} mt-5`}
          />

          {authError ? (
            <div className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
              {authError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={authBusy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-ink-800 disabled:opacity-60"
          >
            {authBusy ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
            Sign in
          </button>

          <p className="mt-4 rounded-xl bg-ink-50 px-3 py-2.5 text-[11px] leading-snug text-ink-500">
            Default password is <strong>admin123</strong>. Override it with the{' '}
            <code className="rounded bg-white px-1 py-0.5 text-[10px]">SUPER_ADMIN_PASSWORD</code> environment
            variable before going live.
          </p>

          <Link href="/" className="mt-4 block text-center text-xs font-semibold text-ink-400 hover:text-brand-700">
            Back to site
          </Link>
        </form>
      </div>
    );
  }

  /* ---------------- dashboard ---------------- */

  const stats = overview?.stats;

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white">
              <ShieldAlert size={18} />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-ink-900">Super Admin</div>
              <div className="text-[11px] text-ink-400">Platform control panel</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status ? (
              <span className="hidden items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
                <Check size={13} /> {status}
              </span>
            ) : null}
            <button
              type="button"
              onClick={refresh}
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-red-300 hover:text-red-600"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        {warning ? (
          <div className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            <ShieldAlert size={15} className="mt-0.5 shrink-0" /> {warning}
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Revenue',
              value: stats ? `${Number(stats.revenue).toFixed(2)} ${stats.currency}` : '—',
              icon: DollarSign,
              tone: 'text-emerald-700 bg-emerald-50',
            },
            {
              label: 'Paid activations',
              value: stats ? stats.paidOrders : '—',
              icon: CreditCard,
              tone: 'text-brand-700 bg-brand-50',
            },
            {
              label: 'Deployments',
              value: stats ? `${stats.successfulDeploys} / ${stats.deploys}` : '—',
              icon: Server,
              tone: 'text-indigo-700 bg-indigo-50',
            },
            {
              label: 'Websites',
              value: stats ? stats.sites : '—',
              icon: BarChart3,
              tone: 'text-amber-700 bg-amber-50',
            },
          ].map((card) => (
            <div key={card.label} className="rounded-3xl border border-ink-200 bg-white p-5 shadow-sm">
              <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${card.tone}`}>
                <card.icon size={19} />
              </span>
              <div className="text-2xl font-extrabold tabular-nums text-ink-900">{card.value}</div>
              <div className="text-xs font-semibold text-ink-500">{card.label}</div>
            </div>
          ))}
        </div>

        {!settings ? (
          <div className="py-16 text-center text-sm text-ink-400">
            <Loader2 className="mx-auto mb-3 animate-spin" size={20} /> Loading settings…
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pricing & payments */}
            <Card
              title="Activation price & payments"
              description="Change the publishing fee and connect a live payment gateway."
              icon={CreditCard}
            >
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Activation price">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={settings.activationPrice}
                      onChange={(e) => patch({ activationPrice: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Currency">
                    <select
                      value={settings.currency}
                      onChange={(e) => patch({ currency: e.target.value })}
                      className={inputClass}
                    >
                      {['USD', 'EUR', 'GBP', 'AED', 'SAR', 'EGP', 'CAD', 'AUD'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Gateway">
                    <select
                      value={settings.paymentProvider}
                      onChange={(e) => patch({ paymentProvider: e.target.value })}
                      className={inputClass}
                    >
                      <option value="mock">Test mode (no charge)</option>
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </Field>
                </div>

                {settings.paymentProvider === 'stripe' ? (
                  <div className="space-y-3 rounded-2xl bg-ink-50 p-4">
                    <Field label="Stripe secret key" hint="sk_live_… or sk_test_…">
                      <input
                        type="password"
                        value={settings.stripeSecretKey || ''}
                        onChange={(e) => patch({ stripeSecretKey: e.target.value })}
                        placeholder="sk_live_…"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Stripe publishable key">
                      <input
                        type="text"
                        value={settings.stripePublishableKey || ''}
                        onChange={(e) => patch({ stripePublishableKey: e.target.value })}
                        placeholder="pk_live_…"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                ) : null}

                {settings.paymentProvider === 'paypal' ? (
                  <div className="rounded-2xl bg-ink-50 p-4">
                    <Field label="PayPal client ID">
                      <input
                        type="text"
                        value={settings.paypalClientId || ''}
                        onChange={(e) => patch({ paypalClientId: e.target.value })}
                        placeholder="AXxxxxxxxxxxxxxxxx"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                ) : null}

                <Field label="Platform brand name">
                  <input
                    type="text"
                    value={settings.brandName || ''}
                    onChange={(e) => patch({ brandName: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
            </Card>

            {/* Gabster */}
            <Card
              title="Gabster assistant"
              description="Paste the Gabster embed snippet. It loads on the publish pages."
              icon={MessageSquare}
            >
              <textarea
                value={settings.gabsterScript || ''}
                onChange={(e) => patch({ gabsterScript: e.target.value })}
                rows={10}
                placeholder={'<script src="https://cdn.gabster.ai/widget.js" data-bot-id="…"></script>'}
                className={`${inputClass} font-mono text-xs`}
              />
              <p className="mt-2 text-[11px] text-ink-400">
                Leave empty to show the built-in helper card that links to gabster.ai.
              </p>
            </Card>

            {/* Affiliates */}
            <div className="lg:col-span-2">
              <Card
                title="Affiliate links manager"
                description="These buttons appear in the publish wizard. Replace them with your referral URLs."
                icon={Link2}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(settings.affiliates || {}).map(([key, provider]) => (
                    <div key={key} className="rounded-2xl border border-ink-200 p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                          style={{ background: provider.accent || '#2544f5' }}
                        >
                          {(provider.name || key).slice(0, 1)}
                        </span>
                        <input
                          type="text"
                          value={provider.name || ''}
                          onChange={(e) => patchAffiliate(key, { name: e.target.value })}
                          className="flex-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm font-bold focus:border-brand-500 focus:outline-none"
                        />
                        <input
                          type="color"
                          value={provider.accent || '#2544f5'}
                          onChange={(e) => patchAffiliate(key, { accent: e.target.value })}
                          className="h-9 w-11 cursor-pointer rounded-lg border border-ink-200 bg-white p-0.5"
                          aria-label={`${key} accent colour`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Field label="Affiliate URL">
                          <input
                            type="text"
                            value={provider.url || ''}
                            onChange={(e) => patchAffiliate(key, { url: e.target.value })}
                            className={`${inputClass} text-xs`}
                          />
                        </Field>
                        <Field label="Short note">
                          <input
                            type="text"
                            value={provider.note || ''}
                            onChange={(e) => patchAffiliate(key, { note: e.target.value })}
                            className={`${inputClass} text-xs`}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sales & deploys */}
            <div className="lg:col-span-2">
              <Card
                title="Sales & deployment log"
                description="Every activation payment and FTP publish attempt."
                icon={BarChart3}
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      Activations
                    </h3>
                    {overview?.orders?.length ? (
                      <div className="max-h-72 overflow-auto scroll-thin rounded-2xl border border-ink-200">
                        <table className="w-full text-left text-xs">
                          <thead className="sticky top-0 bg-ink-50 text-[10px] uppercase tracking-wide text-ink-500">
                            <tr>
                              <th className="px-3 py-2">Reference</th>
                              <th className="px-3 py-2">Amount</th>
                              <th className="px-3 py-2">Status</th>
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
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
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
                        No activations yet.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Deployments</h3>
                    {overview?.deploys?.length ? (
                      <div className="max-h-72 space-y-2 overflow-auto scroll-thin">
                        {overview.deploys.map((d) => (
                          <div key={d.id} className="rounded-2xl border border-ink-200 px-3 py-2.5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 text-xs font-bold text-ink-800">
                                <Rocket size={13} className={d.status === 'success' ? 'text-emerald-600' : 'text-red-500'} />
                                {d.domain}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  d.status === 'success'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {d.status}
                              </span>
                            </div>
                            <div className="mt-1 font-mono text-[10px] text-ink-400">
                              {d.user}@{d.host} · {new Date(d.createdAt).toLocaleString()}
                            </div>
                            {d.error ? (
                              <div className="mt-1 text-[11px] text-red-600">{d.error}</div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-dashed border-ink-200 px-4 py-8 text-center text-xs text-ink-400">
                        No deployments yet.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        <div className="sticky bottom-4 flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={busy || !settings}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-extrabold text-white shadow-xl transition hover:from-brand-700 hover:to-brand-600 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save all changes
          </button>
        </div>
      </main>
    </div>
  );
}
