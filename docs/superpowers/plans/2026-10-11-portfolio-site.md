# josephmills.dev Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a fast, single-page Astro portfolio at josephmills.dev, modelled on hussinaltaee.com, with light/dark themes and per-project screenshots and video.

**Architecture:** Static Astro site. Page copy lives in one typed data file (`src/data/site.ts`); projects are a Markdown content collection with a Zod-validated media list. Three small vanilla TS scripts (theme, nav highlight, gallery) are the only client JS. Output in `dist/` is served by Cloudflare Workers static assets.

**Tech Stack:** Node 24, Astro 7.3.8, TypeScript 6.0.3, @astrojs/check 0.9.10, @astrojs/sitemap 3.7.4, Fontsource (Space Grotesk, IBM Plex Sans, IBM Plex Mono 5.3.0), Vitest 5.0.3, @playwright/test 1.64.0, linkinator 8.1.0, lighthouse 13.5.0, wrangler 4.149.0.

**Spec:** `docs/superpowers/specs/2026-10-11-portfolio-site-design.md`

## Global Constraints

- Node 24 (`.nvmrc` = `24`). Local Node 22.14 is too old for lighthouse; run `nvm install 24 && nvm use 24` first.
- All dependency versions pinned exactly (`npm install --save-exact`), lockfile committed, installs via `npm ci`.
- Client JS limited to theme toggle, gallery, nav highlighting. No UI framework, no CSS framework.
- Fonts self-hosted via Fontsource; no request to fonts.googleapis.com at runtime.
- Accent is teal: light `#0F766E`, dark `#2DD4BF`. Full token table is in the spec and is copied verbatim into `tokens.css`.
- All text/background token pairs ≥ 4.5:1 contrast (WCAG AA).
- Clips: MP4, muted, looping, `playsinline`, poster frame, each file < 25 MiB; no autoplay under `prefers-reduced-motion: reduce`.
- YouTube embeds use `https://www.youtube-nocookie.com/embed/<id>` and load only on click.
- Canonical URL `https://josephmills.dev`. OG image 1200×630.
- Optional fields (links, media, stats, portrait) render nothing when absent — no empty wrappers, no dead buttons.
- Every placeholder copy string in `site.ts` and project files carries a `// DRAFT` (TS) or `<!-- DRAFT -->` (Markdown) marker so they can be found with `grep -rn DRAFT src`.
- Lighthouse ≥ 95 in all four categories, mobile and desktop.

## Review Focus

1. **Narrow screens (375 px) with long content** — long titles, many chips/stat badges must wrap; page never scrolls horizontally. Test in Task 3 and Task 4.
2. **`localStorage` unavailable** (Safari private mode, blocked storage throws on access) — theme still follows the system and the toggle still works for the session, with no console error. Test in Task 2.
3. **JavaScript disabled** — all content readable, theme follows `prefers-color-scheme` via CSS alone, card media still visible. Test in Task 2 and Task 4.
4. **`prefers-reduced-motion: reduce`** — clips don't autoplay, smooth scrolling off. Test in Task 4.
5. **Project with only required fields** (no media, links, stats) — shows the placeholder panel and no empty badge row or link row. Test in Task 4.

---

## File Map

