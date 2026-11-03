export type TableMeta = {
  total: number;
  page: number;
  totalPages: number;
  sort: string;
  dir: "asc" | "desc";
  q?: string;
};
