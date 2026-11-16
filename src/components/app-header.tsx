"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, Check, FileText, Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { useResumeStore } from "@/components/resume-store"
import { cn } from "@/lib/utils"
import UnlockDialog from "@/components/unlock-dialog"

const SECRET_CLICKS = 5
const SECRET_CLICK_WINDOW_MS = 2000

export default function AppHeader() {
  const { t } = useLanguage()
  const { ready, saveStatus, reset } = useResumeStore()
  // Reset is destructive: the first click arms it, a second click within 3s confirms.
  const [armed, setArmed] = useState(false)

  // Hidden entry to the unlock dialog: 5 quick clicks on the logo, or Alt+Shift+U.
  const [unlockOpen, setUnlockOpen] = useState(false)
  const closeUnlock = useCallback(() => setUnlockOpen(false), [])
  const logoClicks = useRef<number[]>([])
  const handleLogoClick = () => {
    const now = Date.now()
    logoClicks.current = [...logoClicks.current, now].filter((time) => now - time < SECRET_CLICK_WINDOW_MS)
    if (logoClicks.current.length >= SECRET_CLICKS) {
      logoClicks.current = []
      setUnlockOpen(true)
    }
  }
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // e.code, not e.key: Alt+Shift+U types a special character on some layouts.
      if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === "KeyU") {
        e.preventDefault()
        setUnlockOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(timer)
  }, [armed])

  const handleReset = () => {
    if (!armed) return setArmed(true)
    setArmed(false)
    reset()
    toast(t.app.resetDone)
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-4 sm:px-6">
        <div
          onClick={handleLogoClick}
          className="flex size-9 shrink-0 select-none items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <FileText className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold leading-tight">{t.app.title}</h1>
          <p className="truncate text-sm text-muted-foreground">{t.app.subtitle}</p>
        </div>

        {ready && (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "hidden items-center gap-1.5 text-xs md:inline-flex",
                saveStatus === "error" ? "text-destructive" : "text-muted-foreground",
              )}
              role="status"
            >
              {saveStatus === "pending" && <Loader2 className="size-3.5 animate-spin" />}
              {saveStatus === "saved" && <Check className="size-3.5 text-emerald-600" />}
              {saveStatus === "error" && <AlertCircle className="size-3.5" />}
              {saveStatus === "pending" ? t.app.saving : saveStatus === "saved" ? t.app.saved : t.app.saveFailed}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              title={t.app.resetHint}
              className={cn(
                "text-muted-foreground",
                armed && "bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive",
              )}
            >
              <RotateCcw className="size-3.5" />
              {armed ? t.app.resetConfirm : t.app.reset}
            </Button>
          </div>
        )}
      </div>
      <UnlockDialog open={unlockOpen} onClose={closeUnlock} />
    </header>
  )
}
