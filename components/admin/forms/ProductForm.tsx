"use client";

import { Form } from "@/components/admin/ui/form";
import { productFormSchema } from "@/lib/validation/admin";
import { CheckboxGroupField, FormSection, NumberField, SelectField, SwitchField, TextField, TextareaField } from "./Fields";
import { FormActions } from "./FormActions";
import { ImageUploadField } from "./ImageUploadField";
import { useEntityForm } from "./use-entity-form";
import { useFieldArray } from "react-hook-form";

type Opt = { value: string; label: string };

const PRESET_TAGS = [
  { value: "best-selling", label: "Best selling" },
  { value: "new-release", label: "New release" },
  { value: "featured", label: "Featured" },
];
const PRESET_SLUGS = PRESET_TAGS.map((t) => t.value);

export type ProductFormValues = {
  title: string; slug: string; description: string; images: string; aboutPoints: string; aboutIntro: string; price: number; currency: string; stock: number;
  gender: "UNISEX" | "MALE" | "FEMALE"; isActive: boolean; categoryId: string; brandId: string; productTypeId: string;
  presetTags: string[]; tags: string; seoTitle: string; seoDescription: string;
  variants: {
    id?: string;
    name: string;
    color: string;
    images: string;
    priceOverride?: number;
    stock: number;
    isActive: boolean;
  }[];
};

const split = (v: string, sep: string) => v.split(sep).map((s) => s.trim()).filter(Boolean);

