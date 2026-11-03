import Link from "next/link";

type Props = {
  basePath: string;
  page: number;
  totalPages: number;
  /** Other query params to keep in links. */
  params?: Record<string, string | undefined>;
};

function href(basePath: string, params: Props["params"], page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v && k !== "page") sp.set(k, v);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ basePath, page, totalPages, params }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center gap-3">
      {page > 1 ? (
        <Link href={href(basePath, params, page - 1)} rel="prev">
          Previous
        </Link>
      ) : null}
      <span>
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(basePath, params, page + 1)} rel="next">
          Next
        </Link>
      ) : null}
    </nav>
  );
}
