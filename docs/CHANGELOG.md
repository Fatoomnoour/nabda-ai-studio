# NABDA AI — Change Log

## v0.1.6 — Phase 0.8 P01D.4 Completed / P01D.5 Documentation Sync (2026-11-18)

- **Pre-Commit Hygiene (`README.md`):** Removed line 3 trailing whitespace and verified `git diff --cached --check` passed (`EXIT:0`) across all `39` audited files.
- **First Baseline Commit & Push (`main`):** Created `f1f6706ede970c3b5bf6f77c01839228292c0fd4` (`chore: establish clean NABDA frontend baseline v0.1.6`) using repository-local GitHub noreply author configuration (global settings untouched), added `origin` (`https://github.com/NouraElsaman/nabda-ai-mvp.git`), confirmed unauthenticated GitHub REST API returned HTTP `404` (non-public), pushed `main` without `--force`, and verified matching remote `refs/heads/main` SHA (`f1f6706ede970c3b5bf6f77c01839228292c0fd4`).
- **P01D.5 Final Documentation Sync:** Updated milestone headings (`P01D.4 completed / P01D.5 documentation sync`), preserved manual visual QA / `NOT TESTED` / `NOT MEASURED` / `5` `DRAFT` contract notes, and documented next-phase readiness for **P02A** (`feat/api-contract-alignment` -> `feat/frontend-core` / `feat/backend-integrations`) in `docs/PROJECT_HANDOFF.md`, `docs/QA_REPORT.md`, and `docs/CHANGELOG.md`.

## v0.1.6 — Phase 0.8 P01D.2: Pre-Commit Repository Sanitization & Privacy Gate (2026-11-18)

- **Role-Based Sanitization (`AGENTS.md`, `README.md`, `src/lib/api/service.ts`, `docs/**`):** Replaced personal member names and local Windows/backup paths with standardized role identifiers (`Project Lead`, `Frontend Lead`, `Backend Lead`, `Content Reviewer`, `Shared Contract Owner`) while preserving technical contracts, ownership boundaries, and verified test results.
- **Ignore & Asset Privacy Hardening (`.gitignore`):** Added `backups/`, `screenshots/`, `renders/`, `media/`, browser-profile directories, media binaries, and `docs/references/NABDA_Week3_Project_Reference.pdf` (retained untouched locally outside Git tracking because it lists team member names on cover slides). Explicitly preserved `!.env.example` and verified **39** clean untracked candidate files on branch `main` (`0` commits, `0` staged, `0` remotes) ready for staging upon approval.

## v0.1.6 — Phase 0.8 P01D.1: Mobile Visual Sign-off, Security Audit & Backend Handoff Readiness (2026-11-18)

- **Checkpoint:** Milestone backup stored locally outside the repository directory.
- **Manual Visual Mobile Review Recorded (`v0.1.6`):** Documented Frontend Lead screenshot-supported visual approval of responsive layout, NABDA logo, 2×2 homepage workflow, single-line character counter, card proportions, Saudi UI localization, 9:16 storyboard, disabled export state, and instructional-template validation alert (`BROWSER AUTOMATION: NOT TESTED`, `Web Vitals: NOT MEASURED`).
- **Pre-Git Ignore Hygiene (`.gitignore`, `README.md`):** Added auto-generated `next-env.d.ts` to `.gitignore`, verified `0` secrets, and updated `README.md` to reflect the regenerated `package-lock.json` (`npm ci`) and three-branch workflow.
- **Backend Integration Handoff (`docs/BACKEND_HANDOFF.md`, `docs/PROJECT_HANDOFF.md`, `docs/QA_REPORT.md`):** Documented Backend Lead file ownership (`feat/backend-integrations`), REST/Supabase/TTS/Remotion boundaries, Shared Contract Owner `feat/api-contract-alignment` (**P02A**) sequence, Lovable isolation rule, and all 5 unresolved `DRAFT` contract inconsistencies.

## v0.1.6 — Phase 0.8 P01D.0: Final Mobile UX Defect Resolution & Pre-GitHub Acceptance Gate (2026-11-18)

- **Checkpoint:** Pre-P01D.0 backup stored locally outside the repository directory.
- **Mobile Homepage Stepper & Density (`src/components/NabdaWorkspace.tsx`, `src/app/globals.css`):**
  - Converted `.pipe` into a symmetrical 2×2 `.pipe-step` grid (`01 المصدر`, `02 استخراج الحقائق`, `03 السكريبت السعودي`, `04 الاعتماد البشري`) with no floating arrows or extra `فيديو 9:16` badge.
  - Preserved 2×2 `.metrics-grid` down to `320px`/`375px` mobile widths, tightened `.vh-actions` into a 2-column mobile grid, reduced mobile `.source-textarea` min-height to `165px`, and constrained mobile `.video-scene` (`232px`/`224px` max-width).
- **Character Counter & Disabled CTA Affordances (`src/features/content/ContentInput.tsx`, `src/features/video/VideoStudio.tsx`, `src/app/globals.css`):**
  - Added `.char-counter` (`white-space: nowrap; flex-shrink: 0; unicode-bidi: isolate; font-variant-numeric: tabular-nums`) so `0 / 3000` stays on one line across mobile widths.
  - Styled disabled buttons with a muted slate surface and dashed border (removing active green styling), and explicitly disabled `VideoStudio`'s unconnected render CTA.
