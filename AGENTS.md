# AGENTS.md

Repository knowledge for future agent sessions. Read this before making changes.

## What this project is

SiteForge — a no-code visual website builder and self-service SaaS platform. Users
drag-and-drop a site, pay an activation fee, choose hosting via affiliate links, and
publish to their own hosting over FTP. Next.js 14 App Router, Tailwind, no TypeScript.

## Commands

```bash
npm install
npm run dev      # dev server on http://localhost:12000 (the preview port)
npm run build    # production build
npm run lint     # eslint (warnings only by design)
```

The dev server runs on port 12000. The public preview is
`https://work-1-rvojlkonbrpfxbsb.prod-runtime.all-hands.dev`.

## Architecture map

| Path | Role |
| --- | --- |
| `app/page.js` | Marketing landing page (bilingual) |
| `app/builder/page.js` | Builder shell: state, autosave, download, toasts |
| `app/publish/page.js` | 3-step wizard: activate → hosting → deploy |
| `app/super-admin/page.js` | Owner dashboard, 4 tabs, login-gated |
| `components/builder/Canvas.js` | Drag/resize/context-menu canvas, drop handling |
| `components/builder/FloatingToolbar.js` | Contextual per-element toolbar |
| `components/builder/ElementRenderer.js` | Renders one element (also exported `Icon`) |
| `lib/compile.js` | Single site compiler used by BOTH download and FTP deploy |
| `lib/i18n.js` | Arabic + English UI dictionary (`en`/`ar` objects) |
| `lib/store.js` | JSON persistence under `DATA_DIR` (default `./.data`) |
| `lib/auth.js` | Admin password check + HMAC-signed session tokens |

## Two separate language systems — do not confuse them

1. **UI language** (`lib/i18n.js`, `components/LanguageProvider.js`,
   `components/LanguageToggle.js`): translates the builder/platform screens. Persisted in
   `localStorage` under `siteforge.uiLang`. Sets `<html lang dir>`.
2. **Site content languages** (`lib/defaults.js` `LANGUAGES`, `lib/compile.js`
   `languageMeta`/`textFor`, `components/builder/LanguagesModal.js`): translate the website
   the user *builds*. Stored per element in `el.i18n[code].text`.

## Conventions that matter

- **All user-facing strings go through `t('key')`** from `useUiLang()`. Add new keys to
  *both* the `en` and `ar` objects in `lib/i18n.js` — a coverage script in past sessions
  verified exact key parity, keep it that way.
- Nested sub-components (e.g. `Field`, `Menu`, `MenuItem`) receive already-translated
  strings as props, OR must call `useUiLang()` themselves. A previous bug was a nested
  component using `t` without the hook → `ReferenceError: t is not defined`.
- Use **logical** Tailwind utilities for direction-sensitive layout: `ms-`/`me-`,
  `ps-`/`pe-`, `start-`/`end-`, `text-start`/`text-end`. Never `ml-`/`mr-`/`left-`/`right-`
  for content that should mirror in RTL. Absolute-positioned decorative blobs may use
  physical sides.
- For LTR-only content (URLs, code, hex) add `dir="ltr"`.
- `lib/compile.js` is shared by the ZIP download and the FTP deploy. A change there affects
  both paths — test both.
- The site export uses a **single** `index.html` with a client-side language switcher
  (`.lang-bar` buttons carrying `data-code`/`data-dir`), not separate per-language files.

## Testing notes

`npm run test:e2e` runs `tests/e2e.js` (Playwright, declared as a devDependency). It needs a
live dev server; browsers are cached under `~/.cache/ms-playwright`. It covers the bilingual
UI, builder interactions, template gallery + deep links, ZIP export contents, the publish
wizard steps, and the admin logo upload. FTP tests
use `pyftpdlib` (already installed) on port 2121.

The suite toggles settings and then restores them, and it applies a template — so run it
against a scratch `.data` directory if you need the previous site document back.

`next build` overwrites `.next/`, which breaks a concurrently running `next dev`. Restart
the dev server after a production build before running browser tests.

Site state persists server-side in `./.data`, so E2E tests that toggle settings must be
idempotent (check current state before toggling) or they fail on a second run.

## Brand logo & templates

- The owner uploads the platform logo in **Super admin → General → Branding**. It is stored
  as a data URL in settings (`brandLogo`), served by the public `GET /api/settings`, and
  rendered by `components/Brand.js` (`BrandMark` + the `useBrand()` hook, which caches the
  fetch module-wide; call `refreshBrand()` after saving so open pages update).
- `lib/templates.js` holds the template library. `listTemplates()` returns **metadata only**
  (id, category, name, nameAr, desc, accent, preview) — `getTemplate(id)` returns the built
  site document. When adding a field to a template object, remember to surface it in
  `listTemplates()` too, or the gallery silently renders blank names.
- Builder deep links: `/builder?template=<id>` applies that template on load, and
  `/builder?templates=1` opens the gallery. The landing page cards use these.

## Gotchas

- `LanguageProvider` is a **named** export (`import { LanguageProvider }`), not default.
- Lucide has both `TriangleAlert` and `AlertTriangle`; prefer `TriangleAlert`.
- `POST /api/deploy-ftp` takes the port **inside the host string** (`127.0.0.1:2121`), parsed
  by `parseHost()`; there is no separate `port` field, so a local test server on a
  non-standard port must be written as `host:port`.
- Tailwind class order matters for the `btn`/`field`/`surface` component classes defined in
  `app/globals.css` — they are used across the app for consistent styling.

## GitHub

The repository is `samaiagent2026-prog/siteforge` (public). Default branch is `main`; the
same commit also lives on `siteforge-platform`. Pushing from this sandbox needs a classic
PAT with `repo` scope — the environment `GITHUB_TOKEN` returns 403 for repo creation and
pushes. Git smart HTTP wants **Basic** auth, so `Bearer` in `http.extraheader` fails while a
base64 `x-access-token:<pat>` header works:

```bash
git -c http.extraheader="Authorization: Basic $(printf 'x-access-token:%s' "$TOK" | base64 -w0)" push origin HEAD
```

`.gitignore` excludes `node_modules/`, `.next/` and `.data/`; keep it that way so builds and
site state never reach the remote.
