import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "wdt:file:text-foreground wdt:placeholder:text-muted-foreground wdt:selection:bg-primary wdt:selection:text-primary-foreground wdt:dark:bg-input/30 wdt:border-input wdt:h-9 wdt:w-full wdt:min-w-0 wdt:rounded-md wdt:border wdt:bg-transparent wdt:px-3 wdt:py-1 wdt:text-base wdt:shadow-xs wdt:transition-[color,box-shadow] wdt:outline-none wdt:file:inline-flex wdt:file:h-7 wdt:file:border-0 wdt:file:bg-transparent wdt:file:text-sm wdt:file:font-medium wdt:disabled:pointer-events-none wdt:disabled:cursor-not-allowed wdt:disabled:opacity-50 wdt:md:text-sm",
        "wdt:focus-visible:border-ring wdt:focus-visible:ring-ring/50 wdt:focus-visible:ring-[3px]",
        "wdt:aria-invalid:ring-destructive/20 wdt:dark:aria-invalid:ring-destructive/40 wdt:aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
