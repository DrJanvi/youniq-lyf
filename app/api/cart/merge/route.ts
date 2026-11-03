import { api, readJson } from "@/lib/http";
import { requireUserApi } from "@/lib/auth/session";
import { cartMergeSchema } from "@/lib/validation";
import { mergeCart } from "@/services/cart";

export const POST = api(async (req) => {
  const user = await requireUserApi();
  const { items } = cartMergeSchema.parse(await readJson(req));
  return mergeCart(user.id, items);
});
