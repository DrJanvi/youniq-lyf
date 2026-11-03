"use client";

import { Form } from "@/components/admin/ui/form";
import { discountFormSchema } from "@/lib/validation/admin";
import { FormSection, NumberField, SelectField, SwitchField, TextField } from "./Fields";
import { FormActions } from "./FormActions";
import { useEntityForm } from "./use-entity-form";

type Values = {
  name: string; type: "PERCENT" | "FIXED"; value: number; target: "STORE" | "PRODUCT" | "CATEGORY";
  productId: string; categoryId: string; startsAt: string; endsAt: string; isActive: boolean;
};

type Opt = { value: string; label: string };

export function DiscountForm({
  id, initial, products, categories,
}: {
  id?: string;
  initial?: Partial<Values>;
  products: Opt[];
  categories: Opt[];
}) {
  const { form, onSubmit, pending } = useEntityForm<Values>({
    schema: discountFormSchema as never,
    defaultValues: {
      name: "", type: "PERCENT", value: 10, target: "STORE", productId: "", categoryId: "", startsAt: "", endsAt: "", isActive: true, ...initial,
    },
    url: id ? `/api/admin/discounts/${id}` : "/api/admin/discounts",
    method: id ? "PATCH" : "POST",
    redirectTo: "/admin/discounts",
    successMessage: id ? "Discount updated" : "Discount created",
    toPayload: (v) => ({
      name: v.name,
      type: v.type,
      value: v.value,
      isActive: v.isActive,
      startsAt: v.startsAt ? new Date(v.startsAt).toISOString() : null,
      endsAt: v.endsAt ? new Date(v.endsAt).toISOString() : null,
      productId: v.target === "PRODUCT" ? v.productId : null,
      categoryId: v.target === "CATEGORY" ? v.categoryId : null,
    }),
  });
  const target = form.watch("target");

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
        <FormSection title="Discount">
          <div className="full">
            <TextField control={form.control} name="name" label="Name" required />
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
          <SelectField
            control={form.control}
            name="target"
            label="Applies to"
            options={[
              { value: "STORE", label: "Entire store" },
              { value: "PRODUCT", label: "A product" },
              { value: "CATEGORY", label: "A category" },
            ]}
          />
          {target === "PRODUCT" ? <SelectField control={form.control} name="productId" label="Product" required options={products} /> : null}
          {target === "CATEGORY" ? <SelectField control={form.control} name="categoryId" label="Category" required options={categories} /> : null}
        </FormSection>
        <FormSection title="Schedule" description="Leave empty for no start or end date.">
          <TextField control={form.control} name="startsAt" label="Starts" type="datetime-local" />
          <TextField control={form.control} name="endsAt" label="Ends" type="datetime-local" />
          <div className="full">
            <SwitchField control={form.control} name="isActive" label="Active" description="Inactive discounts are never applied." />
          </div>
        </FormSection>
        <FormActions submitLabel={id ? "Save changes" : "Create discount"} pending={pending} cancelHref="/admin/discounts" />
      </form>
    </Form>
  );
}
