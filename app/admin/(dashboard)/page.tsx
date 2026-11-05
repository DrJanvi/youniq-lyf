import { ActivityChart } from "@/components/admin/common/ActivityChart";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { formatMoney } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  MessageSquare,
  Package,
  ShoppingCart,
  Star,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

export const instant = false;

const DAY = 86_400_000;

function Stat({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-28 flex-col justify-between rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-white"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </span>
      <span className="flex items-end justify-between gap-2">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        <ArrowUpRight className="mb-1 size-4 text-muted-foreground transition-colors group-hover:text-primary" />
      </span>
    </Link>
  );
}

export default async function AdminOverviewPage() {
  const admin = await requireAdminPage();
  const since = new Date(new Date().getTime() - 6 * DAY);
  since.setHours(0, 0, 0, 0);
  const [
    products,
    pendingOrders,
    pendingReviews,
    lowStock,
    unreadContactMessages,
    recent,
    weekOrders,
    top,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.review.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.product.count({ where: { stock: { lte: 5 }, isActive: true, deletedAt: null } }),
    prisma.contactSubmission.count({ where: { readAt: null } }),
    prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { email: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: since }, deletedAt: null },
      select: { createdAt: true },
    }),
    prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: [{ soldCount: "desc" }, { id: "asc" }],
      take: 4,
      select: {
        id: true,
        title: true,
        soldCount: true,
        images: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  const days = Array.from(
    { length: 7 },
    (_, i) => new Date(since.getTime() + i * DAY),
  );
  const points = days.map((d) => ({
    label: d.toLocaleDateString("en", { weekday: "short" }),
    value: weekOrders.filter(
      (o) => o.createdAt.toDateString() === d.toDateString(),
    ).length,
  }));
  const totalSold = Math.max(
    1,
    top.reduce((n, p) => n + p.soldCount, 0),
  );
  const firstName = (admin.name ?? admin.username ?? "there").split(" ")[0];
  const pendingWork = pendingOrders + pendingReviews;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Store management
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {firstName}.{" "}
            {pendingWork > 0
              ? `${pendingOrders} orders and ${pendingReviews} reviews are waiting for review.`
              : "You're all caught up."}
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link
            href={
              pendingOrders
                ? "/admin/orders?status=PENDING"
                : "/admin/products/new"
            }
          >
            {pendingOrders ? "Review orders" : "Add product"} <ArrowRight />
          </Link>
        </Button>
      </header>

      <section
        aria-label="Store summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        <Stat
          label="Products"
          value={products}
          href="/admin/products"
          icon={Package}
        />
        <Stat
          label="Pending orders"
          value={pendingOrders}
          href="/admin/orders?status=PENDING"
          icon={ShoppingCart}
        />
        <Stat
          label="Pending reviews"
          value={pendingReviews}
          href="/admin/reviews?status=PENDING"
          icon={Star}
        />
        <Stat
          label="Low stock"
          value={lowStock}
          href="/admin/products?sort=stock&dir=asc"
          icon={AlertTriangle}
        />
        <Stat
          label="Unread messages"
          value={unreadContactMessages}
          href="/admin/contact-us?section=messages&read=unread"
          icon={MessageSquare}
        />
      </section>

      <div className="grid w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
        <Card className="min-w-0 gap-4">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-semibold">Orders activity</h2>
              <CardDescription className="mt-1">
                Order volume over the last seven days
              </CardDescription>
            </div>
            <span className="shrink-0 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Last 7 days
            </span>
          </CardHeader>
          <CardContent className="min-w-0">
            <ActivityChart points={points} unit="orders" />
          </CardContent>
        </Card>

        <Card className="min-w-0 gap-4">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Top products</h2>
              <CardDescription className="mt-1">
                Best sellers by units sold
              </CardDescription>
            </div>
            <Link
              href="/admin/products?sort=soldCount&dir=desc"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent className="min-w-0">
            {top.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {top.map((product) => {
                  const percentage = Math.round(
                    (product.soldCount / totalSold) * 100,
                  );
                  return (
                    <li key={product.id}>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex items-center gap-3"
                      >
                        {Array.isArray(product.images) &&
                        typeof product.images[0] === "string" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt=""
                            className="size-10 shrink-0 rounded-md border border-border object-cover"
                          />
                        ) : (
                          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                            <Package className="size-4" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {product.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {product.category.name}
                          </span>
                          <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted">
                            <span
                              className="block h-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            />
                          </span>
                        </span>
                        <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums">
                          {percentage}%
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-6 text-sm text-muted-foreground">
                No products to show yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Recent orders</h2>
            <CardDescription className="mt-1">
              The latest orders placed in your store
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">
              All orders <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        {recent.length > 0 ? (
          <ul className="divide-y divide-border">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="grid gap-3 px-6 py-3 transition-colors hover:bg-muted/60 sm:grid-cols-[minmax(0,1fr)_7rem_8rem_auto] sm:items-center"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {order.shippingName ?? order.user.email}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {order.user.email}
                    </span>
                  </span>
                  <time className="text-xs text-muted-foreground sm:text-sm">
                    {order.createdAt.toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatMoney(Number(order.total), order.currency)}
                  </span>
                  <StatusBadge status={order.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <CardContent>
            <p className="py-4 text-sm text-muted-foreground">
              No orders yet.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
