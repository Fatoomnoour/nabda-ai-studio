"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  ClipboardCopy,
  Download,
  HeartHandshake,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Sparkles,
  VideoOff,
} from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import type { Project, StylePreference } from "@/lib/contracts/domain";
import { STARTER_STYLE_RULES } from "@/lib/fixtures/aptitude";
import { WORKSPACE_EN } from "@/lib/i18n/translations";
import { getVersionApprovalLabel } from "@/lib/utils/client";

interface Props {
  project: Project;
  preferences: StylePreference[];
  onAddPreference: (rule: string) => Promise<void>;
  onTogglePreference: (id: string) => Promise<void>;
  onNew: () => void;
}

export function FinalReview({ project, preferences, onAddPreference, onTogglePreference, onNew }: Props) {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const r = WORKSPACE_EN.finalReview;
  const ForwardArrow = isEn ? ArrowRight : ArrowLeft;

  const [rule, setRule] = useState("");
  const [copied, setCopied] = useState(false);

  const script = project.scripts.at(-1);
  const scriptApproved = !!script && getVersionApprovalLabel(project, script.id) === "معتمد حاليًا";
  const asset = project.assets.find(a => a.kind === "video" && a.sourceVersionId === script?.id);
  const videoApproved = !!asset && project.approvals.some(a => a.targetId === asset.id && a.kind === "video");
  const captionPending = project.socialCaption.startsWith("المنشور الاجتماعي يُنشأ");

  async function copyCaption() {
    if (captionPending) return;
    try {
      await navigator.clipboard.writeText(project.socialCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1700);
    } catch {
      // Clipboard API may be blocked in restricted contexts
    }
  }

  return (
    <div className="animate-in">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{isEn ? r.eyebrow : "04 / الاعتماد والتصدير"}</div>
          <h1>{isEn ? r.title : "مراجعة المخرجات وتفضيلات الأسلوب"}</h1>
          <p>{isEn ? r.subtitle : "متابعة حالة اعتماد السكريبت والفيديو، ونسخ المنشور المصاحب، وحفظ قواعد الأسلوب المفضلة في المتصفح."}</p>
        </div>
        <span className="status-chip warning">
          <LockKeyhole size={15} />
          <span>{isEn ? r.statusChip : "التصدير بانتظار ملف MP4 حقيقي"}</span>
        </span>
      </div>

      <div className="review-grid">
        <div className="surface output-card">
          <div className="card-heading compact">
            <div className="card-icon">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2>{isEn ? r.statusTitle : "حالة اعتماد المخرجات"}</h2>
              <p>{isEn ? r.statusSub : "ملخص ما تم اعتماده محليًا وما ينتظر تكامل الخادم"}</p>
            </div>
          </div>

          <div className="approval-status-row">
            <div className={scriptApproved ? "round-state good" : "round-state"}>
              {scriptApproved ? <Check size={18} /> : "1"}
            </div>
            <div>
              <strong>{isEn ? r.scriptRowTitle : "السكريبت النصي"} {script ? `(V${script.version})` : ""}</strong>
              <p>
                {scriptApproved
                  ? isEn ? r.scriptApprovedDesc : "معتمد محليًا داخل هذا المتصفح"
                  : isEn ? r.scriptPendingDesc : "غير معتمد بعد — يرجى العودة لاستوديو السكريبت"}
              </p>
            </div>
            <span className={`tiny-pill ${scriptApproved ? "green-pill" : "muted"}`}>
              {scriptApproved
                ? isEn ? r.scriptApprovedBadge : "محلي فقط"
                : isEn ? r.scriptPendingBadge : "بانتظار الاعتماد"}
            </span>
          </div>

          <div className="approval-status-row">
            <div className="round-state">
              <VideoOff size={17} />
            </div>
            <div>
              <strong>{isEn ? r.videoRowTitle : "الفيديو النهائي"} (<span dir="ltr">MP4</span>)</strong>
              <p>
                {asset
                  ? isEn ? r.videoReadyDesc : "ملف الفيديو متاح وبانتظار الاعتماد النهائي"
                  : isEn ? r.videoMissingDesc : "لم يُنتج ملف فيديو فعلي على الخادم بعد"}
              </p>
            </div>
            <span className="tiny-pill muted">{isEn ? r.videoBadge : "غير متصل"}</span>
          </div>

          <button type="button" className="primary-btn full" disabled={!videoApproved || !asset}>
            <Download size={17} />
            <span>{isEn ? r.downloadBtn : "تحميل فيديو MP4 المعتمد"}</span>
          </button>

          <div className="inline-warning">
            <CircleAlert size={16} />
            <span>{isEn ? r.exportNotice : "تصدير الفيديو مقفول حاليًا — يتفعّل فقط بعد توليد ملف MP4 حقيقي ومراجعته واعتماده نهائيًا."}</span>
          </div>
        </div>

        <div className="surface caption-card">
          <div className="card-heading compact">
            <div className="card-icon gold-icon">
              <ClipboardCopy size={18} />
            </div>
            <div>
              <h2>{isEn ? r.captionTitle : "المنشور المصاحب"}</h2>
              <p>{isEn ? r.captionSub : "نص توضيحي مبدئي لمشاركة المقطع على المنصات الاجتماعية"}</p>
            </div>
          </div>

          <div className="caption-preview">
            {captionPending && isEn ? r.captionPendingText : project.socialCaption}
          </div>

          <div className="caption-actions">
            <span className="tiny-pill muted">
              {captionPending
                ? isEn ? r.captionPendingBadge : "بانتظار الذكاء الاصطناعي"
                : isEn ? r.captionReadyBadge : "نموذج جاهز"}
            </span>
            <button type="button" className="secondary-btn" disabled={captionPending} onClick={copyCaption}>
              {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
              <span>{copied ? (isEn ? r.copiedBtn : "تم النسخ") : isEn ? r.copyBtn : "نسخ المنشور"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="surface memory-card">
        <div className="memory-grid">
          <div className="memory-aside">
            <div className="memory-intro">
              <div className="memory-emblem">
                <HeartHandshake size={24} />
              </div>
              <div>
                <span className="eyebrow">{isEn ? r.memoryEyebrow : "ذاكرة الأسلوب التحريرية"}</span>
                <h2>{isEn ? r.memoryTitle : "قواعد الأسلوب واللّهجة المفضلة"}</h2>
                <p>{isEn ? r.memorySub : "إضافة وتفعيل قواعد الصياغة المحفوظة محليًا في المتصفح — ستُدرج ضمن توجيهات التوليد بعد ربط خدمة الذكاء الاصطناعي."}</p>
              </div>
            </div>

            <div className="memory-form">
              <label className="field-label" htmlFor="memory-rule">
                {isEn ? r.addRuleLabel : "إضافة قاعدة أسلوب معتمدة يدويًا"}
              </label>
              <div className="memory-input-row">
                <input
                  id="memory-rule"
                  className="field-input"
                  value={rule}
                  onChange={e => setRule(e.target.value)}
                  placeholder={isEn ? r.addRulePlaceholder : "مثال: استخدام لهجة سعودية بيضاء واضحة ومباشرة دون مبالغة"}
                />
                <button
                  type="button"
                  className="primary-btn"
                  disabled={rule.trim().length < 8}
                  onClick={async () => {
                    await onAddPreference(rule);
                    setRule("");
                  }}
                >
                  <Plus size={17} />
                  <span>{isEn ? r.addRuleBtn : "إضافة القاعدة"}</span>
                </button>
              </div>
              <div className="sample-rules" aria-label={isEn ? r.sampleChipsAria : "نموذج مقترح للتجربة المحلية"}>
                <small>{isEn ? r.sampleChipsHint : "نموذج مقترح للتجربة المحلية (اضغط لتعبئة الحقل فقط):"}</small>
                <div className="sample-rules-chips">
                  {STARTER_STYLE_RULES.map(sample => (
                    <button
                      key={sample}
                      type="button"
                      className="sample-rule-chip"
                      onClick={() => setRule(sample)}
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="memory-list-col">
            <div className="memory-list-head">
              <strong>{isEn ? r.savedRulesTitle : "القواعد المحفوظة"} ({preferences.length})</strong>
              <span className="tiny-pill muted">{isEn ? r.browserStorageBadge : "تخزين متصفح محلي"}</span>
            </div>
            <div className="preference-list">
              {preferences.length ? (
                preferences.map(p => (
                  <label key={p.id} className="preference-item">
                    <input type="checkbox" checked={p.enabled} onChange={() => onTogglePreference(p.id)} />
                    <span>{p.rule}</span>
                    <small>{isEn ? r.localTag : "محلي"}</small>
                  </label>
                ))
              ) : (
                <div className="empty-memory">
                  <Sparkles size={18} />
                  <span>{isEn ? r.emptyRules : "لا توجد تفضيلات أسلوب محفوظة حتى الآن."}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="final-footer">
        <div>
          <strong>{isEn ? r.newProjectTitle : "إنشاء مشروع جديد"}</strong>
          <p>{isEn ? r.newProjectSub : "البدء بمحتوى آخر أو إعادة اختبار تدفق العمل من البداية."}</p>
        </div>
        <button type="button" className="secondary-btn" onClick={onNew}>
          <span>{isEn ? r.newProjectBtn : "مشروع جديد"}</span>
          <ForwardArrow size={16} />
        </button>
      </div>
    </div>
  );
}
