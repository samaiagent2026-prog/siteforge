import { makeElement, DEFAULT_ELEMENT_STYLE, CANVAS_WIDTH } from './defaults';

/**
 * Ready-made professional website templates.
 *
 * Each template is a plain site document (the same shape the builder edits), so
 * loading one is just `setSite(template)`. Text is authored in English with an
 * Arabic translation attached, and templates ship with both languages enabled —
 * a client can publish a bilingual site straight away.
 */

const W = CANVAS_WIDTH;
const PAD = 80;

/* ------------------------------------------------------------------ helpers */

function el(type, props) {
  return makeElement(type, props);
}

function bgGradient(from, to, angle = 135) {
  return { type: 'gradient', from, to, angle, color: '#ffffff', src: '', videoUrl: '', overlay: 0.45 };
}
function bgColor(color) {
  return { type: 'color', color, gradient: { from: '#3b66ff', to: '#1c33e1', angle: 135 }, src: '', videoUrl: '', overlay: 0.45 };
}
function bgImage(src, overlay = 0.5) {
  return { type: 'image', src, overlay, gradient: { from: '#111827', to: '#1f2937', angle: 135 }, color: '#111827', videoUrl: '' };
}

/** Gradient placeholder image, inlined so exports stay self-contained. */
function photo(label, from, to, w = 800, h = 600) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>` +
    `<text x="50%" y="52%" font-family="Inter,Arial,sans-serif" font-size="${Math.round(
      Math.min(w, h) / 8
    )}" font-weight="700" fill="rgba(255,255,255,.88)" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function text({ x, y, w, h, value, ar, style = {}, z = 5 }) {
  return el('text', {
    x,
    y,
    w,
    h,
    z,
    content: { text: value },
    style: { ...DEFAULT_ELEMENT_STYLE, ...style },
    i18n: ar ? { ar: { text: ar } } : {},
  });
}

function button({ x, y, w = 230, h = 60, value, ar, href = '#', bg = '#2440f0', color = '#ffffff', radius = 14, fontSize = 18, z = 6 }) {
  return el('button', {
    x,
    y,
    w,
    h,
    z,
    content: { text: value, href },
    style: { ...DEFAULT_ELEMENT_STYLE, bg, color, radius, align: 'center', fontWeight: 700, fontSize },
    i18n: ar ? { ar: { text: ar } } : {},
  });
}

function icon({ x, y, size = 40, name = 'Sparkles', color = '#2440f0', z = 6, bg = 'transparent', radius = 12 }) {
  return el('icon', {
    x,
    y,
    w: size,
    h: size,
    z,
    content: { icon: name },
    style: { ...DEFAULT_ELEMENT_STYLE, color, bg, radius },
  });
}

function image({ x, y, w, h, src, radius = 16, alt = '', z = 4 }) {
  return el('image', { x, y, w, h, z, content: { src, alt }, style: { ...DEFAULT_ELEMENT_STYLE, radius } });
}

function logo({ x, y, w = 190, h = 52, value, ar, color = '#ffffff', z = 10 }) {
  return el('logo', {
    x,
    y,
    w,
    h,
    z,
    content: { text: value, src: '' },
    style: { ...DEFAULT_ELEMENT_STYLE, color, fontSize: 26, fontWeight: 800 },
    i18n: ar ? { ar: { text: ar } } : {},
  });
}

function phone({ x, y, w = 300, h = 40, value, color = '#ffffff', align = 'right', z = 10 }) {
  return el('phone', {
    x,
    y,
    w,
    h,
    z,
    content: { text: value, href: `tel:${value.replace(/[^+\d]/g, '')}` },
    style: { ...DEFAULT_ELEMENT_STYLE, color, fontSize: 17, fontWeight: 600, align },
  });
}

function catalog({ x = PAD, y, w = W - PAD * 2, h = 380, items, columns = 3, color = '#171923', z = 5 }) {
  return el('catalog', {
    x,
    y,
    w,
    h,
    z,
    content: { columns, items: items.map((it) => ({ id: `item_${Math.random().toString(36).slice(2, 9)}`, ...it })) },
    style: { ...DEFAULT_ELEMENT_STYLE, color, radius: 16 },
  });
}

function section({ y, h, bg }) {
  return el('section', { x: 0, y, w: W, h, z: 0, content: { bg, videoUrl: '' } });
}

/* ------------------------------------------------------------------- blocks */

function navbar(y, { brand, brandAr, phoneValue, textColor, accent, cta, ctaAr }) {
  const els = [
    logo({ x: PAD, y: y + 18, value: brand, ar: brandAr, color: textColor }),
    phone({ x: W - PAD - 320, y: y + 26, value: phoneValue, color: textColor }),
  ];
  if (cta) {
    els.push(
      button({
        x: W - PAD - 560,
        y: y + 18,
        w: 170,
        h: 46,
        value: cta,
        ar: ctaAr,
        bg: accent,
        radius: 10,
        fontSize: 15,
        z: 10,
      })
    );
  }
  return els;
}

