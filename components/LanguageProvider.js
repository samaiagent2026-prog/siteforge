'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dirForLang, isSupportedUiLang, translate } from '@/lib/i18n';

const STORAGE_KEY = 'siteforge.uiLang';

const LanguageContext = createContext(null);

export function LanguageProvider({ children, initialLang = 'en' }) {
  const [lang, setLangState] = useState(initialLang);

  // Restore the saved choice once on mount (avoids a server/client mismatch).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && isSupportedUiLang(saved)) setLangState(saved);
    } catch {
      /* storage unavailable — keep the default */
    }
  }, []);

  const dir = dirForLang(lang);

  // Keep <html> in sync so the whole document flips for RTL.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((next) => {
    if (!isSupportedUiLang(next)) return;
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLang = useCallback(() => setLang(lang === 'ar' ? 'en' : 'ar'), [lang, setLang]);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  const value = useMemo(() => ({ lang, dir, setLang, toggleLang, t }), [lang, dir, setLang, toggleLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useUiLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useUiLang must be used inside <LanguageProvider>');
  return ctx;
}
