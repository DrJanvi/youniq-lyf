import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-lg border border-surface-border bg-white px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus-visible:border-brand-taupe focus-visible:ring-2 focus-visible:ring-brand-taupe/40 aria-invalid:border-badge-sale-text aria-invalid:ring-badge-sale-text/20 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
