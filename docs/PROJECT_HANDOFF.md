# NABDA AI — Canonical Project Handoff

**Phase:** P02A.2 / P02B.0 (P02A Contracts Merged to `main` via PR #1; `feat/frontend-core` & Controlled Lovable Collaboration Prepared) · **Version:** 0.1.7 · **Date:** 2026-11-18

## Approved architecture

One Next.js App Router + TypeScript + Tailwind application. Future **Supabase PostgreSQL** for application data (not initialized), Gemini/Claude behind server API, verified Saudi TTS, Remotion worker/service, private asset storage. No SQLite, no n8n, no five-agent production system at current phase.

## Canonical workspace

Repository root: `nabda-ai-mvp/` (`<workspace-root>/nabda-ai-mvp/`).
Milestone checkpoints before each frontend hardening pass and the local Week 3 PDF reference (`docs/references/NABDA_Week3_Project_Reference.pdf`, `7.23 MB`) are retained locally outside Git tracking.

## Working frontend source features (static/build verified; live browser QA pending)

- **Contract-Aligned Frontend & Adapters (`v0.1.7` / `P02A`):** Frozen `NabdaService` and domain contracts (`src/lib/contracts/domain.ts`, `src/lib/api/service.ts`, `src/lib/utils/client.ts`) with synchronous `sha256:<hex>` content hashing (`canonicalizeScriptSections` / `computeScriptContentHash`), `baseVersionId` optimistic concurrency (`VERSION_CONFLICT`), `expectedContentHash` approval verification (`CONTENT_HASH_MISMATCH`), `VideoStartInput` alignment on `requestVideoRender`, explicit `"instructional_template"` `ScriptOrigin` + `containsInstructionalPlaceholders` guard, and sample-only `STARTER_STYLE_RULES` chips in `FinalReview`.
- **Reference-Grounded App Shell & Tokens (`v0.1.7`):** `240px` dark-emerald scrollable sidebar (`height: 100dvh; max-height: 100dvh; overflow-y: auto`), `--content-max: 1180px` container, logical RTL properties (`border-inline-end`, `margin-inline-start`, `inset-inline-start/end`), localized header badge (`نسخة تطوير محلية`), consolidated footer (`v0.1.7`), and `Escape`-dismissible mobile drawer with background scroll lock and focus return.
- **Balanced Homepage Dashboard & 2×2 Mobile Stepper:** Compact `.vh` intro header (2-col `.vh-actions` row on mobile), responsive KPI row (4-column desktop -> **2×2 grid down to 320px/375px** with zero 1-column tall stack), and aligned equal-height `.home-bottom` row pairing bordered recent-project cards (`حفظ محلي في المتصفح`) alongside `كيف تعمل نبضة` (`المسار الأساسي`) using a symmetrical **2×2 `.pipe-step` grid** (`01 المصدر`, `02 استخراج الحقائق`, `03 السكريبت السعودي`, `04 الاعتماد البشري` with zero floating arrows or extra `فيديو 9:16` badge).
- **Content Creation (`ContentInput`):** 2-card mode selector (`نص مصدر` vs `فكرة مبدئية`), balanced 50/50 stretched `.form-layout`, mobile-compacted `.source-textarea` (`165px` mobile min-height), non-wrapping RTL-isolated `.char-counter` (`white-space: nowrap; flex-shrink: 0`), field-specific Saudi White Arabic validation (`sourceText` 20–3000 chars, `audience` >= 3 chars), and localized tab labels (`رفع ملف نصي (قريبًا)`).
- **Script Studio (`ScriptStudio`) & Instructional-Template Guard:** Leader-proportioned `minmax(0, 1fr) 360px` layout, fully localized labels/sections (`استوديو السكريبت`, `الخطّاف (الافتتاحية)`, `الفكرة الأساسية (المحتوى)`, `الدعوة للتفاعل (الختام)`), HTML `placeholder` guides, **strict rejection of unmodified instructional templates** (`isInstructionalTemplateText` + `validateScriptSections` blocking `reviseScript`/`approveScript` and flagging `aria-invalid` until replaced with real content), immutable revisions, `"معتمد حاليًا"` vs `"اعتماد سابق"` vs `"غير معتمد"` labels, auto-scrolling exact quote highlights, and `Escape` + scroll-locked approval modal.
- **Video Studio (`VideoStudio`):** `minmax(0, 1fr) 360px` layout with compact mobile `.video-scene` (`232px` on `<=650px`, `224px` on `<=380px`), interactive 4-scene vertical **9:16 (`dir="ltr"` `9:16 · 720×1280`)** storyboard guarded against rendering unmodified instructional placeholder strings, honest static-preview disclosure (`ليست فيديو أو صوتًا مُنتجًا`), localized pipeline/API labels (retaining product names `Azure`, `Remotion`, `MP4`), and explicitly **disabled render CTA** with non-green dashed disabled button styling.
- **Final Review (`FinalReview`):** Aligned `.review-grid` + `.memory-grid`, clearly disabled MP4 export CTA (`disabled={!videoApproved || !asset}`) using high-contrast dashed muted surface (not bright green), and 100% localized status badges (`محلي فقط`, `بانتظار الاعتماد`, `غير متصل`, `بانتظار الذكاء الاصطناعي`, `نموذج جاهز`, `ذاكرة الأسلوب التحريرية`).
- **Saudi White Arabic & Contracts:** Gender-neutral Saudi copy across all UI/util/service files; `LocalDevelopmentService` in `localStorage` and `HttpNabdaService` fail-closed.

## Environment, build & asset status (verified 2026-11-18)

- ✅ Local machine toolchain & lockfile verified: Node.js `v24.17.0`, npm `11.13.0`, Git `2.55.0.windows.3`; complete `package-lock.json` (`lockfileVersion: 3`, `236,637` B) verified via `npm ci`.
- ✅ Original leader HTML (`66b86409...`) and original official logo PNG (`e6e6c401...`, 528×166 RGBA, `8,898` bytes) preserved byte-for-byte.
- ✅ Dark-surface logo derivative `public/brand/nabda-logo-dark.png` (`428×109` RGBA, `2,178` bytes).
- ✅ P02A engineering suite (`npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:contracts`): all exited `0`.
- ✅ **Manual Visual Mobile Review (`v0.1.6` screenshots by Frontend Lead):** **PASS (Screenshot-Supported Manual Review)** — responsive mobile layout, NABDA logo presentation, 4-step `2×2` homepage workflow, single-line `0 / 3000` counter, balanced card proportions, localized Saudi UI, portrait `9:16` storyboard, clear disabled/unavailable video export states, and instructional-template validation error verified visually.
- ✅ **Pre-Git Security, Sanitization, GitHub `main` Baseline & P02A PR Merge:** Zero secrets/names/emails/machine paths; `.env.local` absent; `.env.example` tracked; initial baseline commits `f1f6706` / `3ce96a2` pushed to `https://github.com/NouraElsaman/nabda-ai-mvp.git`; P02A (`v0.1.7`, `e1184d2`) reviewed and **merged into `main` via PR #1** (`bc932b73630b1599e29a68f99cda9467d2c7032a`); `main` synced & re-verified (`4/4` checks PASS); `feat/frontend-core` branched from `bc932b7` with `docs/FRONTEND_UX_HANDOFF.md`.
- ⚠️ Browser Automation QA & Runtime Web Vitals: **BROWSER AUTOMATION: NOT TESTED** / **Runtime Web Vitals: NOT MEASURED** (`chrome_devtools` MCP unattached; optional interactive click-through smoke confirmation from Project Lead, non-blocking cosmetic items deferred to `feat/frontend-core`).
- ℹ️ Auto-generated file notice: running `npm run dev` during P01 audit appended `<!-- BEGIN:nextjs-agent-rules -->` to `AGENTS.md`.

## Verification commands

```powershell
cd nabda-ai-mvp
npm ci
npm run typecheck
npm run lint
npm run build
npm run test:contracts
npm run start
```

Visit `http://localhost:3000` in Chrome to verify the P01D.0 2×2 `.pipe-step` grid, single-line `.char-counter`, distinct muted dashed `:disabled` CTAs, localized Arabic badges/labels, mobile 2×2 KPI density at `375×667`/`320×568`, and rejection of unmodified instructional ScriptStudio templates manually.

## Test truth table

| Test | Status | Evidence / issue |
|---|---|---|
| Original leader reference hash | PASS | SHA-256 matches uploaded source (`66b86409...`) |
| Official original PNG preserved | PASS | `public/brand/nabda-logo.png` (528×166 RGBA, 8,898 B, unchanged) |
| Dark-surface logo derivative PNG | PASS | `public/brand/nabda-logo-dark.png` (428×109 RGBA, 2,178 B) |
| Dependency install (`npm install` & `npm ci`) | PASS | Verified on Node `v24.17.0` / npm `11.13.0` |
| Full TypeScript typecheck | PASS | `npm run typecheck` (`tsc --noEmit`) exited 0 after P02A updates |
| ESLint (`npm run lint`) | PASS | `0 errors, 0 warnings` after P02A updates (`EXIT 0`) |
| Next.js production build | PASS | `npm run build` (Next.js `16.4.6` Turbopack) exited 0 after P02A updates |
| Contract, P0, P01D & P02A regression tests | PASS | `npm run test:contracts` 17/17 PASS (`EXIT 0`, static + isolated mocked `localStorage`, Node `crypto` SHA-256 oracle across ASCII/Arabic/mixed/emoji/CRLF/mutations, `VERSION_CONFLICT`, `CONTENT_HASH_MISMATCH`, mandatory `VideoStartInput.expectedScriptHash`, legacy `localStorage`, `STARTER_STYLE_RULES`) |
| Manual Visual Mobile Review (`v0.1.6`) | PASS (Manual) | Verified by Frontend Lead supplied mobile screenshots (layout, logo, 2×2 `.pipe`, counter, proportions, Arabic copy, storyboard, disabled states, template guard) |
| Browser automation (`chrome_devtools` MCP) | NOT TESTED | `BROWSER AUTOMATION: NOT TESTED` (`DevToolsActivePort` absent on browser profile); never marked PASS |
| Interactive mobile drawer/persistence check | NOT TESTED (Automated) | Optional interactive smoke confirmation from Frontend Lead if any non-visual issues occurred; non-blocking cosmetics defer to `feat/frontend-core` |
| Pre-Git security & `.gitignore` audit | PASS | 0 secrets/names/local paths in 39 tracked files; `.env.local` absent; `.env.example` tracked; backups & PDF ignored |
| First GitHub baseline & `main` push | PASS | Commit `f1f6706ede970c3b5bf6f77c01839228292c0fd4` pushed to `https://github.com/NouraElsaman/nabda-ai-mvp.git` (`refs/heads/main` matches `HEAD`; unauth API HTTP `404`) |
| Runtime Web Vitals (LCP, CLS, INP) | NOT MEASURED | Requires live Chrome DevTools / Lighthouse session on production server |
| Genuine AI/TTS/MP4 backend | NOT IMPLEMENTED | Deferred to P02A/backend per MVP scope |

## Known issues / risks

- Browser Automation (`chrome_devtools` MCP) and Runtime Web Vitals remain unmeasured (`NOT TESTED` / `NOT MEASURED`); visual mobile QA on `v0.1.6` is recorded via Frontend Lead screenshots (`MANUAL VISUAL REVIEW: PASS`). Any additional interactive mobile drawer/keyboard findings can be addressed on `feat/frontend-core`.
- Browser `localStorage` is demonstrative; not a secure backend and not synchronized between devices. Existing browser drafts created prior to `v0.1.6` with unmodified instructional Hook/CTA text are preserved in `localStorage` (not deleted), safely guarded in `VideoStudio`, and blocked from approval in `ScriptStudio`/`service` until replaced.
- Source highlighting only generated for the exact original sample quote spans (`aptitude.ts` fixture).
- Real source checking, Saudi model voice, MP4 render, backend approvals and media export remain `NOT IMPLEMENTED` (`HttpNabdaService` fails closed).
- All five TypeScript/service contract inconsistencies identified before P02A are **resolved and merged into `main`** (`domain.ts`, `client.ts`, `service.ts`, UI callers, `17/17` contract tests), while REST routes `/api/v1/**` in `docs/API_CONTRACT.md` remain `ALL ROUTES DRAFT` pending `feat/backend-integrations` (plus future server concerns: request `Idempotency-Key`, authenticated `session`/RLS enforcement, and fact-warning acknowledgment `FACTS_NEED_REVIEW`).
- Font CSS uses Google Fonts `@import` in `src/app/globals.css` (system fallbacks apply offline).
- `next dev` appended `<!-- BEGIN:nextjs-agent-rules -->` to `AGENTS.md`.
- **Controlled Lovable Collaboration & Branch Protection Finding:** Lovable's GitHub API Connector is **verified for READ-ONLY inspection** of the private `nabda-ai-mvp` repository (`READ-ONLY UX PLANNING READY`). Direct external writes and automatic Git Sync replacement remain disallowed on `main`; additionally, live GitHub REST API inspection showed `branches/main` `protected: false` and `HTTP 403` (`Upgrade to GitHub Pro or make this repository public to enable this feature`) on `/branches/main/protection` and `/rules/branches/main`. Because natural-language prompts cannot restrict a write-scoped GitHub token when server-enforced branch protection is unavailable, conditional feature-branch write testing is deferred until enforceable protection exists, and approved changes should follow: **Lovable UX proposals → Antigravity-controlled patch on `feat/frontend-core` → Tests → PR → Human approval**. See `docs/FRONTEND_UX_HANDOFF.md`.

## Git & GitHub status

- **Repository:** `https://github.com/NouraElsaman/nabda-ai-mvp.git` (`PRIVATE`, confirmed `private: true`, unauthenticated API `HTTP 404`).
- **Merged Contract PR:** PR #1 (`https://github.com/NouraElsaman/nabda-ai-mvp/pull/1`, `feat/api-contract-alignment` → `main`) — `MERGED` at commit `bc932b73630b1599e29a68f99cda9467d2c7032a`.
- **Canonical `main` Baseline:** `bc932b73630b1599e29a68f99cda9467d2c7032a` (local & `origin/main` synchronized; re-validated with `typecheck`, `lint`, `build`, `17/17` `test:contracts`).
- **Historical Contract Branch (preserved):** `feat/api-contract-alignment` at `e1184d2f5e9222e42461e6227d6c527e132c388e`.
- **Active Frontend UX Branch:** `feat/frontend-core` branched directly from merged `main` (`bc932b7`), holding controlled Lovable UX handoff & collaboration policy updates.
- **Planned Backend Branch (ready to start from merged `main`):** `feat/backend-integrations` (Backend Lead).
- **Author Privacy:** Repository-local (`--local`) GitHub noreply privacy identity configured.

## Next phase and pending approvals

1. Frontend Lead + Lovable (read-only analysis + AG-controlled patches on `feat/frontend-core`): execute prioritized UX refinements `UX-01`–`UX-04` per `docs/FRONTEND_UX_HANDOFF.md`, verify `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:contracts`, and open PR to `main` after human review.
2. Backend Lead: branch `feat/backend-integrations` from updated `main` (`bc932b7`) to implement Supabase/Gemini/Azure/Remotion endpoints per `docs/BACKEND_HANDOFF.md` and `docs/API_CONTRACT.md`.
3. Content Reviewer: approve Week 1 Saudi educational source material and dialect evaluation criteria.

**Important:** Agent must obtain explicit human approval before initializing Git, staging/committing, adding remotes, pushing, creating/merging branches, changing main, deleting, deploying, or invoking paid APIs.
