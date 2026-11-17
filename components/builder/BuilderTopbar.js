'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Download,
  Globe,
  Image as ImageIcon,
  LayoutGrid,
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

const CATALOG_ITEM = () => ({
  id: `item_${Math.random().toString(36).slice(2, 9)}`,
  title: 'New product',
  price: '$0',
  description: '',
  image: '',
});

function Menu({ label, icon: IconCmp, children, align = 'left' }) {
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-700"
      >
        <IconCmp size={14} />
        {label}
        <ChevronDown size={13} className="text-ink-400" />
      </button>
      {open ? (
        <div
          className={`absolute top-full z-40 mt-2 max-h-[70vh] w-64 animate-scale-in overflow-y-auto scroll-thin rounded-2xl border border-ink-200 bg-white p-2 shadow-2xl ${
            align === 'right' ? 'right-0' : 'left-0'
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
      className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-brand-50"
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
  const [showIcons, setShowIcons] = useState(false);
  const canvasWidth = site.canvas?.width || CANVAS_WIDTH;

  const bottomY = () => {
    const els = site.elements || [];
    return els.reduce((acc, el) => Math.max(acc, (el.y || 0) + (el.h || 0)), 0) + 40;
  };

  return (
    <header className="z-30 flex flex-wrap items-center gap-2 border-b border-ink-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2 pr-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
          <Sparkles size={16} />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-extrabold tracking-tight text-ink-900">
            {site.name || 'My Website'}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-ink-400">Visual builder</div>
        </div>
      </div>

      <div className="mx-1 h-6 w-px bg-ink-200" />

      {/* Add element */}
      <Menu label="Add" icon={Plus}>
        <MenuItem
          icon={Type}
          label="Text"
          hint="Headings, paragraphs, any copy"
          onClick={() =>
            onAdd(
              makeElement('text', {
                x: 120,
                y: bottomY(),
                w: 520,
                h: 70,
                content: { text: 'New text block' },
                style: { fontSize: 28, fontWeight: 700 },
              })
            )
          }
        />
        <MenuItem
          icon={Square}
          label="Button"
          hint="Call to action with a link"
          onClick={() =>
            onAdd(
              makeElement('button', {
                x: 120,
                y: bottomY(),
                w: 220,
                h: 58,
                content: { text: 'Click me', href: '#' },
                style: { bg: '#2544f5', color: '#ffffff', radius: 12, align: 'center', fontWeight: 700 },
              })
            )
          }
        />
        <MenuItem
          icon={ImageIcon}
          label="Image"
          hint="Upload or paste an image URL"
          onClick={() =>
            onAdd(makeElement('image', { x: 120, y: bottomY(), w: 320, h: 240, style: { radius: 12 } }))
          }
        />
        <MenuItem
          icon={Sparkles}
          label="Icon"
          hint="Decorative icons for features"
          onClick={() =>
            onAdd(
              makeElement('icon', {
                x: 120,
                y: bottomY(),
                w: 48,
                h: 48,
                content: { icon: 'Star' },
                style: { color: '#2544f5' },
              })
            )
          }
        />
        <MenuItem
          icon={Phone}
          label="Phone number"
          hint="Click-to-call in the header"
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
          label="Logo"
          hint="Text or image brand mark"
          onClick={() =>
            onAdd(
              makeElement('logo', {
                x: 64,
                y: 36,
                w: 160,
                h: 52,
                content: { text: 'Your Brand' },
                style: { fontSize: 24, fontWeight: 800 },
              })
            )
          }
        />
        <MenuItem
          icon={LayoutGrid}
          label="Product catalog"
          hint="Responsive photo & price grid"
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
          label="Section (background band)"
          hint="Colour, gradient or video background"
          onClick={() =>
            onAdd(
              makeElement('section', {
                x: 0,
                y: bottomY(),
                w: canvasWidth,
                h: 460,
                z: 0,
                content: { bg: { type: 'gradient', from: '#3b66ff', to: '#1c33e1', angle: 135 } },
              })
            )
          }
        />
      </Menu>

      {/* Icons menu */}
      <Menu label="Icons" icon={Sparkles}>
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
                    style: { color: '#2544f5' },
                  })
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-brand-50"
            >
              <Icon name={name} size={16} color="#42495e" />
            </button>
          ))}
        </div>
      </Menu>

      <button
        type="button"
        onClick={onOpenLanguages}
        className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-700"
      >
        <Globe size={14} /> Languages
        <span className="rounded-full bg-brand-100 px-1.5 text-[10px] font-bold text-brand-700">
          {(languageOptions || []).length}
        </span>
      </button>

      {/* Live language preview switch */}
      {(languageOptions || []).length > 1 ? (
        <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-ink-50 p-0.5">
          {(languageOptions || []).map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveLang(l.code)}
              title={`Preview ${l.label}`}
              className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${
                activeLang === l.code ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mx-1 h-6 w-px bg-ink-200" />

      {/* Zoom */}
      <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-1 py-0.5">
        <button
          type="button"
          onClick={() => setZoom(Math.max(0.25, Number((zoom - 0.1).toFixed(2))))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-600 hover:bg-ink-100"
          aria-label="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="w-11 text-center text-[11px] font-bold tabular-nums text-ink-600">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom(Math.min(1.6, Number((zoom + 0.1).toFixed(2))))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-600 hover:bg-ink-100"
          aria-label="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 text-[11px] font-medium text-ink-400 lg:flex">
          <MousePointerClick size={13} /> Drag, resize, right-click any element
        </span>
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-700"
        >
          <Save size={14} /> {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-700"
        >
          <Download size={14} /> Download
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:from-brand-700 hover:to-brand-600"
        >
          <Rocket size={14} /> Publish Now
        </button>
      </div>
    </header>
  );
}
