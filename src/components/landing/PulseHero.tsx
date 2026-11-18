"use client";

import { useEffect, useRef, useState } from "react";
import { frameAt, pulsePath, HOME } from "@/lib/landing/pulse-timeline";

export function PulseHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const sparkRef = useRef<SVGGElement>(null);
  const [animated, setAnimated] = useState(false);
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    setAnimated(true);
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
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
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
          <p className="pulse-hero__eyebrow">نبضة · NABDA AI</p>
          <h1 id="hero-title" className="pulse-hero__title">
            من خبر واحد… إلى حملة كاملة
            <span>بلغة جمهورك وعلى كل منصة</span>
          </h1>
          <div className="pulse-hero__actions">
            <a href="#start" className="pulse-btn pulse-btn--primary">جرّب نبضة</a>
            <a href="#how" className="pulse-btn pulse-btn--ghost">اكتشف كيف تعمل</a>
          </div>
        </div>

        <div className="pulse-hero__art">
          <svg viewBox="0 0 600 300" role="img" aria-label="نبضة: نقطة تنطلق وترتد ثم تستقر وتبدأ النبضة" className="pulse-svg">
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
          <p className="pulse-hero__note">رسم حركي مشتق للنبضة، منفصل عن الشعار الرسمي.</p>
        </div>
        {animated && <p className="pulse-hero__scroll" aria-hidden="true">مرّر للأسفل</p>}
      </div>
    </section>
  );
}