import { api, readJson, ApiError } from "@/lib/http";
import { requireUserApi } from "@/lib/auth/session";
import { cartItemIdentitySchema, cartItemSchema } from "@/lib/validation";
import { clearCart, getCart, removeCartItem, setCartItem } from "@/services/cart";

export const GET = api(async () => getCart((await requireUserApi()).id));

// Sets the absolute quantity of a product in the cart.
export const POST = api(async (req) => {
  const user = await requireUserApi();
  const { productId, variantId, quantity } = cartItemSchema.parse(await readJson(req));
  return setCartItem(user.id, productId, quantity, variantId);
});

export const DELETE = api(async (req) => {
  const user = await requireUserApi();
  const searchParams = new URL(req.url).searchParams;
  const productId = searchParams.get("productId");
  if (searchParams.get("clear") === "true") {
    await clearCart(user.id);
    return;
  }
  if (!productId) throw new ApiError(400, "productId is required");
  const { variantId } = cartItemIdentitySchema.parse({
    productId,
    variantId: searchParams.get("variantId") ?? undefined,
  });
  return removeCartItem(user.id, productId, variantId);
});
