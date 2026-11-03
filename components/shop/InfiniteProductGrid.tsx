"use client";

import type { Paginated } from "@/lib/pagination";
import type { ProductDTO } from "@/services/product";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductGrid } from "./ProductGrid";

type Props = {
  products: ProductDTO[];
  wishedIds: string[];
  query: string;
  hasNext: boolean;
};

export function InfiniteProductGrid({
  products: initialProducts,
  wishedIds,
  query,
  hasNext: initialHasNext,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const wished = new Set(wishedIds);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasNext) return;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams(query);
      params.set("page", String(page + 1));
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Could not load more products.");
      }

      const result = (await response.json()) as Paginated<ProductDTO>;
      setProducts((current) => {
        const existingIds = new Set(current.map((product) => product.id));
        return [
          ...current,
          ...result.data.filter((product) => !existingIds.has(product.id)),
        ];
      });
      setPage(result.pagination.page);
      setHasNext(result.pagination.hasNext);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load more products.",
      );
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasNext, page, query]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNext || isLoading || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadNextPage();
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasNext, isLoading, loadNextPage]);

  return (
    <>
      <ProductGrid products={products} wishedIds={wished} />
      {hasNext ? (
        <div ref={sentinelRef} aria-hidden="true" className="h-1" />
      ) : null}
      {hasNext ? (
        <button
          type="button"
          onClick={() => void loadNextPage()}
          disabled={isLoading}
          className="text-brand-taupe border-b border-current text-sm font-medium disabled:opacity-50"
        >
          Load more products
        </button>
      ) : null}
      {isLoading ? (
        <p role="status" className="text-text-muted py-4 text-center text-sm">
          Loading more products...
        </p>
      ) : null}
      {error ? (
        <div role="alert" className="flex flex-col items-center gap-2 py-4">
          <p className="text-text-muted text-sm">{error}</p>
          <button
            type="button"
            onClick={() => void loadNextPage()}
            className="text-brand-taupe border-b border-current text-sm font-medium"
          >
            Try again
          </button>
        </div>
      ) : null}
    </>
  );
}
