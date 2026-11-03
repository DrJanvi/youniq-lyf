"use client";

import { useEffect } from "react";
import { Form } from "@/components/admin/ui/form";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { blogArticleFormSchema } from "@/lib/validation/admin";
import {
  FormSection,
  NumberField,
  SelectField,
  TextareaField,
  TextField,
} from "./Fields";
import { FormActions } from "./FormActions";
import { BlogContentEditorField } from "./BlogContentEditor";
import { ImageUploadField } from "./ImageUploadField";
import { useEntityForm } from "./use-entity-form";

type Values = {
  title: string;
  category: string;
  publishedAt: string;
  readTime: number;
  excerpt: string;
  image: string;
  content: string;
};

export function BlogArticleForm({
  id,
  initial,
}: {
  id?: string;
  initial?: Partial<Values>;
}) {
  const { form, onSubmit, pending } = useEntityForm<Values>({
    schema: blogArticleFormSchema as never,
    defaultValues: {
      title: "",
      category: BLOG_CATEGORIES[0],
      publishedAt: "",
      readTime: 5,
      excerpt: "",
      image: "",
      content: "",
      ...initial,
    },
    url: id ? `/api/admin/blogs/${id}` : "/api/admin/blogs",
    method: id ? "PATCH" : "POST",
    redirectTo: "/admin/blogs",
    successMessage: id ? "Article updated" : "Article published",
  });

  const { reset } = form;
  // Next keeps previously visited pages mounted; effects re-run when the page is shown again.
  useEffect(() => {
    if (id) return;
    reset({
      title: "",
      category: BLOG_CATEGORIES[0],
      publishedAt: new Date().toISOString().slice(0, 10),
      readTime: 5,
      excerpt: "",
      image: "",
      content: "",
    });
  }, [id, reset]);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-4xl flex-col gap-5">
        <FormSection title="Article details">
          <TextField control={form.control} name="title" label="Title" required />
          <SelectField
            control={form.control}
            name="category"
            label="Category"
            required
            options={BLOG_CATEGORIES.map((category) => ({
              value: category,
              label: category,
            }))}
          />
          <TextField
            control={form.control}
            name="publishedAt"
            label="Date"
            required
            type="date"
          />
          <NumberField
            control={form.control}
            name="readTime"
            label="Read time (minutes)"
            required
            min={1}
            max={240}
            step={1}
          />
          <div className="full">
            <TextareaField
              control={form.control}
              name="excerpt"
              label="Short description"
              description="Keep it concise; the storefront displays this in two lines."
              required
              maxLength={320}
              rows={3}
            />
          </div>
          <div className="full">
            <ImageUploadField
              control={form.control}
              name="image"
              label="Upload article image"
            />
            <TextField
              control={form.control}
              name="image"
              label="Image URL"
              required
              type="url"
            />
          </div>
        </FormSection>
        <FormSection
          title="Full article"
          description="Format your article with headings, lists, links, quotes, and tables. Articles publish as soon as they are saved."
        >
          <div className="full">
            <BlogContentEditorField
              control={form.control}
              name="content"
              label="Article content"
              required
              description="Use the toolbar or keyboard shortcuts to format your writing."
            />
          </div>
        </FormSection>
        <FormActions
          submitLabel={id ? "Save changes" : "Publish article"}
          pending={pending}
          cancelHref="/admin/blogs"
        />
      </form>
    </Form>
  );
}
