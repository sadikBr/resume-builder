import type { ColumnId, LayoutSection, ResumeLayout } from "@/types/resume";

export const SIDEBAR_WIDTH_MIN = 25;
export const SIDEBAR_WIDTH_MAX = 50;

/**
 * Accent palettes. Hex values only (no color-mix/oklch) so the PDF capture
 * renders exactly what the preview shows.
 */
export const ACCENTS = {
  navy: { label: "Navy", accent: "#1e3a8a", soft: "#eff4ff", border: "#c7d5f5", tint: "#f4f7fc" },
  teal: { label: "Teal", accent: "#0f5e5a", soft: "#ebf7f6", border: "#bfe2de", tint: "#f2f8f8" },
  forest: { label: "Forest", accent: "#2f5d34", soft: "#eef6ee", border: "#c6dec8", tint: "#f4f8f3" },
  plum: { label: "Plum", accent: "#5b2a6e", soft: "#f6eff9", border: "#e0cbe9", tint: "#f9f5fa" },
  burgundy: { label: "Burgundy", accent: "#7f1d32", soft: "#fbeff1", border: "#efc9d1", tint: "#fbf5f6" },
  graphite: { label: "Graphite", accent: "#1f2937", soft: "#f1f2f4", border: "#d4d7dd", tint: "#f6f7f8" },
} as const;

export type AccentId = keyof typeof ACCENTS;

export type Palette = { accent: string; soft: string; border: string; tint: string };

/** A custom accent is stored as a hex color instead of a preset id. */
export const isCustomAccent = (accent: string) => /^#[0-9a-f]{6}$/i.test(accent);

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]) =>
  "#" + rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("");
/** Blend toward white; `amount` 0 = unchanged, 1 = white. */
const lighten = (rgb: number[], amount: number) => rgb.map((c) => c + (255 - c) * amount);

/** WCAG relative luminance, used to keep accent text readable on white. */
const luminance = (rgb: number[]) => {
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrastOnWhite = (rgb: number[]) => 1.05 / (luminance(rgb) + 0.05);

/**
 * Builds a full palette from any color, matching how the presets are built
 * (light shades are the accent blended toward white). Colors too pale to read
 * as text on white are darkened until they reach a 4.5:1 contrast ratio.
 */
export function paletteFromColor(hex: string): Palette {
  const base = toRgb(hex);
  let text = base;
  for (let i = 0; i < 40 && contrastOnWhite(text) < 4.5; i++) text = text.map((c) => c * 0.92);
  return {
    accent: toHex(text),
    soft: toHex(lighten(base, 0.92)),
    border: toHex(lighten(base, 0.75)),
    tint: toHex(lighten(base, 0.95)),
  };
}

/** Black or white, whichever reads better on top of the given color. */
export const foregroundFor = (hex: string) => (luminance(toRgb(hex)) > 0.45 ? "#0f172a" : "#ffffff");

export const getAccent = (accent: string): Palette =>
  isCustomAccent(accent)
    ? paletteFromColor(accent)
    : ACCENTS[(accent in ACCENTS ? accent : "navy") as AccentId];

export const defaultLayout: ResumeLayout = {
  columns: 2,
  sidebarPosition: "right",
  sidebarWidth: 34,
  sidebarStyle: "tinted",
  accent: "navy",
  skillStyle: "chips",
  sections: [
    { id: "experience", column: "main", visible: true },
    { id: "education", column: "main", visible: true },
    { id: "projects", column: "main", visible: true },
    { id: "skills", column: "side", visible: true },
    { id: "languages", column: "side", visible: true },
  ],
};

/**
 * Reorders the sections of one column while leaving the slots used by the
 * other column untouched, so switching back to one column keeps a sensible
 * interleaved order.
 */
export function reorderWithinColumn(
  sections: LayoutSection[],
  column: ColumnId,
  orderedIds: LayoutSection["id"][],
): LayoutSection[] {
  const byId = new Map(sections.map((s) => [s.id, s]));
  const queue = orderedIds.map((id) => byId.get(id)!);
  return sections.map((s) => (s.column === column ? queue.shift()! : s));
}

export type PresetId = "classic" | "modern" | "minimal";

export const LAYOUT_PRESETS: { id: PresetId; layout: ResumeLayout }[] = [
  { id: "classic", layout: defaultLayout },
  {
    id: "modern",
    layout: {
      columns: 2,
      sidebarPosition: "left",
      sidebarWidth: 32,
      sidebarStyle: "tinted",
      accent: "teal",
      skillStyle: "chips",
      sections: [
        { id: "skills", column: "side", visible: true },
        { id: "languages", column: "side", visible: true },
        { id: "experience", column: "main", visible: true },
        { id: "projects", column: "main", visible: true },
        { id: "education", column: "main", visible: true },
      ],
    },
  },
  {
    id: "minimal",
    layout: {
      columns: 1,
      sidebarPosition: "right",
      sidebarWidth: 34,
      sidebarStyle: "plain",
      accent: "graphite",
      skillStyle: "inline",
      sections: [
        { id: "experience", column: "main", visible: true },
        { id: "projects", column: "main", visible: true },
        { id: "skills", column: "side", visible: true },
        { id: "education", column: "main", visible: true },
        { id: "languages", column: "side", visible: true },
      ],
    },
  },
];

/** Applies a preset but keeps the user's choice of hidden sections. */
export function applyPreset(current: ResumeLayout, preset: ResumeLayout): ResumeLayout {
  const visible = new Map(current.sections.map((s) => [s.id, s.visible]));
  return {
    ...preset,
    sections: preset.sections.map((s) => ({ ...s, visible: visible.get(s.id) ?? true })),
  };
}

/** True when the layout matches the preset (section visibility aside). */
export function matchesPreset(layout: ResumeLayout, preset: ResumeLayout): boolean {
  const key = (l: ResumeLayout) =>
    JSON.stringify([
      l.columns,
      l.sidebarPosition,
      l.sidebarWidth,
      l.sidebarStyle,
      l.accent,
      l.skillStyle,
      l.sections.map((s) => [s.id, s.column]),
    ]);
  return key(layout) === key(preset);
}
