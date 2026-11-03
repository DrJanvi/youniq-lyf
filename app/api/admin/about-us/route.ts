import { requireAdminApi } from "@/lib/auth/session";
import { api, readJson } from "@/lib/http";
import { aboutUsPageSettingSchema } from "@/lib/validation";
import {
  getAboutUsPageSettings,
  saveAboutUsPageSettings,
} from "@/services/about-us";

export const GET = api(async () => {
  await requireAdminApi();
  return getAboutUsPageSettings();
});

export const PATCH = api(async (request) => {
  await requireAdminApi();
  const input = aboutUsPageSettingSchema.parse(await readJson(request));
  return saveAboutUsPageSettings(input);
});
