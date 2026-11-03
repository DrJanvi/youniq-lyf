"use client";

import { Form } from "@/components/admin/ui/form";
import { heroBannerFormSchema } from "@/lib/validation/admin";
import { FormSection, NumberField, TextField } from "./Fields";
import { FormActions } from "./FormActions";
import { ImageUploadField } from "./ImageUploadField";
import { useEntityForm } from "./use-entity-form";

type Values = { desktopImage: string; mobileImage: string; link: string; alt: string; sortOrder: number };

export function HeroBannerForm({ id, initial }: { id?: string; initial?: Partial<Values> }) {
  const { form, onSubmit, pending } = useEntityForm<Values>({
    schema: heroBannerFormSchema as never,
    defaultValues: { desktopImage: "", mobileImage: "", link: "", alt: "", sortOrder: 0, ...initial },
    url: id ? `/api/admin/hero-banners/${id}` : "/api/admin/hero-banners",
    method: id ? "PATCH" : "POST",
    redirectTo: "/admin/hero-banners",
    successMessage: id ? "Banner updated" : "Banner created",
    toPayload: (v) => ({ ...v, alt: v.alt || undefined, mobileImage: v.mobileImage || undefined }),
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
        <FormSection title="Desktop banner">
          <div className="full">
            <ImageUploadField
              control={form.control}
              name="desktopImage"
              label="Upload desktop banner"
              description="Desktop image must be of size 1440x834. PNG, JPEG, or WebP; less than 2 MB."
            />
            <TextField control={form.control} name="desktopImage" label="Desktop image URL" required type="url" />
          </div>
        </FormSection>
        <FormSection title="Mobile banner">
          <div className="full">
            <ImageUploadField
              control={form.control}
              name="mobileImage"
              label="Upload mobile banner"
              description="Mobile image must be of size 834x1440. If not provided, the desktop image is used on mobile."
            />
            <TextField control={form.control} name="mobileImage" label="Mobile image URL" type="url" />
          </div>
        </FormSection>
        <FormSection title="Details">
          <div className="full">
            <TextField control={form.control} name="link" label="Link URL or path (e.g. /products)" required />
          </div>
          <TextField control={form.control} name="alt" label="Alt text" />
          <NumberField control={form.control} name="sortOrder" label="Sort order" required min={0} step={1} description="Lower numbers appear first." />
        </FormSection>
        <FormActions submitLabel={id ? "Save changes" : "Create banner"} pending={pending} cancelHref="/admin/hero-banners" />
      </form>
    </Form>
  );
}
