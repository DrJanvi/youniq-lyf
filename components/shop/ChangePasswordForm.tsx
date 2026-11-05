"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { apiFetch } from "@/lib/client-api";
import { changePasswordSchema } from "@/lib/validation";

type Values = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
      <Label htmlFor={id} className="text-xs font-medium text-text-primary">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-badge-sale-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ChangePasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/api/account/password", {
        method: "PATCH",
        json: values,
      });
      reset();
      setMessage("Your password has been updated.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to update your password.",
      );
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-x-4 gap-y-5 sm:grid-cols-2 sm:gap-y-4"
    >
      <Field
        id="change-password-current"
        label="Old Password"
        error={errors.currentPassword?.message}
      >
        <Input
          id="change-password-current"
          type="password"
          autoComplete="current-password"
          placeholder="Old Password"
          maxLength={72}
          aria-invalid={!!errors.currentPassword}
          aria-describedby={
            errors.currentPassword ? "change-password-current-error" : undefined
          }
          {...register("currentPassword")}
        />
      </Field>
      <Field
        id="change-password-new"
        label="New Password"
        error={errors.newPassword?.message}
      >
        <Input
          id="change-password-new"
          type="password"
          autoComplete="new-password"
          placeholder="New Password"
          maxLength={72}
          aria-invalid={!!errors.newPassword}
          aria-describedby={
            errors.newPassword ? "change-password-new-error" : undefined
          }
          {...register("newPassword")}
        />
      </Field>
      <Field
        id="change-password-confirm"
        label="Confirm New Password"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="change-password-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm New Password"
          maxLength={72}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword ? "change-password-confirm-error" : undefined
          }
          {...register("confirmPassword")}
        />
      </Field>
      <div className="flex flex-col items-start gap-3 sm:col-span-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white h-10 w-auto rounded-full px-5 text-xs font-medium uppercase tracking-wide"
        >
          {isSubmitting ? "Updating..." : "Update Password"}
          <ArrowRight className="ml-2 size-4" aria-hidden="true" />
        </Button>
        {message ? (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-badge-sale-text">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
