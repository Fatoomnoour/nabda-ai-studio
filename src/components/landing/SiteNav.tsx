"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "./content";

export function SiteNav({ logoUrl }: { logoUrl: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    sheetRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 861px)");
    const onDesktop = () => desktop.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  const cls = ["nabda-nav", scrolled && "is-scrolled", open && "is-open"].filter(Boolean).join(" ");

  return (
    <header className={cls}>
      <div className="nabda-nav__bar">
        <a href="#top" className="nabda-nav__brand">
          <Image className="nabda-logo" src={logoUrl} alt="نبضة — NABDA AI" width={528} height={166} priority />
        </a>
        <nav aria-label="التنقل الرئيسي" className="nabda-nav__desktop">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#start" className="pulse-btn pulse-btn--primary nabda-nav__cta">
          جرّب نبضة
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="nabda-nav__toggle"
          aria-expanded={open}
          aria-controls="nabda-mobile-menu"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      <div id="nabda-mobile-menu" ref={sheetRef} className="nabda-nav__sheet" hidden={!open}>
        <nav aria-label="التنقل على الجوال">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#start" className="pulse-btn pulse-btn--primary" onClick={() => setOpen(false)}>
            جرّب نبضة
          </a>
        </nav>
      </div>
    </header>
  );
}
