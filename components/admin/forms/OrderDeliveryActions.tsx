"use client";

import { useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { useAdminApi } from "@/components/admin/common/use-admin-api";

type DeliveryStatus = "APPROVED" | "DISPATCHED" | "OUT_FOR_DELIVERY" | "DELIVERY_ATTEMPT_FAILED" | "DELIVERED";
type DialogAction = "dispatch" | "delivered" | "failed";

export function OrderDeliveryActions({ orderId, status }: { orderId: string; status: DeliveryStatus | "PENDING" | "REJECTED" }) {
  const [dialog, setDialog] = useState<DialogAction | null>(null);
  const [deliveryPartner, setDeliveryPartner] = useState("");
  const [deliveryReferenceId, setDeliveryReferenceId] = useState("");
  const [deliveryTrackingUrl, setDeliveryTrackingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const { request, pending } = useAdminApi();

  function closeDialog() {
    setDialog(null);
    setDeliveryPartner("");
    setDeliveryReferenceId("");
    setDeliveryTrackingUrl("");
    setNotes("");
  }

  async function update(status: "OUT_FOR_DELIVERY") {
    const result = await request(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      json: { status },
      success: "Order marked out for delivery",
    });
    if (result !== undefined) closeDialog();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dialog) return;
    const payload =
      dialog === "dispatch"
        ? {
            status: "DISPATCHED",
            deliveryPartner: deliveryPartner.trim(),
            deliveryReferenceId: deliveryReferenceId.trim(),
            deliveryTrackingUrl: deliveryTrackingUrl.trim() || undefined,
          }
        : dialog === "delivered"
          ? { status: "DELIVERED", notes: notes.trim() || undefined }
          : { status: "DELIVERY_ATTEMPT_FAILED", notes: notes.trim() };
    const result = await request(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      json: payload,
      success: dialog === "dispatch" ? "Order dispatched" : dialog === "delivered" ? "Order marked delivered" : "Delivery attempt recorded",
    });
    if (result !== undefined) closeDialog();
  }

  if (status === "PENDING" || status === "REJECTED" || status === "DELIVERED") return null;

  const actionTitle =
    dialog === "dispatch" ? "Dispatch order" : dialog === "delivered" ? "Mark order delivered" : "Record failed delivery attempt";

  return (
    <>
      {status === "APPROVED" ? <Button size="sm" onClick={() => setDialog("dispatch")}>Dispatch order</Button> : null}
      {status === "DISPATCHED" ? (
        <Button size="sm" disabled={pending} onClick={() => update("OUT_FOR_DELIVERY")}>Mark out for delivery</Button>
      ) : null}
      {status === "OUT_FOR_DELIVERY" ? (
        <>
          <Button size="sm" onClick={() => setDialog("delivered")}>Mark delivered</Button>
          <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDialog("failed")}>
            Delivery attempt failed
          </Button>
        </>
      ) : null}
      {status === "DELIVERY_ATTEMPT_FAILED" ? (
        <Button size="sm" disabled={pending} onClick={() => update("OUT_FOR_DELIVERY")}>Retry delivery</Button>
      ) : null}
      <Dialog open={dialog !== null} onOpenChange={(open) => !open && !pending && closeDialog()}>
        <DialogContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{actionTitle}</DialogTitle>
              <DialogDescription>
                {dialog === "dispatch"
                  ? "Enter the delivery partner and reference ID. A tracking link is optional."
                  : dialog === "failed"
                    ? "Add a note explaining why the delivery attempt failed."
                    : "You can optionally add a delivery note."}
              </DialogDescription>
            </DialogHeader>
            {dialog === "dispatch" ? (
              <>
                <Input
                  aria-label="Delivery partner"
                  placeholder="Delivery partner"
                  value={deliveryPartner}
                  onChange={(event) => setDeliveryPartner(event.target.value)}
                  maxLength={120}
                  required
                />
                <Input
                  aria-label="Delivery reference ID"
                  placeholder="Reference ID"
                  value={deliveryReferenceId}
                  onChange={(event) => setDeliveryReferenceId(event.target.value)}
                  maxLength={120}
                  required
                />
                <Input
                  aria-label="Tracking link"
                  type="url"
                  placeholder="Tracking link (optional)"
                  value={deliveryTrackingUrl}
                  onChange={(event) => setDeliveryTrackingUrl(event.target.value)}
                  maxLength={1000}
                />
              </>
            ) : (
              <Textarea
                aria-label="Delivery notes"
                placeholder={dialog === "failed" ? "Required: explain the failed attempt" : "Optional delivery notes"}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={1000}
                required={dialog === "failed"}
                rows={4}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={pending} onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : dialog === "dispatch" ? "Dispatch" : dialog === "failed" ? "Record failed attempt" : "Mark delivered"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
