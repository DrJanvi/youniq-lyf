import { ProductDTO } from "@/services/product";
import Image from "next/image";
import { Section } from "../ui/Section";
import { ProductGrid } from "./ProductGrid";
import { SectionHeading } from "./SectionHeading";

type NewReleaseSectionProps = {
  products: ProductDTO[];
  wishedIds: Set<string>;
};

export function NewReleaseSection({
  products,
  wishedIds,
}: NewReleaseSectionProps) {
  if (!products.length) return null;

  return (
    <Section contentClassName="py-16">
      <div>
        <div className="mb-9 flex items-center justify-between gap-8">
          <SectionHeading className="m-0!">New Releases</SectionHeading>
          <button className="bg-brand-taupe hidden items-center justify-center gap-2 rounded-full px-6 py-3 text-white hover:bg-black md:flex">
            View More
            <Image
              src="/assets/arrow.svg"
              alt=""
              width={20}
              height={15}
              aria-hidden="true"
            />
          </button>
        </div>
        <div className="grid gap-8 md:grid-cols-5">
          <div className="relative overflow-hidden rounded-3xl md:col-span-2 md:max-h-164">
            <Image
              src={"/images/new_release.webp"}
              alt="New Release"
              width={423}
              height={228}
              unoptimized
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 flex w-full items-center justify-center bg-linear-to-b from-transparent via-black/25 to-black/65 p-6 px-9 pt-12 text-white">
              <h3 className="font-cormorant text-center text-xl font-bold uppercase">
                Beautiful Product
              </h3>
            </div>
          </div>
          <div className="md:col-span-3 md:max-h-164 md:overflow-y-scroll">
            <ProductGrid
              products={products}
              wishedIds={wishedIds}
              showRating={false}
              className="lg:grid-cols-2!"
            />

            <button className="bg-brand-taupe mx-auto mt-8 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-white hover:bg-black md:hidden">
              View More
              <Image
                src="/assets/arrow.svg"
                alt=""
                width={20}
                height={15}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}
