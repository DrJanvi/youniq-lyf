"use client";

import { useEffect, useRef, useState } from "react";
import { Form } from "@/components/admin/ui/form";
import { discountFormSchema } from "@/lib/validation/admin";
import { CheckboxGroupField, FormSection, NumberField, SelectField, SwitchField, TextField } from "./Fields";
import { FormActions } from "./FormActions";
import { useEntityForm } from "./use-entity-form";

type Values = {
  name: string; type: "PERCENT" | "FIXED"; value: number; target: "STORE" | "PRODUCT" | "CATEGORY";
  productId: string; categoryId: string; variantScope: "ALL" | "SELECTED"; variantIds: string[];
  startsAt: string; endsAt: string; isActive: boolean;
};

type Opt = { value: string; label: string };
type ProductVariant = { id: string; name: string; isActive: boolean };
type VariantLoad = {
  productId: string;
  status: "loaded" | "error";
  options: Opt[];
  error: string | null;
};

function isProductVariant(value: unknown): value is ProductVariant {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "isActive" in value &&
    typeof value.isActive === "boolean"
  );
}

function apiErrorMessage(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("error" in value)) return null;
  return typeof value.error === "string" ? value.error : null;
}

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
      name: "", type: "PERCENT", value: 10, target: "STORE", productId: "", categoryId: "",
      variantScope: "ALL", variantIds: [], startsAt: "", endsAt: "", isActive: true, ...initial,
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
      variantScope: v.target === "PRODUCT" ? v.variantScope : "ALL",
      variantIds: v.target === "PRODUCT" && v.variantScope === "SELECTED" ? v.variantIds : [],
    }),
  });
  const target = form.watch("target");
  const productId = form.watch("productId");
  const variantScope = form.watch("variantScope");
  const previousProductId = useRef(productId);
  const [variantLoad, setVariantLoad] = useState<VariantLoad | null>(null);
  const currentVariantLoad = variantLoad?.productId === productId ? variantLoad : null;
  const variantOptions = currentVariantLoad?.options ?? [];
  const variantLoadStatus = !productId || target !== "PRODUCT" ? "idle" : currentVariantLoad?.status ?? "loading";
  const variantLoadError = currentVariantLoad?.error ?? null;

  useEffect(() => {
    if (previousProductId.current !== productId) {
      previousProductId.current = productId;
      form.setValue("variantIds", []);
      form.setValue("variantScope", "ALL");
    }

    if (target !== "PRODUCT" || !productId) {
      form.setValue("variantIds", []);
      form.setValue("variantScope", "ALL");
      return;
    }

    const controller = new AbortController();
    const loadVariants = async () => {
      try {
        const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/variants`, {
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (!response.ok) throw new Error(apiErrorMessage(body) ?? "Could not load product variants.");
        if (!Array.isArray(body) || !body.every(isProductVariant)) {
          throw new Error("The product variants response was invalid.");
        }
        const options = body.map((variant) => ({
          value: variant.id,
          label: variant.isActive ? variant.name : `${variant.name} (inactive)`,
        }));
        setVariantLoad({ productId, status: "loaded", options, error: null });
        if (!options.length) {
          form.setValue("variantIds", []);
          form.setValue("variantScope", "ALL");
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setVariantLoad({
          productId,
          status: "error",
          options: [],
          error: error instanceof Error ? error.message : "Could not load product variants.",
        });
      }
    };
    void loadVariants();
    return () => controller.abort();
  }, [form, productId, target]);

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
          {target === "PRODUCT" && productId ? (
            <div className="full flex flex-col gap-3">
              {variantLoadStatus === "loading" ? (
                <p className="text-sm text-muted-foreground">Loading product variants...</p>
              ) : null}
              {variantLoadStatus === "error" ? (
                <p role="alert" className="text-sm text-destructive">{variantLoadError}</p>
              ) : null}
              {variantLoadStatus === "loaded" && variantOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">This product has no variants; the discount applies to the product.</p>
              ) : null}
              {variantLoadStatus === "loaded" && variantOptions.length > 0 ? (
                <>
                  <SelectField
                    control={form.control}
                    name="variantScope"
                    label="Apply to variants"
                    options={[
                      { value: "ALL", label: "All variants" },
                      { value: "SELECTED", label: "Selected variants" },
                    ]}
                  />
                  {variantScope === "SELECTED" ? (
                    <CheckboxGroupField
                      control={form.control}
                      name="variantIds"
                      label="Choose variants"
                      options={variantOptions}
                    />
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
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
