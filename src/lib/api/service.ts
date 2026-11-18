import type {
  ApiErrorCode,
  ApprovalEvent,
  CreateProjectInput,
  Project,
  ScriptSections,
  ScriptVersion,
  StylePreference,
  VideoJob,
  VideoStartInput,
} from "@/lib/contracts/domain";
import { APTITUDE_CAPTION, APTITUDE_SCRIPT, APTITUDE_SOURCE, extractDemoFacts } from "@/lib/fixtures/aptitude";
import {
  computeScriptContentHash,
  hasInstructionalTemplateSections,
  makeId,
  validateContentInput,
  validateScriptSections,
} from "@/lib/utils/client";

export interface NabdaService {
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(data: CreateProjectInput): Promise<Project>;
  prepareDraft(projectId: string): Promise<{ project: Project; provenance: string }>;
  reviseScript(projectId: string, sections: ScriptSections, baseVersionId: string): Promise<Project>;
  approveScript(projectId: string, versionId: string, expectedContentHash: string): Promise<Project>;
  listStylePreferences(): Promise<StylePreference[]>;
  saveStylePreference(rule: string): Promise<StylePreference[]>;
  toggleStylePreference(id: string): Promise<StylePreference[]>;
  requestVideoRender(input: VideoStartInput): Promise<VideoJob>;
}

const PROJECTS_KEY = "nabda-starter-projects-v1";
const PREFS_KEY = "nabda-starter-style-v1";

export class NabdaContractError extends Error {
  readonly code: ApiErrorCode;
  readonly retryable: boolean;

  constructor(code: ApiErrorCode, message: string, retryable = false) {
    super(message);
    this.name = "NabdaContractError";
    this.code = code;
    this.retryable = retryable;
  }
}

export class IntegrationNotConfiguredError extends NabdaContractError {
  constructor(message = "توليد الفيديو الفعلي غير متصل بالخادم في هذه النسخة.") {
    super("INTEGRATION_NOT_CONFIGURED", message, false);
    this.name = "IntegrationNotConfiguredError";
  }
}

function normalizeStoredScriptVersion(raw: ScriptVersion): ScriptVersion {
  const containsInstructionalPlaceholders =
    typeof raw.containsInstructionalPlaceholders === "boolean"
      ? raw.containsInstructionalPlaceholders
      : hasInstructionalTemplateSections(raw.sections);
  return {
    ...raw,
    contentHash: raw.contentHash || computeScriptContentHash(raw.sections),
    containsInstructionalPlaceholders,
  };
}

/**
 * An explicit offline development adapter. It never calls AI, TTS, or a renderer.
 * Data remains in the user's browser (localStorage); it is NOT server approval.
 */
