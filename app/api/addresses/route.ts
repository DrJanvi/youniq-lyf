import { requireUserApi } from "@/lib/auth/session";
import { api, readJson } from "@/lib/http";
import { savedAddressSchema } from "@/lib/validation";
import { createSavedAddress, listSavedAddresses } from "@/services/address";

export const GET = api(async () => {
  const user = await requireUserApi();
  return listSavedAddresses(user.id);
});

export const POST = api(async (req) => {
  const user = await requireUserApi();
  const input = savedAddressSchema.parse(await readJson(req));
  return Response.json(await createSavedAddress(user.id, input), { status: 201 });
});
