import { cn } from "@/lib/utils";
import * as React from "react";

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "border-surface-border text-text-primary placeholder:text-text-muted focus-visible:border-brand-taupe focus-visible:ring-brand-taupe/40 aria-invalid:border-badge-sale-text aria-invalid:ring-badge-sale-text/20 h-12 w-full rounded-lg border bg-white px-4 text-sm transition-colors outline-none focus-visible:ring-2 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
