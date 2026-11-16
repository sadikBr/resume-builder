"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

interface ExportMenuProps {
  pageCount: number;
  /** Exports the given zero-based page indices, in order. */
  onExport: (pages: number[]) => Promise<void>;
}

/**
 * Single-page resumes export straight away; longer ones open a small panel to
 * pick which pages go into the PDF.
 */
export default function ExportMenu({ pageCount, onExport }: ExportMenuProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);

  const allPages = Array.from({ length: pageCount }, (_, i) => i);
  // Pages can disappear while the panel is open (content got shorter).
  const chosen = allPages.filter((i) => selected.has(i));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const run = async (pages: number[]) => {
    setBusy(true);
    try {
      await onExport(pages);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const handleButton = () => {
    if (pageCount <= 1) return run([0]);
    if (!open) setSelected(new Set(allPages));
    setOpen(!open);
  };

  const toggle = (page: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });

  return (
    <div ref={rootRef} className="relative">
      <Button size="sm" onClick={handleButton} disabled={busy && !open} aria-expanded={pageCount > 1 ? open : undefined}>
        {busy && !open ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        {t.preview.export}
        {pageCount > 1 && (
          <ChevronDown className={cn("size-3.5 opacity-70 transition-transform", open && "rotate-180")} />
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label={t.preview.pagesToExport}
          className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
            <span className="text-sm font-semibold">{t.preview.pagesToExport}</span>
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setSelected(new Set(allPages))}
                className="rounded px-1.5 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {t.preview.all}
              </button>
              <span className="text-muted-foreground/50">·</span>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="rounded px-1.5 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {t.preview.none}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {allPages.map((page) => {
              const on = selected.has(page);
              return (
                <button
                  key={page}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(page)}
                  className={cn(
                    "group/page flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs outline-none transition-[border-color,background-color,box-shadow] focus-visible:ring-4 focus-visible:ring-primary/10",
                    on
                      ? "border-primary/40 bg-primary/[0.04] text-foreground"
                      : "text-muted-foreground hover:border-foreground/20 hover:bg-muted/50",
                  )}
                >
                  {/* Little A4 sheet */}
                  <span
                    className={cn(
                      "relative flex aspect-[210/297] w-9 flex-col gap-[3px] rounded-[3px] border bg-white p-1.5 shadow-xs transition-opacity",
                      !on && "opacity-50",
                    )}
                  >
                    {[100, 70, 85, 60, 90].map((w, i) => (
                      <span key={i} className="h-[2px] rounded-full bg-slate-300" style={{ width: `${w}%` }} />
                    ))}
                    {on && (
                      <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-popover">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  {t.preview.page(page + 1)}
                </button>
              );
            })}
          </div>

          <Button className="mt-3 w-full" size="sm" disabled={chosen.length === 0 || busy} onClick={() => run(chosen)}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" /> {t.preview.exporting}
              </>
            ) : (
              <>
                <Download className="size-4" /> {t.preview.exportCount(chosen.length)}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
