import type { Project, ScriptSections } from "@/lib/contracts/domain";

export function makeId(prefix: string): string {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${suffix}`;
}
export function formatArabicDate(value: string): string {
  return new Date(value).toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" });
}
export function getScriptText(sections: { hook: string; body: string; cta: string }): string {
  return [sections.hook, sections.body, sections.cta].filter(Boolean).join("\n\n");
}

export interface ContentValidationResult {
  valid: boolean;
  sourceError: string | null;
  audienceError: string | null;
}

export function validateContentInput(input: { sourceText: string; audience: string }): ContentValidationResult {
  const trimmedSource = input.sourceText.trim();
  const trimmedAudience = input.audience.trim();
  const sourceError = trimmedSource.length < 20
    ? "يجب أن لا يقل النص عن 20 حرفًا."
    : input.sourceText.length > 3000 || trimmedSource.length > 3000
      ? "الحد الأقصى للنص هو 3000 حرف."
      : null;
  const audienceError = trimmedAudience.length < 3
    ? "يرجى تحديد الجمهور المستهدف (3 أحرف على الأقل)."
    : null;
  return { valid: !sourceError && !audienceError, sourceError, audienceError };
}

const INSTRUCTIONAL_TEMPLATES = new Set([
  "اكتب افتتاحية جاذبة تمهّد للموضوع…",
  "اكتب افتتاحية جاذبة تمهّد للموضوع...",
  "اكتب دعوة واضحة للتفاعل أو التطبيق…",
  "اكتب دعوة واضحة للتفاعل أو التطبيق...",
]);

export function isInstructionalTemplateText(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  return INSTRUCTIONAL_TEMPLATES.has(normalized);
}

export function validateScriptSections(sections: ScriptSections): string | null {
  if (!sections.hook.trim()) return "يرجى كتابة الخطّاف قبل الحفظ أو الاعتماد.";
  if (isInstructionalTemplateText(sections.hook)) {
    return "يرجى استبدال النص الإرشادي في خانة الخطّاف بمحتوى فعلي قبل الحفظ أو الاعتماد.";
  }
  if (!sections.body.trim()) return "يرجى كتابة الفكرة الأساسية قبل الحفظ أو الاعتماد.";
  if (isInstructionalTemplateText(sections.body)) {
    return "يرجى استبدال النص الإرشادي في خانة الفكرة الأساسية بمحتوى فعلي قبل الحفظ أو الاعتماد.";
  }
  if (!sections.cta.trim()) return "يرجى كتابة الدعوة للتفاعل قبل الحفظ أو الاعتماد.";
  if (isInstructionalTemplateText(sections.cta)) {
    return "يرجى استبدال النص الإرشادي في خانة الدعوة للتفاعل بمحتوى فعلي قبل الحفظ أو الاعتماد.";
  }
  if (getScriptText({ hook: sections.hook.trim(), body: sections.body.trim(), cta: sections.cta.trim() }).length < 25) {
    return "السكريبت قصير جدًا؛ يرجى كتابة نص أوضح لا يقل عن 25 حرفًا قبل الحفظ.";
  }
  return null;
}

export type VersionApprovalLabel = "معتمد حاليًا" | "اعتماد سابق" | "غير معتمد";

export function getVersionApprovalLabel(
  project: Pick<Project, "scripts" | "approvals">,
  versionId: string,
): VersionApprovalLabel {
  const isApproved = project.approvals.some(
    a => a.kind === "script" && a.decision === "approved" && a.targetId === versionId,
  );
  if (!isApproved) return "غير معتمد";
  return project.scripts.at(-1)?.id === versionId ? "معتمد حاليًا" : "اعتماد سابق";
}
