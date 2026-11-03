import { parsePagination } from "@/lib/pagination";
import { getFilterOptions, getWishedIds } from "@/lib/shop-data";
import { listProducts, parseFilters } from "@/services/product";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { InfiniteProductGrid } from "./InfiniteProductGrid";
import { MobileProductFilterSheet } from "./MobileProductFilterSheet";
import { ProductFilters } from "./ProductFilters";

type SP = Record<string, string | string[] | undefined>;

const SORTS = [
  { value: "", label: "Newest" },
  { value: "best_selling", label: "Best selling" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

/** Filter sidebar + infinite product grid; shared by /products and /category/[slug]. */
export async function ProductListing({
  searchParams,
  basePath,
  fixedCategory,
}: {
  searchParams: SP;
  basePath: string;
  fixedCategory?: string;
}) {
  const filters = parseFilters(searchParams);
  if (fixedCategory) filters.category = fixedCategory;
  const [result, options, wished] = await Promise.all([
    listProducts(filters, parsePagination({ ...searchParams, page: "1" })),
    getFilterOptions(),
    getWishedIds(),
  ]);
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(searchParams))
    flat[k] = Array.isArray(v) ? v.join(",") : v;
  delete flat.page;
  if (fixedCategory) flat.category = fixedCategory;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item) query.append(key, item);
    }
  }
  if (fixedCategory) {
    query.delete("category");
    query.set("category", fixedCategory);
  }
  const currentSort = filters.sort === "newest" ? "" : (filters.sort ?? "");
  const currentSortLabel =
    SORTS.find((option) => option.value === currentSort)?.label ?? "Newest";
  const sortParams = new URLSearchParams(query);
  sortParams.delete("sort");
  const sortHref = (value: string) => {
    const params = new URLSearchParams(sortParams);
    if (value) params.set("sort", value);
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  return (
    <div>
      <div className="border-y-brand-taupe/10 mt-10 flex items-center justify-between gap-3 border-y py-3 md:gap-8 md:py-5">
        <p className="text-text-muted shrink-0 text-xs md:text-sm">
          <span className="text-brand-taupe font-semibold">
            {result.pagination.total}
          </span>{" "}
          products
        </p>

        <div className="flex items-center gap-2">
          <MobileProductFilterSheet
            values={flat}
            categories={options.categories}
            types={options.types}
            brands={options.brands}
            productCount={options.productCount}
            priceRange={options.priceRange}
            action={basePath}
            hideCategory={Boolean(fixedCategory)}
          />
          <details className="group relative text-xs md:text-sm">
            <summary className="text-text-muted flex cursor-pointer list-none items-center gap-1 rounded-full border border-[#ece5e2] px-3 py-2 md:border-0 md:px-0 md:py-0">
              Sort by:{" "}
              <span className="text-brand-taupe font-semibold">
                {currentSortLabel}
              </span>
              <ChevronDownIcon
                aria-hidden="true"
                className="text-brand-taupe size-4 shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="absolute top-full right-0 z-20 mt-2 min-w-48 border border-[#ece5e2] bg-white py-2 shadow-lg">
              {SORTS.map((option) => (
                <a
                  key={option.value || "newest"}
                  href={sortHref(option.value)}
                  aria-current={
                    currentSort === option.value ? "page" : undefined
                  }
                  className="text-text-muted hover:bg-[#f8f5f4] block px-4 py-2"
                >
                  {option.label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </div>
      <div className="grid gap-12 md:grid-cols-[16rem_1fr]">
        <aside className="hidden pt-10 pb-10 md:sticky md:top-19.5 md:block md:max-h-[calc(100vh-4.875rem)] md:scrollbar-thin md:[scrollbar-color:transparent_transparent] md:self-start md:overflow-y-auto md:pr-4 md:hover:[scrollbar-color:rgb(0_0_0/0.2)_transparent]">
          <ProductFilters
            values={flat}
            categories={options.categories}
            types={options.types}
            brands={options.brands}
            productCount={options.productCount}
            priceRange={options.priceRange}
            action={basePath}
            hideCategory={Boolean(fixedCategory)}
          />
        </aside>
        <section
          aria-label="Products"
          className="flex flex-col gap-4 pt-6 md:pt-10"
        >
          <InfiniteProductGrid
            key={`${basePath}?${query.toString()}`}
            products={result.data}
            wishedIds={[...wished]}
            query={query.toString()}
            hasNext={result.pagination.hasNext}
          />
        </section>
      </div>
    </div>
  );
}
