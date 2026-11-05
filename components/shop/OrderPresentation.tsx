import Image from "next/image";
import type { listUserOrders } from "@/services/order";

type UserOrdersPage = Awaited<ReturnType<typeof listUserOrders>>;
export type CustomerOrder = UserOrdersPage["data"][number];
export type CustomerOrderItem = CustomerOrder["items"][number];

const statusNames: Record<string, string> = {
  PENDING: "Placed",
  APPROVED: "Accepted",
  REJECTED: "Rejected",
  DISPATCHED: "Dispatched",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  DELIVERY_ATTEMPT_FAILED: "Delivery attempt failed",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-lime-50 text-lime-700 ring-lime-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  DISPATCHED: "bg-sky-50 text-sky-700 ring-sky-200",
  OUT_FOR_DELIVERY: "bg-sky-50 text-sky-700 ring-sky-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DELIVERY_ATTEMPT_FAILED: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
        statusStyles[status] ?? "bg-gray-100 text-gray-700 ring-gray-200"
      }`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusNames[status] ?? status}
    </span>
  );
}

export function OrderItemThumbnail({
  item,
  size = "md",
}: {
  item: CustomerOrderItem;
  size?: "sm" | "md";
}) {
  const images = item.product?.images;
  const image = Array.isArray(images) && typeof images[0] === "string" ? images[0] : null;
  const dimensions = size === "sm" ? 64 : 80;

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-[#f0eeed] bg-white ${
        size === "sm" ? "size-16" : "size-20"
      }`}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={dimensions}
          height={dimensions}
          unoptimized
          className="size-full object-contain p-2"
        />
      ) : (
        <span className="px-1 text-center text-[10px] text-text-muted">No image</span>
      )}
    </div>
  );
}

export function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatOrderNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}
