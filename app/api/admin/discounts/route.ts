import { api, readJson } from "@/lib/http";
import { parsePagination } from "@/lib/pagination";
import { requireAdminApi } from "@/lib/auth/session";
import { discountInputSchema } from "@/lib/validation";
import { createDiscount, listDiscounts } from "@/services/discount";

export const GET = api(async (req) => {
  await requireAdminApi();
  return listDiscounts(parsePagination(new URL(req.url).searchParams, 20));
});

export const POST = api(async (req) => {
  await requireAdminApi();
  return Response.json(await createDiscount(discountInputSchema.parse(await readJson(req))), { status: 201 });
});
