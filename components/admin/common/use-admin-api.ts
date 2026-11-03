"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { apiFetch, ClientApiError } from "@/lib/client-api";

type Options = {
  method?: "POST" | "PATCH" | "DELETE" | "PUT" | "GET";
  json?: unknown;
  /** Toast shown on success. */
  success?: string;
  /** Refresh server components after success (default true). */
  refresh?: boolean;
  /** Where to navigate after success. */
  redirectTo?: string;
  /** Set server-side field errors on this form. */
  form?: UseFormReturn<any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/** Shared request helper: toasts success/errors, maps API field errors onto the RHF form. */
export function useAdminApi() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const request = useCallback(
    async <T = unknown>(url: string, opts: Options = {}): Promise<T | undefined> => {
      setPending(true);
      try {
        const data = await apiFetch<T>(url, { method: opts.method ?? "POST", json: opts.json });
        if (opts.success) toast.success(opts.success);
        if (opts.redirectTo) router.push(opts.redirectTo);
        if (opts.refresh !== false) router.refresh();
        return data;
      } catch (err) {
        if (err instanceof ClientApiError) {
          const entries = Object.entries(err.fieldErrors ?? {});
          if (opts.form && entries.length) {
            for (const [name, msgs] of entries) {
              opts.form.setError(name as Path<FieldValues>, { type: "server", message: msgs?.[0] });
            }
            toast.error("Please fix the highlighted fields.");
          } else {
            toast.error(err.message);
          }
        } else {
          toast.error("Network error. Check your connection and try again.");
        }
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [router],
  );

  return { request, pending };
}
