"use client";

import { Form } from "@/components/admin/ui/form";
import { highlightedPostFormSchema } from "@/lib/validation/admin";
import { FormSection, NumberField, TextField } from "./Fields";
import { FormActions } from "./FormActions";
import { ImageUploadField } from "./ImageUploadField";
import { useEntityForm } from "./use-entity-form";

type Values = { image: string; link: string; alt: string; sortOrder: number };

export function HighlightedPostForm({ id, initial }: { id?: string; initial?: Partial<Values> }) {
  const { form, onSubmit, pending } = useEntityForm<Values>({
    schema: highlightedPostFormSchema as never,
    defaultValues: { image: "", link: "", alt: "", sortOrder: 0, ...initial },
    url: id ? `/api/admin/highlighted-posts/${id}` : "/api/admin/highlighted-posts",
    method: id ? "PATCH" : "POST",
    redirectTo: "/admin/highlighted-posts",
    successMessage: id ? "Post updated" : "Post created",
    toPayload: (v) => ({ ...v, alt: v.alt || undefined }),
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
        <FormSection title="Post">
          <div className="full">
            <ImageUploadField control={form.control} name="image" label="Upload post image" />
            <TextField control={form.control} name="image" label="Image URL" required type="url" />
          </div>
          <div className="full">
            <TextField control={form.control} name="link" label="Link URL" required type="url" />
          </div>
          <TextField control={form.control} name="alt" label="Alt text" />
          <NumberField control={form.control} name="sortOrder" label="Sort order" required min={0} step={1} description="Lower numbers appear first." />
        </FormSection>
        <FormActions submitLabel={id ? "Save changes" : "Create post"} pending={pending} cancelHref="/admin/highlighted-posts" />
      </form>
    </Form>
  );
}
