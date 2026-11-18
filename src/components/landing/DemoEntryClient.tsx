"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { usePreferences } from "@/components/PreferencesProvider";
import { LOGIN_COPY } from "@/lib/i18n/translations";

export function DemoEntryShell({ children }: { children: ReactNode }) {
  const { lang, dir } = usePreferences();
  return (
    <main className="nabda-page lp-demo-entry" dir={dir} lang={lang}>
      {children}
    </main>
  );
}

export function DemoEntryLogo() {
  const { theme, lang } = usePreferences();
  const isLight = theme === "light";
  return (
    <Image
      className="nabda-logo"
      src={isLight ? "/brand/nabda-logo.png" : "/brand/nabda-logo-dark.png"}
      alt={LOGIN_COPY[lang].logoAlt}
      width={isLight ? 528 : 428}
      height={isLight ? 166 : 109}
      priority
    />
  );
}

export function DemoEntryCopy({ part }: { part: "title" | "lead" | "enterBtn" | "backBtn" }) {
  const { lang } = usePreferences();
  const copy = LOGIN_COPY[lang];
  if (part === "title") return <h1 className="lp-title">{copy.title}</h1>;
  if (part === "lead") return <p className="lp-lead">{copy.lead}</p>;
  return <>{copy[part]}</>;
}
