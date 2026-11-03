import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { orderAdminUpdateSchema, orderDeliveryUpdateSchema } from "@/lib/validation";
import { decideOrder, deleteOrder, updateOrderDelivery } from "@/services/order";

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  const update = orderAdminUpdateSchema.parse(await readJson(req));
  const id = (await params).id;
  if (update.status === "APPROVED" || update.status === "REJECTED") {
    const adminNote = "adminNote" in update ? update.adminNote : undefined;
    return decideOrder(id, update.status, adminNote);
  }
  return updateOrderDelivery(id, orderDeliveryUpdateSchema.parse(update));
});

export const DELETE = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  await deleteOrder((await params).id);
});
