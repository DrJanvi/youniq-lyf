import { requireAdminApi } from "@/lib/auth/session";
import { api, readJson } from "@/lib/http";
import { policyPageContentSchema } from "@/lib/validation";
import { savePolicyPageContent } from "@/services/policy-pages";

type PolicyPageContext = { params: Promise<{ slug: string }> };

export const PATCH = api<PolicyPageContext>(async (request, { params }) => {
  await requireAdminApi();
  const { slug } = await params;
  const input = policyPageContentSchema.parse(await readJson(request));
  return savePolicyPageContent(slug, input.content);
});
