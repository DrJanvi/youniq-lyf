"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function ProductPurchaseActions({
  productId,
  variantId,
  stock,
}: {
  productId: string;
  variantId?: string;
  stock: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [quantity, setQuantity] = useState(1);
  const [busyAction, setBusyAction] = useState<"cart" | "checkout" | null>(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = busyAction !== null;

  async function purchase(goToCheckout: boolean) {
    setBusyAction(goToCheckout ? "checkout" : "cart");
    setError(null);
    setAdded(false);
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
          (item) =>
            item.product.id === productId &&
            item.variantId === (variantId ?? null),
        )?.quantity ?? 0;
      await apiFetch("/api/cart", {
        method: "POST",
        json: {
          productId,
          ...(variantId ? { variantId } : {}),
          quantity: current + quantity,
        },
      });

      if (goToCheckout) {
        router.push("/cart?checkout=1#checkout");
        return;
      }

      setAdded(true);
      router.refresh();
    } catch (purchaseError) {
      if (purchaseError instanceof ClientApiError && purchaseError.status === 401) {
        const next = goToCheckout ? "/cart?checkout=1#checkout" : pathname;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      setError(
        purchaseError instanceof Error
          ? purchaseError.message
          : "Unable to add this product to your cart.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          role="group"
          aria-label={`Quantity: ${quantity}`}
          className="inline-flex h-12 items-center rounded-full border border-surface-border"
        >
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1 || busy}
            aria-label="Decrease quantity"
            className="flex size-12 items-center justify-center rounded-full text-text-muted transition hover:text-text-primary disabled:opacity-40"
          >
            <Minus aria-hidden="true" className="size-4" />
          </button>
          <span aria-live="polite" className="min-w-8 text-center font-medium">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
            disabled={quantity >= stock || busy}
            aria-label="Increase quantity"
            className="flex size-12 items-center justify-center rounded-full text-text-muted transition hover:text-text-primary disabled:opacity-40"
          >
            <Plus aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void purchase(false)}
        disabled={busy || stock < 1}
        aria-busy={busyAction === "cart"}
        className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-surface-border bg-white px-6 text-sm font-semibold tracking-[0.08em] text-text-primary uppercase transition hover:bg-surface-card disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busyAction === "cart" ? <LoadingSpinner /> : null}
        {busyAction === "cart"
          ? "Adding..."
          : added
            ? "Added to cart"
            : "Add to cart"}
      </button>
      <button
        type="button"
        onClick={() => void purchase(true)}
        disabled={busy || stock < 1}
        aria-busy={busyAction === "checkout"}
        className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-6 text-sm font-semibold tracking-[0.08em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busyAction === "checkout" ? (
          <>
            <LoadingSpinner />
            Preparing checkout…
          </>
        ) : (
          <>
            Buy it now
            <ArrowRight aria-hidden="true" className="size-5" />
          </>
        )}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
