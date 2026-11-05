import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import clsx from "clsx";
import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { Section } from "./Section";

export function Breadcrumbs({
  crumbs,
  className,
  contentClassName,
}: {
  crumbs: Crumb[];
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Section
      as="nav"
      aria-label="Breadcrumb"
      className={className}
      contentClassName={contentClassName}
    >
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <ol className="flex min-h-14.5 flex-wrap items-center gap-2 text-xs">
        {crumbs.map((c, i) => (
          <li key={c.href} className={clsx("flex gap-2")}>
            {i < crumbs.length - 1 ? (
              <Link
                href={c.href}
                className={clsx(
                  i === crumbs.length - 1
                    ? "text-[#504B48]"
                    : "text-[#9B9591] hover:underline",
                )}
              >
                {c.name}
              </Link>
            ) : (
              <span aria-current="page">{c.name}</span>
            )}
            {i < crumbs.length - 1 ? (
              <span className="text-[#9B9591]">{"/"}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}
