# NABDA AI — Backend Integration Handoff for Backend Lead

> **Contract Status:** Client-side TypeScript domain & service signatures **FROZEN in P02A (`v0.1.7`, branch `feat/api-contract-alignment`)**; HTTP REST endpoints in `docs/API_CONTRACT.md` remain **`ALL ROUTES DRAFT / UNIMPLEMENTED`** until implemented and smoke-tested on `feat/backend-integrations`. `HttpNabdaService` intentionally fails closed.

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

- `ScriptVersion` (`version: 1, 2, ...`, `origin: ScriptOrigin`) is strictly immutable and carries `contentHash` (`sha256:<64-hex>`) and `containsInstructionalPlaceholders: boolean`.
- `reviseScript(projectId, sections, baseVersionId)` enforces optimistic concurrency: if `baseVersionId` does not match the latest stored version ID, reject with `NabdaContractError("VERSION_CONFLICT", ...)` (`HTTP 409`). Edits always create a new immutable version (`origin: "manual"`) and invalidate prior approvals (`"معتمد حاليًا"` vs `"اعتماد سابق"` vs `"غير معتمد"`).
- `approveScript(projectId, versionId, expectedContentHash)` computes the canonical digest via `canonicalizeScriptSections` / `computeScriptContentHash` (`src/lib/utils/client.ts`), rejects stale versions (`VERSION_CONFLICT`), rejects modified/unpersisted content (`CONTENT_HASH_MISMATCH`), and records `contentHash` on `ApprovalEvent` (plus authenticated reviewer on the server).
- Empty sections or unmodified instructional template text (`origin: "instructional_template"` / `containsInstructionalPlaceholders: true` / `isInstructionalTemplateText`) are rejected at UI, `validateScriptSections`, and service approval boundaries.

## Boundary Matrix & DTO Contracts (8 Core Areas)

| Boundary Area | Owner | Request / Input DTO | Response / Entity Contract | Required Error Semantics |
|---|---|---|---|---|
| Projects & Sources | Backend Lead (`POST/GET /projects`) | `CreateProjectInput` (`sourceText`, `mode`, `audience`, `contentType`, `dialect`, `tone`) | `Project` + immutable `SourceContent` (`draft` status) | `INVALID_INPUT` (20–3000 chars, audience >= 3), `UNAUTHORIZED`, `RATE_LIMITED` |
| Grounding Claims & Citations | Backend Lead (`POST /scripts/generate`) | `{ useSavedPreferences, targetDurationSeconds }` | `SourceFact[]` (`quote`, `start`, `end`, `state`) + `warnings` | Enforces `sourceText.slice(start, end) === quote`; `idea` mode flagged ungrounded |
| Script Versions | Shared Freeze (`domain.ts`, `service.ts`) | `ReviseScriptInput` (`projectId`, `baseVersionId`, `sections`) | Immutable `ScriptVersion` (`contentHash`, `origin`, `containsInstructionalPlaceholders`) | `VERSION_CONFLICT` (`409`), `INVALID_INPUT`, `NOT_FOUND` |
| Human Approval | Shared Freeze (`service.ts`) | `ApproveScriptInput` (`projectId`, `versionId`, `expectedContentHash`) | `ApprovalEvent` (`contentHash`, `persistence: "server"`) | `VERSION_CONFLICT`, `CONTENT_HASH_MISMATCH`, `FACTS_NEED_REVIEW`, `INVALID_INPUT` |
| Saudi Voice Selection | Backend Lead (`Azure Speech`) | `SaudiVoiceId` (`ar-SA-ZariyahNeural` / `ar-SA-HamedNeural`) | Per-scene narration durations & private audio path | `TTS_UNAVAILABLE` (`503`), `INVALID_INPUT` |
| Asynchronous Video Jobs | Backend Lead (`POST/GET /video-jobs`) | `VideoStartInput` (**mandatory** `projectId`, `scriptVersionId`, `voiceId`, `templateId`, `expectedScriptHash`) | `VideoJob` (`not_started` -> `queued` -> `synthesizing_audio` -> `rendering` -> `ready` \| `failed`) | Require `expectedScriptHash` (`INVALID_INPUT`), latest approved `scriptVersionId` (`SCRIPT_NOT_APPROVED`), and digest match against both version & `ApprovalEvent.contentHash` (`CONTENT_HASH_MISMATCH`), `RENDER_QUOTA`, `NOT_FOUND` |
| Final Asset Readiness | Backend Lead (`/preview`, `/approve`, `/download`) | `{ expectedAssetHash }` | `GeneratedAsset` (`kind: "video"`, `mimeType: "video/mp4"`, `sourceVersionId`) + `ApprovalEvent` (`kind: "video"`) | `VIDEO_NOT_READY` (`409`), `VERSION_CONFLICT` (`409`), `FORBIDDEN` (`403`) |
| Editorial Preferences | Backend Lead (`/style-preferences`) | `rule` (`>= 8` chars, `origin`) | `StylePreference[]`; offline UI quick-fill uses `STARTER_STYLE_RULES` fixture only | Explicit user rule approval only; never promote unverified facts or claim AI auto-learning |

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

