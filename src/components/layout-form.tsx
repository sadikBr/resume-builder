"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowRightLeft,
  Check,
  Columns2,
  Eye,
  Minus,
  EyeOff,
  GripVertical,
  PanelLeft,
  PanelRight,
  Plus,
  RectangleVertical,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import {
  ACCENTS,
  FONT_SIZE_LIMITS,
  FONT_SIZE_STEP,
  LAYOUT_PRESETS,
  TEXT_GROUPS,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  applyPreset,
  clampFontSize,
  defaultFontSizes,
  foregroundFor,
  getAccent,
  isCustomAccent,
  matchesPreset,
  reorderWithinColumn,
  scaleFontSizes,
} from "@/lib/layout";
import type {
  ColumnId,
  LayoutSection,
  ResumeData,
  ResumeLayout,
  SectionId,
  TextRole,
} from "@/types/resume";

interface LayoutFormProps {
  layout: ResumeLayout;
  updateLayout: Dispatch<SetStateAction<ResumeLayout>>;
  data: ResumeData;
}

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

export default function LayoutForm({ layout, updateLayout, data }: LayoutFormProps) {
  const t = useLanguage().t.layout;
  const set = <K extends keyof ResumeLayout>(key: K, value: ResumeLayout[K]) =>
    updateLayout((prev) => ({ ...prev, [key]: value }));

  // Functional updates so quick successive changes never overwrite each other.
  const updateSections = (fn: (sections: LayoutSection[]) => LayoutSection[]) =>
    updateLayout((prev) => ({ ...prev, sections: fn(prev.sections) }));

  const patchSection = (id: SectionId, patch: Partial<LayoutSection>) =>
    updateSections((sections) =>
      sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );

  const twoColumns = layout.columns === 2;

  return (
    <div className="space-y-4">
      <Panel title={t.presets} description={t.presetsDescription}>
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label={t.presets}>
          {LAYOUT_PRESETS.map((preset) => {
            const active = matchesPreset(layout, preset.layout);
            const names = t.presetNames[preset.id];
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => updateLayout((prev) => applyPreset(prev, preset.layout))}
                className={cn(
                  "group/preset rounded-xl border p-2 text-left outline-none transition-[border-color,box-shadow,background-color] focus-visible:ring-4 focus-visible:ring-primary/10",
                  active
                    ? "border-primary/40 bg-primary/[0.03] ring-4 ring-primary/10"
                    : "hover:border-foreground/20 hover:bg-muted/40",
                )}
              >
                <LayoutThumbnail layout={preset.layout} />
                <div className="mt-2.5 flex items-center justify-between gap-1 px-0.5">
                  <span className="truncate text-sm font-medium">{names.name}</span>
                  {active && (
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                </div>
                <div className="truncate px-0.5 text-[11px] text-muted-foreground">
                  {names.description}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title={t.columns} description={t.columnsDescription}>
        <Segmented
          value={layout.columns}
          onChange={(value) => set("columns", value)}
          options={[
            { value: 1, label: t.oneColumn, icon: <RectangleVertical /> },
            { value: 2, label: t.twoColumns, icon: <Columns2 /> },
          ]}
        />

        {twoColumns && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label={t.sidebarPosition}>
              <Segmented
                value={layout.sidebarPosition}
                onChange={(value) => set("sidebarPosition", value)}
                options={[
                  { value: "left", label: t.left, icon: <PanelLeft /> },
                  { value: "right", label: t.right, icon: <PanelRight /> },
                ]}
              />
            </Field>
            <Field label={t.sidebarBackground}>
              <Segmented
                value={layout.sidebarStyle}
                onChange={(value) => set("sidebarStyle", value)}
                options={[
                  { value: "plain", label: t.plain },
                  { value: "tinted", label: t.tinted },
                ]}
              />
            </Field>
            <Field
              label={t.columnWidths}
              className="sm:col-span-2"
              aside={
                <span className="tabular-nums">
                  {t.widths(100 - layout.sidebarWidth, layout.sidebarWidth)}
                </span>
              }
            >
              <input
                type="range"
                min={SIDEBAR_WIDTH_MIN}
                max={SIDEBAR_WIDTH_MAX}
                step={1}
                value={layout.sidebarWidth}
                onChange={(e) => set("sidebarWidth", Number(e.target.value))}
                aria-label={t.sidebarWidth}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{t.narrowSidebar}</span>
                <span>{t.equalColumns}</span>
              </div>
            </Field>
          </div>
        )}
      </Panel>

      <Panel
        title={t.sections}
        description={
          twoColumns
            ? t.sectionsTwoColumns
            : t.sectionsOneColumn
        }
      >
        {twoColumns ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {(layout.sidebarPosition === "left"
              ? (["side", "main"] as const)
              : (["main", "side"] as const)
            ).map((column) => (
              <SectionList
                key={column}
                title={column === "main" ? t.mainColumn : t.sidebar}
                sections={layout.sections.filter((s) => s.column === column)}
                data={data}
                onReorder={(ids) =>
                  updateSections((sections) => reorderWithinColumn(sections, column, ids))
                }
                onPatch={patchSection}
                moveTo={column === "main" ? "side" : "main"}
              />
            ))}
          </div>
        ) : (
          <SectionList
            sections={layout.sections}
            data={data}
            onReorder={(ids) =>
              updateSections((sections) =>
                ids.map((id) => sections.find((s) => s.id === id)!),
              )
            }
            onPatch={patchSection}
          />
        )}
      </Panel>

      <Panel title={t.style}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.accentColor}>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ACCENTS).map(([id, palette]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => set("accent", id)}
                  aria-label={t.accents[id] ?? palette.label}
                  aria-pressed={layout.accent === id}
                  title={t.accents[id] ?? palette.label}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    layout.accent === id && "ring-2 ring-foreground/70",
                  )}
                  style={{ backgroundColor: palette.accent }}
                >
                  {layout.accent === id && <Check className="size-4 text-white" />}
                </button>
              ))}

              {/* Any other color: a native color input hidden inside a rainbow swatch. */}
              <label
                title={t.customColor}
                className={cn(
                  "relative flex size-8 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-shadow focus-within:ring-2 focus-within:ring-ring",
                  isCustomAccent(layout.accent) && "ring-2 ring-foreground/70",
                )}
                style={{
                  background: isCustomAccent(layout.accent)
                    ? layout.accent
                    : "conic-gradient(from 180deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)",
                }}
              >
                {isCustomAccent(layout.accent) ? (
                  <Check className="size-4" style={{ color: foregroundFor(layout.accent) }} />
                ) : (
                  <Plus className="size-4 rounded-full bg-white/90 p-0.5 text-slate-700 shadow-sm" />
                )}
                <input
                  type="color"
                  aria-label={t.customColor}
                  value={isCustomAccent(layout.accent) ? layout.accent : getAccent(layout.accent).accent}
                  onChange={(e) => set("accent", e.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </Field>
          <Field label={t.skillStyle}>
            <Segmented
              value={layout.skillStyle}
              onChange={(value) => set("skillStyle", value)}
              options={[
                { value: "inline", label: t.text },
                { value: "chips", label: t.chips },
              ]}
            />
          </Field>
        </div>
      </Panel>

      <TextSizesPanel
        sizes={layout.fontSizes}
        onChange={(fn) => updateLayout((prev) => ({ ...prev, fontSizes: fn(prev.fontSizes) }))}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

type FontSizes = ResumeLayout["fontSizes"];

// Each click on "smaller"/"larger" scales every size by this much.
const SCALE_STEP = 1.05;

function TextSizesPanel({
  sizes,
  onChange,
}: {
  sizes: FontSizes;
  onChange: (fn: (sizes: FontSizes) => FontSizes) => void;
}) {
  const t = useLanguage().t.layout;
  const roles = Object.keys(defaultFontSizes) as TextRole[];
  const allDefault = roles.every((role) => sizes[role] === defaultFontSizes[role]);
  const atMin = roles.every((role) => sizes[role] <= FONT_SIZE_LIMITS[role].min);
  const atMax = roles.every((role) => sizes[role] >= FONT_SIZE_LIMITS[role].max);
  const setSize = (role: TextRole, value: number) =>
    onChange((prev) => ({ ...prev, [role]: clampFontSize(role, value) }));

  return (
    <Panel
      title={t.textSizes}
      description={t.textSizesDescription}
      aside={
        <div className="flex items-center gap-1">
          <div className="inline-flex rounded-lg border bg-muted p-0.5">
            <button
              type="button"
              onClick={() => onChange((prev) => scaleFontSizes(prev, 1 / SCALE_STEP))}
              disabled={atMin}
              aria-label={t.smallerAll}
              title={t.smallerAll}
              className="flex h-7 items-center rounded-md px-2 text-[11px] font-semibold text-muted-foreground outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
            >
              A<Minus className="ml-px size-2.5" strokeWidth={3} />
            </button>
            <button
              type="button"
              onClick={() => onChange((prev) => scaleFontSizes(prev, SCALE_STEP))}
              disabled={atMax}
              aria-label={t.largerAll}
              title={t.largerAll}
              className="flex h-7 items-center rounded-md px-2 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
            >
              A<Plus className="ml-px size-3" strokeWidth={3} />
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
            onClick={() => onChange(() => defaultFontSizes)}
            disabled={allDefault}
          >
            <RotateCcw className="size-3.5" />
            {t.resetAll}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {TEXT_GROUPS.map((group) => (
          <div key={group.id}>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.textGroups[group.id]}
            </div>
            <ul className="divide-y rounded-lg border">
              {group.roles.map((role) => (
                <FontSizeRow
                  key={role}
                  role={role}
                  value={sizes[role]}
                  onChange={(value) => setSize(role, value)}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function FontSizeRow({
  role,
  value,
  onChange,
}: {
  role: TextRole;
  value: number;
  onChange: (value: number) => void;
}) {
  const t = useLanguage().t.layout;
  const { label, hint } = t.textRoles[role];
  const { min, max } = FONT_SIZE_LIMITS[role];
  const fallback = defaultFontSizes[role];
  const changed = value !== fallback;
  const stepButton =
    "flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-30 [&_svg]:size-3.5";

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
      <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
        <div className="flex items-center gap-1.5 truncate text-sm font-medium">
          {label}
          {changed && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">{hint}</div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={FONT_SIZE_STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={`${value} px`}
        className="order-3 w-full accent-primary sm:order-2 sm:w-auto sm:min-w-0 sm:flex-1"
      />

      <div className="order-2 flex shrink-0 items-center sm:order-3">
        <button
          type="button"
          className={stepButton}
          onClick={() => onChange(value - FONT_SIZE_STEP)}
          disabled={value <= min}
          aria-label={t.decrease(label)}
        >
          <Minus />
        </button>
        <span
          className={cn(
            "w-14 text-center text-xs tabular-nums",
            changed ? "font-semibold text-foreground" : "text-muted-foreground",
          )}
        >
          {value} px
        </span>
        <button
          type="button"
          className={stepButton}
          onClick={() => onChange(value + FONT_SIZE_STEP)}
          disabled={value >= max}
          aria-label={t.increase(label)}
        >
          <Plus />
        </button>
        {/* Always takes its space so the columns line up whether or not a row was changed. */}
        <button
          type="button"
          className={cn(stepButton, "ml-0.5", !changed && "invisible")}
          onClick={() => onChange(fallback)}
          aria-label={t.resetSize(label)}
          title={`${t.resetSize(label)} (${fallback} px)`}
          tabIndex={changed ? 0 : -1}
        >
          <RotateCcw />
        </button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */

/** Miniature page drawn from a layout's own settings, so it never drifts from the real thing. */
function LayoutThumbnail({ layout }: { layout: ResumeLayout }) {
  const palette = getAccent(layout.accent);
  const lines = (count: number, widths = ["100%", "85%", "92%", "70%"]) =>
    Array.from({ length: count }, (_, i) => (
      <div key={i} className="h-[3px] rounded-full bg-slate-200" style={{ width: widths[i % widths.length] }} />
    ));
  const block = (key: number, rows: number) => (
    <div key={key} className="space-y-[3px]">
      <div className="mb-1 h-[3px] w-1/2 rounded-full" style={{ backgroundColor: palette.accent }} />
      {lines(rows)}
    </div>
  );

  const header = (
    <div className="flex items-center gap-1.5 px-2 pt-2 pb-1.5">
      <div className="flex-1 space-y-[3px]">
        <div className="h-[5px] w-3/5 rounded-full bg-slate-700" />
        <div className="h-[3px] w-2/5 rounded-full" style={{ backgroundColor: palette.accent }} />
        <div className="h-[3px] w-4/5 rounded-full bg-slate-200" />
      </div>
      <div className="size-4 shrink-0 rounded-full bg-slate-200" />
    </div>
  );

  const main = <div className="space-y-2 px-2 py-1.5">{[block(0, 4), block(1, 3), block(2, 2)]}</div>;
  const side = (
    <div
      className="h-full space-y-2 px-1.5 py-1.5"
      style={{ backgroundColor: layout.sidebarStyle === "tinted" ? palette.tint : undefined }}
    >
      {[block(0, 3), block(1, 2)]}
    </div>
  );

  return (
    <div className="aspect-[210/180] overflow-hidden rounded-md border bg-white shadow-xs">
      {header}
      <div className="h-px bg-slate-100" />
      {layout.columns === 2 ? (
        <div
          className="grid h-full"
          style={{
            gridTemplateColumns:
              layout.sidebarPosition === "left"
                ? `${layout.sidebarWidth}% 1fr`
                : `1fr ${layout.sidebarWidth}%`,
          }}
        >
          {layout.sidebarPosition === "left" ? [<div key="s">{side}</div>, <div key="m">{main}</div>] : [<div key="m">{main}</div>, <div key="s">{side}</div>]}
        </div>
      ) : (
        <div className="space-y-2 px-2 py-1.5">{[block(0, 4), block(1, 3), block(2, 2)]}</div>
      )}
    </div>
  );
}

function Panel({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  aside,
  className,
  children,
}: {
  label: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        {aside && <span className="text-muted-foreground">{aside}</span>}
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
}) {
  return (
    <div className="inline-flex w-full rounded-lg border bg-muted p-0.5" role="radiogroup">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3.5",
            value === option.value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SectionList({
  title,
  sections,
  data,
  onReorder,
  onPatch,
  moveTo,
}: {
  title?: string;
  sections: LayoutSection[];
  data: ResumeData;
  onReorder: (ids: SectionId[]) => void;
  onPatch: (id: SectionId, patch: Partial<LayoutSection>) => void;
  moveTo?: ColumnId;
}) {
  const t = useLanguage().t.layout;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = sections.map((s) => s.id);
    const from = ids.indexOf(active.id as SectionId);
    const to = ids.indexOf(over.id as SectionId);
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(ids, from, to));
  };

  return (
    <div className="space-y-2">
      {title && (
        <div className="px-1 text-xs font-medium text-muted-foreground">{title}</div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="min-h-12 space-y-1.5 rounded-lg border border-dashed p-1.5">
            {sections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                count={data[section.id].length}
                canDrag={sections.length > 1}
                moveTo={moveTo}
                onPatch={(patch) => onPatch(section.id, patch)}
              />
            ))}
            {sections.length === 0 && (
              <li className="flex h-9 items-center justify-center text-xs text-muted-foreground">
                {t.noSections}
              </li>
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SectionRow({
  section,
  count,
  canDrag,
  moveTo,
  onPatch,
}: {
  section: LayoutSection;
  count: number;
  canDrag: boolean;
  moveTo?: ColumnId;
  onPatch: (patch: Partial<LayoutSection>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: !canDrag });

  const { t: ui } = useLanguage();
  const t = ui.layout;
  const label = t.sectionNames[section.id];
  const target = moveTo === "main" ? t.mainColumn : t.sidebar;
  const hidden = !section.visible;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex list-none items-center gap-1 rounded-md border bg-card py-1 pl-1 pr-1 shadow-xs",
        isDragging && "relative z-10 shadow-lg ring-2 ring-primary/10",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={ui.list.reorder(label)}
        disabled={!canDrag}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground/60 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-30 disabled:hover:bg-transparent",
          canDrag && (isDragging ? "cursor-grabbing" : "cursor-grab"),
        )}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="min-w-0 flex-1 px-1">
        <div className={cn("truncate text-sm font-medium", hidden && "text-muted-foreground line-through")}>
          {label}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {count === 0 ? t.emptySection : ui.list.entries(count)}
        </div>
      </div>

      {moveTo && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          onClick={() => onPatch({ column: moveTo })}
          aria-label={`${t.moveTo(target)} (${label})`}
          title={t.moveTo(target)}
        >
          <ArrowRightLeft className="size-3.5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground"
        onClick={() => onPatch({ visible: hidden })}
        aria-label={`${hidden ? t.show : t.hide} (${label})`}
        title={hidden ? t.show : t.hide}
      >
        {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>
    </li>
  );
}
