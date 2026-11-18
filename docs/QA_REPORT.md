# NABDA Starter — Actual QA Evidence (Updated 18 November 2026)

Status language: **PASS** = verified by executed test; **FAIL** = executed and failed; **BLOCKED** = could not execute due environment; **NOT TESTED** / **NOT MEASURED** = not attempted in live browser; **NOT IMPLEMENTED** = intentionally deferred.

## P02A.2 / P02B.0 PR Merge, Synchronized `main` & `feat/frontend-core` Preparation (2026-11-18)

### GitHub Closure, Post-Merge `main` & Governance Audit (`v0.1.7`)

- **P02A Pull Request (`#1`):** `https://github.com/NouraElsaman/nabda-ai-mvp/pull/1` (`feat/api-contract-alignment` `e1184d2` → `main`), verified `mergeable: true` / `clean`, `15` changed files, **MERGED** via regular merge commit `bc932b73630b1599e29a68f99cda9467d2c7032a`.
- **Canonical `main` Synchronization:** Fast-forwarded local `main` to `origin/main` (`bc932b73630b1599e29a68f99cda9467d2c7032a`). Post-merge re-execution on `main` passed all 4 checks (`typecheck`, `lint`, `build`, `test:contracts` `17/17 PASS`).
- **Repository Visibility & Branch Protection Check:** Confirmed `private: true` (`visibility: "private"`). REST API `/branches/main` reports `protected: false`; `/branches/main/protection` and `/rules/branches/main` both return `HTTP 403` (`Upgrade to GitHub Pro or make this repository public to enable this feature.`). Direct third-party GitHub writes remain disabled until enforceable protection exists (**`READ-ONLY UX PLANNING READY`**).
- **Frontend Branch:** `feat/frontend-core` created directly from merged `main` (`bc932b7`) with controlled collaboration policy and `docs/FRONTEND_UX_HANDOFF.md`.

---

## P02A Shared API Contract Freeze & Pre-Backend Integration Readiness (2026-11-18)

### Environment & Branch Status

- Workspace: `<workspace-root>/nabda-ai-mvp` (external pre-P02A backup checkpoint stored locally outside repository)
- Node.js: `v24.17.0` | npm: `11.13.0` | Git: `2.55.0.windows.3` (feature branch `feat/api-contract-alignment` at `e1184d2f5e9222e42461e6227d6c527e132c388e`, branched from `3ce96a22c947d5c616a7e7ddfe7d9b4a462daa43`, merged into `main` at `bc932b73630b1599e29a68f99cda9467d2c7032a`)

### Engineering, Contract Freeze & Manual Visual Review Results (`v0.1.7`)

| Check | Status | Actual Output / Evidence |
|---|---|---|
| `npm run typecheck` | PASS | Exit 0 (`tsc --noEmit`) |
| `npm run lint` | PASS | Exit 0 (`eslint .` — 0 errors, 0 warnings) |
| `npm run build` | PASS | Exit 0 (`next build` Next.js `16.4.6` Turbopack static routes `/` and `/_not-found`) |
| `npm run test:contracts` | PASS | Exit 0 — `17/17` subtests across 4 suites (`tests/starter-structure.test.mjs`, `tests/p0-stabilization.test.mjs`), covering 8-category Node `crypto` SHA-256 oracle verification, `VERSION_CONFLICT`, `CONTENT_HASH_MISMATCH`, mandatory `VideoStartInput.expectedScriptHash`, `"instructional_template"` origin, legacy `localStorage` compatibility, and `STARTER_STYLE_RULES` |
| Manual visual mobile review (`v0.1.6` screenshots) | PASS (Manual Visual) | Preserved from Frontend Lead v0.1.6 screenshots (`v0.1.7` UI unchanged visually except optional quick-fill sample rule chips in `FinalReview`) |
| Browser automation (`chrome_devtools` MCP) | NOT TESTED | `BROWSER AUTOMATION: NOT TESTED` — never marked PASS |
| Runtime Web Vitals (LCP, CLS, INP) / Lighthouse | NOT MEASURED | Requires live Chrome DevTools / Lighthouse session on `npm run start` |
| AI, Supabase, TTS, MP4 backend services | NOT IMPLEMENTED | Intentionally deferred (`HttpNabdaService` remains fail-closed; HTTP routes remain `ALL ROUTES DRAFT`) |

---

## P01D.4 Completed / P01D.5 Documentation Sync — GitHub Baseline Verification (2026-11-18)

### Environment & Status

- Workspace: `<workspace-root>/nabda-ai-mvp` (external backups retained locally outside repository)
- Node.js: `v24.17.0` | npm: `11.13.0` | Git: `2.55.0.windows.3` (branch `main` at baseline commit `f1f6706ede970c3b5bf6f77c01839228292c0fd4`, tracking `origin/main` at `https://github.com/NouraElsaman/nabda-ai-mvp.git`)

### Engineering, Security & Manual Visual Review Results (`v0.1.6`)

