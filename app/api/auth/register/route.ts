import { api, readJson } from "@/lib/http";
import { startSession } from "@/lib/auth/session";
import { registerVerifySchema } from "@/lib/validation";
import { registerCustomer } from "@/services/auth";

export const POST = api(async (req) => {
  const user = await registerCustomer(registerVerifySchema.parse(await readJson(req)));
  await startSession(user);
  return { user: { id: user.id, email: user.email } };
});
