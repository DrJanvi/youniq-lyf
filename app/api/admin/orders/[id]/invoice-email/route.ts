import { api, ApiError, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { retryInvoiceEmail } from "@/services/invoice";

export const POST = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  const result = await retryInvoiceEmail((await params).id);
  if (result.emailStatus !== "SENT") {
    throw new ApiError(502, result.error ?? "Invoice email delivery failed");
  }
  return result;
});
