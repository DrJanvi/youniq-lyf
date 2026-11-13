import Image from "next/image";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[55vh] flex-col items-center justify-center gap-4 px-4"
    >
      <Image
        src="/logo.svg"
        alt=""
        width={72}
        height={62}
        priority
        className="storefront-loading-logo object-contain"
      />
      <p className="text-sm font-medium text-text-muted">Loading your page…</p>
    </div>
  );
}
