"use client";

import { useWatch } from "react-hook-form";
import { Form } from "@/components/admin/ui/form";
import { highlightedPostFormSchema } from "@/lib/validation/admin";
import { FormSection, NumberField, SelectField, TextField } from "./Fields";
import { FormActions } from "./FormActions";
import { HighlightedPostMediaUploadField } from "./HighlightedPostMediaUploadField";
import { useEntityForm } from "./use-entity-form";

type Values = { image: string; mediaType: "image" | "video"; link: string; alt: string; sortOrder: number };

export function HighlightedPostForm({ id, initial }: { id?: string; initial?: Partial<Values> }) {
  const { form, onSubmit, pending } = useEntityForm<Values>({
    schema: highlightedPostFormSchema as never,
    defaultValues: { image: "", mediaType: "image", link: "", alt: "", sortOrder: 0, ...initial },
    url: id ? `/api/admin/highlighted-posts/${id}` : "/api/admin/highlighted-posts",
    method: id ? "PATCH" : "POST",
    redirectTo: "/admin/highlighted-posts",
    successMessage: id ? "Post updated" : "Post created",
    toPayload: (v) => ({ ...v, alt: v.alt || undefined }),
  });
  const image = useWatch({ control: form.control, name: "image" });
  const mediaType = useWatch({ control: form.control, name: "mediaType" });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
        <FormSection title="Post">
          <div className="full">
            <HighlightedPostMediaUploadField
              value={image}
              mediaType={mediaType}
              onChange={(url, mediaType) => {
                form.setValue("image", url, { shouldDirty: true, shouldValidate: true });
                form.setValue("mediaType", mediaType, { shouldDirty: true, shouldValidate: true });
              }}
            />
            <SelectField
              control={form.control}
              name="mediaType"
              label="Media type"
              required
              options={[{ value: "image", label: "Image" }, { value: "video", label: "Video" }]}
              description="Uploads set this automatically. Choose the correct type when entering a URL manually."
            />
            <TextField control={form.control} name="image" label="Media URL" required type="url" />
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