export class LocalDevelopmentService implements NabdaService {
  private loadProjects(): Project[] {
    if (typeof window === "undefined") return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]") as Project[];
      return parsed.map(project => ({
        ...project,
        scripts: (project.scripts || []).map(normalizeStoredScriptVersion),
      }));
    } catch {
      return [];
    }
  }
  private saveProjects(projects: Project[]) {
    if (typeof window !== "undefined") localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }
  private updateProject(id: string, update: (project: Project) => Project): Project {
    const all = this.loadProjects();
    const index = all.findIndex(p => p.id === id);
    if (index < 0) throw new NabdaContractError("NOT_FOUND", "المشروع غير موجود في بيانات المتصفح.");
    const next = update(all[index]);
    all[index] = { ...next, updatedAt: new Date().toISOString() };
    this.saveProjects(all);
    return all[index];
  }
  async listProjects() { return this.loadProjects().sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)); }
  async getProject(id: string) { return this.loadProjects().find(p => p.id === id) || null; }
  async createProject(data: CreateProjectInput): Promise<Project> {
    const validation = validateContentInput(data);
    if (!validation.valid) {
      throw new NabdaContractError("INVALID_INPUT", validation.sourceError || validation.audienceError || "بيانات المشروع غير مكتملة.");
    }
    const now = new Date().toISOString();
    const project: Project = {
      id: makeId("prj"), name: data.sourceText.trim().slice(0, 48),
      source: { id: makeId("src"), text: data.sourceText.trim(), mode: data.mode, createdAt: now },
      audience: data.audience.trim(), contentType: data.contentType, dialect: data.dialect, tone: data.tone,
      facts: [], scripts: [], approvals: [], videoJobs: [], assets: [],
      status: "draft", socialCaption: "", createdAt: now, updatedAt: now,
    };
    this.saveProjects([project, ...this.loadProjects()]);
    return project;
  }
  async prepareDraft(id: string): Promise<{ project: Project; provenance: string }> {
    const project = this.updateProject(id, p => {
      const isFixture = p.source.text.trim() === APTITUDE_SOURCE.trim();
      // Custom sources are copied into a manual review template; no AI is invoked.
      const preview = p.source.text.replace(/\s+/g, " ").slice(0, 480);
      const sections: ScriptSections = isFixture ? { ...APTITUDE_SCRIPT } : {
        hook: "اكتب افتتاحية جاذبة تمهّد للموضوع…",
        body: preview,
        cta: "اكتب دعوة واضحة للتفاعل أو التطبيق…",
      };
      const containsInstructionalPlaceholders = !isFixture && hasInstructionalTemplateSections(sections);
      const next: ScriptVersion = {
        id: makeId("sv"), projectId: p.id, version: p.scripts.length + 1, sections,
        contentHash: computeScriptContentHash(sections),
        createdAt: new Date().toISOString(),
        origin: isFixture ? "development_fixture" : "instructional_template",
        containsInstructionalPlaceholders,
        sourceFactIds: isFixture ? ["fact_1", "fact_2", "fact_3"] : [],
      };
      return { ...p, facts: isFixture ? extractDemoFacts(p.source.text) : [],
        scripts: [...p.scripts, next], status: "script_ready",
        socialCaption: isFixture ? APTITUDE_CAPTION : "المنشور الاجتماعي يُنشأ تلقائيًا بعد ربط خدمة الذكاء الاصطناعي." };
    });
    return { project, provenance: "Development fixture / Instructional template — no AI API used" };
  }
  async reviseScript(id: string, sections: ScriptSections, baseVersionId: string): Promise<Project> {
    if (!baseVersionId || !baseVersionId.trim()) {
      throw new NabdaContractError("INVALID_INPUT", "يرجى تحديد معرف النسخة الأساسية قبل حفظ التعديل.");
    }
    const sectionError = validateScriptSections(sections);
    if (sectionError) throw new NabdaContractError("INVALID_INPUT", sectionError);
    return this.updateProject(id, p => {
      const previous = p.scripts.at(-1);
      if (!previous) throw new NabdaContractError("NOT_FOUND", "يرجى إنشاء مسودة أولًا.");
      if (previous.id !== baseVersionId) {
        throw new NabdaContractError("VERSION_CONFLICT", "تعارض في إصدار السكريبت: توجد نسخة أحدث من النسخة الأساسية المطلوب التعديل عليها.");
      }
      const nextSections: ScriptSections = { ...sections };
      const draft: ScriptVersion = {
        id: makeId("sv"), projectId: p.id, version: previous.version + 1,
        sections: nextSections,
        contentHash: computeScriptContentHash(nextSections),
        createdAt: new Date().toISOString(),
        origin: "manual",
        containsInstructionalPlaceholders: hasInstructionalTemplateSections(nextSections),
        sourceFactIds: previous.sourceFactIds,
      };
      return { ...p, scripts: [...p.scripts, draft], status: "script_ready" };
    });
  }
  async approveScript(id: string, versionId: string, expectedContentHash: string): Promise<Project> {
    if (!expectedContentHash || !expectedContentHash.trim()) {
      throw new NabdaContractError("INVALID_INPUT", "يرجى تمرير بصمة محتوى السكريبت المتوقعة قبل الاعتماد.");
    }
    return this.updateProject(id, p => {
      const current = p.scripts.at(-1);
      if (!current || current.id !== versionId) {
        throw new NabdaContractError("VERSION_CONFLICT", "الإصدار المطلوب اعتماده ليس الإصدار الحالي.");
      }
      const sectionError = validateScriptSections(current.sections);
      if (sectionError || current.containsInstructionalPlaceholders) {
        throw new NabdaContractError("INVALID_INPUT", sectionError || "لا يمكن اعتماد قالب إرشادي غير محرّر.");
      }
      const actualHash = computeScriptContentHash(current.sections);
      if (expectedContentHash !== actualHash) {
        throw new NabdaContractError("CONTENT_HASH_MISMATCH", "محتوى السكريبت تغيّر عن البصمة المتوقعة؛ يرجى حفظ التعديلات أولًا.");
      }
      const event: ApprovalEvent = {
        id: makeId("apr"), projectId: p.id, targetId: current.id,
        kind: "script", decision: "approved", contentHash: actualHash, persistence: "local_demo", createdAt: new Date().toISOString(),
      };
      return { ...p, approvals: [...p.approvals, event], status: "script_approved" };
    });
  }
  async listStylePreferences(): Promise<StylePreference[]> {
    try { return typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem(PREFS_KEY) || "[]") as StylePreference[]; }
    catch { return []; }
  }
  async saveStylePreference(rule: string): Promise<StylePreference[]> {
    const clean = rule.trim();
    if (clean.length < 8) throw new NabdaContractError("INVALID_INPUT", "يرجى كتابة قاعدة أسلوب واضحة (8 أحرف على الأقل).");
    const list = await this.listStylePreferences();
    const next = [...list, { id: makeId("sty"), rule: clean, createdAt: new Date().toISOString(), origin: "manual_local" as const, enabled: true }];
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    return next;
  }
  async toggleStylePreference(id: string): Promise<StylePreference[]> {
    const next = (await this.listStylePreferences()).map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    return next;
  }
  async requestVideoRender(input: VideoStartInput): Promise<VideoJob> {
    if (
      !input?.projectId ||
      !input.scriptVersionId ||
      !input.voiceId?.trim() ||
      !input.templateId?.trim() ||
      !input.expectedScriptHash?.trim()
    ) {
      throw new NabdaContractError("INVALID_INPUT", "بيانات طلب رندر الفيديو غير مكتملة (المشروع، النسخة، الصوت، القالب، أو بصمة السكريبت).");
    }
    const project = await this.getProject(input.projectId);
    if (!project) {
      throw new NabdaContractError("NOT_FOUND", "المشروع غير موجود في بيانات المتصفح.");
    }
    const current = project.scripts.at(-1);
    const latestApproval = current
      ? [...project.approvals]
          .reverse()
          .find(a => a.kind === "script" && a.decision === "approved" && a.targetId === current.id)
      : undefined;
    if (!current || current.id !== input.scriptVersionId || !latestApproval) {
      throw new NabdaContractError("SCRIPT_NOT_APPROVED", "يجب اعتماد النسخة الحالية من السكريبت أولًا قبل طلب رندر الفيديو.");
    }
    if (current.containsInstructionalPlaceholders) {
      throw new NabdaContractError("INVALID_INPUT", "لا يمكن بدء الرندر بنص إرشادي غير مكتمل.");
    }
    const currentHash = computeScriptContentHash(current.sections);
    if (
      input.expectedScriptHash !== currentHash ||
      (latestApproval.contentHash && latestApproval.contentHash !== currentHash)
    ) {
      throw new NabdaContractError("CONTENT_HASH_MISMATCH", "بصمة السكريبت المطلوبة للرندر لا تطابق النسخة الحالية المعتمدة.");
    }
    throw new IntegrationNotConfiguredError();
  }
}

