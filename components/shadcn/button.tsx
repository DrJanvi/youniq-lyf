import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, type = "button", ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand-primary-dark px-4 text-sm font-medium text-white transition-colors outline-none hover:bg-brand-primary-hover focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-brand-primary/60",
        className,
      )}
      {...props}
    />
  );
}
