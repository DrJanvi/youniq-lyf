import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { heroBannerSchema } from "@/lib/validation";
import { deleteHeroBanner, updateHeroBanner } from "@/services/hero-banner";

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  const input = heroBannerSchema.parse(await readJson(req));
  return updateHeroBanner((await params).id, input);
});

export const DELETE = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  await deleteHeroBanner((await params).id);
});
