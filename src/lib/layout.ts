import type { ColumnId, LayoutSection, ResumeLayout, TextRole } from "@/types/resume";

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

/**
 * Text roles, grouped the way the layout form shows them. `min`/`max` keep
 * every size inside a range that still prints legibly and fits the page.
 */
export const TEXT_GROUPS: { id: "header" | "entries" | "lists"; roles: TextRole[] }[] = [
  { id: "header", roles: ["name", "title", "tagline", "contact"] },
  { id: "entries", roles: ["sectionTitle", "entryTitle", "organisation", "meta", "body"] },
  { id: "lists", roles: ["skillCategory", "tags", "languages"] },
];

export const FONT_SIZE_STEP = 0.5;

export const FONT_SIZE_LIMITS: Record<TextRole, { min: number; max: number }> = {
  name: { min: 18, max: 48 },
  title: { min: 8, max: 20 },
  tagline: { min: 8, max: 18 },
  contact: { min: 8, max: 16 },
  sectionTitle: { min: 8, max: 20 },
  entryTitle: { min: 9, max: 22 },
  organisation: { min: 8, max: 18 },
  meta: { min: 7, max: 16 },
  body: { min: 8, max: 18 },
  skillCategory: { min: 8, max: 18 },
  tags: { min: 7, max: 16 },
  languages: { min: 8, max: 18 },
};

export const defaultFontSizes: Record<TextRole, number> = {
  name: 30,
  title: 12.5,
  tagline: 12,
  contact: 11,
  sectionTitle: 11.5,
  entryTitle: 13,
  organisation: 11.5,
  meta: 11,
  body: 11.5,
  skillCategory: 11.5,
  tags: 10.5,
  languages: 11.5,
};

/** Rounds to the slider step and keeps the size inside the role's limits. */
export function clampFontSize(role: TextRole, size: number) {
  const { min, max } = FONT_SIZE_LIMITS[role];
  const stepped = Math.round(size / FONT_SIZE_STEP) * FONT_SIZE_STEP;
  return Math.min(max, Math.max(min, stepped));
}

/** Grows or shrinks every size by the same factor, so the hierarchy is kept. */
export function scaleFontSizes(sizes: Record<TextRole, number>, factor: number) {
  const out = { ...sizes };
  for (const role of Object.keys(out) as TextRole[]) {
    const scaled = clampFontSize(role, sizes[role] * factor);
    // Small sizes would round back to themselves; always move at least one step.
    out[role] =
      scaled !== sizes[role]
        ? scaled
        : clampFontSize(role, sizes[role] + (factor > 1 ? FONT_SIZE_STEP : -FONT_SIZE_STEP));
  }
  return out;
}

/** CSS variables the preview reads its font sizes from (`--fs-<role>`). */
export const fontSizeVariables = (sizes: Record<TextRole, number>) =>
  Object.fromEntries(
    (Object.keys(sizes) as TextRole[]).map((role) => [`--fs-${role}`, `${sizes[role]}px`]),
  );

export const defaultLayout: ResumeLayout = {
  columns: 2,
  sidebarPosition: "right",
  sidebarWidth: 34,
  sidebarStyle: "tinted",
  accent: "navy",
  skillStyle: "chips",
  fontSizes: defaultFontSizes,
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
      fontSizes: defaultFontSizes,
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
      fontSizes: defaultFontSizes,
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

/** Applies a preset but keeps the user's hidden sections and text sizes. */
export function applyPreset(current: ResumeLayout, preset: ResumeLayout): ResumeLayout {
  const visible = new Map(current.sections.map((s) => [s.id, s.visible]));
  return {
    ...preset,
    fontSizes: current.fontSizes,
    sections: preset.sections.map((s) => ({ ...s, visible: visible.get(s.id) ?? true })),
  };
}

/** True when the layout matches the preset (section visibility and text sizes aside). */
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
