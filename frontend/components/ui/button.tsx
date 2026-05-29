import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:   "bg-cyan-400 text-black hover:bg-cyan-300",
        outline:   "border border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400 hover:text-black",
        ghost:     "text-gray-400 hover:text-white hover:bg-white/5",
        secondary: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/30",
        danger:    "border border-red-500 text-red-400 bg-transparent hover:bg-red-500 hover:text-white",
      },
      size: {
        default: "h-8 px-4 py-2",
        sm:      "h-7 px-3",
        lg:      "h-10 px-6",
        icon:    "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
