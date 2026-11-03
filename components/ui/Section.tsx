import type { ComponentPropsWithoutRef, ElementType } from "react";

type SectionProps<T extends ElementType = "section"> = {
  as?: T;
  /** Classes for the full-width outer block (backgrounds, vertical padding). */
  className?: string;
  /** Classes for the inner max-width container. */
  contentClassName?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/**
 * Full-width block whose content is centered and capped at a large laptop
 * width (1440px).
 */
export function Section<T extends ElementType = "section">({
  as,
  className = "",
  contentClassName = "",
  children,
  ...rest
}: SectionProps<T>) {
  const Tag: ElementType = as ?? "section";
  return (
    <Tag className={`w-full ${className}`} {...rest}>
      <div
        className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${contentClassName}`}
      >
        {children}
      </div>
    </Tag>
  );
}
