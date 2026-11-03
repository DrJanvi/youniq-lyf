import { api, readJson, ApiError } from "@/lib/http";
import { parsePagination } from "@/lib/pagination";
import { requireUserApi } from "@/lib/auth/session";
import { wishlistItemSchema } from "@/lib/validation";
import {
  addToWishlist,
  clearWishlist,
  listWishlist,
  removeFromWishlist,
  wishlistIds,
} from "@/services/wishlist";

export const GET = api(async (req) => {
  const user = await requireUserApi();
  const sp = new URL(req.url).searchParams;
  if (sp.get("idsOnly") === "true") return { ids: await wishlistIds(user.id) };
  return listWishlist(user.id, parsePagination(sp));
});

export const POST = api(async (req) => {
  const user = await requireUserApi();
  const { productId } = wishlistItemSchema.parse(await readJson(req));
  await addToWishlist(user.id, productId);
});

export const DELETE = api(async (req) => {
  const user = await requireUserApi();
  const searchParams = new URL(req.url).searchParams;
  if (searchParams.get("clear") === "true") {
    await clearWishlist(user.id);
    return;
  }
  const productId = searchParams.get("productId");
  if (!productId) throw new ApiError(400, "productId is required");
  await removeFromWishlist(user.id, productId);
});
