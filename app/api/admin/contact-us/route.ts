import { api, readJson } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { contactPageSettingSchema } from "@/lib/validation";
import { defaultContactSettings, saveContactPageSettings } from "@/services/contact";
import { prisma } from "@/lib/prisma";

export const GET = api(async () => {
  await requireAdminApi();
  const settings = await prisma.contactPageSetting.findUnique({ where: { id: "contact-us" } });
  return settings ?? defaultContactSettings;
});

export const PATCH = api(async (req) => {
  await requireAdminApi();
  const input = contactPageSettingSchema.parse(await readJson(req));
  return saveContactPageSettings(input);
});
