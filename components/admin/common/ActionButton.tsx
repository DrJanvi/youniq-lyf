"use client";

import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/admin/ui/alert-dialog";
import { Button } from "@/components/admin/ui/button";
import { useAdminApi } from "./use-admin-api";

/** One-click API action (e.g. approve / hide) with optional confirmation dialog and toast feedback. */
export function ActionButton({
  url,
  method = "PATCH",
  json,
  label,
  success,
  confirm,
  variant = "outline",
  size = "sm",
  icon,
}: {
  url: string;
  method?: "PATCH" | "POST";
  json?: unknown;
  label: string;
  success: string;
  confirm?: string;
  variant?: "default" | "outline" | "destructive" | "secondary";
  size?: "sm" | "default";
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { request, pending } = useAdminApi();

  async function run() {
    const res = await request(url, { method, json, success });
    if (res !== undefined) setOpen(false);
  }

  return (
    <>
      <Button type="button" variant={variant} size={size} disabled={pending} onClick={() => (confirm ? setOpen(true) : run())}>
        {icon}
        {label}
      </Button>
      {confirm ? (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{label}?</AlertDialogTitle>
              <AlertDialogDescription>{confirm}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button variant={variant === "destructive" ? "destructive" : "default"} onClick={run} disabled={pending}>
                {pending ? "Working…" : label}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}
