"use client";
import { useState } from "react";
import { ArrowLeft, BookOpenText, CircleHelp, FileText, Lightbulb, Sparkles } from "lucide-react";
import type { CreateProjectInput, ProjectMode } from "@/lib/contracts/domain";
import { APTITUDE_SOURCE } from "@/lib/fixtures/aptitude";
import { validateContentInput } from "@/lib/utils/client";

interface Props {
  initialMode?: ProjectMode;
  onSubmit: (value: CreateProjectInput) => Promise<void>;
  busy: boolean;
}

export function ContentInput({ initialMode = "source", onSubmit, busy }: Props) {
  const [mode, setMode] = useState<ProjectMode>(initialMode);
  const [sourceText, setSourceText] = useState("");
  const [audience, setAudience] = useState("طلاب وطالبات يستعدون لاختبار القدرات");
  const [contentType, setContentType] = useState("تعليمي");
  const [dialect, setDialect] = useState("سعودية بيضاء");
  const [tone, setTone] = useState("قريبة ومحفّزة");
  const [attempted, setAttempted] = useState(false);

  const validation = validateContentInput({ sourceText, audience });
  const valid = validation.valid;

  function useSample() {
    setMode("source");
    setSourceText(APTITUDE_SOURCE);
    setAudience("طلاب وطالبات يستعدون لاختبار القدرات");
    setContentType("تعليمي");
    setDialect("سعودية بيضاء");
    setTone("قريبة ومحفّزة");
    setAttempted(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (valid && !busy) {
      await onSubmit({ sourceText, mode, audience, contentType, dialect, tone });
    }
  }

  return (
    <div className="animate-in">
      <div className="section-heading">
        <div>
          <div className="eyebrow">01 / المصدر وإعداد المحتوى</div>
          <h1>من هنا تبدأ حملتك</h1>
          <p>إضافة النص الأصلي أو الفكرة، وتحديد الجمهور واللّهجة والنبرة المناسبة لتجهيز مسودة السكريبت.</p>
        </div>
        <span className="intro-indicator">
          <Sparkles size={15} />
          <span>المرحلة الأولى</span>
        </span>
      </div>

      <div className="mode-cards-grid" role="group" aria-label="نوع المحتوى">
        <button
          type="button"
          onClick={() => setMode("source")}
          aria-pressed={mode === "source"}
          className={`mode-card ${mode === "source" ? "selected" : ""}`}
        >
          <div className="mode-card-icon">
            <BookOpenText size={22} />
          </div>
          <div className="mode-card-body">
            <h3>نص مصدر</h3>
            <p>درس تعليمي أو خبر أو محتوى مكتوب يُربط السكريبت بحقائقه واقتباساته.</p>
            <span className="mode-tag">موصى به للتوثيق بالمصدر</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("idea")}
          aria-pressed={mode === "idea"}
          className={`mode-card ${mode === "idea" ? "selected" : ""}`}
        >
          <div className="mode-card-icon">
            <Lightbulb size={22} />
          </div>
          <div className="mode-card-body">
            <h3>فكرة مبدئية</h3>
            <p>وصف موجز لموضوع الفيديو لتحويله إلى مسودة سكريبت قابلة للتحرير والمراجعة.</p>
            <span className="mode-tag muted-tag">صياغة مبدئية سريعة</span>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="form-layout">
        <div className="surface main-form">
          <div className="form-card-top">
            <div className="card-heading compact">
              <div className="card-icon">
                <FileText size={19} />
              </div>
              <div>
                <h2>١ · المصدر</h2>
                <p>إدخال نصي مباشر — رفع الملفات والروابط يتفعّل في مرحلة لاحقة</p>
              </div>
            </div>
            <button type="button" className="sample-btn" onClick={useSample}>
              <Sparkles size={14} />
              <span>مثال: دورة القدرات</span>
            </button>
          </div>

          <div className="source-tabs" aria-label="طرق الإدخال">
            <span className="source-tab active">نص مباشر</span>
            <span className="source-tab disabled">رفع ملف نصي (قريبًا)</span>
            <span className="source-tab disabled">رابط خبر (قريبًا)</span>
          </div>

          <label className="field-label" htmlFor="source-text">
            {mode === "source" ? "النص التعليمي أو الخبر" : "وصف الفكرة المطلوبة"}
            <span className="required">*</span>
          </label>
          <textarea
            id="source-text"
            required
            aria-required="true"
            className="source-textarea"
            value={sourceText}
            maxLength={3000}
            onChange={e => setSourceText(e.target.value)}
            placeholder={
              mode === "source"
                ? "ألصق نص الدرس أو الخبر هنا (20 إلى 3000 حرف)…"
                : "اكتب وصفًا مختصرًا لفكرة الفيديو والهدف منه (20 إلى 3000 حرف)…"
            }
            aria-invalid={attempted && !!validation.sourceError}
            aria-describedby="source-text-feedback"
          />
          <div className="input-foot">
            <span
              id="source-text-feedback"
              role={attempted && validation.sourceError ? "alert" : undefined}
              className={attempted && validation.sourceError ? "text-danger" : "text-muted"}
            >
              {attempted && validation.sourceError
                ? validation.sourceError
                : "تُربط المعلومات بالمصدر وتخضع للمراجعة البشرية قبل الاعتماد."}
            </span>
            <span className="char-counter" dir="ltr">{sourceText.length} / 3000</span>
          </div>
        </div>

        <div className="form-aside">
          <div className="surface settings-card">
            <div className="card-heading compact">
              <div className="card-icon gold-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h2>٢ · الجمهور واللّهجة</h2>
                <p>ضبط أسلوب الخطاب بما يناسب الفئة المستهدفة</p>
              </div>
            </div>

            <label className="field-label" htmlFor="audience">
              الجمهور المستهدف<span className="required">*</span>
            </label>
            <input
              id="audience"
              required
              aria-required="true"
              value={audience}
              onChange={e => setAudience(e.target.value)}
              className="field-input"
              placeholder="مثال: طلاب وطالبات القدرات"
              aria-invalid={attempted && !!validation.audienceError}
              aria-describedby={attempted && validation.audienceError ? "audience-feedback" : undefined}
            />
            {attempted && validation.audienceError && (
              <p id="audience-feedback" role="alert" className="field-error">
                {validation.audienceError}
              </p>
            )}

            <label className="field-label" htmlFor="category">نوع المحتوى</label>
            <select id="category" className="field-input" value={contentType} onChange={e => setContentType(e.target.value)}>
              <option>تعليمي</option>
              <option>إعلامي</option>
              <option>إعلاني</option>
              <option>توعوي</option>
            </select>

            <label className="field-label" htmlFor="dialect">اللّهجة السعودية</label>
            <select id="dialect" className="field-input" value={dialect} onChange={e => setDialect(e.target.value)}>
              <option>سعودية بيضاء</option>
              <option>نجدية</option>
              <option>حجازية</option>
              <option>فصحى مبسّطة</option>
            </select>

            <label className="field-label" htmlFor="tone">النبرة</label>
            <select id="tone" className="field-input" value={tone} onChange={e => setTone(e.target.value)}>
              <option>قريبة ومحفّزة</option>
              <option>مهنية</option>
              <option>مرحة</option>
              <option>هادئة وموثوقة</option>
            </select>

            <div className="hint">
              <CircleHelp size={17} />
              <span>تُحفظ إعدادات اللّهجة والنبرة مع المشروع، ويُفعّل التخصيص التلقائي فور ربط خدمة الذكاء الاصطناعي.</span>
            </div>

            <button type="submit" className="primary-btn full" disabled={busy}>
              <span>{busy ? "جارٍ تجهيز المسودة…" : "تجهيز مسودة السكريبت"}</span>
              <ArrowLeft size={18} />
            </button>
            <p className="subtle-center">مسودة تطوير محلية — لا تستدعي نماذج ذكاء اصطناعي خارجية حاليًا</p>
          </div>
        </div>
      </form>
    </div>
  );
}
