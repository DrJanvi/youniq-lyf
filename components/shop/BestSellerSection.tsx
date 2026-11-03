import type { ProductDTO } from "@/services/product";
import { Section } from "../ui/Section";
import { ProductGrid } from "./ProductGrid";
import { SectionHeading } from "./SectionHeading";

type BestSellerSectionProps = {
  products: ProductDTO[];
  wishedIds: Set<string>;
};

export function BestSellerSection({
  products,
  wishedIds,
}: BestSellerSectionProps) {
  if (!products.length) return null;

  return (
    <Section contentClassName="py-16">
      <SectionHeading>Best Selling Products</SectionHeading>
      <div>
        <ProductGrid
          products={products}
          wishedIds={wishedIds}
          showRating={false}
        />
      </div>
    </Section>
  );
}
