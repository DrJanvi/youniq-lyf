"use client";

import { ArrowRight, Star } from "lucide-react";
import { useState } from "react";
import { ReviewModal } from "@/components/shop/ReviewModal";

export type ProductReview = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
};

type Filter = "helpful" | "latest" | "positive" | "negative";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "helpful", label: "Most Helpful" },
  { value: "latest", label: "Latest" },
  { value: "positive", label: "Positive" },
  { value: "negative", label: "Negative" },
];

const PAGE_SIZE = 3;

function Stars({ value, className = "h-5 w-5" }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className="flex gap-1" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= rounded ? "fill-rating-gold text-rating-gold" : "text-rating-gold"}`}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

export function ProductReviews({
  productId,
  userName,
  average,
  total,
  distribution,
  reviews,
}: {
  productId: string;
  userName: string;
  average: number;
  total: number;
  distribution: Record<number, number>;
  reviews: ProductReview[];
}) {
  const [filter, setFilter] = useState<Filter>("helpful");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  const shown = reviews
    .filter((r) =>
      filter === "positive" ? r.rating >= 4 : filter === "negative" ? r.rating <= 2 : true,
    )
    .sort((a, b) =>
      filter === "helpful"
        ? b.rating - a.rating || b.createdAt.localeCompare(a.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    );

  return (
    <div>
      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.2fr_1fr] md:gap-0">
        <div className="flex flex-col items-center gap-2 md:px-6">
          <div className="flex items-center gap-3">
            <Stars value={average} />
            <span className="text-sm text-text-muted">{average.toFixed(2)} out of 5</span>
          </div>
          <span className="text-xs text-text-primary">
            Based on {total} {total === 1 ? "rating" : "ratings"}
          </span>
        </div>
        <ul className="flex flex-col gap-2 md:border-x md:border-surface-border md:px-10">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = total ? Math.round((distribution[star] / total) * 100) : 0;
            return (
              <li key={star} className="flex items-center gap-3 text-sm text-text-primary">
                <span className="w-3">{star}</span>
                <Star className="h-4 w-4 fill-rating-gold text-rating-gold" aria-hidden />
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-card">
                  <span
                    className="block h-full rounded-full bg-brand-primary"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="w-9 text-xs text-text-muted">{pct}%</span>
              </li>
            );
          })}
        </ul>
        <div className="flex justify-center">
          <button
            type="button"
            aria-expanded={formOpen}
            onClick={() => setFormOpen((v) => !v)}
            className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white rounded-full px-7 py-2.5 text-sm font-medium transition-colors"
          >
            Write a Review
          </button>
        </div>
      </div>

      {formOpen ? (
        <ReviewModal
          productId={productId}
          defaultName={userName}
          onClose={() => setFormOpen(false)}
        />
      ) : null}

      <div className="mt-10 flex flex-wrap gap-2 border-b border-surface-border pb-4" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => {
              setFilter(f.value);
              setVisible(PAGE_SIZE);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filter === f.value
                ? "border-brand-primary/30 bg-surface-card font-medium text-text-primary"
                : "border-transparent text-text-primary hover:text-brand-primary-dark"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length ? (
        <ul>
          {shown.slice(0, visible).map((r) => (
            <li key={r.id} className="border-b border-surface-border py-7">
              <div className="flex items-center gap-3">
                <Stars value={r.rating} className="h-[18px] w-[18px]" />
                <span className="text-sm text-text-muted">{r.rating.toFixed(2)} out of 5</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-sm font-semibold text-text-primary uppercase"
                  >
                    {r.authorName.trim().charAt(0) || "?"}
                  </span>
                  <span className="text-sm font-medium text-text-primary">{r.authorName}</span>
                </div>
                <time dateTime={r.createdAt} className="text-sm text-text-muted">
                  {formatDate(r.createdAt)}
                </time>
              </div>
              {r.title ? (
                <h3 className="mt-4 text-sm font-semibold text-text-primary">{r.title}</h3>
              ) : null}
              <p className="mt-1 text-sm leading-6 whitespace-pre-line text-text-muted">{r.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-10 text-center text-sm text-text-muted">
          {total ? "No reviews match this filter." : "No reviews yet. Be the first to write one."}
        </p>
      )}

      {shown.length > visible ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-xs font-medium tracking-wider uppercase transition-colors"
          >
            Load more <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
