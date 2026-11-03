import { api, readJson } from "@/lib/http";
import { startSession } from "@/lib/auth/session";
import { adminLoginSchema } from "@/lib/validation";
import { verifyAdminLogin } from "@/services/auth";

export const POST = api(async (req) => {
  const { username, password } = adminLoginSchema.parse(await readJson(req));
  await startSession(await verifyAdminLogin(username, password));
  return { ok: true };
});