function hero({ y, h, bg, title, titleAr, sub, subAr, cta, ctaAr, cta2, cta2Ar, accent, textColor, subColor, align = 'left' }) {
  const center = align === 'center';
  const x = center ? 0 : PAD;
  const w = center ? W : 760;
  const els = [section({ y, h, bg })];
  const blockH = 150;
  const titleY = y + Math.round(h * 0.32) - (sub ? 40 : 0);
  els.push(
    text({
      x,
      y: titleY,
      w,
      h: blockH,
      value: title,
      ar: titleAr,
      style: { color: textColor, fontSize: 60, fontWeight: 800, lineHeight: 1.1, align },
    })
  );
  if (sub) {
    els.push(
      text({
        x,
        y: titleY + blockH + 6,
        w: center ? 820 : 620,
        h: 80,
        value: sub,
        ar: subAr,
        style: { color: subColor, fontSize: 20, fontWeight: 400, lineHeight: 1.5, align },
      })
    );
  }
  const btnY = titleY + blockH + (sub ? 106 : 20);
  const btnX = center ? W / 2 - 250 : PAD;
  if (cta) {
    els.push(
      button({ x: btnX, y: btnY, w: 230, h: 62, value: cta, ar: ctaAr, bg: '#ffffff', color: accent, radius: 14 })
    );
  }
  if (cta2) {
    els.push(
      button({
        x: center ? W / 2 + 20 : PAD + 250,
        y: btnY,
        w: 230,
        h: 62,
        value: cta2,
        ar: cta2Ar,
        bg: 'transparent',
        color: textColor,
        radius: 14,
      })
    );
  }
  return els;
}

function heading({ y, title, titleAr, sub, subAr, color = '#0f172a', subColor = '#64748b', align = 'center', z = 6 }) {
  const els = [
    text({
      x: align === 'center' ? 0 : PAD,
      y,
      w: align === 'center' ? W : W - PAD * 2,
      h: 60,
      value: title,
      ar: titleAr,
      style: { color, fontSize: 38, fontWeight: 800, align },
      z,
    }),
  ];
  if (sub) {
    els.push(
      text({
        x: align === 'center' ? W / 2 - 420 : PAD,
        y: y + 62,
        w: align === 'center' ? 840 : 760,
        h: 50,
        value: sub,
        ar: subAr,
        style: { color: subColor, fontSize: 17, align },
        z,
      })
    );
  }
  return els;
}

function featureRow({ y, items, accent, cardBg = 'transparent', titleColor = '#0f172a', bodyColor = '#64748b' }) {
  const n = items.length;
  const gap = 32;
  const cardW = Math.floor((W - PAD * 2 - gap * (n - 1)) / n);
  const els = [];
  items.forEach((it, i) => {
    const x = PAD + i * (cardW + gap);
    if (it.image) {
      els.push(image({ x, y, w: cardW, h: 180, src: it.image, radius: 18 }));
    } else if (it.icon) {
      els.push(icon({ x, y, size: 52, name: it.icon, color: accent, bg: cardBg === 'transparent' ? 'transparent' : cardBg }));
    }
    const ty = it.image ? y + 196 : y + 66;
    els.push(
      text({
        x,
        y: ty,
        w: cardW,
        h: 40,
        value: it.title,
        ar: it.titleAr,
        style: { color: titleColor, fontSize: 21, fontWeight: 700 },
      })
    );
    if (it.body) {
      els.push(
        text({
          x,
          y: ty + 40,
          w: cardW,
          h: 90,
          value: it.body,
          ar: it.bodyAr,
          style: { color: bodyColor, fontSize: 15, lineHeight: 1.55 },
        })
      );
    }
  });
  return els;
}

function ctaBand({ y, h = 250, title, titleAr, sub, subAr, cta, ctaAr, bg, titleColor = '#ffffff', subColor = '#cbd5e1' }) {
  return [
    section({ y, h, bg }),
    ...heading({
      y: y + Math.round(h * 0.26),
      title,
      titleAr,
      sub,
      subAr,
      color: titleColor,
      subColor,
    }),
    button({ x: W / 2 - 130, y: y + h - 96, w: 260, h: 58, value: cta, ar: ctaAr, bg: '#ffffff', color: '#111827', radius: 14 }),
  ];
}

function contactBlock({ y, items, accent, titleColor = '#0f172a', bodyColor = '#64748b' }) {
  const els = [];
  const gap = 32;
  const cardW = Math.floor((W - PAD * 2 - gap * (items.length - 1)) / items.length);
  items.forEach((it, i) => {
    const x = PAD + i * (cardW + gap);
    els.push(icon({ x: x + cardW / 2 - 26, y, size: 52, name: it.icon, color: accent }));
    els.push(
      text({
        x,
        y: y + 64,
        w: cardW,
        h: 34,
        value: it.title,
        ar: it.titleAr,
        style: { color: titleColor, fontSize: 18, fontWeight: 700, align: 'center' },
      })
    );
    els.push(
      text({
        x,
        y: y + 100,
        w: cardW,
        h: 60,
        value: it.body,
        ar: it.bodyAr,
        style: { color: bodyColor, fontSize: 15, align: 'center', lineHeight: 1.5 },
      })
    );
  });
  return els;
}

