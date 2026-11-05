"use client";

import { CountryCodeSelector } from "@/components/shop/CountryCodeSelector";
import {
  CAREER_RESUME_ACCEPT,
  getCareerResumeMetadataError,
  MAX_CAREER_RESUME_SIZE,
} from "@/lib/career-upload";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import {
  getDefaultPartnerCountry,
  type PartnerCountry,
} from "@/lib/partner-countries";
import {
  careerApplicationSchema,
  careerJobRoleOptions,
} from "@/lib/validation";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { ArrowRight, FileText, Upload, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

type CareerField =
  | "fullName"
  | "email"
  | "jobRole"
  | "countryCode"
  | "phoneNumber"
  | "consent"
  | "resume";

type CareerErrors = Partial<Record<CareerField, string>>;

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mt-1 text-xs text-red-700" role="alert">
      {message}
    </p>
  ) : null;
}

function getResumeSizeLabel(size: number) {
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function CareerApplicationForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<PartnerCountry>(
    getDefaultPartnerCountry,
  );
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<CareerErrors>({});
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pending, setPending] = useState(false);

  function clearError(field: CareerField) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function selectResume(file: File | null) {
    setResume(file);
    setErrors((current) => ({
      ...current,
      resume: file
        ? (getCareerResumeMetadataError(file) ?? undefined)
        : undefined,
    }));
    setFeedback(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const resumeError = resume
      ? getCareerResumeMetadataError(resume)
      : "Choose a resume to upload.";
    const result = careerApplicationSchema.safeParse({
      fullName: data.get("fullName"),
      email: data.get("email"),
      jobRole: data.get("jobRole"),
      countryCode: `+${selectedCountry.dialCode}`,
      phoneNumber: data.get("phoneNumber"),
      consent: data.get("consent") === "on",
    });

    if (!result.success || !resume || resumeError) {
      const fieldErrors = result.success
        ? {}
        : result.error.flatten().fieldErrors;
      setErrors({
        fullName: fieldErrors.fullName?.[0],
        email: fieldErrors.email?.[0],
        jobRole: fieldErrors.jobRole?.[0],
        countryCode: fieldErrors.countryCode?.[0],
        phoneNumber: fieldErrors.phoneNumber?.[0],
        consent: fieldErrors.consent?.[0],
        resume: resumeError ?? undefined,
      });
      setFeedback(null);
      return;
    }

    const requestBody = new FormData();
    for (const [name, value] of Object.entries(result.data)) {
      requestBody.set(name, String(value));
    }
    requestBody.set("resume", resume);

    setPending(true);
    setErrors({});
    setFeedback(null);
    try {
      await apiFetch("/api/career-applications", {
        method: "POST",
        body: requestBody,
      });
      form.reset();
      setResume(null);
      setSelectedCountry(getDefaultPartnerCountry());
      setFeedback({
        type: "success",
        text: "Thank you for applying. We’ll be in touch if your experience is a match.",
      });
    } catch (error) {
      if (
        error instanceof ClientApiError &&
        Object.keys(error.fieldErrors).length
      ) {
        setErrors({
          fullName: error.fieldErrors.fullName?.[0],
          email: error.fieldErrors.email?.[0],
          jobRole: error.fieldErrors.jobRole?.[0],
          countryCode: error.fieldErrors.countryCode?.[0],
          phoneNumber: error.fieldErrors.phoneNumber?.[0],
          consent: error.fieldErrors.consent?.[0],
          resume: error.fieldErrors.resume?.[0],
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
              : "We could not submit your application. Please try again.",
        });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="text-text-primary flex flex-col gap-4"
    >
      <div className="grid gap-x-3 gap-y-3 sm:grid-cols-2">
        <label className="text-xs font-semibold">
          Full Name <span aria-hidden="true">*</span>
          <input
            name="fullName"
            autoComplete="name"
            required
            maxLength={100}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "career-name-error" : undefined}
            onChange={() => clearError("fullName")}
            className="focus:border-brand-primary focus:ring-brand-primary/20 mt-2 h-10 w-full rounded-full border border-surface-border bg-white px-4 text-sm font-normal outline-none placeholder:text-text-muted focus:ring-2 aria-invalid:border-red-600"
            placeholder="Your full name"
          />
          <FieldError id="career-name-error" message={errors.fullName} />
        </label>

        <label className="text-xs font-semibold">
          Email Address <span aria-hidden="true">*</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={190}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "career-email-error" : undefined}
            onChange={() => clearError("email")}
            className="focus:border-brand-primary focus:ring-brand-primary/20 mt-2 h-10 w-full rounded-full border border-surface-border bg-white px-4 text-sm font-normal outline-none placeholder:text-text-muted focus:ring-2 aria-invalid:border-red-600"
            placeholder="you@email.com"
          />
          <FieldError id="career-email-error" message={errors.email} />
        </label>

        <label className="text-xs font-semibold">
          Job Role <span aria-hidden="true">*</span>
          <div className="relative mt-2">
            <select
              name="jobRole"
              required
              defaultValue=""
              aria-invalid={Boolean(errors.jobRole)}
              aria-describedby={
                errors.jobRole ? "career-role-error" : undefined
              }
              onChange={() => clearError("jobRole")}
              className="focus:border-brand-primary focus:ring-brand-primary/20 h-10 w-full appearance-none rounded-full border border-surface-border bg-white px-4 pr-10 text-sm font-normal text-text-muted outline-none focus:ring-2 aria-invalid:border-red-600"
            >
              <option value="" disabled>
                Select a role
              </option>
              {careerJobRoleOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" />
          </div>
          <FieldError id="career-role-error" message={errors.jobRole} />
        </label>

        <label className="text-xs font-semibold">
          Phone Number <span aria-hidden="true">*</span>
          <span
            className={`focus-within:border-brand-primary focus-within:ring-brand-primary/20 mt-2 flex h-10 w-full overflow-hidden rounded-full border bg-white focus-within:ring-2 ${
              errors.phoneNumber ? "border-red-600" : "border-surface-border"
            }`}
          >
            <CountryCodeSelector
              selectedCountry={selectedCountry}
              onSelect={(country) => {
                setSelectedCountry(country);
                clearError("countryCode");
                clearError("phoneNumber");
              }}
              className="focus-visible:ring-brand-primary/40 inline-flex h-full shrink-0 items-center gap-1 border-r border-surface-border px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-inset"
            />
            <input
              name="phoneNumber"
              type="tel"
              autoComplete="tel-national"
              inputMode="tel"
              required
              maxLength={30}
              aria-invalid={Boolean(errors.phoneNumber)}
              aria-describedby={
                errors.phoneNumber ? "career-phone-error" : undefined
              }
              onChange={() => clearError("phoneNumber")}
              className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-normal outline-none placeholder:text-text-muted"
              placeholder="6543210987"
            />
          </span>
          <FieldError id="career-phone-error" message={errors.phoneNumber} />
          {errors.countryCode ? (
            <FieldError
              id="career-country-error"
              message={errors.countryCode}
            />
          ) : null}
        </label>
      </div>

      <div>
        <span className="text-xs font-semibold">
          Resume / CV <span aria-hidden="true">*</span>
        </span>
        <div className="relative mt-2">
          <input
            ref={fileInputRef}
            id="career-resume"
            name="resume"
            type="file"
            accept={CAREER_RESUME_ACCEPT}
            aria-invalid={Boolean(errors.resume)}
            aria-describedby={errors.resume ? "career-resume-error" : undefined}
            onChange={(event) =>
              selectResume(event.currentTarget.files?.[0] ?? null)
            }
            className="peer sr-only"
          />
          <label
            htmlFor="career-resume"
            className="border-brand-primary/30 bg-brand-primary-soft text-brand-primary-dark peer-focus-visible:ring-brand-primary flex min-h-[68px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-3 text-center transition-colors peer-focus-visible:ring-2 hover:bg-brand-primary/15"
          >
            {resume ? (
              <>
                <span className="flex max-w-full items-center gap-2 text-sm font-medium">
                  <FileText className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{resume.name}</span>
                </span>
                <span className="text-xs text-text-muted">
                  {getResumeSizeLabel(resume.size)} · Click to replace
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Upload className="size-4" aria-hidden="true" />
                  Upload your resume
                </span>
                <span className="text-xs text-text-muted">
                  PDF, DOC, DOCX · Max 5 MB
                </span>
              </>
            )}
          </label>
          {resume ? (
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                selectResume(null);
              }}
              aria-label="Remove selected resume"
              className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-white text-brand-primary-dark shadow-sm hover:bg-brand-primary/10"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <FieldError id="career-resume-error" message={errors.resume} />
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
        <input
          name="consent"
          type="checkbox"
          required
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? "career-consent-error" : undefined}
          onChange={() => clearError("consent")}
          className="accent-brand-primary mt-0.5 size-4 shrink-0"
        />
        <span>
          I agree that Youniqlyf may use my details to contact me about career
          opportunities.
          <FieldError id="career-consent-error" message={errors.consent} />
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
        disabled={
          pending || (resume !== null && resume.size > MAX_CAREER_RESUME_SIZE)
        }
        className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-md transition-colors disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Application"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}
