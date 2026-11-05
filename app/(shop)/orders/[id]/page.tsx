import type { Metadata } from "next";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatOrderDate,
  formatOrderNumber,
  OrderItemThumbnail,
  OrderStatusBadge,
} from "@/components/shop/OrderPresentation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatMoney } from "@/components/ui/PriceTag";
import { requireUserPage } from "@/lib/auth/session";
import { formatInvoiceNumber } from "@/lib/invoice/number";
import { paymentMethodLabels } from "@/lib/order-status";
import { buildMetadata } from "@/lib/seo";
import { getUserOrder } from "@/services/order";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "Order details", path: "/orders", noindex: true });

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUserPage(`/orders/${id}`);
  const order = await getUserOrder(user.id, id);
  if (!order) notFound();

  const shippingAddress = order.shippingAddress
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <>
      <Breadcrumbs
        crumbs={[{ name: "Home", href: "/" }, { name: "My Account", href: "/account" }]}
        className="bg-surface-card"
      />
      <main className="bg-surface-card pb-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Orders
            </Link>
          </div>
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.9fr)]">
            <div className="flex min-w-0 flex-col gap-4">
              <section className="rounded-2xl bg-white p-3 sm:p-4">
                <h2 className="rounded-lg bg-surface-card px-4 py-3 text-sm font-medium text-text-primary">
                  Order Details
                </h2>
                <div className="mt-2 rounded-xl bg-surface-main p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-sans text-lg font-semibold text-brand-primary">
                        Order #{formatOrderNumber(order.id)}
                      </h3>
                      <p className="mt-1 text-sm text-text-muted">
                        Placed on {formatOrderDate(order.createdAt)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  {order.deliveryPartner ||
                  order.deliveryReferenceId ||
                  order.deliveryTrackingUrl ? (
                    <div className="mt-4 rounded-lg bg-white p-3 text-sm text-text-muted">
                      {order.deliveryPartner ? <p>{order.deliveryPartner}</p> : null}
                      {order.deliveryReferenceId ? (
                        <p>Reference: {order.deliveryReferenceId}</p>
                      ) : null}
                      {order.deliveryTrackingUrl ? (
                        <a
                          href={order.deliveryTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-brand-primary-dark underline"
                        >
                          Track delivery
                        </a>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-5 border-t border-surface-border pt-4">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Items in this order
                    </h3>
                    {order.items.length ? (
                      <ul className="mt-2 divide-y divide-surface-border">
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex min-w-0 items-center gap-3 py-3 sm:gap-4"
                          >
                            <OrderItemThumbnail item={item} />
                            <div className="min-w-0 flex-1">
                              <p className="font-cormorant line-clamp-2 text-base font-semibold text-text-primary">
                                {item.title}
                              </p>
                              <p className="mt-1 text-xs text-text-muted">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="shrink-0 text-sm font-medium text-text-primary">
                              {formatMoney(
                                item.unitPrice * item.quantity,
                                order.currency,
                              )}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-text-muted">
                        No items are available for this order.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-white p-4 sm:p-6">
                <h2 className="font-cormorant text-xl font-semibold tracking-[0.08em] text-text-primary uppercase sm:text-2xl">
                  Payment Information
                </h2>
                <dl className="mt-4 grid gap-4 rounded-xl bg-surface-main p-4 sm:grid-cols-2 sm:p-5">
                  <div>
                    <dt className="text-sm text-text-muted">Payment Method</dt>
                    <dd className="mt-1 text-sm font-medium text-text-primary">
                      {paymentMethodLabels[order.paymentMethod]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-text-muted">Order Status</dt>
                    <dd className="mt-1">
                      <OrderStatusBadge status={order.status} />
                    </dd>
                  </div>
                </dl>
              </section>
            </div>

            <aside className="flex flex-col gap-4">
              {order.invoice ? (
                <section className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
                  <h2 className="font-cormorant text-xl font-semibold tracking-[0.08em] text-text-primary uppercase sm:text-2xl">
                    Invoice
                  </h2>
                  <p className="mt-3 text-sm text-text-muted">
                    {formatInvoiceNumber(order.invoice.sequence)}
                  </p>
                  <a
                    href={`/api/orders/${order.id}/invoice`}
                    download
                    className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Download PDF
                  </a>
                </section>
              ) : null}
              <section className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
                <h2 className="font-cormorant text-xl font-semibold tracking-[0.08em] text-text-primary uppercase sm:text-2xl">
                  Order Summary
                </h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-text-muted">
                    <dt>Subtotal</dt>
                    <dd className="text-right text-text-primary">
                      {formatMoney(order.subtotal, order.currency)}
                    </dd>
                  </div>
                  {order.discountTotal > 0 ? (
                    <div className="flex justify-between gap-4 text-text-muted">
                      <dt>Discount</dt>
                      <dd className="text-right text-green-700">
                        −{formatMoney(order.discountTotal, order.currency)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="border-t border-surface-border pt-3">
                    <dt className="text-xs font-medium text-text-muted">Total</dt>
                    <dd className="mt-1 text-right text-2xl font-semibold text-text-primary">
                      {formatMoney(order.total, order.currency)}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
                <h2 className="font-cormorant text-xl font-semibold tracking-[0.08em] text-text-primary uppercase sm:text-2xl">
                  Shipping Address
                </h2>
                <address className="mt-3 space-y-1 text-sm not-italic text-text-muted">
                  {order.shippingName ? (
                    <p className="font-medium text-text-primary">{order.shippingName}</p>
                  ) : null}
                  {order.shippingPhone ? <p>{order.shippingPhone}</p> : null}
                  {shippingAddress?.length ? (
                    shippingAddress.map((line, index) => (
                      <p key={`${index}-${line}`}>{line}</p>
                    ))
                  ) : (
                    <p>Shipping address is not available.</p>
                  )}
                </address>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
