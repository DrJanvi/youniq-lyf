import { parsePagination, type PageParams } from "@/lib/pagination";

export type SortDir = "asc" | "desc";
export type SearchParams = Record<string, string | string[] | undefined>;

export type ListParams = { q?: string; sort: string; dir: SortDir; page: PageParams; filters: Record<string, string | undefined> };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Parses table query params (q, sort, dir, page, limit and named filters) from the URL. */
export function parseListParams(
  sp: SearchParams,
  opts: { sortable: readonly string[]; defaultSort: string; defaultDir?: SortDir; filters?: Record<string, readonly string[] | true> },
): ListParams {
  const sort = opts.sortable.includes(first(sp.sort) ?? "") ? (first(sp.sort) as string) : opts.defaultSort;
  const dirParam = first(sp.dir);
  const dir: SortDir = dirParam === "asc" || dirParam === "desc" ? dirParam : (opts.defaultDir ?? "desc");
  const filters: ListParams["filters"] = {};
  for (const [key, allowed] of Object.entries(opts.filters ?? {})) {
    const v = first(sp[key]);
    if (v && (allowed === true || allowed.includes(v))) filters[key] = v;
  }
  return { q: first(sp.q)?.trim() || undefined, sort, dir, page: parsePagination(sp, 20), filters };
}
