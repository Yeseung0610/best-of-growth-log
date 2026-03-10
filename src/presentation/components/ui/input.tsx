import * as React from "react";
import { cn } from "@/shared/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-full border border-gray-4 bg-white px-5 text-sm transition-colors",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:border-gray-black",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-6",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
}

export { Input };
