"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function ProductPurchaseActions({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function purchase(goToCheckout: boolean) {
    setBusy(true);
    setError(null);
    setAdded(false);
    try {
      const cart = await apiFetch<{
        items: { product: { id: string }; quantity: number }[];
      }>("/api/cart");
      const current =
        cart.items.find((item) => item.product.id === productId)?.quantity ?? 0;
      await apiFetch("/api/cart", {
        method: "POST",
        json: { productId, quantity: current + quantity },
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
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          role="group"
          aria-label={`Quantity: ${quantity}`}
          className="inline-flex h-12 items-center rounded-full border border-[#eee7e3]"
        >
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1 || busy}
            aria-label="Decrease quantity"
            className="flex size-12 items-center justify-center rounded-full text-[#766d69] transition hover:text-[#573124] disabled:opacity-40"
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
            className="flex size-12 items-center justify-center rounded-full text-[#766d69] transition hover:text-[#573124] disabled:opacity-40"
          >
            <Plus aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void purchase(false)}
        disabled={busy || stock < 1}
        className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#e5dfdc] bg-white px-6 text-sm font-semibold tracking-[0.08em] text-[#292320] uppercase transition hover:bg-[#faf7f5] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Adding..." : added ? "Added to cart" : "Add to cart"}
      </button>
      <button
        type="button"
        onClick={() => void purchase(true)}
        disabled={busy || stock < 1}
        className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#b48d7d] px-6 text-sm font-semibold tracking-[0.08em] text-white uppercase transition hover:bg-[#a77f70] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buy it now
        <ArrowRight aria-hidden="true" className="size-5" />
      </button>
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
