"use client";

import { useRef } from "react";
import { usePreferences } from "@/components/PreferencesProvider";
import { LANDING_EN } from "@/lib/i18n/translations";
import { PulseHero } from "./PulseHero";
import { SiteNav } from "./SiteNav";
import { ProblemSection } from "./ProblemSection";
import { WorkflowSection } from "./WorkflowSection";
import { ProductShowcase } from "./ProductShowcase";
import { LocalizationSection } from "./LocalizationSection";
import { VisionSection } from "./VisionSection";
import { ConversionSection } from "./ConversionSection";
import { FaqSection } from "./FaqSection";
import { SiteFooter } from "./SiteFooter";
import { useReveal } from "./useReveal";

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { theme, lang, dir } = usePreferences();
  const logoUrl = theme === "light" ? "/brand/nabda-logo.png" : "/brand/nabda-logo-dark.png";
  useReveal(rootRef);

  return (
    <div ref={rootRef} id="top" dir={dir} lang={lang} className="nabda-page">
      <a href="#main-content" className="lp-skip">
        {lang === "en" ? LANDING_EN.skipToContent : "تخطَّ إلى المحتوى"}
      </a>
      <SiteNav logoUrl={logoUrl} />
      <main id="main-content" tabIndex={-1}>
        <PulseHero />
        <ProblemSection />
        <WorkflowSection />
        <ProductShowcase />
        <LocalizationSection />
        <VisionSection />
        <ConversionSection />
        <FaqSection />
      </main>
      <SiteFooter logoUrl={logoUrl} />
    </div>
  );
}
