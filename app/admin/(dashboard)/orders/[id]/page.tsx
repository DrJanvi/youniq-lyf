import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/common/DeleteButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { OrderDecision } from "@/components/admin/forms/OrderDecision";
import { OrderDeliveryActions } from "@/components/admin/forms/OrderDeliveryActions";
import { InvoiceEmailRetry } from "@/components/admin/forms/InvoiceEmailRetry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { formatDateTime, formatMoney } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/auth/session";
import { formatInvoiceNumber } from "@/lib/invoice/number";
import { paymentMethodLabels } from "@/lib/order-status";
import { getOrderAdmin } from "@/services/order";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const order = await getOrderAdmin((await params).id);
  if (!order) notFound();
  const money = (n: number) => formatMoney(n, order.currency);
  const invoice = order.invoice;
  const retryInvoiceEmail = invoice && invoice.emailStatus !== "SENT";
  return (
    <>
      <PageHeader
        title={`Order #${order.id.slice(0, 8)}`}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        backHref="/admin/orders"
        actions={
          <>
            <StatusBadge status={order.status} />
            {order.status === "PENDING" ? <OrderDecision orderId={order.id} /> : null}
            <OrderDeliveryActions orderId={order.id} status={order.status} />
            {order.status === "PENDING" || order.status === "REJECTED" ? (
              <DeleteButton url={`/api/admin/orders/${order.id}`} itemName="order" redirectTo="/admin/orders" />
            ) : null}
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>
                        <p className="font-medium">{i.title}</p>
                        {i.variantName ? (
                          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span
                              aria-hidden="true"
                              className="size-3 rounded-full border border-border"
                              style={{
                                backgroundColor: i.variantColor ?? undefined,
                              }}
                            />
                            Color: {i.variantName}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(i.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {i.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {money(i.unitPrice * i.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <dl className="mt-4 ml-auto grid max-w-xs grid-cols-2 gap-1 text-sm">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-right">{money(order.subtotal)}</dd>
              <dt className="text-muted-foreground">Automatic discounts</dt>
              <dd className="text-right">-{money(Math.max(0, order.discountTotal - order.couponDiscount))}</dd>
              {order.couponCode ? (
                <>
                  <dt className="text-muted-foreground">Coupon ({order.couponCode})</dt>
                  <dd className="text-right">-{money(order.couponDiscount)}</dd>
                </>
              ) : null}
              <dt className="text-muted-foreground">Total discounts</dt>
              <dd className="text-right">-{money(order.discountTotal)}</dd>
              <dt className="font-medium">Total</dt>
              <dd className="text-right font-medium">{money(order.total)}</dd>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="font-medium">{order.shippingName ?? "—"}</p>
            <p>{order.user.email}</p>
            <p>{order.shippingPhone ?? "—"}</p>
            <p className="whitespace-pre-line text-muted-foreground">{order.shippingAddress ?? "—"}</p>
            <p className="mt-2">
              <span className="font-medium">Payment: </span>
              {paymentMethodLabels[order.paymentMethod]}
            </p>
            <p className="text-xs text-muted-foreground">Mock checkout; no payment was processed.</p>
            {order.adminNote ? (
              <p className="mt-3 rounded-md bg-muted p-2">
                <span className="font-medium">Admin note: </span>
                {order.adminNote}
              </p>
            ) : null}
            {order.deliveryPartner || order.deliveryReferenceId || order.deliveryTrackingUrl ? (
              <div className="mt-3 rounded-md bg-muted p-2">
                <p className="font-medium">Delivery tracking</p>
                {order.deliveryPartner ? <p>Partner: {order.deliveryPartner}</p> : null}
                {order.deliveryReferenceId ? <p>Reference ID: {order.deliveryReferenceId}</p> : null}
                {order.deliveryTrackingUrl ? (
                  <a href={order.deliveryTrackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Open tracking link
                  </a>
                ) : null}
              </div>
            ) : null}
            {invoice ? (
              <div className="mt-3 rounded-md bg-muted p-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">Invoice {formatInvoiceNumber(invoice.sequence)}</p>
                  <StatusBadge status={invoice.emailStatus} />
                </div>
                <p className="mt-1">Email: {invoice.recipientEmail ?? order.user.email ?? "Not provided"}</p>
                {invoice.sentAt ? <p>Sent: {formatDateTime(invoice.sentAt)}</p> : null}
                <p>Attempts: {invoice.emailAttempts}</p>
                {invoice.lastError ? (
                  <p className="mt-1 whitespace-pre-line text-destructive">{invoice.lastError}</p>
                ) : null}
                {retryInvoiceEmail ? (
                  <div className="mt-2">
                    <InvoiceEmailRetry orderId={order.id} />
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">No invoice was issued for this order.</p>
            )}
          </CardContent>
        </Card>
      </div>
      {order.deliveryAttempts.length ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Delivery activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {order.deliveryAttempts.map((attempt) => (
              <div key={attempt.id} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={attempt.outcome} />
                  <time className="text-muted-foreground">{formatDateTime(attempt.createdAt)}</time>
                </div>
                {attempt.notes ? <p className="mt-2 whitespace-pre-line">{attempt.notes}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
