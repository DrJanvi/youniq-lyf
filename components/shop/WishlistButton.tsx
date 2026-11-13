"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function WishlistButton({
  productId,
  initial = false,
  className = "",
  overlay = false,
  iconOnly = false,
}: {
  productId: string;
  initial?: boolean;
  className?: string;
  overlay?: boolean;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      if (active)
        await apiFetch(`/api/wishlist?productId=${productId}`, {
          method: "DELETE",
        });
      else
        await apiFetch("/api/wishlist", {
          method: "POST",
          json: { productId },
        });
      setActive(!active);
      router.refresh();
    } catch (e) {
      if (e instanceof ClientApiError && e.status === 401)
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
    } finally {
      setBusy(false);
    }
  }

  if (overlay) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={active}
        aria-label={busy ? "Updating wishlist" : active ? "Remove from wishlist" : "Add to wishlist"}
        aria-busy={busy}
        className={`flex size-10 cursor-pointer items-center justify-center rounded-full bg-white ${active ? "text-brand-primary" : "text-neutral-600"} opacity-20 shadow-sm transition-opacity duration-300 ease-out group-hover:opacity-100 focus-visible:opacity-100 ${className}`}
      >
        {busy ? (
          <LoadingSpinner className="size-5" />
        ) : (
          <Heart className="size-5" fill={active ? "currentColor" : "none"} />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={toggle}
      disabled={busy}
      aria-pressed={active}
      aria-label={busy ? "Updating wishlist" : active ? "Remove from wishlist" : "Add to wishlist"}
      aria-busy={busy}
      className={className}
    >
      {iconOnly ? (
        busy ? (
          <LoadingSpinner className="size-5" />
        ) : (
          <Heart
            aria-hidden="true"
            className={`size-5 ${active ? "text-brand-primary" : ""}`}
            fill={active ? "currentColor" : "none"}
          />
        )
      ) : busy ? (
        <span className="inline-flex items-center gap-2">
          <LoadingSpinner />
          Updating wishlist…
        </span>
      ) : active ? (
        "♥ In wishlist"
      ) : (
        "♡ Add to wishlist"
      )}
    </Button>
  );
}
