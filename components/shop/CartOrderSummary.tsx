"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { formatMoney } from "@/components/ui/PriceTag";
import { apiFetch } from "@/lib/client-api";
import type { CartDTO } from "@/services/cart";

type CouponQuote = { code: string; discountAmount: number; total: number };

export function CartOrderSummary({ cart }: { cart: CartDTO }) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponQuote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const currency = cart.items[0]?.product.currency ?? "INR";

  async function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!couponCode.trim()) {
      setError("Enter a coupon code.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const quote = await apiFetch<CouponQuote>("/api/coupons/validate", {
        method: "POST",
        json: { code: couponCode },
      });
      setCouponCode(quote.code);
      setAppliedCoupon(quote);
      setMessage("Coupon applied successfully.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not apply this coupon.");
    } finally {
      setBusy(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setError(null);
    setMessage(null);
  }

  const checkoutHref = appliedCoupon
    ? `/checkout?coupon=${encodeURIComponent(appliedCoupon.code)}`
    : "/checkout";

  return (
    <aside className="mt-8 flex flex-col gap-4.5 lg:mt-0">
      <div className="rounded-[15px] border border-surface-border bg-surface-main px-8.5 pt-9 pb-10">
        <h2 className="font-cormorant text-[1.8rem] leading-tight font-semibold tracking-[0.08em] text-text-primary uppercase">
          Order summary
        </h2>

        <dl className="mt-9 space-y-4 text-[14px] text-text-primary">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-muted">Subtotal</dt>
            <dd className="font-medium text-text-primary">{formatMoney(cart.subtotal, currency)}</dd>
          </div>
          {cart.discountTotal > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-text-muted">Automatic discounts</dt>
              <dd className="font-medium text-text-primary">−{formatMoney(cart.discountTotal, currency)}</dd>
            </div>
          ) : null}
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-text-muted">Coupon ({appliedCoupon.code})</dt>
              <dd className="font-medium text-text-primary">−{formatMoney(appliedCoupon.discountAmount, currency)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-muted">Shipping</dt>
            <dd className="font-medium text-status-success">Free</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-surface-border pt-7">
          <div>
            <span className="block text-[14px] font-medium tracking-[0.12em] text-text-primary uppercase">Total</span>
            <span className="mt-2 block text-[10px] text-brand-primary-dark">TAX included</span>
          </div>
          <div className="text-[2rem] leading-none font-semibold text-text-primary">
            {formatMoney(appliedCoupon?.total ?? cart.total, currency)}
          </div>
        </div>

        <Link
          href={checkoutHref}
          className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white mx-auto mt-8 flex h-13.25 w-full max-w-67 items-center justify-center gap-2 rounded-full px-5 text-center text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors"
        >
          Checkout now
          <ArrowRightIcon className="size-4" />
        </Link>

        <p className="mt-6 text-center text-[12px] text-text-muted">
          Secure payments. Easy returns within 14 days.
        </p>
      </div>

      <form onSubmit={applyCoupon} className="rounded-[16px] border border-surface-border bg-white p-5">
        <label
          htmlFor="cart-discount-code"
          className="block text-[11px] font-semibold tracking-[0.12em] text-text-primary uppercase"
        >
          Discount code
        </label>
        {appliedCoupon ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-status-success-soft px-3 py-2 text-sm text-status-success">
            <span className="truncate font-mono font-medium">{appliedCoupon.code} applied</span>
            <button type="button" disabled={busy} onClick={removeCoupon} className="shrink-0 underline underline-offset-2 disabled:opacity-50">
              Remove
            </button>
          </div>
        ) : (
          <div className="mt-3 flex">
            <input
              id="cart-discount-code"
              name="discountCode"
              type="text"
              autoCapitalize="characters"
              autoCorrect="off"
              maxLength={64}
              value={couponCode}
              disabled={busy}
              onChange={(event) => {
                setCouponCode(event.currentTarget.value);
                setError(null);
                setMessage(null);
              }}
              placeholder="Enter code"
              className="h-11 min-w-0 flex-1 rounded-l-[7px] border border-r-0 border-surface-border bg-transparent px-3 text-[13px] text-text-primary outline-none placeholder:text-text-muted focus:border-brand-primary"
            />
            <button
              type="submit"
              disabled={busy || !couponCode.trim()}
              className="h-11 rounded-r-[7px] border border-surface-border bg-white px-5 text-[10px] font-semibold tracking-[0.08em] text-brand-primary-dark uppercase transition-colors hover:bg-surface-card disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Applying…" : "Apply"}
            </button>
          </div>
        )}
        {error ? <p role="alert" className="mt-2 text-xs text-red-700">{error}</p> : null}
        {message ? <p role="status" className="mt-2 text-xs text-status-success">{message}</p> : null}
      </form>
    </aside>
  );
}
