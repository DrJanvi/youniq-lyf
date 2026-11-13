import { requireAdminApi } from "@/lib/auth/session";
import { api, readJson, type IdCtx } from "@/lib/http";
import { announcementSchema } from "@/lib/validation";
import {
  deleteAnnouncement,
  restoreAnnouncement,
  updateAnnouncement,
} from "@/services/announcement";

export const PATCH = api<IdCtx>(async (request, { params }) => {
  await requireAdminApi();
  const input = announcementSchema.parse(await readJson(request));
  return updateAnnouncement((await params).id, input);
});

export const DELETE = api<IdCtx>(async (_request, { params }) => {
  await requireAdminApi();
  return deleteAnnouncement((await params).id);
});

export const POST = api<IdCtx>(async (_request, { params }) => {
  await requireAdminApi();
  return restoreAnnouncement((await params).id);
});
