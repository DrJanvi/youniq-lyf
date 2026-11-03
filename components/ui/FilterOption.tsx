import { CheckIcon } from "@heroicons/react/24/outline";
import type { ChangeEventHandler, ReactNode } from "react";

/** Styled checkbox/radio row with optional count; the single place to restyle filter options. */
export function FilterOption({
  type = "radio",
  name,
  value,
  defaultChecked,
  label,
  count,
  onChange,
}: {
  type?: "radio" | "checkbox";
  name: string;
  value: string;
  defaultChecked?: boolean;
  label: ReactNode;
  count?: number;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="text-text-muted flex cursor-pointer items-center gap-3">
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="peer-focus-visible:outline-brand-taupe peer-checked:border-brand-taupe peer-checked:bg-brand-taupe flex size-5 shrink-0 items-center justify-center rounded border border-[#d8d8d8] text-white peer-focus-visible:outline-2"
      >
        <CheckIcon className="size-4" />
      </span>
      <span className="flex-1 text-sm">{label}</span>
      {count !== undefined ? (
        <span className="text-sm text-[#aaa]">{count}</span>
      ) : null}
    </label>
  );
}

export function FilterOptionList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}
