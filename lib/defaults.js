export const CANVAS_WIDTH = 1280;

export const FONTS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Cairo (Arabic)', value: 'Cairo' },
  { label: 'Tajawal (Arabic)', value: 'Tajawal' },
  { label: 'Almarai (Arabic)', value: 'Almarai' },
  { label: 'System UI', value: 'system-ui' },
];

export const GOOGLE_FONT_FAMILIES = [
  'Inter',
  'Poppins',
  'Montserrat',
  'Playfair+Display',
  'Roboto',
  'Cairo',
  'Tajawal',
  'Almarai',
];

export const TEXT_ALIGNS = ['left', 'center', 'right', 'justify'];

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe', dir: 'ltr' },
  { code: 'ru', label: 'Русский', dir: 'ltr' },
  { code: 'zh', label: '中文', dir: 'ltr' },
  { code: 'hi', label: 'हिन्दी', dir: 'ltr' },
  { code: 'ur', label: 'اردو', dir: 'rtl' },
  { code: 'he', label: 'עברית', dir: 'rtl' },
  { code: 'fa', label: 'فارسی', dir: 'rtl' },
];

export const RTL_CODES = LANGUAGES.filter((l) => l.dir === 'rtl').map((l) => l.code);

export function dirFor(code) {
  const found = LANGUAGES.find((l) => l.code === code);
  return found ? found.dir : 'ltr';
}

