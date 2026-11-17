'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Download,
  Globe,
  Image as ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  Minus,
  MousePointerClick,
  Phone,
  Plus,
  Rocket,
  Save,
  Sparkles,
  Square,
  Type,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { makeElement, CANVAS_WIDTH } from '@/lib/defaults';
import { ICON_NAMES } from '@/lib/icons';
import { Icon } from './ElementRenderer';
import { useUiLang } from '@/components/LanguageProvider';
import LanguageToggle from '@/components/LanguageToggle';
import BrandMark, { useBrand } from '@/components/Brand';

const CATALOG_ITEM = () => ({
  id: `item_${Math.random().toString(36).slice(2, 9)}`,
  title: 'New product',
  price: '$0',
  description: '',
  image: '',
});

function Menu({ label, icon: IconCmp, children, align = 'start' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="btn-secondary px-2.5 py-1.5 text-xs">
        <IconCmp size={14} />
        {label}
        <ChevronDown size={13} className="text-ink-400" />
      </button>
      {open ? (
        <div
          className={`absolute top-full z-40 mt-2 max-h-[70vh] w-64 animate-scale-in overflow-y-auto scroll-thin rounded-2xl border border-ink-200 bg-white p-2 shadow-pop ${
            align === 'end' ? 'end-0' : 'start-0'
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({ icon: IconCmp, label, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-start transition hover:bg-brand-50"
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
        <IconCmp size={15} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-800">{label}</span>
        {hint ? <span className="block text-[11px] leading-snug text-ink-500">{hint}</span> : null}
      </span>
    </button>
  );
}

export default function BuilderTopbar({
  site,
  onAdd,
  onOpenLanguages,
  onOpenTemplates,
  onDownload,
  onPublish,
  onSave,
  saving,
  zoom,
  setZoom,
  activeLang,
  setActiveLang,
  languageOptions,
}) {
  const { t } = useUiLang();
  const brandSettings = useBrand();
  const [showIcons, setShowIcons] = useState(false);
  const canvasWidth = site.canvas?.width || CANVAS_WIDTH;

  const bottomY = () => {
    const els = site.elements || [];
    return els.reduce((acc, el) => Math.max(acc, (el.y || 0) + (el.h || 0)), 0) + 40;
  };

  return (
    <header className="z-30 flex flex-wrap items-center gap-2 border-b border-ink-200 bg-white/95 px-3 py-2 shadow-card backdrop-blur">
      <div className="flex items-center gap-2 pe-2">
        <BrandMark settings={brandSettings} size={32} />
        <div className="leading-tight">
          <div className="max-w-[160px] truncate text-sm font-extrabold tracking-tight text-ink-900">
            {site.name || t('builder.websiteName')}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-ink-400">
            {t('common.brandTagline')}
          </div>
        </div>
      </div>

      <div className="mx-1 hidden h-6 w-px bg-ink-200 sm:block" />

      {/* Templates — the fastest way for a new client to get a good-looking site */}
      <button
        type="button"
        onClick={onOpenTemplates}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:from-brand-700 hover:to-brand-600"
      >
        <LayoutTemplate size={14} /> {t('builder.templates')}
      </button>

      {/* Add element */}
      <Menu label={t('builder.add')} icon={Plus}>
        <MenuItem
          icon={Type}
          label={t('builder.addText')}
          hint={t('builder.addTextHint')}
          onClick={() =>
            onAdd(
              makeElement('text', {
                x: 120,
                y: bottomY(),
                w: 520,
                h: 70,
                content: { text: t('builder.newText') },
                style: { fontSize: 28, fontWeight: 700 },
              })
            )
          }
        />
        <MenuItem
          icon={Square}
          label={t('builder.addButton')}
          hint={t('builder.addButtonHint')}
          onClick={() =>
            onAdd(
              makeElement('button', {
                x: 120,
                y: bottomY(),
                w: 220,
                h: 58,
                content: { text: t('builder.newButton'), href: '#' },
                style: { bg: '#2440f0', color: '#ffffff', radius: 12, align: 'center', fontWeight: 700 },
              })
            )
          }
        />
        <MenuItem
          icon={ImageIcon}
          label={t('builder.addImage')}
          hint={t('builder.addImageHint')}
          onClick={() =>
            onAdd(makeElement('image', { x: 120, y: bottomY(), w: 320, h: 240, style: { radius: 12 } }))
          }
        />
        <MenuItem
          icon={Sparkles}
          label={t('builder.addIcon')}
          hint={t('builder.addIconHint')}
          onClick={() =>
            onAdd(
              makeElement('icon', {
                x: 120,
                y: bottomY(),
                w: 48,
                h: 48,
                content: { icon: 'Star' },
                style: { color: '#2440f0' },
              })
            )
          }
        />
        <MenuItem
          icon={Phone}
          label={t('builder.addPhone')}
          hint={t('builder.addPhoneHint')}
          onClick={() =>
            onAdd(
              makeElement('phone', {
                x: canvasWidth - 360,
                y: 44,
                w: 300,
                h: 40,
                content: { text: '+1 (555) 010-2030', href: 'tel:+15550102030' },
                style: { fontSize: 17, fontWeight: 600, align: 'right' },
              })
            )
          }
        />
        <MenuItem
          icon={Sparkles}
          label={t('builder.addLogo')}
          hint={t('builder.addLogoHint')}
          onClick={() =>
            onAdd(
              makeElement('logo', {
                x: 64,
                y: 36,
                w: 160,
                h: 52,
                content: { text: t('builder.yourBrand') },
                style: { fontSize: 24, fontWeight: 800 },
              })
            )
          }
        />
        <MenuItem
          icon={LayoutGrid}
          label={t('builder.addCatalog')}
          hint={t('builder.addCatalogHint')}
          onClick={() =>
            onAdd(
              makeElement('catalog', {
                x: 64,
                y: bottomY(),
                w: canvasWidth - 128,
                h: 420,
                content: { columns: 3, items: [CATALOG_ITEM(), CATALOG_ITEM(), CATALOG_ITEM()] },
              })
            )
          }
        />
        <MenuItem
          icon={Square}
          label={t('builder.addSection')}
          hint={t('builder.addSectionHint')}
          onClick={() =>
            onAdd(
              makeElement('section', {
                x: 0,
                y: bottomY(),
                w: canvasWidth,
                h: 460,
                z: 0,
                content: { bg: { type: 'gradient', from: '#3d5fff', to: '#1c31d6', angle: 135 } },
              })
            )
          }
        />
      </Menu>

      {/* Icons menu */}
      <Menu label={t('builder.icons')} icon={Sparkles}>
        <div className="grid grid-cols-7 gap-1 p-1">
          {ICON_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() =>
                onAdd(
                  makeElement('icon', {
                    x: 120,
                    y: bottomY(),
                    w: 48,
                    h: 48,
                    content: { icon: name },
                    style: { color: '#2440f0' },
                  })
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-brand-50"
            >
              <Icon name={name} size={16} color="#3f485d" />
            </button>
          ))}
        </div>
      </Menu>

      <button type="button" onClick={onOpenLanguages} className="btn-secondary px-2.5 py-1.5 text-xs">
        <Globe size={14} /> {t('builder.languages')}
        <span className="rounded-full bg-brand-100 px-1.5 text-[10px] font-bold text-brand-700">
          {(languageOptions || []).length}
        </span>
      </button>

      {/* Live content-language preview switch */}
      {(languageOptions || []).length > 1 ? (
        <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-ink-50 p-0.5">
          {(languageOptions || []).map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveLang(l.code)}
              title={`${l.label}`}
              className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${
                activeLang === l.code ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mx-1 hidden h-6 w-px bg-ink-200 sm:block" />

      {/* Zoom */}
      <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-1 py-0.5">
        <button
          type="button"
          onClick={() => setZoom(Math.max(0.25, Number((zoom - 0.1).toFixed(2))))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-600 transition hover:bg-ink-100"
          aria-label={t('builder.zoomOut')}
        >
          <ZoomOut size={14} />
        </button>
        <span className="w-11 text-center text-[11px] font-bold tabular-nums text-ink-600">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom(Math.min(1.6, Number((zoom + 0.1).toFixed(2))))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-600 transition hover:bg-ink-100"
          aria-label={t('builder.zoomIn')}
        >
          <ZoomIn size={14} />
        </button>
      </div>

      <div className="ms-auto flex flex-wrap items-center gap-2">
        <span className="hidden items-center gap-1.5 text-[11px] font-medium text-ink-400 xl:flex">
          <MousePointerClick size={13} /> {t('builder.hint')}
        </span>
        <LanguageToggle />
        <button type="button" onClick={onSave} className="btn-secondary px-3 py-1.5 text-xs">
          <Save size={14} /> {saving ? t('common.saving') : t('common.save')}
        </button>
        <button type="button" onClick={onDownload} className="btn-secondary px-3 py-1.5 text-xs">
          <Download size={14} /> {t('common.download')}
        </button>
        <button type="button" onClick={onPublish} className="btn-primary px-3.5 py-1.5 text-xs">
          <Rocket size={14} /> {t('common.publish')}
        </button>
      </div>
    </header>
  );
}
