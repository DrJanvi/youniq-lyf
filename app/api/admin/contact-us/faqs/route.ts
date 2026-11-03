import { api, readJson } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { contactFaqSchema } from "@/lib/validation";
import { createContactFaq, listContactFaqs } from "@/services/contact";

export const GET = api(async () => {
  await requireAdminApi();
  return { data: await listContactFaqs() };
});

export const POST = api(async (req) => {
  await requireAdminApi();
  const input = contactFaqSchema.parse(await readJson(req));
  return Response.json(await createContactFaq(input), { status: 201 });
});
