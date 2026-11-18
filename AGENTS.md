# NABDA AI — Rules for Google Antigravity and All Coding Agents

## BEFORE ANY EDIT

1. Read `docs/MVP_SCOPE.md`, `docs/PROJECT_HANDOFF.md`, `docs/ARCHITECTURE.md`, `docs/API_CONTRACT.md`, and `docs/PROTOTYPE_AUDIT.md`.
2. Inspect `git status`, `git branch --show-current`, `package.json` and current working tree.
3. Identify exact target files and ownership boundaries. Preserve the leader reference untouched.
4. Explain the smallest proposed change and acceptance tests to the Project Lead / Frontend Lead in **Egyptian Arabic**, with technical terms in English.
5. **Ask for Project Lead / Frontend Lead approval before significant changes.** Do not automatically initialize a second framework or re-scaffold Next.js.

## CODE QUALITY

- Small, focused commits; strict TypeScript; RTL/mobile-first; semantic controls; accessible loading/invalid states.
- Keep UI, domain types, API adapters, and fixtures separated.
- No hardcoded secrets in frontend, routes, docs, logs or screenshots.
- Do not claim that localStorage approval is server approval, that a demo script is AI, or that static canvas media is a real video.
- Do not fabricate PASS, screenshots, API responses, costs, or quality metrics.
- Do not copy `window.claude` or monolithic script from leader HTML.
- Do not add Supabase, n8n, Gemini, Azure, Remotion or cloud billing until separately authorized, scoped, credential-verified and smoke-tested.

## AFTER AN APPROVED EDIT

- Run actual available commands (`npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:contracts`) and document PASS/FAIL/BLOCKED exactly.
- Update `docs/PROJECT_HANDOFF.md` and `docs/CHANGELOG.md` with changed files, command results, known issues and next step.
- Show `git diff --stat`, meaningful code diff and current Git status.
- **Stop before committing, pushing, merging, deleting, changing secrets or deploying without express human approval.**
- Respect branch ownership: Frontend Lead `feat/frontend-core` (see `docs/FRONTEND_UX_HANDOFF.md`), Shared Contract Owner `feat/api-contract-alignment` (`P02A` merged via PR #1), Backend Lead `feat/backend-integrations`. PR to `main` only after review.

## CONTROLLED LOVABLE COLLABORATION POLICY

Distinguish three collaboration modes strictly:

1. **GitHub API Read-Only Code Analysis (VERIFIED & ALLOWED):** Inspecting existing Next.js 16 / React 19 / TypeScript / Tailwind v4 code to propose frontend UX improvements (`UX-01`–`UX-04`) grounded in the real codebase.
2. **Conditional Feature-Branch Write Test (CONDITIONAL — NOT AUTOMATICALLY AUTHORIZED):** Any remote write test is restricted strictly to `feat/frontend-core` (never `main`) and requires verifiable GitHub branch protection/rulesets blocking direct pushes to `main`. Because GitHub's REST API reports `protected: false` and `HTTP 403` for branch protection/rulesets on the current private GitHub Free repository plan, natural-language prompt rules alone cannot restrict a broad write token. Until enforceable protection exists, keep direct Lovable GitHub writes **disabled** and route changes through: **Lovable UX proposals → Antigravity-controlled code patch on `feat/frontend-core` → Local checks → Pull Request → Human approval**.
3. **Standalone App-Building & Git Sync Replacement (FORBIDDEN):** Never enable automatic Git Sync repository replacement, generate a replacement project, migrate Next.js 16 to Vite/TanStack Start/another stack, or alter frozen contracts (`src/lib/contracts/domain.ts`, `src/lib/api/service.ts`, `src/lib/utils/client.ts`), `src/lib/fixtures/**`, `src/app/api/**`, `supabase/**`, `docs/API_CONTRACT.md`, `tests/**`, `public/brand/**`, `docs/references/leader-prototype.html`, or `.env*`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
