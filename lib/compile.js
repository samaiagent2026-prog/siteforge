import { GOOGLE_FONT_FAMILIES, RTL_CODES, dirFor } from './defaults';
import { iconSvg } from './icons';

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

export function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^(https?:|mailto:|tel:|\/|#|data:image\/)/i.test(url)) return url;
  return '';
}

/** Resolve the visible text for an element in the active language. */
export function textFor(el, lang) {
  const fallback = (el.content && el.content.text) || '';
  if (!lang || !el.i18n) return fallback;
  const t = el.i18n[lang];
  if (t && typeof t.text === 'string' && t.text.length) return t.text;
  return fallback;
}

/** All enabled language codes for a site, always including the default. */
export function enabledLanguages(site) {
  const cfg = site.languages || {};
  const set = new Set(Array.isArray(cfg.enabled) ? cfg.enabled : ['en']);
  if (cfg.default) set.add(cfg.default);
  if (!set.size) set.add('en');
  return Array.from(set);
}

export function languageMeta(site) {
  const cfg = site.languages || {};
  const custom = Array.isArray(cfg.custom) ? cfg.custom : [];
  return enabledLanguages(site).map((code) => {
    const c = custom.find((x) => x.code === code);
    if (c) return { code, label: c.label || code, dir: c.dir || 'ltr' };
    return { code, label: code, dir: dirFor(code) };
  });
}

export function canvasHeight(site) {
  const els = site.elements || [];
  const maxBottom = els.reduce((acc, el) => Math.max(acc, num(el.y) + num(el.h)), 0);
  return Math.max(maxBottom, num(site.canvas && site.canvas.minHeight, 900));
}

/* ------------------------------------------------------------------ *
 * Element rendering
 * ------------------------------------------------------------------ */

function backgroundCss(content, style) {
  const bg = (content && content.bg) || {};
  if (bg.type === 'gradient') {
    const from = bg.from || style.bg || '#3b66ff';
    const to = bg.to || '#1c33e1';
    const angle = num(bg.angle, 135);
    return `linear-gradient(${angle}deg, ${from}, ${to})`;
  }
  if (bg.type === 'color') return bg.color || style.bg || '#ffffff';
  return style.bg && style.bg !== 'transparent' ? style.bg : '';
}

function baseStyle(el) {
  const s = el.style || {};
  const parts = [
    `left:${num(el.x)}px`,
    `top:${num(el.y)}px`,
    `width:${num(el.w)}px`,
    `height:${num(el.h)}px`,
    `z-index:${num(el.z, 1)}`,
  ];
  if (s.opacity != null && s.opacity !== 1) parts.push(`opacity:${num(s.opacity, 1)}`);
  return parts.join(';');
}

function typography(el) {
  const s = el.style || {};
  const parts = [
    `font-family:'${s.fontFamily || 'Inter'}',system-ui,sans-serif`,
    `font-size:${num(s.fontSize, 18)}px`,
    `font-weight:${num(s.fontWeight, 400)}`,
    `line-height:${num(s.lineHeight, 1.5)}`,
    `letter-spacing:${num(s.letterSpacing, 0)}px`,
    `color:${s.color || '#111827'}`,
    `text-align:${s.align || 'left'}`,
  ];
  if (s.radius) parts.push(`border-radius:${num(s.radius)}px`);
  if (s.paddingX) parts.push(`padding-left:${num(s.paddingX)}px`, `padding-right:${num(s.paddingX)}px`);
  if (s.paddingY) parts.push(`padding-top:${num(s.paddingY)}px`, `padding-bottom:${num(s.paddingY)}px`);
  if (s.borderWidth) {
    parts.push(`border:${num(s.borderWidth)}px solid ${s.borderColor || '#e5e7eb'}`);
  }
  if (s.shadow) parts.push('box-shadow:0 10px 30px rgba(15,23,42,.16)');
  return parts.join(';');
}

