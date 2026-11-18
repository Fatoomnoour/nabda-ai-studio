import { after, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

const require = createRequire(import.meta.url);
const rootUrl = new URL("../", import.meta.url);
const readSource = rel => readFileSync(new URL(rel, rootUrl), "utf8");
const readBytes = rel => readFileSync(new URL(rel, rootUrl));

function transpileTsToCjs(relPath, replacements = {}) {
  let code = ts.transpileModule(readSource(relPath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;

  for (const [specifier, target] of Object.entries(replacements)) {
    code = code.replaceAll(`"${specifier}"`, `"${target}"`);
  }
  return code;
}

const tempDir = mkdtempSync(join(tmpdir(), "nabda-p0-tests-"));
writeFileSync(join(tempDir, "client.cjs"), transpileTsToCjs("src/lib/utils/client.ts"));
writeFileSync(join(tempDir, "aptitude.cjs"), transpileTsToCjs("src/lib/fixtures/aptitude.ts"));
writeFileSync(
  join(tempDir, "service.cjs"),
  transpileTsToCjs("src/lib/api/service.ts", {
    "@/lib/utils/client": "./client.cjs",
    "@/lib/fixtures/aptitude": "./aptitude.cjs",
  }),
);

const clientMod = require(join(tempDir, "client.cjs"));
const aptitudeMod = require(join(tempDir, "aptitude.cjs"));
const serviceMod = require(join(tempDir, "service.cjs"));

const {
  validateContentInput,
  validateScriptSections,
  isInstructionalTemplateText,
  hasInstructionalTemplateSections,
  canonicalizeScriptSections,
  computeScriptContentHash,
  getVersionApprovalLabel,
} = clientMod;
const { APTITUDE_SOURCE, APTITUDE_SCRIPT, STARTER_STYLE_RULES } = aptitudeMod;
const { LocalDevelopmentService, HttpNabdaService, NabdaContractError, IntegrationNotConfiguredError } = serviceMod;

function createStorageMock() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
  };
}

const storage = createStorageMock();
globalThis.window = globalThis;
globalThis.localStorage = storage;

after(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

beforeEach(() => {
  storage.clear();
});

describe("Content form validation and service boundaries", () => {
  test("rejects short source, whitespace-only source, >3000 chars, and short audience", () => {
    const shortSrc = validateContentInput({ sourceText: "نص قصير", audience: "طلاب القدرات" });
    assert.equal(shortSrc.valid, false);
    assert.equal(shortSrc.sourceError, "يجب أن لا يقل النص عن 20 حرفًا.");
    assert.equal(shortSrc.audienceError, null);

    const spacesOnly = validateContentInput({ sourceText: " ".repeat(30), audience: "طلاب القدرات" });
    assert.equal(spacesOnly.valid, false);
    assert.equal(spacesOnly.sourceError, "يجب أن لا يقل النص عن 20 حرفًا.");

    const tooLong = validateContentInput({ sourceText: "أ".repeat(3001), audience: "طلاب القدرات" });
    assert.equal(tooLong.valid, false);
    assert.equal(tooLong.sourceError, "الحد الأقصى للنص هو 3000 حرف.");

    const shortAud = validateContentInput({ sourceText: "نص تعليمي كافٍ جدًا لاختبار التحقق.", audience: "طا" });
    assert.equal(shortAud.valid, false);
    assert.equal(shortAud.sourceError, null);
    assert.equal(shortAud.audienceError, "يرجى تحديد الجمهور المستهدف (3 أحرف على الأقل).");

    const ok = validateContentInput({ sourceText: "نص تعليمي كافٍ جدًا لاختبار التحقق.", audience: "طلاب القدرات" });
    assert.equal(ok.valid, true);
    assert.equal(ok.sourceError, null);
    assert.equal(ok.audienceError, null);
  });

  test("LocalDevelopmentService.createProject enforces input validation", async () => {
    const svc = new LocalDevelopmentService();
    await assert.rejects(
      () =>
        svc.createProject({
          sourceText: "قصير",
          mode: "source",
          audience: "طلاب القدرات",
          contentType: "تعليمي",
          dialect: "سعودية بيضاء",
          tone: "قريبة ومحفّزة",
        }),
      /20 حرفًا/,
    );
    await assert.rejects(
      () =>
        svc.createProject({
          sourceText: "نص تعليمي واضح وكافٍ لاختبار التحقق في الخدمة.",
          mode: "source",
          audience: " أب ",
          contentType: "تعليمي",
          dialect: "سعودية بيضاء",
          tone: "قريبة ومحفّزة",
        }),
      /الجمهور المستهدف/,
    );
  });
});

describe("Script section validation, revisions, approvals, and persistence", () => {
  test("rejects empty or instructional template sections even when combined text is >= 25 chars", async () => {
    assert.match(
      validateScriptSections({ hook: "   ", body: "نص طويل جدًا يكفي لتجاوز خمسة وعشرين حرفًا بسهولة", cta: "شاركنا" }),
      /الخطّاف/,
    );
    assert.match(
      validateScriptSections({
        hook: "اكتب افتتاحية جاذبة تمهّد للموضوع…",
        body: "نص طويل جدًا يكفي لتجاوز خمسة وعشرين حرفًا بسهولة",
        cta: "شاركنا الآن في التعليقات",
      }),
      /النص الإرشادي/,
    );
    assert.match(
      validateScriptSections({ hook: "افتتاحية طويلة جدًا تتجاوز الحد", body: "  ", cta: "شاركنا الآن" }),
      /الفكرة الأساسية/,
    );
    assert.match(
      validateScriptSections({ hook: "افتتاحية", body: "نص طويل جدًا يكفي لتجاوز خمسة وعشرين حرفًا بسهولة", cta: "" }),
      /الدعوة للتفاعل/,
    );
    assert.match(
      validateScriptSections({
        hook: "افتتاحية جاذبة تبدأ بسؤال مباشر للجمهور",
        body: "نص طويل جدًا يكفي لتجاوز خمسة وعشرين حرفًا بسهولة",
        cta: "اكتب دعوة واضحة للتفاعل أو التطبيق…",
      }),
      /النص الإرشادي/,
    );
    assert.equal(isInstructionalTemplateText("اكتب افتتاحية جاذبة تمهّد للموضوع…"), true);
    assert.equal(isInstructionalTemplateText("اكتب دعوة واضحة للتفاعل أو التطبيق…"), true);
    assert.equal(isInstructionalTemplateText("عنوان افتتاحي مكتوب بوضوح"), false);
    assert.match(
      validateScriptSections({ hook: "أ", body: "ب", cta: "ج" }),
      /قصير جدًا/,
    );
    assert.equal(validateScriptSections(APTITUDE_SCRIPT), null);

    const svc = new LocalDevelopmentService();
    const created = await svc.createProject({
      sourceText: APTITUDE_SOURCE,
      mode: "source",
      audience: "طلاب القدرات",
      contentType: "تعليمي",
      dialect: "سعودية بيضاء",
      tone: "قريبة ومحفّزة",
    });
    const { project: drafted } = await svc.prepareDraft(created.id);
    const v1Id = drafted.scripts[0].id;

    await assert.rejects(
      () => svc.reviseScript(created.id, { hook: "", body: APTITUDE_SCRIPT.body, cta: APTITUDE_SCRIPT.cta }, v1Id),
      /الخطّاف/,
    );
    await assert.rejects(
      () => svc.reviseScript(created.id, { hook: APTITUDE_SCRIPT.hook, body: "   ", cta: APTITUDE_SCRIPT.cta }, v1Id),
      /الفكرة الأساسية/,
    );
    await assert.rejects(
      () => svc.reviseScript(created.id, { hook: APTITUDE_SCRIPT.hook, body: APTITUDE_SCRIPT.body, cta: "" }, v1Id),
      /الدعوة للتفاعل/,
    );

    const customCreated = await svc.createProject({
      sourceText: "الذكاء الاصطناعي في التعليم يساعد المعلم على تخصيص التمارين حسب مستوى الطالب.",
      mode: "source",
      audience: "معلمو المرحلة الثانوية",
      contentType: "تعليمي",
      dialect: "سعودية بيضاء",
      tone: "قريبة ومحفّزة",
    });
    const { project: customDrafted } = await svc.prepareDraft(customCreated.id);
    await assert.rejects(
      () => svc.approveScript(customDrafted.id, customDrafted.scripts[0].id, customDrafted.scripts[0].contentHash),
      /النص الإرشادي/,
    );
  });

  test("preserves immutable versions, invalidates approval on edit, labels versions accurately, and persists", async () => {
    const svc1 = new LocalDevelopmentService();
    const created = await svc1.createProject({
      sourceText: APTITUDE_SOURCE,
      mode: "source",
      audience: "طلاب القدرات",
      contentType: "تعليمي",
      dialect: "سعودية بيضاء",
      tone: "قريبة ومحفّزة",
    });
    const { project: drafted } = await svc1.prepareDraft(created.id);
    assert.equal(drafted.scripts.length, 1);
    assert.equal(drafted.scripts[0].origin, "development_fixture");
    assert.equal(drafted.scripts[0].containsInstructionalPlaceholders, false);
    assert.match(drafted.scripts[0].contentHash, /^sha256:[0-9a-f]{64}$/);
    assert.equal(drafted.facts.length, 3);
    assert.equal(getVersionApprovalLabel(drafted, drafted.scripts[0].id), "غير معتمد");

    const approvedV1 = await svc1.approveScript(drafted.id, drafted.scripts[0].id, drafted.scripts[0].contentHash);
    assert.equal(approvedV1.status, "script_approved");
    assert.equal(approvedV1.approvals[0].contentHash, drafted.scripts[0].contentHash);
    assert.equal(getVersionApprovalLabel(approvedV1, approvedV1.scripts[0].id), "معتمد حاليًا");

    const revisedV2 = await svc1.reviseScript(
      approvedV1.id,
      {
        hook: "افتتاحية معدلة لاختبار إبطال الاعتماد السابق",
        body: APTITUDE_SCRIPT.body,
        cta: APTITUDE_SCRIPT.cta,
      },
      approvedV1.scripts[0].id,
    );
    assert.equal(revisedV2.scripts.length, 2);
    assert.equal(revisedV2.scripts[0].sections.hook, APTITUDE_SCRIPT.hook);
    assert.equal(revisedV2.scripts[1].origin, "manual");
    assert.equal(revisedV2.scripts[1].containsInstructionalPlaceholders, false);
    assert.equal(revisedV2.status, "script_ready");
    assert.equal(getVersionApprovalLabel(revisedV2, revisedV2.scripts[0].id), "اعتماد سابق");
    assert.equal(getVersionApprovalLabel(revisedV2, revisedV2.scripts[1].id), "غير معتمد");

    await assert.rejects(
      () => svc1.approveScript(revisedV2.id, revisedV2.scripts[0].id, revisedV2.scripts[0].contentHash),
      /الإصدار الحالي/,
    );

    const approvedV2 = await svc1.approveScript(revisedV2.id, revisedV2.scripts[1].id, revisedV2.scripts[1].contentHash);
    assert.equal(approvedV2.status, "script_approved");
    assert.equal(getVersionApprovalLabel(approvedV2, approvedV2.scripts[0].id), "اعتماد سابق");
    assert.equal(getVersionApprovalLabel(approvedV2, approvedV2.scripts[1].id), "معتمد حاليًا");

    await svc1.saveStylePreference("استخدام أمثلة سعودية واضحة ومختصرة");

    const svc2 = new LocalDevelopmentService();
    const reloaded = await svc2.getProject(approvedV2.id);
    assert.ok(reloaded);
    assert.equal(reloaded.scripts.length, 2);
    assert.equal(reloaded.status, "script_approved");
    assert.equal(getVersionApprovalLabel(reloaded, reloaded.scripts[1].id), "معتمد حاليًا");

    const prefs = await svc2.listStylePreferences();
    assert.equal(prefs.length, 1);
    assert.equal(prefs[0].rule, "استخدام أمثلة سعودية واضحة ومختصرة");
  });
});

describe("P01B brand assets, BiDi guards, and Saudi localization checks (static only)", () => {
  test("original logo and dark-surface derivative PNGs are valid and properly dimensioned", () => {
    assert.ok(existsSync(new URL("public/brand/nabda-logo-dark.png", rootUrl)));
    const orig = readBytes("public/brand/nabda-logo.png");
    const dark = readBytes("public/brand/nabda-logo-dark.png");
    assert.deepEqual([...orig.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.deepEqual([...dark.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(orig.readUInt32BE(16), 528);
    assert.equal(orig.readUInt32BE(20), 166);
    assert.equal(dark.readUInt32BE(16), 428);
    assert.equal(dark.readUInt32BE(20), 109);
  });

  test("ContentInput, ScriptStudio, VideoStudio, and NabdaWorkspace preserve accessibility & BiDi fixes", () => {
    const contentInput = readSource("src/features/content/ContentInput.tsx");
    assert.match(contentInput, /noValidate/);
    assert.match(contentInput, /validateContentInput/);
    assert.match(contentInput, /aria-describedby="source-text-feedback"/);
    assert.match(contentInput, /disabled=\{busy\}/);
    assert.match(contentInput, /className="char-counter"/);

    const scriptStudio = readSource("src/features/script/ScriptStudio.tsx");
    assert.match(scriptStudio, /getVersionApprovalLabel/);
    assert.match(scriptStudio, /validateScriptSections/);
    assert.match(scriptStudio, /isInstructionalTemplateText/);
    assert.match(scriptStudio, /computeScriptContentHash/);
    assert.match(scriptStudio, /instructional_template/);
    assert.match(scriptStudio, /aria-pressed=\{activeFact === fact\.id\}/);
    assert.match(scriptStudio, /event\.key === "Escape"/);
    assert.match(scriptStudio, /document\.body\.style\.overflow = "hidden"/);

    const finalReview = readSource("src/features/review/FinalReview.tsx");
    assert.match(finalReview, /STARTER_STYLE_RULES/);
    assert.match(finalReview, /sample-rule-chip/);

    const videoStudio = readSource("src/features/video/VideoStudio.tsx");
    assert.match(videoStudio, /dir="ltr">9:16 · 720×1280/);
    assert.match(videoStudio, /ليست فيديو أو صوتًا مُنتجًا/);
    assert.match(videoStudio, /isInstructionalTemplateText/);
    assert.match(videoStudio, /className="primary-btn full" disabled aria-describedby="render-disabled-hint"/);

    const workspace = readSource("src/components/NabdaWorkspace.tsx");
    assert.match(workspace, /event\.key === "Escape"/);
    assert.match(workspace, /document\.body\.style\.overflow = "hidden"/);
    assert.match(workspace, /<bdi>\{p\.name\}<\/bdi>/);
    assert.match(workspace, /title=\{p\.name\}/);
    assert.match(workspace, /className="pipe"/);
    assert.equal((workspace.match(/className="pipe-step /g) || []).length, 4);
    assert.match(workspace, /<span className="pipe-step-label">الاعتماد البشري<\/span>/);
    assert.doesNotMatch(workspace, /<span>فيديو 9:16<\/span>/);
    assert.doesNotMatch(workspace, /currentApproval/);

    const css = readSource("src/app/globals.css");
    assert.match(css, /\.sidebar\s*\{[^}]*overflow-y:\s*auto/);
    assert.match(css, /\.sidebar\s*\{[^}]*max-height:\s*100dvh/);
    assert.match(css, /\.sidebar\s*\{[^}]*border-inline-end:\s*1px solid/);
    assert.match(css, /\.pipe\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
    assert.match(css, /\.char-counter\s*\{[^}]*white-space:\s*nowrap/);
    assert.match(css, /\.char-counter\s*\{[^}]*flex-shrink:\s*0/);
    assert.match(css, /\.primary-btn:disabled[\s\S]*?border:\s*1px dashed/);
    assert.match(css, /\.metrics-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
    assert.match(css, /@media \(max-width: 380px\)[\s\S]*?\.metrics-grid\s*\{\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
    assert.doesNotMatch(css, /@media \(max-width: 380px\)[\s\S]*?\.video-scene\s*\{\s*max-width:\s*100%/);
    assert.match(css, /\.home-bottom\s*\{[^}]*align-items:\s*stretch/);
    assert.match(css, /\.form-layout\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);[^}]*align-items:\s*stretch/);
    assert.match(css, /\.review-grid\s*\{[^}]*align-items:\s*stretch/);
    assert.match(css, /\.studio-columns\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+360px/);
  });

  test("UI and service sources contain no Egyptian colloquialisms, unnecessary feminine imperatives, or removed English badges", () => {
    const uiFiles = [
      "src/app/layout.tsx",
      "src/components/NabdaWorkspace.tsx",
      "src/features/content/ContentInput.tsx",
      "src/features/script/ScriptStudio.tsx",
      "src/features/video/VideoStudio.tsx",
      "src/features/review/FinalReview.tsx",
      "src/lib/utils/client.ts",
      "src/lib/api/service.ts",
    ];
    const forbiddenPattern = /ابدأي|ابدئي|راجعي|اختاري|شاركي|اعتمدي|ليكي|مفيش|عشان|دلوقتي|بيتم|لسه|اتجهزت|اتحفظت|عايزة|توصلي|بيحفظ|بينشئ|تفضليها|بتخلّي|شوفي|إيه|بتتخزن|اكتبي|أنشئي|تحاولين|ارجعي|كمّلي|جرّبي/;
    const unwantedEnglishUiPattern = /LOCAL PROTOTYPE|MVP Path|>localStorage<|SCRIPT STUDIO|Safe Zone|Not connected|"Local Only"|"Pending"|"Waiting for AI"|"Fixture"|EDITORIAL MEMORY|API Contract · DRAFT|Source Grounding|الـ Backend/;
    for (const file of uiFiles) {
      const content = readSource(file);
      assert.doesNotMatch(content, forbiddenPattern, `Unexpected localized phrasing in ${file}`);
      assert.doesNotMatch(content, unwantedEnglishUiPattern, `Unexpected English badge/status label in ${file}`);
    }
    const fixtureContent = readSource("src/lib/fixtures/aptitude.ts");
    assert.doesNotMatch(fixtureContent, /اختاري|ابدأي|راجعي|شوفي/);
  });
});

describe("P02A frozen API contracts, concurrency, content hashes, and video guards", () => {
  test("independent Node SHA-256 oracle verifies ASCII, Arabic, mixed, emoji, CRLF/LF, whitespace, and mutation sensitivity", () => {
    const oracleHash = sections => {
      const normalize = v => v.replace(/\r\n?/g, "\n").trim();
      const canonical = JSON.stringify({
        hook: normalize(sections.hook),
        body: normalize(sections.body),
        cta: normalize(sections.cta),
      });
      return `sha256:${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
    };

    const vectors = [
      {
        name: "simple ASCII",
        sections: { hook: "Hello world", body: "Simple ASCII body for testing.", cta: "Click here" },
      },
      {
        name: "pure Arabic",
        sections: APTITUDE_SCRIPT,
      },
      {
        name: "Arabic mixed with Latin",
        sections: {
          hook: "مراجعة معيار HTTP/2 و JSON",
          body: "ربط Next.js 16 مع TypeScript 5.9",
          cta: "تابع التحديثات على GitHub",
        },
      },
      {
        name: "Unicode with emoji",
        sections: {
          hook: "قلم : كتابة ✍️ = مقص : قص ✂️",
          body: "تجربة نبضة 🇸🇦 لصناعة المحتوى 🚀",
          cta: "شاركنا رأيك 💡",
        },
      },
      {
        name: "multi-block UTF-8 payload (>256 bytes)",
        sections: {
          hook: "اختبار التناظر اللفظي — ".repeat(6),
          body: "فقرة عربية طويلة للتحقق من تعدد الكتل في خوارزمية SHA-256 ".repeat(10),
          cta: "أكمل المراجعة البشرية قبل التصدير النهائي ✅",
        },
      },
    ];

    for (const v of vectors) {
      const actual = computeScriptContentHash(v.sections);
      const expected = oracleHash(v.sections);
      assert.equal(actual, expected, `Oracle SHA-256 mismatch for ${v.name}`);
      assert.equal(actual, computeScriptContentHash({ ...v.sections }), `Non-deterministic hash for ${v.name}`);
    }

    // CRLF / CR / leading & trailing whitespace invariance
    const base = {
      hook: "عنوان افتتاحي تجريبي",
      body: "سطر أول\nسطر ثاني مع التناظر ✍️",
      cta: "شاركنا إجابتك",
    };
    const crlfSpaced = {
      hook: "  \t\r\nعنوان افتتاحي تجريبي\r\n  ",
      body: "  \nسطر أول\r\nسطر ثاني مع التناظر ✍️\r\n\t",
      cta: "\r\n  شاركنا إجابتك  \n",
    };
    assert.equal(canonicalizeScriptSections(crlfSpaced), canonicalizeScriptSections(base));
    assert.equal(computeScriptContentHash(crlfSpaced), oracleHash(base));

    // Any section mutation produces a distinct digest
    assert.notEqual(computeScriptContentHash({ ...base, hook: `${base.hook}!` }), oracleHash(base));
    assert.notEqual(computeScriptContentHash({ ...base, body: `${base.body} المعدل` }), oracleHash(base));
    assert.notEqual(computeScriptContentHash({ ...base, cta: "تواصل الآن" }), oracleHash(base));

    assert.equal(hasInstructionalTemplateSections(base), false);
    assert.equal(
      hasInstructionalTemplateSections({
        hook: "اكتب افتتاحية جاذبة تمهّد للموضوع…",
        body: base.body,
        cta: base.cta,
      }),
      true,
    );
  });

  test("reviseScript enforces baseVersionId (VERSION_CONFLICT) and approveScript enforces expectedContentHash", async () => {
    const svc = new LocalDevelopmentService();
    const created = await svc.createProject({
      sourceText: APTITUDE_SOURCE,
      mode: "source",
      audience: "طلاب القدرات",
      contentType: "تعليمي",
      dialect: "سعودية بيضاء",
      tone: "قريبة ومحفّزة",
    });
    const { project: v1Proj } = await svc.prepareDraft(created.id);
    const v1 = v1Proj.scripts[0];

    await assert.rejects(
      () => svc.reviseScript(v1Proj.id, { ...APTITUDE_SCRIPT, hook: "تعديل لن يُقبل" }, "sv_stale_id"),
      err => err instanceof NabdaContractError && err.code === "VERSION_CONFLICT",
    );

    const v2Proj = await svc.reviseScript(
      v1Proj.id,
      { ...APTITUDE_SCRIPT, hook: "خطّاف محدث للنسخة الثانية" },
      v1.id,
    );
    const v2 = v2Proj.scripts[1];

    await assert.rejects(
      () => svc.reviseScript(v2Proj.id, { ...APTITUDE_SCRIPT, hook: "تعديل بأساس قديم" }, v1.id),
      err => err instanceof NabdaContractError && err.code === "VERSION_CONFLICT",
    );

    await assert.rejects(
      () => svc.approveScript(v2Proj.id, v2.id, "sha256:0000000000000000000000000000000000000000000000000000000000000000"),
      err => err instanceof NabdaContractError && err.code === "CONTENT_HASH_MISMATCH",
    );

    const approvedV2 = await svc.approveScript(v2Proj.id, v2.id, v2.contentHash);
    assert.equal(approvedV2.status, "script_approved");
    assert.equal(approvedV2.approvals.at(-1)?.contentHash, v2.contentHash);
  });

  test("custom prepareDraft tags origin instructional_template, requestVideoRender validates VideoStartInput, and HttpNabdaService fails closed", async () => {
    const svc = new LocalDevelopmentService();
    assert.equal((await svc.listStylePreferences()).length, 0);
    assert.ok(STARTER_STYLE_RULES.length >= 2);

    const custom = await svc.createProject({
      sourceText: "ملخص درس المهارات الرقمية وتطبيقات تحليل البيانات للمرحلة الثانوية.",
      mode: "source",
      audience: "طلاب المرحلة الثانوية",
      contentType: "تعليمي",
      dialect: "سعودية بيضاء",
      tone: "قريبة ومحفّزة",
    });
    const { project: drafted } = await svc.prepareDraft(custom.id);
    assert.equal(drafted.scripts[0].origin, "instructional_template");
    assert.equal(drafted.scripts[0].containsInstructionalPlaceholders, true);

    await assert.rejects(
      () =>
        svc.requestVideoRender({
          projectId: "prj_missing",
          scriptVersionId: drafted.scripts[0].id,
          voiceId: "ar-SA-ZariyahNeural",
          templateId: "nabda-educational-v1",
          expectedScriptHash: drafted.scripts[0].contentHash,
        }),
      err => err instanceof NabdaContractError && err.code === "NOT_FOUND",
    );

    await assert.rejects(
      () =>
        svc.requestVideoRender({
          projectId: drafted.id,
          scriptVersionId: drafted.scripts[0].id,
          voiceId: "",
          templateId: "nabda-educational-v1",
          expectedScriptHash: drafted.scripts[0].contentHash,
        }),
      err => err instanceof NabdaContractError && err.code === "INVALID_INPUT",
    );

    await assert.rejects(
      () =>
        svc.requestVideoRender({
          projectId: drafted.id,
          scriptVersionId: drafted.scripts[0].id,
          voiceId: "ar-SA-ZariyahNeural",
          templateId: "nabda-educational-v1",
          expectedScriptHash: "",
        }),
      err => err instanceof NabdaContractError && err.code === "INVALID_INPUT",
    );

    await assert.rejects(
      () =>
        svc.requestVideoRender({
          projectId: drafted.id,
          scriptVersionId: drafted.scripts[0].id,
          voiceId: "ar-SA-ZariyahNeural",
          templateId: "nabda-educational-v1",
          expectedScriptHash: drafted.scripts[0].contentHash,
        }),
      err => err instanceof NabdaContractError && err.code === "SCRIPT_NOT_APPROVED",
    );

    const editedProj = await svc.reviseScript(
      drafted.id,
      {
        hook: "هل تعرف كيف يقرأ المحلل البيانات في ثوانٍ؟",
        body: "ملخص درس المهارات الرقمية وتطبيقات تحليل البيانات للمرحلة الثانوية مع أمثلة عملية.",
        cta: "اكتب مثالًا من حياتك اليومية لتحليل البيانات.",
      },
      drafted.scripts[0].id,
    );
    const sv2 = editedProj.scripts[1];
    assert.equal(sv2.origin, "manual");
    assert.equal(sv2.containsInstructionalPlaceholders, false);

    const approved = await svc.approveScript(editedProj.id, sv2.id, sv2.contentHash);

    await assert.rejects(
      () =>
        svc.requestVideoRender({
          projectId: approved.id,
          scriptVersionId: sv2.id,
          voiceId: "ar-SA-ZariyahNeural",
          templateId: "nabda-educational-v1",
          expectedScriptHash: "sha256:bad",
        }),
      err => err instanceof NabdaContractError && err.code === "CONTENT_HASH_MISMATCH",
    );

    await assert.rejects(
      () =>
        svc.requestVideoRender({
          projectId: approved.id,
          scriptVersionId: sv2.id,
          voiceId: "ar-SA-ZariyahNeural",
          templateId: "nabda-educational-v1",
          expectedScriptHash: sv2.contentHash,
        }),
      err => err instanceof IntegrationNotConfiguredError && err.code === "INTEGRATION_NOT_CONFIGURED",
    );

    const httpSvc = new HttpNabdaService();
    await assert.rejects(
      () =>
        httpSvc.requestVideoRender({
          projectId: approved.id,
          scriptVersionId: sv2.id,
          voiceId: "ar-SA-ZariyahNeural",
          templateId: "nabda-educational-v1",
          expectedScriptHash: sv2.contentHash,
        }),
      err => err instanceof IntegrationNotConfiguredError,
    );
  });

  test("legacy localStorage records backfill metadata safely without granting stale or instructional approval", async () => {
    const legacySections = {
      hook: "اكتب افتتاحية جاذبة تمهّد للموضوع…",
      body: "محتوى تجريبي قديم محفوظ بدون بصمة أو مؤشر قوالب إرشادية.",
      cta: "اكتب دعوة واضحة للتفاعل أو التطبيق…",
    };
    const legacyProject = {
      id: "prj_legacy_1",
      name: "مشروع قديم",
      source: { id: "src_1", text: legacySections.body, mode: "source", createdAt: "2026-11-17T10:00:00Z" },
      audience: "طلاب القدرات",
      contentType: "تعليمي",
      dialect: "سعودية بيضاء",
      tone: "قريبة ومحفّزة",
      status: "script_ready",
      facts: [],
      scripts: [
        {
          id: "sv_legacy_1",
          projectId: "prj_legacy_1",
          version: 1,
          sections: legacySections,
          createdAt: "2026-11-17T10:01:00Z",
          origin: "manual",
          sourceFactIds: [],
        },
      ],
      approvals: [],
      videoJobs: [],
      assets: [],
      socialCaption: "",
      createdAt: "2026-11-17T10:00:00Z",
      updatedAt: "2026-11-17T10:01:00Z",
    };
    storage.setItem("nabda-starter-projects-v1", JSON.stringify([legacyProject]));

    const svc = new LocalDevelopmentService();
    const hydrated = await svc.getProject("prj_legacy_1");
    assert.ok(hydrated);
    assert.equal(hydrated.status, "script_ready");
    assert.equal(hydrated.approvals.length, 0);
    assert.equal(getVersionApprovalLabel(hydrated, "sv_legacy_1"), "غير معتمد");
    assert.equal(hydrated.scripts[0].containsInstructionalPlaceholders, true);
    assert.equal(hydrated.scripts[0].contentHash, computeScriptContentHash(legacySections));

    await assert.rejects(
      () => svc.approveScript("prj_legacy_1", "sv_legacy_1", hydrated.scripts[0].contentHash),
      err => err instanceof NabdaContractError && err.code === "INVALID_INPUT",
    );
  });
});
