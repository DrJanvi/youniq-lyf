"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { Form } from "@/components/admin/ui/form";
import { useAdminApi } from "@/components/admin/common/use-admin-api";
import { orderDecisionFormSchema } from "@/lib/validation/admin";
import { TextareaField } from "./Fields";

type Values = { adminNote: string };

/** Approve / reject buttons that open a dialog with an optional note. */
export function OrderDecision({
  orderId,
  redirectTo,
  canApprove = true,
}: {
  orderId: string;
  redirectTo?: string;
  canApprove?: boolean;
}) {
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | null>(null);
  const { request, pending } = useAdminApi();
  const form = useForm<Values>({ resolver: zodResolver(orderDecisionFormSchema as never), defaultValues: { adminNote: "" } });

  const onSubmit = form.handleSubmit(async (v) => {
    const res = await request(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      json: { status: decision, adminNote: v.adminNote || undefined },
      success: decision === "APPROVED" ? "Order approved" : "Order rejected",
      redirectTo,
      form,
    });
    if (res !== undefined) {
      setDecision(null);
      form.reset();
    }
  });

  return (
    <>
      {canApprove ? (
        <Button size="sm" onClick={() => setDecision("APPROVED")}>
          <Check /> Approve
        </Button>
      ) : null}
      <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDecision("REJECTED")}>
        <X /> Reject
      </Button>
      <Dialog open={decision !== null} onOpenChange={(o) => !o && !pending && setDecision(null)}>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>{decision === "APPROVED" ? "Approve order" : "Reject order"}</DialogTitle>
                <DialogDescription>
                  {decision === "APPROVED" ? "Stock will be reduced for the ordered items." : "The customer's order will be marked as rejected."}
                </DialogDescription>
              </DialogHeader>
              <TextareaField control={form.control} name="adminNote" label="Note (optional)" rows={3} />
              <DialogFooter>
                <Button type="button" variant="outline" disabled={pending} onClick={() => setDecision(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant={decision === "REJECTED" ? "destructive" : "default"} disabled={pending}>
                  {pending ? "Saving…" : decision === "APPROVED" ? "Approve" : "Reject"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