/** Real API adapter boundary: intentionally fails closed until Backend Lead implements /api contracts. */
export class HttpNabdaService implements NabdaService {
  private unimplemented(): never { throw new IntegrationNotConfiguredError("خادم الـ API غير مفعّل في هذه النسخة؛ يرجى استخدام وضع التطوير المحلي (Development Adapter)."); }
  async listProjects(): Promise<Project[]> { return this.unimplemented(); }
  async getProject(): Promise<Project|null> { return this.unimplemented(); }
  async createProject(): Promise<Project> { return this.unimplemented(); }
  async prepareDraft(): Promise<{project: Project; provenance: string}> { return this.unimplemented(); }
  async reviseScript(): Promise<Project> { return this.unimplemented(); }
  async approveScript(): Promise<Project> { return this.unimplemented(); }
  async listStylePreferences(): Promise<StylePreference[]> { return this.unimplemented(); }
  async saveStylePreference(): Promise<StylePreference[]> { return this.unimplemented(); }
  async toggleStylePreference(): Promise<StylePreference[]> { return this.unimplemented(); }
  async requestVideoRender(): Promise<VideoJob> { return this.unimplemented(); }
}

export function createNabdaService(): NabdaService {
  return process.env.NEXT_PUBLIC_NABDA_ADAPTER === "http" ? new HttpNabdaService() : new LocalDevelopmentService();
}
