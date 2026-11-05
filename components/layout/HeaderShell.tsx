"use client";

import {
  ArrowRightIcon,
  Bars3Icon,
  ChevronDownIcon,
  HeartIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Logo } from "../ui/Logo";
import { Section } from "../ui/Section";
import { HeaderCountBadge } from "./HeaderIconLink";
import { useScrolledPast } from "./useScrolledPast";
import { HeaderTransparentContext } from "./HeaderTransparentContext";

export type NavCategory = { id: string; name: string; slug: string };

const MORE_LINKS = [
  { href: "/products", label: "About Us" },
  { href: "/products", label: "Contact" },
  { href: "/blogs", label: "Blogs" },
];

// The pt-3 wrapper bridges the gap between trigger and panel so hover isn't lost.
const DROPDOWN =
  "invisible absolute top-full z-50 w-64 origin-top translate-y-2 pt-3 opacity-0 transition duration-200 ease-out motion-reduce:transition-none group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100";
const PANEL =
  "relative rounded-2xl border border-surface-border bg-white/95 p-2 text-text-primary shadow-xl backdrop-blur-md before:absolute before:-top-1.5 before:left-8 before:size-3 before:rotate-45 before:rounded-tl-sm before:border-l before:border-t before:border-surface-border before:bg-white";
const DROPDOWN_LABEL =
  "px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted";
const DROPDOWN_LINK =
  "group/item relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-text-primary transition-colors duration-150 hover:bg-brand-primary/10 hover:text-brand-primary-dark focus-visible:bg-brand-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 before:absolute before:left-0 before:top-1/2 before:h-0 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-brand-primary before:transition-all hover:before:h-5";
const DROPDOWN_ARROW =
  "size-4 -translate-x-1 opacity-0 transition duration-150 group-hover/item:translate-x-0 group-hover/item:opacity-100";
const TRIGGER_CHEVRON =
  "size-4 transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180";

const MOBILE_ROW =
  "flex items-center justify-between rounded-xl px-3 py-3.5 text-base text-text-primary transition-colors hover:bg-brand-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 [&::-webkit-details-marker]:hidden";
const MOBILE_SUBLINK =
  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-text-primary/80 transition-colors hover:bg-white hover:text-brand-primary-dark";

type HeaderShellProps = {
  categories: NavCategory[];
  auth: ReactNode;
  search: ReactNode;
  wishlistCount: number;
};

