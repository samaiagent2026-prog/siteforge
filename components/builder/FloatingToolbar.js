'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Copy,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Minus,
  Plus,
  Trash2,
  Type,
  Upload,
  Video,
  X,
} from 'lucide-react';
import ColorPicker from '@/components/ColorPicker';
import { FONTS, uid } from '@/lib/defaults';
import { ICON_NAMES } from '@/lib/icons';
import { Icon } from './ElementRenderer';

const TEXT_TYPES = ['text', 'phone', 'logo'];
const IMAGE_TYPES = ['image', 'logo'];
const SECTION_TYPES = ['section'];

function Btn({ active, onClick, title, children, danger }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-ink-600 transition ${
        active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-transparent hover:bg-ink-100'
      } ${danger ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
    >
      {children}
    </button>
  );
}

function Group({ children, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-0.5 rounded-xl border border-ink-200 bg-white p-1 shadow-sm">
        {children}
      </div>
      {label ? <span className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{label}</span> : null}
    </div>
  );
}

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 hover:bg-ink-50"
      >
        {title}
        <span className="text-ink-400">{open ? '−' : '+'}</span>
      </button>
      {open ? <div className="space-y-3 px-4 pb-4 pt-1">{children}</div> : null}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-ink-500">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

/** Pick a local file and hand back a data URL so assets travel with the export. */
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export default function FloatingToolbar({
  el,
  anchor,
  onChange,
  onPatch,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onClose,
  onToggleHidden,
  languageOptions = [],
  defaultLang = 'en',
}) {
  const [tab, setTab] = useState(el.type === 'catalog' ? 'catalog' : el.type === 'icon' ? 'icon' : 'text');
  const ref = useRef(null);
  const [showIcons, setShowIcons] = useState(false);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Measure the real toolbar size so it never spills off screen, then clamp it.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const width = 340;
    const clamp = () => {
      const height = node.offsetHeight;
      const maxLeft = Math.max(12, window.innerWidth - width - 12);
      const maxTop = Math.max(12, window.innerHeight - height - 12);
      setPos({
        left: Math.min(Math.max(12, anchor.x), maxLeft),
        top: Math.min(Math.max(12, anchor.y), maxTop),
        width,
      });
    };
    clamp();
    const ro = new ResizeObserver(clamp);
    ro.observe(node);
    window.addEventListener('resize', clamp);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', clamp);
    };
  }, [anchor.x, anchor.y, el.id]);

  const style = el.style || {};
  const content = el.content || {};
  const isText = TEXT_TYPES.includes(el.type);
  const isImage = IMAGE_TYPES.includes(el.type);
  const isSection = SECTION_TYPES.includes(el.type);
  const isCatalog = el.type === 'catalog';
  const isIcon = el.type === 'icon';

  const patchStyle = (patch) => onPatch({ style: { ...style, ...patch } });
  const patchContent = (patch) => onPatch({ content: { ...content, ...patch } });

  const left = pos ? pos.left : Math.max(12, anchor.x);
  const top = pos ? pos.top : Math.max(12, anchor.y);
  const width = pos ? pos.width : 340;

  return (
    <div
      ref={ref}
      className="fixed z-40 animate-scale-in"
      style={{ left, top, width }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/70 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-700 ring-1 ring-brand-200">
              {el.type}
            </span>
            <span className="text-[11px] text-ink-400">
              {Math.round(el.w)} × {Math.round(el.h)}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <Btn title="Duplicate" onClick={onDuplicate}>
              <Copy size={15} />
            </Btn>
            <Btn title="Delete" onClick={onDelete} danger>
              <Trash2 size={15} />
            </Btn>
            <Btn title="Close" onClick={onClose}>
              <X size={15} />
            </Btn>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-ink-100 px-3 py-2">
          <Group label="Order">
            <Btn title="Bring forward" onClick={onBringForward}>
              <Layers size={15} />
            </Btn>
            <Btn title="Send backward" onClick={onSendBackward}>
              <Minus size={15} />
            </Btn>
          </Group>
          <Group label="Align">
            {[
              ['left', AlignLeft],
              ['center', AlignCenter],
              ['right', AlignRight],
              ['justify', AlignJustify],
            ].map(([value, IconCmp]) => (
              <Btn
                key={value}
                title={`Align ${value}`}
                active={style.align === value}
                onClick={() => patchStyle({ align: value })}
              >
                <IconCmp size={15} />
              </Btn>
            ))}
          </Group>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-ink-100 px-3 pt-2">
          {[
            ['text', 'Text', Type],
            ['design', 'Design', LayoutGrid],
            ...(isImage ? [['media', 'Image', ImageIcon]] : []),
            ...(isSection ? [['media', 'Video', Video]] : []),
            ...(isIcon ? [['icon', 'Icon', SparkleIcon]] : []),
            ...(isCatalog ? [['catalog', 'Products', LayoutGrid]] : []),
          ].map(([key, label, IconCmp]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-semibold transition ${
                tab === key ? 'bg-white text-brand-700 ring-1 ring-ink-200' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <IconCmp size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-[52vh] overflow-y-auto scroll-thin">
          {/* ---------- TEXT ---------- */}
          {tab === 'text' ? (
            <>
              <Section title="Content" defaultOpen>
                {el.type === 'button' || el.type === 'phone' ? (
                  <input
                    type="text"
                    value={content.text || ''}
                    onChange={(e) => patchContent({ text: e.target.value })}
                    placeholder="Label"
                    className="w-full rounded-lg border border-ink-200 px-2.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                ) : (
                  <textarea
                    value={content.text || ''}
                    onChange={(e) => patchContent({ text: e.target.value })}
                    rows={2}
                    placeholder="Write your text"
                    className="w-full resize-y rounded-lg border border-ink-200 px-2.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                )}
                {el.type === 'button' ? (
                  <input
                    type="text"
                    value={content.href || ''}
                    onChange={(e) => patchContent({ href: e.target.value })}
                    placeholder="Link URL (https://… or #)"
                    className="w-full rounded-lg border border-ink-200 px-2.5 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                ) : null}
                {el.type === 'phone' ? (
                  <input
                    type="text"
                    value={content.href || ''}
                    onChange={(e) => patchContent({ href: e.target.value })}
                    placeholder="tel:+15550102030"
                    className="w-full rounded-lg border border-ink-200 px-2.5 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                ) : null}
              </Section>

              <Section title="Typography" defaultOpen>
                <Row label="Font">
                  <select
                    value={style.fontFamily || 'Inter'}
                    onChange={(e) => patchStyle({ fontFamily: e.target.value })}
                    className="w-[168px] rounded-lg border border-ink-200 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                  >
                    {FONTS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </Row>
                <Row label="Size">
                  <input
                    type="range"
                    min={8}
                    max={140}
                    value={Number(style.fontSize) || 18}
                    onChange={(e) => patchStyle({ fontSize: Number(e.target.value) })}
                    className="w-[120px]"
                  />
                  <input
                    type="number"
                    value={Number(style.fontSize) || 18}
                    onChange={(e) => patchStyle({ fontSize: Number(e.target.value) })}
                    className="w-14 rounded-lg border border-ink-200 px-1.5 py-1 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </Row>
                <Row label="Weight">
                  <div className="flex gap-0.5">
                    {[300, 400, 600, 700, 800].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => patchStyle({ fontWeight: w })}
                        className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                          Number(style.fontWeight) === w
                            ? 'bg-brand-600 text-white'
                            : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                        }`}
                      >
                        {w === 300 ? 'L' : w === 400 ? 'R' : w === 600 ? 'SB' : w === 700 ? 'B' : 'EB'}
                      </button>
                    ))}
                  </div>
                </Row>
                <Row label="Line height">
                  <input
                    type="range"
                    min={0.8}
                    max={2.4}
                    step={0.05}
                    value={Number(style.lineHeight) || 1.5}
                    onChange={(e) => patchStyle({ lineHeight: Number(e.target.value) })}
                    className="w-[120px]"
                  />
                </Row>
                <Row label="Letter spacing">
                  <input
                    type="range"
                    min={-3}
                    max={12}
                    step={0.5}
                    value={Number(style.letterSpacing) || 0}
                    onChange={(e) => patchStyle({ letterSpacing: Number(e.target.value) })}
                    className="w-[120px]"
                  />
                </Row>
                <Row label="Text colour">
                  <ColorPicker label="Text" value={style.color} onChange={(c) => patchStyle({ color: c })} />
                </Row>
                <Row label="Background">
                  <ColorPicker
                    label="Background"
                    value={style.bg}
                    allowTransparent
                    onChange={(c) => patchStyle({ bg: c })}
                  />
                </Row>
              </Section>

              {languageOptions.length > 1 && TEXT_TYPES.includes(el.type) ? (
                <Section title="Translations">
                  <p className="text-[11px] leading-snug text-ink-500">
                    Write this element&apos;s text in each language. Empty fields fall back to the default
                    language.
                  </p>
                  {languageOptions.map((l) => (
                    <div key={l.code} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink-600">
                          {l.label}
                          <span className="ml-1 text-[10px] font-medium uppercase text-ink-400">
                            {l.code}
                          </span>
                        </span>
                        {l.code === defaultLang ? (
                          <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-500">
                            Default
                          </span>
                        ) : null}
                      </div>
                      {l.code === defaultLang ? (
                        <div className="rounded-lg border border-ink-100 bg-ink-50 px-2.5 py-1.5 text-xs text-ink-500">
                          Edit the default text in the Content section above.
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={(el.i18n && el.i18n[l.code] && el.i18n[l.code].text) || ''}
                          placeholder={`Text in ${l.label}`}
                          dir={l.dir}
                          onChange={(e) =>
                            onPatch({ i18n: { ...(el.i18n || {}), [l.code]: { text: e.target.value } } })
                          }
                          className="w-full rounded-lg border border-ink-200 px-2.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </Section>
              ) : null}
            </>
          ) : null}

          {/* ---------- DESIGN ---------- */}
          {tab === 'design' ? (
            <Section title="Box styling" defaultOpen>
              <Row label="Width">
                <input
                  type="number"
                  value={Math.round(el.w)}
                  onChange={(e) => onChange({ w: Math.max(16, Number(e.target.value) || 16) })}
                  className="w-20 rounded-lg border border-ink-200 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none"
                />
              </Row>
              <Row label="Height">
                <input
                  type="number"
                  value={Math.round(el.h)}
                  onChange={(e) => onChange({ h: Math.max(16, Number(e.target.value) || 16) })}
                  className="w-20 rounded-lg border border-ink-200 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none"
                />
              </Row>
              <Row label="Corner radius">
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={Number(style.radius) || 0}
                  onChange={(e) => patchStyle({ radius: Number(e.target.value) })}
                  className="w-[120px]"
                />
              </Row>
              <Row label="Opacity">
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={style.opacity == null ? 1 : Number(style.opacity)}
                  onChange={(e) => patchStyle({ opacity: Number(e.target.value) })}
                  className="w-[120px]"
                />
              </Row>
              <Row label="Padding X">
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={Number(style.paddingX) || 0}
                  onChange={(e) => patchStyle({ paddingX: Number(e.target.value) })}
                  className="w-[120px]"
                />
              </Row>
              <Row label="Padding Y">
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={Number(style.paddingY) || 0}
                  onChange={(e) => patchStyle({ paddingY: Number(e.target.value) })}
                  className="w-[120px]"
                />
              </Row>
              <Row label="Border">
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={Number(style.borderWidth) || 0}
                  onChange={(e) => patchStyle({ borderWidth: Number(e.target.value) })}
                  className="w-[80px]"
                />
                <ColorPicker
                  label="Border"
                  value={style.borderColor || '#e5e7eb'}
                  onChange={(c) => patchStyle({ borderColor: c })}
                  align="right"
                />
              </Row>
              <Row label="Drop shadow">
                <button
                  type="button"
                  onClick={() => patchStyle({ shadow: !style.shadow })}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    style.shadow ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600'
                  }`}
                >
                  {style.shadow ? 'On' : 'Off'}
                </button>
              </Row>
              {!isSection ? (
                <Row label="Fill">
                  <ColorPicker
                    label="Fill"
                    value={style.bg}
                    allowTransparent
                    onChange={(c) => patchStyle({ bg: c })}
                    align="right"
                  />
                </Row>
              ) : null}
            </Section>
          ) : null}

          {/* ---------- MEDIA ---------- */}
          {tab === 'media' ? (
            <Section title={isSection ? 'Background video' : 'Image'} defaultOpen>
              {isSection ? (
                <>
                  <div className="text-[11px] text-ink-500">
                    Paste a video URL (MP4/WebM) or upload one. It plays muted and looped behind this section.
                  </div>
                  <input
                    type="text"
                    value={content.videoUrl || ''}
                    onChange={(e) => patchContent({ videoUrl: e.target.value })}
                    placeholder="https://…/hero.mp4"
                    className="w-full rounded-lg border border-ink-200 px-2.5 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-ink-300 px-3 py-2 text-xs font-semibold text-ink-600 hover:border-brand-400 hover:bg-brand-50">
                    <Upload size={14} /> Upload video file
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        const data = await readFileAsDataUrl(file);
                        patchContent({ videoUrl: data });
                      }}
                    />
                  </label>
                  <Row label="Dark overlay">
                    <input
                      type="range"
                      min={0}
                      max={0.85}
                      step={0.05}
                      value={Number((content.bg || {}).overlay) || 0.45}
                      onChange={(e) =>
                        patchContent({ bg: { ...(content.bg || {}), overlay: Number(e.target.value) } })
                      }
                      className="w-[120px]"
                    />
                  </Row>
                  <div className="rounded-xl border border-ink-200 p-3">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                      Section background
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {['color', 'gradient'].map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => patchContent({ bg: { ...(content.bg || {}), type: kind } })}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                            (content.bg || {}).type === kind
                              ? 'bg-brand-600 text-white'
                              : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                          }`}
                        >
                          {kind}
                        </button>
                      ))}
                      <ColorPicker
                        label="From"
                        value={(content.bg || {}).from || (content.bg || {}).color || '#3b66ff'}
                        onChange={(c) =>
                          patchContent({
                            bg:
                              (content.bg || {}).type === 'gradient'
                                ? { ...(content.bg || {}), from: c }
                                : { ...(content.bg || {}), type: 'color', color: c },
                          })
                        }
                      />
                      {(content.bg || {}).type === 'gradient' ? (
                        <ColorPicker
                          label="To"
                          value={(content.bg || {}).to || '#1c33e1'}
                          onChange={(c) => patchContent({ bg: { ...(content.bg || {}), to: c } })}
                        />
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[11px] text-ink-500">
                    Drop an image anywhere on the canvas, or upload one here.
                  </div>
                  <input
                    type="text"
                    value={content.src || ''}
                    onChange={(e) => patchContent({ src: e.target.value })}
                    placeholder="https://…/photo.jpg"
                    className="w-full rounded-lg border border-ink-200 px-2.5 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-ink-300 px-3 py-2 text-xs font-semibold text-ink-600 hover:border-brand-400 hover:bg-brand-50">
                    <Upload size={14} /> Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        const data = await readFileAsDataUrl(file);
                        patchContent({ src: data });
                      }}
                    />
                  </label>
                  {content.src ? (
                    <button
                      type="button"
                      onClick={() => patchContent({ src: '' })}
                      className="w-full rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-200"
                    >
                      Remove image
                    </button>
                  ) : null}
                  <input
                    type="text"
                    value={content.alt || ''}
                    onChange={(e) => patchContent({ alt: e.target.value })}
                    placeholder="Alt text (accessibility)"
                    className="w-full rounded-lg border border-ink-200 px-2.5 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </>
              )}
            </Section>
          ) : null}

          {/* ---------- ICON ---------- */}
          {tab === 'icon' ? (
            <Section title="Icon" defaultOpen>
              <Row label="Colour">
                <ColorPicker label="Icon" value={style.color} onChange={(c) => patchStyle({ color: c })} />
              </Row>
              <Row label="Background">
                <ColorPicker
                  label="Background"
                  value={style.bg}
                  allowTransparent
                  onChange={(c) => patchStyle({ bg: c })}
                />
              </Row>
              <button
                type="button"
                onClick={() => setShowIcons((v) => !v)}
                className="w-full rounded-lg bg-ink-100 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-200"
              >
                {showIcons ? 'Hide icon library' : `Browse ${ICON_NAMES.length} icons`}
              </button>
              {showIcons ? (
                <div className="grid max-h-56 grid-cols-8 gap-1 overflow-y-auto scroll-thin rounded-xl border border-ink-200 p-2">
                  {ICON_NAMES.map((name) => (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      onClick={() => patchContent({ icon: name })}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-brand-50 ${
                        content.icon === name ? 'bg-brand-100 ring-1 ring-brand-400' : ''
                      }`}
                    >
                      <Icon name={name} size={16} color="#42495e" />
                    </button>
                  ))}
                </div>
              ) : null}
            </Section>
          ) : null}

          {/* ---------- CATALOG ---------- */}
          {tab === 'catalog' ? (
            <Section title="Product grid" defaultOpen>
              <Row label="Columns">
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={Number(content.columns) || 3}
                  onChange={(e) => patchContent({ columns: Number(e.target.value) })}
                  className="w-[120px]"
                />
                <span className="w-6 text-xs font-semibold text-ink-600">{Number(content.columns) || 3}</span>
              </Row>
              <div className="space-y-2">
                {(content.items || []).map((item, index) => (
                  <div key={item.id} className="rounded-xl border border-ink-200 p-2">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
                        Item {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          patchContent({ items: (content.items || []).filter((i) => i.id !== item.id) })
                        }
                        className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove item ${index + 1}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={item.title || ''}
                        placeholder="Title"
                        onChange={(e) =>
                          patchContent({
                            items: content.items.map((i) =>
                              i.id === item.id ? { ...i, title: e.target.value } : i
                            ),
                          })
                        }
                        className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                      />
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={item.price || ''}
                          placeholder="$29"
                          onChange={(e) =>
                            patchContent({
                              items: content.items.map((i) =>
                                i.id === item.id ? { ...i, price: e.target.value } : i
                              ),
                            })
                          }
                          className="w-24 rounded-lg border border-ink-200 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                        />
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-300 px-2 py-1.5 text-[11px] font-semibold text-ink-600 hover:border-brand-400 hover:bg-brand-50">
                          <ImageIcon size={12} /> {item.image ? 'Replace' : 'Photo'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files && e.target.files[0];
                              if (!file) return;
                              const data = await readFileAsDataUrl(file);
                              patchContent({
                                items: content.items.map((i) =>
                                  i.id === item.id ? { ...i, image: data } : i
                                ),
                              });
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={item.description || ''}
                        placeholder="Short description"
                        onChange={(e) =>
                          patchContent({
                            items: content.items.map((i) =>
                              i.id === item.id ? { ...i, description: e.target.value } : i
                            ),
                          })
                        }
                        className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  patchContent({
                    items: [
                      ...(content.items || []),
                      {
                        id: uid('item'),
                        title: 'New product',
                        price: '$0',
                        description: '',
                        image: '',
                      },
                    ],
                  })
                }
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700"
              >
                <Plus size={14} /> Add product
              </button>
            </Section>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/60 px-3 py-2">
          <button
            type="button"
            onClick={onToggleHidden}
            className="text-[11px] font-semibold text-ink-500 hover:text-ink-800"
          >
            {el.hidden ? 'Show element' : 'Hide element'}
          </button>
          <span className="text-[11px] text-ink-400">Esc to close</span>
        </div>
      </div>
    </div>
  );
}

function SparkleIcon({ size = 16 }) {
  return <Icon name="Sparkles" size={size} color="currentColor" />;
}
