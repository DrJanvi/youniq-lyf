"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useId, useState, type ReactNode } from "react";

/** Collapsible section. Content stays mounted so form fields inside are always submitted. */
export function Accordion({
  title,
  children,
  defaultOpen = false,
  titleClassName,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  titleClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="border-b border-[#ece5e2]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex w-full cursor-pointer items-center justify-between py-5 text-base font-medium",
          titleClassName,
        )}
      >
        {title}
        <ChevronDownIcon
          aria-hidden="true"
          className={clsx(
            "size-4 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        id={id}
        inert={!open}
        className={clsx(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
