# josephmills.dev

Personal portfolio for Joseph Mills, built to find Winter 2027 co-ops (and junior roles after graduation). A single static [Astro](https://astro.build) page with light and dark themes, a project gallery with screenshots, video clips and YouTube, and almost no client JavaScript (theme toggle, gallery, nav highlighting).

The design spec and implementation plan live in `docs/superpowers/`.

## Run it

Requires Node 24 (`.nvmrc`).

```bash
nvm use
npm ci
npm run dev        # http://localhost:4321
```

Dependencies are pinned to exact versions and install scripts are denied (`allowScripts` in `package.json`), so always install with `npm ci`.

## Edit the content

**Page copy** (name, status pill, summary, about paragraphs, "at a glance", skills, hobbies, contact links) lives in one file: `src/data/site.ts`.

- Switch the status pill to junior roles by editing `status` (for example `'Open to junior roles'`), and update `contact.blurb`.
- Add a photo: put it in `src/assets/`, import it in `site.ts`, and set `portrait`. The placeholder disappears.
- Replace the résumé by overwriting `public/resume.pdf`.
- Find every placeholder that still needs real content:

  ```bash
  grep -rn DRAFT src
  ```

  Placeholders are marked `// DRAFT` in TypeScript and `<!-- DRAFT -->` in Markdown. Delete the marker once the text is final.

**Projects** are Markdown files in `src/content/projects/`, one per project, sorted by `order`. Frontmatter is validated at build time (`src/content/schema.ts`); `stats`, `links` and `media` are optional and render nothing when empty.

A project with every media type, copy-paste ready:

```md
---
title: My Project
order: 5
category: SHIPPED SOFTWARE
tech: Rust · WebAssembly
stats:
  - 10K DOWNLOADS
links:
  - label: GitHub
    href: https://github.com/JD-D3V/my-project
media:
  # Screenshot: put the file in src/assets/projects/my-project/ (optimised at build time)
  - type: image
    src: ../../assets/projects/my-project/main.png
    alt: What the screenshot shows
  # Clip: MP4, under 25 MiB, in public/media/my-project/ (muted, looping, no autoplay for reduced motion)
  - type: clip
    src: /media/my-project/demo.mp4
    poster: /media/my-project/demo.jpg
    alt: What the clip shows
  # YouTube: loads the player only after a click (youtube-nocookie.com)
  - type: youtube
    id: dQw4w9WgXcQ
    alt: What the video shows
---

A short description in Markdown.
```

The card shows the first media item; clicking it opens a lightbox with all of them (arrow keys, swipe, Esc). Private repos: leave out the GitHub link.

## Check it

```bash
npm run verify
```

Runs `astro check`, unit tests (Vitest), end-to-end tests (Playwright, mobile 375 px and desktop, against a build that includes the test fixtures), a production build, a link check (linkinator), and Lighthouse on mobile and desktop (all four categories must be 95 or above). Individual pieces: `npm run check`, `npm test`, `npm run test:links`, `npm run test:lighthouse`.

The first time, install the browser Playwright uses: `npx playwright install chromium`.

## Deploy

The site is hosted on Cloudflare Workers (static assets, see `wrangler.jsonc`), built from this repo by Workers Builds. Pushes to `main` deploy to production; other branches get preview URLs.

One-time setup in the Cloudflare dashboard:

1. **Workers & Pages → Create → Import a repository**, then pick `JD-D3V/josephmills.dev` (authorise the Cloudflare GitHub app if asked).
2. Set the **build command** to `npm run build` and the **deploy command** to `npx wrangler deploy`, then save and deploy.
3. Open the new Worker, then **Settings → Domains & Routes → Add → Custom domain**, and add `josephmills.dev`, then add `www.josephmills.dev` the same way. HTTPS is automatic.
4. Redirect `www` to the apex: **Rules → Redirect Rules → Create rule** (the "Redirect from WWW to root" template works). Match the wildcard request URL `https://www.josephmills.dev/*`, redirect to `https://josephmills.dev/${1}` with status **301**, preserving the query string.

After it is live:

```bash
curl -sI https://josephmills.dev | head -1        # HTTP/2 200
curl -sI https://www.josephmills.dev | head -3    # 301, location: https://josephmills.dev/
node scripts/lighthouse.mjs https://josephmills.dev
```

Then paste the URL into an Open Graph debugger (for example the LinkedIn Post Inspector) to check the social preview.
