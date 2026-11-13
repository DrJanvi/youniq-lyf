"use client";

import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PriceTag, formatMoney } from "@/components/ui/PriceTag";
import { apiFetch } from "@/lib/client-api";
import { MinusIcon } from "@heroicons/react/24/outline";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { StorefrontLink as Link } from "@/components/layout/StorefrontLink";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  productId: string;
  variantId: string | null;
  variantName: string | null;
  variantColor: string | null;
  slug: string;
  title: string;
  image?: string;
  category: string;
  price: number;
  finalPrice: number;
  currency: string;
  quantity: number;
  stock: number;
  lineTotal: number;
};

export function CartItemRow(p: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function change(next: number) {
    setBusy(true);
    setError(null);
    try {
      if (next < 1)
        await apiFetch(
          `/api/cart?productId=${encodeURIComponent(p.productId)}${p.variantId ? `&variantId=${encodeURIComponent(p.variantId)}` : ""}`,
          {
          method: "DELETE",
          },
        );
      else
        await apiFetch("/api/cart", {
          method: "POST",
          json: {
            productId: p.productId,
            ...(p.variantId ? { variantId: p.variantId } : {}),
            quantity: next,
          },
        });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li
      aria-busy={busy}
      className="relative grid gap-4 border-b border-surface-border py-5 sm:min-h-43.5 sm:grid-cols-[minmax(0,1fr)_116px_128px] sm:items-center sm:gap-8 sm:pt-8 sm:pb-5"
    >
      <div className="flex min-w-0 items-center gap-4">
        <Link
          href={`/products/${p.slug}`}
          aria-label={p.title}
          className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-[3px] border border-surface-border bg-surface-card sm:size-30"
        >
          {p.image ? (
            <Image
              src={p.image}
              alt=""
              width={120}
              height={120}
              unoptimized
              className="size-full object-contain p-2"
            />
          ) : (
            <span className="text-text-muted text-xs">No image</span>
          )}
        </Link>
        <div className="min-w-0">
          <Link
            href={`/products/${p.slug}`}
            className="font-cormorant line-clamp-2 block text-[1.125rem] leading-[1.1] font-semibold tracking-[0.02em] text-text-primary hover:underline"
          >
            {p.title}
          </Link>
          <p className="mt-1 text-[12px] text-text-muted">{p.category}</p>
          {p.variantName ? (
            <p className="mt-1 flex items-center gap-2 text-xs text-text-muted">
              <span
                aria-hidden="true"
                className="size-3 rounded-full border border-surface-border"
                style={{ backgroundColor: p.variantColor ?? undefined }}
              />
              Color: {p.variantName}
            </p>
          ) : null}
          <p className="mt-2 text-[11px] font-medium text-status-success">
            {p.stock > 0 ? "In stock" : "Out of stock"}
          </p>
          <div className="mt-2 sm:hidden">
            <PriceTag
              price={p.price}
              finalPrice={p.finalPrice}
              currency={p.currency}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pl-24 sm:pl-0">
        <span className="text-text-muted text-xs sm:hidden">Quantity</span>
        <span className="flex h-11 w-29 items-center justify-between rounded-full border border-surface-border bg-white px-1.5">
          <Button
            aria-label={`Decrease quantity of ${p.title}`}
            disabled={busy}
            onClick={() => change(p.quantity - 1)}
            className="flex size-7 items-center justify-center rounded-full border-0 bg-transparent p-0! text-text-muted hover:bg-brand-primary/10"
          >
            <MinusIcon className="size-4" />
          </Button>
          <span
            aria-live="polite"
            className="min-w-5 text-center text-[12px] font-medium text-text-primary"
          >
            {p.quantity}
          </span>
          <Button
            aria-label={`Increase quantity of ${p.title}`}
            disabled={busy || p.quantity >= p.stock}
            onClick={() => change(p.quantity + 1)}
            className="flex size-7 items-center justify-center rounded-full border-0 bg-transparent p-0! text-lg leading-none font-light text-text-muted hover:bg-brand-primary/10"
          >
            <PlusIcon className="size-4" />
          </Button>
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 pl-24 sm:justify-end sm:pl-0">
        <span className="text-text-muted text-xs sm:hidden">Total</span>
        <div className="flex items-center gap-3">
          <span className="text-right">
            <strong className="block text-[15px] font-semibold text-text-primary">
              {formatMoney(p.lineTotal, p.currency)}
            </strong>
            {p.finalPrice < p.price ? (
              <del className="mt-1 hidden text-[13px] text-text-muted sm:block">
                {formatMoney(p.price * p.quantity, p.currency)}
              </del>
            ) : null}
          </span>
          <Button
            aria-label={`Remove ${p.title} from cart`}
            disabled={busy}
            onClick={() => change(0)}
            className="flex size-7 items-center justify-center rounded-full border-0 bg-transparent p-0! text-[22px] leading-none text-text-muted hover:bg-brand-primary/10 hover:text-text-primary"
          >
            <XMarkIcon className="size-4" />
          </Button>
        </div>
      </div>

      {error ? (
        <span role="alert" className="text-sm text-red-700 sm:col-span-3">
          {error}
        </span>
      ) : null}
      {busy ? (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white/80 text-sm font-medium text-text-primary backdrop-blur-[1px]"
        >
          <LoadingSpinner className="size-5" />
          Updating cart…
        </div>
      ) : null}
    </li>
  );
}
