import { requireAdminApi } from "@/lib/auth/session";
import { ApiError, api } from "@/lib/http";
import { restoreAboutUsItem } from "@/services/about-us";

type AboutUsItemCtx = { params: Promise<{ kind: string; id: string }> };

export const POST = api<AboutUsItemCtx>(async (_request, { params }) => {
  await requireAdminApi();
  const { kind: value, id } = await params;
  const kind = (["principle", "legacy-stat", "why-choose-card"] as const).find(
    (candidate) => candidate === value,
  );
  if (!kind) throw new ApiError(404, "About Us item not found");
  return restoreAboutUsItem(kind, id);
});
