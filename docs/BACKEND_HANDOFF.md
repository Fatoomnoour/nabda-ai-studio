# NABDA AI — Backend Integration Handoff for Backend Lead

> **Contract Status:** `DRAFT — Pending P02A / feat/api-contract-alignment`. Frontend baseline `v0.1.6` implements zero live backend routes; `HttpNabdaService` fails closed.

## Important

This repository (`nabda-ai-mvp`, baseline `v0.1.6`) is a **verified Next.js 16 App Router frontend starter**, not a functional AI/TTS/video backend. Do not rewrite the Next.js frontend or start a second application. Read `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/API_CONTRACT.md` before making changes.

## Start safely & team branch sequence

Recommended collaboration sequence from published `main` (`v0.1.6`):

1. Publish verified `main` baseline (`v0.1.6`).
2. Align and freeze shared TypeScript & REST contracts on `feat/api-contract-alignment` (**P02A**, Shared Contract Owner PR).
3. Merge reviewed contracts into `main`.
4. Backend Lead creates `feat/backend-integrations` from updated `main`.
5. Frontend Lead continues UX polish independently on `feat/frontend-core`.

```powershell
git clone https://github.com/OWNER/nabda-ai-mvp.git
cd nabda-ai-mvp
npm ci
git switch -c feat/backend-integrations
```

Branch on the canonical private repository (`nabda-ai-mvp`) and merge via Pull Requests. Keep `main` protected from unreviewed direct feature pushes. Never connect Lovable or third-party automated write access to this canonical repository.

## File ownership & integration boundaries

- **Backend-owned (`Backend Lead` — `feat/backend-integrations`):** future `src/app/api/v1/**` route handlers, server-only AI/TTS/render services, `supabase/**` migrations & RLS policies, Remotion/media worker, and real HTTP calls inside `HttpNabdaService` (`src/lib/api/service.ts`).
- **Frontend-owned (`Frontend Lead` — `feat/frontend-core`):** `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/**`, `src/features/**`, `public/brand/**`, and client validation UX (`src/lib/utils/client.ts`).
- **Shared contracts (`Shared Contract Owner` — `feat/api-contract-alignment` — P02A):** `src/lib/contracts/domain.ts`, `NabdaService` interface in `src/lib/api/service.ts`, and `docs/API_CONTRACT.md`.
- **Development fixture (`src/lib/fixtures/aptitude.ts`):** controlled Week 1 verbal analogy sample for offline dev only; **never** use as a silent production fallback.
- **Immutable / Protected assets:** `docs/references/leader-prototype.html` (SHA-256 `66b86409...`) and `public/brand/nabda-logo.png` (`528×166`, `8,898` B).

## Expected project, script & preference APIs (`ALL ROUTES DRAFT`)

- `POST /api/v1/projects` — validate & store project metadata and immutable source text (`201 Created`).
- `GET /api/v1/projects/{projectId}` — fetch project, latest script versions, facts, and recent approvals (`200 OK`, `403`/`404`).
- `POST /api/v1/projects/{projectId}/scripts/generate` — Gemini structured JSON output + source quotes (`201 Created`).
- `POST /api/v1/projects/{projectId}/scripts/revisions` — persist manual edit as immutable version (`201 Created`, `409 VERSION_CONFLICT` if stale).
- `POST /api/v1/projects/{projectId}/scripts/{versionId}/approve` — bind approval to version + content hash (`201 Created`).
- `GET /api/v1/style-preferences` & `POST /api/v1/style-preferences` — fetch/create team-scoped editorial rules (explicitly approved or manual rules only; never factual claims).

## Script versioning & approval semantics

- `ScriptVersion` (`version: 1, 2, ...`) is strictly immutable; edits always create a new version and invalidate prior approvals (`"معتمد حاليًا"` vs `"اعتماد سابق"` vs `"غير معتمد"`).
- Server script approvals must bind to `versionId`, `expectedContentHash` (SHA-256 digest of normalized `hook`, `body`, `cta`), and authenticated reviewer ID.
- Empty sections or unmodified instructional template text (`isInstructionalTemplateText` in `src/lib/utils/client.ts`) are blocked at both UI (`ScriptStudio`) and `validateScriptSections` boundaries prior to save/approval.

## Video job lifecycle (`ALL ROUTES DRAFT`)

State machine: `Draft` -> `ScriptReady` -> `ScriptApproved` -> `queued` (`POST /api/v1/projects/{projectId}/video-jobs`, `202`) -> `GET /api/v1/video-jobs/{jobId}` (`queued` -> `synthesizing_audio` -> `rendering` -> `ready` | `failed`) -> `GET /api/v1/video-jobs/{jobId}/preview` -> `POST /api/v1/video-jobs/{jobId}/approve` (`expectedAssetHash`) -> `GET /api/v1/video-jobs/{jobId}/download` (`403` until explicit final video approval). Poll job status with backoff (~2s) and never fabricate progress percentages.