- **Arabic-First Copy & Instructional Template Integrity (`src/lib/utils/client.ts`, `src/features/script/ScriptStudio.tsx`, `src/features/video/VideoStudio.tsx`, `src/features/review/FinalReview.tsx`, `NabdaWorkspace.tsx`, `ContentInput.tsx`):**
  - Replaced remaining visible English UI badges/statuses (`LOCAL PROTOTYPE`, `MVP Path`, `localStorage`, `SCRIPT STUDIO`, `Hook`, `Body`, `CTA`, `Safe Zone`, `Renderer`, `Not connected`, `Pending`, `Local Only`, `Waiting for AI`, `Fixture`, `EDITORIAL MEMORY`, `API Contract · DRAFT`, `Source Grounding`, `Backend`) with natural Saudi White Arabic.
  - Added `isInstructionalTemplateText` in `src/lib/utils/client.ts` to reject unmodified instructional Hook/CTA prompts in `validateScriptSections` (`reviseScript`/`approveScript`), add `aria-invalid` + `placeholder` guidance in `ScriptStudio`, and prevent placeholder leakage into `VideoStudio` storyboard previews.
- **Regression Tests & Documentation:**
  - Updated `tests/p0-stabilization.test.mjs` (`13/13` PASS) and updated `docs/PROJECT_HANDOFF.md`, `docs/QA_REPORT.md`, and `docs/CHANGELOG.md` for `v0.1.6`.

## v0.1.5 — Phase 0.8 P01C.2: Final Card Proportions, Grid Alignment & RTL/Mobile Stabilization (2026-11-18)

- **Checkpoint:** Pre-P01C.2 backup stored locally outside the repository directory.
- **Homepage Workflow & Card Alignment (`src/components/NabdaWorkspace.tsx`, `src/app/globals.css`):**
  - Removed the extra wrapping `فيديو 9:16` badge from the homepage `كيف تعمل نبضة` `.pipe` strip so it displays a single clean 4-step RTL flow (`المصدر ← استخراج الحقائق ← السكريبت السعودي ← الاعتماد البشري`), leaving `VideoStudio` and video contracts intact.
  - Aligned `.home-bottom` (`آخر المشاريع` and `كيف تعمل نبضة`) with `align-items: stretch`, flex-column internal structure, `.project-list` (up to 3 recent projects), and a matching `.projects-footer` mirroring `.process-footer`.
- **Cross-Screen Paired-Card Alignment (`src/app/globals.css`):**
  - Aligned `.form-layout` (`ContentInput`), `.video-preview-body` (`VideoStudio`), and `.review-grid` (`FinalReview`) via `align-items: stretch` and flexible body regions (`.source-textarea { flex: 1; min-height: 230px }`, `.storyboard-row { flex: 1 }`, `.caption-preview { flex: 1 }`) without brittle fixed heights.
- **Regression Tests & Verification:**
  - Updated `tests/p0-stabilization.test.mjs` to assert the 4-step `.pipe` (absence of `<span>فيديو 9:16</span>`) and `align-items: stretch` across paired card rows (`13/13` PASS).
  - Updated `docs/PROJECT_HANDOFF.md`, `docs/QA_REPORT.md`, and `docs/CHANGELOG.md` for `v0.1.5`.

## v0.1.4 — Phase 0.8 P01C.1: Reference-Grounded Layout Architecture & Component Proportion Refinement (2026-11-18)

- **Checkpoint:** Pre-P01C.1 backup stored locally outside the repository directory.
- Replaced oversized homepage hero with Leader-grounded `.vh` intro, 4-column truthful local KPI row, bordered `.project-row` cards (`<bdi>` + `title` truncation + tags), and `كيف تعمل نبضة`; unified `--sidebar-w: 240px` and `--content-max: 1180px`; aligned `ContentInput` (50/50), `ScriptStudio` (`minmax(0, 1fr) 360px`), `VideoStudio` (side-by-side 9:16 + 4 scenes), and `FinalReview` (`.memory-grid`); cleared bottom-left `N` indicator overlap on `.main-footer`.

## v0.1.3 — Phase 0.8 P01C: Layout Stabilization, Responsive Matrix, RTL & Performance Gate (2026-11-18)

- **Checkpoint:** Pre-P01C backup stored locally outside the repository directory.
- Fixed sidebar footer clipping (`height: 100dvh; max-height: 100dvh; overflow-y: auto; flex-shrink: 0`), added mobile drawer and modal body scroll locking + focus restoration, and converted physical CSS properties to logical RTL equivalents.

## v0.1.2 — Phase 0.8 P01B: Brand Fidelity, Visual/UX Refinement & Saudi Localization (2026-11-17)

- **Checkpoint:** Pre-P01B backup stored locally outside the repository directory.
- Preserved `public/brand/nabda-logo.png` (`8,898` B) and derived `public/brand/nabda-logo-dark.png` (`428×109` RGBA, `2,178` B); fixed `9:16 · 720×1280` BiDi reversal; localized UI and service copy to gender-neutral Saudi White Arabic.

## v0.1.1 — Phase 0.8 P01A: Starter Stabilization & P0 Fixes (2026-11-17)

- Regenerated `package-lock.json` via `npm install` + `npm ci`; resolved ESLint `react-hooks/set-state-in-effect` error (`0` errors, `0` warnings); enforced field-specific and Hook/Body/CTA validation at UI and service boundaries.

## v0.1.0 — Phase 0.8: Frontend starter (2026-11-17)

- Created Next.js App Router + TypeScript + Tailwind starter scaffold with untouched `docs/references/leader-prototype.html` and `public/brand/nabda-logo.png`.
