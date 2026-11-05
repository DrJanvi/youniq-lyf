"use client";

import { apiFetch, ClientApiError } from "@/lib/client-api";
import { contactSubjects, contactSubmissionSchema } from "@/lib/validation";
import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";

type ContactField =
  "fullName" | "phone" | "email" | "subject" | "message" | "consent";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-xs text-red-700" role="alert">
      {message}
    </p>
  ) : null;
}

export function ContactForm() {
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>(
    {},
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = contactSubmissionSchema.safeParse({
      fullName: data.get("fullName"),
      phone: data.get("phone"),
      email: data.get("email"),
      subject: data.get("subject"),
      message: data.get("message"),
      consent: data.get("consent") === "on",
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        fullName: fieldErrors.fullName?.[0],
        phone: fieldErrors.phone?.[0],
        email: fieldErrors.email?.[0],
        subject: fieldErrors.subject?.[0],
        message: fieldErrors.message?.[0],
        consent: fieldErrors.consent?.[0],
      });
      setFeedback(null);
      return;
    }

    setPending(true);
    setErrors({});
    setFeedback(null);
    try {
      await apiFetch("/api/contact", { method: "POST", json: result.data });
      form.reset();
      setFeedback({
        type: "success",
        text: "Thank you for getting in touch. Our team will respond as soon as possible.",
      });
    } catch (error) {
      if (
        error instanceof ClientApiError &&
        Object.keys(error.fieldErrors).length
      ) {
        setErrors({
          fullName: error.fieldErrors.fullName?.[0],
          phone: error.fieldErrors.phone?.[0],
          email: error.fieldErrors.email?.[0],
          subject: error.fieldErrors.subject?.[0],
          message: error.fieldErrors.message?.[0],
          consent: error.fieldErrors.consent?.[0],
        });
        setFeedback({
          type: "error",
          text: "Please review the highlighted fields and try again.",
        });
      } else {
        setFeedback({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "We could not send your message. Please try again.",
        });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
        <label className="text-brand-espresso text-xs font-semibold">
          Full Name <span aria-hidden="true">*</span>
          <input
            name="fullName"
            autoComplete="name"
            required
            maxLength={100}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={
              errors.fullName ? "contact-name-error" : undefined
            }
            className="focus:border-brand-taupe focus:ring-brand-taupe/20 mt-2 h-12 w-full rounded-xl border border-[#eee8e5] bg-white px-4 text-sm font-normal outline-none placeholder:text-[#aaa] focus:ring-2 aria-invalid:border-red-600"
            placeholder="Your full name"
          />
          <div id="contact-name-error">
            <FieldError message={errors.fullName} />
          </div>
        </label>
        <label className="text-brand-espresso text-xs font-semibold">
          Email Address <span aria-hidden="true">*</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={190}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className="focus:border-brand-taupe focus:ring-brand-taupe/20 mt-2 h-12 w-full rounded-xl border border-[#eee8e5] bg-white px-4 text-sm font-normal outline-none placeholder:text-[#aaa] focus:ring-2 aria-invalid:border-red-600"
            placeholder="you@email.com"
          />
          <div id="contact-email-error">
            <FieldError message={errors.email} />
          </div>
        </label>
        <label className="text-brand-espresso text-xs font-semibold">
          Phone Number <span aria-hidden="true">*</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            maxLength={30}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
            className="focus:border-brand-taupe focus:ring-brand-taupe/20 mt-2 h-12 w-full rounded-xl border border-[#eee8e5] bg-white px-4 text-sm font-normal outline-none placeholder:text-[#aaa] focus:ring-2 aria-invalid:border-red-600"
            placeholder="+966 55 000 0000"
          />
          <div id="contact-phone-error">
            <FieldError message={errors.phone} />
          </div>
        </label>
        <label className="text-brand-espresso text-xs font-semibold">
          Subject <span aria-hidden="true">*</span>
          <select
            name="subject"
            required
            defaultValue=""
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={
              errors.subject ? "contact-subject-error" : undefined
            }
            className="focus:border-brand-taupe focus:ring-brand-taupe/20 mt-2 h-12 w-full rounded-xl border border-[#eee8e5] bg-white px-4 text-sm font-normal text-[#777] outline-none focus:ring-2 aria-invalid:border-red-600"
          >
            <option value="" disabled>
              Select a subject
            </option>
            {contactSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <div id="contact-subject-error">
            <FieldError message={errors.subject} />
          </div>
        </label>
      </div>

      <label className="text-brand-espresso text-xs font-semibold">
        Message <span aria-hidden="true">*</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          className="focus:border-brand-taupe focus:ring-brand-taupe/20 mt-2 w-full resize-y rounded-xl border border-[#eee8e5] bg-white px-4 py-3 text-sm font-normal outline-none placeholder:text-[#aaa] focus:ring-2 aria-invalid:border-red-600"
          placeholder="Tell us how we can help..."
        />
        <div id="contact-message-error">
          <FieldError message={errors.message} />
        </div>
      </label>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-[#777]">
        <input
          name="consent"
          type="checkbox"
          required
          aria-invalid={Boolean(errors.consent)}
          className="accent-brand-taupe mt-0.5 size-4 shrink-0"
        />
        <span>
          I agree that Youniqlyf may use my details to respond to this enquiry.{" "}
          <span aria-hidden="true">*</span>
          <FieldError message={errors.consent} />
        </span>
      </label>

      {feedback ? (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={
            feedback.type === "success"
              ? "text-sm text-green-800"
              : "text-sm text-red-700"
          }
        >
          {feedback.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-taupe hover:bg-brand-taupe-dark flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_7px_16px_-7px_rgba(90,53,38,.45)] transition-colors disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send Message"}
        {!pending ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
      </button>
    </form>
  );
}