let counter = 0;
export function uid(prefix = 'el') {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export const DEFAULT_ELEMENT_STYLE = {
  fontFamily: 'Inter',
  fontSize: 18,
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: 0,
  color: '#111827',
  bg: 'transparent',
  align: 'left',
  radius: 0,
  opacity: 1,
  paddingX: 0,
  paddingY: 0,
  borderWidth: 0,
  borderColor: 'transparent',
  shadow: false,
};

export function makeElement(type, overrides = {}) {
  const base = {
    id: uid(),
    type,
    x: 80,
    y: 120,
    w: 320,
    h: 80,
    z: 5,
    hidden: false,
    content: {},
    style: { ...DEFAULT_ELEMENT_STYLE },
    i18n: {},
  };
  const merged = {
    ...base,
    ...overrides,
    content: { ...base.content, ...(overrides.content || {}) },
    style: { ...base.style, ...(overrides.style || {}) },
    i18n: overrides.i18n || {},
  };
  return merged;
}

function sectionBg(kind, extra = {}) {
  return {
    type: kind,
    color: '#ffffff',
    gradient: { from: '#3b66ff', to: '#1c33e1', angle: 135 },
    src: '',
    videoUrl: '',
    overlay: 0.45,
    ...extra,
  };
}

/**
 * The starter document. Everything the builder can manipulate lives here so the
 * document is a plain, serialisable JSON object that can be exported or deployed.
 */
export function createDefaultSite(name = 'My Website') {
  return {
    version: 1,
    name,
    canvas: { width: CANVAS_WIDTH, minHeight: 900, background: '#ffffff' },
    languages: {
      enabled: ['en'],
      default: 'en',
      custom: [],
    },
    elements: [
      makeElement('section', {
        x: 0,
        y: 0,
        w: CANVAS_WIDTH,
        h: 640,
        z: 0,
        content: {
          bg: sectionBg('gradient', { from: '#3b66ff', to: '#1c33e1', angle: 135 }),
          videoUrl: '',
        },
      }),
      makeElement('logo', {
        x: 64,
        y: 36,
        w: 150,
        h: 52,
        z: 10,
        content: { text: 'SiteForge', src: '' },
        style: { ...DEFAULT_ELEMENT_STYLE, color: '#ffffff', fontSize: 24, fontWeight: 800 },
      }),
      makeElement('phone', {
        x: 900,
        y: 44,
        w: 320,
        h: 40,
        z: 10,
        content: { text: '+1 (555) 010-2030', href: 'tel:+15550102030' },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          color: '#ffffff',
          fontSize: 17,
          fontWeight: 600,
          align: 'right',
        },
      }),
      makeElement('text', {
        x: 64,
        y: 190,
        w: 720,
        h: 130,
        z: 10,
        content: { text: 'Build a stunning website in minutes' },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          color: '#ffffff',
          fontSize: 56,
          fontWeight: 800,
          lineHeight: 1.12,
        },
        i18n: { ar: { text: 'أنشئ موقعاً مذهلاً في دقائق' } },
      }),
      makeElement('text', {
        x: 64,
        y: 340,
        w: 620,
        h: 80,
        z: 10,
        content: {
          text: 'Drag, drop, resize and publish. No code, no developers, no waiting.',
        },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          color: '#e6ecff',
          fontSize: 20,
          fontWeight: 400,
        },
        i18n: {
          ar: { text: 'اسحب، وأفلت، وغيّر الحجم، وانشر. بدون برمجة أو مطورين أو انتظار.' },
        },
      }),
      makeElement('button', {
        x: 64,
        y: 450,
        w: 230,
        h: 62,
        z: 10,
        content: { text: 'Get Started', href: '#' },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          bg: '#ffffff',
          color: '#1c33e1',
          fontSize: 18,
          fontWeight: 700,
          radius: 12,
          align: 'center',
        },
        i18n: { ar: { text: 'ابدأ الآن' } },
      }),
      makeElement('icon', {
        x: 330,
        y: 458,
        w: 46,
        h: 46,
        z: 10,
        content: { icon: 'Sparkles' },
        style: { ...DEFAULT_ELEMENT_STYLE, color: '#ffffff', bg: 'transparent' },
      }),
      makeElement('section', {
        x: 0,
        y: 640,
        w: CANVAS_WIDTH,
        h: 620,
        z: 0,
        content: { bg: sectionBg('color', { color: '#f6f7f9' }), videoUrl: '' },
      }),
      makeElement('text', {
        x: 0,
        y: 700,
        w: CANVAS_WIDTH,
        h: 60,
        z: 5,
        content: { text: 'Our Products' },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          color: '#171923',
          fontSize: 38,
          fontWeight: 800,
          align: 'center',
        },
        i18n: { ar: { text: 'منتجاتنا' } },
      }),
      makeElement('catalog', {
        x: 64,
        y: 790,
        w: 1152,
        h: 420,
        z: 5,
        content: {
          columns: 3,
          items: [
            {
              id: uid('item'),
              title: 'Classic Plan',
              price: '$29',
              description: 'Everything you need to start.',
              image: '',
            },
            {
              id: uid('item'),
              title: 'Business Plan',
              price: '$79',
              description: 'Built for growing teams.',
              image: '',
            },
            {
              id: uid('item'),
              title: 'Enterprise',
              price: '$199',
              description: 'Scale with full support.',
              image: '',
            },
          ],
        },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          bg: 'transparent',
          color: '#171923',
          radius: 16,
        },
      }),
      makeElement('section', {
        x: 0,
        y: 1260,
        w: CANVAS_WIDTH,
        h: 200,
        z: 0,
        content: { bg: sectionBg('color', { color: '#171923' }), videoUrl: '' },
      }),
      makeElement('text', {
        x: 0,
        y: 1340,
        w: CANVAS_WIDTH,
        h: 40,
        z: 5,
        content: { text: '© 2026 SiteForge. All rights reserved.' },
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          color: '#b0b8c8',
          fontSize: 15,
          align: 'center',
        },
        i18n: { ar: { text: '© 2026 سايت فورج. جميع الحقوق محفوظة.' } },
      }),
    ],
  };
}

export function createDefaultSettings() {
  return {
    brandName: 'SiteForge',
    brandLogo: '',
    brandTagline: 'No-code website builder',
    activationPrice: 50,
    currency: 'USD',
    paymentProvider: 'mock',
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    gabsterScript: '',
    affiliates: {
      hostinger: {
        name: 'Hostinger',
        url: 'https://www.hostinger.com/?REFERRALCODE=CHANGE_ME',
        note: 'Cheapest starter hosting with free domain.',
        accent: '#673de6',
      },
      godaddy: {
        name: 'GoDaddy',
        url: 'https://www.godaddy.com/?isc=CHANGE_ME',
        note: 'Largest domain registrar worldwide.',
        accent: '#00a4a6',
      },
      namecheap: {
        name: 'Namecheap',
        url: 'https://www.namecheap.com/?aff=CHANGE_ME',
        note: 'Great value domains and SSL.',
        accent: '#de3723',
      },
      bluehost: {
        name: 'Bluehost',
        url: 'https://www.bluehost.com/?utm_source=CHANGE_ME',
        note: 'Recommended WordPress hosting.',
        accent: '#1c5fa8',
      },
    },
  };
}
