"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/shadcn/input-otp";
import { Label } from "@/components/shadcn/label";
import { FormMessage } from "@/components/ui/FormMessage";
import { apiFetch } from "@/lib/client-api";
import {
  passwordResetRequestSchema,
  passwordResetSchema,
} from "@/lib/validation";

type RequestValues = z.input<typeof passwordResetRequestSchema>;
type ResetValues = z.input<typeof passwordResetSchema>;

const RESEND_SECONDS = 60;
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";
const requestInfo =
  "If an account exists for this email, follow the password reset instructions sent to your inbox.";

export function PasswordRecoveryForm({
  initialEmail,
  onBack,
  onComplete,
}: {
  initialEmail: string;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: initialEmail },
  });
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: initialEmail,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!sentEmail || cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [sentEmail, cooldown]);

  async function requestCode(email: string) {
    await apiFetch("/api/auth/password-reset/request-code", {
      method: "POST",
      json: { email },
    });
    setSentEmail(email);
    resetForm.reset({
      email,
      code: "",
      newPassword: "",
      confirmPassword: "",
    });
    setCooldown(RESEND_SECONDS);
    setError(null);
    setInfo(requestInfo);
  }

  const submitRequest = requestForm.handleSubmit(async ({ email }) => {
    setError(null);
    setInfo(null);
    try {
      await requestCode(email);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  });

  const submitReset = resetForm.handleSubmit(async (values) => {
    setError(null);
    setInfo(null);
    try {
      await apiFetch("/api/auth/password-reset/confirm", {
        method: "POST",
        json: values,
      });
      onComplete();
    } catch (resetError) {
      setError(errorMessage(resetError));
      resetForm.setValue("code", "");
    }
  });

  async function resendCode() {
    if (!sentEmail) return;
    setError(null);
    setInfo(null);
    try {
      await requestCode(sentEmail);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  }

  if (!sentEmail) {
    return (
      <form onSubmit={submitRequest} noValidate className="flex flex-col gap-5">
        <div>
          <h2 className="font-cormorant text-text-primary text-3xl font-semibold">
            Forgot your password?
          </h2>
          <p className="text-text-muted mt-2 text-sm">
            Enter your email address and we&apos;ll send a password reset code
            if an account exists.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="reset-request-email">Email</Label>
          <Input
            id="reset-request-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            aria-invalid={!!requestForm.formState.errors.email}
            {...requestForm.register("email")}
          />
          {requestForm.formState.errors.email ? (
            <p role="alert" className="text-badge-sale-text text-xs">
              {requestForm.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <FormMessage error={error} />
        <Button type="submit" disabled={requestForm.formState.isSubmitting}>
          {requestForm.formState.isSubmitting
            ? "Sending..."
            : "Send reset code"}
        </Button>
        <button type="button" onClick={onBack} className={linkButton}>
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submitReset} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="font-cormorant text-text-primary text-3xl font-semibold">
          Reset your password
        </h2>
        <p className="text-text-muted mt-2 text-sm">
          Enter the 6-digit code sent to{" "}
          <strong className="text-text-primary">{sentEmail}</strong>, then
          choose a new password.
        </p>
      </div>
      <input type="hidden" {...resetForm.register("email")} />
      <div className="flex flex-col items-center gap-2">
        <p className="text-text-primary text-sm font-medium">
          Verification code
        </p>
        <Controller
          control={resetForm.control}
          name="code"
          render={({ field }) => (
            <InputOTP
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              pattern="^[0-9]*$"
              pasteTransformer={(text) => text.replace(/\D/g, "").slice(0, 6)}
              aria-label="Password reset code"
              aria-invalid={!!resetForm.formState.errors.code}
              disabled={resetForm.formState.isSubmitting}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        />
        {resetForm.formState.errors.code ? (
          <p role="alert" className="text-badge-sale-text text-xs">
            {resetForm.formState.errors.code.message}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-new-password">New password</Label>
        <Input
          id="reset-new-password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a new password"
          aria-invalid={!!resetForm.formState.errors.newPassword}
          {...resetForm.register("newPassword")}
        />
        {resetForm.formState.errors.newPassword ? (
          <p role="alert" className="text-badge-sale-text text-xs">
            {resetForm.formState.errors.newPassword.message}
          </p>
        ) : (
          <p className="text-text-muted text-xs">
            At least 8 characters, including a letter and a number.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-confirm-password">Confirm new password</Label>
        <Input
          id="reset-confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          aria-invalid={!!resetForm.formState.errors.confirmPassword}
          {...resetForm.register("confirmPassword")}
        />
        {resetForm.formState.errors.confirmPassword ? (
          <p role="alert" className="text-badge-sale-text text-xs">
            {resetForm.formState.errors.confirmPassword.message}
          </p>
        ) : null}
      </div>
      <FormMessage error={error} success={info} />
      <Button type="submit" disabled={resetForm.formState.isSubmitting}>
        {resetForm.formState.isSubmitting ? "Updating..." : "Reset password"}
      </Button>
      <p className="text-text-muted text-center text-sm">
        Didn&apos;t receive a code?{" "}
        <button
          type="button"
          onClick={() => void resendCode()}
          disabled={cooldown > 0 || resetForm.formState.isSubmitting}
          className={`${linkButton} disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60`}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </p>
      <button
        type="button"
        onClick={() => {
          setSentEmail(null);
          setError(null);
          setInfo(null);
        }}
        className={linkButton}
      >
        Change email
      </button>
    </form>
  );
}

const linkButton =
  "cursor-pointer font-medium text-text-primary hover:underline";
