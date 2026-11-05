"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InternationalPhoneField } from "@/components/shop/InternationalPhoneField";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/shadcn/input-otp";
import { Label } from "@/components/shadcn/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import { FormMessage } from "@/components/ui/FormMessage";
import { apiFetch } from "@/lib/client-api";
import {
  customerLoginSchema,
  MAX_PHONE_DIGITS,
  otpCodeSchema,
  registerSchema,
  todayDateOnly,
} from "@/lib/validation";

const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type LoginValues = z.input<typeof customerLoginSchema>;
type RegisterValues = z.input<typeof registerFormSchema>;
type RegisterPayload = z.output<typeof registerSchema>;

const RESEND_SECONDS = 60;
const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        <span className="text-badge-sale-text">*</span>
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-text-muted text-xs">{hint}</p>
      ) : null}
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

const linkButton =
  "cursor-pointer font-medium text-brand-espresso hover:underline";

function SignInForm({
  next,
  onSwitch,
}: {
  next: string;
  onSwitch: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(customerLoginSchema),
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const result = await apiFetch<{ recovered?: boolean }>(
        "/api/auth/login",
        { method: "POST", json: values },
      );
      router.replace(result.recovered ? "/account?recovered=1" : next);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field id="login-email" label="Email" error={errors.email?.message}>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...register("email")}
        />
      </Field>
      <Field
        id="login-password"
        label="Password"
        error={errors.password?.message}
      >
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          aria-invalid={!!errors.password}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          {...register("password")}
        />
      </Field>
      <FormMessage error={error} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-text-muted text-center text-sm">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className={linkButton}>
          Register
        </button>
      </p>
    </form>
  );
}

