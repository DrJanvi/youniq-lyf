import { api, readJson } from "@/lib/http";
import { startSession } from "@/lib/auth/session";
import { customerLoginSchema } from "@/lib/validation";
import { verifyCustomerLogin } from "@/services/auth";

export const POST = api(async (req) => {
  const { email, password } = customerLoginSchema.parse(await readJson(req));
  const user = await verifyCustomerLogin(email, password);
  await startSession(user);
  return {
    user: { id: user.id, email: user.email },
    recovered: user.recovered,
  };
});
