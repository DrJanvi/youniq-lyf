import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { contactLocationSchema } from "@/lib/validation";
import { deleteContactLocation, updateContactLocation } from "@/services/contact";

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  const input = contactLocationSchema.parse(await readJson(req));
  return updateContactLocation((await params).id, input);
});

export const DELETE = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  await deleteContactLocation((await params).id);
});
