# NABDA AI — Frontend UX Handoff & Controlled Collaboration Guide

> **Canonical Repository:** `https://github.com/NouraElsaman/nabda-ai-mvp.git` (`PRIVATE`)
> **Target Frontend Branch:** `feat/frontend-core` (branched from merged `main` at `bc932b73630b1599e29a68f99cda9467d2c7032a`, version `v0.1.7`)
> **Primary Owners:** `Frontend Lead` (implementation & PR), `Project Lead` (human approval), `Content Reviewer` (Saudi White Arabic QA)

---

## 1. Framework & Architecture Boundary

- **Stack:** Next.js 16 App Router (`next ^16.1.0`), React 19 (`^19.2.0`), TypeScript (`strict`, `^5.9.0`), Tailwind CSS v4 (`@tailwindcss/postcss ^4.1.0`), `lucide-react` (`^0.468.0`).
- **Frozen Adapter Boundary:** The UI in `NabdaWorkspace.tsx` consumes `createNabdaService()` (`NabdaService` interface in `src/lib/api/service.ts`). In development, `LocalDevelopmentService` persists demo state in browser `localStorage`; `HttpNabdaService` fails closed with `IntegrationNotConfiguredError` until Backend Lead implements `/api/v1/**` on `feat/backend-integrations`.
- **Non-Negotiable Framework Rule:** Refine the **existing Next.js App Router codebase**. Never scaffold a replacement application, never migrate to Vite or TanStack Start, and never bypass `NabdaService` or `src/lib/utils/client.ts` validation/hash helpers.

---

## 2. Official Brand & Design References

- **Authoritative Visual References (Immutable):**
  - `docs/references/leader-prototype.html` (SHA-256 `66b864091cbac93599a14ec727316570b5212ba9886c02ee7beba39fd504c32f`)
  - `docs/references/reference.png`
  - `public/brand/nabda-logo.png` (528×166 RGBA, SHA-256 `e6e6c4017ec4c6d60553778f0df36907900fbe62e4f6354cb62ffb7ade29530f`)
  - `public/brand/nabda-logo-dark.png` (428×109 RGBA dark-surface sidebar wordmark derived directly from the official PNG alpha mask)
- **Color Tokens (`docs/BRAND_GUIDELINES.md` / `src/app/globals.css`):**
  - Deep Emerald Surfaces: `--bg: #061718`, `--bg2: #0A2122`, `--p: #0E2A2B`, `--p2: #123335`, `--g: #0B2A2B`, `--g2: #0F6B55`
  - Accents & Text: `--mint: #3FD1A8`, `--gold: #D4B06A`, `--sand: #F6F3EC`, `--tx: #E9F1EE`, `--mu: #8FB3AA`
- **Typography & Shell Proportions:** `Alexandria` (headings) + `IBM Plex Sans Arabic` (body), `--sidebar-w: 240px` (`100dvh` scrollable), `--content-max: 1180px`, balanced grid/card alignment across all 5 views.

---

## 3. Approved Saudi White Arabic & RTL Rules

- **Saudi White Arabic (`docs/BRAND_GUIDELINES.md`):**
  - Use clear, gender-neutral, action-oriented Saudi White Arabic (`المصدر`, `إنشاء المحتوى`, `السكريبت`, `المراجعة`, `الاعتماد`, `النسخة المعتمدة`, `التعليق الصوتي`, `معاينة الفيديو`, `التصدير`).
  - Avoid Egyptian colloquialisms and unnecessary feminine-only imperatives; do not reintroduce English status badges (`LOCAL PROTOTYPE`, `MVP Path`, `Not connected`, `Pending`, etc.) checked by `tests/p0-stabilization.test.mjs`. Keep real product/track names (`NABDA AI`, `Saudi MIB 2027`, `Azure`, `Remotion`, `MP4`) intact.
- **RTL & BiDi Hygiene:**
  - Keep `<html lang="ar" dir="rtl">` (`src/app/layout.tsx`) and logical CSS (`border-inline-end`, `margin-inline-start`, `inset-inline-start/end`).
  - Isolate directional tokens with `dir="ltr"` / `<bdi dir="ltr">` (`9:16 · 720×1280`, `V1`, `0 / 3000`, `01`–`04` indices, dates/brand strings) and wrap mixed-script project titles in `<bdi>` with single-line ellipsis truncation.

---

## 4. Current Real User Journey (`NabdaWorkspace.tsx`)

