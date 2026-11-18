"use client";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Clapperboard,
  Film,
  Headphones,
  Mic2,
  Play,
  ShieldCheck,
  Timer,
  VideoOff,
} from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import type { Project, ScriptSections } from "@/lib/contracts/domain";
import { WORKSPACE_EN, type Lang } from "@/lib/i18n/translations";
import { getVersionApprovalLabel, isInstructionalTemplateText } from "@/lib/utils/client";

interface Props {
  project: Project;
  onFinal: () => void;
  onBack: () => void;
  onTryRender?: () => void;
}

interface StoryboardScene {
  id: "hook" | "concept" | "example" | "cta";
  indexLabel: string;
  role: string;
  headline: string;
  captionHint: string;
}

function buildStoryboardScenes(sections: ScriptSections, lang: Lang): StoryboardScene[] {
  const isEn = lang === "en";
  const v = WORKSPACE_EN.videoStudio;

  const safeBody =
    sections.body.trim() && !isInstructionalTemplateText(sections.body)
      ? sections.body.trim()
      : isEn
        ? v.emptyFallbacks.body
        : "لم يُكتب نص الفكرة الأساسية بعد — يمكنك إضافته من استوديو السكريبت";
  const safeHook =
    sections.hook.trim() && !isInstructionalTemplateText(sections.hook)
      ? sections.hook.trim()
      : isEn
        ? v.emptyFallbacks.hook
        : "لم تُكتب افتتاحية مخصصة بعد — يمكنك إضافتها من استوديو السكريبت";
  const safeCta =
    sections.cta.trim() && !isInstructionalTemplateText(sections.cta)
      ? sections.cta.trim()
      : isEn
        ? v.emptyFallbacks.cta
        : "لم تُكتب دعوة للتفاعل مخصصة بعد — يمكنك إضافتها من استوديو السكريبت";

  const sentences = safeBody
    .split(/(?<=[.،!؟\n])/)
    .map(s => s.trim())
    .filter(Boolean);

  const midpoint = Math.max(1, Math.ceil(sentences.length / 2));
  const conceptText = sentences.length > 1 ? sentences.slice(0, midpoint).join(" ") : safeBody;
  const exampleText = sentences.length > 1 ? sentences.slice(midpoint).join(" ") : safeBody;

  return [
    {
      id: "hook",
      indexLabel: "01",
      role: isEn ? v.sceneRoles.hook : "المشهد الافتتاحي — الخطّاف",
      headline: safeHook,
      captionHint: isEn ? v.sceneHints.hook : "جذب انتباه المشاهد خلال أول 3 ثوانٍ",
    },
    {
      id: "concept",
      indexLabel: "02",
      role: isEn ? v.sceneRoles.concept : "المفهوم الأساسي",
      headline: conceptText,
      captionHint: isEn ? v.sceneHints.concept : "تبسيط الفكرة الرئيسية من المصدر",
    },
    {
      id: "example",
      indexLabel: "03",
      role: isEn ? v.sceneRoles.example : "التطبيق والمثال",
      headline: exampleText,
      captionHint: isEn ? v.sceneHints.example : "عرض المثال التطبيقي بوضوح على الشاشة",
    },
    {
      id: "cta",
      indexLabel: "04",
      role: isEn ? v.sceneRoles.cta : "الخاتمة والدعوة للتفاعل",
      headline: safeCta,
      captionHint: isEn ? v.sceneHints.cta : "توجيه الجمهور للخطوة التالية",
    },
  ];
}

