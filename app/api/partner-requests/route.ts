import { api, readJson } from "@/lib/http";
import { partnerRequestSchema } from "@/lib/validation";
import { createPartnerRequest } from "@/services/partner-request";

export const POST = api(async (req) => {
  const input = partnerRequestSchema.parse(await readJson(req));
  return Response.json(await createPartnerRequest(input), { status: 201 });
});
