import { api, readJson } from "@/lib/http";
import { parsePagination } from "@/lib/pagination";
import { requireUserApi } from "@/lib/auth/session";
import { checkoutSchema } from "@/lib/validation";
import { checkout, listUserOrders } from "@/services/order";

export const GET = api(async (req) => {
  const user = await requireUserApi();
  return listUserOrders(user.id, parsePagination(new URL(req.url).searchParams));
});

export const POST = api(async (req) => {
  const user = await requireUserApi();
  const input = checkoutSchema.parse(await readJson(req));
  return Response.json(await checkout(user.id, input), { status: 201 });
});
