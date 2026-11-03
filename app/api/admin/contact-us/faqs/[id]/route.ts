import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { contactFaqSchema } from "@/lib/validation";
import { deleteContactFaq, updateContactFaq } from "@/services/contact";

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  const input = contactFaqSchema.parse(await readJson(req));
  return updateContactFaq((await params).id, input);
});

export const DELETE = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  await deleteContactFaq((await params).id);
});
