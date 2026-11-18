"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import { PreferencesControls } from "@/components/PreferencesControls";
import { LANDING_EN } from "@/lib/i18n/translations";
import { NAV_LINKS } from "./content";

export function SiteNav({ logoUrl }: { logoUrl: string }) {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const navLinks = isEn ? LANDING_EN.navLinks : NAV_LINKS;
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
          <Image
            className="nabda-logo"
            src={logoUrl}
            alt={isEn ? LANDING_EN.brandAlt : "نبضة — NABDA AI"}
            width={logoUrl.includes("dark") ? 428 : 528}
            height={logoUrl.includes("dark") ? 109 : 166}
            priority
          />
        </a>
        <nav aria-label={isEn ? LANDING_EN.navAria : "التنقل الرئيسي"} className="nabda-nav__desktop">
          <ul>
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
            <li>
              <Link href="/team">{isEn ? LANDING_EN.teamLink : "الفريق"}</Link>
            </li>
          </ul>
        </nav>
        <div className="nabda-nav__prefs">
          <PreferencesControls variant="landing" compact />
        </div>
        <a href="#start" className="pulse-btn pulse-btn--primary nabda-nav__cta">
          {isEn ? LANDING_EN.tryCta : "جرّب نبضة"}
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="nabda-nav__toggle"
          aria-expanded={open}
          aria-controls="nabda-mobile-menu"
          aria-label={open ? (isEn ? LANDING_EN.closeMenu : "إغلاق القائمة") : isEn ? LANDING_EN.openMenu : "فتح القائمة"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      <div id="nabda-mobile-menu" ref={sheetRef} className="nabda-nav__sheet" hidden={!open}>
        <nav aria-label={isEn ? LANDING_EN.mobileNavAria : "التنقل على الجوال"}>
          <ul>
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/team" onClick={() => setOpen(false)}>
                {isEn ? LANDING_EN.teamLink : "الفريق"}
              </Link>
            </li>
          </ul>
          <div className="nabda-nav__sheet-prefs">
            <PreferencesControls variant="landing" />
          </div>
          <a href="#start" className="pulse-btn pulse-btn--primary" onClick={() => setOpen(false)}>
            {isEn ? LANDING_EN.tryCta : "جرّب نبضة"}
          </a>
        </nav>
      </div>
    </header>
  );
}
