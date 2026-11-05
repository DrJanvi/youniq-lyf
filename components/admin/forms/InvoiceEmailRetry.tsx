"use client";

import { Button } from "@/components/admin/ui/button";
import { useAdminApi } from "@/components/admin/common/use-admin-api";

export function InvoiceEmailRetry({ orderId }: { orderId: string }) {
  const { request, pending } = useAdminApi();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        void request(`/api/admin/orders/${orderId}/invoice-email`, {
          method: "POST",
          success: "Invoice email sent",
        })
      }
    >
      {pending ? "Sending…" : "Retry invoice email"}
    </Button>
  );
}
