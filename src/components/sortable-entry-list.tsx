"use client";

import type React from "react";
import { useState, type ReactNode } from "react";
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
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

type Entry<T> = { id: string; value: T };

let nextId = 0;
const createId = () => `entry-${nextId++}`;

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

export interface EntryFieldHelpers<T> {
  /** Unique, stable prefix for input ids inside this entry. */
  id: string;
  /** Change handler for inputs/textareas, keyed on the element's `name`. */
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  setField: <K extends keyof T>(name: K, value: T[K]) => void;
}

interface SortableEntryListProps<T> {
  data: T[];
  updateData: (data: T[]) => void;
  /** Entries shown when `data` is empty (not pushed to the resume until edited). */
  fallback: T[];
  createEmpty: () => T;
  addLabel: string;
  emptyTitle: string;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => string;
  renderFields: (item: T, helpers: EntryFieldHelpers<T>) => ReactNode;
}

export default function SortableEntryList<T extends object>({
  data,
  updateData,
  fallback,
  createEmpty,
  addLabel,
  emptyTitle,
  getTitle,
  getSubtitle,
  renderFields,
}: SortableEntryListProps<T>) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<Entry<T>[]>(() =>
    (data.length ? data : fallback).map((value) => ({ id: createId(), value })),
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const commit = (next: Entry<T>[]) => {
    setEntries(next);
    updateData(next.map((entry) => entry.value));
  };

  const updateEntry = (id: string, patch: Partial<T>) => {
    commit(
      entries.map((entry) =>
        entry.id === id ? { ...entry, value: { ...entry.value, ...patch } } : entry,
      ),
    );
  };

  const handleAdd = () => {
    // Like before, a blank entry only reaches the resume once it is edited.
    setEntries([...entries, { id: createId(), value: createEmpty() }]);
  };

  const handleRemove = (id: string) => {
    commit(entries.filter((entry) => entry.id !== id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = entries.findIndex((entry) => entry.id === active.id);
    const to = entries.findIndex((entry) => entry.id === over.id);
    if (from < 0 || to < 0) return;
    commit(arrayMove(entries, from, to));
  };

  const toggleCollapsed = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allCollapsed =
    entries.length > 0 && entries.every((entry) => collapsed.has(entry.id));

  return (
    <div className="space-y-3">
      {entries.length > 0 && (
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="text-xs text-muted-foreground">
            {t.list.entries(entries.length)}
            {entries.length > 1 && (
              <span className="hidden sm:inline">
                {" "}
                · {t.list.dragBefore}{" "}
                <GripVertical className="inline size-3 -mt-0.5" />{" "}
                {t.list.dragAfter}
              </span>
            )}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={() =>
              setCollapsed(
                allCollapsed ? new Set() : new Set(entries.map((e) => e.id)),
              )
            }
          >
            {allCollapsed ? (
              <>
                <ChevronsUpDown className="size-3.5" /> {t.list.expandAll}
              </>
            ) : (
              <>
                <ChevronsDownUp className="size-3.5" /> {t.list.collapseAll}
              </>
            )}
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={entries.map((entry) => entry.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-3">
            {entries.map((entry, index) => (
              <SortableEntryCard
                key={entry.id}
                id={entry.id}
                index={index}
                title={getTitle(entry.value).trim() || emptyTitle}
                isUntitled={!getTitle(entry.value).trim()}
                subtitle={getSubtitle?.(entry.value).trim()}
                canDrag={entries.length > 1}
                collapsed={collapsed.has(entry.id)}
                onToggle={() => toggleCollapsed(entry.id)}
                onRemove={() => handleRemove(entry.id)}
              >
                {renderFields(entry.value, {
                  id: entry.id,
                  handleChange: (e) =>
                    updateEntry(entry.id, {
                      [e.target.name]: e.target.value,
                    } as Partial<T>),
                  setField: (name, value) =>
                    updateEntry(entry.id, { [name]: value } as unknown as Partial<T>),
                })}
              </SortableEntryCard>
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        className="w-full border-dashed text-muted-foreground hover:text-foreground hover:border-solid"
        onClick={handleAdd}
      >
        <Plus className="size-4" /> {addLabel}
      </Button>
    </div>
  );
}

interface SortableEntryCardProps {
  id: string;
  index: number;
  title: string;
  isUntitled: boolean;
  subtitle?: string;
  canDrag: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onRemove: () => void;
  children: ReactNode;
}

function SortableEntryCard({
  id,
  index,
  title,
  isUntitled,
  subtitle,
  canDrag,
  collapsed,
  onToggle,
  onRemove,
  children,
}: SortableEntryCardProps) {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !canDrag });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn(
        "group/entry relative list-none rounded-xl border bg-card text-card-foreground shadow-xs transition-[box-shadow,border-color]",
        "hover:border-foreground/15 hover:shadow-sm",
        isDragging && "z-10 border-primary/30 shadow-lg ring-2 ring-primary/10",
      )}
    >
      <div className="flex items-center gap-1 py-2 pl-1.5 pr-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={t.list.reorder(title)}
          disabled={!canDrag}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 outline-none transition-colors",
            "hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
            "disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent",
            canDrag && (isDragging ? "cursor-grabbing" : "cursor-grab"),
          )}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-sm font-medium",
                isUntitled && "italic text-muted-foreground",
              )}
            >
              {title}
            </span>
            {subtitle && (
              <span className="block truncate text-xs text-muted-foreground">
                {subtitle}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              collapsed && "-rotate-90",
            )}
          />
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
          aria-label={t.list.remove(title)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {!collapsed && (
        <div className="border-t px-4 pt-4 pb-5 sm:px-5">{children}</div>
      )}
    </li>
  );
}
