"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import type { Lang, Theme } from "@/lib/i18n/translations";

const THEME_KEY = "nabda-theme";
const LANG_KEY = "nabda-lang";
const PREFS_EVENT = "nabda-preferences-change";

interface PreferencesContextValue {
  theme: Theme;
  lang: Lang;
  dir: "rtl" | "ltr";
  setTheme: (next: Theme) => void;
  toggleTheme: () => void;
  setLang: (next: Lang) => void;
  toggleLang: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue>({
  theme: "dark",
  lang: "ar",
  dir: "rtl",
  setTheme: () => {},
  toggleTheme: () => {},
  setLang: () => {},
  toggleLang: () => {},
});

function subscribePreferences(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const onChange = () => callback();
  window.addEventListener(PREFS_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PREFS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore storage read failures
  }
  return "dark";
}

function getLangSnapshot(): Lang {
  if (typeof window === "undefined") return "ar";
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch {
    // ignore storage read failures
  }
  return "ar";
}

function getServerTheme(): Theme {
  return "dark";
}

function getServerLang(): Lang {
  return "ar";
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribePreferences, getThemeSnapshot, getServerTheme);
  const lang = useSyncExternalStore(subscribePreferences, getLangSnapshot, getServerLang);
  const dir: "rtl" | "ltr" = lang === "en" ? "ltr" : "rtl";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [theme, lang, dir]);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore storage write failures
    }
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event(PREFS_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getThemeSnapshot() === "dark" ? "light" : "dark");
  }, [setTheme]);

  const setLang = useCallback((next: Lang) => {
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore storage write failures
    }
    document.documentElement.lang = next;
    document.documentElement.dir = next === "en" ? "ltr" : "rtl";
    window.dispatchEvent(new Event(PREFS_EVENT));
  }, []);

  const toggleLang = useCallback(() => {
    setLang(getLangSnapshot() === "ar" ? "en" : "ar");
  }, [setLang]);

  return (
    <PreferencesContext.Provider value={{ theme, lang, dir, setTheme, toggleTheme, setLang, toggleLang }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