## Database — Supabase PostgreSQL persistence boundary

One canonical PostgreSQL database with RLS migrations and private Supabase Storage bucket (authenticated signed URLs):
`projects`, `source_content`, `source_facts`, `script_versions`, `review_events`, `video_jobs`, `generated_assets`, `style_preferences`.
**Do not introduce SQLite** as a second application database. Prototype `localStorage` data is browser-local demo state and must not be migrated to production.

## Source-grounding data structures

`SourceFact` (`id`, `statement`, `quote`, `start`, `end`, plus server `state: "supported" | "needs_review"` in `docs/API_CONTRACT.md`) must satisfy exact character indexing: `sourceText.slice(start, end) === quote` (`src/features/script/ScriptStudio.tsx` enforces matching slices). Idea-only projects (`mode === "idea"`) must never claim grounded fact verification.

## Future TTS & video service boundaries

- **Saudi TTS (primary):** Azure Speech (`ar-SA-ZariyahNeural` / `ar-SA-HamedNeural`) server-side after credential & pronunciation smoke tests (ElevenLabs as tested fallback only).
- **Video Renderer (primary):** Remotion Node worker (`720×1280` 9:16 H.264/AAC MP4 with Arabic RTL scene captions, duration/stream verified via `ffprobe`); Creatomate only as credential-verified contingency. Render in a dedicated worker if web hosting cannot execute Chromium jobs cleanly.

## Required environment variables

```env
# Client-safe adapter switch (development | http)
NEXT_PUBLIC_NABDA_ADAPTER=development

# Server-only secrets — NEVER prefix with NEXT_PUBLIC_
GEMINI_API_KEY=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Fixture-to-HTTP adapter transition

- Keep `LocalDevelopmentService` strictly scoped to local development (`NEXT_PUBLIC_NABDA_ADAPTER=development`).
- Replace throwing stubs inside `HttpNabdaService` incrementally with typed `fetch` requests against `/api/v1/**` when `NEXT_PUBLIC_NABDA_ADAPTER=http`.
- Never silently switch `HttpNabdaService` back to `aptitude.ts` fixtures on API error.

## Known contract inconsistencies (`DRAFT — Pending P02A / feat/api-contract-alignment`)

Do not silently freeze inconsistent signatures. Align these items explicitly in **P02A** on `feat/api-contract-alignment` before backend route implementation:

1. **`requestVideoRender()` signature mismatch:** `NabdaService.requestVideoRender()` (`src/lib/api/service.ts`) takes `0` arguments, whereas `VideoStartInput` in `src/lib/contracts/domain.ts` defines `{ projectId, scriptVersionId, voiceId }` and `POST /api/v1/projects/{projectId}/video-jobs` in `docs/API_CONTRACT.md` expects `{ scriptVersionId, voiceId, templateId }`.
2. **Optimistic locking on `reviseScript`:** `NabdaService.reviseScript(projectId: string, sections: ScriptSections)` currently omits `baseVersionId` required by `POST /api/v1/projects/{projectId}/scripts/revisions` (`409 VERSION_CONFLICT`).
3. **Content hash binding on `approveScript`:** `NabdaService.approveScript(projectId: string, versionId: string)` currently omits `expectedContentHash` required by `POST /api/v1/projects/{projectId}/scripts/{versionId}/approve`.
4. **Unused style-rule fixture constant:** `STARTER_STYLE_RULES` is exported from `src/lib/fixtures/aptitude.ts` but is not currently seeded by `LocalDevelopmentService`.
5. **Custom-source `prepareDraft` placeholder text:** `LocalDevelopmentService.prepareDraft` currently initializes custom-source `hook` and `cta` fields with instructional guide strings; `validateScriptSections` blocks approval until manually edited, whereas `/scripts/generate` on the server must return real AI-generated sections + `warnings` / `facts`.

## Security & proof gates

Server-only secrets, authenticated session enforcement + Supabase RLS, payload/length validation, bounded job concurrency & spend caps, private storage ACLs, and sanitized logs. First vertical proof required before broad backend buildout:
`approved script -> real Saudi audio -> branded RTL scenes -> actual downloadable MP4` (with `ffprobe` output, local playback, measured timing & cost, and zero exposed secrets).

## Integration acceptance

- `POST /api/v1/projects` persists source; `GET` survives restart.
- AI output schema and verbatim source offsets validated.
- Local UI switches cleanly to `HttpNabdaService` without fixture fallback.
- Unauthorized requests cannot create/download; stale script/video approvals rejected (`409`).
- Persisted `video_jobs` states reflected accurately; real MP4 preview, final human approval, authorized download.
- Existing Frontend Lead UI compiles cleanly with only controlled adapter/state integration.
