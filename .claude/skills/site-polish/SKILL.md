---
name: site-polish
description: Audit and fix UI polish on josephmills.dev (motion, popups, transitions, visual design, small interaction details) using the installed frontend-design and Emil Kowalski animation skills, with this repo's tests and constraints. Use when asked to polish, smooth out, redesign, or "make this feel better".
---

# Site polish workflow

Run these phases in order. Each polish pass ends in one PR; never merge or push to `main`.

## 0. Constraints (from the spec and plan, always apply)

- Plain CSS + vanilla TypeScript. No UI framework, no CSS framework, no new npm dependencies (exact-pinned, install scripts denied).
- Client JS is limited to theme toggle, gallery, nav highlighting, clip autoplay. Prefer CSS over JS for motion.
- Colour tokens live in `src/styles/tokens.css`. All text pairs must stay at least 4.5:1 (`tests/unit/contrast.test.ts`).
- Honour `prefers-reduced-motion: reduce` for every transition and animation.
- No-JS must still show all content; Lighthouse stays at or above 95 in all four categories.
- Copy rule: no he/she for Joseph; first person in site copy. Mark placeholder copy `// DRAFT`.
- Taste direction: calm and restrained like hussinaltaee.com (warm off-white, teal accent). Spend boldness in one place. Do not add decoration for its own sake.

## 1. Audit (read-only)

Use these in order and write findings to `.superpowers/sdd/<date>-polish/audit.md` (not committed):

1. `improve-animations` — prioritized motion audit of `src/`.
2. `find-animation-opportunities` — what should animate but doesn't (reject the rest).
3. `animation-performance` — only if something drops frames; animate transform/opacity only.
4. `frontend-design` — for non-motion visual issues (type scale, spacing, density, hierarchy). Keep to the existing design system.

Look at the real site, not just the code: build, run `astro preview`, and screenshot at 375 px and 1280 px in light and dark (built-in browser or Playwright). Check the popups (gallery), photo switching, nav, theme toggle, buttons, cards, scrolling.

## 2. Plan

Pick a small set of HIGH/MEDIUM findings. For each, state the exact values (duration, easing, property). Put easing and duration in tokens (`--ease-out`, `--duration-*`) in `tokens.css` rather than hand-typing curves. Skip anything that fights the constraints above. Confirm scope with Joseph if a change alters the look noticeably.

## 3. Implement (test first)

- New branch `polish/<topic>` from `main`.
- Write a failing Playwright or Vitest test for each behaviour change (stable layout, reduced motion, focus, no leftover elements). Visual-only tweaks need no test but must not break the suite.
- Follow `emil-design-eng` conventions: ease-out for entering, fast (under about 300 ms) UI motion, no animation on keyboard or high-frequency actions, never `ease-in` on UI.

## 4. Review

- Apply `review-animations` standards (`~/.claude/skills/review-animations/STANDARDS.md`) to the diff. It defaults to flagging; fix what it finds.
- Run `npm run verify` (check, unit, e2e, build, links, Lighthouse). Record scores.
- Look at before/after screenshots at both widths and both themes.

## 5. Ship

- Commit with `Co-Authored-By` trailer, push the branch, open a PR describing what changed and what was tested.
- Do not merge. Joseph merges; merging to `main` redeploys via Cloudflare Workers Builds.
