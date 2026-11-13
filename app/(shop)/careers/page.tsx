import { CareerApplicationForm } from "@/components/shop/CareerApplicationForm";
import { getCareerPageSettings } from "@/services/career";
import type { Metadata } from "next";
import Image from "next/image";
import { StorefrontLink as Link } from "@/components/layout/StorefrontLink";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Explore career opportunities at Youniqlyf and submit your application.",
};

export default async function CareersPage() {
  await connection();
  const { imageUrl } = await getCareerPageSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 lg:pt-8 lg:pb-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs text-text-muted"
      >
        <Link href="/" className="hover:text-text-primary transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-text-primary">
          Careers
        </span>
      </nav>

      <div className="grid gap-4 lg:grid-cols-[minmax(260px,315px)_minmax(0,1fr)]">
        <aside className="relative min-h-[360px] overflow-hidden rounded-2xl bg-brand-primary-soft sm:min-h-[420px] lg:min-h-[500px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Youniqlyf fashion campaign"
              fill
              sizes="(max-width: 1023px) 100vw, 315px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-br from-brand-primary-soft via-surface-card to-brand-primary/30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
            <h2 className="font-cormorant text-2xl font-medium tracking-[0.08em] uppercase">
              Grow with us
            </h2>
            <div className="mt-2 h-px w-14 bg-white/70" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/90">
              Join us in bringing expressive bags and accessories to everyday
              style.
            </p>
          </div>
        </aside>

        <section className="rounded-2xl border border-surface-border bg-surface-main px-5 py-7 sm:px-8 sm:py-9 lg:px-9 lg:py-8">
          <header className="mx-auto mb-6 max-w-lg text-center">
            <h1 className="font-cormorant text-3xl font-medium tracking-[0.06em] text-text-primary uppercase sm:text-4xl">
              Join Our Team
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-muted">
              Explore opportunities with us. Share your details and upload your
              resume to apply.
            </p>
          </header>
          <CareerApplicationForm />
        </section>
      </div>
    </div>
  );
}
