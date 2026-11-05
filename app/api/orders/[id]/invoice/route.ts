import { api, type IdCtx } from "@/lib/http";
import { requireUserApi } from "@/lib/auth/session";
import { getInvoicePdfForUser } from "@/services/invoice";

export const GET = api<IdCtx>(async (_req, { params }) => {
  const user = await requireUserApi();
  const { pdf, filename } = await getInvoicePdfForUser((await params).id, user.id);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
});
