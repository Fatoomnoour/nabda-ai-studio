# NABDA AI — API Contract v0.1 (ALL ROUTES DRAFT / UNIMPLEMENTED)

> **CRITICAL:** The Starter includes **zero live backend business endpoints**. The `LocalDevelopmentService` supports only labeled local UI interactions, and `HttpNabdaService` intentionally throws. Do not claim these routes are available until Backend Lead implements/tests them.

## Convention

- Base: `/api/v1`, JSON request/response, `camelCase`, UUID identifiers, ISO-8601 UTC timestamps.
- Authorization: authenticated team/user session, enforced on server. Do **not** permit anonymous production writes.
- Idempotency: `Idempotency-Key` for create/generate/render endpoints; server deduplicates.
- Versions: immutable scripts, source versions, asset versions. Approval binds to `versionId` + canonical SHA-256 digest (`sha256:<64-hex>`) computed on normalized sections (`JSON.stringify({ hook: hook.replace(/\r\n?/g, "\n").trim(), body: ..., cta: ... })`, implemented in `canonicalizeScriptSections` / `computeScriptContentHash` in `src/lib/utils/client.ts`).
- `ScriptOrigin` enum (`src/lib/contracts/domain.ts`): `"development_fixture" | "instructional_template" | "manual" | "ai"`. Custom offline drafts with unmodified guide text carry `origin: "instructional_template"` and `containsInstructionalPlaceholders: true`; server `/scripts/generate` responses MUST always return `origin: "ai"` and `containsInstructionalPlaceholders: false`.
- Errors (`ApiErrorCode` / `ApiErrorPayload` / `NabdaContractError`): HTTP 400 `INVALID_INPUT`; 401 `UNAUTHORIZED`; 403 `FORBIDDEN`; 404 `NOT_FOUND`; 409 `VERSION_CONFLICT` / `CONTENT_HASH_MISMATCH` / `FACTS_NEED_REVIEW` / `SCRIPT_NOT_APPROVED` / `VIDEO_NOT_READY`; 422 `INVALID_MODEL_OUTPUT` / `SOURCE_TOO_LONG`; 429 `RENDER_QUOTA` / `RATE_LIMITED`; 503 `AI_UNAVAILABLE` / `TTS_UNAVAILABLE` / `INTEGRATION_NOT_CONFIGURED`.

### Unified error response

```json
{"error":{"code":"SCRIPT_NOT_APPROVED","message":"يجب اعتماد السكريبت أولًا","retryable":false,"requestId":"req_123"}}
```

### 1. Create project — P0 — DRAFT

`POST /api/v1/projects` (Owner: Backend Lead)

Request:
```json
{"sourceText":"التناظر اللفظي سؤال يعرض زوجًا...","mode":"source","audience":"طلاب القدرات","contentType":"تعليمي","dialect":"سعودية بيضاء","tone":"قريبة ومحفزة"}
```
Response `201`:
```json
{"projectId":"uuid","sourceId":"uuid","status":"draft","createdAt":"2026-11-17T16:00:00Z"}
```
Server checks 20–3000 chars initially, validates allowed enums, stores exact source. UI moves to script creation only after success. Possible errors: `INVALID_INPUT`, `UNAUTHORIZED`, `RATE_LIMITED`.

### 2. Retrieve project — P0 — DRAFT

`GET /api/v1/projects/{projectId}` (Owner: Backend Lead)

Response `200`:
```json
{"project":{"id":"uuid","name":"درس التناظر اللفظي","status":"draft","source":{"id":"uuid","text":"...","mode":"source"},"audience":"طلاب القدرات","tone":"قريبة ومحفزة","dialect":"سعودية بيضاء"},"currentScriptVersion":null,"recentApprovals":[]}
```
404/403 for missing/unauthorized. UI refresh/resume.

### 3. Generate Saudi script — P0 — DRAFT

`POST /api/v1/projects/{projectId}/scripts/generate` (Owner: Backend Lead; Gemini service)

