import { api } from "@/lib/http";
import { requireUserApi } from "@/lib/auth/session";
import {
  moveWishlistItemToCart,
  moveWishlistToCart,
} from "@/services/wishlist";

export const POST = api(async (req) => {
  const user = await requireUserApi();
  const productId = new URL(req.url).searchParams.get("productId");
  if (productId) return moveWishlistItemToCart(user.id, productId);
  return moveWishlistToCart(user.id);
});
