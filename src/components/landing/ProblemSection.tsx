"use client";

import type { CSSProperties } from "react";
import { Check, X } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import { LANDING_EN } from "@/lib/i18n/translations";

const scatteredAr = ["مسودة للفيديو", "نسخة للمنشور", "ملاحظات المراجع", "النسخة الأخيرة؟"];
const flowAr = ["المصدر", "السكريبت", "المراجعة", "المعاينة"];

export function ProblemSection() {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const en = LANDING_EN.problem;
  const scattered = isEn ? en.scattered : scatteredAr;
  const flow = isEn ? en.flow : flowAr;
  const beforePoints = isEn
    ? en.beforePoints
    : ["كل منصة تُكتب من الصفر", "النبرة تتغيّر من نسخة لنسخة", "صعب تعرف أي نسخة اعتُمدت"];
  const afterPoints = isEn
    ? en.afterPoints
    : ["سكريبت منظّم: افتتاحية ومحتوى ودعوة", "نسخ محفوظة في متصفحك تقدر ترجع لها", "اعتماد صريح منك قبل المعاينة"];

  return (
    <section id="problem" className="lp-section lp-problem" aria-labelledby="problem-title">
      <div className="lp-container">
        <header className="lp-head" data-reveal>
          <p className="lp-eyebrow">{isEn ? en.eyebrow : "التحدي"}</p>
          <h2 id="problem-title" className="lp-title">
            {isEn ? en.title : "مصدر واحد… وكل منصة تبغى لغة مختلفة"}
          </h2>
          <p className="lp-lead">
            {isEn
              ? en.lead
              : "الخبر نفسه يحتاج يتحوّل لافتتاحية قصيرة للفيديو، ونص واضح للمنشور، ودعوة تناسب كل جمهور. بدون مسار واضح، تضيع النبرة وتتكرر المراجعة."}
          </p>
        </header>

        <div className="lp-compare" data-reveal>
          <article className="lp-compare__card lp-compare__card--before">
            <span className="lp-tag">{isEn ? en.beforeTag : "قبل"}</span>
            <h3>{isEn ? en.beforeTitle : "نسخ ولصق وإعادة صياغة متفرقة"}</h3>
            <div className="lp-scatter" aria-hidden="true">
              {scattered.map((s, i) => (
                <span key={s} style={{ "--i": i } as CSSProperties}>
                  {s}
                </span>
              ))}
            </div>
            <ul className="lp-checklist lp-checklist--neg">
              {beforePoints.map((pt) => (
                <li key={pt}>
                  <X aria-hidden="true" />
                  {pt}
                </li>
              ))}
            </ul>
          </article>

          <div className="lp-compare__bridge" aria-hidden="true">
            <svg viewBox="0 0 120 40">
              <path d="M116 20 H78 L70 6 L58 34 L50 20 H6" />
              <path d="M16 10 L6 20 L16 30" />
            </svg>
          </div>

          <article className="lp-compare__card lp-compare__card--after">
            <span className="lp-tag lp-tag--mint">{isEn ? en.afterTag : "مع نبضة"}</span>
            <h3>{isEn ? en.afterTitle : "مسار واحد مرتّب من المصدر للمعاينة"}</h3>
            <ol className="lp-flow" aria-label={isEn ? en.flowAria : "مراحل المسار"}>
              {flow.map((s, i) => (
                <li key={s} style={{ "--i": i } as CSSProperties}>
                  {s}
                </li>
              ))}
            </ol>
            <ul className="lp-checklist">
              {afterPoints.map((pt) => (
                <li key={pt}>
                  <Check aria-hidden="true" />
                  {pt}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
