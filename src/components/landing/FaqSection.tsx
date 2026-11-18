import { Plus } from "lucide-react";
import { FAQ_ITEMS } from "./content";

export function FaqSection() {
  return (
    <section id="faq" className="lp-section lp-faq" aria-labelledby="faq-title">
      <div className="lp-container lp-faq__grid">
        <header className="lp-head" data-reveal>
          <p className="lp-eyebrow">أسئلة شائعة</p>
          <h2 id="faq-title" className="lp-title">وضوح قبل ما تبدأ</h2>
          <p className="lp-lead">إجابات مختصرة عن حدود التجربة الحالية.</p>
        </header>
        <div className="lp-faq__list" data-reveal>
          {FAQ_ITEMS.map((f) => (
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
