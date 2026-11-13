"use client";

import Image from "next/image";
import NextLink, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

type StorefrontLinkProps = ComponentProps<typeof NextLink>;

function PendingNavigationOverlay() {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      className="storefront-navigation-overlay pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm"
    >
      <Image
        src="/logo.svg"
        alt=""
        width={72}
        height={62}
        className="storefront-loading-logo object-contain"
      />
      <span className="text-sm font-medium text-text-muted">
        Loading your page…
      </span>
    </span>
  );
}

export function StorefrontLink({ children, ...props }: StorefrontLinkProps) {
  return (
    <NextLink {...props}>
      {children}
      <PendingNavigationOverlay />
    </NextLink>
  );
}
