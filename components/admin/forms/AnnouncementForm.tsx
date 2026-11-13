"use client";

import { Form } from "@/components/admin/ui/form";
import { announcementFormSchema } from "@/lib/validation/admin";
import { FormSection, NumberField, TextareaField, TextField } from "./Fields";
import { FormActions } from "./FormActions";
import { useEntityForm } from "./use-entity-form";

type Values = { message: string; link: string; sortOrder: number };

export function AnnouncementForm({
  id,
  initial,
}: {
  id?: string;
  initial?: Partial<Values>;
}) {
  const { form, onSubmit, pending } = useEntityForm<Values>({
    schema: announcementFormSchema,
    defaultValues: { message: "", link: "", sortOrder: 0, ...initial },
    url: id ? `/api/admin/announcements/${id}` : "/api/admin/announcements",
    method: id ? "PATCH" : "POST",
    redirectTo: "/admin/announcements",
    successMessage: id ? "Announcement updated" : "Announcement created",
    toPayload: (values) => ({ ...values, link: values.link || undefined }),
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
        <FormSection title="Announcement">
          <div className="full">
            <TextareaField
              control={form.control}
              name="message"
              label="Message"
              required
              maxLength={500}
              rows={3}
              description="Up to 500 characters."
            />
          </div>
          <TextField
            control={form.control}
            name="link"
            label="Optional link"
            placeholder="/products"
            description="Leave blank for a message that is not clickable. Use a site path or an HTTP(S) URL."
          />
          <NumberField
            control={form.control}
            name="sortOrder"
            label="Sort order"
            required
            min={0}
            step={1}
            description="Lower numbers appear first."
          />
        </FormSection>
        <FormActions
          submitLabel={id ? "Save changes" : "Create announcement"}
          pending={pending}
          cancelHref="/admin/announcements"
        />
      </form>
    </Form>
  );
}
