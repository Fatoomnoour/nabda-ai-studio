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
- Respect branch ownership: Frontend Lead `feat/frontend-core`, Shared Contract Owner `feat/api-contract-alignment`, Backend Lead `feat/backend-integrations`. PR to main only after review.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
