import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer rounded-full",
  {
    variants: {
      variant: {
        default:
          "bg-gray-black text-white hover:bg-gray-1",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-gray-black bg-transparent hover:bg-gray-6",
        secondary:
          "bg-gray-5 text-foreground hover:bg-gray-4",
        ghost:
          "hover:bg-gray-6",
        link: "text-foreground underline underline-offset-4 hover:text-gray-1",
      },
      size: {
        default: "h-12 px-7",
        sm: "h-10 px-5 text-sm",
        lg: "h-14 px-10 text-base",
        icon: "size-12",
        "icon-sm": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
