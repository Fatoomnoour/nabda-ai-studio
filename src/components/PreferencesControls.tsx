"use client";

import { Languages, Moon, Sun } from "lucide-react";
import { usePreferences } from "./PreferencesProvider";
import { CONTROLS_COPY } from "@/lib/i18n/translations";

interface Props {
  variant?: "landing" | "workspace";
  compact?: boolean;
}

export function PreferencesControls({ variant = "workspace", compact = false }: Props) {
  const { theme, lang, toggleTheme, toggleLang } = usePreferences();
  const copy = CONTROLS_COPY[lang];
  const isLight = theme === "light";

  return (
    <div
      className={`prefs-controls prefs-controls--${variant} ${compact ? "is-compact" : ""}`}
      role="group"
      aria-label={lang === "ar" ? "تفضيلات اللغة والمظهر" : "Language and theme preferences"}
    >
      <button
        type="button"
        className="prefs-btn"
        onClick={toggleLang}
        aria-label={lang === "ar" ? copy.switchToEn : copy.switchToAr}
        title={lang === "ar" ? copy.switchToEn : copy.switchToAr}
      >
        <Languages size={15} aria-hidden="true" />
        <span>{copy.langBadge}</span>
      </button>

      <button
        type="button"
        className="prefs-btn"
        onClick={toggleTheme}
        aria-pressed={isLight}
        aria-label={isLight ? copy.switchToDark : copy.switchToLight}
        title={isLight ? copy.switchToDark : copy.switchToLight}
      >
        {isLight ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
        {!compact && <span>{isLight ? copy.darkLabel : copy.lightLabel}</span>}
      </button>
    </div>
  );
}
