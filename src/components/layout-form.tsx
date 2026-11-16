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
  EyeOff,
  GripVertical,
  PanelLeft,
  PanelRight,
  Plus,
  RectangleVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import {
  ACCENTS,
  LAYOUT_PRESETS,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  applyPreset,
  foregroundFor,
  getAccent,
  isCustomAccent,
  matchesPreset,
  reorderWithinColumn,
} from "@/lib/layout";
import type {
  ColumnId,
  LayoutSection,
  ResumeData,
  ResumeLayout,
  SectionId,
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
    </div>
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
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs sm:p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}
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
