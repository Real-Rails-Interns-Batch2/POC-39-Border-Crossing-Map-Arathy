import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-cyan-400 text-black",
        secondary:   "border-transparent bg-indigo-500 text-white",
        destructive: "border-transparent bg-red-500 text-white",
        outline:     "border-current text-current",
        live:        "border-cyan-400/30 bg-cyan-400/10 text-cyan-400",
        mock:        "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
        high:        "border-red-500/40 bg-red-500/10 text-red-400",
        medium:      "border-yellow-400/40 bg-yellow-400/10 text-yellow-400",
        low:         "border-green-400/40 bg-green-400/10 text-green-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
