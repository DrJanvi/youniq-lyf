import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div role="status">
      <p>{title}</p>
      {children}
    </div>
  );
}
