import type { CSSProperties } from "react";
import { Check, X } from "lucide-react";

const scattered = ["مسودة للفيديو", "نسخة للمنشور", "ملاحظات المراجع", "النسخة الأخيرة؟"];
const flow = ["المصدر", "السكريبت", "المراجعة", "المعاينة"];

export function ProblemSection() {
  return (
    <section id="problem" className="lp-section lp-problem" aria-labelledby="problem-title">
      <div className="lp-container">
        <header className="lp-head" data-reveal>
          <p className="lp-eyebrow">التحدي</p>
          <h2 id="problem-title" className="lp-title">
            مصدر واحد… وكل منصة تبغى لغة مختلفة
          </h2>
          <p className="lp-lead">
            الخبر نفسه يحتاج يتحوّل لافتتاحية قصيرة للفيديو، ونص واضح للمنشور، ودعوة تناسب كل جمهور.
            بدون مسار واضح، تضيع النبرة وتتكرر المراجعة.
          </p>
        </header>

        <div className="lp-compare" data-reveal>
          <article className="lp-compare__card lp-compare__card--before">
            <span className="lp-tag">قبل</span>
            <h3>نسخ ولصق وإعادة صياغة متفرقة</h3>
            <div className="lp-scatter" aria-hidden="true">
              {scattered.map((s, i) => (
                <span key={s} style={{ "--i": i } as CSSProperties}>
                  {s}
                </span>
              ))}
            </div>
            <ul className="lp-checklist lp-checklist--neg">
              <li><X aria-hidden="true" />كل منصة تُكتب من الصفر</li>
              <li><X aria-hidden="true" />النبرة تتغيّر من نسخة لنسخة</li>
              <li><X aria-hidden="true" />صعب تعرف أي نسخة اعتُمدت</li>
            </ul>
          </article>

          <div className="lp-compare__bridge" aria-hidden="true">
            <svg viewBox="0 0 120 40">
              <path d="M116 20 H78 L70 6 L58 34 L50 20 H6" />
              <path d="M16 10 L6 20 L16 30" />
            </svg>
          </div>

          <article className="lp-compare__card lp-compare__card--after">
            <span className="lp-tag lp-tag--mint">مع نبضة</span>
            <h3>مسار واحد مرتّب من المصدر للمعاينة</h3>
            <ol className="lp-flow" aria-label="مراحل المسار">
              {flow.map((s, i) => (
                <li key={s} style={{ "--i": i } as CSSProperties}>
                  {s}
                </li>
              ))}
            </ol>
            <ul className="lp-checklist">
              <li><Check aria-hidden="true" />سكريبت منظّم: افتتاحية ومحتوى ودعوة</li>
              <li><Check aria-hidden="true" />نسخ محفوظة في متصفحك تقدر ترجع لها</li>
              <li><Check aria-hidden="true" />اعتماد صريح منك قبل المعاينة</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
