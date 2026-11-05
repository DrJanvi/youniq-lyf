import { requireUserApi } from "@/lib/auth/session";
import { api, readJson } from "@/lib/http";
import { changePasswordSchema } from "@/lib/validation";
import { changeCustomerPassword } from "@/services/auth";

export const PATCH = api(async (req) => {
  const user = await requireUserApi();
  const input = changePasswordSchema.parse(await readJson(req));
  return changeCustomerPassword(
    user.id,
    input.currentPassword,
    input.newPassword,
  );
});
