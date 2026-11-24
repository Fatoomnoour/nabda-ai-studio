"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { BadgeCheck, Clapperboard, FileText, History, Link2, PenLine } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import { LANDING_EN } from "@/lib/i18n/translations";
import { SHOWCASE_ITEMS } from "./content";
import { onTabKeyDown } from "./tabs";

const ICONS = [FileText, PenLine, Link2, History, BadgeCheck, Clapperboard] as const;

const SOURCE_AR =
  "أعلنت الأمانة افتتاح ممشى جديد على الواجهة البحرية، يضم مسارات للدراجات وجلسات عائلية ومناطق مظللة، ويستقبل الزوار يوميًا من العصر.";

const SCRIPT_AR = [
  { key: "Hook", label: "الافتتاحية", text: "ممشى جديد على البحر… وصار قريب منك!" },
  { key: "Body", label: "المحتوى", text: "مسارات للدراجات وجلسات عائلية ومناطق مظللة، وكل شي مجهّز لطلعة العصر." },
  { key: "CTA", label: "الدعوة", text: "شاركها مع أهلك وخططوا لزيارتكم هالأسبوع." },
];

const SCENES_AR = [
  { title: "لقطة افتتاحية", note: "الواجهة البحرية عند العصر" },
  { title: "المسارات", note: "دراجات تمر على المسار" },
  { title: "الجلسات", note: "عائلة في منطقة مظللة" },
  { title: "الدعوة", note: "نص الدعوة على الشاشة" },
];

function Panel({ id, isEn }: { id: string; isEn: boolean }): ReactNode {
  const en = LANDING_EN.showcase.panel;
  const sourceText = isEn ? en.sourceText : SOURCE_AR;
  const scriptParts = isEn ? en.scriptParts : SCRIPT_AR;
  const scenes = isEn ? en.scenes : SCENES_AR;

  switch (id) {
    case "source":
      return (
        <div className="mock-field">
          <span className="mock-label">{isEn ? en.sourceLabel : "نص المصدر"}</span>
          <div className="mock-textarea">{sourceText}</div>
          <div className="mock-row">
            <span className="mock-meta">
              {sourceText.length} / 2000 {isEn ? en.charsSuffix : "حرف"}
            </span>
            <span className="mock-chip">{isEn ? en.useSampleChip : "استخدام عيّنة التطوير"}</span>
          </div>
          <span className="mock-btn">{isEn ? en.continueBtn : "متابعة إلى السكريبت"}</span>
        </div>
      );
    case "script":
      return (
        <div className="mock-script">
          {scriptParts.map((s) => (
            <div key={s.key} className="mock-block">
              <span className="mock-label">
                {s.label} <bdi className="mock-en">{s.key}</bdi>
              </span>
              <p>{s.text}</p>
            </div>
          ))}
          <div className="mock-row">
            <span className="mock-meta">{isEn ? en.unsavedMeta : "تعديلات غير محفوظة"}</span>
            <span className="mock-btn mock-btn--sm">{isEn ? en.saveNewVersionBtn : "حفظ كنسخة جديدة"}</span>
          </div>
        </div>
      );
    case "sample":
      return (
        <div className="mock-sample">
          <span className="mock-badge">
            {isEn ? en.sampleBadge : "عيّنة تطوير مرتبطة بالمصدر — ليست توليدًا حيًّا"}
          </span>
          <p className="mock-quote">
            {isEn ? (
              <>
                {en.sampleQuotePre}
                <mark>{en.sampleQuoteMark1}</mark>
                {en.sampleQuoteMid}
                <mark className="is-alt">{en.sampleQuoteMark2}</mark>
                {en.sampleQuotePost}
              </>
            ) : (
              <>
                أعلنت الأمانة <mark>افتتاح ممشى جديد على الواجهة البحرية</mark>، يضم{" "}
                <mark className="is-alt">مسارات للدراجات وجلسات عائلية</mark> ومناطق مظللة…
              </>
            )}
          </p>
          <ul className="mock-links">
            {isEn ? (
              en.sampleLinks.map((lnk) => (
                <li key={lnk.label}>
                  <span>{lnk.label}</span> → {lnk.note}
                </li>
              ))
            ) : (
              <>
                <li><span>الافتتاحية</span> ← مأخوذة من الجملة الأولى</li>
                <li><span>المحتوى</span> ← مأخوذ من تفاصيل المرافق</li>
              </>
            )}
          </ul>
        </div>
      );
    case "revisions":
      return (
        <ol className="mock-versions">
          {isEn ? (
            en.versions.map((v, idx) => (
              <li key={v.name} className={idx === 0 ? "is-current" : undefined}>
                <strong>{v.name}</strong>
                <span>{v.note}</span>
                {v.current && <em>{v.current}</em>}
              </li>
            ))
          ) : (
            <>
              <li className="is-current">
                <strong>النسخة 3</strong>
                <span>تعديل الافتتاحية لتكون أقصر</span>
                <em>الحالية</em>
              </li>
              <li>
                <strong>النسخة 2</strong>
                <span>إضافة الجلسات العائلية للمحتوى</span>
              </li>
              <li>
                <strong>النسخة 1</strong>
                <span>أول صياغة من المصدر</span>
              </li>
            </>
          )}
        </ol>
      );
    case "approval":
      return (
        <div className="mock-approval">
          <div className="mock-check">
            <span className="mock-box" aria-hidden="true">✓</span>
            {isEn ? en.approvalCheck : "راجعت السكريبت وأعتمد النسخة 3"}
          </div>
          <span className="mock-btn">{isEn ? en.approveBtn : "اعتماد النسخة"}</span>
          <p className="mock-status">
            <BadgeCheck aria-hidden="true" />{" "}
            {isEn ? en.approvedStatus : "معتمدة — محفوظة في هذا المتصفح فقط"}
          </p>
        </div>
      );
    default:
      return (
        <div className="mock-board">
          <span className="mock-badge">
            {isEn ? en.boardBadge : "لوحة قصة ثابتة — بدون صوت أو ملف فيديو"}
          </span>
          <ol>
            {scenes.map((s, i) => (
              <li key={s.title} style={{ "--i": i } as CSSProperties}>
                <span className="mock-frame__num">{i + 1}</span>
                <strong>{s.title}</strong>
                <span>{s.note}</span>
              </li>
            ))}
          </ol>
        </div>
      );
  }
}

