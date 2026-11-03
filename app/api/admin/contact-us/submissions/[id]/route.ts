import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { contactSubmissionReadSchema } from "@/lib/validation";
import { setContactSubmissionRead } from "@/services/contact";

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  const { read } = contactSubmissionReadSchema.parse(await readJson(req));
  return setContactSubmissionRead((await params).id, read);
});
