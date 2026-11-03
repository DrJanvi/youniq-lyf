"use client";

import { useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { cn } from "@/lib/utils";

export type Column<T> = {
  id: string;
  header: string;
  /** Server-side sort key; omit for non-sortable columns. */
  sortKey?: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export type TableFilter = { param: string; label: string; options: { value: string; label: string }[]; value?: string };

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  total: number;
  page: number;
  totalPages: number;
  sort: string;
  dir: "asc" | "desc";
  searchPlaceholder?: string;
  searchValue?: string;
  filters?: TableFilter[];
  emptyTitle?: string;
  emptyAction?: ReactNode;
};

const ALL = "__all";

/** Server-driven table: search, filters, sorting and pagination all live in the URL query string. */
export function DataTable<T>({
  columns, rows, getRowId, total, page, totalPages, sort, dir,
  searchPlaceholder = "Search…", searchValue = "", filters = [], emptyTitle = "Nothing here yet", emptyAction,
}: Props<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  function update(changes: Record<string, string | undefined>, resetPage = true) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (resetPage) next.delete("page");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  function toggleSort(key: string) {
    update({ sort: key, dir: sort === key && dir === "asc" ? "desc" : "asc" });
  }

  const hasActiveFilters = Boolean(searchValue) || filters.some((f) => f.value);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <form
          key={searchValue}
          role="search"
          className="relative w-full sm:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: String(new FormData(e.currentTarget).get("q") ?? "").trim() || undefined });
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={searchValue} placeholder={searchPlaceholder} aria-label="Search" className="rounded-md bg-card pl-9" />
        </form>
        {filters.map((f) => (
          <Select key={f.param} value={f.value ?? ALL} onValueChange={(v) => update({ [f.param]: v === ALL ? undefined : v })}>
            <SelectTrigger className="w-40 rounded-md bg-card" aria-label={f.label}>
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All {f.label.toLowerCase()}</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={() => update({ q: undefined, ...Object.fromEntries(filters.map((f) => [f.param, undefined])) })}>
            <X /> Clear
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-md border border-border bg-card shadow-sm transition-opacity",
          pending && "opacity-60",
        )}
      >
        <Table>
          <TableHeader className="bg-muted/50 [&_th]:h-11 [&_th]:font-heading [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wide [&_th]:text-muted-foreground">
            <TableRow>
              {columns.map((c) => {
                const active = c.sortKey === sort;
                const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
                return (
                  <TableHead key={c.id} className={c.className} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}>
                    {c.sortKey ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.sortKey!)}
                        className={cn(
                          "inline-flex items-center gap-1.5 font-medium transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                          active && "text-primary",
                        )}
                      >
                        {c.header}
                        <Icon
                          className={cn(
                            "size-3.5",
                            active
                              ? "text-primary"
                              : "text-muted-foreground/50",
                          )}
                        />
                      </button>
                    ) : (
                      c.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-36 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <span className="grid size-9 place-items-center rounded-md bg-muted">
                      <Search className="size-4" />
                    </span>
                    <p>{hasActiveFilters ? "No results match your filters" : emptyTitle}</p>
                    {!hasActiveFilters ? emptyAction : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((c) => (
                    <TableCell key={c.id} className={c.className}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {total} {total === 1 ? "result" : "results"}
        </span>
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || pending} onClick={() => update({ page: String(page - 1) }, false)}>
              <ChevronLeft /> Prev
            </Button>
            <span className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages || pending} onClick={() => update({ page: String(page + 1) }, false)}>
              Next <ChevronRight />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
