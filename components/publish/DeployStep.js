'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Link2,
  Loader2,
  Rocket,
  Server,
  User,
} from 'lucide-react';
import { useUiLang } from '@/components/LanguageProvider';

function Field({ icon: IconCmp, label, hint, children }) {
  const { t } = useUiLang();
  const [showHint, setShowHint] = useState(false);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-bold text-ink-800">
          <IconCmp size={15} className="text-ink-400" />
          {label}
        </label>
        <button
          type="button"
          onMouseEnter={() => setShowHint(true)}
          onMouseLeave={() => setShowHint(false)}
          onClick={() => setShowHint((v) => !v)}
          className="relative flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-brand-600 hover:bg-brand-50"
        >
          <HelpCircle size={12} /> {t('deploy.whereIsThis')}
          {showHint ? (
            <span className="absolute end-0 top-full z-20 mt-1 w-60 rounded-xl bg-ink-900 px-3 py-2 text-start text-[11px] font-medium leading-snug text-white shadow-xl">
              {hint}
            </span>
          ) : null}
        </button>
      </div>
      {children}
    </div>
  );
}

export default function DeployStep({ reference, onBack }) {
  const { t } = useUiLang();
  const [form, setForm] = useState({ domain: '', host: '', user: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const deploy = async () => {
    setBusy(true);
    setError('');
    setLog([]);
    setResult(null);
    try {
      const res = await fetch('/api/deploy-ftp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, reference, siteId: 'default', remoteDir: 'public_html' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLog(Array.isArray(data.log) ? data.log : []);
        throw new Error(data.hint ? `${data.error} ${data.hint}` : data.error || 'Publishing failed');
      }
      setLog(Array.isArray(data.log) ? data.log : []);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-ink-200 px-3.5 py-3 text-sm focus:border-brand-500 focus:outline-none';

  if (result) {
    return (
      <div className="animate-fade-in text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
          <Check size={32} />
        </span>
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{t('deploy.liveTitle')}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ink-500">
          {t('deploy.liveBody', { domain: form.domain }).split(form.domain).flatMap((part, i, arr) => {
            const nodes = [part];
            if (i < arr.length - 1) nodes.push(<strong key={i}>{form.domain}</strong>);
            return nodes;
          })}
        </p>

        <a
          href={result.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mx-auto mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:from-brand-700 hover:to-brand-600"
        >
          {t('deploy.openSite', { domain: form.domain })} <ExternalLink size={17} />
        </a>

        <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-ink-200 bg-white p-4 text-start">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">{t('deploy.uploadLog')}</h3>
          <pre className="max-h-52 overflow-auto scroll-thin rounded-xl bg-ink-900 p-3 text-[11px] leading-relaxed text-emerald-300">
            {log.join('\n')}
          </pre>
        </div>

        <button
          type="button"
          onClick={() => {
            setResult(null);
            setForm({ domain: '', host: '', user: '', password: '' });
          }}
          className="mt-4 text-xs font-semibold text-ink-500 hover:text-brand-700"
        >
          {t('deploy.publishAnother')}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Rocket size={24} />
        </span>
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{t('deploy.title')}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ink-500">{t('deploy.subtitle')}</p>
      </div>

      <div className="mx-auto max-w-xl space-y-5 rounded-3xl border border-ink-200 bg-white p-6 shadow-sm">
        <Field
          icon={Link2}
          label={t('deploy.domain')}
          hint={t('deploy.domainHint')}
        >
          <input
            type="text"
            value={form.domain}
            onChange={set('domain')}
            placeholder="mybusiness.com"
            className={inputClass}
          />
        </Field>

        <Field
          icon={Server}
          label={t('deploy.host')}
          hint={t('deploy.hostHint')}
        >
          <input
            type="text"
            value={form.host}
            onChange={set('host')}
            placeholder="ftp.mybusiness.com"
            className={inputClass}
          />
        </Field>

        <Field
          icon={User}
          label={t('deploy.creds')}
          hint={t('deploy.credsHint')}
        >
          <div className="space-y-2">
            <input
              type="text"
              value={form.user}
              onChange={set('user')}
              placeholder={t('deploy.username')}
              className={inputClass}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder={t('deploy.password')}
                className={`${inputClass} pe-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label={showPassword ? t('deploy.hidePassword') : t('deploy.showPassword')}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </Field>

        <div className="flex items-start gap-2 rounded-2xl bg-ink-50 px-4 py-3 text-xs text-ink-600">
          <KeyRound size={15} className="mt-0.5 shrink-0 text-ink-400" />
          <span>{t('deploy.privacy')}</span>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {log.length && !result ? (
          <pre className="max-h-40 overflow-auto scroll-thin rounded-xl bg-ink-900 p-3 text-[11px] text-ink-200">
            {log.join('\n')}
          </pre>
        ) : null}

        <button
          type="button"
          onClick={deploy}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-4 text-base font-extrabold text-white shadow-lg transition hover:from-brand-700 hover:to-brand-600 disabled:opacity-60"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
          {busy ? t('deploy.uploading') : t('deploy.launch')}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-xl px-4 py-2 text-xs font-semibold text-ink-500 hover:bg-ink-50"
        >
          {t('deploy.backToHosting')}
        </button>
      </div>
    </div>
  );
}
