import { SearchBar } from "@/components/shop/SearchBar";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartCount } from "@/services/cart";
import { listTaxonomy } from "@/services/taxonomy";
import { getWishlistCount } from "@/services/wishlist";
import { listAnnouncements } from "@/services/announcement";
import { AnnouncementBar } from "../ui/AnnouncementBar";
import { AuthItems } from "./AuthItems";
import { HeaderShell } from "./HeaderShell";

async function HeaderContent() {
  const [categories, user] = await Promise.all([
    listTaxonomy("category"),
    getCurrentUser(),
  ]);
  const [cartCount, wishlistCount] = user
    ? await Promise.all([getCartCount(user.id), getWishlistCount(user.id)])
    : [0, 0];

  return (
    <HeaderShell
      categories={categories.map(({ id, name, slug }) => ({ id, name, slug }))}
      auth={
        <AuthItems
          currentUser={user}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
        />
      }
      search={<SearchBar />}
      wishlistCount={wishlistCount}
    />
  );
}

export async function Header() {
  const announcements = await listAnnouncements();
  return (
    <>
      <AnnouncementBar
        announcements={announcements.map(({ id, message, link }) => ({
          id,
          message,
          link,
        }))}
      />
      <HeaderContent />
    </>
  );
}
