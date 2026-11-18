"use client";

import { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/components/PreferencesProvider";
import { LANDING_EN } from "@/lib/i18n/translations";
import { frameAt, pulsePath, HOME } from "@/lib/landing/pulse-timeline";

export function PulseHero() {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const en = LANDING_EN.hero;
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const sparkRef = useRef<SVGGElement>(null);
  const [animated, setAnimated] = useState(false);
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    let raf = 0;
    const render = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / (total * 0.85))) : 1;
      const f = frameAt(p);
      lineRef.current?.setAttribute("d", pulsePath(f.tipDrop, f.peakBend, f.ecg));
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${f.dot.x}px, ${f.dot.y}px) scale(${f.stretch}, ${1 / f.stretch})`;
      }
      if (sparkRef.current) {
        sparkRef.current.style.opacity = String(f.sparkle);
        sparkRef.current.style.transform = `translate(${HOME.x}px, ${HOME.y}px) scale(${0.6 + f.sparkle * 0.5})`;
      }
      setAlive(f.ecg >= 1 && rect.bottom > 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    const initRaf = requestAnimationFrame(() => {
      setAnimated(true);
      onScroll();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(initRaf);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={animated ? "pulse-hero pulse-hero--animated" : "pulse-hero"}
      aria-labelledby="hero-title"
    >
      <div className="pulse-hero__stage">
        <div className="pulse-hero__copy">
          <p className="pulse-hero__eyebrow">{isEn ? en.eyebrow : "نبضة · NABDA AI"}</p>
          <h1 id="hero-title" className="pulse-hero__title">
            {isEn ? en.titleLine1 : "من خبر واحد… إلى حملة كاملة"}
            <span>{isEn ? en.titleLine2 : "بلغة جمهورك وعلى كل منصة"}</span>
          </h1>
          <div className="pulse-hero__actions">
            <a href="/studio" className="pulse-btn pulse-btn--primary">
              {isEn ? en.primaryCta : "جرّب نبضة"}
            </a>
            <a href="#how" className="pulse-btn pulse-btn--ghost">
              {isEn ? en.secondaryCta : "اكتشف كيف تعمل"}
            </a>
          </div>
        </div>

        <div className="pulse-hero__art">
          <svg
            viewBox="0 0 600 300"
            role="img"
            aria-label={isEn ? en.svgAria : "نبضة: نقطة تنطلق وترتد ثم تستقر وتبدأ النبضة"}
            className="pulse-svg"
          >
            <path ref={lineRef} d={pulsePath(0, 0)} className={alive ? "pulse-line pulse-line--alive" : "pulse-line"} />
            <g ref={sparkRef} className="pulse-spark" style={{ transform: `translate(${HOME.x}px, ${HOME.y}px)`, opacity: 0 }}>
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <line key={a} x1="0" y1="-26" x2="0" y2="-36" transform={`rotate(${a})`} />
              ))}
            </g>
            <g ref={dotRef} className="pulse-dot" style={{ transform: `translate(${HOME.x}px, ${HOME.y}px)` }}>
              <circle r="13" />
            </g>
          </svg>
        </div>
        {animated && <p className="pulse-hero__scroll" aria-hidden="true">{isEn ? en.scrollHint : "مرّر للأسفل"}</p>}
      </div>
    </section>
  );
}