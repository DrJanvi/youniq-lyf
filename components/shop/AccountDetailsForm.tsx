"use client";

import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { InternationalPhoneField } from "@/components/shop/InternationalPhoneField";
import { apiFetch } from "@/lib/client-api";
import {
  accountDetailsSchema,
  MAX_PHONE_DIGITS,
  todayDateOnly,
} from "@/lib/validation";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

type Values = {
  name: string;
  phone: string;
  gender: "" | "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  dateOfBirth: string;
};

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id} className="text-text-primary text-xs font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-badge-sale-text text-xs"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AccountDetailsForm({
  name,
  email,
  phone,
  gender,
  dateOfBirth,
}: {
  name: string;
  email: string;
  phone: string;
  gender: Values["gender"];
  dateOfBirth: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(accountDetailsSchema),
    mode: "onTouched",
    defaultValues: { name, phone, gender, dateOfBirth },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/api/account", { method: "PATCH", json: values });
      setMessage("Account details updated.");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to update account details.",
      );
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-x-4 gap-y-5 sm:grid-cols-2 sm:gap-y-4"
    >
      <Field id="account-name" label="Full Name *" error={errors.name?.message}>
        <Input
          id="account-name"
          autoComplete="name"
          placeholder="Your full name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "account-name-error" : undefined}
          className="rounded-full"
          {...register("name")}
        />
      </Field>
      <Field
        id="account-phone"
        label="Phone Number"
        error={errors.phone?.message}
      >
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <InternationalPhoneField
              id="account-phone"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              autoComplete="tel-national"
              invalid={!!errors.phone}
              describedBy={errors.phone ? "account-phone-error" : undefined}
              className="rounded-full"
            />
          )}
        />
        <p className="text-text-muted text-xs">
          Maximum {MAX_PHONE_DIGITS} digits, including country code.
        </p>
      </Field>
      <Field id="account-email" label="Email Address *">
        <Input
          id="account-email"
          type="email"
          autoComplete="email"
          className="rounded-full"
          value={email}
          readOnly
        />
      </Field>
      <Field id="account-gender" label="Gender" error={errors.gender?.message}>
        <div className="relative">
          <select
            id="account-gender"
            className="border-surface-border text-text-primary focus-visible:border-brand-taupe focus-visible:ring-brand-taupe/40 h-12 w-full appearance-none rounded-full border bg-white px-4 text-sm outline-none focus-visible:ring-2"
            aria-invalid={!!errors.gender}
            aria-describedby={
              errors.gender ? "account-gender-error" : undefined
            }
            {...register("gender")}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" />
        </div>
      </Field>
      <Field
        id="account-date-of-birth"
        label="Date of Birth"
        error={errors.dateOfBirth?.message}
      >
        <Input
          id="account-date-of-birth"
          type="date"
          max={todayDateOnly()}
          autoComplete="bday"
          aria-invalid={!!errors.dateOfBirth}
          className="rounded-full"
          aria-describedby={
            errors.dateOfBirth ? "account-date-of-birth-error" : undefined
          }
          {...register("dateOfBirth")}
        />
      </Field>
      <div className="flex flex-col items-start gap-3 sm:col-span-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-taupe hover:bg-brand-taupe-dark h-11 w-auto rounded-full px-5 text-xs font-medium uppercase"
        >
          {isSubmitting ? "Updating..." : "Update Account Details"}
        </Button>
        {message ? (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-badge-sale-text text-sm">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
