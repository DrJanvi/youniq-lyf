import { api, readJson } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { highlightedCategorySchema } from "@/lib/validation";
import { saveHighlightedCategorySetting } from "@/services/highlighted-category";

export const PATCH = api(async (req) => {
  await requireAdminApi();
  const input = highlightedCategorySchema.parse(await readJson(req));
  return saveHighlightedCategorySetting(input);
});
