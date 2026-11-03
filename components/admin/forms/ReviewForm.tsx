"use client";

import { Form } from "@/components/admin/ui/form";
import { reviewFormSchema } from "@/lib/validation/admin";
import { FormSection, NumberField, SelectField, TextField, TextareaField } from "./Fields";
import { FormActions } from "./FormActions";
import { useEntityForm } from "./use-entity-form";

type Values = {
  productId: string; authorName: string; rating: number; body: string; status: "PENDING" | "APPROVED" | "HIDDEN";
};

export function ReviewForm({
  id, initial, products,
}: {
  id?: string;
  initial?: Partial<Values>;
  products: { value: string; label: string }[];
}) {
  const { form, onSubmit, pending } = useEntityForm<Values>({
    schema: reviewFormSchema as never,
    defaultValues: { productId: "", authorName: "", rating: 5, body: "", status: "APPROVED", ...initial },
    url: id ? `/api/admin/reviews/${id}` : "/api/admin/reviews",
    method: id ? "PATCH" : "POST",
    redirectTo: "/admin/reviews",
    successMessage: id ? "Review updated" : "Review created",
    toPayload: (v) => v,
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
        <FormSection title="Review">
          <div className="full">
            <SelectField control={form.control} name="productId" label="Product" required options={products} placeholder="Select a product" />
          </div>
          <TextField control={form.control} name="authorName" label="Author name" required />
          <NumberField control={form.control} name="rating" label="Rating (1-5)" required min={1} max={5} step={1} />
          <div className="full">
            <TextareaField control={form.control} name="body" label="Review" required rows={5} />
          </div>
          <SelectField
            control={form.control}
            name="status"
            label="Status"
            options={[
              { value: "APPROVED", label: "Approved" },
              { value: "PENDING", label: "Pending" },
              { value: "HIDDEN", label: "Hidden" },
            ]}
          />
        </FormSection>
        <FormActions submitLabel={id ? "Save changes" : "Create review"} pending={pending} cancelHref="/admin/reviews" />
      </form>
    </Form>
  );
}
