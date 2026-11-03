"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
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

/** Confirm-then-DELETE action. Renders `children` as the trigger when given, else a danger button. */
export function DeleteButton({
  url,
  itemName,
  description,
  redirectTo,
  variant = "outline",
  size = "sm",
  asMenuItem = false,
  children,
}: {
  url: string;
  itemName: string;
  description?: string;
  redirectTo?: string;
  variant?: "outline" | "destructive" | "ghost";
  size?: "sm" | "default" | "icon-sm";
  asMenuItem?: boolean;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { request, pending } = useAdminApi();

  async function confirm() {
    const res = await request(url, { method: "DELETE", success: `${itemName} deleted`, redirectTo });
    if (res !== undefined) setOpen(false);
  }

  return (
    <>
      {asMenuItem ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" /> Delete
        </button>
      ) : (
        <Button type="button" variant={variant} size={size} onClick={() => setOpen(true)} className="text-destructive">
          {children ?? (
            <>
              <Trash2 /> Delete
            </>
          )}
        </Button>
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemName}?</AlertDialogTitle>
            <AlertDialogDescription>{description ?? "This action cannot be undone."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={confirm} disabled={pending}>
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
