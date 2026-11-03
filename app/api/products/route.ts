import { api } from "@/lib/http";
import { parsePagination } from "@/lib/pagination";
import { listProducts, parseFilters } from "@/services/product";

export const GET = api(async (req) => {
  const sp = new URL(req.url).searchParams;
  return listProducts(parseFilters(sp), parsePagination(sp));
});
