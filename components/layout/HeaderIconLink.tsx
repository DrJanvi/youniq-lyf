import Link from "next/link";
import { ReactNode } from "react";

export type HeaderIconLinkProps = {
  href: string;
  icon: ReactNode;
  label: string;
  className?: string;
  badge?: number;
};

export function HeaderIconLink({
  href,
  icon,
  label,
  className,
  badge = 0,
}: HeaderIconLinkProps) {
  return (
    <Link
      key={label}
      href={href}
      className={`flex items-center gap-1.5 ${className ?? ""}`}
      aria-label={badge > 0 ? `${label} (${badge})` : label}
      title={label}
    >
      <span className="relative inline-flex">
        {icon}
        <HeaderCountBadge count={badge} />
      </span>
    </Link>
  );
}

export function HeaderCountBadge({ count }: { count: number }) {
  return count > 0 ? (
    <span
      aria-hidden="true"
      className="bg-brand-primary-dark text-white absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold"
    >
      {count > 99 ? "99+" : count}
    </span>
  ) : null;
}
