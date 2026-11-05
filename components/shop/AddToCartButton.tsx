"use client";

import { Button } from "@/components/ui/Button";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { ArrowRight, Check, ShoppingCart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function AddToCartButton({
  productId,
  productHref,
  requiresVariant,
  disabled,
  className = "",
  overlay = false,
  iconOnly = false,
}: {
  productId: string;
  productHref: string;
  requiresVariant: boolean;
  disabled?: boolean;
  className?: string;
  overlay?: boolean;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "busy" | "added">("idle");
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (requiresVariant) {
      router.push(productHref);
      return;
    }
    setState("busy");
    setError(null);
    try {
      const cart = await apiFetch<{
        items: {
          product: { id: string };
          variantId: string | null;
          quantity: number;
        }[];
      }>("/api/cart");
      const current =
        cart.items.find(
          (item) => item.product.id === productId && item.variantId === null,
        )?.quantity ?? 0;
      await apiFetch("/api/cart", {
        method: "POST",
        json: { productId, quantity: current + 1 },
      });
      setState("added");
      router.refresh();
    } catch (e) {
      setState("idle");
      if (e instanceof ClientApiError && e.status === 401) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  if (iconOnly) {
    const label = disabled
      ? "Out of stock"
      : requiresVariant
        ? "Choose a color"
      : state === "added"
        ? "Added to cart"
        : "Add to cart";

    return (
      <span className="inline-flex">
        <button
          type="button"
          onClick={add}
          disabled={disabled || state === "busy"}
          aria-label={label}
          aria-busy={state === "busy"}
          title={error ?? label}
          className={`flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-primary bg-brand-primary-dark p-0 text-white shadow-sm transition-colors hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:bg-neutral-400 ${className}`}
        >
          {state === "added" ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <ShoppingCart aria-hidden="true" className="size-4" />
          )}
        </button>
        {error ? (
          <span className="sr-only" role="alert">
            {error}
          </span>
        ) : null}
      </span>
    );
  }

  if (overlay) {
    return (
      <button
        type="button"
        onClick={add}
        disabled={disabled || state === "busy"}
        title={error ?? undefined}
        className={`bg-brand-primary-dark text-white flex cursor-pointer items-center gap-2 rounded-full border border-white px-4 py-2.5 text-xs font-bold tracking-wide whitespace-nowrap uppercase opacity-0 shadow-lg transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:bg-neutral-400 ${className}`}
      >
        {disabled
          ? "Out of stock"
          : requiresVariant
            ? "Choose color"
          : state === "added"
            ? "Added ✓"
            : "Add to cart"}
        {!disabled && !requiresVariant && state !== "added" ? (
          <ArrowRight className="size-4" />
        ) : null}
      </button>
    );
  }

  return (
    <span>
      <Button
        onClick={add}
        disabled={disabled || state === "busy"}
        className={className}
      >
        {disabled
          ? "Out of stock"
          : requiresVariant
            ? "Choose color"
          : state === "added"
            ? "Added ✓"
            : "Add to cart"}
      </Button>
      {error ? <span role="alert"> {error}</span> : null}
    </span>
  );
}
