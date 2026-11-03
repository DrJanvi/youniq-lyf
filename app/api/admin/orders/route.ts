import { api } from "@/lib/http";
import { parsePagination } from "@/lib/pagination";
import { requireAdminApi } from "@/lib/auth/session";
import { listOrdersAdmin } from "@/services/order";
import type { OrderStatus } from "@prisma/client";

export const GET = api(async (req) => {
  await requireAdminApi();
  const sp = new URL(req.url).searchParams;
  const status = sp.get("status");
  const valid = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "DISPATCHED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "DELIVERY_ATTEMPT_FAILED",
  ].includes(status ?? "");
  return listOrdersAdmin(parsePagination(sp, 20), valid ? (status as OrderStatus) : undefined);
});
