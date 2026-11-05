import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { Crumb } from "@/lib/seo";

type PageHeaderProps = {
  title: string;
  description?: string | null;
  crumbs: Crumb[];
  variant?: "default" | "editorial";
};

export function PageHeader({
  title,
  description,
  crumbs,
  variant = "default",
}: PageHeaderProps) {
  const editorial = variant === "editorial";
  return (
    <section className="bg-surface-main">
      <Breadcrumbs crumbs={crumbs} />
      <header
        className={`mx-auto flex max-w-360 flex-col items-center px-4 text-center sm:px-6 lg:px-8 ${
          editorial ? "min-h-55 justify-center pb-4" : "min-h-26 pb-8"
        }`}
      >
        <h1
          className={`font-cormorant text-[clamp(2.5rem,3.5vw,2.875rem)] leading-[1.05] font-medium tracking-[0.08em] uppercase ${
            editorial ? "text-text-primary" : "text-text-primary"
          }`}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={`text-text-muted ${
              editorial
                ? "mt-5 max-w-[52ch] text-[15px] leading-6 sm:text-base"
                : "mt-2 text-[12px] sm:text-[13px]"
            }`}
          >
            {description}
          </p>
        ) : null}
      </header>
    </section>
  );
}
