'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Cloud, Loader2, MousePointer2, Sparkles } from 'lucide-react';
import BuilderTopbar from '@/components/builder/BuilderTopbar';
import Canvas from '@/components/builder/Canvas';
import LanguagesModal from '@/components/builder/LanguagesModal';
import TemplatesModal from '@/components/builder/TemplatesModal';
import { createDefaultSite } from '@/lib/defaults';
import { getTemplate } from '@/lib/templates';
import { languageMeta } from '@/lib/compile';
import { useUiLang } from '@/components/LanguageProvider';

export default function BuilderPage() {
  const { t } = useUiLang();
  const [site, setSite] = useState(() => createDefaultSite());
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(0.9);
  const [fitScale, setFitScale] = useState(1);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeLang, setActiveLang] = useState('en');
  const viewportRef = useRef(null);

  const notify = useCallback((message, tone = 'ok') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  // Keep the translator in a ref so `save` stays stable across UI language
  // switches — otherwise changing language would trigger a needless autosave.
  const tRef = useRef(t);
  tRef.current = t;

  /* ------------ load / persist ------------ */

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams(window.location.search);
    const wantedTemplate = params.get('template');
    if (params.get('templates') === '1') setShowTemplates(true);

    fetch('/api/site?id=default')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        if (wantedTemplate) {
          const doc = getTemplate(wantedTemplate);
          if (doc) {
            setSite(doc);
            setActiveLang(doc.languages?.default || 'en');
            save(doc, true);
            window.history.replaceState({}, '', '/builder');
            return;
          }
        }
        if (data && data.site && Array.isArray(data.site.elements)) {
          setSite(data.site);
          setActiveLang((data.site.languages && data.site.languages.default) || 'en');
        }
      })
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, []);

  const save = useCallback(
    async (next, silent = true) => {
      setSaving(true);
      try {
        await fetch('/api/site', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ site: next }),
        });
        if (!silent) notify(tRef.current('builder.savedToast'));
      } catch {
        notify(tRef.current('builder.saveFailed'), 'error');
      } finally {
        setSaving(false);
      }
    },
    [notify]
  );

  // Debounced autosave so work is never lost.
  useEffect(() => {
    if (!loaded) return undefined;
    const t = window.setTimeout(() => save(site, true), 900);
    return () => window.clearTimeout(t);
  }, [site, loaded, save]);

  /* ------------ responsive fit ------------ */

  useEffect(() => {
    const compute = () => {
      const el = viewportRef.current;
      if (!el) return;
      const canvasWidth = site.canvas?.width || 1280;
      const available = el.clientWidth - 64;
      setFitScale(Math.min(1, available / canvasWidth));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [site.canvas]);

  /* ------------ element operations ------------ */

  const addElement = useCallback((el) => {
    setSite((s) => ({ ...s, elements: [...s.elements, el] }));
    setSelectedId(el.id);
    notify(t('builder.addedToast', { type: el.type }));
  }, [notify, t]);

  const updateElement = useCallback((id, patch) => {
    setSite((s) => ({
      ...s,
      elements: s.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
    }));
  }, []);

  const patchElement = useCallback((id, patch) => {
    setSite((s) => ({
      ...s,
      elements: s.elements.map((el) => {
        if (el.id !== id) return el;
        return {
          ...el,
          ...patch,
          style: patch.style ? { ...el.style, ...patch.style } : el.style,
          content: patch.content ? { ...el.content, ...patch.content } : el.content,
        };
      }),
    }));
  }, []);

  const deleteElement = useCallback(
    (id) => {
      setSite((s) => ({ ...s, elements: s.elements.filter((el) => el.id !== id) }));
      setSelectedId((cur) => (cur === id ? null : cur));
      notify(t('builder.deletedToast'));
    },
    [notify, t]
  );

  const duplicateElement = useCallback(
    (id) => {
      setSite((s) => {
        const src = s.elements.find((el) => el.id === id);
        if (!src) return s;
        const copy = {
          ...src,
          id: `${src.type}_${Math.random().toString(36).slice(2, 10)}`,
          x: src.x + 24,
          y: src.y + 24,
          z: (src.z || 1) + 1,
          content: { ...src.content },
          style: { ...src.style },
          i18n: { ...(src.i18n || {}) },
        };
        return { ...s, elements: [...s.elements, copy] };
      });
      notify(t('builder.duplicatedToast'));
    },
    [notify, t]
  );

  const reorder = useCallback((id, direction) => {
    setSite((s) => {
      const zs = s.elements.map((el) => el.z || 1);
      const maxZ = Math.max(...zs, 1);
      const minZ = Math.min(...zs, 0);
      return {
        ...s,
        elements: s.elements.map((el) => {
          if (el.id !== id) return el;
          const z = el.z || 1;
          return { ...el, z: direction === 'forward' ? Math.min(z + 1, maxZ + 1) : Math.max(z - 1, minZ - 1) };
        }),
      };
    });
  }, []);

  /* ------------ download ------------ */

  const download = useCallback(async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const { compileSite } = await import('@/lib/compile');
      const files = compileSite(site);
      const zip = new JSZip();
      Object.entries(files).forEach(([name, contents]) => zip.file(name, contents));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(site.name || 'website').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify(t('builder.downloadedToast'));
    } catch {
      notify(t('builder.downloadFailed'), 'error');
    }
  }, [site, notify, t]);

  const languages = useMemo(() => languageMeta(site), [site]);

  const applyTemplate = useCallback(
    (doc) => {
      setSite(doc);
      setSelectedId(null);
      setActiveLang(doc.languages?.default || 'en');
      setShowTemplates(false);
      notify(t('templates.loadedToast', { name: doc.name }));
      save(doc, true);
    },
    [notify, save, t]
  );

  useEffect(() => {
    if (!languages.some((l) => l.code === activeLang)) {
      setActiveLang(site.languages?.default || languages[0]?.code || 'en');
    }
  }, [languages, activeLang, site.languages]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ink-50">
      <BuilderTopbar
        site={site}
        onAdd={addElement}
        onOpenLanguages={() => setShowLanguages(true)}
        onOpenTemplates={() => setShowTemplates(true)}
        onDownload={download}
        onPublish={() => {
          save(site, true);
          window.location.href = '/publish';
        }}
        onSave={() => save(site, false)}
        saving={saving}
        zoom={zoom}
        setZoom={setZoom}
        activeLang={activeLang}
        setActiveLang={setActiveLang}
        languageOptions={languages}
      />

      <div className="flex min-h-0 flex-1">
        <div ref={viewportRef} className="flex min-w-0 flex-1">
          <Canvas
            site={site}
            lang={activeLang}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            updateElement={updateElement}
            patchElement={patchElement}
            addElement={addElement}
            deleteElement={deleteElement}
            duplicateElement={duplicateElement}
            reorder={reorder}
            zoom={zoom}
            fitScale={fitScale}
            languageOptions={languages}
            defaultLang={site.languages?.default || 'en'}
          />
        </div>
      </div>

      {/* Status bar */}
      <footer className="flex items-center justify-between border-t border-ink-200 bg-white/90 px-4 py-1.5 text-[11px] text-ink-500 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <MousePointer2 size={12} /> {t('builder.elementCount', { count: site.elements.length })}
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Sparkles size={12} /> {t('builder.statusHint')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {saving ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> {t('common.saving')}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Cloud size={12} /> {t('common.saved')}
            </span>
          )}
          <Link href="/" className="flex items-center gap-1.5 hover:text-brand-700">
            <ArrowLeft size={12} className="rtl:rotate-180" /> {t('nav.home')}
          </Link>
        </div>
      </footer>

      {showLanguages ? (
        <LanguagesModal
          site={site}
          onChange={(patch) => setSite((s) => ({ ...s, ...patch }))}
          onClose={() => setShowLanguages(false)}
        />
      ) : null}

      <TemplatesModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApply={applyTemplate}
        currentName={site.name}
      />

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div
            className={`toast-in flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-2xl ${
              toast.tone === 'error' ? 'bg-red-600' : 'bg-ink-900'
            }`}
          >
            <Check size={15} />
            {toast.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}
