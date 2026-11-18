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
import type { Project, ScriptSections, SourceFact } from "@/lib/contracts/domain";
import {
  formatArabicDate,
  getScriptText,
  getVersionApprovalLabel,
  isInstructionalTemplateText,
  validateScriptSections,
} from "@/lib/utils/client";

interface Props {
  project: Project;
  saving: boolean;
  onSave: (sections: ScriptSections) => Promise<void>;
  onApprove: (versionId: string) => Promise<void>;
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
    <div ref={containerRef} className="source-quotation" dir="rtl">
      {chunks}
    </div>
  );
}

export function ScriptStudio({ project, saving, onSave, onApprove, onContinue }: Props) {
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

  const sectionError = validateScriptSections(sections);
  const dirty = !!current && getScriptText(sections) !== getScriptText(current.sections);
  const approved = !!current && getVersionApprovalLabel(project, current.id) === "معتمد حاليًا";
  const canSave = dirty && !sectionError && !saving;
  const canApprove = !dirty && !approved && !!current && !sectionError;
  const origin =
    current?.origin === "development_fixture"
      ? "مثال معياري ثابت"
      : current?.origin === "manual"
        ? "صياغة يدوية محلية"
        : "توليد بالذكاء الاصطناعي";
  const previous = project.scripts.length > 1 ? project.scripts.at(-2) : null;
  const wordCount = useMemo(() => getScriptText(sections).trim().split(/\s+/).filter(Boolean).length, [sections]);

  if (!current) return null;

  const update = (key: keyof ScriptSections, value: string) => setSections(s => ({ ...s, [key]: value }));

  return (
    <div className="animate-in">
      <div className="section-heading">
        <div>
          <div className="eyebrow">02 / استوديو السكريبت</div>
          <h1>تحرير السكريبت ومطابقة المصدر</h1>
          <p>تعديل أقسام النص ومراجعة ارتباط المعلومات بالمصدر الأصلي، ثم اعتماد النسخة النهائية.</p>
        </div>
        <span className={`status-chip ${approved && !dirty ? "success" : "warning"}`}>
          {approved && !dirty ? <CheckCheck size={16} /> : <FileClock size={16} />}
          <span>{approved && !dirty ? "معتمد حاليًا (محلي)" : "قيد المراجعة"}</span>
        </span>
      </div>

      <div className="studio-columns">
        <div className="studio-main">
          <div className="surface editor-card">
            <div className="editor-topline">
              <div>
                <span className="mono-kicker">استوديو السكريبت</span>
                <h2>سكريبت الفيديو</h2>
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
                  ? "هذه مسودة معيارية محفوظة لدرس التناظر اللفظي — لم يُستخدم Gemini أو Claude لإنشائها."
                  : "هذه مسودة محلية مبنية على النص المدخل — لم يُستخدم Gemini أو Claude لإنشائها."}
              </span>
            </div>

            <label className="section-label" htmlFor="hook">
              <span className="section-number" dir="ltr">01</span>
              <span>الخطّاف (الافتتاحية)</span>
            </label>
            <textarea
              id="hook"
              required
              aria-required="true"
              aria-invalid={!sections.hook.trim() || isInstructionalTemplateText(sections.hook)}
              aria-describedby={sectionError ? "script-validation-msg" : undefined}
              placeholder="اكتب جملة افتتاحية قصيرة تجذب انتباه الجمهور…"
              rows={2}
              className="script-field hook-field"
              value={sections.hook}
              onChange={e => update("hook", e.target.value)}
            />

            <label className="section-label" htmlFor="bodytext">
              <span className="section-number" dir="ltr">02</span>
              <span>الفكرة الأساسية (المحتوى)</span>
            </label>
            <textarea
              id="bodytext"
              required
              aria-required="true"
              aria-invalid={!sections.body.trim() || isInstructionalTemplateText(sections.body)}
              aria-describedby={sectionError ? "script-validation-msg" : undefined}
              placeholder="اشرح الفكرة الأساسية بوضوح باللهجة السعودية البيضاء…"
              rows={6}
              className="script-field"
              value={sections.body}
              onChange={e => update("body", e.target.value)}
            />

            <label className="section-label" htmlFor="cta">
              <span className="section-number" dir="ltr">03</span>
              <span>الدعوة للتفاعل (الختام)</span>
            </label>
            <textarea
              id="cta"
              required
              aria-required="true"
              aria-invalid={!sections.cta.trim() || isInstructionalTemplateText(sections.cta)}
              aria-describedby={sectionError ? "script-validation-msg" : undefined}
              placeholder="اختم بسؤال تفاعلي أو خطوة عملية واضحة…"
              rows={2}
              className="script-field"
              value={sections.cta}
              onChange={e => update("cta", e.target.value)}
            />

            <div className="editor-meta">
              <span>{wordCount} كلمة تقريبًا</span>
              <span>نوع المدخل: {project.source.mode === "source" ? "نص مصدر" : "فكرة مبدئية"}</span>
              <span>اللّهجة: {project.dialect}</span>
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
                <span>توجد تعديلات غير محفوظة — يرجى حفظها كنسخة جديدة قبل الاعتماد.</span>
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
                <span>تراجع عن التعديلات</span>
              </button>
              <button type="button" className="secondary-btn" onClick={() => onSave(sections)} disabled={!canSave}>
                <Save size={16} />
                <span>{saving ? "جارٍ الحفظ…" : "حفظ كنسخة جديدة"}</span>
              </button>
              <button
                ref={approveTriggerRef}
                type="button"
                className="primary-btn"
                disabled={!canApprove || saving}
                onClick={() => setConfirmOpen(true)}
              >
                <ShieldCheck size={17} />
                <span>{approved ? "تم الاعتماد" : "اعتماد السكريبت"}</span>
              </button>
            </div>
          </div>

          <div className="below-editor">
            <div className="info-strip">
              <LockKeyhole size={19} />
              <div>
                <strong>الاعتماد مرتبط بالنسخة الحالية فقط</strong>
                <span>أي تعديل لاحق ينشئ نسخة مستقلة جديدة ولا يرث اعتماد النسخ السابقة.</span>
              </div>
            </div>
            <button type="button" className="secondary-btn go-next" onClick={onContinue} disabled={!approved || dirty}>
              <span>التالي: استوديو الفيديو</span>
              <span>←</span>
            </button>
          </div>

          <div className="surface history-card">
            <div className="fold-row">
              <div>
                <FileClock size={18} />
                <strong>سجل النسخ</strong>
                <span className="tiny-pill muted">{project.scripts.length} نسخة</span>
              </div>
              <button type="button" className="quiet-btn" onClick={() => setVersionsOpen(!versionsOpen)}>
                {versionsOpen ? "إخفاء" : "عرض السجل"}
              </button>
            </div>

            {versionsOpen && (
              <div className="history-list">
                {[...project.scripts].reverse().map(v => {
                  const label = getVersionApprovalLabel(project, v.id);
                  return (
                    <div className="history-item" key={v.id}>
                      <span className="history-badge" dir="ltr">V{v.version}</span>
                      <div>
                        <strong>{v.origin === "manual" ? "تعديل يدوي" : "مسودة أولية"}</strong>
                        <small>{formatArabicDate(v.createdAt)}</small>
                      </div>
                      <span className={`tiny-pill ${label === "معتمد حاليًا" ? "green-pill" : label === "غير معتمد" ? "muted" : ""}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
                {previous && (
                  <>
                    <button type="button" className="quiet-btn compare-trigger" onClick={() => setCompareOpen(!compareOpen)}>
                      <GitCompareArrows size={15} />
                      <span>{compareOpen ? "إخفاء المقارنة" : "مقارنة آخر نسختين"}</span>
                    </button>
                    {compareOpen && (
                      <div className="version-comparison">
                        <div>
                          <strong dir="ltr">V{previous.version} — السابقة</strong>
                          <p>{getScriptText(previous.sections)}</p>
                        </div>
                        <div>
                          <strong dir="ltr">V{current.version} — الحالية</strong>
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
                <h2>الربط بالمصدر</h2>
                <p>مراجعة الاقتباس الحرفي لكل معلومة في النص الأصلي</p>
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
                <p className="field-helper">اضغط على أي حقيقة لإبراز موضعها الحرفي داخل النص الأصلي.</p>
              </>
            ) : (
              <div className="empty-facts">
                <CircleAlert size={19} />
                <strong>لا توجد حقائق مستخرجة آليًا</strong>
                <p>هذا النص المخصص لم يُعالج بخدمة استخراج الحقائق وتوثيقها آليًا بعد — يرجى التحقق من صحة المعلومات يدويًا.</p>
              </div>
            )}

            <div className="source-title">النص الأصلي</div>
            <HighlightedSource text={project.source.text} facts={project.facts} active={activeFact} containerRef={sourceBoxRef} />
            <div className="source-disclaimer">
              <CircleAlert size={15} />
              <span>مطابقة الاقتباس مع المصدر تؤكد وروده في النص فقط ولا تغني عن المراجعة البشرية.</span>
            </div>
          </div>

          <div className="surface context-card">
            <div className="eyebrow">سياق المشروع</div>
            <div className="context-entry">
              <span>الجمهور</span>
              <strong>{project.audience}</strong>
            </div>
            <div className="context-entry">
              <span>النبرة</span>
              <strong>{project.tone}</strong>
            </div>
            <div className="context-entry">
              <span>اللّهجة</span>
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
            <h2 id="approve-title">اعتماد النسخة <bdi dir="ltr">V{current.version}</bdi>؟</h2>
            <p>سيتم تسجيل موافقتك لهذه النسخة محليًا في المتصفح. الاعتماد الرسمي الموثّق يتفعّل بعد ربط الخادم البرمجي.</p>
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
                إلغاء
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={async () => {
                  setConfirmOpen(false);
                  await onApprove(current.id);
                }}
              >
                تأكيد الاعتماد المحلي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
