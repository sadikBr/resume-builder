"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

interface TagInputProps {
  id?: string;
  /** Comma-separated list, the format the resume data stores. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const parse = (value: string) =>
  value
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

/** Editable list of chips backed by a comma-separated string. */
export default function TagInput({ id, value, onChange, placeholder }: TagInputProps) {
  const { t } = useLanguage();
  const tags = parse(value);
  const [draft, setDraft] = useState("");
  // First Backspace on an empty field marks the last tag, the second removes it.
  const [armed, setArmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const commit = (next: string[]) => onChange(next.join(", "));

  const add = (raw: string) => {
    const seen = new Set(tags.map((tag) => tag.toLowerCase()));
    const fresh = parse(raw).filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (fresh.length) commit([...tags, ...fresh]);
    setDraft("");
  };

  const remove = (index: number) => {
    commit(tags.filter((_, i) => i !== index));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      e.preventDefault();
      if (armed) {
        commit(tags.slice(0, -1));
        setArmed(false);
      } else {
        setArmed(true);
      }
      return;
    }
    setArmed(false);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (/[,\n]/.test(text)) {
      e.preventDefault();
      add(draft + text);
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const keys = tags.map((tag) => tag.toLowerCase());
    const from = keys.indexOf(String(active.id));
    const to = keys.indexOf(String(over.id));
    if (from >= 0 && to >= 0) commit(arrayMove(tags, from, to));
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && inputRef.current?.focus()}
      className={cn(
        "flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-transparent bg-muted/70 p-1.5 transition-[background-color,border-color,box-shadow]",
        "hover:bg-muted focus-within:border-primary/30 focus-within:bg-background focus-within:ring-4 focus-within:ring-primary/10 focus-within:hover:bg-background",
      )}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tags.map((tag) => tag.toLowerCase())} strategy={rectSortingStrategy}>
          {tags.map((tag, i) => (
            <Tag
              key={tag.toLowerCase()}
              tag={tag}
              highlighted={armed && i === tags.length - 1}
              removeLabel={t.inputs.removeTag(tag)}
              onRemove={() => remove(i)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <input
        ref={inputRef}
        id={id}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setArmed(false);
        }}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          if (draft.trim()) add(draft);
          setArmed(false);
        }}
        placeholder={tags.length === 0 ? (placeholder ?? t.inputs.tagPlaceholder) : undefined}
        className="h-7 min-w-[10ch] flex-1 bg-transparent px-1.5 text-base outline-none placeholder:text-muted-foreground/70 md:text-sm"
      />
    </div>
  );
}

function Tag({
  tag,
  highlighted,
  removeLabel,
  onRemove,
}: {
  tag: string;
  highlighted: boolean;
  removeLabel: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tag.toLowerCase(),
  });

  return (
    <span
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "inline-flex h-7 cursor-grab touch-none select-none items-center gap-1 rounded-md border bg-background pr-1 pl-2.5 text-sm shadow-xs outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        isDragging && "z-10 cursor-grabbing shadow-md ring-2 ring-primary/15",
        highlighted && "border-destructive/40 bg-destructive/5 text-destructive",
      )}
    >
      {tag}
      <button
        type="button"
        // Keep the drag sensor from swallowing the click.
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        aria-label={removeLabel}
        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