1. **Overview (`home`):** Truthful per-browser KPIs (`مشاريع محفوظة محليًا`, `نسخ السكريبت المحررة`, `نسخ معتمدة محليًا`, `ملفات فيديو MP4 منجزة = 00`), `.home-projects` (up to 3 local browser projects), and `كيف تعمل نبضة` (`01 المصدر`, `02 استخراج الحقائق`, `03 السكريبت السعودي`, `04 الاعتماد البشري`).
2. **Content Input (`new` → `ContentInput.tsx`):** Select mode (`نص مصدر` vs `فكرة مبدئية`), enter 20–3000 chars (`sourceText`), audience (`>= 3` chars), content type, dialect, and tone, or load the controlled Week 1 verbal analogy fixture (`مثال: دورة القدرات` → `APTITUDE_SOURCE`).
3. **Script Studio (`script` → `ScriptStudio.tsx`):** Edit Hook/Body/CTA sections, replace instructional placeholder prompts (`isInstructionalTemplateText`) on custom sources, inspect verbatim `SourceFact` quotes (`text.slice(f.start, f.end) === f.quote`), save immutable revisions (`reviseScript` with `baseVersionId`), and record explicit local script approval (`approveScript` bound to canonical SHA-256 `expectedContentHash`) via confirmation modal.
4. **Video Studio (`video` → `VideoStudio.tsx`):** Inspect the 4-scene vertical `9:16 · 720×1280` static storyboard (`الخطّاف`, `المفهوم`, `المثال`, `الخاتمة`) guarded against unmodified instructional placeholders; render CTA remains explicitly disabled (`غير متصل بالخادم`) with honest static-preview disclosure (`ليست فيديو أو صوتًا مُنتجًا`).
5. **Final Review (`final` → `FinalReview.tsx`):** Review local script vs missing server MP4 status, keep MP4 download locked (`disabled={!videoApproved || !asset}`), copy social caption (`APTITUDE_CAPTION` for the sample or awaiting-AI notice otherwise), and add/toggle local `StylePreference` rules (with optional sample-only quick-fill chips from `STARTER_STYLE_RULES`).

---

## 5. File Ownership Matrix (`feat/frontend-core`)

### Allowed Frontend Files (UX Scope Only)
- `src/components/NabdaWorkspace.tsx`
- `src/features/content/ContentInput.tsx`
- `src/features/script/ScriptStudio.tsx`
- `src/features/video/VideoStudio.tsx`
- `src/features/review/FinalReview.tsx`
- `src/app/globals.css`

### Protected Files (NEVER Modify on `feat/frontend-core` or via Lovable)
- `src/lib/contracts/domain.ts` (frozen P02A domain contracts)
- `src/lib/api/service.ts` (frozen `NabdaService`, `LocalDevelopmentService`, fail-closed `HttpNabdaService`)
- `src/lib/utils/client.ts` (`validateContentInput`, `validateScriptSections`, `isInstructionalTemplateText`, `canonicalizeScriptSections`, `computeScriptContentHash`, `getVersionApprovalLabel`)
- `src/lib/fixtures/**` (including `src/lib/fixtures/aptitude.ts`)
- `src/app/api/**`, `supabase/**`, and any server-only provider code
- `docs/API_CONTRACT.md` (`ALL ROUTES DRAFT`)
- `docs/references/leader-prototype.html` (byte-for-byte hash tested)
- `public/brand/nabda-logo.png` & `public/brand/nabda-logo-dark.png`
- `tests/**` (contract tests must continue passing 17/17 without relaxing assertions)
- `.env*` files, secrets, tokens, and `package.json` runtime backend SDKs

---

## 6. Known Missing Services & Product Truth Rules

- **Not Implemented:** Supabase Postgres/Storage, server authentication & RLS, Gemini AI generation/grounding, Azure Saudi TTS (`ar-SA-ZariyahNeural` / `ar-SA-HamedNeural`), Remotion `720×1280` MP4 render worker, genuine `<video>` playback/download, and social publishing.
- **Unmeasured Metrics:** Automated browser QA (`chrome_devtools` MCP) and runtime Web Vitals (`LCP`, `CLS`, `INP`) have not yet been measured in a live browser run (`NOT TESTED` / `NOT MEASURED`).
- **Honesty Guardrail:** Never claim local `localStorage` approvals are tamper-resistant server audits, never label manual templates or fixtures as AI outputs, and never render fake MP4 playback or unverified percentages.

---

## 7. Prioritized Frontend UX Backlog (`UX-01` – `UX-04`)

### `UX-01` · Guided User Journey
- Clarify entry points on `home`, active step context in `.workflow-bar`, and prerequisites when navigating between `المصدر → السكريبت → الفيديو → الاعتماد`.
- Ensure empty states (`empty-projects`) and post-action transitions guide users smoothly without implying live AI/MP4 generation.

### `UX-02` · Form Feedback & Interaction Quality
- Sharpen inline validation clarity (`sourceText` character threshold cues, `audience` feedback, and unsaved-edit vs `CONTENT_HASH_MISMATCH` / `VERSION_CONFLICT` recovery notices in `ScriptStudio`).
- Keep sample-only helper interactions (`APTITUDE_SOURCE`, `STARTER_STYLE_RULES`) clearly distinguished from persisted project data, and preserve disabled dashed CTA styling on gated actions.

