import { api, readJson } from "@/lib/http";
import { parsePagination } from "@/lib/pagination";
import { requireAdminApi } from "@/lib/auth/session";
import { productInputSchema } from "@/lib/validation";
import { createProduct, listProducts, parseFilters } from "@/services/product";

export const GET = api(async (req) => {
  await requireAdminApi();
  const sp = new URL(req.url).searchParams;
  return listProducts({ ...parseFilters(sp), includeInactive: true }, parsePagination(sp, 20));
});

export const POST = api(async (req) => {
  await requireAdminApi();
  const input = productInputSchema.parse(await readJson(req));
  return Response.json(await createProduct(input), { status: 201 });
});
