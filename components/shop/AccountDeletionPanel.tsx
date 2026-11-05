"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { apiFetch } from "@/lib/client-api";

export function AccountDeletionPanel() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<{ recoveryDeadline: string }>("/api/account", {
        method: "DELETE",
        json: { currentPassword },
      });
      router.replace(
        `/login?deletionScheduled=1&recoveryDeadline=${encodeURIComponent(result.recoveryDeadline)}`,
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to schedule account deletion.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="max-w-2xl text-sm leading-6 text-text-muted">
        Deleting your account will sign you out and block customer access. You
        can restore your account by signing in within 30 days. Your account and
        order records will remain available to administrators.
      </p>
      {!confirming ? (
        <Button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white h-10 w-auto rounded-full px-5 text-xs font-medium uppercase tracking-wide"
        >
          Delete My Account
          <ArrowRight className="ml-2 size-4" aria-hidden="true" />
        </Button>
      ) : (
        <section
          aria-labelledby="account-delete-title"
          aria-describedby="account-delete-description"
          className="w-full rounded-xl border border-status-error/20 bg-surface-main p-4 sm:p-5"
        >
          <h3
            id="account-delete-title"
            className="text-sm font-semibold text-text-primary"
          >
            Are you sure you want to delete your account?
          </h3>
          <p
            id="account-delete-description"
            className="mt-2 text-sm leading-6 text-text-muted"
          >
            You will be signed out immediately. Sign in with your password
            within 30 days to restore your account. After that, customer access
            cannot be recovered.
          </p>
          <form onSubmit={submit} className="mt-4 flex max-w-md flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-delete-password" className="text-xs font-medium">
                Current password
              </Label>
              <Input
                id="account-delete-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.currentTarget.value)}
                maxLength={72}
                required
                disabled={busy}
                aria-invalid={Boolean(error)}
                autoFocus
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm text-badge-sale-text">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                disabled={busy}
                className="h-10 w-auto rounded-full bg-status-error px-5 text-xs font-medium uppercase tracking-wide hover:bg-status-error-dark"
              >
                {busy ? "Scheduling..." : "Confirm Deletion"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setCurrentPassword("");
                  setError(null);
                }}
                disabled={busy}
                className="rounded-full px-4 py-2 text-xs font-medium uppercase text-text-muted transition-colors hover:bg-white hover:text-text-primary disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
