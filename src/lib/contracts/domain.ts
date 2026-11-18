/** Stable MVP domain contracts. Future Supabase and API implementations must implement these shapes. */
export type ProjectMode = "idea" | "source";
export type ProjectStatus = "draft" | "script_ready" | "script_approved" | "video_ready" | "video_approved";
export type VideoJobState = "not_started" | "queued" | "synthesizing_audio" | "rendering" | "ready" | "failed";
export type ClaimReview = "supported" | "needs_review";
export type ScriptOrigin = "development_fixture" | "instructional_template" | "manual" | "ai";
export type SaudiVoiceId = "ar-SA-ZariyahNeural" | "ar-SA-HamedNeural";
export type VideoTemplateId = "nabda-educational-v1";

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VERSION_CONFLICT"
  | "CONTENT_HASH_MISMATCH"
  | "FACTS_NEED_REVIEW"
  | "SCRIPT_NOT_APPROVED"
  | "VIDEO_NOT_READY"
  | "AI_UNAVAILABLE"
  | "INVALID_MODEL_OUTPUT"
  | "SOURCE_TOO_LONG"
  | "TTS_UNAVAILABLE"
  | "RENDER_QUOTA"
  | "RATE_LIMITED"
  | "INTEGRATION_NOT_CONFIGURED";

export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  retryable: boolean;
  requestId?: string;
}

export interface SourceContent { id: string; text: string; mode: ProjectMode; createdAt: string }
export interface SourceFact {
  id: string;
  statement: string;
  /** A verbatim quotation copied from the source; never invented. */
  quote: string;
  /** Character offsets in the current SourceContent.text. */
  start: number;
  end: number;
  state: ClaimReview;
}
export interface ScriptSections { hook: string; body: string; cta: string }
export interface ScriptVersion {
  id: string;
  projectId: string;
  version: number;
  sections: ScriptSections;
  /** Deterministic SHA-256 hex digest (`sha256:<64-hex>`) of canonicalized sections. */
  contentHash: string;
  createdAt: string;
  origin: ScriptOrigin;
  /** True when any section still holds unedited local instructional placeholder text. */
  containsInstructionalPlaceholders: boolean;
  sourceFactIds: string[];
}
export interface ApprovalEvent {
  id: string;
  projectId: string;
  targetId: string;
  kind: "script" | "video";
  decision: "approved" | "rejected";
  createdAt: string;
  /** SHA-256 digest of the approved immutable script sections or video asset. */
  contentHash?: string;
  persistence: "local_demo" | "server";
}
export interface GeneratedAsset {
  id: string; projectId: string; kind: "video" | "audio" | "caption";
  url: string; mimeType: string; sourceVersionId: string;
}
export interface VideoJob {
  id: string; projectId: string; scriptVersionId: string;
  state: VideoJobState; stageLabel: string; assetId?: string; errorCode?: string;
}
export interface StylePreference {
  id: string; rule: string; enabled: boolean; createdAt: string;
  origin: "manual_local" | "approved_edit" | "server";
}
export interface Project {
  id: string; name: string; source: SourceContent; audience: string;
  contentType: string; dialect: string; tone: string; status: ProjectStatus;
  facts: SourceFact[]; scripts: ScriptVersion[]; approvals: ApprovalEvent[];
  videoJobs: VideoJob[]; assets: GeneratedAsset[]; socialCaption: string;
  createdAt: string; updatedAt: string;
}
export interface CreateProjectInput {
  sourceText: string; mode: ProjectMode; audience: string;
  contentType: string; dialect: string; tone: string;
}
export interface CreateDraftInput { projectId: string; sections: ScriptSections }
export interface ReviseScriptInput {
  projectId: string;
  baseVersionId: string;
  sections: ScriptSections;
}
export interface ApproveScriptInput {
  projectId: string;
  versionId: string;
  expectedContentHash: string;
}
export interface VideoStartInput {
  projectId: string;
  scriptVersionId: string;
  voiceId: SaudiVoiceId | string;
  templateId: VideoTemplateId | string;
  /** Mandatory canonical SHA-256 digest (`sha256:<64-hex>`) of the approved ScriptVersion sections. */
  expectedScriptHash: string;
}
