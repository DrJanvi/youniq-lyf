"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function ProductAboutAccordion({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ul className="border-t border-[#e4dad5]">
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `about-panel-${index}`;
        return (
          <li key={`${item.title}-${index}`} className="border-b border-[#e4dad5]">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left md:py-6"
            >
              <span className="font-cormorant text-lg font-semibold tracking-[0.05em] text-[#573124] uppercase md:text-2xl">
                <span className="mr-3 text-[#b48d7d]">{index + 1}.</span>
                {item.title}
              </span>
              <ChevronDown
                aria-hidden
                className={`h-5 w-5 shrink-0 text-[#573124] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>
            <div
              id={panelId}
              role="region"
              hidden={!open}
              className="pb-6 pl-8 pr-8 text-sm leading-7 whitespace-pre-line text-[#766d69] md:pl-10"
            >
              {item.description}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