Request:
```json
{"useSavedPreferences":true,"targetDurationSeconds":45}
```
Response `201`:
```json
{"scriptVersion":{"id":"uuid","version":1,"sections":{"hook":"...","body":"...","cta":"..."},"origin":"ai","containsInstructionalPlaceholders":false,"contentHash":"sha256:...","createdAt":"..."},"facts":[{"id":"uuid","statement":"...","quote":"literal from source","start":14,"end":44,"state":"supported"}],"warnings":[{"code":"CLAIM_NEEDS_REVIEW","text":"..."}],"appliedPreferenceIds":[]}
```
Must validate JSON schema; quote offsets must exactly match source text (`sourceText.slice(start, end) === quote`) or be flagged `needs_review`. Idea-mode output (`mode === "idea"`) cannot claim grounded verification. UI `draft` → `script_ready`. Errors: `AI_UNAVAILABLE`, `INVALID_MODEL_OUTPUT`, `SOURCE_TOO_LONG`, `RATE_LIMITED`.

### 4. Save script revision — P0 — DRAFT

`POST /api/v1/projects/{projectId}/scripts/revisions` (Owner: Backend Lead; client signature: `NabdaService.reviseScript(projectId, sections, baseVersionId)`)

Request (`ReviseScriptInput`):
```json
{"projectId":"uuid","baseVersionId":"uuid","sections":{"hook":"...","body":"...","cta":"..."}}
```
Response `201`:
```json
{"scriptVersionId":"new-uuid","version":2,"contentHash":"sha256:...","origin":"manual","containsInstructionalPlaceholders":false,"status":"script_ready","approvalValid":false}
```
New immutable version; never overwrite. Deterministic `409 VERSION_CONFLICT` if `baseVersionId` does not match the latest server version ID. UI `script_ready` and invalidates prior approvals.

### 5. Approve script — P0 — DRAFT

`POST /api/v1/projects/{projectId}/scripts/{versionId}/approve` (Owner: Backend Lead; client signature: `NabdaService.approveScript(projectId, versionId, expectedContentHash)`)

Request (`ApproveScriptInput`):
```json
{"projectId":"uuid","versionId":"uuid","expectedContentHash":"sha256:..."}
```
Response `201`:
```json
{"approvalId":"uuid","versionId":"uuid","contentHash":"sha256:...","approved":true,"approvedAt":"..."}
```
Server checks exact current `versionId` (`409 VERSION_CONFLICT`), computes canonical `contentHash` (`409 CONTENT_HASH_MISMATCH`), rejects unedited instructional placeholders (`400 INVALID_INPUT`), checks authorized reviewer, and checks fact warnings acknowledgment when needed (`409 FACTS_NEED_REVIEW`). UI `script_ready` → `script_approved`.

### 6. Request video generation — P0 — DRAFT

`POST /api/v1/projects/{projectId}/video-jobs` (Owner: Backend Lead; client signature: `NabdaService.requestVideoRender(input: VideoStartInput)`)

Request (`VideoStartInput` — **all 5 fields mandatory**):
```json
{"projectId":"uuid","scriptVersionId":"uuid","voiceId":"ar-SA-ZariyahNeural","templateId":"nabda-educational-v1","expectedScriptHash":"sha256:..."}
```
Response `202`:
```json
{"jobId":"uuid","projectId":"uuid","scriptVersionId":"uuid","state":"queued","stageLabel":"في انتظار المعالجة"}
```
Server validation rule: (1) require non-empty `expectedScriptHash` (`400 INVALID_INPUT` if missing), (2) verify `scriptVersionId` is the latest approved script version (`409 SCRIPT_NOT_APPROVED` otherwise), (3) recompute canonical SHA-256 of the persisted version and match BOTH `expectedScriptHash` and `ApprovalEvent.contentHash` (`409 CONTENT_HASH_MISMATCH` if tampered/stale), (4) verify quota & bounded concurrency (`503 TTS_UNAVAILABLE`, `429 RENDER_QUOTA`). UI remains in disabled/pending preview until backend is enabled.

