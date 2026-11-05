import { api, readJson } from "@/lib/http";
import { endSession, requireUserApi } from "@/lib/auth/session";
import { accountDetailsSchema, deleteAccountSchema } from "@/lib/validation";
import { scheduleCustomerDeletion } from "@/services/auth";
import { updateCustomerProfile } from "@/services/customer-profile";

export const PATCH = api(async (req) => {
  const user = await requireUserApi();
  const input = accountDetailsSchema.parse(await readJson(req));
  return updateCustomerProfile(user.id, input);
});

export const DELETE = api(async (req) => {
  const user = await requireUserApi();
  const { currentPassword } = deleteAccountSchema.parse(await readJson(req));
  const result = await scheduleCustomerDeletion(user.id, currentPassword);
  await endSession("customer");
  return result;
});
