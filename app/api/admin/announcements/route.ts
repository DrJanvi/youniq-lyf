import { requireAdminApi } from "@/lib/auth/session";
import { api, readJson } from "@/lib/http";
import { announcementSchema } from "@/lib/validation";
import { createAnnouncement, listAnnouncements } from "@/services/announcement";

export const GET = api(async () => {
  await requireAdminApi();
  return { data: await listAnnouncements() };
});

export const POST = api(async (request) => {
  await requireAdminApi();
  const input = announcementSchema.parse(await readJson(request));
  return Response.json(await createAnnouncement(input), { status: 201 });
});
