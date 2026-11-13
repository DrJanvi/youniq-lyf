"use client";

import { apiFetch } from "@/lib/client-api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { StorefrontLink as Link } from "@/components/layout/StorefrontLink";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CartClearButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function clearCart() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/cart?clear=true", { method: "DELETE" });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not clear cart");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={clearCart}
        className="text-[12px] text-text-muted underline decoration-surface-border underline-offset-4 transition-colors hover:text-text-primary disabled:opacity-50"
      >
        {busy ? (
          <span className="inline-flex items-center gap-1">
            <LoadingSpinner />
            Clearing…
          </span>
        ) : (
          "Clear all"
        )}
      </button>
      {error ? (
        <p role="alert" className="mt-1 text-right text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CartFooterActions({ productIds }: { productIds: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function moveToWishlist() {
    setBusy(true);
    setError(null);
    try {
      await Promise.all(
        productIds.map((productId) =>
          apiFetch("/api/wishlist", {
            method: "POST",
            json: { productId },
          }),
        ),
      );
      await apiFetch("/api/cart?clear=true", { method: "DELETE" });
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not move items to wishlist",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[11px] font-medium tracking-[0.08em] text-brand-primary-dark uppercase">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 hover:text-text-primary"
        >
          <ArrowLeftIcon className="size-3" />
          Continue shopping
        </Link>
        <button
          type="button"
          disabled={busy}
          aria-busy={busy}
          onClick={moveToWishlist}
          className="inline-flex h-10.25 w-54.75 items-center justify-center gap-2 rounded-full border border-surface-border bg-transparent px-5 text-[14px] tracking-normal transition-colors hover:bg-surface-card disabled:opacity-50"
        >
          {busy ? (
            <>
              <LoadingSpinner />
              Moving…
            </>
          ) : (
            <>
              Move all to wishlist
              <ArrowRightIcon className="size-3" />
            </>
          )}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </>
  );
}
