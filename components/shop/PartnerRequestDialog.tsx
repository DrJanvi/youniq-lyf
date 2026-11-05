"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/admin/ui/dialog";
import { CountryCodeSelector } from "@/components/shop/CountryCodeSelector";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import {
  getDefaultPartnerCountry,
  type PartnerCountry,
} from "@/lib/partner-countries";
import { partnerInterestOptions, partnerRequestSchema } from "@/lib/validation";
import { ArrowRight, Check } from "lucide-react";
import { useState, type FormEvent } from "react";

type PartnerField = "fullName" | "countryCode" | "phoneNumber" | "interest";
type PartnerErrors = Partial<Record<PartnerField, string>>;

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mt-1 text-xs text-red-700" role="alert">
      {message}
    </p>
  ) : null;
}

export function PartnerRequestDialog() {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<PartnerCountry>(
    getDefaultPartnerCountry,
  );
  const [selectedInterest, setSelectedInterest] = useState<string>();
  const [errors, setErrors] = useState<PartnerErrors>({});
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = partnerRequestSchema.safeParse({
      fullName: data.get("fullName"),
      countryCode: `+${selectedCountry.dialCode}`,
      phoneNumber: data.get("phoneNumber"),
      interest: data.get("interest"),
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        fullName: fieldErrors.fullName?.[0],
        countryCode: fieldErrors.countryCode?.[0],
        phoneNumber: fieldErrors.phoneNumber?.[0],
        interest: fieldErrors.interest?.[0],
      });
      setFeedback(null);
      return;
    }

    setPending(true);
    setErrors({});
    setFeedback(null);
    try {
      await apiFetch("/api/partner-requests", {
        method: "POST",
        json: result.data,
      });
      form.reset();
      setSelectedCountry(getDefaultPartnerCountry());
      setSelectedInterest(undefined);
      setFeedback({
        type: "success",
        text: "Thank you for your interest. Our team will be in touch with you.",
      });
    } catch (error) {
      if (
        error instanceof ClientApiError &&
        Object.keys(error.fieldErrors).length
      ) {
        setErrors({
          fullName: error.fieldErrors.fullName?.[0],
          countryCode: error.fieldErrors.countryCode?.[0],
          phoneNumber: error.fieldErrors.phoneNumber?.[0],
          interest: error.fieldErrors.interest?.[0],
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
              : "We could not submit your request. Please try again.",
        });
      }
    } finally {
      setPending(false);
    }
  }

  function clearError(field: PartnerField) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setErrors({});
          setFeedback(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <button className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white mt-8 flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium uppercase transition-colors">
          Become a Partner
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-full max-w-[min(100vw-2rem,76rem)]! gap-0 overflow-y-auto rounded-4xl border-0 bg-surface-main p-6 text-text-primary shadow-2xl sm:p-8 lg:p-14 [&>button]:top-5 [&>button]:right-5 [&>button]:size-11 [&>button]:rounded-full [&>button]:bg-surface-card [&>button]:p-3 [&>button]:opacity-70">
        <DialogHeader className="mb-8 text-left">
          <p className="font-cormorant text-xl tracking-wide text-brand-primary-dark italic">
            - partnerships
          </p>
          <DialogTitle className="font-cormorant text-4xl font-medium tracking-tight sm:text-5xl">
            Let’s Grow Together
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-sm text-text-muted sm:text-base">
            Tell us a little about yourself and our team will get in touch with
            you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="font-cormorant text-lg">
              Full Name <span aria-hidden="true">*</span>
              <input
                name="fullName"
                autoComplete="name"
                required
                maxLength={100}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? "partner-name-error" : undefined
                }
                onChange={() => clearError("fullName")}
                className="mt-2 h-14 w-full rounded-xl border border-surface-border bg-white px-5 font-sans text-base outline-none placeholder:text-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 aria-invalid:border-red-600"
                placeholder="Enter your name"
              />
              <FieldError id="partner-name-error" message={errors.fullName} />
            </label>

            <label className="font-cormorant text-lg">
              Mobile Number <span aria-hidden="true">*</span>
              <span
                className={`mt-2 flex h-14 w-full overflow-visible rounded-xl border bg-white focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 ${
                  errors.countryCode || errors.phoneNumber
                    ? "border-red-600"
                    : "border-surface-border"
                }`}
              >
                <CountryCodeSelector
                  selectedCountry={selectedCountry}
                  onSelect={(country) => {
                    setSelectedCountry(country);
                    clearError("countryCode");
                    clearError("phoneNumber");
                  }}
                />
                <input
                  name="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  required
                  maxLength={30}
                  aria-label="Mobile number"
                  aria-invalid={Boolean(errors.phoneNumber)}
                  aria-describedby={
                    errors.countryCode || errors.phoneNumber
                      ? "partner-phone-error"
                      : undefined
                  }
                  onChange={() => clearError("phoneNumber")}
                  className="min-w-0 flex-1 rounded-r-xl bg-transparent px-4 font-sans text-base outline-none placeholder:text-text-muted"
                  placeholder="Enter your mobile number"
                />
              </span>
              <FieldError
                id="partner-phone-error"
                message={errors.countryCode ?? errors.phoneNumber}
              />
            </label>
          </div>

          <fieldset
            aria-describedby={
              errors.interest ? "partner-interest-error" : undefined
            }
          >
            <legend className="font-cormorant text-lg">
              I’m interested as <span aria-hidden="true">*</span>
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {partnerInterestOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex min-h-27 cursor-pointer flex-col justify-center rounded-2xl border px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/50 ${
                    selectedInterest === option.value
                      ? "border-brand-primary bg-brand-primary-soft"
                      : "border-surface-border bg-white"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="interest"
                    value={option.value}
                    checked={selectedInterest === option.value}
                    required
                    onChange={() => {
                      setSelectedInterest(option.value);
                      clearError("interest");
                    }}
                    aria-describedby={
                      errors.interest ? "partner-interest-error" : undefined
                    }
                  />
                  <span className="font-cormorant text-xl font-semibold">
                    {option.label}
                  </span>
                  <span className="mt-1 text-sm text-text-muted">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
            <FieldError id="partner-interest-error" message={errors.interest} />
          </fieldset>

          {feedback ? (
            <p
              role={feedback.type === "error" ? "alert" : "status"}
              className={`text-center text-sm ${
                feedback.type === "success" ? "text-green-800" : "text-red-700"
              }`}
            >
              {feedback.text}
            </p>
          ) : null}

          <div className="flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-7 text-sm font-medium uppercase transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Submitting…" : "Submit Enquiry"}
              {pending ? (
                <span className="sr-only">Please wait</span>
              ) : feedback?.type === "success" ? (
                <Check className="size-5" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-5" aria-hidden="true" />
              )}
            </button>
            <p className="text-center text-sm text-text-muted">
              Your information will only be used to contact you regarding
              partnership opportunities.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
