"use client";

import { Plus } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import { LANDING_EN } from "@/lib/i18n/translations";
import { FAQ_ITEMS } from "./content";

export function FaqSection() {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const en = LANDING_EN.faq;
  const items = isEn ? en.items : FAQ_ITEMS;

  return (
    <section id="faq" className="lp-section lp-faq" aria-labelledby="faq-title">
      <div className="lp-container lp-faq__grid">
        <header className="lp-head" data-reveal>
          <p className="lp-eyebrow">{isEn ? en.eyebrow : "أسئلة شائعة"}</p>
          <h2 id="faq-title" className="lp-title">{isEn ? en.title : "وضوح قبل ما تبدأ"}</h2>
          <p className="lp-lead">{isEn ? en.lead : "إجابات مختصرة عن حدود التجربة الحالية."}</p>
        </header>
        <div className="lp-faq__list" data-reveal>
          {items.map((f) => (
            <details key={f.q} className="lp-qa">
              <summary>
                <span>{f.q}</span>
                <Plus aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
