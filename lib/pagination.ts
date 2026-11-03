export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 100;

export type PageParams = { page: number; limit: number; skip: number };

export function parsePagination(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  defaultLimit = DEFAULT_LIMIT,
): PageParams {
  const get = (k: string) => {
    if (params instanceof URLSearchParams) return params.get(k) ?? undefined;
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const page = Math.max(1, parseInt(get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(get("limit") ?? String(defaultLimit), 10) || defaultLimit),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export type Paginated<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

export function paginated<T>(data: T[], total: number, p: PageParams): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(total / p.limit));
  return {
    data,
    pagination: {
      page: p.page,
      limit: p.limit,
      total,
      totalPages,
      hasNext: p.page < totalPages,
      hasPrevious: p.page > 1,
    },
  };
}