function footer({ y, text: footerText, ar, bg = '#0d0f18', color = '#94a3b8' }) {
  return [
    section({ y, h: 180, bg: bgColor(bg) }),
    text({ x: 0, y: y + 78, w: W, h: 40, value: footerText, ar, style: { color, fontSize: 15, align: 'center' } }),
  ];
}

function assemble(name, elements) {
  const minHeight = elements.reduce((acc, e) => Math.max(acc, (e.y || 0) + (e.h || 0)), 0) + 40;
  return {
    version: 1,
    name,
    canvas: { width: W, minHeight, background: '#ffffff' },
    languages: { enabled: ['en', 'ar'], default: 'en', custom: [] },
    elements,
  };
}

/* --------------------------------------------------------------- templates */

const TEMPLATES = [
  {
    id: 'business',
    category: 'business',
    name: 'Business & Consulting',
    nameAr: 'أعمال واستشارات',
    desc: 'A trustworthy corporate site with services, packages and a strong call to action.',
    accent: '#1d4ed8',
    preview: photo('Business', '#1e3a8a', '#3b82f6', 480, 320),
    build() {
      const a = '#1d4ed8';
      const els = [];
      els.push(...hero({
        y: 0,
        h: 620,
        bg: bgGradient('#1e3a8a', '#3b82f6'),
        title: 'Grow your business with confidence',
        titleAr: 'طوّر أعمالك بثقة',
        sub: 'Strategy, consulting and delivery for ambitious companies. We turn plans into measurable results.',
        subAr: 'استراتيجية واستشارات وتنفيذ للشركات الطموحة. نحوّل الخطط إلى نتائج ملموسة.',
        cta: 'Book a consultation',
        ctaAr: 'احجز استشارة',
        cta2: 'Our services',
        cta2Ar: 'خدماتنا',
        accent: a,
        textColor: '#ffffff',
        subColor: '#dbeafe',
      }));
      els.push(...navbar(0, { brand: 'Northbridge', brandAr: 'نورثبريدج', phoneValue: '+1 (555) 010-2030', textColor: '#ffffff', accent: '#ffffff', cta: 'Contact us', ctaAr: 'اتصل بنا' }));
      els.push(section({ y: 620, h: 480, bg: bgColor('#f8fafc') }));
      els.push(...heading({ y: 680, title: 'What we do', titleAr: 'ما نقوم به', sub: 'A partner for every stage of your growth.', subAr: 'شريك في كل مرحلة من مراحل نموّك.' }));
      els.push(...featureRow({
        y: 820,
        accent: a,
        items: [
          { icon: 'TrendingUp', title: 'Growth strategy', titleAr: 'استراتيجية النمو', body: 'Clear plans grounded in data and market insight.', bodyAr: 'خطط واضحة مبنية على البيانات وفهم السوق.' },
          { icon: 'Briefcase', title: 'Operations', titleAr: 'العمليات', body: 'Streamlined processes that scale with your team.', bodyAr: 'عمليات مبسّطة تنمو مع فريقك.' },
          { icon: 'ShieldCheck', title: 'Compliance', titleAr: 'الامتثال', body: 'Stay ahead of regulation with expert guidance.', bodyAr: 'ابقَ متقدماً على الأنظمة بإرشاد الخبراء.' },
        ],
      }));
      els.push(section({ y: 1100, h: 520, bg: bgColor('#ffffff') }));
      els.push(...heading({ y: 1160, title: 'Our packages', titleAr: 'باقاتنا' }));
      els.push(catalog({
        y: 1250,
        h: 330,
        columns: 3,
        items: [
          { title: 'Starter', price: '$490', description: 'For new businesses finding their footing.', image: photo('Starter', '#93c5fd', '#3b82f6', 400, 300) },
          { title: 'Growth', price: '$1,290', description: 'For teams ready to scale operations.', image: photo('Growth', '#60a5fa', '#1d4ed8', 400, 300) },
          { title: 'Enterprise', price: 'Custom', description: 'Tailored programmes with full support.', image: photo('Enterprise', '#1e40af', '#0f172a', 400, 300) },
        ],
      }));
      els.push(...ctaBand({
        y: 1620,
        bg: bgGradient('#1e3a8a', '#1d4ed8'),
        title: 'Ready to move faster?',
        titleAr: 'هل أنت مستعد للانطلاق؟',
        sub: 'Tell us where you want to go — we will map the route.',
        subAr: 'أخبرنا إلى أين تريد الوصول — وسنرسم الطريق.',
        cta: 'Start a project',
        ctaAr: 'ابدأ مشروعاً',
      }));
      els.push(...footer({ y: 1870, text: '© 2026 Northbridge Consulting. All rights reserved.', ar: '© 2026 نورثبريدج للاستشارات. جميع الحقوق محفوظة.' }));
      return assemble('Northbridge Consulting', els);
    },
  },

  {
    id: 'restaurant',
    category: 'restaurant',
    name: 'Restaurant & Café',
    nameAr: 'مطعم ومقهى',
    desc: 'Appetising hero, signature dishes and opening hours for a warm welcome.',
    accent: '#b45309',
    preview: photo('Restaurant', '#7c2d12', '#ea580c', 480, 320),
    build() {
      const a = '#b45309';
      const els = [];
      els.push(...hero({
        y: 0,
        h: 640,
        bg: bgImage(photo('Signature dishes', '#7c2d12', '#0f172a', 1280, 700), 0.62),
        title: 'Authentic flavour, served with love',
        titleAr: 'مذاق أصيل يُقدَّم بحب',
        sub: 'Seasonal ingredients, slow cooking and a warm table. Reserve your spot tonight.',
        subAr: 'مكوّنات موسمية وطهي بطيء ومائدة دافئة. احجز مكانك الليلة.',
        cta: 'Reserve a table',
        ctaAr: 'احجز طاولة',
        cta2: 'View menu',
        cta2Ar: 'اطّلع على القائمة',
        accent: a,
        textColor: '#ffffff',
        subColor: '#fed7aa',
      }));
      els.push(...navbar(0, { brand: 'Olive & Ember', brandAr: 'أوليف وإمبر', phoneValue: '+1 (555) 220-8080', textColor: '#ffffff', accent: '#ea580c', cta: 'Order online', ctaAr: 'اطلب أونلاين' }));
      els.push(section({ y: 640, h: 560, bg: bgColor('#fffbf5') }));
      els.push(...heading({ y: 700, title: 'From our kitchen', titleAr: 'من مطبخنا', sub: 'Hand-made daily, from dough to dessert.', subAr: 'يُحضَّر يدوياً يومياً، من العجين إلى الحلوى.' }));
      els.push(catalog({
        y: 800,
        h: 360,
        columns: 3,
        items: [
          { title: 'Wood-fired pizza', price: '$14', description: 'San Marzano tomatoes, fior di latte, basil.', image: photo('Pizza', '#f97316', '#b45309', 400, 300) },
          { title: 'Slow braised lamb', price: '$26', description: 'Six hours in red wine with root vegetables.', image: photo('Lamb', '#92400e', '#450a0a', 400, 300) },
          { title: 'Pistachio dessert', price: '$11', description: 'House-made, with rose and honey.', image: photo('Dessert', '#fcd34d', '#b45309', 400, 300) },
        ],
      }));
      els.push(section({ y: 1200, h: 520, bg: bgColor('#0f172a') }));
      els.push(...heading({ y: 1260, title: 'A room to remember', titleAr: 'قاعة لا تُنسى', sub: 'Warm lighting, private dining and a chef’s table.', subAr: 'إضاءة دافئة وغرف خاصة وطاولة الشيف.', color: '#ffffff', subColor: '#cbd5e1' }));
      els.push(image({ x: PAD, y: 1370, w: (W - PAD * 2 - 24) / 2, h: 300, src: photo('Dining room', '#b45309', '#0f172a', 600, 400), radius: 18 }));
      els.push(image({ x: PAD + (W - PAD * 2 - 24) / 2 + 24, y: 1370, w: (W - PAD * 2 - 24) / 2, h: 300, src: photo('Chef’s table', '#ea580c', '#7c2d12', 600, 400), radius: 18 }));
      els.push(...contactBlock({
        y: 1740,
        accent: a,
        items: [
          { icon: 'MapPin', title: 'Visit us', titleAr: 'زُرنا', body: '12 Market Street\nDowntown, CA 90210', bodyAr: '١٢ شارع ماركت\nوسط المدينة، كاليفورنيا' },
          { icon: 'Phone', title: 'Call us', titleAr: 'اتصل بنا', body: '+1 (555) 220-8080', bodyAr: '+1 (555) 220-8080' },
          { icon: 'Clock', title: 'Opening hours', titleAr: 'ساعات العمل', body: 'Tue – Sun, 5pm – 11pm', bodyAr: 'الثلاثاء – الأحد، ٥م – ١١م' },
        ],
      }));
      els.push(...footer({ y: 1980, text: '© 2026 Olive & Ember. Crafted in our kitchen.', ar: '© 2026 أوليف وإمبر. من مطبخنا.', bg: '#7c2d12', color: '#fed7aa' }));
      return assemble('Olive & Ember', els);
    },
  },

  {
    id: 'portfolio',
    category: 'portfolio',
    name: 'Portfolio & CV',
    nameAr: 'أعمال شخصية',
    desc: 'A bold personal showcase for designers, developers and creatives.',
    accent: '#7c3aed',
    preview: photo('Portfolio', '#4c1d95', '#a78bfa', 480, 320),
    build() {
      const a = '#7c3aed';
      const els = [];
      els.push(section({ y: 0, h: 700, bg: bgColor('#0b0b14') }));
      els.push(logo({ x: PAD, y: 40, value: 'LINA KHOURY', ar: 'لينا خوري', color: '#ffffff' }));
      els.push(phone({ x: W - PAD - 300, y: 48, value: 'hello@linakhoury.design', color: '#a78bfa' }));
      els.push(text({
        x: PAD,
        y: 200,
        w: 820,
        h: 230,
        value: 'Brand & interface designer',
        ar: 'مصمّمة هوية وواجهات',
        style: { color: '#ffffff', fontSize: 72, fontWeight: 800, lineHeight: 1.08 },
      }));
      els.push(text({
        x: PAD,
        y: 450,
        w: 640,
        h: 90,
        value: 'I help founders turn rough ideas into brands people trust and products people love.',
        ar: 'أساعد المؤسسين على تحويل الأفكار إلى علامات يثق بها الناس ومنتجات يحبونها.',
        style: { color: '#a1a1aa', fontSize: 20, lineHeight: 1.5 },
      }));
      els.push(button({ x: PAD, y: 570, w: 240, h: 60, value: 'See my work', ar: 'شاهد أعمالي', bg: a, color: '#ffffff', radius: 14 }));
      els.push(section({ y: 700, h: 640, bg: bgColor('#111119') }));
      els.push(...heading({ y: 760, title: 'Selected projects', titleAr: 'مشاريع مختارة', color: '#ffffff', subColor: '#a1a1aa' }));
      const gw = (W - PAD * 2 - 24) / 2;
      const shots = [
        ['Fintech app', '#6d28d9', '#312e81'],
        ['Coffee brand', '#b45309', '#7c2d12'],
        ['Editorial site', '#0f766e', '#134e4a'],
        ['Travel platform', '#0369a1', '#1e3a8a'],
      ];
      shots.forEach(([label, from, to], i) => {
        const x = PAD + (i % 2) * (gw + 24);
        const y = 860 + Math.floor(i / 2) * 230;
        els.push(image({ x, y, w: gw, h: 200, src: photo(label, from, to, 600, 400), radius: 16 }));
      });
      els.push(section({ y: 1340, h: 460, bg: bgColor('#faf5ff') }));
      els.push(...heading({ y: 1400, title: 'How I work', titleAr: 'كيف أعمل', sub: 'Three steps, no surprises.', subAr: 'ثلاث خطوات، بلا مفاجآت.' }));
      els.push(...featureRow({
        y: 1530,
        accent: a,
        items: [
          { icon: 'Compass', title: 'Discover', titleAr: 'الاستكشاف', body: 'Interviews and research to find the real problem.', bodyAr: 'مقابلات وبحث للوصول إلى المشكلة الحقيقية.' },
          { icon: 'PenTool', title: 'Design', titleAr: 'التصميم', body: 'Identity, interface and a system your team can use.', bodyAr: 'هوية وواجهة ونظام يستطيع فريقك استخدامه.' },
          { icon: 'Rocket', title: 'Ship', titleAr: 'الإطلاق', body: 'Handover, documentation and launch support.', bodyAr: 'تسليم وتوثيق ودعم عند الإطلاق.' },
        ],
      }));
      els.push(...ctaBand({
        y: 1800,
        bg: bgGradient('#4c1d95', '#7c3aed'),
        title: 'Let’s build something worth remembering',
        titleAr: 'لنصنع شيئاً يستحق التذكّر',
        sub: 'Currently booking projects for next quarter.',
        subAr: 'أستقبل حالياً مشاريع للربع القادم.',
        cta: 'Get in touch',
        ctaAr: 'تواصل معي',
      }));
      els.push(...footer({ y: 2050, text: '© 2026 Lina Khoury. All rights reserved.', ar: '© 2026 لينا خوري. جميع الحقوق محفوظة.', bg: '#0b0b14' }));
      return assemble('Lina Khoury — Portfolio', els);
    },
  },

  {
    id: 'saas',
    category: 'saas',
    name: 'SaaS & Startup',
    nameAr: 'برمجيات وشركات ناشئة',
    desc: 'Product hero, feature grid and transparent pricing plans.',
    accent: '#0ea5e9',
    preview: photo('SaaS', '#0c4a6e', '#38bdf8', 480, 320),
    build() {
      const a = '#0ea5e9';
      const els = [];
      els.push(...hero({
        y: 0,
        h: 620,
        bg: bgGradient('#0c4a6e', '#0ea5e9'),
        title: 'Ship your product faster',
        titleAr: 'أطلق منتجك بشكل أسرع',
        sub: 'One platform for your team to plan, build and measure. No more scattered tools.',
        subAr: 'منصة واحدة لفريقك للتخطيط والبناء والقياس. لا مزيد من الأدوات المتفرقة.',
        cta: 'Start free trial',
        ctaAr: 'ابدأ التجربة المجانية',
        cta2: 'Book a demo',
        cta2Ar: 'احجز عرضاً',
        accent: a,
        textColor: '#ffffff',
        subColor: '#e0f2fe',
        align: 'center',
      }));
      els.push(...navbar(0, { brand: 'Flowdesk', brandAr: 'فلو ديسك', phoneValue: '+1 (555) 400-9090', textColor: '#ffffff', accent: '#ffffff', cta: 'Sign in', ctaAr: 'تسجيل الدخول' }));
      els.push(section({ y: 620, h: 520, bg: bgColor('#f8fafc') }));
      els.push(...heading({ y: 680, title: 'Everything your team needs', titleAr: 'كل ما يحتاجه فريقك', sub: 'Powerful alone, better together.', subAr: 'قوي بمفرده، وأفضل معاً.' }));
      els.push(...featureRow({
        y: 820,
        accent: a,
        items: [
          { icon: 'Zap', title: 'Automations', titleAr: 'الأتمتة', body: 'Trigger workflows without writing code.', bodyAr: 'شغّل سير العمل دون كتابة كود.' },
          { icon: 'BarChart3', title: 'Live analytics', titleAr: 'تحليلات فورية', body: 'Dashboards that update in real time.', bodyAr: 'لوحات تُحدَّث لحظياً.' },
          { icon: 'Users', title: 'Team spaces', titleAr: 'مساحات الفريق', body: 'Granular roles and shared workspaces.', bodyAr: 'أدوار دقيقة ومساحات مشتركة.' },
          { icon: 'ShieldCheck', title: 'Enterprise ready', titleAr: 'جاهز للمؤسسات', body: 'SSO, audit logs and 99.9% uptime.', bodyAr: 'تسجيل دخول موحّد وسجلات وتشغيل ٩٩.٩٪.' },
        ],
      }));
      els.push(section({ y: 1140, h: 600, bg: bgColor('#ffffff') }));
      els.push(...heading({ y: 1200, title: 'Simple, honest pricing', titleAr: 'تسعير بسيط وواضح', sub: 'Start free. Upgrade when you grow.', subAr: 'ابدأ مجاناً. وارتقِ عند النمو.' }));
      els.push(catalog({
        y: 1300,
        h: 360,
        columns: 3,
        items: [
          { title: 'Free', price: '$0', description: 'Up to 3 projects and 2 seats.', image: photo('Free', '#bae6fd', '#38bdf8', 400, 300) },
          { title: 'Pro', price: '$29', description: 'Unlimited projects, 20 seats.', image: photo('Pro', '#38bdf8', '#0ea5e9', 400, 300) },
          { title: 'Business', price: '$99', description: 'SSO, audit logs and priority support.', image: photo('Business', '#0284c7', '#0c4a6e', 400, 300) },
        ],
      }));
      els.push(...ctaBand({
        y: 1740,
        bg: bgGradient('#0c4a6e', '#0284c7'),
        title: 'Try Flowdesk free for 14 days',
        titleAr: 'جرّب فلو ديسك مجاناً ١٤ يوماً',
        sub: 'No credit card required.',
        subAr: 'لا حاجة لبطاقة ائتمانية.',
        cta: 'Create account',
        ctaAr: 'أنشئ حساباً',
      }));
      els.push(...footer({ y: 1990, text: '© 2026 Flowdesk. All rights reserved.', ar: '© 2026 فلو ديسك. جميع الحقوق محفوظة.' }));
      return assemble('Flowdesk', els);
    },
  },

  {
    id: 'store',
    category: 'store',
    name: 'Online Store',
    nameAr: 'متجر إلكتروني',
    desc: 'A clean shopfront with best sellers, shipping promises and returns.',
    accent: '#0f766e',
    preview: photo('Store', '#134e4a', '#2dd4bf', 480, 320),
    build() {
      const a = '#0f766e';
      const els = [];
      els.push(section({ y: 0, h: 72, bg: bgColor('#0f172a') }));
      els.push(...navbar(0, { brand: 'Harbour Goods', brandAr: 'هيربر جودز', phoneValue: '+1 (555) 700-1122', textColor: '#ffffff', accent: '#14b8a6', cta: 'Cart (0)', ctaAr: 'السلة (٠)' }));
      els.push(section({ y: 72, h: 480, bg: bgImage(photo('New season', '#0f766e', '#0f172a', 1280, 600), 0.55) }));
      els.push(text({ x: 0, y: 200, w: W, h: 90, value: 'New season essentials', ar: 'أساسيات الموسم الجديد', style: { color: '#ffffff', fontSize: 54, fontWeight: 800, align: 'center' } }));
      els.push(text({ x: W / 2 - 400, y: 300, w: 800, h: 50, value: 'Everyday pieces made to last, delivered in 48 hours.', ar: 'قطع يومية مصنوعة لتدوم، تُشحن خلال ٤٨ ساعة.', style: { color: '#ccfbf1', fontSize: 19, align: 'center' } }));
      els.push(button({ x: W / 2 - 120, y: 380, w: 240, h: 60, value: 'Shop now', ar: 'تسوّق الآن', bg: '#14b8a6', color: '#ffffff', radius: 14 }));
      els.push(section({ y: 552, h: 560, bg: bgColor('#ffffff') }));
      els.push(...heading({ y: 610, title: 'Best sellers', titleAr: 'الأكثر مبيعاً', sub: 'Loved by thousands of customers.', subAr: 'محبوبة من آلاف العملاء.' }));
      els.push(catalog({
        y: 700,
        h: 380,
        columns: 4,
        items: [
          { title: 'Linen shirt', price: '$58', description: 'Breathable, relaxed fit.', image: photo('Shirt', '#99f6e4', '#0d9488', 400, 400) },
          { title: 'Canvas tote', price: '$34', description: 'Heavyweight cotton.', image: photo('Tote', '#5eead4', '#0f766e', 400, 400) },
          { title: 'Wool scarf', price: '$46', description: 'Soft merino blend.', image: photo('Scarf', '#2dd4bf', '#115e59', 400, 400) },
          { title: 'Leather belt', price: '$52', description: 'Full-grain, hand-finished.', image: photo('Belt', '#134e4a', '#0f172a', 400, 400) },
        ],
      }));
      els.push(section({ y: 1112, h: 440, bg: bgColor('#f0fdfa') }));
      els.push(...featureRow({
        y: 1210,
        accent: a,
        items: [
          { icon: 'Truck', title: 'Free shipping', titleAr: 'شحن مجاني', body: 'On every order over $75.', bodyAr: 'لكل طلب يزيد عن ٧٥ دولاراً.' },
          { icon: 'RefreshCw', title: 'Easy returns', titleAr: 'إرجاع سهل', body: '30 days, no questions asked.', bodyAr: '٣٠ يوماً دون أي أسئلة.' },
          { icon: 'ShieldCheck', title: 'Secure checkout', titleAr: 'دفع آمن', body: 'Encrypted payments you can trust.', bodyAr: 'مدفوعات مشفّرة تثق بها.' },
        ],
      }));
      els.push(...footer({ y: 1552, text: '© 2026 Harbour Goods. Free returns within 30 days.', ar: '© 2026 هيربر جودز. إرجاع مجاني خلال ٣٠ يوماً.', bg: '#0f172a' }));
      return assemble('Harbour Goods', els);
    },
  },

  {
    id: 'agency',
    category: 'agency',
    name: 'Creative Agency',
    nameAr: 'وكالة إبداعية',
    desc: 'High-impact studio site for branding and campaign work.',
    accent: '#e11d48',
    preview: photo('Agency', '#881337', '#fb7185', 480, 320),
    build() {
      const a = '#e11d48';
      const els = [];
      els.push(section({ y: 0, h: 680, bg: bgColor('#0a0a0a') }));
      els.push(logo({ x: PAD, y: 40, value: 'STUDIO NOVA', ar: 'ستوديو نوفا', color: '#ffffff' }));
      els.push(phone({ x: W - PAD - 320, y: 48, value: '+1 (555) 909-4455', color: '#fb7185' }));
      els.push(text({ x: PAD, y: 190, w: 900, h: 250, value: 'We make brands impossible to ignore', ar: 'نصنع علامات يستحيل تجاهلها', style: { color: '#ffffff', fontSize: 68, fontWeight: 800, lineHeight: 1.06 } }));
      els.push(text({ x: PAD, y: 460, w: 660, h: 80, value: 'Brand, digital and campaign work for companies that refuse to blend in.', ar: 'أعمال الهوية والمنصات الرقمية والحملات لشركات ترفض أن تكون عادية.', style: { color: '#a1a1aa', fontSize: 20, lineHeight: 1.5 } }));
      els.push(button({ x: PAD, y: 560, w: 250, h: 62, value: 'Start a project', ar: 'ابدأ مشروعاً', bg: a, color: '#ffffff', radius: 14 }));
      els.push(section({ y: 680, h: 520, bg: bgColor('#ffffff') }));
      els.push(...heading({ y: 740, title: 'What we do', titleAr: 'ما نقوم به', align: 'left' }));
      els.push(...featureRow({
        y: 880,
        accent: a,
        items: [
          { icon: 'Palette', title: 'Brand identity', titleAr: 'هوية العلامة', body: 'Naming, logo systems and guidelines.', bodyAr: 'التسمية وأنظمة الشعار والإرشادات.' },
          { icon: 'Monitor', title: 'Web design', titleAr: 'تصميم الويب', body: 'Sites that convert visitors into customers.', bodyAr: 'مواقع تحوّل الزوار إلى عملاء.' },
          { icon: 'Megaphone', title: 'Campaigns', titleAr: 'الحملات', body: 'Launches that earn attention and press.', bodyAr: 'إطلاقات تجذب الانتباه والصحافة.' },
        ],
      }));
      els.push(section({ y: 1200, h: 620, bg: bgColor('#0a0a0a') }));
      els.push(...heading({ y: 1260, title: 'Recent work', titleAr: 'أعمال حديثة', color: '#ffffff', subColor: '#a1a1aa' }));
      const gw = (W - PAD * 2 - 24) / 2;
      [['Rebrand', '#e11d48', '#881337'], ['App launch', '#7c3aed', '#312e81'], ['Campaign', '#f59e0b', '#b45309'], ['Packaging', '#0f766e', '#134e4a']].forEach(([label, from, to], i) => {
        const x = PAD + (i % 2) * (gw + 24);
        const y = 1360 + Math.floor(i / 2) * 230;
        els.push(image({ x, y, w: gw, h: 200, src: photo(label, from, to, 600, 400), radius: 16 }));
      });
      els.push(...ctaBand({
        y: 1820,
        bg: bgGradient('#881337', '#e11d48'),
        title: 'Got a bold idea?',
        titleAr: 'لديك فكرة جريئة؟',
        sub: 'We take on a handful of projects each quarter.',
        subAr: 'نعمل على عدد محدود من المشاريع كل ربع سنة.',
        cta: 'Talk to us',
        ctaAr: 'تحدّث إلينا',
      }));
      els.push(...footer({ y: 2070, text: '© 2026 Studio Nova. All rights reserved.', ar: '© 2026 ستوديو نوفا. جميع الحقوق محفوظة.', bg: '#0a0a0a' }));
      return assemble('Studio Nova', els);
    },
  },

  {
    id: 'health',
    category: 'health',
    name: 'Clinic & Health',
    nameAr: 'عيادة وصحة',
    desc: 'Calm, reassuring layout with services, team and appointment booking.',
    accent: '#0284c7',
    preview: photo('Clinic', '#075985', '#7dd3fc', 480, 320),
    build() {
      const a = '#0284c7';
      const els = [];
      els.push(section({ y: 0, h: 72, bg: bgColor('#ffffff') }));
      els.push(...navbar(0, { brand: 'Cedar Clinic', brandAr: 'عيادة سيدار', phoneValue: '+1 (555) 600-7788', textColor: '#0f172a', accent: a, cta: 'Book now', ctaAr: 'احجز الآن' }));
      els.push(section({ y: 72, h: 520, bg: bgColor('#f0f9ff') }));
      els.push(text({ x: PAD, y: 200, w: 620, h: 180, value: 'Care you can count on, close to home', ar: 'رعاية تثق بها قريبة من منزلك', style: { color: '#0f172a', fontSize: 52, fontWeight: 800, lineHeight: 1.12 } }));
      els.push(text({ x: PAD, y: 390, w: 560, h: 70, value: 'Same-day appointments with doctors who listen. Book online in under a minute.', ar: 'مواعيد في نفس اليوم مع أطباء يسمعونك. احجز أونلاين في أقل من دقيقة.', style: { color: '#475569', fontSize: 19, lineHeight: 1.5 } }));
      els.push(button({ x: PAD, y: 480, w: 230, h: 60, value: 'Book appointment', ar: 'احجز موعداً', bg: a, color: '#ffffff', radius: 14 }));
      els.push(image({ x: PAD + 660, y: 170, w: W - PAD - (PAD + 660), h: 340, src: photo('Our team', '#7dd3fc', '#0369a1', 500, 400), radius: 20 }));
      els.push(section({ y: 592, h: 500, bg: bgColor('#ffffff') }));
      els.push(...heading({ y: 650, title: 'Our services', titleAr: 'خدماتنا', sub: 'Expert care across every stage of life.', subAr: 'رعاية متخصصة في كل مرحلة من العمر.' }));
      els.push(...featureRow({
        y: 790,
        accent: a,
        items: [
          { icon: 'Stethoscope', title: 'General practice', titleAr: 'الطب العام', body: 'Check-ups, screening and referrals.', bodyAr: 'فحوصات وتقييمات وتحويلات.' },
          { icon: 'HeartPulse', title: 'Cardiology', titleAr: 'أمراض القلب', body: 'Heart health monitoring and advice.', bodyAr: 'متابعة صحة القلب والاستشارة.' },
          { icon: 'Baby', title: 'Pediatrics', titleAr: 'طب الأطفال', body: 'Gentle care for your little ones.', bodyAr: 'رعاية لطيفة لأطفالك.' },
        ],
      }));
      els.push(section({ y: 1092, h: 460, bg: bgColor('#f8fafc') }));
      els.push(...heading({ y: 1150, title: 'Visit us', titleAr: 'زُرنا', sub: 'Walk in or book ahead — we are open seven days.', subAr: 'تفضل بالزيارة أو احجز مسبقاً — نفتح سبعة أيام.' }));
      els.push(...contactBlock({
        y: 1290,
        accent: a,
        items: [
          { icon: 'MapPin', title: 'Address', titleAr: 'العنوان', body: '88 Cedar Avenue\nSpringfield, IL', bodyAr: '٨٨ جادة سيدار\nسبرينغفيلد' },
          { icon: 'Phone', title: 'Reception', titleAr: 'الاستقبال', body: '+1 (555) 600-7788', bodyAr: '+1 (555) 600-7788' },
          { icon: 'Clock', title: 'Open hours', titleAr: 'ساعات العمل', body: 'Mon – Sun, 8am – 8pm', bodyAr: 'الاثنين – الأحد، ٨ص – ٨م' },
        ],
      }));
      els.push(...footer({ y: 1552, text: '© 2026 Cedar Clinic. Registered healthcare provider.', ar: '© 2026 عيادة سيدار. مزوّد رعاية صحية معتمد.', bg: '#0c4a6e', color: '#bae6fd' }));
      return assemble('Cedar Clinic', els);
    },
  },
];

export const TEMPLATE_CATEGORIES = [
  'business',
  'restaurant',
  'portfolio',
  'saas',
  'store',
  'agency',
  'health',
];

export function listTemplates() {
  return TEMPLATES.map((t) => ({
    id: t.id,
    category: t.category,
    name: t.name,
    nameAr: t.nameAr,
    desc: t.desc,
    accent: t.accent,
    preview: t.preview,
  }));
}

export function getTemplate(id) {
  const found = TEMPLATES.find((t) => t.id === id);
  return found ? found.build() : null;
}