export function ProductForm({
  id, product, categories, brands, types,
}: {
  id?: string;
  product?: {
    title: string; slug: string; description: string; images: string[]; aboutPoints: { title: string; description: string }[]; aboutIntro: string; price: number; currency: string; stock: number;
    gender: string; isActive: boolean; categoryId: string; brandId: string; productTypeId: string; tags: string[];
    seoTitle: string; seoDescription: string;
    hasVariants: boolean;
    variants: {
      id: string;
      name: string;
      color: string;
      images: string[];
      priceOverride: number | null;
      stock: number;
    }[];
  };
  categories: Opt[];
  brands: Opt[];
  types: Opt[];
}) {
  const { form, onSubmit, pending } = useEntityForm<ProductFormValues>({
    schema: productFormSchema as never,
    defaultValues: product
      ? {
          ...product,
          gender: product.gender as ProductFormValues["gender"],
          images: product.images.join("\n"),
          aboutPoints: product.aboutPoints
            .map((point) => `${point.title} | ${point.description}`)
            .join("\n"),
          presetTags: product.tags.filter((t) => PRESET_SLUGS.includes(t)),
          tags: product.tags.filter((t) => !PRESET_SLUGS.includes(t)).join(", "),
          variants: product.variants.map((variant) => ({
            ...variant,
            images: variant.images.join("\n"),
            priceOverride: variant.priceOverride ?? undefined,
            isActive: true,
          })),
        }
      : {
          title: "", slug: "", description: "", images: "", aboutPoints: "", aboutIntro: "", price: 0, currency: "AED", stock: 0, gender: "UNISEX", isActive: true,
          categoryId: "", brandId: "", productTypeId: "", presetTags: [], tags: "", seoTitle: "", seoDescription: "", variants: [],
        },
    url: id ? `/api/admin/products/${id}` : "/api/admin/products",
    method: id ? "PATCH" : "POST",
    redirectTo: "/admin/products",
    successMessage: id ? "Product updated" : "Product created",
    toPayload: (v) => ({
      title: v.title,
      slug: v.slug || undefined,
      description: v.description,
      images: split(v.images, "\n"),
      aboutPoints: v.aboutPoints
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const separator = line.indexOf("|");
          return {
            title: line.slice(0, separator).trim(),
            description: line.slice(separator + 1).trim(),
          };
        }),
      aboutIntro: v.aboutIntro.trim() || null,
      price: v.price,
      currency: v.currency,
      stock: v.stock,
      variants: v.variants.map(({ images, priceOverride, ...variant }) => ({
        ...variant,
        images: split(images, "\n"),
        priceOverride: priceOverride ?? null,
      })),
      gender: v.gender,
      isActive: v.isActive,
      seoTitle: v.seoTitle || undefined,
      seoDescription: v.seoDescription || undefined,
      categoryId: v.categoryId,
      brandId: v.brandId || null,
      productTypeId: v.productTypeId || null,
      tags: [...v.presetTags, ...split(v.tags, ",")],
    }),
  });
  const c = form.control;
  const { fields, append, remove } = useFieldArray({
    control: c,
    name: "variants",
    keyName: "fieldKey",
  });
  const stockIsVariantManaged = Boolean(product?.hasVariants || fields.length);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-4xl flex-col gap-5">
        <FormSection title="Basic information">
          <TextField control={c} name="title" label="Title" required />
          <TextField control={c} name="slug" label="Slug" description="Leave empty to generate from the title." />
          <div className="full">
            <TextareaField control={c} name="description" label="Description" required rows={6} />
          </div>
          <div className="full">
            <ImageUploadField control={c} name="images" label="Upload product images" multiple maxFiles={20} />
            <TextareaField control={c} name="images" label="Image URLs" rows={3} description="One URL per line." />
          </div>
          <div className="full">
            <TextareaField
              control={c}
              name="aboutIntro"
              label="About intro"
              rows={3}
              description="Short paragraph shown under the 'About this product' heading. Optional."
            />
          </div>
          <div className="full">
            <TextareaField
              control={c}
              name="aboutPoints"
              label="About this product rows"
              rows={8}
              description="One accordion row per line: title | explanation. Up to 10 rows. Suggested: Descriptions, What's inside the box, Fragrance profile, How to use, Ingredients & safety, Shipping & returns."
            />
          </div>
        </FormSection>
        <FormSection title="Pricing & inventory">
          <NumberField control={c} name="price" label="Price" required min={0} step="0.01" />
          <TextField control={c} name="currency" label="Currency" required maxLength={3} />
          <NumberField
            control={c}
            name="stock"
            label="Stock"
            required
            min={0}
            step={1}
            disabled={stockIsVariantManaged}
            description={stockIsVariantManaged ? "Calculated from active color variant stock." : undefined}
          />
          <SelectField
            control={c}
            name="gender"
            label="Gender"
            options={[
              { value: "UNISEX", label: "Unisex" },
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
            ]}
          />
        </FormSection>
        <FormSection title="Color variants">
          <div className="full flex flex-col gap-5">
            <p className="text-sm text-muted-foreground">
              Optional. Add colors with their own gallery, stock, and optional price. Removing a saved color keeps its record for existing orders.
            </p>
            {fields.map((field, index) => (
              <div key={field.fieldKey} className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                <TextField
                  control={c}
                  name={`variants.${index}.name`}
                  label="Color name"
                  required
                />
                <TextField
                  control={c}
                  name={`variants.${index}.color`}
                  label="Swatch color"
                  type="color"
                  required
                />
                <NumberField
                  control={c}
                  name={`variants.${index}.priceOverride`}
                  label="Price override"
                  min={0}
                  step="0.01"
                  description="Leave empty to use the product price."
                />
                <NumberField
                  control={c}
                  name={`variants.${index}.stock`}
                  label="Variant stock"
                  required
                  min={0}
                  step={1}
                />
                <div className="full">
                  <ImageUploadField
                    control={c}
                    name={`variants.${index}.images`}
                    label="Upload color images"
                    multiple
                    maxFiles={20}
                  />
                  <TextareaField
                    control={c}
                    name={`variants.${index}.images`}
                    label="Color image URLs"
                    rows={2}
                    description="One URL per line. The product gallery is used if this is empty."
                  />
                </div>
                <div className="full flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm font-medium text-destructive underline underline-offset-4"
                  >
                    Remove color
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({
                name: "",
                color: "#000000",
                images: "",
                priceOverride: undefined,
                stock: 0,
                isActive: true,
              })}
              disabled={fields.length >= 50}
              className="self-start rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Add color
            </button>
          </div>
        </FormSection>
        <FormSection title="Organisation">
          <SelectField control={c} name="categoryId" label="Category" required options={categories} />
          <SelectField control={c} name="brandId" label="Brand" options={brands} allowNone />
          <SelectField control={c} name="productTypeId" label="Product type" options={types} allowNone />
          <TextField control={c} name="tags" label="Other tags" description="Comma separated." />
          <div className="full">
            <CheckboxGroupField control={c} name="presetTags" label="Shop sections" options={PRESET_TAGS} />
          </div>
        </FormSection>
        <FormSection title="SEO & visibility">
          <TextField control={c} name="seoTitle" label="SEO title" />
          <TextField control={c} name="seoDescription" label="SEO description" />
          <div className="full">
            <SwitchField control={c} name="isActive" label="Active" description="Visible in the shop when on." />
          </div>
        </FormSection>
        <FormActions submitLabel={id ? "Save changes" : "Create product"} pending={pending} cancelHref="/admin/products" />
      </form>
    </Form>
  );
}
