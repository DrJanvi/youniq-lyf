"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Edit2, MessageSquareText, Plus, X } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { Form } from "@/components/admin/ui/form";
import { useAdminApi } from "@/components/admin/common/use-admin-api";
import { BlogContentEditorField } from "@/components/admin/forms/BlogContentEditor";
import { RestoreButton } from "@/components/admin/common/RestoreButton";
import { StatusBadge } from "@/components/admin/common/StatusBadge";

type FaqPage = "CONTACT" | "FAQ_PAGE";

type Faq = {
  id: string;
  question: string;
  answer: string;
  page: FaqPage;
  sortOrder: number;
  isActive: boolean;
  deletedAt: string | null;
};

type FaqDraft = Omit<Faq, "id" | "deletedAt"> & { id?: string };
type FaqFormValues = Omit<FaqDraft, "id">;

const destinations: { value: FaqPage; label: string }[] = [
  { value: "CONTACT", label: "Contact page" },
  { value: "FAQ_PAGE", label: "FAQ page" },
];

const fieldClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring";

function nextSortOrder(faqs: Faq[], page: FaqPage) {
  return Math.min(
    faqs.reduce(
      (next, faq) => (faq.page === page ? Math.max(next, faq.sortOrder + 1) : next),
      0,
    ),
    10000,
  );
}

function faqAnswerPreview(answer: string) {
  return answer
    .replace(/<[^>]*>/g, " ")
    .replace(/(?:&nbsp;|&#160;|&#xA0;)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function FaqDialog({ initial, close }: { initial: FaqDraft; close: () => void }) {
  const { request, pending } = useAdminApi();
  const router = useRouter();
  const form = useForm<FaqFormValues>({
    defaultValues: {
      question: initial.question,
      answer: initial.answer,
      page: initial.page,
      sortOrder: initial.sortOrder,
      isActive: initial.isActive,
    },
  });

  async function submit(payload: FaqFormValues) {
    const result = await request(
      initial.id
        ? `/api/admin/contact-us/faqs/${initial.id}`
        : "/api/admin/contact-us/faqs",
      {
        method: initial.id ? "PATCH" : "POST",
        json: payload,
        success: initial.id ? "FAQ updated" : "FAQ added",
        refresh: false,
        form,
      },
    );
    if (result) {
      router.refresh();
      close();
    }
  }

  return (
    <EditorDialog title={initial.id ? "Edit FAQ" : "Add FAQ"} close={close}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} noValidate className="grid gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Question
            <input
              required
              maxLength={500}
              {...form.register("question", {
                required: "Question is required",
                maxLength: { value: 500, message: "Question is too long" },
              })}
              className={fieldClass}
            />
            {form.formState.errors.question?.message ? (
              <span className="text-xs text-destructive" role="alert">
                {form.formState.errors.question.message}
              </span>
            ) : null}
          </label>
          <BlogContentEditorField
            control={form.control}
            name="answer"
            label="Answer"
            description="Format the answer with headings, lists, and links."
            required
          />
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Show on
            <select
              {...form.register("page")}
              className={fieldClass}
            >
              {destinations.map((destination) => (
                <option key={destination.value} value={destination.value}>
                  {destination.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Display order
              <input
                type="number"
                min={0}
                max={10000}
                step={1}
                {...form.register("sortOrder", {
                  valueAsNumber: true,
                  min: 0,
                  max: 10000,
                })}
                className={fieldClass}
              />
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" {...form.register("isActive")} />
              Visible on storefront
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save FAQ"}
            </Button>
          </div>
        </form>
      </Form>
    </EditorDialog>
  );
}

function EditorDialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Edit FAQ content and storefront placement.
          </DialogDescription>
        </DialogHeader>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close"
          onClick={close}
          className="absolute top-4 right-12"
        >
          <X />
        </Button>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function FaqsPage({ faqs }: { faqs: Faq[] }) {
  const { request, pending } = useAdminApi();
  const [faqDraft, setFaqDraft] = useState<FaqDraft | null>(null);
  const router = useRouter();

  async function remove(id: string) {
    if (!window.confirm("Delete this FAQ? It will be removed from the storefront and can be restored from this page.")) return;
    const result = await request(`/api/admin/contact-us/faqs/${id}`, {
      method: "DELETE",
      success: "FAQ deleted",
    });
    if (result !== undefined) router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-4xl font-bold tracking-tight">FAQs</h1>
        <p className="text-sm text-muted-foreground">
          Manage questions for the Contact and FAQ storefront pages. Each page
          has its own display order.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        {destinations.map(({ value, label }) => {
          const pageFaqs = faqs.filter((faq) => faq.page === value);
          return (
            <section
              key={value}
              className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-bold">{label}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add, edit, reorder, or hide FAQs shown on this page.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    setFaqDraft({
                      question: "",
                      answer: "",
                      page: value,
                      sortOrder: nextSortOrder(faqs, value),
                      isActive: true,
                    })
                  }
                >
                  <Plus /> Add FAQ
                </Button>
              </div>
              <div className="mt-5 divide-y divide-border">
                {pageFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <MessageSquareText className="mt-1 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 font-medium">
                        {faq.question}
                        {faq.deletedAt ? <StatusBadge status="DELETED" label="Deleted" /> : !faq.isActive ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Hidden
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                        {faqAnswerPreview(faq.answer)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Display order: {faq.sortOrder}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {faq.deletedAt ? (
                        <RestoreButton url={`/api/admin/contact-us/faqs/${faq.id}`} itemName="FAQ" />
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${faq.question}`}
                            onClick={() => setFaqDraft(faq)}
                          >
                            <Edit2 />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${faq.question}`}
                            disabled={pending}
                            onClick={() => remove(faq.id)}
                          >
                            <X />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {!pageFaqs.length ? (
                  <p className="py-6 text-sm text-muted-foreground">
                    No FAQs assigned to this page yet.
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {faqDraft ? (
        <FaqDialog initial={faqDraft} close={() => setFaqDraft(null)} />
      ) : null}
    </div>
  );
}
