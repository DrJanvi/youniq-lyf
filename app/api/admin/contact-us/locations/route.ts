import { api, readJson } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { contactLocationSchema } from "@/lib/validation";
import { createContactLocation, listContactLocations } from "@/services/contact";

export const GET = api(async () => {
  await requireAdminApi();
  return { data: await listContactLocations() };
});

export const POST = api(async (req) => {
  await requireAdminApi();
  const input = contactLocationSchema.parse(await readJson(req));
  return Response.json(await createContactLocation(input), { status: 201 });
});
