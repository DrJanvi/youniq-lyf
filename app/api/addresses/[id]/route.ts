import { requireUserApi } from "@/lib/auth/session";
import { api, readJson, type IdCtx } from "@/lib/http";
import { savedAddressSchema } from "@/lib/validation";
import { updateSavedAddress } from "@/services/address";

export const PATCH = api(async (req, ctx: IdCtx) => {
  const user = await requireUserApi();
  const { id } = await ctx.params;
  const input = savedAddressSchema.parse(await readJson(req));
  return updateSavedAddress(user.id, id, input);
});
