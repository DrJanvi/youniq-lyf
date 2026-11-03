import { CurrentUser } from "@/lib/auth/session";
import {
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { HeaderIconLink, HeaderIconLinkProps } from "./HeaderIconLink";

type Props = {
  currentUser: CurrentUser | null;
  cartCount?: number;
  wishlistCount?: number;
};

export function AuthItems({
  currentUser,
  cartCount = 0,
  wishlistCount = 0,
}: Props) {
  const actions: HeaderIconLinkProps[] = [
    {
      label: "Cart",
      icon: (
        <ShoppingCartIcon aria-hidden="true" className="size-6 lg:size-5" />
      ),
      href: "/cart",
      badge: cartCount,
    },
    {
      label: "Wishlist",
      icon: <HeartIcon aria-hidden="true" className="size-6 lg:size-5" />,
      href: "/wishlist",
      badge: wishlistCount,
      className: "hidden lg:flex",
    },
    {
      label: "Account",
      icon: <UserIcon aria-hidden="true" className="size-6 lg:size-5" />,
      href: currentUser ? "/account" : "/login",
      className: "hidden lg:flex",
    },
  ];

  return (
    <>
      {actions.map((action) => (
        <HeaderIconLink {...action} key={action.label} />
      ))}
    </>
  );
}
