import type { CSSProperties } from "react";

const PILLARS = [
  { title: "عربي سعودي أبيض", text: "لغة قريبة يفهمها الجمهور في كل المناطق." },
  { title: "نبرة تناسب جمهورك", text: "رسمية للمؤسسات، وخفيفة لمنصات الفيديو." },
  { title: "مصطلحات وسياق محلي", text: "أسماء وأمثلة تعكس واقع الجمهور السعودي." },
  { title: "تحكّم تحريري بشري", text: "أنت تعدّل وتعتمد، والقرار الأخير لك." },
  { title: "مراجعة مرتبطة بالمصدر", text: "كل جملة ترجع لمصدرها، فتتأكد من الدقة." },
];

export function LocalizationSection() {
  return (
    <section id="localization" className="lp-section lp-local" aria-labelledby="local-title">
      <div className="lp-container lp-local__grid">
        <div>
          <header className="lp-head" data-reveal>
            <p className="lp-eyebrow lp-eyebrow--ink">الهوية المحلية</p>
            <h2 id="local-title" className="lp-title">
              يتكلم <span className="lp-mark">بلغة جمهورك</span> من أول سطر
            </h2>
            <p className="lp-lead">
              نبضة مصممة للمحتوى السعودي: لهجة بيضاء واضحة، ونبرة مضبوطة، ومراجعة بشرية قبل أي خطوة.
            </p>
          </header>

          <figure className="lp-voice" data-reveal>
            <div className="lp-voice__row lp-voice__row--formal">
              <span>فصحى رسمية</span>
              <p>يسرّنا إعلامكم بافتتاح الممشى الجديد على الواجهة البحرية.</p>
            </div>
            <div className="lp-voice__row lp-voice__row--local">
              <span>سعودي أبيض</span>
              <p>ممشى جديد على البحر… وصار قريب منك!</p>
            </div>
            <figcaption>مثال توضيحي لاختلاف النبرة، والصياغة النهائية دايم تحت مراجعتك.</figcaption>
          </figure>
        </div>

        <ol className="lp-pillars" data-stagger>
          {PILLARS.map((p, i) => (
            <li key={p.title} style={{ "--i": i } as CSSProperties}>
              <span className="lp-pillars__num">{i + 1}</span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