function VerifyStep({
  email,
  onBack,
  onVerify,
  onResend,
}: {
  email: string;
  onBack: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ code: string }>({
    resolver: zodResolver(z.object({ code: otpCodeSchema })),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = handleSubmit(async ({ code }) => {
    setError(null);
    setInfo(null);
    try {
      await onVerify(code);
    } catch (e) {
      setError(errorMessage(e));
      reset({ code: "" });
    }
  });

  async function resend() {
    setError(null);
    setInfo(null);
    try {
      await onResend();
      reset({ code: "" });
      setCooldown(RESEND_SECONDS);
      setInfo("A new code has been sent.");
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col items-center gap-6 text-center"
    >
      <h2 className="font-cormorant text-brand-espresso text-3xl font-semibold">
        Verify your email
      </h2>
      <p className="text-text-muted text-sm">
        Enter the 6-digit code sent to{" "}
        <strong className="text-text-primary">{email}</strong>
      </p>
      <Controller
        control={control}
        name="code"
        render={({ field }) => (
          <InputOTP
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            pattern="^[0-9]*$"
            pasteTransformer={(text) => text.replace(/\D/g, "").slice(0, 6)}
            aria-label="Confirmation code"
            aria-invalid={!!errors.code}
            disabled={isSubmitting}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            onComplete={() => void submit()}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        )}
      />
      {errors.code ? (
        <p role="alert" className="text-badge-sale-text -mt-3 text-xs">
          {errors.code.message}
        </p>
      ) : null}
      <FormMessage error={error} success={info} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Verifying..." : "Verify"}
      </Button>
      <div className="text-text-muted flex flex-col gap-1 text-sm">
        <p>
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0 || isSubmitting}
            className={`${linkButton} disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60`}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </p>
        <button
          type="button"
          onClick={onBack}
          className="hover:text-brand-espresso cursor-pointer hover:underline"
        >
          Change details
        </button>
      </div>
    </form>
  );
}

function RegisterForm({
  next,
  onSwitch,
}: {
  next: string;
  onSwitch: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<RegisterPayload | null>(null);
  const {
    control,
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerFormSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      password: "",
      confirmPassword: "",
    },
  });

  const requestCode = (payload: RegisterPayload) =>
    apiFetch("/api/auth/register/request-code", {
      method: "POST",
      json: payload,
    });

  const onSubmit = handleSubmit(
    async ({ firstName, lastName, email, phone, gender, dateOfBirth, password }) => {
      setError(null);
      const payload = registerSchema.parse({
        firstName,
        lastName,
        email,
        phone,
        gender,
        dateOfBirth,
        password,
      });
      try {
        await requestCode(payload);
        setPending(payload);
      } catch (e) {
        setError(errorMessage(e));
      }
    },
  );

  if (pending) {
    return (
      <VerifyStep
        email={pending.email}
        onBack={() => setPending(null)}
        onResend={async () => {
          await requestCode(pending);
        }}
        onVerify={async (code) => {
          await apiFetch("/api/auth/register", {
            method: "POST",
            json: { ...pending, code },
          });
          router.replace(next);
          router.refresh();
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field
        id="reg-first"
        label="First name"
        error={errors.firstName?.message}
      >
        <Input
          id="reg-first"
          autoComplete="given-name"
          placeholder="Enter your first name"
          aria-invalid={!!errors.firstName}
          aria-describedby={errors.firstName ? "reg-first-error" : undefined}
          {...register("firstName")}
        />
      </Field>
      <Field id="reg-last" label="Last name" error={errors.lastName?.message}>
        <Input
          id="reg-last"
          autoComplete="family-name"
          placeholder="Enter your last name"
          aria-invalid={!!errors.lastName}
          aria-describedby={errors.lastName ? "reg-last-error" : undefined}
          {...register("lastName")}
        />
      </Field>
      <Field id="reg-email" label="Email" error={errors.email?.message}>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "reg-email-error" : undefined}
          {...register("email")}
        />
      </Field>
      <Field
        id="reg-phone"
        label="Phone number"
        error={errors.phone?.message}
        hint={`Maximum ${MAX_PHONE_DIGITS} digits, including country code.`}
      >
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <InternationalPhoneField
              id="reg-phone"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              invalid={!!errors.phone}
              describedBy={errors.phone ? "reg-phone-error" : undefined}
              className="rounded-lg"
            />
          )}
        />
      </Field>
      <Field id="reg-gender" label="Gender" error={errors.gender?.message}>
        <select
          id="reg-gender"
          className="h-12 w-full rounded-lg border border-surface-border bg-white px-4 text-sm text-text-primary outline-none focus-visible:border-brand-taupe focus-visible:ring-2 focus-visible:ring-brand-taupe/40"
          aria-invalid={!!errors.gender}
          aria-describedby={errors.gender ? "reg-gender-error" : undefined}
          {...register("gender")}
        >
          <option value="">Select gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </select>
      </Field>
      <Field
        id="reg-date-of-birth"
        label="Date of birth"
        error={errors.dateOfBirth?.message}
      >
        <Input
          id="reg-date-of-birth"
          type="date"
          max={todayDateOnly()}
          autoComplete="bday"
          aria-invalid={!!errors.dateOfBirth}
          aria-describedby={
            errors.dateOfBirth ? "reg-date-of-birth-error" : undefined
          }
          {...register("dateOfBirth")}
        />
      </Field>
      <Field
        id="reg-password"
        label="Password"
        error={errors.password?.message}
        hint="Must be at least 8 characters, with a letter and a number."
      >
        <Input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "reg-password-error" : undefined}
          {...register("password", {
            onChange: () => {
              if (getValues("confirmPassword")) void trigger("confirmPassword");
            },
          })}
        />
      </Field>
      <Field
        id="reg-confirm"
        label="Confirm password"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="reg-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword ? "reg-confirm-error" : undefined
          }
          {...register("confirmPassword")}
        />
      </Field>
      <FormMessage error={error} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending code..." : "Send confirmation code"}
      </Button>
      <p className="text-text-muted text-center text-sm">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className={linkButton}>
          Sign In
        </button>
      </p>
    </form>
  );
}

export function LoginForm({ next = "/" }: { next?: string }) {
  const [tab, setTab] = useState("login");
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="login">Sign In</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <SignInForm next={next} onSwitch={() => setTab("register")} />
      </TabsContent>
      <TabsContent value="register">
        <RegisterForm next={next} onSwitch={() => setTab("login")} />
      </TabsContent>
    </Tabs>
  );
}
