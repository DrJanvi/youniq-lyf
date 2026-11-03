import type { ReviewDTO } from "@/services/review";
import { Rating } from "@/components/ui/Rating";

export function ReviewList({ reviews }: { reviews: ReviewDTO[] }) {
  if (!reviews.length) {
    return (
      <p className="border-surface-border text-text-muted rounded-2xl border bg-white p-6 text-sm">
        No reviews yet.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((r) => (
        <li
          key={r.id}
          className="border-surface-border flex flex-col gap-2 rounded-2xl border bg-white p-5"
        >
          <div className="[&_span]:text-rating-gold">
            <Rating value={r.rating} />
          </div>
          {r.title ? (
            <strong className="font-cormorant text-brand-espresso text-xl">
              {r.title}
            </strong>
          ) : null}
          <p className="text-sm leading-6">{r.body}</p>
          <small className="text-text-muted">
            {r.authorName} ·{" "}
            <time dateTime={r.createdAt}>{r.createdAt.slice(0, 10)}</time>
          </small>
        </li>
      ))}
    </ul>
  );
}
