"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="Checkbox"
      className={cn(
        "border-input dark:bg-input/30 data-checked:bg-foreground data-checked:border-primary",
        "data-checked:dark:bg-primary data-checked:dark:border-primary",
        "peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background",
        "aria-invalid:border-destructive dark:aria-invalid:border-destructive/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex",
        "size-4 items-center justify-center",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "group-has-disabled/field:opacity-50 focus-visible:ring-3 aria-invalid:ring-3",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <CheckIcon className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }