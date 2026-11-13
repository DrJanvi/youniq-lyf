import { LoaderCircle } from "lucide-react";

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <LoaderCircle
      aria-hidden="true"
      className={`size-4 shrink-0 motion-safe:animate-spin ${className}`}
    />
  );
}
