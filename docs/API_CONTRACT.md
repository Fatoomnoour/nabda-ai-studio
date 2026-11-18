# NABDA AI — API Contract v0.1 (ALL ROUTES DRAFT / UNIMPLEMENTED)

> **CRITICAL:** The Starter includes **zero live backend business endpoints**. The `LocalDevelopmentService` supports only labeled local UI interactions, and `HttpNabdaService` intentionally throws. Do not claim these routes are available until Backend Lead implements/tests them.

## Convention

- Base: `/api/v1`, JSON request/response, `camelCase`, UUID identifiers, ISO-8601 UTC timestamps.
- Authorization: authenticated team/user session, enforced on server. Do **not** permit anonymous production writes.
- Idempotency: `Idempotency-Key` for create/generate/render endpoints; server deduplicates.
- Versions: immutable scripts, source versions, asset versions. Approval tied to ID + SHA-256 digest of exact normalized bytes.
- Errors: HTTP 400 invalid input; 401 unauthenticated; 403 unauthorized; 404 not found; 409 stale or unapproved version; 422 unsupported content; 429 rate limit; 500 internal; 503 external provider unavailable.

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
{"scriptVersion":{"id":"uuid","version":1,"sections":{"hook":"...","body":"...","cta":"..."},"origin":"ai","contentHash":"sha256...","createdAt":"..."},"facts":[{"id":"uuid","statement":"...","quote":"literal from source","start":14,"end":44,"state":"supported"}],"warnings":[{"code":"CLAIM_NEEDS_REVIEW","text":"..."}],"appliedPreferenceIds":[]}
```
Must validate JSON schema; quote offsets must exactly match source text or be `needs_review`. Idea-mode output cannot claim grounded verification. UI `draft` → `script_ready`. Errors: `AI_UNAVAILABLE`, `INVALID_MODEL_OUTPUT`, `SOURCE_TOO_LONG`, `RATE_LIMITED`.

### 4. Save script revision — P0 — DRAFT

`POST /api/v1/projects/{projectId}/scripts/revisions` (Owner: Backend Lead)

Request:
```json
{"baseVersionId":"uuid","sections":{"hook":"...","body":"...","cta":"..."}}
```
Response `201`:
```json
{"scriptVersionId":"new-uuid","version":2,"status":"script_ready","approvalValid":false}
```
New immutable version; never overwrite. `409 VERSION_CONFLICT` if base is stale. UI `script_ready` and invalidate downstream approvals for current version.

### 5. Approve script — P0 — DRAFT

`POST /api/v1/projects/{projectId}/scripts/{versionId}/approve` (Owner: Backend Lead)

Request:
```json
{"expectedContentHash":"sha256..."}
```
Response `201`:
```json
{"approvalId":"uuid","versionId":"uuid","approved":true,"approvedAt":"..."}
```
Server checks exact current version/hash, authorized reviewer, fact warnings acknowledgment when needed. Errors: `409 VERSION_CONFLICT`, `409 FACTS_NEED_REVIEW`. UI `script_ready` → `script_approved`.

### 6. Request video generation — P0 — DRAFT

`POST /api/v1/projects/{projectId}/video-jobs` (Owner: Backend Lead)

Request:
```json
{"scriptVersionId":"uuid","voiceId":"ar-SA-ZariyahNeural","templateId":"nabda-educational-v1"}
```
Response `202`:
```json
{"jobId":"uuid","state":"queued","stage":"queued"}
```
Must verify script approval by exact ID/hash, quota, bounded concurrency. Errors: `409 SCRIPT_NOT_APPROVED`, `503 TTS_UNAVAILABLE`, `429 RENDER_QUOTA`. UI `script_approved` → `queued`.

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

### Backend integration strategy

- Preserve UI domain shapes from `src/lib/contracts/domain.ts`. API JSON has predictable `camelCase` fields.
- Replace `HttpNabdaService` fail-closed methods incrementally with fetch calls; do **not** insert provider API keys in the frontend.
- Never change `LocalDevelopmentService` to silently call production APIs. Choose adapters explicitly via config.
- Update `docs/API_CONTRACT.md` statuses only after implementation and test evidence.
- Write server-side end-to-end tests for staleness, source quote positions, unauthorized downloads, safe retry and no export before approval.
