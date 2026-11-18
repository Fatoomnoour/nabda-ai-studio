"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenText, CircleHelp, FileText, Lightbulb, Sparkles } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import type { CreateProjectInput, ProjectMode } from "@/lib/contracts/domain";
import { APTITUDE_SOURCE } from "@/lib/fixtures/aptitude";
import { localizeValidationMessage, WORKSPACE_EN } from "@/lib/i18n/translations";
import { validateContentInput } from "@/lib/utils/client";

interface Props {
  initialMode?: ProjectMode;
  onSubmit: (value: CreateProjectInput) => Promise<void>;
  busy: boolean;
}

export function ContentInput({ initialMode = "source", onSubmit, busy }: Props) {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const t = WORKSPACE_EN.contentInput;
  const ForwardArrow = isEn ? ArrowRight : ArrowLeft;

  const [mode, setMode] = useState<ProjectMode>(initialMode);
  const [sourceText, setSourceText] = useState("");
  const [audience, setAudience] = useState("طلاب وطالبات يستعدون لاختبار القدرات");
  const [contentType, setContentType] = useState("تعليمي");
  const [dialect, setDialect] = useState("سعودية بيضاء");
  const [tone, setTone] = useState("قريبة ومحفّزة");
  const [attempted, setAttempted] = useState(false);

  const validation = validateContentInput({ sourceText, audience });
  const valid = validation.valid;
  const sourceError = localizeValidationMessage(validation.sourceError, lang);
  const audienceError = localizeValidationMessage(validation.audienceError, lang);

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
          <div className="eyebrow">{isEn ? t.eyebrow : "01 / المصدر وإعداد المحتوى"}</div>
          <h1>{isEn ? t.title : "من هنا تبدأ حملتك"}</h1>
          <p>{isEn ? t.subtitle : "إضافة النص الأصلي أو الفكرة، وتحديد الجمهور واللّهجة والنبرة المناسبة لتجهيز مسودة السكريبت."}</p>
        </div>
        <span className="intro-indicator">
          <Sparkles size={15} />
          <span>{isEn ? t.stepIndicator : "المرحلة الأولى"}</span>
        </span>
      </div>

      <div className="mode-cards-grid" role="group" aria-label={isEn ? t.modeGroupAria : "نوع المحتوى"}>
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
            <h3>{isEn ? t.sourceCard.title : "نص مصدر"}</h3>
            <p>{isEn ? t.sourceCard.desc : "درس تعليمي أو خبر أو محتوى مكتوب يُربط السكريبت بحقائقه واقتباساته."}</p>
            <span className="mode-tag">{isEn ? t.sourceCard.tag : "موصى به للتوثيق بالمصدر"}</span>
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
            <h3>{isEn ? t.ideaCard.title : "فكرة مبدئية"}</h3>
            <p>{isEn ? t.ideaCard.desc : "وصف موجز لموضوع الفيديو لتحويله إلى مسودة سكريبت قابلة للتحرير والمراجعة."}</p>
            <span className="mode-tag muted-tag">{isEn ? t.ideaCard.tag : "صياغة مبدئية سريعة"}</span>
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
                <h2>{isEn ? t.step1Title : "١ · المصدر"}</h2>
                <p>{isEn ? t.step1Sub : "إدخال نصي مباشر — رفع الملفات والروابط يتفعّل في مرحلة لاحقة"}</p>
              </div>
            </div>
            <button type="button" className="sample-btn" onClick={useSample}>
              <Sparkles size={14} />
              <span>{isEn ? t.sampleBtn : "مثال: دورة القدرات"}</span>
            </button>
          </div>

          <div className="source-tabs" aria-label={isEn ? t.tabsAria : "طرق الإدخال"}>
            <span className="source-tab active">{isEn ? t.tabDirect : "نص مباشر"}</span>
            <span className="source-tab disabled">{isEn ? t.tabFile : "رفع ملف نصي (قريبًا)"}</span>
            <span className="source-tab disabled">{isEn ? t.tabLink : "رابط خبر (قريبًا)"}</span>
          </div>

          <label className="field-label" htmlFor="source-text">
            {mode === "source" ? (isEn ? t.sourceLabel : "النص التعليمي أو الخبر") : isEn ? t.ideaLabel : "وصف الفكرة المطلوبة"}
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
                ? isEn
                  ? t.sourcePlaceholder
                  : "ألصق نص الدرس أو الخبر هنا (20 إلى 3000 حرف)…"
                : isEn
                  ? t.ideaPlaceholder
                  : "اكتب وصفًا مختصرًا لفكرة الفيديو والهدف منه (20 إلى 3000 حرف)…"
            }
            aria-invalid={attempted && !!sourceError}
            aria-describedby="source-text-feedback"
          />
          <div className="input-foot">
            <span
              id="source-text-feedback"
              role={attempted && sourceError ? "alert" : undefined}
              className={attempted && sourceError ? "text-danger" : "text-muted"}
            >
              {attempted && sourceError
                ? sourceError
                : isEn
                  ? t.sourceHelper
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
                <h2>{isEn ? t.step2Title : "٢ · الجمهور واللّهجة"}</h2>
                <p>{isEn ? t.step2Sub : "ضبط أسلوب الخطاب بما يناسب الفئة المستهدفة"}</p>
              </div>
            </div>

            <label className="field-label" htmlFor="audience">
              {isEn ? t.audienceLabel : "الجمهور المستهدف"}<span className="required">*</span>
            </label>
            <input
              id="audience"
              required
              aria-required="true"
              value={audience}
              onChange={e => setAudience(e.target.value)}
              className="field-input"
              placeholder={isEn ? t.audiencePlaceholder : "مثال: طلاب وطالبات القدرات"}
              aria-invalid={attempted && !!audienceError}
              aria-describedby={attempted && audienceError ? "audience-feedback" : undefined}
            />
            {attempted && audienceError && (
              <p id="audience-feedback" role="alert" className="field-error">
                {audienceError}
              </p>
            )}

            <label className="field-label" htmlFor="category">{isEn ? t.contentTypeLabel : "نوع المحتوى"}</label>
            <select id="category" className="field-input" value={contentType} onChange={e => setContentType(e.target.value)}>
              {t.contentTypes.map(opt => (
                <option key={opt.value} value={opt.value}>{isEn ? opt.label : opt.value}</option>
              ))}
            </select>

            <label className="field-label" htmlFor="dialect">{isEn ? t.dialectLabel : "اللّهجة السعودية"}</label>
            <select id="dialect" className="field-input" value={dialect} onChange={e => setDialect(e.target.value)}>
              {t.dialects.map(opt => (
                <option key={opt.value} value={opt.value}>{isEn ? opt.label : opt.value}</option>
              ))}
            </select>

            <label className="field-label" htmlFor="tone">{isEn ? t.toneLabel : "النبرة"}</label>
            <select id="tone" className="field-input" value={tone} onChange={e => setTone(e.target.value)}>
              {t.tones.map(opt => (
                <option key={opt.value} value={opt.value}>{isEn ? opt.label : opt.value}</option>
              ))}
            </select>

            <div className="hint">
              <CircleHelp size={17} />
              <span>{isEn ? t.hint : "تُحفظ إعدادات اللّهجة والنبرة مع المشروع، ويُفعّل التخصيص التلقائي فور ربط خدمة الذكاء الاصطناعي."}</span>
            </div>

            <button type="submit" className="primary-btn full" disabled={busy}>
              <span>{busy ? (isEn ? t.submitBusy : "جارٍ تجهيز المسودة…") : isEn ? t.submitIdle : "تجهيز مسودة السكريبت"}</span>
              <ForwardArrow size={18} />
            </button>
            <p className="subtle-center">{isEn ? t.submitNote : "مسودة تطوير محلية — لا تستدعي نماذج ذكاء اصطناعي خارجية حاليًا"}</p>
          </div>
        </div>
      </form>
    </div>
  );
}
