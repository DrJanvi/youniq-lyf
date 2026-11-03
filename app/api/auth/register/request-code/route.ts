import { api, readJson } from "@/lib/http";
import { registerSchema } from "@/lib/validation";
import { requestRegistrationCode } from "@/services/auth";

export const POST = api(async (req) => {
  const { email } = registerSchema.parse(await readJson(req));
  await requestRegistrationCode(email);
  return { ok: true };
});
