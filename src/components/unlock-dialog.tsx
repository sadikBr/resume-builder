"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { KeyRound, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-provider";
import { normalizeData, useResumeStore } from "@/components/resume-store";
import { decryptPersonalResume } from "@/lib/personal-resume";

/**
 * Deliberately unlabelled entry point for loading the owner's resume. The code
 * is the decryption key for the bundled, encrypted copy; nothing secret is in here.
 */
export default function UnlockDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const { replaceData } = useResumeStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setCode("");
    setError(null);
    inputRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const data = await decryptPersonalResume(code.trim());
      replaceData(normalizeData(data));
      toast(t.unlock.success);
      onClose();
    } catch (err) {
      // A wrong code fails decryption; anything else is unexpected.
      setError(err instanceof DOMException && err.name === "OperationError" ? t.unlock.invalid : t.unlock.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px] animate-in fade-in-0"
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="unlock-title"
        onSubmit={submit}
        className="w-full max-w-xs rounded-xl border bg-background p-4 shadow-xl animate-in zoom-in-95"
      >
        <div className="mb-3 flex items-center gap-2">
          <KeyRound className="size-4 text-muted-foreground" />
          <h2 id="unlock-title" className="flex-1 text-sm font-semibold">
            {t.unlock.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.unlock.close}
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <Input
          ref={inputRef}
          type="password"
          autoComplete="off"
          placeholder={t.unlock.placeholder}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          aria-invalid={!!error}
        />
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        <Button type="submit" size="sm" className="mt-3 w-full" disabled={!code.trim() || busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {t.unlock.submit}
        </Button>
      </form>
    </div>
  );
}