### 7. Video job status — P0 — DRAFT

`GET /api/v1/video-jobs/{jobId}` (Owner: Backend Lead)

Response `200`:
```json
{"jobId":"uuid","state":"rendering","stage":"composing_mp4","errorCode":null,"assetId":null}
```
States: `queued`, `synthesizing_audio`, `rendering`, `ready`, `failed`. Poll every ~2 sec with backoff and stop on terminal state. Do not fabricate a percentage.

### 8. Preview media — P0 — DRAFT

`GET /api/v1/video-jobs/{jobId}/preview` (Owner: Backend Lead)

Response `200`: `video/mp4` bytes or authenticated short-lived private signed URL, only for `ready`. Not required to be approved yet because review comes *before* final approval. Supports Range requests if streaming. `409 VIDEO_NOT_READY` otherwise. UI displays actual HTML5 `<video>` only with real asset.

### 9. Approve video — P0 — DRAFT

`POST /api/v1/video-jobs/{jobId}/approve` (Owner: Backend Lead)

Request:
```json
{"expectedAssetHash":"sha256..."}
```
Response `201`:
```json
{"approvalId":"uuid","assetId":"uuid","approved":true}
```
Must verify video from currently approved script and exact rendered asset bytes/hash. Errors: `409 VIDEO_NOT_READY`, `409 VERSION_CONFLICT`. UI `video_ready` → `video_approved`.

### 10. Download approved MP4 — P0 — DRAFT

`GET /api/v1/video-jobs/{jobId}/download` (Owner: Backend Lead)

Response `200`: `Content-Type: video/mp4`, `Content-Disposition: attachment; filename="nabda-approved.mp4"`. Only after explicit video approval; 403 otherwise. No publicly exposed bucket paths.

### 11. List style preferences — P1 — DRAFT

`GET /api/v1/style-preferences` (Owner: Backend Lead)

Response `200`:
```json
{"preferences":[{"id":"uuid","rule":"استخدم لغة سعودية بسيطة","enabled":true,"sourceReviewId":"uuid","createdAt":"..."}]}
```
Scoped by authenticated team. No model fine-tuning.

### 12. Save style preference — P1 — DRAFT

`POST /api/v1/style-preferences` (Owner: Backend Lead)

Request:
```json
{"rule":"استخدم لغة سعودية بسيطة","category":"tone","sourceReviewId":"uuid"}
```
Response `201`:
```json
{"preferenceId":"uuid","enabled":true}
```
Require explicit approval and not factual correction; avoid promoting source-specific facts into style rules. Request can also support explicit manual rules with appropriately recorded provenance.

### Backend integration strategy & frozen P02A boundary

- Preserve UI domain shapes from `src/lib/contracts/domain.ts` and `NabdaService` method signatures in `src/lib/api/service.ts` (frozen in P02A for `reviseScript`, `approveScript`, `requestVideoRender`, `ScriptVersion.contentHash`, `containsInstructionalPlaceholders`, and `NabdaContractError`). API JSON uses matching `camelCase` fields.
- Replace `HttpNabdaService` fail-closed methods incrementally with `fetch` calls returning typed domain models or throwing `NabdaContractError(code, message, retryable)`; do **not** insert provider API keys in the frontend.
- `STARTER_STYLE_RULES` in `src/lib/fixtures/aptitude.ts` is strictly an optional sample-chip helper in `FinalReview` (`local` quick-fill only, never auto-seeded into persistence and never automatic AI training).
- Never change `LocalDevelopmentService` to silently call production APIs. Choose adapters explicitly via config.
- Update `docs/API_CONTRACT.md` route statuses from `DRAFT` only after backend implementation and test evidence.
- Write server-side end-to-end tests for `VERSION_CONFLICT`, `CONTENT_HASH_MISMATCH`, source quote offsets, unauthorized downloads, safe retry, and no export before approval.
