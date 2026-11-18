"use client";

import { useState, type CSSProperties } from "react";
import { usePreferences } from "@/components/PreferencesProvider";
import { LANDING_EN } from "@/lib/i18n/translations";
import { STATUS_LABEL, WORKFLOW_STAGES } from "./content";
import { onTabKeyDown } from "./tabs";

export function WorkflowSection() {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const en = LANDING_EN.workflow;
  const stages = isEn ? en.stages : WORKFLOW_STAGES;
  const statusLabels = isEn ? en.statusLabel : STATUS_LABEL;
  const [active, setActive] = useState(0);
  const count = stages.length;

  return (
    <section id="how" className="lp-section lp-how" aria-labelledby="how-title">
      <div className="lp-container">
        <header className="lp-head lp-head--center" data-reveal>
          <p className="lp-eyebrow">{isEn ? en.eyebrow : "كيف تعمل نبضة"}</p>
          <h2 id="how-title" className="lp-title">
            {isEn ? en.title : "خمس مراحل، وأنت صاحب القرار في كل وحدة"}
          </h2>
          <p className="lp-lead">
            {isEn ? en.lead : "اختر مرحلة لتعرف دورك فيها، وش المتاح في التجربة اليوم، ووش اللي يحتاج تطوير الخادم."}
          </p>
        </header>

        <div
          className="lp-steps"
          role="tablist"
          aria-label={isEn ? en.tabsAria : "مراحل العمل"}
          data-stagger
          style={{ "--progress": active / (count - 1) } as CSSProperties}
        >
          <span className="lp-steps__track" aria-hidden="true">
            <span className="lp-steps__fill" />
          </span>
          {stages.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`wf-tab-${s.id}`}
              aria-selected={i === active}
              aria-controls={`wf-panel-${s.id}`}
              tabIndex={i === active ? 0 : -1}
              className={i <= active ? "lp-step is-reached" : "lp-step"}
              style={{ "--i": i } as CSSProperties}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onTabKeyDown(e, i, count, setActive)}
            >
              <span className="lp-step__num">{i + 1}</span>
              <span className="lp-step__label">{s.title}</span>
            </button>
          ))}
        </div>

        <div className="lp-stack lp-how__panels" data-reveal>
          {stages.map((s, i) => (
            <div
              key={s.id}
              role="tabpanel"
              id={`wf-panel-${s.id}`}
              aria-labelledby={`wf-tab-${s.id}`}
              className={i === active ? "lp-stage is-active" : "lp-stage"}
              inert={i !== active}
            >
              <div className="lp-stage__intro">
                <span className={`lp-badge lp-badge--${s.status}`}>{statusLabels[s.status]}</span>
                <h3>
                  <span className="lp-stage__index">0{i + 1}</span>
                  {s.title}
                </h3>
                <p>{s.summary}</p>
              </div>
              <dl className="lp-stage__facts">
                <div>
                  <dt>{isEn ? en.roleLabel : "دورك"}</dt>
                  <dd>{s.role}</dd>
                </div>
                <div>
                  <dt>{isEn ? en.todayLabel : "في التجربة اليوم"}</dt>
                  <dd>{s.today}</dd>
                </div>
                <div className="lp-stage__later">
                  <dt>{isEn ? en.laterLabel : "بعد ربط الخادم"}</dt>
                  <dd>{s.later}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
