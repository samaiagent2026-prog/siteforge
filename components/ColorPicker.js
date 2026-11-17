'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useUiLang } from '@/components/LanguageProvider';

export const PALETTE = [
  '#000000', '#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff',
  '#7f1d1d', '#dc2626', '#f97316', '#f59e0b', '#facc15', '#a3e635', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#2544f5', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#ec4899', '#f43f5e', '#78350f', '#b45309', '#065f46', '#1e3a8a', '#4c1d95',
];

export const RECENT_KEY = 'siteforge.recentColors';

function loadRecent() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

function pushRecent(color) {
  if (typeof window === 'undefined') return [];
  try {
    const next = [color, ...loadRecent().filter((c) => c.toLowerCase() !== color.toLowerCase())].slice(0, 8);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

/** Small square colour chip that shows transparency with a checkerboard. */
export function ColorSwatch({ color, size = 22, className = '' }) {
  const transparent = !color || color === 'transparent';
  return (
    <span
      className={`inline-block shrink-0 rounded-md border border-ink-200 ${transparent ? 'checker' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        background: transparent ? undefined : color,
      }}
    />
  );
}

/**
 * Visual palette picker. Users click swatches; hex typing is optional, never required.
 */
export default function ColorPicker({
  label,
  value,
  onChange,
  allowTransparent = false,
  align = 'left',
  buttonClassName = '',
}) {
  const { t } = useUiLang();
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [place, setPlace] = useState({ h: align, v: 'down' });
  const rootRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  // Keep the popup fully on screen when the toolbar sits near a viewport edge.
  useEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const width = 268;
    const height = popRef.current?.offsetHeight || 340;
    const roomRight = window.innerWidth - rect.right;
    const roomLeft = rect.left;
    let h = align;
    if (roomRight < width && roomLeft > roomRight) h = 'right';
    else if (roomRight < width) h = 'left';
    const v = window.innerHeight - rect.bottom < height && rect.top > height ? 'up' : 'down';
    setPlace({ h, v });
  }, [open, align]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const commit = (color) => {
    onChange(color);
    setRecent(pushRecent(color));
  };

  const current = value || (allowTransparent ? 'transparent' : '#000000');
  const rgb = hexToRgb(current) || { r: 37, g: 68, b: 245 };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-400 hover:bg-brand-50 ${buttonClassName}`}
      >
        <ColorSwatch color={current} />
        <span className="tabular-nums">{current === 'transparent' ? t('common.none') : current}</span>
      </button>

      {open ? (
        <div
          ref={popRef}
          className={`absolute z-50 w-[268px] rounded-2xl border border-ink-200 bg-white p-3 shadow-pop animate-scale-in ${
            place.v === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${place.h === 'right' ? 'right-0' : 'left-0'}`}
        >
          {label ? (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label={t('picker.closePicker')}
              >
                <X size={14} />
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-8 gap-1.5">
            {PALETTE.map((color) => {
              const active = String(current).toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  title={color}
                  aria-label={color}
                  onClick={() => commit(color)}
                  className={`relative h-6 w-6 rounded-md border transition hover:scale-110 ${
                    active ? 'border-brand-600 ring-2 ring-brand-300' : 'border-ink-200'
                  }`}
                  style={{ background: color }}
                >
                  {active ? (
                    <Check
                      size={12}
                      className="absolute inset-0 m-auto"
                      color={['#ffffff', '#f3f4f6', '#facc15', '#a3e635'].includes(color) ? '#111827' : '#ffffff'}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          {allowTransparent ? (
            <button
              type="button"
              onClick={() => commit('transparent')}
              className={`mt-2 flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-medium transition hover:bg-ink-50 ${
                current === 'transparent' ? 'border-brand-500 text-brand-700' : 'border-ink-200 text-ink-600'
              }`}
            >
              <span className="checker h-4 w-4 rounded border border-ink-200" />
              {t('picker.transparent')}
            </button>
          ) : null}

          {recent.length ? (
            <div className="mt-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{t('picker.recent')}</div>
              <div className="flex flex-wrap gap-1.5">
                {recent.map((color) => (
                  <button
                    key={`r-${color}`}
                    type="button"
                    title={color}
                    onClick={() => commit(color)}
                    className="h-6 w-6 rounded-md border border-ink-200 transition hover:scale-110"
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-3 border-t border-ink-100 pt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                {t('picker.fineTune')}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={Math.round(
                (() => {
                  const { r, g, b } = rgb;
                  const max = Math.max(r, g, b);
                  const min = Math.min(r, g, b);
                  if (max === min) return 0;
                  const d = max - min;
                  let h;
                  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
                  else if (max === g) h = ((b - r) / d + 2) * 60;
                  else h = ((r - g) / d + 4) * 60;
                  return h;
                })()
              )}
              onChange={(e) => {
                const h = Number(e.target.value);
                const { r, g, b } = rgb;
                const max = Math.max(r, g, b) / 255;
                const min = Math.min(r, g, b) / 255;
                const l = (max + min) / 2;
                const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
                const c = (1 - Math.abs(2 * l - 1)) * s;
                const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
                const m = l - c / 2;
                let rr = 0;
                let gg = 0;
                let bb = 0;
                if (h < 60) [rr, gg, bb] = [c, x, 0];
                else if (h < 120) [rr, gg, bb] = [x, c, 0];
                else if (h < 180) [rr, gg, bb] = [0, c, x];
                else if (h < 240) [rr, gg, bb] = [0, x, c];
                else if (h < 300) [rr, gg, bb] = [x, 0, c];
                else [rr, gg, bb] = [c, 0, x];
                commit(rgbToHex((rr + m) * 255, (gg + m) * 255, (bb + m) * 255));
              }}
              aria-label="Hue"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                type="color"
                value={/^#[0-9a-f]{6}$/i.test(current) ? current : '#2544f5'}
                onChange={(e) => commit(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-ink-200 bg-white p-0.5"
                aria-label={t('picker.customColour')}
              />
              <input
                type="text"
                value={current === 'transparent' ? '' : current}
                placeholder="#2544f5"
                onChange={(e) => {
                  const v = e.target.value.trim();
                  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) commit(v);
                }}
                className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
