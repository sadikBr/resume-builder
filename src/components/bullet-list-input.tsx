"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
import { GripVertical, Plus, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

interface BulletListInputProps {
  id?: string;
  /** One bullet per line, the format the resume data stores. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type Item = { id: string; text: string };

let nextId = 0;
const createItem = (text = ""): Item => ({ id: `bullet-${nextId++}`, text });

const toItems = (value: string) => {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length ? lines.map((line) => createItem(line)) : [createItem()];
};

const serialize = (items: Item[]) =>
  items
    .map((item) => item.text.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .join("\n");

const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

/** Edits a newline-separated list as individual, reorderable bullet points. */
export default function BulletListInput({ id, value, onChange, placeholder }: BulletListInputProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>(() => toItems(value));
  // What we last sent up; lets us tell our own edits from outside changes.
  const committed = useRef(value);
  const fields = useRef(new Map<string, HTMLTextAreaElement>());
  const pendingFocus = useRef<{ id: string; caret: number } | null>(null);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setItems(toItems(value));
    }
  }, [value]);

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const field = fields.current.get(target.id);
    if (field) {
      field.focus();
      field.setSelectionRange(target.caret, target.caret);
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const commit = (next: Item[]) => {
    setItems(next);
    const serialized = serialize(next);
    if (serialized !== committed.current) {
      committed.current = serialized;
      onChange(serialized);
    }
  };

  const focus = (item: Item | undefined, caret: number) => {
    if (item) pendingFocus.current = { id: item.id, caret };
  };

  const insertAfter = (index: number, text = "") => {
    const item = createItem(text);
    const next = [...items];
    next.splice(index + 1, 0, item);
    focus(item, 0);
    return next;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    const field = e.currentTarget;
    const { selectionStart, selectionEnd, value: text } = field;
    const collapsed = selectionStart === selectionEnd;

    if (e.key === "Enter" && !e.shiftKey) {
      // Enter splits the bullet at the caret, like a word processor.
      e.preventDefault();
      const next = insertAfter(index, text.slice(selectionEnd).trimStart());
      next[index] = { ...items[index], text: text.slice(0, selectionStart).trimEnd() };
      commit(next);
    } else if (e.key === "Backspace" && collapsed && selectionStart === 0 && index > 0) {
      // Backspace at the start merges into the previous bullet.
      e.preventDefault();
      const previous = items[index - 1];
      const joiner = previous.text && text ? " " : "";
      const next = items.filter((_, i) => i !== index);
      next[index - 1] = { ...previous, text: previous.text + joiner + text };
      focus(previous, previous.text.length + joiner.length);
      commit(next);
    } else if (e.key === "ArrowUp" && collapsed && selectionStart === 0 && index > 0) {
      e.preventDefault();
      focus(items[index - 1], items[index - 1].text.length);
      setItems([...items]);
    } else if (e.key === "ArrowDown" && collapsed && selectionEnd === text.length && index < items.length - 1) {
      e.preventDefault();
      focus(items[index + 1], 0);
      setItems([...items]);
    }
  };

  const remove = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    commit(next.length ? next : [createItem()]);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    if (from >= 0 && to >= 0) commit(arrayMove(items, from, to));
  };

  return (
    <div className="space-y-1.5 rounded-lg bg-muted/70 p-1.5">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <BulletRow
                key={item.id}
                item={item}
                inputId={index === 0 ? id : undefined}
                placeholder={placeholder ?? t.inputs.bulletPlaceholder}
                canDrag={items.length > 1}
                reorderLabel={t.inputs.reorderBullet}
                removeLabel={t.inputs.removeBullet}
                registerField={(el) => {
                  if (el) fields.current.set(item.id, el);
                  else fields.current.delete(item.id);
                }}
                onChange={(text) =>
                  commit(items.map((it) => (it.id === item.id ? { ...it, text } : it)))
                }
                onKeyDown={(e) => handleKeyDown(e, index)}
                onRemove={() => remove(index)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => commit(insertAfter(items.length - 1))}
        className="flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
      >
        <Plus className="size-4" /> {t.inputs.addBullet}
      </button>
    </div>
  );
}

function BulletRow({
  item,
  inputId,
  placeholder,
  canDrag,
  reorderLabel,
  removeLabel,
  registerField,
  onChange,
  onKeyDown,
  onRemove,
}: {
  item: Item;
  inputId?: string;
  placeholder: string;
  canDrag: boolean;
  reorderLabel: string;
  removeLabel: string;
  registerField: (el: HTMLTextAreaElement | null) => void;
  onChange: (text: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: !canDrag });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group/bullet flex list-none items-start gap-1 rounded-md border border-transparent bg-background py-1 pr-1 pl-0.5 shadow-xs transition-[border-color,box-shadow]",
        "focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10",
        isDragging && "relative z-10 shadow-lg ring-2 ring-primary/15",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={reorderLabel}
        disabled={!canDrag}
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground/50 outline-none transition-colors",
          "hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-30 disabled:hover:bg-transparent",
          canDrag && (isDragging ? "cursor-grabbing" : "cursor-grab"),
        )}
      >
        <GripVertical className="size-3.5" />
      </button>
      <span aria-hidden className="mt-[15px] size-1.5 shrink-0 rounded-full bg-primary/60" />
      <textarea
        ref={registerField}
        id={inputId}
        rows={1}
        value={item.text}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="field-sizing-content min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-base leading-relaxed outline-none placeholder:text-muted-foreground/70 md:text-sm"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground/60 opacity-0 transition-[opacity,color,background-color] group-hover/bullet:opacity-100 group-focus-within/bullet:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}
