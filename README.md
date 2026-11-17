# SiteForge — No-Code Visual Website Builder & Self-Service SaaS

A complete, production-ready platform where a non-technical user can design a website
with the mouse, pay an activation fee, buy hosting through affiliate links, and publish
their site to their own hosting over FTP — all without any human help.

Built with Next.js 14 (App Router), Tailwind CSS, Lucide icons, `basic-ftp` (server-side
publishing) and `jszip` (instant local download).

## Interface language (Arabic / English)

The platform itself is fully bilingual. A segmented EN / ع switch sits in the header of
every screen (landing, builder, publish wizard and Super Admin). Switching:

- flips the whole document direction (`<html dir="rtl">` for Arabic) using logical CSS
  utilities (`ms-`/`me-`, `start`/`end`), so layouts mirror correctly;
- swaps the UI typeface to Cairo for Arabic;
- is saved to `localStorage` and restored before first paint, so there is no flash.

This is separate from the *site content* languages below: those translate the website a
user builds, while this translates the builder and platform screens.

## Features

### Visual builder (`/builder`)
- True WYSIWYG drag-and-drop canvas. Every element (text, icons, buttons, images, logo,
  sections, product catalog) can be moved freely with the mouse.
- Eight resize handles per element (four corners + four edges) for width and height.
- Right-click context menu: delete, duplicate, bring forward, send backward, hide.
- Floating contextual toolbar next to the selected element (no permanent sidebars):
  font family, size, weight, alignment, line height, letter spacing, colours.
- Palette-first colour picker (32 swatches + recent colours). Typing a hex value is
  optional, never required.
- Upload or drag image/video files straight from the computer onto the canvas.
- Background video support for any section or hero.
- Responsive product/photo catalog grid you can add, move, customise or remove.
- Multi-language system: enable any number of languages, add unlimited custom ones, and
  switch direction automatically (RTL for Arabic, Hebrew, Urdu, Persian; LTR otherwise).
- Download the finished site as a zip (`index.html`, `styles.css`, `script.js`).

### Publishing wizard (`/publish`)
1. **Activation fee gate** — a checkout modal for the platform fee (default `$50`,
   configurable by the owner). Ships in mock mode; add live keys to go live.
2. **Hosting & domain hub** — friendly cards for Hostinger, GoDaddy, Namecheap and
   Bluehost, each linking to a configurable affiliate URL, with a short visual guide.
3. **One-click FTP deploy** — a three-field form (domain, FTP host, username/password)
   with helper tooltips. `POST /api/deploy-ftp` connects over FTP and uploads the
   compiled site to `public_html`, then shows a live success screen with the site link.

### Super Admin (`/super-admin`)
Password-protected dashboard to change, without touching code:
- Activation price and currency, plus payment gateway selection.
- Affiliate URLs for the four hosting providers.
- The Gabster assistant embed snippet.
- Sales overview: revenue, paid activations, deployments, websites, and full logs.

The panel is organised into four tabs (General & pricing, Affiliate links, Gabster
chatbot, Deployments log) and is fully bilingual.

### Gabster assistant
A floating chat widget is embedded on the publish pages. It uses the script configured
in the Super Admin panel, and falls back to a built-in helper card linking to gabster.ai.

## Getting started

```bash
npm install
npm run dev      # http://localhost:12000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build on port 12000
npm run lint
```

## Environment variables

All optional. The app runs with sensible defaults out of the box.

| Variable | Purpose | Default |
| --- | --- | --- |
| `SUPER_ADMIN_PASSWORD` | Super Admin login password | `admin123` (change in production) |
| `ADMIN_TOKEN_SECRET` | Secret used to sign admin session tokens | derived from the password |
| `DATA_DIR` | Where settings, sites, orders and deploy logs are stored | `./.data` |

The Super Admin panel shows a warning while the default password is in use.

## Data storage

State is persisted as JSON files under `DATA_DIR` (`settings.json`, `sites.json`,
`orders.json`, `deploys.json`). Swap `lib/store.js` for a database when you need
multi-tenant scale.

## Project structure

```
app/
  api/
    admin/login|settings|overview   # owner dashboard endpoints
    checkout                        # activation fee (mock/live)
    deploy-ftp                      # FTP publishing
    settings|site                   # public site + settings
  builder/  publish/  super-admin/  # the three main screens
components/
  builder/    # Canvas, FloatingToolbar, ElementRenderer, LanguagesModal, topbar
  publish/    # ActivationModal, HostingHub, DeployStep
  ColorPicker.js  GabsterWidget.js
  LanguageProvider.js  LanguageToggle.js   # bilingual UI context + EN/ع switch
lib/
  auth.js     # password check + signed session tokens
  compile.js  # single site compiler shared by download and FTP deploy
  defaults.js # starter site, languages, settings
  i18n.js     # Arabic + English UI dictionary and translator
  icons.js    # curated icon set as raw SVG paths
  store.js    # JSON persistence
```

## Going live

- **Payments**: replace the mock branch in `app/api/checkout/route.js` with a Stripe or
  PayPal charge, then select the gateway in the Super Admin panel.
- **Security**: set `SUPER_ADMIN_PASSWORD` and `ADMIN_TOKEN_SECRET`.
- **FTP**: some hosts use a non-standard port. The deploy form accepts `host:port`
  (for example `ftp.example.com:2121`); port 21 is the default.