## Resolved P02A Contract Alignments (`v0.1.7` on `feat/api-contract-alignment`)

All five prior contract inconsistencies from `v0.1.6` are resolved at the shared TypeScript & local adapter boundary (HTTP server endpoints remain `DRAFT` until `feat/backend-integrations`):

1. **Video rendering aligned with `VideoStartInput`:** `NabdaService.requestVideoRender(input: VideoStartInput): Promise<VideoJob>` now requires `{ projectId, scriptVersionId, voiceId, templateId, expectedScriptHash }` (with **`expectedScriptHash` mandatory**), validates project existence, latest approved script version, non-instructional content, and persisted script/approval hash equality, and continues failing closed via `IntegrationNotConfiguredError`.
2. **Optimistic concurrency on `reviseScript`:** `NabdaService.reviseScript(projectId, sections, baseVersionId)` and `ReviseScriptInput` require `baseVersionId` and throw `NabdaContractError("VERSION_CONFLICT", ...)` on stale edits while preserving immutable history.
3. **Canonical hash binding on `approveScript`:** `NabdaService.approveScript(projectId, versionId, expectedContentHash)` and `ApproveScriptInput` validate `sha256:<hex>` digests computed by `canonicalizeScriptSections` / `computeScriptContentHash` (`CONTENT_HASH_MISMATCH` if modified) and store `contentHash` on `ApprovalEvent`.
4. **Editorial fixture scoping (`STARTER_STYLE_RULES`):** Retained as sample-only quick-fill suggestions in `FinalReview.tsx` (`نموذج مقترح للتجربة المحلية`), with zero auto-seeding into `localStorage` and zero AI fine-tuning claims.
5. **Instructional placeholder provenance:** Custom-source offline drafts carry `origin: "instructional_template"` and `containsInstructionalPlaceholders: true`, cleanly distinguishing unedited local templates from `"manual"`, `"development_fixture"`, and future `"ai"` versions.

## Recommended Future Phase Sequence (Do NOT Start Without Approval)

- `feat/frontend-core`: frontend-only UX refinements, drawer/keyboard verification, and optional polish on merged contracts.
- Isolated Lovable UX experiment (separate sanitized export only — never linked to canonical GitHub).
- Vercel frontend preview readiness (`NEXT_PUBLIC_NABDA_ADAPTER=development`, zero server secrets or billing).
- `feat/backend-integrations`: Supabase schema/RLS, Gemini grounding, Azure Saudi TTS, Remotion MP4 worker, and real `HttpNabdaService`.

## Security & proof gates

Server-only secrets, authenticated session enforcement + Supabase RLS, payload/length validation, bounded job concurrency & spend caps, private storage ACLs, and sanitized logs. First vertical proof required before broad backend buildout:
`approved script -> real Saudi audio -> branded RTL scenes -> actual downloadable MP4` (with `ffprobe` output, local playback, measured timing & cost, and zero exposed secrets).

## Integration acceptance

- `POST /api/v1/projects` persists source; `GET` survives restart.
- AI output schema and verbatim source offsets validated.
- Local UI switches cleanly to `HttpNabdaService` without fixture fallback.
- Unauthorized requests cannot create/download; stale `baseVersionId` (`VERSION_CONFLICT`), wrong `expectedContentHash` (`CONTENT_HASH_MISMATCH`), or unapproved script render attempts (`SCRIPT_NOT_APPROVED`) are rejected with `409` / `NabdaContractError`.
- Persisted `video_jobs` states reflected accurately; real MP4 preview, final human approval, authorized download.
- Existing Frontend Lead UI compiles cleanly with only controlled adapter/state integration (`HttpNabdaService` + `NEXT_PUBLIC_NABDA_ADAPTER=http`).
