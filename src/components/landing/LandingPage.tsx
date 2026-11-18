"use client";

import { useRef } from "react";
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
  useReveal(rootRef);

  return (
    <div ref={rootRef} id="top" dir="rtl" lang="ar" className="nabda-page">
      <a href="#main-content" className="lp-skip">
        تخطَّ إلى المحتوى
      </a>
      <SiteNav logoUrl="/brand/nabda-logo.png" />
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
      <SiteFooter logoUrl="/brand/nabda-logo.png" />
    </div>
  );
}
