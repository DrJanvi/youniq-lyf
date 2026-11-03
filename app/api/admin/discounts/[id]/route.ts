import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { discountInputSchema } from "@/lib/validation";
import { deleteDiscount, updateDiscount } from "@/services/discount";

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  return updateDiscount((await params).id, discountInputSchema.parse(await readJson(req)));
});

export const DELETE = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  await deleteDiscount((await params).id);
});