| Check | Status | Actual Output / Evidence |
|---|---|---|
| `npm run typecheck` | PASS | Exit 0 (`tsc --noEmit`) |
| `npm run lint` | PASS | Exit 0 (`eslint .` — 0 errors, 0 warnings) |
| `npm run build` | PASS | Exit 0 (`next build` Next.js `16.4.6` Turbopack static routes `/` and `/_not-found`) |
| `npm run test:contracts` | PASS | Exit 0 — `13/13` subtests across 3 suites (`tests/starter-structure.test.mjs`, `tests/p0-stabilization.test.mjs`) |
| Manual visual mobile review (`v0.1.6` screenshots) | PASS (Manual Visual) | Supported by Frontend Lead screenshots: responsive layout, NABDA logo, 2×2 homepage workflow, single-line counter, balanced card proportions, Saudi UI, portrait storyboard, disabled export state, instructional-template validation alert |
| Pre-commit sanitization & `.gitignore` audit | PASS | 0 personal names, emails, secrets, or local backup paths in `39` tracked files; `.env.local` absent; `.env.example` tracked; backups, renders, and `docs/references/NABDA_Week3_Project_Reference.pdf` ignored |
| Browser automation (`chrome_devtools` MCP) | NOT TESTED | `BROWSER AUTOMATION: NOT TESTED` — never marked PASS (`DevToolsActivePort` absent on browser profile) |
| Interactive drawer/keyboard/persistence click-through | NOT TESTED (Automated) | Static & unit tests PASS; optional interactive confirmation from Frontend Lead (non-blocking polish defers to `feat/frontend-core`) |
| Runtime Web Vitals (LCP, CLS, INP) / Lighthouse | NOT MEASURED | Requires live Chrome DevTools / Lighthouse session on `npm run start` |
| First baseline commit & GitHub `main` push | PASS | Commit `f1f6706ede970c3b5bf6f77c01839228292c0fd4` pushed to `https://github.com/NouraElsaman/nabda-ai-mvp.git` (`refs/heads/main` matches `HEAD`; public API HTTP `404` non-public) |
| AI, Supabase, TTS, MP4 backend services | NOT IMPLEMENTED | Intentionally deferred pending **P02A** (`feat/api-contract-alignment`) and `feat/backend-integrations` |

---

## P01D.2 Pre-Commit Repository Sanitization & Privacy Gate (2026-11-18)

### Summary

- Sanitized role-based ownership across source comment, `AGENTS.md`, `README.md`, and `docs/**` (`0` secrets, `0` personal names, `0` local backup paths in `39` candidate files), hardened `.gitignore` (`!.env.example` verified tracked; `docs/references/NABDA_Week3_Project_Reference.pdf` excluded locally), and removed trailing whitespace in `README.md` (`git diff --cached --check` exit `0`).

---

## P01D.1 Mobile Visual Sign-off, Pre-Git Security Gate & Backend Handoff Readiness (2026-11-18)

### Summary

- Recorded Frontend Lead screenshot-supported visual sign-off, completed Backend Lead architecture/API handoff in `docs/BACKEND_HANDOFF.md`, added `next-env.d.ts` to `.gitignore`, and kept external backups outside the project root.

---

## P01D.0 Final Mobile UX Defect Resolution & Pre-GitHub Acceptance Gate (2026-11-18)

### Environment

- Workspace: `<workspace-root>/nabda-ai-mvp` (external milestone backup retained locally outside repository)
- Node.js: `v24.17.0` | npm: `11.13.0` | Git: `2.55.0.windows.3` (not initialized)

### Post-P01D.0 Command Results

| Check | Status | Actual Output / Evidence |
|---|---|---|
| `npm run typecheck` | PASS | Exit 0 (`tsc --noEmit`) |
| `npm run lint` | PASS | Exit 0 (`eslint .` — 0 errors, 0 warnings) |
| `npm run build` | PASS | Exit 0 (`next build` Next.js `16.4.6` Turbopack static routes `/` and `/_not-found`) |
| `npm run test:contracts` | PASS | Exit 0 — `13/13` subtests across 3 suites (`tests/starter-structure.test.mjs` and `tests/p0-stabilization.test.mjs`), including P01D.0 template-rejection and localization guards |
| Browser automation (`chrome_devtools` MCP) | NOT TESTED | `BROWSER AUTOMATION: NOT TESTED` — `DevToolsActivePort` missing on user's normal Chrome profile; untouched per safety policy |
| Visual/responsive matrix (`1440×900` to `320×568`) | NOT TESTED | Mobile CSS breakpoints (`<=650px`, `<=380px`), 2×2 `.pipe-step` grid, single-line `.char-counter`, and `:disabled` styles verified statically; live Chrome mobile QA pending |
| Runtime Web Vitals (LCP, CLS, INP) / Lighthouse | NOT MEASURED | Requires manual Chrome DevTools / Lighthouse session on `npm run start` |
| AI, Supabase, TTS, MP4, deploy | NOT IMPLEMENTED | Intentionally deferred per `docs/MVP_SCOPE.md` |

