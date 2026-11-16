import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full resize-none rounded-lg px-3 py-2.5 text-base leading-relaxed outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "border border-transparent bg-muted/70 placeholder:text-muted-foreground/70 transition-[background-color,border-color,box-shadow] hover:bg-muted dark:bg-input/30",
        "focus-visible:border-primary/30 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
