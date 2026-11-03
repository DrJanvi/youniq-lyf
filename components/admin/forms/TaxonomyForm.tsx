"use client";

import { Form } from "@/components/admin/ui/form";
import { categoryFormSchema, nameFormSchema } from "@/lib/validation/admin";
import { FormSection, TextField, TextareaField } from "./Fields";
import { FormActions } from "./FormActions";
import { ImageUploadField } from "./ImageUploadField";
import { useEntityForm } from "./use-entity-form";

type Values = { name: string; slug: string; image?: string; description?: string; seoTitle?: string; seoDescription?: string };

/** Create/edit form shared by categories (with image + SEO), brands and product types. */
export function TaxonomyForm({
  endpoint,
  listHref,
  singular,
  withDetails = false,
  id,
  initial,
}: {
  endpoint: string;
  listHref: string;
  singular: string;
  withDetails?: boolean;
  id?: string;
  initial?: Partial<Values>;
}) {
  const { form, onSubmit, pending } = useEntityForm<Values>({
    schema: (withDetails ? categoryFormSchema : nameFormSchema) as never,
    defaultValues: { name: "", slug: "", image: "", description: "", seoTitle: "", seoDescription: "", ...initial },
    url: id ? `${endpoint}/${id}` : endpoint,
    method: id ? "PATCH" : "POST",
    redirectTo: listHref,
    successMessage: id ? `${singular} updated` : `${singular} created`,
    toPayload: (v) => ({
      name: v.name,
      slug: v.slug || undefined,
      ...(withDetails
        ? { image: v.image, description: v.description || undefined, seoTitle: v.seoTitle || undefined, seoDescription: v.seoDescription || undefined }
        : {}),
    }),
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
        <FormSection title="Details">
          <TextField control={form.control} name="name" label="Name" required />
          <TextField control={form.control} name="slug" label="Slug" description="Leave empty to generate from the name." />
          {withDetails ? (
            <>
              <div className="full">
                <ImageUploadField control={form.control} name="image" label="Upload category image" />
                <TextField control={form.control} name="image" label="Image URL" required type="url" />
              </div>
              <div className="full">
                <TextareaField control={form.control} name="description" label="Description" rows={4} />
              </div>
              <TextField control={form.control} name="seoTitle" label="SEO title" />
              <TextField control={form.control} name="seoDescription" label="SEO description" />
            </>
          ) : null}
        </FormSection>
        <FormActions submitLabel={id ? "Save changes" : `Create ${singular.toLowerCase()}`} pending={pending} cancelHref={listHref} />
      </form>
    </Form>
  );
}
