"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useScrolledPast } from "@/components/layout/useScrolledPast";
import { useHeaderTransparent } from "@/components/layout/HeaderTransparentContext";

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const scrolled = useScrolledPast(100);
  const headerTransparent = useHeaderTransparent();
  const isDark =
    headerTransparent === null ? !isHome || scrolled : !headerTransparent;
  const color = isDark ? "#000000" : "#FFFFFF";

  return (
    <form
      action="/products"
      method="get"
      role="search"
      className={clsx(
        "flex rounded-full border transition-colors duration-300",
        isDark ? "border-black/25" : "border-white/25",
      )}
    >
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search for products..."
        aria-label="Search for products..."
        className={clsx(
          "min-h-11 min-w-[20ch] flex-1 px-4 py-1 pr-2 text-sm outline-none placeholder:text-sm",
          isDark
            ? "border-black text-black! caret-black [--autofill-text-color:#000000] placeholder:text-black"
            : "border-white text-white! caret-white [--autofill-text-color:#ffffff] placeholder:text-white",
        )}
      />
      <button type="submit" aria-label="Search" className="px-2 pr-4">
        <MagnifyingGlassIcon color={color} className="size-5" />
      </button>
    </form>
  );
}
