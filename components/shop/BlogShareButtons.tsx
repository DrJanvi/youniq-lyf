"use client";

import Image from "next/image";
import { Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

const buttonClassName =
  "flex size-9 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary-dark transition-colors hover:bg-brand-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary";

export function BlogShareButtons({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Could not copy the article link.");
    }
  }

  async function shareArticle() {
    if (typeof navigator.share !== "function") {
      await copyUrl();
      return;
    }

    try {
      await navigator.share({ title, url });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      toast.error("Could not share the article.");
    }
  }

  return (
    <div className="mt-4 flex items-center gap-2.5" role="group" aria-label="Share this article">
      <span className="mr-1 font-cormorant text-base text-text-primary">Share</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={buttonClassName}
      >
        <Image src="/assets/facebook.svg" alt="" width={18} height={18} />
      </a>
      <a
        href={`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={buttonClassName}
      >
        <Image src="/assets/x.svg" alt="" width={16} height={16} />
      </a>
      <button
        type="button"
        onClick={() => void shareArticle()}
        aria-label="Share article"
        className={buttonClassName}
      >
        <Share2 aria-hidden="true" className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => void copyUrl()}
        aria-label="Copy article link"
        className={buttonClassName}
      >
        <Link2 aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
