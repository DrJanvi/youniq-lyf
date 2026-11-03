"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/admin/ui/dialog";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { partnerCountries } from "@/lib/partner-countries";
import { partnerInterestOptions, partnerRequestSchema } from "@/lib/validation";
import { ArrowRight, Check, ChevronDown, Search } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useMemo, useState, type FormEvent } from "react";

type PartnerField = "fullName" | "countryCode" | "phoneNumber" | "interest";
type PartnerErrors = Partial<Record<PartnerField, string>>;

function getUnitedArabEmirates() {
  const country = partnerCountries.find((option) => option.iso2 === "ae");
  if (!country)
    throw new Error("The country list must include the United Arab Emirates.");
  return country;
}

const unitedArabEmirates = getUnitedArabEmirates();

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mt-1 text-xs text-red-700" role="alert">
      {message}
    </p>
  ) : null;
}

function CountryCodeSelector({
  selectedCountry,
  onSelect,
}: {
  selectedCountry: (typeof partnerCountries)[number];
  onSelect: (country: (typeof partnerCountries)[number]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredCountries = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return partnerCountries;
    return partnerCountries.filter((country) =>
      `${country.name} +${country.dialCode}`
        .toLocaleLowerCase()
        .includes(search),
    );
  }, [query]);

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setQuery("");
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={`Country calling code: ${selectedCountry.name} +${selectedCountry.dialCode}`}
          className="inline-flex h-full shrink-0 items-center gap-1 border-r border-[#eee8e5] px-4 text-sm text-[#4c4542] outline-none focus-visible:ring-2 focus-visible:ring-[#b99082] focus-visible:ring-inset"
        >
          +{selectedCountry.dialCode}
          <ChevronDown className="size-4 text-[#8d817c]" aria-hidden="true" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-70 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#eee8e5] bg-white p-2 text-[#251f1d] shadow-xl outline-none"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8d817c]"
              aria-hidden="true"
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search country or code"
              aria-label="Search country calling codes"
              className="h-10 w-full rounded-xl border border-[#eee8e5] bg-white pr-3 pl-9 text-sm outline-none placeholder:text-[#aaa] focus:border-[#b99082] focus:ring-2 focus:ring-[#b99082]/20"
            />
          </div>
          <div
            role="listbox"
            aria-label="Country calling codes"
            className="mt-2 max-h-64 overflow-y-auto overscroll-contain"
          >
            {filteredCountries.map((country) => {
              const isSelected = country.iso2 === selectedCountry.iso2;
              return (
                <button
                  key={country.iso2}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(country);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f8f2ef] focus-visible:bg-[#f8f2ef] focus-visible:outline-none"
                >
                  <span>{country.name}</span>
                  <span className="shrink-0 text-[#746963]">
                    +{country.dialCode}
                  </span>
                </button>
              );
            })}
            {!filteredCountries.length ? (
              <p className="px-3 py-5 text-center text-sm text-[#746963]">
                No matching country codes
              </p>
            ) : null}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export function PartnerRequestDialog() {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(unitedArabEmirates);
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
      setSelectedCountry(unitedArabEmirates);
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
        <button className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#743238] px-6 py-3 font-medium text-white uppercase hover:bg-black">
          Become a Partner
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-full max-w-[min(100vw-2rem,76rem)]! gap-0 overflow-y-auto rounded-4xl border-0 bg-[#fffcf9] p-6 text-[#292321] shadow-2xl sm:p-8 lg:p-14 [&>button]:top-5 [&>button]:right-5 [&>button]:size-11 [&>button]:rounded-full [&>button]:bg-[#fbf4f1] [&>button]:p-3 [&>button]:opacity-70">
        <DialogHeader className="mb-8 text-left">
          <p className="font-cormorant text-xl tracking-wide text-[#8e5947] italic">
            - partnerships
          </p>
          <DialogTitle className="font-cormorant text-4xl font-medium tracking-tight sm:text-5xl">
            Let’s Grow Together
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-sm text-[#77716e] sm:text-base">
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
                className="mt-2 h-14 w-full rounded-xl border border-[#eee8e5] bg-white px-5 font-sans text-base outline-none placeholder:text-[#777] focus:border-[#b99082] focus:ring-2 focus:ring-[#b99082]/20 aria-invalid:border-red-600"
                placeholder="Enter your name"
              />
              <FieldError id="partner-name-error" message={errors.fullName} />
            </label>

            <label className="font-cormorant text-lg">
              Mobile Number <span aria-hidden="true">*</span>
              <span
                className={`mt-2 flex h-14 w-full overflow-visible rounded-xl border bg-white focus-within:border-[#b99082] focus-within:ring-2 focus-within:ring-[#b99082]/20 ${
                  errors.countryCode || errors.phoneNumber
                    ? "border-red-600"
                    : "border-[#eee8e5]"
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
                  className="min-w-0 flex-1 rounded-r-xl bg-transparent px-4 font-sans text-base outline-none placeholder:text-[#777]"
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
                  className={`flex min-h-27 cursor-pointer flex-col justify-center rounded-2xl border px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-[#b99082]/50 ${
                    selectedInterest === option.value
                      ? "border-[#b99082] bg-[#faf4f1]"
                      : "border-[#eee8e5] bg-white"
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
                  <span className="mt-1 text-sm text-[#77716e]">
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
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#b99082] px-7 text-sm font-medium text-white uppercase transition-colors hover:bg-[#8e5947] disabled:cursor-wait disabled:opacity-60"
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
            <p className="text-center text-sm text-[#9b9088]">
              Your information will only be used to contact you regarding
              partnership opportunities.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