export function HeaderShell({
  categories,
  auth,
  search,
  wishlistCount,
}: HeaderShellProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [desktopDropdownDismissed, setDesktopDropdownDismissed] =
    useState(false);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const mobileLink = (href: string) =>
    clsx(
      MOBILE_ROW,
      pathname === href &&
        "bg-brand-primary/10 font-medium text-brand-primary-dark",
    );
  const dismissDesktopDropdown = (event: MouseEvent<HTMLAnchorElement>) => {
    setDesktopDropdownDismissed(true);
    event.currentTarget.blur();
  };
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // On the home page the header floats over the hero (zero layout height).
  const wrapper = isHome ? "relative z-40 h-0" : "relative z-40";
  const scrolled = useScrolledPast(100);
  const [hovered, setHovered] = useState(false);
  const transparent = isHome && !scrolled && !hovered;
  const header = clsx(
    "md:h-25 flex items-center transition-colors duration-300",
    isHome && "absolute inset-x-0 top-0",
    transparent
      ? "border-b border-b-transparent bg-origin-border bg-linear-to-b from-black/30 to-transparent text-white"
      : "border-b border-b-black/5 bg-white text-black",
  );
  const link = "flex items-center justify-center self-stretch text-sm";

  return (
    <div className={clsx(wrapper, "sticky top-0")}>
      <Section
        as="header"
        className={header}
        onPointerEnter={(e: React.PointerEvent) =>
          e.pointerType === "mouse" && setHovered(true)
        }
        onPointerLeave={() => setHovered(false)}
      >
        <HeaderTransparentContext.Provider value={transparent}>
          <div className="mx-auto flex w-full items-center gap-6 py-2">
            <div className="flex-1 lg:hidden">
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              >
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <nav
              aria-label="Main"
              className="hidden min-h-11 flex-1 items-center gap-6 text-sm lg:flex"
            >
              <div className="relative flex items-center justify-center">
                <Image
                  src="/assets/paint.svg"
                  alt="Paint icon"
                  width={21}
                  height={24}
                  aria-hidden="true"
                  className="absolute"
                />
                <Link href="/" className={clsx(link, "z-1")}>
                  Home
                </Link>
              </div>
              <div
                className={clsx("group relative", link)}
                onPointerLeave={() => setDesktopDropdownDismissed(false)}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  className={link}
                  onFocus={() => setDesktopDropdownDismissed(false)}
                >
                  <span className="flex items-center gap-1">
                    Shop by Category
                    <ChevronDownIcon
                      aria-hidden="true"
                      className={clsx(
                        TRIGGER_CHEVRON,
                        desktopDropdownDismissed && "!rotate-0",
                      )}
                    />
                  </span>
                </button>
                <div
                  className={clsx(DROPDOWN, "left-0")}
                  style={
                    desktopDropdownDismissed
                      ? { visibility: "hidden", opacity: 0 }
                      : undefined
                  }
                >
                  <div className={PANEL}>
                    <p className={DROPDOWN_LABEL}>Collections</p>
                    <ul className="max-h-80 overflow-y-auto">
                      {categories.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/category/${c.slug}`}
                            className={DROPDOWN_LINK}
                            onClick={dismissDesktopDropdown}
                          >
                            {c.name}
                            <ArrowRightIcon
                              aria-hidden="true"
                              className={DROPDOWN_ARROW}
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="border-surface-border mt-1 border-t pt-1">
                      <Link
                        href="/products"
                        className={clsx(
                          DROPDOWN_LINK,
                          "text-brand-primary-dark font-medium",
                        )}
                        onClick={dismissDesktopDropdown}
                      >
                        View all products
                        <ArrowRightIcon
                          aria-hidden="true"
                          className={DROPDOWN_ARROW}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/products" className={link}>
                Cosmetics
              </Link>
              <div className="relative flex items-center justify-center">
                <Image
                  src="/assets/shuriken.svg"
                  alt="Start icon"
                  width={18}
                  height={18}
                  aria-hidden="true"
                  className="absolute top-0 right-0 translate-x-4 -translate-y-1.5"
                />
                <Link href="/products" className={clsx(link, "z-1")}>
                  Fragrance
                </Link>
              </div>
            </nav>

            <div className="flex items-center justify-center">
              {/* Logo for desktop view */}
              <Logo height={80} className="hidden md:block" />
              {/* Logo for mobile view */}
              <Logo height={58} className="block md:hidden" />
            </div>

            <div className="flex flex-1 items-center justify-end gap-4">
              <div
                className={clsx("group relative hidden lg:flex", link)}
                onPointerLeave={() => setDesktopDropdownDismissed(false)}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  className={link}
                  onFocus={() => setDesktopDropdownDismissed(false)}
                >
                  <span className="flex items-center gap-1">
                    More
                    <ChevronDownIcon
                      aria-hidden="true"
                      className={clsx(
                        TRIGGER_CHEVRON,
                        desktopDropdownDismissed && "!rotate-0",
                      )}
                    />
                  </span>
                </button>
                <div
                  className={clsx(DROPDOWN, "right-0 w-56")}
                  style={
                    desktopDropdownDismissed
                      ? { visibility: "hidden", opacity: 0 }
                      : undefined
                  }
                >
                  <div
                    className={clsx(PANEL, "before:right-6 before:left-auto")}
                  >
                    <ul>
                      {MORE_LINKS.map((l) => (
                        <li key={l.label}>
                          <Link
                            href={l.href}
                            className={DROPDOWN_LINK}
                            onClick={dismissDesktopDropdown}
                          >
                            {l.label}
                            <ArrowRightIcon
                              aria-hidden="true"
                              className={DROPDOWN_ARROW}
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block [&_input]:text-black">
                {search}
              </div>
              {/* <Link
              href="/wishlist"
              className="hidden items-center gap-1.5 sm:flex"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <HeartIcon aria-hidden="true" className="size-5" />
            </Link>
            <Link href="/cart" className="flex items-center gap-1.5">
              <ShoppingCartIcon aria-hidden="true" className="size-5" />
              <span>Cart</span>
            </Link>
            <Link
              href="/profile"
              className="hidden items-center gap-1.5 sm:flex"
            >
              <UserIcon aria-hidden="true" className="size-5" />
              <span>Profile</span>
            </Link> */}
              <div className="flex items-center gap-4">{auth}</div>
            </div>
          </div>
        </HeaderTransparentContext.Provider>
      </Section>

      <div
        className={clsx(
          "fixed inset-0 z-50 lg:hidden",
          !open && "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={clsx(
            "bg-text-primary/40 absolute inset-0 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          aria-label="Menu"
          className={clsx(
            "text-text-primary absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col rounded-r-3xl bg-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="border-surface-border flex items-center justify-between border-b px-5 py-4">
            <Logo height={48} />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="bg-surface-card hover:bg-brand-primary/15 focus-visible:ring-brand-primary/50 flex size-10 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <XMarkIcon aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <div className="mb-5 md:hidden [&_input]:text-black">
              <HeaderTransparentContext.Provider value={false}>
                {search}
              </HeaderTransparentContext.Provider>
            </div>
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              <Link href="/" className={mobileLink("/")}>
                Home
              </Link>
              <details className="group open:bg-surface-card/60 rounded-xl">
                <summary
                  className={clsx(MOBILE_ROW, "cursor-pointer list-none")}
                >
                  Shop by Category
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="text-text-muted size-4 transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <ul className="flex flex-col gap-0.5 px-2 pb-3 pl-5">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/category/${c.slug}`}
                        className={MOBILE_SUBLINK}
                        onClick={() => setOpen(false)}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/products"
                      className={clsx(
                        MOBILE_SUBLINK,
                        "text-brand-primary-dark font-medium",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      View all products
                      <ArrowRightIcon aria-hidden="true" className="size-4" />
                    </Link>
                  </li>
                </ul>
              </details>
              <Link href="/products" className={mobileLink("/products")}>
                Cosmetics
              </Link>
              <Link href="/products" className={MOBILE_ROW}>
                Fragrance
              </Link>
              <details className="group open:bg-surface-card/60 rounded-xl">
                <summary
                  className={clsx(MOBILE_ROW, "cursor-pointer list-none")}
                >
                  More
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="text-text-muted size-4 transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <ul className="flex flex-col gap-0.5 px-2 pb-3 pl-5">
                  {MORE_LINKS.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className={MOBILE_SUBLINK}
                        onClick={() => setOpen(false)}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
              <div className="bg-surface-border my-2 h-px" />
              <Link
                href="/wishlist"
                className={mobileLink("/wishlist")}
                aria-label={
                  wishlistCount > 0
                    ? `Wishlist (${wishlistCount})`
                    : "Wishlist"
                }
              >
                <span className="flex items-center gap-3">
                  <span className="relative inline-flex">
                    <HeartIcon aria-hidden="true" className="size-5" />
                    <HeaderCountBadge count={wishlistCount} />
                  </span>
                  Wishlist
                </span>
              </Link>
              <Link href="/profile" className={mobileLink("/profile")}>
                <span className="flex items-center gap-3">
                  <UserIcon aria-hidden="true" className="size-5" />
                  Profile
                </span>
              </Link>
            </nav>
          </div>

          <div className="border-surface-border bg-surface-card flex flex-col items-stretch gap-3 rounded-br-3xl border-t px-5 py-4">
            {auth}
          </div>
        </aside>
      </div>
    </div>
  );
}
