import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "wdt:border-input wdt:data-[placeholder]:text-muted-foreground wdt:[&_svg:not([class*=text-])]:text-muted-foreground wdt:focus-visible:border-ring wdt:focus-visible:ring-ring/50 wdt:aria-invalid:ring-destructive/20 wdt:dark:aria-invalid:ring-destructive/40 wdt:aria-invalid:border-destructive wdt:dark:bg-input/30 wdt:dark:hover:bg-input/50 wdt:flex wdt:w-fit wdt:items-center wdt:justify-between wdt:gap-2 wdt:rounded-md wdt:border wdt:bg-transparent wdt:px-3 wdt:py-2 wdt:text-sm wdt:whitespace-nowrap wdt:shadow-xs wdt:transition-[color,box-shadow] wdt:outline-none wdt:focus-visible:ring-[3px] wdt:disabled:cursor-not-allowed wdt:disabled:opacity-50 wdt:data-[size=default]:h-9 wdt:data-[size=sm]:h-8 wdt:*:data-[slot=select-value]:line-clamp-1 wdt:*:data-[slot=select-value]:flex wdt:*:data-[slot=select-value]:items-center wdt:*:data-[slot=select-value]:gap-2 wdt:[&_svg]:pointer-events-none wdt:[&_svg]:shrink-0 wdt:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="wdt:size-4 wdt:opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "wdt:bg-popover wdt:text-popover-foreground wdt:data-[state=open]:animate-in wdt:data-[state=closed]:animate-out wdt:data-[state=closed]:fade-out-0 wdt:data-[state=open]:fade-in-0 wdt:data-[state=closed]:zoom-out-95 wdt:data-[state=open]:zoom-in-95 wdt:data-[side=bottom]:slide-in-from-top-2 wdt:data-[side=left]:slide-in-from-right-2 wdt:data-[side=right]:slide-in-from-left-2 wdt:data-[side=top]:slide-in-from-bottom-2 wdt:relative wdt:z-50 wdt:max-h-(--radix-select-content-available-height) wdt:min-w-[8rem] wdt:origin-(--radix-select-content-transform-origin) wdt:overflow-x-hidden wdt:overflow-y-auto wdt:rounded-md wdt:border wdt:shadow-md",
          position === "popper" &&
            "wdt:data-[side=bottom]:translate-y-1 wdt:data-[side=left]:-translate-x-1 wdt:data-[side=right]:translate-x-1 wdt:data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "wdt:p-1",
            position === "popper" &&
              "wdt:h-[var(--radix-select-trigger-height)] wdt:w-full wdt:min-w-[var(--radix-select-trigger-width)] wdt:scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("wdt:text-muted-foreground wdt:px-2 wdt:py-1.5 wdt:text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "wdt:focus:bg-accent wdt:focus:text-accent-foreground wdt:[&_svg:not([class*=text-])]:text-muted-foreground wdt:relative wdt:flex wdt:w-full wdt:cursor-default wdt:items-center wdt:gap-2 wdt:rounded-sm wdt:py-1.5 wdt:pr-8 wdt:pl-2 wdt:text-sm wdt:outline-hidden wdt:select-none wdt:data-[disabled]:pointer-events-none wdt:data-[disabled]:opacity-50 wdt:[&_svg]:pointer-events-none wdt:[&_svg]:shrink-0 wdt:[&_svg:not([class*=size-])]:size-4 wdt:*:[span]:last:flex wdt:*:[span]:last:items-center wdt:*:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="wdt:absolute wdt:right-2 wdt:flex wdt:size-3.5 wdt:items-center wdt:justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="wdt:size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("wdt:bg-border wdt:pointer-events-none wdt:-mx-1 wdt:my-1 wdt:h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "wdt:flex wdt:cursor-default wdt:items-center wdt:justify-center wdt:py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="wdt:size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "wdt:flex wdt:cursor-default wdt:items-center wdt:justify-center wdt:py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="wdt:size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
