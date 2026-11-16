"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ResumeLanguage } from "@/lib/i18n";
import { uiTranslations, type UiText } from "@/lib/ui-i18n";

interface LanguageContextValue {
  language: ResumeLanguage;
  setLanguage: (language: ResumeLanguage) => void;
  /** Editor text in the current language. */
  t: UiText;
}

const STORAGE_KEY = "resume-builder:language";

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** One EN/FR switch for both the editor and the resume. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<ResumeLanguage>("en");
  const [loaded, setLoaded] = useState(false);

  // Restore the last choice after mount (the server can't see localStorage).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "fr") setLanguage(saved);
    } catch {
      // Storage unavailable: keep the default.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Not critical; the language just won't be remembered.
    }
  }, [language, loaded]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: uiTranslations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return context;
}
