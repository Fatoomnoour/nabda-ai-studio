"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import { LANDING_EN } from "@/lib/i18n/translations";
import { CONVERSION } from "./content";

export function ConversionSection() {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const en = LANDING_EN.conversion;

  return (
    <section id="start" className="lp-section lp-cta" aria-labelledby="cta-title">
      <div className="lp-container lp-cta__inner" data-reveal>
        <svg className="lp-cta__line" viewBox="0 0 600 80" aria-hidden="true">
          <path d="M0 40 H220 L240 14 L262 66 L284 40 H600" />
        </svg>
        <h2 id="cta-title" className="lp-title">{isEn ? en.title : CONVERSION.title}</h2>
        <p className="lp-lead">
          {isEn ? en.lead : "الصق أول خبر، وشوف كيف يتحوّل لسكريبت منظّم تراجعه وتعتمده بنفسك."}
        </p>
        <div className="lp-cta__actions">
          <Link href={CONVERSION.plannedRoute} className="pulse-btn pulse-btn--primary pulse-btn--lg">
            {isEn ? en.primary : CONVERSION.primary}
            {isEn ? <ArrowRight aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
          </Link>
          <a href="#how" className="pulse-btn pulse-btn--ghost pulse-btn--lg">
            {isEn ? en.secondary : CONVERSION.secondary}
          </a>
        </div>
        <p className="lp-cta__note is-on">
          {isEn ? en.note : "نسخة تجريبية: عملك يُحفظ في متصفحك فقط."}
        </p>
      </div>
    </section>
  );
}
