import type { ApprovalEvent, CreateProjectInput, Project, ScriptSections, ScriptVersion, StylePreference } from "@/lib/contracts/domain";
import { APTITUDE_CAPTION, APTITUDE_SCRIPT, APTITUDE_SOURCE, extractDemoFacts } from "@/lib/fixtures/aptitude";
import { makeId, validateContentInput, validateScriptSections } from "@/lib/utils/client";

export interface NabdaService {
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(data: CreateProjectInput): Promise<Project>;
  prepareDraft(projectId: string): Promise<{ project: Project; provenance: string }>;
  reviseScript(projectId: string, sections: ScriptSections): Promise<Project>;
  approveScript(projectId: string, versionId: string): Promise<Project>;
  listStylePreferences(): Promise<StylePreference[]>;
  saveStylePreference(rule: string): Promise<StylePreference[]>;
  toggleStylePreference(id: string): Promise<StylePreference[]>;
  requestVideoRender(): Promise<never>;
}

const PROJECTS_KEY = "nabda-starter-projects-v1";
const PREFS_KEY = "nabda-starter-style-v1";

export class IntegrationNotConfiguredError extends Error {
  constructor(message = "توليد الفيديو الفعلي غير متصل بالخادم في هذه النسخة.") {
    super(message);
    this.name = "IntegrationNotConfiguredError";
  }
}

/**
 * An explicit offline development adapter. It never calls AI, TTS, or a renderer.
 * Data remains in the user's browser (localStorage); it is NOT server approval.
 */
export class LocalDevelopmentService implements NabdaService {
  private loadProjects(): Project[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]") as Project[]; }
    catch { return []; }
  }
  private saveProjects(projects: Project[]) {
    if (typeof window !== "undefined") localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }
  private updateProject(id: string, update: (project: Project) => Project): Project {
    const all = this.loadProjects();
    const index = all.findIndex(p => p.id === id);
    if (index < 0) throw new Error("المشروع غير موجود في بيانات المتصفح.");
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
      throw new Error(validation.sourceError || validation.audienceError || "بيانات المشروع غير مكتملة.");
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
      const next: ScriptVersion = {
        id: makeId("sv"), projectId: p.id, version: p.scripts.length + 1, sections,
        createdAt: new Date().toISOString(), origin: isFixture ? "development_fixture" : "manual",
        sourceFactIds: isFixture ? ["fact_1", "fact_2", "fact_3"] : [],
      };
      return { ...p, facts: isFixture ? extractDemoFacts(p.source.text) : [],
        scripts: [...p.scripts, next], status: "script_ready",
        socialCaption: isFixture ? APTITUDE_CAPTION : "المنشور الاجتماعي يُنشأ تلقائيًا بعد ربط خدمة الذكاء الاصطناعي." };
    });
    return { project, provenance: "Development fixture / Manual template — no AI API used" };
  }
  async reviseScript(id: string, sections: ScriptSections): Promise<Project> {
    const sectionError = validateScriptSections(sections);
    if (sectionError) throw new Error(sectionError);
    return this.updateProject(id, p => {
      const previous = p.scripts.at(-1);
      if (!previous) throw new Error("يرجى إنشاء مسودة أولًا.");
      const draft: ScriptVersion = {
        id: makeId("sv"), projectId: p.id, version: previous.version + 1,
        sections: { ...sections }, createdAt: new Date().toISOString(), origin: "manual", sourceFactIds: previous.sourceFactIds,
      };
      return { ...p, scripts: [...p.scripts, draft], status: "script_ready" };
    });
  }
  async approveScript(id: string, versionId: string): Promise<Project> {
    return this.updateProject(id, p => {
      const current = p.scripts.at(-1);
      if (!current || current.id !== versionId) throw new Error("الإصدار المطلوب اعتماده ليس الإصدار الحالي.");
      const sectionError = validateScriptSections(current.sections);
      if (sectionError) throw new Error(sectionError);
      const event: ApprovalEvent = {
        id: makeId("apr"), projectId: p.id, targetId: current.id,
        kind: "script", decision: "approved", persistence: "local_demo", createdAt: new Date().toISOString(),
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
    if (clean.length < 8) throw new Error("يرجى كتابة قاعدة أسلوب واضحة (8 أحرف على الأقل).");
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
  async requestVideoRender(): Promise<never> {
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
  async requestVideoRender(): Promise<never> { return this.unimplemented(); }
}

export function createNabdaService(): NabdaService {
  return process.env.NEXT_PUBLIC_NABDA_ADAPTER === "http" ? new HttpNabdaService() : new LocalDevelopmentService();
}
