import { Section } from "@/components/ui/Section";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { StorefrontLink as Link } from "@/components/layout/StorefrontLink";
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
              <div className="absolute bottom-0 flex w-full items-center justify-between bg-linear-to-b from-transparent via-black/25 to-black/65 p-4 px-4 pt-12 text-white">
                <h3 className="text-base font-bold uppercase md:text-lg">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium md:text-sm">
                  <ArrowRightCircleIcon className="size-6" />
                </div>
              </div>
            </Link>
            <span
              aria-hidden="true"
              className="border-surface-border/50 pointer-events-none absolute inset-0 rounded-3xl border-2"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
