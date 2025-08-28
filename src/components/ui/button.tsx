import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        tertiary: "bg-background hover:bg-blue-500/10 text-blue-500",
        green: "text-white bg-green-400 hover:bg-green-500 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        green_outline: "text-white bg-green-400 hover:bg-green-500 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        green_ghost: "text-green-600 disabled:text-green-700 bg-background hover:bg-green-500/10 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        purple_secondary: "text-purple-500 hover:text-purple-600 bg-background hover:bg-purple-100 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        purple_ghost: "text-purple-500 hover:text-white bg-background hover:bg-purple-500 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        purple: "text-white bg-purple-400 hover:bg-purple-600 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        purple_outline: "text-white bg-purple-400 hover:bg-purple-600 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 rounded-md gap-1.5 px-2 has-[>svg]:px-2 text-xs",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
