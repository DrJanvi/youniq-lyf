import { api, readJson } from "@/lib/http";
import { passwordResetSchema } from "@/lib/validation";
import { resetCustomerPassword } from "@/services/auth";

export const POST = api(async (req) => {
  const { email, code, newPassword } = passwordResetSchema.parse(
    await readJson(req),
  );
  return resetCustomerPassword({ email, code, newPassword });
});
