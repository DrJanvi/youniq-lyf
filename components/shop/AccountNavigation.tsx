"use client";

import { useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type AccountSection =
  | "orders"
  | "details"
  | "addresses"
  | "password"
  | "delete";

const navigation: { key: AccountSection; label: string; href: string }[] = [
  { key: "orders", label: "My Orders", href: "/orders" },
  { key: "details", label: "Account Details", href: "/account" },
  { key: "addresses", label: "Manage Address", href: "/account/addresses" },
  { key: "password", label: "Change Password", href: "/account/change-password" },
  { key: "delete", label: "Delete My Account", href: "/account/delete-account" },
];

export function AccountNavigation({ active }: { active: AccountSection }) {
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;

    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    activeLinkRef.current?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior,
    });
  }, [active]);

  return (
    <nav
      aria-label="Account navigation"
      className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {navigation.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            ref={isActive ? activeLinkRef : undefined}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center justify-between gap-5 rounded-full px-4 py-2.5 text-sm transition-colors ${
              isActive
                ? "bg-surface-card text-text-primary"
                : "text-text-muted hover:bg-surface-card hover:text-text-primary"
            }`}
          >
            {item.label}
            <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}
