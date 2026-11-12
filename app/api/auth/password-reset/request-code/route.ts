import { api, readJson } from "@/lib/http";
import { passwordResetRequestSchema } from "@/lib/validation";
import { requestCustomerPasswordResetCode } from "@/services/auth";

export const POST = api(async (req) => {
  const { email } = passwordResetRequestSchema.parse(await readJson(req));
  return requestCustomerPasswordResetCode(email);
});
