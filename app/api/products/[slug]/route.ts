import { api, ApiError } from "@/lib/http";
import { getProductBySlug } from "@/services/product";

export const GET = api<{ params: Promise<{ slug: string }> }>(async (_req, { params }) => {
  const product = await getProductBySlug((await params).slug);
  if (!product) throw new ApiError(404, "Product not found");
  return product;
});
