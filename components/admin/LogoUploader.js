'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { useUiLang } from '@/components/LanguageProvider';
import BrandMark from '@/components/Brand';

const MAX_BYTES = 512 * 1024;

/**
 * Logo picker for the owner dashboard. Accepts a click-to-browse or a file
 * dropped straight onto the drop zone, then stores the image as a data URL so
 * it needs no separate file hosting.
 */
export default function LogoUploader({ value, name, tagline, onChange }) {
  const { t } = useUiLang();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const readFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('admin.logoBadType'));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t('admin.logoTooBig'));
      return;
    }
    setError('');
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result || ''));
      setBusy(false);
    };
    reader.onerror = () => {
      setError(t('admin.logoReadError'));
      setBusy(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current && inputRef.current.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current && inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          readFile(e.dataTransfer.files && e.dataTransfer.files[0]);
        }}
        className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition ${
          dragging ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-ink-50 hover:border-brand-300'
        }`}
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-card">
          {busy ? (
            <Loader2 size={20} className="animate-spin text-ink-400" />
          ) : (
            <BrandMark settings={{ brandLogo: value, brandName: name }} size={44} radius="rounded-lg" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-bold text-ink-800">
            <UploadCloud size={15} /> {t('admin.logoDropTitle')}
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-ink-500">{t('admin.logoDropHint')}</p>
          {tagline ? <p className="mt-1 truncate text-[11px] font-semibold text-ink-400">{tagline}</p> : null}
        </div>
        <span className="hidden shrink-0 rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-600 sm:block">
          {t('admin.logoBrowse')}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
        className="hidden"
        onChange={(e) => readFile(e.target.files && e.target.files[0])}
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        {error ? (
          <span className="text-[11px] font-semibold text-red-600">{error}</span>
        ) : (
          <span className="text-[11px] text-ink-400">{t('admin.logoFormats')}</span>
        )}
        {value ? (
          <button
            type="button"
            onClick={() => {
              setError('');
              onChange('');
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-ink-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={12} /> {t('admin.logoRemove')}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-ink-300">
            <ImagePlus size={12} /> {t('admin.logoNone')}
          </span>
        )}
      </div>
    </div>
  );
}
