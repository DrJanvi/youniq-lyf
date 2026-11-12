"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Form } from "@/components/admin/ui/form";
import { useAdminApi } from "@/components/admin/common/use-admin-api";
import { adminLoginFormSchema } from "@/lib/validation/admin";
import { TextField } from "./Fields";

type Values = { username: string; password: string };

export function AdminLoginForm({ clearOnMount = false }: { clearOnMount?: boolean }) {
  const { request, pending } = useAdminApi();
  const form = useForm<Values>({ resolver: zodResolver(adminLoginFormSchema as never), defaultValues: { username: "", password: "" } });

  useEffect(() => {
    if (clearOnMount) form.reset({ username: "", password: "" });
  }, [clearOnMount, form]);

  const onSubmit = form.handleSubmit(
    async (v) => {
      await request("/api/admin/auth/login", { json: v, redirectTo: "/admin", form });
    },
    () => toast.error("Please enter your user id and password."),
  );

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate autoComplete="on" className="flex flex-col gap-4">
        <TextField control={form.control} name="username" label="User id" autoComplete="username" required />
        <TextField control={form.control} name="password" label="Password" type="password" autoComplete="current-password" required />
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null} Sign in
        </Button>
      </form>
    </Form>
  );
}
