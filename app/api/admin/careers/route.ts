import { requireAdminApi } from "@/lib/auth/session";
import { api, readJson } from "@/lib/http";
import { careerPageSettingSchema } from "@/lib/validation";
import {
  getCareerPageSettings,
  saveCareerPageSettings,
} from "@/services/career";

export const GET = api(async () => {
  await requireAdminApi();
  return getCareerPageSettings();
});

export const PATCH = api(async (request) => {
  await requireAdminApi();
  const input = careerPageSettingSchema.parse(await readJson(request));
  await saveCareerPageSettings(input);
  return { ok: true };
});
