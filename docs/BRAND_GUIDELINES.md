# NABDA AI — Brand and UX Tokens

## Authority

1. User-provided, original **full Nabda transparent logo**, preserved unchanged: `public/brand/nabda-logo.png` (528×166 RGBA, SHA-256 `e6e6c4017ec4c6d60553778f0df36907900fbe62e4f6354cb62ffb7ade29530f`).
2. Faithful dark-surface derivative (P01B): `public/brand/nabda-logo-dark.png` (428×109 RGBA), generated directly from `public/brand/nabda-logo.png` by cropping outer transparent padding (`x: 48..475, y: 35..143`), preserving exact per-pixel alpha transparency, and re-mapping the dark-emerald wordmark to `#E9F1EE` and pulse stroke to `#3FD1A8` while keeping the warm gold dot `#D4B06A`. Created so the wordmark remains crisp directly on the dark emerald sidebar without an oversized cream card.
3. Leader's prototype HTML & screenshot: `docs/references/leader-prototype.html` and `docs/references/reference.png`, CSS tokens on line 10 and font imports on line 8.
4. Original project PDF: `docs/references/NABDA_Week3_Project_Reference.pdf`. Formal brand manual was not provided.

## Source-grounded colors

| Role | Original leader HTML token | Value |
|---|---|---|
| Deep base | `--bg` | `#061718` |
| Secondary base | `--bg2` | `#0A2122` |
| Panel | `--p` | `#0E2A2B` |
| Raised panel | `--p2` | `#123335` |
| Deep green | `--g` | `#0B2A2B` |
| Green | `--g2` | `#0F6B55` |
| Accent gold | `--gold` | `#D4B06A` |
| Accent mint | `--mint` | `#3FD1A8` |
| Sand | `--sand` | `#F6F3EC` |
| Text | `--tx` | `#E9F1EE` |
| Muted | `--mu` | `#8FB3AA` |

Current implementation aligns closely with the leader palette while preserving WCAG-conscious contrast. Do **not** alter or overwrite `public/brand/nabda-logo.png`.

## Type, Layout Proportions & RTL

- Headings: Alexandria (400–800 weights). Body: IBM Plex Sans Arabic (400–700). Loaded via CSS `@import` in `src/app/globals.css` with local system fallbacks if offline.
- Layout tokens (`src/app/globals.css`): `--sidebar-w: 240px` (`220px` at `<=1200px`), `--content-max: 1180px`, `16px` grid gaps, `20px` standard card padding and corner radius, `repeat(4, minmax(0, 1fr))` overview KPI row, `repeat(2, minmax(0, 1fr))` content form, and `minmax(0, 1fr) 360px` studio + sticky inspector layout matching `leader-prototype.html`.
- Use `html lang="ar" dir="rtl"`. Text inputs and editing containers use `direction: rtl`. Numbers, dimensions (`dir="ltr"` on `9:16 · 720×1280`), URLs, codec names, and paths use explicit `dir="ltr"` / `<bdi dir="ltr">` where needed so Unicode BiDi never reverses dimensions or version tags; wrap mixed-script project titles in `<bdi>` with single-line ellipsis truncation.
- Use logical CSS (`border-inline-end`, `margin-inline-start`, `inset-inline-start/end`) and do not swap arrow meanings blindly.
- Prefer comfortable 13–15px body copy, 40–44px minimum touch targets for primary CTAs, consistent `:focus-visible` states, and scrollable `100dvh` sidebar navigation (`overflow-y: auto`) so shorter laptop viewports never clip footer cards.

## Saudi UX Writing & Experience Principles

- **Language & Tone**: Gender-neutral, action-oriented **Saudi White Arabic** matching `leader-prototype.html` and `reference.png`. Avoid Egyptian colloquialisms and unnecessary feminine-only imperatives; keep terminology consistent (`المصدر`, `إنشاء المحتوى`, `السكريبت`, `المراجعة`, `الاعتماد`, `النسخة المعتمدة`, `التعليق الصوتي`, `معاينة الفيديو`, `التصدير`).
- **Workflow**: Source first → review and edit → **explicit human approval** → 9:16 storyboard & real video later. Represent pending backend systems honestly. On mobile: drawer menu (`Escape`-dismissible), one-column editing where needed, readable input areas, and low visual noise. Respect `prefers-reduced-motion`.

## Logo policy

Use `public/brand/nabda-logo.png` as the authoritative original asset (preserved byte-for-byte). On dark emerald surfaces (`#0A2122` sidebar), use `public/brand/nabda-logo-dark.png` (derived directly from the official PNG's pixel alpha mask, never redrawn) alongside the verified leader pulse SVG inside the 9:16 video preview header. Both PNGs display at natural ratio without stretching.
