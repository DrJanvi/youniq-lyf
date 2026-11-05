"use client";

import { Undo2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { useAdminApi } from "./use-admin-api";

export function RestoreButton({
  url,
  itemName,
  disabled = false,
  disabledReason,
}: {
  url: string;
  itemName: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const { request, pending } = useAdminApi();

  async function restore() {
    await request(url, {
      method: "POST",
      success: `${itemName} restored`,
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={restore}
      disabled={pending || disabled}
      title={disabled ? disabledReason : undefined}
    >
      <Undo2 />
      {pending ? "Restoring…" : "Restore"}
    </Button>
  );
}
