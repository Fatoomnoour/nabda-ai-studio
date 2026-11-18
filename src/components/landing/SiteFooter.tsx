"use client";

import Image from "next/image";
import Link from "next/link";
import { usePreferences } from "@/components/PreferencesProvider";
import { LANDING_EN } from "@/lib/i18n/translations";
import { NAV_LINKS } from "./content";

export function SiteFooter({ logoUrl }: { logoUrl: string }) {
  const { lang } = usePreferences();
  const isEn = lang === "en";
  const en = LANDING_EN.footer;
  const navLinks = isEn ? LANDING_EN.navLinks : NAV_LINKS;

  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer__inner">
        <div className="lp-footer__brand">
          <Image
            className="nabda-logo"
            src={logoUrl}
            alt={isEn ? LANDING_EN.brandAlt : "نبضة — NABDA AI"}
            width={logoUrl.includes("dark") ? 428 : 528}
            height={logoUrl.includes("dark") ? 109 : 166}
          />
          <p>{isEn ? en.tagline : "من خبر واحد إلى محتوى بلغة جمهورك، تحت مراجعتك."}</p>
        </div>
        <nav aria-label={isEn ? en.navAria : "روابط التذييل"}>
          <ul>
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
            <li>
              <a href="#faq">{isEn ? en.faqLink : "أسئلة شائعة"}</a>
            </li>
            <li>
              <Link href="/team">{isEn ? LANDING_EN.teamLink : "الفريق"}</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="lp-container lp-footer__legal">
        <p>{isEn ? en.copyright : "© 2026 نبضة NABDA AI"}</p>
      </div>
    </footer>
  );
}