### Root Causes Diagnosed & Fixed in P01D.0

1. **Defect A — Broken mobile `.pipe` wrap (`NabdaWorkspace.tsx`, `globals.css`)**: Replaced flex-wrap pill+arrow flow with a symmetrical 2×2 numbered `.pipe-step` grid (`01 المصدر`, `02 استخراج الحقائق`, `03 السكريبت السعودي`, `04 الاعتماد البشري`), eliminating orphan second-row arrows without reintroducing `فيديو 9:16`.
2. **Defect B — Wrapped `.char-counter` (`ContentInput.tsx`, `globals.css`)**: Added `.char-counter` (`white-space: nowrap; flex-shrink: 0; unicode-bidi: isolate; font-variant-numeric: tabular-nums`) alongside `.input-foot > span:first-child { flex: 1; min-width: 0 }` so `0 / 3000` stays single-line across mobile widths.
3. **Defect C — Ambiguous disabled green CTAs (`globals.css`, `VideoStudio.tsx`)**: Replaced opacity-only disabled styling with explicit muted dashed surface (`rgba(11, 35, 36, 0.72)`, `var(--muted)`, `1px dashed rgba(143, 179, 170, 0.34)`), and permanently disabled the unconnected video render button in `VideoStudio` alongside `FinalReview`'s gated MP4 download button.
4. **Defect D — Unnecessary English badges/statuses**: Replaced visible English UI tokens (`LOCAL PROTOTYPE`, `MVP Path`, `localStorage`, `SCRIPT STUDIO`, `Hook`, `Body`, `CTA`, `Safe Zone`, `Renderer`, `Not connected`, `Pending`, `Local Only`, `Waiting for AI`, `Fixture`, `EDITORIAL MEMORY`, `API Contract · DRAFT`, `Source Grounding`, `Backend`) with gender-neutral Saudi White Arabic while preserving real technical/competition names (`NABDA AI`, `Saudi MIB 2027`, `Azure`, `Remotion`, `MP4`).
5. **Defect E — Mobile density (`globals.css`)**: Preserved 2×2 `.metrics-grid` down to `@media (max-width: 380px)` (removing `1fr` collapse), added 2-column mobile `.vh-actions`, compacted mobile `.source-textarea` (`165px`), and prevented `.video-scene` full-width blow-up (`232px`/`224px` max-width).
6. **Content Integrity — Instructional-template leakage (`src/lib/utils/client.ts`, `ScriptStudio.tsx`, `VideoStudio.tsx`)**: Added `isInstructionalTemplateText` to block unmodified Hook/CTA prompt strings from saving/approving and to guard `VideoStudio` storyboard cards without deleting existing `localStorage` records.

---

## P01C.2, P01C.1, P01C, P01B & P01A History Summary

- **P01C.2 (`v0.1.5`, 2026-11-18)**: Removed extra `فيديو 9:16` badge from `.pipe`, aligned `.home-bottom` and cross-screen paired cards (`ContentInput`, `VideoStudio`, `FinalReview`) via `align-items: stretch`.

- **P01C.1 (`v0.1.4`, 2026-11-18)**: Replaced oversized homepage hero with Leader-grounded `.vh` + 4-column local KPIs + `.home-bottom`, normalized `--sidebar-w: 240px` and `--content-max: 1180px`, aligned `ContentInput`/`ScriptStudio`/`VideoStudio`/`FinalReview` column ratios, and cleared footer `N` badge overlap.
- **P01C (`v0.1.3`, 2026-11-18)**: Fixed sidebar footer clipping (`height: 100dvh; overflow-y: auto; flex-shrink: 0`), added drawer/modal body scroll locks and focus return, and applied logical RTL CSS.
- **P01B (`v0.1.2`, 2026-11-17)**: Derived `nabda-logo-dark.png` (`428×109`, `2,178` B) from untouched `nabda-logo.png` (`8,898` B), fixed `9:16 · 720×1280` BiDi reversal, and localized all UI/service copy to gender-neutral Saudi White Arabic.
- **P01A (`v0.1.1`, 2026-11-17)**: Regenerated `package-lock.json` via `npm install` + `npm ci`, fixed `react-hooks/set-state-in-effect` lint error (`0` errors, `0` warnings), and enforced field-specific and section-level validation.

## Next phase gates (`P02A` Merged → `feat/frontend-core` / `feat/backend-integrations`)

1. Frontend Lead (`feat/frontend-core`): refine UX (`UX-01`–`UX-04`) using read-only Lovable UX analysis + Antigravity-controlled code patches (`docs/FRONTEND_UX_HANDOFF.md`), followed by live browser/mobile/keyboard QA and PR review to `main`.
2. Backend Lead (`feat/backend-integrations` from `main` `bc932b7`): implement Supabase/Gemini/Azure/Remotion endpoints per `docs/BACKEND_HANDOFF.md` and `docs/API_CONTRACT.md` (currently `ALL ROUTES DRAFT`).
