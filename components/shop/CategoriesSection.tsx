import { Section } from "@/components/ui/Section";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./SectionHeading";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <Section contentClassName="py-16">
      <SectionHeading>Shop By Category</SectionHeading>
      <ul className="grid grid-cols-1 gap-4 px-0 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <li
            key={category.id}
            className="group relative overflow-hidden rounded-3xl"
          >
            <Link href={`/category/${category.slug}`} className="relative">
              <Image
                src={category.image}
                alt={category.name}
                width={423}
                height={228}
                unoptimized
                className="hover-zoom w-full"
              />
              <div className="absolute bottom-0 flex w-full items-center justify-between bg-linear-to-b from-transparent via-black/25 to-black/65 p-4 px-4 pt-12 text-white md:p-6 md:px-9">
                <h3 className="text-base font-bold uppercase md:text-xl">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 text-sm font-medium md:text-base">
                  View Products
                  <Image
                    src="/assets/arrow.svg"
                    alt=""
                    width={20}
                    height={15}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Link>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-surface-border/50"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
