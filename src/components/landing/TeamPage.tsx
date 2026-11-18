"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenText, Code2, Sparkles } from "lucide-react";
import { PreferencesControls } from "@/components/PreferencesControls";
import { usePreferences } from "@/components/PreferencesProvider";
import { LANDING_EN, TEAM_COPY } from "@/lib/i18n/translations";

const MEMBER_ICONS = {
  fatima: BookOpenText,
  osama: Code2,
  noura: Sparkles,
} as const;

export function TeamPage() {
  const { theme, lang, dir } = usePreferences();
  const isEn = lang === "en";
  const isLight = theme === "light";
  const t = TEAM_COPY[lang];
  const logoUrl = isLight ? "/brand/nabda-logo.png" : "/brand/nabda-logo-dark.png";
  const ForwardArrow = isEn ? ArrowRight : ArrowLeft;

  return (
    <div id="top" dir={dir} lang={lang} className="nabda-page lp-team-page">
      <header className="nabda-nav is-scrolled">
        <div className="nabda-nav__bar">
          <Link href="/" className="nabda-nav__brand">
            <Image
              className="nabda-logo"
              src={logoUrl}
              alt={isEn ? LANDING_EN.brandAlt : "نبضة — NABDA AI"}
              width={isLight ? 528 : 428}
              height={isLight ? 166 : 109}
              priority
            />
          </Link>
          <nav aria-label={t.navAria} className="nabda-nav__desktop">
            <ul>
              <li>
                <Link href="/">{t.homeLink}</Link>
              </li>
              <li>
                <Link href="/team" aria-current="page" className="is-current-link">
                  {isEn ? LANDING_EN.teamLink : "الفريق"}
                </Link>
              </li>
            </ul>
          </nav>
          <div className="nabda-nav__prefs">
            <PreferencesControls variant="landing" compact />
          </div>
          <Link href="/app" className="pulse-btn pulse-btn--primary nabda-nav__cta">
            {t.workspaceLink}
          </Link>
        </div>
      </header>

      <main className="lp-team-main">
        <section className="lp-section lp-team-hero" aria-labelledby="team-title">
          <div className="lp-container">
            <header className="lp-head lp-head--center lp-team-head">
              <p className="lp-eyebrow">{t.eyebrow}</p>
              <h1 id="team-title" className="lp-title">
                {t.title}
              </h1>
              <p className="lp-lead">{t.lead}</p>
              <span className="lp-team-track" dir="ltr">
                {t.trackBadge}
              </span>
            </header>

            <ul className="lp-team-grid" aria-label={t.membersAria}>
              {t.members.map((member) => {
                const Icon = MEMBER_ICONS[member.id];
                return (
                  <li key={member.id} className="lp-team-card">
                    <div className="lp-team-card__top">
                      <span className="lp-team-avatar" aria-hidden="true">
                        {member.initials}
                      </span>
                      <span className="lp-team-icon" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                    </div>
                    <h2 className="lp-team-card__name">{member.name}</h2>
                    <p className="lp-team-card__role">{member.role}</p>
                    <p className="lp-team-card__bio">{member.bio}</p>
                  </li>
                );
              })}
            </ul>

            <div className="lp-team-cta">
              <h2>{t.ctaTitle}</h2>
              <div className="lp-cta__actions">
                <Link href="/app" className="pulse-btn pulse-btn--primary pulse-btn--lg">
                  <span>{t.ctaPrimary}</span>
                  <ForwardArrow aria-hidden="true" />
                </Link>
                <Link href="/" className="pulse-btn pulse-btn--ghost pulse-btn--lg">
                  {t.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer__inner">
          <div className="lp-footer__brand">
            <Image
              className="nabda-logo"
              src={logoUrl}
              alt={isEn ? LANDING_EN.brandAlt : "نبضة — NABDA AI"}
              width={isLight ? 528 : 428}
              height={isLight ? 166 : 109}
            />
            <p>{isEn ? LANDING_EN.footer.tagline : "من خبر واحد إلى محتوى بلغة جمهورك، تحت مراجعتك."}</p>
          </div>
          <nav aria-label={isEn ? LANDING_EN.footer.navAria : "روابط التذييل"}>
            <ul>
              <li>
                <Link href="/">{t.homeLink}</Link>
              </li>
              <li>
                <Link href="/team">{isEn ? LANDING_EN.teamLink : "الفريق"}</Link>
              </li>
              <li>
                <Link href="/app">{t.workspaceLink}</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="lp-container lp-footer__legal">
          <p>{isEn ? LANDING_EN.footer.copyright : "© 2026 نبضة NABDA AI"}</p>
        </div>
      </footer>
    </div>
  );
}