export function VideoStudio({ project, onFinal, onBack }: Props) {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const v = WORKSPACE_EN.videoStudio;
  const ForwardArrow = isEn ? ArrowRight : ArrowLeft;

  const [sceneIndex, setSceneIndex] = useState(0);
  const script = project.scripts.at(-1);
  const scenes = useMemo(
    () => (script ? buildStoryboardScenes(script.sections, lang) : []),
    [script, lang],
  );

  if (!script) return null;

  const approved = getVersionApprovalLabel(project, script.id) === "معتمد حاليًا";
  const activeScene = scenes[sceneIndex] || scenes[0];

  return (
    <div className="animate-in">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{isEn ? v.eyebrow : "03 / استوديو الفيديو"}</div>
          <h1>{isEn ? v.title : "معاينة القالب الرأسي والسيناريو البصري"}</h1>
          <p>
            {isEn
              ? v.subtitle
              : "تخطيط مشاهد الفيديو الرأسي (9:16) انطلاقًا من السكريبت المعتمد — يتفعّل التعليق الصوتي ورندر MP4 بعد ربط خدمات الإنتاج."}
          </p>
        </div>
        <span className="status-chip warning">
          <Timer size={16} />
          <span>{isEn ? v.statusChip : "التكامل بانتظار الخادم"}</span>
        </span>
      </div>

      <div className="video-workspace">
        <div className="surface video-preview-panel">
          <div className="media-section-top">
            <span className="preview-title">{isEn ? v.previewTitle : "معاينة بصرية للقالب"}</span>
            <span className="tiny-pill" dir="ltr">9:16 · 720×1280</span>
          </div>

          <div className="storyboard-tabs" role="tablist" aria-label={isEn ? v.tabsAria : "مشاهد السيناريو البصري"}>
            {scenes.map((scene, idx) => (
              <button
                key={scene.id}
                type="button"
                role="tab"
                aria-selected={sceneIndex === idx}
                className={`storyboard-tab ${sceneIndex === idx ? "active" : ""}`}
                onClick={() => setSceneIndex(idx)}
              >
                <span dir="ltr">{scene.indexLabel}</span>
                <span>
                  {isEn
                    ? v.sceneShortLabels[scene.id]
                    : scene.id === "hook"
                      ? "الخطّاف"
                      : scene.id === "concept"
                        ? "المفهوم"
                        : scene.id === "example"
                          ? "المثال"
                          : "الخاتمة"}
                </span>
              </button>
            ))}
          </div>

          <div className="video-preview-body">
            <div className="video-scene" aria-label={isEn ? v.sceneFrameAria : "إطار معاينة الفيديو الرأسي 9:16"}>
              <div className="scene-top-bar">
                <div className="scene-brand" dir="ltr">
                  <svg width="24" height="20" viewBox="0 0 240 200" aria-hidden="true">
                    <path
                      d="M10 96 H58 L72 58 L88 132 L100 96 H104 A46 46 0 0 0 196 96 H230"
                      fill="none"
                      stroke="#3FD1A8"
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="150" cy="52" r="14" fill="#D4B06A" />
                  </svg>
                  <span>NABDA AI</span>
                </div>
                <span className="scene-tag">{project.contentType} · {project.dialect}</span>
              </div>

              <div className="scene-content">
                <span className="scene-role">{activeScene.role}</span>
                <h2>{activeScene.headline}</h2>
                <span className="scene-accent" />
                <div className="subtitle-safe-box">
                  <small>{isEn ? v.captionZoneLabel : "منطقة الترجمة والنص المصاحب الآمنة"}</small>
                  <p>{activeScene.captionHint}</p>
                </div>
              </div>

              <div className="scene-bottom">
                <div className="scene-footer">
                  <span>{isEn ? v.versionPrefix : "نسخة"} <span dir="ltr">V{script.version}</span></span>
                  <span dir="ltr">{activeScene.indexLabel} / 0{scenes.length}</span>
                </div>
                <div className="scene-progress" aria-hidden="true">
                  {scenes.map((s, idx) => (
                    <span key={s.id} className={idx <= sceneIndex ? "filled" : ""} />
                  ))}
                </div>
                <div className="scene-sadu" aria-hidden="true" />
              </div>
            </div>

            <div className="storyboard-list" aria-label={isEn ? v.listAria : "ملخص تسلسل المشاهد"}>
              {scenes.map((scene, idx) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setSceneIndex(idx)}
                  className={`storyboard-row ${sceneIndex === idx ? "active" : ""}`}
                >
                  <span className="storyboard-num" dir="ltr">{scene.indexLabel}</span>
                  <div className="storyboard-text">
                    <strong>{scene.role}</strong>
                    <p>{scene.headline}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="visual-honesty">
            <VideoOff size={18} />
            <span>
              {isEn
                ? v.honestyNotice
                : "هذه معاينة تصميم ثابتة للمشاهد وليست فيديو أو صوتًا مُنتجًا — لا يوجد ملف MP4 فعلي حتى ربط خدمة الرندر."}
            </span>
          </div>
        </div>

        <div className="video-settings-col">
          <div className="surface video-controls">
            <div className="card-heading compact">
              <div className="card-icon">
                <Clapperboard size={20} />
              </div>
              <div>
                <h2>{isEn ? v.pipelineTitle : "مسار إنتاج الفيديو"}</h2>
                <p>{isEn ? v.pipelineSub : "يبدأ الرندر من السكريبت المعتمد فقط"}</p>
              </div>
            </div>

            <div className="render-status">
              <div className={`render-node ${approved ? "complete" : ""}`}>
                <ShieldCheck size={18} />
                <div>
                  <strong>{isEn ? v.step1Title : "1. السكريبت النصي"}</strong>
                  <small>
                    {approved
                      ? isEn ? `${v.step1Approved} (V${script.version})` : `معتمد محليًا (V${script.version})`
                      : isEn ? v.step1Pending : "بانتظار الاعتماد"}
                  </small>
                </div>
              </div>
              <div className="render-track" />
              <div className="render-node">
                <AudioLines size={18} />
                <div>
                  <strong>{isEn ? v.step2Title : "2. التعليق الصوتي السعودي"}</strong>
                  <small>
                    {isEn ? (
                      v.step2SubPre
                    ) : (
                      <>خدمة <bdi dir="ltr">Azure</bdi> للصوت السعودي — غير متصلة بعد</>
                    )}
                  </small>
                </div>
              </div>
              <div className="render-track" />
              <div className="render-node">
                <Film size={18} />
                <div>
                  <strong>{isEn ? v.step3Title : "3. تركيب الفيديو الرأسي"}</strong>
                  <small>
                    {isEn ? (
                      v.step3SubPre
                    ) : (
                      <>محرك <bdi dir="ltr">Remotion 720×1280</bdi> — غير متصل بعد</>
                    )}
                  </small>
                </div>
              </div>
              <div className="render-track" />
              <div className="render-node">
                <Play size={18} />
                <div>
                  <strong>{isEn ? v.step4Title : "4. معاينة وتصدير MP4"}</strong>
                  <small>{isEn ? v.step4Sub : "يتفعّل بعد إنتاج ملف فيديو حقيقي"}</small>
                </div>
              </div>
            </div>

            <label className="field-label" htmlFor="voice-select">
              {isEn ? v.voiceLabel : "الصوت السعودي المقترح (غير مفعّل بعد)"}
            </label>
            <div className="select-with-icon">
              <Mic2 size={17} />
              <select
                id="voice-select"
                disabled
                aria-label={isEn ? v.voiceAria : "اختيار الصوت السعودي — بانتظار ربط الخادم"}
                dir="ltr"
              >
                <option>ar-SA-ZariyahNeural ({isEn ? v.voicePaused : "معلّق"})</option>
                <option>ar-SA-HamedNeural ({isEn ? v.voicePaused : "معلّق"})</option>
              </select>
            </div>

            <button type="button" className="primary-btn full" disabled aria-describedby="render-disabled-hint">
              <Clapperboard size={17} />
              <span>{isEn ? v.renderBtn : "طلب رندر الفيديو (غير متصل بالخادم)"}</span>
            </button>
            <p id="render-disabled-hint" className="subtle-center">
              {isEn
                ? v.renderHint
                : "توليد الفيديو مقفول حاليًا لعدم ربط خدمة التعليق الصوتي والرندر بالخادم بعد."}
            </p>
          </div>

          <div className="surface handoff-panel">
            <div className="hand-icon">
              <Headphones size={19} />
            </div>
            <h3>{isEn ? v.handoffTitle : "التكامل القادم مع الخادم البرمجي"}</h3>
            <p>
              {isEn ? (
                <>
                  {v.handoffBodyPre}
                  <bdi dir="ltr">Remotion</bdi>
                  {v.handoffBodyMid}
                  <bdi dir="ltr">MP4</bdi>
                  {v.handoffBodyPost}
                </>
              ) : (
                <>
                  سيتم ربط السكريبت المعتمد بخدمة التعليق الصوتي السعودي ثم <bdi dir="ltr">Remotion</bdi> لإنتاج ملف{" "}
                  <bdi dir="ltr">MP4</bdi> قابل للمعاينة والاعتماد النهائي.
                </>
              )}
            </p>
            <div className="handoff-chip">{isEn ? v.handoffChip : "مسودة مواصفات الربط البرمجي"}</div>
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <button type="button" className="secondary-btn" onClick={onBack}>
          {isEn ? v.backBtn : "العودة إلى السكريبت"}
        </button>
        <button type="button" className="secondary-btn" onClick={onFinal}>
          <span>{isEn ? v.nextBtn : "الانتقال إلى الاعتماد والتصدير"}</span>
          <ForwardArrow size={16} />
        </button>
      </div>
    </div>
  );
}
