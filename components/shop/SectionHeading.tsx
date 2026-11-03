import { PropsWithChildren } from "react";

export function SectionHeading({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h2
      className={`font-cormorant mb-9 text-center text-3xl font-medium uppercase md:text-[2.5rem] ${className ?? ""}`}
    >
      {children}
    </h2>
  );
}
