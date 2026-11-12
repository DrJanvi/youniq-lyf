"use client";

import { useEffect } from "react";
import { useForm, type DefaultValues, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ZodType } from "zod";
import { useAdminApi } from "@/components/admin/common/use-admin-api";

/**
 * Create/edit form wiring: zod validation (inline errors), submit to the admin API,
 * toasts for success / API errors, and API field errors mapped back onto the fields.
 */
export function useEntityForm<T extends FieldValues>({
  schema,
  defaultValues,
  url,
  method,
  redirectTo,
  successMessage,
  toPayload = (v) => v,
}: {
  schema: ZodType<T, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  defaultValues: DefaultValues<T>;
  url: string;
  method: "POST" | "PATCH";
  redirectTo: string;
  successMessage: string;
  toPayload?: (values: T) => unknown;
}) {
  const form = useForm<T>({
    resolver: zodResolver(schema as never) as unknown as Resolver<T>,
    defaultValues,
    mode: "onTouched",
  });
  const { reset } = form;
  const { request, pending } = useAdminApi();

  useEffect(() => {
    if (method === "POST") reset();
  }, [method, reset]);

  const onSubmit = form.handleSubmit(
    async (values) => {
      await request(url, {
        method,
        json: toPayload(values),
        success: successMessage,
        redirectTo,
        form,
        onSuccess: method === "POST" ? () => reset() : undefined,
      });
    },
    () => toast.error("Please fix the highlighted fields."),
  );

  return { form, onSubmit, pending };
}
