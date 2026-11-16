"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  ACCENTS,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  clampFontSize,
  defaultFontSizes,
  defaultLayout,
  isCustomAccent,
} from "@/lib/layout";
import { PLACEHOLDER_PHOTO, sampleResumeData } from "@/lib/sample-resume";
import type { LayoutSection, ResumeData, ResumeLayout, SectionId, TextRole } from "@/types/resume";

const STORAGE_KEY = "resume-builder:v1";
const SAVE_DELAY_MS = 300;

export type SaveStatus = "pending" | "saved" | "error";

interface ResumeStore {
  resumeData: ResumeData;
  setResumeData: Dispatch<SetStateAction<ResumeData>>;
  layout: ResumeLayout;
  setLayout: Dispatch<SetStateAction<ResumeLayout>>;
  /** False until the saved resume (if any) has been read from storage. */
  ready: boolean;
  /**
   * Bumps whenever the data is replaced wholesale (reset, another tab). Forms
   * keep their own editing state, so they are remounted on this key.
   */
  revision: number;
  saveStatus: SaveStatus;
  reset: () => void;
  /** Replaces the whole resume (e.g. with the unlocked personal one); the layout is kept. */
  replaceData: (data: ResumeData) => void;
}

const ResumeStoreContext = createContext<ResumeStore | null>(null);

/** Holds the resume and its layout, and keeps them in localStorage. */
export function ResumeStoreProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(sampleResumeData);
  const [layout, setLayout] = useState<ResumeLayout>(defaultLayout);
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  const apply = useCallback((stored: Stored | null) => {
    if (!stored) return false;
    setResumeData(stored.data);
    setLayout(stored.layout);
    return true;
  }, []);

  // Load after mount, never during render: the server has no localStorage, so
  // reading it earlier would make the first client render disagree with the HTML.
  useEffect(() => {
    apply(readStored());
    setReady(true);
  }, [apply]);

  // Save shortly after the last change.
  useEffect(() => {
    if (!ready) return;
    setSaveStatus("pending");
    const timer = setTimeout(() => {
      setSaveStatus(writeStored({ data: resumeData, layout }) ? "saved" : "error");
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [resumeData, layout, ready]);

  // Another tab saved: pick up its version so the two don't overwrite each other blindly.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      if (apply(parseStored(e.newValue))) setRevision((r) => r + 1);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [apply]);

  const reset = useCallback(() => {
    setResumeData(sampleResumeData);
    setLayout(defaultLayout);
    setRevision((r) => r + 1);
  }, []);

  const replaceData = useCallback((data: ResumeData) => {
    setResumeData(data);
    setRevision((r) => r + 1);
  }, []);

  return (
    <ResumeStoreContext.Provider
      value={{ resumeData, setResumeData, layout, setLayout, ready, revision, saveStatus, reset, replaceData }}
    >
      {children}
    </ResumeStoreContext.Provider>
  );
}

export function useResumeStore() {
  const context = useContext(ResumeStoreContext);
  if (!context) throw new Error("useResumeStore must be used inside <ResumeStoreProvider>");
  return context;
}

/* ------------------------------------------------------------------ */
/* Storage, with defensive parsing: saved data may come from an older  */
/* version of the app, or have been edited by hand.                    */
/* ------------------------------------------------------------------ */

interface Stored {
  data: ResumeData;
  layout: ResumeLayout;
}

function writeStored(value: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...value }));
    return true;
  } catch {
    // Storage full, disabled, or in a private window.
    return false;
  }
}

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseStored(raw) : null;
  } catch {
    return null;
  }
}

function parseStored(raw: string): Stored | null {
  try {
    const parsed = JSON.parse(raw);
    if (!isObject(parsed) || parsed.version !== 1) return null;
    return { data: normalizeData(parsed.data), layout: normalizeLayout(parsed.layout) };
  } catch {
    return null;
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Copies only the template's keys, keeping string values and blanking anything else. */
function pickStrings<T extends object>(template: T, value: unknown): T {
  const source = isObject(value) ? value : {};
  const out = {} as Record<string, string>;
  for (const key of Object.keys(template)) {
    const v = source[key];
    out[key] = typeof v === "string" ? v : "";
  }
  return out as T;
}

function entries<T extends object>(template: T, value: unknown): T[] {
  return Array.isArray(value) ? value.filter(isObject).map((item) => pickStrings(template, item)) : [];
}

/** Turns untrusted JSON (storage, network) into well-formed resume data. */
export function normalizeData(value: unknown): ResumeData {
  const data = isObject(value) ? value : {};
  const personalInfo = pickStrings(sampleResumeData.personalInfo, data.personalInfo);
  // The bundled placeholder photo's URL changes with every build; point old saves at the current one.
  if (personalInfo.photoUrl.startsWith("/_next/static/media/profile.")) {
    personalInfo.photoUrl = PLACEHOLDER_PHOTO;
  }
  return {
    personalInfo,
    education: entries(sampleResumeData.education[0], data.education),
    experience: entries(sampleResumeData.experience[0], data.experience),
    skills: entries(sampleResumeData.skills[0], data.skills),
    projects: entries(sampleResumeData.projects[0], data.projects),
    languages: entries({ name: "", proficiency: "" }, data.languages),
  };
}

function normalizeLayout(value: unknown): ResumeLayout {
  const l = isObject(value) ? value : {};
  const pick = <T,>(v: unknown, allowed: readonly T[], fallback: T) =>
    allowed.includes(v as T) ? (v as T) : fallback;

  const knownIds = defaultLayout.sections.map((s) => s.id);
  const sections: LayoutSection[] = [];
  if (Array.isArray(l.sections)) {
    for (const s of l.sections) {
      if (!isObject(s) || !knownIds.includes(s.id as SectionId)) continue;
      if (sections.some((existing) => existing.id === s.id)) continue;
      sections.push({
        id: s.id as SectionId,
        column: pick(s.column, ["main", "side"] as const, "main"),
        visible: typeof s.visible === "boolean" ? s.visible : true,
      });
    }
  }
  // Sections added in a later version of the app go where the default puts them.
  for (const section of defaultLayout.sections) {
    if (!sections.some((s) => s.id === section.id)) sections.push(section);
  }

  // Saves from before text sizes existed get the defaults; unknown roles are dropped.
  const storedSizes = isObject(l.fontSizes) ? l.fontSizes : {};
  const fontSizes = { ...defaultFontSizes };
  for (const role of Object.keys(fontSizes) as TextRole[]) {
    const v = storedSizes[role];
    if (typeof v === "number" && Number.isFinite(v)) fontSizes[role] = clampFontSize(role, v);
  }

  const width = typeof l.sidebarWidth === "number" ? l.sidebarWidth : defaultLayout.sidebarWidth;
  return {
    columns: pick(l.columns, [1, 2] as const, defaultLayout.columns),
    sidebarPosition: pick(l.sidebarPosition, ["left", "right"] as const, defaultLayout.sidebarPosition),
    sidebarWidth: Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, Math.round(width))),
    sidebarStyle: pick(l.sidebarStyle, ["plain", "tinted"] as const, defaultLayout.sidebarStyle),
    accent:
      typeof l.accent === "string" && (l.accent in ACCENTS || isCustomAccent(l.accent))
        ? l.accent
        : defaultLayout.accent,
    skillStyle: pick(l.skillStyle, ["chips", "inline"] as const, defaultLayout.skillStyle),
    fontSizes,
    sections,
  };
}
