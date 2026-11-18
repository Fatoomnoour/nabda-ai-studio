import type { CSSProperties } from "react";
import { CalendarClock, Clapperboard, FileText, GalleryHorizontal, Mic, Newspaper } from "lucide-react";
import { NOT_OPERATIONAL, VISION_FORMATS } from "./content";

const ICONS: Record<string, typeof FileText> = {
  video: Clapperboard,
  post: FileText,
  carousel: GalleryHorizontal,
  audio: Mic,
  brief: Newspaper,
};

const WEEK = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const PLANNED = [0, 2, 4];

export function VisionSection() {
  return (
    <section id="vision" className="lp-section lp-vision" aria-labelledby="vision-title">
      <div className="lp-container">
        <header className="lp-head lp-head--center" data-reveal>
          <p className="lp-eyebrow">الرؤية</p>
          <h2 id="vision-title" className="lp-title">من خبر واحد… إلى حملة كاملة</h2>
          <p className="lp-lead">
            وين رايحين بنبضة. كل ما في هذا القسم ضمن الرؤية، وغير مفعّل في التجربة الحالية.
          </p>
        </header>

        <div className="lp-vision__map">
          <div className="lp-vision__source" data-reveal>
            <span className="lp-vision__pulse" aria-hidden="true" />
            <strong>خبر واحد</strong>
            <span>مصدر معتمد بعد مراجعتك</span>
          </div>
          <ul className="lp-formats" data-stagger aria-label="صيغ المحتوى المستقبلية">
            {VISION_FORMATS.map((f, i) => {
              const Icon = ICONS[f.id] ?? FileText;
              return (
                <li key={f.id} style={{ "--i": i } as CSSProperties}>
                  <Icon aria-hidden="true" />
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </div>
                  <span className="lp-badge lp-badge--future">{f.status}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lp-campaign" data-reveal>
          <div className="lp-campaign__head">
            <CalendarClock aria-hidden="true" />
            <h3>حملات مجدولة</h3>
            <span className="lp-badge lp-badge--future">ضمن الرؤية</span>
          </div>
          <ol className="lp-campaign__week" aria-label="مثال لأسبوع حملة مخطط">
            {WEEK.map((d, i) => (
              <li key={d} className={PLANNED.includes(i) ? "is-planned" : undefined}>
                <span>{d}</span>
                {PLANNED.includes(i) && <i aria-label="نبضة مخططة" />}
              </li>
            ))}
          </ol>
        </div>

        <p className="lp-disclaimer" data-reveal>
          <strong>غير مفعّل حاليًا:</strong> {NOT_OPERATIONAL.join("، ")}.
        </p>
      </div>
    </section>
  );
}