function flexBox(align) {
  const justify =
    align === 'center' ? 'center' : align === 'right' ? 'flex-end' : align === 'justify' ? 'space-between' : 'flex-start';
  return `display:flex;align-items:center;justify-content:${justify};box-sizing:border-box`;
}

function sectionMarkup(el, site) {
  const bg = (el.content && el.content.bg) || {};
  const video = safeUrl((el.content && el.content.videoUrl) || bg.videoUrl);
  const overlay = num(bg.overlay, 0.45);
  let inner = '';
  if (video) {
    inner += `<video class="bg-video" autoplay muted loop playsinline preload="auto" src="${esc(video)}"></video>`;
    if (overlay > 0) {
      inner += `<div class="bg-overlay" style="background:rgba(0,0,0,${overlay})"></div>`;
    }
  }
  return `<div class="el el-section" data-id="${esc(el.id)}" style="${baseStyle(el)};background:${
    video ? '#000' : esc(backgroundCss(el.content, el.style || {})) || 'transparent'
  };overflow:hidden">${inner}</div>`;
}

function textMarkup(el, site, lang) {
  const langs = languageMeta(site);
  const text = textFor(el, lang);
  const align = (el.style && el.style.align) || 'left';
  if (langs.length <= 1) {
    return `<div class="el el-text" data-id="${esc(el.id)}" style="${baseStyle(el)};${typography(el)};${flexBox(
      align
    )}"><span>${esc(text)}</span></div>`;
  }
  const variants = langs
    .map((l) => {
      const t = textFor(el, l.code);
      const active = l.code === lang;
      return `<span data-lang="${esc(l.code)}" style="display:${active ? 'block' : 'none'};width:100%">${esc(
        t
      )}</span>`;
    })
    .join('');
  return `<div class="el el-text" data-id="${esc(el.id)}" style="${baseStyle(el)};${typography(el)};${flexBox(
    align
  )}">${variants}</div>`;
}

function logoMarkup(el, site, lang) {
  const src = safeUrl((el.content && el.content.src) || '');
  const text = textFor(el, lang);
  if (src) {
    return `<div class="el el-logo" data-id="${esc(el.id)}" style="${baseStyle(
      el
    )};display:flex;align-items:center"><img src="${esc(src)}" alt="${esc(text)}" style="max-width:100%;max-height:100%;object-fit:contain"/></div>`;
  }
  const s = el.style || {};
  return `<div class="el el-logo" data-id="${esc(el.id)}" style="${baseStyle(el)};${typography(el)};${flexBox(
    s.align || 'left'
  )}"><span>${esc(text)}</span></div>`;
}

function imageMarkup(el) {
  const src = safeUrl((el.content && el.content.src) || '');
  const alt = esc((el.content && el.content.alt) || '');
  const radius = num((el.style || {}).radius, 0);
  const inner = src
    ? `<img src="${esc(src)}" alt="${alt}" style="width:100%;height:100%;object-fit:cover;border-radius:${radius}px;display:block"/>`
    : `<div class="img-placeholder" style="border-radius:${radius}px"><span>Image</span></div>`;
  return `<div class="el el-image" data-id="${esc(el.id)}" style="${baseStyle(el)}">${inner}</div>`;
}

function buttonMarkup(el, site, lang) {
  const s = el.style || {};
  const href = safeUrl((el.content && el.content.href) || '#') || '#';
  const text = textFor(el, lang);
  return `<div class="el el-button" data-id="${esc(el.id)}" style="${baseStyle(
    el
  )};display:flex;align-items:center"><a href="${esc(href)}" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;box-sizing:border-box;text-decoration:none;${typography(
    el
  )};background:${esc(s.bg || '#3b66ff')};transition:transform .15s ease,filter .15s ease">${esc(
    text
  )}</a></div>`;
}

