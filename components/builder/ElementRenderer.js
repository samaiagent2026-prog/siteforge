'use client';

import { ICON_PATHS } from '@/lib/icons';
import { textFor } from '@/lib/compile';

/** Inline Lucide icon rendered from stored path data. */
export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, style }) {
  const body = ICON_PATHS[name] || ICON_PATHS.Sparkles;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

function alignFlex(align) {
  if (align === 'center') return 'center';
  if (align === 'right') return 'flex-end';
  if (align === 'justify') return 'space-between';
  return 'flex-start';
}

function backgroundCss(content, style) {
  const bg = (content && content.bg) || {};
  if (bg.type === 'gradient') {
    return `linear-gradient(${Number(bg.angle) || 135}deg, ${bg.from || '#3b66ff'}, ${bg.to || '#1c33e1'})`;
  }
  if (bg.type === 'color') return bg.color || '#ffffff';
  return style.bg && style.bg !== 'transparent' ? style.bg : 'transparent';
}

function typography(style) {
  return {
    fontFamily: `'${style.fontFamily || 'Inter'}', system-ui, sans-serif`,
    fontSize: `${Number(style.fontSize) || 18}px`,
    fontWeight: Number(style.fontWeight) || 400,
    lineHeight: style.lineHeight || 1.5,
    letterSpacing: `${Number(style.letterSpacing) || 0}px`,
    color: style.color || '#111827',
    textAlign: style.align || 'left',
    borderRadius: style.radius ? `${style.radius}px` : undefined,
    paddingLeft: style.paddingX ? `${style.paddingX}px` : undefined,
    paddingRight: style.paddingX ? `${style.paddingX}px` : undefined,
    paddingTop: style.paddingY ? `${style.paddingY}px` : undefined,
    paddingBottom: style.paddingY ? `${style.paddingY}px` : undefined,
    border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor || '#e5e7eb'}` : undefined,
    boxShadow: style.shadow ? '0 10px 30px rgba(15,23,42,.16)' : undefined,
    opacity: style.opacity == null ? 1 : style.opacity,
  };
}

function TextElement({ el, lang }) {
  const style = el.style || {};
  return (
    <div
      className="flex h-full w-full overflow-hidden"
      style={{ ...typography(style), alignItems: 'center', justifyContent: alignFlex(style.align) }}
    >
      <span className="w-full break-words">{textFor(el, lang)}</span>
    </div>
  );
}

/**
 * Renders one element in builder mode. Kept intentionally close to the
 * production markup so the canvas is a faithful WYSIWYG preview.
 */
export default function ElementRenderer({ el, lang }) {
  const style = el.style || {};
  const content = el.content || {};

  if (el.type === 'section') {
    const bg = content.bg || {};
    const video = content.videoUrl || '';
    return (
      <div
        className="h-full w-full overflow-hidden"
        style={{ background: video ? '#000' : backgroundCss(content, style) }}
      >
        {video ? (
          <>
            <video
              src={video}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
            {Number(bg.overlay) > 0 ? (
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: `rgba(0,0,0,${Number(bg.overlay)})` }}
              />
            ) : null}
          </>
        ) : null}
      </div>
    );
  }

  if (el.type === 'image') {
    const src = content.src || '';
    const radius = Number(style.radius) || 0;
    return src ? (
      <img
        src={src}
        alt={content.alt || ''}
        className="h-full w-full object-cover"
        style={{ borderRadius: radius }}
        draggable={false}
      />
    ) : (
      <div
        className="flex h-full w-full items-center justify-center text-sm font-semibold text-ink-500"
        style={{
          borderRadius: radius,
          background: 'linear-gradient(135deg,#e5e9f5,#cfd7ea)',
        }}
      >
        Image
      </div>
    );
  }

  if (el.type === 'logo') {
    if (content.src) {
      return (
        <div className="flex h-full w-full items-center">
          <img src={content.src} alt={textFor(el, lang)} className="max-h-full max-w-full object-contain" draggable={false} />
        </div>
      );
    }
    return (
      <div
        className="flex h-full w-full items-center"
        style={{ ...typography(style), justifyContent: alignFlex(style.align) }}
      >
        <span className="w-full">{textFor(el, lang)}</span>
      </div>
    );
  }

  if (el.type === 'button') {
    return (
      <div className="flex h-full w-full items-center">
        <span
          className="flex h-full w-full items-center justify-center"
          style={{
            ...typography(style),
            background: style.bg || '#3b66ff',
            borderRadius: Number(style.radius) || 0,
          }}
        >
          {textFor(el, lang)}
        </span>
      </div>
    );
  }

  if (el.type === 'icon') {
    const size = Math.max(12, Math.min(Number(el.w) || 32, Number(el.h) || 32));
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{
          background: style.bg && style.bg !== 'transparent' ? style.bg : undefined,
          borderRadius: Number(style.radius) || undefined,
        }}
      >
        <Icon
          name={content.icon || 'Sparkles'}
          size={size}
          color={style.color || '#111827'}
          strokeWidth={Number(content.strokeWidth) || 2}
        />
      </div>
    );
  }

  if (el.type === 'catalog') {
    const items = (content.items || []).filter(Boolean);
    const columns = Math.max(1, Math.min(Number(content.columns) || 3, 6));
    return (
      <div className="h-full w-full overflow-auto" style={{ color: style.color || '#171923' }}>
        <div className="grid h-full gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
          {items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm"
              >
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 to-ink-100">
                  {item.image ? (
                    <img src={item.image} alt={item.title || ''} className="h-full w-full object-cover" draggable={false} />
                  ) : (
                    <span className="text-3xl font-extrabold text-ink-300">
                      {(item.title || 'P').slice(0, 1)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <h3 className="text-sm font-bold leading-tight">{item.title}</h3>
                  {item.price ? <div className="text-sm font-bold text-brand-600">{item.price}</div> : null}
                  {item.description ? (
                    <p className="text-xs leading-snug text-ink-500">{item.description}</p>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center text-sm text-ink-400">
              No products yet — open the toolbar to add one.
            </div>
          )}
        </div>
      </div>
    );
  }

  return <TextElement el={el} lang={lang} />;
}