### `UX-03` · Premium Lightweight Motion
- Add subtle, GPU-friendly CSS transitions (`opacity`, `transform`) for view changes, active storyboard scene swaps, fact-mark highlights, and toast notifications without layout shift (`CLS`).
- Strictly honor `@media (prefers-reduced-motion: reduce)` and **do not** recreate the deferred decorative multi-agent fake cursors from `leader-prototype.html`.

### `UX-04` · Mobile, Keyboard & Accessibility Acceptance
- Verify responsive stability across `320×568`, `375×667`, `768×1024`, and `1440×900` (keeping 2×2 `.metrics-grid`, 2×2 `.pipe-step`, single-line `.char-counter`, compact `.video-scene`, and zero horizontal overflow).
- Audit full keyboard navigation (`Tab` order, `:focus-visible` outlines), `Escape` handling and focus restoration on both the mobile navigation drawer and script-approval confirmation modal (plus `FocusTrap` / ARIA dialog roles where beneficial), `>= 40px` touch targets, and screen-reader `aria-live` announcements.

---

## 8. Controlled Lovable Collaboration Policy & GitHub Write Assessment

### Three Strictly Distinguished Modes
1. **Mode 1 — GitHub API Read-Only Code Analysis (`VERIFIED & ALLOWED`):** Lovable's GitHub API Connector has already verified read inspection against `NouraElsaman/nabda-ai-mvp` (`main`). Use it strictly to inspect the Next.js 16 files and propose diffs/snippets aligned with sections 2–7 above.
2. **Mode 2 — Conditional Feature-Branch Write Test (`CONDITIONAL — CURRENTLY DEFERRED / UNSAFE`):** Direct write access from Lovable is restricted exclusively to `feat/frontend-core` (never `main`, never force-push) **and requires server-enforced GitHub protection** preventing automated writes to `main`.
3. **Mode 3 — Lovable Independent App Building & Git Sync Replacement (`FORBIDDEN`):** Never enable Lovable's automatic Git Sync repository overwrite, generate a second starter app, convert Next.js 16 to Vite/TanStack Start, or alter protected contracts/backend files.

### Verified GitHub Branch Protection Assessment (2026-11-18)
- Live inspection against `https://api.github.com/repos/NouraElsaman/nabda-ai-mvp`:
  - Repository visibility: `private: true` (`PRIVATE`).
  - `GET /branches/main`: `"protected": false`.
  - `GET /branches/main/protection` & `GET /rules/branches/main`: **`HTTP 403`** (`"Upgrade to GitHub Pro or make this repository public to enable this feature."`).
- **Security Conclusion:** On the current GitHub Free plan for a private repository, automated branch protection and rulesets on `main` are **not enforceable**. Natural-language instructions in Lovable prompts do **not** restrict a broad write-scoped GitHub token from writing to `main`.
- **Active Safe Workflow:** **`READ-ONLY UX PLANNING READY`**. Keep direct external GitHub write access **disabled** until GitHub Pro/Rulesets enforce protection on `main`:
  > **Lovable UX proposals → Antigravity-controlled code patch on `feat/frontend-core` → Local checks + manual/browser QA → Pull Request → Human approval**

### Prerequisites & Procedure for Any Future GitHub Write Capability Test
Before ever authorizing a conditional write test:
1. Ensure GitHub plan supports enforced branch protection or Repository Rulesets blocking direct pushes, force-pushes, and deletions on `main` (verified via API `protected: true` / active ruleset).
2. Confirm a narrow target-branch rule (`feat/frontend-core` only; PR required for `main`).
3. Execute a single harmless documentation/comment test commit on `feat/frontend-core` and verify: commit lands only on `feat/frontend-core`, `main` SHA stays unchanged, protected files remain untouched, and the commit is cleanly revertible or reviewable via PR.

---

## 9. Human Review, Engineering Gates & PR Workflow

Every patch landed on `feat/frontend-core` must pass before PR review:
- `npm run typecheck` (exit 0)
- `npm run lint` (0 errors, 0 warnings)
- `npm run build` (Next.js production build exit 0)
- `npm run test:contracts` (**17/17 PASS** — static, brand, Saudi copy, and P02A contracts intact)
- `git diff --check` + secret/personal-info scan + visual/keyboard/RTL verification (`320px`, `375px`, `1440px`)
- Pull Request from `feat/frontend-core` → `main` reviewed and explicitly approved by `Project Lead` / `Frontend Lead` (never direct push to `main`).

---

## 10. Vercel Preview Readiness Requirements (Future Separate Step)

If `Project Lead` separately approves deploying `feat/frontend-core` for UX preview testing:
- Set **`NEXT_PUBLIC_NABDA_ADAPTER=development`** only.
- Include **zero** server secrets (`GEMINI_API_KEY`, `AZURE_SPEECH_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, tokens) in Vercel environment variables.
- Keep visible preview notices honest (development-only local browser persistence, static storyboard, no live AI/TTS/MP4 backend, no production billing).
