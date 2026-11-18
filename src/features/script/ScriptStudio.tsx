"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  CircleAlert,
  FileClock,
  FileSearch,
  GitCompareArrows,
  LockKeyhole,
  Save,
  ShieldCheck,
  Sparkles,
  Undo2,
} from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import type { Project, ScriptSections, SourceFact } from "@/lib/contracts/domain";
import {
  formatLocalizedDate,
  localizeApprovalLabel,
  localizeValidationMessage,
  WORKSPACE_EN,
} from "@/lib/i18n/translations";
import {
  computeScriptContentHash,
  getScriptText,
  getVersionApprovalLabel,
  isInstructionalTemplateText,
  validateScriptSections,
} from "@/lib/utils/client";

interface Props {
  project: Project;
  saving: boolean;
  onSave: (sections: ScriptSections, baseVersionId: string) => Promise<void>;
  onApprove: (versionId: string, expectedContentHash: string) => Promise<void>;
  onContinue: () => void;
}

function HighlightedSource({
  text,
  facts,
  active,
  containerRef,
}: {
  text: string;
  facts: SourceFact[];
  active: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const chunks: React.ReactNode[] = [];
  const sorted = facts.filter(f => text.slice(f.start, f.end) === f.quote).sort((a, b) => a.start - b.start);
  let cursor = 0;
  sorted.forEach(f => {
    if (f.start < cursor) return;
    if (f.start > cursor) chunks.push(<span key={`txt-${cursor}`}>{text.slice(cursor, f.start)}</span>);
    chunks.push(
      <mark className={active === f.id ? "fact-mark active" : "fact-mark"} key={f.id}>
        {text.slice(f.start, f.end)}
      </mark>,
    );
    cursor = f.end;
  });
  if (cursor < text.length) chunks.push(<span key="tail">{text.slice(cursor)}</span>);
  return (
    <div ref={containerRef} className="source-quotation" dir="auto">
      {chunks}
    </div>
  );
}

export function ScriptStudio({ project, saving, onSave, onApprove, onContinue }: Props) {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const t = WORKSPACE_EN.scriptStudio;

  const current = project.scripts.at(-1);
  const [sections, setSections] = useState<ScriptSections>(current?.sections || { hook: "", body: "", cta: "" });
  const [activeFact, setActiveFact] = useState<string | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const approveTriggerRef = useRef<HTMLButtonElement | null>(null);
  const modalCancelRef = useRef<HTMLButtonElement | null>(null);
  const sourceBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!confirmOpen) return;
    document.body.style.overflow = "hidden";
    modalCancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConfirmOpen(false);
        approveTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [confirmOpen]);

  useEffect(() => {
    if (!activeFact) return;
    const mark = sourceBoxRef.current?.querySelector("mark.active");
    if (mark && typeof mark.scrollIntoView === "function") {
      mark.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeFact]);

  const wordCount = useMemo(() => getScriptText(sections).trim().split(/\s+/).filter(Boolean).length, [sections]);
  const persistedContentHash = useMemo(
    () => (current ? computeScriptContentHash(current.sections) : ""),
    [current],
  );
  const draftContentHash = useMemo(() => computeScriptContentHash(sections), [sections]);

  const rawSectionError = validateScriptSections(sections);
  const sectionError = localizeValidationMessage(rawSectionError, lang);
  const dirty = !!current && getScriptText(sections) !== getScriptText(current.sections);
  const approved = !!current && getVersionApprovalLabel(project, current.id) === "معتمد حاليًا";
  const canSave = dirty && !rawSectionError && !saving;
  const canApprove =
    !dirty &&
    !!current &&
    !!persistedContentHash &&
    draftContentHash === persistedContentHash &&
    !approved &&
    !rawSectionError;
  const origin = current?.origin === "development_fixture"
    ? isEn ? t.origins.development_fixture : "مثال معياري ثابت"
    : current?.origin === "instructional_template"
      ? isEn ? t.origins.instructional_template : "قالب إرشادي أولي"
      : current?.origin === "manual"
        ? isEn ? t.origins.manual : "صياغة يدوية محلية"
        : isEn ? t.origins.ai : "توليد بالذكاء الاصطناعي";
  const previous = project.scripts.length > 1 ? project.scripts.at(-2) : null;

  if (!current) return null;

  const update = (key: keyof ScriptSections, value: string) => setSections(s => ({ ...s, [key]: value }));

  return (
    <div className="animate-in">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{isEn ? t.eyebrow : "02 / استوديو السكريبت"}</div>
          <h1>{isEn ? t.title : "تحرير السكريبت ومطابقة المصدر"}</h1>
          <p>{isEn ? t.subtitle : "تعديل أقسام النص ومراجعة ارتباط المعلومات بالمصدر الأصلي، ثم اعتماد النسخة النهائية."}</p>
        </div>
        <span className={`status-chip ${approved && !dirty ? "success" : "warning"}`}>
          {approved && !dirty ? <CheckCheck size={16} /> : <FileClock size={16} />}
          <span>
            {approved && !dirty
              ? isEn ? t.approvedChip : "معتمد حاليًا (محلي)"
              : isEn ? t.reviewChip : "قيد المراجعة"}
          </span>
        </span>
      </div>

      <div className="studio-columns">
        <div className="studio-main">
          <div className="surface editor-card">
            <div className="editor-topline">
              <div>
                <span className="mono-kicker">{isEn ? t.kicker : "استوديو السكريبت"}</span>
                <h2>{isEn ? t.cardTitle : "سكريبت الفيديو"}</h2>
              </div>
              <div className="row-gap">
                <span className="tiny-pill" dir="ltr">V{current.version}</span>
                <span className="tiny-pill muted">{origin}</span>
              </div>
            </div>

            <div className="editor-notice">
              <Sparkles size={17} />
              <span>
                {current.origin === "development_fixture"
                  ? isEn
                    ? t.fixtureNotice
                    : "هذه مسودة معيارية محفوظة لدرس التناظر اللفظي — لم يُستخدم Gemini أو Claude لإنشائها."
                  : isEn
                    ? t.localNotice
                    : "هذه مسودة محلية مبنية على النص المدخل — لم يُستخدم Gemini أو Claude لإنشائها."}
              </span>
            </div>

            <label className="section-label" htmlFor="hook">
              <span className="section-number" dir="ltr">01</span>
              <span>{isEn ? t.hookLabel : "الخطّاف (الافتتاحية)"}</span>
            </label>
            <textarea
              id="hook"
              required
              aria-required="true"
              aria-invalid={!sections.hook.trim() || isInstructionalTemplateText(sections.hook)}
              aria-describedby={sectionError ? "script-validation-msg" : undefined}
              placeholder={isEn ? t.hookPlaceholder : "اكتب جملة افتتاحية قصيرة تجذب انتباه الجمهور…"}
              rows={2}
              className="script-field hook-field"
              value={sections.hook}
              onChange={e => update("hook", e.target.value)}
            />

            <label className="section-label" htmlFor="bodytext">
              <span className="section-number" dir="ltr">02</span>
              <span>{isEn ? t.bodyLabel : "الفكرة الأساسية (المحتوى)"}</span>
            </label>
            <textarea
              id="bodytext"
              required
              aria-required="true"
              aria-invalid={!sections.body.trim() || isInstructionalTemplateText(sections.body)}
              aria-describedby={sectionError ? "script-validation-msg" : undefined}
              placeholder={isEn ? t.bodyPlaceholder : "اشرح الفكرة الأساسية بوضوح باللهجة السعودية البيضاء…"}
              rows={6}
              className="script-field"
              value={sections.body}
              onChange={e => update("body", e.target.value)}
            />

            <label className="section-label" htmlFor="cta">
              <span className="section-number" dir="ltr">03</span>
              <span>{isEn ? t.ctaLabel : "الدعوة للتفاعل (الختام)"}</span>
            </label>
            <textarea
              id="cta"
              required
              aria-required="true"
              aria-invalid={!sections.cta.trim() || isInstructionalTemplateText(sections.cta)}
              aria-describedby={sectionError ? "script-validation-msg" : undefined}
              placeholder={isEn ? t.ctaPlaceholder : "اختم بسؤال تفاعلي أو خطوة عملية واضحة…"}
              rows={2}
              className="script-field"
              value={sections.cta}
              onChange={e => update("cta", e.target.value)}
            />

            <div className="editor-meta">
              <span>{wordCount} {isEn ? t.wordsUnit : "كلمة تقريبًا"}</span>
              <span>
                {isEn ? t.inputTypePrefix : "نوع المدخل:"}{" "}
                {project.source.mode === "source"
                  ? isEn ? WORKSPACE_EN.home.modeSource : "نص مصدر"
                  : isEn ? WORKSPACE_EN.home.ideaCardTitle : "فكرة مبدئية"}
              </span>
              <span>{isEn ? t.dialectPrefix : "اللّهجة:"} {project.dialect}</span>
            </div>

            {sectionError && (
              <div id="script-validation-msg" role="alert" className="inline-warning text-danger">
                <CircleAlert size={17} />
                <span>{sectionError}</span>
              </div>
            )}

            {dirty && (
              <div className="inline-warning">
                <CircleAlert size={17} />
                <span>{isEn ? t.unsavedWarn : "توجد تعديلات غير محفوظة — يرجى حفظها كنسخة جديدة قبل الاعتماد."}</span>
              </div>
            )}

            <div className="editor-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setSections({ ...current.sections })}
                disabled={!dirty || saving}
              >
                <Undo2 size={16} />
                <span>{isEn ? t.revertBtn : "تراجع عن التعديلات"}</span>
              </button>
              <button type="button" className="secondary-btn" onClick={() => onSave(sections, current.id)} disabled={!canSave}>
                <Save size={16} />
                <span>{saving ? (isEn ? t.savingBtn : "جارٍ الحفظ…") : isEn ? t.saveBtn : "حفظ كنسخة جديدة"}</span>
              </button>
              <button
                ref={approveTriggerRef}
                type="button"
                className="primary-btn"
                disabled={!canApprove || saving}
                onClick={() => setConfirmOpen(true)}
              >
                <ShieldCheck size={17} />
                <span>{approved ? (isEn ? t.approvedBtn : "تم الاعتماد") : isEn ? t.approveBtn : "اعتماد السكريبت"}</span>
              </button>
            </div>
          </div>

          <div className="below-editor">
            <div className="info-strip">
              <LockKeyhole size={19} />
              <div>
                <strong>{isEn ? t.bindingTitle : "الاعتماد مرتبط بالنسخة الحالية فقط"}</strong>
                <span>{isEn ? t.bindingDesc : "أي تعديل لاحق ينشئ نسخة مستقلة جديدة ولا يرث اعتماد النسخ السابقة."}</span>
              </div>
            </div>
            <button type="button" className="secondary-btn go-next" onClick={onContinue} disabled={!approved || dirty}>
              <span>{isEn ? t.nextBtn : "التالي: استوديو الفيديو"}</span>
              <span>{isEn ? "→" : "←"}</span>
            </button>
          </div>

          <div className="surface history-card">
            <div className="fold-row">
              <div>
                <FileClock size={18} />
                <strong>{isEn ? t.historyTitle : "سجل النسخ"}</strong>
                <span className="tiny-pill muted">{project.scripts.length} {isEn ? t.versionCountSuffix : "نسخة"}</span>
              </div>
              <button type="button" className="quiet-btn" onClick={() => setVersionsOpen(!versionsOpen)}>
                {versionsOpen ? (isEn ? t.hideHistory : "إخفاء") : isEn ? t.showHistory : "عرض السجل"}
              </button>
            </div>

            {versionsOpen && (
              <div className="history-list">
                {[...project.scripts].reverse().map(v => {
                  const rawLabel = getVersionApprovalLabel(project, v.id);
                  const displayLabel = localizeApprovalLabel(rawLabel, lang);
                  return (
                    <div className="history-item" key={v.id}>
                      <span className="history-badge" dir="ltr">V{v.version}</span>
                      <div>
                        <strong>
                          {v.origin === "manual"
                            ? isEn ? t.manualEditLabel : "تعديل يدوي"
                            : isEn ? t.initialDraftLabel : "مسودة أولية"}
                        </strong>
                        <small>{formatLocalizedDate(v.createdAt, lang)}</small>
                      </div>
                      <span className={`tiny-pill ${rawLabel === "معتمد حاليًا" ? "green-pill" : rawLabel === "غير معتمد" ? "muted" : ""}`}>
                        {displayLabel}
                      </span>
                    </div>
                  );
                })}
                {previous && (
                  <>
                    <button type="button" className="quiet-btn compare-trigger" onClick={() => setCompareOpen(!compareOpen)}>
                      <GitCompareArrows size={15} />
                      <span>{compareOpen ? (isEn ? t.hideCompare : "إخفاء المقارنة") : isEn ? t.showCompare : "مقارنة آخر نسختين"}</span>
                    </button>
                    {compareOpen && (
                      <div className="version-comparison">
                        <div>
                          <strong dir="ltr">V{previous.version} — {isEn ? t.prevLabel : "السابقة"}</strong>
                          <p>{getScriptText(previous.sections)}</p>
                        </div>
                        <div>
                          <strong dir="ltr">V{current.version} — {isEn ? t.currLabel : "الحالية"}</strong>
                          <p>{getScriptText(current.sections)}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="studio-side">
          <div className="surface grounding-card">
            <div className="card-heading compact">
              <div className="card-icon">
                <FileSearch size={18} />
              </div>
              <div>
                <h2>{isEn ? t.groundingTitle : "الربط بالمصدر"}</h2>
                <p>{isEn ? t.groundingSub : "مراجعة الاقتباس الحرفي لكل معلومة في النص الأصلي"}</p>
              </div>
            </div>

            {project.facts.length ? (
              <>
                <div className="fact-list">
                  {project.facts.map((fact, i) => (
                    <button
                      type="button"
                      key={fact.id}
                      aria-pressed={activeFact === fact.id}
                      onClick={() => setActiveFact(activeFact === fact.id ? null : fact.id)}
                      className={`fact-select ${activeFact === fact.id ? "selected" : ""}`}
                    >
                      <span dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                      <strong>{fact.statement}</strong>
                      <Check size={15} />
                    </button>
                  ))}
                </div>
                <p className="field-helper">{isEn ? t.factHelper : "اضغط على أي حقيقة لإبراز موضعها الحرفي داخل النص الأصلي."}</p>
              </>
            ) : (
              <div className="empty-facts">
                <CircleAlert size={19} />
                <strong>{isEn ? t.noFactsTitle : "لا توجد حقائق مستخرجة آليًا"}</strong>
                <p>{isEn ? t.noFactsBody : "هذا النص المخصص لم يُعالج بخدمة استخراج الحقائق وتوثيقها آليًا بعد — يرجى التحقق من صحة المعلومات يدويًا."}</p>
              </div>
            )}

            <div className="source-title">{isEn ? t.originalTextTitle : "النص الأصلي"}</div>
            <HighlightedSource text={project.source.text} facts={project.facts} active={activeFact} containerRef={sourceBoxRef} />
            <div className="source-disclaimer">
              <CircleAlert size={15} />
              <span>{isEn ? t.sourceDisclaimer : "مطابقة الاقتباس مع المصدر تؤكد وروده في النص فقط ولا تغني عن المراجعة البشرية."}</span>
            </div>
          </div>

          <div className="surface context-card">
            <div className="eyebrow">{isEn ? t.contextTitle : "سياق المشروع"}</div>
            <div className="context-entry">
              <span>{isEn ? t.audienceLabel : "الجمهور"}</span>
              <strong>{project.audience}</strong>
            </div>
            <div className="context-entry">
              <span>{isEn ? t.toneLabel : "النبرة"}</span>
              <strong>{project.tone}</strong>
            </div>
            <div className="context-entry">
              <span>{isEn ? t.dialectLabel : "اللّهجة"}</span>
              <strong>{project.dialect}</strong>
            </div>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => {
            setConfirmOpen(false);
            approveTriggerRef.current?.focus();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-title"
            className="modal-card"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-icon">
              <ShieldCheck size={24} />
            </div>
            <h2 id="approve-title">
              {isEn ? t.modalTitlePrefix : "اعتماد النسخة"} <bdi dir="ltr">V{current.version}</bdi>{isEn ? "?" : "؟"}
            </h2>
            <p>{isEn ? t.modalBody : "سيتم تسجيل موافقتك لهذه النسخة محليًا في المتصفح. الاعتماد الرسمي الموثّق يتفعّل بعد ربط الخادم البرمجي."}</p>
            <div className="modal-actions">
              <button
                ref={modalCancelRef}
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setConfirmOpen(false);
                  approveTriggerRef.current?.focus();
                }}
              >
                {isEn ? t.modalCancel : "إلغاء"}
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={async () => {
                  setConfirmOpen(false);
                  await onApprove(current.id, persistedContentHash);
                }}
              >
                {isEn ? t.modalConfirm : "تأكيد الاعتماد المحلي"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
