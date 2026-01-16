import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "wdt:relative wdt:flex wdt:w-full wdt:touch-none wdt:items-center wdt:select-none wdt:data-[disabled]:opacity-50 wdt:data-[orientation=vertical]:h-full wdt:data-[orientation=vertical]:min-h-44 wdt:data-[orientation=vertical]:w-auto wdt:data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "wdt:bg-muted wdt:relative wdt:grow wdt:overflow-hidden wdt:rounded-full wdt:data-[orientation=horizontal]:h-1.5 wdt:data-[orientation=horizontal]:w-full wdt:data-[orientation=vertical]:h-full wdt:data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "wdt:bg-primary wdt:absolute wdt:data-[orientation=horizontal]:h-full wdt:data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="wdt:border-primary wdt:ring-ring/50 wdt:block wdt:size-4 wdt:shrink-0 wdt:rounded-full wdt:border wdt:bg-white wdt:shadow-sm wdt:transition-[color,box-shadow] wdt:hover:ring-4 wdt:focus-visible:ring-4 wdt:focus-visible:outline-hidden wdt:disabled:pointer-events-none wdt:disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
