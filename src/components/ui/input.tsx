import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-lg px-3 py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        // Soft "filled" field: tinted at rest, white with an accent ring when focused.
        "border border-transparent bg-muted/70 placeholder:text-muted-foreground/70 transition-[background-color,border-color,box-shadow] hover:bg-muted dark:bg-input/30",
        "focus-visible:border-primary/30 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
