"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function WishlistToolbar({
  query,
  sort,
}: {
  query: string;
  sort: string;
}) {
  return (
    <form
      action="/wishlist"
      method="get"
      role="search"
      className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 sm:flex sm:w-auto sm:justify-end sm:gap-x-4 sm:gap-y-3"
    >
      <label className="flex min-w-0 items-center gap-2 text-[11px] text-text-muted sm:gap-3">
        <span>Sort by</span>
        <select
          name="sort"
          defaultValue={sort}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-9 min-w-0 cursor-pointer bg-transparent pr-1 text-[11px] font-medium text-text-primary outline-none sm:text-[12px]"
        >
          <option value="newest">Recently added</option>
          <option value="oldest">Oldest added</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>
      <label className="col-span-2 flex h-9 min-w-0 w-full items-center gap-2 rounded-full border border-surface-border bg-white px-3 text-text-muted sm:col-span-1 sm:w-[212px]">
        <span className="sr-only">Search your wishlist</span>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search your wishlist"
          className="min-w-0 flex-1 bg-transparent text-[11px] text-text-primary outline-none placeholder:text-text-muted"
        />
        <button
          type="submit"
          aria-label="Search wishlist"
          className="inline-flex size-6 shrink-0 items-center justify-center"
        >
          <Search aria-hidden="true" className="size-3.5" />
        </button>
      </label>
    </form>
  );
}

function useWishlistActionError() {
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);

  function handleError(cause: unknown) {
    if (cause instanceof ClientApiError && cause.status === 401) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setError(cause instanceof Error ? cause.message : "Something went wrong.");
  }

  return { error, setError, handleError, router };
}

export function WishlistRemoveButton({
  productId,
  title,
}: {
  productId: string;
  title: string;
}) {
  const [busy, setBusy] = useState(false);
  const { error, setError, handleError, router } = useWishlistActionError();

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex flex-col items-center">
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        aria-label={`Remove ${title} from wishlist`}
        className="inline-flex size-7 items-center justify-center text-text-muted transition-colors hover:text-text-primary disabled:opacity-50"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
      {error ? (
        <span role="alert" className="sr-only">
          {error}
        </span>
      ) : null}
    </span>
  );
}

export function WishlistAddToCartButton({
  productId,
  title,
  stock,
}: {
  productId: string;
  title: string;
  stock: number;
}) {
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const { error, setError, handleError, router } = useWishlistActionError();

  async function addToCart() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(
        `/api/wishlist/move-to-cart?productId=${encodeURIComponent(productId)}`,
        { method: "POST" },
      );
      setAdded(true);
      router.refresh();
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={addToCart}
        disabled={stock < 1 || busy}
        title={error ?? undefined}
        className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white inline-flex h-[38px] min-w-[126px] items-center justify-center gap-2 rounded-full px-4 text-[10px] font-medium tracking-[0.03em] uppercase shadow-sm transition-colors disabled:cursor-not-allowed disabled:bg-surface-card"
      >
        {stock < 1 ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
        {stock > 0 && !added ? (
          <ArrowRight aria-hidden="true" className="size-4" />
        ) : null}
      </button>
      {error ? (
        <span role="alert" className="mt-1 max-w-40 text-right text-[11px] text-red-700">
          {error}
        </span>
      ) : null}
      <span className="sr-only">{title}</span>
    </div>
  );
}

export function WishlistClearButton({ hasItems }: { hasItems: boolean }) {
  const [busy, setBusy] = useState(false);
  const { error, setError, handleError, router } = useWishlistActionError();

  async function clearWishlist() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/wishlist?clear=true", { method: "DELETE" });
      router.refresh();
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={clearWishlist}
        disabled={!hasItems || busy}
        className="text-[11px] text-text-primary underline decoration-surface-border underline-offset-4 transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Clear all
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-right text-[11px] text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function WishlistMoveAllButton({ hasItems }: { hasItems: boolean }) {
  const [busy, setBusy] = useState(false);
  const { error, setError, handleError, router } = useWishlistActionError();

  async function moveAllToCart() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/wishlist/move-to-cart", { method: "POST" });
      router.refresh();
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={moveAllToCart}
        disabled={!hasItems || busy}
        className="border-brand-primary/30 text-brand-primary-dark inline-flex h-[39px] items-center justify-center gap-2 rounded-full border px-4 text-[11px] font-medium tracking-[0.02em] uppercase transition-colors hover:bg-brand-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        Move all to cart <ArrowRight aria-hidden="true" className="size-4" />
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-center text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
