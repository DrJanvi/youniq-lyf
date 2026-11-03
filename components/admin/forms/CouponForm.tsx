"use client";

import { useState } from "react";
import { Form } from "@/components/admin/ui/form";
import { Button } from "@/components/admin/ui/button";
import { FormSection, NumberField, SelectField, SwitchField, TextField } from "./Fields";
import { FormActions } from "./FormActions";
import { useEntityForm } from "./use-entity-form";
import { couponFormSchema } from "@/lib/validation/admin";
import { apiFetch } from "@/lib/client-api";

type Values = {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minimumSubtotal?: number;
  maxDiscount?: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

export function CouponForm({ id, initial }: { id?: string; initial?: Partial<Values> }) {
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const { form, onSubmit, pending } = useEntityForm<Values>({
    schema: couponFormSchema as never,
    defaultValues: {
      code: "",
      type: "PERCENT",
      value: 10,
      minimumSubtotal: undefined,
      maxDiscount: undefined,
      startsAt: "",
      endsAt: "",
      isActive: true,
      ...initial,
    },
    url: id ? `/api/admin/coupons/${id}` : "/api/admin/coupons",
    method: id ? "PATCH" : "POST",
    redirectTo: "/admin/coupons",
    successMessage: id ? "Coupon updated" : "Coupon created",
    toPayload: (values) => ({
      code: values.code.trim().toUpperCase(),
      type: values.type,
      value: values.value,
      minimumSubtotal: values.minimumSubtotal ?? null,
      maxDiscount: values.type === "PERCENT" ? values.maxDiscount ?? null : null,
      startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
      endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
      isActive: values.isActive,
    }),
  });
  const type = form.watch("type");

  async function generateCode() {
    setGenerating(true);
    setGenerationError(null);
    try {
      const { code } = await apiFetch<{ code: string }>("/api/admin/coupons/generate-code", {
        method: "POST",
      });
      form.setValue("code", code, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Could not generate a coupon code.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
        <FormSection title="Coupon">
          <div className="full">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="min-w-0 flex-1">
                <TextField control={form.control} name="code" label="Code" required maxLength={64} />
              </div>
              <Button type="button" variant="outline" className="sm:mt-7" disabled={generating || pending} onClick={generateCode}>
                {generating ? "Generating…" : "Generate code"}
              </Button>
            </div>
            {generationError ? <p role="alert" className="mt-2 text-sm text-destructive">{generationError}</p> : null}
            <p className="mt-2 text-xs text-muted-foreground">Codes are case-insensitive. Generated codes are unique and can be edited.</p>
          </div>
          <SelectField
            control={form.control}
            name="type"
            label="Type"
            options={[
              { value: "PERCENT", label: "Percentage (%)" },
              { value: "FIXED", label: "Fixed amount" },
            ]}
          />
          <NumberField control={form.control} name="value" label="Value" required min={0} step="0.01" />
          <NumberField
            control={form.control}
            name="minimumSubtotal"
            label="Minimum spend"
            description="Optional; checked after automatic discounts and before this coupon."
            min={0}
            step="0.01"
          />
          {type === "PERCENT" ? (
            <NumberField
              control={form.control}
              name="maxDiscount"
              label="Maximum discount"
              description="Optional cap for percentage coupons."
              min={0}
              step="0.01"
            />
          ) : null}
        </FormSection>
        <FormSection title="Schedule" description="Leave dates empty for no start or end date. Monetary limits use the order currency.">
          <TextField control={form.control} name="startsAt" label="Starts" type="datetime-local" />
          <TextField control={form.control} name="endsAt" label="Ends" type="datetime-local" />
          <div className="full">
            <SwitchField control={form.control} name="isActive" label="Active" description="Inactive coupons cannot be applied." />
          </div>
        </FormSection>
        <FormActions submitLabel={id ? "Save changes" : "Create coupon"} pending={pending} cancelHref="/admin/coupons" />
      </form>
    </Form>
  );
}
