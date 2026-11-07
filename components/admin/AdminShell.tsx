"use client";

import { Button } from "@/components/admin/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/admin/ui/sheet";
import { apiFetch } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import {
  Boxes,
  BriefcaseBusiness,
  CloudUpload,
  ContactRound,
  ExternalLink,
  FileText,
  FolderTree,
  Handshake,
  ImageIcon,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  MessageSquareText,
  Package,
  Percent,
  ScrollText,
  ShoppingCart,
  Tag,
  Tags,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/import/shopify", label: "Shopify import", icon: CloudUpload },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/product-types", label: "Product types", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/about-us", label: "About Us", icon: Info },
  { href: "/admin/policies", label: "Policies", icon: ScrollText },
  { href: "/admin/contact-us", label: "Contact Us", icon: ContactRound },
  {
    href: "/admin/partner-requests",
    label: "Partner Request",
    icon: Handshake,
  },
  { href: "/admin/careers", label: "Careers", icon: BriefcaseBusiness },
  { href: "/admin/faqs", label: "FAQs", icon: MessageSquareText },
  { href: "/admin/discounts", label: "Discounts", icon: Percent },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/hero-banners", label: "Hero banners", icon: ImageIcon },
  {
    href: "/admin/highlighted-category",
    label: "Highlighted category",
    icon: Timer,
  },
  {
    href: "/admin/highlighted-posts",
    label: "Highlighted posts",
    icon: ImageIcon,
  },
  { href: "/admin/blogs", label: "Blog articles", icon: FileText },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {nav.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
            )}
          >
            <Icon
              className={cn(
                "size-4",
                active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/80",
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="shrink-0 border-b border-white/10 px-4 py-5">
      <Link
        href="/admin"
        className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white"
      >
        <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-md">
          <Boxes className="size-4" />
        </span>
        Youniqlyf
        <span className="text-sidebar-foreground/80 ml-auto rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium tracking-wider uppercase">
          Admin
        </span>
      </Link>
    </div>
  );
}

function AdminFooter({
  name,
  onLogout,
}: {
  name: string;
  onLogout: () => void;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="shrink-0 border-t border-white/10 p-3">
      <div className="flex items-center gap-3 px-2 py-2">
        <span className="bg-sidebar-accent text-sidebar-accent-foreground grid size-9 shrink-0 place-items-center rounded-md text-sm font-semibold">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          <p className="text-sidebar-foreground/80 text-xs">
            Store administrator
          </p>
        </div>
      </div>
      <Link
        href="/"
        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
      >
        <ExternalLink className="size-4" />
        View storefront
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors"
      >
        <LogOut className="size-4" />
        Log out
      </button>
    </div>
  );
}

export function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    try {
      await apiFetch("/api/admin/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast.error("Could not log out. Please try again.");
    }
  }

  return (
    <div className="bg-canvas flex min-h-screen">
      <aside className="bg-sidebar text-sidebar-foreground sticky top-0 hidden h-screen w-64 shrink-0 flex-col self-start border-r border-white/10 lg:flex">
        <Brand />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
          <NavLinks />
        </div>
        <AdminFooter name={adminName} onLogout={logout} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="bg-sidebar text-sidebar-foreground flex h-full w-72 flex-col gap-0 border-r border-white/10 p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Admin navigation</SheetDescription>
          </SheetHeader>
          <Brand />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <AdminFooter name={adminName} onLogout={logout} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-card flex h-14 items-center gap-3 border-b px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <Link href="/admin" className="text-sm font-semibold tracking-tight">
            Youniqlyf Admin
          </Link>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
