import { listHighlightedPosts } from "@/services/highlighted-post";
import clsx from "clsx";
import Image from "next/image";
import { Section } from "../ui/Section";
import { SectionHeading } from "./SectionHeading";

const mosaicPositions = [
  "lg:col-start-3 lg:row-start-2 lg:col-span-2 lg:row-span-2",
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-2 lg:row-start-1",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-4 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-2 lg:row-start-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-2 lg:row-start-3",
];

export async function HighlightedPostsSection() {
  const posts = await listHighlightedPosts();
  if (posts.length === 0) return null;
  const useMosaic = posts.length >= mosaicPositions.length;

  return (
    <Section className="py-12">
      <div className="mb-9 flex flex-col text-center md:flex-row md:items-center! md:justify-between md:gap-4 md:text-left">
        <SectionHeading className="mb-4! md:mb-0! md:text-left!">
          Your Style, Your Story
        </SectionHeading>
        <p className="text-text-muted text-sm md:max-w-[45ch]">
          Explore Youniq bags and accessories through inspiring looks and
          everyday moments that make your style your own.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {posts.map((p, i) => (
          <li key={p.id} className={clsx("aspect-square", useMosaic && mosaicPositions[i])}>
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block size-full overflow-hidden rounded-2xl"
            >
              <Image
                src={p.image}
                alt={`${p.alt ?? "Highlighted post"} - ${i}`}
                width={400}
                height={400}
                unoptimized
                className="size-full object-cover transition-transform group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-0 flex items-end justify-end p-3 text-white opacity-100 transition-opacity duration-200 md:items-center md:justify-center md:bg-black/30 md:p-0 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                <span className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs font-medium md:flex-col md:gap-2 md:rounded-none md:bg-transparent md:px-0 md:py-0 md:text-base">
                  <Image
                    src="/assets/instagram.svg"
                    alt=""
                    width={36}
                    height={36}
                    aria-hidden="true"
                    className="size-6 brightness-0 invert md:size-9"
                  />
                  <span>
                    View Post <span aria-hidden="true">&rarr;</span>
                  </span>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <button className="bg-brand-primary-dark text-white mx-auto mt-8 flex items-center justify-center gap-2 rounded-full px-6 py-3 hover:bg-black">
        Load More
        <Image
          src="/assets/arrow.svg"
          alt=""
          width={20}
          height={15}
          aria-hidden="true"
        />
      </button>
    </Section>
  );
}
