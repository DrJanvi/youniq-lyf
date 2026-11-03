import { EmptyState } from "@/components/ui/EmptyState";
import type { ProductDTO } from "@/services/product";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: ProductDTO[];
  wishedIds?: Set<string>;
  showRating?: boolean;
  className?: string;
};

export function ProductGrid({
  products,
  wishedIds,
  showRating = true,
  className,
}: ProductGridProps) {
  if (!products.length) return <EmptyState title="No products found." />;
  return (
    <ul
      className={`grid grid-cols-1 gap-5 gap-y-10 md:grid-cols-2 lg:grid-cols-3 ${className ?? ""}`}
    >
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard
            product={p}
            wished={wishedIds?.has(p.id)}
            showRating={showRating}
          />
        </li>
      ))}
    </ul>
  );
}
