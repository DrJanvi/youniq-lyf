import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { PageHeader } from "@/components/shop/PageHeader";
import { Section } from "@/components/ui/Section";
import { requireUserPage } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";
import { listSavedAddresses } from "@/services/address";
import { getCart } from "@/services/cart";

export const instant = false;

export const metadata: Metadata = buildMetadata({
  title: "Checkout",
  path: "/checkout",
  noindex: true,
});

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ coupon?: string | string[] }>;
}) {
  const user = await requireUserPage("/checkout");
  const params = await searchParams;
  const initialCouponCode = Array.isArray(params.coupon) ? params.coupon[0] : params.coupon;
  const [cart, addresses] = await Promise.all([
    getCart(user.id),
    listSavedAddresses(user.id),
  ]);
  if (!cart.items.length) redirect("/cart");

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Checkout"
        description="Complete your order with a seamless and secure checkout experience."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Cart", href: "/cart" },
          { name: "Checkout", href: "/checkout" },
        ]}
      />
      <Section as="main" className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <CheckoutForm
          addresses={addresses}
          cart={cart}
          customerEmail={user.email}
          customerName={user.name}
          initialCouponCode={initialCouponCode}
        />
      </Section>
    </div>
  );
}
