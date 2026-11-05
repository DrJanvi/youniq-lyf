import { PageHeader } from "@/components/shop/PageHeader";
import {
  WishlistAddToCartButton,
  WishlistClearButton,
  WishlistMoveAllButton,
  WishlistRemoveButton,
  WishlistToolbar,
} from "@/components/shop/WishlistPageActions";
import { Pagination } from "@/components/ui/Pagination";
import { formatMoney } from "@/components/ui/PriceTag";
import { Section } from "@/components/ui/Section";
import { requireUserPage } from "@/lib/auth/session";
import { parsePagination } from "@/lib/pagination";
import { buildMetadata } from "@/lib/seo";
import { listWishlistEntries } from "@/services/wishlist";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const instant = false;

export const metadata: Metadata = buildMetadata({
  title: "Your wishlist",
  path: "/wishlist",
  noindex: true,
});

type WishlistSort = "newest" | "oldest" | "price-asc" | "price-desc";
const WISHLIST_SORTS: WishlistSort[] = [
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
];

function formatDateAdded(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default async function WishlistPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUserPage("/wishlist");
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const requestedSort = params.sort;
  const sort =
    WISHLIST_SORTS.find((value) => value === requestedSort) ?? "newest";
  const result = await listWishlistEntries(
    user.id,
    parsePagination(params),
    query,
    sort,
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        title="My Wishlist"
        description="A quiet collection of your most-loved fragrances, body care and home rituals."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Wishlist", href: "/wishlist" },
        ]}
      />

      <main className="mx-auto w-full px-4 pt-5 sm:px-6 lg:px-8">
        <Section as="section" aria-label="Wishlist items">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-[13px] leading-5 font-medium text-text-primary">
                <span className="text-status-error">
                  {result.pagination.total}
                </span>{" "}
                {query
                  ? `of ${result.activeWishlistCount} saved items`
                  : result.pagination.total === 1
                    ? "saved item"
                    : "saved items"}
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-text-muted">
                Saved locally for your next visit
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-4 md:w-auto md:justify-end">
              <WishlistToolbar query={query} sort={sort} />
              <div className="ml-auto md:ml-0">
                <WishlistClearButton hasItems={result.wishlistCount > 0} />
              </div>
            </div>
          </div>

          {result.data.length > 0 ? (
            <div role="table" aria-label="Wishlist items">
              <div
                role="row"
                className="hidden grid-cols-[minmax(300px,1.7fr)_110px_150px_190px_136px] items-center bg-surface-card px-5 py-2.75 text-[16px] font-semibold text-text-primary lg:grid"
              >
                <span
                  role="columnheader"
                  className="font-cormorant pl-0.5 text-center"
                >
                  Product
                </span>
                <span
                  role="columnheader"
                  className="font-cormorant text-center"
                >
                  Price
                </span>
                <span
                  role="columnheader"
                  className="font-cormorant text-center"
                >
                  Stock Status
                </span>
                <span
                  role="columnheader"
                  className="font-cormorant text-center"
                >
                  Date Added
                </span>
                <span role="columnheader" aria-label="Actions" />
              </div>
              {result.data.map(({ product, createdAt }) => (
                <div
                  role="row"
                  key={product.id}
                  className="grid grid-cols-2 gap-x-3 gap-y-3 border-b border-surface-border py-4 sm:gap-x-5 lg:grid-cols-[minmax(300px,1.7fr)_110px_150px_190px_136px] lg:items-center lg:gap-x-0 lg:px-1 lg:py-3.5"
                >
                  <div
                    role="cell"
                    className="col-span-2 flex min-w-0 items-center gap-2 lg:col-span-1 lg:gap-3"
                  >
                    <WishlistRemoveButton
                      productId={product.id}
                      title={product.title}
                    />
                    <Link
                      href={`/products/${product.slug}`}
                      aria-label={product.title}
                      className="relative grid size-18 shrink-0 place-items-center overflow-hidden rounded-[3px] bg-surface-card lg:size-22"
                    >
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt=""
                          width={88}
                          height={88}
                          unoptimized
                          className="size-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-[10px] text-text-muted">
                          No image
                        </span>
                      )}
                    </Link>
                    <div className="min-w-0 pl-1">
                      <Link
                        href={`/products/${product.slug}`}
                        className="font-cormorant line-clamp-2 block text-[16px] leading-[1.08] font-semibold text-text-primary hover:underline lg:text-[17px]"
                      >
                        {product.title}
                      </Link>
                      <p className="mt-1 text-[11px] text-text-muted lg:text-[12px]">
                        {product.category.name}
                      </p>
                    </div>
                  </div>

                  <div
                    role="cell"
                    className="flex min-w-0 flex-col items-start gap-1 text-[13px] text-text-muted sm:flex-row sm:items-center sm:justify-between lg:justify-center lg:text-[14px]"
                  >
                    <span className="text-[10px] text-text-muted lg:hidden">
                      Price
                    </span>
                    <span className="whitespace-nowrap">
                      {formatMoney(product.finalPrice, product.currency)}
                    </span>
                  </div>

                  <div
                    role="cell"
                    className="flex min-w-0 flex-col items-start gap-1 text-[12px] sm:flex-row sm:items-center sm:justify-between lg:justify-center lg:text-[13px]"
                  >
                    <span className="text-[10px] text-text-muted lg:hidden">
                      Stock
                    </span>
                    <span
                      className={
                        product.inStock
                          ? "font-medium text-status-success"
                          : "font-medium text-status-error"
                      }
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <div
                    role="cell"
                    className="col-span-2 flex min-w-0 items-center justify-between gap-2 text-[12px] text-text-muted lg:col-span-1 lg:justify-center lg:text-[13px]"
                  >
                    <span className="text-[10px] text-text-muted lg:hidden">
                      Added
                    </span>
                    <time dateTime={createdAt} className="text-right">
                      {formatDateAdded(createdAt)}
                    </time>
                  </div>

                  <div
                    role="cell"
                    className="col-span-2 flex justify-end lg:col-span-1"
                  >
                    <WishlistAddToCartButton
                      productId={product.id}
                      title={product.title}
                      stock={product.stock}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center" role="status">
              <h2 className="font-cormorant text-[26px] font-semibold text-text-primary">
                {result.activeWishlistCount === 0
                  ? "Your wishlist is currently empty"
                  : "No saved items match your search"}
              </h2>
              <p className="mt-2 text-[12px] text-text-muted">
                {result.activeWishlistCount === 0
                  ? "Save your favorite products and return to them whenever you like."
                  : "Try another search to find your saved products."}
              </p>
              <Link
                href={
                  result.activeWishlistCount === 0 ? "/products" : "/wishlist"
                }
                className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-brand-primary/30 px-5 text-[11px] font-medium tracking-wider text-brand-primary-dark uppercase transition-colors hover:bg-surface-card"
              >
                {result.activeWishlistCount === 0
                  ? "Return to shop"
                  : "Clear search"}
              </Link>
            </div>
          )}

          {result.activeWishlistCount > 0 ? (
            <div className="mt-10 flex justify-center">
              <WishlistMoveAllButton hasItems />
            </div>
          ) : null}
          <div className="mt-7 flex justify-center">
            <Pagination
              basePath="/wishlist"
              page={result.pagination.page}
              totalPages={result.pagination.totalPages}
              params={{ q: query || undefined, sort }}
            />
          </div>
        </Section>
      </main>
    </div>
  );
}
