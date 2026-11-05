import { api, readJson, ApiError, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { productUpdateSchema } from "@/lib/validation";
import { deleteProduct, getProductById, restoreProduct, updateProduct } from "@/services/product";

export const GET = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  const p = await getProductById((await params).id);
  if (!p) throw new ApiError(404, "Product not found");
  return p;
});

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  return updateProduct((await params).id, productUpdateSchema.parse(await readJson(req)));
});

export const DELETE = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  return deleteProduct((await params).id);
});

export const POST = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  return restoreProduct((await params).id);
});
