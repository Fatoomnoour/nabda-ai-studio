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

export function hasInstructionalTemplateSections(sections: ScriptSections): boolean {
  return (
    isInstructionalTemplateText(sections.hook) ||
    isInstructionalTemplateText(sections.body) ||
    isInstructionalTemplateText(sections.cta)
  );
}

export function canonicalizeScriptSections(sections: ScriptSections): string {
  const normalize = (value: string) => value.replace(/\r\n?/g, "\n").trim();
  return JSON.stringify({
    hook: normalize(sections.hook),
    body: normalize(sections.body),
    cta: normalize(sections.cta),
  });
}

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(value: number, bits: number): number {
  return (value >>> bits) | (value << (32 - bits));
}

function sha256Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const w = new Array<number>(64);

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;
    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    hash[0] = (hash[0] + a) >>> 0;
    hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0;
    hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0;
    hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0;
    hash[7] = (hash[7] + h) >>> 0;
  }

  return hash.map(word => word.toString(16).padStart(8, "0")).join("");
}

export function computeScriptContentHash(sections: ScriptSections): string {
  return `sha256:${sha256Hex(canonicalizeScriptSections(sections))}`;
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
