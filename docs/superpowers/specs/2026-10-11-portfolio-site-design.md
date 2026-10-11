# josephmills.dev — Portfolio Site Design

Date: 2026-10-11
Status: Approved in conversation, pending written review

## Purpose

A personal portfolio site for Joseph Mills, a 4th-year student looking for
**Winter 2027 co-op** placements in software engineering, with AI/ML as a
strong secondary interest. If no co-op comes through, the same site is used to
look for junior roles after graduation.

The audience is recruiters and engineers deciding whether to interview Joseph.
Success means: they land on the site, understand within seconds what Joseph does
and what Joseph is looking for, see real shipped work, and can grab the résumé or
get in touch.

The look and structure are modelled on a friend's site,
[hussinaltaee.com](https://hussinaltaee.com/), so the two read as siblings
without being a copy.

## Visual design

Taken from the reference site:

- Single long page, sticky top nav linking to each section plus a Résumé link.
- Warm off-white background with a faint square grid; dark slate text.
- Typography: **Space Grotesk** (headings, 500–700), **IBM Plex Sans** (body),
  **IBM Plex Mono** (labels, tags, pills, buttons, stat badges).
- Small uppercase mono section labels preceded by a short accent rule
  (e.g. `— PROJECTS`), large heading, short intro paragraph.
- Rounded cards with a hairline border, tag "chips" for skills, mono stat
  badges on project cards.

Made Joseph's own:

- **Accent: teal-green** instead of copper.
- Nav wordmark "Joseph Mills" with a small bordered `JM` badge.
- **Light and dark themes.** Default follows `prefers-color-scheme`; a sun/moon
  toggle in the nav overrides it and the choice is remembered in
  `localStorage`. An inline script in `<head>` applies the theme before first
  paint so there is no flash of the wrong theme.

Colour tokens (CSS custom properties on `:root`, overridden under
`[data-theme="dark"]`):

| Token | Light | Dark |
| --- | --- | --- |
| `--bg` | `#F4F3EE` | `#111417` |
| `--bg-raised` (cards) | `#FFFFFF` | `#181C20` |
| `--grid` | `rgba(20,30,40,0.05)` | `rgba(255,255,255,0.04)` |
| `--text` | `#39434F` | `#C9D1D9` |
| `--heading` | `#1A2230` | `#F0F3F6` |
| `--muted` | `#6B7480` | `#8B949E` |
| `--border` | `#E2E0D8` | `#2A3036` |
| `--accent` | `#0F766E` | `#2DD4BF` |
| `--accent-soft` (chip/pill fill) | `#E3F1EE` | `#12302C` |

All text/background pairs must meet WCAG AA contrast (4.5:1 for body text).

## Page sections

1. **Hero** — status pill ("Open to Winter 2027 co-ops", with a small dot),
   name in large Space Grotesk, mono tagline
   ("Software Engineer · AI/ML · Calgary"), one-sentence summary, buttons
   **View projects ↓** (filled accent) and **Download résumé** (outline).
   Right side: framed portrait with a small mono location tag. On narrow
   screens the photo stacks above the name.
2. **About** — 3–4 paragraphs in Joseph's voice beside an **At a glance** card
   (Education, Based in, Focus, GitHub, LinkedIn).
3. **Skills** — "The toolkit I build with": grouped chip cards — Languages,
   AI/ML, Web, Systems, Cloud & Tools. Exact chips come from Joseph's repos and
   résumé.
4. **Projects** — "Selected work", four cards in this order:
   1. **The Boring Web Browser** — de-Googled Chromium build with a custom
      patch layer for blocking and privacy defaults; Release 1 shipped with
      installer and EdDSA-signed updates. Public repo + release link.
   2. **beyonder** — multi-agent LangGraph system for Chinese web-novel
      translation and Q&A, with glossary-RAG over Qdrant. Public repo.
   3. **WaterTempProject** — cellular freeze monitor for a farm pump house:
      ESP32 + AWS (Go, C#) with escalating SMS/voice alerts. Private repo (no
      GitHub link unless made public).
   4. **calgary-watermain-agent** — IEEE YP Industry Hackathon 2026 water-main
      repair-ranking agent. Private repo (same rule).
5. **Beyond** — "Away from the keyboard": 2–3 short hobby cards.
6. **Contact** — "Let's build something." short paragraph, **Email me** and
   **Download résumé** buttons, then Email / LinkedIn / GitHub rows.
7. **Footer** — name, year, "Built with Astro" link to the repo.

## Project cards and media

Each card: media area on top, then category label (mono, accent), title,
tech line, row of stat badges, description, and link buttons.

Media types per project, in display order:

- `image` — screenshot, optimised at build time.
- `clip` — short MP4 (muted, looping, `playsinline`, with a poster frame),
  served from `public/media/`. Each file must stay under 25 MiB (Cloudflare's
  per-asset limit). Clips respect `prefers-reduced-motion` (no autoplay).
- `youtube` — video ID; renders as a thumbnail with a play button and only
  loads the YouTube iframe (`youtube-nocookie.com`) when clicked.

The card shows the first media item. Clicking it opens a **lightbox gallery**
(native `<dialog>`) to step through all items with arrow keys / swipe, close
with Esc. Each item has alt text or a caption. A project with no media shows a
styled placeholder panel (project title on the grid background) rather than a
broken image.

## Content model

- `src/content/projects/*.md` — Astro content collection, one file per project.
  Frontmatter, validated by a Zod schema:
  `title`, `order`, `category`, `tech`, `stats` (string[]),
  `links` ({ label, href }[], optional), `media`
  ({ type: 'image' | 'clip' | 'youtube', src, alt, poster? }[], optional).
  Body is the description in Markdown.
- `src/assets/projects/<slug>/` — screenshots (processed by `astro:assets`).
- `public/media/<slug>/` — MP4 clips and posters.
- `src/data/site.ts` — single typed object holding name, tagline, status pill
  text, hero summary, about paragraphs, at-a-glance facts, skill groups,
  hobbies, and contact links. Changing the pill to "Open to junior roles" is a
  one-line edit here.
- `public/resume.pdf`, portrait in `src/assets/`.

Links and optional fields render only when present.

## Technology

- **Astro** (current stable), static output, TypeScript strict.
- Plain CSS with custom properties, no CSS framework.
- Fonts self-hosted via Fontsource (no Google Fonts request at runtime).
- Client JavaScript limited to: theme toggle, lightbox gallery, active-section
  highlighting in the nav. No UI framework.
- SEO: title, meta description, canonical URL `https://josephmills.dev`,
  Open Graph/Twitter card with a 1200×630 preview image, `sitemap.xml`,
  `robots.txt`, favicon.

## Hosting and deployment

- **Cloudflare Workers with static assets** (`wrangler.jsonc` pointing at
  `./dist`), connected to `github.com/JD-D3V/josephmills.dev` via Workers
  Builds. Pushes to `main` deploy to production; other branches get preview
  URLs.
- Custom domains: `josephmills.dev` (primary) and `www.josephmills.dev`
  redirecting to the apex. HTTPS is automatic (required for `.dev`).
- Steps that need Joseph's Cloudflare login are done by Joseph, with written
  instructions.

## Verification

The site is done when:

- `astro check` and `astro build` pass with no errors or warnings.
- Lighthouse scores ≥ 95 in Performance, Accessibility, Best Practices and SEO,
  on both mobile and desktop profiles, against the production build.
- A link checker finds no broken internal or external links.
- Manual browser check at 375 px and desktop widths, in light and dark themes:
  layout, theme toggle (including no flash on reload), lightbox (keyboard and
  touch), clip playback, YouTube click-to-load, placeholder media.
- Social preview renders correctly (title, description, image).

## Content Joseph supplies

Built with clearly marked draft copy first; Joseph replaces or approves:

- Portrait photo, `resume.pdf`, LinkedIn URL, public contact email, city.
- About text (drafted from Joseph's repos, for Joseph to edit).
- Hobbies for the Beyond section.
- Screenshots and clips for each project.

## Out of scope

Blog, analytics, contact form, multiple pages, CMS. Any can be added later.
