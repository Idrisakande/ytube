import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      //aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive 
      className={cn(
        `border-input placeholder:text-muted-foreground focus-visible:ring
        dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent
        text-xs md:text-sm px-3 py-2 shadow-xs transition-[color,box-shadow] outline-none
        disabled:cursor-not-allowed disabled:opacity-50`,
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
