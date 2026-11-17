'use client';

import { useEffect, useState } from 'react';

let cached = null;
let inflight = null;

/**
 * Loads the owner's branding (name, logo, tagline) from the public settings
 * endpoint once per page load and shares it across every caller.
 */
export function useBrand() {
  const [settings, setSettings] = useState(cached);

  useEffect(() => {
    if (cached) return undefined;
    if (!inflight) {
      inflight = fetch('/api/settings')
        .then((r) => r.json())
        .then((d) => {
          cached = d.settings || null;
          return cached;
        })
        .catch(() => null);
    }
    let alive = true;
    inflight.then((s) => alive && setSettings(s));
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}

/** Invalidate the cache after the owner saves new branding. */
export function refreshBrand() {
  cached = null;
  inflight = null;
}

/**
 * Renders the uploaded brand logo when present, otherwise the default sparkle
 * mark. `size` controls the square mark; the logo keeps its aspect ratio.
 */
export default function BrandMark({
  settings,
  size = 32,
  radius = 'rounded-xl',
  className = '',
  fallback = null,
}) {
  const logo = settings && settings.brandLogo;
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={(settings && settings.brandName) || 'Logo'}
        style={{ height: size, maxWidth: size * 5 }}
        className={`${radius} object-contain ${className}`}
      />
    );
  }
  if (fallback) return fallback;
  return (
    <span
      style={{ height: size, width: size }}
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm ${radius} ${className}`}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"
          fill="currentColor"
        />
        <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" fill="currentColor" opacity=".7" />
      </svg>
    </span>
  );
}
