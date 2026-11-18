# NABDA AI — Canonical Project Handoff

**Phase:** 0.8 Starter delivery (P01D.4 completed / P01D.5 documentation sync) · **Version:** 0.1.6 · **Date:** 2026-11-18

## Approved architecture

One Next.js App Router + TypeScript + Tailwind application. Future **Supabase PostgreSQL** for application data (not initialized), Gemini/Claude behind server API, verified Saudi TTS, Remotion worker/service, private asset storage. No SQLite, no n8n, no five-agent production system at current phase.

## Canonical workspace

Repository root: `nabda-ai-mvp/` (`<workspace-root>/nabda-ai-mvp/`).
Milestone checkpoints before each frontend hardening pass and the local Week 3 PDF reference (`docs/references/NABDA_Week3_Project_Reference.pdf`, `7.23 MB`) are retained locally outside Git tracking.

## Working frontend source features (static/build verified; live browser QA pending)

- **Reference-Grounded App Shell & Tokens (`v0.1.6`):** `240px` dark-emerald scrollable sidebar (`height: 100dvh; max-height: 100dvh; overflow-y: auto`), `--content-max: 1180px` container, logical RTL properties (`border-inline-end`, `margin-inline-start`, `inset-inline-start/end`), localized header badge (`نسخة تطوير محلية`), consolidated footer (`v0.1.6`), and `Escape`-dismissible mobile drawer with background scroll lock and focus return.
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
- ✅ P01D engineering suite (`npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:contracts`): all exited `0`.
- ✅ **Manual Visual Mobile Review (`v0.1.6` screenshots by Frontend Lead):** **PASS (Screenshot-Supported Manual Review)** — responsive mobile layout, NABDA logo presentation, 4-step `2×2` homepage workflow, single-line `0 / 3000` counter, balanced card proportions, localized Saudi UI, portrait `9:16` storyboard, clear disabled/unavailable video export states, and instructional-template validation error verified visually.
- ✅ **Pre-Git Security, Sanitization, GitHub Push & `.gitignore` Audit:** Zero secrets, personal names, personal emails, or machine-specific paths in `39` tracked files; `.env.local` absent; `.env.example` tracked; `node_modules/`, `.next/`, `*.tsbuildinfo`, `next-env.d.ts`, backups, renders, and `docs/references/NABDA_Week3_Project_Reference.pdf` ignored via `.gitignore`. Clean baseline commit `f1f6706ede970c3b5bf6f77c01839228292c0fd4` pushed to `https://github.com/NouraElsaman/nabda-ai-mvp.git` (`main` -> `origin/main`).
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
| Full TypeScript typecheck | PASS | `npm run typecheck` (`tsc --noEmit`) exited 0 |
| ESLint (`npm run lint`) | PASS | `0 errors, 0 warnings` across P01D source updates (`EXIT 0`) |
| Next.js production build | PASS | `npm run build` (Next.js `16.4.6` Turbopack) exited 0 |
| Contract, P0 & P01D regression tests | PASS | `npm run test:contracts` 13/13 PASS (`EXIT 0`, static + isolated mocked `localStorage`; does NOT verify live browser DOM) |
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
- Source highlighting only generated for the exact original sample quote spans.
- Real source checking, Saudi model voice, MP4 render, backend approvals and media export are pending.
- Contract inconsistencies for `feat/api-contract-alignment` (**P02A**, `DRAFT` until resolved — see `docs/BACKEND_HANDOFF.md`): `NabdaService.requestVideoRender()` takes `0` arguments vs `VideoStartInput` in `domain.ts`; `reviseScript` lacks `baseVersionId` (`409 VERSION_CONFLICT` in `API_CONTRACT.md`); `approveScript` lacks `expectedContentHash`; `STARTER_STYLE_RULES` in `aptitude.ts` is unused; `prepareDraft` seeds custom-source `hook`/`cta` with instructional prompt text.
- Font CSS uses Google Fonts `@import` in `src/app/globals.css` (system fallbacks apply offline).
- `next dev` appended `<!-- BEGIN:nextjs-agent-rules -->` to `AGENTS.md`.
- Lovable isolation rule: Never connect Lovable or external auto-write tools to canonical `nabda-ai-mvp`. Any future Lovable experiment requires a separate sanitized export.

## Git & GitHub status

- **Baseline Commit:** `f1f6706ede970c3b5bf6f77c01839228292c0fd4` (`f1f6706`, `chore: establish clean NABDA frontend baseline v0.1.6`, `39` sanitized tracked files)
- **Documentation Sync:** P01D.5 synchronizes `docs/PROJECT_HANDOFF.md`, `docs/QA_REPORT.md`, and `docs/CHANGELOG.md` onto `main`
- **Branch & Upstream Tracking:** `main` -> `origin/main`
- **Remote URL:** `https://github.com/NouraElsaman/nabda-ai-mvp.git` (unauthenticated GitHub REST API returned HTTP `404` confirming non-public visibility; `git ls-remote origin refs/heads/main` verified synchronized)
- **Author Privacy:** Committed using repository-local (`--local`) GitHub noreply privacy identity (global Git settings untouched).
- **Planned Future Branches (not created yet):** Shared Contract Owner `feat/api-contract-alignment` (**P02A** contract freeze), Frontend Lead `feat/frontend-core`, Backend Lead `feat/backend-integrations`.

## Next phase and pending approvals

1. Project Lead: verify `Private` badge and configure `main` branch protection rules in the GitHub repository UI.
2. Shared PR (**P02A** on `feat/api-contract-alignment` from clean `main`): align and freeze `domain.ts`, `NabdaService`, and `API_CONTRACT.md` (resolving the `5` `DRAFT` contract mismatches) before `feat/backend-integrations` begins server API implementation.
3. Frontend Lead (`feat/frontend-core`): continue independent UI/UX refinements via Pull Request after `P02A`.
4. Backend Lead (`feat/backend-integrations` from updated `main`) & Content Reviewer: execute server API / Azure TTS / Remotion media proof and approve Week 1 Saudi educational text.

**Important:** Agent must obtain explicit human approval before initializing Git, staging/committing, adding remotes, pushing, creating/merging branches, changing main, deleting, deploying, or invoking paid APIs.