function iconMarkup(el) {
  const s = el.style || {};
  const name = (el.content && el.content.icon) || 'Sparkles';
  const size = Math.max(12, Math.min(num(el.w, 32), num(el.h, 32)));
  const svg = iconSvg(name, { size, color: s.color || '#111827', strokeWidth: num(el.content && el.content.strokeWidth, 2) });
  const bg = s.bg && s.bg !== 'transparent' ? `background:${esc(s.bg)};border-radius:${num(s.radius, 0)}px;` : '';
  return `<div class="el el-icon" data-id="${esc(el.id)}" style="${baseStyle(
    el
  )};display:flex;align-items:center;justify-content:center;${bg}">${svg}</div>`;
}

function catalogMarkup(el) {
  const s = el.style || {};
  const items = ((el.content && el.content.items) || []).filter(Boolean);
  const columns = Math.max(1, Math.min(num((el.content || {}).columns, 3), 6));
  const cards = items
    .map((item) => {
      const img = safeUrl(item.image);
      const media = img
        ? `<div class="cat-media"><img src="${esc(img)}" alt="${esc(item.title || '')}"/></div>`
        : `<div class="cat-media cat-media-empty"><span>${esc((item.title || 'P').slice(0, 1))}</span></div>`;
      return `<div class="cat-card">${media}<div class="cat-body"><h3>${esc(item.title || '')}</h3>${
        item.price ? `<div class="cat-price">${esc(item.price)}</div>` : ''
      }${item.description ? `<p>${esc(item.description)}</p>` : ''}</div></div>`;
    })
    .join('');
  return `<div class="el el-catalog" data-id="${esc(el.id)}" style="${baseStyle(
    el
  )};color:${esc(s.color || '#171923')};overflow:auto"><div class="cat-grid" style="grid-template-columns:repeat(${columns},minmax(0,1fr))">${
    cards || '<div class="cat-empty">No products yet</div>'
  }</div></div>`;
}

function elementMarkup(el, site, lang) {
  if (el.hidden) return '';
  switch (el.type) {
    case 'section':
      return sectionMarkup(el, site);
    case 'text':
    case 'phone':
      return textMarkup(el, site, lang);
    case 'logo':
      return logoMarkup(el, site, lang);
    case 'image':
      return imageMarkup(el);
    case 'button':
      return buttonMarkup(el, site, lang);
    case 'icon':
      return iconMarkup(el);
    case 'catalog':
      return catalogMarkup(el);
    default:
      return textMarkup(el, site, lang);
  }
}

/* ------------------------------------------------------------------ *
 * Page assembly
 * ------------------------------------------------------------------ */

function fontsLink(site) {
  const used = new Set();
  (site.elements || []).forEach((el) => {
    const f = (el.style || {}).fontFamily;
    if (f) used.add(f);
  });
  const families = Array.from(used)
    .map((f) => f.replace(/\s+/g, '+'))
    .filter((f) => GOOGLE_FONT_FAMILIES.includes(f.replace(/\+/g, ' ')));
  if (!families.length) return '';
  const params = families
    .map((f) => `family=${f}:wght@300;400;500;600;700;800`)
    .join('&');
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${params}&display=swap" rel="stylesheet">`;
}

