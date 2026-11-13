import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { StorefrontLink as Link } from "@/components/layout/StorefrontLink";
import { AccountShell } from "@/components/shop/AccountShell";
import {
  formatOrderDate,
  formatOrderNumber,
  OrderItemThumbnail,
  OrderStatusBadge,
  type CustomerOrder,
} from "@/components/shop/OrderPresentation";
import { Pagination } from "@/components/ui/Pagination";
import { formatMoney } from "@/components/ui/PriceTag";
import { requireUserPage } from "@/lib/auth/session";
import { parsePagination } from "@/lib/pagination";
import { buildMetadata } from "@/lib/seo";
import { listUserOrders } from "@/services/order";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "Your orders", path: "/orders", noindex: true });

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUserPage("/orders");
  const result = await listUserOrders(user.id, parsePagination(await searchParams, 10));
  return (
    <AccountShell active="orders">
      <section className="space-y-3">
        <h2 className="rounded-lg bg-surface-card px-4 py-3 text-sm font-medium text-text-primary">
          My Orders
        </h2>
        <div className="flex flex-col gap-3">
          {result.data.length ? (
            result.data.map((order: CustomerOrder) => (
              <article
                key={order.id}
                className="rounded-xl bg-surface-main p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-sans text-lg font-semibold text-brand-primary">
                      Order #{formatOrderNumber(order.id)}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      Placed on {formatOrderDate(order.createdAt)} · Total{" "}
                      {formatMoney(order.total, order.currency)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="mt-4 flex flex-col gap-4 border-t border-surface-border pt-4 sm:flex-row sm:items-end sm:justify-between">
                  {order.items[0] ? (
                    <div className="flex min-w-0 items-center gap-3 sm:flex-1 sm:gap-4">
                      <OrderItemThumbnail item={order.items[0]} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="font-cormorant line-clamp-2 text-base font-semibold text-text-primary">
                          {order.items[0].title}
                        </p>
                        {order.items[0].variantName ? (
                          <p className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                            <span
                              aria-hidden="true"
                              className="size-3 rounded-full border border-surface-border"
                              style={{
                                backgroundColor:
                                  order.items[0].variantColor ?? undefined,
                              }}
                            />
                            Color: {order.items[0].variantName}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm text-text-muted">
                          Qty: {order.items[0].quantity}
                          {order.items.length > 1
                            ? ` · and ${order.items.length - 1} more ${
                                order.items.length - 1 === 1 ? "item" : "items"
                              }`
                            : ""}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-text-primary">
                          {formatMoney(
                            order.items[0].unitPrice * order.items[0].quantity,
                            order.currency,
                          )}
                        </p>
                        {order.deliveryPartner ? (
                          <p className="mt-1 text-xs text-text-muted">
                            {order.deliveryPartner}
                            {order.deliveryReferenceId
                              ? ` · Reference: ${order.deliveryReferenceId}`
                              : ""}
                          </p>
                        ) : null}
                        {order.deliveryTrackingUrl ? (
                          <a
                            href={order.deliveryTrackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs text-brand-primary-dark underline"
                          >
                            Track delivery
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">
                      No items are available for this order.
                    </p>
                  )}
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-full border border-brand-primary px-4 py-2 text-xs font-medium text-brand-primary-dark transition-colors hover:bg-brand-primary/10 sm:self-auto"
                  >
                    View Order Details
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl bg-surface-main px-5 py-10 text-center">
              <p className="text-sm text-text-muted">You have no orders yet.</p>
              <Link href="/products" className="mt-4 inline-block text-sm text-brand-primary-dark underline">
                Continue shopping
              </Link>
            </div>
          )}
        </div>
        <Pagination
          basePath="/orders"
          page={result.pagination.page}
          totalPages={result.pagination.totalPages}
        />
      </section>
    </AccountShell>
  );
}
