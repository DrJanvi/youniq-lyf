import { api, readJson } from "@/lib/http";
import { contactSubmissionSchema } from "@/lib/validation";
import { createContactSubmission } from "@/services/contact";

export const POST = api(async (req) => {
  const input = contactSubmissionSchema.parse(await readJson(req));
  return Response.json(await createContactSubmission(input), { status: 201 });
});
