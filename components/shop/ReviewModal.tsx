"use client";

import { ArrowRight, Star, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/client-api";

const inputClass =
  "w-full rounded-xl border border-surface-border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-brand-primary";
const labelClass = "font-cormorant mb-2 block text-base font-semibold text-text-primary";

export function ReviewModal({
  productId,
  defaultName = "",
  onClose,
}: {
  productId: string;
  defaultName?: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        json: {
          productId,
          rating,
          title: fd.get("title"),
          body: fd.get("body"),
          authorName: fd.get("authorName"),
          authorEmail: fd.get("authorEmail"),
        },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-surface-main p-6 shadow-2xl md:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-text-primary transition hover:bg-brand-primary-soft"
        >
          <X className="h-4 w-4" />
        </button>

        {done ? (
          <div className="py-10 text-center">
            <h2 id="review-modal-title" className="font-cormorant text-4xl text-text-primary">
              Thank you!
            </h2>
            <p className="mt-3 text-sm text-text-muted">
              Your review has been submitted and will appear once it is approved.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white mt-8 rounded-full px-8 py-2.5 text-xs font-medium tracking-wider uppercase transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <h2 id="review-modal-title" className="font-cormorant pr-12 text-4xl text-text-primary md:text-5xl">
                Share Your Experience
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Your thoughts help others find their perfect scent.
              </p>
            </div>

            <fieldset>
              <legend className={labelClass}>Your Rating *</legend>
              <div className="flex gap-3" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    aria-pressed={rating === n}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setRating(n)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 text-rating-gold ${n <= (hover || rating) ? "fill-rating-gold" : ""}`}
                    />
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="review-title" className={labelClass}>Review Title *</label>
              <input
                id="review-title"
                name="title"
                required
                maxLength={150}
                placeholder="Summarize your experience"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="review-body" className={labelClass}>Your Review *</label>
              <textarea
                id="review-body"
                name="body"
                required
                rows={4}
                maxLength={5000}
                placeholder="Tell us what you loved about this product..."
                className={inputClass}
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="review-name" className={labelClass}>Full Name *</label>
                <input
                  id="review-name"
                  name="authorName"
                  required
                  maxLength={100}
                  defaultValue={defaultName}
                  placeholder="Enter your name"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="review-email" className={labelClass}>Email *</label>
                <input
                  id="review-email"
                  name="authorEmail"
                  type="email"
                  required
                  maxLength={190}
                  placeholder="Enter your email"
                  className={inputClass}
                />
              </div>
            </div>

            {error ? (
              <p role="alert" className="text-center text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={busy}
                className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white inline-flex items-center gap-2 rounded-full px-8 py-3 text-xs font-medium tracking-wider uppercase transition-colors disabled:opacity-60"
              >
                {busy ? "Submitting..." : "Submit Review"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <p className="text-center text-xs text-text-muted">
                Your email will not be published. Reviews appear after approval.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
