import { api, readJson } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { heroBannerSchema } from "@/lib/validation";
import { createHeroBanner, listHeroBanners } from "@/services/hero-banner";

export const GET = api(async () => {
  await requireAdminApi();
  return { data: await listHeroBanners() };
});

export const POST = api(async (req) => {
  await requireAdminApi();
  const input = heroBannerSchema.parse(await readJson(req));
  return Response.json(await createHeroBanner(input), { status: 201 });
});
