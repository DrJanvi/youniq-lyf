import { api, ApiError } from "@/lib/http";
import { listByTag } from "@/services/product";

// e.g. /api/products/featured?tag=best-selling&limit=6 | tag=new-release | any custom tag slug
export const GET = api(async (req) => {
  const sp = new URL(req.url).searchParams;
  const tag = sp.get("tag");
  if (!tag) throw new ApiError(400, "tag is required");
  return { data: await listByTag(tag, parseInt(sp.get("limit") ?? "6", 10) || 6) };
});