| Path | Responsibility |
| --- | --- |
| `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `wrangler.jsonc` | Build/runtime config |
| `vitest.config.ts`, `playwright.config.ts` | Test runners |
| `src/styles/tokens.css` | Colour tokens, light + dark + no-JS dark fallback |
| `src/styles/global.css` | Reset, typography, grid background, shared primitives (`.chip`, `.pill`, `.btn`, `.card`, `.label`) |
| `src/layouts/BaseLayout.astro` | `<head>` (SEO, fonts, theme-init inline script), body shell |
| `src/scripts/theme.ts` | Theme resolution + toggle |
| `src/scripts/nav.ts` | Active-section highlighting |
| `src/scripts/gallery.ts` | Lightbox logic |
| `src/data/site.ts` | All non-project copy and links, typed `SiteConfig` |
| `src/content/schema.ts` | `projectSchema(image)` factory (testable outside Astro) |
| `src/content.config.ts` | `projects` collection; adds fixtures when `PORTFOLIO_FIXTURES=1` |
| `src/content/projects/*.md` | The four projects |
| `src/components/*.astro` | One component per section + `SectionHeader`, `ProjectCard`, `MediaFrame`, `Gallery`, `ThemeToggle` |
| `src/pages/index.astro` | Composes sections |
| `tests/unit/*.test.ts` | Vitest |
| `tests/e2e/*.spec.ts` | Playwright against `astro preview` |
| `tests/fixtures/projects/*.md`, `tests/fixtures/clip.mp4` | Fixture projects exercising every media type and the minimal case |
| `scripts/lighthouse.mjs` | Lighthouse gate |

---

### Task 1: Scaffold Astro project and test tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `wrangler.jsonc`, `vitest.config.ts`, `playwright.config.ts`, `src/pages/index.astro`, `tests/e2e/smoke.spec.ts`
- Modify: `.gitignore` (add `test-results/`, `playwright-report/`, `.astro/`, `.wrangler/`)

**Interfaces:**
- Produces npm scripts used by every later task: `dev`, `build`, `preview` (port 4321), `check` (`astro check`), `test:unit` (`vitest run`), `test:e2e` (`playwright test`), `test` (unit then e2e).
- Playwright `webServer`: `PORTFOLIO_FIXTURES=1 npm run build && npm run preview`, `baseURL` `http://localhost:4321`; projects `mobile` (375×812) and `desktop` (1280×800), Chromium only.

- [ ] **Step 1:** `nvm install 24 && nvm use 24`; write `.nvmrc` = `24`. Scaffold manually (not `create-astro`, so nothing unpinned sneaks in): `npm init -y`, then `npm install --save-exact astro@7.3.8 @astrojs/sitemap@3.7.4 @fontsource/space-grotesk@5.3.0 @fontsource/ibm-plex-sans@5.3.0 @fontsource/ibm-plex-mono@5.3.0` and `npm install --save-exact -D typescript@6.0.3 @astrojs/check@0.9.10 vitest@5.0.3 @playwright/test@1.64.0 linkinator@8.1.0 lighthouse@13.5.0 wrangler@4.149.0`, then `npx playwright install chromium`. Set `"type": "module"` and `"engines": { "node": ">=24" }`.
- [ ] **Step 2:** `astro.config.mjs`: `site: 'https://josephmills.dev'`, `output: 'static'`, `integrations: [sitemap()]`. `tsconfig.json` extends `astro/tsconfigs/strict`. `wrangler.jsonc`: `name: "josephmills-dev"`, `compatibility_date: "2026-10-01"`, `assets: { directory: "./dist", not_found_handling: "404-page" }`.
- [ ] **Step 3: Write failing smoke test** `tests/e2e/smoke.spec.ts` → `test('home page renders the name')`: `goto('/')`, expect `page.locator('h1')` to contain text `Joseph Mills`, expect `page` to have title matching `/Joseph Mills/`.
- [ ] **Step 4:** Run `npm run test:e2e` → FAIL (no index page / no h1).
- [ ] **Step 5:** Minimal `src/pages/index.astro` with `<title>Joseph Mills</title>` and `<h1>Joseph Mills</h1>`.
- [ ] **Step 6:** Run `npm run check && npm run test:e2e` → both pass on mobile and desktop projects.
- [ ] **Step 7: Commit** — `chore: scaffold Astro site with Vitest and Playwright`.

---

### Task 2: Theme tokens, base layout, and theme toggle

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/scripts/theme.ts`, `src/components/ThemeToggle.astro`, `tests/unit/theme.test.ts`, `tests/unit/contrast.test.ts`, `tests/e2e/theme.spec.ts`
- Modify: `src/pages/index.astro` (use `BaseLayout`)

**Interfaces:**
- Produces: `type Theme = 'light' | 'dark'`; `resolveTheme(stored: string | null, prefersDark: boolean): Theme`; `readStoredTheme(storage: Pick<Storage,'getItem'> | null): string | null` (returns null if access throws); `writeStoredTheme(storage, theme): void` (swallows throws); storage key `'theme'`.
- Produces: `BaseLayout` props `{ title: string; description: string; ogImage?: string }`; `<html data-theme="light|dark">` is set by an inline `is:inline` script in `<head>` before any stylesheet paints.
- Produces CSS primitives later tasks use: `.container` (max-width 1200px, 24px side padding, 16px under 480px), `.label` (mono uppercase accent with leading 24px rule), `.pill`, `.chip`, `.btn`, `.btn--primary`, `.btn--ghost`, `.card`, `.stat` — and the tokens `--bg --bg-raised --grid --text --heading --muted --border --accent --accent-soft`.

- [ ] **Step 1: Write failing unit tests** `tests/unit/theme.test.ts`:
  - `resolveTheme('dark', false)` → `'dark'`; `resolveTheme('light', true)` → `'light'`; `resolveTheme(null, true)` → `'dark'`; `resolveTheme('garbage', false)` → `'light'`.
  - `readStoredTheme({ getItem() { throw new Error('denied') } })` → `null`; `readStoredTheme(null)` → `null`.
  - `writeStoredTheme({ setItem() { throw new Error('denied') } }, 'dark')` does not throw.
- [ ] **Step 2: Write failing contrast test** `tests/unit/contrast.test.ts` → reads `src/styles/tokens.css`, parses `--name: #hex` per theme block, asserts WCAG contrast ≥ 4.5 for (`--text`,`--bg`), (`--text`,`--bg-raised`), (`--heading`,`--bg`), (`--muted`,`--bg`), (`--muted`,`--bg-raised`), (`--accent`,`--bg`), (`--accent`,`--accent-soft`) in both light and dark. (Implement the relative-luminance formula in the test file.)
- [ ] **Step 3:** `npm run test:unit` → FAIL.
- [ ] **Step 4:** Implement `theme.ts` and `tokens.css` with the spec's token table. `tokens.css` structure: light values on `:root`; dark values under `[data-theme="dark"]` **and** under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` so no-JS visitors get dark too. If any pair fails contrast, adjust that value minimally and note it in the commit message.
- [ ] **Step 5:** `npm run test:unit` → PASS.
- [ ] **Step 6: Write failing e2e** `tests/e2e/theme.spec.ts`:
  - `test('follows system dark preference')`: `colorScheme: 'dark'`, `goto('/')` → `html` has `data-theme="dark"`.
  - `test('toggle persists across reload')`: click `getByRole('button', { name: /switch to dark theme/i })` → `data-theme="dark"`; reload → still dark; button name now matches `/switch to light theme/i`.
  - `test('no flash: theme set before first paint')`: `addInitScript` storing `theme='dark'` in localStorage; on `goto`, evaluate in a `DOMContentLoaded`-registered init script that records `document.documentElement.dataset.theme` → `'dark'`.
  - `test('works when localStorage throws')`: `addInitScript` redefining `window.localStorage` getter to throw; collect `pageerror` events; click toggle → theme flips; zero page errors.
  - `test('no-JS falls back to system theme')`: new context `javaScriptEnabled: false, colorScheme: 'dark'` → computed `background-color` of `body` equals `rgb(17, 20, 23)` (`#111417`).
- [ ] **Step 7:** Run → FAIL.
- [ ] **Step 8:** Implement `BaseLayout.astro` (imports Fontsource CSS for Space Grotesk 500/600/700, Plex Sans 400/500/600/400-italic, Plex Mono 400/500/600; imports `global.css`; inline head script uses the same logic as `resolveTheme`, kept to a few lines), `global.css` (grid background via two `linear-gradient`s on `body` using `--grid`, 32px cells; `scroll-behavior: smooth` only inside `@media (prefers-reduced-motion: no-preference)`), and `ThemeToggle.astro` (button with sun/moon inline SVGs, `aria-label` "Switch to dark theme"/"Switch to light theme", script imports `theme.ts`).
- [ ] **Step 9:** `npm run check && npm test` → PASS.
- [ ] **Step 10: Commit** — `feat: add theme tokens, base layout, and light/dark toggle`.

---

### Task 3: Site data, nav, and static sections

**Files:**
- Create: `src/data/site.ts`, `src/components/Nav.astro`, `src/components/SectionHeader.astro`, `src/components/Hero.astro`, `src/components/About.astro`, `src/components/Skills.astro`, `src/components/Beyond.astro`, `src/components/Contact.astro`, `src/components/Footer.astro`, `src/scripts/nav.ts`, `src/assets/portrait-placeholder.svg`, `public/resume.pdf`, `tests/e2e/sections.spec.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces `SiteConfig` (exported type) and `site: SiteConfig`:
  ```ts
  interface Link { label: string; href: string }
  interface SiteConfig {
    name: string; initials: string; tagline: string; status: string; summary: string;
    portrait?: ImageMetadata; location: string;
    resume?: string;                       // '/resume.pdf'
    about: string[];                       // paragraphs
    glance: { label: string; value: string; href?: string }[];
    skills: { group: string; items: string[] }[];
    beyond: { title: string; text: string }[];
    contact: { blurb: string; email: string; links: (Link & { kind: 'email' | 'linkedin' | 'github' })[] };
  }
  ```
- Section ids (nav targets): `about`, `skills`, `projects`, `beyond`, `contact`. `SectionHeader` props `{ id: string; label: string; title: string; intro?: string }`.

- [ ] **Step 1: Write failing e2e** `tests/e2e/sections.spec.ts`:
  - `test('all sections present and linked from nav')`: for each id above, `#id` is visible and nav has `a[href="#id"]`.
  - `test('hero shows status, tagline, and actions')`: text `Open to Winter 2027 co-ops`; text `Software Engineer · AI/ML · Calgary`; link `View projects` href `#projects`; link `Download résumé` href `/resume.pdf`.
  - `test('active nav link follows scroll')` (desktop only): scroll `#skills` into view → nav link `#skills` has `aria-current="true"`.
  - `test('no horizontal scroll')`: `document.documentElement.scrollWidth <= window.innerWidth` (runs on both projects; this is Review Focus 1).
  - `test('portrait placeholder when no photo')`: hero figure contains `img` with alt `Portrait placeholder`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Write `site.ts` with draft copy drawn from the spec and Joseph's repos: status `Open to Winter 2027 co-ops`, tagline `Software Engineer · AI/ML · Calgary`, location `Calgary, AB` (DRAFT — confirm), email/LinkedIn as obvious DRAFT placeholders (`hello@josephmills.dev`, `https://www.linkedin.com/in/` + DRAFT note), GitHub `https://github.com/JD-D3V`. Skill groups: Languages (Python, TypeScript, JavaScript, Go, C#, C++, Rust, C, SQL), AI/ML (LangGraph, RAG, Qdrant, pgvector, Gemini API, PyTorch, ONNX), Web (Astro, Next.js, FastAPI, Node.js, HTML/CSS), Systems (Chromium builds, Windows packaging, ESP32 firmware), Cloud & Tools (AWS, Docker, Cloudflare, Git, GitHub Actions, PostgreSQL) — all DRAFT. Two DRAFT `beyond` entries. Mark every placeholder with `// DRAFT`.
- [ ] **Step 4:** Implement components to match the reference layout (hero two-column ≥ 900px, stacked below with portrait first; About grid `2fr 1fr` collapsing to one column; Skills cards in `repeat(auto-fill, minmax(300px, 1fr))`). `nav.ts`: IntersectionObserver sets `aria-current="true"` on the matching nav link; nav collapses to a horizontally scrollable link row under 720px (no hamburger). `public/resume.pdf`: a one-page placeholder PDF reading "Résumé coming soon — josephmills.dev" (generate with any local tool; keep < 10 KB). Portrait placeholder SVG: `JM` monogram on the grid, 4:5 aspect.
- [ ] **Step 5:** `npm run check && npm test` → PASS.
- [ ] **Step 6: Commit** — `feat: add hero, about, skills, beyond, contact sections`.

---

### Task 4: Projects collection, cards, and media frames

**Files:**
- Create: `src/content/schema.ts`, `src/content.config.ts`, `src/content/projects/{boring-web-browser,beyonder,water-temp-monitor,calgary-watermain-agent}.md`, `src/assets/projects/boring-web-browser/{browsing,welcome,ntp-light,protection-dark,settings-menu}.png`, `src/components/Projects.astro`, `src/components/ProjectCard.astro`, `src/components/MediaFrame.astro`, `tests/fixtures/projects/{zz-fixture-all-media,zz-fixture-minimal}.md`, `tests/fixtures/clip.mp4`, `tests/unit/schema.test.ts`, `tests/e2e/projects.spec.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces `projectSchema(image: () => ZodType)` returning a Zod object:
  `title: string`, `order: number`, `category: string`, `tech: string`, `stats: string[]` (default `[]`), `links: { label: string; href: string (url) }[]` (default `[]`), `media: MediaItem[]` (default `[]`) where
  `MediaItem = { type: 'image'; src: Image; alt: string } | { type: 'clip'; src: string (starts with '/media/'); poster: string; alt: string } | { type: 'youtube'; id: string (/^[\w-]{11}$/); alt: string }`.
- `content.config.ts`: `projects` collection via `glob` loader; pattern `src/content/projects/*.md`, plus `tests/fixtures/projects/*.md` when `process.env.PORTFOLIO_FIXTURES === '1'`; entry id = file basename.
- `MediaFrame` props `{ item?: MediaItem; title: string; index: number; projectId: string }` — renders `<button class="media-frame" data-gallery="<projectId>" data-index="<index>">` wrapping the media, or a non-interactive placeholder `<div class="media-frame media-frame--empty">` with the title when `item` is undefined. Task 5 binds to `data-gallery`/`data-index`.

- [ ] **Step 1: Write failing unit tests** `tests/unit/schema.test.ts` (pass `() => z.string()` as the image helper):
  - minimal `{ title, order, category, tech }` parses; `stats`, `links`, `media` default to `[]`.
  - `{ type: 'youtube', id: 'dQw4w9WgXcQ', alt: 'x' }` parses; `id: 'bad'` fails.
  - `{ type: 'clip', src: 'clip.mp4', poster: '/media/p.jpg', alt: 'x' }` fails (src must start with `/media/`).
  - `links: [{ label: 'GitHub', href: 'not a url' }]` fails.
- [ ] **Step 2:** `npm run test:unit` → FAIL. **Step 3:** implement `schema.ts` + `content.config.ts`. **Step 4:** → PASS.
- [ ] **Step 5:** Copy the five screenshots from `JD-D3V/boring-web-browser` `docs/portfolio/images/` (via `gh api repos/JD-D3V/boring-web-browser/contents/docs/portfolio/images/<file> --jq .content | base64 -d`). Write the four project files with DRAFT descriptions drawn from each repo's README/description:
  1. `boring-web-browser` — order 1, category `SHIPPED SOFTWARE`, tech `Chromium · C++ · Python · Windows`, stats `CHROMIUM 153`, `RELEASE 1 SHIPPED`, `SIGNED UPDATES`; links GitHub repo + `Download` → the v153.0.8010.52.1 release page; media: the five screenshots, `browsing.png` first.
  2. `beyonder` — order 2, `AI · MULTI-AGENT`, `LangGraph · Qdrant · FastAPI · Gemini`, stats `~89% TERM CONSISTENCY`, `GLOSSARY-RAG`, `SPOILER-AWARE`; link GitHub.
  3. `water-temp-monitor` — order 3, `IOT · CLOUD`, `ESP32 · AWS · Go · C#`, stats `CELLULAR`, `SMS + VOICE ALERTS`; no links (private).
  4. `calgary-watermain-agent` — order 4, `HACKATHON · AGENT`, `IEEE YP Industry Hackathon 2026`, stats `IEEE YP 2026`, `REPAIR RANKING`; no links (private).
  Fixtures: `zz-fixture-all-media` (order 98: one image reusing a browser screenshot via relative path, one `clip` `/media/fixture/clip.mp4` poster `/media/fixture/poster.jpg`, one `youtube` `dQw4w9WgXcQ`); `zz-fixture-minimal` (order 99: required fields only). Generate `tests/fixtures/clip.mp4` with `ffmpeg -f lavfi -i testsrc=size=320x180:rate=10 -t 1 -pix_fmt yuv420p tests/fixtures/clip.mp4`.
- [ ] **Step 6: Write failing e2e** `tests/e2e/projects.spec.ts` (route `**/media/fixture/**` to serve `tests/fixtures/clip.mp4` and a 1×1 jpeg):
  - `test('real projects render in order')`: first four `article.project h3` texts are `The Boring Web Browser`, `beyonder`, `WaterTempProject`, `calgary-watermain-agent`.
  - `test('private projects have no GitHub link')`: the WaterTempProject and calgary cards contain zero `a` elements with `github.com` hrefs.
  - `test('minimal project has placeholder and no empty rows')`: fixture-minimal card has `.media-frame--empty`, zero `.stat` elements, no `.project__stats` element, no `.project__links` element (Review Focus 5).
  - `test('images are optimised')`: the browser card's `img` `src` ends in `.webp` and has `width`/`height` attributes.
  - `test('clip autoplays muted normally')`: fixture clip `video` has `muted`, `loop`, `playsinline`, `poster`, and `autoplay` attributes.
  - `test('clip does not autoplay with reduced motion')`: context `reducedMotion: 'reduce'` → `video.paused === true` after 1s (Review Focus 4; implement by omitting `autoplay` and calling `play()` from a tiny inline script only when motion is allowed).
  - `test('media visible without JS')`: `javaScriptEnabled: false` → browser card `img` visible (Review Focus 3).
  - `test('no horizontal scroll with projects')` at 375 px (Review Focus 1).
- [ ] **Step 7:** Run → FAIL. **Step 8:** Implement `Projects.astro` (query collection, sort by `order`), `ProjectCard.astro` (media frame → label → `h3` title → tech line → stats row `.project__stats` only if `stats.length` → rendered body → links row `.project__links` only if `links.length`; external links `target="_blank" rel="noopener"`), `MediaFrame.astro` (`image` via `astro:assets` `<Image>` with `format="webp"`, widths for `sizes`; `clip` as `<video>`; `youtube` as a thumbnail `<img src="https://i.ytimg.com/vi/<id>/hqdefault.jpg">` with a play glyph; first frame `loading="eager"` only for the first project, otherwise lazy). Cards: single column, image-left/text-right alternating at ≥ 1000px like the reference.
- [ ] **Step 9:** `npm run check && npm test` → PASS.
- [ ] **Step 10: Commit** — `feat: add projects collection with media frames`.

---

### Task 5: Lightbox gallery and click-to-load YouTube

**Files:**
- Create: `src/scripts/gallery.ts`, `src/components/Gallery.astro`, `tests/unit/gallery.test.ts`, `tests/e2e/gallery.spec.ts`
- Modify: `src/components/Projects.astro` (render one `Gallery` per project with media, serialising its items as JSON in a `<script type="application/json" data-gallery-items="<projectId>">`)

**Interfaces:**
- Consumes: `MediaFrame` `data-gallery` / `data-index` buttons from Task 4.
- Produces: `stepIndex(current: number, delta: number, length: number): number` (wraps both ways); `youtubeEmbedUrl(id: string): string` → `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`.

- [ ] **Step 1: Write failing unit tests** `tests/unit/gallery.test.ts`: `stepIndex(0,-1,5)` → 4; `stepIndex(4,1,5)` → 0; `stepIndex(2,1,5)` → 3; `stepIndex(0,1,1)` → 0; `youtubeEmbedUrl('dQw4w9WgXcQ')` → exact string above.
- [ ] **Step 2:** → FAIL. **Step 3:** implement. **Step 4:** → PASS.
- [ ] **Step 5: Write failing e2e** `tests/e2e/gallery.spec.ts`:
  - `test('opens at clicked item and steps with arrows')`: click browser card media → `dialog[open]` visible, counter text `1 / 5`; press `ArrowRight` → `2 / 5`; press `ArrowLeft` twice → `5 / 5`.
  - `test('Escape closes and returns focus')`: open, press `Escape` → no `dialog[open]`; focused element is the media button that opened it.
  - `test('swipe navigates')` (mobile project): dispatch touchstart/touchend 80px leftward on the dialog → counter advances.
  - `test('YouTube iframe only after click')`: on load, zero `iframe[src*="youtube"]` in the document; open fixture gallery at the youtube item; click play → one `iframe` whose `src` starts with `https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ`.
  - `test('closing stops video')`: open the clip item in the gallery, close → that dialog's `video.paused === true` and youtube iframe removed.
- [ ] **Step 6:** → FAIL. **Step 7:** implement `Gallery.astro` as a native `<dialog>` with prev/next/close buttons (labelled), counter, caption from `alt`; images shown at full optimised width; `gallery.ts` handles click delegation on `[data-gallery]`, keyboard, swipe (threshold 50px), focus return, teardown on close. **Step 8:** `npm run check && npm test` → PASS.
- [ ] **Step 9: Commit** — `feat: add lightbox gallery with click-to-load YouTube`.

---

### Task 6: SEO, social preview, and static assets

**Files:**
- Create: `public/favicon.svg`, `public/og.png`, `public/robots.txt`, `src/pages/404.astro`, `tests/e2e/seo.spec.ts`
- Modify: `src/layouts/BaseLayout.astro`, `src/pages/index.astro`

- [ ] **Step 1: Write failing e2e** `tests/e2e/seo.spec.ts`:
  - `test('meta tags')`: `link[rel=canonical]` href `https://josephmills.dev/`; `meta[name=description]` non-empty; `meta[property="og:image"]` content `https://josephmills.dev/og.png`; `meta[name="twitter:card"]` content `summary_large_image`; `link[rel=icon]` href `/favicon.svg`; `html[lang="en"]`.
  - `test('static files')`: `GET /robots.txt` contains `Sitemap: https://josephmills.dev/sitemap-index.xml`; `GET /sitemap-index.xml` → 200; `GET /og.png` → 200 with `content-type` image/png; `GET /does-not-exist` → body contains `Page not found` and a link to `/`.
  - `test('no Google Fonts requests')`: record all requests during `goto('/')` → none to `fonts.googleapis.com` or `fonts.gstatic.com`.
- [ ] **Step 2:** → FAIL. **Step 3:** Implement: head tags in `BaseLayout`; favicon = `JM` badge in teal; `og.png` 1200×630 (grid background, name, tagline, `josephmills.dev`) rendered once from an SVG with `sharp` (already installed via Astro) in a throwaway command, output committed; simple themed `404.astro`. **Step 4:** `npm run check && npm test` → PASS.
- [ ] **Step 5: Commit** — `feat: add SEO meta, social preview image, robots, 404`.

---

### Task 7: Quality gates (links + Lighthouse)

**Files:**
- Create: `scripts/lighthouse.mjs`
- Modify: `package.json` (scripts `test:links`, `test:lighthouse`, `verify`)

**Interfaces:**
- `npm run verify` = `npm run check && npm test && npm run build && npm run test:links && npm run test:lighthouse` against a production build (no fixtures).

- [ ] **Step 1:** `test:links` = `linkinator dist --recurse --skip "linkedin\\.com"` (linkinator serves `dist/` itself and checks internal and external links; LinkedIn is skipped because it answers bots with 999). Expected after build: `0 broken links`.
- [ ] **Step 2:** `scripts/lighthouse.mjs`: starts `astro preview`, runs Lighthouse (Node API, Chromium from Playwright via `chromium.executablePath()`) for `form-factor` mobile and desktop, prints the four scores per run, exits 1 if any < 0.95.
- [ ] **Step 3:** `npm run build && npm run test:links && npm run test:lighthouse` → record the scores. Fix any finding below 95 (typical: LCP image priority, missing `alt`, contrast, font `display: swap`) and re-run until all pass.
- [ ] **Step 4:** `npm run verify` → exit 0.
- [ ] **Step 5: Commit** — `chore: add link and Lighthouse quality gates`.

---

### Task 8: Docs, push, deploy, and manual verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** README: what the site is; how to run (`nvm use`, `npm ci`, `npm run dev`); **how to edit content** (where `site.ts` and project files live, how to add screenshots / clips / YouTube with a copy-paste media example, `grep -rn DRAFT src` to find placeholders, how to switch the status pill to junior roles); `npm run verify`; deployment.
- [ ] **Step 2:** README "Deploy" section with Cloudflare dashboard steps for Joseph: Workers & Pages → Create → Import a repository → `JD-D3V/josephmills.dev`; build command `npm run build`; deploy command `npx wrangler deploy`; then Settings → Domains & Routes → add `josephmills.dev` and `www.josephmills.dev`; then a Redirect Rule `www.josephmills.dev/*` → `https://josephmills.dev/${1}` (301).
- [ ] **Step 3:** `npm run verify` → exit 0. Commit `docs: add README with content editing and deploy guide`, then `git push origin main`.
- [ ] **Step 4:** Manual browser check against `npm run preview` (and later production): 375 px and desktop, light and dark, toggle + reload (no flash), gallery with keyboard, reduced-motion clip, placeholder media, résumé link, social preview via an OG debugger once live.
- [ ] **Step 5:** After Joseph completes the Cloudflare steps: `curl -sI https://josephmills.dev` → 200; `curl -sI https://www.josephmills.dev` → 301 to apex; run `scripts/lighthouse.mjs` against the production URL.