export function ProductShowcase() {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const en = LANDING_EN.showcase;
  const items = isEn ? en.items : SHOWCASE_ITEMS;
  const [active, setActive] = useState(0);
  const count = items.length;

  return (
    <section id="features" className="lp-section lp-features" aria-labelledby="features-title">
      <div className="lp-container">
        <header className="lp-head" data-reveal>
          <p className="lp-eyebrow">{isEn ? en.eyebrow : "المميزات"}</p>
          <h2 id="features-title" className="lp-title">
            {isEn ? en.title : "جولة داخل مساحة عمل نبضة"}
          </h2>
          <p className="lp-lead">
            {isEn
              ? en.lead
              : "نماذج مبسّطة من الواجهة. هذه الجولة محلية بعيّنة ثابتة، والتوليد الحي بنصك في «الاستوديو الحي»."}
          </p>
        </header>

        <div className="lp-showcase" data-reveal>
          <div
            className="lp-showcase__tabs"
            role="tablist"
            aria-label={isEn ? en.tabsAria : "مميزات المنتج"}
            aria-orientation="vertical"
          >
            {items.map((item, i) => {
              const Icon = ICONS[i] ?? FileText;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`sc-tab-${item.id}`}
                  aria-selected={i === active}
                  aria-controls={`sc-panel-${item.id}`}
                  tabIndex={i === active ? 0 : -1}
                  className="lp-feature"
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onTabKeyDown(e, i, count, setActive)}
                >
                  <Icon aria-hidden="true" />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.caption}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lp-mock">
            <div className="lp-mock__bar" aria-hidden="true">
              <span>{isEn ? en.barTitle : "مساحة عمل نبضة"}</span>
            </div>
            <div className="lp-stack lp-mock__stage">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  role="tabpanel"
                  id={`sc-panel-${item.id}`}
                  aria-labelledby={`sc-tab-${item.id}`}
                  className={i === active ? "lp-panel is-active" : "lp-panel"}
                  inert={i !== active}
                >
                  <Panel id={item.id} isEn={isEn} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