export function compileCss(site) {
  const width = num(site.canvas && site.canvas.width, 1280);
  const height = canvasHeight(site);
  return `*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:${esc((site.canvas && site.canvas.background) || '#ffffff')};font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
img{max-width:100%}
.page{position:relative;width:${width}px;height:${height}px;margin:0 auto;overflow:hidden}
#stage{position:relative;width:${width}px;height:${height}px;transform-origin:top left}
.el{position:absolute}
.el-section{pointer-events:none}
.bg-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bg-overlay{position:absolute;inset:0}
.img-placeholder{width:100%;height:100%;background:linear-gradient(135deg,#e5e9f5,#cfd7ea);display:flex;align-items:center;justify-content:center;color:#66728d;font-size:14px;font-weight:600}
.cat-grid{display:grid;gap:20px;height:100%}
.cat-card{background:#fff;border:1px solid #e6e9f0;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 6px 20px rgba(15,23,42,.06)}
.cat-media{aspect-ratio:4/3;background:linear-gradient(135deg,#eef2fb,#dbe3f6);display:flex;align-items:center;justify-content:center;overflow:hidden}
.cat-media img{width:100%;height:100%;object-fit:cover}
.cat-media-empty span{font-size:40px;font-weight:800;color:#93a3c9}
.cat-body{padding:16px 18px 20px;display:flex;flex-direction:column;gap:6px}
.cat-body h3{margin:0;font-size:18px;font-weight:700}
.cat-body p{margin:0;font-size:14px;color:#66728d;line-height:1.5}
.cat-price{font-size:16px;font-weight:700;color:#2544f5}
.cat-empty{grid-column:1/-1;display:flex;align-items:center;justify-content:center;color:#8590a8}
.lang-bar{position:fixed;top:14px;right:14px;z-index:9999;display:flex;gap:6px;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);padding:6px;border-radius:999px;box-shadow:0 8px 24px rgba(15,23,42,.14)}
.lang-bar button{border:0;background:transparent;padding:6px 14px;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer;color:#42495e}
.lang-bar button[aria-pressed="true"]{background:#2544f5;color:#fff}
@media (max-width:600px){.cat-grid{grid-template-columns:1fr !important}}
`;
}

export function compileJs(site) {
  return `(function(){
  var stage = document.getElementById('stage');
  function fit(){
    if(!stage) return;
    var avail = Math.min(document.documentElement.clientWidth, ${num(site.canvas && site.canvas.width, 1280)});
    var scale = avail / ${num(site.canvas && site.canvas.width, 1280)};
    stage.style.transform = 'scale(' + scale + ')';
    var page = stage.parentElement;
    if(page){ page.style.height = (${canvasHeight(site)} * scale) + 'px'; }
  }
  window.addEventListener('resize', fit);
  fit();

  document.querySelectorAll('.lang-bar button').forEach(function(btn){
    btn.addEventListener('click', function(){
      var code = btn.getAttribute('data-code');
      document.documentElement.lang = code;
      document.documentElement.dir = btn.getAttribute('data-dir') || 'ltr';
      document.querySelectorAll('.lang-bar button').forEach(function(b){ b.setAttribute('aria-pressed', String(b === btn)); });
      document.querySelectorAll('[data-lang]').forEach(function(node){
        node.style.display = node.getAttribute('data-lang') === code ? 'block' : 'none';
      });
    });
  });
})();`;
}

export function compileHtml(site) {
  const langs = languageMeta(site);
  const def = (site.languages && site.languages.default) || (langs[0] && langs[0].code) || 'en';
  const activeMeta = langs.find((l) => l.code === def) || langs[0] || { code: 'en', dir: 'ltr' };
  const dir = RTL_CODES.includes(activeMeta.code) ? 'rtl' : activeMeta.dir || 'ltr';
  const els = (site.elements || []).slice().sort((a, b) => num(a.z, 1) - num(b.z, 1));

  const langBar =
    langs.length > 1
      ? `<div class="lang-bar">${langs
          .map(
            (l) =>
              `<button type="button" data-code="${esc(l.code)}" data-dir="${esc(
                l.dir
              )}" aria-pressed="${l.code === activeMeta.code}">${esc(l.label)}</button>`
          )
          .join('')}</div>`
      : '';

  return `<!DOCTYPE html>
<html lang="${esc(activeMeta.code)}" dir="${esc(dir)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.name || 'My Website')}</title>
<meta name="description" content="${esc(site.name || 'My Website')}">
${fontsLink(site)}
<link rel="stylesheet" href="styles.css">
</head>
<body>
${langBar}
<div class="page"><div id="stage">
${els.map((el) => elementMarkup(el, site, activeMeta.code)).join('\n')}
</div></div>
<script src="script.js"></script>
</body>
</html>`;
}

/**
 * Build the full export bundle: { 'index.html': string, 'styles.css': string, ... }
 * Used both for the local JSZip download and the server-side FTP deploy.
 */
export function compileSite(site) {
  return {
    'index.html': compileHtml(site),
    'styles.css': compileCss(site),
    'script.js': compileJs(site),
  };
}
