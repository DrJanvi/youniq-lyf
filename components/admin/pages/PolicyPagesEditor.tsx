"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { BlogContentEditorField } from "@/components/admin/forms/BlogContentEditor";
import { Button } from "@/components/admin/ui/button";
import { Form } from "@/components/admin/ui/form";
import { useAdminApi } from "@/components/admin/common/use-admin-api";
import type { listPolicyPages } from "@/services/policy-pages";

type PolicyPage = Awaited<ReturnType<typeof listPolicyPages>>[number];
type FormValues = { content: string };

export function PolicyPagesEditor({ pages }: { pages: PolicyPage[] }) {
  const router = useRouter();
  const { request, pending } = useAdminApi();
  const [selectedSlug, setSelectedSlug] = useState(pages[0]?.slug ?? "");
  const selectedPage = pages.find((page) => page.slug === selectedSlug);
  const form = useForm<FormValues>({
    defaultValues: { content: selectedPage?.content ?? "" },
  });

  function selectPage(slug: string) {
    if (form.formState.isDirty && !window.confirm("Discard unsaved changes?")) {
      return;
    }
    const page = pages.find((item) => item.slug === slug);
    if (!page) return;
    setSelectedSlug(page.slug);
    form.reset({ content: page.content });
  }

  async function submit(values: FormValues) {
    if (!selectedPage) return;
    const result = await request<{ content: string }>(
      `/api/admin/policies/${selectedPage.slug}`,
      {
        method: "PATCH",
        json: values,
        success: `${selectedPage.title} saved`,
        refresh: false,
        form,
      },
    );
    if (result !== undefined) {
      form.reset({ content: result.content });
      router.refresh();
    }
  }

  if (!selectedPage) return null;

  return (
    <section className="mt-6 max-w-5xl rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
      <div className="grid gap-2">
        <label htmlFor="policy-page" className="text-sm font-medium">
          Policy page
        </label>
        <select
          id="policy-page"
          value={selectedSlug}
          onChange={(event) => selectPage(event.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-md"
        >
          {pages.map((page) => (
            <option key={page.slug} value={page.slug}>
              {page.title}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground">
          Saved content is published immediately. Only approved policy wording
          should be added here.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="mt-6 grid gap-5"
        >
          <BlogContentEditorField
            control={form.control}
            name="content"
            label={`${selectedPage.title} content`}
            description="Format paragraphs, headings, lists, links, and tables with the toolbar."
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save policy"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
